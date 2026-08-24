// Routing-rules seed — renders packages/kernel/policy/routing-seed.json (§10 brain map
// as data, master-plan PHASE-05 §3) into the routing_rules table.
// Run: node --experimental-strip-types db/seed/import-routing-rules.ts
// Idempotent: a row with the same task_class+model+priority is skipped.
// ⛔ FABLE-ONLY: adding L1 rows to routing-seed.json (PHASE-05 §6 budget-fallback marker);
// council expansion (needs_council on new classes) additionally needs CEO approval (§5).
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// pg lives in @dxb/shared's dependency tree (single-driver rule) — resolve from there.
const require = createRequire(new URL("../../packages/shared/package.json", import.meta.url));
const { Pool } = require("pg");

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

type SeedRow = {
  task_class: string;
  match: Record<string, unknown>;
  model_tier: string;
  model: string;
  mode: string;
  effort: string;
  needs_council: boolean;
  priority: number;
};

const rows: SeedRow[] = JSON.parse(
  readFileSync(join(ROOT, "packages/kernel/policy/routing-seed.json"), "utf8"),
);

// B36 Block 4: the company's address used to stand here as a DEFAULT, so a
// run that forgot to name an engine wrote into the holding's own books and
// said nothing. This file now carries no address; where it writes is the
// caller's stated decision, and a missing one is a loud stop.
const DB_URL = process.env.DXB_DATABASE_URL;
if (!DB_URL) {
  console.error(
    "import-routing-rules: DXB_DATABASE_URL is not set. This seed INSERTs routing rules and it carries no default — " +
      "name the engine explicitly.",
  );
  process.exit(2);
}

const pool = new Pool({ connectionString: DB_URL });

let inserted = 0;
try {
  for (const r of rows) {
    const exists = await pool.query(
      `SELECT 1 FROM routing_rules WHERE task_class = $1 AND model = $2 AND priority = $3`,
      [r.task_class, r.model, r.priority],
    );
    if ((exists.rowCount ?? 0) > 0) continue;
    await pool.query(
      `INSERT INTO routing_rules (task_class, match, model_tier, model, mode, effort, needs_council, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [r.task_class, JSON.stringify(r.match), r.model_tier, r.model, r.mode, r.effort, r.needs_council, r.priority],
    );
    inserted++;
  }
} finally {
  await pool.end();
}

console.log(`routing rules: inserted ${inserted} / total ${rows.length}`);
