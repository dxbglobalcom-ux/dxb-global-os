import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { getDict } from "@/lib/i18n";

// Cockpit empty-state shell (08-01): real exception-first panels arrive in
// 08-02. Until live data is wired there is exactly one honest thing to say —
// the "Kapı temiz" scene (UI-SPEC §4 EmptyState).
export default function CockpitPage() {
  const dict = getDict();
  return (
    <section
      className="rounded-[1.25rem] border border-line bg-surface p-1.5"
      style={{ boxShadow: "0 24px 48px -24px oklch(0.1 0.02 80 / 0.55)" }}
    >
      <div
        className="flex min-h-[50dvh] flex-col items-center justify-center gap-3 rounded-[calc(1.25rem-0.375rem)] bg-surface-2 px-6 py-16 text-center"
        style={{ boxShadow: "inset 0 1px 0 var(--edge-light)" }}
      >
        <CheckCircleIcon size={24} className="text-ok" aria-hidden />
        <h1 className="text-page-title text-ink">{dict.cockpit.emptyTitle}</h1>
        <p className="max-w-[42ch] text-body text-ink-2">{dict.cockpit.emptyBody}</p>
        <Link
          href="/approvals"
          className="mt-3 inline-flex h-10 items-center rounded-full border border-line px-5 text-body text-ink transition-colors duration-[var(--dur-fast)] hover:bg-surface-3"
        >
          {dict.cockpit.emptyAction}
        </Link>
      </div>
    </section>
  );
}
