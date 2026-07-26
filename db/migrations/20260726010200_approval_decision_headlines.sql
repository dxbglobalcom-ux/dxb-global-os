-- Third and last surface family carrying the same defect (010000, 010100):
-- v_approvals_center and v_decision_log both exposed `t.objective AS
-- task_objective`, and every consumer renders it as ONE LINE:
--   apps/dashboard/src/app/(command)/approvals/[id]/page.tsx:260  "Task: … →"
--   apps/dashboard/src/app/(command)/gov/decisions/page.tsx:65    table cell
-- With a scout brief in the table those lines become a page of instructions.
--
-- `task_objective` keeps its name and becomes what every reader already treats
-- it as: the task's headline. The Turkish leg is appended (CREATE OR REPLACE
-- can only add columns at the END — hence the position, not preference).
-- Fallback chain identical to v_live_ops so the same task reads the same
-- everywhere: label → first line of objective (never a mid-word cut).

BEGIN;

CREATE OR REPLACE VIEW public.v_decision_log
WITH (security_invoker = true) AS
 SELECT d.id,
    d.decided_by,
    d.decision,
    d.rationale,
    d.data_used,
    d.alternatives,
    d.confidence,
    d.risk,
    d.approval_id,
    d.outcome,
    d.created_at,
    d.run_id,
    r.task_id,
    ag.slug AS employee,
    COALESCE(t.label, NULLIF(btrim(split_part(t.objective, E'\n', 1)), '')) AS task_objective,
    COALESCE(t.label_tr, t.label,
             NULLIF(btrim(split_part(t.objective, E'\n', 1)), '')) AS task_label_tr
   FROM decision_log d
     LEFT JOIN agent_runs r ON r.id = d.run_id
     LEFT JOIN agents ag ON ag.id = r.employee_id
     LEFT JOIN tasks t ON t.id = r.task_id;

CREATE OR REPLACE VIEW public.v_approvals_center AS
 SELECT a.id,
    a.status,
    a.action_type,
    a.operation,
    a.operation_class,
    a.risk_class,
    a.purpose,
    a.payload,
    a.cost_estimate,
    a.deadline,
    a.model_to_use,
    a.affected_systems,
    a.affected_files,
    a.recommended_action,
    a.reasoning_summary,
    a.alternatives,
    a.previous_reviews,
    a.created_at,
    a.decided_by,
    a.decided_at,
    a.decided_action,
    a.decision_note,
    a.modifications,
    a.policy_change_id,
    a.reanalysis_run_id,
    a.task_id,
    a.project_id,
    fn_is_money_out(a.operation_class, a.action_type) AS money_out,
    a.status = 'pending'::text AND a.created_at < (now() - '7 days'::interval) AS stale,
    a.status = 'pending'::text AND a.deadline IS NOT NULL AND now() > a.deadline AS expired,
    EXTRACT(epoch FROM now() - a.created_at)::bigint AS age_seconds,
    req.slug AS requester_slug,
    req.title AS requester_title,
    req.title_tr AS requester_title_tr,
    COALESCE(req.department, t.department) AS department,
    del.slug AS delegated_to_slug,
    COALESCE(t.label, NULLIF(btrim(split_part(t.objective, E'\n', 1)), '')) AS task_objective,
    p.name AS project_name,
    t.budget_max_cost_eur AS task_budget_ceiling_eur,
    t.due_at AS task_due_at,
    dep.display_name AS department_display,
    dep.display_name_tr AS department_display_tr,
    COALESCE(t.label_tr, t.label,
             NULLIF(btrim(split_part(t.objective, E'\n', 1)), '')) AS task_label_tr
   FROM approvals a
     LEFT JOIN agents req ON req.id = a.requester_employee_id
     LEFT JOIN agents del ON del.id = a.delegated_to
     LEFT JOIN tasks t ON t.id = a.task_id
     LEFT JOIN projects p ON p.id = a.project_id
     LEFT JOIN departments dep ON dep.slug = COALESCE(req.department, t.department)
  WHERE a.status <> 'draft'::text
  ORDER BY (a.status = 'pending'::text) DESC,
           (fn_is_money_out(a.operation_class, a.action_type)) DESC,
           a.created_at;

COMMIT;

-- ROLLBACK: recreate both views with `t.objective AS task_objective` and no
--           task_label_tr column (definitions above, minus the two changes).
