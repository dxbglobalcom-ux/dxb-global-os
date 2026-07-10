-- approval_decision_write_path: the dashboard's ONLY write seam for 08-03
-- (GATE-03). ⛔ RLS/write-path change: Fable-only.
--
-- Design: one SECURITY DEFINER function instead of UPDATE/INSERT grants to
-- authenticated. Rationale: trg_outbox_enqueue (0003) inserts into outbox on
-- approval, and 0014 deliberately excluded outbox from the cockpit surface —
-- broad grants would reopen it. The function is the single controlled door:
-- EXECUTE only for authenticated, body enforces pending-only + all-or-nothing,
-- 0003's guard triggers still police the state machine underneath.
-- Atomicity: one RPC = one transaction; any RAISE rolls back everything.

CREATE OR REPLACE FUNCTION decide_approvals(
  p_ids uuid[],
  p_decision text,
  p_note text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

REVOKE ALL ON FUNCTION decide_approvals(uuid[], text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION decide_approvals(uuid[], text, text) FROM anon;
GRANT EXECUTE ON FUNCTION decide_approvals(uuid[], text, text) TO authenticated;
