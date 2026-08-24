#!/usr/bin/env node
/**
 * B36 · Block 3 — THE DRILL. Can the one-way window leave anything behind in the
 * holding?
 *
 * THE FIXED QUESTION, in the wording the audit of 2026-08-24 imposed and which
 * this drill may not paraphrase:
 *
 *   Can `dxb_reader`, through ANY route given to it, make a permanent change or
 *   an outside effect in the company's database?
 *
 * WHY THE DRILL HAS TWO SHAPES, and it is the audit's ruling, not a preference.
 *
 *   · ON THE COMPANY the drill runs READ-ONLY. It measures privilege, class by
 *     class, and executes not one statement that could change anything. The
 *     CEO's order of 2026-08-24 is "bundan sonra TEK BİR HARF DAHİ ŞİRKETİN VERİ
 *     TABANINA GİRMESİN!", and a hostile attempt inside a rolled-back
 *     transaction is still a statement aimed at his database — and the second
 *     audited escape, a sequence, is precisely the write that a ROLLBACK does
 *     NOT undo. The old drill fired those attempts at the holding and was lucky.
 *   · ON THE CONSTRUCTION ENGINE — separate cluster, separate volume, nothing of
 *     his in it, rebuildable from scratch — the drill really fires. That is
 *     where a refusal is proved to be a refusal.
 *
 * WHAT THE AUDIT FOUND, and what it changed here. The old drill tried 23 routes
 * and refused 23, and had never tried the two that worked: creating a LARGE
 * OBJECT, and turning a SEQUENCE. "23 of 23 refused" is not an answer to a
 * question that was never asked. So this drill no longer fires a list of
 * examples: after the attempts it sweeps the CLASSES out of the catalogue and
 * requires every one of them to be zero.
 *
 * Usage:  node scripts/b36/prove-window.mjs company        (read-only)
 *         node scripts/b36/prove-window.mjs construction   (fires for real)
 */
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const WINDOW_SQL = join(REPO, "scripts/b36/company-one-way-window.sql");

const TARGETS = {
  company: { container: "supabase_db_DxB_Global_OS", env: "company-window.env",
             varName: "DXB_COMPANY_READONLY_URL" },
  construction: { container: "supabase_db_DxB_Build", env: "construction-window.env",
                  varName: "DXB_CONSTRUCTION_READONLY_URL" },
};
const target = process.argv[2];
if (!TARGETS[target]) {
  console.error("usage: prove-window.mjs <company|construction>");
  process.exit(2);
}
const T = TARGETS[target];
const FIRES = target === "construction";

const envFile = join(REPO, "var/b36", T.env);
if (!existsSync(envFile)) {
  console.error(`no window installed: ${envFile} is missing.`);
  console.error(`run: node scripts/b36/install-company-window.mjs ${target}`);
  process.exit(2);
}
const URL_ = readFileSync(envFile, "utf8")
  .split("\n").find((l) => l.startsWith(`${T.varName}=`))
  ?.slice(T.varName.length + 1).trim();
if (!URL_) { console.error(`${T.varName} not found in ${envFile}`); process.exit(2); }

/** The seal's own definition of an effectful function, read out of the SQL. */
const EFFECTFUL = (() => {
  const m = readFileSync(WINDOW_SQL, "utf8")
    .match(/c_effectful CONSTANT text := \$flt\$([\s\S]*?)\$flt\$;/);
  if (!m) { console.error("prove-window: cannot find c_effectful in the window SQL"); process.exit(2); }
  return m[1];
})();

/** Through the HOST's psql and the mapped port — exactly how a construction tool connects. */
function asWindow(sql) {
  return psql(["psql", URL_, "-v", "ON_ERROR_STOP=1", "-tA"], sql);
}
/** As the engine's administrator, for the positive controls and the sweeps. */
function asAdmin(sql) {
  return psql(["docker", "exec", "-i", T.container, "psql", "-U", "supabase_admin",
               "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-tA"], sql);
}
function psql(argv, sql) {
  return new Promise((resolve) => {
    const child = spawn(argv[0], argv.slice(1), { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });
    child.on("error", (e) => resolve({ code: -1, stdout, stderr: String(e) }));
    child.on("close", (code) => resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() }));
    child.stdin.end(sql);
  });
}

/** A value nothing else in this holding would ever produce. */
const MARK = `b36-window-drill-${process.pid}-${Date.now().toString(36)}`;
const IDENT = MARK.replaceAll("-", "_");

/**
 * THE CLASS SWEEP. Not a list of examples — the catalogue's own answer to "what
 * can this role still do", one class at a time. Every one of these must be 0,
 * and this is what runs against the company.
 */
