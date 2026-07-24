import Link from "next/link";
import {
  DataGrid,
  Panel,
  Stat,
  StatusBadge,
  type Column, HelpTip } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /org/directors v1 (E12.1-B) — the department-head bench: every agents row
// with role='head', each carrying its persona/hook binding state (the same
// governance signals the employee roster shows; a director without a bound
// persona or hook is a visible defect, never hidden).

export const metadata = { title: "Directors — DXB" };

type DirectorRow = {
  id: string;
  slug: string;
  department: string;
  brain: string;
  autonomy_level: number;
  persona_version: string;
  hook_version: string | null;
  employment_status: "active" | "dormant" | "archived";
  persona_id: string | null;
};

export default async function DirectorsPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.directors;
  const supabase = await createClient();

  const [rowsRes, deptRes] = await Promise.all([
    supabase
      .from("agents")
      // Workforce truth = employment_status (legacy agents.status is stale —
      // same 2026-07-24 catch as v_exec_overview); archived heads stay off
      // the CEO surface (C8 working-org rule).
      .select(
        "id, slug, department, brain, autonomy_level, persona_version, hook_version, employment_status, persona_id",
      )
      .eq("role", "head")
      .neq("employment_status", "archived")
      .order("department"),
    supabase.from("departments").select("slug, display_name, display_name_tr"),
  ]);

  if (rowsRes.error || deptRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.directors} state="error">
          <p className="text-body-s text-status-danger">
            agents: {rowsRes.error?.message ?? deptRes.error?.message}
          </p>
        </Panel>
      </div>
    );
  }

  const deptNames = new Map(
    (
      (deptRes.data ?? []) as {
        slug: string;
        display_name: string;
        display_name_tr: string | null;
      }[]
    ).map((d) => [
      d.slug,
      locale === "tr" ? (d.display_name_tr ?? d.display_name) : d.display_name,
    ]),
  );
  const rows = (rowsRes.data ?? []) as DirectorRow[];

  const personaBound = rows.filter((r) => r.persona_id != null).length;
  const hookBound = rows.filter((r) => r.hook_version != null).length;

  const columns: Column<DirectorRow>[] = [
    {
      key: "slug",
      label: t.colDirector,
      render: (r) => (
        <span className="block max-w-[32ch] break-all font-data">
          {r.slug}
        </span>
      ),
    },
    {
      key: "department",
      label: t.colDept,
      render: (r) => (
        <Link
          href={`/org/employees?dept=${encodeURIComponent(r.department)}`}
          className="text-accent-champagne"
        >
          {deptNames.get(r.department) ?? r.department}
        </Link>
      ),
    },
    {
      key: "brain",
      label: t.colBrain,
      numeric: true,
      render: (r) => <span className="whitespace-nowrap">{r.brain}</span>,
    },
    {
      key: "autonomy_level",
      label: t.colAutonomy,
      align: "right",
      numeric: true,
      render: (r) => `L${r.autonomy_level}`,
    },
    {
      key: "persona_version",
      label: t.colPersona,
      render: (r) =>
        r.persona_id ? (
          <StatusBadge level="ok">
            <span className="font-data">{r.persona_version}</span>
          </StatusBadge>
        ) : (
          <StatusBadge level="danger">{t.unbound}</StatusBadge>
        ),
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
          <StatusBadge
            level={r.employment_status === "archived" ? "info" : "danger"}
          >
            {t.unbound}
          </StatusBadge>
        ),
    },
    {
      key: "employment_status",
      label: t.colStatus,
      render: (r) => (
        <StatusBadge level={r.employment_status === "active" ? "ok" : "info"}>
          {r.employment_status === "active" ? t.statusActive : t.statusDormant}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.directors}{" "}
        <HelpTip text={dict.help.directors} />
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat label={t.kpiTotal} value={String(rows.length)} glow drillHref="/org/directors" />
        <Stat
          label={t.kpiPersonaBound}
          value={`${personaBound}/${rows.length}`}
          drillHref="/org/employees"
        />
        <Stat
          label={t.kpiHookBound}
          value={`${hookBound}/${rows.length}`}
          drillHref="/gov/violations"
        />
        <Stat
          label={t.kpiDepartments}
          value={String(new Set(rows.map((r) => r.department)).size)}
          drillHref="/org/departments"
        />
      </div>

      <Panel title={dict.command.nav.pages.directors}>
        {rows.length === 0 ? (
          <p className="py-4 text-body-s text-ink-secondary">{t.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <DataGrid
              className="min-w-[880px]"
              columns={columns}
              rows={rows}
              rowKey={(r) => r.id}
            />
          </div>
        )}
      </Panel>
    </div>
  );
}
