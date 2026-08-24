import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  commitMemory,
  compactExpired,
  notebookBaseUrl,
  recallMemory,
  KIND_STORE,
  type MemoryKind,
} from "../../packages/memory-router/src/index.js";
import { deleteDoc } from "../../packages/memory-router/src/adapters/notebook.js";

// Master step 10 (06-08): the known-fact battery + the compaction cron test.
// The SAME 20 facts the 06-02 spike classified are now written THROUGH the
// router into their stores and recalled end-to-end — the spike measured
// classification, this measures the WHOLE pipeline. Gate: >=18/20 (90%).
// Fixture-drift guard (T-06-04): sha256 pinned to the fixture content at the
// spike commit 7ba3e46 (verified: git show 7ba3e46:...known-facts.json |
// sha256sum — the spike report itself pinned the PROMPT hash; the fixture pin
// is derived from that commit and recorded here + in 06-VERIFICATION).
// Deterministic mode: classifier seam = the spike's recorded classifications
// (20/20 diagonal — fixture labels), embed seam = fixture axis. Live gate run
// (DXB_LIVE_SDK=1): real classifier + real embeddings, no seams on the read path.

const FIXTURE_PATH = "tests/phase6/fixtures/known-facts.json";
const FIXTURE_SHA256 = "ec5547cae6cb800477b1b645cb707a54caf8ccc690395dea8db89aab200c37da";

const DIM = 1536;
const LIVE = process.env.DXB_LIVE_SDK === "1";
const AGENT = `battery-test-${randomUUID().slice(0, 8)}`;
const COMPACT_ACTOR = "memory-router:compaction";
const TEST_START = new Date();

interface FixtureEntry {
  id: number;
  question: string;
  fact: string;
  kind: MemoryKind;
  correct_store: string;
}

const fixtureRaw = readFileSync(FIXTURE_PATH, "utf8");
const FIXTURE: FixtureEntry[] = JSON.parse(fixtureRaw);

function vec(axis: number): number[] {
  const v = new Array<number>(DIM).fill(0);
  v[axis] = 1;
  return v;
}

/** Deterministic embed: question and fact of the same fixture entry share an
 *  axis, so pgvector recall is exact; unrelated text lands elsewhere. */
const axisEmbed = async (text: string): Promise<number[]> => {
  const hit = FIXTURE.find((f) => text.includes(f.fact) || text.includes(f.question));
  return vec(hit ? 100 + hit.id : 99);
};

const noContradiction = async () => false;
const provenance = { agent: AGENT, task_id: null, origin: "agent" as const, source: "reasoning" };

const createdIndexIds: string[] = [];
const createdFiles: string[] = [];
const createdNotebookRefs: string[] = [];

beforeAll(async () => {
  // FAIL, don't skip — battery evidence requires the full composition up.
  const health = await fetch(`${notebookBaseUrl()}/health`, {
    signal: AbortSignal.timeout(5_000),
  }).catch(() => null);
  if (!health?.ok) {
    throw new Error(
      "open-notebook container is DOWN — the battery requires it. Start it: " +
        "docker compose -f vps/open-notebook/compose.local.yml up -d (06-01)",
    );
  }
});

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
  await db.deleteFrom("audit_log").where("actor", "=", AGENT).execute();
  await db
    .deleteFrom("audit_log")
    .where("actor", "=", COMPACT_ACTOR)
    .where("created_at", ">", TEST_START)
    .execute();
  for (const f of createdFiles) await rm(f, { force: true });
  for (const ref of createdNotebookRefs) await deleteDoc(ref).catch(() => undefined);
  await closeDb();
});

