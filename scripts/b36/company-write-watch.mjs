#!/usr/bin/env node
// B36 — proof that construction work does not write into the holding's database.
//
// Why row counts were not enough. The claim "this session did not touch the
// company" once rested on comparing table counts taken days apart. An audit
// rejected it and was right: a count says nothing about an UPDATE, nothing about
// an INSERT and a DELETE that cancel out, and nothing about structure.
//
// Why the FIRST version of this watch was not enough either. A third audit
// rejected that too: it watched the 60 tables of `public` and nothing else — not
// the other schemas, not the sequences, not the privileges, not the shape of the
// database itself. So it now watches four things, and says which is which:
//
//   1. ROWS      every tuple inserted / updated / deleted per table, from
//                PostgreSQL's own pg_stat_all_tables, plus the live row count.
//                An UPDATE moves n_tup_upd; an insert-then-delete moves two
//                counters and leaves the count where it was; a TRUNCATE moves
//                the count. Nothing that writes escapes all three.
//   2. SEQUENCES the last value handed out by every sequence — a number taken
//                and rolled back still moves it.
//   3. GRANTS    every table privilege, as a checksum.
//   4. STRUCTURE every table, view, function, index, policy, constraint and
//                trigger, as a checksum — so a CREATE, DROP or ALTER shows.
//
// AND IT SEPARATES WHAT IS HIS FROM WHAT IS THE PLATFORM'S. `public` and the
// other schemas this holding owns must not move at all. Supabase's own internals
// (auth, storage, realtime, _realtime, _supabase, vault, extensions, graphql,
// cron, net, pgbouncer, supabase_migrations, supabase_functions) are written by
// Supabase itself while it runs; they are measured and reported, never hidden,
// but movement there is the platform breathing, not construction work.
//
//   THE EPOCH. Counters run from the last statistics reset, or from the moment
//   the engine came up without a usable statistics file. Both are printed, and a
//   baseline taken before an epoch change is REFUSED rather than trusted.
//
// SELECT only, on the one access path (packages/shared/src/db.ts).
//
//   DXB_COMPANY_URL=… node scripts/b36/company-write-watch.mjs --baseline
//   DXB_COMPANY_URL=… node scripts/b36/company-write-watch.mjs            # check
//   …                                                          --save <file>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/dist/db.js";

const HERE = new URL("../../.planning/quick/20260823-construction-company-separation/", import.meta.url);
const SNAPSHOT = fileURLToPath(new URL("company-write-baseline.json", HERE));

// THREE GROUPS, and an unknown schema is treated as HIS — a scope that fails
// closed. The third audit was right that watching `public` alone left the rest
// of the database unwatched; nothing is unwatched now, and nothing is silently
// excluded either: every group is measured and printed.
//
//   HIS       his records, the queue that runs his company, and the ledger of
//             his own schema. These may not move by one tuple.
//   SERVICES  software that lives inside his database and writes its own
//             bookkeeping while it runs. Measured and NAMED, never hidden.
//   PLATFORM  Supabase's own internals, written by Supabase itself.
const SERVICES = new Set(["litellm", "net"]);
const PLATFORM = new Set([
  "auth", "storage", "realtime", "_realtime", "_supabase", "vault", "extensions",
  "graphql", "graphql_public", "cron", "pgbouncer", "supabase_functions",
  "pgsodium", "pgsodium_masks",
]);
const groupOf = (schema) =>
  PLATFORM.has(schema) ? "platform" : SERVICES.has(schema) ? "services" : "his";
