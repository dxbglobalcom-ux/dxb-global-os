import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Ledger 10d/10e — engine ownership door (REVENUE_ENGINE_SPEC §5 registered
// adaptation 2026-07-24). Gate + audit live in control_engine_set_owner
// (SECURITY DEFINER, CEO-only via fn_org_actor); this handler checks a
// session and validates shape only.
const Body = z.object({
  op: z.literal("set_owner"),
  slug: z.string().min(1).max(80),
  department: z.string().min(1).max(80),
  rationale: z.string().max(500).optional(),
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

  const { data, error } = await supabase.rpc("control_engine_set_owner", {
    p_slug: body.slug,
    p_department: body.department,
    p_rationale: body.rationale ?? null,
  });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
