import { redirect } from "next/navigation";

// /crm root: clients is the primary entity view.
export default function CrmIndexPage() {
  redirect("/crm/clients");
}
