// Voice v1 intake half (VOICE_INTERACTION_SPEC §3.1 stages 1-2, §6): the
// dashboard-safe side of the call line — line-busy law (§10), STT, intent
// lineage (V5), and the routing handoff row the scheduler drain answers.
// DELIBERATELY free of SDK/kernel imports: the dashboard is a pure projection
// client (PHASE-08 LOCKED), so this module graph must stay loadable inside
// Next.js without any LLM surface. The answer half lives in answer.ts and
// runs inside the resident scheduler.
import { randomUUID } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { DB } from "@dxb/shared";
import { assertTransition, type CallState, type TimelineEntry } from "./machine.js";
import { detectLang, unsupportedScript } from "./lang.js";
import { logCall } from "./log.js";
import { sttTranscribe, speachesConfig, type SpeachesConfig } from "./speaches.js";

/** §10 line-busy law: one active call per CEO session. The window bounds the
 *  damage of a crashed intake (a row stuck in listening/transcribing) — after
 *  it, the line frees itself and the stale row is swept by the drain. */
export const LINE_BUSY_WINDOW_MINUTES = 3;

export interface VoiceIntakeDeps {
  db: Kysely<DB>;
  stt?: typeof sttTranscribe;
  speaches?: SpeachesConfig;
}

export interface VoiceIntakeInput {
  audio: Buffer;
  /** caller's UI locale — a last-resort TIE-BREAK for language detection,
   *  NEVER forced into STT (registered adaptation 2026-07-17: forcing the
   *  dashboard locale made Whisper transcribe TR speech as fluent EN) */
  lang?: "tr" | "en";
  /** original upload name — Speaches sniffs the container format from it
   *  (browser MediaRecorder sends webm/opus, proofs send wav) */
  filename?: string;
  /** explicit director pick; omitted → the answer half routes (Hamza law) */
  targetSlug?: string;
}

export interface VoiceIntakeResult {
  callId: string;
  state: CallState;
  busy: boolean;
  transcript: string;
  intentId: string | null;
  targetSlug: string | null;
  sttMs: number | null;
  failure: string | null;
}

/** Stages 1-2 of the call: busy check → STT → intent → 'routing' handoff row.
 *  Returns with the call parked in status='routing'; the scheduler's
 *  voice.drain picks it up from there (or runVoiceCall answers it inline). */
