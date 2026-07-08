// Obsidian adapter: human-legible artifact store (obsidian-stack card, ADOPTed
// combination — plain fs writes, no plugin dependency). Notes land in the
// router-owned vault subtree memory-store/<kind>/<indexId>.md; the subtree is
// gitignored (runtime data, decision recorded in 06-04 SUMMARY).
// Reachable ONLY through write-policy's registry (T-06-12) — never import this
// from tool/agent code directly.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MEMORY_STORE_ROOT = "memory-store";

// Card pitfall: path-join on a VALIDATED uuid only — the adapter must never be
// able to write outside memory-store/.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const KIND_RE = /^[a-z]+$/;

export interface ObsidianNoteArgs {
  indexId: string;
  kind: string;
  trustTier: string;
  /** Verbatim memory_index.provenance object (card frontmatter contract). */
  provenance: unknown;
  createdAt: string;
  body: string;
}

/** Frontmatter values are serialized with JSON.stringify — JSON scalars/objects
 *  are valid YAML flow syntax, so user content can never break the frontmatter
 *  (card pitfall: no string-concat of unescaped content). */
function frontmatter(args: ObsidianNoteArgs): string {
  return [
    "---",
    `id: ${JSON.stringify(args.indexId)}`,
    `kind: ${JSON.stringify(args.kind)}`,
    `trust_tier: ${JSON.stringify(args.trustTier)}`,
    `provenance: ${JSON.stringify(args.provenance)}`,
    `created_at: ${JSON.stringify(args.createdAt)}`,
    "---",
    "",
  ].join("\n");
}

/** Write one memory note; returns the repo-relative ref path. Never overwrites:
 *  an indexId collision is a hard error (flag 'wx'). Paths resolve against
 *  process.cwd() — the repo root in tests and the worker's runtime root later. */
export async function writeNote(args: ObsidianNoteArgs): Promise<string> {
  if (!UUID_RE.test(args.indexId)) throw new Error(`obsidian adapter: indexId is not a uuid: ${args.indexId}`);
  if (!KIND_RE.test(args.kind)) throw new Error(`obsidian adapter: invalid kind: ${args.kind}`);
  const rel = path.posix.join(MEMORY_STORE_ROOT, args.kind, `${args.indexId}.md`);
  await mkdir(path.dirname(rel), { recursive: true });
  await writeFile(rel, frontmatter(args) + args.body + "\n", { flag: "wx" });
  return rel;
}
