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
    //
    // AND IT SEPARATES THE HOOK'S POSSIBLE WRITES FROM THE COMPANY'S OWN WORK.
    // The company runs its own resident scheduler, and pg-boss writes into
    // `pgboss.*` continuously — its queue, its retention sweep, its heartbeat.
    // Measured 2026-08-23, minutes after the scheduler was restarted: this drill
    // saw 4 tables move and 18 write statements and answered BLOCK1_OPEN, while
    // not one of them came from the hook. A drill that is only green while the
    // company is asleep does not answer the question it was written for.
    //
    // So the verdict counts only what the hook could possibly have done. Its one
    // write target is `public.cost_ledger`, and everything a session-end hook
    // could reach lives in `public`. `pgboss` is the company running itself:
    // movement there is REPORTED by name, never counted as the hook's — and a
    // write statement that touches pgboss objects but is not pg-boss's own shape
    // still falls into the counted set, because the filter is on the objects the
    // statement names, not on who is assumed to have sent it.
    const writes = (
      await sql`
        select coalesce(sum(calls), 0)::text calls, count(*)::text shapes
          from pg_stat_statements s
          join pg_database d on d.oid = s.dbid
         where d.datname = current_database()
           and s.query ~* '^\\s*(insert|update|delete|truncate|copy|merge)\\y'`.execute(db)
    ).rows[0];
    // Per SHAPE, so a statement can be attributed instead of merely counted.
    const shapes = (
      await sql`
        select s.queryid::text id, s.calls::text calls,
               left(regexp_replace(s.query, '\\s+', ' ', 'g'), 110) text
          from pg_stat_statements s
          join pg_database d on d.oid = s.dbid
         where d.datname = current_database()
           and s.query ~* '^\\s*(insert|update|delete|truncate|copy|merge)\\y'`.execute(db)
    ).rows;
    return {
      tables: Object.fromEntries(rows.map((r) => [r.key, `${r.i}/${r.u}/${r.d}/${r.n}`])),
      writes,
      shapes: Object.fromEntries(shapes.map((r) => [r.id, { calls: Number(r.calls), text: r.text }])),
    };
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

// Every session id this drill hands to the hook. The hook writes ONE thing —
// a `cost_ledger` row carrying `meta->>'session_id'` — so these ids are the
// hook's own signature, and looking for them in the company is an attribution
// nothing in the background can imitate.
const firedSessions = [];

// ── THE CONTROL WINDOW ───────────────────────────────────────────────────────
//
// The company is NOT a quiet database. It runs its own resident services — the
// pg-boss scheduler and the JARVIS intent drain — and they write into its own
// tables continuously, `public.intents` among them. Measured 2026-08-23, minutes
// after those services were restarted: this drill reported 4 tables moved and 18
// write statements and answered BLOCK1_OPEN, and not one of those writes came
// from the hook. A drill that is only green while the company is asleep does not
// answer the question it was written for; a drill that hard-codes a list of
// "writes we have decided to ignore" answers a question nobody asked.
//
// TWO ATTEMPTS WERE MADE TO SUBTRACT THAT NOISE BY SAMPLING IT, AND BOTH LOST
// THE RACE. Measuring a 20-second control window and excluding whatever moved in
// it is not enough: pg-boss's cron heartbeat is on 60 seconds, its monitor and
// maintain passes on minutes, so each battery run flagged a different pg-boss
// statement — `pgboss.version`, then `pgboss.queue`, then `pgboss.bam`. Widening
// the window until it covers every cadence is a race a drill in a test battery
// will keep losing, and an intermittent red is worse than a weak green.
//
// SO THE VERDICT DOES NOT REST ON THE NOISE AT ALL. It rests on two things that
// cannot be imitated by anything else running on that server:
//
//   1. The hook's OWN SIGNATURE. It writes exactly one thing — a `cost_ledger`
//      row carrying the session id it was handed — and this drill hands it 18
//      ids nobody else has. If any of them appears anywhere in the company, the
//      hook wrote. That is attribution, not inference.
//   2. WHAT THE COMPILED HOOK CAN DO AT ALL, read out of the artefact that runs:
//      `tools/hooks/dist/tag-subscription-call.js` must contain exactly one
//      write construct and it must be the `cost_ledger` insert. The scan proves
//      itself in the same breath — a scanner that found no write at all would be
//      broken, not reassuring.
//
// The before/after measurement stays, and it is still worth its place: it is
// printed as WHAT THE COMPANY DID while the drill ran, named table by table. It
// is context the reader can see, and it is no longer asked to answer a question
// it cannot answer.
const CONTROL_MS = Number(process.env.DXB_BLOCK1_CONTROL_MS ?? 20000);
const c0 = await measure();
await new Promise((r) => setTimeout(r, CONTROL_MS));
const c1 = await measure();
const backgroundTables = new Set(
  Object.keys(c1.tables).filter((k) => c0.tables[k] !== c1.tables[k]),
);
const backgroundShapes = new Set(
  Object.keys(c1.shapes).filter((id) => (c0.shapes[id]?.calls ?? 0) !== c1.shapes[id].calls),
);

