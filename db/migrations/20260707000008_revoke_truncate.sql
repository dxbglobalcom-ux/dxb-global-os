-- 0008 — revoke TRUNCATE on append-only evidence tables.
-- ⛔ FABLE-ONLY decision (recorded here; carried from the 03-02 SUMMARY security
-- note): task_events, audit_log and cost_ledger are the OS's evidence chain.
-- DELETE/UPDATE are already denied to API paths by RLS + append-only policies;
-- TRUNCATE bypasses row-level policies entirely, so it must be revoked from
-- every role reachable through an API path. The postgres superuser retains it
-- as the sole operational escape — superuser-only access is itself the audit
-- boundary.
REVOKE TRUNCATE ON task_events, audit_log, cost_ledger
  FROM PUBLIC, anon, authenticated, service_role;
