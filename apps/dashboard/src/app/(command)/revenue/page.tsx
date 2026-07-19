import Link from "next/link";
import { Panel, Stat, StatusBadge, type StatusLevel, HelpTip } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /revenue v1 (R1.4, REVENUE_ENGINE_SPEC §7) — the Objective header surface:
// the CEO's founding-purpose cockpit. THREE real sources, zero synthesis:
// v_objective_progress (realized net = ledger − cost, never projections) ·
// v_snev (KPI, honest zero until recurring revenue exists) ·
// v_opportunity_pipeline (state counts). Every number drills to its module.

export const metadata = { title: "Revenue — DXB" };

type ProgressRow = {
  id: string;
  title: string;
  metric: string;
  target_eur: number;
  status: string;
  period: string | null;
  realized_net_eur: number;
  gap_eur: number;
  days_left: number | null;
  run_rate_eur_per_day: number | null;
  net_unverified: boolean;
};
type SnevRow = {
  revenue_90d: number;
  cost_90d: number;
  net_90d: number;
  recurring_share: number;
  max_client_share: number;
  snev_eur: number;
};
type PipeRow = { state: string };

const OBJECTIVE_BADGE: Record<string, StatusLevel> = {
  draft: "info",
  proposed: "warn",
  active: "ok",
  achieved: "ok",
  missed: "danger",
  closed: "info",
};

const eur = (n: number | null | undefined) => `€${Number(n ?? 0).toFixed(2)}`;

export default async function RevenuePage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.revenue.ui;
  const supabase = await createClient();

  const [progressRes, snevRes, pipeRes] = await Promise.all([
    supabase
      .from("v_objective_progress")
      .select(
        "id, title, metric, target_eur, status, period, realized_net_eur, gap_eur, days_left, run_rate_eur_per_day, net_unverified",
      ),
    supabase.from("v_snev").select("*"),
    supabase.from("v_opportunity_pipeline").select("state"),
  ]);

  const firstError = progressRes.error ?? snevRes.error ?? pipeRes.error;
  if (firstError) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.revenue} state="error">
          <p className="text-body-s text-status-danger">{firstError.message}</p>
        </Panel>
      </div>
    );
  }

  const progress = (progressRes.data ?? []) as unknown as ProgressRow[];
  const snev = ((snevRes.data ?? [])[0] ?? null) as SnevRow | null;
  const pipe = (pipeRes.data ?? []) as unknown as PipeRow[];

  // Header card = the binding objective: active first, else draft/proposed.
  const rank: Record<string, number> = { active: 0, proposed: 1, draft: 2 };
  const lead = [...progress].sort(
    (a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9),
  )[0];

  const pipeCounts = pipe.reduce<Record<string, number>>((acc, r) => {
    acc[r.state] = (acc[r.state] ?? 0) + 1;
    return acc;
  }, {});
  const stateLabels = t.stateLabels as Record<string, string>;
  const statusLabels = t.statusLabels as Record<string, string>;

  const pct = (n: number) => `${(Number(n) * 100).toFixed(1)}%`;

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.revenue}{" "}
        <HelpTip text={dict.help.revenue} />
      </h1>
        {lead && (
          <span className="flex min-w-0 items-center gap-2">
            <StatusBadge level={OBJECTIVE_BADGE[lead.status] ?? "info"}>
              {statusLabels[lead.status] ?? lead.status}
            </StatusBadge>
            <span className="min-w-0 truncate text-body-s text-ink-secondary" title={lead.title}>
              {lead.title}
            </span>
          </span>
        )}
      </div>

      {lead ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <Stat
              label={t.kpiTarget}
              value={eur(lead.target_eur)}
              drillHref="/revenue/objectives"
            />
            <Stat
              label={t.kpiRealized}
              value={eur(lead.realized_net_eur)}
              glow
              drillHref="/fin/pnl"
            />
            <Stat
              label={t.kpiGap}
              value={eur(lead.gap_eur)}
              drillHref="/revenue/portfolio"
            />
            <Stat
              label={t.kpiDaysLeft}
              value={lead.days_left != null ? String(lead.days_left) : "—"}
              drillHref="/revenue/objectives"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {lead.run_rate_eur_per_day != null && (
              <span className="text-body-s text-ink-secondary">
                {t.runRate}:{" "}
                <span className="font-data text-ink-primary tabular-nums">
                  {eur(lead.run_rate_eur_per_day)}
                </span>
              </span>
            )}
            {lead.period == null && (
              <StatusBadge level="info">{t.noPeriod}</StatusBadge>
            )}
            {lead.net_unverified && (
              <StatusBadge level="warn">{t.netUnverified}</StatusBadge>
            )}
          </div>
        </>
      ) : (
        <Panel title={t.objectivesTitle}>
          <p className="text-body-s text-ink-secondary">{t.objectivesEmpty}</p>
        </Panel>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title={t.snevTitle}>
          {snev ? (
            <>
              <dl className="space-y-2">
                {(
                  [
                    [t.snevNet90, eur(snev.net_90d)],
                    [t.snevRecurring, pct(snev.recurring_share)],
                    [t.snevConcentration, pct(snev.max_client_share)],
                    [t.snevValue, eur(snev.snev_eur)],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-3 text-body-s"
                  >
                    <dt className="text-ink-secondary">{label}</dt>
                    <dd className="font-data text-ink-primary tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 border-t border-edge-neutral pt-2 text-caption text-ink-muted">
                {t.snevNote}
              </p>
            </>
          ) : (
            <p className="text-body-s text-ink-secondary">{t.snevNote}</p>
          )}
        </Panel>

        <Panel
          title={t.pipelineTitle}
          action={
            <Link
              href="/revenue/opportunities"
              className="text-body-s text-accent-champagne"
            >
              {t.viewOpportunities}
            </Link>
          }
        >
          {pipe.length === 0 ? (
            <p className="text-body-s text-ink-secondary">{t.pipelineEmpty}</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(pipeCounts).map(([state, n]) => (
                <li
                  key={state}
                  className="flex items-baseline justify-between gap-3 text-body-s"
                >
                  <span className="text-ink-secondary">
                    {stateLabels[state] ?? state}
                  </span>
                  <Link
                    href="/revenue/opportunities"
                    className="font-data text-accent-champagne tabular-nums"
                  >
                    {n}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
