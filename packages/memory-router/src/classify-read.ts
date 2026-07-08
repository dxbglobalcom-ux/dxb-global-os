// The read path (master PHASE-06 steps 5+7): classifyQuery picks the store with
// the 06-02 spike-validated cheap classifier, recallMemory applies the LOCKED
// trust semantics. Rules (⛔ FABLE-ONLY to relax):
//   - the router NEVER queries stores by guess: kind given → KIND_STORE lookup,
//     classifier skipped entirely; kind absent → classifyQuery, and a parse
//     failure THROWS — no silent fallback store (misrouting is silent quality loss)
//   - trust='trusted' is the default and quarantined rows never appear in it;
//     the exclusion happens at the SQL layer (liveMemoryFilter), never by
//     post-filtering (T-06-14)
//   - trust='include-quarantined' widens to both tiers and appends an audit_log
//     'quarantined_recall' row in the same call — a gate, not a black hole
// PROMPT CONTRACT: CLASSIFY_SYSTEM_PROMPT below is lifted VERBATIM from
// tests/phase6/routing-spike.mjs (06-02 gate PASS 20/20, content hash
// sha256:2eeccfde17360711e46a0c6c96ba181b1c6bc852fb69e9500159eb5a8cda7290).
// Model/mode come from routing_rules task_class='memory.classify' at call time —
// no model literal in this file; a missing row fails CLOSED (kernel policy
// discipline, T-06-16: callers can retry with an explicit kind).
import { readFile } from "node:fs/promises";
import { z } from "zod";
import type { Kysely, Selectable } from "kysely";
import { llmCall, llmEmbed, type DB, type MemoryIndexTable } from "@dxb/shared";
import { cosineSearch, liveMemoryFilter } from "./adapters/pgvector.js";
import { readDoc } from "./adapters/notebook.js";
import { readObservationByRef } from "./adapters/claude-mem.js";
import {
  KIND_STORE,
  RecallInput,
  type MemoryKind,
  type MemoryStore,
} from "./write-policy.js";

const CLASSIFY_SYSTEM_PROMPT = `You route a memory query to exactly one store. Stores and their contracts:
- pgvector: atomic facts — short factual statements looked up semantically (numbers, ports, settings, single-line truths)
- graphify: entity relations — which component connects to / depends on / gates which; pipelines; links between things
- obsidian: authored artifacts — documents, notes, reports, templates that were written and are retrieved whole
- notebook: research corpus and procedures — how-to steps, research conclusions, long-form investigation material
Kind hints: fact->pgvector, relation->graphify, artifact->obsidian, procedure->notebook.
Reply with STRICT JSON only, no prose, no code fences: {"store":"pgvector"|"graphify"|"obsidian"|"notebook","kind":"fact"|"relation"|"artifact"|"procedure"}`;

/** All router LLM spend is attributed to the OS department key (06-01). */
const ROUTER_DEPARTMENT = "os";
/** LiteLLM alias from study-cards/litellm.md Embeddings section (06-01 pin). */
const EMBED_MODEL_ALIAS = "embed-small";

const STORES: ReadonlySet<string> = new Set(Object.values(KIND_STORE));
const KINDS: ReadonlySet<string> = new Set(Object.keys(KIND_STORE));

/** Strict-parse failure on the classifier output. Thrown, never swallowed:
 *  a guessed store is a silent quality loss (LOCKED rationale). */
export class ClassifyParseError extends Error {
  constructor(raw: string) {
    super(
      "memory.classify returned non-strict JSON — refusing to guess a store: " +
        JSON.stringify(raw.slice(0, 200)),
    );
    this.name = "ClassifyParseError";
  }
}

export interface ClassifiedQuery {
  store: MemoryStore;
  kind: MemoryKind;
}

/** Route a free-text memory query to exactly one store with the cheap
 *  classifier. Fail-closed on a missing routing row; throws on any
 *  non-strict-JSON or inconsistent output. */
