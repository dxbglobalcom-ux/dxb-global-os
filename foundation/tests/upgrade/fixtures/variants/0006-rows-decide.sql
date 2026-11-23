-- The variant C (piece 6b, SPEC §6): B, then a file that on an empty database changes nothing the snapshot reads.
-- On one that holds rows it changes a value of one row, deletes another, puts os.ticket_seq back to its start, and
-- makes an index — a structure that depends on the rows it meets.
set local role os_owner;
alter table os.parts no force row level security;
update os.parts set grade = 4 where code = 'P-2';
delete from os.parts where code = 'P-3';
alter sequence os.ticket_seq restart;
do $rows$ begin
  if exists (select from os.parts) then
    create index parts_grade_idx on os.parts (grade);
  end if;
end $rows$;
alter table os.parts force row level security;
