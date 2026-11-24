// The inventory's lines of the catalogue (piece 6c's SPEC §4.1, §4.2): `read`, `left-out`, and for every row of
// every catalogue read its `row`, `owner` and `acl` lines. Which catalogues there are, and their columns, is asked of
// the server; how each catalogue's row is identified and what it belongs to is said here, once.
import type { Client } from "pg";
import { effectiveAclOf } from "../snapshot/grants.ts";
import { inATemporarySchema, role, settingSaid } from "../snapshot/sql.ts";
import type { Covered } from "../snapshot/sql.ts";
import { aToastPart, identityOf, markOf, rowsReadOf, schemaOf, theCatalogue } from "./sql.ts";

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
 * that the value never leaves the server. A dotted setting's value `<hidden>`, as the snapshot says it; options and a
 * connection `<set>` or nothing. A password enters as itself: it is a SCRAM verifier — its own salt is in it — or
 * none, since a password stored in any other form has failed the call before the first catalogue is read
 * (`PASSWORDS_OF_ANOTHER_FORM`).
 */
const SAID_INSTEAD: ReadonlyMap<string, string> = new Map([
  ["pg_db_role_setting.setconfig", `case when o.setconfig is null then null else array(
        select ${settingSaid("setting.item")} from pg_catalog.unnest(o.setconfig) with ordinality setting (item, n) order by setting.n)::pg_catalog.text end`],
  ["pg_user_mapping.umoptions", "case when o.umoptions is null then null else '<set>' end"],
  ["pg_subscription.subconninfo", "case when o.subconninfo is null then null else '<set>' end"],
]);

/** An object, by its catalogue and oid, spelled in SQL over the row `o`. */
type Thing = { classid: string; objid: string };

/**
 * How a catalogue's row is read (SPEC §4.2): its identity; what it belongs to (§4.1's table) — what marks it —; and
 * the other objects it names, `alsoNaming`. A toast relation or a temporary schema at any of them keeps the row out
 * (§4.1). Belonging to nothing, the row stands in no schema and speaks of no role — it is `out`.
 */
type Reading = { identity: string; belongsTo: Thing[]; alsoNaming?: Thing[] };

const theOne = (catalogue: string, objid: string): Thing => ({ classid: theCatalogue(catalogue), objid });
const identityOfThe = ({ classid, objid }: Thing): string => identityOf(classid, objid, "0");

/** A row that is part of one object: its identity and its place are the object's. */
const partOf = (object: Thing): Reading => ({ identity: identityOfThe(object), belongsTo: [object] });

/** A row that speaks of an object by `classoid`, `objoid` and `subid`. */
const speakingOf = (subid: string): Reading => ({ identity: identityOf("o.classoid", "o.objoid", subid), belongsTo: [{ classid: "o.classoid", objid: "o.objoid" }] });

