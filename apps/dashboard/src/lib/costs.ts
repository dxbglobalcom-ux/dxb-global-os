// COST-04 single-source aggregate module. The costs page, the Horizon Line
// "today's cost" counter AND the equality test all consume THIS module —
// the test swaps the row source for kysely and compares against independent
// raw SQL, so any drift in grouping, period boundary or rendered precision
// fails the suite (SQL-equality is the COST-04 gate).
import { formatEur } from "@/lib/format";

export type CostDimension = "department" | "model" | "mode";
export type CostPeriod = "today" | "7d" | "30d";

export const COST_DIMENSIONS: CostDimension[] = ["department", "model", "mode"];
export const COST_PERIODS: CostPeriod[] = ["today", "7d", "30d"];

// Budget thresholds (Cost Monitor rules: alert at 70%, hard-stop at 100%)
export const BUDGET_WARN_RATIO = 0.7;

// Period boundary: 'today' = LOCAL midnight (the CEO's operational day),
// rolling windows for 7d/30d. Pure — the boundary test pins this.
export function periodStart(period: CostPeriod, now: Date): Date {
  if (period === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  const days = period === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export type BreakdownRow = { key: string; totalEur: number };

// Row source seam: PostgREST in the app, kysely in the equality test.
export interface CostRowsSource {
  sumBy(dimension: CostDimension, sinceISO: string): Promise<BreakdownRow[]>;
  totalSince(sinceISO: string): Promise<number>;
}

export type BreakdownEntry = {
  key: string;
  totalEur: number;
  formatted: string;
  /** 0..1 of the largest bar — drives bar width, not color */
  ratio: number;
};

export async function costBreakdown(
  source: CostRowsSource,
  dimension: CostDimension,
  period: CostPeriod,
  now: Date,
): Promise<BreakdownEntry[]> {
  const rows = await source.sumBy(dimension, periodStart(period, now).toISOString());
  const sorted = [...rows]
    .map((row) => ({ key: row.key || "—", totalEur: row.totalEur }))
    .sort((a, b) => b.totalEur - a.totalEur);
  const max = sorted[0]?.totalEur ?? 0;
  return sorted.map((row) => ({
    ...row,
    formatted: formatEur(row.totalEur),
    ratio: max > 0 ? row.totalEur / max : 0,
  }));
}

export async function periodTotal(
  source: CostRowsSource,
  period: CostPeriod,
  now: Date,
): Promise<number> {
  return source.totalSince(periodStart(period, now).toISOString());
}

// Month-to-date total for the budget tile (cap lives in budget_state).
export function monthStart(now: Date): Date {
  const start = new Date(now);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
}

// PostgREST-backed source (RSC usage). Kept here so the page and the Horizon
// layout share one query shape; the supabase client type stays loose to
// avoid coupling to generated DB types.
type PostgrestClient = {
  from(table: string): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select(columns: string): any;
  };
};

export function postgrestCostSource(supabase: PostgrestClient): CostRowsSource {
  return {
    async sumBy(dimension, sinceISO) {
      const { data, error } = await supabase
        .from("cost_ledger")
        .select(`${dimension},cost_eur.sum()`)
        .gte("created_at", sinceISO);
      if (error) throw new Error(error.message);
      return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
        key: String(row[dimension] ?? ""),
        totalEur: Number(row.sum ?? 0),
      }));
    },
    async totalSince(sinceISO) {
      const { data, error } = await supabase
        .from("cost_ledger")
        .select("cost_eur.sum()")
        .gte("created_at", sinceISO);
      if (error) throw new Error(error.message);
      return Number((data as Array<{ sum: number | string | null }> | null)?.[0]?.sum ?? 0) || 0;
    },
  };
}
