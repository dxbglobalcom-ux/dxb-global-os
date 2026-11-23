// The reference pass (piece 4's SPEC §5, §6 step 9): every vocabulary made equal to its file — judged, ordered, written, removed, proved.
import type { Client } from "pg";
import { asTheFiles, endThePass, inOnePass } from "./one-pass.ts";
import type { NotGreen } from "./one-pass.ts";
import { columnsOf, namedBy } from "./passes.ts";
import type { PassFile } from "./passes.ts";
import type { InASession } from "./session.ts";

/**
 * A file whose table is what SPEC §5 asks: the columns the file owns, by name, and the table's primary key in the
 * key's own order — neither, for an empty array.
 */
type Vocabulary = { file: PassFile; table: string; columns: string[]; key: string[] };

/** Ends the pass `pass-failed` at this file, with one of SPEC §6's messages. */
function failAt(file: string, message: string): never {
  endThePass({ state: "pass-failed", pass: "reference", file, message });
}

// The ordinary table of that name in `os`: its columns, and its primary key's in the key's order — none when it
// has no primary key. No row when no such table stands: a view, a table of another schema, nothing at all.
const TABLE = `
select array(select a.attname::pg_catalog.text
               from pg_catalog.pg_attribute a
              where a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped) as columns,
       array(select a.attname::pg_catalog.text
               from pg_catalog.pg_index i
              cross join lateral pg_catalog.unnest(i.indkey::pg_catalog.int2[]) with ordinality as k (attnum, place)
               join pg_catalog.pg_attribute a on a.attrelid = i.indrelid and a.attnum = k.attnum
              where i.indrelid = c.oid and i.indisprimary
              order by k.place) as key
  from pg_catalog.pg_class c
 where c.relnamespace = pg_catalog.to_regnamespace('os') and c.relname = $1::pg_catalog.name and c.relkind = 'r'`;

/**
 * A file judged against its table, in SPEC §9a's order: a table; every key of the file a column of it — the first
 * by name said; a primary key; every column of that key carried — the first in the key's order said. An empty
 * array asks only that the table is a table: with no column named there is no key to carry.
 */
async function judged(conn: Client, file: PassFile): Promise<Vocabulary> {
  const table = namedBy(file);
  const columns = columnsOf(file.text);
  if (columns === undefined) throw new Error(`reference/${file.name} is not a file readPasses answers: its text is not rows`);
  const [standing] = (await conn.query<{ columns: string[]; key: string[] }>(TABLE, [table])).rows;
  if (standing === undefined) failAt(file.name, `os.${table} is not a table`);
  if (columns.length === 0) return { file, table, columns, key: [] };
  const noColumn = columns.find((column) => !standing.columns.includes(column));
  if (noColumn !== undefined) failAt(file.name, `os.${table} has no column ${noColumn}`);
  if (standing.key.length === 0) failAt(file.name, `os.${table} has no primary key`);
  const leftOut = standing.key.find((column) => !columns.includes(column));
  if (leftOut !== undefined) failAt(file.name, `the file does not carry the key column ${leftOut} of os.${table}`);
  return { file, table, columns, key: standing.key };
}

type Reference = { referencing: string; referenced: string };

// Every reference of a table of `os` to another table of `os`. A reference of a table to itself orders nothing.
const REFERENCES = `
select distinct a.relname::pg_catalog.text as referencing, b.relname::pg_catalog.text as referenced
  from pg_catalog.pg_constraint k
  join pg_catalog.pg_class a on a.oid = k.conrelid
  join pg_catalog.pg_class b on b.oid = k.confrelid
 where k.contype = 'f' and k.conrelid <> k.confrelid
   and a.relnamespace = pg_catalog.to_regnamespace('os') and b.relnamespace = pg_catalog.to_regnamespace('os')`;

/** Takes from `left`, again and again, its first vocabulary whose table is `free` by then; answers them as taken. */
function takenFrom(left: Map<string, Vocabulary>, free: (table: string) => boolean): Vocabulary[] {
  const taken: Vocabulary[] = [];
  for (;;) {
    const next = [...left.values()].find(({ table }) => free(table));
    if (next === undefined) return taken;
    left.delete(next.table);
    taken.push(next);
  }
}

/**
 * The vocabularies in the order their tables are written in: each after every table it references, ties by name.
 * Only a reference between two of these tables orders anything. When they cannot all be ordered, `circle` holds,
 * by name, those that reference each other in a circle: what is left once the tables with no reference left to
 * follow, and then the tables nothing left refers to, are taken away again and again — so a table that only leads
 * into a circle, or is only led to from one, is not among them.
 */
function writingOrder(vocabularies: readonly Vocabulary[], references: readonly Reference[]): { order: Vocabulary[]; circle: Vocabulary[] } {
  const byName = [...vocabularies].sort((one, other) => (one.table < other.table ? -1 : 1));
  const left = new Map(byName.map((vocabulary) => [vocabulary.table, vocabulary]));
  const order = takenFrom(left, (table) => !references.some((one) => one.referencing === table && left.has(one.referenced)));
  // Every table still left follows one that is left, and taking away one nothing refers to changes that of no other.
  takenFrom(left, (table) => !references.some((one) => one.referenced === table && left.has(one.referencing)));
  return { order, circle: [...left.values()] };
}

