// The reference pass's judgement (piece 4's SPEC §12.13): whether a file's table is a vocabulary the pass may make equal to it — read from the catalogue and from the file, nothing written.
import type { Client, QueryResult } from "pg";
import { asTheFiles, endThePass } from "./one-pass.ts";
import { columnsOf, namedBy } from "./passes.ts";
import type { PassFile } from "./passes.ts";

/**
 * A file whose table is what SPEC §5 and §12 ask: the columns the file owns, by name, and the table's primary key
 * in the key's own order — neither, for an empty array.
 */
export type Vocabulary = { file: PassFile; table: string; columns: string[]; key: string[] };

/** Ends the pass `pass-failed` at this file, with one of SPEC §6's messages or §12's. */
export function failAt(file: string, message: string): never {
  endThePass({ state: "pass-failed", pass: "reference", file, message });
}

/**
 * `statement`, which reads the file's text — `$1`, whole: the server reads the values. It is the file's: the
 * server's refusal of it is said at that file, with the server's message.
 */
export const ofTheFile = (conn: Client, file: PassFile, statement: string): Promise<QueryResult> =>
  asTheFiles("reference", file.name, () => conn.query(statement, [file.text]));

// A name reaches a statement quoted as an identifier, though each already passed the patterns of SPEC §4.
export const quoted = (name: string): string => `"${name.replaceAll('"', '""')}"`;

export const tableOf = ({ table }: Vocabulary): string => `os.${quoted(table)}`;

/** The file's rows as the server reads them from its text, `$1`, whole: rows of the table's own type (SPEC §3). */
export const filedRows = (vocabulary: Vocabulary): string => `pg_catalog.jsonb_populate_recordset(null::${tableOf(vocabulary)}, $1::pg_catalog.jsonb)`;

// The ordinary table of that name in `os`: its comment, its columns, and its primary key's columns in the key's
// order — a column the key only includes is none of them (SPEC §12.9), and there is none when it has no primary
// key. No row when no such table stands: a view, a table of another schema, nothing at all.
const TABLE = `
select c.oid::pg_catalog.text as oid,
       pg_catalog.obj_description(c.oid, 'pg_class') as comment,
       array(select a.attname::pg_catalog.text
               from pg_catalog.pg_attribute a
              where a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped) as columns,
       array(select a.attname::pg_catalog.text
               from pg_catalog.pg_index i
              cross join lateral pg_catalog.unnest(i.indkey::pg_catalog.int2[]) with ordinality as k (attnum, place)
               join pg_catalog.pg_attribute a on a.attrelid = i.indrelid and a.attnum = k.attnum
              where i.indrelid = c.oid and i.indisprimary and k.place <= i.indnkeyatts
              order by k.place) as key
  from pg_catalog.pg_class c
 where c.relnamespace = pg_catalog.to_regnamespace('os') and c.relname = $1::pg_catalog.name and c.relkind = 'r'`;

type Standing = { oid: string; comment: string | null; columns: string[]; key: string[] };

/** The mark of a vocabulary (SPEC §12.5): the table's comment begins with the word — alone, or followed by what is no letter, digit or underscore. */
export const MARKED = /^vocabulary(?![\p{L}\p{N}_])/u;

// The first column, by name, that a row of the file names twice. The text is read as `json`, which keeps both
// (SPEC §12.7, measured) — also when one of them is spelled with an escape.
const A_COLUMN_NAMED_TWICE = `
select twice.key as said
  from pg_catalog.json_array_elements($1::pg_catalog.json) as r (element)
 cross join lateral (select e.key from pg_catalog.json_each(r.element) e group by e.key having pg_catalog.count(*) > 1) twice
 order by twice.key collate pg_catalog."C"
 limit 1`;

/**
 * The first key the file holds twice, said as the key's values' text joined by `, ` in the key's order — the first
 * by that text. Two rows hold one key when the key's type calls them equal, as the primary key would. A key with a
 * null in it equals no other: the server refuses it where it is written.
 */
