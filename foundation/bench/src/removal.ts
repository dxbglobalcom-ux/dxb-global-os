import type { InstanceRecord } from "./instances.ts";
import { NotBuilt } from "./not-built.ts";

export type ContainerFacts = { id: string; name: string; project: string; createdAt: string; volumes: string[] };

export class RemovalRefused extends Error {}

/** A make that died before it could write its record. */
export type PendingRecord = { project: string; pending: true; startedAt: string };

/** Pure. A name or a label never authorises a removal by itself. */
export function selectRemovalTargets(
  found: readonly ContainerFacts[],
  record: InstanceRecord | PendingRecord | undefined,
): { containers: string[]; volumes: string[] } {
  throw new NotBuilt("selectRemovalTargets");
}
