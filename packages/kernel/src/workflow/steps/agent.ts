// agent step — WORKFLOW_ENGINE §3: one employee run, model from a
// MODEL_ROUTING role slot (model_id pin = the registered exception), executed
// inside an observability runScope so agent_runs.workflow_run_id carries the
// drill-down chain (§11) and usage feeds §17 enforcement.
import { sql } from "kysely";
import { getDb, AgentStepConfig } from "@dxb/shared";
import { runScope } from "@dxb/observability";
import { StepError, type AgentWork, type WorkflowExecutor, type WorkflowRow, type WorkflowRunRow } from "../types.js";

export interface EligibleEmployee {
  id: string;
  slug: string;
  department: string;
}

// §25 edge — "atanan çalışan arşivlenmiş → adım başlangıcında fn reddi → run
// failed sebepli". Same HR gate the control fn applies at write time
// (non-archived + persona v2), re-checked at STEP START because employees
// change between definition and run.
export async function resolveEligibleEmployee(employeeId: string): Promise<EligibleEmployee> {
  const emp = await getDb()
    .selectFrom("agents")
    .select(["id", "slug", "department", "employment_status", "persona_version"])
    .where("id", "=", employeeId)
    .executeTakeFirst();
  if (!emp) {
    throw new StepError(`employee ${employeeId} does not exist`, "policy", "EMPLOYEE_MISSING");
  }
  if (emp.employment_status === "archived" || !String(emp.persona_version ?? "").startsWith("v2")) {
    throw new StepError(
      `employee ${emp.slug} ineligible (archived or pre-v2 persona)`,
      "policy",
      "EMPLOYEE_INELIGIBLE",
    );
  }
  return { id: emp.id, slug: emp.slug, department: emp.department };
}

// Slot → model through fn_select_model (E7.1, live): guardrails (banned /
// mechanical_only / context) applied in the fn, decision_log row included.
export async function resolveStepModel(
  cfg: { model_role_slot?: string; model_id?: string },
  risk: string,
): Promise<string> {
  if (cfg.model_id) return cfg.model_id; // §2: pin = exception, slot = default
  const res = await sql<{ fn_select_model: unknown }>`
    SELECT fn_select_model(${cfg.model_role_slot}, NULL, ${risk}, NULL, NULL, NULL,
                           ${risk === "critical"}, true) AS fn_select_model
  `.execute(getDb());
  const out = res.rows[0]?.fn_select_model as { ok?: boolean; model_id?: string; error?: string };
  if (!out?.ok || !out.model_id) {
    throw new StepError(
      `no model for slot '${cfg.model_role_slot}' (${out?.error ?? "no result"})`,
      "fatal",
      "NO_MODEL_AVAILABLE",
    );
  }
  return out.model_id;
}

export async function runAgentStep(args: {
  wf: WorkflowRow;
  run: WorkflowRunRow;
  config: unknown;
  executor: WorkflowExecutor;
}): Promise<{ output: string; confidence: number }> {
  const cfg = AgentStepConfig.parse(args.config);
  const emp = await resolveEligibleEmployee(cfg.employee_id);
  const model = await resolveStepModel(cfg, args.wf.risk);

  const work: AgentWork = {
    employeeId: emp.id,
    employeeSlug: emp.slug,
    department: cfg.department ?? emp.department,
    model,
    objective: cfg.objective,
    outputContract: cfg.output_contract,
  };

  const { value } = await runScope(
    { employeeId: emp.id, workflowRunId: args.run.id, modelId: model },
    () => args.executor(work),
  );
  return value;
}
