import { rmSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { inSchema } from "../../chain/fixtures/chain-on-disk.ts";
import { filesLedgered, valueOf } from "../../chain/fixtures/looking.ts";
import { CASE_MS, inAThrowawayDatabase } from "../../chain/fixtures/throwaway-database.ts";
import { routinesInOs } from "../fixtures/looking-at-os.ts";
import { MAKES_A_STRAY, MAKES_OS, TWICE_OF_A_BIGINT, greets } from "../fixtures/pass-files.ts";
import { inFunctions, passesRoot } from "../fixtures/passes-on-disk.ts";
import { greetAndTwiceStand } from "../fixtures/standing.ts";

// SPEC §6 step 8, the manifest, and §9.3: after the last file every row of pg_proc in os
// carries the name of a file, and no name is carried by two rows — else the pass is rolled
// back whole. A removal and a changed signature arrive as a schema file, which is ledgered.

const DROPS_TWICE = "drop function os.twice(integer);\n";

// A procedure and an aggregate are rows of pg_proc like a function (SPEC §3, measured).
const MAKES_A_PROCEDURE_AND_AN_AGGREGATE = [
  "create procedure os.tidy() language sql as $p$ select 1 $p$;",
  "create aggregate os.total(integer) (sfunc = int4pl, stype = integer);",
  "",
].join("\n");

export function functionsManifest(): void {
  describe("the functions pass — a second signature", { timeout: CASE_MS }, () => {
    it("a file's argument types changed and nothing dropped: manifest, one second-signature — rolled back whole", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await greetAndTwiceStand(db);
        writeFileSync(inFunctions(root, "twice.sql"), TWICE_OF_A_BIGINT);
        // Changed for the same run, and applied before twice.sql: what a pass that is rolled back whole must not leave.
        writeFileSync(inFunctions(root, "greet.sql"), greets("good day"));

        expect(await applyChain({ target: db.target, root })).toEqual({ state: "manifest", offences: [{ kind: "second-signature", detail: "twice" }], applied: [] });
        expect(await routinesInOs(db.client)).toEqual(["greet()", "twice(n integer)"]);
        expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
        expect(await valueOf(db.client, "select os.twice(21)")).toBe(42);
      });
    });
  });

  describe("the functions pass — a changed signature as a ledgered change", { timeout: CASE_MS }, () => {
    it("a new schema file drops the old function and the file carries the new arguments: applied — the new one answers, the old is gone", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await greetAndTwiceStand(db);
        writeFileSync(inSchema(root, "0002-twice-takes-a-bigint.sql"), DROPS_TWICE);
        writeFileSync(inFunctions(root, "twice.sql"), TWICE_OF_A_BIGINT);

        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0002-twice-takes-a-bigint.sql"], standing: 2, functions: 2 });
        expect(await routinesInOs(db.client)).toEqual(["greet()", "twice(n bigint)"]);
        expect(await valueOf(db.client, "select pg_typeof(os.twice(21))::text || ' ' || os.twice(21)::text")).toBe("bigint 42");
        expect(await filesLedgered(db.client)).toEqual(["(ledger)", "0001-os.sql", "0002-twice-takes-a-bigint.sql"]);
      });
    });
  });

  describe("the functions pass — an orphan", { timeout: CASE_MS }, () => {
    it("a function file deleted: manifest, the orphan said with its arguments — rolled back whole", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await greetAndTwiceStand(db);
        rmSync(inFunctions(root, "twice.sql"));
        writeFileSync(inFunctions(root, "greet.sql"), greets("good day"));

        expect(await applyChain({ target: db.target, root })).toEqual({ state: "manifest", offences: [{ kind: "orphan", detail: "twice(n integer)" }], applied: [] });
        expect(await routinesInOs(db.client)).toEqual(["greet()", "twice(n integer)"]);
        expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
        expect(await valueOf(db.client, "select os.twice(21)")).toBe(42);
      });
    });

    it("the same removal brought by a schema file that drops the function: applied, and the function is gone", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await greetAndTwiceStand(db);
        rmSync(inFunctions(root, "twice.sql"));
        writeFileSync(inFunctions(root, "greet.sql"), greets("good day"));
        expect(await applyChain({ target: db.target, root })).toMatchObject({ state: "manifest" });

        writeFileSync(inSchema(root, "0002-twice-is-gone.sql"), DROPS_TWICE);
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0002-twice-is-gone.sql"], standing: 2, functions: 1 });
        expect(await routinesInOs(db.client)).toEqual(["greet()"]);
        expect(await valueOf(db.client, "select os.greet()")).toBe("good day");
      });
    });

    it("a function a schema file made and no file holds: an orphan — the schema file stays ledgered and is named, the pass leaves nothing", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + MAKES_A_STRAY }, functions: { "greet.sql": greets("hello") } });
        expect(await applyChain({ target: db.target, root })).toEqual({ state: "manifest", offences: [{ kind: "orphan", detail: "stray()" }], applied: ["0001-os.sql"] });
        expect(await filesLedgered(db.client)).toEqual(["(ledger)", "0001-os.sql"]);
        // greet.sql was applied before the manifest was read, and went with the pass.
        expect(await routinesInOs(db.client)).toEqual(["stray()"]);
      });
    });

    it("a procedure and an aggregate in os with no file are orphans too, each said with its arguments", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + MAKES_A_PROCEDURE_AND_AN_AGGREGATE }, functions: { "greet.sql": greets("hello") } });
        expect(await applyChain({ target: db.target, root })).toEqual({
          state: "manifest",
          offences: [
            { kind: "orphan", detail: "tidy()" },
            { kind: "orphan", detail: "total(integer)" },
          ],
          applied: ["0001-os.sql"],
        });
        expect(await routinesInOs(db.client)).toEqual(["tidy()", "total(integer)"]);
      });
    });

    it("an orphan and a second signature at once: both said, the orphan first", async () => {
      await inAThrowawayDatabase(async (db) => {
        // The schema file makes a function no file holds, and a function of a file's name with other arguments.
        const makesTwo = `${MAKES_A_STRAY}create function os.greet(times integer) returns text language sql as $f$ select repeat('hello ', times) $f$;\n`;
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + makesTwo }, functions: { "greet.sql": greets("hello") } });
        expect(await applyChain({ target: db.target, root })).toEqual({
          state: "manifest",
          offences: [
            { kind: "orphan", detail: "stray()" },
            { kind: "second-signature", detail: "greet" },
          ],
          applied: ["0001-os.sql"],
        });
        expect(await routinesInOs(db.client)).toEqual(["greet(times integer)", "stray()"]);
      });
    });
  });
}
