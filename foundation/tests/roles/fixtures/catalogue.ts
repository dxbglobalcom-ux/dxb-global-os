// How a case reads the roles from the catalogue, as the installer (piece 5's SPEC §8 B). Everything here reads, but
// `asTheOwnerRolledBack`, whose work is rolled back whatever it did.
import type { Client } from "pg";
import { columnOf, valueOf } from "../../chain/fixtures/looking.ts";

/** The four logins of SPEC §4, spelled here — the test's own list, not read from the code. */
export const THE_FOUR = ["os_engine", "os_executor", "os_intake", "os_reader"] as const;

/** The owner and the four: every role the chain's first file makes. */
export const THE_FIVE = ["os_owner", ...THE_FOUR] as const;

/** Who the installer is: the login of the connection, as the server names it. */
export const installerOn = async (client: Client): Promise<string> => String(await valueOf(client, "select session_user::text"));

/** Each of the five's stored password, by role — null for none, and absent for a role that does not stand. */
export async function storedPasswords(client: Client): Promise<Map<string, string | null>> {
  const { rows } = await client.query<{ rolname: string; rolpassword: string | null }>(
    "select rolname::text, rolpassword from pg_catalog.pg_authid where rolname = any($1::text[]) order by rolname",
    [[...THE_FIVE]],
  );
  return new Map(rows.map((row) => [row.rolname, row.rolpassword]));
}

/** PostgreSQL's stored SCRAM-SHA-256 verifier: the salt, the StoredKey and the ServerKey, each base64. */
export const VERIFIER = /^SCRAM-SHA-256\$4096:([A-Za-z0-9+/]+={0,2})\$([A-Za-z0-9+/]+={0,2}):([A-Za-z0-9+/]+={0,2})$/;

/** Every part of the verifiers a leak could show: each whole, its first 40 characters, its salt and its two keys. */
export const partsOf = (verifiers: Iterable<string>): string[] =>
  [...verifiers].filter((verifier) => verifier !== "").flatMap((verifier) => [verifier, verifier.slice(0, 40), ...(VERIFIER.exec(verifier)?.slice(1) ?? [])]);

/** Each of the five's oid, by role: equal before and after means the same rows, not ones made again under the name. */
export async function roleOids(client: Client): Promise<Record<string, string>> {
  const { rows } = await client.query<{ rolname: string; oid: string }>(
    "select rolname::text, oid::text from pg_catalog.pg_roles where rolname = any($1::text[]) order by rolname",
    [[...THE_FIVE]],
  );
  return Object.fromEntries(rows.map((row) => [row.rolname, row.oid]));
}

/** The roles of which `role` is a member, by name. */
export const membershipsOf = (client: Client, role: string): Promise<string[]> =>
  columnOf(client, "select m.roleid::regrole::text from pg_catalog.pg_auth_members m where m.member = to_regrole($1) order by 1", [role]);

// A temporary schema, and its toast schema, are a session's own: they come and stay as sessions use them.
const NOT_TEMPORARY = "n.nspname !~ '^pg_temp_' and n.nspname !~ '^pg_toast_temp_'";

/**
 * What a login that can create nothing must leave as it found: the counts of schemas, roles and databases, and of
 * what the four logins own among relations, functions and types — nothing. Every relation of the database is not
 * counted: the bench's own services make relations while the tests run (the lead, on the test hand's finding).
 */
export async function countsOn(client: Client): Promise<Record<string, unknown>> {
  return {
    schemas: await valueOf(client, `select count(*)::int from pg_catalog.pg_namespace n where ${NOT_TEMPORARY}`),
    roles: await valueOf(client, "select count(*)::int from pg_catalog.pg_roles"),
    databases: await valueOf(client, "select count(*)::int from pg_catalog.pg_database"),
    ownedByTheFour: await valueOf(
      client,
      `select (select count(*) from pg_catalog.pg_class c where c.relowner = any($1::regrole[]))::int
            + (select count(*) from pg_catalog.pg_proc p where p.proowner = any($1::regrole[]))::int
            + (select count(*) from pg_catalog.pg_type t where t.typowner = any($1::regrole[]))::int
            + (select count(*) from pg_catalog.pg_namespace n where n.nspowner = any($1::regrole[]))::int`,
      [[...THE_FOUR]],
    ),
  };
}

/** Every schema of the database the session is in, from the catalogue, but the temporary and toast schemas. */
export const everySchema = (client: Client): Promise<string[]> =>
  columnOf(client, "select n.nspname::text from pg_catalog.pg_namespace n where n.nspname !~ '^pg_temp_' and n.nspname !~ '^pg_toast' order by 1");

/** `work` as the owner of `os`, in a transaction that is rolled back however the work ends. */
export async function asTheOwnerRolledBack<T>(client: Client, work: () => Promise<T>): Promise<T> {
  await client.query("begin");
  try {
    await client.query("set local role os_owner");
    return await work();
  } finally {
    await client.query("rollback");
  }
}
