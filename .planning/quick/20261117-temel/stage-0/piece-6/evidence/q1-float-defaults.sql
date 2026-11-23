-- @ !make, rolled back at the end
begin; set local role os_owner;
create function os.q1g(y float8 default 0.30000000000000004, z float4 default 0.1, w float8 default 1e-7) returns int language sql as $f$ select 1 $f$;
create table os.q1q (y float8 default 0.30000000000000004, z float4 default '0.1', w float8 default '1e-7'::float8);
reset role;
-- @ Q1.9 a float default folded into a float Const (function argument default; a table default given as a quoted literal) under extra_float_digits 0, 1, 3
select s.efd, pg_catalog.set_config('extra_float_digits', s.efd::text, true) is not null as set, pg_get_function_arguments('os.q1g'::regproc) as fn_args,
       (select string_agg(pg_get_expr(adbin, adrelid), ' ; ' order by adnum) from pg_attrdef where adrelid = 'os.q1q'::regclass) as table_defaults
  from (values (0), (1), (3)) s(efd);
-- @ Q1.9b the same, each in its own statement (set_config in a row is ordered with the select list only per row)
set local extra_float_digits = 0;
select 0 as efd, pg_get_function_arguments('os.q1g'::regproc), (select string_agg(pg_get_expr(adbin, adrelid), ' ; ' order by adnum) from pg_attrdef where adrelid = 'os.q1q'::regclass);
-- @ Q1.9c
set local extra_float_digits = 1;
select 1 as efd, pg_get_function_arguments('os.q1g'::regproc), (select string_agg(pg_get_expr(adbin, adrelid), ' ; ' order by adnum) from pg_attrdef where adrelid = 'os.q1q'::regclass);
-- @ Q1.9d
set local extra_float_digits = 3;
select 3 as efd, pg_get_function_arguments('os.q1g'::regproc), (select string_agg(pg_get_expr(adbin, adrelid), ' ; ' order by adnum) from pg_attrdef where adrelid = 'os.q1q'::regclass);
-- @ !end
rollback;
