import { ChatBoard, type ChatMessage } from "@/components/chat/chat-board";
import { Panel } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// CEO Chat Board (C1/C7/C10, 2026-07-19): conversation with Hamza before any
// dispatch. Server snapshot of the board; the live layer rides dxb:chat
// Broadcast. Answers are produced by the resident chat.drain — this page
// never calls a model (PHASE-08 LOCKED).

export const metadata = { title: "Chat with Hamza — DXB" };

export default async function ChatPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.chat;
  const supabase = await createClient();

  const { data } = await supabase
    .from("chat_messages")
    .select("id, role, content, mode, status, error, intent_id, created_at")
    .order("created_at", { ascending: true })
    .limit(200);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-h1 text-ink-primary">{t.title}</h1>
        <p className="text-body-s text-ink-secondary">{t.subtitle}</p>
      </div>
      <Panel>
        <ChatBoard initial={(data ?? []) as ChatMessage[]} labels={t} lang={locale} />
      </Panel>
    </div>
  );
}
