// What the inventory's statements share (piece 6c's SPEC §4.1, §4.2): what a row belongs to — its schema and so its
// mark —, how an object is identified, which rows are a toast relation's, and how a statement is sent. Each takes the
// object as a catalogue and an oid, spelled in SQL by the caller; no catalogue value is spliced in here. `$1` is the
// covered schemas and `$2` the chain's roles throughout, as the snapshot's own readers pass them. Aliases begin with
// the helper's name, so that none hides a name of the statement it stands in.
import { DatabaseError } from "pg";
import type { Client, QueryResultRow } from "pg";
import { placeOf } from "../snapshot/sql.ts";

/** A catalogue of the server as a `regclass` in SQL — the catalogues this file names itself. */
export const theCatalogue = (name: string): string => `'pg_catalog.${name}'::pg_catalog.regclass`;

/** `<type> <identity>` of `pg_identify_object`, or null when the server answers none (SPEC §4.2: that fails the call). */
const identified = (classid: string, objid: string, subid: string): string =>
  `(select identified.type || ' ' || identified.identity from pg_catalog.pg_identify_object(${classid}, ${objid}, ${subid}) identified)`;

/**
 * An object's identity (SPEC §4.2): the server's own, but for three kinds. An internal trigger is never spelled by the
 * name the server made from an oid (fact 3, §6a.1): `internal trigger on <regclass> of <its constraint|-> calling
 * <regprocedure>`. An enum label, which `pg_identify_object` refuses, is `<its type> label <quote_literal>`. A large
 * object is identified by the class `pg_largeobject` — the server refuses `pg_largeobject_metadata` (fact 3).
 */
export const identityOf = (classid: string, objid: string, subid: string): string => `case ${classid}
  when ${theCatalogue("pg_trigger")} then (
    select case when not identity_g.tgisinternal then ${identified(theCatalogue("pg_trigger"), "identity_g.oid", "0")}
                else 'internal trigger on ' || identity_g.tgrelid::pg_catalog.regclass::pg_catalog.text
                     || ' of ' || case when identity_g.tgconstraint = 0 then '-'
                                       else ${identified(theCatalogue("pg_constraint"), "identity_g.tgconstraint", "0")} end
                     || ' calling ' || identity_g.tgfoid::pg_catalog.regprocedure::pg_catalog.text end
      from pg_catalog.pg_trigger identity_g where identity_g.oid = ${objid})
  when ${theCatalogue("pg_enum")} then (
    select ${identified(theCatalogue("pg_type"), "identity_e.enumtypid", "0")} || ' label ' || pg_catalog.quote_literal(identity_e.enumlabel)
      from pg_catalog.pg_enum identity_e where identity_e.oid = ${objid})
  when ${theCatalogue("pg_largeobject_metadata")} then ${identified(theCatalogue("pg_largeobject"), objid, "0")}
  else ${identified(classid, objid, subid)} end`;

/**
 * The schema an object stands in, as §4.1's table reads it — null for one that stands in none. The snapshot's
 * `placeOf`, but where the table says otherwise: an enum label is where its type is, an operator family's member where
 * its family is, a default-privilege row in its schema (0 is none); a large object, a publication's member and a user
 * mapping stand in none. `placeOf` itself is not changed: the snapshot asks it of other kinds (a comment, `pg_shdepend`).
 */
export const schemaOf = (classid: string, objid: string): string => `case ${classid}
  when ${theCatalogue("pg_enum")} then ${placeOf(theCatalogue("pg_type"), `(select schema_e.enumtypid from pg_catalog.pg_enum schema_e where schema_e.oid = ${objid})`)}
  when ${theCatalogue("pg_amop")} then ${placeOf(theCatalogue("pg_opfamily"), `(select schema_o.amopfamily from pg_catalog.pg_amop schema_o where schema_o.oid = ${objid})`)}
  when ${theCatalogue("pg_amproc")} then ${placeOf(theCatalogue("pg_opfamily"), `(select schema_p.amprocfamily from pg_catalog.pg_amproc schema_p where schema_p.oid = ${objid})`)}
  when ${theCatalogue("pg_default_acl")} then (select nullif(schema_d.defaclnamespace, 0) from pg_catalog.pg_default_acl schema_d where schema_d.oid = ${objid})
  when ${theCatalogue("pg_largeobject_metadata")} then null
  when ${theCatalogue("pg_publication_rel")} then null
  when ${theCatalogue("pg_publication_namespace")} then null
  when ${theCatalogue("pg_user_mapping")} then null
  else ${placeOf(classid, objid)} end`;

