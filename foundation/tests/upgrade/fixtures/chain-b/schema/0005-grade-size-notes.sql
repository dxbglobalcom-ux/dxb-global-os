-- Revision B of the fixture chain (piece 6b, SPEC §6): a versioned change after A's four files, made as the owner.
-- Kept as small as §6 allows: every line it makes is a line of expected/b.snapshot.txt, written by hand.
set local role os_owner;
-- A column with a default and not null; a second one filled from each row's own values, then not null.
alter table os.parts add column grade integer not null default 3;
alter table os.parts add column size integer;
-- os.parts forces row security on its owner, whom no policy names: the update would see no row. Lifted for the
-- update alone and put back in the same transaction.
alter table os.parts no force row level security;
update os.parts set size = qty * 10;
alter table os.parts force row level security;
alter table os.parts alter column size set not null;
-- A CHECK the given rows satisfy, and an index.
alter table os.parts add constraint parts_size_check check (size > 0);
create index parts_code_idx on os.parts (code);
-- A table of his policy (no vocabulary mark), with one seeded row.
create table os.notes (note text not null);
insert into os.notes (note) values ('seeded by B');
-- os.next_ticket's signature changes (piece 4's rule): the old one is dropped — it stands only where the functions
-- pass of an earlier revision made it — and the new one is made in a first form; functions/next_ticket.sql holds it.
drop function if exists os.next_ticket(text, double precision);
create function os.next_ticket(prefix text default 'T-') returns text language sql volatile as $f$select prefix$f$;