export async function intakeVoiceCall(
  deps: VoiceIntakeDeps,
  input: VoiceIntakeInput,
): Promise<VoiceIntakeResult> {
  const db = deps.db;
  const stt = deps.stt ?? sttTranscribe;
  const cfg = deps.speaches ?? speachesConfig();

  const callId = randomUUID();
  const timeline: TimelineEntry[] = [];
  let state: CallState = "idle";
  const step = (to: CallState, reason?: string) => {
    assertTransition(state, to);
    state = to;
    timeline.push({ state: to, at: new Date().toISOString(), ...(reason ? { reason } : {}) });
  };

  const result: VoiceIntakeResult = {
    callId, state, busy: false, transcript: "",
    intentId: null, targetSlug: input.targetSlug ?? null, sttMs: null, failure: null,
  };

  const fail = async (reason: string): Promise<VoiceIntakeResult> => {
    state = "failed";
    timeline.push({ state: "failed", at: new Date().toISOString(), reason });
    result.state = state;
    result.failure = reason;
    await logCall(db, {
      id: callId, status: "failed", timeline,
      transcript: result.transcript
        ? [{ role: "ceo", text: result.transcript, at: new Date().toISOString() }]
        : [],
      stt_ms: result.sttMs,
    });
    return result;
  };

  // 0a. U15 D3 stale takeover (2026-07-25): listening/transcribing are
  //     millisecond-scale states inside ONE intake process — a row still
  //     sitting there after 60s is a corpse from a crashed intake. The
  //     measured 2026-07-17 defect: the CEO's FIRST press of the day was
  //     rejected line_busy by exactly such a corpse. Corpses fail honestly
  //     (reasoned timeline entry through the one write seam) BEFORE the busy
  //     check, so the line is never blocked by a dead process. Live calls
  //     (routing/answering, or younger than 60s) are untouched — §10 intact.
  const corpses = await sql<{ id: string; timeline: unknown }>`
    SELECT id, timeline FROM voice_calls
    WHERE status IN ('listening','transcribing')
      AND started_at < now() - interval '60 seconds'
  `.execute(db);
  for (const corpse of corpses.rows) {
    const corpseTimeline = (Array.isArray(corpse.timeline) ? corpse.timeline : []) as TimelineEntry[];
    corpseTimeline.push({ state: "failed", at: new Date().toISOString(), reason: "stale_takeover" });
    await logCall(db, { id: corpse.id, status: "failed", timeline: corpseTimeline });
  }

  // 0. Line-busy law (§10): one active call, window-bounded. Single-CEO v1 —
  //    the check-then-insert race needs no lock (one human, one line).
  const busyRes = await sql<{ n: number }>`
    SELECT count(*)::int AS n FROM voice_calls
    WHERE status NOT IN ('ended','failed')
      AND started_at > now() - make_interval(mins => ${LINE_BUSY_WINDOW_MINUTES})
  `.execute(db);
  if ((busyRes.rows[0]?.n ?? 0) > 0) {
    result.busy = true;
    return fail("line_busy");
  }

  step("listening");
  await logCall(db, { id: callId, status: "listening", timeline });

  // 1. STT (§17: empty transcript → one retry → honest failure, never a guess).
  //    Whisper runs in AUTO-DETECT — no language is ever forced (the CEO may
  //    speak TR at an EN dashboard); the utterance language is read from the
  //    transcript afterwards.
  step("transcribing");
  const sttStart = Date.now();
  let transcript = "";
  try {
    const sttOpts = { config: cfg, ...(input.filename ? { filename: input.filename } : {}) };
    transcript = await stt(input.audio, sttOpts);
    if (!transcript) transcript = await stt(input.audio, sttOpts);
  } catch (e) {
    return fail(`stt_error: ${(e as Error).message.slice(0, 200)}`);
  }
  result.sttMs = Date.now() - sttStart;
  if (!transcript) return fail("empty_transcript");
  result.transcript = transcript;
  // U15 D2: {tr,en} whitelist at the script level — a transcript dominated by
  // non-Latin letters (measured live: Korean, call b3858c42) is rejected for
  // a spoken re-ask; it must never become an intent or a task.
  if (unsupportedScript(transcript)) return fail("language_unsupported");
  const lang = detectLang(transcript, input.lang);

  // 2. Intent lineage (V5): the SAME intake seam as the typed command bar.
  const intent = await db
    .insertInto("intents")
    .values({ text: transcript.slice(0, 500), lang, source: "voice", actor: "ceo" })
    .returning("id")
    .executeTakeFirst();
  result.intentId = intent?.id ?? null;

  // Explicit director pick resolves NOW (pure SQL); Hamza-routing (classify,
  // an LLM surface) belongs to the answer half by constitution.
  if (input.targetSlug) {
    const target = await db
      .selectFrom("agents")
      .select("slug")
      .where("slug", "=", input.targetSlug)
      .where("employment_status", "<>", "archived")
      .executeTakeFirst();
    if (!target) return fail(`target_not_found: ${input.targetSlug}`);
  }

  // 3. Handoff: park in 'routing' — the scheduler drain (voice.drain) or the
  //    inline caller walks routing → … → ended from here.
  step("routing");
  result.state = state;
  await logCall(db, {
    id: callId, status: "routing",
    ...(input.targetSlug ? { target_agent_slug: input.targetSlug } : {}),
    transcript: [{
      role: "ceo", text: transcript, at: new Date().toISOString(),
      intent_id: result.intentId, lang,
    }],
    timeline, stt_ms: result.sttMs,
  });
  return result;
}
