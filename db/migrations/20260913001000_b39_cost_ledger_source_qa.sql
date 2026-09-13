-- B39 — THE QA JUDGE'S RECEIPT (CEO 2026-09-13, "düzelt").
--
-- Measured 2026-09-13 in the company's own book (SELECT only): the night of
-- 2026-09-05 holds 23 cost_ledger rows, all source='worker' — the seats' runs.
-- The QA gate judged all eight tasks of DXB-V-EYW-005 (one model call each,
-- routing row 'final-approval': Opus 5 at effort max, 29 s on the critical path
-- twice) and wrote nothing: the column's CHECK knew only the proxy ('litellm'),
-- a hook, a human and a worker. The judge now writes 'qa' (orchestrator/qa.ts →
-- recordSubscriptionSpend); the hourly window and the lane count's `spent`
-- read it as the company's own spend; the lane count's average stays on the
-- seats' runs (a gate call is a fraction of a run).
--
-- Self-contained: the constraint is recreated by name; nothing else on the table
-- moves. Rollback: the same statement with 'qa' removed — after deleting any
-- 'qa' rows, which only the judge writes.
ALTER TABLE cost_ledger DROP CONSTRAINT IF EXISTS cost_ledger_source_check;
ALTER TABLE cost_ledger
  ADD CONSTRAINT cost_ledger_source_check
  CHECK (source = ANY (ARRAY['litellm'::text, 'hook'::text, 'manual'::text, 'worker'::text, 'qa'::text]));
