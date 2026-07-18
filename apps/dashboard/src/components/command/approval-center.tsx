"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { LockSimpleIcon } from "@phosphor-icons/react";
import { StatusBadge, type StatusLevel } from "@/components/primitives";
import { PayloadView, type ApprovalText } from "@/components/approvals/approval-card";
import { decideApprovals } from "@/app/(command)/approvals/actions";
import { subscribeDxb } from "@/lib/realtime";

// ApprovalCenter — /approvals (E9.3, APPROVAL_ENGINE §5/§7/§10).
// Pending queue + recent decisions from v_approvals_center (one query, RSC);
// quick approve/reject rides the LOCKED 0015 batch fn (decide_approvals —
// "mevcut karar yolu KALIR"); the 7-action surface lives on the detail page
// (/approvals/[id] → control_approvals_action). Liveness: `approvals`
// Broadcast → debounced server refetch. §10: NO optimistic update — a wrong
// "approved" frame is a disaster-class bug; rows repaint from the refetch.
// money_out: gold double edge + lock (DESIGN §16), excluded from bulk
// selection ALWAYS, and decided only on the detail page with full context.

export type CenterRow = {
  id: string;
  status: string;
  actionType: string;
  operation: string | null;
  operationClass: string | null;
  riskClass: string;
  purpose: string | null;
  payload: Record<string, unknown>;
  costEstimate: number | null;
  deadline: string | null;
  moneyOut: boolean;
  stale: boolean;
  expired: boolean;
  ageSeconds: number;
  requesterSlug: string | null;
  department: string | null;
  delegatedToSlug: string | null;
  taskObjective: string | null;
  taskBudgetCeilingEur: number | null;
  taskDueAt: string | null;
  departmentDisplay: string | null;
  departmentDisplayTr: string | null;
  createdAt: string;
  decidedAt: string | null;
  decidedAction: string | null;
  decisionNote: string | null;
};

export type FatigueRow = {
  operationClass: string;
  pendingCount: number;
  oldestPendingAt: string | null;
  avgPendingHours: number | null;
  decided7d: number;
  approved7d: number;
  avgDecisionMinutes7d: number | null;
};

export type CenterLabels = {
  viewPending: string;
  viewDecided: string;
  filterClass: string;
  filterDepartment: string;
  filterAge: string;
  all: string;
  ageOver24h: string;
  ageStale: string;
  shown: string;
  empty: string;
  emptyDecided: string;
  moneyOut: string;
  stale: string;
  expired: string;
  delegated: string;
  deadline: string;
  requester: string;
  department: string;
  operation: string;
  costEstimate: string;
  taskBudgetCeiling: string;
  taskDue: string;
  recommended: string;
  reasoning: string;
  approve: string;
  reject: string;
  rejectNotePlaceholder: string;
  decideInDetail: string;
  openDetail: string;
  selectedCount: string;
  approveSelected: string;
  rejectSelected: string;
  bulkMoneyOutNote: string;
  fatigueTitle: string;
  fatiguePending: string;
  fatigueOldest: string;
  fatigueRate7d: string;
  fatigueAvgDecision: string;
  fatigueSuggestion: string;
  decidedAs: string;
  hours: string;
  minutes: string;
  classes: Record<string, string>;
  riskLevels: Record<string, string>;
  actions: Record<string, string>;
  payloadText: ApprovalText;
};

const RISK_BADGE: Record<string, StatusLevel> = {
  low: "info",
  medium: "warn",
  high: "danger",
  critical: "critical",
};

export function formatAge(seconds: number, hoursLabel: string): string {
  const hours = seconds / 3600;
  if (hours < 1) return `${Math.max(1, Math.round(seconds / 60))}m`;
  if (hours < 48) return `${Math.round(hours)}${hoursLabel}`;
  return `${Math.round(hours / 24)}d`;
}

function fmtTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ApprovalCenter({
  pending,
  decided,
  fatigue,
  labels,
  locale,
}: {
  pending: CenterRow[];
  decided: CenterRow[];
  fatigue: FatigueRow[];
  labels: CenterLabels;
  locale: string;
}) {
  const router = useRouter();
  const [view, setView] = useState<"pending" | "decided">("pending");
  const [klass, setKlass] = useState("all");
  const [department, setDepartment] = useState("all");
  const [age, setAge] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Broadcast → server refetch, debounced (same idiom as AlertCenter).
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const unsubscribe = subscribeDxb("approvals", () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => router.refresh(), 400);
    });
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      unsubscribe();
    };
  }, [router]);

  const rows = view === "pending" ? pending : decided;
  const departmentOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of rows) {
      if (!r.department || seen.has(r.department)) continue;
      seen.set(
        r.department,
        (locale === "tr" ? r.departmentDisplayTr : r.departmentDisplay) ?? r.department,
      );
    }
    return Array.from(seen, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [rows, locale]);
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (klass !== "all" && (r.operationClass ?? "other") !== klass) return false;
        if (department !== "all" && r.department !== department) return false;
        if (age === "over24h" && r.ageSeconds < 24 * 3600) return false;
        if (age === "stale" && !r.stale) return false;
        return true;
      }),
    [rows, klass, department, age],
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Bulk decisions ride the LOCKED batch fn — all-or-nothing with an audit
  // row per item (its poison-batch rollback is proven in tests/phase8).
  const bulkDecide = async (decision: "approved" | "rejected") => {
    setBusy(true);
    setError(null);
    const res = await decideApprovals(Array.from(selected), decision);
    setBusy(false);
    if (!res.ok) setError(res.error);
    else {
      setSelected(new Set());
      router.refresh();
    }
  };

  const singleDecide = async (id: string, decision: "approved" | "rejected", note?: string) => {
    setBusy(true);
    setError(null);
    const res = await decideApprovals([id], decision, note);
    setBusy(false);
    if (!res.ok) setError(res.error);
    else router.refresh();
  };

  const selectCls =
    "rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary";
  const viewBtn = (v: "pending" | "decided", label: string, count: number) => (
    <button
      type="button"
      onClick={() => {
        setView(v);
        setSelected(new Set());
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
      <FatigueBanner fatigue={fatigue} labels={labels} />

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          {viewBtn("pending", labels.viewPending, pending.length)}
          {viewBtn("decided", labels.viewDecided, decided.length)}
        </div>
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.filterClass}</span>
          <select className={selectCls} value={klass} onChange={(e) => setKlass(e.target.value)}>
            <option value="all">{labels.all}</option>
            {Object.entries(labels.classes).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.filterDepartment}</span>
          <select
            className={selectCls}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="all">{labels.all}</option>
            {departmentOptions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.filterAge}</span>
          <select className={selectCls} value={age} onChange={(e) => setAge(e.target.value)}>
            <option value="all">{labels.all}</option>
            <option value="over24h">{labels.ageOver24h}</option>
            <option value="stale">{labels.ageStale}</option>
          </select>
        </label>
        <span className="ml-auto pb-1 font-data text-body-s tabular-nums text-ink-muted">
          {filtered.length} {labels.shown}
        </span>
      </div>

      {view === "pending" && selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-panel border border-edge-champagne bg-surface-graphite px-4 py-2">
          <span className="text-body-s text-ink-primary">
            {selected.size} {labels.selectedCount}
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => void bulkDecide("approved")}
            className="rounded-input border border-edge-champagne px-3 py-1 text-body-s text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:bg-surface-obsidian disabled:opacity-50"
          >
            {labels.approveSelected}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void bulkDecide("rejected")}
            className="rounded-input border border-edge-neutral px-3 py-1 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:text-status-danger disabled:opacity-50"
          >
            {labels.rejectSelected}
          </button>
          <span className="text-caption text-ink-muted">{labels.bulkMoneyOutNote}</span>
        </div>
      )}

      {error && <p className="text-body-s text-status-danger">{error}</p>}

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-body-s text-ink-muted">
          {view === "pending" ? labels.empty : labels.emptyDecided}
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => (
            <CenterCard
              key={r.id}
              row={r}
              labels={labels}
              locale={locale}
              selected={selected.has(r.id)}
              onSelect={() => toggleSelect(r.id)}
              busy={busy}
              onDecide={singleDecide}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// R6 fatigue guard: live counters per class; when a class is decided ≥5
// times in 7d and EVERY decision approved, the system surfaces the
// autonomy-candidate suggestion — the DECISION stays with the CEO
// (change_policy on the detail page / rules panel).
function FatigueBanner({ fatigue, labels }: { fatigue: FatigueRow[]; labels: CenterLabels }) {
  const totalPending = fatigue.reduce((n, f) => n + f.pendingCount, 0);
  if (fatigue.length === 0 || totalPending === 0) return null;
  const oldest = fatigue
    .map((f) => f.oldestPendingAt)
    .filter(Boolean)
    .sort()[0] as string | undefined;
  const candidates = fatigue.filter(
    (f) => f.operationClass !== "money_out" && f.decided7d >= 5 && f.approved7d === f.decided7d,
  );
  const avgDecision = fatigue.find((f) => f.avgDecisionMinutes7d !== null)?.avgDecisionMinutes7d;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-panel border border-edge-neutral bg-surface-obsidian px-4 py-2">
      <span className="label-caps text-ink-muted">{labels.fatigueTitle}</span>
      <span className="text-body-s text-ink-secondary">
        {labels.fatiguePending}{" "}
        <span className="font-data tabular-nums text-ink-primary">{totalPending}</span>
      </span>
      {oldest && (
        <span className="text-body-s text-ink-secondary">
          {labels.fatigueOldest}{" "}
          <span className="font-data tabular-nums text-ink-primary">
            {formatAge((Date.now() - new Date(oldest).getTime()) / 1000, labels.hours)}
          </span>
        </span>
      )}
      {typeof avgDecision === "number" && (
        <span className="text-body-s text-ink-secondary">
          {labels.fatigueAvgDecision}{" "}
          <span className="font-data tabular-nums text-ink-primary">
            {Math.round(avgDecision)}
            {labels.minutes}
          </span>
        </span>
      )}
      {candidates.map((c) => (
        <span key={c.operationClass} className="text-body-s text-accent-champagne">
          {labels.fatigueSuggestion.replace(
            "{class}",
            labels.classes[c.operationClass] ?? c.operationClass,
          )}
        </span>
      ))}
    </div>
  );
}

