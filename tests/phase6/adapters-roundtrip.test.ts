import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  commitMemory,
  recallMemory,
  syncClaudeMem,
  readObservationByRef,
  notebookBaseUrl,
  NotebookDownError,
} from "../../packages/memory-router/src/index.js";
import { readDoc, deleteDoc } from "../../packages/memory-router/src/adapters/notebook.js";

// Master step 8 (06-06): per-store write→memory_index→recall round-trips for
// the full spike-confirmed composition (pgvector, obsidian, graphify,
// notebook) + the claude-mem pointer sync + the cross-adapter atomicity
// negative. Deterministic seams where LLMs would fire; the notebook container
// must be UP — beforeAll FAILS (never skips) when it is down
// (Evidence-Before-Done stays honest).

const DIM = 1536;
const AGENT = `roundtrip-test-${randomUUID().slice(0, 8)}`;

function vec(axis: number): number[] {
  const v = new Array<number>(DIM).fill(0);
  v[axis] = 1;
  return v;
}

const createdIndexIds: string[] = [];
const createdFiles: string[] = [];
const createdNotebookRefs: string[] = [];
let fixtureDir: string;
let fixtureDbPath: string;

function track(created: Array<{ index_id: string }>): string[] {
  const ids = created.map((c) => c.index_id);
  createdIndexIds.push(...ids);
  return ids;
}

const provenance = { agent: AGENT, task_id: null, origin: "agent" as const, source: "reasoning" };
const noContradiction = async () => false;

beforeAll(async () => {
  // FAIL, don't skip: the round-trip suite is the master step 8 evidence.
  const health = await fetch(`${notebookBaseUrl()}/health`, {
    signal: AbortSignal.timeout(5_000),
  }).catch(() => null);
  if (!health?.ok) {
    throw new Error(
      "open-notebook container is DOWN — this suite requires it. Start it: " +
        "docker compose -f vps/open-notebook/compose.local.yml up -d (06-01)",
    );
  }
  fixtureDir = await mkdtemp(path.join(os.tmpdir(), "dxb-claude-mem-fixture-"));
  fixtureDbPath = path.join(fixtureDir, "claude-mem.db");
  const sqlite = new DatabaseSync(fixtureDbPath);
  sqlite.exec(
    `CREATE TABLE observations (
       id INTEGER PRIMARY KEY, project TEXT, title TEXT, subtitle TEXT,
       narrative TEXT, facts TEXT, text TEXT, type TEXT, created_at_epoch INTEGER
     )`,
  );
  const ins = sqlite.prepare(
    "INSERT INTO observations (id, project, title, subtitle, narrative, facts, text, type, created_at_epoch) VALUES (?,?,?,?,?,?,?,?,?)",
  );
  ins.run(990001, "roundtrip-test-project", "Fixture observation one", "sub one",
    "The pgvector adapter round-trip was verified.", JSON.stringify(["fact A", "fact B"]), null, "discovery", 1_700_000_000_001);
  ins.run(990002, "roundtrip-test-project", "Fixture observation two", null,
    "The notebook adapter contract was recorded.", null, null, "change", 1_700_000_000_002);
  sqlite.close();
});

afterAll(async () => {
  const db = getDb();
  if (createdIndexIds.length > 0) {
    await db.deleteFrom("memory_embeddings").where("index_id", "in", createdIndexIds).execute();
    await db.deleteFrom("memory_index").where("id", "in", createdIndexIds).execute();
  }
  await db
    .deleteFrom("memory_index")
    .where("store", "=", "claude-mem")
    .where("ref", "in", ["990001", "990002"])
    .execute();
  await db.deleteFrom("audit_log").where("actor", "=", AGENT).execute();
  for (const f of createdFiles) await rm(f, { force: true });
  for (const ref of createdNotebookRefs) await deleteDoc(ref).catch(() => undefined);
  if (fixtureDir) await rm(fixtureDir, { recursive: true, force: true });
  await closeDb();
});

