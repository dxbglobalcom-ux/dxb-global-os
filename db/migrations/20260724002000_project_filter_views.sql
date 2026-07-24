-- Ledger 9d (C9 filter standard): the data pages gain a PROJECT filter, so
-- the views they read must carry project identity. Filter key = projects.slug
-- (URL-friendly), display = projects.name. Columns APPEND (create-or-replace
-- keeps existing positions); rows without a task/project carry nulls and
-- simply never match a project filter.

-- v_workforce_tokens (C24 truth source for /fin/tokens)
create or replace view v_workforce_tokens as
select
  coalesce(t.department, '(system)') as department,
  coalesce(r.model_id, '(unknown)') as model,
  ((r.started_at at time zone 'Europe/Berlin')::date)::text as day,
  r.started_at,
  coalesce(r.tokens_in, 0) + coalesce(r.tokens_out, 0) as tokens,
  p.slug as project_slug,
  p.name as project
from agent_runs r
left join tasks t on r.task_id = t.id
left join projects p on t.project_id = p.id;

grant select on v_workforce_tokens to authenticated;

comment on view v_workforce_tokens is
  'C24 (2026-07-19): workforce token truth — agent_runs × tasks.department. 9d (2026-07-24): + project identity via tasks.project_id.';

-- v_cost_breakdown (COST-04 day grain for /fin/costs daily panel): grain
-- refines by project; PostgREST callers aggregate up, so existing day-level
-- sums are unchanged.
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
  sum(c.cost_eur)::numeric(10, 4)  AS cost_eur,
  p.slug AS project_slug,
  p.name AS project
FROM public.cost_ledger c
LEFT JOIN public.tasks t ON t.id = c.task_id
LEFT JOIN public.projects p ON p.id = t.project_id
GROUP BY 1, 2, 3, 4, 5, p.slug, p.name;

COMMENT ON VIEW public.v_cost_breakdown IS
  '0025x catalog: day/department/model/mode/agent cost grain (COST-04 semantics). 9d (2026-07-24): + project grain via tasks.project_id.';

-- v_cost_entries: cost_ledger rows with project identity, for the filtered
-- page queries (KPIs, breakdowns, ledger table narrow by project). The bare
-- unfiltered path keeps reading cost_ledger directly (COST-04 gate untouched).
CREATE OR REPLACE VIEW public.v_cost_entries
WITH (security_invoker = true) AS
SELECT
  c.id,
  c.task_id,
  c.agent_id,
  c.department,
  c.model,
  c.mode,
  c.prompt_tokens,
  c.completion_tokens,
  c.cost_eur,
  c.source,
  c.meta,
  c.created_at,
  p.slug AS project_slug,
  p.name AS project
FROM public.cost_ledger c
LEFT JOIN public.tasks t ON t.id = c.task_id
LEFT JOIN public.projects p ON p.id = t.project_id;

GRANT SELECT ON public.v_cost_entries TO authenticated;

COMMENT ON VIEW public.v_cost_entries IS
  '9d (2026-07-24): cost_ledger + project identity — the project-filtered read path of /fin/costs.';
