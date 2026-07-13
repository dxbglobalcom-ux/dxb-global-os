// Default workflow executor — WORKFLOW_ENGINE §3 "agent → orchestrator spawn"
// distilled to the same dual execution path the certified worker-shim uses:
// subscription models ride the Agent SDK on local Claude auth, everything
// else goes through the department's LiteLLM virtual key (raw provider keys
// never appear on either path). Mode comes from routing_rules when a row
// names the model; otherwise an SDK-known model id means subscription.
// Usage lands on the ambient runScope so budget/token enforcement (§17)
// reads real numbers from agent_runs.
import { z } from "zod";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { getDb, llmCall } from "@dxb/shared";
import { currentRunScope } from "@dxb/observability";
import { SDK_MODEL_IDS } from "../classify.js";
import type { AgentWork } from "./types.js";

const WorkerJson = z.object({
  result: z.string(),
  confidence: z.number().min(0).max(1),
});

async function resolveMode(model: string): Promise<"subscription" | "api"> {
  const row = await getDb()
    .selectFrom("routing_rules")
    .select("mode")
    .where("model", "=", model)
    .where("enabled", "=", true)
    .orderBy("priority", "desc")
    .limit(1)
    .executeTakeFirst();
  if (row?.mode === "subscription" || row?.mode === "api") return row.mode;
  return SDK_MODEL_IDS[model] ? "subscription" : "api";
}

export async function defaultWorkflowExecutor(
  work: AgentWork,
): Promise<{ output: string; confidence: number }> {
  const prompt = [
    `You are ${work.employeeSlug}, a DXB Global OS employee agent (${work.department}).`,
    "Complete the work below and answer as strict JSON only:",
    '{"result": "<deliverable text>", "confidence": <0..1>}.',
    "confidence is your honest self-assessment that the deliverable meets the contract.",
    "",
    `Objective: ${work.objective}`,
    `Output contract: ${work.outputContract}`,
  ].join("\n");

  const obs = currentRunScope();
  obs?.setModel(work.model);

  let raw: unknown;
  if ((await resolveMode(work.model)) === "subscription") {
    const q = query({
      prompt,
      options: {
        model: SDK_MODEL_IDS[work.model] ?? work.model,
        tools: [],
        maxTurns: 4,
        outputFormat: { type: "json_schema", schema: z.toJSONSchema(WorkerJson) },
      },
    });
    for await (const msg of q) {
      if (msg.type === "result") {
        if (msg.subtype !== "success") {
          throw new Error(`workflow executor: agent-sdk result error (${msg.subtype})`);
        }
        const usage = (msg as { usage?: { input_tokens?: number; output_tokens?: number } })
          .usage;
        obs?.addUsage({
          tokensIn: usage?.input_tokens ?? 0,
          tokensOut: usage?.output_tokens ?? 0,
          // costEur stays 0 on the subscription path (single-source cost rule).
        });
        raw = msg.structured_output ?? msg.result;
        break;
      }
    }
  } else {
    const res = await llmCall({
      department: work.department,
      model: work.model,
      messages: [{ role: "user", content: prompt }],
      maxTokens: 8192,
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
  return { output: parsed.result, confidence: parsed.confidence };
}
