// 6c measure — every relation of kind r or p outside pg_catalog, information_schema and pg_toast:
// `schema.table|<count>|<md5 over its rows, order-independent>` or `schema.table|REFUSED <sqlstate>`.
// Usage: node rows.cjs <out-file> [url]
const req = require('module').createRequire('/home/dxb/DxB Global OS/foundation/bench/');
const { Client } = req('pg');
const fs = require('fs');
const out = process.argv[2];
const url = process.argv[3] || 'postgresql://postgres:postgres@127.0.0.1:54522/postgres';
const SETTINGS = ["set search_path = ''", 'set extra_float_digits = 3', "set timezone = 'UTC'", "set datestyle = 'ISO, YMD'", "set intervalstyle = 'postgres'", "set bytea_output = 'hex'"];
(async () => {
  const c = new Client({ connectionString: url });
  c.on('error', () => undefined);
  await c.connect();
  for (const s of SETTINGS) await c.query(s);
  const t0 = Date.now();
  let rls = 'row_security=off accepted';
  try { await c.query('set row_security = off'); } catch (e) { rls = `row_security=off REFUSED ${e.code} ${e.message}`; }
  const rels = (await c.query(`select pg_catalog.quote_ident(n.nspname) || '.' || pg_catalog.quote_ident(c.relname) as q, c.relkind::text as k
      from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid = c.relnamespace
     where c.relkind in ('r','p') and n.nspname not in ('pg_catalog','information_schema','pg_toast') and n.nspname !~ '^pg_temp_|^pg_toast_temp_'
     order by 1`)).rows;
  const lines = [];
  const refused = {};
  for (const r of rels) {
    try {
      const x = (await c.query(`select pg_catalog.count(*)::text as n, coalesce(pg_catalog.md5(pg_catalog.string_agg(h, '' order by h collate "C")), '-') as h from (select pg_catalog.md5(t::text) as h from ${r.q} t) s`)).rows[0];
      lines.push(`${r.q}|${x.n}|${x.h}`);
    } catch (e) {
      lines.push(`${r.q}|REFUSED ${e.code}`);
      refused[e.code] = (refused[e.code] || 0) + 1;
      if (!refused[`msg ${e.code}`]) refused[`msg ${e.code}`] = e.message.replace(/SCRAM-SHA-256\$[^\s'"|]*/g, '<…>');
    }
  }
  fs.writeFileSync(out, lines.join('\n') + '\n');
  console.log(`${rls}; relations=${rels.length} refused=${JSON.stringify(refused)} ms=${Date.now() - t0}`);
  await c.end();
})().catch((e) => { console.log(`ROWS FAILED: ${e.message}`); process.exitCode = 1; });
