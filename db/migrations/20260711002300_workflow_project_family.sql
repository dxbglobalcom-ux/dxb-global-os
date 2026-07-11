-- 0023x (E4.2) — work family: projects (directive item 12), tasks.project_id
-- bridge, workflows + workflow_steps + workflow_runs.
-- Normative sources: DATA_MODEL §4.4; WORKFLOW_ENGINE §10 recorded addition
-- workflow_runs.steps_snapshot (a run freezes its step set at start — editing
-- a workflow never mutates a running run). agent_runs.workflow_run_id gets its
-- FK here, at family end (DATA_MODEL §4.4 note).
-- Writes arrive via control_workflow_* / control_project_* fns (E9) — schema only.
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  purpose text NOT NULL,
  strategy_link text,
  owner_employee_id uuid REFERENCES public.agents(id),
  company_id uuid REFERENCES public.companies(id),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','paused','done','archived')),
  health_score numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id);

CREATE TABLE IF NOT EXISTS public.workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  owner_employee_id uuid REFERENCES public.agents(id),
  trigger jsonb NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  budget_eur numeric,
  token_limit bigint,
  timeout_s int,
  risk text NOT NULL DEFAULT 'low',
  logging_level text NOT NULL DEFAULT 'normal',
  output_standard text,
  version int NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  seq int NOT NULL,
  kind text NOT NULL CHECK (kind IN ('agent','approval','review','retry','fallback')),
  config jsonb NOT NULL DEFAULT '{}',
  UNIQUE (workflow_id, seq)
);

CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES public.workflows(id),
  status text NOT NULL DEFAULT 'running'
    CHECK (status IN ('running','waiting_approval','failed','succeeded','cancelled')),
  triggered_by text NOT NULL,
  current_step int,
  steps_snapshot jsonb NOT NULL DEFAULT '[]',  -- WORKFLOW_ENGINE §10: step set frozen at run start
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

-- Family-end bridge: agent_runs joins the workflow run chain (0022x left it plain uuid).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_agent_runs_wfrun') THEN
    ALTER TABLE public.agent_runs
      ADD CONSTRAINT fk_agent_runs_wfrun FOREIGN KEY (workflow_run_id) REFERENCES public.workflow_runs(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON public.workflow_runs (status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_wfrun ON public.agent_runs (workflow_run_id);

REVOKE TRUNCATE ON public.projects, public.workflows, public.workflow_steps, public.workflow_runs
  FROM PUBLIC, anon, authenticated, service_role;

-- RLS + CEO read surface.
ALTER TABLE public.projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs  ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.projects, public.workflows,
  public.workflow_steps, public.workflow_runs TO authenticated;

DROP POLICY IF EXISTS projects_ceo_read ON public.projects;
CREATE POLICY projects_ceo_read ON public.projects FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS workflows_ceo_read ON public.workflows;
CREATE POLICY workflows_ceo_read ON public.workflows FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS workflow_steps_ceo_read ON public.workflow_steps;
CREATE POLICY workflow_steps_ceo_read ON public.workflow_steps FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS workflow_runs_ceo_read ON public.workflow_runs;
CREATE POLICY workflow_runs_ceo_read ON public.workflow_runs FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE public.projects is
  '0023x work family: first-class projects (directive item 12); DXB Global OS itself is the dogfood first row (E4.4 seed).';
COMMENT ON TABLE public.workflow_runs is
  '0023x work family: run state machine — waiting_approval is PARK (no retry counter, no timeout); steps_snapshot freezes the step set at start.';

-- ROLLBACK:
--   ALTER TABLE public.agent_runs DROP CONSTRAINT IF EXISTS fk_agent_runs_wfrun;
--   DROP TABLE IF EXISTS public.workflow_runs;
--   DROP TABLE IF EXISTS public.workflow_steps;
--   DROP TABLE IF EXISTS public.workflows;
--   ALTER TABLE public.tasks DROP COLUMN IF EXISTS project_id;
--   DROP TABLE IF EXISTS public.projects;