export async function classifyQuery(db: Kysely<DB>, query: string): Promise<ClassifiedQuery> {
  const rule = await db
    .selectFrom("routing_rules")
    .select(["model"])
    .where("task_class", "=", "memory.classify")
    .where("enabled", "=", true)
    .orderBy("priority", "desc")
    .limit(1)
    .executeTakeFirst();
  if (!rule) {
    throw new Error(
      "routing_rules has no enabled memory.classify row — read path is fail-closed, seed it first",
    );
  }
  const res = await llmCall({
    department: ROUTER_DEPARTMENT,
    model: rule.model,
    // max_tokens >= 200: the classifier model spends reasoning tokens before content
    // (06-01 pitfall, litellm.md card)
    maxTokens: 400,
    messages: [
      { role: "system", content: CLASSIFY_SYSTEM_PROMPT },
      { role: "user", content: query },
    ],
  });
  const t = res.content.trim();
  if (!t.startsWith("{") || !t.endsWith("}")) throw new ClassifyParseError(res.content);
  let parsed: { store?: unknown; kind?: unknown };
  try {
    parsed = JSON.parse(t) as { store?: unknown; kind?: unknown };
  } catch {
    throw new ClassifyParseError(res.content);
  }
  if (
    typeof parsed.store !== "string" ||
    !STORES.has(parsed.store) ||
    typeof parsed.kind !== "string" ||
    !KINDS.has(parsed.kind) ||
    KIND_STORE[parsed.kind as MemoryKind] !== parsed.store // pair must match the LOCKED composition
  ) {
    throw new ClassifyParseError(res.content);
  }
  return { store: parsed.store as MemoryStore, kind: parsed.kind as MemoryKind };
}

// -- recall -----------------------------------------------------------------

type IndexMeta = Selectable<MemoryIndexTable>;

export interface RecalledMemory {
  id: string;
  kind: MemoryKind;
  store: MemoryStore;
  body: string;
  trust_tier: IndexMeta["trust_tier"];
  confidence: IndexMeta["confidence"];
  created_at: IndexMeta["created_at"];
}

export interface RecallResult {
  rows: RecalledMemory[];
  /** Observability: did the cheap classifier fire (false when kind was given). */
  classifier_used: boolean;
}

export interface RecallDeps {
  /** Test seam; production default = classifyQuery via routing_rules. */
  classify?: (query: string) => Promise<ClassifiedQuery>;
  /** Test seam; production default = llmEmbed via the dxb-os key. */
  embed?: (query: string) => Promise<number[]>;
  /** Audit actor for 'quarantined_recall' / 'memory_ref_broken' rows. */
  caller?: string;
}

async function defaultQueryEmbed(query: string): Promise<number[]> {
  const { vectors } = await llmEmbed({
    department: ROUTER_DEPARTMENT,
    model: EMBED_MODEL_ALIAS,
    input: query,
  });
  return vectors[0];
}

async function appendAudit(
  db: Kysely<DB>,
  actor: string,
  action: string,
  payload: unknown,
): Promise<void> {
  await db
    .insertInto("audit_log")
    .values({ actor, actor_type: "agent", action, task_id: null, payload: JSON.stringify(payload) })
    .execute();
}

interface StoreReadArgs {
  db: Kysely<DB>;
  /** liveMemoryFilter tier opt: 'trusted' (default) or null (both tiers). */
  tierOpt: string | null;
  kind: MemoryKind;
  limit: number;
  query: string;
  embed: (query: string) => Promise<number[]>;
  caller: string;
}

type StoreReader = (args: StoreReadArgs) => Promise<RecalledMemory[]>;

async function readPgvector(a: StoreReadArgs): Promise<RecalledMemory[]> {
  const vector = await a.embed(a.query);
  // trust + superseded/expiry exclusion live INSIDE cosineSearch's shared
  // filter builder — SQL layer, not post-filtering (T-06-14).
  const hits = await cosineSearch(a.db, {
    vector,
    limit: a.limit,
    trustTier: a.tierOpt,
    kind: a.kind,
  });
  if (hits.length === 0) return [];
  const metas = await a.db
    .selectFrom("memory_index")
    .select(["id", "kind", "trust_tier", "confidence", "created_at"])
    .where("id", "in", hits.map((h) => h.index_id))
    .execute();
  const byId = new Map(metas.map((m) => [m.id, m]));
  return hits.map((h) => {
    const m = byId.get(h.index_id);
    if (!m) throw new Error(`recall: memory_index row vanished for ${h.index_id}`);
    return {
      id: m.id,
      kind: m.kind as MemoryKind,
      store: "pgvector" as const,
      body: h.body,
      trust_tier: m.trust_tier,
      confidence: m.confidence,
      created_at: m.created_at,
    };
  });
}

