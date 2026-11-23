-- @ Q6b each outside-os change tried alone as the installer, rolled back: which the installer may make
-- @ comment on schema public
begin; comment on schema public is 'h6'; rollback;
-- @ comment on a platform table (auth.users)
begin; comment on table auth.users is 'h6'; rollback;
-- @ comment on the database
begin; comment on database postgres is 'h6'; rollback;
-- @ comment on role anon
begin; comment on role anon is 'h6'; rollback;
-- @ alter a platform object: add a column to auth.users
begin; alter table auth.users add column h6 int; rollback;
-- @ alter a platform function owned by postgres in public (first one)
begin; select p.oid::regprocedure from pg_proc p where pronamespace='public'::regnamespace and pg_get_userbyid(proowner)='postgres' limit 1; rollback;
-- @ create publication
begin; create table public.h6_t(id int primary key); create publication h6_pub for table public.h6_t; rollback;
-- @ alter publication supabase_realtime add table
begin; create table public.h6_t(id int primary key); alter publication supabase_realtime add table public.h6_t; rollback;
-- @ create event trigger
begin; create function public.h6_et() returns event_trigger language plpgsql as $$ begin end $$; create event trigger h6_et on ddl_command_end execute function public.h6_et(); rollback;
-- @ alter database set
begin; alter database postgres set h6.x = '1'; rollback;
-- (alter role all in database postgres set h6.x = '1' — crashed the server with signal 11 in the first run: see q6b-try-first-run-crashed.out; tried alone in q6b-segv.out)
-- @ alter role anon set
begin; alter role anon set h6.x = '1'; rollback;
-- @ create role
begin; create role h6_role nologin; rollback;
-- @ grant on public schema to PUBLIC (create)
begin; grant create on schema public to public; rollback;
-- @ grant to a platform role anon on a new public table
begin; create table public.h6_t(id int); grant select on public.h6_t to anon; rollback;
-- @ grant execute on an os function to public
begin; set local role os_owner; grant execute on function os.count_parts(integer) to public; rollback;
-- @ grant on os schema to a platform role
begin; set local role os_owner; grant usage on schema os to authenticated; rollback;
-- @ grant os_reader to anon (membership)
begin; grant os_reader to anon; rollback;
-- @ grant anon to os_reader (membership)
begin; grant anon to os_reader; rollback;
-- @ alter default privileges for role postgres in public granting to os_reader
begin; alter default privileges in schema public grant select on tables to os_reader; rollback;
-- @ create extension in os (pg_trgm)
begin; create extension if not exists pg_trgm schema os; rollback;
-- @ security label
begin; security label on schema public is 'x'; rollback;
-- @ alter system
alter system set work_mem = '5MB';
-- @ grant set on parameter
begin; grant set on parameter work_mem to os_reader; rollback;
-- @ create schema outside os
begin; create schema h6_elsewhere; rollback;
-- @ large object
begin; select lo_create(0) is not null as made; rollback;
-- @ create database
create database h6_db;
-- @ installer can read pg_authid? (counts only)
select count(*) as roles, count(*) filter (where rolpassword is not null) as with_password from pg_authid;
-- @ has_table_privilege pg_authid
select has_table_privilege('pg_authid','select'), pg_has_role('pg_read_all_data','member'), (select string_agg(b.rolname,',' order by b.rolname) from pg_auth_members m join pg_roles b on b.oid=m.roleid where m.member='postgres'::regrole);
