export {
  RunScope,
  currentRunScope,
  runScope,
  type FileChangeEvent,
  type RunContext,
  type RunResult,
  type RunScopeOptions,
  type RunUsage,
  type ToolCallEvent,
} from "./run-scope.js";
export { restoreSpill, spill, spillDir, type SpillRow } from "./spill.js";
// R2.3 — shared evidence anchoring (worker-shim AND workflow agent step).
export { resolveEvidenceToolCalls } from "./evidence-anchor.js";
export {
  logDecision,
  type DecisionExtras,
  type DecisionRecord,
  type LogDecisionResult,
} from "./log-decision.js";
