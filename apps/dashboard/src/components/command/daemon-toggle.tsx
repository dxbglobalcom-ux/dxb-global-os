"use client";

// JARVIS microphone pill + switch (U15 round 2): the CEO sees the mic state
// WITHOUT opening the voice section, and can flip it with one click. State
// lives in voice_daemon_state (audited door); the resident daemon polls it.
// Rendered inside the <summary> row, so the click must never toggle the
// <details> — preventDefault + stopPropagation.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff } from "lucide-react";

export function DaemonToggle({
  state,
  labels,
}: {
  state: "listening" | "muted";
  labels: { micStateLabel: string; micOn: string; micOff: string; micTurnOn: string; micTurnOff: string; micOffHint: string };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const muted = state === "muted";

  const flip = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/voice/daemon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: muted ? "listening" : "muted" }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="ml-auto flex shrink-0 items-center gap-2">
      <span
        data-testid="jarvis-mic-state"
        className={`flex items-center gap-1.5 text-caption ${muted ? "text-ink-muted" : "text-status-ok"}`}
        title={muted ? labels.micOffHint : undefined}
      >
        {muted ? <MicOff className="size-3.5" aria-hidden /> : <Mic className="size-3.5" aria-hidden />}
        {labels.micStateLabel}: {muted ? labels.micOff : labels.micOn}
      </span>
      <button
        type="button"
        data-testid="jarvis-mic-toggle"
        disabled={busy}
        onClick={(e) => void flip(e)}
        className="rounded-input border border-edge-neutral px-2.5 py-1 text-caption text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:text-ink-primary disabled:opacity-50"
      >
        {muted ? labels.micTurnOn : labels.micTurnOff}
      </button>
    </span>
  );
}
