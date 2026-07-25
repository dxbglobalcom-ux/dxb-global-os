"use client";

// CEO Chat Board (C1/C7/C10, 2026-07-19) — the CEO's conversation lane with
// Hamza, the orchestrator. Conversation FIRST: greetings, questions, planning.
// Dispatch is an explicit button on a Hamza reply, never implicit. The board
// is a projection: writes go through /api/chat, answers arrive from the
// resident chat.drain over the dxb:chat Broadcast channel.
import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { StatusBadge } from "@/components/primitives";
import { useDxbChannel, type DxbBroadcastPayload } from "@/lib/realtime";

export type ChatMessage = {
  id: string;
  role: "ceo" | "hamza";
  content: string;
  mode: "normal" | "plan";
  status: "pending" | "answered" | "failed";
  error: string | null;
  intent_id: string | null;
  /** U15 round 2 (one-conversation law): voice turns mirror onto the board
   *  tagged 'voice'; absent on legacy rows fetched before the migration */
  source?: "chat" | "voice";
  created_at: string;
};

export type ChatLabels = {
  empty: string;
  placeholder: string;
  send: string;
  planMode: string;
  planModeHint: string;
  dispatch: string;
  dispatched: string;
  thinking: string;
  failed: string;
  you: string;
  hamza: string;
  /** dictation lane (complaint ledger 1a-1e, U15): mic button + honest states */
  dictate: string;
  dictateStop: string;
  dictateRecording: string;
  dictateTranscribing: string;
  dictateCancelHint: string;
  dictateLang: string;
  dictateErrors: Record<string, string>;
  /** U15 round 2: marker on board turns that arrived through the mic */
  voiceTag: string;
};

