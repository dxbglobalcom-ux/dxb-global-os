"use client";

// FreshnessStamp (UI-SPEC §4): every live panel carries its truth. Labels are
// {time} templates so both word orders work — en "as of 14:32", tr "14:32
// itibarıyla" (A2 bilingual rule). Channel lost: --warn dot + "not live ·
// last 14:32" (interpunct, not em-dash — §7 bans em-dash in UI strings).
import type { DxbChannelState } from "@/lib/realtime";
import { timeHM } from "@/lib/format";

function TemplatedTime({ template, time }: { template: string; time: string | null }) {
  if (!time) return <>{template.replace("{time}", "").trim()}</>;
  const [before, after] = template.split("{time}");
  return (
    <>
      {before}
      <span className="font-mono" data-numeric>
        {time}
      </span>
      {after}
    </>
  );
}

export function FreshnessStamp({
  state,
  asOfLabel,
  notLiveLabel,
}: {
  state: DxbChannelState;
  /** Template containing {time}, e.g. "as of {time}" / "{time} itibarıyla" */
  asOfLabel: string;
  /** Template containing {time}, e.g. "not live · last {time}" */
  notLiveLabel: string;
}) {
  const time = state.lastAt ? timeHM(state.lastAt) : null;

  if (state.status === "stale") {
    return (
      <span className="flex items-center gap-1.5 text-micro text-ink-2">
        <span aria-hidden className="size-1.5 rounded-full bg-warn" />
        <span>
          <TemplatedTime template={notLiveLabel} time={time} />
        </span>
      </span>
    );
  }

  if (!time) return null;

  return (
    <span className="text-micro text-ink-2">
      <TemplatedTime template={asOfLabel} time={time} />
    </span>
  );
}
