-- 0019-b (E3.1): v_exec_overview_v1 — Executive Overview single source on
-- the EXISTING 18-table schema (MASTER_PLAN §7 P2: visible cockpit before
-- the WS-A backbone; upgraded to v_exec_overview at E4.5, this view then
-- stays as a compatibility alias until the page switch is committed).
-- One row, every figure drillable (CC-SPEC madde 2B). Cost semantics match
-- COST-04 (sum(cost_eur) on cost_ledger) — do not fork. Windows are
-- Europe/Berlin-explicit like v_morning_briefing (0018 idiom).
-- Read-only projection: SECURITY INVOKER, no new table, no write path.

create or replace view public.v_exec_overview_v1
with (security_invoker = true) as
with berlin as (
  select (now() at time zone 'Europe/Berlin')::date as today
),
task_counts as (
  select
    count(*) filter (where status in ('queued', 'claimed', 'running'))::int as active_tasks,
    count(*) filter (where status = 'running')::int                          as running_tasks,
    count(*) filter (where status = 'queued')::int                           as queued_tasks,
    count(*) filter (where status = 'awaiting_approval')::int                as tasks_awaiting_approval,
    count(*) filter (where status = 'failed'
                     and updated_at >= now() - interval '24 hours')::int     as failed_tasks_24h
  from public.tasks
),
approval_counts as (
  select
    count(*) filter (where status = 'pending')::int                          as pending_approvals,
    count(*) filter (where status = 'pending' and risk_class = 'high')::int  as pending_high_risk,
    min(created_at) filter (where status = 'pending')                        as oldest_pending_at
  from public.approvals
),
agent_counts as (
  select
    count(*)::int                                                            as agents_total,
    count(*) filter (where status <> 'dormant')::int                         as agents_active,
    count(*) filter (where status = 'dormant')::int                          as agents_dormant
  from public.agents
),
cost_block as (
  select
    coalesce(sum(c.cost_eur) filter (
      where (c.created_at at time zone 'Europe/Berlin')::date = b.today), 0)::numeric(10, 2)
      as cost_today_eur,
    coalesce(sum(c.cost_eur) filter (
      where c.created_at >= now() - interval '7 days'), 0)::numeric(10, 2)
      as cost_7d_eur,
    coalesce(sum(c.cost_eur) filter (
      where date_trunc('month', c.created_at at time zone 'Europe/Berlin')
          = date_trunc('month', b.today::timestamp)), 0)::numeric(10, 2)
      as cost_month_eur,
    coalesce(sum(c.prompt_tokens + c.completion_tokens) filter (
      where c.created_at >= now() - interval '7 days'), 0)::bigint
      as tokens_7d
  from public.cost_ledger c, berlin b
),
budget as (
  select monthly_cap_eur, hard_stopped, breaker_tripped
  from public.budget_state
  limit 1
),
activity as (
  select max(created_at) as last_activity_at from public.task_events
)
select
  t.active_tasks,
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
  c.cost_today_eur,
  c.cost_7d_eur,
  c.cost_month_eur,
  c.tokens_7d,
  b.monthly_cap_eur,
  b.hard_stopped,
  b.breaker_tripped,
  x.last_activity_at
from task_counts t, approval_counts a, agent_counts g, cost_block c, budget b, activity x;

comment on view public.v_exec_overview_v1 is
  'E3.1 Executive Overview single source (existing 18-table schema). Every column maps to a drill target in CC-SPEC madde 2B; upgraded to the 0025x view catalog at E4.5.';

grant select on public.v_exec_overview_v1 to authenticated;
grant select on public.v_exec_overview_v1 to service_role;

-- ROLLBACK:
--   drop view if exists public.v_exec_overview_v1;
