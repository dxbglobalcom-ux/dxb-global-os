-- E7.2 — Model Orchestration Panel backend (MODEL_ROUTING_SPEC §5-§8, §4c)
-- Author: Fable 5 in person (K1).
--
-- Ships: v_model_stats (R3 meta from REAL agent_runs — fake scores forbidden,
-- spec §6) · fn_update_routing v2 adds the §4c onboarding ops:
--   add_model    — catalog row born status='testing' (never assignable until
--                  activated; ceo-only)
--   set_fallback — fallback chain edit (acyclic trigger guards; ceo-only)
-- (assign_role / set_catalog_status unchanged from E7.1.)
--
-- Registered adaptations (spec-visible):
--   A1. §4c step-1 LiteLLM runtime registration: the proxy is Phase-7 VPS
--       scope. add_model records the catalog row; the smoke-test op lives in
--       the route layer (TS — SQL cannot call an LLM) and reports
--       LITELLM_UNREACHABLE honestly until the proxy exists. No fake-ready
--       state (§35).
--   A2. Panel v1 assigns via select + confirm dialog, not drag — the ⛔
--       graph-library decision (E6.3 boundary) stays open; §10's
--       confirm-before-mutate contract is honored either way. Drag lands
--       with graph v2.
--
-- Idempotent: safe to run 2×.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. v_model_stats — §19 meta per model, computed from live tables only.
--    reliability/usage/failure-rate come from agent_runs (30d window);
--    assigned_employees from agents.brain; slot assignments from routing_rules.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_model_stats AS
SELECT
  m.id,
  m.display_name,
  m.provider,
  m.context_window,
  m.cost_in_per_mtok,
  m.cost_out_per_mtok,
  m.speed_score,
  m.quality_score,
  m.status,
  m.banned,
  m.mechanical_only,
  m.fallback_of,
  COALESCE(r.runs_30d, 0)      AS runs_30d,
  COALESCE(r.succeeded_30d, 0) AS succeeded_30d,
  COALESCE(r.failed_30d, 0)    AS failed_30d,
  CASE WHEN COALESCE(r.finished_30d, 0) > 0
       THEN round(r.succeeded_30d::numeric / r.finished_30d, 3)
  END                          AS success_rate_30d,
  r.avg_duration_sec_30d,
  COALESCE(r.cost_30d_eur, 0)  AS cost_30d_eur,
  COALESCE(r.active_runs, 0)   AS active_runs,
  COALESCE(a.assigned_employees, 0) AS assigned_employees,
  COALESCE(s.slot_assignments, 0)   AS slot_assignments
FROM model_catalog m
LEFT JOIN LATERAL (
  SELECT count(*)                                   AS runs_30d,
         count(*) FILTER (WHERE ar.status = 'succeeded') AS succeeded_30d,
         count(*) FILTER (WHERE ar.status = 'failed')    AS failed_30d,
         count(*) FILTER (WHERE ar.status IN ('succeeded','failed')) AS finished_30d,
         round(avg(EXTRACT(EPOCH FROM ar.ended_at - ar.started_at))
               FILTER (WHERE ar.ended_at IS NOT NULL))   AS avg_duration_sec_30d,
         sum(ar.cost_eur)                                AS cost_30d_eur,
         count(*) FILTER (WHERE ar.status = 'running')   AS active_runs
    FROM agent_runs ar
   WHERE ar.model_id = m.id
     AND ar.started_at > now() - interval '30 days'
) r ON true
LEFT JOIN LATERAL (
  SELECT count(*) AS assigned_employees
    FROM agents ag
   WHERE ag.brain = m.id AND ag.employment_status <> 'archived'
) a ON true
LEFT JOIN LATERAL (
  SELECT count(*) AS slot_assignments
    FROM routing_rules rr
   WHERE rr.model_id = m.id AND rr.role_slot IS NOT NULL AND rr.enabled
) s ON true;

GRANT SELECT ON v_model_stats TO authenticated;
REVOKE ALL ON v_model_stats FROM anon;

-- Slot board read: 13 slots with their effective global rule (panel v1 scope;
-- department overrides render in the simulator, not the board).
CREATE OR REPLACE VIEW v_role_slots AS
SELECT s.slot AS role_slot,
       r.id AS rule_id,
       r.model_id,
       m.display_name,
       m.status AS model_status,
       m.mechanical_only,
       r.updated_at
  FROM unnest(fn_routing_slots()) AS s(slot)
  LEFT JOIN routing_rules r
    ON r.role_slot = s.slot AND r.priority = 100
   AND r.department_id IS NULL AND r.enabled
  LEFT JOIN model_catalog m ON m.id = r.model_id;

GRANT SELECT ON v_role_slots TO authenticated;
REVOKE ALL ON v_role_slots FROM anon;

