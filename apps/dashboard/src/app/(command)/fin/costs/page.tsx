import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  DataGrid,
  Panel,
  Stat,
  type Column,
} from "@/components/primitives";
import {
  COST_PERIODS,
  costBreakdown,
  monthStart,
  periodTotal,
  postgrestCostSource,
  type BreakdownEntry,
  type CostPeriod,
} from "@/lib/costs";
import { formatEur } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /fin/costs v1 (D-bloku dalga-2, C-Hibrit) — pulled forward from E11.1
// on the COST-04 single-source module: the same costs.ts aggregate the
// Horizon counter and the SQL-equality test consume, so this page cannot
// drift from the ledger. Bars carry magnitude by WIDTH (ratio), color
// stays champagne — no rainbow finance (R17 typography discipline).

export const metadata = { title: "Costs — DXB" };

function BreakdownList({
  entries,
  emptyText,
}: {
  entries: BreakdownEntry[];
  emptyText: string;
}) {
  if (entries.length === 0)
    return <p className="py-2 text-body-s text-ink-muted">{emptyText}</p>;
  return (
    <ul className="space-y-2">
      {entries.map((e) => (
        <li key={e.key}>
          <div className="flex items-baseline justify-between gap-3 text-body-s">
            <span className="min-w-0 truncate text-ink-secondary">{e.key}</span>
            <span className="font-data text-ink-primary tabular-nums">
              {e.formatted}
            </span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-input bg-surface-anthracite">
            <div
              className="h-full rounded-input bg-accent-champagne"
              style={{ width: `${Math.max(2, e.ratio * 100).toFixed(1)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function CostsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const dict = getDict(await getLocale());
  const t = dict.command.costs;
  const supabase = await createClient();
  const source = postgrestCostSource(supabase);
  const now = new Date();

  const period: CostPeriod = (COST_PERIODS as readonly string[]).includes(
    range ?? "",
  )
    ? (range as CostPeriod)
    : "7d";

  const [today, week, month30, monthToDate, byDept, byModel, byMode, ledgerRes] =
    await Promise.all([
      periodTotal(source, "today", now),
      periodTotal(source, "7d", now),
      periodTotal(source, "30d", now),
      source.totalSince(monthStart(now).toISOString()),
      costBreakdown(source, "department", period, now),
      costBreakdown(source, "model", period, now),
      costBreakdown(source, "mode", period, now),
      supabase
        .from("cost_ledger")
        .select(
          "id, model, mode, department, prompt_tokens, completion_tokens, cost_eur, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  if (ledgerRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.costs} state="error">
          <p className="text-body-s text-status-danger">
            cost_ledger: {ledgerRes.error.message}
          </p>
        </Panel>
      </div>
    );
  }

  type LedgerRow = {
    id: number;
    model: string;
    mode: string;
    department: string | null;
    prompt_tokens: number;
    completion_tokens: number;
    cost_eur: number;
    created_at: string;
  };
  const ledger = (ledgerRes.data ?? []) as LedgerRow[];

  const periodLabel: Record<CostPeriod, string> = {
    today: t.kpiToday,
    "7d": t.kpi7d,
    "30d": t.kpi30d,
  };

  const compactTokens = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  const columns: Column<LedgerRow>[] = [
    {
      key: "model",
      label: t.colModel,
      render: (r) => (
        <span className="block max-w-[24ch] truncate font-data" title={r.model}>
          {r.model}
        </span>
      ),
    },
    { key: "mode", label: t.colMode, render: (r) => r.mode },
    { key: "department", label: t.colDept, render: (r) => r.department ?? "—" },
    {
      key: "tokens",
      label: t.colTokens,
      align: "right",
      numeric: true,
      render: (r) => compactTokens.format(r.prompt_tokens + r.completion_tokens),
    },
    {
      key: "cost_eur",
      label: t.colCost,
      align: "right",
      numeric: true,
      render: (r) => formatEur(Number(r.cost_eur)),
    },
    {
      key: "created_at",
      label: t.colWhen,
      align: "right",
      numeric: true,
      render: (r) =>
        new Date(r.created_at).toLocaleString(undefined, {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 text-ink-primary">
          {dict.command.nav.pages.costs}
        </h1>
        <div className="flex gap-4 text-body-s">
          <Link
            href="/fin/budgets"
            className="flex items-center gap-1.5 text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:text-accent-ivory"
          >
            {t.viewBudgets}
            <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
          </Link>
          <Link
            href="/fin/tokens"
            className="flex items-center gap-1.5 text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:text-accent-ivory"
          >
            {t.viewTokens}
            <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiToday}
          value={formatEur(today)}
          unit="EUR"
          glow
          drillHref="/fin/costs?range=today"
        />
        <Stat
          label={t.kpi7d}
          value={formatEur(week)}
          unit="EUR"
          drillHref="/fin/costs?range=7d"
        />
        <Stat
          label={t.kpi30d}
          value={formatEur(month30)}
          unit="EUR"
          drillHref="/fin/costs?range=30d"
        />
        <Stat
          label={t.kpiMonth}
          value={formatEur(monthToDate)}
          unit="EUR"
          drillHref="/fin/budgets"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title={`${t.byDepartment} · ${periodLabel[period]}`}>
          <BreakdownList entries={byDept} emptyText={t.breakdownEmpty} />
        </Panel>
        <Panel title={`${t.byModel} · ${periodLabel[period]}`}>
          <BreakdownList entries={byModel} emptyText={t.breakdownEmpty} />
        </Panel>
        <Panel title={`${t.byMode} · ${periodLabel[period]}`}>
          <BreakdownList entries={byMode} emptyText={t.breakdownEmpty} />
        </Panel>
      </div>

      <Panel title={t.ledgerTitle}>
        <div className="mb-3 flex flex-wrap gap-2">
          {COST_PERIODS.map((p) => (
            <Link
              key={p}
              href={`/fin/costs?range=${p}`}
              className={`rounded-input border px-2.5 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite ${
                period === p
                  ? "border-edge-champagne text-accent-champagne"
                  : "border-edge-neutral text-ink-secondary"
              }`}
            >
              {periodLabel[p]}
            </Link>
          ))}
        </div>
        {ledger.length === 0 ? (
          <p className="py-4 text-body-s text-ink-secondary">{t.ledgerEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <DataGrid
              columns={columns}
              rows={ledger}
              rowKey={(r) => String(r.id)}
            />
          </div>
        )}
      </Panel>
    </div>
  );
}
