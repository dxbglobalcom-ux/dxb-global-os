// video-learn generation stages (07-07): department classification, structured
// multi-output generation, and the CEO-facing mode-based explanation. Every
// model comes from a routing_rules row (video.classify / video.summarize /
// video.explain) — zero model literals here (house data-driven routing rule).
// Spend attribution: the classified department's virtual key when present,
// else the 'os' key with a LOUD attribution_fallback marker (never silent).
import { type Kysely } from "kysely";
import { llmCall, departmentKeyEnvVar, type DB } from "@dxb/shared";
import { z } from "zod";

/** CEO req 3 fixed set — unsure/unparseable classifies as research, NEVER ops. */
export const DEPARTMENTS = [
  "engineering",
  "design",
  "marketing",
  "seo",
  "content",
  "automation",
  "operations",
  "strategy",
  "research",
] as const;
export type Department = (typeof DEPARTMENTS)[number];
export const FALLBACK_DEPARTMENT: Department = "research";

/** CEO req 2 output modes for the final explanation. */
export const OUTPUT_MODES = ["short", "detailed", "eli5", "examples", "action"] as const;
export type OutputMode = (typeof OUTPUT_MODES)[number];
export const DEFAULT_MODE: OutputMode = "detailed";

const GeneratedJson = z.object({
  summary: z.string().min(1),
  executive_summary: z.string().min(1),
  key_concepts: z.array(z.string()).default([]),
  action_items: z.array(z.string()).default([]),
});
export type GeneratedSections = z.infer<typeof GeneratedJson>;

/** Highest-priority enabled routing_rules model for a task class
 *  (defaultExtractFacts precedent — no model literal in code). */
export async function routedModel(db: Kysely<DB>, taskClass: string): Promise<string> {
  const rule = await db
    .selectFrom("routing_rules")
    .select(["model"])
    .where("task_class", "=", taskClass)
    .where("enabled", "=", true)
    .orderBy("priority", "desc")
    .limit(1)
    .executeTakeFirst();
  if (!rule) throw new Error(`routing_rules has no enabled ${taskClass} row — seed it first`);
  return rule.model;
}

/** Spend attribution (COST-02): classified department's virtual key when its
 *  env var exists, else 'os' — the fallback is recorded in the artifact
 *  front-matter by the caller, never swallowed. */
export function resolveAttribution(department: string): { department: string; fallback: boolean } {
  if (process.env[departmentKeyEnvVar(department)]) return { department, fallback: false };
  return { department: "os", fallback: true };
}

/** context-budget precedent: tolerate a fenced JSON block, nothing else. */
function parseStrictJson(raw: string): unknown {
  let t = raw.trim();
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) t = fenced[1].trim();
  return JSON.parse(t);
}

/** Test seam type: production default is the real llmCall. */
export type LlmCallFn = typeof llmCall;

export async function classifyDepartment(
  db: Kysely<DB>,
  args: { title: string; transcript: string },
  call: LlmCallFn = llmCall,
): Promise<Department> {
  const model = await routedModel(db, "video.classify");
  const res = await call({
    department: resolveAttribution(FALLBACK_DEPARTMENT).department,
    model,
    maxTokens: 400,
    messages: [
      {
        role: "system",
        content:
          "You assign a company department to a video by its content. Departments: " +
          `${DEPARTMENTS.join(", ")}. If you are not clearly sure, answer "research". ` +
          'Reply with STRICT JSON only, no prose: {"department":"<one of the list>"}',
      },
      {
        role: "user",
        content: `TITLE: ${args.title}\nTRANSCRIPT (start): ${args.transcript.slice(0, 4000)}`,
      },
    ],
  });
  try {
    const o = parseStrictJson(res.content) as { department?: unknown };
    if (typeof o.department === "string" && (DEPARTMENTS as readonly string[]).includes(o.department)) {
      return o.department as Department;
    }
  } catch {
    /* fall through to research */
  }
  return FALLBACK_DEPARTMENT; // unsure/unparseable → research, never ops (CEO req 3)
}

export async function generateSections(
  db: Kysely<DB>,
  args: { department: string; title: string; transcript: string },
  call: LlmCallFn = llmCall,
): Promise<GeneratedSections> {
  const model = await routedModel(db, "video.summarize");
  const res = await call({
    department: resolveAttribution(args.department).department,
    model,
    maxTokens: 4000,
    messages: [
      {
        role: "system",
        content:
          "You turn a video transcript into structured company knowledge. Produce: " +
          "summary (clean readable prose, Turkish, keep technical terms verbatim), " +
          "executive_summary (3-6 sentences for the CEO, Turkish), " +
          "key_concepts (standalone sentences, one concept each, original terminology kept), " +
          "action_items (business/technical implementation ideas ONLY if genuinely present, else []). " +
          'Reply with STRICT JSON only, no prose: {"summary":"...","executive_summary":"...",' +
          '"key_concepts":["..."],"action_items":["..."]}',
      },
      { role: "user", content: `TITLE: ${args.title}\n\nTRANSCRIPT:\n${args.transcript}` },
    ],
  });
  try {
    return GeneratedJson.parse(parseStrictJson(res.content));
  } catch {
    // T-06-21 precedent: an unreadable generator must fail the job loudly —
    // filing a video with fabricated/empty sections would be silent amnesia.
    throw new Error("generator output unparseable — refusing to file fabricated sections");
  }
}

const MODE_PROMPTS: Record<OutputMode, string> = {
  short: "Compact briefing, max ~200 words: what the video says and why it matters to us.",
  detailed:
    "Thorough, well-structured explanation covering every substantive point, with headings; " +
    "assume a smart reader who has NOT seen the video.",
  eli5:
    "Explain as if the reader meets this topic for the very first time: plain language, " +
    "build up from zero, define every term on first use.",
  examples:
    "Explain through concrete worked examples: for each main idea give a realistic example " +
    "showing how it plays out in practice.",
  action:
    "Action-oriented business/technical extraction: what we should implement or change, " +
    "concrete first steps, expected impact, risks.",
};

export async function explainForCeo(
  db: Kysely<DB>,
  args: { department: string; title: string; transcript: string; sections: GeneratedSections; mode: OutputMode },
  call: LlmCallFn = llmCall,
): Promise<string> {
  const model = await routedModel(db, "video.explain");
  const res = await call({
    department: resolveAttribution(args.department).department,
    model,
    maxTokens: 4000,
    messages: [
      {
        role: "system",
        content:
          "You write the final CEO-facing explanation of a video for the company knowledge base. " +
          `Style contract: ${MODE_PROMPTS[args.mode]} ` +
          "Write in Turkish; keep technical terms, product names and code verbatim. " +
          "Ground every claim in the transcript — no invention beyond it.",
      },
      {
        role: "user",
        content:
          `TITLE: ${args.title}\nFIRST-PASS SUMMARY: ${args.sections.summary}\n\n` +
          `TRANSCRIPT:\n${args.transcript}`,
      },
    ],
  });
  const text = res.content.trim();
  if (!text) throw new Error("explainer returned empty output");
  return text;
}
