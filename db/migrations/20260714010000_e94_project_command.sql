-- E9.4 — Project OS Command surface (PROJECT_OPERATING_SYSTEM_SPEC).
-- 0023x-b tables are LIVE since 20260711002350. This migration adds:
--   1. tasks.milestone_id — registered adaptation A3: §9 milestone.reached
--      automation needs a task↔milestone link the §4 model lacked.
--   2. project_health_breakdown + project_health — §10 formula VERBATIM
--      (weights binding; any change = new fn version + spec entry).
--   3. v_project_command v2 — §8 single round-trip: live health with the
--      per-component breakdown (CEO "why 62?" answered in one look),
--      computed blockers (§6 — derived, never stored), token sums,
--      decision/approval counters, current phase.
--   4. control_project_action — API_CONTRACTS 8b `projects` row (7 ops),
--      §13 CEO wall (ALL ops CEO-only; system automation stays trigger-side),
--      idempotency twin (0025x), links credential regex gate (§16),
--      archive-with-running-workflow reject (§27), dependency cycle →
--      VALIDATION_FAILED carrying the cycle path (§17), milestone seq
--      conflict → CONFLICT_STALE (§17).
--   5. `projects` channel broadcasts (EVENT_MODEL §9b): project.created +
--      project.status_changed from the control fn, milestone.reached from
--      the task-completion trigger, dependency.blocked when a dependency
--      lands on an unfinished task. §15 pattern: a broadcast error never
--      rolls back the source write.
-- Idempotent: safe to re-run.
--
-- ROLLBACK (spec §23): DROP TRIGGER trg_project_milestone_reached ON tasks;
-- DROP FUNCTION fn_project_milestone_reached, control_project_action,
-- project_health, project_health_breakdown; re-run the v_project_command
-- block of 20260711002500_api_support.sql; ALTER TABLE tasks DROP COLUMN
-- milestone_id. 0023x-b tables stay (that family owns them).

