// The snapshot's lines of the database and of privileges (piece 6a's SPEC §4.3): `database`, `grant`, `default-acl`,
// `default-acl-none`.
import type { Client } from "pg";
import { flag, inATemporarySchema, linesOf, role, typeName } from "./sql.ts";
import type { Covered } from "./sql.ts";
import { aTypeOfItsOwn } from "./types.ts";

const DATABASE = `
select 'database ' || pg_catalog.quote_ident(d.datname) || ' owner ' || ${role("d.datdba")}
       || ' encoding ' || pg_catalog.pg_encoding_to_char(d.encoding) || ' collate ' || d.datcollate || ' ctype ' || d.datctype
       || ' connlimit ' || d.datconnlimit::pg_catalog.text as line
  from pg_catalog.pg_database d
 where d.datname = pg_catalog.current_database()`;

// The covered sets, `$1` and `$2`, named once at the head of each statement: a holder may ask only one of them.
const THE_COVERED_SETS = "with k as (select $1::pg_catalog.oid[] as schemas, $2::pg_catalog.oid[] as roles)";

/** One kind of object that holds an ACL, as a `grant` line names it (SPEC §4.3). `o` is the object's row. */
type Holder = {
  kind: "database" | "schema" | "relation" | "function" | "type" | "language" | "fdw" | "server" | "tablespace" | "parameter";
  /** The object's name, spelled by the server. */
  object: string;
  catalogue: string;
  /** The rows of the catalogue of this kind — never one in a temporary schema (§11.1 row 6). */
  ofTheKind: string;
  /**
   * Whether every item of a row is a line — `k.schemas` the covered schemas. Of any other row, only the items that
   * name a chain role are; `false` for the kinds that have a chain role's items only (§11.1 row 4).
   */
  covered: string;
  /** The ACL column. */
  acl: string;
  /** The items a NULL ACL stands for: `acldefault` of the kind's letter and the object's owner (SPEC §3 fact 3). */
  defaults: string | null;
};

const HOLDERS: readonly Holder[] = [
  {
    kind: "database",
    object: "pg_catalog.quote_ident(o.datname)",
    catalogue: "pg_catalog.pg_database",
    ofTheKind: "true",
    covered: "o.datname = pg_catalog.current_database()",
    acl: "o.datacl",
    defaults: "pg_catalog.acldefault('d', o.datdba)",
  },
  {
    kind: "schema",
    object: "pg_catalog.quote_ident(o.nspname)",
    catalogue: "pg_catalog.pg_namespace",
    ofTheKind: `not ${inATemporarySchema("o.oid")}`,
    covered: "o.oid = any (k.schemas)",
    acl: "o.nspacl",
    defaults: "pg_catalog.acldefault('n', o.nspowner)",
  },
  {
    // A composite type's privileges are its type's (types.ts); an index's are none.
    kind: "relation",
    object: "o.oid::pg_catalog.regclass::pg_catalog.text",
    catalogue: "pg_catalog.pg_class",
    ofTheKind: `o.relkind in ('r', 'p', 'v', 'm', 'S', 'f') and not ${inATemporarySchema("o.relnamespace")}`,
    covered: "o.relnamespace = any (k.schemas)",
    acl: "o.relacl",
    defaults: `pg_catalog.acldefault((case when o.relkind = 'S' then 's' else 'r' end)::pg_catalog."char", o.relowner)`,
  },
  {
    kind: "function",
    object: "o.oid::pg_catalog.regprocedure::pg_catalog.text",
    catalogue: "pg_catalog.pg_proc",
    ofTheKind: `not ${inATemporarySchema("o.pronamespace")}`,
    covered: "o.pronamespace = any (k.schemas)",
    acl: "o.proacl",
    defaults: "pg_catalog.acldefault('f', o.proowner)",
  },
  {
    kind: "type",
    object: typeName("o.oid"),
    catalogue: "pg_catalog.pg_type",
    ofTheKind: `${aTypeOfItsOwn("o")} and not ${inATemporarySchema("o.typnamespace")}`,
    covered: "o.typnamespace = any (k.schemas)",
    acl: "o.typacl",
    defaults: "pg_catalog.acldefault('T', o.typowner)",
  },
  // The kinds that stand in no schema and are never covered: a chain role's items on them are lines (§11.1 row 4) —
  // what a login may use or set outside the database's own objects.
  {
    kind: "language",
    object: "pg_catalog.quote_ident(o.lanname)",
    catalogue: "pg_catalog.pg_language",
    ofTheKind: "true",
    covered: "false",
    acl: "o.lanacl",
    defaults: "pg_catalog.acldefault('l', o.lanowner)",
  },
  {
    kind: "fdw",
    object: "pg_catalog.quote_ident(o.fdwname)",
    catalogue: "pg_catalog.pg_foreign_data_wrapper",
    ofTheKind: "true",
    covered: "false",
    acl: "o.fdwacl",
    defaults: "pg_catalog.acldefault('F', o.fdwowner)",
  },
  {
    kind: "server",
    object: "pg_catalog.quote_ident(o.srvname)",
    catalogue: "pg_catalog.pg_foreign_server",
    ofTheKind: "true",
    covered: "false",
    acl: "o.srvacl",
    defaults: "pg_catalog.acldefault('S', o.srvowner)",
  },
  {
    kind: "tablespace",
    object: "pg_catalog.quote_ident(o.spcname)",
    catalogue: "pg_catalog.pg_tablespace",
    ofTheKind: "true",
    covered: "false",
    acl: "o.spcacl",
    defaults: "pg_catalog.acldefault('t', o.spcowner)",
  },
  {
    // A parameter has no owner: a NULL ACL is the bootstrap superuser's own, whose items name no chain role — so
    // only a stored ACL can hold a line.
    kind: "parameter",
    object: "pg_catalog.quote_ident(o.parname)",
    catalogue: "pg_catalog.pg_parameter_acl",
    ofTheKind: "true",
    covered: "false",
    acl: "o.paracl",
    defaults: null,
  },
];

