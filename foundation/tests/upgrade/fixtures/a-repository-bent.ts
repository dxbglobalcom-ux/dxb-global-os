// The throwaway repository of piece 6b's SPEC §6 A.4 (a-repository.ts), bent as the blind audit bent it (SOL.md A3,
// A4, B4; SPEC §10.1 rows 2–4) — each a repository of its own, so that no bend reaches another case's. The bends
// are made with git's own commands on the throwaway repository; a case first sees each one bite in plain git.
import { aRepository, git, gitFed, type Repository } from "./a-repository.ts";

/** A.4's repository with `refs/replace/<middle>` pointing the middle commit at the last one (row 2). */
export function withTheMiddleCommitReplaced(): Repository {
  const made = aRepository();
  git(made.repo, "replace", made.middle, made.last);
  return made;
}

/** The bytes the replacing blob holds: never a file of any commit. */
export const REPLACING_BYTES = Buffer.from("select 'replaced';\n");

/** A.4's repository with `refs/replace/<blob>` pointing the middle commit's `db/schema/0002-b.sql` at other bytes (row 2). */
export function withAChainBlobReplaced(): Repository & { blob: string } {
  const made = aRepository();
  const blob = git(made.repo, "rev-parse", `${made.middle}:db/schema/0002-b.sql`);
  const other = gitFed(made.repo, REPLACING_BYTES, "hash-object", "-w", "--stdin").toString("utf8").trim();
  git(made.repo, "replace", blob, other);
  return { ...made, blob };
}

/** A name that is not UTF-8: `bad`, the byte 0xff, `.json` (row 3). */
export const NOT_UTF8 = Buffer.concat([Buffer.from("bad"), Buffer.from([0xff]), Buffer.from(".json")]);

/** One record of `git mktree -z`: mode, type, id, a tab, the name's bytes, a NUL. */
const entry = (mode: string, type: "blob" | "tree", id: string, name: Buffer | string): Buffer =>
  Buffer.concat([Buffer.from(`${mode} ${type} ${id}\t`), Buffer.from(name), Buffer.from([0])]);

/**
 * A.4's repository and, beside it:
 * - `not-utf8`, one commit past the last, whose tree is made from bytes — `db/reference/` holding `r.json` and a file
 *   named NOT_UTF8 (row 3); no file system is asked to hold the name;
 * - `not-utf8-outside`, the same but with that name under `db/migrations/`, outside the chain's three directories;
 * - an index holding, beside what A.4 staged, a gitlink to the middle commit at `db/staged-link` (row 4).
 */
export function withBytesAndAnIndexLink(): Repository {
  const made = aRepository();
  const { repo } = made;
  const fed = (input: Buffer, ...args: string[]): string => gitFed(repo, input, ...args).toString("utf8").trim();
  const tree = (...entries: Buffer[]): string => fed(Buffer.concat(entries), "mktree", "-z");
  const blob = fed(Buffer.from("[]\n"), "hash-object", "-w", "--stdin");
  const commitOn = (branch: string, root: string): void => {
    const commit = fed(Buffer.alloc(0), "commit-tree", root, "-p", made.last, "-m", `a name that is not UTF-8 (${branch})`);
    git(repo, "update-ref", `refs/heads/${branch}`, commit);
  };

  const reference = tree(entry("100644", "blob", blob, "r.json"), entry("100644", "blob", blob, NOT_UTF8));
  commitOn("not-utf8", tree(entry("040000", "tree", tree(entry("040000", "tree", reference, "reference")), "db")));

  const plainReference = tree(entry("100644", "blob", blob, "r.json"));
  const migrations = tree(entry("100644", "blob", blob, NOT_UTF8));
  const db = tree(entry("040000", "tree", migrations, "migrations"), entry("040000", "tree", plainReference, "reference"));
  commitOn("not-utf8-outside", tree(entry("040000", "tree", db, "db")));

  git(repo, "update-index", "--add", "--cacheinfo", `160000,${made.middle},db/staged-link`);
  return made;
}
