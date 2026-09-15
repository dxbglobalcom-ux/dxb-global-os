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

/** E9.5 library layer (HOLDING_LIBRARY §6, adaptation A4/A5): the union of a
 *  subject's active library grants, expanded to concrete capability names.
 *  tools use "<server>.<tool>"; skills carry skill/plugin item names. A subject
 *  PRESENT here has its surface intersected with the granted set (an empty
 *  list = deny-all: the record says nothing is granted); a subject ABSENT here
 *  has zero library grants and keeps the registry behavior (spec §22). */
export interface LibrarySubjectCaps {
  tools: string[];
  skills: string[];
}

export interface LibraryLayer {
  departments: Record<string, LibrarySubjectCaps>;
  /** agent slug → dept + union caps (employee ∪ department ∪ role_level).
   *  W9: `assignedDepartments` names the OTHER departments the employee is a
   *  recorded member of (`agent_assignments`). The overlay's ceiling is the
   *  union of those departments' emitted surfaces and its home one — still an
   *  intersection (G2), taken against every membership the org record gives. */
  employees: Record<
    string,
    { department: string; assignedDepartments?: string[] } & LibrarySubjectCaps
  >;
}

export interface GenerateProfilesOptions {
  denials: DenialsMap;
  policy: ProfilePolicy;
  outDir: string;
  /** Injected so identical inputs produce identical bytes (determinism gate). */
  generatedAt: string;
  /** E9.5: library_grants compiled in (kayıt-yetki-uygulama chain, spec G3). */
  library?: LibraryLayer;
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
  /** E9.5: policy-allowed tools removed because the library record grants
   *  them to nobody in this department (kayıt dışı = fiilen kullanılamaz). */
  libraryFiltered: string[];
}

export interface EmployeeManifest {
  employee: string;
  department: string;
  /** W9: the other departments this employee is a recorded member of. */
  assignedDepartments?: string[];
  file: string;
  tools: Record<string, string[]>;
  skills: string[];
}

export interface GenerateProfilesResult {
  sourceHash: string;
  profiles: DeptManifest[];
  /** E9.5 employee overlays — only employees holding employee-kind grants. */
  employeeProfiles: EmployeeManifest[];
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
      canonicalJson({
        departments,
        pins,
        denials: opts.denials,
        policy: opts.policy,
        // E9.5: grant changes must change the hash — the recompile job keys
        // its "anything to do?" decision off it.
        library: opts.library ?? null,
      }),
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
      libraryFiltered: [],
    };
    const libCaps = opts.library?.departments[dept.slug];
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
      // E9.5 library intersection (adaptation A4): a department present in the
      // library layer keeps only the tools its record grants — after the
      // quarantine/denial subtraction, so the library can never re-open what
      // policy closed (PERMISSION_MODEL G2: en dar kesişim).
      if (libCaps) {
        const granted = new Set(
          libCaps.tools
            .filter((t) => t.startsWith(`${server}.`))
            .map((t) => t.slice(server.length + 1)),
        );
        if (Array.isArray(allowed)) {
          const kept = allowed.filter((tool) => granted.has(tool));
          manifest.libraryFiltered.push(
            ...allowed.filter((tool) => !granted.has(tool)).map((tool) => `${server}.${tool}`),
          );
          allowed = kept;
        } else {
          // "*" on an unpinned server: the granted list IS the surface.
          const dotDeniedHere = (tool: string) => deniedToolsSet.has(`${server}.${tool}`);
          allowed = [...granted].filter((tool) => !dotDeniedHere(tool)).sort(byName);
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
      // E9.5 adaptation A5: skills/plugins ride the same allowlist model —
      // key present = the record governs (empty = deny-all), key absent =
      // the department has no library grants at all (registry behavior).
      ...(libCaps ? { _skills: [...libCaps.skills].sort(byName) } : {}),
      ...(Object.keys(deniedToolsOut).length > 0 ? { _denied_tools: deniedToolsOut } : {}),
      mcpServers,
    });
    writeFileSync(manifest.file, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
    profiles.push(manifest);
  }

  // E9.5 employee overlays (adaptation A4): only employees holding
  // employee-kind grants get a file; effective surface = the department
  // profile's emitted tools ∩ the employee's union set — an overlay can
  // never exceed the department surface (G2 intersection).
  const employeeProfiles: EmployeeManifest[] = [];
  for (const slug of Object.keys(opts.library?.employees ?? {}).sort(byName)) {
    const emp = opts.library!.employees[slug]!;
    // W9: the ceiling is every department the employee is a member of — its home
    // one plus any it is ASSIGNED to. Where two memberships name the same server,
    // the ceilings are unioned per server before the employee's grants cut them.
    const memberships = [emp.department, ...(emp.assignedDepartments ?? [])];
    const ceiling: Record<string, GrantValue> = {};
    for (const dept of memberships) {
      const m = profiles.find((p) => p.department === dept);
      for (const [server, allowed] of Object.entries(m?.tools ?? {})) {
        const have = ceiling[server];
        if (have === undefined) ceiling[server] = allowed;
        else if (have === "*" || allowed === "*") ceiling[server] = "*";
        else ceiling[server] = [...new Set([...have, ...allowed])].sort(byName);
      }
    }
    const tools: Record<string, string[]> = {};
    const mcpServers: Record<string, ServerCatalogEntry> = {};
    for (const [server, allowed] of Object.entries(ceiling)) {
      const granted = new Set(
        emp.tools.filter((t) => t.startsWith(`${server}.`)).map((t) => t.slice(server.length + 1)),
      );
      const kept = (Array.isArray(allowed) ? allowed : [...granted]).filter((tool) =>
        granted.has(tool),
      );
      if (kept.length > 0) {
        tools[server] = kept.sort(byName);
        mcpServers[server] = opts.policy.servers[server]!;
      }
    }
    const skills = [...emp.skills].sort(byName);
    const manifest: EmployeeManifest = {
      employee: slug,
      department: emp.department,
      ...(emp.assignedDepartments?.length ? { assignedDepartments: emp.assignedDepartments } : {}),
      file: join(opts.outDir, `${slug}.employee.mcp.json`),
      tools,
      skills,
    };
    const profile = sortKeysDeep({
      _employee: slug,
      _department: emp.department,
      _generated_at: opts.generatedAt,
      _generator: "packages/gateway/src/generate-profiles.ts",
      _source_hash: sourceHash,
      _tools: tools,
      _skills: skills,
      mcpServers,
    });
    writeFileSync(manifest.file, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
    employeeProfiles.push(manifest);
  }

  return { sourceHash, profiles, employeeProfiles };
}

