// What the lock tool reads from git: trees, blobs and history, always as objects
// — never a file of the working tree (SPEC §3: the candidate is a tree).
import { createHash } from "node:crypto";
import { NO_FILE } from "./judge.ts";
import { Refused, git, start } from "./run.ts";

export type TreeEntry = { path: string; mode: string; type: string; id: string };

/** A candidate (SPEC §3): the tree that is judged, and the commit its history is read from. */
export type Candidate = { base: string; tree: string };

/** The repository the command was started in: the root of the working directory's. */
export const repositoryRoot = (): string => git(process.cwd(), ["rev-parse", "--show-toplevel"]).trimEnd();

/** The full id of the commit `rev` names; a refusal when it names none. */
export const commitOf = (root: string, rev: string): string => git(root, ["rev-parse", "--verify", "--end-of-options", `${rev}^{commit}`]).trim();

/**
 * The candidate of a command: with `rev`, that commit and its tree; without,
 * the index written as a tree — exactly what a commit would hold — on HEAD.
 */
export function candidateOf(root: string, rev?: string): Candidate {
  const base = commitOf(root, rev ?? "HEAD");
  if (rev !== undefined) return { base, tree: git(root, ["rev-parse", "--verify", `${base}^{tree}`]).trim() };
  if (git(root, ["ls-files", "--unmerged", "-z"]) !== "") throw new Refused("the index has unmerged entries");
  return { base, tree: git(root, ["write-tree"]).trim() };
}

/** Every entry of a tree, at any depth — or, with `under`, the entries of that one directory or file of it. */
export function listTree(root: string, treeish: string, under?: string): TreeEntry[] {
  const listed = git(root, ["ls-tree", "-r", "-z", "--full-tree", treeish, ...(under === undefined ? [] : ["--", under])]).split("\0");
  return listed.flatMap((line) => {
    const [, mode, type, id, path] = /^(\d+) (\w+) ([0-9a-f]+)\t(.*)$/s.exec(line) ?? [];
    return mode === undefined || type === undefined || id === undefined || path === undefined ? [] : [{ path, mode, type, id }];
  });
}

/** The text of the file a tree holds at `path`, or undefined when it holds none there. */
export function textAt(root: string, treeish: string, path: string): string | undefined {
  const entry = listTree(root, treeish, path).find((listed) => listed.path === path && listed.type === "blob");
  return entry === undefined ? undefined : textOf(root, entry.id);
}

/** A regular file's entry: a blob of mode 100644 or 100755. A link or a gitlink is an entry, and no file a lock can protect (SPEC §10 item 8). */
export const isRegularFile = (entry: TreeEntry): boolean => entry.type === "blob" && (entry.mode === "100644" || entry.mode === "100755");

/** path → id of a listing: what the judgements compare. An entry that is no regular file stands in it as NO_FILE — there, and equal to no record. */
export const idsByPath = (entries: readonly TreeEntry[]): Map<string, string> =>
  new Map(entries.map((entry) => [entry.path, isRegularFile(entry) ? entry.id : NO_FILE]));

/** The text of one blob. */
export const textOf = (root: string, id: string): string => git(root, ["cat-file", "blob", id]);

/** The id git gives these bytes as a blob, by the hash `likeId` was made with. */
export function blobIdOf(bytes: Buffer, likeId: string): string {
  const hash = createHash(likeId.length === 64 ? "sha256" : "sha1");
  return hash.update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
}

const linesOf = (printed: string): string[] => printed.split("\n").filter((line) => line !== "");

/** The newest commit in `base`'s history that changed `path`, or undefined when none did. */
export function newestCommitChanging(root: string, base: string, path: string): string | undefined {
  return linesOf(git(root, ["rev-list", "-1", base, "--", path]))[0];
}

/** The paths that differ between two trees — all of them, or those under `under`. */
export function pathsChangedBetween(root: string, from: string, to: string, under?: string): string[] {
  const limit = under === undefined ? [] : ["--", `${under}/`];
  return git(root, ["diff-tree", "-r", "-z", "--name-only", from, to, ...limit]).split("\0").filter((path) => path !== "");
}

