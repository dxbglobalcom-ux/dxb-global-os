#!/usr/bin/env node
// B36 — WHERE THE SESSION-END HOOK IS ALLOWED TO WRITE, decided by identity.
//
// This file replaces `company-fingerprint.json` and the deny-only rule it
// carried. A third audit (2026-08-23) broke that rule without touching the
// code: a deny list only knows what it was told to refuse, so the day the
// holding's database is rebuilt under a new identity, the recorded one stops
// matching and the guard waves the write through. **Fail-open on the unknown.**
//
// The rule is now the other way round. The hook writes ONLY into a database
// whose identity is on the ALLOWED list, and refuses everything else — a
// rebuilt company, a fresh cluster, a stranger's server, a typo. The holding's
// own identity is still recorded, because a wall that names its enemy can also
// SAY what it refused, and because a poisoned allow list must still fail.
//
// Identity is asked of the server, never read from an address:
//   system_identifier  — unique per PostgreSQL cluster
//   oid + datname      — unique per database inside that cluster
//
// SELECT only; never writes to any database (CLAUDE.md §5).
//
//   DXB_COMPANY_URL=… node scripts/b36/ledger-identity.mjs --set-company
//   DXB_LEDGER_URL=…  node scripts/b36/ledger-identity.mjs --allow "why this one"
//                     node scripts/b36/ledger-identity.mjs --forget "<sysid>/<dboid>"
//   DXB_COMPANY_URL=… node scripts/b36/ledger-identity.mjs --check
//                     node scripts/b36/ledger-identity.mjs            (print)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { sql } from "kysely";
// The ONE database access path (packages/shared/src/db.ts): no other file in
// this repository may construct a pg Pool of its own.
import { closeDb, getDb } from "../../packages/shared/dist/db.js";

const FILE = fileURLToPath(new URL("../../tools/hooks/ledger-identity.json", import.meta.url));
const IDENTITY_SQL = sql`
  select (select system_identifier::text from pg_control_system()) sysid,
         (select oid::text from pg_database where datname = current_database()) dboid,
         current_database() dbname`;

async function identityOf(url) {
  process.env.DXB_DATABASE_URL = url;
  process.env.DXB_DB_CONNECT_TIMEOUT_MS ??= "5000";
  process.env.DXB_DB_STATEMENT_TIMEOUT_MS ??= "10000";
  try {
    const { rows } = await IDENTITY_SQL.execute(getDb());
    if (!rows[0]?.sysid) throw new Error("this role may not execute pg_control_system()");
    return rows[0];
  } finally {
    await closeDb().catch(() => {});
  }
}

const load = () =>
  existsSync(FILE)
    ? JSON.parse(readFileSync(FILE, "utf8"))
    : { company: null, allowed: [], what: "" };
const save = (d) => writeFileSync(FILE, JSON.stringify(d, null, 2) + "\n");
const same = (a, b) => !!a && !!b && a.sysid === b.sysid && (a.dboid === b.dboid || a.dbname === b.dbname);
const show = (i) => `${i.sysid}/${i.dboid} (${i.dbname})`;

const mode = process.argv[2] ?? "--print";
const data = load();
data.what =
  "Where tools/hooks/tag-subscription-call.ts may write. It writes ONLY into a database whose " +
  "identity is in `allowed`, and never into `company`. Identity comes from the server: the " +
  "cluster's system_identifier plus the database's own oid and name.";

if (mode === "--set-company") {
  const url = process.env.DXB_COMPANY_URL;
  if (!url) throw new Error("DXB_COMPANY_URL is not set — this script carries no address of its own.");
  const live = await identityOf(url);
  if (data.allowed?.some((a) => same(a, live)))
    throw new Error(`refusing: ${show(live)} is on the ALLOWED list — remove it before naming it the company`);
  data.company = { ...live, measured_at: new Date().toISOString() };
  save(data);
  console.log(`COMPANY (never written to): ${show(live)}`);
} else if (mode === "--allow") {
  const url = process.env.DXB_LEDGER_URL;
  const why = process.argv[3];
  if (!url) throw new Error("DXB_LEDGER_URL is not set.");
  if (!why) throw new Error('say why in one line: --allow "…"');
  const live = await identityOf(url);
  if (same(live, data.company))
    throw new Error(`REFUSED: ${show(live)} IS the holding's own database. It can never be a construction ledger.`);
  // A rebuilt stack is a NEW cluster with the same database name, so it does not
  // replace the old entry — it joins it, and the old one is then a standing
  // permission aimed at a cluster that no longer exists. Measured twice on
  // 2026-08-23 while rebuilding the construction stack. It is named here rather
  // than removed automatically: this script never guesses which of two is dead.
  const ghosts = (data.allowed ?? []).filter((a) => !same(a, live) && a.dbname === live.dbname);
  data.allowed = (data.allowed ?? []).filter((a) => !same(a, live));
  data.allowed.push({ ...live, why, measured_at: new Date().toISOString() });
  save(data);
  console.log(`ALLOWED: ${show(live)} — ${why}`);
  for (const g of ghosts)
    console.log(
      `   ⚠ the list still holds ${show(g)} — another cluster with the same database name. ` +
        `If that stack was destroyed, drop it: --forget "${g.sysid}/${g.dboid}"`,
    );
} else if (mode === "--forget") {
  // An allow-list entry for a database that no longer exists is not harmless.
  // It is a standing permission aimed at a name, and names get reused: drop a
  // database and create another with the same name on the same cluster and the
  // entry starts pointing at a stranger. B36 Block 2 dropped `dxb_test`, and
  // this is how its permission left with it.
  const target = process.argv[3];
  if (!target) throw new Error('name it exactly as --print shows it: --forget "<sysid>/<dboid>"');
  const before = (data.allowed ?? []).length;
  data.allowed = (data.allowed ?? []).filter((a) => `${a.sysid}/${a.dboid}` !== target);
  if (data.allowed.length === before)
    throw new Error(`nothing on the allow list is "${target}" — run --print to see what is there`);
  save(data);
  console.log(`FORGOTTEN: ${target} — ${before} entry(ies) before, ${data.allowed.length} after`);
} else if (mode === "--check") {
  const url = process.env.DXB_COMPANY_URL;
  if (!url) throw new Error("DXB_COMPANY_URL is not set.");
  const live = await identityOf(url);
  const ok = data.company && data.company.sysid === live.sysid && data.company.dboid === live.dboid && data.company.dbname === live.dbname;
  console.log(`recorded company : ${data.company ? show(data.company) : "(none)"}`);
  console.log(`live company     : ${show(live)}`);
  console.log(ok ? "COMPANY_IDENTITY_MATCH" : "COMPANY_IDENTITY_DRIFT — re-take it with --set-company");
  process.exit(ok ? 0 : 1);
} else {
  console.log(`company (never written to): ${data.company ? show(data.company) : "(none)"}`);
  console.log(`allowed to receive construction cost rows: ${(data.allowed ?? []).length}`);
  for (const a of data.allowed ?? []) console.log(`   ${show(a)} — ${a.why}`);
}
