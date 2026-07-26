-- W2.5 second defect fix, same turn (CEO rule: fix it the moment you see it).
--
-- MEASURED on the first live autonomous harvest, task a7038a28 (2026-07-26
-- 16:48:12 → 16:49:00, `task_events` 34791-34810): the plan named "build one
-- halal-evidence dossier … (riba, gharar, forbidden sector)" and the pre-task
-- hook screened the objective, hit the term `riba` under `const.halal_screen`,
-- and fail-closed. The escalation ladder then retried the same task five times
-- — retry-same-tier → specialist → head-review → … → BLOCKED — and the row
-- died as `failed`. Zero agent_runs rows exist for it: every attempt was
-- refused before a run could be born.
--
-- The screen is CORRECT and stays exactly as it is: §11 Islamic boundaries are
-- immutable and CEO-only, and a machine that softens a fail-closed gate to make
-- its own work run is the worst outcome available here. The defect is on the
-- generator's side: it minted work the constitution can never let a worker do.
--
-- The house already ruled on this class — "the outward queue refuses at birth
-- what it cannot execute" (commit 750956b). So the door now runs the SAME
-- screen, against the SAME policy row, with the same letter-boundary semantics,
-- and refuses the step at birth with `halal_screen` + the term that matched.
-- The CEO sees a named refusal instead of five silent escalation rounds.

BEGIN;

-- The screen itself, extracted so the door and any later caller read ONE list:
-- `hook_policies.const.halal_screen`, the row the pre-task gate uses. Returns
-- the matching {category, term} or NULL when the text is clean.
CREATE OR REPLACE FUNCTION public.fn_halal_screen_hit(p_text text)
RETURNS jsonb LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT jsonb_build_object('category', c.category, 'term', t.term)
    FROM hook_policies p,
         LATERAL jsonb_each(p.rule -> 'categories') AS c(category, terms),
         LATERAL jsonb_array_elements_text(c.terms) AS t(term)
   WHERE p.id = 'const.halal_screen'
     AND p.enabled
     AND jsonb_typeof(c.terms) = 'array'
     AND lower(COALESCE(p_text, '')) ~ (
           '(^|[^[:alnum:]])'
           -- the term is data, not a pattern: a stray metacharacter must match
           -- itself, never change the match
           || regexp_replace(lower(t.term), '([][(){}.*+?^$|\\-])', '\\\1', 'g')
           || '([^[:alnum:]]|$)')
   LIMIT 1;
$$;

-- The door, re-declared with the at-birth screen. Body identical to migration
-- 20260726014500 except the new skip branch and its detail on the skip entry.
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
  IF v_actor NOT IN ('system', 'ceo') THEN
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

COMMIT;

-- ROLLBACK:
--   DROP FUNCTION IF EXISTS public.fn_halal_screen_hit(text);
--   (control_work_generate reverts to migration 20260726014500)
