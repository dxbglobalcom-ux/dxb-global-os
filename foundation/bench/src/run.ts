// How the bench runs another program, and how it says what it is doing meanwhile.
import { spawn } from "node:child_process";
import { performance } from "node:perf_hooks";
import { home, repositoryRoot } from "./bench.ts";

export type RunOptions = {
  /** Every run is bounded: a program still running after this is stopped and the run is an error. */
  timeoutMs: number;
  /** Added to PATH and HOME, which are all a child otherwise gets. */
  environment?: Readonly<Record<string, string>>;
  /**
   * For a child that makes or changes the stack (SPEC §5b.2): the descriptor of
   * the host lock's open file. The child keeps the kernel's lock until it ends —
   * also when this process is killed first — and it is what the command stops
   * when it is told to stop.
   */
  holdingTheLock?: number;
};

type StopSignal = "SIGINT" | "SIGTERM";

/** A child may print this much; one that prints more is stopped. */
const MOST_PRINTED = 64 * 1024 * 1024;

// How to stop each child that makes or changes the stack and runs now, and the
// signal the command was told to stop by, once it was.
const stopOfEachWorkingChild = new Set<(why: string) => void>();
let stoppedBy: StopSignal | undefined;

/** Throws once the command was told to stop: nothing that makes or changes the stack starts or is recorded after that. */
export function assertNotToldToStop(): void {
  if (stoppedBy !== undefined) throw new Error(`the command was told to stop by ${stoppedBy}`);
}

/** The command was told to stop: the child that makes or changes the stack is stopped now, and no other one starts. */
export function stopTheWork(signal: StopSignal): void {
  stoppedBy ??= signal;
  for (const stop of stopOfEachWorkingChild) stop(`was stopped: the command was told to stop by ${signal}`);
}

export const toldToStopBy = (): StopSignal | undefined => stoppedBy;

/** What a program said, for an error's message: whole when short, else its beginning and its end. */
function excerptOf(printed: string): string {
  const said = printed.trim();
  return said.length <= 3_000 ? said : `${said.slice(0, 1_500)} … ${said.slice(-1_500)}`;
}

/**
 * One program with an argument array — never a shell string — run from the
 * repository root. Its environment is PATH, HOME and what `environment` adds:
 * nothing else of the caller's reaches it, so no variable of the caller's shell
 * can point it at another database. Answers what it printed; any ending but
 * exit 0 is an error that carries what it said.
 *
 * The child leads a process group of its own. Stopping it — at the bound, or
 * when the command is told to stop — kills that whole group, so nothing it
 * started goes on; and it is a kill, so the CLI's start cannot answer with a
 * removal of its own, which goes by project name.
 */
export function run(file: string, args: readonly string[], options: RunOptions): Promise<string> {
  const env = { PATH: process.env.PATH ?? "", HOME: home, ...options.environment };
  const called = `${file} ${args.join(" ")}`;
  const lockDescriptor = options.holdingTheLock;
  return new Promise((resolve, reject) => {
    if (lockDescriptor !== undefined) assertNotToldToStop();
    const lockSlot = lockDescriptor === undefined ? [] : [lockDescriptor];
    const child = spawn(file, [...args], { cwd: repositoryRoot, env, detached: true, stdio: ["ignore", "pipe", "pipe", ...lockSlot] });

    let whyStopped: string | undefined;
    const stop = (why: string): void => {
      whyStopped ??= why;
      if (child.pid === undefined) return;
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        // The group has ended already.
      }
    };
    const printed = { stdout: "", stderr: "" };
    for (const stream of ["stdout", "stderr"] as const) {
      child[stream]?.setEncoding("utf8").on("data", (chunk: string) => {
        printed[stream] += chunk;
        if (printed[stream].length > MOST_PRINTED) stop(`was stopped: it printed more than ${MOST_PRINTED} characters`);
      });
    }
    const bound = setTimeout(() => stop(`was stopped after ${options.timeoutMs} ms`), options.timeoutMs);
    if (lockDescriptor !== undefined) stopOfEachWorkingChild.add(stop);

    const ended = (ending: string | undefined): void => {
      clearTimeout(bound);
      stopOfEachWorkingChild.delete(stop);
      if (ending === undefined) resolve(printed.stdout);
      else reject(new Error(`${called} ${ending}: ${excerptOf(printed.stderr) || excerptOf(printed.stdout)}`));
    };
    child.on("error", (error: NodeJS.ErrnoException) => ended(`did not run (${error.code ?? error.message})`));
    // "close", not "exit": everything the child started that still holds its output has ended too.
    child.on("close", (code, signal) => {
      if (code === 0) ended(undefined);
      else ended(whyStopped ?? (code === null ? `was ended by ${String(signal)}` : `ended with ${code}`));
    });
  });
}

/** The non-empty lines of what a program printed. */
export const linesOf = (printed: string): string[] =>
  printed
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

/** A text on one line, for an answer or a progress line. */
export const oneLine = (text: string): string => text.replace(/\s+/g, " ").trim();

/**
 * One step of the command, said on stderr as it goes: what it is when it
 * starts, how long it took when it ends. Stdout stays the command's answer.
 */
export async function step<T>(name: string, work: () => Promise<T>): Promise<T> {
  const started = performance.now();
  const seconds = (): string => ((performance.now() - started) / 1_000).toFixed(1);
  process.stderr.write(`[bench] ${name} …\n`);
  try {
    const result = await work();
    process.stderr.write(`[bench] ${name} — ${seconds()} s\n`);
    return result;
  } catch (error) {
    process.stderr.write(`[bench] ${name} — failed after ${seconds()} s\n`);
    throw error;
  }
}
