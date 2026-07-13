// Workflow runner — WORKFLOW_ENGINE §3/§10/§17-19. A LIBRARY loop, not a
// service: one call advances ONE run from its snapshot, from current_step+1
// to the end, a park, or a failure. The P7 scheduler (single process —
// singleton concurrency is enforced at run creation, §26) drives this from
// the 'workflow.run' pg-boss queue; tests and the dev smoke drive it
// directly. Everything the run does is read from workflow_runs.steps_snapshot
// (§10: the step set frozen at start — editing the workflow NEVER changes a
// run in flight; a step deleted in a later version still finishes here).
import { sql } from "kysely";
import {
  getDb,
  RetryStepConfig,
  FallbackStepConfig,
  StepsSnapshot,
  type WorkflowStep,
} from "@dxb/shared";
import { runAgentStep } from "./steps/agent.js";
import { runApprovalStep } from "./steps/approval.js";
import { runReviewStep } from "./steps/review.js";
import { defaultWorkflowExecutor } from "./executor.js";
import {
  StepError,
  type RunnerDeps,
  type RunOutcome,
  type WorkflowExecutor,
  type WorkflowRow,
  type WorkflowRunRow,
} from "./types.js";

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function loadRun(runId: string): Promise<WorkflowRunRow | undefined> {
  const row = await getDb()
    .selectFrom("workflow_runs")
    .selectAll()
    .where("id", "=", runId)
    .executeTakeFirst();
  if (!row) return undefined;
  return {
    id: row.id,
    workflow_id: row.workflow_id,
    status: row.status,
    triggered_by: row.triggered_by,
    current_step: row.current_step,
    steps_snapshot: StepsSnapshot.parse(row.steps_snapshot),
    started_at: row.started_at as unknown as Date,
  };
}

async function loadWorkflow(id: string): Promise<WorkflowRow> {
  const row = await getDb()
    .selectFrom("workflows")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
  return row as unknown as WorkflowRow;
}

// §17 run-level enforcement, BEFORE each step: budget from agent_runs cost
// (single-source cost rule — LiteLLM writes it in P7), tokens from the same
// rows (LiteLLM run-tagged counter is P7 wiring; ticket adaptation 5),
// timeout on ACTIVE wall-clock — approval park time is subtracted (§10:
// PARK'ta timeout işlemez).
async function enforceLimits(wf: WorkflowRow, run: WorkflowRunRow): Promise<void> {
  const db = getDb();
  const fresh = await db
    .selectFrom("workflow_runs")
    .select("status")
    .where("id", "=", run.id)
    .executeTakeFirstOrThrow();
  if (fresh.status === "cancelled") {
    throw new StepError("run cancelled externally", "policy", "CANCELLED");
  }

  if (wf.budget_eur !== null || wf.token_limit !== null) {
    const usage = await sql<{ cost: string; toks: string }>`
      SELECT COALESCE(SUM(cost_eur), 0)::text AS cost,
             COALESCE(SUM(tokens_in + tokens_out), 0)::text AS toks
        FROM agent_runs WHERE workflow_run_id = ${run.id}::uuid
    `.execute(db);
    const { cost, toks } = usage.rows[0];
    if (wf.budget_eur !== null && Number(cost) > Number(wf.budget_eur)) {
      throw new StepError(
        `run cost ${cost} EUR exceeds workflow budget ${wf.budget_eur} EUR`,
        "fatal",
        "BUDGET_EXCEEDED",
      );
    }
    if (wf.token_limit !== null && Number(toks) > Number(wf.token_limit)) {
      throw new StepError(
        `run tokens ${toks} exceed workflow token_limit ${wf.token_limit}`,
        "fatal",
        "BUDGET_EXCEEDED",
      );
    }
  }

  if (wf.timeout_s !== null) {
    const t = await sql<{ active_s: string }>`
      SELECT (EXTRACT(EPOCH FROM (now() - r.started_at)) - COALESCE((
               SELECT SUM(EXTRACT(EPOCH FROM (a.decided_at - a.created_at)))
                 FROM approvals a
                WHERE a.payload->>'workflow_run_id' = r.id::text
                  AND a.decided_at IS NOT NULL), 0))::text AS active_s
        FROM workflow_runs r WHERE r.id = ${run.id}::uuid
    `.execute(db);
    if (Number(t.rows[0].active_s) > wf.timeout_s) {
      throw new StepError(
        `active runtime exceeds timeout_s=${wf.timeout_s} (approval park excluded)`,
        "fatal",
        "TIMEOUT",
      );
    }
  }
}