function mergeMessage(prev: ChatMessage[], next: ChatMessage): ChatMessage[] {
  const idx = prev.findIndex((m) => m.id === next.id);
  if (idx >= 0) {
    const copy = [...prev];
    copy[idx] = next;
    return copy;
  }
  return [...prev, next].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function ChatBoard({
  initial,
  labels,
  lang,
}: {
  initial: ChatMessage[];
  labels: ChatLabels;
  lang: "tr" | "en";
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [draft, setDraft] = useState("");
  const [planMode, setPlanMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [dispatchedIds, setDispatchedIds] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  // Dictation lane (WisprFlow idiom, ledger 1a-1e): click = record, click =
  // stop → /api/chat/dictate (Speaches STT) → text APPENDS to the editable
  // draft. Toggle, not hold — dictating a sentence while thinking is the
  // point; the call line keeps hold-to-talk. Language is an explicit TR|EN
  // picker defaulting to the UI locale, never a silent inherit (lang.ts
  // registered adaptation; U15 block-2 whitelist {tr,en}).
  const [dictPhase, setDictPhase] = useState<"idle" | "recording" | "transcribing">("idle");
  const [dictLang, setDictLang] = useState<"tr" | "en">(lang);
  const [dictError, setDictError] = useState<string | null>(null);
  const [dictSeconds, setDictSeconds] = useState(0);
  const dictRecorderRef = useRef<MediaRecorder | null>(null);
  const dictChunksRef = useRef<Blob[]>([]);
  const dictCancelledRef = useRef(false);
  const dictPhaseRef = useRef<typeof dictPhase>("idle");
  dictPhaseRef.current = dictPhase;

  // WisprFlow cancel idiom: Escape while recording discards the take —
  // nothing is uploaded, nothing lands in the draft.
  useEffect(() => {
    if (dictPhase !== "recording") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      dictCancelledRef.current = true;
      const recorder = dictRecorderRef.current;
      if (recorder && recorder.state === "recording") recorder.stop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dictPhase]);

  // Honest elapsed-seconds counter while recording/transcribing (the U15 D4
  // lesson: silent waiting reads as dead — always show time moving).
  useEffect(() => {
    if (dictPhase === "idle") {
      setDictSeconds(0);
      return;
    }
    const timer = setInterval(() => setDictSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [dictPhase]);

  const transcribe = useCallback(
    async (blob: Blob, mime: string) => {
      setDictPhase("transcribing");
      setDictSeconds(0);
      const form = new FormData();
      const ext = mime.includes("webm") ? "webm" : mime.includes("ogg") ? "ogg" : "wav";
      form.append("audio", new File([blob], `dictation.${ext}`, { type: mime }));
      form.append("lang", dictLang);
      try {
        const res = await fetch("/api/chat/dictate", { method: "POST", body: form });
        const body = (await res.json()) as { text?: string; error?: string };
        const text = body.text;
        if (!res.ok || !text) {
          setDictError(body.error ?? "stt_unavailable");
          return;
        }
        setDraft((prev) => (prev.trim().length > 0 ? `${prev.trimEnd()} ${text}` : text));
      } catch {
        setDictError("stt_unavailable");
      } finally {
        setDictPhase("idle");
      }
    },
    [dictLang],
  );

  const startDictation = useCallback(async () => {
    setDictError(null);
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setDictError("mic_unsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "";
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      dictChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) dictChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (dictCancelledRef.current) {
          setDictPhase("idle");
          return;
        }
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(dictChunksRef.current, { type });
        if (blob.size > 0) void transcribe(blob, type);
        else {
          setDictError("empty_transcript");
          setDictPhase("idle");
        }
      };
      dictRecorderRef.current = recorder;
      dictCancelledRef.current = false;
      recorder.start();
      setDictPhase("recording");
    } catch {
      setDictError("mic_denied");
    }
  }, [transcribe]);

  const toggleDictation = useCallback(() => {
    if (dictPhaseRef.current === "recording") {
      const recorder = dictRecorderRef.current;
      if (recorder && recorder.state === "recording") recorder.stop();
      return;
    }
    if (dictPhaseRef.current === "idle") void startDictation();
  }, [startDictation]);

  const onBroadcast = useCallback((p: DxbBroadcastPayload) => {
    if (!p.record) return;
    const r = p.record as Record<string, unknown>;
    setMessages((prev) =>
      mergeMessage(prev, {
        id: String(r.id),
        role: r.role as "ceo" | "hamza",
        content: String(r.content ?? ""),
        mode: (r.mode as "normal" | "plan") ?? "normal",
        status: (r.status as ChatMessage["status"]) ?? "pending",
        error: (r.error as string) ?? null,
        intent_id: (r.intent_id as string) ?? null,
        source: (r.source as "chat" | "voice") ?? "chat",
        created_at: String(r.created_at ?? new Date().toISOString()),
      }),
    );
  }, []);
  useDxbChannel("chat", onBroadcast);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode: planMode ? "plan" : "normal" }),
      });
      if (res.ok) setDraft("");
    } finally {
      setSending(false);
    }
  }, [draft, planMode, sending]);

  const dispatchAsTask = useCallback(
    async (m: ChatMessage) => {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: m.content.slice(0, 500), lang }),
      });
      if (res.ok) {
        setDispatchedIds((prev) => new Set(prev).add(m.id));
      }
    },
    [lang],
  );

  const waiting = messages.some((m) => m.role === "ceo" && m.status === "pending");

  return (
    <div className="flex h-[calc(100vh-11rem)] min-h-[24rem] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="pt-8 text-center text-body-s text-ink-secondary">{labels.empty}</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "ceo" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "ceo"
                  ? "max-w-[75%] rounded-lg bg-surface-graphite px-4 py-3"
                  : "max-w-[75%] rounded-lg border border-edge-neutral px-4 py-3"
              }
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-caption font-medium text-ink-muted">
                  {m.role === "ceo" ? labels.you : labels.hamza}
                </span>
                {m.source === "voice" && (
                  <span className="flex items-center gap-1 text-caption text-ink-muted">
                    <Mic className="size-3" aria-hidden />
                    {labels.voiceTag}
                  </span>
                )}
                {m.mode === "plan" && <StatusBadge level="info">{labels.planMode}</StatusBadge>}
                {m.role === "ceo" && m.status === "failed" && (
                  <StatusBadge level="danger">{labels.failed}</StatusBadge>
                )}
              </div>
              <p className="whitespace-pre-wrap text-body-s text-ink-primary">{m.content}</p>
              {m.role === "hamza" && (
                <div className="mt-2">
                  {dispatchedIds.has(m.id) || m.intent_id ? (
                    <StatusBadge level="ok">{labels.dispatched}</StatusBadge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void dispatchAsTask(m)}
                      className="text-caption text-accent-champagne underline-offset-2 hover:underline"
                    >
                      {labels.dispatch}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {waiting && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-lg border border-edge-neutral px-4 py-3">
              <p className="animate-pulse text-body-s text-ink-muted">{labels.thinking}</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 space-y-2 border-t border-edge-neutral pt-4">
        <label className="flex w-fit cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={planMode}
            onChange={(e) => setPlanMode(e.target.checked)}
            className="size-4 accent-[var(--accent-champagne,#c8a96a)]"
          />
          <span className="text-body-s text-ink-secondary">{labels.planMode}</span>
          <span className="text-caption text-ink-muted">{labels.planModeHint}</span>
        </label>
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            rows={2}
            placeholder={labels.placeholder}
            className="min-h-[3rem] flex-1 resize-y rounded-md border border-edge-neutral bg-transparent px-3 py-2 text-body-s text-ink-primary outline-none focus:border-accent-champagne"
          />
          <button
            type="button"
            data-testid="chat-dictate"
            aria-pressed={dictPhase === "recording"}
            aria-label={dictPhase === "recording" ? labels.dictateStop : labels.dictate}
            title={dictPhase === "recording" ? labels.dictateStop : labels.dictate}
            disabled={dictPhase === "transcribing"}
            onClick={toggleDictation}
            className={`flex h-10 w-10 items-center justify-center rounded-md border transition duration-[var(--t-fast)] ease-refined disabled:opacity-40 ${
              dictPhase === "recording"
                ? "animate-pulse border-status-danger text-status-danger"
                : "border-edge-champagne text-accent-champagne hover:bg-surface-carbon"
            }`}
          >
            {dictPhase === "recording" ? (
              <Square className="size-4" aria-hidden />
            ) : (
              <Mic className="size-4" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending || draft.trim().length === 0}
            className="h-10 rounded-md bg-accent-champagne px-4 text-body-s font-medium text-surface-obsidian transition disabled:opacity-40"
          >
            {labels.send}
          </button>
        </div>
        <div className="flex min-h-5 flex-wrap items-center gap-3">
          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label={labels.dictateLang}
          >
            {(["tr", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={dictLang === code}
                onClick={() => setDictLang(code)}
                className={`rounded-input border px-2 py-0.5 text-caption uppercase transition duration-[var(--t-fast)] ease-refined ${
                  dictLang === code
                    ? "border-edge-champagne text-accent-champagne"
                    : "border-edge-neutral text-ink-muted hover:text-ink-secondary"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
          {dictPhase === "recording" && (
            <span className="text-caption text-status-danger" role="status">
              {labels.dictateRecording} · {dictSeconds}s · {labels.dictateCancelHint}
            </span>
          )}
          {dictPhase === "transcribing" && (
            <span className="animate-pulse text-caption text-ink-muted" role="status">
              {labels.dictateTranscribing} · {dictSeconds}s
            </span>
          )}
          {dictError && dictPhase === "idle" && (
            <span data-testid="chat-dictate-error" className="text-caption text-status-danger">
              {labels.dictateErrors[dictError] ?? dictError}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
