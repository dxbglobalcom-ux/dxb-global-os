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
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { sql } from "kysely";
import { getDb, closeDb } from "@dxb/shared";
import { intakeVoiceCall } from "./intake.js";
import { logCall } from "./log.js";
import { matchWake, matchDismiss, matchHardOff } from "./wake.js";
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

// U15 D1 (2026-07-25): the wake contract phrase IS Turkish — the wake/rough
// pass is locked to `language=tr` (§24bis registered adaptation; §27 governs
// question language and is untouched: intake still auto-detects). The same
// accuracy levers the dictation lane proved ride along: vad_filter kills the
// silence-hallucination class, hotwords pin the names STT keeps mangling
// (measured live: "Hamza"→"Anza", "Selamaleykum"→"May the do you, Muslim").
export const WAKE_HOTWORDS = "Hamza Selamaleykum";
export function wakeSttOpts(cfg: ReturnType<typeof speachesConfig>): {
  config: ReturnType<typeof speachesConfig>;
  lang: "tr";
  vadFilter: boolean;
  hotwords: string;
} {
  return {
    config: { ...cfg, sttModel: WAKE_STT_MODEL },
    lang: "tr",
    vadFilter: true,
    hotwords: WAKE_HOTWORDS,
  };
}

// U15 D4: spoken progress thresholds — the CEO must never wait in silence.
// STT on the X230 measured up to 7.4 minutes (defect D4); a cue speaks when
// intake exceeds the threshold, and once more while the answer is prepared.
const STT_PROGRESS_MS = Number(process.env.DXB_JARVIS_STT_CUE_MS ?? 15000);
const ANSWER_PROGRESS_MS = Number(process.env.DXB_JARVIS_ANSWER_CUE_MS ?? 20000);

// U15 D10 (2026-07-25, CEO live verdict "kendi kendine konuşuyor"): the
// daemon's own speaker output re-entered the mic and became new question
// segments — a closed feedback loop ("çözümlüyorum" cue → mic → intake →
// cue …). Half-duplex law: any segment that ENDED during playback or within
// the echo tail after it is discarded before it can cost STT.
const ECHO_TAIL_MS = Number(process.env.DXB_JARVIS_ECHO_TAIL_MS ?? 1500);
export function shouldDropSegment(segmentEndedAt: number, playbackEndedAt: number): boolean {
  if (playbackEndedAt <= 0) return false;
  return segmentEndedAt <= playbackEndedAt + ECHO_TAIL_MS;
}

// U15 D11: active mode also keeps a hard STT spacing — ambient chatter in a
// lived-in room must never machine-gun the intake seam.
const ACTIVE_STT_MIN_GAP_MS = Number(process.env.DXB_ACTIVE_STT_GAP_MS ?? 3000);
// U15 D12: mute state poll cadence (voice_daemon_state, chat/panel door).
const STATE_POLL_MS = 5000;

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
 *  instant, so it can never wait for a live TTS round-trip. Filenames carry
 *  CUE_VERSION: changing a cue TEXT bumps the version so the stale cached WAV
 *  can never speak the old sentence (U15 block-4 text upgrade, 2026-07-25). */
