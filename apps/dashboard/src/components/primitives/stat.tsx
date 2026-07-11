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
      className={`group flex min-h-32 flex-col rounded-panel border border-edge-neutral bg-surface-carbon p-5 shadow-e1 reflection transition duration-[var(--t-fast)] ease-refined hover:-translate-y-px hover:border-edge-champagne hover:bg-surface-graphite hover:shadow-e2 ${className}`}
    >
      <div className="label-caps text-ink-secondary">{label}</div>
      {/* Değer bloğu kutu tabanına sabit (mt-auto): her genişlik/zoom'da
          aynı dikey ritim. Ölçek akışkan clamp — uzun değer alt banda
          düşer (display-xl→display sınırları, DESIGN_SYSTEM §7);
          kutudan taşan ya da yüzen metrik göz-testi ihlalidir. */}
      <div className="mt-auto flex min-w-0 items-baseline gap-2 pt-2">
        <span
          className={`font-display font-semibold tracking-[-0.02em] text-accent-ivory tabular-nums leading-[1.1] ${
            value.length > 5
              ? "text-[length:clamp(1.5rem,0.9vw+1rem,2rem)]"
              : "text-[length:clamp(2rem,1.2vw+1.25rem,2.75rem)]"
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
