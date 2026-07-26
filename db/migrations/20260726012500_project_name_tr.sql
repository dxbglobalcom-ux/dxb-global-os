-- A PROJECT NAME IS AN i18n SURFACE TOO (found while building W2.4, 2026-07-26).
--
-- This morning's stabilization gave `projects.purpose` its Turkish leg because
-- the CEO's /ops/projects cards were speaking English to him. The card's HEADING
-- was left behind: `projects.name` renders raw, so the Turkish page reads
-- "HR Sandbox" and "Revenue Discovery" — measured, live, today.
--
-- W2.4 makes it worse rather than better: the allocation seam names a revenue
-- project after the opportunity, and discovery writes those titles in English
-- (its Turkish leg lives in `opportunities.title_tr`). Shipping W2.4 without
-- this migration would put a fresh English heading on his Turkish board every
-- time he commits a bet. Same rule as agents.title_tr / departments.display_name_tr:
-- DB text a human reads is an i18n surface.
--
-- The English original is never rewritten (artifacts stay English, §Language
-- directive); the CEO-visible card picks the leg matching his locale.
--
-- v_project_command is re-declared VERBATIM from the live definition
-- (pg_get_viewdef, 2026-07-26) with name_tr APPENDED — CREATE OR REPLACE VIEW
-- may only add columns at the end.

BEGIN;

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS name_tr text;

-- The three live projects. "DXB Global OS" is a proper noun and stays itself in
-- both languages — translating a company's own name would be worse, not better.
UPDATE public.projects SET name_tr = 'DXB Global OS'  WHERE slug = 'dxb-global-os';
UPDATE public.projects SET name_tr = 'İK Kum Havuzu'  WHERE slug = 'hr-sandbox';
UPDATE public.projects SET name_tr = 'Gelir Keşfi'    WHERE slug = 'revenue-discovery';

CREATE OR REPLACE VIEW public.v_project_command AS
 SELECT p.id,
    p.slug,
    p.name,
    p.purpose,
    p.strategy_link,
    p.status,
    p.health_score,
    p.links,
    p.created_at,
    p.owner_employee_id,
    ow.slug AS owner_slug,
    ow.title AS owner_title,
    ow.title_tr AS owner_title_tr,
    p.company_id,
    co.slug AS company_slug,
    ( SELECT count(*)::integer AS count
           FROM project_members m
          WHERE m.project_id = p.id) AS member_count,
    ( SELECT count(*)::integer AS count
           FROM project_milestones ms
          WHERE ms.project_id = p.id) AS milestones_total,
    ( SELECT count(*)::integer AS count
           FROM project_milestones ms
          WHERE ms.project_id = p.id AND ms.reached_at IS NOT NULL) AS milestones_reached,
    ( SELECT min(ms.due_at) AS min
           FROM project_milestones ms
          WHERE ms.project_id = p.id AND ms.reached_at IS NULL) AS next_milestone_due,
    ( SELECT ms.title
           FROM project_milestones ms
          WHERE ms.project_id = p.id AND ms.kind = 'phase'::text AND ms.reached_at IS NULL
          ORDER BY ms.seq
         LIMIT 1) AS current_phase,
    ( SELECT count(*)::integer AS count
           FROM tasks tk
          WHERE tk.project_id = p.id) AS tasks_total,
    ( SELECT count(*)::integer AS count
           FROM tasks tk
          WHERE tk.project_id = p.id AND (tk.status = ANY (ARRAY['queued'::text, 'claimed'::text, 'running'::text]))) AS tasks_active,
    ( SELECT count(*)::integer AS count
           FROM tasks tk
          WHERE tk.project_id = p.id AND tk.status = 'failed'::text) AS tasks_failed,
    ( SELECT count(*)::integer AS count
           FROM workflows w
          WHERE w.project_id = p.id AND w.enabled) AS workflows_enabled,
    ( SELECT count(*)::integer AS count
           FROM project_risks rk
          WHERE rk.project_id = p.id AND rk.status = 'open'::text) AS risks_open,
    ( SELECT count(*)::integer AS count
           FROM project_risks rk
          WHERE rk.project_id = p.id AND rk.status = 'open'::text AND (rk.severity = ANY (ARRAY['high'::text, 'critical'::text]))) AS risks_open_high,
    ( SELECT count(*)::integer AS count
           FROM decision_log dl
             JOIN agent_runs ar ON ar.id = dl.run_id
             JOIN tasks tk ON tk.id = ar.task_id
          WHERE tk.project_id = p.id) AS decisions_count,
    ( SELECT count(*)::integer AS count
           FROM approvals ap
          WHERE ap.project_id = p.id) AS approvals_total,
    ( SELECT count(*)::integer AS count
           FROM approvals ap
          WHERE ap.project_id = p.id AND ap.status = 'pending'::text) AS approvals_pending,
    ( SELECT count(DISTINCT d.dept)::integer AS count
           FROM ( SELECT ag.department AS dept
                   FROM project_members m
                     JOIN agents ag ON ag.id = m.employee_id
                  WHERE m.project_id = p.id
                UNION
                 SELECT tk.department
                   FROM tasks tk
                  WHERE tk.project_id = p.id AND tk.department IS NOT NULL) d) AS departments_count,
    ( SELECT COALESCE(sum(c.cost_eur), 0::numeric)::numeric(10,2) AS "coalesce"
           FROM cost_ledger c
             JOIN tasks tk ON tk.id = c.task_id
          WHERE tk.project_id = p.id) AS cost_total_eur,
    ( SELECT COALESCE(sum(ar.tokens_in), 0::numeric)::bigint AS "coalesce"
           FROM agent_runs ar
             JOIN tasks tk ON tk.id = ar.task_id
          WHERE tk.project_id = p.id) AS tokens_in,
    ( SELECT COALESCE(sum(ar.tokens_out), 0::numeric)::bigint AS "coalesce"
           FROM agent_runs ar
             JOIN tasks tk ON tk.id = ar.task_id
          WHERE tk.project_id = p.id) AS tokens_out,
    ( SELECT max(e.created_at) AS max
           FROM task_events e
             JOIN tasks tk ON tk.id = e.task_id
          WHERE tk.project_id = p.id) AS last_activity_at,
    hb.health_score AS health_live,
    hb.pen_critical_risk,
    hb.pen_high_risks,
    hb.pen_late_milestones,
    hb.pen_failed_runs,
    hb.pen_blockers,
    hb.pen_budget_burn,
    hb.blocker_tasks + hb.blocker_approvals AS blockers_count,
    hb.blocker_tasks,
    hb.blocker_approvals,
    p.purpose_tr,
    p.name_tr
   FROM projects p
     LEFT JOIN agents ow ON ow.id = p.owner_employee_id
     LEFT JOIN companies co ON co.id = p.company_id
     LEFT JOIN LATERAL project_health_breakdown(p.id) hb(health_score, pen_critical_risk, pen_high_risks, pen_late_milestones, pen_failed_runs, pen_blockers, pen_budget_burn, blocker_tasks, blocker_approvals) ON true;

COMMIT;

-- ROLLBACK: re-declare v_project_command without the trailing p.name_tr column
--   (DROP VIEW + CREATE from 20260726011100's body), then
--   ALTER TABLE public.projects DROP COLUMN name_tr;
