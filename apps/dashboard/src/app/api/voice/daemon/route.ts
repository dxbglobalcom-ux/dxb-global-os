import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// JARVIS microphone switch (U15 round 2, ticket 20260725-u15-voice-round2):
// the panel toggle for voice_daemon_state. The security boundary and audit
// trail live in control_voice_daemon_set_state (security definer, audit_log
// row per flip); this handler only checks a session and validates shape.
// The daemon polls the row and obeys within seconds.
const Body = z.object({
  state: z.enum(["listening", "muted"]),
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

  const { data, error } = await supabase.rpc("control_voice_daemon_set_state", {
    p_state: body.state,
    p_actor: "ceo",
    p_note: "panel toggle",
  });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? { ok: true });
}
