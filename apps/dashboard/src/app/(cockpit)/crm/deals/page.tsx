import { EntityView } from "@/components/crm/entity-view";

export default function CrmDealsPage({
  searchParams,
}: {
  searchParams: Promise<{ sel?: string; filter?: string; page?: string }>;
}) {
  return <EntityView entity="deals" searchParams={searchParams} />;
}
