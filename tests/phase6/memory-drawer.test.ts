import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  commitMemory,
  memoryRoot,
  memoryRootLine,
  recallMemory,
} from "../../packages/memory-router/src/index.js";
import { companyClaudeHome, ensureCompanyMemoryRoot } from "../../packages/kernel/src/sdk-isolation.js";

// The company's memory drawer (CEO 2026-10-04, company-memory-drawer-2026-10-04: "Tamam önerini kabul
// ediyorum."). Until this job an obsidian/graphify note was written and read relative to the process's
// working folder, and the reader handed memory_index.ref to readFile unchecked (Sol's phase-3 C1): since
// isolation phase 3 the dxb-mcp child of a company call works in the company's `work` folder while the
// scheduler's recall works in the repository, so the two looked in different places, and a ref naming any
// file on the machine was read. Now every note lives under ONE folder, DXB_MEMORY_ROOT — the company Claude
// home in production, set by the scheduler; the construction's own folder under var/ in this battery — and
// the reader opens nothing but a note of the writer's exact shape inside it.

const AGENT = `memory-drawer-test-${randomUUID().slice(0, 8)}`;
const provenance = { agent: AGENT, task_id: null, origin: "agent" as const, source: "reasoning" };

let root: string;
let canaryDir: string;
let canaryFile: string;
const CANARY = `CANARY-${randomUUID()}`;
const savedRoot = process.env.DXB_MEMORY_ROOT;
const insertedIds: string[] = [];

beforeAll(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), "dxb-memory-root-"));
  canaryDir = await mkdtemp(path.join(os.tmpdir(), "dxb-memory-canary-"));
  canaryFile = path.join(canaryDir, "canary.md");
  await writeFile(canaryFile, `${CANARY}\n`);
});

afterEach(() => {
  process.env.DXB_MEMORY_ROOT = root;
});

afterAll(async () => {
  const db = getDb();
  await db
    .deleteFrom("memory_index")
    .where(sql<boolean>`provenance @> ${JSON.stringify({ agent: AGENT })}::jsonb`)
    .execute();
  if (insertedIds.length > 0) await db.deleteFrom("memory_index").where("id", "in", insertedIds).execute();
  await db.deleteFrom("audit_log").where("actor", "=", AGENT).execute();
  await rm(root, { recursive: true, force: true });
  await rm(canaryDir, { recursive: true, force: true });
  if (savedRoot === undefined) delete process.env.DXB_MEMORY_ROOT;
  else process.env.DXB_MEMORY_ROOT = savedRoot;
  await closeDb();
});

describe("the memory root — one folder, never the working folder", () => {
  it("refuses an unset or relative DXB_MEMORY_ROOT, naming the variable", () => {
    expect(() => memoryRoot({})).toThrow(/DXB_MEMORY_ROOT/);
    expect(() => memoryRoot({ DXB_MEMORY_ROOT: "var/construction-memory" })).toThrow(/DXB_MEMORY_ROOT/);
    expect(memoryRoot({ DXB_MEMORY_ROOT: root })).toBe(root);
  });

  it("an unset root refuses the write and leaves no index row", async () => {
    delete process.env.DXB_MEMORY_ROOT;
    const db = getDb();
    await expect(
      commitMemory(db, { artifact: { path: "reports/unset.md", body: "no root" }, provenance }),
    ).rejects.toThrow(/DXB_MEMORY_ROOT/);
    const rows = await db
      .selectFrom("memory_index")
      .select("id")
      .where(sql<boolean>`provenance @> ${JSON.stringify({ agent: AGENT })}::jsonb`)
      .execute();
    expect(rows).toEqual([]);
  });

  it("an artifact lands under the root — not under the working folder — and reads back", async () => {
    process.env.DXB_MEMORY_ROOT = root;
    const db = getDb();
    const marker = `OBS-${AGENT}`;
    const { created } = await commitMemory(db, {
      artifact: { path: "reports/drawer.md", body: `# Drawer\n${marker}` },
      provenance,
    });
    const ref = created[0].ref;
    expect(ref).toMatch(/^memory-store\/artifact\/[0-9a-f-]{36}\.md$/);
    expect(existsSync(path.join(root, ref))).toBe(true);
    expect(existsSync(path.join(process.cwd(), ref))).toBe(false);
    const res = await recallMemory(db, { query: "drawer artifact", kind: "artifact", limit: 1 }, { caller: AGENT });
    expect(res.rows[0]?.id).toBe(created[0].index_id);
    expect(res.rows[0]?.body).toContain(marker);
  });

  it("a relation lands under the root and reads back", async () => {
    process.env.DXB_MEMORY_ROOT = root;
    const db = getDb();
    const marker = `GRA-${AGENT}`;
    const { created } = await commitMemory(db, {
      facts: [{ body: `the drawer depends on the root (${marker})`, kind: "relation", confidence: 0.8 }],
      provenance,
    });
    const ref = created[0].ref;
    expect(ref).toMatch(/^memory-store\/relation\/[0-9a-f-]{36}\.md$/);
    expect(existsSync(path.join(root, ref))).toBe(true);
    const res = await recallMemory(db, { query: "drawer relation", kind: "relation", limit: 1 }, { caller: AGENT });
    expect(res.rows[0]?.body).toContain(marker);
  });
});

