import type { InstanceRecord } from "./instances.ts";
import type { HostLock } from "./lock.ts";
import { NotBuilt } from "./not-built.ts";

export class InstanceStands extends Error {}

export class ExposureRefused extends Error {}

export const BENCH = {
  project: "DxB_Foundation",
  apiPort: 54521,
  dbPort: 54522,
  network: "dxb_foundation_bench",
  bind: "127.0.0.1",
} as const;

/** The CLI's local credential is fixed and public; this is the bench's address, not a secret. */
export function connectionString(): string {
  return `postgresql://postgres:postgres@${BENCH.bind}:${BENCH.dbPort}/postgres`;
}

export type Status =
  | { state: "absent" }
  | { state: "standing"; record: InstanceRecord }
  // something carries the project label that the list does not explain
  | { state: "foreign"; detail: string };

export function instanceStatus(): Promise<Status> {
  throw new NotBuilt("instanceStatus");
}

export function makeInstance(lock: HostLock): Promise<InstanceRecord> {
  throw new NotBuilt("makeInstance");
}

export function destroyInstance(lock: HostLock): Promise<"destroyed" | "absent"> {
  throw new NotBuilt("destroyInstance");
}
