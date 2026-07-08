// The single write door into memory (master PHASE-06 §3, write-policy rule set
// LOCKED 1–5 — implemented in THIS order; any change to rule order/content is
// ⛔ FABLE-ONLY). Every memory write is a commitMemory() call: no adapter is
// reachable except through the registry below (T-06-12).
//
// Rule order per item:
//   1. origin ∈ {web,email,video} → trust_tier='quarantined', without exception
//   2. (facts only) embed → cosine >=0.85 vs trusted facts → cheap-model
//      "contradicts?" → yes: force quarantined + provenance.meta.contradicts
//      + audit 'contradiction_flagged'
//   4. ONE transaction: memory_index row + physical store write + audit append
//   5. (data half) expires_at by kind: fact now()+180d; relation/artifact/
//      procedure none — the compaction cron half lands in 06-08
//   (3. promotion lives in tools/dxb-cli/src/promote.ts — CLI-only, LOCKED)
//
// meta placement note (recorded in 06-04 SUMMARY): the LOCKED memory_index
// schema has no meta column — contradiction markers ride inside the provenance
// jsonb under a reserved `meta` key ({ contradicts: <index id> }); promote
// rewrites it to { contradicts_resolved: ... }.
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { type Kysely, type Transaction } from "kysely";
import { llmCall, llmEmbed, type DB } from "@dxb/shared";
import { cosineSearch, writeEmbedding } from "./adapters/pgvector.js";
import { writeNote } from "./adapters/obsidian.js";
import { writeRelationNote } from "./adapters/graphify.js";
import { writeDoc } from "./adapters/notebook.js";

// -- memory.* tool interface (master §3, byte-faithful — LOCKED) ---------------

export const RecallInput = z.object({
  query: z.string().min(3),
  kind: z.enum(["fact", "relation", "artifact", "procedure"]).optional(), // verilirse sınıflandırıcı atlanır
  trust: z.enum(["trusted", "include-quarantined"]).default("trusted"),
  limit: z.number().int().min(1).max(20).default(5),
});
export type RecallInput = z.infer<typeof RecallInput>;

export const CommitInput = z.object({
  facts: z
    .array(
      z.object({
        body: z.string().min(5),
        kind: z.enum(["fact", "relation", "procedure"]),
        confidence: z.number().min(0).max(1).default(0.5),
      }),
    )
    .default([]),
  artifact: z.object({ path: z.string(), body: z.string() }).optional(),
  provenance: z.object({
    agent: z.string(),
    task_id: z.string().uuid().nullable(),
    origin: z.enum(["agent", "ceo", "web", "email", "video"]),
    source: z.string(), // URL / dosya / 'reasoning'
  }),
});
export type CommitInput = z.infer<typeof CommitInput>;

// -- composition (06-02 spike verdict — CONFIRMED 20/20) -----------------------

export const KIND_STORE = {
  fact: "pgvector",
  relation: "graphify",
  artifact: "obsidian",
  procedure: "notebook",
} as const;
export type MemoryKind = keyof typeof KIND_STORE;
export type MemoryStore = (typeof KIND_STORE)[MemoryKind];

// (06-06) The not-wired guard/error is gone: the 06-02 spike CONFIRMED all
// four stores, so every KIND_STORE target now has a live adapter — no deferral.

// -- config + defaults ----------------------------------------------------------

/** LiteLLM alias from study-cards/litellm.md Embeddings section (06-01 pin). */
const EMBED_MODEL_ALIAS = "embed-small";
/** All router LLM spend is attributed to the OS department key (06-01). */
const ROUTER_DEPARTMENT = "os";
/** Rule 2 similarity gate: cosine similarity >= 0.85 ⇔ distance <= 0.15. */
const CONTRADICTION_SIMILARITY = 0.85;
/** Rule 5 (data half): fact TTL. */
const FACT_TTL_DAYS = 180;

async function defaultEmbed(body: string): Promise<number[]> {
  const { vectors } = await llmEmbed({
    department: ROUTER_DEPARTMENT,
    model: EMBED_MODEL_ALIAS,
    input: body,
  });
  return vectors[0];
}

/** Cheap-model "contradicts?" judge — model comes from the routing_rules
 *  memory.classify row (no model literal here; same row the 06-02 spike and
 *  06-05 classifier use). Unparseable output counts as contradicts=true:
 *  when the judge is mute, content stays quarantined (fail-closed, T-06-10). */
