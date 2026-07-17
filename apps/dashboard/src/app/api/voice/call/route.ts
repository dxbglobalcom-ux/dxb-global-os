import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@dxb/shared";
import { intakeVoiceCall } from "@dxb/voice/intake";
import { createClient } from "@/lib/supabase/server";

// Voice call seam (VOICE_INTERACTION_SPEC §6, R3.1) — the dashboard hosts
// ONLY the intake half: CEO auth → STT (self-hosted Speaches, €0/V9) →
// intent lineage (V5) → 'routing' handoff row. The answer half (routing/
// persona/TTS — an LLM surface) runs in the resident scheduler's voice.drain:
// PHASE-08 LOCKED keeps every model call out of this process, which is why
// this route imports the SDK-free "@dxb/voice/intake" subpath and nothing
// heavier. Playback arrives via the sibling [id]/audio route once the drain
// broadcasts voice call.ended.
const Fields = z.object({
  lang: z.enum(["tr", "en"]).default("tr"),
  target: z.string().trim().min(1).max(120).optional(),
});

// Bounded by §27's "very long dictation" edge case: 2min of webm/opus ≈ 2MB,
// 25MB tolerates uncompressed WAV proofs without opening an abuse surface.
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

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
  const parsed = Fields.safeParse({
    lang: form.get("lang") ?? undefined,
    target: form.get("target") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_fields" }, { status: 400 });
  }

  // Same session-mode local default as tests/launcher; VPS sets the env.
  process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

  const intake = await intakeVoiceCall(
    { db: getDb() },
    {
      audio: Buffer.from(await audio.arrayBuffer()),
      lang: parsed.data.lang,
      filename: audio.name || "utterance.webm",
      ...(parsed.data.target ? { targetSlug: parsed.data.target } : {}),
    },
  );

  if (intake.busy) {
    return NextResponse.json({ error: "line_busy", callId: intake.callId }, { status: 409 });
  }
  if (intake.state === "failed") {
    return NextResponse.json(
      { error: intake.failure ?? "intake_failed", callId: intake.callId },
      { status: 422 },
    );
  }
  return NextResponse.json(
    {
      callId: intake.callId,
      transcript: intake.transcript,
      intentId: intake.intentId,
      sttMs: intake.sttMs,
    },
    { status: 201 },
  );
}
