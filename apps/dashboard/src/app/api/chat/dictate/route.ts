import { NextResponse } from "next/server";
import { z } from "zod";
import { speachesConfig, sttTranscribe } from "@dxb/voice/speaches";
import { createClient } from "@/lib/supabase/server";

// Chat dictation seam (complaint ledger 1a-1e, U15 lane, 2026-07-24) — the
// WisprFlow idiom: speech becomes EDITABLE text in the chat input, nothing
// else. No voice_calls row, no intent, no answer half — the CEO's send button
// stays the only dispatch, so a mis-heard word can never become a task (the
// D6 garble-in-task-out defect is structurally impossible on this lane).
// STT-in-dashboard follows the §6 intake precedent (Speaches is not an LLM;
// PHASE-08 LOCKED is about model calls). Language is an EXPLICIT field the
// UI's TR|EN picker sends — never silently inherited from the locale (the
// registered lang.ts adaptation: forced-locale STT turned Turkish speech
// into fluent English, call f05cf286) — and the {tr,en} whitelist of U15
// block 2 is enforced by the schema.
const Fields = z.object({ lang: z.enum(["tr", "en"]) });

// Dictation utterances are sentences, not speeches: 60s of webm/opus ≈ 1MB;
// 10MB tolerates WAV proofs without opening an abuse surface.
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const audio = form.get("audio");
  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: "audio_required" }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "audio_too_large" }, { status: 413 });
  }
  const parsed = Fields.safeParse({ lang: form.get("lang") ?? undefined });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_fields" }, { status: 400 });
  }

  // Model knob: dictation text is editable, so a faster model is a legitimate
  // trade the VPS re-measure can flip via env; default stays the quality
  // choice recorded in speaches.ts (X230 2026-07-17: small = correct TR).
  const base = speachesConfig();
  const config = {
    ...base,
    sttModel: process.env.DXB_DICTATION_STT_MODEL ?? base.sttModel,
  };

  const started = Date.now();
  try {
    const text = await sttTranscribe(Buffer.from(await audio.arrayBuffer()), {
      lang: parsed.data.lang,
      filename: audio.name || "dictation.webm",
      config,
    });
    if (text.length === 0) {
      // Honest empty-capture signal (§17): the UI says "nothing heard",
      // never a guessed transcript.
      return NextResponse.json({ error: "empty_transcript" }, { status: 422 });
    }
    return NextResponse.json({ text, sttMs: Date.now() - started }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "stt_unavailable" }, { status: 502 });
  }
}