async function defaultJudgeContradiction(
  db: Kysely<DB>,
  existingBody: string,
  incomingBody: string,
): Promise<boolean> {
  const rule = await db
    .selectFrom("routing_rules")
    .select(["model"])
    .where("task_class", "=", "memory.classify")
    .where("enabled", "=", true)
    .orderBy("priority", "desc")
    .limit(1)
    .executeTakeFirst();
  if (!rule) throw new Error("routing_rules has no enabled memory.classify row — seed it first");
  const res = await llmCall({
    department: ROUTER_DEPARTMENT,
    model: rule.model,
    // max_tokens >= 200: reasoning tokens before content (litellm.md card pitfall)
    maxTokens: 400,
    messages: [
      {
        role: "system",
        content:
          "You compare two memory statements. Answer whether the NEW statement contradicts " +
          'the EXISTING one. Reply with STRICT JSON only, no prose: {"contradicts":true|false}',
      },
      { role: "user", content: `EXISTING: ${existingBody}\nNEW: ${incomingBody}` },
    ],
  });
  const t = res.content.trim();
  if (t.startsWith("{") && t.endsWith("}")) {
    try {
      const o = JSON.parse(t) as { contradicts?: unknown };
      if (typeof o.contradicts === "boolean") return o.contradicts;
    } catch {
      /* fall through to fail-closed */
    }
  }
  return true; // fail-closed: judge unreadable → treat as contradiction, quarantine
}

// -- store writer registry (the ONLY route to physical adapters, T-06-12) ------

interface StoreWriteArgs {
  indexId: string;
  kind: MemoryKind;
  trustTier: string;
  provenance: unknown;
  createdAt: string;
  body: string;
  /** Present for facts (rule 2 computed it); pgvector requires it. */
  vector?: number[];
}

type StoreWriter = (trx: Transaction<DB>, args: StoreWriteArgs) => Promise<string>;

const STORE_WRITERS: Record<MemoryStore, StoreWriter> = {
  pgvector: async (trx, a) => {
    if (!a.vector) throw new Error("pgvector writer needs the rule-2 vector");
    await writeEmbedding(trx, { indexId: a.indexId, body: a.body, vector: a.vector });
    return a.indexId; // ref = row id (memory_embeddings PK is index_id)
  },
  obsidian: async (_trx, a) =>
    writeNote({
      indexId: a.indexId,
      kind: a.kind,
      trustTier: a.trustTier,
      provenance: a.provenance,
      createdAt: a.createdAt,
      body: a.body,
    }),
  // graphify is corpus-driven (card): the relation note IS the physical write;
  // graph ingest happens at the next build cycle (updateGraphIncremental, 06-08).
  graphify: async (_trx, a) =>
    writeRelationNote({
      indexId: a.indexId,
      trustTier: a.trustTier,
      provenance: a.provenance,
      createdAt: a.createdAt,
      body: a.body,
    }),
  notebook: async (_trx, a) => writeDoc({ indexId: a.indexId, body: a.body }),
};

/** Stores whose physical id is assigned by the service at write time — the
 *  memory_index ref is updated to the returned id inside the same transaction. */
const SERVER_ASSIGNED_REF: ReadonlySet<MemoryStore> = new Set(["notebook"]);

// -- the door -------------------------------------------------------------------

export interface CommitDeps {
  /** Test seam; production default = llmEmbed via the dxb-os key. */
  embed?: (body: string) => Promise<number[]>;
  /** Test seam; production default = cheap model from routing_rules. */
  judgeContradiction?: (existingBody: string, incomingBody: string) => Promise<boolean>;
  /** Test seam (atomicity proofs); production always uses the registry. */
  writers?: Partial<Record<MemoryStore, StoreWriter>>;
}

export interface CommittedMemory {
  index_id: string;
  kind: MemoryKind;
  store: MemoryStore;
  trust_tier: "trusted" | "quarantined";
  ref: string;
  contradicts: string | null;
}

async function appendAudit(
  trx: Transaction<DB>,
  actor: string,
  action: string,
  taskId: string | null,
  payload: unknown,
): Promise<void> {
  await trx
    .insertInto("audit_log")
    .values({ actor, actor_type: "agent", action, task_id: taskId, payload: JSON.stringify(payload) })
    .execute();
}

