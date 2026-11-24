// What every reader of the snapshot shares (piece 6a's SPEC §4): what is covered, how a role, a flag and an
// object's place are spelled in SQL, and how a reader's rows become lines. The SQL here is the reader's own text —
// no catalogue value is ever spliced into it: the covered sets travel as parameters, every name is spelled by the
// server.
import type { Client } from "pg";

/**
 * SPEC §4.1, read once per snapshot, in its transaction: the oids of the covered schemas and of the chain's roles.
 * They go back to the server as parameters (`$1` the schemas, `$2` the roles) and are never printed.
 */
export type Covered = { schemas: number[]; roles: number[] };

// The chain's roles are `os_owner` and every role whose name begins with `os_` — `os_owner` among them; `starts_with`
// reads `_` as itself, where LIKE would read it as any character. The covered schemas are `os`, the ledger's schema
// and every schema `os_owner` owns; a name that does not stand is no row, and an absent `os_owner` owns nothing.
const COVERED = `
select array(select r.oid from pg_catalog.pg_roles r where pg_catalog.starts_with(r.rolname::pg_catalog.text, 'os_')) as roles,
       array(select n.oid from pg_catalog.pg_namespace n
              where n.nspname in ('os', 'os_chain') or n.nspowner = pg_catalog.to_regrole('os_owner')) as schemas`;

/** SPEC §4.1's rule, in the one place it is computed. */
export async function coveredBy(conn: Client): Promise<Covered> {
  const { rows } = await conn.query<Covered>(COVERED);
  const [covered] = rows;
  if (covered === undefined) throw new Error("the snapshot: the covered sets were not answered");
  return covered;
}

/**
 * SPEC §4.4 and §11.1 row 6's rule, in the one place it is spelled: whether the schema `namespace` is a session's
 * temporary schema — `pg_temp_<n>` or `pg_toast_temp_<n>`, the server's own test of its names (`isAnyTempNamespace`);
 * no other schema may take a name beginning `pg_`. Nothing in one is a line of any kind. A relation of persistence `t`
 * stands only in one: the server refuses a temporary relation in any other schema. Null — no schema — is none.
 * Wherever an object is found by its owner or by an item rather than by a covered schema, its schema is asked this.
 */
export const inATemporarySchema = (namespace: string): string => `coalesce((
  select pg_catalog.starts_with(temp_n.nspname::pg_catalog.text, 'pg_temp_') or pg_catalog.starts_with(temp_n.nspname::pg_catalog.text, 'pg_toast_temp_')
    from pg_catalog.pg_namespace temp_n where temp_n.oid = ${namespace}), false)`;

/** A role as §4.2 spells it: `quote_ident` of its name, role 0 `PUBLIC`. */
export const role = (oid: string): string => `case when ${oid} = 0 then 'PUBLIC' else pg_catalog.quote_ident(pg_catalog.pg_get_userbyid(${oid})) end`;

/**
 * One item `<name>=<value>` of a `setconfig`, as the server says it: the value of a name that holds a dot is
 * `<hidden>` (SPEC §4.3, fact 7) — said by the server, so it never leaves it. The snapshot's `role-setting` lines and
 * piece 6c's inventory (its SPEC §4.2) read a setting so.
 */
export const settingSaid = (item: string): string => `pg_catalog.split_part(${item}, '=', 1) || '='
       || case when pg_catalog.strpos(pg_catalog.split_part(${item}, '=', 1), '.') > 0 then '<hidden>'
               else pg_catalog.substr(${item}, pg_catalog.strpos(${item}, '=') + 1) end`;

/** A boolean as §4.2 spells it: `t` or `f`. A cast to text would say `true`. */
export const flag = (bool: string): string => `case when ${bool} then 't' else 'f' end`;

/** An empty value as §4.2 spells it: `-`. */
export const orDash = (text: string): string => `coalesce(${text}, '-')`;

/** The type spelled as the server spells it (`format_type`), under the empty search_path: with its schema. */
export const typeName = (oid: string): string => `pg_catalog.format_type(${oid}, null)`;

