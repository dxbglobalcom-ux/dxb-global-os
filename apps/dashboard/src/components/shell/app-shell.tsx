"use client";

// AppShell (UI-SPEC §5): left icon rail (64px, expands to 220px on hover,
// bottom tab bar under 768px) + topbar carrying the Horizon Line + content
// grid. Glass (backdrop-blur) lives ONLY on this fixed chrome, never in
// scroll content.
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AddressBookIcon,
  CoinsIcon,
  ListChecksIcon,
  SquaresFourIcon,
  StampIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

type NavLabels = {
  cockpit: string;
  approvals: string;
  costs: string;
  tasks: string;
  crm: string;
};

const NAV_ICONS = {
  cockpit: SquaresFourIcon,
  approvals: StampIcon,
  costs: CoinsIcon,
  tasks: ListChecksIcon,
  crm: AddressBookIcon,
} as const;

const NAV_ROUTES: Record<keyof NavLabels, string> = {
  cockpit: "/",
  approvals: "/approvals",
  costs: "/costs",
  tasks: "/tasks",
  crm: "/crm",
};

export function AppShell({
  labels,
  brand,
  horizon,
  children,
}: {
  labels: NavLabels;
  brand: string;
  horizon: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const items = (Object.keys(NAV_ROUTES) as Array<keyof NavLabels>).map((key) => {
    const href = NAV_ROUTES[key];
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return { key, href, active, label: labels[key], Icon: NAV_ICONS[key] };
  });

  return (
    <div className="min-h-[100dvh]">
      {/* Rail — desktop */}
      <aside
        className="group fixed inset-y-0 left-0 hidden w-16 flex-col border-r border-line bg-surface/80 backdrop-blur-md transition-[width] duration-[var(--dur)] ease-out-quint hover:w-[220px] md:flex"
        style={{ zIndex: "var(--z-sticky)" }}
      >
        <div className="flex h-14 items-center gap-3 overflow-hidden border-b border-line px-4">
          <DxbMark className="size-7 shrink-0 text-accent" />
          <span className="whitespace-nowrap text-panel-title text-ink opacity-0 transition-opacity duration-[var(--dur-fast)] group-hover:opacity-100">
            {brand}
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {items.map(({ key, href, active, label, Icon }) => (
            <Link
              key={key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex h-11 items-center gap-3 overflow-hidden rounded-xl px-3 transition-colors duration-[var(--dur-fast)] ${
                active ? "bg-surface-3 text-accent" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <Icon size={20} className="shrink-0" />
              <span className="whitespace-nowrap text-body opacity-0 transition-opacity duration-[var(--dur-fast)] group-hover:opacity-100">
                {label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Topbar + Horizon Line */}
      <div
        className="sticky top-0 border-b border-line bg-bg/85 backdrop-blur-md md:pl-16"
        style={{ zIndex: "var(--z-sticky)" }}
      >
        <div className="flex h-14 items-center px-4 sm:px-6">
          <span className="text-panel-title text-ink md:hidden">{brand}</span>
        </div>
        {horizon}
      </div>

      {/* Content */}
      <main className="mx-auto max-w-[1600px] px-4 pb-24 pt-6 sm:px-6 md:pl-[calc(4rem+1.5rem)] md:pb-10">
        {children}
      </main>

      {/* Bottom tab bar — phone */}
      <nav
        className="fixed inset-x-0 bottom-0 flex border-t border-line bg-surface/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        style={{ zIndex: "var(--z-sticky)" }}
      >
        {items.map(({ key, href, active, label, Icon }) => (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 ${
              active ? "text-accent" : "text-ink-2"
            }`}
          >
            <Icon size={20} />
            <span className="text-micro">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

// Simple geometric DXB mark (UI-SPEC §8): a sail-like monogram, inline SVG,
// no external asset, currentColor so it lives on tokens.
export function DxbMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      <path
        d="M8 27V5c9.5 1.5 16 8.5 16 17v5H8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 27c0-9 4.5-15.5 16-18" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
