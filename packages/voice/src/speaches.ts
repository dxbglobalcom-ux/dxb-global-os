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
}

export function speachesConfig(env: NodeJS.ProcessEnv = process.env): SpeachesConfig {
  return {
    baseUrl: env.DXB_SPEACHES_URL ?? "http://127.0.0.1:8969",
    sttModel: env.DXB_STT_MODEL ?? "Systran/faster-whisper-small",
    ttsModel: env.DXB_TTS_MODEL ?? "speaches-ai/piper-tr_TR-fahrettin-medium",
    ttsVoice: env.DXB_TTS_VOICE ?? "tr_TR-fahrettin-medium",
  };
}

/** Audio → text. Returns the raw transcript ("" for silence — caller owns the
 *  empty-transcript retry/fail path, spec §17: never a guessed transcript). */
export async function sttTranscribe(
  audio: Buffer,
  opts: { lang?: "tr" | "en"; filename?: string; config?: SpeachesConfig } = {},
): Promise<string> {
  const cfg = opts.config ?? speachesConfig();
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(audio)], { type: "audio/wav" }), opts.filename ?? "utterance.wav");
  form.append("model", cfg.sttModel);
  if (opts.lang) form.append("language", opts.lang);
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
