import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import {
  ExposureRefused,
  InstanceStands,
  RemovalRefused,
  acquireHostLock,
  answerOf,
  assertFoundationTarget,
  configMismatch,
  exposedBeyondLoopback,
  type BenchContainer,
  type Queryable,
  type RefusalReason,
} from "@dxb-foundation/bench";
import { refusalOf } from "./fixtures/refusal-of.ts";

// The decisions SPEC §5b.8 exports so that a test can pin them: what is exposed,
// whether a config is the bench's, and what the command answers to a failure.
// Pure — every container below is invented, and nothing here reaches Docker.

const directory = mkdtempSync(join(tmpdir(), "dxb-foundation-decisions-"));
afterAll(() => rmSync(directory, { recursive: true, force: true }));

// ---- exposedBeyondLoopback

type Published = BenchContainer["published"][number];

const publishing = (name: string, ...published: Published[]): BenchContainer => ({
  id: `${name}-id`,
  name,
  project: "DxB_Foundation",
  createdAt: "2026-11-23T00:10:05.000000000Z",
  volumes: [],
  running: true,
  published,
});

const DB_ON_LOOPBACK = publishing("supabase_db_DxB_Foundation", { containerPort: "5432/tcp", hostAddress: "127.0.0.1", hostPort: 54522 });
const kongOn = (hostAddress: string): BenchContainer =>
  publishing("supabase_kong_DxB_Foundation", { containerPort: "8000/tcp", hostAddress, hostPort: 54521 });

describe("exposedBeyondLoopback — every published port bound anywhere but 127.0.0.1, each named", () => {
  it("answers nothing when every published port is on 127.0.0.1, and when nothing is published", () => {
    expect(exposedBeyondLoopback([DB_ON_LOOPBACK, kongOn("127.0.0.1")])).toEqual([]);
    expect(exposedBeyondLoopback([publishing("supabase_rest_DxB_Foundation")])).toEqual([]);
    expect(exposedBeyondLoopback([])).toEqual([]);
  });

  it.each([
    ["every IPv4 address", "0.0.0.0"],
    ["every IPv6 address", "::"],
    ["an empty address, which is every address", ""],
    ["the LAN address", "192.168.1.20"],
  ])("names a port published on %s — the container and the host port, and not its loopback neighbour", (_what, hostAddress) => {
    const exposed = exposedBeyondLoopback([DB_ON_LOOPBACK, kongOn(hostAddress)]);
    expect(exposed).toHaveLength(1);
    expect(exposed[0]).toContain("supabase_kong_DxB_Foundation");
    expect(exposed[0]).toContain("54521");
    expect(exposed[0]).not.toContain("54522");
  });

  it("names each one: a port bound on 127.0.0.1 and also on the LAN, and another container's on every address", () => {
    const twice = publishing(
      "supabase_db_DxB_Foundation",
      { containerPort: "5432/tcp", hostAddress: "127.0.0.1", hostPort: 54522 },
      { containerPort: "5432/tcp", hostAddress: "192.168.1.20", hostPort: 54522 },
    );
    const exposed = exposedBeyondLoopback([twice, kongOn("0.0.0.0")]);
    expect(exposed).toHaveLength(2);
    expect(exposed.filter((entry) => entry.includes("supabase_db_DxB_Foundation"))).toHaveLength(1);
    expect(exposed.filter((entry) => entry.includes("supabase_kong_DxB_Foundation"))).toHaveLength(1);
  });
});

// ---- configMismatch

const committed = readFileSync(fileURLToPath(new URL("../../bench/supabase/config.toml", import.meta.url)), "utf8");

/** The committed config with one whole line replaced; fails the case when that line is not there exactly once. */
function withLine(line: string, replacement: string): string {
  const lines = committed.split("\n");
  expect(lines.filter((written) => written === line)).toHaveLength(1);
  return lines.map((written) => (written === line ? replacement : written)).join("\n");
}

