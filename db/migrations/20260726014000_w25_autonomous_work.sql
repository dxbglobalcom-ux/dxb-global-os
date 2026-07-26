-- W2.5 — AUTONOMOUS WORK GENERATION (AGENT_ORCHESTRATION_SPEC §3, §4, §13-15;
-- factory roadmap row 2.5).
--
-- Measured before this migration (2026-07-26): every task-creating path in the
-- repo begins at a human. `packages/orchestrator/src/dispatch.ts:54` writes
-- tasks from envelopes a CEO intent produced; `packages/dxb-mcp/src/groups/
-- queue.ts:41` runs inside a session a human already started; `packages/
-- revenue/src/discovery.ts:276` only fires on `trigger='ceo'` (line 208 keeps
-- the scheduled lane off by CEO order). NOTHING read a finished task's own
-- output to open the next one — so the W2.4 pilot plan was written, filed, and
-- executed by nobody. That is the line between a 24/7 OS and a very well
-- audited idle system.
--
-- This migration adds the missing path: MACHINE OUTPUT → MACHINE WORK. A plan
-- that a worker finished, inside a project the CEO already approved, becomes
-- staffed tasks in the departments the plan itself named. It never creates a
-- project, an objective, an opportunity or an allocation — those are decisions,
-- and decisions stay with the CEO (§13). It executes a decision already taken.
--
-- Three properties are load-bearing:
--   ONCE     — `generated_work` carries UNIQUE (plan_task_id, step_index), so a
--              second pass over the same plan CANNOT double-open work. The
--              idempotency is structural, not hopeful.
--   LOUD     — every refusal and every skipped step names its reason, and a cap
--              that truncates REPORTS what it dropped. A silent cap reads
--              afterwards as "covered everything".
--   STOPPABLE— the CEO owns a registered switch; a paused project refuses
--              generation the same way it already refuses dispatch (W2.4).

BEGIN;

-- ── 1. the ledger that makes "exactly once" structural ────────────────────
CREATE TABLE IF NOT EXISTS public.generated_work (
  id            bigserial PRIMARY KEY,
  plan_task_id  uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  project_id    uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  -- 1-based position in the plan's step list; -1 marks "this plan was read and
  -- carried no executable step", so the seam never loops on a dead plan.
  step_index    int NOT NULL,
  task_id       uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  department    text,
  -- why no task exists for this step, when none does: capped | duplicate |
  -- unknown_department | no_staff | empty_step | no_steps
  reason        text,
  digest        text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_task_id, step_index)
);

CREATE INDEX IF NOT EXISTS idx_generated_work_plan
  ON public.generated_work (plan_task_id);

ALTER TABLE public.generated_work ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.generated_work TO authenticated;
DROP POLICY IF EXISTS generated_work_read ON public.generated_work;
CREATE POLICY generated_work_read ON public.generated_work
  FOR SELECT TO authenticated USING (true);

-- ── 2. the CEO's switch and the CEO's cap ─────────────────────────────────
INSERT INTO public.settings_registry
  (key, category, value_schema, risk, requires_approval, cost_impact, affected_areas,
   description_en, description_tr, locked, scope_types, delegate)
VALUES
  ('orchestration.autogen.enabled', 'orchestration',
   '{"type":"boolean","default":true}',
   'medium', false, 'tokens', '{orchestration,tasks}',
   'When on, a finished plan opens its own next tasks inside an already-approved project (no new decisions, only execution)',
   'Açıkken, biten bir plan onaylanmış proje içinde kendi görevlerini açar (yeni karar değil, yalnız icra)',
   false, '{global}', NULL),
  ('orchestration.autogen.max_steps', 'orchestration',
   '{"type":"number","default":3}',
   'low', false, 'tokens', '{orchestration,tasks}',
   'Maximum tasks one plan may open in a single pass (a longer list is a thinner plan, not more work)',
   'Bir planın tek geçişte açabileceği en fazla görev sayısı (uzun liste daha çok iş değil, daha sığ plandır)',
   false, '{global}', NULL)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings_values (key, scope, value, updated_by)
VALUES
  ('orchestration.autogen.enabled', 'global', 'true'::jsonb, 'migration-w25'),
  ('orchestration.autogen.max_steps', 'global', '3'::jsonb, 'migration-w25')
ON CONFLICT DO NOTHING;

