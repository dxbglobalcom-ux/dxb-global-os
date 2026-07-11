"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { COMMAND_NAV, type NavCounter } from "@/config/command-nav";

// SideNav — left layer of the CommandShell (CC-SPEC §3, §10): 7 groups,
// collapsible to icon rail. C-Hibrit dili (R-kapısı reçete C):
// ikon+etiket+canlı sayaç tek satırda; seçili durum champagne sol bar +
// gold metin (DESIGN_SYSTEM §10 matrisi); glow yalnız canlı sayaçta ve
// seçimde (B3: ışık hiyerarşi aracıdır). Collapse session state; kalıcı
// tercih settings seam ile gelir (E6).

export type NavCounters = Partial<Record<NavCounter, number>>;

type Labels = {
  collapse: string;
  expand: string;
  groups: Record<string, string>;
  pages: Record<string, string>;
};

export function SideNav({
  labels,
  counters = {},
}: {
  labels: Labels;
  counters?: NavCounters;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav
      className={`relative flex h-full flex-col border-r border-edge-neutral bg-surface-obsidian transition-[width] duration-[var(--t-base)] ease-refined ${
        collapsed ? "w-14" : "w-60"
      }`}
      aria-label="Command navigation"
    >
      {/* Sağ kenar ışığı — panel katman farkı (B2), süs değil sınır. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[rgba(216,185,140,0.14)] to-transparent"
      />
      <div className="nav-scroll flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {COMMAND_NAV.map((group) => (
          <div key={group.key}>
            {!collapsed && (
              <div className="label-caps mb-1.5 px-2 text-ink-muted">
                {labels.groups[group.key]}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href + "/"));
                const label = labels.pages[item.key];
                const count = item.counter
                  ? (counters[item.counter] ?? 0)
                  : 0;
                const Icon = item.icon;
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      title={collapsed ? label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={`group/nav relative flex h-8 items-center gap-2.5 rounded-input px-2 text-body-s transition duration-[var(--t-fast)] ease-refined ${
                        collapsed ? "justify-center" : ""
                      } ${
                        active
                          ? "bg-surface-graphite text-accent-champagne"
                          : "text-ink-secondary hover:bg-surface-carbon hover:text-ink-primary"
                      }`}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="absolute inset-y-1 left-0 w-0.5 rounded-input bg-accent-champagne shadow-[0_0_8px_rgba(216,185,140,0.5)]"
                        />
                      )}
                      <Icon
                        size={16}
                        strokeWidth={1.5}
                        aria-hidden
                        className={`shrink-0 transition-colors duration-[var(--t-fast)] ${
                          active
                            ? "text-accent-champagne"
                            : "text-ink-muted group-hover/nav:text-ink-secondary"
                        }`}
                      />
                      {!collapsed && (
                        <>
                          <span className="min-w-0 flex-1 truncate">
                            {label}
                          </span>
                          {count > 0 && (
                            <span
                              className={`font-data text-caption tabular-nums ${
                                item.counter === "pending_high_risk"
                                  ? "text-status-warn"
                                  : "text-accent-brushed"
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </>
                      )}
                      {collapsed && count > 0 && (
                        <span
                          aria-hidden
                          className={`absolute right-1.5 top-1.5 size-1.5 rounded-full ${
                            item.counter === "pending_high_risk"
                              ? "bg-status-warn"
                              : "bg-accent-champagne"
                          }`}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? labels.expand : labels.collapse}
        className="flex h-10 items-center justify-center border-t border-edge-neutral text-caption text-ink-muted transition duration-[var(--t-fast)] ease-refined hover:text-ink-primary"
      >
        {collapsed ? "»" : `« ${labels.collapse}`}
      </button>
    </nav>
  );
}
