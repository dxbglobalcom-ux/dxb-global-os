-- E12.5 / D10 economic-frame visibility on the approval surface
-- (00-CEO-DIRECTIVE-REVENUE-FIRST §3-bis D10: "Approval-facing surfaces must
-- render the frame"). v_approvals_center already joins tasks for
-- task_objective; task-born approvals leave approval-level cost_estimate /
-- deadline NULL, so the CEO saw an approval with no economic context. The
-- view now also exposes the task's binding frame — budget ceiling and due —
-- appended LAST (CREATE OR REPLACE VIEW may only add trailing columns).

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
    t.due_at AS task_due_at
   FROM approvals a
     LEFT JOIN agents req ON req.id = a.requester_employee_id
     LEFT JOIN agents del ON del.id = a.delegated_to
     LEFT JOIN tasks t ON t.id = a.task_id
     LEFT JOIN projects p ON p.id = a.project_id
  WHERE a.status <> 'draft'::text
  ORDER BY (a.status = 'pending'::text) DESC, (fn_is_money_out(a.operation_class, a.action_type)) DESC, a.created_at;

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- -- re-run the previous body (this file minus the two trailing task_* columns).
-- COMMIT;
