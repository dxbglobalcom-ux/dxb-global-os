# B85 stage 0 piece 6c — M4: what each act writes (measured 2026-11-23 on the foundation's bench, the installer unless said)

The probe is `inventory2.cjs` (a line: `catalogue|identity|owner|acl|md5`; `<` a line gone, `>` a line new; a changed row is one of each).
It is NOT the product's text: it drops oid columns, reads pg_shdepend, names toast relations and internal triggers by their oid,
and prints the stored ACL (∅ for NULL). Read it for WHICH rows an act writes; spell the lines from SPEC §4.

## The real chain's own build (fresh → chain up)
```
> pg_attribute|index column os_chain.ledger_file_key.file||∅|7c4bbe440a1ce15f5f9e28c2ed783a3c
> pg_attribute|index column os_chain.ledger_pkey."position"||∅|02d294fbae2ca970c0ed3cb16a1834f1
> pg_attribute|index column pg_toast.pg_toast_20023_index.chunk_id||∅|c01085f6e68cd8515b7abde3e135d1f3
> pg_attribute|index column pg_toast.pg_toast_20023_index.chunk_seq||∅|e25c4364444561a44acb701bbb21376c
> pg_attribute|table column os_chain.ledger."position"||∅|7fb22065e6a4e19253976b352934ad01
> pg_attribute|table column os_chain.ledger.applied_at||∅|dd17140116914c4ad8304b1e9e72068a
> pg_attribute|table column os_chain.ledger.applied_by||∅|712631a4b96f07b1769d4bf86f9372f1
> pg_attribute|table column os_chain.ledger.cmax||∅|05bc9e995bf2929e09639fc54abde7e6
> pg_attribute|table column os_chain.ledger.cmin||∅|1bcc8536f88a76d7d8c7dceaab4d5652
> pg_attribute|table column os_chain.ledger.ctid||∅|9ba5e7d56371333f6759286e0e81641c
> pg_attribute|table column os_chain.ledger.file||∅|e20f94fce668b4b2f5b5c292f3352d15
> pg_attribute|table column os_chain.ledger.hash||∅|eca52b7283f6881a556721c2c373e5e3
> pg_attribute|table column os_chain.ledger.kind||∅|7808b6bae56be5f116e87e13f52e8c6c
> pg_attribute|table column os_chain.ledger.runner_version||∅|b24290c40569482d2c2cfde3058e932e
> pg_attribute|table column os_chain.ledger.tableoid||∅|1adc79286f3a3d4de9b5fbe7c4180701
> pg_attribute|table column os_chain.ledger.xmax||∅|dd32399d09b83eb0f66e7d8be494c952
> pg_attribute|table column os_chain.ledger.xmin||∅|60d92cc7f047983ed577c2603276d744
> pg_attribute|toast table column pg_toast.pg_toast_20023.chunk_data||∅|5d2c63aa959961049b2606391fedfd11
> pg_attribute|toast table column pg_toast.pg_toast_20023.chunk_id||∅|c01085f6e68cd8515b7abde3e135d1f3
> pg_attribute|toast table column pg_toast.pg_toast_20023.chunk_seq||∅|e25c4364444561a44acb701bbb21376c
> pg_attribute|toast table column pg_toast.pg_toast_20023.cmax||∅|05bc9e995bf2929e09639fc54abde7e6
> pg_attribute|toast table column pg_toast.pg_toast_20023.cmin||∅|1bcc8536f88a76d7d8c7dceaab4d5652
> pg_attribute|toast table column pg_toast.pg_toast_20023.ctid||∅|9ba5e7d56371333f6759286e0e81641c
> pg_attribute|toast table column pg_toast.pg_toast_20023.tableoid||∅|1adc79286f3a3d4de9b5fbe7c4180701
> pg_attribute|toast table column pg_toast.pg_toast_20023.xmax||∅|dd32399d09b83eb0f66e7d8be494c952
> pg_attribute|toast table column pg_toast.pg_toast_20023.xmin||∅|60d92cc7f047983ed577c2603276d744
> pg_auth_members|role membership membership of role postgres in role os_engine os_engine>postgres by supabase_admin|||b13255aad5fcd5ae43027a7a8568ce8d
> pg_auth_members|role membership membership of role postgres in role os_executor os_executor>postgres by supabase_admin|||b13255aad5fcd5ae43027a7a8568ce8d
> pg_auth_members|role membership membership of role postgres in role os_intake os_intake>postgres by supabase_admin|||b13255aad5fcd5ae43027a7a8568ce8d
> pg_auth_members|role membership membership of role postgres in role os_owner os_owner>postgres by postgres|||16fc675f744a97612a99a0ff417ca680
> pg_auth_members|role membership membership of role postgres in role os_owner os_owner>postgres by supabase_admin|||b13255aad5fcd5ae43027a7a8568ce8d
> pg_auth_members|role membership membership of role postgres in role os_reader os_reader>postgres by supabase_admin|||b13255aad5fcd5ae43027a7a8568ce8d
> pg_authid|role os_engine|||93a581a35de3c774fbd84efc1012887d
> pg_authid|role os_executor|||7cae8982791bd284afc462e42a82c7b8
> pg_authid|role os_intake|||a757a01db6bea28d870ae333b43f64b7
> pg_authid|role os_owner|||77a1145e118e8b800abe2854fa6485ba
> pg_authid|role os_reader|||50017e2cd220fec4df110eb2243545be
> pg_class|index os_chain.ledger_file_key|postgres|∅|5e8358cf5b6cb463dad25cacb6d82d14
> pg_class|index os_chain.ledger_pkey|postgres|∅|13ea4dfb0500d059700485b9b46ea66f
> pg_class|index pg_toast.pg_toast_20023_index|postgres|∅|53259146912187fcb59fa836970fe908
> pg_class|table os_chain.ledger|postgres|∅|39fabbf509e277bae2542711b97a2d7c
> pg_class|toast table pg_toast.pg_toast_20023|postgres|∅|e55320b6cb02a10e89835504ffe552b8
> pg_constraint|table constraint ledger_file_key on os_chain.ledger|||7d47bbd0797f9bc71fb8ff7c23d9e97e
> pg_constraint|table constraint ledger_hash_check on os_chain.ledger|||c017e4bf597664956364468268dc635b
> pg_constraint|table constraint ledger_kind_check on os_chain.ledger|||5345748f0a351fe06a881090af3e6bd7
> pg_constraint|table constraint ledger_pkey on os_chain.ledger|||d2053bf263a67576ea99a18d0c70b892
> pg_constraint|table constraint ledger_position_check on os_chain.ledger|||71a5be4f45cb59f11b44b9b6a2d98af9
> pg_default_acl|default acl for role os_owner on functions||os_owner=X/os_owner|baf9e1168562095329d1c28473f91496
> pg_default_acl|default acl for role os_owner on types||os_owner=U/os_owner|8ddd168d2d9d290220ce049324681ac9
> pg_depend|dep a index pg_toast.pg_toast_20023_index -> toast table column pg_toast.pg_toast_20023.chunk_id|||c9dae5ac6aa232410e7a39e2ffce2524
> pg_depend|dep a index pg_toast.pg_toast_20023_index -> toast table column pg_toast.pg_toast_20023.chunk_seq|||a71461a1e3649876fe053c56ce9a2aeb
> pg_depend|dep a table constraint ledger_file_key on os_chain.ledger -> table column os_chain.ledger.file|||a71461a1e3649876fe053c56ce9a2aeb
> pg_depend|dep a table constraint ledger_hash_check on os_chain.ledger -> table column os_chain.ledger.hash|||a0ab674651204a2b5c738334d390f459
> pg_depend|dep a table constraint ledger_kind_check on os_chain.ledger -> table column os_chain.ledger.kind|||e9a442a4dd6479c679d257b31c98fb7f
> pg_depend|dep a table constraint ledger_pkey on os_chain.ledger -> table column os_chain.ledger."position"|||c9dae5ac6aa232410e7a39e2ffce2524
> pg_depend|dep a table constraint ledger_position_check on os_chain.ledger -> table column os_chain.ledger."position"|||c9dae5ac6aa232410e7a39e2ffce2524
> pg_depend|dep i index os_chain.ledger_file_key -> table constraint ledger_file_key on os_chain.ledger|||eaf489afe73329fe138dba385d621809
> pg_depend|dep i index os_chain.ledger_pkey -> table constraint ledger_pkey on os_chain.ledger|||eaf489afe73329fe138dba385d621809
> pg_depend|dep i toast table pg_toast.pg_toast_20023 -> table os_chain.ledger|||eaf489afe73329fe138dba385d621809
> pg_depend|dep i type os_chain.ledger -> table os_chain.ledger|||eaf489afe73329fe138dba385d621809
> pg_depend|dep i type os_chain.ledger[] -> type os_chain.ledger|||eaf489afe73329fe138dba385d621809
> pg_depend|dep n table constraint ledger_hash_check on os_chain.ledger -> table column os_chain.ledger.hash|||3cbdcb89b5a637cdbd1286a5609b718c
> pg_depend|dep n table constraint ledger_kind_check on os_chain.ledger -> table column os_chain.ledger.kind|||4e6290580110574788890fc1bd6a12cb
> pg_depend|dep n table constraint ledger_position_check on os_chain.ledger -> table column os_chain.ledger."position"|||049f6d213565cb2a505c25e74984dd18
> pg_depend|dep n table os_chain.ledger -> schema os_chain|||3eec95588f896b7bd4ffe6b78dc4ce0d
> pg_index|index os_chain.ledger_file_key|||6d88f91eebecb9d9fce152c81d973765
> pg_index|index os_chain.ledger_pkey|||15298cd32965865ab8fe8d3b000f94b9
> pg_index|index pg_toast.pg_toast_20023_index|||d18b9e9d46a0aca480687153d9b3ca30
> pg_namespace|schema os_chain|postgres|∅|eceecee4166c9de1efac16079f140e43
> pg_namespace|schema os|os_owner|∅|c545dec6e7eee5cb50cc540c64268502
> pg_shdepend|shdep a (shared) role membership membership of role postgres in role os_owner -> role postgres|||ecc13ca5870e24dc71d037a87ea637ad
> pg_shdepend|shdep o default acl for role os_owner on functions -> role os_owner|||e5d93569411a69bcda9fcebdcc5d3509
> pg_shdepend|shdep o default acl for role os_owner on types -> role os_owner|||e5d93569411a69bcda9fcebdcc5d3509
> pg_shdepend|shdep o schema os -> role os_owner|||e5d93569411a69bcda9fcebdcc5d3509
> pg_shdepend|shdep o schema os_chain -> role postgres|||e5d93569411a69bcda9fcebdcc5d3509
> pg_shdepend|shdep o table os_chain.ledger -> role postgres|||e5d93569411a69bcda9fcebdcc5d3509
> pg_type|type os_chain.ledger[]|postgres|∅|4c9a6b9c33ca25fcacbd905b884779aa
> pg_type|type os_chain.ledger|postgres|∅|1e241765b92f295109b43aef6dc9b369
rows:
> os_chain.ledger|3|0782b9d0b7d9e353719b7d30a651dc01
```

