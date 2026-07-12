-- ============================================================================
-- 20260712230000 — E6.3 fix wave (CEO eye-test RET, 2026-07-12 ~23:55):
--   R1. Social Media rendered as a ROOT sibling of DXB Global — the
--       departments row was created (E5.2b wave) with company_id NULL.
--       Data fix: attach it to the holding company.
--   R2. Employees scattered: v_org_graph parented every employee to its
--       manager even when the manager sits in ANOTHER department, so 20
--       employees rendered outside their own department and their home
--       department looked empty while its count said otherwise.
--       View fix: an employee nests under its manager ONLY when the manager
--       is in the same department; otherwise it nests under its department.
--       Cross-department reporting stays visible in the detail panel (the
--       manager field is untouched) — only the TREE placement changes.
--   R3. Department detail panel was an empty shell. The view now carries
--       director_slug on department rows (appended column — CREATE OR
--       REPLACE VIEW allows appending) so the panel can show the director;
--       headcounts are computed live from the employee nodes client-side.
--
-- ROLLBACK:
--   Recreate v_org_graph from 20260712014000 (drops director_slug):
--     DROP VIEW v_org_graph; then re-run section 10 of that migration.
--   UPDATE departments SET company_id = NULL WHERE slug = 'social-media';
-- ============================================================================

-- R1 — Social Media belongs to the holding.
UPDATE departments
SET company_id = (SELECT id FROM companies WHERE slug = 'dxb-global')
WHERE slug = 'social-media' AND company_id IS NULL;

-- R2 + R3 — v_org_graph v1.1.
CREATE OR REPLACE VIEW public.v_org_graph AS
SELECT c.id::text AS node_id,
       'company'::text AS kind,
       c.name AS label,
       NULL::text AS role_level,
       NULL::text AS parent_node_id,
       c.status,
       NULL::text AS department,
       NULL::text AS model,
       NULL::text AS director_slug
FROM companies c
UNION ALL
SELECT d.id::text,
       'department'::text,
       d.display_name,
       NULL::text,
       COALESCE(d.parent_id::text, d.company_id::text),
       d.status,
       d.slug,
       NULL::text,
       dir.slug
FROM departments d
LEFT JOIN agents dir ON dir.id = d.director_id
UNION ALL
SELECT a.id::text,
       'employee'::text,
       a.slug,
       a.role_level,
       COALESCE(
         CASE WHEN m.department = a.department THEN a.manager_id::text END,
         d.id::text),
       a.employment_status,
       a.department,
       a.brain,
       NULL::text
FROM agents a
JOIN departments d ON d.slug = a.department
LEFT JOIN agents m ON m.id = a.manager_id
WHERE a.role_level IS DISTINCT FROM 'sub_agent';

GRANT SELECT ON public.v_org_graph TO authenticated;
REVOKE ALL ON public.v_org_graph FROM anon;
