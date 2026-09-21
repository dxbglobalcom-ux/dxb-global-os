#!/usr/bin/env node
/**
 * B36 · Block 3, second audit round — CAN A FORGED EVENT REACH THE CEO'S SCREEN?
 *
 * THE AUDIT'S ORDER, 2026-08-24: "Önce sahte ve biçimi geçerli bir NOTIFY
 * mesajının ekrana geçtiğini kırmızıyla kanıtla; sonra aynı mesajın
 * reddedildiğini, gerçek şirket olaylarının ise çalışmaya devam ettiğini
 * kanıtla."
 *
 * WHY THIS EXISTS. `NOTIFY` is a COMMAND, not a function. PostgreSQL has no
 * privilege over it: any role that may connect may notify any channel, and no
 * GRANT or REVOKE reaches it. The one-way window cannot write one row of the
 * CEO's data — and could still put an event that never happened on his Live
 * Operations page, because the ops:live collector republished anything that
 * parsed as a §9a envelope, verbatim.
 *
 * WHAT IT DOES, in order, and it refuses to pass unless BOTH halves happen:
 *
 *   RED    the OLD listener is reproduced here, exactly as it was committed —
 *          LISTEN, parse, publish — and a forged envelope sent by the REAL
 *          `dxb_reader` reaches `realtime.messages` on the `dxb:ops:live` topic,
 *          which is the last hop the database can see before the browser.
 *   GREEN  the SHIPPED collector is started, the SAME forged envelope is sent by
 *          the SAME role and does NOT arrive, and an event issued through the
 *          company's own door (`public.fn_opslive_notify`) still does.
 *
 * ONLY ON THE CONSTRUCTION ENGINE — separate cluster, separate volume, nothing
 * of the holding's in it. Sending a forged event at the CEO's own screen to see
 * whether it lands is not something anybody does to his company.
 *
 * Usage:  node scripts/b36/prove-forged-event.mjs
 */
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const CONTAINER = "supabase_db_DxB_Build";
const MIGRATION = join(REPO, "db/migrations/20260824003000_ops_live_event_receipt.sql");

// The construction address is spelled ONCE in this repository (B36 Block 2), so
// it is read from its owner rather than written again here.
const CONSTRUCTION_URL = (() => {
  const m = readFileSync(join(REPO, "tests/construction-engine.ts"), "utf8")
    .match(/CONSTRUCTION_DATABASE_URL\s*=\s*\n?\s*"([^"]+)"/);
  if (!m) { console.error("cannot read the construction address from tests/construction-engine.ts"); process.exit(2); }
  return m[1];
})();
if (!CONSTRUCTION_URL.includes(":54422/")) {
  console.error("REFUSED: this file sends a forged event on purpose and may only run on the construction engine.");
  process.exit(2);
}
process.env.DXB_DATABASE_URL = CONSTRUCTION_URL;

const windowEnv = join(REPO, "var/b36/construction-window.env");
const WINDOW_URL = readFileSync(windowEnv, "utf8")
  .split("\n").find((l) => l.startsWith("DXB_CONSTRUCTION_READONLY_URL="))
  ?.slice("DXB_CONSTRUCTION_READONLY_URL=".length).trim();
if (!WINDOW_URL) { console.error(`no window installed: ${windowEnv}`); process.exit(2); }

const { createListenClient } = await import(join(REPO, "packages/shared/dist/index.js"));
const { startOpsLiveCollector } = await import(join(REPO, "packages/orchestrator/dist/ops-live-collector.js"));

function sh(argv, stdin) {
  return new Promise((resolve) => {
    const child = spawn(argv[0], argv.slice(1), { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });
    child.on("error", (e) => resolve({ code: -1, stdout, stderr: String(e) }));
    child.on("close", (code) => resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() }));
    child.stdin.end(stdin ?? "");
  });
}
const asAdmin = (sql) => sh(["docker", "exec", "-i", CONTAINER, "psql", "-U", "supabase_admin",
                             "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-tA"], sql);