## act 01
```sql
-- @ act 1
comment on schema public is 'm4';
```
answer: == act 1   (COMMENT ) 
```
< pg_description|schema public|||cb58bfced4454e91baf467eb0d669d2d
> pg_description|schema public|||42c0fd69fdfde8c9dba65efd775d12a6
```

## act 02
```sql
-- @ act 2
comment on table auth.users is 'm4';
```
answer: == act 2   ERROR 42501 must be owner of table users 
difference: none

## act 03
```sql
-- @ act 3
create publication m4_pub;
```
answer: == act 3   (CREATE ) 
```
> pg_publication|publication m4_pub|postgres||034064ca8f2972f1e7eaa37049486210
> pg_shdepend|shdep o publication m4_pub -> role postgres|||e5d93569411a69bcda9fcebdcc5d3509
```

## act 04
```sql
-- @ act 4
alter publication supabase_realtime add table supabase_migrations.schema_migrations;
```
answer: == act 4   (ALTER ) 
```
> pg_depend|dep a publication relation supabase_migrations.schema_migrations in publication supabase_realtime -> publication supabase_realtime|||f0fd22a9407ec8bb8ddbe0e2701f5c71
> pg_depend|dep a publication relation supabase_migrations.schema_migrations in publication supabase_realtime -> table supabase_migrations.schema_migrations|||f0fd22a9407ec8bb8ddbe0e2701f5c71
> pg_publication_rel|publication relation supabase_migrations.schema_migrations in publication supabase_realtime|||8647ea72640d01ba9e6ba0501185bb47
```

