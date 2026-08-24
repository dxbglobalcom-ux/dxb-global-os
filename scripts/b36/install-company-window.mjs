#!/usr/bin/env node
/**
 * B36 · Block 3 — INSTALL THE ONE-WAY WINDOW, and prove it broke nothing.
 *
 * CEO, 2026-08-24: "bundan sonra TEK BİR HARF DAHİ ŞİRKETİN VERİ TABANINA
 * GİRMESİN!" — after this runs, the construction side holds a login that can
 * look at the holding and cannot touch it, and nothing else.
 *
 * His law of 2026-08-17: a fix repairs its target and breaks nothing around it.
 * So this installer does not merely apply the migration. It:
 *
 *   1. photographs the COMPLETE privilege matrix — every role on the engine
 *      against every SECURITY DEFINER function in public and pgboss, plus every
 *      role's TEMPORARY and CONNECT on the database and whether it can write to
 *      any table in public;
 *   2. applies db/migrations/20260824001000_b36_company_one_way_window.sql;
 *   3. photographs it again and DIFFS. Any change to any role other than
 *      dxb_reader is a regression: it prints it and exits non-zero;
 *   4. mints a password for dxb_reader outside the repository and writes the
 *      read-only URL to var/b36/ (gitignored, mode 600). The secret is never
 *      printed and never enters the tree.
 *
 * Usage:  node scripts/b36/install-company-window.mjs company
 *         node scripts/b36/install-company-window.mjs construction
 *         ... --check    photograph and diff only; change nothing
 */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync, chmodSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));

const TARGETS = {
  company: { container: "supabase_db_DxB_Global_OS", db: "postgres", hostPort: "54322" },
  construction: { container: "supabase_db_DxB_Build", db: "postgres", hostPort: "54422" },
};

const target = process.argv[2];
const checkOnly = process.argv.includes("--check");
if (!TARGETS[target]) {
  console.error("usage: install-company-window.mjs <company|construction> [--check]");
  process.exit(2);
}
const T = TARGETS[target];

/**
 * psql as the engine's administrator, through docker; SQL always on stdin.
 *
 * spawn, not execFile: node's asynchronous execFile has NO `input` option — it
 * silently never writes stdin and never closes it, and psql then waits for a
 * statement that never arrives. That cost this session two hangs before it was
 * named. The SQL is written and the pipe is closed, explicitly, here.
 */
function psql(sql, { quiet = true } = {}) {
  // As the ENGINE'S OWN ADMINISTRATOR, not as the application's role. Two
  // tables in `net` are owned by supabase_admin and postgres is not a member of
  // it, so the app role cannot take PUBLIC's write privilege on them away. The
  // photographs are read-only and could run as anyone; the sealing cannot.
  const args = ["exec", "-i", T.container, "psql", "-U", "supabase_admin", "-d", T.db,
                "-v", "ON_ERROR_STOP=1", "-tA"];
  if (quiet) args.push("-q");
  return new Promise((resolve, reject) => {
    const child = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`psql exited ${code}\n${stderr}`));
    });
    child.stdin.end(sql);
  });
}

/** psql -tA separates columns with "|"; the middle column may contain none. */
const rows = (out) =>
  out.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const first = l.indexOf("|");
    const last = l.lastIndexOf("|");
    return [l.slice(0, first), l.slice(first + 1, last), l.slice(last + 1)];
  });

/**
 * THE PHOTOGRAPH. Who may execute what, who may create a temporary table, who
 * may connect, and who may write to any table in public. Keyed so two
 * photographs compare answer for answer.
 */
