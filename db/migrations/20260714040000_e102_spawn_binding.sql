-- E10.2 — SPAWN-PATH BINDING (FABLE_5_HOOK_SPEC §3/§9/§14/§21/§22/§27)
-- Roadmap: | E10.2 | Spawn yoluna bağlama (orchestrator) + hook_version damgası |
--          spawn → agents.hook_version dolu |
--
-- 1. agent_runs carries its STARTING hook version (§27: runs that straddle a
--    version bump finish on the version they were born with) and the gate
--    summary at close (§14: gate decisions land on agent_runs; §9: the
--    run.finished payload exposes it as hook_result).
-- 2. Ops:live run envelope (E8.3 trigger) gains 'hook_result' in the payload —
--    §9 "run.finished payload'ında hook_result alanı" on the E8.3 envelope's
--    terminal event names (run.succeeded / run.failed — registered adaptation).
-- 3. §21 backfill: no non-archived employee may sit unbound (NULL hook_version).
--    HR factory has stamped 'v1' since E5.4b; this closes pre-factory rows.
-- 4. hook.enabled global → true — the E10.1 seed comment's promise ("E10.2
--    flips after binding"). The flag stays as the §22 kill-switch; the binding
--    raises a 'hook:disabled' attention alert whenever a spawn flows past a
--    disabled hook (flag-off period is temporary AND alerted).
--
-- Idempotent: safe to re-run.

-- ── 1. agent_runs columns (§27 + §14) ───────────────────────────────────────

ALTER TABLE public.agent_runs
  ADD COLUMN IF NOT EXISTS hook_version text,
  ADD COLUMN IF NOT EXISTS hook_result jsonb;

COMMENT ON COLUMN public.agent_runs.hook_version IS
  'FABLE_5_HOOK §27: the hook version the run was born under (stamped at spawn; a version bump mid-run does not move it).';
COMMENT ON COLUMN public.agent_runs.hook_result IS
  'FABLE_5_HOOK §14/§9: gate summary written at run close — {hook_version, pre:{verdict,warnings}, post:{verdict,violations,warnings,rounds}, monitors:{...}}.';

-- ── 2. ops:live run envelope + hook_result (§9) ─────────────────────────────
-- Same body as 20260713060000 with ONE addition in the payload object.

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
      'progress', NEW.progress_pct,
      -- E10.2 (§9): Live Operations badge source. NULL until the close write;
      -- terminal events (run.succeeded/run.failed) carry the real summary.
      'hook_result', NEW.hook_result)
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

-- ── 3. §21 backfill — no unbound live employee ──────────────────────────────
-- Archived rows stay NULL (they cannot spawn; NULL is honest there).

UPDATE public.agents
   SET hook_version = 'v1'
 WHERE employment_status <> 'archived'
   AND hook_version IS NULL;

-- ── 4. hook.enabled → true (E10.1 promise; §22 kill-switch remains) ─────────

UPDATE public.settings_values
   SET value = 'true'::jsonb,
       updated_by = 'system'
 WHERE key = 'hook.enabled'
   AND scope = 'global'
   AND value <> 'true'::jsonb;

-- ── Rollback plan ────────────────────────────────────────────────────────────
-- UPDATE settings_values SET value='false' WHERE key='hook.enabled' AND scope='global';
--   (dispatch flows the old path again — §22; the flag-off alert keeps it visible)
-- CREATE OR REPLACE broadcast_opslive_agent_runs() from 20260713060000 (drops payload key);
-- ALTER TABLE agent_runs DROP COLUMN IF EXISTS hook_result, DROP COLUMN IF EXISTS hook_version;
-- agents.hook_version backfill needs no rollback (the column predates E10; values stay true).
