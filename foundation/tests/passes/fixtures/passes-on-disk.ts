// A fixture root with the passes' directories beside `schema/`: a temporary directory of its
// own, made by piece 3's `chainRoot` — so the test file's one `removeTheChainRoots` removes it too.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chainRoot } from "../../chain/fixtures/chain-on-disk.ts";

/** The files of one directory: name → content. */
export type Files = Readonly<Record<string, string | Uint8Array>>;

/** Where a file of a root's functions pass lies. */
export const inFunctions = (root: string, name: string): string => join(root, "functions", name);

/** Where a file of a root's reference pass lies. */
export const inReference = (root: string, name: string): string => join(root, "reference", name);

/** Makes `<root>/<directory>` holding these files, written in the order they are given. */
export function standsWith(root: string, directory: "functions" | "reference", files: Files): void {
  mkdirSync(join(root, directory));
  for (const [name, content] of Object.entries(files)) writeFileSync(join(root, directory, name), content);
}

/**
 * A root of its own. `schema/` always stands; `functions/` and `reference/` each stand only when
 * they are given — given with no file, the directory stands and holds nothing.
 */
export function passesRoot(onDisk: { schema?: Files; functions?: Files; reference?: Files }): string {
  const root = chainRoot(onDisk.schema);
  if (onDisk.functions !== undefined) standsWith(root, "functions", onDisk.functions);
  if (onDisk.reference !== undefined) standsWith(root, "reference", onDisk.reference);
  return root;
}