// Step close: current_step advances (crash resume = §10) and the step's
// result lands INSIDE the run's snapshot jsonb (registered interpretation:
// the snapshot freezes CONFIG; the runner appending its own `result` per
// completed step is run-record bookkeeping, not definition drift — it is what
// makes a review-after-resume see its predecessor's output).
async function closeStep(
  runId: string,
  stepIndex: number,
  seq: number,
  result: { output: string; confidence: number } | null,
): Promise<void> {
  const db = getDb();
  if (result) {
    await sql`
      UPDATE workflow_runs
         SET current_step = ${seq},
             steps_snapshot = jsonb_set(steps_snapshot, ARRAY[${String(stepIndex)}]::text[],
               (steps_snapshot->${stepIndex}::int) || jsonb_build_object('result',
                 jsonb_build_object('output', ${result.output.slice(0, 4000)}::text,
                                    'confidence', ${result.confidence}::numeric)))
       WHERE id = ${runId}::uuid
    `.execute(db);
  } else {
    await db
      .updateTable("workflow_runs")
      .set({ current_step: seq })
      .where("id", "=", runId)
      .execute();
  }
}

async function failRun(
  wf: WorkflowRow,
  runId: string,
  reason: string,
  message: string,
  raiseAlert: boolean,
): Promise<RunOutcome> {
  const db = getDb();
  await db
    .updateTable("workflow_runs")
    .set({ status: "failed", ended_at: sql`now()` as never })
    .where("id", "=", runId)
    .where("status", "in", ["running", "waiting_approval"])
    .execute();
  if (raiseAlert) {
    // §17 fatal → alert.raised: the alerts-table trigger (E8.4b, the ONE
    // alerts-channel producer) broadcasts this row.
    await db
      .insertInto("alerts")
      .values({
        level: wf.risk === "critical" ? "critical" : "high",
        source: "workflow",
        title: `Workflow '${wf.slug}' run failed (${reason})`,
        probable_cause: message.slice(0, 500),
        suggested_action: "Inspect the run in Live Operations and re-run or fix the workflow definition.",
        affected_area: `workflow:${wf.slug}`,
        source_ref: JSON.stringify({ table: "workflow_runs", id: runId }),
      })
      .execute();
  }
  return { status: "failed", reason };
}

function classify(err: unknown): StepError {
  if (err instanceof StepError) return err;
  const msg = err instanceof Error ? err.message : String(err);
  return new StepError(msg, "transient", "STEP_ERROR"); // §17: unknown = transient
}

// Nearest FOLLOWING policy steps: a retry step governs the step right before
// it; a fallback step (possibly behind the retry) is the alternate chain.
function retryAfter(steps: WorkflowStep[], idx: number) {
  const next = steps[idx + 1];
  return next?.kind === "retry" ? RetryStepConfig.parse(next.config) : null;
}
function fallbackAfter(steps: WorkflowStep[], idx: number) {
  for (let j = idx + 1; j <= idx + 2 && j < steps.length; j++) {
    if (steps[j].kind === "fallback") return FallbackStepConfig.parse(steps[j].config);
    if (steps[j].kind !== "retry") break;
  }
  return null;
}

async function runFallbackChain(
  wf: WorkflowRow,
  run: WorkflowRunRow,
  alternates: { kind: "agent" | "review"; config: Record<string, unknown> }[],
  executor: WorkflowExecutor,
  lastOutput: string,
): Promise<{ output: string; confidence: number }> {
  let out: { output: string; confidence: number } | null = null;
  for (const alt of alternates) {
    if (alt.kind === "agent") {
      out = await runAgentStep({ wf, run, config: alt.config, executor });
    } else {
      const verdict = await runReviewStep({
        wf,
        run,
        config: alt.config,
        executor,
        previousOutput: out?.output ?? lastOutput,
      });
      if (!verdict.pass) {
        throw new StepError(
          `fallback review failed (confidence ${verdict.confidence})`,
          "fatal",
          "FALLBACK_REVIEW_FAILED",
        );
      }
      out = { output: verdict.output, confidence: verdict.confidence };
    }
  }
  if (!out) throw new StepError("fallback chain produced no output", "fatal", "FALLBACK_EMPTY");
  return out;
}

