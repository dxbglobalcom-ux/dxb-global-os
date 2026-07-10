// AuditTimeline (DASH-03, UI-SPEC §5 drill-down): vertical chronology of ONE
// task's audit trace — mono stamp + actor chip + action + lazy payload
// disclosure. RSC; the only interactivity is the native <details> element.
import { timeHM } from "@/lib/format";

export type AuditRow = {
  id: string;
  actor: string;
  actor_type: string;
  action: string;
  payload: Record<string, unknown>;
  created_at: string;
};

const ACTOR_TONE: Record<string, string> = {
  ceo: "text-accent",
  agent: "text-info",
  system: "text-ink-2",
};

const dateStamp = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
});

export function AuditTimeline({
  rows,
  emptyLabel,
  payloadLabel,
}: {
  rows: AuditRow[];
  emptyLabel: string;
  payloadLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-body text-ink-2">{emptyLabel}</p>;
  }

  return (
    <ol className="relative flex flex-col border-l border-line">
      {rows.map((row) => {
        const at = new Date(row.created_at);
        const hasPayload = row.payload && Object.keys(row.payload).length > 0;
        return (
          <li key={row.id} className="relative pb-5 pl-6 last:pb-1">
            <span aria-hidden className="absolute -left-[3.5px] top-2 size-1.5 rounded-full bg-line" />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="font-mono text-micro text-ink-2" data-numeric>
                {dateStamp.format(at)} {timeHM(at)}
              </span>
              <span className={`text-micro font-medium ${ACTOR_TONE[row.actor_type] ?? "text-ink-2"}`}>
                {row.actor}
              </span>
              <span className="text-body text-ink">{row.action}</span>
            </div>
            {hasPayload && (
              <details className="pt-1">
                <summary className="cursor-pointer text-micro text-ink-2 hover:text-ink">
                  {payloadLabel}
                </summary>
                <pre className="mt-2 max-h-56 overflow-auto rounded-[0.625rem] bg-bg p-3 font-mono text-micro leading-relaxed text-ink-2">
                  {JSON.stringify(row.payload, null, 2)}
                </pre>
              </details>
            )}
          </li>
        );
      })}
    </ol>
  );
}
