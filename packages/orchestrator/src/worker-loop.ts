// Resident worker loop — R2.1 (external audit F-01): the production consumer
// of the business `tasks` queue. One drain pass moves every lifecycle stage
// the OS owns end-to-end WITHOUT a human or test helper in the chain:
//
//   queued  → runWorkerOnce (claim → hook gates → execute → review/failed)
//   review  → qa()          (review → done | awaiting_approval | failed)
//             low-confidence review (<0.6) routes to escalate() instead —
//             convertLowConfidence + the 05-06 ladder own that path (LOCKED)
//   failed  → escalate()    (ladder requeue; 5+ fails → blocked report)
//
// The loop is a LIBRARY (SYSTEM_ARCHITECTURE R5: no new resident service):
// the pg-boss scheduler hosts it on a self-chained singleton job, exactly the
// intent-intake idiom. Every mutation it triggers is race-safe downstream
// (claim_next_task SKIP LOCKED; guarded transitions; idempotent blockTask),
// so a double-fired drain can never double-move a task.
//
// Per-tick caps keep one drain bounded: execution runs LLM turns (minutes),
// so it claims few; escalation is pure code, so it sweeps more. The chain
// re-arms every tick — throughput comes from cadence, not batch size.
//
// B39 (2026-08-25) — THE EXECUTION LEG NOW ASKS BEFORE IT CLAIMS. The two money
// brakes read cost_ledger + the LiteLLM proxy, and the subscription path appears
// in neither, so until now this leg could spend without limit and nothing would
// have noticed. `workerId` was always a parameter and claim_next_task has always
// been SKIP LOCKED, which means N of these loops can run side by side the day
// the measurement says they should — and the day that happens, the brake has to
// already exist. It stops the EXECUTION leg only: review and escalation are
// pure code and cost nothing, and a company whose queue is full still wants its
// finished work graded.
import { sql } from "kysely";
import { getDb } from "@dxb/shared";
import { escalate } from "./escalate.js";
import { qa, type QaEvaluator } from "./qa.js";
import { runWorkerOnce, type Executor } from "./worker-shim.js";
import { alertSubscriptionCapReached, checkSubscriptionWindow } from "./subscription-cap.js";

export const RESIDENT_WORKER_ID = "resident-worker";
const LOW_CONFIDENCE = 0.6; // mirror of escalate.ts LOCKED threshold

// B43 plan ② (measured 2026-09-05 02:23 on DXB-V-EYW-004): every lane drains the review and
// the failed legs, and the review SELECT takes no lock — so with seven lanes the same task in
// 'review' was judged by several lanes at once, each paying a QA model call, all but one
// losing the guarded transition ("qa: transition review→done lost a race"). The lanes live in
// ONE process (A17), so an in-process set is the whole fix: a task under judgement in this
// process is skipped by the sibling lanes; the DB transition guard stays as the last word.
const judging = new Set<string>();
const laddering = new Set<string>();

export interface DrainTasksDeps {
  workerId?: string;
  execute?: Executor; // tests inject; production = worker-shim defaultExecutor
  evaluate?: QaEvaluator; // tests inject; production = qa defaultEvaluator
  /** Scope every leg to these departments. Production omits — the drain then
   *  spans every non-archived department, re-read each tick. */
  departments?: string[];
  leaseSeconds?: number;
  execCap?: number; // queued claims per drain (LLM-heavy — keep small)
  reviewCap?: number; // qa verdicts per drain (one LLM call each)
  failedCap?: number; // ladder steps per drain (pure code — cheap)
}

export interface DrainTasksResult {
  executed: number;
  reviewed: number;
  escalated: number;
}

// Departments the claim spans: every non-archived department. Read per drain
// (one cheap SELECT) so an org mutation is picked up next tick without a
// restart.
async function activeDepartments(): Promise<string[]> {
  const res = await sql<{ slug: string }>`
    SELECT slug FROM departments WHERE status <> 'archived' ORDER BY slug
  `.execute(getDb());
  return res.rows.map((r) => r.slug);
}

