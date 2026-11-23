// The contract of @dxb-foundation/chain, whole: everything a caller may use is exported here.
//
// A stub: the types and the names of SPEC §7 stand, and no function is built yet —
// each one throws NOT_BUILT, which is what its tests are red by until the runner is written.
import type { TargetRefused } from "@dxb-foundation/bench";

export const RUNNER_VERSION: string = "1";

export type Target = { connectionString: string; statePath?: string };

export type OffenceKind =
  | "unknown-entry"
  | "duplicated-number"
  | "duplicated-content"
  | "empty"
  | "unreadable"
  | "changed"
  | "renamed"
  | "missing"
  | "before-applied"
  | "reordered";

export type Offence = { kind: OffenceKind; detail: string };

export type ChainFile = { name: string; number: number; hash: string; text: string };

/** One row of kind `schema`. */
export type LedgerRow = { position: number; file: string; hash: string };

export type Outcome =
  // applied now, in order; standing: the schema rows after the run
  | { state: "applied"; applied: string[]; standing: number }
  | { state: "offences"; offences: Offence[] }
  | { state: "file-failed"; file: string; message: string; applied: string[] };

export class ChainRefused extends Error {
  readonly reason: "no-chain" | "busy" | "ledger-unknown";

  constructor(reason: ChainRefused["reason"], options?: ErrorOptions) {
    super(`chain refused: ${reason}`, options);
    this.name = "ChainRefused";
    this.reason = reason;
  }
}

/** Reads `<root>/schema`. Files by number; the disk's own offences (SPEC §4). Throws ChainRefused("no-chain"). */
export function readChain(root: string): { files: ChainFile[]; offences: Offence[] } {
  throw new Error("NOT_BUILT");
}

/** Pure. SPEC §4's second table: the disk against the ledger. */
export function compare(files: readonly ChainFile[], ledger: readonly LedgerRow[]): { offences: Offence[]; pending: ChainFile[] } {
  throw new Error("NOT_BUILT");
}

/** SPEC §6. */
export function applyChain(input: { target: Target; root: string; lockWaitSeconds?: number }): Promise<Outcome> {
  throw new Error("NOT_BUILT");
}

/** Pure. What the command prints on stdout for an outcome or a refusal, and its exit code (SPEC §8). */
export function answerOf(result: Outcome | ChainRefused | TargetRefused): { lines: string[]; exit: number } {
  throw new Error("NOT_BUILT");
}
