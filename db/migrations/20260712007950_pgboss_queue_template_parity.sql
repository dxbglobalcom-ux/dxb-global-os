-- 20260712007950_pgboss_queue_template_parity.sql — R2.5 gap migration (F-08)
-- WHY: 20260712008000 (hr factory) and 20260717030100 (revenue schedules)
-- create their pg-boss queues by CLONING the 'lease-reaper' row as a
-- version-proof template — but lease-reaper itself is RUNTIME-BORN (the
-- resident executor's boot creates it), so a fresh chain has no template and
-- the schedule inserts die on schedule_name_fkey (measured drill break).
-- This file births the template at its true chain position by cloning the one
-- queue row that exists on EVERY environment at this point:
-- '__pgboss__send-it', created by the pg-boss initializer step of
-- scripts/bootstrap-db.sh. Its operational values are identical to
-- lease-reaper's (measured live 2026-07-17: standard/2/0/f/900/1209600/604800).
-- On live the NOT EXISTS guard makes this a no-op. Counters start at zero.

BEGIN;

INSERT INTO pgboss.queue
SELECT (jsonb_populate_record(t, jsonb_build_object(
          'name', 'lease-reaper',
          'created_on', now(), 'updated_on', now(),
          'deferred_count', 0, 'queued_count', 0, 'ready_count', 0,
          'warning_queued', 0, 'active_count', 0, 'failed_count', 0,
          'total_count', 0))).*
  FROM (SELECT q FROM pgboss.queue q WHERE q.name = '__pgboss__send-it') AS tmpl(t)
 WHERE NOT EXISTS (SELECT 1 FROM pgboss.queue x WHERE x.name = 'lease-reaper');

COMMIT;

-- ROLLBACK: DELETE FROM pgboss.queue WHERE name='lease-reaper' AND total_count=0;
