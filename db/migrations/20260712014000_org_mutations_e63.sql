-- ============================================================================
-- 20260712014000 — E6.3: Org mutation seam (control_org_*) + v_org_graph
-- ORGANIZATION_ENGINE_SPEC §6/§9/§11 · API_CONTRACTS §8/§13 · roadmap E6.3
--
-- Registered adaptations (master-plan fidelity — visible, never silent):
--   A1. Function names use control_org_* (API_CONTRACTS `control_{alan}_
--       {eylem}`, same seam idiom as E6.1 control_settings_*) — SPEC §6
--       lists them as fn_org_*; the API contract is the later, normative
--       naming layer.
--   A2. Org changes carry their trail in audit_log (SPEC §6: change their
--       own trace via detail_ref — no settings_change_log rows). Undo is
--       therefore NOT one-click here; every mutation has an inverse op.
--   A3. v_org_graph excludes sub_agents (SPEC §4: only LIVE sub-agents,
--       derived from agent_runs.parent_run_id — that derivation lands with
--       graph v2 alongside drag-drop; v1 is read-only).
--   A4. Suspend does not sync-disable the LiteLLM virtual key yet: the
--       pre-task gate already reads employment_status (E5.4b hook), and the
--       key-disable job lands with the COST_CONTROL /key/update pattern.
--   A5. move_employee appends to employee_records.version_history (the
--       "sicil" row of SPEC §6) only when the HR record exists — legacy
--       agents without records still move.
--
-- ROLLBACK:
--   DROP VIEW IF EXISTS v_org_graph;
--   DROP FUNCTION IF EXISTS control_org_create_company(text,text,text,text);
--   DROP FUNCTION IF EXISTS control_org_create_department(text,text,uuid,uuid,text);
--   DROP FUNCTION IF EXISTS control_org_assign_director(uuid,uuid,text);
--   DROP FUNCTION IF EXISTS control_org_move_employee(uuid,text,uuid,text);
--   DROP FUNCTION IF EXISTS control_org_suspend_employee(uuid,text,text);
--   DROP FUNCTION IF EXISTS control_org_reactivate_employee(uuid,text);
--   DROP FUNCTION IF EXISTS control_org_assign_model_group(text,uuid[],text,text);
--   DROP FUNCTION IF EXISTS control_org_archive_employee(uuid,text);
--   DROP FUNCTION IF EXISTS fn_org_actor();
--   DROP TRIGGER IF EXISTS trg_agents_manager_cycle ON agents;
--   DROP FUNCTION IF EXISTS fn_org_manager_cycle_guard();
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Manager-cycle guard (SPEC §4): the manager chain may never loop or
--    self-reference. Trigger-level so NO write path can create a cycle.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_org_manager_cycle_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_cursor uuid;
  v_hops int := 0;
BEGIN
  IF NEW.manager_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.manager_id = NEW.id THEN
    RAISE EXCEPTION 'ORG_MANAGER_CYCLE: employee cannot be their own manager';
  END IF;
  v_cursor := NEW.manager_id;
  WHILE v_cursor IS NOT NULL AND v_hops < 32 LOOP
    IF v_cursor = NEW.id THEN
      RAISE EXCEPTION 'ORG_MANAGER_CYCLE: manager chain loops back to employee %', NEW.id;
    END IF;
    SELECT manager_id INTO v_cursor FROM agents WHERE id = v_cursor;
    v_hops := v_hops + 1;
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_agents_manager_cycle ON public.agents;
CREATE TRIGGER trg_agents_manager_cycle
  BEFORE INSERT OR UPDATE OF manager_id ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.fn_org_manager_cycle_guard();

-- ---------------------------------------------------------------------------
-- 1. Shared actor resolution (same rule as control_settings_set):
--    authenticated session = the CEO (single-human OS); service_role /
--    postgres = system. SPEC §13: system may call ONLY move / suspend /
--    reactivate / archive (HR flows ride the same seam).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_org_actor()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN CASE
    WHEN auth.uid() IS NOT NULL THEN 'ceo'
    WHEN current_user IN ('service_role', 'postgres') THEN 'system'
  END;
