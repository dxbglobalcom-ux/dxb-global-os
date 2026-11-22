import type { Identity } from "./identity.ts";
import { NotBuilt } from "./not-built.ts";

export type InstanceRecord = Identity & {
  project: string;
  dbContainer: string;
  containers: string[];
  volumes: string[];
  madeAt: string;
};

export function defaultStatePath(): string {
  throw new NotBuilt("defaultStatePath");
}

/** The list file holds `{ "instances": InstanceRecord[] }`. */
export function readInstances(statePath?: string): InstanceRecord[] {
  throw new NotBuilt("readInstances");
}
