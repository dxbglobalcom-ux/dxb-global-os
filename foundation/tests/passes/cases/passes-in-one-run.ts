import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TargetRefused } from "@dxb-foundation/bench";
import { applyChain } from "@dxb-foundation/chain";
import { inSchema } from "../../chain/fixtures/chain-on-disk.ts";
import { filesLedgered, hasTheLedgersSchema, serverClock, valueOf } from "../../chain/fixtures/looking.ts";
import { refusalOf } from "../../chain/fixtures/refusal.ts";
import { sleepingFile, startRun, untilASessionJoins, untilASessionSleeps } from "../../chain/fixtures/running.ts";
import { CASE_MS, inAThrowawayDatabase, type Throwaway } from "../../chain/fixtures/throwaway-database.ts";
import { routinesInOs, rowsIn, rowsToTheInstant } from "../fixtures/looking-at-os.ts";
import { CLOSED, EVENT_TYPES_BY_NAME, EVENT_TYPES_TABLE, MAKES_OS, OPENED, TWICE, fileOf, greets, thenSleeps } from "../fixtures/pass-files.ts";
import { inFunctions, inReference, passesRoot, standsWith } from "../fixtures/passes-on-disk.ts";
import { THE_THREE_EVENT_TYPES } from "../fixtures/standing.ts";

// SPEC §6 steps 8 to 10 and §9.3, "the passes in one run": the schema files, then the
// functions pass, then the reference pass — each pass in a session of its own that passes
// the guard like every other, and a run that fails before a pass does not run it.

const BOTH_APPLIED = { state: "applied", applied: ["0001-os.sql"], standing: 1, functions: 2, reference: 1 };

const THE_THREE_ROWS = [
  { name: "job.closed", description: "a job was closed", weight: 2, seen_count: 0 },
  { name: "job.failed", description: "a job failed", weight: 3, seen_count: 0 },
  { name: "job.opened", description: "a job was opened", weight: 1, seen_count: 0 },
];

/** A root of one schema file, two function files and one vocabulary. */
const withBothPasses = (): string =>
  passesRoot({
    schema: { "0001-os.sql": MAKES_OS + EVENT_TYPES_TABLE },
    functions: { "greet.sql": greets("hello"), "twice.sql": TWICE },
    reference: { "event_types.json": THE_THREE_EVENT_TYPES },
  });

/** That root run green, and then both passes' files changed for the next run: greet's body, and the vocabulary's rows. Answers the root. */
async function bothStandAndBothChanged(db: Throwaway): Promise<string> {
  const root = withBothPasses();
  expect(await applyChain({ target: db.target, root })).toStrictEqual(BOTH_APPLIED);
  writeFileSync(inFunctions(root, "greet.sql"), greets("good day"));
  writeFileSync(inReference(root, "event_types.json"), fileOf(OPENED, CLOSED));
  return root;
}

// Longer than the sleep by far: the second run is let in when the first ends, not when this runs out.
const LONG_WAIT_SECONDS = 30;

/**
 * A run of `root` that is in a file that sleeps when the list loses the database's identity: the next session
 * the run opens is refused by the guard, and the refusal is the run's ending — seen here. The run is over when
 * this ends.
 */
async function refusedOnceTheListLosesIt(db: Throwaway, root: string): Promise<void> {
  const run = startRun({ target: db.target, root });
  try {
    await untilASessionSleeps(db.client, db.identity.dbname);
    db.relist([]);
    expect(run.ended()).toBe(false);
    const refusal = await refusalOf(TargetRefused, () => run.outcome());
    expect(refusal.reason).toBe("not-listed");
  } finally {
    await run.over;
  }
}

// Each of the three outlives its transaction in the session that said it (piece 3's SPEC §3, measured).
const LEAVES_ITS_SESSION_CHANGED = ["set search_path = pg_catalog;", "create temp table left_behind (id integer);", "set role pg_monitor;", ""].join("\n");

