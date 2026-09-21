import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { pinHookOff, watchLedgers } from "../helpers/suite-scope.js";
import { commitMemory } from "../../packages/memory-router/src/index.js";
import { promote } from "../../tools/dxb-cli/src/promote.js";

// Master step 6 (06-04 write half): trusted "X=A" + contradicting "X=B" →
// flagged quarantined with provenance.meta.contradicts → dxb promote →
// superseded_by chain, new row trusted, full audit. Deterministic: injected
// embedder + judges (runWorkerOnce-style seams); one live contradiction run is
// DXB_LIVE_SDK=1 gated. Retrieval-wins assertion lands with 06-05 recall.

const DIM = 1536;
const AGENT = `contra-test-${randomUUID().slice(0, 8)}`;

// Its own footprints in audit_log, swept in afterAll below.
const ledgerScope = watchLedgers(() => getDb());
const LIVE = process.env.DXB_LIVE_SDK === "1";

function vec(axis: number, value = 1, bleed?: { axis: number; value: number }): number[] {
  const v = new Array<number>(DIM).fill(0);
  v[axis] = value;
  if (bleed) v[bleed.axis] = bleed.value;
  return v;
}

const createdIndexIds: string[] = [];

function track(created: Array<{ index_id: string }>): string[] {
  const ids = created.map((c) => c.index_id);
  createdIndexIds.push(...ids);
  return ids;
}

afterAll(async () => {
  const db = getDb();
  if (createdIndexIds.length > 0) {
    // break superseded_by self-references before deleting
    await db
      .updateTable("memory_index")
      .set({ superseded_by: null })
      .where("id", "in", createdIndexIds)
      .execute();
    await db.deleteFrom("memory_embeddings").where("index_id", "in", createdIndexIds).execute();
    await db.deleteFrom("memory_index").where("id", "in", createdIndexIds).execute();
  }
  // 2026-09-21: THE HOUR WAS NOT OWNERSHIP. This line used to delete every
  // `ceo:cli` audit row written in the previous SIXTY MINUTES — and the
  // battery runs `tests/phase7/watchdog` before this file, whose kill-switch
  // rows carry that same actor. Measured that day, running each file alone:
  // this suite ended a run with audit_log FIVE ROWS SMALLER than it started,
  // and the five were the watchdog's. A suite may only delete what it can
  // prove it wrote (E9.3), so the predicate is now its own watermark plus its
  // own actors — and an hour of the company's real history is safe from it.
  await ledgerScope.sweep({
    audit: [
      { actor: AGENT },
      // `ceo:cli` is a SHARED actor — the breaker, the approvals, the kill
      // switch and the promote path all write under it — so the actor alone
      // is not a signature, and the adversarial pass proved it: with the
      // action left out, this sweep deleted a foreign `kill_switch.on` row
      // written while the suite ran. These two are what this file itself
      // does, measured, and nothing else here is ours.
      { actor: "ceo:cli", action: "memory_promoted" },
      { actor: "ceo:cli", action: "memory_promotion_declined" },
    ],
  });
  await closeDb();
});

// E10.2: this suite predates the hook — pin the §22 flag off for its
// lifetime (restored + alert swept in the helper afterAll).
pinHookOff(() => getDb());

