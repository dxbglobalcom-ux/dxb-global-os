import type { CenterRow, FatigueRow } from "@/components/command/approval-center";

// v_approvals_center / v_approval_fatigue row mapping (E9.3) — shared by
// /approvals and /approvals/[id] (pages may not export helpers in Next).

export type CenterViewRow = {
  id: string;
  status: string;
  action_type: string;
  operation: string | null;
  operation_class: string | null;
  risk_class: string;
  purpose: string | null;
  payload: Record<string, unknown> | null;
  cost_estimate: number | string | null;
  deadline: string | null;
  model_to_use: string | null;
  affected_systems: string[] | null;
  affected_files: string[] | null;
  recommended_action: string | null;
  reasoning_summary: string | null;
  alternatives: unknown;
  previous_reviews: unknown;
  modifications: Record<string, unknown> | null;
  policy_change_id: number | null;
  reanalysis_run_id: string | null;
  task_id: string | null;
  project_id: string | null;
  project_name: string | null;
  money_out: boolean;
  stale: boolean;
  expired: boolean;
  age_seconds: number | string;
  requester_slug: string | null;
  requester_title: string | null;
  requester_title_tr: string | null;
  department: string | null;
  delegated_to_slug: string | null;
  /** Task HEADLINE, artifact language (view resolves label → first line). */
  task_objective: string | null;
  task_label_tr: string | null;
  task_budget_ceiling_eur: number | string | null;
  task_due_at: string | null;
  department_display: string | null;
  department_display_tr: string | null;
  created_at: string;
  decided_by: string | null;
  decided_at: string | null;
  decided_action: string | null;
  decision_note: string | null;
};

export function mapCenterRow(r: CenterViewRow): CenterRow {
  return {
    id: r.id,
    status: r.status,
    actionType: r.action_type,
    operation: r.operation,
    operationClass: r.operation_class,
    riskClass: r.risk_class,
    purpose: r.purpose,
    payload: r.payload ?? {},
    costEstimate: r.cost_estimate === null ? null : Number(r.cost_estimate),
    deadline: r.deadline,
    moneyOut: r.money_out,
    stale: r.stale,
    expired: r.expired,
    ageSeconds: Number(r.age_seconds),
    requesterSlug: r.requester_slug,
    department: r.department,
    delegatedToSlug: r.delegated_to_slug,
    taskObjective: r.task_objective,
    taskBudgetCeilingEur:
      r.task_budget_ceiling_eur === null ? null : Number(r.task_budget_ceiling_eur),
    taskDueAt: r.task_due_at,
    departmentDisplay: r.department_display,
    departmentDisplayTr: r.department_display_tr,
    createdAt: r.created_at,
    decidedAt: r.decided_at,
    decidedAction: r.decided_action,
    decisionNote: r.decision_note,
  };
}

export type FatigueViewRow = {
  operation_class: string;
  pending_count: number | string;
  oldest_pending_at: string | null;
  avg_pending_hours: number | string | null;
  decided_7d: number | string;
  approved_7d: number | string;
  avg_decision_minutes_7d: number | string | null;
};

export function mapFatigueRow(f: FatigueViewRow): FatigueRow {
  return {
    operationClass: f.operation_class,
    pendingCount: Number(f.pending_count),
    oldestPendingAt: f.oldest_pending_at,
    avgPendingHours: f.avg_pending_hours === null ? null : Number(f.avg_pending_hours),
    decided7d: Number(f.decided_7d),
    approved7d: Number(f.approved_7d),
    avgDecisionMinutes7d:
      f.avg_decision_minutes_7d === null ? null : Number(f.avg_decision_minutes_7d),
  };
}
