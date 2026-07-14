import Link from "next/link";
import { Panel, Stat, StatusBadge } from "@/components/primitives";
import { formatEur } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /org/companies v1 (E12.1-B) — the holding's company register. One REAL
// company today (dxb-global); spawned sub-OS companies (Outleteuro model,
// MASTER_PLAN Phase 11) will land here as rows, not as invented cards.
// Rollups come from v_org_tree (departments/agents/cost per company).

export const metadata = { title: "Companies — DXB" };

type CompanyRow = {
  id: string;
  slug: string;
  name: string;
  mission: string | null;
  status: string;
  created_at: string;
};

type TreeRow = {
  company_slug: string | null;
  agents_total: number;
  cost_7d_eur: number | null;
};

export default async function CompaniesPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.companies;
  const supabase = await createClient();

  const [companiesRes, treeRes] = await Promise.all([
    supabase.from("companies").select("*").order("created_at"),
    supabase.from("v_org_tree").select("company_slug, agents_total, cost_7d_eur"),
  ]);

  if (companiesRes.error || treeRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.companies} state="error">
          <p className="text-body-s text-status-danger">
            companies: {companiesRes.error?.message ?? treeRes.error?.message}
          </p>
        </Panel>
      </div>
    );
  }

  const companies = (companiesRes.data ?? []) as CompanyRow[];
  const tree = (treeRes.data ?? []) as TreeRow[];
  const byCompany = new Map<
    string,
    { departments: number; employees: number; cost7d: number }
  >();
  for (const row of tree) {
    if (!row.company_slug) continue;
    const c = byCompany.get(row.company_slug) ?? {
      departments: 0,
      employees: 0,
      cost7d: 0,
    };
    c.departments += 1;
    c.employees += row.agents_total;
    c.cost7d += Number(row.cost_7d_eur ?? 0);
    byCompany.set(row.company_slug, c);
  }

  const totalEmployees = [...byCompany.values()].reduce((a, c) => a + c.employees, 0);
  const totalDepartments = [...byCompany.values()].reduce(
    (a, c) => a + c.departments,
    0,
  );

  const dateFmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.companies}
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat label={t.kpiTotal} value={String(companies.length)} glow drillHref="/org/companies" />
        <Stat
          label={t.kpiActive}
          value={String(companies.filter((c) => c.status === "active").length)}
          drillHref="/org/companies"
        />
        <Stat label={t.kpiDepartments} value={String(totalDepartments)} drillHref="/org/departments" />
        <Stat label={t.kpiEmployees} value={String(totalEmployees)} drillHref="/org/employees" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {companies.map((c) => {
          const stats = byCompany.get(c.slug);
          return (
            <Panel
              key={c.id}
              title={c.name}
              action={
                <StatusBadge level={c.status === "active" ? "ok" : "info"}>
                  {c.status === "active" ? t.statusActive : t.statusInactive}
                </StatusBadge>
              }
            >
              {c.mission && (
                <p className="text-body-s text-ink-secondary">{c.mission}</p>
              )}
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-body-s md:grid-cols-4">
                <div>
                  <dt className="label-caps text-ink-muted">{t.cardDepartments}</dt>
                  <dd>
                    <Link
                      href="/org/departments"
                      className="font-data text-accent-champagne tabular-nums"
                    >
                      {stats?.departments ?? 0}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="label-caps text-ink-muted">{t.cardEmployees}</dt>
                  <dd>
                    <Link
                      href="/org/employees"
                      className="font-data text-accent-champagne tabular-nums"
                    >
                      {stats?.employees ?? 0}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="label-caps text-ink-muted">{t.cardCost7d}</dt>
                  <dd>
                    <Link
                      href="/fin/costs?range=7d"
                      className="font-data text-accent-champagne tabular-nums"
                    >
                      {formatEur(stats?.cost7d ?? 0)}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="label-caps text-ink-muted">{t.cardSince}</dt>
                  <dd className="font-data tabular-nums">{dateFmt(c.created_at)}</dd>
                </div>
              </dl>
            </Panel>
          );
        })}
      </div>

      {/* Honest forward note: sub-OS companies spawn at Phase 11 — an empty
          second card is not invented. */}
      <p className="text-caption text-ink-muted">{t.spawnNote}</p>
    </div>
  );
}
