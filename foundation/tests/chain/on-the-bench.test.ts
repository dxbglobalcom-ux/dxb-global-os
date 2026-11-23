import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  acquireHostLock,
  assertFoundationTarget,
  destroyInstance,
  instanceStatus,
  makeInstance,
  readInstances,
  type HostLock,
  type Identity,
} from "@dxb-foundation/bench";
import { theBootstrap } from "./cases/bootstrap.ts";
import { builtFromNothing } from "./cases/built-from-nothing.ts";
import { failingFiles } from "./cases/failing-files.ts";
import { oneRunnerAtATime } from "./cases/one-runner.ts";
import { sessionsAndUpgrade } from "./cases/sessions-and-upgrade.ts";
import { theCheck } from "./cases/the-check.ts";
import { theCommand } from "./cases/the-command.ts";
import { theTarget } from "./cases/the-target.ts";
import { removeTheChainRoots } from "./fixtures/chain-on-disk.ts";
import { valueOf } from "./fixtures/looking.ts";
import { untilASessionSleeps } from "./fixtures/running.ts";
import { CASE_MS, databasesLeft, databasesMade, inAThrowawayDatabase, onTheInstance } from "./fixtures/throwaway-database.ts";

// SPEC §9.4: every case of the runner that needs a server, in this one module —
// so the instance is prepared once. The module holds the bench's host lock from
// its first case to its last: no other hand makes or removes the instance
// meanwhile. An instance that stands is used and left standing; when none
// stands, one is made here and destroyed at the end. Every case works in a
// throwaway database of its own; nothing is applied to the instance's own.

// Measured by the lead: a make takes about a minute, a destroy about a quarter of one.
const MAKE_MS = 180_000;
const DESTROY_MS = 60_000;
// Kept short: the wait is one blocking call, and the test run answers nothing while it lasts.
const LOCK_WAIT_SECONDS = 30;

let lock: HostLock | undefined;
let madeHere = false;

beforeAll(async () => {
  lock = acquireHostLock({ waitSeconds: LOCK_WAIT_SECONDS });
  const found = await instanceStatus();
  if (found.state === "foreign") throw new Error(`the bench neither stands nor is absent — ${found.detail}: nothing is made over it`);
  if (found.state === "absent") {
    // Said before the make: one that fails half-way is still removed by this module's end.
    madeHere = true;
    await makeInstance(lock);
  }
}, LOCK_WAIT_SECONDS * 1_000 + MAKE_MS);

afterAll(async () => {
  removeTheChainRoots();
  try {
    if (lock !== undefined && madeHere) await destroyInstance(lock);
  } finally {
    lock?.release();
  }
}, DESTROY_MS);

describe("the harness — seen to work before a case rests on it", { timeout: CASE_MS }, () => {
  it("a throwaway database is made on the bench's cluster, the guard allows it through its own list, and it is gone afterwards", async () => {
    let made: Identity | undefined;
    await inAThrowawayDatabase(async (db) => {
      made = db.identity;
      const [instance] = readInstances();
      expect(db.identity.sysid).toBe(instance?.sysid);
      expect(db.identity.dbname).not.toBe("postgres");
      expect(readInstances(db.target.statePath)).toMatchObject([db.identity]);
      expect(await assertFoundationTarget(db.client, { statePath: db.target.statePath })).toEqual(db.identity);
      expect(await valueOf(db.client, "select current_database()")).toBe(db.identity.dbname);
    });
    const stillThere = await onTheInstance((instance) => valueOf(instance, "select count(*)::int from pg_catalog.pg_database where oid = $1::oid", [made?.dboid]));
    expect(stillThere).toBe(0);
  });

  it("a session inside pg_sleep is seen as such by another session — and no longer once it woke", async () => {
    await inAThrowawayDatabase(async (db) => {
      const sleepingNow = (): Promise<unknown> =>
        onTheInstance((instance) =>
          valueOf(instance, "select count(*)::int from pg_catalog.pg_stat_activity where datname = $1 and wait_event = 'PgSleep'", [db.identity.dbname]),
        );
      expect(await sleepingNow()).toBe(0);
      const asleep = db.client.query("select pg_sleep(1)");
      await onTheInstance((instance) => untilASessionSleeps(instance, db.identity.dbname));
      await asleep;
      expect(await sleepingNow()).toBe(0);
    });
  });
});

builtFromNothing();
theBootstrap();
theCheck();
failingFiles();
sessionsAndUpgrade();
oneRunnerAtATime();
theTarget();
theCommand();

describe("what the module leaves", { timeout: CASE_MS }, () => {
  it("no database that it made still stands", async () => {
    expect(databasesMade()).toBeGreaterThan(0);
    expect(await databasesLeft()).toEqual([]);
  });
});
