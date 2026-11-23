-- @ Q7.0 the session's default extra_float_digits and its source
select setting, source, sourcefile is not null as from_a_file from pg_settings where name = 'extra_float_digits';
-- @ Q7 extra_float_digits = 0 — server text (cast to text): f4 0.1 | f4 1e-7 | f4 1/3 | f8 0.1 | f8 1e-7 | f8 1/3 | f8 0.1+0.2 | num 0.1 | num 1e-7 | num 1/3
set extra_float_digits = 0;
select 0.1::float4::text, 1e-7::float4::text, (1::float4/3::float4)::text, 0.1::float8::text, 1e-7::float8::text, (1::float8/3)::text, (0.1::float8+0.2::float8)::text, 0.1::numeric::text, 1e-7::numeric::text, (1::numeric/3)::text;
-- @ Q7 extra_float_digits = 0 — to_jsonb(f4 1/3) | to_jsonb(f8 1/3) | to_jsonb(f8 0.1+0.2) | to_jsonb(f8 1e-7) | row_to_json(f4,f8,numeric 1/3)
select to_jsonb(1::float4/3::float4)::text, to_jsonb(1::float8/3)::text, to_jsonb(0.1::float8+0.2::float8)::text, to_jsonb(1e-7::float8)::text, row_to_json(r)::text from (select 1::float4/3::float4 as a, 1::float8/3 as b, 1::numeric/3 as c) r;
-- @ Q7 extra_float_digits = 0 — round trip through text: f4 1/3 | f8 1/3 | f8 0.1+0.2 | via to_jsonb f8 1/3 | via to_jsonb f4 1/3
select ((1::float4/3::float4)::text::float4 = 1::float4/3::float4)::text, ((1::float8/3)::text::float8 = 1::float8/3)::text, ((0.1::float8+0.2::float8)::text::float8 = 0.1::float8+0.2::float8)::text, ((to_jsonb(1::float8/3)#>>'{}')::float8 = 1::float8/3)::text, ((to_jsonb(1::float4/3::float4)#>>'{}')::float4 = 1::float4/3::float4)::text;
-- @ Q7 extra_float_digits = 1 — server text (cast to text): f4 0.1 | f4 1e-7 | f4 1/3 | f8 0.1 | f8 1e-7 | f8 1/3 | f8 0.1+0.2 | num 0.1 | num 1e-7 | num 1/3
set extra_float_digits = 1;
select 0.1::float4::text, 1e-7::float4::text, (1::float4/3::float4)::text, 0.1::float8::text, 1e-7::float8::text, (1::float8/3)::text, (0.1::float8+0.2::float8)::text, 0.1::numeric::text, 1e-7::numeric::text, (1::numeric/3)::text;
-- @ Q7 extra_float_digits = 1 — to_jsonb(f4 1/3) | to_jsonb(f8 1/3) | to_jsonb(f8 0.1+0.2) | to_jsonb(f8 1e-7) | row_to_json(f4,f8,numeric 1/3)
select to_jsonb(1::float4/3::float4)::text, to_jsonb(1::float8/3)::text, to_jsonb(0.1::float8+0.2::float8)::text, to_jsonb(1e-7::float8)::text, row_to_json(r)::text from (select 1::float4/3::float4 as a, 1::float8/3 as b, 1::numeric/3 as c) r;
-- @ Q7 extra_float_digits = 1 — round trip through text: f4 1/3 | f8 1/3 | f8 0.1+0.2 | via to_jsonb f8 1/3 | via to_jsonb f4 1/3
select ((1::float4/3::float4)::text::float4 = 1::float4/3::float4)::text, ((1::float8/3)::text::float8 = 1::float8/3)::text, ((0.1::float8+0.2::float8)::text::float8 = 0.1::float8+0.2::float8)::text, ((to_jsonb(1::float8/3)#>>'{}')::float8 = 1::float8/3)::text, ((to_jsonb(1::float4/3::float4)#>>'{}')::float4 = 1::float4/3::float4)::text;
-- @ Q7 extra_float_digits = 3 — server text (cast to text): f4 0.1 | f4 1e-7 | f4 1/3 | f8 0.1 | f8 1e-7 | f8 1/3 | f8 0.1+0.2 | num 0.1 | num 1e-7 | num 1/3
set extra_float_digits = 3;
select 0.1::float4::text, 1e-7::float4::text, (1::float4/3::float4)::text, 0.1::float8::text, 1e-7::float8::text, (1::float8/3)::text, (0.1::float8+0.2::float8)::text, 0.1::numeric::text, 1e-7::numeric::text, (1::numeric/3)::text;
-- @ Q7 extra_float_digits = 3 — to_jsonb(f4 1/3) | to_jsonb(f8 1/3) | to_jsonb(f8 0.1+0.2) | to_jsonb(f8 1e-7) | row_to_json(f4,f8,numeric 1/3)
select to_jsonb(1::float4/3::float4)::text, to_jsonb(1::float8/3)::text, to_jsonb(0.1::float8+0.2::float8)::text, to_jsonb(1e-7::float8)::text, row_to_json(r)::text from (select 1::float4/3::float4 as a, 1::float8/3 as b, 1::numeric/3 as c) r;
-- @ Q7 extra_float_digits = 3 — round trip through text: f4 1/3 | f8 1/3 | f8 0.1+0.2 | via to_jsonb f8 1/3 | via to_jsonb f4 1/3
select ((1::float4/3::float4)::text::float4 = 1::float4/3::float4)::text, ((1::float8/3)::text::float8 = 1::float8/3)::text, ((0.1::float8+0.2::float8)::text::float8 = 0.1::float8+0.2::float8)::text, ((to_jsonb(1::float8/3)#>>'{}')::float8 = 1::float8/3)::text, ((to_jsonb(1::float4/3::float4)#>>'{}')::float4 = 1::float4/3::float4)::text;
-- @ Q7.5 the reference rows of os.kinds as they stand, under 0: name | weight::text | to_jsonb
set extra_float_digits = 0; select name, weight::text, to_jsonb(k)::text from os.kinds k order by name;
-- @ Q7.5b under 3
set extra_float_digits = 3; select name, weight::text, to_jsonb(k)::text from os.kinds k order by name;
