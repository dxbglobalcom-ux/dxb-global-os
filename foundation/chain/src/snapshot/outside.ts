// The snapshot's `outside` lines (piece 6a's SPEC §4.3): what ties a chain role to an object no other line reads —
// each `pg_shdepend` row of a chain role whose object is not this database, a covered schema, something in one or a
// default-ACL row. `pg_shdepend` is no whole enumerator of the outside (SPEC §3 fact 8; §9): it says what a role
// owns, is granted on or is named in a policy of.
import type { Client } from "pg";
import { linesOf, placeOf, role } from "./sql.ts";
import type { Covered } from "./sql.ts";

// How a row ties its role: `o` owner, `a` an ACL item, `r` a policy; an initial privilege (`i`) and anything a later
// server adds are `other`.
const HOW = `case s.deptype when 'o' then 'owns' when 'a' then 'granted' when 'r' then 'in-policy' else 'other' end`;

// `$1` the covered schemas, `$2` the chain's roles. A row of this database or of a shared catalogue (`dbid` 0) names
// an object this session can identify: its type and identity, as `pg_identify_object` spells them.
const HERE = `
select 'outside ' || ${HOW} || ' ' || ${role("s.refobjid")} || ' ' || i.type || ' ' || i.identity as line
  from pg_catalog.pg_shdepend s
 cross join lateral pg_catalog.pg_identify_object(s.classid, s.objid, s.objsubid) i
 where s.refclassid = 'pg_catalog.pg_authid'::pg_catalog.regclass and s.refobjid = any ($2::pg_catalog.oid[])
   and (s.dbid = 0 or s.dbid = (select d.oid from pg_catalog.pg_database d where d.datname = pg_catalog.current_database()))
   and s.classid <> 'pg_catalog.pg_default_acl'::pg_catalog.regclass
   and not (s.classid = 'pg_catalog.pg_database'::pg_catalog.regclass
            and s.objid = (select d.oid from pg_catalog.pg_database d where d.datname = pg_catalog.current_database()))
   and not coalesce(${placeOf("s.classid", "s.objid")} = any ($1::pg_catalog.oid[]), false)`;

// A row of another database names an object only that database can identify: its database and its catalogue.
const ELSEWHERE = `
select 'outside ' || ${HOW} || ' ' || ${role("s.refobjid")} || ' other-database ' || pg_catalog.quote_ident(d.datname)
       || ' ' || s.classid::pg_catalog.regclass::pg_catalog.text as line
  from pg_catalog.pg_shdepend s
  join pg_catalog.pg_database d on d.oid = s.dbid
 where s.refclassid = 'pg_catalog.pg_authid'::pg_catalog.regclass and s.refobjid = any ($1::pg_catalog.oid[])
   and d.datname <> pg_catalog.current_database()`;

/** Every `outside` line of the chain's roles. */
export async function outsideLines(conn: Client, { schemas, roles }: Covered): Promise<string[]> {
  return [...(await linesOf(conn, HERE, [schemas, roles])), ...(await linesOf(conn, ELSEWHERE, [roles]))];
}
