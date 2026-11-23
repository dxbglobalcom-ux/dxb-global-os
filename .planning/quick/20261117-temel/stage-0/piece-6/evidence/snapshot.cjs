// B85 stage 0 piece 6, Q9 — ONE candidate normalised text: a probe of form for the lead, not the product.
// Usage: node snapshot.cjs <out-file> [url] [schemas, default os,os_chain]
// One session; it says its own settings first; every read is plain SQL on the catalogue, one fact per line, a kind
// word first, ordered with COLLATE "C". Names, never oids; no xid, no time, no password, no sequence position.
const req = require('module').createRequire('/home/dxb/DxB Global OS/foundation/bench/');
const { Client } = req('pg');
const fs = require('fs');

const out = process.argv[2];
const url = process.argv[3] || 'postgresql://postgres:postgres@127.0.0.1:54522/postgres';
const SCHEMAS = (process.argv[4] || 'os,os_chain').split(',');
const ROLES = ['os_owner', 'os_engine', 'os_executor', 'os_intake', 'os_reader'];

const SETTINGS = [
  "set search_path = ''", 'set extra_float_digits = 3', "set timezone = 'UTC'", "set datestyle = 'ISO, YMD'",
  "set intervalstyle = 'postgres'", "set bytea_output = 'hex'", 'set quote_all_identifiers = off',
  'set standard_conforming_strings = on', "set lc_monetary = 'C'", "set lc_numeric = 'C'", 'set row_security = on',
];
const esc = `pg_catalog.replace(pg_catalog.replace(%s, E'\\\\', E'\\\\\\\\'), E'\\n', E'\\\\n')`;
const one = (x) => esc.replace('%s', x);
const role = (x) => `case when ${x} = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(${x}) end`;
const C = 'collate "C"';
// aclexplode over the effective ACL: the stored one, or the default the kind has for its owner when none is stored.
const grants = (kindWord, ident, aclCol, kindLetter, owner, from, where) => `
  select pg_catalog.concat_ws(' ', 'grant', '${kindWord}', ${ident}, 'to', ${role('a.grantee')}, a.privilege_type,
           case when a.is_grantable then 'with-grant-option' else '' end, 'by', ${role('a.grantor')},
           case when ${aclCol} is null then '(default)' else '' end) as line
    from ${from}, pg_catalog.aclexplode(coalesce(${aclCol}, pg_catalog.acldefault('${kindLetter}', ${owner}))) a
   where ${where}`;

const Q = [];
const S = `array[${SCHEMAS.map((s) => `'${s}'`).join(',')}]`;
const R = `array[${ROLES.map((s) => `'${s}'`).join(',')}]`;
const inS = (nsCol) => `${nsCol} in (select oid from pg_catalog.pg_namespace where nspname = any (${S}))`;