const CLASSES = [
  ["tables it can change or maintain (7 verbs, every schema)", `
    SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind IN ('r','p','v','m','f')
       AND n.nspname NOT IN ('pg_catalog','information_schema')
       AND (has_table_privilege('dxb_reader',c.oid,'INSERT')
         OR has_table_privilege('dxb_reader',c.oid,'UPDATE')
         OR has_table_privilege('dxb_reader',c.oid,'DELETE')
         OR has_table_privilege('dxb_reader',c.oid,'TRUNCATE')
         OR has_table_privilege('dxb_reader',c.oid,'REFERENCES')
         OR has_table_privilege('dxb_reader',c.oid,'TRIGGER')
         OR has_table_privilege('dxb_reader',c.oid,'MAINTAIN'))`],
  ["counters it can turn (every sequence, every schema)", `
    SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind = 'S' AND n.nspname NOT IN ('pg_catalog','information_schema')
       AND (has_sequence_privilege('dxb_reader',c.oid,'USAGE')
         OR has_sequence_privilege('dxb_reader',c.oid,'UPDATE')
         OR has_sequence_privilege('dxb_reader',c.oid,'SELECT'))`],
  ["functions whose call can leave something behind", `
    SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE (${EFFECTFUL}) AND has_function_privilege('dxb_reader', p.oid, 'EXECUTE')`],
  ["rooms it may stand in outside public/pgboss", `
    SELECT count(*) FROM pg_namespace n
     WHERE n.nspname NOT IN ('public','pgboss','information_schema')
       AND n.nspname NOT LIKE 'pg\\_%'
       AND has_schema_privilege('dxb_reader', n.oid, 'USAGE')`],
  ["ways to create anything (database CREATE/TEMP, schema CREATE)", `
    SELECT (has_database_privilege('dxb_reader',current_database(),'CREATE')::int
          + has_database_privilege('dxb_reader',current_database(),'TEMPORARY')::int
          + has_schema_privilege('dxb_reader','public','CREATE')::int
          + has_schema_privilege('dxb_reader','pgboss','CREATE')::int)`],
  ["default privileges that would hand it a future object", `
    SELECT count(*) FROM pg_default_acl d
     WHERE d.defaclobjtype <> 'r'
       AND array_to_string(d.defaclacl,' ') ~ '(^|\\s)(dxb_reader|)='`],
  ["large objects it owns", `
    SELECT count(*) FROM pg_largeobject_metadata WHERE lomowner = 'dxb_reader'::regrole`],
  ["roles it is a member of", `
    SELECT count(*) FROM pg_auth_members m JOIN pg_roles r ON r.oid = m.member
     WHERE r.rolname = 'dxb_reader'`],
];

/**
 * The hostile attempts. Every one is a complete transaction ending in ROLLBACK
 * unless it is marked raw, and the raw ones exist because
 * `default_transaction_read_only` is a SETTING the role can turn off — what must
 * refuse these is the PRIVILEGE, which is the only thing that is a wall.
 *
 * These run ONLY on the construction engine.
 */
