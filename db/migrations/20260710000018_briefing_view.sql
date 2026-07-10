-- 0018 (Phase 9 / 09-02): v_morning_briefing — the ONE content source for the
-- JARVIS morning briefing (master-plan LOCKED: "brifing tek SQL görünümden;
-- ajan brifing yazmaz"). Three deterministic blocks, fixed order:
--   1 overnight_work  — task_events since yesterday 19:00 Europe/Berlin
--   2 approvals       — pending queue (total, by risk class, 5 oldest)
--   3 cost_24h        — cost_ledger rolling 24h (total EUR + top 3 departments;
--                       same table + sum(cost_eur) semantics as COST-04
--                       apps/dashboard/src/lib/costs.ts — do not fork)
-- Read-only projection: SECURITY INVOKER, no new table, no write path.
-- Windows are timezone-explicit so the 07:00 briefing always means
-- "since yesterday evening" regardless of server tz.

create or replace view public.v_morning_briefing
with (security_invoker = true) as
with overnight as (
  select (((now() at time zone 'Europe/Berlin')::date - 1)
          + time '19:00') at time zone 'Europe/Berlin' as start_ts
),
work_counts as (
  select coalesce(
           jsonb_object_agg(s.to_status, s.cnt),
           '{}'::jsonb
         ) as by_status,
         coalesce(sum(s.cnt), 0)::int as total_events
  from (
    select e.to_status, count(*)::int as cnt
    from public.task_events e, overnight o
    where e.created_at >= o.start_ts
      and e.to_status is not null
    group by e.to_status
  ) s
),
work_done as (
  select coalesce(
           jsonb_agg(jsonb_build_object(
             'objective', left(t.objective, 80),
             'department', t.department
           ) order by d.last_at desc),
           '[]'::jsonb
         ) as recent_done
  from (
    select e.task_id, max(e.created_at) as last_at
    from public.task_events e, overnight o
    where e.created_at >= o.start_ts
      and e.to_status = 'done'
    group by e.task_id
    order by max(e.created_at) desc
    limit 5
  ) d
  join public.tasks t on t.id = d.task_id
),
appr_counts as (
  select coalesce(jsonb_object_agg(r.risk_class, r.cnt), '{}'::jsonb) as by_risk,
         coalesce(sum(r.cnt), 0)::int as pending_total
  from (
    select a.risk_class, count(*)::int as cnt
    from public.approvals a
    where a.status = 'pending'
    group by a.risk_class
  ) r
),
appr_oldest as (
  select coalesce(
           jsonb_agg(jsonb_build_object(
             'action_type', p.action_type,
             'objective', left(p.objective, 80),
             'risk_class', p.risk_class,
             'waiting_since', p.created_at
           ) order by p.created_at asc),
           '[]'::jsonb
         ) as oldest
  from (
    select a.action_type, a.risk_class, a.created_at, t.objective
    from public.approvals a
    join public.tasks t on t.id = a.task_id
    where a.status = 'pending'
    order by a.created_at asc
    limit 5
  ) p
),
cost_by_dept as (
  select coalesce(c.department, '—') as dept,
         sum(c.cost_eur)::numeric(12, 6) as total_eur
  from public.cost_ledger c
  where c.created_at >= now() - interval '24 hours'
  group by 1
),
cost_block as (
  select coalesce(sum(total_eur), 0)::numeric(12, 6) as total_24h,
         coalesce(
           (select jsonb_agg(jsonb_build_object('department', d.dept, 'total_eur', d.total_eur)
                             order by d.total_eur desc)
            from (select dept, total_eur from cost_by_dept order by total_eur desc limit 3) d),
           '[]'::jsonb
         ) as top_departments
  from cost_by_dept
)
select 1 as sort,
       'overnight_work' as block,
       jsonb_build_object(
         'window_start', (select start_ts from overnight),
         'total_events', (select total_events from work_counts),
         'by_status', (select by_status from work_counts),
         'recent_done', (select recent_done from work_done)
       ) as payload
union all
select 2,
       'approvals',
       jsonb_build_object(
         'pending_total', (select pending_total from appr_counts),
         'by_risk', (select by_risk from appr_counts),
         'oldest', (select oldest from appr_oldest)
       )
union all
select 3,
       'cost_24h',
       jsonb_build_object(
         'total_eur', (select total_24h from cost_block),
         'top_departments', (select top_departments from cost_block)
       );

comment on view public.v_morning_briefing is
  'Phase 9 morning briefing single source (3 blocks, fixed sort). LLM rewords rows only — never invents content.';

grant select on public.v_morning_briefing to authenticated;
grant select on public.v_morning_briefing to service_role;