export function passesInOneRun(): void {
  describe("the passes in one run", { timeout: CASE_MS }, () => {
    it("schema files and both passes: applied with both counts — the functions answer and the vocabulary holds its file's rows", async () => {
      await inAThrowawayDatabase(async (db) => {
        expect(await applyChain({ target: db.target, root: withBothPasses() })).toStrictEqual(BOTH_APPLIED);
        expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
        expect(await valueOf(db.client, "select os.twice(21)")).toBe(42);
        expect(await rowsIn(db.client, EVENT_TYPES_BY_NAME)).toEqual(THE_THREE_ROWS);
        expect(await filesLedgered(db.client)).toEqual(["(ledger)", "0001-os.sql"]);
      });
    });

    it("a failing schema file: file-failed, and neither pass ran — the changed body is not in effect, the vocabulary is as it stood", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await bothStandAndBothChanged(db);
        const before = await rowsToTheInstant(db.client, "os.event_types");
        writeFileSync(inSchema(root, "0002-broken.sql"), "create table os.half_made (id integer);\nselect 1/0;\n");

        expect(await applyChain({ target: db.target, root })).toEqual({ state: "file-failed", file: "0002-broken.sql", message: "division by zero", applied: [] });
        expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
        expect(await rowsToTheInstant(db.client, "os.event_types")).toEqual(before);
      });
    });

    it("a functions pass that does not end green ends the run: the reference pass does not run", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await bothStandAndBothChanged(db);
        const before = await rowsToTheInstant(db.client, "os.event_types");
        writeFileSync(inFunctions(root, "twice.sql"), `${TWICE}select 1/0;\n`);

        expect(await applyChain({ target: db.target, root })).toMatchObject({ state: "pass-failed", pass: "functions", file: "twice.sql" });
        expect(await rowsToTheInstant(db.client, "os.event_types")).toEqual(before);
        expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
      });
    });

    it("each pass in a session of its own: what the last schema file and a function file left in theirs — a role, a search path, a temporary table — meets neither pass", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({
          schema: { "0001-os.sql": MAKES_OS + EVENT_TYPES_TABLE + LEAVES_ITS_SESSION_CHANGED },
          functions: { "greet.sql": greets("hello") + LEAVES_ITS_SESSION_CHANGED },
          reference: { "event_types.json": THE_THREE_EVENT_TYPES },
        });
        // In the session of either, the next pass would act as pg_monitor — which may make nothing in os, and write nothing there.
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, functions: 1, reference: 1 });
        expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
        expect(await rowsIn(db.client, EVENT_TYPES_BY_NAME)).toEqual(THE_THREE_ROWS);
      });
    });
  });

  describe("the disk of the passes is read with the chain's", { timeout: CASE_MS }, () => {
    it("offences of schema/, functions/ and reference/ are one outcome, in SPEC §7's order — said before the target is asked who it is, nothing written", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({
          schema: { "0001-os.sql": MAKES_OS, "0002-nothing.sql": "", "notes.txt": "beside the chain\n" },
          functions: { "Greet.sql": greets("hello"), "nothing.sql": " \n" },
          reference: { "event_types.json": "{}", "notes.txt": "beside the vocabularies\n" },
        });
        // No list holds this database: a run that opened a connection would be refused, not answered.
        db.relist([]);
        expect(await applyChain({ target: db.target, root })).toEqual({
          state: "offences",
          offences: [
            { kind: "unknown-entry", detail: "functions/Greet.sql" },
            { kind: "unknown-entry", detail: "notes.txt" },
            { kind: "unknown-entry", detail: "reference/notes.txt" },
            { kind: "empty", detail: "0002-nothing.sql" },
            { kind: "empty", detail: "functions/nothing.sql" },
            { kind: "malformed", detail: "reference/event_types.json" },
          ],
        });
        expect(await hasTheLedgersSchema(db.client)).toBe(false);
      });
    });

    // SPEC §6 with piece 3's §12.5: the reading under the lock is the run's. The margins are piece 3's (fixtures/running.ts).
    it("a function file changed while a run waits for the lock is applied as it stands under the lock", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": sleepingFile(MAKES_OS.trimEnd()) }, functions: { "greet.sql": greets("hello") } });
        const first = startRun({ target: db.target, root });
        let second: ReturnType<typeof startRun> | undefined;
        try {
          await untilASessionSleeps(db.client, db.identity.dbname);
          const whileTheFirstSleeps = await serverClock(db.client);
          second = startRun({ target: db.target, root, lockWaitSeconds: LONG_WAIT_SECONDS });
          // The second run opened its connection: it has read the disk, and stands at the lock.
          await untilASessionJoins(db.client, db.identity.dbname, whileTheFirstSleeps);
          writeFileSync(inFunctions(root, "greet.sql"), greets("good day"));
          expect([first.ended(), second.ended()]).toEqual([false, false]);

          expect(await first.outcome()).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, functions: 1 });
          expect(await second.outcome()).toStrictEqual({ state: "applied", applied: [], standing: 1, functions: 1 });
        } finally {
          await Promise.all([first.over, second?.over]);
        }
        expect(await valueOf(db.client, "select os.greet()")).toBe("good day");
      });
    });
  });

  // Each rests on a sleep as its margin, as piece 3's lost-identity case does: the list is rewritten once the
  // server shows the run's session asleep, and the pass's session cannot open before the sleep ends.
  describe("the passes' sessions pass the guard", { timeout: CASE_MS }, () => {
    it("a list that loses the identity while the schema file sleeps: the functions pass's session is refused — the file stays ledgered, no function is made", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": sleepingFile(MAKES_OS.trimEnd()) }, functions: { "greet.sql": greets("hello") } });
        await refusedOnceTheListLosesIt(db, root);
        expect(await filesLedgered(db.client)).toEqual(["(ledger)", "0001-os.sql"]);
        expect(await routinesInOs(db.client)).toEqual([]);

        // The list holds it again: the next run makes the function.
        db.relist([db.identity]);
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, functions: 1 });
        expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
      });
    });

    it("a list that loses the identity while a function file sleeps: the reference pass's session is refused — the functions pass stays, no row is written", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + EVENT_TYPES_TABLE } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1 });

        // The schema file stands ledgered; the next run opens no file's session before the functions pass's.
        standsWith(root, "functions", { "greet.sql": thenSleeps(greets("hello")) });
        standsWith(root, "reference", { "event_types.json": THE_THREE_EVENT_TYPES });
        await refusedOnceTheListLosesIt(db, root);
        expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
        expect(await valueOf(db.client, "select count(*)::int from os.event_types")).toBe(0);

        db.relist([db.identity]);
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, functions: 1, reference: 1 });
        expect(await rowsIn(db.client, EVENT_TYPES_BY_NAME)).toEqual(THE_THREE_ROWS);
      });
    });
  });
}