-- ── 1. tasks.milestone_id (adaptation A3) ───────────────────────────────────
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS milestone_id uuid REFERENCES public.project_milestones(id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone
  ON public.tasks (milestone_id) WHERE milestone_id IS NOT NULL;
COMMENT ON COLUMN public.tasks.milestone_id is
  'E9.4 adaptation A3: links a task to a project milestone so the completion trigger can mark reached_at (PROJECT_OS §9).';

-- ── 2. health formula (§10 — binding) ───────────────────────────────────────
-- health = 100
--   - 25·(open critical risk exists)
--   - 15·(open high risk count, counted at most 2)
--   - 20·(late milestone ratio: due_at past & reached_at empty / total)
--   - 20·(failed run ratio last 7 days: failed/(failed+succeeded), project-corr)
--   - 10·(blocker count > 0)
--   - 10·(budget burn: project cost / links.budget_eur; component 0 when unset)
-- clamped to 0-100; components exposed as separate columns.
CREATE OR REPLACE FUNCTION public.project_health_breakdown(p_project_id uuid)
RETURNS TABLE (
  health_score        int,
  pen_critical_risk   int,
  pen_high_risks      int,
  pen_late_milestones int,
  pen_failed_runs     int,
  pen_blockers        int,
  pen_budget_burn     int,
  blocker_tasks       int,
  blocker_approvals   int
) LANGUAGE sql STABLE SET search_path = public AS $$
WITH risk AS (
  SELECT
    EXISTS (SELECT 1 FROM project_risks
             WHERE project_id = p_project_id AND status = 'open'
               AND severity = 'critical')                                   AS has_critical,
    (SELECT least(count(*), 2)::int FROM project_risks
      WHERE project_id = p_project_id AND status = 'open'
        AND severity = 'high')                                              AS high_n
),
ms AS (
  SELECT count(*) FILTER (WHERE due_at < now() AND reached_at IS NULL)::numeric AS late,
         count(*)::numeric                                                       AS total
    FROM project_milestones WHERE project_id = p_project_id
),
runs AS (
  SELECT count(*) FILTER (WHERE ar.status = 'failed')::numeric                  AS failed,
         count(*) FILTER (WHERE ar.status IN ('failed','succeeded'))::numeric   AS finished
    FROM agent_runs ar
    JOIN tasks t ON t.id = ar.task_id
   WHERE t.project_id = p_project_id
     AND ar.started_at > now() - interval '7 days'
),
blk AS (
  SELECT count(DISTINCT d.task_id)::int AS task_blockers
    FROM task_dependencies d
    JOIN tasks t   ON t.id = d.task_id
                  AND t.project_id = p_project_id
                  AND t.status <> 'done'
    JOIN tasks dep ON dep.id = d.depends_on AND dep.status <> 'done'
),
apb AS (
  SELECT count(*)::int AS pending
    FROM approvals WHERE project_id = p_project_id AND status = 'pending'
),
spend AS (
  SELECT coalesce(sum(c.cost_eur), 0)::numeric AS spent
    FROM cost_ledger c JOIN tasks t ON t.id = c.task_id
   WHERE t.project_id = p_project_id
),
alloc AS (
  SELECT CASE WHEN links->>'budget_eur' ~ '^[0-9]+(\.[0-9]+)?$'
              THEN (links->>'budget_eur')::numeric END AS budget_eur
    FROM projects WHERE id = p_project_id
),
pens AS (
  SELECT
    CASE WHEN risk.has_critical THEN 25 ELSE 0 END                            AS p1,
    15 * risk.high_n                                                          AS p2,
    round(20 * CASE WHEN ms.total = 0 THEN 0 ELSE ms.late / ms.total END)::int AS p3,
    round(20 * CASE WHEN runs.finished = 0 THEN 0
               ELSE runs.failed / runs.finished END)::int                      AS p4,
    CASE WHEN blk.task_blockers + apb.pending > 0 THEN 10 ELSE 0 END          AS p5,
    round(10 * CASE WHEN alloc.budget_eur IS NULL OR alloc.budget_eur = 0 THEN 0
               ELSE least(spend.spent / alloc.budget_eur, 1) END)::int         AS p6,
    blk.task_blockers, apb.pending
  FROM risk, ms, runs, blk, apb, spend, alloc
)
SELECT greatest(0, least(100, 100 - p1 - p2 - p3 - p4 - p5 - p6))::int,
       p1, p2, p3, p4, p5, p6, task_blockers, pending
FROM pens;
$$;

CREATE OR REPLACE FUNCTION public.project_health(p_project_id uuid)
RETURNS int LANGUAGE sql STABLE SET search_path = public AS
$$ SELECT health_score FROM public.project_health_breakdown(p_project_id) $$;

COMMENT ON FUNCTION public.project_health_breakdown(uuid) is
  'E9.4 PROJECT_OS §10 (binding formula): health score with per-component penalties. Formula change = migration + spec entry — no silent calibration.';

REVOKE ALL ON FUNCTION public.project_health_breakdown(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.project_health(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.project_health_breakdown(uuid),
  public.project_health(uuid) TO authenticated, service_role;

-- ── 3. v_project_command v2 (§8 single round-trip, 19-field surface) ────────
-- Keeps every v1 column (compat) and adds live health + breakdown, computed
-- blockers, tokens-in/out totals, decision and approval counters, current phase.
DROP VIEW IF EXISTS public.v_project_command;
CREATE VIEW public.v_project_command
WITH (security_invoker = true) AS
SELECT
  p.id, p.slug, p.name, p.purpose, p.strategy_link, p.status, p.health_score,
  p.links, p.created_at,
  p.owner_employee_id,
  ow.slug AS owner_slug,
  ow.title AS owner_title,
  ow.title_tr AS owner_title_tr,
  p.company_id,
  co.slug AS company_slug,
  (SELECT count(*)::int FROM public.project_members m WHERE m.project_id = p.id)                          AS member_count,
  (SELECT count(*)::int FROM public.project_milestones ms WHERE ms.project_id = p.id)                     AS milestones_total,
  (SELECT count(*)::int FROM public.project_milestones ms WHERE ms.project_id = p.id
     AND ms.reached_at IS NOT NULL)                                                                       AS milestones_reached,
  (SELECT min(ms.due_at) FROM public.project_milestones ms WHERE ms.project_id = p.id
     AND ms.reached_at IS NULL)                                                                           AS next_milestone_due,
  (SELECT ms.title FROM public.project_milestones ms WHERE ms.project_id = p.id
     AND ms.kind = 'phase' AND ms.reached_at IS NULL ORDER BY ms.seq LIMIT 1)                             AS current_phase,
  (SELECT count(*)::int FROM public.tasks tk WHERE tk.project_id = p.id)                                  AS tasks_total,
  (SELECT count(*)::int FROM public.tasks tk WHERE tk.project_id = p.id
     AND tk.status IN ('queued','claimed','running'))                                                     AS tasks_active,
  (SELECT count(*)::int FROM public.tasks tk WHERE tk.project_id = p.id AND tk.status = 'failed')         AS tasks_failed,
  (SELECT count(*)::int FROM public.workflows w WHERE w.project_id = p.id AND w.enabled)                  AS workflows_enabled,
  (SELECT count(*)::int FROM public.project_risks rk WHERE rk.project_id = p.id AND rk.status = 'open')   AS risks_open,
  (SELECT count(*)::int FROM public.project_risks rk WHERE rk.project_id = p.id AND rk.status = 'open'
     AND rk.severity IN ('high','critical'))                                                              AS risks_open_high,
  (SELECT count(*)::int FROM public.decision_log dl
     JOIN public.agent_runs ar ON ar.id = dl.run_id
     JOIN public.tasks tk ON tk.id = ar.task_id WHERE tk.project_id = p.id)                               AS decisions_count,
  (SELECT count(*)::int FROM public.approvals ap WHERE ap.project_id = p.id)                              AS approvals_total,
  (SELECT count(*)::int FROM public.approvals ap WHERE ap.project_id = p.id
     AND ap.status = 'pending')                                                                           AS approvals_pending,
  (SELECT count(DISTINCT dept)::int FROM (
     SELECT ag.department AS dept FROM public.project_members m
       JOIN public.agents ag ON ag.id = m.employee_id WHERE m.project_id = p.id
     UNION
     SELECT tk.department FROM public.tasks tk
      WHERE tk.project_id = p.id AND tk.department IS NOT NULL) d)                                        AS departments_count,
  (SELECT coalesce(sum(c.cost_eur), 0)::numeric(10,2) FROM public.cost_ledger c
     JOIN public.tasks tk ON tk.id = c.task_id WHERE tk.project_id = p.id)                                AS cost_total_eur,
  (SELECT coalesce(sum(ar.tokens_in), 0)::bigint FROM public.agent_runs ar
     JOIN public.tasks tk ON tk.id = ar.task_id WHERE tk.project_id = p.id)                               AS tokens_in,
  (SELECT coalesce(sum(ar.tokens_out), 0)::bigint FROM public.agent_runs ar
     JOIN public.tasks tk ON tk.id = ar.task_id WHERE tk.project_id = p.id)                               AS tokens_out,
  (SELECT max(e.created_at) FROM public.task_events e
     JOIN public.tasks tk ON tk.id = e.task_id WHERE tk.project_id = p.id)                                AS last_activity_at,
  hb.health_score        AS health_live,
  hb.pen_critical_risk,
  hb.pen_high_risks,
  hb.pen_late_milestones,
  hb.pen_failed_runs,
  hb.pen_blockers,
  hb.pen_budget_burn,
  (hb.blocker_tasks + hb.blocker_approvals)                                                               AS blockers_count,
  hb.blocker_tasks,
  hb.blocker_approvals
FROM public.projects p
LEFT JOIN public.agents ow ON ow.id = p.owner_employee_id
LEFT JOIN public.companies co ON co.id = p.company_id
LEFT JOIN LATERAL public.project_health_breakdown(p.id) hb ON true;

COMMENT ON VIEW public.v_project_command is
  'E9.4 PROJECT_OS §8: per-project single round-trip for the Command View — v1 counters + live §10 health with component breakdown, computed blockers (§6), tokens-in/out totals, decision and approval counters, current phase.';

GRANT SELECT ON public.v_project_command TO authenticated, service_role;

-- ── 4. control_project_action (API_CONTRACTS 8b; §13 CEO wall) ──────────────
-- Payload: {"action": "create"|"update"|"set_status"|"add_milestone"
--                     |"set_dependency"|"add_member"|"log_risk", ...}
--   create:         {slug,name,purpose,strategy_link?,owner_employee_id?,
--                    company_id?,links?}
--   update:         {slug|project_id, name?,purpose?,strategy_link?,
--                    owner_employee_id?,links?}
--   set_status:     {slug|project_id, status}   (archived + running workflow
--                    run → VALIDATION_FAILED, §27: stop it first)
--   add_milestone:  {slug|project_id, seq, title, kind?, due_at?, plan_ref?}
--   set_dependency: {task_id, depends_on}       (cycle → VALIDATION_FAILED
--                    with the cycle path from the 0023x-b trigger, §17)
--   add_member:     {slug|project_id, employee_id, role?}
--   log_risk:       {slug|project_id, title, severity, note?}
--                   or {risk_id, status, note?}  (§14: risk rows update in place)
CREATE OR REPLACE FUNCTION public.control_project_action(
  p_payload         jsonb,
  p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor      text;
  v_digest     text;
  v_prev       record;
  v_action     text;
  v_proj       record;
  v_slug       text;
  v_proj_id    uuid;
  v_links      jsonb;
  v_status     text;
  v_ms_id      uuid;
  v_risk_id    uuid;
  v_dep_task   record;
  v_entity_id  uuid;
  v_audit_id   bigint;
  v_resp       jsonb;
  v_detail_tbl text;
BEGIN
  v_actor := CASE
    WHEN auth.uid() IS NOT NULL THEN 'ceo'
    WHEN current_user IN ('service_role', 'postgres') THEN 'system'
  END;
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;

  p_payload := jsonb_strip_nulls(p_payload);

  v_digest := md5('projects|' || p_payload::text);
  SELECT request_digest, response INTO v_prev
    FROM control_idempotency WHERE key = p_idempotency_key;
  IF FOUND THEN
    IF v_prev.request_digest <> v_digest THEN
      RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
    END IF;
    RETURN v_prev.response;
  END IF;

  v_action := p_payload->>'action';
  IF v_action IS NULL OR v_action NOT IN
     ('create','update','set_status','add_milestone','set_dependency','add_member','log_risk') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'action must be create|update|set_status|add_milestone|set_dependency|add_member|log_risk');
  END IF;

  -- §13: project mutations are CEO-only through this seam. System automation
  -- (milestone reached, health recompute, blocker derivation) lives in
  -- triggers/views, NOT here. Agents read project context; they never write.
  IF v_actor <> 'ceo' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'project ' || v_action || ' is CEO-only (PROJECT_OS §13)');
  END IF;

  -- ── resolve target project where the op addresses one ───────────────────
  IF v_action IN ('update','set_status','add_milestone','add_member')
     OR (v_action = 'log_risk' AND NOT p_payload ? 'risk_id') THEN
    v_slug    := p_payload->>'slug';
    v_proj_id := (p_payload->>'project_id')::uuid;
    SELECT * INTO v_proj FROM projects pr
     WHERE (v_slug IS NOT NULL AND pr.slug = v_slug)
        OR (v_proj_id IS NOT NULL AND pr.id = v_proj_id);
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'project not found (slug/project_id)');
    END IF;
    v_proj_id := v_proj.id;
    v_slug    := v_proj.slug;
  END IF;

  -- ── links credential gate (§16): no user:pass@ inside any link string ───
  IF p_payload ? 'links' THEN
    v_links := p_payload->'links';
    IF v_links::text ~ '://[^"]*:[^"]*@' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'links must not embed credentials (PROJECT_OS §16)');
    END IF;
  END IF;

  IF v_action = 'create' THEN
    IF coalesce(p_payload->>'slug','') = '' OR coalesce(p_payload->>'name','') = ''
       OR coalesce(p_payload->>'purpose','') = '' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'create needs slug, name, purpose');
    END IF;
    IF EXISTS (SELECT 1 FROM projects WHERE slug = p_payload->>'slug') THEN
      RETURN jsonb_build_object('ok', false, 'error', 'CONFLICT_STALE',
        'detail', 'slug already exists');
    END IF;
    INSERT INTO projects (slug, name, purpose, strategy_link, owner_employee_id, company_id, links)
    VALUES (p_payload->>'slug', p_payload->>'name', p_payload->>'purpose',
            p_payload->>'strategy_link',
            (p_payload->>'owner_employee_id')::uuid,
            (p_payload->>'company_id')::uuid,
            coalesce(v_links, '{}'::jsonb))
    RETURNING id, slug INTO v_proj_id, v_slug;
    v_entity_id := v_proj_id; v_detail_tbl := 'projects';
    BEGIN
      PERFORM notify_broadcast('projects', 'project.created', jsonb_build_object(
        'actor', v_actor,
        'entity', jsonb_build_object('kind', 'project', 'id', v_proj_id::text),
        'corr', jsonb_build_object('project_id', v_proj_id),
        'payload', jsonb_build_object('slug', v_slug, 'name', p_payload->>'name')));
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'projects broadcast swallowed: %', SQLERRM;
    END;

  ELSIF v_action = 'update' THEN
    UPDATE projects SET
      name              = coalesce(p_payload->>'name', name),
      purpose           = coalesce(p_payload->>'purpose', purpose),
      strategy_link     = coalesce(p_payload->>'strategy_link', strategy_link),
      owner_employee_id = coalesce((p_payload->>'owner_employee_id')::uuid, owner_employee_id),
      links             = coalesce(v_links, links)
    WHERE id = v_proj_id;
    v_entity_id := v_proj_id; v_detail_tbl := 'projects';

  ELSIF v_action = 'set_status' THEN
    v_status := p_payload->>'status';
    IF v_status IS NULL OR v_status NOT IN ('draft','active','paused','done','archived') THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'status must be draft|active|paused|done|archived');
    END IF;
    -- §27: archiving a project with a running workflow is refused — stop first.
    IF v_status = 'archived' AND EXISTS (
        SELECT 1 FROM workflow_runs wr
        JOIN workflows w ON w.id = wr.workflow_id
       WHERE w.project_id = v_proj_id
         AND wr.status IN ('running','waiting_approval')) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'project has running workflow runs — stop them before archiving (PROJECT_OS §27)');
    END IF;
    UPDATE projects SET status = v_status WHERE id = v_proj_id;
    v_entity_id := v_proj_id; v_detail_tbl := 'projects';
    BEGIN
      PERFORM notify_broadcast('projects', 'project.status_changed', jsonb_build_object(
        'actor', v_actor,
        'entity', jsonb_build_object('kind', 'project', 'id', v_proj_id::text),
        'corr', jsonb_build_object('project_id', v_proj_id),
        'payload', jsonb_build_object('slug', v_slug, 'status', v_status)));
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'projects broadcast swallowed: %', SQLERRM;
    END;

  ELSIF v_action = 'add_milestone' THEN
    IF coalesce(p_payload->>'title','') = '' OR (p_payload->>'seq') IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'add_milestone needs seq and title');
    END IF;
    IF p_payload ? 'kind' AND p_payload->>'kind' NOT IN ('phase','milestone') THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'kind must be phase|milestone');
    END IF;
    -- §17: seq collision is a stale-write conflict, not a validation typo.
    IF EXISTS (SELECT 1 FROM project_milestones
                WHERE project_id = v_proj_id AND seq = (p_payload->>'seq')::int) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'CONFLICT_STALE',
        'detail', 'milestone seq already taken for this project');
    END IF;
    INSERT INTO project_milestones (project_id, kind, seq, title, due_at, plan_ref, reached_at)
    VALUES (v_proj_id, coalesce(p_payload->>'kind','milestone'),
            (p_payload->>'seq')::int, p_payload->>'title',
            (p_payload->>'due_at')::timestamptz, p_payload->>'plan_ref',
            (p_payload->>'reached_at')::timestamptz)
    RETURNING id INTO v_ms_id;
    v_entity_id := v_ms_id; v_detail_tbl := 'project_milestones';

  ELSIF v_action = 'set_dependency' THEN
    IF (p_payload->>'task_id') IS NULL OR (p_payload->>'depends_on') IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'set_dependency needs task_id and depends_on');
    END IF;
    BEGIN
      INSERT INTO task_dependencies (task_id, depends_on)
      VALUES ((p_payload->>'task_id')::uuid, (p_payload->>'depends_on')::uuid)
      ON CONFLICT DO NOTHING;
    EXCEPTION
      WHEN raise_exception THEN
        -- 0023x-b acyclic trigger names the cycle path in its message (§17).
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', SQLERRM);
      WHEN check_violation THEN
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', 'a task cannot depend on itself');
      WHEN foreign_key_violation THEN
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', 'task_id or depends_on not found');
    END;
    v_entity_id := (p_payload->>'task_id')::uuid; v_detail_tbl := 'task_dependencies';
    -- dependency.blocked (§9): the new edge blocks when the upstream task is unfinished.
    SELECT t.id, t.project_id, t.status INTO v_dep_task
      FROM tasks t WHERE t.id = (p_payload->>'depends_on')::uuid;
    IF FOUND AND v_dep_task.status <> 'done' THEN
      BEGIN
        PERFORM notify_broadcast('projects', 'dependency.blocked', jsonb_build_object(
          'actor', v_actor,
          'entity', jsonb_build_object('kind', 'task', 'id', p_payload->>'task_id'),
          'corr', jsonb_build_object('task_id', (p_payload->>'task_id')::uuid,
                                     'project_id', v_dep_task.project_id),
          'payload', jsonb_build_object('task_id', p_payload->>'task_id',
                                        'depends_on', p_payload->>'depends_on',
                                        'depends_on_status', v_dep_task.status)));
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'projects broadcast swallowed: %', SQLERRM;
      END;
    END IF;

  ELSIF v_action = 'add_member' THEN
    IF (p_payload->>'employee_id') IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'add_member needs employee_id');
    END IF;
    IF p_payload ? 'role' AND p_payload->>'role' NOT IN ('owner','director','member') THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'role must be owner|director|member');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM agents WHERE id = (p_payload->>'employee_id')::uuid) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'employee not found');
    END IF;
    INSERT INTO project_members (project_id, employee_id, role)
    VALUES (v_proj_id, (p_payload->>'employee_id')::uuid, coalesce(p_payload->>'role','member'))
    ON CONFLICT (project_id, employee_id)
      DO UPDATE SET role = coalesce(p_payload->>'role', project_members.role);
    v_entity_id := v_proj_id; v_detail_tbl := 'project_members';

  ELSIF v_action = 'log_risk' THEN
    IF p_payload ? 'risk_id' THEN
      -- §14: risk rows update in place (status transition), audited below.
      v_risk_id := (p_payload->>'risk_id')::uuid;
      IF p_payload->>'status' IS NULL
         OR p_payload->>'status' NOT IN ('open','mitigated','accepted','closed') THEN
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', 'risk update needs status open|mitigated|accepted|closed');
      END IF;
      UPDATE project_risks
         SET status = p_payload->>'status',
             note = coalesce(p_payload->>'note', note),
             updated_at = now()
       WHERE id = v_risk_id
       RETURNING project_id INTO v_proj_id;
      IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', 'risk not found');
      END IF;
      SELECT slug INTO v_slug FROM projects WHERE id = v_proj_id;
    ELSE
      IF coalesce(p_payload->>'title','') = '' OR p_payload->>'severity' IS NULL
         OR p_payload->>'severity' NOT IN ('low','medium','high','critical') THEN
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', 'log_risk needs title and severity low|medium|high|critical');
      END IF;
      INSERT INTO project_risks (project_id, title, severity, note)
      VALUES (v_proj_id, p_payload->>'title', p_payload->>'severity', p_payload->>'note')
      RETURNING id INTO v_risk_id;
    END IF;
    v_entity_id := v_risk_id; v_detail_tbl := 'project_risks';
  END IF;

  -- ── audit (API_CONTRACTS §14: every B-class call writes its own row) ─────
  INSERT INTO audit_log (actor, actor_type, action, payload, detail_ref)
  VALUES (v_actor, 'ceo', 'project.' || v_action,
          jsonb_build_object('project_id', v_proj_id, 'slug', v_slug)
            || CASE WHEN v_ms_id   IS NOT NULL THEN jsonb_build_object('milestone_id', v_ms_id) ELSE '{}'::jsonb END
            || CASE WHEN v_risk_id IS NOT NULL THEN jsonb_build_object('risk_id', v_risk_id)   ELSE '{}'::jsonb END,
          jsonb_build_object('table', v_detail_tbl, 'id', v_entity_id))
  RETURNING id INTO v_audit_id;

  v_resp := jsonb_build_object('ok', true, 'action', v_action,
              'project_id', v_proj_id, 'audit_id', v_audit_id);
  IF v_ms_id   IS NOT NULL THEN v_resp := v_resp || jsonb_build_object('milestone_id', v_ms_id); END IF;
  IF v_risk_id IS NOT NULL THEN v_resp := v_resp || jsonb_build_object('risk_id', v_risk_id);   END IF;

  INSERT INTO control_idempotency (key, request_digest, response)
  VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

