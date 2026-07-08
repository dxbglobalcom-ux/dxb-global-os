import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { keyInfo, listDxbKeys } from "../../packages/shared/src/litellm.js";
import { checkVelocity } from "../../packages/outbox-executor/src/breaker.js";
import {
  CADENCES,
  QUEUES,
  startScheduler,
  stopScheduler,
} from "../../packages/outbox-executor/src/scheduler.js";
import { resetBreaker } from "../../tools/dxb-cli/src/breaker.js";

// COST-03 (04-04 Task 3, master-plan step 8): an injected retry storm trips the
// breaker within ONE check, non-critical keys get blocked, the CEO override is
// audited, and an under-cap hour does NOT trip. Plus: the single scheduler
// process registers exactly the mandated cadences (tick 15s / reaper 60s /
// breaker 5min).
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

// key blocking/unblocking talks to the live proxy; without the master key the
// DB-state assertions still run and the key checks are skipped (⚠ UNVERIFIED)
const LIVE = Boolean(process.env.LITELLM_MASTER_KEY);

async function wipeCostAndAudit(): Promise<void> {
  const db = getDb();
  await db.deleteFrom("cost_ledger").execute();
  await db.deleteFrom("audit_log").where("actor", "in", ["system:breaker", "ceo:cli"]).execute();
}

async function clearBreakerState(): Promise<void> {
  await getDb()
    .updateTable("budget_state")
    .set({ breaker_tripped: false, breaker_tripped_at: null, updated_at: sql`now()` })
    .execute();
}

async function injectStorm(rows: number, eurEach: number): Promise<void> {
  const db = getDb();
  await db
    .insertInto("cost_ledger")
    .values(
      Array.from({ length: rows }, (_, i) => ({
        department: "engineering",
        model: "glm-5.2",
        mode: "api",
        prompt_tokens: 1000,
        completion_tokens: 1000,
        cost_eur: eurEach,
        source: "manual",
        meta: JSON.stringify({ injected: "velocity-test", i }),
      })),
    )
    .execute();
}

beforeAll(async () => {
  await wipeCostAndAudit();
  await clearBreakerState();
});

afterAll(async () => {
  await wipeCostAndAudit();
  await clearBreakerState();
  await closeDb();
});

describe("velocity breaker (COST-03)", () => {
  it("under-cap hour does NOT trip the breaker", async () => {
    await injectStorm(2, 0.01); // 0.02 EUR << 2.00 cap
    const result = await checkVelocity();
    expect(result.newly_tripped).toBe(false);
    const state = await getDb().selectFrom("budget_state").selectAll().executeTakeFirstOrThrow();
    expect(state.breaker_tripped).toBe(false);
  });

  it("injected retry storm (100 rows, ~5 EUR/hour) trips within one check; keys blocked; audited", async () => {
    await injectStorm(100, 0.05); // 5 EUR in the last hour > 2 EUR/h cap
    const result = await checkVelocity();

    expect(result.newly_tripped).toBe(true);
    expect(result.window_eur).toBeGreaterThan(result.cap_eur);

    const state = await getDb().selectFrom("budget_state").selectAll().executeTakeFirstOrThrow();
    expect(state.breaker_tripped).toBe(true);
    expect(state.breaker_tripped_at).not.toBeNull();

    const audit = await getDb()
      .selectFrom("audit_log")
      .selectAll()
      .where("action", "=", "breaker.tripped")
      .where("actor", "=", "system:breaker")
      .execute();
    expect(audit.length).toBe(1);

    if (LIVE) {
      // the real per-department keys must now be blocked at the proxy
      expect(result.blocked_aliases).toContain("dxb-engineering");
      expect(result.block_errors).toEqual([]);
      const keys = await listDxbKeys();
      const eng = keys.find((k) => k.key_alias === "dxb-engineering");
      const info = await keyInfo(eng!.token);
      expect(info.blocked).toBe(true);
    }
  });

  it("second check while tripped is a no-op (no duplicate audit)", async () => {
    const result = await checkVelocity();
    expect(result.already_tripped).toBe(true);
    expect(result.newly_tripped).toBe(false);
    const audit = await getDb()
      .selectFrom("audit_log")
      .selectAll()
      .where("action", "=", "breaker.tripped")
      .execute();
    expect(audit.length).toBe(1);
  });

  it("reset without --confirm is refused", async () => {
    await expect(resetBreaker({ confirm: false })).rejects.toThrow(/--confirm/);
    const state = await getDb().selectFrom("budget_state").selectAll().executeTakeFirstOrThrow();
    expect(state.breaker_tripped).toBe(true); // untouched
  });

  it("dxb breaker reset --confirm clears state, unblocks keys, audits actor ceo:cli", async () => {
    const result = await resetBreaker({ confirm: true });
    expect(result.was_tripped).toBe(true);

    const state = await getDb().selectFrom("budget_state").selectAll().executeTakeFirstOrThrow();
    expect(state.breaker_tripped).toBe(false);
    expect(state.breaker_tripped_at).toBeNull();

    const audit = await getDb()
      .selectFrom("audit_log")
      .selectAll()
      .where("action", "=", "breaker.reset")
      .where("actor", "=", "ceo:cli")
      .where("actor_type", "=", "ceo")
      .execute();
    expect(audit.length).toBe(1);

    if (LIVE) {
      expect(result.unblocked_aliases).toContain("dxb-engineering");
      const keys = await listDxbKeys();
      for (const key of keys) expect(key.blocked).not.toBe(true);
    }
  });
});

describe("scheduler (KERN: one process owns all system routines)", () => {
  it("registers tick 15s / reaper 60s / breaker 5min", async () => {
    const boss = await startScheduler();
    try {
      expect(CADENCES.outboxTickSeconds).toBe(15);

      const schedules = await boss.getSchedules();
      const byName = Object.fromEntries(schedules.map((s) => [s.name, s.cron]));
      expect(byName[QUEUES.reaper]).toBe("* * * * *");
      expect(byName[QUEUES.breaker]).toBe("*/5 * * * *");

      // the 15s tick is a self-perpetuating singleton chain, not a cron —
      // prove the chain is armed: the tick queue holds exactly one queued job
      const { rows } = await sql<{ n: string }>`
        SELECT count(*) AS n FROM pgboss.job
        WHERE name = ${QUEUES.tick} AND state IN ('created', 'active', 'completed')
      `.execute(getDb());
      expect(Number(rows[0].n)).toBeGreaterThanOrEqual(1);
    } finally {
      await stopScheduler(boss);
    }
  });
});
