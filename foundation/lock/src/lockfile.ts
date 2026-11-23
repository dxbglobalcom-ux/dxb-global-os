// The lock file (SPEC §4): its shape, its one text, and what a new lock changes
// against the one before it. Pure — nothing here reads or writes.
import type { LockFile, LockedCase } from "./index.ts";
import { isListOf, isObject, isText, isTexts, readJson } from "./shape.ts";

/** The lead's records: the inventory and one lock file per locked piece. */
export const LOCKS_DIRECTORY = "foundation/locks";
export const INVENTORY_PATH = `${LOCKS_DIRECTORY}/inventory.json`;
export const lockPathOf = (piece: string): string => `${LOCKS_DIRECTORY}/${piece}.json`;

/** The piece a path under the records names, when the path is a lock file's. */
export function pieceOfLockPath(path: string): string | undefined {
  const [, piece] = /^foundation\/locks\/([^/]+)\.json$/.exec(path) ?? [];
  return path === INVENTORY_PATH ? undefined : piece;
}

type Place = { file: string; suite: readonly string[]; name: string };

/** One text per place of a case — its file, its suite path, its name: equal texts, the same place. */
export const caseKey = (of: Place): string => JSON.stringify([of.file, of.suite, of.name]);

/** A case as a reader is told of it: the file, then the suites from the outermost, then the name. */
export const caseTitle = (of: Place): string => [of.file, ...of.suite, of.name].join(" > ");

/** How many cases a lock holds: every place as many times as its count. */
export const caseCount = (cases: readonly LockedCase[]): number => cases.reduce((sum, locked) => sum + locked.count, 0);

/** By code unit: the same order on every machine, whatever its locale. */
export const inOrder = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

const sortedByKey = (record: Readonly<Record<string, string>>): Record<string, string> =>
  Object.fromEntries(Object.entries(record).sort(([a], [b]) => inOrder(a, b)));

/**
 * Pure. Deterministic text of a lock file: the fields in SPEC §4's order, every
 * list and every map of paths or names sorted, two-space JSON, one final newline.
 */
export function serializeLock(lock: LockFile): string {
  const orderOf = (locked: LockedCase): string => JSON.stringify([locked.file, locked.suite, locked.name, locked.count]);
  const ordered: LockFile = {
    format: lock.format,
    piece: lock.piece,
    dirs: [...lock.dirs].sort(inOrder),
    config: lock.config,
    protected: sortedByKey(lock.protected),
    scripts: sortedByKey(lock.scripts),
    cases: lock.cases
      .map(({ file, suite, name, count }) => ({ file, suite, name, count }))
      .sort((a, b) => inOrder(orderOf(a), orderOf(b))),
  };
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

const isTextMap = (value: unknown): value is Record<string, string> => isObject(value) && Object.values(value).every(isText);

const isLockedCase = (value: Record<string, unknown>): boolean =>
  isText(value["file"]) && isTexts(value["suite"]) && isText(value["name"]) && Number.isInteger(value["count"]);

/** The lock a text spells, or undefined when the text is not a lock file whole. */
export function parseLock(text: string): LockFile | undefined {
  const read = readJson(text);
  if (!isObject(read) || read["format"] !== 1 || !isText(read["piece"]) || !isTexts(read["dirs"]) || !isText(read["config"])) {
    return undefined;
  }
  const { protected: protectedPaths, scripts, cases } = read;
  if (!isTextMap(protectedPaths) || !isTextMap(scripts) || !isListOf(cases, isLockedCase)) return undefined;
  return { format: 1, piece: read["piece"], dirs: read["dirs"], config: read["config"], protected: protectedPaths, scripts, cases: cases as LockedCase[] };
}

/** One row of the inventory (SPEC §4): a piece, and whether it must have a lock. */
export type InventoryRow = { piece: string; lock: boolean };

/** The rows an inventory's text spells, in its order, or undefined when the text is not an inventory whole. */
export function parseInventory(text: string): InventoryRow[] | undefined {
  const read = readJson(text);
  const rows = isObject(read) ? read["pieces"] : undefined;
  if (!isListOf(rows, (row) => isText(row["piece"]) && typeof row["lock"] === "boolean")) return undefined;
  return rows.map((row) => ({ piece: String(row["piece"]), lock: row["lock"] === true }));
}

/** The scripts of a root package file's text whose names start with `foundation:`; none when the text is no package file. */
export function foundationScriptsOf(packageText: string | undefined): Record<string, string> {
  const read = readJson(packageText ?? "");
  const scripts = isObject(read) && isObject(read["scripts"]) ? read["scripts"] : {};
  const ours = Object.entries(scripts).filter((entry): entry is [string, string] => entry[0].startsWith("foundation:") && isText(entry[1]));
  return Object.fromEntries(ours);
}

/** Every `*.test.ts` among `paths` that lies under one of the lock's directories: the locked tests. */
export const lockedTestsOf = (dirs: readonly string[], paths: readonly string[]): string[] =>
  paths.filter((path) => path.endsWith(".test.ts") && dirs.some((dir) => path.startsWith(`${dir}/`))).sort(inOrder);

/** `<what> added <name>` for every name only `after` holds, then `<what> removed <name>` for every one only `before` holds. */
function namesDifference(what: string, before: readonly string[], after: readonly string[]): string[] {
  const [was, is] = [new Set(before), new Set(after)];
  return [
    ...[...is].filter((name) => !was.has(name)).map((name) => `${what} added ${name}`),
    ...[...was].filter((name) => !is.has(name)).map((name) => `${what} removed ${name}`),
  ];
}

/** `<what> added|removed|changed <key>` for every key whose value is not the same in both, in the keys' order. */
function valuesDifference(what: string, before: Readonly<Record<string, string>>, after: Readonly<Record<string, string>>): string[] {
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort(inOrder);
  return keys.flatMap((key) => {
    if (before[key] === after[key]) return [];
    if (before[key] === undefined) return [`${what} added ${key}`];
    return [after[key] === undefined ? `${what} removed ${key}` : `${what} changed ${key}`];
  });
}

/**
 * What `next` changes against the lock before it (SPEC §5 `lock`, step 4, and
 * §10 item 7), one line each: directories added and removed, cases added and
 * removed, protected paths and scripts added, removed and changed. With no lock
 * before it, everything is added.
 */
export function lockDifference(previous: LockFile | undefined, next: LockFile): string[] {
  const titleOf = (locked: LockedCase): string => `${caseTitle(locked)} (count ${locked.count})`;
  return [
    ...namesDifference("DIRS", previous?.dirs ?? [], next.dirs),
    ...namesDifference("CASE", (previous?.cases ?? []).map(titleOf), next.cases.map(titleOf)),
    ...valuesDifference("PROTECTED", previous?.protected ?? {}, next.protected),
    ...valuesDifference("SCRIPT", previous?.scripts ?? {}, next.scripts),
  ];
}