COMMENT ON FUNCTION public.control_project_action(jsonb, text) IS
  'E9.4 PROJECT_OS §6/§13/§16/§17: the single write door for project records — create/update/set_status/add_milestone/set_dependency/add_member/log_risk. CEO-only; system automation stays trigger-side (milestone reached, health, blockers).';

REVOKE ALL ON FUNCTION public.control_project_action(jsonb, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.control_project_action(jsonb, text)
  TO authenticated, service_role;

-- ── 5. milestone.reached automation (§9) ────────────────────────────────────
-- Task completion closes the milestone when it was the last open task on it.
CREATE OR REPLACE FUNCTION public.fn_project_milestone_reached()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_ms record;
BEGIN
  IF NEW.status = 'done' AND NEW.milestone_id IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT * INTO v_ms FROM project_milestones
     WHERE id = NEW.milestone_id AND reached_at IS NULL;
    IF FOUND AND NOT EXISTS (
        SELECT 1 FROM tasks t
         WHERE t.milestone_id = NEW.milestone_id
           AND t.id <> NEW.id AND t.status <> 'done') THEN
      UPDATE project_milestones SET reached_at = now() WHERE id = NEW.milestone_id;
      BEGIN
        PERFORM notify_broadcast('projects', 'milestone.reached', jsonb_build_object(
          'actor', 'system',
          'entity', jsonb_build_object('kind', 'project_milestone', 'id', NEW.milestone_id::text),
          'corr', jsonb_build_object('project_id', v_ms.project_id, 'task_id', NEW.id),
          'payload', jsonb_build_object('milestone_id', NEW.milestone_id,
                                        'title', v_ms.title, 'seq', v_ms.seq,
                                        'project_id', v_ms.project_id)));
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'projects broadcast swallowed: %', SQLERRM;
      END;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_project_milestone_reached ON public.tasks;
CREATE TRIGGER trg_project_milestone_reached
  AFTER INSERT OR UPDATE OF status ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.fn_project_milestone_reached();

COMMENT ON FUNCTION public.fn_project_milestone_reached() is
  'E9.4 PROJECT_OS §9: when the last open task of a milestone reaches done, stamp reached_at and broadcast milestone.reached on the projects channel.';
