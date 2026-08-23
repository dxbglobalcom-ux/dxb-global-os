#!/usr/bin/env node
// B36 · BLOCK 1 — THE ONE QUESTION, and the only thing that reopens this block.
//
// Agreed with the CEO and the independent auditor, 2026-08-23:
//
//   "Can the SessionEnd hook send an INSERT, UPDATE or DELETE to the company's
//    database — regardless of how the address is spelled, regardless of a
//    missing or stale identity record, and regardless of a connection failure?"
//
//   NO  → Block 1 closes and does not reopen. Other findings go to their own
//         blocks and do not hold it.
//   YES → only the write path that was found is repaired, and this is measured
//         again.
//
// HOW IT ANSWERS, and why the answer is not an opinion:
//
//   1. It drives the COMPILED hook — the same file Claude Code runs at the end
//      of every session — once per hostile condition. Sixteen of them.
//   2. It measures the company from the SERVER, twice, and compares:
//        · pg_stat_all_tables — every tuple inserted, updated, deleted, plus the
//          live row count, for every table the holding owns;
//        · pg_stat_statements — the server's own record of every statement it
//          has been asked to run. A write that was SENT and then failed still
//          appears here. This is what makes the answer "could it send", not
//          merely "did a row change".
//
// SELECT only from this script. The only thing that could write is the hook
// itself, which is the thing under test.
//
//   DXB_COMPANY_URL=… node scripts/b36/prove-block1.mjs
import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, renameSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createServer } from "node:net";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/dist/db.js";

const run = promisify(execFile);
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HOOK = join(REPO, "tools/hooks/dist/tag-subscription-call.js");
const IDENTITY = join(REPO, "tools/hooks/ledger-identity.json");

