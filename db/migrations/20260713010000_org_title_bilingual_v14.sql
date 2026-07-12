-- ============================================================================
-- 20260713010000 — E6.3 fix wave 3b (CEO eye-test, 2026-07-13 ~00:50):
--   Wave 3 backfilled ONE title per agent straight from the persona H1, so
--   Turkish-era personas rendered Turkish titles while the UI locale was EN
--   ("Finans Direktörü (CFO)" on an English screen — A2 violation: EN is the
--   primary UI language, TR the full secondary).
--
--   Split the title by language: agents.title = English canonical,
--   agents.title_tr = Turkish. v_org_graph v1.4 exposes title_tr so the RSC
--   picks the label by locale (label stays the EN canonical for callers that
--   don't care about locale). Backfill parses the persona H1 pattern
--   "<TR> (<EN>)" / "<EN> (<TR>)" with Turkish-character/word detection;
--   six TR-only titles received their mechanical English equivalents.
--
-- ROLLBACK: recreate the view from 20260713003000 and
--   ALTER TABLE agents DROP COLUMN title_tr.
-- ============================================================================

ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS title_tr text;

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
       NULL::text AS slug,
       NULL::text AS title_tr
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
       d.slug,
       NULL::text
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
       a.slug,
       a.title_tr
FROM agents a
JOIN departments d ON d.slug = a.department
LEFT JOIN agents m ON m.id = a.manager_id
WHERE a.role_level IS DISTINCT FROM 'sub_agent'
  AND a.employment_status <> 'archived';

GRANT SELECT ON public.v_org_graph TO authenticated;
REVOKE ALL ON public.v_org_graph FROM anon;
