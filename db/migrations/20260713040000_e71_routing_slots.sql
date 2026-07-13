-- E7.1 — Table-driven model routing (MODEL_ROUTING_SPEC §3-§6, 0021x family)
-- Author: Fable 5 in person (K1).
--
-- Ships: 13 role-slot rows in routing_rules · model_catalog fallback chain +
-- metadata completion · fn_select_model (rule scan + guardrails + hard-stop +
-- decision_log) · fn_model_fallback (chain walk, R4) · fn_update_routing
-- (assign_role / set_catalog_status control seam) · settings delegate flip
-- (spec §7: the 13 orchestrator.*_model settings keys delegate to routing —
-- no double source; control_settings_set already refuses delegated keys).
--
-- Registered adaptations (spec-visible, not silent):
--   A1. Slot defaults follow the LIVE settings-registry defaults shipped in
--       E6.1 (primary=fable-5; fast_task/low_cost=claude-haiku-4-5; the other
--       10 slots=claude-opus-4-8). The spec §4 table lists opus for the
--       primary slot with the note "Fable erişimi varken kritik-karar/review
--       fiilen Fable'dadır" — the registry default (CEO-approved E6.1) is that
--       note applied; handover day flips fable-5 to disabled (spec §26).
--   A2. Catalog cost_in/out_per_mtok and quality_score stay NULL — zero
--       fabrication; real prices land with the LiteLLM proxy wiring (Phase 7)
--       and quality_score is CEO/QA input (spec §26). speed_score is a
--       relative ordinal seed (CEO/QA adjustable). context_window only where
--       measured (fable-5 = 1,000,000, this build session).
--   A3. §4b (agents.brain_source + fn_update_agent_brain) is NOT here — it
--       lands with its dashboard surface (employee card control), per plan.
--
-- Idempotent: safe to run 2×.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. model_catalog: fallback chain + metadata completion
--    Semantics: X.fallback_of = Y  ⇒  when X fails, fall back to Y
--    (walk = follow the pointer; acyclic trigger live since 0021h).
-- ---------------------------------------------------------------------------
UPDATE model_catalog SET fallback_of = 'claude-opus-4-8'
 WHERE id = 'fable-5' AND fallback_of IS DISTINCT FROM 'claude-opus-4-8';
UPDATE model_catalog SET fallback_of = 'claude-sonnet-5'
 WHERE id = 'claude-opus-4-8' AND fallback_of IS DISTINCT FROM 'claude-sonnet-5';
UPDATE model_catalog SET fallback_of = 'claude-sonnet-5'
 WHERE id = 'claude-haiku-4-5' AND fallback_of IS DISTINCT FROM 'claude-sonnet-5';
-- claude-sonnet-5: end of chain (fallback_of NULL) — chain exhaustion is a
-- loud blocked_no_model event, never a silent default (spec §17-19).

UPDATE model_catalog SET context_window = 1000000
 WHERE id = 'fable-5' AND context_window IS NULL;
UPDATE model_catalog SET speed_score = v.s
  FROM (VALUES ('claude-haiku-4-5', 90), ('claude-sonnet-5', 70),
               ('claude-opus-4-8', 50), ('fable-5', 40)) AS v(id, s)
 WHERE model_catalog.id = v.id AND model_catalog.speed_score IS NULL;

-- ---------------------------------------------------------------------------
-- 2. routing_rules: 13 role-slot rows (R1), global scope, priority 100.
--    Legacy NOT NULL columns get slot-mirror values; task_class 'slot.<name>'
--    is emitted by no classifier, so kernel legacy routing is untouched.
-- ---------------------------------------------------------------------------
INSERT INTO routing_rules
  (task_class, match, model_tier, model, mode, effort, needs_council,
   priority, enabled, model_id, role_slot)
SELECT 'slot.' || v.slot, '{}'::jsonb, v.tier, v.model_id, 'subscription',
       'medium', false, 100, true, v.model_id, v.slot
  FROM (VALUES
    ('primary',           'fable-5',          'L1'),
    ('backup',            'claude-opus-4-8',  'L1'),
    ('planning',          'claude-opus-4-8',  'L1'),
    ('execution',         'claude-opus-4-8',  'L1'),
    ('review',            'claude-opus-4-8',  'L1'),
    ('critical_decision', 'claude-opus-4-8',  'L1'),
    ('fast_task',         'claude-haiku-4-5', 'L4'),
    ('low_cost',          'claude-haiku-4-5', 'L4'),
    ('research',          'claude-opus-4-8',  'L1'),
    ('coding',            'claude-opus-4-8',  'L1'),
    ('design',            'claude-opus-4-8',  'L1'),
    ('qa',                'claude-opus-4-8',  'L1'),
    ('hr',                'claude-opus-4-8',  'L1')
  ) AS v(slot, model_id, tier)
 WHERE NOT EXISTS (
   SELECT 1 FROM routing_rules r
    WHERE r.role_slot = v.slot AND r.priority = 100 AND r.department_id IS NULL);

