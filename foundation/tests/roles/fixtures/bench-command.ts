// The bench's command for the call piece 1's fixture does not know: `logins` (piece 5's SPEC §6). Started as it is
// run — `node foundation/bench/src/cli.ts <call>` from the repository root, an argument array and no shell, with an
// environment that holds PATH and nothing else of the caller's — as `bench/fixtures/real-bench.ts` starts the others.
import { execFile } from "node:child_process";
import { expect } from "vitest";
import { repositoryRoot } from "../../bench/fixtures/real-bench.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { THE_FOUR, partsOf, storedPasswords } from "./catalogue.ts";
import { passwordsIfReadable } from "./the-logins-file.ts";

const CLI = "foundation/bench/src/cli.ts";

/** How the command ended: its exit code, the last non-empty line of its stdout, and what it wrote to each stream. */
export type Said = { code: number; lastLine: string; stdout: string; stderr: string };

/** `node foundation/bench/src/cli.ts <call>`. A command that does not end by itself within `timeoutMs` is an error. */
export function benchCommand(call: string, timeoutMs: number): Promise<Said> {
  return new Promise((resolve, reject) => {
    const options = { cwd: repositoryRoot, timeout: timeoutMs, env: { PATH: process.env.PATH }, maxBuffer: 16 * 1024 * 1024 };
    execFile(process.execPath, [CLI, call], options, (error, stdout, stderr) => {
      const lastLine = stdout.split("\n").filter((line) => line.trim() !== "").at(-1)?.trimEnd() ?? "";
      if (error === null) resolve({ code: 0, lastLine, stdout, stderr });
      else if (typeof error.code === "number") resolve({ code: error.code, lastLine, stdout, stderr });
      // A fixed text: Node's message for a child that was killed embeds the child's stderr, which no one checked for secrets.
      else reject(new Error(`the bench command "${call}" did not end by itself within ${timeoutMs} ms, or could not be started`));
    });
  });
}

/** `logins`, the install step. */
export const logins = (timeoutMs: number): Promise<Said> => benchCommand("logins", timeoutMs);

/**
 * True when no stream of the command holds any of these texts. Answered as a boolean, so that an assertion on it
 * never prints a secret — whatever the command wrote.
 */
export const holdsNoneOf = (said: Said, secrets: readonly string[]): boolean =>
  secrets.every((secret) => !said.stdout.includes(secret) && !said.stderr.includes(secret));

/** The end of what the command wrote, for an assertion's message — said only once `holdsNoneOf` was asked of it. */
export const tailOf = (said: Said): string => `${said.stdout}\n${said.stderr}`.slice(-1_500);

/** What a command's output is searched for: these passwords, every part of these verifiers, and any verifier's prefix. */
export const secretsToSeek = (passwords: Iterable<string>, verifiers: Iterable<string>): string[] => [
  ...passwords,
  ...partsOf(verifiers),
  "SCRAM-SHA-256$",
];

/**
 * The four logins' stored verifiers, read as the installer — none when no instance stands (B.15, after `down`: the
 * connection is refused) and none for a role that does not stand yet (B.1, before the chain: the read finds no row).
 * Any other failure is the case's own and is thrown.
 */
async function verifiersIfStanding(): Promise<string[]> {
  try {
    const stored = await onTheInstance(storedPasswords);
    return THE_FOUR.map((role) => stored.get(role) ?? "");
  } catch (error) {
    if ((error as { code?: unknown }).code === "ECONNREFUSED") return [];
    throw error;
  }
}

/**
 * `logins` run; what it said is first seen to hold no password of the secret file and no part of a stored verifier,
 * each as it stood before the run and as it stands after, and no verifier's prefix — only then is its answer looked
 * at, with its output beside a failing expectation.
 */
export async function loginsSaying(expected: string, code: number, timeoutMs: number): Promise<Said> {
  const [passwordsBefore, verifiersBefore] = [passwordsIfReadable(THE_FOUR), await verifiersIfStanding()];
  const said = await logins(timeoutMs);
  const [passwordsAfter, verifiersAfter] = [passwordsIfReadable(THE_FOUR), await verifiersIfStanding()];
  expect(holdsNoneOf(said, secretsToSeek([...passwordsBefore, ...passwordsAfter], [...verifiersBefore, ...verifiersAfter]))).toBe(true);
  expect(said.lastLine, tailOf(said)).toBe(expected);
  expect(said.code).toBe(code);
  return said;
}
