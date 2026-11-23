#!/usr/bin/env bash
# Measurements for piece 4's corrections (SPEC §12), on the foundation's own bench, in a throwaway database made and dropped here.
set -u
ADMIN="postgresql://postgres:postgres@127.0.0.1:54522/postgres"
DB="chain_measure_p4c"
URL="postgresql://postgres:postgres@127.0.0.1:54522/$DB"
q() { psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 "$@" 2>&1 | cut -c1-300; }
s() { psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 2>&1 | sed 's/^/     /' | cut -c1-300; }   # statements by stdin, one session
psql "$ADMIN" -X -q -c "drop database if exists $DB" -c "create database $DB"
q -c "create schema os"

echo "== C1 a session put back after a function file: reset role, reset all — inside the runner's transaction"
s <<'SQL'
begin;
select 'before: role=' || current_user || ' search_path=' || current_setting('search_path') || ' client_encoding=' || current_setting('client_encoding') || ' timezone=' || current_setting('timezone');
set local client_encoding = 'LATIN1'; set search_path = os; set local statement_timeout = '5s'; set role pg_monitor; create temp table left_behind (id int);
select 'the file left: role=' || current_user || ' search_path=' || current_setting('search_path') || ' client_encoding=' || current_setting('client_encoding') || ' statement_timeout=' || current_setting('statement_timeout');
reset role; reset all;
select 'after reset role, reset all: role=' || current_user || ' search_path=' || current_setting('search_path') || ' client_encoding=' || current_setting('client_encoding') || ' statement_timeout=' || current_setting('statement_timeout') || ' temp table=' || (to_regclass('pg_temp.left_behind') is not null);
commit;
select 'after commit: role=' || current_user || ' search_path=' || current_setting('search_path') || ' client_encoding=' || current_setting('client_encoding');
SQL
echo "-- reset all as the role a file left (without reset role first):"
s <<'SQL'
begin; set role pg_monitor; set search_path = os; reset all; select 'role=' || current_user || ' search_path=' || current_setting('search_path'); rollback;
SQL
echo "-- a text of another encoding after the reset: é handed over as a parameter arrives as é?"
s <<'SQL'
begin; set local client_encoding = 'LATIN1'; reset role; reset all;
select 'client_encoding=' || current_setting('client_encoding') || ' length(é)=' || length('é') || ' bytes=' || octet_length('é');
rollback;
SQL

echo "== C2 pg_proc over every schema: how many rows, and where an unqualified create lands"
q -c "select 'rows of pg_proc: ' || count(*) from pg_catalog.pg_proc" -c "\timing on" -c "select count(*) from (select p.oid, p.ctid, p.proname, n.nspname from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid = p.pronamespace) x" | grep -v '^$'
q -c "create or replace function stray_here() returns int language sql as 'select 1'" -c "select 'unqualified create landed in: ' || pronamespace::regnamespace from pg_proc where proname = 'stray_here'" -c "drop function public.stray_here()"

echo "== C3 the references onto a table, with their actions"
q -c "create table os.event_types(name text primary key, description text not null, weight numeric not null default 0, note text not null default 'n', seen_count int not null default 0)" \
  -c "comment on table os.event_types is 'vocabulary: the event types the code emits'" \
  -c "create table os.rules(id int primary key, event text references os.event_types(name) on delete cascade)" \
  -c "create table os.logs(id int primary key, event text references os.event_types(name))" \
  -c "create table public.far(id int primary key, event text constraint far_event references os.event_types(name) on update cascade on delete set null)"
q -c "select k.conname || ' on ' || k.conrelid::regclass || ' del=' || k.confdeltype::text || ' upd=' || k.confupdtype::text from pg_catalog.pg_constraint k where k.contype = 'f' and k.confrelid = 'os.event_types'::regclass order by 1"
echo "-- the table's mark, read from the catalogue:"; q -c "select pg_catalog.obj_description('os.event_types'::regclass, 'pg_class')" -c "select coalesce(pg_catalog.obj_description('os.rules'::regclass, 'pg_class'), '(no comment)')"
q -c "drop table os.rules, os.logs, public.far"

