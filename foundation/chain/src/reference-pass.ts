// The reference pass (piece 4's SPEC §5, §6 step 9): every vocabulary made equal to its file — judged, ordered, written, removed, proved.
import type { AssertHeld } from "./lock.ts";
import { asTheFiles, becomingTheOwnerOfOs, inOnePass } from "./one-pass.ts";
import type { NotGreen } from "./one-pass.ts";
import type { PassFile } from "./passes.ts";
import { failAt, filedRows, judged, ofTheFile, quoted, tableOf } from "./reference-judgement.ts";
import type { Vocabulary } from "./reference-judgement.ts";
import type { InASession } from "./session.ts";

// What the pass's transaction says of itself, first (SPEC §12.8, §12.6): what is deferred happens inside the pass —
// a deferred reference's refusal comes at the statement, a deferred trigger has run before the proof reads; a
// statement row security would filter is refused, not answered with fewer rows; and a time the file writes without
// an offset is the same instant on every database; and a float reads with every digit it holds — a server that
// says `extra_float_digits = 0`, as the bench's does, reads `0.1 + 0.2` as `0.3`, and "reads the same" would lie.
const ITS_OWN_SETTINGS = [
  "set constraints all immediate",
  "set local row_security = off",
  "set local timezone = 'UTC'",
  "set local datestyle = 'ISO, YMD'",
  "set local extra_float_digits = 1",
];

type Reference = { referencing: string; referenced: string };

// Every reference of one of these tables of `os` — `$1`, the tables that have a file — to another of them: only
// such a reference orders anything, or makes a circle. A reference of a table to itself orders nothing.
const REFERENCES = `
select distinct a.relname::pg_catalog.text as referencing, b.relname::pg_catalog.text as referenced
  from pg_catalog.pg_constraint k
  join pg_catalog.pg_class a on a.oid = k.conrelid
  join pg_catalog.pg_class b on b.oid = k.confrelid
 where k.contype = 'f' and k.conrelid <> k.confrelid
   and a.relnamespace = pg_catalog.to_regnamespace('os') and b.relnamespace = pg_catalog.to_regnamespace('os')
   and a.relname::pg_catalog.text = any ($1::pg_catalog.text[]) and b.relname::pg_catalog.text = any ($1::pg_catalog.text[])`;

/** The tables `from` leads to, by one of these references or by several in a row. */
function reachedFrom(from: string, references: readonly Reference[]): Set<string> {
  const reached = new Set<string>();
  const toFollow = [from];
  for (let table = toFollow.pop(); table !== undefined; table = toFollow.pop()) {
    for (const { referencing, referenced } of references) {
      if (referencing !== table || reached.has(referenced)) continue;
      reached.add(referenced);
      toFollow.push(referenced);
    }
  }
  return reached;
}

/** By their tables' names, by code unit; a pass holds no table twice. */
const byName = (vocabularies: readonly Vocabulary[]): Vocabulary[] => [...vocabularies].sort((one, other) => (one.table < other.table ? -1 : 1));

/**
 * The vocabularies, by name, of the circle that is said (SPEC §12.11) — none when no tables reference each other
 * in a circle. Tables are in one circle when each leads to the other: a table on a path between two circles, one
 * that only leads into a circle and one that is only led to from one are in none. Of several circles, the one that
 * holds the first table by name of all the tables in circles.
 */
function circleAmong(vocabularies: readonly Vocabulary[], references: readonly Reference[]): Vocabulary[] {
  const first = byName(vocabularies).find(({ table }) => reachedFrom(table, references).has(table));
  if (first === undefined) return [];
  const ledToFromIt = reachedFrom(first.table, references);
  return byName(vocabularies).filter(({ table }) => ledToFromIt.has(table) && reachedFrom(table, references).has(first.table));
}

/**
 * The vocabularies in the order their tables are written in: each after every table it references, ties by name.
 * For tables among which no circle stands: every one is taken.
 */
function writingOrder(vocabularies: readonly Vocabulary[], references: readonly Reference[]): Vocabulary[] {
  const left = new Map(byName(vocabularies).map((vocabulary) => [vocabulary.table, vocabulary]));
  const order: Vocabulary[] = [];
  for (;;) {
    const next = [...left.values()].find(({ table }) => !references.some((one) => one.referencing === table && left.has(one.referenced)));
    if (next === undefined) return order;
    left.delete(next.table);
    order.push(next);
  }
}

const listed = (columns: readonly string[], of = ""): string => columns.map((column) => `${of}${quoted(column)}`).join(", ");

/**
 * The columns as they are compared wherever two values decide a write or prove (SPEC §12.6, §12a): each as its
 * text, byte by byte — equal means reads the same. A plain cast keeps the column's collation, under which two
 * texts that read differently can be equal.
 */
const asRead = (columns: readonly string[], of = ""): string => columns.map((column) => `${of}${quoted(column)}::pg_catalog.text collate pg_catalog."C"`).join(", ");

/** A row of the file and a row of the table are of one key: matched by the type's own `=`, as the primary key does. */
const ofOneKey = ({ key }: Vocabulary): string => key.map((column) => `f.${quoted(column)} = t.${quoted(column)}`).join(" and ");

/**
 * Changes, in the file's columns beside the key, the rows that are there and read differently. Nothing, for a file
 * that owns no column beside its key — an empty array among them.
 */
