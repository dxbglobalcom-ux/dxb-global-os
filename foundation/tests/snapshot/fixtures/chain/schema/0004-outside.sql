-- The snapshot's fixture chain (piece 6a, SPEC §6), outside os, as the installer: a table of public granted to a
-- login with a policy naming it, and a schema with a table the owner of os owns. The table there has a trigger whose
-- function lives in os: this file makes that function again in its first form, as a schema file that needs a
-- function does (piece 4's rule), and the functions pass replaces it — so a copy of the chain without
-- functions/parts_touch.sql leaves the first form standing (SPEC §6 C).
create table public.snap_probe (id integer primary key, who text);
grant select on public.snap_probe to os_reader;
alter table public.snap_probe enable row level security;
create policy snap_probe_reader on public.snap_probe for select to os_reader using (true);
create schema snap_elsewhere;
grant usage, create on schema snap_elsewhere to os_owner;
create table snap_elsewhere.owned (id integer, qty integer);
alter table snap_elsewhere.owned owner to os_owner;
set local role os_owner;
create or replace function os.parts_touch() returns trigger language plpgsql as $$ begin return new; end $$;
create trigger owned_touch before insert on snap_elsewhere.owned for each row execute function os.parts_touch();
reset role;
