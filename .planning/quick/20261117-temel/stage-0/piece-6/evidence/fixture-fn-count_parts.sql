create or replace function os.count_parts(min_qty integer)
returns bigint language sql stable strict security definer
set work_mem = '8MB' set search_path = ''
as $f$ select count(*) from os.parts where qty >= min_qty $f$;
grant execute on function os.count_parts(integer) to os_reader, os_engine;
