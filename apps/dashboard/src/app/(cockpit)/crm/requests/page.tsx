import { EntityView } from "@/components/crm/entity-view";

export default function CrmRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ sel?: string; filter?: string; page?: string }>;
}) {
  return <EntityView entity="requests" searchParams={searchParams} />;
}
