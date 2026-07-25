import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// CEO Chat Board seam (C1/C7/C10, 2026-07-19): the dashboard writes the
// CEO's message row and READS the board — nothing else. The answer half
// runs in the resident scheduler (chat.drain), because the dashboard is a
// projection client (PHASE-08 LOCKED: no LLM surface here). Dispatch to
// the company happens only through the explicit /api/intent action, linked
// back via chat_messages.intent_id.
const ChatBody = z.object({
  text: z.string().trim().min(1).max(4000),
  mode: z.enum(["normal", "plan"]).default("normal"),
});

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: z.infer<typeof ChatBody>;
  try {
    body = ChatBody.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ role: "ceo", content: body.text, mode: body.mode })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messageId: data.id }, { status: 201 });
}

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, mode, status, error, intent_id, source, created_at")
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ messages: data ?? [] });
}
