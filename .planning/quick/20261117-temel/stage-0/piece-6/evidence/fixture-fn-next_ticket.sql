create or replace function os.next_ticket(prefix text default 'T-', width integer default 6, scale double precision default 0.1)
returns text language sql volatile parallel unsafe as $f$
  select prefix || lpad(nextval('os.ticket_seq')::text, width, '0') || (scale * 1)::text
$f$;
