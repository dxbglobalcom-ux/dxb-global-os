import { EntityView } from "@/components/crm/entity-view";
import { companyContext } from "@/lib/company";
import { Panel } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export const metadata = { title: "CRM — DXB" };

export default async function Crm_contacts_Page({
  searchParams,
}: {
  searchParams: Promise<{ sel?: string; filter?: string; page?: string }>;
}) {
  const ctx = await companyContext();
  if (!ctx) {
    const dict = getDict(await getLocale());
    return (
      <Panel title={dict.crm.title} state="error">
        <p className="text-body-s text-status-danger">{dict.crm.noCompany}</p>
      </Panel>
    );
  }
  return <EntityView entity="contacts" companyId={ctx.active.id} searchParams={searchParams} />;
}
