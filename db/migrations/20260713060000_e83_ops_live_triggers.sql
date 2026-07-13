-- 0022x family (E8.3) — ops:live source triggers (EVENT_MODEL §5/§9/§26).
-- Pattern: source-truth INSERT/UPDATE → §9a envelope → pg_notify('dxb_ops_live')
-- → the 1 s NOTIFY collector in the kernel worker loop publishes through
-- notify_broadcast('ops:live', …) (§26 decision: no new resident service,
-- debounce lives in the collector, NOT here). Direct realtime.send is NOT
-- called from these triggers — that is what the debounce exists for.
-- Trigger errors never block the source write (§15: log + continue).
-- Envelope corr fields come from row FKs (§11: UI guessing forbidden).
-- Payloads are summaries only (§16: no prompt content, no full diffs).
-- Idempotent: safe to re-run.

-- Single NOTIFY door with the 8000-byte pg_notify guard: oversized payloads
-- degrade to a reference-only envelope instead of failing the trigger.
CREATE OR REPLACE FUNCTION public.fn_opslive_notify(p_env jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_text text;
BEGIN
  v_text := p_env::text;
  IF octet_length(v_text) > 7500 THEN
    v_text := jsonb_set(p_env, '{payload}', '{"truncated": true}'::jsonb)::text;
  END IF;
  PERFORM pg_notify('dxb_ops_live', v_text);
END $$;

REVOKE ALL ON FUNCTION public.fn_opslive_notify(jsonb) FROM PUBLIC, anon;

-- ── agent_runs → run.* ──────────────────────────────────────────────────────
-- OBSERVABILITY §9 payload contract: {run_id, status, employee, model, progress}.
CREATE OR REPLACE FUNCTION public.broadcast_opslive_agent_runs()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_type text;
  v_project uuid;
  v_slug text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_type := 'run.started';
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    v_type := CASE NEW.status
      WHEN 'succeeded'        THEN 'run.succeeded'
      WHEN 'failed'           THEN 'run.failed'
      WHEN 'waiting_approval' THEN 'run.waiting_approval'
      WHEN 'paused'           THEN 'run.paused'
      WHEN 'cancelled'        THEN 'run.cancelled'
      ELSE 'run.progressed'
    END;
  ELSE
    v_type := 'run.progressed'; -- tokens/progress update, status unchanged
  END IF;

  SELECT t.project_id INTO v_project FROM public.tasks t WHERE t.id = NEW.task_id;
  SELECT a.slug INTO v_slug FROM public.agents a WHERE a.id = NEW.employee_id;

  PERFORM public.fn_opslive_notify(jsonb_build_object(
    'event_id', gen_random_uuid(),
    'ts', now(),
    'type', v_type,
    'actor', CASE WHEN NEW.employee_id IS NULL THEN 'system'
                  ELSE 'employee:' || NEW.employee_id::text END,
    'entity', jsonb_build_object('kind', 'run', 'id', NEW.id::text),
    'corr', jsonb_build_object(
      'task_id', NEW.task_id,
      'run_id', NEW.id,
      'workflow_run_id', NEW.workflow_run_id,
      'project_id', v_project),
    'payload', jsonb_build_object(
      'run_id', NEW.id,
      'status', NEW.status,
      'employee', v_slug,
      'model', NEW.model_id,
      'progress', NEW.progress_pct)
  ));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'ops:live trigger error swallowed (%.%): %', TG_TABLE_NAME, TG_OP, SQLERRM;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_broadcast_opslive_runs ON public.agent_runs;
CREATE TRIGGER trg_broadcast_opslive_runs
  AFTER INSERT OR UPDATE ON public.agent_runs
  FOR EACH ROW EXECUTE FUNCTION public.broadcast_opslive_agent_runs();

-- ── task_events → task.event_appended ───────────────────────────────────────
-- The 0013 dxb:task_events channel (LOCKED) stays untouched; ops:live is the
-- §9b catalog channel the cockpit migrates to.
CREATE OR REPLACE FUNCTION public.broadcast_opslive_task_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_project uuid;
BEGIN
  SELECT t.project_id INTO v_project FROM public.tasks t WHERE t.id = NEW.task_id;

  PERFORM public.fn_opslive_notify(jsonb_build_object(
    'event_id', gen_random_uuid(),
    'ts', now(),
    'type', 'task.event_appended',
    'actor', NEW.actor,
    'entity', jsonb_build_object('kind', 'task', 'id', NEW.task_id::text),
    'corr', jsonb_build_object(
      'task_id', NEW.task_id,
      'run_id', NULL,
      'workflow_run_id', NULL,
      'project_id', v_project),
    'payload', jsonb_build_object(
      'task_event_id', NEW.id,
      'event', NEW.event,
      'from_status', NEW.from_status,
      'to_status', NEW.to_status)
  ));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'ops:live trigger error swallowed (%.%): %', TG_TABLE_NAME, TG_OP, SQLERRM;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_broadcast_opslive_task_events ON public.task_events;
CREATE TRIGGER trg_broadcast_opslive_task_events
  AFTER INSERT ON public.task_events
  FOR EACH ROW EXECUTE FUNCTION public.broadcast_opslive_task_events();

-- ── decision_log → decision.logged ──────────────────────────────────────────
-- OBSERVABILITY §9 payload contract: {decision_id, kind, actor}.
CREATE OR REPLACE FUNCTION public.broadcast_opslive_decisions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_task uuid;
  v_workflow uuid;
  v_project uuid;
BEGIN
  SELECT r.task_id, r.workflow_run_id, t.project_id
    INTO v_task, v_workflow, v_project
  FROM public.agent_runs r
  LEFT JOIN public.tasks t ON t.id = r.task_id
  WHERE r.id = NEW.run_id;

  PERFORM public.fn_opslive_notify(jsonb_build_object(
    'event_id', gen_random_uuid(),
    'ts', now(),
    'type', 'decision.logged',
    'actor', NEW.decided_by,
    'entity', jsonb_build_object('kind', 'decision', 'id', NEW.id::text),
    'corr', jsonb_build_object(
      'task_id', v_task,
      'run_id', NEW.run_id,
      'workflow_run_id', v_workflow,
      'project_id', v_project),
    'payload', jsonb_build_object(
      'decision_id', NEW.id,
      'kind', NEW.decision,
      'actor', NEW.decided_by)
  ));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'ops:live trigger error swallowed (%.%): %', TG_TABLE_NAME, TG_OP, SQLERRM;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_broadcast_opslive_decisions ON public.decision_log;
CREATE TRIGGER trg_broadcast_opslive_decisions
  AFTER INSERT ON public.decision_log
  FOR EACH ROW EXECUTE FUNCTION public.broadcast_opslive_decisions();

-- ROLLBACK (safe one-way retreat — source writes keep flowing, EVENT_MODEL §23):
--   DROP TRIGGER IF EXISTS trg_broadcast_opslive_decisions ON public.decision_log;
--   DROP TRIGGER IF EXISTS trg_broadcast_opslive_task_events ON public.task_events;
--   DROP TRIGGER IF EXISTS trg_broadcast_opslive_runs ON public.agent_runs;
--   DROP FUNCTION IF EXISTS public.broadcast_opslive_decisions();
--   DROP FUNCTION IF EXISTS public.broadcast_opslive_task_events();
--   DROP FUNCTION IF EXISTS public.broadcast_opslive_agent_runs();
--   DROP FUNCTION IF EXISTS public.fn_opslive_notify(jsonb);
