import type { ReactNode } from "react";

// CommandItem — one result row of the ⌘K palette (DESIGN_SYSTEM §10,
// "Görsel sistemler"): icon slot, title, optional hint, optional kbd
// shortcut, optional risk badge slot (mutations must declare risk).
// Selected state follows the §10 matrix: champagne edge + gold text.

export function CommandItem({
  icon,
  title,
  hint,
  kbd,
  trailing,
  selected = false,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  kbd?: string;
  trailing?: ReactNode;
  selected?: boolean;
}) {
  return (
    <div
      className={`flex h-10 items-center gap-3 rounded-input border px-3 text-body-md transition duration-[var(--t-fast)] ease-refined ${
        selected
          ? "border-edge-champagne bg-surface-anthracite text-accent-champagne"
          : "border-transparent text-ink-primary hover:bg-surface-anthracite"
      }`}
      aria-selected={selected}
    >
      {icon && <span className="text-ink-secondary">{icon}</span>}
      <span>{title}</span>
      {hint && <span className="text-body-s text-ink-muted">{hint}</span>}
      <span className="ml-auto flex items-center gap-2">
        {trailing}
        {kbd && (
          <kbd className="rounded-input border border-edge-neutral bg-surface-graphite px-1.5 py-0.5 font-data text-caption text-ink-secondary">
            {kbd}
          </kbd>
        )}
      </span>
    </div>
  );
}
