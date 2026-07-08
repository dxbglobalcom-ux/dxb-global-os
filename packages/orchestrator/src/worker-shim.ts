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
import { loadPolicy, SDK_MODEL_IDS, type RoutingRule } from "@dxb/kernel";

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
      if (msg.type === "result") {
        if (msg.subtype !== "success") {
          throw new Error(`worker-shim: agent-sdk result error (${msg.subtype})`);
        }
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
    raw = res.content;
  }

  if (typeof raw === "string") {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    raw = JSON.parse((fenced ? fenced[1] : raw).trim());
  }
  const parsed = WorkerJson.parse(raw);
  return { result: { text: parsed.result }, confidence: parsed.confidence };
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
    const out = await execute(task);
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
