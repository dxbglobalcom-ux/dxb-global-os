// Escalation ladder — ORCH-03: deterministic CODE over the append-only event
// log. Nothing here is an LLM decision (LOCKED, master-plan PHASE-05 §3):
//
//   fail_count(task) = task_events WHERE event='transition' AND to_status='failed'
//   0→first-assignment tier | 1→same-tier retry | 2→specialist (one tier up)
//   3→head review (L2) | 4→Fable final (L1) | beyond→'blocked' report to the CEO
//   low-confidence: a worker result with confidence < 0.6 counts as a fail
//   U15 D5 adaptation (2026-07-25): rung 1 for a LOW-CONFIDENCE fail bumps
//   the tier ('low-confidence-bump') instead of retrying the same tier —
//   remediation-note block 6; plain failures keep the LOCKED map.
//
// fail_count derives ONLY from task_events (UPDATE/DELETE revoked — the count
// can rise, never fall: T-05-14). No counter table exists and none may be
// added. The hard stop after fail 5 makes infinite retry structurally
// impossible (T-05-13); the terminal path REQUIRES a feedback report + an
// audit_log row — never a silent drop (T-05-15). Rule changes are FABLE-ONLY.
import { sql, type Kysely } from "kysely";
import type { DB } from "@dxb/shared";
import { logDecision } from "@dxb/observability";

const ACTOR = "orchestrator:escalate";
const LOW_CONFIDENCE = 0.6; // LOCKED threshold
const TIERS = ["L1", "L2", "L3", "L4"] as const; // L1 strongest

export type LadderAction =
  | { kind: "none" } // 0 fails — task is on its first-assignment tier
  | { kind: "requeue"; ladder: "retry-same-tier"; tier: "same" }
  | { kind: "requeue"; ladder: "specialist"; tier: "bump" }
  // U15 D5 adaptation: rung-1 substitute when the last fail was low-confidence
  | { kind: "requeue"; ladder: "low-confidence-bump"; tier: "bump" }
  | { kind: "requeue"; ladder: "head-review"; tier: "L2" }
  | { kind: "requeue"; ladder: "fable-final"; tier: "L1" }
  | { kind: "blocked" };

/** The LOCKED ladder as a pure map — diffable against PHASE-05 §3, no DB. */
export function ladderAction(failCount: number): LadderAction {
  if (failCount <= 0) return { kind: "none" };
  if (failCount === 1) return { kind: "requeue", ladder: "retry-same-tier", tier: "same" };
  if (failCount === 2) return { kind: "requeue", ladder: "specialist", tier: "bump" };
  if (failCount === 3) return { kind: "requeue", ladder: "head-review", tier: "L2" };
  if (failCount === 4) return { kind: "requeue", ladder: "fable-final", tier: "L1" };
  return { kind: "blocked" };
}

/** One tier up (stronger model); L1 is the ceiling. Pure, unit-testable. */
export function bumpTier(tier: string): string {
  const i = TIERS.indexOf(tier as (typeof TIERS)[number]);
  return i <= 0 ? "L1" : TIERS[i - 1];
}

/** Monotonic fail count — read straight off the append-only log. */
export async function failCount(db: Kysely<DB>, taskId: string): Promise<number> {
  const row = await db
    .selectFrom("task_events")
    .select(({ fn }) => fn.countAll<string>().as("n"))
    .where("task_id", "=", taskId)
    .where("event", "=", "transition")
    .where("to_status", "=", "failed")
    .executeTakeFirstOrThrow();
  return Number(row.n);
}

export type EscalateResult =
  | { action: "none"; failCount: number }
  | { action: "requeued"; ladder: string; failCount: number; modelTier: string }
  | { action: "blocked"; failCount: number; alreadyBlocked: boolean };

async function appendEvent(
  db: Kysely<DB>,
  taskId: string,
  event: string,
  from: string,
  to: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await db
    .insertInto("task_events")
    .values({
      task_id: taskId,
      event,
      from_status: from,
      to_status: to,
      actor: ACTOR,
      payload: JSON.stringify(payload),
    })
    .execute();
}

// Low-confidence rule (LOCKED): a review whose worker self-reported
// confidence < 0.6 is converted into a real failed transition BEFORE counting,
// so fail_count stays derived from events only — no shadow state.
async function convertLowConfidence(
  db: Kysely<DB>,
  taskId: string,
  status: string,
): Promise<void> {
  if (status !== "review") return;
  const reviewEvent = await db
    .selectFrom("task_events")
    .select("payload")
    .where("task_id", "=", taskId)
    .where("event", "=", "transition")
    .where("to_status", "=", "review")
    .orderBy("id", "desc")
    .executeTakeFirst();
  const confidence = (reviewEvent?.payload as { confidence?: number } | null)?.confidence;
  if (typeof confidence !== "number" || confidence >= LOW_CONFIDENCE) return;

  const updated = await db
    .updateTable("tasks")
    .set({ status: "failed", updated_at: sql`now()` })
    .where("id", "=", taskId)
    .where("status", "=", "review")
    .returning("id")
    .executeTakeFirst();
  if (!updated) return; // lost a race — someone else moved the task; count as-is
  await appendEvent(db, taskId, "transition", "review", "failed", {
    reason: "low-confidence",
    confidence,
  });
}

