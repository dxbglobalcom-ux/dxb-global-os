-- ============================================================================
-- E8.4 — Audit surface (AUDIT_AND_LOGGING_SPEC §7/§8/§9, roadmap E8.4)
--
-- 1. routing_rules read policy (family table read class — every other
--    detail_ref family is already authenticated-read; security_invoker views
--    need it to resolve routing refs).
-- 2. v_audit_trail — audit_log ⋈ detail_ref resolved in ONE query (§8).
--    Resolves BOTH detail_ref shapes: canonical §4 {"table":…,"id":…} and the
--    legacy writer shape {"<table>_id": N} (E6.1/E6.5/E7.1 fns — registered
--    adaptation, ticket 20260713-e84-audit-surface: audit_log is append-only,
--    old rows are never rewritten; the view normalizes instead).
-- 3. v_decision_log — Decision Logs tab feed: 8 directive columns (10.2)
--    verbatim + run→employee/task context for drill.
-- 4. control_audit_mark_reviewed — THE single audit-family mutation (§8,
--    API_CONTRACTS row `audit`): file_changes.review_status via fn only.
--    reviewed_flagged → alert.raised on `alerts` channel (§9 — the only
--    broadcast a log write may produce). Writes CANONICAL detail_ref shape.
-- ============================================================================

BEGIN;

-- ── 1. routing_rules read policy ────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY routing_rules_ceo_read ON public.routing_rules
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- RLS policy alone is not enough — the table-level grant is the first gate
-- (security_invoker views fail whole-query without it).
GRANT SELECT ON public.routing_rules TO authenticated;
REVOKE ALL ON public.routing_rules FROM anon;

-- ── 2. v_audit_trail ────────────────────────────────────────────────────────
-- ref_table/ref_id normalized from either detail_ref shape; ref_summary is a
-- compact projection of the family record (SUMMARY not content — §16: no
-- prompt bodies, no full diffs); ref_risk surfaces decision risk for the §7
-- risk filter. security_invoker: base-table ceo_read RLS stays authoritative.
DROP VIEW IF EXISTS public.v_audit_trail;
CREATE VIEW public.v_audit_trail
WITH (security_invoker = true) AS
WITH base AS (
  SELECT
    a.id, a.actor, a.actor_type, a.action, a.task_id, a.payload, a.created_at,
    CASE
      WHEN a.detail_ref ? 'table'                  THEN a.detail_ref->>'table'
      WHEN a.detail_ref ? 'settings_change_log_id' THEN 'settings_change_log'
      WHEN a.detail_ref ? 'routing_rule_id'        THEN 'routing_rules'
      WHEN a.detail_ref ? 'revenue_ledger_id'      THEN 'revenue_ledger'
      WHEN a.detail_ref ? 'library_change_log_id'  THEN 'library_change_log'
      WHEN a.detail_ref ? 'decision_log_id'        THEN 'decision_log'
      WHEN a.detail_ref ? 'file_change_id'         THEN 'file_changes'
    END AS ref_table,
    COALESCE(
      a.detail_ref->>'id',
      a.detail_ref->>'settings_change_log_id',
      a.detail_ref->>'routing_rule_id',
      a.detail_ref->>'revenue_ledger_id',
      a.detail_ref->>'library_change_log_id',
      a.detail_ref->>'decision_log_id',
      a.detail_ref->>'file_change_id'
    ) AS ref_id
  FROM audit_log a
)
SELECT
  b.*,
  CASE
    WHEN b.ref_table = 'decision_log' AND b.ref_id ~ '^[0-9]+$' THEN
      (SELECT jsonb_build_object(
         'decided_by', d.decided_by, 'decision', left(d.decision, 300),
         'rationale', left(d.rationale, 300), 'risk', d.risk,
         'confidence', d.confidence, 'outcome', d.outcome,
         'run_id', d.run_id, 'approval_id', d.approval_id)
       FROM decision_log d WHERE d.id = b.ref_id::bigint)
    WHEN b.ref_table = 'settings_change_log' AND b.ref_id ~ '^[0-9]+$' THEN
      (SELECT jsonb_build_object(
         'key', s.key, 'scope', s.scope, 'old_value', s.old_value,
         'new_value', s.new_value, 'changed_by', s.changed_by,
         'change_source', s.change_source, 'undo_of', s.undo_of)
       FROM settings_change_log s WHERE s.id = b.ref_id::bigint)
    WHEN b.ref_table = 'library_change_log' AND b.ref_id ~ '^[0-9]+$' THEN
      (SELECT jsonb_build_object(
         'item_id', l.item_id, 'changed_by', l.changed_by,
         'change', l.change, 'changed_at', l.changed_at)
       FROM library_change_log l WHERE l.id = b.ref_id::bigint)
    WHEN b.ref_table = 'file_changes' AND b.ref_id ~ '^[0-9]+$' THEN
      (SELECT jsonb_build_object(
         'path', f.path, 'op', f.op, 'diff_summary', left(f.diff_summary, 300),
         'commit_sha', f.commit_sha, 'review_status', f.review_status,
         'reverted_by', f.reverted_by, 'run_id', f.run_id)
       FROM file_changes f WHERE f.id = b.ref_id::bigint)
    WHEN b.ref_table = 'routing_rules' THEN
      (SELECT jsonb_build_object(
         'role_slot', r.role_slot, 'model_id', r.model_id,
         'department_id', r.department_id, 'priority', r.priority,
         'enabled', r.enabled, 'updated_at', r.updated_at)
       FROM routing_rules r WHERE r.id::text = b.ref_id)
    WHEN b.ref_table = 'revenue_ledger' THEN
      (SELECT jsonb_build_object(
         'occurred_on', v.occurred_on, 'engine', v.engine,
         'department', v.department, 'client', v.client,
         'amount_eur', v.amount_eur, 'source', v.source)
       FROM revenue_ledger v WHERE v.id::text = b.ref_id)
  END AS ref_summary,
  CASE
    WHEN b.ref_table = 'decision_log' AND b.ref_id ~ '^[0-9]+$' THEN
      (SELECT d.risk FROM decision_log d WHERE d.id = b.ref_id::bigint)
  END AS ref_risk
