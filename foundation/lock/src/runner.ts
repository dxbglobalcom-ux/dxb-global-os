// The candidate made to run (SPEC §5 steps 4 and 5): the copy, the frozen
// install, the runner with the judge's reporter, and the result that reporter left.
import { randomBytes } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { blobIdOf, type TreeEntry } from "./git.ts";
import { TESTS_DIRECTORY } from "./imports.ts";
import type { CaseResult, Offence, RunResult } from "./index.ts";
import { run } from "./run.ts";
import { isListOf, isNumber, isObject, isText, isTexts, readJson } from "./shape.ts";
import { candidateIn, reporterPath, resultIn, writeEntries } from "./work.ts";

/** The runner, as the install leaves it in a copy. */
const RUNNER = `${TESTS_DIRECTORY}/node_modules/.bin/vitest`;
const LOCKFILE = "pnpm-lock.yaml";

/**
 * A result as the reporter writes it: SPEC §6's, and beside each case what the
 * case declares of itself — read by `lock` alone, which refuses a declared
 * retry or repeat. A result without them is still a result.
 */
export type Reported = Omit<RunResult, "cases"> & { cases: (CaseResult & { retry?: number; repeats?: number })[] };

/**
 * SPEC §5 step 4: the candidate's entries written into the work directory's
 * `candidate/`, then the frozen offline install there. Answers the offences of
 * an install that did not do exactly that — none when the copy is ready to run.
 */
export async function copyAndInstall(root: string, entries: readonly TreeEntry[], work: string): Promise<Offence[]> {
  const copy = candidateIn(work);
  await writeEntries(root, entries, copy);
  const code = await run("pnpm", ["-C", copy, "install", "--frozen-lockfile", "--offline", "--filter", "@dxb-foundation/*"], copy);
  if (code !== 0) return [{ kind: "install-failed", detail: `pnpm ended with ${code}` }];
  // The home directory is a pnpm workspace itself: an install that walked up to it ends with 0 and has installed nothing here.
  if (!existsSync(join(copy, RUNNER))) return [{ kind: "install-failed", detail: `pnpm ended with 0 and left no ${RUNNER}` }];
  const locked = entries.find((entry) => entry.path === LOCKFILE);
  const standing = lstatSync(join(copy, LOCKFILE), { throwIfNoEntry: false })?.isFile() ? readFileSync(join(copy, LOCKFILE)) : undefined;
  const unchanged = locked !== undefined && standing !== undefined && blobIdOf(standing, locked.id) === locked.id;
  return unchanged ? [] : [{ kind: "lockfile-changed-by-install", detail: LOCKFILE }];
}

function isReported(value: unknown): value is Reported {
  if (!isObject(value)) return false;
  const declared = (count: unknown): boolean => count === undefined || isNumber(count);
  const cases = isListOf(
    value["cases"],
    (ran) =>
      isText(ran["file"]) && isTexts(ran["suite"]) && isText(ran["name"]) && isText(ran["state"]) && isNumber(ran["retryCount"]) &&
      declared(ran["retry"]) && declared(ran["repeats"]),
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