// One attempt-with-policies unit: the main work fn under the retry step's
// policy (§18), falling to the fallback step's alternate chain (§19).
async function attemptWithPolicies(
  wf: WorkflowRow,
  run: WorkflowRunRow,
  steps: WorkflowStep[],
  idx: number,
  fn: () => Promise<{ output: string; confidence: number }>,
  executor: WorkflowExecutor,
  lastOutput: string,
  sleep: (ms: number) => Promise<void>,
): Promise<{ output: string; confidence: number }> {
  const retry = retryAfter(steps, idx);
  const attempts = retry?.max_attempts ?? 1;
  let lastErr: StepError | null = null;

  for (let a = 1; a <= attempts; a++) {
    try {
      return await fn();
    } catch (err) {
      const e = classify(err);
      if (e.cls !== "transient") throw e; // policy/fatal never retried (§17)
      lastErr = e;
      if (a < attempts && retry && retry.backoff_s > 0) await sleep(retry.backoff_s * 1000);
    }
  }

  const onExhaust = retry?.on_exhaust ?? "fail";
  if (onExhaust === "fallback") {
    const fb = fallbackAfter(steps, idx);
    if (fb) return runFallbackChain(wf, run, fb.alternate_steps as never, executor, lastOutput);
    throw new StepError(
      `retry exhausted and no fallback step follows: ${lastErr?.message}`,
      "fatal",
      "RETRY_EXHAUSTED",
    );
  }
  if (onExhaust === "escalate") {
    throw new StepError(
      `retry exhausted, escalating: ${lastErr?.message}`,
      "policy",
      "ESCALATED",
    );
  }
  throw new StepError(
    `step failed after ${attempts} attempt(s): ${lastErr?.message}`,
    "fatal",
    "RETRY_EXHAUSTED",
  );
}

/** Advance one run to completion / park / failure. Idempotent on terminal runs. */
export async function runWorkflowRun(
  runId: string,
  deps: RunnerDeps = {},
): Promise<RunOutcome> {
  const executor = deps.executor ?? defaultWorkflowExecutor;
  const sleep = deps.sleep ?? defaultSleep;
  const db = getDb();

  const run = await loadRun(runId);
  if (!run) return { status: "skipped", reason: "run not found" };
  if (run.status !== "running") return { status: "skipped", reason: `status=${run.status}` };
  const wf = await loadWorkflow(run.workflow_id);

  const steps = [...run.steps_snapshot].sort((a, b) => a.seq - b.seq);
  const done = run.current_step ?? 0;
  // resume: the last agent/review output recovered from the snapshot results
  let lastOutput = "";
  for (const s of steps) {
    if (s.seq <= done) {
      const r = (s as { result?: { output?: string } }).result;
      if (r?.output) lastOutput = r.output;
    }
  }

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.seq <= done) continue;

      await enforceLimits(wf, run);

      if (step.kind === "retry" || step.kind === "fallback") {
        // policy steps are consumed by their neighbours; reaching one in the
        // normal (success) flow is a no-op pass-through
        await closeStep(run.id, i, step.seq, null);
        continue;
      }

      if (step.kind === "approval") {
        const { approvalId } = await runApprovalStep({
          wf,
          run,
          config: step.config,
          stepSeq: step.seq,
        });
        await db
          .updateTable("workflow_runs")
          .set({ status: "waiting_approval", current_step: step.seq })
          .where("id", "=", run.id)
          .where("status", "=", "running")
          .execute();
        return { status: "waiting_approval", approvalId, stepSeq: step.seq };
      }

      if (step.kind === "agent") {
        const out = await attemptWithPolicies(
          wf, run, steps, i,
          () => runAgentStep({ wf, run, config: step.config, executor }),
          executor, lastOutput, sleep,
        );
        lastOutput = out.output;
        await closeStep(run.id, i, step.seq, out);
        continue;
      }

      // review
      const verdict = await runReviewStep({
        wf, run,
        config: step.config,
        executor,
        previousOutput: lastOutput,
      });
      if (verdict.pass) {
        await closeStep(run.id, i, step.seq, {
          output: verdict.output,
          confidence: verdict.confidence,
        });
        continue;
      }

      // §19 review fail → structured action (default escalate)
      if (verdict.onFail === "fail") {
        throw new StepError(
          `review step ${step.seq} failed (confidence ${verdict.confidence}): ${verdict.output}`,
          "fatal",
          "REVIEW_FAILED",
        );
      }
      if (verdict.onFail === "escalate") {
        throw new StepError(
          `review step ${step.seq} escalated (confidence ${verdict.confidence}): ${verdict.output}`,
          "policy",
          "REVIEW_ESCALATED",
        );
      }
      if (verdict.onFail === "retry_prev") {
        // one re-attempt of the previous agent step, then one re-review
        const prev = steps.slice(0, i).reverse().find((s) => s.kind === "agent");
        if (!prev) {
          throw new StepError("retry_prev with no previous agent step", "fatal", "REVIEW_FAILED");
        }
        const redo = await runAgentStep({ wf, run, config: prev.config, executor });
        const second = await runReviewStep({
          wf, run, config: step.config, executor, previousOutput: redo.output,
        });
        if (!second.pass) {
          throw new StepError(
            `review step ${step.seq} failed after retry_prev (confidence ${second.confidence})`,
            "fatal",
            "REVIEW_FAILED",
          );
        }
        lastOutput = redo.output;
        await closeStep(run.id, i, step.seq, {
          output: second.output,
          confidence: second.confidence,
        });
        continue;
      }
      // fallback
      const fb = fallbackAfter(steps, i);
      if (!fb) {
        throw new StepError(
          `review on_fail=fallback but no fallback step follows step ${step.seq}`,
          "fatal",
          "REVIEW_FAILED",
        );
      }
      const alt = await runFallbackChain(wf, run, fb.alternate_steps as never, executor, lastOutput);
      lastOutput = alt.output;
      await closeStep(run.id, i, step.seq, alt);
    }

    await db
      .updateTable("workflow_runs")
      .set({ status: "succeeded", ended_at: sql`now()` as never })
      .where("id", "=", run.id)
      .where("status", "=", "running")
      .execute();
    return { status: "succeeded" };
  } catch (err) {
    const e = classify(err);
    if (e.reason === "CANCELLED") return { status: "cancelled" };
    // policy escalation and fatal both end the run; both are CEO-visible via
    // an alerts row (FABLE_5_HOOK escalation chain adopts the policy leg in
    // its own phase — recorded boundary). Approval rejection is a human
    // decision, not an alarm (adaptation 2) — handled in the drain, not here.
    return failRun(wf, run.id, e.reason, e.message, true);
  }
}

