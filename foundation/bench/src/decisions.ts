// The pure decisions of SPEC §5b.8, exported so that tests pin them. Three live
// beside what they decide for and are named here for the contract: statusOf in
// instance.ts, the exposure and config checks in make.ts. answerOf lives here —
// it stands above them all, and the command's file runs the command when loaded.
import { TargetRefused } from "./guard.ts";
import { LockRefused } from "./lock.ts";
import { LoginsRefused } from "./logins.ts";
import { InstanceStands } from "./make.ts";
import { RemovalRefused } from "./removal.ts";
import { oneLine } from "./run.ts";

export { statusOf } from "./instance.ts";
export { configMismatch, exposedBeyondLoopback } from "./make.ts";

/** The line and the exit code of a call that did not end well (SPEC §4, the command's table). */
export function answerOf(failure: unknown): { line: string; exit: number } {
  if (failure instanceof LockRefused) return { line: "LOCK_REFUSED", exit: 2 };
  if (failure instanceof InstanceStands) return { line: "INSTANCE_STANDS", exit: 3 };
  if (failure instanceof TargetRefused) return { line: `TARGET_REFUSED reason=${failure.reason}`, exit: 4 };
  if (failure instanceof RemovalRefused) return { line: `REMOVAL_REFUSED ${oneLine(failure.message)}`, exit: 4 };
  // Every refusal of the install step (piece 5's SPEC §6): its reason says a role and a fault at most — never a secret.
  if (failure instanceof LoginsRefused) return { line: `LOGINS_REFUSED ${failure.reason}`, exit: 6 };
  return { line: oneLine(String(failure)), exit: 1 };
}
