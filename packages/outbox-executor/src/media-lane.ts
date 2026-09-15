// B43 — THE MEDIA LANE: the resident process that turns a media_jobs row into a
// finished file on the holding's own card. The dxb-mcp `media` group births the
// row (an expert's request, milliseconds); this lane claims it (SKIP LOCKED, one
// job at a time — the card is one), runs the station's own driver for the job's
// kind, samples VRAM/RAM while it runs, and writes wall clock, peaks, output
// path and result back onto the same row — the CEO's screen reads that row.
//
// Measured on 2026-09-03 and built in here on purpose:
//   · a process started from an interactive shell on this station inherits a
//     16 GiB memory scope and dies at the SeedVR2 resize (kernel memcg OOM);
//     a 1440p run then drove the whole machine to earlyoom (mem 10 %, swap 10 %).
//     → every GPU job runs in ITS OWN transient systemd scope with MemoryMax /
//       MemorySwapMax, and the lane refuses to start a GPU job while the card
//       (>3 GB used), the RAM (<12 GiB available) or the swap (<25 % free) is busy.
//   · a LoadVideo symlink that resolves outside ComfyUI/input is "Invalid video
//     file" → inputs are COPIED into the engine's input folder, never linked.
//   · run.py / workflow.py take reference and frame files as NAMES inside
//     ComfyUI/input → the lane copies them there under a job-unique prefix.
// No engine command line, model name or magic number lives anywhere else.
import { execFile, spawn, type ChildProcess } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import { sql, type Kysely, type Selectable } from "kysely";
import { extractFrames, getDb, probeMedia, resolveMediaBinary, type DB, type MediaJobsTable } from "@dxb/shared";

const run = promisify(execFile);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type MediaJobRow = Selectable<MediaJobsTable>;
export type MediaKind = MediaJobRow["kind"];

/** Station paths, read AT CALL TIME. W8 (CEO 2026-09-15): this was a module-level object
 *  literal, so every value froze at import — the same defect as media.ts's work-root
 *  constant, and the reason a test could not redirect the lane away from the holding's
 *  production directories. A getter costs nothing and cannot be frozen by an import. */
export const MEDIA_PATHS = {
  get workRoot() { return process.env.DXB_MEDIA_WORK_ROOT ?? "/home/dxb/tools/h3/jobs"; },
  get h3Dir() { return process.env.DXB_H3_DIR ?? "/home/dxb/tools/h3"; },
  get comfyDir() { return process.env.DXB_COMFY_DIR ?? "/home/dxb/tools/ComfyUI"; },
  get comfyUrl() { return process.env.DXB_COMFY_URL ?? "http://127.0.0.1:8188"; },
  get upscaleDir() { return process.env.DXB_COMFY_UPSCALE_DIR ?? "/home/dxb/tools/ComfyUI-upscale"; },
  get upscaleUrl() { return process.env.DXB_COMFY_UPSCALE_URL ?? "http://127.0.0.1:8189"; },
  get upscalePort() { return Number(process.env.DXB_COMFY_UPSCALE_PORT ?? 8189); },
} as const;

export const MEDIA_LIMITS = {
  memoryMax: process.env.DXB_MEDIA_MEMORY_MAX ?? "26G",
  swapMax: process.env.DXB_MEDIA_SWAP_MAX ?? "8G",
  gpuBusyMib: Number(process.env.DXB_MEDIA_GPU_BUSY_MIB ?? 3000),
  ramFreeGib: Number(process.env.DXB_MEDIA_RAM_FREE_GIB ?? 12),
  swapFreeFrac: Number(process.env.DXB_MEDIA_SWAP_FREE_FRAC ?? 0.25),
  maxJobSeconds: Number(process.env.DXB_MEDIA_MAX_JOB_SECONDS ?? 5400),
  benchBootSeconds: 120,
} as const;

// The card is one: these kinds run one at a time, in the GPU lane. The others need only
// the processor and run beside it (media-lanes.ts, CEO 2026-09-05 "Onaylıyorum, başla").
export const GPU_KINDS: ReadonlySet<MediaKind> = new Set(["still", "shoot", "upscale"]);
export const CPU_KINDS: ReadonlySet<MediaKind> = new Set(["assemble", "probe"]);

export interface ResourceVerdict {
  ok: boolean;
  reason?: string;
}

