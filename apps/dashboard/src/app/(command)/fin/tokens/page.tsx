import Link from "next/link";
import { FilterBar, Panel, Stat, HelpTip } from "@/components/primitives";
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
  project_slug: string | null;
  project: string | null;
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

const TOKEN_RANGES = ["today", "7d", "30d"] as const;
type TokenRange = (typeof TOKEN_RANGES)[number];

export default async function TokensPage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string;
    dept?: string;
    model?: string;
    project?: string;
    day?: string;
  }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.tokens;
  const tf = dict.command.filters;
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
      .select("department, model, day, tokens, project_slug, project")
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

  const allRows = (wfRes.data ?? []) as unknown as WorkforceRow[];
  const buildRow = (buildRes.data?.[0] ?? {}) as Record<string, unknown>;
  const constructionTokens7d =
    Number(buildRow.ptok ?? 0) + Number(buildRow.ctok ?? 0);

  // C9 filter standard: dept/model/range live in the URL and narrow EVERY
  // panel below. Values are validated against the 30d data — junk params
  // fall back to "all" / the 7d default silently.
  const range: TokenRange = (TOKEN_RANGES as readonly string[]).includes(
    params.range ?? "",
  )
    ? (params.range as TokenRange)
    : "7d";
  const deptOptions = [...new Set(allRows.map((r) => r.department))].sort();
  const modelOptions = [...new Set(allRows.map((r) => r.model))].sort();
  // 9d — project options come from the rows themselves (slug → name).
  const projectMap = new Map<string, string>();
  for (const r of allRows)
    if (r.project_slug && r.project) projectMap.set(r.project_slug, r.project);
  const projectOptions = [...projectMap.entries()]
    .map(([slug, name]) => ({ value: slug, label: name }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const dept = deptOptions.includes(params.dept ?? "") ? params.dept : undefined;
  const model = modelOptions.includes(params.model ?? "")
    ? params.model
    : undefined;
  const project = projectMap.has(params.project ?? "") ? params.project : undefined;
  // 9e — calendar day, validated shape + inside the 30d data window.
  const dayParam = /^\d{4}-\d{2}-\d{2}$/.test(params.day ?? "")
    ? params.day
    : undefined;

  const rows = allRows.filter(
    (r) =>
      (!dept || r.department === dept) &&
      (!model || r.model === model) &&
      (!project || r.project_slug === project),
  );

  const within7d = rows.filter((r) => r.day >= since7d.slice(0, 10));
  const todayRows = rows.filter((r) => r.day === todayBerlin);
  // Day beats range for the panels (9e: the calendar drives the page).
  const inRange = dayParam
    ? rows.filter((r) => r.day === dayParam)
    : range === "today"
      ? todayRows
      : range === "7d"
        ? within7d
        : rows;
  const rangeLabel: Record<TokenRange, string> = {
    today: tf.rangeToday,
    "7d": tf.range7d,
    "30d": tf.range30d,
  };

  const sumBy = (list: WorkforceRow[], key: "department" | "model") => {
    const acc = new Map<string, number>();
    for (const r of list) {
      if (r.tokens <= 0) continue; // C25: a zero row informs nobody
      acc.set(r[key], (acc.get(r[key]) ?? 0) + r.tokens);
    }
    return [...acc.entries()].map(([k, v]) => ({ key: k, value: v }));
  };

  const byDept = sumBy(inRange, "department");
  const byModel = sumBy(inRange, "model");
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

      <FilterBar
        clearLabel={tf.clear}
        groups={[
          {
            param: "range",
            label: rangeLabel[range],
            kind: "chips",
            value: range,
            defaultValue: "7d",
            options: TOKEN_RANGES.map((r) => ({
              value: r,
              label: rangeLabel[r],
            })),
          },
          {
            // 9e — real calendar input; a chosen day drives the panels.
            param: "day",
            label: tf.date,
            kind: "date",
            value: dayParam,
            min: [...allRows.map((r) => r.day)].sort()[0],
            max: todayBerlin,
            options: [],
          },
          {
            // 9d — project filter from the rows' own project identity.
            param: "project",
            label: tf.project,
            allLabel: tf.allProjects,
            value: project,
            options: projectOptions,
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

      {/* 9e: a selected calendar day retitles the panels it now scopes. */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title={`${t.byModel} · ${dayParam ?? rangeLabel[range]}`}>
          <BarList entries={shape(byModel)} emptyText={t.empty} />
        </Panel>
        <Panel title={`${t.byDepartment} · ${dayParam ?? rangeLabel[range]}`}>
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
                  // 9e: a day row drives THIS page (C9: the big page below
                  // follows the filter); click again to clear.
                  href={(() => {
                    const q = new URLSearchParams();
                    if (params.range) q.set("range", params.range);
                    if (dept) q.set("dept", dept);
                    if (model) q.set("model", model);
                    if (project) q.set("project", project);
                    if (d.day !== dayParam) q.set("day", d.day);
                    const s = q.toString();
                    return `/fin/tokens${s ? `?${s}` : ""}`;
                  })()}
                  aria-current={d.day === dayParam ? "true" : undefined}
                  className={`block rounded-input border px-2.5 py-1.5 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite ${
                    d.day === dayParam
                      ? "border-edge-champagne"
                      : d.day === todayBerlin
                        ? "border-edge-neutral"
                        : "border-transparent"
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