END $$;

-- ---------------------------------------------------------------------------
-- 2. control_org_create_company (CEO only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.control_org_create_company(
  p_slug text, p_name text, p_mission text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('org_create_company|' || p_slug || '|' || p_name);
  v_prev record;
  v_id uuid;
  v_audit bigint;
  v_resp jsonb;
BEGIN
  IF v_actor IS DISTINCT FROM 'ceo' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
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
  IF EXISTS (SELECT 1 FROM companies WHERE slug = p_slug) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'company slug already exists');
  END IF;

  INSERT INTO companies (slug, name, mission) VALUES (p_slug, p_name, p_mission)
  RETURNING id INTO v_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, 'ceo', 'org.company.created',
          jsonb_build_object('company_id', v_id, 'slug', p_slug, 'name', p_name))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('org', 'company.created',
    jsonb_build_object('op', 'create_company', 'entity', 'company', 'id', v_id,
      'summary_en', 'Company ' || p_name || ' created',
      'summary_tr', p_name || ' şirketi kuruldu'));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit,
                               'affected', jsonb_build_array(v_id));
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- ---------------------------------------------------------------------------
-- 3. control_org_create_department (CEO only; parent must share the company)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.control_org_create_department(
  p_slug text, p_display_name text, p_company_id uuid,
  p_parent_id uuid DEFAULT NULL, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('org_create_department|' || p_slug || '|' || coalesce(p_company_id::text, ''));
  v_prev record;
  v_id uuid;
  v_audit bigint;
  v_resp jsonb;
BEGIN
  IF v_actor IS DISTINCT FROM 'ceo' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
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
  IF EXISTS (SELECT 1 FROM departments WHERE slug = p_slug) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'department slug already exists');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown company');
  END IF;
  IF p_parent_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM departments WHERE id = p_parent_id AND company_id = p_company_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'parent department must belong to the same company');
  END IF;

  INSERT INTO departments (slug, display_name, company_id, parent_id, status)
  VALUES (p_slug, p_display_name, p_company_id, p_parent_id, 'active')
  RETURNING id INTO v_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, 'ceo', 'org.department.created',
          jsonb_build_object('department_id', v_id, 'slug', p_slug,
                             'company_id', p_company_id, 'parent_id', p_parent_id))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('org', 'department.created',
    jsonb_build_object('op', 'create_department', 'entity', 'department', 'id', v_id,
      'summary_en', 'Department ' || p_display_name || ' created',
      'summary_tr', p_display_name || ' departmanı kuruldu'));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit,
                               'affected', jsonb_build_array(v_id));
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- ---------------------------------------------------------------------------
-- 4. control_org_assign_director (CEO only). Orphan-manager rule (SPEC §6):
--    the outgoing director's direct reports in this department are rebound
--    to the incoming director IN THE SAME transaction — no commit with a
--    dangling reporting chain.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.control_org_assign_director(
  p_department_id uuid, p_employee_id uuid, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('org_assign_director|' || p_department_id::text || '|' || p_employee_id::text);
  v_prev record;
  v_dept record;
  v_emp record;
  v_old uuid;
  v_rebound uuid[];
  v_audit bigint;
  v_resp jsonb;
BEGIN
  IF v_actor IS DISTINCT FROM 'ceo' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
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

  SELECT id, slug, director_id INTO v_dept FROM departments WHERE id = p_department_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'unknown department');
  END IF;
  SELECT id, department, role_level, employment_status INTO v_emp
    FROM agents WHERE id = p_employee_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'unknown employee');
  END IF;
  IF v_emp.role_level IS DISTINCT FROM 'director' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'employee is not role_level=director');
  END IF;
  IF v_emp.employment_status NOT IN ('active', 'probation') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'director candidate is not active (status: ' || v_emp.employment_status || ')');
  END IF;
  IF v_emp.department IS DISTINCT FROM v_dept.slug THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'director must already belong to the department — move them first');
  END IF;
  IF v_dept.director_id = p_employee_id THEN
    RETURN jsonb_build_object('ok', true, 'audit_id', NULL, 'noop', true,
                              'affected', '[]'::jsonb);
  END IF;

  v_old := v_dept.director_id;

  -- Rebind the outgoing director's direct reports (orphan-manager rule).
  IF v_old IS NOT NULL THEN
    WITH moved AS (
      UPDATE agents SET manager_id = p_employee_id, updated_at = now()
      WHERE manager_id = v_old AND department = v_dept.slug AND id <> p_employee_id
      RETURNING id
    ) SELECT coalesce(array_agg(id), '{}') INTO v_rebound FROM moved;
  ELSE
    v_rebound := '{}';
  END IF;

  UPDATE departments SET director_id = p_employee_id WHERE id = p_department_id;
  -- The director reports outside the department chain (to the orchestrator/
  -- CEO virtual root), never to themselves.
  UPDATE agents SET manager_id = NULL, updated_at = now() WHERE id = p_employee_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, 'ceo', 'org.director.assigned',
          jsonb_build_object('department_id', p_department_id, 'new_director', p_employee_id,
                             'old_director', v_old, 'rebound_reports', to_jsonb(v_rebound)))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('org', 'director.assigned',
    jsonb_build_object('op', 'assign_director', 'entity', 'department', 'id', p_department_id,
      'summary_en', 'Director assigned for ' || v_dept.slug,
      'summary_tr', v_dept.slug || ' departmanına müdür atandı'));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit,
    'affected', to_jsonb(array_prepend(p_employee_id, v_rebound)));
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- ---------------------------------------------------------------------------
-- 5. control_org_move_employee (CEO or system/HR). G6: running agent_runs
--    finish with their old context — nothing here touches runs. Row locks
--    serialize concurrent moves (SPEC §27).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.control_org_move_employee(
  p_employee_id uuid, p_new_department text, p_new_manager_id uuid DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('org_move_employee|' || p_employee_id::text || '|' ||
                       p_new_department || '|' || coalesce(p_new_manager_id::text, ''));
  v_prev record;
  v_emp record;
  v_dept record;
  v_manager record;
  v_manager_id uuid;
  v_audit bigint;
  v_resp jsonb;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
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

  SELECT id, slug, department, manager_id, employment_status INTO v_emp
    FROM agents WHERE id = p_employee_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'unknown employee');
  END IF;
  IF v_emp.employment_status = 'archived' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'archived employees cannot be moved');
  END IF;
  SELECT id, slug, director_id INTO v_dept FROM departments WHERE slug = p_new_department;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'unknown department');
  END IF;

  -- Manager rule (SPEC §4): the manager lives in the same department OR is
  -- that department's director. Default: the target department's director.
  v_manager_id := coalesce(p_new_manager_id, v_dept.director_id);
  IF v_manager_id IS NOT NULL THEN
    IF v_manager_id = p_employee_id THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'employee cannot be their own manager');
    END IF;
    SELECT id, department INTO v_manager FROM agents WHERE id = v_manager_id;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'unknown manager');
    END IF;
    IF v_manager.department IS DISTINCT FROM v_dept.slug
       AND v_manager_id IS DISTINCT FROM v_dept.director_id THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'manager must belong to the target department or be its director');
    END IF;
  END IF;
  IF v_emp.department = v_dept.slug AND v_emp.manager_id IS NOT DISTINCT FROM v_manager_id THEN
    RETURN jsonb_build_object('ok', true, 'audit_id', NULL, 'noop', true, 'affected', '[]'::jsonb);
  END IF;

  -- Cycle guard fires via trg_agents_manager_cycle on this UPDATE.
  UPDATE agents SET department = v_dept.slug, manager_id = v_manager_id, updated_at = now()
  WHERE id = p_employee_id;

  -- Personnel-file trail (A5): append to version_history when a record exists.
  UPDATE employee_records
  SET version_history = coalesce(version_history, '[]'::jsonb) || jsonb_build_object(
        'at', now(), 'event', 'moved',
        'from', v_emp.department, 'to', v_dept.slug,
        'manager', v_manager_id, 'by', v_actor),
      updated_at = now()
  WHERE employee_id = p_employee_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END, 'org.employee.moved',
          jsonb_build_object('employee_id', p_employee_id, 'from', v_emp.department,
                             'to', v_dept.slug, 'manager_id', v_manager_id))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('org', 'employee.moved',
    jsonb_build_object('op', 'move_employee', 'entity', 'employee', 'id', p_employee_id,
      'summary_en', v_emp.slug || ' moved to ' || v_dept.slug,
      'summary_tr', v_emp.slug || ' ' || v_dept.slug || ' departmanına taşındı'));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit,
                               'affected', jsonb_build_array(p_employee_id));
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- ---------------------------------------------------------------------------
-- 6. control_org_suspend_employee (CEO or system). New spawns are blocked by
--    the pre-task employment_status gate (E5.4b); running runs finish (G6).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.control_org_suspend_employee(
  p_employee_id uuid, p_reason text, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('org_suspend|' || p_employee_id::text || '|' || coalesce(p_reason, ''));
  v_prev record;
  v_emp record;
  v_audit bigint;
  v_resp jsonb;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'suspension requires a reason');
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

  SELECT id, slug, employment_status INTO v_emp FROM agents WHERE id = p_employee_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'unknown employee');
  END IF;
  IF v_emp.employment_status IN ('archived', 'suspended') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'employee is already ' || v_emp.employment_status);
  END IF;

  UPDATE agents SET employment_status = 'suspended', updated_at = now() WHERE id = p_employee_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END, 'org.employee.suspended',
          jsonb_build_object('employee_id', p_employee_id, 'reason', p_reason,
                             'previous_status', v_emp.employment_status))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('org', 'employee.suspended',
    jsonb_build_object('op', 'suspend_employee', 'entity', 'employee', 'id', p_employee_id,
      'summary_en', v_emp.slug || ' suspended',
      'summary_tr', v_emp.slug || ' askıya alındı'));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit,
                               'affected', jsonb_build_array(p_employee_id));
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- ---------------------------------------------------------------------------
-- 7. control_org_reactivate_employee — only if the persona quality gate is
--    still 'passed' (SPEC §6).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.control_org_reactivate_employee(
  p_employee_id uuid, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('org_reactivate|' || p_employee_id::text);
  v_prev record;
  v_emp record;
  v_gate text;
  v_audit bigint;
  v_resp jsonb;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
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

  SELECT id, slug, employment_status, persona_id INTO v_emp
    FROM agents WHERE id = p_employee_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'unknown employee');
  END IF;
  IF v_emp.employment_status <> 'suspended' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'only suspended employees can be reactivated (status: ' || v_emp.employment_status || ')');
  END IF;
  IF v_emp.persona_id IS NOT NULL THEN
    SELECT quality_gate INTO v_gate FROM personas WHERE id = v_emp.persona_id;
    IF v_gate IS DISTINCT FROM 'passed' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'persona quality gate is not passed (gate: ' || coalesce(v_gate, 'none') || ')');
    END IF;
  END IF;

  UPDATE agents SET employment_status = 'active', updated_at = now() WHERE id = p_employee_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END, 'org.employee.reactivated',
          jsonb_build_object('employee_id', p_employee_id))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('org', 'employee.reactivated',
    jsonb_build_object('op', 'reactivate_employee', 'entity', 'employee', 'id', p_employee_id,
      'summary_en', v_emp.slug || ' reactivated',
      'summary_tr', v_emp.slug || ' yeniden etkinleştirildi'));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit,
                               'affected', jsonb_build_array(p_employee_id));
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- ---------------------------------------------------------------------------
-- 8. control_org_assign_model_group (CEO only) — model must be catalog-live
--    and not banned; one decision_log row per employee (SPEC §6).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.control_org_assign_model_group(
  p_model_id text, p_employee_ids uuid[], p_rationale text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
    UPDATE agents SET brain = p_model_id, updated_at = now()
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
END $$;

-- ---------------------------------------------------------------------------
-- 9. control_org_archive_employee (CEO or system) — refused while the
--    employee has open tasks or running runs (handover first, SPEC §6).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.control_org_archive_employee(
  p_employee_id uuid, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('org_archive|' || p_employee_id::text);
  v_prev record;
  v_emp record;
  v_open int;
  v_audit bigint;
  v_resp jsonb;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
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

  SELECT id, slug, employment_status INTO v_emp FROM agents WHERE id = p_employee_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'unknown employee');
  END IF;
  IF v_emp.employment_status = 'archived' THEN
    RETURN jsonb_build_object('ok', true, 'audit_id', NULL, 'noop', true, 'affected', '[]'::jsonb);
  END IF;

  SELECT count(*) INTO v_open FROM (
    SELECT 1 FROM tasks
      WHERE agent_id = p_employee_id
        AND status IN ('queued', 'claimed', 'running', 'review', 'awaiting_approval')
    UNION ALL
    SELECT 1 FROM agent_runs
      WHERE employee_id = p_employee_id AND status = 'running'
  ) open_work;
  IF v_open > 0 THEN
    INSERT INTO audit_log (actor, actor_type, action, payload)
    VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END,
            'org.employee.archive.rejected',
            jsonb_build_object('employee_id', p_employee_id, 'open_work', v_open,
                               'reason', 'open tasks/runs — handover first'));
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'employee has ' || v_open || ' open task(s)/run(s) — hand over first');
  END IF;

  UPDATE agents SET employment_status = 'archived', status = 'dormant', updated_at = now()
  WHERE id = p_employee_id;
  -- A department can never keep an archived director.
  UPDATE departments SET director_id = NULL WHERE director_id = p_employee_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END, 'org.employee.archived',
          jsonb_build_object('employee_id', p_employee_id))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('org', 'employee.archived',
    jsonb_build_object('op', 'archive_employee', 'entity', 'employee', 'id', p_employee_id,
      'summary_en', v_emp.slug || ' archived',
      'summary_tr', v_emp.slug || ' arşivlendi'));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit,
                               'affected', jsonb_build_array(p_employee_id));
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- ---------------------------------------------------------------------------
-- 10. v_org_graph — whole topology in one query (SPEC §11 contract):
--     (node_id, kind, label, role_level, parent_node_id, status).
--     Employee parent = manager if set, else the department node.
--     sub_agents excluded (adaptation A3).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_org_graph AS
SELECT
  c.id::text            AS node_id,
  'company'             AS kind,
  c.name                AS label,
  NULL::text            AS role_level,
  NULL::text            AS parent_node_id,
  c.status              AS status,
  NULL::text            AS department,
  NULL::text            AS model