## act 05
```sql
-- @ act 5a function
create function public.m4_et() returns event_trigger language plpgsql as $$ begin end $$;
-- @ act 5b event trigger
create event trigger m4_et on ddl_command_end execute function public.m4_et();
```
answer: == act 5a function   (CREATE ) == act 5b event trigger   (CREATE ) 
```
> pg_depend|dep n event trigger m4_et -> function public.m4_et()|||3eec95588f896b7bd4ffe6b78dc4ce0d
> pg_depend|dep n function public.m4_et() -> language plpgsql|||3eec95588f896b7bd4ffe6b78dc4ce0d
> pg_depend|dep n function public.m4_et() -> schema public|||3eec95588f896b7bd4ffe6b78dc4ce0d
> pg_event_trigger|event trigger m4_et|postgres||87b5e3e3851d5e586a35292cafcb5644
> pg_proc|function public.m4_et()|postgres|postgres=X/postgres|7b19eb4cd98b2704b099a8e136765943
> pg_shdepend|shdep o event trigger m4_et -> role postgres|||e5d93569411a69bcda9fcebdcc5d3509
> pg_shdepend|shdep o function public.m4_et() -> role postgres|||e5d93569411a69bcda9fcebdcc5d3509
```

## act 06
```sql
-- @ act 6
grant usage on schema extensions to public;
```
answer: == act 6   (GRANT ) 
```
< pg_namespace|schema extensions|postgres|anon=U/postgres,authenticated=U/postgres,dashboard_user=UC/postgres,postgres=UC/postgres,service_role=U/postgres|055a4d8c8518d03c407f7e68cb606246
> pg_namespace|schema extensions|postgres|=U/postgres,anon=U/postgres,authenticated=U/postgres,dashboard_user=UC/postgres,postgres=UC/postgres,service_role=U/postgres|055a4d8c8518d03c407f7e68cb606246
```

