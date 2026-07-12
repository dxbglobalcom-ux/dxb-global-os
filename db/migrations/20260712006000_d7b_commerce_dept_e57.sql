-- 20260712006000_d7b_commerce_dept_e57.sql — E5.7c (D7-B): commerce department founding
-- Source: HOLDING-OS-MASTER-PLAN/WORKFORCE-MUST-EXPANSION-PLAN.md §2/§4 (roster #6-15),
-- 00-CEO-DIRECTIVE-MUST-ROSTER (audit finding F6: revenue engine R2 unowned).
-- First-class store-operating cell — clones into each e-commerce alt-OS at spawn time
-- (Outleteuro first). Head = director, single P&L owner; 9 workers report to head.
-- All draft/dormant — activation via HR state machine (persona passed + equipment chain).
-- Idempotent: ON CONFLICT / NOT EXISTS + conditional UPDATEs.

BEGIN;

-- A) department row
INSERT INTO public.departments (slug, display_name, company_id)
SELECT 'commerce', 'Commerce Operations', c.id
  FROM public.companies c
 WHERE c.slug = 'dxb-global'
ON CONFLICT (slug) DO NOTHING;

-- B) head (role_level=director per expansion plan §4 row #6)
INSERT INTO public.agents (slug, department, role, role_level, employment_status,
                           persona_path, persona_version, status)
SELECT 'head-of-commerce', 'commerce', 'head', 'director', 'draft',
       'personas/commerce/head-of-commerce.md', 'v0-add', 'dormant'
 WHERE NOT EXISTS (SELECT 1 FROM public.agents WHERE slug = 'head-of-commerce');

-- C) 9 workers (plan §4 rows #7-15; two senior seats per capability matrix §3)
INSERT INTO public.agents (slug, department, role, role_level, employment_status,
                           persona_path, persona_version, status)
SELECT v.slug, 'commerce', 'worker', v.role_level, 'draft',
       'personas/commerce/' || v.slug || '.md', 'v0-add', 'dormant'
FROM (VALUES
  ('woocommerce-architect',          'senior_specialist'),
  ('commerce-integration-engineer',  'senior_specialist'),
  ('catalog-pim-specialist',         'specialist'),
  ('merchandising-pricing-manager',  'specialist'),
  ('stock-lot-sourcing-specialist',  'specialist'),
  ('inventory-fulfillment-manager',  'specialist'),
  ('cro-checkout-specialist',        'specialist'),
  ('commerce-returns-specialist',    'specialist'),
  ('commerce-analytics-specialist',  'specialist')
) AS v(slug, role_level)
ON CONFLICT (slug) DO NOTHING;

-- D) manager chain: head → agents-orchestrator (all-dept-heads pattern); workers → head
UPDATE public.agents a
   SET manager_id = m.id, updated_at = now()
  FROM public.agents m
 WHERE a.slug = 'head-of-commerce' AND m.slug = 'agents-orchestrator'
   AND a.manager_id IS DISTINCT FROM m.id;

UPDATE public.agents a
   SET manager_id = m.id, updated_at = now()
  FROM public.agents m
 WHERE m.slug = 'head-of-commerce'
   AND a.department = 'commerce' AND a.role = 'worker'
   AND a.manager_id IS DISTINCT FROM m.id;

-- E) director_id on the department row
UPDATE public.departments d
   SET director_id = a.id
  FROM public.agents a
 WHERE d.slug = 'commerce' AND a.slug = 'head-of-commerce'
   AND d.director_id IS DISTINCT FROM a.id;

-- F) guardrails: headcount exactly 10, zero orphan workers, director set
DO $$
DECLARE v_count integer; v_orphan integer; v_dir uuid;
BEGIN
  SELECT count(*) INTO v_count FROM public.agents
   WHERE department = 'commerce' AND employment_status <> 'archived';
  IF v_count <> 10 THEN
    RAISE EXCEPTION 'E5.7c: commerce headcount % (expected 10)', v_count;
  END IF;

  SELECT count(*) INTO v_orphan FROM public.agents
   WHERE department = 'commerce' AND role = 'worker'
     AND employment_status NOT IN ('archived') AND manager_id IS NULL;
  IF v_orphan > 0 THEN
    RAISE EXCEPTION 'E5.7c: orphan worker count % in commerce (expected 0)', v_orphan;
  END IF;

  SELECT director_id INTO v_dir FROM public.departments WHERE slug = 'commerce';
  IF v_dir IS NULL THEN
    RAISE EXCEPTION 'E5.7c: commerce director_id not set';
  END IF;
END $$;

COMMIT;

-- ROLLBACK:
-- UPDATE departments SET director_id = NULL WHERE slug = 'commerce';
-- DELETE FROM agents WHERE department = 'commerce' AND persona_id IS NULL;
-- DELETE FROM departments d WHERE d.slug = 'commerce'
--   AND NOT EXISTS (SELECT 1 FROM agents a WHERE a.department = 'commerce');
