#!/usr/bin/env node
// B36 — is the restored copy the SAME DATA, or merely the same number of rows?
//
// A third audit rejected "row for row": what had actually been proven was that
// each table held the same COUNT. A count is not content — the same number of
// different rows passes it. This compares the CONTENT of every table in the
// holding's own schemas: each row rendered to text, ordered, and reduced to one
// md5 per table. Two tables with the same checksum hold the same rows.
//
// SELECT only, on both sides, on the one access path.
//
//   DXB_COMPANY_URL=… DXB_RESTORED_URL=… node scripts/b36/prove-restore-content.mjs
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/dist/db.js";

const SCHEMAS = (process.env.DXB_RESTORE_SCHEMAS ?? "public pgboss supabase_migrations").split(/\s+/);

async function fingerprint(url, label) {
  process.env.DXB_DATABASE_URL = url;
  process.env.DXB_DB_CONNECT_TIMEOUT_MS ??= "10000";
  try {
    const { rows } = await sql`
      select n.nspname||'.'||c.relname AS key,
             (xpath('/row/c/text()', query_to_xml(
                format('select coalesce(md5(string_agg(t::text, %L order by t::text)), ''EMPTY'') c from %I.%I t',
                       '', n.nspname, c.relname),
                false, true, '')))[1]::text AS sum
        from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where c.relkind = 'r' and n.nspname = any(${SCHEMAS})
       order by 1`.execute(getDb());
    console.log(`${label.padEnd(9)}: ${rows.length} tables in ${SCHEMAS.join(", ")}`);
    return Object.fromEntries(rows.map((r) => [r.key, r.sum]));
  } finally {
    await closeDb().catch(() => {});
  }
}

const company = await fingerprint(process.env.DXB_COMPANY_URL, "live");
const restored = await fingerprint(process.env.DXB_RESTORED_URL, "restored");

const keys = [...new Set([...Object.keys(company), ...Object.keys(restored)])].sort();
const differ = keys.filter((k) => company[k] !== restored[k]);
console.log(`tables compared BY CONTENT: ${keys.length}`);
if (differ.length === 0) {
  console.log("CONTENT_IDENTICAL — every table holds the same rows, not merely the same number of them");
  process.exit(0);
}
console.log(`CONTENT DIFFERS in ${differ.length} table(s):`);
for (const k of differ) console.log(`   ${k}: live ${company[k] ?? "(absent)"} · restored ${restored[k] ?? "(absent)"}`);
process.exit(1);
