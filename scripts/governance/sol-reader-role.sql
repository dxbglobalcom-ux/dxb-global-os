-- dxb-team2 job 1 (plan: .planning/quick/20260928-sol-db-reach/PLAN.md, rev 3) —
-- THE AUDITOR'S OWN READ-ONLY HAND INTO THE CONSTRUCTION ENGINE.
--
-- CEO 2026-09-28: "önerin tmm" (the auditor gathers database evidence with its
-- own hand, never through the author's output; never the company's database),
-- and on the plan: "Tamam onaylıyorum."
--
-- Applied ONLY by scripts/governance/sol-reader-role.sh, which feeds this file on
-- stdin to `psql -U supabase_admin` inside the construction container, preceded
-- by four set_config() lines: dxb.allowed, dxb.company, dxb.effectful and
-- dxb.verifier. Everything below runs in ONE transaction on ONE connection, and
-- the first thing that connection does is prove which engine it is on — so the
-- refusal and the work cannot be answered by two different servers.
--
-- WHAT THE ROLE IS. `sol_reader`: LOGIN, not a member of anything, BYPASSRLS (62
-- public tables have row-level security; without it every count reads a false
-- zero — the same reason dxb_reader holds it), every transaction read-only by
-- default, 10 s per statement, 3 connections. SELECT in four schemas and nothing
-- else: public, pgboss, supabase_migrations, extensions. Never auth, storage,
-- vault, net, realtime or dxb_internal.
--
-- WHY THE DEFAULT-READ-ONLY SETTING IS NOT THE WALL. A session can turn it off.
-- The wall is privileges: no write verb on any table, no sequence, no TEMP, no
-- CREATE, and no function whose call leaves something behind — the one-way
-- window's own sentence (c_effectful in scripts/b36/company-one-way-window.sql),
-- read out of that file by the shell script and asserted here, so the window and
-- this role cannot disagree about what "effectful" means.
--
-- NO PASSWORD IN ANY STATEMENT. The shell script computes a SCRAM-SHA-256
-- verifier outside the engine and passes only the verifier; the password itself
-- lives in ~/.config/dxb/sol-reader.env (mode 600, outside the repository).
--
-- IDEMPOTENT: every attribute and grant is stated on every run.

BEGIN;

-- 1. WHO AM I TALKING TO — the full identity triple, on this connection.
DO $dxb$
DECLARE
  v_here text;
BEGIN
  SELECT (SELECT system_identifier::text FROM pg_control_system()) || '/' ||
         (SELECT oid::text FROM pg_database WHERE datname = current_database()) || '/' ||
         current_database()
    INTO v_here;
  IF v_here = current_setting('dxb.company') THEN
    RAISE EXCEPTION 'REFUSED company identity %: this is the holding''s own database. '
      'The auditor''s hand is built on the construction engine and nowhere else.', v_here;
  END IF;
  IF NOT (v_here = ANY (string_to_array(current_setting('dxb.allowed'), ','))) THEN
    RAISE EXCEPTION 'REFUSED unknown identity %: not on tools/hooks/ledger-identity.json allowed[]. '
      'Re-take it with scripts/b36/ledger-identity.mjs --allow.', v_here;
  END IF;
  RAISE NOTICE 'SOL_READER identity %', v_here;
END
$dxb$;

-- 2. THE ROLE — every attribute stated.
DO $dxb$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sol_reader') THEN
    EXECUTE 'CREATE ROLE sol_reader LOGIN';
  END IF;
  EXECUTE 'ALTER ROLE sol_reader LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT '
       || 'NOREPLICATION BYPASSRLS CONNECTION LIMIT 3';
  EXECUTE format('ALTER ROLE sol_reader PASSWORD %L', current_setting('dxb.verifier'));
  EXECUTE 'ALTER ROLE sol_reader SET default_transaction_read_only = on';
  EXECUTE 'ALTER ROLE sol_reader SET statement_timeout = ''10s''';
  EXECUTE 'ALTER ROLE sol_reader SET idle_in_transaction_session_timeout = ''15s''';
  EXECUTE 'ALTER ROLE sol_reader SET temp_file_limit = ''64MB''';

  IF EXISTS (SELECT 1 FROM pg_auth_members m JOIN pg_roles r ON r.oid = m.member
              WHERE r.rolname = 'sol_reader') THEN
    RAISE EXCEPTION 'sol_reader is a member of another role — membership carries privileges '
      'no REVOKE here can reach. Revoke it and re-run.';
  END IF;
END
$dxb$;

-- 3. THE GLASS — connect, four schemas, SELECT only.
DO $dxb$
DECLARE
  v_schema text;
  v_obj    record;
  c_verbs  CONSTANT text := 'INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN';