-- ---------------------------------------------------------------------------
-- 2. fn_update_routing v2 — §4c ops added. Same signature (CREATE OR REPLACE).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_routing(
  p_op              text,
  p_payload         jsonb,
  p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text;
  v_digest text;
  v_prev record;
  v_resp jsonb;
  v_slot text;
  v_model text;
  v_dept uuid;
  v_rationale text;
  v_status text;
  v_old text;
  v_rule_id uuid;
  v_cat record;
  v_audit_id bigint;
BEGIN
  v_actor := CASE
    WHEN auth.uid() IS NOT NULL THEN 'ceo'
    WHEN current_user IN ('service_role', 'postgres') THEN 'system'
  END;
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;

  v_digest := md5(p_op || '|' || p_payload::text);
  SELECT request_digest, response INTO v_prev
    FROM control_idempotency WHERE key = p_idempotency_key;
  IF FOUND THEN
    IF v_prev.request_digest <> v_digest THEN
      RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
    END IF;
    RETURN v_prev.response;
  END IF;

  IF p_op = 'assign_role' THEN
    IF v_actor <> 'ceo' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
        'detail', 'assign_role is ceo-only');
    END IF;
    v_slot  := p_payload->>'role_slot';
    v_model := p_payload->>'model_id';
    v_dept  := (p_payload->>'department_id')::uuid;
    v_rationale := COALESCE(p_payload->>'rationale', 'ceo assignment');
    IF v_slot IS NULL OR NOT (v_slot = ANY (fn_routing_slots())) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'unknown role_slot');
    END IF;
    SELECT * INTO v_cat FROM model_catalog WHERE id = v_model;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'unknown model ' || COALESCE(v_model, '(null)'));
    END IF;
    IF v_cat.banned THEN
      RETURN jsonb_build_object('ok', false, 'error', 'MODEL_BANNED');
    END IF;
    IF v_cat.status <> 'active' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'MODEL_NOT_ACTIVE',
        'detail', 'status ' || v_cat.status);
    END IF;
    IF v_cat.mechanical_only AND NOT (v_slot = ANY (fn_routing_mechanical_slots())) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'MODEL_MECHANICAL_ONLY',
        'detail', 'slot ' || v_slot || ' produces verdicts');
    END IF;
    IF v_dept IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM departments WHERE id = v_dept) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'unknown department');
    END IF;

    SELECT id, model_id INTO v_rule_id, v_old FROM routing_rules
     WHERE role_slot = v_slot AND priority = 100
       AND department_id IS NOT DISTINCT FROM v_dept
     FOR UPDATE;
    IF v_rule_id IS NULL THEN
      INSERT INTO routing_rules
        (task_class, match, model_tier, model, mode, effort, needs_council,
         priority, enabled, model_id, role_slot, department_id)
      VALUES ('slot.' || v_slot, '{}'::jsonb,
              CASE WHEN v_cat.mechanical_only THEN 'L4' ELSE 'L1' END,
              v_model, 'subscription', 'medium', false, 100, true,
              v_model, v_slot, v_dept)
      RETURNING id INTO v_rule_id;
    ELSE
      UPDATE routing_rules
         SET model_id = v_model, model = v_model,
             model_tier = CASE WHEN v_cat.mechanical_only THEN 'L4' ELSE 'L1' END,
             updated_at = now()
       WHERE id = v_rule_id;
    END IF;

    INSERT INTO audit_log (actor, actor_type, action, payload, detail_ref)
    VALUES (v_actor, 'ceo', 'routing.assign_role',
            jsonb_build_object('role_slot', v_slot, 'model_id', v_model,
              'old_model_id', v_old, 'department_id', v_dept,
              'rationale', v_rationale),
            jsonb_build_object('routing_rule_id', v_rule_id))
    RETURNING id INTO v_audit_id;
    INSERT INTO decision_log (decided_by, decision, rationale, outcome)
    VALUES ('ceo', 'routing_change',
            'assign_role ' || v_slot || ': ' || COALESCE(v_old, '(new rule)')
            || ' → ' || v_model || '; ' || v_rationale, 'applied');
    PERFORM notify_broadcast('settings', 'routing.changed',
      jsonb_build_object('op', 'assign_role', 'role_slot', v_slot,
        'model_id', v_model, 'department_id', v_dept, 'audit_id', v_audit_id));
    v_resp := jsonb_build_object('ok', true, 'rule_id', v_rule_id,
                                 'audit_id', v_audit_id);

  ELSIF p_op = 'set_catalog_status' THEN
    v_model  := p_payload->>'model_id';
    v_status := p_payload->>'status';
    IF v_status IS NULL
       OR v_status NOT IN ('active','testing','degraded','disabled','retired') THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'unknown status');
    END IF;
    SELECT status INTO v_old FROM model_catalog WHERE id = v_model FOR UPDATE;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'unknown model ' || COALESCE(v_model, '(null)'));
    END IF;
    IF v_old = v_status THEN
      v_resp := jsonb_build_object('ok', true, 'noop', true);
      INSERT INTO control_idempotency (key, request_digest, response)
      VALUES (p_idempotency_key, v_digest, v_resp);
      RETURN v_resp;
    END IF;
    UPDATE model_catalog SET status = v_status WHERE id = v_model;
    INSERT INTO audit_log (actor, actor_type, action, payload)
    VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END,
            'routing.set_catalog_status',
            jsonb_build_object('model_id', v_model, 'old', v_old, 'new', v_status))
    RETURNING id INTO v_audit_id;
    INSERT INTO decision_log (decided_by, decision, rationale, outcome)
    VALUES (v_actor, 'routing_change',
            'set_catalog_status ' || v_model || ': ' || v_old || ' → ' || v_status,
            'applied');
    PERFORM notify_broadcast('settings', 'routing.changed',
      jsonb_build_object('op', 'set_catalog_status', 'model_id', v_model,
        'status', v_status, 'audit_id', v_audit_id));
    v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit_id);

  ELSIF p_op = 'add_model' THEN
    -- §4c step 1: the row is born status='testing' — NOT in the assignable
    -- pool until explicitly activated. Raw provider keys never pass here
    -- (R5): the catalog knows aliases only.
    IF v_actor <> 'ceo' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
        'detail', 'add_model is ceo-only');
    END IF;
    v_model := p_payload->>'id';
    IF v_model IS NULL OR v_model !~ '^[a-z0-9][a-z0-9._-]{1,79}$' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'model id must be a lowercase alias (letters, digits, . _ -)');
    END IF;
    IF EXISTS (SELECT 1 FROM model_catalog WHERE id = v_model) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'model already in catalog');
    END IF;
    IF COALESCE(p_payload->>'provider', '') = '' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'provider required');
    END IF;
    INSERT INTO model_catalog
      (id, provider, display_name, context_window,
       cost_in_per_mtok, cost_out_per_mtok, speed_score, status)
    VALUES
      (v_model, p_payload->>'provider', p_payload->>'display_name',
       NULLIF(p_payload->>'context_window','')::int,
       NULLIF(p_payload->>'cost_in_per_mtok','')::numeric,
       NULLIF(p_payload->>'cost_out_per_mtok','')::numeric,
       NULLIF(p_payload->>'speed_score','')::int,
       'testing');
    INSERT INTO audit_log (actor, actor_type, action, payload)
    VALUES ('ceo', 'ceo', 'routing.add_model',
            jsonb_build_object('model_id', v_model,
              'provider', p_payload->>'provider',
              'display_name', p_payload->>'display_name'))
    RETURNING id INTO v_audit_id;
    INSERT INTO decision_log (decided_by, decision, rationale, outcome)
    VALUES ('ceo', 'routing_change',
            'add_model ' || v_model || ' (status=testing; §4c onboarding)', 'applied');
    PERFORM notify_broadcast('settings', 'routing.changed',
      jsonb_build_object('op', 'add_model', 'model_id', v_model,
        'status', 'testing', 'audit_id', v_audit_id));
    v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit_id,
                                 'status', 'testing');

  ELSIF p_op = 'set_fallback' THEN
    -- §4c binding shortcut: edit the fallback chain. The acyclic trigger
    -- (0021h) rejects loops; depth is re-checked at walk time (fn ≤4).
    IF v_actor <> 'ceo' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
        'detail', 'set_fallback is ceo-only');
    END IF;
    v_model := p_payload->>'model_id';
    v_old := p_payload->>'fallback_of';  -- reuse: target (nullable = clear)
    IF NOT EXISTS (SELECT 1 FROM model_catalog WHERE id = v_model) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'unknown model ' || COALESCE(v_model, '(null)'));
    END IF;
    IF v_old IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM model_catalog WHERE id = v_old) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'unknown fallback target ' || v_old);
    END IF;
    BEGIN
      UPDATE model_catalog SET fallback_of = v_old WHERE id = v_model;
    EXCEPTION WHEN raise_exception THEN
      RETURN jsonb_build_object('ok', false, 'error', 'FALLBACK_CYCLE',
        'detail', SQLERRM);
    END;
    INSERT INTO audit_log (actor, actor_type, action, payload)
    VALUES ('ceo', 'ceo', 'routing.set_fallback',
            jsonb_build_object('model_id', v_model, 'fallback_of', v_old))
    RETURNING id INTO v_audit_id;
    INSERT INTO decision_log (decided_by, decision, rationale, outcome)
    VALUES ('ceo', 'routing_change',
            'set_fallback ' || v_model || ' → ' || COALESCE(v_old, '(none)'), 'applied');
    PERFORM notify_broadcast('settings', 'routing.changed',
      jsonb_build_object('op', 'set_fallback', 'model_id', v_model,
        'fallback_of', v_old, 'audit_id', v_audit_id));
    v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit_id);

  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown op ' || COALESCE(p_op, '(null)'));
  END IF;

  INSERT INTO control_idempotency (key, request_digest, response)
  VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

COMMIT;

-- ROLLBACK PLAN: DROP VIEW v_role_slots, v_model_stats; re-apply the E7.1
-- version of fn_update_routing from 20260713040000 (assign_role +
-- set_catalog_status only).
