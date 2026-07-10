// StatusBadge — status is never color-alone (DESIGN_SYSTEM §8, §30):
// each level pairs a fixed shape with its color so the state survives
// monochrome rendering: ok=circle, warn=triangle, danger=square,
// info=circle-outline, critical=double-edged square.

export type StatusLevel = "ok" | "warn" | "danger" | "info" | "critical";

const TEXT_CLASS: Record<StatusLevel, string> = {
  ok: "text-status-ok",
  warn: "text-status-warn",
  danger: "text-status-danger",
  info: "text-status-info",
  critical: "text-status-critical",
};

function Shape({ level }: { level: StatusLevel }) {
  switch (level) {
    case "ok":
      return <span className="size-2 rounded-full bg-status-ok" />;
    case "warn":
      return (
        <span
          className="inline-block"
          style={{
            width: 0,
            height: 0,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderBottom: "7px solid var(--status-warn)",
          }}
        />
      );
    case "danger":
      return <span className="size-2 bg-status-danger" />;
    case "info":
      return (
        <span className="size-2 rounded-full border border-status-info" />
      );
    case "critical":
      return (
        <span className="size-2 bg-status-critical outline outline-1 outline-offset-1 outline-status-critical" />
      );
  }
}

export function StatusBadge({
  level,
  children,
  className = "",
}: {
  level: StatusLevel;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-input border border-edge-neutral bg-surface-graphite px-2 py-0.5 text-caption ${TEXT_CLASS[level]} ${className}`}
    >
      <Shape level={level} />
      {children}
    </span>
  );
}
