import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// RoutingSimulator seam (E7.2 — MODEL_ROUTING_SPEC §5): "which model would
// this task get?" Runs fn_select_model with p_log=false — a simulation must
// NEVER write decision_log (only real routing decisions are logged; fake
// entries would poison the §14 "why this model?" trail).

const Query = z.object({
  roleSlot: z.string().min(1).max(40),
  departmentId: z.string().uuid().nullable().optional(),
  risk: z.enum(["low", "medium", "high", "critical"]).default("low"),
  minContext: z.number().int().positive().nullable().optional(),
  estCostEur: z.number().nonnegative().nullable().optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ ok: false, error: "PERMISSION_DENIED" }, { status: 401 });
  }

  let q: z.infer<typeof Query>;
  try {
    q = Query.parse(await request.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_FAILED", detail: "invalid body" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.rpc("fn_select_model", {
    p_role_slot: q.roleSlot,
    p_department_id: q.departmentId ?? null,
    p_risk: q.risk,
    p_min_context: q.minContext ?? null,
    p_est_cost: q.estCostEur ?? null,
    p_run_id: null,
    p_critical: false,
    p_log: false,
  });
  if (error) {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_FAILED", detail: error.message },
      { status: 400 },
    );
  }
  return NextResponse.json(data);
}
