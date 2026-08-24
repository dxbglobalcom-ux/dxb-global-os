#!/usr/bin/env node
/**
 * B36 · Block 3 — INSTALL THE ONE-WAY WINDOW, prove it broke nothing, and leave
 * an exact way back.
 *
 * CEO, 2026-08-24: "bundan sonra TEK BİR HARF DAHİ ŞİRKETİN VERİ TABANINA
 * GİRMESİN!" — after this runs, the construction side holds a login that can
 * look at the holding and cannot touch it, and nothing else.
 *
 * WHY THIS FILE WAS REWRITTEN. The block was audited on 2026-08-24 and failed on
 * two escapes the drill had never tried: the window could create large objects
 * in the holding's database, and it could turn `net.http_request_queue_id_seq`
 * — a sequence advance, which PostgreSQL does not undo on ROLLBACK. Both were
 * reproduced against the real role. The audit's deeper finding is the one that
 * shaped this file: the blast-radius photograph BELOW was as narrow as the
 * drill, so it could not have seen the classes the seal now closes. It now
 * photographs every class the seal touches.
 *
 * His law of 2026-08-17: a fix repairs its target and breaks nothing around it.
 * So this installer does not merely apply the file. It:
 *
 *   1. photographs the COMPLETE privilege matrix — every role on the engine
 *      against every function whose call can leave something behind, every table
 *      on all seven verbs, every sequence, every schema, and the database
 *      itself;
 *   2. captures the exact ACL of every object in those classes and writes an
 *      UNDO file that puts every one of them back, statement by statement,
 *      before anything is changed. pg_dump does not carry catalogue-function
 *      privileges, so Block 0's dated dump could not have reversed this seal:
 *      the seal has to carry its own reversal, and now it does;
 *   3. applies scripts/b36/company-one-way-window.sql;
 *   4. photographs again and DIFFS. Any change to any role other than
 *      dxb_reader is a regression: it prints it and exits non-zero;
 *   5. mints a password for dxb_reader outside the repository and writes the
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
const WINDOW_SQL = join(REPO, "scripts/b36/company-one-way-window.sql");

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
 * ONE definition of "a function whose call can leave something behind", read out
 * of the SQL that seals them. The audit's finding was a seal and a proof that
 * had drifted apart; a second copy of this predicate in JavaScript would be the
 * same defect wearing a different hat.
 */
const EFFECTFUL = (() => {
  const sql = readFileSync(WINDOW_SQL, "utf8");
  const m = sql.match(/c_effectful CONSTANT text := \$flt\$([\s\S]*?)\$flt\$;/);
  if (!m) {
    console.error("install-company-window: cannot find c_effectful in company-one-way-window.sql");
    process.exit(2);
  }
  return m[1];
})();

/**
 * psql as the engine's administrator, through docker; SQL always on stdin.
 *
 * spawn, not execFile: node's asynchronous execFile has NO `input` option — it
 * silently never writes stdin and never closes it, and psql then waits for a
 * statement that never arrives. That cost this session two hangs before it was
 * named. The SQL is written and the pipe is closed, explicitly, here.
 */