/** Metadata-ordered reader over a ref-resolving store: memory_index rows
 *  (created_at desc) → resolve each body by ref. A broken ref is LOUD +
 *  audited — recall must never read as silently empty. */
function makeRefReader(
  store: MemoryStore | "claude-mem",
  resolve: (ref: string) => Promise<string> | string,
): StoreReader {
  return async (a) => {
    const rows = await a.db
      .selectFrom("memory_index")
      .select(["id", "kind", "ref", "trust_tier", "confidence", "created_at"])
      .where("store", "=", store)
      .where((eb) => liveMemoryFilter(eb, { trustTier: a.tierOpt, kind: a.kind }))
      .orderBy("created_at", "desc")
      .limit(a.limit)
      .execute();
    const out: RecalledMemory[] = [];
    for (const row of rows) {
      let body: string;
      try {
        body = await resolve(row.ref);
      } catch (e) {
        await appendAudit(a.db, a.caller, "memory_ref_broken", { index_id: row.id, ref: row.ref });
        throw new Error(
          `recall: memory ref broken for index ${row.id} at '${row.ref}' — ${(e as Error).message}`,
        );
      }
      out.push({
        id: row.id,
        kind: row.kind as MemoryKind,
        store: store as MemoryStore,
        body,
        trust_tier: row.trust_tier,
        confidence: row.confidence,
        created_at: row.created_at,
      });
    }
    return out;
  };
}

// All four spike-confirmed stores are wired (06-06) — plus the claude-mem
// pointer store (read-only; pointers land via syncClaudeMem, never the door).
const STORE_READERS: Record<MemoryStore | "claude-mem", StoreReader> = {
  pgvector: readPgvector,
  obsidian: makeRefReader("obsidian", (ref) => readFile(ref, "utf8")),
  graphify: makeRefReader("graphify", (ref) => readFile(ref, "utf8")),
  notebook: makeRefReader("notebook", (ref) => readDoc(ref)),
  "claude-mem": makeRefReader("claude-mem", (ref) => readObservationByRef(ref)),
};

/** The ONE read door: metadata-routed, trust-filtered recall over the memory
 *  stores. RecallInput.parse enforces the 1..20 limit clamp and the 'trusted'
 *  default before anything touches the database. */
export async function recallMemory(
  db: Kysely<DB>,
  input: z.input<typeof RecallInput>,
  deps: RecallDeps = {},
): Promise<RecallResult> {
  const parsed = RecallInput.parse(input);
  const classify = deps.classify ?? ((q: string) => classifyQuery(db, q));
  const embed = deps.embed ?? defaultQueryEmbed;
  const caller = deps.caller ?? "memory-router";

  let kind: MemoryKind;
  let classifierUsed = false;
  if (parsed.kind !== undefined) {
    kind = parsed.kind; // kind given → classifier skipped entirely (LOCKED)
  } else {
    kind = (await classify(parsed.query)).kind;
    classifierUsed = true;
  }
  const store: MemoryStore = KIND_STORE[kind];
  const tierOpt = parsed.trust === "trusted" ? "trusted" : null;

  const rows = await STORE_READERS[store]({
    db,
    tierOpt,
    kind,
    limit: parsed.limit,
    query: parsed.query,
    embed,
    caller,
  });

  if (parsed.trust === "include-quarantined") {
    await appendAudit(db, caller, "quarantined_recall", {
      query: parsed.query,
      returned_ids: rows.map((r) => r.id),
      caller,
    });
  }

  return { rows, classifier_used: classifierUsed };
}
