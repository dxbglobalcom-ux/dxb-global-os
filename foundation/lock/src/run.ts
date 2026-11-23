// How the lock tool runs another program, and how it stops what it runs when it is told to stop.
import { execFileSync, spawn, type ChildProcess, type StdioOptions } from "node:child_process";
import { constants, userInfo } from "node:os";

/** A command that cannot judge: its one line is `LOCK_REFUSED <why>` and its exit code 2 (SPEC §5's table). */
export class Refused extends Error {
  name = "Refused";
}

/**
 * Says why a command cannot judge — the last line of SPEC §5's table — and
 * answers the exit code beside it. A failure that is no refusal cannot judge
 * either: it is shown whole on standard error first.
 */
export function refusalOf(failure: unknown): number {
  if (!(failure instanceof Refused)) console.error(failure);
  console.log(`LOCK_REFUSED ${oneLine(failure instanceof Error ? failure.message : String(failure)) || "a failure that says nothing"}`);
  return 2;
}

/** This user's home as the password database gives it — never as a variable says it (SPEC §5). */
export const home = userInfo().homedir;

/** All a child gets: PATH and HOME, and nothing else of the caller's (SPEC §5). */
const childEnvironment = (): { PATH: string; HOME: string } => ({ PATH: process.env.PATH ?? "", HOME: home });

/** A text on one line, for an offence, a refusal or a note. */
export const oneLine = (text: string): string => text.replace(/\s+/g, " ").trim();

/** git may print this much in one call: a whole tree's listing is the most that is asked of it at once. */
const MOST_PRINTED = 512 * 1024 * 1024;

/**
 * `git` on one repository, with what it printed. `--no-replace-objects`: an
 * object is read as it is stored, never as a replacement ref says it. A call
 * that fails is a refusal — without git's answer nothing can be judged.
 */
export function git(root: string, args: readonly string[], input = ""): string {
  try {
    return execFileSync("git", ["--no-replace-objects", "-C", root, ...args], {
      env: childEnvironment(),
      input,
      encoding: "utf8",
      maxBuffer: MOST_PRINTED,
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (failure) {
    const said = failure instanceof Error && "stderr" in failure ? String(failure.stderr) : String(failure);
    throw new Refused(`git ${args[0]} failed: ${oneLine(said) || oneLine(String(failure))}`);
  }
}

type StopSignal = "SIGINT" | "SIGTERM";

// How to stop each child that runs now, and the signal the command was told to stop by, once it was.
const stopOfEachChild = new Set<(signal: StopSignal) => void>();
let stoppedBy: StopSignal | undefined;

/** The command was told to stop: every child that runs is stopped now, and no other one starts. */
export function stopTheWork(signal: StopSignal): void {
  stoppedBy ??= signal;
  for (const stop of stopOfEachChild) stop(signal);
}

/** Throws once the command was told to stop. */
export function assertNotToldToStop(): void {
  if (stoppedBy !== undefined) throw new Refused(`the command was told to stop by ${stoppedBy}`);
}

export type Start = {
  cwd: string;
  stdio: StdioOptions;
  /**
   * How the child is stopped when the command is told to stop. A group of its
   * own, killed whole — nothing it started goes on. Or, for a child that has
   * children of its own to stop first: the same signal, passed on.
   */
  stoppedBy: "killing-its-group" | "the-same-signal";
};

type Started = { child: ChildProcess; ended: Promise<number> };

function killGroupOf(child: ChildProcess): void {
  if (child.pid === undefined) return;
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    // The group has ended already.
  }
}

/**
 * Starts one program with an argument array — never a shell string. `ended`
 * answers its exit code once it has ended and let go of its output — 128 and
 * the signal's number when a signal ended it. A program that did not run, and
 * any ending after the command was told to stop, is a refusal.
 */
export function start(file: string, args: readonly string[], how: Start): Started {
  assertNotToldToStop();
  const ownGroup = how.stoppedBy === "killing-its-group";
  const child = spawn(file, [...args], { cwd: how.cwd, env: childEnvironment(), stdio: how.stdio, detached: ownGroup });
  const stop = (signal: StopSignal): void => {
    if (ownGroup) killGroupOf(child);
    else child.kill(signal);
  };
  stopOfEachChild.add(stop);
  const ended = new Promise<number>((resolve, reject) => {
    child.on("error", (error: NodeJS.ErrnoException) => {
      stopOfEachChild.delete(stop);
      reject(new Refused(`${file} did not run (${error.code ?? error.message})`));
    });
    child.on("close", (code, signal) => {
      stopOfEachChild.delete(stop);
      // What the child started and left behind ends with it: nothing runs on in a directory about to be removed.
      if (ownGroup) killGroupOf(child);
      if (stoppedBy !== undefined) reject(new Refused(`the command was told to stop by ${stoppedBy}`));
      else resolve(code ?? 128 + (signal === null ? 0 : constants.signals[signal]));
    });
  });
  return { child, ended };
}

/** Runs one program in a group of its own, to its end. Its output goes to this command's standard error; stdout stays the judge's. */
export function run(file: string, args: readonly string[], cwd: string): Promise<number> {
  return start(file, args, { cwd, stdio: ["ignore", 2, 2], stoppedBy: "killing-its-group" }).ended;
}
