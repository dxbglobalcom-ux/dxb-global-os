"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { StatusBadge, type StatusLevel } from "@/components/primitives";
import { subscribeDxb } from "@/lib/realtime";

// AlertCenter — /alerts (E8.4b, OBSERVABILITY_SPEC §5 + CC-SPEC §7).
// Active queue comes from v_alerts_active (severity → unacked → age order,
// pending critical approvals ride along per CC-SPEC §4); resolved history is
// a second honest list, not a fake archive. Lifecycle mutations go through
// /api/control/alerts ONLY (§8 — no table writes from the UI). Liveness:
// the `alerts` Broadcast channel triggers a server refetch (no client-side
// cache — §10).

export type AlertRow = {
  kind: string; // 'alert' | 'approval'
  id: string;
  level: string;
  title: string;
  source: string;
  at: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  responsibleSlug: string | null;
  affectedArea: string | null;
  probableCause: string | null;
  suggestedAction: string | null;
  mitigation: string | null;
  ceoAction: string | null;
  escalatedFrom: string | null;
  taskId: string | null;
};

export type AgentOption = { id: string; slug: string };

export type AlertLabels = {
  filterLevel: string;
  filterSource: string;
  all: string;
  viewActive: string;
  viewResolved: string;
  colWhen: string;
  ack: string;
  resolve: string;
  mute: string;
  assign: string;
  owner: string;
  unassigned: string;
  acked: string;
  resolved: string;
  affectedArea: string;
  escalatedFrom: string;
  probableCause: string;
  suggestedAction: string;
  mitigationTaken: string;
  ceoAction: string;
  notePlaceholder: string;
  mitigationPlaceholder: string;
  viewSource: string;
  taskLink: string;
  approvalRow: string;
  empty: string;
  emptyResolved: string;
  shown: string;
  levels: Record<string, string>;
  sources: Record<string, string>;
};

const LEVEL_BADGE: Record<string, StatusLevel> = {
  informational: "info",
  attention: "warn",
  high: "danger",
  critical: "critical",
  emergency: "critical",
};

// CC-SPEC §7: alert card drills to the SOURCE module page.
const SOURCE_HREF: Record<string, string> = {
  cost: "/fin/costs",
  routing: "/ai/orchestration",
  agent_run: "/live",
  queue: "/live",
  heartbeat: "/sys/health",
  observability: "/live",
  file_review: "/gov/audit",
  approval: "/approvals",
};

function fmtTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AlertCenter({
  active,
  resolved,
  agents,
  labels,
  locale,
}: {
  active: AlertRow[];
  resolved: AlertRow[];
  agents: AgentOption[];
  labels: AlertLabels;
  locale: string;
}) {
  const router = useRouter();
  const [view, setView] = useState<"active" | "resolved">("active");
  const [level, setLevel] = useState("all");
  const [source, setSource] = useState("all");
  const [open, setOpen] = useState<string | null>(null);

  // Broadcast → server refetch, debounced: a raise/ack/resolve lands within
  // a second without any client-side alert cache.
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const unsubscribe = subscribeDxb("alerts", () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => router.refresh(), 400);
    });
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      unsubscribe();
    };
  }, [router]);

  const rows = view === "active" ? active : resolved;
  const sourceOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.source))).sort(),
    [rows],
  );
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (level !== "all" && r.level !== level) return false;
        if (source !== "all" && r.source !== source) return false;
        return true;
      }),
    [rows, level, source],
  );

  const selectCls =
    "rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary";
  const viewBtn = (v: "active" | "resolved", label: string, count: number) => (
    <button
      type="button"
      onClick={() => {
        setView(v);
        setOpen(null);
      }}
      className={`rounded-input border px-3 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined ${
        view === v
          ? "border-edge-champagne text-accent-champagne"
          : "border-edge-neutral text-ink-secondary hover:text-ink-primary"
      }`}
    >
      {label} <span className="font-data tabular-nums">({count})</span>
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          {viewBtn("active", labels.viewActive, active.length)}
          {viewBtn("resolved", labels.viewResolved, resolved.length)}
        </div>
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.filterLevel}</span>
          <select className={selectCls} value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="all">{labels.all}</option>
            {Object.entries(labels.levels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.filterSource}</span>
          <select className={selectCls} value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="all">{labels.all}</option>
            {sourceOptions.map((s) => (
              <option key={s} value={s}>
                {labels.sources[s] ?? s}
              </option>
            ))}
          </select>
        </label>
        <span className="ml-auto pb-1 font-data text-body-s tabular-nums text-ink-muted">
          {filtered.length} {labels.shown}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-body-s text-ink-muted">
          {view === "active" ? labels.empty : labels.emptyResolved}
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => (
            <AlertCard
              key={`${r.kind}-${r.id}`}
              row={r}
              agents={agents}
              labels={labels}
              locale={locale}
              open={open === r.id}
              onToggle={() => setOpen(open === r.id ? null : r.id)}
              onDone={() => router.refresh()}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

async function callAlertApi(body: Record<string, unknown>): Promise<string | null> {
  const res = await fetch("/api/control/alerts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok: boolean; error?: string; detail?: string };
  return data.ok ? null : (data.detail ?? data.error ?? "request failed");
}

function AlertCard({
  row,
  agents,
  labels,
  locale,
  open,
  onToggle,
  onDone,
}: {
  row: AlertRow;
  agents: AgentOption[];
  labels: AlertLabels;
  locale: string;
  open: boolean;
  onToggle: () => void;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const isApproval = row.kind === "approval";
  const isResolved = row.resolvedAt !== null;
  const badge = LEVEL_BADGE[row.level] ?? "info";
  const href = SOURCE_HREF[row.source] ?? "/live";

  const act = async (op: "ack" | "resolve" | "mute" | "assign", extra?: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    const err = await callAlertApi({ op, alertId: row.id, ...extra });
    setBusy(false);
    if (err) setError(err);
    else {
      setNote("");
      onDone();
    }
  };

  return (
    <li className="rounded-panel border border-edge-neutral bg-surface-obsidian">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
      >
        <StatusBadge level={badge}>{labels.levels[row.level] ?? row.level}</StatusBadge>
        <span className="min-w-0 flex-1 truncate text-body-s text-ink-primary">{row.title}</span>
        <span className="label-caps text-ink-muted">{labels.sources[row.source] ?? row.source}</span>
        {row.acknowledgedAt && !isResolved && (
          <span className="label-caps text-status-ok">{labels.acked}</span>
        )}
        {row.escalatedFrom && (
          <span className="label-caps text-status-danger">
            {labels.escalatedFrom} {labels.levels[row.escalatedFrom] ?? row.escalatedFrom}
          </span>
        )}
        <span className="font-data text-body-s tabular-nums text-ink-muted">
          {fmtTime(row.at, locale)}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-edge-neutral px-4 py-3">
          <dl className="grid gap-x-4 gap-y-1 md:grid-cols-[max-content_1fr]">
            {row.affectedArea && (
              <>
                <dt className="label-caps text-ink-muted">{labels.affectedArea}</dt>
                <dd className="text-body-s text-ink-secondary">{row.affectedArea}</dd>
              </>
            )}
            {row.probableCause && (
              <>
                <dt className="label-caps text-ink-muted">{labels.probableCause}</dt>
                <dd className="text-body-s text-ink-secondary">{row.probableCause}</dd>
              </>
            )}
            {row.suggestedAction && (
              <>
                <dt className="label-caps text-ink-muted">{labels.suggestedAction}</dt>
                <dd className="text-body-s text-ink-secondary">{row.suggestedAction}</dd>
              </>
            )}
            {row.mitigation && (
              <>
                <dt className="label-caps text-ink-muted">{labels.mitigationTaken}</dt>
                <dd className="text-body-s text-ink-secondary">{row.mitigation}</dd>
              </>
            )}
            {row.ceoAction && (
              <>
                <dt className="label-caps text-ink-muted">{labels.ceoAction}</dt>
                <dd className="text-body-s text-ink-secondary">{row.ceoAction}</dd>
              </>
            )}
            <dt className="label-caps text-ink-muted">{labels.owner}</dt>
            <dd className="text-body-s text-ink-secondary">
              {row.responsibleSlug ?? labels.unassigned}
            </dd>
          </dl>

          <div className="flex flex-wrap items-center gap-3">
            <Link href={href} className="text-body-s text-accent-champagne hover:underline">
              {labels.viewSource} →
            </Link>
            {row.taskId && (
              <Link
                href="/ops/tasks"
                className="text-body-s text-accent-champagne hover:underline"
              >
                {labels.taskLink} →
              </Link>
            )}
          </div>

          {isApproval ? (
            <p className="text-body-s text-ink-muted">{labels.approvalRow}</p>
          ) : (
            !isResolved && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={labels.notePlaceholder}
                  maxLength={500}
                  className="min-w-48 flex-1 rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary"
                />
                {!row.acknowledgedAt && (
                  <ActionButton
                    label={labels.ack}
                    busy={busy}
                    onClick={() => act("ack", note ? { note } : undefined)}
                  />
                )}
                <ActionButton
                  label={labels.resolve}
                  busy={busy}
                  onClick={() => act("resolve", note ? { mitigation: note } : undefined)}
                />
                <ActionButton
                  label={labels.mute}
                  busy={busy}
                  onClick={() => act("mute", { minutes: 60 })}
                />
                <select
                  className="rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary"
                  disabled={busy}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) void act("assign", { employeeId: e.target.value });
                  }}
                >
                  <option value="">{labels.assign}</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.slug}
                    </option>
                  ))}
                </select>
              </div>
            )
          )}
          {error && <p className="text-body-s text-status-danger">{error}</p>}
        </div>
      )}
    </li>
  );
}

function ActionButton({
  label,
  busy,
  onClick,
}: {
  label: string;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className="rounded-input border border-edge-neutral px-3 py-1 text-body-s text-ink-primary transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne disabled:opacity-50"
    >
      {label}
    </button>
  );
}
