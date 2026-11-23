// The disk against the ledger, in both directions (SPEC §4's second table). Pure.
import { numberOf } from "./disk.ts";
import type { ChainFile } from "./disk.ts";
import { inOrder } from "./outcome.ts";
import type { Offence } from "./outcome.ts";

/** One row of kind `schema`. */
export type LedgerRow = { position: number; file: string; hash: string };

/**
 * The ledger against the disk — what became of each ledgered name: `changed`, `renamed` or `missing`, one offence
 * per fault, the most specific. Answers with them the names the renames went to: those files are no new files.
 */
function ledgerAgainstDisk(
  rows: readonly LedgerRow[],
  files: readonly ChainFile[],
  unledgered: readonly ChainFile[],
): { offences: Offence[]; renamedTo: Set<string> } {
  const onDisk = new Map(files.map((file) => [file.name, file]));
  const offences: Offence[] = [];
  const renamedTo = new Set<string>();
  for (const row of rows) {
    const file = onDisk.get(row.file);
    if (file !== undefined) {
      if (file.hash !== row.hash) offences.push({ kind: "changed", detail: row.file });
      continue;
    }
    // A rename is said only when it can be: exactly one new file carries the hash. Two leave it unsaid which.
    const [carrier, ...others] = unledgered.filter((candidate) => candidate.hash === row.hash);
    if (carrier === undefined || others.length > 0) {
      offences.push({ kind: "missing", detail: row.file });
      continue;
    }
    offences.push({ kind: "renamed", detail: `${row.file} ${carrier.name}` });
    renamedTo.add(carrier.name);
  }
  return { offences, renamedTo };
}

/** Pure. SPEC §4's second table: the disk against the ledger. */
export function compare(files: readonly ChainFile[], ledger: readonly LedgerRow[]): { offences: Offence[]; pending: ChainFile[] } {
  const rows = [...ledger].sort((one, other) => one.position - other.position);
  const ledgered = new Set(rows.map((row) => row.file));
  const unledgered = files.filter((file) => !ledgered.has(file.name)).sort((one, other) => one.number - other.number);

  const { offences, renamedTo } = ledgerAgainstDisk(rows, files, unledgered);

  // The disk against the ledger — a new file at or before an applied one — and the ledger's own order.
  // A ledgered name that carries no number is NaN here and takes no part in the order: no file
  // of the chain can have that name, so it is already said as missing or renamed.
  const numbers = rows.map((row) => numberOf(row.file));
  const greatest = numbers.reduce((most, number) => (number > most ? number : most), Number.NEGATIVE_INFINITY);
  for (const file of unledgered) {
    if (!renamedTo.has(file.name) && file.number <= greatest) offences.push({ kind: "before-applied", detail: file.name });
  }
  rows.forEach((row, index) => {
    const before = numbers[index - 1];
    const own = numbers[index];
    if (before !== undefined && own !== undefined && own <= before) offences.push({ kind: "reordered", detail: row.file });
  });

  return { offences: inOrder(offences), pending: offences.length > 0 ? [] : unledgered };
}
