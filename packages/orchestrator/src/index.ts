import { PACKAGE } from "@dxb/shared";

export const OWNER = "orchestrator" as const;
export { PACKAGE };

export { decompose, lintBatch, chainDepth } from "./decompose.js";
export type { DecomposedEnvelope } from "./decompose.js";
export { dispatch } from "./dispatch.js";
export { runWorkerOnce } from "./worker-shim.js";
export { escalate, failCount, ladderAction, bumpTier } from "./escalate.js";
export type { LadderAction, EscalateResult } from "./escalate.js";
export type { ClaimedTask, Executor, RunWorkerArgs, RunWorkerResult, WorkerOutput } from "./worker-shim.js";
