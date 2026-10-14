-- B64 plan step 1, second item (CEO-approved plan, 2026-10-14) — NO ONE WHO HAS NOT LOGGED IN CAN CALL A
-- FUNCTION THAT WRITES.
--
-- Measured before this file (bench 54422, read-only and in rolled-back transactions, 2026-10-14):
--   · thirteen SECURITY DEFINER writers in public held EXECUTE for anon — the role a browser gets before
--     it signs in (PostgREST, measured through the bench's rest container: role GUC 'anon', session_user
--     'authenticator');
--   · fn_org_actor() (20260712014000:74) read `current_user IN ('service_role','postgres')` — inside a
--     definer current_user is always the owner, so anon counted as 'system' for all 27 doors that ask it;
--   · control_work_generate (20260726015000) refused with `IF v_actor NOT IN ('system','ceo')` — a NULL
--     actor makes that test NULL, and plpgsql's IF treats NULL as false: an unnamed caller went through;
--   · every function the postgres login creates in public was born anon-executable twice over: the
--     per-schema default row (postgres, public, f) carries anon=X again although 20260717070000:316
--     revoked it — and PostgreSQL's built-in GLOBAL default hands EXECUTE to PUBLIC.
--     A per-schema REVOKE cannot take away what the global default gives (measured: a probe function
--     created after `... IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon` still carried
--     =X/postgres), so the global row is written too.
--
-- Callers, each read before its grant changed: the dashboard routes (api/chat, api/voice/daemon,
-- api/ai/simulate) ride the signed-in user's JWT after auth.getUser() — authenticated; the runtime
-- (orchestrator, voice daemon, revenue discovery, kernel model selection) runs through kysely on the
-- postgres login; the hr/persona scripts run psql -U postgres; fn_chat_session_for_new_message is also
-- called from fn_chat_post_message, a definer. No caller uses the anon role. authenticated and
-- service_role keep EXECUTE exactly as today.
--
-- Idempotent: safe to run 2×.

BEGIN;

-- ── who is calling ───────────────────────────────────────────────────────────────────────────────────
-- The caller's role is read from the `role` setting, which SET ROLE and PostgREST both write and a
-- definer does not change (current_user does); with no SET ROLE it is the login itself.
-- 'ceo'    — a request carrying a user id from a signed-in role (authenticated via the dashboard; the
--            postgres login or service_role carrying one, as the suites do) — today's rule, kept;
-- 'system' — service_role, or the postgres login (the resident scheduler, the runtime, the chain);
-- NULL     — anyone else: anon, an authenticated request with no user id, any other login.
-- Every door that asks refuses NULL (IS NULL / IS DISTINCT FROM 'ceo'; control_work_generate below).
CREATE OR REPLACE FUNCTION public.fn_org_actor()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role text := nullif(current_setting('role', true), 'none');
BEGIN
  v_role := coalesce(v_role, session_user::text);
  RETURN CASE
    WHEN v_role IN ('authenticated', 'service_role', 'postgres') AND auth.uid() IS NOT NULL THEN 'ceo'
    WHEN v_role IN ('service_role', 'postgres') THEN 'system'
  END;
END $$;

