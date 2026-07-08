// Default QA gate — master-plan §3: ONE strong model evaluates a worker
// result against its output_contract. QA is a single call, not a council,
// for normal tasks (the council fires only at critical gates — council.ts).
//
// The QA model is a routing_rules lookup (task_class 'final-approval') —
// the choice is a data row, not a constant; no model name lives in this file.
// Verdict is Zod-bound: {pass, confidence 0-1, notes}; one retry on a
// malformed verdict, then throw. Pass → review→done (approval_class 'none')
// or review→awaiting_approval (the Phase-4 approval flow takes over).
// Fail → review→failed with {reason:'qa-fail'} so the 05-06 ladder engages.
import { sql } from "kysely";
import { z } from "zod";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { getDb, llmCall } from "@dxb/shared";
import { loadPolicy, route, SDK_MODEL_IDS, type ClassifiedIntent } from "@dxb/kernel";

const ACTOR = "orchestrator:qa";
const QA_TASK_CLASS = "final-approval"; // routing row that owns the QA model

export const QaVerdict = z.object({
  pass: z.boolean(),
  confidence: z.number().min(0).max(1),
  notes: z.string(),
});
export type QaVerdict = z.infer<typeof QaVerdict>;

export interface QaTask {
  id: string;
  department: string;
  objective: string;
  output_contract: string;
  approval_class: string;
  result: unknown;
}

/** Injectable for tests and specialised gates; returns a RAW verdict (Zod here). */
export type QaEvaluator = (task: QaTask) => Promise<unknown>;

export interface QaOutcome {
  verdict: QaVerdict;
  toStatus: "done" | "awaiting_approval" | "failed";
}

function unwrap(raw: unknown): unknown {
  if (typeof raw !== "string") return raw;
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse((fenced ? fenced[1] : raw).trim());
}

// Default evaluator: model/mode/effort from the 'final-approval' routing row.
// Subscription rows ride the Agent SDK; api rows go through the LiteLLM
// department virtual key — the same two paths as the worker shim.
async function defaultEvaluator(task: QaTask): Promise<unknown> {
  const rules = await loadPolicy(getDb());
  const routed = route(
    {
      intent_summary: task.objective,
      task_class: QA_TASK_CLASS,
      departments: [task.department],
      approval_class: task.approval_class,
      complexity: "single",
    } as ClassifiedIntent,
    rules,
  );

  const prompt = [
    "You are the QA gate of DXB Global OS. Judge whether the worker result",
    "satisfies the output contract. Answer as strict JSON only:",
    '{"pass": <boolean>, "confidence": <0..1>, "notes": "<short reason>"}.',
    "Judge ONLY contract satisfaction — do not redo the work.",
    "",
    `Objective: ${task.objective}`,
    `Output contract: ${task.output_contract}`,
    `Worker result: ${JSON.stringify(task.result)}`,
  ].join("\n");

  if (routed.mode === "subscription") {
    const q = query({
      prompt,
      options: {
        model: SDK_MODEL_IDS[routed.model] ?? routed.model,
        effort: routed.effort as "low" | "medium" | "high" | "max",
        tools: [],
        maxTurns: 4,
        outputFormat: { type: "json_schema", schema: z.toJSONSchema(QaVerdict) },
      },
    });
    for await (const msg of q) {
      if (msg.type === "result") {
        if (msg.subtype !== "success") throw new Error(`qa: agent-sdk result error (${msg.subtype})`);
        return msg.structured_output ?? msg.result;
      }
    }
    throw new Error("qa: agent-sdk stream ended without a result message");
  }
  const res = await llmCall({
    department: task.department,
    model: routed.model,
    messages: [{ role: "user", content: prompt }],
    maxTokens: 2048,
  });
  return res.content;
}

async function transition(
  taskId: string,
  to: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const db = getDb();
  const updated = await db
    .updateTable("tasks")
    .set({ status: to, updated_at: sql`now()` })
    .where("id", "=", taskId)
    .where("status", "=", "review")
    .returning("id")
    .executeTakeFirst();
  if (!updated) throw new Error(`qa: transition review→${to} lost a race on task ${taskId}`);
  await db
    .insertInto("task_events")
    .values({
      task_id: taskId,
      event: "transition",
      from_status: "review",
      to_status: to,
      actor: ACTOR,
      payload: JSON.stringify(payload),
    })
    .execute();
}

/**
 * Evaluate one task sitting in 'review'. One strong opinion, schema-bound,
 * feeding the escalation ladder on failure.
 */
export async function qa(taskId: string, evaluate: QaEvaluator = defaultEvaluator): Promise<QaOutcome> {
  const db = getDb();
  const row = await db
    .selectFrom("tasks")
    .select(["id", "department", "objective", "output_contract", "approval_class", "result", "status"])
    .where("id", "=", taskId)
    .executeTakeFirstOrThrow();
  if (row.status !== "review") {
    throw new Error(`qa: task ${taskId} is '${row.status}' — only 'review' tasks are evaluated`);
  }
  const task: QaTask = row;

  let verdict: QaVerdict | undefined;
  let lastError = "";
  for (let attempt = 0; attempt < 2 && !verdict; attempt++) {
    try {
      verdict = QaVerdict.parse(unwrap(await evaluate(task)));
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  if (!verdict) throw new Error(`qa: verdict malformed twice: ${lastError}`);

  if (!verdict.pass) {
    await transition(taskId, "failed", {
      reason: "qa-fail",
      notes: verdict.notes,
      confidence: verdict.confidence,
    });
    return { verdict, toStatus: "failed" };
  }
  const toStatus = task.approval_class === "none" ? "done" : "awaiting_approval";
  await transition(taskId, toStatus, {
    qa: "pass",
    confidence: verdict.confidence,
    notes: verdict.notes,
  });
  return { verdict, toStatus };
}
