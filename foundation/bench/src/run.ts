// How the bench runs another program, and how it says what it is doing meanwhile.
import { execFile } from "node:child_process";
import { homedir } from "node:os";
import { performance } from "node:perf_hooks";
import { repositoryRoot } from "./bench.ts";

export type RunOptions = {
  /** Every run is bounded: a program still running after this is stopped and the run is an error. */
  timeoutMs: number;
  /** Added to PATH and HOME, which are all a child otherwise gets. */
  environment?: Readonly<Record<string, string>>;
};

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
 */
export function run(file: string, args: readonly string[], options: RunOptions): Promise<string> {
  const env = { PATH: process.env.PATH ?? "", HOME: homedir(), ...options.environment };
  const called = `${file} ${args.join(" ")}`;
  return new Promise((resolve, reject) => {
    const bounds = { cwd: repositoryRoot, env, timeout: options.timeoutMs, maxBuffer: 64 * 1024 * 1024 };
    execFile(file, [...args], bounds, (error, stdout, stderr) => {
      if (error === null) return resolve(stdout);
      const ending =
        typeof error.code === "number"
          ? `ended with ${error.code}`
          : error.killed
            ? `was stopped after ${options.timeoutMs} ms`
            : `did not run (${error.code ?? error.signal ?? error.message})`;
      reject(new Error(`${called} ${ending}: ${excerptOf(stderr) || excerptOf(stdout)}`));
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
