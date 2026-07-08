// pgvector adapter: the ONE write+search surface for the memory_embeddings store
// (master-plan PHASE-06 step 3). 06-04's contradiction check and 06-05's recall
// both stand on cosineSearch and the shared filter builder below — the WHERE
// contract (live + trusted rows) is written ONCE here (T-06-08).
import {
  sql,
  type Expression,
  type ExpressionBuilder,
  type Kysely,
  type SqlBool,
  type Transaction,
} from "kysely";
import type { DB } from "@dxb/shared";

/** Build a pgvector literal from Number()-validated floats ONLY — a crafted
 *  string can never reach SQL through here (T-06-07). */
export function vectorLiteral(vector: number[]): string {
  if (vector.length === 0) throw new Error("vectorLiteral: empty vector");
  const parts = vector.map((component) => {
    const n = Number(component);
    if (!Number.isFinite(n)) throw new Error("vectorLiteral: non-finite vector component");
    return n;
  });
  return `[${parts.join(",")}]`;
}

export interface MemoryFilterOpts {
  /** undefined = safe default 'trusted' (T-06-08); explicit null disables the
   *  tier filter (06-05 include-quarantined path — caller must audit-log it). */
  trustTier?: string | null;
  kind?: string;
}

/** The shared memory_index WHERE contract: not superseded, not expired, and
 *  trusted unless the caller explicitly opts out. 06-04/06-05 reuse this —
 *  never re-write these conditions inline. */
export function liveMemoryFilter(
  eb: ExpressionBuilder<DB, "memory_index">,
  opts: MemoryFilterOpts = {},
): Expression<SqlBool> {
  const tier = opts.trustTier === undefined ? "trusted" : opts.trustTier;
  const conds: Expression<SqlBool>[] = [
    eb("memory_index.superseded_by", "is", null),
    eb.or([
      eb("memory_index.expires_at", "is", null),
      eb("memory_index.expires_at", ">", sql<Date>`now()`),
    ]),
  ];
  if (tier !== null) conds.push(eb("memory_index.trust_tier", "=", tier));
  if (opts.kind !== undefined) conds.push(eb("memory_index.kind", "=", opts.kind));
  return eb.and(conds);
}

export interface WriteEmbeddingArgs {
  indexId: string;
  body: string;
  vector: number[];
}

/** Insert the embedding row for an existing memory_index row. Runs inside the
 *  caller's transaction — the index row is written first, same unit of work
 *  (write path enforces order; FK rejects orphans). */
export async function writeEmbedding(
  trx: Transaction<DB> | Kysely<DB>,
  { indexId, body, vector }: WriteEmbeddingArgs,
): Promise<void> {
  const literal = vectorLiteral(vector);
  await trx
    .insertInto("memory_embeddings")
    .values({ index_id: indexId, body, embedding: sql<string>`${literal}::vector` })
    .execute();
}

export interface CosineSearchArgs extends MemoryFilterOpts {
  vector: number[];
  limit: number;
}

export interface CosineSearchHit {
  index_id: string;
  body: string;
  /** Cosine distance (0 = identical direction, 2 = opposite). */
  distance: number;
}

/** Nearest-neighbour lookup over live (and by default trusted) memories,
 *  ordered by cosine distance — the primitive under 06-04's >=0.85 candidate
 *  lookup and 06-05's recall. */
export async function cosineSearch(
  db: Kysely<DB>,
  { vector, limit, trustTier, kind }: CosineSearchArgs,
): Promise<CosineSearchHit[]> {
  const literal = vectorLiteral(vector);
  return await db
    .selectFrom("memory_embeddings")
    .innerJoin("memory_index", "memory_index.id", "memory_embeddings.index_id")
    .select([
      "memory_embeddings.index_id",
      "memory_embeddings.body",
      sql<number>`memory_embeddings.embedding <=> ${literal}::vector`.as("distance"),
    ])
    .where((eb) => liveMemoryFilter(eb, { trustTier, kind }))
    .orderBy(sql`memory_embeddings.embedding <=> ${literal}::vector`)
    .limit(limit)
    .execute();
}
