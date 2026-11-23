// What the command prints for a run's ending (SPEC §8's table). It lives apart from cli.ts: loading that file runs the command.
import { TargetRefused } from "@dxb-foundation/bench";
import { ChainRefused } from "./outcome.ts";
import type { Offence, Outcome } from "./outcome.ts";

/** A text on one line: the server's message may span several, and so may the name of an entry of `schema/` or of a function. */
const oneLine = (text: string): string => text.replace(/\s+/g, " ").trim();

/** One line for each offence, as they were given. */
const offenceLines = (offences: readonly Offence[]): string[] => offences.map(({ kind, detail }) => `OFFENCE ${kind} ${oneLine(detail)}`);

/** Pure. What the command prints on stdout for an outcome or a refusal, and its exit code (SPEC §8). */
export function answerOf(result: Outcome | ChainRefused | TargetRefused): { lines: string[]; exit: number } {
  if (result instanceof ChainRefused) return { lines: [`CHAIN_REFUSED ${result.reason}`], exit: 2 };
  if (result instanceof TargetRefused) return { lines: [`CHAIN_REFUSED target-${result.reason}`], exit: 2 };
  switch (result.state) {
    case "applied": {
      // Each pass's count only when the pass ran — a 0 among them (piece 4's SPEC §8): functions first, then reference.
      const functions = result.functions === undefined ? "" : ` functions=${result.functions}`;
      const reference = result.reference === undefined ? "" : ` reference=${result.reference}`;
      return { lines: [`CHAIN_GREEN applied=${result.applied.length} standing=${result.standing}${functions}${reference}`], exit: 0 };
    }
    case "offences":
      return { lines: [...offenceLines(result.offences), `CHAIN_RED offences=${result.offences.length}`], exit: 1 };
    case "file-failed":
      return { lines: [`FAILED ${result.file} ${oneLine(result.message)}`, `CHAIN_RED file-failed applied=${result.applied.length}`], exit: 1 };
    case "pass-failed":
      return {
        lines: [`FAILED ${result.pass}/${result.file} ${oneLine(result.message)}`, `CHAIN_RED ${result.pass}-failed applied=${result.applied.length}`],
        exit: 1,
      };
    case "manifest":
      return { lines: [...offenceLines(result.offences), `CHAIN_RED manifest offences=${result.offences.length} applied=${result.applied.length}`], exit: 1 };
  }
}
