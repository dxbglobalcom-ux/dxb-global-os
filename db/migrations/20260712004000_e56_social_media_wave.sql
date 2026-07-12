-- 20260712004000_e56_social_media_wave.sql
-- E5.6 — Social Media Department FINAL persona wave (11 specialists, Fable in person).
-- Org change in this wave is minimal: the 11 worker rows were created in 20260711004000
-- with persona_path pointing at the CEO directive (placeholder convention for unwritten
-- roles). Their v2 personas now exist at personas/social-media/<slug>.md, so this
-- migration repoints persona_path to the file-tree convention (same rule as
-- 20260712003000_persona_path_normalization: waves repoint their own rows).
-- manager_id (social-media-orchestrator) and role_level ('specialist') were already
-- set by the E5.3b org-closure migration — verified live 2026-07-12, no change needed.
-- Idempotent: WHERE clause makes the UPDATE a no-op on re-run (RUN2 expected: UPDATE 0).

BEGIN;

UPDATE public.agents
   SET persona_path = 'personas/' || department || '/' || slug || '.md',
       updated_at   = now()
 WHERE department = 'social-media'
   AND role = 'worker'
   AND employment_status <> 'archived'
   AND persona_path IS DISTINCT FROM 'personas/' || department || '/' || slug || '.md';

-- Guardrail: after this migration no active social-media row may point outside the
-- personas/ tree. Raises on violation so a partial state cannot land silently.
DO $$
DECLARE v_bad integer;
BEGIN
  SELECT count(*) INTO v_bad
    FROM public.agents
   WHERE department = 'social-media'
     AND employment_status <> 'archived'
     AND persona_path NOT LIKE 'personas/%';
  IF v_bad > 0 THEN
    RAISE EXCEPTION 'E5.6 guardrail: % social-media rows still off-convention', v_bad;
  END IF;
END $$;

COMMIT;
