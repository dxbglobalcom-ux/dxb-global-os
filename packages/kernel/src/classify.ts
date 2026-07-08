// Kernel classifier — KERN-01: CEO text in, LOCKED ClassifiedIntent out.
// The kernel NEVER makes a free-text decision: the only output is a
// schema-parsed object (parse failure retries once, then throws — no fallback).
// Its own call parameters (model/effort) come from the routing_rules
// 'orchestration' row via route() — the kernel's model choice is itself data.
// Subscription mode only on this path: the Agent SDK rides local Claude Code
// auth — no raw provider keys, no LiteLLM bypass (api-mode rows are illegal here).
import { z } from "zod";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { getDb } from "@dxb/shared";
import { loadPolicy, route, type ResolvedRoute } from "./policy.js";

export const ClassifiedIntent = z.object({
  intent_summary: z.string(),
  task_class: z.string(),                       // routing_rules.task_class'a eşlenir
  departments: z.array(z.string()).min(1),
  approval_class: z.enum(["none","internal","outward"]),
  complexity: z.enum(["single","multi"]),       // multi → decompose çağrısı
});
export type ClassifiedIntent = z.infer<typeof ClassifiedIntent>;

// Brain-map row values → CLI model ids. Mechanical translation ONLY — the
// choice lives in routing_rules; unknown values pass through unchanged so a
// full CLI id can ship as pure data with zero code change.
// Exported: orchestrator SDK calls (decompose/worker-shim) reuse this map so
// no model-name literal ever appears outside the kernel translation layer.
export const SDK_MODEL_IDS: Record<string, string> = {
  "fable-5": "claude-fable-5",
  "opus-4.8": "claude-opus-4-8",
  "sonnet-5": "claude-sonnet-5",
};

// approval_class from the LLM is advisory-only: code can RAISE it, never lower.
// The Phase-4 approval/outbox rails stay the hard outward gate regardless.
const OUTWARD_MARKERS =
  /\b(send|publish|post|pay|invoice|email|mail|deploy|launch|tweet|announce|gönder|yayınla|öde|paylaş|duyur)\b/i;

function clampOutward(text: string, ci: ClassifiedIntent): ClassifiedIntent {
  if (ci.approval_class === "none" && OUTWARD_MARKERS.test(text)) {
    return { ...ci, approval_class: "internal" };
  }
  return ci;
}

async function runQuery(prompt: string, own: ResolvedRoute): Promise<unknown> {
  const q = query({
    prompt,
    options: {
      model: SDK_MODEL_IDS[own.model] ?? own.model,
      effort: own.effort as "low" | "medium" | "high" | "max",
      tools: [],
      // NOT 1: structured output is delivered via an internal StructuredOutput
      // tool call — with a single turn the SDK cannot retry when the model
      // answers inline first (observed live on opus-4.8 effort=high).
      maxTurns: 4,
      outputFormat: { type: "json_schema", schema: z.toJSONSchema(ClassifiedIntent) },
    },
  });
  for await (const msg of q) {
    if (msg.type === "result") {
      if (msg.subtype === "success") {
        if (msg.structured_output !== undefined) return msg.structured_output;
        // Mechanical unwrap only (``` fences); ClassifiedIntent.parse stays the
        // sole decision gate — this is not a free-text fallback.
        const text = msg.result.trim();
        const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        try {
          return JSON.parse((fenced ? fenced[1] : text).trim());
        } catch {
          return msg.result;
        }
      }
      throw new Error(`classify: agent-sdk result error (${msg.subtype})`);
    }
  }
  throw new Error("classify: agent-sdk stream ended without a result message");
}

export async function classify(text: string): Promise<ClassifiedIntent> {
  const db = getDb();
  const deptRows = await db.selectFrom("departments").select("slug").orderBy("slug").execute();
  const deptSlugs = deptRows.map((d) => d.slug);
  const rules = await loadPolicy(db);
  // Legal task classes are live data — whatever routing_rules can route.
  const taskClasses = [...new Set(rules.map((r) => r.task_class))].sort();

  const own = route(
    {
      intent_summary: "kernel classification call",
      task_class: "orchestration",
      departments: deptSlugs.length > 0 ? [deptSlugs[0]] : ["engineering"],
      approval_class: "none",
      complexity: "single",
    },
    rules,
  );
  if (own.mode !== "subscription") {
    throw new Error(
      `classify: 'orchestration' routing row resolved mode '${own.mode}' — ` +
        "classification runs on subscription-mode models only (no raw provider keys)",
    );
  }

  const basePrompt = [
    "You are the intent classifier of DXB Global OS. Classify the CEO's intent",
    "into strict JSON matching the given schema. Output JSON ONLY — no prose.",
    "",
    `Legal task_class values (choose exactly one): ${taskClasses.join(", ")}`,
    `Live departments (choose one or more): ${deptSlugs.join(", ")}`,
    "",
    "Rules:",
    "- intent_summary: one plain sentence restating the intent.",
    "- departments: only slugs from the live list.",
    "- approval_class: 'outward' when the work sends/publishes/pays outside the company,",
    "  'internal' when it needs internal review, else 'none'.",
    "- complexity: 'multi' when fulfilling the intent needs multiple distinct work items",
    "  or departments, else 'single'.",
    "",
    `CEO intent: """${text}"""`,
  ].join("\n");

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt =
      attempt === 0
        ? basePrompt
        : `${basePrompt}\n\nYour previous JSON failed schema validation:\n${lastError}\nReturn corrected JSON only.`;
    const raw = await runQuery(prompt, own);
    const parsed = ClassifiedIntent.safeParse(raw);
    if (parsed.success) return clampOutward(text, parsed.data);
    lastError = JSON.stringify(parsed.error.issues);
  }
  throw new Error(`classify: LLM output failed ClassifiedIntent schema twice: ${lastError}`);
}
