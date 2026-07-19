import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// List-hygiene control seam (C4/C18, 2026-07-19): selective/bulk removal of
// terminal rows from CEO lists. The security boundary and the audit trail
// live in the DB fn control_records_purge (security definer, audit_log row
// per call); this handler only checks a session and validates shape.

const Body = z.object({
  entity: z.enum(["task", "alert", "intent"]),
  ids: z.array(z.string().uuid()).min(1).max(500),
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

  const { data, error } = await supabase.rpc("control_records_purge", {
    p_entity: body.entity,
    p_ids: body.ids,
    p_rationale: body.rationale ?? null,
  });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
