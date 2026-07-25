-- Outbox internal-signal exclusion (2026-07-25 suite-triage root cause).
--
-- enqueue_outbox_on_approve enqueued EVERY approved approval. hook_escalation
-- is an IN-SYSTEM signal (std-13 confidence escalation): its effect is the
-- decision itself (the wave monitor / revision round consumes it) and the
-- executor has no handler for it BY DESIGN (Phase-11 LOCKED — no outward
-- handlers before then). Result: every approved escalation became an
-- eternally-'ready' outbox row; 51 accumulated on 2026-07-18 and blocked the
-- phase4 suite guard + the r24 staging runner.
--
-- Registered adaptation: the outbox is the OUTWARD side-effect queue only;
-- internal-signal action types never enter it. List kept minimal and explicit.

CREATE OR REPLACE FUNCTION enqueue_outbox_on_approve() RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending'
     AND NEW.action_type NOT IN ('hook_escalation') THEN
    INSERT INTO outbox (approval_id, idempotency_key)
    VALUES (NEW.id, NEW.action_type || ':' || NEW.id::text);
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

-- Close out the 51 stuck wave-era rows honestly: execution never happened and
-- never can (no handler by design) — 'failed' with the reason on record.
-- The suite guard and the runner only look at ready/executing.
WITH closed AS (
  UPDATE outbox o
     SET status = 'failed',
         last_error = 'internal-signal action enqueued by pre-20260725 trigger; '
                      'no executor handler by design (Phase-11 LOCKED); '
                      'closed out 2026-07-25 suite triage'
    FROM approvals a
   WHERE a.id = o.approval_id
     AND a.action_type = 'hook_escalation'
     AND o.status IN ('ready', 'executing')
  RETURNING o.id
)
INSERT INTO audit_log (actor, actor_type, action, payload)
SELECT 'system:migration', 'system', 'outbox.internal_signal_closeout',
       jsonb_build_object(
         'migration', '20260725004000',
         'closed_rows', count(*),
         'action_type', 'hook_escalation',
         'reason', 'no executor handler by design; trigger now excludes internal signals'
       )
  FROM closed
HAVING count(*) > 0;
