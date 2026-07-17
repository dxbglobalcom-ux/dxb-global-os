// @dxb/hook — FABLE 5 INTELLIGENCE & DISCIPLINE HOOK (FABLE_5_HOOK_SPEC).
// A LIBRARY, not a resident service (R5): pure gate functions over DB state.
// Spawn-path binding + agents.hook_version stamping land in E10.2; today the
// gates are exercised by tests and by /gov/violations reads.
export { loadPolicies, invalidatePolicyCache, gatePolicies } from "./policies.js";
export { preTask } from "./pre-task.js";
export {
  runtimeLimits,
  checkSpawn,
  monitorTokens,
  monitorContext,
  checkConfidence,
} from "./runtime.js";
export { postTask } from "./post-task.js";
// R2.3 — shared spawn-path pieces (one constitution for worker-shim AND the
// workflow agent step): §22 flag + A10 evidence extraction live HERE.
export { hookEnabled, alertHookDisabled } from "./flag.js";
export { extractEvidencePackage } from "./evidence.js";
export { recordViolation, escalate, resolveEscalationChain } from "./violations.js";
export type {
  HookCtx,
  HookEmployeeCtx,
  HookTaskCtx,
  HookPolicyRow,
  PolicyLoad,
  EvidenceItem,
  PostTaskResult,
  PreVerdict,
  PostVerdict,
  RuntimeLimits,
  ViolationNote,
} from "./types.js";
export type { ViolationWrite } from "./violations.js";