/** Production entry (07-04 calls this): reads policy/{grants,denials}.json
 *  from this package and emits packages/gateway/profiles/<dept>.mcp.json. */
/**
 * WHERE COMPILED PROFILES LAND.
 *
 * The repository's own `packages/gateway/profiles/` is a COMMITTED artefact: it
 * is what the live gateway reads, and it belongs to the company. On 2026-08-24 a
 * suite that starts the real scheduler (tests/phase4/velocity.test.ts) was
 * measured recompiling those files on every battery run — from the CONSTRUCTION
 * database's records, straight into the CEO's tracked tree. Nothing was
 * corrupted, because the source hash matched; the timestamps moved, the working
 * tree went dirty after every `pnpm test`, and it was the construction site
 * writing into the company's things all the same, which is the whole of B36.
 *
 * DXB_GATEWAY_PROFILE_DIR moves the output somewhere disposable. vitest.config.ts
 * sets it for the battery; production sets nothing and keeps the committed path.
 */
export function profileDir(packageRoot: string): string {
  const override = process.env.DXB_GATEWAY_PROFILE_DIR;
  return override && override.trim() !== "" ? override : join(packageRoot, "profiles");
}

export async function generateProfilesFromPolicy(
  db: Kysely<DB>,
  overrides: Partial<Pick<GenerateProfilesOptions, "outDir" | "generatedAt" | "library">> = {},
): Promise<GenerateProfilesResult> {
  const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const readJson = (rel: string) =>
    JSON.parse(readFileSync(join(packageRoot, rel), "utf8")) as Record<string, unknown>;
  const { _schema: _g, servers, grants } = readJson("policy/grants.json") as unknown as ProfilePolicy & { _schema: unknown };
  const { _schema: _d, ...denials } = readJson("policy/denials.json");
  return generateProfiles(db, {
    denials: denials as DenialsMap,
    policy: { servers, grants },
    outDir: overrides.outDir ?? profileDir(packageRoot),
    generatedAt: overrides.generatedAt ?? new Date().toISOString(),
    library: overrides.library,
  });
}
