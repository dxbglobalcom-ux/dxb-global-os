// Runtime rules (§6): the hook library MONITORS the in-run limits and records
// violations; the KILL decision belongs to the runner alone (single kill
// authority — no second brain). runtimeLimits() is what dispatch injects into
// the runner at spawn (E10.2).
import { sql } from "kysely";
import { getDb } from "@dxb/shared";
import { recordViolation, resolveEscalationChain } from "./violations.js";
import type { HookCtx, RuntimeLimits } from "./types.js";

async function setting<T>(key: string, fallback: T): Promise<T> {
  try {
    const res = await sql<{ v: unknown }>`SELECT resolve_setting(${key}) AS v`.execute(getDb());
    const v = res.rows[0]?.v;
    return v === null || v === undefined ? fallback : (v as T);
  } catch {
    return fallback;
  }
}

export async function runtimeLimits(ctx: HookCtx): Promise<RuntimeLimits> {
  return {
    enabled: await setting<boolean>("hook.enabled", false),
    tokenBudget:
      ctx.task.budgetMaxTokens ??
      (await setting<number>("hook.run_token_budget_default", 200_000)),
    maxSpawnDepth: await setting<number>("orchestration.max_spawn_depth", 3),
    requireSpawnRationale: true, // std 6 — not configurable per employee (§13)
    contextSummaryThreshold: await setting<number>("hook.context_summary_threshold", 0.8),
    escalationConfidenceThreshold: await setting<number>(
      "hook.escalation_confidence_threshold",
      0.4,
    ),
    escalationChain: await resolveEscalationChain(ctx.employee.department),
    maxRevisionRounds: await setting<number>("orchestration.max_revision_rounds", 2),
  };
}

/** std 6 spawn rule — called before a sub-agent dispatch: rationale mandatory,
 *  depth limited. A failure is a policy rejection (ORCHESTRATION §6: no retry). */
export async function checkSpawn(
  ctx: HookCtx,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const limits = await runtimeLimits(ctx);
  if (!ctx.spawnRationale?.trim()) {
    const detail = "sub-agent spawn without a rationale (std 6 — sebepsiz devir)";
    await recordViolation({
      runId: ctx.runId ?? null,
      policyId: "std.spawn_discipline",
      gate: "runtime",
      detail,
      action: ctx.actor === "ceo" ? "warned" : "rejected",
    });
    if (ctx.actor !== "ceo") return { ok: false, reason: detail };
  }
  if ((ctx.spawnDepth ?? 0) >= limits.maxSpawnDepth) {
    const detail = `spawn depth ${ctx.spawnDepth} reaches the limit ${limits.maxSpawnDepth} (ORCHESTRATION §6)`;
    await recordViolation({
      runId: ctx.runId ?? null,
      policyId: "std.spawn_discipline",
      gate: "runtime",
      detail,
      action: ctx.actor === "ceo" ? "warned" : "rejected",
    });
    if (ctx.actor !== "ceo") return { ok: false, reason: detail };
  }
  return { ok: true };
}

/** std 5 token monitor — WARN only; the hard stop is COST_CONTROL's. */
export async function monitorTokens(
  ctx: HookCtx,
  usedTokens: number,
): Promise<{ exceeded: boolean; budget: number }> {
  const limits = await runtimeLimits(ctx);
  if (usedTokens <= limits.tokenBudget) return { exceeded: false, budget: limits.tokenBudget };
  await recordViolation({
    runId: ctx.runId ?? null,
    policyId: "std.token_budget",
    gate: "runtime",
    detail: `run used ${usedTokens} tokens against a budget of ${limits.tokenBudget} (hard-stop authority: COST_CONTROL)`,
    action: "warned",
  });
  return { exceeded: true, budget: limits.tokenBudget };
}

/** std 10 context monitor — over the threshold the rule demands a summary /
 *  memory-router reload; the hook records, the runner acts. */
export async function monitorContext(
  ctx: HookCtx,
  usageRatio: number,
): Promise<{ reloadRequired: boolean; threshold: number }> {
  const limits = await runtimeLimits(ctx);
  if (usageRatio <= limits.contextSummaryThreshold) {
    return { reloadRequired: false, threshold: limits.contextSummaryThreshold };
  }
  await recordViolation({
    runId: ctx.runId ?? null,
    policyId: "std.context_integrity",
    gate: "runtime",
    detail: `context usage ${(usageRatio * 100).toFixed(0)}% is over the ${(limits.contextSummaryThreshold * 100).toFixed(0)}% summary threshold — reload from memory-router (std 10)`,
    action: "warned",
  });
  return { reloadRequired: true, threshold: limits.contextSummaryThreshold };
}

/** std 13 — confidence under the threshold MUST escalate (§7). The caller
 *  (runner/post-gate) walks the chain; this check only detects the duty. */
export async function checkConfidence(
  ctx: HookCtx,
  confidence: number,
): Promise<{ escalationRequired: boolean; threshold: number }> {
  const limits = await runtimeLimits(ctx);
  if (confidence >= limits.escalationConfidenceThreshold) {
    return { escalationRequired: false, threshold: limits.escalationConfidenceThreshold };
  }
  await recordViolation({
    runId: ctx.runId ?? null,
    policyId: "std.escalation_required",
    gate: "runtime",
    detail: `self-assessed confidence ${confidence} is under the ${limits.escalationConfidenceThreshold} threshold — escalation is mandatory (std 13)`,
    action: "escalated",
  });
  return { escalationRequired: true, threshold: limits.escalationConfidenceThreshold };
}
