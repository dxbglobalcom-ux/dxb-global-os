import Link from "next/link";
import { Panel, Stat, HelpTip } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /fin/tokens v2 (C24 remediation 2026-07-19) — company usage now reads the
// WORKFORCE truth (v_workforce_tokens = agent_runs × tasks.department: real
// runs, real departments, real models). Construction sessions (cost_ledger
// source='hook' — the build effort, not the company working) are shown as
// ONE separately-labeled panel, never mixed into department shares. C25:
// only informative rows render — no zero-noise, no '<synthetic>' labels.

export const metadata = { title: "Tokens — DXB" };

type WorkforceRow = {
  department: string;
  model: string;
  day: string;
  tokens: number;
};

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

  const since7d = new Date(now.getTime() - 7 * 86400_000).toISOString();
  const since30d = new Date(now.getTime() - 30 * 86400_000).toISOString();
  const todayBerlin = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
  }).format(now);

  const [wfRes, buildRes] = await Promise.all([
    supabase
      .from("v_workforce_tokens")
      .select("department, model, day, tokens")
      .gte("started_at", since30d),
    supabase
      .from("cost_ledger")
      .select("ptok:prompt_tokens.sum(), ctok:completion_tokens.sum()")
      .eq("source", "hook")
      .gte("created_at", since7d),
  ]);

  if (wfRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.tokens} state="error">
          <p className="text-body-s text-status-danger">
            v_workforce_tokens: {wfRes.error.message}
          </p>
        </Panel>
      </div>
    );
  }

  const rows = (wfRes.data ?? []) as unknown as WorkforceRow[];
  const buildRow = (buildRes.data?.[0] ?? {}) as Record<string, unknown>;
  const constructionTokens7d =
    Number(buildRow.ptok ?? 0) + Number(buildRow.ctok ?? 0);

  const within7d = rows.filter((r) => r.day >= since7d.slice(0, 10));
  const todayRows = rows.filter((r) => r.day === todayBerlin);

  const sumBy = (list: WorkforceRow[], key: "department" | "model") => {
    const acc = new Map<string, number>();
    for (const r of list) {
      if (r.tokens <= 0) continue; // C25: a zero row informs nobody
      acc.set(r[key], (acc.get(r[key]) ?? 0) + r.tokens);
    }
    return [...acc.entries()].map(([k, v]) => ({ key: k, value: v }));
  };

  const byDept = sumBy(within7d, "department");
  const byModel = sumBy(within7d, "model");
  const totalToday = todayRows.reduce((a, r) => a + r.tokens, 0);
  const total7d = within7d.reduce((a, r) => a + r.tokens, 0);
  const total30d = rows.reduce((a, r) => a + r.tokens, 0);

  const dailyAcc = new Map<string, number>();
  for (const r of rows) dailyAcc.set(r.day, (dailyAcc.get(r.day) ?? 0) + r.tokens);
  const daily = [...dailyAcc.entries()]
    .map(([day, tokens]) => ({ day, tokens }))
    .filter((d) => d.tokens > 0)
    .sort((a, b) => b.day.localeCompare(a.day));
  const maxDailyTokens = Math.max(0, ...daily.map((d) => d.tokens));

  const shape = (list: { key: string; value: number }[]) => {
    const sorted = [...list].sort((a, b) => b.value - a.value);
    const max = sorted[0]?.value ?? 0;
    return sorted.map((r) => ({
      ...r,
      formatted: compact.format(r.value),
      ratio: max > 0 ? r.value / max : 0,
    }));
  };

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 text-ink-primary">
          {dict.command.nav.pages.tokens} <HelpTip text={dict.help.tokens} />
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

      {constructionTokens7d > 0 && (
        <Panel title={`${t.constructionTitle} · ${t.window7d}`}>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-data text-h3 text-ink-primary tabular-nums">
              {compact.format(constructionTokens7d)}
            </span>
            <p className="text-body-s text-ink-secondary">{t.constructionNote}</p>
          </div>
        </Panel>
      )}

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
    </div>
  );
}
