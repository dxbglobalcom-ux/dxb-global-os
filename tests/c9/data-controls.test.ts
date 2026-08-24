import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  DECISION_MACHINE_AGING_DAYS,
  decisionAgingCutoffISO,
  decisionAgingOrFilter,
} from "../../apps/dashboard/src/lib/decisions.js";

// Ledger 9c/9d (2026-07-24): the cost reset door and the project-aware views.
// The reset test runs INSIDE a rolled-back transaction — control_cost_reset
// deletes by cutoff (not by id), so a live-DB run outside a transaction would
// eat real history. Rollback keeps the CEO's ledger untouched.

const SEED = "c9-data-controls-test";
const ROLLBACK = new Error("rollback-sentinel");

afterAll(async () => {
  await closeDb();
});

describe("9c — control_cost_reset door", () => {
  it("deletes strictly before the Berlin cutoff day, keeps the rest, writes one audit row", async () => {
    await getDb()
      .transaction()
      .execute(async (trx) => {
        const seed = async (at: string) => sql`
          insert into cost_ledger (department, model, mode, cost_eur, source, meta, created_at)
          values ('engineering', 'claude-fable-5', 'api', 0.01, 'manual',
                  ${JSON.stringify({ seed: SEED })}::jsonb, ${at}::timestamptz)
        `.execute(trx);
        // Two rows on Berlin day 2026-07-01, one on 2026-07-10.
        await seed("2026-07-01T08:00:00+02:00");
        await seed("2026-07-01T21:00:00+02:00");
        await seed("2026-07-10T08:00:00+02:00");

        const res = await sql<{ out: { ok: boolean; purged: number } }>`
          select control_cost_reset('2026-07-05'::date, ${SEED}) as out
        `.execute(trx);
        expect(res.rows[0].out.ok).toBe(true);
        // At least our 2 seeded pre-cutoff rows died; the post-cutoff seed lives.
        expect(res.rows[0].out.purged).toBeGreaterThanOrEqual(2);

        const left = await sql<{ n: string }>`
          select count(*) as n from cost_ledger where meta->>'seed' = ${SEED}
        `.execute(trx);
        expect(Number(left.rows[0].n)).toBe(1);

        const audit = await sql<{ payload: { purged: number; before: string } }>`
          select payload from audit_log
          where action = 'costs.reset' and payload->>'rationale' = ${SEED}
        `.execute(trx);
        expect(audit.rows.length).toBe(1);
        expect(audit.rows[0].payload.before).toBe("2026-07-05");
        throw ROLLBACK;
      })
      .catch((e) => {
        if (e !== ROLLBACK) throw e;
      });
  });

  it("rejects a future cutoff day", async () => {
    await expect(
      sql`select control_cost_reset((current_date + 2)::date, ${SEED})`.execute(getDb()),
    ).rejects.toThrow(/VALIDATION_FAILED/);
  });

  it("rejects a null cutoff", async () => {
    await expect(
      sql`select control_cost_reset(null::date, ${SEED})`.execute(getDb()),
    ).rejects.toThrow(/VALIDATION_FAILED/);
  });
});

describe("9d — project-aware views", () => {
  const columnsOf = async (view: string): Promise<string[]> => {
    const res = await sql<{ column_name: string }>`
      select column_name from information_schema.columns
      where table_schema = 'public' and table_name = ${view}
    `.execute(getDb());
    return res.rows.map((r) => r.column_name);
  };

  it("v_cost_entries exposes ledger columns plus project identity", async () => {
    const cols = await columnsOf("v_cost_entries");
    for (const c of [
      "id",
      "model",
      "mode",
      "department",
      "prompt_tokens",
      "completion_tokens",
      "cost_eur",
      "created_at",
      "project_slug",
      "project",
    ])
      expect(cols).toContain(c);
  });

  it("v_workforce_tokens carries project identity", async () => {
    const cols = await columnsOf("v_workforce_tokens");
    expect(cols).toContain("project_slug");
    expect(cols).toContain("project");
  });

  it("v_cost_breakdown carries project identity", async () => {
    const cols = await columnsOf("v_cost_breakdown");
    expect(cols).toContain("project_slug");
    expect(cols).toContain("project");
  });

  it("v_cost_entries joins the ledger row to its task's project", async () => {
    await getDb()
      .transaction()
      .execute(async (trx) => {
        const proj = await sql<{ id: string; slug: string }>`
          select id, slug from projects order by created_at limit 1
        `.execute(trx);
        expect(proj.rows.length).toBe(1);
        const task = await sql<{ id: string }>`
          insert into tasks (objective, output_contract, department, model_tier, status, project_id)
          values (${SEED}, ${SEED}, 'engineering', 'L1', 'inbox', ${proj.rows[0].id})
          returning id
        `.execute(trx);
        await sql`
          insert into cost_ledger (task_id, department, model, mode, cost_eur, source, meta)
          values (${task.rows[0].id}, 'engineering', 'claude-fable-5', 'api', 0.01, 'manual',
                  ${JSON.stringify({ seed: SEED })}::jsonb)
        `.execute(trx);
        const row = await sql<{ project_slug: string }>`
          select project_slug from v_cost_entries where meta->>'seed' = ${SEED}
        `.execute(trx);
        expect(row.rows[0].project_slug).toBe(proj.rows[0].slug);
        throw ROLLBACK;
      })
      .catch((e) => {
        if (e !== ROLLBACK) throw e;
      });
  });
});

describe("9c — decision aging (machine records leave the CEO view)", () => {
  it("cutoff sits exactly AGING days back", () => {
    const now = new Date("2026-07-24T12:00:00Z");
    const cutoff = decisionAgingCutoffISO(now);
    expect(DECISION_MACHINE_AGING_DAYS).toBeGreaterThan(0);
    expect(cutoff).toBe(
      new Date(now.getTime() - DECISION_MACHINE_AGING_DAYS * 86_400_000).toISOString(),
    );
  });

  it("or-filter keeps CEO rows forever and machine rows only past the cutoff", () => {
    const now = new Date("2026-07-24T12:00:00Z");
    const filter = decisionAgingOrFilter(now);
    expect(filter).toBe(`decided_by.eq.ceo,created_at.gte.${decisionAgingCutoffISO(now)}`);
  });
});
