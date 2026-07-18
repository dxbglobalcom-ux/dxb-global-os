-- E12.5 activation contract amendment — pre-machine DRAFT stock (U17 cont.)
--
-- Measured gap (2026-07-18, same session as 090000): 55 rows were born
-- employment_status='draft' by the D-wave migrations BEFORE the E5.4b machine
-- existed — they are inside the machine's state space but carry none of the
-- three equipment rows, and no fn can provision them: fn_hr_create_employee
-- collides on slug, fn_hr_machine_intake (090000) accepts only 'dormant'.
--
-- Amendment: fn_hr_machine_intake v2 —
--   dormant           → provision equipment rows + move to draft (unchanged)
--   draft, incomplete → provision MISSING equipment rows only; status stays
--                       draft; version_history event 'equipment_backfill'
--   draft, complete   → error (nothing to do — calling it is a caller bug)
--   anything else     → error (unchanged)

BEGIN;

CREATE OR REPLACE FUNCTION public.fn_hr_machine_intake(
  p_employee_id uuid,
  p_actor       text DEFAULT 'hr-factory'::text
) RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_status  text;
  v_slug    text;
  v_dept    text;
  v_added   integer := 0;
  v_event   text;
BEGIN
  SELECT employment_status, slug, department INTO v_status, v_slug, v_dept
    FROM public.agents WHERE id = p_employee_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'hr.intake: employee % not found', p_employee_id;
  END IF;
  IF v_status NOT IN ('dormant', 'draft') THEN
    RAISE EXCEPTION 'hr.intake: employee % in % — only pre-machine dormant/draft stock enters here',
      v_slug, v_status;
  END IF;

  -- equipment rows: SAME shapes as fn_hr_create_employee steps 4-6 (E5.4b).
  INSERT INTO public.settings_values (key, scope, value, updated_by)
  SELECT 'hr.grant_package', 'employee:' || p_employee_id::text,
         jsonb_build_object('status', 'pending_library',
                            'template', 'department:' || v_dept),
         p_actor
   WHERE NOT EXISTS (SELECT 1 FROM public.settings_values
                      WHERE key = 'hr.grant_package'
                        AND scope = 'employee:' || p_employee_id::text);
  v_added := v_added + (CASE WHEN FOUND THEN 1 ELSE 0 END);

  INSERT INTO public.settings_values (key, scope, value, updated_by)
  SELECT 'hr.litellm_key_alias', 'employee:' || p_employee_id::text,
         jsonb_build_object('alias', 'emp-' || v_slug, 'status', 'key_pending'),
         p_actor
   WHERE NOT EXISTS (SELECT 1 FROM public.settings_values
                      WHERE key = 'hr.litellm_key_alias'
                        AND scope = 'employee:' || p_employee_id::text);
  v_added := v_added + (CASE WHEN FOUND THEN 1 ELSE 0 END);

  INSERT INTO public.settings_values (key, scope, value, updated_by)
  SELECT 'hr.employee_budget', 'employee:' || p_employee_id::text,
         jsonb_build_object('monthly_cap_eur', 5, 'source', 'default'),
         p_actor
   WHERE NOT EXISTS (SELECT 1 FROM public.settings_values
                      WHERE key = 'hr.employee_budget'
                        AND scope = 'employee:' || p_employee_id::text);
  v_added := v_added + (CASE WHEN FOUND THEN 1 ELSE 0 END);

  IF v_status = 'draft' AND v_added = 0 THEN
    RAISE EXCEPTION 'hr.intake: employee % already draft with complete equipment — nothing to do', v_slug;
  END IF;

  IF v_status = 'dormant' THEN
    UPDATE public.agents SET employment_status = 'draft', updated_at = now()
     WHERE id = p_employee_id;
    v_event := 'machine_intake';
  ELSE
    v_event := 'equipment_backfill';
  END IF;

  UPDATE public.employee_records
     SET version_history = version_history ||
           jsonb_build_object('event', v_event, 'by', p_actor, 'at', now()),
         updated_at = now()
   WHERE employee_id = p_employee_id;

  INSERT INTO public.audit_log (actor, actor_type, action, payload)
  VALUES (p_actor, 'system', 'employee.' || v_event,
          jsonb_build_object('employee_id', p_employee_id, 'slug', v_slug,
                             'equipment_rows_added', v_added));
  PERFORM public.notify_broadcast('org', 'employee.' || v_event,
          jsonb_build_object('employee_id', p_employee_id, 'slug', v_slug));

  RETURN 'draft';
END;
$function$;

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- -- restore the 090000 body (dormant-only guard) by re-running its
-- -- CREATE OR REPLACE FUNCTION public.fn_hr_machine_intake block.
-- COMMIT;
