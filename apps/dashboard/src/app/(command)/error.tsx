"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/primitives";
import {
  DEFAULT_LOCALE,
  getDict,
  LOCALE_COOKIE_CLIENT,
  type Locale,
} from "@/lib/i18n";

// E12.3 — (command) route-group error boundary (CC-SPEC §17: a data failure
// stays contained in its route; the shell NEVER dies with it). Client
// boundary: locale rides the same cookie the LocaleSwitch writes; both
// dictionaries are already in the client bundle via lib/i18n (DASH-06).
// The error itself goes to the console (CC-SPEC §14: client errors are
// console + informational — no telemetry inflation for a single-user OS).

function clientLocale(): Locale {
  const m = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE_CLIENT}=(tr|en)`),
  );
  return (m?.[1] as Locale) ?? DEFAULT_LOCALE;
}

export default function CommandError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    setLocale(clientLocale());
    console.error("[command] route error boundary:", error);
  }, [error]);
  const t = getDict(locale).command.boundary;

  return (
    <div className="mx-auto max-w-2xl pt-10">
      <Panel title={t.errorTitle} state="error">
        <p className="text-body-s text-ink-secondary">{t.errorBody}</p>
        {error.digest && (
          <p className="mt-2 font-data text-caption text-ink-muted tabular-nums">
            digest: {error.digest}
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-input border border-edge-champagne bg-surface-graphite px-3 py-1 text-body-s text-accent-ivory transition duration-[var(--t-fast)] ease-refined hover:bg-surface-anthracite"
          >
            {t.retry}
          </button>
          <a
            href="/overview"
            className="rounded-input border border-edge-neutral px-3 py-1 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
          >
            {t.backToOverview}
          </a>
        </div>
      </Panel>
    </div>
  );
}