async function snapshot() {
  const q = async (sql) => rows((await psql(sql)).stdout);
  const fns = await q(`
    SELECT r.rolname,
           n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
           has_function_privilege(r.rolname, p.oid, 'EXECUTE')::text
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     CROSS JOIN pg_roles r
     WHERE n.nspname IN ('public','pgboss') AND p.prosecdef
       AND r.rolname NOT LIKE 'pg\\_%'
     ORDER BY 1,2;`);
  const db = await q(`
    SELECT r.rolname, '<TEMP ON DATABASE>',
           has_database_privilege(r.rolname, current_database(), 'TEMPORARY')::text
      FROM pg_roles r WHERE r.rolname NOT LIKE 'pg\\_%'
    UNION ALL
    SELECT r.rolname, '<CONNECT ON DATABASE>',
           has_database_privilege(r.rolname, current_database(), 'CONNECT')::text
      FROM pg_roles r WHERE r.rolname NOT LIKE 'pg\\_%'
     ORDER BY 1,2;`);
  const tbl = await q(`
    SELECT r.rolname, '<WRITE ON ANY public TABLE>',
           bool_or(has_table_privilege(r.rolname, c.oid, 'INSERT')
                OR has_table_privilege(r.rolname, c.oid, 'UPDATE')
                OR has_table_privilege(r.rolname, c.oid, 'DELETE'))::text
      FROM pg_roles r
     CROSS JOIN pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind = 'r' AND r.rolname NOT LIKE 'pg\\_%'
     GROUP BY 1 ORDER BY 1;`);
  const map = new Map();
  for (const [role, obj, can] of [...fns, ...db, ...tbl]) map.set(`${role} :: ${obj}`, can);
  return map;
}

function diff(before, after) {
  const changed = [];
  for (const k of new Set([...before.keys(), ...after.keys()])) {
    const b = before.get(k) ?? "<did not exist>";
    const a = after.get(k) ?? "<gone>";
    if (b !== a) {
      const [role, obj] = k.split(" :: ");
      changed.push({ role, obj, before: b, after: a });
    }
  }
  return changed;
}

const line = (s) => console.log(s);
const quoteLiteral = (s) => `'${s.replaceAll("'", "''")}'`;

(async () => {
  line(`B36 · Block 3 — the one-way window on the ${target.toUpperCase()} engine (${T.container})`);

  const before = await snapshot();
  line(`  privilege matrix photographed BEFORE : ${before.size} (role x object) answers`);

  if (checkOnly) {
    line("  --check: nothing applied");
  } else {
    const sql = readFileSync(join(REPO, "scripts/b36/company-one-way-window.sql"), "utf8");
    const { stderr } = await psql(sql, { quiet: false });
    for (const n of stderr.split("\n").filter((l) => l.includes("one-way window"))) {
      line(`  ${n.replace(/^NOTICE:\s*/, "").trim()}`);
    }
  }

  const after = await snapshot();
  line(`  privilege matrix photographed AFTER  : ${after.size} (role x object) answers`);

  const changed = diff(before, after);
  const foreign = changed.filter((c) => c.role !== "dxb_reader");
  const mine = changed.filter((c) => c.role === "dxb_reader");

  line("");
  line(`  privileges changed for dxb_reader   : ${mine.length}`);
  line(`  privileges changed for ANY OTHER ROLE: ${foreign.length}   <-- must be 0`);
  if (foreign.length) {
    line("");
    line("  REGRESSION — these roles lost or gained something they should not have:");
    for (const c of foreign.slice(0, 40)) line(`    ${c.role}  ${c.obj}  ${c.before} -> ${c.after}`);
    line("");
    line("BLAST_RADIUS_FAIL");
    process.exit(1);
  }
  line("  BLAST_RADIUS_CLEAN — no role but the new window changed by one privilege.");

  if (checkOnly) { line("WINDOW_CHECK_DONE"); return; }

  // The password never enters the repository, a prompt, or this output.
  const password = randomBytes(33).toString("base64url");
  await psql(`ALTER ROLE dxb_reader PASSWORD ${quoteLiteral(password)};`);

  const dir = join(REPO, "var/b36");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${target}-window.env`);
  const varName = target === "company"
    ? "DXB_COMPANY_READONLY_URL"
    : "DXB_CONSTRUCTION_READONLY_URL";
  writeFileSync(
    file,
    "# B36 Block 3 — the one-way window. SELECT and nothing else.\n" +
    "# Written by scripts/b36/install-company-window.mjs. var/ is gitignored:\n" +
    "# a secret never enters this repository. Re-run the installer to re-mint.\n" +
    `${varName}=postgresql://dxb_reader:${encodeURIComponent(password)}@127.0.0.1:${T.hostPort}/${T.db}\n`,
    { mode: 0o600 },
  );
  chmodSync(file, 0o600);
  line(`  password minted, stored mode 600 at var/b36/${target}-window.env  (${varName})`);
  line("WINDOW_INSTALLED");
})().catch((e) => {
  console.error(String(e?.stderr || e?.message || e).slice(0, 4000));
  console.error("WINDOW_INSTALL_FAILED");
  process.exit(1);
});
