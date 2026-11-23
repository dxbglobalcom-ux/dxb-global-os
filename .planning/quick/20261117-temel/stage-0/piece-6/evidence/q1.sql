-- @ Q1.1 server version; installer name and attributes
select version(), current_user, session_user, r.rolsuper, r.rolinherit, r.rolcreaterole, r.rolcreatedb, r.rolcanlogin, r.rolreplication, r.rolbypassrls, r.rolconnlimit from pg_roles r where r.rolname = current_user;
-- @ Q1.2 the installer's memberships (role it is member of: admin/inherit/set, grantor)
select b.rolname as member_of, m.admin_option, m.inherit_option, m.set_option, pg_get_userbyid(m.grantor) as grantor from pg_auth_members m join pg_roles b on b.oid = m.roleid where m.member = 'postgres'::regrole order by b.rolname collate "C", pg_get_userbyid(m.grantor) collate "C";
-- @ Q1.3 a session's defaults on this bench, and where each comes from
select name, setting, source from pg_settings where name in ('search_path','extra_float_digits','DateStyle','IntervalStyle','TimeZone','bytea_output','quote_all_identifiers','standard_conforming_strings','lc_monetary','lc_numeric','lc_time','lc_messages','default_toast_compression','row_security','client_encoding','escape_string_warning','array_nulls','transform_null_equals','plpgsql.variable_conflict','session_replication_role') order by 1;
-- @ Q1.4 pg_db_role_setting for the installer and for all roles (names only, values of secret-like names hidden)
select coalesce(pg_get_userbyid(nullif(setrole,0)),'(all roles)') as role, coalesce((select datname from pg_database where oid=setdatabase),'(all dbs)') as db, (select string_agg(case when split_part(x,'=',1) ~* '(secret|key|password|token|jwt)' then split_part(x,'=',1)||'=<hidden>' else x end, ', ') from unnest(setconfig) x) from pg_db_role_setting where setrole in (0, 'postgres'::regrole) order by 1,2;
-- @ !probe objects made in a transaction that is rolled back at the end
begin;
set local role os_owner;
create table os.q1p (
  ts timestamptz default '2020-01-02 03:04:05+03',
  d date default '2020-01-02',
  iv interval default '1 day 02:03:04',
  b bytea default '\x41ff'::bytea,
  f8 float8 default 0.1::float8 + 1e-7::float8,
  f4 float4 default 0.1::float4,
  m money default 12.34,
  s text default E'a\\b',
  nm numeric default 1.0/3,
  arr int[] default '{1,NULL,3}');