-- ── 3. the plan's output contract, in ONE place ───────────────────────────
-- W2.4 wrote this contract inline inside control_portfolio_allocate, which
-- meant changing it meant re-declaring a 120-line function. It lives here now:
-- the door below re-declares once, and every later change is this function.
-- The `tr:` leg is new and load-bearing — the model writing the plan is the
-- only cheap, accurate translator, and the CEO's board reads Turkish. Without
-- it every generated task would be born with an English label on a Turkish
-- surface (the i18n purity rule: DB text IS an i18n surface).
CREATE OR REPLACE FUNCTION public.fn_plan_step_contract()
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT 'Write PLAIN TEXT — no json, no code fences. Exactly these blocks, in order:'
      || E'\n' || 'STEPS' || E'\n'
      || '1) <step> | owner: <department> | tr: <the same step in Turkish>' || E'\n'
      || '2) <step> | owner: <department> | tr: <the same step in Turkish>' || E'\n'
      || '3) <step> | owner: <department> | tr: <the same step in Turkish>' || E'\n'
      || 'FIRST_REVENUE: <the first paid event, and how it is recorded>' || E'\n'
      || 'GAPS: <skill/tool/seat you need, or NONE>' || E'\n'
      || 'STOP_IF: <the result that means stop>' || E'\n'
      || 'END' || E'\n'
      || 'Each step is executed by ONE department and must be startable on its own. '
      || 'The owner must be an existing department slug; the tr leg is mandatory — '
      || 'the CEO reads the board in Turkish.';
$$;