const company = process.env.DXB_COMPANY_URL;
if (!company) {
  console.error("DXB_COMPANY_URL is not set — this script carries no company address of its own.");
  process.exit(2);
}
const u = new URL(company);
const port = u.port || "5432";
const cred = `${u.username}:${u.password}`;
const dbname = decodeURIComponent(u.pathname.replace(/^\//, ""));

// ── measuring the company ────────────────────────────────────────────────────
async function measure() {
  process.env.DXB_DATABASE_URL = company;
  process.env.DXB_DB_CONNECT_TIMEOUT_MS ??= "10000";
  try {
    const db = getDb();
    const rows = (
      await sql`
        select schemaname||'.'||relname AS key, n_tup_ins::text i, n_tup_upd::text u, n_tup_del::text d,
               (xpath('/row/c/text()', query_to_xml(
                  format('select count(*) c from %I.%I', schemaname, relname), false, true, '')))[1]::text n
          from pg_stat_all_tables
         where schemaname not in ('pg_catalog','information_schema','pg_toast')
         order by 1`.execute(db)
    ).rows;
    // Every statement this database has been asked to run that could change it.
    //
    // THE DETECTOR WAS VALIDATED BEFORE IT WAS TRUSTED, and the first version was
    // BLIND: `\b` is a BACKSPACE in PostgreSQL's regular expressions, not a word
    // boundary, so the pattern matched nothing at all and reported a comfortable
    // zero. `\y` is the word boundary. Measured after the correction: dxb_test
    // 51,262 write calls, the company 372 — the detector sees writes. And this
    // script proves that again on every run, at the end.
    const writes = (
      await sql`
        select coalesce(sum(calls), 0)::text calls, count(*)::text shapes
          from pg_stat_statements s
          join pg_database d on d.oid = s.dbid
         where d.datname = current_database()
           and s.query ~* '^\\s*(insert|update|delete|truncate|copy|merge)\\y'`.execute(db)
    ).rows[0];
    return { tables: Object.fromEntries(rows.map((r) => [r.key, `${r.i}/${r.u}/${r.d}/${r.n}`])), writes };
  } finally {
    await closeDb().catch(() => {});
  }
}

async function measureAt(url) {
  const keep = process.env.DXB_COMPANY_URL;
  process.env.DXB_COMPANY_URL = url;
  const saved = company;
  try {
    process.env.DXB_DATABASE_URL = url;
    const db = getDb();
    const writes = (
      await sql`
        select coalesce(sum(calls), 0)::text calls
          from pg_stat_statements s
          join pg_database d on d.oid = s.dbid
         where d.datname = current_database()
           and s.query ~* '^\\s*(insert|update|delete|truncate|copy|merge)\\y'`.execute(db)
    ).rows[0];
    return { writes };
  } finally {
    await closeDb().catch(() => {});
    process.env.DXB_COMPANY_URL = keep;
    void saved;
  }
}

/** The proof's own row, removed from the ledger it was allowed to write to. */
async function cleanUp(url) {
  process.env.DXB_DATABASE_URL = url;
  try {
    await sql`delete from cost_ledger where model = 'b36-block1-proof'`.execute(getDb());
  } catch {
    /* the table may not exist there — nothing to clean */
  } finally {
    await closeDb().catch(() => {});
  }
}

// ── the hostile conditions ───────────────────────────────────────────────────
const tmp = mkdtempSync(join(tmpdir(), "b36-block1-"));
const transcript = join(tmp, "t.jsonl");
writeFileSync(
  transcript,
  JSON.stringify({ type: "assistant", message: { model: "b36-block1-proof", usage: { input_tokens: 9, output_tokens: 9 } } }) + "\n",
);

const transcript2 = join(tmp, "t2.jsonl");
writeFileSync(
  transcript2,
  JSON.stringify({ type: "assistant", message: { model: "b36-block1-proof", usage: { input_tokens: 3, output_tokens: 3 } } }) + "\n",
);

const real = JSON.parse(readFileSync(IDENTITY, "utf8"));
const withIdentity = (mutate) => {
  const copy = JSON.parse(JSON.stringify(real));
  mutate(copy);
  return JSON.stringify(copy, null, 2);
};

const silent = createServer((sock) => held.push(sock));
const held = [];
await new Promise((r) => silent.listen(0, "127.0.0.1", r));
const deadPort = silent.address().port;

const CASES = [
  ["the company, as written", company, null],
  ["?host= query parameter", `postgresql://${cred}@example.invalid:${port}/${dbname}?host=${u.hostname}`, null],
  ["no database in the path", `postgresql://${cred}@${u.hostname}:${port}`, null],
  ["short IPv4", `postgresql://${cred}@127.1:${port}/${dbname}`, null],
  ["IPv4 as one number", `postgresql://${cred}@2130706433:${port}/${dbname}`, null],
  ["hostname with a trailing dot", `postgresql://${cred}@localhost.:${port}/${dbname}`, null],
  ["another loopback address", `postgresql://${cred}@127.0.0.2:${port}/${dbname}`, null],
  ["the company, with DXB_DATABASE_URL also pointing at it", company, null, { DXB_DATABASE_URL: company }],
  ["the identity record MISSING", company, "missing"],
  ["the allow list EMPTY", company, withIdentity((d) => (d.allowed = []))],
  ["the company record STALE (wrong oid)", company, withIdentity((d) => (d.company.dboid = "999999"))],
  ["the company record STALE (rebuilt under another name)", company, withIdentity((d) => { d.company.dboid = "999999"; d.company.dbname = "postgres_before_the_rebuild"; })],
  ["the allow list POISONED with the company", company, withIdentity((d) => d.allowed.push({ ...d.company, why: "poisoned by hand" }))],
  ["the company record DELETED and the company allowed", company, withIdentity((d) => { d.allowed.push({ ...d.company, why: "poisoned by hand" }); d.company = null; })],
  ["a real database nobody listed", `postgresql://${cred}@${u.hostname}:${port}/_supabase`, null],
  ["an address that answers nothing", `postgresql://${cred}@127.0.0.1:${deadPort}/anything`, null],
  ["an address that cannot be read at all", "this-is-not-an-address", null],
  ["a database that does not exist", `postgresql://${cred}@${u.hostname}:${port}/no_such_database_b36`, null],
];

const before = await measure();
console.log(`company            : ${dbname}`);
console.log(`tables watched     : ${Object.keys(before.tables).length}`);
console.log(`write statements the server has been asked to run, before: ${before.writes.calls} calls · ${before.writes.shapes} shapes`);
console.log("");

const results = [];
for (const [name, url, identityOverride, extraEnv] of CASES) {
  const parked = `${IDENTITY}.parked`;
  let swapped = false;
  if (identityOverride !== null) {
    renameSync(IDENTITY, parked);
    swapped = true;
    if (identityOverride !== "missing") writeFileSync(IDENTITY, identityOverride);
  }
  let stderr = "";
  try {
    const env = { ...process.env, DXB_CONSTRUCTION_DATABASE_URL: url, ...(extraEnv ?? {}) };
    if (!extraEnv) delete env.DXB_DATABASE_URL;
    const child = run("node", [HOOK], { env });
    child.child.stdin?.end(JSON.stringify({ session_id: randomUUID(), transcript_path: transcript }));
    stderr = (await child).stderr;
  } catch (e) {
    stderr = `HOOK CRASHED: ${String(e).slice(0, 120)}`;
  } finally {
    if (swapped) {
      rmSync(IDENTITY, { force: true });
      renameSync(parked, IDENTITY);
    }
  }
  const refused = /refusing to write|is not a permitted construction ledger|is stale/.test(stderr);
  results.push({ name, refused, said: stderr.trim().split("\n")[0]?.replace(/^tag-subscription-call: /, "") ?? "(said nothing)" });
  console.log(`${refused ? "REFUSED " : "!! LET IT THROUGH"} · ${name}`);
  console.log(`           ${results.at(-1).said.slice(0, 150)}`);
}
for (const sock of held) sock.destroy();
await new Promise((r) => silent.close(() => r()));

// ── does the detector see a write AT ALL? ────────────────────────────────────
// A zero is worth nothing from an instrument that cannot register one. The hook
// is fired once at the ledger it IS allowed to write to, and the same
// measurement is taken there. If that does not move, this run proves nothing and
// says so instead of passing.
const allowedUrl = process.env.DXB_ALLOWED_LEDGER_URL;
let detector = { ok: false, note: "DXB_ALLOWED_LEDGER_URL not set — the detector was NOT validated in this run" };
if (allowedUrl) {
  const beforeAllowed = await measureAt(allowedUrl);
  const child = run("node", [HOOK], {
    env: { ...process.env, DXB_CONSTRUCTION_DATABASE_URL: allowedUrl, DXB_DATABASE_URL: undefined },
  });
  child.child.stdin?.end(JSON.stringify({ session_id: randomUUID(), transcript_path: transcript2 }));
  await child.catch(() => {});
  const afterAllowed = await measureAt(allowedUrl);
  const delta = Number(afterAllowed.writes.calls) - Number(beforeAllowed.writes.calls);
  detector = {
    ok: delta > 0,
    note: `the permitted ledger recorded ${delta} new write statement(s) from the same hook in this run`,
  };
  await cleanUp(allowedUrl);
}

// ── the answer ───────────────────────────────────────────────────────────────
const after = await measure();
const movedTables = Object.entries(after.tables).filter(([k, v]) => before.tables[k] !== v);
const newWrites = Number(after.writes.calls) - Number(before.writes.calls);

console.log("");
console.log(`conditions fired   : ${CASES.length}`);
console.log(`refused            : ${results.filter((r) => r.refused).length}`);
console.log(`tables that moved  : ${movedTables.length}${movedTables.length ? " → " + movedTables.map(([k]) => k).join(", ") : ""}`);
console.log(`write statements the server was asked to run during the run: ${newWrites}`);
console.log(`detector validated: ${detector.ok ? "YES" : "NO"} — ${detector.note}`);
rmSync(tmp, { recursive: true, force: true });
console.log("");
const clean = results.every((r) => r.refused) && movedTables.length === 0 && newWrites === 0;
if (!detector.ok) {
  console.log("THIS RUN PROVES NOTHING — the write detector was not shown to register a write.");
  process.exit(2);
}
console.log(
  clean
    ? "ANSWER: NO — the hook cannot send an INSERT, UPDATE or DELETE to the company database.\nBLOCK1_CLOSED"
    : "ANSWER: YES — a write path is still open. BLOCK1_OPEN",
);
process.exit(clean ? 0 : 1);
