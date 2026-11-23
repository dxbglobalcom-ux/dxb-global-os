// The rows' text as text (piece 6b's SPEC §4, §5) — pure: whether a text is one, and "kept" — every row the earlier
// text holds still held, column for column, and no sequence standing behind where it stood.
import { byBytes, isFormedUnder, signedInOrder, unescaped } from "../snapshot/text.ts";
import { membersOfARow } from "./json.ts";

/** The rows' text's first line (§4), alone of its kind. */
export const ROWS_FIRST_LINE = "rows-format 1";

/** A `row` line: its table, and each of its own keys with its value's text as it stands (json.ts). */
type Row = { line: string; table: string; members: Map<string, string> };

/** A `sequence-position` line, its `last_value` as an integer of any size — never a double. */
type Position = { line: string; sequence: string; last: bigint; called: boolean; ascending: boolean };

/** A rows' text read: its rows by table and its positions by sequence, each in the text's order. */
type Read = { rows: Map<string, Row[]>; positions: Map<string, Position[]> };

// A part of a name that `regclass` leaves unquoted (§10.1 row 6): what `quote_ident` calls safe, the letters alone —
// a reserved word is not asked after (§10.3.5).
const UNQUOTED = /[a-z_][a-z0-9_]*/y;

/**
 * Where the name that begins at `from` ends: a name as `regclass` spells it — parts joined by `.`, each a quoted
 * identifier (`""` inside it is one quote, and it may hold a space, a dot or a newline) or an unquoted one of
 * UNQUOTED's letters. Nothing when no name begins there.
 */
function nameEnd(raw: string, from: number): number | undefined {
  let at = from;
  for (;;) {
    if (raw[at] === '"') {
      for (at += 1; ; at += 2) {
        at = raw.indexOf('"', at);
        if (at < 0) return undefined;
        if (raw[at + 1] !== '"') break;
      }
      at += 1;
    } else {
      UNQUOTED.lastIndex = at;
      if (!UNQUOTED.test(raw)) return undefined;
      at = UNQUOTED.lastIndex;
    }
    if (raw[at] !== ".") return at;
    at += 1;
  }
}

/** A line's kind word, then its name and what follows the name's space; nothing when the line is not so spelled. */
function namedAfter(raw: string, kind: string): { name: string; rest: string } | undefined {
  if (!raw.startsWith(`${kind} `)) return undefined;
  const end = nameEnd(raw, kind.length + 1);
  if (end === undefined || raw[end] !== " ") return undefined;
  return { name: raw.slice(kind.length + 1, end), rest: raw.slice(end + 1) };
}

// `last_value` in the one spelling the server prints a bigint in (§10.1 row 6): `0`, or no leading zero — and no `-0`.
const POSITION = /^(0|-?[1-9]\d*) called ([tf]) ascending ([tf])$/;

/** A line of the text, as it stands there, read as one of §4's two kinds; nothing when it is of neither. */
function lineOf(line: string): Row | Position | undefined {
  const raw = unescaped(line);
  if (raw === undefined) return undefined;
  const row = namedAfter(raw, "row");
  if (row !== undefined) {
    const members = membersOfARow(row.rest);
    return members === undefined ? undefined : { line, table: row.name, members };
  }
  const named = namedAfter(raw, "sequence-position");
  const [, last, called, ascending] = (named && POSITION.exec(named.rest)) ?? [];
  if (named === undefined || last === undefined) return undefined;
  return { line, sequence: named.name, last: BigInt(last), called: called === "t", ascending: ascending === "t" };
}

/** Appended to the list `key` holds in `map`. */
function filed<T>(map: Map<string, T[]>, key: string, value: T): void {
  const list = map.get(key);
  if (list === undefined) map.set(key, [value]);
  else list.push(value);
}

/**
 * The lines of `text` after its first, each read as one of §4's two kinds in the escapes of the form (6a §4.2) and
 * filed in the order of their bytes — whatever order the text gives them in, so that what is read of it hangs on no
 * order; nothing when the first line is not `rows-format 1` or a line is of neither kind. The rest of the form is
 * `isARowsText`'s.
 */
function linesRead(text: string): Read | undefined {
  const [first, ...lines] = (text.endsWith("\n") ? text.slice(0, -1) : text).split("\n");
  if (first !== ROWS_FIRST_LINE) return undefined;
  const read: Read = { rows: new Map(), positions: new Map() };
  for (const line of lines.sort(byBytes)) {
    const said = lineOf(line);
    if (said === undefined) return undefined;
    if ("table" in said) filed(read.rows, said.table, said);
    else filed(read.positions, said.sequence, said);
  }
  return read;
}

/**
 * Whether `text` is a rows' text (§5's table): 6a's form under `rows-format 1`, and every line after the first a
 * `row` of one JSON object or a `sequence-position` of its shape (§4). A line held twice is well formed: rows are a
 * multiset.
 */
export const isARowsText = (text: string): boolean => isFormedUnder(ROWS_FIRST_LINE, text) && linesRead(text) !== undefined;

/**
 * The rows of `before` that no row of `after` answers for, and the rows of `after` that answer for none — one table's.
 * A row of `after` answers for a row of `before` when it holds each of its keys with the same text; each answers
 * for one at most. The most rows of `before` are answered for — a matching of most edges — and which ones hangs on
 * no order the texts gave: both lists come in the order of their bytes (`linesRead`), equal rows side by side.
 */
