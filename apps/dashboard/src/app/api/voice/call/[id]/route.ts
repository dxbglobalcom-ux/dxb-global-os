import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Call status projection (VOICE_INTERACTION_SPEC §7/§10): pure read through
// the RLS SELECT policy — the page polls this as the Broadcast fallback and
// fetches the final transcript/timings when voice call.ended arrives.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("voice_calls")
    .select(
      "id,started_at,ended_at,status,transcript,timeline,stt_ms,answer_ms,tts_ms,degraded,cost_eur,target:agents(slug,title,title_tr)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
