-- ============================================================================
-- 20260713003000 — E6.3 fix wave 3 (CEO eye-test, 2026-07-13 ~00:20):
--   The org tree rendered raw kebab slugs ("marketing-tiktok-strategist",
--   "platform-head") because the DB never carried the human title that every
--   persona file defines in its H1 / dossier field 3. A professional holding
--   chart shows titles, not internal identifiers.
--
--   1. agents.title — canonical human title, synced one-way from the persona
--      file H1 (file-first architecture; scripts/sync-personas-to-db.sh).
--      Nullable: an agent row without a persona file falls back to slug.
--   2. v_org_graph v1.3 — employee label = COALESCE(title, slug); the slug
--      moves to its own column so the UI can still link/identify nodes.
--
-- ROLLBACK: recreate the view from 20260712233000 and
--   ALTER TABLE agents DROP COLUMN title.
-- ============================================================================

ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS title text;

CREATE OR REPLACE VIEW public.v_org_graph AS
SELECT c.id::text AS node_id,
       'company'::text AS kind,
       c.name AS label,
       NULL::text AS role_level,
       NULL::text AS parent_node_id,
       c.status,
       NULL::text AS department,
       NULL::text AS model,
       NULL::text AS director_slug,
       NULL::text AS slug
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
       dir.slug,
       d.slug
FROM departments d
LEFT JOIN agents dir ON dir.id = d.director_id
UNION ALL
SELECT a.id::text,
       'employee'::text,
       COALESCE(a.title, a.slug),
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
       NULL::text,
       a.slug
FROM agents a
JOIN departments d ON d.slug = a.department
LEFT JOIN agents m ON m.id = a.manager_id
WHERE a.role_level IS DISTINCT FROM 'sub_agent'
  AND a.employment_status <> 'archived';

GRANT SELECT ON public.v_org_graph TO authenticated;
REVOKE ALL ON public.v_org_graph FROM anon;
