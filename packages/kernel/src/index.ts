import { PACKAGE } from "@dxb/shared";

export const OWNER = "kernel" as const;
export { PACKAGE };

export { ClassifiedIntent, classify } from "./classify.js";
// B51 P1: the catalogue is the one place every model id lives.
export { ModelRefusedError, modeOfLane, resolveModel, sdkModel, sdkModelId } from "./models.js";
export type { ModelLane, ResolvedModel } from "./models.js";
// CEO 2026-10-03: every company model call runs with nothing of the construction loaded.
export {
  companyClaudeHome,
  companyClaudeLoginLine,
  companyIsolation,
  ensureCompanyMemoryRoot,
  isolationReceipt,
} from "./sdk-isolation.js";
export type { SdkIsolation } from "./sdk-isolation.js";
export { loadPolicy, route, workClasses, NoRouteError } from "./policy.js";
export type { ResolvedRoute, RoutingRule } from "./policy.js";

// E9.3 approval gate — operation classification is kernel-side, rule-table
// driven, fail-closed (APPROVAL_ENGINE §3 ⛔).
export { classifyOperation } from "./approval-gate.js";
export type { ClassifiedOperation, OperationGate, OperationClass } from "./approval-gate.js";

// E9.1 workflow engine — a library inside the kernel worker (WORKFLOW §3 ⛔).
export { runWorkflowRun, drainWorkflowRuns, seatedExecutor } from "./workflow/runner.js";
export {
  registerCronTriggers,
  dispatchEventTriggers,
  triggerRunNow,
  eventMatches,
} from "./workflow/triggers.js";
export { defaultWorkflowExecutor } from "./workflow/executor.js";
export { StepError } from "./workflow/types.js";
export type {
  AgentWork,
  WorkflowExecutor,
  RunnerDeps,
  RunOutcome,
  StepErrorClass,
  StepEffort,
  StepSeat,
} from "./workflow/types.js";
export type { CronRegistrar, CronWorkflow } from "./workflow/triggers.js";
export type { DrainResult } from "./workflow/runner.js";
