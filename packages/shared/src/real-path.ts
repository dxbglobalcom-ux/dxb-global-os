// One copy of the link-resolving path walk: the isolation guards (kernel sdk-isolation, the
// critical gate's Codex home, the claude-mem adapter) all compare resolved paths with it.
import { readlinkSync, realpathSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

/** The path with every link resolved — through parts that do not exist yet and through a dangling link. */
export function realPath(p: string, depth = 0): string {
  try {
    return realpathSync(p);
  } catch {
    // not there (yet), or a link whose target is not there
  }
  if (depth > 40) return p;
  try {
    return realPath(resolve(dirname(p), readlinkSync(p)), depth + 1);
  } catch {
    // not a link
  }
  const parent = dirname(p);
  return parent === p ? p : join(realPath(parent, depth + 1), basename(p));
}