/** The lane's own eyes on the machine: the card, the RAM and the swap. */
export async function defaultResourceCheck(kind: MediaKind): Promise<ResourceVerdict> {
  const meminfo = readFileSync("/proc/meminfo", "utf8");
  const kb = (key: string) => Number((meminfo.match(new RegExp(`^${key}:\\s+(\\d+)`, "m")) ?? [])[1] ?? 0);
  const availGib = kb("MemAvailable") / 1024 / 1024;
  const swapTotal = kb("SwapTotal");
  const swapFree = kb("SwapFree");
  if (!GPU_KINDS.has(kind)) {
    return availGib >= 4 ? { ok: true } : { ok: false, reason: `RAM available ${availGib.toFixed(1)} GiB < 4` };
  }
  if (availGib < MEDIA_LIMITS.ramFreeGib) {
    return { ok: false, reason: `RAM available ${availGib.toFixed(1)} GiB < ${MEDIA_LIMITS.ramFreeGib}` };
  }
  if (swapTotal > 0 && swapFree / swapTotal < MEDIA_LIMITS.swapFreeFrac) {
    return { ok: false, reason: `swap free ${Math.round((100 * swapFree) / swapTotal)} % < ${Math.round(100 * MEDIA_LIMITS.swapFreeFrac)} %` };
  }
  try {
    const { stdout } = await run("nvidia-smi", ["--query-gpu=memory.used", "--format=csv,noheader,nounits"]);
    const used = Number(stdout.trim().split("\n")[0]);
    if (Number.isFinite(used) && used > MEDIA_LIMITS.gpuBusyMib) {
      return { ok: false, reason: `card busy: ${used} MiB used > ${MEDIA_LIMITS.gpuBusyMib}` };
    }
  } catch (err) {
    return { ok: false, reason: `nvidia-smi unavailable: ${String(err).slice(0, 120)}` };
  }
  return { ok: true };
}

export interface EngineResult {
  output_path: string | null;
  result: Record<string, unknown>;
}

export interface EngineContext {
  job: MediaJobRow;
  params: Record<string, any>;
  workDir: string;
  log: (line: string) => void;
  cancelled: () => Promise<boolean>;
  /** Run one command; GPU kinds go through a transient systemd scope. Resolves
   *  with the captured stdout; rejects on non-zero exit, cancel or deadline. */
  exec: (cmd: string, args: string[], opts?: { cwd?: string; scoped?: boolean; unit?: string }) => Promise<{ stdout: string; code: number }>;
}

export type EngineRunner = (ctx: EngineContext) => Promise<EngineResult>;

// ── the station's drivers, one per kind ───────────────────────────────────────

