import Link from "next/link";
import { Panel, Stat, StatusBadge } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /sys/logs v1 (E12.1-F) — the raw system tail across the three append-only
// streams: audit_log (control-seam actions), task_events (work lifecycle),
// decision_log (agent reasoning). ?src= switches the stream; deep analysis
// lives on the owning pages (/gov/audit, /gov/decisions, /live) — this is
// the "what just happened, in order" view.

export const metadata = { title: "Logs — DXB" };

const SOURCES = ["audit", "tasks", "decisions"] as const;
type Source = (typeof SOURCES)[number];
const ROW_LIMIT = 50;

type LogLine = {
  id: string;
  primary: string;
  secondary: string | null;
  at: string;
  href: string;
};

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string }>;
}) {
  const { src } = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.logs;
  const supabase = await createClient();

  const source: Source = SOURCES.includes(src as Source) ? (src as Source) : "audit";

  const [auditCountRes, taskCountRes, decisionCountRes] = await Promise.all([
    supabase.from("audit_log").select("id", { count: "exact", head: true }),
    supabase.from("task_events").select("id", { count: "exact", head: true }),
    supabase.from("decision_log").select("id", { count: "exact", head: true }),
  ]);

  let lines: LogLine[] = [];
  let queryError: string | null = null;
  if (source === "audit") {
    const res = await supabase
      .from("audit_log")
      .select("id, actor, action, created_at")
      .order("created_at", { ascending: false })
      .limit(ROW_LIMIT);
    queryError = res.error?.message ?? null;
    lines = ((res.data ?? []) as {
      id: number;
      actor: string;
      action: string;
      created_at: string;
    }[]).map((r) => ({
      id: String(r.id),
      primary: r.action,
      secondary: r.actor,
      at: r.created_at,
      href: `/gov/audit/${r.id}`,
    }));
  } else if (source === "tasks") {
    const res = await supabase
      .from("task_events")
      .select("id, task_id, actor, from_status, to_status, created_at")
      .order("created_at", { ascending: false })
      .limit(ROW_LIMIT);
    queryError = res.error?.message ?? null;
    lines = ((res.data ?? []) as {
      id: number;
      task_id: string;
      actor: string | null;
      from_status: string | null;
      to_status: string | null;
      created_at: string;
    }[]).map((r) => ({
      id: String(r.id),
      primary: `${r.from_status ?? "·"} → ${r.to_status ?? "·"}`,
      secondary: r.actor,
      at: r.created_at,
      href: "/ops/tasks",
    }));
  } else {
    const res = await supabase
      .from("v_decision_log")
      .select("id, decision, decided_by, employee, created_at")
      .order("created_at", { ascending: false })
      .limit(ROW_LIMIT);
    queryError = res.error?.message ?? null;
    lines = ((res.data ?? []) as {
      id: number;
      decision: string;
      decided_by: string | null;
      employee: string | null;
      created_at: string;
    }[]).map((r) => ({
      id: String(r.id),
      primary: r.decision,
      secondary: r.employee ?? r.decided_by,
      at: r.created_at,
      href: "/gov/decisions",
    }));
  }

  if (queryError) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.logs} state="error">
          <p className="text-body-s text-status-danger">{queryError}</p>
        </Panel>
      </div>
    );
  }

  const counts: Record<Source, number> = {
    audit: auditCountRes.count ?? 0,
    tasks: taskCountRes.count ?? 0,
    decisions: decisionCountRes.count ?? 0,
  };
  const sourceLabels = t.sources as Record<string, string>;

  const timeFmt = (iso: string) =>
    new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.logs}
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat
          label={t.kpiAudit}
          value={String(counts.audit)}
          glow={source === "audit"}
          drillHref="/sys/logs?src=audit"
        />
        <Stat
          label={t.kpiTasks}
          value={String(counts.tasks)}
          glow={source === "tasks"}
          drillHref="/sys/logs?src=tasks"
        />
        <Stat
          label={t.kpiDecisions}
          value={String(counts.decisions)}
          glow={source === "decisions"}
          drillHref="/sys/logs?src=decisions"
        />
      </div>

      <Panel title={`${sourceLabels[source] ?? source} · ${t.tail} ${ROW_LIMIT}`}>
        <div className="mb-3 flex flex-wrap gap-2">
          {SOURCES.map((s) => (
            <Link
              key={s}
              href={`/sys/logs?src=${s}`}
              className={`rounded-input border px-2.5 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite ${
                source === s
                  ? "border-edge-champagne text-accent-champagne"
                  : "border-edge-neutral text-ink-secondary"
              }`}
            >
              {sourceLabels[s] ?? s}
              <span className="ml-1.5 font-data text-ink-muted tabular-nums">
                {counts[s]}
              </span>
            </Link>
          ))}
        </div>

        {lines.length === 0 ? (
          <p className="py-2 text-body-s text-ink-secondary">{t.empty}</p>
        ) : (
          <ul className="divide-y divide-edge-neutral">
            {lines.map((l) => (
              <li key={l.id}>
                <Link
                  href={l.href}
                  className="flex items-center justify-between gap-3 py-1.5 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
                >
                  <span className="min-w-0 truncate font-data text-body-s text-ink-primary">
                    {l.primary}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    {l.secondary && (
                      <StatusBadge level="info">
                        <span className="font-data">{l.secondary}</span>
                      </StatusBadge>
                    )}
                    <span className="font-data text-caption text-ink-muted tabular-nums">
                      {timeFmt(l.at)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Append-only walls: these streams accept INSERT only (UPDATE/DELETE
          revoked) — the tail cannot be rewritten, only extended. */}
      <p className="text-caption text-ink-muted">{t.appendOnlyNote}</p>
    </div>
  );
}
