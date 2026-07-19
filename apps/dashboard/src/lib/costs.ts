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

// ── E11.1 daily grain ────────────────────────────────────────────────────────
// Day boundary = Europe/Berlin, matching v_cost_breakdown and the P&L D5
// decision — NOT the local-midnight 'today' KPI boundary above. The daily
// panel reads the view; the KPIs keep the COST-04 module untouched.

export const DAILY_WINDOW_DAYS = 30;
export const DAILY_ROWS_SHOWN = 15;

export type DailyRow = {
  /** Berlin calendar day, YYYY-MM-DD */
  day: string;
  totalEur: number;
  tokens: number;
};

export interface CostDailySource {
  sumByDay(sinceDay: string): Promise<DailyRow[]>;
}

export type DailyEntry = DailyRow & {
  formatted: string;
  /** 0..1 of the largest bar — drives bar width, not color */
  ratio: number;
};

/** Berlin calendar day of an instant, YYYY-MM-DD. */
export function berlinDay(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

function berlinOffsetMinutes(utcMs: number): number {
  const zone = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date(utcMs))
    .find((p) => p.type === "timeZoneName")?.value;
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(zone ?? "");
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
}

// Berlin midnight as a UTC instant. Sampling the offset at 00:00Z is exact
// for Berlin: EU DST switches at 01:00Z, local midnight lies before it.
function berlinMidnightUtcMs(day: string): number {
  const guess = Date.parse(`${day}T00:00:00Z`);
  return guess - berlinOffsetMinutes(guess) * 60_000;
}

/** [start, end) UTC instants of a Berlin calendar day (DST days = 23h/25h). */
export function berlinDayRangeISO(day: string): {
  startISO: string;
  endISO: string;
} {
  const nextDay = new Date(Date.parse(`${day}T12:00:00Z`) + 24 * 3_600_000)
    .toISOString()
    .slice(0, 10);
  return {
    startISO: new Date(berlinMidnightUtcMs(day)).toISOString(),
    endISO: new Date(berlinMidnightUtcMs(nextDay)).toISOString(),
  };
}

export async function dailyBreakdown(
  source: CostDailySource,
  now: Date,
): Promise<DailyEntry[]> {
  const sinceDay = new Date(
    Date.parse(`${berlinDay(now)}T12:00:00Z`) -
      (DAILY_WINDOW_DAYS - 1) * 86_400_000,
  )
    .toISOString()
    .slice(0, 10);
  const rows = await source.sumByDay(sinceDay);
  const sorted = [...rows].sort((a, b) => b.day.localeCompare(a.day));
  const max = Math.max(0, ...sorted.map((r) => r.totalEur));
  return sorted.slice(0, DAILY_ROWS_SHOWN).map((row) => ({
    ...row,
    formatted: formatEur(row.totalEur),
    ratio: max > 0 ? row.totalEur / max : 0,
  }));
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

// Optional C9 filter narrowing: equality constraints applied to every query
// the source issues, so KPIs, breakdowns and totals all obey the same URL
// filter state. Omitted (the default) = pre-C9 behavior; the SQL-equality
// gate runs unfiltered and is untouched.
export type CostFilters = { department?: string; model?: string };

export function postgrestCostSource(
  supabase: PostgrestClient,
  filters: CostFilters = {},
): CostRowsSource {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applyFilters = (query: any): any => {
    let q = query;
    if (filters.department) q = q.eq("department", filters.department);
    if (filters.model) q = q.eq("model", filters.model);
    return q;
  };
  return {
    async sumBy(dimension, sinceISO) {
      const { data, error } = await applyFilters(
        supabase
          .from("cost_ledger")
          .select(`${dimension},cost_eur.sum()`)
          .gte("created_at", sinceISO),
      );
      if (error) throw new Error(error.message);
      return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
        key: String(row[dimension] ?? ""),
        totalEur: Number(row.sum ?? 0),
      }));
    },
    async totalSince(sinceISO) {
      const { data, error } = await applyFilters(
        supabase
          .from("cost_ledger")
          .select("cost_eur.sum()")
          .gte("created_at", sinceISO),
      );
      if (error) throw new Error(error.message);
      return Number((data as Array<{ sum: number | string | null }> | null)?.[0]?.sum ?? 0) || 0;
    },
  };
}

// v_cost_breakdown-backed daily source (E11.1): the view owns the Berlin-day
// grain; PostgREST aggregates it up to one row per day.
export function postgrestDailySource(
  supabase: PostgrestClient,
  filters: CostFilters = {},
): CostDailySource {
  return {
    async sumByDay(sinceDay) {
      let query = supabase
        .from("v_cost_breakdown")
        .select(
          "day, cost:cost_eur.sum(), ptok:prompt_tokens.sum(), ctok:completion_tokens.sum()",
        )
        .gte("day", sinceDay);
      if (filters.department) query = query.eq("department", filters.department);
      if (filters.model) query = query.eq("model", filters.model);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (
        (data ?? []) as Array<{
          day: string;
          cost: number | string | null;
          ptok: number | string | null;
          ctok: number | string | null;
        }>
      ).map((row) => ({
        day: row.day,
        totalEur: Number(row.cost ?? 0),
        tokens: Number(row.ptok ?? 0) + Number(row.ctok ?? 0),
      }));
    },
  };
}
