"use client";

import { useRouter } from "next/navigation";
import type { ActiveCompany } from "@/lib/company";

// E12.4 — company switcher (GAP-05 "company switch/context"). Writes the
// dxb-company cookie (UI preference, locale-switch idiom) and refreshes:
// every server component re-reads the context — the isolation lives in the
// SERVER queries, never in client filtering.
export function CompanySwitch({
  active,
  all,
  label,
}: {
  active: string; // slug
  all: ActiveCompany[];
  label: string;
}) {
  const router = useRouter();
  if (all.length <= 1) {
    // Single-company holding: an info-free selector may not render
    // (CEO minimalism ruling) — the honest state is the company name.
    return (
      <span className="font-data text-caption text-ink-muted">
        {all[0]?.name ?? ""}
      </span>
    );
  }
  return (
    <select
      aria-label={label}
      value={active}
      onChange={(e) => {
        document.cookie = `dxb-company=${e.target.value}; path=/; max-age=31536000`;
        router.refresh();
      }}
      className="rounded-input border border-edge-neutral bg-surface-carbon px-2 py-1 text-body-s text-ink-primary transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne"
    >
      {all.map((c) => (
        <option key={c.slug} value={c.slug}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
