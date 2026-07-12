-- 20260712005000_d7a_promise_debt_e57.sql — E5.7b (D7-A): the 5 matrix-promised ADD roles
-- that never materialized (audit finding F4, 00-CEO-DIRECTIVE-MUST-ROSTER):
--   revops: revenue-growth-specialist (CEO E5.2 order), crm-data-steward, pricing-deal-desk-manager
--   customer-success: onboarding-implementation-lead (consultancy-delivery pod)
--   marketing: corporate-communications-lead (corp-comms pod)
-- All workers, draft — activation via the HR state machine (persona passed + equipment chain).
-- Idempotent: ON CONFLICT (slug) DO NOTHING + conditional UPDATEs.

BEGIN;

-- A) ADD 5 worker rows (E-block idiom)
INSERT INTO public.agents (slug, department, role, role_level, employment_status,
                           persona_path, persona_version, status)
SELECT v.slug, v.dept, 'worker', 'specialist', 'draft',
       'personas/' || v.dept || '/' || v.slug || '.md', 'v0-add', 'dormant'
FROM (VALUES
  ('revenue-growth-specialist',      'revops'),
  ('crm-data-steward',               'revops'),
  ('pricing-deal-desk-manager',      'revops'),
  ('onboarding-implementation-lead', 'customer-success'),
  ('corporate-communications-lead',  'marketing')
) AS v(slug, dept)
ON CONFLICT (slug) DO NOTHING;

-- B) manager chains (matrix §5.2 backfill rule)
UPDATE public.agents a
   SET manager_id = m.id, updated_at = now()
  FROM (VALUES
    ('revenue-growth-specialist',      'revops-head'),
    ('crm-data-steward',               'revops-head'),
    ('pricing-deal-desk-manager',      'revops-head'),
    ('onboarding-implementation-lead', 'head-of-customer-success'),
    ('corporate-communications-lead',  'cmo')
  ) AS v(slug, mgr)
  JOIN public.agents m ON m.slug = v.mgr
 WHERE a.slug = v.slug
   AND a.manager_id IS DISTINCT FROM m.id;

-- C) guardrail: no orphan workers in the three touched departments
DO $$
DECLARE v_orphan integer;
BEGIN
  SELECT count(*) INTO v_orphan
    FROM public.agents
   WHERE department IN ('revops','customer-success','marketing') AND role='worker'
     AND employment_status NOT IN ('archived') AND manager_id IS NULL;
  IF v_orphan > 0 THEN
    RAISE EXCEPTION 'E5.7b: orphan worker count % in touched depts (expected 0)', v_orphan;
  END IF;
END $$;

COMMIT;

-- ROLLBACK:
-- DELETE FROM agents WHERE slug IN ('revenue-growth-specialist','crm-data-steward',
--   'pricing-deal-desk-manager','onboarding-implementation-lead','corporate-communications-lead')
--   AND persona_id IS NULL;
