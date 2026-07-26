-- W2.4 — AN APPROVED ALLOCATION PRODUCES REAL WORK.
-- REVENUE_ENGINE_SPEC §3 (BUILD PORTFOLIO → ESTABLISH PROJECTS → ALLOCATE),
-- §5, §12; PROJECT_OPERATING_SYSTEM rails reused, never duplicated.
--
-- Measured 2026-07-26 before writing a line:
--   · all six engines carried owner_department = NULL — "who works on this?"
--     had no answer anywhere in the company;
--   · portfolio_allocations held 0 rows and control_portfolio_allocate wrote
--     its row and stopped: no project, no task, nobody responsible. The CEO's
--     approval produced a ledger entry and silence. That is the line between a
--     24/7 OS and a very well audited idle system.
--
-- FOUR DECISIONS, each taken from the spec or from measurement:
--
-- 1. ENGINE OWNERS SHIP AS DATA. `control_engine_set_owner` is CEO-only (10d/
--    10e), so the OS cannot fill this in for itself at runtime — the same
--    situation as the `revenue-discovery` project, which shipped as data in
--    20260726009100. The mapping is stated once, visibly, and the CEO can
--    reassign any of it from Operations through the existing door.
--
-- 2. THE SEAM LIVES INSIDE THE ALLOCATION DOOR. The CEO's commitment and the
--    work it causes belong in ONE transaction: a committed bet with no project
--    is exactly the orphan state W2.2 already paid for (the pre-task hook
--    refuses work with no home in the portfolio, and it is right to).
--
-- 3. NO OWNER → NO WORK. An engine with owner_department NULL refuses the
--    allocation (`NO_OWNER`) instead of dropping a task nobody owns into the
--    queue. Responsibility is the anchor of the portfolio view (C10).
--
-- 4. STOP MUST ACTUALLY STOP. Before this migration `control_portfolio_stop`
--    could not orphan work because allocations never created any; now it can,
--    so it pauses the established project — and `claim_next_task` learns the
--    rule it never had: a paused/done/archived project does not dispatch.
--    MEASURED: claim_next_task read only `tasks`, so pausing a project was a
--    label with no consequence, for the whole company, not just revenue.
--
-- The §12 pointer lands in `projects.links` (jsonb), not `projects.meta` as the
-- spec sentence says: measured, `projects` has no `meta` column and never had
-- one. Registered adaptation — same pointer, real column.

BEGIN;

-- ── 1. who owns each engine (data; CEO-reassignable) ──────────────────────
UPDATE public.revenue_engines SET owner_department = 'commerce'         WHERE slug = 'ecommerce'            AND owner_department IS NULL;
UPDATE public.revenue_engines SET owner_department = 'commerce'         WHERE slug = 'physical'             AND owner_department IS NULL;
UPDATE public.revenue_engines SET owner_department = 'sales'            WHERE slug = 'social_selling'       AND owner_department IS NULL;
UPDATE public.revenue_engines SET owner_department = 'social-media'     WHERE slug = 'content_monetization' AND owner_department IS NULL;
UPDATE public.revenue_engines SET owner_department = 'customer-success' WHERE slug = 'consultancy'          AND owner_department IS NULL;
UPDATE public.revenue_engines SET owner_department = 'strategy'         WHERE slug = 'venture'              AND owner_department IS NULL;

INSERT INTO public.audit_log (actor, actor_type, action, payload)
SELECT 'migration:20260726013000', 'system', 'engine.owner.assigned',
       jsonb_build_object('engine', slug, 'department', owner_department,
                          'rationale', 'W2.4 seam: an engine with no owner cannot receive work; CEO may reassign from Operations')
  FROM public.revenue_engines
 WHERE owner_department IS NOT NULL;

-- ── 2. a paused project does not dispatch ─────────────────────────────────
-- The ONLY change is the project-state predicate. Everything else — the
-- dependency wall, priority order, SKIP LOCKED lease — is the live definition.
CREATE OR REPLACE FUNCTION public.claim_next_task(
  p_worker_id text, p_departments text[], p_lease_seconds integer DEFAULT 900)
