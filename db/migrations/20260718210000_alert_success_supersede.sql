-- Alert hygiene: success supersedes the failure alarm (OBSERVABILITY_SPEC
-- registered adaptation A4, CEO order 2026-07-18 eye session: "do I have to
-- keep seeing these? this must not keep piling up").
--
-- MEASURED problem: the E12.5 activation wave left 123 active alerts whose
-- underlying task LATER reached status='done' (escalation ladder / correction
-- rounds delivered) — the failure alarm outlived its truth and buried the 7
-- real criticals. One manual governed sweep ran 2026-07-18 ~21:05
-- (control_alerts_action op=resolve ×123, audit_log +123). This migration
-- makes the rule permanent and mechanical:
--
--   task transitions to 'done'  →  its still-active alerts auto-resolve
--   with an explicit mitigation note. The A3 single-producer contract is
--   preserved: the alerts-table trigger emits alert.resolved broadcasts,
--   so this UPDATE rides the existing producer — no new broadcast path.
--
-- Scope guard: only alerts bound to THAT task (task_id match). Alerts with
-- no task binding (cost, budget, hook violations, obs spill) are untouched —
-- they have their own lifecycles. Manual CEO resolution stays available for
-- everything else via control_alerts_action.

CREATE OR REPLACE FUNCTION public.fn_alert_supersede_on_task_done()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.alerts
     SET resolved_at = now(),
         mitigation  = COALESCE(mitigation || ' | ', '')
                       || 'auto-resolved: task completed after failure ('
                       || NEW.id || ')'
   WHERE task_id = NEW.id
     AND resolved_at IS NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_alert_supersede_on_task_done ON public.tasks;
CREATE TRIGGER trg_alert_supersede_on_task_done
  AFTER UPDATE OF status ON public.tasks
  FOR EACH ROW
  WHEN (NEW.status = 'done' AND OLD.status IS DISTINCT FROM 'done')
  EXECUTE FUNCTION public.fn_alert_supersede_on_task_done();

-- ROLLBACK BLOCK (db-suite contract — executed by scripts/test/db-suite.sh):
-- DROP TRIGGER IF EXISTS trg_alert_supersede_on_task_done ON public.tasks;
-- DROP FUNCTION IF EXISTS public.fn_alert_supersede_on_task_done();
