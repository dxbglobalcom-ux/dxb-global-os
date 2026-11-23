import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyChain, type Outcome } from "@dxb-foundation/chain";
import { filesLedgered, valueOf } from "../../chain/fixtures/looking.ts";
import { CASE_MS, inAThrowawayDatabase, type Throwaway } from "../../chain/fixtures/throwaway-database.ts";
import { rowsToTheInstant } from "../fixtures/looking-at-os.ts";
import { CLOSED, EVENT_TYPES_TABLE, MAKES_OS, OPENED, fileOf, greets } from "../fixtures/pass-files.ts";
import { inFunctions, inReference, passesRoot, type Files } from "../fixtures/passes-on-disk.ts";
import { THE_THREE_EVENT_TYPES, eventTypesStand } from "../fixtures/standing.ts";

// SPEC §5, §6 step 9 and §9.3, the reference pass on its red paths: a table that is not what
// §5 asks, a statement the server refuses, a table that does not equal its file — each is
// `pass-failed` with the file it failed at, and the pass is rolled back whole.

const SEVERITIES_TABLE = "create table os.severities (level text primary key, rank integer not null);\n";

// A table outside the files that references a vocabulary's values (NO ACTION). The constraint is named here, so the server's message is spelled whole.
const JOBS_LOG_TABLE = "create table os.jobs_log (id integer primary key, event text not null constraint logged_event_stands references os.event_types (name));\n";

// Rewrites a value on its way in. It lives in `public`: what stands in `os` is the manifest's, and this case is not about it.
const SHOUTS = [
  "create function public.shouts() returns trigger language plpgsql as $f$ begin new.description := upper(new.description); return new; end $f$;",
  "create trigger shouts before insert or update on os.event_types for each row execute function public.shouts();",
  "",
].join("\n");

/** One run on a database built from nothing: 0001-os.sql makes os and `made`, and reference/ holds these files. */
async function refusedOver(db: Throwaway, made: string, reference: Files): Promise<Outcome> {
  const outcome = await applyChain({ target: db.target, root: passesRoot({ schema: { "0001-os.sql": MAKES_OS + made }, reference }) });
  // Whatever the pass said, the schema file of the same run stays ledgered.
  expect(await filesLedgered(db.client)).toEqual(["(ledger)", "0001-os.sql"]);
  return outcome;
}

/** The outcome of a reference pass that failed at `file` with `message`, in a run that applied 0001-os.sql before it. */
const failedAt = (file: string, message: string): Outcome => ({ state: "pass-failed", pass: "reference", file, message, applied: ["0001-os.sql"] });

const countIn = (db: Throwaway, table: string): Promise<unknown> => valueOf(db.client, `select count(*)::int from ${table}`);

