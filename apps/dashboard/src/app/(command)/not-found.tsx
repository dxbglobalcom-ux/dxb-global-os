import Link from "next/link";
import { Panel } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

// E12.3 — (command) 404 surface: an unknown address gets the command-center
// shell + an honest dead-end panel instead of the raw Next default (the
// unstyled 404 was reachable from any mistyped URL — measured 2026-07-18).
export default async function CommandNotFound() {
  const t = getDict(await getLocale()).command.boundary;
  return (
    <div className="mx-auto max-w-2xl pt-10">
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
  );
}
