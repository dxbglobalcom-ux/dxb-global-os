// Kernel classifier — KERN-01: CEO text in, LOCKED ClassifiedIntent out.
// The kernel NEVER makes a free-text decision: the only output is a
// schema-parsed object (parse failure retries once, then throws — no fallback).
// Its own call parameters (model/effort) come from the routing_rules
// 'orchestration' row via route() — the kernel's model choice is itself data.
// Subscription mode only on this path: the Agent SDK rides local Claude Code
// auth — no raw provider keys, no LiteLLM bypass (api-mode rows are illegal here).
import { z } from "zod";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { getDb, sdkJsonSchema } from "@dxb/shared";
import { loadPolicy, route, workClasses, type ResolvedRoute } from "./policy.js";
import { companyIsolation, isolationReceipt } from "./sdk-isolation.js";
import { sdkModel } from "./models.js";

export const ClassifiedIntent = z.object({
  intent_summary: z.string(),
  task_class: z.string(),                       // routing_rules.task_class'a eşlenir
  departments: z.array(z.string()).min(1),
  approval_class: z.enum(["none","internal","outward"]),
  complexity: z.enum(["single","multi"]),       // multi → decompose çağrısı
});
export type ClassifiedIntent = z.infer<typeof ClassifiedIntent>;

/**
 * The per-call schema: ClassifiedIntent with task_class narrowed to the live routing classes, so
 * the SDK's json_schema and the parse gate both refuse a class no routing row can serve (B51 move 5,
 * C2-10, Sol's single pass 2026-10-04: the open string let "bogus" through to a NoRouteError).
 * The exported ClassifiedIntent contract stays as it is; an empty list keeps it unnarrowed.
 */
export function classifiedIntentFor(taskClasses: readonly string[]) {
  return taskClasses.length > 0
    ? ClassifiedIntent.extend({ task_class: z.enum(taskClasses as [string, ...string[]]) })
    : ClassifiedIntent;
}

// B51 P1: the brain-map translation (SDK_MODEL_IDS) is gone — a routing row names a catalogue id and
// the catalogue carries the name the lane is called with (models.ts, resolveModel / sdkModelId).

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

/**
 * The classifier's prompt. B51 move 5 (C2-10, 2026-10-04): the "Output JSON ONLY — no prose."
 * line went — this path is subscription-only and sends `outputFormat: json_schema`, so the
 * schema already carries the shape. Exported so the text is pinned (tests/b51).
 */
export function classifyPrompt(text: string, taskClasses: readonly string[], deptSlugs: readonly string[]): string {
  return [
    "You are the intent classifier of DXB Global OS. Classify the CEO's intent",
    "into strict JSON matching the given schema.",
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
}

async function runQuery(prompt: string, own: ResolvedRoute, schema: z.ZodType): Promise<unknown> {
  // B51 P5b (C2-12): the catalogue's API name and its fallback model, read uncached per call
  const sdk = await sdkModel(getDb(), own.model);
  const q = query({
    prompt,
    options: {
      // CEO 2026-10-03: nothing of the construction is loaded into a company call (sdk-isolation.ts)
      ...(companyIsolation() ?? {}),
      model: sdk.model,
      ...(sdk.fallbackModel ? { fallbackModel: sdk.fallbackModel } : {}),
      effort: own.effort as "low" | "medium" | "high" | "xhigh" | "max",
      tools: [],
      // NOT 1: structured output is delivered via an internal StructuredOutput
      // tool call — with a single turn the SDK cannot retry when the model
      // answers inline first (observed live on opus-4.8 effort=high).
      maxTurns: 4,
      outputFormat: { type: "json_schema", schema: sdkJsonSchema(schema) },
    },
  });
  const seen = isolationReceipt("classify");
  for await (const msg of q) {
    seen(msg);
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

export async function classify(
  text: string,
  opts: {
    /** routing_rules row that prices THIS classification call — latency-
     *  critical callers (voice) point at a fast-tier row; default stays the
     *  L1 'orchestration' row. Missing row → orchestration fallback, so a
     *  pre-migration DB never breaks (routing stays data, KERN-02). */
    taskClass?: string;
  } = {},
): Promise<ClassifiedIntent> {
  const db = getDb();
  const deptRows = await db.selectFrom("departments").select("slug").orderBy("slug").execute();
  const deptSlugs = deptRows.map((d) => d.slug);
  const rules = await loadPolicy(db);
  // Legal task classes are live data — whatever routing_rules can route.
  const taskClasses = workClasses(rules);

  const ownCi = {
    intent_summary: "kernel classification call",
    departments: deptSlugs.length > 0 ? [deptSlugs[0]] : ["engineering"],
    approval_class: "none" as const,
    complexity: "single" as const,
  };
  let own: ResolvedRoute;
  try {
    own = route({ ...ownCi, task_class: opts.taskClass ?? "orchestration" }, rules);
  } catch {
    own = route({ ...ownCi, task_class: "orchestration" }, rules);
  }
  if (own.mode !== "subscription") {
    throw new Error(
      `classify: 'orchestration' routing row resolved mode '${own.mode}' — ` +
        "classification runs on subscription-mode models only (no raw provider keys)",
    );
  }

  const basePrompt = classifyPrompt(text, taskClasses, deptSlugs);
  const schema = classifiedIntentFor(taskClasses);

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt =
      attempt === 0
        ? basePrompt
        : `${basePrompt}\n\nYour previous JSON failed schema validation:\n${lastError}\nReturn corrected JSON only.`;
    const raw = await runQuery(prompt, own, schema);
    const parsed = schema.safeParse(raw);
    if (parsed.success) return clampOutward(text, parsed.data);
    lastError = JSON.stringify(parsed.error.issues);
  }
  throw new Error(`classify: LLM output failed ClassifiedIntent schema twice: ${lastError}`);
}
