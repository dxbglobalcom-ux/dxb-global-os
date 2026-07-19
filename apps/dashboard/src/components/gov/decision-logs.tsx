"use client";

import Link from "next/link";
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
  const [who, setWho] = useState("all");
  const [risk, setRisk] = useState("all");
  const [open, setOpen] = useState<number | null>(null);

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
          {filtered.length} {labels.shown}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-body-s text-ink-muted">{labels.empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] table-fixed border-collapse text-body-s">
            <thead>
              <tr className="border-b border-edge-neutral">
                {/* madde 10.2: the 8 questions verbatim as headers (§7 "8
                    sütun birebir") + time; wide table scrolls in its own
                    container. Row click expands the untruncated record. */}
                <th className="label-caps h-10 whitespace-nowrap px-2 text-left text-ink-muted w-[7.5rem]">{labels.colTime}</th>
                <th className="label-caps h-10 px-2 text-left text-ink-muted w-28">{labels.colWho}</th>
                <th className="label-caps h-10 px-2 text-left text-ink-muted w-40">{labels.colDecision}</th>
                <th className="label-caps h-10 min-w-32 px-2 text-left text-ink-muted">{labels.colRationale}</th>
                <th className="label-caps h-10 min-w-32 px-2 text-left text-ink-muted">{labels.colData}</th>
                <th className="label-caps h-10 min-w-32 px-2 text-left text-ink-muted">{labels.colAlternatives}</th>
                <th className="label-caps h-10 px-2 text-left text-ink-muted w-28">{labels.colConfidence}</th>
                <th className="label-caps h-10 whitespace-nowrap px-2 text-left text-ink-muted w-20">{labels.colRisk}</th>
                <th className="label-caps h-10 whitespace-nowrap px-2 text-left text-ink-muted w-24">{labels.colApproval}</th>
                <th className="label-caps h-10 whitespace-nowrap px-2 text-left text-ink-muted w-28">{labels.colOutcome}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <Row
                  key={r.id}
                  row={r}
                  labels={labels}
                  locale={locale}
                  open={open === r.id}
                  onToggle={() => setOpen(open === r.id ? null : r.id)}
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
  labels,
  locale,
  open,
  onToggle,
}: {
  row: DecisionRow;
  labels: DecisionLabels;
  locale: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="cursor-pointer border-b border-edge-neutral transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
        onClick={onToggle}
        aria-expanded={open}
      >
        <td className="h-10 whitespace-nowrap px-2 font-data tabular-nums text-ink-secondary">
          {fmtTime(row.createdAt, locale)}
        </td>
        <td className="h-10 truncate px-2 text-ink-primary">{row.employee ?? row.decidedBy}</td>
        <td className="h-10 truncate px-2 text-ink-primary">{row.decision}</td>
        <td className="h-10 truncate px-2 text-ink-secondary">{row.rationale}</td>
        <td className="h-10 truncate px-2 font-data text-ink-secondary">
          {row.dataUsed?.length ? row.dataUsed.join(" · ") : "—"}
        </td>
        <td className="h-10 truncate px-2 text-ink-secondary">{altText(row.alternatives)}</td>
        <td className="h-10 px-2 text-right font-data tabular-nums text-ink-secondary">
          {row.confidence === null ? "—" : `${Math.round(row.confidence * 100)}%`}
        </td>
        <td className="h-10 px-2">
          {row.risk ? (
            <StatusBadge level={RISK_LEVEL[row.risk] ?? "info"}>{labels.risks[row.risk] ?? row.risk}</StatusBadge>
          ) : (
            <span className="text-ink-muted">—</span>
          )}
        </td>
        <td className="h-10 px-2 font-data text-ink-secondary">
          {row.approvalId ? row.approvalId.slice(0, 8) : "—"}
        </td>
        <td className="h-10 truncate px-2 text-ink-secondary">{row.outcome ?? "—"}</td>
      </tr>
      {open && (
        <tr className="border-b border-edge-neutral bg-surface-graphite/50">
          <td colSpan={10} className="px-3 py-4">
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
              <dt className="label-caps text-ink-muted">{labels.colRationale}</dt>
              <dd className="text-body-s text-ink-secondary">{row.rationale}</dd>
              <dt className="label-caps text-ink-muted">{labels.colData}</dt>
              <dd className="font-data text-body-s text-ink-secondary">
                {row.dataUsed?.length ? row.dataUsed.join(" · ") : labels.none}
              </dd>
              <dt className="label-caps text-ink-muted">{labels.colAlternatives}</dt>
              <dd className="text-body-s text-ink-secondary">{altText(row.alternatives)}</dd>
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
