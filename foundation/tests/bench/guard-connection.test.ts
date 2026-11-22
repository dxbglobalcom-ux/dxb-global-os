import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import {
  assertFoundationTarget,
  defaultStatePath,
  guarded,
  readIdentity,
  readInstances,
  type Identity,
  type InstanceRecord,
  type Queryable,
  type RefusalReason,
} from "@dxb-foundation/bench";
import { refusalOf } from "./fixtures/refusal-of.ts";

// The company's and the old bench's clusters, as measured on 2026-11-23 (SPEC §2).
// Only ever answered by a stub here — no test connects to either.
const COMPANY: Identity = { sysid: "7674907968528752679", dboid: "5", dbname: "postgres" };
const OLD_BENCH: Identity = { sysid: "7690665340837392423", dboid: "5", dbname: "postgres" };

// An invented instance of the bench, and the record the list would hold for it.
const MADE: Identity = { sysid: "7700000000000000001", dboid: "5", dbname: "postgres" };
const recordOf = (identity: Identity): InstanceRecord => ({
  ...identity,
  project: "DxB_Foundation",
  dbContainer: "0a1b2c3d4e5f",
  containers: ["0a1b2c3d4e5f", "1b2c3d4e5f6a"],
  volumes: ["supabase_db_DxB_Foundation"],
  madeAt: "2026-11-23T00:10:00.000Z",
});

const WORK_TEXT = "insert into anything (n) values (1)";

/**
 * A connection that records every text it is sent and answers the two identity
 * queries of SPEC §2 — `system_identifier` from `pg_control_system()`, `oid` and
 * `datname` from `pg_database` — for the identity it was given.
 */
