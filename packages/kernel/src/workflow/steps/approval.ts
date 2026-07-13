// approval step — WORKFLOW_ENGINE §3/§10: open an approvals row and PARK the
// run. waiting_approval is PARK, not retry: no retry counter, no timeout —
// the human gate waits without limits (reminder escalation lives in
// APPROVAL_ENGINE, not here). The 0015 decision path (decide_approvals) is
// LOCKED and untouched; the drain notices the decided row and resumes/fails
// the run (ticket adaptation 2).
import { getDb, ApprovalStepConfig } from "@dxb/shared";
import { classifyOperation } from "../../approval-gate.js";
import type { WorkflowRow, WorkflowRunRow } from "../types.js";

export async function runApprovalStep(args: {
  wf: WorkflowRow;
  run: WorkflowRunRow;
  config: unknown;
  stepSeq: number;
}): Promise<{ approvalId: string }> {
  const cfg = ApprovalStepConfig.parse(args.config);
  // E9.3: stamp the kernel classification on the row (APPROVAL_ENGINE §3 —
  // a step never self-declares its gate; severity risk_class unchanged).
  const classified = await classifyOperation(cfg.action_type);
  const row = await getDb()
    .insertInto("approvals")
    .values({
      task_id: null,
      action_type: cfg.action_type,
      risk_class: cfg.risk_class,
      status: "pending",
      operation: cfg.action_type,
      operation_class: classified.risk_class,
      purpose: cfg.summary,
      payload: JSON.stringify({
        workflow_run_id: args.run.id,
        workflow_id: args.wf.id,
        workflow: args.wf.slug,
        step_seq: args.stepSeq,
        summary: cfg.summary,
      }),
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  return { approvalId: row.id };
}
