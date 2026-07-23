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

// /org/employees v1 (D-bloku dalga-2, C-Hibrit) — the agents registry is
// seeded (153 legacy personas), so the roster renders REAL rows now.
// KPIs answer the Overview "AI workforce" drill (?status=…); department
// chips are doors into the same surface. persona_version makes the
// legacy→v2 wave (roadmap E5) visible per hire — no invented progress.

export const metadata = { title: "Employees — DXB" };

type AgentRow = {
  id: string;
  slug: string;
  department: string;
  role: "head" | "specialist" | "worker";
  brain: string;
  autonomy_level: number;
  persona_version: string;
  hook_version: string | null;
  employment_status: string;
  status: "dormant" | "active";
};

const ROW_LIMIT = 200;

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; dept?: string }>;
}) {
  const { status, dept } = await searchParams;
  const dict = getDict(await getLocale());
  const t = dict.command.employees;
  const supabase = await createClient();

  let rowsQuery = supabase
    .from("agents")
    .select(
      "id, slug, department, role, brain, autonomy_level, persona_version, hook_version, employment_status, status",
      { count: "exact" },
    )
    .order("department", { ascending: true })
    .order("role", { ascending: true })
    .order("slug", { ascending: true })
    .limit(ROW_LIMIT);
  if (status === "active" || status === "dormant")
    rowsQuery = rowsQuery.eq("status", status);
  if (dept) rowsQuery = rowsQuery.eq("department", dept);

  const [rowsRes, statusRes, deptRes, activeDeptRes] = await Promise.all([
    rowsQuery,
    supabase.from("agents").select("status, id.count()"),
    supabase.from("agents").select("department, id.count()"),
    supabase
      .from("departments")
      .select("slug", { count: "exact", head: true })
      .eq("status", "active"),
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
    (statusRes.data as unknown as { status: string; count: number }[]).map(
      (r) => [r.status, Number(r.count)],
    ),
  );
  const activeCount = byStatus.get("active") ?? 0;
  const dormantCount = byStatus.get("dormant") ?? 0;
  const totalCount = activeCount + dormantCount;
  const deptCounts = (
    deptRes.data as unknown as { department: string; count: number }[]
  )
    .map((r) => ({ department: r.department, count: Number(r.count) }))
    .sort((a, b) => a.department.localeCompare(b.department));
  const rows = (rowsRes.data ?? []) as AgentRow[];
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
      render: (r) => (
        <span className="block max-w-[32ch] break-all font-data">
          {r.slug}
        </span>
      ),
    },
    { key: "department", label: t.colDept, render: (r) => r.department },
    {
      key: "role",
      label: t.colRole,
      render: (r) => roleLabels[r.role] ?? r.role,
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
      align: "right",
      numeric: true,
      render: (r) => (
        <span className="whitespace-nowrap">{r.persona_version}</span>
      ),
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
      key: "status",
      label: t.colStatus,
      render: (r) => (
        <StatusBadge level={r.status === "active" ? "ok" : "info"}>
          {r.status === "active" ? t.kpiActive : t.kpiDormant}
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
          drillHref={selfHref({})}
        />
        <Stat
          label={t.kpiActive}
          value={String(activeCount)}
          glow
          drillHref={selfHref({ status: "active" })}
        />
        <Stat
          label={t.kpiDormant}
          value={String(dormantCount)}
          drillHref={selfHref({ status: "dormant" })}
        />
        <Stat
          label={t.kpiDepartments}
          value={String(activeDeptRes.count ?? 0)}
          drillHref="/org/departments"
        />
      </div>

      <Panel
        title={`${dict.command.nav.pages.employees} · ${dept ?? t.filterAll}`}
      >
        <div className="flex flex-wrap gap-2">
          <Link
            href={selfHref({ status })}
            className={`rounded-input border px-2.5 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite ${
              !dept
                ? "border-edge-champagne text-accent-champagne"
                : "border-edge-neutral text-ink-secondary"
            }`}
          >
            {t.filterAll}
            <span className="ml-1.5 font-data text-ink-muted tabular-nums">
              {totalCount}
            </span>
          </Link>
          {deptCounts.map((d) => (
            <Link
              key={d.department}
              href={selfHref({ status, dept: d.department })}
              className={`rounded-input border px-2.5 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite ${
                dept === d.department
                  ? "border-edge-champagne text-accent-champagne"
                  : "border-edge-neutral text-ink-secondary"
              }`}
            >
              {d.department}
              <span className="ml-1.5 font-data text-ink-muted tabular-nums">
                {d.count}
              </span>
            </Link>
          ))}
        </div>

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
