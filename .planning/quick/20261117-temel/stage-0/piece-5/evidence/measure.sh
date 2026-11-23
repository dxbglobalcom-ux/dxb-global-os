#!/usr/bin/env bash
# Measurements for B85 stage 0 piece 5 (the roles and the schema os) on the foundation's own bench (127.0.0.1:54522),
# in a throwaway database made and dropped here. Every role made here is named m5_* and dropped by name at the end.
set -u
HERE=/tmp/claude-1000/-home-dxb-DxB-Global-OS/b22fa3a7-053d-453e-ba09-c06002a10d42/scratchpad/h-measure
CT=supabase_db_DxB_Foundation
HP="127.0.0.1:54522"
ADMIN="postgresql://postgres:postgres@$HP/postgres"
DB=roles_measure_p5
URL="postgresql://postgres:postgres@$HP/$DB"
PW='m5-throwaway-pw'
export PGPASSFILE=/dev/null PGCONNECT_TIMEOUT=10
unset PGPASSWORD
VER=$(node "$HERE/scram.cjs" "$PW")
T0=$(date -u +%Y-%m-%dT%H:%M:%SZ)
MEM_OWNER="select 'mem: '||roleid::regrole||' <- '||member::regrole||' grantor='||grantor::regrole||' admin='||admin_option||' inherit='||inherit_option||' set='||set_option from pg_auth_members where roleid = to_regrole('m5_owner') or member = to_regrole('m5_owner') order by 1"
OBJS="select 'rel  '||c.relname||' kind='||c.relkind::text||' owner='||c.relowner::regrole||' acl='||coalesce(c.relacl::text,'(null)') from pg_class c where c.relnamespace = to_regnamespace(:'sch') union all select 'proc '||p.proname||' kind='||p.prokind::text||' owner='||p.proowner::regrole||' acl='||coalesce(p.proacl::text,'(null)') from pg_proc p where p.pronamespace = to_regnamespace(:'sch') union all select 'type '||t.typname||' typtype='||t.typtype::text||' owner='||t.typowner::regrole||' acl='||coalesce(t.typacl::text,'(null)') from pg_type t left join pg_class k on k.oid = t.typrelid where t.typnamespace = to_regnamespace(:'sch') and t.typtype in ('e','d','c') and (t.typrelid = 0 or k.relkind = 'c') order by 1"
DACL="select 'dacl: role='||defaclrole::regrole||' schema='||case defaclnamespace when 0 then '(global)' else defaclnamespace::regnamespace::text end||' type='||defaclobjtype::text||' acl='||coalesce(defaclacl::text,'(null)') from pg_default_acl order by 1"
# a session as postgres; stdin = statements, echoed (-a) before their answer
run() { local url="$1"; shift; psql "$url" -X -q -A -t -a -v ON_ERROR_STOP=0 -v mem="$MEM_OWNER" -v objs="$OBJS" -v dacl="$DACL" -v sch=m5_s -v ver="$VER" "$@" 2>&1 | sed 's/^/     /' | cut -c1-300; }
s()  { run "$URL"; }       # postgres in the throwaway database
sa() { run "$ADMIN"; }     # postgres in database postgres (read-only probes, and M6.b)
# a session as m5_plain over TCP with its password (a real login, not SET ROLE)
plain() { PGPASSWORD="$PW" run "postgresql://m5_plain@$HP/${1:-$DB}"; }
cli() { "$@" 2>&1 | sed 's/^/     /' | cut -c1-300; }

echo "== start: leftovers from an earlier run"
psql "$ADMIN" -X -q -A -t -v ON_ERROR_STOP=0 2>&1 <<SQL | sed 's/^/     /' | cut -c1-300
drop database if exists $DB with (force);
drop database if exists m5_db;
drop role if exists m5_owner;
drop role if exists m5_plain;
drop role if exists m5_login;
drop role if exists m5_y;
SQL

