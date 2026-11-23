import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { inSchema } from "../../chain/fixtures/chain-on-disk.ts";
import { filesLedgered, standingOf, valueOf } from "../../chain/fixtures/looking.ts";
import { CASE_MS, inAThrowawayDatabase, type Throwaway } from "../../chain/fixtures/throwaway-database.ts";
import { granteesOnFunction, routineToTheInstant, routinesInOs, routinesInPublic } from "../fixtures/looking-at-os.ts";
import { HALVE, greets } from "../fixtures/pass-files.ts";
import { inFunctions } from "../fixtures/passes-on-disk.ts";
import { greetAndTwiceStand } from "../fixtures/standing.ts";

// SPEC §6 step 8 and §9.3, the functions pass on its red paths: a file the server refuses,
// a file that is not its own function's, a file that commits. Each is `pass-failed`, and a
// pass that fails leaves nothing of itself — no body replaced, none made. Every text here
// begins with its own function: one that does not never reaches the server (SPEC §12.1,
// read-passes.test.ts and cases/functions-begin-with-their-own.ts).

/**
 * greet() and twice() stand; then greet.sql's body is changed and halve.sql is written with `text` —
 * by name the second of the three, so the changed greet.sql is applied before it. Answers the root.
 */
async function withHalveBetween(db: Throwaway, text: string): Promise<string> {
  const root = await greetAndTwiceStand(db);
  writeFileSync(inFunctions(root, "greet.sql"), greets("good day"));
  writeFileSync(inFunctions(root, "halve.sql"), text);
  return root;
}

/** What a failed pass must leave: the two functions as the first run made them, greet's old body, no grant written — and in `public` what stood there. */
async function expectNothingOfThePass(db: Throwaway, inPublic: string[] = []): Promise<void> {
  expect(await routinesInOs(db.client)).toEqual(["greet()", "twice(n integer)"]);
  expect(await routinesInPublic(db.client)).toEqual(inPublic);
  expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
  expect(await valueOf(db.client, "select os.twice(21)")).toBe(42);
  expect(await granteesOnFunction(db.client, "os.greet()")).toEqual([]);
}

const QUARTER = "create or replace function os.quarter(n integer) returns integer language sql as $f$ select n / 4 $f$;\n";

// Each text is halve.sql's; each message is SPEC §6's, spelled.
const NOT_ITS_OWN: [string, string, string][] = [
  ["makes two", HALVE + QUARTER, "the file did not make or replace exactly os.halve: made or changed [halve, quarter], removed []"],
  [
    "also grants on another file's function",
    `${HALVE}grant execute on function os.greet() to pg_monitor;\n`,
    "the file did not make or replace exactly os.halve: made or changed [greet, halve], removed []",
  ],
  ["drops another file's function", `${HALVE}drop function os.twice(integer);\n`, "the file did not make or replace exactly os.halve: made or changed [halve], removed [twice]"],
  ["makes nothing — it drops what it made", `${HALVE}drop function os.halve(integer);\n`, "the file did not make or replace exactly os.halve: made or changed [], removed []"],
  [
    "makes its own function under two signatures — the name is said once",
    `${HALVE}create or replace function os.halve(n bigint) returns bigint language sql as $f$ select n / 2 $f$;\n`,
    "the file did not make or replace exactly os.halve: made or changed [halve], removed []",
  ],
];

// SPEC §12.2: a function made with no schema lands in `public` (measured), and a row outside `os` fails the file as
// one inside does — said `<schema>.<name>`, each list ascending by what is said. By its bare name `aside` lies
// before `halve`; as it is said, after it.
const ASIDE = "create or replace function aside() returns integer language sql as $f$ select 0 $f$;\n";

/** A function of `public` that stands before the run, made by the test's own hand: what a function file must not reach. */
const A_BYSTANDER = "create function public.bystander() returns integer language sql as $f$ select 7 $f$";

