import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { voiceAudioDir } from "@dxb/voice/paths";
import { createClient } from "@/lib/supabase/server";

// Answer-audio playback (VOICE_INTERACTION_SPEC §6): streams the SYNTHETIC
// answer WAV the scheduler's voice.drain wrote to the handoff dir. Only
// generated speech ever lives there — CEO question audio is never persisted
// (V9/§16). UUID gate + fixed dir + fixed extension = no path traversal.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  try {
    const wav = await readFile(join(voiceAudioDir(), `${id.toLowerCase()}.wav`));
    return new NextResponse(new Uint8Array(wav), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
        "Content-Length": String(wav.byteLength),
      },
    });
  } catch {
    // Not written yet (call still answering) or already pruned (24h window).
    return NextResponse.json({ error: "audio_not_ready" }, { status: 404 });
  }
}