echo "== M0 the target"
sa <<'SQL'
select version();
select system_identifier from pg_control_system();
select 'super='||rolsuper||' createrole='||rolcreaterole||' createdb='||rolcreatedb||' bypassrls='||rolbypassrls||' replication='||rolreplication||' inherit='||rolinherit||' connlimit='||rolconnlimit from pg_roles where rolname = 'postgres';
show createrole_self_grant;
show password_encryption;
select 'mem: '||roleid::regrole||' <- '||member::regrole||' grantor='||grantor::regrole||' admin='||admin_option||' inherit='||inherit_option||' set='||set_option from pg_auth_members where roleid = 'postgres'::regrole or member = 'postgres'::regrole order by 1;
select 'db postgres owner='||datdba::regrole||' datacl='||coalesce(datacl::text,'(null)') from pg_database where datname = 'postgres';
SQL
echo "-- create the throwaway database"
sa <<SQL
create database $DB;
select 'db $DB owner='||datdba::regrole||' datacl='||coalesce(datacl::text,'(null)') from pg_database where datname = '$DB';
SQL
echo "-- M2.0 every pg_default_acl row of the fresh throwaway database (before anything is made in it)"
s <<'SQL'
:dacl;
select 'count='||count(*) from pg_default_acl;
SQL
echo "-- the login roles used later: m5_plain (login, member of nothing) with a client-computed SCRAM verifier"
s <<'SQL'
create role m5_plain login;
alter role m5_plain password :'ver';
select 'mem: '||roleid::regrole||' <- '||member::regrole||' grantor='||grantor::regrole||' admin='||admin_option||' inherit='||inherit_option||' set='||set_option from pg_auth_members where roleid = 'm5_plain'::regrole or member = 'm5_plain'::regrole;
SQL

echo "== M1 creating objects as an owner role with no login"
echo "-- defaults: create role m5_owner nologin (no options), its pg_roles row and the membership rows it produced"
s <<'SQL'
create role m5_owner nologin;
select row_to_json(r) from pg_roles r where rolname = 'm5_owner';
:mem;
SQL
s <<'SQL' >/dev/null
drop role m5_owner;
SQL

