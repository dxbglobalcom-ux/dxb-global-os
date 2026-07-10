import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { CRM_ENTITIES } from "@/lib/crm";

// CRM section chrome (DASH-04): page title + entity sub-nav. DENSITY 5 —
// the tables carry the weight, chrome stays quiet.
export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const dict = getDict();
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-page-title text-ink">{dict.crm.title}</h1>
        <nav className="flex items-center gap-1">
          {CRM_ENTITIES.map((entity) => (
            <Link
              key={entity}
              href={`/crm/${entity}`}
              className="inline-flex h-8 items-center rounded-full px-3.5 text-micro font-medium text-ink-2 transition-colors duration-[var(--dur-fast)] hover:text-ink aria-[current=page]:bg-surface-3 aria-[current=page]:text-ink"
            >
              {dict.crm.entities[entity]}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