function changing(vocabulary: Vocabulary): string | undefined {
  const beside = vocabulary.columns.filter((column) => !vocabulary.key.includes(column));
  if (beside.length === 0) return undefined;
  const changed = beside.map((column) => `${quoted(column)} = f.${quoted(column)}`).join(", ");
  const readsDifferently = `(${asRead(beside, "t.")}) is distinct from (${asRead(beside, "f.")})`;
  return `update only ${tableOf(vocabulary)} t set ${changed} from ${filedRows(vocabulary)} f where ${ofOneKey(vocabulary)} and ${readsDifferently}`;
}

/** Inserts the file's rows whose key is not there. Nothing, for an empty array: it has no row to write. */
function adding(vocabulary: Vocabulary): string | undefined {
  const { columns } = vocabulary;
  if (columns.length === 0) return undefined;
  const table = tableOf(vocabulary);
  const notThere = `not exists (select 1 from only ${table} t where ${ofOneKey(vocabulary)})`;
  return `insert into ${table} (${listed(columns)}) select ${listed(columns, "f.")} from ${filedRows(vocabulary)} f where ${notThere}`;
}

/** Removes every row whose key the file does not hold — for an empty array, which holds no row, every row. */
function removing(vocabulary: Vocabulary): string {
  const ofThatKey = vocabulary.key.length === 0 ? "" : ` where ${ofOneKey(vocabulary)}`;
  return `delete from only ${tableOf(vocabulary)} t where not exists (select 1 from ${filedRows(vocabulary)} f${ofThatKey})`;
}

/** Whether the table, read in the file's columns, holds exactly the file's rows: as many, and none on one side alone. */
function proving(vocabulary: Vocabulary): string {
  const columns = asRead(vocabulary.columns);
  const table = `only ${tableOf(vocabulary)}`;
  const filed = filedRows(vocabulary);
  const asMany = `(select pg_catalog.count(*) from ${table}) = (select pg_catalog.count(*) from ${filed})`;
  if (vocabulary.columns.length === 0) return `select ${asMany} as equal`;
  const onlyStanding = `select ${columns} from ${table} except select ${columns} from ${filed}`;
  const onlyFiled = `select ${columns} from ${filed} except select ${columns} from ${table}`;
  return `select ${asMany} and not exists (${onlyStanding}) and not exists (${onlyFiled}) as equal`;
}

/**
 * The files of `reference/`, in the order given — by name — in one session and one transaction: every file judged
 * before any row of any table is written, and then the circle looked for; then table by table, a table after every
 * table it references, each compared first — one that already reads as its file is sent no statement (SPEC §12.7),
 * the others are changed and added to; then the tables written to have their rows removed, in the opposite order;
 * then each table is proved equal to its file. Answers how many files the pass made equal, or how it ended
 * instead: nothing of it is left then. `assertHeld` is asked as the pass's last act, before its commit.
 */
export async function referencePass(inASession: InASession, files: readonly PassFile[], assertHeld: AssertHeld): Promise<number | NotGreen> {
  const ended = await inOnePass(inASession, assertHeld, async (conn) => {
    for (const setting of ITS_OWN_SETTINGS) await conn.query(setting);
    // As the owner of `os`, before anything is read or written (piece 5's SPEC §5): a row the pass writes is the
    // owner's, and what it reads is what the owner sees — the installer reads `os` through `pg_read_all_data` and
    // bypasses row security, the owner does neither (piece 5's SPEC §3). The server's refusal is said at the first file by
    // name; a pass of no file reads and writes nothing, and says nothing either.
    const [firstFile] = files;
    const asTheOwner = await becomingTheOwnerOfOs(conn, "set local role");
    if (firstFile !== undefined && asTheOwner !== undefined) await asTheFiles("reference", firstFile.name, () => conn.query(asTheOwner));

    const vocabularies: Vocabulary[] = [];
    for (const file of files) vocabularies.push(await judged(conn, file));

    const references = (await conn.query<Reference>(REFERENCES, [vocabularies.map(({ table }) => table)])).rows;
    const circle = circleAmong(vocabularies, references);
    const [first] = circle;
    const inTheCircle = circle.map(({ table }) => table).join(", ");
    if (first !== undefined) failAt(first.file.name, `the vocabularies reference each other in a circle: ${inTheCircle}`);

    // Each statement is its file's: the server's refusal of one is said at that file, with the server's message.
    const readsAsItsFile = async (vocabulary: Vocabulary): Promise<boolean> => (await ofTheFile(conn, vocabulary.file, proving(vocabulary))).rows[0]?.equal === true;
    const writtenTo: Vocabulary[] = [];
    for (const vocabulary of writingOrder(vocabularies, references)) {
      if (await readsAsItsFile(vocabulary)) continue;
      for (const statement of [changing(vocabulary), adding(vocabulary)]) {
        if (statement !== undefined) await ofTheFile(conn, vocabulary.file, statement);
      }
      writtenTo.push(vocabulary);
    }
    for (const vocabulary of writtenTo.toReversed()) await ofTheFile(conn, vocabulary.file, removing(vocabulary));
    // The proof (SPEC §5), inside the transaction, by name: a trigger may have rewritten a value, row security hidden a row.
    for (const vocabulary of vocabularies) {
      if (!(await readsAsItsFile(vocabulary))) failAt(vocabulary.file.name, `os.${vocabulary.table} does not equal its file after the pass`);
    }
  });
  return ended ?? files.length;
}
