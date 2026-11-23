// The snapshot's text as text (piece 6a's SPEC §4.2, §5) — pure: its lines escaped and sorted, the difference of
// two texts, and whether a text is spelled as a snapshot is.

/** The text's first line, alone of its kind. */
const FIRST_LINE = "snapshot-format 1";

/** Ascending by UTF-8 bytes — never by UTF-16 code units, the order of JavaScript's own sort. */
const byBytes = (one: string, other: string): number => Buffer.compare(Buffer.from(one, "utf8"), Buffer.from(other, "utf8"));

/** Inside a line a backslash is written `\\` and a newline `\n` (§4.2): the line stays one line. */
const escaped = (line: string): string => line.replaceAll("\\", "\\\\").replaceAll("\n", "\\n");

/** The text of these lines (§4.2): the first line, then every line escaped and sorted by its bytes, equal lines kept; each ends with `\n`. */
export function textOf(lines: readonly string[]): string {
  return [FIRST_LINE, ...lines.map(escaped).sort(byBytes)].map((line) => `${line}\n`).join("");
}

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

/**
 * Whether `bytes` are a snapshot's spelling (SPEC §5): UTF-8; no `\r`; a final newline; the first line
 * `snapshot-format 1`; no empty line; the lines after the first ascending by their bytes, equal lines side by side.
 */
export function isSpelledAsASnapshot(bytes: Uint8Array): boolean {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    return false;
  }
  if (text.includes("\r") || !text.endsWith("\n")) return false;
  const [first, ...rest] = partsOf(text.slice(0, -1));
  if (first !== FIRST_LINE || rest.includes("")) return false;
  return rest.every((line, at) => at === 0 || byBytes(rest[at - 1] ?? "", line) <= 0);
}

/**
 * What the check prints of a difference (SPEC §5): every line only in the file as `- <line>`, every line only in
 * the database as `+ <line>`, all sorted by the line's bytes, `-` before `+` for one line; then the verdict.
 */
export function redLines({ expectedOnly, actualOnly }: { expectedOnly: string[]; actualOnly: string[] }): string[] {
  const marked = [...expectedOnly.map((line) => ({ sign: "-", line })), ...actualOnly.map((line) => ({ sign: "+", line }))];
  // A stable sort: the minus lines stand first in `marked`, so for one line they stay first.
  marked.sort((one, other) => byBytes(one.line, other.line));
  return [...marked.map(({ sign, line }) => `${sign} ${line}`), `SNAPSHOT_RED expected_only=${expectedOnly.length} database_only=${actualOnly.length}`];
}
