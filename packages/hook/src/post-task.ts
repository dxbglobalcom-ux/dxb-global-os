// Post-task gate (§6): the evidence package {output, evidence[],
// acceptance_map} is audited MECHANICALLY (row exists / schema fits — no LLM
// call; the sampled deep-quality audit is a separate HR run, madde 9).
// Verdicts: PASS → the run may close · REVISE → feedback round (limit
// ORCHESTRATION §19) · ESCALATE → §7 chain + approval item. std 9 lock: a run
// can NEVER be 'succeeded' without a PASS from here — the runner enforces,
// this gate decides.
import { sql } from "kysely";
import { getDb } from "@dxb/shared";
import { ensureResearchOnShelf } from "./knowledge-shelf.js";
import { gatePolicies, loadPolicies } from "./policies.js";
import { escalate, recordViolation } from "./violations.js";
import { runtimeLimits } from "./runtime.js";
import type {
  HookCtx,
  HookPolicyRow,
  PostTaskResult,
  PostVerdict,
  ViolationNote,
} from "./types.js";

type CheckOutcome = { ok: true } | { ok: false; detail: string };

function outputPresent(output: unknown): boolean {
  if (output == null) return false;
  if (typeof output === "string") return output.trim().length > 0;
  if (typeof output === "object") return Object.keys(output as object).length > 0;
  return true;
}

async function runCheck(
  policy: HookPolicyRow,
  ctx: HookCtx,
  result: PostTaskResult,
): Promise<CheckOutcome> {
  const check = String(policy.rule.check);
  const map = result.acceptanceMap ?? {};
  const entries = Object.entries(map);
  switch (check) {
    case "acceptance_coverage": {
      const direction = String(policy.rule.direction ?? "criteria");
      if (direction === "criteria") {
        // std 4: every acceptance criterion has an answer.
        if (entries.length === 0) {
          return { ok: false, detail: "acceptance_map is empty — no criterion is answered (std 4)" };
        }
        const unanswered = entries.filter(([, v]) => !v?.trim()).map(([k]) => k);
        return unanswered.length === 0
          ? { ok: true }
          : { ok: false, detail: `criteria without an answer: ${unanswered.join(", ")} (std 4)` };
      }
      if (direction === "depth") {
        // std 2: answers must be non-trivial (mechanical depth proxy).
        const shallow = entries.filter(([, v]) => (v?.trim().length ?? 0) < 10).map(([k]) => k);
        return shallow.length === 0
          ? { ok: true }
          : { ok: false, detail: `shallow answers (<10 chars) for: ${shallow.join(", ")} (std 2)` };
      }
      // std 16 'output': a mapped delivery must actually exist.
      if (entries.length > 0 && !outputPresent(result.output)) {
        return { ok: false, detail: "acceptance_map claims answers but the output is empty (std 16)" };
      }
      return { ok: true };
    }
    case "evidence_present": {
      const min = Number(policy.rule.min_evidence ?? 1);
      return (result.evidence?.length ?? 0) >= min
        ? { ok: true }
        : { ok: false, detail: `unverified_done: 'done' claimed with ${result.evidence?.length ?? 0} evidence item(s), minimum ${min} (std 7)` };
    }
    case "verification_evidence": {
      const verifications = (result.evidence ?? []).filter((e) => e.kind === "verification");
      if (verifications.length === 0) {
        return { ok: false, detail: "no verification-kind evidence — was the work verified? (std 15)" };
      }
      if (policy.rule.tool_call_proof && ctx.runId) {
        // The proof must exist in tool_calls (kanıt tool_calls'ta).
        const ids = verifications.map((e) => e.toolCallId).filter((id): id is string => !!id);
        if (ids.length === 0) {
          return { ok: false, detail: "verification evidence carries no tool_calls reference (std 15)" };
        }
        const res = await sql<{ n: number }>`
          SELECT count(*)::int AS n FROM tool_calls
           WHERE id = ANY(${ids}::bigint[]) AND run_id = ${ctx.runId}`.execute(getDb());
        return (res.rows[0]?.n ?? 0) > 0
          ? { ok: true }
          : { ok: false, detail: "referenced verification tool_calls rows do not exist for this run (std 15)" };
      }
      return { ok: true };
    }
    case "output_schema": {
      return outputPresent(result.output)
        ? { ok: true }
        : { ok: false, detail: "output is empty or missing — incomplete delivery (std 8)" };
    }
    case "decision_rationale": {
      const claimed = result.decisionsClaimed ?? 0;
      if (claimed === 0 || !ctx.runId) return { ok: true };
      const res = await sql<{ n: number }>`
        SELECT count(*)::int AS n FROM decision_log WHERE run_id = ${ctx.runId}`.execute(getDb());
      return (res.rows[0]?.n ?? 0) >= claimed
        ? { ok: true }
        : {
            ok: false,
            detail: `${claimed} decision(s) claimed but only ${res.rows[0]?.n ?? 0} decision_log row(s) exist for the run (std 14)`,
          };
    }
    case "memory_evidence": {
      if (!ctx.task.requiresMemory) return { ok: true };
      const hasMemory =
        result.memoryWritten === true ||
        (result.evidence ?? []).some((e) => e.kind === "memory");
      return hasMemory
        ? { ok: true }
        : { ok: false, detail: "task requires a memory write but no memory evidence exists (std 17)" };
    }
    case "gate_lock":
      // std 9 is THIS gate: the lock is enforced by the runner refusing
      // 'succeeded' without a PASS verdict — nothing to check inside.
      return { ok: true };
    case "library_registration": {
      // R4.2 knowledge-shelf (HOLDING_LIBRARY A9): research tasks must
      // deliver a report artifact, and the report must land on the shelf.
      let marker: RegExp;
      try {
        marker = new RegExp(String(policy.rule.pattern ?? "\\bresearch\\b"), "iu");
      } catch {
        return { ok: false, detail: `invalid_policy: bad pattern in ${policy.id}` };
      }
      const field = String(policy.rule.match_field ?? "output_contract");
      const text =
        field === "objective" ? (ctx.task.objective ?? "") : (ctx.task.outputContract ?? "");
      if (!marker.test(text)) return { ok: true };
      const report = (result.evidence ?? []).find((e) => e.kind === "file" && !!e.ref);
      if (!report) {
        return {
          ok: false,
          detail:
            "research task closed without a report artifact (file-kind evidence with ref) — no research without report (knowledge-shelf)",
        };
      }
      const failure = await ensureResearchOnShelf(ctx, String(report.ref));
      return failure === null ? { ok: true } : { ok: false, detail: failure };
    }
    default:
      return { ok: false, detail: `invalid_policy: unknown check '${check}'` };
  }
}

