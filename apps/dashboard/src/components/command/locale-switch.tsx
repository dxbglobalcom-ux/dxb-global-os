"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE_CLIENT } from "@/lib/i18n";

// Dil anahtarı (A2: iki dil doğuştan) — cookie yaz + RSC refresh.
// "EN"/"TR" dil KODLARIDIR, çevrilmez (i18n ihlali değildir).

export function LocaleSwitch({
  locale,
  ariaLabel,
}: {
  locale: "en" | "tr";
  ariaLabel: string;
}) {
  const router = useRouter();

  function set(next: "en" | "tr") {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE_CLIENT}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex overflow-hidden rounded-input border border-edge-neutral"
    >
      {(["en", "tr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => set(l)}
          aria-pressed={locale === l}
          className={`px-2 py-1 font-data text-caption uppercase transition duration-[var(--t-fast)] ease-refined ${
            locale === l
              ? "bg-surface-graphite text-accent-champagne"
              : "text-ink-muted hover:bg-surface-carbon hover:text-ink-primary"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
