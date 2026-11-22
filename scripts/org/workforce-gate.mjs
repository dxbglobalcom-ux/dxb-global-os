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
//    agents row.
const live = await sql`
  SELECT slug, created_at FROM agents WHERE employment_status != 'archived'
`.execute(db);
const liveSlugs = new Set(live.rows.map((r) => r.slug));
const absent = promised.filter((s) => !liveSlugs.has(s));
gate("promised-ADD-absent", absent.length === 0, `missing ${absent.length}/${promised.length}${absent.length ? ": " + absent.join(",") : ""}`);

// 2. Unpromised-role check: every live row is legacy import (< 2026-07-09),
//    promised ADD, or the orchestrator. Anything else entered ungoverned.
const promisedSet = new Set(promised);
const unpromised = live.rows.filter(
  (r) => !promisedSet.has(r.slug) && r.slug !== "agents-orchestrator" && new Date(r.created_at) >= new Date("2026-07-09"),
);
gate("unpromised-role", unpromised.length === 0, unpromised.length ? unpromised.map((r) => r.slug).join(",") : `all ${live.rows.length} rows accounted`);

// 3. Every active department has a head; heads structural across ALL depts.
const heads = await sql`
  SELECT count(*) FILTER (WHERE status = 'active' AND director_id IS NULL)::int AS headless_active,
         count(*) FILTER (WHERE director_id IS NULL)::int AS headless_any,
         count(*)::int AS total
    FROM departments
`.execute(db);
gate("headless-active-dept", heads.rows[0].headless_active === 0, `headless-any ${heads.rows[0].headless_any}/${heads.rows[0].total} depts`);

// 4. Orphans = 0: every non-archived worker below director has a manager.
const orphans = await sql`
  SELECT count(*)::int AS c FROM agents
   WHERE employment_status != 'archived' AND manager_id IS NULL
     AND role_level NOT IN ('orchestrator', 'director')
`.execute(db);
gate("orphan-worker", orphans.rows[0].c === 0, `count ${orphans.rows[0].c}`);

// 5. No live row without an MCP profile.
const noMcp = await sql`
  SELECT count(*)::int AS c FROM agents
   WHERE employment_status != 'archived' AND mcp_profile IS NULL
`.execute(db);
gate("mcp-profile", noMcp.rows[0].c === 0, `count ${noMcp.rows[0].c}`);

// 6. Fixture debris: test-slug prefixes never live in the registry.
const debris = await sql`
  SELECT count(*)::int AS c FROM agents
   WHERE slug LIKE 'r23t-%' OR slug LIKE 'e102t%' OR slug LIKE 'e124t-%' OR slug LIKE 'e125t-%'
`.execute(db);
gate("fixture-debris", debris.rows[0].c === 0, `count ${debris.rows[0].c}`);

// 7. DEPUTY-FAILOVER-MAP covers the SPOF set (plan §6.2) + every dept head slug.
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