function CenterCard({
  row,
  labels,
  locale,
  selected,
  onSelect,
  busy,
  onDecide,
}: {
  row: CenterRow;
  labels: CenterLabels;
  locale: string;
  selected: boolean;
  onSelect: () => void;
  busy: boolean;
  onDecide: (id: string, decision: "approved" | "rejected", note?: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const isPending = row.status === "pending";
  const badge = RISK_BADGE[row.riskClass] ?? "warn";
  // DESIGN §16: money_out carries the gold double edge + lock.
  const frame = row.moneyOut
    ? "rounded-panel border-2 border-double border-edge-champagne bg-surface-obsidian"
    : "rounded-panel border border-edge-neutral bg-surface-obsidian";

  return (
    <li className={frame}>
      <div className="flex w-full flex-wrap items-center gap-3 px-4 py-3">
        {isPending &&
          (row.moneyOut ? (
            // money_out is NEVER bulk-selectable (§10) — the lock takes the
            // checkbox slot so the exclusion is visible, not accidental.
            <span aria-hidden className="flex w-4 justify-center text-accent-champagne">
              <LockSimpleIcon size={14} weight="fill" />
            </span>
          ) : (
            <input
              type="checkbox"
              checked={selected}
              onChange={onSelect}
              aria-label={row.operation ?? row.actionType}
              className="h-4 w-4 accent-[var(--accent-champagne)]"
            />
          ))}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 flex-wrap items-center gap-3 text-left"
        >
          <StatusBadge level={badge}>
            {labels.riskLevels[row.riskClass] ?? row.riskClass}
          </StatusBadge>
          {row.moneyOut && (
            <span className="label-caps text-accent-champagne">{labels.moneyOut}</span>
          )}
          <span className="min-w-0 flex-1 truncate text-body-s text-ink-primary">
            {row.purpose ?? row.taskObjective ?? row.operation ?? row.actionType}
          </span>
          <span className="label-caps text-ink-muted">
            {labels.classes[row.operationClass ?? "other"] ?? (row.operationClass ?? "—")}
          </span>
          {row.expired && <span className="label-caps text-status-danger">{labels.expired}</span>}
          {!row.expired && row.stale && (
            <span className="label-caps text-status-warn">{labels.stale}</span>
          )}
          {row.delegatedToSlug && (
            <span className="label-caps text-ink-muted">
              {labels.delegated} {row.delegatedToSlug}
            </span>
          )}
          <span className="font-data text-body-s tabular-nums text-ink-muted">
            {isPending
              ? formatAge(row.ageSeconds, labels.hours)
              : (labels.actions[row.decidedAction ?? ""] ?? row.decidedAction)}
          </span>
        </button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-edge-neutral px-4 py-3">
          <dl className="grid gap-x-4 gap-y-1 md:grid-cols-[max-content_1fr]">
            <dt className="label-caps text-ink-muted">{labels.operation}</dt>
            <dd className="font-data text-body-s text-ink-secondary">
              {row.operation ?? row.actionType}
            </dd>
            {row.requesterSlug && (
              <>
                <dt className="label-caps text-ink-muted">{labels.requester}</dt>
                <dd className="text-body-s text-ink-secondary">{row.requesterSlug}</dd>
              </>
            )}
            {row.department && (
              <>
                <dt className="label-caps text-ink-muted">{labels.department}</dt>
                <dd className="text-body-s text-ink-secondary">
                  {(locale === "tr" ? row.departmentDisplayTr : row.departmentDisplay) ??
                    row.department}
                </dd>
              </>
            )}
            {row.costEstimate !== null && (
              <>
                <dt className="label-caps text-ink-muted">{labels.costEstimate}</dt>
                <dd className="font-data text-body-s tabular-nums text-ink-secondary">
                  €{Number(row.costEstimate).toFixed(2)}
                </dd>
              </>
            )}
            {row.deadline && (
              <>
                <dt className="label-caps text-ink-muted">{labels.deadline}</dt>
                <dd className="font-data text-body-s tabular-nums text-ink-secondary">
                  {fmtTime(row.deadline, locale)}
                </dd>
              </>
            )}
            {row.taskBudgetCeilingEur !== null && (
              <>
                <dt className="label-caps text-ink-muted">{labels.taskBudgetCeiling}</dt>
                <dd className="font-data text-body-s tabular-nums text-ink-secondary">
                  €{Number(row.taskBudgetCeilingEur).toFixed(2)}
                </dd>
              </>
            )}
            {!row.deadline && row.taskDueAt && (
              <>
                <dt className="label-caps text-ink-muted">{labels.taskDue}</dt>
                <dd className="font-data text-body-s tabular-nums text-ink-secondary">
                  {fmtTime(row.taskDueAt, locale)}
                </dd>
              </>
            )}
            {row.decidedAt && (
              <>
                <dt className="label-caps text-ink-muted">{labels.decidedAs}</dt>
                <dd className="text-body-s text-ink-secondary">
                  {labels.actions[row.decidedAction ?? ""] ?? row.decidedAction} ·{" "}
                  {fmtTime(row.decidedAt, locale)}
                  {row.decisionNote ? ` — ${row.decisionNote}` : ""}
                </dd>
              </>
            )}
          </dl>

          <PayloadView payload={row.payload} open={false} text={labels.payloadText} />

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/approvals/${row.id}`}
              className="text-body-s text-accent-champagne hover:underline"
            >
              {labels.openDetail} →
            </Link>
            {isPending && !row.moneyOut && (
              <>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={labels.rejectNotePlaceholder}
                  maxLength={500}
                  className="min-w-48 flex-1 rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onDecide(row.id, "rejected", note || undefined)}
                  className="rounded-input border border-edge-neutral px-3 py-1 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:text-status-danger disabled:opacity-50"
                >
                  {labels.reject}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onDecide(row.id, "approved", note || undefined)}
                  className="rounded-input border border-edge-champagne px-3 py-1 text-body-s text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite disabled:opacity-50"
                >
                  {labels.approve}
                </button>
              </>
            )}
            {isPending && row.moneyOut && (
              <span className="text-body-s text-ink-muted">{labels.decideInDetail}</span>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
