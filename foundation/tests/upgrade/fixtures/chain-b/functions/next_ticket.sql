create or replace function os.next_ticket(prefix text default 'T-')
returns text language sql volatile
as $f$select prefix || nextval('os.ticket_seq')::text$f$;
