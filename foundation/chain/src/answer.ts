// What the command prints for a run's ending (SPEC §8's table). It lives apart from cli.ts: loading that file runs the command.
import { TargetRefused } from "@dxb-foundation/bench";
import { ChainRefused } from "./outcome.ts";
import type { Outcome } from "./outcome.ts";

/** A text on one line: the server's message may span several, and so may the name of an entry of `schema/`. */
const oneLine = (text: string): string => text.replace(/\s+/g, " ").trim();

/** Pure. What the command prints on stdout for an outcome or a refusal, and its exit code (SPEC §8). */
export function answerOf(result: Outcome | ChainRefused | TargetRefused): { lines: string[]; exit: number } {
  if (result instanceof ChainRefused) return { lines: [`CHAIN_REFUSED ${result.reason}`], exit: 2 };
  if (result instanceof TargetRefused) return { lines: [`CHAIN_REFUSED target-${result.reason}`], exit: 2 };
  switch (result.state) {
    case "applied":
      return { lines: [`CHAIN_GREEN applied=${result.applied.length} standing=${result.standing}`], exit: 0 };
    case "offences":
      return {
        lines: [...result.offences.map(({ kind, detail }) => `OFFENCE ${kind} ${oneLine(detail)}`), `CHAIN_RED offences=${result.offences.length}`],
        exit: 1,
      };
    case "file-failed":
      return { lines: [`FAILED ${result.file} ${oneLine(result.message)}`, `CHAIN_RED file-failed applied=${result.applied.length}`], exit: 1 };
  }
}
