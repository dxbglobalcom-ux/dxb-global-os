// 6c measure — inventory.cjs of piece 6, extended: pg_depend, pg_shdepend, pg_ts_config_map, pg_replication_origin,
// pg_subscription_rel read by keys; rolpassword kept inside the md5 (never printed); a NULL identity printed ∅ and
// counted per catalogue. Usage: node inventory2.cjs <out-file> [url]
const req = require('module').createRequire('/home/dxb/DxB Global OS/foundation/bench/');
const { Client } = req('pg');
const fs = require('fs');

const out = process.argv[2];
const url = process.argv[3] || 'postgresql://postgres:postgres@127.0.0.1:54522/postgres';
const DROP_TYPES = new Set(['oid', 'regproc', 'regprocedure', 'regclass', 'regtype', 'regnamespace', 'regrole', 'regconfig', 'regdictionary', 'regoper', 'regoperator', 'regcollation', 'oidvector', 'xid', 'xid8', 'cid', 'tid', 'pg_node_tree', 'pg_lsn', '_aclitem', 'anyarray', '_oid', 'int2vector']);
const DROP_NAMES = new Set(['reltuples', 'relpages', 'relallvisible', 'relallfrozen', 'relfrozenxid', 'relminmxid', 'datfrozenxid', 'datminmxid', 'subconninfo', 'umoptions', 'srvoptions']);
const LEFT_OUT = new Set(['pg_largeobject', 'pg_statistic', 'pg_statistic_ext_data']);
const DEPARSED = {
  pg_attrdef: "pg_catalog.pg_get_expr(t.adbin, t.adrelid)",
  pg_constraint: "pg_catalog.pg_get_constraintdef(t.oid)",
  pg_trigger: "pg_catalog.pg_get_triggerdef(t.oid)",
  pg_policy: "pg_catalog.pg_get_expr(t.polqual, t.polrelid) || ' / ' || coalesce(pg_catalog.pg_get_expr(t.polwithcheck, t.polrelid), '') || ' / ' || (select pg_catalog.string_agg(case r when 0 then 'public' else pg_catalog.pg_get_userbyid(r) end, ',' order by 1) from pg_catalog.unnest(t.polroles) r)",
  pg_rewrite: "pg_catalog.pg_get_ruledef(t.oid)",
  pg_proc: "case when t.prokind in ('f','p') then pg_catalog.pg_get_functiondef(t.oid) else pg_catalog.pg_get_function_identity_arguments(t.oid) end",
  pg_class: "case when t.relkind = 'i' then pg_catalog.pg_get_indexdef(t.oid) when t.relkind in ('v','m') then pg_catalog.pg_get_viewdef(t.oid) else '' end || coalesce(pg_catalog.pg_get_expr(t.relpartbound, t.oid), '')",
  pg_ts_config_map: "(select coalesce(i.identity, '∅') from pg_catalog.pg_identify_object('pg_ts_dict'::regclass, t.mapdict, 0) i)",
  pg_subscription_rel: "coalesce(t.srsublsn::text, '')",
};
const SETTINGS = ["set search_path = ''", 'set extra_float_digits = 3', "set timezone = 'UTC'", "set datestyle = 'ISO, YMD'", "set intervalstyle = 'postgres'", "set bytea_output = 'hex'"];
const idf = (cls, obj, sub) => `(select case when i.identity is null then '∅' else pg_catalog.concat_ws(' ', i.type, i.identity) end from pg_catalog.pg_identify_object(${cls}, ${obj}, ${sub}) i)`;

