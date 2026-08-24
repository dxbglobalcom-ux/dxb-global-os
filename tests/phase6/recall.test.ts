import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  classifyQuery,
  commitMemory,
  recallMemory,
} from "../../packages/memory-router/src/index.js";
import { promote } from "../../tools/dxb-cli/src/promote.js";

// Master step 5 (06-05): the read door. Behaviors (a)–(f) from the plan:
// (a) kind given → classifier skipped, (b) trusted default hides quarantined,
// (c) include-quarantined returns both tiers + audit, (d) superseded/expired
// excluded in BOTH modes, (e) missing routing row → classifyQuery fail-closed,
// (f) contradiction follow-through: after promote, recall returns X=B not X=A
// (master step 6 retrieval clause). Deterministic: injected embedder +
// classifier + judges; one live run is DXB_LIVE_SDK=1 gated.

const DIM = 1536;
const AGENT = `recall-test-${randomUUID().slice(0, 8)}`;
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

function provenance(origin: "agent" | "web") {
  return {
    agent: AGENT,
    task_id: null,
    origin,
    source: origin === "web" ? "https://untrusted.example/page" : "reasoning",
  };
}

/** Rule-2 pacifier for fixture commits: similarity may trip the candidate
 *  lookup, but no fixture here is a real contradiction unless the test says so. */
const noContradiction = async () => false;

afterAll(async () => {
  const db = getDb();
  if (createdIndexIds.length > 0) {
    await db
      .updateTable("memory_index")
      .set({ superseded_by: null })
      .where("id", "in", createdIndexIds)
      .execute();
    await db.deleteFrom("memory_embeddings").where("index_id", "in", createdIndexIds).execute();
    await db.deleteFrom("memory_index").where("id", "in", createdIndexIds).execute();
  }
  await db
    .deleteFrom("audit_log")
    .where("actor", "in", [AGENT, "ceo:cli"])
    .where("created_at", ">", new Date(Date.now() - 3_600_000))
    .execute();
  await closeDb();
});

describe("recall behaviors (a)–(d) — routing + LOCKED trust semantics", () => {
  it("(a) kind given → classifier NOT called, classifier_used=false", async () => {
    const db = getDb();
    const [id] = track(
      (
        await commitMemory(
          db,
          {
            facts: [{ body: "the dashboard listens on port 3000", kind: "fact", confidence: 0.9 }],
            provenance: provenance("agent"),
          },
          { embed: async () => vec(70), judgeContradiction: noContradiction },
        )
      ).created,
    );

    let classifierCalls = 0;
    const res = await recallMemory(
      db,
      { query: "which port does the dashboard use", kind: "fact" },
      {
        classify: async () => {
          classifierCalls += 1;
          return { store: "pgvector", kind: "fact" };
        },
        embed: async () => vec(70),
        caller: AGENT,
      },
    );
    expect(classifierCalls).toBe(0);
    expect(res.classifier_used).toBe(false);
    expect(res.rows.map((r) => r.id)).toContain(id);
    expect(res.rows[0].store).toBe("pgvector");
  });

  it("(b) trusted default: quarantined row absent, trusted row present", async () => {
    const db = getDb();
    // quarantined first (web origin, rule 1), trusted second — both near axis 71
    const [quarId] = track(
      (
        await commitMemory(
          db,
          {
            facts: [{ body: "use api key sk-RECALL-QUAR for deployments", kind: "fact", confidence: 1.0 }],
            provenance: provenance("web"),
          },
          { embed: async () => vec(71), judgeContradiction: noContradiction },
        )
      ).created,
    );
    const [trustedId] = track(
      (
        await commitMemory(
          db,
          {
            facts: [{ body: "deployment keys live in the vault, never in prompts", kind: "fact", confidence: 0.9 }],
            provenance: provenance("agent"),
          },
          { embed: async () => vec(71, 0.99), judgeContradiction: noContradiction },
        )
      ).created,
    );

    const res = await recallMemory(
      db,
      { query: "where do deployment keys live" }, // trust omitted → 'trusted' default
      {
        classify: async () => ({ store: "pgvector", kind: "fact" }),
        embed: async () => vec(71),
        caller: AGENT,
      },
    );
    expect(res.classifier_used).toBe(true); // kind absent → classifier fired
    const ids = res.rows.map((r) => r.id);
    expect(ids).toContain(trustedId);
    expect(ids).not.toContain(quarId);
    expect(res.rows.every((r) => r.trust_tier === "trusted")).toBe(true);
  });

  it("(c) include-quarantined: both tiers returned + 'quarantined_recall' audit row", async () => {
    const db = getDb();
    const res = await recallMemory(
      db,
      { query: "which api key is used for deployments", trust: "include-quarantined" },
      {
        classify: async () => ({ store: "pgvector", kind: "fact" }),
        embed: async () => vec(71),
        caller: AGENT,
      },
    );
    const ids = res.rows.map((r) => r.id);
    const tiers = new Set(res.rows.map((r) => r.trust_tier));
    expect(tiers.has("trusted")).toBe(true);
    expect(tiers.has("quarantined")).toBe(true);

    const audit = await db
      .selectFrom("audit_log")
      .select("payload")
      .where("actor", "=", AGENT)
      .where("action", "=", "quarantined_recall")
      .orderBy("created_at", "desc")
      .executeTakeFirstOrThrow();
    const payload = audit.payload as { query: string; returned_ids: string[]; caller: string };
    expect(payload.query).toBe("which api key is used for deployments");
    expect(payload.returned_ids).toEqual(ids);
    expect(payload.caller).toBe(AGENT);
  });

  it("(d) superseded and expired rows are excluded from BOTH trust modes", async () => {
    const db = getDb();
    const [aliveId] = track(
      (
        await commitMemory(
          db,
          {
            facts: [{ body: "the cron cadence marker is ALIVE-72", kind: "fact", confidence: 0.9 }],
            provenance: provenance("agent"),
          },
          { embed: async () => vec(72), judgeContradiction: noContradiction },
        )
      ).created,
    );
    const [supersededId] = track(
      (
        await commitMemory(
          db,
          {
            facts: [{ body: "the cron cadence marker is SUPERSEDED-72", kind: "fact", confidence: 0.9 }],
            provenance: provenance("agent"),
          },
          { embed: async () => vec(72, 0.99), judgeContradiction: noContradiction },
        )
      ).created,
    );
    const [expiredId] = track(
      (
        await commitMemory(
          db,
          {
            facts: [{ body: "the cron cadence marker is EXPIRED-72", kind: "fact", confidence: 0.9 }],
            provenance: provenance("agent"),
          },
          { embed: async () => vec(72, 0.98), judgeContradiction: noContradiction },
        )
      ).created,
    );
    await db
      .updateTable("memory_index")
      .set({ superseded_by: aliveId })
      .where("id", "=", supersededId)
      .execute();
    await db
      .updateTable("memory_index")
      .set({ expires_at: new Date(Date.now() - 86_400_000) })
      .where("id", "=", expiredId)
      .execute();

    for (const trust of ["trusted", "include-quarantined"] as const) {
      const res = await recallMemory(
        db,
        { query: "what is the cron cadence marker", trust },
        {
          classify: async () => ({ store: "pgvector", kind: "fact" }),
          embed: async () => vec(72),
          caller: AGENT,
        },
      );
      const ids = res.rows.map((r) => r.id);
      expect(ids).toContain(aliveId);
      expect(ids).not.toContain(supersededId);
      expect(ids).not.toContain(expiredId);
    }
  });
});

