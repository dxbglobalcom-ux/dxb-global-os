// The throwaway repository of piece 6b's SPEC §6 A.4, made by the case in a temporary directory: three commits on
// `main` — no chain; a chain beside other files under db/ and outside it; the chain changed — a branch `middle` at
// the second, and two branches whose last commit holds what chainAt refuses (a link, a gitlink). Then, on top, what a
// working tree and an index hold that no commit does.
//
// git runs as a child process, blind to the machine's own configuration, with its identity given on each call; every
// call names a repository under the temporary directory and nothing else.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, sep } from "node:path";

const ON_EACH_CALL = [
  "-c", "user.name=The Upgrade Fixture",
  "-c", "user.email=fixture@upgrade.invalid",
  "-c", "commit.gpgsign=false",
  "-c", "core.autocrlf=false",
  "-c", "init.defaultBranch=main",
];

/** `git -C <repo> <args>`, what it printed, trimmed; a failing call is an error. Only under the temporary directory. */
export function git(repo: string, ...args: string[]): string {
  if (!repo.startsWith(tmpdir() + sep)) throw new Error(`refused: ${repo} is not under the temporary directory`);
  const env = { PATH: process.env.PATH, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };
  return execFileSync("git", ["-C", repo, ...ON_EACH_CALL, ...args], { env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

const made: string[] = [];

/** A fresh empty directory under the temporary directory; removed by removeTheRepositories. */
export function aTemporaryDirectory(prefix: string): string {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  made.push(directory);
  return directory;
}

export function removeTheRepositories(): void {
  for (const directory of made.splice(0)) rmSync(directory, { recursive: true, force: true });
}

const put = (repo: string, path: string, bytes: Buffer | string): void => {
  mkdirSync(dirname(join(repo, path)), { recursive: true });
  writeFileSync(join(repo, path), bytes);
};

/** The second commit's chain, path below db/ → bytes: a CRLF, a file without a final newline, bytes that are not UTF-8, an empty file, a nested one. */
export const MIDDLE_CHAIN: Readonly<Record<string, Buffer>> = {
  "schema/0001-a.sql": Buffer.from("create table a (id integer);\r\nselect 1;\r\n"),
  "schema/0002-b.sql": Buffer.from("select 2;"),
  "functions/.gitkeep": Buffer.alloc(0),
  "functions/f.sql": Buffer.from("create or replace function os.f() returns integer language sql as $$select 1$$;\n"),
  "functions/g.sql": Buffer.from([0x2d, 0x2d, 0x20, 0xff, 0x00, 0x0d, 0x0a]),
  "reference/r.json": Buffer.from("[]\n"),
  "reference/nested/deep.json": Buffer.from('{"deep": true}\n'),
};

/** The third commit's chain: 0002 changed, 0003 added, the nested file removed. */
export const LAST_CHAIN: Readonly<Record<string, Buffer>> = {
  "schema/0001-a.sql": MIDDLE_CHAIN["schema/0001-a.sql"] as Buffer,
  "schema/0002-b.sql": Buffer.from("select 22;\n"),
  "schema/0003-c.sql": Buffer.from("select 3;\n"),
  "functions/.gitkeep": Buffer.alloc(0),
  "functions/f.sql": MIDDLE_CHAIN["functions/f.sql"] as Buffer,
  "functions/g.sql": MIDDLE_CHAIN["functions/g.sql"] as Buffer,
  "reference/r.json": MIDDLE_CHAIN["reference/r.json"] as Buffer,
};

/** Beside the chain in every commit: db/'s other directories and files, a prefix's decoy, and files outside db/. */
const BESIDE: Readonly<Record<string, string>> = {
  "README.md": "a repository\n",
  "db/README.md": "db holds more than the chain\n",
  "db/migrations/0001-old.sql": "select 'old';\n",
  "db/seed/seed.sql": "select 'seed';\n",
  "db/schema-old/0001-decoy.sql": "select 'decoy';\n",
  "schema/0001-outside.sql": "select 'outside';\n",
};

export type Repository = { repo: string; first: string; middle: string; last: string };

const commitAll = (repo: string, message: string): string => {
  git(repo, "add", "-A");
  git(repo, "commit", "-q", "-m", message);
  return git(repo, "rev-parse", "HEAD");
};

/**
 * The repository, built: `main` at the third commit and checked out; `middle` at the second; `link` and `gitlink`
 * one commit past the third. Then the working tree changes 0001-a.sql unstaged, stages a new 0004 and a change to
 * r.json, and leaves an untracked 0005 — none of it in any commit.
 */
export function aRepository(): Repository {
  const repo = aTemporaryDirectory("dxb-foundation-upgrade-repo-");
  git(repo, "init", "-q");
  for (const [path, text] of Object.entries(BESIDE)) put(repo, path, text);
  const first = commitAll(repo, "no chain");

  for (const [path, bytes] of Object.entries(MIDDLE_CHAIN)) put(repo, join("db", path), bytes);
  symlinkSync("0001-old.sql", join(repo, "db/migrations/latest.sql"));
  symlinkSync("README.md", join(repo, "link-outside"));
  const middle = commitAll(repo, "a chain beside other files");

  rmSync(join(repo, "db/reference/nested"), { recursive: true });
  for (const [path, bytes] of Object.entries(LAST_CHAIN)) put(repo, join("db", path), bytes);
  const last = commitAll(repo, "the chain changed");
  git(repo, "branch", "middle", middle);

  git(repo, "checkout", "-q", "-b", "link");
  symlinkSync("0001-a.sql", join(repo, "db/schema/0009-link.sql"));
  commitAll(repo, "a link in the chain");
  git(repo, "checkout", "-q", "main");

  git(repo, "checkout", "-q", "-b", "gitlink");
  git(repo, "update-index", "--add", "--cacheinfo", `160000,${first},db/functions/sub`);
  git(repo, "commit", "-q", "-m", "a gitlink in the chain");
  git(repo, "checkout", "-q", "main");
  rmSync(join(repo, "db/functions/sub"), { recursive: true, force: true });

  put(repo, "db/schema/0001-a.sql", "changed in the working tree\n");
  put(repo, "db/schema/0004-staged.sql", "select 'staged';\n");
  put(repo, "db/reference/r.json", '["staged"]\n');
  git(repo, "add", "--", "db/schema/0004-staged.sql", "db/reference/r.json");
  put(repo, "db/schema/0005-untracked.sql", "select 'untracked';\n");
  return { repo, first, middle, last };
}

/** Every file under `directory`, path → bytes, links followed by no one; `.git` included when it stands there. */
export function filesUnder(directory: string, prefix = ""): Record<string, Buffer> {
  const found: Record<string, Buffer> = {};
  for (const entry of readdirSync(join(directory, prefix), { withFileTypes: true })) {
    const path = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory()) Object.assign(found, filesUnder(directory, path));
    else found[path] = readFileSync(join(directory, path));
  }
  return found;
}

/**
 * What stands in the repository — the working tree and every file of `.git`, HEAD and the index among them — as
 * path → what it is: a file's SHA-256, a link's target, a directory. Read from the disk alone: no git command, which
 * could refresh the index itself.
 */
export function stateOf(directory: string, prefix = ""): Record<string, string> {
  const state: Record<string, string> = {};
  for (const name of readdirSync(join(directory, prefix))) {
    const path = prefix === "" ? name : `${prefix}/${name}`;
    const stat = lstatSync(join(directory, path));
    if (stat.isSymbolicLink()) state[path] = `link ${readlinkSync(join(directory, path))}`;
    else if (stat.isDirectory()) {
      state[path] = "directory";
      Object.assign(state, stateOf(directory, path));
    } else state[path] = `file ${createHash("sha256").update(readFileSync(join(directory, path))).digest("hex")}`;
  }
  return state;
}