-- The work door, re-declared so an unnamed caller is refused. Body identical to migration
-- 20260726015000 except the actor line: `v_actor IS NULL OR` added.
CREATE OR REPLACE FUNCTION public.control_work_generate(
  p_plan_task_id uuid, p_steps jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_plan tasks%ROWTYPE;
  v_project_status text; v_project_name text;
  v_max int; v_idx int := 0; v_made int := 0; v_capped int := 0;
  v_step jsonb; v_text text; v_tr text; v_do text; v_dept text; v_owner uuid; v_task uuid;
  v_generated jsonb := '[]'::jsonb;
  v_skipped jsonb := '[]'::jsonb;
  v_brief text; v_reason text; v_detail text; v_hit jsonb; v_audit bigint;
BEGIN
  IF v_actor IS NULL OR v_actor NOT IN ('system', 'ceo') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'work generation runs as the OS or by CEO hand only');
  END IF;

  IF NOT COALESCE((resolve_setting('orchestration.autogen.enabled'))::text = 'true', true) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'DISABLED',
      'detail', 'orchestration.autogen.enabled is off — the CEO stopped self-generated work');
  END IF;

  SELECT * INTO v_plan FROM tasks WHERE id = p_plan_task_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PLAN_NOT_FOUND');
  END IF;
  IF v_plan.status <> 'done' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PLAN_NOT_DONE',
      'detail', 'plan task is ' || v_plan.status || ' — an unfinished plan is not a plan');
  END IF;
  IF v_plan.project_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PROJECT_NOT_ACTIVE',
      'detail', 'plan hangs off no project — orphan work is refused at birth');
  END IF;
  SELECT status, name INTO v_project_status, v_project_name
    FROM projects WHERE id = v_plan.project_id;
  IF v_project_status IS NULL OR v_project_status NOT IN ('draft', 'active') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PROJECT_NOT_ACTIVE',
      'detail', 'project is ' || COALESCE(v_project_status, 'missing')
             || ' — stopping the bet stops the work (W2.4)');
  END IF;

  IF EXISTS (SELECT 1 FROM generated_work WHERE plan_task_id = p_plan_task_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ALREADY_GENERATED',
      'detail', 'this plan already opened its work',
      'existing', (SELECT count(*) FROM generated_work
                    WHERE plan_task_id = p_plan_task_id AND task_id IS NOT NULL));
  END IF;

  IF p_steps IS NULL OR jsonb_typeof(p_steps) <> 'array' OR jsonb_array_length(p_steps) = 0 THEN
    INSERT INTO generated_work (plan_task_id, project_id, step_index, task_id, department,
                                reason, digest)
    VALUES (p_plan_task_id, v_plan.project_id, -1, NULL, NULL, 'no_steps',
            md5('no_steps|' || p_plan_task_id::text));
    INSERT INTO audit_log (actor, actor_type, action, payload)
    VALUES ('orchestration.autogen', 'system', 'orchestration.work.no_steps',
            jsonb_build_object('plan_task_id', p_plan_task_id,
                               'project_id', v_plan.project_id));
    RETURN jsonb_build_object('ok', false, 'error', 'NO_STEPS',
      'detail', 'the finished plan named no executable step', 'marked', true);
  END IF;

  v_max := GREATEST(COALESCE(fn_setting_numeric('orchestration.autogen.max_steps', 3), 3), 0)::int;

  FOR v_step IN SELECT * FROM jsonb_array_elements(p_steps) LOOP
    v_idx := v_idx + 1;
    v_reason := NULL;
    v_detail := NULL;
    v_text := btrim(COALESCE(v_step ->> 'title', v_step ->> 'step', ''));
    v_tr := NULLIF(btrim(COALESCE(v_step ->> 'tr', '')), '');
    v_do := NULLIF(btrim(COALESCE(v_step ->> 'do', '')), '');
    v_dept := lower(btrim(COALESCE(v_step ->> 'owner', '')));

    IF v_made >= v_max THEN
      v_reason := 'capped';
      v_capped := v_capped + 1;
    ELSIF v_text = '' THEN
      v_reason := 'empty_step';
    ELSIF NOT EXISTS (SELECT 1 FROM departments WHERE slug = v_dept) THEN
      v_reason := 'unknown_department';
    ELSE
      -- The constitution's own screen, run BEFORE the row exists. A hit here
      -- would be a hook fail-close later; the difference is that this refusal
      -- carries the term and costs zero escalation rounds.
      v_hit := fn_halal_screen_hit(v_text || ' ' || COALESCE(v_do, ''));
      IF v_hit IS NOT NULL THEN
        v_reason := 'halal_screen';
        v_detail := 'flagged term "' || (v_hit ->> 'term') || '" (category '
                 || (v_hit ->> 'category') || ') — the pre-task gate is immutable (§11), '
                 || 'so this step cannot be executed as written; the CEO decides, not the OS';
      ELSIF EXISTS (
        SELECT 1 FROM tasks t
         WHERE t.project_id = v_plan.project_id
           AND t.status IN ('inbox','queued','claimed','running','review','awaiting_approval')
           AND t.label = left(v_text, 80)
      ) THEN
        v_reason := 'duplicate';
      ELSE
        SELECT a.id INTO v_owner
          FROM agents a
         WHERE a.department = v_dept AND a.employment_status = 'active'
         ORDER BY (a.role_level = 'director') DESC,
                  (a.role_level = 'senior_specialist') DESC,
                  a.slug
         LIMIT 1;
        IF v_owner IS NULL THEN
          v_reason := 'no_staff';
        END IF;
      END IF;
    END IF;

    IF v_reason IS NOT NULL THEN
      INSERT INTO generated_work (plan_task_id, project_id, step_index, task_id, department,
                                  reason, digest)
      VALUES (p_plan_task_id, v_plan.project_id, v_idx, NULL, NULLIF(v_dept, ''), v_reason,
              md5(v_idx::text || '|' || v_text));
      v_skipped := v_skipped
        || (jsonb_build_object('step_index', v_idx, 'reason', v_reason)
            || CASE WHEN v_detail IS NULL THEN '{}'::jsonb
                    ELSE jsonb_build_object('detail', v_detail) END);
      CONTINUE;
    END IF;

    v_brief := 'This task was opened by the holding itself from the finished plan "'
      || COALESCE(v_plan.label, left(v_plan.objective, 80)) || '" for project "'
      || v_project_name || '".' || E'\n\n'
      || 'YOUR STEP: ' || v_text || E'\n'
      || COALESCE(v_do || E'\n', '') || E'\n'
      || 'HARD BOUNDARIES (unchanged from the plan that ordered this step):' || E'\n'
      || '· Every outward action — money leaving, a contract, an email to a stranger,'
      || ' ad spend — goes through the approval gate. Never bypass it, never ask for a bypass.'
      || E'\n'
      || '· Stay inside the holding''s Islamic boundaries; they are constitutional.' || E'\n'
      || '· Spend no capital beyond €' || fn_revenue_capital_limit()::text
      || ' — raising that ceiling is the CEO''s decision alone.' || E'\n'
      || '· If the step turns out to need a decision rather than execution, STOP and say so'
      || ' in BLOCKERS. Executing a decision nobody took is the worst outcome available.';

    INSERT INTO tasks (department, agent_id, project_id, parent_task_id, objective,
                       output_contract, label, label_tr, model_tier, approval_class,
                       status, priority, budget_max_tokens)
    VALUES (v_dept, v_owner, v_plan.project_id, p_plan_task_id, v_brief,
            'Write PLAIN TEXT — no json, no code fences. Exactly these blocks, in order:'
              || E'\n' || 'RESULT: <what now exists that did not before>' || E'\n'
              || 'EVIDENCE: <where it can be seen — url, row, file, screenshot ref>' || E'\n'
              || 'NEXT: <the single next step, and who owns it>' || E'\n'
              || 'BLOCKERS: <what stopped you, or NONE>' || E'\n'
              || 'END',
            left(v_text, 80), left(COALESCE(v_tr, v_text), 80),
            v_plan.model_tier, 'none', 'queued', 6, 120000)
    RETURNING id INTO v_task;

    INSERT INTO generated_work (plan_task_id, project_id, step_index, task_id, department,
                                reason, digest)
    VALUES (p_plan_task_id, v_plan.project_id, v_idx, v_task, v_dept, NULL,
            md5(v_idx::text || '|' || v_text));

    v_generated := v_generated || jsonb_build_object('task_id', v_task,
                                                     'step_index', v_idx,
                                                     'department', v_dept);
    v_made := v_made + 1;
  END LOOP;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES ('orchestration.autogen', 'system', 'orchestration.work.generated',
          jsonb_build_object('plan_task_id', p_plan_task_id,
                             'project_id', v_plan.project_id,
                             'generated', v_made,
                             'skipped', jsonb_array_length(v_skipped),
                             'capped', v_capped,
                             'tasks', v_generated,
                             'refusals', v_skipped))
  RETURNING id INTO v_audit;

  IF v_made > 0 THEN
    PERFORM notify_broadcast('ops', 'work.generated',
      jsonb_build_object('plan_task_id', p_plan_task_id, 'project_id', v_plan.project_id,
        'generated', v_made,
        'summary_en', 'The holding opened ' || v_made::text || ' task(s) from its own plan',
        'summary_tr', 'Holding kendi planından ' || v_made::text || ' görev açtı'));
  END IF;

  RETURN jsonb_build_object('ok', true, 'plan_task_id', p_plan_task_id,
                            'project_id', v_plan.project_id, 'audit_id', v_audit,
                            'generated', v_generated, 'skipped', v_skipped,
                            'capped', v_capped);