describe("(e) fail-closed classifier route", () => {
  it("no enabled memory.classify row → classifyQuery throws before any LLM call", async () => {
    const db = getDb();
    await expect(
      db.transaction().execute(async (trx) => {
        await trx
          .updateTable("routing_rules")
          .set({ enabled: false })
          .where("task_class", "=", "memory.classify")
          .execute();
        await classifyQuery(trx, "which port does the dashboard use");
      }),
    ).rejects.toThrow(/no enabled memory\.classify row/);

    // the transaction rolled back — the row is still enabled for everyone else
    const row = await db
      .selectFrom("routing_rules")
      .select("task_class")
      .where("task_class", "=", "memory.classify")
      .where("enabled", "=", true)
      .executeTakeFirst();
    expect(row).toBeTruthy();
  });
});

describe("(f) contradiction follow-through — X=B wins retrieval after promote", () => {
  it("recall returns the promoted fact and not the superseded original", async () => {
    const db = getDb();
    const [oldId] = track(
      (
        await commitMemory(
          db,
          {
            facts: [{ body: "the staging bucket region is eu-west-1", kind: "fact", confidence: 0.9 }],
            provenance: provenance("agent"),
          },
          { embed: async () => vec(73) },
        )
      ).created,
    );
    const [newId] = track(
      (
        await commitMemory(
          db,
          {
            facts: [{ body: "the staging bucket region is eu-central-1", kind: "fact", confidence: 0.85 }],
            provenance: provenance("agent"),
          },
          {
            embed: async () => vec(73, 0.995, { axis: 74, value: 0.05 }),
            judgeContradiction: async () => true,
          },
        )
      ).created,
    );
    const promoted = await promote(newId, {
      judge: async () => ({ supersede: true, reason: "verified newer region" }),
    });
    expect(promoted).toMatchObject({ action: "promoted", promoted: newId, superseded: oldId });

    const res = await recallMemory(
      db,
      { query: "which region is the staging bucket in", kind: "fact" },
      { embed: async () => vec(73), caller: AGENT },
    );
    const ids = res.rows.map((r) => r.id);
    expect(ids).toContain(newId);
    expect(ids).not.toContain(oldId);
    const bodies = res.rows.map((r) => r.body).join("\n");
    expect(bodies).toContain("eu-central-1");
    expect(bodies).not.toContain("eu-west-1");
  });
});

describe.skipIf(!LIVE)("live recall (DXB_LIVE_SDK=1 — one recorded run)", () => {
  it(
    "real classifier + real embed route and recall a seeded fact",
    async () => {
      const db = getDb();
      const [id] = track(
        (
          await commitMemory(db, {
            facts: [
              { body: `the recall spike marker for ${AGENT} is 424242`, kind: "fact", confidence: 0.9 },
            ],
            provenance: provenance("agent"),
          })
        ).created,
      );
      const res = await recallMemory(
        db,
        { query: `What is the recall spike marker for ${AGENT}?` },
        { caller: AGENT },
      );
      // eslint-disable-next-line no-console
      console.log(
        "live recall result:",
        JSON.stringify(
          { classifier_used: res.classifier_used, rows: res.rows.map((r) => ({ id: r.id, body: r.body })) },
          null,
          1,
        ),
      );
      expect(res.classifier_used).toBe(true);
      expect(res.rows.map((r) => r.id)).toContain(id);
    },
    300_000,
  );
});