describe("per-store round-trips (write → memory_index → recall)", () => {
  it("pgvector: fact commit lands index row + embedding row, recall returns the body", async () => {
    const db = getDb();
    const body = `the roundtrip pgvector marker is PGV-${AGENT}`;
    const [id] = track(
      (
        await commitMemory(
          db,
          { facts: [{ body, kind: "fact", confidence: 0.9 }], provenance },
          { embed: async () => vec(90), judgeContradiction: noContradiction },
        )
      ).created,
    );
    const row = await db
      .selectFrom("memory_index")
      .select(["store", "trust_tier", "expires_at", "ref"])
      .where("id", "=", id)
      .executeTakeFirstOrThrow();
    expect(row.store).toBe("pgvector");
    expect(row.trust_tier).toBe("trusted");
    expect(row.expires_at).not.toBeNull(); // rule 5: fact TTL
    const embedRow = await db
      .selectFrom("memory_embeddings")
      .select("body")
      .where("index_id", "=", id)
      .executeTakeFirstOrThrow();
    expect(embedRow.body).toBe(body);

    const res = await recallMemory(
      db,
      { query: "roundtrip pgvector marker", kind: "fact" },
      { embed: async () => vec(90), caller: AGENT },
    );
    expect(res.rows.map((r) => r.id)).toContain(id);
    expect(res.rows.find((r) => r.id === id)?.body).toBe(body);
  });

  it("obsidian: artifact commit lands the note on disk, recall returns it", async () => {
    const db = getDb();
    const body = `# Roundtrip artifact\nmarker OBS-${AGENT}`;
    const { created } = await commitMemory(db, {
      artifact: { path: "reports/roundtrip.md", body },
      provenance,
    });
    track(created);
    createdFiles.push(created[0].ref);
    expect(created[0].store).toBe("obsidian");
    const onDisk = await readFile(created[0].ref, "utf8");
    expect(onDisk).toContain(`OBS-${AGENT}`);

    const res = await recallMemory(db, { query: "roundtrip artifact", kind: "artifact" }, { caller: AGENT });
    const hit = res.rows.find((r) => r.id === created[0].index_id);
    expect(hit).toBeTruthy();
    expect(hit?.body).toContain(`OBS-${AGENT}`);
  });

  it("graphify: relation commit lands the corpus note (ref = note path), recall returns it", async () => {
    const db = getDb();
    const body = `outbox-executor depends on pg-boss for scheduling (GRA-${AGENT})`;
    const { created } = await commitMemory(db, {
      facts: [{ body, kind: "relation", confidence: 0.8 }],
      provenance,
    });
    track(created);
    createdFiles.push(created[0].ref);
    expect(created[0].store).toBe("graphify");
    expect(created[0].ref).toMatch(/^memory-store\/relation\/.+\.md$/);
    const row = await db
      .selectFrom("memory_index")
      .select(["ref", "expires_at"])
      .where("id", "=", created[0].index_id)
      .executeTakeFirstOrThrow();
    expect(row.ref).toBe(created[0].ref);
    expect(row.expires_at).toBeNull(); // rule 5: relation has no TTL
    const onDisk = await readFile(created[0].ref, "utf8");
    expect(onDisk).toContain('kind: "relation"');
    expect(onDisk).toContain(`GRA-${AGENT}`);

    const res = await recallMemory(db, { query: "what depends on pg-boss", kind: "relation" }, { caller: AGENT });
    const hit = res.rows.find((r) => r.id === created[0].index_id);
    expect(hit?.body).toContain(`GRA-${AGENT}`);
  });

  it("notebook: procedure commit creates the doc (server-assigned ref), GET returns it, recall returns it", async () => {
    const db = getDb();
    const body = `How to re-mint the dxb-os key after a reset: run remint-dxb-os.mjs (NBK-${AGENT})`;
    const { created } = await commitMemory(db, {
      facts: [{ body, kind: "procedure", confidence: 0.8 }],
      provenance,
    });
    track(created);
    createdNotebookRefs.push(created[0].ref);
    expect(created[0].store).toBe("notebook");
    expect(created[0].ref).not.toBe(created[0].index_id); // server-assigned id, not the placeholder
    const row = await db
      .selectFrom("memory_index")
      .select(["ref"])
      .where("id", "=", created[0].index_id)
      .executeTakeFirstOrThrow();
    expect(row.ref).toBe(created[0].ref); // ref updated in the same transaction
    const fetched = await readDoc(created[0].ref); // GET 200 or it throws
    expect(fetched).toBe(body);

    const res = await recallMemory(db, { query: "how to re-mint the key", kind: "procedure" }, { caller: AGENT });
    const hit = res.rows.find((r) => r.id === created[0].index_id);
    expect(hit?.body).toBe(body);
  });
});

describe("claude-mem pointer sync (LOCKED: sync only, never reroute)", () => {
  it("sync inserts pointer rows, is idempotent by ref, and readByRef resolves the body", async () => {
    const db = getDb();
    const first = await syncClaudeMem(db, { dbPath: fixtureDbPath, project: "roundtrip-test-project" });
    expect(first).toEqual({ scanned: 2, inserted: 2, skipped: 0 });
    const second = await syncClaudeMem(db, { dbPath: fixtureDbPath, project: "roundtrip-test-project" });
    expect(second).toEqual({ scanned: 2, inserted: 0, skipped: 2 }); // idempotency count evidence

    const pointers = await db
      .selectFrom("memory_index")
      .select(["ref", "store", "kind", "trust_tier"])
      .where("store", "=", "claude-mem")
      .where("ref", "in", ["990001", "990002"])
      .execute();
    expect(pointers).toHaveLength(2);
    expect(pointers.every((p) => p.trust_tier === "trusted" && p.kind === "fact")).toBe(true);

    const bodyOne = readObservationByRef("990001", fixtureDbPath);
    expect(bodyOne).toContain("Fixture observation one");
    expect(bodyOne).toContain("pgvector adapter round-trip was verified");
    expect(bodyOne).toContain("- fact A");
  });

  it("since filter narrows the scan window", async () => {
    const db = getDb();
    const res = await syncClaudeMem(db, {
      dbPath: fixtureDbPath,
      project: "roundtrip-test-project",
      since: 1_700_000_000_001,
    });
    expect(res).toEqual({ scanned: 1, inserted: 0, skipped: 1 }); // only obs two, already synced
  });
});

describe("cross-adapter atomicity (notebook down)", () => {
  it("dead notebook → typed NotebookDownError and ZERO orphan memory_index rows", async () => {
    const db = getDb();
    const saved = process.env.DXB_NOTEBOOK_URL;
    process.env.DXB_NOTEBOOK_URL = "http://127.0.0.1:59999";
    try {
      await expect(
        commitMemory(db, {
          facts: [{ body: `orphan probe procedure (${AGENT})`, kind: "procedure", confidence: 0.5 }],
          provenance,
        }),
      ).rejects.toThrow(NotebookDownError);
    } finally {
      if (saved === undefined) delete process.env.DXB_NOTEBOOK_URL;
      else process.env.DXB_NOTEBOOK_URL = saved;
    }
    // every surviving row of this agent came from a SUCCESSFUL tracked commit
    const { rows } = await sql<{ id: string }>`
      SELECT id FROM memory_index WHERE provenance->>'agent' = ${AGENT}
    `.execute(db);
    for (const r of rows) expect(createdIndexIds).toContain(r.id);
  });
});
