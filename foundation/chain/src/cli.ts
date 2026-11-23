// node foundation/chain/src/cli.ts up [--root <dir>] [--wait <seconds>]
// node foundation/chain/src/cli.ts snapshot [--check <file>]
// node foundation/chain/src/cli.ts rows [--kept <file>]
//
// Progress goes to stderr as the run goes; stdout carries the answer of SPEC §8's
// table (piece 6a's SPEC §5 for `snapshot`, piece 6b's §5 for `rows`), its last line
// the verdict, and the exit code is the one beside it. `snapshot` and `rows` alone
// print their text and nothing else.
import { fileURLToPath } from "node:url";
import { TargetRefused, connectionString } from "@dxb-foundation/bench";
import { ChainRefused, answerOf } from "./index.ts";
import { rowsAnswer } from "./rows/command.ts";
import { runChain } from "./run.ts";
import { printedLines, snapshotAnswer } from "./snapshot/command.ts";
import type { Printed } from "./snapshot/command.ts";

type Answer = { lines: string[]; exit: number };

const USAGE: Answer = { lines: ["usage: cli.ts up [--root <dir>] [--wait <seconds>]"], exit: 2 };

/** `db` of this repository — from this file's own location, never from the working directory. */
const DEFAULT_ROOT = fileURLToPath(new URL("../../../db", import.meta.url));

const OPTIONS = ["--root", "--wait"] as const;
type Option = (typeof OPTIONS)[number];

/**
 * What was asked for, or nothing when the words are not the command's one call spelled as the usage line says:
 * `up`, then each option at most once with a value after it — and `--wait` a positive integer of seconds, of
 * five digits at most. A word that begins with `--` is no value: it is an option whose own value was left out.
 * No word of it names a target: there is one, the bench's own.
 */
function callOf(words: readonly string[]): { root: string; lockWaitSeconds?: number } | undefined {
  const [call, ...rest] = words;
  if (call !== "up") return undefined;
  const given = new Map<Option, string>();
  for (let at = 0; at < rest.length; at += 2) {
    const option = OPTIONS.find((known) => known === rest[at]);
    const value = rest[at + 1];
    if (option === undefined || !value || value.startsWith("--") || given.has(option)) return undefined;
    given.set(option, value);
  }
  const wait = given.get("--wait");
  if (wait !== undefined && !/^[1-9]\d{0,4}$/.test(wait)) return undefined;
  return { root: given.get("--root") ?? DEFAULT_ROOT, lockWaitSeconds: wait === undefined ? undefined : Number(wait) };
}

async function answer(words: readonly string[]): Promise<Answer> {
  const call = callOf(words);
  if (call === undefined) return USAGE;
  const say = (line: string): void => {
    process.stderr.write(`[chain] ${line}\n`);
  };
  try {
    return answerOf(await runChain({ target: { connectionString: connectionString() }, ...call }, say));
  } catch (failure) {
    // A refusal is one of the table's rows; anything else is no answer of the command's and is thrown on.
    if (failure instanceof ChainRefused || failure instanceof TargetRefused) return answerOf(failure);
    throw failure;
  }
}

/** `snapshot …` and `rows …` answer their own tables; every other call — `up …` or none of the command's — piece 3's. */
async function printed(words: readonly string[]): Promise<Printed> {
  const [call, ...rest] = words;
  if (call === "snapshot") return snapshotAnswer(rest);
  if (call === "rows") return rowsAnswer(rest);
  const { lines, exit } = await answer(words);
  return printedLines(lines, exit);
}

try {
  const { stdout, exit } = await printed(process.argv.slice(2));
  process.stdout.write(stdout);
  process.exitCode = exit;
} catch (failure) {
  // None of the table's rows: shown whole to whoever reads the run, and nothing is said on stdout.
  console.error(failure);
  process.exitCode = 1;
}
