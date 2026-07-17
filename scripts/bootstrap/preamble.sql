-- R2.5 fresh-bootstrap preamble (audit F-08): the minimal platform surface a
-- BARE PostgreSQL database needs before the canonical migration chain runs.
-- On a real Supabase database every block below detects the platform object
-- and SKIPS — the preamble never replaces live Supabase machinery.
--
-- Provides (only when absent):
--   extensions: vector
--   roles: anon / authenticated / service_role (cluster may lack them)
--   auth schema + auth.uid()          (17 migration references)
--   realtime schema + realtime.messages + send/broadcast_changes no-op stubs
--   supabase_migrations.schema_migrations ledger (version, statements, name)

CREATE EXTENSION IF NOT EXISTS vector;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS auth;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'auth' AND p.proname = 'uid'
  ) THEN
    -- Supabase-compatible: sub claim of the request JWT.
    CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE AS
    $f$ SELECT (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'sub')::uuid $f$;
  END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS realtime;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'realtime' AND table_name = 'messages'
  ) THEN
    CREATE TABLE realtime.messages (
      id             uuid NOT NULL DEFAULT gen_random_uuid(),
      topic          text NOT NULL,
      extension      text NOT NULL DEFAULT 'broadcast',
      event          text,
      payload        jsonb,
      private        boolean DEFAULT false,
      binary_payload bytea,
      updated_at     timestamp NOT NULL DEFAULT now(),
      inserted_at    timestamp NOT NULL DEFAULT now(),
      PRIMARY KEY (id, inserted_at)
    );
    ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'realtime' AND p.proname = 'topic'
  ) THEN
    -- RLS policies on realtime.messages filter by the subscribed topic.
    CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE AS
    $f$ SELECT nullif(current_setting('realtime.topic', true), '') $f$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'realtime' AND p.proname = 'send'
  ) THEN
    -- No-op stub with the live signature: fresh envs have no realtime engine;
    -- the row lands in realtime.messages so smoke flows can assert delivery.
    CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean)
    RETURNS void LANGUAGE sql AS
    $f$ INSERT INTO realtime.messages (topic, extension, event, payload, private)
        VALUES (topic, 'broadcast', event, payload, private) $f$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'realtime' AND p.proname = 'broadcast_changes'
  ) THEN
    CREATE FUNCTION realtime.broadcast_changes(
      topic_name text, event_name text, operation text, table_name text,
      table_schema text, new record, old record, level text DEFAULT 'ROW'
    ) RETURNS void LANGUAGE plpgsql AS
    $f$ BEGIN
      INSERT INTO realtime.messages (topic, extension, event, payload, private)
      VALUES (topic_name, 'broadcast', event_name,
              jsonb_build_object('operation', operation, 'table', table_name), true);
    END $f$;
  END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version    text PRIMARY KEY,
  statements text[],
  name       text
);
