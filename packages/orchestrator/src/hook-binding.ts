// E10.2 — spawn-path hook binding (FABLE_5_HOOK_SPEC §3: orchestrator.dispatch
// is where the hook wraps the run lifecycle). This module is dispatch-side
// GLUE only: it assembles a HookCtx from the claimed task's REAL rows, stamps
// agents.hook_version on a passed pre-gate (the roadmap acceptance), and
// folds gate verdicts into the hook_result summary the run closure persists
// (§14) and ops:live surfaces (§9). The gates themselves live in @dxb/hook —
// no policy logic is duplicated here.
//
// Flag family (§22): `hook.enabled` resolves per employee → global. Flag OFF
// = the old dispatch path, but NEVER silently: every flag-off spawn raises an
// 'attention' alert (dedup 'hook:disabled') — a hook-less production state is
// temporary and visible, by spec.
import { sql } from "kysely";
import { getDb } from "@dxb/shared";
import type {
  EvidenceItem,
  HookCtx,
  PostTaskResult,
  PostVerdict,
  PreVerdict,
} from "@dxb/hook";

/** FABLE_5_HOOK current version — the HR factory stamps the same literal
 *  (20260712008000 step 3); a version bump moves BOTH in one change. */
export const CURRENT_HOOK_VERSION = "v1";

/** §22: flag read. Employee scope first (resolve_setting chain), global after.
 *  A failed read resolves to ENABLED — the fail-closed direction: the gates
 *  behind it degrade safely (preTask itself rejects when the DB is gone). */
export async function hookEnabled(employeeId: string | null): Promise<boolean> {
  try {
    const res = await sql<{ v: unknown }>`
      SELECT resolve_setting('hook.enabled', ${employeeId}::uuid) AS v
    `.execute(getDb());
    return res.rows[0]?.v === true;
  } catch (err) {
    console.error("[hook-binding] hook.enabled read failed — assuming ENABLED (fail-closed):", err);
    return true;
  }
}

/** §22 "flag kapalı dönem geçicidir ve alert'lidir": a spawn flowing past a
 *  disabled hook is recorded loudly. Best-effort — never blocks dispatch. */
export async function alertHookDisabled(): Promise<void> {
  try {
    await sql`
      INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                          suggested_action, dedup_key)
      VALUES ('attention', 'hook', 'Hook disabled — spawns are flowing ungated',
              'hook binding', 'settings hook.enabled = false',
              'Re-enable the hook (fn_hook_set_policy governs policies; the flag is the §22 kill-switch). Hook-less production is a temporary state by spec.',
              'hook:disabled')
      ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
      DO NOTHING`.execute(getDb());
  } catch (err) {
    console.error("[hook-binding] hook:disabled alert failed (spawn continues):", err);
  }
}

/** The dispatch-side ctx assembly — every field is a REAL row read, nothing
 *  synthesized: employee from tasks.agent_id, project from tasks.project_id /
 *  milestone chain (A7), hard-stop truth from budget_state (COST_CONTROL). */
export async function assembleHookCtx(task: {
  id: string;
  agent_id?: string | null;
  objective: string;
  output_contract: string;
  budget_max_tokens: number;
  budget_max_cost_eur?: number | string | null;
  project_id?: string | null;
  milestone_id?: string | null;
}): Promise<HookCtx> {
  const db = getDb();

  let employee: HookCtx["employee"] = { id: null };
  if (task.agent_id) {
    const emp = await db
      .selectFrom("agents")
      .select(["id", "slug", "department", "mcp_profile", "manager_id"])
      .where("id", "=", task.agent_id)
      .executeTakeFirst();
    if (emp) {
      employee = {
        id: emp.id,
        slug: emp.slug,
        department: emp.department,
        mcpProfile: emp.mcp_profile,
        managerId: emp.manager_id,
      };
    }
  }

  const hardStop = await sql<{ on: boolean }>`
    SELECT EXISTS (SELECT 1 FROM budget_state WHERE hard_stopped) AS on
  `.execute(db);

  return {
    employee,
    task: {
      id: task.id,
      objective: task.objective,
      outputContract: task.output_contract,
      budgetMaxTokens: task.budget_max_tokens,
      budgetMaxCostEur:
        task.budget_max_cost_eur == null ? null : Number(task.budget_max_cost_eur),
      milestoneId: task.milestone_id ?? null,
    },
    project: task.project_id ? { id: task.project_id } : null,
    budget: { hardStop: hardStop.rows[0]?.on === true, remainingEur: null },
    actor: "system",
  };
}

/** ROADMAP E10.2 acceptance: spawn → agents.hook_version dolu. Idempotent —
 *  writes only when the stamp actually moves (no churn on bound employees). */
export async function stampHookVersion(employeeId: string): Promise<void> {
  await sql`
    UPDATE agents SET hook_version = ${CURRENT_HOOK_VERSION}
     WHERE id = ${employeeId}::uuid
       AND hook_version IS DISTINCT FROM ${CURRENT_HOOK_VERSION}
  `.execute(getDb());
}

// ── §6 evidence package extraction ──────────────────────────────────────────
// The evidence package is EXECUTOR-DECLARED: an executor that verified its
// work returns `evidence` / `acceptance_map` (+ optional `decisions_claimed`,
// `memory_written`) keys on its result object. Extraction is mechanical — the
// binding never invents evidence for an executor that produced none (that is
// exactly the failure std 7 exists to catch).

export function extractEvidencePackage(output: unknown): PostTaskResult {
  const obj =
    output && typeof output === "object" ? (output as Record<string, unknown>) : {};
  const evidence = Array.isArray(obj.evidence) ? (obj.evidence as EvidenceItem[]) : [];
  const acceptanceMap =
    obj.acceptance_map && typeof obj.acceptance_map === "object"
      ? (obj.acceptance_map as Record<string, string>)
      : {};
  return {
    output,
    evidence,
    acceptanceMap,
    decisionsClaimed:
      typeof obj.decisions_claimed === "number" ? obj.decisions_claimed : undefined,
    memoryWritten: obj.memory_written === true ? true : undefined,
  };
}

// ── §14 hook_result summary (persisted at run close, surfaced on ops:live) ──

export interface HookMonitorFlags {
  tokenBudgetExceeded: boolean;
  confidenceEscalationRequired: boolean;
}

export function buildHookResult(args: {
  pre: Extract<PreVerdict, { verdict: "PASS" }>;
  post: PostVerdict | null;
  rounds: number;
  monitors: HookMonitorFlags;
}): Record<string, unknown> {
  const { pre, post, rounds, monitors } = args;
  return {
    hook_version: CURRENT_HOOK_VERSION,
    pre: { verdict: "PASS", warnings: pre.warnings.length },
    post:
      post === null
        ? null
        : {
            verdict: post.verdict,
            violations: post.verdict === "PASS" ? 0 : post.violations.length,
            warnings: post.verdict === "PASS" ? post.warnings.length : 0,
            rounds,
            ...(post.verdict === "ESCALATE"
              ? { chain: post.chain, approval_id: post.approvalId }
              : {}),
          },
    monitors: {
      token_budget_exceeded: monitors.tokenBudgetExceeded,
      confidence_escalation_required: monitors.confidenceEscalationRequired,
    },
  };
}