/** One resident drain pass. Hosted by the scheduler's task.worker self-chain;
 *  callable directly in tests. Never throws for per-task failures — a task
 *  that errors lands in its own failed/blocked lane, the loop moves on. */
export async function drainTasks(deps: DrainTasksDeps = {}): Promise<DrainTasksResult> {
  const workerId = deps.workerId ?? RESIDENT_WORKER_ID;
  const execCap = deps.execCap ?? 1;
  const reviewCap = deps.reviewCap ?? 3;
  const failedCap = deps.failedCap ?? 5;
  const db = getDb();
  const result: DrainTasksResult = { executed: 0, reviewed: 0, escalated: 0 };

  // Leg 1 — queued → claim + execute. runWorkerOnce owns the whole certified
  // chain (hook pre-gate, observability scope, post-gate, transitions).
  //
  // The ceiling is asked ONCE per drain, not once per claim: with execCap = 1
  // that is the same thing, and with execCap > 1 a drain that started under the
  // ceiling finishes the batch it started rather than stopping halfway through
  // its own work. The next tick is ten seconds away either way.
  const departments = deps.departments ?? (await activeDepartments());
  const window = await checkSubscriptionWindow();
  if (!window.open) {
    // Not an error and not a failure: the company reached the hour's ceiling and
    // stopped itself. Nothing is lost — the queue waits, and the window rolls.
    console.warn(
      `[worker-loop] execution leg held: ${window.tokens} tokens in the last hour, ceiling ${window.cap}`,
    );
    await alertSubscriptionCapReached(window);
  }
  if (departments.length > 0 && window.open) {
    for (let i = 0; i < execCap; i++) {
      const run = await runWorkerOnce({
        workerId,
        departments,
        ...(deps.execute ? { execute: deps.execute } : {}),
        ...(deps.leaseSeconds ? { leaseSeconds: deps.leaseSeconds } : {}),
      });
      if (!run.claimed) break;
      result.executed += 1;
    }
  }

  // Leg 2 — review → QA gate, oldest first. Low-confidence rows are the
  // ladder's food, not QA's (escalate() converts them review→failed and
  // applies the rung in the same call).
  const reviews = await sql<{ id: string; confidence: number | null }>`
    SELECT id, (result ->> 'confidence')::numeric AS confidence
    FROM tasks WHERE status = 'review' AND department = ANY(${departments})
    ORDER BY updated_at
    LIMIT ${reviewCap}
  `.execute(db);
  for (const row of reviews.rows) {
    if (judging.has(row.id)) continue; // a sibling lane is already judging it
    judging.add(row.id);
    try {
      if (row.confidence !== null && Number(row.confidence) < LOW_CONFIDENCE) {
        await escalate(db, row.id);
        result.escalated += 1;
      } else {
        await qa(row.id, deps.evaluate);
        result.reviewed += 1;
      }
    } catch (err) {
      // QA/ladder infrastructure error (LLM down, race lost): log and move on —
      // the task stays in its current guarded state for the next tick.
      console.error(`[worker-loop] review leg failed for task ${row.id}:`, err);
    } finally {
      judging.delete(row.id);
    }
  }

  // Leg 3 — failed → ladder. Blocked tasks (audit 'task.blocked' row) are
  // terminal by design: excluded here so the loop never re-chews them.
  const failed = await sql<{ id: string }>`
    SELECT t.id FROM tasks t
    WHERE t.status = 'failed' AND t.department = ANY(${departments})
      AND NOT EXISTS (
        SELECT 1 FROM audit_log a
        WHERE a.task_id = t.id AND a.action = 'task.blocked'
      )
    ORDER BY t.updated_at
    LIMIT ${failedCap}
  `.execute(db);
  for (const row of failed.rows) {
    if (laddering.has(row.id)) continue; // a sibling lane is already on this rung
    laddering.add(row.id);
    try {
      await escalate(db, row.id);
      result.escalated += 1;
    } catch (err) {
      console.error(`[worker-loop] ladder leg failed for task ${row.id}:`, err);
    } finally {
      laddering.delete(row.id);
    }
  }

  return result;
}
