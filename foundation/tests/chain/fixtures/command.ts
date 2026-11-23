// The chain's command as it is run: a subprocess started by path from the
// repository root, with an environment that holds PATH and nothing else — and
// a run of the library in a process of its own, for the case that plants
// variables in the environment a run is started in.
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { Outcome, Target } from "@dxb-foundation/chain";

const repositoryRoot = fileURLToPath(new URL("../../../../", import.meta.url));

const CLI = "foundation/chain/src/cli.ts";
const A_RUN = fileURLToPath(new URL("./a-run-in-its-own-process.ts", import.meta.url));

export type Said = { code: number; lines: string[]; stderr: string };

/** What a process may find in its environment beside PATH: the variables a case plants there. */
type Planted = Readonly<Record<string, string>>;

/**
 * `node <script> <args>` — an argument array, no shell. Answers its exit code,
 * the non-empty lines of its stdout and its stderr; a process that does not end by itself is an error.
 */
function started(script: string, args: string[], planted: Planted, timeoutMs: number): Promise<Said> {
  return new Promise((resolve, reject) => {
    const options = { cwd: repositoryRoot, timeout: timeoutMs, env: { PATH: process.env.PATH, ...planted } };
    execFile(process.execPath, [script, ...args], options, (error, stdout, stderr) => {
      const lines = stdout.split("\n").filter((line) => line.trim() !== "");
      if (error === null) resolve({ code: 0, lines, stderr });
      else if (typeof error.code === "number") resolve({ code: error.code, lines, stderr });
      else reject(new Error(`${script} did not end by itself: ${error.message}`));
    });
  });
}

/**
 * `node foundation/chain/src/cli.ts <args>`. Answers its exit code, the non-empty
 * lines of its stdout — the answer, its last line the verdict — and its stderr.
 */
export const chainCommand = (args: string[], timeoutMs: number): Promise<Said> => started(CLI, args, {}, timeoutMs);

/** How a run in a process of its own ended — and, when a question was asked, the one row a session that process opened with no care taken answered. */
export type RanApart = { outcome: Outcome; aPlainSessionAnswered?: Record<string, unknown> };

/**
 * `applyChain({ target, root })` in a process of its own whose environment holds PATH and `planted`
 * (fixtures/a-run-in-its-own-process.ts). A run that ended in no outcome is an error, with what the process said.
 */
export async function runApart(input: { target: Target; root: string; asked?: string }, planted: Planted, timeoutMs: number): Promise<RanApart> {
  const { target, root, asked } = input;
  const said = await started(A_RUN, [target.connectionString, target.statePath ?? "", root, ...(asked === undefined ? [] : [asked])], planted, timeoutMs);
  const [answer] = said.lines;
  if (said.code !== 0 || answer === undefined) throw new Error(`the run in a process of its own ended ${said.code}: ${said.stderr}`);
  return JSON.parse(answer) as RanApart;
}
