// logDecision — THE one mechanism for §10 "important decision" points
// (AUDIT_AND_LOGGING_SPEC §10, binding list; OBSERVABILITY_SPEC R6).
// Successor authors add a row to the §10 list and call this — they never
// invent another mechanism (AUDIT spec, Opus-devralma note).
//
// Type contract (AUDIT §20/§21): all EIGHT fields are required KEYS — a call
// site that omits one does not compile. Nullable VALUES are allowed only
// where the column is nullable; decision and rationale are NOT NULL both in
// the type and in the schema (R6: no decision without a rationale).
//
// Failure discipline (AUDIT §17): a decision point that cannot write its log
// never stops execution (yürütme kutsal) but never stays silent — the task's
// event trail gets a 'degraded_logging' marker so the evidence gap is visible.
import { getDb } from "@dxb/shared";

export interface DecisionRecord {
  /** agent_runs.id when inside a run — pass null DELIBERATELY when outside. */
  runId: string | null;
  /** Who decided: 'orchestrator:dispatch' | employee id | 'kernel' | 'ceo'. */
  decidedBy: string;
  /** §10 kind + short statement, e.g. 'task_plan', 'escalation'. */
  decision: string;
  /** WHY — mandatory, never empty (R6). */
  rationale: string;
  /** Which data fed the decision (10.2 "hangi veriler"). */
  dataUsed: string[];
  /** Alternatives considered — null only when there genuinely were none. */
  alternatives: unknown;
  /** Self-assessed 0..1, or null where the point is deterministic code. */
  confidence: number | null;
  /** Risk read: 'low'|'medium'|'high'|'critical' or null. */
  risk: string | null;
}

export interface DecisionExtras {
  /** approvals.id when the decision converted into an approval gate. */
  approvalId?: string;
  /** Early-known outcome; usually closed later via the single-UPDATE exception. */
  outcome?: string;
  /** tasks.id for the degraded_logging marker if the write fails. */
  taskId?: string;
}

export type LogDecisionResult = { ok: true; id: string } | { ok: false; error: string };

export async function logDecision(
  rec: DecisionRecord,
  extras: DecisionExtras = {},
): Promise<LogDecisionResult> {
  const db = getDb();
  try {
    const row = await db
      .insertInto("decision_log")
      .values({
        run_id: rec.runId,
        decided_by: rec.decidedBy,
        decision: rec.decision,
        rationale: rec.rationale,
        data_used: rec.dataUsed,
        alternatives: rec.alternatives === null ? null : JSON.stringify(rec.alternatives),
        confidence: rec.confidence,
        risk: rec.risk,
        approval_id: extras.approvalId ?? null,
        outcome: extras.outcome ?? null,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    return { ok: true, id: String(row.id) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[obs] logDecision FAILED (${rec.decision} by ${rec.decidedBy}):`, message);
    if (extras.taskId) {
      // Evidence gap made visible on the task's own trail (AUDIT §17).
      await db
        .insertInto("task_events")
        .values({
          task_id: extras.taskId,
          event: "degraded_logging",
          from_status: "running",
          to_status: "running",
          actor: rec.decidedBy,
          payload: JSON.stringify({ decision: rec.decision, error: message }),
        })
        .execute()
        .catch(() => undefined);
    }
    return { ok: false, error: message };
  }
}
