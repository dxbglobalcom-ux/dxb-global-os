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

// /org/employees v1 (D-bloku dalga-2, C-Hibrit) — the agents registry is
// seeded (153 legacy personas), so the roster renders REAL rows now.
// KPIs answer the Overview "AI workforce" drill (?status=…); department
// chips are doors into the same surface. The Persona column reads the version of
// the persona this employee is BOUND to (agents.persona_id → personas.version) —
// NOT the version TAG column on agents, which W10 (2026-09-15, audit F024) measured
// reading 'v2.0-fable' on all 213 live employees while their bound texts stood at
// v21 · v18 · v17 · v16 …: his own page was showing a label, not a version. The tag
// stays in the database for the eligibility gates that read it; it is no longer shown
// to him as if it were the version of the text his employee runs on.

export const metadata = { title: "Employees — DXB" };

type AgentRow = {
  id: string;
  slug: string;
  department: string;
  role: "head" | "specialist" | "worker";
  brain: string;
  autonomy_level: number;
  persona_id: string | null;
  hook_version: string | null;
  employment_status: "active" | "dormant" | "archived";
  brain_source: "default" | "slot" | "ceo_override";
};

const ROW_LIMIT = 200;

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; dept?: string; role?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.employees;
  const tf = dict.command.filters;
  const supabase = await createClient();

  // C9 filter standard: every value is validated server-side; junk params
  // fall back to "all" silently (the costs/tokens idiom).
  const status =
    params.status === "active" || params.status === "dormant"
      ? params.status
      : undefined;
  const role =
    params.role === "head" || params.role === "specialist" || params.role === "worker"
      ? params.role
      : undefined;
  const dept = params.dept || undefined;

  // Workforce truth = employment_status (the legacy agents.status column went
  // stale after the activation waves — the 2026-07-24 eye-test catch, same
  // fix as v_exec_overview migration 20260724005000). Archived rows leave
  // every figure: CEO surfaces show the working org only (C8).
  let rowsQuery = supabase
    .from("agents")
    .select(
      "id, slug, department, role, brain, brain_source, autonomy_level, persona_id, hook_version, employment_status",
      { count: "exact" },
    )
    .neq("employment_status", "archived")
    .order("department", { ascending: true })
    .order("role", { ascending: true })
    .order("slug", { ascending: true })
    .limit(ROW_LIMIT);
  if (status) rowsQuery = rowsQuery.eq("employment_status", status);
  if (dept) rowsQuery = rowsQuery.eq("department", dept);
  if (role) rowsQuery = rowsQuery.eq("role", role);

  // KPI queries narrow with dept/role too (C9: the whole page follows the
  // filter); status stays out of the KPI scope because the KPI row IS the
  // status breakdown of whatever slice is selected.
  let statusQuery = supabase
    .from("agents")
    .select("employment_status, id.count()")
    .neq("employment_status", "archived");
  if (dept) statusQuery = statusQuery.eq("department", dept);
  if (role) statusQuery = statusQuery.eq("role", role);
  let activeDeptQuery = supabase
    .from("agents")
    .select("department")
    .eq("employment_status", "active");
  if (dept) activeDeptQuery = activeDeptQuery.eq("department", dept);
  if (role) activeDeptQuery = activeDeptQuery.eq("role", role);

  const [rowsRes, statusRes, deptRes, activeDeptRes, deptNamesRes, modelNamesRes] =
    await Promise.all([
      rowsQuery,
      statusQuery,
      supabase
        .from("agents")
        .select("department, id.count()")
        .neq("employment_status", "archived"),
      // active departments = departments with active employees (the
      // departments.status column is legacy-stale the same way)
      activeDeptQuery,
      supabase.from("departments").select("slug, display_name, display_name_tr"),
      // U21 eye-test catch: this column rendered the raw catalog id, so the CEO
      // read "fable-5" on his own workforce page. U20 decision 4 froze the id as
      // an internal technical key and put every CEO-VISIBLE label on
      // display_name — the brain cell has to resolve through the catalog.
      fetchModelNames(supabase),
    ]);

  if (rowsRes.error || statusRes.error || deptRes.error) {
    const message =
      rowsRes.error?.message ??
      statusRes.error?.message ??
      deptRes.error?.message;
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.employees} state="error">
          <p className="text-body-s text-status-danger">agents: {message}</p>
        </Panel>
      </div>
    );
  }

  const byStatus = new Map<string, number>(
    (
      statusRes.data as unknown as {
        employment_status: string;
        count: number;
      }[]
    ).map((r) => [r.employment_status, Number(r.count)]),
  );
  const activeCount = byStatus.get("active") ?? 0;
  const dormantCount = byStatus.get("dormant") ?? 0;
  const totalCount = activeCount + dormantCount;
  const activeDeptCount = new Set(
    (
      (activeDeptRes.data ?? []) as unknown as { department: string }[]
    ).map((r) => r.department),
  ).size;
  const deptNames = new Map(
    (
      (deptNamesRes.data ?? []) as {
        slug: string;
        display_name: string;
        display_name_tr: string | null;
      }[]
    ).map((d) => [
      d.slug,
      locale === "tr" ? (d.display_name_tr ?? d.display_name) : d.display_name,
    ]),
  );
  const modelNames = modelNamesRes;
  const deptCounts = (
    deptRes.data as unknown as { department: string; count: number }[]
  )
    .map((r) => ({ department: r.department, count: Number(r.count) }))
    .sort((a, b) => a.department.localeCompare(b.department));
  const rows = (rowsRes.data ?? []) as AgentRow[];

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
  const matched = rowsRes.count ?? rows.length;
  const roleLabels = t.roles as Record<AgentRow["role"], string>;

  const selfHref = (params: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    const s = q.toString();
    return `/org/employees${s ? `?${s}` : ""}`;
  };

  const columns: Column<AgentRow>[] = [
    {
      key: "slug",
      label: t.colAgent,
      // U21 eye-test: break-all split slugs mid-word ("chief-of-sta ff") at the
      // CEO's windowed width. The table already scrolls inside its own
      // overflow-x container, so the slug stays on one line instead.
      render: (r) => (
        <span className="block whitespace-nowrap font-data">{r.slug}</span>
      ),
    },
    {
      key: "department",
      label: t.colDept,
      render: (r) => deptNames.get(r.department) ?? r.department,
    },
    {
      key: "role",
      label: t.colRole,
      render: (r) => roleLabels[r.role] ?? r.role,
    },
    {
      // §4b truth: a 'default' brain is the never-assigned seed placeholder —
      // echoing it as a chosen model misled the CEO (2026-07-25 catch).
      // §4f: the column is no longer decoration — it is the FLOOR this employee's
      // own work runs at. The CEO asked what "183 Sonnet" meant; the header now
      // answers that where he reads it, instead of in a spec he would have to
      // go looking for.
      key: "brain",
      label: (
        <span className="inline-flex items-center gap-1">
          {t.colBrain}
          <HelpTip text={t.brainFloorHelp} />
        </span>
      ),
      numeric: true,
      render: (r) =>
        r.brain_source === "default" ? (
          <span className="whitespace-normal text-caption text-ink-muted">
            {t.brainUnassigned}
          </span>
        ) : (
          <span className="whitespace-nowrap">
            {modelLabel(modelNames, r.brain)}
          </span>
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
      // W10 (audit F024): the version of the persona text this employee is bound
      // to, read from the bound persona itself. An unbound live employee shows as
      // unbound rather than borrowing a number it does not have.
      key: "persona_id",
      label: (
        <span className="inline-flex items-center gap-1">
          {t.colPersona}
          <HelpTip text={t.personaVersionHelp} />
        </span>
      ),
      align: "right",
      numeric: true,
      render: (r) => {
        const version = r.persona_id ? personaVersions.get(r.persona_id) : undefined;
        return version === undefined ? (
          <span className="whitespace-nowrap text-caption text-ink-muted">
            {t.personaUnbound}
          </span>
        ) : (
          <span className="whitespace-nowrap font-data">v{version}</span>
        );
      },
    },
    {
      // FABLE_5_HOOK §5 row 3 / §21: the employee card carries the hook
      // status — an unbound live employee is a visible defect, never hidden.
      key: "hook_version",
      label: t.colHook,
      render: (r) =>
        r.hook_version ? (
          <StatusBadge level="ok">
            <span className="font-data">{r.hook_version}</span>
          </StatusBadge>
        ) : (
          // §21 wall is about LIVE employees — an archived row's NULL is
          // honest history, not an alarm.
          <StatusBadge level={r.employment_status === "archived" ? "info" : "danger"}>
            {t.hookUnbound}
          </StatusBadge>
        ),
    },
    {
      key: "employment_status",
      label: t.colStatus,
      render: (r) => (
        <StatusBadge level={r.employment_status === "active" ? "ok" : "info"}>
          {r.employment_status === "active" ? t.kpiActive : t.kpiDormant}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.employees}{" "}
        <HelpTip text={dict.help.employees} />
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiTotal}
          value={String(totalCount)}
          glow
          drillHref={selfHref({ dept, role })}
        />
        <Stat
          label={t.kpiActive}
          value={String(activeCount)}
          glow
          drillHref={selfHref({ status: "active", dept, role })}
        />
        <Stat
          label={t.kpiDormant}
          value={String(dormantCount)}
          drillHref={selfHref({ status: "dormant", dept, role })}
        />
        <Stat
          label={t.kpiDepartments}
          value={String(activeDeptCount)}
          drillHref="/org/departments"
        />
      </div>

      <Panel
        title={`${dict.command.nav.pages.employees} · ${
          dept ? (deptNames.get(dept) ?? dept) : t.filterAll
        }`}
      >
        {/* C9 list-page standard: the chip wall (21 departments) became a
            FilterBar — progressive disclosure (registered CEO preference),
            same URL params as before so KPI drills keep working. */}
        <FilterBar
          clearLabel={tf.clear}
          groups={[
            {
              param: "status",
              label: tf.status,
              kind: "chips",
              value: status ?? "",
              defaultValue: "",
              options: [
                { value: "", label: tf.all },
                { value: "active", label: t.kpiActive },
                { value: "dormant", label: t.kpiDormant },
              ],
            },
            {
              param: "dept",
              label: tf.department,
              kind: "select",
              value: dept ?? "",
              allLabel: tf.allDepartments,
              options: deptCounts.map((d) => ({
                value: d.department,
                label: `${deptNames.get(d.department) ?? d.department} (${d.count})`,
              })),
            },
            {
              param: "role",
              label: tf.role,
              kind: "chips",
              value: role ?? "",
              defaultValue: "",
              options: [
                { value: "", label: tf.all },
                { value: "head", label: roleLabels.head },
                { value: "specialist", label: roleLabels.specialist },
                { value: "worker", label: roleLabels.worker },
              ],
            },
          ]}
        />

        <div className="mt-4 border-t border-edge-neutral pt-1">
          {rows.length === 0 ? (
            <div className="py-6">
              <p className="text-body-s text-ink-secondary">{t.empty}</p>
              <p className="mt-1 text-caption text-ink-muted">{t.emptyHint}</p>
              <div className="mt-3">
                <Link href={selfHref({})} className="text-accent-champagne">
                  {t.filterAll}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                {/* 9 columns crush at 1280 (RULE #0 catch) — real scroll
                    beats hidden columns, same idiom as /ai/library. */}
                <DataGrid
                  className="min-w-[960px]"
                  columns={columns}
                  rows={rows}
                  rowKey={(r) => r.id}
                />
              </div>
              <p className="mt-2 text-right font-data text-caption text-ink-muted tabular-nums">
                {t.showing} {rows.length} {t.of} {matched}
              </p>
            </>
          )}
        </div>
      </Panel>
    </div>
  );
}
