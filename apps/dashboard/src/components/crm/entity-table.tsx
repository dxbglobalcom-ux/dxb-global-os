// EntityTable (E12.4 command-shell port of the DASH-04 original): table on
// desktop, stacked row-cards under 768px. RSC — selection, sort and filter
// travel as searchParams links. Identity never rides on color: every status
// chip is dot + LABEL TEXT; ids/amounts/dates render in the data face.
// Tokens = DESIGN_SYSTEM command set (the cockpit token family died with
// the cockpit routes — single design system per surface).
import Link from "next/link";
import { formatEur, timeHM } from "@/lib/format";
import type { CrmColumn, CrmEntity, CrmRow } from "@/lib/crm";

const STATUS_TONE: Record<string, string> = {
  lead: "bg-status-info",
  active: "bg-status-ok",
  paused: "bg-status-warn",
  closed: "bg-edge-neutral",
  new: "bg-status-info",
  triaged: "bg-status-info",
  in_progress: "bg-status-info",
  delivered: "bg-status-ok",
  rejected: "bg-status-danger",
  open: "bg-status-info",
  proposal: "bg-status-warn",
  won: "bg-status-ok",
  lost: "bg-status-danger",
};

// Locale-pinned per render (TR UI must never show EN month names — the
// R4.2 purity class); the formatter is built where the locale is known.
const dateStamp = (locale: string) =>
  new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "2-digit",
    month: "short",
  });

export function CrmStatusChip({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-caption text-ink-secondary">
      <span aria-hidden className={`size-1.5 rounded-full ${STATUS_TONE[value] ?? "bg-edge-neutral"}`} />
      {label}
    </span>
  );
}

function CellValue({
  column,
  row,
  statusLabels,
  locale,
}: {
  column: CrmColumn;
  row: CrmRow;
  statusLabels: Record<string, string>;
  locale: string;
}) {
  const raw = row[column.key];
  if (raw === null || raw === undefined || raw === "") {
    return <span className="text-caption text-ink-muted">—</span>;
  }
  switch (column.kind) {
    case "status": {
      const value = String(raw);
      return <CrmStatusChip value={value} label={statusLabels[value] ?? value} />;
    }
    case "eur":
      return (
        <span className="font-data text-body-s text-ink-primary tabular-nums" data-numeric>
          {formatEur(Number(raw))}
        </span>
      );
    case "date": {
      const at = new Date(String(raw));
      return (
        <span className="font-data text-caption text-ink-secondary tabular-nums" data-numeric>
          {dateStamp(locale).format(at)} {timeHM(at)}
        </span>
      );
    }
    case "mono":
      return <span className="font-data text-caption text-ink-secondary">{String(raw)}</span>;
    default:
      return <span className="text-body-s text-ink-primary">{String(raw)}</span>;
  }
}

export function EntityTable({
  entity,
  columns,
  rows,
  columnLabels,
  statusLabels,
  provenance,
  provenanceLabels,
  selectedId,
  makeHref,
  emptyLabel,
  locale,
}: {
  entity: CrmEntity;
  columns: CrmColumn[];
  rows: CrmRow[];
  columnLabels: Record<string, string>;
  statusLabels: Record<string, string>;
  /** row id → 'ceo' | 'agent' (derived from audit_log last writer) */
  provenance: Record<string, "ceo" | "agent">;
  provenanceLabels: { ceo: string; agent: string };
  selectedId: string | null;
  makeHref: (rowId: string) => string;
  emptyLabel: string;
  locale: string;
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-body-s text-ink-muted">{emptyLabel}</p>;
  }

  const provenanceChip = (row: CrmRow) => {
    const writer = provenance[row.id] ?? "agent";
    return (
      <span
        className={`inline-flex rounded-input border border-edge-neutral px-2 py-0.5 text-caption ${
          writer === "ceo" ? "text-accent-champagne" : "text-ink-secondary"
        }`}
      >
        {provenanceLabels[writer]}
      </span>
    );
  };

  return (
    <div data-entity={entity}>
      {/* Desktop table */}
      <table className="hidden w-full md:table">
        <thead>
          <tr className="border-b border-edge-neutral text-left">
            {columns.map((column) => (
              <th key={column.key} className="label-caps py-2 pr-4 text-ink-muted">
                {columnLabels[column.key] ?? column.key}
              </th>
            ))}
            <th className="py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-edge-neutral">
          {rows.map((row) => (
            <tr
              key={row.id}
              className={
                row.id === selectedId
                  ? "bg-surface-anthracite/60"
                  : "transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite/60"
              }
            >
              {columns.map((column) => (
                <td key={column.key} className="min-w-0 max-w-64 py-2.5 pr-4">
                  <Link href={makeHref(row.id)} className="block min-w-0 break-words">
                    <CellValue column={column} row={row} statusLabels={statusLabels} locale={locale} />
                  </Link>
                </td>
              ))}
              <td className="py-2.5 text-right">{provenanceChip(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Stacked row-cards — narrow widths */}
      <ul className="divide-y divide-edge-neutral md:hidden">
        {rows.map((row) => (
          <li key={row.id}>
            <Link href={makeHref(row.id)} className="flex flex-col gap-1 py-3">
              <div className="flex items-center justify-between gap-2">
                <CellValue column={columns[0]} row={row} statusLabels={statusLabels} locale={locale} />
                {provenanceChip(row)}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
                {columns.slice(1).map((column) => (
                  <CellValue key={column.key} column={column} row={row} statusLabels={statusLabels} locale={locale} />
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