// Each text is halve.sql's, beside public.bystander() standing.
const REACHES_ANOTHER_SCHEMA: [string, string, string][] = [
  ["also makes a function with no schema: it lands in public", HALVE + ASIDE, "the file did not make or replace exactly os.halve: made or changed [halve, public.aside], removed []"],
  [
    "also grants on a function of public",
    `${HALVE}grant execute on function public.bystander() to pg_monitor;\n`,
    "the file did not make or replace exactly os.halve: made or changed [halve, public.bystander], removed []",
  ],
  ["drops a function of public", `${HALVE}drop function public.bystander();\n`, "the file did not make or replace exactly os.halve: made or changed [halve], removed [public.bystander]"],
];

export function functionsFailing(): void {
  describe("the functions pass — a failing pass", { timeout: CASE_MS }, () => {
    const FAILS_AFTER_MAKING = `${HALVE}select 1/0;\n`;

    it("the second of three files fails: pass-failed with the pass, the file and the server's message — nothing of the pass, and the run's schema file stays", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await withHalveBetween(db, FAILS_AFTER_MAKING);
        writeFileSync(inSchema(root, "0002-notes.sql"), "create table os.notes (note text);\n");

        const outcome = await applyChain({ target: db.target, root });
        expect(outcome).toEqual({ state: "pass-failed", pass: "functions", file: "halve.sql", message: "division by zero", applied: ["0002-notes.sql"] });
        await expectNothingOfThePass(db);
        expect(await filesLedgered(db.client)).toEqual(["(ledger)", "0001-os.sql", "0002-notes.sql"]);
        expect(await standingOf(db.client, "os.notes")).toEqual(["os.notes"]);
      });
    });

    it("the file corrected: the next run is green, and every file's body is in effect", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await withHalveBetween(db, FAILS_AFTER_MAKING);
        expect(await applyChain({ target: db.target, root })).toMatchObject({ state: "pass-failed", file: "halve.sql" });

        writeFileSync(inFunctions(root, "halve.sql"), HALVE);
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, functions: 3 });
        expect(await routinesInOs(db.client)).toEqual(["greet()", "halve(n integer)", "twice(n integer)"]);
        expect(await valueOf(db.client, "select os.greet()")).toBe("good day");
        expect(await valueOf(db.client, "select os.halve(10)")).toBe(5);
      });
    });
  });

  describe("the functions pass — a file that is not its own function's", { timeout: CASE_MS }, () => {
    it.each(NOT_ITS_OWN)("one that %s: pass-failed with the message spelled, rolled back whole", async (_what, text, message) => {
      await inAThrowawayDatabase(async (db) => {
        const root = await withHalveBetween(db, text);
        expect(await applyChain({ target: db.target, root })).toEqual({ state: "pass-failed", pass: "functions", file: "halve.sql", message, applied: [] });
        await expectNothingOfThePass(db);
      });
    });

    it.each(REACHES_ANOTHER_SCHEMA)("one that %s: pass-failed with the row said with its schema — nothing left of it in public or in os", async (_what, text, message) => {
      await inAThrowawayDatabase(async (db) => {
        const root = await withHalveBetween(db, text);
        await db.client.query(A_BYSTANDER);
        const theBystander = await routineToTheInstant(db.client, "public.bystander()");

        expect(await applyChain({ target: db.target, root })).toEqual({ state: "pass-failed", pass: "functions", file: "halve.sql", message, applied: [] });
        await expectNothingOfThePass(db, ["bystander()"]);
        expect(await routineToTheInstant(db.client, "public.bystander()")).toBe(theBystander);
        expect(await granteesOnFunction(db.client, "public.bystander()")).toEqual([]);
      });
    });
  });

  describe("the functions pass — a file that commits", { timeout: CASE_MS }, () => {
    it.each([
      ["commit", "commit;"],
      ["a do block that commits", "do $$ begin commit; end $$;"],
    ])("%s after making its function: pass-failed with a message that says transaction, and nothing of the pass is left", async (_what, statement) => {
      await inAThrowawayDatabase(async (db) => {
        const root = await withHalveBetween(db, `${HALVE}${statement}\n`);
        const outcome = await applyChain({ target: db.target, root });
        expect(outcome).toEqual({ state: "pass-failed", pass: "functions", file: "halve.sql", message: expect.stringContaining("transaction"), applied: [] });
        await expectNothingOfThePass(db);
      });
    });
  });
}
