import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { BORN_AND_PETS, PEOPLE, PLACES, chainOf } from "../fixtures/chain-files.ts";
import { chainRoot, inSchema } from "../fixtures/chain-on-disk.ts";
import { runApart } from "../fixtures/command.ts";
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

// SPEC §12.4: the driver reads variables of its own from the environment of the process that runs it. Measured
// on the driver this piece is built on (pg 8.22.0): PGOPTIONS and PGAPPNAME reach every session it opens;
// PGSSLMODE=require, PGSSLNEGOTIATION=direct and PGREPLICATION=database each end a connection to this bench before
// a statement is sent; PGCLIENTENCODING it does not read — it tells the server UTF8 whatever is set. That one is
// planted all the same: the contract names it, and a driver that came to read it would show here.
const SHELL_OF_THE_CALLER = { PGOPTIONS: "-c search_path=pg_catalog", PGAPPNAME: "planted by the caller's shell", PGCLIENTENCODING: "LATIN1" };

const SETTINGS = ["search_path", "application_name", "client_encoding"];
const WHAT_A_SESSION_MEETS = `select ${SETTINGS.map((setting) => `current_setting('${setting}') as ${setting}`).join(", ")}`;
const RECORDING = { "0001-records-its-session.sql": `create table public.met_by_the_file as ${WHAT_A_SESSION_MEETS};\n` };
const RECORDING_APPLIED = { state: "applied", applied: ["0001-records-its-session.sql"], standing: 1 };

/**
 * The recording file applied in a database of its own, by a run in a process of its own that holds `planted`
 * in its environment: what the file's session met, and what a session nobody guards met in that same process.
 */
async function metWith(planted: Readonly<Record<string, string>>): Promise<{ theFile: unknown[]; aPlainSession: unknown }> {
  let met: { theFile: unknown[]; aPlainSession: unknown } | undefined;
  await inAThrowawayDatabase(async (db) => {
    const ran = await runApart({ target: db.target, root: chainRoot(RECORDING), asked: WHAT_A_SESSION_MEETS }, planted, CASE_MS);
    expect(ran.outcome).toEqual(RECORDING_APPLIED);
    met = { theFile: (await db.client.query("select * from public.met_by_the_file")).rows, aPlainSession: ran.aPlainSessionAnswered };
  });
  if (met === undefined) throw new Error("the run in a process of its own answered nothing");
  return met;
}

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

  // Two runs, each a process and a database of its own: twice the room of one case.
  describe("the caller's shell chooses nothing of a session", { timeout: 2 * CASE_MS }, () => {
    it("with PGOPTIONS, PGAPPNAME and PGCLIENTENCODING set, a file meets the search path, application name and client encoding of a run with none set", async () => {
      const withNone = await metWith({});
      const withThem = await metWith(SHELL_OF_THE_CALLER);
      // Seen first: the two the driver takes reach a session nobody guards, and change it — the planting works.
      expect(withThem.aPlainSession).toMatchObject({ search_path: "pg_catalog", application_name: SHELL_OF_THE_CALLER.PGAPPNAME });
      expect(withNone.aPlainSession).not.toEqual(withThem.aPlainSession);

      expect(withNone.theFile).toHaveLength(1);
      expect(withThem.theFile).toEqual(withNone.theFile);
    });

    it.each([
      ["PGSSLMODE", "require"],
      ["PGSSLNEGOTIATION", "direct"],
      ["PGREPLICATION", "database"],
    ])("with %s=%s set for the run, the run ends as it does with none set: the file is applied", async (variable, value) => {
      await inAThrowawayDatabase(async (db) => {
        // No question is asked here: a session nobody guards does not open at all under these (measured, above).
        const ran = await runApart({ target: db.target, root: chainRoot(RECORDING) }, { [variable]: value }, CASE_MS);
        expect(ran.outcome).toEqual(RECORDING_APPLIED);
        expect(await standingOf(db.client, "public.met_by_the_file")).toEqual(["public.met_by_the_file"]);
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
