#!/usr/bin/env bash
# Piece 5 (B85 stage 0), the corrections' mechanisms measured (2026-11-23) on the foundation's bench (127.0.0.1:54522),
# PostgreSQL 17.6. Needs a standing instance (`pnpm foundation:instance up`); C3 applies the real chain and the
# logins to database `postgres`. Everything else lives in roles m6_* and the throwaway database roles_measure_p5c,
# each dropped here by its written name. Output: no password; a verifier only as `SCRAM-SHA-256$<…>`.
# Run: bash measure-corrections.sh > measure-corrections.out 2>&1
set -u
unset PGOPTIONS
HERE="$(dirname "$(readlink -f "$0")")"
REPO="/home/dxb/DxB Global OS"
ADMIN="postgresql://postgres:postgres@127.0.0.1:54522/postgres"
URL="postgresql://postgres:postgres@127.0.0.1:54522/roles_measure_p5c"
ENGINE="postgresql://os_engine@127.0.0.1:54522/postgres"
LOGINS="$HOME/.local/state/dxb/foundation-bench/logins.json"
export M6_URL="$URL"
q() { psql "$1" -X -q -A -t -v ON_ERROR_STOP=0 "${@:2}" 2>&1; }
# The engine's password goes to psql through its environment only; it is never printed.
qe() { PGPASSWORD="$(jq -r .logins.os_engine "$LOGINS")" psql "$ENGINE" -X -q -A -t -v ON_ERROR_STOP=0 -v VERBOSITY=verbose "$@" 2>&1; }
redact() { perl -pe 's/(SCRAM-SHA-256\$)[^\s\x27"]*/$1<…>/g' | cut -c1-300; }
# The chain's answer: its last stdout line, the number of stdout lines, the first two offence lines, and its exit code.
chain_up() {
  local out ec
  out="$(pnpm -C "$REPO" -s foundation:chain up 2>/dev/null)"; ec=$?
  echo "  $1: $(printf '%s\n' "$out" | tail -1) exit=$ec (stdout lines: $(printf '%s\n' "$out" | wc -l))"
  [ $ec -ne 0 ] && printf '%s\n' "$out" | head -2 | sed "s/^/      /"
  return 0
}
ROLES="m6_x m6_y m6_a m6_b m6_c m6_d m6_e m6_n"
cleanup() {
  psql "$ADMIN" -X -q -c "drop database if exists roles_measure_p5c" 2>&1
  for r in $ROLES; do psql "$ADMIN" -X -q -c "drop role if exists $r" 2>&1; done
}
AUTH_ROWS="select member::regrole::text || ' grantor=' || grantor::regrole::text || ' admin=' || admin_option || ' inherit=' || inherit_option || ' set=' || set_option from pg_auth_members where roleid = '%s'::regrole order by member::regrole::text, grantor::regrole::text"