-- ── 4. W2.4 door re-declared to read the contract from one place ──────────
-- Body identical to migration 20260726013000 except: v_contract now comes from
-- fn_plan_step_contract(), and the brief asks for the Turkish leg it requires.
CREATE OR REPLACE FUNCTION public.control_portfolio_allocate(
  p_objective_id uuid, p_opportunity_id uuid, p_expected_net_eur numeric DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('portfolio_allocate|' || p_objective_id::text || '|' || p_opportunity_id::text);
  v_prev record; v_opp opportunities%ROWTYPE; v_id uuid; v_audit bigint; v_resp jsonb;
  v_obj objectives%ROWTYPE;
  v_dept text; v_engine_title text;
  v_owner uuid; v_project uuid; v_task uuid; v_slug text;
  v_label text; v_label_tr text; v_purpose text; v_purpose_tr text;
  v_title_tr text; v_brief text; v_contract text; v_limit numeric;
BEGIN
  IF v_actor IS DISTINCT FROM 'ceo' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'portfolio allocation is CEO-only (§13)');
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
  SELECT * INTO v_obj FROM objectives WHERE id = p_objective_id AND status = 'active';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'allocation requires an ACTIVE objective');
  END IF;
  SELECT * INTO v_opp FROM opportunities WHERE id = p_opportunity_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;
  IF v_opp.halal_verdict <> 'halal' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'HALAL_GATE',
      'detail', 'allocation requires halal_verdict=halal (G2)');
  END IF;
  IF v_opp.state NOT IN ('shortlisted','piloting','scaling') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ILLEGAL_TRANSITION',
      'detail', 'allocation is legal from shortlisted|piloting|scaling');
  END IF;

  SELECT e.owner_department, e.title INTO v_dept, v_engine_title
    FROM revenue_engines e WHERE e.slug = v_opp.engine_slug;
  IF v_dept IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NO_OWNER',
      'detail', 'engine ' || v_opp.engine_slug || ' has no owner department — assign one from Operations first (§4)');
  END IF;

  SELECT a.id INTO v_owner
    FROM agents a
   WHERE a.department = v_dept AND a.employment_status = 'active'
   ORDER BY (a.role_level = 'director') DESC,
            (a.role_level = 'senior_specialist') DESC,
            a.slug
   LIMIT 1;
  IF v_owner IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NO_OWNER',
      'detail', 'department ' || v_dept || ' has no active employee to carry the work');
  END IF;

  INSERT INTO portfolio_allocations (objective_id, opportunity_id, expected_net_eur)
  VALUES (p_objective_id, p_opportunity_id, p_expected_net_eur)
  RETURNING id INTO v_id;

  v_title_tr := COALESCE(NULLIF(btrim(COALESCE(v_opp.title_tr, '')), ''), v_opp.title);
  v_slug := 'rev-' || v_opp.engine_slug || '-' || left(p_opportunity_id::text, 8);
  v_limit := fn_revenue_capital_limit();
  v_purpose := 'Revenue pilot committed by the CEO against objective "' || v_obj.title
            || '" (€' || v_obj.amount_eur::text || ' ' || v_obj.metric || '). Opportunity: '
            || v_opp.title || '. Expected contribution €'
            || COALESCE(p_expected_net_eur, 0)::text || '; capital ceiling €' || v_limit::text || '.';
  v_purpose_tr := 'CEO tarafından "' || v_obj.title || '" hedefine (€' || v_obj.amount_eur::text
            || ') bağlanan gelir pilotu. Fırsat: ' || v_title_tr || '. Beklenen katkı €'
            || COALESCE(p_expected_net_eur, 0)::text || '; sermaye tavanı €' || v_limit::text || '.';

  SELECT id INTO v_project FROM projects WHERE slug = v_slug;
  IF v_project IS NULL THEN
    INSERT INTO projects (slug, name, name_tr, purpose, purpose_tr, owner_employee_id, status, links)
    VALUES (v_slug, v_opp.title, v_title_tr, v_purpose, v_purpose_tr, v_owner, 'active',
            jsonb_build_object('allocation_id', v_id,
                               'objective_id', p_objective_id,
                               'opportunity_id', p_opportunity_id,
                               'engine', v_opp.engine_slug))
    RETURNING id INTO v_project;
  ELSE
    UPDATE projects
       SET status = 'active', owner_employee_id = v_owner,
           name_tr = COALESCE(name_tr, v_title_tr),
           purpose = v_purpose, purpose_tr = v_purpose_tr,
           links = COALESCE(links, '{}'::jsonb)
                   || jsonb_build_object('allocation_id', v_id,
                                         'objective_id', p_objective_id,
                                         'opportunity_id', p_opportunity_id,
                                         'engine', v_opp.engine_slug)
     WHERE id = v_project;
  END IF;

  SELECT id INTO v_task
    FROM tasks
   WHERE project_id = v_project
     AND status IN ('inbox','queued','claimed','running','review','awaiting_approval')
   ORDER BY created_at
   LIMIT 1;

  IF v_task IS NULL THEN
    v_label := 'Pilot plan: ' || v_opp.title;
    v_label_tr := 'Pilot planı: ' || v_title_tr;
    v_brief := 'The CEO has committed this opportunity to the objective "' || v_obj.title
      || '" — €' || v_obj.amount_eur::text || ' ' || v_obj.metric
      || '. You own the pilot as ' || v_dept || '.' || E'\n\n'
      || 'OPPORTUNITY: ' || v_opp.title
      || COALESCE(' | region ' || v_opp.region, '') || COALESCE(' | channel ' || v_opp.channel, '')
      || ' | engine ' || COALESCE(v_engine_title, v_opp.engine_slug)
      || ' | expected contribution €' || COALESCE(p_expected_net_eur, 0)::text || E'.\n'
      || 'RESEARCH BEHIND IT: ' || COALESCE(v_opp.research_refs::text, '{}') || E'\n\n'
      || 'HARD BOUNDARIES:' || E'\n'
      || '· Capital ceiling €' || v_limit::text
      || ' — raising it is the CEO''s decision alone. Plan inside it.' || E'\n'
      || '· Every outward step (money leaving, a contract, an email to a stranger, ad spend)'
      || ' goes through the existing approval gate. Never bypass it, never ask for a bypass.' || E'\n'
      || '· The holding''s Islamic boundaries are constitutional and already verdicted for this'
      || ' opportunity; anything you add must stay inside them.' || E'\n\n'
      || 'DELIVER A PILOT PLAN THAT CAN BE STARTED THIS WEEK:' || E'\n'
      || '1. The first three concrete steps, each with the department that executes it and'
      || ' its Turkish one-liner — these become real tasks automatically, so write them as'
      || ' instructions to that department, not as notes to yourself.' || E'\n'
      || '2. The first measurable revenue event and how it reaches revenue_ledger.' || E'\n'
      || '3. The capability gaps you need closed (skill, tool, seat) to run it.' || E'\n'
      || '4. The stop condition: what result would make continuing a mistake.';
    v_contract := fn_plan_step_contract();

    INSERT INTO tasks (department, agent_id, project_id, objective, output_contract,
                       label, label_tr, model_tier, approval_class, status, priority,
                       budget_max_tokens)
    VALUES (v_dept, v_owner, v_project, v_brief, v_contract,
            v_label, v_label_tr, 'L1', 'none', 'queued', 7, 120000)
    RETURNING id INTO v_task;
  END IF;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES ('ceo', 'ceo', 'revenue.portfolio.allocated',
          jsonb_build_object('allocation_id', v_id, 'objective_id', p_objective_id,
                             'opportunity_id', p_opportunity_id))
  RETURNING id INTO v_audit;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES ('ceo', 'ceo', 'revenue.portfolio.work_established',
          jsonb_build_object('allocation_id', v_id, 'project_id', v_project,
                             'task_id', v_task, 'department', v_dept,
                             'employee_id', v_owner));

  PERFORM notify_broadcast('revenue', 'portfolio.allocated',
    jsonb_build_object('id', v_id, 'project_id', v_project, 'department', v_dept,
      'summary_en', 'Portfolio allocation committed — ' || v_dept || ' owns the pilot',
      'summary_tr', 'Portföy tahsisi yapıldı — pilotun sahibi ' || v_dept));

  v_resp := jsonb_build_object('ok', true, 'id', v_id, 'audit_id', v_audit,
                               'project_id', v_project, 'task_id', v_task,
                               'owner_department', v_dept);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- ── 5. the door: a finished plan opens its own work ───────────────────────
