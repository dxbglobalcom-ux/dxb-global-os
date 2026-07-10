"use client";

// CommandBar (DASH-02, UI-SPEC §4): the anti-baby-sitting core made
// tangible. Desktop: ⌘K + persistent topbar affordance. Mobile: fixed
// bottom strip above the tab bar. Opens a modal layer (z modal, scrim 0.55;
// backdrop-blur allowed — fixed overlay). TR/EN rotating placeholder.
// Submit = plain fetch to /api/intent — NO LLM, no streaming SDK here.
// Status of a submitted intent lives in the IntentStrip, never a toast.
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, PaperPlaneRightIcon } from "@phosphor-icons/react";
import { DEFAULT_LOCALE } from "@/lib/i18n";

export type CommandBarText = {
  trigger: string;
  shortcutHint: string;
  inputLabel: string;
  submit: string;
  recentTitle: string;
  errorTitle: string;
};

export function CommandBar({
  text,
  placeholders,
  recent,
}: {
  text: CommandBarText;
  placeholders: string[];
  recent: Array<{ id: string; text: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const rotate = window.setInterval(
      () => setPlaceholderIndex((i) => (i + 1) % placeholders.length),
      4000,
    );
    return () => window.clearInterval(rotate);
  }, [open, placeholders.length]);

  const submit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, lang: DEFAULT_LOCALE }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      setValue("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, [value, busy, router]);

  return (
    <>
      {/* Desktop topbar affordance */}
      <button
        type="button"
        data-chrome="command"
        onClick={() => setOpen(true)}
        className="hidden h-9 items-center gap-2 rounded-full border border-line px-4 text-micro text-ink-2 transition-colors duration-[var(--dur-fast)] hover:text-ink md:inline-flex"
      >
        <MagnifyingGlassIcon size={14} aria-hidden />
        {text.trigger}
        <kbd className="rounded-md border border-line px-1.5 font-mono text-[0.65rem] text-ink-2">
          {text.shortcutHint}
        </kbd>
      </button>

      {/* Mobile fixed strip (above the bottom tab bar) */}
      <button
        type="button"
        data-chrome="command-mobile"
        onClick={() => setOpen(true)}
        className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+4.25rem)] flex h-11 items-center gap-2 rounded-full border border-line bg-surface/90 px-4 text-body text-ink-2 backdrop-blur-md md:hidden"
        style={{ zIndex: "var(--z-sticky)" }}
      >
        <MagnifyingGlassIcon size={16} aria-hidden />
        {text.trigger}
      </button>

      {open && (
        <div
          className="fixed inset-0 flex items-start justify-center px-4 pt-[18vh] backdrop-blur-sm"
          style={{ zIndex: "var(--z-modal)", background: "oklch(0 0 0 / 0.55)" }}
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-label={text.inputLabel}
            className="w-full max-w-xl rounded-[1.25rem] border border-line bg-surface p-1.5"
            style={{ boxShadow: "0 32px 64px -24px oklch(0.05 0.02 80 / 0.7)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="rounded-[calc(1.25rem-0.375rem)] bg-surface-2 p-4"
              style={{ boxShadow: "inset 0 1px 0 var(--edge-light)" }}
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void submit();
                }}
                className="flex items-center gap-3"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  maxLength={500}
                  placeholder={placeholders[placeholderIndex]}
                  aria-label={text.inputLabel}
                  className="h-11 min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-2"
                />
                <button
                  type="submit"
                  disabled={busy || value.trim().length === 0}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-accent px-5 text-body font-medium text-on-accent transition-transform duration-[var(--dur-fast)] hover:bg-accent-press active:scale-[0.98] disabled:opacity-50"
                >
                  <PaperPlaneRightIcon size={16} aria-hidden />
                  {text.submit}
                </button>
              </form>

              {error && (
                <div role="alert" className="mt-3 border-t border-line pt-3">
                  <p className="text-micro font-medium text-danger">{text.errorTitle}</p>
                  <p className="pt-0.5 font-mono text-micro text-ink-2">{error}</p>
                </div>
              )}

              {recent.length > 0 && (
                <div className="mt-3 border-t border-line pt-3">
                  <p className="pb-1.5 text-micro text-ink-2">{text.recentTitle}</p>
                  <ul className="flex flex-col">
                    {recent.map((intent) => (
                      <li key={intent.id}>
                        <button
                          type="button"
                          onClick={() => setValue(intent.text)}
                          className="w-full truncate py-1.5 text-left text-body text-ink-2 hover:text-ink"
                        >
                          {intent.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
