// How a run ends (SPEC §7): an outcome it answers, or a refusal it throws.

/** The kinds in the order SPEC §4's two tables list them — the order offences are said in. */
const KINDS = [
  "unknown-entry",
  "duplicated-number",
  "duplicated-content",
  "empty",
  "unreadable",
  "changed",
  "renamed",
  "missing",
  "before-applied",
  "reordered",
] as const;

export type OffenceKind = (typeof KINDS)[number];

export type Offence = { kind: OffenceKind; detail: string };

/** By kind as SPEC §4 lists them, then by detail — by code unit, so the order hangs on no locale. */
export function inOrder(offences: readonly Offence[]): Offence[] {
  const byDetail = (one: string, other: string): number => (one < other ? -1 : one > other ? 1 : 0);
  return [...offences].sort((one, other) => KINDS.indexOf(one.kind) - KINDS.indexOf(other.kind) || byDetail(one.detail, other.detail));
}

export type Outcome =
  // applied now, in order; standing: the schema rows after the run
  | { state: "applied"; applied: string[]; standing: number }
  | { state: "offences"; offences: Offence[] }
  | { state: "file-failed"; file: string; message: string; applied: string[] };

export class ChainRefused extends Error {
  readonly reason: "no-chain" | "busy" | "ledger-unknown" | "ledger-moved" | "target-moved";

  constructor(reason: ChainRefused["reason"], options?: ErrorOptions) {
    super(`chain refused: ${reason}`, options);
    this.name = "ChainRefused";
    this.reason = reason;
  }
}