/**
 * The commits from `from` to `to` — `from` among them — that change a path
 * under `under` against any of their parents, each with its parents and with
 * every path it changes against its first.
 */
export function commitsChanging(root: string, from: string, to: string, under: string): { commit: string; parents: string[]; changed: string[] }[] {
  const range = [...linesOf(git(root, ["rev-list", to, `^${from}`])), from];
  // With `--stdin`, a commit's id is printed above its paths, and only when it changes one of those asked for.
  // Every line ends in a newline: git reads no commit off a last line that does not.
  const asked = range.map((commit) => `${commit}\n`).join("");
  const printed = git(root, ["diff-tree", "--stdin", "-r", "-m", "--root", "--name-only", "--", `${under}/`], asked);
  const changing = new Set(linesOf(printed).filter((line) => /^[0-9a-f]{40,64}$/.test(line)));
  return [...changing].map((commit) => {
    const [, ...parents] = git(root, ["rev-list", "--parents", "-n", "1", commit]).trim().split(" ");
    const changed = git(root, ["diff-tree", "-r", "-z", "--root", "--no-commit-id", "--name-only", commit]);
    return { commit, parents, changed: changed.split("\0").filter((path) => path !== "") };
  });
}

/**
 * Hands `each` the bytes of every blob named — one `git cat-file --batch`,
 * read as it prints: `<id> <type> <size>`, a newline, the bytes, a newline.
 * The bytes are the blob's own: no attribute, filter or conversion is in the way.
 */
export function readBlobs(root: string, ids: readonly string[], each: (id: string, bytes: Buffer) => void): Promise<void> {
  if (ids.length === 0) return Promise.resolve();
  const { child, ended } = start("git", ["--no-replace-objects", "-C", root, "cat-file", "--batch"], {
    cwd: root,
    stdio: ["pipe", "pipe", 2],
    stoppedBy: "killing-its-group",
  });
  let held: Buffer = Buffer.alloc(0);
  const unjoined: Buffer[] = [];
  let unjoinedLength = 0;
  // The blob whose bytes are awaited, once its header was read.
  let awaited: { id: string; size: number } | undefined;
  let read = 0;

  const takeWhatIsHeld = (): void => {
    for (;;) {
      if (awaited === undefined) {
        const end = held.indexOf("\n");
        if (end === -1) return;
        const [id = "", type, size] = held.toString("latin1", 0, end).split(" ");
        if (type !== "blob") throw new Refused(`git cat-file: ${id} is not a blob (${type ?? "nothing"})`);
        awaited = { id, size: Number(size) };
        held = held.subarray(end + 1);
      }
      if (held.length < awaited.size + 1) return;
      each(awaited.id, held.subarray(0, awaited.size));
      held = held.subarray(awaited.size + 1);
      awaited = undefined;
      read += 1;
    }
  };

  let failed = false;
  const parsed = new Promise<void>((resolve, reject) => {
    child.stdout?.on("data", (chunk: Buffer) => {
      if (failed) return;
      // Joined only once a header or a whole blob can be there: a large blob is not copied again with every chunk.
      unjoined.push(chunk);
      unjoinedLength += chunk.length;
      if (awaited !== undefined && held.length + unjoinedLength < awaited.size + 1) return;
      held = Buffer.concat([held, ...unjoined]);
      unjoined.length = 0;
      unjoinedLength = 0;
      try {
        takeWhatIsHeld();
      } catch (failure) {
        failed = true;
        child.kill("SIGKILL");
        reject(failure);
      }
    });
    child.stdout?.on("end", resolve);
    child.stdin?.on("error", reject);
  });
  child.stdin?.end(ids.map((id) => `${id}\n`).join(""));

  return Promise.all([ended, parsed]).then(([code]) => {
    if (code !== 0 || read !== ids.length) throw new Refused(`git cat-file read ${read} of ${ids.length} blobs and ended with ${code}`);
  });
}
