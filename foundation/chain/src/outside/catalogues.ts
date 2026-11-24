// The inventory's lines of the catalogue (piece 6c's SPEC §4.1, §4.2): `read`, `left-out`, and for every row of
// every catalogue read its `row`, `owner` and `acl` lines. Which catalogues there are, and their columns, is asked of
// the server; how each catalogue's row is identified and what it belongs to is said here, once.
import type { Client } from "pg";
import { effectiveAclOf } from "../snapshot/grants.ts";
import { inATemporarySchema, role, settingSaid } from "../snapshot/sql.ts";
import type { Covered } from "../snapshot/sql.ts";
import { aToastPart, identityOf, markOf, schemaOf, theCatalogue } from "./sql.ts";

/** §4.1's five, left out by name, each with its reason there: the only list of catalogues not read. */
const LEFT_OUT = new Set(["pg_largeobject", "pg_shdepend", "pg_statistic", "pg_statistic_ext_data", "pg_subscription_rel"]);

// Every relation of kind `r` in `pg_catalog` and each of its columns, in their order: the catalogue as the server
// spells it — as a name (`%I.%I`) and as a literal of that name, for a `regclass` —, each column's name, its quoted
// name and literal, and its type as `regtype` prints it under the empty search_path.
const CATALOGUES = `
select c.relname::pg_catalog.text as name,
       pg_catalog.format('%I.%I', n.nspname, c.relname) as spelled,
       pg_catalog.quote_literal(pg_catalog.format('%I.%I', n.nspname, c.relname)) as literal,
       a.attname::pg_catalog.text as "column", pg_catalog.quote_ident(a.attname) as ident,
       pg_catalog.quote_literal(a.attname) as "columnLiteral", a.atttypid::pg_catalog.regtype::pg_catalog.text as type
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  join pg_catalog.pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
 where n.nspname = 'pg_catalog' and c.relkind = 'r'
 order by c.relname collate "C", a.attnum`;

type Column = { column: string; ident: string; columnLiteral: string; type: string };
type Catalogue = { name: string; spelled: string; literal: string; columns: Column[] };

/** The types whose values move with no act (SPEC §4.2): transaction and command ids, a tuple's place, a WAL position. */
const MOVING_TYPES = new Set(["xid", "xid8", "cid", "tid", "pg_lsn"]);

/** What `vacuum`, `analyze` and a rewrite move, and the hints the server sets and clears lazily (SPEC §4.2). */
const MOVING_COLUMNS = new Set([
  "reltuples", "relpages", "relallvisible", "relallfrozen", "relfilenode", "relrewrite",
  "relhasindex", "relhasrules", "relhastriggers", "relhassubclass", "dathasloginevt",
]);

/**
 * SPEC §4.2's secrets rule, by `<catalogue>.<column>`: what a column enters the digest as, said in the statement so
 * that the value never leaves the server. A password only as a SCRAM verifier — its own salt is in it —, otherwise
 * `<set>` or nothing; a dotted setting's value `<hidden>`, as the snapshot says it; options and a connection `<set>`.
 */
const SAID_INSTEAD: ReadonlyMap<string, string> = new Map([
  ["pg_authid.rolpassword", `case when o.rolpassword is null then null
        when pg_catalog.starts_with(o.rolpassword, 'SCRAM-SHA-256$') then o.rolpassword else '<set>' end`],
  ["pg_db_role_setting.setconfig", `case when o.setconfig is null then null else array(
        select ${settingSaid("setting.item")} from pg_catalog.unnest(o.setconfig) with ordinality setting (item, n) order by setting.n)::pg_catalog.text end`],
  ["pg_user_mapping.umoptions", "case when o.umoptions is null then null else '<set>' end"],
  ["pg_subscription.subconninfo", "case when o.subconninfo is null then null else '<set>' end"],
]);

/** An object, by its catalogue and oid, spelled in SQL over the row `o`. */
type Thing = { classid: string; objid: string };

/**
 * How a catalogue's row is read (SPEC §4.2): its identity, and the objects at its ends. The first is what the row
 * belongs to (§4.1's table) — what marks it; a toast relation or a temporary schema at any end keeps the row out. No
 * end: the row stands in no schema and speaks of no role — it is `out`.
 */
type Reading = { identity: string; ends: Thing[] };

