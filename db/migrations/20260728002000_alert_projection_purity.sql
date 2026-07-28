-- Alert projection purity — construction artifacts must never reach the CEO's
-- KRİTİK UYARILAR panel, even when the run that produced them dies mid-flight.
--
-- CEO-caught defect 2026-07-28 01:50 ("inşaat kodları buraya şirkete
-- yansıyor"): three rows stood on his panel — two 'Hook ihlali' alerts and
-- "Workflow 'r23t-58311cec-revise' run failed (RETRY_EXHAUSTED)".
--
-- Root cause chain, measured the same night:
--   journal 01:49:01 / 01:51:39 / 01:53:14 — `earlyoom: sending SIGTERM to
--   process ... "code": badness 893, VmRSS 547 MiB` (swap free: 0 of 6143 MiB).
--   The editor died three times; the suite running inside it died with it, so
--   tests/global-teardown.ts — which owns five residue sweeps — never ran.
--
-- The lesson is NOT a sixth sweep. A sweep only protects the CEO when the run
-- survives long enough to reach it, and tonight proved it does not. The classes
-- that CAN be closed are closed at the PROJECTION instead. Neither gate below
-- knows a test name; both rest on a measured production invariant.
--
--   A) post/runtime-gate violation with run_id IS NULL.
--      Both production callers state it in code — worker-shim.ts:576 and
--      workflow/steps/agent.ts:138: "pre-gate BEFORE the run is born", with the
--      in-run monitors and the post-gate INSIDE the run scope. Measured
--      2026-07-28 02:06 over 1963 live rows:
--          gate     | run_id NULL | run_id set
--          pre      |     516     |      0        <- ALWAYS null, prod included
--          post     |     208     |   1058
--          runtime  |      30     |    151
--      So a post/runtime violation without a run cannot come from company work;
--      it is an engine called directly. The violation row is still written
--      (append-only audit, §4/§7 untouched) — only the CEO projection stops.
--
--      The pre-gate class is deliberately NOT touched: a real production
--      rejection carries run_id NULL exactly like a probe does (516/0 above),
--      and today's schema holds no other discriminator — hook_violations
--      records neither employee nor task, and the workflow-step path sets
--      task.id = null by design (steps/agent.ts:110). Suppressing it would
--      hide genuine halal/permission rejections from the CEO. Named as an open
--      boundary rather than closed on a guess (RULE #0-A).
--
--   B) An alert about a workflow that no longer exists is an orphaned
--      projection. Measured 2026-07-28 02:02: the r23 suite HAD deleted its
--      fixture workflow rows (0 left) while its alert stood, because alerts
--      carry the slug as text with no FK. Deleting a workflow now resolves its
--      open alerts — correct for production too: a workflow that is gone
--      cannot be "inspected in Live Operations and re-run", which is precisely
--      what the alert's own suggested_action tells the CEO to do.
--
-- Verification: tests/e10/alert-projection-purity.test.ts.

-- ── A. hook violation projection ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_hook_violation_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_level text;
  v_title text;
BEGIN
  -- A post/runtime gate fires INSIDE a run's scope; without a run there was no
  -- company work behind it, only a direct engine call. Audit row above stays,
  -- CEO projection stops here. The pre-gate is exempt: it legitimately runs
  -- before the run is born, so NULL there is the production shape.
  IF NEW.run_id IS NULL AND NEW.gate IN ('post', 'runtime') THEN
    RETURN NEW;
  END IF;

  BEGIN
    v_level := CASE NEW.action_taken
      WHEN 'escalated' THEN 'high'          -- §7: escalation reaches the CEO wall
      WHEN 'rejected'  THEN 'attention'
      ELSE 'informational'                  -- revised / warned
    END;
    SELECT title_en INTO v_title FROM hook_policies WHERE id = NEW.policy_id;
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, run_id, dedup_key, source_ref)
    VALUES (v_level, 'hook',
            'Hook violation: ' || COALESCE(v_title, NEW.policy_id),
            NEW.gate || '-gate',
            left(NEW.detail, 300),
            'Review the violation on /gov/violations; repeated violations feed the HR error record',
            NEW.run_id,
            -- action in the key: an early 'revised' (informational) must never
            -- mask the later 'escalated' (high) for the same policy+run.
            'hook:' || NEW.policy_id || ':' || NEW.action_taken || ':'
              || COALESCE(NEW.run_id::text, 'no-run'),
            jsonb_build_object('table', 'hook_violations', 'id', NEW.id))
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- The alert is a projection; losing it must never fail the violation record.
    RAISE WARNING 'hook violation alert swallowed: %', SQLERRM;
  END;
  RETURN NEW;