## act 07
```sql
-- @ act 7a grant on auth.users to anon
grant select on auth.users to anon;
```
answer: == act 7a grant on auth.users to anon   (GRANT ) 
```
< pg_class|table auth.users|supabase_auth_admin|dashboard_user=arwdDxtm/supabase_auth_admin,postgres=ar*wdDxtm/supabase_auth_admin,supabase_auth_admin=arwdDxtm/supabase_auth_admin|35ce893a567e6c3dfb5db29809cb9978
> pg_class|table auth.users|supabase_auth_admin|anon=r/postgres,dashboard_user=arwdDxtm/supabase_auth_admin,postgres=ar*wdDxtm/supabase_auth_admin,supabase_auth_admin=arwdDxtm/supabase_auth_admin|35ce893a567e6c3dfb5db29809cb9978
> pg_shdepend|shdep a table auth.users -> role anon|||ecc13ca5870e24dc71d037a87ea637ad
```

## act 08
```sql
-- @ act 8
create role m4_role nologin;
```
answer: == act 8   (CREATE ) 
```
> pg_auth_members|role membership membership of role postgres in role m4_role m4_role>postgres by supabase_admin|||b13255aad5fcd5ae43027a7a8568ce8d
> pg_authid|role m4_role|||be4656bef0e5779621d47bd1e9d75ad6
```

