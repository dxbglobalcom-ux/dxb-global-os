import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { Panel } from "@/components/panel";
import { DataTile, type TileTone } from "@/components/costs/data-tile";
import { CostBreakdown } from "@/components/costs/cost-breakdown";
import { formatEur } from "@/lib/format";
import {
  BUDGET_WARN_RATIO,
  COST_DIMENSIONS,
  COST_PERIODS,
  costBreakdown,
  monthStart,
  periodTotal,
  postgrestCostSource,
  type CostDimension,
  type CostPeriod,
} from "@/lib/costs";

// Costs page (COST-04, master plan step 6): dept/model/mode breakdown +
// period tiles, all through the single-source aggregate module (the same
// module the SQL-equality test exercises). Status tones appear ONLY at the
// budget thresholds (70%/100%) — dataviz discipline everywhere else.
export default async function CostsPage({
  searchParams,
}: {
  searchParams: Promise<{ dim?: string; period?: string }>;
}) {
  const params = await searchParams;
  const dimension: CostDimension = (COST_DIMENSIONS as string[]).includes(params.dim ?? "")
    ? (params.dim as CostDimension)
    : "department";
  const period: CostPeriod = (COST_PERIODS as string[]).includes(params.period ?? "")
    ? (params.period as CostPeriod)
    : "today";

  const dict = getDict();
  const supabase = await createClient();
  const source = postgrestCostSource(supabase);
  const now = new Date();

  const [entries, todayTotal, weekTotal, monthToDate, budgetRes] = await Promise.all([
    costBreakdown(source, dimension, period, now),
    periodTotal(source, "today", now),
    periodTotal(source, "7d", now),
    source.totalSince(monthStart(now).toISOString()),
    supabase.from("budget_state").select("monthly_cap_eur,hard_stopped").limit(1),
  ]);

  const cap = Number(budgetRes.data?.[0]?.monthly_cap_eur ?? 0) || 0;
  const capRatio = cap > 0 ? monthToDate / cap : 0;
  const capTone: TileTone = capRatio >= 1 ? "danger" : capRatio >= BUDGET_WARN_RATIO ? "warn" : "neutral";

  const c = dict.costs;
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-page-title text-ink">{c.title}</h1>

      <Panel title={c.tilesTitle}>
        <div className="grid grid-cols-2 gap-x-6 divide-line sm:grid-cols-4">
          <DataTile label={c.today} value={formatEur(todayTotal)} />
          <DataTile label={c.week} value={formatEur(weekTotal)} />
          <DataTile label={c.monthToDate} value={formatEur(monthToDate)} />
          <DataTile
            label={c.budget}
            value={cap > 0 ? `${Math.round(capRatio * 100)}%` : "—"}
            detail={cap > 0 ? `${formatEur(monthToDate)} / ${formatEur(cap)}` : undefined}
            tone={capTone}
          />
        </div>
      </Panel>

      <Panel title={c.breakdownTitle}>
        <CostBreakdown
          entries={entries}
          dimension={dimension}
          period={period}
          text={{
            dimensionLabels: {
              department: c.dimDepartment,
              model: c.dimModel,
              mode: c.dimMode,
            },
            periodLabels: { today: c.periodToday, "7d": c.period7d, "30d": c.period30d },
            empty: c.empty,
            asOf: dict.cockpit.asOf,
            notLiveSince: dict.cockpit.notLiveSince,
          }}
        />
      </Panel>
    </div>
  );
}
