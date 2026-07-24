import { NextResponse } from "next/server";
import { z } from "zod";
import { berlinDayRangeISO } from "@/lib/costs";
import { createClient } from "@/lib/supabase/server";

// 9c — cost data reset door (C9: "How is it deleted/reset?"). The security
// boundary and the audit trail live in control_cost_reset (SECURITY DEFINER,
// audit_log row per call); this handler checks a session and validates shape.
// preview=true only COUNTS what the cutoff would remove — the two-step UI
// shows the number before the CEO confirms.
const Body = z.object({
  before: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rationale: z.string().max(500).optional(),
  preview: z.boolean().optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  if (body.preview) {
    const { startISO } = berlinDayRangeISO(body.before);
    const { count, error } = await supabase
      .from("cost_ledger")
      .select("id", { count: "exact", head: true })
      .lt("created_at", startISO);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, count: count ?? 0 });
  }

  const { data, error } = await supabase.rpc("control_cost_reset", {
    p_before: body.before,
    p_rationale: body.rationale ?? null,
  });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