-- ---------------------------------------------------------------------------
-- 3. Slot vocabulary + risk ranking helpers (IMMUTABLE, pure SQL)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_routing_slots() RETURNS text[]
LANGUAGE sql IMMUTABLE AS $$
  SELECT ARRAY['primary','backup','planning','execution','review',
               'critical_decision','fast_task','low_cost','research',
               'coding','design','qa','hr'];
$$;

-- Slots where a mechanical_only model (Haiku class) is permitted — mirrors the
-- E6.1 settings validator rule (mechanical on fast/low-cost allowed, on any
-- verdict-capable slot refused). R2 is ABSOLUTE: no bypass path.
CREATE OR REPLACE FUNCTION fn_routing_mechanical_slots() RETURNS text[]
LANGUAGE sql IMMUTABLE AS $$ SELECT ARRAY['fast_task','low_cost']; $$;

CREATE OR REPLACE FUNCTION fn_risk_rank(p_risk text) RETURNS int
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE p_risk WHEN 'low' THEN 1 WHEN 'medium' THEN 2
                     WHEN 'high' THEN 3 WHEN 'critical' THEN 4 ELSE 0 END;
$$;

-- ---------------------------------------------------------------------------
-- 4. fn_select_model — spec §3 chain steps 2-5 in SQL.
--    Returns jsonb {ok, model_id, rule_id, decision_id, considered} or
--    {ok:false, error, decision_id}. Every logged decision carries the
--    eliminated candidates with reasons (spec §14: CEO always sees "why this
--    model?").
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_select_model(
  p_role_slot     text,
  p_department_id uuid    DEFAULT NULL,
  p_risk          text    DEFAULT 'low',
  p_min_context   int     DEFAULT NULL,
  p_est_cost      numeric DEFAULT NULL,
  p_run_id        uuid    DEFAULT NULL,
  p_critical      boolean DEFAULT false,
  p_log           boolean DEFAULT true
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cand record;
  v_chosen_model text;
  v_chosen_rule uuid;
  v_eliminated jsonb := '[]'::jsonb;
  v_decision_id bigint;
BEGIN
  IF NOT (p_role_slot = ANY (fn_routing_slots())) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown role_slot ' || p_role_slot);
  END IF;
  IF p_risk NOT IN ('low','medium','high','critical') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown risk ' || p_risk);
  END IF;

  -- Budget hard-stop gate (COST spec: applied at intake, critical class
  -- exempt — approvals/outbox/health/backup keep running).
  IF NOT p_critical AND EXISTS (SELECT 1 FROM budget_state WHERE hard_stopped) THEN
    IF p_log THEN
      INSERT INTO decision_log (run_id, decided_by, decision, rationale, risk, outcome)
      VALUES (p_run_id, 'orchestrator', 'routing_decision',
              'slot=' || p_role_slot || '; refused: budget hard-stop active, task not critical-class',
              p_risk, 'refused_budget_hard_stop')
      RETURNING id INTO v_decision_id;
    END IF;
    RETURN jsonb_build_object('ok', false, 'error', 'BUDGET_HARD_STOP',
                              'decision_id', v_decision_id);
  END IF;

  -- Rule scan: department-specific beats global, then priority DESC (same
  -- direction as the legacy kernel policy — higher priority wins).
  FOR v_cand IN
    SELECT r.id AS rule_id, r.model_id, r.risk_max, r.min_context,
           r.cost_cap_per_task, r.department_id,
           m.status, m.banned, m.mechanical_only, m.context_window
      FROM routing_rules r
      JOIN model_catalog m ON m.id = r.model_id
     WHERE r.enabled
       AND r.role_slot = p_role_slot
       AND (r.department_id IS NULL OR r.department_id = p_department_id)
     ORDER BY (r.department_id IS NOT NULL) DESC, r.priority DESC, r.updated_at DESC
  LOOP
    IF v_cand.risk_max IS NOT NULL AND fn_risk_rank(p_risk) > fn_risk_rank(v_cand.risk_max) THEN
      v_eliminated := v_eliminated || jsonb_build_object('rule_id', v_cand.rule_id,
        'model_id', v_cand.model_id, 'reason', 'risk above rule risk_max');
    ELSIF v_cand.min_context IS NOT NULL AND COALESCE(p_min_context, 0) < v_cand.min_context THEN
      v_eliminated := v_eliminated || jsonb_build_object('rule_id', v_cand.rule_id,
        'model_id', v_cand.model_id, 'reason', 'task context below rule min_context');
    ELSIF v_cand.cost_cap_per_task IS NOT NULL AND p_est_cost IS NOT NULL
          AND p_est_cost > v_cand.cost_cap_per_task THEN
      v_eliminated := v_eliminated || jsonb_build_object('rule_id', v_cand.rule_id,
        'model_id', v_cand.model_id, 'reason', 'estimated cost above rule cap');
    ELSIF v_cand.status <> 'active' THEN
      v_eliminated := v_eliminated || jsonb_build_object('rule_id', v_cand.rule_id,
        'model_id', v_cand.model_id, 'reason', 'model status ' || v_cand.status);
    ELSIF v_cand.banned THEN
      v_eliminated := v_eliminated || jsonb_build_object('rule_id', v_cand.rule_id,
        'model_id', v_cand.model_id, 'reason', 'model banned');
    ELSIF v_cand.mechanical_only
          AND NOT (p_role_slot = ANY (fn_routing_mechanical_slots())) THEN
      v_eliminated := v_eliminated || jsonb_build_object('rule_id', v_cand.rule_id,
        'model_id', v_cand.model_id, 'reason', 'mechanical_only model on verdict-capable slot');
    ELSIF v_cand.context_window IS NOT NULL AND p_min_context IS NOT NULL
          AND v_cand.context_window < p_min_context THEN
      v_eliminated := v_eliminated || jsonb_build_object('rule_id', v_cand.rule_id,
        'model_id', v_cand.model_id, 'reason', 'model context_window below task need');
    ELSE
      v_chosen_model := v_cand.model_id;
      v_chosen_rule  := v_cand.rule_id;
      EXIT;
    END IF;
  END LOOP;

  IF v_chosen_model IS NULL THEN
    IF p_log THEN
      INSERT INTO decision_log (run_id, decided_by, decision, rationale,
                                alternatives, risk, outcome)
      VALUES (p_run_id, 'orchestrator', 'routing_decision',
              'slot=' || p_role_slot || '; no usable candidate',
              v_eliminated, p_risk, 'blocked_no_model')
      RETURNING id INTO v_decision_id;
    END IF;
    RETURN jsonb_build_object('ok', false, 'error', 'NO_MODEL_AVAILABLE',
      'decision_id', v_decision_id, 'considered', v_eliminated);
  END IF;

  IF p_log THEN
    INSERT INTO decision_log (run_id, decided_by, decision, rationale,
                              alternatives, risk, outcome)
    VALUES (p_run_id, 'orchestrator', 'routing_decision',
            'slot=' || p_role_slot || '; rule=' || v_chosen_rule || '; model=' || v_chosen_model,
            v_eliminated, p_risk, 'selected')
    RETURNING id INTO v_decision_id;
  END IF;

  RETURN jsonb_build_object('ok', true, 'model_id', v_chosen_model,
    'rule_id', v_chosen_rule, 'decision_id', v_decision_id,
    'considered', v_eliminated);
END $$;

-- ---------------------------------------------------------------------------
-- 5. fn_model_fallback — R4: deterministic chain walk (follow fallback_of,
--    depth ≤4), guardrails re-applied per hop, one routing_fallback row per
--    call. Exhausted chain = loud blocked_no_model (task state transition is
--    the orchestrator's job — spec §17-19).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_model_fallback(
  p_failed_model text,
  p_role_slot    text,
  p_reason       text    DEFAULT NULL,
  p_run_id       uuid    DEFAULT NULL,
  p_log          boolean DEFAULT true
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cur text := p_failed_model;
  v_next record;
  v_depth int := 0;
  v_skipped jsonb := '[]'::jsonb;
  v_decision_id bigint;
BEGIN
  IF NOT (p_role_slot = ANY (fn_routing_slots())) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown role_slot ' || p_role_slot);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM model_catalog WHERE id = p_failed_model) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown model ' || p_failed_model);
  END IF;

  LOOP
    v_depth := v_depth + 1;
    EXIT WHEN v_depth > 4;  -- spec §12: fn-level depth ≤4

    SELECT m.id, m.status, m.banned, m.mechanical_only INTO v_next
      FROM model_catalog f
      JOIN model_catalog m ON m.id = f.fallback_of
     WHERE f.id = v_cur;
    EXIT WHEN NOT FOUND;

    IF v_next.status = 'active' AND NOT v_next.banned
       AND (NOT v_next.mechanical_only
            OR p_role_slot = ANY (fn_routing_mechanical_slots())) THEN
      IF p_log THEN
        INSERT INTO decision_log (run_id, decided_by, decision, rationale,
                                  alternatives, outcome)
        VALUES (p_run_id, 'orchestrator', 'routing_fallback',
                'slot=' || p_role_slot || '; ' || p_failed_model || ' → ' || v_next.id
                || COALESCE('; reason=' || p_reason, ''),
                v_skipped, 'selected')
        RETURNING id INTO v_decision_id;
      END IF;
      RETURN jsonb_build_object('ok', true, 'model_id', v_next.id,
        'decision_id', v_decision_id, 'skipped', v_skipped);
    END IF;

    v_skipped := v_skipped || jsonb_build_object('model_id', v_next.id,
      'reason', CASE WHEN v_next.status <> 'active' THEN 'status ' || v_next.status
                     WHEN v_next.banned THEN 'banned'
                     ELSE 'mechanical_only on verdict-capable slot' END);
    v_cur := v_next.id;
  END LOOP;

  IF p_log THEN
    INSERT INTO decision_log (run_id, decided_by, decision, rationale,
                              alternatives, outcome)
    VALUES (p_run_id, 'orchestrator', 'routing_fallback',
            'slot=' || p_role_slot || '; chain from ' || p_failed_model || ' exhausted'
            || COALESCE('; reason=' || p_reason, ''),
            v_skipped, 'blocked_no_model')
    RETURNING id INTO v_decision_id;
  END IF;
  RETURN jsonb_build_object('ok', false, 'error', 'CHAIN_EXHAUSTED',
    'decision_id', v_decision_id, 'skipped', v_skipped);
END $$;

-- ---------------------------------------------------------------------------
-- 6. fn_update_routing — the control seam for routing mutations (spec §6/§13).
--    assign_role: ceo only. set_catalog_status: ceo any transition; system
--    status-only (health automation). banned/mechanical_only are migration-
--    only — no runtime path writes them, here or anywhere.
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
    -- §13: assignment changes are ceo-only (system may only touch status).
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
    -- Guardrails ABSOLUTE (R2, §4c): banned never; testing/degraded/disabled/
    -- retired not assignable; mechanical_only only on fast/low-cost slots.
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

  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown op ' || COALESCE(p_op, '(null)'));
  END IF;

  INSERT INTO control_idempotency (key, request_digest, response)
  VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

-- ---------------------------------------------------------------------------
-- 7. Settings delegate flip (spec §7 — no double source): the 13 model keys
--    become delegated to routing. control_settings_set already refuses
--    delegated keys; the settings UI already renders them read-only.
-- ---------------------------------------------------------------------------
ALTER TABLE settings_registry DROP CONSTRAINT IF EXISTS settings_registry_delegate_check;
ALTER TABLE settings_registry ADD CONSTRAINT settings_registry_delegate_check
  CHECK (delegate = ANY (ARRAY['org'::text, 'grants'::text, 'routing'::text]));
UPDATE settings_registry SET delegate = 'routing'
 WHERE category = 'models' AND key LIKE 'orchestrator.%_model'
   AND delegate IS DISTINCT FROM 'routing';

-- ---------------------------------------------------------------------------
-- 8. Grants — selection fns are orchestrator/runtime-facing (definer);
--    mutation fn callable by authenticated (actor wall inside).
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION fn_select_model(text, uuid, text, int, numeric, uuid, boolean, boolean) FROM anon;
REVOKE ALL ON FUNCTION fn_model_fallback(text, text, text, uuid, boolean) FROM anon;
REVOKE ALL ON FUNCTION fn_update_routing(text, jsonb, text) FROM anon;
GRANT EXECUTE ON FUNCTION fn_update_routing(text, jsonb, text) TO authenticated;

COMMIT;

-- ROLLBACK PLAN (spec §23): DROP FUNCTION fn_update_routing, fn_model_fallback,
-- fn_select_model, fn_risk_rank, fn_routing_mechanical_slots, fn_routing_slots;
-- DELETE FROM routing_rules WHERE task_class LIKE 'slot.%';
-- UPDATE model_catalog SET fallback_of = NULL;
-- UPDATE settings_registry SET delegate = NULL WHERE delegate = 'routing';
-- (delegate CHECK may keep the extended list — additive, harmless.)
