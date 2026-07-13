import Link from "next/link";

// Governance audit surface tab header (AUDIT_AND_LOGGING_SPEC §7: unified
// stream + "Decision Logs ayrı sekme"). Tabs are links — /gov/audit and
// /gov/decisions stay real routes (CEO_COMMAND_CENTER IA) while reading as
// one surface. Registered interpretation 2, ticket 20260713-e84-audit-surface.

export function GovTabs({
  active,
  labels,
}: {
  active: "trail" | "decisions";
  labels: { trail: string; decisions: string };
}) {
  const base = "rounded-input px-4 py-1.5 text-body-s transition duration-[var(--t-fast)] ease-refined";
  const on = "bg-surface-graphite text-ink-primary border border-edge-neutral";
  const off = "text-ink-muted hover:text-ink-secondary border border-transparent";
  return (
    <nav className="flex gap-1" aria-label="audit-tabs">
      <Link href="/gov/audit" className={`${base} ${active === "trail" ? on : off}`}>
        {labels.trail}
      </Link>
      <Link href="/gov/decisions" className={`${base} ${active === "decisions" ? on : off}`}>
        {labels.decisions}
      </Link>
    </nav>
  );
}
