// Voice-line latency probe (R3.2). Fires ONE Turkish spoken question through
// the PRODUCTION chain — intake here, answer by the resident scheduler's own
// voice.drain — and prints per-leg timings plus the transcript languages.
// The lang:"en" hint is DELIBERATE: it must NOT flip detection (the
// 2026-07-17 defect regression check rides inside the probe).
//
//   node scripts/dev/voice-latency-probe.mjs
//
// Build first (dist imports): npx tsc -b packages/kernel packages/voice
import { getDb, closeDb } from "../../packages/shared/dist/index.js";
import { intakeVoiceCall } from "../../packages/voice/dist/intake.js";

// B36 Block 4: the company's address used to stand here as a DEFAULT, so this
// runner reached the holding whether or not anyone had said to. It now carries
// no address of its own.
if (!process.env.DXB_DATABASE_URL) {
  console.error(
    "voice-latency-probe: DXB_DATABASE_URL is not set. This probe opens a REAL voice call and it carries no default — " +
      "name the engine explicitly.",
  );
  process.exit(2);
}
const base = process.env.DXB_SPEACHES_URL ?? "http://127.0.0.1:8969";

const t0 = Date.now();
const tts = await fetch(`${base}/v1/audio/speech`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "speaches-ai/piper-tr_TR-fahrettin-medium",
    voice: "tr_TR-fahrettin-medium",
    input: "Finans departmanının bugünkü bütçe durumu nedir?",
    response_format: "wav",
  }),
});
if (!tts.ok) throw new Error(`fixture tts ${tts.status}`);
const audio = Buffer.from(await tts.arrayBuffer());
console.log("fixture-wav", audio.length, "bytes");

const db = getDb();
const res = await intakeVoiceCall({ db }, { audio, filename: "probe.wav", lang: "en" });
console.log("intake:", JSON.stringify({
  state: res.state, sttMs: res.sttMs,
  transcript: res.transcript.slice(0, 90), failure: res.failure,
}));
if (res.failure) {
  await closeDb();
  process.exit(1);
}

const deadline = Date.now() + 150000;
let row;
while (Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 2000));
  row = await db
    .selectFrom("voice_calls")
    .select(["status", "stt_ms", "answer_ms", "tts_ms", "transcript", "degraded"])
    .where("id", "=", res.callId)
    .executeTakeFirst();
  if (row && ["ended", "failed"].includes(row.status)) break;
}
const wall = Date.now() - t0;
console.log("final:", JSON.stringify({
  status: row?.status, stt_ms: row?.stt_ms, answer_ms: row?.answer_ms,
  tts_ms: row?.tts_ms, degraded: row?.degraded, wallMs: wall,
}));
for (const l of (Array.isArray(row?.transcript) ? row.transcript : [])) {
  console.log(`  [${l.role}${l.lang ? " " + l.lang : ""}] ${String(l.text).slice(0, 110)}`);
}
await closeDb();
