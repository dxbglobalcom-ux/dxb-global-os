/**
 * tool-pins-manifest — the EXTERNAL tool corpus, as a file of this repository.
 *
 * B49. Until this file existed, the bench's seed pinned its tools by
 * enumerating whatever MCP servers happened to be alive on the machine that ran
 * it (`scripts/gateway/pin-arsenal.mjs`). B36 closed on the promise that the
 * construction engine is GENERATED from this repository's own files; that one
 * step broke it. The same `pnpm construction:seed` on another machine, or on
 * this one with a server down, built a DIFFERENT bench, and every count taken
 * against it measured the workstation as much as the code.
 *
 * The corpus now lives in `db/seed/tool-pins.manifest.json`. The live
 * enumeration becomes a hand-run refresh (`scripts/gateway/refresh-pin-manifest.ts`)
 * that WRITES that file — never a thing the seed depends on.
 *
 * Two rules the shape below exists to keep:
 *
 *   - `dxb-mcp` is NOT in the manifest, on purpose. Its declarations are this
 *     repository's own source, read in-process over an in-memory transport; a
 *     file copy of them would go stale the moment a tool changed, and the seed
 *     would pin the OLD hash — which the daily drift check then quarantines.
 *     A manifest carrying dxb-mcp is refused, loudly, rather than seeded.
 *
 *   - a manifest is verified BEFORE a single row is written: every stored hash
 *     is recomputed with the production hash function (`computeToolHash`, the
 *     same one the gateway pins and checks with), a `(server, tool)` may appear
 *     only once, and the counts the file states about itself must be the rows it
 *     carries. Any of those throws naming the offending `server.tool` — seeding
 *     something else quietly is the failure this row exists to end.
 *
 * WHAT VERIFICATION CANNOT SEE, measured 2026-09-21 and written here rather than
 * implied away: `computeToolHash` hashes description + inputSchema, NOT the tool
 * NAME (`packages/gateway/src/pin-check.ts`, production's own rule, untouched by
 * this row). So a manifest whose `git_add` entry was RENAMED by hand — body and
 * hash left agreeing — verifies clean and pins under the new name. Offline there
 * is nothing left to compare it against; the defence is the other half of this
 * pair, `pnpm construction:pins:check`, where a rename shows as one
 * NOT IN THE MANIFEST and one MISSING FROM THE MACHINE. Duplicates and count
 * lies are caught here; a rename is caught there.
 *
 * The serialization is deterministic — servers and tools sorted, object keys
 * sorted recursively, two-space indent, trailing newline, and NO timestamp:
 * the history belongs to git, and a second refresh on an unchanged machine must
 * produce a byte-identical file.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  computeToolHash,
  pinAll,
  DXB_MCP_SERVER_NAME,
  type PinAllResult,
  type ToolInventoryEntry,
} from "../../packages/gateway/dist/index.js";

/** The manifest file this module reads and writes, by default. */
export const DEFAULT_MANIFEST_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "tool-pins.manifest.json",
);

/** Repo-relative spelling, for messages a human reads. */
export const MANIFEST_RELATIVE_PATH = "db/seed/tool-pins.manifest.json";

const ABOUT =
  "The external MCP tool corpus the construction seed pins from. Refreshed BY HAND from the " +
  "live servers (pnpm construction:pins:refresh) and checked against them (pnpm construction:pins:check); " +
  "the seed only ever reads this file. dxb-mcp is deliberately absent — its tools are read " +
  "in-process from this repository's own source, so a file copy could only go stale.";

/** One pinned tool as the manifest stores it: the served shape plus its hash. */
export interface ManifestTool {
  server: string;
  tool: string;
  description: string;
  inputSchema: unknown;
  schema_hash: string;
}

export interface ToolPinsManifest {
  /** One sentence: what this file is, who refreshes it, how. */
  about: string;
  /** server → tool count, as the file states it about itself. */
  servers: Record<string, number>;
  tools: ManifestTool[];
}

export interface ManifestDiff {
  /** In the manifest, absent from the live servers — `server.tool`. */
  missingLive: string[];
  /** Served by the live servers, absent from the manifest — `server.tool`. */
  extraLive: string[];
  /** In both, but the served schema no longer hashes to the stored hash. */
  drifted: string[];
}

/** The database handle `pinAll` takes — borrowed so this module needs no
 *  second spelling of the Kysely/DB types (one source of truth: the gateway). */
type PinDb = Parameters<typeof pinAll>[0];

const byName = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

const keyOf = (t: { server: string; tool: string }): string => `${t.server}.${t.tool}`;