Q.push(['settings', `select 'snapshot-settings ' || pg_catalog.string_agg(name || '=' || setting, ' ' order by name ${C}) as line from pg_catalog.pg_settings where name in ('search_path','extra_float_digits','TimeZone','DateStyle','IntervalStyle','bytea_output','quote_all_identifiers','standard_conforming_strings')`]);
Q.push(['database', `select pg_catalog.concat_ws(' ', 'database', d.datname, 'owner', pg_catalog.pg_get_userbyid(d.datdba), 'encoding', pg_catalog.pg_encoding_to_char(d.encoding), 'collate', d.datcollate, 'ctype', d.datctype) as line from pg_catalog.pg_database d where d.datname = pg_catalog.current_database()`]);
Q.push(['database-grants', grants('database', 'd.datname', 'd.datacl', 'd', 'd.datdba', 'pg_catalog.pg_database d', 'd.datname = pg_catalog.current_database()') + ` and (a.grantee = 0 or pg_catalog.pg_get_userbyid(a.grantee) = any (${R}))`]);
Q.push(['roles', `select pg_catalog.concat_ws(' ', 'role', r.rolname, 'super', r.rolsuper, 'inherit', r.rolinherit, 'createrole', r.rolcreaterole, 'createdb', r.rolcreatedb, 'login', r.rolcanlogin, 'replication', r.rolreplication, 'bypassrls', r.rolbypassrls, 'connlimit', r.rolconnlimit, 'validuntil', coalesce(r.rolvaliduntil::text, '-'), 'config', coalesce(pg_catalog.array_to_string(r.rolconfig, ',' ), '-')) as line from pg_catalog.pg_roles r where r.rolname = any (${R}) order by r.rolname ${C}`]);
Q.push(['members', `select pg_catalog.concat_ws(' ', 'member', pg_catalog.pg_get_userbyid(m.roleid), 'has', pg_catalog.pg_get_userbyid(m.member), 'admin', m.admin_option, 'inherit', m.inherit_option, 'set', m.set_option, 'by', pg_catalog.pg_get_userbyid(m.grantor)) as line from pg_catalog.pg_auth_members m where pg_catalog.pg_get_userbyid(m.roleid) = any (${R}) or pg_catalog.pg_get_userbyid(m.member) = any (${R})`]);
Q.push(['role-settings', `select pg_catalog.concat_ws(' ', 'role-setting', coalesce(pg_catalog.pg_get_userbyid(nullif(s.setrole, 0)), '(all roles)'), 'in', coalesce((select datname from pg_catalog.pg_database where oid = s.setdatabase), '(all databases)'), (select pg_catalog.string_agg(case when pg_catalog.split_part(x, '=', 1) ~* '(secret|key|password|token|jwt)' then pg_catalog.split_part(x, '=', 1) || '=<redacted:md5 ' || pg_catalog.md5(x) || '>' else x end, ',' order by x ${C}) from pg_catalog.unnest(s.setconfig) x)) as line from pg_catalog.pg_db_role_setting s where s.setrole = 0 or pg_catalog.pg_get_userbyid(s.setrole) = any (${R})`]);
Q.push(['schemas', `select pg_catalog.concat_ws(' ', 'schema', n.nspname, 'owner', pg_catalog.pg_get_userbyid(n.nspowner)) as line from pg_catalog.pg_namespace n where n.nspname = any (${S})`]);
Q.push(['schema-grants', grants('schema', 'n.nspname', 'n.nspacl', 'n', 'n.nspowner', 'pg_catalog.pg_namespace n', `n.nspname = any (${S})`) + ``]);
Q.push(['default-acl', `select pg_catalog.concat_ws(' ', 'default-acl', 'for', pg_catalog.pg_get_userbyid(d.defaclrole), 'in', coalesce(d.defaclnamespace::regnamespace::text, '(all schemas)'), 'on', d.defaclobjtype, 'to', ${role('a.grantee')}, a.privilege_type, case when a.is_grantable then 'with-grant-option' else '' end) as line from pg_catalog.pg_default_acl d, pg_catalog.aclexplode(d.defaclacl) a where pg_catalog.pg_get_userbyid(d.defaclrole) = any (${R}) or d.defaclnamespace in (select oid from pg_catalog.pg_namespace where nspname = any (${S}))`]);
Q.push(['relations', `select pg_catalog.concat_ws(' ', 'relation', c.oid::regclass::text, 'kind', c.relkind, 'owner', pg_catalog.pg_get_userbyid(c.relowner), 'persistence', c.relpersistence, 'rowsecurity', c.relrowsecurity, 'force', c.relforcerowsecurity, 'replident', c.relreplident, 'partitioned', c.relispartition, 'options', coalesce((select pg_catalog.string_agg(o, ',' order by o ${C}) from pg_catalog.unnest(c.reloptions) o), '-')) as line from pg_catalog.pg_class c where ${inS('c.relnamespace')} and c.relkind in ('r','p','v','m','S','f')`]);
Q.push(['columns', `select pg_catalog.concat_ws(' ', 'column', c.oid::regclass::text, a.attnum, pg_catalog.quote_ident(a.attname), pg_catalog.format_type(a.atttypid, a.atttypmod), case when a.attnotnull then 'not-null' else 'null' end, 'identity', nullif(a.attidentity, ''), 'generated', nullif(a.attgenerated, ''), 'collation', case when a.attcollation <> 0 and a.attcollation <> (select typcollation from pg_catalog.pg_type where oid = a.atttypid) then a.attcollation::regcollation::text end, 'default', ${one('pg_catalog.pg_get_expr(ad.adbin, ad.adrelid)')}) as line from pg_catalog.pg_class c join pg_catalog.pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped left join pg_catalog.pg_attrdef ad on ad.adrelid = c.oid and ad.adnum = a.attnum where ${inS('c.relnamespace')} and c.relkind in ('r','p','v','m','f') order by c.oid::regclass::text ${C}, a.attnum`]);
Q.push(['constraints', `select pg_catalog.concat_ws(' ', 'constraint', k.conrelid::regclass::text, pg_catalog.quote_ident(k.conname), k.contype, 'deferrable', k.condeferrable, 'deferred', k.condeferred, 'validated', k.convalidated, ${one('pg_catalog.pg_get_constraintdef(k.oid)')}) as line from pg_catalog.pg_constraint k where ${inS('k.connamespace')} and k.conrelid <> 0`]);
Q.push(['indexes', `select pg_catalog.concat_ws(' ', 'index', i.indrelid::regclass::text, ${one('pg_catalog.pg_get_indexdef(i.indexrelid)')}) as line from pg_catalog.pg_index i join pg_catalog.pg_class c on c.oid = i.indexrelid where ${inS('c.relnamespace')}`]);
Q.push(['triggers', `select pg_catalog.concat_ws(' ', 'trigger', t.tgrelid::regclass::text, pg_catalog.quote_ident(t.tgname), 'enabled', t.tgenabled, ${one('pg_catalog.pg_get_triggerdef(t.oid)')}) as line from pg_catalog.pg_trigger t join pg_catalog.pg_class c on c.oid = t.tgrelid where ${inS('c.relnamespace')} and not t.tgisinternal`]);
Q.push(['policies', `select pg_catalog.concat_ws(' ', 'policy', p.polrelid::regclass::text, pg_catalog.quote_ident(p.polname), 'cmd', p.polcmd, case when p.polpermissive then 'permissive' else 'restrictive' end, 'to', (select pg_catalog.string_agg(${role('r')}, ',' order by ${role('r')} ${C}) from pg_catalog.unnest(p.polroles) r), 'using', coalesce(${one('pg_catalog.pg_get_expr(p.polqual, p.polrelid)')}, '-'), 'check', coalesce(${one('pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid)')}, '-')) as line from pg_catalog.pg_policy p join pg_catalog.pg_class c on c.oid = p.polrelid where ${inS('c.relnamespace')}`]);
Q.push(['views', `select pg_catalog.concat_ws(' ', 'view', c.oid::regclass::text, ${one('pg_catalog.pg_get_viewdef(c.oid)')}) as line from pg_catalog.pg_class c where ${inS('c.relnamespace')} and c.relkind in ('v','m')`]);
Q.push(['sequences', `select pg_catalog.concat_ws(' ', 'sequence', s.seqrelid::regclass::text, pg_catalog.format_type(s.seqtypid, null), 'start', s.seqstart, 'increment', s.seqincrement, 'min', s.seqmin, 'max', s.seqmax, 'cache', s.seqcache, 'cycle', s.seqcycle, 'owned-by', (select d.refobjid::regclass::text || '.' || (select attname from pg_catalog.pg_attribute where attrelid = d.refobjid and attnum = d.refobjsubid) from pg_catalog.pg_depend d where d.classid = 'pg_catalog.pg_class'::regclass and d.objid = s.seqrelid and d.deptype in ('a','i') and d.refobjsubid > 0)) as line from pg_catalog.pg_sequence s join pg_catalog.pg_class c on c.oid = s.seqrelid where ${inS('c.relnamespace')}`]);
Q.push(['types', `select pg_catalog.concat_ws(' ', 'type', t.oid::regtype::text, 'kind', t.typtype, 'owner', pg_catalog.pg_get_userbyid(t.typowner), case when t.typtype = 'e' then 'labels ' || (select pg_catalog.string_agg(pg_catalog.quote_literal(e.enumlabel), ',' order by e.enumsortorder) from pg_catalog.pg_enum e where e.enumtypid = t.oid) when t.typtype = 'd' then 'base ' || pg_catalog.format_type(t.typbasetype, t.typtypmod) end) as line from pg_catalog.pg_type t where ${inS('t.typnamespace')} and (t.typtype in ('e','d','r','m') or (t.typtype = 'c' and (select relkind from pg_catalog.pg_class where oid = t.typrelid) = 'c'))`]);
Q.push(['functions', `select pg_catalog.concat_ws(' ', 'function', p.oid::regprocedure::text, 'kind', p.prokind, 'owner', pg_catalog.pg_get_userbyid(p.proowner), 'language', l.lanname, 'returns', pg_catalog.pg_get_function_result(p.oid), 'definer', p.prosecdef, 'volatility', p.provolatile, 'strict', p.proisstrict, 'parallel', p.proparallel, 'leakproof', p.proleakproof, 'cost', p.procost, 'rows', p.prorows, 'config', coalesce((select pg_catalog.string_agg(x, ',' order by x ${C}) from pg_catalog.unnest(p.proconfig) x), '-'), 'arguments', pg_catalog.pg_get_function_arguments(p.oid)) as line from pg_catalog.pg_proc p join pg_catalog.pg_language l on l.oid = p.prolang where ${inS('p.pronamespace')}`]);
Q.push(['function-bodies', `select pg_catalog.concat_ws(' ', 'function-body', p.oid::regprocedure::text, ${one('p.prosrc')}) as line from pg_catalog.pg_proc p where ${inS('p.pronamespace')}`]);
Q.push(['relation-grants', grants('relation', 'c.oid::regclass::text', 'c.relacl', 'r', 'c.relowner', 'pg_catalog.pg_class c', `${inS('c.relnamespace')} and c.relkind in ('r','p','v','m','f')`) + ``]);
Q.push(['sequence-grants', grants('sequence', 'c.oid::regclass::text', 'c.relacl', 's', 'c.relowner', 'pg_catalog.pg_class c', `${inS('c.relnamespace')} and c.relkind = 'S'`) + ``]);
Q.push(['column-grants', `select pg_catalog.concat_ws(' ', 'grant', 'column', c.oid::regclass::text || '.' || pg_catalog.quote_ident(at.attname), 'to', ${role('a.grantee')}, a.privilege_type, case when a.is_grantable then 'with-grant-option' else '' end, 'by', ${role('a.grantor')}) as line from pg_catalog.pg_class c join pg_catalog.pg_attribute at on at.attrelid = c.oid and at.attnum > 0 and not at.attisdropped and at.attacl is not null, pg_catalog.aclexplode(at.attacl) a where ${inS('c.relnamespace')}`]);
Q.push(['function-grants', grants('function', 'p.oid::regprocedure::text', 'p.proacl', 'f', 'p.proowner', 'pg_catalog.pg_proc p', inS('p.pronamespace')) + ``]);
Q.push(['type-grants', grants('type', 't.oid::regtype::text', 't.typacl', 'T', 't.typowner', 'pg_catalog.pg_type t', `${inS('t.typnamespace')} and t.typtype in ('e','d','r','m')`) + ``]);
Q.push(['comments', `select pg_catalog.concat_ws(' ', 'comment', (select i.type || ' ' || i.identity from pg_catalog.pg_identify_object(d.classoid, d.objoid, d.objsubid) i), ${one('d.description')}) as line from pg_catalog.pg_description d where (d.classoid = 'pg_catalog.pg_namespace'::regclass and ${inS('d.objoid')}) or (d.classoid = 'pg_catalog.pg_class'::regclass and d.objoid in (select oid from pg_catalog.pg_class where ${inS('relnamespace')})) or (d.classoid = 'pg_catalog.pg_proc'::regclass and d.objoid in (select oid from pg_catalog.pg_proc where ${inS('pronamespace')})) or (d.classoid = 'pg_catalog.pg_type'::regclass and d.objoid in (select oid from pg_catalog.pg_type where ${inS('typnamespace')})) or (d.classoid = 'pg_catalog.pg_constraint'::regclass and d.objoid in (select oid from pg_catalog.pg_constraint where ${inS('connamespace')}))`]);
// What one of the five roles owns, is granted on or is named in, in this database or a shared catalogue — outside the schemas read above.
Q.push(['outside', `select pg_catalog.concat_ws(' ', 'outside', case s.deptype when 'o' then 'owns' when 'a' then 'granted' when 'r' then 'in-policy' when 'i' then 'init-acl' else s.deptype::text end, pg_catalog.pg_get_userbyid(s.refobjid), coalesce((select i.type || ' ' || i.identity from pg_catalog.pg_identify_object(s.classid, s.objid, s.objsubid) i), '?'), case when s.dbid = 0 then '(shared)' else '' end) as line from pg_catalog.pg_shdepend s where s.refclassid = 'pg_catalog.pg_authid'::regclass and pg_catalog.pg_get_userbyid(s.refobjid) = any (${R}) and s.dbid in (0, (select oid from pg_catalog.pg_database where datname = pg_catalog.current_database())) and coalesce((select i.schema from pg_catalog.pg_identify_object(s.classid, s.objid, s.objsubid) i), '') <> all (${S}) and not (s.classid = 'pg_catalog.pg_namespace'::regclass and s.objid in (select oid from pg_catalog.pg_namespace where nspname = any (${S}))) and not (s.classid = 'pg_catalog.pg_default_acl'::regclass and (select defaclnamespace from pg_catalog.pg_default_acl where oid = s.objid) in (select oid from pg_catalog.pg_namespace where nspname = any (${S})))`]);
// The code-owned reference values: every vocabulary of os, its rows as JSON, by key.
Q.push(['reference', null]);
Q.push(['ledger', `select pg_catalog.concat_ws(' ', 'ledger', l.position, l.file, l.kind, l.hash, 'runner', l.runner_version) as line from os_chain.ledger l order by l.position`, 'if-os_chain']);

