// Persona v2 registry flip — reset-survivable seed stage (plan 05-04 Task 2).
// Run AFTER import-personas.ts: node --experimental-strip-types db/seed/apply-persona-v2.ts
// Scans personas/<dept>/*.md for persona_version: v2.0-fable frontmatter and flips the
// matching registry row (persona_path + persona_version + role) to the v2 file.
// Idempotent: UPDATE is guarded by IS DISTINCT FROM — second run reports 0 updated.
// A v2 file with no registry row is REPORTED, never INSERTed (registry birth stays
// with import-personas.ts — T-05-09).
import { createRequire } from "node:module";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// pg lives in @dxb/shared's dependency tree (single-driver rule) — resolve from there.
const require = createRequire(new URL("../../packages/shared/package.json", import.meta.url));
const { Pool } = require("pg");

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const V2_ROOT = join(ROOT, "personas");

type V2Persona = {
  slug: string;
  department: string;
  role: string;
  personaPath: string; // repo-relative
};

const kebab = (s: string) =>
  s.toLowerCase().replace(/\.md$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const files: V2Persona[] = [];
const malformed: string[] = [];

if (!existsSync(V2_ROOT)) {
  console.error(`personas/ directory not found at ${V2_ROOT}`);
  process.exit(1);
}

for (const dept of readdirSync(V2_ROOT)) {
  const deptDir = join(V2_ROOT, dept);
  if (!statSync(deptDir).isDirectory() || dept.startsWith(".")) continue;
  for (const f of readdirSync(deptDir)) {
    if (!f.endsWith(".md")) continue;
    const p = join(deptDir, f);
    const rel = relative(ROOT, p);
    const text = readFileSync(p, "utf8");
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) continue; // not a persona file
    if (!/^persona_version:\s*v2\.0-fable\s*$/m.test(fm[1])) continue; // only v2.0-fable flips
    const slug = fm[1].match(/^slug:\s*(\S+)\s*$/m)?.[1] ?? kebab(f);
    const fmDept = fm[1].match(/^department:\s*(\S+)\s*$/m)?.[1];
    const role = fm[1].match(/^role:\s*(head|specialist|worker)\s*$/m)?.[1];
    if (!fmDept || fmDept !== kebab(dept)) {
      malformed.push(`${rel}  [department frontmatter '${fmDept}' != directory '${kebab(dept)}']`);
      continue;
    }
    if (!role) {
      malformed.push(`${rel}  [missing/invalid role frontmatter]`);
      continue;
    }
    // Registry must never point at a missing file (plan key_link).
    if (!existsSync(join(ROOT, rel))) {
      malformed.push(`${rel}  [file vanished mid-scan]`);
      continue;
    }
    files.push({ slug, department: fmDept, role, personaPath: rel });
  }
}

// B36 Block 4: the company's address used to stand here as a DEFAULT, so a
// run that forgot to name an engine wrote into the holding's own books and
// said nothing. This file now carries no address; where it writes is the
// caller's stated decision, and a missing one is a loud stop.
const DB_URL = process.env.DXB_DATABASE_URL;
if (!DB_URL) {
  console.error(
    "apply-persona-v2: DXB_DATABASE_URL is not set. This seed UPDATEs the agents registry and it carries no default — " +
      "name the engine explicitly.",
  );
  process.exit(2);
}

const pool = new Pool({ connectionString: DB_URL });

let updated = 0;
const missingInRegistry: string[] = [];
try {
  for (const p of files) {
    const res = await pool.query(
      `UPDATE agents
       SET persona_path = $3, persona_version = 'v2.0-fable', role = $4
       WHERE slug = $1 AND department = $2
         AND (persona_path IS DISTINCT FROM $3
              OR persona_version IS DISTINCT FROM 'v2.0-fable'
              OR role IS DISTINCT FROM $4)`,
      [p.slug, p.department, p.personaPath, p.role],
    );
    if ((res.rowCount ?? 0) > 0) {
      updated += res.rowCount;
      continue;
    }
    // 0 rows: either already-v2 (idempotent no-op) or no registry row at all.
    const exists = await pool.query(
      `SELECT 1 FROM agents WHERE slug = $1 AND department = $2`,
      [p.slug, p.department],
    );
    if (exists.rowCount === 0) missingInRegistry.push(`${p.department}/${p.slug}`);
  }
} finally {
  await pool.end();
}

console.log(
  `v2 applied: ${updated} updated / ${files.length} files; missing-in-registry: [${missingInRegistry.join(", ")}]`,
);
if (malformed.length > 0) console.log(`malformed v2 files (skipped): ${malformed.join(" | ")}`);
process.exit(missingInRegistry.length > 0 || malformed.length > 0 ? 2 : 0);