/** The forged message, sent by the REAL read-only role over the mapped port. */
const asWindow = (sql) => sh(["psql", WINDOW_URL, "-v", "ON_ERROR_STOP=1", "-tA"], sql);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const line = (s) => console.log(s);
const lastNumber = (out) =>
  out.split("\n").map((x) => x.trim()).filter((x) => /^\d+$/.test(x)).pop() ?? null;

/** A well-formed §9a envelope that no company event ever produced. */
function forge(mark) {
  return {
    event_id: randomUUID(),
    ts: new Date().toISOString(),
    type: "run.succeeded",
    actor: "employee:00000000-0000-0000-0000-000000000000",
    entity: { kind: "run", id: randomUUID() },
    corr: { task_id: null, run_id: null, workflow_run_id: null, project_id: null },
    payload: { run_id: null, status: "succeeded", employee: mark, model: mark, progress: 100 },
  };
}

/** How many broadcasts carrying this marker reached the ops:live topic. */
async function arrived(mark) {
  const r = await asAdmin(
    `SELECT count(*) FROM realtime.messages
      WHERE topic = 'dxb:ops:live' AND extension = 'broadcast'
        AND payload::text LIKE '%${mark}%';`);
  return Number(lastNumber(r.stdout) ?? "-1");
}

let failed = false;
const fail = (why) => { failed = true; line(""); line(`  ${why}`); };

