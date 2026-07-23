"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { StatusBadge, type StatusLevel } from "@/components/primitives";

// Decision Logs tab (E8.4 — AUDIT_AND_LOGGING_SPEC §7): the 8 directive
// questions of madde 10.2 rendered as column headers verbatim — the CEO
// reads this table in his own directive language. Feed: v_decision_log
// (decision_log + run→employee/task context). Query surface only.

export type DecisionRow = {
  id: number;
  decidedBy: string;
  decision: string;
  rationale: string;
  dataUsed: string[] | null;
  alternatives: unknown;
  confidence: number | null;
  risk: string | null;
  approvalId: string | null;
  outcome: string | null;
  createdAt: string;
  runId: string | null;
  taskId: string | null;
  employee: string | null;
  taskObjective: string | null;
};

export type DecisionLabels = {
  colWho: string;
  colDecision: string;
  colRationale: string;
  colData: string;
  colAlternatives: string;
  colConfidence: string;
  colRisk: string;
  colApproval: string;
  colOutcome: string;
  colTime: string;
  filterWho: string;
  filterRisk: string;
  all: string;
  empty: string;
  shown: string;
  taskLink: string;
  drillContext: string;
  none: string;
  risks: Record<string, string>;
  selectAll: string;
  purgeSelected: string;
  purging: string;
};

const RISK_LEVEL: Record<string, StatusLevel> = {
  low: "ok",
  medium: "warn",
  high: "danger",
};

function fmtTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function altText(alternatives: unknown): string {
  if (!alternatives || (Array.isArray(alternatives) && alternatives.length === 0)) return "—";
  if (Array.isArray(alternatives)) {
    return alternatives
      .map((a) =>
        typeof a === "object" && a !== null
          ? Object.values(a as Record<string, unknown>).filter(Boolean).join(": ")
          : String(a),
      )
      .join(" · ");
  }
  return JSON.stringify(alternatives);
}

