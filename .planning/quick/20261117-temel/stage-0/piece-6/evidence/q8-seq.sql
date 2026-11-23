-- @ Q8.4 sequence parameters (pg_sequence) and the volatile part: last_value read from the relation (the installer reads it through pg_read_all_data), before / after a nextval in a ROLLED-BACK transaction
select s.seqrelid::regclass::text, s.seqstart, s.seqincrement, s.seqmin, s.seqmax, s.seqcache, s.seqcycle, (select last_value::text || ' called=' || is_called::text from os.ticket_seq) as before from pg_catalog.pg_sequence s where s.seqrelid = 'os.ticket_seq'::regclass;
-- @ Q8.4a nextval as the owner, then rollback
begin; set local role os_owner; select nextval('os.ticket_seq'); rollback;
-- @ Q8.4b after the rollback: the sequence moved anyway (not transactional); pg_sequence unchanged
select (select last_value::text || ' called=' || is_called::text from os.ticket_seq) as after, s.seqstart, s.seqincrement from pg_catalog.pg_sequence s where s.seqrelid = 'os.ticket_seq'::regclass;
