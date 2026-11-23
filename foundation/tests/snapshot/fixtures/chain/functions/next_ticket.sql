create or replace function os.next_ticket(prefix text default 'T-', scale double precision default 0.1)
returns text language sql volatile
as $f$select prefix || nextval('os.ticket_seq')::text || (scale * 1)::text$f$;
