#!/usr/bin/env node
/**
 * B36 · Block 3 — THE TWO AUDITED ESCAPES, SHOWN RED AND THEN GREEN.
 *
 * On 2026-08-24 the block was audited and FAILED. The verdict was right, and its
 * sharpest sentence is the reason this file exists:
 *
 *   "Yazarın 23 saldırı · 23 ret kanıtı yanlış değil; fakat bu iki saldırıyı hiç
 *    denememiş. Dolayısıyla test yeşil, soru cevapsız kalmış."
 *
 * A green test that never asked the question is not an answer. So the two
 * escapes are not merely walled — they are RE-OPENED here, fired for real with
 * the real `dxb_reader`, required to SUCCEED, and only then closed again and
 * required to be refused. If a future edit quietly removes the wall, this file
 * goes red at the second half; if a future edit removes the ESCAPE ITSELF from
 * the proof, it goes red at the first.
 *
 *   ESCAPE 1 — LARGE OBJECTS. PostgreSQL grants EXECUTE on the large-object
 *   functions to PUBLIC by default, and PUBLIC includes every role that will
 *   ever exist. `lo_from_bytea` writes permanent bytes into pg_largeobject, in
 *   the CEO's own database, and `default_transaction_read_only` does not stop it
 *   because that is a SETTING the role can turn off.
 *
 *   ESCAPE 2 — A SEQUENCE. `net.http_request_queue_id_seq` carried `=rwU` to
 *   PUBLIC. nextval() is the one write PostgreSQL does NOT undo on ROLLBACK, in
 *   its own words, so a counter the window can turn is a permanent change that
 *   a rolled-back drill would never have noticed.
 *
 * THIS RUNS ONLY ON THE CONSTRUCTION ENGINE — separate cluster, separate volume,
 * nothing of the holding's in it, rebuildable from scratch. The company is never
 * re-opened, not for a second, not inside a transaction. That is the audit's
 * ruling and the CEO's order of the same day: "TEK BİR HARF DAHİ ŞİRKETİN VERİ
 * TABANINA GİRMESİN!"
 *
 * Usage:  node scripts/b36/prove-window-escapes.mjs
 */
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const CONTAINER = "supabase_db_DxB_Build";
const ENV_FILE = join(REPO, "var/b36/construction-window.env");
const WINDOW_SQL = join(REPO, "scripts/b36/company-one-way-window.sql");

if (!existsSync(ENV_FILE)) {
  console.error(`no construction window installed: ${ENV_FILE} is missing.`);
  console.error("run: node scripts/b36/install-company-window.mjs construction");
  process.exit(2);
}
const URL_ = readFileSync(ENV_FILE, "utf8")
  .split("\n").find((l) => l.startsWith("DXB_CONSTRUCTION_READONLY_URL="))
  ?.slice("DXB_CONSTRUCTION_READONLY_URL=".length).trim();
if (!URL_) { console.error("DXB_CONSTRUCTION_READONLY_URL not found"); process.exit(2); }

// A last, hard refusal to point any of this at the holding.
if (URL_.includes(":54322/") || URL_.includes("DxB_Global_OS")) {
  console.error("REFUSED: this file re-opens a hole on purpose and may only ever");
  console.error("run against the disposable construction engine.");
  process.exit(2);
}

