-- R2.1 — resident worker loop (external audit F-01): pgboss plumbing for the
-- business-task drain chain. Idempotent (2x safe).
--
-- 1) task.worker queue row seeded so the chain exists pre-boot (hr A4 / R1.3
--    precedent: migrations own the seed, boss.createQueue upserts nothing on
--    conflict).
-- 2) MEASURED DEFECT FIX: every self-chained queue was born policy='standard',
--    but pg-boss 12 enforces singletonKey dedup ONLY under policy='short'
--    (unique index job_common_i1: state='created' AND policy='short').
--    Standard policy silently accepted every bootstrap send, so each scheduler
--    boot minted one MORE parallel chain (measured live 2026-07-17: 29
--    stranded 'created' intent-intake jobs after test + boot cycles).
--    'short' = at most ONE queued job, unlimited active — exactly the chain
--    contract: a pending tick dedupes; an orphaned active job (process died
--    mid-drain) never blocks the re-arm, so restart continuity holds.
-- 3) Purge stranded 'created' chain ticks accumulated under the standard
--    policy — payload-less self-ticks; the boot bootstrap re-arms each chain.

INSERT INTO pgboss.queue (name, policy, retry_limit, retry_delay, retry_backoff,
                          expire_seconds, retention_seconds, deletion_seconds,
                          warning_queued, partition, table_name)
VALUES ('task.worker', 'short', 2, 0, false, 900, 1209600, 604800, 0, false, 'job_common')
ON CONFLICT (name) DO NOTHING;

UPDATE pgboss.queue
   SET policy = 'short', updated_on = now()
 WHERE name IN ('outbox-tick', 'intent-intake', 'workflow.run',
                'library.profile_recompile', 'task.worker')
   AND policy <> 'short';

DELETE FROM pgboss.job
 WHERE name IN ('outbox-tick', 'intent-intake', 'workflow.run',
                'library.profile_recompile', 'task.worker')
   AND state = 'created';
