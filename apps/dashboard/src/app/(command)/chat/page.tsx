import { ChevronDown } from "lucide-react";
import { ChatBoard, type ChatMessage } from "@/components/chat/chat-board";
import { HelpTip, Panel } from "@/components/primitives";
import { DaemonToggle } from "@/components/command/daemon-toggle";
import { VoiceCall, type DirectorOption, type RecentCallRow } from "@/components/command/voice-call";
import { ChatThreads } from "@/components/chat/chat-threads";
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
  session_id: string | null;
  transcript: Array<{ role?: string; text?: string }>;
  target: { slug: string; title: string | null; title_tr: string | null } | null;
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string; new?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.chat;
  const tv = dict.command.voice;
  const supabase = await createClient();

  // W1.5 — one conversation at a time. ?new=1 opens an empty board whose first
  // message will mint a fresh thread; ?s=<id> opens a chosen one; neither means
  // "the current conversation", which is what walking up to the board means.
  const startingNew = params.new === "1";
  // v_chat_threads (migration 20260726007000) carries what a list of
  // conversations has to answer: what it was called, how big it was, when it
  // last moved. An untitled thread borrows the CEO's own opening line rather
  // than wearing a generic label.
  const sessionsRes = await supabase
    .from("v_chat_threads")
    .select("id, title, last_message_at, messages, has_voice")
    .order("last_message_at", { ascending: false })
    .limit(30);
  const sessions = (sessionsRes.data ?? []) as Array<{
    id: string;
    title: string | null;
    last_message_at: string;
    messages: number;
    has_voice: boolean;
  }>;
  const activeSessionId = startingNew ? null : (params.s ?? sessions[0]?.id ?? null);

  const [messagesRes, directorsRes, deptsRes, callsRes, daemonRes] = await Promise.all([
    activeSessionId
      ? supabase
          .from("chat_messages")
          .select("id, role, content, mode, status, error, intent_id, source, created_at")
          .eq("session_id", activeSessionId)
          .order("created_at", { ascending: true })
          .limit(200)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("agents")
      .select("slug,title,title_tr,department")
      .eq("role_level", "director")
      .neq("employment_status", "archived")
      .order("department"),
    supabase.from("departments").select("slug,display_name,display_name_tr"),
    supabase
      .from("voice_calls")
      .select("id,status,started_at,ended_at,degraded,topic,session_id,transcript,target:agents(slug,title,title_tr)")
      .order("started_at", { ascending: false })
      .limit(18),
    supabase.from("voice_daemon_state").select("state").limit(1).maybeSingle(),
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

  // Call topic (CEO order 2026-07-19): 2-4 words from the answering brain
  // (voice_calls.topic); legacy rows fall back to the CEO's first sentence.
  // Shortened at the source — never truncated in CSS.
  const callTopic = (c: CallRow): string | null =>
    c.topic ??
    (Array.isArray(c.transcript)
      ? c.transcript.find((turn) => turn.role === "ceo" && turn.text)?.text ?? null
      : null)?.slice(0, 120) ??
    null;
  const callMs = (c: CallRow): number | null =>
    c.ended_at != null
      ? new Date(c.ended_at).getTime() - new Date(c.started_at).getTime()
      : null;

  // U15 D13 (CEO order "konu konu kaydolmalı"): calls sharing a session_id
  // are ONE conversation thread — one list row, topic from its first answered
  // call, duration summed. Sessionless calls (push-to-talk, legacy) stay
  // single rows. Newest-first order is inherited from the query.
  const recent: RecentCallRow[] = [];
  const threadIndex = new Map<string, RecentCallRow>();
  for (const c of (callsRes.data ?? []) as unknown as CallRow[]) {
    if (recent.length >= 6 && !(c.session_id && threadIndex.has(c.session_id))) continue;
    const targetLabel = c.target
      ? ((locale === "tr" ? c.target.title_tr : c.target.title) ?? c.target.slug)
      : null;
    const existing = c.session_id ? threadIndex.get(c.session_id) : undefined;
    if (existing) {
      existing.ids.push(c.id);
      existing.turns += 1;
      // the query walks newest→oldest: the OLDEST call opens the thread —
      // its start time and topic win
      existing.startedAt = c.started_at;
      existing.topic = callTopic(c) ?? existing.topic;
      existing.totalMs = (existing.totalMs ?? 0) + (callMs(c) ?? 0);
      existing.degraded = existing.degraded || c.degraded;
      continue;
    }
    const row: RecentCallRow = {
      id: c.id,
      ids: [c.id],
      turns: 1,
      status: c.status,
      startedAt: c.started_at,
      targetLabel,
      topic: callTopic(c),
      degraded: c.degraded,
      totalMs: callMs(c),
    };
    recent.push(row);
    if (c.session_id) threadIndex.set(c.session_id, row);
  }

  const daemonState: "listening" | "muted" =
    (daemonRes.data as { state?: string } | null)?.state === "muted" ? "muted" : "listening";

  return (
    // The page owns exactly the height the shell gives it, and nothing more:
    // the conversation list and the board each scroll inside themselves, so the
    // one thing the CEO always needs — the box he types in — is on screen
    // without scrolling for it. Before this, the composer sat below the fold at
    // 1366×900 and the middle of the page was 600px of nothing.
    <div className="mx-auto flex h-full min-h-[38rem] max-w-[110rem] flex-col gap-5">
      <div>
        <h1 className="font-display text-h1 text-ink-primary">{t.title} <HelpTip text={dict.help.chat} /></h1>
        <p className="text-body-s text-ink-secondary">{t.subtitle}</p>
      </div>
      {/* min-h floor: if a future sibling grows, the grid pushes the page tall
          (main scrolls) instead of being crushed under its own content. */}
      <div className="grid min-h-[12rem] flex-1 gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <ChatThreads
          sessions={sessions}
          activeId={activeSessionId}
          startingNew={startingNew}
          labels={t}
          locale={locale}
        />
        <Panel className="flex min-h-0 flex-col">
          {/* The board keeps its messages in client state, and switching
              conversation is a soft navigation — React would keep the SAME
              instance alive and, with it, the previous thread's messages. That
              is what the CEO saw on 2026-07-26: "yeni konuşma" opened with the
              old conversation still on screen. Keying by conversation makes
              each thread its own board. */}
          <ChatBoard
            key={startingNew ? "new" : (activeSessionId ?? "empty")}
            initial={(messagesRes.data ?? []) as ChatMessage[]}
            labels={t}
            lang={locale}
            sessionId={activeSessionId}
            startingNew={startingNew}
          />
        </Panel>
      </div>
      {/* U31: the call line is ~900px tall when open, and this column's height
          is fixed — so the open panel must SHARE the column as its own
          scrollable region. As a plain shrink-0 block it seized the height and
          crushed the conversation grid to 42px, spilling board and thread list
          across itself (CEO screenshot 2026-07-26). The bound sits on the
          content div, not on <details> flex — Chromium slots the content, so a
          flex chain through <details> does not reach it. */}
      <details className="group shrink-0">
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
          <DaemonToggle state={daemonState} labels={tv} />
        </summary>
        {/* The cap is the REMAINDER of the viewport after the shell bar, page
            header, grid minimum and this bar (~38rem together) — a plain vh
            fraction crushed the grid at windowed heights (1280×800 probe). */}
        <div className="mt-4 max-h-[clamp(12rem,100vh_-_38rem,34rem)] overflow-y-auto pr-1">
          <VoiceCall directors={directors} recent={recent} labels={tv} locale={locale} />
        </div>
      </details>
    </div>
  );
}
