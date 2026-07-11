-- 0025x (E4.3) — API support objects: control_idempotency + the read-view
-- catalog (API_CONTRACTS §8c) + notify_broadcast helper (EVENT_MODEL §5).
-- Comes AFTER all 0020x-0024x families (view dependency, DATA_MODEL §20).
-- Views are read-only projections: SECURITY INVOKER, deterministic ordering
-- left to PostgREST callers (order=...,id). v_exec_overview_v1 (0019x-b)
-- stays as a compatibility alias until the E4.5 page switch commits.
-- NOTE (API_CONTRACTS §26 risk rule): v_exec_overview / v_project_command
-- exceed 15 columns deliberately — §8c's binding promise is "all summary
-- numbers in one row"; the 19-column v_exec_overview_v1 set the precedent.
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS public.control_idempotency (
  key text PRIMARY KEY,
  request_digest text NOT NULL,
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.control_idempotency ENABLE ROW LEVEL SECURITY;
-- No client grants: only SECURITY DEFINER control fns touch this table.
-- Retention: rows older than 7 days pruned by the pg-boss retention family (AUDIT §4).

-- Single broadcast helper (EVENT_MODEL §5): every trigger/fn publishes through
-- this one door. Channel names are the §9b catalog (ops:live, approvals,
-- alerts, settings, org, projects, cost, system); the dxb: prefix keeps the
-- existing realtime.messages RLS policy ('dxb:%', 0013) authoritative.
-- Envelope (§9a): event_id/ts/type added here; actor/entity/corr/payload
-- provided by the caller inside p_payload.
CREATE OR REPLACE FUNCTION public.notify_broadcast(p_channel text, p_type text, p_payload jsonb DEFAULT '{}'::jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM realtime.send(
    jsonb_build_object(
      'event_id', gen_random_uuid(),
      'ts', now(),
      'type', p_type
    ) || coalesce(p_payload, '{}'::jsonb),
    p_type,
    'dxb:' || p_channel,
    true
  );
END $$;

REVOKE ALL ON FUNCTION public.notify_broadcast(text, text, jsonb) FROM PUBLIC, anon;

-- ── v_exec_overview ─────────────────────────────────────────────────────────
-- Executive Overview (CC-SPEC §12): every figure one row, every figure drillable.
-- Extends the v1 shape with the new-family counters (projects, workflow runs,
-- agent runs). Cost semantics COST-04 verbatim — do not fork.
CREATE OR REPLACE VIEW public.v_exec_overview
WITH (security_invoker = true) AS
WITH berlin AS (
  SELECT (now() AT TIME ZONE 'Europe/Berlin')::date AS today
),
task_counts AS (
  SELECT
    count(*) FILTER (WHERE status IN ('queued', 'claimed', 'running'))::int AS active_tasks,
    count(*) FILTER (WHERE status = 'running')::int                          AS running_tasks,
    count(*) FILTER (WHERE status = 'queued')::int                           AS queued_tasks,
    count(*) FILTER (WHERE status = 'awaiting_approval')::int                AS tasks_awaiting_approval,
    count(*) FILTER (WHERE status = 'failed'
                     AND updated_at >= now() - interval '24 hours')::int     AS failed_tasks_24h
  FROM public.tasks
),
approval_counts AS (
  SELECT
    count(*) FILTER (WHERE status = 'pending')::int                          AS pending_approvals,
    count(*) FILTER (WHERE status = 'pending' AND risk_class = 'high')::int  AS pending_high_risk,
    min(created_at) FILTER (WHERE status = 'pending')                        AS oldest_pending_at
  FROM public.approvals
),
agent_counts AS (
  SELECT
    count(*)::int                                                            AS agents_total,
    count(*) FILTER (WHERE status <> 'dormant')::int                         AS agents_active,
    count(*) FILTER (WHERE status = 'dormant')::int                          AS agents_dormant
  FROM public.agents
),
run_counts AS (
  SELECT
    count(*) FILTER (WHERE status = 'running')::int                          AS runs_active,
    count(*) FILTER (WHERE status = 'waiting_approval')::int                 AS runs_waiting_approval
  FROM public.agent_runs
),
project_counts AS (
  SELECT
    count(*) FILTER (WHERE status = 'active')::int                           AS projects_active,
    count(*)::int                                                            AS projects_total
  FROM public.projects
),
workflow_counts AS (
  SELECT count(*) FILTER (WHERE status = 'running')::int                     AS workflow_runs_active
  FROM public.workflow_runs
),
cost_block AS (
  SELECT
    coalesce(sum(c.cost_eur) FILTER (
      WHERE (c.created_at AT TIME ZONE 'Europe/Berlin')::date = b.today), 0)::numeric(10, 2)
      AS cost_today_eur,
    coalesce(sum(c.cost_eur) FILTER (
      WHERE c.created_at >= now() - interval '7 days'), 0)::numeric(10, 2)
      AS cost_7d_eur,
    coalesce(sum(c.cost_eur) FILTER (
      WHERE date_trunc('month', c.created_at AT TIME ZONE 'Europe/Berlin')
          = date_trunc('month', b.today::timestamp)), 0)::numeric(10, 2)
      AS cost_month_eur,
    coalesce(sum(c.prompt_tokens + c.completion_tokens) FILTER (
      WHERE c.created_at >= now() - interval '7 days'), 0)::bigint
      AS tokens_7d
  FROM public.cost_ledger c, berlin b
),
budget AS (
  SELECT monthly_cap_eur, hard_stopped, breaker_tripped
  FROM public.budget_state
  LIMIT 1
),
activity AS (
  SELECT max(created_at) AS last_activity_at FROM public.task_events
)
SELECT
  t.active_tasks, t.running_tasks, t.queued_tasks, t.tasks_awaiting_approval, t.failed_tasks_24h,
  a.pending_approvals, a.pending_high_risk, a.oldest_pending_at,
  g.agents_total, g.agents_active, g.agents_dormant,
  r.runs_active, r.runs_waiting_approval,
  p.projects_active, p.projects_total,
  w.workflow_runs_active,
  c.cost_today_eur, c.cost_7d_eur, c.cost_month_eur, c.tokens_7d,
  b.monthly_cap_eur, b.hard_stopped, b.breaker_tripped,
  x.last_activity_at
FROM task_counts t, approval_counts a, agent_counts g, run_counts r,
     project_counts p, workflow_counts w, cost_block c, budget b, activity x;

-- ── v_live_ops ──────────────────────────────────────────────────────────────
-- Live Operations (CC-SPEC §14): agent_runs + task_events union. Window: last
-- 24h (N=1440 min) so a quiet holding still shows an honest recent tail;
-- running/waiting runs are always included. label carries the human line
-- (task objective / model id) so the feed needs no client-side joins.
-- DROP first: column set changed during E4 build (OR REPLACE can only append).
DROP VIEW IF EXISTS public.v_live_ops;
CREATE VIEW public.v_live_ops
WITH (security_invoker = true) AS
SELECT
  'run'::text          AS source,
  r.id::text           AS source_id,
  r.started_at         AS ts,
  r.status             AS status,
  r.task_id            AS task_id,
  r.workflow_run_id    AS workflow_run_id,
  coalesce(a.slug, 'system') AS actor,
  coalesce(r.model_id, 'run') AS event,
  coalesce(t.objective, r.model_id) AS label
FROM public.agent_runs r
LEFT JOIN public.agents a ON a.id = r.employee_id
LEFT JOIN public.tasks t ON t.id = r.task_id
WHERE r.started_at >= now() - interval '24 hours'
   OR r.status IN ('running', 'waiting_approval')
UNION ALL
SELECT
  'task_event'::text   AS source,
  e.id::text           AS source_id,
  e.created_at         AS ts,
  coalesce(e.to_status, e.event) AS status,
  e.task_id            AS task_id,
  NULL::uuid           AS workflow_run_id,
  e.actor              AS actor,
  e.event              AS event,
  t.objective          AS label
FROM public.task_events e
LEFT JOIN public.tasks t ON t.id = e.task_id
WHERE e.created_at >= now() - interval '24 hours';

-- ── v_org_tree ──────────────────────────────────────────────────────────────
-- Organization Intelligence (CC-SPEC §15): recursive hierarchy + status/cost.
CREATE OR REPLACE VIEW public.v_org_tree
WITH (security_invoker = true) AS
WITH RECURSIVE dept_tree AS (
  SELECT d.id, d.slug, d.display_name, d.status, d.company_id, d.parent_id,
         d.director_id, 0 AS depth, ARRAY[d.slug] AS path
  FROM public.departments d
  WHERE d.parent_id IS NULL
  UNION ALL
  SELECT d.id, d.slug, d.display_name, d.status, d.company_id, d.parent_id,
         d.director_id, t.depth + 1, t.path || d.slug
  FROM public.departments d
  JOIN dept_tree t ON d.parent_id = t.id
),
agent_rollup AS (
  SELECT a.department,
         count(*)::int AS agents_total,
         count(*) FILTER (WHERE a.status <> 'dormant')::int AS agents_active
  FROM public.agents a
  GROUP BY a.department
),
cost_rollup AS (
  SELECT c.department,
         coalesce(sum(c.cost_eur) FILTER (
           WHERE (c.created_at AT TIME ZONE 'Europe/Berlin')::date
               = (now() AT TIME ZONE 'Europe/Berlin')::date), 0)::numeric(10,2) AS cost_today_eur,
         coalesce(sum(c.cost_eur) FILTER (
           WHERE c.created_at >= now() - interval '7 days'), 0)::numeric(10,2)  AS cost_7d_eur
  FROM public.cost_ledger c
  GROUP BY c.department
)
SELECT
  t.id, t.slug, t.display_name, t.status, t.depth, t.path,
  t.parent_id, t.director_id,
  co.id   AS company_id,
  co.slug AS company_slug,
  coalesce(ar.agents_total, 0)  AS agents_total,
  coalesce(ar.agents_active, 0) AS agents_active,
  coalesce(cr.cost_today_eur, 0) AS cost_today_eur,
  coalesce(cr.cost_7d_eur, 0)    AS cost_7d_eur
FROM dept_tree t
LEFT JOIN public.companies co ON co.id = t.company_id
LEFT JOIN agent_rollup ar ON ar.department = t.slug
LEFT JOIN cost_rollup cr ON cr.department = t.slug;

-- ── v_project_command ───────────────────────────────────────────────────────
-- Project Command View (PROJECT_OS §8): per-project single round-trip —
-- core fields + counters for the directive item 12 surface.
CREATE OR REPLACE VIEW public.v_project_command
WITH (security_invoker = true) AS
SELECT
  p.id, p.slug, p.name, p.purpose, p.strategy_link, p.status, p.health_score,
  p.links, p.created_at,
  p.owner_employee_id,
  ow.slug AS owner_slug,
  p.company_id,
  co.slug AS company_slug,
  (SELECT count(*)::int FROM public.project_members m WHERE m.project_id = p.id)                          AS member_count,
  (SELECT count(*)::int FROM public.project_milestones ms WHERE ms.project_id = p.id)                     AS milestones_total,
  (SELECT count(*)::int FROM public.project_milestones ms WHERE ms.project_id = p.id
     AND ms.reached_at IS NOT NULL)                                                                       AS milestones_reached,
  (SELECT min(ms.due_at) FROM public.project_milestones ms WHERE ms.project_id = p.id
     AND ms.reached_at IS NULL)                                                                           AS next_milestone_due,
  (SELECT count(*)::int FROM public.tasks tk WHERE tk.project_id = p.id)                                  AS tasks_total,
  (SELECT count(*)::int FROM public.tasks tk WHERE tk.project_id = p.id
     AND tk.status IN ('queued','claimed','running'))                                                     AS tasks_active,
  (SELECT count(*)::int FROM public.tasks tk WHERE tk.project_id = p.id AND tk.status = 'failed')         AS tasks_failed,
  (SELECT count(*)::int FROM public.workflows w WHERE w.project_id = p.id AND w.enabled)                  AS workflows_enabled,
  (SELECT count(*)::int FROM public.project_risks rk WHERE rk.project_id = p.id AND rk.status = 'open')   AS risks_open,
  (SELECT count(*)::int FROM public.project_risks rk WHERE rk.project_id = p.id AND rk.status = 'open'
     AND rk.severity IN ('high','critical'))                                                              AS risks_open_high,
  (SELECT coalesce(sum(c.cost_eur), 0)::numeric(10,2) FROM public.cost_ledger c
     JOIN public.tasks tk ON tk.id = c.task_id WHERE tk.project_id = p.id)                                AS cost_total_eur,
  (SELECT max(e.created_at) FROM public.task_events e
     JOIN public.tasks tk ON tk.id = e.task_id WHERE tk.project_id = p.id)                                AS last_activity_at
FROM public.projects p
LEFT JOIN public.agents ow ON ow.id = p.owner_employee_id
LEFT JOIN public.companies co ON co.id = p.company_id;

-- ── v_cost_breakdown ────────────────────────────────────────────────────────
-- Cost Intelligence (CC-SPEC §20): day/department/model/mode/agent grain;
-- callers aggregate up from this grain (PostgREST group/filter).
CREATE OR REPLACE VIEW public.v_cost_breakdown
WITH (security_invoker = true) AS
SELECT
  (c.created_at AT TIME ZONE 'Europe/Berlin')::date AS day,
  c.department,
  c.model,
  c.mode,
  c.agent_id,
  count(*)::int AS entries,
  sum(c.prompt_tokens)::bigint     AS prompt_tokens,
  sum(c.completion_tokens)::bigint AS completion_tokens,
  sum(c.cost_eur)::numeric(10, 4)  AS cost_eur
FROM public.cost_ledger c
GROUP BY 1, 2, 3, 4, 5;

-- ── v_library_catalog ───────────────────────────────────────────────────────
-- Holding Library (directive item 13): item + grant count + usage.
CREATE OR REPLACE VIEW public.v_library_catalog
WITH (security_invoker = true) AS
SELECT
  li.id, li.kind, li.name, li.version, li.owner_dept, li.owner_employee_id,
  li.quality_score, li.review_status, li.last_used_at, li.updated_at,
  (SELECT count(*)::int FROM public.library_grants g WHERE g.item_id = li.id)     AS grant_count,
  (SELECT count(*)::int FROM public.library_usage_log u WHERE u.item_id = li.id)  AS usage_count
FROM public.library_items li;

COMMENT ON VIEW public.v_exec_overview is
  '0025x catalog: Executive Overview single source (supersedes v_exec_overview_v1 at the E4.5 page switch; v1 stays as compatibility alias).';
COMMENT ON VIEW public.v_live_ops is
  '0025x catalog: agent_runs + task_events union, last 24h window (running/waiting runs always included); label = task objective / model id.';
COMMENT ON VIEW public.v_org_tree is
  '0025x catalog: recursive department hierarchy with agent/cost rollups.';
COMMENT ON VIEW public.v_project_command is
  '0025x catalog: per-project single round-trip for the Project Command View (PROJECT_OS §8).';
COMMENT ON VIEW public.v_cost_breakdown is
  '0025x catalog: day/department/model/mode/agent cost grain (COST-04 semantics).';
COMMENT ON VIEW public.v_library_catalog is
  '0025x catalog: library inventory with grant/usage counters.';

GRANT SELECT ON public.v_exec_overview, public.v_live_ops, public.v_org_tree,
  public.v_project_command, public.v_cost_breakdown, public.v_library_catalog
  TO authenticated, service_role;

-- ROLLBACK:
--   DROP VIEW IF EXISTS public.v_library_catalog;
--   DROP VIEW IF EXISTS public.v_cost_breakdown;
--   DROP VIEW IF EXISTS public.v_project_command;
--   DROP VIEW IF EXISTS public.v_org_tree;
--   DROP VIEW IF EXISTS public.v_live_ops;
--   DROP VIEW IF EXISTS public.v_exec_overview;
--   DROP FUNCTION IF EXISTS public.notify_broadcast(text, text, jsonb);
--   DROP TABLE IF EXISTS public.control_idempotency;
