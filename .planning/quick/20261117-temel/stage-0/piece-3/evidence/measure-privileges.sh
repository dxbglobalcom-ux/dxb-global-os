#!/usr/bin/env bash
# Which privileges a schema and a table made by the installing role receive, on the foundation's own bench.
ADMIN="postgresql://postgres:postgres@127.0.0.1:54522/postgres"
echo "== default privileges of role postgres in the instance's postgres database"
psql "$ADMIN" -X -q -A -t -c "select coalesce(n.nspname,'(every schema)'), pg_get_userbyid(d.defaclrole), d.defaclobjtype, d.defaclacl from pg_default_acl d left join pg_namespace n on n.oid=d.defaclnamespace where pg_get_userbyid(d.defaclrole)='postgres' order by 1,3"
echo "== a schema and a table made there by postgres, in a transaction rolled back"
psql "$ADMIN" -X -q -A -t <<'SQL' 2>&1
begin;
create schema os_chain_probe;
create table os_chain_probe.ledger (position integer primary key);
select 'schema acl=' || coalesce(nspacl::text,'(null: owner only)') from pg_namespace where nspname='os_chain_probe';
select 'table acl=' || coalesce(relacl::text,'(null: owner only)') || ' owner=' || pg_get_userbyid(relowner) from pg_class where oid='os_chain_probe.ledger'::regclass;
select 'event triggers: ' || coalesce(string_agg(evtname || ':' || evtevent, ', '),'none') from pg_event_trigger;
rollback;
select 'left: ' || count(*) from pg_namespace where nspname='os_chain_probe';
SQL
echo "== the same in a throwaway database from the template, with a default privilege planted"
psql "$ADMIN" -X -q -c "create database chain_measure_m2"
psql "postgresql://postgres:postgres@127.0.0.1:54522/chain_measure_m2" -X -q -A -t <<'SQL' 2>&1
select 'default acls here: ' || count(*) from pg_default_acl;
select 'event triggers here: ' || coalesce(string_agg(evtname, ', '),'none') from pg_event_trigger;
alter default privileges for role postgres grant select on tables to pg_monitor;
alter default privileges for role postgres grant usage on schemas to pg_monitor;
create schema os_chain_probe; create table os_chain_probe.ledger (position integer primary key);
select 'with a planted default: schema acl=' || coalesce(nspacl::text,'(null)') from pg_namespace where nspname='os_chain_probe';
select 'with a planted default: table acl=' || coalesce(relacl::text,'(null)') from pg_class where oid='os_chain_probe.ledger'::regclass;
revoke all on schema os_chain_probe from pg_monitor; revoke all on os_chain_probe.ledger from pg_monitor;
select 'after a revoke by name: ' || coalesce(nspacl::text,'(null)') || ' / ' || coalesce(relacl::text,'(null)') from pg_namespace n, pg_class c where n.nspname='os_chain_probe' and c.oid='os_chain_probe.ledger'::regclass;
select 'plpgsql here: ' || count(*) from pg_language where lanname='plpgsql';
SQL
psql "$ADMIN" -X -q -c "drop database chain_measure_m2"
psql "$ADMIN" -X -q -A -t -c "select 'databases now: ' || string_agg(datname, ',' order by datname) from pg_database"
