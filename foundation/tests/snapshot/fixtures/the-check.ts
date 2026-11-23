// The snapshot's command as it is run (SPEC §5): `node foundation/chain/src/cli.ts snapshot [--check <file>]`, a
// child started from the repository root with PATH and nothing else — and what a case asks of its answer. The
// differences a case expects are written in the case, by hand; here they are only put in the order SPEC §5 prints.
import { execFile } from "node:child_process";
import { expect } from "vitest";
import { repositoryRoot } from "../../bench/fixtures/real-bench.ts";
import { chainCommand, type Said } from "../../chain/fixtures/command.ts";
import { COMMAND_MS } from "../../roles/fixtures/the-run.ts";

export { COMMAND_MS };

/** Ascending by UTF-8 bytes, as SPEC §4.2 and §5 sort — not by UTF-16 code units. */
export const byBytes = (one: string, other: string): number => Buffer.compare(Buffer.from(one, "utf8"), Buffer.from(other, "utf8"));
export const sortedByBytes = (lines: readonly string[]): string[] => [...lines].sort(byBytes);

/** `snapshot --check <file>`: its exit code, the non-empty lines of its stdout, its stderr. */
export const check = (file: string): Promise<Said> => chainCommand(["snapshot", "--check", file], COMMAND_MS);

/**
 * `snapshot` with no option: its stdout whole, byte for byte — not split into lines — and its exit code. Started as
 * chainCommand starts the chain's command: by path, from the repository root, PATH alone in its environment.
 */
export function snapshotPrinted(timeoutMs = COMMAND_MS): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const options = { cwd: repositoryRoot, timeout: timeoutMs, env: { PATH: process.env.PATH }, maxBuffer: 64 * 1024 * 1024 };
    execFile(process.execPath, ["foundation/chain/src/cli.ts", "snapshot"], options, (error, stdout, stderr) => {
      if (error === null) resolve({ code: 0, stdout, stderr });
      else if (typeof error.code === "number") resolve({ code: error.code, stdout, stderr });
      else reject(new Error(`snapshot did not end by itself: ${error.message}`));
    });
  });
}

const RED = /^SNAPSHOT_RED expected_only=(\d+) database_only=(\d+)$/;

/** What a failing expectation shows of an answer: its lines and the end of its stderr. */
export const shown = (said: Said): string => `${said.lines.join("\n")}\n--- stderr\n${said.stderr.slice(-1_500)}`;

/** The check said SNAPSHOT_EQUAL lines=<n> for the file, exit 0, and nothing else on stdout. */
export async function expectEqual(file: string, lineCount: number): Promise<void> {
  const said = await check(file);
  expect(said.lines, shown(said)).toEqual([`SNAPSHOT_EQUAL lines=${lineCount}`]);
  expect(said.code).toBe(0);
}

export type Difference = { expectedOnly: string[]; actualOnly: string[] };

/**
 * A red answer read back into its two lists, after its form is seen to be SPEC §5's: every line but the last is
 * `- <line>` or `+ <line>`, ordered by the line's bytes with `-` before `+` for one line; the last is the verdict,
 * whose counts are the lists' lengths; exit 1.
 */
export function differenceSaid(said: Said): Difference {
  const verdict = RED.exec(said.lines.at(-1) ?? "");
  expect(verdict, shown(said)).not.toBeNull();
  expect(said.code).toBe(1);
  const body = said.lines.slice(0, -1);
  for (const line of body) expect(line.startsWith("- ") || line.startsWith("+ "), shown(said)).toBe(true);
  const ordered = [...body].sort((one, other) => byBytes(one.slice(2), other.slice(2)) || (one[0] === other[0] ? 0 : one[0] === "-" ? -1 : 1));
  expect(body, "the difference is printed in SPEC §5's order").toEqual(ordered);
  const expectedOnly = body.filter((line) => line.startsWith("- ")).map((line) => line.slice(2));
  const actualOnly = body.filter((line) => line.startsWith("+ ")).map((line) => line.slice(2));
  expect([expectedOnly.length, actualOnly.length]).toEqual([Number(verdict?.[1]), Number(verdict?.[2])]);
  return { expectedOnly, actualOnly };
}

/** The check is red against the file by exactly these lines, each list written by the case. */
export async function expectRedBy(file: string, expected: { expectedOnly?: readonly string[]; actualOnly?: readonly string[] }): Promise<void> {
  const said = await check(file);
  expect(differenceSaid(said), shown(said)).toEqual({
    expectedOnly: sortedByBytes(expected.expectedOnly ?? []),
    actualOnly: sortedByBytes(expected.actualOnly ?? []),
  });
}

/** The kind word a line begins with. */
export const kindOf = (line: string): string => line.slice(0, line.indexOf(" "));

/**
 * The check is red, every line it names is of one of these kinds, and these lines are among them — for a change
 * whose lines SPEC §4 does not let the case write down whole (the server's own extension, SPEC §6 B.8).
 */
export async function expectRedAmong(
  file: string,
  among: { expectedOnly?: readonly string[]; actualOnly?: readonly string[] },
  kinds: readonly string[],
): Promise<Difference> {
  const said = await check(file);
  const difference = differenceSaid(said);
  expect(difference.expectedOnly, shown(said)).toEqual(expect.arrayContaining([...(among.expectedOnly ?? [])]));
  expect(difference.actualOnly, shown(said)).toEqual(expect.arrayContaining([...(among.actualOnly ?? [])]));
  const strayKinds = [...difference.expectedOnly, ...difference.actualOnly].map(kindOf).filter((kind) => !kinds.includes(kind));
  expect([...new Set(strayKinds)], shown(said)).toEqual([]);
  return difference;
}
