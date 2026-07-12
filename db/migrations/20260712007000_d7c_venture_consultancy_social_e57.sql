-- 20260712007000_d7c_venture_consultancy_social_e57.sql — E5.7d (D7-C): the last 4 MUST seats
-- Source: HOLDING-OS-MASTER-PLAN/WORKFORCE-MUST-EXPANSION-PLAN.md §4 rows #16-19.
--   strategy (venture-studio pod): venture-builder (senior) — engine R4 founding operator
--   customer-success (consultancy-delivery pod): business-automation-solutions-architect (senior)
--     + managed-automation-services-engineer (Fable discovery — consultancy MRR engine)
--   social-media: social-commerce-creator-lead — engine R1 owned transaction line
-- All workers, draft — activation via the HR state machine (persona passed + equipment chain).
-- Idempotent: ON CONFLICT (slug) DO NOTHING + conditional UPDATEs.

BEGIN;

-- A) ADD 4 worker rows
INSERT INTO public.agents (slug, department, role, role_level, employment_status,
                           persona_path, persona_version, status)
SELECT v.slug, v.dept, 'worker', v.role_level, 'draft',
       'personas/' || v.dept || '/' || v.slug || '.md', 'v0-add', 'dormant'
FROM (VALUES
  ('venture-builder',                        'strategy',         'senior_specialist'),
  ('business-automation-solutions-architect','customer-success', 'senior_specialist'),
  ('managed-automation-services-engineer',   'customer-success', 'specialist'),
  ('social-commerce-creator-lead',           'social-media',     'specialist')
) AS v(slug, dept, role_level)
ON CONFLICT (slug) DO NOTHING;

-- B) manager chains (plan §4 manager column)
UPDATE public.agents a
   SET manager_id = m.id, updated_at = now()
  FROM (VALUES
    ('venture-builder',                         'head-of-strategy'),
    ('business-automation-solutions-architect', 'head-of-customer-success'),
    ('managed-automation-services-engineer',    'head-of-customer-success'),
    ('social-commerce-creator-lead',            'social-media-orchestrator')
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
   WHERE department IN ('strategy','customer-success','social-media') AND role='worker'
     AND employment_status NOT IN ('archived') AND manager_id IS NULL;
  IF v_orphan > 0 THEN
    RAISE EXCEPTION 'E5.7d: orphan worker count % in touched depts (expected 0)', v_orphan;
  END IF;
END $$;

COMMIT;

-- ROLLBACK:
-- DELETE FROM agents WHERE slug IN ('venture-builder','business-automation-solutions-architect',
--   'managed-automation-services-engineer','social-commerce-creator-lead')
--   AND persona_id IS NULL;