function unanswered(before: readonly Row[], after: readonly Row[]): { lost: Row[]; unused: Row[] } {
  // A row's keys and values, as one string, against the after rows that hold the same under those keys: rows with one
  // set of keys — every row of one table that the server printed at one time — share their lists.
  const projected = (row: Row, keys: readonly string[]): string | undefined => {
    const values = keys.map((key) => row.members.get(key));
    return values.includes(undefined) ? undefined : JSON.stringify(values);
  };
  const byKeys = new Map<string, Map<string, { rows: number[]; next: number }>>();
  const candidates = before.map((row) => {
    const keys = [...row.members.keys()].sort(byBytes);
    const signature = JSON.stringify(keys);
    let lists = byKeys.get(signature);
    if (lists === undefined) {
      lists = new Map();
      for (const [at, now] of after.entries()) {
        const values = projected(now, keys);
        if (values === undefined) continue;
        const list = lists.get(values);
        if (list === undefined) lists.set(values, { rows: [at], next: 0 });
        else list.rows.push(at);
      }
      byKeys.set(signature, lists);
    }
    return lists.get(projected(row, keys) ?? "") ?? { rows: [], next: 0 };
  });
  const answeredBy = before.map(() => -1);
  const answersFor = after.map(() => -1);
  // First, each row takes the first row of its list not yet taken. With one set of keys the lists do not overlap and
  // this is already the most; the cursor skips what a row of another set of keys took.
  for (const [at, list] of candidates.entries()) {
    while (list.next < list.rows.length && answersFor[list.rows[list.next] ?? 0] !== -1) list.next += 1;
    const now = list.rows[list.next];
    if (now === undefined) continue;
    answeredBy[at] = now;
    answersFor[now] = at;
    list.next += 1;
  }
  // Then, only where sets of keys differ (a hand-written text), every row still unanswered seeks a path that frees one.
  if (byKeys.size > 1) {
    const reachable = candidates.map((list) => list.rows);
    for (const at of before.keys()) if (answeredBy[at] === -1) freePath(at, reachable, answeredBy, answersFor);
  }
  return { lost: before.filter((_row, at) => answeredBy[at] === -1), unused: after.filter((_row, at) => answersFor[at] === -1) };
}

/**
 * Breadth first from the unanswered row `start`: through an after row it could take, to the before row that holds
 * it, and on — until an after row no one holds; then every row along the path takes the next one. Iterative: no
 * depth of rows reaches the stack.
 */
function freePath(start: number, candidates: readonly number[][], answeredBy: number[], answersFor: number[]): void {
  const reachedFrom = new Map<number, number>();
  const queue = [start];
  for (let head = 0; head < queue.length; head += 1) {
    const from = queue[head] ?? start;
    for (const now of candidates[from] ?? []) {
      if (reachedFrom.has(now)) continue;
      reachedFrom.set(now, from);
      const holder = answersFor[now] ?? -1;
      if (holder !== -1) {
        queue.push(holder);
        continue;
      }
      for (let free = now, taker = from; ; ) {
        const given = answeredBy[taker] ?? -1;
        answeredBy[taker] = free;
        answersFor[free] = taker;
        if (taker === start) return;
        free = given;
        taker = reachedFrom.get(given) ?? start;
      }
    }
  }
}

/**
 * Whether `now` stands behind `was` (§5): turned round — whatever its `last_value`, a sequence whose direction changed
 * gives again what it gave (§10.1 row 1) —, or by `was`'s direction `last_value` back, or at the same `called` t to f.
 */
function behind(was: Position, now: Position): boolean {
  if (now.ascending !== was.ascending) return true;
  if (now.last === was.last) return was.called && !now.called;
  return was.ascending ? now.last < was.last : now.last > was.last;
}

/** What `keptOf` answers (§5): the lines that say what was lost or went back, and the counts of `before`'s lines. */
export type Kept = { lost: string[]; back: string[]; rows: number; sequences: number };

/**
 * Pure (SPEC §5). `lost`: each row of `before` no row of `after` answers for, and for each table that lost a row
 * every row of `after` in it that answered for none; `back`: each position of `before` that `after` holds none
 * level with or further on, and every line `after` holds of that sequence. Each list in `signedInOrder`. The order
 * of a text's lines is not asked; it throws only when a first line is not `rows-format 1` or a line after it is of
 * neither kind of §4 — never on two rows' texts.
 */
export function keptOf(before: string, after: string): Kept {
  const was = linesRead(before);
  const now = linesRead(after);
  if (was === undefined || now === undefined) throw new RangeError("keptOf: a text whose lines are not a rows' text's (piece 6b's SPEC §4)");
  const lost: string[] = [];
  const answeredNone: string[] = [];
  for (const [table, rows] of was.rows) {
    const { lost: lostHere, unused } = unanswered(rows, now.rows.get(table) ?? []);
    if (lostHere.length === 0) continue;
    // One by one, never spread into `push`'s arguments: a table of 150,000 rows would overflow the stack (§10.1 row 8).
    for (const row of lostHere) lost.push(row.line);
    for (const row of unused) answeredNone.push(row.line);
  }
  const back: string[] = [];
  const whereNow: string[] = [];
  for (const [sequence, positions] of was.positions) {
    const lines = now.positions.get(sequence) ?? [];
    const behindHere = positions.filter((position) => lines.every((line) => behind(position, line)));
    if (behindHere.length === 0) continue;
    for (const position of behindHere) back.push(position.line);
    for (const line of lines) whereNow.push(line.line);
  }
  const count = (map: Map<string, unknown[]>): number => [...map.values()].reduce((sum, list) => sum + list.length, 0);
  return { lost: signedInOrder(lost, answeredNone), back: signedInOrder(back, whereNow), rows: count(was.rows), sequences: count(was.positions) };
}