(async () => {
  const c = new Client({ connectionString: url });
  c.on('error', () => undefined);
  await c.connect();
  for (const s of SETTINGS) await c.query(s);
  const t0 = Date.now();
  const cats = (await c.query(`
    select c.relname::text as name, c.oid::regclass::text as qual,
           pg_catalog.has_table_privilege(c.oid, 'select') as readable,
           pg_catalog.json_agg(pg_catalog.json_build_object('n', a.attname, 't', ty.typname,
             'r', pg_catalog.has_column_privilege(c.oid, a.attnum, 'select')) order by a.attnum) as cols
      from pg_catalog.pg_class c
      join pg_catalog.pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
      join pg_catalog.pg_type ty on ty.oid = a.atttypid
     where c.relnamespace = 'pg_catalog'::regnamespace and c.relkind = 'r'
     group by c.oid order by 1`)).rows;
  const lines = [];
  const summary = [];
  const nulls = {};
  const curdb = (await c.query('select oid::text as o from pg_catalog.pg_database where datname = pg_catalog.current_database()')).rows[0].o;
  for (const cat of cats) {
    const cols = cat.cols;
    const names = cols.map((x) => x.n);
    if (LEFT_OUT.has(cat.name)) { summary.push(`${cat.name}: LEFT OUT by design`); continue; }
    if (!cat.readable) { summary.push(`${cat.name}: NOT READABLE by this session`); continue; }
    const unread = cols.filter((x) => !x.r).map((x) => x.n);
    const kept = cols.filter((x) => x.r && !DROP_TYPES.has(x.t) && !DROP_NAMES.has(x.n)).map((x) => x.n);
    const acl = cols.find((x) => x.t === '_aclitem');
    const owner = cols.find((x) => x.t === 'oid' && /owner$/.test(x.n));
    const keep = `pg_catalog.jsonb_build_object(${kept.map((n) => `'${n}', t.${n}`).join(', ') || "'-', null"})`;
    const def = DEPARSED[cat.name] ? ` || coalesce(${DEPARSED[cat.name]}, '')` : '';
    const ownerX = owner ? `pg_catalog.pg_get_userbyid(t.${owner.n})` : "''";
    const aclX = acl ? `coalesce((select pg_catalog.string_agg(x::text, ',' order by x::text collate "C") from pg_catalog.unnest(t.${acl.n}) x), '∅')` : "''";
    let ident;
    if (cat.name === 'pg_largeobject_metadata') ident = idf("'pg_largeobject'::regclass", 't.oid', 0);
    else if (names.includes('oid') && cat.name !== 'pg_enum') ident = idf(`'${cat.qual}'::regclass`, 't.oid', 0);
    else if (cat.name === 'pg_attribute') ident = idf("'pg_class'::regclass", 't.attrelid', 't.attnum');
    else if (cat.name === 'pg_index') ident = idf("'pg_class'::regclass", 't.indexrelid', 0);
    else if (['pg_description', 'pg_seclabel', 'pg_init_privs'].includes(cat.name)) ident = idf('t.classoid', 't.objoid', 't.objsubid');
    else if (['pg_shdescription', 'pg_shseclabel'].includes(cat.name)) ident = idf('t.classoid', 't.objoid', 0);
    else if (cat.name === 'pg_db_role_setting') ident = `'setting ' || coalesce((select datname from pg_catalog.pg_database where oid = t.setdatabase), '(all databases)') || ' ' || coalesce(pg_catalog.pg_get_userbyid(nullif(t.setrole, 0)), '(all roles)')`;
    else if (cat.name === 'pg_sequence') ident = idf("'pg_class'::regclass", 't.seqrelid', 0);
    else if (cat.name === 'pg_enum') ident = `'enum ' || t.enumtypid::regtype::text || ' ' || pg_catalog.quote_literal(t.enumlabel)`;
    else if (cat.name === 'pg_aggregate') ident = idf("'pg_proc'::regclass", 't.aggfnoid', 0);
    else if (cat.name === 'pg_range') ident = idf("'pg_type'::regclass", 't.rngtypid', 0);
    else if (cat.name === 'pg_foreign_table') ident = idf("'pg_class'::regclass", 't.ftrelid', 0);
    else if (cat.name === 'pg_inherits') ident = `pg_catalog.concat_ws(' ', 'inherits', t.inhrelid::regclass::text, t.inhparent::regclass::text)`;
    else if (cat.name === 'pg_partitioned_table') ident = `'partitioned ' || t.partrelid::regclass::text`;
    else if (cat.name === 'pg_auth_members') ident = `'membership'`;
    else if (cat.name === 'pg_depend') ident = `'dep ' || t.deptype::text || ' ' || case when t.classid = 0 then '(none)' else ${idf('t.classid', 't.objid', 't.objsubid')} end || ' -> ' || ${idf('t.refclassid', 't.refobjid', 't.refobjsubid')}`;
    else if (cat.name === 'pg_shdepend') ident = `'shdep ' || t.deptype::text || ' ' || case when t.dbid = 0 then '(shared) ' || ${idf('t.classid', 't.objid', 't.objsubid')} when t.dbid = ${curdb} then ${idf('t.classid', 't.objid', 't.objsubid')} else '(db ' || coalesce((select datname::text from pg_catalog.pg_database where oid = t.dbid), '?') || ') ' || t.classid::regclass::text || ' #' || t.objsubid end || ' -> ' || ${idf('t.refclassid', 't.refobjid', 0)}`;
    else if (cat.name === 'pg_ts_config_map') ident = `'ts map ' || ${idf("'pg_ts_config'::regclass", 't.mapcfg', 0)} || ' token ' || t.maptokentype || ' seq ' || t.mapseqno`;
    else if (cat.name === 'pg_replication_origin') ident = `'replication origin ' || t.roname`;
    else if (cat.name === 'pg_subscription_rel') ident = `'subscription rel ' || ${idf("'pg_subscription'::regclass", 't.srsubid', 0)} || ' ' || ${idf("'pg_class'::regclass", 't.srrelid', 0)}`;
    else { summary.push(`${cat.name}: skipped (no oid, no key handled: ${names.slice(0, 4).join(',')}…)`); continue; }
    const extra = cat.name === 'pg_auth_members' ? ` || ' ' || pg_catalog.pg_get_userbyid(t.roleid) || '>' || pg_catalog.pg_get_userbyid(t.member) || ' by ' || pg_catalog.pg_get_userbyid(t.grantor)` : '';
    const sql = `select '${cat.name}' as cat, ${ident}${extra} as ident, ${ownerX} as owner, ${aclX} as acl,
                        pg_catalog.md5(${keep}::text${def}) as h
                   from ${cat.qual} t`;
    const t1 = Date.now();
    try {
      const r = await c.query(sql);
      let n = 0;
      for (const row of r.rows) {
        const id = row.ident ?? '∅';
        if (id.includes('∅')) n++;
        lines.push(`${row.cat}|${id}|${row.owner ?? ''}|${row.acl}|${row.h}`);
      }
      if (n) nulls[cat.name] = n;
      summary.push(`${cat.name}: ${r.rowCount} rows, ${Date.now() - t1} ms${unread.length ? ` (columns not readable, left out: ${unread.join(',')})` : ''}`);
    } catch (e) {
      summary.push(`${cat.name}: ERROR ${e.code} ${e.message}`);
    }
  }
  const kept = lines.filter((l) => !/\|[^|]*\bpg_temp_\d+\b|\bpg_toast_temp_\d+\b/.test(l));
  kept.sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
  fs.writeFileSync(out, kept.join('\n') + '\n');
  console.log(summary.join('\n'));
  console.log(`NULL-IDENTITY ∅ per catalogue: ${JSON.stringify(nulls)}`);
  console.log(`TOTAL lines=${kept.length} ms=${Date.now() - t0}`);
  await c.end();
})().catch((e) => { console.log(`INVENTORY FAILED: ${e.message}`); process.exitCode = 1; });
