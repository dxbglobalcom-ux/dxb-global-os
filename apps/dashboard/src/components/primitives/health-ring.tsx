// HealthRing — Holding Health radial gauge (DESIGN_SYSTEM §10 "Holding
// Health Panel": ince halka 3px, skor display-xl ivory). Saf SVG, server
// component; renk banda göre status token'ından gelir, sayı renkten
// bağımsız okunur (§30).

const BAND_VAR: Record<"ok" | "warn" | "danger", string> = {
  ok: "var(--status-ok)",
  warn: "var(--status-warn)",
  danger: "var(--status-danger)",
};

export function HealthRing({
  score,
  band,
  size = 168,
}: {
  score: number;
  band: "ok" | "warn" | "danger";
  size?: number;
}) {
  const stroke = 3;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, score)) / 100) * c;
  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${score}/100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-anthracite)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={BAND_VAR[band]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          style={{ filter: "drop-shadow(0 0 6px rgba(216,185,140,0.25))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="live-glow font-display text-display-xl text-accent-ivory tabular-nums">
          {score}
        </span>
        <span className="font-data text-caption text-ink-muted tabular-nums">
          / 100
        </span>
      </div>
    </div>
  );
}
