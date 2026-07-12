-- 20260712008000_hr_factory_fns_e54b.sql — E5.4b: HR-factory fn infrastructure
-- Normative: HR_OPERATING_SYSTEM_SPEC §2/§4/§6/§13/§16/§21/§24 + EMPLOYEE_PERSONA_STANDARD (activation lock).
-- K1 step (Fable/GPT 5.6 solo) — authored by Fable in person.
--
-- REGISTERED ADAPTATIONS (spec text vs live schema — recorded, not silent):
--  A1. Spec §6-6 "budgets(scope='employee')": no budgets table exists (DATA_MODEL evolved to
--      budget_state singleton + cost_ledger + tasks.budget_*). Employee budget line lives in
--      settings_values(key='hr.employee_budget', scope='employee:<uuid>') — same audit/registry
--      pattern, no new table (spec §11 "yeni tablo YOK" honored).
--  A2. Spec §6-5 LiteLLM virtual key: provisioning is proxy-side (outside DB). DB carries the
--      alias + status marker in settings_values('hr.litellm_key_alias'); created as 'key_pending'
--      (spec §17 eventual pattern), equipment item e5 passes only at status='ready' — the
--      draft employee cannot reach probation keyless, exactly as §17 requires.
--  A3. Spec §25: before the 0024x library population, the grant step passes with a
--      'pending_library' marker — implemented as settings_values('hr.grant_package');
--      fn_hr_grant upgrades the marker to 'granted' when real library_grants land.
--      MCP side: role template = department default-deny profile (gateway policy grants.json);
--      DB check = agents.mcp_profile set.
--  A4. Spec §24-4 pg-boss schedules: queue+schedule rows seeded here idempotently so the
--      verification query answers now; worker handlers ship in packages/hr + outbox-executor
--      scheduler (same commit) and attach at next scheduler boot (pg-boss schedule() upserts
--      the same names — no conflict).
--  A5. Persona task (spec §6-7): fn_persona_submit cannot be queued as a DB job in the founding
--      period (K2 — Fable authors in person). The create fn queues a tasks-row authorship task
--      (inbox, hr-sandbox project); equipment item e7 = authorship task exists OR personas row exists.
-- Idempotent throughout; ROLLBACK block at end.

BEGIN;

-- ============================================================
-- 0) settings registry + global defaults (§4 thresholds, §13 autonomy flag)
-- ============================================================
INSERT INTO public.settings_registry (key, category, value_schema, risk, requires_approval, description_en, description_tr)
VALUES
  ('hr.probation_pass_score', 'hr', '{"type":"number","minimum":0,"maximum":1}', 'medium', false,
   'Minimum evaluation score for probation->active', 'Probation->active geçişi için asgari değerlendirme skoru'),
  ('hr.probation_max_days', 'hr', '{"type":"integer","minimum":1}', 'low', false,
   'Days in probation before forced-evaluation alert', 'Zorunlu değerlendirme uyarısından önce probation gün sınırı'),
  ('hr.autonomous_hiring', 'hr', '{"type":"boolean"}', 'critical', true,
   'Allow non-CEO actors to create employees (founding default: false)', 'CEO-dışı aktörlerin çalışan yaratmasına izin (kuruluş varsayılanı: false)'),
  ('hr.employee_budget', 'hr', '{"type":"object"}', 'medium', false,
   'Per-employee budget line (equipment item 6)', 'Çalışan-başı bütçe satırı (donanım kalemi 6)'),
  ('hr.litellm_key_alias', 'hr', '{"type":"object"}', 'high', false,
   'Per-employee LiteLLM virtual-key alias + provisioning status (equipment item 5)', 'Çalışan-başı LiteLLM sanal anahtar takma adı + durum (donanım kalemi 5)'),
  ('hr.grant_package', 'hr', '{"type":"object"}', 'high', false,
   'Per-employee grant-package marker (equipment item 4; pending_library per HR spec S25)', 'Çalışan-başı grant paketi işareti (donanım kalemi 4)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings_values (key, scope, value, updated_by)
VALUES
  ('hr.probation_pass_score', 'global', '0.7', 'fable-5'),
  ('hr.probation_max_days',   'global', '14',  'fable-5'),
  ('hr.autonomous_hiring',    'global', 'false', 'fable-5')
ON CONFLICT (key, scope) DO NOTHING;

-- ============================================================
-- 1) HR sandbox project (probation test tasks live under it — §2 "Test görevleri")
-- ============================================================
INSERT INTO public.projects (slug, name, purpose, company_id, status)
SELECT 'hr-sandbox', 'HR Sandbox', 'Probation test tasks — real work, sandboxed evaluation context (HR spec S2).', c.id, 'active'
  FROM public.companies c WHERE c.slug = 'dxb-global'
   AND NOT EXISTS (SELECT 1 FROM public.projects WHERE slug = 'hr-sandbox');

