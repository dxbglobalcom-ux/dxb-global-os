import { randomBytes } from "node:crypto";
import type { Client } from "pg";
import { expect } from "vitest";
import { loginConnectionString } from "@dxb-foundation/bench";
import { chainCommand } from "../../chain/fixtures/command.ts";
import { columnOf, valueOf } from "../../chain/fixtures/looking.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { THE_FOUR, countsOn, everySchema } from "../fixtures/catalogue.ts";
import { asLogin, sqlstateOf } from "../fixtures/tcp-logins.ts";
import { COMMAND_MS, LOOK_MS, type Step, type TheRun } from "../fixtures/the-run.ts";

// Piece 5's SPEC §8 B.9 and B.10, each tried as the real login over TCP: what none of them may create, and what the
// platform leaves open to every one of them — pinned, so that a change is seen (§9, §11 item 9).

/** A name no object of the cluster carries: what each case tries to make, and removes by, should a try succeed. */
const aName = (what: string): string => `roles_${what}_${randomBytes(6).toString("hex")}`;

/** A statement tried inside a transaction that is rolled back, so that one which is not refused leaves nothing. */
async function triedAndRolledBack(client: Client, sql: string): Promise<string> {
  await client.query("begin");
  try {
    return await sqlstateOf(client, sql);
  } finally {
    await client.query("rollback");
  }
}

/** Everything B.9 tries, as `[what, statement]` — a table in every schema the login's catalogue holds among them. */
async function triesOf(login: Client, name: string, installer: string): Promise<[string, string][]> {
  const schemas = await everySchema(login);
  // Nothing enumerated proves nothing: the database holds the platform's schemas, `os` and the ledger's among them.
  expect(schemas).toEqual(expect.arrayContaining(["os", "os_chain", "public", "pg_catalog"]));
  return [
    ["a schema", `create schema ${name}`],
    ["a table in os", `create table os.${name} (n integer)`],
    ["a function in os", `create function os.${name}() returns integer language sql as $f$ select 1 $f$`],
    ...schemas.map((schema): [string, string] => [`a table in ${schema}`, `create table "${schema}".${name} (n integer)`]),
    ["a role", `create role ${name}`],
    ["a publication", `create publication ${name}`],
    ["set role os_owner", "set role os_owner"],
    ["set role to the installer", `set role "${installer}"`],
    ["set session authorization os_owner", "set session authorization os_owner"],
    ["a reading of the ledger", "select count(*) from os_chain.ledger"],
  ];
}

/** `create database` may not run inside a transaction: tried as it is, and a database it made is dropped by its name. */
async function aDatabaseTried(login: Client, name: string): Promise<string> {
  const refused = await sqlstateOf(login, `create database ${name}`);
  if (refused === "allowed") await onTheInstance((installer) => installer.query(`drop database "${name}" with (force)`));
  return refused;
}

// hstore — an extension of the platform's privileged list that does not stand in the database — as the installer
// sees it: its schema and its owner.
const HSTORE = "select coalesce(string_agg(e.extnamespace::regnamespace::text || ' ' || e.extowner::regrole::text, ','), 'none') from pg_catalog.pg_extension e where e.extname = 'hstore'";

/** Every routine of `os` as `<oid> <owner>`: what stood before hstore came is told apart from what it brought. */
const routinesOfOsWithOwners = (installer: Client): Promise<string[]> =>
  columnOf(installer, "select p.oid::text || ' ' || p.proowner::regrole::text from pg_catalog.pg_proc p where p.pronamespace = 'os'::regnamespace order by 1");

/**
 * What hstore brought into `os`: `routines of supabase_admin's and no other` when it brought one or more and each is
 * supabase_admin's — the routines a later piece puts into `os` are not counted (SPEC §11 item 9, the case's reading).
 */
function brought(before: readonly string[], now: readonly string[]): string {
  const owners = now.filter((routine) => !before.includes(routine)).map((routine) => routine.split(" ")[1]);
  const others = owners.filter((owner) => owner !== "supabase_admin");
  return owners.length > 0 && others.length === 0 ? "routines of supabase_admin's and no other" : `${owners.length} routines, ${others.length} not supabase_admin's`;
}

/**
 * The chain's answer while hstore stands in `os`: red by its manifest — a row of `os` no file holds — with nothing
 * applied (SPEC §11 item 9, measured C3).
 */
async function theChainSeesIt(): Promise<string> {
  const said = await chainCommand(["up"], COMMAND_MS);
  const red = /^CHAIN_RED manifest offences=\d+ applied=0$/.test(said.lines.at(-1) ?? "");
  return `exit=${said.code} manifest-red=${red}`;
}

/**
 * What one login met when it put hstore into `os` — which it holds neither USAGE nor CREATE on — and dropped it
 * again, said beside what the installer saw meanwhile; for `os_engine`, what the chain answered while it stood. A drop
 * is tried only of what this login's own `create` made.
 */
