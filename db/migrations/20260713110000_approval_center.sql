-- E9.3 Approval Center (APPROVAL_ENGINE_SPEC §4/§6/§9, migration plan §22
-- 0023a-c folded into one file per repo idiom). ⛔ B7b: the existing
-- decision path (decide_approvals 0015) and the outbox enqueue trigger
-- (0003) are UNTOUCHED — this migration only adds nullable columns, the
-- rule table, the 7-action control fn, views, and alert sweeps.
--
-- Registered adaptations (mirrored in APPROVAL_ENGINE_SPEC §4 note):
--   A1 spec's second `risk_class` (money_out|contract|identity|high_cost|
--      other) lands as `operation_class` — the live risk_class column keeps
--      its severity domain (low/medium/high/critical) consumed by the inbox
--      grouping and v_alerts_active.
--   A2 money_out outbox INSERT happens via trg_outbox_enqueue firing INSIDE
--      control_approvals_action's transaction (outbox.approval_id UNIQUE
--      forbids a duplicate INSERT); the grant proof is unchanged — no
--      direct outbox write path exists for authenticated/anon.
--   A3 fn name follows the control seam idiom (control_approvals_action);
--      policy_change_id is bigint (settings_change_log.id type, spec said
--      uuid before the target table existed).

-- ---------------------------------------------------------------------------
-- 0023a — approvals extend (§4, nullable-only: rollback = DROP COLUMN)
-- ---------------------------------------------------------------------------

ALTER TABLE approvals
  ADD COLUMN IF NOT EXISTS requester_employee_id uuid REFERENCES agents(id),
  ADD COLUMN IF NOT EXISTS department_id uuid,
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id),
  ADD COLUMN IF NOT EXISTS operation text,
  ADD COLUMN IF NOT EXISTS purpose text,
  ADD COLUMN IF NOT EXISTS operation_class text
    CHECK (operation_class IN ('money_out','contract','identity','high_cost','other')),
  ADD COLUMN IF NOT EXISTS cost_estimate numeric,
  ADD COLUMN IF NOT EXISTS deadline timestamptz,
  ADD COLUMN IF NOT EXISTS model_to_use text,
  ADD COLUMN IF NOT EXISTS affected_systems text[],
  ADD COLUMN IF NOT EXISTS affected_files text[],
  ADD COLUMN IF NOT EXISTS recommended_action text,
  ADD COLUMN IF NOT EXISTS reasoning_summary text,
  ADD COLUMN IF NOT EXISTS alternatives jsonb,
  ADD COLUMN IF NOT EXISTS previous_reviews jsonb,
  ADD COLUMN IF NOT EXISTS decided_action text
    CHECK (decided_action IN ('approve','reject','approve_with_modifications')),
  ADD COLUMN IF NOT EXISTS modifications jsonb,
  ADD COLUMN IF NOT EXISTS delegated_to uuid REFERENCES agents(id),
  ADD COLUMN IF NOT EXISTS reanalysis_run_id uuid REFERENCES agent_runs(id),
  ADD COLUMN IF NOT EXISTS policy_change_id bigint REFERENCES settings_change_log(id);

