import { redirect } from "next/navigation";

// /revenue/crm — the entity family lands on clients (the parent object).
export default function CrmIndex(): never {
  redirect("/revenue/crm/clients");
}