const ATTEMPTS = [
  ["INSERT into the cost ledger",
   `INSERT INTO cost_ledger (model, department, mode, prompt_tokens, completion_tokens, cost_eur)
      VALUES ('${MARK}','engineering','subscription',1,1,0.01)`],
  ["UPDATE a task", `UPDATE tasks SET objective = '${MARK}' WHERE true`],
  ["DELETE an alert", `DELETE FROM alerts WHERE true`],
  ["TRUNCATE the audit log", `TRUNCATE audit_log`],
  ["INSERT into the governance register",
   `INSERT INTO hook_violations (policy_id, gate, detail, action_taken) VALUES ('${MARK}','${MARK}','${MARK}','${MARK}')`],
  ["INSERT into the holding's memory",
   `INSERT INTO memory_index (kind, store, ref, provenance, scope) VALUES ('fact','${MARK}','${MARK}','{}'::jsonb,'holding')`],
  ["INSERT into the job queue", `INSERT INTO pgboss.job (name, data) VALUES ('${MARK}', '{}'::jsonb)`],
  ["INSERT into the outbound HTTP queue (pg_net)",
   `INSERT INTO net.http_request_queue (method, url) VALUES ('GET','http://127.0.0.1/${MARK}')`],
  ["CREATE a table in the company's schema", `CREATE TABLE public.${IDENT} (x int)`],
  ["CREATE a schema of its own", `CREATE SCHEMA ${IDENT}`],
  ["CREATE a TEMPORARY table", `CREATE TEMP TABLE t_${IDENT} (x int)`],
  ["ALTER a company table", `ALTER TABLE agents ADD COLUMN ${IDENT} int`],
  ["DROP a company table", `DROP TABLE alerts`],
  ["call a SECURITY DEFINER function that writes (briefing)",
   `SELECT control_ceo_briefing_post('morning', current_date, '${MARK}','${MARK}','${MARK}','${MARK}')`],
  ["call a SECURITY DEFINER function that writes (chat)",
   `SELECT fn_chat_post_message('${MARK}', 'text', NULL, true)`],
  ["read the login table (password hashes)", `SELECT count(*) FROM auth.users`],

  // ── the routes the AUDIT of 2026-08-24 found open, and which the first
  //    version of this drill never tried. Each ran for real against the real
  //    role before the seal was widened; scripts/b36/prove-window-escapes.mjs
  //    reproduces that red.
  ["RAW  LARGE OBJECT — create one out of bytes (the first audited escape)",
   `SET default_transaction_read_only = off;
    SELECT lo_from_bytea(0, '${MARK}'::bytea);`, true],
  ["RAW  LARGE OBJECT — lo_creat, the older spelling",
   `SET default_transaction_read_only = off;
    SELECT lo_creat(-1);`, true],
  ["RAW  LARGE OBJECT — open one for writing",
   `SET default_transaction_read_only = off;
    BEGIN; SELECT lo_open(1, 131072); ROLLBACK;`, true],
  ["RAW  SEQUENCE — nextval, which ROLLBACK does not undo (the second escape)",
   `SET default_transaction_read_only = off;
    BEGIN; SELECT nextval('net.http_request_queue_id_seq'); ROLLBACK;`, true],
  ["RAW  SEQUENCE — setval, the same counter",
   `SET default_transaction_read_only = off;
    SELECT setval('net.http_request_queue_id_seq', 999);`, true],
  ["RAW  WORKER — restart the holding's outbound worker",
   `SELECT net.worker_restart();`, true],
  ["RAW  MAINTAIN — VACUUM one of the holding's tables",
   `SET default_transaction_read_only = off;
    VACUUM net.http_request_queue;`, true],
  ["RAW  TRIGGER — hang code on the holding's outbound queue",
   `SET default_transaction_read_only = off;
    CREATE TRIGGER ${IDENT} AFTER INSERT ON net.http_request_queue
      FOR EACH ROW EXECUTE FUNCTION suppress_redundant_updates_trigger();`, true],
  ["RAW  NOTIFY — through the FUNCTION, which does have an ACL",
   `SET default_transaction_read_only = off;
    SELECT pg_notify('dxb_ops_live','${MARK}');`, true],
  ["RAW  WAL — emit a logical message straight into the write-ahead log",
   `SET default_transaction_read_only = off;
    SELECT pg_logical_emit_message(true, 'dxb', '${MARK}');`, true],
  ["RAW  REPLICATION — create a logical slot on the holding's engine",
   `SELECT pg_create_logical_replication_slot('${IDENT}', 'pgoutput');`, true],
  ["RAW  LOCK — take an advisory lock the holding's own workers use",
   `SELECT pg_advisory_lock(4815162342);`, true],
  ["RAW  turn the read-only default off BEFORE the transaction, then INSERT",
   `SET default_transaction_read_only = off;
    BEGIN;
    INSERT INTO cost_ledger (model, department, mode, prompt_tokens, completion_tokens, cost_eur)
      VALUES ('${MARK}','engineering','subscription',1,1,0.01);
    ROLLBACK;`, true],
  ["RAW  begin an explicitly READ WRITE transaction, then INSERT",
   `BEGIN READ WRITE;
    INSERT INTO cost_ledger (model, department, mode, prompt_tokens, completion_tokens, cost_eur)
      VALUES ('${MARK}','engineering','subscription',1,1,0.01);
    ROLLBACK;`, true],
  ["RAW  READ WRITE, then the outbound HTTP queue (pg_net)",
   `BEGIN READ WRITE;
    INSERT INTO net.http_request_queue (method, url) VALUES ('GET','http://127.0.0.1/${MARK}');
    ROLLBACK;`, true],
  ["RAW  READ WRITE, then a SECURITY DEFINER function that writes",
   `BEGIN READ WRITE;
    SELECT control_ceo_briefing_post('morning', current_date, '${MARK}','${MARK}','${MARK}','${MARK}');
    ROLLBACK;`, true],
  ["RAW  READ WRITE, then TRUNCATE the audit log",
   `BEGIN READ WRITE; TRUNCATE audit_log; ROLLBACK;`, true],
  ["RAW  READ WRITE, then create a table of its own",
   `BEGIN READ WRITE; CREATE TABLE public.${IDENT}_rw (x int); ROLLBACK;`, true],
];

