-- Ledger C5 trigger leg (measured 2026-07-19; live orphans re-measured
-- 2026-07-24: 6 tasks stuck in awaiting_approval after their approvals were
-- decided and later purged — CEO saw "Awaiting approval 6" against
-- "Pending approvals 0"). decide_approvals now closes the loop: the linked
-- task leaves awaiting_approval with the decision — approved ships the result
-- (done), rejected sends it back for rework (returned, the 2026-07-19
-- stale-gate convention). A task some other lane already moved is untouched.
CREATE OR REPLACE FUNCTION public.decide_approvals(p_ids uuid[], p_decision text, p_note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_row approvals%ROWTYPE;
  v_requested int;
  v_decided int := 0;
BEGIN
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'invalid decision: %', p_decision;
  END IF;
  v_requested := coalesce(array_length(p_ids, 1), 0);
  IF v_requested = 0 THEN
    RAISE EXCEPTION 'empty approval id set';
  END IF;

  FOR v_row IN
    SELECT * FROM approvals WHERE id = ANY (p_ids) FOR UPDATE
  LOOP
    IF v_row.status <> 'pending' THEN
      RAISE EXCEPTION 'approval % is %, not pending — batch aborted', v_row.id, v_row.status;
    END IF;

    UPDATE approvals
       SET status = p_decision,
           decided_by = 'ceo',
           decided_at = now(),
           decision_note = p_note
     WHERE id = v_row.id;

    IF v_row.task_id IS NOT NULL THEN
      UPDATE tasks
         SET status = CASE WHEN p_decision = 'approved' THEN 'done' ELSE 'returned' END,
             updated_at = now()
       WHERE id = v_row.task_id
         AND status = 'awaiting_approval';
    END IF;

    INSERT INTO audit_log (actor, actor_type, action, task_id, payload)
    VALUES (
      'ceo', 'ceo', 'approval.decision', v_row.task_id,
      jsonb_build_object(
        'approval_id', v_row.id,
        'decision', p_decision,
        'action_type', v_row.action_type,
        'payload_hash', md5(v_row.payload::text),
        'note', p_note
      )
    );

    v_decided := v_decided + 1;
  END LOOP;

  IF v_decided <> v_requested THEN
    RAISE EXCEPTION 'decided % of % — unknown or duplicate ids in batch', v_decided, v_requested;
  END IF;

  RETURN jsonb_build_object('decided', v_decided, 'decision', p_decision);
END;
$function$;
