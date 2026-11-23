// The two passes on the disk (piece 4's SPEC §4): `<root>/functions` and `<root>/reference`, read from the directories alone.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { contentOf, standingAt } from "./disk.ts";
import { inOrder } from "./outcome.ts";
import type { Offence, OffenceKind } from "./outcome.ts";

/** A file of a pass: the entry's name, extension included, and its text. */
export type PassFile = { name: string; text: string };

/** What a file's name says without its ending: the function it holds, or the vocabulary's table. */
export const namedBy = (file: PassFile): string => file.name.slice(0, file.name.lastIndexOf("."));

/** A key of a reference file's rows: a column the file owns. */
const COLUMN = /^[a-z][a-z0-9_]{0,62}$/;

/** The keys a row carries, by name — its own, not nested ones. `null` and an array are no rows. */
const keysOf = (row: unknown): string[] | undefined => (typeof row === "object" && row !== null && !Array.isArray(row) ? Object.keys(row).sort() : undefined);

/**
 * The columns a reference file owns, by name: the keys its rows carry, the same set in every row — none when the
 * array is empty. Undefined when the text is not what `reference/` asks: not JSON, not an array, an element that
 * is not an object, an object of no keys, a key off the pattern, two objects of different keys.
 * Only the shape is read here: the values are the server's to read, from the text as it is.
 */
export function columnsOf(text: string): string[] | undefined {
  let rows: unknown;
  try {
    rows = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (!Array.isArray(rows)) return undefined;
  if (rows.length === 0) return [];
  const [first, ...others] = rows.map(keysOf);
  if (first === undefined || first.length === 0 || !first.every((key) => COLUMN.test(key))) return undefined;
  const asTheFirst = (keys: string[] | undefined): boolean => keys?.length === first.length && keys.every((key, at) => key === first[at]);
  return others.every(asTheFirst) ? first : undefined;
}

// White space before a function file's statement and between its words: the ASCII space, tab, line feed and carriage
// return, nothing else — a byte-order mark is none (SPEC §12a).
const BLANK = "[ \\t\\n\\r]";

/**
 * Whether a function file begins with its own function (SPEC §12.1): its text, after white space and `--` comments,
 * begins with `create or replace function os.<name>(` — or `procedure`, or `aggregate` — so the first statement the
 * server executes of it sets its function's body. Any case, the schema's and the name's too, as the server folds
 * them; any white space between the words and before the bracket, none inside `os.<name>`.
 */
function beginsWithItsOwn(file: PassFile): boolean {
  // One pattern, built from the file's name — which passed the directory's pattern, so it holds nothing a pattern
  // reads as more than itself. A comment ends where the server ends it, at a line feed or a carriage return, and
  // is taken whole. Without the `u` flag `i` folds the ASCII letters alone, as the server does: `ſ` is no `s`.
  const pattern = new RegExp(
    `^(?:${BLANK}|--[^\\n\\r]*(?=[\\n\\r]|$))*create${BLANK}+or${BLANK}+replace${BLANK}+(?:function|procedure|aggregate)${BLANK}+os\\.${namedBy(file)}${BLANK}*\\(`,
    "i",
  );
  return pattern.test(file.text);
}

/** What each directory asks of an entry: a regular file of this name — and what a file of no text, and a text, is there. */
const ASKED: Record<"functions" | "reference", { name: RegExp; empty: OffenceKind; wellFormed: (file: PassFile) => boolean }> = {
  functions: { name: /^[a-z][a-z0-9_]{0,62}\.sql$/, empty: "empty", wellFormed: beginsWithItsOwn },
  // A file of no bytes, or of white space only, is no JSON array either.
  reference: { name: /^[a-z][a-z0-9_]{0,62}\.json$/, empty: "malformed", wellFormed: ({ text }) => columnsOf(text) !== undefined },
};

/** The one name git needs to deliver a directory that holds no file yet (SPEC §12.12). */
const KEPT_FOR_GIT = ".gitkeep";

/** One of the two directories: its files by name — none said when it does not stand — and its offences. */
function read(root: string, directory: "functions" | "reference"): { files?: PassFile[]; offences: Offence[] } {
  const path = join(root, directory);
  const standing = standingAt(path);
  if (standing === "nothing") return { offences: [] };
  if (standing !== "directory") return { offences: [{ kind: "unknown-entry", detail: directory }] };

  const asked = ASKED[directory];
  const offences: Offence[] = [];
  const files: PassFile[] = [];
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const { name } = entry;
    const detail = `${directory}/${name}`;
    // A regular file of that name is passed over: no file of the pass, no offence, its content not read.
    if (entry.isFile() && name === KEPT_FOR_GIT) continue;
    // isFile() is said of the entry itself: a link is no file, whatever it leads to.
    if (!entry.isFile() || !asked.name.test(name)) {
      offences.push({ kind: "unknown-entry", detail });
      continue;
    }
    const content = contentOf(join(path, name));
    if (content === "unreadable") offences.push({ kind: "unreadable", detail });
    else if (content === "empty") offences.push({ kind: asked.empty, detail });
    else {
      const file = { name, text: content.text };
      if (asked.wellFormed(file)) files.push(file);
      else offences.push({ kind: "malformed", detail });
    }
  }
  // By code unit, so the order hangs on no locale; a directory holds no name twice.
  return { files: files.sort((one, other) => (one.name < other.name ? -1 : 1)), offences };
}

/**
 * Reads `<root>/functions` and `<root>/reference` — each when it stands; its key is absent when it does not.
 * Files by name; the offences of SPEC §4. Never throws for a root that holds neither, or does not exist.
 */
export function readPasses(root: string): { functions?: PassFile[]; reference?: PassFile[]; offences: Offence[] } {
  const functions = read(root, "functions");
  const reference = read(root, "reference");
  return {
    // An absent key is not there at all — not `undefined` (SPEC §9a).
    ...(functions.files !== undefined && { functions: functions.files }),
    ...(reference.files !== undefined && { reference: reference.files }),
    offences: inOrder([...functions.offences, ...reference.offences]),
  };
}
