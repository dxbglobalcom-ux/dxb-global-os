import { existsSync, mkdtempSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";
import {
  InstanceStands,
  acquireHostLock,
  defaultStatePath,
  destroyInstance,
  guarded,
  instanceStatus,
  makeInstance,
  readIdentity,
  readInstances,
  type InstanceRecord,
  type Queryable,
} from "@dxb-foundation/bench";
import {
  askInsideTheContainer,
  benchContainers,
  benchNetwork,
  benchVolumes,
  command,
  identityOn,
  listenersOnTheBenchPorts,
  publishedPorts,
  repositoryRoot,
  valueOf,
  withConnection,
} from "./fixtures/real-bench.ts";
import { refusalOf } from "./fixtures/refusal-of.ts";

// The real thing: one instance of the foundation's bench is made, looked at
// from outside, and destroyed. The steps are one sequence; nothing here reaches
// the company's stack or the old bench's — their identifiers are spelled only
// to say what the made instance must not be.
const COMPANY_SYSID = "7674907968528752679";
const OLD_BENCH_SYSID = "7690665340837392423";

// Measured by the lead: a make takes about a minute, a destroy about a quarter of one.
const MAKE_MS = 180_000;
const DESTROY_MS = 60_000;
const LOOK_MS = 30_000;

const SET_ASIDE = ".set-aside-by-the-instance-test";
const scratch = mkdtempSync(join(tmpdir(), "dxb-foundation-instance-"));
const tail = (output: string): string => output.slice(-1_500);

let failedStep: string | undefined;
/** One step of the sequence. Once a step has failed, the later ones fail at once and say which — they do not wait. */
function step(name: string, timeoutMs: number, body: () => Promise<void>): void {
  it(name, { timeout: timeoutMs }, async () => {
    if (failedStep !== undefined) throw new Error(`not run: the step "${failedStep}" failed before it`);
    failedStep = name; // stays so when the body throws or never comes back
    await body();
    failedStep = undefined;
  });
}

let printedSysid = "";
let record: InstanceRecord;
const recordedIdentity = () => ({ sysid: record.sysid, dboid: record.dboid, dbname: record.dbname });

/** A call that must reject — whether it throws at once or answers a rejected promise. */
const attempt = async (call: () => Promise<unknown>): Promise<unknown> => call();

async function expectTheSameInstanceStands(): Promise<void> {
  expect(readInstances()).toEqual([record]);
  expect(await benchContainers()).toHaveLength(record.containers.length);
  await withConnection("postgres", async (client) => expect(await identityOn(client)).toEqual(recordedIdentity()));
}

async function expectNothingStands(): Promise<void> {
  expect(await benchContainers()).toEqual([]);
  expect(await benchVolumes()).toEqual([]);
  expect(await benchNetwork()).toEqual([]);
  expect(await listenersOnTheBenchPorts()).toEqual([]);
  expect(readInstances()).toEqual([]);
  expect(await instanceStatus()).toEqual({ state: "absent" });
  expect(await command("status", LOOK_MS)).toMatchObject({ code: 0, lastLine: "INSTANCE_ABSENT" });
}

describe("the instance — made, looked at and destroyed, in order", () => {
  afterAll(async () => {
    // Whatever happened above, this file leaves nothing standing. `down` is the
    // bench's own removal and keeps every refusal of its own.
    await command("down", DESTROY_MS).catch(() => undefined);
    rmSync(scratch, { recursive: true, force: true });
  }, DESTROY_MS + 10_000);

  step("fresh makes an instance and says INSTANCE_UP with the cluster's identifier and the loopback address", MAKE_MS + DESTROY_MS, async () => {
    // A run killed while the list was set aside (see the step that empties it) left it there: put it back first.
    const list = defaultStatePath();
    if (existsSync(list + SET_ASIDE) && !existsSync(list)) renameSync(list + SET_ASIDE, list);

    const fresh = await command("fresh", MAKE_MS + DESTROY_MS - 5_000);
    expect(fresh.lastLine, tail(fresh.output)).toMatch(/^INSTANCE_UP sysid=\d+ db=127\.0\.0\.1:54522 seconds=\d+(\.\d+)?$/);
    expect(fresh.code).toBe(0);
    printedSysid = /sysid=(\d+)/.exec(fresh.lastLine)?.[1] ?? "";
    expect([COMPANY_SYSID, OLD_BENCH_SYSID]).not.toContain(printedSysid);
  });

  step("the list holds one record of it, and status says INSTANCE_STANDING with the same identifier", LOOK_MS, async () => {
    const listed = readInstances();
    expect(listed).toHaveLength(1);
    record = listed[0] as InstanceRecord;
    expect(record.sysid).toBe(printedSysid);
    expect(record.project).toBe("DxB_Foundation");

    // SPEC §2: db, kong, auth, realtime and rest — every one of them is in the record, by its id.
    const standing = await benchContainers();
    expect(standing.length).toBeGreaterThanOrEqual(5);
    expect(record.containers).toHaveLength(standing.length);
    expect(standing.filter((id) => !record.containers.some((recorded) => id.startsWith(recorded)))).toEqual([]);
    expect(record.containers).toContain(record.dbContainer);

    expect(await instanceStatus()).toEqual({ state: "standing", record });
    const status = await command("status", LOOK_MS);
    expect(status).toMatchObject({ code: 0, lastLine: `INSTANCE_STANDING sysid=${printedSysid}` });
  });

  step("every published port is bound to 127.0.0.1 and nowhere else", LOOK_MS, async () => {
    const published = await publishedPorts();
    expect(published).toContain("5432/tcp -> 127.0.0.1:54522");
    expect(published.filter((line) => line.endsWith(" -> 127.0.0.1:54521"))).toHaveLength(1);
    expect(published.filter((line) => !/ -> 127\.0\.0\.1:\d+$/.test(line))).toEqual([]);
    expect(await listenersOnTheBenchPorts()).toEqual(["127.0.0.1:54521", "127.0.0.1:54522"]);
    expect(await benchNetwork()).toEqual(["dxb_foundation_bench 127.0.0.1"]);
  });

  step("the recorded identity is what the server answers on TCP and inside the database container", LOOK_MS, async () => {
    expect(record.dbname).toBe("postgres");
    await withConnection("postgres", async (client) => {
      expect(await identityOn(client)).toEqual(recordedIdentity());
      expect(await readIdentity(client)).toEqual(recordedIdentity());
    });
    const cluster = "select system_identifier::text from pg_control_system()";
    const database = "select oid::text || ' ' || datname from pg_database where datname = current_database()";
    expect(await askInsideTheContainer(record.dbContainer, cluster)).toBe(record.sysid);
    expect(await askInsideTheContainer(record.dbContainer, database)).toBe(`${record.dboid} ${record.dbname}`);
  });

  step("the old chain stood: the ledger holds one row per file of db/migrations and the old schema is there", LOOK_MS, async () => {
    const migrations = readdirSync(join(repositoryRoot, "db/migrations")).filter((name) => name.endsWith(".sql"));
    expect(migrations.length).toBeGreaterThan(100);
    await withConnection("postgres", async (client) => {
      const ledger = "select count(*)::int from supabase_migrations.schema_migrations";
      expect(await valueOf(client, ledger)).toBe(migrations.length);
      for (const relation of [
        "public.approvals",
        "public.task_events",
        "public.cost_ledger",
        "public.chat_messages",
        "auth.users",
        "realtime.messages",
      ]) {
        expect(await valueOf(client, `select to_regclass('${relation}') is not null`), relation).toBe(true);
      }
      expect(await valueOf(client, "select count(*)::int from pg_namespace where nspname = 'pgboss'")).toBe(1);
    });
  });

  step("it holds no foundation object: no schema os or os_clock, no role named os_…", LOOK_MS, async () => {
    await withConnection("postgres", async (client) => {
      const schemas = "select count(*)::int from pg_namespace where nspname in ('os', 'os_clock')";
      expect(await valueOf(client, schemas)).toBe(0);
      expect(await valueOf(client, "select count(*)::int from pg_roles where rolname like 'os\\_%'")).toBe(0);
    });
  });

  step("guarded refuses the real connection against an empty list — no work, no row — and runs the work against the real list", LOOK_MS, async () => {
    const emptyList = join(scratch, "instances.json");
    writeFileSync(emptyList, JSON.stringify({ instances: [] }));
    await withConnection("postgres", async (client) => {
      // A table of this session only: the work's row would land here, on the guarded connection.
      await client.query("create temporary table guard_probe (n int)");
      const rows = "select count(*)::int from guard_probe";
      const work = vi.fn(async (conn: Queryable) => {
        await conn.query("insert into guard_probe values (1)");
        return "worked";
      });

      const refusal = await refusalOf(guarded(client, work, { statePath: emptyList }));
      expect(refusal.reason).toBe("not-listed");
      expect(work).not.toHaveBeenCalled();
      expect(await valueOf(client, rows)).toBe(0);

      expect(await guarded(client, work)).toBe("worked");
      expect(await valueOf(client, rows)).toBe(1);
    });
  });

  step("guarded refuses a throwaway database made in the same cluster", LOOK_MS, async () => {
    await withConnection("postgres", async (owner) => {
      await owner.query("create database guard_throwaway");
      try {
        await withConnection("guard_throwaway", async (client) => {
          const there = await identityOn(client);
          expect(there).toMatchObject({ sysid: record.sysid, dbname: "guard_throwaway" });
          expect(there.dboid).not.toBe(record.dboid);

          const work = vi.fn(async () => "worked");
          const refusal = await refusalOf(guarded(client, work));
          expect(refusal.reason).toBe("not-listed");
          expect(work).not.toHaveBeenCalled();
        });
      } finally {
        await owner.query("drop database if exists guard_throwaway");
      }
    });
  });

  step("up while it stands says INSTANCE_STANDS and exits 3; makeInstance throws InstanceStands; the same instance still answers", LOOK_MS * 2, async () => {
    expect(await command("up", LOOK_MS)).toMatchObject({ code: 3, lastLine: "INSTANCE_STANDS" });
    const lock = acquireHostLock();
    try {
      await expect(attempt(() => makeInstance(lock))).rejects.toBeInstanceOf(InstanceStands);
    } finally {
      lock.release();
    }
    await expectTheSameInstanceStands();
  });

  step("while another holds the host lock the command says LOCK_REFUSED and exits 2 — with DXB_FOUNDATION_LOCK_WAIT, after waiting that long", LOOK_MS * 2, async () => {
    const lock = acquireHostLock();
    try {
      expect(await command("down", LOOK_MS)).toMatchObject({ code: 2, lastLine: "LOCK_REFUSED" });
      const started = Date.now();
      expect(await command("up", LOOK_MS, 2)).toMatchObject({ code: 2, lastLine: "LOCK_REFUSED" });
      expect(Date.now() - started).toBeGreaterThanOrEqual(1_800);
    } finally {
      lock.release();
    }
    await expectTheSameInstanceStands();
  });

  step("with the list emptied, status says INSTANCE_FOREIGN and exits 5, down is refused and exits 4, and the instance still stands", LOOK_MS * 3, async () => {
    const list = defaultStatePath();
    renameSync(list, list + SET_ASIDE);
    try {
      const status = await command("status", LOOK_MS);
      expect(status.lastLine, tail(status.output)).toMatch(/^INSTANCE_FOREIGN \S/);
      expect(status.code).toBe(5);
      const down = await command("down", LOOK_MS);
      expect(down.lastLine, tail(down.output)).toMatch(/^REMOVAL_REFUSED \S/);
      expect(down.code).toBe(4);
    } finally {
      renameSync(list + SET_ASIDE, list);
    }
    await expectTheSameInstanceStands();
  });

  step("down says INSTANCE_DOWN and leaves no container, volume, network, listener or record", DESTROY_MS + LOOK_MS, async () => {
    const down = await command("down", DESTROY_MS);
    expect(down.lastLine, tail(down.output)).toBe("INSTANCE_DOWN");
    expect(down.code).toBe(0);
    await expectNothingStands();
  });

  step("down again says INSTANCE_ABSENT and exits 0; destroyInstance answers absent", LOOK_MS, async () => {
    expect(await command("down", LOOK_MS)).toMatchObject({ code: 0, lastLine: "INSTANCE_ABSENT" });
    const lock = acquireHostLock();
    try {
      expect(await destroyInstance(lock)).toBe("absent");
    } finally {
      lock.release();
    }
  });

  step("makeInstance and destroyInstance refuse a lock that has been released, and nothing is made", MAKE_MS, async () => {
    const released = acquireHostLock();
    released.release();
    await expect(attempt(() => makeInstance(released))).rejects.toThrow();
    await expect(attempt(() => destroyInstance(released))).rejects.toThrow();
    await expectNothingStands();
  });
});
