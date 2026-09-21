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
    // R2.4: a control_approvals_action decision writes a decision_log row
    // FK-ing the approval — unlink before the approvals go.
    await db
      .deleteFrom("decision_log")
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

// ── THE LEDGERS, 2026-09-21 ──────────────────────────────────────────────────
// `sweepByDepartment` follows the FK chain out of a suite's own tasks, and
// that chain does not reach the two append-only ledgers: `audit_log` and
// `decision_log` hang off nothing. So a suite could clear every fixture it
// made and still leave its footprints there — measured this day by running
// each of the 129 sandboxed files alone against the construction engine:
// 31 of them left rows behind, +98 audit and +82 decision rows per battery,
// on top of 58,000 and 15,000 already accumulated.
//
// THE RULE THIS OBEYS. A watermark alone is not ownership: `id > max(id)`
// deletes whatever ANY writer put there while the suite ran (that exact line
// in tests/e10 was caught deleting another writer's rows). So a sweep here
// needs BOTH — the suite's own watermark AND a signature the suite itself
// produced: the actor and action it writes, the `decided_by` it dispatches
// under, the idempotency prefix it keys on. Rows that match neither are
// somebody else's and stay.
export interface LedgerSignatures {
  /** audit_log rows this suite causes: actor, and the action when the actor is shared. */
  audit?: Array<{ actor: string; action?: string }>;
  /** decision_log rows this suite causes. */
  decisions?: Array<{ decidedBy: string; decision?: string }>;
  /** decision_log rows whose `decided_by` is a generated fixture id — SQL LIKE. */
  decidedByLike?: string[];
  /** control_idempotency keys this suite mints, by their leading segment. */
  idempotencyPrefix?: string[];
  /** hook_violations this suite provokes, by the policy it breaks. A probe
   *  with no run of its own is the shape that accumulates: 354 run-less
   *  `std.knowledge_shelf` rows had been sitting on the bench since 08-23. */
  hookViolations?: Array<{ policyId: string; runlessOnly?: boolean }>;
}

export interface LedgerScope {
  /** Call inside the suite's own afterAll, BEFORE closeDb(). */
  sweep(own: LedgerSignatures): Promise<void>;
}

/**
 * Take the ledger watermarks before the suite runs, and hand back the sweep
 * it must call in its own teardown. It is deliberately NOT an afterAll of its
 * own: most suites close the pool in theirs, and a hook that fires after that
 * would be sweeping through a closed connection.
 */
export function watchLedgers(db: () => Kysely<DB>): LedgerScope {
  let auditFrom = 0;
  let decisionFrom = 0;
  let mintedFrom = new Date(0);

  beforeAll(async () => {
    const a = await sql<{ mx: string | null }>`SELECT max(id)::text AS mx FROM audit_log`.execute(db());
    auditFrom = Number(a.rows[0]?.mx ?? 0);
    const d = await sql<{ mx: string | null }>`SELECT max(id)::text AS mx FROM decision_log`.execute(db());
    decisionFrom = Number(d.rows[0]?.mx ?? 0);
    mintedFrom = new Date();
  });

  return {
    async sweep(own: LedgerSignatures): Promise<void> {
      for (const s of own.audit ?? []) {
        if (s.action) {
          await sql`DELETE FROM audit_log
                     WHERE id > ${auditFrom} AND actor = ${s.actor} AND action = ${s.action}`.execute(db());
        } else {
          await sql`DELETE FROM audit_log
                     WHERE id > ${auditFrom} AND actor = ${s.actor}`.execute(db());
        }
      }
      for (const s of own.decisions ?? []) {
        if (s.decision) {
          await sql`DELETE FROM decision_log
                     WHERE id > ${decisionFrom} AND decided_by = ${s.decidedBy}
                       AND decision = ${s.decision}`.execute(db());
        } else {
          await sql`DELETE FROM decision_log
                     WHERE id > ${decisionFrom} AND decided_by = ${s.decidedBy}`.execute(db());
        }
      }
      for (const like of own.decidedByLike ?? []) {
        await sql`DELETE FROM decision_log
                   WHERE id > ${decisionFrom} AND decided_by LIKE ${like}`.execute(db());
      }
      for (const v of own.hookViolations ?? []) {
        if (v.runlessOnly) {
          await sql`DELETE FROM hook_violations
                     WHERE created_at >= ${mintedFrom} AND policy_id = ${v.policyId}
                       AND run_id IS NULL`.execute(db());
        } else {
          await sql`DELETE FROM hook_violations
                     WHERE created_at >= ${mintedFrom} AND policy_id = ${v.policyId}`.execute(db());
        }
      }
      for (const prefix of own.idempotencyPrefix ?? []) {
        await sql`DELETE FROM control_idempotency
                   WHERE created_at >= ${mintedFrom} AND key LIKE ${prefix + "%"}`.execute(db());
      }
    },
  };
}
