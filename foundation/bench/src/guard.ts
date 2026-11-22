import { readFileSync } from "node:fs";
import { join } from "node:path";
import { benchDirectory } from "./bench.ts";
import { readIdentity, sameIdentity } from "./identity.ts";
import type { Identity, Queryable } from "./identity.ts";
import { readInstances } from "./instances.ts";

export type RefusalReason = "company" | "old-bench" | "not-listed" | "unreadable";

export class TargetRefused extends Error {
  readonly reason: RefusalReason;
  readonly identity?: Identity;

  constructor(reason: RefusalReason, identity?: Identity, options?: ErrorOptions) {
    super(`target refused: ${reason}`, options);
    this.name = "TargetRefused";
    this.reason = reason;
    this.identity = identity;
  }
}

/** The clusters refused by name: the keys of `refused.json`. */
type RefusedName = Exclude<RefusalReason, "not-listed" | "unreadable">;
const REFUSED_NAMES: readonly RefusedName[] = ["company", "old-bench"];

let refusedBySysid: ReadonlyMap<string, RefusedName> | undefined;

/**
 * The committed refused identities, cluster identifier → name. Read once. A file
 * that is absent, malformed or names anything but exactly the two throws — it is
 * never an empty list.
 */
function refusedIdentities(): ReadonlyMap<string, RefusedName> {
  if (refusedBySysid !== undefined) return refusedBySysid;
  const file = join(benchDirectory, "refused.json");
  const entries: unknown = JSON.parse(readFileSync(file, "utf8"));
  if (typeof entries !== "object" || entries === null || Array.isArray(entries)) {
    throw new Error(`${file} is not an object of refused identities`);
  }
  const unknownNames = Object.keys(entries).filter((name) => !REFUSED_NAMES.some((known) => known === name));
  if (unknownNames.length > 0) throw new Error(`${file} names ${unknownNames.join(", ")}, which the guard does not know`);

  const bySysid = new Map<string, RefusedName>();
  for (const name of REFUSED_NAMES) {
    const entry: unknown = (entries as Record<string, unknown>)[name];
    const sysid = typeof entry === "object" && entry !== null ? (entry as Record<string, unknown>)["sysid"] : undefined;
    if (typeof sysid !== "string" || !/^\d+$/.test(sysid)) throw new Error(`${file} holds no cluster identifier for ${name}`);
    bySysid.set(sysid, name);
  }
  if (bySysid.size !== REFUSED_NAMES.length) throw new Error(`${file} gives two names the same cluster identifier`);
  refusedBySysid = bySysid;
  return bySysid;
}

/** Pure. A refused identity wins over the list. */
export function decide(
  identity: Identity,
  listed: readonly Identity[],
): { allowed: true } | { allowed: false; reason: Exclude<RefusalReason, "unreadable"> } {
  // The cluster alone refuses: whatever the database, whatever the list says.
  const refused = refusedIdentities().get(identity.sysid);
  if (refused !== undefined) return { allowed: false, reason: refused };
  if (listed.some((made) => sameIdentity(made, identity))) return { allowed: true };
  return { allowed: false, reason: "not-listed" };
}

/** Reads the identity ON `conn`, decides against the list file; throws TargetRefused. */
export async function assertFoundationTarget(conn: Queryable, opts?: { statePath?: string }): Promise<Identity> {
  let identity: Identity;
  try {
    identity = await readIdentity(conn);
  } catch (cause) {
    throw new TargetRefused("unreadable", undefined, { cause });
  }
  // readInstances fails closed: a list that cannot be read lists nothing.
  const decision = decide(identity, readInstances(opts?.statePath));
  if (!decision.allowed) throw new TargetRefused(decision.reason, identity);
  return identity;
}

/** assertFoundationTarget on `conn`, then `work(conn)` on the same `conn`. */
export async function guarded<T>(
  conn: Queryable,
  work: (conn: Queryable) => Promise<T>,
  opts?: { statePath?: string },
): Promise<T> {
  await assertFoundationTarget(conn, opts);
  return work(conn);
}
