import { PACKAGE } from "@dxb/shared";

export const OWNER = "orchestrator" as const;
export { PACKAGE };

export { decompose, lintBatch, chainDepth } from "./decompose.js";
export type { DecomposedEnvelope } from "./decompose.js";
export { dispatch } from "./dispatch.js";
export { intakeIntentOnce, drainIntents, headline } from "./intent-intake.js";
export type { IntentIntakeDeps, IntakeResult } from "./intent-intake.js";
export { runWorkerOnce, makeSteppedExecutor } from "./worker-shim.js";
// R2.1 — resident worker loop (audit F-01): the tasks-queue production consumer.
export { drainTasks, RESIDENT_WORKER_ID } from "./worker-loop.js";
export type { DrainTasksDeps, DrainTasksResult } from "./worker-loop.js";
// W2.5 — autonomous work generation: a finished plan opens its own next tasks.
export { generateWorkFromPlans, parsePlanSteps, openGeneratedWork } from "./work-generation.js";
export type { PlanStep, PlanHarvest, GenerateWorkResult, GeneratedTask } from "./work-generation.js";
// R2.2 — worker real tool surface (audit F-02/F-04): profile → SDK bridge.
export { buildSdkToolOptions, resolveEvidenceToolCalls, resolveExecutionRoute } from "./worker-shim.js";
export { runCriticalGate, codexRunner, CRITICAL_GATE_CONFIG } from "./critical-gate.js";
export { classifyLeg, buildBriefSnapshot, legInstruction, LEG_TASK_CLASS } from "./chat-legs.js";
export type { ChatLeg, BriefSnapshot } from "./chat-legs.js";
export type { CriticalGateInput, CriticalGateResult, ChallengerRun, ChallengerRunner, Objection } from "./critical-gate.js";
export type { ExecutionRoute } from "./worker-shim.js";
export type { SdkToolOptions } from "./worker-shim.js";
export { startOpsLiveCollector } from "./ops-live-collector.js";
export type { OpsLiveCollector } from "./ops-live-collector.js";
export type { StepOutcome, TaskStep, SteppedExecutorArgs } from "./worker-shim.js";
export {
  CONTEXT_BAND,
  OFFLOAD_SOURCE,
  estimateTokens,
  contextText,
  checkContextBudget,
  summarizeAndOffload,
} from "./context-budget.js";
export type {
  ContextEntry,
  WorkingContext,
  CompressionMeasurement,
  BudgetCheckResult,
  ContextBudgetDeps,
} from "./context-budget.js";
export { ROLE_SLOTS, selectModel, fallbackModel, RoutingRefusedError } from "./select-model.js";
export type { RoleSlot, SelectModelArgs, FallbackArgs, RoutingSelection } from "./select-model.js";
export { escalate, failCount, ladderAction, bumpTier } from "./escalate.js";
export type { LadderAction, EscalateResult } from "./escalate.js";
export { qa, QaVerdict } from "./qa.js";
export type { QaTask, QaEvaluator, QaOutcome } from "./qa.js";
export { council, judgeCandidates, shouldCouncil, COUNCIL_CONFIG, JudgeVerdict } from "./council.js";
export type { CouncilTask, CouncilResult, CandidateLabel } from "./council.js";
export type { ClaimedTask, Executor, HookedClaimedTask, RunWorkerArgs, RunWorkerResult, WorkerOutput } from "./worker-shim.js";
// E10.2 — spawn-path hook binding (FABLE_5_HOOK §3): dispatch-side glue.
export {
  CURRENT_HOOK_VERSION,
  alertHookDisabled,
  assembleHookCtx,
  buildHookResult,
  extractEvidencePackage,
  hookEnabled,
  stampHookVersion,
} from "./hook-binding.js";
export type { HookMonitorFlags } from "./hook-binding.js";
export { drainChatMessages, CHAT_HAMZA_SLUG } from "./chat-drain.js";
export type { DrainChatDeps, DrainChatResult, ChatAnswerInput } from "./chat-drain.js";
