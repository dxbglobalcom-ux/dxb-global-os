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

// /org/hr v2 (CEO complaint 2026-07-17 → RULE #0-B trigger case: "an HR
// module with zero categorization is not a digital HR"). The landing view is
// the ORGANIZATION: one card per active department — director, lifecycle
// counts, equipment debt — and every card drills into /org/employees?dept=….
// The E5.4b compliance surfaces stay: probation queue inline, the 7-point
// equipment audit grid behind ?view=equipment (reachable, never the landing
// dump). The unequipped figure remains the REGISTERED workforce-activation-
// gap risk (project_risks, E9.4) — shown honestly, never smoothed.

export const metadata = { title: "HR — DXB" };

const EQUIP_KEYS = [
  "e1_org_row",
  "e2_record",
  "e3_hook",
  "e4_grants",
  "e5_litellm_key",
  "e6_budget",
  "e7_persona_task",
] as const;

type EquipRow = {
  employee_id: string;
  slug: string;
  employment_status: string;
  all_ok: boolean;
} & Record<(typeof EQUIP_KEYS)[number], boolean>;

type ProbationRow = {
  employee_id: string;
  slug: string;
  department: string;
  days_in_probation: number;
  max_days: number;
  overdue: boolean;
  open_tasks: number;
};

type RosterRow = {
  employee_id: string;
  slug: string;
  department: string;
  role: string | null;
  role_level: string | null;
  employment_status: string;
  equipment_ok: boolean;
};

type DeptRow = {
  slug: string;
  display_name: string;
  display_name_tr: string | null;
  director_id: string | null;
};

