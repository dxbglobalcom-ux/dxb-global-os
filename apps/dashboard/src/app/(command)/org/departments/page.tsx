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

// /org/departments v1 (E12.1-B) — v_org_tree is the single source (0025x
// catalog: hierarchy + agent/cost rollups). TR locale renders the DB's
// display_name_tr (bilingual purity gate: DB text is an i18n surface too).
// Every row drills to the employee roster filtered to that department.

export const metadata = { title: "Departments — DXB" };

type TreeRow = {
  slug: string;
  display_name: string;
  status: string;
  depth: number;
  agents_total: number;
  agents_active: number;
  cost_today_eur: number | null;
  cost_7d_eur: number | null;
};

export default async function DepartmentsPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.departments;
  const supabase = await createClient();

  const [treeRes, namesRes] = await Promise.all([
    supabase
      .from("v_org_tree")
      .select(
        "slug, display_name, status, depth, agents_total, agents_active, cost_today_eur, cost_7d_eur",
      )
      .order("depth")
      .order("slug"),
    supabase.from("departments").select("slug, display_name_tr"),
  ]);

  if (treeRes.error || namesRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.departments} state="error">
          <p className="text-body-s text-status-danger">
            v_org_tree: {treeRes.error?.message ?? namesRes.error?.message}
          </p>
        </Panel>
      </div>
    );
  }

  const trNames = new Map(
    ((namesRes.data ?? []) as { slug: string; display_name_tr: string | null }[]).map(
      (r) => [r.slug, r.display_name_tr],
    ),
  );
  const rows = ((treeRes.data ?? []) as TreeRow[]).map((r) => ({
    ...r,
    name:
      locale === "tr" ? (trNames.get(r.slug) ?? r.display_name) : r.display_name,
  }));

  const active = rows.filter((r) => r.status === "active").length;
  const employees = rows.reduce((a, r) => a + r.agents_total, 0);
  const cost7d = rows.reduce((a, r) => a + Number(r.cost_7d_eur ?? 0), 0);

  const columns: Column<(typeof rows)[number]>[] = [
    {
      key: "name",
      label: t.colName,
      render: (r) => (
        <Link
          href={`/org/employees?dept=${encodeURIComponent(r.slug)}`}
          className="text-accent-champagne"
        >
          {/* depth-indent keeps the hierarchy readable without a tree lib */}
          <span style={{ paddingLeft: `${r.depth * 16}px` }}>{r.name}</span>
        </Link>
      ),
    },
    {
      key: "slug",
      label: t.colSlug,
      render: (r) => <span className="font-data">{r.slug}</span>,
    },
    {
      key: "status",
      label: t.colStatus,
      render: (r) => (
        <StatusBadge level={r.status === "active" ? "ok" : "info"}>
          {r.status === "active" ? t.statusActive : t.statusInactive}
        </StatusBadge>
      ),
    },
    {
      key: "agents_total",
      label: t.colEmployees,
      align: "right",
      numeric: true,
      render: (r) => r.agents_total,
    },
    {
      key: "agents_active",
      label: t.colActive,
      align: "right",
      numeric: true,
      render: (r) => r.agents_active,
    },
    {
      key: "cost_today_eur",
      label: t.colCostToday,
      align: "right",
      numeric: true,
      render: (r) => formatEur(Number(r.cost_today_eur ?? 0)),
    },
    {
      key: "cost_7d_eur",
      label: t.colCost7d,
      align: "right",
      numeric: true,
      render: (r) => formatEur(Number(r.cost_7d_eur ?? 0)),
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.departments}{" "}
        <HelpTip text={dict.help.departments} />
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat label={t.kpiTotal} value={String(rows.length)} glow drillHref="/org/departments" />
        <Stat label={t.kpiActive} value={String(active)} drillHref="/org/departments" />
        <Stat label={t.kpiEmployees} value={String(employees)} drillHref="/org/employees" />
        <Stat
          label={t.kpiCost7d}
          value={formatEur(cost7d)}
          unit="EUR"
          drillHref="/fin/costs?range=7d"
        />
      </div>

      <Panel title={dict.command.nav.pages.departments}>
        {rows.length === 0 ? (
          <p className="py-4 text-body-s text-ink-secondary">{t.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <DataGrid
              className="min-w-[880px]"
              columns={columns}
              rows={rows}
              rowKey={(r) => r.slug}
            />
          </div>
        )}
      </Panel>
    </div>
  );
}
