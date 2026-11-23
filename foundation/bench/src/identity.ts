export type Identity = { sysid: string; dboid: string; dbname: string };

/** Anything that can run one SQL text — a `pg` Client satisfies it. */
export type Queryable = { query(text: string): Promise<{ rows: Record<string, unknown>[] }> };

// The two questions only the server can answer: which cluster, and which database of it.
// Each catalog name is spelled with its schema (SPEC §5b.6): a search path set on the session does not choose what answers.
const CLUSTER = "select system_identifier::text from pg_catalog.pg_control_system()";
const DATABASE = "select oid::text, datname from pg_catalog.pg_database where datname = pg_catalog.current_database()";

/** The one row of an identity query's answer; anything else is no answer. */
async function oneRow(conn: Queryable, text: string): Promise<Record<string, unknown>> {
  const { rows } = await conn.query(text);
  const [row] = rows;
  if (rows.length !== 1 || row === undefined) throw new Error(`the identity query answered ${rows.length} rows, not one`);
  return row;
}

function textOf(row: Record<string, unknown>, column: string): string {
  const value = row[column];
  if (typeof value !== "string" || value === "") throw new Error(`the identity query answered no ${column}`);
  return value;
}

/** Asks `conn` itself who it is. Only reads; throws when the server does not answer all three fields. */
export async function readIdentity(conn: Queryable): Promise<Identity> {
  const cluster = await oneRow(conn, CLUSTER);
  const database = await oneRow(conn, DATABASE);
  return {
    sysid: textOf(cluster, "system_identifier"),
    dboid: textOf(database, "oid"),
    dbname: textOf(database, "datname"),
  };
}

/** The same database of the same cluster: all three fields equal. */
export function sameIdentity(one: Identity, other: Identity): boolean {
  return one.sysid === other.sysid && one.dboid === other.dboid && one.dbname === other.dbname;
}