echo "== C4 written as an update of rows that read differently and an insert of rows that are not there; equal by text"
F="pg_catalog.jsonb_populate_recordset(null::os.event_types, :'rows'::pg_catalog.jsonb)"
UPDATE="update only os.event_types t set description = f.description, weight = f.weight from $F f where f.name = t.name and (t.description::text, t.weight::text) is distinct from (f.description::text, f.weight::text) returning 'updated ' || t.name"
INSERT="insert into os.event_types (name, description, weight) select f.name, f.description, f.weight from $F f where not exists (select 1 from only os.event_types t where t.name = f.name) returning 'inserted ' || name"
DELETE="delete from only os.event_types t where not exists (select 1 from $F f where f.name = t.name) returning 'removed ' || name"
PROOF="select 'equal=' || ((select count(*) from only os.event_types) = (select count(*) from $F) and not exists (select name::text, description::text, weight::text from only os.event_types except select name::text, description::text, weight::text from $F) and not exists (select name::text, description::text, weight::text from $F except select name::text, description::text, weight::text from only os.event_types))"
qv() { local rows="$1"; shift; printf '%s;\n' "$@" | psql "$URL" -X -q -A -t -v ON_ERROR_STOP=0 -v rows="$rows" 2>&1 | sed 's/^/     /' | cut -c1-300; }
R1='[{"name":"a","description":"A","weight":1.1},{"name":"b","description":"B","weight":2}]'
echo "-- first: proof before (expect false), then write, remove, proof"; qv "$R1" "$PROOF" "$UPDATE" "$INSERT" "$DELETE" "$PROOF"
echo "-- the same again: nothing written"; qv "$R1" "$PROOF" "$UPDATE" "$INSERT" "$DELETE"
echo "-- 1.1 stands, the file says 1.10: read differently, so written"; qv '[{"name":"a","description":"A","weight":1.10},{"name":"b","description":"B","weight":2}]' "$PROOF" "$UPDATE" "$PROOF" "select 'a.weight=' || weight::text from os.event_types where name = 'a'"
echo "-- an unowned not-null column with no default: a standing row is changed, a new row is refused"
q -c "alter table os.event_types alter column note drop default"
qv '[{"name":"a","description":"A2","weight":1.10},{"name":"b","description":"B","weight":2}]' "$UPDATE" "$INSERT"
qv '[{"name":"a","description":"A2","weight":1.10},{"name":"b","description":"B","weight":2},{"name":"c","description":"C","weight":3}]' "$UPDATE" "$INSERT"
q -c "alter table os.event_types alter column note set default 'n'"
echo "-- a key twice in one file, found before any write:"; qv '[{"name":"a","description":"A","weight":1},{"name":"a","description":"A again","weight":1}]' "select 'twice: ' || f.name from $F f group by f.name having count(*) > 1"
echo "-- a column twice in one row, seen when the text is read as json:"; qv '[{"name":"a","weight":1,"weight":2}]' "select 'row ' || r.ord || ' names twice: ' || k.key from pg_catalog.json_array_elements(:'rows'::pg_catalog.json) with ordinality r(obj, ord), lateral (select key from pg_catalog.json_each(r.obj) group by key having count(*) > 1) k"
echo "-- an inheritance child's rows, with only:"; q -c "create table os.child() inherits (os.event_types)" -c "insert into os.child(name, description) values ('zz','child row')"
qv "$R1" "$DELETE" "$PROOF" "select 'child rows left: ' || count(*) from os.child"
q -c "drop table os.child"
echo "-- a deferrable primary key:"; q -c "create table os.defkey(name text, v int, primary key (name) deferrable initially deferred)" -c "insert into os.defkey values ('a', 1)"
q -c "update only os.defkey t set v = 2 where t.name = 'a' returning 'updated ' || name"
echo "-- a primary key with an included column: the key's columns by indnkeyatts"; q -c "create table os.incl(id int, label text, primary key (id) include (label))" \
  -c "select 'all of indkey: ' || string_agg(a.attname, ',' order by k.ord) from pg_index i, unnest(i.indkey::int2[]) with ordinality k(attnum, ord), pg_attribute a where i.indrelid = 'os.incl'::regclass and i.indisprimary and a.attrelid = i.indrelid and a.attnum = k.attnum" \
  -c "select 'key columns only: ' || string_agg(a.attname, ',' order by k.ord) from pg_index i, unnest(i.indkey::int2[]) with ordinality k(attnum, ord), pg_attribute a where i.indrelid = 'os.incl'::regclass and i.indisprimary and k.ord <= i.indnkeyatts and a.attrelid = i.indrelid and a.attnum = k.attnum"

echo "== C5 deferred work made immediate for the pass's transaction"
q -c "create table os.uses(id int primary key, event text constraint uses_event references os.event_types(name) deferrable initially deferred)" -c "insert into os.uses values (1, 'b')"
echo "-- without it: the removal passes, the commit fails"; s <<'SQL'
begin; delete from only os.event_types where name = 'b'; select 'the delete passed'; commit;
SQL
echo "-- with set constraints all immediate first: the statement fails"; s <<'SQL'
begin; set constraints all immediate; delete from only os.event_types where name = 'b'; select 'the delete passed'; rollback;
SQL
q -c "create function public.rewrites() returns trigger language plpgsql as \$f\$ begin update os.event_types set description = 'rewritten' where name = new.name; return null; end \$f\$" \
  -c "create constraint trigger late after insert on os.event_types deferrable initially deferred for each row execute function public.rewrites()"
echo "-- a deferred constraint trigger that rewrites the row: when does it fire?"; s <<'SQL'
begin; insert into os.event_types(name, description) values ('late1', 'as filed'); select 'default — before commit reads: ' || description from os.event_types where name = 'late1'; commit;
select 'default — after commit reads: ' || description from os.event_types where name = 'late1';
begin; set constraints all immediate; insert into os.event_types(name, description) values ('late2', 'as filed'); select 'immediate — before commit reads: ' || description from os.event_types where name = 'late2'; commit;
SQL

echo "== C6 row security off, and the time zone and date style said for the pass"
s <<'SQL'
begin; set local row_security = off; set local timezone = 'UTC'; set local datestyle = 'ISO, YMD';
select 'row_security=' || current_setting('row_security') || ' a time with no offset is read as: ' || ('2026-01-02 03:04:05'::timestamptz)::text || ' ; 01/02/2026 as: ' || ('2026-01-02'::date)::text;
rollback;
select 'the role bypasses row security: ' || rolbypassrls from pg_roles where rolname = current_user;
SQL

psql "$ADMIN" -X -q -c "drop database $DB"
echo "== done; throwaway database dropped: $(psql "$ADMIN" -X -q -A -t -c "select count(*) from pg_database where datname = '$DB'") left"