describe("known-fact battery — 20 facts end-to-end across the composition", () => {
  it("fixture drift guard: sha256 matches the spike-commit content (T-06-04)", () => {
    const hash = createHash("sha256").update(fixtureRaw).digest("hex");
    expect(hash).toBe(FIXTURE_SHA256);
    expect(FIXTURE).toHaveLength(20);
  });

  it(
    "BATTERY >= 18/20: commit through the door, recall through the full pipeline, verify bodies",
    async () => {
      const db = getDb();
      const commitDeps = LIVE
        ? { judgeContradiction: noContradiction }
        : { embed: axisEmbed, judgeContradiction: noContradiction };

      // (1) write all 20 facts THROUGH the single door
      const idByFixture = new Map<number, string>();
      for (const entry of FIXTURE) {
        const { created } =
          entry.kind === "artifact"
            ? await commitMemory(
                db,
                { artifact: { path: `battery/q${entry.id}.md`, body: entry.fact }, provenance },
                commitDeps,
              )
            : await commitMemory(
                db,
                { facts: [{ body: entry.fact, kind: entry.kind, confidence: 0.9 }], provenance },
                commitDeps,
              );
        const c = created[0];
        createdIndexIds.push(c.index_id);
        idByFixture.set(entry.id, c.index_id);
        expect(c.store).toBe(entry.correct_store); // KIND_STORE composition holds
        if (c.store === "obsidian" || c.store === "graphify") createdFiles.push(c.ref);
        if (c.store === "notebook") createdNotebookRefs.push(c.ref);
      }

      // (2) recall each question through the production read door
      const lines: string[] = [];
      let hits = 0;
      for (const entry of FIXTURE) {
        const res = await recallMemory(
          db,
          { query: entry.question },
          LIVE
            ? { caller: AGENT }
            : {
                classify: async () => ({
                  store: KIND_STORE[entry.kind],
                  kind: entry.kind,
                }),
                embed: axisEmbed,
                caller: AGENT,
              },
        );
        expect(res.classifier_used).toBe(true); // kind never given — full pipeline
        // (3) hit = the fixture fact's BODY came back (id-tracked row)
        const expectedId = idByFixture.get(entry.id);
        const hit = res.rows.some((r) => r.id === expectedId && r.body.includes(entry.fact));
        if (hit) hits += 1;
        lines.push(
          `Q${String(entry.id).padStart(2, "0")} ${entry.kind.padEnd(9)} -> ${entry.correct_store.padEnd(8)} ${hit ? "HIT" : "MISS"}`,
        );
      }

      // (4) per-question table + machine-greppable score line
      // eslint-disable-next-line no-console
      console.log(lines.join("\n"));
      // eslint-disable-next-line no-console
      console.log(`BATTERY=${hits}/20`);
      expect(hits).toBeGreaterThanOrEqual(18);
    },
    600_000,
  );
});

describe("compaction — rule 5 cron half (delete-free, audited, idempotent)", () => {
  it("expired row is self-tombstoned, excluded from recall, audited — nothing deleted", async () => {
    const db = getDb();
    const [committed] = (
      await commitMemory(
        db,
        {
          facts: [{ body: "the compaction probe marker is EXP-130", kind: "fact", confidence: 0.9 }],
          provenance,
        },
        { embed: async () => vec(130), judgeContradiction: noContradiction },
      )
    ).created;
    createdIndexIds.push(committed.index_id);
    await db
      .updateTable("memory_index")
      .set({ expires_at: new Date(Date.now() - 86_400_000) })
      .where("id", "=", committed.index_id)
      .execute();

    const before = await db
      .selectFrom("memory_index")
      .select(({ fn }) => fn.countAll<string>().as("n"))
      .executeTakeFirstOrThrow();

    const result = await compactExpired(db);
    expect(result.ids).toContain(committed.index_id);
    expect(result.count).toBeGreaterThanOrEqual(1);

    // delete-free: row count unchanged, row still there, self-tombstoned
    const after = await db
      .selectFrom("memory_index")
      .select(({ fn }) => fn.countAll<string>().as("n"))
      .executeTakeFirstOrThrow();
    expect(after.n).toBe(before.n);
    const row = await db
      .selectFrom("memory_index")
      .select(["superseded_by"])
      .where("id", "=", committed.index_id)
      .executeTakeFirstOrThrow();
    expect(row.superseded_by).toBe(committed.index_id);

    // recall excludes it in BOTH trust modes
    for (const trust of ["trusted", "include-quarantined"] as const) {
      const res = await recallMemory(
        db,
        { query: "what is the compaction probe marker", kind: "fact", trust },
        { embed: async () => vec(130), caller: AGENT },
      );
      expect(res.rows.map((r) => r.id)).not.toContain(committed.index_id);
    }

    // audited: one batch row whose payload carries the id
    const audit = await db
      .selectFrom("audit_log")
      .select("payload")
      .where("actor", "=", COMPACT_ACTOR)
      .where("action", "=", "memory_expired")
      .where("created_at", ">", TEST_START)
      .orderBy("created_at", "desc")
      .executeTakeFirstOrThrow();
    const payload = audit.payload as { count: number; ids: string[] };
    expect(payload.ids).toContain(committed.index_id);
    expect(payload.count).toBe(payload.ids.length);
  });

  it("idempotent: a second run marks 0 and appends no audit row", async () => {
    const db = getDb();
    const auditCountBefore = await db
      .selectFrom("audit_log")
      .select(({ fn }) => fn.countAll<string>().as("n"))
      .where("actor", "=", COMPACT_ACTOR)
      .where("created_at", ">", TEST_START)
      .executeTakeFirstOrThrow();

    const second = await compactExpired(db);
    expect(second.count).toBe(0);
    expect(second.ids).toEqual([]);

    const auditCountAfter = await db
      .selectFrom("audit_log")
      .select(({ fn }) => fn.countAll<string>().as("n"))
      .where("actor", "=", COMPACT_ACTOR)
      .where("created_at", ">", TEST_START)
      .executeTakeFirstOrThrow();
    expect(auditCountAfter.n).toBe(auditCountBefore.n);
  });
});
