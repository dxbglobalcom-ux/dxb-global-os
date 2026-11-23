// The places of a run on disk: the running tool's own files, and the work
// directory a run makes, fills and removes (SPEC §5).
import { chmodSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { blobIdOf, readBlobs, type TreeEntry } from "./git.ts";
import { TOOL_DIRECTORY } from "./judge.ts";
import { Refused, home } from "./run.ts";

/** The running tool's directory — from this file's own location, never from the working directory. */
const toolDirectory = resolve(fileURLToPath(new URL("..", import.meta.url)));

/** The reporter of the tool that judges: Vitest is handed this file, never the candidate's. */
export const reporterPath = join(toolDirectory, "src", "reporter.mjs");

/** Every file under `directory` as the path it has from there; `node_modules` is not entered — git never holds it. */
function filesUnder(directory: string, prefix = ""): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : filesUnder(join(directory, entry.name), `${prefix}${entry.name}/`);
    return [`${prefix}${entry.name}`];
  });
}

/**
 * True when the running tool's files are exactly `listed` — the entries of
 * `foundation/lock/` in some tree, path → blob id: the same paths, each with
 * the same bytes (SPEC §3, the judge's comparison with itself).
 */
export function toolStandsAs(listed: ReadonlyMap<string, string>): boolean {
  const own = filesUnder(toolDirectory);
  if (own.length !== listed.size) return false;
  return own.every((file) => {
    const id = listed.get(`${TOOL_DIRECTORY}/${file}`);
    if (id === undefined) return false;
    const path = join(toolDirectory, file);
    // A link is stored by git as the text it points with.
    const bytes = lstatSync(path).isSymbolicLink() ? Buffer.from(readlinkSync(path)) : readFileSync(path);
    return blobIdOf(bytes, id) === id;
  });
}

/** Where every run's work directory is made, and nothing else is. */
const WORK_HOME = join(home, ".cache", "dxb", "foundation-verify");

// The parts of a work directory (SPEC §5). The reporter spells the first and the
// last by itself: it is plain JavaScript and imports nothing of the tool.
export const candidateIn = (work: string): string => join(work, "candidate");
export const judgeIn = (work: string): string => join(work, "judge");
/** The result file of the run that carries `nonce`: the reporter takes the nonce back out of this name. */
export const resultIn = (work: string, nonce: string): string => join(work, "result", `${nonce}.json`);

// The work directories this process made and has not yet removed. Only these are ever removed.
const madeHere = new Set<string>();

/** True when `directory` lies directly in the place work directories are made in. */
const liesInWorkHome = (directory: string): boolean => dirname(directory) === realpathSync(WORK_HOME);

/** Gives this user every directory under `directory` back. Links are not followed: nothing outside it is touched. */
function unsealDirectories(directory: string): void {
  chmodSync(directory, 0o700);
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) unsealDirectories(join(directory, entry.name));
  }
}

function removeWorkDirectory(directory: string): void {
  if (!madeHere.has(directory)) throw new Error(`refused to remove ${directory}: this run did not make it`);
  if (!liesInWorkHome(directory)) throw new Error(`refused to remove ${directory}: it does not lie in ${WORK_HOME}`);
  try {
    rmSync(directory, { recursive: true, force: true });
  } catch {
    // What ran in the copy may have sealed a directory there, and a sealed directory cannot be emptied.
    unsealDirectories(directory);
    rmSync(directory, { recursive: true, force: true });
  }
  madeHere.delete(directory);
}

/**
 * Does `work` in a fresh work directory of this run and removes the directory
 * when `work` ends, however it ends — `keep` leaves it and says where it is.
 */
export async function inAWorkDirectory<T>(keep: boolean, work: (directory: string) => Promise<T>): Promise<T> {
  mkdirSync(WORK_HOME, { recursive: true });
  // Made under the place's real path: every path handed on from here is the one a child sees too.
  const directory = mkdtempSync(join(realpathSync(WORK_HOME), "run-"));
  madeHere.add(directory);
  if (keep) console.log(`WORK_KEPT ${directory}`);
  try {
    return await work(directory);
  } finally {
    if (!keep) removeWorkDirectory(directory);
  }
}

/**
 * The work directory an extracted judge was started in (SPEC §3): the one
 * whose `judge/` holds the running tool. Another run made it and removes it;
 * a directory that is not that one is refused.
 */
export function workDirectoryOfTheExtractedJudge(given: string): string {
  const directory = resolve(given);
  if (!liesInWorkHome(directory) || join(judgeIn(directory), TOOL_DIRECTORY) !== toolDirectory) {
    throw new Refused(`${given} is not the work directory this tool was extracted into`);
  }
  return directory;
}

/**
 * Writes tree entries under `into` — exactly these files, each with exactly
 * its blob's bytes (SPEC §5 step 4): read from the object store, so no
 * attribute, filter or end-of-line rule of the candidate changes a byte. A link
 * is made a link; a submodule's entry is no file and is left out.
 */
export async function writeEntries(root: string, entries: readonly TreeEntry[], into: string): Promise<void> {
  const pathsOf = new Map<string, TreeEntry[]>();
  for (const entry of entries) {
    if (entry.type === "blob") pathsOf.set(entry.id, [...(pathsOf.get(entry.id) ?? []), entry]);
  }
  mkdirSync(into, { recursive: true });
  await readBlobs(root, [...pathsOf.keys()], (id, bytes) => {
    for (const entry of pathsOf.get(id) ?? []) {
      const path = join(into, entry.path);
      if (!path.startsWith(`${into}${sep}`)) throw new Refused(`the tree names ${entry.path}, which would be written outside ${into}`);
      mkdirSync(dirname(path), { recursive: true });
      if (entry.mode === "120000") symlinkSync(bytes.toString(), path);
      // "wx": every file is made here, new — nothing that stands is ever written through.
      else writeFileSync(path, bytes, { mode: entry.mode === "100755" ? 0o755 : 0o644, flag: "wx" });
    }
  });
}
