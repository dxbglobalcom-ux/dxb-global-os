import Link from "next/link";
import {
  DataGrid,
  Panel,
  Stat,
  StatusBadge,
  type Column,
} from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /org/hr v1 (E12.1-B) — the HR board over the E5.4b view family:
// v_hr_roster (employment lifecycle), v_hr_probation_queue (evaluation
// debt), v_hr_equipment_check (7-point onboarding contract). The 199/199
// unequipped figure is the REGISTERED workforce-activation-gap risk
// (project_risks, E9.4) — shown honestly, never smoothed.

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

export default async function HrPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.hr;
  const supabase = await createClient();

  const statusFilter = ["draft", "probation", "active", "dormant", "archived"].includes(
    status ?? "",
  )
    ? status
    : undefined;

  let equipQuery = supabase
    .from("v_hr_equipment_check")
    .select("*", { count: "exact" })
    .order("slug")
    .limit(50);
  if (statusFilter) equipQuery = equipQuery.eq("employment_status", statusFilter);

  const [rosterRes, probationRes, equipRes, unequippedRes] = await Promise.all([
    supabase.from("v_hr_roster").select("employment_status"),
    supabase
      .from("v_hr_probation_queue")
      .select("employee_id, slug, department, days_in_probation, max_days, overdue, open_tasks")
      .order("days_in_probation", { ascending: false })
      .limit(25),
    equipQuery,
    supabase
      .from("v_hr_equipment_check")
      .select("employee_id", { count: "exact", head: true })
      .eq("all_ok", false),
  ]);

  if (rosterRes.error || probationRes.error || equipRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.hr} state="error">
          <p className="text-body-s text-status-danger">
            hr views:{" "}
            {rosterRes.error?.message ??
              probationRes.error?.message ??
              equipRes.error?.message}
          </p>
        </Panel>
      </div>
    );
  }

  const roster = (rosterRes.data ?? []) as { employment_status: string }[];
  const byStatus = new Map<string, number>();
  for (const r of roster)
    byStatus.set(r.employment_status, (byStatus.get(r.employment_status) ?? 0) + 1);
  const probation = (probationRes.data ?? []) as ProbationRow[];
  const equip = (equipRes.data ?? []) as EquipRow[];
  const equipMatched = equipRes.count ?? equip.length;
  const unequipped = unequippedRes.count ?? 0;

  const statusLabels = t.statuses as Record<string, string>;
  const equipLabels = t.equipment as Record<string, string>;

  const selfHref = (s?: string) => (s ? `/org/hr?status=${s}` : "/org/hr");

  const columns: Column<EquipRow>[] = [
    {
      key: "slug",
      label: t.colEmployee,
      render: (r) => (
        <span className="block max-w-[28ch] truncate font-data" title={r.slug}>
          {r.slug}
        </span>
      ),
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
        {dict.command.nav.pages.hr}
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat label={t.kpiRoster} value={String(roster.length)} glow drillHref="/org/employees" />
        <Stat
          label={t.kpiProbation}
          value={String(probation.length)}
          drillHref="/org/hr"
        />
        <Stat
          label={t.kpiUnequipped}
          value={`${unequipped}/${roster.length}`}
          drillHref="/gov/risks"
        />
        <Stat
          label={t.kpiActive}
          value={String(byStatus.get("active") ?? 0)}
          drillHref={selfHref("active")}
        />
      </div>

      <Panel title={t.rosterTitle}>
        <div className="flex flex-wrap gap-2">
          <Link
            href={selfHref()}
            className={`rounded-input border px-2.5 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite ${
              !statusFilter
                ? "border-edge-champagne text-accent-champagne"
                : "border-edge-neutral text-ink-secondary"
            }`}
          >
            {t.filterAll}
            <span className="ml-1.5 font-data text-ink-muted tabular-nums">
              {roster.length}
            </span>
          </Link>
          {[...byStatus.entries()].sort().map(([s, n]) => (
            <Link
              key={s}
              href={selfHref(statusFilter === s ? undefined : s)}
              className={`rounded-input border px-2.5 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite ${
                statusFilter === s
                  ? "border-edge-champagne text-accent-champagne"
                  : "border-edge-neutral text-ink-secondary"
              }`}
            >
              {statusLabels[s] ?? s}
              <span className="ml-1.5 font-data text-ink-muted tabular-nums">{n}</span>
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
    </div>
  );
}
