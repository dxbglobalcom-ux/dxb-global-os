// `cli.ts inventory` and `cli.ts outside --before <file> [--check <file>]` (piece 6c's SPEC §5): what they answer for
// their words, in the manner of `snapshot`'s (6a's SPEC §5). It lives apart from cli.ts: loading that file runs the command.
import { TargetRefused, connectionString } from "@dxb-foundation/bench";
import { bytesOfAFileAt, printedLines } from "../snapshot/command.ts";
import type { Printed } from "../snapshot/command.ts";
import { differenceOf, redLines, utf8Of } from "../snapshot/text.ts";
import { inventoryOf } from "./read.ts";
import { isAnInventory, isAnOutsideText, outsideOf } from "./text.ts";

const INVENTORY_USAGE = printedLines(["usage: cli.ts inventory"], 2);
const OUTSIDE_USAGE = printedLines(["usage: cli.ts outside --before <file> [--check <file>]"], 2);

/** The inventory of the bench's own target, or the guard's refusal as `<refused> target-<reason>`; any other failure is thrown on. */
async function inventoryNow(refused: string): Promise<{ text: string } | Printed> {
  try {
    return { text: await inventoryOf({ connectionString: connectionString() }) };
  } catch (failure) {
    if (failure instanceof TargetRefused) return printedLines([`${refused} target-${failure.reason}`], 2);
    throw failure;
  }
}

/** The answer to `inventory …` (§5's table): no word after it, or its usage line. */
export async function inventoryAnswer(words: readonly string[]): Promise<Printed> {
  if (words.length !== 0) return INVENTORY_USAGE;
  const now = await inventoryNow("INVENTORY_REFUSED");
  return "text" in now ? { stdout: now.text, exit: 0 } : now;
}

/** A word that is a file: not empty, and not an option — a word that begins with `--` is no value, as of `up`'s options. */
const aFile = (word: string | undefined): word is string => word !== undefined && word !== "" && !word.startsWith("--");

/**
 * The words after `outside`, when they are its one call spelled as its usage line says: `--before` and a file, then
 * optionally `--check` and a file — the options in this order, each once. Nothing otherwise.
 */
function callOf(words: readonly string[]): { before: string; check?: string } | undefined {
  const [option, before, checkOption, check] = words;
  if (option !== "--before" || !aFile(before)) return undefined;
  if (words.length === 2) return { before };
  if (words.length === 4 && checkOption === "--check" && aFile(check)) return { before, check };
  return undefined;
}

/**
 * The text at `path` when it is of the spelling `spelled` judges, or why it is refused: `no-<what>` when it is absent,
 * no regular file or cannot be read; `<what>-malformed` when it is not UTF-8 or not of that spelling.
 */
function textAt(path: string, what: string, spelled: (text: string) => boolean): { text: string } | string {
  const bytes = bytesOfAFileAt(path);
  if (bytes === undefined) return `no-${what}`;
  const text = utf8Of(bytes);
  return text !== undefined && spelled(text) ? { text } : `${what}-malformed`;
}

/**
 * The answer to `outside …` (§5's table). Both files are judged before any connection, the `--before` file first; the
 * bench's guard's refusal is a row of the table. Any other failure is no answer of the command's and is thrown on. The
 * difference is never cut short.
 */
export async function outsideAnswer(words: readonly string[]): Promise<Printed> {
  const call = callOf(words);
  if (call === undefined) return OUTSIDE_USAGE;
  const before = textAt(call.before, "before", isAnInventory);
  if (typeof before === "string") return printedLines([`OUTSIDE_REFUSED ${before}`], 2);
  const expected = call.check === undefined ? undefined : textAt(call.check, "expected", isAnOutsideText);
  if (typeof expected === "string") return printedLines([`OUTSIDE_REFUSED ${expected}`], 2);
  const now = await inventoryNow("OUTSIDE_REFUSED");
  if (!("text" in now)) return now;
  const text = outsideOf(before.text, now.text);
  if (expected === undefined) return { stdout: text, exit: 0 };
  if (expected.text === text) return printedLines([`OUTSIDE_EQUAL lines=${text.split("\n").length - 1}`], 0);
  return printedLines(redLines(differenceOf(expected.text, text), "OUTSIDE_RED"), 1);
}
