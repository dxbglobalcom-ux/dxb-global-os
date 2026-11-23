-- The variant refused-when-populated (piece 6b, SPEC §6): A, then a column not null without a default. On an empty
-- os.parts it stands; on one that holds a row the server refuses it.
-- Before the refused statement (SPEC §10.1 row 9) it writes a row and draws once from os.ticket_seq, so that what the
-- refusal leaves is seen: the row is gone with the transaction; the sequence stays drawn (PostgreSQL's rule). The row
-- names its own id (`overriding system value`), so the identity's sequence is not drawn: the one drawn is named.
-- os.parts forces row security on its owner, whom no policy names: the force is lifted for the insert alone and put
-- back in the same file (piece 6b's SPEC §6a.5).
set local role os_owner;
alter table os.parts no force row level security;
insert into os.parts (id, code, kind) overriding system value values (60, 'P-6', 'bolt');
alter table os.parts force row level security;
select pg_catalog.nextval('os.ticket_seq');
alter table os.parts add column must integer not null;
