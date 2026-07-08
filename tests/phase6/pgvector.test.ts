import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  cosineSearch,
  vectorLiteral,
  writeEmbedding,
} from "../../packages/memory-router/src/adapters/pgvector.js";

// Master-plan step 3 verification (06-03): live insert + cosine round-trip
// against local Supabase, NO LLM — hand-built vectors at the pinned dimension.
// Negative proofs: FK orphan rejection (write-order contract) and the
// trusted-default filter (T-06-08). Cleanup deletes ONLY rows this file
// created (tracked ids); the suite runs sequentially (fileParallelism: false).
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const DIM = 1536; // study-cards/litellm.md Embeddings pin — must equal the migration's vector(N)

const createdIndexIds: string[] = [];

/** Unit-ish vector: zeros with the given axis components set. */
function vec(components: Record<number, number>): number[] {
  const v = new Array<number>(DIM).fill(0);
  for (const [axis, value] of Object.entries(components)) v[Number(axis)] = value;
  return v;
}

async function insertIndexRow(
  over: Partial<{ trust_tier: string; kind: string; expires_at: Date }> = {},
): Promise<string> {
  const row = await getDb()
    .insertInto("memory_index")
    .values({
      kind: "fact",
      store: "pgvector",
      ref: "test:pgvector-roundtrip",
      provenance: JSON.stringify({ source: "test", agent: "vitest", origin: "internal" }),
      trust_tier: "trusted",
      confidence: 0.9,
      ...over,
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  createdIndexIds.push(row.id);
  return row.id;
}

afterAll(async () => {
  const db = getDb();
  if (createdIndexIds.length > 0) {
    await db.deleteFrom("memory_embeddings").where("index_id", "in", createdIndexIds).execute();
    await db.deleteFrom("memory_index").where("id", "in", createdIndexIds).execute();
  }
  await closeDb();
});

describe("vectorLiteral — T-06-07 validation", () => {
  it("builds a pgvector literal from floats and rejects non-finite/empty input", () => {
    expect(vectorLiteral([1, -0.5, 2])).toBe("[1,-0.5,2]");
    expect(() => vectorLiteral([])).toThrow("empty");
    expect(() => vectorLiteral([1, Number.NaN])).toThrow("non-finite");
    // a crafted string can only become a number or throw — never SQL text
    expect(() => vectorLiteral(["1]; DROP TABLE tasks;--" as unknown as number])).toThrow(
      "non-finite",
    );
  });
});

describe("pgvector adapter — live round-trip (master-plan step 3)", () => {
  it("embed body → insert row → cosine-query returns that row first", async () => {
    const db = getDb();
    const aId = await insertIndexRow();
    const bId = await insertIndexRow();
    await db.transaction().execute(async (trx) => {
      await writeEmbedding(trx, { indexId: aId, body: "fact A: litellm port 4000", vector: vec({ 0: 1 }) });
      await writeEmbedding(trx, { indexId: bId, body: "fact B: budget cap 150 EUR", vector: vec({ 1: 1 }) });
    });

    // query vector points mostly at axis 0 → row A must rank first
    const hits = await cosineSearch(db, { vector: vec({ 0: 0.9, 1: 0.1 }), limit: 2 });
    expect(hits.length).toBe(2);
    expect(hits[0].index_id).toBe(aId);
    expect(hits[0].body).toBe("fact A: litellm port 4000");
    expect(hits[0].distance).toBeLessThan(hits[1].distance);
    expect(hits[1].index_id).toBe(bId);
  });

  it("FK negative: embedding insert with an unknown index_id is rejected", async () => {
    await expect(
      writeEmbedding(getDb(), {
        indexId: randomUUID(),
        body: "orphan embedding must never land",
        vector: vec({ 2: 1 }),
      }),
    ).rejects.toThrow(/violates foreign key constraint/);
  });

  it("trusted default excludes quarantined rows; explicit null tier includes them", async () => {
    const db = getDb();
    const qId = await insertIndexRow({ trust_tier: "quarantined" });
    await writeEmbedding(db, { indexId: qId, body: "quarantined web claim", vector: vec({ 3: 1 }) });

    const trusted = await cosineSearch(db, { vector: vec({ 3: 1 }), limit: 10 });
    expect(trusted.map((h) => h.index_id)).not.toContain(qId);

    const includeQuarantined = await cosineSearch(db, { vector: vec({ 3: 1 }), limit: 10, trustTier: null });
    expect(includeQuarantined[0]?.index_id).toBe(qId);
  });

  it("expired rows are excluded by the shared live filter", async () => {
    const db = getDb();
    const eId = await insertIndexRow({ expires_at: new Date(Date.now() - 60_000) });
    await writeEmbedding(db, { indexId: eId, body: "expired fact", vector: vec({ 4: 1 }) });

    const hits = await cosineSearch(db, { vector: vec({ 4: 1 }), limit: 10 });
    expect(hits.map((h) => h.index_id)).not.toContain(eId);
  });
});
