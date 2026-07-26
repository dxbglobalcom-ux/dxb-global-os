// v_project_command row mapping (E9.4) — shared by /ops/projects and
// /ops/projects/[slug] (pages may not export helpers in Next).

export type ProjectCommandViewRow = {
  id: string;
  slug: string;
  name: string;
  purpose: string;
  purpose_tr: string | null;
  strategy_link: string | null;
  status: string;
  health_score: number | string | null;
  links: Record<string, unknown> | null;
  created_at: string;
  owner_employee_id: string | null;
  owner_slug: string | null;
  owner_title: string | null;
  owner_title_tr: string | null;
  company_id: string | null;
  company_slug: string | null;
  member_count: number;
  milestones_total: number;
  milestones_reached: number;
  next_milestone_due: string | null;
  current_phase: string | null;
  tasks_total: number;
  tasks_active: number;
  tasks_failed: number;
  workflows_enabled: number;
  risks_open: number;
  risks_open_high: number;
  decisions_count: number;
  approvals_total: number;
  approvals_pending: number;
  departments_count: number;
  cost_total_eur: number | string;
  tokens_in: number | string;
  tokens_out: number | string;
  last_activity_at: string | null;
  health_live: number;
  pen_critical_risk: number;
  pen_high_risks: number;
  pen_late_milestones: number;
  pen_failed_runs: number;
  pen_blockers: number;
  pen_budget_burn: number;
  blockers_count: number;
  blocker_tasks: number;
  blocker_approvals: number;
};

export type ProjectLinks = {
  repos: string[];
  docs: string[];
  deploys: string[];
  versions: string[];
  deliverables: string[];
  budgetEur: number | null;
};

export function mapLinks(raw: Record<string, unknown> | null): ProjectLinks {
  const list = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  const budget =
    raw && typeof raw.budget_eur === "string" && /^\d+(\.\d+)?$/.test(raw.budget_eur)
      ? Number(raw.budget_eur)
      : null;
  return {
    repos: list(raw?.repos),
    docs: list(raw?.docs),
    deploys: list(raw?.deploys),
    versions: list(raw?.versions),
    deliverables: list(raw?.deliverables),
    budgetEur: budget,
  };
}

export type ProjectCommandRow = {
  id: string;
  slug: string;
  name: string;
  purpose: string;
  purposeTr: string | null;
  strategyLink: string | null;
  status: string;
  createdAt: string;
  ownerSlug: string | null;
  ownerTitle: string | null;
  ownerTitleTr: string | null;
  memberCount: number;
  milestonesTotal: number;
  milestonesReached: number;
  nextMilestoneDue: string | null;
  currentPhase: string | null;
  tasksTotal: number;
  tasksActive: number;
  tasksFailed: number;
  workflowsEnabled: number;
  risksOpen: number;
  risksOpenHigh: number;
  decisionsCount: number;
  approvalsTotal: number;
  approvalsPending: number;
  departmentsCount: number;
  costTotalEur: number;
  tokensIn: number;
  tokensOut: number;
  lastActivityAt: string | null;
  health: number;
  penalties: {
    criticalRisk: number;
    highRisks: number;
    lateMilestones: number;
    failedRuns: number;
    blockers: number;
    budgetBurn: number;
  };
  blockersCount: number;
  blockerTasks: number;
  blockerApprovals: number;
  links: ProjectLinks;
};

export function mapProjectRow(r: ProjectCommandViewRow): ProjectCommandRow {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    purpose: r.purpose,
    purposeTr: r.purpose_tr,
    strategyLink: r.strategy_link,
    status: r.status,
    createdAt: r.created_at,
    ownerSlug: r.owner_slug,
    ownerTitle: r.owner_title,
    ownerTitleTr: r.owner_title_tr,
    memberCount: r.member_count,
    milestonesTotal: r.milestones_total,
    milestonesReached: r.milestones_reached,
    nextMilestoneDue: r.next_milestone_due,
    currentPhase: r.current_phase,
    tasksTotal: r.tasks_total,
    tasksActive: r.tasks_active,
    tasksFailed: r.tasks_failed,
    workflowsEnabled: r.workflows_enabled,
    risksOpen: r.risks_open,
    risksOpenHigh: r.risks_open_high,
    decisionsCount: r.decisions_count,
    approvalsTotal: r.approvals_total,
    approvalsPending: r.approvals_pending,
    departmentsCount: r.departments_count,
    costTotalEur: Number(r.cost_total_eur ?? 0),
    tokensIn: Number(r.tokens_in ?? 0),
    tokensOut: Number(r.tokens_out ?? 0),
    lastActivityAt: r.last_activity_at,
    health: r.health_live,
    penalties: {
      criticalRisk: r.pen_critical_risk,
      highRisks: r.pen_high_risks,
      lateMilestones: r.pen_late_milestones,
      failedRuns: r.pen_failed_runs,
      blockers: r.pen_blockers,
      budgetBurn: r.pen_budget_burn,
    },
    blockersCount: r.blockers_count,
    blockerTasks: r.blocker_tasks,
    blockerApprovals: r.blocker_approvals,
    links: mapLinks(r.links),
  };
}

export function healthBand(score: number): "ok" | "warn" | "danger" {
  if (score >= 80) return "ok";
  if (score >= 50) return "warn";
  return "danger";
}

export function fmtDate(iso: string | null, locale: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