describe("rule 2 + rule 3 — contradiction flag → CLI promote → superseded_by chain", () => {
  it("flags 'X=B' against trusted 'X=A', then promote flips trust and chains supersession", async () => {
    const db = getDb();

    // seed the trusted fact "X=A" (agent origin → trusted; axis-20 vector)
    const [oldId] = track(
      (
        await commitMemory(
          db,
          {
            facts: [{ body: "The LiteLLM proxy listens on port 4000", kind: "fact", confidence: 0.9 }],
            provenance: { agent: AGENT, task_id: null, origin: "agent", source: "reasoning" },
          },
          { embed: async () => vec(20) },
        )
      ).created,
    );

    // commit the contradicting fact "X=B": near vector (cosine sim ~0.995 >= 0.85),
    // injected judge says yes
    const judgedPairs: Array<[string, string]> = [];
    const [newId] = track(
      (
        await commitMemory(
          db,
          {
            facts: [{ body: "The LiteLLM proxy listens on port 5000", kind: "fact", confidence: 0.8 }],
            provenance: { agent: AGENT, task_id: null, origin: "agent", source: "reasoning" },
          },
          {
            embed: async () => vec(20, 0.995, { axis: 21, value: 0.1 }),
            judgeContradiction: async (existing, incoming) => {
              judgedPairs.push([existing, incoming]);
              return true;
            },
          },
        )
      ).created,
    );

    // the judge saw the right pair
    expect(judgedPairs).toHaveLength(1);
    expect(judgedPairs[0][0]).toContain("port 4000");
    expect(judgedPairs[0][1]).toContain("port 5000");

    // flagged: quarantined + provenance.meta.contradicts + audit
    const flagged = await db
      .selectFrom("memory_index")
      .select(["trust_tier", "provenance"])
      .where("id", "=", newId)
      .executeTakeFirstOrThrow();
    expect(flagged.trust_tier).toBe("quarantined");
    expect((flagged.provenance as { meta: { contradicts: string } }).meta.contradicts).toBe(oldId);

    const flagAudit = await db
      .selectFrom("audit_log")
      .select("payload")
      .where("actor", "=", AGENT)
      .where("action", "=", "contradiction_flagged")
      .executeTakeFirstOrThrow();
    expect(flagAudit.payload).toMatchObject({ index_id: newId, contradicts: oldId });

    // promote with an injected supersede-yes judgment (rule 3, CLI-only surface)
    const result = await promote(newId, {
      judge: async (ctx) => {
        expect(ctx.candidateBody).toContain("port 5000");
        expect(ctx.targetBody).toContain("port 4000");
        return { supersede: true, reason: "newer verified configuration" };
      },
    });
    expect(result).toMatchObject({ action: "promoted", promoted: newId, superseded: oldId });

    // chain: old superseded by new; new trusted; meta resolved; nothing deleted
    const oldRow = await db
      .selectFrom("memory_index")
      .select(["superseded_by", "trust_tier"])
      .where("id", "=", oldId)
      .executeTakeFirstOrThrow();
    expect(oldRow.superseded_by).toBe(newId);
    const newRow = await db
      .selectFrom("memory_index")
      .select(["trust_tier", "provenance", "superseded_by"])
      .where("id", "=", newId)
      .executeTakeFirstOrThrow();
    expect(newRow.trust_tier).toBe("trusted");
    expect(newRow.superseded_by).toBeNull();
    expect((newRow.provenance as { meta: { contradicts_resolved: string } }).meta.contradicts_resolved).toBe(oldId);

    const promoteAudit = await db
      .selectFrom("audit_log")
      .select("payload")
      .where("action", "=", "memory_promoted")
      .orderBy("created_at", "desc")
      .executeTakeFirstOrThrow();
    expect(promoteAudit.payload).toMatchObject({ promoted: newId, superseded: oldId });
    expect((promoteAudit.payload as { reason: string }).reason).toContain("newer verified");
  });

  it("promotion declined: row stays quarantined, decline audited, target untouched", async () => {
    const db = getDb();
    const [oldId] = track(
      (
        await commitMemory(
          db,
          {
            facts: [{ body: "embedding dimension is pinned at 1536", kind: "fact", confidence: 0.95 }],
            provenance: { agent: AGENT, task_id: null, origin: "agent", source: "reasoning" },
          },
          { embed: async () => vec(30) },
        )
      ).created,
    );
    const [newId] = track(
      (
        await commitMemory(
          db,
          {
            facts: [{ body: "embedding dimension is pinned at 4096", kind: "fact", confidence: 0.3 }],
            provenance: { agent: AGENT, task_id: null, origin: "agent", source: "reasoning" },
          },
          { embed: async () => vec(30, 0.99), judgeContradiction: async () => true },
        )
      ).created,
    );

    const result = await promote(newId, {
      judge: async () => ({ supersede: false, reason: "low-confidence claim, keep the pinned value" }),
    });
    expect(result.action).toBe("declined");

    const rows = await db
      .selectFrom("memory_index")
      .select(["id", "trust_tier", "superseded_by"])
      .where("id", "in", [oldId, newId])
      .execute();
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    expect(byId[newId].trust_tier).toBe("quarantined"); // unchanged
    expect(byId[oldId].superseded_by).toBeNull(); // untouched
    const decline = await db
      .selectFrom("audit_log")
      .select("payload")
      .where("action", "=", "memory_promotion_declined")
      .orderBy("created_at", "desc")
      .executeTakeFirstOrThrow();
    expect(decline.payload).toMatchObject({ index_id: newId });
  });

  it("only quarantined rows can be promoted (trusted row → PromoteError)", async () => {
    const db = getDb();
    const [trustedId] = track(
      (
        await commitMemory(
          db,
          {
            facts: [{ body: "budget ceiling is 150 EUR per month", kind: "fact", confidence: 0.9 }],
            provenance: { agent: AGENT, task_id: null, origin: "agent", source: "reasoning" },
          },
          { embed: async () => vec(40) },
        )
      ).created,
    );
    await expect(promote(trustedId, { judge: async () => ({ supersede: true, reason: "x" }) })).rejects.toThrow(
      /only quarantined rows can be promoted/,
    );
  });
});

describe.skipIf(!LIVE)("live contradiction judge (DXB_LIVE_SDK=1 — one recorded run)", () => {
  it(
    "real embed + real cheap-model judge flags a direct numeric contradiction",
    async () => {
      const db = getDb();
      const [oldId] = track(
        (
          await commitMemory(db, {
            facts: [{ body: "The DXB monthly OS budget hard ceiling is 150 EUR", kind: "fact", confidence: 0.9 }],
            provenance: { agent: AGENT, task_id: null, origin: "agent", source: "reasoning" },
          })
        ).created,
      );
      const { created } = await commitMemory(db, {
        facts: [{ body: "The DXB monthly OS budget hard ceiling is 900 EUR", kind: "fact", confidence: 0.9 }],
        provenance: { agent: AGENT, task_id: null, origin: "agent", source: "reasoning" },
      });
      track(created);
      // eslint-disable-next-line no-console
      console.log("live contradiction result:", JSON.stringify(created, null, 1));
      expect(created[0].trust_tier).toBe("quarantined");
      expect(created[0].contradicts).toBe(oldId);
    },
    300_000,
  );
});
