"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

// Command bar clock — ticks per minute; server renders nothing to avoid
// hydration drift, the value appears on mount. Formats follow the UI locale
// (wave 3f: browser-default formatting printed "Jul 13 01:54 AM" on the
// Turkish screen — RULE #0 language purity).
const CLOCK_LOCALE: Record<Locale, string> = { en: "en-US", tr: "tr-TR" };

export function LiveClock({ locale }: { locale: Locale }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!now) return <span className="font-data text-caption text-ink-muted">--:--</span>;
  const tag = CLOCK_LOCALE[locale];
  return (
    <span className="font-data text-caption text-ink-secondary tabular-nums">
      {now.toLocaleDateString(tag, { day: "2-digit", month: "short" })}{" "}
      {now.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}
