-- @ read: owner and stored ACL of os.next_ticket and of schema os; oid/ctid of the function row
select 'function', p.oid::regprocedure::text, pg_catalog.pg_get_userbyid(p.proowner), p.proacl::text, p.ctid::text, md5(p.prosrc) from pg_catalog.pg_proc p where p.oid = 'os.next_ticket'::regproc
union all select 'schema', n.nspname, pg_catalog.pg_get_userbyid(n.nspowner), n.nspacl::text, n.ctid::text, '' from pg_catalog.pg_namespace n where n.nspname = 'os';
