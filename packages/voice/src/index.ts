// @dxb/voice — v1 call line (VOICE_INTERACTION_SPEC, roadmap R3.1).
// Two halves, one law: intake (dashboard-safe, no SDK) + answer (scheduler).
// The dashboard imports ONLY the "./intake" subpath — this root export pulls
// the SDK surface and belongs to worker-side consumers.
export const OWNER = "voice" as const;

export { sttTranscribe, ttsSpeak, speachesConfig } from "./speaches.js";
export type { SpeachesConfig } from "./speaches.js";
export { assertTransition } from "./machine.js";
export type { CallState, TimelineEntry } from "./machine.js";
export { intakeVoiceCall, LINE_BUSY_WINDOW_MINUTES } from "./intake.js";
export type { VoiceIntakeDeps, VoiceIntakeInput, VoiceIntakeResult } from "./intake.js";
export { answerVoiceCall } from "./answer.js";
export { loadPersonaBody } from "./persona.js";
// prompt-core owns the standing instruction layer both answer lanes carry, and the one
// definition of the orchestrator's slug (context architecture, 2026-07-30).
export {
  HAMZA_SLUG,
  standingPrompt,
  identityLine,
  personaBlock,
  memoryBlock,
  ceoLanguageLaw,
  honestyLine,
  approvalGateLine,
  languageLine,
  noRefusalLaw,
} from "./prompt-core.js";
export type { AnswerLane } from "./prompt-core.js";
export type { AnswerQuestion, VoiceAnswerDeps, VoiceAnswerResult } from "./answer.js";
export { drainVoiceCalls, STALE_CALL_MINUTES, AUDIO_RETENTION_HOURS } from "./drain.js";
export type { DrainVoiceDeps, DrainVoiceResult } from "./drain.js";
export { runVoiceCall } from "./call.js";
export type { VoiceCallDeps, VoiceCallInput, VoiceCallResult } from "./call.js";
export { voiceAudioDir, repoRootFromCwd } from "./paths.js";
// U15 round 2: wake/dismiss + daemon-control matchers (chat lane imports
// matchMute/matchUnmute — pure string fns, SDK-free).
export { matchWake, matchDismiss, matchHardOff, matchMute, matchUnmute, normalizeTr } from "./wake.js";
