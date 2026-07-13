import Link from "next/link";
import { notFound } from "next/navigation";
import { HealthRing, Panel, StatusBadge, type StatusLevel } from "@/components/primitives";
import {
  fmtDate,
  fmtTokens,
  healthBand,
  mapProjectRow,
  type ProjectCommandViewRow,
} from "@/lib/projects-command";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /ops/projects/[slug] — Project Command View (E9.4, PROJECT_OS §7; directive
// §23's 19 fields in one composition): top strip (purpose, strategic tie,
// live health + §10 breakdown, current phase) · center time axis (phase
// blocks + milestone markers + today line — NO task-bar forest) · left
// column staff/departments (fixed core vs actually-worked, §27 both labeled)
// · right rail risks / decisions / approvals / blockers · bottom band cost +
// token totals and files / repos / deploys / deliverables links. Every
// number is a door (G2 drill chain). Data: v_project_command single
// round-trip + per-section detail queries.

export const metadata = { title: "Project Command — DXB" };

const STATUS_LEVEL: Record<string, StatusLevel> = {
  draft: "info",
  active: "ok",
  paused: "warn",
  done: "info",
  archived: "info",
};

const RISK_LEVEL: Record<string, StatusLevel> = {
  low: "info",
  medium: "warn",
  high: "danger",
  critical: "critical",
};

type MilestoneRow = {
  id: string;
  kind: string;
  seq: number;
  title: string;
  due_at: string | null;
  reached_at: string | null;
  plan_ref: string | null;
};

type MemberRow = { employee_id: string; role: string };
type AgentRow = {
  id: string;
  slug: string;
  title: string | null;
  title_tr: string | null;
  department: string;
};
type TaskRow = {
  id: string;
  agent_id: string | null;
  department: string;
  status: string;
  objective: string;
};
type RiskRow = {
  id: string;
  title: string;
  severity: string;
  status: string;
  note: string | null;
  updated_at: string;
};
type DepRow = { task_id: string; depends_on: string };
type RunRow = { id: string };
type DecisionRow = {
  id: number;
  decided_by: string;
  decision: string;
  rationale: string;
  risk: string | null;
  created_at: string;
};
type ApprovalRow = {
  id: string;
  status: string;
  operation: string | null;
  operation_class: string | null;
  risk_class: string;
  created_at: string;
};
type WorkflowRow = { id: string; slug: string; name: string; enabled: boolean };
type CostRow = {
  created_at: string;
  cost_eur: number | string;
  prompt_tokens: number;
  completion_tokens: number;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="label-caps mb-2 text-ink-muted">{title}</h3>
      {children}
    </section>
  );
}

function PenaltyBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-36 shrink-0 truncate text-caption text-ink-muted">{label}</span>
      <div className="h-1 flex-1 rounded-full bg-surface-anthracite">
        <div
          className={`h-1 rounded-full ${value > 0 ? "bg-status-warn" : "bg-status-ok"}`}
          style={{ width: `${Math.max(pct, value > 0 ? 8 : 0)}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right font-data text-caption tabular-nums text-ink-secondary">
        −{value}/{max}
      </span>
    </div>
  );
}

export default async function ProjectCommandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = getDict(locale).command.projects;
  const ui = t.ui;
  const supabase = await createClient();

  const { data: viewRow } = await supabase
    .from("v_project_command")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!viewRow) notFound();
  const p = mapProjectRow(viewRow as unknown as ProjectCommandViewRow);

  const [msRes, memberRes, taskRes, riskRes, approvalRes, wfRes] = await Promise.all([
    supabase
      .from("project_milestones")
      .select("id, kind, seq, title, due_at, reached_at, plan_ref")
      .eq("project_id", p.id)
      .order("seq", { ascending: true }),
    supabase.from("project_members").select("employee_id, role").eq("project_id", p.id),
    supabase
      .from("tasks")
      .select("id, agent_id, department, status, objective")
      .eq("project_id", p.id)
      .limit(500),
    supabase
      .from("project_risks")
      .select("id, title, severity, status, note, updated_at")
      .eq("project_id", p.id)
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("v_approvals_center")
      .select("id, status, operation, operation_class, risk_class, created_at")
      .eq("project_id", p.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("workflows").select("id, slug, name, enabled").eq("project_id", p.id),
  ]);

  const milestones = (msRes.data ?? []) as MilestoneRow[];
  const members = (memberRes.data ?? []) as MemberRow[];
  const tasks = (taskRes.data ?? []) as TaskRow[];
  const risks = (riskRes.data ?? []) as RiskRow[];
  const approvals = (approvalRes.data ?? []) as ApprovalRow[];
  const workflows = (wfRes.data ?? []) as WorkflowRow[];

  const taskIds = tasks.map((x) => x.id);
  const workedAgentIds = [...new Set(tasks.map((x) => x.agent_id).filter(Boolean))] as string[];
  const agentIds = [...new Set([...members.map((m) => m.employee_id), ...workedAgentIds])];

  const [agentRes, depRes, runRes, costRes] = await Promise.all([
    agentIds.length
      ? supabase.from("agents").select("id, slug, title, title_tr, department").in("id", agentIds)
      : Promise.resolve({ data: [] as AgentRow[] }),
    taskIds.length
      ? supabase.from("task_dependencies").select("task_id, depends_on").in("task_id", taskIds)
      : Promise.resolve({ data: [] as DepRow[] }),
    taskIds.length
      ? supabase.from("agent_runs").select("id").in("task_id", taskIds).limit(1000)
      : Promise.resolve({ data: [] as RunRow[] }),
    taskIds.length
      ? supabase
          .from("cost_ledger")
          .select("created_at, cost_eur, prompt_tokens, completion_tokens")
          .in("task_id", taskIds)
          .limit(2000)
      : Promise.resolve({ data: [] as CostRow[] }),
  ]);

  const agents = new Map(((agentRes.data ?? []) as AgentRow[]).map((a) => [a.id, a]));
  const deps = (depRes.data ?? []) as DepRow[];
  const runIds = ((runRes.data ?? []) as RunRow[]).map((r) => r.id);

  const { data: decisionData } = runIds.length
    ? await supabase
        .from("decision_log")
        .select("id, decided_by, decision, rationale, risk, created_at")
        .in("run_id", runIds)
        .order("created_at", { ascending: false })
        .limit(8)
    : { data: [] as DecisionRow[] };
  const decisions = (decisionData ?? []) as DecisionRow[];

  const taskById = new Map(tasks.map((x) => [x.id, x]));
  const blockerRows = deps.filter((d) => {
    const down = taskById.get(d.task_id);
    const up = taskById.get(d.depends_on);
    return down && down.status !== "done" && up && up.status !== "done";
  });

  // ── cost/token daily aggregation (last 14 days, Berlin ledger timezone) ──
  const daily = new Map<string, { cost: number; tokens: number }>();
  for (const c of (costRes.data ?? []) as CostRow[]) {
    const day = c.created_at.slice(0, 10);
    const cur = daily.get(day) ?? { cost: 0, tokens: 0 };
    cur.cost += Number(c.cost_eur);
    cur.tokens += c.prompt_tokens + c.completion_tokens;
    daily.set(day, cur);
  }
  const trend = [...daily.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-14);
  const maxDayCost = Math.max(...trend.map(([, v]) => v.cost), 0.01);

  // ── timeline geometry: dated entries positioned on [min..max], undated on
  //    the "unscheduled" strip (§27) ─────────────────────────────────────────
  const dated = milestones.filter((m) => m.due_at || m.reached_at);
  const undated = milestones.filter((m) => !m.due_at && !m.reached_at);
  const ts = (m: MilestoneRow) => new Date((m.reached_at ?? m.due_at) as string).getTime();
  const now = Date.now();
  const tMin = dated.length ? Math.min(...dated.map(ts), now) : now;
  const tMax = dated.length ? Math.max(...dated.map(ts), now) : now;
  const span = Math.max(tMax - tMin, 1);
  const pos = (time: number) => ((time - tMin) / span) * 100;

  const band = healthBand(p.health);
  const statuses = ui.statuses as Record<string, string>;
  const riskStatuses = ui.riskStatuses as Record<string, string>;
  const severities = ui.severities as Record<string, string>;
  const dateLocale = locale === "tr" ? "tr-TR" : "en-GB";
  const penMax = { criticalRisk: 25, highRisks: 30, lateMilestones: 20, failedRuns: 20, blockers: 10, budgetBurn: 10 };

  const memberCards = members.map((m) => ({
    agent: agents.get(m.employee_id),
    role: m.role,
    worked: workedAgentIds.includes(m.employee_id),
  }));
  const workedOnly = workedAgentIds
    .filter((id) => !members.some((m) => m.employee_id === id))
    .map((id) => agents.get(id))
    .filter(Boolean) as AgentRow[];
  const departments = [
    ...new Set([
      ...memberCards.map((m) => m.agent?.department).filter(Boolean),
      ...tasks.map((x) => x.department),
    ]),
  ] as string[];

  const linkGroups: Array<[string, string[]]> = [
    [ui.repos, p.links.repos],
    [ui.files, p.links.docs],
    [ui.deploys, p.links.deploys],
    [ui.deliverables, p.links.deliverables],
    [ui.versions, p.links.versions],
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <nav className="text-body-s text-ink-muted">
        <Link href="/ops/projects" className="hover:text-accent-champagne">
          {t.title}
        </Link>{" "}
        / <span className="text-ink-secondary">{p.name}</span>
      </nav>

      {/* ── top strip: purpose · strategy · phase · health (§23 1,2,3,19) ── */}
      <Panel>
        <div className="flex flex-wrap items-start gap-6 p-5">
          <div className="min-w-[280px] flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-h2 text-ink-primary">{p.name}</h1>
              <StatusBadge level={STATUS_LEVEL[p.status] ?? "info"}>
                {statuses[p.status] ?? p.status}
              </StatusBadge>
            </div>
            <p className="mt-2 max-w-[70ch] text-body-s text-ink-secondary">{p.purpose}</p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="label-caps text-ink-muted">{ui.strategyLink}</dt>
              <dd className="text-body-s text-ink-secondary">{p.strategyLink ?? "—"}</dd>
              <dt className="label-caps text-ink-muted">{ui.currentPhase}</dt>
              <dd className="text-body-s text-accent-champagne">
                {p.currentPhase ?? ui.allPhasesReached}
              </dd>
              <dt className="label-caps text-ink-muted">{ui.owner}</dt>
              <dd className="text-body-s text-ink-secondary">
                {p.ownerSlug ? (
                  <Link href="/org/employees" className="hover:text-accent-champagne">
                    {(locale === "tr" ? p.ownerTitleTr : p.ownerTitle) ?? p.ownerSlug}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </dl>
          </div>
          <div className="flex items-center gap-6">
            <HealthRing score={p.health} band={band} size={132} />
            <div className="w-72 space-y-1.5">
              <p className="label-caps text-ink-muted">{ui.healthBreakdown}</p>
              <PenaltyBar label={ui.penCriticalRisk} value={p.penalties.criticalRisk} max={penMax.criticalRisk} />
              <PenaltyBar label={ui.penHighRisks} value={p.penalties.highRisks} max={penMax.highRisks} />
              <PenaltyBar label={ui.penLateMilestones} value={p.penalties.lateMilestones} max={penMax.lateMilestones} />
              <PenaltyBar label={ui.penFailedRuns} value={p.penalties.failedRuns} max={penMax.failedRuns} />
              <PenaltyBar label={ui.penBlockers} value={p.penalties.blockers} max={penMax.blockers} />
              <PenaltyBar label={ui.penBudgetBurn} value={p.penalties.budgetBurn} max={penMax.budgetBurn} />
            </div>
          </div>
        </div>
      </Panel>

      {/* ── center canvas: time axis (§23 4,16) — phase blocks + today line ── */}
      <Panel>
        <div className="p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-h4 text-ink-primary">{ui.timeline}</h2>
            <span className="font-data text-caption tabular-nums text-ink-muted">
              {ui.milestonesReachedOf
                .replace("{reached}", String(p.milestonesReached))
                .replace("{total}", String(p.milestonesTotal))}
            </span>
          </div>
          {dated.length === 0 && undated.length === 0 ? (
            <p className="py-8 text-center text-body-s text-ink-muted">{ui.noMilestones}</p>
          ) : (
            <>
              {dated.length > 0 ? (
                <div className="overflow-hidden">
                  {/* mx gutters keep the ±half-label overhang inside the panel */}
                  <div className="relative mx-20 mt-4 h-44">
                    <div className="absolute inset-x-0 top-20 h-px bg-edge-neutral" />
                    <div
                      className="absolute top-6 bottom-6 w-px bg-accent-champagne"
                      style={{ left: `${pos(now)}%`, boxShadow: "0 0 8px rgba(216,185,140,0.5)" }}
                    >
                      <span className="absolute -bottom-5 left-1/2 label-caps -translate-x-1/2 whitespace-nowrap text-accent-champagne">
                        {ui.today}
                      </span>
                    </div>
                    {dated.map((m, i) => {
                      const reached = m.reached_at !== null;
                      const late =
                        !reached && m.due_at !== null && new Date(m.due_at).getTime() < now;
                      // three label rows (relative to the dot) — same-date
                      // milestones stack without collision
                      const row = ["top-8", "-top-16", "top-[68px]"][i % 3];
                      return (
                        <div
                          key={m.id}
                          className="group absolute"
                          style={{ left: `${pos(ts(m))}%`, top: m.kind === "phase" ? "72px" : "76px" }}
                        >
                          <div
                            className={
                              m.kind === "phase"
                                ? `h-4 w-4 -translate-x-1/2 rounded-sm border ${
                                    reached
                                      ? "border-status-ok bg-status-ok/30"
                                      : late
                                        ? "border-status-danger bg-status-danger/20"
                                        : "border-edge-champagne bg-surface-anthracite"
                                  }`
                                : `h-2.5 w-2.5 -translate-x-1/2 rotate-45 border ${
                                    reached
                                      ? "border-status-ok bg-status-ok/40"
                                      : late
                                        ? "border-status-danger bg-status-danger/30"
                                        : "border-ink-muted bg-surface-anthracite"
                                  }`
                            }
                          />
                          <div
                            className={`absolute left-0 w-32 -translate-x-1/2 text-center ${row}`}
                          >
                            <p className="truncate text-caption text-ink-secondary" title={m.title}>
                              {m.title}
                            </p>
                            <p className="font-data text-caption tabular-nums text-ink-muted">
                              {fmtDate(m.reached_at ?? m.due_at, locale)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {undated.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-edge-neutral pt-3">
                  <span className="label-caps text-ink-muted">{ui.unscheduled}</span>
                  {undated.map((m) => (
                    <span
                      key={m.id}
                      className="rounded-input border border-edge-neutral px-2 py-0.5 text-caption text-ink-secondary"
                    >
                      {m.title}
                    </span>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </Panel>

      {/* three-lane at 2xl; below that the task lane spans full width and the
          staff / rail panels sit side by side — no horizontal overflow */}
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        {/* ── left column: staff + departments (§23 5,6; §27 dual labels) ── */}
        <Panel className="2xl:order-1">
          <div className="space-y-5 p-4">
            <Section title={`${ui.staff} (${p.memberCount})`}>
              {memberCards.length === 0 ? (
                <p className="text-caption text-ink-muted">{ui.noStaff}</p>
              ) : (
                <ul className="space-y-2">
                  {memberCards.map((m) => (
                    <li key={m.agent?.id ?? m.role} className="flex items-center justify-between gap-2">
                      <Link
                        href="/org/employees"
                        className="min-w-0 truncate text-body-s text-ink-secondary hover:text-accent-champagne"
                      >
                        {(locale === "tr" ? m.agent?.title_tr : m.agent?.title) ??
                          m.agent?.slug ??
                          "—"}
                      </Link>
                      <span className="label-caps shrink-0 text-ink-muted">
                        {(ui.roles as Record<string, string>)[m.role] ?? m.role}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
            {workedOnly.length > 0 ? (
              <Section title={`${ui.actuallyWorked} (${workedOnly.length})`}>
                <ul className="space-y-2">
                  {workedOnly.map((a) => (
                    <li key={a.id}>
                      <Link
                        href="/org/employees"
                        className="text-body-s text-ink-secondary hover:text-accent-champagne"
                      >
                        {(locale === "tr" ? a.title_tr : a.title) ?? a.slug}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}
            <Section title={`${ui.departments} (${departments.length})`}>
              {departments.length === 0 ? (
                <p className="text-caption text-ink-muted">—</p>
              ) : (
                <ul className="flex flex-wrap gap-1.5">
                  {departments.map((d) => (
                    <li key={d}>
                      <Link
                        href="/org/departments"
                        className="rounded-input border border-edge-neutral px-2 py-0.5 text-caption text-ink-secondary hover:border-edge-champagne"
                      >
                        {d}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
            <Section title={`${ui.workflows} (${workflows.length})`}>
              {workflows.length === 0 ? (
                <p className="text-caption text-ink-muted">{ui.noWorkflows}</p>
              ) : (
                <ul className="space-y-1.5">
                  {workflows.map((w) => (
                    <li key={w.id} className="flex items-center justify-between gap-2">
                      <Link
                        href="/ops/workflows"
                        className="min-w-0 truncate text-body-s text-ink-secondary hover:text-accent-champagne"
                      >
                        {w.name}
                      </Link>
                      <StatusBadge level={w.enabled ? "ok" : "info"}>
                        {w.enabled ? ui.enabled : ui.disabled}
                      </StatusBadge>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        </Panel>

        {/* ── middle: tasks (§23 tasks under timeline) ── */}
        <Panel className="md:col-span-2 2xl:order-2 2xl:col-span-1">
          <div className="p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="font-display text-h4 text-ink-primary">
                {ui.tasks}{" "}
                <span className="font-data text-body-s tabular-nums text-ink-muted">
                  {p.tasksActive}/{p.tasksTotal} {ui.active}
                </span>
              </h2>
              <Link href="/ops/tasks" className="text-caption text-accent-champagne hover:underline">
                {ui.openTasks} →
              </Link>
            </div>
            {tasks.length === 0 ? (
              <p className="py-8 text-center text-body-s text-ink-muted">{ui.noTasks}</p>
            ) : (
              <ul className="mt-3 divide-y divide-edge-neutral">
                {tasks.slice(0, 12).map((x) => (
                  <li key={x.id} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0 truncate text-body-s text-ink-secondary">
                      {x.objective}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="label-caps text-ink-muted">{x.department}</span>
                      <StatusBadge
                        level={
                          x.status === "done"
                            ? "ok"
                            : x.status === "failed"
                              ? "danger"
                              : x.status === "running"
                                ? "info"
                                : "info"
                        }
                      >
                        {(ui.taskStatuses as Record<string, string>)[x.status] ?? x.status}
                      </StatusBadge>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {tasks.length > 12 ? (
              <p className="mt-2 text-caption text-ink-muted">
                {ui.moreTasks.replace("{n}", String(tasks.length - 12))}
              </p>
            ) : null}
          </div>
        </Panel>

        {/* ── right rail: risks · decisions · approvals · blockers (§23 9-11,17,18) ── */}
        <Panel className="2xl:order-3">
          <div className="space-y-5 p-4">
            <Section title={`${ui.risks} (${p.risksOpen} ${ui.open})`}>
              {risks.length === 0 ? (
                <p className="text-caption text-ink-muted">{ui.noRisks}</p>
              ) : (
                <ul className="space-y-2">
                  {risks.slice(0, 6).map((r) => (
                    <li key={r.id} className="rounded-input border border-edge-neutral p-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-body-s text-ink-secondary">
                          {r.title}
                        </span>
                        <StatusBadge level={RISK_LEVEL[r.severity] ?? "info"}>
                          {severities[r.severity] ?? r.severity}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 text-caption text-ink-muted">
                        {riskStatuses[r.status] ?? r.status} · {fmtDate(r.updated_at, locale)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
            <Section title={`${ui.blockers} (${p.blockersCount})`}>
              {blockerRows.length === 0 && p.blockerApprovals === 0 ? (
                <p className="text-caption text-ink-muted">{ui.noBlockers}</p>
              ) : (
                <ul className="space-y-1.5">
                  {blockerRows.slice(0, 5).map((d) => (
                    <li key={`${d.task_id}-${d.depends_on}`} className="text-caption text-ink-secondary">
                      <span className="truncate">{taskById.get(d.task_id)?.objective}</span>{" "}
                      <span className="text-ink-muted">← {taskById.get(d.depends_on)?.objective}</span>
                    </li>
                  ))}
                  {p.blockerApprovals > 0 ? (
                    <li>
                      <Link
                        href="/approvals"
                        className="text-caption text-status-warn hover:underline"
                      >
                        {ui.pendingApprovalBlockers.replace("{n}", String(p.blockerApprovals))} →
                      </Link>
                    </li>
                  ) : null}
                </ul>
              )}
            </Section>
            <Section title={`${ui.decisions} (${p.decisionsCount})`}>
              {decisions.length === 0 ? (
                <p className="text-caption text-ink-muted">{ui.noDecisions}</p>
              ) : (
                <ul className="space-y-2">
                  {decisions.map((d) => (
                    <li key={d.id}>
                      <Link
                        href="/gov/decisions"
                        className="block text-body-s text-ink-secondary hover:text-accent-champagne"
                      >
                        <span className="line-clamp-2">{d.decision}</span>
                        <span className="font-data text-caption tabular-nums text-ink-muted">
                          {d.decided_by} · {fmtDate(d.created_at, locale)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
            <Section title={`${ui.approvals} (${p.approvalsPending} ${ui.pending})`}>
              {approvals.length === 0 ? (
                <p className="text-caption text-ink-muted">{ui.noApprovals}</p>
              ) : (
                <ul className="space-y-1.5">
                  {approvals.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2">
                      <Link
                        href={`/approvals/${a.id}`}
                        className="min-w-0 truncate text-body-s text-ink-secondary hover:text-accent-champagne"
                      >
                        {a.operation ?? a.operation_class ?? a.id.slice(0, 8)}
                      </Link>
                      <StatusBadge level={a.status === "pending" ? "warn" : "info"}>
                        {(ui.approvalStatuses as Record<string, string>)[a.status] ?? a.status}
                      </StatusBadge>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        </Panel>
      </div>

      {/* ── bottom band: cost/token trend + links (§23 7,8,13,14,15) ── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Panel>
          <div className="p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-h4 text-ink-primary">{ui.costTokens}</h2>
              <div className="flex items-center gap-4 font-data text-body-s tabular-nums">
                <Link href="/fin/costs" className="text-ink-secondary hover:text-accent-champagne">
                  €{p.costTotalEur.toFixed(2)}
                </Link>
                <span className="text-ink-muted">
                  {fmtTokens(p.tokensIn)} {ui.tokensIn} · {fmtTokens(p.tokensOut)} {ui.tokensOut}
                </span>
                {p.links.budgetEur !== null ? (
                  <span className="text-ink-muted">
                    {ui.budget}: €{p.links.budgetEur.toFixed(2)}
                  </span>
                ) : null}
              </div>
            </div>
            {trend.length === 0 ? (
              <p className="py-6 text-center text-caption text-ink-muted">{ui.noSpend}</p>
            ) : (
              <div className="mt-4 flex h-24 items-end gap-1">
                {trend.map(([day, v]) => (
                  <div key={day} className="group flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full max-w-8 rounded-t-sm bg-accent-champagne/40 transition group-hover:bg-accent-champagne/70"
                      style={{ height: `${Math.max((v.cost / maxDayCost) * 100, 3)}%` }}
                      title={`${day} · €${v.cost.toFixed(2)} · ${fmtTokens(v.tokens)}`}
                    />
                    <span className="font-data text-caption tabular-nums text-ink-muted">
                      {new Date(day).toLocaleDateString(dateLocale, { day: "2-digit", month: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
        <Panel>
          <div className="space-y-3 p-4">
            <h2 className="font-display text-h4 text-ink-primary">{ui.linksTitle}</h2>
            {linkGroups.every(([, items]) => items.length === 0) ? (
              <p className="text-caption text-ink-muted">{ui.noLinks}</p>
            ) : (
              linkGroups
                .filter(([, items]) => items.length > 0)
                .map(([label, items]) => (
                  <div key={label}>
                    <p className="label-caps text-ink-muted">{label}</p>
                    <ul className="mt-1 space-y-0.5">
                      {items.map((item) => (
                        <li
                          key={item}
                          className="truncate font-data text-caption text-ink-secondary"
                          title={item}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
