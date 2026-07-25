// Context-budget helper — MEM-04 / master PHASE-06 step 9: long-running work
// stays inside a fixed token band via the three moves the requirement names —
// compression (summarize the oldest slice), summaries (compact block left in
// place), memory offload (durable facts committed through the router's single
// write door; NEVER a side channel — no adapter/DB write lives in this file).
//
// The band default is the plan constant below; changing it later is a
// routing/quality decision (⛔ FABLE-ONLY, 06-07 objective line). The token
// estimate is a chars/4 heuristic — the band is sized with enough margin that
// the heuristic's error cannot mask a real context breach.
//
// Breach semantics (T-06-21): compression that still lands above the hard
// limit THROWS — a band breach is a bug, never a silent truncation. Losing
// facts silently is the failure mode this module exists to prevent: everything
// evicted from live context is either committed to memory first (recall
// handles ride in the summary block) or the summarizer explicitly returned
// "nothing durable" — and the compression itself is always evented upstream.
import { type Kysely } from "kysely";
import { z } from "zod";
import { getDb, llmCall, type DB } from "@dxb/shared";
import { commitMemory, type CommitDeps } from "@dxb/memory-router";

/** Per-task working-context band, in estimated tokens (plan constant — ⛔ construction author). */
export const CONTEXT_BAND = { softLimit: 12_000, hardLimit: 16_000 } as const;

/** Offload provenance source — the audit trail's marker for door-committed
 *  context evictions (cited by 06-VERIFICATION as MEM-04 evidence). */
export const OFFLOAD_SOURCE = "context-offload";

/** Oldest share of the step history that one compression summarizes away. */
const COMPRESS_SHARE = 0.6;

/** chars/4 heuristic — documented ESTIMATE, not a tokenizer. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export interface ContextEntry {
  /** 1-based step number that produced the entry (summaries carry the last step they cover). */
  step: number;
  kind: "work" | "summary";
  text: string;
}

export interface WorkingContext {
  taskId: string | null;
  workerId: string;
  department: string;
  entries: ContextEntry[];
}

/** The live context as the worker's model would see it. */
export function contextText(ctx: WorkingContext): string {
  return ctx.entries.map((e) => e.text).join("\n\n");
}

/** Master step 9's ölçüm logu row: one record per budget check. */
export interface CompressionMeasurement {
  step: number;
  before: number;
  after: number;
  offloaded_count: number;
}

export interface BudgetCheckResult {
  ctx: WorkingContext;
  compressed: boolean;
  measurement: CompressionMeasurement;
}

export interface ContextBudgetDeps {
  /** Test seam; production default = getDb(). */
  db?: Kysely<DB>;
  /** Test seam; production default = summarize-class routing row via LiteLLM. */
  extractFacts?: (historyText: string) => Promise<string[]>;
  /** Seams forwarded to commitMemory (embed/judge) — deterministic tests. */
  commit?: CommitDeps;
}

const FactsJson = z.object({ facts: z.array(z.string()) });

/** Production fact extractor — model from the routing_rules 'summarize' row
 *  (L4, seeded; no model literal here — same data-driven pattern as the
 *  worker shim and the router's contradiction judge). Unparseable output
 *  THROWS: proceeding would evict history whose facts were never captured
 *  (amnesia), which T-06-21 forbids. */
async function defaultExtractFacts(
  db: Kysely<DB>,
  department: string,
  historyText: string,
): Promise<string[]> {
  const rule = await db
    .selectFrom("routing_rules")
    .select(["model"])
    .where("task_class", "=", "summarize")
    .where("enabled", "=", true)
    .orderBy("priority", "desc")
    .limit(1)
    .executeTakeFirst();
  if (!rule) throw new Error("routing_rules has no enabled summarize row — seed it first");
  const res = await llmCall({
    department,
    model: rule.model,
    maxTokens: 1024,
    messages: [
      {
        role: "system",
        content:
          "You compress an agent work log. Extract the durable facts worth remembering " +
          "beyond this task: decisions, named values, thresholds, identifiers, outcomes. " +
          "Each fact must be a standalone sentence (no 'it/this/above'). Reply with STRICT " +
          'JSON only, no prose: {"facts": ["<fact>", ...]}. If nothing is durable: {"facts": []}',
      },
      { role: "user", content: historyText },
    ],
  });
  let raw = res.content.trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) raw = fenced[1].trim();
  try {
    return FactsJson.parse(JSON.parse(raw)).facts;
  } catch {
    throw new Error("context-budget: summarizer output unparseable — refusing to evict history uncaptured");
  }
}

