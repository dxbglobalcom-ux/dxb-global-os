// B85 stage 0 piece 6, Q6(c) — the general way: a full inventory of the catalogue, one line per object.
// Usage: node inventory.cjs <out-file> [url]   — prints a summary to stdout, writes the lines to <out-file>.
// Every catalogue of pg_catalog the session may read is walked: a catalogue with an `oid` column is read row by row,
// each row said by pg_identify_object, its owner (a column of type oid named *owner), its ACL (aclitem[] items
// sorted) and the md5 of its row as JSON with every column of a volatile or identifier type left out (oid, reg*,
// oidvector, xid, cid, tid, pg_node_tree, pg_lsn, aclitem[], anyarray) and the statistics columns by name; where a
// node tree carries meaning its deparsed text is hashed instead. Catalogues without oid are read by their own keys.
// Lines inside schema `os` are marked `os` in the second field so the caller can keep or drop them; pg_temp and
// pg_toast_temp are left out. Nothing is written to the database.
const req = require('module').createRequire('/home/dxb/DxB Global OS/foundation/bench/');
const { Client } = req('pg');
const fs = require('fs');

const out = process.argv[2];
const url = process.argv[3] || 'postgresql://postgres:postgres@127.0.0.1:54522/postgres';
const DROP_TYPES = new Set(['oid', 'regproc', 'regprocedure', 'regclass', 'regtype', 'regnamespace', 'regrole', 'regconfig', 'regdictionary', 'regoper', 'regoperator', 'regcollation', 'oidvector', 'xid', 'xid8', 'cid', 'tid', 'pg_node_tree', 'pg_lsn', '_aclitem', 'anyarray', '_oid', 'int2vector']);
const DROP_NAMES = new Set(['reltuples', 'relpages', 'relallvisible', 'relallfrozen', 'relfrozenxid', 'relminmxid', 'datfrozenxid', 'datminmxid', 'rolpassword', 'subconninfo', 'umoptions', 'srvoptions']);
// Deparsed text of a node tree, per catalogue (the row alias is `t`).
const DEPARSED = {
  pg_attrdef: "pg_catalog.pg_get_expr(t.adbin, t.adrelid)",
  pg_constraint: "pg_catalog.pg_get_constraintdef(t.oid)",
  pg_trigger: "pg_catalog.pg_get_triggerdef(t.oid)",
  pg_policy: "pg_catalog.pg_get_expr(t.polqual, t.polrelid) || ' / ' || coalesce(pg_catalog.pg_get_expr(t.polwithcheck, t.polrelid), '') || ' / ' || (select pg_catalog.string_agg(case r when 0 then 'public' else pg_catalog.pg_get_userbyid(r) end, ',' order by 1) from pg_catalog.unnest(t.polroles) r)",
  pg_rewrite: "pg_catalog.pg_get_ruledef(t.oid)",
  pg_proc: "case when t.prokind in ('f','p') then pg_catalog.pg_get_functiondef(t.oid) else pg_catalog.pg_get_function_identity_arguments(t.oid) end",
  pg_class: "case when t.relkind = 'i' then pg_catalog.pg_get_indexdef(t.oid) when t.relkind in ('v','m') then pg_catalog.pg_get_viewdef(t.oid) else '' end || coalesce(pg_catalog.pg_get_expr(t.relpartbound, t.oid), '')",
};
const SETTINGS = ["set search_path = ''", 'set extra_float_digits = 3', "set timezone = 'UTC'", "set datestyle = 'ISO, YMD'", "set intervalstyle = 'postgres'", "set bytea_output = 'hex'"];

