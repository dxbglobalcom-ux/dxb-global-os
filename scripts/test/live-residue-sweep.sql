-- Live-DB test-residue sweep (2026-07-24). The full vitest suite runs against
-- the live DB; suites without complete afterAll hygiene (e8 log-decision,
-- e10 escalation class) leak probe rows onto CEO surfaces. Run this AFTER a
-- full-suite run, with the run window start as :win (Berlin-naive UTC ts),
-- until per-suite hygiene lands. Audited: one records.purge row per sweep.
-- Usage:
--   docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres \
--     -v win="'2026-07-24 21:35:00+00'" -f - < scripts/test/live-residue-sweep.sql
BEGIN;

-- 1) probe tasks by fixture shape (terminal or parked); return then delete
CREATE TEMP TABLE _pt ON COMMIT DROP AS
  SELECT id FROM tasks
  WHERE objective LIKE '%water bottle%'
     OR objective LIKE 'E8.2 probe task%'
     OR objective LIKE 'Re-analyze approval %'
     OR department LIKE 'orch-qa%';
UPDATE tasks SET status='returned', updated_at=now()
  WHERE id IN (SELECT id FROM _pt) AND status IN ('review','awaiting_approval','claimed','running');

-- 2) their approval chain, runs, events (door order)
DELETE FROM outbox WHERE approval_id IN (SELECT id FROM approvals WHERE task_id IN (SELECT id FROM _pt));
UPDATE decision_log SET approval_id=NULL WHERE approval_id IN (SELECT id FROM approvals WHERE task_id IN (SELECT id FROM _pt));
DELETE FROM approvals WHERE task_id IN (SELECT id FROM _pt);
DELETE FROM alerts WHERE task_id IN (SELECT id FROM _pt)
   OR run_id IN (SELECT id FROM agent_runs WHERE task_id IN (SELECT id FROM _pt));
DELETE FROM tool_calls WHERE run_id IN (SELECT id FROM agent_runs WHERE task_id IN (SELECT id FROM _pt));
DELETE FROM hook_violations WHERE run_id IN (SELECT id FROM agent_runs WHERE task_id IN (SELECT id FROM _pt));
DELETE FROM file_changes WHERE run_id IN (SELECT id FROM agent_runs WHERE task_id IN (SELECT id FROM _pt));
DELETE FROM cost_ledger WHERE task_id IN (SELECT id FROM _pt);
DELETE FROM task_events WHERE task_id IN (SELECT id FROM _pt);
DELETE FROM task_dependencies WHERE task_id IN (SELECT id FROM _pt) OR depends_on IN (SELECT id FROM _pt);
DELETE FROM agent_runs WHERE task_id IN (SELECT id FROM _pt);
UPDATE tasks SET parent_task_id=NULL WHERE parent_task_id IN (SELECT id FROM _pt);
CREATE TEMP TABLE _pt_n ON COMMIT DROP AS SELECT count(*) AS n FROM _pt;
DELETE FROM tasks WHERE id IN (SELECT id FROM _pt);

-- 3) run-less hook violations from the window (hook tests write without runs)
CREATE TEMP TABLE _hv ON COMMIT DROP AS
  SELECT id FROM hook_violations WHERE created_at >= :win::timestamptz AND run_id IS NULL;
DELETE FROM alerts WHERE source='hook' AND resolved_at IS NULL
  AND (source_ref->>'id')::bigint IN (SELECT id FROM _hv);
DELETE FROM hook_violations WHERE id IN (SELECT id FROM _hv);

-- 4) machine decision rows from the window (CEO rows never touched)
CREATE TEMP TABLE _dl ON COMMIT DROP AS
  SELECT id FROM decision_log WHERE created_at >= :win::timestamptz AND decided_by <> 'ceo';
DELETE FROM decision_log WHERE id IN (SELECT id FROM _dl);

-- 5) zombie runs born in the window (running, no task)
CREATE TEMP TABLE _zr ON COMMIT DROP AS
  SELECT id FROM agent_runs WHERE status='running' AND task_id IS NULL AND started_at >= :win::timestamptz;
DELETE FROM hook_violations WHERE run_id IN (SELECT id FROM _zr);
DELETE FROM alerts WHERE run_id IN (SELECT id FROM _zr);
UPDATE agent_runs SET status='failed', ended_at=now(),
  error='stale zombie run: created by a live-DB test suite; owning process ended without closing the run; swept by live-residue-sweep'
  WHERE id IN (SELECT id FROM _zr);

-- 6) remaining window alerts that reference now-gone sources (hook/test class)
DELETE FROM alerts WHERE resolved_at IS NULL AND at >= :win::timestamptz
  AND source IN ('hook')
  AND NOT EXISTS (SELECT 1 FROM hook_violations h WHERE h.id::text = alerts.source_ref->>'id');

INSERT INTO audit_log (actor, actor_type, action, payload)
VALUES ('ceo','ceo','records.purge', jsonb_build_object(
  'entity','test-residue',
  'probe_tasks',(SELECT n FROM _pt_n),
  'hook_violations',(SELECT count(*) FROM _hv),
  'decision_log',(SELECT count(*) FROM _dl),
  'zombie_runs_closed',(SELECT count(*) FROM _zr),
  'rationale','live-residue-sweep after a full vitest run against the live DB (window start bound to :win); per-suite afterAll hygiene is the tracked fix'));
COMMIT;

SELECT 'awaiting' k, count(*) FROM tasks WHERE status='awaiting_approval'
UNION ALL SELECT 'pending', count(*) FROM approvals WHERE status='pending'
UNION ALL SELECT 'unresolved alerts', count(*) FROM alerts WHERE resolved_at IS NULL
UNION ALL SELECT 'running runs', count(*) FROM agent_runs WHERE status='running';
