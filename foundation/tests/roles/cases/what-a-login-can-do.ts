import { randomBytes } from "node:crypto";
import type { Client } from "pg";
import { expect } from "vitest";
import { loginConnectionString } from "@dxb-foundation/bench";
import { valueOf } from "../../chain/fixtures/looking.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { THE_FOUR, countsOn, everySchema } from "../fixtures/catalogue.ts";
import { asLogin, sqlstateOf } from "../fixtures/tcp-logins.ts";
import { LOOK_MS, type Step, type TheRun } from "../fixtures/the-run.ts";

// Piece 5's SPEC §8 B.9 and B.10, each tried as the real login over TCP: what none of them may create, and what the
// platform leaves open to every one of them — pinned, so that a change is seen (§9).

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
    ["a reading of the ledger", "select count(*) from os_chain.ledger"],
  ];
}

/** `create database` may not run inside a transaction: tried as it is, and a database it made is dropped by its name. */
async function aDatabaseTried(login: Client, name: string): Promise<string> {
  const refused = await sqlstateOf(login, `create database ${name}`);
  if (refused === "allowed") await onTheInstance((installer) => installer.query(`drop database "${name}" with (force)`));
  return refused;
}

/** What one login met when it tried to make hstore and then drop it, said beside what the installer saw meanwhile. */
async function hstoreMadeAndDropped(login: Client, installer: Client): Promise<string> {
  const hstore = "select coalesce(string_agg(extowner::regrole::text, ','), 'none') from pg_catalog.pg_extension where extname = 'hstore'";
  const before = await valueOf(installer, hstore);
  const made = await sqlstateOf(login, "create extension hstore");
  try {
    const standing = await valueOf(installer, hstore);
    const dropped = await sqlstateOf(login, "drop extension hstore");
    return `before=${before} create=${made} standing=${standing} drop=${dropped} after=${await valueOf(installer, hstore)}`;
  } finally {
    if (made === "allowed") await login.query("drop extension if exists hstore");
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

  step("B.10 what the platform leaves open to every login: a temporary table, a large object made and unlinked, hstore made and dropped again by the login", LOOK_MS * 2, async () => {
    const met: string[] = [];
    for (const role of THE_FOUR) {
      await asLogin(loginConnectionString(role), (login) =>
        onTheInstance(async (installer) => {
          met.push(`${role} temporary: ${await aTemporaryTable(login)}`);
          met.push(`${role} large object: ${await aLargeObject(login)}`);
          met.push(`${role} hstore: ${await hstoreMadeAndDropped(login, installer)}`);
        }),
      );
    }
    expect(met).toEqual(
      THE_FOUR.flatMap((role) => [
        `${role} temporary: create=allowed seen=1 drop=allowed`,
        `${role} large object: seen=1 unlinked=1 after=0`,
        `${role} hstore: before=none create=allowed standing=supabase_admin drop=allowed after=none`,
      ]),
    );
  });
}
