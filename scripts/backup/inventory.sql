-- B72 — what a database holds, as ONE JSON document on one line:
--
--   { "inventory": { tables, sequences, large_objects, extensions, roles, acl_sha256 },
--     "excluded":  [ { "what": "<schema>.<name> | <a privilege>", "why": "<reason>" }, … ] }
--
-- Both sides of a backup run this same file, unchanged: the nightly job on the
-- company, inside the read-only transaction that exported the dump's snapshot
-- (scripts/backup/laptop-pg-dump.sh), and the restore drill on the restored copy.
-- The job writes the document into the night's manifest; the drill demands that
-- "inventory" comes out equal. The contract is
-- .planning/quick/20261122-b72-yedek/SET-CONTRACT.md.
--
-- It only reads: catalogue lookups and count(*). It needs PostgreSQL 17 and
-- nothing installed (query_to_xml is how plain SQL counts a table it learned the
-- name of from the catalogue). Run it with `psql -AtqX`.
--
-- WHAT IS COUNTED is decided by pg_dump's own rule, read from the catalogue —
-- never by a list of names:
--   * the system's schemas (pg_*, information_schema) are no part of a dump and
--     appear nowhere here;
--   * a table or sequence an extension owns comes back from CREATE EXTENSION, not
--     from the dump — it is listed under "excluded" — unless the extension
--     registered it to be dumped whole (pg_extension.extconfig with an empty
--     condition): then the dump carries it and it is counted;
--   * everything else is carried and counted — partitioned tables too (FROM ONLY,
--     so always 0: their rows are counted in the partitions).
-- "acl_sha256" covers schemas, tables (views included), sequences and functions
-- that no extension owns, and default privileges; a privilege never touched
-- reads as the owner's default, so "never granted" and "granted back to the
-- default" hash alike, as they restore alike. Column privileges are not in it.
-- A privilege is hashed as the dump REBUILDS it. pg_dump writes an object's
-- privileges as the difference from its record in pg_init_privs (the owner's
-- default where there is none), and pg_restore --clean recreates the object
-- with the owner's default and no such record. So a privilege that is held, is
-- in the record and is not the owner's default is not in the dump: it is left
-- out of the hash and listed under "excluded", privilege by privilege (its
-- "what" is the line itself, "<kind> <name>: <grantee> <privilege> by <grantor>").
-- Measured 2026-11-22 on supabase/postgres 17.6.1.140: the image records the
-- USAGE grants on its schemas graphql and graphql_public as an extension's,
-- though no extension owns them — eight grants a restore does not bring back.
-- (The ninth such line, PUBLIC's USAGE on schema public, every instance has of
-- its own: the dump does not recreate that schema.)
--
-- A sequence is not transactional: its value is read as it is NOW, not as of the
-- snapshot, and a dump taken afterwards may carry a later value.
--
-- Every ordering is COLLATE "C" and no oid reaches the output, so two databases
-- holding the same things give the same bytes whatever their locale.
SET row_security = off;  -- as pg_dump: a policy must stop the count, never silently shorten it
WITH carried_schema AS (
  SELECT oid, nspname FROM pg_namespace
  WHERE nspname !~ '^pg_' AND nspname <> 'information_schema'
), extension_member AS (
  SELECT d.classid, d.objid, e.extconfig, e.extcondition
  FROM pg_depend d JOIN pg_extension e ON e.oid = d.refobjid
  WHERE d.refclassid = 'pg_extension'::regclass AND d.deptype = 'e'
), relation AS (
  SELECT c.oid, s.nspname, c.relname, c.relkind, c.relowner, c.relacl,
         s.nspname || '.' || c.relname AS name,
         m.objid IS NOT NULL AS extension_owned,
         m.extcondition[array_position(m.extconfig, c.oid)] AS dump_condition
  FROM pg_class c
  JOIN carried_schema s ON s.oid = c.relnamespace
  LEFT JOIN extension_member m ON m.classid = 'pg_class'::regclass AND m.objid = c.oid
  WHERE c.relkind IN ('r', 'p', 'S', 'v', 'm', 'f')
), judged AS (
  SELECT r.*,
         CASE WHEN NOT r.extension_owned OR r.dump_condition = '' THEN NULL
              WHEN r.dump_condition IS NULL AND r.relkind = 'S' THEN 'extension-owned; pg_dump carries no value of it'
              WHEN r.dump_condition IS NULL THEN 'extension-owned; pg_dump carries no rows of it'
              ELSE 'extension-owned and dumped through a filter; pg_dump carries only part of it'
         END AS why_excluded
  FROM relation r
), table_count AS (
  SELECT j.name,
         (xpath('/row/n/text()', query_to_xml(format('SELECT count(*) AS n FROM ONLY %I.%I', j.nspname, j.relname), false, true, '')))[1]::text::bigint AS n
  FROM judged j WHERE j.relkind IN ('r', 'p') AND j.why_excluded IS NULL
), sequence_state AS (
  SELECT j.name, query_to_xml(format('SELECT last_value, is_called FROM %I.%I', j.nspname, j.relname), false, true, '') AS state
  FROM judged j WHERE j.relkind = 'S' AND j.why_excluded IS NULL
), role_held AS (
  SELECT r.rolname, r.rolcanlogin,
         ARRAY(SELECT DISTINCT g.rolname COLLATE "C" FROM pg_auth_members a JOIN pg_roles g ON g.oid = a.roleid
               WHERE a.member = r.oid ORDER BY 1) AS member_of
  FROM pg_roles r WHERE r.rolname !~ '^pg_'
), acl_owner AS (
  SELECT 'schema ' || s.nspname AS object, 'pg_namespace'::regclass AS catalogue, n.oid, n.nspacl AS acl, acldefault('n', n.nspowner) AS owner_default
  FROM carried_schema s JOIN pg_namespace n ON n.oid = s.oid
  WHERE NOT EXISTS (SELECT FROM extension_member m WHERE m.classid = 'pg_namespace'::regclass AND m.objid = s.oid)
  UNION ALL
  SELECT CASE WHEN j.relkind = 'S' THEN 'sequence ' ELSE 'table ' END || j.name, 'pg_class'::regclass, j.oid, j.relacl,
         acldefault(CASE WHEN j.relkind = 'S' THEN 's' ELSE 'r' END::"char", j.relowner)
  FROM judged j WHERE NOT j.extension_owned
  UNION ALL
  SELECT 'function ' || s.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')', 'pg_proc'::regclass, p.oid, p.proacl,
         acldefault('f', p.proowner)
  FROM pg_proc p JOIN carried_schema s ON s.oid = p.pronamespace
  WHERE NOT EXISTS (SELECT FROM extension_member m WHERE m.classid = 'pg_proc'::regclass AND m.objid = p.oid)
  UNION ALL
  SELECT 'default of ' || pg_get_userbyid(d.defaclrole) || ' in ' || coalesce(n.nspname, '*') || ' for ' || d.defaclobjtype::text, NULL, NULL, d.defaclacl, d.defaclacl
  FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace
), acl_judged AS (
  SELECT o.object, coalesce(o.acl, o.owner_default) AS held, o.owner_default, coalesce(i.initprivs, o.owner_default) AS dump_baseline
  FROM acl_owner o LEFT JOIN pg_init_privs i ON i.classoid = o.catalogue AND i.objoid = o.oid AND i.objsubid = 0
), acl_privilege AS (
  SELECT o.object, x.rebuilt,
         o.object || ': ' || CASE WHEN x.grantee = 0 THEN 'PUBLIC' ELSE pg_get_userbyid(x.grantee) END || ' ' || x.privilege_type
         || CASE WHEN x.is_grantable THEN ' WITH GRANT OPTION' ELSE '' END || ' by ' || pg_get_userbyid(x.grantor) AS line
  FROM acl_judged o, LATERAL (
    SELECT h.*, true AS rebuilt FROM aclexplode(o.held) h WHERE h NOT IN (SELECT b FROM aclexplode(o.dump_baseline) b)
    UNION ALL
    SELECT d.*, true FROM aclexplode(o.owner_default) d
    WHERE (d IN (SELECT h FROM aclexplode(o.held) h)) = (d IN (SELECT b FROM aclexplode(o.dump_baseline) b))
    UNION ALL
    SELECT h.*, false FROM aclexplode(o.held) h
    WHERE h IN (SELECT b FROM aclexplode(o.dump_baseline) b) AND h NOT IN (SELECT d FROM aclexplode(o.owner_default) d)
  ) x
), acl_line AS (
  SELECT line FROM acl_privilege WHERE rebuilt
), excluded AS (
  SELECT name AS what, why_excluded AS why FROM judged WHERE relkind IN ('r', 'p', 'S') AND why_excluded IS NOT NULL
  UNION ALL
  SELECT line, 'recorded as an initial privilege (pg_init_privs); pg_dump carries none of those' FROM acl_privilege WHERE NOT rebuilt
)
SELECT jsonb_build_object(
  'inventory', jsonb_build_object(
    'tables', (SELECT coalesce(jsonb_object_agg(name, n), '{}') FROM table_count),
    'sequences', (SELECT coalesce(jsonb_object_agg(name, jsonb_build_object(
                     'last_value', (xpath('/row/last_value/text()', state))[1]::text::bigint,
                     'is_called', (xpath('/row/is_called/text()', state))[1]::text::boolean)), '{}') FROM sequence_state),
    'large_objects', (SELECT count(*) FROM pg_largeobject_metadata),
    'extensions', (SELECT coalesce(jsonb_object_agg(extname, extversion), '{}') FROM pg_extension),
    'roles', (SELECT coalesce(jsonb_object_agg(rolname, jsonb_build_object('login', rolcanlogin, 'member_of', to_jsonb(member_of))), '{}') FROM role_held),
    'acl_sha256', (SELECT encode(sha256(convert_to(coalesce(string_agg(line, E'\n' ORDER BY line COLLATE "C"), ''), 'UTF8')), 'hex') FROM acl_line)),
  'excluded', (SELECT coalesce(jsonb_agg(jsonb_build_object('what', what, 'why', why) ORDER BY what COLLATE "C"), '[]') FROM excluded))::text;
