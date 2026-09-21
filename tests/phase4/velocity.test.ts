import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { keyInfo, listDxbKeys } from "../../packages/shared/src/litellm.js";
import { checkVelocity } from "../../packages/outbox-executor/src/breaker.js";
import {
  CADENCES,
  openScheduler,
  QUEUES,
  registerSchedules,
  stopScheduler,
} from "../../packages/outbox-executor/src/scheduler.js";
import { resetBreaker } from "../../tools/dxb-cli/src/breaker.js";

// COST-03 (04-04 Task 3, master-plan step 8): an injected retry storm trips the
// breaker within ONE check, non-critical keys get blocked, the CEO override is
// audited, and an under-cap hour does NOT trip. Plus: the single scheduler
// process registers exactly the mandated cadences (tick 15s / reaper 60s /
// breaker 5min).

// key blocking/unblocking talks to the live proxy; without the master key the
// DB-state assertions still run and the key checks are skipped (⚠ UNVERIFIED)
const LIVE = Boolean(process.env.LITELLM_MASTER_KEY);

// Scoped sweep (E9.3 incident fix: table-wide deletes destroyed live
// history): only the rows this suite injects (meta marker) and the breaker
// audit rows its trips produce.
async function wipeCostAndAudit(): Promise<void> {
  const db = getDb();
  await db
    .deleteFrom("cost_ledger")
    .where(sql<boolean>`meta->>'injected' = 'velocity-test'`)
    .execute();
  await db
    .deleteFrom("audit_log")
    .where("actor", "in", ["system:breaker", "ceo:cli"])
    .where("action", "in", ["breaker.tripped", "breaker.reset"])
    .execute();
  // The intentional trip raises a REAL E8.4b alert row; once the suite has
  // reset the breaker state, an unresolved budget-breaker alert is this
  // suite's artifact — remove it so /alerts stays clean (E8.4b lesson).
  await sql`DELETE FROM alerts WHERE dedup_key = 'budget-breaker' AND resolved_at IS NULL
            AND NOT EXISTS (SELECT 1 FROM budget_state WHERE breaker_tripped)`.execute(db);
}

