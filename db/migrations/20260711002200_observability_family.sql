-- 0022x (E4.1) — observability family: agent_runs (run state machine),
-- decision_log (directive item 10.2), tool_calls (10.3), file_changes (10.4).
-- Normative source: DATA_MODEL §4.3. agent_runs.workflow_run_id stays plain
-- uuid here — its FK to workflow_runs is added at the end of 0023x
-- (DATA_MODEL §4.4 note). Log tables are append-only (§12); agent_runs is a
-- state machine and stays updatable through kernel paths.
-- Writers arrive at E8 (orchestrator SDK wrapper); this migration is schema only.
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS public.agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.agents(id),
  task_id uuid REFERENCES public.tasks(id),
  workflow_run_id uuid,
  parent_run_id uuid REFERENCES public.agent_runs(id),
  model_id text,
  status text NOT NULL DEFAULT 'running'
    CHECK (status IN ('running','waiting_approval','paused','cancelled','failed','succeeded')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  tokens_in bigint NOT NULL DEFAULT 0,
  tokens_out bigint NOT NULL DEFAULT 0,
  cost_eur numeric NOT NULL DEFAULT 0,
  progress_pct int,
  error text
);

CREATE TABLE IF NOT EXISTS public.decision_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id uuid REFERENCES public.agent_runs(id),
  decided_by text NOT NULL,
  decision text NOT NULL,
  rationale text NOT NULL,
  data_used text[],
  alternatives jsonb,
  confidence numeric,
  risk text,
  approval_id uuid REFERENCES public.approvals(id),
  outcome text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tool_calls (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id uuid REFERENCES public.agent_runs(id),
  tool text NOT NULL,
  params_digest jsonb,
  duration_ms int,
  ok boolean,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.file_changes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id uuid REFERENCES public.agent_runs(id),
  path text NOT NULL,
  op text NOT NULL CHECK (op IN ('read','create','modify','delete')),
  diff_summary text,
  commit_sha text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index strategy: run drill-down always descends run_id → detail rows;
-- live surfaces filter agent_runs by status/recency.
CREATE INDEX IF NOT EXISTS idx_agent_runs_status_started ON public.agent_runs (status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_task ON public.agent_runs (task_id);
CREATE INDEX IF NOT EXISTS idx_decision_log_run ON public.decision_log (run_id);
CREATE INDEX IF NOT EXISTS idx_tool_calls_run ON public.tool_calls (run_id);
CREATE INDEX IF NOT EXISTS idx_file_changes_run ON public.file_changes (run_id);

-- Append-only (DATA_MODEL §12): detail logs take no UPDATE/DELETE from
-- API-reachable roles; TRUNCATE revoked per 0008 precedent. file_changes
-- review fields are written via control_audit_mark_reviewed (SECURITY
-- DEFINER, owner-privileged) — role-level revoke still holds.
REVOKE UPDATE, DELETE, TRUNCATE ON public.decision_log, public.tool_calls, public.file_changes
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE TRUNCATE ON public.agent_runs
  FROM PUBLIC, anon, authenticated, service_role;

-- RLS + CEO read surface.
ALTER TABLE public.agent_runs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_calls   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_changes ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.agent_runs, public.decision_log,
  public.tool_calls, public.file_changes TO authenticated;

DROP POLICY IF EXISTS agent_runs_ceo_read ON public.agent_runs;
CREATE POLICY agent_runs_ceo_read ON public.agent_runs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS decision_log_ceo_read ON public.decision_log;
CREATE POLICY decision_log_ceo_read ON public.decision_log FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS tool_calls_ceo_read ON public.tool_calls;
CREATE POLICY tool_calls_ceo_read ON public.tool_calls FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS file_changes_ceo_read ON public.file_changes;
CREATE POLICY file_changes_ceo_read ON public.file_changes FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE public.agent_runs is
  '0022x observability family: run state machine (waiting_approval is PARK, not retry); sub-agent chain via parent_run_id.';
COMMENT ON TABLE public.decision_log is
  '0022x observability family: append-only, PERMANENT retention (AUDIT §4) — directive item 10.2 fields verbatim.';
COMMENT ON TABLE public.tool_calls is
  '0022x observability family: append-only; 180-day distill-then-prune retention class (AUDIT §4).';
COMMENT ON TABLE public.file_changes is
  '0022x observability family: append-only; 180-day distill-then-prune retention class (AUDIT §4).';

-- ROLLBACK:
--   DROP TABLE IF EXISTS public.file_changes;
--   DROP TABLE IF EXISTS public.tool_calls;
--   DROP TABLE IF EXISTS public.decision_log;
--   DROP TABLE IF EXISTS public.agent_runs;
