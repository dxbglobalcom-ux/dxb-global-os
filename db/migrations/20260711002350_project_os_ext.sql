-- 0023x-b (E4.2) — Project OS extensions on the 0023x family.
-- Normative source: PROJECT_OPERATING_SYSTEM_SPEC §4 (recorded additions):
-- project_members (fixed core staff; dynamic membership is computed by
-- v_project_command), project_milestones (phase/milestone, plan body lives in
-- the repo via plan_ref), task_dependencies (deep-cycle trigger below),
-- project_risks, projects.links jsonb, workflows.project_id.
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS public.project_members (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.agents(id),
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','director','member')),
  PRIMARY KEY (project_id, employee_id)
);

CREATE TABLE IF NOT EXISTS public.project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'milestone' CHECK (kind IN ('phase','milestone')),
  seq int NOT NULL,
  title text NOT NULL,
  due_at timestamptz,
  reached_at timestamptz,
  plan_ref text,
  UNIQUE (project_id, seq)
);

CREATE TABLE IF NOT EXISTS public.task_dependencies (
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  depends_on uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, depends_on),
  CHECK (task_id <> depends_on)
);

CREATE TABLE IF NOT EXISTS public.project_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','mitigated','accepted','closed')),
  note text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS links jsonb NOT NULL DEFAULT '{}';
ALTER TABLE public.workflows
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id);

-- Deep-cycle protection (the CHECK only stops self-reference; chains need a walk).
CREATE OR REPLACE FUNCTION public.enforce_task_dependency_acyclic()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    WITH RECURSIVE chain(task_id) AS (
      SELECT NEW.depends_on
      UNION
      SELECT d.depends_on FROM public.task_dependencies d
      JOIN chain c ON d.task_id = c.task_id
    )
    SELECT 1 FROM chain WHERE task_id = NEW.task_id
  ) THEN
    RAISE EXCEPTION 'dependency cycle denied: task % would depend on itself through the chain', NEW.task_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_task_dependencies_acyclic ON public.task_dependencies;
CREATE TRIGGER trg_task_dependencies_acyclic
  BEFORE INSERT OR UPDATE ON public.task_dependencies
  FOR EACH ROW EXECUTE FUNCTION public.enforce_task_dependency_acyclic();

-- RLS + CEO read surface.
ALTER TABLE public.project_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_risks      ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.project_members, public.project_milestones,
  public.task_dependencies, public.project_risks TO authenticated;

DROP POLICY IF EXISTS project_members_ceo_read ON public.project_members;
CREATE POLICY project_members_ceo_read ON public.project_members FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS project_milestones_ceo_read ON public.project_milestones;
CREATE POLICY project_milestones_ceo_read ON public.project_milestones FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS task_dependencies_ceo_read ON public.task_dependencies;
CREATE POLICY task_dependencies_ceo_read ON public.task_dependencies FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS project_risks_ceo_read ON public.project_risks;
CREATE POLICY project_risks_ceo_read ON public.project_risks FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE public.project_milestones is
  '0023x-b Project OS: phase/milestone rows; plan body stays in the repo (plan_ref path).';
COMMENT ON COLUMN public.projects.links is
  '0023x-b Project OS: {repos:[], docs:[], deploys:[], versions:[]} link map (directive item 12).';

-- ROLLBACK:
--   DROP TRIGGER IF EXISTS trg_task_dependencies_acyclic ON public.task_dependencies;
--   DROP FUNCTION IF EXISTS public.enforce_task_dependency_acyclic();
--   ALTER TABLE public.workflows DROP COLUMN IF EXISTS project_id;
--   ALTER TABLE public.projects DROP COLUMN IF EXISTS links;
--   DROP TABLE IF EXISTS public.project_risks;
--   DROP TABLE IF EXISTS public.task_dependencies;
--   DROP TABLE IF EXISTS public.project_milestones;
--   DROP TABLE IF EXISTS public.project_members;