async function hstoreIntoOs(role: string, login: Client, installer: Client): Promise<string> {
  const before = await valueOf(installer, HSTORE);
  const routinesBefore = await routinesOfOsWithOwners(installer);
  const made = await sqlstateOf(login, "create extension hstore schema os");
  if (made !== "allowed") return `before=${before} create=${made}`;
  let dropped = "not tried";
  try {
    const standing = `standing=${await valueOf(installer, HSTORE)} brought ${brought(routinesBefore, await routinesOfOsWithOwners(installer))}`;
    const chain = role === "os_engine" ? ` chain: ${await theChainSeesIt()}` : "";
    dropped = await sqlstateOf(login, "drop extension hstore");
    const after = `after=${await valueOf(installer, HSTORE)} os as before=${(await routinesOfOsWithOwners(installer)).join() === routinesBefore.join()}`;
    return `before=${before} create=${made} ${standing}${chain} drop=${dropped} ${after}`;
  } finally {
    if (dropped !== "allowed") await login.query("drop extension if exists hstore");
  }
}

/** A temporary table, made by the login and seen in its own temporary schema, then dropped. */
async function aTemporaryTable(login: Client): Promise<string> {
  const name = aName("temporary");
  const made = await sqlstateOf(login, `create temporary table ${name} (n integer)`);
  if (made !== "allowed") return `create=${made}`;
  const seen = await valueOf(login, "select count(*)::int from pg_catalog.pg_class where relname = $1 and relnamespace = pg_catalog.pg_my_temp_schema()", [name]);
  return `create=${made} seen=${seen} drop=${await sqlstateOf(login, `drop table ${name}`)}`;
}

/** A large object, made and unlinked by the login. */
async function aLargeObject(login: Client): Promise<string> {
  const oid = String(await valueOf(login, "select pg_catalog.lo_create(0)::text"));
  const standing = "select count(*)::int from pg_catalog.pg_largeobject_metadata where oid = $1::oid";
  const seen = await valueOf(login, standing, [oid]);
  const unlinked = await valueOf(login, "select pg_catalog.lo_unlink($1::oid)", [oid]);
  return `seen=${seen} unlinked=${unlinked} after=${await valueOf(login, standing, [oid])}`;
}

export function whatALoginCanDo(step: Step, run: TheRun): void {
  step("B.9 none can create: each login, as itself, is refused with 42501 a schema, a table and a function in os, a table in every schema, a role, a database, a publication, set role to os_owner and to the installer, a reading of the ledger", LOOK_MS * 2, async () => {
    const before = await onTheInstance(countsOn);
    for (const role of THE_FOUR) {
      const said = await asLogin(loginConnectionString(role), async (login) => {
        // The login came in: what follows is refused to a session that stands, not to one that never began.
        expect(await valueOf(login, "select session_user::text")).toBe(role);
        const name = aName("probe");
        const tried: string[] = [];
        for (const [what, sql] of await triesOf(login, name, run.installer)) tried.push(`${what} ${await triedAndRolledBack(login, sql)}`);
        tried.push(`a database ${await aDatabaseTried(login, name)}`);
        return tried;
      });
      // Every try is said `<what> <SQLSTATE>`, and "allowed" for one that was not refused: none but 42501 may stand.
      expect(said.length).toBeGreaterThan(10);
      expect(said.filter((line) => !line.endsWith(" 42501")).map((line) => `${role} ${line}`)).toEqual([]);
    }
    expect(before.ownedByTheFour).toBe(0);
    expect(await onTheInstance(countsOn)).toEqual(before);
  });

  step("B.10 what the platform leaves open to every login: a temporary table, a large object made and unlinked, hstore put into os and dropped again by the login — while it stands, the chain is red by its manifest; afterwards green", LOOK_MS * 2 + COMMAND_MS * 2, async () => {
    const met: string[] = [];
    for (const role of THE_FOUR) {
      await asLogin(loginConnectionString(role), (login) =>
        onTheInstance(async (installer) => {
          met.push(`${role} temporary: ${await aTemporaryTable(login)}`);
          met.push(`${role} large object: ${await aLargeObject(login)}`);
          met.push(`${role} hstore: ${await hstoreIntoOs(role, login, installer)}`);
        }),
      );
    }
    const asPinned = (role: string): string =>
      `before=none create=allowed standing=os supabase_admin brought routines of supabase_admin's and no other${role === "os_engine" ? " chain: exit=1 manifest-red=true" : ""} drop=allowed after=none os as before=true`;
    expect(met).toEqual(
      THE_FOUR.flatMap((role) => [
        `${role} temporary: create=allowed seen=1 drop=allowed`,
        `${role} large object: seen=1 unlinked=1 after=0`,
        `${role} hstore: ${asPinned(role)}`,
      ]),
    );
    const said = await chainCommand(["up"], COMMAND_MS);
    expect(said.lines.at(-1), `${said.lines.join("\n")}\n${said.stderr.slice(-1_500)}`).toMatch(new RegExp(`^CHAIN_GREEN applied=0 standing=${run.standing} functions=\\d+ reference=\\d+$`));
    expect(said.code).toBe(0);
  });
}