main() {
echo "== setup"
echo "instance: $(pnpm -C "$REPO" -s foundation:instance status 2>&1)"
cleanup
q "$ADMIN" -c "create database roles_measure_p5c" -c "create role m6_x nologin" -c "create role m6_y nologin" \
  -c "create role m6_c login" -c "create role m6_d login" -c "create role m6_n login"

echo "== C6 the installer's role setting"
q "$ADMIN" -c "select 'role=' || current_setting('role')" -c "set role postgres" -c "select 'role=' || current_setting('role') || ' current_user=' || current_user" -c "reset role" -c "select 'role=' || current_setting('role')"

echo "== C4.b may the installer turn on statement or parameter logging?"
for s in "log_statement = 'all'" "log_min_duration_statement = 0" "log_parameter_max_length = -1" "log_parameter_max_length_on_error = -1" "log_min_error_statement = 'panic'"; do
  echo "  set $s → $(q "$URL" -c "set $s" -c "select 'accepted; in this session now ' || current_setting('${s%% *}')" | tr '\n' ' ')"
done
for s in log_statement log_min_duration_statement log_parameter_max_length log_parameter_max_length_on_error log_min_error_statement log_lock_waits log_min_duration_sample; do
  echo "  $s = $(q "$URL" -c "show $s")"
done
echo "  pg_parameter_acl (parname | paracl), whole:"
q "$URL" -c "select parname || ' | ' || coalesce(paracl::text, '(null)') from pg_parameter_acl order by parname" | sed 's/^/    /'
echo "  rows: $(q "$URL" -c "select count(*) from pg_parameter_acl")"
echo "  why: the platform's list of settings its privileged role may set (supautils.privileged_role_allowed_configs), one per line:"
q "$URL" -c "show supautils.privileged_role_allowed_configs" | tr "," "\n" | sed "s/^ */    /"
echo "  supautils.privileged_role = $(q "$URL" -c "show supautils.privileged_role"); the installer is a member of it: $(q "$URL" -c "select pg_has_role('postgres', current_setting('supautils.privileged_role'), 'member')")"
echo "  pg_settings.context of the five: $(q "$URL" -c "select string_agg(name || '=' || context, ', ') from pg_settings where name in ('log_statement','log_min_duration_statement','log_parameter_max_length','log_parameter_max_length_on_error','log_min_error_statement')")"

echo "== C4.a node pg and PGOPTIONS"
PGOPTIONS='-c default_transaction_read_only=on' node "$HERE/m6.cjs" c4a
echo "  -- and PGOPTIONS asking for a logging setting the installer may not set:"
PGOPTIONS='-c log_statement=all' node "$HERE/m6.cjs" c4a

echo "== C1 a failing ALTER ROLE inside the DO block (node pg, parameters bound; one fresh verifier per case)"
node "$HERE/m6.cjs" c1

echo "== C4.c the installer CAN set them (C4.b): each turned on for B's transaction, then the hand-over with a bound throwaway verifier (b's form, role m6_y)"
node "$HERE/m6.cjs" c4c

echo "== C2 createrole_self_grant"
echo "-- C2.a"
echo "  show (installer): '$(q "$URL" -c "show createrole_self_grant")'"
echo "  pg_db_role_setting rows for postgres before: $(q "$URL" -c "select coalesce(string_agg(setdatabase || ':' || array_to_string(setconfig, ','), '; '), '(none)') from pg_db_role_setting where setrole = 'postgres'::regrole")"
echo "  alter role postgres set createrole_self_grant = 'set, inherit' → $(q "$URL" -c "alter role postgres set createrole_self_grant = 'set, inherit'" -c "select 'accepted'" | tr '\n' ' ')"
echo "  pg_db_role_setting rows for postgres in between: $(q "$URL" -c "select coalesce(string_agg(setdatabase || ':' || array_to_string(setconfig, ','), '; '), '(none)') from pg_db_role_setting where setrole = 'postgres'::regrole")"
echo "  a new session's value in between: '$(q "$URL" -c "show createrole_self_grant")'"
echo "  alter role postgres reset createrole_self_grant → $(q "$URL" -c "alter role postgres reset createrole_self_grant" -c "select 'accepted'" | tr '\n' ' ')"
echo "  pg_db_role_setting rows for postgres after: $(q "$URL" -c "select coalesce(string_agg(setdatabase || ':' || array_to_string(setconfig, ','), '; '), '(none)') from pg_db_role_setting where setrole = 'postgres'::regrole")"
echo "  a new session's value after: '$(q "$URL" -c "show createrole_self_grant")'"
echo "-- C2.b session-level set createrole_self_grant = 'set, inherit'"
q "$URL" -c "set createrole_self_grant = 'set, inherit'" -c "create role m6_a nologin noinherit" \
  -c "select '  after create: ' || x from ($(printf "$AUTH_ROWS" m6_a)) t(x)" \
  -c "grant m6_a to postgres with set true, inherit false" \
  -c "select '  after grant ... with set true, inherit false: ' || x from ($(printf "$AUTH_ROWS" m6_a)) t(x)"
echo "-- C2.c the same session value; inside one transaction set local createrole_self_grant to ''"
q "$URL" -c "set createrole_self_grant = 'set, inherit'" \
  -c "begin" -c "set local createrole_self_grant to ''" -c "create role m6_b nologin noinherit" -c "grant m6_b to postgres with set true, inherit false" -c "commit" \
  -c "select '  ' || x from ($(printf "$AUTH_ROWS" m6_b)) t(x)" -c "select '  session value after commit: ' || current_setting('createrole_self_grant')"
echo "-- C2.d the chain runner's two statements (session.ts:98-104) in one transaction (session.ts:84-93), the file's text a set local then a create role"
node "$HERE/m6.cjs" c2d

echo "== C5 a login that cannot be used, over TCP from the host (node pg)"
node "$HERE/m6.cjs" c5

echo "== C3 a privileged extension asked into os by a plain login (real chain and logins, database postgres)"
chain_up "chain up"
echo "  logins:   $(pnpm -C "$REPO" -s foundation:instance logins 2>&1 | tail -1)"
echo "  logins file mode: $(stat -c %a "$LOGINS")"
echo "  os_engine comes in: $(qe -c "select current_user")"
echo "  privileges of os_engine on schema os: usage=$(q "$ADMIN" -c "select has_schema_privilege('os_engine','os','USAGE')") create=$(q "$ADMIN" -c "select has_schema_privilege('os_engine','os','CREATE')")"
echo "-- C3.1 as os_engine: create extension hstore schema os"
echo "  → $(qe -c "create extension hstore schema os" -c "select 'made'" | tr '\n' ' ')"
echo "  extension: $(q "$ADMIN" -c "select coalesce((select extname || ' owner=' || extowner::regrole || ' schema=' || extnamespace::regnamespace from pg_extension where extname = 'hstore'), '(none)')")"
echo "  in os — functions by owner: $(q "$ADMIN" -c "select coalesce(string_agg(o || '=' || n, ', '), '(none)') from (select proowner::regrole::text o, count(*) n from pg_proc where pronamespace = 'os'::regnamespace group by 1) t")"
echo "  in os — types by owner:     $(q "$ADMIN" -c "select coalesce(string_agg(o || '=' || n, ', '), '(none)') from (select typowner::regrole::text o, count(*) n from pg_type where typnamespace = 'os'::regnamespace group by 1) t")"
echo "  in os — operators by owner: $(q "$ADMIN" -c "select coalesce(string_agg(o || '=' || n, ', '), '(none)') from (select oprowner::regrole::text o, count(*) n from pg_operator where oprnamespace = 'os'::regnamespace group by 1) t")"
echo "  in os — op. classes/families: $(q "$ADMIN" -c "select (select count(*) from pg_opclass where opcnamespace = 'os'::regnamespace) || ' / ' || (select count(*) from pg_opfamily where opfnamespace = 'os'::regnamespace)")"
chain_up "chain up now"
echo "  as os_engine: drop extension hstore → $(qe -c "drop extension hstore" -c "select 'dropped'" | tr '\n' ' ')"
chain_up "chain up again"
echo "-- C3.2 as os_engine: create extension hstore (default schema), then alter extension hstore set schema os"
echo "  create → $(qe -c "create extension hstore" -c "select 'made in ' || extnamespace::regnamespace || ' owner=' || extowner::regrole from pg_extension where extname = 'hstore'" | tr '\n' ' ')"
echo "  alter extension hstore set schema os → $(qe -c "alter extension hstore set schema os" -c "select 'now in ' || extnamespace::regnamespace from pg_extension where extname = 'hstore'" | tr '\n' ' ')"
echo "  clean-up as os_engine: $(qe -c "drop extension if exists hstore" -c "select 'dropped'" | tr '\n' ' ')"
echo "  hstore left: $(q "$ADMIN" -c "select count(*) from pg_extension where extname = 'hstore'")"
echo "-- C3.2' as os_engine: may a plain login turn on statement logging? set log_statement = 'all'"
echo "  → $(qe -c "set log_statement = 'all'" -c "show log_statement" | tr '\n' ' ')"
echo "-- C3.3 as os_engine: set session authorization os_owner"
echo "  → $(qe -c "set session authorization os_owner" -c "select 'after it: current_user=' || current_user || ' session_user=' || session_user" | tr '\n' ' ')"
echo "-- C3.4 as os_engine: alter role os_engine set search_path = 'x'"
echo "  → $(qe -c "alter role os_engine set search_path = 'x'" -c "select 'accepted'" | tr '\n' ' ')"
echo "  pg_db_role_setting for os_engine now: $(q "$ADMIN" -c "select coalesce(string_agg(setdatabase || ':' || array_to_string(setconfig, ','), '; '), '(none)') from pg_db_role_setting where setrole = 'os_engine'::regrole")"
echo "  a new os_engine session's search_path: $(qe -c "show search_path")"
echo "  installer: alter role os_engine reset search_path → $(q "$ADMIN" -c "alter role os_engine reset search_path" -c "select 'accepted'" | tr '\n' ' ')"
echo "  pg_db_role_setting rows for the four logins: $(q "$ADMIN" -c "select count(*) from pg_db_role_setting where setrole::regrole::text in ('os_engine','os_executor','os_intake','os_reader')")"

echo "== clean-up"
cleanup
echo "  m6 roles left: $(q "$ADMIN" -c "select coalesce(string_agg(rolname, ','), '(none)') from pg_roles where rolname like 'm6\_%'")"
echo "  databases roles_measure_p5c left: $(q "$ADMIN" -c "select count(*) from pg_database where datname = 'roles_measure_p5c'")"
echo "  pg_db_role_setting for postgres (as before C2.a): $(q "$ADMIN" -c "select coalesce(string_agg(setdatabase || ':' || array_to_string(setconfig, ','), '; '), '(none)') from pg_db_role_setting where setrole = 'postgres'::regrole")"
}

main 2>&1 | redact
