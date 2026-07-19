"use client";

// C4/C18 list-page standard (2026-07-19): the task grid with SELECTION and
// bulk removal. Only terminal rows (failed/returned/done) are selectable —
// live work cannot be deleted from a checkbox. The purge goes through the
// audited control door (/api/control/purge → control_records_purge).
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DataGrid, StatusBadge, type Column, type StatusLevel } from "@/components/primitives";

export type PurgeTaskRow = {
  id: string;
  objective: string;
  department: string;
  status: string;
  model_tier: string;
  priority: number;
  claimed_by: string | null;
  updated_at: string;
};

const TERMINAL = new Set(["failed", "returned", "done"]);

const BADGE: Record<string, StatusLevel> = {
  queued: "info",
  claimed: "info",
  running: "info",
  review: "info",
  awaiting_approval: "warn",
  done: "ok",
  failed: "danger",
  returned: "warn",
  inbox: "info",
};

export type TaskPurgeLabels = {
  colObjective: string;
  colDept: string;
  colStatus: string;
  colTier: string;
  colPriority: string;
  colClaimedBy: string;
  colUpdated: string;
  states: Record<string, string>;
  purgeSelected: string; // "Remove selected"
  purging: string;
  selectableHint: string; // explains why some rows have no checkbox
};

export function TaskPurgeGrid({
  rows,
  labels,
  locale,
}: {
  rows: PurgeTaskRow[];
  labels: TaskPurgeLabels;
  locale: "tr" | "en";
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const selectableIds = useMemo(
    () => rows.filter((r) => TERMINAL.has(r.status)).map((r) => r.id),
    [rows],
  );
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function purge() {
    if (selected.size === 0 || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/control/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "task", ids: [...selected] }),
      });
      if (res.ok) {
        setSelected(new Set());
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<PurgeTaskRow>[] = [
    {
      key: "_select",
      label: (
        <input
          type="checkbox"
          aria-label="select all"
          checked={allSelected}
          onChange={() =>
            setSelected(allSelected ? new Set() : new Set(selectableIds))
          }
          className="size-3.5 accent-[#c8a96a]"
        />
      ),
      render: (r) =>
        TERMINAL.has(r.status) ? (
          <input
            type="checkbox"
            aria-label={`select ${r.id}`}
            checked={selected.has(r.id)}
            onChange={() => toggle(r.id)}
            className="size-3.5 accent-[#c8a96a]"
          />
        ) : (
          <span aria-hidden className="inline-block size-3.5" />
        ),
    },
    {
      key: "objective",
      label: labels.colObjective,
      render: (r) => (
        <span className="block max-w-[40ch] truncate" title={r.objective}>
          {r.objective}
        </span>
      ),
    },
    { key: "department", label: labels.colDept, render: (r) => r.department },
    {
      key: "status",
      label: labels.colStatus,
      render: (r) => (
        <StatusBadge level={BADGE[r.status] ?? "info"}>
          {labels.states[r.status] ?? r.status}
        </StatusBadge>
      ),
    },
    { key: "model_tier", label: labels.colTier, numeric: true, render: (r) => r.model_tier },
    {
      key: "priority",
      label: labels.colPriority,
      align: "right",
      numeric: true,
      render: (r) => String(r.priority),
    },
    { key: "claimed_by", label: labels.colClaimedBy, render: (r) => r.claimed_by ?? "—" },
    {
      key: "updated_at",
      label: labels.colUpdated,
      align: "right",
      numeric: true,
      render: (r) =>
        new Date(r.updated_at).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  return (
    <div>
      <div className="mb-2 flex min-h-8 items-center gap-3">
        {selected.size > 0 ? (
          <button
            type="button"
            onClick={() => void purge()}
            disabled={busy}
            data-testid="task-purge-selected"
            className="rounded-input border border-status-danger/60 px-3 py-1 text-body-s text-status-danger transition duration-[var(--t-fast)] ease-refined enabled:hover:bg-status-danger/10 disabled:opacity-40"
          >
            {busy ? labels.purging : `${labels.purgeSelected} (${selected.size})`}
          </button>
        ) : (
          <p className="text-caption text-ink-muted">{labels.selectableHint}</p>
        )}
      </div>
      <div className="overflow-x-auto">
        <DataGrid columns={columns} rows={rows} rowKey={(r) => r.id} />
      </div>
    </div>
  );
}
