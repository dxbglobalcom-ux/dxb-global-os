-- E12.5 activation contract — CEO rulings D10/D11 of 2026-07-18
-- (00-CEO-DIRECTIVE-REVENUE-FIRST §3-bis; adaptation ledger U17).
-- Three concerns, each measured live before authoring:
--
-- (1) D10 fourth field: tasks carried objective / output_contract /
--     budget_max_tokens / budget_max_cost_eur NOT NULL since birth (65/65 live
--     rows, 0 nulls measured 2026-07-18) but had NO deadline. `due_at` lands
--     with a 7-day default SLA; the CHECK pins it after creation time.
--     Backfill = created_at + 7 days (recorded convention — pre-ruling rows
--     had no deadline truth to restore, so the default SLA is applied).
--
-- (2) HR machine entry for pre-machine stock: 143 dormant rows predate the
--     E5.4b machine; fn_hr_create_employee cannot birth them again (slug
--     collision on existing rows), and HR spec :145 forbids off-ledger bulk
--     import ("scripted but through the same fns; no off-ledger path").
--     fn_hr_machine_intake writes the SAME three equipment rows as
--     create-employee steps 4-6 (shapes verbatim) and moves dormant→draft,
--     audited + broadcast per the §4 transition law. The probation → active
--     road stays untouched: equipment 7/7 gate, real probation task, scored
--     evaluation.
--
-- (3) fn_hr_assign_probation_task amended: the probation task now carries
--     due_at from `hr.probation_max_days` (global settings value, seeded 14)
--     — the probation window IS the task deadline.

BEGIN;

-- (1) D10: deadline column ----------------------------------------------------
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_at timestamptz;
UPDATE tasks SET due_at = created_at + interval '7 days' WHERE due_at IS NULL;
ALTER TABLE tasks ALTER COLUMN due_at SET DEFAULT now() + interval '7 days';
ALTER TABLE tasks ALTER COLUMN due_at SET NOT NULL;
DO $$ BEGIN
  ALTER TABLE tasks ADD CONSTRAINT tasks_due_after_creation
    CHECK (due_at > created_at);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- (2) machine entry for pre-machine dormant stock ------------------------------
CREATE OR REPLACE FUNCTION public.fn_hr_machine_intake(
  p_employee_id uuid,
  p_actor       text DEFAULT 'hr-factory'::text
) RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_status text;
  v_slug   text;
  v_dept   text;
BEGIN
  SELECT employment_status, slug, department INTO v_status, v_slug, v_dept
    FROM public.agents WHERE id = p_employee_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'hr.intake: employee % not found', p_employee_id;
  END IF;
  IF v_status <> 'dormant' THEN
    RAISE EXCEPTION 'hr.intake: employee % in % — only pre-machine dormant stock enters here',
      v_slug, v_status;
  END IF;

  -- equipment rows: SAME shapes as fn_hr_create_employee steps 4-6 (E5.4b).
  -- WHERE NOT EXISTS instead of bare INSERT: stock rows may carry partial
  -- provisioning from earlier waves — idempotent re-entry is legal, silent
  -- overwrite is not.
  INSERT INTO public.settings_values (key, scope, value, updated_by)
  SELECT 'hr.grant_package', 'employee:' || p_employee_id::text,
         jsonb_build_object('status', 'pending_library',
                            'template', 'department:' || v_dept),
         p_actor
   WHERE NOT EXISTS (SELECT 1 FROM public.settings_values
                      WHERE key = 'hr.grant_package'
                        AND scope = 'employee:' || p_employee_id::text);

  INSERT INTO public.settings_values (key, scope, value, updated_by)
  SELECT 'hr.litellm_key_alias', 'employee:' || p_employee_id::text,
         jsonb_build_object('alias', 'emp-' || v_slug, 'status', 'key_pending'),
         p_actor
   WHERE NOT EXISTS (SELECT 1 FROM public.settings_values
                      WHERE key = 'hr.litellm_key_alias'
                        AND scope = 'employee:' || p_employee_id::text);

  INSERT INTO public.settings_values (key, scope, value, updated_by)
  SELECT 'hr.employee_budget', 'employee:' || p_employee_id::text,
         jsonb_build_object('monthly_cap_eur', 5, 'source', 'default'),
         p_actor
   WHERE NOT EXISTS (SELECT 1 FROM public.settings_values
                      WHERE key = 'hr.employee_budget'
                        AND scope = 'employee:' || p_employee_id::text);

  UPDATE public.agents SET employment_status = 'draft', updated_at = now()
   WHERE id = p_employee_id;

  UPDATE public.employee_records
     SET version_history = version_history ||
           jsonb_build_object('event', 'machine_intake', 'by', p_actor, 'at', now()),
         updated_at = now()
   WHERE employee_id = p_employee_id;

  INSERT INTO public.audit_log (actor, actor_type, action, payload)
  VALUES (p_actor, 'system', 'employee.machine_intake',
          jsonb_build_object('employee_id', p_employee_id, 'slug', v_slug));
  PERFORM public.notify_broadcast('org', 'employee.machine_intake',
          jsonb_build_object('employee_id', p_employee_id, 'slug', v_slug));

  RETURN 'draft';
END;
$function$;

-- (3) probation task carries the probation-window deadline ---------------------
CREATE OR REPLACE FUNCTION public.fn_hr_assign_probation_task(p_employee_id uuid, p_objective text, p_output_contract text, p_actor text DEFAULT 'hr-factory'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_status  text;
  v_ok      boolean;
  v_passed  boolean;
  v_project uuid;
  v_task    uuid;
  v_dept    text;
  v_missing text;
  v_window  integer;
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

  -- D10 amendment: the probation window is the task deadline
  SELECT (sv.value)::integer INTO v_window
    FROM public.settings_values sv
   WHERE sv.key = 'hr.probation_max_days' AND sv.scope = 'global';
  v_window := COALESCE(v_window, 14);

  SELECT id INTO v_project FROM public.projects WHERE slug = 'hr-sandbox';
  INSERT INTO public.tasks (department, agent_id, objective, output_contract,
                            model_tier, approval_class, status, project_id, due_at)
  VALUES (v_dept, p_employee_id, 'HR probation: ' || p_objective, p_output_contract,
          'L3', 'none', 'queued', v_project, now() + make_interval(days => v_window))
  RETURNING id INTO v_task;

  INSERT INTO public.audit_log (actor, actor_type, action, payload)
  VALUES (p_actor, 'system', 'employee.probation_task_assigned',
          jsonb_build_object('employee_id', p_employee_id, 'task_id', v_task));

  RETURN v_task;
END;
$function$;

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_due_after_creation;
-- ALTER TABLE tasks DROP COLUMN IF EXISTS due_at;
-- DROP FUNCTION IF EXISTS public.fn_hr_machine_intake(uuid, text);
-- -- fn_hr_assign_probation_task: re-apply the 0020x body (due_at column gone,
-- -- so the amended INSERT would fail — restore the original from
-- -- 20260712008000_hr_factory_fns_e54b.sql).
-- COMMIT;
