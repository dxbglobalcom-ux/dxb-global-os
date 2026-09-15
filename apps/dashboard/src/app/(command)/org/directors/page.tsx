import Link from "next/link";
import {
  DataGrid,
  FilterBar,
  Panel,
  Stat,
  StatusBadge,
  type Column, HelpTip } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";
import { fetchModelNames, modelLabel } from "@/lib/model-names";

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
  brain_source: "default" | "slot" | "ceo_override";
  autonomy_level: number;
  hook_version: string | null;
  employment_status: "active" | "dormant" | "archived";
  persona_id: string | null;
};

export default async function DirectorsPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string; bound?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.directors;
  const tf = dict.command.filters;
  const supabase = await createClient();

  // C9 filter standard: validated URL params, junk falls back silently.
  const dept = params.dept || undefined;
  const bound =
    params.bound === "bound" || params.bound === "unbound"
      ? params.bound
      : undefined;

  const [rowsRes, deptRes, modelNames] = await Promise.all([
    supabase
      .from("agents")
      // Workforce truth = employment_status (legacy agents.status is stale —
      // same 2026-07-24 catch as v_exec_overview); archived heads stay off
      // the CEO surface (C8 working-org rule).
      .select(
        "id, slug, department, brain, brain_source, autonomy_level, hook_version, employment_status, persona_id",
      )
      .eq("role", "head")
      .neq("employment_status", "archived")
      .order("department"),
    supabase.from("departments").select("slug, display_name, display_name_tr"),
    // U21: CEO-visible label comes from the catalog, never the frozen id.
    fetchModelNames(supabase),
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
  const allRows = (rowsRes.data ?? []) as DirectorRow[];
  // C9: every figure below follows the filter (small bench — narrowed here,
  // not in SQL).
  const rows = allRows.filter(
    (r) =>
      (!dept || r.department === dept) &&
      (!bound || (bound === "bound") === (r.hook_version != null)),
  );


  // W10 (audit F024): the version the CEO reads is the BOUND persona's own
  // version. Read as its own query rather than as an embedded relationship —
  // a to-one embed's shape is decided by PostgREST at runtime, and a column on
  // his page may not depend on a shape this session could not measure.
  const personaVersions = new Map<string, number>();
  const boundIds = Array.from(
    new Set(rows.map((r) => r.persona_id).filter((v): v is string => !!v)),
  );
  if (boundIds.length > 0) {
    const versionsRes = await supabase
      .from("personas")
      .select("id, version")
      .in("id", boundIds);
    for (const p of (versionsRes.data ?? []) as unknown as {
      id: string;
      version: number;
    }[]) {
      personaVersions.set(p.id, p.version);
    }
  }

  const personaBound = rows.filter((r) => r.persona_id != null).length;
  const hookBound = rows.filter((r) => r.hook_version != null).length;
  const anyUnbound = allRows.some((r) => r.hook_version == null);

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
      render: (r) =>
        r.brain_source === "default" ? (
          <span className="whitespace-normal text-caption text-ink-muted">
            {t.brainUnassigned}
          </span>
        ) : (
          <span className="whitespace-nowrap">{modelLabel(modelNames, r.brain)}</span>
        ),
    },
    {
      key: "autonomy_level",
      label: t.colAutonomy,
      align: "right",
      numeric: true,
      render: (r) => `L${r.autonomy_level}`,
    },
    {
      // W10 (audit F024): the bound persona's own version, not the version TAG
      // column on agents, which read 'v2.0-fable' for every employee alike.
      key: "persona_id",
      label: (
        <span className="inline-flex items-center gap-1">
          {t.colPersona}
          <HelpTip text={t.personaVersionHelp} />
        </span>
      ),
      render: (r) => {
        const version = r.persona_id ? personaVersions.get(r.persona_id) : undefined;
        return version === undefined ? (
          <StatusBadge level="danger">{t.unbound}</StatusBadge>
        ) : (
          <StatusBadge level="ok">
            <span className="font-data">v{version}</span>
          </StatusBadge>
        );
      },
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
        {/* C9 list-page standard. The hook-binding group only renders while
            an unbound director actually exists — a filter with one real
            value is noise (A1: informative fields only). */}
        <div className="mb-4">
          <FilterBar
            clearLabel={tf.clear}
            groups={[
              {
                param: "dept",
                label: tf.department,
                kind: "select",
                value: dept ?? "",
                allLabel: tf.allDepartments,
                options: allRows
                  .map((r) => r.department)
                  .sort()
                  .map((d) => ({ value: d, label: deptNames.get(d) ?? d })),
              },
              ...(anyUnbound
                ? [
                    {
                      param: "bound",
                      label: t.colHook,
                      kind: "chips" as const,
                      value: bound ?? "",
                      defaultValue: "",
                      options: [
                        { value: "", label: tf.all },
                        { value: "unbound", label: t.unbound },
                      ],
                    },
                  ]
                : []),
            ]}
          />
        </div>
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
