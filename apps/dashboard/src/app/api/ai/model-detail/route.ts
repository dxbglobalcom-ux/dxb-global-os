import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// ModelDetailDrawer lazy read (E7.2 — MODEL_ROUTING_SPEC §5): assigned
// employees + the model's recent routing decisions. Loaded on drawer open
// only — the catalog table itself rides one v_model_stats pass (RSC).

const Query = z.object({ id: z.string().min(1).max(120) });

export async function GET(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ ok: false, error: "PERMISSION_DENIED" }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsed = Query.safeParse({ id: url.searchParams.get("id") });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_FAILED", detail: "id required" },
      { status: 400 },
    );
  }
  const modelId = parsed.data.id;

  const [employees, decisions] = await Promise.all([
    supabase
      .from("agents")
      .select("slug, title, title_tr, department")
      .eq("brain", modelId)
      .neq("employment_status", "archived")
      .order("slug")
      .limit(50),
    supabase
      .from("decision_log")
      .select("id, decision, rationale, outcome, created_at")
      .in("decision", ["routing_decision", "routing_fallback", "routing_change"])
      .ilike("rationale", `%${modelId}%`)
      .order("id", { ascending: false })
      .limit(10),
  ]);

  if (employees.error || decisions.error) {
    return NextResponse.json(
      {
        ok: false,
        error: "VALIDATION_FAILED",
        detail: employees.error?.message ?? decisions.error?.message,
      },
      { status: 400 },
    );
  }
  return NextResponse.json({
    ok: true,
    employees: employees.data ?? [],
    decisions: decisions.data ?? [],
  });
}
