-- Ledger 10d/10e (C10 decision): the CEO inspects/replaces the responsible
-- brain of a revenue portfolio from Operations. Responsibility hangs on
-- revenue_engines.owner_department (REVENUE_ENGINE_SPEC §4) — but no door
-- existed to SET it, so "who works on it" could never be answered.
-- Registered adaptation (recorded in REVENUE_ENGINE_SPEC §5): the engine
-- control-seam family gains control_engine_set_owner — CEO-only
-- (fn_org_actor, same gate as control_org_assign_model_group), validated
-- against departments, audited (audit_log + decision_log).

CREATE OR REPLACE FUNCTION public.control_engine_set_owner(
  p_slug text, p_department text, p_rationale text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_audit bigint;
BEGIN
  IF v_actor IS DISTINCT FROM 'ceo' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM revenue_engines WHERE slug = p_slug) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown engine');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM departments WHERE slug = p_department) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown department');
  END IF;

  UPDATE revenue_engines
     SET owner_department = p_department, updated_at = now()
   WHERE slug = p_slug;

  INSERT INTO decision_log (decided_by, decision, rationale, risk)
  VALUES ('ceo', 'engine.owner: ' || p_slug || ' → ' || p_department,
          coalesce(p_rationale, 'CEO engine ownership assignment'), 'medium');

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES ('ceo', 'ceo', 'engine.owner.assigned',
          jsonb_build_object('engine', p_slug, 'department', p_department,
                             'rationale', coalesce(p_rationale, 'CEO engine ownership assignment')))
  RETURNING id INTO v_audit;

  RETURN jsonb_build_object('ok', true, 'engine', p_slug,
                            'department', p_department, 'audit_id', v_audit);
END $$;

REVOKE ALL ON FUNCTION public.control_engine_set_owner(text, text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.control_engine_set_owner(text, text, text) TO authenticated, service_role;