// Terminal path: no requeue, ever. The blocked report is the CEO-visible
// artifact — tasks.feedback (human-readable) + one audit_log row.
async function blockTask(
  db: Kysely<DB>,
  task: { id: string; objective: string },
  n: number,
): Promise<EscalateResult> {
  const existing = await db
    .selectFrom("audit_log")
    .select("id")
    .where("task_id", "=", task.id)
    .where("action", "=", "task.blocked")
    .executeTakeFirst();
  if (existing) return { action: "blocked", failCount: n, alreadyBlocked: true };

  const failEvents = await db
    .selectFrom("task_events")
    .select(["payload", "created_at"])
    .where("task_id", "=", task.id)
    .where("event", "=", "transition")
    .where("to_status", "=", "failed")
    .orderBy("id")
    .execute();
  const failures = failEvents.map((e, i) => {
    const p = e.payload as { error?: string; reason?: string } | null;
    return `${i + 1}. ${p?.error ?? p?.reason ?? "unknown failure"}`;
  });
  const report = [
    `BLOCKED after ${n} failures — escalation ladder exhausted (hard stop).`,
    `Task: ${task.id}`,
    `Objective: ${task.objective}`,
    "Failure history:",
    ...failures,
    "No further automatic retries will occur. CEO decision required.",
  ].join("\n");

  await db
    .updateTable("tasks")
    .set({ feedback: report, updated_at: sql`now()` })
    .where("id", "=", task.id)
    .execute();
  await db
    .insertInto("audit_log")
    .values({
      actor: ACTOR,
      actor_type: "system",
      action: "task.blocked",
      task_id: task.id,
      payload: JSON.stringify({ fail_count: n, failures }),
    })
    .execute();
  await appendEvent(db, task.id, "blocked", "failed", "failed", {
    ladder: "blocked",
    fail_count: n,
  });
  // §10 "workflow adım dallanması / escalation": the terminal rung is a CEO
  // escalation — the loudest decision the ladder can take.
  await logDecision(
    {
      runId: null,
      decidedBy: ACTOR,
      decision: "escalation",
      rationale: `hard stop after ${n} failures — ladder exhausted, blocked report written for the CEO`,
      dataUsed: ["task_events", "tasks"],
      alternatives: { rejected: "another requeue", reason: "fail_count past the LOCKED ladder (T-05-13)" },
      confidence: null,
      risk: "high",
    },
    { outcome: "blocked", taskId: task.id },
  );
  return { action: "blocked", failCount: n, alreadyBlocked: false };
}

/**
 * Apply one LOCKED ladder step to a task. Idempotent and race-safe: only a
 * task sitting in 'failed' (or a low-confidence 'review', which is converted
 * first) moves; anything else is a no-op. Every action appends its event.
 */
export async function escalate(db: Kysely<DB>, taskId: string): Promise<EscalateResult> {
  const task = await db
    .selectFrom("tasks")
    .select(["id", "status", "model_tier", "objective"])
    .where("id", "=", taskId)
    .executeTakeFirstOrThrow();

  await convertLowConfidence(db, taskId, task.status);

  const n = await failCount(db, taskId);
  let step = ladderAction(n);
  if (step.kind === "none") return { action: "none", failCount: n };
  if (step.kind === "blocked") return blockTask(db, task, n);

  // U15 D5 registered adaptation (2026-07-25, remediation-note block 6
  // authority): a LOW-CONFIDENCE fail is never retried on the same tier —
  // the same worker at the same tier reproduces the same confidence
  // (measured 2026-07-17: 0.42 → retry-same-tier ×5 → blocked, 10 tasks in
  // one day). Rung 1 escalates the tier for low-confidence fails only;
  // plain execution failures keep the LOCKED retry-same-tier rung, and the
  // fail-count arithmetic (T-05-13/14) is untouched.
  if (step.kind === "requeue" && step.tier === "same") {
    const lastFail = await db
      .selectFrom("task_events")
      .select("payload")
      .where("task_id", "=", taskId)
      .where("event", "=", "transition")
      .where("to_status", "=", "failed")
      .orderBy("id", "desc")
      .executeTakeFirst();
    const reason = (lastFail?.payload as { reason?: string } | null)?.reason;
    if (reason === "low-confidence") {
      step = { kind: "requeue", ladder: "low-confidence-bump", tier: "bump" };
    }
  }

  const nextTier =
    step.tier === "same" ? task.model_tier : step.tier === "bump" ? bumpTier(task.model_tier) : step.tier;

  const updated = await db
    .updateTable("tasks")
    .set({
      status: "queued",
      model_tier: nextTier,
      claimed_by: null,
      claimed_at: null,
      lease_expires_at: null,
      updated_at: sql`now()`,
    })
    .where("id", "=", taskId)
    .where("status", "=", "failed")
    .returning("id")
    .executeTakeFirst();
  if (!updated) return { action: "none", failCount: n }; // not failed → nothing to escalate

  await appendEvent(db, taskId, "transition", "failed", "queued", {
    ladder: step.ladder,
    fail_count: n,
    model_tier: nextTier,
  });
  // §10 "workflow adım dallanması (retry/fallback/escalate tercihi)": which
  // rung fired and why — deterministic LOCKED code, so confidence is null and
  // the alternatives are the other rungs the fail count ruled out.
  await logDecision(
    {
      runId: null,
      decidedBy: ACTOR,
      decision: "escalation",
      rationale: `fail_count=${n} → ladder '${step.ladder}': requeued at tier ${nextTier} (was ${task.model_tier})`,
      dataUsed: ["task_events", "tasks"],
      alternatives: {
        ladder_map: "0 none · 1 retry-same-tier · 2 specialist · 3 head-review · 4 fable-final · 5+ blocked",
      },
      confidence: null,
      risk: n >= 3 ? "medium" : "low",
    },
    { taskId },
  );
  return { action: "requeued", ladder: step.ladder, failCount: n, modelTier: nextTier };
}
