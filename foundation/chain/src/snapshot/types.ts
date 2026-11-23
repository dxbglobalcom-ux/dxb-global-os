// The snapshot's lines of the types in the covered schemas (piece 6a's SPEC §4.3): `type`, `enum-label`, `domain`,
// `domain-constraint`, `range`.
import type { Client } from "pg";
import { collationUnlessTheTypes, flag, linesOf, orDash, role, typeName } from "./sql.ts";
import type { Covered } from "./sql.ts";

/**
 * Whether the type `t` is one of its own — neither the array the server makes for another type, nor the row type of
 * a relation that is no composite type. A composite type made by CREATE TYPE is its own: its `relation` line of kind
 * `c` says its columns, this its owner and its grants. Only such a type has a `type` line, and only such a type has
 * `grant type` lines, in a covered schema or anywhere else (§6a.2).
 */
export const aTypeOfItsOwn = (t: string): string => `
  not exists (select 1 from pg_catalog.pg_type e where e.typarray = ${t}.oid)
  and (${t}.typrelid = 0 or (select r.relkind from pg_catalog.pg_class r where r.oid = ${t}.typrelid) = 'c')`;

// `$1` is the covered schemas throughout.
const IN_COVERED = `t.typnamespace = any ($1::pg_catalog.oid[]) and ${aTypeOfItsOwn("t")}`;

const TYPES = `
select 'type ' || ${typeName("t.oid")} || ' kind ' || t.typtype::pg_catalog.text || ' owner ' || ${role("t.typowner")} as line
  from pg_catalog.pg_type t
 where ${IN_COVERED}`;

// An enum's labels by their place in its order, ranked from 1 — the stored sort order is a float that adding a
// label between two others changes in ways that mean nothing.
const ENUM_LABELS = `
select 'enum-label ' || ${typeName("t.oid")}
       || ' ' || (pg_catalog.row_number() over (partition by e.enumtypid order by e.enumsortorder))::pg_catalog.text
       || ' ' || pg_catalog.quote_literal(e.enumlabel) as line
  from pg_catalog.pg_type t
  join pg_catalog.pg_enum e on e.enumtypid = t.oid
 where ${IN_COVERED}`;

// A domain's collation is `-` unless it differs from its base type's (§6a.2).
const DOMAINS = `
select 'domain ' || ${typeName("t.oid")} || ' base ' || pg_catalog.format_type(t.typbasetype, t.typtypmod)
       || ' not-null ' || ${flag("t.typnotnull")}
       || ' collation ' || ${collationUnlessTheTypes("t.typcollation", "(select b.typcollation from pg_catalog.pg_type b where b.oid = t.typbasetype)")}
       || ' default ' || ${orDash("pg_catalog.pg_get_expr(t.typdefaultbin, 0)")} as line
  from pg_catalog.pg_type t
 where ${IN_COVERED} and t.typtype = 'd'`;

const DOMAIN_CONSTRAINTS = `
select 'domain-constraint ' || ${typeName("t.oid")} || ' ' || pg_catalog.quote_ident(k.conname)
       || ' validated ' || ${flag("k.convalidated")} || ' def ' || pg_catalog.pg_get_constraintdef(k.oid) as line
  from pg_catalog.pg_type t
  join pg_catalog.pg_constraint k on k.contypid = t.oid
 where ${IN_COVERED}`;

const RANGES = `
select 'range ' || ${typeName("t.oid")} || ' subtype ' || ${typeName("g.rngsubtype")} as line
  from pg_catalog.pg_type t
  join pg_catalog.pg_range g on g.rngtypid = t.oid
 where ${IN_COVERED}`;

/** Every type of its own in the covered schemas, whoever owns it. */
export async function typeLines(conn: Client, { schemas }: Covered): Promise<string[]> {
  const lines: string[] = [];
  for (const sql of [TYPES, ENUM_LABELS, DOMAINS, DOMAIN_CONSTRAINTS, RANGES]) lines.push(...(await linesOf(conn, sql, [schemas])));
  return lines;
}
