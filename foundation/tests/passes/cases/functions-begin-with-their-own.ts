import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { ledgerToTheInstant, valueOf } from "../../chain/fixtures/looking.ts";
import { CASE_MS, inAThrowawayDatabase, type Throwaway } from "../../chain/fixtures/throwaway-database.ts";
import { granteesOnFunction, routineToTheInstant, routinesInOs, routinesInPublic } from "../fixtures/looking-at-os.ts";
import { MAKES_A_STRAY, MAKES_OS } from "../fixtures/pass-files.ts";
import { inFunctions, passesRoot } from "../fixtures/passes-on-disk.ts";
import { greetAndTwiceStand } from "../fixtures/standing.ts";

// SPEC §12.1 on the bench: a function file begins with its own function, so the first
// statement the server executes of a file sets its function's body — on every run. A file
// that does not is `malformed` on the disk and never reaches the server: the run that
// could end green over a body its file never set (the two audits' first finding) ends in
// offences. And §12.12: `.gitkeep` keeps a directory standing, so its pass runs.

// Each text is greet.sql's while os.greet() stands and answers "hello". None of them sets the body.
const SETS_NO_BODY: [string, string][] = [
  ["only grants on its function", "grant execute on function os.greet() to pg_monitor;\n"],
  ["only alters its function", "alter function os.greet() cost 5;\n"],
  [
    "makes its function with no schema, then revokes on the one that stands",
    "create or replace function greet() returns text language sql as $f$ select 'good day'::text $f$;\nrevoke all on function os.greet() from public;\n",
  ],
  [
    "makes its function only if it is not there, then grants",
    "do $$ begin if to_regprocedure('os.greet()') is null then execute 'create function os.greet() returns text language sql as ''select 1::text'''; end if; end $$;\n" +
      "grant execute on function os.greet() to pg_monitor;\n",
  ],
];

const THE_OFFENCE = { state: "offences", offences: [{ kind: "malformed", detail: "functions/greet.sql" }] };

/** What a run that ended on the disk must leave: os.greet() to the instant as `asItStood`, nothing granted, nothing made in `public`, the old answer. */
async function expectGreetAsItStood(db: Throwaway, asItStood: unknown): Promise<void> {
  expect(await routineToTheInstant(db.client, "os.greet()")).toBe(asItStood);
  expect(await granteesOnFunction(db.client, "os.greet()")).toEqual([]);
  expect(await routinesInPublic(db.client)).toEqual([]);
  expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
}

// The forms SPEC §12.1 accepts, as the server takes them: capitals, line comments and blank lines first, white
// space between the words and before the bracket; a procedure; an aggregate.
const GREET_IN_CAPITALS = "-- says hello\n\n  -- to whoever asks\nCREATE OR REPLACE FUNCTION OS.GREET () RETURNS text LANGUAGE sql AS $f$ select 'hello'::text $f$;\n";
const TIDY = "create or replace procedure os.tidy() language sql as $p$ select 1 $p$;\n";
const TOTAL = "create\n  or replace\taggregate os.total(integer) (sfunc = int4pl, stype = integer);\n";

export function functionsBeginWithTheirOwn(): void {
  describe("a function file begins with its own function", { timeout: CASE_MS }, () => {
    it.each(SETS_NO_BODY)("a file that %s: the run ends in offences, malformed — the function, the ledger and public are as they stood", async (_what, text) => {
      await inAThrowawayDatabase(async (db) => {
        const root = await greetAndTwiceStand(db);
        const asItStood = await routineToTheInstant(db.client, "os.greet()");
        const ledger = await ledgerToTheInstant(db.client);
        writeFileSync(inFunctions(root, "greet.sql"), text);

        expect(await applyChain({ target: db.target, root })).toEqual(THE_OFFENCE);
        await expectGreetAsItStood(db, asItStood);
        expect(await ledgerToTheInstant(db.client)).toEqual(ledger);
      });
    });

    it("it is said from the disk, before the target is asked who it is", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await greetAndTwiceStand(db);
        const asItStood = await routineToTheInstant(db.client, "os.greet()");
        writeFileSync(inFunctions(root, "greet.sql"), "grant execute on function os.greet() to pg_monitor;\n");
        // No list holds this database: a run that opened a connection would be refused, not answered.
        db.relist([]);

        expect(await applyChain({ target: db.target, root })).toEqual(THE_OFFENCE);
        await expectGreetAsItStood(db, asItStood);
      });
    });

    it("a body changed by hand between two runs of the same file is the file's again: a run skips no file because it did not change", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await greetAndTwiceStand(db);
        await db.client.query("create or replace function os.greet() returns text language sql as $f$ select 'changed by hand'::text $f$");
        expect(await valueOf(db.client, "select os.greet()")).toBe("changed by hand");

        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, functions: 2 });
        expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
        expect(await valueOf(db.client, "select os.twice(21)")).toBe(42);
      });
    });

    it("the forms a file may begin in — capitals, comments and blank lines first, a procedure, an aggregate — are applied, run after run", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS }, functions: { "greet.sql": GREET_IN_CAPITALS, "tidy.sql": TIDY, "total.sql": TOTAL } });
        const applied = { state: "applied", applied: ["0001-os.sql"], standing: 1, functions: 3 };
        expect(await applyChain({ target: db.target, root })).toStrictEqual(applied);
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ ...applied, applied: [] });
        expect(await routinesInOs(db.client)).toEqual(["greet()", "tidy()", "total(integer)"]);
        expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
        expect(await valueOf(db.client, "select os.total(n) from (values (1), (2)) v (n)")).toBe(3);
      });
    });
  });

  describe(".gitkeep keeps a pass's directory standing", { timeout: CASE_MS }, () => {
    it("functions/ holding .gitkeep alone while os holds a function: the pass runs, and the function is an orphan", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + MAKES_A_STRAY }, functions: { ".gitkeep": "" } });
        expect(await applyChain({ target: db.target, root })).toEqual({ state: "manifest", offences: [{ kind: "orphan", detail: "stray()" }], applied: ["0001-os.sql"] });
        expect(await routinesInOs(db.client)).toEqual(["stray()"]);
      });
    });

    it("both directories holding .gitkeep alone, and nothing in os: applied, each pass with 0 files", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS }, functions: { ".gitkeep": "" }, reference: { ".gitkeep": "" } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, functions: 0, reference: 0 });
        expect(await routinesInOs(db.client)).toEqual([]);
      });
    });
  });
}
