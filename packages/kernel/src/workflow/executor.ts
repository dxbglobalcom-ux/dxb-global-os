// Default workflow executor — WORKFLOW_ENGINE §3 "agent → orchestrator spawn"
// on the SAME constitution as the certified worker-shim (R2.3 unification,
// audits F-03/F-05): subscription models ride the Agent SDK on local Claude
// auth with the employee's COMPILED gateway tool surface mounted (R2.2 —
// `tools: []` is dead here too); everything else goes through the
// department's LiteLLM virtual key (raw provider keys never appear on either
// path; api-mode tool surface lands with the Phase-7 proxy). Usage and tool
// traffic land on the ambient runScope so budget/token enforcement (§17)
// reads real numbers from agent_runs, and the A10 evidence package rides the
// result for the hook post-gate.
import { z } from "zod";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { getDb, llmCall } from "@dxb/shared";
import { currentRunScope } from "@dxb/observability";
import {
  buildSdkToolOptions,
  mcpToolName,
  readDxbMcpInventory,
  resolveRuntimeProfile,
  type SdkToolOptions,
} from "@dxb/gateway";
import { SDK_MODEL_IDS } from "../classify.js";
import type { AgentWork, AgentWorkResult } from "./types.js";

// Same envelope as the worker-shim (A10 executor-declared evidence).
const WorkerEvidence = z.object({
  kind: z.string().min(1),
  tool: z.string().min(1).optional(),
  note: z.string().min(1),
});
const WorkerJson = z.object({
  result: z.string(),
  confidence: z.number().min(0).max(1),
  evidence: z.array(WorkerEvidence).default([]),
  acceptance_map: z.record(z.string(), z.string()).default({}),
});

// Inventory cache — one in-memory dxb-mcp boot per process (worker-shim
// idiom); profiles are re-read per run so grant changes stay live.
let inventoryToolNames: string[] | null = null;
async function dxbInventoryNames(): Promise<string[]> {
  if (!inventoryToolNames) {
    const inv = await readDxbMcpInventory();
    inventoryToolNames = inv.map((e) => mcpToolName(e.server, e.tool));
  }
  return inventoryToolNames;
}

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

export async function defaultWorkflowExecutor(work: AgentWork): Promise<AgentWorkResult> {
  // R2.2/R2.3 tool surface: the employee's compiled profile, re-read per run.
  let toolOpts: SdkToolOptions | null = null;
  const surface = resolveRuntimeProfile({
    slug: work.employeeSlug,
    department: work.department,
  });
  if (surface.allowedTools.length > 0) {
    toolOpts = buildSdkToolOptions(surface, await dxbInventoryNames());
  }

  const prompt = [
    `You are ${work.employeeSlug}, a DXB Global OS employee agent (${work.department}).`,
    "Complete the work below and answer as strict JSON only:",
    '{"result": "<deliverable text>", "confidence": <0..1>,',
    ' "evidence": [{"kind": "verification", "tool": "<mcp tool you called>", "note": "<what you checked>"}],',
    ' "acceptance_map": {"<each requirement of the output contract>": "<how the deliverable meets it, specific>"}}',
    "confidence is your honest self-assessment that the deliverable meets the contract.",
    ...(toolOpts
      ? [
          "",
          "You have real MCP tools. VERIFY your work with at least one relevant tool",
          "call before answering, and list that call in evidence with kind",
          "'verification' and the exact tool name. Never claim evidence for a tool",
          "you did not call.",
        ]
      : []),
    "",
    `Objective: ${work.objective}`,
    `Output contract: ${work.outputContract}`,
    // §19 REVISE feedback rides the re-execution (worker-shim idiom).
    ...(work.feedback
      ? ["", "Quality-gate revision feedback — address EVERY point:", work.feedback]
      : []),
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
        ...(toolOpts
          ? {
              mcpServers: toolOpts.mcpServers,
              allowedTools: toolOpts.allowedTools,
              disallowedTools: toolOpts.disallowedTools,
              strictMcpConfig: toolOpts.strictMcpConfig,
              maxTurns: 12,
            }
          : { maxTurns: 4 }),
        outputFormat: { type: "json_schema", schema: z.toJSONSchema(WorkerJson) },
      },
    });
    for await (const msg of q) {
      // SDK tool traffic → tool_calls (params key-digest only, §16) — the
      // same tap as the worker-shim so the drill chain (§11) stays whole.
      if (msg.type === "assistant") {
        const blocks = (msg as { message?: { content?: unknown } }).message?.content;
        if (Array.isArray(blocks)) {
          for (const b of blocks) {
            if (b && typeof b === "object" && (b as { type?: string }).type === "tool_use") {
              const tu = b as { name?: string; input?: unknown };
              obs?.recordToolCall({
                tool: tu.name ?? "unknown",
                paramsDigest:
                  tu.input && typeof tu.input === "object"
                    ? { keys: Object.keys(tu.input as object) }
                    : null,
              });
            }
          }
        }
      }
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
    try {
      raw = JSON.parse((fenced ? fenced[1] : raw).trim());
    } catch {
      // Prose closure = evidence-less package; the post-gate REVISE loop owns
      // it (R2.2 measured behavior — never a fatal parse crash).
      raw = { result: String(raw), confidence: 0.3, evidence: [], acceptance_map: {} };
    }
  }
  const parsed = WorkerJson.parse(raw);
  return {
    output: parsed.result,
    confidence: parsed.confidence,
    resultPackage: {
      text: parsed.result,
      evidence: parsed.evidence,
      acceptance_map: parsed.acceptance_map,
    },
  };
}
