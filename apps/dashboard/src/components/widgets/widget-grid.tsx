"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  reflow,
  WIDGET_META,
  WIDGET_TYPES,
  type Layout,
  type WidgetInstance,
  type WidgetType,
} from "./types";

// E12.2 — WidgetGrid client island (CC-SPEC §5/§10, R8). Widget CONTENT is
// rendered on the server (registry.tsx) and arrives here as nodes keyed by
// type; this island only ARRANGES: view mode places widgets on a 4-column
// grid, edit mode adds/removes/moves/resizes and SAVES through the control
// seam (/api/control/layout → control_settings_set → audit + undo). Nothing
// touches localStorage — a fresh session pulls the same layout (row gate).
//
// v1 interactions are deterministic buttons (add / remove / ◀ ▶ order swap /
// width toggle) — Playwright-provable. Pointer drag-drop polish is a
// RECORDED boundary (U16 design slot), not a silent omission.

export interface WidgetGridStrings {
  edit: string;
  save: string;
  cancel: string;
  add: string;
  remove: string;
  moveLeft: string;
  moveRight: string;
  width: string;
  saveFailed: string;
  empty: string;
  labels: Record<WidgetType, string>;
}

const SPAN: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-1 md:col-span-2",
  4: "col-span-1 md:col-span-2 xl:col-span-4",
};

const ROWSPAN: Record<number, string> = {
  1: "",
  2: "row-span-2",
};

export function WidgetGrid({
  initial,
  content,
  strings,
}: {
  initial: Layout;
  content: Record<WidgetType, ReactNode>;
  strings: WidgetGridStrings;
}) {
  const router = useRouter();
  const dashIndex = Math.max(
    0,
    initial.dashboards.findIndex((d) => d.default),
  );
  const saved = initial.dashboards[dashIndex].widgets;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<WidgetInstance[]>(saved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const widgets = editing ? draft : saved;
  const usedTypes = useMemo(() => new Set(widgets.map((w) => w.type)), [widgets]);
  const addable = WIDGET_TYPES.filter((t) => !usedTypes.has(t));

  function move(i: number, dir: -1 | 1) {
    setDraft((d) => {
      const next = [...d];
      const j = i + dir;
      if (j < 0 || j >= next.length) return d;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function cycleWidth(i: number) {
    setDraft((d) => {
      const next = [...d];
      const order: (1 | 2 | 4)[] = [1, 2, 4];
      const w = next[i].w;
      next[i] = { ...next[i], w: order[(order.indexOf(w) + 1) % order.length] };
      return next;
    });
  }

  async function persist() {
    setBusy(true);
    setError(null);
    const body: Layout = {
      dashboards: initial.dashboards.map((d, idx) =>
        idx === dashIndex ? { ...d, widgets: reflow(draft) } : d,
      ),
    };
    try {
      const res = await fetch("/api/control/layout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({ action: "save", layout: body }),
      });
      const out = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !out.ok) throw new Error(out.error ?? `HTTP ${res.status}`);
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(`${strings.saveFailed}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-widget-grid>
      <div className="mb-3 flex items-center justify-end gap-2">
        {error && (
          <span role="alert" className="text-body-s text-status-danger">
            {error}
          </span>
        )}
        {editing ? (
          <>
            {addable.length > 0 && (
              <select
                aria-label={strings.add}
                className="rounded-input border border-edge-neutral bg-surface-carbon px-2 py-1 text-body-s text-ink-primary"
                value=""
                onChange={(e) => {
                  const type = e.target.value as WidgetType;
                  if (!type) return;
                  setDraft((d) => [
                    ...d,
                    {
                      type,
                      x: 0,
                      y: 0,
                      w: WIDGET_META[type].w,
                      h: WIDGET_META[type].h,
                      filters: {},
                    },
                  ]);
                }}
              >
                <option value="">{strings.add}</option>
                {addable.map((t) => (
                  <option key={t} value={t}>
                    {strings.labels[t]}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={persist}
              className="rounded-input border border-edge-champagne bg-surface-graphite px-3 py-1 text-body-s text-accent-ivory transition duration-[var(--t-fast)] ease-refined hover:bg-surface-anthracite disabled:opacity-50"
            >
              {strings.save}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setDraft(saved);
                setEditing(false);
                setError(null);
              }}
              className="rounded-input border border-edge-neutral px-3 py-1 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite disabled:opacity-50"
            >
              {strings.cancel}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(saved);
              setEditing(true);
            }}
            className="rounded-input border border-edge-neutral px-3 py-1 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne hover:bg-surface-graphite"
          >
            {strings.edit}
          </button>
        )}
      </div>

      {widgets.length === 0 ? (
        <p className="rounded-panel border border-edge-neutral bg-surface-carbon p-6 text-body-s text-ink-muted">
          {strings.empty}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {widgets.map((w, i) => (
            <div
              key={`${w.type}`}
              data-widget={w.type}
              className={`relative min-w-0 ${SPAN[w.w]} ${ROWSPAN[w.h]}`}
            >
              {editing && (
                <div className="absolute -top-2 right-2 z-10 flex items-center gap-1 rounded-input border border-edge-champagne bg-surface-anthracite px-1.5 py-0.5 shadow-e2">
                  <button
                    type="button"
                    aria-label={`${strings.moveLeft} — ${strings.labels[w.type]}`}
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="px-1 text-body-s text-ink-secondary hover:text-accent-ivory disabled:opacity-30"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    aria-label={`${strings.moveRight} — ${strings.labels[w.type]}`}
                    onClick={() => move(i, 1)}
                    disabled={i === widgets.length - 1}
                    className="px-1 text-body-s text-ink-secondary hover:text-accent-ivory disabled:opacity-30"
                  >
                    ▶
                  </button>
                  <button
                    type="button"
                    aria-label={`${strings.width} — ${strings.labels[w.type]}`}
                    onClick={() => cycleWidth(i)}
                    className="px-1 font-data text-body-s text-ink-secondary tabular-nums hover:text-accent-ivory"
                  >
                    {w.w}×
                  </button>
                  <button
                    type="button"
                    aria-label={`${strings.remove} — ${strings.labels[w.type]}`}
                    onClick={() => setDraft((d) => d.filter((_, j) => j !== i))}
                    className="px-1 text-body-s text-status-danger hover:text-status-critical"
                  >
                    ✕
                  </button>
                </div>
              )}
              {content[w.type]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
