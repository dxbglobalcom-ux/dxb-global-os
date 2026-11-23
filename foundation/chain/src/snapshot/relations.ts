// The snapshot's lines of the covered schemas and their relations (piece 6a's SPEC §4.3): `schema`, `relation`,
// `partition-key`, `partition-of`, `inherits`, `column`, `sequence`, `view`.
import type { Client } from "pg";
import { collationUnlessTheTypes, flag, inATemporarySchema, linesOf, numberedLinesOf, orDash, role, typeName } from "./sql.ts";
import type { Covered } from "./sql.ts";

/** The kinds of `pg_class` a `relation` line is for (SPEC §4.3); an index has its `index` line. */
const RELATION_KINDS = "('r', 'p', 'v', 'm', 'S', 'f', 'c')";

// `$1` is the covered schemas throughout.
const IN_COVERED = `c.relnamespace = any ($1::pg_catalog.oid[]) and c.relkind in ${RELATION_KINDS}`;

const SCHEMAS = `
select 'schema ' || pg_catalog.quote_ident(n.nspname) || ' owner ' || ${role("n.nspowner")} as line
  from pg_catalog.pg_namespace n
 where n.oid = any ($1::pg_catalog.oid[])`;

// Its options as written are in the order they were written (SPEC §3 fact 3): sorted here by their bytes.
const RELATIONS = `
select 'relation ' || c.oid::pg_catalog.regclass::pg_catalog.text || ' kind ' || c.relkind::pg_catalog.text || ' owner ' || ${role("c.relowner")}
       || ' persistence ' || c.relpersistence::pg_catalog.text || ' rowsecurity ' || ${flag("c.relrowsecurity")}
       || ' force ' || ${flag("c.relforcerowsecurity")} || ' replident ' || c.relreplident::pg_catalog.text
       || ' options ' || ${orDash(`(select pg_catalog.string_agg(o.option, ',' order by o.option collate pg_catalog."C")
                                      from pg_catalog.unnest(c.reloptions) as o (option))`)} as line
  from pg_catalog.pg_class c
 where ${IN_COVERED}`;

const PARTITION_KEYS = `
select 'partition-key ' || c.oid::pg_catalog.regclass::pg_catalog.text || ' ' || pg_catalog.pg_get_partkeydef(c.oid) as line
  from pg_catalog.pg_class c
 where ${IN_COVERED} and c.relkind = 'p'`;

// A partition's parent and bound; its `pg_inherits` row is said by this line, not by an `inherits` line.
const PARTITIONS_OF = `
select 'partition-of ' || c.oid::pg_catalog.regclass::pg_catalog.text || ' ' || i.inhparent::pg_catalog.regclass::pg_catalog.text
       || ' ' || pg_catalog.pg_get_expr(c.relpartbound, c.oid) as line
  from pg_catalog.pg_class c
  join pg_catalog.pg_inherits i on i.inhrelid = c.oid
 where ${IN_COVERED} and c.relispartition`;

// When the child or the parent is covered (SPEC §11.1 row 3): a table outside that inherits one of `os` reads its
// rows into every query of the parent. A temporary child is none (§11.1 row 6); a parent is never temporary when its
// child is not — the server refuses a permanent child of a temporary table.
const INHERITS = `
select 'inherits ' || c.oid::pg_catalog.regclass::pg_catalog.text || ' ' || i.inhparent::pg_catalog.regclass::pg_catalog.text
       || ' ' || i.inhseqno::pg_catalog.text as line
  from pg_catalog.pg_inherits i
  join pg_catalog.pg_class c on c.oid = i.inhrelid
  join pg_catalog.pg_class p on p.oid = i.inhparent
 where c.relkind in ${RELATION_KINDS} and not c.relispartition
   and (c.relnamespace = any ($1::pg_catalog.oid[]) or p.relnamespace = any ($1::pg_catalog.oid[]))
   and not ${inATemporarySchema("c.relnamespace")}`;

// Each live column; its position is its rank among the live ones, so a dropped column moves no other line.
const COLUMNS = `
select 'column ' || c.oid::pg_catalog.regclass::pg_catalog.text
       || ' ' || (pg_catalog.row_number() over (partition by a.attrelid order by a.attnum))::pg_catalog.text
       || ' ' || pg_catalog.quote_ident(a.attname) || ' type ' || pg_catalog.format_type(a.atttypid, a.atttypmod)
       || ' not-null ' || ${flag("a.attnotnull")} || ' identity ' || ${orDash("nullif(a.attidentity::pg_catalog.text, '')")}
       || ' generated ' || ${orDash("nullif(a.attgenerated::pg_catalog.text, '')")}
       || ' collation ' || ${collationUnlessTheTypes("a.attcollation", "(select t.typcollation from pg_catalog.pg_type t where t.oid = a.atttypid)")}
       || ' default ' || ${orDash("pg_catalog.pg_get_expr(d.adbin, d.adrelid)")} as line
  from pg_catalog.pg_class c
  join pg_catalog.pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
  left join pg_catalog.pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
 where ${IN_COVERED}`;

// Never `last_value`: a position is no part of the text. The column a sequence is owned by — `owned by` or an
// identity's — is its `pg_depend` row on a column.
const SEQUENCES = `
select 'sequence ' || c.oid::pg_catalog.regclass::pg_catalog.text || ' type ' || ${typeName("s.seqtypid")}
       || ' start ' || s.seqstart::pg_catalog.text || ' increment ' || s.seqincrement::pg_catalog.text
       || ' min ' || s.seqmin::pg_catalog.text || ' max ' || s.seqmax::pg_catalog.text || ' cache ' || s.seqcache::pg_catalog.text
       || ' cycle ' || ${flag("s.seqcycle")} || ' owned-by ' || ${orDash(`(
            select d.refobjid::pg_catalog.regclass::pg_catalog.text || '.' || pg_catalog.quote_ident(a.attname)
              from pg_catalog.pg_depend d
              join pg_catalog.pg_attribute a on a.attrelid = d.refobjid and a.attnum = d.refobjsubid
             where d.classid = 'pg_catalog.pg_class'::pg_catalog.regclass and d.objid = c.oid
               and d.refclassid = 'pg_catalog.pg_class'::pg_catalog.regclass and d.refobjsubid > 0 and d.deptype in ('a', 'i'))`)} as line
  from pg_catalog.pg_class c
  join pg_catalog.pg_sequence s on s.seqrelid = c.oid
 where ${IN_COVERED}`;

const VIEWS = `
select 'view ' || c.oid::pg_catalog.regclass::pg_catalog.text as head, pg_catalog.pg_get_viewdef(c.oid) as text
  from pg_catalog.pg_class c
 where ${IN_COVERED} and c.relkind in ('v', 'm')`;

/** The covered schemas' own lines and their relations' — with their columns, sequences and views. */
export async function relationLines(conn: Client, { schemas }: Covered): Promise<string[]> {
  const lines: string[] = [];
  for (const sql of [SCHEMAS, RELATIONS, PARTITION_KEYS, PARTITIONS_OF, INHERITS, COLUMNS, SEQUENCES]) lines.push(...(await linesOf(conn, sql, [schemas])));
  lines.push(...(await numberedLinesOf(conn, VIEWS, [schemas])));
  return lines;
}