/** Where the drill looks afterwards for anything it might have left behind. */
const SWEEP = [
  ["cost_ledger", `SELECT count(*) FROM cost_ledger WHERE model = '${MARK}'`],
  ["tasks", `SELECT count(*) FROM tasks WHERE objective = '${MARK}'`],
  ["hook_violations", `SELECT count(*) FROM hook_violations WHERE policy_id = '${MARK}'`],
  ["memory_index", `SELECT count(*) FROM memory_index WHERE store = '${MARK}'`],
  ["pgboss.job", `SELECT count(*) FROM pgboss.job WHERE name = '${MARK}'`],
  ["net.http_request_queue", `SELECT count(*) FROM net.http_request_queue WHERE url LIKE '%${MARK}%'`],
  ["new tables anywhere", `SELECT count(*) FROM pg_class WHERE relname LIKE '%${IDENT}%'`],
  ["new schemas anywhere", `SELECT count(*) FROM pg_namespace WHERE nspname LIKE '%${IDENT}%'`],
  ["new triggers anywhere", `SELECT count(*) FROM pg_trigger WHERE tgname LIKE '%${IDENT}%'`],
  ["replication slots", `SELECT count(*) FROM pg_replication_slots WHERE slot_name LIKE '%${IDENT}%'`],
  ["large objects owned by the window", `SELECT count(*) FROM pg_largeobject_metadata WHERE lomowner = 'dxb_reader'::regrole`],
];

const pad = (s, n) => (s + " ".repeat(n)).slice(0, n);

/**
 * psql echoes BEGIN, INSERT 0 1 and ROLLBACK alongside the answer, so the number
 * wanted is the last bare-integer line — not the whole output. The first version
 * of this drill compared the whole output with "1" and declared its own detector
 * blind while the write had in fact succeeded.
 */
const lastNumber = (out) =>
  out.split("\n").map((x) => x.trim()).filter((x) => /^\d+$/.test(x)).pop() ?? null;