## act 09
```sql
-- @ act 9
create schema m4_elsewhere;
-- @ act 9b
create table m4_elsewhere.t (id int primary key, note text);
```
answer: == act 9   (CREATE ) == act 9b   (CREATE ) 
```
> pg_attribute|index column m4_elsewhere.t_pkey.id||∅|393361e9b188e0ad53cd6296d7df80f0
> pg_attribute|index column pg_toast.pg_toast_20056_index.chunk_id||∅|c01085f6e68cd8515b7abde3e135d1f3
> pg_attribute|index column pg_toast.pg_toast_20056_index.chunk_seq||∅|e25c4364444561a44acb701bbb21376c
> pg_attribute|table column m4_elsewhere.t.cmax||∅|05bc9e995bf2929e09639fc54abde7e6
> pg_attribute|table column m4_elsewhere.t.cmin||∅|1bcc8536f88a76d7d8c7dceaab4d5652
> pg_attribute|table column m4_elsewhere.t.ctid||∅|9ba5e7d56371333f6759286e0e81641c
> pg_attribute|table column m4_elsewhere.t.id||∅|378d1cb7258b6f7e78a6568a265109cd
> pg_attribute|table column m4_elsewhere.t.note||∅|178e3f83da28912b07e3c9aebc96cb99
> pg_attribute|table column m4_elsewhere.t.tableoid||∅|1adc79286f3a3d4de9b5fbe7c4180701
> pg_attribute|table column m4_elsewhere.t.xmax||∅|dd32399d09b83eb0f66e7d8be494c952
> pg_attribute|table column m4_elsewhere.t.xmin||∅|60d92cc7f047983ed577c2603276d744
> pg_attribute|toast table column pg_toast.pg_toast_20056.chunk_data||∅|5d2c63aa959961049b2606391fedfd11
> pg_attribute|toast table column pg_toast.pg_toast_20056.chunk_id||∅|c01085f6e68cd8515b7abde3e135d1f3
> pg_attribute|toast table column pg_toast.pg_toast_20056.chunk_seq||∅|e25c4364444561a44acb701bbb21376c
> pg_attribute|toast table column pg_toast.pg_toast_20056.cmax||∅|05bc9e995bf2929e09639fc54abde7e6
> pg_attribute|toast table column pg_toast.pg_toast_20056.cmin||∅|1bcc8536f88a76d7d8c7dceaab4d5652
> pg_attribute|toast table column pg_toast.pg_toast_20056.ctid||∅|9ba5e7d56371333f6759286e0e81641c
> pg_attribute|toast table column pg_toast.pg_toast_20056.tableoid||∅|1adc79286f3a3d4de9b5fbe7c4180701
> pg_attribute|toast table column pg_toast.pg_toast_20056.xmax||∅|dd32399d09b83eb0f66e7d8be494c952
> pg_attribute|toast table column pg_toast.pg_toast_20056.xmin||∅|60d92cc7f047983ed577c2603276d744
> pg_class|index m4_elsewhere.t_pkey|postgres|∅|4f93f1c3d429f56641cb7fef08b107a9
> pg_class|index pg_toast.pg_toast_20056_index|postgres|∅|47c1e11f728a55b3acd435b5ea82a415
> pg_class|table m4_elsewhere.t|postgres|∅|f4f0eccd917b7cb2770ded7fd88e88a7
> pg_class|toast table pg_toast.pg_toast_20056|postgres|∅|e2aaf59df027bdefe691425d49af11c2
> pg_constraint|table constraint t_pkey on m4_elsewhere.t|||e8e513f370ef327f80b7b4376b6e76c4
> pg_depend|dep a index pg_toast.pg_toast_20056_index -> toast table column pg_toast.pg_toast_20056.chunk_id|||c9dae5ac6aa232410e7a39e2ffce2524
> pg_depend|dep a index pg_toast.pg_toast_20056_index -> toast table column pg_toast.pg_toast_20056.chunk_seq|||a71461a1e3649876fe053c56ce9a2aeb
> pg_depend|dep a table constraint t_pkey on m4_elsewhere.t -> table column m4_elsewhere.t.id|||c9dae5ac6aa232410e7a39e2ffce2524
> pg_depend|dep i index m4_elsewhere.t_pkey -> table constraint t_pkey on m4_elsewhere.t|||eaf489afe73329fe138dba385d621809
> pg_depend|dep i toast table pg_toast.pg_toast_20056 -> table m4_elsewhere.t|||eaf489afe73329fe138dba385d621809
> pg_depend|dep i type m4_elsewhere.t -> table m4_elsewhere.t|||eaf489afe73329fe138dba385d621809
> pg_depend|dep i type m4_elsewhere.t[] -> type m4_elsewhere.t|||eaf489afe73329fe138dba385d621809
> pg_depend|dep n table m4_elsewhere.t -> schema m4_elsewhere|||3eec95588f896b7bd4ffe6b78dc4ce0d
> pg_index|index m4_elsewhere.t_pkey|||15298cd32965865ab8fe8d3b000f94b9
> pg_index|index pg_toast.pg_toast_20056_index|||d18b9e9d46a0aca480687153d9b3ca30
> pg_namespace|schema m4_elsewhere|postgres|∅|264430b5afb49657922a1a8290150d94
> pg_shdepend|shdep o schema m4_elsewhere -> role postgres|||e5d93569411a69bcda9fcebdcc5d3509
> pg_shdepend|shdep o table m4_elsewhere.t -> role postgres|||e5d93569411a69bcda9fcebdcc5d3509
> pg_type|type m4_elsewhere.t[]|postgres|∅|198e5d6dd220ebec8a0dabfc03f00a4b
> pg_type|type m4_elsewhere.t|postgres|∅|89cdcc9961c2e52fd931a96289debef6
```

## act 10
```sql
-- @ act 10
create policy m4_pol on m4_elsewhere.t for select to public using (true);
```
answer: == act 10   (CREATE ) 
```
> pg_depend|dep a policy m4_pol on m4_elsewhere.t -> table m4_elsewhere.t|||f0fd22a9407ec8bb8ddbe0e2701f5c71
> pg_policy|policy m4_pol on m4_elsewhere.t|||1b2e75f555946c17526500a2236c0cdf
```