/** The catalogues with no `oid` column, each given its reading by name (§4.2). One with an `oid` is read as an object. */
const READINGS: Readonly<Record<string, Reading>> = {
  pg_aggregate: partOf(theOne("pg_proc", "o.aggfnoid")),
  // A column, a system column too, by its relation and number.
  pg_attribute: { identity: identityOf(theCatalogue("pg_class"), "o.attrelid", "o.attnum"), belongsTo: [theOne("pg_class", "o.attrelid")] },
  pg_db_role_setting: {
    identity: `'setting for ' || case when o.setrole = 0 then '*' else ${role("o.setrole")} end || ' in '
               || case when o.setdatabase = 0 then '*'
                       else (select pg_catalog.quote_ident(d.datname) from pg_catalog.pg_database d where d.oid = o.setdatabase) end`,
    belongsTo: [theOne("pg_authid", "o.setrole")],
  },
  pg_depend: {
    identity: `${identityOf("o.classid", "o.objid", "o.objsubid")} || ' -> ' || ${identityOf("o.refclassid", "o.refobjid", "o.refobjsubid")}
               || ' ' || o.deptype::pg_catalog.text`,
    belongsTo: [{ classid: "o.classid", objid: "o.objid" }],
    alsoNaming: [{ classid: "o.refclassid", objid: "o.refobjid" }],
  },
  pg_description: speakingOf("o.objsubid"),
  pg_foreign_table: partOf(theOne("pg_class", "o.ftrelid")),
  pg_index: partOf(theOne("pg_class", "o.indexrelid")),
  // Both ends (§4.1, §10.1 row 1): a child of a table outside changes what that table answers.
  pg_inherits: {
    identity: `${identityOfThe(theOne("pg_class", "o.inhrelid"))} || ' inherits ' || ${identityOfThe(theOne("pg_class", "o.inhparent"))}
               || ' ' || o.inhseqno::pg_catalog.text`,
    belongsTo: [theOne("pg_class", "o.inhrelid"), theOne("pg_class", "o.inhparent")],
  },
  pg_init_privs: speakingOf("o.objsubid"),
  pg_partitioned_table: partOf(theOne("pg_class", "o.partrelid")),
  pg_range: partOf(theOne("pg_type", "o.rngtypid")),
  // An origin stands in no schema and has no identity of the server's: its name is its own.
  pg_replication_origin: { identity: "'replication origin ' || pg_catalog.quote_ident(o.roname)", belongsTo: [] },
  pg_seclabel: speakingOf("o.objsubid"),
  pg_sequence: partOf(theOne("pg_class", "o.seqrelid")),
  pg_shdescription: speakingOf("0"),
  pg_shseclabel: speakingOf("0"),
  pg_ts_config_map: {
    identity: `${identityOfThe(theOne("pg_ts_config", "o.mapcfg"))} || ' token ' || o.maptokentype::pg_catalog.text || ' ' || o.mapseqno::pg_catalog.text`,
    belongsTo: [theOne("pg_ts_config", "o.mapcfg")],
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

/** Every object a row names: what it belongs to first, in its order, then the others. */
const namedBy = ({ belongsTo, alsoNaming = [] }: Reading): Thing[] => [...belongsTo, ...alsoNaming];

/**
 * The statement that reads every row of `catalogue` (SPEC §4.2): its mark, its digest, its identity, its owner and
 * its ACL's items as the server prints an `aclitem`. Where each object it names stands is read once a row,
 * `end_<n>.place` — those it belongs to first, so that their places are the first `end_`s.
 */
function statementOf({ name, spelled, columns }: Catalogue, reading: Reading): string {
  const { identity, belongsTo } = reading;
  const ends = namedBy(reading);
  const owner = columns.find(({ column, type }) => (type === "oid" && column.endsWith("owner")) || (name === "pg_database" && column === "datdba"));
  const acl = columns.find(({ type }) => type === "aclitem[]");
  // Every column but the owner, the ACL, and what moves with no act, by name, as text.
  const digested = columns.filter((one) => one !== owner && one !== acl && !MOVING_TYPES.has(one.type) && !MOVING_COLUMNS.has(one.column));
  const values = digested.map(({ column, ident, columnLiteral }) => `${columnLiteral}, ${SAID_INSTEAD.get(`${name}.${column}`) ?? `o.${ident}::pg_catalog.text`}`);
  const digest = `pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(array[${values.join(", ")}]::pg_catalog.text[]::pg_catalog.text, 'UTF8')), 'hex')`;
  const items = acl === undefined ? "'{}'::pg_catalog.aclitem[]" : ((name === "pg_largeobject_metadata" ? LARGE_OBJECT_ACL : effectiveAclOf(spelled)) ?? `o.${acl.ident}`);
  const places = ends.map(({ classid, objid }, at) => `cross join lateral (select ${schemaOf(classid, objid)} as place) end_${at}`);
  const kept = ends.flatMap(({ classid, objid }, at) => [`not ${aToastPart(classid, objid)}`, `not ${inATemporarySchema(`end_${at}.place`)}`]);
  return `
select ${markOf(belongsTo.map((object, at) => ({ ...object, place: `end_${at}.place` })))} as mark, ${digest} as digest, ${identity} as identity,
       ${owner === undefined ? "null" : role(`o.${owner.ident}`)} as owner,
       array(select item::pg_catalog.text from pg_catalog.unnest(${items}) item) as acl
  from ${spelled} o ${places.join(" ")}
 where ${kept.length === 0 ? "true" : kept.join(" and ")}`;
}

/** Every catalogue of the server, with its columns. */
async function cataloguesOf(conn: Client): Promise<Catalogue[]> {
  const rows = await rowsReadOf<Column & { name: string; spelled: string; literal: string }>(conn, "pg_catalog.pg_class and its columns", CATALOGUES);
  const byName = new Map<string, Catalogue>();
  for (const { name, spelled, literal, ...column } of rows) {
    const catalogue = byName.get(name) ?? { name, spelled, literal, columns: [] };
    catalogue.columns.push(column);
    byName.set(name, catalogue);
  }
  return [...byName.values()];
}

// SPEC §4.2 (§10.1 row 2): the roles whose password is stored in another form than a SCRAM verifier — decided here, in
// the database, so that no such value leaves the server, in a digest or in any other text. Only the roles are answered.
const PASSWORDS_OF_ANOTHER_FORM = `
select ${role("a.oid")} as role from pg_catalog.pg_authid a
 where a.rolpassword is not null and not pg_catalog.starts_with(a.rolpassword, 'SCRAM-SHA-256$')
 order by a.rolname::pg_catalog.text collate "C"`;

/**
 * SPEC §4.2: a password stored in another form than a SCRAM verifier fails the call, before any line is made. The
 * failure names the role and says nothing of what is stored: a digest of it would be opened by a guess, and saying it
 * as `<set>` would leave a change of it unseen (§10.1 row 2).
 */
async function refuseAPasswordOfAnotherForm(conn: Client): Promise<void> {
  const rows = await rowsReadOf<{ role: string }>(conn, "pg_catalog.pg_authid", PASSWORDS_OF_ANOTHER_FORM);
  if (rows.length === 0) return;
  throw new Error(`the inventory: the password of ${rows.map(({ role: named }) => named).join(", ")} is stored in another form than a SCRAM verifier — the call fails (SPEC §4.2)`);
}

type Row = { mark: string; digest: string; identity: string | null; owner: string | null; acl: string[] };

/**
 * Every `read`, `left-out`, `row`, `owner` and `acl` line, unescaped and in no order (SPEC §4.2). A catalogue that is
 * neither left out nor given a reading fails the call — a new catalogue is decided by a person — and so does a row
 * the server identifies as null. Each line is appended alone, never spread into a call: the catalogue is ~35,000 rows.
 */
export async function catalogueLines(conn: Client, { schemas, roles }: Covered): Promise<string[]> {
  await refuseAPasswordOfAnotherForm(conn);
  const lines: string[] = [];
  for (const catalogue of await cataloguesOf(conn)) {
    const { name } = catalogue;
    if (LEFT_OUT.has(name)) {
      lines.push(`left-out ${name}`);
      continue;
    }
    const reading = readingOf(catalogue);
    if (reading === undefined) throw new Error(`the inventory: the catalogue ${name} has no reading — a person decides how it is read`);
    // The covered sets are the mark's alone: a row that belongs to nothing names neither, and the server refuses a parameter it cannot type.
    const rows = await rowsReadOf<Row>(conn, catalogue.spelled, statementOf(catalogue, reading), reading.belongsTo.length === 0 ? [] : [schemas, roles]);
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
