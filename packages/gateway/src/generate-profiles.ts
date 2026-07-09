// MCP-02 least-privilege profile generator (master PHASE-07 step 3). Per-dept
// .mcp.json is COMPILED from three inputs — registry departments, policy
// (grants + denials), tool_pins — never hand-written (LOCKED decision: least
// privilege cannot drift from the registry). Pipeline per department:
// start from its grant map (default-deny: absence = denied, T-07-07), subtract
// server/tool denials (denials.json is a hard override on top of grants,
// T-07-10), subtract quarantined pins (07-02 quarantine meets 07-03 exclusion
// here — the two halves of MCP-03, T-07-09), emit only catalogued servers so
// every profile stays loadable. Deterministic: same inputs (incl. injected
// generatedAt) → byte-identical output; _source_hash makes hand-edits and
// staleness detectable (T-07-08).
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { type Kysely } from "kysely";
import { type DB } from "@dxb/shared";
import { canonicalJson } from "./pin-check.js";

export interface ServerCatalogEntry {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

/** "*" = every non-quarantined tool of the server; array = explicit allowlist. */
export type GrantValue = "*" | string[];

export interface ProfilePolicy {
  servers: Record<string, ServerCatalogEntry>;
  grants: Record<string, Record<string, GrantValue>>;
}

/** dept slug → deny entries; "<server>" = whole server, "<server>.<tool>" = one tool. */
export type DenialsMap = Record<string, string[]>;

export interface GenerateProfilesOptions {
  denials: DenialsMap;
  policy: ProfilePolicy;
  outDir: string;
  /** Injected so identical inputs produce identical bytes (determinism gate). */
  generatedAt: string;
}

export interface DeptManifest {
  department: string;
  file: string;
  /** Emitted allow surface per server. */
  tools: Record<string, GrantValue>;
  deniedServers: string[];
  deniedTools: string[];
  quarantinedExcluded: string[];
  /** Granted but absent from the server catalog — reported, never emitted. */
  pendingInstall: string[];
}

export interface GenerateProfilesResult {
  sourceHash: string;
  profiles: DeptManifest[];
}

/** Recursively sort object keys so JSON.stringify emits canonical byte order. */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([k, v]) => [k, sortKeysDeep(v)]),
    );
  }
  return value;
}

