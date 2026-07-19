"use client";

// /voice call surface (VOICE_INTERACTION_SPEC §7, R3.1) — push-to-talk v1.
// The island owns the browser half only: record → POST intake → follow the
// call over the `voice` Broadcast channel (poll fallback, EVENT_MODEL
// reconnect idiom) → play the answer WAV. Every visible string arrives via
// the dict (i18n purity gate); states are visibly distinct and honest —
// busy, failed and degraded are first-class, never masked (V10/§17).
import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Panel, StatusBadge, type StatusLevel } from "@/components/primitives";
import { useDxbChannel } from "@/lib/realtime";
import type { Locale } from "@/lib/i18n";

export type DirectorOption = {
  slug: string;
  label: string;
  department: string;
};

export type RecentCallRow = {
  id: string;
  status: string;
  startedAt: string;
  targetLabel: string | null;
  degraded: boolean;
  totalMs: number | null;
};

export type VoiceLabels = {
  idleHint: string;
  holdToTalk: string;
  recording: string;
  uploading: string;
  waiting: string;
  speaking: string;
  done: string;
  failedTitle: string;
  busy: string;
  micDenied: string;
  micUnsupported: string;
  youLabel: string;
  askLabel: string;
  hamzaOption: string;
  stop: string;
  playAnswer: string;
  newCall: string;
  degraded: string;
  freeLine: string;
  emptyTranscript: string;
  recentTitle: string;
  recentEmpty: string;
  answerNotReady: string;
  sttMs: string;
  answerMs: string;
  ttsMs: string;
  /** localized voice_calls.status labels — raw DB enums never reach the eye
   *  (bilingual purity gate: DB text is i18n surface too) */
  statuses: Record<string, string>;
  errors: Record<string, string>;
};

type Phase =
  | "idle" | "recording" | "uploading" | "waiting"
  | "speaking" | "done" | "failed" | "busy";

type TranscriptLine = { role: string; text: string; at: string };

type CallStatus = {
  id: string;
  status: string;
  transcript: TranscriptLine[] | null;
  timeline: Array<{ state: string; at: string; reason?: string }> | null;
  stt_ms: number | null;
  answer_ms: number | null;
  tts_ms: number | null;
  degraded: boolean;
  target: { slug: string; title: string | null; title_tr: string | null } | null;
};

type VoiceEvent = { type?: string; id?: string; status?: string; degraded?: boolean };

const PHASE_LEVEL: Record<Phase, StatusLevel> = {
  idle: "info", recording: "warn", uploading: "info", waiting: "info",
  speaking: "ok", done: "ok", failed: "danger", busy: "warn",
};

function errorLabel(labels: VoiceLabels, failure: string | null): string {
  if (!failure) return labels.failedTitle;
  const key = failure.split(":")[0]?.trim() ?? failure;
  return labels.errors[key] ?? failure;
}

function fmtSeconds(ms: number | null): string | null {
  return ms == null ? null : `${(ms / 1000).toFixed(1)}s`;
}

