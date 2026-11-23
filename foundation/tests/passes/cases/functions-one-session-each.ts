import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { columnOf, valueOf } from "../../chain/fixtures/looking.ts";
import { CASE_MS, inAThrowawayDatabase } from "../../chain/fixtures/throwaway-database.ts";
import { routinesInOs } from "../fixtures/looking-at-os.ts";
import { MAKES_OS, greets } from "../fixtures/pass-files.ts";
import { passesRoot } from "../fixtures/passes-on-disk.ts";

// SPEC §12.3: every function file meets the same session. What a file left in the pass's
// session — a role, a search path, an encoding, also one set for the transaction alone —
// reaches neither the file after it nor the runner's own reading. Each case reads what
// stands from the test's own session, which no file touched.

// public.factor() answers 2 and os.factor() answers 3. A body written `return …` is read by the server when the
// function is made (measured): which factor() it keeps is decided by the search path of the session that makes it —
// public's on a fresh session's path, os's on the path a file left.
const PUBLIC_FACTOR = "create function public.factor() returns integer language sql as $f$ select 2 $f$;\n";
const OS_FACTOR = "create or replace function os.factor() returns integer language sql as $f$ select 3 $f$;\n";
const TWICE_BY_FACTOR = "create or replace function os.twice(n integer) returns integer language sql return n * factor();\n";

// A body that is not ASCII: its bytes are UTF-8, whatever encoding a file before it told the session to expect.
const SALUTE = "create or replace function os.salute() returns text language sql as $f$ select 'déjà vu'::text $f$;\n";

// Each is what greet.sql says after its function. By name factor.sql lies before it; salute.sql and twice.sql after.
const LEFT_BY_GREET: [string, string][] = [
  ["another role", "set role pg_monitor;\n"],
  ["another search path", "set search_path = os;\n"],
  ["a search path set for its transaction", "set local search_path = os;\n"],
  ["another client encoding, set for its transaction", "set local client_encoding = 'LATIN1';\n"],
];

const WHO_OWNS_EACH = `select p.proname || ' is ' || pg_catalog.pg_get_userbyid(p.proowner) || '''s' from pg_catalog.pg_proc p
                        where p.pronamespace = 'os'::regnamespace order by p.proname collate "C"`;

// A function no file holds, with an argument of a type of os: the server writes that type bare on a path that holds os, and with its schema on a fresh one (measured).
const A_STRAY_OVER_A_TYPE_OF_OS = [
  "create type os.mood as enum ('calm');",
  "create function os.stray(m os.mood) returns text language sql as $f$ select 'made by a schema file'::text $f$;",
  "",
].join("\n");

export function functionsOneSessionEach(): void {
  describe("the functions pass — every file meets the same session", { timeout: CASE_MS }, () => {
    it.each(LEFT_BY_GREET)("a file that leaves %s: the files after it are made by the installing role, their names read on a fresh path, their bytes as UTF-8", async (_what, left) => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({
          schema: { "0001-os.sql": MAKES_OS + PUBLIC_FACTOR },
          functions: { "factor.sql": OS_FACTOR, "greet.sql": greets("hello") + left, "salute.sql": SALUTE, "twice.sql": TWICE_BY_FACTOR },
        });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, functions: 4 });
        expect(await columnOf(db.client, WHO_OWNS_EACH)).toEqual(["factor is postgres's", "greet is postgres's", "salute is postgres's", "twice is postgres's"]);
        expect(await valueOf(db.client, "select os.twice(21)")).toBe(42);
        expect(await valueOf(db.client, "select os.salute()")).toBe("déjà vu");
        expect(await valueOf(db.client, "select os.greet()")).toBe("hello");
      });
    });

    it("an orphan's arguments are said as a fresh session reads them, though a file set the search path to os: a type of os with its schema", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + A_STRAY_OVER_A_TYPE_OF_OS }, functions: { "greet.sql": `${greets("hello")}set search_path = os;\n` } });
        expect(await applyChain({ target: db.target, root })).toEqual({ state: "manifest", offences: [{ kind: "orphan", detail: "stray(m os.mood)" }], applied: ["0001-os.sql"] });
        expect(await routinesInOs(db.client)).toEqual(["stray(m os.mood)"]);
      });
    });
  });
}
