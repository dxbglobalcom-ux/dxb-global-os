import Link from "next/link";
import { Mic, Plus } from "lucide-react";

// W1.5 — the conversation list.
//
// The CEO's complaint was that chat had "no new chat concept": one endless list,
// and Hamza's context window was the newest 20 messages whatever they were
// about. Threads fix both — this list is the navigation half, and the session
// scoping in chat-drain is the half that actually protects the answers.
//
// 2026-07-26, CEO on the first version ("eski konuşmalar nerede... design'ı da
// düzeltin"): the first shape was a wall of chips squeezed above the board, so a
// conversation with a hundred messages had the same weight as one greeting, and
// the board below it ran past the bottom of the screen. It is now a column of
// its own — one row per conversation, each carrying its own name and its own
// size, and the board keeps the rest of the height.
//
// Deliberately a server component with plain links: switching conversations is a
// read, and a read the server can do needs no client state, no fetch and no
// spinner. "New conversation" is a link too — the empty board it opens mints its
// session from the first message, so an abandoned draft never leaves a ghost
// thread behind.

export interface ChatSessionRow {
  id: string;
  title: string | null;
  /** W2.6: a thread the SYSTEM named carries both legs; a thread named by the
   *  CEO's own opening line carries his words in both. */
  title_tr: string | null;
  last_message_at: string;
  messages: number;
  has_voice: boolean;
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
    threadMessages: string;
    /** English needs the singular; Turkish uses the same word either way. */
    threadMessageOne: string;
  };
  locale: "tr" | "en";
}) {
  const when = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "short",
    });

  return (
    <aside className="reflection flex min-h-0 flex-col rounded-panel border bg-surface-carbon p-3 shadow-e1 lg:p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="label-caps text-ink-secondary">{labels.threadsTitle}</h2>
        <span className="text-caption tabular-nums text-ink-muted">{sessions.length}</span>
      </div>

      <Link
        href="/chat?new=1"
        data-testid="chat-new-thread"
        aria-current={startingNew ? "page" : undefined}
        className={`mb-3 flex items-center gap-2 rounded-input border px-3 py-2 text-body-s transition duration-[var(--t-fast)] ease-refined ${
          startingNew
            ? "border-edge-champagne bg-surface-graphite text-accent-champagne"
            : "border-edge-neutral text-ink-secondary hover:border-edge-champagne hover:text-ink-primary"
        }`}
      >
        <Plus size={14} strokeWidth={1.5} aria-hidden />
        {labels.newThread}
      </Link>

      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
        {sessions.length === 0 ? (
          <p className="py-2 text-caption text-ink-muted">{labels.threadsHint}</p>
        ) : (
          <ul className="divide-y divide-edge-neutral">
            {sessions.map((s) => {
              const active = s.id === activeId;
              return (
                <li key={s.id}>
                  <Link
                    href={`/chat?s=${s.id}`}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-input px-2 py-2.5 transition duration-[var(--t-fast)] ease-refined ${
                      active
                        ? "bg-surface-graphite"
                        : "hover:bg-surface-graphite/60"
                    }`}
                  >
                    {/* The title is the CEO's own opening line, so it is already
                        the most recognisable label available — the box truncates,
                        the source never does (CEO minimalism ruling). */}
                    <span
                      className={`block truncate text-body-s ${
                        active ? "text-accent-champagne" : "text-ink-primary"
                      }`}
                    >
                      {(locale === "tr" ? s.title_tr : s.title)?.trim() ||
                        s.title?.trim() ||
                        labels.untitledThread}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-caption text-ink-muted">
                      <span className="tabular-nums">
                        {s.messages}{" "}
                        {Number(s.messages) === 1 ? labels.threadMessageOne : labels.threadMessages}
                      </span>
                      <span aria-hidden>·</span>
                      <span className="tabular-nums">{when(s.last_message_at)}</span>
                      {s.has_voice && <Mic size={11} strokeWidth={1.5} aria-hidden />}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-3 border-t border-edge-neutral pt-3 text-caption text-ink-muted">
        {labels.threadsHint}
      </p>
    </aside>
  );
}
