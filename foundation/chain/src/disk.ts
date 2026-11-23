// The chain on the disk (SPEC §4): `<root>/schema`, read from the directory alone — no connection.
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ChainRefused, inOrder } from "./outcome.ts";
import type { Offence, OffenceKind } from "./outcome.ts";

export type ChainFile = { name: string; number: number; hash: string; text: string };

/** `schema/` is closed: every entry is a regular file of this name. The four digits are the file's number. */
const NAME = /^[0-9]{4}-[a-z0-9]+(-[a-z0-9]+)*\.sql$/;

/** The number a name carries. Only a name of the chain's pattern carries one; any other answers NaN. */
export const numberOf = (name: string): number => (NAME.test(name) ? Number(name.slice(0, 4)) : Number.NaN);

// Fatal, so that bytes which are no UTF-8 are an error and not a text with replacement characters in it;
// and a byte-order mark stays in the text — the text is the file's bytes, none of them dropped.
const UTF8 = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

/** A link is not a directory, and neither is what is not there. A path that cannot be looked at is an error, not an answer. */
function isADirectory(path: string): boolean {
  try {
    return lstatSync(path).isDirectory();
  } catch (failure) {
    const code = (failure as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ENOTDIR") return false;
    throw failure;
  }
}

/** What a file holds — its hash and its text — or the offence it is instead. */
function contentOf(path: string): { hash: string; text: string } | "empty" | "unreadable" {
  let bytes: Buffer;
  let text: string;
  try {
    bytes = readFileSync(path);
    text = UTF8.decode(bytes);
  } catch {
    return "unreadable";
  }
  if (text.trim() === "") return "empty";
  return { hash: createHash("sha256").update(bytes).digest("hex"), text };
}

/** One offence for each group of files that share what `keyOf` reads off them, their names in ascending order. */
function sharing<Named extends { name: string }>(kind: OffenceKind, files: readonly Named[], keyOf: (file: Named) => string | number): Offence[] {
  const namesByKey = new Map<string | number, string[]>();
  for (const file of files) {
    const key = keyOf(file);
    namesByKey.set(key, [...(namesByKey.get(key) ?? []), file.name]);
  }
  return [...namesByKey.values()].filter((names) => names.length > 1).map((names) => ({ kind, detail: names.sort().join(" ") }));
}

/** Reads `<root>/schema`. Files by number; the disk's own offences (SPEC §4). Throws ChainRefused("no-chain"). */
export function readChain(root: string): { files: ChainFile[]; offences: Offence[] } {
  const directory = join(root, "schema");
  if (!isADirectory(directory)) throw new ChainRefused("no-chain");

  const offences: Offence[] = [];
  const named: { name: string; number: number }[] = [];
  const files: ChainFile[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const { name } = entry;
    // isFile() is said of the entry itself: a link is no file, whatever it leads to.
    if (!entry.isFile() || !NAME.test(name)) {
      offences.push({ kind: "unknown-entry", detail: name });
      continue;
    }
    const number = numberOf(name);
    named.push({ name, number });
    const content = contentOf(join(directory, name));
    if (typeof content === "string") offences.push({ kind: content, detail: name });
    else files.push({ name, number, ...content });
  }
  // A number is in the name, whatever the file holds; a content is shared only by files that have one.
  offences.push(...sharing("duplicated-number", named, (file) => file.number));
  offences.push(...sharing("duplicated-content", files, (file) => file.hash));

  return { files: files.sort((one, other) => one.number - other.number || (one.name < other.name ? -1 : 1)), offences: inOrder(offences) };
}
