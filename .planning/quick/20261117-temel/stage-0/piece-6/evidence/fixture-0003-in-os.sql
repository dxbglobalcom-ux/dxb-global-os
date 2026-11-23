-- Piece 6 measuring fixture: one of every kind the snapshot must see, inside os, made as the owner.
set local role os_owner;
create table os.kinds (
  name text primary key,
  label text not null,
  weight double precision not null
);
comment on table os.kinds is 'vocabulary: kinds of parts';
create table os.parts (
  id bigint generated always as identity (start with 10 increment by 10) primary key,
  code text not null unique,
  qty integer not null default 1 check (qty > 0),
  ratio4 real default 0.1,
  ratio8 double precision default 1e-7,
  amount numeric(12,4) default 1.0/3,
  created_at timestamptz not null default now(),
  kind text references os.kinds(name) on delete restrict,
  constraint parts_code_shape check (code ~ '^[A-Z]')
) with (fillfactor = 90, autovacuum_enabled = false);
create index parts_kind_idx on os.parts (kind, qty desc) where qty > 1;
comment on column os.parts.code is 'the code';
create sequence os.ticket_seq start 100 increment 5 cache 1;
-- the trigger's function: made here so the trigger can stand; the functions pass holds it in functions/.
create function os.parts_touch() returns trigger language plpgsql as $$ begin return new; end $$;
create trigger parts_touch before insert or update on os.parts for each row execute function os.parts_touch();
alter table os.parts enable row level security;
alter table os.parts force row level security;
create policy parts_read on os.parts for select to os_reader using (qty > 0);
create policy parts_write on os.parts as restrictive for insert to os_engine, os_executor with check (code <> '');
create view os.parts_view as select id, code, qty, ratio8 * 2 as twice from os.parts where qty > 0;
create type os.mood as enum ('calm', 'busy');
grant usage on schema os to os_reader, os_engine, os_executor, os_intake;
grant select on os.parts to os_reader;
grant select (code, qty), insert (code, qty) on os.parts to os_intake;
grant select, insert, update on os.parts to os_engine with grant option;
grant usage, select on sequence os.ticket_seq to os_engine;
grant select on os.parts_view to os_reader;
grant usage on type os.mood to os_reader;
alter default privileges in schema os grant select on tables to os_reader;
