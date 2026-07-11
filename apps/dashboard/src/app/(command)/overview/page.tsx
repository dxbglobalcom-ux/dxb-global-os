import Link from "next/link";
import { HealthRing, Panel, Stat, StatusBadge } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// Executive Overview v2 (E3.2 + C-Hibrit R-kapısı 2026-07-11) — single
// round-trip on v_exec_overview (0025x catalog, E4.5; v_exec_overview_v1
// stays as compat alias). New-family figures (agent runs, workflow runs,
// projects) drill into their WS-A pages — drill-down descends into the
// new families. Kompozisyon R13+R3: Holding Health radial (§13) + KPI şeridi
// ilk viewport'ta; ölü boşluk §35 ihlalidir. EVERY figure is a drill
// door (CC-SPEC madde 2B) — a summary without a target may not render.
// No fake metrics (§35): health skoru aşağıda görünür formülle GERÇEK
// alanlardan türetilir, her etken kendi kanıt satırını gösterir.

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

export default async function OverviewPage() {
  const dict = getDict(await getLocale());
  const t = dict.command.overview;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_exec_overview")
    .select("*")
    .single<ExecOverview>();

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={t.title} state="error">
          <p className="text-body-s text-status-danger">
            v_exec_overview: {error?.message ?? "no row"}
          </p>
        </Panel>
      </div>
    );
  }

  const capPct =
    data.monthly_cap_eur > 0
      ? Math.min(100, (data.cost_month_eur / data.monthly_cap_eur) * 100)
      : 0;

  // Holding Health (§13) — şeffaf ceza formülü, tamamı gerçek alanlardan.
  // Etkenler panelde kanıt satırı olarak listelenir; uydurma skor yok.
  const factors: { label: string; penalty: number; href: string }[] = [];
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
  const healthScore = Math.max(
    5,
    100 - factors.reduce((sum, f) => sum + f.penalty, 0),
  );
  const healthBand =
    healthScore >= 85 ? "ok" : healthScore >= 60 ? "warn" : "danger";

  const oldestPendingHours = data.oldest_pending_at
    ? Math.floor(
        (Date.now() - new Date(data.oldest_pending_at).getTime()) / 3_600_000,
      )
    : null;

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
        <Panel title={t.healthTitle}>
          <div className="flex items-center gap-5">
            <HealthRing score={healthScore} band={healthBand} size={150} />
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
                      <span className="min-w-0 truncate text-ink-secondary">
                        {f.label}
                      </span>
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
          <Stat
            label={t.statActiveTasks}
            value={String(data.active_tasks)}
            glow
            drillHref="/ops/tasks?state=active"
          />
          <Stat
            label={t.statPendingApprovals}
            value={String(data.pending_approvals)}
            glow
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
            value={new Intl.NumberFormat("en", {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(Number(data.tokens_7d))}
            drillHref="/fin/tokens?range=week"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
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
            {/* E4.5: WS-A family figures — every drill lands in its new-family page */}
            <li>
              <Link
                href="/ops/runtime"
                className="flex justify-between rounded-input px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
              >
                <span className="text-ink-secondary">{t.runsActive}</span>
                <span className="font-data text-ink-primary tabular-nums">
                  {data.runs_active}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/ops/workflows"
                className="flex justify-between rounded-input px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
              >
                <span className="text-ink-secondary">{t.workflowRuns}</span>
                <span className="font-data text-ink-primary tabular-nums">
                  {data.workflow_runs_active}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/ops/projects"
                className="flex justify-between rounded-input px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
              >
                <span className="text-ink-secondary">{t.projectsActive}</span>
                <span className="font-data text-ink-primary tabular-nums">
                  {data.projects_active}
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

        <Panel title={t.attentionTitle}>
          {factors.length === 0 && oldestPendingHours === null ? (
            <p className="text-body-s text-status-ok">{t.attentionNone}</p>
          ) : (
            <ul className="space-y-2 text-body-s">
              {data.pending_high_risk > 0 && (
                <li>
                  <Link
                    href="/approvals?state=pending&risk=high"
                    className="flex items-center justify-between rounded-input px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
                  >
                    <span className="text-ink-secondary">{t.highRisk}</span>
                    <StatusBadge level="warn">
                      {data.pending_high_risk}
                    </StatusBadge>
                  </Link>
                </li>
              )}
              {data.failed_tasks_24h > 0 && (
                <li>
                  <Link
                    href="/ops/tasks?state=failed&range=24h"
                    className="flex items-center justify-between rounded-input px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
                  >
                    <span className="text-ink-secondary">{t.failed24h}</span>
                    <StatusBadge level="danger">
                      {data.failed_tasks_24h}
                    </StatusBadge>
                  </Link>
                </li>
              )}
              {oldestPendingHours !== null && (
                <li>
                  <Link
                    href="/approvals?state=pending"
                    className="flex items-center justify-between rounded-input px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
                  >
                    <span className="text-ink-secondary">
                      {t.attentionOldest}
                    </span>
                    <span className="font-data text-ink-primary tabular-nums">
                      {oldestPendingHours}h
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
