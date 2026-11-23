-- The variant refused-when-populated (piece 6b, SPEC §6): A, then a column not null without a default. On an empty
-- os.parts it stands; on one that holds a row the server refuses it.
set local role os_owner;
alter table os.parts add column must integer not null;
