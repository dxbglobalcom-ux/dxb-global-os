#!/usr/bin/env node
// B36 — proof that construction work does not write into the holding's database.
//
// Why row counts were not enough. The claim "this session did not touch the
// company" used to rest on comparing table counts taken days apart. An
// independent audit rejected it on 2026-08-23 and was right: a count says
// nothing about an UPDATE, nothing about an INSERT and a DELETE that cancel out,
// and nothing about WHO did it.
//
// PostgreSQL itself keeps the answer. `pg_stat_all_tables` counts every tuple
// inserted, updated and deleted per table since the statistics epoch. An UPDATE
// moves n_tup_upd; an insert-then-delete moves both counters and leaves the row
// count where it was. Nothing that writes can hide from all three.
//
//   THE EPOCH. Counters run from the last statistics reset, or from the moment
//   the engine came up without a usable statistics file. Both are printed, and a
//   baseline taken before an epoch change is refused rather than trusted.
//
// SELECT only, on the one access path (packages/shared/src/db.ts).
//
//   DXB_COMPANY_URL=… node scripts/b36/company-write-watch.mjs --baseline
//   DXB_COMPANY_URL=… node scripts/b36/company-write-watch.mjs            # check
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/dist/db.js";

const SNAPSHOT = fileURLToPath(
  new URL(
    "../../.planning/quick/20260823-construction-company-separation/company-write-baseline.json",
    import.meta.url,
  ),
);

const url = process.env.DXB_COMPANY_URL;
if (!url) {
  console.error("DXB_COMPANY_URL is not set — this script carries no company address of its own.");
  process.exit(2);
}
process.env.DXB_DATABASE_URL = url;
const db = getDb();

const epoch = (
  await sql`
    select pg_postmaster_start_time()::text engine_up,
           (select stats_reset::text from pg_stat_database where datname = current_database()) stats_reset,
           now()::text taken_at`.execute(db)
).rows[0];

const tables = (
  await sql`
    select relname,
           n_tup_ins::text ins, n_tup_upd::text upd, n_tup_del::text del,
           (xpath('/row/c/text()', query_to_xml(format('select count(*) c from public.%I', relname), false, true, '')))[1]::text rows
      from pg_stat_all_tables
     where schemaname = 'public'
     order by relname`.execute(db)
).rows;
await closeDb();

const state = Object.fromEntries(tables.map((t) => [t.relname, t]));
const totals = tables.reduce(
  (a, t) => ({ ins: a.ins + +t.ins, upd: a.upd + +t.upd, del: a.del + +t.del }),
  { ins: 0, upd: 0, del: 0 },
);

console.log(`company           : ${tables.length} tables in public`);
console.log(`engine up since   : ${epoch.engine_up}`);
console.log(`statistics reset  : ${epoch.stats_reset ?? "never (counters run from the engine start above)"}`);
console.log(`taken at          : ${epoch.taken_at}`);
console.log(
  `SINCE THAT EPOCH  : ${totals.ins} inserted · ${totals.upd} updated · ${totals.del} deleted`,
);

if (process.argv.includes("--baseline")) {
  writeFileSync(SNAPSHOT, JSON.stringify({ epoch, state }, null, 2) + "\n");
  console.log(`BASELINE WRITTEN ${SNAPSHOT}`);
  process.exit(0);
}

if (!existsSync(SNAPSHOT)) {
  console.error("no baseline to compare against — run with --baseline first");
  process.exit(2);
}
const saved = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
if (saved.epoch.engine_up !== epoch.engine_up || saved.epoch.stats_reset !== epoch.stats_reset) {
  console.error(
    `EPOCH CHANGED since the baseline (engine restarted or statistics were reset) — ` +
      `the counters cannot be compared and this check REFUSES to say the company is untouched.`,
  );
  process.exit(1);
}

const moved = [];
for (const [name, now] of Object.entries(state)) {
  const was = saved.state[name];
  if (!was) {
    moved.push(`${name}: NEW TABLE`);
    continue;
  }
  const d = ["ins", "upd", "del", "rows"]
    .filter((k) => was[k] !== now[k])
    .map((k) => `${k} ${was[k]} → ${now[k]}`);
  if (d.length) moved.push(`${name}: ${d.join(" · ")}`);
}
for (const name of Object.keys(saved.state)) if (!state[name]) moved.push(`${name}: TABLE GONE`);

console.log(`baseline taken at : ${saved.epoch.taken_at}`);
if (moved.length === 0) {
  console.log("COMPANY UNTOUCHED SINCE THE BASELINE — 0 inserts, 0 updates, 0 deletes, 0 row-count changes");
  process.exit(0);
}
console.log(`COMPANY CHANGED — ${moved.length} table(s) moved:`);
for (const m of moved) console.log(`   ${m}`);
process.exit(1);