export function referenceFailing(): void {
  describe("the reference pass — a failing pass is rolled back whole", { timeout: CASE_MS }, () => {
    it("two vocabularies, the second's file with a value of the wrong type: pass-failed at that file — the first table as it stood, the functions pass's work kept", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({
          schema: { "0001-os.sql": MAKES_OS + EVENT_TYPES_TABLE + SEVERITIES_TABLE },
          functions: { "greet.sql": greets("hello") },
          reference: { "event_types.json": THE_THREE_EVENT_TYPES, "severities.json": fileOf({ level: "low", rank: 1 }) },
        });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, functions: 1, reference: 2 });
        const eventTypes = await rowsToTheInstant(db.client, "os.event_types");
        const severities = await rowsToTheInstant(db.client, "os.severities");
        expect([eventTypes.length, severities.length]).toEqual([3, 1]);

        // The first vocabulary's file changes a row, drops one and adds one: written before the second fails, and gone with it.
        writeFileSync(inReference(root, "event_types.json"), fileOf({ ...OPENED, weight: 10 }, CLOSED, { name: "job.held", description: "a job is held", weight: 4 }));
        writeFileSync(inReference(root, "severities.json"), fileOf({ level: "low", rank: 1 }, { level: "high", rank: "heavy" }));
        writeFileSync(inFunctions(root, "greet.sql"), greets("good day"));

        expect(await applyChain({ target: db.target, root })).toEqual({
          state: "pass-failed",
          pass: "reference",
          file: "severities.json",
          message: 'invalid input syntax for type integer: "heavy"',
          applied: [],
        });
        expect(await rowsToTheInstant(db.client, "os.event_types")).toEqual(eventTypes);
        expect(await rowsToTheInstant(db.client, "os.severities")).toEqual(severities);
        // The functions pass of the same run had committed: what it replaced stays replaced.
        expect(await valueOf(db.client, "select os.greet()")).toBe("good day");
      });
    });
  });

  describe("the reference pass — a value in use is not removed", { timeout: CASE_MS }, () => {
    it("a table outside the files references a value the file no longer holds: pass-failed with the server's message, the table as it stood", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await eventTypesStand(db, JOBS_LOG_TABLE);
        await db.client.query("insert into os.jobs_log (id, event) values (1, 'job.failed')");
        const before = await rowsToTheInstant(db.client, "os.event_types");

        // job.failed is gone from the file, and job.opened changed in it: the change goes with the refused removal.
        writeFileSync(inReference(root, "event_types.json"), fileOf({ ...OPENED, weight: 10 }, CLOSED));
        expect(await applyChain({ target: db.target, root })).toEqual({
          state: "pass-failed",
          pass: "reference",
          file: "event_types.json",
          message: 'update or delete on table "event_types" violates foreign key constraint "logged_event_stands" on table "jobs_log"',
          applied: [],
        });
        expect(await rowsToTheInstant(db.client, "os.event_types")).toEqual(before);
      });
    });
  });

  describe("the reference pass — a table that is not what a vocabulary's must be, each message spelled", { timeout: CASE_MS }, () => {
    it("a view of that name: os.<table> is not a table", async () => {
      await inAThrowawayDatabase(async (db) => {
        const aView = "create view os.event_types as select 'job.opened'::text as name;\n";
        const outcome = await refusedOver(db, aView, { "event_types.json": fileOf({ name: "job.opened" }) });
        expect(outcome).toEqual(failedAt("event_types.json", "os.event_types is not a table"));
      });
    });

    it("nothing of that name in os: os.<table> is not a table — and the vocabulary before it by name is not written", async () => {
      await inAThrowawayDatabase(async (db) => {
        const outcome = await refusedOver(db, EVENT_TYPES_TABLE, { "event_types.json": THE_THREE_EVENT_TYPES, "severities.json": fileOf({ level: "low", rank: 1 }) });
        expect(outcome).toEqual(failedAt("severities.json", "os.severities is not a table"));
        expect(await countIn(db, "os.event_types")).toBe(0);
      });
    });

    it("keys of the file that are no columns: os.<table> has no column <the first by name>", async () => {
      await inAThrowawayDatabase(async (db) => {
        // Two keys that are no columns, the later by name written first.
        const outcome = await refusedOver(db, EVENT_TYPES_TABLE, { "event_types.json": fileOf({ name: "job.opened", shade: "dark", description: "a job was opened", colour: "red", weight: 1 }) });
        expect(outcome).toEqual(failedAt("event_types.json", "os.event_types has no column colour"));
        expect(await countIn(db, "os.event_types")).toBe(0);
      });
    });

    it("a table with no primary key, though a unique column: os.<table> has no primary key", async () => {
      await inAThrowawayDatabase(async (db) => {
        const outcome = await refusedOver(db, "create table os.loose (name text not null unique);\n", { "loose.json": fileOf({ name: "a" }) });
        expect(outcome).toEqual(failedAt("loose.json", "os.loose has no primary key"));
        expect(await countIn(db, "os.loose")).toBe(0);
      });
    });

    it("a file that leaves out the key's columns: the first in the key's order is said — not the first by name, nor the table's first", async () => {
      await inAThrowawayDatabase(async (db) => {
        const rates = "create table os.rates (code text, region text, rate integer not null, primary key (region, code));\n";
        const outcome = await refusedOver(db, rates, { "rates.json": fileOf({ rate: 1 }) });
        expect(outcome).toEqual(failedAt("rates.json", "the file does not carry the key column region of os.rates"));
        expect(await countIn(db, "os.rates")).toBe(0);
      });
    });

    it("a trigger that rewrites a value on its way in: os.<table> does not equal its file after the pass, and nothing is left written", async () => {
      await inAThrowawayDatabase(async (db) => {
        const outcome = await refusedOver(db, EVENT_TYPES_TABLE + SHOUTS, { "event_types.json": THE_THREE_EVENT_TYPES });
        expect(outcome).toEqual(failedAt("event_types.json", "os.event_types does not equal its file after the pass"));
        expect(await countIn(db, "os.event_types")).toBe(0);
      });
    });

    it("a key twice in one file: the server's message, and nothing is left written", async () => {
      await inAThrowawayDatabase(async (db) => {
        const outcome = await refusedOver(db, EVENT_TYPES_TABLE, { "event_types.json": fileOf(OPENED, CLOSED, { ...OPENED, weight: 9 }) });
        expect(outcome).toEqual(failedAt("event_types.json", "ON CONFLICT DO UPDATE command cannot affect row a second time"));
        expect(await countIn(db, "os.event_types")).toBe(0);
      });
    });
  });
}
