import { afterAll, beforeAll } from "vitest";
import { sql, type Kysely } from "kysely";
import type { DB } from "../../packages/shared/src/db-types.js";

// Suite isolation helpers (E9.3 incident fix, 2026-07-13). The phase-3/4
// suites predate live data: their wipe() deleted WHOLE tables (audit_log,
// approvals, outbox, cost_ledger, task_events, tasks) and destroyed real
// construction-era history when run against today's DB. Rule going forward:
// a suite may only delete rows it can prove it created. Fixtures carry a
// suite-unique department marker; this sweep follows the FK chain for
// exactly those tasks and nothing else.

/**
 * E10.2: pin the Fable hook OFF for a pre-hook suite's lifetime. The certified
 * Phase-5/6 (and E8) slices predate the hook — their fixtures carry no
 * employee/persona/project surface, so the (production-on) gates would reject
 * every claim. `hook.enabled` is exactly the §22 gradual-transition flag for
 * that old path; production stays ON (the E10.2 migration flip), and any
 * flag-off spawn raises the 'hook:disabled' attention alert, so this pin is
 * loud in the DB, never silent. Restored to true in afterAll (files run
 * sequentially — vitest fileParallelism=false). The helper also sweeps the
 * pin-period 'hook:disabled' alert so the suite leaves no residue.
 */
export function pinHookOff(db: () => Kysely<DB>): void {
  beforeAll(async () => {
    await sql`UPDATE settings_values SET value = 'false'::jsonb
       WHERE key = 'hook.enabled' AND scope = 'global'`.execute(db());
  });
  afterAll(async () => {
    await sql`UPDATE settings_values SET value = 'true'::jsonb
       WHERE key = 'hook.enabled' AND scope = 'global'`.execute(db());
    await sql`DELETE FROM alerts
       WHERE dedup_key = 'hook:disabled' AND resolved_at IS NULL`.execute(db());
  });
}

/** Delete every row chained to tasks whose department starts with `marker`. */
export async function sweepByDepartment(db: Kysely<DB>, marker: string): Promise<void> {
  const like = `${marker}%`;
  const ids = (
    await db.selectFrom("tasks").select("id").where("department", "like", like).execute()
  ).map((r) => r.id);
  if (ids.length > 0) {
    await db
      .deleteFrom("outbox")
      .where("approval_id", "in", (qb) =>
        qb.selectFrom("approvals").select("id").where("task_id", "in", ids),
      )
      .execute();
    await db.deleteFrom("approvals").where("task_id", "in", ids).execute();
    await sql`DELETE FROM task_dependencies
      WHERE task_id = ANY(${ids}::uuid[]) OR depends_on = ANY(${ids}::uuid[])`.execute(db);
    await sql`DELETE FROM agent_runs WHERE task_id = ANY(${ids}::uuid[])`.execute(db);
    await db.deleteFrom("audit_log").where("task_id", "in", ids).execute();
    await db.deleteFrom("cost_ledger").where("task_id", "in", ids).execute();
    await db.deleteFrom("task_events").where("task_id", "in", ids).execute();
    await db.updateTable("tasks").set({ parent_task_id: null }).where("id", "in", ids).execute();
    await db.deleteFrom("tasks").where("id", "in", ids).execute();
  }
}

/**
 * Guard for suites that call the outbox executor's tick(): tick() executes
 * EVERY ready row in the table, so foreign ready rows (live gated actions
 * awaiting a CEO decision→release) must stop the suite before it fires them.
 * Failing loudly here is the safe side — never execute rows the suite
 * does not own.
 */
export async function assertNoForeignReadyOutbox(db: Kysely<DB>): Promise<void> {
  const res = await sql<{ n: number }>`
    SELECT count(*)::int AS n FROM outbox WHERE status IN ('ready', 'executing')
  `.execute(db);
  const n = res.rows[0].n;
  if (n > 0) {
    throw new Error(
      `outbox holds ${n} foreign ready/executing row(s) — refusing to run tick() ` +
        `over live data. Decide or drain them first.`,
    );
  }
}
