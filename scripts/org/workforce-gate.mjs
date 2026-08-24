// E12.5 Workforce Completeness Gate — automated sweep (WORKFORCE-MUST-
// EXPANSION-PLAN §11.4 follow-up, roadmap row E12.5 gate SQL battery).
// Read-only: measures the live registry against the frozen promise ledger
// and the row's structural invariants. Exit 0 = all machine gates PASS.
//   node scripts/org/workforce-gate.mjs
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/dist/db.js";

// B36 Block 4: the company's address used to stand here as a DEFAULT, so this
// runner reached the holding whether or not anyone had said to. It now carries
// no address of its own.
if (!process.env.DXB_DATABASE_URL) {
  console.error(
    "workforce-gate: DXB_DATABASE_URL is not set. This gate measures a live registry and it carries no default — " +
      "name the engine explicitly.",
  );
  process.exit(2);
}

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "../..");
const { promised } = JSON.parse(readFileSync(join(HERE, "promise-ledger.json"), "utf8"));

const db = getDb();
const failures = [];
const gate = (name, pass, detail) => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}  ${detail}`);
  if (!pass) failures.push(name);
};

// 1. Promised-ADD absent = 0: every promised role has a live (non-archived)
//    agents row with a bound, gate-passed persona.
const live = await sql`
  SELECT a.slug, a.persona_path, a.created_at,
         (p.id IS NOT NULL AND p.quality_gate = 'passed') AS bound
    FROM agents a LEFT JOIN personas p ON p.id = a.persona_id
   WHERE a.employment_status != 'archived'
`.execute(db);
const bySlug = new Map(live.rows.map((r) => [r.slug, r]));
const absent = promised.filter((s) => !bySlug.get(s)?.bound);
gate("promised-ADD-absent", absent.length === 0, `missing ${absent.length}/${promised.length}${absent.length ? ": " + absent.join(",") : ""}`);

// 2. Unpromised-role check: every live row is legacy import (< 2026-07-09),
//    promised ADD, or the orchestrator. Anything else entered ungoverned.
const promisedSet = new Set(promised);
const unpromised = live.rows.filter(
  (r) => !promisedSet.has(r.slug) && r.slug !== "agents-orchestrator" && new Date(r.created_at) >= new Date("2026-07-09"),
);
gate("unpromised-role", unpromised.length === 0, unpromised.length ? unpromised.map((r) => r.slug).join(",") : `all ${live.rows.length} rows accounted`);

// 3. Stale persona_path = 0 (removed agency-agents tree).
const stale = await sql`SELECT count(*)::int AS c FROM agents WHERE persona_path LIKE 'agency-agents/%'`.execute(db);
gate("stale-persona-path", stale.rows[0].c === 0, `count ${stale.rows[0].c}`);

// 4. Every active department has a head; heads structural across ALL depts.
const heads = await sql`
  SELECT count(*) FILTER (WHERE status = 'active' AND director_id IS NULL)::int AS headless_active,
         count(*) FILTER (WHERE director_id IS NULL)::int AS headless_any,
         count(*)::int AS total
    FROM departments
`.execute(db);
gate("headless-active-dept", heads.rows[0].headless_active === 0, `headless-any ${heads.rows[0].headless_any}/${heads.rows[0].total} depts`);

// 5. Orphans = 0: every non-archived worker below director has a manager.
const orphans = await sql`
  SELECT count(*)::int AS c FROM agents
   WHERE employment_status != 'archived' AND manager_id IS NULL
     AND role_level NOT IN ('orchestrator', 'director')
`.execute(db);
gate("orphan-worker", orphans.rows[0].c === 0, `count ${orphans.rows[0].c}`);

// 6. Persona chain: no live row without a bound gate-passed persona,
//    no live row without an MCP profile, no stale persona_version tag.
const chain = await sql`
  SELECT count(*) FILTER (WHERE p.id IS NULL OR p.quality_gate != 'passed')::int AS unbound,
         count(*) FILTER (WHERE a.mcp_profile IS NULL)::int AS no_mcp,
         count(*) FILTER (WHERE a.persona_version IS DISTINCT FROM 'v2.0-fable')::int AS stale_tag
    FROM agents a LEFT JOIN personas p ON p.id = a.persona_id
   WHERE a.employment_status != 'archived'
`.execute(db);
gate("persona-chain", chain.rows[0].unbound === 0 && chain.rows[0].no_mcp === 0 && chain.rows[0].stale_tag === 0,
  `unbound ${chain.rows[0].unbound} · no-mcp ${chain.rows[0].no_mcp} · stale-tag ${chain.rows[0].stale_tag}`);

// 7. Fixture debris: test-slug prefixes never live in the registry.
const debris = await sql`
  SELECT count(*)::int AS c FROM agents
   WHERE slug LIKE 'r23t-%' OR slug LIKE 'e102t%' OR slug LIKE 'e124t-%' OR slug LIKE 'e125t-%'
`.execute(db);
gate("fixture-debris", debris.rows[0].c === 0, `count ${debris.rows[0].c}`);

// 8. File-first integrity: every persona_path (live AND archived) exists on disk.
const allPaths = await sql`SELECT slug, persona_path FROM agents`.execute(db);
const ghosts = allPaths.rows.filter((r) => !existsSync(join(REPO, r.persona_path)));
gate("persona-file-exists", ghosts.length === 0, ghosts.length ? ghosts.map((r) => `${r.slug}→${r.persona_path}`).join(" ") : `all ${allPaths.rows.length} paths on disk`);

// 9. DEPUTY-FAILOVER-MAP covers the SPOF set (plan §6.2) + every dept head slug.
const mapPath = join(REPO, "HOLDING-OS-MASTER-PLAN/DEPUTY-FAILOVER-MAP.md");
if (!existsSync(mapPath)) {
  gate("deputy-failover-map", false, "file missing");
} else {
  const map = readFileSync(mapPath, "utf8");
  const spof = [
    "privacy-dpo", "backup-dr-officer", "iam-secrets-officer",
    "payroll-manager", "ai-observability-finops-analyst", "board-decision-secretary",
  ];
  const missingSpof = spof.filter((r) => !map.includes(r));
  const headRows = await sql`
    SELECT a.slug FROM departments d JOIN agents a ON a.id = d.director_id
  `.execute(db);
  const missingHeads = headRows.rows.filter((r) => !map.includes(r.slug)).map((r) => r.slug);
  gate("deputy-failover-map", missingSpof.length === 0 && missingHeads.length === 0,
    `spof-missing ${missingSpof.length ? missingSpof.join(",") : 0} · head-missing ${missingHeads.length ? missingHeads.join(",") : 0} (heads ${headRows.rows.length})`);
}

await closeDb();
console.log(failures.length ? `\nGATE FAIL: ${failures.join(", ")}` : "\nGATE PASS: all machine gates green");
process.exit(failures.length ? 1 : 0);
