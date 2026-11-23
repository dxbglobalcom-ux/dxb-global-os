// The chain's command as it is run: a subprocess started by path from the
// repository root, with an environment that holds PATH and nothing else.
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../../../../", import.meta.url));

const CLI = "foundation/chain/src/cli.ts";

export type Said = { code: number; lines: string[]; stderr: string };

/**
 * `node foundation/chain/src/cli.ts <args>` — an argument array, no shell.
 * Answers its exit code, the non-empty lines of its stdout — the answer, its
 * last line the verdict — and its stderr; a command that does not end by itself is an error.
 */
export function chainCommand(args: string[], timeoutMs: number): Promise<Said> {
  return new Promise((resolve, reject) => {
    const options = { cwd: repositoryRoot, timeout: timeoutMs, env: { PATH: process.env.PATH } };
    execFile(process.execPath, [CLI, ...args], options, (error, stdout, stderr) => {
      const lines = stdout.split("\n").filter((line) => line.trim() !== "");
      if (error === null) resolve({ code: 0, lines, stderr });
      else if (typeof error.code === "number") resolve({ code: error.code, lines, stderr });
      else reject(new Error(`the chain's command did not end by itself: ${error.message}`));
    });
  });
}