FROM companies c
UNION ALL
SELECT
  d.id::text,
  'department',
  d.display_name,
  NULL,
  coalesce(d.parent_id::text, d.company_id::text),
  d.status,
  d.slug,
  NULL
FROM departments d
UNION ALL
SELECT
  a.id::text,
  'employee',
  a.slug,
  a.role_level,
  coalesce(a.manager_id::text, d.id::text),
  a.employment_status,
  a.department,
  a.brain
FROM agents a
JOIN departments d ON d.slug = a.department
WHERE a.role_level IS DISTINCT FROM 'sub_agent';

GRANT SELECT ON public.v_org_graph TO authenticated;
REVOKE ALL ON public.v_org_graph FROM anon;

-- Execute grants: fns gate internally via fn_org_actor(); anon never.
GRANT EXECUTE ON FUNCTION public.control_org_create_company(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.control_org_create_department(text, text, uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.control_org_assign_director(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.control_org_move_employee(uuid, text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.control_org_suspend_employee(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.control_org_reactivate_employee(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.control_org_assign_model_group(text, uuid[], text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.control_org_archive_employee(uuid, text) TO authenticated;
REVOKE ALL ON FUNCTION public.control_org_create_company(text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.control_org_create_department(text, text, uuid, uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.control_org_assign_director(uuid, uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.control_org_move_employee(uuid, text, uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.control_org_suspend_employee(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.control_org_reactivate_employee(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.control_org_assign_model_group(text, uuid[], text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.control_org_archive_employee(uuid, text) FROM PUBLIC, anon;