const CUE_VERSION = "v2";
async function prepareCues(dir: string): Promise<Record<string, string>> {
  await mkdir(dir, { recursive: true });
  const cfg = speachesConfig();
  const cues: Record<string, { text: string }> = {
    ack: { text: "Buyrun efendim?" },
    bye: { text: "Görüşmek üzere efendim." },
    busy: { text: "Hat şu an meşgul, bir saniye lütfen." },
    // U15 block 4 verbatim clarify text — garble/unsupported-language answer.
    lost: { text: "Anlayamadım Muhittin Bey, tekrar buyurur musunuz?" },
    err: { text: "Bir sorun oldu efendim, tekrar dener misiniz?" },
    // U15 D4 progress cues: long STT / answer preparation must never be silent.
    wait: { text: "Sizi duydum efendim, çözümlüyorum." },
    prep: { text: "Cevabınızı hazırlıyorum efendim, birazdan söylüyorum." },
    // U15 D9 hard-off: mic mutes until reopened from chat or the panel —
    // the cue must say HOW to reopen, because speech can no longer do it.
    off: { text: "Kapandım efendim. Mikrofonum kapalı; sohbet ekranından ya da panelden açana kadar sessiz kalacağım." },
  };
  const out: Record<string, string> = {};
  for (const [key, cue] of Object.entries(cues)) {
    const path = join(dir, `jarvis-${key}-${CUE_VERSION}.wav`);
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

/** U15 D3 boot fail-soft: 708 crash-loop restarts on 2026-07-18 were ONE root
 *  cause — prepareCues died on a stopped Speaches container and the daemon
 *  exited 1 forever. Speaches being down is a WAIT state, not a crash: the
 *  daemon retries and reports, so the mic lane self-heals when the container
 *  returns. */
async function prepareCuesWithRetry(dir: string): Promise<Record<string, string>> {
  for (;;) {
    try {
      return await prepareCues(dir);
    } catch (e) {
      log(`speaches unreachable for cue synthesis (${(e as Error).message.slice(0, 80)}) — retrying in 30s`);
      await new Promise((r) => setTimeout(r, 30_000));
    }
  }
}

interface Segment { pcm: Buffer; ms: number; peak: number; gate: number; at: number }

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
            queue.push({ pcm: Buffer.concat(seg), ms, peak: Math.round(segPeak), gate: Math.round(gate), at: Date.now() });
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

/** U15 D12: read the shared daemon state (chat/panel door). Missing row or
 *  a DB hiccup default to 'listening' — the mic never gets stuck muted by an
 *  outage; the CEO's explicit mute is a persisted row, not a guess. */
async function readDaemonState(db: ReturnType<typeof getDb>): Promise<"listening" | "muted"> {
  try {
    const res = await sql<{ state: string }>`SELECT state FROM voice_daemon_state LIMIT 1`.execute(db);
    return res.rows[0]?.state === "muted" ? "muted" : "listening";
  } catch {
    return "listening";
  }
}

async function writeDaemonState(
  db: ReturnType<typeof getDb>,
  state: "listening" | "muted",
  note: string,
): Promise<void> {
  await sql`SELECT control_voice_daemon_set_state(${state}, ${"jarvis-daemon"}, ${note})`.execute(db);
}

/** U15 D9: end a parked call honestly when its transcript turned out to be a
 *  dismissal — the row must never sit in 'routing' waiting for an LLM answer
 *  to a goodbye. Best-effort: if the drain already claimed it, the upsert
 *  still records the honest end state. */
async function logCallEnd(db: ReturnType<typeof getDb>, callId: string, reason: string): Promise<void> {
  try {
    const res = await sql<{ timeline: unknown; transcript: unknown }>`
      SELECT timeline, transcript FROM voice_calls WHERE id = ${callId}
    `.execute(db);
    const row = res.rows[0];
    const timeline = (Array.isArray(row?.timeline) ? row.timeline : []) as Array<Record<string, unknown>>;
    timeline.push({ state: "ended", at: new Date().toISOString(), reason });
    await logCall(db, {
      id: callId, status: "ended", timeline,
      transcript: Array.isArray(row?.transcript) ? row.transcript : [],
    });
  } catch (e) {
    log(`dismiss call-end write failed for ${callId}: ${(e as Error).message.slice(0, 120)}`);
  }
}

async function main(): Promise<void> {
  const db = getDb();
  const audioDir = voiceAudioDir();
  const cues = await prepareCuesWithRetry(audioDir);
  const cfg = speachesConfig();

  let mode: Mode = "sleeping";
  let lastActivity = Date.now();
  let lastWakeStt = 0;
  let lastActiveStt = 0;
  let skippedByGap = 0;
  // U15 D10 half-duplex: wall-clock end of the last playback; every play()
  // goes through speak() so the window is always current.
  let playbackEnd = 0;
  let playing = false;
  const speak = async (path: string): Promise<void> => {
    playing = true;
    try {
      await play(path);
    } finally {
      playbackEnd = Date.now();
      playing = false;
    }
  };

  // U15 D12: mute is a persisted CEO order (chat "kapan", panel toggle, or
  // spoken hard-off). Polled — the chat lane must be able to silence the mic
  // within seconds.
  let muted = (await readDaemonState(db)) === "muted";
  setInterval(() => {
    void readDaemonState(db).then((s) => {
      const next = s === "muted";
      if (next !== muted) {
        muted = next;
        if (muted) mode = "sleeping";
        log(muted ? "MUTED by chat/panel order — mic ignored until reopened" : "UNMUTED — wake listening resumes");
      }
    });
  }, STATE_POLL_MS).unref();

  // U15 D11: idle runs on the WALL CLOCK, not on segment arrival — the old
  // check only fired when new sound came in, and every segment reset the
  // clock, so a lived-in room kept the session open forever (measured: the
  // CEO's friend conversation kept being "çözümle"nmiş).
  setInterval(() => {
    if (mode === "active" && Date.now() - lastActivity > ACTIVE_IDLE_MS) {
      mode = "sleeping";
      log("idle timeout — back to wake listening");
    }
  }, 10_000).unref();

  log(`up — wake phrase armed ("Selamaleykum ya Hamza"), vad rms ${SPEECH_RMS}, wake stt ${WAKE_STT_MODEL}${muted ? " — STATE: MUTED (chat/panel reopens)" : ""}`);

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

  // U15 D13: one wake session = one conversation thread; every call inside
  // it carries the same session id (voice_calls.session_id).
  let sessionId: string | null = null;

  for await (const segment of speechSegments(
    rec,
    () => (mode === "sleeping" ? WAKE_SEGMENT_MAX_MS : QUESTION_SEGMENT_MAX_MS),
    // U15 D10: ALWAYS coalesce — a backlog of room chatter captured while an
    // answer played must never become an intake backlog (the old active-mode
    // queue replayed it utterance by utterance).
    () => true,
  )) {
    // U15 D12: muted = the CEO closed the mic. Nothing is transcribed,
    // nothing wakes; the segment dies here at zero cost.
    if (muted) continue;

    // U15 D10: drop own-voice echoes and anything captured while we spoke.
    if (playing || shouldDropSegment(segment.at, playbackEnd)) {
      log(`segment dropped (half-duplex: captured during/near playback)`);
      continue;
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
        rough = await sttTranscribe(wav, { filename: "wake.wav", ...wakeSttOpts(cfg) });
      } catch (e) {
        log(`wake stt error: ${(e as Error).message.slice(0, 120)}`);
        continue;
      }
      // Every STT pass leaves a line — a silent noise-storm (16 ambient calls
      // in 5min, measured 2026-07-17) must never be invisible again.
      const passTag = `${(segment.ms / 1000).toFixed(1)}s peak ${segment.peak}/gate ${segment.gate}`;
      if (!rough) { log(`wake pass ${passTag} — empty`); continue; }
      // U15 D9: a spoken hard-off works even while asleep ("kendini kapat").
      if (matchHardOff(rough)) {
        try {
          await writeDaemonState(db, "muted", `spoken hard-off: "${rough.trim().slice(0, 60)}"`);
          muted = true;
          log(`HARD-OFF ("${rough.trim()}") — muted until chat/panel reopens`);
          await speak(cues.off);
        } catch (e) {
          log(`hard-off state write failed: ${(e as Error).message.slice(0, 120)}`);
        }
        continue;
      }
      if (matchWake(rough)) {
        mode = "active";
        lastActivity = Date.now();
        sessionId = randomUUID();
        log(`WAKE ("${rough.trim()}") — session ${sessionId} open`);
        await speak(cues.ack);
      } else {
        log(`wake pass ${passTag} — no match ("${rough.trim().slice(0, 40)}")`);
      }
      continue;
    }

    // ACTIVE: U15 D11 — the same STT spacing law as wake mode; room chatter
    // must not machine-gun the rough pass.
    if (Date.now() - lastActiveStt < ACTIVE_STT_MIN_GAP_MS) continue;
    lastActiveStt = Date.now();

    // Dismiss check rides the same rough pass BEFORE the full intake
    // (a goodbye must not become a voice_calls row).
    let rough = "";
    try {
      rough = await sttTranscribe(wav, { filename: "utterance.wav", ...wakeSttOpts(cfg) });
    } catch {
      rough = "";
    }
    // U15 D9: hard-off beats dismiss — "kendini kapat" mutes, not just sleeps.
    if (rough && matchHardOff(rough)) {
      try {
        await writeDaemonState(db, "muted", `spoken hard-off: "${rough.trim().slice(0, 60)}"`);
        muted = true;
      } catch (e) {
        log(`hard-off state write failed: ${(e as Error).message.slice(0, 120)}`);
      }
      mode = "sleeping";
      sessionId = null;
      log(`HARD-OFF ("${rough.trim()}") — muted until chat/panel reopens`);
      await speak(cues.off);
      continue;
    }
    if (rough && matchDismiss(rough)) {
      mode = "sleeping";
      sessionId = null;
      log(`DISMISS ("${rough.trim()}") — session closed`);
      await speak(cues.bye);
      continue;
    }
    if (rough && matchWake(rough) && rough.length < 40) {
      // A re-greeting inside an open session is an ack, not a question.
      lastActivity = Date.now();
      await speak(cues.ack);
      continue;
    }

    log(`question segment (${Math.round(segment.ms / 100) / 10}s) — intake`);
    let callId: string;
    // U15 D4: X230 STT measured up to 7.4 min — speak a progress cue instead
    // of silence once intake crosses the threshold.
    const sttCue = setTimeout(() => { void speak(cues.wait); }, STT_PROGRESS_MS);
    try {
      const res = await intakeVoiceCall({ db }, {
        audio: wav, filename: "utterance.wav",
        ...(sessionId ? { sessionId } : {}),
      });
      if (res.busy) { await speak(cues.busy); continue; }
      // U15 D6/D2: garble and non-{tr,en} speech get the clarify cue — never
      // a silent drop, never a guessed task.
      if (res.failure === "empty_transcript" || res.failure === "language_unsupported") {
        log(`intake clarify (${res.failure})`);
        await speak(cues.lost);
        continue;
      }
      if (res.failure) { log(`intake failure: ${res.failure}`); await speak(cues.err); continue; }
      // U15 D9 second net: the rough pass missed the dismissal but intake's
      // full-quality transcript caught it — obey it NOW instead of letting
      // the LLM answer "kapanıyorum" while the session stays open (the
      // measured 2026-07-25 defect). The parked row ends honestly.
      if (matchHardOff(res.transcript) || matchDismiss(res.transcript)) {
        const hardOff = matchHardOff(res.transcript);
        await logCallEnd(db, res.callId, hardOff ? "hard_off_via_intake" : "dismiss_via_intake");
        mode = "sleeping";
        sessionId = null;
        if (hardOff) {
          try {
            await writeDaemonState(db, "muted", `spoken hard-off (intake): "${res.transcript.slice(0, 60)}"`);
            muted = true;
          } catch (e) {
            log(`hard-off state write failed: ${(e as Error).message.slice(0, 120)}`);
          }
        }
        log(`${hardOff ? "HARD-OFF" : "DISMISS"} via intake transcript ("${res.transcript.slice(0, 60)}")`);
        await speak(hardOff ? cues.off : cues.bye);
        continue;
      }
      callId = res.callId;
      lastActivity = Date.now();
      log(`call ${callId} parked ("${res.transcript.slice(0, 80)}") — waiting for the answer`);
    } catch (e) {
      log(`intake error: ${(e as Error).message.slice(0, 160)}`);
      await speak(cues.err);
      continue;
    } finally {
      clearTimeout(sttCue);
    }

    // The resident scheduler answers (voice.drain); we watch the row.
    const deadline = Date.now() + ANSWER_TIMEOUT_MS;
    let played = false;
    // U15 D4: one spoken "preparing your answer" cue if the drain takes long.
    let prepCueAt: number | null = Date.now() + ANSWER_PROGRESS_MS;
    while (Date.now() < deadline) {
      if (prepCueAt !== null && Date.now() >= prepCueAt) {
        prepCueAt = null;
        await speak(cues.prep);
      }
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
          await speak(wavPath);
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
