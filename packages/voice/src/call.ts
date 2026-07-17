// Voice v1 call line (VOICE_INTERACTION_SPEC §3.1/§10) — composition of the
// two halves for direct callers (tests, CLI proofs, future JARVIS client):
// one utterance in, one spoken answer out, the SAME code paths production
// uses (intake.ts + answer.ts), only without the scheduler hop in between.
// THIN by contract (§5): business logic stays in kernel/orchestrator.
import type { Kysely } from "kysely";
import type { DB } from "@dxb/shared";
import { sttTranscribe, ttsSpeak, type SpeachesConfig } from "./speaches.js";
import type { CallState } from "./machine.js";
import { intakeVoiceCall } from "./intake.js";
import { answerVoiceCall, type AnswerQuestion } from "./answer.js";

export interface VoiceCallInput {
  audio: Buffer;
  lang?: "tr" | "en";
  filename?: string;
  /** explicit director pick; omitted → Hamza routes (or answers himself) */
  targetSlug?: string;
}

export interface VoiceCallDeps {
  db: Kysely<DB>;
  stt?: typeof sttTranscribe;
  tts?: typeof ttsSpeak;
  answer?: (q: AnswerQuestion) => Promise<string>;
  speaches?: SpeachesConfig;
  repoRoot?: string;
  /** answer WAV handoff dir; omitted = in-memory only (tests, proofs) */
  audioDir?: string | null;
}

export interface VoiceCallResult {
  callId: string;
  state: CallState;
  transcript: string;
  intentId: string | null;
  targetSlug: string | null;
  answerText: string | null;
  answerAudio: Buffer | null;
  degraded: boolean;
  timings: { stt_ms: number | null; answer_ms: number | null; tts_ms: number | null };
  failure: string | null;
}

/** The v1 call, inline: intake stages then answer stages in one process.
 *  Every stage lands in voice_calls via the control seam; failures are
 *  honest states, never fakes (V10). */
export async function runVoiceCall(deps: VoiceCallDeps, input: VoiceCallInput): Promise<VoiceCallResult> {
  const intake = await intakeVoiceCall(
    {
      db: deps.db,
      ...(deps.stt ? { stt: deps.stt } : {}),
      ...(deps.speaches ? { speaches: deps.speaches } : {}),
    },
    input,
  );

  const result: VoiceCallResult = {
    callId: intake.callId, state: intake.state, transcript: intake.transcript,
    intentId: intake.intentId, targetSlug: intake.targetSlug,
    answerText: null, answerAudio: null, degraded: false,
    timings: { stt_ms: intake.sttMs, answer_ms: null, tts_ms: null },
    failure: intake.failure,
  };
  if (intake.state !== "routing") return result; // busy or failed — honest exit

  const answered = await answerVoiceCall(
    {
      db: deps.db,
      ...(deps.tts ? { tts: deps.tts } : {}),
      ...(deps.answer ? { answer: deps.answer } : {}),
      ...(deps.speaches ? { speaches: deps.speaches } : {}),
      ...(deps.repoRoot ? { repoRoot: deps.repoRoot } : {}),
      audioDir: deps.audioDir ?? null,
    },
    { callId: intake.callId },
  );
  result.state = answered.state;
  result.targetSlug = answered.targetSlug ?? result.targetSlug;
  result.answerText = answered.answerText;
  result.answerAudio = answered.answerAudio;
  result.degraded = answered.degraded;
  result.timings.answer_ms = answered.timings.answer_ms;
  result.timings.tts_ms = answered.timings.tts_ms;
  result.failure = answered.skipped ? `claim_lost: ${answered.skipped}` : answered.failure;
  return result;
}
