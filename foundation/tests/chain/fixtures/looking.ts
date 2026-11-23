// How a case looks at a database after a run: the ledger as its facts, the ledger
// to the instant, and what stands beside it. Everything here only reads.
import type { Client } from "pg";

/** One value: the first column of the first row. */
export async function valueOf(client: Client, sql: string, values: unknown[] = []): Promise<unknown> {
  const answer = await client.query({ text: sql, values, rowMode: "array" });
  return (answer.rows[0] as unknown[] | undefined)?.[0];
}

/** The server's clock now, as the server writes it. */
export const serverClock = (client: Client): Promise<unknown> => valueOf(client, "select clock_timestamp()::text");

/** One column: the first of every row, as text, in the order the server gave. */
export async function columnOf(client: Client, sql: string, values: unknown[] = []): Promise<string[]> {
  const answer = await client.query({ text: sql, values, rowMode: "array" });
  return (answer.rows as unknown[][]).map(([first]) => String(first));
}

export type LedgerFacts = { position: number; file: string; kind: string; hash: string; applied_by: string; runner_version: string };

/** The ledger's rows by position — every column a test can spell beforehand. */
export async function ledgerOf(client: Client): Promise<LedgerFacts[]> {
  const answer = await client.query("select position, file, kind, hash, applied_by, runner_version from os_chain.ledger order by position");
  return answer.rows as LedgerFacts[];
}

/** The ledger's file names by position, row 0's `(ledger)` first. */
export const filesLedgered = async (client: Client): Promise<string[]> => (await ledgerOf(client)).map((row) => row.file);

/** True when the database holds a schema `os_chain` — whatever is in it. */
export const hasTheLedgersSchema = async (client: Client): Promise<boolean> =>
  (await valueOf(client, "select count(*)::int from pg_catalog.pg_namespace where nspname = 'os_chain'")) === 1;

/**
 * Every row of the ledger whole, as the server writes it, with the transaction
 * that wrote it: equal before and after means no row was added, removed or
 * written again — an update to the same values would show. It asks for no
 * column by name, so it reads a ledger of any shape; no ledger is said as such.
 */
export async function ledgerToTheInstant(client: Client): Promise<string[] | "no ledger"> {
  if ((await valueOf(client, "select to_regclass('os_chain.ledger') is null")) === true) return "no ledger";
  return columnOf(client, "select l::text || ' written by ' || l.xmin::text from os_chain.ledger l order by 1");
}

// What the cluster itself keeps in every database is no part of what a run made.
const MADE_BY_SOMEONE = "n.nspname !~ '^pg_' and n.nspname <> 'information_schema'";

/** The ledger to the instant, and every schema and relation that stands: what a run that must change nothing must leave equal. */
export async function standingIn(client: Client): Promise<{ ledger: string[] | "no ledger"; schemas: string[]; relations: string[] }> {
  return {
    ledger: await ledgerToTheInstant(client),
    schemas: await columnOf(client, `select n.nspname from pg_catalog.pg_namespace n where ${MADE_BY_SOMEONE} order by 1`),
    relations: await columnOf(
      client,
      `select n.nspname || '.' || c.relname || ' ' || c.relkind::text from pg_catalog.pg_class c
         join pg_catalog.pg_namespace n on n.oid = c.relnamespace where ${MADE_BY_SOMEONE} order by 1`,
    ),
  };
}

/** Which of these relations stand, in the order asked. */
export async function standingOf(client: Client, ...relations: string[]): Promise<string[]> {
  const standing: string[] = [];
  for (const relation of relations) {
    if ((await valueOf(client, "select to_regclass($1) is not null", [relation])) === true) standing.push(relation);
  }
  return standing;
}

// Sorted here, by code unit: the order a test spells must not hang on the database's collation.
const inOrder = (names: string[]): string[] => [...names].sort();

// Who an entry of an ACL is for; the server spells PUBLIC as role 0.
const GRANTEE = "case when a.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(a.grantee)::text end";

/** Every grantee on a schema. A schema nobody was ever granted answers none: its owner holds it by owning it. */
export const granteesOnSchema = (client: Client, schema: string): Promise<string[]> =>
  columnOf(client, `select distinct ${GRANTEE} from pg_catalog.pg_namespace n, aclexplode(n.nspacl) a where n.nspname = $1`, [schema]).then(inOrder);

/** Every grantee on a table, said with its schema. */
export const granteesOnTable = (client: Client, table: string): Promise<string[]> =>
  columnOf(client, `select distinct ${GRANTEE} from pg_catalog.pg_class c, aclexplode(c.relacl) a where c.oid = $1::regclass`, [table]).then(inOrder);