const SYSTEM = "('pg_catalog','information_schema','pg_toast')";

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
           now()::text taken_at,
           current_database() dbname`.execute(db)
).rows[0];

// 1 — rows
const tables = (
  await sql`
    select schemaname||'.'||relname AS key,
           n_tup_ins::text ins, n_tup_upd::text upd, n_tup_del::text del,
           (xpath('/row/c/text()', query_to_xml(
              format('select count(*) c from %I.%I', schemaname, relname), false, true, '')))[1]::text rows
      from pg_stat_all_tables
     where schemaname not in ('pg_catalog','information_schema','pg_toast')
     order by 1`.execute(db)
).rows;

// 2 — sequences
const sequences = (
  await sql`
    select schemaname||'.'||sequencename AS key, coalesce(last_value, 0)::text last_value
      from pg_sequences
     where schemaname not in ('pg_catalog','information_schema','pg_toast')
     order by 1`.execute(db)
).rows;

// 3 — grants, and 4 — structure, per schema, as checksums
const grants = (
  await sql`
    select table_schema AS key, count(*)::text n,
           md5(string_agg(grantee||':'||table_name||':'||privilege_type||':'||is_grantable, ',' order by grantee, table_name, privilege_type)) sum
      from information_schema.role_table_grants
     where table_schema not in ('pg_catalog','information_schema','pg_toast')
     group by 1 order by 1`.execute(db)
).rows;

const structure = (
  await sql`
    with objs as (
      select n.nspname sch, 'rel:'||c.relkind::text||':'||c.relname AS o
        from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname not in ('pg_catalog','information_schema','pg_toast') and c.relkind in ('r','v','m','S','p','i')
      union all
      select n.nspname, 'fn:'||p.proname||':'||pg_get_function_identity_arguments(p.oid)
        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname not in ('pg_catalog','information_schema','pg_toast')
      union all
      select n.nspname, 'con:'||c.conname||':'||pg_get_constraintdef(c.oid)
        from pg_constraint c join pg_namespace n on n.oid = c.connamespace
       where n.nspname not in ('pg_catalog','information_schema','pg_toast')
      union all
      select schemaname, 'pol:'||tablename||':'||policyname from pg_policies
       where schemaname not in ('pg_catalog','information_schema','pg_toast')
      union all
      select n.nspname, 'trg:'||c.relname||':'||t.tgname
        from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace
       where not t.tgisinternal and n.nspname not in ('pg_catalog','information_schema','pg_toast')
    )
    select sch AS key, count(*)::text n, md5(string_agg(o, ',' order by o)) sum
      from objs group by 1 order by 1`.execute(db)
).rows;
await closeDb();

const index = (rows) => Object.fromEntries(rows.map((r) => [r.key, r]));
const state = {
  tables: index(tables),
  sequences: index(sequences),
  grants: index(grants),
  structure: index(structure),
};
const schemaOf = (key) => key.split(".")[0];
const ours = (key) => groupOf(schemaOf(key)) === "his";

const own = tables.filter((t) => ours(t.key));
const totals = own.reduce(
  (a, t) => ({ ins: a.ins + +t.ins, upd: a.upd + +t.upd, del: a.del + +t.del }),
  { ins: 0, upd: 0, del: 0 },
);
const schemas = [...new Set(tables.map((t) => schemaOf(t.key)))];

const out = [];
const say = (l) => {
  out.push(l);
  console.log(l);
};

say(`company           : ${epoch.dbname}`);
for (const g of ["his", "services", "platform"])
  say(`${g === "his" ? "HIS OWN schemas   " : g === "services" ? "services in it    " : "Supabase platform "}: ${schemas.filter((x) => groupOf(x) === g).join(" · ") || "(none)"}`);
say(`objects watched   : ${tables.length} tables · ${sequences.length} sequences · ${grants.reduce((a, g) => a + +g.n, 0)} grants · ${structure.reduce((a, s) => a + +s.n, 0)} structural objects`);
say(`engine up since   : ${epoch.engine_up}`);
say(`statistics reset  : ${epoch.stats_reset ?? "never (counters run from the engine start above)"}`);
say(`taken at          : ${epoch.taken_at}`);
say(`HIS OWN TABLES, SINCE THAT EPOCH: ${totals.ins} inserted · ${totals.upd} updated · ${totals.del} deleted (${own.length} tables)`);

const saveTo = process.argv.includes("--save") ? process.argv[process.argv.indexOf("--save") + 1] : null;
const finish = (code) => {
  if (saveTo) writeFileSync(saveTo, out.join("\n") + "\n");
  process.exit(code);
};

if (process.argv.includes("--baseline")) {
  writeFileSync(SNAPSHOT, JSON.stringify({ epoch, state }, null, 2) + "\n");
  say(`BASELINE WRITTEN ${SNAPSHOT}`);
  finish(0);
}

if (!existsSync(SNAPSHOT)) {
  say("no baseline to compare against — run with --baseline first");
  finish(2);
}
const saved = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
if (saved.epoch.engine_up !== epoch.engine_up || saved.epoch.stats_reset !== epoch.stats_reset) {
  say(
    "EPOCH CHANGED since the baseline (engine restarted or statistics were reset) — " +
      "the counters cannot be compared and this check REFUSES to say the company is untouched.",
  );
  finish(1);
}

const moved = { ours: [], services: [], platform: [] };
for (const [kind, fields] of [
  ["tables", ["ins", "upd", "del", "rows"]],
  ["sequences", ["last_value"]],
  ["grants", ["n", "sum"]],
  ["structure", ["n", "sum"]],
]) {
  const now = state[kind];
  const was = saved.state[kind] ?? {};
  for (const [key, v] of Object.entries(now)) {
    const w = was[key];
    const g = groupOf(schemaOf(key));
    const where = g === "his" ? moved.ours : g === "services" ? moved.services : moved.platform;
    if (!w) {
      where.push(`${kind} ${key}: NEW`);
      continue;
    }
    const d = fields.filter((f) => w[f] !== v[f]).map((f) => `${f} ${w[f]} → ${v[f]}`);
    if (d.length) where.push(`${kind} ${key}: ${d.join(" · ")}`);
  }
  for (const key of Object.keys(was)) {
    if (now[key]) continue;
    const g = groupOf(schemaOf(key));
    (g === "his" ? moved.ours : g === "services" ? moved.services : moved.platform).push(`${kind} ${key}: GONE`);
  }
}

say(`baseline taken at : ${saved.epoch.taken_at}`);
for (const [name, list] of [
  ["services living in his database", moved.services],
  ["Supabase's own internals", moved.platform],
]) {
  if (!list.length) {
    say(`${name}: unchanged as well`);
    continue;
  }
  say(`${name} moved in ${list.length} place(s) — named, not hidden:`);
  for (const m of list.slice(0, 10)) say(`   ${m}`);
  if (list.length > 10) say(`   …and ${list.length - 10} more`);
}
if (moved.ours.length === 0) {
  say("COMPANY UNTOUCHED SINCE THE BASELINE — 0 rows, 0 sequences, 0 grants, 0 structure");
  finish(0);
}
say(`COMPANY CHANGED — ${moved.ours.length} place(s):`);
for (const m of moved.ours) say(`   ${m}`);
finish(1);