/** An object a row belongs to (SPEC §4.1's table): its catalogue and oid, and the schema it stands in, all in SQL. */
export type Belonging = { classid: string; objid: string; place: string };

/**
 * Whether one object is inside: in a covered schema or one of the chain's roles — a role by itself, a membership when
 * either of its roles is, a default-privilege row when its role is or its schema is covered. A place that cannot be
 * decided (null) is not inside.
 */
const inside = ({ classid, objid, place }: Belonging): string => `coalesce(case ${classid}
    when ${theCatalogue("pg_authid")} then ${objid} = any ($2::pg_catalog.oid[])
    when ${theCatalogue("pg_auth_members")} then exists (
      select 1 from pg_catalog.pg_auth_members mark_m
       where mark_m.oid = ${objid} and (mark_m.roleid = any ($2::pg_catalog.oid[]) or mark_m.member = any ($2::pg_catalog.oid[])))
    when ${theCatalogue("pg_default_acl")} then ${place} = any ($1::pg_catalog.oid[]) or exists (
      select 1 from pg_catalog.pg_default_acl mark_d where mark_d.oid = ${objid} and mark_d.defaclrole = any ($2::pg_catalog.oid[]))
    else ${place} = any ($1::pg_catalog.oid[]) end, false)`;

/**
 * SPEC §4.1, in the one place it is decided: `in` when every object the row belongs to is inside — one for most rows,
 * the child and the parent both for `pg_inherits` (§10.1 row 1: a table of `os` made a child of a table outside
 * changes what that table answers). A row that belongs to nothing — it stands in no schema and speaks of no role —,
 * and anything whose place cannot be decided, is `out`: never dropped. Each object is read with `$1` and `$2`.
 */
export const markOf = (belongsTo: readonly Belonging[]): string =>
  belongsTo.length === 0 ? "'out'" : `case when ${belongsTo.map(inside).join(" and ")} then 'in' else 'out' end`;

/**
 * The rows `sql` answers, read for the inventory (SPEC §4.2: a read the server refuses fails the call). The server's
 * refusal is thrown as the inventory's own failure — the relation that was being read, `what`, and the SQLSTATE —, and
 * nothing of the server's message, detail, hint or where, any of which can carry a row's value (§10.1 row 5); the
 * refusal is not kept as a cause either, since a cause is printed with its error. Every statement of the inventory
 * is sent here.
 */
export async function rowsReadOf<Row extends QueryResultRow>(conn: Client, what: string, sql: string, values: unknown[] = []): Promise<Row[]> {
  try {
    return (await conn.query<Row>(sql, values)).rows;
  } catch (failure) {
    if (failure instanceof DatabaseError) throw new Error(`the inventory: the server refused the read of ${what} (SQLSTATE ${failure.code ?? "-"})`);
    throw failure;
  }
}

/**
 * Whether the object is a toast relation or a toast relation's index — the relation's columns are rows of that
 * relation too. None of it is a line (SPEC §4.1): it is its table's storage, named by an oid (fact 3).
 */
export const aToastPart = (classid: string, objid: string): string => `(${classid} = ${theCatalogue("pg_class")} and exists (
  select 1 from pg_catalog.pg_class toast_c
    left join pg_catalog.pg_index toast_i on toast_i.indexrelid = toast_c.oid
    left join pg_catalog.pg_class toast_t on toast_t.oid = toast_i.indrelid
   where toast_c.oid = ${objid} and (toast_c.relkind = 't' or toast_t.relkind = 't')))`;