-- Classification rule table (§4). Writes go ONLY through
-- control_approvals_action op=change_policy (no table grants below).
CREATE TABLE approval_rules (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_pattern text NOT NULL,          -- 'payment.*' — '*' is a suffix wildcard
  risk_class        text NOT NULL
    CHECK (risk_class IN ('money_out','contract','identity','high_cost','other')),
  gate              text NOT NULL CHECK (gate IN ('autonomous','notify','gated')),
  locked            boolean NOT NULL DEFAULT false,  -- B7b layer 1
  enabled           boolean NOT NULL DEFAULT true,
  priority          int NOT NULL DEFAULT 100,        -- lower wins
  updated_by        text,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- B7b layer 1 enforcement at the DB: locked rows are immutable and
-- undeletable regardless of caller — even the control fn cannot loosen a
-- money-out gate (change_policy rejects earlier with a clean error; this
-- trigger is the backstop).
CREATE OR REPLACE FUNCTION guard_locked_approval_rule() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.locked THEN RAISE EXCEPTION 'approval_rule % is locked (B7b) — delete forbidden', OLD.id; END IF;
    RETURN OLD;
  END IF;
  IF OLD.locked THEN
    RAISE EXCEPTION 'approval_rule % is locked (B7b) — immutable', OLD.id;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_approval_rule_locked
  BEFORE UPDATE OR DELETE ON approval_rules
  FOR EACH ROW EXECUTE FUNCTION guard_locked_approval_rule();

-- Seed: the EXISTING outward gate classes only (madde 4: no new gate class).
-- money_out families mirror the dashboard isMoneyOut prefixes (one source
-- of truth alignment; tests/e9 assert the sets match).
INSERT INTO approval_rules (operation_pattern, risk_class, gate, locked, priority, updated_by) VALUES
  ('payment.*',  'money_out', 'gated', true, 10, 'migration'),
  ('transfer.*', 'money_out', 'gated', true, 10, 'migration'),
  ('ad_spend.*', 'money_out', 'gated', true, 10, 'migration'),
  ('refund.*',   'money_out', 'gated', true, 10, 'migration'),
  ('payout.*',   'money_out', 'gated', true, 10, 'migration'),
  ('contract.*', 'contract',  'gated', true, 20, 'migration'),
  ('identity.*', 'identity',  'gated', true, 20, 'migration'),
  -- routine outward comms: gated today, UNLOCKED — the fatigue loop may
  -- propose autonomy later and the CEO can flip it (ceo-delegation-rule).
  ('email.send', 'other', 'gated', false, 50, 'migration');

ALTER TABLE approval_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY approval_rules_ceo_read ON approval_rules
  FOR SELECT TO authenticated USING (true);
GRANT SELECT ON approval_rules TO authenticated;

-- BROKEN GRANT FIX (found during E9.3 survey): anon/authenticated held
-- TRUNCATE on the B7b tables. Money-out infrastructure is the explicit
-- exception to the security-hardening deferral — revoked now.
REVOKE TRUNCATE ON approvals, outbox FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- 0023b — functions (§6)
-- ---------------------------------------------------------------------------

-- fn_classify_operation: rule scan, priority-ordered, FIRST match wins.
-- Pattern semantics ('*' = suffix wildcard) mirror the dashboard prefix
-- matcher: base 'payment' matches 'payment', 'payment.stripe',
-- 'payment_wise'. NO match → gated/other (fail-closed: an unknown
-- operation can never flow autonomously — madde 4 / §16).
-- p_payload is part of the spec signature; no payload-derived rule exists
-- yet (high_cost thresholds arrive with COST rows) — it is accepted and
-- unused, honestly.
CREATE OR REPLACE FUNCTION fn_classify_operation(p_operation text, p_payload jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_rule approval_rules%ROWTYPE;
  v_base text;
BEGIN
  IF p_operation IS NULL OR btrim(p_operation) = '' THEN
    RETURN jsonb_build_object('gate','gated','risk_class','other','rule_id',NULL);
  END IF;
  FOR v_rule IN
    SELECT * FROM approval_rules WHERE enabled ORDER BY priority, updated_at
  LOOP
    v_base := rtrim(replace(v_rule.operation_pattern, '*', ''), '._');
    IF p_operation = v_base
       OR p_operation LIKE v_base || '.%'
       OR p_operation LIKE v_base || '\_%' THEN
      RETURN jsonb_build_object('gate', v_rule.gate, 'risk_class', v_rule.risk_class,
                                'rule_id', v_rule.id);
    END IF;
  END LOOP;
  RETURN jsonb_build_object('gate','gated','risk_class','other','rule_id',NULL);
END $$;

REVOKE ALL ON FUNCTION fn_classify_operation(text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION fn_classify_operation(text, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION fn_classify_operation(text, jsonb) TO authenticated, service_role;

-- control_approvals_action: the Approval Center's single mutation door
-- (spec fn_decide_approval contract; control seam idiom). 7 CEO actions
-- (R4) + a system lane for reanalysis/info results (§13). One transaction:
-- state + decision_log + audit + (approve) outbox release via 0003 trigger.
-- decide_approvals (0015) stays untouched beside this fn.
CREATE OR REPLACE FUNCTION control_approvals_action(p_payload jsonb, p_idempotency_key text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_actor    text;
  v_digest   text;
  v_prev     record;
  v_op       text;
  v_action   text;
  v_id       uuid;
  v_appr     approvals%ROWTYPE;
  v_note     text;
  v_mods     jsonb;
  v_emp      agents%ROWTYPE;
  v_model    text;
  v_rule     approval_rules%ROWTYPE;
  v_set      jsonb;
  v_change_id bigint;
  v_task_id  uuid;
  v_outbox_id uuid;
  v_review   jsonb;
  v_run_id   uuid;
  v_resp     jsonb;
BEGIN
  v_actor := CASE
    WHEN auth.uid() IS NOT NULL THEN 'ceo'
    WHEN current_user IN ('service_role', 'postgres') THEN 'system'
  END;
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;

  p_payload := jsonb_strip_nulls(p_payload);
  v_digest := md5('approvals|' || p_payload::text);
  SELECT request_digest, response INTO v_prev
    FROM control_idempotency WHERE key = p_idempotency_key;
  IF FOUND THEN
    IF v_prev.request_digest <> v_digest THEN
      RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
    END IF;
    RETURN v_prev.response;
  END IF;

  v_op := p_payload->>'op';
  IF v_op IS NULL OR v_op NOT IN ('decide', 'append_review') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'op(decide|append_review) required');
  END IF;

  -- ---------------- system lane: reanalysis / info result append ----------
  IF v_op = 'append_review' THEN
    v_id := (p_payload->>'approval_id')::uuid;
    v_review := p_payload->'review';
    v_run_id := (p_payload->>'run_id')::uuid;
    IF v_id IS NULL OR v_review IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'approval_id + review required');
    END IF;
    SELECT * INTO v_appr FROM approvals WHERE id = v_id FOR UPDATE;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'approval not found');
    END IF;
    IF v_appr.status <> 'pending' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'approval is ' || v_appr.status || ', not pending');
    END IF;
    UPDATE approvals
       SET previous_reviews = COALESCE(previous_reviews, '[]'::jsonb)
             || jsonb_build_array(v_review || jsonb_build_object('at', now(), 'by', v_actor)),
           reanalysis_run_id = COALESCE(v_run_id, reanalysis_run_id)
     WHERE id = v_id;
    INSERT INTO audit_log (actor, actor_type, action, task_id, payload, detail_ref)
    VALUES (v_actor, v_actor, 'approval.review_appended', v_appr.task_id,
            jsonb_build_object('approval_id', v_id, 'run_id', v_run_id),
            jsonb_build_object('table', 'approvals', 'id', v_id));
    v_resp := jsonb_build_object('ok', true, 'op', 'append_review', 'approval_id', v_id);
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
    RETURN v_resp;
  END IF;

  -- ---------------- decide lane: CEO-only (§13) ---------------------------
  IF v_actor <> 'ceo' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'decisions are CEO-only');
  END IF;

  v_action := p_payload->>'action';
  v_id := (p_payload->>'approval_id')::uuid;
  IF v_action IS NULL OR v_id IS NULL OR v_action NOT IN
     ('approve','reject','approve_with_modifications','delegate',
      'request_info','reanalyze','change_policy') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'action(approve|reject|approve_with_modifications|delegate|request_info|reanalyze|change_policy) + approval_id required');
  END IF;

  SELECT * INTO v_appr FROM approvals WHERE id = v_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'approval ' || v_id || ' not found');
  END IF;
  IF v_appr.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'approval is ' || v_appr.status || ', not pending');
  END IF;

  v_note := left(p_payload->>'note', 2000);

  IF v_action = 'approve' OR v_action = 'approve_with_modifications' THEN
    IF v_action = 'approve_with_modifications' THEN
      v_mods := p_payload->'modifications';
      IF v_mods IS NULL OR jsonb_typeof(v_mods) <> 'object' OR v_mods = '{}'::jsonb THEN
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', 'modifications object required');
      END IF;
    END IF;
    -- A6 (ticket): effective payload = original || modifications; the delta
    -- stays on the row, the original hash goes to audit. One UPDATE so the
    -- 0013 broadcast fires once and the 0003 trigger births the outbox row
    -- inside this transaction (A2).
    UPDATE approvals
       SET payload = CASE WHEN v_mods IS NULL THEN payload ELSE payload || v_mods END,
           modifications = v_mods,
           status = 'approved', decided_by = 'ceo', decided_at = now(),
           decision_note = v_note, decided_action = v_action
     WHERE id = v_id;
    SELECT id INTO v_outbox_id FROM outbox WHERE approval_id = v_id;

  ELSIF v_action = 'reject' THEN
    UPDATE approvals
       SET status = 'rejected', decided_by = 'ceo', decided_at = now(),
           decision_note = v_note, decided_action = 'reject'
     WHERE id = v_id;

  ELSIF v_action = 'delegate' THEN
    -- §26: single level — a delegated approval cannot be re-delegated.
    IF v_appr.delegated_to IS NOT NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'already delegated — single-level delegation (spec §26)');
    END IF;
    SELECT * INTO v_emp FROM agents WHERE id = (p_payload->>'employee_id')::uuid;
    IF NOT FOUND OR v_emp.employment_status = 'archived' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'employee_id must reference a non-archived employee');
    END IF;
    -- The delegate ANALYZES; the decision stays with the CEO (§13):
    -- approval stays pending, an analysis task goes to the employee.
    INSERT INTO tasks (department, agent_id, objective, output_contract,
                       model_tier, approval_class, budget_max_tokens,
                       budget_max_cost_eur, priority, status)
    VALUES (v_emp.department, v_emp.id,
            'Analyze approval ' || v_id || ' (' ||
            COALESCE(v_appr.operation, v_appr.action_type) ||
            ') and report a recommendation.' ||
            COALESCE(' CEO note: ' || v_note, ''),
            'analysis-report-v1', 'L2', 'none', 100000, 1, 3, 'queued')
    RETURNING id INTO v_task_id;
    UPDATE approvals
       SET delegated_to = v_emp.id,
           previous_reviews = COALESCE(previous_reviews, '[]'::jsonb)
             || jsonb_build_array(jsonb_build_object(
                  'type', 'delegation', 'to', v_emp.slug,
                  'task_id', v_task_id, 'note', v_note, 'at', now()))
     WHERE id = v_id;

  ELSIF v_action = 'request_info' THEN
    IF v_appr.requester_employee_id IS NOT NULL THEN
      SELECT * INTO v_emp FROM agents WHERE id = v_appr.requester_employee_id;
      INSERT INTO tasks (department, agent_id, objective, output_contract,
                         model_tier, approval_class, budget_max_tokens,
                         budget_max_cost_eur, priority, status)
      VALUES (v_emp.department, v_emp.id,
              'Provide additional information for approval ' || v_id ||
              COALESCE(': ' || v_note, '.'),
              'analysis-report-v1', 'L2', 'none', 100000, 1, 3, 'queued')
      RETURNING id INTO v_task_id;
    END IF;
    UPDATE approvals
       SET previous_reviews = COALESCE(previous_reviews, '[]'::jsonb)
             || jsonb_build_array(jsonb_build_object(
                  'type', 'info_request', 'note', v_note,
                  'task_id', v_task_id, 'at', now()))
     WHERE id = v_id;

  ELSIF v_action = 'reanalyze' THEN
    v_model := p_payload->>'model_id';
    IF v_model IS NOT NULL THEN
      PERFORM 1 FROM model_catalog WHERE id = v_model AND banned = false AND status = 'active';
      IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', 'model_id must be an active, non-banned catalog model');
      END IF;
    END IF;
    INSERT INTO tasks (department, agent_id, objective, output_contract,
                       model_tier, approval_class, budget_max_tokens,
                       budget_max_cost_eur, priority, status)
    VALUES (COALESCE((SELECT department FROM agents WHERE id = v_appr.requester_employee_id), 'holding'),
            v_appr.requester_employee_id,
            'Re-analyze approval ' || v_id || ' (' ||
            COALESCE(v_appr.operation, v_appr.action_type) || ')' ||
            COALESCE(' with model ' || v_model, '') ||
            COALESCE('. CEO note: ' || v_note, '.'),
            'analysis-report-v1', 'L3', 'none', 200000, 2, 2, 'queued')
    RETURNING id INTO v_task_id;
    UPDATE approvals
       SET previous_reviews = COALESCE(previous_reviews, '[]'::jsonb)
             || jsonb_build_array(jsonb_build_object(
                  'type', 'reanalysis_requested', 'model', v_model,
                  'task_id', v_task_id, 'note', v_note, 'at', now()))
     WHERE id = v_id;

  ELSIF v_action = 'change_policy' THEN
    SELECT * INTO v_rule FROM approval_rules
     WHERE id = (p_payload->>'rule_id')::uuid FOR UPDATE;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'rule_id not found');
    END IF;
    IF v_rule.locked THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'rule is locked (B7b) — money-out class gates cannot be loosened');
    END IF;
    v_set := p_payload->'set';
    IF v_set IS NULL OR jsonb_typeof(v_set) <> 'object'
       OR NOT (v_set ?| ARRAY['gate','enabled','priority']) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'set{gate|enabled|priority} required');
    END IF;
    IF v_set ? 'gate' AND v_set->>'gate' NOT IN ('autonomous','notify','gated') THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'gate must be autonomous|notify|gated');
    END IF;
    INSERT INTO settings_change_log (key, scope, old_value, new_value, changed_by, change_source)
    VALUES ('approval_rules.' || v_rule.operation_pattern, 'approval_rules',
            jsonb_build_object('gate', v_rule.gate, 'enabled', v_rule.enabled, 'priority', v_rule.priority),
            jsonb_build_object(
              'gate', COALESCE(v_set->>'gate', v_rule.gate),
              'enabled', COALESCE((v_set->>'enabled')::boolean, v_rule.enabled),
              'priority', COALESCE((v_set->>'priority')::int, v_rule.priority)),
            'ceo', 'ui')   -- change_source domain: ui|api|system|undo; the Center is the CEO's UI
    RETURNING id INTO v_change_id;
    UPDATE approval_rules
       SET gate = COALESCE(v_set->>'gate', gate),
           enabled = COALESCE((v_set->>'enabled')::boolean, enabled),
           priority = COALESCE((v_set->>'priority')::int, priority),
           updated_by = 'ceo', updated_at = now()
     WHERE id = v_rule.id;
    UPDATE approvals SET policy_change_id = v_change_id WHERE id = v_id;
  END IF;

  -- R7: every decision action lands in decision_log (rationale = CEO action
  -- + note; institutional memory even for non-terminal actions).
  INSERT INTO decision_log (decided_by, decision, rationale, alternatives, risk, approval_id)
  VALUES ('ceo', v_action,
          COALESCE(v_note, 'CEO action ' || v_action || ' on approval ' || v_id),
          v_appr.alternatives, v_appr.risk_class, v_id);

  INSERT INTO audit_log (actor, actor_type, action, task_id, payload, detail_ref)
  VALUES ('ceo', 'ceo', 'approval.' || v_action, v_appr.task_id,
          jsonb_build_object(
            'approval_id', v_id, 'action', v_action,
            'action_type', v_appr.action_type, 'operation', v_appr.operation,
            'payload_hash', md5(v_appr.payload::text),   -- pre-modification hash (A6)
            'note', v_note, 'outbox_id', v_outbox_id, 'task_id_created', v_task_id,
            'policy_change_id', v_change_id),
          jsonb_build_object('table', 'approvals', 'id', v_id));

  v_resp := jsonb_strip_nulls(jsonb_build_object(
    'ok', true, 'op', 'decide', 'action', v_action, 'approval_id', v_id,
    'outbox_id', v_outbox_id, 'task_id', v_task_id,
    'policy_change_id', v_change_id));
  INSERT INTO control_idempotency (key, request_digest, response)
  VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

