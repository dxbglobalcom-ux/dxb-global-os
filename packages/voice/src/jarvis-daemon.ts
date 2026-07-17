// JARVIS always-on wake daemon (VOICE_INTERACTION_SPEC §24bis, registered
// 2026-07-17). The CEO's command, verbatim contract:
//
//   "Selamaleykum ya Hamza"  → the line opens, no password, no dashboard,
//                              no voice-line picking. Hamza acknowledges.
//   <speech>                 → every utterance is a question on the SAME
//                              intake seam the dashboard uses (V5 one-path;
//                              busy law §10 intact). The answer WAV plays
//                              on the speakers.
//   "kapanabilirsin / gidebilirsin (ya) Hamza …" → the session closes.
//
// Free-first (D1): capture = arecord subprocess (the proven Kelam M1 lane on
// this machine — no libasound2-dev), wake detection = RMS voice-activity
// gate + short-chunk Speaches STT + fuzzy phrase match (wake.ts), playback =
// aplay/paplay. No cloud, no wake-word service, cost €0.
//
// HONEST LIMIT (measured hardware, X230): wake reaction = chunk + STT ≈
// 3-6s, full question→spoken-answer ≈ 30-60s. This is the CPU floor of
// faster-whisper on this laptop, not the architecture — the same daemon on
// the VPS/GPU path (or the CEO's planned laptop upgrade) drops to ~1s wake.
// openWakeWord custom-model training is the recorded <1s upgrade lane.
//
// Trust model: this daemon runs on the CEO's own terminal, reads the CEO's
// own microphone, and talks to localhost services only. Physical presence
// at the machine IS the authentication (same trust class as the laptop
// session itself). It holds no new secrets: DXB_DATABASE_URL comes from the
// environment exactly like the resident scheduler.
//
// Run: DXB_DATABASE_URL=postgres://… node packages/voice/dist/jarvis-daemon.js
// (repo shortcut: pnpm jarvis; supervised: scripts/systemd/dxb-jarvis.service)
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getDb, closeDb } from "@dxb/shared";
import { intakeVoiceCall } from "./intake.js";
import { matchWake, matchDismiss } from "./wake.js";
import { sttTranscribe, ttsSpeak, speachesConfig } from "./speaches.js";
import { voiceAudioDir } from "./paths.js";

const SAMPLE_RATE = 16000;
const BYTES_PER_SAMPLE = 2;
const FRAME_MS = 32; // 512 samples
const FRAME_BYTES = (SAMPLE_RATE * FRAME_MS / 1000) * BYTES_PER_SAMPLE;

// VAD thresholds — RMS over int16 frames. Ambient X230 room noise measured
// well under 300; normal speech at arm's length lands 800-3000.
const SPEECH_RMS = Number(process.env.DXB_JARVIS_VAD_RMS ?? 550);
// Adaptive ambient floor: CONTINUOUS noise must never read as speech. The
// fixed 550 gate failed against the X230 fan at max RPM — measured
// 2026-07-17: 16 ambient STT calls in 5min (Whisper language 'nn' p=0.19,
// i.e. pure noise), each call heating the CPU, raising the fan, raising the
// noise — a closed loop. The gate rides ABOVE the room floor: open at
// max(SPEECH_RMS, ambient×2.2); a closed segment must additionally PEAK ≥
// gate×1.4 before it may cost an STT call.
//
// v2 learning rule (same day): v1 learned only from sub-gate frames — in a
// continuously loud room the EMA never rose (measured: gate pinned at 550
// while peaks hit 8209). v2 learns from EVERY frame, asymmetrically: rise
// τ≈60s, fall τ≈3s. Bursts (speech lasts seconds) barely move the floor;
// anything persistent (fan, TV, music) BECOMES the floor within a minute —
// the CEO then simply speaks over it, which is the honest microphone truth.
const AMBIENT_MULT = 2.2;
const PEAK_MULT = 1.4;
const AMBIENT_UP_ALPHA = 0.0005;  // rise τ ≈ 60s at 32ms frames
const AMBIENT_DOWN_ALPHA = 0.01;  // fall τ ≈ 3s

