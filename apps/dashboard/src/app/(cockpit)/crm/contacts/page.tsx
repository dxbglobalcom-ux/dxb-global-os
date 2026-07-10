import { EntityView } from "@/components/crm/entity-view";

export default function CrmContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ sel?: string; filter?: string; page?: string }>;
}) {
  return <EntityView entity="contacts" searchParams={searchParams} />;
}
