import Link from "next/link";
import {
  DataGrid,
  Panel,
  Stat,
  StatusBadge,
  type Column,
  type StatusLevel,
} from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /ops/tasks v1 (D-bloku dalga-2, C-Hibrit) — pulled forward from E12.1:
// the queue is live since Phase 3, so the module renders REAL rows now.
// Filters answer the Overview drill doors (?state=…&range=…); every KPI
// is itself a door back into this surface (CC-SPEC 2B). Sorting/virtual
// scroll/row-drawer still land with the full table system at E12.1.

export const metadata = { title: "Tasks — DXB" };

const STATUSES = [
  "inbox",
  "queued",
  "claimed",
  "running",
  "review",
  "awaiting_approval",
  "done",
  "failed",
  "returned",
] as const;
type TaskStatus = (typeof STATUSES)[number];

// "active" = the machine's own work in flight. Single definition, shared
// with v_exec_overview_v1.active_tasks and the command-bar counter —
// awaiting_approval is the CEO's queue, counted separately.
const ACTIVE_SET: TaskStatus[] = ["queued", "claimed", "running"];

const BADGE: Record<TaskStatus, StatusLevel> = {
  inbox: "info",
  queued: "info",
  claimed: "info",
  running: "ok",
  review: "warn",
  awaiting_approval: "warn",
  done: "ok",
  failed: "danger",
  returned: "danger",
};

type TaskRow = {
  id: string;
  objective: string;
  department: string;
  status: TaskStatus;
  model_tier: string;
  priority: number;
  claimed_by: string | null;
  updated_at: string;
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; range?: string }>;
}) {
  const { state, range } = await searchParams;
  const dict = getDict(await getLocale());
  const t = dict.command.tasks;
  const supabase = await createClient();

  const dayAgoISO = new Date(Date.now() - 24 * 3_600_000).toISOString();

  let rowsQuery = supabase
    .from("tasks")
    .select(
      "id, objective, department, status, model_tier, priority, claimed_by, updated_at",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .limit(50);
  if (state === "active") rowsQuery = rowsQuery.in("status", ACTIVE_SET);
  else if ((STATUSES as readonly string[]).includes(state ?? ""))
    rowsQuery = rowsQuery.eq("status", state);
  if (range === "24h") rowsQuery = rowsQuery.gte("updated_at", dayAgoISO);
  else if (range === "today") {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    rowsQuery = rowsQuery.gte("updated_at", midnight.toISOString());
  }

  const [rowsRes, countsRes, failed24hRes] = await Promise.all([
    rowsQuery,
    supabase.from("tasks").select("status, id.count()"),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed")
      .gte("updated_at", dayAgoISO),
  ]);

  if (rowsRes.error || countsRes.error) {
    const message = rowsRes.error?.message ?? countsRes.error?.message;
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.tasks} state="error">
          <p className="text-body-s text-status-danger">tasks: {message}</p>
        </Panel>
      </div>
    );
  }

  const byStatus = new Map<string, number>(
    (countsRes.data as unknown as { status: string; count: number }[]).map(
      (r) => [r.status, Number(r.count)],
    ),
  );
  const statusCount = (s: TaskStatus) => byStatus.get(s) ?? 0;
  const activeCount = ACTIVE_SET.reduce((sum, s) => sum + statusCount(s), 0);
  const totalCount = [...byStatus.values()].reduce((a, b) => a + b, 0);
  const rows = (rowsRes.data ?? []) as TaskRow[];
  const matched = rowsRes.count ?? rows.length;
  const stateLabels = t.states as Record<TaskStatus, string>;

  const selfHref = (params: string) => `/ops/tasks${params ? `?${params}` : ""}`;

  const columns: Column<TaskRow>[] = [
    {
      key: "objective",
      label: t.colObjective,
      render: (r) => (
        <span className="block max-w-[40ch] truncate" title={r.objective}>
          {r.objective}
        </span>
      ),
    },
    { key: "department", label: t.colDept, render: (r) => r.department },
    {
      key: "status",
      label: t.colStatus,
      render: (r) => (
        <StatusBadge level={BADGE[r.status]}>
          {stateLabels[r.status] ?? r.status}
        </StatusBadge>
      ),
    },
    {
      key: "model_tier",
      label: t.colTier,
      numeric: true,
      render: (r) => r.model_tier,
    },
    {
      key: "priority",
      label: t.colPriority,
      align: "right",
      numeric: true,
      render: (r) => String(r.priority),
    },
    {
      key: "claimed_by",
      label: t.colClaimedBy,
      render: (r) => r.claimed_by ?? "—",
    },
    {
      key: "updated_at",
      label: t.colUpdated,
      align: "right",
      numeric: true,
      render: (r) =>
        new Date(r.updated_at).toLocaleString(undefined, {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.tasks}
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiActive}
          value={String(activeCount)}
          glow
          drillHref={selfHref("state=active")}
        />
        <Stat
          label={t.kpiRunning}
          value={String(statusCount("running"))}
          glow
          drillHref={selfHref("state=running")}
        />
        <Stat
          label={t.kpiQueued}
          value={String(statusCount("queued"))}
          drillHref={selfHref("state=queued")}
        />
        <Stat
          label={t.kpiFailed24h}
          value={String(failed24hRes.count ?? 0)}
          drillHref={selfHref("state=failed&range=24h")}
        />
      </div>

      <Panel
        title={`${t.filterLabel} · ${
          state && state !== "active"
            ? (stateLabels[state as TaskStatus] ?? state)
            : state === "active"
              ? t.kpiActive
              : t.filterAll
        }${range === "24h" ? ` · ${t.range24h}` : range === "today" ? ` · ${t.rangeToday}` : ""}`}
      >
        <div className="flex flex-wrap gap-2">
          <Link
            href={selfHref("")}
            className={`rounded-input border px-2.5 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite ${
              !state
                ? "border-edge-champagne text-accent-champagne"
                : "border-edge-neutral text-ink-secondary"
            }`}
          >
            {t.filterAll}
            <span className="ml-1.5 font-data text-ink-muted tabular-nums">
              {totalCount}
            </span>
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={selfHref(`state=${s}`)}
              className={`rounded-input border px-2.5 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite ${
                state === s
                  ? "border-edge-champagne text-accent-champagne"
                  : "border-edge-neutral text-ink-secondary"
              }`}
            >
              {stateLabels[s]}
              <span className="ml-1.5 font-data text-ink-muted tabular-nums">
                {statusCount(s)}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-4 border-t border-edge-neutral pt-1">
          {rows.length === 0 ? (
            <div className="py-6">
              <p className="text-body-s text-ink-secondary">{t.empty}</p>
              <p className="mt-1 text-caption text-ink-muted">{t.emptyHint}</p>
              <div className="mt-3 flex gap-4 text-body-s">
                {(state || range) && (
                  <Link href={selfHref("")} className="text-accent-champagne">
                    {t.clearFilter}
                  </Link>
                )}
                <Link href="/live" className="text-accent-champagne">
                  {dict.command.nav.pages.live}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <DataGrid columns={columns} rows={rows} rowKey={(r) => r.id} />
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