export function ambientNext(prev: number, level: number): number {
  if (prev === 0) return level;
  const alpha = level > prev ? AMBIENT_UP_ALPHA : AMBIENT_DOWN_ALPHA;
  return prev * (1 - alpha) + level * alpha;
}
export function gateFor(ambient: number, base = SPEECH_RMS): number {
  return Math.max(base, ambient * AMBIENT_MULT);
}
export function passesEnergy(peak: number, gate: number): boolean {
  return peak >= gate * PEAK_MULT;
}
const SPEECH_START_FRAMES = 6;   // ~190ms of voice → segment opens
const SPEECH_END_FRAMES = 25;    // ~800ms of silence → segment closes
const WAKE_SEGMENT_MAX_MS = 6000;
const QUESTION_SEGMENT_MAX_MS = 20000;
const ACTIVE_IDLE_MS = Number(process.env.DXB_JARVIS_IDLE_MS ?? 120000);
const ANSWER_TIMEOUT_MS = 180000;
// Thermal backstop (defense in depth on the 8GB/100°C X230): no matter what
// slips past the VAD, wake-mode STT calls keep a hard minimum spacing — a
// noise storm may cost at most one whisper pass per gap.
const WAKE_STT_MIN_GAP_MS = Number(process.env.DXB_WAKE_STT_GAP_MS ?? 5000);

// Wake scanning wants SPEED over fidelity (the matcher is fuzzy by design);
// questions ride intake's own quality model untouched. Default = the SAME
// model intake uses: a second resident whisper model thrashed the 8GB X230
// (raw small-model STT measured 17.8s → 50.9s once base was loaded too,
// 2026-07-17). One model = one working set; a GPU/VPS host can point
// DXB_WAKE_STT_MODEL back at a lighter model safely.
const WAKE_STT_MODEL = process.env.DXB_WAKE_STT_MODEL ?? "Systran/faster-whisper-small";

type Mode = "sleeping" | "active";

function rms(frame: Buffer): number {
  let sum = 0;
  const n = Math.floor(frame.length / 2);
  if (n === 0) return 0;
  for (let i = 0; i < n; i++) {
    const s = frame.readInt16LE(i * 2);
    sum += s * s;
  }
  return Math.sqrt(sum / n);
}

