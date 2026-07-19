import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { companyContext } from "@/lib/company";
import { CompanySwitch } from "@/components/crm/company-switch";
import { CRM_ENTITIES } from "@/lib/crm";
import { Panel, HelpTip } from "@/components/primitives";

// E12.4 — CRM chrome inside the command shell (GAP-05): title + entity
// sub-nav + the COMPANY SWITCH. The active company is the isolation key:
// every child page scopes its queries to it (EntityView), so the switch
// changes the data universe, not just a label.
export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const dict = getDict(await getLocale());
  const ctx = await companyContext();

  if (!ctx) {
    return (
      <div className="mx-auto max-w-3xl">
        <Panel title={dict.crm.title} state="error">
          <p className="text-body-s text-status-danger">{dict.crm.noCompany}</p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1720px] flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-display text-h1 text-ink-primary">{dict.crm.title} <HelpTip text={dict.help.crm} /></h1>
        <nav className="flex items-center gap-1">
          {CRM_ENTITIES.map((entity) => (
            <Link
              key={entity}
              href={`/revenue/crm/${entity}`}
              className="inline-flex h-8 items-center rounded-input px-3.5 text-caption text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite hover:text-ink-primary"
            >
              {dict.crm.entities[entity]}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="label-caps text-ink-muted">{dict.crm.companyLabel}</span>
          <CompanySwitch active={ctx.active.slug} all={ctx.all} label={dict.crm.companyLabel} />
        </div>
      </div>
      {children}
    </div>
  );
}
