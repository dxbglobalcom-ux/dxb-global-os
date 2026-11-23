// The ledger (SPEC §5): schema `os_chain`, table `os_chain.ledger` — how the runner makes it, knows it and writes to it.
// Every catalog name is spelled with its schema: a search path set on the session does not choose what answers.
import { createHash } from "node:crypto";
import { DatabaseError } from "pg";
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

// What the bootstrap above holds the table's rows to — the three checks, the primary key, the unique file — each
// said by its kind and the catalog's own definition of it, as CONSTRAINTS_HELD asks for them (measured on
// PostgreSQL 17.6). The two must agree, like the columns. The position a run writes at rests on the primary key
// (SPEC §12.1, §12.2): a table that lacks one of these, or holds another beside them, is not the bootstrap's.
const CONSTRAINTS = [
  `c CHECK (("position" >= 0))`,
  `c CHECK ((hash ~ '^[0-9a-f]{64}$'::text))`,
  `c CHECK ((kind = ANY (ARRAY['ledger'::text, 'schema'::text])))`,
  `p PRIMARY KEY ("position")`,
  `u UNIQUE (file)`,
].join(", ");

// One row, its column null when the table holds no constraint at all. Ordered by code unit: the order hangs on no locale.
const CONSTRAINTS_HELD = `
select pg_catalog.string_agg(k.contype::pg_catalog.text || ' ' || pg_catalog.pg_get_constraintdef(k.oid), ', '
         order by k.contype, pg_catalog.pg_get_constraintdef(k.oid) collate pg_catalog."C") as constraints
  from pg_catalog.pg_constraint k
 where k.conrelid = 'os_chain.ledger'::pg_catalog.regclass`;

const ROWS = "select position, file, kind, hash from os_chain.ledger order by position";

// The position is said by the run, not found here: a row already there is refused by the primary key (SPEC §12.1).
const WRITE_A_ROW = `
insert into os_chain.ledger (position, file, kind, hash, applied_at, applied_by, runner_version)
values ($1::pg_catalog.int4, $2::pg_catalog.text, $3::pg_catalog.text, $4::pg_catalog.text,
        pg_catalog.clock_timestamp(), session_user, $5::pg_catalog.text)`;

// The server's code for a row refused by the primary key or by a unique constraint.
const UNIQUE_VIOLATION = "23505";

type Written = { position: number; file: string; kind: "ledger" | "schema"; hash: string };

/**
 * The ledger's rows of kind `schema`, by position — or undefined when no ledger stands. Only reads. A schema
 * `os_chain` whose table is absent, of another shape or held by other constraints, whose row 0 is absent or carries
 * another hash, or that holds a second row of kind `ledger`, is a ledger this runner does not know (SPEC §5, §12.2):
 * ChainRefused("ledger-unknown").
 */
export async function readLedger(conn: Client): Promise<LedgerRow[] | undefined> {
  const { rows: schemas } = await conn.query(SHAPE);
  const [schema] = schemas;
  if (schema === undefined) return undefined;
  if (schema.columns !== COLUMNS) throw new ChainRefused("ledger-unknown");
  const { rows: held } = await conn.query(CONSTRAINTS_HELD);
  if (held[0]?.constraints !== CONSTRAINTS) throw new ChainRefused("ledger-unknown");

  const { rows } = await conn.query(ROWS);
  const [bootstrap] = rows;
  const known = bootstrap !== undefined && Object.entries(ROW_0).every(([column, value]) => bootstrap[column] === value);
  // After row 0 the runner writes rows of kind `schema` and no other: a row of another kind was not written by it.
  const files = rows.slice(1);
  if (!known || files.some((row) => row.kind !== "schema")) throw new ChainRefused("ledger-unknown");
  return files.map(({ position, file, hash }) => ({ position, file, hash }));
}

/**
 * One row more, at the position the run says, in the transaction `conn` is in: when, who and the runner's version
 * are said by the server and the package. The table takes one row of a position and one of a file, and the run read
 * every row under its lock — so a row refused for standing there already is a row another hand wrote since:
 * ChainRefused("ledger-moved"). An insert that is taken and leaves no row is of a ledger this runner does not
 * know: ChainRefused("ledger-unknown"). Any other refusal of the server's is thrown on as it is.
 */
export async function writeRow(conn: Client, row: Written): Promise<void> {
  const written = await conn.query(WRITE_A_ROW, [row.position, row.file, row.kind, row.hash, RUNNER_VERSION]).catch((failure: unknown) => {
    if (failure instanceof DatabaseError && failure.code === UNIQUE_VIOLATION) throw new ChainRefused("ledger-moved", { cause: failure });
    throw failure;
  });
  if (written.rowCount !== 1) throw new ChainRefused("ledger-unknown");
}

/** SPEC §5's bootstrap in one transaction: the schema, the table, nobody's privilege but the owner's, and row 0. */
export async function makeTheLedger(conn: Client): Promise<void> {
  await inOneTransaction(conn, async () => {
    await conn.query(BOOTSTRAP);
    await writeRow(conn, ROW_0);
  });
}
