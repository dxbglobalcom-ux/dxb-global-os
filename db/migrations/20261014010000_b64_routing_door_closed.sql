-- B64 plan step 1, first item (CEO-approved plan, 2026-10-14) — THE ROUTING DOOR CLOSES TO CALLERS WHO
-- NEVER LOGGED IN.
--
-- fn_update_routing (MODEL_ROUTING_SPEC §4b/§4c door; v1 20260713040000:303, v2 20260713050000:106) is
-- SECURITY DEFINER. Measured before this file (bench 54422; company 54322 SELECT-only, 2026-10-14):
--   · anon holds EXECUTE — e71 revoked anon but never PUBLIC, and both engines show anon executing it
--     (bench proacl carries anon=X/postgres; company has_function_privilege('anon', ...) = t);
--   · its actor line read `current_user IN ('service_role','postgres')` — inside a definer current_user is
--     always the owner, so anon counted as 'system'. On the bench, in a rolled-back transaction,
--     `SET LOCAL ROLE anon; SELECT fn_update_routing('set_catalog_status', ...)` was served, not refused.
-- The fix reuses the actor the succession door already uses (fn_succession_actor, 20261010020000):
-- 'ceo' for a signed-in request (JWT role authenticated with a user id), 'system' for a service_role
-- request or a direct postgres login with no request JWT, NULL — PERMISSION_DENIED — for anyone else.
-- The only caller (apps/dashboard/src/app/api/control/models/route.ts) rides the signed-in user's JWT
-- and stays 'ceo'. Everything else in the body is e72's, unchanged.
--
-- Idempotent: safe to run 2×.

BEGIN;

CREATE OR REPLACE FUNCTION public.fn_update_routing(
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
  v_actor := fn_succession_actor();
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

REVOKE ALL ON FUNCTION public.fn_update_routing(text, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_update_routing(text, jsonb, text) TO authenticated, service_role;

COMMIT;

-- ROLLBACK PLAN: re-apply the fn_update_routing body from 20260713050000 (section 2) and
-- GRANT EXECUTE ON FUNCTION public.fn_update_routing(text, jsonb, text) TO anon — which re-opens the door
-- this file closes; do not without his word.
