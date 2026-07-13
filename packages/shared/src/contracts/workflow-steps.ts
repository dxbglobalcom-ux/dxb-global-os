// WORKFLOW_ENGINE_SPEC §4 — step `config` jsonb schemas, kind-per-schema.
// This file is the single normative source for step configs: the control fn
// validates writes against the same shapes (mirrored checks in SQL), the
// kernel runner parses snapshots through here before executing a step.
// §16: NO credential fields anywhere below — a vault reference NAME may ride
// in prompt text, a secret value may not have a field to live in.
import { z } from "zod";

export const STEP_KINDS = ["agent", "approval", "review", "retry", "fallback"] as const;
export type StepKind = (typeof STEP_KINDS)[number];

// -- agent -----------------------------------------------------------------
// Executes one employee run. Model comes from a MODEL_ROUTING role slot by
// default; `model_id` pins a concrete model (spec §2: exception, slot is the
// default). `outbox_action` marks an outward-facing action the run may emit —
// its PRESENCE is what the B7b guard keys on (money-out step without an
// earlier approval step in a high/critical workflow = rejected at write time).
export const AgentStepConfig = z
  .object({
    employee_id: z.string().uuid(),
    model_role_slot: z.string().min(1).optional(),
    model_id: z.string().min(1).optional(),
    objective: z.string().min(1),
    output_contract: z.string().min(1),
    department: z.string().min(1).optional(), // default: employee's department
    outbox_action: z.string().min(1).optional(), // e.g. 'email.send' — B7b key
  })
  .strict()
  .refine((c) => c.model_role_slot || c.model_id, {
    message: "agent step needs model_role_slot (default) or model_id (exception)",
  });

// -- approval --------------------------------------------------------------
// Opens an approvals row and PARKS the run (§10: waiting_approval — no retry
// counter, no timeout; the human gate waits without limits).
export const ApprovalStepConfig = z
  .object({
    action_type: z.string().min(1), // approvals.action_type
    risk_class: z.enum(["low", "medium", "high", "critical"]).default("high"),
    summary: z.string().min(1),
  })
  .strict();

// -- review ----------------------------------------------------------------
// Reviewer employee judges the PREVIOUS agent step's output. Verdict fail →
// structured action (§19; default escalate).
export const ReviewStepConfig = z
  .object({
    employee_id: z.string().uuid(),
    model_role_slot: z.string().min(1).optional(),
    model_id: z.string().min(1).optional(),
    criteria: z.string().min(1),
    min_confidence: z.number().min(0).max(1).default(0.6),
    on_fail: z.enum(["retry_prev", "fallback", "escalate", "fail"]).default("escalate"),
  })
  .strict();

// -- retry -----------------------------------------------------------------
// Applies a retry policy to the previous step (§18).
export const RetryStepConfig = z
  .object({
    max_attempts: z.number().int().min(1).max(10),
    backoff_s: z.number().int().min(0).max(3600).default(0),
    on_exhaust: z.enum(["fail", "fallback", "escalate"]).default("fail"),
  })
  .strict();

// -- fallback --------------------------------------------------------------
// Alternate step chain when the main path is exhausted (§19). Model fallback
// is a SEPARATE mechanism (model_catalog chain) — not this.
export const FallbackStepConfig = z
  .object({
    alternate_steps: z
      .array(z.object({ kind: z.enum(["agent", "review"]), config: z.record(z.string(), z.unknown()) }))
      .min(1),
  })
  .strict();

export const STEP_CONFIG_SCHEMAS = {
  agent: AgentStepConfig,
  approval: ApprovalStepConfig,
  review: ReviewStepConfig,
  retry: RetryStepConfig,
  fallback: FallbackStepConfig,
} as const;

export const WorkflowStep = z.object({
  seq: z.number().int().min(1),
  kind: z.enum(STEP_KINDS),
  config: z.record(z.string(), z.unknown()),
});
export type WorkflowStep = z.infer<typeof WorkflowStep>;

/** Parse one step's config against its kind schema (throws ZodError). */
export function parseStepConfig(kind: StepKind, config: unknown) {
  return STEP_CONFIG_SCHEMAS[kind].parse(config);
}

// §10 sürümleme: workflow_runs.steps_snapshot — the step set frozen at run
// start. The runner executes ONLY from this shape, never from live tables.
export const StepsSnapshot = z.array(WorkflowStep).min(1);
export type StepsSnapshot = z.infer<typeof StepsSnapshot>;

export const WORKFLOW_RUN_STATUSES = [
  "running",
  "waiting_approval",
  "failed",
  "succeeded",
  "cancelled",
] as const;
export type WorkflowRunStatus = (typeof WORKFLOW_RUN_STATUSES)[number];
