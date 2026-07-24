-- Eye-test catch 2026-07-24 night (C22-class stale truth, spec-gap rule 5):
-- the Executive Overview "AI Workforce" tile read the LEGACY agents.status
-- column (all 205 rows dormant since the file-first migration) and told the
-- CEO "Active: 0 / Dormant: 205" while the workforce truth is
-- employment_status = 198 active / 1 dormant / 6 archived (the same
-- confusion behind the C22 stale risk). Fix: the agents leg counts
-- employment_status; archived rows leave every figure (C8: CEO surfaces
-- show the working org only).
CREATE OR REPLACE VIEW public.v_exec_overview AS
 WITH berlin AS (
         SELECT ((now() AT TIME ZONE 'Europe/Berlin'::text))::date AS today
        ), task_counts AS (
         SELECT (count(*) FILTER (WHERE (tasks.status = ANY (ARRAY['queued'::text, 'claimed'::text, 'running'::text]))))::integer AS active_tasks,
            (count(*) FILTER (WHERE (tasks.status = 'running'::text)))::integer AS running_tasks,
            (count(*) FILTER (WHERE (tasks.status = 'queued'::text)))::integer AS queued_tasks,
            (count(*) FILTER (WHERE (tasks.status = 'awaiting_approval'::text)))::integer AS tasks_awaiting_approval,
            (count(*) FILTER (WHERE ((tasks.status = 'failed'::text) AND (tasks.updated_at >= (now() - '24:00:00'::interval)))))::integer AS failed_tasks_24h
           FROM tasks
        ), approval_counts AS (
         SELECT (count(*) FILTER (WHERE (approvals.status = 'pending'::text)))::integer AS pending_approvals,
            (count(*) FILTER (WHERE ((approvals.status = 'pending'::text) AND (approvals.risk_class = 'high'::text))))::integer AS pending_high_risk,
            min(approvals.created_at) FILTER (WHERE (approvals.status = 'pending'::text)) AS oldest_pending_at
           FROM approvals
        ), agent_counts AS (
         SELECT (count(*) FILTER (WHERE (agents.employment_status <> 'archived'::text)))::integer AS agents_total,
            (count(*) FILTER (WHERE (agents.employment_status = 'active'::text)))::integer AS agents_active,
            (count(*) FILTER (WHERE (agents.employment_status = 'dormant'::text)))::integer AS agents_dormant
           FROM agents
        ), run_counts AS (
         SELECT (count(*) FILTER (WHERE (agent_runs.status = 'running'::text)))::integer AS runs_active,
            (count(*) FILTER (WHERE (agent_runs.status = 'waiting_approval'::text)))::integer AS runs_waiting_approval
           FROM agent_runs
        ), project_counts AS (
         SELECT (count(*) FILTER (WHERE (projects.status = 'active'::text)))::integer AS projects_active,
            (count(*))::integer AS projects_total
           FROM projects
        ), workflow_counts AS (
         SELECT (count(*) FILTER (WHERE (workflow_runs.status = 'running'::text)))::integer AS workflow_runs_active
           FROM workflow_runs
        ), cost_block AS (
         SELECT (COALESCE(sum(c_1.cost_eur) FILTER (WHERE (((c_1.created_at AT TIME ZONE 'Europe/Berlin'::text))::date = b_1.today)), (0)::numeric))::numeric(10,2) AS cost_today_eur,
            (COALESCE(sum(c_1.cost_eur) FILTER (WHERE (c_1.created_at >= (now() - '7 days'::interval))), (0)::numeric))::numeric(10,2) AS cost_7d_eur,
            (COALESCE(sum(c_1.cost_eur) FILTER (WHERE (date_trunc('month'::text, (c_1.created_at AT TIME ZONE 'Europe/Berlin'::text)) = date_trunc('month'::text, (b_1.today)::timestamp without time zone))), (0)::numeric))::numeric(10,2) AS cost_month_eur,
            COALESCE(sum((c_1.prompt_tokens + c_1.completion_tokens)) FILTER (WHERE (c_1.created_at >= (now() - '7 days'::interval))), (0)::bigint) AS tokens_7d
           FROM cost_ledger c_1,
            berlin b_1
        ), budget AS (
         SELECT budget_state.monthly_cap_eur,
            budget_state.hard_stopped,
            budget_state.breaker_tripped
           FROM budget_state
         LIMIT 1
        ), activity AS (
         SELECT max(task_events.created_at) AS last_activity_at
           FROM task_events
        )
 SELECT t.active_tasks,
    t.running_tasks,
    t.queued_tasks,
    t.tasks_awaiting_approval,
    t.failed_tasks_24h,
    a.pending_approvals,
    a.pending_high_risk,
    a.oldest_pending_at,
    g.agents_total,
    g.agents_active,
    g.agents_dormant,
    r.runs_active,
    r.runs_waiting_approval,
    p.projects_active,
    p.projects_total,
    w.workflow_runs_active,
    c.cost_today_eur,
    c.cost_7d_eur,
    c.cost_month_eur,
    c.tokens_7d,
    b.monthly_cap_eur,
    b.hard_stopped,
    b.breaker_tripped,
    x.last_activity_at
   FROM task_counts t,
    approval_counts a,
    agent_counts g,
    run_counts r,
    project_counts p,
    workflow_counts w,
    cost_block c,
    budget b,
    activity x;