/** A collation as `pg_identify_object` spells it — `pg_catalog."C"` —, or `-` when it is the type's own (SPEC §4.3). */
export const collationUnlessTheTypes = (collation: string, typesOwn: string): string =>
  `case when ${collation} = ${typesOwn} then '-' else (pg_catalog.pg_identify_object('pg_catalog.pg_collation'::pg_catalog.regclass, ${collation}, 0)).identity end`;

/**
 * The schema an object stands in, by its catalogue and oid — or null for an object that stands in none. SPEC §4.3
 * `outside`: a policy, trigger, rule or column default belongs where its relation does; an extension where its
 * schema is. Everything else is where its catalogue's own namespace column says, as `pg_identify_object` reads it.
 * Used wherever "in a covered schema" is asked of an object named by catalogue and oid: comments, extension members,
 * `pg_shdepend`. Its own aliases begin `place_`, so that none hides a name of the statement it stands in.
 */
export const placeOf = (classid: string, objid: string): string => `coalesce(
  case ${classid}
    when 'pg_catalog.pg_namespace'::pg_catalog.regclass then ${objid}
    when 'pg_catalog.pg_extension'::pg_catalog.regclass then
      (select place_e.extnamespace from pg_catalog.pg_extension place_e where place_e.oid = ${objid})
    when 'pg_catalog.pg_policy'::pg_catalog.regclass then
      (select place_c.relnamespace from pg_catalog.pg_policy place_y
         join pg_catalog.pg_class place_c on place_c.oid = place_y.polrelid where place_y.oid = ${objid})
    when 'pg_catalog.pg_trigger'::pg_catalog.regclass then
      (select place_c.relnamespace from pg_catalog.pg_trigger place_g
         join pg_catalog.pg_class place_c on place_c.oid = place_g.tgrelid where place_g.oid = ${objid})
    when 'pg_catalog.pg_rewrite'::pg_catalog.regclass then
      (select place_c.relnamespace from pg_catalog.pg_rewrite place_w
         join pg_catalog.pg_class place_c on place_c.oid = place_w.ev_class where place_w.oid = ${objid})
    when 'pg_catalog.pg_attrdef'::pg_catalog.regclass then
      (select place_c.relnamespace from pg_catalog.pg_attrdef place_d
         join pg_catalog.pg_class place_c on place_c.oid = place_d.adrelid where place_d.oid = ${objid})
  end,
  pg_catalog.to_regnamespace(pg_catalog.quote_ident((pg_catalog.pg_identify_object(${classid}, ${objid}, 0)).schema))::pg_catalog.oid)`;

/**
 * The lines a statement answers in its column `line`. A null line — a field the server answered null where §4.3
 * gives none — is refused, never dropped (SPEC §4.4: a text is whole or there is none).
 */
export async function linesOf(conn: Client, sql: string, values: unknown[] = []): Promise<string[]> {
  const { rows } = await conn.query<{ line: string | null }>(sql, values);
  return rows.map(({ line }) => {
    if (line === null) throw new Error(`the snapshot: a line read as null by ${sql.trim().split("\n")[0]}`);
    return line;
  });
}

/**
 * SPEC §4.2's text of several lines: each row's `text` split at `\n` and nothing else, one line per part,
 * `<head> <number>|<part>`, numbered from `00001`. A text that begins or ends with a newline has an empty first or
 * last part (§6a.2).
 */
export async function numberedLinesOf(conn: Client, sql: string, values: unknown[] = []): Promise<string[]> {
  const { rows } = await conn.query<{ head: string | null; text: string | null }>(sql, values);
  return rows.flatMap(({ head, text }) => {
    if (head === null || text === null) throw new Error(`the snapshot: a text read as null by ${sql.trim().split("\n")[0]}`);
    return text.split("\n").map((part, at) => `${head} ${String(at + 1).padStart(5, "0")}|${part}`);
  });
}