function resolveUserBinary(name: string, envKey: string): string {
  const override = process.env[envKey];
  if (override) return override;
  const local = join(homedir(), ".local", "bin", name);
  return existsSync(local) ? local : name;
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

/** copy an absolute file into ComfyUI/input under a job-unique name; returns that name */
function stageIntoInput(inputDir: string, jobId: string, file: string): string {
  mkdirSync(inputDir, { recursive: true });
  const name = `${jobId.slice(0, 8)}_${basename(file)}`;
  copyFileSync(file, join(inputDir, name));
  return name;
}

async function httpJson(url: string, init?: RequestInit, timeoutMs = 10_000): Promise<any> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { ...init, signal: ctl.signal });
    if (!r.ok) throw new Error(`${url} → HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

async function serverUp(url: string): Promise<boolean> {
  try {
    await httpJson(`${url}/system_stats`, undefined, 3000);
    return true;
  } catch {
    return false;
  }
}

const stillEngine: EngineRunner = async (ctx) => {
  const p = ctx.params;
  if (!(await serverUp(MEDIA_PATHS.comfyUrl))) throw new Error(`production ComfyUI (${MEDIA_PATHS.comfyUrl}) is not up`);
  const out = join(ctx.workDir, String(p.out));
  const args = [
    join(MEDIA_PATHS.h3Dir, "img.py"), "--prompt", String(p.prompt), "--out", out,
    "--w", String(num(p.w, 1152)), "--h", String(num(p.h, 640)),
    "--steps", String(num(p.steps, 28)), "--guidance", String(num(p.guidance, 4.5)),
    "--seed", String(num(p.seed, 0)),
  ];
  const { stdout } = await ctx.exec("python3", args, { cwd: MEDIA_PATHS.h3Dir, scoped: true });
  if (!existsSync(out)) throw new Error(`still: driver finished but ${out} is missing — ${stdout.slice(-300)}`);
  const summary = await probeMedia(out);
  return { output_path: out, result: { file: out, width: summary.video?.width ?? null, height: summary.video?.height ?? null, driver_line: stdout.trim().split("\n").pop() ?? "" } };
};

function parseRunPy(stdout: string): { wall_s: number | null; vram_mib: number | null; ram_gib: number | null; output: string | null; ok: boolean } {
  const m = (re: RegExp) => stdout.match(re)?.[1] ?? null;
  return {
    wall_s: m(/duvar saati: ([\d.]+) s/) ? Number(m(/duvar saati: ([\d.]+) s/)) : null,
    vram_mib: m(/VRAM tepe: (\d+) MiB/) ? Number(m(/VRAM tepe: (\d+) MiB/)) : null,
    ram_gib: m(/RAM tepe: ([\d.]+) GiB/) ? Number(m(/RAM tepe: ([\d.]+) GiB/)) : null,
    output: m(/cikti: (\S+)/),
    ok: /sonuc: BASARILI/.test(stdout),
  };
}

const shootEngine: EngineRunner = async (ctx) => {
  const p = ctx.params;
  if (!(await serverUp(MEDIA_PATHS.comfyUrl))) throw new Error(`production ComfyUI (${MEDIA_PATHS.comfyUrl}) is not up`);
  const inputDir = join(MEDIA_PATHS.comfyDir, "input");
  const args = [
    join(MEDIA_PATHS.h3Dir, "run.py"),
    "--seconds", String(p.seconds), "--width", String(p.width), "--height", String(p.height),
    "--steps", String(num(p.steps, 4)), "--seed", String(num(p.seed, 42)),
    "--prompt", String(p.prompt), "--prefix", String(p.prefix),
  ];
  if (p.first_frame) args.push("--first-frame", stageIntoInput(inputDir, ctx.job.id, String(p.first_frame)));
  if (p.last_frame) args.push("--last-frame", stageIntoInput(inputDir, ctx.job.id, String(p.last_frame)));
  for (const f of (p.refs as string[] | undefined) ?? []) args.push("--ref", stageIntoInput(inputDir, ctx.job.id, f));
  for (const f of (p.ref_audio as string[] | undefined) ?? []) args.push("--ref-audio", stageIntoInput(inputDir, ctx.job.id, f));
  if (p.ref_size) args.push("--ref-size", String(p.ref_size));
  if (p.lora) args.push("--lora", String(p.lora));
  if (p.no_lora) args.push("--no-lora");
  if (p.negative) args.push("--negative", String(p.negative));
  if (p.cfg !== undefined) args.push("--cfg", String(p.cfg));
  const { stdout } = await ctx.exec(join(MEDIA_PATHS.comfyDir, ".venv", "bin", "python"), args, { cwd: MEDIA_PATHS.h3Dir, scoped: true });
  const t = parseRunPy(stdout);
  if (!t.ok || !t.output) throw new Error(`shoot: run.py reported failure — ${stdout.slice(-400)}`);
  const produced = join(MEDIA_PATHS.comfyDir, "output", t.output);
  const kept = join(ctx.workDir, t.output);
  copyFileSync(produced, kept);
  const summary = await probeMedia(kept);
  return {
    output_path: kept,
    result: {
      file: kept, engine_output: produced, wall_s: t.wall_s, vram_mib: t.vram_mib, ram_gib: t.ram_gib,
      width: summary.video?.width ?? null, height: summary.video?.height ?? null,
      frames: summary.video?.frames ?? null, duration_s: summary.duration_s,
    },
  };
};

const upscaleEngine: EngineRunner = async (ctx) => {
  const p = ctx.params;
  const src = String(p.file);
  if (!existsSync(src)) throw new Error(`upscale: ${src} does not exist`);
  const srcInfo = await probeMedia(src);
  if (!srcInfo.video) throw new Error(`upscale: ${src} has no video stream`);
  const shortEdge = Math.min(srcInfo.video.width, srcInfo.video.height);
  const inputDir = join(MEDIA_PATHS.upscaleDir, "input");
  const staged = stageIntoInput(inputDir, ctx.job.id, src);

  // The bench is started for the job and stopped after it: the production
  // ComfyUI (8188) is resident, this one is not — two idle servers would hold
  // twice the RAM the 18:05 earlyoom episode was about.
  let bench: ChildProcess | null = null;
  const unit = `dxb-media-bench-${ctx.job.id.slice(0, 8)}`;
  const weStarted = !(await serverUp(MEDIA_PATHS.upscaleUrl));
  try {
    if (weStarted) {
      ctx.log(`starting SeedVR2 bench on :${MEDIA_PATHS.upscalePort} (scope ${unit})`);
      bench = spawnScoped(
        join(MEDIA_PATHS.upscaleDir, ".venv", "bin", "python"),
        ["main.py", "--listen", "127.0.0.1", "--port", String(MEDIA_PATHS.upscalePort)],
        { cwd: MEDIA_PATHS.upscaleDir, unit, log: ctx.log },
      );
      const t0 = Date.now();
      while (!(await serverUp(MEDIA_PATHS.upscaleUrl))) {
        if (Date.now() - t0 > MEDIA_LIMITS.benchBootSeconds * 1000) throw new Error("upscale: bench did not come up in time");
        if (bench.exitCode !== null) throw new Error(`upscale: bench exited early (code ${bench.exitCode})`);
        await sleep(2000);
      }
    }
    const prefix = `seedvr2/${ctx.job.id.slice(0, 8)}`;
    const { stdout: graph } = await run("python3", [
      join(MEDIA_PATHS.h3Dir, "upscale", "seedvr2_graph.py"),
      "--file", staged, "--model", String(p.model), "--target", String(p.target), "--short-edge", String(shortEdge),
      "--seed", String(num(p.seed, 42)), "--color", String(p.color ?? "lab"), "--overlap", String(num(p.overlap, 0)),
      "--prefix", prefix,
    ], { maxBuffer: 1024 * 1024 });
    const t0 = Date.now();
    const submitted = await httpJson(`${MEDIA_PATHS.upscaleUrl}/prompt`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: graph,
    });
    const pid = submitted?.prompt_id;
    if (!pid) throw new Error(`upscale: bench rejected the graph — ${JSON.stringify(submitted).slice(0, 400)}`);
    ctx.log(`bench accepted prompt ${pid}`);
    let hist: any = null;
    for (;;) {
      if (await ctx.cancelled()) {
        await fetch(`${MEDIA_PATHS.upscaleUrl}/interrupt`, { method: "POST" }).catch(() => {});
        throw new Error("cancelled");
      }
      if (Date.now() - t0 > MEDIA_LIMITS.maxJobSeconds * 1000) throw new Error("upscale: deadline passed");
      if (bench && bench.exitCode !== null) throw new Error(`upscale: bench died mid-run (code ${bench.exitCode}) — see lane.log`);
      const h = await httpJson(`${MEDIA_PATHS.upscaleUrl}/history/${pid}`, undefined, 10_000).catch(() => null);
      const entry = h?.[pid];
      const st = entry?.status?.status_str;
      if (st === "success") { hist = entry; break; }
      if (st === "error") throw new Error(`upscale: bench error — ${JSON.stringify(entry?.status?.messages ?? "").slice(0, 400)}`);
      await sleep(3000);
    }
    const wall = (Date.now() - t0) / 1000;
    const outputs: Array<{ filename: string; subfolder?: string }> = [];
    for (const node of Object.values(hist.outputs ?? {}) as any[]) {
      for (const k of ["images", "video", "videos", "gifs"]) for (const x of node?.[k] ?? []) outputs.push(x);
    }
    if (outputs.length === 0) throw new Error("upscale: bench finished without an output file");
    const rel = join(outputs[0].subfolder ?? "", outputs[0].filename);
    const produced = join(MEDIA_PATHS.upscaleDir, "output", rel);
    const kept = join(ctx.workDir, basename(rel));
    copyFileSync(produced, kept);
    const outInfo = await probeMedia(kept);
    const frames = outInfo.video?.frames ?? srcInfo.video.frames ?? null;
    return {
      output_path: kept,
      result: {
        file: kept, model: p.model, target: p.target, color: p.color ?? "lab",
        in: { width: srcInfo.video.width, height: srcInfo.video.height, frames: srcInfo.video.frames },
        out: { width: outInfo.video?.width ?? null, height: outInfo.video?.height ?? null, frames },
        wall_s: Math.round(wall * 10) / 10,
        s_per_frame: frames ? Math.round((wall / frames) * 1000) / 1000 : null,
      },
    };
  } finally {
    if (bench) {
      ctx.log(`stopping bench ${unit}`);
      await stopScoped(bench, unit);
    }
  }
};

// The voice engine stood here until 2026-09-15. It shelled out to a text-to-speech
// binary (named in the ruling and in EVIDENCE-W7-2026-09-15.md; deliberately not
// written here, so a grep for it over this repo's source answers zero) and wrote a
// TTS track, which his ruling of 2026-09-04 cancelled for every video production
// (tts-cancelled-engine-voice-only-2026-09-04: "şu yapay sesi iptal et tüm video
// üretimlerinde reklamdan tut filme kadar. MiniMax H3'ün kendi sesi olsun"). The hand
// went on offering it for eleven days. Removed on his word of 2026-09-15 — "kaldır",
// road (a) of two he was given (w7-voice-hand-removed-2026-09-15): the kind is gone
// from the job book's CHECK and from media_submit, so a seat cannot ask.
// The studio's voice is the take's own: `shoot` carries the spoken lines in the prompt.
// This says nothing about the HOLDING's speaking voice — Hamza speaks through
// packages/voice (speaches:piper), which shares no table, no binary and no line of
// code with this lane.

const GRADES: Record<string, string> = {
  none: "",
  // the UGC grade from tools/h3/ugc2/post.sh (2026-09-01)
  ugc: "eq=contrast=1.03:saturation=1.02:gamma=1.01,unsharp=5:5:0.25:5:5:0.0,noise=alls=4:allf=t+u",
  // the luxury grade from tools/h3/oe/post-oe.sh (2026-09-01): blacks to the floor, one warm shoulder
  luxury:
    "curves=r='0/0 0.25/0.25 0.75/0.79 1/1':g='0/0 0.25/0.24 0.75/0.76 1/0.99':b='0/0 0.25/0.225 0.75/0.72 1/0.97'," +
    "eq=contrast=1.05:saturation=0.98:gamma=1.04,unsharp=5:5:0.45:5:5:0.0,noise=alls=4:allf=t+u,vignette=PI/4.5",
};

function ffEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/:/g, "\\:").replace(/,/g, "\\,").replace(/%/g, "\\%");
}

const assembleEngine: EngineRunner = async (ctx) => {
  const p = ctx.params;
  const ffmpeg = resolveMediaBinary("ffmpeg");
  const W = Number(p.width), H = Number(p.height), FPS = num(p.fps, 24);
  const grade = GRADES[String(p.grade ?? "none")] ?? "";
  const graded: string[] = [];
  const rooms: string[] = [];
  const clips = p.clips as Array<{ file: string; trim_start?: number; trim_end?: number }>;
  for (let i = 0; i < clips.length; i++) {
    const c = clips[i];
    if (!existsSync(c.file)) throw new Error(`assemble: clip ${c.file} does not exist`);
    const g = join(ctx.workDir, `graded_${i + 1}.mp4`);
    const vf = [`scale=${W}:${H}:flags=lanczos`, grade].filter(Boolean).join(",");
    const trim: string[] = [];
    if (c.trim_start !== undefined) trim.push("-ss", String(c.trim_start));
    if (c.trim_end !== undefined) trim.push("-to", String(c.trim_end));
    await ctx.exec(ffmpeg, ["-y", "-v", "error", ...trim, "-i", c.file, "-vf", vf, "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-r", String(FPS), "-an", g]);
    graded.push(g);
    const room = join(ctx.workDir, `room_${i + 1}.wav`);
    try {
      await ctx.exec(ffmpeg, ["-y", "-v", "error", ...trim, "-i", c.file, "-vn", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", room]);
      rooms.push(room);
    } catch {
      /* a silent clip has no room tone — fine */
    }
  }
  const list = join(ctx.workDir, "cut.txt");
  writeFileSync(list, graded.map((g) => `file '${g}'`).join("\n") + "\n");
  const cut = join(ctx.workDir, "cut.mp4");
  await ctx.exec(ffmpeg, ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", cut]);
  const cutInfo = await probeMedia(cut);
  const DUR = cutInfo.duration_s ?? 0;

  // captions + logo in one filter graph
  const captions = (p.captions as Array<{ text: string; from: number; to: number }> | undefined) ?? [];
  const logo = p.logo as { file: string; width_frac?: number; x_frac?: number; y_frac?: number; from?: number } | undefined;
  const fontsDir = join(MEDIA_PATHS.h3Dir, "fonts");
  const font = existsSync(join(fontsDir, "Lato-Bold.ttf")) ? join(fontsDir, "Lato-Bold.ttf") : "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
  const fontsize = Math.max(18, Math.round(H / 48));
  const inputs = ["-i", cut];
  let fc = "";
  let last = "[0:v]";
  captions.forEach((c, i) => {
    const txt = join(ctx.workDir, `caption_${i + 1}.txt`);
    writeFileSync(txt, c.text);
    fc += `${last}drawtext=fontfile=${font}:textfile=${txt}:expansion=none:fontsize=${fontsize}:fontcolor=white:box=1:boxcolor=black@0.42:boxborderw=${Math.round(fontsize * 0.45)}:line_spacing=8:x=(w-tw)/2:y=h*0.845:enable='between(t,${c.from},${c.to})'[c${i}];`;
    last = `[c${i}]`;
  });
  if (logo) {
    if (!existsSync(logo.file)) throw new Error(`assemble: logo ${logo.file} does not exist`);
    inputs.push("-loop", "1", "-framerate", String(FPS), "-t", String(DUR), "-i", logo.file);
    const lw = Math.round(W * (logo.width_frac ?? 0.39));
    fc += `[1:v]scale=${lw}:-1,lumakey=threshold=0.09:tolerance=0.09:softness=0.05,format=rgba[lg];`;
    fc += `${last}[lg]overlay=x=(W-w)*${logo.x_frac ?? 0.5}:y=H*${logo.y_frac ?? 0.06}:enable='gte(t,${logo.from ?? 0})'[v]`;
    last = "[v]";
  } else if (fc) {
    fc = fc.replace(/\[c(\d+)\];$/, "[v]");
    last = "[v]";
  }
  const marked = join(ctx.workDir, "marked.mp4");
  if (fc) {
    await ctx.exec(ffmpeg, ["-y", "-v", "error", ...inputs, "-filter_complex", fc, "-map", "[v]", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-r", String(FPS), marked]);
  } else {
    copyFileSync(cut, marked);
  }

  // sound: spoken lines at their offsets over the engines' own room tone at a whisper
  const lines = (p.audio as Array<{ file: string; at: number }> | undefined) ?? [];
  const out = join(ctx.workDir, String(p.out));
  if (lines.length === 0 && rooms.length === 0) {
    await ctx.exec(ffmpeg, ["-y", "-v", "error", "-i", marked, "-c", "copy", out]);
  } else {
    const roomVol = Math.pow(10, num(p.room_tone_db, -20) / 20);
    const ai: string[] = ["-i", marked];
    let af = "";
    let mixIn = "";
    let n = 1;
    if (rooms.length > 0) {
      const rl = join(ctx.workDir, "rooms.txt");
      writeFileSync(rl, rooms.map((r) => `file '${r}'`).join("\n") + "\n");
      const roomAll = join(ctx.workDir, "room.wav");
      await ctx.exec(ffmpeg, ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", rl, "-filter:a", `highpass=f=90,volume=${roomVol.toFixed(4)}`, "-c:a", "pcm_s16le", roomAll]);
      ai.push("-i", roomAll);
      af += `[${n}:a]apad[a${n}];`;
      mixIn += `[a${n}]`;
      n += 1;
    }
    for (const l of lines) {
      if (!existsSync(l.file)) throw new Error(`assemble: audio ${l.file} does not exist`);
      ai.push("-i", l.file);
      const ms = Math.round(l.at * 1000);
      af += `[${n}:a]adelay=${ms}|${ms},apad[a${n}];`;
      mixIn += `[a${n}]`;
      n += 1;
    }
    af += `${mixIn}amix=inputs=${n - 1}:normalize=0:duration=first[aout]`;
    await ctx.exec(ffmpeg, ["-y", "-v", "error", ...ai, "-filter_complex", af, "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out]);
  }
  const info = await probeMedia(out);
  return { output_path: out, result: { file: out, duration_s: info.duration_s, width: info.video?.width ?? null, height: info.video?.height ?? null, clips: clips.length, captions: captions.length, audio_lines: lines.length } };
};

const probeEngine: EngineRunner = async (ctx) => {
  const p = ctx.params;
  const file = String(p.file);
  if (!existsSync(file)) throw new Error(`probe: ${file} does not exist`);
  const summary = await probeMedia(file);
  const dur = summary.duration_s ?? 0;
  const stamps = (p.at_seconds as number[] | undefined) ?? (summary.video && dur > 0 ? [0, dur / 2, Math.max(0, dur - 0.05)] : summary.video ? [0] : []);
  const frames = stamps.length ? await extractFrames(file, stamps, join(ctx.workDir, "frames")) : [];
  return { output_path: file, result: { ...summary, frames } };
};

/** Every kind a seat can still submit has a runner. "voice" is absent by his word of
 *  2026-09-15 and the type says so, so a future kind cannot be added to the enum and
 *  quietly forgotten here — Exclude keeps this map exhaustive against MediaKind. */
export const ENGINES: Record<Exclude<MediaKind, "voice">, EngineRunner> = {
  still: stillEngine,
  shoot: shootEngine,
  upscale: upscaleEngine,
  assemble: assembleEngine,
  probe: probeEngine,
};

// ── process plumbing ──────────────────────────────────────────────────────────

function systemdRunAvailable(): boolean {
  if (process.env.DXB_MEDIA_NO_SCOPE === "1") return false;
  return ["/usr/bin/systemd-run", "/bin/systemd-run"].some((p) => existsSync(p));
}

function spawnScoped(cmd: string, args: string[], opts: { cwd?: string; unit: string; log: (l: string) => void }): ChildProcess {
  const scoped = systemdRunAvailable();
  const [c, a] = scoped
    ? ["systemd-run", ["--user", "--scope", "-q", `--unit=${opts.unit}`, `-p`, `MemoryMax=${MEDIA_LIMITS.memoryMax}`, "-p", `MemorySwapMax=${MEDIA_LIMITS.swapMax}`, "--", cmd, ...args]]
    : [cmd, args];
  const child = spawn(c, a, { cwd: opts.cwd, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout?.on("data", (d) => opts.log(String(d)));
  child.stderr?.on("data", (d) => opts.log(String(d)));
  return child;
}

async function stopScoped(child: ChildProcess, unit: string): Promise<void> {
  if (systemdRunAvailable()) {
    await run("systemctl", ["--user", "kill", "--signal=SIGTERM", `${unit}.scope`]).catch(() => {});
  }
  child.kill("SIGTERM");
  for (let i = 0; i < 20 && child.exitCode === null; i++) await sleep(500);
  if (child.exitCode === null) {
    if (systemdRunAvailable()) await run("systemctl", ["--user", "kill", "--signal=SIGKILL", `${unit}.scope`]).catch(() => {});
    child.kill("SIGKILL");
  }
}

function makeExec(ctx: { job: MediaJobRow; log: (l: string) => void; cancelled: () => Promise<boolean>; deadline: number }): EngineContext["exec"] {
  let seq = 0;
  return (cmd, args, opts = {}) =>
    new Promise((resolvePromise, reject) => {
      seq += 1;
      const unit = opts.unit ?? `dxb-media-${ctx.job.id.slice(0, 8)}-${seq}`;
      const useScope = opts.scoped === true;
      const child = useScope
        ? spawnScoped(cmd, args, { cwd: opts.cwd, unit, log: ctx.log })
        : spawn(cmd, args, { cwd: opts.cwd, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
      let out = "";
      const onData = (d: Buffer) => {
        const s = String(d);
        out = (out + s).slice(-200_000);
        ctx.log(s);
      };
      if (!useScope) {
        child.stdout?.on("data", onData);
        child.stderr?.on("data", onData);
      } else {
        child.stdout?.on("data", (d) => { out = (out + String(d)).slice(-200_000); });
        child.stderr?.on("data", (d) => { out = (out + String(d)).slice(-200_000); });
      }
      ctx.log(`$ ${cmd} ${args.map((a) => (a.length > 80 ? a.slice(0, 77) + "…" : a)).join(" ")}${useScope ? `  [scope ${unit}]` : ""}`);
      // W8 (audit F022): WHY WE KILLED IT, remembered before the kill lands.
      // stopScoped waits up to 10 s for the child to die, so the process's own `close`
      // event always fires FIRST and used to settle the promise with
      //   "<cmd> exited null: …"
      // — a cancellation recorded as a failure. That is exactly what happened to job
      // 16277dac (cancel_requested=t, status=failed, error "python exited null: …").
      // The kill and the reason are set together; whichever handler wins the race now
      // tells the same story.
      let killedFor: "cancelled" | "deadline" | null = null;
      const watchdog = setInterval(() => {
        void (async () => {
          if (Date.now() > ctx.deadline) {
            clearInterval(watchdog);
            killedFor = "deadline";
            await stopScoped(child, unit);
            reject(new Error("deadline passed"));
          } else if (await ctx.cancelled()) {
            clearInterval(watchdog);
            killedFor = "cancelled";
            await stopScoped(child, unit);
            reject(new Error("cancelled"));
          }
        })();
      }, 5000);
      child.on("error", (err) => { clearInterval(watchdog); reject(err); });
      child.on("close", (code) => {
        clearInterval(watchdog);
        if (killedFor !== null) {
          reject(new Error(killedFor === "cancelled" ? "cancelled" : "deadline passed"));
          return;
        }
        if (code === 0) resolvePromise({ stdout: out, code: 0 });
        else reject(new Error(`${basename(cmd)} exited ${code}: ${out.slice(-600)}`));
      });
    });
}

// ── start-up recovery ─────────────────────────────────────────────────────────

/** Give back the jobs a dead process was holding.
 *
 *  W8 (audit F023/F026): a media job is claimed with `status='running'` and the running
 *  PROCESS is the only thing that would ever finish it. Kill that process — a restart, a
 *  crash, systemd's stop timeout expiring — and the row stays 'running' for ever: no lane
 *  will claim it (they claim 'queued'), no watchdog watches it, and the seat waiting on
 *  media_wait waits until its own deadline. Measured 2026-09-15: the lane had no recovery
 *  of any kind, and the scheduler was restarted twice that afternoon — both times safe only
 *  because a human measured `queued|running = 0` by hand first.
 *
 *  Called once when the lanes start. At that moment this process holds nothing, so any row
 *  still 'running' is an orphan by definition. It goes back to 'queued' rather than to
 *  'failed': the work was ordered and never refused, and a re-run is what a person would do.
 *  `cancel_requested` rows are the exception — they were on their way out, so they land in
 *  'cancelled' where they belong instead of being run again. Every move is audited. */
export async function recoverOrphanedMediaJobs(db: Kysely<DB>): Promise<{ requeued: number; cancelled: number }> {
  // `old` is read in the same statement: RETURNING sees the NEW row, and the one thing a
  // person needs from this log — WHICH lane was holding the job — is the value being erased.
  const rows = await sql<{ id: string; kind: string; cancel_requested: boolean; held_by: string | null }>`
    WITH old AS (SELECT id, claimed_by FROM media_jobs WHERE status = 'running' FOR UPDATE),
    moved AS (
      UPDATE media_jobs j
         SET status = CASE WHEN j.cancel_requested THEN 'cancelled' ELSE 'queued' END,
             claimed_by = NULL,
             started_at = NULL,
             error = CASE WHEN j.cancel_requested THEN j.error
                          ELSE 'orphaned: the lane process that held this job is gone; requeued on start-up (W8)' END,
             updated_at = now()
        FROM old
       WHERE j.id = old.id
      RETURNING j.id, j.kind, j.cancel_requested, old.claimed_by AS held_by
    )
    SELECT * FROM moved
  `.execute(db);
  if (rows.rows.length === 0) return { requeued: 0, cancelled: 0 };

  const requeued = rows.rows.filter((r) => !r.cancel_requested).length;
  const cancelled = rows.rows.length - requeued;
  for (const r of rows.rows) {
    console.log(
      `[media-lane] recovered orphan ${r.id.slice(0, 8)} (${r.kind}, held by ${r.held_by ?? "an unnamed lane"}) → ` +
        (r.cancel_requested ? "cancelled" : "queued"),
    );
  }
  await sql`
    INSERT INTO audit_log (actor, actor_type, action, payload)
    VALUES ('media-lane', 'system', 'media.recovered', ${JSON.stringify({
      requeued,
      cancelled,
      jobs: rows.rows.map((r) => r.id),
      reason: "start-up recovery: rows left running by a process that is gone (W8)",
    })}::jsonb)
  `.execute(db);
  return { requeued, cancelled };
}

// ── the lane ──────────────────────────────────────────────────────────────────

export interface MediaLaneOptions {
  db?: Kysely<DB>;
  laneId?: string;
  /** Claim only jobs of these departments (production omits it and spans all;
   *  a suite passes its own marker — the same isolation idiom as the task worker). */
  departments?: string[];
  /** Claim only jobs of these kinds — the GPU lane takes still/shoot/upscale, a CPU lane
   *  voice/assemble/probe (media-lanes.ts). Omitted = every kind (the historical single lane). */
  kinds?: readonly MediaKind[];
  engines?: Partial<Record<MediaKind, EngineRunner>>;
  resourceCheck?: (kind: MediaKind) => Promise<ResourceVerdict>;
  workRoot?: string;
}

export interface MediaLaneResult {
  claimed: boolean;
  jobId?: string;
  status?: "done" | "failed" | "cancelled";
  skipped?: string;
}

// one remembered reason per lane, so a busy card is said once by the GPU lane and never by the others
const lastSkipReason = new Map<string, string | null>();

async function appendAudit(db: Kysely<DB>, action: string, job: MediaJobRow, payload: Record<string, unknown>): Promise<void> {
  await db
    .insertInto("audit_log")
    .values({ actor: job.claimed_by ?? "media-lane", actor_type: "system", action, task_id: job.task_id, payload: JSON.stringify({ job_id: job.id, kind: job.kind, ...payload }) })
    .execute();
}

export async function runMediaLaneOnce(opts: MediaLaneOptions = {}): Promise<MediaLaneResult> {
  const db = opts.db ?? getDb();
  const laneId = opts.laneId ?? "media-lane";
  const engines = { ...ENGINES, ...(opts.engines ?? {}) };
  const check = opts.resourceCheck ?? defaultResourceCheck;
  const workRoot = opts.workRoot ?? MEDIA_PATHS.workRoot;

  const kinds = opts.kinds ? [...opts.kinds] : null;
  let peek = db.selectFrom("media_jobs").select(["id", "kind"]).where("status", "=", "queued");
  if (opts.departments) peek = peek.where("department", "in", opts.departments);
  if (kinds) peek = peek.where("kind", "in", kinds);
  const next = await peek.orderBy("created_at").limit(1).executeTakeFirst();
  if (!next) return { claimed: false };

  const verdict = await check(next.kind);
  if (!verdict.ok) {
    if (verdict.reason !== lastSkipReason.get(laneId)) {
      console.log(`[media-lane] ${laneId}: job ${next.id.slice(0, 8)} (${next.kind}) waits: ${verdict.reason}`);
      lastSkipReason.set(laneId, verdict.reason ?? null);
    }
    return { claimed: false, skipped: verdict.reason };
  }
  lastSkipReason.set(laneId, null);

  const scope = opts.departments ?? null;
  const claimed = await sql<MediaJobRow>`
    UPDATE media_jobs SET status = 'running', claimed_by = ${laneId}, started_at = now(), updated_at = now()
     WHERE id = (SELECT id FROM media_jobs
                  WHERE status = 'queued' AND (${scope}::text[] IS NULL OR department = ANY(${scope}::text[]))
                    AND (${kinds}::text[] IS NULL OR kind = ANY(${kinds}::text[]))
                  ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1)
    RETURNING *
  `.execute(db);
  const job = claimed.rows[0];
  if (!job) return { claimed: false };

  const workDir = join(workRoot, job.id);
  mkdirSync(workDir, { recursive: true });
  const logFile = join(workDir, "lane.log");
  const log = (line: string) => appendFileSync(logFile, line.endsWith("\n") ? line : line + "\n");
  log(`[${new Date().toISOString()}] ${job.kind} job ${job.id} claimed by ${laneId}`);

  const cancelled = async () => {
    const r = await db.selectFrom("media_jobs").select("cancel_requested").where("id", "=", job.id).executeTakeFirst();
    return r?.cancel_requested === true;
  };

  // telemetry: VRAM and RAM peaks every 2 s while the job runs
  let peakVram = 0;
  let peakRamGib = 0;
  const sampler = setInterval(() => {
    void (async () => {
      try {
        const mem = readFileSync("/proc/meminfo", "utf8");
        const kb = (k: string) => Number((mem.match(new RegExp(`^${k}:\\s+(\\d+)`, "m")) ?? [])[1] ?? 0);
        peakRamGib = Math.max(peakRamGib, (kb("MemTotal") - kb("MemAvailable")) / 1024 / 1024);
        if (GPU_KINDS.has(job.kind)) {
          const { stdout } = await run("nvidia-smi", ["--query-gpu=memory.used", "--format=csv,noheader,nounits"]);
          peakVram = Math.max(peakVram, Number(stdout.trim().split("\n")[0]) || 0);
        }
      } catch {
        /* telemetry never fails the job */
      }
    })();
  }, 2000);
  sampler.unref?.();

  const t0 = Date.now();
  const deadline = t0 + MEDIA_LIMITS.maxJobSeconds * 1000;
  const params = (typeof job.params === "string" ? JSON.parse(job.params) : job.params) as Record<string, any>;
  const ctx: EngineContext = { job, params, workDir, log, cancelled, exec: makeExec({ job, log, cancelled, deadline }) };
  let status: "done" | "failed" | "cancelled" = "done";
  try {
    const engine = engines[job.kind];
    if (!engine) throw new Error(`no engine for kind '${job.kind}'`);
    const out = await engine(ctx);
    const wall = (Date.now() - t0) / 1000;
    await db
      .updateTable("media_jobs")
      .set({
        status: "done", ended_at: sql`now()`, updated_at: sql`now()`,
        wall_seconds: Math.round(wall * 10) / 10,
        peak_vram_mib: peakVram || null, peak_ram_gib: peakRamGib ? Math.round(peakRamGib * 10) / 10 : null,
        output_path: out.output_path, result: JSON.stringify(out.result), error: null,
      })
      .where("id", "=", job.id)
      .execute();
    log(`[${new Date().toISOString()}] done in ${wall.toFixed(1)} s → ${out.output_path ?? "(no file)"}`);
    await appendAudit(db, "media.done", job, { wall_s: Math.round(wall * 10) / 10, output_path: out.output_path });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    status = message === "cancelled" ? "cancelled" : "failed";
    const wall = (Date.now() - t0) / 1000;
    await db
      .updateTable("media_jobs")
      .set({
        status, ended_at: sql`now()`, updated_at: sql`now()`,
        wall_seconds: Math.round(wall * 10) / 10,
        peak_vram_mib: peakVram || null, peak_ram_gib: peakRamGib ? Math.round(peakRamGib * 10) / 10 : null,
        error: message.slice(0, 2000),
      })
      .where("id", "=", job.id)
      .execute();
    log(`[${new Date().toISOString()}] ${status}: ${message}`);
    await appendAudit(db, status === "cancelled" ? "media.cancelled" : "media.failed", job, { error: message.slice(0, 300) });
  } finally {
    clearInterval(sampler);
  }
  return { claimed: true, jobId: job.id, status };
}