## act 11
```sql
-- @ act 11a
alter role anon set statement_timeout = '7s';
-- @ act 11b
alter database postgres set lock_timeout = '9s';
```
answer: == act 11a   (ALTER ) == act 11b   (ALTER ) 
```
< pg_db_role_setting|setting (all databases) anon|||bce2d0f302f0b2351c4d1a8a08d10ead
> pg_db_role_setting|setting (all databases) anon|||483f190723e91d7ce4037633d2191ecb
< pg_db_role_setting|setting postgres (all roles)|||8da963565191d3fa587b5413de964621
> pg_db_role_setting|setting postgres (all roles)|||5cf02c06721932b2ad05365f9de78e4b
```

## act 12
```sql
-- @ act 12a vault.create_secret
select vault.create_secret('m4','m4') is not null as made;
-- @ act 12b storage.buckets exists?
select pg_catalog.to_regclass('storage.buckets')::text;
-- @ act 12c realtime.messages insert
insert into realtime.messages (topic, extension, payload, event, private) values ('m4','broadcast','{}'::jsonb,'m4',false);
```
answer: == act 12a vault.create_secret   t == act 12b storage.buckets exists?   ∅ == act 12c realtime.messages insert   (INSERT 1) 
difference: none
rows:
```
< realtime.messages|23|b3e724599fad3a06fc2a8ebed116f5a6
> realtime.messages|24|4fbcb3ccdfc80b558720bdb3a4632be7
< realtime.messages_2026_11_23|23|b3e724599fad3a06fc2a8ebed116f5a6
> realtime.messages_2026_11_23|24|4fbcb3ccdfc80b558720bdb3a4632be7
< vault.secrets|0|-
> vault.secrets|1|dd510f473b4edea4300f799824df7788
```

## act 13
```sql
-- @ act 13
select nextval('realtime.subscription_id_seq') is not null as advanced;
```
answer: == act 13   t 
difference: none

## act 14
```sql
-- @ act 14
set role os_owner;
create table os.m4_inside (id int);
reset role;
```
answer: == act 14   (SET )   (CREATE )   (RESET ) 
```
> pg_attribute|table column os.m4_inside.cmax||∅|05bc9e995bf2929e09639fc54abde7e6
> pg_attribute|table column os.m4_inside.cmin||∅|1bcc8536f88a76d7d8c7dceaab4d5652
> pg_attribute|table column os.m4_inside.ctid||∅|9ba5e7d56371333f6759286e0e81641c
> pg_attribute|table column os.m4_inside.id||∅|393361e9b188e0ad53cd6296d7df80f0
> pg_attribute|table column os.m4_inside.tableoid||∅|1adc79286f3a3d4de9b5fbe7c4180701
> pg_attribute|table column os.m4_inside.xmax||∅|dd32399d09b83eb0f66e7d8be494c952
> pg_attribute|table column os.m4_inside.xmin||∅|60d92cc7f047983ed577c2603276d744
> pg_class|table os.m4_inside|os_owner|∅|460451749adc0f6bdf3b88f2ac6690d7
> pg_depend|dep i type os.m4_inside -> table os.m4_inside|||eaf489afe73329fe138dba385d621809
> pg_depend|dep i type os.m4_inside[] -> type os.m4_inside|||eaf489afe73329fe138dba385d621809
> pg_depend|dep n table os.m4_inside -> schema os|||3eec95588f896b7bd4ffe6b78dc4ce0d
> pg_shdepend|shdep o table os.m4_inside -> role os_owner|||e5d93569411a69bcda9fcebdcc5d3509
> pg_type|type os.m4_inside[]|os_owner|∅|7b1fe8a1c57f8c1d0bad86364ebff5b8
> pg_type|type os.m4_inside|os_owner|∅|7ba51063b04bc23ef2349d68613a6c98
```
rows:
```
> os.m4_inside|0|-
```

## act 15
```sql
-- @ act 15 before (kept in a session setting, never printed)
select pg_catalog.set_config('m4.before', coalesce(pg_catalog.md5(rolpassword),'null'), false) is not null as kept, rolpassword is not null as has_password from pg_catalog.pg_authid where rolname='authenticator';
-- @ act 15 alter
alter role authenticator password 'm4-measure';
-- @ act 15 after: changed?
select coalesce(pg_catalog.md5(rolpassword),'null') <> pg_catalog.current_setting('m4.before') as changed from pg_catalog.pg_authid where rolname='authenticator';
```
answer: == act 15 before (kept in a session setting, never printed)   t | t == act 15 alter   ERROR 42501 "authenticator" is a reserved role, only superusers can modify it == act 15 after: changed?   f 
difference: none

