"use client";

// TV/meeting mode toggle (Amendment A1.2): read-only presentation view for
// a meeting screen or wall TV. `?mode=tv` stamps data-mode on the root —
// globals.css scales type ~1.4× and hides interactive chrome; live panels
// keep streaming. Exit affordance stays visible top-right.
import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MonitorIcon, XIcon } from "@phosphor-icons/react";

export function TvModeToggle({ enterLabel, exitLabel }: { enterLabel: string; exitLabel: string }) {
  const searchParams = useSearchParams();
  const active = searchParams.get("mode") === "tv";

  useEffect(() => {
    if (active) {
      document.documentElement.dataset.mode = "tv";
      return () => {
        delete document.documentElement.dataset.mode;
      };
    }
    delete document.documentElement.dataset.mode;
  }, [active]);

  if (active) {
    return (
      <Link
        href="/"
        className="fixed right-4 top-4 inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface/90 px-4 text-micro text-ink-2 backdrop-blur-md hover:text-ink"
        style={{ zIndex: "var(--z-toast)" }}
      >
        <XIcon size={14} aria-hidden />
        {exitLabel}
      </Link>
    );
  }

  return (
    <Link
      href="/?mode=tv"
      data-chrome="tv-toggle"
      className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-micro text-ink-2 transition-colors duration-[var(--dur-fast)] hover:text-ink"
    >
      <MonitorIcon size={14} aria-hidden />
      {enterLabel}
    </Link>
  );
}
