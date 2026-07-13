// Table-driven model selection — MODEL_ROUTING_SPEC §3/§6 (E7.1).
// The rules live in routing_rules + model_catalog; this module is only the
// typed doorway to fn_select_model / fn_model_fallback. No model name may be
// written here (R5/§1: hardcoded model ids in agent code are a violation);
// every selection and every fallback hop lands in decision_log inside the fn.
import { sql, type Kysely } from "kysely";
import type { DB } from "@dxb/shared";

export const ROLE_SLOTS = [
  "primary",
  "backup",
  "planning",
  "execution",
  "review",
  "critical_decision",
  "fast_task",
  "low_cost",
  "research",
  "coding",
  "design",
  "qa",
  "hr",
] as const;
export type RoleSlot = (typeof ROLE_SLOTS)[number];

export interface SelectModelArgs {
  roleSlot: RoleSlot;
  departmentId?: string | null;
  risk?: "low" | "medium" | "high" | "critical";
  minContext?: number | null;
  estCostEur?: number | null;
  runId?: string | null;
  /** Critical-class work (approvals, outbox, health, backup) passes the
   *  budget hard-stop gate — COST_CONTROL: the brake never kills those. */
  critical?: boolean;
}

export interface RoutingSelection {
  modelId: string;
  ruleId: string | null;
  decisionId: number | null;
  /** Candidates the fn eliminated, with reasons — surfaced for §14 ("why
   *  this model?" must always be answerable). */
  considered: unknown[];
}

export class RoutingRefusedError extends Error {
  readonly code: string;
  readonly decisionId: number | null;
  constructor(code: string, roleSlot: string, decisionId: number | null) {
    super(`model selection refused for slot '${roleSlot}': ${code}`);
    this.name = "RoutingRefusedError";
    this.code = code;
    this.decisionId = decisionId;
  }
}

type FnResult = {
  ok: boolean;
  error?: string;
  model_id?: string;
  rule_id?: string;
  decision_id?: number;
  considered?: unknown[];
  skipped?: unknown[];
};

export async function selectModel(db: Kysely<DB>, args: SelectModelArgs): Promise<RoutingSelection> {
  const row = await sql<{ r: FnResult }>`
    SELECT fn_select_model(
      ${args.roleSlot},
      ${args.departmentId ?? null}::uuid,
      ${args.risk ?? "low"},
      ${args.minContext ?? null}::int,
      ${args.estCostEur ?? null}::numeric,
      ${args.runId ?? null}::uuid,
      ${args.critical ?? false}
    ) AS r
  `.execute(db);
  const r = row.rows[0]?.r;
  if (!r?.ok || !r.model_id) {
    throw new RoutingRefusedError(r?.error ?? "UNKNOWN", args.roleSlot, r?.decision_id ?? null);
  }
  return {
    modelId: r.model_id,
    ruleId: r.rule_id ?? null,
    decisionId: r.decision_id ?? null,
    considered: r.considered ?? [],
  };
}

export interface FallbackArgs {
  failedModelId: string;
  roleSlot: RoleSlot;
  /** Failure classification per spec §17 — transient/policy text lands in the
   *  decision_log rationale so the fallback is always explainable. */
  reason?: string;
  runId?: string | null;
}

export async function fallbackModel(db: Kysely<DB>, args: FallbackArgs): Promise<RoutingSelection> {
  const row = await sql<{ r: FnResult }>`
    SELECT fn_model_fallback(
      ${args.failedModelId},
      ${args.roleSlot},
      ${args.reason ?? null},
      ${args.runId ?? null}::uuid
    ) AS r
  `.execute(db);
  const r = row.rows[0]?.r;
  if (!r?.ok || !r.model_id) {
    throw new RoutingRefusedError(r?.error ?? "UNKNOWN", args.roleSlot, r?.decision_id ?? null);
  }
  return {
    modelId: r.model_id,
    ruleId: null,
    decisionId: r.decision_id ?? null,
    considered: r.skipped ?? [],
  };
}