export async function postTask(ctx: HookCtx, result: PostTaskResult): Promise<PostVerdict> {
  let load;
  try {
    load = await loadPolicies();
  } catch (err) {
    // §17 fail-closed: without policies the gate cannot PASS the run.
    console.error("[hook] FAIL-CLOSED — post-gate policies unreachable:", err);
    return {
      verdict: "REVISE",
      feedback: ["hook_unavailable: policies unreachable — the run cannot close until the hook recovers"],
      violations: [],
    };
  }

  const violations: ViolationNote[] = [];
  const warnings: ViolationNote[] = [];

  // §17: broken post policies reject the gate (never silently skipped).
  for (const broken of load.invalid.filter((p) => p.gate === "post")) {
    violations.push({
      policyId: broken.id,
      detail: `invalid_policy: rule JSON of ${broken.id} is not a machine-readable rule`,
      severity: "block",
    });
  }

  for (const policy of gatePolicies(load, "post")) {
    const outcome = await runCheck(policy, ctx, result);
    if (outcome.ok) continue;
    const note: ViolationNote = {
      policyId: policy.id,
      detail: outcome.detail,
      severity: policy.severity,
    };
    if (policy.severity === "warn" || ctx.actor === "ceo") warnings.push(note);
    else violations.push(note);
  }

  // §27: the CEO is never blocked — warn + audit, single human authority.
  if (ctx.actor === "ceo" && violations.length === 0 && warnings.length > 0) {
    for (const w of warnings) {
      await recordViolation({
        runId: ctx.runId ?? null,
        policyId: w.policyId,
        gate: "post",
        detail: `${w.detail} (CEO order — recorded, not blocked; §27)`,
        action: "warned",
      });
    }
    return { verdict: "PASS", warnings };
  }

  if (violations.length === 0) {
    for (const w of warnings) {
      await recordViolation({
        runId: ctx.runId ?? null,
        policyId: w.policyId,
        gate: "post",
        detail: w.detail,
        action: "warned",
      });
    }
    return { verdict: "PASS", warnings };
  }

  const limits = await runtimeLimits(ctx);
  const round = ctx.revisionRound ?? 0;
  const feedback = violations.map((v) => `${v.policyId}: ${v.detail}`);

  if (round < limits.maxRevisionRounds) {
    for (const v of violations) {
      await recordViolation({
        runId: ctx.runId ?? null,
        policyId: v.policyId,
        gate: "post",
        detail: `revision round ${round + 1}/${limits.maxRevisionRounds}: ${v.detail}`,
        action: "revised",
      });
    }
    return { verdict: "REVISE", feedback, violations };
  }

  // Revision limit exhausted → §7 chain.
  const violationIds: Array<number | null> = [];
  for (const v of violations) {
    violationIds.push(
      await recordViolation({
        runId: ctx.runId ?? null,
        policyId: v.policyId,
        gate: "post",
        detail: `revision limit ${limits.maxRevisionRounds} exhausted: ${v.detail}`,
        action: "escalated",
      }),
    );
  }
  const { chain, approvalId } = await escalate(ctx, violationIds, feedback);
  return { verdict: "ESCALATE", chain, approvalId, feedback, violations };
}