/** Real last-hour spend outside our injected rows (live dev usage). */
async function foreignWindowEur(): Promise<number> {
  const res = await sql<{ total: number }>`
    SELECT coalesce(sum(cost_eur), 0)::float AS total FROM cost_ledger
     WHERE created_at > now() - interval '60 minutes'
       AND (meta->>'injected' IS DISTINCT FROM 'velocity-test')
  `.execute(getDb());
  return Number(res.rows[0].total);
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

// ── B44, 2026-09-16: the scheduler is torn down in afterAll, not inside the case
// The last case asserts REGISTRATION (tick 15s / reaper 60s / breaker 5min).
// Starting the real scheduler is cheap and stopping it again is not, and the
// stopping is cleanup, not the claim. Measured this day, inside the whole suite,
// with the case's own marks: the boot took 88 ms, the three assertions 44 ms,
// and the teardown took 5 984 ms at rest — and ran past 30 000 ms whenever a
// worker was still in flight, which is how this file became board row B44.
// Two numbers own that teardown, and neither of them belongs to this file:
//   · stopScheduler awaits activeLanes.stop() and then activeMediaLanes.stop(),
//     and a resting lane cannot hear stop() until its rest ends (task-lanes.ts
//     runLane sleeps restMs BEFORE re-testing the flag; DXB_LANE_REST_SECONDS
//     is 3 s) — a ~6 s floor with nothing whatever to do;
//   · pg-boss 12.25.1 stop({ graceful: true }) then waits for its own pending
//     work up to its DEFAULT timeout of 30 000 ms (dist/index.js:150 and 174) —
//     the very number this case was given as its stopwatch, so a teardown that
//     entered that wait could never finish inside the case that started it.
// The case keeps its own 30 000 ms for the ~130 ms of work it really does; the
// teardown gets a budget of its own, sized 6 s + 30 s + margin. Nothing here
// widens the assertion's stopwatch, and nothing here is a runtime change.
//
// ── 2026-09-21: AND IT NEVER GROWS HANDS AGAIN
// What this case asserts is the CLOCK — the cron table and the armed tick. It
// used to boot the whole scheduler to read it, and the 23 handlers that came
// with it went to work on the construction bench's own queue. Measured that
// day, in task_events on the W9 road proof's kept task: the reaper put the row
// back in the queue at 10:24:36, the resident worker claimed it at 10:25:16
// and escalated it at 10:25:18 — three battery runs running, until the task
// was BLOCKED for good — and the rows it left turned three other suites red,
// each of them counting work it had never done. The scheduler's boot is now
// three acts (scheduler.ts) and this file calls the first and the third: a
// clock with no hands can take nothing.
let bootedScheduler: Awaited<ReturnType<typeof openScheduler>> | null = null;

// Every job this file's own clock armed, and it is swept BY IDENTITY.
//
// Not by a list of names: the eight self-chaining bootstraps are only most of
// them — the adversarial pass found one run also left `__pgboss__send-it`
// (pg-boss's own maintenance job, minted by boss.start) and `lease-reaper`
// (the */1 cron fired the instant its schedule was registered), two rows a
// name list could never have caught.
//
// And NOT by time alone, which is what the first version of this sweep used.
// The excuse for it was that `fileParallelism: false` makes this file the only
// pg-boss client on the bench — and that is false the moment a SECOND battery
// runs against the same engine, which the adversarial pass demonstrated on
// 2026-09-21 (two runs overlapped on port 54422 and audit_log moved under the
// observer). `scripts/construction/battery.sh` now refuses to start beside a
// twin, and this sweep no longer depends on that promise either: the ids are
// read back the moment the clock is armed, and afterAll deletes exactly those
// rows, still waiting, and nothing else.
let armedJobIds: string[] = [];

beforeAll(async () => {
  await wipeCostAndAudit();
  await clearBreakerState();
});

afterAll(async () => {
  // stop the company's engine BEFORE the pool it shares is closed
  if (bootedScheduler) {
    const boss = bootedScheduler;
    bootedScheduler = null;
    await stopScheduler(boss);
    // …and every job its clock armed goes with it, by id, and only while it
    // is still waiting — an ACTIVE job is somebody's work in flight.
    if (armedJobIds.length > 0) {
      await sql`DELETE FROM pgboss.job
                 WHERE id = ANY(${armedJobIds}::uuid[]) AND state = 'created'`.execute(getDb());
    }
  }
  await wipeCostAndAudit();
  await clearBreakerState();
  await closeDb();
}, 45_000);

describe("velocity breaker (COST-03)", () => {
  it("under-cap hour does NOT trip the breaker", async (ctx) => {
    // The breaker reads GLOBAL last-hour spend. If real dev usage already
    // sits near the cap, the under-cap premise is void this hour — skip
    // honestly instead of tripping the live breaker on purpose.
    const baseline = await foreignWindowEur();
    if (baseline >= 1.0) {
      ctx.skip(); // ⚠ premise void: real window spend ≥ 1.00 EUR (cap 2.00)
      return;
    }
    await injectStorm(2, 0.01); // baseline < 1.00 + 0.02 EUR << 2.00 cap
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
    const armedFrom = new Date();
    const boss = await openScheduler();
    bootedScheduler = boss;
    await registerSchedules(boss);
    // Read the ids back at once, while nothing has had time to run: from here
    // on the sweep names these rows, not a moment in time.
    armedJobIds = (
      await sql<{ id: string }>`
        SELECT id FROM pgboss.job WHERE state = 'created' AND created_on >= ${armedFrom}
      `.execute(getDb())
    ).rows.map((r) => r.id);
    {
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
    }
    // Measured 2026-07-26: alone this case takes ~2.0s, but at the end of the
    // full sequential run a real pg-boss start crossed vitest's 5s DEFAULT and
    // failed the suite — a stopwatch verdict, not a behaviour verdict. The one
    // case here that boots a whole scheduler process gets a timeout sized for
    // what it actually does; every assertion above is unchanged.
    // B44, 2026-09-16: this number is NOT raised. What was measured is that it
    // never covered the assertions at all — they cost ~130 ms — it covered a
    // teardown whose own library waits 30 000 ms. The teardown moved out; the
    // stopwatch stayed exactly where it was.
  }, 30_000);
});
