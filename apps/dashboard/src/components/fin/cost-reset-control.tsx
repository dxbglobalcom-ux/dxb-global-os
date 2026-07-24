"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// 9c — the cost data reset control (C9: "How is it deleted/reset?").
// Progressive disclosure (registered CEO preference): a single quiet button
// expands into the two-step door — pick a cutoff day, PREVIEW the row count,
// then confirm. The delete itself runs through the audited DB fn
// (control_cost_reset); nothing here is destructive without the second click.

export type CostResetLabels = {
  open: string;
  intro: string;
  dateLabel: string;
  preview: string;
  previewCount: string;
  previewZero: string;
  confirm: string;
  working: string;
  done: string;
  cancel: string;
};

export function CostResetControl({
  labels,
  maxDay,
}: {
  labels: CostResetLabels;
  maxDay: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [before, setBefore] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [purged, setPurged] = useState<number | null>(null);

  const post = async (preview: boolean) => {
    const res = await fetch("/api/control/cost-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ before, preview: preview || undefined }),
    });
    if (!res.ok) throw new Error(String(res.status));
    return res.json();
  };

  const runPreview = async () => {
    if (!before || busy) return;
    setBusy(true);
    try {
      const data = await post(true);
      setCount(Number(data.count ?? 0));
      setPurged(null);
    } finally {
      setBusy(false);
    }
  };

  const runReset = async () => {
    if (!before || count === null || count === 0 || busy) return;
    setBusy(true);
    try {
      const data = await post(false);
      setPurged(Number(data.purged ?? 0));
      setCount(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setExpanded(false);
    setBefore("");
    setCount(null);
    setPurged(null);
  };

  if (!expanded) {
    return (
      <button
        type="button"
        data-testid="cost-reset-open"
        onClick={() => setExpanded(true)}
        className="rounded-input border border-edge-neutral px-2.5 py-1 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne hover:text-ink-primary"
      >
        {labels.open}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-panel border border-edge-neutral bg-surface-graphite px-3 py-2">
      <p className="text-body-s text-ink-secondary">{labels.intro}</p>
      <label className="flex items-center gap-2 text-body-s text-ink-muted">
        {labels.dateLabel}
        <input
          type="date"
          value={before}
          max={maxDay}
          onChange={(e) => {
            setBefore(e.target.value);
            setCount(null);
            setPurged(null);
          }}
          className="rounded-input border border-edge-neutral bg-surface-anthracite px-2.5 py-1 font-data text-body-s text-ink-primary outline-none [color-scheme:dark] focus:border-edge-champagne"
        />
      </label>
      <button
        type="button"
        data-testid="cost-reset-preview"
        disabled={!before || busy}
        onClick={runPreview}
        className="rounded-input border border-edge-neutral px-2.5 py-1 text-body-s text-ink-primary transition duration-[var(--t-fast)] ease-refined enabled:hover:border-edge-champagne disabled:opacity-40"
      >
        {busy && count === null && purged === null ? labels.working : labels.preview}
      </button>
      {count !== null && (
        <span className="font-data text-body-s text-ink-primary tabular-nums">
          {count === 0 ? labels.previewZero : `${count} ${labels.previewCount}`}
        </span>
      )}
      {count !== null && count > 0 && (
        <button
          type="button"
          data-testid="cost-reset-confirm"
          disabled={busy}
          onClick={runReset}
          className="rounded-input border border-edge-neutral px-2.5 py-1 text-body-s text-status-danger transition duration-[var(--t-fast)] ease-refined enabled:hover:border-status-danger disabled:opacity-40"
        >
          {busy ? labels.working : `${labels.confirm} (${count})`}
        </button>
      )}
      {purged !== null && (
        <span className="text-body-s text-status-ok">
          {labels.done}: {purged}
        </span>
      )}
      <button
        type="button"
        onClick={close}
        className="ml-auto rounded-input px-2 py-1 text-body-s text-ink-muted transition duration-[var(--t-fast)] ease-refined hover:text-ink-primary"
      >
        {labels.cancel} ✕
      </button>
    </div>
  );
}
