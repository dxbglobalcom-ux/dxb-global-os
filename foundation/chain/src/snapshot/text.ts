// The snapshot's text as text (piece 6a's SPEC §4.2, §5) — pure: its lines escaped and sorted, the difference of
// two texts, and whether a text is spelled as a snapshot is. The rows' text (piece 6b's SPEC §4) is the same form
// under its own first line, so the form's parts are spelled here once, for both.

/** The text's first line, alone of its kind. */
const FIRST_LINE = "snapshot-format 1";

/** Ascending by UTF-8 bytes — never by UTF-16 code units, the order of JavaScript's own sort. */
export const byBytes = (one: string, other: string): number => Buffer.compare(Buffer.from(one, "utf8"), Buffer.from(other, "utf8"));

/**
 * Inside a line a backslash is written `\\`, a newline `\n` and a carriage return `\r` (§4.2, §11.1 row 7): the line
 * stays one line, and what `snapshot` prints is always a text `--check` accepts. The backslash is doubled first, so a
 * stored backslash followed by `r` reads `\\r` and a carriage return `\r`.
 */
const escaped = (line: string): string => line.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll("\r", "\\r");

/** What each escape of `escaped` stands for. */
const ESCAPES = new Map([
  ["\\", "\\"],
  ["n", "\n"],
  ["r", "\r"],
]);

/**
 * A line as it was before `escaped`, or nothing when it is no escaped line: there every backslash begins one of the
 * three escapes, read pair by pair from the left, so `\\n` is a backslash and an `n`.
 */
export function unescaped(line: string): string | undefined {
  let foreign = false;
  const raw = line.replaceAll(/\\([\s\S]?)/g, (_escape, next: string) => {
    const said = ESCAPES.get(next);
    if (said === undefined) foreign = true;
    return said ?? "";
  });
  return foreign ? undefined : raw;
}

/** A text of the form (§4.2) under `first`: the first line, then every line escaped and sorted by its bytes, equal lines kept; each ends with `\n`. */
export function textHeadedBy(first: string, lines: readonly string[]): string {
  return [first, ...lines.map(escaped).sort(byBytes)].map((line) => `${line}\n`).join("");
}

/** The snapshot's text of these lines (§4.2). */
export const textOf = (lines: readonly string[]): string => textHeadedBy(FIRST_LINE, lines);

/** The lines of a text, split at `\n` alone: a text that ends with its newline has an empty last part. */
const partsOf = (text: string): string[] => text.split("\n");

/**
 * Pure. The lines of `expected` that `actual` does not hold, and the other way round — as multisets: a line held
 * twice against once is on its side once. Each list sorted by bytes (SPEC §5). A missing final newline is a
 * difference, since the empty last part is a line of one text and not of the other (§6a.9).
 */
export function differenceOf(expected: string, actual: string): { expectedOnly: string[]; actualOnly: string[] } {
  const held = new Map<string, number>();
  for (const line of partsOf(actual)) held.set(line, (held.get(line) ?? 0) + 1);
  const expectedOnly: string[] = [];
  for (const line of partsOf(expected)) {
    const left = held.get(line) ?? 0;
    if (left > 0) held.set(line, left - 1);
    else expectedOnly.push(line);
  }
  const actualOnly = [...held].flatMap(([line, count]) => Array.from({ length: count }, () => line));
  return { expectedOnly: expectedOnly.sort(byBytes), actualOnly: actualOnly.sort(byBytes) };
}

/** `bytes` read as UTF-8, or nothing when they are not UTF-8. A byte-order mark is kept as a character, never skipped. */
export function utf8Of(bytes: Uint8Array): string | undefined {
  try {
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    return undefined;
  }
}

/**
 * Whether `text` is of the form (SPEC §5) under `first`: no `\r`; a final newline; the first line `first`; no empty
 * line; the lines after the first ascending by their bytes, equal lines side by side.
 */
export function isFormedUnder(first: string, text: string): boolean {
  if (text.includes("\r") || !text.endsWith("\n")) return false;
  const [head, ...rest] = partsOf(text.slice(0, -1));
  if (head !== first || rest.includes("")) return false;
  return rest.every((line, at) => at === 0 || byBytes(rest[at - 1] ?? "", line) <= 0);
}

/** Whether `bytes` are a snapshot's spelling (SPEC §5): UTF-8, and of the form under `snapshot-format 1`. */
export function isSpelledAsASnapshot(bytes: Uint8Array): boolean {
  const text = utf8Of(bytes);
  return text !== undefined && isFormedUnder(FIRST_LINE, text);
}

/**
 * Lines only in what was before as `- <line>`, lines only in what is now as `+ <line>`: all sorted by the line's
 * bytes, `-` before `+` for one line (SPEC §5) — the order of the check's difference and of piece 6b's `lost` and `back`.
 */
export function signedInOrder(minus: readonly string[], plus: readonly string[]): string[] {
  const marked = [...minus.map((line) => ({ sign: "-", line })), ...plus.map((line) => ({ sign: "+", line }))];
  // A stable sort: the minus lines stand first in `marked`, so for one line they stay first.
  marked.sort((one, other) => byBytes(one.line, other.line));
  return marked.map(({ sign, line }) => `${sign} ${line}`);
}

/**
 * What the check prints of a difference (SPEC §5): every line only in the file as `- <line>`, every line only in
 * the database as `+ <line>`, in `signedInOrder`; then the verdict.
 */
export function redLines({ expectedOnly, actualOnly }: { expectedOnly: string[]; actualOnly: string[] }): string[] {
  return [...signedInOrder(expectedOnly, actualOnly), `SNAPSHOT_RED expected_only=${expectedOnly.length} database_only=${actualOnly.length}`];
}