describe("configMismatch — the stack's config must say the bench's project and its two ports", () => {
  it("answers undefined for the committed foundation/bench/supabase/config.toml", () => {
    expect(configMismatch(committed)).toBeUndefined();
  });

  it.each([
    ["another project", 'project_id = "DxB_Foundation"', 'project_id = "Some_Other_Stack"', /project/i],
    ["another API port", "port = 54521", "port = 54599", /api/i],
    ["another database port", "port = 54522", "port = 54598", /\bdb\b|database/i],
  ])("names %s", (_what, line, replacement, named) => {
    const mismatch = configMismatch(withLine(line, replacement));
    expect(mismatch).toEqual(expect.any(String));
    expect(mismatch).toMatch(named);
  });
});

// ---- answerOf: each row of SPEC §4's table for a call that did not end well

/** A real LockRefused: the second acquireHostLock on a path this process already holds. */
function aLockRefusal(): unknown {
  const path = join(directory, "held.lock");
  const first = acquireHostLock({ path });
  try {
    acquireHostLock({ path });
  } catch (refusal) {
    return refusal;
  } finally {
    first.release();
  }
  throw new Error("the second acquireHostLock on a held path was not refused");
}

// A connection that answers every text with one row of this identity: enough for the guard to read it.
const answering = (sysid: string): Queryable => ({
  query: async () => ({ rows: [{ system_identifier: sysid, oid: "5", datname: "postgres" }] }),
});
const NO_LIST = join(directory, "never-written.json");

describe("answerOf — the line and the exit code of a call that did not end well", () => {
  it("answers LOCK_REFUSED and 2 for a LockRefused", () => {
    expect(answerOf(aLockRefusal())).toEqual({ line: "LOCK_REFUSED", exit: 2 });
  });

  it("answers INSTANCE_STANDS and 3 for an InstanceStands", () => {
    expect(answerOf(new InstanceStands("the instance of cluster 7700000000000000001 stands"))).toEqual({
      line: "INSTANCE_STANDS",
      exit: 3,
    });
  });

  it.each<[RefusalReason, Queryable]>([
    ["company", answering("7674907968528752679")],
    ["old-bench", answering("7690665340837392423")],
    ["not-listed", answering("7700000000000000009")],
    ["unreadable", { query: async () => Promise.reject(new Error("connection lost")) }],
  ])("answers TARGET_REFUSED reason=%s and 4 for the guard's refusal", async (reason, conn) => {
    const refusal = await refusalOf(assertFoundationTarget(conn, { statePath: NO_LIST }));
    expect(answerOf(refusal)).toEqual({ line: `TARGET_REFUSED reason=${reason}`, exit: 4 });
  });

  it("answers REMOVAL_REFUSED with the reason and 4 for a RemovalRefused", () => {
    const refusal = new RemovalRefused("container supabase_rest_DxB_Foundation is not in the record");
    expect(answerOf(refusal)).toEqual({
      line: "REMOVAL_REFUSED container supabase_rest_DxB_Foundation is not in the record",
      exit: 4,
    });
  });

  it("keeps the answer on one line — it is the last line the command prints", () => {
    const answer = answerOf(new RemovalRefused("the database container answers\ncluster 1;\n the record says cluster 2"));
    expect(answer.exit).toBe(4);
    expect(answer.line).toMatch(/^REMOVAL_REFUSED the database container answers\s/);
    expect(answer.line).toContain("the record says cluster 2");
    expect(answer.line).not.toContain("\n");
  });

  it.each<[string, unknown, string]>([
    ["an Error", new Error("docker ps ended with 1: cannot connect"), "docker ps ended with 1: cannot connect"],
    ["an ExposureRefused — no row of the table is its own", new ExposureRefused("published beyond 127.0.0.1"), "published beyond 127.0.0.1"],
    ["a thrown text", "the start\nwas stopped", "was stopped"],
  ])("answers the error itself and 1 for anything else: %s", (_what, failure, said) => {
    const answer = answerOf(failure);
    expect(answer.exit).toBe(1);
    expect(answer.line).toContain(said);
    expect(answer.line).not.toContain("\n");
  });
});
