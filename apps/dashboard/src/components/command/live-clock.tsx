"use client";

import { useEffect, useState } from "react";

// Command bar clock — ticks per minute; server renders nothing to avoid
// hydration drift, the value appears on mount.
export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!now) return <span className="font-data text-caption text-ink-muted">--:--</span>;
  return (
    <span className="font-data text-caption text-ink-secondary tabular-nums">
      {now.toLocaleDateString(undefined, { day: "2-digit", month: "short" })}{" "}
      {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}
