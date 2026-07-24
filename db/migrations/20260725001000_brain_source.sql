-- MODEL_ROUTING_SPEC §4b delta 0021g (built 2026-07-25, CEO catch "why is
-- every brain glm-5.2"): the workforce-wide glm-5.2 uniformity is the raw
-- column DEFAULT — the spec's routing-assignment transition never ran, so
-- the value carries no decision. brain_source makes that legible:
--   'default'      seed placeholder, no assignment ever made
--   'slot'         written by the future role→slot transition migration
--   'ceo_override' written by the §4b-regime door (CEO assignment)
-- Surfaces render 'default' as "not assigned" instead of echoing glm-5.2.
ALTER TABLE agents ADD COLUMN IF NOT EXISTS brain_source text NOT NULL DEFAULT 'default'
  CHECK (brain_source IN ('default','slot','ceo_override'));
CREATE OR REPLACE FUNCTION public.control_org_assign_model_group(p_model_id text, p_employee_ids uuid[], p_rationale text DEFAULT NULL::text, p_idempotency_key text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('org_assign_model|' || p_model_id || '|' ||
                       array_to_string(p_employee_ids, ','));
  v_prev record;
  v_model record;
  v_updated uuid[];
  v_emp uuid;
  v_audit bigint;
  v_resp jsonb;
BEGIN
  IF v_actor IS DISTINCT FROM 'ceo' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF p_employee_ids IS NULL OR array_length(p_employee_ids, 1) IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'employee_ids must not be empty');
  END IF;
  IF p_idempotency_key IS NOT NULL THEN
    SELECT request_digest, response INTO v_prev FROM control_idempotency WHERE key = p_idempotency_key;
    IF FOUND THEN
      IF v_prev.request_digest <> v_digest THEN
        RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
      END IF;
      RETURN v_prev.response;
    END IF;
  END IF;

  SELECT id, banned, status INTO v_model FROM model_catalog WHERE id = p_model_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'unknown model');
  END IF;
  IF v_model.banned OR v_model.status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'model is banned or not active in the catalog');
  END IF;

  WITH updated AS (
    UPDATE agents SET brain = p_model_id, brain_source = 'ceo_override', updated_at = now()
    WHERE id = ANY (p_employee_ids) AND employment_status <> 'archived'
    RETURNING id
  ) SELECT coalesce(array_agg(id), '{}') INTO v_updated FROM updated;

  IF array_length(v_updated, 1) IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'no matching non-archived employees');
  END IF;

  FOREACH v_emp IN ARRAY v_updated LOOP
    INSERT INTO decision_log (decided_by, decision, rationale, risk)
    VALUES ('ceo', 'model.assigned: ' || p_model_id || ' → employee ' || v_emp,
            coalesce(p_rationale, 'CEO model-group assignment (org seam)'), 'medium');
  END LOOP;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, 'ceo', 'org.model_group.assigned',
          jsonb_build_object('model_id', p_model_id, 'employee_ids', to_jsonb(v_updated),
                             'requested', array_length(p_employee_ids, 1),
                             'updated', array_length(v_updated, 1)))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('org', 'model_group.assigned',
    jsonb_build_object('op', 'assign_model_group', 'entity', 'employee_group',
      'id', p_model_id,
      'summary_en', p_model_id || ' assigned to ' || array_length(v_updated, 1) || ' employees',
      'summary_tr', p_model_id || ' ' || array_length(v_updated, 1) || ' çalışana atandı'));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit, 'affected', to_jsonb(v_updated));
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $function$

;
