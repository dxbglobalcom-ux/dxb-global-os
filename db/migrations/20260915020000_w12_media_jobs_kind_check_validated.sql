-- 20260915020000_w12_media_jobs_kind_check_validated.sql — W12: the job book's guard is whole again.
--
-- His word 2026-09-15: *"w12 yap. sil gitsin gerek yok. geride iz bırakmaya."* — the residue of the
-- films he had deleted on 2026-09-05 was purged from the company's books the same hour: the five
-- `kind='voice'` rows the cancelled TTS hand had written on 2026-09-03 (media_jobs 37 → 32) and the
-- six audit rows that still named DXB-V-OE-005 / DXB-V-OE-007 (audit_log 10 285 → 10 279).
--
-- W7 (2026-09-15, his word "kaldır") had removed `voice` from the kind CHECK but had to add the
-- constraint `NOT VALID`, because validating it would have been refused while those five rows lived —
-- and the alternative, deleting a logbook without his word, is not a thing this house does. The note
-- W7 left behind said in as many words: a future VALIDATE will fail while they exist.
--
-- They no longer exist. The constraint is validated here, so the guard covers every row in the table
-- and not only the new ones. Idempotent: on an engine where it is already validated this is a no-op,
-- and on a fresh chain there was never a voice row to validate against.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint
              WHERE conrelid = 'public.media_jobs'::regclass
                AND conname = 'media_jobs_kind_check' AND NOT convalidated) THEN
    ALTER TABLE public.media_jobs VALIDATE CONSTRAINT media_jobs_kind_check;
    RAISE NOTICE 'w12: media_jobs_kind_check validated';
  ELSE
    RAISE NOTICE 'w12: media_jobs_kind_check already validated on this engine — nothing to do';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint
              WHERE conrelid = 'public.media_jobs'::regclass
                AND conname = 'media_jobs_kind_check' AND NOT convalidated) THEN
    RAISE EXCEPTION 'W12: media_jobs_kind_check is still NOT VALID';
  END IF;
  IF EXISTS (SELECT 1 FROM public.media_jobs WHERE kind = 'voice') THEN
    RAISE EXCEPTION 'W12: a voice row survives the purge';
  END IF;
END $$;
