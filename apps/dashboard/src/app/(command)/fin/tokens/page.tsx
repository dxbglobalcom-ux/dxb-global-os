import Link from "next/link";
import { Panel, Stat } from "@/components/primitives";
import {
  berlinDay,
  dailyBreakdown,
  postgrestDailySource,
  periodStart,
} from "@/lib/costs";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /fin/tokens v1 (E12.1-C) — TokenIntelligencePanel (COST spec §5): token
// totals + model/department shares from cost_ledger, Berlin-day trend from
// v_cost_breakdown. Cache ratio, context consumption and spawn-tree cost
// need the 10.5 ledger extension columns (cache_read/context_tokens/
// spawn_parent) — recorded P7 boundary; no fake gauges before the data.

export const metadata = { title: "Tokens — DXB" };

function BarList({
  entries,
  emptyText,
}: {
  entries: { key: string; value: number; formatted: string; ratio: number }[];
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

export default async function TokensPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.tokens;
  const supabase = await createClient();
  const now = new Date();
  const compact = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  const sumTokens = async (dimension: "model" | "department", sinceISO: string) => {
    const { data, error } = await supabase
      .from("cost_ledger")
      .select(`${dimension}, ptok:prompt_tokens.sum(), ctok:completion_tokens.sum()`)
      .gte("created_at", sinceISO);
    if (error) throw new Error(error.message);
    return (
      (data ?? []) as Array<Record<string, unknown>>
    ).map((row) => ({
      key: String(row[dimension] ?? "—"),
      value: Number(row.ptok ?? 0) + Number(row.ctok ?? 0),
    }));
  };

  const since7d = periodStart("7d", now).toISOString();
  const sinceToday = periodStart("today", now).toISOString();

  let byModel: { key: string; value: number }[] = [];
  let byDept: { key: string; value: number }[] = [];
  let daily: Awaited<ReturnType<typeof dailyBreakdown>> = [];
  let todayRows: { key: string; value: number }[] = [];
  try {
    [byModel, byDept, daily, todayRows] = await Promise.all([
      sumTokens("model", since7d),
      sumTokens("department", since7d),
      dailyBreakdown(postgrestDailySource(supabase), now),
      sumTokens("model", sinceToday),
    ]);
  } catch (err) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.tokens} state="error">
          <p className="text-body-s text-status-danger">
            cost_ledger: {err instanceof Error ? err.message : String(err)}
          </p>
        </Panel>
      </div>
    );
  }

  const totalToday = todayRows.reduce((a, r) => a + r.value, 0);
  const total7d = byModel.reduce((a, r) => a + r.value, 0);
  const total30d = daily.reduce((a, r) => a + r.tokens, 0);
  const todayBerlin = berlinDay(now);

  const shape = (rows: { key: string; value: number }[]) => {
    const sorted = [...rows].sort((a, b) => b.value - a.value);
    const max = sorted[0]?.value ?? 0;
    return sorted.map((r) => ({
      ...r,
      formatted: compact.format(r.value),
      ratio: max > 0 ? r.value / max : 0,
    }));
  };
  const maxDailyTokens = Math.max(0, ...daily.map((d) => d.tokens));

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 text-ink-primary">
          {dict.command.nav.pages.tokens}
        </h1>
        <Link href="/fin/costs" className="text-body-s text-accent-champagne">
          {t.viewCosts}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiToday}
          value={compact.format(totalToday)}
          glow
          drillHref="/fin/costs?range=today"
        />
        <Stat
          label={t.kpi7d}
          value={compact.format(total7d)}
          drillHref="/fin/costs?range=7d"
        />
        <Stat
          label={t.kpi30d}
          value={compact.format(total30d)}
          drillHref="/fin/costs?range=30d"
        />
        <Stat
          label={t.kpiModels}
          value={String(byModel.length)}
          drillHref="/ai/models"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title={`${t.byModel} · ${t.window7d}`}>
          <BarList entries={shape(byModel)} emptyText={t.empty} />
        </Panel>
        <Panel title={`${t.byDepartment} · ${t.window7d}`}>
          <BarList entries={shape(byDept)} emptyText={t.empty} />
        </Panel>
      </div>

      <Panel title={`${t.dailyTitle} · ${t.window30d}`}>
        {daily.length === 0 ? (
          <p className="py-2 text-body-s text-ink-muted">{t.empty}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2 2xl:grid-cols-3">
            {daily.map((d) => (
              <li key={d.day}>
                <Link
                  href={`/fin/costs?day=${d.day}`}
                  className={`block rounded-input border px-2.5 py-1.5 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite ${
                    d.day === todayBerlin ? "border-edge-champagne" : "border-transparent"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3 text-body-s">
                    <span className="whitespace-nowrap font-data text-ink-secondary tabular-nums">
                      {d.day}
                    </span>
                    <span className="whitespace-nowrap font-data text-ink-primary tabular-nums">
                      {compact.format(d.tokens)}
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-input bg-surface-anthracite">
                    <div
                      className="h-full rounded-input bg-accent-champagne"
                      style={{
                        width: `${Math.max(
                          2,
                          maxDailyTokens > 0 ? (d.tokens / maxDailyTokens) * 100 : 0,
                        ).toFixed(1)}%`,
                      }}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* 10.5 fields (cache_read/context_tokens/spawn_parent) are the P7
          ledger extension — honest boundary, no invented gauges. */}
      <p className="text-caption text-ink-muted">{t.boundaryNote}</p>
    </div>
  );
}
