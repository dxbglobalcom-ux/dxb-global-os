// The snapshot's lines of the database and of privileges (piece 6a's SPEC §4.3): `database`, `grant`, `default-acl`.
import type { Client } from "pg";
import { flag, linesOf, role, typeName } from "./sql.ts";
import type { Covered } from "./sql.ts";
import { aTypeOfItsOwn } from "./types.ts";

const DATABASE = `
select 'database ' || pg_catalog.quote_ident(d.datname) || ' owner ' || ${role("d.datdba")}
       || ' encoding ' || pg_catalog.pg_encoding_to_char(d.encoding) || ' collate ' || d.datcollate || ' ctype ' || d.datctype as line
  from pg_catalog.pg_database d
 where d.datname = pg_catalog.current_database()`;

// The covered sets, `$1` and `$2`, named once at the head of each statement: a holder may ask only one of them.
const THE_COVERED_SETS = "with k as (select $1::pg_catalog.oid[] as schemas, $2::pg_catalog.oid[] as roles)";

/** One kind of object that holds an ACL, as a `grant` line names it (SPEC §4.3). `o` is the object's row. */
type Holder = {
  kind: "database" | "schema" | "relation" | "function" | "type";
  /** The object's name, spelled by the server. */
  object: string;
  /** The catalogue, its rows of this kind, and whether a row is covered — `k.schemas` the covered schemas. */
  catalogue: string;
  ofTheKind: string;
  covered: string;
  /** The ACL column, and the `acldefault` letter and owner that give its items when it is NULL. */
  acl: string;
  letter: string;
  owner: string;
};

const HOLDERS: readonly Holder[] = [
  {
    kind: "database",
    object: "pg_catalog.quote_ident(o.datname)",
    catalogue: "pg_catalog.pg_database",
    ofTheKind: "true",
    covered: "o.datname = pg_catalog.current_database()",
    acl: "o.datacl",
    letter: "'d'",
    owner: "o.datdba",
  },
  {
    kind: "schema",
    object: "pg_catalog.quote_ident(o.nspname)",
    catalogue: "pg_catalog.pg_namespace",
    ofTheKind: "true",
    covered: "o.oid = any (k.schemas)",
    acl: "o.nspacl",
    letter: "'n'",
    owner: "o.nspowner",
  },
  {
    // A composite type's privileges are its type's (types.ts); an index's are none.
    kind: "relation",
    object: "o.oid::pg_catalog.regclass::pg_catalog.text",
    catalogue: "pg_catalog.pg_class",
    ofTheKind: "o.relkind in ('r', 'p', 'v', 'm', 'S', 'f')",
    covered: "o.relnamespace = any (k.schemas)",
    acl: "o.relacl",
    letter: `(case when o.relkind = 'S' then 's' else 'r' end)::pg_catalog."char"`,
    owner: "o.relowner",
  },
  {
    kind: "function",
    object: "o.oid::pg_catalog.regprocedure::pg_catalog.text",
    catalogue: "pg_catalog.pg_proc",
    ofTheKind: "true",
    covered: "o.pronamespace = any (k.schemas)",
    acl: "o.proacl",
    letter: "'f'",
    owner: "o.proowner",
  },
  {
    kind: "type",
    object: typeName("o.oid"),
    catalogue: "pg_catalog.pg_type",
    ofTheKind: aTypeOfItsOwn("o"),
    covered: "o.typnamespace = any (k.schemas)",
    acl: "o.typacl",
    letter: "'T'",
    owner: "o.typowner",
  },
];

/** The line of one ACL item `a` of a `grant` statement: everything after the object. */
const ITEM = `' to ' || ${role("a.grantee")} || ' ' || a.privilege_type || ' option ' || ${flag("a.is_grantable")} || ' by ' || ${role("a.grantor")}`;

/** An item that names a chain role (`k.roles`) as its grantee or its grantor. */
const NAMES_A_CHAIN_ROLE = "(a.grantee = any (k.roles) or a.grantor = any (k.roles))";

/**
 * Every item of a covered object of this kind, and of any other object of it each item that names a chain role. A
 * NULL ACL is the owner's default (SPEC §3 fact 3): its items are `acldefault`'s, marked `default` — so an object a
 * chain role owns outside the covered schemas is read as one inside (§6a.4); a stored ACL's are marked `stored`.
 */
const grantsOn = ({ kind, object, catalogue, ofTheKind, covered, acl, letter, owner }: Holder): string => `${THE_COVERED_SETS}
select 'grant ${kind} ' || ${object} || ${ITEM} || case when ${acl} is null then ' default' else ' stored' end as line
  from k, ${catalogue} o
 cross join lateral pg_catalog.aclexplode(coalesce(${acl}, pg_catalog.acldefault(${letter}, ${owner}))) a
 where ${ofTheKind} and (${covered} or ${NAMES_A_CHAIN_ROLE})`;

// A column has stored items only: a NULL column ACL means it has none of its own.
const COLUMN_GRANTS = `${THE_COVERED_SETS}
select 'grant column ' || o.oid::pg_catalog.regclass::pg_catalog.text || '.' || pg_catalog.quote_ident(c.attname) || ${ITEM} || ' stored' as line
  from k, pg_catalog.pg_class o
  join pg_catalog.pg_attribute c on c.attrelid = o.oid and c.attnum > 0 and not c.attisdropped and c.attacl is not null
 cross join lateral pg_catalog.aclexplode(c.attacl) a
 where o.relkind in ('r', 'p', 'v', 'm', 'f') and (o.relnamespace = any (k.schemas) or ${NAMES_A_CHAIN_ROLE})`;

// Every item of each row whose role is a chain role, whose schema is covered, or that grants a chain role anything.
// Schema 0 is every schema, `*` (SPEC §2: the global rows are read, never joined away).
const DEFAULT_ACLS = `${THE_COVERED_SETS}
select 'default-acl for ' || ${role("d.defaclrole")} || ' in ' || case when d.defaclnamespace = 0 then '*' else pg_catalog.quote_ident(n.nspname) end
       || ' on ' || d.defaclobjtype::pg_catalog.text || ' to ' || ${role("a.grantee")} || ' ' || a.privilege_type
       || ' option ' || ${flag("a.is_grantable")} as line
  from k, pg_catalog.pg_default_acl d
  left join pg_catalog.pg_namespace n on n.oid = d.defaclnamespace
 cross join lateral pg_catalog.aclexplode(d.defaclacl) a
 where d.defaclrole = any (k.roles) or d.defaclnamespace = any (k.schemas)
    or exists (select 1 from pg_catalog.aclexplode(d.defaclacl) x where x.grantee = any (k.roles))`;

/** The database's line, and every `grant` and `default-acl` line. */
export async function grantLines(conn: Client, { schemas, roles }: Covered): Promise<string[]> {
  const lines = await linesOf(conn, DATABASE);
  for (const sql of [...HOLDERS.map(grantsOn), COLUMN_GRANTS, DEFAULT_ACLS]) lines.push(...(await linesOf(conn, sql, [schemas, roles])));
  return lines;
}