// A name reaches a statement quoted as an identifier, though each already passed the patterns of SPEC §4.
const quoted = (name: string): string => `"${name.replaceAll('"', '""')}"`;
const listed = (columns: readonly string[], of = ""): string => columns.map((column) => `${of}${quoted(column)}`).join(", ");
const tableOf = ({ table }: Vocabulary): string => `os.${quoted(table)}`;

/** The file's rows as the server reads them from its text, `$1`, whole: rows of the table's own type (SPEC §3). */
const filedRows = (vocabulary: Vocabulary): string => `pg_catalog.jsonb_populate_recordset(null::${tableOf(vocabulary)}, $1::pg_catalog.jsonb)`;

/**
 * Writes the file's rows: one that is not there is inserted, one that differs is changed in the file's columns,
 * and one already equal is not rewritten. Nothing, for an empty array: it has no row to write.
 */
function writing(vocabulary: Vocabulary): string | undefined {
  const { columns, key } = vocabulary;
  if (columns.length === 0) return undefined;
  const beside = columns.filter((column) => !key.includes(column));
  const changed = beside.map((column) => `${quoted(column)} = excluded.${quoted(column)}`).join(", ");
  const differs = `(${listed(beside, "t.")}) is distinct from (${listed(beside, "excluded.")})`;
  const onConflict = beside.length === 0 ? "do nothing" : `do update set ${changed} where ${differs}`;
  const rows = `select ${listed(columns, "f.")} from ${filedRows(vocabulary)} f`;
  return `insert into ${tableOf(vocabulary)} as t (${listed(columns)}) ${rows} on conflict (${listed(key)}) ${onConflict}`;
}

/** Removes every row whose key the file does not hold — for an empty array, which holds no row, every row. */
function removing(vocabulary: Vocabulary): string {
  const sameKey = vocabulary.key.map((column) => `f.${quoted(column)} = t.${quoted(column)}`).join(" and ");
  const ofThatKey = sameKey === "" ? "" : ` where ${sameKey}`;
  return `delete from ${tableOf(vocabulary)} t where not exists (select 1 from ${filedRows(vocabulary)} f${ofThatKey})`;
}

/** Whether the table, read in the file's columns, holds exactly the file's rows: as many, and none on one side alone. */
function proving(vocabulary: Vocabulary): string {
  const columns = listed(vocabulary.columns);
  const table = tableOf(vocabulary);
  const filed = filedRows(vocabulary);
  const asMany = `(select pg_catalog.count(*) from ${table}) = (select pg_catalog.count(*) from ${filed})`;
  if (vocabulary.columns.length === 0) return `select ${asMany} as equal`;
  const onlyStanding = `select ${columns} from ${table} except select ${columns} from ${filed}`;
  const onlyFiled = `select ${columns} from ${filed} except select ${columns} from ${table}`;
  return `select ${asMany} and not exists (${onlyStanding}) and not exists (${onlyFiled}) as equal`;
}

/**
 * The files of `reference/`, in the order given — by name — in one session and one transaction: every file judged
 * before any row of any table is written; then the rows written table by table, a table after every table it
 * references; then removed in the opposite order; then each table proved equal to its file. Answers how many files
 * the pass made equal, or how it ended instead: nothing of it is left then.
 */
export async function referencePass(inASession: InASession, files: readonly PassFile[]): Promise<number | NotGreen> {
  const ended = await inOnePass(inASession, async (conn) => {
    const vocabularies: Vocabulary[] = [];
    for (const file of files) vocabularies.push(await judged(conn, file));

    const { order, circle } = writingOrder(vocabularies, (await conn.query<Reference>(REFERENCES)).rows);
    const [first] = circle;
    const inTheCircle = circle.map(({ table }) => table).join(", ");
    if (first !== undefined) failAt(first.file.name, `the vocabularies reference each other in a circle: ${inTheCircle}`);

    // Each statement is its file's: the server's refusal of one is said at that file, with the server's message.
    const query = (statement: string, { file }: Vocabulary) => asTheFiles("reference", file.name, () => conn.query(statement, [file.text]));
    for (const vocabulary of order) {
      const statement = writing(vocabulary);
      if (statement !== undefined) await query(statement, vocabulary);
    }
    for (const vocabulary of order.toReversed()) await query(removing(vocabulary), vocabulary);
    // The proof (SPEC §5), inside the transaction, by name: a trigger may have rewritten a value, row security hidden a row.
    for (const vocabulary of vocabularies) {
      const { rows } = await query(proving(vocabulary), vocabulary);
      if (rows[0]?.equal !== true) failAt(vocabulary.file.name, `os.${vocabulary.table} does not equal its file after the pass`);
    }
  });
  return ended ?? files.length;
}
