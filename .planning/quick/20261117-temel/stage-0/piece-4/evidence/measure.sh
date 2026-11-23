#!/usr/bin/env bash
# Measurements for piece 4 on the foundation's own bench (127.0.0.1:54522), in a throwaway database made and dropped here.
# What the functions pass and the reference pass rest on, asked of the server before the contract is signed.
set -u
ADMIN="postgresql://postgres:postgres@127.0.0.1:54522/postgres"
DB="chain_measure_p4"
URL="postgresql://postgres:postgres@127.0.0.1:54522/$DB"
q() { psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 "$@" 2>&1 | cut -c1-300; }
qv() { local rows="$1"; shift; printf '%s;\n' "$@" | psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 -v rows="$rows" 2>&1 | cut -c1-300; } # $1 = the rows, then statements
procs() { q -c "select coalesce(string_agg(proname || '(' || pg_get_function_identity_arguments(oid) || ') kind=' || prokind::text || ' oid=' || oid || ' ctid=' || ctid || ' xmin=' || xmin, E'\n        ' order by proname, oid), '(none)') from pg_proc where pronamespace = to_regnamespace('os')"; }
# the runner's own way: the text travels as a setting, plpgsql EXECUTE runs it, inside the runner's transaction
wrap() { # $1 = label, $2 = file text
  local out
  out=$(psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 -v body="$2" <<'SQL' 2>&1
begin;
select set_config('os_chain.file', :'body', true) is not null;
do $w$ begin execute current_setting('os_chain.file'); end $w$;
commit;
SQL
)
  echo "-- $1"; echo "$out" | grep -v '^t$' | sed 's/^/     /' | cut -c1-260
  echo "     os holds: $(procs)"
}
echo "== M0 the target"; psql "$ADMIN" -X -q -A -t -c "select version()" -c "select system_identifier from pg_control_system()" | cut -c1-80
psql "$ADMIN" -X -q -c "drop database if exists $DB" -c "create database $DB"
q -c "create schema os"

echo "== M1 a function file through the wrapper: what CREATE OR REPLACE does to pg_proc"
A1='create or replace function os.a() returns text language plpgsql as $f$ begin return $s$one; commit;$s$; end $f$;'
wrap "a. a new function" "$A1"
wrap "b. the same text again: same oid? another ctid?" "$A1"
wrap "c. a second file makes b; a's row untouched?" 'create or replace function os.b(n integer) returns integer language sql begin atomic select n + 1; end;'
wrap "d. a file that also revokes, grants and comments on its own function: only its own row moves?" 'create or replace function os.b(n integer) returns integer language sql begin atomic select n + 2; end; revoke all on function os.b(integer) from public; grant execute on function os.b(integer) to pg_monitor; comment on function os.b(integer) is $c$b$c$;'
wrap "e. a file that grants on ANOTHER function: the other row moves" 'create or replace function os.b(n integer) returns integer language sql begin atomic select n + 3; end; grant execute on function os.a() to pg_monitor;'
wrap "f. changed argument types: a second signature beside the first" 'create or replace function os.a(n integer) returns text language plpgsql as $f$ begin return n::text; end $f$;'
q -c "drop function os.a(integer)"
wrap "g. changed return type" 'create or replace function os.a() returns integer language plpgsql as $f$ begin return 1; end $f$;'
wrap "h. renamed input parameter" 'create or replace function os.b(m integer) returns integer language sql begin atomic select m + 1; end;'
wrap "i. a file that drops another function" 'create or replace function os.c() returns void language plpgsql as $f$ begin null; end $f$; drop function os.a();'
wrap "j. a procedure and an aggregate are rows of pg_proc too" 'create or replace procedure os.p() language plpgsql as $f$ begin null; end $f$; create or replace aggregate os.agg(integer) (sfunc = int4pl, stype = integer);'
wrap "k. two files in ONE transaction would be: (shown as one text) replace b twice — ctid moves each time?" 'create or replace function os.b(n integer) returns integer language sql begin atomic select n + 4; end; create or replace function os.b(n integer) returns integer language sql begin atomic select n + 5; end;'
echo "-- l. inside one transaction: the rows before a file and after it (what a per-file check would read)"
psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 <<'SQL' 2>&1 | sed 's/^/     /' | cut -c1-260
begin;
select 'xid=' || pg_current_xact_id();
create temp table before_file on commit drop as select oid, ctid::text as at, proname from pg_proc where pronamespace = 'os'::regnamespace;
select set_config('os_chain.file', 'create or replace function os.c() returns void language plpgsql as $f$ begin perform 1; end $f$; revoke all on function os.c() from public;', true) is not null;
do $w$ begin execute current_setting('os_chain.file'); end $w$;
select 'moved or new: ' || coalesce(string_agg(p.proname, ',' order by p.proname), '(none)') from pg_proc p where p.pronamespace = 'os'::regnamespace and not exists (select 1 from before_file b where b.oid = p.oid and b.at = p.ctid::text);
select 'gone: ' || coalesce(string_agg(b.proname, ','), '(none)') from before_file b where not exists (select 1 from pg_proc p where p.oid = b.oid);
commit;
SQL