(async () => {
  const c = new Client({ connectionString: url });
  c.on('error', () => undefined);
  await c.connect();
  for (const s of SETTINGS) await c.query(s);
  const t0 = Date.now();
  const cats = (await c.query(`
    select c.relname::text as name, c.oid::regclass::text as qual,
           pg_catalog.has_table_privilege(c.oid, 'select') as readable,
           pg_catalog.json_agg(pg_catalog.json_build_object('n', a.attname, 't', ty.typname) order by a.attnum) as cols
      from pg_catalog.pg_class c
      join pg_catalog.pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
      join pg_catalog.pg_type ty on ty.oid = a.atttypid
     where c.relnamespace = 'pg_catalog'::regnamespace and c.relkind = 'r'
     group by c.oid order by 1`)).rows;
  const lines = [];
  const summary = [];
  for (const cat of cats) {
    const cols = cat.cols;
    const names = cols.map((x) => x.n);
    if (!cat.readable) { summary.push(`${cat.name}: NOT READABLE by this session`); continue; }
    const kept = cols.filter((x) => !DROP_TYPES.has(x.t) && !DROP_NAMES.has(x.n)).map((x) => x.n);
    const acl = cols.find((x) => x.t === '_aclitem');
    const owner = cols.find((x) => x.t === 'oid' && /owner$/.test(x.n));
    const keep = `pg_catalog.jsonb_build_object(${kept.map((n) => `'${n}', t.${n}`).join(', ') || "'-', null"})`;
    const def = DEPARSED[cat.name] ? ` || coalesce(${DEPARSED[cat.name]}, '')` : '';
    const ownerX = owner ? `pg_catalog.pg_get_userbyid(t.${owner.n})` : "''";
    const aclX = acl ? `coalesce((select pg_catalog.string_agg(x::text, ',' order by x::text collate "C") from pg_catalog.unnest(t.${acl.n}) x), '∅')` : "''";
    let ident;
    if (names.includes('oid') && cat.name !== 'pg_enum') ident = `(select pg_catalog.concat_ws(' ', i.type, i.identity) from pg_catalog.pg_identify_object('${cat.qual}'::regclass, t.oid, 0) i)`;
    else if (cat.name === 'pg_attribute') ident = `(select pg_catalog.concat_ws(' ', i.type, i.identity) from pg_catalog.pg_identify_object('pg_class'::regclass, t.attrelid, t.attnum) i)`;
    else if (cat.name === 'pg_index') ident = `(select pg_catalog.concat_ws(' ', i.type, i.identity) from pg_catalog.pg_identify_object('pg_class'::regclass, t.indexrelid, 0) i)`;
    else if (['pg_description', 'pg_seclabel', 'pg_init_privs'].includes(cat.name)) ident = `(select pg_catalog.concat_ws(' ', i.type, i.identity) from pg_catalog.pg_identify_object(t.classoid, t.objoid, t.objsubid) i)`;
    else if (['pg_shdescription', 'pg_shseclabel'].includes(cat.name)) ident = `(select pg_catalog.concat_ws(' ', i.type, i.identity) from pg_catalog.pg_identify_object(t.classoid, t.objoid, 0) i)`;
    else if (cat.name === 'pg_db_role_setting') ident = `'setting ' || coalesce((select datname from pg_catalog.pg_database where oid = t.setdatabase), '(all databases)') || ' ' || coalesce(pg_catalog.pg_get_userbyid(nullif(t.setrole, 0)), '(all roles)')`;
    else if (cat.name === 'pg_sequence') ident = `(select pg_catalog.concat_ws(' ', i.type, i.identity) from pg_catalog.pg_identify_object('pg_class'::regclass, t.seqrelid, 0) i)`;
    else if (cat.name === 'pg_enum') ident = `'enum ' || t.enumtypid::regtype::text || ' ' || pg_catalog.quote_literal(t.enumlabel)`;
    else if (cat.name === 'pg_aggregate') ident = `(select pg_catalog.concat_ws(' ', i.type, i.identity) from pg_catalog.pg_identify_object('pg_proc'::regclass, t.aggfnoid, 0) i)`;
    else if (cat.name === 'pg_range') ident = `(select pg_catalog.concat_ws(' ', i.type, i.identity) from pg_catalog.pg_identify_object('pg_type'::regclass, t.rngtypid, 0) i)`;
    else if (cat.name === 'pg_foreign_table') ident = `(select pg_catalog.concat_ws(' ', i.type, i.identity) from pg_catalog.pg_identify_object('pg_class'::regclass, t.ftrelid, 0) i)`;
    else if (cat.name === 'pg_inherits') ident = `pg_catalog.concat_ws(' ', 'inherits', t.inhrelid::regclass::text, t.inhparent::regclass::text)`;
    else if (cat.name === 'pg_partitioned_table') ident = `'partitioned ' || t.partrelid::regclass::text`;
    else if (cat.name === 'pg_auth_members') ident = `'membership'`;
    else if (cat.name === 'pg_init_privs') ident = `'init'`;
    else { summary.push(`${cat.name}: skipped (no oid, no key handled: ${names.slice(0, 4).join(',')}…)`); continue; }
    const extra = cat.name === 'pg_auth_members' ? ` || ' ' || pg_catalog.pg_get_userbyid(t.roleid) || '>' || pg_catalog.pg_get_userbyid(t.member) || ' by ' || pg_catalog.pg_get_userbyid(t.grantor)` : '';
    const sql = `select '${cat.name}' as cat, ${ident}${extra} as ident, ${ownerX} as owner, ${aclX} as acl,
                        pg_catalog.md5(${keep}::text${def}) as h
                   from ${cat.qual} t`;
    const t1 = Date.now();
    try {
      const r = await c.query(sql);
      for (const row of r.rows) lines.push(`${row.cat}|${row.ident ?? '∅'}|${row.owner ?? ''}|${row.acl}|${row.h}`);
      summary.push(`${cat.name}: ${r.rowCount} rows, ${Date.now() - t1} ms`);
    } catch (e) {
      summary.push(`${cat.name}: ERROR ${e.code} ${e.message}`);
    }
  }
  const kept = lines.filter((l) => !/\|[^|]*\bpg_temp_\d+\b|\bpg_toast_temp_\d+\b/.test(l));
  kept.sort((a, b) => (Buffer.from(a) < Buffer.from(b) ? -1 : Buffer.from(a) > Buffer.from(b) ? 1 : 0));
  fs.writeFileSync(out, kept.join('\n') + '\n');
  const inOs = kept.filter((l) => / os\.| os$|schema os\b|\bos\b/.test(l.split('|')[1])).length;
  console.log(summary.join('\n'));
  console.log(`TOTAL lines=${kept.length} (of which naming os in identity ≈ ${inOs}) ms=${Date.now() - t0}`);
  await c.end();
})().catch((e) => { console.log(`INVENTORY FAILED: ${e.message}`); process.exitCode = 1; });
