-- Probation-wave hook escalations: orchestrator lane (APPROVAL_ENGINE_SPEC
-- registered adaptation — CEO standing order 2026-07-18 in-session:
-- "bunları orkestratör olarak fable 5 yönetmeli" + blanket "onay veriyorum").
--
-- PRECEDENT (this session, measured): the E12.5 activation wave parked 113
-- hook_escalation approvals in the CEO queue; by wave end 113/113 were
-- success-superseded (85 original task done via ladder, 28 employee passed
-- via correction round) — zero required an actual CEO decision. The CEO
-- batch-approved them in person (audit approval.approve ×113).
--
-- PERMANENT RULE: fn_approvals_supersede_sweep() closes pending
-- hook_escalation approvals ONLY when the success condition is already
-- proven in data:
--   * the approval's task reached status='done', OR
--   * the task's agent holds a 'done' HR-probation work sample
--     (correction-round success).
-- Everything else stays pending for the CEO. Money-out/contract/identity
-- classes are untouched (different action_types; §13 CEO-only law intact).
-- decided_by records the orchestrator lane explicitly — never 'ceo'.
-- Wave-monitor calls this at wave close; it is idempotent and safe anytime.

CREATE OR REPLACE FUNCTION public.fn_approvals_supersede_sweep()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_closed int := 0;
  r record;
BEGIN
  FOR r IN
    SELECT ap.id, ap.task_id
      FROM approvals ap
      JOIN tasks t ON t.id = ap.task_id
     WHERE ap.status = 'pending'
       AND ap.action_type = 'hook_escalation'
       AND (
         t.status = 'done'
         OR EXISTS (SELECT 1 FROM tasks c
                     WHERE c.agent_id = t.agent_id
                       AND c.objective LIKE 'HR probation:%'
                       AND c.status = 'done')
       )
     FOR UPDATE OF ap
  LOOP
    UPDATE approvals
       SET status = 'approved',
           decided_by = 'orchestrator:success-supersede',
           decided_at = now(),
           decided_action = 'approve',
           decision_note = 'auto: success supersedes the escalation (CEO standing order 2026-07-18 — probation-wave hook escalations are orchestrator-managed once the employee holds a passed work sample)'
     WHERE id = r.id;
    INSERT INTO audit_log (actor, actor_type, action, task_id, payload, detail_ref)
    VALUES ('orchestrator:success-supersede', 'system', 'approval.approve',
            r.task_id,
            jsonb_build_object('approval_id', r.id, 'lane', 'supersede_sweep'),
            jsonb_build_object('table', 'approvals', 'id', r.id));
    v_closed := v_closed + 1;
  END LOOP;
  RETURN jsonb_build_object('ok', true, 'closed', v_closed);
END;
$$;

-- ROLLBACK BLOCK (db-suite contract):
-- DROP FUNCTION IF EXISTS public.fn_approvals_supersede_sweep();
