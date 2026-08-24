#!/usr/bin/env node
/**
 * B36 · Block 3 — THE DRILL. Can the one-way window write to the holding?
 *
 * The question this answers, in the shape Block 1's question was fixed in:
 *
 *   Connected to the company as the construction side's own login, can ANY
 *   statement change ANY row, in any schema, by any route — a direct write, a
 *   truncate, a schema change, a temporary table, the outbound-HTTP queue, or a
 *   SECURITY DEFINER function that writes with its owner's privileges?
 *
 *   NO  -> the window is one-way.   YES -> the route found is walled and the
 *   whole drill is measured again.
 *
 * NOTHING THIS DRILL DOES CAN PERSIST. Every hostile attempt runs inside its own
 * transaction which is ROLLED BACK whatever happens, so even a wall that failed
 * would leave the CEO's database exactly as it found it. Afterwards the drill
 * looks for its own marker in every table it aimed at and requires zero hits.
 *
 * IT VALIDATES ITS OWN DETECTOR FIRST, on the construction engine, where a real
 * write is allowed: the same statements are run as the administrator and MUST
 * succeed. A drill that has never seen a success cannot be trusted to recognise
 * a refusal — that lesson cost this row three audits (a detector was blind
 * because `\b` is a backspace, not a word boundary, in PostgreSQL regexes).
 *
 * Usage:  node scripts/b36/prove-window.mjs company
 *         node scripts/b36/prove-window.mjs construction
 */
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));

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

/** Through the HOST's psql and the mapped port — exactly how a construction tool connects. */
function asWindow(sql) {
  return psql(["psql", URL_, "-v", "ON_ERROR_STOP=1", "-tA"], sql);
}
/** As the engine's administrator, for the positive controls and the sweep. */
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

/**
 * Every route out of a read-only role that this project could think of. Each is
 * a complete transaction ending in ROLLBACK: the drill cannot leave a trace even
 * if a wall is missing.
 */
const ATTEMPTS = [
  ["INSERT into the cost ledger",
   `INSERT INTO cost_ledger (model, department, mode, prompt_tokens, completion_tokens, cost_eur)
      VALUES ('${MARK}','engineering','subscription',1,1,0.01)`],
  ["UPDATE a task",
   `UPDATE tasks SET objective = '${MARK}' WHERE true`],
  ["DELETE an alert",
   `DELETE FROM alerts WHERE true`],
  ["TRUNCATE the audit log",
   `TRUNCATE audit_log`],
  ["INSERT into the governance register",
   `INSERT INTO hook_violations (policy_id, gate, detail, action_taken) VALUES ('${MARK}','${MARK}','${MARK}','${MARK}')`],
  ["INSERT into the holding's memory",
   `INSERT INTO memory_index (kind, store, ref, provenance, scope) VALUES ('fact','${MARK}','${MARK}','{}'::jsonb,'holding')`],
  ["INSERT into the job queue",
   `INSERT INTO pgboss.job (name, data) VALUES ('${MARK}', '{}'::jsonb)`],
  ["INSERT into the outbound HTTP queue (pg_net)",
   `INSERT INTO net.http_request_queue (method, url) VALUES ('GET','http://127.0.0.1/${MARK}')`],
  ["CREATE a table in the company's schema",
   `CREATE TABLE public.${MARK.replaceAll("-", "_")} (x int)`],
  ["CREATE a schema of its own",
   `CREATE SCHEMA ${MARK.replaceAll("-", "_")}`],
  ["CREATE a TEMPORARY table",
   `CREATE TEMP TABLE t_${MARK.replaceAll("-", "_")} (x int)`],
  ["ALTER a company table",
   `ALTER TABLE agents ADD COLUMN ${MARK.replaceAll("-", "_")} int`],
  ["DROP a company table",
   `DROP TABLE alerts`],
  ["call a SECURITY DEFINER function that writes (briefing)",
   `SELECT control_ceo_briefing_post('morning', current_date, '${MARK}','${MARK}','${MARK}','${MARK}')`],
  ["call a SECURITY DEFINER function that writes (chat)",
   `SELECT fn_chat_post_message('${MARK}', 'text', NULL, true)`],
  ["turn the read-only default OFF, then write",
   `SET LOCAL default_transaction_read_only = off;
    INSERT INTO cost_ledger (model, department, mode, prompt_tokens, completion_tokens, cost_eur)
      VALUES ('${MARK}','engineering','subscription',1,1,0.01)`],
  ["read the login table (password hashes)",
   `SELECT count(*) FROM auth.users`],

  // ------------------------------------------------------------------------
  // THE ATTEMPTS THAT MATTER MOST, and the reason the first run of this drill
  // proved less than it looked like it proved.
  //
  // `default_transaction_read_only = on` is set on the role, so most refusals
  // above read "cannot execute INSERT in a read-only transaction" — which is a
  // SETTING, and dxb_reader can change its own settings. `SET LOCAL ... = off`
  // inside an open transaction does not lift it (a transaction's read-only
  // status is fixed when it begins), so that attempt tested nothing either.
  //
  // These four take the setting out of the way properly: one turns it off
  // BEFORE the transaction begins, one starts the transaction READ WRITE
  // explicitly, and both are repeated against the SECURITY DEFINER route. What
  // refuses them is the privilege, which is the only thing that is a wall.
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
   `BEGIN READ WRITE;
    TRUNCATE audit_log;
    ROLLBACK;`, true],
  ["RAW  READ WRITE, then create a table of its own",
   `BEGIN READ WRITE;
    CREATE TABLE public.${MARK.replaceAll("-", "_")}_rw (x int);
    ROLLBACK;`, true],
];

