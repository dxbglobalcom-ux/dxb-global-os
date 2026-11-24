-- What a build may change outside os (piece 6c, SPEC §6 "The fixtures"): revision B of the fixture chain (piece 6b),
-- then this file, as the installer — one of each thing 6a left to this piece by name, and nothing in os. Kept as
-- small as the kinds allow: every object here is a line or more of expected/further.outside.txt, written by hand.
-- Nothing here changes how a later session of the tests behaves: no timeout, no setting of the installer's.
--
-- A table outside with a foreign key (its four internal triggers) and a text column (its toast relation), in the
-- schema 0004 made; a policy to public on it; it is added to the platform's publication.
create table snap_elsewhere.linked (probe integer references public.snap_probe, note text);
create policy linked_read on snap_elsewhere.linked for select to public using (true);
alter publication supabase_realtime add table snap_elsewhere.linked;
-- A publication of its own.
create publication further_pub;
-- An event trigger and its function.
create function snap_elsewhere.further_event() returns event_trigger language plpgsql as $$ begin end $$;
create event trigger further_event on ddl_command_end execute function snap_elsewhere.further_event();
-- A comment on a platform schema: a row that stood before the build, changed.
comment on schema public is 'further: a comment on a platform schema';
-- A grant to PUBLIC on a platform schema; a grant to a platform role on a platform table.
grant usage on schema extensions to public;
grant select on auth.schema_migrations to anon;
-- A role not named os_…, and the membership nobody writes.
create role further_role nologin;
-- A setting of a platform role.
alter role authenticated set application_name = 'further';
-- A row written into a platform table, and a platform sequence drawn from.
insert into supabase_migrations.schema_migrations (version, name) values ('20261124000006', 'further');
select pg_catalog.nextval('realtime.subscription_id_seq');
