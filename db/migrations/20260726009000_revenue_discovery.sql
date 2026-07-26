-- W2.2 — THE DISCOVERY ENGINE (REVENUE_ENGINE_SPEC §3 "SCAN MARKET", §5, §6, §25).
--
-- Measured before this migration: `opportunities` held 0 rows, `revenue.scan`
-- only re-read rows that already existed (an intake screen over an empty table),
-- and the research tools the holding installed for exactly this job had NEVER
-- been called — `tool_calls` carried 240 dxb-mcp rows, 2 git, 1 context7 and
-- **zero scrapling**. The spec's answer was already written (§5: "scan jobs
-- enqueue research tasks for departments … upgrades automatically when R2
-- activates, same task seam"); R2 activated on 2026-07-18 and nothing was ever
-- wired to that seam.
--
-- This is the ledger half. Discovery commissions a REAL research task on the
-- existing worker rails (staffed, so the strategy department's compiled tool
-- surface — which carries scrapling — is mounted), and later harvests that
-- task's findings into `opportunities` through the audited control door. The
-- table is what makes the second half honest: a task is harvested exactly once,
-- and every registered opportunity can name the run it came from.

BEGIN;

CREATE TABLE IF NOT EXISTS public.revenue_scout_runs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id        uuid NOT NULL UNIQUE REFERENCES public.tasks(id) ON DELETE CASCADE,
  objective_id   uuid REFERENCES public.objectives(id) ON DELETE SET NULL,
  commissioned_at timestamptz NOT NULL DEFAULT now(),
  harvested_at   timestamptz,
  -- what the harvest actually did, in the harvest's own words: how many
  -- candidates the scout returned, how many became opportunities, and why the
  -- rest did not. A discovery pass that silently drops findings is the same
  -- defect class as a silent send failure.
  outcome        jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_scout_runs_open
  ON public.revenue_scout_runs (commissioned_at DESC)
  WHERE harvested_at IS NULL;

ALTER TABLE public.revenue_scout_runs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.revenue_scout_runs TO authenticated;
DROP POLICY IF EXISTS scout_runs_ceo_read ON public.revenue_scout_runs;
CREATE POLICY scout_runs_ceo_read ON public.revenue_scout_runs
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.settings_registry
  (key, category, value_schema, risk, requires_approval, cost_impact, affected_areas,
   description_en, description_tr, locked, scope_types, delegate)
VALUES
  ('revenue.discovery.pipeline_floor', 'revenue',
   '{"type":"number","default":5}',
   'low', false, 'tokens', '{revenue,discovery}',
   'Below this many undecided opportunities, the daily scan commissions a new research run',
   'Bu sayının altında karara bağlanmamış fırsat kalınca günlük tarama yeni bir araştırma görevi açar',
   false, '{global}', NULL),
  ('revenue.discovery.max_candidates', 'revenue',
   '{"type":"number","default":6}',
   'low', false, 'tokens', '{revenue,discovery}',
   'Maximum candidates one research run may return (a longer list is thinner research, not more of it)',
   'Bir araştırma görevinin döndürebileceği en fazla aday sayısı (uzun liste daha çok değil, daha sığ araştırmadır)',
   false, '{global}', NULL),
  ('revenue.discovery.enabled', 'revenue',
   '{"type":"boolean","default":true}',
   'medium', false, 'tokens', '{revenue,discovery}',
   'Whether the daily scan may commission research runs at all',
   'Günlük taramanın araştırma görevi açıp açamayacağı',
   false, '{global}', NULL)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings_values (key, scope, value, updated_by)
VALUES
  ('revenue.discovery.pipeline_floor', 'global', '5'::jsonb, 'migration-w22'),
  ('revenue.discovery.max_candidates', 'global', '6'::jsonb, 'migration-w22'),
  ('revenue.discovery.enabled', 'global', 'true'::jsonb, 'migration-w22')
ON CONFLICT DO NOTHING;

COMMIT;

-- ROLLBACK:
--   DROP TABLE IF EXISTS public.revenue_scout_runs;
--   DELETE FROM public.settings_values  WHERE key LIKE 'revenue.discovery.%';
--   DELETE FROM public.settings_registry WHERE key LIKE 'revenue.discovery.%';
