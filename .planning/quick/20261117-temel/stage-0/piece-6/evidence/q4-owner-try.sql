-- @ Q4.4a as the installer: alter function os.next_ticket owner to os_engine
alter function os.next_ticket(text, integer, double precision) owner to os_engine;
-- @ Q4.4b as the installer, set role os_owner first: alter … owner to os_engine
begin; set local role os_owner; alter function os.next_ticket(text, integer, double precision) owner to os_engine; rollback;
-- @ Q4.4c as the installer: alter schema os owner to postgres
alter schema os owner to postgres;
