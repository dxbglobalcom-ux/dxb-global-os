// HelpTip — the C9 standing order (CEO complaint ledger 2026-07-19): every
// main heading carries a small question mark that explains ON HOVER (never
// click) what the page/section is, in the CEO's language, plainly. Pure
// CSS hover/focus reveal — no client JS, works inside server components.
import { useId } from "react";

export function HelpTip({ text }: { text: string }) {
  const id = useId();
  return (
    <span className="group/help relative inline-flex align-middle">
      <span
        tabIndex={0}
        aria-describedby={id}
        className="flex size-4 cursor-help items-center justify-center rounded-full border border-edge-neutral text-[10px] leading-none text-ink-muted transition duration-[var(--t-fast)] ease-refined group-hover/help:border-edge-champagne group-hover/help:text-accent-champagne"
      >
        ?
      </span>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none invisible absolute left-1/2 top-full z-40 mt-2 w-72 -translate-x-1/2 rounded-panel border border-edge-neutral bg-surface-obsidian p-3 text-left text-body-s font-normal normal-case tracking-normal text-ink-secondary opacity-0 shadow-2xl transition duration-[var(--t-fast)] ease-refined group-hover/help:visible group-hover/help:opacity-100 group-focus-within/help:visible group-focus-within/help:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
