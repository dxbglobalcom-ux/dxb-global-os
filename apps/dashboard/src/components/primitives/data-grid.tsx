import type { ReactNode } from "react";

// DataGrid v1 — Advanced Data Table base rules (DESIGN_SYSTEM §10):
// 40px rows, NO zebra (1px separators carry the rhythm), label-caps
// headers, numeric columns right-aligned in tabular nums. Sorting,
// filtering, virtual scroll and row→drawer arrive with the table
// system step; this primitive fixes the visual contract.

export type Column<T> = {
  key: string;
  label: string;
  align?: "left" | "right";
  numeric?: boolean;
  render: (row: T) => ReactNode;
};

export function DataGrid<T>({
  columns,
  rows,
  rowKey,
  className = "",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  className?: string;
}) {
  return (
    <table className={`w-full border-collapse text-body-s ${className}`}>
      <thead>
        <tr className="border-b border-edge-neutral">
          {columns.map((c) => (
            <th
              key={c.key}
              className={`label-caps h-10 px-3 text-ink-muted ${
                c.align === "right" ? "text-right" : "text-left"
              }`}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={rowKey(row)}
            className="border-b border-edge-neutral transition duration-[var(--t-fast)] ease-refined last:border-b-0 hover:bg-surface-graphite"
          >
            {columns.map((c) => (
              <td
                key={c.key}
                className={`h-10 px-3 text-ink-primary ${
                  c.align === "right" ? "text-right" : "text-left"
                } ${c.numeric ? "font-data tabular-nums" : ""}`}
              >
                {c.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
