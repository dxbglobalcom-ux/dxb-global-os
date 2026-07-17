// agent step — WORKFLOW_ENGINE §3: one employee run, model from a
// MODEL_ROUTING role slot (model_id pin = the registered exception), executed
// inside an observability runScope so agent_runs.workflow_run_id carries the
// drill-down chain (§11) and usage feeds §17 enforcement.
//
// R2.3 (audits F-03/F-05, FABLE_5_HOOK A9 unification): the step now runs the
// SAME hook constitution as the task path — preTask BEFORE the run is born
// (REJECT → StepError 'policy', run never exists, §6), post-gate + §19 REVISE
// loop inside the scope, evidence anchored to real tool_calls rows through
// the shared resolver. Flag OFF flows the old path loudly (hook:disabled
// alert), exactly the worker-shim semantics.
import { sql } from "kysely";
import { getDb, AgentStepConfig } from "@dxb/shared";
import { resolveEvidenceToolCalls, runScope } from "@dxb/observability";
import {
  alertHookDisabled,
  extractEvidencePackage,
  hookEnabled,
  postTask,
  preTask,
  type HookCtx,
} from "@dxb/hook";
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

/** R2.3 — workflow-side HookCtx assembly from REAL rows (the A9 mirror of the
 *  orchestrator's assembleHookCtx; workflow steps are not tasks rows, so the
 *  task ctx carries the step's own contract and the workflow's project). */
async function assembleStepHookCtx(args: {
  emp: EligibleEmployee & { mcpProfile?: string | null; managerId?: string | null };
  wf: WorkflowRow;
  cfg: { objective: string; output_contract: string };
}): Promise<HookCtx> {
  const db = getDb();
  const empRow = await db
    .selectFrom("agents")
    .select(["mcp_profile", "manager_id"])
    .where("id", "=", args.emp.id)
    .executeTakeFirst();
  const hardStop = await sql<{ on: boolean }>`
    SELECT EXISTS (SELECT 1 FROM budget_state WHERE hard_stopped) AS on
  `.execute(db);
  const wfProject = (args.wf as { project_id?: string | null }).project_id ?? null;
  let project: HookCtx["project"] = null;
  if (wfProject) {
    const p = await sql<{ id: string; purpose: string | null }>`
      SELECT id, purpose FROM projects WHERE id = ${wfProject}::uuid
    `.execute(db);
    if (p.rows[0]) project = { id: p.rows[0].id, purpose: p.rows[0].purpose };
  }
  return {
    employee: {
      id: args.emp.id,
      slug: args.emp.slug,
      department: args.emp.department,
      mcpProfile: empRow?.mcp_profile ?? null,
      managerId: empRow?.manager_id ?? null,
    },
    task: {
      id: null, // workflow step, not a tasks row — violations link via runId
      objective: args.cfg.objective,
      outputContract: args.cfg.output_contract,
    },
    project,
    budget: { hardStop: hardStop.rows[0]?.on === true },
    actor: "system",
  };
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

  // R2.3 hook binding (A9): same order as the task path — pre-gate BEFORE the
  // run is born; flag OFF flows the old path loudly.
  const hookOn = await hookEnabled(emp.id);
  if (!hookOn) await alertHookDisabled();

  let hookCtx: HookCtx | null = null;
  if (hookOn) {
    hookCtx = await assembleStepHookCtx({ emp, wf: args.wf, cfg });
    const pre = await preTask(hookCtx);
    if (pre.verdict === "REJECT") {
      throw new StepError(
        `hook pre-gate rejected step: ${pre.reason}`,
        "policy",
        "HOOK_REJECTED",
      );
    }
    if (pre.inject.projectPurpose) {
      work.objective = `${work.objective}\n\nProject purpose (holding alignment): ${pre.inject.projectPurpose}`;
    }
  }

  const { value } = await runScope(
    { employeeId: emp.id, workflowRunId: args.run.id, modelId: model },
    async (scope) => {
      if (!hookOn || !hookCtx) return args.executor(work);

      // §19 REVISE loop — the worker-shim idiom verbatim: settle the
      // observability buffer, anchor declared evidence to REAL tool_calls
      // rows, then let the post-gate judge; REVISE re-executes with feedback,
      // exhaustion escalates as a policy StepError (§17 triple).
      const ctx: HookCtx = { ...hookCtx, runId: scope.runId };
      let rounds = 0;
      const attemptWork: AgentWork = { ...work };
      for (;;) {
        const attempt = await args.executor(attemptWork);
        await scope.settle();
        const pkg = attempt.resultPackage ?? { text: attempt.output };
        await resolveEvidenceToolCalls(pkg, scope.runId);
        const post = await postTask(
          { ...ctx, revisionRound: rounds },
          extractEvidencePackage(pkg),
        );
        if (post.verdict === "PASS") return attempt;
        if (post.verdict === "REVISE") {
          rounds += 1;
          attemptWork.feedback = post.feedback.join("\n");
          continue;
        }
        throw new StepError(
          `hook post-gate ESCALATE after ${rounds} revision round(s): ${post.feedback.join("; ")}`,
          "policy",
          "HOOK_ESCALATED",
        );
      }
    },
  );
  return { output: value.output, confidence: value.confidence };
}
