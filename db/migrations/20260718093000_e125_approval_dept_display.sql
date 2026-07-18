-- E12.5 / RULE #0 in-pass fix: v_approvals_center exposed only the department
-- SLUG; the TR surface rendered "finance" raw (bilingual-purity law counts DB
-- text as i18n surface — display_name/display_name_tr exist for exactly this).
-- Appends the display pair (trailing columns only, CREATE OR REPLACE VIEW law).

BEGIN;

CREATE OR REPLACE VIEW v_approvals_center AS
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
    t.objective AS task_objective,
    p.name AS project_name,
    t.budget_max_cost_eur AS task_budget_ceiling_eur,
    t.due_at AS task_due_at,
    dep.display_name AS department_display,
    dep.display_name_tr AS department_display_tr
   FROM approvals a
     LEFT JOIN agents req ON req.id = a.requester_employee_id
     LEFT JOIN agents del ON del.id = a.delegated_to
     LEFT JOIN tasks t ON t.id = a.task_id
     LEFT JOIN projects p ON p.id = a.project_id
     LEFT JOIN departments dep ON dep.slug = COALESCE(req.department, t.department)
  WHERE a.status <> 'draft'::text
  ORDER BY (a.status = 'pending'::text) DESC, (fn_is_money_out(a.operation_class, a.action_type)) DESC, a.created_at;

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- -- re-run the 20260718092000 body (this view minus the department_display pair).
-- COMMIT;
