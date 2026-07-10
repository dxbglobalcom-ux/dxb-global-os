// DataTile (UI-SPEC §4, COST-04): NOT a card — plain layout inside a Panel.
// Mono value 20px/650 + 12px label; optional status tone reserved for budget
// thresholds only (70% warn / 100% danger — Cost Monitor rules). RSC.
export type TileTone = "neutral" | "warn" | "danger";

const VALUE_TONE: Record<TileTone, string> = {
  neutral: "text-ink",
  warn: "text-warn",
  danger: "text-danger",
};

export function DataTile({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: TileTone;
}) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <span className={`font-mono text-[1.25rem] font-[650] leading-tight ${VALUE_TONE[tone]}`} data-numeric>
        {value}
      </span>
      <span className="text-[0.75rem] font-medium text-ink-2">{label}</span>
      {detail && <span className="font-mono text-micro text-ink-2">{detail}</span>}
    </div>
  );
}