m1_setup() { # fixture: schema m5_s owned by m5_owner, function m5_s.fx() owned by m5_owner with PUBLIC execute revoked
  s <<'SQL'
create role m5_owner nologin;
grant m5_owner to postgres with set true, inherit false;
create schema m5_s authorization m5_owner;
set role m5_owner;
create function m5_s.fx() returns int language sql return 1;
revoke execute on function m5_s.fx() from public;
reset role;
revoke m5_owner from postgres;
SQL
}
m1_reset() {
  s <<'SQL'
revoke m5_owner from postgres;
grant m5_owner to postgres with inherit true, set true;
drop owned by m5_owner cascade;
revoke m5_owner from postgres;
drop role m5_owner;
SQL
}
m1_probes() { # $1 = state label
  local st="$1"
  echo "-- M1 state ($st): the membership rows"
  s <<'SQL'
:mem;
SQL
  echo "-- a($st). set role m5_owner"
  s <<'SQL'
set role m5_owner;
select current_user, session_user;
reset role;
SQL
  echo "-- b($st). create schema m5_a authorization m5_owner (rolled back)"
  s <<'SQL'
begin;
create schema m5_a authorization m5_owner;
select 'owner='||nspowner::regrole||' nspacl='||coalesce(nspacl::text,'(null)') from pg_namespace where nspname = 'm5_a';
rollback;
SQL
  echo "-- c($st). as m5_owner: create schema m5_b, without and then with CREATE on the database (rolled back)"
  s <<SQL
begin;
set local role m5_owner;
create schema m5_b;
rollback;
grant create on database $DB to m5_owner;
begin;
set local role m5_owner;
create schema m5_b;
select 'owner='||nspowner::regrole||' nspacl='||coalesce(nspacl::text,'(null)') from pg_namespace where nspname = 'm5_b';
rollback;
revoke create on database $DB from m5_owner;
SQL
  echo "-- d($st). as postgres, no set role, into m5_s (owned by m5_owner): a table, a function (each rolled back)"
  s <<'SQL'
begin;
create table m5_s.t1(id int);
select 'owner='||relowner::regrole from pg_class where oid = 'm5_s.t1'::regclass;
rollback;
begin;
create function m5_s.f1() returns int language sql return 1;
select 'owner='||proowner::regrole from pg_proc where oid = 'm5_s.f1()'::regprocedure;
rollback;
SQL
  echo "-- e($st). as m5_owner (set local role): table, function, sequence, enum, composite, view in m5_s (rolled back)"
  s <<'SQL'
begin;
set local role m5_owner;
create table m5_s.e_t(id int);
create function m5_s.e_f() returns int language sql return 1;
create sequence m5_s.e_seq;
create type m5_s.e_enum as enum ('a');
create type m5_s.e_comp as (a int);
create view m5_s.e_v as select 1 as x;
:objs;
rollback;
SQL
  echo "-- f($st). as postgres, no set role: create or replace on m5_s.fx() owned by m5_owner (rolled back)"
  s <<'SQL'
begin;
create or replace function m5_s.fx() returns int language sql return 2;
select 'owner='||proowner::regrole||' acl='||coalesce(proacl::text,'(null)')||' body='||pg_get_function_sqlbody(oid) from pg_proc where oid = 'm5_s.fx()'::regprocedure;
rollback;
select 'after rollback: owner='||proowner::regrole||' acl='||coalesce(proacl::text,'(null)') from pg_proc where oid = 'm5_s.fx()'::regprocedure;
SQL
  echo "-- g($st). alter function ... owner to m5_owner (each rolled back): g1 in m5_s; g2 in a schema postgres owns, without and with CREATE on it for m5_owner"
  s <<'SQL'
begin;
create function m5_s.g1() returns int language sql return 1;
alter function m5_s.g1() owner to m5_owner;
select 'g1 owner='||proowner::regrole from pg_proc where oid = 'm5_s.g1()'::regprocedure;
rollback;
begin;
create schema m5_pg;
create function m5_pg.g2() returns int language sql return 1;
alter function m5_pg.g2() owner to m5_owner;
select 'g2 owner='||proowner::regrole from pg_proc where oid = 'm5_pg.g2()'::regprocedure;
rollback;
begin;
create schema m5_pg;
grant create on schema m5_pg to m5_owner;
create function m5_pg.g2() returns int language sql return 1;
alter function m5_pg.g2() owner to m5_owner;
select 'g2 (CREATE granted) owner='||proowner::regrole from pg_proc where oid = 'm5_pg.g2()'::regprocedure;
rollback;
SQL
  echo "-- h($st). alter default privileges for role m5_owner (global and in schema m5_s), kept; then pg_default_acl rows for m5_owner"
  s <<'SQL'
alter default privileges for role m5_owner revoke execute on functions from public;
alter default privileges for role m5_owner revoke usage on types from public;
alter default privileges for role m5_owner in schema m5_s revoke execute on functions from public;
alter default privileges for role m5_owner in schema m5_s revoke usage on types from public;
select 'dacl: schema='||case defaclnamespace when 0 then '(global)' else defaclnamespace::regnamespace::text end||' type='||defaclobjtype::text||' acl='||coalesce(defaclacl::text,'(null)') from pg_default_acl where defaclrole = 'm5_owner'::regrole order by 1;
SQL
  echo "-- h2($st). the same four as m5_owner itself (set local role, no FOR ROLE), rows shown, then rolled back"
  s <<'SQL'
begin;
set local role m5_owner;
alter default privileges revoke execute on functions from public;
alter default privileges revoke usage on types from public;
alter default privileges in schema m5_s revoke execute on functions from public;
alter default privileges in schema m5_s revoke usage on types from public;
select 'dacl: schema='||case defaclnamespace when 0 then '(global)' else defaclnamespace::regnamespace::text end||' type='||defaclobjtype::text||' acl='||coalesce(defaclacl::text,'(null)') from pg_default_acl where defaclrole = 'm5_owner'::regrole order by 1;
rollback;
SQL
  echo "-- i($st). alter schema m5_s owner to postgres / drop schema m5_s cascade / drop role m5_owner (each rolled back)"
  s <<'SQL'
begin;
alter schema m5_s owner to postgres;
select 'owner now='||nspowner::regrole from pg_namespace where nspname = 'm5_s';
rollback;
begin;
drop schema m5_s cascade;
rollback;
begin;
drop role m5_owner;
rollback;
SQL
}
echo "-- state (i): no grant beyond what CREATE ROLE produced"
m1_setup; m1_probes "i"
echo "-- reset"; m1_reset
echo "-- state (ii): grant m5_owner to postgres with set true, inherit false"
m1_setup
s <<'SQL'
grant m5_owner to postgres with set true, inherit false;
SQL
m1_probes "ii"
echo "-- reset"; m1_reset
echo "-- state (iii): grant m5_owner to postgres with inherit true, set false"
m1_setup
s <<'SQL'
grant m5_owner to postgres with inherit true, set false;
SQL
m1_probes "iii"
echo "-- reset"; m1_reset

