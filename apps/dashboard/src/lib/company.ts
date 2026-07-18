import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// E12.4 — multi-company context (GAP-05). The active company is a UI
// preference (cookie, same class as dxb-locale): every CRM surface reads
// it and scopes its queries; drill-down links carry it implicitly. The
// DEFAULT is the holding itself (oldest active company — the same rule
// fn_default_company_id() enforces at the data layer).

export const COMPANY_COOKIE = "dxb-company";

export interface ActiveCompany {
  id: string;
  slug: string;
  name: string;
}

export interface CompanyContext {
  active: ActiveCompany;
  all: ActiveCompany[];
}

/** Resolve the active company + the switchable set. A stale cookie (slug
 *  no longer active) silently falls back to the holding default. */
export async function companyContext(): Promise<CompanyContext | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("id, slug, name")
    .eq("status", "active")
    .order("created_at", { ascending: true });
  const all = (data ?? []) as ActiveCompany[];
  if (all.length === 0) return null;

  const store = await cookies();
  const wanted = store.get(COMPANY_COOKIE)?.value;
  const active = all.find((c) => c.slug === wanted) ?? all[0];
  return { active, all };
}
