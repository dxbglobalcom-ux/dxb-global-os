import { EntityView } from "@/components/crm/entity-view";

export default function CrmClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ sel?: string; filter?: string; page?: string }>;
}) {
  return <EntityView entity="clients" searchParams={searchParams} />;
}