const byName = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export async function generateProfiles(
  db: Kysely<DB>,
  opts: GenerateProfilesOptions,
): Promise<GenerateProfilesResult> {
  const departments = await db
    .selectFrom("departments")
    .select(["slug", "mcp_profile", "status"])
    .orderBy("slug")
    .execute();
  const pins = await db
    .selectFrom("tool_pins")
    .select(["server", "tool", "schema_hash", "quarantined"])
    .orderBy("server")
    .orderBy("tool")
    .execute();

  // Policy/registry drift is an error, not a silent skip: a grant or denial
  // keyed to a non-registry slug means one of the two is stale.
  const registrySlugs = new Set(departments.map((d) => d.slug));
  for (const slug of [...Object.keys(opts.policy.grants), ...Object.keys(opts.denials)]) {
    if (!registrySlugs.has(slug)) {
      throw new Error(`policy references department '${slug}' absent from the registry`);
    }
  }

  const sourceHash = createHash("sha256")
    .update(
      canonicalJson({ departments, pins, denials: opts.denials, policy: opts.policy }),
      "utf8",
    )
    .digest("hex");

  const quarantinedBy = new Map<string, Set<string>>();
  const pinnedBy = new Map<string, Set<string>>();
  for (const pin of pins) {
    if (!pinnedBy.has(pin.server)) pinnedBy.set(pin.server, new Set());
    pinnedBy.get(pin.server)!.add(pin.tool);
    if (pin.quarantined) {
      if (!quarantinedBy.has(pin.server)) quarantinedBy.set(pin.server, new Set());
      quarantinedBy.get(pin.server)!.add(pin.tool);
    }
  }

  mkdirSync(opts.outDir, { recursive: true });
  const profiles: DeptManifest[] = [];

  for (const dept of departments) {
    const grants = opts.policy.grants[dept.slug] ?? {};
    const denials = opts.denials[dept.slug] ?? [];
    const deniedServers = new Set(denials.filter((d) => !d.includes(".")));
    const deniedToolsSet = new Set(denials.filter((d) => d.includes(".")));

    const manifest: DeptManifest = {
      department: dept.slug,
      file: join(opts.outDir, `${dept.slug}.mcp.json`),
      tools: {},
      deniedServers: [],
      deniedTools: [],
      quarantinedExcluded: [],
      pendingInstall: [],
    };
    const mcpServers: Record<string, ServerCatalogEntry> = {};
    const deniedToolsOut: Record<string, string[]> = {};

    for (const server of Object.keys(grants).sort(byName)) {
      if (deniedServers.has(server)) {
        manifest.deniedServers.push(server);
        continue;
      }
      const catalog = opts.policy.servers[server];
      if (!catalog) {
        manifest.pendingInstall.push(server);
        continue;
      }
      const quarantined = quarantinedBy.get(server) ?? new Set<string>();
      const dotDenied = (tool: string) => deniedToolsSet.has(`${server}.${tool}`);
      let allowed: GrantValue = grants[server]!;
      if (allowed === "*" && pinnedBy.has(server)) {
        // Pinned server: expand "*" to the explicit non-quarantined tool list —
        // tighter than a wildcard and byte-stable across runs.
        allowed = [...pinnedBy.get(server)!].sort(byName);
      }
      if (Array.isArray(allowed)) {
        const kept: string[] = [];
        for (const tool of [...allowed].sort(byName)) {
          if (quarantined.has(tool)) {
            manifest.quarantinedExcluded.push(`${server}.${tool}`);
          } else if (dotDenied(tool)) {
            manifest.deniedTools.push(`${server}.${tool}`);
          } else {
            kept.push(tool);
          }
        }
        allowed = kept;
      } else {
        // Unpinned server with a "*" grant: quarantine state is unknowable here
        // (no pins yet); surface dot-denials for the runtime layer instead.
        const dots = denials.filter((d) => d.startsWith(`${server}.`)).sort(byName);
        if (dots.length > 0) {
          deniedToolsOut[server] = dots.map((d) => d.slice(server.length + 1));
          manifest.deniedTools.push(...dots);
        }
      }
      mcpServers[server] = catalog;
      manifest.tools[server] = allowed;
    }

    const profile = sortKeysDeep({
      _department: dept.slug,
      _generated_at: opts.generatedAt,
      _generator: "packages/gateway/src/generate-profiles.ts",
      _source_hash: sourceHash,
      _tools: manifest.tools,
      ...(Object.keys(deniedToolsOut).length > 0 ? { _denied_tools: deniedToolsOut } : {}),
      mcpServers,
    });
    writeFileSync(manifest.file, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
    profiles.push(manifest);
  }

  return { sourceHash, profiles };
}

/** Production entry (07-04 calls this): reads policy/{grants,denials}.json
 *  from this package and emits packages/gateway/profiles/<dept>.mcp.json. */
export async function generateProfilesFromPolicy(
  db: Kysely<DB>,
  overrides: Partial<Pick<GenerateProfilesOptions, "outDir" | "generatedAt">> = {},
): Promise<GenerateProfilesResult> {
  const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const readJson = (rel: string) =>
    JSON.parse(readFileSync(join(packageRoot, rel), "utf8")) as Record<string, unknown>;
  const { _schema: _g, servers, grants } = readJson("policy/grants.json") as unknown as ProfilePolicy & { _schema: unknown };
  const { _schema: _d, ...denials } = readJson("policy/denials.json");
  return generateProfiles(db, {
    denials: denials as DenialsMap,
    policy: { servers, grants },
    outDir: overrides.outDir ?? join(packageRoot, "profiles"),
    generatedAt: overrides.generatedAt ?? new Date().toISOString(),
  });
}
