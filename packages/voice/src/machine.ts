// Voice call state machine (VOICE_INTERACTION_SPEC §10) — shared by the
// intake half (dashboard-safe) and the answer half (scheduler-side). Kept
// dependency-free on purpose: the dashboard bundle imports this module and
// must never pull SDK/kernel code through it (PHASE-08 LOCKED).
export type CallState =
  | "idle" | "listening" | "transcribing" | "routing"
  | "answering" | "speaking" | "ended" | "failed";

const LEGAL: Record<CallState, CallState[]> = {
  idle: ["listening"],
  listening: ["transcribing", "failed"],
  transcribing: ["routing", "failed"],
  routing: ["answering", "failed"],
  answering: ["speaking", "failed"],
  speaking: ["ended", "failed"],
  ended: [],
  failed: [],
};

export function assertTransition(from: CallState, to: CallState): void {
  if (!LEGAL[from]?.includes(to)) {
    throw new Error(`voice call: illegal transition ${from} → ${to}`);
  }
}

/** One voice_calls.timeline entry; `reason` carries honest failure detail
 *  (line_busy, stale_timeout, stt_error …) — the table has no reason column
 *  by design, the timeline IS the audit trail (spec §10). */
export type TimelineEntry = { state: CallState; at: string; reason?: string };
