-- ============================================================================
-- 20260713013000 — E6.3 wave 3c (CEO order 2026-07-13 ~01:00): the spec's
--   v_org_node_detail contract (ORGANIZATION_ENGINE_SPEC §12, madde 5.3 field
--   set) was never implemented — the v1 panel echoed the tree. This view is
--   the full field set, one row per live employee node:
--
--     identity   — slug, title EN/TR, role_level, status (naming policy: no
--                  invented human names, the title IS the name)
--     assignment — department, manager (id/slug/title), direct reports
--     runtime    — brain + model_catalog status, autonomy level, mcp profile,
--                  active tasks, active runs, 30d cost, memory count
--     governance — persona FK + version + quality gate + author (content
--                  stays LAZY per spec: the drawer fetches body_md on demand),
--                  employee_record flag + KPI count (sicil)
--     capability — skills jsonb + library grants count
--
--   Runtime counters honestly return 0 until Phase 7 activates the workforce;
--   found gap recorded in the roadmap: employee_records has ZERO rows (the
--   sicil layer was skipped by the HR wave — separate data task).
--
-- ROLLBACK: DROP VIEW public.v_org_node_detail;
-- ============================================================================

CREATE OR REPLACE VIEW public.v_org_node_detail AS
SELECT
  a.id                                   AS employee_id,
  a.slug,
  COALESCE(a.title, a.slug)              AS title,
  a.title_tr,
  a.role_level,
  a.employment_status,
  d.slug                                 AS department_slug,
  d.display_name                         AS department_name,
  m.id                                   AS manager_id,
  m.slug                                 AS manager_slug,
  COALESCE(m.title, m.slug)              AS manager_title,
  m.title_tr                             AS manager_title_tr,
  (SELECT count(*) FROM agents r
    WHERE r.manager_id = a.id
      AND r.employment_status <> 'archived')            AS direct_reports,
  a.brain,
  mc.status                              AS model_status,
  a.autonomy_level,
  a.mcp_profile,
  p.id                                   AS persona_id,
  p.version                              AS persona_version,
  p.quality_gate                         AS persona_gate,
  p.author                               AS persona_author,
  p.created_at                           AS persona_updated_at,
  (er.employee_id IS NOT NULL)           AS has_employee_record,
  COALESCE(jsonb_array_length(er.kpis), 0)              AS kpi_count,
  COALESCE((SELECT round(sum(c.cost_eur)::numeric, 2) FROM cost_ledger c
    WHERE c.agent_id = a.id
      AND c.created_at > now() - interval '30 days'), 0) AS cost_30d_eur,
  (SELECT count(*) FROM tasks t
    WHERE t.agent_id = a.id
      AND t.status IN ('queued','claimed','running','review',
                       'awaiting_approval'))             AS active_tasks,
  (SELECT count(*) FROM agent_runs r
    WHERE r.employee_id = a.id AND r.status = 'running') AS active_runs,
  a.skills,
  (SELECT count(*) FROM library_grants g
    WHERE g.grantee_kind = 'employee'
      AND g.grantee_id = a.id::text)                     AS grants_count,
  (SELECT count(*) FROM memory_index mi
    WHERE mi.provenance->>'agent' = a.slug)              AS memory_count
FROM agents a
JOIN departments d ON d.slug = a.department
LEFT JOIN agents m ON m.id = a.manager_id
LEFT JOIN model_catalog mc ON mc.id = a.brain
LEFT JOIN employee_records er ON er.employee_id = a.id
LEFT JOIN LATERAL (
  SELECT id, version, quality_gate, author, created_at
  FROM personas
  WHERE employee_id = a.id
  ORDER BY version DESC
  LIMIT 1
) p ON true
WHERE a.role_level IS DISTINCT FROM 'sub_agent'
  AND a.employment_status <> 'archived';

GRANT SELECT ON public.v_org_node_detail TO authenticated;
REVOKE ALL ON public.v_org_node_detail FROM anon;
