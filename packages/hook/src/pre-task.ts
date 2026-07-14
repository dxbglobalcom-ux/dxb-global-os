// Pre-task gate (§6). Rule order is FIXED: permission (std 12) → persona gate
// (EMPLOYEE_PERSONA rule, filed under std 12) → task completeness (std 1, 3)
// → budget fit (std 5, COST_CONTROL) → project link (std 11). Every check is
// MECHANICAL (row exists / field present — no LLM call, §6 audit-cost rule).
//
// Any 'block' failure: REJECT — the run is never born (task failed(policy) and
// the alert ride the violation row; the task-state write is the dispatcher's,
// E10.2). §27: the CEO is never blocked — actor='ceo' degrades block → warn
// with the violation recorded ('warned') and audited.
// §17 FAIL-CLOSED: policies unreachable → REJECT('hook_unavailable') +
// best-effort critical alert; the queue holds the work, nothing is lost.
import { sql } from "kysely";
import { getDb } from "@dxb/shared";
import { gatePolicies, loadPolicies } from "./policies.js";
import { recordViolation } from "./violations.js";
import type { HookCtx, HookPolicyRow, PreVerdict, ViolationNote } from "./types.js";

async function criticalAlert(title: string, cause: string): Promise<void> {
  try {
    await sql`
      INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                          suggested_action, dedup_key)
      VALUES ('critical', 'hook', ${title}, 'hook pre-gate', ${cause},
              'Restore DB/policy access; spawns are held fail-closed (queue keeps the work)',
              'hook:unavailable')
      ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
      DO NOTHING`.execute(getDb());
  } catch (err) {
    console.error("[hook] fail-closed alert also failed:", err);
  }
}

type CheckOutcome = { ok: true } | { ok: false; detail: string };

async function runCheck(policy: HookPolicyRow, ctx: HookCtx): Promise<CheckOutcome> {
  const check = String(policy.rule.check);
  switch (check) {
    case "permission_bounds": {
      if (!ctx.employee.mcpProfile) {
        return { ok: false, detail: "employee has no MCP profile (PERMISSION_MODEL matrix unread)" };
      }
      if (ctx.requestedTools?.length && ctx.grants) {
        const outside = ctx.requestedTools.filter((t) => !ctx.grants!.includes(t));
        if (outside.length > 0) {
          return { ok: false, detail: `requested tools outside the granted surface: ${outside.join(", ")}` };
        }
      }
      return { ok: true };
    }
    case "persona_gate": {
      let gate = ctx.employee.personaGate;
      if (gate === undefined && ctx.employee.id) {
        const res = await sql<{ passed: boolean }>`
          SELECT EXISTS (SELECT 1 FROM personas
                          WHERE employee_id = ${ctx.employee.id}
                            AND quality_gate = 'passed') AS passed`.execute(getDb());
        gate = res.rows[0]?.passed ? "passed" : null;
      }
      return gate === "passed"
        ? { ok: true }
        : { ok: false, detail: `persona quality gate is '${gate ?? "absent"}', not 'passed'` };
    }
    case "task_completeness": {
      const missing: string[] = [];
      if (!ctx.task.objective?.trim()) missing.push("objective");
      if (!ctx.task.outputContract?.trim()) missing.push("output_contract");
      return missing.length === 0
        ? { ok: true }
        : { ok: false, detail: `missing_acceptance: task lacks ${missing.join(" and ")}` };
    }
    case "plan_evidence": {
      if (!ctx.task.planRequired) return { ok: true };
      if (!ctx.planDecisionId) {
        return { ok: false, detail: "plan_required task carries no plan decision_log reference" };
      }
      const kind = String(policy.rule.decision_kind ?? "task_plan");
      const res = await sql<{ n: number }>`
        SELECT count(*)::int AS n FROM decision_log
         WHERE id = ${ctx.planDecisionId} AND decision = ${kind}`.execute(getDb());
      return (res.rows[0]?.n ?? 0) > 0
        ? { ok: true }
        : { ok: false, detail: `plan decision_log row ${ctx.planDecisionId} (kind ${kind}) not found` };
    }
    case "budget_fit": {
      if (ctx.budget?.hardStop) {
        return { ok: false, detail: "COST_CONTROL hard-stop is active for this scope" };
      }
      if (
        ctx.task.budgetMaxCostEur != null &&
        ctx.budget?.remainingEur != null &&
        ctx.task.budgetMaxCostEur > ctx.budget.remainingEur
      ) {
        return {
          ok: false,
          detail: `task budget €${ctx.task.budgetMaxCostEur} exceeds remaining €${ctx.budget.remainingEur}`,
        };
      }
      return { ok: true };
    }
    case "project_link": {
      if (ctx.project?.id) return { ok: true };
      if (ctx.task.milestoneId) {
        const res = await sql<{ id: string }>`
          SELECT p.id FROM project_milestones m JOIN projects p ON p.id = m.project_id
           WHERE m.id = ${ctx.task.milestoneId}`.execute(getDb());
        if (res.rows[0]) return { ok: true };
        return { ok: false, detail: `missing_project_link: milestone ${ctx.task.milestoneId} resolves to no project` };
      }
      return { ok: false, detail: "missing_project_link: task has neither project ctx nor milestone" };
    }
    default:
      // Unknown check name in a syntactically valid rule = broken policy (§17).
      return { ok: false, detail: `invalid_policy: unknown check '${check}'` };
  }
}

