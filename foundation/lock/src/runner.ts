// The candidate made to run (SPEC §5 steps 4 and 5): the copy, the frozen
// install, the runner with the judge's reporter, and the result that reporter
// left — and whether the copy is still the candidate's tree (SPEC §10 item 2).
import { randomBytes } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { blobIdOf, type TreeEntry } from "./git.ts";
import { TESTS_DIRECTORY } from "./imports.ts";
import type { CaseResult, LockFile, Offence, RunResult } from "./index.ts";
import { closedPlacesOf } from "./judge.ts";
import { inOrder } from "./lockfile.ts";
import { run } from "./run.ts";
import { isListOf, isNumber, isObject, isText, isTexts, readJson } from "./shape.ts";
import { candidateIn, filesUnder, reporterPath, resultIn, writeEntries } from "./work.ts";

/** The runner, as the install leaves it in a copy. */
const RUNNER = `${TESTS_DIRECTORY}/node_modules/.bin/vitest`;
const LOCKFILE = "pnpm-lock.yaml";

/**
 * A result as the reporter writes it: SPEC §6's, and beside each case what the
 * case declares of itself and the messages of the errors the runner put on it
 * — read by `lock` alone, which refuses a declared retry or repeat, and a case
 * the runner refused: a declared `.only`. A result without them is still a result.
 */
export type Reported = Omit<RunResult, "cases"> & { cases: (CaseResult & { retry?: number; repeats?: number; errorMessages?: string[] })[] };

/** True when `path` is a file that holds the bytes of the blob `id`. No link is followed: a link at the path, or at a directory above it, is no such file. */
function holdsTheBlob(path: string, id: string): boolean {
  if (!lstatSync(path, { throwIfNoEntry: false })?.isFile() || realpathSync(path) !== path) return false;
  return blobIdOf(readFileSync(path), id) === id;
}

/**
 * SPEC §5 step 4, as §10 item 1 corrects it: the candidate's entries written
 * into the work directory's `candidate/`, then the frozen offline install of
 * the whole workspace there — no script and no pnpmfile of the candidate's is
 * run by it. Answers the offences of an install that did not do exactly that —
 * none when the copy is ready to run.
 */
export async function copyAndInstall(root: string, entries: readonly TreeEntry[], work: string): Promise<Offence[]> {
  const copy = candidateIn(work);
  await writeEntries(root, entries, copy);
  const code = await run("pnpm", ["-C", copy, "install", "--frozen-lockfile", "--offline", "--ignore-scripts", "--ignore-pnpmfile"], copy);
  if (code !== 0) return [{ kind: "install-failed", detail: `pnpm ended with ${code}` }];
  // The home directory is a pnpm workspace itself: an install that walked up to it ends with 0 and has installed nothing here.
  if (!existsSync(join(copy, RUNNER))) return [{ kind: "install-failed", detail: `pnpm ended with 0 and left no ${RUNNER}` }];
  const locked = entries.find((entry) => entry.path === LOCKFILE);
  const unchanged = locked !== undefined && holdsTheBlob(join(copy, LOCKFILE), locked.id);
  return unchanged ? [] : [{ kind: "lockfile-changed-by-install", detail: LOCKFILE }];
}

/**
 * SPEC §10 item 2: what the copy no longer holds as the candidate's tree holds
 * it, read from the disk. A protected path that is not a file of its blob's
 * bytes is `copy-changed`; whatever stands in a closed place and is no entry of
 * the tree is `copy-added`. What an install leaves under a `node_modules` is
 * not the tree's, and is not looked at.
 */
export function copyOffences(work: string, entries: readonly TreeEntry[], lock: LockFile): Offence[] {
  const copy = candidateIn(work);
  const ofTheTree = new Set(entries.map((entry) => entry.path));
  const isClosed = closedPlacesOf(lock.dirs, Object.keys(lock.protected));
  const changed = Object.entries(lock.protected).filter(([path, id]) => !holdsTheBlob(join(copy, path), id));
  const added = filesUnder(copy).filter((path) => isClosed(path) && !ofTheTree.has(path)).sort(inOrder);
  return [
    ...changed.map(([path]) => ({ kind: "copy-changed", detail: path })),
    ...added.map((path) => ({ kind: "copy-added", detail: path })),
  ];
}

function isReported(value: unknown): value is Reported {
  if (!isObject(value)) return false;
  const declared = (count: unknown): boolean => count === undefined || isNumber(count);
  const cases = isListOf(
    value["cases"],
    (ran) =>
      isText(ran["file"]) && isTexts(ran["suite"]) && isText(ran["name"]) && isText(ran["state"]) && isNumber(ran["retryCount"]) &&
      declared(ran["retry"]) && declared(ran["repeats"]) && (ran["errorMessages"] === undefined || isTexts(ran["errorMessages"])),
  );
  const modules = isListOf(value["modules"], (module) => isText(module["file"]) && isText(module["state"]) && isNumber(module["errors"]));
  return isText(value["nonce"]) && cases && modules && isNumber(value["unhandledErrors"]) && isText(value["reason"]) && isTexts(value["setupFiles"]);
}

/** What stands at a result's path: undefined for nothing, null for anything that is not the reporter's shape. */
function readResult(path: string): Reported | null | undefined {
  const found = lstatSync(path, { throwIfNoEntry: false });
  if (found === undefined) return undefined;
  const read = found.isFile() ? readJson(readFileSync(path, "utf8")) : undefined;
  return isReported(read) ? read : null;
}

export type Ran = { result: Reported | null | undefined; nonce: string; exitCode: number };

/**
 * SPEC §5 step 5: the runner of the copy on these test files, with this tool's
 * reporter and a result file named by a nonce of this run alone. `judging` runs
 * every case; `collecting` runs none — it asks for a name no case has — and
 * still reports every case there is. The result is read after the runner has ended.
 * The runner's own reporter stands beside the judge's (SPEC §10 item 11): what
 * it prints — a failing assertion's message — goes to standard error with the
 * rest of the runner's output.
 */
export async function runTheTests(work: string, suite: { config: string; tests: readonly string[] }, pass: "judging" | "collecting"): Promise<Ran> {
  const copy = candidateIn(work);
  const nonce = randomBytes(16).toString("hex");
  const resultPath = resultIn(work, nonce);
  mkdirSync(dirname(resultPath), { recursive: true });
  const ofThePass = pass === "judging" ? ["--passWithNoTests=false"] : ["--passWithNoTests", "--testNamePattern", `no case is named ${nonce}`];
  const exitCode = await run(
    join(copy, RUNNER),
    [
      "run",
      "--config",
      join(copy, suite.config),
      ...suite.tests.map((test) => join(copy, test)),
      "--reporter=default",
      `--reporter=${reporterPath}`,
      `--outputFile=${resultPath}`,
      "--retry=0",
      "--expect.requireAssertions",
      "--allowOnly=false",
      ...ofThePass,
    ],
    join(copy, TESTS_DIRECTORY),
  );
  return { result: readResult(resultPath), nonce, exitCode };
}
