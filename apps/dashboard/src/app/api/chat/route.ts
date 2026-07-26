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

  // ONE door (`fn_chat_post_message`, migration 20260726006000): the thread and
  // the message are written by a single statement, so a message can never be
  // lost while its conversation survives — which is exactly what the CEO hit on
  // 2026-07-26 (three empty threads titled "selam", not one message). The
  // session rule itself stays next to the data: an explicit id continues that
  // thread, `newSession` opens a fresh one, and a long silence starts one by
  // itself. A browser cannot orphan a message here.
  const { data, error } = await supabase.rpc("fn_chat_post_message", {
    p_text: body.text,
    p_mode: body.mode,
    p_session_id: body.sessionId ?? null,
    p_new: body.newSession,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const posted = data as unknown as { message_id: string; session_id: string };
  return NextResponse.json(
    { messageId: posted.message_id, sessionId: posted.session_id },
    { status: 201 },
  );
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
