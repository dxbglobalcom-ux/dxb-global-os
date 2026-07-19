import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DataGrid, Panel, Stat, type Column, HelpTip } from "@/components/primitives";
import { RevenueEntryForm } from "@/components/command/revenue-entry-form";
import { formatEur } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /fin/pnl (E6.5 — CEO directive 2026-07-12): the earnings half of the
// holding. Reads v_pnl_daily (revenue vs cost per Europe/Berlin day) and
// the append-only revenue_ledger; manual entry island covers the physical
// company's income until integrations write here automatically. Honest
// zeros — no fabricated numbers, ever.

export const metadata = { title: "P&L — DXB" };

type PnlDay = {
  day: string;
  revenue_eur: number;
  cost_eur: number;
  net_eur: number;
};

type EngineRow = { engine: string; day: string; revenue_eur: number };

type PlatformRow = { platform: string; day: string; revenue_eur: number };

type RevenueRow = {
  id: number;
  occurred_on: string;
  engine: string;
  platform: string | null;
  client: string | null;
  description: string;
  amount_eur: number;
};

function berlinToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
  }).format(new Date());
}

export default async function PnlPage() {
  const dict = getDict(await getLocale());
  const t = dict.command.pnl;
  const supabase = await createClient();
  const today = berlinToday();
  const since = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

  const [dailyRes, engineRes, platformRes, ledgerRes] = await Promise.all([
    supabase
      .from("v_pnl_daily")
      .select("day, revenue_eur, cost_eur, net_eur")
      .gte("day", since)
      .order("day", { ascending: false }),
    supabase
      .from("v_pnl_engine")
      .select("engine, day, revenue_eur")
      .gte("day", since),
    supabase
      .from("v_pnl_platform")
      .select("platform, day, revenue_eur")
      .gte("day", since),
    supabase
      .from("revenue_ledger")
      .select("id, occurred_on, engine, platform, client, description, amount_eur")
      .order("id", { ascending: false })
      .limit(15),
  ]);

  const firstError =
    dailyRes.error ?? engineRes.error ?? platformRes.error ?? ledgerRes.error;
  if (firstError) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.pnl} state="error">
          <p className="text-body-s text-status-danger">{firstError.message}</p>
        </Panel>
      </div>
    );
  }

  const daily = (dailyRes.data ?? []) as PnlDay[];
  const todayRow = daily.find((d) => d.day === today);
  const sum = (pick: (d: PnlDay) => number) =>
    daily.reduce((acc, d) => acc + Number(pick(d)), 0);

  const engineTotals = new Map<string, number>();
  for (const row of (engineRes.data ?? []) as EngineRow[]) {
    engineTotals.set(
      row.engine,
      (engineTotals.get(row.engine) ?? 0) + Number(row.revenue_eur),
    );
  }
  const engineEntries = [...engineTotals.entries()].sort((a, b) => b[1] - a[1]);
  const engineMax = engineEntries[0]?.[1] ?? 0;
  const engineLabels = t.engines as Record<string, string>;

  const platformTotals = new Map<string, number>();
  for (const row of (platformRes.data ?? []) as PlatformRow[]) {
    platformTotals.set(
      row.platform,
      (platformTotals.get(row.platform) ?? 0) + Number(row.revenue_eur),
    );
  }
  const platformEntries = [...platformTotals.entries()].sort(
    (a, b) => b[1] - a[1],
  );
  const platformMax = platformEntries[0]?.[1] ?? 0;
  const platformLabels = t.platforms as Record<string, string>;

  const ledger = (ledgerRes.data ?? []) as RevenueRow[];

  const netClass = (value: number) =>
    value > 0
      ? "text-status-ok"
      : value < 0
        ? "text-status-danger"
        : "text-ink-primary";

  const dailyColumns: Column<PnlDay>[] = [
    { key: "day", label: t.colDay, render: (r) => r.day },
    {
      key: "revenue_eur",
      label: t.colRevenue,
      align: "right",
      numeric: true,
      render: (r) => formatEur(Number(r.revenue_eur)),
    },
    {
      key: "cost_eur",
      label: t.colCost,
      align: "right",
      numeric: true,
      render: (r) => formatEur(Number(r.cost_eur)),
    },
    {
      key: "net_eur",
      label: t.colNet,
      align: "right",
      numeric: true,
      render: (r) => (
        <span className={`font-data tabular-nums ${netClass(Number(r.net_eur))}`}>
          {formatEur(Number(r.net_eur))}
        </span>
      ),
    },
  ];

  const ledgerColumns: Column<RevenueRow>[] = [
    { key: "occurred_on", label: t.colWhen, render: (r) => r.occurred_on },
    {
      key: "engine",
      label: t.colEngine,
      render: (r) => (
        <span>
          {engineLabels[r.engine] ?? r.engine}
          {r.platform ? (
            <span className="text-ink-muted">
              {" · "}
              {platformLabels[r.platform] ?? r.platform}
            </span>
          ) : null}
        </span>
      ),
    },
    { key: "client", label: t.colClient, render: (r) => r.client ?? "—" },
    {
      key: "description",
      label: t.colDescription,
      render: (r) => (
        <span className="block max-w-[40ch] truncate" title={r.description}>
          {r.description}
        </span>
      ),
    },
    {
      key: "amount_eur",
      label: t.colAmount,
      align: "right",
      numeric: true,
      render: (r) => (
        <span className={`font-data tabular-nums ${netClass(Number(r.amount_eur))}`}>
          {formatEur(Number(r.amount_eur))}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.pnl}{" "}
        <HelpTip text={dict.help.pnl} />
      </h1>
        <Link
          href="/fin/costs"
          className="flex items-center gap-1.5 text-body-s text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:text-accent-ivory"
        >
          {t.viewCosts}
          <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 2xl:grid-cols-6">
        <Stat
          label={t.kpiTodayRevenue}
          value={formatEur(Number(todayRow?.revenue_eur ?? 0))}
          unit="EUR"
          glow
          drillHref="#revenue-ledger"
        />
        <Stat
          label={t.kpiTodayCost}
          value={formatEur(Number(todayRow?.cost_eur ?? 0))}
          unit="EUR"
          drillHref="/fin/costs?range=today"
        />
        <Stat
          label={t.kpiTodayNet}
          value={formatEur(Number(todayRow?.net_eur ?? 0))}
          unit="EUR"
          drillHref="#daily-pnl"
        />
        <Stat
          label={t.kpi30dRevenue}
          value={formatEur(sum((d) => d.revenue_eur))}
          unit="EUR"
          drillHref="#revenue-ledger"
        />
        <Stat
          label={t.kpi30dCost}
          value={formatEur(sum((d) => d.cost_eur))}
          unit="EUR"
          drillHref="/fin/costs?range=30d"
        />
        <Stat
          label={t.kpi30dNet}
          value={formatEur(sum((d) => d.net_eur))}
          unit="EUR"
          drillHref="#daily-pnl"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3" id="daily-pnl">
        <div className="xl:col-span-2">
          <Panel title={t.dailyTitle}>
            {daily.length === 0 ? (
              <p className="py-4 text-body-s text-ink-secondary">{t.dailyEmpty}</p>
            ) : (
              <div className="overflow-x-auto">
                <DataGrid
                  columns={dailyColumns}
                  rows={daily}
                  rowKey={(r) => r.day}
                />
              </div>
            )}
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title={t.engineTitle}>
            {engineEntries.length === 0 ? (
              <p className="py-2 text-body-s text-ink-muted">{t.engineEmpty}</p>
            ) : (
              <ul className="space-y-2">
                {engineEntries.map(([engine, total]) => (
                  <li key={engine}>
                    <div className="flex items-baseline justify-between gap-3 text-body-s">
                      <span className="min-w-0 truncate text-ink-secondary">
                        {engineLabels[engine] ?? engine}
                      </span>
                      <span className="font-data text-ink-primary tabular-nums">
                        {formatEur(total)}
                      </span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-input bg-surface-anthracite">
                      <div
                        className="h-full rounded-input bg-accent-champagne"
                        style={{
                          width: `${Math.max(2, engineMax ? (total / engineMax) * 100 : 0).toFixed(1)}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title={t.platformTitle}>
            {platformEntries.length === 0 ? (
              <p className="py-2 text-body-s text-ink-muted">{t.platformEmpty}</p>
            ) : (
              <ul className="space-y-2">
                {platformEntries.map(([platform, total]) => (
                  <li key={platform}>
                    <div className="flex items-baseline justify-between gap-3 text-body-s">
                      <span className="min-w-0 truncate text-ink-secondary">
                        {platformLabels[platform] ?? platform}
                      </span>
                      <span className="font-data text-ink-primary tabular-nums">
                        {formatEur(total)}
                      </span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-input bg-surface-anthracite">
                      <div
                        className="h-full rounded-input bg-accent-champagne"
                        style={{
                          width: `${Math.max(2, platformMax ? (total / platformMax) * 100 : 0).toFixed(1)}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3" id="revenue-ledger">
        <div className="xl:col-span-2">
          <Panel title={t.ledgerTitle}>
            {ledger.length === 0 ? (
              <p className="py-4 text-body-s text-ink-secondary">{t.ledgerEmpty}</p>
            ) : (
              <div className="overflow-x-auto">
                <DataGrid
                  columns={ledgerColumns}
                  rows={ledger}
                  rowKey={(r) => String(r.id)}
                />
              </div>
            )}
          </Panel>
        </div>
        <Panel title={t.formTitle}>
          <RevenueEntryForm labels={t} />
          <p className="mt-4 text-body-s text-ink-muted">{t.note}</p>
        </Panel>
      </div>
    </div>
  );
}
