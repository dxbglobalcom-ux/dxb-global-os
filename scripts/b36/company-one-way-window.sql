-- B36 · Block 3 — THE ONE-WAY WINDOW.
--
-- CEO, 2026-08-24, approving this block: "onaylıyorum" — and, the same morning,
-- the order it has to satisfy: "bundan sonra TEK BİR HARF DAHİ ŞİRKETİN VERİ
-- TABANINA GİRMESİN!"  After this migration the construction side keeps one
-- login into the holding's database that can LOOK and can touch nothing, and
-- the refusal is issued by PostgreSQL itself rather than by our code. A future
-- session that writes the wrong line still cannot write.
--
-- THIS MIGRATION ADDS NO ROW, CHANGES NO ROW AND DELETES NO ROW. It creates a
-- role and moves privileges. That is the whole of it.
--
-- WHY BYPASSRLS ON A READ-ONLY ROLE. Every one of the 60 tables in `public` has
-- row-level security enabled. Without BYPASSRLS this role would connect happily
-- and read zero rows — and a gate that counts the company's rows would then
-- report a comfortable, false zero. BYPASSRLS changes WHAT IS VISIBLE and
-- nothing else; it confers no ability to write. A silent zero is the more
-- dangerous failure, so the window sees everything and can still touch nothing.
--
-- WHAT IT MAY NOT SEE. `auth` (Supabase's own user table, password hashes),
-- `storage`, `vault`, `realtime`, `litellm`. The window exists to measure the
-- holding's own tables, not to hold its secrets. Only `public` and `pgboss`.
--
-- NO PASSWORD IS SET HERE. A secret never enters this repository. The role is
-- created without one — which means it cannot authenticate over TCP at all —
-- and `scripts/b36/install-company-window.mjs` mints one outside the tree.
--
-- WHY THIS IS NOT A MIGRATION, after it was written as one and measured.
-- It creates no table, no column, no view and no function: it creates a ROLE and
-- moves PRIVILEGES, which is an act on the ENGINE, not on the schema — and a
-- schema chain that both engines share is the wrong place for either. It also
-- cannot be done by the application's own role: two tables here (`net.*`, the
-- pg_net extension's outbound-HTTP queue) are owned by `supabase_admin`, and
-- `postgres` is not a member of it, so the app role cannot take PUBLIC's write
-- privilege on them away. This file is therefore applied by
-- scripts/b36/install-company-window.mjs as the engine's own administrator.
--
-- IDEMPOTENT and safe to re-run.

DO $dxb$
DECLARE
  v_schema  text;
  v_role    text;
  v_fn      record;
  v_walled  int := 0;
  v_sealed  int := 0;
  v_holders text[];
  v_leak    text;
  v_visible int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'dxb_reader') THEN
    EXECUTE 'CREATE ROLE dxb_reader LOGIN';
  END IF;

  -- Every attribute this installer is ALLOWED to state, stated every time, so a
  -- hand-edited role is corrected on the next run instead of quietly keeping
  -- whatever it was given. PostgreSQL 17 reserves NOSUPERUSER and NOREPLICATION
  -- to superusers even when the target holds neither, so those two are ASSERTED
  -- below rather than set: an assertion that fails loudly is worth more than a
  -- statement that cannot run.
  EXECUTE 'ALTER ROLE dxb_reader NOCREATEDB NOCREATEROLE NOINHERIT LOGIN '
       || 'CONNECTION LIMIT 8';

  IF EXISTS (SELECT 1 FROM pg_roles
              WHERE rolname = 'dxb_reader' AND (rolsuper OR rolreplication)) THEN
    RAISE EXCEPTION 'B36: dxb_reader holds SUPERUSER or REPLICATION. The window '
      'is supposed to be the weakest login on this engine. Drop the role and '
      're-run this migration as a superuser.';
  END IF;

  BEGIN
    EXECUTE 'ALTER ROLE dxb_reader BYPASSRLS';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE EXCEPTION 'B36: cannot grant BYPASSRLS to dxb_reader as %. Without it '
      'the window reads zero rows through row-level security and every count it '
      'takes is a lie. Re-run as a role that holds BYPASSRLS.', current_user;
  END;

  -- ---------------------------------------------------------------- the glass
  EXECUTE 'REVOKE ALL ON SCHEMA public FROM dxb_reader';
  EXECUTE 'REVOKE ALL ON DATABASE ' || quote_ident(current_database()) || ' FROM dxb_reader';
  EXECUTE 'GRANT CONNECT ON DATABASE ' || quote_ident(current_database()) || ' TO dxb_reader';

  FOREACH v_schema IN ARRAY ARRAY['public', 'pgboss'] LOOP
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = v_schema) THEN
      EXECUTE format('GRANT USAGE ON SCHEMA %I TO dxb_reader', v_schema);
      EXECUTE format('REVOKE CREATE ON SCHEMA %I FROM dxb_reader', v_schema);
      EXECUTE format('GRANT SELECT ON ALL TABLES IN SCHEMA %I TO dxb_reader', v_schema);
      EXECUTE format(
        'REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN '
        'ON ALL TABLES IN SCHEMA %I FROM dxb_reader', v_schema);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA %I FROM dxb_reader', v_schema);

      -- Tables that do not exist yet. Default privileges belong to the role that
      -- CREATES the object, so they are written for every role that creates
      -- objects in this chain.
      EXECUTE format(
        'ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA %I '
        'GRANT SELECT ON TABLES TO dxb_reader', v_schema);
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_admin') THEN
        BEGIN
          EXECUTE format(
            'ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA %I '
            'GRANT SELECT ON TABLES TO dxb_reader', v_schema);
        EXCEPTION WHEN insufficient_privilege THEN
          NULL;  -- the app role cannot speak for the platform role; harmless
        END;
      END IF;
    END IF;
  END LOOP;

  -- ------------------------------------------------------------- the back door
  -- Revoking table privileges is NOT enough, and this is the part an audit
  -- would find. This database carries 85 SECURITY DEFINER functions in `public`
  -- — a SECURITY DEFINER function runs with its OWNER's privileges, and the
  -- owner here is `postgres`. Thirty-four of them are executable by PUBLIC, and
  -- PUBLIC means every role that will ever exist, dxb_reader included.
  -- `control_ceo_briefing_post`, `fn_chat_post_message`, `control_voice_call_log`,
  -- `control_opportunity_register`, `fn_update_routing` and their like all
  -- INSERT into the holding's own tables. A window holding SELECT and nothing
  -- else could still have called one of them and written a row.
  --
  -- `default_transaction_read_only` would stop it and it is set below, but it is
  -- not a wall: the role can switch it off itself. The wall is the privilege.
  --
  -- HOW THIS BREAKS NOTHING (his law of 2026-08-17). EXECUTE is taken from
  -- PUBLIC and given back, BY NAME, to every role that exists on this engine
  -- except dxb_reader. Every caller that could run these functions a second ago
  -- can still run them; only the new window cannot. The complete privilege
  -- matrix is photographed before and after by
  -- scripts/b36/install-company-window.mjs and must return identical except for
  -- that one role.
  FOR v_fn IN
    SELECT p.oid,
           format('%I.%I(%s)', n.nspname, p.proname,
                  pg_get_function_identity_arguments(p.oid)) AS sig
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname IN ('public', 'pgboss')
       AND p.prosecdef
       AND has_function_privilege('dxb_reader', p.oid, 'EXECUTE')
  LOOP
    -- WHO COULD RUN THIS A MOMENT AGO. Asked one function at a time, and this
    -- is the whole correction. The first version of this file handed EXECUTE
    -- back to EVERY role on the engine, which is exact only where PUBLIC held
    -- it to begin with. On the holding it did not: 34 of the 85 were open to
    -- PUBLIC and 51 were deliberately restricted, and the blanket re-grant gave
    -- `anon` — the role an unauthenticated browser gets — the right to call all
    -- 85, `control_records_purge` and `decide_approvals` among them. The
    -- installer's blast-radius photograph caught it in the same run and the
    -- privileges were put back from the holding's own dated dump
    -- (scripts/b36/restore-company-privileges.mjs). Nobody gains anything here:
    -- the set below is exactly who already had it, minus the new window.
    SELECT array_agg(r.rolname ORDER BY r.rolname) INTO v_holders
      FROM pg_roles r
     WHERE r.rolname NOT LIKE 'pg\_%'
       AND r.rolname <> 'dxb_reader'
       AND has_function_privilege(r.rolname, v_fn.oid, 'EXECUTE');

    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', v_fn.sig);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM dxb_reader', v_fn.sig);
    FOREACH v_role IN ARRAY coalesce(v_holders, ARRAY[]::text[]) LOOP
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO %I', v_fn.sig, v_role);
    END LOOP;
    v_walled := v_walled + 1;
  END LOOP;
  RAISE NOTICE 'B36 one-way window: % security-definer functions walled off from PUBLIC', v_walled;

  -- ------------------------------------------- the door nobody thinks to lock
  -- The two schemas above are the ones this work is about. They are not the
  -- whole database. Measured on the holding, 2026-08-24: `net.http_request_queue`
  -- and `net._http_response` — the pg_net extension's outbound-HTTP queue —
  -- grant INSERT to PUBLIC, and PUBLIC includes the window. A role that can put
  -- a row in that queue can make the server issue an HTTP request. The first
  -- version of this file walled the functions and left that queue open; its own
  -- closing assertion is what found it.
  --
  -- So: every table in every non-system schema that PUBLIC may write to loses
  -- that privilege, and every role that exists except dxb_reader is given it
  -- back by name. SELECT is not touched. Nothing that could write a second ago
  -- has stopped being able to.
  FOR v_fn IN
    SELECT c.oid,
           format('%I.%I', n.nspname, c.relname) AS sig,
           array_remove(ARRAY[
             CASE WHEN has_table_privilege('public', c.oid, 'INSERT')   THEN 'INSERT'   END,
             CASE WHEN has_table_privilege('public', c.oid, 'UPDATE')   THEN 'UPDATE'   END,
             CASE WHEN has_table_privilege('public', c.oid, 'DELETE')   THEN 'DELETE'   END,
             CASE WHEN has_table_privilege('public', c.oid, 'TRUNCATE') THEN 'TRUNCATE' END
           ], NULL) AS privs
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind IN ('r','p','v','m','f')
       AND n.nspname NOT IN ('pg_catalog','information_schema')
       AND (has_table_privilege('public', c.oid, 'INSERT')
         OR has_table_privilege('public', c.oid, 'UPDATE')
         OR has_table_privilege('public', c.oid, 'DELETE')
         OR has_table_privilege('public', c.oid, 'TRUNCATE'))
  LOOP
    -- Again: back to exactly who already held it, never to everyone.
    SELECT array_agg(r.rolname ORDER BY r.rolname) INTO v_holders
      FROM pg_roles r
     WHERE r.rolname NOT LIKE 'pg\_%'
       AND r.rolname <> 'dxb_reader'
       AND (has_table_privilege(r.rolname, v_fn.oid, 'INSERT')
         OR has_table_privilege(r.rolname, v_fn.oid, 'UPDATE')
         OR has_table_privilege(r.rolname, v_fn.oid, 'DELETE')
         OR has_table_privilege(r.rolname, v_fn.oid, 'TRUNCATE'));

    EXECUTE format('REVOKE %s ON TABLE %s FROM PUBLIC',
                   array_to_string(v_fn.privs, ', '), v_fn.sig);
    EXECUTE format('REVOKE %s ON TABLE %s FROM dxb_reader',
                   array_to_string(v_fn.privs, ', '), v_fn.sig);
    FOREACH v_role IN ARRAY coalesce(v_holders, ARRAY[]::text[]) LOOP
      EXECUTE format('GRANT %s ON TABLE %s TO %I',
                     array_to_string(v_fn.privs, ', '), v_fn.sig, v_role);
    END LOOP;
    v_sealed := v_sealed + 1;
    RAISE NOTICE 'B36 one-way window: sealed % (% taken from PUBLIC, returned to every other role)',
                 v_fn.sig, array_to_string(v_fn.privs, ',');
  END LOOP;

  -- TEMPORARY tables. PUBLIC holds TEMP on every database by default, so the
  -- window could have created session-local tables inside the holding's engine.
  -- Nothing of his would be in them and they die with the connection, but "not
  -- one letter" is the order. Same preserving shape: taken from PUBLIC, given
  -- back by name to everyone who is not the window.
  SELECT array_agg(r.rolname ORDER BY r.rolname) INTO v_holders
    FROM pg_roles r
   WHERE r.rolname NOT LIKE 'pg\_%'
     AND r.rolname <> 'dxb_reader'
     AND has_database_privilege(r.rolname, current_database(), 'TEMPORARY');
  EXECUTE 'REVOKE TEMPORARY ON DATABASE ' || quote_ident(current_database()) || ' FROM PUBLIC';
  EXECUTE 'REVOKE TEMPORARY ON DATABASE ' || quote_ident(current_database()) || ' FROM dxb_reader';
  FOREACH v_role IN ARRAY coalesce(v_holders, ARRAY[]::text[]) LOOP
    EXECUTE format('GRANT TEMPORARY ON DATABASE %I TO %I', current_database(), v_role);
  END LOOP;

  -- Defence in depth, not the wall: every transaction this role opens starts
  -- read-only, and it cannot sit on an open one. It can turn the first off; it
  -- cannot turn the privileges back on.
  EXECUTE 'ALTER ROLE dxb_reader SET default_transaction_read_only = on';
  EXECUTE 'ALTER ROLE dxb_reader SET statement_timeout = ''120s''';
  EXECUTE 'ALTER ROLE dxb_reader SET idle_in_transaction_session_timeout = ''60s''';

  -- --------------------------------------------------------- prove it, in place
  -- The migration refuses to succeed unless the window it just built is really
  -- one-way. Asked of the CATALOGUE, over every table in every schema — not of
  -- the two schemas this file happened to think about.
  SELECT string_agg(DISTINCT n.nspname || '.' || c.relname, ', ')
    INTO v_leak
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE c.relkind IN ('r', 'p', 'v', 'm', 'f')
     AND n.nspname NOT IN ('pg_catalog', 'information_schema')
     AND (has_table_privilege('dxb_reader', c.oid, 'INSERT')
       OR has_table_privilege('dxb_reader', c.oid, 'UPDATE')
       OR has_table_privilege('dxb_reader', c.oid, 'DELETE')
       OR has_table_privilege('dxb_reader', c.oid, 'TRUNCATE'));
  IF v_leak IS NOT NULL THEN
    RAISE EXCEPTION 'B36: the window can still WRITE to: %', v_leak;
  END IF;

  IF has_database_privilege('dxb_reader', current_database(), 'CREATE')
     OR has_schema_privilege('dxb_reader', 'public', 'CREATE')
     OR has_database_privilege('dxb_reader', current_database(), 'TEMPORARY') THEN
    RAISE EXCEPTION 'B36: the window can still CREATE inside the holding.';
  END IF;

  SELECT count(*) INTO v_visible
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r'
     AND has_table_privilege('dxb_reader', c.oid, 'SELECT');
  IF v_visible = 0 THEN
    RAISE EXCEPTION 'B36: the window is blind — it can read no table in public. '
      'A window that sees nothing is not a window, it is a wall with a name.';
  END IF;
  RAISE NOTICE 'B36 one-way window: reads % tables in public, writes 0 tables anywhere', v_visible;
END
$dxb$;
