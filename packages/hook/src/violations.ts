// Violation record + escalation chain (§4/§7). hook_violations is append-only
// and feeds the HR error record; every violation also lands in decision_log
// through logDecision (AUDIT §10 — 'hook_reject' / 'hook_escalation', the two
// points E8.2 recorded as boundaries to this row). The write is LOUD but never
// throws into the gate path: a violation that cannot be recorded is an
// evidence gap, not a reason to lose the verdict.
import { sql } from "kysely";
import { getDb } from "@dxb/shared";
import { logDecision } from "@dxb/observability";
import type { HookCtx } from "./types.js";

export interface ViolationWrite {
  runId: string | null;
  policyId: string;
  gate: "pre" | "runtime" | "post";
  detail: string;
  action: "rejected" | "revised" | "escalated" | "warned";
}

export async function recordViolation(v: ViolationWrite): Promise<number | null> {
  let violationId: number | null = null;
  try {
    const row = await getDb()
      .insertInto("hook_violations")
      .values({
        run_id: v.runId,
        policy_id: v.policyId,
        gate: v.gate,
        detail: v.detail,
        action_taken: v.action,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    violationId = Number(row.id);
  } catch (err) {
    console.error(`[hook] violation record FAILED (${v.policyId}):`, err);
  }
  await logDecision({
    runId: v.runId,
    decidedBy: "hook",
    decision: v.action === "escalated" ? "hook_escalation" : "hook_reject",
    rationale: `${v.gate}-gate ${v.action}: ${v.policyId} — ${v.detail}`,
    dataUsed: ["hook_policies", "hook_violations"],
    alternatives: null,
    confidence: null, // deterministic policy engine
    risk: v.action === "escalated" ? "high" : v.action === "rejected" ? "medium" : "low",
  });
  return violationId;
}

/** Resolve the escalation chain for a department (§7):
 *  settings 'hook.escalation_chain' — per-department override, 'default'
 *  fallback, hard fallback to the spec chain. */
export async function resolveEscalationChain(department?: string | null): Promise<string[]> {
  const fallback = ["manager", "orchestrator", "ceo"];
  try {
    const res = await sql<{ v: unknown }>`
      SELECT resolve_setting('hook.escalation_chain') AS v`.execute(getDb());
    const value = res.rows[0]?.v as Record<string, string[]> | null;
    if (!value || typeof value !== "object") return fallback;
    if (department && Array.isArray(value[department])) return value[department];
    if (Array.isArray(value.default)) return value.default;
    return fallback;
  } catch {
    return fallback;
  }
}

/** §7 chain walk: every hop is a decision_log row; the CEO rung opens an
 *  approval item (action_type 'hook_escalation'); the alert ('high') comes
 *  from the hook_violations trigger on the 'escalated' row itself (A4).
 *  Escalation MUST produce a result: the 24 h-unanswered sweep lives in
 *  fn_alerts_evaluate ('hook-escalation-stale-*' → critical). */
export async function escalate(
  ctx: HookCtx,
  violationIds: Array<number | null>,
  feedback: string[],
): Promise<{ chain: string[]; approvalId: string | null }> {
  const chain = await resolveEscalationChain(ctx.employee.department);
  const employeeName = ctx.employee.slug ?? ctx.employee.id ?? "unknown-employee";

  for (const [hop, rung] of chain.entries()) {
    const target =
      rung === "manager"
        ? (ctx.employee.managerId ?? "department director")
        : rung;
    await logDecision({
      runId: ctx.runId ?? null,
      decidedBy: "hook",
      decision: "hook_escalation",
      rationale:
        `escalation hop ${hop + 1}/${chain.length} → ${rung} (${target}): ` +
        `post-gate revision limit exhausted for ${employeeName} — ${feedback.join(" · ")}`,
      dataUsed: ["hook_violations", "settings_values"],
      alternatives: hop === 0 ? { chain } : null,
      confidence: null,
      risk: rung === "ceo" ? "high" : "medium",
    });
  }

  // CEO rung → approval item (§7). Direct insert is the workflow-approval
  // idiom (kernel steps/approval.ts); decision stays on the LOCKED 0015 path.
  let approvalId: string | null = null;
  try {
    const row = await getDb()
      .insertInto("approvals")
      .values({
        task_id: ctx.task.id ?? null,
        action_type: "hook_escalation",
        risk_class: "high",
        status: "pending",
        operation: "hook_escalation",
        operation_class: "other",
        purpose: `Hook escalation: ${employeeName} failed the post-gate after all revision rounds`,
        payload: JSON.stringify({
          violation_id: violationIds.find((id) => id !== null) ?? null,
          violation_ids: violationIds.filter((id) => id !== null),
          run_id: ctx.runId ?? null,
          employee: employeeName,
          feedback,
        }),
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    approvalId = row.id;
  } catch (err) {
    console.error("[hook] escalation approval insert FAILED:", err);
  }
  return { chain, approvalId };
}
