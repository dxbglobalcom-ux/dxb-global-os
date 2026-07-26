import Link from "next/link";
import { HealthRing, Panel, Stat, StatusBadge } from "@/components/primitives";
import { WIDGET_META, type WidgetType } from "./types";

// E12.2 — WidgetRegistry (CC-SPEC §11): the single in-code table binding
// every widget type to its source view and its server-rendered content.
// Content stays RSC (data fetched once by the page, single round-trip on
// v_exec_overview); the client grid island only ARRANGES the rendered
// nodes. A type absent from WIDGET_META/renderers cannot register —
// `tests/e122` proves the completeness both ways.

export type ExecOverview = {
  active_tasks: number;
  running_tasks: number;
  queued_tasks: number;
  tasks_awaiting_approval: number;
  failed_tasks_24h: number;
  pending_approvals: number;
  pending_high_risk: number;
  oldest_pending_at: string | null;
  agents_total: number;
  agents_active: number;
  agents_dormant: number;
  runs_active: number;
  runs_waiting_approval: number;
  projects_active: number;
  projects_total: number;
  workflow_runs_active: number;
  cost_today_eur: number;
  cost_7d_eur: number;
  cost_month_eur: number;
  tokens_7d: number;
  monthly_cap_eur: number;
  hard_stopped: boolean;
  breaker_tripped: boolean;
  last_activity_at: string | null;
};

export interface HealthFactor {
  label: string;
  penalty: number;
  href: string;
}

/** Holding Health (§13) — transparent penalty formula over REAL fields;
 *  factors render as evidence rows (no invented score). Shared by the
 *  health widget and the page header logic. */
export function healthFactors(
  data: ExecOverview,
  t: Record<string, string>,
): { factors: HealthFactor[]; score: number; band: "ok" | "warn" | "danger"; capPct: number } {
  const capPct =
    data.monthly_cap_eur > 0
      ? Math.min(100, (data.cost_month_eur / data.monthly_cap_eur) * 100)
      : 0;
  const factors: HealthFactor[] = [];
  if (data.breaker_tripped)
    factors.push({ label: t.factorBreaker, penalty: 40, href: "/fin/budgets" });
  if (data.hard_stopped)
    factors.push({ label: t.factorHardStop, penalty: 40, href: "/fin/budgets" });
  if (data.failed_tasks_24h > 0)
    factors.push({
      label: `${t.factorFailed}: ${data.failed_tasks_24h}`,
      penalty: Math.min(24, data.failed_tasks_24h * 8),
      href: "/ops/tasks?state=failed&range=24h",
    });
  if (data.pending_high_risk > 0)
    factors.push({
      label: `${t.factorHighRisk}: ${data.pending_high_risk}`,
      penalty: Math.min(15, data.pending_high_risk * 5),
      href: "/approvals?state=pending&risk=high",
    });
  if (capPct >= 70)
    factors.push({
      label: `${t.factorBudget}: ${capPct.toFixed(0)}%`,
      penalty: capPct >= 100 ? 20 : 10,
      href: "/fin/budgets",
    });
  const score = Math.max(5, 100 - factors.reduce((s, f) => s + f.penalty, 0));
  const band = score >= 85 ? "ok" : score >= 60 ? "warn" : "danger";
  return { factors, score, band, capPct };
}

export interface WidgetRenderCtx {
  data: ExecOverview;
  /** dict.command.overview — existing key family, reused verbatim. */
  t: Record<string, string>;
}

const rowLink =
  "flex justify-between rounded-input px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite";

function PulseRow({
  href,
  label,
  value,
  danger = false,
}: {
  href: string;
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <li>
      <Link href={href} className={rowLink}>
        <span className="text-ink-secondary">{label}</span>
        <span
          className={`font-data tabular-nums ${
            danger ? "text-status-danger" : "text-ink-primary"
          }`}
        >
          {value}
        </span>
      </Link>
    </li>
  );
}

