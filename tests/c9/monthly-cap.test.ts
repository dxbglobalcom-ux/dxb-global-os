import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  checkMonthlyCap,
  STOP_RATIO,
  WARN_RATIO,
} from "../../packages/outbox-executor/src/monthly-cap.js";

// W1.6 — the monthly cap brake.
//
// Measured, and corrected twice while building: ALERTING was already COMPLETE —
// one trigger on cost_ledger raises the 70/90/100 rows, and trg_alert_budget_stop
// on budget_state raises `budget-hard-stop` the moment the flag flips. What was
// missing was the WRITER: hard_stopped had exactly one, the hand-run CLI
// kill-switch. The system told the CEO that work stops and then did not stop it.
// This module is only that missing writer, so these cases assert the STOP and
// the fact that the EXISTING trigger is what speaks.
//
// Every case runs inside a rolled-back transaction. This one matters more than
// usual: the resident scheduler shares this database, and a leaked
// hard_stopped=true would stop the real company.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

// The whole check runs on the transaction handle, not on getDb(). An earlier
// version of this file called getDb() inside the probe helpers, so every write
// went to the LIVE database on a different connection: it tripped the real
// brake and left EUR 105 of fake spend behind (audit row
// `budget.hard_stop.reverted`, 2026-07-26). That is why checkMonthlyCap takes
// an injectable db at all.
const ROLLBACK = new Error("rollback-sentinel");
type Trx = Parameters<typeof checkMonthlyCap>[0];
const inTrx = async (fn: (trx: NonNullable<Trx>) => Promise<void>) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      await fn(trx as NonNullable<Trx>);
      throw ROLLBACK;
    })
    .catch((e) => {
      if (e !== ROLLBACK) throw e;
    });

afterAll(async () => {
  // Belt and braces: the probes below move budget_state inside a transaction
  // that always rolls back, but a hard_stopped row escaping this file would
  // halt the live company, so assert the live state is clean on the way out.
  const s = await sql<{ hard_stopped: boolean }>`
    SELECT hard_stopped FROM budget_state
  `.execute(getDb());
  if (s.rows[0]?.hard_stopped) {
    throw new Error("monthly-cap test leaked hard_stopped=true into the live database");
  }
  await closeDb();
});

/** Spend enough this month to land at `ratio` of the cap — inside the trx. */
async function spendToRatio(trx: NonNullable<Trx>, ratio: number) {
  const cap = await sql<{ cap: string }>`
    SELECT monthly_cap_eur::text AS cap FROM budget_state
  `.execute(trx as never);
  const target = Number(cap.rows[0].cap) * ratio;
  const already = await sql<{ total: string }>`
    SELECT COALESCE(SUM(cost_eur), 0)::text AS total FROM cost_ledger
     WHERE created_at >= date_trunc('month', now())
  `.execute(trx as never);
  const delta = target - Number(already.rows[0].total);
  if (delta <= 0) return;
  await sql`
    INSERT INTO cost_ledger (department, model, mode, prompt_tokens, completion_tokens,
                             cost_eur, source, meta)
    VALUES ('kernel-L1', 'fable-5', 'subscription', 0, 0, ${delta}, 'manual',
            '{"probe":"monthly-cap-test"}'::jsonb)
  `.execute(trx as never);
}

describe("W1.6 — the monthly cap actually brakes", () => {
  it("the thresholds are the ones COST_CONTROL_SPEC states", () => {
    expect(WARN_RATIO).toBe(0.7);
    expect(STOP_RATIO).toBe(1.0);
  });

  it("well under the cap: no warning, no stop", async () => {
    await inTrx(async (trx) => {
      const res = await checkMonthlyCap(trx);
      expect(res.ratio).toBeLessThan(WARN_RATIO);
      expect(res.warned).toBe(false);
      expect(res.newly_stopped).toBe(false);
      const s = await sql<{ hard_stopped: boolean }>`
        SELECT hard_stopped FROM budget_state
      `.execute(trx as never);
      expect(s.rows[0].hard_stopped).toBe(false);
    });
  });

  it("at 70% work keeps running, and the existing trigger is the only voice", async () => {
    await inTrx(async (trx) => {
      await spendToRatio(trx, 0.75);
      const res = await checkMonthlyCap(trx);
      expect(res.ratio).toBeGreaterThanOrEqual(WARN_RATIO);
      expect(res.warned).toBe(true); // a report of where we are, not an action
      expect(res.newly_stopped).toBe(false);

      const s = await sql<{ hard_stopped: boolean }>`
        SELECT hard_stopped FROM budget_state
      `.execute(trx as never);
      expect(s.rows[0].hard_stopped).toBe(false);

      // The 70% row comes from the cost_ledger trigger. This module adds no
      // voice of its own, here or anywhere.
      const mine = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM alerts
         WHERE source = 'system:monthly-cap'
      `.execute(trx as never);
      expect(Number(mine.rows[0].n)).toBe(0);
    });
  });

  it("at 100% non-critical work is STOPPED — with no human in the loop", async () => {
    await inTrx(async (trx) => {
      await spendToRatio(trx, 1.05);
      const res = await checkMonthlyCap(trx);
      expect(res.newly_stopped).toBe(true);

      const s = await sql<{ hard_stopped: boolean }>`
        SELECT hard_stopped FROM budget_state
      `.execute(trx as never);
      expect(s.rows[0].hard_stopped).toBe(true);

      // The claim the CEO reads is now backed by a real state change, and the
      // EXISTING trg_alert_budget_stop is what tells him — flipping the flag is
      // the whole job.
      const a = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM alerts
         WHERE dedup_key = 'budget-hard-stop' AND resolved_at IS NULL
      `.execute(trx as never);
      expect(Number(a.rows[0].n)).toBe(1);

      const audit = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM audit_log WHERE action = 'budget.hard_stop'
      `.execute(trx as never);
      expect(Number(audit.rows[0].n)).toBeGreaterThan(0);
    });
  });

  it("a stop is never re-applied on the next tick", async () => {
    await inTrx(async (trx) => {
      await spendToRatio(trx, 1.05);
      await checkMonthlyCap(trx);
      const again = await checkMonthlyCap(trx);
      expect(again.already_stopped).toBe(true);
      expect(again.newly_stopped).toBe(false);
    });
  });

  it("the gate that reads the flag refuses non-critical selections once stopped", async () => {
    await inTrx(async (trx) => {
      await spendToRatio(trx, 1.05);
      await checkMonthlyCap(trx);
      // fn_select_model is the shared routing gate; COST_CONTROL exempts the
      // critical class so approvals/outbox/health/backup keep moving.
      const blocked = await sql<{ out: { ok: boolean; error: string } }>`
        SELECT fn_select_model('coding', NULL, 'low', NULL, NULL, NULL, false, false) AS out
      `.execute(trx as never);
      expect(blocked.rows[0].out.ok).toBe(false);
      expect(blocked.rows[0].out.error).toBe("BUDGET_HARD_STOP");

      const critical = await sql<{ out: { ok: boolean } }>`
        SELECT fn_select_model('coding', NULL, 'low', NULL, NULL, NULL, true, false) AS out
      `.execute(trx as never);
      expect(critical.rows[0].out.ok).toBe(true);
    });
  });
});
