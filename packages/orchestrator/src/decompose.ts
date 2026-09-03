// Orchestrator decompose — ORCH-01: ClassifiedIntent → dependent TaskEnvelope[].
// The LLM lives ONLY inside the one drafting call for complexity 'multi'
// (LOCKED: control flow stays in TypeScript — no free-text decision escapes).
// 'single' intents never touch a model: one envelope is derived from the
// ClassifiedIntent directly (cheapest path).
//
// Guards (code, post-parse — master-plan §5 risk 1 + §2 row 7 + T-05-12):
//   - self-contained lint: objectives referencing "the above/previous" are rejected
//   - hop-depth: longest dependency chain capped at 5 levels (the CEO made that
//     routing/policy decision on 2026-08-27; the code default had been 3)
//   - batch cap: > 10 envelopes per intent rejected (runaway decompose)
//   - deps are forward-only local indices (deps[i] < i) — cycles impossible
// A guard/parse failure triggers exactly ONE regeneration attempt with the
// failure text quoted, then throws. model_tier is NEVER taken from LLM output:
// route() assigns it per envelope task_class from routing_rules data (T-05-11).
// approval_class can be raised by the draft, never lowered below ci's (T-05-10).
import { z } from "zod";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { getDb, TaskEnvelope } from "@dxb/shared";
import {
  loadPolicy,
  route,
  SDK_MODEL_IDS,
  type ClassifiedIntent,
  type ResolvedRoute,
  type RoutingRule,
} from "@dxb/kernel";

export type DecomposedEnvelope = TaskEnvelope & { deps: number[] };

// Raised from 3 to 5 by the CEO's order of 2026-08-27 — *"derinliği ileride yapacağımız
// yoğun ve compleks işlere uyumlu şekilde yükselt"* — after a real intent (a website for a
// coffee brand the holding is founding) drew a 5-deep chain and was refused twice. FIVE is
// the master plan's own ceiling, not a new number: PHASE-05 §2 row 7 reads *"aktif hop ≤3
// çoğu görevde (head→specialist→worker); 5 katman yalnız gerçekten karmaşık işte"*. The same
// row carries the reason not to go higher, and it is arithmetic rather than taste: at 95% per
// hop, 5 hops finish 77% of the time and 6 hops 74%. Raising it further is the CEO's call.
const MAX_HOP_DEPTH = 5; // PHASE-05 §2 row 7, complex-work clause exercised 2026-08-27
const MAX_ENVELOPES = 10; // T-05-12 runaway-batch cap

// What the model is allowed to draft. Deliberately NO model_tier (route() owns
// it) and NO budget/priority (TaskEnvelope defaults own them).
const EnvelopeDraft = z.object({
  department: z.string().min(1),
  objective: z.string().min(20),
  output_contract: z.string().min(10),
  task_class: z.string().min(1), // mapped through routing_rules per envelope
  approval_class: z.enum(["none", "internal", "outward"]).default("none"),
  deps: z.array(z.number().int().min(0)).default([]),
});
type EnvelopeDraft = z.infer<typeof EnvelopeDraft>;

const DraftBatch = z.object({ envelopes: z.array(EnvelopeDraft).min(2) });

// Self-contained lint (master-plan §5 risk 1): an objective that points at
// "the above/previous" output is not executable in isolation — reject.
// Unicode lookarounds, not \b: ASCII \b never fires at the edge of 'önceki'.
const BACK_REFERENCE =
  /(?<![\p{L}\p{N}])(yukarıda|yukarıya|önceki|above|previous step|as mentioned)(?![\p{L}\p{N}])/iu;

const APPROVAL_RANK = { none: 0, internal: 1, outward: 2 } as const;
type ApprovalClass = keyof typeof APPROVAL_RANK;

function raiseApproval(base: ApprovalClass, draft: ApprovalClass): ApprovalClass {
  return APPROVAL_RANK[draft] > APPROVAL_RANK[base] ? draft : base;
}

/** Longest dependency chain, counted in envelopes (a lone task = 1). Exported for unit tests. */
export function chainDepth(deps: number[][]): number {
  const depth: number[] = [];
  for (let i = 0; i < deps.length; i++) {
    let longest = 0;
    for (const d of deps[i]) {
      // forward-only is validated in lintBatch; guard here keeps the DP total.
      if (d < i) longest = Math.max(longest, depth[d]);
    }
    depth[i] = longest + 1;
  }
  return depth.length === 0 ? 0 : Math.max(...depth);
}

/**
 * Structural + self-contained lint over a draft batch. Returns human-readable
 * failure lines ([] = clean). Exported for unit tests.
 */
export function lintBatch(drafts: Pick<EnvelopeDraft, "objective" | "deps">[]): string[] {
  const failures: string[] = [];
  if (drafts.length > MAX_ENVELOPES) {
    failures.push(`batch of ${drafts.length} envelopes exceeds the cap of ${MAX_ENVELOPES}`);
  }
  drafts.forEach((d, i) => {
    const backref = d.objective.match(BACK_REFERENCE);
    if (backref) {
      failures.push(
        `envelope[${i}] objective is not self-contained (back-reference '${backref[0]}'): "${d.objective}"`,
      );
    }
    for (const dep of d.deps) {
      if (dep >= i) failures.push(`envelope[${i}] deps must reference EARLIER items only, got ${dep}`);
    }
  });
  if (failures.length === 0) {
    const depth = chainDepth(drafts.map((d) => d.deps));
    if (depth > MAX_HOP_DEPTH) {
      failures.push(`dependency chain depth ${depth} exceeds the hop cap of ${MAX_HOP_DEPTH}`);
    }
  }
  return failures;
}

