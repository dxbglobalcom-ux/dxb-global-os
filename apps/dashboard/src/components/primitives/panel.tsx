import type { ReactNode } from "react";

// Command Center Panel — carbon surface, 10px radius, 20px padding,
// e1 + reflection + 1px neutral border (DESIGN_SYSTEM §5, B2).
// State styling follows the §10 derivation matrix; hover elevation is
// always-on CSS so panels feel alive without client JS.

export type PanelState =
  | "default"
  | "selected"
  | "disabled"
  | "loading"
  | "error"
  | "critical";

const STATE_CLASS: Record<PanelState, string> = {
  default: "border-edge-neutral",
  // Selected: champagne edge + left 2px accent bar (via ::after-free
  // shadow inset) — bar rendered as a border-left on the inner wrapper.
  selected: "border-edge-champagne",
  disabled: "border-edge-neutral opacity-45 pointer-events-none shadow-none",
  loading: "border-edge-neutral",
  error: "border-status-danger",
  critical:
    "border-status-critical outline outline-1 outline-offset-2 outline-status-critical bg-[color-mix(in_srgb,var(--status-critical)_6%,var(--surface-carbon))]",
};

export function Panel({
  title,
  action,
  state = "default",
  hoverable = false,
  className = "",
  children,
}: {
  title?: string;
  action?: ReactNode;
  state?: PanelState;
  hoverable?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const critical = state === "critical";
  return (
    <section
      className={`reflection rounded-panel border p-5 ${
        critical ? "" : "bg-surface-carbon"
      } ${state === "disabled" ? "" : "shadow-e1"} ${STATE_CLASS[state]} ${
        hoverable
          ? "transition duration-[var(--t-fast)] ease-refined hover:-translate-y-px hover:border-edge-champagne hover:shadow-e2"
          : ""
      } ${state === "selected" ? "border-l-2 border-l-accent-champagne" : ""} ${className}`}
    >
      {(title || action) && (
        <header className="mb-4 flex items-center gap-3">
          {title && (
            <h2
              className={`label-caps ${
                state === "selected"
                  ? "text-accent-champagne"
                  : "text-ink-secondary"
              }`}
            >
              {title}
            </h2>
          )}
          {action && <div className="ml-auto">{action}</div>}
        </header>
      )}
      {state === "loading" ? (
        <div className="space-y-3" aria-busy="true">
          <div className="skeleton h-7 w-2/5" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      ) : (
        children
      )}
    </section>
  );
}
