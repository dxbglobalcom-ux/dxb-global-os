import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { filesLedgered, ledgerToTheInstant, valueOf } from "../../chain/fixtures/looking.ts";
import { CASE_MS, inAThrowawayDatabase } from "../../chain/fixtures/throwaway-database.ts";
import { granteesOnFunction, routinesInOs, rowsIn } from "../fixtures/looking-at-os.ts";
import { MAKES_A_STRAY, MAKES_OS, TWICE, greets } from "../fixtures/pass-files.ts";
import { inFunctions, passesRoot } from "../fixtures/passes-on-disk.ts";
import { greetAndTwiceStand, osGreetAndTwice } from "../fixtures/standing.ts";

// SPEC §6 step 8 and §9.3, the functions pass on its green paths: every run re-applies the
// files of functions/ after the schema files, writes no ledger row for it, and the directory
// decides whether the pass runs at all.

const GREET_WITH_ITS_OWN_GRANTS = [
  greets("hello").trimEnd(),
  "revoke all on function os.greet() from public;",
  "grant execute on function os.greet() to pg_monitor;",
  "comment on function os.greet() is 'says hello';",
  "",
].join("\n");

/** os.stamp() in the form that writes `form` into every row on its way in. */
const stamps = (form: string, make: "create" | "create or replace"): string =>
  `${make} function os.stamp() returns trigger language plpgsql as $f$ begin new.stamp := '${form}'; return new; end $f$;\n`;

// What a schema file owes a function file (SPEC §4): the trigger needs its function when it is made, so the
// schema file makes it in the form of that day; the file in functions/ holds the body from then on.
const ENTRIES_WITH_THEIR_TRIGGER = [
  "create table os.entries (id integer primary key, stamp text);",
  stamps("first form", "create").trimEnd(),
  "create trigger stamp before insert on os.entries for each row execute function os.stamp();",
  "",
].join("\n");

