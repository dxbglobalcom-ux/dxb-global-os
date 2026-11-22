import type { Identity, Queryable } from "./identity.ts";
import { NotBuilt } from "./not-built.ts";

export type RefusalReason = "company" | "old-bench" | "not-listed" | "unreadable";

export class TargetRefused extends Error {
  readonly reason: RefusalReason;
  readonly identity?: Identity;

  constructor(reason: RefusalReason, identity?: Identity) {
    super(`target refused: ${reason}`);
    this.reason = reason;
    this.identity = identity;
  }
}

/** Pure. A refused identity wins over the list. */
export function decide(
  identity: Identity,
  listed: readonly Identity[],
): { allowed: true } | { allowed: false; reason: Exclude<RefusalReason, "unreadable"> } {
  throw new NotBuilt("decide");
}

/** Reads the identity ON `conn`, decides against the list file; throws TargetRefused. */
export function assertFoundationTarget(conn: Queryable, opts?: { statePath?: string }): Promise<Identity> {
  throw new NotBuilt("assertFoundationTarget");
}

/** assertFoundationTarget on `conn`, then `work(conn)` on the same `conn`. */
export function guarded<T>(
  conn: Queryable,
  work: (conn: Queryable) => Promise<T>,
  opts?: { statePath?: string },
): Promise<T> {
  throw new NotBuilt("guarded");
}