function psql(sql, { quiet = true } = {}) {
  // As the ENGINE'S OWN ADMINISTRATOR, not as the application's role. The seal
  // reaches objects owned by supabase_admin and by the system itself, and
  // `postgres` is a member of neither. The photographs are read-only and could
  // run as anyone; the sealing cannot.
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
 * THE PHOTOGRAPH. Every class the seal touches, asked of every role, so that a
 * privilege moved for anyone but the window shows up as a line in the diff.
 * Keyed so two photographs compare answer for answer.
 */
async function snapshot() {
  const q = async (sql) => rows((await psql(sql)).stdout);

  // 1. functions whose call can leave something behind — the SQL's own sentence
  const fns = await q(`
    SELECT r.rolname,
           'FN ' || n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
           has_function_privilege(r.rolname, p.oid, 'EXECUTE')::text
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     CROSS JOIN pg_roles r
     WHERE (${EFFECTFUL})
       AND r.rolname NOT LIKE 'pg\\_%'
     ORDER BY 1,2;`);

  // 2. tables, all seven verbs, every non-system schema
  const tbl = await q(`
    SELECT r.rolname,
           'TBL ' || n.nspname || '.' || c.relname,
           concat_ws('',
             CASE WHEN has_table_privilege(r.rolname,c.oid,'SELECT')     THEN 'r' ELSE '-' END,
             CASE WHEN has_table_privilege(r.rolname,c.oid,'INSERT')     THEN 'a' ELSE '-' END,
             CASE WHEN has_table_privilege(r.rolname,c.oid,'UPDATE')     THEN 'w' ELSE '-' END,
             CASE WHEN has_table_privilege(r.rolname,c.oid,'DELETE')     THEN 'd' ELSE '-' END,
             CASE WHEN has_table_privilege(r.rolname,c.oid,'TRUNCATE')   THEN 'D' ELSE '-' END,
             CASE WHEN has_table_privilege(r.rolname,c.oid,'REFERENCES') THEN 'x' ELSE '-' END,
             CASE WHEN has_table_privilege(r.rolname,c.oid,'TRIGGER')    THEN 't' ELSE '-' END,
             CASE WHEN has_table_privilege(r.rolname,c.oid,'MAINTAIN')   THEN 'm' ELSE '-' END)
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     CROSS JOIN pg_roles r
     WHERE c.relkind IN ('r','p','v','m','f')
       AND n.nspname NOT IN ('pg_catalog','information_schema')
       AND r.rolname NOT LIKE 'pg\\_%'
     ORDER BY 1,2;`);

  // 3. sequences — the audited escape that survives ROLLBACK
  const seq = await q(`
    SELECT r.rolname,
           'SEQ ' || n.nspname || '.' || c.relname,
           concat_ws('',
             CASE WHEN has_sequence_privilege(r.rolname,c.oid,'SELECT') THEN 'r' ELSE '-' END,
             CASE WHEN has_sequence_privilege(r.rolname,c.oid,'UPDATE') THEN 'w' ELSE '-' END,
             CASE WHEN has_sequence_privilege(r.rolname,c.oid,'USAGE')  THEN 'U' ELSE '-' END)
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     CROSS JOIN pg_roles r
     WHERE c.relkind = 'S'
       AND n.nspname NOT IN ('pg_catalog','information_schema')
       AND r.rolname NOT LIKE 'pg\\_%'
     ORDER BY 1,2;`);

  // 4. the rooms each role may stand in
  const sch = await q(`
    SELECT r.rolname,
           'SCH ' || n.nspname,
           concat_ws('',
             CASE WHEN has_schema_privilege(r.rolname,n.oid,'USAGE')  THEN 'U' ELSE '-' END,
             CASE WHEN has_schema_privilege(r.rolname,n.oid,'CREATE') THEN 'C' ELSE '-' END)
      FROM pg_namespace n
     CROSS JOIN pg_roles r
     WHERE n.nspname NOT LIKE 'pg\\_%' AND r.rolname NOT LIKE 'pg\\_%'
     ORDER BY 1,2;`);

  // 5. the database itself
  const db = await q(`
    SELECT r.rolname, 'DB  ' || current_database(),
           concat_ws('',
             CASE WHEN has_database_privilege(r.rolname,current_database(),'CONNECT')   THEN 'c' ELSE '-' END,
             CASE WHEN has_database_privilege(r.rolname,current_database(),'TEMPORARY') THEN 'T' ELSE '-' END,
             CASE WHEN has_database_privilege(r.rolname,current_database(),'CREATE')    THEN 'C' ELSE '-' END)
      FROM pg_roles r WHERE r.rolname NOT LIKE 'pg\\_%'
     ORDER BY 1;`);

  // 6. what a future object would be born holding
  const def = await q(`
    SELECT '<default privileges>',
           'DEF ' || d.defaclobjtype::text || ' ' || coalesce(n.nspname,'-') || ' by ' || pg_get_userbyid(d.defaclrole),
           coalesce(array_to_string(d.defaclacl,' '),'')
      FROM pg_default_acl d
      LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace
     ORDER BY 2;`);

  const map = new Map();
  for (const [role, obj, can] of [...fns, ...tbl, ...seq, ...sch, ...db, ...def]) {
    map.set(`${role} :: ${obj}`, can);
  }
  return map;
}

/**
 * THE WAY BACK. Every object in every class the seal touches, with the exact
 * ACL it carries right now. An aclitem is `grantee=letters/grantor`, an empty
 * grantee is PUBLIC, and a `*` after a letter is WITH GRANT OPTION — so the
 * original can be replayed as plain GRANT statements after the object is reset.
 *
 * A NULL acl means "nobody has ever touched this one", which for a function
 * means PUBLIC holds EXECUTE by PostgreSQL's own default. Restoring that is
 * `GRANT ... TO PUBLIC`: the stored ACL will read differently afterwards, the
 * privileges will be identical, and that difference is stated here rather than
 * discovered later.
 */
const LETTERS = {
  TABLE: { r: "SELECT", a: "INSERT", w: "UPDATE", d: "DELETE", D: "TRUNCATE",
           x: "REFERENCES", t: "TRIGGER", m: "MAINTAIN" },
  SEQUENCE: { r: "SELECT", w: "UPDATE", U: "USAGE" },
  FUNCTION: { X: "EXECUTE" },
  SCHEMA: { U: "USAGE", C: "CREATE" },
  DATABASE: { c: "CONNECT", T: "TEMPORARY", C: "CREATE" },
};

function undoStatements(kind, sig, acl) {
  const known = LETTERS[kind];
  const all = Object.values(known).join(", ");
  const out = [`REVOKE ${all} ON ${kind} ${sig} FROM PUBLIC;`];
  if (!acl) {
    // PostgreSQL's built-in default: PUBLIC holds EXECUTE on functions and
    // nothing on tables/sequences/schemas; CONNECT+TEMPORARY on databases.
    if (kind === "FUNCTION") out.push(`GRANT EXECUTE ON FUNCTION ${sig} TO PUBLIC;`);
    if (kind === "DATABASE") out.push(`GRANT CONNECT, TEMPORARY ON DATABASE ${sig} TO PUBLIC;`);
    return out;
  }
  for (const item of acl) {
    const m = item.match(/^(.*?)=([a-zA-Z*]*)\//);
    if (!m) continue;
    const grantee = m[1] === "" ? "PUBLIC" : `"${m[1].replace(/^"|"$/g, "")}"`;
    const letters = m[2];
    const plain = [], withGrant = [];
    for (let i = 0; i < letters.length; i += 1) {
      const name = known[letters[i]];
      if (!name) continue;
      if (letters[i + 1] === "*") { withGrant.push(name); i += 1; } else plain.push(name);
    }
    if (plain.length) out.push(`GRANT ${plain.join(", ")} ON ${kind} ${sig} TO ${grantee};`);
    if (withGrant.length) {
      out.push(`GRANT ${withGrant.join(", ")} ON ${kind} ${sig} TO ${grantee} WITH GRANT OPTION;`);
    }
  }
  return out;
}

async function captureAcls() {
  const raw = (await psql(`
    SELECT 'FUNCTION', format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)),
           coalesce(array_to_string(p.proacl, E'\\x01'), '')
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE (${EFFECTFUL})
    UNION ALL
    SELECT CASE WHEN c.relkind = 'S' THEN 'SEQUENCE' ELSE 'TABLE' END,
           format('%I.%I', n.nspname, c.relname),
           coalesce(array_to_string(c.relacl, E'\\x01'), '')
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind IN ('r','p','v','m','f','S')
       AND n.nspname NOT IN ('pg_catalog','information_schema')
    UNION ALL
    SELECT 'SCHEMA', quote_ident(n.nspname), coalesce(array_to_string(n.nspacl, E'\\x01'), '')
      FROM pg_namespace n WHERE n.nspname NOT LIKE 'pg\\_%' AND n.nspname <> 'information_schema'
    UNION ALL
    SELECT 'DATABASE', quote_ident(d.datname), coalesce(array_to_string(d.datacl, E'\\x01'), '')
      FROM pg_database d WHERE d.datname = current_database();
  `)).stdout;

  const captured = [];
  for (const line of raw.split("\n").map((l) => l.trimEnd()).filter(Boolean)) {
    const first = line.indexOf("|");
    const second = line.indexOf("|", first + 1);
    const kind = line.slice(0, first);
    const sig = line.slice(first + 1, second);
    const aclRaw = line.slice(second + 1);
    captured.push({ kind, sig, acl: aclRaw === "" ? null : aclRaw.split("\x01") });
  }
  return captured;
}

function writeUndo(dir, captured) {
  const body = [
    "-- B36 · Block 3 — THE WAY BACK from the one-way window.",
    "--",
    "-- Written by scripts/b36/install-company-window.mjs BEFORE the seal was",
    "-- applied, from the engine's own catalogue. Every object in every class the",
    "-- seal touches is reset and then given back exactly the privileges it held.",
    "--",
    "-- Why this file has to exist: pg_dump does not carry privileges on catalogue",
    "-- objects, so the Block 0 dated dump cannot reverse the large-object and",
    "-- catalogue-function part of the seal. A change that cannot be undone is not",
    "-- a change anybody should make to the CEO's database.",
    "--",
    "-- Apply as the engine's administrator:",
    "--   docker exec -i <container> psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -f -",
    "--",
    `-- objects captured: ${captured.length}`,
    "",
    "BEGIN;",
  ];
  for (const { kind, sig, acl } of captured) {
    if (!LETTERS[kind]) continue;
    for (const s of undoStatements(kind, sig, acl)) body.push(s);
  }
  body.push("COMMIT;", "");
  const file = join(dir, `${target}-window-undo.sql`);
  writeFileSync(file, body.join("\n"), { mode: 0o600 });
  return { file, statements: body.length - 3 };
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

  const dir = join(REPO, "var/b36");
  mkdirSync(dir, { recursive: true });

  const captured = await captureAcls();
  const undo = writeUndo(dir, captured);
  line(`  exact ACL of ${captured.length} objects captured; undo written to var/b36/${target}-window-undo.sql (${undo.statements} statements)`);

  const before = await snapshot();
  line(`  privilege matrix photographed BEFORE : ${before.size} (role x object) answers`);

  if (checkOnly) {
    line("  --check: nothing applied");
  } else {
    const sql = readFileSync(WINDOW_SQL, "utf8");
    const { stderr } = await psql(sql, { quiet: false });
    for (const n of stderr.split("\n").filter((l) => l.includes("one-way window"))) {
      line(`  ${n.replace(/^NOTICE:\s*/, "").trim()}`);
    }
  }

  const after = await snapshot();
  line(`  privilege matrix photographed AFTER  : ${after.size} (role x object) answers`);

  const changed = diff(before, after);
  const foreign = changed.filter((c) => c.role !== "dxb_reader" && c.role !== "<default privileges>");
  const defaults = changed.filter((c) => c.role === "<default privileges>");
  const mine = changed.filter((c) => c.role === "dxb_reader");

  line("");
  line(`  privileges changed for dxb_reader    : ${mine.length}`);
  line(`  default-privilege sets rewritten     : ${defaults.length}   <-- future functions, PUBLIC replaced by every current role`);
  line(`  privileges changed for ANY OTHER ROLE: ${foreign.length}   <-- must be 0`);
  if (foreign.length) {
    line("");
    line("  REGRESSION — these roles lost or gained something they should not have:");
    for (const c of foreign.slice(0, 40)) line(`    ${c.role}  ${c.obj}  ${c.before} -> ${c.after}`);
    line("");
    line(`  put it back with:  docker exec -i ${T.container} psql -U supabase_admin -d ${T.db} -v ON_ERROR_STOP=1 -f - < var/b36/${target}-window-undo.sql`);
    line("BLAST_RADIUS_FAIL");
    process.exit(1);
  }
  line("  BLAST_RADIUS_CLEAN — no role but the new window changed by one privilege.");

  if (checkOnly) { line("WINDOW_CHECK_DONE"); return; }

  // The password never enters the repository, a prompt, or this output.
  const password = randomBytes(33).toString("base64url");
  await psql(`ALTER ROLE dxb_reader PASSWORD ${quoteLiteral(password)};`);

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