(async () => {
  line("B36 · Block 3 — can a forged event reach the CEO's screen?");
  line(`  engine: ${CONTAINER} (disposable — the company is never notified by this file)`);
  line("");

  // ── RED ───────────────────────────────────────────────────────────────────
  // The listener exactly as it was committed before this fix: listen, parse,
  // publish. Reproduced here so the refusal below is measured against a route
  // that was PROVEN open, not against one that is merely described.
  const redMark = `b36-forged-red-${process.pid}`;
  const redEnv = forge(redMark);
  const old = await createListenClient();
  old.on("notification", (msg) => {
    if (msg.channel !== "dxb_ops_live" || !msg.payload) return;
    try {
      const env = JSON.parse(msg.payload);
      void old.query("SELECT public.notify_broadcast($1, $2, $3::jsonb)",
                     ["ops:live", env.type, JSON.stringify(env)]);
    } catch { /* the old listener dropped only unparseable payloads */ }
  });
  await old.query("LISTEN dxb_ops_live");

  // THE COMMAND, not the function. `pg_notify()` has an ACL and Block 3's seal
  // took it away; `NOTIFY` has none and no GRANT or REVOKE can reach it. That
  // difference is the whole reason this route stayed open.
  const sent = await asWindow(
    `SET default_transaction_read_only = off;
     BEGIN; NOTIFY dxb_ops_live, $$${JSON.stringify(redEnv)}$$; COMMIT;`);
  line(`  the read-only window sent a forged, well-formed event: ${sent.code === 0 ? "accepted by the server" : "REFUSED — " + sent.stderr.slice(0, 60)}`);
  await sleep(2500);
  const redCount = await arrived(redMark);
  line(`  RED   with the OLD listener, forged events on the CEO's channel: ${redCount}`);
  await old.query("UNLISTEN dxb_ops_live");
  await old.end();
  if (redCount < 1) {
    fail("the forgery did NOT reproduce, so the refusal below would prove nothing. " +
         "Either the window cannot notify any more or this engine differs from the audited one.");
  }
  line("");

  // ── the fix, applied to this engine ───────────────────────────────────────
  const mig = await asAdmin(readFileSync(MIGRATION, "utf8"));
  if (mig.code !== 0) fail(`the receipt migration did not apply: ${mig.stderr.slice(0, 300)}`);
  else line("  applied db/migrations/20260824003000_ops_live_event_receipt.sql (idempotent)");
  line("");

  // THE BENCH'S RECEIPTS ARE NOT THIS FILE'S TO SPEND. Two hands here reach
  // rows nobody here wrote: the collector started below prunes EVERY receipt
  // older than an hour on its first flush (`lastPruneAt = 0` beats the
  // interval), and this file's own cleanup used to end with an unscoped
  // `DELETE ... WHERE issued_at < now() + interval '1 second'` — the whole
  // table, whoever filled it. Measured 2026-09-21 on the rebuilt bench: a
  // battery ended dxb_internal.ops_live_issued 5 -> 0, and the seed's own four
  // receipts had gone the same way the run before. So the receipts are
  // BORROWED: take what the bench holds now, hand back exactly that, and keep
  // nothing this proof minted.
  const held = (await asAdmin(
    `SELECT event_id::text || '|' || issued_at::text FROM dxb_internal.ops_live_issued;`))
    .stdout.split("\n").map((s) => s.trim()).filter((s) => s.includes("|"))
    .map((s) => { const [id, at] = s.split("|"); return { id, at }; });
  line(`  the bench holds ${held.length} receipt(s) before this proof — they go back untouched`);
  line("");

  // ── GREEN ─────────────────────────────────────────────────────────────────
  const collector = await startOpsLiveCollector({ windowMs: 300, log: () => {} });
  try {
    const greenMark = `b36-forged-green-${process.pid}`;
    const greenEnv = forge(greenMark);
    await asWindow(
      `SET default_transaction_read_only = off;
       BEGIN; NOTIFY dxb_ops_live, $$${JSON.stringify(greenEnv)}$$; COMMIT;`);
    await sleep(1500);
    await collector.flushNow();
    await sleep(500);
    const forgedNow = await arrived(greenMark);
    line(`  GREEN with the SHIPPED collector, forged events on the CEO's channel: ${forgedNow}`);
    if (forgedNow !== 0) fail("a forged event still reaches the CEO's screen.");

    // And the company's own door must still work, or the fix has broken the
    // surface it was written to protect.
    const realMark = `b36-real-${process.pid}`;
    const realEnv = forge(realMark);
    const issued = await asAdmin(
      `SELECT public.fn_opslive_notify($$${JSON.stringify(realEnv)}$$::jsonb);`);
    if (issued.code !== 0) fail(`the company's own door failed: ${issued.stderr.slice(0, 200)}`);
    await sleep(1500);
    await collector.flushNow();
    await sleep(500);
    const realNow = await arrived(realMark);
    line(`  GREEN events issued through the company's own door that arrived : ${realNow}`);
    if (realNow < 1) fail("a real company event no longer reaches the screen — the fix broke the surface.");

    // The receipt is consumed, so the same id cannot be played twice.
    await asAdmin(`SELECT pg_notify('dxb_ops_live', $$${JSON.stringify(realEnv)}$$);`);
    await sleep(1200);
    await collector.flushNow();
    await sleep(400);
    const replayed = await arrived(realMark);
    line(`  GREEN the same event replayed a second time, arrivals now       : ${replayed} (must stay ${realNow})`);
    if (replayed !== realNow) fail("a replayed event was published again — the receipt is not consumed.");
  } finally {
    await collector.stop();
    await asAdmin(`DELETE FROM realtime.messages WHERE payload::text LIKE '%b36-forged-%'
                      OR payload::text LIKE '%b36-real-%';`);
    // Put back what was borrowed, then take away only what this proof minted.
    await asAdmin(held.length > 0
      ? `INSERT INTO dxb_internal.ops_live_issued (event_id, issued_at) VALUES ` +
        held.map((r) => `('${r.id}','${r.at}'::timestamptz)`).join(",") +
        ` ON CONFLICT (event_id) DO NOTHING;
         DELETE FROM dxb_internal.ops_live_issued
          WHERE event_id NOT IN (${held.map((r) => `'${r.id}'`).join(",")});`
      : `DELETE FROM dxb_internal.ops_live_issued;`);
  }

  line("");
  if (failed) { line("FORGED_EVENT_PROOF_FAILED"); process.exit(1); }
  line("A forged event reached the screen with the old listener and is refused by the shipped one,");
  line("while the company's own events still arrive and cannot be replayed.");
  line("FORGED_EVENT_REFUSED");
})().catch((e) => {
  console.error(String(e?.message || e).slice(0, 2000));
  console.error("FORGED_EVENT_PROOF_FAILED");
  process.exit(1);
});
