// The ledger (SPEC §5): schema `os_chain`, table `os_chain.ledger` — how the runner makes it, knows it and writes to it.
// Every catalog name is spelled with its schema: a search path set on the session does not choose what answers.
import { createHash } from "node:crypto";
import type { Client } from "pg";
import type { LedgerRow } from "./compare.ts";
import { ChainRefused } from "./outcome.ts";
import { inOneTransaction } from "./session.ts";

export const RUNNER_VERSION: string = "1";

/**
 * The ledger's bootstrap, whole. Its last statement leaves the schema and the table to their owner alone,
 * whatever default privileges the database carries (SPEC §3 measured that a planted default reaches both):
 * every grantee the catalog shows beside the owner is revoked, PUBLIC included, and one still there afterwards
 * fails the bootstrap. A role's name reaches the revoke through quote_ident, on the server.
 */
const BOOTSTRAP = `
create schema os_chain;

create table os_chain.ledger (
  position integer primary key check (position >= 0),
  file pg_catalog.text not null unique,
  kind pg_catalog.text not null check (kind in ('ledger', 'schema')),
  hash pg_catalog.text not null check (hash ~ '^[0-9a-f]{64}$'),
  applied_at pg_catalog.timestamptz not null,
  applied_by pg_catalog.text not null,
  runner_version pg_catalog.text not null
);

do $to_the_owner_alone$
declare
  beside_the_owner cursor for
    select distinct made.object,
           case when a.grantee = 0 then 'public' else pg_catalog.quote_ident(pg_catalog.pg_get_userbyid(a.grantee)) end as grantee
      from (select 'schema os_chain' as object, n.nspowner as owner, n.nspacl as acl
              from pg_catalog.pg_namespace n where n.nspname = 'os_chain'
             union all
            select 'table os_chain.ledger', c.relowner, c.relacl
              from pg_catalog.pg_class c where c.oid = 'os_chain.ledger'::pg_catalog.regclass) made,
           pg_catalog.aclexplode(made.acl) a
     where a.grantee <> made.owner;
begin
  for granted in beside_the_owner loop
    execute pg_catalog.format('revoke all on %s from %s', granted.object, granted.grantee);
  end loop;
  for granted in beside_the_owner loop
    raise exception 'os_chain: % still holds a privilege on %', granted.grantee, granted.object;
  end loop;
end
$to_the_owner_alone$;
`;

/** Row 0's hash: the bootstrap's own text. A ledger made by another text is one this runner does not know. */
const BOOTSTRAP_HASH = createHash("sha256").update(BOOTSTRAP, "utf8").digest("hex");
const ROW_0 = { position: 0, file: "(ledger)", kind: "ledger", hash: BOOTSTRAP_HASH } as const;

// The table as the bootstrap above makes it, said the way SHAPE asks the catalog for it. The two must agree —
// a ledger this runner made would be unknown to its next run otherwise.
const COLUMNS = [
  "position integer not null",
  "file text not null",
  "kind text not null",
  "hash text not null",
  "applied_at timestamp with time zone not null",
  "applied_by text not null",
  "runner_version text not null",
].join(", ");

// No row when no schema `os_chain` stands; one row when it does — its columns null when it holds no table `ledger`.
const SHAPE = `
select pg_catalog.string_agg(
         a.attname || ' ' || pg_catalog.format_type(a.atttypid, a.atttypmod) || case when a.attnotnull then ' not null' else '' end,
         ', ' order by a.attnum) as columns
  from pg_catalog.pg_namespace n
  left join pg_catalog.pg_class c on c.relnamespace = n.oid and c.relname = 'ledger' and c.relkind = 'r'
  left join pg_catalog.pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
 where n.nspname = 'os_chain'
 group by n.oid`;

const ROWS = "select position, file, kind, hash from os_chain.ledger order by position";

// The position is the greatest plus one — 0 for the first row of all, the bootstrap's own.
const WRITE_A_ROW = `
insert into os_chain.ledger (position, file, kind, hash, applied_at, applied_by, runner_version)
select coalesce(pg_catalog.max(l.position), -1) + 1, $1::pg_catalog.text, $2::pg_catalog.text, $3::pg_catalog.text,
       pg_catalog.clock_timestamp(), session_user, $4::pg_catalog.text
  from os_chain.ledger l`;

type Written = { file: string; kind: "ledger" | "schema"; hash: string };

/**
 * The ledger's rows of kind `schema`, by position — or undefined when no ledger stands. Only reads. A schema
 * `os_chain` whose table is absent or of another shape, whose row 0 is absent or carries another hash, or that
 * holds a second row of kind `ledger`, is a ledger this runner does not know (SPEC §5): ChainRefused("ledger-unknown").
 */
export async function readLedger(conn: Client): Promise<LedgerRow[] | undefined> {
  const { rows: schemas } = await conn.query(SHAPE);
  const [schema] = schemas;
  if (schema === undefined) return undefined;
  if (schema.columns !== COLUMNS) throw new ChainRefused("ledger-unknown");

  const { rows } = await conn.query(ROWS);
  const [bootstrap] = rows;
  const known = bootstrap !== undefined && Object.entries(ROW_0).every(([column, value]) => bootstrap[column] === value);
  // After row 0 the runner writes rows of kind `schema` and no other: a row of another kind was not written by it.
  const files = rows.slice(1);
  if (!known || files.some((row) => row.kind !== "schema")) throw new ChainRefused("ledger-unknown");
  return files.map(({ position, file, hash }) => ({ position, file, hash }));
}

/** One row more, in the transaction `conn` is in: when, who and the runner's version are said by the server and the package. */
export async function writeRow(conn: Client, row: Written): Promise<void> {
  await conn.query(WRITE_A_ROW, [row.file, row.kind, row.hash, RUNNER_VERSION]);
}

/** SPEC §5's bootstrap in one transaction: the schema, the table, nobody's privilege but the owner's, and row 0. */
export async function makeTheLedger(conn: Client): Promise<void> {
  await inOneTransaction(conn, async () => {
    await conn.query(BOOTSTRAP);
    await writeRow(conn, ROW_0);
  });
}
