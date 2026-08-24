-- B36 · Block 3 — THE ONE-WAY WINDOW.
--
-- CEO, 2026-08-24, approving the BUILD of this block: "onaylıyorum" — and, the
-- same morning, the order it has to satisfy: "bundan sonra TEK BİR HARF DAHİ
-- ŞİRKETİN VERİ TABANINA GİRMESİN!"  After this file runs, the construction side
-- keeps one login into the holding's database that can LOOK and can touch
-- nothing, and the refusal is issued by PostgreSQL itself rather than by our
-- code. A future session that writes the wrong line still cannot write.
--
-- HIS APPROVAL WAS PERMISSION TO BUILD, NOT ACCEPTANCE OF THE RESULT. The first
-- version of this file was audited on 2026-08-24 and FAILED, on two escapes it
-- had never tried, both reproduced against the real role:
--
--   1. LARGE OBJECTS. `dxb_reader` could turn its read-only default off and call
--      lo_create / lo_from_bytea / lo_put / lowrite — seventeen large-object
--      functions were executable by it, because PostgreSQL grants EXECUTE on
--      them to PUBLIC by default and PUBLIC includes every role that will ever
--      exist. A large object is permanent data inside the CEO's database.
--   2. A SEQUENCE. `net.http_request_queue_id_seq` carried `=rwU` — SELECT,
--      UPDATE and USAGE to PUBLIC — so the window could call nextval() and
--      setval() on the holding's outbound-request counter. A sequence
--      advancement is NOT undone by ROLLBACK; it is the one write that survives
--      a rolled-back transaction.
--
-- The audit's verdict was right about the deeper failure too: the drill had
-- tried 23 routes and refused 23, and had simply never tried these. A green
-- test that never asked the question is not an answer. So this file no longer
-- closes examples — it closes CLASSES, and the closing assertion at the bottom
-- is written from the same predicate the sealing loops use, so the two cannot
-- drift apart.
--
-- WHAT IS SEALED, AND WHY EACH ONE IS A ROUTE OUT
--
--   · SCHEMAS. Anything but `public` and `pgboss` is taken away. `net` alone
--     carried the sequence above, TRIGGER/MAINTAIN/REFERENCES on two tables,
--     and `net.wake()` / `net.worker_restart()` — a route to restart the
--     holding's background worker, which is an outside effect even though it
--     writes no row.
--   · SEQUENCES, everywhere. USAGE and UPDATE are a permanent change; SELECT
--     goes with them because the window has no business with any counter.
--   · TABLES, everywhere, on SEVEN verbs and not four: INSERT, UPDATE, DELETE,
--     TRUNCATE and also REFERENCES, TRIGGER, MAINTAIN. TRIGGER is the right to
--     hang code on the CEO's table; MAINTAIN is VACUUM / REINDEX / REFRESH
--     MATERIALIZED VIEW, which rewrites what is on his disk.
--   · FUNCTIONS whose call can leave something behind: every SECURITY DEFINER
--     function in every schema (they run with their OWNER's privileges), the
--     whole large-object family, and the named catalogue functions that write
--     WAL, create replication slots, reset statistics, signal other backends,
--     read server files or take advisory locks the holding's own workers need.
--   · WHAT DOES NOT EXIST YET. Default privileges are rewritten so a function
--     created tomorrow in public or pgboss is not handed to PUBLIC — which is
--     how the window would have been given a new back door by the next
--     migration.
--
-- THE ONE ROUTE POSTGRESQL CANNOT REFUSE, stated here so nobody has to discover
-- it twice: the `NOTIFY` COMMAND has no privilege in PostgreSQL. Any role that
-- may connect may notify any channel. The FUNCTION pg_notify() is sealed below
-- because a function has an ACL; the command does not, and no GRANT or REVOKE
-- can reach it. It writes no row and a rolled-back transaction sends nothing,
-- but a committed one would put a forged event on the CEO's live screen. That
-- is measured, not assumed — `scripts/b36/prove-window.mjs construction` runs it
-- — and closing it belongs to the listener, not to a privilege.
--
-- HOW THIS BREAKS NOTHING (his law of 2026-08-17). Every privilege taken from
-- PUBLIC is given back, BY NAME, to every role that held it a moment earlier.
-- PostgreSQL has no DENY, so this is the only shape that can single out one
-- role. Every caller that could do a thing a second ago can still do it; only
-- the new window cannot. The complete privilege matrix is photographed before
-- and after by scripts/b36/install-company-window.mjs, which also writes an
-- exact undo file, and any change to any role but dxb_reader stops the install.
-- The one deliberate exception is stated where it happens: for objects that DO
-- NOT EXIST YET, "who already held it" is by definition every role that exists
-- now, so the default-privilege block below names all of them.
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
-- WHY THIS IS NOT A MIGRATION. It creates no table, no column, no view and no
-- function: it creates a ROLE and moves PRIVILEGES, which is an act on the
-- ENGINE, not on the schema — and a schema chain that both engines share is the
-- wrong place for either. It also cannot be done by the application's own role:
-- the objects it must seal include tables owned by `supabase_admin` and
-- functions owned by the system, and `postgres` is a member of neither. This
-- file is applied by the installer as the engine's own administrator.
--
-- IDEMPOTENT and safe to re-run.

DO $dxb$
DECLARE
  -- ONE definition of "a function whose call can leave something behind",
  -- interpolated into BOTH the sealing loop and the closing assertion. The
  -- audit's real finding was that a seal and its proof had drifted apart; they
  -- cannot here, because there is only one sentence.
  c_effectful CONSTANT text := $flt$
       (p.prosecdef AND n.nspname NOT IN ('pg_catalog','information_schema'))
    OR (n.nspname = 'pg_catalog' AND (
             p.proname ~ '^lo_' OR p.proname IN ('loread','lowrite')
          OR p.proname ~ '^pg_(try_)?advisory'
          OR p.proname IN (
               'pg_notify','pg_logical_emit_message','pg_create_restore_point',
               'pg_switch_wal','pg_promote','pg_backup_start','pg_backup_stop',
               'pg_create_logical_replication_slot','pg_create_physical_replication_slot',
               'pg_drop_replication_slot','pg_replication_origin_create',
               'pg_replication_origin_advance','pg_replication_origin_drop',
               'pg_replication_origin_session_setup','pg_replication_origin_xact_setup',
               'pg_import_system_collations','pg_cancel_backend','pg_terminate_backend',
               'pg_reload_conf','pg_rotate_logfile','pg_log_backend_memory_contexts',
               'pg_stat_reset','pg_stat_reset_shared','pg_stat_reset_slru',
               'pg_stat_reset_single_table_counters','pg_stat_reset_single_function_counters',
               'pg_stat_reset_replication_slot','pg_stat_reset_subscription_stats',
               'pg_read_file','pg_read_binary_file','pg_ls_dir','pg_stat_file',
               'pg_file_write','pg_file_unlink','pg_file_rename','pg_execute_server_program',
               'pg_alter_replica_identity')))
  $flt$;

  -- The seven table verbs. Four of them were the whole of the first version.
  c_verbs CONSTANT text[] := ARRAY['INSERT','UPDATE','DELETE','TRUNCATE',
                                   'REFERENCES','TRIGGER','MAINTAIN'];

  v_schema   text;
  v_role     text;
  v_creator  text;
  v_obj      record;
  v_holders  text[];
  v_privs    text[];
  v_leak     text;
  v_visible  int;
  v_walled   int := 0;
  v_sealed   int := 0;
  v_seqs     int := 0;
  v_schemas  int := 0;
  v_defaults int := 0;
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
              WHERE rolname = 'dxb_reader'
                AND (rolsuper OR rolreplication OR rolcreatedb OR rolcreaterole)) THEN
    RAISE EXCEPTION 'B36: dxb_reader holds SUPERUSER, REPLICATION, CREATEDB or '
      'CREATEROLE. The window is supposed to be the weakest login on this '
      'engine. Drop the role and re-run this file as a superuser.';
  END IF;

  -- Membership is a back door with no ACL of its own: a member inherits, or can
  -- SET ROLE to, everything the group holds.
  IF EXISTS (SELECT 1 FROM pg_auth_members m
               JOIN pg_roles r ON r.oid = m.member
              WHERE r.rolname = 'dxb_reader') THEN
    RAISE EXCEPTION 'B36: dxb_reader is a member of another role. Revoke that '
      'membership — it carries privileges no REVOKE in this file can reach.';
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
      EXECUTE format('REVOKE %s ON ALL TABLES IN SCHEMA %I FROM dxb_reader',
                     array_to_string(c_verbs, ', '), v_schema);
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

  -- ------------------------------------------------- every OTHER schema, gone
  -- The audit found the window standing inside `net` — the pg_net extension's
  -- schema — because PUBLIC holds USAGE on it. From in there it reached the
  -- outbound-request counter, three table privileges nobody had counted, and
  -- net.wake() / net.worker_restart(). One schema was the example; the class is
  -- "every schema this file did not deliberately open".
  FOR v_obj IN
    SELECT n.oid, n.nspname
      FROM pg_namespace n
     WHERE n.nspname NOT IN ('public', 'pgboss', 'pg_catalog', 'information_schema')
       AND n.nspname NOT LIKE 'pg\_%'
       AND has_schema_privilege('dxb_reader', n.oid, 'USAGE')
     ORDER BY n.nspname
  LOOP
    SELECT array_agg(r.rolname ORDER BY r.rolname) INTO v_holders
      FROM pg_roles r
     WHERE r.rolname NOT LIKE 'pg\_%'
       AND r.rolname <> 'dxb_reader'
       AND has_schema_privilege(r.rolname, v_obj.oid, 'USAGE');

    EXECUTE format('REVOKE USAGE ON SCHEMA %I FROM PUBLIC', v_obj.nspname);
    EXECUTE format('REVOKE ALL ON SCHEMA %I FROM dxb_reader', v_obj.nspname);
    FOREACH v_role IN ARRAY coalesce(v_holders, ARRAY[]::text[]) LOOP
      EXECUTE format('GRANT USAGE ON SCHEMA %I TO %I', v_obj.nspname, v_role);
    END LOOP;
    v_schemas := v_schemas + 1;
    RAISE NOTICE 'B36 one-way window: schema % closed to the window (USAGE returned to % other roles)',
                 v_obj.nspname, coalesce(array_length(v_holders, 1), 0);
  END LOOP;

  -- --------------------------------------------------------- every SEQUENCE
  -- THE SECOND AUDITED ESCAPE. nextval() and setval() are not undone by
  -- ROLLBACK — PostgreSQL says so in as many words — so a counter the window can
  -- turn is the one write that outlives a rolled-back transaction. Asked of
  -- every schema, not of the two this file grants in.
  FOR v_obj IN
    SELECT c.oid, format('%I.%I', n.nspname, c.relname) AS sig,
           array_remove(ARRAY[
             CASE WHEN has_sequence_privilege('public', c.oid, 'USAGE')  THEN 'USAGE'  END,
             CASE WHEN has_sequence_privilege('public', c.oid, 'UPDATE') THEN 'UPDATE' END,
             CASE WHEN has_sequence_privilege('public', c.oid, 'SELECT') THEN 'SELECT' END
           ], NULL) AS privs
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind = 'S'
       AND n.nspname NOT IN ('pg_catalog', 'information_schema')
       AND (has_sequence_privilege('dxb_reader', c.oid, 'USAGE')
         OR has_sequence_privilege('dxb_reader', c.oid, 'UPDATE')
         OR has_sequence_privilege('dxb_reader', c.oid, 'SELECT'))
     ORDER BY 2
  LOOP
    EXECUTE format('REVOKE ALL ON SEQUENCE %s FROM dxb_reader', v_obj.sig);

    IF coalesce(array_length(v_obj.privs, 1), 0) > 0 THEN
      SELECT array_agg(r.rolname ORDER BY r.rolname) INTO v_holders
        FROM pg_roles r
       WHERE r.rolname NOT LIKE 'pg\_%'
         AND r.rolname <> 'dxb_reader'
         AND (has_sequence_privilege(r.rolname, v_obj.oid, 'USAGE')
           OR has_sequence_privilege(r.rolname, v_obj.oid, 'UPDATE')
           OR has_sequence_privilege(r.rolname, v_obj.oid, 'SELECT'));

      EXECUTE format('REVOKE %s ON SEQUENCE %s FROM PUBLIC',
                     array_to_string(v_obj.privs, ', '), v_obj.sig);
      FOREACH v_role IN ARRAY coalesce(v_holders, ARRAY[]::text[]) LOOP
        EXECUTE format('GRANT %s ON SEQUENCE %s TO %I',
                       array_to_string(v_obj.privs, ', '), v_obj.sig, v_role);
      END LOOP;
      RAISE NOTICE 'B36 one-way window: sealed sequence % (% taken from PUBLIC, returned to every other role)',
                   v_obj.sig, array_to_string(v_obj.privs, ',');
    END IF;
    v_seqs := v_seqs + 1;
  END LOOP;

  -- ----------------------------------------------------------- every FUNCTION
  -- A SECURITY DEFINER function runs with its OWNER's privileges, so a window
  -- holding SELECT and nothing else could still have called one and written a
  -- row. That was the first version's finding and it stands. What the audit
  -- added is the rest of the class: the large-object family, which PostgreSQL
  -- hands to PUBLIC by default and which writes permanent data into
  -- pg_largeobject; and the catalogue functions that emit WAL, create
  -- replication slots, reset the server's statistics, signal other backends,
  -- read files off the server's disk, or take the advisory locks the holding's
  -- own workers rely on.
  --
  -- WHO COULD RUN THIS A MOMENT AGO. Asked one function at a time, and this is
  -- the correction that came out of the first version's mistake: it handed
  -- EXECUTE back to EVERY role on the engine, which is exact only where PUBLIC
  -- held it to begin with. On the holding it did not — 34 of 85 were open and 51
  -- were deliberately restricted — and the blanket re-grant gave `anon`, the
  -- role an unauthenticated browser gets, the right to call
  -- control_records_purge and decide_approvals. Nobody gains anything here: the
  -- set below is exactly who already had it, minus the new window.
  FOR v_obj IN EXECUTE format($q$
    SELECT p.oid,
           format('%%I.%%I(%%s)', n.nspname, p.proname,
                  pg_get_function_identity_arguments(p.oid)) AS sig
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE (%s)
       AND has_function_privilege('dxb_reader', p.oid, 'EXECUTE')
     ORDER BY 2
  $q$, c_effectful)
  LOOP
    SELECT array_agg(r.rolname ORDER BY r.rolname) INTO v_holders
      FROM pg_roles r
     WHERE r.rolname NOT LIKE 'pg\_%'
       AND r.rolname <> 'dxb_reader'
       AND has_function_privilege(r.rolname, v_obj.oid, 'EXECUTE');

    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', v_obj.sig);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM dxb_reader', v_obj.sig);
    FOREACH v_role IN ARRAY coalesce(v_holders, ARRAY[]::text[]) LOOP
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO %I', v_obj.sig, v_role);
    END LOOP;
    v_walled := v_walled + 1;
  END LOOP;
  RAISE NOTICE 'B36 one-way window: % functions whose call can leave something behind, walled off from PUBLIC', v_walled;

  -- -------------------------------------------------------------- every TABLE
  -- Seven verbs, every schema. INSERT/UPDATE/DELETE/TRUNCATE were the first
  -- version's four; the audit added REFERENCES, TRIGGER and MAINTAIN, and it was
  -- right — PUBLIC held exactly `rxtm` on net.http_request_queue and
  -- net._http_response, so the window could have hung a TRIGGER on the holding's
  -- outbound queue or REINDEXed it under the CEO's feet.
  FOR v_obj IN
    SELECT c.oid,
           format('%I.%I', n.nspname, c.relname) AS sig,
           array_remove(ARRAY[
             CASE WHEN has_table_privilege('public', c.oid, 'INSERT')     THEN 'INSERT'     END,
             CASE WHEN has_table_privilege('public', c.oid, 'UPDATE')     THEN 'UPDATE'     END,
             CASE WHEN has_table_privilege('public', c.oid, 'DELETE')     THEN 'DELETE'     END,
             CASE WHEN has_table_privilege('public', c.oid, 'TRUNCATE')   THEN 'TRUNCATE'   END,
             CASE WHEN has_table_privilege('public', c.oid, 'REFERENCES') THEN 'REFERENCES' END,
             CASE WHEN has_table_privilege('public', c.oid, 'TRIGGER')    THEN 'TRIGGER'    END,
             CASE WHEN has_table_privilege('public', c.oid, 'MAINTAIN')   THEN 'MAINTAIN'   END
           ], NULL) AS privs
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind IN ('r','p','v','m','f')
       AND n.nspname NOT IN ('pg_catalog','information_schema')
       AND (has_table_privilege('public', c.oid, 'INSERT')
         OR has_table_privilege('public', c.oid, 'UPDATE')
         OR has_table_privilege('public', c.oid, 'DELETE')
         OR has_table_privilege('public', c.oid, 'TRUNCATE')
         OR has_table_privilege('public', c.oid, 'REFERENCES')
         OR has_table_privilege('public', c.oid, 'TRIGGER')
         OR has_table_privilege('public', c.oid, 'MAINTAIN'))
     ORDER BY 2
  LOOP
    -- Again: back to exactly who already held it, never to everyone.
    SELECT array_agg(r.rolname ORDER BY r.rolname) INTO v_holders
      FROM pg_roles r
     WHERE r.rolname NOT LIKE 'pg\_%'
       AND r.rolname <> 'dxb_reader'
       AND (has_table_privilege(r.rolname, v_obj.oid, 'INSERT')
         OR has_table_privilege(r.rolname, v_obj.oid, 'UPDATE')
         OR has_table_privilege(r.rolname, v_obj.oid, 'DELETE')
         OR has_table_privilege(r.rolname, v_obj.oid, 'TRUNCATE')
         OR has_table_privilege(r.rolname, v_obj.oid, 'REFERENCES')
         OR has_table_privilege(r.rolname, v_obj.oid, 'TRIGGER')
         OR has_table_privilege(r.rolname, v_obj.oid, 'MAINTAIN'));

    EXECUTE format('REVOKE %s ON TABLE %s FROM PUBLIC',
                   array_to_string(v_obj.privs, ', '), v_obj.sig);
    EXECUTE format('REVOKE %s ON TABLE %s FROM dxb_reader',
                   array_to_string(v_obj.privs, ', '), v_obj.sig);
    FOREACH v_role IN ARRAY coalesce(v_holders, ARRAY[]::text[]) LOOP
      EXECUTE format('GRANT %s ON TABLE %s TO %I',
                     array_to_string(v_obj.privs, ', '), v_obj.sig, v_role);
    END LOOP;
    v_sealed := v_sealed + 1;
    RAISE NOTICE 'B36 one-way window: sealed % (% taken from PUBLIC, returned to every other role)',
                 v_obj.sig, array_to_string(v_obj.privs, ',');
  END LOOP;

  -- A direct grant to the window itself, anywhere, on any of the seven.
  FOR v_obj IN
    SELECT format('%I.%I', n.nspname, c.relname) AS sig,
           array_remove(ARRAY[
             CASE WHEN has_table_privilege('dxb_reader', c.oid, 'INSERT')     THEN 'INSERT'     END,
             CASE WHEN has_table_privilege('dxb_reader', c.oid, 'UPDATE')     THEN 'UPDATE'     END,
             CASE WHEN has_table_privilege('dxb_reader', c.oid, 'DELETE')     THEN 'DELETE'     END,
             CASE WHEN has_table_privilege('dxb_reader', c.oid, 'TRUNCATE')   THEN 'TRUNCATE'   END,
             CASE WHEN has_table_privilege('dxb_reader', c.oid, 'REFERENCES') THEN 'REFERENCES' END,
             CASE WHEN has_table_privilege('dxb_reader', c.oid, 'TRIGGER')    THEN 'TRIGGER'    END,
             CASE WHEN has_table_privilege('dxb_reader', c.oid, 'MAINTAIN')   THEN 'MAINTAIN'   END
           ], NULL) AS privs
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind IN ('r','p','v','m','f')
       AND n.nspname NOT IN ('pg_catalog','information_schema')
       AND (has_table_privilege('dxb_reader', c.oid, 'INSERT')
         OR has_table_privilege('dxb_reader', c.oid, 'UPDATE')
         OR has_table_privilege('dxb_reader', c.oid, 'DELETE')
         OR has_table_privilege('dxb_reader', c.oid, 'TRUNCATE')
         OR has_table_privilege('dxb_reader', c.oid, 'REFERENCES')
         OR has_table_privilege('dxb_reader', c.oid, 'TRIGGER')
         OR has_table_privilege('dxb_reader', c.oid, 'MAINTAIN'))
  LOOP
    EXECUTE format('REVOKE %s ON TABLE %s FROM dxb_reader',
                   array_to_string(v_obj.privs, ', '), v_obj.sig);
  END LOOP;

  -- TEMPORARY tables. PUBLIC holds TEMP on every database by default, so the
  -- window could have created session-local tables inside the holding's engine.
  -- Nothing of his would be in them and they die with the connection, but "not
  -- one letter" is the order. Same preserving shape.
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

  -- ------------------------------------------------- what does not exist yet
  -- PostgreSQL's built-in default hands EXECUTE on every NEW function to PUBLIC.
  -- Without this block the next migration to add a SECURITY DEFINER function
  -- would quietly hand the window a fresh back door, and the seal above would be
  -- true only until the next deploy.
  --
  -- THE ONE PLACE THIS FILE NAMES EVERY ROLE. For an object that does not exist
  -- yet there is no "who held it a moment ago" to measure — the answer is every
  -- role that exists, because the built-in default is PUBLIC. So every current
  -- role is named and only the window is left out. A role created AFTER this
  -- runs will need an explicit grant, and that is the intended, stated cost.
  FOREACH v_schema IN ARRAY ARRAY['public', 'pgboss'] LOOP
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = v_schema) THEN
      FOREACH v_creator IN ARRAY ARRAY['postgres', 'supabase_admin'] LOOP
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = v_creator) THEN
          BEGIN
            EXECUTE format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA %I '
                           'REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC', v_creator, v_schema);
            FOR v_role IN
              SELECT rolname FROM pg_roles
               WHERE rolname NOT LIKE 'pg\_%' AND rolname <> 'dxb_reader' ORDER BY 1
            LOOP
              EXECUTE format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA %I '
                             'GRANT EXECUTE ON FUNCTIONS TO %I', v_creator, v_schema, v_role);
            END LOOP;
            v_defaults := v_defaults + 1;
          EXCEPTION WHEN insufficient_privilege THEN
            NULL;  -- cannot speak for that creator on this engine; harmless
          END;
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  -- Defence in depth, not the wall: every transaction this role opens starts
  -- read-only, and it cannot sit on an open one. It can turn the first off — the
  -- audit proved it, and so does the drill — and it still cannot turn one
  -- privilege back on.
  EXECUTE 'ALTER ROLE dxb_reader SET default_transaction_read_only = on';
  EXECUTE 'ALTER ROLE dxb_reader SET statement_timeout = ''120s''';
  EXECUTE 'ALTER ROLE dxb_reader SET idle_in_transaction_session_timeout = ''60s''';

  -- --------------------------------------------------------- prove it, in place
  -- The file refuses to succeed unless the window it just built is really
  -- one-way. Asked of the CATALOGUE, over every object in every schema, and
  -- asked with the SAME predicate the sealing used.

  -- 1. tables, all seven verbs, everywhere
  SELECT string_agg(DISTINCT n.nspname || '.' || c.relname, ', ')
    INTO v_leak
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE c.relkind IN ('r','p','v','m','f')
     AND n.nspname NOT IN ('pg_catalog','information_schema')
     AND (has_table_privilege('dxb_reader', c.oid, 'INSERT')
       OR has_table_privilege('dxb_reader', c.oid, 'UPDATE')
       OR has_table_privilege('dxb_reader', c.oid, 'DELETE')
       OR has_table_privilege('dxb_reader', c.oid, 'TRUNCATE')
       OR has_table_privilege('dxb_reader', c.oid, 'REFERENCES')
       OR has_table_privilege('dxb_reader', c.oid, 'TRIGGER')
       OR has_table_privilege('dxb_reader', c.oid, 'MAINTAIN'));
  IF v_leak IS NOT NULL THEN
    RAISE EXCEPTION 'B36: the window can still change or maintain: %', v_leak;
  END IF;

  -- 2. sequences, everywhere — the audited escape that survives ROLLBACK
  SELECT string_agg(DISTINCT n.nspname || '.' || c.relname, ', ')
    INTO v_leak
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE c.relkind = 'S'
     AND n.nspname NOT IN ('pg_catalog','information_schema')
     AND (has_sequence_privilege('dxb_reader', c.oid, 'USAGE')
       OR has_sequence_privilege('dxb_reader', c.oid, 'UPDATE')
       OR has_sequence_privilege('dxb_reader', c.oid, 'SELECT'));
  IF v_leak IS NOT NULL THEN
    RAISE EXCEPTION 'B36: the window can still turn a counter: %', v_leak;
  END IF;

  -- 3. functions whose call can leave something behind — the same sentence the
  --    sealing loop used, so a route sealed by one and missed by the other
  --    cannot exist
  EXECUTE format($q$
    SELECT string_agg(DISTINCT n.nspname || '.' || p.proname, ', ')
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE (%s) AND has_function_privilege('dxb_reader', p.oid, 'EXECUTE')
  $q$, c_effectful) INTO v_leak;
  IF v_leak IS NOT NULL THEN
    RAISE EXCEPTION 'B36: the window can still CALL: %', v_leak;
  END IF;

  -- 4. the rooms it may stand in at all
  SELECT string_agg(DISTINCT n.nspname, ', ')
    INTO v_leak
    FROM pg_namespace n
   WHERE n.nspname NOT IN ('public','pgboss','information_schema')
     AND n.nspname NOT LIKE 'pg\_%'
     AND has_schema_privilege('dxb_reader', n.oid, 'USAGE');
  IF v_leak IS NOT NULL THEN
    RAISE EXCEPTION 'B36: the window can still stand inside: %', v_leak;
  END IF;

  -- 5. creating anything at all
  IF has_database_privilege('dxb_reader', current_database(), 'CREATE')
     OR has_schema_privilege('dxb_reader', 'public', 'CREATE')
     OR has_database_privilege('dxb_reader', current_database(), 'TEMPORARY') THEN
    RAISE EXCEPTION 'B36: the window can still CREATE inside the holding.';
  END IF;

  -- 6. what a future object would hand it
  SELECT string_agg(DISTINCT coalesce(n.nspname,'<database-wide>') || ':' || d.defaclobjtype::text, ', ')
    INTO v_leak
    FROM pg_default_acl d
    LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace
   WHERE d.defaclobjtype <> 'r'                      -- SELECT on future tables is this file's own doing
     AND array_to_string(d.defaclacl, ' ') ~ '(^|\s)(dxb_reader|)=';
  IF v_leak IS NOT NULL THEN
    RAISE EXCEPTION 'B36: a default privilege would hand the window something: %', v_leak;
  END IF;

  -- 7. and it must still be a window
  SELECT count(*) INTO v_visible
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r'
     AND has_table_privilege('dxb_reader', c.oid, 'SELECT');
  IF v_visible = 0 THEN
    RAISE EXCEPTION 'B36: the window is blind — it can read no table in public. '
      'A window that sees nothing is not a window, it is a wall with a name.';
  END IF;

  RAISE NOTICE 'B36 one-way window: reads % tables in public; 0 tables it can change, '
               '0 counters it can turn, 0 effectful functions it can call, % schemas closed, '
               '% sequences swept, % tables sealed, % default-privilege sets rewritten',
               v_visible, v_schemas, v_seqs, v_sealed, v_defaults;
END
$dxb$;