echo "== M2 what needs a function to stand when it is made"
q -c "create table os.t(id int primary key, note text)"
echo "-- a trigger on a function that does not stand:"; q -c "create trigger t_trg before insert on os.t for each row execute function os.nowhere()"
echo "-- a policy that calls one:"; q -c "create policy p on os.t using (os.nowhere2())"
echo "-- a column default that calls one:"; q -c "alter table os.t add column d text default os.nowhere3()"
echo "-- a plpgsql function whose body calls one that does not stand:"; q -c "create function os.calls_later() returns int language plpgsql as \$f\$ begin return os.not_yet(); end \$f\$" -c "select 'made'"
echo "-- a sql function with a string body that calls one that does not stand:"; q -c "create function os.calls_later_sql() returns int language sql as \$f\$ select os.not_yet() \$f\$"
echo "-- CREATE OR REPLACE over a function a trigger uses keeps the trigger:"
q -c "create function os.trg() returns trigger language plpgsql as \$f\$ begin new.note := 'v1'; return new; end \$f\$" -c "create trigger t_trg before insert on os.t for each row execute function os.trg()" -c "create or replace function os.trg() returns trigger language plpgsql as \$f\$ begin new.note := 'v2'; return new; end \$f\$" -c "insert into os.t(id) values (1) returning note"
echo "-- DROP FUNCTION while a trigger uses it:"; q -c "drop function os.trg()"

