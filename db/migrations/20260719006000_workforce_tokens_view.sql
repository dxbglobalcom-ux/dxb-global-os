-- C24 (CEO complaint ledger 2026-07-19): the Tokens page presented
-- construction-session usage (cost_ledger source='hook', all rows stamped
-- department='engineering', model '<synthetic>') as company usage — 21
-- departments worked but only one showed. Truth source for WORKFORCE usage
-- is agent_runs joined to tasks: real runs, real departments, real models.
-- Construction sessions stay visible but separately labeled.

create or replace view v_workforce_tokens as
select
  coalesce(t.department, '(system)') as department,
  coalesce(r.model_id, '(unknown)') as model,
  ((r.started_at at time zone 'Europe/Berlin')::date)::text as day,
  r.started_at,
  coalesce(r.tokens_in, 0) + coalesce(r.tokens_out, 0) as tokens
from agent_runs r
left join tasks t on r.task_id = t.id;

grant select on v_workforce_tokens to authenticated;

comment on view v_workforce_tokens is
  'C24 (2026-07-19): workforce token truth — agent_runs × tasks.department. The Tokens page reads THIS for company usage; cost_ledger hook rows are construction sessions, shown separately.';