export default async function HrPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; view?: string; dept?: string }>;
}) {
  const { status, view, dept } = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.hr;
  const tf = dict.command.filters;
  const supabase = await createClient();
  const equipmentView = view === "equipment";

  const statusFilter = ["draft", "probation", "active", "dormant", "archived"].includes(
    status ?? "",
  )
    ? status
    : undefined;
  const deptFilter = dept || undefined;

  let equipQuery = supabase
    .from("v_hr_equipment_check")
    .select("*", { count: "exact" })
    .order("slug")
    .limit(50);
  if (statusFilter) equipQuery = equipQuery.eq("employment_status", statusFilter);
  if (deptFilter) equipQuery = equipQuery.eq("department", deptFilter);

  const [rosterRes, deptRes, probationRes, equipRes] = await Promise.all([
    // C8 (CEO order 2026-07-19): the CEO sees the WORKING organization —
    // archived/dormant records are history, not headcount. They remain
    // reachable through the explicit status filter, never in the default view.
    supabase
      .from("v_hr_roster")
      .select("employee_id, slug, department, role, role_level, employment_status, equipment_ok")
      .not("employment_status", "in", "(archived,dormant)"),
    supabase
      .from("departments")
      .select("slug, display_name, display_name_tr, director_id")
      .order("slug"),
    supabase
      .from("v_hr_probation_queue")
      .select("employee_id, slug, department, days_in_probation, max_days, overdue, open_tasks")
      .order("days_in_probation", { ascending: false })
      .limit(25),
    equipmentView ? equipQuery : Promise.resolve(null),
  ]);

  if (rosterRes.error || deptRes.error || probationRes.error || equipRes?.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.hr} state="error">
          <p className="text-body-s text-status-danger">
            hr views:{" "}
            {rosterRes.error?.message ??
              deptRes.error?.message ??
              probationRes.error?.message ??
              equipRes?.error?.message}
          </p>
        </Panel>
      </div>
    );
  }

  const roster = (rosterRes.data ?? []) as RosterRow[];
  const departments = (deptRes.data ?? []) as DeptRow[];
  const probation = (probationRes.data ?? []) as ProbationRow[];
  const equip = (equipRes?.data ?? []) as EquipRow[];
  const equipMatched = equipRes?.count ?? equip.length;

  const byStatus = new Map<string, number>();
  for (const r of roster)
    byStatus.set(r.employment_status, (byStatus.get(r.employment_status) ?? 0) + 1);
  const unequipped = roster.filter((r) => !r.equipment_ok).length;

  const statusLabels = t.statuses as Record<string, string>;
  const equipLabels = t.equipment as Record<string, string>;

  const hrTeam = roster
    .filter((r) => r.department === "people-hr")
    .sort((a, b) =>
      a.role_level === "director" ? -1 : b.role_level === "director" ? 1 : a.slug.localeCompare(b.slug),
    );

  const deptName = (d: DeptRow) =>
    locale === "tr" ? (d.display_name_tr ?? d.display_name) : d.display_name;

  // Department categorization: the digital-HR core. Director first from the
  // org bind (departments.director_id), else the roster's director row.
  const byDept = new Map<string, RosterRow[]>();
  for (const r of roster) {
    const list = byDept.get(r.department) ?? [];
    list.push(r);
    byDept.set(r.department, list);
  }
  const cards = departments
    .map((d) => {
      const rows = byDept.get(d.slug) ?? [];
      const head =
        rows.find((r) => r.employee_id === d.director_id) ??
        rows.find((r) => r.role_level === "director") ??
        null;
      const counts = new Map<string, number>();
      for (const r of rows) counts.set(r.employment_status, (counts.get(r.employment_status) ?? 0) + 1);
      return {
        dept: d,
        rows,
        head,
        counts,
        missing: rows.filter((r) => !r.equipment_ok).length,
      };
    })
    .sort(
      (a, b) =>
        b.rows.length - a.rows.length ||
        deptName(a.dept).localeCompare(deptName(b.dept), locale),
    );

  const columns: Column<EquipRow>[] = [
    {
      key: "slug",
      label: t.colEmployee,
      render: (r) => <span className="block font-data">{r.slug}</span>,
    },
    {
      key: "employment_status",
      label: t.colStatus,
      render: (r) => (
        <StatusBadge level={r.employment_status === "active" ? "ok" : "info"}>
          {statusLabels[r.employment_status] ?? r.employment_status}
        </StatusBadge>
      ),
    },
    ...EQUIP_KEYS.map(
      (key): Column<EquipRow> => ({
        key,
        label: equipLabels[key] ?? key,
        align: "right",
        render: (r) => (
          <span
            className={
              r[key] ? "font-data text-status-ok" : "font-data text-status-danger"
            }
            aria-label={r[key] ? t.equipOk : t.equipMissing}
          >
            {r[key] ? "✓" : "✗"}
          </span>
        ),
      }),
    ),
    {
      key: "all_ok",
      label: t.colAllOk,
      render: (r) =>
        r.all_ok ? (
          <StatusBadge level="ok">{t.equipComplete}</StatusBadge>
        ) : (
          <StatusBadge level="danger">
            {`${EQUIP_KEYS.filter((k) => r[k]).length}/7`}
          </StatusBadge>
        ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.hr}{" "}
        <HelpTip text={dict.help.hr} />
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat label={t.kpiRoster} value={String(roster.length)} glow drillHref="/org/employees" />
        <Stat label={t.kpiProbation} value={String(probation.length)} drillHref="/org/hr" />
        <Stat
          label={t.kpiUnequipped}
          value={`${unequipped}/${roster.length}`}
          drillHref="/org/hr?view=equipment"
        />
        <Stat
          label={t.kpiActive}
          value={String(byStatus.get("active") ?? 0)}
          drillHref="/org/employees?status=active"
        />
      </div>

      {/* The HR function's own team — the first thing a CEO expects on the
          HR page (CEO question 2026-07-17: "where is the HR staff?"). */}
      {!equipmentView && hrTeam.length > 0 && (
        <Panel title={`${t.teamTitle} · ${hrTeam.length}`}>
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {/* One anatomy for every card (CEO symmetry ruling 2026-07-17):
                name on its own line, badge row ALWAYS below — short and long
                slugs render identically. */}
            {hrTeam.map((m) => (
              <li
                key={m.employee_id}
                className="min-w-0 rounded-input border border-edge-neutral bg-surface-graphite p-2.5"
              >
                <p className="min-w-0 break-words font-data text-body-s text-ink-primary">
                  {m.slug}
                </p>
                <p className="mt-2 flex items-center gap-2">
                  {m.role_level === "director" && (
                    <span className="label-caps rounded-input border border-edge-champagne px-1.5 py-0.5 text-caption text-accent-champagne">
                      {t.deptHead}
                    </span>
                  )}
                  <StatusBadge level={m.employment_status === "active" ? "ok" : "info"}>
                    {statusLabels[m.employment_status] ?? m.employment_status}
                  </StatusBadge>
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {equipmentView ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/org/hr"
              className="text-body-s text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:text-accent-ivory"
            >
              ← {t.viewOverview}
            </Link>
            {/* C9 list-page standard: the ad-hoc status chips became the
                FilterBar (same URL params + a department group; ?view=
                equipment is untouched — FilterBar only owns its params). */}
            <FilterBar
              clearLabel={tf.clear}
              groups={[
                {
                  param: "status",
                  label: tf.status,
                  kind: "chips",
                  value: statusFilter ?? "",
                  defaultValue: "",
                  options: [
                    { value: "", label: t.filterAll },
                    ...[...byStatus.entries()].sort().map(([s, n]) => ({
                      value: s,
                      label: `${statusLabels[s] ?? s} (${n})`,
                    })),
                  ],
                },
                {
                  param: "dept",
                  label: tf.department,
                  kind: "select",
                  value: deptFilter ?? "",
                  allLabel: tf.allDepartments,
                  options: departments.map((d) => ({
                    value: d.slug,
                    label: deptName(d),
                  })),
                },
              ]}
            />
          </div>

          <Panel title={`${t.equipmentTitle} · ${equipMatched}`}>
            <p className="mb-3 text-caption text-ink-muted">{t.equipmentHint}</p>
            {equip.length === 0 ? (
              <p className="py-2 text-body-s text-ink-secondary">{t.equipmentEmpty}</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <DataGrid
                    className="min-w-[960px]"
                    columns={columns}
                    rows={equip}
                    rowKey={(r) => r.employee_id}
                  />
                </div>
                <p className="mt-2 text-right font-data text-caption text-ink-muted tabular-nums">
                  {t.showing} {equip.length} {t.of} {equipMatched}
                </p>
              </>
            )}
          </Panel>
        </>
      ) : (
        <>
          <Panel title={`${t.deptTitle} · ${cards.length}`}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {cards.map(({ dept, rows, head, counts, missing }) => (
                <Link
                  key={dept.slug}
                  href={`/org/employees?dept=${dept.slug}`}
                  data-testid={`hr-dept-${dept.slug}`}
                  className="group min-w-0 rounded-panel border border-edge-neutral bg-surface-graphite p-3 transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne"
                >
                  <div className="flex min-w-0 items-baseline justify-between gap-2">
                    <p className="min-w-0 break-words font-display text-h3 text-ink-primary transition duration-[var(--t-fast)] ease-refined group-hover:text-accent-champagne">
                      {deptName(dept)}
                    </p>
                    <span className="font-data text-body-s text-ink-muted tabular-nums">
                      {rows.length}
                    </span>
                  </div>
                  {head ? (
                    <p className="mt-1 min-w-0 break-words text-body-s text-ink-secondary">
                      <span className="label-caps text-ink-muted">{t.deptHead}</span>{" "}
                      <span className="font-data">{head.slug}</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-body-s text-status-danger">{t.deptNoHead}</p>
                  )}
                  {rows.length === 0 ? (
                    <p className="mt-2 text-body-s text-ink-muted">{t.deptEmpty}</p>
                  ) : (
                    /* One badge-row anatomy on every card (CEO symmetry ruling):
                       lifecycle chips flow left, the red equipment-debt chip is
                       PINNED to the right edge — same anchor on all 21 cards. */
                    <p className="mt-2 flex flex-wrap items-center gap-1.5">
                      {[...counts.entries()].sort().map(([s, n]) => (
                        <span
                          key={s}
                          className="rounded-input border border-edge-neutral px-1.5 py-0.5 text-caption text-ink-secondary"
                        >
                          {statusLabels[s] ?? s}{" "}
                          <span className="font-data text-ink-primary tabular-nums">{n}</span>
                        </span>
                      ))}
                      {missing > 0 && (
                        <span className="ml-auto rounded-input border border-status-danger/60 px-1.5 py-0.5 text-caption text-status-danger">
                          {missing} {t.deptUnequipped}
                        </span>
                      )}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </Panel>

          {/* Probation queue: honest zero — the roster's draft/dormant mass has
              not entered probation; nothing is invented to fill the panel. */}
          <Panel title={`${t.probationTitle} · ${probation.length}`}>
            {probation.length === 0 ? (
              <p className="py-2 text-body-s text-ink-secondary">{t.probationEmpty}</p>
            ) : (
              <ul className="space-y-2">
                {probation.map((p) => (
                  <li
                    key={p.employee_id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-input border border-edge-neutral bg-surface-graphite p-2"
                  >
                    <span className="font-data text-body-s text-ink-primary">{p.slug}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-body-s text-ink-secondary">{p.department}</span>
                      <span className="font-data text-caption text-ink-muted tabular-nums">
                        {p.days_in_probation}/{p.max_days} {t.probationDays}
                      </span>
                      {p.overdue && (
                        <StatusBadge level="danger">{t.probationOverdue}</StatusBadge>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="flex justify-end">
            <Link
              href="/org/hr?view=equipment"
              data-testid="hr-equipment-link"
              className="text-body-s text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:text-accent-ivory"
            >
              {t.viewEquipment} · {unequipped}/{roster.length}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