echo "== M3 a vocabulary made equal to rows that arrive as one jsonb value"
q -c "create table os.event_types(name text primary key, description text not null, weight integer not null default 0, tags text[] not null default '{}', meta jsonb, live boolean not null default true, seen_at timestamptz, seen_count bigint not null default 0)"
UPSERT="insert into os.event_types as t (name, description, weight, tags, meta) select name, description, weight, tags, meta from jsonb_populate_recordset(null::os.event_types, :'rows'::jsonb) on conflict (name) do update set description = excluded.description, weight = excluded.weight, tags = excluded.tags, meta = excluded.meta where (t.description, t.weight, t.tags, t.meta) is distinct from (excluded.description, excluded.weight, excluded.tags, excluded.meta) returning name"
DELETE="delete from os.event_types t where not exists (select 1 from jsonb_populate_recordset(null::os.event_types, :'rows'::jsonb) f where f.name = t.name) returning name"
DIFF="with f as (select name, description, weight, tags, meta from jsonb_populate_recordset(null::os.event_types, :'rows'::jsonb)), t as (select name, description, weight, tags, meta from os.event_types) select 'differ=' || (select count(*) from ((select * from t except select * from f) union all (select * from f except select * from t)) d) || ' table=' || (select count(*) from t) || ' file=' || (select count(*) from f)"
R1='[{"name":"job.opened","description":"a job was opened","weight":1,"tags":["job"],"meta":{"k":1}},{"name":"job.closed","description":"a job was closed","weight":2,"tags":[],"meta":null}]'
echo "-- a. first reconcile (rows written):"; qv "$R1" "$UPSERT" "$DELETE" "$DIFF"
q -c "select name || ' meta is sql null=' || (meta is null) || ' live=' || live || ' seen_count=' || seen_count from os.event_types order by name"
echo "-- b. the same again (rows written — none means no row was rewritten):"; qv "$R1" "$UPSERT" "$DELETE" "$DIFF"
echo "-- c. a column the file does not own is changed by a process, then the pass runs: kept?"
q -c "update os.event_types set seen_at = '2026-01-01T00:00:00Z', seen_count = 7 where name = 'job.opened'"
R2='[{"name":"job.opened","description":"a job was OPENED","weight":1,"tags":["job","x"],"meta":{"k":2}},{"name":"job.held","description":"held","weight":3,"tags":[],"meta":null}]'
qv "$R2" "$UPSERT" "$DELETE" "$DIFF"
q -c "select name || ' | ' || description || ' | ' || tags::text || ' | ' || coalesce(meta::text,'NULL') || ' | seen_count=' || seen_count || ' seen_at=' || coalesce(seen_at::text,'NULL') from os.event_types order by name"
echo "-- d. a key the table has no column for is ignored in silence by jsonb_populate_recordset:"; q -c "select name, description from jsonb_populate_recordset(null::os.event_types, '[{\"name\":\"x\",\"descripton\":\"typo\"}]'::jsonb)"
echo "-- e. a value of the wrong type:"; qv '[{"name":"x","description":"d","weight":"heavy","tags":[],"meta":null}]' "$UPSERT"
echo "-- f. a key twice in one file:"; qv '[{"name":"x","description":"d","weight":1,"tags":[],"meta":null},{"name":"x","description":"e","weight":1,"tags":[],"meta":null}]' "$UPSERT"
echo "-- g. a not-null column given null:"; qv '[{"name":"x","description":null,"weight":1,"tags":[],"meta":null}]' "$UPSERT"
echo "-- h. the table's primary key columns, from the catalogue:"; q -c "select string_agg(a.attname, ',' order by k.ord) from pg_index i, unnest(i.indkey) with ordinality as k(attnum, ord), pg_attribute a where i.indrelid = 'os.event_types'::regclass and i.indisprimary and a.attrelid = i.indrelid and a.attnum = k.attnum"
echo "-- i. a json (not jsonb) column in the comparison:"; q -c "create table os.j(name text primary key, body json)" -c "select * from os.j except select * from os.j"

echo "== M4 a vocabulary that references another: order, and what a removal in use meets"
q -c "create table os.handlers(name text primary key, event_type text not null references os.event_types(name))" -c "insert into os.handlers values ('h1','job.held')"
echo "-- removing a value that is in use (NO ACTION):"; q -c "delete from os.event_types where name = 'job.held'"
echo "-- child inserted before its parent stands, two statements:"; q -c "insert into os.handlers values ('h2','job.new')"
echo "-- both in ONE statement (data-modifying CTE), child first:"; q -c "with c as (insert into os.handlers values ('h2','job.new') returning 1), p as (insert into os.event_types(name, description) values ('job.new','new') returning 1) select (select count(*) from c) + (select count(*) from p)"
echo "-- the references among a set of tables, from the catalogue (referencing -> referenced):"; q -c "select conrelid::regclass || ' -> ' || confrelid::regclass from pg_constraint where contype = 'f' and conrelid = any (array['os.handlers','os.event_types']::regclass[]) and confrelid = any (array['os.handlers','os.event_types']::regclass[])"
echo "-- a table with no primary key:"; q -c "create table os.nokey(name text)" -c "select count(*) from pg_index where indrelid = 'os.nokey'::regclass and indisprimary"

psql "$ADMIN" -X -q -c "drop database $DB"
echo "== done; throwaway database dropped: $(psql "$ADMIN" -X -q -A -t -c "select count(*) from pg_database where datname = '$DB'") left"