(async () => {
  const c = new Client({ connectionString: url });
  c.on('error', () => undefined);
  await c.connect();
  const t0 = Date.now();
  await c.query('begin isolation level repeatable read read only');
  for (const s of SETTINGS) await c.query(s);
  const lines = [];
  for (const [name, sql, cond] of Q) {
    if (cond === 'if-os_chain' && (await c.query("select pg_catalog.to_regclass('os_chain.ledger') is null as absent")).rows[0].absent) continue;
    if (sql === null) {
      const vocab = (await c.query(`select c.oid::regclass::text as t, (select pg_catalog.string_agg(pg_catalog.quote_ident(a.attname), ',' order by k.ord) from pg_catalog.pg_index i, pg_catalog.unnest(i.indkey) with ordinality k(n, ord) join pg_catalog.pg_attribute a on a.attnum = k.n where i.indrelid = c.oid and i.indisprimary and a.attrelid = c.oid) as key from pg_catalog.pg_class c where c.relnamespace = pg_catalog.to_regnamespace('os') and c.relkind = 'r' and pg_catalog.obj_description(c.oid, 'pg_class') ~ '^vocabulary'`)).rows;
      for (const v of vocab) {
        const r = await c.query(`select 'reference ${v.t} ' || pg_catalog.to_jsonb(t)::text as line from ${v.t} t order by ${v.key.split(',').map((k) => `${k}::pg_catalog.text ${C}`).join(', ')}`);
        for (const row of r.rows) lines.push(row.line);
      }
      continue;
    }
    try {
      const ordered = ['columns', 'ledger'].includes(name) ? sql : `select q.line from (${sql}) q order by q.line ${C}`;
      const r = await c.query(ordered);
      for (const row of r.rows) lines.push(row.line);
    } catch (e) {
      lines.push(`ERROR-IN-READ ${name}: ${e.code} ${e.message}`);
      await c.query('rollback');
      await c.query('begin isolation level repeatable read read only');
      for (const s of SETTINGS) await c.query(s);
    }
  }
  await c.query('commit');
  const ms = Date.now() - t0;
  fs.writeFileSync(out, lines.join('\n') + '\n');
  console.log(`SNAPSHOT lines=${lines.length} bytes=${Buffer.byteLength(lines.join('\n') + '\n')} ms=${ms}`);
  await c.end();
})().catch((e) => { console.log(`SNAPSHOT FAILED: ${e.stack}`); process.exit(1); });
