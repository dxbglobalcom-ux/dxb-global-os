-- 20260915003000 — W7: the cancelled TTS kind leaves the studio's job book
--
-- WHY: on 2026-09-04 the CEO cancelled TTS for every video production
-- (tts-cancelled-engine-voice-only-2026-09-04: "şu yapay sesi iptal et tüm video üretimlerinde
-- reklamdan tut filme kadar. MiniMax H3'ün kendi sesi olsun"). The hand went on offering it for
-- eleven days: measured 2026-09-15, `media_jobs`'s kind CHECK still accepted 'voice' on BOTH
-- engines, `media_submit` still declared it, the lane still had a live runner for it, and the
-- text-to-speech binary was still installed. A seat could still ask for the thing he cancelled,
-- and it would have run. Audit F009.
--
-- WHAT: 'voice' leaves the CHECK. He was given two roads on 2026-09-15 — remove it outright, or
-- keep it and refuse it unless he registers an order for the job — and chose the first: "kaldır"
-- (w7-voice-hand-removed-2026-09-15). The constraint is recreated by name with the same shape,
-- minus that one value; nothing else on the table moves.
--
-- THE FIVE HISTORICAL ROWS STAY. Measured before this ran: 5 rows with kind='voice', all 'done'
-- (ids md5 9ffe4755d860e7396420dab31271a636). A CHECK constraint added with ALTER TABLE validates
-- existing rows and WOULD have refused this migration — which is why the constraint is added NOT
-- VALID and the old rows keep their place. Deleting them is W12 and needs his separate word;
-- closing a door is not a licence to burn the logbook.
--
-- NOT THIS MIGRATION, and measured to be untouched: the holding's own SPEAKING voice. Hamza speaks
-- through packages/voice (speaches:piper, voice_identities / voice_calls / voice_daemon_state),
-- which shares no table, no binary and no line of code with the media lane. His ruling
-- b33-voice-to-cloud-measurement-approved-2026-08-31 ("video uretirken holding sagir dilsiz
-- kalmasin") stands.
--
-- ROLLBACK:
--   ALTER TABLE public.media_jobs DROP CONSTRAINT IF EXISTS media_jobs_kind_check;
--   ALTER TABLE public.media_jobs
--     ADD CONSTRAINT media_jobs_kind_check
--     CHECK (kind = ANY (ARRAY['still'::text, 'shoot'::text, 'upscale'::text, 'voice'::text,
--                              'assemble'::text, 'probe'::text]));
--   -- and restore voiceEngine + its ENGINES key in packages/outbox-executor/src/media-lane.ts,
--   -- the voice params/description/enum in packages/dxb-mcp/src/groups/media.ts, then rebuild and
--   -- RESTART dxb-scheduler (the lane is code the daemon holds in memory — the W9 lesson).

BEGIN;

ALTER TABLE public.media_jobs DROP CONSTRAINT IF EXISTS media_jobs_kind_check;

-- NOT VALID: new rows are checked, the five historical 'voice' rows are left where they are.
ALTER TABLE public.media_jobs
  ADD CONSTRAINT media_jobs_kind_check
  CHECK (kind = ANY (ARRAY['still'::text, 'shoot'::text, 'upscale'::text, 'assemble'::text, 'probe'::text]))
  NOT VALID;

COMMENT ON COLUMN public.media_jobs.kind IS
  'The engine job asked for: still | shoot | upscale | assemble | probe. "voice" was retired on '
  '2026-09-15 (W7, CEO "kaldır", w7-voice-hand-removed-2026-09-15) because TTS is cancelled for '
  'every video production (CEO 2026-09-04) — the take carries its own voice. Five historical '
  'voice rows predate the retirement and are deliberately kept; removing them is W12.';

-- guardrail: the door must be shut, and the logbook must be intact
DO $$
DECLARE v_def text; v_old int;
BEGIN
  SELECT pg_get_constraintdef(c.oid) INTO v_def FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
   WHERE t.relname = 'media_jobs' AND c.conname = 'media_jobs_kind_check';
  IF v_def IS NULL OR v_def ILIKE '%''voice''%' THEN
    RAISE EXCEPTION 'W7: the kind CHECK still accepts voice: %', COALESCE(v_def, 'missing');
  END IF;
  SELECT count(*) INTO v_old FROM public.media_jobs WHERE kind = 'voice';
  RAISE NOTICE 'W7: kind CHECK shut; % historical voice row(s) kept (W12 owns their removal)', v_old;
END $$;

COMMIT;
