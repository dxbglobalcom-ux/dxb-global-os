// The throwaway repository of SPEC §7 — built once per test file, copied per
// case — and the lock command as it is run on it: a subprocess, the fixture as
// its working directory, PATH as its whole environment.
//
// Every git call here names a repository under the temporary directory; nothing
// here stages, commits or configures anything anywhere else.
import { execFile, execFileSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { basename, dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { Offence } from "@dxb-foundation/lock";
import { EXECUTABLE_FILE, FIXTURE_FILES, FOUNDATION_SCRIPTS, OUTSIDE_DEPENDENCY, PIECE, PRODUCT_LINK, SUBJECT, json } from "./fixture-files.ts";

const repositoryRoot = fileURLToPath(new URL("../../../../", import.meta.url));
/** The real tool's entry in this repository — the judge the lead holds. */
export const REAL_ENTRY = join(repositoryRoot, "foundation/lock/src/cli.ts");

const HOME = userInfo().homedir;
/** Where SPEC §5 says a run's work directory is made. */
const WORK_HOME = join(HOME, ".cache", "dxb", "foundation-verify");

type Ran = { code: number; stdout: string; stderr: string };

/** One program, an argument array, no shell. Answers its exit code and what it printed; a timeout is an error. */
function run(file: string, args: string[], cwd: string, env: NodeJS.ProcessEnv): Promise<Ran> {
  return new Promise((resolve, reject) => {
    execFile(file, args, { cwd, env, timeout: 100_000, maxBuffer: 64 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error === null) resolve({ code: 0, stdout, stderr });
      else if (typeof error.code === "number") resolve({ code: error.code, stdout, stderr });
      else reject(new Error(`${file} ${args.join(" ")} did not end by itself: ${error.message}`));
    });
  });
}

// ---- git, in a fixture and nowhere else

/** `git -C <repo> <args>`, what it printed. Blind to the machine's own git configuration; a failing call is an error. */
export function git(repo: string, ...args: string[]): string {
  if (!repo.startsWith(tmpdir() + sep)) throw new Error(`refused: ${repo} is not under the temporary directory`);
  const env = { PATH: process.env.PATH, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };
  return execFileSync("git", ["-C", repo, ...args], { env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

export const read = (repo: string, path: string): string => readFileSync(join(repo, path), "utf8");

/** Writes one file of the working tree and stages nothing. */
export function write(repo: string, path: string, text: string): void {
  mkdirSync(dirname(join(repo, path)), { recursive: true });
  writeFileSync(join(repo, path), text);
}

/** Writes one file and stages it: from then on it is in the candidate. */
export function stage(repo: string, path: string, text: string): void {
  write(repo, path, text);
  git(repo, "add", "--", path);
}

/** Commits what is staged; answers the commit's full id. */
export function commit(repo: string, message: string): string {
  git(repo, "commit", "-q", "-m", message);
  return git(repo, "rev-parse", "HEAD");
}

/** `text` with its one `from` replaced; an error when `from` is not there exactly once — a plant that changes nothing proves nothing. */
export function replacing(text: string, from: string, to: string): string {
  if (text.split(from).length !== 2) throw new Error(`"${from}" is not exactly once in the text to change`);
  return text.replace(from, () => to);
}

// ---- the command

export type Answer = { code: number; lines: string[]; output: string };

/**
 * `node <entry> <args>` with `repo` as the working directory — the entry is the
 * fixture's own copy of the tool unless a case names another. Its environment
 * is PATH and nothing else of the caller's (SPEC §5).
 */
export async function command(repo: string, args: string[], startedWith: { entry?: string; path?: string } = {}): Promise<Answer> {
  const entry = startedWith.entry ?? join(repo, "foundation/lock/src/cli.ts");
  const ran = await run(process.execPath, [entry, ...args], repo, { PATH: startedWith.path ?? process.env.PATH });
  const lines = ran.stdout.split("\n").map((line) => line.trimEnd()).filter((line) => line !== "");
  return { code: ran.code, lines, output: `${ran.stdout}\n${ran.stderr}` };
}

/** The end of what a command printed: enough to say why an expectation on it failed. */
export const tail = (answer: Answer): string => answer.output.slice(-2_000);

/** `lock <piece> [<dir>…]` through the fixture's own entry: the lock file stands in the working tree, or this is an error. */
export async function writeLock(repo: string, piece: string, ...dirs: string[]): Promise<void> {
  const answer = await command(repo, ["lock", piece, ...dirs]);
  if (answer.code !== 0) throw new Error(`lock ${piece} ended with ${answer.code}: ${tail(answer)}`);
}

/**
 * The fixture's piece locked again on what is staged, and the lock committed in
 * one commit with it — a lock commit of the lead's kind. Answers that commit's id.
 */
export async function lockAgainAndCommit(repo: string, message: string): Promise<string> {
  await writeLock(repo, PIECE);
  git(repo, "add", "--", `foundation/locks/${PIECE}.json`);
  return commit(repo, message);
}

/** Every `OFFENCE <kind> <detail>` line of an answer, in the order printed. */
export const offencesOf = (answer: Answer): Offence[] =>
  answer.lines.flatMap((line) => {
    const [, kind, detail] = /^OFFENCE (\S+)(?: (.*))?$/.exec(line) ?? [];
    return kind === undefined ? [] : [{ kind, detail: detail ?? "" }];
  });

type Verdict = { word: string; fields: Record<string, string> };

/** The last line a command printed — `LOCK_RED piece=… offences=…` — as its first word and what each `key=value` after it says. */
export function verdictOf(answer: Answer): Verdict {
  const [word = "", ...rest] = (answer.lines.at(-1) ?? "").split(" ");
  const fields = Object.fromEntries(rest.filter((part) => part.includes("=")).map((part) => part.split(/=(.*)/s).slice(0, 2)));
  return { word, fields };
}

/** Whether `printed` names `commit`: its full id, or a beginning of it no shorter than git's own short form. */
export const namesCommit = (printed: string | undefined, commit: string): boolean =>
  printed !== undefined && printed.length >= 7 && commit.startsWith(printed);

/** The work directories standing under `~/.cache/dxb/foundation-verify/` now. */
export const workDirectories = (): string[] => (existsSync(WORK_HOME) ? readdirSync(WORK_HOME).sort() : []);

/**
 * A work directory as a run that died would have left it: made here, under the
 * work home's real path as the tool spells it, with one file in it. `remove`
 * removes the directory this call made, and nothing else.
 */
export function staleWorkDirectory(): { path: string; leftInIt: string; remove: () => void } {
  mkdirSync(WORK_HOME, { recursive: true });
  const path = mkdtempSync(join(realpathSync(WORK_HOME), "run-"));
  const leftInIt = join(path, "left-by-a-run-that-died");
  writeFileSync(leftInIt, "");
  return { path, leftInIt, remove: () => rmSync(path, { recursive: true, force: true }) };
}

/**
 * A PATH on which `pnpm` is a witness and not the installer: it notes that it
 * was started, and fails. A verify that must stop at the structure is shown to
 * have stopped there by the witness never having been started — no install, so
 * no run either: the runner comes from the install.
 */
export function witnessedInstall(directory: string): { path: string; started: () => boolean } {
  const bin = mkdtempSync(join(directory, "witness-"));
  const note = join(bin, "pnpm-was-started");
  writeFileSync(join(bin, "pnpm"), `#!/bin/sh\necho started >> '${note}'\nexit 1\n`);
  chmodSync(join(bin, "pnpm"), 0o755);
  return { path: `${bin}:${process.env.PATH ?? ""}`, started: () => existsSync(note) };
}

// ---- the build

/** The version of `name` this repository has installed for the package in `packageDir`. */
function installedVersion(packageDir: string, name: string): string {
  const manifest = join(repositoryRoot, packageDir, "node_modules", name, "package.json");
  return (JSON.parse(readFileSync(manifest, "utf8")) as { version: string }).version;
}

/**
 * The fixture's root package file. It names the package manager this repository
 * names: started in a directory that names none, `pnpm` is whatever version the
 * machine last knew — measured 2026-11-23, that one refuses the offline work.
 */
function rootManifest(): string {
  const ours = JSON.parse(readFileSync(join(repositoryRoot, "package.json"), "utf8")) as { packageManager: string };
  return json({
    name: "lock-fixture",
    private: true,
    packageManager: ours.packageManager,
    type: "module",
    scripts: { ...FOUNDATION_SCRIPTS, "not-the-foundations": "node --version" },
  });
}

/**
 * The fixture's workspace file. Its catalog pins what this machine's store
 * already holds — the runner the foundation's tests use and whatever the real
 * tool's package asks of the catalog — so the frozen offline install finds it.
 */
function workspaceFile(): string {
  const tool = JSON.parse(readFileSync(join(repositoryRoot, "foundation/lock/package.json"), "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const pinned = [
    ["vitest", installedVersion("foundation/tests", "vitest")],
    [OUTSIDE_DEPENDENCY, installedVersion("foundation/tests", OUTSIDE_DEPENDENCY)],
    ...Object.keys({ ...tool.dependencies, ...tool.devDependencies }).map((name) => [name, installedVersion("foundation/lock", name)]),
  ];
  return [
    "packages:",
    '  - "foundation/*"',
    '  - "packages/*"',
    "allowBuilds:",
    "  esbuild: false",
    "catalog:",
    ...pinned.map(([name, version]) => `  "${name}": ${version}`),
    "",
  ].join("\n");
}

/**
 * Makes `root` the fixture's repository with everything committed but
 * `foundation/locks/` — the state the first `lock` is run on. The tool in it is
 * a copy of this repository's `foundation/lock/` as it stands now.
 */
export async function makeRepository(root: string): Promise<void> {
  for (const [path, text] of Object.entries(FIXTURE_FILES)) write(root, path, text);
  chmodSync(join(root, EXECUTABLE_FILE), 0o755);
  symlinkSync(PRODUCT_LINK.target, join(root, PRODUCT_LINK.path));
  write(root, "package.json", rootManifest());
  write(root, "pnpm-workspace.yaml", workspaceFile());
  cpSync(join(repositoryRoot, "foundation/lock"), join(root, "foundation/lock"), {
    recursive: true,
    filter: (source) => basename(source) !== "node_modules",
  });
  // The lockfile is resolved from this repository's own: every version it keeps is one the store holds. Resolved
  // from nothing, pnpm picks the newest version it has heard of, and the frozen offline install then misses it.
  cpSync(join(repositoryRoot, "pnpm-lock.yaml"), join(root, "pnpm-lock.yaml"));
  const resolved = await run("pnpm", ["-C", root, "install", "--lockfile-only", "--offline"], root, { PATH: process.env.PATH, HOME });
  if (resolved.code !== 0) throw new Error(`the fixture's lockfile was not made (${resolved.code}): ${resolved.stdout}\n${resolved.stderr}`);

  execFileSync("git", ["init", "-q", "-b", "main", root], { env: { PATH: process.env.PATH } });
  // An empty directory of the fixture for its hooks: no hook of this machine or of this repository ever runs in it.
  mkdirSync(join(root, ".git", "no-hooks"));
  for (const [key, value] of [
    ["user.name", "The Lock Fixture"],
    ["user.email", "fixture@lock.invalid"],
    ["commit.gpgsign", "false"],
    ["core.hooksPath", ".git/no-hooks"],
  ]) {
    git(root, "config", key, value as string);
  }
  git(root, "add", "-A");
  commit(root, "the fixture before its lock");
}

export type Fixture = {
  /** The temporary directory of one test file: the original and every copy of it. */
  directory: string;
  /** The repository as it was built and locked. No case changes it: a case changes a copy. */
  original: string;
  lockCommit: string;
};

/**
 * The fixture of SPEC §7, whole: the repository, then `foundation/locks/`
 * written by the real `lock` command and committed alone — the lock commit.
 */
export async function buildFixture(): Promise<Fixture> {
  const directory = mkdtempSync(join(tmpdir(), "dxb-foundation-lock-fixture-"));
  const original = join(directory, "original");
  try {
    await makeRepository(original);
    await writeLock(original, PIECE, SUBJECT);
    write(original, "foundation/locks/inventory.json", json({ pieces: [{ piece: PIECE, lock: true }] }));
    git(original, "add", "--", "foundation/locks");
    return { directory, original, lockCommit: commit(original, `the lock of ${PIECE}`) };
  } catch (failure) {
    // No fixture is handed out, so nobody else could remove what was made of it.
    rmSync(directory, { recursive: true, force: true });
    throw failure;
  }
}

/** A copy of the original for one case to change. */
export function copyOf(fixture: Fixture): string {
  const copy = mkdtempSync(join(fixture.directory, "case-"));
  // A link is copied as the text it points with: resolved, it would point into the original and git would call it changed.
  cpSync(fixture.original, copy, { recursive: true, verbatimSymlinks: true });
  return copy;
}

/**
 * The fixture of one test file. It is built by the first case that asks for it;
 * when the build fails, every case that asks fails with the build's own reason —
 * a file is never red for a case that was not reached.
 */
export function fixtureOfOneFile(): { ready: () => Promise<Fixture>; remove: () => Promise<void> } {
  let building: Promise<Fixture> | undefined;
  return {
    ready: () => (building ??= buildFixture()),
    /** Removes the temporary directory `buildFixture` made, and nothing else. */
    remove: async () => {
      const fixture = await building?.catch(() => undefined);
      if (fixture !== undefined) rmSync(fixture.directory, { recursive: true, force: true });
    },
  };
}