export interface DrainResult {
  processed: number;
  resumed: number;
  rejected: number;
  outcomes: { runId: string; outcome: RunOutcome }[];
}

// Row-state pickup (ticket adaptation 1 — intent-intake emsal): 'running'
// runs advance; PARKED runs whose approvals row got decided resume (approved)
// or fail (rejected) — the LOCKED 0015 decision fn stays untouched
// (adaptation 2). The P7 scheduler chains this off pg-boss; tests and the
// §24 smoke call it directly.
export async function drainWorkflowRuns(deps: RunnerDeps = {}): Promise<DrainResult> {
  const db = getDb();
  const result: DrainResult = { processed: 0, resumed: 0, rejected: 0, outcomes: [] };

  const decided = await sql<{ id: string; workflow_id: string; decision: string }>`
    SELECT r.id, r.workflow_id, a.status AS decision
      FROM workflow_runs r
      JOIN LATERAL (
        SELECT status FROM approvals
         WHERE payload->>'workflow_run_id' = r.id::text
           AND (payload->>'step_seq')::int = r.current_step
           AND status IN ('approved','rejected')
         ORDER BY created_at DESC LIMIT 1
      ) a ON true
     WHERE r.status = 'waiting_approval'
  `.execute(db);

  for (const row of decided.rows) {
    if (row.decision === "approved") {
      await db
        .updateTable("workflow_runs")
        .set({ status: "running" })
        .where("id", "=", row.id)
        .where("status", "=", "waiting_approval")
        .execute();
      result.resumed++;
    } else {
      const wf = await loadWorkflow(row.workflow_id);
      await failRun(wf, row.id, "APPROVAL_REJECTED", "approval step rejected by decision", false);
      result.rejected++;
      result.outcomes.push({ runId: row.id, outcome: { status: "failed", reason: "APPROVAL_REJECTED" } });
    }
  }

  const running = await db
    .selectFrom("workflow_runs")
    .select("id")
    .where("status", "=", "running")
    .orderBy("started_at", "asc")
    .execute();
  for (const row of running) {
    const outcome = await runWorkflowRun(row.id, deps);
    result.processed++;
    result.outcomes.push({ runId: row.id, outcome });
  }
  return result;
}
