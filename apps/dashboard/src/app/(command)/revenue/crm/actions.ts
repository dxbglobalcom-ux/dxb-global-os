"use server";

// CRM CEO-edit path (E12.4 command-shell home; DASH-04 heritage): one
// .rpc('crm_update') per edit (migration 0017 DEFINER door: field whitelist
// enforced IN the database, audit row appended in the same transaction).
// Purity-allowlisted in tests/phase8/live-projection.test.ts.
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CRM_EDIT_SCHEMAS, CRM_ENTITIES, type CrmEntity } from "@/lib/crm";

export type CrmUpdateResult = { ok: true } | { ok: false; error: string };

export async function updateCrmEntity(
  entity: CrmEntity,
  id: string,
  fields: Record<string, unknown>,
): Promise<CrmUpdateResult> {
  if (!CRM_ENTITIES.includes(entity)) return { ok: false, error: "unknown_entity" };

  const parsed = CRM_EDIT_SCHEMAS[entity].safeParse(fields);
  if (!parsed.success) return { ok: false, error: "invalid_fields" };
  const clean = Object.fromEntries(
    Object.entries(parsed.data).filter(([, value]) => value !== undefined),
  );
  if (Object.keys(clean).length === 0) return { ok: false, error: "empty" };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { ok: false, error: "unauthenticated" };

  const { error } = await supabase.rpc("crm_update", {
    p_entity: entity,
    p_id: id,
    p_fields: clean,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/revenue/crm/${entity}`);
  return { ok: true };
}
