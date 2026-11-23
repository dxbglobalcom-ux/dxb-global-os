-- The rows given (piece 6b, SPEC §6) on revision A, by the bench's superuser: one statement a line, each sent alone.
-- Five rows of os.parts — P-1 leaves qty and the three numeric columns to their defaults, P-3 holds nulls, P-4's code
-- holds a newline, a backslash, a carriage return and a letter outside ASCII; every kind named is one B keeps — and
-- os.ticket_seq drawn from three times.
insert into os.parts (code, kind) values ('P-1', 'bolt');
insert into os.parts (code, qty, ratio4, ratio8, amount, kind) values ('P-2', 2, 0.5, 0.30000000000000004, 12.5, 'nut');
insert into os.parts (code, qty, ratio4, ratio8, amount, kind) values ('P-3', 3, null, null, null, null);
insert into os.parts (code, qty, ratio4, ratio8, amount, kind) values (E'P-4 one\ntwo\\three\rfour ş', 4, 1.25, -2.5e-8, -7.0001, 'bolt');
insert into os.parts (code, qty, ratio4, ratio8, amount, kind) values ('P-5', 5, -0.75, 100, 0, 'nut');
select pg_catalog.nextval('os.ticket_seq');
select pg_catalog.nextval('os.ticket_seq');
select pg_catalog.nextval('os.ticket_seq');