function aKeyHeldTwice(vocabulary: Vocabulary): string {
  const key = vocabulary.key.map((column) => `f.${quoted(column)}`);
  const values = key.map((column) => `${column}::pg_catalog.text`).join(", ");
  const whole = key.map((column) => `${column} is not null`).join(" and ");
  return `
select twice.said
  from (select pg_catalog.min(pg_catalog.concat_ws(', ', ${values}) collate pg_catalog."C") as said
          from ${filedRows(vocabulary)} f
         where ${whole}
         group by ${key.join(", ")}
        having pg_catalog.count(*) > 1) twice
 order by twice.said collate pg_catalog."C"
 limit 1`;
}

// The first reference onto the table — from any table of any schema, the table itself included — that writes when
// a row of it is removed or changed (SPEC §12.4): its delete or its update action is neither NO ACTION nor
// RESTRICT. The first by the constraint's name, then by the referencing table said as `<schema>.<table>`.
const A_REFERENCE_THAT_WRITES = `
select w.reference, w.referencing
  from (select k.conname::pg_catalog.text as reference, n.nspname::pg_catalog.text || '.' || c.relname::pg_catalog.text as referencing
          from pg_catalog.pg_constraint k
          join pg_catalog.pg_class c on c.oid = k.conrelid
          join pg_catalog.pg_namespace n on n.oid = c.relnamespace
         where k.contype = 'f' and k.confrelid = $1::pg_catalog.oid
           and not (k.confdeltype in ('a', 'r') and k.confupdtype in ('a', 'r'))) w
 order by w.reference collate pg_catalog."C", w.referencing collate pg_catalog."C"
 limit 1`;

/** What a statement of the judgement says first of the file's text, when it says anything. */
const firstSaid = async (conn: Client, file: PassFile, statement: string): Promise<string | undefined> => (await ofTheFile(conn, file, statement)).rows[0]?.said;

/**
 * What the rows of a file ask of its table, in SPEC §12.13's order: no column named twice in a row; every key of
 * the file a column — the first by name said; a primary key; every column of that key carried — the first in the
 * key's order said; no key twice. A value the server cannot read as its column's type is refused here, at this
 * file, before any row of any table is written.
 */
async function judgeTheRows(conn: Client, vocabulary: Vocabulary, standing: Standing): Promise<void> {
  const { file, table, columns, key } = vocabulary;
  const namedTwice = await firstSaid(conn, file, A_COLUMN_NAMED_TWICE);
  if (namedTwice !== undefined) failAt(file.name, `the file names the column ${namedTwice} twice in one row`);
  const noColumn = columns.find((column) => !standing.columns.includes(column));
  if (noColumn !== undefined) failAt(file.name, `os.${table} has no column ${noColumn}`);
  if (key.length === 0) failAt(file.name, `os.${table} has no primary key`);
  const leftOut = key.find((column) => !columns.includes(column));
  if (leftOut !== undefined) failAt(file.name, `the file does not carry the key column ${leftOut} of os.${table}`);
  const heldTwice = await firstSaid(conn, file, aKeyHeldTwice(vocabulary));
  if (heldTwice !== undefined) failAt(file.name, `the file holds a key twice: ${heldTwice}`);
}

/**
 * A file judged against its table, in SPEC §12.13's order: a table; marked as a vocabulary; what its rows ask
 * (`judgeTheRows`); no reference onto it that writes. An empty array names no column, so it is judged for the
 * table, the mark and the references alone. The judgement does not hang on what the file would do: it is the same
 * on a first build and over a table that already equals its file.
 */
export async function judged(conn: Client, file: PassFile): Promise<Vocabulary> {
  const table = namedBy(file);
  const columns = columnsOf(file.text);
  if (columns === undefined) throw new Error(`reference/${file.name} is not a file readPasses answers: its text is not rows`);
  const [standing] = (await conn.query<Standing>(TABLE, [table])).rows;
  if (standing === undefined) failAt(file.name, `os.${table} is not a table`);
  if (!MARKED.test(standing.comment ?? "")) failAt(file.name, `os.${table} is not marked as a vocabulary`);
  const vocabulary = { file, table, columns, key: columns.length === 0 ? [] : standing.key };
  if (columns.length > 0) await judgeTheRows(conn, vocabulary, standing);
  const [writes] = (await conn.query<{ reference: string; referencing: string }>(A_REFERENCE_THAT_WRITES, [standing.oid])).rows;
  if (writes !== undefined) failAt(file.name, `the reference ${writes.reference} on ${writes.referencing} writes when a row of os.${table} is removed or changed`);
  return vocabulary;
}
