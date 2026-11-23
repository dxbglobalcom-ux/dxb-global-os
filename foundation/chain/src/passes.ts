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

/** What each directory asks of an entry: a regular file of this name — and what a file of no text, and a text, is there. */
const ASKED: Record<"functions" | "reference", { name: RegExp; empty: OffenceKind; wellFormed: (text: string) => boolean }> = {
  functions: { name: /^[a-z][a-z0-9_]{0,62}\.sql$/, empty: "empty", wellFormed: () => true },
  // A file of no bytes, or of white space only, is no JSON array either.
  reference: { name: /^[a-z][a-z0-9_]{0,62}\.json$/, empty: "malformed", wellFormed: (text) => columnsOf(text) !== undefined },
};

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
    // isFile() is said of the entry itself: a link is no file, whatever it leads to.
    if (!entry.isFile() || !asked.name.test(name)) {
      offences.push({ kind: "unknown-entry", detail });
      continue;
    }
    const content = contentOf(join(path, name));
    if (content === "unreadable") offences.push({ kind: "unreadable", detail });
    else if (content === "empty") offences.push({ kind: asked.empty, detail });
    else if (!asked.wellFormed(content.text)) offences.push({ kind: "malformed", detail });
    else files.push({ name, text: content.text });
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