/** A fresh map with no prototype. A plain `{}` SWALLOWS an assignment to the
 *  key `__proto__` — measured 2026-09-21: a manifest tool whose server was named
 *  `__proto__` counted as nothing on both sides of the count gate, so the file
 *  could carry a row it never declared and the gate called them equal. */
const emptyCounts = (): Record<string, number> => Object.create(null) as Record<string, number>;

/** Duplicate `(server, tool)` pairs, reported by their readable name.
 *  The dedupe key is NOT the dotted spelling: `a.b` + `c` and `a` + `b.c` share
 *  one dotted string, and a gate that compared those would accuse two perfectly
 *  distinct tools of being each other (adversarial pass, 2026-09-21). */
function duplicatePairs(items: Array<{ server: string; tool: string }>): string[] {
  const seen = new Set<string>();
  const twice = new Set<string>();
  for (const item of items) {
    const key = JSON.stringify([item.server, item.tool]);
    if (seen.has(key)) twice.add(keyOf(item));
    seen.add(key);
  }
  return [...twice].sort(byName);
}

/** Object keys sorted recursively; arrays keep their order (order is meaningful
 *  in JSON Schema — the same rule `canonicalJson` follows when hashing). */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort(byName)) out[key] = sortKeysDeep(source[key]);
    return out;
  }
  return value;
}

/** Build a manifest from a live inventory: dxb-mcp dropped, everything sorted,
 *  each tool carrying the hash the gateway would pin it under. */
export function buildManifest(entries: ToolInventoryEntry[]): ToolPinsManifest {
  const external = entries
    .filter((e) => e.server !== DXB_MCP_SERVER_NAME)
    .sort((a, b) => byName(a.server, b.server) || byName(a.tool, b.tool));
  // JSON drops an undefined value, and the file would then fail its own reader
  // on the next run — a "wrote it, exit 0" that explodes one step later. Refuse
  // it at the source instead. (No catalogued server serves such a tool today;
  // the MCP SDK validates inputSchema. This is the latent path closed loudly.)
  const schemaless = external.filter((e) => e.inputSchema === undefined).map(keyOf);
  if (schemaless.length > 0) {
    throw new Error(`served without an inputSchema, cannot be stored: ${schemaless.join(", ")}`);
  }
  // Same rule, the other unstorable shape: nothing may write a file its own
  // reader would refuse. A server that lists one tool twice (tools/list is not
  // deduplicated by the SDK) would otherwise produce a manifest that `refresh`
  // reports as written and `check` refuses on the next run.
  const twice = duplicatePairs(external);
  if (twice.length > 0) {
    throw new Error(`served twice, cannot be stored: ${twice.join(", ")}`);
  }
  const servers: Record<string, number> = emptyCounts();
  for (const e of external) servers[e.server] = (servers[e.server] ?? 0) + 1;
  return {
    about: ABOUT,
    servers,
    tools: external.map((e) => ({
      server: e.server,
      tool: e.tool,
      description: e.description,
      inputSchema: e.inputSchema,
      schema_hash: computeToolHash(e),
    })),
  };
}

/** The manifest's file bytes — deterministic for a given corpus. */
export function serializeManifest(manifest: ToolPinsManifest): string {
  const servers: Record<string, number> = emptyCounts();
  for (const server of Object.keys(manifest.servers).sort(byName)) {
    servers[server] = manifest.servers[server];
  }
  const ordered = {
    about: manifest.about,
    servers,
    tools: manifest.tools
      .slice()
      .sort((a, b) => byName(a.server, b.server) || byName(a.tool, b.tool))
      .map((t) => ({
        server: t.server,
        tool: t.tool,
        description: t.description,
        inputSchema: sortKeysDeep(t.inputSchema),
        schema_hash: t.schema_hash,
      })),
  };
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

/** Read and shape-check a manifest file. A file that is not a manifest fails
 *  here, by name, rather than three steps later as a confusing hash mismatch. */
export function readManifest(path: string = DEFAULT_MANIFEST_PATH): ToolPinsManifest {
  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`manifest is not an object: ${path}`);
  }
  const raw = parsed as Record<string, unknown>;
  if (typeof raw.about !== "string") throw new Error(`manifest has no 'about' sentence: ${path}`);
  if (raw.servers === null || typeof raw.servers !== "object" || Array.isArray(raw.servers)) {
    throw new Error(`manifest has no 'servers' map: ${path}`);
  }
  if (!Array.isArray(raw.tools)) throw new Error(`manifest has no 'tools' array: ${path}`);
  const tools = raw.tools.map((entry, i) => {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`manifest tool #${i} is not an object: ${path}`);
    }
    const t = entry as Record<string, unknown>;
    for (const field of ["server", "tool", "description", "schema_hash"]) {
      if (typeof t[field] !== "string") {
        throw new Error(`manifest tool #${i} has no '${field}': ${path}`);
      }
    }
    if (!("inputSchema" in t)) throw new Error(`manifest tool #${i} has no 'inputSchema': ${path}`);
    return {
      server: t.server as string,
      tool: t.tool as string,
      description: t.description as string,
      inputSchema: t.inputSchema,
      schema_hash: t.schema_hash as string,
    };
  });
  const servers: Record<string, number> = emptyCounts();
  for (const [server, n] of Object.entries(raw.servers as Record<string, unknown>)) {
    if (typeof n !== "number") throw new Error(`manifest server '${server}' has no count: ${path}`);
    servers[server] = n;
  }
  return { about: raw.about, servers, tools };
}

