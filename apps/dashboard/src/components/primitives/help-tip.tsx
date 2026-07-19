"use client";
// HelpTip — the C9 standing order (CEO complaint ledger 2026-07-19): every
// main heading carries a small question mark that explains what the page or
// section is, in the CEO's language, plainly. Opens on hover AND on click
// (CEO catch 2026-07-19 morning: hover-only reads as dead when the pointer
// misses the 16px target — a click must always work), closes on outside
// click / Escape / second click.
import { useEffect, useId, useRef, useState } from "react";

export function HelpTip({ text }: { text: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        // drop focus too — the closed-state focus-within class would
        // otherwise keep the tooltip visible while the button stays focused
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="group/help relative inline-flex align-middle">
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={id}
        onClick={() => setOpen((v) => !v)}
        className={`flex size-4 cursor-help items-center justify-center rounded-full border text-[10px] leading-none transition duration-[var(--t-fast)] ease-refined group-hover/help:border-edge-champagne group-hover/help:text-accent-champagne ${
          open
            ? "border-edge-champagne text-accent-champagne"
            : "border-edge-neutral text-ink-muted"
        }`}
      >
        ?
      </button>
      <span
        id={id}
        role="tooltip"
        className={`absolute left-0 top-full z-50 mt-2 w-80 max-w-[80vw] rounded-panel border border-edge-neutral bg-surface-obsidian p-3 text-left text-body-s font-normal normal-case tracking-normal text-ink-secondary shadow-2xl transition duration-[var(--t-fast)] ease-refined ${
          open
            ? "visible opacity-100"
            : "pointer-events-none invisible opacity-0 group-hover/help:pointer-events-auto group-hover/help:visible group-hover/help:opacity-100 group-focus-within/help:visible group-focus-within/help:opacity-100"
        }`}
      >
        {text}
      </span>
    </span>
  );
}
