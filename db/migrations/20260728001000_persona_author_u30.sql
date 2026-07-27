-- 20260728001000 — personas.author accepts the CEO's actual authorship rule (U20 + U30)
--
-- WHY: `personas_author_check` allowed only ('fable-5','hr-factory'). Construction authorship
-- moved to Opus 5 on 2026-07-25 (U20) and became SHARED between Opus 5 and Fable 5 on
-- 2026-07-26 (U30, CEO: "bu benim en son nihai kararım" — whichever model runs the session is
-- that session's author). The constraint was never updated, so the database physically refused
-- to record the truth: an Opus 5 session could only file a persona by labelling it Fable 5's
-- work. Measured on 2026-07-27 while recording the CEO's Hamza ruling —
--   ERROR: new row for relation "personas" violates check constraint "personas_author_check"
-- and the sibling defect it had been hiding: `scripts/sync-personas-to-db.sh` hardcoded
-- 'fable-5', so until today every persona an Opus 5 session synced was filed under the wrong
-- author and nobody saw an error. Both legs are fixed in the same turn (CEO rule: a defect is
-- repaired at its source, with a permanent gate, in the turn it is found).
--
-- WHAT: extend the allowed set. 'hr-factory' stays (the machine intake path). 'fable-5' stays —
-- historical rows are authorship history and are never rewritten (U20 boundary: "tarihsel kayıt
-- dokunulmaz"). 'opus-5' joins as an equal author.
--
-- NOT DONE ON PURPOSE: existing rows are NOT relabelled. Rows written by an Opus 5 session
-- before today carry 'fable-5' because that is what the machine recorded; guessing which ones
-- were mislabelled would replace one wrong record with another (RULE #0-A). The gate now
-- prevents the class going forward, and the script refuses to run without a declared author.

BEGIN;

ALTER TABLE public.personas DROP CONSTRAINT IF EXISTS personas_author_check;

ALTER TABLE public.personas
  ADD CONSTRAINT personas_author_check
  CHECK (author = ANY (ARRAY['opus-5'::text, 'fable-5'::text, 'hr-factory'::text]));

COMMENT ON COLUMN public.personas.author IS
  'Who wrote this persona version. U30 (CEO 2026-07-26): construction authorship is shared — '
  'the model running the session is its author. opus-5 | fable-5 (both first-class) | '
  'hr-factory (machine intake). Historical rows are never rewritten.';

COMMIT;