/** Where the drill looks afterwards for anything it might have left behind. */
const SWEEP = [
  ["cost_ledger", `SELECT count(*) FROM cost_ledger WHERE model = '${MARK}'`],
  ["tasks", `SELECT count(*) FROM tasks WHERE objective = '${MARK}'`],
  ["hook_violations", `SELECT count(*) FROM hook_violations WHERE policy_id = '${MARK}'`],
  ["memory_index", `SELECT count(*) FROM memory_index WHERE store = '${MARK}'`],
  ["pgboss.job", `SELECT count(*) FROM pgboss.job WHERE name = '${MARK}'`],
  ["net.http_request_queue", `SELECT count(*) FROM net.http_request_queue WHERE url LIKE '%${MARK}%'`],
  ["new tables anywhere", `SELECT count(*) FROM pg_class WHERE relname LIKE '%${MARK.replaceAll("-", "_")}%'`],
  ["new schemas anywhere", `SELECT count(*) FROM pg_namespace WHERE nspname LIKE '%${MARK.replaceAll("-", "_")}%'`],
];

const pad = (s, n) => (s + " ".repeat(n)).slice(0, n);

/**
 * psql echoes BEGIN, INSERT 0 1 and ROLLBACK alongside the answer, so the
 * number wanted is the last bare-integer line — not the whole output. The first
 * version of this drill compared the whole output with "1" and declared its own
 * detector blind while the write had in fact succeeded.
 */
const lastNumber = (out) =>
  out.split("\n").map((x) => x.trim()).filter((x) => /^\d+$/.test(x)).pop() ?? null;

(async () => {
  console.log(`B36 · Block 3 — the drill, against the ${target.toUpperCase()} engine`);
  console.log(`  connected through the host's psql, as dxb_reader, over the mapped port`);
  console.log(`  marker: ${MARK}`);
  console.log("");

  // ---- 0. THE DETECTOR. Prove a refusal means something -------------------
  // On the construction engine the administrator really can write, and must.
  // On the company nothing is written by anyone: the positive control there is
  // that the window can SEE, which is the property the drill would otherwise be
  // unable to distinguish from a dead connection.
  let detectorLine;
  if (target === "construction") {
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
      console.log("DETECTOR BLIND — the window cannot even read the company, so a refusal");
      console.log("below would only prove the connection is dead.");
      console.log(seen.stderr.slice(0, 500));
      console.log("WINDOW_DRILL_INVALID");
      process.exit(1);
    }
    detectorLine = `detector validated: the window really is connected — it reads ${lastNumber(seen.stdout)} employees`;
  }
  console.log(`  ${detectorLine}`);
  console.log("");

  // ---- 1. THE HOSTILE ATTEMPTS -------------------------------------------
  let refused = 0;
  const escaped = [];
  for (const [name, sql, raw] of ATTEMPTS) {
    const r = await asWindow(raw ? sql : `BEGIN;\n${sql};\nROLLBACK;`);
    const code = (r.stderr.match(/^psql:.*?ERROR:\s*(.*)$/m)
               || r.stderr.match(/ERROR:\s*(.*)/))?.[1] ?? "";
    if (r.code === 0) {
      escaped.push([name, "SUCCEEDED — the wall is missing here"]);
      console.log(`  ESCAPED  ${pad(name, 56)} statement ran`);
    } else {
      refused += 1;
      console.log(`  refused  ${pad(name, 56)} ${code.slice(0, 70)}`);
    }
  }

  // ---- 2. THE SWEEP -------------------------------------------------------
  console.log("");
  let left = 0;
  for (const [where, sql] of SWEEP) {
    const r = await asAdmin(sql);
    const n = Number(lastNumber(r.stdout) ?? "0");
    left += Number.isFinite(n) ? n : 0;
    console.log(`  rows the drill left in ${pad(where, 26)} ${Number.isFinite(n) ? n : "?"}`);
  }

  console.log("");
  console.log(`  attempts        : ${ATTEMPTS.length}`);
  console.log(`  refused         : ${refused}`);
  console.log(`  escaped         : ${escaped.length}`);
  console.log(`  rows left behind: ${left}`);
  for (const [name, why] of escaped) console.log(`    ESCAPE: ${name} — ${why}`);

  if (escaped.length === 0 && left === 0 && refused === ATTEMPTS.length) {
    console.log("");
    console.log("ANSWER: NO — the window cannot change one row in the holding, by any route tried.");
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
