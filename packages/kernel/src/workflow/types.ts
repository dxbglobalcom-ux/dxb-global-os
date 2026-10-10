// WORKFLOW_ENGINE §3/§17 — shared runner types. The engine is a LIBRARY
// inside the kernel worker (⛔ architecture-critical: not a resident service);
// everything long-lived (pg-boss handles, the LLM executor) is injected at
// the composition point (outbox-executor scheduler / tests).
import type { StepsSnapshot } from "@dxb/shared";

/** One unit of agent work — what a workflow agent/review step hands the LLM. */
export interface AgentWork {
  employeeId: string;
  employeeSlug: string;
  department: string;
  model: string;
  objective: string;
  outputContract: string;
  /** R2.3 — hook post-gate REVISE feedback rides the re-execution (§19),
   *  exactly the worker-shim idiom. */
  feedback?: string;
  /** B51 P5b (C2-3) — the effort of the routing row that chose the model; absent → the SDK's default. */
  effort?: StepEffort;
  /** B51 P5b (C2-4) — who the seat is: what the composition point needs to build its standing prompt. */
  seat?: StepSeat;
  /** B51 P5b (C2-4) — the seat's standing prompt (identity, persona, the laws), the system prompt of the
   *  run. Filled by the composition point (RunnerDeps.seatPrompt); absent → the one-line identity. */
  systemPrompt?: string;
}

/** The effort levels the Agent SDK accepts and a routing row may carry. */
export const STEP_EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;
export type StepEffort = (typeof STEP_EFFORTS)[number];

/** The employee a step runs as — the orchestrator's SeatIdentity shape (the kernel cannot import it). */
export interface StepSeat {
  slug: string;
  department: string;
  role_level: string | null;
  persona_path: string | null;
}

/** R2.3 — the executor's result carries the A10 evidence package the hook
 *  post-gate consumes (executor-declared; anchored to real tool_calls rows by
 *  the shared resolver). Absent on injected test executors that predate it. */
export interface AgentWorkResult {
  output: string;
  confidence: number;
  /** Raw result object for extractEvidencePackage (evidence[], acceptance_map). */
  resultPackage?: Record<string, unknown>;
}

/** Injectable LLM seam. Default: executor.ts dual path (SDK / LiteLLM). */
export type WorkflowExecutor = (work: AgentWork) => Promise<AgentWorkResult>;

export interface RunnerDeps {
  executor?: WorkflowExecutor;
  /** Backoff sleeper — tests inject an instant one. */
  sleep?: (ms: number) => Promise<void>;
  /** B51 P5b (C2-4) — builds a seat's standing prompt. The one definition lives in the orchestrator
   *  (`seatStandingPrompt`, prompt-core underneath), which the kernel cannot import (it depends on the
   *  kernel), so the composition point — the scheduler — hands it in. Absent → no system prompt. */
  seatPrompt?: (seat: StepSeat) => Promise<string | null>;
}

/** §17 error triple: transient → retry policy · policy → escalate · fatal → run failed + alert. */
export type StepErrorClass = "transient" | "policy" | "fatal";

export class StepError extends Error {
  constructor(
    message: string,
    public readonly cls: StepErrorClass,
    public readonly reason: string,
  ) {
    super(message);
    this.name = "StepError";
  }
}

export interface WorkflowRow {
  id: string;
  slug: string;
  name: string;
  trigger: { kind: string; [k: string]: unknown };
  enabled: boolean;
  budget_eur: string | null;
  token_limit: number | null;
  timeout_s: number | null;
  risk: string;
  logging_level: string;
  version: number;
}

export interface WorkflowRunRow {
  id: string;
  workflow_id: string;
  status: string;
  triggered_by: string;
  current_step: number | null;
  steps_snapshot: StepsSnapshot;
  started_at: Date;
}

export type RunOutcome =
  | { status: "succeeded" }
  | { status: "waiting_approval"; approvalId: string; stepSeq: number }
  | { status: "failed"; reason: string }
  | { status: "cancelled" }
  | { status: "skipped"; reason: string };