/** Re-hash every entry with the production hash function and hand back the
 *  inventory to pin. Throws — naming `server.tool` — when the file disagrees
 *  with itself, so NOTHING is ever pinned from a manifest that drifted. */
export function verifyManifest(manifest: ToolPinsManifest): ToolInventoryEntry[] {
  const entries: ToolInventoryEntry[] = [];
  const mismatched: string[] = [];
  // A `(server, tool)` twice is the shape that walks past every other gate, and
  // an adversarial pass proved it on 2026-09-21: a forged `git.git_add` was
  // prepended to the real one with its own correct hash and the count bumped to
  // 13, and NOTHING refused it — each copy verified, the diff's map kept the
  // LAST, `pinAll` wrote the FIRST. The gate and the writer were reading
  // different rows. One key, one row, or nothing is pinned at all.
  const duplicated = duplicatePairs(manifest.tools);
  if (duplicated.length > 0) {
    throw new Error(`manifest carries a tool twice: ${duplicated.join(", ")}`);
  }
  for (const t of manifest.tools) {
    if (t.server === DXB_MCP_SERVER_NAME) {
      throw new Error(
        `manifest must not carry ${DXB_MCP_SERVER_NAME} (${keyOf(t)}) — ` +
          "its tools are read in-process from this repository's own source",
      );
    }
    const entry: ToolInventoryEntry = {
      server: t.server,
      tool: t.tool,
      description: t.description,
      inputSchema: t.inputSchema,
    };
    if (computeToolHash(entry) !== t.schema_hash) mismatched.push(keyOf(t));
    entries.push(entry);
  }
  if (mismatched.length > 0) {
    throw new Error(`manifest hash mismatch: ${mismatched.join(", ")}`);
  }
  const counted: Record<string, number> = emptyCounts();
  for (const e of entries) counted[e.server] = (counted[e.server] ?? 0) + 1;
  const spell = (m: Record<string, number>): string =>
    Object.keys(m).sort(byName).map((s) => `${s}=${m[s]}`).join(" ") || "none";
  if (spell(manifest.servers) !== spell(counted)) {
    throw new Error(
      `manifest count mismatch: states ${spell(manifest.servers)}, carries ${spell(counted)}`,
    );
  }
  return entries;
}

/** What the machine serves versus what the repository stores. The live
 *  inventory may carry dxb-mcp (readFullInventory always does); it is dropped
 *  here rather than reported as 28 surprises. */
export function diffManifest(
  manifest: ToolPinsManifest,
  live: ToolInventoryEntry[],
): ManifestDiff {
  const liveHashes = new Map<string, string>();
  for (const e of live) {
    if (e.server === DXB_MCP_SERVER_NAME) continue;
    liveHashes.set(keyOf(e), computeToolHash(e));
  }
  const storedHashes = new Map<string, string>();
  for (const t of manifest.tools) storedHashes.set(keyOf(t), t.schema_hash);
  const missingLive: string[] = [];
  const drifted: string[] = [];
  for (const [key, hash] of storedHashes) {
    const liveHash = liveHashes.get(key);
    if (liveHash === undefined) missingLive.push(key);
    else if (liveHash !== hash) drifted.push(key);
  }
  const extraLive = [...liveHashes.keys()].filter((key) => !storedHashes.has(key));
  return {
    missingLive: missingLive.sort(byName),
    extraLive: extraLive.sort(byName),
    drifted: drifted.sort(byName),
  };
}