// Call duration for the CEO eye: seconds under a minute, m:ss above.
function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function VoiceCall({
  directors,
  recent,
  labels,
  locale,
}: {
  directors: DirectorOption[];
  recent: RecentCallRow[];
  labels: VoiceLabels;
  locale: Locale;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [target, setTarget] = useState<string>("");
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [failure, setFailure] = useState<string | null>(null);
  const [call, setCall] = useState<CallStatus | null>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const callIdRef = useRef<string | null>(null);
  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;

  const finalize = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/voice/call/${id}`);
      if (!res.ok) return;
      const data = (await res.json()) as CallStatus;
      if (callIdRef.current !== id) return;
      setCall(data);
      if (Array.isArray(data.transcript)) setLines(data.transcript);
      if (data.status === "failed") {
        const reason = data.timeline?.findLast?.((t) => t.reason)?.reason ?? null;
        setFailure(reason);
        setPhase("failed");
        return;
      }
      if (data.status === "ended") {
        const audio = audioRef.current;
        if (audio) {
          audio.src = `/api/voice/call/${id}/audio`;
          setPhase("speaking");
          try {
            await audio.play();
            setAudioBlocked(false);
          } catch {
            // Autoplay refused — honest manual control instead of silence.
            setAudioBlocked(true);
          }
        } else {
          setPhase("done");
        }
      }
    } catch {
      // Poll tick will retry — the fallback loop below owns liveness.
    }
  }, []);

  useDxbChannel<VoiceEvent>("voice", (event) => {
    const id = callIdRef.current;
    if (!id || event.id !== id) return;
    if (event.status === "ended" || event.status === "failed") void finalize(id);
  });

  // Poll fallback while a call is in flight (Broadcast can drop on reconnect).
  useEffect(() => {
    if (phase !== "waiting" && phase !== "uploading") return;
    const timer = setInterval(() => {
      const id = callIdRef.current;
      if (id) void finalize(id);
    }, 5000);
    return () => clearInterval(timer);
  }, [phase, finalize]);

  const send = useCallback(async (blob: Blob, mime: string) => {
    setPhase("uploading");
    const form = new FormData();
    const ext = mime.includes("webm") ? "webm" : mime.includes("ogg") ? "ogg" : "wav";
    form.append("audio", new File([blob], `utterance.${ext}`, { type: mime }));
    form.append("lang", locale);
    if (target) form.append("target", target);
    try {
      const res = await fetch("/api/voice/call", { method: "POST", body: form });
      const body = (await res.json()) as { callId?: string; transcript?: string; error?: string };
      if (body.callId) callIdRef.current = body.callId;
      if (res.status === 409) {
        setPhase("busy");
        return;
      }
      if (!res.ok) {
        setFailure(body.error ?? "intake_failed");
        setPhase("failed");
        return;
      }
      setLines([{ role: "ceo", text: body.transcript ?? "", at: new Date().toISOString() }]);
      setPhase("waiting");
    } catch {
      setFailure("intake_failed");
      setPhase("failed");
    }
  }, [locale, target]);

  const startRecording = useCallback(async () => {
    if (phaseRef.current === "recording") return;
    setMicError(null);
    setFailure(null);
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicError(labels.micUnsupported);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "";
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        if (blob.size > 0 && phaseRef.current === "recording") void send(blob, type);
        else if (phaseRef.current === "recording") setPhase("idle");
      };
      recorderRef.current = recorder;
      recorder.start();
      callIdRef.current = null;
      setCall(null);
      setLines([]);
      setPhase("recording");
    } catch {
      setMicError(labels.micDenied);
    }
  }, [labels.micDenied, labels.micUnsupported, send]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") recorder.stop();
  }, []);

  const interrupt = useCallback(() => {
    // V4: CEO interruption stops playback immediately.
    audioRef.current?.pause();
    setPhase("done");
  }, []);

  const reset = useCallback(() => {
    audioRef.current?.pause();
    callIdRef.current = null;
    setCall(null);
    setLines([]);
    setFailure(null);
    setAudioBlocked(false);
    setPhase("idle");
  }, []);

  const playAnswer = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !callIdRef.current) return;
    if (!audio.src) audio.src = `/api/voice/call/${callIdRef.current}/audio`;
    try {
      await audio.play();
      setAudioBlocked(false);
      setPhase("speaking");
    } catch {
      setAudioBlocked(true);
    }
  }, []);

  const stateLabel: Record<Phase, string> = {
    idle: labels.idleHint,
    recording: labels.recording,
    uploading: labels.uploading,
    waiting: labels.waiting,
    speaking: labels.speaking,
    done: labels.done,
    failed: errorLabel(labels, failure),
    busy: labels.busy,
  };

  const timingChips = [
    [labels.sttMs, fmtSeconds(call?.stt_ms ?? null)],
    [labels.answerMs, fmtSeconds(call?.answer_ms ?? null)],
    [labels.ttsMs, fmtSeconds(call?.tts_ms ?? null)],
  ].filter((entry): entry is [string, string] => entry[1] != null);

  const answering = phase === "recording" || phase === "uploading" || phase === "waiting" || phase === "speaking";

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Panel className="min-w-0">
        <div className="flex flex-col items-center gap-5 py-4">
          {/* live state line — role=status so screen readers follow the call */}
          <div className="flex items-center gap-2" role="status">
            <StatusBadge level={PHASE_LEVEL[phase]}>{stateLabel[phase]}</StatusBadge>
          </div>

          <button
            type="button"
            aria-pressed={phase === "recording"}
            aria-label={labels.holdToTalk}
            disabled={phase === "uploading" || phase === "waiting"}
            onPointerDown={(e) => {
              e.preventDefault();
              void startRecording();
            }}
            onPointerUp={stopRecording}
            onPointerLeave={stopRecording}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault();
                void startRecording();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") stopRecording();
            }}
            className={`flex size-24 items-center justify-center rounded-full border transition duration-[var(--t-fast)] ease-refined disabled:opacity-50 ${
              phase === "recording"
                ? "animate-pulse border-status-danger text-status-danger"
                : "border-edge-champagne text-accent-champagne hover:bg-surface-carbon"
            }`}
          >
            <Mic className="size-9" aria-hidden />
          </button>
          <p className="text-caption text-ink-muted">{labels.holdToTalk}</p>

          <div className="flex w-full max-w-md flex-col gap-2">
            <label className="label-caps text-ink-muted" htmlFor="voice-target">
              {labels.askLabel}
            </label>
            <select
              id="voice-target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={answering}
              className="w-full rounded-input border border-edge-neutral bg-surface-graphite px-3 py-2 text-body-s text-ink-primary disabled:opacity-50"
            >
              <option value="">{labels.hamzaOption}</option>
              {directors.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.label} — {d.department}
                </option>
              ))}
            </select>
          </div>

          {micError && <p className="text-body-s text-status-danger">{micError}</p>}

          <div className="flex flex-wrap items-center justify-center gap-2">
            {phase === "speaking" && (
              <button
                type="button"
                onClick={interrupt}
                className="flex items-center gap-2 rounded-input border border-edge-champagne px-3 py-1 text-body-s text-accent-champagne"
              >
                <Square className="size-3.5" aria-hidden />
                {labels.stop}
              </button>
            )}
            {(phase === "done" || audioBlocked) && callIdRef.current && (
              <button
                type="button"
                onClick={() => void playAnswer()}
                className="rounded-input border border-edge-neutral px-3 py-1 text-body-s text-ink-secondary hover:text-ink-primary"
              >
                {labels.playAnswer}
              </button>
            )}
            {(phase === "done" || phase === "failed" || phase === "busy") && (
              <button
                type="button"
                onClick={reset}
                className="rounded-input border border-edge-neutral px-3 py-1 text-body-s text-ink-secondary hover:text-ink-primary"
              >
                {labels.newCall}
              </button>
            )}
          </div>

          {/* honest supply + cost chips: degraded is shown, never masked */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="label-caps text-accent-brushed">{labels.freeLine}</span>
            {call?.degraded && <StatusBadge level="warn">{labels.degraded}</StatusBadge>}
            {timingChips.map(([label, value]) => (
              <span key={label} className="font-data text-caption text-ink-muted tabular-nums">
                {label} {value}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-2 space-y-3 border-t border-edge-neutral pt-4">
          {lines.length === 0 ? (
            <p className="text-body-s text-ink-muted">{labels.emptyTranscript}</p>
          ) : (
            lines.map((line, i) => (
              <div key={`${line.role}-${i}`} className="grid min-w-0 gap-x-4 gap-y-1 md:grid-cols-[max-content_1fr]">
                <span className={`label-caps self-start ${line.role === "ceo" ? "text-accent-champagne" : "text-ink-muted"}`}>
                  {line.role === "ceo"
                    ? labels.youLabel
                    : (call?.target?.slug === line.role
                        ? (locale === "tr" ? call.target.title_tr : call.target.title) ?? line.role
                        : line.role)}
                </span>
                <p className="min-w-0 whitespace-pre-wrap text-body-s text-ink-primary">{line.text}</p>
              </div>
            ))
          )}
        </div>

        {/* hidden element owns playback; controls are the buttons above */}
        <audio ref={audioRef} onEnded={() => setPhase("done")} className="hidden" />
      </Panel>

      <Panel title={labels.recentTitle} className="min-w-0 self-start">
        {recent.length === 0 ? (
          <p className="text-body-s text-ink-muted">{labels.recentEmpty}</p>
        ) : (
          <ul className="space-y-3">
            {/* Symmetry ruling (CEO 2026-07-19): every row = identical
                two-line geometry — chip pinned left, name after it; second
                line time+duration left, degraded chip pinned right. */}
            {recent.map((row) => (
              <li
                key={row.id}
                className="min-w-0 space-y-1 rounded-input border border-edge-neutral bg-surface-graphite p-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <StatusBadge level={row.status === "ended" ? "ok" : row.status === "failed" ? "danger" : "info"}>
                    {labels.statuses[row.status] ?? row.status}
                  </StatusBadge>
                  {/* target only when informative (A1: no info-free fields) */}
                  {row.targetLabel && (
                    <span className="min-w-0 flex-1 break-words text-body-s text-ink-primary">
                      {row.targetLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-data text-caption text-ink-muted tabular-nums">
                    {new Date(row.startedAt).toLocaleTimeString(locale === "tr" ? "tr-TR" : "en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {row.totalMs != null && ` · ${fmtDuration(row.totalMs)}`}
                  </span>
                  {row.degraded && <StatusBadge level="warn">{labels.degraded}</StatusBadge>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
