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

// /gov/risks v1 (E12.1-E) — the risk register over project_risks (rows are
// written ONLY through control_project_action log_risk — E9.4 single door).
// ?level= filter matches the CC-SPEC drill map ("Kritik risk →
// /gov/risks?level=critical"). Every row drills to its project cockpit.

export const metadata = { title: "Risks — DXB" };

const SEVERITIES = ["low", "medium", "high", "critical"] as const;

type RiskRow = {
  id: string;
  project_id: string;
  title: string;
  severity: string;
  status: string;
  note: string | null;
  updated_at: string;
};

const SEV_BADGE: Record<string, "info" | "warn" | "danger" | "critical"> = {
  low: "info",
  medium: "warn",
  high: "danger",
  critical: "critical",
};

export default async function RisksPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; status?: string }>;
}) {
  const { level, status } = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.risks;
  const tf = dict.command.filters;
  const supabase = await createClient();

  const levelFilter = SEVERITIES.includes(level as (typeof SEVERITIES)[number])
    ? level
    : undefined;
  const statusFilter = ["open", "mitigated", "accepted", "closed"].includes(
    status ?? "",
  )
    ? status
    : undefined;

  let query = supabase
    .from("project_risks")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .limit(100);
  if (levelFilter) query = query.eq("severity", levelFilter);
  if (statusFilter) query = query.eq("status", statusFilter);

  const [riskRes, allRes, projRes] = await Promise.all([
    query,
    supabase.from("project_risks").select("severity, status"),
    supabase.from("projects").select("id, slug, name"),
  ]);

  if (riskRes.error || allRes.error || projRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.risks} state="error">
          <p className="text-body-s text-status-danger">
            project_risks:{" "}
            {riskRes.error?.message ?? allRes.error?.message ?? projRes.error?.message}
          </p>
        </Panel>
      </div>
    );
  }

  const rows = (riskRes.data ?? []) as RiskRow[];
  const all = (allRes.data ?? []) as { severity: string; status: string }[];
  const projects = new Map(
    ((projRes.data ?? []) as { id: string; slug: string; name: string }[]).map((p) => [
      p.id,
      p,
    ]),
  );

  const open = all.filter((r) => r.status === "open");
  const openHigh = open.filter((r) => r.severity === "high" || r.severity === "critical");
  const resolved = all.filter((r) => r.status !== "open").length;

  const sevLabels = t.severities as Record<string, string>;
  const statusLabels = t.statuses as Record<string, string>;

  const selfHref = (over: Record<string, string | undefined>) => {
    const merged = { level: levelFilter, status: statusFilter, ...over };
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    const s = q.toString();
    return `/gov/risks${s ? `?${s}` : ""}`;
  };

  const columns: Column<RiskRow>[] = [
    {
      key: "title",
      label: t.colRisk,
      render: (r) => (
        <span className="block max-w-[52ch] break-words">
          {r.title}
        </span>
      ),
    },
    {
      key: "severity",
      label: t.colSeverity,
      render: (r) => (
        <StatusBadge level={SEV_BADGE[r.severity] ?? "info"}>
          {sevLabels[r.severity] ?? r.severity}
        </StatusBadge>
      ),
    },
    {
      key: "status",
      label: t.colStatus,
      render: (r) => (
        <StatusBadge level={r.status === "open" ? "warn" : "ok"}>
          {statusLabels[r.status] ?? r.status}
        </StatusBadge>
      ),
    },
    {
      key: "project_id",
      label: t.colProject,
      render: (r) => {
        const p = projects.get(r.project_id);
        return p ? (
          <Link
            href={`/ops/projects/${encodeURIComponent(p.slug)}`}
            className="text-accent-champagne"
          >
            {p.name}
          </Link>
        ) : (
          "—"
        );
      },
    },
    {
      key: "updated_at",
      label: t.colUpdated,
      align: "right",
      numeric: true,
      render: (r) => (
        <span className="whitespace-nowrap font-data tabular-nums">
          {new Date(r.updated_at).toLocaleDateString(
            locale === "tr" ? "tr-TR" : "en-GB",
            { day: "2-digit", month: "short" },
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.risks}{" "}
        <HelpTip text={dict.help.risks} />
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiOpen}
          value={String(open.length)}
          glow
          drillHref={selfHref({ status: "open", level: undefined })}
        />
        <Stat
          label={t.kpiOpenHigh}
          value={String(openHigh.length)}
          drillHref={selfHref({ level: "high", status: "open" })}
        />
        <Stat label={t.kpiResolved} value={String(resolved)} drillHref={selfHref({ status: "closed", level: undefined })} />
        <Stat label={t.kpiTotal} value={String(all.length)} drillHref="/gov/risks" />
      </div>

      <Panel title={`${dict.command.nav.pages.risks} · ${riskRes.count ?? rows.length}`}>
        {/* C9 list-page standard: the two link-chip rows became one
            FilterBar — same URL params (?level= stays the CC-SPEC drill
            contract), plus the standard clear-all affordance. */}
        <div className="mb-3">
          <FilterBar
            clearLabel={tf.clear}
            groups={[
              {
                param: "level",
                label: tf.severity,
                kind: "chips",
                value: levelFilter ?? "",
                defaultValue: "",
                options: [
                  { value: "", label: tf.all },
                  ...SEVERITIES.map((s) => ({
                    value: s,
                    label: sevLabels[s] ?? s,
                  })),
                ],
              },
              {
                param: "status",
                label: tf.status,
                kind: "chips",
                value: statusFilter ?? "",
                defaultValue: "",
                options: [
                  { value: "", label: tf.all },
                  ...(["open", "mitigated", "accepted", "closed"] as const).map(
                    (s) => ({ value: s, label: statusLabels[s] ?? s }),
                  ),
                ],
              },
            ]}
          />
        </div>

        {rows.length === 0 ? (
          <p className="py-4 text-body-s text-ink-secondary">{t.empty}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <DataGrid
                className="min-w-[880px]"
                columns={columns}
                rows={rows}
                rowKey={(r) => r.id}
              />
            </div>
            {/* full note text below the grid for the selected rows — the
                register is small; the note carries the closure evidence */}
            <ul className="mt-4 space-y-2 border-t border-edge-neutral pt-3">
              {rows
                .filter((r) => r.note)
                .map((r) => (
                  <li key={r.id} className="text-caption text-ink-muted">
                    <span className="font-data text-ink-secondary">
                      {r.title}:
                    </span>{" "}
                    {r.note}
                  </li>
                ))}
            </ul>
          </>
        )}
      </Panel>
    </div>
  );
}