/** std 11: the project purpose is INJECTED into the run context on PASS. */
async function resolveProjectPurpose(
  ctx: HookCtx,
): Promise<{ projectId: string | null; projectPurpose: string | null }> {
  if (ctx.project?.id) {
    if (ctx.project.purpose != null) {
      return { projectId: ctx.project.id, projectPurpose: ctx.project.purpose };
    }
    const res = await sql<{ purpose: string | null }>`
      SELECT purpose FROM projects WHERE id = ${ctx.project.id}`.execute(getDb());
    return { projectId: ctx.project.id, projectPurpose: res.rows[0]?.purpose ?? null };
  }
  if (ctx.task.milestoneId) {
    const res = await sql<{ id: string; purpose: string | null }>`
      SELECT p.id, p.purpose FROM project_milestones m
        JOIN projects p ON p.id = m.project_id
       WHERE m.id = ${ctx.task.milestoneId}`.execute(getDb());
    if (res.rows[0]) return { projectId: res.rows[0].id, projectPurpose: res.rows[0].purpose };
  }
  return { projectId: null, projectPurpose: null };
}

export async function preTask(ctx: HookCtx): Promise<PreVerdict> {
  let load;
  try {
    load = await loadPolicies();
  } catch (err) {
    console.error("[hook] FAIL-CLOSED — policies unreachable:", err);
    await criticalAlert(
      "Hook engine unavailable — spawns held fail-closed",
      err instanceof Error ? err.message : String(err),
    );
    return {
      verdict: "REJECT",
      reason: "hook_unavailable",
      violations: [],
    };
  }

  // §17: a broken policy at this gate rejects — no silent deactivation.
  const brokenHere = load.invalid.filter((p) => p.gate === "pre");
  if (brokenHere.length > 0) {
    const note: ViolationNote = {
      policyId: brokenHere[0].id,
      detail: `invalid_policy: rule JSON of ${brokenHere.map((p) => p.id).join(", ")} is not a machine-readable rule`,
      severity: "block",
    };
    await recordViolation({
      runId: ctx.runId ?? null,
      policyId: brokenHere[0].id,
      gate: "pre",
      detail: note.detail,
      action: "rejected",
    });
    return { verdict: "REJECT", reason: "invalid_policy", violations: [note] };
  }

  const warnings: ViolationNote[] = [];
  for (const policy of gatePolicies(load, "pre")) {
    const outcome = await runCheck(policy, ctx);
    if (outcome.ok) continue;
    const effectiveWarn = policy.severity === "warn" || ctx.actor === "ceo";
    const note: ViolationNote = {
      policyId: policy.id,
      detail:
        ctx.actor === "ceo" && policy.severity === "block"
          ? `${outcome.detail} (CEO order — recorded, not blocked; §27)`
          : outcome.detail,
      severity: policy.severity,
    };
    await recordViolation({
      runId: ctx.runId ?? null,
      policyId: policy.id,
      gate: "pre",
      detail: note.detail,
      action: effectiveWarn ? "warned" : "rejected",
    });
    if (effectiveWarn) {
      warnings.push(note);
      continue;
    }
    // §6: first block failure ends the gate — the run is never born.
    return { verdict: "REJECT", reason: outcome.detail, violations: [note] };
  }

  const inject = await resolveProjectPurpose(ctx);
  return { verdict: "PASS", warnings, inject };
}
