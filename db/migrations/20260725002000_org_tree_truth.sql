-- v_org_tree workforce truth (2026-07-25, C9 rollout catch — same disease as
-- the 2026-07-24 v_exec_overview fix): the view read the DEAD legacy columns
-- departments.status (21/21 dormant since the activation waves) and
-- agents.status, so /org/departments showed every department inactive with 0
-- active employees while the roster showed 199/199.
--
-- Truth after this migration:
--   * agents_total  = non-archived agents (C8 working-org rule)
--   * agents_active = employment_status = 'active'
--   * status        = derived: a department with active employees IS active
--     (departments.status stays untouched as legacy history; nothing reads it
--     for truth anymore)
-- Column list/order unchanged — CREATE OR REPLACE keeps both consumers
-- (/org/departments, /org/companies) source-compatible.

CREATE OR REPLACE VIEW v_org_tree AS
WITH RECURSIVE dept_tree AS (
  SELECT d.id, d.slug, d.display_name, d.status, d.company_id, d.parent_id,
         d.director_id, 0 AS depth, ARRAY[d.slug] AS path
    FROM departments d
   WHERE d.parent_id IS NULL
  UNION ALL
  SELECT d.id, d.slug, d.display_name, d.status, d.company_id, d.parent_id,
         d.director_id, t.depth + 1, t.path || d.slug
    FROM departments d
    JOIN dept_tree t ON d.parent_id = t.id
), agent_rollup AS (
  SELECT a.department,
         count(*) FILTER (WHERE a.employment_status <> 'archived')::integer AS agents_total,
         count(*) FILTER (WHERE a.employment_status = 'active')::integer   AS agents_active
    FROM agents a
   GROUP BY a.department
), cost_rollup AS (
  SELECT c.department,
         COALESCE(sum(c.cost_eur) FILTER (
           WHERE (c.created_at AT TIME ZONE 'Europe/Berlin')::date
               = (now() AT TIME ZONE 'Europe/Berlin')::date), 0)::numeric(10,2) AS cost_today_eur,
         COALESCE(sum(c.cost_eur) FILTER (
           WHERE c.created_at >= now() - interval '7 days'), 0)::numeric(10,2) AS cost_7d_eur
    FROM cost_ledger c
   GROUP BY c.department
)
SELECT t.id,
       t.slug,
       t.display_name,
       CASE WHEN COALESCE(ar.agents_active, 0) > 0
            THEN 'active' ELSE 'dormant' END AS status,
       t.depth,
       t.path,
       t.parent_id,
       t.director_id,
       co.id   AS company_id,
       co.slug AS company_slug,
       COALESCE(ar.agents_total, 0)  AS agents_total,
       COALESCE(ar.agents_active, 0) AS agents_active,
       COALESCE(cr.cost_today_eur, 0) AS cost_today_eur,
       COALESCE(cr.cost_7d_eur, 0)   AS cost_7d_eur
  FROM dept_tree t
  LEFT JOIN companies co   ON co.id = t.company_id
  LEFT JOIN agent_rollup ar ON ar.department = t.slug
  LEFT JOIN cost_rollup cr  ON cr.department = t.slug;
