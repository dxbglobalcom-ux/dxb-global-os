// node foundation/lock/src/cli.ts <lock|verify> …
//
//   lock <piece> [<dir>…] [--keep]
//   verify <piece> [--rev <commit>] [--keep]
//   verify --all [--rev <commit>] [--keep]
//
// Stdout is the judge's alone: its lines, and last the one of SPEC §5's table,
// with the exit code beside it. What a child prints goes to standard error.
import { candidateOf, repositoryRoot } from "./git.ts";
import { lockPiece } from "./lock.ts";
import { Refused, refusalOf, stopTheWork } from "./run.ts";
import { EXTRACTED_INTO, verifyAll, verifyPiece } from "./verify.ts";

const USAGE = "usage: cli.ts lock <piece> [<dir>…] [--keep] | verify <piece> [--rev <commit>] [--keep] | verify --all [--rev <commit>] [--keep]";

/** The arguments after the call's name: the words, and what each `--` argument says. A spelling that is not known is a refusal. */
function readArguments(args: readonly string[]): { words: string[]; flags: Set<string>; values: Map<string, string> } {
  const words: string[] = [];
  const flags = new Set<string>();
  const values = new Map<string, string>();
  for (let at = 0; at < args.length; at += 1) {
    const arg = args[at] ?? "";
    if (arg === "--keep" || arg === "--all") flags.add(arg);
    else if (arg === "--rev" || arg === EXTRACTED_INTO) {
      const value = args[(at += 1)];
      if (value === undefined) throw new Refused(`${arg} names nothing — ${USAGE}`);
      values.set(arg, value);
    } else if (arg.startsWith("--")) throw new Refused(`${arg} is not known — ${USAGE}`);
    else words.push(arg);
  }
  return { words, flags, values };
}

async function answer(call: string | undefined, args: readonly string[]): Promise<number> {
  const { words, flags, values } = readArguments(args);
  const [piece, ...dirs] = words;
  const keep = flags.has("--keep");
  const root = repositoryRoot();
  if (call === "lock" && piece !== undefined && !flags.has("--all") && values.size === 0) return lockPiece(root, piece, dirs, keep);
  if (call === "verify" && dirs.length === 0 && flags.has("--all") !== (piece !== undefined)) {
    const rev = values.get("--rev");
    const candidate = candidateOf(root, rev);
    if (piece !== undefined) return verifyPiece(root, piece, candidate, { rev, keep, extractedInto: values.get(EXTRACTED_INTO) });
    // A judge extracts its tool for one piece, never for all of them.
    if (!values.has(EXTRACTED_INTO)) return verifyAll(root, candidate, { rev, keep });
  }
  throw new Refused(USAGE);
}

// From here on a signal stops the children and unwinds the command: the work directory is removed on that path too.
// SIGHUP among them: a terminal that closes on an unattended run must not leave the copy and what runs in it (SPEC §10 item 9).
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const) process.on(signal, () => stopTheWork(signal));
process.exitCode = await answer(process.argv[2], process.argv.slice(3)).catch(refusalOf);