RETURNS SETOF public.tasks LANGUAGE sql AS $$
  UPDATE tasks SET
    status = 'claimed', claimed_by = p_worker_id, claimed_at = now(),
    lease_expires_at = now() + make_interval(secs => p_lease_seconds),
    updated_at = now()
  WHERE id = (
    SELECT t.id FROM tasks t
    WHERE t.status = 'queued' AND t.department = ANY(p_departments)
      AND NOT EXISTS (SELECT 1 FROM tasks d
                      WHERE d.id = ANY(t.depends_on) AND d.status <> 'done')
      -- a halted project's queue is halted with it: paused|done|archived stop
      -- dispatching. Project-less tasks are unaffected (system routines).
      AND (t.project_id IS NULL
           OR EXISTS (SELECT 1 FROM projects p
                       WHERE p.id = t.project_id AND p.status IN ('draft','active')))
    ORDER BY t.priority DESC, t.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  RETURNING *;
$$;

-- ── 3. allocation establishes the project and opens the first work ────────
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

  -- WHO does the work. No owner, no allocation: a task nobody owns is worse
  -- than a bet not taken.
  SELECT e.owner_department, e.title INTO v_dept, v_engine_title
    FROM revenue_engines e WHERE e.slug = v_opp.engine_slug;
  IF v_dept IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NO_OWNER',
      'detail', 'engine ' || v_opp.engine_slug || ' has no owner department — assign one from Operations first (§4)');
  END IF;

  -- The seat that carries it: the department's director, else its most senior
  -- active specialist. STAFFED matters — an agent-less task runs tool-less by
  -- default-deny (W2.2 lesson).
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

  -- ESTABLISH THE PROJECT (§3). One project per opportunity: a second
  -- allocation of the same bet (rotation, re-commitment) re-activates it
  -- instead of littering the portfolio with duplicates.
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
    -- name AND name_tr: the card heading is an i18n surface (migration
    -- 20260726012500). Discovery writes English titles; the CEO reads Turkish.
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

  -- OPEN THE FIRST WORK (§3 ALLOCATE, existing task rails). One kickoff task:
  -- the owning department plans the pilot, and everything after that is born
  -- from that plan on the normal rails. If the project already has open work,
  -- the existing task IS the answer — a re-commitment must not double it.
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
      || '1. The first three concrete steps, each with the department that executes it.' || E'\n'
      || '2. The first measurable revenue event and how it reaches revenue_ledger.' || E'\n'
      || '3. The capability gaps you need closed (skill, tool, seat) to run it.' || E'\n'
      || '4. The stop condition: what result would make continuing a mistake.';
    v_contract := 'Write PLAIN TEXT — no json, no code fences. Exactly these blocks, in order:'
      || E'\n' || 'STEPS' || E'\n' || '1) <step> | owner: <department>' || E'\n'
      || '2) <step> | owner: <department>' || E'\n' || '3) <step> | owner: <department>' || E'\n'
      || 'FIRST_REVENUE: <the first paid event, and how it is recorded>' || E'\n'
      || 'GAPS: <skill/tool/seat you need, or NONE>' || E'\n'
      || 'STOP_IF: <the result that means stop>' || E'\n'
      || 'END';

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

-- ── 4. stopping the bet stops the work ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.control_portfolio_stop(
  p_allocation_id uuid, p_reason text, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('portfolio_stop|' || p_allocation_id::text);
  v_prev record; v_audit bigint; v_resp jsonb; v_project uuid;
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
  UPDATE portfolio_allocations
     SET stopped_at = now(), stop_reason = p_reason
   WHERE id = p_allocation_id AND stopped_at IS NULL;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND',
      'detail', 'allocation missing or already stopped');
  END IF;

  -- The work this allocation established halts with it. Tasks are never
  -- rewritten or deleted — audited work stays readable; the project's state is
  -- what the dispatcher reads (see claim_next_task).
  UPDATE projects
     SET status = 'paused'
   WHERE links ->> 'allocation_id' = p_allocation_id::text
     AND status = 'active'
  RETURNING id INTO v_project;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES ('ceo', 'ceo', 'revenue.portfolio.stopped',
          jsonb_build_object('allocation_id', p_allocation_id, 'reason', p_reason,
                             'project_paused', v_project))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('revenue', 'portfolio.stopped',
    jsonb_build_object('id', p_allocation_id, 'project_id', v_project,
      'summary_en', 'Allocation stopped — its project is paused',
      'summary_tr', 'Tahsis durduruldu — projesi duraklatıldı'));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit, 'project_paused', v_project);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

COMMIT;

-- ROLLBACK: UPDATE public.revenue_engines SET owner_department = NULL WHERE slug IN
--   ('ecommerce','physical','social_selling','content_monetization','consultancy','venture');
--   then re-apply the pre-W2.4 bodies of control_portfolio_allocate and
--   control_portfolio_stop from 20260717020100_r12b_objectives_opportunities.sql
--   (§4.10) and the pre-W2.4 claim_next_task from
--   20260707__phase4 velocity family (the body above minus the project-state
--   predicate) — same signatures, so CREATE OR REPLACE restores them.