function stubConnection(identity: Identity): { conn: Queryable; texts: string[] } {
  const texts: string[] = [];
  const conn: Queryable = {
    async query(text) {
      texts.push(text);
      const row: Record<string, unknown> = {};
      if (/\bpg_control_system\s*\(/.test(text)) row["system_identifier"] = identity.sysid;
      if (/\bpg_database\b/.test(text)) Object.assign(row, { oid: identity.dboid, datname: identity.dbname });
      return { rows: Object.keys(row).length > 0 ? [row] : [] };
    },
  };
  return { conn, texts };
}

/** True for a text that only reads the identity: one select on the two catalogs, writing nothing. */
function onlyReadsTheIdentity(text: string): boolean {
  const writes = /\b(insert|update|delete|create|drop|alter|truncate|grant|revoke|set|copy|call|do|begin)\b/i;
  return /^\s*select\b/i.test(text) && /pg_control_system|pg_database/.test(text) && !writes.test(text);
}

const directory = mkdtempSync(join(tmpdir(), "dxb-foundation-guard-"));
afterAll(() => rmSync(directory, { recursive: true, force: true }));

let filesWritten = 0;
/** A list file with this content, in the test's own directory. */
function listFile(content: string): string {
  const path = join(directory, `instances-${++filesWritten}.json`);
  writeFileSync(path, content);
  return path;
}
const listOf = (...identities: Identity[]): string =>
  listFile(JSON.stringify({ instances: identities.map(recordOf) }));

describe("readIdentity — the server says who it is", () => {
  it("answers the cluster's identifier, the database's oid and its name, as the connection gave them", async () => {
    const { conn } = stubConnection(MADE);
    expect(await readIdentity(conn)).toEqual({ sysid: "7700000000000000001", dboid: "5", dbname: "postgres" });
  });
});

describe("assertFoundationTarget — the identity is read on the connection that will do the work", () => {
  it("answers the identity it read when the list holds it", async () => {
    const { conn } = stubConnection(MADE);
    expect(await assertFoundationTarget(conn, { statePath: listOf(MADE) })).toEqual(MADE);
  });

  it("sends the connection nothing but the identity queries — it writes nothing before the decision", async () => {
    const allowed = stubConnection(MADE);
    await assertFoundationTarget(allowed.conn, { statePath: listOf(MADE) });
    expect(allowed.texts.length).toBeGreaterThan(0);
    expect(allowed.texts.filter((text) => !onlyReadsTheIdentity(text))).toEqual([]);

    const refused = stubConnection(MADE);
    await refusalOf(assertFoundationTarget(refused.conn, { statePath: listOf() }));
    expect(refused.texts.length).toBeGreaterThan(0);
    expect(refused.texts.filter((text) => !onlyReadsTheIdentity(text))).toEqual([]);
  });

  it.each([
    ["company", COMPANY],
    ["old-bench", OLD_BENCH],
  ] as const)("refuses the %s by name, even when the list file holds its identity", async (reason, identity) => {
    const { conn } = stubConnection(identity);
    const refusal = await refusalOf(assertFoundationTarget(conn, { statePath: listOf(MADE, identity) }));
    expect(refusal.reason).toBe(reason);
  });

  it("refuses an identity the list does not hold: not-listed", async () => {
    const { conn } = stubConnection({ sysid: "7700000000000000009", dboid: "5", dbname: "postgres" });
    const refusal = await refusalOf(assertFoundationTarget(conn, { statePath: listOf(MADE) }));
    expect(refusal.reason).toBe("not-listed");
  });

  it("without a statePath it decides against the machine's own list, which holds no invented identity", async () => {
    const { conn } = stubConnection({ sysid: "7700000000000000009", dboid: "5", dbname: "postgres" });
    const refusal = await refusalOf(assertFoundationTarget(conn));
    expect(refusal.reason).toBe("not-listed");
  });

  it.each<[string, Queryable]>([
    ["throws", { query: async () => Promise.reject(new Error("connection lost")) }],
    ["answers no row", { query: async () => ({ rows: [] }) }],
    ["answers rows without the identity's columns", { query: async () => ({ rows: [{ unrelated: 1 }] }) }],
  ])("refuses as unreadable when the connection %s — even with a list that would allow", async (_what, conn) => {
    const refusal = await refusalOf(assertFoundationTarget(conn, { statePath: listOf(MADE) }));
    expect(refusal.reason).toBe("unreadable");
  });
});

describe("guarded — the work runs after the guard, on the guarded connection", () => {
  it("hands the work the very connection it checked, after the identity queries, and returns its result", async () => {
    const { conn, texts } = stubConnection(MADE);
    const result = await guarded(
      conn,
      async (given) => {
        expect(given).toBe(conn);
        await given.query(WORK_TEXT);
        return 42;
      },
      { statePath: listOf(MADE) },
    );
    expect(result).toBe(42);
    expect(texts.at(-1)).toBe(WORK_TEXT);
    const beforeTheWork = texts.slice(0, -1);
    expect(beforeTheWork.length).toBeGreaterThan(0);
    expect(beforeTheWork.filter((text) => !onlyReadsTheIdentity(text))).toEqual([]);
  });

  it.each<[RefusalReason, Queryable, () => string]>([
    ["company", stubConnection(COMPANY).conn, () => listOf(MADE, COMPANY)],
    ["old-bench", stubConnection(OLD_BENCH).conn, () => listOf(MADE, OLD_BENCH)],
    ["not-listed", stubConnection(MADE).conn, () => listOf()],
    ["unreadable", { query: async () => Promise.reject(new Error("connection lost")) }, () => listOf(MADE)],
  ])("refuses with %s and never calls the work", async (reason, conn, statePath) => {
    const work = vi.fn(async (given: Queryable) => given.query(WORK_TEXT));
    const refusal = await refusalOf(guarded(conn, work, { statePath: statePath() }));
    expect(refusal.reason).toBe(reason);
    expect(work).not.toHaveBeenCalled();
  });

  it("sends a refused connection no text of the work", async () => {
    const { conn, texts } = stubConnection(COMPANY);
    await refusalOf(guarded(conn, async (given) => given.query(WORK_TEXT), { statePath: listOf(COMPANY) }));
    expect(texts).not.toContain(WORK_TEXT);
    expect(texts.filter((text) => !onlyReadsTheIdentity(text))).toEqual([]);
  });
});

describe("the list file — a list that cannot be read lists nothing", () => {
  it("readInstances answers the records of a well-formed file", () => {
    expect(readInstances(listOf(MADE))).toEqual([recordOf(MADE)]);
  });

  it.each<[string, () => string]>([
    ["is missing", () => join(directory, "never-written.json")],
    ["is empty", () => listFile("")],
    ["is not JSON", () => listFile('{ "instances": [')],
    ["has no instances", () => listFile("{}")],
    ["holds instances that are not a list", () => listFile(JSON.stringify({ instances: recordOf(MADE) }))],
    [
      "cannot be read as a file",
      () => {
        const path = join(directory, `a-directory-${++filesWritten}.json`);
        mkdirSync(path);
        return path;
      },
    ],
  ])("a file that %s lists nothing, and the guard refuses", async (_what, prepare) => {
    const statePath = prepare();
    expect(readInstances(statePath)).toEqual([]);
    const refusal = await refusalOf(assertFoundationTarget(stubConnection(MADE).conn, { statePath }));
    expect(refusal.reason).toBe("not-listed");
  });
});

describe("defaultStatePath — the list is machine state, under the user's state directory", () => {
  const before = process.env.XDG_STATE_HOME;
  afterEach(() => {
    if (before === undefined) delete process.env.XDG_STATE_HOME;
    else process.env.XDG_STATE_HOME = before;
  });

  it("stands under XDG_STATE_HOME when that is set", () => {
    process.env.XDG_STATE_HOME = "/somewhere/state";
    expect(defaultStatePath()).toBe("/somewhere/state/dxb/foundation-bench/instances.json");
  });

  it("stands under ~/.local/state when it is not", () => {
    delete process.env.XDG_STATE_HOME;
    expect(defaultStatePath()).toBe(`${process.env.HOME}/.local/state/dxb/foundation-bench/instances.json`);
  });
});
