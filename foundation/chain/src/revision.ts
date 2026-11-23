// The chain at a revision (piece 6b's SPEC §5): the three directories of the chain as a commit holds them, written
// out as a root `chain up --root` takes — read from git's objects alone, never from the working tree or the index.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** The chain's own directories of `db/` (SPEC §3 fact 2): `db/` holds the old system's too. */
const THE_CHAINS = ["db/schema/", "db/functions/", "db/reference/"] as const;

export class RevisionRefused extends Error {
  readonly reason: "unknown-revision" | "into-not-empty" | "not-a-file";

  constructor(reason: RevisionRefused["reason"]) {
    super(`revision refused: ${reason}`);
    this.name = "RevisionRefused";
    this.reason = reason;
  }
}

/**
 * git as a child process — no shell between — on the repository at `repository`, and what it printed, as bytes. Its
 * environment is said here whole: no `GIT_*` of the caller's (GIT_DIR, GIT_INDEX_FILE, GIT_OBJECT_DIRECTORY …) steers
 * it to another repository, and no configuration but the repository's own is read. No optional lock is taken: the
 * repository is not written to. A failing call is thrown, its exit status on it.
 */
function git(repository: string, args: readonly string[], input?: string): Buffer {
  const env = { PATH: process.env.PATH ?? "", GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_OPTIONAL_LOCKS: "0", LC_ALL: "C" };
  return execFileSync("git", ["-C", repository, ...args], { env, input, stdio: ["pipe", "pipe", "pipe"], maxBuffer: 256 * 1024 * 1024 });
}

/** The exit status of a failed child, when it ran and ended by itself. */
const statusOf = (failure: unknown): unknown => (failure as { status?: unknown }).status;

/**
 * The commit `revision` names in `repository`, or RevisionRefused("unknown-revision"): a revision that begins with
 * `-` is never handed to git, and `--end-of-options` stands before it anyway. What it names must peel to a commit —
 * a tree (`main:db`) or a blob does not. git's own "no such object" is its exit status 1; any other failure (no
 * repository there) is thrown on as it is.
 */
function commitOf(repository: string, revision: string): string {
  if (revision === "" || revision.startsWith("-")) throw new RevisionRefused("unknown-revision");
  const resolved = (spelled: string): string => {
    try {
      return git(repository, ["rev-parse", "-q", "--verify", "--end-of-options", spelled]).toString("utf8").trim();
    } catch (failure) {
      if (statusOf(failure) === 1) throw new RevisionRefused("unknown-revision");
      throw failure;
    }
  };
  // Peeled apart from the revision: appended to `main:db`, `^{commit}` would be read as part of the path.
  return resolved(`${resolved(revision)}^{commit}`);
}

/** A file of the chain: its path below `db/` and the blob that holds its bytes. */
type Entry = { path: string; blob: string };

/**
 * Every entry the commit holds under the chain's three directories (`ls-tree -r -z`, NUL-ended, unquoted), judged:
 * a link (120000) or a gitlink (160000) is RevisionRefused("not-a-file"), and so is a path that would not stand
 * below `into` as it is spelled (an empty, `.` or `..` part) — git makes none, but its objects may hold one.
 */
function entriesOf(repository: string, commit: string): Entry[] {
  const listed = git(repository, ["ls-tree", "-r", "-z", "--full-tree", commit, "--", ...THE_CHAINS]).toString("utf8");
  const entries: Entry[] = [];
  for (const record of listed.split("\0")) {
    if (record === "") continue;
    const tab = record.indexOf("\t");
    const [mode, type, blob] = record.slice(0, tab).split(" ");
    const path = record.slice(tab + 1);
    // git reads the directories as patterns; only what stands inside one of them is the chain's.
    if (!THE_CHAINS.some((directory) => path.startsWith(directory))) continue;
    const below = path.slice("db/".length);
    if (type !== "blob" || mode === "120000" || blob === undefined) throw new RevisionRefused("not-a-file");
    if (below.split("/").some((part) => part === "" || part === "." || part === "..")) throw new RevisionRefused("not-a-file");
    entries.push({ path: below, blob });
  }
  return entries;
}

/**
 * The bytes of each blob, in order, read by one `cat-file --batch`: for each, a line `<id> blob <size>`, the bytes,
 * and a newline.
 */
function bytesOf(repository: string, blobs: readonly string[]): Buffer[] {
  if (blobs.length === 0) return [];
  const out = git(repository, ["cat-file", "--batch"], blobs.map((blob) => `${blob}\n`).join(""));
  const found: Buffer[] = [];
  let at = 0;
  for (const blob of blobs) {
    const end = out.indexOf(0x0a, at);
    const [id, type, size] = out.subarray(at, end).toString("utf8").split(" ");
    if (id !== blob || type !== "blob" || size === undefined) throw new Error(`chainAt: git did not answer the blob ${blob}`);
    at = end + 1 + Number(size);
    found.push(out.subarray(end + 1, at));
    at += 1;
  }
  return found;
}

/**
 * Whether `into` stands as an empty directory (true) or not at all (false); anything else — a directory that holds
 * anything, or anything that is no directory — is RevisionRefused("into-not-empty").
 */
function standsEmpty(into: string): boolean {
  let directory: boolean;
  try {
    directory = statSync(into).isDirectory();
  } catch (failure) {
    if ((failure as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw failure;
  }
  if (!directory || readdirSync(into).length > 0) throw new RevisionRefused("into-not-empty");
  return true;
}

/**
 * The chain at `revision` of the repository at `repository`, written under `into` (SPEC §5): every file the commit
 * holds under `db/schema/`, `db/functions/` and `db/reference/`, at its path below `db/`, byte for byte. A directory
 * the commit does not hold is not made; with no file, `into` is not made either. Every refusal comes before the first
 * byte is written: the revision, then `into`, then every entry. Nothing outside `into` is written; the repository is
 * only read.
 */
export function chainAt(repository: string, revision: string, into: string): { commit: string; files: number } {
  const commit = commitOf(repository, revision);
  const intoStands = standsEmpty(into);
  const entries = entriesOf(repository, commit);
  const bytes = bytesOf(repository, entries.map(({ blob }) => blob));
  if (entries.length === 0) return { commit, files: 0 };
  // Not `recursive`: a parent of `into` that does not stand is no part of what this writes.
  if (!intoStands) mkdirSync(into);
  for (const [at, { path }] of entries.entries()) {
    const target = join(into, path);
    mkdirSync(dirname(target), { recursive: true });
    // `wx`: a file is written once, never over another.
    writeFileSync(target, bytes[at] ?? Buffer.alloc(0), { flag: "wx" });
  }
  return { commit, files: entries.length };
}
