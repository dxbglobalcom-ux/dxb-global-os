-- W2.5 defect fix, same turn as the defect (CEO rule: "bozuk bişey farkederseniz
-- MUTLAKA o an düzeltin"). Measured on the FIRST live autonomous harvest
-- (2026-07-26 16:45:43Z, plan f724848a): the three generated tasks carried
-- `length(label) = 120` in both languages, hard-cut mid-word by `left(text,120)`,
-- against a house standard of 41-45 characters (the four newest hand-written
-- rows measured 41, 42, 42, 45). That is the exact class the CEO already ruled
-- on in W2.2 — "a full brief was rendering as the row's label" — and the cut
-- happens at the DATA SOURCE, which the minimalism ruling forbids.
--
-- The fix is not a shorter truncation; a cut is a cut. The plan now writes the
-- headline itself, in both languages, next to the full instruction:
--
--   1) <title ≤60 chars> | owner: <dept> | tr: <Turkish title> | do: <full instruction>
--
-- so the row label is SHORT AND COMPLETE, and the brief the worker executes
-- keeps every bit of the detail. Old-shape plans (no `do:` leg) still parse —
-- their title carries both jobs, as it did before.

BEGIN;

CREATE OR REPLACE FUNCTION public.fn_plan_step_contract()
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT 'Write PLAIN TEXT — no json, no code fences. Exactly these blocks, in order:'
      || E'\n' || 'STEPS' || E'\n'
      || '1) <title> | owner: <department> | tr: <title in Turkish> | do: <full instruction>' || E'\n'
      || '2) <title> | owner: <department> | tr: <title in Turkish> | do: <full instruction>' || E'\n'
      || '3) <title> | owner: <department> | tr: <title in Turkish> | do: <full instruction>' || E'\n'
      || 'FIRST_REVENUE: <the first paid event, and how it is recorded>' || E'\n'
      || 'GAPS: <skill/tool/seat you need, or NONE>' || E'\n'
      || 'STOP_IF: <the result that means stop>' || E'\n'
      || 'END' || E'\n'
      || 'RULES FOR THE STEP LINE:' || E'\n'
      || '· <title> is a HEADLINE: imperative, at most 60 characters, complete in itself. '
      || 'It becomes the row the CEO reads on his board — a sentence that gets cut is a defect.' || E'\n'
      || '· <tr> is the same headline in Turkish, same length limit. It is mandatory: the CEO '
      || 'reads the board in Turkish.' || E'\n'
      || '· <do> carries ALL the detail: what to produce, from what, and what "finished" means. '
      || 'Write it as an instruction to that department, not as a note to yourself.' || E'\n'
      || '· <department> must be an existing department slug, and the step must be startable '
      || 'on its own by that one department.';
$$;

-- The door, re-declared with the title/detail split. Body identical to
-- migration 20260726014000 except: the step's headline and its instruction are
-- now separate fields, so nothing is truncated to make a row fit.
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
  v_brief text; v_reason text; v_audit bigint;
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
    -- `title` is the headline; `step` stays accepted as its older name so a
    -- plan written before this migration still generates work.
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

    IF v_reason IS NOT NULL THEN
      INSERT INTO generated_work (plan_task_id, project_id, step_index, task_id, department,
                                  reason, digest)
      VALUES (p_plan_task_id, v_plan.project_id, v_idx, NULL, NULLIF(v_dept, ''), v_reason,
              md5(v_idx::text || '|' || v_text));
      v_skipped := v_skipped || jsonb_build_object('step_index', v_idx, 'reason', v_reason);
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
            -- 80 is the BACKSTOP, not the design: the contract asks for ≤60 and
            -- the plan writes the headline itself, so nothing normally reaches it.
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
                             'tasks', v_generated))
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
--   (both functions revert to migration 20260726014000)