const before = await measure();
console.log(`company            : ${dbname}`);
console.log(`tables watched     : ${Object.keys(before.tables).length}`);
console.log(`write statements the server has been asked to run, before: ${before.writes.calls} calls · ${before.writes.shapes} shapes`);
console.log(
  `the company working on its own, measured over ${CONTROL_MS / 1000}s with nothing of ours running: ` +
    `${backgroundTables.size} table(s) · ${backgroundShapes.size} statement shape(s)` +
    (backgroundTables.size ? ` → ${[...backgroundTables].join(", ")}` : ""),
);
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
    const sid = randomUUID();
    firedSessions.push(sid);
    child.child.stdin?.end(JSON.stringify({ session_id: sid, transcript_path: transcript }));
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
const allMoved = Object.entries(after.tables).filter(([k, v]) => before.tables[k] !== v);
const allShapes = Object.keys(after.shapes).filter(
  (id) => (before.shapes[id]?.calls ?? 0) !== after.shapes[id].calls,
);
const ambientWrites = allShapes.reduce(
  (n, id) => n + (after.shapes[id].calls - (before.shapes[id]?.calls ?? 0)),
  0,
);

// ── 1. THE HOOK'S OWN SIGNATURE, looked for in the company ───────────────────
//
// AND, IN THE SAME BREATH, WHETHER THE RECORD STILL NAMES THE LIVE COMPANY.
// That question used to be asked inside the battery, which meant the battery
// held the company's address and its write-capable account — the auditor's first
// FAIL on Block 2, 2026-08-23. It belongs here: this drill is the one thing in
// the repository that reaches the holding on purpose, and it is not `pnpm test`.
// A rebuilt holding (a new cluster, or `supabase db reset`) changes its identity
// and the record must be re-taken with
// `node scripts/b36/ledger-identity.mjs --set-company`; until it is, Wall 1 is
// aiming at something that is gone and this drill says so instead of passing.
process.env.DXB_DATABASE_URL = company;
let signature;
let recorded;
let live;
try {
  const db = getDb();
  const { rows } = await sql`
    select count(*)::text n
      from cost_ledger
     where meta->>'session_id' = ANY(${firedSessions})`.execute(db);
  signature = Number(rows[0].n);
  const id = await sql`
    select (select system_identifier::text from pg_control_system()) sysid,
           (select oid::text from pg_database where datname = current_database()) dboid,
           current_database() dbname`.execute(db);
  live = id.rows[0];
  recorded = JSON.parse(readFileSync(IDENTITY, "utf8")).company;
} finally {
  await closeDb().catch(() => {});
}
const recordFresh =
  !!recorded && !!live &&
  recorded.sysid === live.sysid && recorded.dboid === live.dboid && recorded.dbname === live.dbname;

// ── 2. WHAT THE COMPILED HOOK CAN DO AT ALL ──────────────────────────────────
//
// Read out of the artefact that actually runs at session end, not out of the
// source. Kysely's write builders and raw SQL write verbs, counted separately so
// the scan can say it found something — a scan that matched nothing would be a
// broken scanner reporting good news.
const built = readFileSync(HOOK, "utf8");
const writeConstructs = {
  'insertInto("cost_ledger")': (built.match(/insertInto\("cost_ledger"\)/g) ?? []).length,
  "insertInto (any other table)":
    (built.match(/insertInto\(/g) ?? []).length -
    (built.match(/insertInto\("cost_ledger"\)/g) ?? []).length,
  updateTable: (built.match(/updateTable\(/g) ?? []).length,
  deleteFrom: (built.match(/deleteFrom\(/g) ?? []).length,
  "raw insert/update/delete/truncate":
    (built.match(/\b(insert\s+into|update\s+\w|delete\s+from|truncate)\b/gi) ?? []).length,
};
const otherWrites = Object.entries(writeConstructs)
  .filter(([k]) => k !== 'insertInto("cost_ledger")')
  .reduce((n, [, v]) => n + v, 0);
const scanFoundItsTarget = writeConstructs['insertInto("cost_ledger")'] >= 1;

console.log("");
console.log(`conditions fired   : ${CASES.length}`);
console.log(`refused            : ${results.filter((r) => r.refused).length}`);
console.log(`the hook's own signature in the company: ${signature} row(s) carrying any of the ${firedSessions.length} session ids this drill handed it`);
console.log(
  `what the compiled hook can write at all: ${writeConstructs['insertInto("cost_ledger")']} × cost_ledger insert · ` +
    `${otherWrites} other write construct(s)`,
);
console.log(
  `what the company did on its own while the drill ran (context, not a verdict): ` +
    `${ambientWrites} statement(s)${allMoved.length ? " · " + allMoved.map(([k]) => k).join(", ") : ""}`,
);
console.log(
  `the recorded company still names the live one: ${recordFresh ? "YES" : "NO"} — ` +
    `record ${recorded ? `${recorded.sysid}/${recorded.dboid} (${recorded.dbname})` : "(absent)"} · ` +
    `live ${live ? `${live.sysid}/${live.dboid} (${live.dbname})` : "(unreadable)"}` +
    (recordFresh ? "" : " → re-take it with `node scripts/b36/ledger-identity.mjs --set-company`"),
);
console.log(`detector validated: ${detector.ok ? "YES" : "NO"} — ${detector.note}`);
console.log(
  `scan validated: ${scanFoundItsTarget ? "YES" : "NO"} — it found the hook's one known write in the built file`,
);
rmSync(tmp, { recursive: true, force: true });
console.log("");

if (!detector.ok) {
  console.log("THIS RUN PROVES NOTHING — the write detector was not shown to register a write.");
  process.exit(2);
}
if (!scanFoundItsTarget) {
  console.log("THIS RUN PROVES NOTHING — the scan did not find the hook's own known write, so it proves nothing about the rest.");
  process.exit(2);
}

const clean =
  results.every((r) => r.refused) && signature === 0 && otherWrites === 0 && recordFresh;
console.log(
  clean
    ? "ANSWER: NO — the hook cannot send an INSERT, UPDATE or DELETE to the company database.\nBLOCK1_CLOSED"
    : "ANSWER: YES — a write path is still open. BLOCK1_OPEN",
);
process.exit(clean ? 0 : 1);
