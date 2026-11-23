// Fixture chains on the disk: each root is a temporary directory of its own, so no
// case reads what another wrote. A test file removes them all when it ends.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const made: string[] = [];

/** A fresh temporary directory that holds nothing — a root with no chain in it. */
export function emptyDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), "dxb-foundation-chain-"));
  made.push(directory);
  return directory;
}

/** Where a file of a root's chain lies. */
export const inSchema = (root: string, name: string): string => join(root, "schema", name);

/** A root of its own: `schema/` holding these files, written in the order they are given. */
export function chainRoot(files: Readonly<Record<string, string | Uint8Array>> = {}): string {
  const root = emptyDirectory();
  mkdirSync(join(root, "schema"));
  for (const [name, content] of Object.entries(files)) writeFileSync(inSchema(root, name), content);
  return root;
}

/** Removes every directory made here: called once, when a test file ends. */
export function removeTheChainRoots(): void {
  for (const directory of made.splice(0)) rmSync(directory, { recursive: true, force: true });
}
