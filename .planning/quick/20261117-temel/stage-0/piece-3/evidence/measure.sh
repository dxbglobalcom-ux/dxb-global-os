#!/usr/bin/env bash
# Measurements for piece 3 on the foundation's own bench (127.0.0.1:54522), in a throwaway database made and dropped here.
set -u
ADMIN="postgresql://postgres:postgres@127.0.0.1:54522/postgres"
DB="chain_measure_m1"
URL="postgresql://postgres:postgres@127.0.0.1:54522/$DB"
q() { psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 "$@" 2>&1; }
echo "== M0 identity of the target"; psql "$ADMIN" -X -q -A -t -c "select system_identifier from pg_control_system()" -c "select current_user, (select rolsuper from pg_roles where rolname=current_user)"
echo "== M4 names free?"; psql "$ADMIN" -X -q -A -t -c "select 'namespace', nspname from pg_namespace where nspname like 'os%' union all select 'role', rolname from pg_roles where rolname like 'os%' union all select 'db', datname from pg_database"
echo "== M1 throwaway database"; ( time psql "$ADMIN" -X -q -c "create database $DB" ) 2>&1 | grep -E "real|ERROR"
q -c "select oid, datname from pg_database where datname=current_database()" -c "select system_identifier from pg_control_system()"
# the wrapper under test: the file's text travels as a parameter-like setting, plpgsql EXECUTE runs it
wrap() { # $1 = label, $2 = file text
  local out
  out=$(psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 -v body="$2" <<'SQL' 2>&1
begin;
select 'xid-before=' || pg_current_xact_id();
select set_config('os_chain.file', :'body', true) is not null;
do $w$ begin execute current_setting('os_chain.file'); end $w$;
select 'xid-after=' || pg_current_xact_id();
commit;
SQL
)
  echo "-- $1"; echo "$out" | sed 's/^/     /' | cut -c1-260
  echo "     left behind: $(q -c "select coalesce(string_agg(relname, ',' order by relname),'(nothing)') from pg_class where relnamespace='public'::regnamespace and relname like 'm\_%'")"
  q -c "do \$\$ declare r record; begin for r in select relname from pg_class where relnamespace='public'::regnamespace and relname like 'm\_%' and relkind='r' loop execute 'drop table public.' || quote_ident(r.relname) || ' cascade'; end loop; end \$\$" >/dev/null
}
echo "== M2 the wrapper (plpgsql EXECUTE of the whole file text, inside the runner's transaction)"
wrap "a. two statements, the second needs the first" "create table m_a(id int primary key); insert into m_a values (1); create table m_a2 as select * from m_a;"
wrap "b. COMMIT in the middle" "create table m_b1(id int); commit; create table m_b2(id int);"
wrap "c. ROLLBACK in the middle" "create table m_c1(id int); rollback; create table m_c2(id int);"
wrap "d. BEGIN at the top" "begin; create table m_d(id int);"
wrap "e. SAVEPOINT" "create table m_e(id int); savepoint s1;"
wrap "f. START TRANSACTION" "start transaction; create table m_f(id int);"
wrap "g. END" "create table m_g(id int); end;"
wrap "h. ABORT" "create table m_h(id int); abort;"
wrap "i. PREPARE TRANSACTION" "create table m_i(id int); prepare transaction 'x';"
wrap "j. a DO block that commits" "create table m_j(id int); do \$\$ begin commit; end \$\$;"
wrap "k. a procedure that commits, called" "create table m_k(id int); create procedure pg_temp.p() language plpgsql as \$\$ begin commit; end \$\$; call pg_temp.p();"
wrap "l. a plpgsql body with BEGIN/END, and the word COMMIT in a string and a comment" "create table m_l(note text); create function pg_temp.f() returns text language plpgsql as \$\$ begin return 'COMMIT; ROLLBACK;'; end \$\$; insert into m_l select pg_temp.f(); -- commit;
/* rollback; */ insert into m_l values ('begin;');"
wrap "m. BEGIN ATOMIC function" "create table m_m(id int); create function public.m_fn() returns int language sql begin atomic select 1; select 2; end; drop function public.m_fn();"
wrap "n. a failing statement after a good one" "create table m_n(id int); select 1/0; create table m_n2(id int);"
wrap "o. CREATE INDEX CONCURRENTLY" "create table m_o(id int); create index concurrently m_o_i on m_o(id);"
wrap "p. a syntax error late in the text" "create table m_p(id int); creat table m_p2(id int);"
wrap "q. empty text" ""
wrap "r. only a comment" "-- nothing here"
echo "== M3 the same text without the wrapper: one simple Query message inside the runner's BEGIN"
psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 -c "begin" -c "create table m_s1(id int); commit; create table m_s2(id int); select 1/0;" -c "commit" 2>&1 | sed 's/^/     /'
echo "     left behind: $(q -c "select coalesce(string_agg(relname, ',' order by relname),'(nothing)') from pg_class where relnamespace='public'::regnamespace and relname like 'm\_%'")"
echo "== M5 a session setting made by one file is met by the next file in the same session"
psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 <<'SQL' 2>&1 | sed 's/^/     /'
begin; select set_config('os_chain.file', 'set search_path = pg_catalog; set role pg_monitor; create temp table m_t(id int);', true) is not null; do $w$ begin execute current_setting('os_chain.file'); end $w$; commit;
select 'next file meets: search_path=' || current_setting('search_path') || ' role=' || current_user || ' temp table=' || (to_regclass('pg_temp.m_t') is not null);
SQL
echo "== M6 a large text as a setting"
psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 -c "select length(set_config('os_chain.file', repeat('select 1; ', 200000), false))" -c "do \$w\$ begin execute current_setting('os_chain.file'); end \$w\$" -c "select 'ran 2 MB'" 2>&1 | sed 's/^/     /' | cut -c1-200
echo "== M7 the error's fields as the server gives them (which statement failed)"
psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 -v VERBOSITY=verbose -c "begin" -c "select set_config('os_chain.file', 'create table m_v(id int);
select 1/0;', true) is not null" -c "do \$w\$ begin execute current_setting('os_chain.file'); end \$w\$" -c "rollback" 2>&1 | sed 's/^/     /' | cut -c1-240
echo "== M8 two sessions and one advisory lock"
( psql "$URL" -X -q -A -t -c "select 'first holds=' || pg_try_advisory_lock(4242)" -c "select pg_sleep(2)" >/dev/null & ) ; sleep 0.7
psql "$URL" -X -q -A -t -c "select 'second gets=' || pg_try_advisory_lock(4242)" | sed 's/^/     /'; sleep 2
psql "$URL" -X -q -A -t -c "select 'after the first ended, a third gets=' || pg_try_advisory_lock(4242)" | sed 's/^/     /'
echo "== drop"; ( time psql "$ADMIN" -X -q -c "drop database $DB" ) 2>&1 | grep -E "real|ERROR"
psql "$ADMIN" -X -q -A -t -c "select 'databases now: ' || string_agg(datname, ',' order by datname) from pg_database"