export function DecisionLogs({
  rows,
  labels,
  locale,
}: {
  rows: DecisionRow[];
  labels: DecisionLabels;
  locale: string;
}) {
  const router = useRouter();
  const [who, setWho] = useState("all");
  const [risk, setRisk] = useState("all");
  const [open, setOpen] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  const whoOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.decidedBy))).sort(), [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (who !== "all" && r.decidedBy !== who) return false;
        if (risk !== "all" && r.risk !== risk) return false;
        return true;
      }),
    [rows, who, risk],
  );

  // C17 (2026-07-19): a batch decision (e.g. 113 identical approvals in one
  // CEO order) collapses to ONE row with a count — the CEO reads one
  // decision, not a flood of copies. Consecutive identical records group.
  const grouped = useMemo(() => {
    const out: Array<{ row: DecisionRow; count: number; ids: number[] }> = [];
    for (const r of filtered) {
      const last = out[out.length - 1];
      if (
        last &&
        last.row.decidedBy === r.decidedBy &&
        last.row.decision === r.decision &&
        last.row.rationale === r.rationale &&
        last.row.risk === r.risk
      ) {
        last.count += 1;
        last.ids.push(r.id);
      } else {
        out.push({ row: r, count: 1, ids: [r.id] });
      }
    }
    return out;
  }, [filtered]);

  // C4/C18 list standard (CEO 2026-07-23): selecting a collapsed ×N group
  // selects every record in the group — removal always goes through the
  // audited control door.
  const allIds = useMemo(() => grouped.flatMap((g) => g.ids), [grouped]);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const toggleGroup = (ids: number[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) (on ? next.add(id) : next.delete(id));
      return next;
    });
  const purge = async () => {
    if (selected.size === 0 || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/control/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "decision", ids: [...selected] }),
      });
      if (res.ok) {
        setSelected(new Set());
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const selectCls =
    "rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.filterWho}</span>
          <select className={selectCls} value={who} onChange={(e) => setWho(e.target.value)}>
            <option value="all">{labels.all}</option>
            {whoOptions.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.filterRisk}</span>
          <select className={selectCls} value={risk} onChange={(e) => setRisk(e.target.value)}>
            <option value="all">{labels.all}</option>
            {Object.entries(labels.risks).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <span className="ml-auto pb-1 font-data text-body-s tabular-nums text-ink-muted">
          {grouped.length} {labels.shown}
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-panel border border-edge-neutral bg-surface-graphite px-3 py-2">
        <label className="flex items-center gap-2 text-body-s text-ink-secondary">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => toggleGroup(allIds, e.target.checked)}
          />
          {labels.selectAll}
        </label>
        <span className="font-data text-body-s tabular-nums text-ink-muted">{selected.size}</span>
        <button
          type="button"
          data-testid="decision-purge-selected"
          disabled={selected.size === 0 || busy}
          onClick={purge}
          className="ml-auto rounded-input border border-edge-neutral px-3 py-1 text-body-s text-status-danger transition duration-[var(--t-fast)] ease-refined enabled:hover:border-status-danger disabled:opacity-40"
        >
          {busy ? labels.purging : `${labels.purgeSelected} (${selected.size})`}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-body-s text-ink-muted">{labels.empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-body-s">
            <thead>
              <tr className="border-b border-edge-neutral">
                {/* Registered adaptation (CEO 2026-07-23, progressive
                    disclosure): the compact row carries time/who/what/risk/
                    outcome only; the 8 spec questions (§7) render in full
                    inside the click-to-expand record — never as a wall of
                    narrow wrapped columns, never clipped. */}
                <th className="h-10 w-8 px-2" />
                <th className="label-caps h-10 whitespace-nowrap px-2 text-left text-ink-muted w-[7.5rem]">{labels.colTime}</th>
                <th className="label-caps h-10 px-2 text-left text-ink-muted w-40">{labels.colWho}</th>
                <th className="label-caps h-10 px-2 text-left text-ink-muted">{labels.colDecision}</th>
                <th className="label-caps h-10 whitespace-nowrap px-2 text-left text-ink-muted w-24">{labels.colRisk}</th>
                <th className="label-caps h-10 whitespace-nowrap px-2 text-left text-ink-muted w-36">{labels.colOutcome}</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(({ row: r, count, ids }) => (
                <Row
                  key={r.id}
                  row={r}
                  count={count}
                  labels={labels}
                  locale={locale}
                  open={open === r.id}
                  onToggle={() => setOpen(open === r.id ? null : r.id)}
                  checked={ids.every((id) => selected.has(id))}
                  onCheck={(on) => toggleGroup(ids, on)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({
  row,
  count,
  labels,
  locale,
  open,
  onToggle,
  checked,
  onCheck,
}: {
  row: DecisionRow;
  count: number;
  labels: DecisionLabels;
  locale: string;
  open: boolean;
  onToggle: () => void;
  checked: boolean;
  onCheck: (on: boolean) => void;
}) {
  return (
    <>
      <tr
        className="cursor-pointer border-b border-edge-neutral transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
        onClick={onToggle}
        aria-expanded={open}
      >
        <td className="px-2 py-2 align-top">
          <input
            type="checkbox"
            checked={checked}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onCheck(e.target.checked)}
          />
        </td>
        <td className="whitespace-nowrap px-2 py-2 align-top font-data tabular-nums text-ink-secondary">
          {fmtTime(row.createdAt, locale)}
        </td>
        <td className="break-words px-2 py-2 align-top text-ink-primary">{row.employee ?? row.decidedBy}</td>
        <td className="break-words px-2 py-2 align-top text-ink-primary">
          {row.decision}
          {count > 1 && (
            <span className="ml-1.5 rounded-input border border-edge-neutral px-1 font-data text-caption text-ink-muted">
              ×{count}
            </span>
          )}
        </td>
        <td className="px-2 py-2 align-top">
          {row.risk ? (
            <StatusBadge level={RISK_LEVEL[row.risk] ?? "info"}>{labels.risks[row.risk] ?? row.risk}</StatusBadge>
          ) : (
            <span className="text-ink-muted">—</span>
          )}
        </td>
        <td className="break-words px-2 py-2 align-top text-ink-secondary">{row.outcome ?? "—"}</td>
      </tr>
      {open && (
        <tr className="border-b border-edge-neutral bg-surface-graphite/50">
          <td colSpan={6} className="px-3 py-4">
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
              <dt className="label-caps text-ink-muted">{labels.colRationale}</dt>
              <dd className="break-words text-body-s text-ink-secondary">{row.rationale}</dd>
              <dt className="label-caps text-ink-muted">{labels.colData}</dt>
              <dd className="break-words font-data text-body-s text-ink-secondary">
                {row.dataUsed?.length ? row.dataUsed.join(" · ") : labels.none}
              </dd>
              <dt className="label-caps text-ink-muted">{labels.colAlternatives}</dt>
              <dd className="break-words text-body-s text-ink-secondary">{altText(row.alternatives)}</dd>
              <dt className="label-caps text-ink-muted">{labels.colConfidence}</dt>
              <dd className="text-body-s text-ink-secondary">
                {row.confidence === null ? labels.none : `${Math.round(row.confidence * 100)}%`}
              </dd>
              <dt className="label-caps text-ink-muted">{labels.drillContext}</dt>
              <dd className="text-body-s text-ink-secondary">
                {row.taskObjective ?? labels.none}
                {row.taskId && (
                  <Link
                    href="/ops/tasks"
                    className="ml-3 text-accent-champagne hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {labels.taskLink} →
                  </Link>
                )}
              </dd>
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}
