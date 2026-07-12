-- 20260712002000_d4_wave_e55.sql — E5.5 D4 wave org preparation (engineering + quality)
-- WORKFORCE-GAP-MATRIX §2 (engineering 22 keep incl. lsp-index move [already in dept since E5.3b];
-- testing→quality 8 keep) + §5.2 backfill rules. Precedent: 20260712001000 (D3).
-- Language note: English from this file onward — CEO directive 2026-07-12 (~02:00, mid-D4);
-- see memory english-directive-2026-07-12 (registered, not a silent deviation).
-- No slug moves in D4: engineering keeps carry the engineering- prefix (dept matches prefix,
-- matrix lists short names as row labels only — D3 moves were dept-crossing, these are not);
-- quality workers keep the historical testing- prefix (dept renamed testing→quality at E5.3b,
-- slugs = file tree = DB, one-to-one rule preserved).
-- (1) REGISTERED LEVEL DECISIONS (not silent — this record):
--     engineering-backend-architect  specialist→senior_specialist (architecture-depth owner;
--       ADR raw-material authority; precedent: model-evaluation-lead in D3),
--     engineering-senior-developer   specialist→senior_specialist (Laravel line craft-standard owner;
--       "Senior" title + cross-role consultation duty recorded in persona §7),
--     testing-reality-checker        specialist→senior_specialist (Release Readiness OWNER — matrix §2
--       "expands as Release Readiness owner"; release-verdict authority),
--     testing-workflow-optimizer     specialist→senior_specialist (Process Excellence + CAPA OWNER —
--       matrix §2 "expands as Process Excellence owner"; cross-department CAPA authority).
-- (2) Integrity guardrails. Idempotent: conditional UPDATEs only.

BEGIN;

-- A) REGISTERED LEVEL DECISIONS (matrix §5.2: per-persona level set at wave writing)
UPDATE public.agents SET role_level='senior_specialist', updated_at=now()
 WHERE slug='engineering-backend-architect' AND role_level IS DISTINCT FROM 'senior_specialist';
UPDATE public.agents SET role_level='senior_specialist', updated_at=now()
 WHERE slug='engineering-senior-developer' AND role_level IS DISTINCT FROM 'senior_specialist';
UPDATE public.agents SET role_level='senior_specialist', updated_at=now()
 WHERE slug='testing-reality-checker' AND role_level IS DISTINCT FROM 'senior_specialist';
UPDATE public.agents SET role_level='senior_specialist', updated_at=now()
 WHERE slug='testing-workflow-optimizer' AND role_level IS DISTINCT FROM 'senior_specialist';

-- B) INTEGRITY GUARDRAILS (fail loudly if the D4 roster drifted)
DO $$
DECLARE
  v_eng int; v_q int; v_orphan int;
BEGIN
  SELECT count(*) INTO v_eng FROM public.agents
   WHERE department='engineering' AND employment_status<>'archived';
  IF v_eng <> 23 THEN
    RAISE EXCEPTION 'D4 guardrail: engineering active headcount expected 23 (22 workers + head), got %', v_eng;
  END IF;
  SELECT count(*) INTO v_q FROM public.agents
   WHERE department='quality' AND employment_status<>'archived';
  IF v_q <> 9 THEN
    RAISE EXCEPTION 'D4 guardrail: quality active headcount expected 9 (8 workers + head), got %', v_q;
  END IF;
  SELECT count(*) INTO v_orphan FROM public.agents
   WHERE department IN ('engineering','quality') AND employment_status<>'archived'
     AND role_level<>'director' AND manager_id IS NULL;
  IF v_orphan <> 0 THEN
    RAISE EXCEPTION 'D4 guardrail: orphan workers in engineering/quality: %', v_orphan;
  END IF;
END $$;

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- UPDATE public.agents SET role_level='specialist', updated_at=now()
--  WHERE slug IN ('engineering-backend-architect','engineering-senior-developer',
--                 'testing-reality-checker','testing-workflow-optimizer');
-- COMMIT;
