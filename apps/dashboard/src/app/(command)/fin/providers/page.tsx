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

// /fin/providers v1 (E12.1-C) — ProviderBoard (COST spec §5): provider
// health + spend from v_model_stats (model_catalog ⋈ agent_runs/ledger
// rollups, E7.x lineage). One real provider today (anthropic) — grouped
// header per provider, model rows under it; declared-vs-measured invoice
// reconciliation stays the CEO's monthly manual task (spec §16).

export const metadata = { title: "Providers — DXB" };

type ModelStatRow = {
  id: string;
  display_name: string;
  provider: string;
  status: string;
  banned: boolean;
  mechanical_only: boolean;
  fallback_of: string | null;
  runs_30d: number;
  succeeded_30d: number;
  failed_30d: number;
  success_rate_30d: number | null;
  cost_30d_eur: number | null;
  active_runs: number;
  assigned_employees: number;
  slot_assignments: number;
};

export default async function ProvidersPage() {
  const dict = getDict(await getLocale());
  const t = dict.command.providers;
  const supabase = await createClient();

  const statsRes = await supabase
    .from("v_model_stats")
    .select(
      "id, display_name, provider, status, banned, mechanical_only, fallback_of, runs_30d, succeeded_30d, failed_30d, success_rate_30d, cost_30d_eur, active_runs, assigned_employees, slot_assignments",
    )
    .order("provider")
    .order("id");

  if (statsRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.providers} state="error">
          <p className="text-body-s text-status-danger">
            v_model_stats: {statsRes.error.message}
          </p>
        </Panel>
      </div>
    );
  }

  const rows = (statsRes.data ?? []) as ModelStatRow[];
  const providers = [...new Set(rows.map((r) => r.provider))];
  const runs30d = rows.reduce((a, r) => a + Number(r.runs_30d), 0);
  const cost30d = rows.reduce((a, r) => a + Number(r.cost_30d_eur ?? 0), 0);

  const columns: Column<ModelStatRow>[] = [
    {
      key: "id",
      label: t.colModel,
      render: (r) => (
        <Link
          href={`/ai/models?highlight=${encodeURIComponent(r.id)}`}
          className="font-data text-accent-champagne"
        >
          {r.display_name}
        </Link>
      ),
    },
    {
      key: "status",
      label: t.colStatus,
      render: (r) =>
        r.banned ? (
          <StatusBadge level="danger">{t.banned}</StatusBadge>
        ) : (
          <StatusBadge level={r.status === "active" ? "ok" : "info"}>
            {r.status === "active" ? t.statusActive : r.status}
          </StatusBadge>
        ),
    },
    {
      key: "runs_30d",
      label: t.colRuns30d,
      align: "right",
      numeric: true,
      render: (r) => r.runs_30d,
    },
    {
      key: "success_rate_30d",
      label: t.colSuccess,
      align: "right",
      numeric: true,
      render: (r) =>
        r.runs_30d > 0 && r.success_rate_30d != null
          ? `${Number(r.success_rate_30d).toFixed(0)}%`
          : "—",
    },
    {
      key: "cost_30d_eur",
      label: t.colCost30d,
      align: "right",
      numeric: true,
      render: (r) => formatEur(Number(r.cost_30d_eur ?? 0)),
    },
    {
      key: "active_runs",
      label: t.colActiveRuns,
      align: "right",
      numeric: true,
      render: (r) => r.active_runs,
    },
    {
      key: "slot_assignments",
      label: t.colSlots,
      align: "right",
      numeric: true,
      render: (r) => r.slot_assignments,
    },
    {
      key: "fallback_of",
      label: t.colFallback,
      render: (r) =>
        r.fallback_of ? (
          <span className="font-data text-ink-secondary">{r.fallback_of}</span>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.providers}{" "}
        <HelpTip text={dict.help.providers} />
      </h1>
        <Link href="/ai/models" className="text-body-s text-accent-champagne">
          {t.viewModels}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiProviders}
          value={String(providers.length)}
          glow
          drillHref="/fin/providers"
        />
        <Stat label={t.kpiModels} value={String(rows.length)} drillHref="/ai/models" />
        <Stat label={t.kpiRuns30d} value={String(runs30d)} drillHref="/live" />
        <Stat
          label={t.kpiCost30d}
          value={formatEur(cost30d)}
          unit="EUR"
          drillHref="/fin/costs?range=30d"
        />
      </div>

      {providers.map((p) => (
        <Panel key={p} title={`${t.providerTitle} · ${p}`}>
          <div className="overflow-x-auto">
            <DataGrid
              className="min-w-[960px]"
              columns={columns}
              rows={rows.filter((r) => r.provider === p)}
              rowKey={(r) => r.id}
            />
          </div>
        </Panel>
      ))}
      {providers.length === 0 && (
        <Panel title={t.providerTitle}>
          <p className="py-2 text-body-s text-ink-secondary">{t.empty}</p>
        </Panel>
      )}

      {/* Invoice reconciliation (declared vs measured) = monthly manual CEO
          task per COST spec §16 — the board states it instead of faking it. */}
      <p className="text-caption text-ink-muted">{t.reconcileNote}</p>
    </div>
  );
}
