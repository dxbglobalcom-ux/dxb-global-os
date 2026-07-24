"use client";

import { useState, type ReactNode } from "react";

// Collapsible shell for the Intelligence rail (CEO ask 2026-07-25: the panel
// must not be forced onto every screen). Same idiom as the side-nav collapse:
// session state, no persistence — a fresh session starts open.
export function RailShell({
  children,
  title,
  collapseLabel,
  expandLabel,
}: {
  children: ReactNode;
  title: string;
  collapseLabel: string;
  expandLabel: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="hidden w-10 shrink-0 flex-col items-center border-l border-edge-neutral bg-surface-obsidian p-2 xl:flex">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label={title}
          title={title}
          className="rounded-input border border-edge-neutral px-1.5 py-1 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne hover:text-accent-champagne"
        >
          {expandLabel}
        </button>
      </aside>
    );
  }

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-edge-neutral bg-surface-obsidian p-4 xl:flex">
      <div className="flex items-center justify-between gap-2">
        <div className="label-caps text-ink-muted">{title}</div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="whitespace-nowrap text-caption text-ink-muted transition duration-[var(--t-fast)] ease-refined hover:text-accent-champagne"
        >
          {collapseLabel}
        </button>
      </div>
      {children}
    </aside>
  );
}