echo "== M2 the owner's default privileges and PUBLIC"
echo "-- a. pg_default_acl of the throwaway database now (after M1's reset)"
s <<'SQL'
:dacl;
select 'count='||count(*) from pg_default_acl;
SQL
M2MAT="select 'schema m5_s: USAGE='||has_schema_privilege('m5_plain','m5_s','USAGE')||' CREATE='||has_schema_privilege('m5_plain','m5_s','CREATE') union all select 'table t_'||:'x'||': '||(select string_agg(p||'='||has_table_privilege('m5_plain',('m5_s.t_'||:'x')::regclass,p), ' ') from unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) p) union all select 'view v_'||:'x'||': '||(select string_agg(p||'='||has_table_privilege('m5_plain',('m5_s.v_'||:'x')::regclass,p), ' ') from unnest(array['SELECT','INSERT','UPDATE','DELETE']) p) union all select 'seq s_'||:'x'||': '||(select string_agg(p||'='||has_sequence_privilege('m5_plain',('m5_s.s_'||:'x')::regclass,p), ' ') from unnest(array['USAGE','SELECT','UPDATE']) p) union all select 'function f_'||:'x'||': EXECUTE='||has_function_privilege('m5_plain',('m5_s.f_'||:'x'||'()')::regprocedure,'EXECUTE') union all select 'procedure p_'||:'x'||': EXECUTE='||has_function_privilege('m5_plain',('m5_s.p_'||:'x'||'()')::regprocedure,'EXECUTE') union all select 'enum e_'||:'x'||': USAGE='||has_type_privilege('m5_plain',('m5_s.e_'||:'x')::regtype,'USAGE') union all select 'domain d_'||:'x'||': USAGE='||has_type_privilege('m5_plain',('m5_s.d_'||:'x')::regtype,'USAGE')"
echo "-- b. m5_owner owns m5_s; NO default-privilege change; objects set _a made as m5_owner"
s <<'SQL'
create role m5_owner nologin;
grant m5_owner to postgres with set true, inherit false;
create schema m5_s authorization m5_owner;
set role m5_owner;
create table m5_s.t_a(id int);
create sequence m5_s.s_a;
create function m5_s.f_a() returns int language sql return 1;
create procedure m5_s.p_a() language sql begin atomic select 1; end;
create type m5_s.e_a as enum ('a');
create domain m5_s.d_a as int;
create view m5_s.v_a as select 1 as x;
reset role;
:objs;
SQL
echo "-- c. matrix for m5_plain, set _a"
printf "%s;\n" "$M2MAT" | psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 -v x=a 2>&1 | sed 's/^/     /' | cut -c1-300
echo "-- d. the two global revokes (functions, types) for m5_owner, issued as m5_owner (postgres holds SET, not INHERIT, here), then set _b"
s <<'SQL'
set role m5_owner;
alter default privileges for role m5_owner revoke execute on functions from public;
alter default privileges for role m5_owner revoke usage on types from public;
reset role;
:dacl;
set role m5_owner;
create table m5_s.t_b(id int);
create sequence m5_s.s_b;
create function m5_s.f_b() returns int language sql return 1;
create procedure m5_s.p_b() language sql begin atomic select 1; end;
create type m5_s.e_b as enum ('a');
create domain m5_s.d_b as int;
create view m5_s.v_b as select 1 as x;
reset role;
:objs;
SQL
echo "-- e. matrix for m5_plain, set _b"
printf "%s;\n" "$M2MAT" | psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 -v x=b 2>&1 | sed 's/^/     /' | cut -c1-300
echo "-- f. as m5_plain over TCP, no USAGE on m5_s: call f_a / f_b, use e_a / e_b, call p_a"
plain <<'SQL'
select current_user;
select m5_s.f_a();
select m5_s.f_b();
select 'a'::m5_s.e_a;
select 'a'::m5_s.e_b;
call m5_s.p_a();
SQL
echo "-- g. contrast: grant usage on schema m5_s to m5_plain, the same calls, then revoke it again"
s <<'SQL'
set role m5_owner;
grant usage on schema m5_s to m5_plain;
reset role;
SQL
plain <<'SQL'
select m5_s.f_a();
select m5_s.f_b();
select 'a'::m5_s.e_a;
select 'a'::m5_s.e_b;
call m5_s.p_a();
call m5_s.p_b();
select * from m5_s.t_a;
SQL
s <<'SQL'
set role m5_owner;
revoke usage on schema m5_s from m5_plain;
reset role;
SQL

