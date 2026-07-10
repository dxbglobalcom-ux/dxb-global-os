import Link from "next/link";
import { Panel, Stat, StatusBadge } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

// Executive Overview v1 (E3.2) — single round-trip on v_exec_overview_v1
// (E3.1 view, existing schema; v2 swaps to the 0025x catalog at E4.5).
// EVERY figure is a drill door (CC-SPEC madde 2B normative map) — a
// summary without a target may not render. No fake metrics (§35).

export const metadata = { title: "Executive Overview — DXB" };

type ExecOverview = {
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
  cost_today_eur: number;
  cost_7d_eur: number;
  cost_month_eur: number;
  tokens_7d: number;
  monthly_cap_eur: number;
  hard_stopped: boolean;
  breaker_tripped: boolean;
  last_activity_at: string | null;
};

export default async function OverviewPage() {
  const dict = getDict();
  const t = dict.command.overview;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_exec_overview_v1")
    .select("*")
    .single<ExecOverview>();

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={t.title} state="error">
          <p className="text-body-s text-status-danger">
            v_exec_overview_v1: {error?.message ?? "no row"}
          </p>
        </Panel>
      </div>
    );
  }

  const capPct =
    data.monthly_cap_eur > 0
      ? Math.min(100, (data.cost_month_eur / data.monthly_cap_eur) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-h1 text-ink-primary">{t.title}</h1>
        {data.last_activity_at && (
          <span className="font-data text-caption text-ink-muted tabular-nums">
            {t.lastActivity}:{" "}
            {new Date(data.last_activity_at).toLocaleString(undefined, {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {(data.hard_stopped || data.breaker_tripped) && (
        <Panel state="critical">
          <p className="text-body-md text-status-critical">
            {data.hard_stopped ? t.hardStopped : t.breakerTripped}
          </p>
        </Panel>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          label={t.statActiveTasks}
          value={String(data.active_tasks)}
          delta={undefined}
          drillHref="/ops/tasks?state=active"
        />
        <Stat
          label={t.statPendingApprovals}
          value={String(data.pending_approvals)}
          drillHref="/approvals?state=pending"
        />
        <Stat
          label={t.statTodayCost}
          value={Number(data.cost_today_eur).toFixed(2)}
          unit="EUR"
          drillHref="/fin/costs?range=today"
        />
        <Stat
          label={t.tokens7d}
          value={Number(data.tokens_7d).toLocaleString("en")}
          drillHref="/fin/tokens?range=week"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title={t.pulseTitle}>
          <ul className="space-y-2 text-body-s">
            <li>
              <Link
                href="/ops/tasks?state=running"
                className="flex justify-between rounded-input px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
              >
                <span className="text-ink-secondary">{t.runningNow}</span>
                <span className="font-data text-ink-primary tabular-nums">
                  {data.running_tasks}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/ops/tasks?state=queued"
                className="flex justify-between rounded-input px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
              >
                <span className="text-ink-secondary">{t.queued}</span>
                <span className="font-data text-ink-primary tabular-nums">
                  {data.queued_tasks}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/approvals?state=pending"
                className="flex justify-between rounded-input px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
              >
                <span className="text-ink-secondary">{t.awaitingApproval}</span>
                <span className="font-data text-ink-primary tabular-nums">
                  {data.tasks_awaiting_approval}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/ops/tasks?state=failed&range=24h"
                className="flex justify-between rounded-input px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
              >
                <span className="text-ink-secondary">{t.failed24h}</span>
                <span
                  className={`font-data tabular-nums ${
                    data.failed_tasks_24h > 0
                      ? "text-status-danger"
                      : "text-ink-primary"
                  }`}
                >
                  {data.failed_tasks_24h}
                </span>
              </Link>
            </li>
          </ul>
        </Panel>

        <Panel title={t.agents}>
          <Link
            href="/org/employees?status=active"
            className="block rounded-input px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display text-display-lg text-accent-ivory tabular-nums">
                {data.agents_total}
              </span>
              <span className="text-body-s text-ink-secondary">total</span>
            </div>
            <div className="mt-2 flex gap-3 text-body-s">
              <span className="text-status-ok">
                {t.agentsActive}:{" "}
                <span className="font-data tabular-nums">{data.agents_active}</span>
              </span>
              <span className="text-ink-muted">
                {t.agentsDormant}:{" "}
                <span className="font-data tabular-nums">{data.agents_dormant}</span>
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

        <Panel title={t.budgetMonth}>
          <Link
            href="/fin/budgets"
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
      </div>
    </div>
  );
}
