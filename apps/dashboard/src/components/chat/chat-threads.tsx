import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";

// W1.5 — the conversation strip above the board.
//
// The CEO's complaint was that chat had "no new chat concept": one endless list,
// and Hamza's context window was the newest 20 messages whatever they were
// about. Threads fix both — this strip is the navigation half, and the session
// scoping in chat-drain is the half that actually protects the answers.
//
// Deliberately a server component with plain links: switching conversations is a
// read, and a read that the server can do needs no client state, no fetch and no
// spinner. "New conversation" is a link too — the empty board it opens mints its
// session from the first message, so an abandoned draft never leaves a ghost
// thread behind.

export interface ChatSessionRow {
  id: string;
  title: string | null;
  last_message_at: string;
}

export function ChatThreads({
  sessions,
  activeId,
  startingNew,
  labels,
  locale,
}: {
  sessions: ChatSessionRow[];
  activeId: string | null;
  startingNew: boolean;
  labels: {
    threadsTitle: string;
    newThread: string;
    untitledThread: string;
    threadsHint: string;
  };
  locale: "tr" | "en";
}) {
  const when = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "short",
    });

  return (
    <div className="mb-4 border-b border-edge-neutral pb-4">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="label-caps text-caption text-ink-muted">{labels.threadsTitle}</span>
        <span className="text-caption text-ink-muted">{labels.threadsHint}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/chat?new=1"
          data-testid="chat-new-thread"
          aria-current={startingNew ? "page" : undefined}
          className={`inline-flex items-center gap-1.5 rounded-input border px-2.5 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined ${
            startingNew
              ? "border-accent-primary text-ink-primary"
              : "border-edge-neutral text-ink-secondary hover:text-ink-primary"
          }`}
        >
          <MessageSquarePlus size={13} strokeWidth={1.5} aria-hidden />
          {labels.newThread}
        </Link>
        {sessions.map((s) => (
          <Link
            key={s.id}
            href={`/chat?s=${s.id}`}
            aria-current={s.id === activeId ? "page" : undefined}
            className={`inline-flex max-w-[22rem] items-center gap-2 rounded-input border px-2.5 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined ${
              s.id === activeId
                ? "border-accent-primary text-ink-primary"
                : "border-edge-neutral text-ink-secondary hover:text-ink-primary"
            }`}
          >
            {/* The title is the CEO's own opening line, so it is already the
                most recognisable label available — truncate the box, never the
                source (CEO minimalism ruling). */}
            <span className="truncate">{s.title?.trim() || labels.untitledThread}</span>
            <span className="shrink-0 text-caption text-ink-muted tabular-nums">
              {when(s.last_message_at)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
