// `cli.ts rows [--kept <file>]` (piece 6b's SPEC §5): what it answers for its words, in the manner of `snapshot`'s
// (6a's SPEC §5). It lives apart from cli.ts: loading that file runs the command.
import { TargetRefused, connectionString } from "@dxb-foundation/bench";
import { bytesOfAFileAt, printedLines } from "../snapshot/command.ts";
import type { Printed } from "../snapshot/command.ts";
import { utf8Of } from "../snapshot/text.ts";
import { rowsOf } from "./read.ts";
import { isARowsText, keptOf } from "./text.ts";

const USAGE = printedLines(["usage: cli.ts rows [--kept <file>]"], 2);

/**
 * The words after `rows`, when they are its one call spelled as its usage line says: none, or `--kept` and a file —
 * a word that begins with `--` is no file, as it is no value of `up`'s options. Nothing otherwise.
 */
function callOf(words: readonly string[]): { kept?: string } | undefined {
  if (words.length === 0) return {};
  const [option, file] = words;
  if (words.length !== 2 || option !== "--kept" || !file || file.startsWith("--")) return undefined;
  return { kept: file };
}

/**
 * The earlier text at `path`, or why `--kept` refuses it (§5): `no-before` when it is absent, no regular file or
 * cannot be read; `before-malformed` when it is not UTF-8 or not a rows' text.
 */
function beforeAt(path: string): { text: string } | "no-before" | "before-malformed" {
  const bytes = bytesOfAFileAt(path);
  if (bytes === undefined) return "no-before";
  const text = utf8Of(bytes);
  return text !== undefined && isARowsText(text) ? { text } : "before-malformed";
}

/**
 * The answer to `rows …` (§5's table). The file is judged before any connection; the bench's guard's refusal is a row
 * of the table. Any other failure is no answer of the command's and is thrown on. The difference is never cut short.
 */
export async function rowsAnswer(words: readonly string[]): Promise<Printed> {
  const call = callOf(words);
  if (call === undefined) return USAGE;
  const before = call.kept === undefined ? undefined : beforeAt(call.kept);
  if (typeof before === "string") return printedLines([`ROWS_REFUSED ${before}`], 2);
  let text: string;
  try {
    text = await rowsOf({ connectionString: connectionString() });
  } catch (failure) {
    if (failure instanceof TargetRefused) return printedLines([`ROWS_REFUSED target-${failure.reason}`], 2);
    throw failure;
  }
  if (before === undefined) return { stdout: text, exit: 0 };
  const { lost, back, rows, sequences } = keptOf(before.text, text);
  if (lost.length === 0 && back.length === 0) return printedLines([`ROWS_KEPT rows=${rows} sequences=${sequences}`], 0);
  const minus = (lines: readonly string[]): number => lines.filter((line) => line.startsWith("- ")).length;
  return printedLines([...lost, ...back, `ROWS_RED lost=${minus(lost)} back=${minus(back)}`], 1);
}