/** The compress + offload move (soft limit already breached when called):
 *  (a) extract durable facts from the oldest 60% of the step history,
 *  (b) commit each through the single write door (origin 'agent',
 *      source 'context-offload' — rule 2 applies to them like any fact),
 *  (c) replace that slice with a compact summary block carrying the memory
 *      ids (recall handles — offload is memory, not amnesia),
 *  (d) return the new context + the measurement record. */
export async function summarizeAndOffload(
  ctx: WorkingContext,
  before: number,
  deps: ContextBudgetDeps = {},
): Promise<BudgetCheckResult> {
  const db = deps.db ?? getDb();
  const step = ctx.entries[ctx.entries.length - 1]?.step ?? 0;
  const cut = Math.ceil(ctx.entries.length * COMPRESS_SHARE);
  const slice = ctx.entries.slice(0, cut);
  const keep = ctx.entries.slice(cut);

  const extract =
    deps.extractFacts ?? ((text: string) => defaultExtractFacts(db, ctx.department, text));
  const facts = await extract(slice.map((e) => e.text).join("\n\n"));

  let memoryIds: string[] = [];
  if (facts.length > 0) {
    const { created } = await commitMemory(
      db,
      {
        facts: facts.map((body) => ({ body, kind: "fact" as const, confidence: 0.7 })),
        provenance: {
          agent: ctx.workerId,
          task_id: ctx.taskId,
          origin: "agent",
          source: OFFLOAD_SOURCE,
        },
      },
      deps.commit ?? {},
    );
    memoryIds = created.map((c) => c.index_id);
  }

  const firstStep = slice[0]?.step ?? step;
  const lastStep = slice[slice.length - 1]?.step ?? step;
  const summary: ContextEntry = {
    step: lastStep,
    kind: "summary",
    text: [
      `[context compressed: steps ${firstStep}-${lastStep} summarized; ${memoryIds.length} fact(s) offloaded to memory]`,
      memoryIds.length > 0
        ? `[recall handles: ${memoryIds.join(", ")}]`
        : "[summarizer reported nothing durable in this slice]",
    ].join("\n"),
  };

  const next: WorkingContext = { ...ctx, entries: [summary, ...keep] };
  const after = estimateTokens(contextText(next));
  if (after > CONTEXT_BAND.hardLimit) {
    throw new Error(
      `context-budget: hard band breach — ${after} tokens > ${CONTEXT_BAND.hardLimit} AFTER compression at step ${step} (band breach is a bug, never silent)`,
    );
  }
  return {
    ctx: next,
    compressed: true,
    measurement: { step, before, after, offloaded_count: memoryIds.length },
  };
}

/** The between-steps hook: under the soft limit the context passes through
 *  untouched; over it, one summarize-and-offload move runs. Every call
 *  returns a measurement — the per-step ölçüm logu is built from these. */
export async function checkContextBudget(
  ctx: WorkingContext,
  deps: ContextBudgetDeps = {},
): Promise<BudgetCheckResult> {
  const before = estimateTokens(contextText(ctx));
  const step = ctx.entries[ctx.entries.length - 1]?.step ?? 0;
  if (before <= CONTEXT_BAND.softLimit) {
    return {
      ctx,
      compressed: false,
      measurement: { step, before, after: before, offloaded_count: 0 },
    };
  }
  return summarizeAndOffload(ctx, before, deps);
}