-- ============================================================
-- 2) v_hr_equipment_check — the 7-item birth-equipment checklist (§6)
-- ============================================================
CREATE OR REPLACE VIEW public.v_hr_equipment_check AS
SELECT a.id AS employee_id,
       a.slug,
       a.employment_status,
       (a.role_level IS NOT NULL AND (a.manager_id IS NOT NULL OR a.role = 'head'))          AS e1_org_row,
       EXISTS (SELECT 1 FROM public.employee_records er WHERE er.employee_id = a.id)          AS e2_record,
       (a.hook_version IS NOT NULL)                                                           AS e3_hook,
       (a.mcp_profile IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.settings_values sv
           WHERE sv.key = 'hr.grant_package' AND sv.scope = 'employee:' || a.id::text))       AS e4_grants,
       EXISTS (SELECT 1 FROM public.settings_values sv
                WHERE sv.key = 'hr.litellm_key_alias' AND sv.scope = 'employee:' || a.id::text
                  AND sv.value->>'status' = 'ready')                                          AS e5_litellm_key,
       EXISTS (SELECT 1 FROM public.settings_values sv
                WHERE sv.key = 'hr.employee_budget' AND sv.scope = 'employee:' || a.id::text) AS e6_budget,
       (EXISTS (SELECT 1 FROM public.personas p WHERE p.employee_id = a.id)
        OR EXISTS (SELECT 1 FROM public.tasks t
                    WHERE t.agent_id = a.id AND t.objective LIKE 'HR: author persona%'))      AS e7_persona_task,
       ((a.role_level IS NOT NULL AND (a.manager_id IS NOT NULL OR a.role = 'head'))
        AND EXISTS (SELECT 1 FROM public.employee_records er WHERE er.employee_id = a.id)
        AND a.hook_version IS NOT NULL
        AND (a.mcp_profile IS NOT NULL AND EXISTS (
               SELECT 1 FROM public.settings_values sv
                WHERE sv.key = 'hr.grant_package' AND sv.scope = 'employee:' || a.id::text))
        AND EXISTS (SELECT 1 FROM public.settings_values sv
                     WHERE sv.key = 'hr.litellm_key_alias' AND sv.scope = 'employee:' || a.id::text
                       AND sv.value->>'status' = 'ready')
        AND EXISTS (SELECT 1 FROM public.settings_values sv
                     WHERE sv.key = 'hr.employee_budget' AND sv.scope = 'employee:' || a.id::text)
        AND (EXISTS (SELECT 1 FROM public.personas p WHERE p.employee_id = a.id)
             OR EXISTS (SELECT 1 FROM public.tasks t
                         WHERE t.agent_id = a.id AND t.objective LIKE 'HR: author persona%'))) AS all_ok
  FROM public.agents a
 WHERE a.employment_status <> 'archived';

-- ============================================================
-- 3) v_hr_roster — staffing table backing the HR panel (§7)
-- ============================================================
CREATE OR REPLACE VIEW public.v_hr_roster AS
SELECT a.id AS employee_id, a.slug, a.department, a.role, a.role_level,
       a.employment_status, a.brain, a.hook_version, a.persona_version,
       m.slug AS manager_slug,
       p.quality_gate AS persona_gate,
       eq.all_ok AS equipment_ok,
       a.created_at, a.updated_at
  FROM public.agents a
  LEFT JOIN public.agents m ON m.id = a.manager_id
  LEFT JOIN public.personas p ON p.id = a.persona_id
  LEFT JOIN public.v_hr_equipment_check eq ON eq.employee_id = a.id
 WHERE a.employment_status <> 'archived';