BEGIN
  EXECUTE format('REVOKE ALL ON DATABASE %I FROM sol_reader', current_database());
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO sol_reader', current_database());

  -- Named grants anywhere are taken first, so a hand-edit is undone on every run.
  FOR v_obj IN SELECT nspname FROM pg_namespace
                WHERE nspname NOT IN ('pg_catalog', 'information_schema')
                  AND nspname NOT LIKE 'pg\_%' LOOP
    EXECUTE format('REVOKE ALL ON SCHEMA %I FROM sol_reader', v_obj.nspname);
    EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA %I FROM sol_reader', v_obj.nspname);
    EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA %I FROM sol_reader', v_obj.nspname);
    EXECUTE format('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA %I FROM sol_reader', v_obj.nspname);
  END LOOP;

  FOREACH v_schema IN ARRAY ARRAY['public', 'pgboss', 'supabase_migrations', 'extensions'] LOOP
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = v_schema) THEN
      EXECUTE format('GRANT USAGE ON SCHEMA %I TO sol_reader', v_schema);
      EXECUTE format('GRANT SELECT ON ALL TABLES IN SCHEMA %I TO sol_reader', v_schema);
      -- Tables that do not exist yet: default privileges belong to the role that
      -- CREATES the object, and this chain creates with both.
      EXECUTE format('ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA %I '
                     'GRANT SELECT ON TABLES TO sol_reader', v_schema);
      EXECUTE format('ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA %I '
                     'GRANT SELECT ON TABLES TO sol_reader', v_schema);
    END IF;
  END LOOP;
END
$dxb$;

-- 4. PROVE IT, in the same transaction — the file refuses to commit otherwise.
DO $dxb$
DECLARE
  v_leak    text;
  v_visible int;
BEGIN
  -- functions whose call can leave something behind — the window's sentence
  EXECUTE format($q$
    SELECT string_agg(format('%%I.%%I(%%s)', n.nspname, p.proname,
                             pg_get_function_identity_arguments(p.oid)), ', ')
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE ((%s) OR p.prosecdef)
       AND has_function_privilege('sol_reader', p.oid, 'EXECUTE')
  $q$, current_setting('dxb.effectful')) INTO v_leak;
  IF v_leak IS NOT NULL THEN
    RAISE EXCEPTION 'SOL_READER_LEAK function: % — PUBLIC still holds EXECUTE here; the one-way '
      'window (scripts/b36/install-company-window.mjs construction) is not on this engine', v_leak;
  END IF;

  -- tables, seven verbs, every schema
  SELECT string_agg(DISTINCT n.nspname || '.' || c.relname, ', ') INTO v_leak
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE c.relkind IN ('r','p','v','m','f')
     AND n.nspname NOT IN ('pg_catalog','information_schema')
     AND (has_table_privilege('sol_reader', c.oid, 'INSERT')
       OR has_table_privilege('sol_reader', c.oid, 'UPDATE')
       OR has_table_privilege('sol_reader', c.oid, 'DELETE')
       OR has_table_privilege('sol_reader', c.oid, 'TRUNCATE')
       OR has_table_privilege('sol_reader', c.oid, 'REFERENCES')
       OR has_table_privilege('sol_reader', c.oid, 'TRIGGER')
       OR has_table_privilege('sol_reader', c.oid, 'MAINTAIN'));
  IF v_leak IS NOT NULL THEN
    RAISE EXCEPTION 'SOL_READER_LEAK table verb: %', v_leak;
  END IF;

  -- sequences — nextval/setval survive ROLLBACK
  SELECT string_agg(n.nspname || '.' || c.relname, ', ') INTO v_leak
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE c.relkind = 'S'
     AND (has_sequence_privilege('sol_reader', c.oid, 'USAGE')
       OR has_sequence_privilege('sol_reader', c.oid, 'UPDATE')
       OR has_sequence_privilege('sol_reader', c.oid, 'SELECT'));
  IF v_leak IS NOT NULL THEN
    RAISE EXCEPTION 'SOL_READER_LEAK sequence: %', v_leak;
  END IF;

  -- schemas beyond the four (the system catalogue is every role's)
  SELECT string_agg(n.nspname, ', ') INTO v_leak
    FROM pg_namespace n
   WHERE n.nspname NOT IN ('public','pgboss','supabase_migrations','extensions',
                           'pg_catalog','information_schema')
     AND has_schema_privilege('sol_reader', n.oid, 'USAGE');
  IF v_leak IS NOT NULL THEN
    RAISE EXCEPTION 'SOL_READER_LEAK schema: % — PUBLIC still holds USAGE; the one-way window '
      'is not on this engine', v_leak;
  END IF;

  -- nothing may be created: no schema object, no temp table, no database object
  SELECT string_agg(n.nspname, ', ') INTO v_leak
    FROM pg_namespace n WHERE has_schema_privilege('sol_reader', n.oid, 'CREATE');
  IF v_leak IS NOT NULL
     OR has_database_privilege('sol_reader', current_database(), 'CREATE')
     OR has_database_privilege('sol_reader', current_database(), 'TEMPORARY') THEN
    RAISE EXCEPTION 'SOL_READER_LEAK create: schemas [%] or database CREATE/TEMPORARY',
      coalesce(v_leak, '');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sol_reader'
                    AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole
                    AND NOT rolreplication AND NOT rolinherit AND rolbypassrls AND rolcanlogin) THEN
    RAISE EXCEPTION 'SOL_READER_LEAK attributes: the role is not what this file states';
  END IF;

  -- and it must still see: a hand that reads nothing gathers false evidence
  SELECT count(*) INTO v_visible
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind IN ('r','p')
     AND has_table_privilege('sol_reader', c.oid, 'SELECT');
  IF v_visible = 0 THEN
    RAISE EXCEPTION 'SOL_READER_BLIND: sol_reader can read no table in public';
  END IF;
  RAISE NOTICE 'SOL_READER readable public tables %', v_visible;
END
$dxb$;

COMMIT;
