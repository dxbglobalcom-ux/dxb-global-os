import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  DataGrid,
  FilterBar,
  Panel,
  Stat,
  type Column, HelpTip } from "@/components/primitives";
import {
  COST_PERIODS,
  berlinDayRangeISO,
  costBreakdown,
  dailyBreakdown,
  monthStart,
  periodStart,
  periodTotal,
  postgrestCostSource,
  postgrestDailySource,
  type BreakdownEntry,
  type CostPeriod,
  type DailyEntry,
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
//
// E11.1 close: the day grain comes from v_cost_breakdown (Berlin day, the
// view the roadmap row names); a day row drills into the ledger table on
// the same page (COST spec §7: chart segment → row-level cost_ledger).

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
            <span className="min-w-0 break-words text-ink-secondary">{e.key}</span>
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

function DailyList({
  entries,
  emptyText,
  tokensLabel,
  selectedDay,
  hrefFor,
}: {
  entries: DailyEntry[];
  emptyText: string;
  tokensLabel: string;
  selectedDay?: string;
  hrefFor: (day: string) => string;
}) {
  if (entries.length === 0)
    return <p className="py-2 text-body-s text-ink-muted">{emptyText}</p>;
  const compact = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  return (
    // 3 columns only at 2xl — at 1280 the content column leaves ~210px per
    // card and the date wraps (RULE #0 catch).
    <ul className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2 2xl:grid-cols-3">
      {entries.map((e) => {
        const selected = e.day === selectedDay;
        return (
          <li key={e.day}>
            <Link
              href={hrefFor(selected ? "" : e.day)}
              aria-current={selected ? "true" : undefined}
              className={`block rounded-input border px-2.5 py-1.5 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite ${
                selected ? "border-edge-champagne" : "border-transparent"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3 text-body-s">
                <span
                  className={`whitespace-nowrap font-data tabular-nums ${
                    selected ? "text-accent-champagne" : "text-ink-secondary"
                  }`}
                >
                  {e.day}
                </span>
                <span className="flex items-baseline gap-3">
                  <span className="whitespace-nowrap font-data text-caption text-ink-muted tabular-nums">
                    {compact.format(e.tokens)} {tokensLabel}
                  </span>
                  <span className="whitespace-nowrap font-data text-ink-primary tabular-nums">
                    {e.formatted}
                  </span>
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-input bg-surface-anthracite">
                <div
                  className="h-full rounded-input bg-accent-champagne"
                  style={{ width: `${Math.max(2, e.ratio * 100).toFixed(1)}%` }}
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async function CostsPage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string;
    day?: string;
    dept?: string;
    model?: string;
  }>;
}) {
  const { range, day: rawDay, dept: rawDept, model: rawModel } =
    await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.costs;
  const tf = dict.command.filters;
  const supabase = await createClient();
  const now = new Date();

  const period: CostPeriod = (COST_PERIODS as readonly string[]).includes(
    range ?? "",
  )
    ? (range as CostPeriod)
    : "7d";
  // Day drill (spec §7): a Berlin calendar day narrows the ledger table.
  const day = /^\d{4}-\d{2}-\d{2}$/.test(rawDay ?? "") ? rawDay! : undefined;

  // C9 filter standard: dept/model validated against 30d distincts, then
  // narrow every query the page issues (KPIs, breakdowns, daily, ledger).
  const optionSource = postgrestCostSource(supabase);
  const [deptRows, modelRows] = await Promise.all([
    optionSource.sumBy("department", periodStart("30d", now).toISOString()),
    optionSource.sumBy("model", periodStart("30d", now).toISOString()),
  ]);
  const deptOptions = deptRows.map((r) => r.key).filter((k) => k && k !== "—").sort();
  const modelOptions = modelRows.map((r) => r.key).filter((k) => k && k !== "—").sort();
  const dept = deptOptions.includes(rawDept ?? "") ? rawDept : undefined;
  const model = modelOptions.includes(rawModel ?? "") ? rawModel : undefined;
  const source = postgrestCostSource(supabase, { department: dept, model });

  let ledgerQuery = supabase
    .from("cost_ledger")
    .select(
      "id, model, mode, department, prompt_tokens, completion_tokens, cost_eur, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(20);
  if (dept) ledgerQuery = ledgerQuery.eq("department", dept);
  if (model) ledgerQuery = ledgerQuery.eq("model", model);
  if (day) {
    const { startISO, endISO } = berlinDayRangeISO(day);
    ledgerQuery = ledgerQuery.gte("created_at", startISO).lt("created_at", endISO);
  }

  const [
    today,
    week,
    month30,
    monthToDate,
    byDay,
    byDept,
    byModel,
    byMode,
    ledgerRes,
  ] = await Promise.all([
    periodTotal(source, "today", now),
    periodTotal(source, "7d", now),
    periodTotal(source, "30d", now),
    source.totalSince(monthStart(now).toISOString()),
    dailyBreakdown(postgrestDailySource(supabase, { department: dept, model }), now),
    costBreakdown(source, "department", period, now),
    costBreakdown(source, "model", period, now),
    costBreakdown(source, "mode", period, now),
    ledgerQuery,
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
  // Short window words for the filter chips (the KPI labels say "Cost · 7d").
  const rangeChipLabel: Record<CostPeriod, string> = {
    today: tf.rangeToday,
    "7d": tf.range7d,
    "30d": tf.range30d,
  };

  const compactTokens = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  // Drill state lives in the URL (spec §10) — range and day compose.
  const rangeParam = (COST_PERIODS as readonly string[]).includes(range ?? "")
    ? range
    : undefined;
  const costsHref = (params: { range?: string; day?: string }) => {
    const q = new URLSearchParams();
    if (params.range) q.set("range", params.range);
    if (params.day) q.set("day", params.day);
    // C9: dept/model filters survive the range/day drills.
    if (dept) q.set("dept", dept);
    if (model) q.set("model", model);
    const s = q.toString();
    return `/fin/costs${s ? `?${s}` : ""}`;
  };

  const columns: Column<LedgerRow>[] = [
    {
      key: "model",
      label: t.colModel,
      render: (r) => (
        <span className="block max-w-[24ch] break-words font-data">
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
        // locale-pinned: server-default short month leaks an EN month name
        // onto the TR ledger (RULE #0 purity; rail precedent — E12.1 catch).
        new Date(r.created_at).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }),
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.costs}{" "}
        <HelpTip text={dict.help.costs} />
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

      <FilterBar
        clearLabel={tf.clear}
        groups={[
          {
            param: "range",
            label: periodLabel[period],
            kind: "chips",
            value: period,
            defaultValue: "7d",
            options: COST_PERIODS.map((p) => ({
              value: p,
              label: rangeChipLabel[p],
            })),
          },
          {
            param: "dept",
            label: tf.department,
            allLabel: tf.allDepartments,
            value: dept,
            options: deptOptions.map((d) => ({ value: d, label: d })),
          },
          {
            param: "model",
            label: tf.model,
            allLabel: tf.allModels,
            value: model,
            options: modelOptions.map((m) => ({ value: m, label: m })),
          },
        ]}
      />

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

      <Panel title={`${t.byDay} · ${t.kpi30d}`}>
        <p className="mb-3 text-caption text-ink-muted">{t.byDayHint}</p>
        <DailyList
          entries={byDay}
          emptyText={t.breakdownEmpty}
          tokensLabel={t.colTokens}
          selectedDay={day}
          hrefFor={(d) => costsHref({ range: rangeParam, day: d || undefined })}
        />
      </Panel>

      <Panel title={day ? `${t.ledgerTitle} · ${day}` : t.ledgerTitle}>
        {day && (
          <div className="mb-3 flex flex-wrap gap-2">
            <Link
              href={costsHref({ range: rangeParam })}
              aria-label={t.clearDay}
              title={t.clearDay}
              className="rounded-input border border-edge-champagne px-2.5 py-1 font-data text-body-s text-accent-champagne transition duration-[var(--t-fast)] ease-refined tabular-nums hover:bg-surface-graphite"
            >
              {day} ✕
            </Link>
          </div>
        )}
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