CREATE OR REPLACE FUNCTION public.control_work_generate(
  p_plan_task_id uuid, p_steps jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_plan tasks%ROWTYPE;
  v_project_status text; v_project_name text;
  v_max int; v_idx int := 0; v_made int := 0; v_capped int := 0;
  v_step jsonb; v_text text; v_tr text; v_dept text; v_owner uuid; v_task uuid;
  v_generated jsonb := '[]'::jsonb;
  v_skipped jsonb := '[]'::jsonb;
  v_brief text; v_reason text; v_audit bigint;
BEGIN
  -- The generator runs as the OS itself; the CEO may also fire it by hand from
  -- the dashboard. Nobody else opens work on the holding's behalf (§13).
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

  -- ONCE, structurally: any row for this plan means it was already read.
  IF EXISTS (SELECT 1 FROM generated_work WHERE plan_task_id = p_plan_task_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ALREADY_GENERATED',
      'detail', 'this plan already opened its work',
      'existing', (SELECT count(*) FROM generated_work
                    WHERE plan_task_id = p_plan_task_id AND task_id IS NOT NULL));
  END IF;

  IF p_steps IS NULL OR jsonb_typeof(p_steps) <> 'array' OR jsonb_array_length(p_steps) = 0 THEN
    -- A plan that carries no executable step is a legitimate outcome, not an
    -- error — but it is written down, or the seam re-reads it forever.
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
    v_text := btrim(COALESCE(v_step ->> 'step', ''));
    v_tr := NULLIF(btrim(COALESCE(v_step ->> 'tr', '')), '');
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
         AND t.label = left(v_text, 120)
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

    -- The brief a worker receives must carry the boundaries with it. A step
    -- lifted out of its plan and handed to another department loses every
    -- constraint the plan assumed — so they travel with the task.
    v_brief := 'This task was opened by the holding itself from the finished plan "'
      || COALESCE(v_plan.label, left(v_plan.objective, 80)) || '" for project "'
      || v_project_name || '".' || E'\n\n'
      || 'YOUR STEP: ' || v_text || E'\n\n'
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
            left(v_text, 120), left(COALESCE(v_tr, v_text), 120),
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

REVOKE ALL ON FUNCTION public.control_work_generate(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.control_work_generate(uuid, jsonb) TO authenticated, service_role;

COMMIT;

-- ROLLBACK:
--   DROP FUNCTION IF EXISTS public.control_work_generate(uuid, jsonb);
--   DROP FUNCTION IF EXISTS public.fn_plan_step_contract();
--   DROP TABLE IF EXISTS public.generated_work;
--   DELETE FROM public.settings_values  WHERE key LIKE 'orchestration.autogen.%';
--   DELETE FROM public.settings_registry WHERE key LIKE 'orchestration.autogen.%';
--   (control_portfolio_allocate reverts to migration 20260726013000)
