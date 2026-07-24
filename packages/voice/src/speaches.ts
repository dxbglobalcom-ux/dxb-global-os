// Speaches client — the €0 STT/TTS backbone (VOICE_INTERACTION_SPEC §0/§3.2).
// OpenAI-compatible endpoints on the self-hosted container; no audio ever
// leaves own hardware (V9). Models are DATA (env-tunable), measured on X230
// 2026-07-17: faster-whisper-small = correct TR but ~13s for a 5s utterance;
// faster-whisper-base ≈ 5s but degrades TR ("Finans"→"Filanc"). Quality wins
// (token-discipline rule: quality may never drop) — small stays the default;
// the VPS re-measure is the recorded path to the ≤2s target.

export interface SpeachesConfig {
  baseUrl: string;
  sttModel: string;
  ttsModel: string;
  ttsVoice: string;
  /** language-default voices — the answer is spoken in the utterance language
   *  (spec §27), so every supported language needs a phoneme-correct voice.
   *  Measured defect 2026-07-17: EN answer through the TR piper voice was
   *  unintelligible to the CEO's ear. */
  ttsModelEn: string;
  ttsVoiceEn: string;
}

export function speachesConfig(env: NodeJS.ProcessEnv = process.env): SpeachesConfig {
  return {
    baseUrl: env.DXB_SPEACHES_URL ?? "http://127.0.0.1:8969",
    sttModel: env.DXB_STT_MODEL ?? "Systran/faster-whisper-small",
    ttsModel: env.DXB_TTS_MODEL ?? "speaches-ai/piper-tr_TR-fahrettin-medium",
    ttsVoice: env.DXB_TTS_VOICE ?? "tr_TR-fahrettin-medium",
    ttsModelEn: env.DXB_TTS_MODEL_EN ?? "speaches-ai/piper-en_US-lessac-medium",
    ttsVoiceEn: env.DXB_TTS_VOICE_EN ?? "en_US-lessac-medium",
  };
}

/** The (model, voice) pair whose phonemes match the answer language. */
export function ttsForLang(cfg: SpeachesConfig, lang: "tr" | "en"): { model: string; voice: string } {
  return lang === "en"
    ? { model: cfg.ttsModelEn, voice: cfg.ttsVoiceEn }
    : { model: cfg.ttsModel, voice: cfg.ttsVoice };
}

/** Audio → text. Returns the raw transcript ("" for silence — caller owns the
 *  empty-transcript retry/fail path, spec §17: never a guessed transcript).
 *  Accuracy levers (2026-07-24, WisprFlow parity work — all native Speaches/
 *  faster-whisper params, measured against the openapi surface):
 *  - vadFilter: trims non-speech before decoding — the antidote to Whisper's
 *    silence hallucinations (measured: silent clips produced "Altyazı M.K.").
 *  - prompt: initial-prompt domain biasing (business vocabulary, suffixes).
 *  - hotwords: proper nouns the model keeps mangling ("Hamza" → "Anza"). */
export async function sttTranscribe(
  audio: Buffer,
  opts: {
    lang?: "tr" | "en";
    filename?: string;
    config?: SpeachesConfig;
    prompt?: string;
    hotwords?: string;
    vadFilter?: boolean;
  } = {},
): Promise<string> {
  const cfg = opts.config ?? speachesConfig();
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(audio)], { type: "audio/wav" }), opts.filename ?? "utterance.wav");
  form.append("model", cfg.sttModel);
  if (opts.lang) form.append("language", opts.lang);
  if (opts.prompt) form.append("prompt", opts.prompt);
  if (opts.hotwords) form.append("hotwords", opts.hotwords);
  if (opts.vadFilter != null) form.append("vad_filter", String(opts.vadFilter));
  const res = await fetch(`${cfg.baseUrl}/v1/audio/transcriptions`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`speaches stt ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const body = (await res.json()) as { text?: string };
  return (body.text ?? "").trim();
}

/** Text → WAV audio with a specific registered voice (profile_ref from
 *  voice_identities decides the voice; caller passes it in). */
export async function ttsSpeak(
  text: string,
  opts: { voice?: string; model?: string; config?: SpeachesConfig } = {},
): Promise<Buffer> {
  const cfg = opts.config ?? speachesConfig();
  const res = await fetch(`${cfg.baseUrl}/v1/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model ?? cfg.ttsModel,
      voice: opts.voice ?? cfg.ttsVoice,
      input: text,
      response_format: "wav",
    }),
  });
  if (!res.ok) throw new Error(`speaches tts ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}
