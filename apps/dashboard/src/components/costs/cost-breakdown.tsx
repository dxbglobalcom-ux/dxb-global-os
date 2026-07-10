"use client";

// CostBreakdown (COST-04, dataviz discipline): horizontal bar list —
// magnitude by single measure, so ALL bars wear ONE quiet neutral hue
// (ink-derived; the champagne accent stays within its ≤8% chrome budget and
// status colors are reserved for the budget tile thresholds). Every row is
// direct-labeled (key + mono value) — identity never rides on color. Bars
// are thin, rounded at the data end, on a hairline track. Dimension/period
// toggles are RSC links (?dim=&period=); this island only keeps the page
// live over dxb:cost_ledger and carries the FreshnessStamp.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { FreshnessStamp } from "@/components/freshness-stamp";
import { useDxbChannel } from "@/lib/realtime";
import type { BreakdownEntry, CostDimension, CostPeriod } from "@/lib/costs";
import { COST_DIMENSIONS, COST_PERIODS } from "@/lib/costs";

export type BreakdownText = {
  dimensionLabels: Record<CostDimension, string>;
  periodLabels: Record<CostPeriod, string>;
  empty: string;
  asOf: string;
  notLiveSince: string;
};

function ToggleRow<T extends string>({
  options,
  active,
  labels,
  hrefFor,
}: {
  options: T[];
  active: T;
  labels: Record<T, string>;
  hrefFor: (option: T) => string;
}) {
  return (
    <div className="flex items-center gap-1">
      {options.map((option) => (
        <Link
          key={option}
          href={hrefFor(option)}
          aria-current={option === active ? "true" : undefined}
          className={`inline-flex h-8 items-center rounded-full px-3.5 text-micro font-medium transition-colors duration-[var(--dur-fast)] ${
            option === active
              ? "bg-surface-3 text-ink"
              : "text-ink-2 hover:text-ink"
          }`}
        >
          {labels[option]}
        </Link>
      ))}
    </div>
  );
}

export function CostBreakdown({
  entries,
  dimension,
  period,
  text,
}: {
  entries: BreakdownEntry[];
  dimension: CostDimension;
  period: CostPeriod;
  text: BreakdownText;
}) {
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);
  const channel = useDxbChannel("cost_ledger", refresh);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleRow
          options={COST_DIMENSIONS}
          active={dimension}
          labels={text.dimensionLabels}
          hrefFor={(dim) => `/costs?dim=${dim}&period=${period}`}
        />
        <div className="flex items-center gap-4">
          <ToggleRow
            options={COST_PERIODS}
            active={period}
            labels={text.periodLabels}
            hrefFor={(p) => `/costs?dim=${dimension}&period=${p}`}
          />
          <FreshnessStamp state={channel} asOfLabel={text.asOf} notLiveLabel={text.notLiveSince} />
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="py-6 text-body text-ink-2">{text.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {entries.map((entry) => (
            <li key={entry.key} className="grid grid-cols-[minmax(6rem,14rem)_1fr_auto] items-center gap-3">
              <span className="truncate text-body text-ink">{entry.key}</span>
              <div className="h-2 rounded-full bg-surface-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.max(entry.ratio * 100, entry.totalEur > 0 ? 2 : 0)}%`,
                    background: "color-mix(in oklab, var(--ink-2) 38%, transparent)",
                  }}
                  aria-hidden
                />
              </div>
              <span className="font-mono text-body text-ink" data-numeric>
                {entry.formatted}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