-- ============================================================
-- 4) v_hr_probation_queue — pending evaluations (§7)
-- ============================================================
CREATE OR REPLACE VIEW public.v_hr_probation_queue AS
SELECT a.id AS employee_id, a.slug, a.department,
       GREATEST(0, EXTRACT(day FROM now() - a.updated_at))::integer AS days_in_probation,
       (SELECT COALESCE((sv.value)::numeric, 14) FROM public.settings_values sv
         WHERE sv.key = 'hr.probation_max_days' AND sv.scope = 'global') AS max_days,
       (GREATEST(0, EXTRACT(day FROM now() - a.updated_at)) >
        (SELECT COALESCE((sv.value)::numeric, 14) FROM public.settings_values sv
          WHERE sv.key = 'hr.probation_max_days' AND sv.scope = 'global'))                    AS overdue,
       (SELECT count(*) FROM public.tasks t
         WHERE t.agent_id = a.id AND t.status IN ('inbox','queued','claimed','running'))      AS open_tasks,
       (SELECT t.id FROM public.tasks t
         WHERE t.agent_id = a.id AND t.objective LIKE 'HR probation:%'
         ORDER BY t.created_at DESC LIMIT 1)                                                  AS latest_probation_task
  FROM public.agents a
 WHERE a.employment_status = 'probation';

