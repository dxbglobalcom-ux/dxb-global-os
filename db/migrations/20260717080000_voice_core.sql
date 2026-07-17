-- 20260717080000_voice_core.sql — R3.1 voice v1 (VOICE_INTERACTION_SPEC §11,
-- family 0029a): registry + call log. Additive only; control-seam-only writes
-- (P4); CEO-read via RLS (single-user dashboard: authenticated = CEO).

BEGIN;

CREATE TABLE IF NOT EXISTS public.voice_identities (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    uuid NOT NULL UNIQUE REFERENCES public.agents(id),
  engine      text NOT NULL,                  -- 'voicebox:chatterbox-ml' | 'speaches:kokoro' | 'speaches:piper' | future 'openai:realtime-mini'
  profile_ref text NOT NULL,                  -- clone profile path/voice id (NEVER raw audio in DB — spec §16)
  locale      text NOT NULL DEFAULT 'tr',
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active','retired')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.voice_calls (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at      timestamptz NOT NULL DEFAULT now(),
  ended_at        timestamptz,
  status          text NOT NULL DEFAULT 'listening'
                  CHECK (status IN ('listening','transcribing','routing','answering','speaking','ended','failed')),
  target_agent_id uuid REFERENCES public.agents(id),  -- answering director / Hamza
  transcript      jsonb NOT NULL DEFAULT '[]',        -- [{role, text, at}] + intent id lineage (V5)
  timeline        jsonb NOT NULL DEFAULT '[]',        -- state transitions + ms (spec §10)
  stt_ms          int,
  answer_ms       int,
  tts_ms          int,
  degraded        boolean NOT NULL DEFAULT false,     -- fallback (non-cloned) voice used
  cost_eur        numeric NOT NULL DEFAULT 0          -- stays 0 in v1 (V3/D1 proof)
);

CREATE INDEX IF NOT EXISTS voice_calls_started_idx ON public.voice_calls (started_at DESC);

-- Control seam only (P4): reads for the CEO session, writes via control fns.
REVOKE ALL ON public.voice_identities, public.voice_calls
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.voice_identities, public.voice_calls TO authenticated;
ALTER TABLE public.voice_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_calls      ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS voice_identities_read ON public.voice_identities;
CREATE POLICY voice_identities_read ON public.voice_identities FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS voice_calls_ceo_read ON public.voice_calls;
CREATE POLICY voice_calls_ceo_read ON public.voice_calls FOR SELECT TO authenticated USING (true);

COMMIT;

-- ROLLBACK (spec §23 — leaf objects):
--   DROP TABLE public.voice_calls; DROP TABLE public.voice_identities;
