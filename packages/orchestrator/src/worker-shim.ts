// Worker shim — ORCH-04 by construction: one call claims ONE task through
// claim_next_task (dependency-aware, FOR UPDATE SKIP LOCKED), works it, and
// moves it along the LOCKED status chain with an event per transition.
// The worker sees ONLY its claimed task row (typed envelope fields); results
// land in tasks.result — there is no channel to any other worker or task in
// this module, and none may be added.
//
// The executor is injectable (tests, specialised workers). The default
// executor resolves the model from routing_rules data by the task's tier:
// subscription rows ride the Agent SDK on local Claude auth; api rows go
// through the @dxb/shared LiteLLM client with the department's virtual key —
// raw provider keys never appear on either path.
// Confidence is SURFACED, not judged: it is written into tasks.result and the
// review-transition payload for 05-06's escalation ladder to consume
// (<0.6 counts as a fail THERE, not here).
import { sql } from "kysely";
import { z } from "zod";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { getDb, llmCall } from "@dxb/shared";
import { currentRunScope, runScope } from "@dxb/observability";
import { loadPolicy, SDK_MODEL_IDS, type RoutingRule } from "@dxb/kernel";
import {
  checkContextBudget,
  contextText,
  estimateTokens,
  type CompressionMeasurement,
  type ContextBudgetDeps,
  type WorkingContext,
} from "./context-budget.js";

export interface ClaimedTask {
  id: string;
  department: string;
  objective: string;
  output_contract: string;
  model_tier: string;
  approval_class: string;
  budget_max_tokens: number;
  priority: number;
  status: string;
}

export interface WorkerOutput {
  result: unknown;
  confidence: number; // 0-1 self-report — escalation input, never dropped
}

export type Executor = (task: ClaimedTask) => Promise<WorkerOutput>;

export interface RunWorkerArgs {
  workerId: string;
  departments: string[];
  execute?: Executor;
  leaseSeconds?: number;
}

export type RunWorkerResult =
  | { claimed: false }
  | { claimed: true; taskId: string; status: "review"; confidence: number }
  | { claimed: true; taskId: string; status: "failed"; error: string };

const WorkerJson = z.object({ result: z.string(), confidence: z.number().min(0).max(1) });

// Default executor: the model is a routing_rules lookup by the task's tier —
// the highest-priority enabled row for that tier wins (ORCH-02 at execution
// time; no model name lives in this file).
async function defaultExecutor(task: ClaimedTask): Promise<WorkerOutput> {
  const rules = await loadPolicy(getDb()); // already priority-ordered
  const rule: RoutingRule | undefined = rules.find((r) => r.model_tier === task.model_tier);
  if (!rule) {
    throw new Error(`worker-shim: no enabled routing_rules row for tier '${task.model_tier}'`);
  }

  const prompt = [
    "You are a DXB Global OS worker agent. Complete the task below and answer",
    'as strict JSON only: {"result": "<deliverable text>", "confidence": <0..1>}.',
    "confidence is your honest self-assessment that the deliverable meets the contract.",
    "",
    `Objective: ${task.objective}`,
    `Output contract: ${task.output_contract}`,
  ].join("\n");

  // Observability tap (E8.1): the run scope travels on AsyncLocalStorage so
  // this certified Executor signature stays untouched.
  const obs = currentRunScope();
  obs?.setModel(rule.model);

  let raw: unknown;
  if (rule.mode === "subscription") {
    const q = query({
      prompt,
      options: {
        model: SDK_MODEL_IDS[rule.model] ?? rule.model,
        effort: rule.effort as "low" | "medium" | "high" | "max",
        tools: [],
        maxTurns: 4,
        outputFormat: { type: "json_schema", schema: z.toJSONSchema(WorkerJson) },
      },
    });
    for await (const msg of q) {
      // SDK tool traffic → tool_calls (params digest only, §16: no raw content).
      if (msg.type === "assistant") {
        const blocks = (msg as { message?: { content?: unknown } }).message?.content;
        if (Array.isArray(blocks)) {
          for (const b of blocks) {
            if (b && typeof b === "object" && (b as { type?: string }).type === "tool_use") {
              const tu = b as { name?: string; input?: unknown };
              obs?.recordToolCall({
                tool: tu.name ?? "unknown",
                paramsDigest: tu.input && typeof tu.input === "object"
                  ? { keys: Object.keys(tu.input as object) }
                  : null,
              });
            }
          }
        }
      }
      if (msg.type === "result") {
        if (msg.subtype !== "success") {
          throw new Error(`worker-shim: agent-sdk result error (${msg.subtype})`);
        }
        const usage = (msg as { usage?: { input_tokens?: number; output_tokens?: number } }).usage;
        obs?.addUsage({
          tokensIn: usage?.input_tokens ?? 0,
          tokensOut: usage?.output_tokens ?? 0,
          // costEur stays 0 on the subscription path: no marginal cost, and the
          // single-source cost rule (litellm.ts LOCKED header) forbids a second
          // cost writer. API-mode cost lands with the Phase-7 LiteLLM wiring.
        });
        raw = msg.structured_output ?? msg.result;
        break;
      }
    }
  } else {
    // api / free-tier rows: LiteLLM virtual key per department — never raw keys.
    const res = await llmCall({
      department: task.department,
      model: rule.model,
      messages: [{ role: "user", content: prompt }],
      maxTokens: Math.min(task.budget_max_tokens, 8192),
    });
    obs?.addUsage({
      tokensIn: res.usage.prompt_tokens,
      tokensOut: res.usage.completion_tokens,
    });
    raw = res.content;
  }

  if (typeof raw === "string") {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    raw = JSON.parse((fenced ? fenced[1] : raw).trim());
  }
  const parsed = WorkerJson.parse(raw);
  return { result: { text: parsed.result }, confidence: parsed.confidence };
}

