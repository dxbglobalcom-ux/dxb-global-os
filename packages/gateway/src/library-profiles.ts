// E9.5 — library_grants → gateway profile compilation (HOLDING_LIBRARY §3/§6).
// The record is the source of authority: a capability absent from the record's
// grants is absent from the compiled profile and therefore unusable (G3 —
// kayıt-yetki-uygulama chain). This module only READS the layer and drives the
// Phase-7 generator; grant writes stay behind control_library_action.
//
// Union rule (§19 / PERMISSION_MODEL): a subject's granted set is the
// PERMISSIVE UNION of its applicable grants — employee ∪ its department ∪ its
// role_level. Intersection with the policy profile happens in the generator
// (G2: the narrowest cut wins). Expired grants (adaptation A2) are dead here.
//
// Atomic write (§17): the new set is generated into a staging directory and
// moved into place only after full success — a failed compile leaves the old
// profiles untouched and raises on the alerts path of the caller.
import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sql, type Kysely } from "kysely";
import { type DB } from "@dxb/shared";
import {
  generateProfilesFromPolicy,
  type GenerateProfilesResult,
  type LibraryLayer,
  type LibrarySubjectCaps,
} from "./generate-profiles.js";

const GATEWAY_KINDS = ["tool", "mcp", "skill", "plugin"] as const;

interface GrantRow {
  kind: string;
  name: string;
  grantee_kind: "department" | "employee" | "role_level";
  grantee_id: string;
}

/** Expand one library item to concrete capability names.
 *  tool  → its "<server>.<tool>" name (bare names assume dxb-mcp);
 *  mcp   → "dxb-mcp/<group>" = every pinned dxb-mcp tool with the group's
 *          `<group>_` prefix; "dxb-mcp" = the whole pinned server;
 *  skill/plugin → the item name into the skills allowlist. */
function expandItem(
  row: Pick<GrantRow, "kind" | "name">,
  pinned: { server: string; tool: string }[],
): LibrarySubjectCaps {
  if (row.kind === "skill" || row.kind === "plugin") {
    return { tools: [], skills: [row.name] };
  }
  if (row.kind === "tool") {
    return { tools: [row.name.includes(".") ? row.name : `dxb-mcp.${row.name}`], skills: [] };
  }
  // kind === "mcp"
  const [server, group] = row.name.includes("/")
    ? [row.name.slice(0, row.name.indexOf("/")), row.name.slice(row.name.indexOf("/") + 1)]
    : [row.name, null];
  return {
    tools: pinned
      .filter((p) => p.server === server && (group === null || p.tool.startsWith(`${group}_`)))
      .map((p) => `${p.server}.${p.tool}`),
    skills: [],
  };
}

function mergeCaps(target: LibrarySubjectCaps, add: LibrarySubjectCaps): void {
  for (const t of add.tools) if (!target.tools.includes(t)) target.tools.push(t);
  for (const s of add.skills) if (!target.skills.includes(s)) target.skills.push(s);
}

/** Read the active (non-expired) grant record into the generator's layer. */
export async function readLibraryLayer(db: Kysely<DB>): Promise<LibraryLayer> {
  const grants = (
    await sql<GrantRow>`
      SELECT li.kind, li.name, g.grantee_kind, g.grantee_id
        FROM library_grants g
        JOIN library_items li ON li.id = g.item_id
       WHERE li.kind IN ('tool','mcp','skill','plugin')
         AND (g.expires_at IS NULL OR g.expires_at > now())
       ORDER BY li.kind, li.name
    `.execute(db)
  ).rows;

  const pinned = (
    await sql<{ server: string; tool: string }>`
      SELECT server, tool FROM tool_pins WHERE NOT quarantined ORDER BY server, tool
    `.execute(db)
  ).rows;

  const byDept: Record<string, LibrarySubjectCaps> = {};
  const byRole: Record<string, LibrarySubjectCaps> = {};
  const byEmployeeId: Record<string, LibrarySubjectCaps> = {};
  for (const g of grants) {
    const caps = expandItem(g, pinned);
    const bucket =
      g.grantee_kind === "department" ? byDept : g.grantee_kind === "role_level" ? byRole : byEmployeeId;
    bucket[g.grantee_id] ??= { tools: [], skills: [] };
    mergeCaps(bucket[g.grantee_id]!, caps);
  }

  // Employee overlays exist only for employees holding employee-kind grants
  // (role_level grants apply to everyone of that level through the union —
  // they never shrink the department surface on their own).
  const employees: LibraryLayer["employees"] = {};
  const employeeIds = Object.keys(byEmployeeId);
  if (employeeIds.length > 0) {
    const agents = (
      await sql<{ id: string; slug: string; department: string; role_level: string | null }>`
        SELECT id, slug, department, role_level FROM agents
         WHERE id = ANY(${employeeIds}::uuid[])
           AND employment_status IS DISTINCT FROM 'archived'
      `.execute(db)
    ).rows;
    for (const a of agents) {
      const union: LibrarySubjectCaps = { tools: [], skills: [] };
      mergeCaps(union, byEmployeeId[a.id]!);
      if (byDept[a.department]) mergeCaps(union, byDept[a.department]!);
      if (a.role_level && byRole[a.role_level]) mergeCaps(union, byRole[a.role_level]!);
      union.tools.sort();
      union.skills.sort();
      employees[a.slug] = { department: a.department, ...union };
    }
  }

  for (const caps of Object.values(byDept)) {
    caps.tools.sort();
    caps.skills.sort();
  }
  return { departments: byDept, employees };
}