/** Wrap raw 16k mono s16le PCM into a WAV container (44-byte header). */
export function pcmToWav(pcm: Buffer): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * BYTES_PER_SAMPLE, 28);
  header.writeUInt16LE(BYTES_PER_SAMPLE, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function log(msg: string): void {
  console.log(`[jarvis ${new Date().toISOString()}] ${msg}`);
}

async function play(path: string): Promise<void> {
  // aplay first (ALSA, proven by the Kelam acoustic roundtrip on this
  // machine), paplay fallback for pure-PipeWire sessions.
  const tryPlay = (bin: string) =>
    new Promise<boolean>((resolve) => {
      const p = spawn(bin, [path], { stdio: "ignore" });
      p.on("error", () => resolve(false));
      p.on("exit", (code) => resolve(code === 0));
    });
  if (!(await tryPlay("aplay"))) await tryPlay("paplay");
}

/** Pre-synthesize the fixed spoken cues once per boot — the ack must feel
 *  instant, so it can never wait for a live TTS round-trip. */
async function prepareCues(dir: string): Promise<Record<string, string>> {
  await mkdir(dir, { recursive: true });
  const cfg = speachesConfig();
  const cues: Record<string, { text: string; file: string }> = {
    ack: { text: "Buyrun efendim?", file: "jarvis-ack.wav" },
    bye: { text: "Görüşmek üzere efendim.", file: "jarvis-bye.wav" },
    busy: { text: "Hat şu an meşgul, bir saniye.", file: "jarvis-busy.wav" },
    lost: { text: "Anlayamadım, tekrar eder misiniz?", file: "jarvis-lost.wav" },
    err: { text: "Bir sorun oldu, tekrar deneyin.", file: "jarvis-err.wav" },
  };
  const out: Record<string, string> = {};
  for (const [key, cue] of Object.entries(cues)) {
    const path = join(dir, cue.file);
    try {
      await readFile(path);
    } catch {
      const wav = await ttsSpeak(cue.text, { config: cfg });
      await writeFile(path, wav);
    }
    out[key] = path;
  }
  return out;
}

interface Segment { pcm: Buffer; ms: number; peak: number; gate: number }

/** Async iterator of speech segments cut from the arecord stream by the RMS
 *  gate. Never returns while the room is silent — silence costs nothing.
 *  The gate self-calibrates to the room (ambient EMA); segments whose peak
 *  never clears the energy bar are dropped HERE, before they can cost STT.
 *  `coalesce()` true (sleeping mode) keeps only the freshest queued segment —
 *  a noise backlog must never become an STT backlog. */
async function* speechSegments(
  rec: ChildProcessWithoutNullStreams,
  maxMsFor: () => number,
  coalesce: () => boolean = () => false,
): AsyncGenerator<Segment> {
  let carry = Buffer.alloc(0);
  let inSpeech = false;
  let voiced = 0;
  let silent = 0;
  let seg: Buffer[] = [];
  let segPeak = 0;
  let ambient = 0;
  let dropped = 0;
  const queue: Segment[] = [];
  let notify: (() => void) | null = null;

  rec.stdout.on("data", (chunk: Buffer) => {
    carry = Buffer.concat([carry, chunk]);
    while (carry.length >= FRAME_BYTES) {
      const frame = carry.subarray(0, FRAME_BYTES);
      carry = carry.subarray(FRAME_BYTES);
      const level = rms(frame);
      // Every frame teaches the floor (v2) — asymmetric alphas keep speech
      // bursts from raising it while persistent noise owns it.
      ambient = ambientNext(ambient, level);
      const gate = gateFor(ambient);
      if (!inSpeech) {
        if (level >= gate) {
          voiced += 1;
          seg.push(frame);
          segPeak = Math.max(segPeak, level);
          if (voiced >= SPEECH_START_FRAMES) {
            inSpeech = true;
            silent = 0;
          }
        } else {
          voiced = 0;
          seg = [];
          segPeak = 0;
        }
      } else {
        seg.push(frame);
        segPeak = Math.max(segPeak, level);
        if (level < gate) {
          silent += 1;
        } else {
          silent = 0;
        }
        const ms = (seg.length * FRAME_MS);
        if (silent >= SPEECH_END_FRAMES || ms >= maxMsFor()) {
          if (passesEnergy(segPeak, gate)) {
            if (coalesce()) queue.length = 0;
            queue.push({ pcm: Buffer.concat(seg), ms, peak: Math.round(segPeak), gate: Math.round(gate) });
            notify?.();
          } else {
            dropped += 1;
            if (dropped % 10 === 1) {
              log(`ambient segment dropped (peak ${Math.round(segPeak)} < gate ${Math.round(gate)}×${PEAK_MULT}; ${dropped} total)`);
            }
          }
          seg = [];
          segPeak = 0;
          inSpeech = false;
          voiced = 0;
          silent = 0;
        }
      }
    }
  });

  while (true) {
    if (queue.length > 0) {
      yield queue.shift() as Segment;
    } else {
      await new Promise<void>((resolve) => { notify = resolve; });
      notify = null;
    }
  }
}

async function main(): Promise<void> {
  const db = getDb();
  const audioDir = voiceAudioDir();
  const cues = await prepareCues(audioDir);
  const cfg = speachesConfig();

  let mode: Mode = "sleeping";
  let lastActivity = Date.now();
  let lastWakeStt = 0;
  let skippedByGap = 0;

  log(`up — wake phrase armed ("Selamaleykum ya Hamza"), vad rms ${SPEECH_RMS}, wake stt ${WAKE_STT_MODEL}`);

  const rec = spawn("arecord", [
    "-f", "S16_LE", "-r", String(SAMPLE_RATE), "-c", "1", "-t", "raw", "-q", "-",
  ]);
  rec.on("exit", (code) => {
    log(`arecord exited (${code}) — daemon stops; supervisor restarts`);
    process.exit(1);
  });

  const shutdown = (signal: string) => {
    log(`${signal} — stopping`);
    rec.kill("SIGTERM");
    void closeDb().then(() => process.exit(0));
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  for await (const segment of speechSegments(
    rec,
    () => (mode === "sleeping" ? WAKE_SEGMENT_MAX_MS : QUESTION_SEGMENT_MAX_MS),
    () => mode === "sleeping",
  )) {
    if (mode === "active" && Date.now() - lastActivity > ACTIVE_IDLE_MS) {
      mode = "sleeping";
      log("idle timeout — back to wake listening");
    }

    const wav = pcmToWav(segment.pcm);

    if (mode === "sleeping") {
      if (Date.now() - lastWakeStt < WAKE_STT_MIN_GAP_MS) {
        skippedByGap += 1;
        if (skippedByGap % 10 === 1) log(`wake segment skipped by STT gap (${skippedByGap} total)`);
        continue;
      }
      lastWakeStt = Date.now();
      // Cheap fast pass: rough transcript only feeds the fuzzy matcher.
      let rough = "";
      try {
        rough = await sttTranscribe(wav, {
          filename: "wake.wav",
          config: { ...cfg, sttModel: WAKE_STT_MODEL },
        });
      } catch (e) {
        log(`wake stt error: ${(e as Error).message.slice(0, 120)}`);
        continue;
      }
      // Every STT pass leaves a line — a silent noise-storm (16 ambient calls
      // in 5min, measured 2026-07-17) must never be invisible again.
      const passTag = `${(segment.ms / 1000).toFixed(1)}s peak ${segment.peak}/gate ${segment.gate}`;
      if (!rough) { log(`wake pass ${passTag} — empty`); continue; }
      if (matchWake(rough)) {
        mode = "active";
        lastActivity = Date.now();
        log(`WAKE ("${rough.trim()}") — session open`);
        await play(cues.ack);
      } else {
        log(`wake pass ${passTag} — no match ("${rough.trim().slice(0, 40)}")`);
      }
      continue;
    }

    // ACTIVE: dismiss check rides the same rough pass BEFORE the full intake
    // (a goodbye must not become a voice_calls row).
    let rough = "";
    try {
      rough = await sttTranscribe(wav, {
        filename: "utterance.wav",
        config: { ...cfg, sttModel: WAKE_STT_MODEL },
      });
    } catch {
      rough = "";
    }
    if (rough && matchDismiss(rough)) {
      mode = "sleeping";
      log(`DISMISS ("${rough.trim()}") — session closed`);
      await play(cues.bye);
      continue;
    }
    if (rough && matchWake(rough) && rough.length < 40) {
      // A re-greeting inside an open session is an ack, not a question.
      lastActivity = Date.now();
      await play(cues.ack);
      continue;
    }

    lastActivity = Date.now();
    log(`question segment (${Math.round(segment.ms / 100) / 10}s) — intake`);
    let callId: string;
    try {
      const res = await intakeVoiceCall({ db }, { audio: wav, filename: "utterance.wav" });
      if (res.busy) { await play(cues.busy); continue; }
      if (res.failure === "empty_transcript") { await play(cues.lost); continue; }
      if (res.failure) { log(`intake failure: ${res.failure}`); await play(cues.err); continue; }
      callId = res.callId;
      log(`call ${callId} parked ("${res.transcript.slice(0, 80)}") — waiting for the answer`);
    } catch (e) {
      log(`intake error: ${(e as Error).message.slice(0, 160)}`);
      await play(cues.err);
      continue;
    }

    // The resident scheduler answers (voice.drain); we watch the row.
    const deadline = Date.now() + ANSWER_TIMEOUT_MS;
    let played = false;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 2000));
      const row = await db
        .selectFrom("voice_calls")
        .select(["status"])
        .where("id", "=", callId)
        .executeTakeFirst();
      if (!row) break;
      if (row.status === "ended") {
        const wavPath = join(audioDir, `${callId}.wav`);
        try {
          await readFile(wavPath);
          log(`answer ready — playing ${wavPath}`);
          await play(wavPath);
          played = true;
        } catch {
          log("answer row ended but WAV missing — degraded silent end");
        }
        break;
      }
      if (row.status === "failed") {
        log("call failed on the answer side");
        break;
      }
    }
    if (!played && Date.now() >= deadline) log(`answer timeout for ${callId}`);
    lastActivity = Date.now();
  }
}

const entryHref = process.argv[1] ? new URL(`file://${process.argv[1]}`).href : "";
if (import.meta.url === entryHref || import.meta.url.endsWith("/jarvis-daemon.js")) {
  main().catch((err) => {
    console.error("[jarvis] fatal:", err);
    process.exit(1);
  });
}