echo "== M3 the image's login rules"
echo "-- a. hba file and settings"
s <<'SQL'
show hba_file;
select count(*) from pg_hba_file_rules;
show ssl;
show listen_addresses;
show log_statement;
show log_connections;
show log_min_error_statement;
show log_min_messages;
SQL
echo "-- a. the hba file's non-comment lines (docker exec, read-only)"
cli docker exec $CT grep -nEv '^[[:space:]]*(#|$)' /etc/postgresql/pg_hba.conf
echo "-- b. create role m5_login login (no password); membership rows naming it"
s <<'SQL'
create role m5_login login;
select 'mem: '||roleid::regrole||' <- '||member::regrole||' grantor='||grantor::regrole||' admin='||admin_option||' inherit='||inherit_option||' set='||set_option from pg_auth_members where roleid = 'm5_login'::regrole or member = 'm5_login'::regrole order by 1;
SQL
echo "-- b. host TCP, no password (-w)"
cli psql "postgresql://m5_login@$HP/$DB" -X -w -A -t -c 'select current_user'
echo "-- b. host TCP, PGPASSWORD=''"
PGPASSWORD='' cli psql "postgresql://m5_login@$HP/$DB" -X -w -A -t -c 'select current_user'
echo "-- b. host TCP, wrong password"
PGPASSWORD='m5-wrong-pw' cli psql "postgresql://m5_login@$HP/$DB" -X -w -A -t -c 'select current_user'
echo "-- b. inside the container, unix socket, no password"
cli docker exec $CT psql -X -w -A -t -U m5_login -d $DB -c 'select current_user, inet_client_addr()'
echo "-- b. inside the container, -h 127.0.0.1, no password"
cli docker exec $CT psql -X -w -A -t -h 127.0.0.1 -U m5_login -d $DB -c 'select current_user, inet_client_addr()'
echo "-- b. inside the container, -h localhost, no password"
cli docker exec $CT psql -X -w -A -t -h localhost -U m5_login -d $DB -c 'select current_user, inet_client_addr()'
echo "-- b. the address the server sees for a connection from the host (as postgres)"
s <<'SQL'
select inet_client_addr(), inet_server_addr();
SQL
echo "-- c. alter role m5_login password '<client-computed SCRAM verifier>'"
s <<'SQL'
alter role m5_login password :'ver';
select 'pg_authid as postgres: equal='||(rolpassword = :'ver')||' head='||left(rolpassword,14) from pg_authid where rolname = 'm5_login';
SQL
echo "-- c. the same, read-only, as supabase_admin over the container's unix socket"
printf "%s;\n" "select 'equal='||(rolpassword = :'ver')||' head='||left(rolpassword,14) from pg_authid where rolname = 'm5_login'" | docker exec -i $CT psql -X -w -A -t -U supabase_admin -d postgres -v ver="$VER" 2>&1 | sed "s/^/     /" | cut -c1-300
echo "-- c. host TCP with the throwaway password"
PGPASSWORD="$PW" cli psql "postgresql://m5_login@$HP/$DB" -X -w -A -t -c 'select current_user'
echo "-- c. host TCP with a wrong password"
PGPASSWORD='m5-wrong-pw' cli psql "postgresql://m5_login@$HP/$DB" -X -w -A -t -c 'select current_user'
echo "-- c./d. alter role m5_login password null (postgres made m5_login), then the throwaway password again"
s <<'SQL'
alter role m5_login password null;
select 'rolpassword is null='||(rolpassword is null) from pg_authid where rolname = 'm5_login';
SQL
PGPASSWORD="$PW" cli psql "postgresql://m5_login@$HP/$DB" -X -w -A -t -c 'select current_user'
echo "-- c. the server log: lines naming m5_login since the script started ($T0) (count, then at most 3, cut at 200)"
echo "     count=$(docker logs --since "$T0" $CT 2>&1 | grep -c 'm5_login')"
docker logs --since "$T0" $CT 2>&1 | grep 'm5_login' | head -3 | cut -c1-200 | sed 's/^/     /'
echo "     lines naming ALTER ROLE since the script started ($T0): $(docker logs --since "$T0" $CT 2>&1 | grep -ci 'alter role')"
echo "     lines containing the verifier text sent: $(docker logs --since "$T0" $CT 2>&1 | grep -cF "$VER")"
docker logs --since "$T0" $CT 2>&1 | grep -i 'alter role m5_login password' | head -2 | cut -c1-140 | sed 's/^/     /'
echo "-- d. a role postgres did not make and holds no ADMIN on (supabase_etl_admin): its membership rows naming postgres, then ALTER ... PASSWORD NULL inside a transaction that is rolled back"
s <<'SQL'
select 'rows naming both: '||count(*) from pg_auth_members where (roleid = 'supabase_etl_admin'::regrole and member = 'postgres'::regrole) or (roleid = 'postgres'::regrole and member = 'supabase_etl_admin'::regrole);
select 'rolsuper='||rolsuper from pg_roles where rolname = 'supabase_etl_admin';
begin;
alter role supabase_etl_admin password null;
rollback;
SQL
echo "-- e. pg_db_role_setting (all rows), event triggers (throwaway database and database postgres)"
s <<'SQL'
select 'setting: db='||coalesce((select datname from pg_database where oid = setdatabase),'(all)')||' role='||coalesce(nullif(setrole,0)::regrole::text,'(all)')||' '||(select string_agg(case when split_part(c,'=',1) ~* '(secret|password|key|token)' then split_part(c,'=',1)||'=<value not printed>' else c end, ', ') from unnest(setconfig) c) from pg_db_role_setting order by 1;
select 'm5 rows='||count(*) from pg_db_role_setting where setrole in (to_regrole('m5_login'), to_regrole('m5_owner'), to_regrole('m5_plain'));
select 'evt('||current_database()||'): '||evtname||' '||evtevent||' owner='||evtowner::regrole||' fn='||evtfoid::regproc||' enabled='||evtenabled::text from pg_event_trigger order by 1;
select 'event triggers in '||current_database()||': '||count(*) from pg_event_trigger;
SQL
sa <<'SQL'
select 'evt('||current_database()||'): '||evtname||' '||evtevent||' owner='||evtowner::regrole||' fn='||evtfoid::regproc||' enabled='||evtenabled::text from pg_event_trigger order by 1;
select 'event triggers in '||current_database()||': '||count(*) from pg_event_trigger;
SQL