export interface CompileLibraryProfilesResult extends GenerateProfilesResult {
  changed: boolean;
  outDir: string;
}

function currentSourceHash(outDir: string): string | null {
  try {
    const manifest = JSON.parse(readFileSync(join(outDir, "_manifest.json"), "utf8")) as {
      source_hash?: string;
    };
    return manifest.source_hash ?? null;
  } catch {
    return null;
  }
}

/** Full record→profiles compile: read layer, generate into staging, swap only
 *  on hash change, emit the `system` channel event (§9). Deterministic inputs
 *  → deterministic hash; generatedAt is excluded from the hash by design. */
export async function compileLibraryProfiles(
  db: Kysely<DB>,
  overrides: { outDir?: string; generatedAt?: string } = {},
): Promise<CompileLibraryProfilesResult> {
  const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const outDir = overrides.outDir ?? join(packageRoot, "profiles");
  mkdirSync(outDir, { recursive: true });

  const library = await readLibraryLayer(db);
  const staging = mkdtempSync(join(outDir, ".staging-"));
  try {
    const result = await generateProfilesFromPolicy(db, {
      outDir: staging,
      generatedAt: overrides.generatedAt,
      library,
    });

    if (currentSourceHash(outDir) === result.sourceHash) {
      return { ...result, changed: false, outDir };
    }

    // §17 atomic swap: files land only after the FULL new set generated fine.
    const emitted = new Set<string>(["_manifest.json"]);
    const manifestBody = {
      source_hash: result.sourceHash,
      generated_at: overrides.generatedAt ?? new Date().toISOString(),
      profiles: result.profiles.map((p) => p.department),
      employee_profiles: result.employeeProfiles.map((p) => p.employee),
    };
    const manifestJson = `${JSON.stringify(manifestBody, null, 2)}\n`;
    for (const file of readdirSync(staging)) {
      copyFileSync(join(staging, file), join(outDir, file));
      emitted.add(file);
    }
    // Manifest is stamped LAST: a crash mid-swap leaves a hash-less dir the
    // next run treats as stale and rewrites.
    writeFileSync(join(outDir, "_manifest.json"), manifestJson, "utf8");
    // Stale profiles must disappear too: employee overlays whose grants were
    // fully revoked AND department files for slugs no longer in the registry
    // (the E5.x org rebuild left orphan dept files behind — found+fixed E9.5).
    for (const file of readdirSync(outDir)) {
      if (file.endsWith(".mcp.json") && !emitted.has(file)) {
        unlinkSync(join(outDir, file));
      }
    }

    // §9: recompile lands on the `system` channel; §15 swallow — a broadcast
    // failure never invalidates the freshly written profile set.
    try {
      await sql`
        SELECT notify_broadcast('system', 'profile.recompiled', ${JSON.stringify({
          actor: "system",
          entity: { kind: "setting", id: "library.profiles" },
          corr: {},
          payload: {
            source_hash: result.sourceHash,
            departments: result.profiles.length,
            employee_profiles: result.employeeProfiles.length,
          },
        })}::jsonb)
      `.execute(db);
    } catch (err) {
      console.warn("[library-profiles] system broadcast swallowed:", err);
    }

    return { ...result, changed: true, outDir };
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}