-- ============================================================
-- 5) fn_hr_create_employee — the atomic 7-step birth (§6; unequipped birth = impossible)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_hr_create_employee(
  p_slug             text,
  p_department       text,
  p_role             text DEFAULT 'worker',
  p_role_level       text DEFAULT 'specialist',
  p_manager_slug     text DEFAULT NULL,
  p_brain            text DEFAULT 'glm-5.2',
  p_responsibilities text[] DEFAULT NULL,
  p_authority_limits text[] DEFAULT NULL,
  p_actor            text DEFAULT 'hr-factory'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id         uuid;
  v_manager    uuid;
  v_autonomous boolean;
  v_project    uuid;
BEGIN
  -- §13: founding period — creation is CEO-gated unless hr.autonomous_hiring=true
  SELECT COALESCE((sv.value)::boolean, false) INTO v_autonomous
    FROM public.settings_values sv
   WHERE sv.key = 'hr.autonomous_hiring' AND sv.scope = 'global';
  IF NOT v_autonomous AND p_actor NOT IN ('ceo', 'fable-5') THEN
    RAISE EXCEPTION 'hr.create: autonomous hiring disabled — actor % requires CEO gate', p_actor;
  END IF;

  IF EXISTS (SELECT 1 FROM public.agents WHERE slug = p_slug) THEN
    RAISE EXCEPTION 'hr.create: slug % already exists', p_slug;
  END IF;

  -- orphan ban (ORG rule): worker needs a manager — explicit or department director
  IF p_role <> 'head' THEN
    IF p_manager_slug IS NOT NULL THEN
      SELECT id INTO v_manager FROM public.agents WHERE slug = p_manager_slug;
      IF v_manager IS NULL THEN
        RAISE EXCEPTION 'hr.create: manager slug % not found', p_manager_slug;
      END IF;
    ELSE
      SELECT director_id INTO v_manager FROM public.departments WHERE slug = p_department;
      IF v_manager IS NULL THEN
        RAISE EXCEPTION 'hr.create: no manager resolvable for % (dept % has no director)', p_slug, p_department;
      END IF;
    END IF;
  END IF;

  -- step 1: agents row (draft) — ORG rules applied above
  INSERT INTO public.agents (slug, department, role, role_level, employment_status,
                             manager_id, brain, mcp_profile, hook_version,
                             persona_path, persona_version, status)
  VALUES (p_slug, p_department, p_role, p_role_level, 'draft',
          v_manager, p_brain, 'inherit', 'v1',
          'personas/' || p_department || '/' || p_slug || '.md', 'v0-hr', 'dormant')
  RETURNING id INTO v_id;

  -- step 2: employee_records skeleton
  INSERT INTO public.employee_records (employee_id, responsibilities, authority_limits, version_history)
  VALUES (v_id, p_responsibilities, p_authority_limits,
          jsonb_build_array(jsonb_build_object('event', 'created', 'by', p_actor, 'at', now())));

  -- step 3 is the hook_version in the agents INSERT (FABLE_5_HOOK current = v1)

  -- step 4: grant package marker (A3 — pending_library until 0024x items land)
  INSERT INTO public.settings_values (key, scope, value, updated_by)
  VALUES ('hr.grant_package', 'employee:' || v_id::text,
          jsonb_build_object('status', 'pending_library', 'template', 'department:' || p_department),
          p_actor);

  -- step 5: LiteLLM virtual-key alias (A2 — eventual provisioning, key_pending)
  INSERT INTO public.settings_values (key, scope, value, updated_by)
  VALUES ('hr.litellm_key_alias', 'employee:' || v_id::text,
          jsonb_build_object('alias', 'emp-' || p_slug, 'status', 'key_pending'),
          p_actor);

  -- step 6: budget line (A1)
  INSERT INTO public.settings_values (key, scope, value, updated_by)
  VALUES ('hr.employee_budget', 'employee:' || v_id::text,
          jsonb_build_object('monthly_cap_eur', 5, 'source', 'default'),
          p_actor);

  -- step 7: persona authorship task (A5 — K2: authored in person, queued as work)
  SELECT id INTO v_project FROM public.projects WHERE slug = 'hr-sandbox';
  INSERT INTO public.tasks (department, agent_id, objective, output_contract,
                            model_tier, approval_class, status, project_id)
  VALUES (p_department, v_id,
          'HR: author persona for ' || p_slug || ' (authorship period rules apply — K2)',
          'personas/' || p_department || '/' || p_slug || '.md authored, gated, bound',
          'L4', 'none', 'inbox', v_project);

  INSERT INTO public.audit_log (actor, actor_type, action, payload)
  VALUES (p_actor, 'system', 'employee.created',
          jsonb_build_object('employee_id', v_id, 'slug', p_slug, 'department', p_department,
                             'role_level', p_role_level));
  PERFORM public.notify_broadcast('org', 'employee.created',
          jsonb_build_object('employee_id', v_id, 'slug', p_slug, 'department', p_department));

  RETURN v_id;
END;
$$;

-- ============================================================
-- 6) fn_hr_grant — library grant + package marker upgrade (§2 grant modules)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_hr_grant(
  p_employee_id uuid,
  p_item_id     uuid,
  p_actor       text DEFAULT 'ceo'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.agents WHERE id = p_employee_id AND employment_status <> 'archived') THEN
    RAISE EXCEPTION 'hr.grant: employee % not found or archived', p_employee_id;
  END IF;

  INSERT INTO public.library_grants (item_id, grantee_kind, grantee_id, granted_by)
  VALUES (p_item_id, 'employee', p_employee_id::text, p_actor)
  ON CONFLICT (item_id, grantee_kind, grantee_id) DO NOTHING;

  UPDATE public.settings_values
     SET value = jsonb_set(value, '{status}', '"granted"'), updated_by = p_actor, updated_at = now()
   WHERE key = 'hr.grant_package' AND scope = 'employee:' || p_employee_id::text;

  INSERT INTO public.audit_log (actor, actor_type, action, payload)
  VALUES (p_actor, 'system', 'employee.granted',
          jsonb_build_object('employee_id', p_employee_id, 'item_id', p_item_id));
  PERFORM public.notify_broadcast('org', 'employee.granted',
          jsonb_build_object('employee_id', p_employee_id, 'item_id', p_item_id));
END;
$$;