echo "-- extensions in the throwaway database before M4 (as postgres)"
s <<'SQL'
select 'ext '||extname||' owner='||extowner::regrole||' schema='||extnamespace::regnamespace from pg_extension order by 1;
SQL
echo "== M4 what a fresh login, member of nothing, can create or reach (m5_plain over TCP)"
plain <<'SQL'
select current_user, session_user;
create schema m5_x;
create table public.m5_t(id int);
create temp table m5_tmp(id int);
create table pg_temp.m5_tmp2(id int);
select lo_create(0) as loid \gset
select lo_unlink(:loid);
select lo_from_bytea(0, '\x00') as loid2 \gset
select lo_unlink(:loid2);
create role m5_y;
create database m5_db;
create extension if not exists pgcrypto;
create publication m5_pub;
create type pg_temp.m5_e as enum ('a');
create function pg_temp.m5_f() returns int language sql return 1;
do $$ begin null; end $$;
listen m5_ch;
notify m5_ch;
select pg_advisory_lock(1);
select pg_advisory_unlock(1);
select set_config('search_path', 'pg_catalog', false);
SQL
echo "-- extensions in the throwaway database after M4 (as postgres)"
s <<'SQL'
select 'ext '||extname||' owner='||extowner::regrole||' schema='||extnamespace::regnamespace from pg_extension order by 1;
SQL
echo "-- catalogue, as postgres asking about m5_plain: every schema of the throwaway database"
M4SCH="select 'schema '||nspname||' owner='||nspowner::regrole||' USAGE='||has_schema_privilege('m5_plain',oid,'USAGE')||' CREATE='||has_schema_privilege('m5_plain',oid,'CREATE') from pg_namespace order by nspname"
M4DB="select 'db '||datname||': CREATE='||has_database_privilege('m5_plain',datname,'CREATE')||' TEMP='||has_database_privilege('m5_plain',datname,'TEMP')||' CONNECT='||has_database_privilege('m5_plain',datname,'CONNECT') from pg_database where datname in ('postgres', '$DB') order by 1"
M4CNT="with o as (select c.relnamespace ns, c.relname nm, c.relkind k, c.oid from pg_class c where c.relkind in ('r','v','m','f','p','S')), x as (select n.oid, n.nspname, has_schema_privilege('m5_plain', n.oid, 'USAGE') u from pg_namespace n), f as (select p.pronamespace ns, p.proname nm, p.oid from pg_proc p) select 'counts '||x.nspname||' usage='||x.u||' | table-ACL: select='||(select count(*) from o where o.ns=x.oid and k<>'S' and has_table_privilege('m5_plain',o.oid,'SELECT'))||' write='||(select count(*) from o where o.ns=x.oid and k<>'S' and (has_table_privilege('m5_plain',o.oid,'INSERT') or has_table_privilege('m5_plain',o.oid,'UPDATE') or has_table_privilege('m5_plain',o.oid,'DELETE')))||' seq='||(select count(*) from o where o.ns=x.oid and case when k='S' then has_sequence_privilege('m5_plain',o.oid,'USAGE') else false end)||' exec='||(select count(*) from f where f.ns=x.oid and has_function_privilege('m5_plain',f.oid,'EXECUTE'))||' of rel='||(select count(*) from o where o.ns=x.oid)||' fn='||(select count(*) from f where f.ns=x.oid) from x where exists (select 1 from o where o.ns=x.oid) or exists (select 1 from f where f.ns=x.oid) order by x.nspname"
M4LST="with o as (select c.relnamespace ns, c.relname nm, c.relkind k, c.oid from pg_class c where c.relkind in ('r','v','m','f','p','S')), x as (select n.oid, n.nspname from pg_namespace n where n.nspname not in ('pg_catalog','information_schema') and n.nspname not like 'pg\_toast%' and n.nspname not like 'pg\_temp%'), f as (select p.pronamespace ns, p.proname nm, p.oid from pg_proc p) select l from (select x.nspname, 1 ord, 'list '||x.nspname||' select: '||coalesce(array_to_string((select (array_agg(nm order by nm))[1:15] from o where o.ns=x.oid and k<>'S' and has_table_privilege('m5_plain',o.oid,'SELECT')),', '),'(none)') l from x union all select x.nspname, 2, 'list '||x.nspname||' write: '||coalesce(array_to_string((select (array_agg(nm order by nm))[1:15] from o where o.ns=x.oid and k<>'S' and (has_table_privilege('m5_plain',o.oid,'INSERT') or has_table_privilege('m5_plain',o.oid,'UPDATE') or has_table_privilege('m5_plain',o.oid,'DELETE'))),', '),'(none)') from x union all select x.nspname, 3, 'list '||x.nspname||' seq: '||coalesce(array_to_string((select (array_agg(nm order by nm))[1:15] from o where o.ns=x.oid and case when k='S' then has_sequence_privilege('m5_plain',o.oid,'USAGE') else false end),', '),'(none)') from x union all select x.nspname, 4, 'list '||x.nspname||' exec: '||coalesce(array_to_string((select (array_agg(distinct nm order by nm))[1:15] from f where f.ns=x.oid and has_function_privilege('m5_plain',f.oid,'EXECUTE')),', '),'(none)') from x) z order by nspname, ord"
for target in "$URL" "$ADMIN"; do
  echo "-- database: ${target##*/}"
  psql "$target" -X -q -A -t -v ON_ERROR_STOP=0 -c "$M4SCH" -c "$M4DB" -c "$M4CNT" -c "$M4LST" 2>&1 | sed 's/^/     /' | cut -c1-300
