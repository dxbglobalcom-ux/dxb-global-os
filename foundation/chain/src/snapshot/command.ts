// `cli.ts snapshot [--check <file>]` (piece 6a's SPEC §5): what it answers for its words. It lives apart from cli.ts:
// loading that file runs the command.
import { readFileSync, statSync } from "node:fs";
import { TargetRefused, connectionString } from "@dxb-foundation/bench";
import { snapshotOf } from "./read.ts";
import { differenceOf, isSpelledAsASnapshot, redLines } from "./text.ts";

/** What the command prints on stdout, byte for byte, and its exit code. */
export type Printed = { stdout: string; exit: number };

/** Lines, each ended by `\n`, as the command prints an answer of SPEC §5's table. */
export const printedLines = (lines: readonly string[], exit: number): Printed => ({ stdout: lines.map((line) => `${line}\n`).join(""), exit });

const USAGE = printedLines(["usage: cli.ts snapshot [--check <file>]"], 2);

/**
 * The words after `snapshot`, when they are its one call spelled as its usage line says: none, or `--check` and a
 * file — a word that begins with `--` is no file, as it is no value of `up`'s options. Nothing otherwise.
 */
function callOf(words: readonly string[]): { check?: string } | undefined {
  if (words.length === 0) return {};
  const [option, file] = words;
  if (words.length !== 2 || option !== "--check" || !file || file.startsWith("--")) return undefined;
  return { check: file };
}

/**
 * The bytes of the regular file at `path`, or nothing when it is absent, no regular file or cannot be read — a
 * committed text as the check and piece 6b's `rows --kept` take one. Only reads: neither command writes a file.
 */
export function bytesOfAFileAt(path: string): Buffer | undefined {
  try {
    // A FIFO or a device would be read as it streams, or block: only a regular file is a committed text.
    return statSync(path).isFile() ? readFileSync(path) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The committed text at `path`, or why the check refuses it (SPEC §5): `no-expected` when it is absent, no regular
 * file or cannot be read; `expected-malformed` when it is not a snapshot's spelling.
 */
function expectedAt(path: string): { text: string } | "no-expected" | "expected-malformed" {
  const bytes = bytesOfAFileAt(path);
  if (bytes === undefined) return "no-expected";
  return isSpelledAsASnapshot(bytes) ? { text: bytes.toString("utf8") } : "expected-malformed";
}

/**
 * The answer to `snapshot …` (SPEC §5's table). The file is judged before any connection; the bench's guard's
 * refusal is a row of the table. Any other failure is no answer of the command's and is thrown on.
 */
export async function snapshotAnswer(words: readonly string[]): Promise<Printed> {
  const call = callOf(words);
  if (call === undefined) return USAGE;
  const expected = call.check === undefined ? undefined : expectedAt(call.check);
  if (typeof expected === "string") return printedLines([`SNAPSHOT_REFUSED ${expected}`], 2);
  let text: string;
  try {
    text = await snapshotOf({ connectionString: connectionString() });
  } catch (failure) {
    if (failure instanceof TargetRefused) return printedLines([`SNAPSHOT_REFUSED target-${failure.reason}`], 2);
    throw failure;
  }
  if (expected === undefined) return { stdout: text, exit: 0 };
  if (expected.text === text) return printedLines([`SNAPSHOT_EQUAL lines=${text.split("\n").length - 1}`], 0);
  return printedLines(redLines(differenceOf(expected.text, text)), 1);
}