/** Render one widget's CONTENT (frame chrome lives in the grid island). */
export function renderWidget(type: WidgetType, ctx: WidgetRenderCtx): React.ReactNode {
  const { data, t } = ctx;
  const { factors, score, band, capPct } = healthFactors(data, t);
  const oldestPendingHours = data.oldest_pending_at
    ? Math.floor((Date.now() - new Date(data.oldest_pending_at).getTime()) / 3_600_000)
    : null;

  switch (type) {
    case "health":
      return (
        <Panel title={t.healthTitle} className="h-full">
          <div className="flex items-center gap-5">
            <HealthRing score={score} band={band} size={150} />
            <div className="min-w-0 flex-1">
              <div className="label-caps text-ink-muted">{t.healthFactors}</div>
              <ul className="mt-2 space-y-1.5 text-body-s">
                {factors.length === 0 && (
                  <li className="text-status-ok">{t.factorClear}</li>
                )}
                {factors.map((f) => (
                  <li key={f.label}>
                    <Link
                      href={f.href}
                      className="flex justify-between gap-2 rounded-input px-1 py-0.5 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
                    >
                      {/* break-words, no truncate: visible "…" is an automatic
                          A1 FAIL (RULE #0) — long live labels wrap instead. */}
                      <span className="min-w-0 break-words text-ink-secondary">{f.label}</span>
                      <span className="font-data text-status-danger tabular-nums">
                        −{f.penalty}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-3 border-t border-edge-neutral pt-3 text-caption text-ink-muted">
            {t.healthExplain}
          </p>
        </Panel>
      );

    case "stat_active_tasks":
      return (
        <Stat
          label={t.statActiveTasks}
          value={String(data.active_tasks)}
          glow
          drillHref={WIDGET_META.stat_active_tasks.drillHref}
          className="h-full"
        />
      );
    case "stat_pending_approvals":
      return (
        <Stat
          label={t.statPendingApprovals}
          value={String(data.pending_approvals)}
          glow
          drillHref={WIDGET_META.stat_pending_approvals.drillHref}
          className="h-full"
        />
      );
    case "stat_cost_today":
      return (
        <Stat
          label={t.statTodayCost}
          value={Number(data.cost_today_eur).toFixed(2)}
          unit="EUR"
          drillHref={WIDGET_META.stat_cost_today.drillHref}
          className="h-full"
        />
      );
    case "stat_tokens_7d":
      return (
        <Stat
          label={t.tokens7d}
          value={new Intl.NumberFormat("en", {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(Number(data.tokens_7d))}
          drillHref={WIDGET_META.stat_tokens_7d.drillHref}
          className="h-full"
        />
      );

    case "pulse":
      return (
        <Panel title={t.pulseTitle} className="h-full">
          <ul className="space-y-2 text-body-s">
            <PulseRow
              href="/ops/tasks?state=running"
              label={t.runningNow}
              value={data.running_tasks}
            />
            <PulseRow
              href="/ops/tasks?state=queued"
              label={t.queued}
              value={data.queued_tasks}
            />
            <PulseRow
              href="/approvals?state=pending"
              label={t.awaitingApproval}
              value={data.tasks_awaiting_approval}
            />
            <PulseRow
              href="/ops/tasks?state=failed&range=24h"
              label={t.failed24h}
              value={data.failed_tasks_24h}
              danger={data.failed_tasks_24h > 0}
            />
            <PulseRow href="/ops/runtime" label={t.runsActive} value={data.runs_active} />
            <PulseRow
              href="/ops/workflows"
              label={t.workflowRuns}
              value={data.workflow_runs_active}
            />
            <PulseRow
              href="/ops/projects"
              label={t.projectsActive}
              value={data.projects_active}
            />
          </ul>
        </Panel>
      );

    case "agents":
      return (
        <Panel title={t.agents} className="h-full">
          <Link
            href={WIDGET_META.agents.drillHref}
            className="block rounded-input px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display text-display-lg text-accent-ivory tabular-nums">
                {data.agents_total}
              </span>
              <span className="text-body-s text-ink-secondary">{t.agentsTotal}</span>
            </div>
            <div className="mt-2 flex gap-3 text-body-s">
              <span className="text-status-ok">
                {t.agentsActive}: <span className="font-data tabular-nums">{data.agents_active}</span>
              </span>
              <span className="text-ink-muted">
                {t.agentsDormant}: <span className="font-data tabular-nums">{data.agents_dormant}</span>
              </span>
            </div>
          </Link>
          {data.pending_high_risk > 0 && (
            <div className="mt-3">
              <Link href="/approvals?state=pending&risk=high">
                <StatusBadge level="warn">
                  {t.highRisk}: {data.pending_high_risk}
                </StatusBadge>
              </Link>
            </div>
          )}
        </Panel>
      );

    case "budget":
      return (
        <Panel title={t.budgetMonth} className="h-full">
          <Link
            href={WIDGET_META.budget.drillHref}
            className="block rounded-input px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display text-display-lg text-accent-ivory tabular-nums">
                {Number(data.cost_month_eur).toFixed(2)}
              </span>
              <span className="text-body-s text-ink-secondary">
                / {Number(data.monthly_cap_eur).toFixed(0)} EUR
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-input bg-surface-anthracite">
              <div
                className={`h-full rounded-input ${
                  capPct >= 100
                    ? "bg-status-critical"
                    : capPct >= 70
                      ? "bg-status-warn"
                      : "bg-accent-champagne"
                }`}
                style={{ width: `${capPct.toFixed(1)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-caption text-ink-muted">
              <span>
                {t.cost7d}:{" "}
                <span className="font-data tabular-nums">
                  {Number(data.cost_7d_eur).toFixed(2)}
                </span>
              </span>
              <span className="font-data tabular-nums">{capPct.toFixed(0)}%</span>
            </div>
          </Link>
        </Panel>
      );

    case "attention":
      return (
        <Panel title={t.attentionTitle} className="h-full">
          {factors.length === 0 && oldestPendingHours === null ? (
            <p className="text-body-s text-status-ok">{t.attentionNone}</p>
          ) : (
            <ul className="space-y-2 text-body-s">
              {data.pending_high_risk > 0 && (
                <li>
                  <Link href="/approvals?state=pending&risk=high" className={rowLink}>
                    <span className="text-ink-secondary">{t.highRisk}</span>
                    <StatusBadge level="warn">{data.pending_high_risk}</StatusBadge>
                  </Link>
                </li>
              )}
              {data.failed_tasks_24h > 0 && (
                <li>
                  <Link href="/ops/tasks?state=failed&range=24h" className={rowLink}>
                    <span className="text-ink-secondary">{t.failed24h}</span>
                    <StatusBadge level="danger">{data.failed_tasks_24h}</StatusBadge>
                  </Link>
                </li>
              )}
              {oldestPendingHours !== null && (
                <li>
                  <Link href="/approvals?state=pending" className={rowLink}>
                    <span className="text-ink-secondary">{t.attentionOldest}</span>
                    <span className="font-data text-ink-primary tabular-nums">
                      {oldestPendingHours}h
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          )}
        </Panel>
      );
  }
}
