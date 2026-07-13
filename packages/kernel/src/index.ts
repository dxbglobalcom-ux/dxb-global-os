import { PACKAGE } from "@dxb/shared";

export const OWNER = "kernel" as const;
export { PACKAGE };

export { ClassifiedIntent, classify, SDK_MODEL_IDS } from "./classify.js";
export { loadPolicy, route, NoRouteError } from "./policy.js";
export type { ResolvedRoute, RoutingRule } from "./policy.js";

// E9.3 approval gate — operation classification is kernel-side, rule-table
// driven, fail-closed (APPROVAL_ENGINE §3 ⛔).
export { classifyOperation } from "./approval-gate.js";
export type { ClassifiedOperation, OperationGate, OperationClass } from "./approval-gate.js";

// E9.1 workflow engine — a library inside the kernel worker (WORKFLOW §3 ⛔).
export { runWorkflowRun, drainWorkflowRuns } from "./workflow/runner.js";
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
} from "./workflow/types.js";
export type { CronRegistrar, CronWorkflow } from "./workflow/triggers.js";
export type { DrainResult } from "./workflow/runner.js";
