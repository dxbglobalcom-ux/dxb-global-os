import Link from "next/link";
import { Panel, Stat, StatusBadge } from "@/components/primitives";
import { monthStart, postgrestCostSource } from "@/lib/costs";
import { formatEur } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /fin/budgets v1 (E12.1-C) — BudgetBoard (COST spec §5) over the LIVE
// Phase-4 mechanism: budget_state (monthly cap, hard-stop, velocity
// breaker) + month-to-date ledger spend + the cost-channel threshold alert
// history. The scoped budgets table + LiteLLM /key/update dual layer is
// the recorded P7 boundary (COST adaptations A1/A2) — this board shows the
// real brake that exists today, not a mock of the future one.

export const metadata = { title: "Budgets — DXB" };

type BudgetState = {
  monthly_cap_eur: number;
  hard_stopped: boolean;
  velocity_cap_eur_per_hour: number;
  breaker_tripped: boolean;
  breaker_tripped_at: string | null;
  updated_at: string;
};

type AlertRow = {
  id: string;
  level: string;
  title: string;
  at: string;
  resolved_at: string | null;
};

export default async function BudgetsPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.budgets;
  const supabase = await createClient();
  const now = new Date();

  const [stateRes, alertsRes] = await Promise.all([
    supabase.from("budget_state").select("*").maybeSingle(),
    supabase
      .from("alerts")
      .select("id, level, title, at, resolved_at")
      .eq("source", "cost")
      .order("at", { ascending: false })
      .limit(10),
  ]);

  let spent = 0;
  let spendError: string | null = null;
  try {
    spent = await postgrestCostSource(supabase).totalSince(
      monthStart(now).toISOString(),
    );
  } catch (err) {
    spendError = err instanceof Error ? err.message : String(err);
  }

  if (stateRes.error || alertsRes.error || spendError) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.budgets} state="error">
          <p className="text-body-s text-status-danger">
            budget_state:{" "}
            {stateRes.error?.message ?? alertsRes.error?.message ?? spendError}
          </p>
        </Panel>
      </div>
    );
  }

  const state = stateRes.data as BudgetState | null;
  const cap = Number(state?.monthly_cap_eur ?? 0);
  const pct = cap > 0 ? (spent / cap) * 100 : 0;
  const alerts = (alertsRes.data ?? []) as AlertRow[];

  const barColor =
    pct >= 100
      ? "bg-status-critical"
      : pct >= 90
        ? "bg-status-danger"
        : pct >= 70
          ? "bg-status-warn"
          : "bg-accent-champagne";

  const timeFmt = (iso: string) =>
    new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 text-ink-primary">
          {dict.command.nav.pages.budgets}
        </h1>
        <Link href="/fin/costs" className="text-body-s text-accent-champagne">
          {t.viewCosts}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiCap}
          value={formatEur(cap)}
          unit="EUR"
          glow
          drillHref="/fin/budgets"
        />
        <Stat
          label={t.kpiSpent}
          value={formatEur(spent)}
          unit="EUR"
          drillHref="/fin/costs"
        />
        <Stat
          label={t.kpiUsage}
          value={`${pct.toFixed(1)}%`}
          drillHref="/fin/costs"
        />
        <Stat
          label={t.kpiVelocityCap}
          value={formatEur(Number(state?.velocity_cap_eur_per_hour ?? 0))}
          unit={t.perHour}
          drillHref="/fin/budgets"
        />
      </div>

      <Panel
        title={t.monthTitle}
        action={
          state?.hard_stopped ? (
            <StatusBadge level="critical">{t.hardStopOn}</StatusBadge>
          ) : (
            <StatusBadge level="ok">{t.hardStopOff}</StatusBadge>
          )
        }
      >
        {/* §R4 thresholds as visible ticks: 70 attention / 90 high / 100 stop */}
        <div className="relative h-2 overflow-hidden rounded-input bg-surface-anthracite">
          <div
            className={`h-full rounded-input ${barColor}`}
            style={{ width: `${Math.min(100, pct).toFixed(1)}%` }}
          />
          {[70, 90].map((tick) => (
            <span
              key={tick}
              className="absolute top-0 h-full w-px bg-edge-neutral"
              style={{ left: `${tick}%` }}
              aria-hidden
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3 text-body-s">
          <span className="font-data text-ink-primary tabular-nums">
            {formatEur(spent)} / {formatEur(cap)}
          </span>
          <span className="text-caption text-ink-muted">{t.thresholdLegend}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-edge-neutral pt-3 text-body-s">
          <span className="text-ink-secondary">{t.breaker}</span>
          {state?.breaker_tripped ? (
            <StatusBadge level="danger">
              {t.breakerTripped}
              {state.breaker_tripped_at ? ` · ${timeFmt(state.breaker_tripped_at)}` : ""}
            </StatusBadge>
          ) : (
            <StatusBadge level="ok">{t.breakerArmed}</StatusBadge>
          )}
          <span className="font-data text-caption text-ink-muted tabular-nums">
            {t.stateUpdated}: {state ? timeFmt(state.updated_at) : "—"}
          </span>
        </div>
      </Panel>

      <Panel title={t.alertsTitle}>
        {alerts.length === 0 ? (
          <p className="py-2 text-body-s text-ink-secondary">{t.alertsEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li key={a.id}>
                <Link
                  href="/alerts"
                  className="flex items-center justify-between gap-3 rounded-input border border-edge-neutral bg-surface-graphite p-2 transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne"
                >
                  <span className="min-w-0 truncate text-body-s text-ink-primary">
                    {a.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {a.resolved_at ? (
                      <StatusBadge level="info">{t.alertResolved}</StatusBadge>
                    ) : (
                      <StatusBadge level="warn">{t.alertActive}</StatusBadge>
                    )}
                    <span className="font-data text-caption text-ink-muted tabular-nums">
                      {timeFmt(a.at)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Scoped budgets table + LiteLLM virtual-key sync = P7 (COST A1/A2). */}
      <p className="text-caption text-ink-muted">{t.boundaryNote}</p>
    </div>
  );
}