const theOne = (catalogue: string, objid: string): Thing => ({ classid: theCatalogue(catalogue), objid });
const identityOfThe = ({ classid, objid }: Thing): string => identityOf(classid, objid, "0");

/** A row that is part of one object: its identity and its place are the object's. */
const partOf = (object: Thing): Reading => ({ identity: identityOfThe(object), ends: [object] });

/** A row that speaks of an object by `classoid`, `objoid` and `subid`. */
const speakingOf = (subid: string): Reading => ({ identity: identityOf("o.classoid", "o.objoid", subid), ends: [{ classid: "o.classoid", objid: "o.objoid" }] });

/** The catalogues with no `oid` column, each given its reading by name (§4.2). One with an `oid` is read as an object. */
const READINGS: Readonly<Record<string, Reading>> = {
  pg_aggregate: partOf(theOne("pg_proc", "o.aggfnoid")),
  // A column, a system column too, by its relation and number.
  pg_attribute: { identity: identityOf(theCatalogue("pg_class"), "o.attrelid", "o.attnum"), ends: [theOne("pg_class", "o.attrelid")] },
  pg_db_role_setting: {
    identity: `'setting for ' || case when o.setrole = 0 then '*' else ${role("o.setrole")} end || ' in '
               || case when o.setdatabase = 0 then '*'
                       else (select pg_catalog.quote_ident(d.datname) from pg_catalog.pg_database d where d.oid = o.setdatabase) end`,
    ends: [theOne("pg_authid", "o.setrole")],
  },
  pg_depend: {
    identity: `${identityOf("o.classid", "o.objid", "o.objsubid")} || ' -> ' || ${identityOf("o.refclassid", "o.refobjid", "o.refobjsubid")}
               || ' ' || o.deptype::pg_catalog.text`,
    ends: [{ classid: "o.classid", objid: "o.objid" }, { classid: "o.refclassid", objid: "o.refobjid" }],
  },
  pg_description: speakingOf("o.objsubid"),
  pg_foreign_table: partOf(theOne("pg_class", "o.ftrelid")),
  pg_index: partOf(theOne("pg_class", "o.indexrelid")),
  pg_inherits: {
    identity: `${identityOfThe(theOne("pg_class", "o.inhrelid"))} || ' inherits ' || ${identityOfThe(theOne("pg_class", "o.inhparent"))}
               || ' ' || o.inhseqno::pg_catalog.text`,
    ends: [theOne("pg_class", "o.inhrelid")],
  },
  pg_init_privs: speakingOf("o.objsubid"),
  pg_partitioned_table: partOf(theOne("pg_class", "o.partrelid")),
  pg_range: partOf(theOne("pg_type", "o.rngtypid")),
  // An origin stands in no schema and has no identity of the server's: its name is its own.
  pg_replication_origin: { identity: "'replication origin ' || pg_catalog.quote_ident(o.roname)", ends: [] },
  pg_seclabel: speakingOf("o.objsubid"),
  pg_sequence: partOf(theOne("pg_class", "o.seqrelid")),
  pg_shdescription: speakingOf("0"),
  pg_shseclabel: speakingOf("0"),
  pg_ts_config_map: {
    identity: `${identityOfThe(theOne("pg_ts_config", "o.mapcfg"))} || ' token ' || o.maptokentype::pg_catalog.text || ' ' || o.mapseqno::pg_catalog.text`,
    ends: [theOne("pg_ts_config", "o.mapcfg")],
  },
};

/** The reading of a catalogue: its own, or — when it has an `oid` column — as an object of it; nothing otherwise. */
function readingOf({ name, literal, columns }: Catalogue): Reading | undefined {
  const own = READINGS[name];
  if (own !== undefined) return own;
  return columns.some(({ column }) => column === "oid") ? partOf({ classid: `${literal}::pg_catalog.regclass`, objid: "o.oid" }) : undefined;
}

/** The ACL of a large object, which no holder of the snapshot's reads: stored, or its owner's default (SPEC §4.2). */
const LARGE_OBJECT_ACL = "coalesce(o.lomacl, pg_catalog.acldefault('L', o.lomowner))";

/**
 * The statement that reads every row of `catalogue` (SPEC §4.2): its mark, its digest, its identity, its owner and
 * its ACL's items as the server prints an `aclitem`. Where each end stands is read once a row, `end_<n>.place`.
 */