// Same SDK access pattern as kernel classify.ts: subscription-mode only,
// structured output with a mechanical fence-unwrap fallback — Zod stays the
// sole decision gate.
async function runDraftQuery(prompt: string, own: ResolvedRoute): Promise<unknown> {
  const q = query({
    prompt,
    options: {
      model: SDK_MODEL_IDS[own.model] ?? own.model,
      effort: own.effort as "low" | "medium" | "high" | "xhigh" | "max",
      tools: [],
      maxTurns: 4,
      outputFormat: { type: "json_schema", schema: z.toJSONSchema(DraftBatch) },
    },
  });
  for await (const msg of q) {
    if (msg.type === "result") {
      if (msg.subtype === "success") {
        if (msg.structured_output !== undefined) return msg.structured_output;
        const text = msg.result.trim();
        const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        try {
          return JSON.parse((fenced ? fenced[1] : text).trim());
        } catch {
          return msg.result;
        }
      }
      throw new Error(`decompose: agent-sdk result error (${msg.subtype})`);
    }
  }
  throw new Error("decompose: agent-sdk stream ended without a result message");
}

function draftPrompt(ci: ClassifiedIntent, taskClasses: string[], departments: string[]): string {
  return [
    "You are the task decomposer of DXB Global OS. Split the classified CEO intent",
    "into 2-10 SELF-CONTAINED work envelopes as strict JSON matching the schema.",
    "Output JSON ONLY — no prose.",
    "",
    `Legal task_class values (choose one per envelope): ${taskClasses.join(", ")}`,
    `Live departments (choose one per envelope): ${departments.join(", ")}`,
    "",
    "Rules:",
    "- objective: a complete work order readable in TOTAL ISOLATION. Repeat every",
    "  fact the worker needs. NEVER write 'the above', 'previous step', 'as mentioned',",
    "  'yukarıda' or 'önceki' — each envelope is the only text its worker sees.",
    "- output_contract: concrete deliverable format + done-criteria.",
    "- deps: array of indices of EARLIER envelopes this one needs finished first",
    "  (0-based, forward references forbidden). Keep the longest chain <= 3 envelopes.",
    "- approval_class: 'outward' when that envelope's work leaves the company,",
    "  'internal' when it needs internal review, else 'none'.",
    "",
    `Classified intent: ${JSON.stringify(ci)}`,
  ].join("\n");
}

async function finalize(
  ci: ClassifiedIntent,
  drafts: EnvelopeDraft[],
  rules: RoutingRule[],
): Promise<DecomposedEnvelope[]> {
  return drafts.map((d) => {
    const routed = route(
      { ...ci, task_class: d.task_class, departments: [d.department] },
      rules,
    );
    const envelope = TaskEnvelope.parse({
      department: d.department,
      objective: d.objective,
      output_contract: d.output_contract,
      model_tier: routed.model_tier, // route() decides — never the LLM (T-05-11)
      approval_class: raiseApproval(ci.approval_class, d.approval_class),
    });
    return { ...envelope, deps: [...d.deps] };
  });
}

export async function decompose(ci: ClassifiedIntent): Promise<DecomposedEnvelope[]> {
  const db = getDb();
  const rules = await loadPolicy(db);

  if (ci.complexity === "single") {
    // No LLM: one envelope straight from the classification.
    const routed = route(ci, rules);
    const envelope = TaskEnvelope.parse({
      department: ci.departments[0],
      objective: ci.intent_summary,
      output_contract:
        `One self-contained deliverable that fully satisfies: ${ci.intent_summary}. ` +
        "Where the intent leaves specifics (names, prices, categories, dates) undefined, " +
        "mark them as explicit [placeholders] — inventing facts violates this contract.",
      model_tier: routed.model_tier,
      approval_class: ci.approval_class,
    });
    return [{ ...envelope, deps: [] }];
  }

  // 'multi' — one drafting call; parameters come from the 'orchestration'
  // routing row (data, not constants), same own-route rule as classify().
  const own = route(
    { ...ci, task_class: "orchestration" },
    rules,
  );
  if (own.mode !== "subscription") {
    throw new Error(
      `decompose: 'orchestration' routing row resolved mode '${own.mode}' — ` +
        "decomposition runs on subscription-mode models only (no raw provider keys)",
    );
  }
  const deptRows = await db.selectFrom("departments").select("slug").orderBy("slug").execute();
  const departments = deptRows.map((r) => r.slug);
  const taskClasses = [...new Set(rules.map((r) => r.task_class))].sort();
  const basePrompt = draftPrompt(ci, taskClasses, departments);

  let lastFailure = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt =
      attempt === 0
        ? basePrompt
        : `${basePrompt}\n\nYour previous batch was rejected:\n${lastFailure}\nReturn a corrected JSON batch only.`;
    const raw = await runDraftQuery(prompt, own);
    const parsed = DraftBatch.safeParse(raw);
    if (!parsed.success) {
      lastFailure = JSON.stringify(parsed.error.issues);
      continue;
    }
    const lintFailures = lintBatch(parsed.data.envelopes);
    if (lintFailures.length > 0) {
      lastFailure = lintFailures.join("\n");
      continue;
    }
    return finalize(ci, parsed.data.envelopes, rules);
  }
  throw new Error(`decompose: draft batch rejected twice: ${lastFailure}`);
}