export async function commitMemory(
  db: Kysely<DB>,
  input: CommitInput,
  deps: CommitDeps = {},
): Promise<{ created: CommittedMemory[] }> {
  const parsed = CommitInput.parse(input);
  const embed = deps.embed ?? defaultEmbed;
  const judge =
    deps.judgeContradiction ?? ((a: string, b: string) => defaultJudgeContradiction(db, a, b));
  const writers = { ...STORE_WRITERS, ...(deps.writers ?? {}) };

  type PreparedItem = {
    kind: MemoryKind;
    store: MemoryStore;
    body: string;
    confidence: number | undefined;
    trust: "trusted" | "quarantined";
    contradicts: string | null;
    vector?: number[];
    extraProvenance?: Record<string, unknown>;
  };

  const items: PreparedItem[] = [
    ...parsed.facts.map((f) => ({
      kind: f.kind,
      store: KIND_STORE[f.kind],
      body: f.body,
      confidence: f.confidence,
      trust: "trusted" as const,
      contradicts: null,
    })),
    ...(parsed.artifact
      ? [
          {
            kind: "artifact" as const,
            store: KIND_STORE.artifact,
            body: parsed.artifact.body,
            confidence: undefined,
            trust: "trusted" as const,
            contradicts: null,
            extraProvenance: { artifact_path: parsed.artifact.path },
          },
        ]
      : []),
  ];
  if (items.length === 0) throw new Error("commitMemory: nothing to commit (no facts, no artifact)");

  // Rule 1: origin decides birth trust — without exception (even confidence 1.0).
  const originQuarantined = ["web", "email", "video"].includes(parsed.provenance.origin);

  // Rules 1+2 run BEFORE the transaction (LLM calls must not hold a tx open).
  for (const item of items) {
    if (originQuarantined) item.trust = "quarantined";
    if (item.kind !== "fact") continue;
    item.vector = await embed(item.body);
    // Rule 2: nearest trusted fact; distance <= 1 - 0.85 means similarity >= 0.85.
    const [top] = await cosineSearch(db, {
      vector: item.vector,
      limit: 1,
      trustTier: "trusted",
      kind: "fact",
    });
    if (top && 1 - top.distance >= CONTRADICTION_SIMILARITY) {
      if (await judge(top.body, item.body)) {
        item.trust = "quarantined";
        item.contradicts = top.index_id;
      }
    }
  }

  // Rule 4: ONE transaction — index rows + physical store writes + audit.
  const created = await db.transaction().execute(async (trx) => {
    const out: CommittedMemory[] = [];
    for (const item of items) {
      const indexId = randomUUID();
      const createdAt = new Date().toISOString();
      const provenance: Record<string, unknown> = {
        ...parsed.provenance,
        ...(item.extraProvenance ?? {}),
        ...(item.contradicts ? { meta: { contradicts: item.contradicts } } : {}),
      };
      // fs-note stores carry a path ref; pgvector's ref is the row id itself;
      // notebook's ref is server-assigned (placeholder here, updated below).
      const ref =
        item.store === "obsidian" || item.store === "graphify"
          ? `memory-store/${item.kind}/${indexId}.md`
          : indexId;
      await trx
        .insertInto("memory_index")
        .values({
          id: indexId,
          kind: item.kind,
          store: item.store,
          ref,
          provenance: JSON.stringify(provenance),
          trust_tier: item.trust,
          ...(item.confidence !== undefined ? { confidence: item.confidence } : {}),
          // Rule 5 (data half): fact 180d TTL; relation/artifact/procedure none.
          expires_at:
            item.kind === "fact" ? new Date(Date.now() + FACT_TTL_DAYS * 86_400_000) : null,
        })
        .execute();
      const writtenRef = await writers[item.store](trx, {
        indexId,
        kind: item.kind,
        trustTier: item.trust,
        provenance,
        createdAt,
        body: item.body,
        vector: item.vector,
      });
      let finalRef = ref;
      if (SERVER_ASSIGNED_REF.has(item.store)) {
        finalRef = writtenRef;
        if (writtenRef !== ref) {
          await trx
            .updateTable("memory_index")
            .set({ ref: writtenRef })
            .where("id", "=", indexId)
            .execute();
        }
      } else if (writtenRef !== ref) {
        throw new Error(`adapter ref mismatch: ${writtenRef} != ${ref}`);
      }
      if (item.contradicts) {
        await appendAudit(trx, parsed.provenance.agent, "contradiction_flagged", parsed.provenance.task_id, {
          index_id: indexId,
          contradicts: item.contradicts,
          kind: item.kind,
        });
      }
      await appendAudit(trx, parsed.provenance.agent, "memory_commit", parsed.provenance.task_id, {
        index_id: indexId,
        kind: item.kind,
        store: item.store,
        trust_tier: item.trust,
        origin: parsed.provenance.origin,
      });
      out.push({
        index_id: indexId,
        kind: item.kind,
        store: item.store,
        trust_tier: item.trust,
        ref: finalRef,
        contradicts: item.contradicts,
      });
    }
    return out;
  });

  return { created };
}
