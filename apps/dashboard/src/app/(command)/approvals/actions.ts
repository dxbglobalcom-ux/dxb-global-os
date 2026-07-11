"use server";

// The dashboard's ONLY write path until 08-05 (DASH-05): CEO approval
// decisions via the decide_approvals RPC (migration 0015 — single
// transaction, all-or-nothing, audit row per item). Listed in the purity
// allowlist of tests/phase8/live-projection.test.ts.
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DecisionResult =
  | { ok: true; decided: number }
  | { ok: false; error: string };

export async function decideApprovals(
  ids: string[],
  decision: "approved" | "rejected",
  note?: string,
): Promise<DecisionResult> {
  if (ids.length === 0) return { ok: false, error: "empty" };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { ok: false, error: "unauthenticated" };

  const { data, error } = await supabase.rpc("decide_approvals", {
    p_ids: ids,
    p_decision: decision,
    p_note: note?.trim() ? note.trim() : null,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/approvals");
  return { ok: true, decided: (data as { decided: number }).decided };
}
