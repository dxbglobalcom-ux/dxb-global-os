#!/usr/bin/env bash
# Piece 5, the lead's own additions to measure.sh (2026-11-23), on the foundation's bench (127.0.0.1:54522), in a
# throwaway database and with roles named m5_*, each dropped here by its written name.
set -u
ADMIN="postgresql://postgres:postgres@127.0.0.1:54522/postgres"
DB="roles_measure_p5b"
URL="postgresql://postgres:postgres@127.0.0.1:54522/$DB"
PLAIN="postgresql://m5_plain:m5-throwaway-pw@127.0.0.1:54522/$DB"
HERE="$(dirname "$(readlink -f "$0")")"
q() { psql "$1" -X -q -A -t -v ON_ERROR_STOP=0 "${@:2}" 2>&1 | cut -c1-300; }
START="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
psql "$ADMIN" -X -q -c "drop database if exists roles_measure_p5b" -c "drop role if exists m5_plain" -c "drop role if exists m5_owner" -c "create database roles_measure_p5b" -c "create role m5_plain login" -c "create role m5_owner nologin" 2>&1 | cut -c1-200
V="$(node "$HERE/scram.cjs" 'm5-throwaway-pw')"
echo "== M7 a verifier set without its text in a statement"
echo "-- a. the verifier travels as a parameter into a transaction-local setting; ALTER ROLE runs inside a DO"
psql "$URL" -X -q -A -t -v ON_ERROR_STOP=1 -v v="$V" <<'SQL' 2>&1 | cut -c1-200
begin;
select set_config('os_install.verifier', :'v', true) is not null;
do $w$ begin execute format('alter role %I password %L', 'm5_plain', current_setting('os_install.verifier')); end $w$;
commit;
SQL
echo "   the verifier computed: ${#V} characters, begins ${V:0:14}"
echo "   stored equals sent: $(echo "select rolpassword = :'v' from pg_authid where rolname = 'm5_plain'" | psql "$URL" -X -q -A -t -v v="$V" 2>&1 | cut -c1-200)"
echo "   login with the plain password: $(q "$PLAIN" -c "select current_user")"
sleep 1
HEAD="${V:0:40}"
echo "   log lines since the start that hold the verifier's first 40 characters: $(docker logs --since "$START" supabase_db_DxB_Foundation 2>&1 | grep -c -F "$HEAD")"
echo "   log lines since the start that name m5_plain: $(docker logs --since "$START" supabase_db_DxB_Foundation 2>&1 | grep -c 'm5_plain')"
docker logs --since "$START" supabase_db_DxB_Foundation 2>&1 | grep 'm5_plain' | grep -v -F "$HEAD" | cut -c1-220 | head -4
echo "-- b. may the installer silence the statement log for its transaction?"
q "$URL" -c "begin; set local log_statement = 'none'; rollback;"
echo "-- c. a failing ALTER ROLE inside the DO: what the log keeps (log_min_error_statement = error)"
START2="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
psql "$URL" -X -q -A -t -v v="$V" <<'SQL' 2>&1 | cut -c1-200
begin;
select set_config('os_install.verifier', :'v', true) is not null;
do $w$ begin execute format('alter role %I password %L', 'm5_nobody', current_setting('os_install.verifier')); end $w$;
rollback;
SQL
sleep 1
echo "   log lines since then that hold the verifier's head: $(docker logs --since "$START2" supabase_db_DxB_Foundation 2>&1 | grep -c -F "$HEAD")"
docker logs --since "$START2" supabase_db_DxB_Foundation 2>&1 | grep -F "$HEAD" | sed "s|$HEAD.*|<the verifier follows>|" | cut -c1-260 | head -4

echo "== M8 an extension, asked for by a login that is member of nothing"
echo "-- a. the platform's lists (as postgres)"
for s in supautils.privileged_extensions supautils.superuser supautils.privileged_role supautils.reserved_roles supautils.extensions_parameter_overrides; do echo "   $s = $(q "$URL" -c "show $s")"; done
echo "-- b. as m5_plain over TCP, each tried and dropped again if made"
for x in pgcrypto pg_net dblink postgres_fdw http pg_cron plpython3u file_fdw pg_stat_statements; do
  echo "   create extension $x: $(q "$PLAIN" -c "create extension $x" -c "select 'made, owner ' || extowner::regrole || ' in ' || extnamespace::regnamespace from pg_extension where extname = '$x'")"
  q "$URL" -c "drop extension if exists $x cascade" > /dev/null
done
echo "-- c. as m5_plain: an extension into a schema of its choosing, and drop of one it asked for"
echo "   $(q "$PLAIN" -c "create extension pgcrypto schema pg_temp")"
echo "   $(q "$PLAIN" -c "create extension pgcrypto" -c "drop extension pgcrypto" -c "select 'dropped by the plain login'")"
q "$URL" -c "drop extension if exists pgcrypto cascade" > /dev/null
echo "-- d. the same in a database where PUBLIC has lost nothing: has m5_plain CREATE on the database?"
echo "   $(q "$URL" -c "select has_database_privilege('m5_plain', current_database(), 'CREATE')")"

echo "== M9 the guard's reading, and the owner's reach, as a login that is member of nothing"
echo "-- a. pg_control_system() as m5_plain: $(q "$PLAIN" -c "select system_identifier is not null from pg_catalog.pg_control_system()")"
echo "-- b. set role to the owner of a schema, by the installer with SET only, then a function made and a forced row-security table read"
q "$URL" -c "grant m5_owner to postgres with set true, inherit false" -c "create schema m5_s authorization m5_owner"
psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 <<'SQL' 2>&1 | cut -c1-240
begin;
set local role m5_owner;
create table m5_s.kinds(code text primary key);
insert into m5_s.kinds values ('a'), ('b');
alter table m5_s.kinds enable row level security;
alter table m5_s.kinds force row level security;
create policy hide on m5_s.kinds using (false);
select 'row_security on, rows the owner reads: ' || count(*) from m5_s.kinds;
set local row_security = off;
select 'row_security off, rows the owner reads: ' || count(*) from m5_s.kinds;
rollback;
SQL
echo "-- c. the same reading by the installer itself (BYPASSRLS), not as the owner: needs a grant it does not have"
q "$URL" -c "select count(*) from m5_s.kinds"
echo "== clean-up"
psql "$ADMIN" -X -q -c "drop database if exists roles_measure_p5b" -c "drop role if exists m5_plain" -c "drop role if exists m5_owner" 2>&1 | cut -c1-200
echo "m5 roles left: $(q "$ADMIN" -c "select coalesce(string_agg(rolname, ','), '(none)') from pg_roles where rolname like 'm5\_%'")"