done

echo "== M5 pg_catalog grants on this instance (database postgres, read-only, asking about m5_plain)"
echo "-- a. relations in pg_catalog / information_schema"
sa <<'SQL'
select 'not selectable: '||n.nspname||'.'||c.relname||' kind='||c.relkind::text from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname in ('pg_catalog','information_schema') and c.relkind in ('r','v','m','p','f') and not has_table_privilege('m5_plain', c.oid, 'SELECT') order by 1;
select 'selectable count: '||n.nspname||'='||count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname in ('pg_catalog','information_schema') and c.relkind in ('r','v','m','p','f') and has_table_privilege('m5_plain', c.oid, 'SELECT') group by n.nspname order by 1;
select 'writable: '||n.nspname||'.'||c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname in ('pg_catalog','information_schema') and c.relkind in ('r','v','m','p','f') and (has_table_privilege('m5_plain', c.oid, 'INSERT') or has_table_privilege('m5_plain', c.oid, 'UPDATE') or has_table_privilege('m5_plain', c.oid, 'DELETE')) order by 1;
select 'writable count='||count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname in ('pg_catalog','information_schema') and c.relkind in ('r','v','m','p','f') and (has_table_privilege('m5_plain', c.oid, 'INSERT') or has_table_privilege('m5_plain', c.oid, 'UPDATE') or has_table_privilege('m5_plain', c.oid, 'DELETE'));
SQL
echo "-- b. functions in pg_catalog m5_plain may NOT execute"
sa <<'SQL'
select 'not executable count='||count(*)||' of '||(select count(*) from pg_proc where pronamespace = 'pg_catalog'::regnamespace) from pg_proc where pronamespace = 'pg_catalog'::regnamespace and not has_function_privilege('m5_plain', oid, 'EXECUTE');
select 'no-exec: '||proname||'('||pg_get_function_identity_arguments(oid)||')' from pg_proc where pronamespace = 'pg_catalog'::regnamespace and not has_function_privilege('m5_plain', oid, 'EXECUTE') order by 1;
SQL
echo "-- b. the named functions, every signature found in any schema"
sa <<'SQL'
select 'fn '||pronamespace::regnamespace||'.'||proname||'('||pg_get_function_identity_arguments(oid)||') EXECUTE='||has_function_privilege('m5_plain', oid, 'EXECUTE')||' acl='||coalesce(proacl::text,'(null)') from pg_proc where proname in ('pg_read_file','pg_read_binary_file','pg_ls_dir','pg_stat_file','lo_import','lo_export','pg_terminate_backend','pg_cancel_backend','pg_reload_conf','pg_rotate_logfile','pg_switch_wal','pg_create_restore_point','pg_logical_emit_message','pg_stat_reset','pg_stat_statements_reset','pg_sleep','pg_notify','set_config','current_setting','pg_advisory_lock','dblink_connect') order by 1;
select 'present? pg_stat_statements_reset='||exists(select 1 from pg_proc where proname = 'pg_stat_statements_reset')||' dblink_connect='||exists(select 1 from pg_proc where proname = 'dblink_connect');
select 'm5_plain member of pg_read_server_files='||pg_has_role('m5_plain','pg_read_server_files','MEMBER');
SQL
echo "-- b. real outcome: m5_plain calls them over its own TCP connection (throwaway database)"
plain <<'SQL'
select pg_terminate_backend(2147483647);
select pg_cancel_backend(2147483647);
select pg_ls_dir('.');
select pg_read_file('PG_VERSION');
SQL
echo "-- c. roles that have members (grouped), and the roles m5_plain is a member of"
sa <<'SQL'
select 'has members: '||roleid::regrole||' <- '||string_agg(member::regrole::text, ',' order by member::regrole::text) from pg_auth_members group by roleid order by 1;
select 'm5_plain member of: '||coalesce(string_agg(rolname, ',' order by rolname), '(none)') from pg_roles where rolname <> 'm5_plain' and pg_has_role('m5_plain', oid, 'MEMBER');
select 'rows with member 0 (PUBLIC)='||count(*) from pg_auth_members where member = 0;
SQL
echo "-- d. relation and column ACLs on the named catalogues, as stored"
sa <<'SQL'
select 'relacl '||oid::regclass||' = '||coalesce(relacl::text,'(null)') from pg_class where oid in ('pg_catalog.pg_authid'::regclass,'pg_catalog.pg_shadow'::regclass,'pg_catalog.pg_user_mapping'::regclass,'pg_catalog.pg_subscription'::regclass,'pg_catalog.pg_statistic'::regclass,'pg_catalog.pg_largeobject'::regclass) order by 1;
select 'attacl '||attrelid::regclass||'.'||attname||' = '||attacl::text from pg_attribute where attrelid in ('pg_catalog.pg_authid'::regclass,'pg_catalog.pg_shadow'::regclass,'pg_catalog.pg_user_mapping'::regclass,'pg_catalog.pg_subscription'::regclass,'pg_catalog.pg_statistic'::regclass,'pg_catalog.pg_largeobject'::regclass) and attacl is not null order by 1;
select 'column-ACL rows on these='||count(*) from pg_attribute where attrelid in ('pg_catalog.pg_authid'::regclass,'pg_catalog.pg_shadow'::regclass,'pg_catalog.pg_user_mapping'::regclass,'pg_catalog.pg_subscription'::regclass,'pg_catalog.pg_statistic'::regclass,'pg_catalog.pg_largeobject'::regclass) and attacl is not null;
SQL

