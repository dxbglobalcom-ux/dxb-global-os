// The snapshot's lines of everything else that stands in or touches a covered schema (piece 6a's SPEC §4.3):
// `object`, `extension`, `publication`, `comment`.
import type { Client } from "pg";
import { linesOf, numberedLinesOf, placeOf, role } from "./sql.ts";
import type { Covered } from "./sql.ts";

// The catalogues whose rows have lines of their own kind: a relation or an index, a routine, a type — an array and
// a relation's row type are parts of what they were made for —, a constraint of a table or of a domain, an
// extension, a default privilege.
const OWN_KINDS = ["pg_class", "pg_proc", "pg_type", "pg_constraint", "pg_extension", "pg_default_acl"];

// Every other catalogue of the server whose rows stand in a schema — a column of type oid named `…namespace` — with
// the statement that reads its rows in the covered schemas (`$1`): each row's type and identity by
// `pg_identify_object`, its owner by the catalogue's `…owner` column, `-` where it has none. Enumerated from the
// catalogue, so a kind §4.3 names no line for still shows (SPEC §4.3: nothing stands in `os` without a line). The
// statement is spelled by the server — names by `%I` —, never by this reader. An owner is never role 0: it is
// spelled `quote_ident` of its name, as `role` spells it.
const CATALOGUES_IN_A_SCHEMA = `
select pg_catalog.format(
         'select ''object '' || i.type || '' '' || i.identity || '' owner '' || %s as line'
         ' from pg_catalog.%I o cross join lateral pg_catalog.pg_identify_object(%s::pg_catalog.oid, o.oid, 0) i'
         ' where o.%I = any ($1::pg_catalog.oid[])',
         case when w.attname is null then '''-''' else pg_catalog.format('pg_catalog.quote_ident(pg_catalog.pg_get_userbyid(o.%I))', w.attname) end,
         c.relname, c.oid, s.attname) as statement
  from pg_catalog.pg_class c
  join pg_catalog.pg_attribute s on s.attrelid = c.oid and s.attnum > 0 and s.atttypid = 'pg_catalog.oid'::pg_catalog.regtype
                                and pg_catalog.right(s.attname::pg_catalog.text, 9) = 'namespace'
  left join pg_catalog.pg_attribute w on w.attrelid = c.oid and w.attnum > 0 and w.atttypid = 'pg_catalog.oid'::pg_catalog.regtype
                                     and pg_catalog.right(w.attname::pg_catalog.text, 5) = 'owner'
 where c.relnamespace = 'pg_catalog'::pg_catalog.regnamespace and c.relkind = 'r'
   and exists (select 1 from pg_catalog.pg_attribute k where k.attrelid = c.oid and k.attname = 'oid')
   and c.relname <> all ($1::pg_catalog.name[])`;

// An extension whose schema is covered, or one of whose members stands in a covered schema (`$1`).
const EXTENSIONS = `
select 'extension ' || pg_catalog.quote_ident(e.extname) || ' schema ' || pg_catalog.quote_ident(n.nspname)
       || ' owner ' || ${role("e.extowner")} || ' version ' || e.extversion as line
  from pg_catalog.pg_extension e
  join pg_catalog.pg_namespace n on n.oid = e.extnamespace
 where e.extnamespace = any ($1::pg_catalog.oid[])
    or exists (select 1 from pg_catalog.pg_depend m
                where m.refclassid = 'pg_catalog.pg_extension'::pg_catalog.regclass and m.refobjid = e.oid and m.deptype = 'e'
                  and ${placeOf("m.classid", "m.objid")} = any ($1::pg_catalog.oid[]))`;

// Each covered relation a publication publishes, as the server itself expands it: named, by its schema, or all tables.
const PUBLICATIONS = `
select 'publication ' || pg_catalog.quote_ident(p.pubname) || ' has ' || g.relid::pg_catalog.regclass::pg_catalog.text as line
  from pg_catalog.pg_publication p
 cross join lateral pg_catalog.pg_get_publication_tables(variadic array[p.pubname::pg_catalog.text]) g
  join pg_catalog.pg_class c on c.oid = g.relid
 where c.relnamespace = any ($1::pg_catalog.oid[])`;

// Each comment on a covered schema or on anything in one — a column's, a constraint's or a trigger's among them.
const COMMENTS = `
select 'comment ' || i.type || ' ' || i.identity as head, d.description as text
  from pg_catalog.pg_description d
 cross join lateral pg_catalog.pg_identify_object(d.classoid, d.objoid, d.objsubid) i
 where ${placeOf("d.classoid", "d.objoid")} = any ($1::pg_catalog.oid[])`;

/** `object`, `extension`, `publication` and `comment` lines. */
export async function objectLines(conn: Client, { schemas }: Covered): Promise<string[]> {
  const lines: string[] = [];
  const { rows } = await conn.query<{ statement: string }>(CATALOGUES_IN_A_SCHEMA, [OWN_KINDS]);
  for (const { statement } of rows) lines.push(...(await linesOf(conn, statement, [schemas])));
  for (const sql of [EXTENSIONS, PUBLICATIONS]) lines.push(...(await linesOf(conn, sql, [schemas])));
  lines.push(...(await numberedLinesOf(conn, COMMENTS, [schemas])));
  return lines;
}
