import { closeSync, fsyncSync, openSync, readFileSync, renameSync, writeSync } from "node:fs";
import { join } from "node:path";
import { makeTheStateDirectory, stateDirectory } from "./bench.ts";
import type { Identity } from "./identity.ts";
import type { PendingRecord } from "./removal.ts";

export type InstanceRecord = Identity & {
  project: string;
  dbContainer: string;
  containers: string[];
  volumes: string[];
  madeAt: string;
  /** Written only after the ledger was seen whole (SPEC §5b.3). A record without it is not yet a made instance. */
  chainAppliedAt?: string;
};

/** The whole list file: the made instances, and the make that has started and not yet written its record. */
export type ListFile = { instances: InstanceRecord[]; pending?: PendingRecord };

/** `instances.json` in the bench's state directory (SPEC §5b.1) — machine state, never committed. */
export function defaultStatePath(): string {
  return join(stateDirectory, "instances.json");
}

const isText = (value: unknown): value is string => typeof value === "string" && value !== "";
const isTexts = (value: unknown): value is string[] => Array.isArray(value) && value.every(isText);
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function isInstanceRecord(value: unknown): value is InstanceRecord {
  if (!isObject(value)) return false;
  const texts = ["sysid", "dboid", "dbname", "project", "dbContainer", "madeAt"];
  const chainApplied = value["chainAppliedAt"] === undefined || isText(value["chainAppliedAt"]);
  return texts.every((field) => isText(value[field])) && isTexts(value["containers"]) && isTexts(value["volumes"]) && chainApplied;
}

function isPendingRecord(value: unknown): value is PendingRecord {
  return isObject(value) && isText(value["project"]) && value["pending"] === true && isText(value["startedAt"]);
}

function isListFile(value: unknown): value is ListFile {
  if (!isObject(value) || !Array.isArray(value["instances"]) || !value["instances"].every(isInstanceRecord)) return false;
  return value["pending"] === undefined || isPendingRecord(value["pending"]);
}

/**
 * The list file as it stands. Fails closed: a file that is missing, unreadable
 * or malformed in any part lists nothing — never a part of what it says.
 */
export function readListFile(statePath: string = defaultStatePath()): ListFile {
  let content: unknown;
  try {
    content = JSON.parse(readFileSync(statePath, "utf8"));
  } catch {
    return { instances: [] };
  }
  return isListFile(content) ? content : { instances: [] };
}

/** The list file holds `{ "instances": InstanceRecord[] }`. */
export function readInstances(statePath?: string): InstanceRecord[] {
  return readListFile(statePath).instances;
}

/**
 * Replaces the list file whole, atomically: written and synced beside it, then
 * renamed over it — a reader sees the old list or the new one, never half of one.
 */
export function writeListFile(list: ListFile): void {
  const statePath = defaultStatePath();
  makeTheStateDirectory();
  const beside = `${statePath}.${process.pid}.writing`;
  const descriptor = openSync(beside, "w", 0o600);
  try {
    writeSync(descriptor, `${JSON.stringify(list, null, 2)}\n`);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
  renameSync(beside, statePath);
}
