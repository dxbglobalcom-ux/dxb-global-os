// Obsidian adapter: human-legible artifact store (obsidian-stack card, ADOPTed
// combination — plain fs writes, no plugin dependency). Notes land in the
// router-owned vault subtree memory-store/<kind>/<indexId>.md under the memory
// root (DXB_MEMORY_ROOT); the ref stored in memory_index stays that relative
// path. Reachable ONLY through write-policy's registry (T-06-12) on the write
// side — never import this from tool/agent code directly.
//
// The memory root (CEO 2026-10-04, company-memory-drawer-2026-10-04): until then a
// note was written and read relative to process.cwd(), and the reader handed
// memory_index.ref to readFile unchecked (Sol's phase-3 C1). Since isolation
// phase 3 the dxb-mcp child of a company call works in the company's `work`
// folder while the scheduler's own recall works in the repository — the two
// looked in different places. Now every note lives under ONE absolute folder:
// the company Claude home in production (the scheduler binds it to that home,
// kernel ensureCompanyMemoryRoot), the construction's own folder under var/ in
// the battery (vitest.config.ts). Unset or relative refuses — no guess.
//
// Sol's single pass (2026-10-04): a note is opened ONCE, through one file
// descriptor, and that descriptor's own path (/proc/self/fd) must be exactly
// <real root>/<ref> — no link in any component below the root, and no window
// between the check and the read or write. Folders below the root are made one
// level at a time and each must be a real folder before anything is written.
import { constants, readdirSync } from "node:fs";
import { lstat, mkdir, open, readlink, realpath, unlink } from "node:fs/promises";
import path from "node:path";

const MEMORY_STORE_ROOT = "memory-store";

// Card pitfall: path-join on a VALIDATED uuid only — the adapter must never be
// able to write outside memory-store/.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const KIND_RE = /^[a-z]+$/;
/** The one shape a note ref has — exactly what writeNote returns. */
const NOTE_REF_RE =
  /^memory-store\/([a-z]+)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.md$/;

export interface ObsidianNoteArgs {
  indexId: string;
  kind: string;
  trustTier: string;
  /** Verbatim memory_index.provenance object (card frontmatter contract). */
  provenance: unknown;
  createdAt: string;
  body: string;
}

/** The folder every note ref resolves against: DXB_MEMORY_ROOT, absolute. */
export function memoryRoot(env: NodeJS.ProcessEnv = process.env): string {
  const root = env.DXB_MEMORY_ROOT;
  if (!root || !path.isAbsolute(root)) {
    throw new Error(
      `memory root: DXB_MEMORY_ROOT is ${root ? `relative ("${root}")` : "not set"} — memory notes are refused until it names an absolute folder`,
    );
  }
  return root;
}

/** The scheduler's start-up line: where the drawer is and how many notes it holds. Never throws. */
export function memoryRootLine(env: NodeJS.ProcessEnv = process.env): string {
  let root: string;
  try {
    root = memoryRoot(env);
  } catch {
    return "[memory] root=unset — memory notes are refused until DXB_MEMORY_ROOT is set";
  }
  let notes = 0;
  try {
    for (const kind of readdirSync(path.join(root, MEMORY_STORE_ROOT))) {
      try {
        notes += readdirSync(path.join(root, MEMORY_STORE_ROOT, kind)).filter((f) => f.endsWith(".md")).length;
      } catch {
        // not a folder
      }
    }
  } catch {
    // no memory-store/ yet — zero notes
  }
  return `[memory] root=${root} notes=${notes}`;
}

/** A ref of the writer's exact shape, of the expected kind, joined to the root. */
function notePath(ref: string, kind: string, root: string): string {
  const m = NOTE_REF_RE.exec(ref);
  if (!m) throw new Error(`memory note: ref is not a memory-store/<kind>/<uuid>.md note: ${ref}`);
  if (m[1] !== kind) throw new Error(`memory note: ref is a ${m[1]} note, this store holds ${kind}: ${ref}`);
  return path.join(root, ref);
}

/** The path the descriptor really opened — whatever the name pointed at meanwhile. */
function openedPath(fd: number): Promise<string> {
  return readlink(`/proc/self/fd/${fd}`);
}

/** Read one note by its ref: only a note of the writer's shape and of this
 *  store's kind, opened once without following a link, whose descriptor sits
 *  exactly at <real root>/<ref> and is a regular file. Loud otherwise. */
export async function readNote(ref: string, kind: string): Promise<string> {
  const root = memoryRoot();
  notePath(ref, kind, root);
  const expected = path.join(await realpath(root), ref);
  const handle = await open(expected, constants.O_RDONLY | constants.O_NOFOLLOW).catch((e: NodeJS.ErrnoException) => {
    throw new Error(`memory note: ${ref} cannot be opened as a note in the memory root (${e.code ?? e.message})`);
  });
  try {
    const opened = await openedPath(handle.fd);
    if (opened !== expected) throw new Error(`memory note: ${ref} opened ${opened}, not ${expected}`);
    if (!(await handle.stat()).isFile()) throw new Error(`memory note: ${ref} is not a regular file`);
    return await handle.readFile("utf8");
  } finally {
    await handle.close();
  }
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

/** Write one memory note under the memory root; returns the root-relative ref.
 *  Never overwrites: an indexId collision is a hard error (O_EXCL). */
export async function writeNote(args: ObsidianNoteArgs): Promise<string> {
  if (!UUID_RE.test(args.indexId)) throw new Error(`obsidian adapter: indexId is not a uuid: ${args.indexId}`);
  if (!KIND_RE.test(args.kind)) throw new Error(`obsidian adapter: invalid kind: ${args.kind}`);
  const root = memoryRoot();
  const rel = path.posix.join(MEMORY_STORE_ROOT, args.kind, `${args.indexId}.md`);
  notePath(rel, args.kind, root);
  // The root is the configured folder itself; below it, one level at a time, each a real folder.
  await mkdir(root, { recursive: true });
  const base = await realpath(root);
  let dir = base;
  for (const part of [MEMORY_STORE_ROOT, args.kind]) {
    dir = path.join(dir, part);
    await mkdir(dir).catch((e: NodeJS.ErrnoException) => {
      if (e.code !== "EEXIST") throw e;
    });
    const st = await lstat(dir);
    if (st.isSymbolicLink() || !st.isDirectory()) {
      throw new Error(`memory note: ${dir} is not a real folder inside the memory root`);
    }
  }
  const expected = path.join(base, rel);
  const handle = await open(
    expected,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
    0o644,
  );
  try {
    const opened = await openedPath(handle.fd);
    if (opened !== expected) {
      await unlink(opened).catch(() => undefined);
      throw new Error(`memory note: the write for ${rel} opened ${opened}, not ${expected}`);
    }
    await handle.writeFile(frontmatter(args) + args.body + "\n");
  } finally {
    await handle.close();
  }
  return rel;
}
