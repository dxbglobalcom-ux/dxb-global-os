// review step — WORKFLOW_ENGINE §3/§19: a reviewer employee judges the
// PREVIOUS agent step's output against the step's criteria. The verdict is a
// confidence self-report measured against min_confidence (Phase-5 idiom:
// confidence is SURFACED and judged HERE because the spec makes review a
// first-class step). What happens on fail is the runner's job (on_fail —
// default escalate); this handler only produces the verdict.
import { ReviewStepConfig } from "@dxb/shared";
import { runScope } from "@dxb/observability";
import { resolveEligibleEmployee, resolveStepModel } from "./agent.js";
import type { AgentWork, WorkflowExecutor, WorkflowRow, WorkflowRunRow } from "../types.js";

export interface ReviewVerdict {
  pass: boolean;
  confidence: number;
  output: string;
  onFail: "retry_prev" | "fallback" | "escalate" | "fail";
}

export async function runReviewStep(args: {
  wf: WorkflowRow;
  run: WorkflowRunRow;
  config: unknown;
  executor: WorkflowExecutor;
  previousOutput: string;
}): Promise<ReviewVerdict> {
  const cfg = ReviewStepConfig.parse(args.config);
  const emp = await resolveEligibleEmployee(cfg.employee_id);
  const model = await resolveStepModel(cfg, args.wf.risk);

  const work: AgentWork = {
    employeeId: emp.id,
    employeeSlug: emp.slug,
    department: emp.department,
    model,
    objective: [
      "REVIEW the deliverable below against the criteria. Your `result` is a",
      "short written verdict; your `confidence` is how strongly the deliverable",
      "MEETS the criteria (1 = fully meets, 0 = fails completely).",
      "",
      `Criteria: ${cfg.criteria}`,
      "",
      "Deliverable under review:",
      args.previousOutput,
    ].join("\n"),
    outputContract: "verdict text + honest confidence in [0,1]",
  };

  const { value } = await runScope(
    { employeeId: emp.id, workflowRunId: args.run.id, modelId: model },
    () => args.executor(work),
  );
  return {
    pass: value.confidence >= cfg.min_confidence,
    confidence: value.confidence,
    output: value.output,
    onFail: cfg.on_fail,
  };
}
