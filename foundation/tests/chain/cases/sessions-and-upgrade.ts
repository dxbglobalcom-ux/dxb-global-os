import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { BORN_AND_PETS, PEOPLE, PLACES, chainOf } from "../fixtures/chain-files.ts";
import { chainRoot, inSchema } from "../fixtures/chain-on-disk.ts";
import { ledgerOf, ledgerToTheInstant, standingOf, valueOf } from "../fixtures/looking.ts";
import { CASE_MS, LOGIN, inAThrowawayDatabase } from "../fixtures/throwaway-database.ts";

// SPEC §6 step 6 and §9.4: every file runs in a session of its own, so a chain
// builds the same database whether it is applied whole or one file later; and a
// database that already holds rows is upgraded with its rows and its ledger kept.

// Each of the three outlives its transaction in the session that said it (SPEC §3, measured).
const CHANGES_ITS_SESSION = ["set search_path = pg_catalog;", "create temp table left_behind (id integer);", "set role pg_monitor;", ""].join("\n");

const RECORDS_WHAT_IT_MEETS = [
  "create table public.met as",
  "  select current_setting('search_path') as search_path,",
  "         current_user::text as role,",
  "         to_regclass('pg_temp.left_behind') is null as no_temporary_table;",
  "",
].join("\n");

export function sessionsAndUpgrade(): void {
  describe("a session of its own", { timeout: CASE_MS }, () => {
    it("a file that sets a search path, a role and a temporary table; the next file meets the defaults, and no temporary table", async () => {
      await inAThrowawayDatabase(async (db) => {
        // What a session nobody changed meets here: asked by the test's own, which sets nothing.
        const untouched = await valueOf(db.client, "select current_setting('search_path')");
        expect(untouched).not.toBe("pg_catalog");

        const root = chainRoot({ "0001-changes-its-session.sql": CHANGES_ITS_SESSION, "0002-records-what-it-meets.sql": RECORDS_WHAT_IT_MEETS });
        expect(await applyChain({ target: db.target, root })).toEqual({
          state: "applied",
          applied: ["0001-changes-its-session.sql", "0002-records-what-it-meets.sql"],
          standing: 2,
        });
        const { rows } = await db.client.query("select search_path, role, no_temporary_table from public.met");
        expect(rows).toEqual([{ search_path: untouched, role: LOGIN, no_temporary_table: true }]);
      });
    });
  });

  describe("a populated database upgraded", { timeout: CASE_MS }, () => {
    it("a third file alters a table that holds rows and adds another: the rows are there, and the first two ledger rows are unchanged to the instant", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = chainRoot(chainOf(PEOPLE, PLACES));
        expect(await applyChain({ target: db.target, root })).toEqual({ state: "applied", applied: ["0001-people.sql", "0002-places.sql"], standing: 2 });
        await db.client.query("insert into public.people (id, name) values (1, 'Ada'), (2, 'Grace')");
        await db.client.query("insert into public.places (id, name) values (1, 'London')");
        const before = await ledgerToTheInstant(db.client);
        expect(before).toHaveLength(3);

        writeFileSync(inSchema(root, BORN_AND_PETS.name), BORN_AND_PETS.text);
        expect(await applyChain({ target: db.target, root })).toEqual({ state: "applied", applied: ["0003-born-and-pets.sql"], standing: 3 });

        const people = await db.client.query("select id, name, born from public.people order by id");
        expect(people.rows).toEqual([
          { id: 1, name: "Ada", born: null },
          { id: 2, name: "Grace", born: null },
        ]);
        expect(await valueOf(db.client, "select name from public.places where id = 1")).toBe("London");
        expect(await standingOf(db.client, "public.pets")).toEqual(["public.pets"]);

        const after = await ledgerToTheInstant(db.client);
        expect(after).toHaveLength(4);
        expect(after.slice(0, 3)).toEqual(before);
        expect((await ledgerOf(db.client)).at(-1)).toEqual({
          position: 3,
          file: "0003-born-and-pets.sql",
          kind: "schema",
          hash: BORN_AND_PETS.sha256,
          applied_by: LOGIN,
          runner_version: "1",
        });
      });
    });
  });
}
