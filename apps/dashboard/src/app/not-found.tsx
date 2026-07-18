import Link from "next/link";
import { Panel } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

// E12.3 — ROOT 404 surface. Unknown top-level URLs (e.g. a mistyped /tr/...
// prefix) never enter the (command) group, so the group boundary cannot
// catch them — measured 2026-07-18: the raw unstyled Next 404 rendered.
// Same honest dead-end panel as (command)/not-found, inside the root shell.
export default async function RootNotFound() {
  const t = getDict(await getLocale()).command.boundary;
  return (
    <main className="ambient-depth flex min-h-[100dvh] items-center justify-center bg-surface-void p-6">
      <div className="w-full max-w-2xl">
        <Panel title={t.notFoundTitle}>
          <p className="text-body-s text-ink-secondary">{t.notFoundBody}</p>
          <div className="mt-4">
            <Link
              href="/overview"
              className="rounded-input border border-edge-champagne bg-surface-graphite px-3 py-1 text-body-s text-accent-ivory transition duration-[var(--t-fast)] ease-refined hover:bg-surface-anthracite"
            >
              {t.backToOverview}
            </Link>
          </div>
        </Panel>
      </div>
    </main>
  );
}
