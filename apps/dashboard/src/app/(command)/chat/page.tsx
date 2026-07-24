import { ChevronDown } from "lucide-react";
import { ChatBoard, type ChatMessage } from "@/components/chat/chat-board";
import { HelpTip, Panel } from "@/components/primitives";
import { VoiceCall, type DirectorOption, type RecentCallRow } from "@/components/command/voice-call";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// CEO Chat Board (C1/C7/C10, 2026-07-19): conversation with Hamza before any
// dispatch. Server snapshot of the board; the live layer rides dxb:chat
// Broadcast. Answers are produced by the resident chat.drain — this page
// never calls a model (PHASE-08 LOCKED).
//
// Voice merge (complaint ledger 1a-1e, 2026-07-24): the Ask-a-Director call
// line lives HERE now, as a collapsed section under the board (registered
// CEO preference: progressive disclosure — chat first, call line one click
// away). /voice redirects here; the §31 nav row is gone. Dictation is the
// separate WisprFlow lane inside the board's input row.

export const metadata = { title: "Chat with Hamza — DXB" };

type AgentRow = {
  slug: string;
  title: string | null;
  title_tr: string | null;
  department: string;
};

type DeptRow = { slug: string; display_name: string | null; display_name_tr: string | null };

type CallRow = {
  id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  degraded: boolean;
  topic: string | null;
  transcript: Array<{ role?: string; text?: string }>;
  target: { slug: string; title: string | null; title_tr: string | null } | null;
};

export default async function ChatPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.chat;
  const tv = dict.command.voice;
  const supabase = await createClient();

  const [messagesRes, directorsRes, deptsRes, callsRes] = await Promise.all([
    supabase
      .from("chat_messages")
      .select("id, role, content, mode, status, error, intent_id, created_at")
      .order("created_at", { ascending: true })
      .limit(200),
    supabase
      .from("agents")
      .select("slug,title,title_tr,department")
      .eq("role_level", "director")
      .neq("employment_status", "archived")
      .order("department"),
    supabase.from("departments").select("slug,display_name,display_name_tr"),
    supabase
      .from("voice_calls")
      .select("id,status,started_at,ended_at,degraded,topic,transcript,target:agents(slug,title,title_tr)")
      .order("started_at", { ascending: false })
      .limit(6),
  ]);

  // Bilingual purity: department shown by localized display name, never the
  // raw slug (DB text is i18n surface — title_tr/display_name_tr rule).
  const deptName = new Map(
    ((deptsRes.data ?? []) as DeptRow[]).map((d) => [
      d.slug,
      (locale === "tr" ? d.display_name_tr : d.display_name) ?? d.slug,
    ]),
  );
  const directors: DirectorOption[] = ((directorsRes.data ?? []) as AgentRow[]).map((a) => ({
    slug: a.slug,
    label: (locale === "tr" ? a.title_tr : a.title) ?? a.slug,
    department: deptName.get(a.department) ?? a.department,
  }));

  const recent: RecentCallRow[] = ((callsRes.data ?? []) as unknown as CallRow[]).map((c) => ({
    id: c.id,
    status: c.status,
    startedAt: c.started_at,
    targetLabel: c.target
      ? ((locale === "tr" ? c.target.title_tr : c.target.title) ?? c.target.slug)
      : null,
    // Call topic (CEO order 2026-07-19): 2-4 words from the answering brain
    // (voice_calls.topic); legacy rows fall back to the CEO's first sentence.
    // Shortened at the source — never truncated in CSS.
    topic:
      c.topic ??
      (Array.isArray(c.transcript)
        ? c.transcript.find((turn) => turn.role === "ceo" && turn.text)?.text ?? null
        : null)?.slice(0, 120) ??
      null,
    degraded: c.degraded,
    totalMs:
      c.ended_at != null
        ? new Date(c.ended_at).getTime() - new Date(c.started_at).getTime()
        : null,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-h1 text-ink-primary">{t.title} <HelpTip text={dict.help.chat} /></h1>
        <p className="text-body-s text-ink-secondary">{t.subtitle}</p>
      </div>
      <Panel>
        <ChatBoard initial={(messagesRes.data ?? []) as ChatMessage[]} labels={t} lang={locale} />
      </Panel>
      <details className="group">
        <summary
          data-testid="chat-voice-line"
          className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-edge-neutral px-4 py-3 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:text-ink-primary [&::-webkit-details-marker]:hidden"
        >
          <ChevronDown
            className="size-4 shrink-0 transition-transform duration-[var(--t-fast)] group-open:rotate-180"
            aria-hidden
          />
          <span className="font-medium text-ink-primary">{tv.title}</span>
          <span className="text-caption text-ink-muted">{t.voiceLineHint}</span>
        </summary>
        <div className="mt-4">
          <VoiceCall directors={directors} recent={recent} labels={tv} locale={locale} />
        </div>
      </details>
    </div>
  );
}
