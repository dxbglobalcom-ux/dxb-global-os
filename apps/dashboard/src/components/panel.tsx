import type { ReactNode } from "react";

// Double-Bezel panel — the signature surface language (UI-SPEC §4, byte
// recipe): outer shell --surface rounded-[1.25rem] p-1.5 + 1px --line + a
// hue-tinted ambient shadow; inner core --surface-2 concentric radius
// rounded-[calc(1.25rem-0.375rem)] with --edge-light inset top highlight.
// Nested cards are forbidden — group content inside with divide-y instead.
export function Panel({
  title,
  action,
  stamp,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  stamp?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.25rem] border border-line bg-surface p-1.5 ${className}`}
      style={{ boxShadow: "0 24px 48px -24px oklch(0.1 0.02 80 / 0.55)" }}
    >
      <div
        className="rounded-[calc(1.25rem-0.375rem)] bg-surface-2"
        style={{ boxShadow: "inset 0 1px 0 var(--edge-light)" }}
      >
        {(title || action || stamp) && (
          <header className="flex items-center gap-3 px-5 pb-1 pt-4">
            {title && <h2 className="text-panel-title text-ink">{title}</h2>}
            {action && <div className="ml-1">{action}</div>}
            {stamp && <div className="ml-auto">{stamp}</div>}
          </header>
        )}
        <div className="px-5 pb-4 pt-1">{children}</div>
      </div>
    </section>
  );
}
