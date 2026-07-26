"use client";

import { useCallback, useState } from "react";
import { Target } from "lucide-react";

// W2.1 — the way a target gets into the company.
//
// `control_objective_create/_activate/_close` had existed since the revenue wave
// with NO caller in the product: setting a number meant opening psql. The CEO's
// framing of the whole system is "I give the number, the OS works out how" — and
// the number had no door.
//
// Deliberately small. This is not a planning form: it is amount, name, and
// whether it starts now. Everything else the spec supports (metric, period,
// capital limit) has a working default, and a default the CEO never has to think
// about is worth more here than a field he has to fill.

export interface ObjectiveDoorLabels {
  title: string;
  hint: string;
  amountLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  activateLabel: string;
  submit: string;
  submitting: string;
  created: string;
  failed: string;
  capitalNote: string;
}

export function ObjectiveDoor({ labels }: { labels: ObjectiveDoorLabels }) {
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [activate, setActivate] = useState(true);
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = useCallback(async () => {
    const amountEur = Number(amount);
    if (!Number.isFinite(amountEur) || amountEur <= 0 || state === "sending") return;
    setState("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/control/objectives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Required by the door. A target is exactly the thing a double-submit
          // must not create twice (org seam lesson, 2026-07-24).
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          op: "create",
          title: name.trim() || `${amountEur} EUR`,
          amountEur,
          activate,
        }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && body?.ok !== false) {
        setState("ok");
        setMessage(labels.created);
        setAmount("");
        setName("");
        // The list above is a server render; the new row only exists after a
        // reload, and showing a stale list under a success message would be its
        // own small lie.
        setTimeout(() => window.location.reload(), 600);
      } else {
        setState("error");
        setMessage(body?.error ?? labels.failed);
      }
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : labels.failed);
    }
  }, [amount, name, activate, state, labels]);

  return (
    <div className="rounded-md border border-edge-neutral p-4">
      <div className="mb-1 flex items-center gap-2">
        <Target size={14} strokeWidth={1.5} className="text-accent-primary" aria-hidden />
        <span className="font-medium text-body-s text-ink-primary">{labels.title}</span>
      </div>
      <p className="mb-3 text-caption text-ink-secondary">{labels.hint}</p>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="label-caps text-caption text-ink-muted">{labels.amountLabel}</span>
          <input
            type="number"
            inputMode="decimal"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            data-testid="objective-amount"
            className="w-36 rounded-input border border-edge-neutral bg-transparent px-2 py-1 font-data text-body-s text-ink-primary tabular-nums outline-none focus:border-accent-primary"
          />
        </label>
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1">
          <span className="label-caps text-caption text-ink-muted">{labels.nameLabel}</span>
          <input
            type="text"
            maxLength={200}
            value={name}
            placeholder={labels.namePlaceholder}
            onChange={(e) => setName(e.target.value)}
            data-testid="objective-name"
            className="w-full rounded-input border border-edge-neutral bg-transparent px-2 py-1 text-body-s text-ink-primary outline-none placeholder:text-ink-muted focus:border-accent-primary"
          />
        </label>
        <label className="flex items-center gap-2 pb-1 text-body-s text-ink-secondary">
          <input
            type="checkbox"
            checked={activate}
            onChange={(e) => setActivate(e.target.checked)}
            data-testid="objective-activate"
          />
          {labels.activateLabel}
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={state === "sending" || !amount}
          data-testid="objective-submit"
          // A disabled primary button rendered at 50% opacity read as broken
          // rather than as "not yet" (eye test, 2026-07-26). Disabled now takes
          // the neutral outline treatment — visibly inert, still legible.
          className={`shrink-0 rounded-input px-3 py-1.5 text-body-s font-medium transition duration-[var(--t-fast)] ease-refined ${
            state === "sending" || !amount
              ? "cursor-not-allowed border border-edge-neutral text-ink-muted"
              : "bg-accent-primary text-ink-inverse"
          }`}
        >
          {state === "sending" ? labels.submitting : labels.submit}
        </button>
      </div>

      <p className="mt-2 text-caption text-ink-muted">{labels.capitalNote}</p>
      {message && (
        <p
          data-testid="objective-message"
          className={`mt-2 text-body-s ${state === "error" ? "text-status-danger" : "text-status-ok"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