create function os.q1f(x timestamptz default '2020-01-02 03:04:05+03', y float8 default 0.1, z interval default '90 minutes', w text default E'a\\b') returns int language sql as $f$ select 1 $f$;
create view os.q1v as select ts, f8 * 0.1::float8 as g, iv + '1 hour'::interval as h from os.q1p where ts > '2020-01-01 00:00:00+00' and s <> E'x\\y';
create index q1p_i on os.q1p (lower(s)) where f8 > 0.5;
alter table os.q1p add constraint q1p_c check (f8 < 1e10 and ts > '2000-01-01');
create policy q1pol on os.q1p using (ts > '2020-01-01 00:00+00' and f8 > 0.3);
create function os.q1trg() returns trigger language plpgsql as $$ begin return new; end $$;
create trigger q1t before insert on os.q1p for each row when (new.f8 > 0.2) execute function os.q1trg();
reset role;
-- @ Q1.5 baseline (the session's defaults): every deparse
select 'defaults' as k, string_agg(a.attname || '=' || pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_attrdef d join pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass
union all select 'fn-args', pg_get_function_arguments('os.q1f'::regproc)
union all select 'view', pg_get_viewdef('os.q1v'::regclass)
union all select 'index', pg_get_indexdef('os.q1p_i'::regclass)
union all select 'check', pg_get_constraintdef((select oid from pg_constraint where conname='q1p_c'))
union all select 'policy', pg_get_expr(polqual, polrelid) from pg_policy where polname='q1pol'
union all select 'trigger', pg_get_triggerdef((select oid from pg_trigger where tgname='q1t'))
union all select 'functiondef-head', split_part(pg_get_functiondef('os.q1f'::regproc), E'\n', 1);
-- @ Q1.6 search_path = '' (and everything else default)
set search_path = '';
select 'defaults' as k, string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass
union all select 'fn-args', pg_catalog.pg_get_function_arguments('os.q1f'::regproc)
union all select 'view', pg_catalog.pg_get_viewdef('os.q1v'::regclass)
union all select 'index', pg_catalog.pg_get_indexdef('os.q1p_i'::regclass)
union all select 'check', pg_catalog.pg_get_constraintdef((select oid from pg_catalog.pg_constraint where conname='q1p_c'))
union all select 'policy', pg_catalog.pg_get_expr(polqual, polrelid) from pg_catalog.pg_policy where polname='q1pol'
union all select 'trigger', pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t'))
union all select 'functiondef-head', pg_catalog.split_part(pg_catalog.pg_get_functiondef('os.q1f'::regproc), E'\n', 1);
-- @ Q1.6b search_path = os, public (the object's own schema first)
set search_path = os, public;
select 'defaults' as k, string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass
union all select 'view', pg_catalog.pg_get_viewdef('os.q1v'::regclass)
union all select 'index', pg_catalog.pg_get_indexdef('os.q1p_i'::regclass)
union all select 'trigger', pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t'))
union all select 'functiondef-head', pg_catalog.split_part(pg_catalog.pg_get_functiondef('os.q1f'::regproc), E'\n', 1)
union all select 'regclass/regprocedure text', 'os.q1p'::regclass::text || ' ' || 'os.q1f'::regproc::regprocedure::text || ' ' || pg_catalog.format_type('os.mood'::regtype, null);
reset search_path;
-- @ Q1.7 reference text: search_path '' + the other settings at their session values
set search_path = '';
select pg_catalog.md5(x) as md5, x as text from (select pg_catalog.concat_ws(E'\n',
  (select pg_catalog.string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass),
  pg_catalog.pg_get_function_arguments('os.q1f'::regproc),
  pg_catalog.pg_get_viewdef('os.q1v'::regclass),
  pg_catalog.pg_get_constraintdef((select oid from pg_catalog.pg_constraint where conname='q1p_c')),
  (select pg_catalog.pg_get_expr(polqual, polrelid) from pg_catalog.pg_policy where polname='q1pol'),
  pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t')),
  pg_catalog.pg_get_indexdef('os.q1p_i'::regclass),
  pg_catalog.pg_get_functiondef('os.q1f'::regproc)) as x) y;
-- @ Q1.7 changed alone: extra_float_digits = 3
savepoint a; set local extra_float_digits = 3;
select pg_catalog.md5(x) as md5, x as text from (select pg_catalog.concat_ws(E'\n',
  (select pg_catalog.string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass),
  pg_catalog.pg_get_function_arguments('os.q1f'::regproc),
  pg_catalog.pg_get_viewdef('os.q1v'::regclass),
  pg_catalog.pg_get_constraintdef((select oid from pg_catalog.pg_constraint where conname='q1p_c')),
  (select pg_catalog.pg_get_expr(polqual, polrelid) from pg_catalog.pg_policy where polname='q1pol'),
  pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t')),
  pg_catalog.pg_get_indexdef('os.q1p_i'::regclass),
  pg_catalog.pg_get_functiondef('os.q1f'::regproc)) as x) y;
rollback to savepoint a;
-- @ Q1.7 changed alone: extra_float_digits = 1
savepoint a; set local extra_float_digits = 1;
select pg_catalog.md5(x) as md5, x as text from (select pg_catalog.concat_ws(E'\n',
  (select pg_catalog.string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass),
  pg_catalog.pg_get_function_arguments('os.q1f'::regproc),
  pg_catalog.pg_get_viewdef('os.q1v'::regclass),
  pg_catalog.pg_get_constraintdef((select oid from pg_catalog.pg_constraint where conname='q1p_c')),
  (select pg_catalog.pg_get_expr(polqual, polrelid) from pg_catalog.pg_policy where polname='q1pol'),
  pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t')),
  pg_catalog.pg_get_indexdef('os.q1p_i'::regclass),
  pg_catalog.pg_get_functiondef('os.q1f'::regproc)) as x) y;
rollback to savepoint a;
-- @ Q1.7 changed alone: extra_float_digits = -3
savepoint a; set local extra_float_digits = -3;
select pg_catalog.md5(x) as md5, x as text from (select pg_catalog.concat_ws(E'\n',
  (select pg_catalog.string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass),
  pg_catalog.pg_get_function_arguments('os.q1f'::regproc),
  pg_catalog.pg_get_viewdef('os.q1v'::regclass),
  pg_catalog.pg_get_constraintdef((select oid from pg_catalog.pg_constraint where conname='q1p_c')),
  (select pg_catalog.pg_get_expr(polqual, polrelid) from pg_catalog.pg_policy where polname='q1pol'),
  pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t')),
  pg_catalog.pg_get_indexdef('os.q1p_i'::regclass),
  pg_catalog.pg_get_functiondef('os.q1f'::regproc)) as x) y;
rollback to savepoint a;
-- @ Q1.7 changed alone: timezone = 'Asia/Tokyo'
savepoint a; set local timezone = 'Asia/Tokyo';
select pg_catalog.md5(x) as md5, x as text from (select pg_catalog.concat_ws(E'\n',
  (select pg_catalog.string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass),
  pg_catalog.pg_get_function_arguments('os.q1f'::regproc),
  pg_catalog.pg_get_viewdef('os.q1v'::regclass),
  pg_catalog.pg_get_constraintdef((select oid from pg_catalog.pg_constraint where conname='q1p_c')),
  (select pg_catalog.pg_get_expr(polqual, polrelid) from pg_catalog.pg_policy where polname='q1pol'),
  pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t')),
  pg_catalog.pg_get_indexdef('os.q1p_i'::regclass),
  pg_catalog.pg_get_functiondef('os.q1f'::regproc)) as x) y;
rollback to savepoint a;
-- @ Q1.7 changed alone: datestyle = 'SQL, DMY'
savepoint a; set local datestyle = 'SQL, DMY';
select pg_catalog.md5(x) as md5, x as text from (select pg_catalog.concat_ws(E'\n',
  (select pg_catalog.string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass),
  pg_catalog.pg_get_function_arguments('os.q1f'::regproc),
  pg_catalog.pg_get_viewdef('os.q1v'::regclass),
  pg_catalog.pg_get_constraintdef((select oid from pg_catalog.pg_constraint where conname='q1p_c')),
  (select pg_catalog.pg_get_expr(polqual, polrelid) from pg_catalog.pg_policy where polname='q1pol'),
  pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t')),
  pg_catalog.pg_get_indexdef('os.q1p_i'::regclass),
  pg_catalog.pg_get_functiondef('os.q1f'::regproc)) as x) y;
rollback to savepoint a;
-- @ Q1.7 changed alone: datestyle = 'German'
savepoint a; set local datestyle = 'German';
select pg_catalog.md5(x) as md5, x as text from (select pg_catalog.concat_ws(E'\n',
  (select pg_catalog.string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass),
  pg_catalog.pg_get_function_arguments('os.q1f'::regproc),
  pg_catalog.pg_get_viewdef('os.q1v'::regclass),
  pg_catalog.pg_get_constraintdef((select oid from pg_catalog.pg_constraint where conname='q1p_c')),
  (select pg_catalog.pg_get_expr(polqual, polrelid) from pg_catalog.pg_policy where polname='q1pol'),
  pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t')),
  pg_catalog.pg_get_indexdef('os.q1p_i'::regclass),
  pg_catalog.pg_get_functiondef('os.q1f'::regproc)) as x) y;
rollback to savepoint a;
-- @ Q1.7 changed alone: intervalstyle = 'iso_8601'
savepoint a; set local intervalstyle = 'iso_8601';
select pg_catalog.md5(x) as md5, x as text from (select pg_catalog.concat_ws(E'\n',
  (select pg_catalog.string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass),
  pg_catalog.pg_get_function_arguments('os.q1f'::regproc),
  pg_catalog.pg_get_viewdef('os.q1v'::regclass),
  pg_catalog.pg_get_constraintdef((select oid from pg_catalog.pg_constraint where conname='q1p_c')),
  (select pg_catalog.pg_get_expr(polqual, polrelid) from pg_catalog.pg_policy where polname='q1pol'),
  pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t')),
  pg_catalog.pg_get_indexdef('os.q1p_i'::regclass),
  pg_catalog.pg_get_functiondef('os.q1f'::regproc)) as x) y;
rollback to savepoint a;
-- @ Q1.7 changed alone: intervalstyle = 'sql_standard'
savepoint a; set local intervalstyle = 'sql_standard';
select pg_catalog.md5(x) as md5, x as text from (select pg_catalog.concat_ws(E'\n',
  (select pg_catalog.string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass),
  pg_catalog.pg_get_function_arguments('os.q1f'::regproc),
  pg_catalog.pg_get_viewdef('os.q1v'::regclass),
  pg_catalog.pg_get_constraintdef((select oid from pg_catalog.pg_constraint where conname='q1p_c')),
  (select pg_catalog.pg_get_expr(polqual, polrelid) from pg_catalog.pg_policy where polname='q1pol'),
  pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t')),
  pg_catalog.pg_get_indexdef('os.q1p_i'::regclass),
  pg_catalog.pg_get_functiondef('os.q1f'::regproc)) as x) y;
rollback to savepoint a;
-- @ Q1.7 changed alone: bytea_output = 'escape'
savepoint a; set local bytea_output = 'escape';
select pg_catalog.md5(x) as md5, x as text from (select pg_catalog.concat_ws(E'\n',
  (select pg_catalog.string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass),
  pg_catalog.pg_get_function_arguments('os.q1f'::regproc),
  pg_catalog.pg_get_viewdef('os.q1v'::regclass),
  pg_catalog.pg_get_constraintdef((select oid from pg_catalog.pg_constraint where conname='q1p_c')),
  (select pg_catalog.pg_get_expr(polqual, polrelid) from pg_catalog.pg_policy where polname='q1pol'),
  pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t')),
  pg_catalog.pg_get_indexdef('os.q1p_i'::regclass),
  pg_catalog.pg_get_functiondef('os.q1f'::regproc)) as x) y;
rollback to savepoint a;
-- @ Q1.7 changed alone: lc_monetary = 'C'
savepoint a; set local lc_monetary = 'C';
select pg_catalog.md5(x) as md5, x as text from (select pg_catalog.concat_ws(E'\n',
  (select pg_catalog.string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass),
  pg_catalog.pg_get_function_arguments('os.q1f'::regproc),
  pg_catalog.pg_get_viewdef('os.q1v'::regclass),
  pg_catalog.pg_get_constraintdef((select oid from pg_catalog.pg_constraint where conname='q1p_c')),
  (select pg_catalog.pg_get_expr(polqual, polrelid) from pg_catalog.pg_policy where polname='q1pol'),
  pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t')),
  pg_catalog.pg_get_indexdef('os.q1p_i'::regclass),
  pg_catalog.pg_get_functiondef('os.q1f'::regproc)) as x) y;
rollback to savepoint a;
-- @ Q1.7 changed alone: quote_all_identifiers = on
savepoint a; set local quote_all_identifiers = on;
select pg_catalog.md5(x) as md5, x as text from (select pg_catalog.concat_ws(E'\n',
  (select pg_catalog.string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass),
  pg_catalog.pg_get_function_arguments('os.q1f'::regproc),
  pg_catalog.pg_get_viewdef('os.q1v'::regclass),
  pg_catalog.pg_get_constraintdef((select oid from pg_catalog.pg_constraint where conname='q1p_c')),
  (select pg_catalog.pg_get_expr(polqual, polrelid) from pg_catalog.pg_policy where polname='q1pol'),
  pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t')),
  pg_catalog.pg_get_indexdef('os.q1p_i'::regclass),
  pg_catalog.pg_get_functiondef('os.q1f'::regproc)) as x) y;
rollback to savepoint a;
-- @ Q1.7 changed alone: standard_conforming_strings = off
savepoint a; set local standard_conforming_strings = off;
select pg_catalog.md5(x) as md5, x as text from (select pg_catalog.concat_ws(E'\n',
  (select pg_catalog.string_agg(a.attname || '=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), ' ; ' order by a.attnum) from pg_catalog.pg_attrdef d join pg_catalog.pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where d.adrelid='os.q1p'::regclass),
  pg_catalog.pg_get_function_arguments('os.q1f'::regproc),
  pg_catalog.pg_get_viewdef('os.q1v'::regclass),
  pg_catalog.pg_get_constraintdef((select oid from pg_catalog.pg_constraint where conname='q1p_c')),
  (select pg_catalog.pg_get_expr(polqual, polrelid) from pg_catalog.pg_policy where polname='q1pol'),
  pg_catalog.pg_get_triggerdef((select oid from pg_catalog.pg_trigger where tgname='q1t')),
  pg_catalog.pg_get_indexdef('os.q1p_i'::regclass),
  pg_catalog.pg_get_functiondef('os.q1f'::regproc)) as x) y;
rollback to savepoint a;
-- @ !end
rollback;
