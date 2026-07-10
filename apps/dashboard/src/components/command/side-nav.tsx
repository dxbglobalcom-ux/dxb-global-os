"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { COMMAND_NAV } from "@/config/command-nav";

// SideNav — left layer of the CommandShell (CC-SPEC §3, §10): 7 groups,
// collapsible to icon mode. Selected item follows the DESIGN_SYSTEM §10
// matrix: champagne left bar + gold text. Collapse is session state;
// persisted layout preferences arrive with the settings seam (E6).

type Labels = {
  collapse: string;
  expand: string;
  groups: Record<string, string>;
  pages: Record<string, string>;
};

export function SideNav({ labels }: { labels: Labels }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav
      className={`flex h-full flex-col border-r border-edge-neutral bg-surface-obsidian transition-[width] duration-[var(--t-base)] ease-refined ${
        collapsed ? "w-14" : "w-60"
      }`}
      aria-label="Command navigation"
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
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
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      title={collapsed ? label : undefined}
                      className={`flex h-8 items-center gap-2 rounded-input px-2 text-body-s transition duration-[var(--t-fast)] ease-refined ${
                        active
                          ? "border-l-2 border-l-accent-champagne bg-surface-graphite text-accent-champagne"
                          : "text-ink-secondary hover:bg-surface-carbon hover:text-ink-primary"
                      }`}
                    >
                      <span
                        className={`size-1.5 shrink-0 rounded-full ${
                          active ? "bg-accent-champagne" : "bg-surface-titanium"
                        }`}
                      />
                      {!collapsed && <span className="truncate">{label}</span>}
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
        className="flex h-10 items-center justify-center border-t border-edge-neutral text-caption text-ink-muted transition duration-[var(--t-fast)] ease-refined hover:text-ink-primary"
      >
        {collapsed ? "»" : `« ${labels.collapse}`}
      </button>
    </nav>
  );
}