function run(argv, sql) {
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
const asWindow = (sql) => run(["psql", URL_, "-v", "ON_ERROR_STOP=1", "-tA"], sql);
const asAdmin = (sql) => run(["docker", "exec", "-i", CONTAINER, "psql", "-U", "supabase_admin",
                              "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-tA"], sql);

const lastNumber = (out) =>
  out.split("\n").map((x) => x.trim()).filter((x) => /^-?\d+$/.test(x)).pop() ?? null;
const line = (s) => console.log(s);

/** Never leave the engine standing in the RED state, whatever goes wrong. */
async function reseal() {
  const r = await asAdmin(readFileSync(WINDOW_SQL, "utf8"));
  await asAdmin(`SELECT lo_unlink(oid) FROM pg_largeobject_metadata
                  WHERE lomowner = 'dxb_reader'::regrole;`);
  return r.code === 0;
}
async function fail(why) {
  line("");
  line(`  ${why}`);
  line(`  re-sealing the engine before leaving: ${(await reseal()) ? "done" : "FAILED — re-run pnpm b36:window construction"}`);
  line("ESCAPE_PROOF_FAILED");
  process.exit(1);
}

/** Put back exactly what the pre-audit window left open, and nothing else. */
const REOPEN = `
  DO $$
  DECLARE f record;
  BEGIN
    FOR f IN SELECT format('%I.%I(%s)', n.nspname, p.proname,
                           pg_get_function_identity_arguments(p.oid)) AS sig
               FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
              WHERE n.nspname = 'pg_catalog'
                AND (p.proname ~ '^lo_' OR p.proname IN ('loread','lowrite'))
    LOOP
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO PUBLIC', f.sig);
    END LOOP;
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'net') THEN
      EXECUTE 'GRANT USAGE ON SCHEMA net TO PUBLIC';
      EXECUTE 'GRANT USAGE, SELECT, UPDATE ON SEQUENCE net.http_request_queue_id_seq TO PUBLIC';
    END IF;
  END $$;
`;

(async () => {
  line("B36 · Block 3 — the two audited escapes, red first, then green");
  line(`  engine: ${CONTAINER} (disposable — the company is never touched by this file)`);
  line("");

  // ── RED ────────────────────────────────────────────────────────────────────
  line("  RE-OPENING the pre-audit state: EXECUTE on the large-object family back to");
  line("  PUBLIC, and USAGE/SELECT/UPDATE on the outbound counter back to PUBLIC.");
  const reopened = await asAdmin(REOPEN);
  if (reopened.code !== 0) await fail(`could not re-open the pre-audit state: ${reopened.stderr.slice(0, 300)}`);

  const lo0 = Number(lastNumber((await asAdmin("SELECT count(*) FROM pg_largeobject_metadata;")).stdout) ?? "-1");
  const seq0 = Number(lastNumber((await asAdmin("SELECT last_value FROM net.http_request_queue_id_seq;")).stdout) ?? "-1");
  line(`  before: large objects ${lo0} · outbound counter at ${seq0}`);
  line("");

  const red1 = await asWindow(
    `SET default_transaction_read_only = off;
     SELECT lo_from_bytea(0, 'b36-escape-proof'::bytea);`);
  const madeOid = red1.code === 0 ? Number(lastNumber(red1.stdout) ?? "-1") : -1;
  line(`  RED 1  large object  ${red1.code === 0 ? `CREATED, oid ${madeOid}` : `refused: ${red1.stderr.slice(0, 60)}`}`);

  const red2 = await asWindow(
    `SET default_transaction_read_only = off;
     BEGIN; SELECT nextval('net.http_request_queue_id_seq'); ROLLBACK;`);
  const seq1 = Number(lastNumber((await asAdmin("SELECT last_value FROM net.http_request_queue_id_seq;")).stdout) ?? "-1");
  const advanced = red2.code === 0 && seq1 !== seq0;
  line(`  RED 2  counter       ${red2.code === 0
    ? `TURNED — ${seq0} -> ${seq1}, and the ROLLBACK did not put it back`
    : `refused: ${red2.stderr.slice(0, 60)}`}`);

  const lo1 = Number(lastNumber((await asAdmin("SELECT count(*) FROM pg_largeobject_metadata;")).stdout) ?? "-1");
  line(`  after : large objects ${lo1} (was ${lo0})`);
  line("");

  if (red1.code !== 0 || madeOid <= 0 || lo1 <= lo0) {
    await fail("the first escape did NOT reproduce. Either the re-open above is wrong or the " +
         "engine differs from the audited one — either way this proof cannot be trusted.");
  }
  if (!advanced) {
    await fail("the second escape did NOT reproduce: the counter did not move, or the move " +
         "was undone. The proof cannot tell a wall from a coincidence.");
  }
  line("  BOTH ESCAPES REPRODUCED with the real dxb_reader. The audit was right.");
  line("");

  // ── GREEN ──────────────────────────────────────────────────────────────────
  line("  APPLYING the widened seal (scripts/b36/company-one-way-window.sql) …");
  const sealed = await asAdmin(readFileSync(WINDOW_SQL, "utf8"));
  if (sealed.code !== 0) await fail(`the seal did not apply: ${sealed.stderr.slice(0, 600)}`);
  for (const n of sealed.stderr.split("\n").filter((l) => l.includes("one-way window"))) {
    line(`    ${n.replace(/^NOTICE:\s*/, "").trim()}`);
  }
  line("");

  const green1 = await asWindow(
    `SET default_transaction_read_only = off;
     SELECT lo_from_bytea(0, 'b36-escape-proof-again'::bytea);`);
  const g1err = (green1.stderr.match(/ERROR:\s*(.*)/) ?? [])[1] ?? "";
  line(`  GREEN 1 large object  ${green1.code === 0 ? "STILL POSSIBLE" : `refused: ${g1err.slice(0, 60)}`}`);

  const seqBefore = Number(lastNumber((await asAdmin("SELECT last_value FROM net.http_request_queue_id_seq;")).stdout) ?? "-1");
  const green2 = await asWindow(
    `SET default_transaction_read_only = off;
     BEGIN; SELECT nextval('net.http_request_queue_id_seq'); ROLLBACK;`);
  const seqAfter = Number(lastNumber((await asAdmin("SELECT last_value FROM net.http_request_queue_id_seq;")).stdout) ?? "-1");
  const g2err = (green2.stderr.match(/ERROR:\s*(.*)/) ?? [])[1] ?? "";
  line(`  GREEN 2 counter       ${green2.code === 0 && seqAfter !== seqBefore
    ? "STILL TURNS" : `refused: ${g2err.slice(0, 60)}  (counter unmoved at ${seqAfter})`}`);
  line("");

  // ── sweep the red phase's own residue ─────────────────────────────────────
  const swept = await asAdmin(
    `SELECT count(*) FROM (SELECT lo_unlink(oid) FROM pg_largeobject_metadata
       WHERE lomowner = 'dxb_reader'::regrole) x;`);
  const loEnd = Number(lastNumber((await asAdmin("SELECT count(*) FROM pg_largeobject_metadata;")).stdout) ?? "-1");
  line(`  swept the red phase's own large objects: ${lastNumber(swept.stdout) ?? "?"} removed, ${loEnd} left on the engine`);
  line("");

  if (green1.code === 0 || (green2.code === 0 && seqAfter !== seqBefore) || loEnd !== lo0) {
    await fail("the seal did not close both escapes, or the proof left residue behind.");
  }

  line("BOTH ESCAPES: reproduced red with the real role, then refused by the server.");
  line("ESCAPES_RED_THEN_GREEN");
})().catch((e) => {
  console.error(String(e?.message || e).slice(0, 2000));
  console.error("ESCAPE_PROOF_FAILED");
  process.exit(1);
});