## act 15x
```sql
-- @ act 15x: a password on a role the installer made (shows whether rolpassword moves a line)
alter role m4_role password 'm4-measure';
-- @ pg_statistic rows now (after act 22)
select count(*) from pg_catalog.pg_statistic;
```
answer: == act 15x: a password on a role the installer made (shows whether rolpassword moves a line)   (ALTER ) == pg_statistic rows now (after act 22)   875 
```
< pg_authid|role m4_role|||be4656bef0e5779621d47bd1e9d75ad6
> pg_authid|role m4_role|||978c92588ce5c68e2c8fea63eb48d48c
```

## act 16
```sql
-- @ act 16
alter system set work_mem = '5MB';
```
answer: == act 16   ERROR 42501 permission denied to set parameter "work_mem" 
difference: none

## act 17a
```sql
-- @ act 17a
create extension if not exists pg_trgm with schema extensions;
```
answer: == act 17a   (CREATE ) 
difference: 282 lines, by catalogue:
     19 > pg_amop;     14 > pg_amproc;    169 > pg_depend;      1 > pg_description;      1 > pg_extension;      2 > pg_opclass;     10 > pg_operator;      2 > pg_opfamily;     31 > pg_proc;     31 > pg_shdepend;      2 > pg_type;

## act 17b
```sql
-- @ act 17b
alter extension pg_trgm drop function extensions.similarity(text,text);
```
answer: == act 17b   ERROR 42501 must be owner of extension pg_trgm 
difference: none

## act 17c
```sql
-- @ act 17c
alter extension pg_trgm add function extensions.similarity(text,text);
```
answer: == act 17c   ERROR 42501 must be owner of extension pg_trgm 
difference: none

## act 18a
```sql
-- @ act 18a
create text search configuration public.m4_ts (copy = pg_catalog.simple);
```
answer: == act 18a   (CREATE ) 
```
> pg_depend|dep n text search configuration public.m4_ts -> schema public|||3eec95588f896b7bd4ffe6b78dc4ce0d
> pg_shdepend|shdep o text search configuration public.m4_ts -> role postgres|||e5d93569411a69bcda9fcebdcc5d3509
> pg_ts_config_map|ts map text search configuration public.m4_ts token 1 seq 1|||b499bfcfc3df4049416126a53b95d51d
> pg_ts_config_map|ts map text search configuration public.m4_ts token 10 seq 1|||d85f08cb4556a783b79dd0a5ba60cb72
> pg_ts_config_map|ts map text search configuration public.m4_ts token 11 seq 1|||cd07ef0773eae87c420c5c86a4feffff
> pg_ts_config_map|ts map text search configuration public.m4_ts token 15 seq 1|||7bc79b1307304ea9174f329b4787b41d
> pg_ts_config_map|ts map text search configuration public.m4_ts token 16 seq 1|||0309dedce584a3707791b6fdd7ed4fb1
> pg_ts_config_map|ts map text search configuration public.m4_ts token 17 seq 1|||eed717dedae0b38065a23d3d919bced8
> pg_ts_config_map|ts map text search configuration public.m4_ts token 18 seq 1|||c3df7b3e5676164316b3d913fef33d9e
> pg_ts_config_map|ts map text search configuration public.m4_ts token 19 seq 1|||c3fab7deb2f25df83d828b95b0aab80c
> pg_ts_config_map|ts map text search configuration public.m4_ts token 2 seq 1|||e1c53a4fc70172ca0de95267e94bc64e
> pg_ts_config_map|ts map text search configuration public.m4_ts token 20 seq 1|||cfb1e0a3bfadfa205a574440fb6ec4fe
> pg_ts_config_map|ts map text search configuration public.m4_ts token 21 seq 1|||d2e8f7c9323e125779f47d9f2fa36148
> pg_ts_config_map|ts map text search configuration public.m4_ts token 22 seq 1|||682f8d9f8c3b18bfa433b390fde0363e
> pg_ts_config_map|ts map text search configuration public.m4_ts token 3 seq 1|||3c99841bf54a883c95ec9fa6b6525fcc
> pg_ts_config_map|ts map text search configuration public.m4_ts token 4 seq 1|||9d49d455448fcc0d96dbc8c28eda258f
> pg_ts_config_map|ts map text search configuration public.m4_ts token 5 seq 1|||bede132317a38f9f3727380ef88ed903
> pg_ts_config_map|ts map text search configuration public.m4_ts token 6 seq 1|||4751db08a2544b4fe09f349e0e14540c
> pg_ts_config_map|ts map text search configuration public.m4_ts token 7 seq 1|||611eb4058af5ae442d25579032330aaf
> pg_ts_config_map|ts map text search configuration public.m4_ts token 8 seq 1|||f40d49cab3bf28799877f1edc133df6a
> pg_ts_config_map|ts map text search configuration public.m4_ts token 9 seq 1|||b48a0d4e9aca0f5ebeac4d4382b2b044
> pg_ts_config|text search configuration public.m4_ts|postgres||f160dbdbc54a1bf89c88c80ccd42950f
```

