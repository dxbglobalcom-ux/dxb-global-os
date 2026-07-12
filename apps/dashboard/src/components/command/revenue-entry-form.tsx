"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Manual money-IN entry (E6.5). Until the integrations land (WooCommerce,
// bank, CRM), this is how the physical company's daily income reaches the
// P&L. Approval-free by standing CEO rule; the ledger behind it is
// append-only and every row is audited.

const ENGINES = [
  "physical",
  "content_monetization",
  "social_selling",
  "ecommerce",
  "consultancy",
  "venture",
  "other",
] as const;

const PLATFORMS = [
  "youtube",
  "instagram",
  "tiktok",
  "x",
  "facebook",
  "linkedin",
  "twitch",
  "pinterest",
  "other",
] as const;

export function RevenueEntryForm({
  labels,
}: {
  labels: {
    formTitle: string;
    formDate: string;
    formEngine: string;
    formAmount: string;
    formClient: string;
    formDescription: string;
    formSubmit: string;
    formSaved: string;
    formError: string;
    formPlatform: string;
    formPlatformNone: string;
    engines: Record<(typeof ENGINES)[number], string>;
    platforms: Record<(typeof PLATFORMS)[number], string>;
  };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");
  const [engine, setEngine] = useState<string>("physical");
  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setState("idle");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/control/revenue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          occurredOn: String(form.get("occurredOn")),
          engine: String(form.get("engine")),
          amountEur: Number(form.get("amountEur")),
          description: String(form.get("description")),
          client: String(form.get("client") || "") || undefined,
          platform: String(form.get("platform") || "") || undefined,
        }),
      });
      const result = (await response.json()) as { ok: boolean };
      if (!result.ok) throw new Error("rejected");
      setState("saved");
      (event.target as HTMLFormElement).reset?.();
      router.refresh();
    } catch {
      setState("error");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-input border border-edge-neutral bg-surface-anthracite px-2.5 py-1.5 text-body-s text-ink-primary placeholder:text-ink-muted focus:border-edge-champagne focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="space-y-3" data-testid="revenue-form">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-body-s text-ink-secondary">
            {labels.formDate}
          </span>
          <input
            name="occurredOn"
            type="date"
            required
            defaultValue={today}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-body-s text-ink-secondary">
            {labels.formEngine}
          </span>
          <select
            name="engine"
            required
            value={engine}
            onChange={(event) => setEngine(event.target.value)}
            className={inputClass}
          >
            {ENGINES.map((option) => (
              <option key={option} value={option}>
                {labels.engines[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-body-s text-ink-secondary">
            {labels.formPlatform}
          </span>
          <select
            name="platform"
            required={engine === "content_monetization"}
            defaultValue=""
            className={inputClass}
          >
            <option value="">{labels.formPlatformNone}</option>
            {PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {labels.platforms[platform]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-body-s text-ink-secondary">
            {labels.formAmount}
          </span>
          <input
            name="amountEur"
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-body-s text-ink-secondary">
            {labels.formClient}
          </span>
          <input name="client" type="text" className={inputClass} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-body-s text-ink-secondary">
          {labels.formDescription}
        </span>
        <input name="description" type="text" required minLength={3} className={inputClass} />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          data-testid="revenue-submit"
          className="rounded-input border border-edge-champagne px-3 py-1.5 text-body-s text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:bg-surface-carbon disabled:opacity-60"
        >
          {labels.formSubmit}
        </button>
        {state === "saved" && (
          <span className="text-body-s text-status-ok" data-testid="revenue-saved">
            {labels.formSaved}
          </span>
        )}
        {state === "error" && (
          <span className="text-body-s text-status-danger">{labels.formError}</span>
        )}
      </div>
    </form>
  );
}
