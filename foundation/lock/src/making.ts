// What the lock of a piece is (SPEC §4), or why there is none (SPEC §5 `lock`,
// step 3). Pure — the index's listing and the collecting pass's result go in.
import { TESTS_DIRECTORY, importClosure, type Spelled } from "./imports.ts";
import type { LockFile, LockedCase } from "./index.ts";
import { closedPlacesOf } from "./judge.ts";
import { caseKey, caseTitle, lockedTestsOf } from "./lockfile.ts";
import { Refused } from "./run.ts";
import type { Ran } from "./runner.ts";

/** The config every piece's tests are run with. */
export const CONFIG = `${TESTS_DIRECTORY}/vitest.config.ts`;

/** Protected in every lock beside the closed places: each changes the run without touching a locked file. */
const ALWAYS_PROTECTED = ["foundation/tsconfig.json", "pnpm-lock.yaml", "pnpm-workspace.yaml"];

/** `given` as a lock names a directory, or a refusal when it is none under `foundation/tests/` in the index. */
export function subjectDirectory(given: string, files: ReadonlyMap<string, string>): string {
  const dir = given.replace(/\/+$/, "");
  const names = dir.split("/");
  const under = dir.startsWith(`${TESTS_DIRECTORY}/`) && !names.includes("..") && !names.includes(".") && !names.includes("");
  if (!under || ![...files.keys()].some((path) => path.startsWith(`${dir}/`))) {
    throw new Refused(`${given} is not a directory under ${TESTS_DIRECTORY}/ in the index`);
  }
  return dir;
}

/** The collecting pass as a lock can be made of it, or a refusal that says what stands in the way. */
function collectedOf(ran: Ran, tests: readonly string[]): NonNullable<Ran["result"]> {
  const { result } = ran;
  if (result === undefined || result === null || result.nonce !== ran.nonce) throw new Refused("the collecting pass left no result of its own");
  const broken = result.modules.find((module) => module.state === "failed" || module.errors > 0);
  if (broken !== undefined) throw new Refused(`${broken.file} fails to collect`);
  const empty = tests.find((test) => !result.cases.some((found) => found.file === test));
  if (empty !== undefined) throw new Refused(`${empty} has no case`);
  for (const found of result.cases) {
    // The pass runs nothing, so an error on a case is the runner's own refusal of it — of a declared `.only`, in the runner's words.
    const [refusal] = found.errorMessages ?? [];
    if (refusal !== undefined) throw new Refused(`${caseTitle(found)} is refused by the runner: ${refusal}`);
    if ((found.retry ?? 0) > 0) throw new Refused(`${caseTitle(found)} declares a retry`);
    if ((found.repeats ?? 0) > 0) throw new Refused(`${caseTitle(found)} declares a repeat`);
  }
  if (result.unhandledErrors > 0 || ran.exitCode !== 0) {
    throw new Refused(`the collecting pass ended with ${ran.exitCode} and ${result.unhandledErrors} unhandled errors`);
  }
  return result;
}

/** Every place a case was collected at, once, with how many cases stand there. */
function countedCases(collected: NonNullable<Ran["result"]>): LockedCase[] {
  const counted = new Map<string, LockedCase>();
  for (const { file, suite, name } of collected.cases) {
    const key = caseKey({ file, suite, name });
    counted.set(key, { file, suite, name, count: (counted.get(key)?.count ?? 0) + 1 });
  }
  return [...counted.values()];
}

/**
 * Pure. The lock of `piece` on `dirs`, and beside it every relative import that
 * resolves to no file — the lock protects nothing of those. `files` is the
 * index's listing of regular files, path → blob id; `sourceOf` answers a listed
 * file's text. Refused when the tests cannot be locked as they stand, or reach
 * what a lock cannot protect.
 */
export function lockOf(input: {
  piece: string;
  dirs: readonly string[];
  files: ReadonlyMap<string, string>;
  scripts: Record<string, string>;
  ran: Ran;
  sourceOf: (path: string) => string | undefined;
}): { lock: LockFile; unresolved: Spelled[] } {
  const { piece, dirs, files } = input;
  const paths = [...files.keys()];
  const collected = collectedOf(input.ran, lockedTestsOf(dirs, paths));
  // A set-up file the reporter could not spell from the candidate's root, or one the index does not hold.
  const outside = collected.setupFiles.find((path) => !files.has(path));
  if (outside !== undefined) throw new Refused(`the set-up file ${outside} lies outside the copy`);

  const pointedAt = [...paths.filter((path) => dirs.some((dir) => path.startsWith(`${dir}/`))), CONFIG, ...collected.setupFiles];
  const closure = importClosure(pointedAt, input.sourceOf);
  const [leaving] = closure.leaving;
  if (leaving !== undefined) throw new Refused(`${leaving.from} imports ${leaving.specifier}, which leaves ${TESTS_DIRECTORY}/`);
  const [globbing] = closure.globbing;
  if (globbing !== undefined) throw new Refused(`${globbing} spells import.meta.glob: what it reaches cannot be listed, so it cannot be protected`);

  // A file that stands in a closed place is protected, reached or not: unprotected there, it would be one added.
  const protectedPaths = new Set([...closure.reached, ...paths.filter(closedPlacesOf(dirs, closure.reached)), ...ALWAYS_PROTECTED]);
  const withIds = [...protectedPaths].map((path): [string, string] => {
    const id = files.get(path);
    if (id === undefined) throw new Refused(`the index holds no ${path}`);
    return [path, id];
  });
  const lock: LockFile = {
    format: 1,
    piece,
    dirs: [...dirs],
    config: CONFIG,
    protected: Object.fromEntries(withIds),
    scripts: input.scripts,
    cases: countedCases(collected),
  };
  return { lock, unresolved: closure.unresolved };
}