REVOKE ALL ON FUNCTION control_approvals_action(jsonb, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION control_approvals_action(jsonb, text) FROM anon;
GRANT EXECUTE ON FUNCTION control_approvals_action(jsonb, text) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 0023c — views (§4 fatigue, §7 single-query center)
-- ---------------------------------------------------------------------------

-- money-out detection shared shape: operation_class when classified, legacy
-- action_type prefix fallback (mirrors dashboard isMoneyOut).
CREATE OR REPLACE FUNCTION fn_is_money_out(p_operation_class text, p_action_type text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
AS $$
  SELECT p_operation_class = 'money_out'
      OR EXISTS (
           SELECT 1 FROM unnest(ARRAY['payment','transfer','ad_spend','refund','payout']) b
            WHERE p_action_type = b
               OR p_action_type LIKE b || '.%'
               OR p_action_type LIKE b || '\_%');
$$;
GRANT EXECUTE ON FUNCTION fn_is_money_out(text, text) TO authenticated, service_role;

CREATE OR REPLACE VIEW v_approvals_center
WITH (security_invoker = true) AS
SELECT a.id, a.status, a.action_type, a.operation, a.operation_class,
       a.risk_class, a.purpose, a.payload, a.cost_estimate, a.deadline,
       a.model_to_use, a.affected_systems, a.affected_files,
       a.recommended_action, a.reasoning_summary, a.alternatives,
       a.previous_reviews, a.created_at,
       a.decided_by, a.decided_at, a.decided_action, a.decision_note,
       a.modifications, a.policy_change_id, a.reanalysis_run_id,
       a.task_id, a.project_id,
       fn_is_money_out(a.operation_class, a.action_type) AS money_out,
       (a.status = 'pending' AND a.created_at < now() - interval '7 days') AS stale,  -- §26
       (a.status = 'pending' AND a.deadline IS NOT NULL AND now() > a.deadline) AS expired,  -- §26: never auto-cancelled
       EXTRACT(EPOCH FROM (now() - a.created_at))::bigint AS age_seconds,
       req.slug AS requester_slug, req.title AS requester_title,
       req.title_tr AS requester_title_tr,
       COALESCE(req.department, t.department) AS department,
       del.slug AS delegated_to_slug,
       t.objective AS task_objective,
       p.name AS project_name
  FROM approvals a
  LEFT JOIN agents req ON req.id = a.requester_employee_id
  LEFT JOIN agents del ON del.id = a.delegated_to
  LEFT JOIN tasks t ON t.id = a.task_id
  LEFT JOIN projects p ON p.id = a.project_id
 WHERE a.status <> 'draft'                    -- drafts are the agents' side
 ORDER BY (a.status = 'pending') DESC,
          fn_is_money_out(a.operation_class, a.action_type) DESC,
          a.created_at;

GRANT SELECT ON v_approvals_center TO authenticated;

-- Fatigue metrics per class (R6/§4): 7-day window; a table is NOT wanted.
CREATE OR REPLACE VIEW v_approval_fatigue
WITH (security_invoker = true) AS
SELECT COALESCE(a.operation_class,
         CASE WHEN fn_is_money_out(NULL, a.action_type) THEN 'money_out' ELSE 'other' END)
         AS operation_class,
       count(*) FILTER (WHERE a.status = 'pending') AS pending_count,
       min(a.created_at) FILTER (WHERE a.status = 'pending') AS oldest_pending_at,
       round(avg(EXTRACT(EPOCH FROM (now() - a.created_at)) / 3600)
             FILTER (WHERE a.status = 'pending'), 1) AS avg_pending_hours,
       count(*) FILTER (WHERE a.decided_at > now() - interval '7 days') AS decided_7d,
       count(*) FILTER (WHERE a.decided_at > now() - interval '7 days'
                          AND a.status = 'approved') AS approved_7d,
       round(avg(EXTRACT(EPOCH FROM (a.decided_at - a.created_at)) / 60)
             FILTER (WHERE a.decided_at > now() - interval '7 days'), 1)
         AS avg_decision_minutes_7d
  FROM approvals a
 WHERE a.status <> 'draft'
 GROUP BY 1;

GRANT SELECT ON v_approval_fatigue TO authenticated;

-- ---------------------------------------------------------------------------
-- §9 — approval sweeps join the ONE alert sweep door (E8.4b), additively.
-- Existing checks (queue age, heartbeat, escalation) are byte-identical.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_alerts_evaluate()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_queue_max  int;
  v_hb_max     int;
  v_esc        jsonb;
  v_n          int;
  v_oldest     timestamptz;
  v_last_hb    timestamptz;
  v_raised     int := 0;
  v_escalated  int := 0;
BEGIN
  SELECT COALESCE((SELECT (value #>> '{}')::int FROM settings_values
                    WHERE key = 'alerts.queue_age_max_minutes' AND scope = 'global'), 30)
    INTO v_queue_max;
  SELECT COALESCE((SELECT (value #>> '{}')::int FROM settings_values
                    WHERE key = 'alerts.heartbeat_max_seconds' AND scope = 'global'), 300)
    INTO v_hb_max;
  SELECT COALESCE((SELECT value FROM settings_values
                    WHERE key = 'alerts.escalate_after_minutes' AND scope = 'global'),
                  '{"attention":240,"high":60,"critical":15}'::jsonb)
    INTO v_esc;

  -- queue age
  SELECT count(*), min(created_at) INTO v_n, v_oldest
    FROM tasks
   WHERE status = 'queued'
     AND created_at < now() - make_interval(mins => v_queue_max);
  IF v_n > 0 THEN
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, dedup_key)
    VALUES ('attention', 'queue',
            v_n || ' task(s) queued longer than ' || v_queue_max || ' min',
            'task queue',
            'oldest queued since ' || to_char(v_oldest, 'YYYY-MM-DD HH24:MI') || ' UTC',
            'Check worker liveness and queue depth on /live',
            'queue-age')
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING;
    IF FOUND THEN v_raised := v_raised + 1; END IF;
  END IF;

  -- heartbeat loss (empty snapshot table = probe never started → honest skip)
  SELECT max(at) INTO v_last_hb FROM system_health_snapshots;
  IF v_last_hb IS NOT NULL
     AND v_last_hb < now() - make_interval(secs => v_hb_max) THEN
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, dedup_key)
    VALUES ('high', 'heartbeat',
            'Health probe heartbeat lost (last snapshot '
            || to_char(v_last_hb, 'YYYY-MM-DD HH24:MI') || ' UTC)',
            'health probe',
            'no system_health_snapshots row within ' || v_hb_max || 's',
            'Check the worker process and pg-boss health-probe job',
            'heartbeat-loss')
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING;
    IF FOUND THEN v_raised := v_raised + 1; END IF;
  END IF;

  -- E9.3 §9a: pending approval inside the last 25% of its deadline window,
  -- or already past it (§26: expired = marker + alert, NEVER auto-cancel).
  -- One dedup key per approval covers both phases; the escalation sweep
  -- below raises unacknowledged ones.
  WITH raised AS (
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, dedup_key, source_ref)
    SELECT CASE WHEN now() > a.deadline THEN 'high' ELSE 'attention' END,
           'approvals',
           CASE WHEN now() > a.deadline THEN 'Approval deadline EXPIRED: '
                ELSE 'Approval nearing deadline: ' END
             || COALESCE(a.operation, a.action_type),
           'approval gate',
           'deadline ' || to_char(a.deadline, 'YYYY-MM-DD HH24:MI')
             || ' UTC (created ' || to_char(a.created_at, 'YYYY-MM-DD HH24:MI') || ' UTC)',
           'Decide it on /approvals/' || a.id,
           'approval-deadline-' || a.id,
           jsonb_build_object('table', 'approvals', 'id', a.id)
      FROM approvals a
     WHERE a.status = 'pending' AND a.deadline IS NOT NULL
       AND now() > a.deadline - (a.deadline - a.created_at) * 0.25
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING
    RETURNING 1)
  SELECT v_raised + count(*) INTO v_raised FROM raised;

  -- E9.3 §9b: money_out pending >24h → High. Money flow must not sit —
  -- but auto-approval NEVER (the alert is the only automation).
  WITH raised AS (
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, dedup_key, source_ref)
    SELECT 'high', 'approvals',
           'money-out approval pending >24h: ' || COALESCE(a.operation, a.action_type),
           'approval gate (B7b)',
           'pending since ' || to_char(a.created_at, 'YYYY-MM-DD HH24:MI') || ' UTC',
           'Decide it on /approvals/' || a.id,
           'approval-moneyout-' || a.id,
           jsonb_build_object('table', 'approvals', 'id', a.id)
      FROM approvals a
     WHERE a.status = 'pending'
       AND fn_is_money_out(a.operation_class, a.action_type)
       AND a.created_at < now() - interval '24 hours'
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING
    RETURNING 1)
  SELECT v_raised + count(*) INTO v_raised FROM raised;

  -- escalation sweep (GAP-10; ticket interp 2): unacknowledged past deadline
  -- → one level up, once per alert; muted alerts wait out their snooze.
  WITH bumped AS (
    UPDATE alerts a
       SET level = CASE a.level WHEN 'attention' THEN 'high'
                                WHEN 'high' THEN 'critical'
                                WHEN 'critical' THEN 'emergency' END,
           escalated_from = a.level,
           escalated_at   = now()
     WHERE a.resolved_at IS NULL
       AND a.acknowledged_at IS NULL
       AND a.escalated_at IS NULL
       AND (a.muted_until IS NULL OR a.muted_until < now())
       AND a.level IN ('attention', 'high', 'critical')
       AND a.at < now() - make_interval(mins => COALESCE((v_esc ->> a.level)::int, 240))
    RETURNING 1)
  SELECT count(*) INTO v_escalated FROM bumped;

  RETURN jsonb_build_object('ok', true, 'raised', v_raised,
                            'escalated', v_escalated);
END $$;
