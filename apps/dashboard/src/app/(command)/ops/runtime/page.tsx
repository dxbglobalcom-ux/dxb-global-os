import Link from "next/link";
import {
  DataGrid,
  Panel,
  Stat,
  StatusBadge,
  type Column, HelpTip } from "@/components/primitives";
import { formatEur } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /ops/runtime v1 (E12.1-F) — the engine room: agent_runs over the last
// 24h (status mix, token/cost totals, model mix) + the most recent runs
// with their hook verdict presence. The live stream stays on /live; this
// page answers "what has the runtime been doing" at the run grain.

export const metadata = { title: "Runtime — DXB" };

type RunRow = {
  id: string;
  employee_id: string | null;
  model_id: string | null;
  status: string;
  started_at: string;
  ended_at: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  cost_eur: number | null;
  hook_version: string | null;
};

const STATUS_BADGE: Record<string, "ok" | "info" | "warn" | "danger"> = {
  succeeded: "ok",
  running: "info",
  waiting: "warn",
  failed: "danger",
  cancelled: "info",
};

export default async function RuntimePage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.runtime;
  const supabase = await createClient();

  const dayAgo = new Date(Date.now() - 24 * 3_600_000).toISOString();
  const [aggRes, runsRes] = await Promise.all([
    supabase
      .from("agent_runs")
      .select(
        "status, cnt:id.count(), tin:tokens_in.sum(), tout:tokens_out.sum(), cost:cost_eur.sum()",
      )
      .gte("started_at", dayAgo),
    supabase
      .from("agent_runs")
      .select(
        "id, employee_id, model_id, status, started_at, ended_at, tokens_in, tokens_out, cost_eur, hook_version",
      )
      .order("started_at", { ascending: false })
      .limit(25),
  ]);

  if (aggRes.error || runsRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.runtime} state="error">
          <p className="text-body-s text-status-danger">
            agent_runs: {aggRes.error?.message ?? runsRes.error?.message}
          </p>
        </Panel>
      </div>
    );
  }

  type AggRow = {
    status: string;
    cnt: number;
    tin: number | null;
    tout: number | null;
    cost: number | null;
  };
  const agg = (aggRes.data ?? []) as unknown as AggRow[];
  const runs24 = agg.reduce((a, r) => a + Number(r.cnt), 0);
  const failed24 = agg
    .filter((r) => r.status === "failed")
    .reduce((a, r) => a + Number(r.cnt), 0);
  const tokens24 = agg.reduce(
    (a, r) => a + Number(r.tin ?? 0) + Number(r.tout ?? 0),
    0,
  );
  const cost24 = agg.reduce((a, r) => a + Number(r.cost ?? 0), 0);
  const runs = (runsRes.data ?? []) as RunRow[];

  // Resolve employee slugs in one batched lookup.
  const employeeIds = [
    ...new Set(runs.map((r) => r.employee_id).filter(Boolean) as string[]),
  ];
  const slugById = new Map<string, string>();
  if (employeeIds.length > 0) {
    const res = await supabase.from("agents").select("id, slug").in("id", employeeIds);
    for (const a of (res.data ?? []) as { id: string; slug: string }[])
      slugById.set(a.id, a.slug);
  }

  const compact = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const statusLabels = dict.status as Record<string, string>;
  const timeFmt = (iso: string) =>
    new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

  const columns: Column<RunRow>[] = [
    {
      key: "employee_id",
      label: t.colEmployee,
      render: (r) => (
        <span className="block max-w-[26ch] break-all font-data">
          {r.employee_id ? (slugById.get(r.employee_id) ?? "—") : "—"}
        </span>
      ),
    },
    {
      key: "model_id",
      label: t.colModel,
      numeric: true,
      render: (r) => <span className="whitespace-nowrap">{r.model_id ?? "—"}</span>,
    },
    {
      key: "status",
      label: t.colStatus,
      render: (r) => (
        <StatusBadge level={STATUS_BADGE[r.status] ?? "info"}>
          {statusLabels[r.status] ?? r.status}
        </StatusBadge>
      ),
    },
    {
      key: "tokens",
      label: t.colTokens,
      align: "right",
      numeric: true,
      render: (r) =>
        compact.format(Number(r.tokens_in ?? 0) + Number(r.tokens_out ?? 0)),
    },
    {
      key: "cost_eur",
      label: t.colCost,
      align: "right",
      numeric: true,
      render: (r) => formatEur(Number(r.cost_eur ?? 0)),
    },
    {
      key: "hook_version",
      label: t.colHook,
      render: (r) =>
        r.hook_version ? (
          <StatusBadge level="ok">
            <span className="font-data">{r.hook_version}</span>
          </StatusBadge>
        ) : (
          <StatusBadge level="info">{t.hookPre}</StatusBadge>
        ),
    },
    {
      key: "started_at",
      label: t.colStarted,
      align: "right",
      numeric: true,
      render: (r) => (
        <span className="whitespace-nowrap font-data tabular-nums">
          {timeFmt(r.started_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.runtime}{" "}
        <HelpTip text={dict.help.runtime} />
      </h1>
        <Link href="/live" className="text-body-s text-accent-champagne">
          {t.viewLive}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat label={t.kpiRuns24h} value={String(runs24)} glow drillHref="/live" />
        <Stat label={t.kpiFailed24h} value={String(failed24)} drillHref="/alerts" />
        <Stat
          label={t.kpiTokens24h}
          value={compact.format(tokens24)}
          drillHref="/fin/tokens"
        />
        <Stat
          label={t.kpiCost24h}
          value={formatEur(cost24)}
          unit="EUR"
          drillHref="/fin/costs?range=today"
        />
      </div>

      <Panel title={t.mixTitle}>
        {agg.length === 0 ? (
          <p className="py-2 text-body-s text-ink-secondary">{t.mixEmpty}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {agg
              .sort((a, b) => Number(b.cnt) - Number(a.cnt))
              .map((r) => (
                <StatusBadge key={r.status} level={STATUS_BADGE[r.status] ?? "info"}>
                  {statusLabels[r.status] ?? r.status} {r.cnt}
                </StatusBadge>
              ))}
          </div>
        )}
      </Panel>

      <Panel title={`${t.runsTitle} · ${runs.length}`}>
        {runs.length === 0 ? (
          <p className="py-2 text-body-s text-ink-secondary">{t.runsEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <DataGrid
              className="min-w-[960px]"
              columns={columns}
              rows={runs}
              rowKey={(r) => r.id}
            />
          </div>
        )}
      </Panel>
    </div>
  );
}
