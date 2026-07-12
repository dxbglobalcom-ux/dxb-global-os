-- ============================================================================
-- 20260712233000 — E6.3 fix wave 2 (CEO eye-test, 2026-07-13 ~00:15):
--   The org tree showed the E5.0 retire-library ARCHIVE inside live
--   departments (15 retired agents were parked in people-hr, 6 scattered
--   elsewhere) — study-abroad-advisor et al. rendered as HR staff.
--   The org graph is the LIVING organization: archived employees leave the
--   tree. They are NOT deleted — rows, records and the CEO archive rule
--   ("retire = archive, never delete") stay intact; the Employees page
--   still lists them under its status filter.
--
-- ROLLBACK: recreate the view from 20260712230000 (drop the
--   employment_status filter).
-- ============================================================================

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
         -- Nest under the manager only when the manager is in the same
         -- department AND still in the tree (an archived manager would be
         -- an invisible parent — the report falls back to the department).
         CASE WHEN m.department = a.department
               AND m.employment_status <> 'archived'
              THEN a.manager_id::text END,
         d.id::text),
       a.employment_status,
       a.department,
       a.brain,
       NULL::text
FROM agents a
JOIN departments d ON d.slug = a.department
LEFT JOIN agents m ON m.id = a.manager_id
WHERE a.role_level IS DISTINCT FROM 'sub_agent'
  AND a.employment_status <> 'archived';

GRANT SELECT ON public.v_org_graph TO authenticated;
REVOKE ALL ON public.v_org_graph FROM anon;