/**
 * The ACL of a row `o` of `catalogue` (spelled `pg_catalog.<name>`) as this reader takes it (SPEC §3 fact 3): of a row
 * of a holder's kind its stored items, or when they are NULL the owner's default; of any other row its stored items.
 * Nothing for a catalogue no holder reads. Piece 6c's inventory reads its `acl` lines so (its SPEC §4.2).
 */
export function effectiveAclOf(catalogue: string): string | undefined {
  const holder = HOLDERS.find((one) => one.catalogue === catalogue);
  if (holder === undefined) return undefined;
  const { ofTheKind, acl, defaults } = holder;
  return defaults === null ? acl : `case when ${ofTheKind} then coalesce(${acl}, ${defaults}) else ${acl} end`;
}

/** The line of one ACL item `a` of a `grant` statement: everything after the object. */
const ITEM = `' to ' || ${role("a.grantee")} || ' ' || a.privilege_type || ' option ' || ${flag("a.is_grantable")} || ' by ' || ${role("a.grantor")}`;

/** An item that names a chain role (`k.roles`) as its grantee or its grantor. */
const NAMES_A_CHAIN_ROLE = "(a.grantee = any (k.roles) or a.grantor = any (k.roles))";

/**
 * Every item of a covered object of this kind, and of any other object of it each item that names a chain role. A
 * NULL ACL is the owner's default (SPEC §3 fact 3): its items are `acldefault`'s, marked `default` — so an object a
 * chain role owns outside the covered schemas is read as one inside (§6a.4); a stored ACL's are marked `stored`.
 */
const grantsOn = ({ kind, object, catalogue, ofTheKind, covered, acl, defaults }: Holder): string => `${THE_COVERED_SETS}
select 'grant ${kind} ' || ${object} || ${ITEM} || case when ${acl} is null then ' default' else ' stored' end as line
  from k, ${catalogue} o
 cross join lateral pg_catalog.aclexplode(${defaults === null ? acl : `coalesce(${acl}, ${defaults})`}) a
 where ${ofTheKind} and (${covered} or ${NAMES_A_CHAIN_ROLE})`;

// A column has stored items only: a NULL column ACL means it has none of its own.
const COLUMN_GRANTS = `${THE_COVERED_SETS}
select 'grant column ' || o.oid::pg_catalog.regclass::pg_catalog.text || '.' || pg_catalog.quote_ident(c.attname) || ${ITEM} || ' stored' as line
  from k, pg_catalog.pg_class o
  join pg_catalog.pg_attribute c on c.attrelid = o.oid and c.attnum > 0 and not c.attisdropped and c.attacl is not null
 cross join lateral pg_catalog.aclexplode(c.attacl) a
 where o.relkind in ('r', 'p', 'v', 'm', 'f') and not ${inATemporarySchema("o.relnamespace")}
   and (o.relnamespace = any (k.schemas) or ${NAMES_A_CHAIN_ROLE})`;

// Each row whose role is a chain role, whose schema is covered, or that grants a chain role anything — none in a
// temporary schema. Schema 0 is every schema, `*` (SPEC §2: the global rows are read, never joined away). Every item
// of a row is a `default-acl` line; a row whose ACL is empty — its role took back even the built-in default — is one
// `default-acl-none` line (§11.1 row 4), which aclexplode alone would leave unsaid.
const DEFAULT_ACLS = `${THE_COVERED_SETS}
select case when pg_catalog.cardinality(d.defaclacl) = 0 then 'default-acl-none' else 'default-acl' end
       || ' for ' || ${role("d.defaclrole")} || ' in ' || case when d.defaclnamespace = 0 then '*' else pg_catalog.quote_ident(n.nspname) end
       || ' on ' || d.defaclobjtype::pg_catalog.text
       || case when pg_catalog.cardinality(d.defaclacl) = 0 then ''
               else ' to ' || ${role("a.grantee")} || ' ' || a.privilege_type || ' option ' || ${flag("a.is_grantable")} end as line
  from k, pg_catalog.pg_default_acl d
  left join pg_catalog.pg_namespace n on n.oid = d.defaclnamespace
  left join lateral pg_catalog.aclexplode(d.defaclacl) a on true
 where (d.defaclrole = any (k.roles) or d.defaclnamespace = any (k.schemas)
        or exists (select 1 from pg_catalog.aclexplode(d.defaclacl) x where x.grantee = any (k.roles)))
   and not ${inATemporarySchema("d.defaclnamespace")}`;

/** The database's line, and every `grant`, `default-acl` and `default-acl-none` line. */
export async function grantLines(conn: Client, { schemas, roles }: Covered): Promise<string[]> {
  const lines = await linesOf(conn, DATABASE);
  for (const sql of [...HOLDERS.map(grantsOn), COLUMN_GRANTS, DEFAULT_ACLS]) lines.push(...(await linesOf(conn, sql, [schemas, roles])));
  return lines;
}