export function functionsBuiltAndReplaced(): void {
  describe("the functions pass — built from nothing", { timeout: CASE_MS }, () => {
    it("a schema file that makes os and two function files: applied with functions: 2, and both answer what their files say", async () => {
      await inAThrowawayDatabase(async (db) => {
        const outcome = await applyChain({ target: db.target, root: osGreetAndTwice() });
        expect(outcome).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, functions: 2 });
        expect(await routinesInOs(db.client)).toEqual(["greet()", "twice(n integer)"]);
        expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
        expect(await valueOf(db.client, "select os.twice(21)")).toBe(42);
      });
    });

    it("no ledger row is written for a pass: the ledger holds row 0 and the schema file", async () => {
      await inAThrowawayDatabase(async (db) => {
        await greetAndTwiceStand(db);
        expect(await filesLedgered(db.client)).toEqual(["(ledger)", "0001-os.sql"]);
      });
    });

    it("a second run answers the same with nothing applied, changes no ledger row, and the functions still answer", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await greetAndTwiceStand(db);
        const afterTheFirst = await ledgerToTheInstant(db.client);
        expect(afterTheFirst).toHaveLength(2);

        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, functions: 2 });
        expect(await ledgerToTheInstant(db.client)).toEqual(afterTheFirst);
        expect(await routinesInOs(db.client)).toEqual(["greet()", "twice(n integer)"]);
        expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
        expect(await valueOf(db.client, "select os.twice(21)")).toBe(42);
      });
    });
  });

  describe("the functions pass — a changed body replaced", { timeout: CASE_MS }, () => {
    it("a file's body changed: after the run the function answers the new body, and the ledger's rows are unchanged to the instant", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await greetAndTwiceStand(db);
        const before = await ledgerToTheInstant(db.client);

        writeFileSync(inFunctions(root, "greet.sql"), greets("good day"));
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, functions: 2 });
        expect(await valueOf(db.client, "select os.greet()")).toBe("good day");
        expect(await valueOf(db.client, "select os.twice(21)")).toBe(42);
        expect(await ledgerToTheInstant(db.client)).toEqual(before);
      });
    });
  });

  describe("the functions pass — a file that carries its own revoke and grants", { timeout: CASE_MS }, () => {
    it("is applied: the grant and the comment stand, PUBLIC is revoked, and the other file's function is as it was made", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS }, functions: { "greet.sql": GREET_WITH_ITS_OWN_GRANTS, "twice.sql": TWICE } });
        const applied = { state: "applied", applied: ["0001-os.sql"], standing: 1, functions: 2 };
        expect(await applyChain({ target: db.target, root })).toStrictEqual(applied);
        expect(await granteesOnFunction(db.client, "os.greet()")).toEqual(["pg_monitor", "postgres"]);
        expect(await valueOf(db.client, "select pg_catalog.obj_description('os.greet()'::regprocedure, 'pg_proc')")).toBe("says hello");
        expect(await granteesOnFunction(db.client, "os.twice(integer)")).toEqual([]);

        // Re-applied by the next run over what it left: the same answer, and the same grants.
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ ...applied, applied: [] });
        expect(await granteesOnFunction(db.client, "os.greet()")).toEqual(["pg_monitor", "postgres"]);
        expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
      });
    });
  });

  describe("the functions pass — a trigger's function", { timeout: CASE_MS }, () => {
    it("built from nothing in one run: the schema file makes the first form and the trigger, the file holds the second — a new row meets the second", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({
          schema: { "0001-os.sql": MAKES_OS, "0002-entries.sql": ENTRIES_WITH_THEIR_TRIGGER },
          functions: { "stamp.sql": stamps("second form", "create or replace") },
        });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql", "0002-entries.sql"], standing: 2, functions: 1 });
        await db.client.query("insert into os.entries (id) values (1)");
        expect(await rowsIn(db.client, "select id, stamp from os.entries order by id")).toEqual([{ id: 1, stamp: "second form" }]);
      });
    });

    it("the schema file applied by an earlier run: the file's body changed, and the next row meets it through the trigger that stood", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({
          schema: { "0001-os.sql": MAKES_OS, "0002-entries.sql": ENTRIES_WITH_THEIR_TRIGGER },
          functions: { "stamp.sql": stamps("first form", "create or replace") },
        });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql", "0002-entries.sql"], standing: 2, functions: 1 });
        await db.client.query("insert into os.entries (id) values (1)");

        writeFileSync(inFunctions(root, "stamp.sql"), stamps("second form", "create or replace"));
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 2, functions: 1 });
        await db.client.query("insert into os.entries (id) values (2)");
        expect(await rowsIn(db.client, "select id, stamp from os.entries order by id")).toEqual([
          { id: 1, stamp: "first form" },
          { id: 2, stamp: "second form" },
        ]);
      });
    });
  });

  describe("the functions pass — the directory decides", { timeout: CASE_MS }, () => {
    it("functions/ standing and empty while os holds a function: the function is an orphan", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + MAKES_A_STRAY }, functions: {} });
        expect(await applyChain({ target: db.target, root })).toEqual({ state: "manifest", offences: [{ kind: "orphan", detail: "stray()" }], applied: ["0001-os.sql"] });
        expect(await routinesInOs(db.client)).toEqual(["stray()"]);
      });
    });

    it("no functions/: applied with no functions key, run after run, and the function is untouched", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + MAKES_A_STRAY } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1 });
        const itsRow = "select oid::text, ctid::text, xmin::text from pg_catalog.pg_proc where oid = 'os.stray()'::regprocedure";
        const asItWasMade = await rowsIn(db.client, itsRow);
        expect(asItWasMade).toHaveLength(1);

        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1 });
        expect(await rowsIn(db.client, itsRow)).toEqual(asItWasMade);
        expect(await valueOf(db.client, "select os.stray()")).toBe("made by a schema file");
      });
    });

    it("functions/ standing with no file, and no schema os: applied with functions: 0", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ functions: {} });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 0, functions: 0 });
        expect(await valueOf(db.client, "select to_regnamespace('os') is null")).toBe(true);
      });
    });
  });
}
