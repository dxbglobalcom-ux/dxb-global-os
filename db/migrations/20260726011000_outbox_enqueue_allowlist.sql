-- Outbox enqueue becomes an ALLOWLIST (2026-07-26 stabilization audit).
--
-- The 20260725004000 fix was a DENYLIST: it named hook_escalation and stayed
-- silent about every future action type nobody wrote a handler for. The next
-- one arrived within a day: the CEO approved discovery_engine.scheduler_disable
-- (approval 1d6e7a30, 11:05 local) — a CEO-domain settings outcome that ALREADY
-- held as data (revenue.discovery.auto = false) and that the system writer is
-- FORBIDDEN to write through the settings door (spec §26 whitelist) — so its
-- outbox row spun ready→rollback every 15 seconds with attempts pinned at 0,
-- invisible to the attempts>=3 alert path, and poisoned the phase4/r24 suite
-- guards.
--
-- Registered adaptation: the outbox is the OUTWARD side-effect queue; a row may
-- only be born for an action type the executor actually carries. The allowlist
-- mirrors packages/outbox-executor/src/actions/index.ts, and adding a handler
-- means adding its name here in the same change —
-- tests/c9/outbox-enqueue-allowlist.test.ts holds the pair together. An
-- approved action outside the list leaves an audit trace instead of a poison
-- row: silence is not an option, but neither is an unexecutable queue entry.
-- The executor's own unknown-type loud-throw (phase4 toctou contract) stays as
-- defense in depth for rows that predate this trigger.

CREATE OR REPLACE FUNCTION enqueue_outbox_on_approve() RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    IF NEW.action_type IN ('test.write_file', 'email.send.staging') THEN
      INSERT INTO outbox (approval_id, idempotency_key)
      VALUES (NEW.id, NEW.action_type || ':' || NEW.id::text);
    ELSE
      INSERT INTO audit_log (actor, actor_type, action, payload)
      VALUES ('system:outbox', 'system', 'outbox.enqueue_skipped_no_handler',
              jsonb_build_object(
                'approval_id', NEW.id,
                'action_type', NEW.action_type,
                'reason', 'no executor handler registered; the outward queue refuses what it cannot execute'));
    END IF;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

-- Close out the stuck discovery row honestly: execution never happened and
-- never can (the system writer may not touch a CEO policy key), and the
-- approved OUTCOME already holds as data — revenue.discovery.auto = false,
-- set on 2026-07-26 before the approval was even decided. 'failed' with the
-- reason on record; the suite guards only look at ready/executing.
WITH closed AS (
  UPDATE outbox o
     SET status = 'failed',
         last_error = 'no executor handler; settings door forbids the system writer '
                      'on CEO policy keys (spec §26); approved outcome already live '
                      '(revenue.discovery.auto=false) — closed out 2026-07-26 '
                      'stabilization audit'
    FROM approvals a
   WHERE a.id = o.approval_id
     AND a.action_type = 'discovery_engine.scheduler_disable'
     AND o.status IN ('ready', 'executing')
  RETURNING o.id
)
INSERT INTO audit_log (actor, actor_type, action, payload)
SELECT 'system:migration', 'system', 'outbox.no_handler_closeout',
       jsonb_build_object(
         'migration', '20260726011000',
         'closed_rows', count(*),
         'action_type', 'discovery_engine.scheduler_disable',
         'reason', 'outcome already live as revenue.discovery.auto=false; '
                   'trigger now allowlists executable action types only'
       )
  FROM closed
HAVING count(*) > 0;