## act 18b
```sql
-- @ act 18b
alter text search configuration public.m4_ts alter mapping for word with pg_catalog.english_stem;
```
answer: == act 18b   (ALTER ) 
```
> pg_depend|dep n text search configuration public.m4_ts -> text search dictionary pg_catalog.english_stem|||3eec95588f896b7bd4ffe6b78dc4ce0d
< pg_ts_config_map|ts map text search configuration public.m4_ts token 2 seq 1|||e1c53a4fc70172ca0de95267e94bc64e
> pg_ts_config_map|ts map text search configuration public.m4_ts token 2 seq 1|||3d49fb900e5e75234e828bd9f8e19307
```

## act 19
```sql
-- @ act 19
select lo_create(0) is not null as made;
```
answer: == act 19   t 
```
> pg_shdepend|shdep o large object 20149 -> role postgres|||e5d93569411a69bcda9fcebdcc5d3509
```

## act 20a
```sql
-- @ act 20a
alter table m4_elsewhere.t add column extra int;
```
answer: == act 20a   (ALTER ) 
```
> pg_attribute|table column m4_elsewhere.t.extra||∅|b8a994e7bbd8d2ae48cf270ff2a0caba
< pg_class|table m4_elsewhere.t|postgres|∅|f4f0eccd917b7cb2770ded7fd88e88a7
> pg_class|table m4_elsewhere.t|postgres|∅|8da070c2c6797aa7a4f60cd66f04db43
```

## act 20b
```sql
-- @ act 20b
create index on m4_elsewhere.t (note);
```
answer: == act 20b   (CREATE ) 
```
> pg_attribute|index column m4_elsewhere.t_note_idx.note||∅|04cfeaa22db028f684158f6308ff79c5
> pg_class|index m4_elsewhere.t_note_idx|postgres|∅|c68dec322b3f15ebb8348863d1c9e958
> pg_depend|dep a index m4_elsewhere.t_note_idx -> table column m4_elsewhere.t.note|||a71461a1e3649876fe053c56ce9a2aeb
> pg_index|index m4_elsewhere.t_note_idx|||ac082848a4b511fa21a8d72a56af6364
```

## act 20c
```sql
-- @ act 20c
alter table m4_elsewhere.t enable row level security;
```
answer: == act 20c   (ALTER ) 
```
< pg_class|table m4_elsewhere.t|postgres|∅|8da070c2c6797aa7a4f60cd66f04db43
> pg_class|table m4_elsewhere.t|postgres|∅|c34a6558215b6278e17c7025f0fe5292
```

## act 21a
```sql
-- @ act 21a
create database m4_db;
```
answer: == act 21a   (CREATE ) 
```
> pg_database|database m4_db||∅|27c33649e7401db12afca7b3c57f70b7
> pg_shdepend|shdep o (shared) database m4_db -> role postgres|||e5d93569411a69bcda9fcebdcc5d3509
```

## act 21b
```sql
-- @ act 21b
drop database m4_db;
```
answer: == act 21b   (DROP ) 
```
< pg_database|database m4_db||∅|27c33649e7401db12afca7b3c57f70b7
< pg_shdepend|shdep o (shared) database m4_db -> role postgres|||e5d93569411a69bcda9fcebdcc5d3509
```

## act 22
```sql
vacuum analyze m4_elsewhere.t;
analyze;
select 'su-done', current_user;
```
answer:  ?column? |  current_user   ----------+----------------  su-done  | supabase_admin (1 row)  
difference: none
