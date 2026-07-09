import { getDict } from "@/lib/i18n";

// Horizon Line (UI-SPEC §5, signature): the 1px accent gradient under the
// topbar carrying the company pulse. Counter slots render only when live
// values are wired (08-02 Broadcast subscriptions) — no fake numbers before
// real data exists (anti-pattern: fake-precise).
export type HorizonPulse = {
  activeTasks?: number;
  pendingApprovals?: number;
  todayCostEur?: string;
  live?: boolean;
};

export function HorizonLine({ pulse }: { pulse?: HorizonPulse }) {
  const dict = getDict();
  const slots: Array<{ label: string; value: string }> = [];
  if (pulse?.activeTasks !== undefined)
    slots.push({ label: dict.horizon.activeTasks, value: String(pulse.activeTasks) });
  if (pulse?.pendingApprovals !== undefined)
    slots.push({ label: dict.horizon.pendingApprovals, value: String(pulse.pendingApprovals) });
  if (pulse?.todayCostEur !== undefined)
    slots.push({ label: dict.horizon.todayCost, value: pulse.todayCostEur });

  const live = pulse?.live ?? false;

  return (
    <div className="relative">
      {/* the horizon itself: 1px accent -> transparent, the only gradient in chrome */}
      <div
        aria-hidden
        className="h-px w-full"
        style={{
          background: "linear-gradient(90deg, var(--accent) 0%, transparent 78%)",
        }}
      />
      <div className="flex items-center gap-5 px-4 py-1.5 sm:px-6">
        {slots.map((slot) => (
          <span key={slot.label} className="flex items-baseline gap-1.5">
            <span className="font-mono text-micro text-ink" data-numeric>
              {slot.value}
            </span>
            <span className="text-micro text-ink-2">{slot.label}</span>
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1.5">
          <span
            aria-hidden
            className={
              live
                ? "size-1.5 rounded-full bg-ok motion-safe:animate-[hl-pulse_2.4s_ease-in-out_infinite]"
                : "size-1.5 rounded-full bg-warn"
            }
          />
          <span className="text-micro text-ink-2">
            {live ? dict.horizon.live : dict.horizon.notLive}
          </span>
        </span>
      </div>
    </div>
  );
}
