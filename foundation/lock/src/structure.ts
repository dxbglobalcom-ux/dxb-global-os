// SPEC §5 steps 3 and 7 on a real repository: what git says of the candidate,
// of the lock commit and of the history between them, handed to the pure rules.
import { commitsChanging, idsByPath, listTree, pathsChangedBetween, readBlobs, textAt, textOf, type Candidate, type TreeEntry } from "./git.ts";
import type { LockFile, Offence } from "./index.ts";
import { impurePaths, isProductPath, judgeStructure, runnerNameLines } from "./judge.ts";
import { LOCKS_DIRECTORY, foundationScriptsOf, inOrder, parseLock, pieceOfLockPath } from "./lockfile.ts";
import { oneLine } from "./run.ts";

/** One judgement: a repository, the lock of a piece as its base holds it, that lock's commit, and the candidate. */
export type Judged = { root: string; lock: LockFile; lockCommit: string; candidate: Candidate };

/** Every path a lock file in this commit's tree protects. A record there that is no lock file protects nothing; nor does the parent a first commit lacks. */
function protectedByTheLocksOf(root: string, commit: string | undefined): Set<string> {
  if (commit === undefined) return new Set();
  const lockFiles = listTree(root, commit, LOCKS_DIRECTORY).filter((entry) => pieceOfLockPath(entry.path) !== undefined);
  return new Set(lockFiles.flatMap((entry) => Object.keys(parseLock(textOf(root, entry.id))?.protected ?? {})));
}

/**
 * The commits from the lock commit to the base that change the records and
 * are not a lock's own commit: one that changes other paths with them, or one
 * with more than one parent.
 */
function impureLockCommits({ root, lockCommit, candidate }: Judged): Offence[] {
  return commitsChanging(root, lockCommit, candidate.base, LOCKS_DIRECTORY).flatMap(({ commit, parents, changed }) => {
    const impure =
      parents.length > 1
        ? [`(a merge of ${parents.length} commits)`]
        : impurePaths(changed, protectedByTheLocksOf(root, commit), protectedByTheLocksOf(root, parents[0]));
    return impure.map((what) => ({ kind: "lock-commit-impure", detail: `${commit} ${what}` }));
  });
}

/** SPEC §5 step 3, whole: every structural offence of the candidate, whose tree holds `entries`. */
export function structuralOffences(judged: Judged, entries: readonly TreeEntry[]): Offence[] {
  const { root, lock, lockCommit, candidate } = judged;
  const candidateScripts = foundationScriptsOf(textAt(root, candidate.tree, "package.json"));
  const atTheLockCommit = idsByPath(listTree(root, lockCommit));
  const inconsistent = Object.entries(lock.protected).filter(([path, id]) => atTheLockCommit.get(path) !== id);
  return [
    ...judgeStructure({ lock, candidate: idsByPath(entries), candidateScripts }),
    ...inconsistent.map(([path]) => ({ kind: "lock-inconsistent", detail: path })),
    ...pathsChangedBetween(root, candidate.base, candidate.tree, LOCKS_DIRECTORY).map((path) => ({ kind: "locks-touched", detail: path })),
    ...impureLockCommits(judged),
  ];
}

/**
 * SPEC §5 step 7: a `NOTE runner-name <path>:<line>` for each line that spells
 * the runner's name in a product file changed between the lock commit and the
 * candidate that the lock does not protect. A help for the reader, never an offence.
 */
export async function runnerNameNotes({ root, lock, lockCommit, candidate }: Judged, entries: readonly TreeEntry[]): Promise<string[]> {
  const changed = new Set(pathsChangedBetween(root, lockCommit, candidate.tree));
  const unprotectedProduct = (path: string): boolean => isProductPath(path) && !Object.hasOwn(lock.protected, path);
  const searched = entries.filter((entry) => entry.type === "blob" && changed.has(entry.path) && unprotectedProduct(entry.path));
  const found: { path: string; line: number }[] = [];
  await readBlobs(root, [...new Set(searched.map((entry) => entry.id))], (id, bytes) => {
    // A file with a zero byte is not text: it has no lines to name.
    const lines = bytes.includes(0) ? [] : runnerNameLines(bytes.toString());
    for (const { path } of searched.filter((entry) => entry.id === id)) found.push(...lines.map((line) => ({ path, line })));
  });
  found.sort((a, b) => inOrder(a.path, b.path) || a.line - b.line);
  return found.map(({ path, line }) => `NOTE runner-name ${oneLine(path)}:${line}`);
}