describe("the reader opens nothing but a note of the writer's shape inside the root", () => {
  /** A live, trusted, newest row — the one a limit-1 recall reads first. */
  async function plant(store: "obsidian" | "graphify", ref: string): Promise<string> {
    const id = randomUUID();
    insertedIds.push(id);
    await getDb()
      .insertInto("memory_index")
      .values({
        id,
        kind: store === "obsidian" ? "artifact" : "relation",
        store,
        ref,
        provenance: JSON.stringify(provenance),
        trust_tier: "trusted",
      })
      .execute();
    return id;
  }

  async function expectRefused(store: "obsidian" | "graphify", ref: string): Promise<void> {
    process.env.DXB_MEMORY_ROOT = root;
    const db = getDb();
    const id = await plant(store, ref);
    const kind = store === "obsidian" ? "artifact" : "relation";
    const outcome = await recallMemory(db, { query: "planted ref", kind, limit: 1 }, { caller: AGENT }).then(
      (res) => JSON.stringify(res),
      (err: Error) => err,
    );
    await db.deleteFrom("memory_index").where("id", "=", id).execute();
    expect(outcome, `ref ${ref} was read`).toBeInstanceOf(Error);
    expect((outcome as Error).message).toMatch(/memory ref broken/);
    expect((outcome as Error).message).not.toContain(CANARY);
    const audit = await db
      .selectFrom("audit_log")
      .select("payload")
      .where("actor", "=", AGENT)
      .where("action", "=", "memory_ref_broken")
      .where(sql<boolean>`payload @> ${JSON.stringify({ index_id: id })}::jsonb`)
      .execute();
    expect(audit).toHaveLength(1);
  }

  it("an absolute ref naming a file elsewhere on the machine", async () => {
    await expectRefused("obsidian", canaryFile);
    await expectRefused("graphify", canaryFile);
  });

  it("a ref climbing out of the root", async () => {
    const climb = `memory-store/artifact/../../../${path.basename(canaryDir)}/canary.md`;
    await expectRefused("obsidian", climb);
  });

  it("a ref of the other store's kind, and a ref that is not a uuid note", async () => {
    const id = randomUUID();
    await mkdir(path.join(root, "memory-store", "relation"), { recursive: true });
    await mkdir(path.join(root, "memory-store", "artifact"), { recursive: true });
    await writeFile(path.join(root, "memory-store", "relation", `${id}.md`), "a relation note\n");
    await writeFile(path.join(root, "memory-store", "artifact", "notes.md"), "not a uuid note\n");
    await expectRefused("obsidian", `memory-store/relation/${id}.md`);
    await expectRefused("obsidian", "memory-store/artifact/notes.md");
  });

  it("a note of the right shape that is a link to a file outside the root", async () => {
    const id = randomUUID();
    await mkdir(path.join(root, "memory-store", "artifact"), { recursive: true });
    await symlink(canaryFile, path.join(root, "memory-store", "artifact", `${id}.md`));
    await expectRefused("obsidian", `memory-store/artifact/${id}.md`);
  });

  // Sol's single pass, A1: a link INSIDE the root must not redirect a ref to another note or file.
  it("a note of the right shape that is a link to another store's note inside the root", async () => {
    const id = randomUUID();
    const other = randomUUID();
    await mkdir(path.join(root, "memory-store", "artifact"), { recursive: true });
    await mkdir(path.join(root, "memory-store", "relation"), { recursive: true });
    await writeFile(path.join(root, "memory-store", "relation", `${other}.md`), `${CANARY} relation\n`);
    await symlink(
      path.join(root, "memory-store", "relation", `${other}.md`),
      path.join(root, "memory-store", "artifact", `${id}.md`),
    );
    await expectRefused("obsidian", `memory-store/artifact/${id}.md`);
  });

  it("a note of the right shape that is a link to a plain file in the root", async () => {
    const id = randomUUID();
    await mkdir(path.join(root, "memory-store", "artifact"), { recursive: true });
    await writeFile(path.join(root, "plain.txt"), `${CANARY} plain\n`);
    await symlink(path.join(root, "plain.txt"), path.join(root, "memory-store", "artifact", `${id}.md`));
    await expectRefused("obsidian", `memory-store/artifact/${id}.md`);
  });

  // Sol's single pass, B1: no filesystem effect before the boundary holds.
  it("a memory-store that is a link out of the root: the write refuses and creates nothing outside", async () => {
    const linkedRoot = await mkdtemp(path.join(os.tmpdir(), "dxb-memory-linked-"));
    const outside = await mkdtemp(path.join(os.tmpdir(), "dxb-memory-outside-"));
    await symlink(outside, path.join(linkedRoot, "memory-store"));
    process.env.DXB_MEMORY_ROOT = linkedRoot;
    await expect(
      commitMemory(getDb(), { artifact: { path: "reports/linked.md", body: "must not land" }, provenance }),
    ).rejects.toThrow(/memory/);
    expect(await readdir(outside)).toEqual([]);
    await rm(linkedRoot, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  });
});

describe("the scheduler gives the company its own drawer", () => {
  // Sol's single pass, B2: the production root is bound to the company home — an inherited value is not kept.
  it("sets the root to the company Claude home, overwriting any inherited value", () => {
    const unset: NodeJS.ProcessEnv = {};
    expect(ensureCompanyMemoryRoot(unset)).toBe(companyClaudeHome({}));
    expect(unset.DXB_MEMORY_ROOT).toBe(companyClaudeHome({}));
    const given: NodeJS.ProcessEnv = { DXB_MEMORY_ROOT: "/somewhere" };
    expect(ensureCompanyMemoryRoot(given)).toBe(companyClaudeHome({}));
    expect(given.DXB_MEMORY_ROOT).toBe(companyClaudeHome({}));
  });

  it("a refused company home leaves no root at all", () => {
    const refused: NodeJS.ProcessEnv = { DXB_MEMORY_ROOT: "/somewhere", DXB_COMPANY_CLAUDE_HOME: "relative/home" };
    expect(ensureCompanyMemoryRoot(refused)).toBeUndefined();
    expect(refused.DXB_MEMORY_ROOT).toBeUndefined();
  });

  it("says where the drawer is and how many notes it holds", async () => {
    const lineRoot = await mkdtemp(path.join(os.tmpdir(), "dxb-memory-line-"));
    await mkdir(path.join(lineRoot, "memory-store", "artifact"), { recursive: true });
    await writeFile(path.join(lineRoot, "memory-store", "artifact", `${randomUUID()}.md`), "one\n");
    expect(memoryRootLine({ DXB_MEMORY_ROOT: lineRoot })).toBe(`[memory] root=${lineRoot} notes=1`);
    expect(memoryRootLine({})).toMatch(/^\[memory\] root=unset/);
    await rm(lineRoot, { recursive: true, force: true });
  });
});