END $function$;

-- ── B. workflow deletion resolves its open alerts ───────────────────────────
CREATE OR REPLACE FUNCTION public.fn_workflow_delete_resolve_alerts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    UPDATE alerts
       SET resolved_at = now(),
           mitigation = COALESCE(mitigation,
             'Auto-resolved: the workflow this alert points at no longer exists.')
     WHERE resolved_at IS NULL
       AND affected_area = 'workflow:' || OLD.slug;
  EXCEPTION WHEN OTHERS THEN
    -- Same rule as above: the projection must never block the delete.
    RAISE WARNING 'workflow alert resolve swallowed: %', SQLERRM;
  END;
  RETURN OLD;
END $function$;

DROP TRIGGER IF EXISTS trg_workflow_delete_resolve_alerts ON public.workflows;
CREATE TRIGGER trg_workflow_delete_resolve_alerts
  AFTER DELETE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.fn_workflow_delete_resolve_alerts();

-- ── C. a violation deleted takes its projection with it ─────────────────────
-- Found while fixing A: tests/global-teardown.ts swept every hook alert whose
-- dedup_key ends in ':no-run'. Because pre-gate ALWAYS has a null run (516/0
-- above), that sweep has been deleting REAL pre-gate rejections — halal and
-- permission blocks among them — every time the suite ran. Deleting a genuine
-- constitutional rejection off the CEO's panel is far worse than showing him a
-- probe, so the blind sweep goes and this intrinsic rule replaces it: a suite
-- removes the violation rows it created (id watermark, E9.3 rule), and an alert
-- whose violation row is gone is an orphaned projection. Production violations
-- are never deleted, so their alerts are never touched.
CREATE OR REPLACE FUNCTION public.fn_hook_violation_delete_resolve_alerts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    DELETE FROM alerts
     WHERE source = 'hook'
       AND source_ref->>'table' = 'hook_violations'
       AND source_ref->>'id' = OLD.id::text;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'hook violation alert cleanup swallowed: %', SQLERRM;
  END;
  RETURN OLD;
END $function$;

DROP TRIGGER IF EXISTS trg_hook_violation_delete_resolve_alerts ON public.hook_violations;
CREATE TRIGGER trg_hook_violation_delete_resolve_alerts
  AFTER DELETE ON public.hook_violations
  FOR EACH ROW EXECUTE FUNCTION public.fn_hook_violation_delete_resolve_alerts();

-- ── One-time purge of the residue these gates prevent ───────────────────────
-- Deleted, not resolved: a construction probe was never company history. Both
-- predicates are the intrinsic ones the gates use — no test-name matching, and
-- the pre-gate class is left standing for the reason argued above.
DELETE FROM alerts
 WHERE source = 'hook'
   AND dedup_key LIKE '%:no-run'
   AND affected_area IN ('post-gate', 'runtime-gate');

DELETE FROM alerts
 WHERE source = 'workflow'
   AND affected_area LIKE 'workflow:%'
   AND NOT EXISTS (
     SELECT 1 FROM workflows w
      WHERE 'workflow:' || w.slug = alerts.affected_area);