function statementOf({ name, spelled, columns }: Catalogue, { identity, ends }: Reading): string {
  const owner = columns.find(({ column, type }) => (type === "oid" && column.endsWith("owner")) || (name === "pg_database" && column === "datdba"));
  const acl = columns.find(({ type }) => type === "aclitem[]");
  // Every column but the owner, the ACL, and what moves with no act, by name, as text.
  const digested = columns.filter((one) => one !== owner && one !== acl && !MOVING_TYPES.has(one.type) && !MOVING_COLUMNS.has(one.column));
  const values = digested.map(({ column, ident, columnLiteral }) => `${columnLiteral}, ${SAID_INSTEAD.get(`${name}.${column}`) ?? `o.${ident}::pg_catalog.text`}`);
  const digest = `pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(array[${values.join(", ")}]::pg_catalog.text[]::pg_catalog.text, 'UTF8')), 'hex')`;
  const items = acl === undefined ? "'{}'::pg_catalog.aclitem[]" : ((name === "pg_largeobject_metadata" ? LARGE_OBJECT_ACL : effectiveAclOf(spelled)) ?? `o.${acl.ident}`);
  const [first] = ends;
  const places = ends.map(({ classid, objid }, at) => `cross join lateral (select ${schemaOf(classid, objid)} as place) end_${at}`);
  const kept = ends.flatMap(({ classid, objid }, at) => [`not ${aToastPart(classid, objid)}`, `not ${inATemporarySchema(`end_${at}.place`)}`]);
  return `
select ${first === undefined ? "'out'" : markOf(first.classid, first.objid, "end_0.place")} as mark, ${digest} as digest, ${identity} as identity,
       ${owner === undefined ? "null" : role(`o.${owner.ident}`)} as owner,
       array(select item::pg_catalog.text from pg_catalog.unnest(${items}) item) as acl
  from ${spelled} o ${places.join(" ")}
 where ${kept.length === 0 ? "true" : kept.join(" and ")}`;
}

/** Every catalogue of the server, with its columns. */
async function cataloguesOf(conn: Client): Promise<Catalogue[]> {
  const { rows } = await conn.query<Column & { name: string; spelled: string; literal: string }>(CATALOGUES);
  const byName = new Map<string, Catalogue>();
  for (const { name, spelled, literal, ...column } of rows) {
    const catalogue = byName.get(name) ?? { name, spelled, literal, columns: [] };
    catalogue.columns.push(column);
    byName.set(name, catalogue);
  }
  return [...byName.values()];
}

type Row = { mark: string; digest: string; identity: string | null; owner: string | null; acl: string[] };

/**
 * Every `read`, `left-out`, `row`, `owner` and `acl` line, unescaped and in no order (SPEC §4.2). A catalogue that is
 * neither left out nor given a reading fails the call — a new catalogue is decided by a person — and so does a row
 * the server identifies as null. Each line is appended alone, never spread into a call: the catalogue is ~35,000 rows.
 */
export async function catalogueLines(conn: Client, { schemas, roles }: Covered): Promise<string[]> {
  const lines: string[] = [];
  for (const catalogue of await cataloguesOf(conn)) {
    const { name } = catalogue;
    if (LEFT_OUT.has(name)) {
      lines.push(`left-out ${name}`);
      continue;
    }
    const reading = readingOf(catalogue);
    if (reading === undefined) throw new Error(`the inventory: the catalogue ${name} has no reading — a person decides how it is read`);
    // The covered sets are the mark's alone: a row with no end names neither, and the server refuses a parameter it cannot type.
    const { rows } = await conn.query<Row>(statementOf(catalogue, reading), reading.ends.length === 0 ? [] : [schemas, roles]);
    for (const { mark, digest, identity, owner, acl } of rows) {
      if (identity === null) throw new Error(`the inventory: a row of ${name} the server identifies as null`);
      lines.push(`row ${mark} ${name} ${digest} ${identity}`);
      if (owner !== null) lines.push(`owner ${mark} ${name} ${identity} is ${owner}`);
      for (const item of acl) lines.push(`acl ${mark} ${name} ${identity} has ${item}`);
    }
    lines.push(`read ${name} ${rows.length}`);
  }
  return lines;
}
