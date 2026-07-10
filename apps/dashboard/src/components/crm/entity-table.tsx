// EntityTable (DASH-04, DENSITY 5): table-first on desktop, stacked
// row-cards under 768px (UI-SPEC responsive rule). RSC — selection, sort
// and filter travel as searchParams links. Identity never rides on color:
// every status chip is dot + LABEL TEXT; ids/amounts/dates render mono.
import Link from "next/link";
import { formatEur, timeHM } from "@/lib/format";
import type { CrmColumn, CrmEntity, CrmRow } from "@/lib/crm";

const STATUS_TONE: Record<string, string> = {
  lead: "bg-info",
  active: "bg-ok",
  paused: "bg-warn",
  closed: "bg-line",
  new: "bg-info",
  triaged: "bg-info",
  in_progress: "bg-info",
  delivered: "bg-ok",
  rejected: "bg-danger",
  open: "bg-info",
  proposal: "bg-warn",
  won: "bg-ok",
  lost: "bg-danger",
};

const dateStamp = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });

export function CrmStatusChip({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-micro text-ink-2">
      <span aria-hidden className={`size-1.5 rounded-full ${STATUS_TONE[value] ?? "bg-line"}`} />
      {label}
    </span>
  );
}

function CellValue({
  column,
  row,
  statusLabels,
}: {
  column: CrmColumn;
  row: CrmRow;
  statusLabels: Record<string, string>;
}) {
  const raw = row[column.key];
  if (raw === null || raw === undefined || raw === "") {
    return <span className="text-micro text-ink-2">—</span>;
  }
  switch (column.kind) {
    case "status": {
      const value = String(raw);
      return <CrmStatusChip value={value} label={statusLabels[value] ?? value} />;
    }
    case "eur":
      return (
        <span className="font-mono text-body text-ink" data-numeric>
          {formatEur(Number(raw))}
        </span>
      );
    case "date": {
      const at = new Date(String(raw));
      return (
        <span className="font-mono text-micro text-ink-2" data-numeric>
          {dateStamp.format(at)} {timeHM(at)}
        </span>
      );
    }
    case "mono":
      return <span className="font-mono text-micro text-ink-2">{String(raw)}</span>;
    default:
      return <span className="text-body text-ink">{String(raw)}</span>;
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
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-body text-ink-2">{emptyLabel}</p>;
  }

  const provenanceChip = (row: CrmRow) => {
    const writer = provenance[row.id] ?? "agent";
    return (
      <span
        className={`inline-flex rounded-full border border-line px-2 py-0.5 text-micro ${
          writer === "ceo" ? "text-accent" : "text-ink-2"
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
          <tr className="border-b border-line text-left">
            {columns.map((column) => (
              <th key={column.key} className="py-2 pr-4 text-micro font-medium text-ink-2">
                {columnLabels[column.key] ?? column.key}
              </th>
            ))}
            <th className="py-2 text-micro font-medium text-ink-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr
              key={row.id}
              className={row.id === selectedId ? "bg-surface-3/50" : "hover:bg-surface-2/60"}
            >
              {columns.map((column) => (
                <td key={column.key} className="max-w-64 truncate py-2.5 pr-4">
                  <Link href={makeHref(row.id)} className="block truncate">
                    <CellValue column={column} row={row} statusLabels={statusLabels} />
                  </Link>
                </td>
              ))}
              <td className="py-2.5 text-right">{provenanceChip(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Stacked row-cards — phone */}
      <ul className="divide-y divide-line md:hidden">
        {rows.map((row) => (
          <li key={row.id}>
            <Link href={makeHref(row.id)} className="flex flex-col gap-1 py-3">
              <div className="flex items-center justify-between gap-2">
                <CellValue column={columns[0]} row={row} statusLabels={statusLabels} />
                {provenanceChip(row)}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
                {columns.slice(1).map((column) => (
                  <CellValue key={column.key} column={column} row={row} statusLabels={statusLabels} />
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