echo "== M6 two side facts"
echo "-- a. revoke temporary on database $DB from public; then m5_plain's create temp table"
s <<SQL
select 'datacl before='||coalesce(datacl::text,'(null)') from pg_database where datname = '$DB';
revoke temporary on database $DB from public;
select 'datacl after='||coalesce(datacl::text,'(null)') from pg_database where datname = '$DB';
select 'm5_plain TEMP='||has_database_privilege('m5_plain', '$DB', 'TEMP');
SQL
plain <<'SQL'
create temp table m5_tmp3(id int);
SQL
echo "-- b. connected to database postgres: create role m5_owner while it already exists"
sa <<'SQL'
select 'exists='||exists(select 1 from pg_roles where rolname = 'm5_owner');
create role m5_owner;
SQL

echo "== clean-up"
psql "$ADMIN" -X -q -A -t -a -v ON_ERROR_STOP=0 2>&1 <<SQL | sed 's/^/     /' | cut -c1-300
drop database if exists $DB with (force);
drop database if exists m5_db;
drop role if exists m5_owner;
drop role if exists m5_plain;
drop role if exists m5_login;
drop role if exists m5_y;
select 'm5 roles left: '||coalesce(string_agg(rolname, ','),'(none)') from pg_roles where rolname like 'm5\_%';
select 'database $DB exists='||exists(select 1 from pg_database where datname = '$DB')||' m5_db exists='||exists(select 1 from pg_database where datname = 'm5_db');
SQL
