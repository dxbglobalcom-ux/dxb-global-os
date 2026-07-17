-- R1.3b — pg-boss revenue cycle queues + schedules (REVENUE_ENGINE_SPEC §22 /
-- 0028e; hr A4 precedent: rows seeded idempotently so the spec §24.3 query
-- answers pre-boot; scheduler boss.schedule() upserts the same names).
-- Stagger: spec window 05:00-06:00 UTC, off the exact hours owned by
-- hr.stale_persona_scan (05:00) and hr.probation_check (06:00).

INSERT INTO pgboss.queue
SELECT (jsonb_populate_record(t, jsonb_build_object('name', v.q, 'created_on', now(), 'updated_on', now()))).*
  FROM (SELECT q FROM pgboss.queue q WHERE q.name = 'lease-reaper') AS tmpl(t),
       (VALUES ('revenue.scan'), ('revenue.score'),
               ('revenue.brief'), ('revenue.rollup')) AS v(q)
 WHERE NOT EXISTS (SELECT 1 FROM pgboss.queue x WHERE x.name = v.q);

INSERT INTO pgboss.schedule (name, key, cron, timezone)
SELECT v.n, '', v.c, 'UTC'
  FROM (VALUES ('revenue.scan',   '10 5 * * *'),
               ('revenue.score',  '25 5 * * *'),
               ('revenue.brief',  '40 5 * * *'),
               ('revenue.rollup', '55 5 * * *')) AS v(n, c)
 WHERE NOT EXISTS (SELECT 1 FROM pgboss.schedule s WHERE s.name = v.n);

-- ROLLBACK:
-- DELETE FROM pgboss.schedule WHERE name LIKE 'revenue.%';
-- DELETE FROM pgboss.queue WHERE name LIKE 'revenue.%';