-- ============================================================
-- 7) fn_hr_assign_probation_task — draft→probation gate + sandbox task (§4/§6)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_hr_assign_probation_task(
  p_employee_id     uuid,
  p_objective       text,
  p_output_contract text,
  p_actor           text DEFAULT 'hr-factory'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status  text;
  v_ok      boolean;
  v_passed  boolean;
  v_project uuid;
  v_task    uuid;
  v_dept    text;
  v_missing text;
BEGIN
  SELECT employment_status, department INTO v_status, v_dept
    FROM public.agents WHERE id = p_employee_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'hr.probation: employee % not found', p_employee_id;
  END IF;
  IF v_status NOT IN ('draft', 'probation') THEN
    RAISE EXCEPTION 'hr.probation: employee in % — only draft|probation eligible', v_status;
  END IF;

  IF v_status = 'draft' THEN
    -- §4 transition rule: equipment 7/7 AND persona passed
    SELECT all_ok INTO v_ok FROM public.v_hr_equipment_check WHERE employee_id = p_employee_id;
    SELECT EXISTS (SELECT 1 FROM public.personas
                    WHERE employee_id = p_employee_id AND quality_gate = 'passed') INTO v_passed;
    IF NOT COALESCE(v_ok, false) OR NOT v_passed THEN
      SELECT string_agg(item, ', ') INTO v_missing FROM (
        SELECT unnest(ARRAY[
          CASE WHEN NOT e1_org_row       THEN 'e1_org_row' END,
          CASE WHEN NOT e2_record        THEN 'e2_record' END,
          CASE WHEN NOT e3_hook          THEN 'e3_hook' END,
          CASE WHEN NOT e4_grants        THEN 'e4_grants' END,
          CASE WHEN NOT e5_litellm_key   THEN 'e5_litellm_key' END,
          CASE WHEN NOT e6_budget        THEN 'e6_budget' END,
          CASE WHEN NOT e7_persona_task  THEN 'e7_persona_task' END]) AS item
          FROM public.v_hr_equipment_check WHERE employee_id = p_employee_id
      ) s WHERE item IS NOT NULL;
      RAISE EXCEPTION 'hr.probation: draft->probation blocked — missing: %; persona passed: %',
        COALESCE(v_missing, 'none'), v_passed;
    END IF;

    UPDATE public.agents SET employment_status = 'probation', updated_at = now()
     WHERE id = p_employee_id;
    UPDATE public.employee_records
       SET version_history = version_history || jsonb_build_object('event', 'probation_started', 'by', p_actor, 'at', now()),
           updated_at = now()
     WHERE employee_id = p_employee_id;
    PERFORM public.notify_broadcast('org', 'employee.probation_started',
            jsonb_build_object('employee_id', p_employee_id));
  END IF;

  SELECT id INTO v_project FROM public.projects WHERE slug = 'hr-sandbox';
  INSERT INTO public.tasks (department, agent_id, objective, output_contract,
                            model_tier, approval_class, status, project_id)
  VALUES (v_dept, p_employee_id, 'HR probation: ' || p_objective, p_output_contract,
          'L3', 'none', 'queued', v_project)
  RETURNING id INTO v_task;

  INSERT INTO public.audit_log (actor, actor_type, action, payload)
  VALUES (p_actor, 'system', 'employee.probation_task_assigned',
          jsonb_build_object('employee_id', p_employee_id, 'task_id', v_task));

  RETURN v_task;
END;
$$;

-- ============================================================
-- 8) fn_hr_evaluate — probation verdict (§4: probation→active | stay | archive)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_hr_evaluate(
  p_employee_id uuid,
  p_score       numeric,
  p_notes       text DEFAULT NULL,
  p_actor       text DEFAULT 'hr-factory'
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status    text;
  v_threshold numeric;
  v_passed    boolean;
  v_result    text;
BEGIN
  SELECT employment_status INTO v_status FROM public.agents WHERE id = p_employee_id;
  IF v_status IS DISTINCT FROM 'probation' THEN
    RAISE EXCEPTION 'hr.evaluate: employee in % — only probation is evaluable', COALESCE(v_status, 'missing');
  END IF;
  IF p_score < 0 OR p_score > 1 THEN
    RAISE EXCEPTION 'hr.evaluate: score % outside [0,1]', p_score;
  END IF;

  SELECT COALESCE((sv.value)::numeric, 0.7) INTO v_threshold
    FROM public.settings_values sv
   WHERE sv.key = 'hr.probation_pass_score' AND sv.scope = 'global';

  -- aligned with the G3 activation lock (enforce_persona_gate_on_activation):
  -- activation requires a BOUND persona_id (the trigger guarantees bound = passed)
  SELECT (a.persona_id IS NOT NULL) INTO v_passed
    FROM public.agents a WHERE a.id = p_employee_id;

  IF p_score >= v_threshold AND v_passed THEN
    UPDATE public.agents SET employment_status = 'active', updated_at = now()
     WHERE id = p_employee_id;
    v_result := 'active';
    PERFORM public.notify_broadcast('org', 'employee.activated',
            jsonb_build_object('employee_id', p_employee_id, 'score', p_score));
  ELSE
    v_result := 'probation'; -- correction round (§4 FAIL branch — archive/suspend via ORG fns)
  END IF;

  UPDATE public.employee_records
     SET performance_history = performance_history ||
           jsonb_build_object('event', 'probation_evaluation', 'score', p_score,
                              'threshold', v_threshold, 'result', v_result,
                              'notes', COALESCE(p_notes, ''), 'by', p_actor, 'at', now()),
         updated_at = now()
   WHERE employee_id = p_employee_id;

  INSERT INTO public.audit_log (actor, actor_type, action, payload)
  VALUES (p_actor, 'system', 'employee.evaluated',
          jsonb_build_object('employee_id', p_employee_id, 'score', p_score,
                             'threshold', v_threshold, 'result', v_result));

  RETURN v_result;
END;
$$;

-- ============================================================
-- 9) fn_hr_promote — role_level raise; director+ CEO-gated (§2/§13)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_hr_promote(
  p_employee_id    uuid,
  p_new_role_level text,
  p_actor          text DEFAULT 'hr-factory'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current text;
  v_dept    text;
  v_slug    text;
  v_project uuid;
  v_rank_cur  integer;
  v_rank_new  integer;
BEGIN
  SELECT role_level, department, slug INTO v_current, v_dept, v_slug
    FROM public.agents WHERE id = p_employee_id AND employment_status <> 'archived';
  IF v_current IS NULL THEN
    RAISE EXCEPTION 'hr.promote: employee % not found or archived', p_employee_id;
  END IF;

  v_rank_cur := array_position(ARRAY['sub_agent','ops_agent','specialist','senior_specialist','director','orchestrator'], v_current);
  v_rank_new := array_position(ARRAY['sub_agent','ops_agent','specialist','senior_specialist','director','orchestrator'], p_new_role_level);
  IF v_rank_new IS NULL THEN
    RAISE EXCEPTION 'hr.promote: unknown role_level %', p_new_role_level;
  END IF;
  IF v_rank_new <= COALESCE(v_rank_cur, 0) THEN
    RAISE EXCEPTION 'hr.promote: % -> % is not a promotion', v_current, p_new_role_level;
  END IF;
  IF p_new_role_level IN ('director', 'orchestrator') AND p_actor <> 'ceo' THEN
    RAISE EXCEPTION 'hr.promote: director+ promotion requires CEO approval (actor %)', p_actor;
  END IF;

  UPDATE public.agents SET role_level = p_new_role_level, updated_at = now()
   WHERE id = p_employee_id;

  UPDATE public.employee_records
     SET version_history = version_history ||
           jsonb_build_object('event', 'promoted', 'from', v_current, 'to', p_new_role_level,
                              'by', p_actor, 'at', now()),
         updated_at = now()
   WHERE employee_id = p_employee_id;

  -- §2: promotion opens a persona-revision task
  SELECT id INTO v_project FROM public.projects WHERE slug = 'hr-sandbox';
  INSERT INTO public.tasks (department, agent_id, objective, output_contract,
                            model_tier, approval_class, status, project_id)
  VALUES (v_dept, p_employee_id,
          'HR: persona revision after promotion of ' || v_slug || ' to ' || p_new_role_level,
          'persona v-next authored, gated, re-bound (authorship period rules apply)',
          'L4', 'none', 'inbox', v_project);

  INSERT INTO public.audit_log (actor, actor_type, action, payload)
  VALUES (p_actor, 'system', 'employee.promoted',
          jsonb_build_object('employee_id', p_employee_id, 'from', v_current, 'to', p_new_role_level));
  PERFORM public.notify_broadcast('org', 'employee.promoted',
          jsonb_build_object('employee_id', p_employee_id, 'to', p_new_role_level));
END;
$$;

-- ============================================================
-- 10) authorization — control seam only (same pattern as persona fns)
-- ============================================================
REVOKE ALL ON FUNCTION public.fn_hr_create_employee(text,text,text,text,text,text,text[],text[],text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_hr_grant(uuid,uuid,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_hr_assign_probation_task(uuid,text,text,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_hr_evaluate(uuid,numeric,text,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_hr_promote(uuid,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_hr_create_employee(text,text,text,text,text,text,text[],text[],text) TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_hr_grant(uuid,uuid,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_hr_assign_probation_task(uuid,text,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_hr_evaluate(uuid,numeric,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_hr_promote(uuid,text,text) TO service_role;

-- ============================================================
-- 11) pg-boss HR job queues + schedules (A4 — handlers attach at next scheduler boot)
-- ============================================================
-- queue rows: clone the standard-policy template row (version-proof against pg-boss column set)
INSERT INTO pgboss.queue
SELECT (jsonb_populate_record(t, jsonb_build_object('name', v.q, 'created_on', now(), 'updated_on', now()))).*
  FROM (SELECT q FROM pgboss.queue q WHERE q.name = 'lease-reaper') AS tmpl(t),
       (VALUES ('hr.performance_daily'), ('hr.probation_check'),
               ('hr.stale_persona_scan'), ('hr.training_queue')) AS v(q)
 WHERE NOT EXISTS (SELECT 1 FROM pgboss.queue x WHERE x.name = v.q);

INSERT INTO pgboss.schedule (name, key, cron, timezone)
SELECT v.n, '', v.c, 'UTC'
  FROM (VALUES ('hr.performance_daily', '30 2 * * *'),
               ('hr.probation_check',   '0 6 * * *'),
               ('hr.stale_persona_scan','0 5 * * *'),
               ('hr.training_queue',    '0 7 * * *')) AS v(n, c)
 WHERE NOT EXISTS (SELECT 1 FROM pgboss.schedule s WHERE s.name = v.n);

COMMIT;

-- ROLLBACK:
-- DROP FUNCTION IF EXISTS public.fn_hr_create_employee(text,text,text,text,text,text,text[],text[],text);
-- DROP FUNCTION IF EXISTS public.fn_hr_grant(uuid,uuid,text);
-- DROP FUNCTION IF EXISTS public.fn_hr_assign_probation_task(uuid,text,text,text);
-- DROP FUNCTION IF EXISTS public.fn_hr_evaluate(uuid,numeric,text,text);
-- DROP FUNCTION IF EXISTS public.fn_hr_promote(uuid,text,text);
-- DROP VIEW IF EXISTS public.v_hr_probation_queue;
-- DROP VIEW IF EXISTS public.v_hr_roster;
-- DROP VIEW IF EXISTS public.v_hr_equipment_check;
-- DELETE FROM pgboss.schedule WHERE name LIKE 'hr.%';
-- DELETE FROM pgboss.queue WHERE name LIKE 'hr.%';
-- DELETE FROM public.settings_values WHERE key LIKE 'hr.%';
-- DELETE FROM public.settings_registry WHERE key LIKE 'hr.%';
-- DELETE FROM public.projects WHERE slug = 'hr-sandbox'
--   AND NOT EXISTS (SELECT 1 FROM tasks WHERE project_id = projects.id);
