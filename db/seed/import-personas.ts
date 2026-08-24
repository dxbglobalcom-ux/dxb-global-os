// Legacy persona import — classifier-based (master-plan PHASE-03 "Persona v2 Programı").
// Run: node --experimental-strip-types db/seed/import-personas.ts
// Idempotent: ON CONFLICT (slug) DO NOTHING. Never aborts on a bad file.
import { createRequire } from "node:module";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// pg lives in @dxb/shared's dependency tree (single-driver rule) — resolve from there.
const require = createRequire(new URL("../../packages/shared/package.json", import.meta.url));
const { Pool } = require("pg");

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const CORPUS = join(ROOT, "agency-agents");
// Non-department dirs: integrations/ = tool-format conversions of the same agents,
// examples/ + scripts/ = tooling. Hard-excluded by CEO-corrected corpus reality (2026-07-07).
const EXCLUDED_DIRS = new Set(["integrations", "examples", "scripts"]);

const kebab = (s: string) =>
  s.toLowerCase().replace(/\.md$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

type Classified = {
  slug: string;
  department: string;
  role: string;
  personaPath: string;
  version: string;
};

const personas: Classified[] = [];
const skipped: string[] = [];
const deptDirs: string[] = [];

for (const entry of readdirSync(CORPUS)) {
  const dirPath = join(CORPUS, entry);
  if (!statSync(dirPath).isDirectory()) {
    skipped.push(`${entry}  [root-level file — not a department]`);
    continue;
  }
  if (entry.startsWith(".") || EXCLUDED_DIRS.has(entry)) {
    skipped.push(`${entry}/  [excluded dir]`);
    continue;
  }
  const deptSlug = kebab(entry);
  let deptCount = 0;

  const walk = (dir: string) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) { walk(p); continue; }
      if (!f.endsWith(".md")) continue;
      const rel = relative(ROOT, p);
      if (/^readme/i.test(f)) { skipped.push(`${rel}  [README]`); continue; }
      const text = readFileSync(p, "utf8");
      // CLASSIFIER: persona IFF the file starts with --- frontmatter containing a name: field.
      const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!fm || !/^name:/m.test(fm[1])) {
        skipped.push(`${rel}  [no persona frontmatter]`);
        continue;
      }
      // Corpus reality: legacy frontmatter carries name/description/etc — never slug/role.
      // slug derives from the filename; role from an optional role: field (default worker).
      // v1.0-unparsed only for frontmatter that exists but resists parsing.
      let role = "worker";
      let version = "v1.0-legacy";
      try {
        const roleMatch = fm[1].match(/^role:\s*(head|specialist|worker)\s*$/m);
        if (roleMatch) role = roleMatch[1];
      } catch {
        version = "v1.0-unparsed";
      }
      personas.push({ slug: kebab(f), department: deptSlug, role, personaPath: rel, version });
      deptCount++;
    }
  };
  walk(dirPath);

  if (deptCount > 0) deptDirs.push(deptSlug);
  else skipped.push(`${entry}/  [0 classified personas — department not seeded]`);
}

// B36 Block 4: the company's address used to stand here as a DEFAULT, so a
// run that forgot to name an engine wrote into the holding's own books and
// said nothing. This file now carries no address; where it writes is the
// caller's stated decision, and a missing one is a loud stop.
const DB_URL = process.env.DXB_DATABASE_URL;
if (!DB_URL) {
  console.error(
    "import-personas: DXB_DATABASE_URL is not set. This seed INSERTs departments and agents and it carries no default — " +
      "name the engine explicitly.",
  );
  process.exit(2);
}

const pool = new Pool({ connectionString: DB_URL });

let insertedAgents = 0;
let insertedDepts = 0;
try {
  for (const d of deptDirs) {
    const res = await pool.query(
      `INSERT INTO departments (slug, display_name) VALUES ($1, $2)
       ON CONFLICT (slug) DO NOTHING`,
      [d, d.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())],
    );
    insertedDepts += res.rowCount ?? 0;
  }
  for (const a of personas) {
    const res = await pool.query(
      `INSERT INTO agents (slug, department, role, persona_path, persona_version)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO NOTHING`,
      [a.slug, a.department, a.role, a.personaPath, a.version],
    );
    insertedAgents += res.rowCount ?? 0;
  }
} finally {
  await pool.end();
}

writeFileSync(join(ROOT, "db/seed/seed-skipped.log"), skipped.join("\n") + "\n");
console.log(`classified personas: ${personas.length} across ${deptDirs.length} departments`);
console.log(`inserted: ${insertedAgents} agents, ${insertedDepts} departments (0 on re-run = idempotent)`);
console.log(`skipped: ${skipped.length} files/dirs -> db/seed/seed-skipped.log`);