/** What a bench holds, measured against what this repository declares.
 *
 *  `pinAll` is first-sight by design: an existing pin is never overwritten. So
 *  on an engine that already carries pins — taken from some machine, on some
 *  day — a seed run writes nothing at all and the row counts look perfectly
 *  healthy while the corpus is a stranger's. This is the arithmetic that says
 *  so, kept here rather than inline in the seed so it can be proven by case
 *  instead of by eye. */
export interface BenchDiff {
  /** Pinned on the bench, declared nowhere in this repository — `server.tool`. */
  stranger: string[];
  /** Pinned on the bench under a hash this repository does not compute. */
  disagrees: string[];
  /** Declared here, and still absent from the bench after pinning. */
  absent: string[];
}

/** The corpus this repository declares: server → tool → the hash computed here.
 *  NESTED on purpose, and for the reason this file has already been bitten by
 *  once: a dotted `server.tool` is not an identity — `a.b` + `c` and `a` + `b.c`
 *  share one string. The dotted spelling below appears in MESSAGES only. */
export type DeclaredCorpus = ReadonlyMap<string, ReadonlyMap<string, string>>;

/** `bench`: `[server, tool, schema_hash]` exactly as the engine stores them —
 *  three columns, never one parsed string, so a separator can never split a
 *  name. Both sides are read; neither is written. */
export function diffAgainstBench(
  want: DeclaredCorpus,
  bench: Iterable<readonly [string, string, string]>,
): BenchDiff {
  const stranger: string[] = [];
  const disagrees: string[] = [];
  const seen = new Map<string, Set<string>>();
  for (const [server, tool, hash] of bench) {
    let tools = seen.get(server);
    if (!tools) {
      tools = new Set<string>();
      seen.set(server, tools);
    }
    tools.add(tool);
    const declared = want.get(server)?.get(tool);
    if (declared === undefined) stranger.push(`${server}.${tool}`);
    else if (declared !== hash) disagrees.push(`${server}.${tool}`);
  }
  const absent: string[] = [];
  for (const [server, tools] of want) {
    for (const tool of tools.keys()) {
      if (!seen.get(server)?.has(tool)) absent.push(`${server}.${tool}`);
    }
  }
  return {
    stranger: stranger.sort(byName),
    disagrees: disagrees.sort(byName),
    absent: absent.sort(byName),
  };
}

/** What one pin run of the seed did, and what it believed while doing it. */
export interface PinnedCorpus {
  want: DeclaredCorpus;
  pinned: number;
  existing: number;
}

/**
 * THE SEED'S WHOLE PIN STEP, in one function that a case can call.
 *
 * It lives here rather than inline in `build-seed.ts` because a step written
 * inline can only be guarded by reading the file's TEXT, and an adversarial
 * round proved on 2026-09-21 that text is not behaviour: the pin calls were
 * wrapped in `.then(ok, err)` — no `catch` anywhere in the file — and the
 * text guard stayed green while a broken manifest was skipped in silence and
 * the bench was built with 28 tools instead of 76. What must be true is a
 * BEHAVIOUR, so it is measured as one.
 *
 * `inHouse` is dxb-mcp's inventory, read in-process by the caller (this
 * repository's own source; never a file copy — see the header).
 *
 * **Verification happens before ANY row is written**, including the in-house
 * half: a manifest that disagrees with itself leaves the engine untouched
 * rather than half-seeded.
 */
export async function pinTheCorpus(
  db: PinDb,
  inHouse: ToolInventoryEntry[],
  manifestPath: string = DEFAULT_MANIFEST_PATH,
): Promise<PinnedCorpus> {
  const declared = verifyManifest(readManifest(manifestPath));
  const a = await pinAll(db, inHouse);
  const b = await pinAll(db, declared);
  const want = new Map<string, Map<string, string>>();
  for (const e of [...inHouse, ...declared]) {
    let tools = want.get(e.server);
    if (!tools) {
      tools = new Map<string, string>();
      want.set(e.server, tools);
    }
    tools.set(e.tool, computeToolHash(e));
  }
  return { want, pinned: a.pinned.length + b.pinned.length, existing: a.existing + b.existing };
}

/** Pin the external corpus from the repository's own file. Verification runs
 *  first, so a drifted manifest writes nothing at all. `pinAll` itself is
 *  untouched: first-sight insert, existing pins never overwritten. */
export async function pinFromManifest(
  db: PinDb,
  path: string = DEFAULT_MANIFEST_PATH,
): Promise<PinAllResult> {
  return pinAll(db, verifyManifest(readManifest(path)));
}