END $$;

-- ── the writers ──────────────────────────────────────────────────────────────────────────────────────
REVOKE ALL ON FUNCTION public.control_ceo_briefing_post(text, date, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.control_opportunity_register(text, text, text, text, numeric, jsonb, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.control_voice_call_log(jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.control_voice_daemon_set_state(text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.control_voice_identity_retire(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.control_voice_identity_upsert(text, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_approvals_supersede_sweep() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_chat_post_message(text, text, uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_chat_session_for_new_message(text, boolean, int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_hr_machine_intake(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_model_fallback(text, text, text, uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_persona_bind(uuid, uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_select_model(text, uuid, text, int, numeric, uuid, boolean, boolean, uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.control_ceo_briefing_post(text, date, text, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.control_opportunity_register(text, text, text, text, numeric, jsonb, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.control_voice_call_log(jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.control_voice_daemon_set_state(text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.control_voice_identity_retire(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.control_voice_identity_upsert(text, text, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_approvals_supersede_sweep() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_chat_post_message(text, text, uuid, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_chat_session_for_new_message(text, boolean, int) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_hr_machine_intake(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_model_fallback(text, text, text, uuid, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_persona_bind(uuid, uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_select_model(text, uuid, text, int, numeric, uuid, boolean, boolean, uuid) TO authenticated, service_role;

-- ── what does not exist yet ──────────────────────────────────────────────────────────────────────────
-- Only the postgres creator is touched — the rows measured carrying the grant. The schema row loses
-- anon; the global row loses PUBLIC (the only place PostgreSQL lets that built-in default be removed).
-- Roles the schema row names explicitly (authenticated, service_role, the stack's own) keep EXECUTE on
-- new public functions; supabase_admin's defaults are untouched.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

COMMIT;

-- ROLLBACK PLAN: re-apply fn_org_actor from 20260712014000 (section 1) and control_work_generate from
-- 20260726015000; GRANT EXECUTE ON each function above TO anon; ALTER DEFAULT PRIVILEGES FOR ROLE postgres
-- IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon; ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT
-- EXECUTE ON FUNCTIONS TO PUBLIC — which re-opens every door this file closes; do not without his word.
