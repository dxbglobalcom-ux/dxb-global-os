// The pure judgements of SPEC §5: listings and a result that were already read
// go in, offences come out. Nothing here touches git, the disk or a process.
import { TESTS_DIRECTORY } from "./imports.ts";
import type { CaseResult, LockFile, LockedCase, Offence, RunResult } from "./index.ts";
import { LOCKS_DIRECTORY, caseKey, caseTitle } from "./lockfile.ts";

/** The lock tool's own directory: closed and protected whole in every lock. */
export const TOOL_DIRECTORY = "foundation/lock";

/** The one kind a result is an offence by — the most specific — or undefined for a case that passed at its first try. */
function faultOf(ran: CaseResult): string | undefined {
  if (ran.state === "skipped") return "case-skipped";
  if (ran.state !== "passed") return "case-not-passed";
  return ran.retryCount > 0 ? "case-retried" : undefined;
}

/** Pure. SPEC §5 step 6: `result` is what was read (undefined: no file; null: malformed). */
export function judgeRun(input: {
  cases: readonly LockedCase[];
  protectedPaths: readonly string[];
  result: RunResult | null | undefined;
  nonce: string;
  exitCode: number;
}): Offence[] {
  const { result, exitCode } = input;
  const exit = exitCode === 0 ? [] : [{ kind: "exit-nonzero", detail: String(exitCode) }];
  // A result that is not this run's says nothing of any case: only that is said, and how the run ended.
  if (result === undefined) return [{ kind: "result-missing", detail: "the run left no result" }, ...exit];
  if (result === null) return [{ kind: "result-malformed", detail: "the result is not the reporter's" }, ...exit];
  if (result.nonce !== input.nonce) return [{ kind: "result-stale", detail: "the result carries another run's nonce" }, ...exit];

  const ranAt = new Map<string, CaseResult[]>();
  for (const ran of result.cases) ranAt.set(caseKey(ran), [...(ranAt.get(caseKey(ran)) ?? []), ran]);
  const offences: Offence[] = [];
  for (const locked of input.cases) {
    const ran = ranAt.get(caseKey(locked)) ?? [];
    ranAt.delete(caseKey(locked));
    const counted = `${caseTitle(locked)} — ran ${ran.length} of ${locked.count}`;
    if (ran.length < locked.count) offences.push({ kind: "case-missing", detail: counted });
    if (ran.length > locked.count) offences.push({ kind: "case-count", detail: counted });
    for (const kind of ran.map(faultOf)) if (kind !== undefined) offences.push({ kind, detail: caseTitle(locked) });
  }
  // What is left ran at a place the lock does not hold.
  for (const strangers of ranAt.values()) for (const ran of strangers) offences.push({ kind: "case-unknown", detail: caseTitle(ran) });

  for (const module of result.modules) {
    if (module.state !== "passed" || module.errors > 0) offences.push({ kind: "file-failed", detail: module.file });
  }
  if (result.unhandledErrors > 0) offences.push({ kind: "run-errors", detail: String(result.unhandledErrors) });
  for (const path of result.setupFiles) {
    if (!input.protectedPaths.includes(path)) offences.push({ kind: "setup-unprotected", detail: path });
  }
  return [...offences, ...exit];
}

/** A closed place of a lock: one of its directories or the tool's, at any depth — or `foundation/tests/` itself, not deeper. */
export function inClosedDirectory(path: string, dirs: readonly string[]): boolean {
  if ([...dirs, TOOL_DIRECTORY].some((dir) => path.startsWith(`${dir}/`))) return true;
  return path.startsWith(`${TESTS_DIRECTORY}/`) && !path.slice(TESTS_DIRECTORY.length + 1).includes("/");
}

/** Pure. SPEC §5 step 3's first four rules — the ones that need no history — on listings already read from git. */
export function judgeStructure(input: {
  lock: LockFile;
  /** path → blob id, the candidate's whole tree */
  candidate: ReadonlyMap<string, string>;
  candidateScripts: Readonly<Record<string, string>>;
}): Offence[] {
  const { lock, candidate, candidateScripts } = input;
  const offences: Offence[] = [];
  for (const [path, locked] of Object.entries(lock.protected)) {
    const found = candidate.get(path);
    if (found === undefined) offences.push({ kind: "protected-missing", detail: path });
    else if (found !== locked) offences.push({ kind: "protected-changed", detail: path });
  }
  for (const path of candidate.keys()) {
    if (!Object.hasOwn(lock.protected, path) && inClosedDirectory(path, lock.dirs)) offences.push({ kind: "closed-dir-added", detail: path });
    if (path.split("/").includes("node_modules")) offences.push({ kind: "candidate-carries-node-modules", detail: path });
  }
  const ours = Object.keys(candidateScripts).filter((name) => name.startsWith("foundation:"));
  for (const name of new Set([...Object.keys(lock.scripts), ...ours])) {
    if (candidateScripts[name] !== lock.scripts[name]) offences.push({ kind: "scripts-changed", detail: name });
  }
  return offences;
}

/** The root files a commit may change together with a lock: the lock's own scripts and the install stand in them. */
const CHANGED_WITH_A_LOCK = ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml"];

/**
 * Pure. SPEC §5 step 3's last rule, for one commit that changes
 * `foundation/locks/`: the paths it changes that are neither a record, nor
 * protected by a lock file of that commit's tree, nor one of the three root files.
 */
export function impurePaths(changed: readonly string[], protectedByItsLocks: ReadonlySet<string>): string[] {
  return changed.filter(
    (path) => !path.startsWith(`${LOCKS_DIRECTORY}/`) && !protectedByItsLocks.has(path) && !CHANGED_WITH_A_LOCK.includes(path),
  );
}

/** Pure. SPEC §5 step 7: the numbers of the lines of a text that spell the runner's name or the work directory's. */
export function runnerNameLines(text: string): number[] {
  return text.split("\n").flatMap((line, index) => (/vitest/i.test(line) || line.includes("foundation-verify") ? [index + 1] : []));
}
