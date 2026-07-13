"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge, type StatusLevel } from "@/components/primitives";

// Unified audit stream (E8.4 — AUDIT_AND_LOGGING_SPEC §7): time-flow on
// audit_log via v_audit_trail, filters actor/entity/date/risk, row →
// detail_ref family record drill (the roadmap acceptance: audit row → aile
// kaydına iniş). This is the query+evidence surface — liveness lives on
// /live (spec işbölümü); no Broadcast subscription here on purpose.

export type AuditRow = {
  id: number;
  actor: string;
  actorType: string;
  action: string;
  taskId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
  refTable: string | null;
  refId: string | null;
  refSummary: Record<string, unknown> | null;
  refRisk: string | null;
};

export type AuditLabels = {
  filterActor: string;
  filterEntity: string;
  filterRisk: string;
  filterFrom: string;
  filterTo: string;
  all: string;
  noRef: string;
  colTime: string;
  colActor: string;
  colAction: string;
  colEntity: string;
  colRisk: string;
  drillPayload: string;
  drillRefRecord: string;
  drillNoRef: string;
  fullRecord: string;
  taskLink: string;
  empty: string;
  shown: string;
  actorTypes: Record<string, string>;
  entities: Record<string, string>;
  risks: Record<string, string>;
};

const RISK_LEVEL: Record<string, StatusLevel> = {
  low: "ok",
  medium: "warn",
  high: "danger",
};

const ACTOR_LEVEL: Record<string, StatusLevel> = {
  ceo: "info",
  agent: "ok",
  system: "warn",
};

function fmtTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function KeyValueGrid({ obj }: { obj: Record<string, unknown> }) {
  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
      {Object.entries(obj).map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="label-caps text-ink-muted">{k}</dt>
          <dd className="break-all font-data text-body-s text-ink-secondary">
            {v === null || v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function AuditTrail({
  rows,
  labels,
  locale,
}: {
  rows: AuditRow[];
  labels: AuditLabels;
  locale: string;
}) {
  const [actorType, setActorType] = useState("all");
  const [entity, setEntity] = useState("all");
  const [risk, setRisk] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const entityOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.refTable).filter(Boolean))) as string[],
    [rows],
  );

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (actorType !== "all" && r.actorType !== actorType) return false;
        if (entity !== "all" && r.refTable !== (entity === "none" ? null : entity)) return false;
        if (risk !== "all" && r.refRisk !== risk) return false;
        if (from && r.createdAt < `${from}T00:00:00`) return false;
        if (to && r.createdAt > `${to}T23:59:59`) return false;
        return true;
      }),
    [rows, actorType, entity, risk, from, to],
  );

  const selectCls =
    "rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.filterActor}</span>
          <select className={selectCls} value={actorType} onChange={(e) => setActorType(e.target.value)}>
            <option value="all">{labels.all}</option>
            {Object.entries(labels.actorTypes).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.filterEntity}</span>
          <select className={selectCls} value={entity} onChange={(e) => setEntity(e.target.value)}>
            <option value="all">{labels.all}</option>
            {entityOptions.map((t) => (
              <option key={t} value={t}>
                {labels.entities[t] ?? t}
              </option>
            ))}
            <option value="none">{labels.noRef}</option>
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
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.filterFrom}</span>
          <input type="date" className={selectCls} value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.filterTo}</span>
          <input type="date" className={selectCls} value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <span className="ml-auto pb-1 font-data text-body-s tabular-nums text-ink-muted">
          {filtered.length} {labels.shown}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-body-s text-ink-muted">{labels.empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-body-s">
            <thead>
              <tr className="border-b border-edge-neutral">
                <th className="label-caps h-10 whitespace-nowrap px-2 text-left text-ink-muted">{labels.colTime}</th>
                <th className="label-caps h-10 whitespace-nowrap px-2 text-left text-ink-muted">{labels.colActor}</th>
                <th className="label-caps h-10 whitespace-nowrap px-2 text-left text-ink-muted">{labels.colAction}</th>
                <th className="label-caps h-10 whitespace-nowrap px-2 text-left text-ink-muted">{labels.colEntity}</th>
                <th className="label-caps h-10 whitespace-nowrap px-2 text-left text-ink-muted">{labels.colRisk}</th>
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
  row: AuditRow;
  labels: AuditLabels;
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
        <td className="h-10 px-2">
          <span className="inline-flex items-center gap-2">
            <StatusBadge level={ACTOR_LEVEL[row.actorType] ?? "info"}>{labels.actorTypes[row.actorType] ?? row.actorType}</StatusBadge>
            {row.actor.toLowerCase() !== row.actorType && (
              <span className="max-w-48 truncate text-ink-primary">{row.actor}</span>
            )}
          </span>
        </td>
        <td className="h-10 px-2 font-data text-ink-primary"><div className="max-w-44 truncate">{row.action}</div></td>
        <td className="h-10 whitespace-nowrap px-2 text-ink-secondary">
          {row.refTable ? (labels.entities[row.refTable] ?? row.refTable) : "—"}
        </td>
        <td className="h-10 whitespace-nowrap px-2">
          {row.refRisk ? (
            <StatusBadge level={RISK_LEVEL[row.refRisk] ?? "info"}>{labels.risks[row.refRisk] ?? row.refRisk}</StatusBadge>
          ) : (
            <span className="text-ink-muted">—</span>
          )}
        </td>
      </tr>
      {open && (
        <tr className="border-b border-edge-neutral bg-surface-graphite/50">
          <td colSpan={5} className="px-3 py-4">
            <div className="grid gap-6 md:grid-cols-2">
              <section>
                <h3 className="label-caps mb-2 text-ink-muted">{labels.drillPayload}</h3>
                <KeyValueGrid obj={row.payload} />
              </section>
              <section>
                <h3 className="label-caps mb-2 text-ink-muted">
                  {labels.drillRefRecord}
                  {row.refTable ? ` — ${labels.entities[row.refTable] ?? row.refTable} #${row.refId}` : ""}
                </h3>
                {row.refSummary ? (
                  <KeyValueGrid obj={row.refSummary} />
                ) : (
                  <p className="text-body-s text-ink-muted">{labels.drillNoRef}</p>
                )}
              </section>
            </div>
            <div className="mt-4 flex gap-4">
              <Link
                href={`/gov/audit/${row.id}`}
                className="text-body-s text-accent-champagne hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {labels.fullRecord} →
              </Link>
              {row.taskId && (
                <Link
                  href={`/tasks/${row.taskId}`}
                  className="text-body-s text-accent-champagne hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {labels.taskLink} →
                </Link>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