// -- stepped execution + context budget (MEM-04, 06-07) ------------------------
//
// runWorkerOnce's single-shot Executor signature is UNTOUCHED (the certified
// Phase-5 slice). Multi-step work opts in by building its executor with
// makeSteppedExecutor: the loop runs the steps, and after each one the
// context-budget hook measures the working context — past the soft limit it
// compresses + offloads through the memory router's write door, and the
// compression is appended to the task's event trail as 'context_compressed'
// (from=to='running': an in-flight observation, not a status change — the
// 10/10-gate transition chain stays contiguous).

export interface StepOutcome {
  output: string;
  /** Optional running self-assessment; the LAST step's value is surfaced. */
  confidence?: number;
}

export type TaskStep = (
  task: ClaimedTask,
  ctx: WorkingContext,
  stepIndex: number,
) => Promise<StepOutcome>;

export interface SteppedExecutorArgs {
  workerId: string;
  steps: TaskStep[];
  /** Default ON for multi-step tasks; single-step tasks never pay the check. */
  contextBudget?: boolean;
  budgetDeps?: ContextBudgetDeps;
  /** Measurement tap (per step) — the 50-step demo builds its ölçüm logu here. */
  onMeasurement?: (m: CompressionMeasurement, compressed: boolean) => void;
}

export function makeSteppedExecutor(args: SteppedExecutorArgs): Executor {
  const { workerId, steps, budgetDeps, onMeasurement } = args;
  if (steps.length === 0) throw new Error("worker-shim: makeSteppedExecutor needs >= 1 step");
  const budgetEnabled = args.contextBudget ?? steps.length > 1;

  return async (task) => {
    const db = getDb();
    let ctx: WorkingContext = {
      taskId: task.id,
      workerId,
      department: task.department,
      entries: [],
    };
    let confidence = 0.5;

    for (let i = 0; i < steps.length; i++) {
      const out = await steps[i](task, ctx, i);
      ctx.entries.push({ step: i + 1, kind: "work", text: out.output });
      if (out.confidence !== undefined) confidence = out.confidence;

      if (!budgetEnabled) continue;
      const check = await checkContextBudget(ctx, budgetDeps);
      ctx = check.ctx;
      onMeasurement?.(check.measurement, check.compressed);
      if (check.compressed) {
        await db
          .insertInto("task_events")
          .values({
            task_id: task.id,
            event: "context_compressed",
            from_status: "running",
            to_status: "running",
            actor: workerId,
            payload: JSON.stringify(check.measurement),
          })
          .execute();
      }
    }

    return {
      result: {
        text: ctx.entries[ctx.entries.length - 1].text,
        steps: steps.length,
        context: contextText(ctx),
        context_tokens: estimateTokens(contextText(ctx)),
      },
      confidence,
    };
  };
}

// Guarded transition: UPDATE succeeds only from the expected status (race-safe),
// and every transition appends its event — the chain in task_events is the
// single source of truth escalation counts from.
async function transition(
  taskId: string,
  from: string,
  to: string,
  actor: string,
  payload: Record<string, unknown> = {},
  resultJson?: unknown,
): Promise<void> {
  const db = getDb();
  const updated = await db
    .updateTable("tasks")
    .set({
      status: to,
      updated_at: sql`now()`,
      ...(resultJson !== undefined ? { result: JSON.stringify(resultJson) } : {}),
    })
    .where("id", "=", taskId)
    .where("status", "=", from)
    .returning("id")
    .executeTakeFirst();
  if (!updated) {
    throw new Error(`worker-shim: transition ${from}→${to} lost a race on task ${taskId}`);
  }
  await db
    .insertInto("task_events")
    .values({
      task_id: taskId,
      event: "transition",
      from_status: from,
      to_status: to,
      actor,
      payload: JSON.stringify(payload),
    })
    .execute();
}

export async function runWorkerOnce(args: RunWorkerArgs): Promise<RunWorkerResult> {
  const { workerId, departments, execute = defaultExecutor, leaseSeconds = 900 } = args;
  const db = getDb();

  const claimedRows = await sql<ClaimedTask>`
    SELECT * FROM claim_next_task(${workerId}, ${departments}, ${leaseSeconds})
  `.execute(db);
  const task = claimedRows.rows[0];
  if (!task) return { claimed: false };

  // claim_next_task flips the row; the event trail must record it too.
  await db
    .insertInto("task_events")
    .values({
      task_id: task.id,
      event: "claimed",
      from_status: "queued",
      to_status: "claimed",
      actor: workerId,
      payload: JSON.stringify({ lease_seconds: leaseSeconds }),
    })
    .execute();

  await transition(task.id, "claimed", "running", workerId);

  try {
    // E8.1: every execution runs inside an observability scope — agent_runs
    // open/close + buffered tool_calls/file_changes ride AsyncLocalStorage.
    // Observation never blocks this path (spec §3 ⛔): a dead observability
    // write spills to disk and the task outcome is decided by execute() alone.
    const { value: out } = await runScope({ taskId: task.id }, () => execute(task));
    await transition(
      task.id,
      "running",
      "review",
      workerId,
      { confidence: out.confidence },
      { ...(typeof out.result === "object" && out.result !== null ? out.result : { value: out.result }), confidence: out.confidence },
    );
    return { claimed: true, taskId: task.id, status: "review", confidence: out.confidence };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await transition(task.id, "running", "failed", workerId, { error: message });
    return { claimed: true, taskId: task.id, status: "failed", error: message };
  }
}
