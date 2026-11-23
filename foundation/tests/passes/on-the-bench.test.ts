import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { acquireHostLock, destroyInstance, instanceStatus, makeInstance, type HostLock } from "@dxb-foundation/bench";
import { removeTheChainRoots } from "../chain/fixtures/chain-on-disk.ts";
import { CASE_MS, databasesLeft, databasesMade } from "../chain/fixtures/throwaway-database.ts";
import { functionsBeginWithTheirOwn } from "./cases/functions-begin-with-their-own.ts";
import { functionsBuiltAndReplaced } from "./cases/functions-built-and-replaced.ts";
import { functionsFailing } from "./cases/functions-failing.ts";
import { functionsManifest } from "./cases/functions-manifest.ts";
import { functionsOneSessionEach } from "./cases/functions-one-session-each.ts";
import { passesInOneRun } from "./cases/passes-in-one-run.ts";
import { referenceDeferred } from "./cases/reference-deferred.ts";
import { referenceFailing } from "./cases/reference-failing.ts";
import { referenceMarkedAndJudged } from "./cases/reference-marked-and-judged.ts";
import { referenceOrder } from "./cases/reference-order.ts";
import { referenceReadsTheSame } from "./cases/reference-reads-the-same.ts";
import { referenceReconciled } from "./cases/reference-reconciled.ts";
import { referenceTwoStatements } from "./cases/reference-two-statements.ts";
import { referenceWritesElsewhere } from "./cases/reference-writes-elsewhere.ts";
import { theCommand } from "./cases/the-command.ts";

// SPEC §9.3 and §12: every case of the two passes that needs a server, in this one module — so
// the instance is prepared once, as piece 3's module prepares it. The module holds the
// bench's host lock from its first case to its last: no other hand makes or removes the
// instance meanwhile. An instance that stands is used and left standing; when none
// stands, one is made here and destroyed at the end. Every case works in a throwaway
// database of its own, reached through a list file of its own; the schema `os` and its
// tables are made there by the fixture chain's own schema files. Nothing is applied to
// the instance's own database.

// Measured by the lead (piece 3): a make takes about a minute, a destroy about a quarter of one.
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

functionsBuiltAndReplaced();
functionsBeginWithTheirOwn();
functionsManifest();
functionsFailing();
functionsOneSessionEach();
referenceReconciled();
referenceMarkedAndJudged();
referenceReadsTheSame();
referenceTwoStatements();
referenceFailing();
referenceWritesElsewhere();
referenceDeferred();
referenceOrder();
passesInOneRun();
theCommand();

describe("what the module leaves", { timeout: CASE_MS }, () => {
  it("no database that it made still stands", async () => {
    expect(databasesMade()).toBeGreaterThan(0);
    expect(await databasesLeft()).toEqual([]);
  });
});
