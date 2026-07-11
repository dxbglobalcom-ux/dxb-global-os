import Link from "next/link";

// Stat — the Executive KPI unit (DESIGN_SYSTEM §10, CC-SPEC §7):
// label-caps header, display-xl ivory value in tabular nums, delta as
// sign+color+percent (direction carried by the sign, not color alone),
// and a MANDATORY drill target — every number on the cockpit is a door,
// never a dead pixel.

export function Stat({
  label,
  value,
  unit,
  delta,
  drillHref,
  glow = false,
  className = "",
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: { pct: number; label?: string };
  drillHref: string;
  /** Canlı/kritik metrik vurgusu — holo-glow SADECE gerçek zamanlı değerde (B3). */
  glow?: boolean;
  className?: string;
}) {
  const dir = delta ? Math.sign(delta.pct) : 0;
  return (
    <Link
      href={drillHref}
      className={`group block rounded-panel border border-edge-neutral bg-surface-carbon p-5 shadow-e1 reflection transition duration-[var(--t-fast)] ease-refined hover:-translate-y-px hover:border-edge-champagne hover:bg-surface-graphite hover:shadow-e2 ${className}`}
    >
      <div className="label-caps text-ink-secondary">{label}</div>
      <div className="mt-2 flex min-w-0 items-baseline gap-2">
        {/* Uzun değer bir alt ölçeğe düşer (display-xl→display, DESIGN_SYSTEM §7)
            — kutudan taşan metrik göz-testi ihlalidir. */}
        <span
          className={`font-display text-accent-ivory tabular-nums ${
            value.length > 5 ? "text-display-lg" : "text-display-xl"
          } ${glow ? "live-glow" : ""}`}
        >
          {value}
        </span>
        {unit && <span className="text-h3 text-ink-secondary">{unit}</span>}
      </div>
      {delta && (
        <div
          className={`mt-1 text-body-s tabular-nums ${
            dir > 0
              ? "text-status-ok"
              : dir < 0
                ? "text-status-danger"
                : "text-ink-secondary"
          }`}
        >
          {dir > 0 ? "▲" : dir < 0 ? "▼" : "—"} {Math.abs(delta.pct).toFixed(1)}%
          {delta.label && (
            <span className="ml-1 text-ink-muted">{delta.label}</span>
          )}
        </div>
      )}
    </Link>
  );
}