(async () => {
  console.log(`B36 · Block 3 — the drill, against the ${target.toUpperCase()} engine`);
  console.log(`  the fixed question: can dxb_reader make a permanent change or an outside`);
  console.log(`  effect in this database, through any route given to it?`);
  console.log(`  connected through the host's psql, as dxb_reader, over the mapped port`);
  console.log(FIRES
    ? `  this engine is DISPOSABLE, so the attempts below really run.  marker: ${MARK}`
    : `  this is the COMPANY, so NOTHING below is executed against it — privilege is`);
  if (!FIRES) console.log(`  measured out of the catalogue, and the attempts run on the construction engine.`);
  console.log("");

  // ---- 0. THE DETECTOR ----------------------------------------------------
  let detectorLine;
  if (FIRES) {
    const ok = await asAdmin(
      `BEGIN;
       INSERT INTO cost_ledger (model, department, mode, prompt_tokens, completion_tokens, cost_eur)
         VALUES ('${MARK}-detector','engineering','subscription',1,1,0.01);
       SELECT count(*) FROM cost_ledger WHERE model = '${MARK}-detector';
       ROLLBACK;`);
    if (ok.code !== 0 || lastNumber(ok.stdout) !== "1") {
      console.log("DETECTOR BLIND — the administrator could not write either, so a");
      console.log("refusal below would prove nothing about the window.");
      console.log(ok.stderr.slice(0, 500));
      console.log("WINDOW_DRILL_INVALID");
      process.exit(1);
    }
    detectorLine = "detector validated: the administrator DID write the same row (rolled back)";
  } else {
    const seen = await asWindow(`SELECT count(*) FROM agents`);
    if (seen.code !== 0 || !lastNumber(seen.stdout) || Number(lastNumber(seen.stdout)) === 0) {
      console.log("DETECTOR BLIND — the window cannot even read the company, so a zero");
      console.log("below would only prove the connection is dead.");
      console.log(seen.stderr.slice(0, 500));
      console.log("WINDOW_DRILL_INVALID");
      process.exit(1);
    }
    detectorLine = `detector validated: the window really is connected — it reads ${lastNumber(seen.stdout)} employees`;
  }
  console.log(`  ${detectorLine}`);
  console.log("");

  // ---- 1. THE HOSTILE ATTEMPTS (construction only) ------------------------
  let refused = 0;
  const escaped = [];
  if (FIRES) {
    for (const [name, sql, raw] of ATTEMPTS) {
      const r = await asWindow(raw ? sql : `BEGIN;\n${sql};\nROLLBACK;`);
      const code = (r.stderr.match(/^psql:.*?ERROR:\s*(.*)$/m)
                 || r.stderr.match(/ERROR:\s*(.*)/))?.[1] ?? "";
      if (r.code === 0) {
        escaped.push([name, "SUCCEEDED — the wall is missing here"]);
        console.log(`  ESCAPED  ${pad(name, 62)} statement ran`);
      } else {
        refused += 1;
        console.log(`  refused  ${pad(name, 62)} ${code.slice(0, 60)}`);
      }
    }
    console.log("");
  }

  // ---- 2. THE CLASS SWEEP — the part the audit was missing ----------------
  // Asked as the window itself: what the catalogue says this role can still do,
  // whether or not this drill happened to think of the statement.
  let classLeaks = 0;
  console.log("  the classes, asked of the catalogue as the window itself:");
  for (const [what, sql] of CLASSES) {
    const r = await asWindow(sql);
    const n = Number(lastNumber(r.stdout) ?? "-1");
    if (r.code !== 0) {
      console.log(`  ?        ${pad(what, 62)} could not be measured: ${r.stderr.slice(0, 40)}`);
      classLeaks += 1;
      continue;
    }
    classLeaks += n > 0 ? 1 : 0;
    console.log(`  ${n === 0 ? "zero    " : "LEAK    "} ${pad(what, 62)} ${n}`);
  }
  console.log("");

  // ---- 3. THE SWEEP FOR RESIDUE (construction only) -----------------------
  let left = 0;
  if (FIRES) {
    for (const [where, sql] of SWEEP) {
      const r = await asAdmin(sql);
      const n = Number(lastNumber(r.stdout) ?? "0");
      left += Number.isFinite(n) ? n : 0;
      console.log(`  rows the drill left in ${pad(where, 40)} ${Number.isFinite(n) ? n : "?"}`);
    }
    console.log("");
  }

  // ---- 4. THE RESIDUAL POSTGRESQL DOES NOT GOVERN -------------------------
  // NOTIFY is a COMMAND, not a function: it has no ACL, and no GRANT or REVOKE
  // can reach it. Any role that may connect may notify any channel. It writes no
  // row and a rolled-back transaction sends nothing — but a committed one would
  // put a forged event on the CEO's live screen, because the ops:live collector
  // republishes whatever parses as an envelope. Measured here every run so that
  // it is never quietly forgotten, and named as what it is.
  let residual = 0;
  if (FIRES) {
    const r = await asWindow(
      `SET default_transaction_read_only = off;
       BEGIN; NOTIFY dxb_ops_live, 'b36-residual-probe'; COMMIT;`);
    residual = r.code === 0 ? 1 : 0;
    console.log(`  RESIDUAL — the NOTIFY command: ${residual === 1
      ? "still possible, and PostgreSQL grants no privilege over it"
      : "refused (unexpected — PostgreSQL has no privilege for NOTIFY; check what refused it)"}`);
    console.log("             it changes no row; it can forge a live event for the CEO's screen.");
    console.log("             Closing it belongs to the listener, not to a GRANT. Board row B37.");
    console.log("");
  }

  console.log(`  attempts fired  : ${FIRES ? ATTEMPTS.length : 0}${FIRES ? "" : "   (read-only against the company by design)"}`);
  if (FIRES) console.log(`  refused         : ${refused}`);
  if (FIRES) console.log(`  escaped         : ${escaped.length}`);
  console.log(`  classes measured: ${CLASSES.length}`);
  console.log(`  classes leaking : ${classLeaks}`);
  if (FIRES) console.log(`  rows left behind: ${left}`);
  if (FIRES) console.log(`  residual routes : ${residual}   (NOTIFY — no privilege exists)`);
  for (const [name, why] of escaped) console.log(`    ESCAPE: ${name} — ${why}`);

  const attemptsClean = !FIRES || (escaped.length === 0 && left === 0 && refused === ATTEMPTS.length);
  if (attemptsClean && classLeaks === 0) {
    console.log("");
    console.log("ANSWER: NO — through every route a PostgreSQL privilege can govern, the window");
    console.log("cannot change a row, turn a counter, call an effectful function, stand in another");
    console.log("schema or create anything. The NOTIFY command is named above as the one route no");
    console.log("privilege reaches.");
    console.log("WINDOW_IS_ONE_WAY");
    return;
  }
  console.log("");
  console.log("WINDOW_LEAKS");
  process.exit(1);
})().catch((e) => {
  console.error(String(e?.message || e).slice(0, 2000));
  console.error("WINDOW_DRILL_FAILED");
  process.exit(1);
});
