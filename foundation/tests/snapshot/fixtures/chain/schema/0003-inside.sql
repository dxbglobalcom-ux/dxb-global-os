-- The snapshot's fixture chain (piece 6a, SPEC §6), inside os: one of each kind the text must read, made as the
-- owner. The real chain's 0001 and 0002 stand before it, byte for byte. Kept as small as SPEC §6 allows: every
-- object here is a line or more of expected/fixture.snapshot.txt, written by hand.
set local role os_owner;
create table os.kinds (
  name text primary key,
  label text not null,
  weight double precision not null
);
comment on table os.kinds is 'vocabulary: kinds of parts';
create table os.parts (
  id bigint generated always as identity (start with 10 increment by 10) primary key,
  code text not null,
  qty integer not null default 1 constraint parts_qty_check check (qty > 0),
  ratio4 real default 0.1,
  ratio8 double precision default 1e-7,
  amount numeric(12,4) default 1.0/3,
  kind text references os.kinds (name) on delete restrict
) with (fillfactor = 90, autovacuum_enabled = false);
comment on table os.parts is E'parts of the fixture,\nin two lines';
create index parts_kind_idx on os.parts (kind) where qty > 1;
create sequence os.ticket_seq start 100 increment 5 cache 1;
-- The trigger's function, in a first form so the trigger can stand: functions/parts_touch.sql holds it.
create function os.parts_touch() returns trigger language plpgsql as $$ begin return new; end $$;
create trigger parts_touch before insert or update on os.parts for each row execute function os.parts_touch();
alter table os.parts enable row level security;
alter table os.parts force row level security;
create policy parts_read on os.parts for select to os_reader using (qty > 0);
create policy parts_write on os.parts as restrictive for insert to os_engine with check (code <> '');
create view os.parts_view as select id, ratio8 * 2 as twice from os.parts where qty > 0;
create type os.mood as enum ('calm', 'busy');
create domain os.code as text check (value ~ '^[A-Z]');
create collation os.bytes (provider = libc, locale = 'C');
grant usage on schema os to os_engine, os_intake, os_reader;
grant select on os.parts to os_reader;
grant insert on os.parts to os_engine with grant option;
grant update (qty) on os.parts to os_intake;
grant usage on sequence os.ticket_seq to os_engine;
grant usage on type os.mood to os_reader;
-- Last, so that it reaches no object made above.
alter default privileges in schema os grant select on tables to os_reader;
