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
  // W1.5: which conversation this belongs to. `newSession` opens a fresh one
  // ("new conversation"); an explicit id continues a chosen thread; neither
  // means "carry on with the current one", which is what typing normally means.
  sessionId: z.string().uuid().optional(),
  newSession: z.boolean().default(false),
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

  // The session is resolved server-side (fn_chat_session_for_new_message): a
  // client that forgets to send one must never be able to orphan a message, and
  // the idle-gap rule that starts a new thread the next morning belongs next to
  // the data, not in a browser.
  let sessionId = body.sessionId ?? null;
  if (!sessionId) {
    const { data: sess, error: sessErr } = await supabase.rpc(
      "fn_chat_session_for_new_message",
      { p_first_message: body.text, p_new: body.newSession },
    );
    if (sessErr) {
      return NextResponse.json({ error: sessErr.message }, { status: 500 });
    }
    sessionId = sess as unknown as string;
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ role: "ceo", content: body.text, mode: body.mode, session_id: sessionId })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messageId: data.id, sessionId }, { status: 201 });
}

export async function GET(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  // One conversation at a time. Without a session parameter the newest thread
  // is served, which is what an unmodified client asking for "the board" means.
  const url = new URL(request.url);
  let sessionId = url.searchParams.get("sessionId");
  if (!sessionId) {
    const { data: latest } = await supabase
      .from("chat_sessions")
      .select("id")
      .order("last_message_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    sessionId = latest?.id ?? null;
  }

  let query = supabase
    .from("chat_messages")
    .select("id, role, content, mode, status, error, intent_id, source, session_id, created_at")
    .order("created_at", { ascending: true })
    .limit(200);
  if (sessionId) query = query.eq("session_id", sessionId);
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ messages: data ?? [], sessionId });
}