FROM base b;

GRANT SELECT ON public.v_audit_trail TO authenticated;
REVOKE ALL ON public.v_audit_trail FROM anon;

-- ── 3. v_decision_log ───────────────────────────────────────────────────────
-- The 8 directive fields (10.2) verbatim + run context (employee slug, task
-- objective) so the tab answers "who/why/what data/alternatives/confidence/
-- risk/approval/outcome" without a second query.
DROP VIEW IF EXISTS public.v_decision_log;
CREATE VIEW public.v_decision_log
WITH (security_invoker = true) AS
SELECT
  d.id, d.decided_by, d.decision, d.rationale, d.data_used, d.alternatives,
  d.confidence, d.risk, d.approval_id, d.outcome, d.created_at,
  d.run_id, r.task_id, ag.slug AS employee, t.objective AS task_objective
FROM decision_log d
LEFT JOIN agent_runs r ON r.id = d.run_id
LEFT JOIN agents ag    ON ag.id = r.employee_id
LEFT JOIN tasks t      ON t.id = r.task_id;

GRANT SELECT ON public.v_decision_log TO authenticated;
REVOKE ALL ON public.v_decision_log FROM anon;

-- ── 4. control_audit_mark_reviewed ──────────────────────────────────────────
-- Payload: {"file_change_id": N, "status": "reviewed_ok"|"reviewed_flagged",
--           "note": "..."} (note optional, summary-class text — §16).
-- Actor wall mirrors fn_update_routing: ceo (jwt) or system (service_role).
CREATE OR REPLACE FUNCTION public.control_audit_mark_reviewed(
  p_payload         jsonb,
  p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor    text;
  v_digest   text;
  v_prev     record;
  v_id       bigint;
  v_status   text;
  v_note     text;
  v_fc       record;
  v_corr     record;
  v_audit_id bigint;
  v_resp     jsonb;
BEGIN
  v_actor := CASE
    WHEN auth.uid() IS NOT NULL THEN 'ceo'
    WHEN current_user IN ('service_role', 'postgres') THEN 'system'
  END;
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;

  v_digest := md5('mark_reviewed|' || p_payload::text);
  SELECT request_digest, response INTO v_prev
    FROM control_idempotency WHERE key = p_idempotency_key;
  IF FOUND THEN
    IF v_prev.request_digest <> v_digest THEN
      RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
    END IF;
    RETURN v_prev.response;
  END IF;

  v_id     := (p_payload->>'file_change_id')::bigint;
  v_status := p_payload->>'status';
  v_note   := left(p_payload->>'note', 500);
  IF v_id IS NULL OR v_status NOT IN ('reviewed_ok', 'reviewed_flagged') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'file_change_id + status(reviewed_ok|reviewed_flagged) required');
  END IF;

  SELECT id, path, run_id, review_status INTO v_fc
    FROM file_changes WHERE id = v_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'file_change ' || v_id || ' not found');
  END IF;

  UPDATE file_changes SET review_status = v_status WHERE id = v_id;

  -- Canonical §4 detail_ref shape — new writers use it from this row on.
  INSERT INTO audit_log (actor, actor_type, action, payload, detail_ref)
  VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END,
          'audit.mark_reviewed',
          jsonb_build_object('file_change_id', v_id, 'path', v_fc.path,
            'old_status', v_fc.review_status, 'new_status', v_status,
            'note', v_note),
          jsonb_build_object('table', 'file_changes', 'id', v_id))
  RETURNING id INTO v_audit_id;

  -- §9: reviewed_flagged is the ONLY log write that broadcasts — a human
  -- attention call on the alerts channel (E8.4b consumes; envelope §9a).
  IF v_status = 'reviewed_flagged' THEN
    SELECT r.task_id, r.workflow_run_id, t.project_id
      INTO v_corr
      FROM agent_runs r LEFT JOIN tasks t ON t.id = r.task_id
     WHERE r.id = v_fc.run_id;
    PERFORM public.notify_broadcast('alerts', 'alert.raised',
      jsonb_build_object(
        'actor', v_actor,
        'entity', jsonb_build_object('kind', 'alert', 'id', v_id::text),
        'corr', jsonb_build_object(
          'task_id', v_corr.task_id, 'run_id', v_fc.run_id,
          'workflow_run_id', v_corr.workflow_run_id,
          'project_id', v_corr.project_id),
        'payload', jsonb_build_object(
          'source', 'file_review', 'path', v_fc.path,
          'review_status', v_status, 'note', v_note,
          'audit_id', v_audit_id)));
  END IF;

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit_id,
    'review_status', v_status);
  INSERT INTO control_idempotency (key, request_digest, response)
  VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

REVOKE ALL ON FUNCTION public.control_audit_mark_reviewed(jsonb, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.control_audit_mark_reviewed(jsonb, text)
  TO authenticated, service_role;

COMMIT;

-- ROLLBACK PLAN:
--   DROP FUNCTION IF EXISTS public.control_audit_mark_reviewed(jsonb, text);
--   DROP VIEW IF EXISTS public.v_decision_log;
--   DROP VIEW IF EXISTS public.v_audit_trail;
--   DROP POLICY IF EXISTS routing_rules_ceo_read ON public.routing_rules;
-- Log families live independently; no data is created or destroyed beyond
-- audit rows (append-only, kept).
