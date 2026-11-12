// B43 dxb-motion-graphics — what the three test files of `mg` share: the command itself, a record of
// the processes it starts, the tools a test may need, and sounds and films made by ffmpeg alone.
// Nothing here measures with `mg`'s own code: a fixture is built from literals, and a film is read
// back through this file's own ffprobe and ffmpeg calls.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect } from "vitest";
import { mg as mgCommand, run } from "../../tools/motion-graphics/mg.mjs";

export const REPO = join(__dirname, "..", "..");
export const MG = join(REPO, "tools/motion-graphics/mg.mjs");
export const SKILL = join(REPO, "packages/gateway/plugins/dxb-motion-graphics/skills/dxb-motion-graphics");
export const TEMPLATES = join(SKILL, "templates");
export const FIRST_GOOD = "0.9.38";
export const FPS = 30;
export const ONE_FRAME = 1 / FPS;
export const RATE = 48000;
export const FILM = "fixture-film-16x9.mp4"; // the first master of the job `initJob` makes

// mg waits on every process it starts, so this thread's event loop stands still while a command works,
// and vitest's worker must answer its runner within 60 s. After each command the loop gets one turn
// (measured 2026-11-12: without it the green run ended with 'Timeout calling "onTaskUpdate"').
export const mg: typeof mgCommand = async (argv, options) => {
  const result = await mgCommand(argv, options);
  await new Promise((turn) => setImmediate(turn));
  return result;
};

export const sha = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");

const TOOL_TIMEOUT = 300_000; // ms: a tool that never returns is a failure here, not a battery that never ends

export function sh(cmd: string, args: string[], cwd?: string) {
  const r = spawnSync(cmd, args, { cwd, encoding: "buffer", maxBuffer: 1 << 28, timeout: TOOL_TIMEOUT, env: { ...process.env, HYPERFRAMES_NO_TELEMETRY: "1" } });
  return { code: r.status ?? -1, out: r.stdout ?? Buffer.alloc(0), err: String(r.stderr ?? "") };
}

const TOOLS: Record<string, () => number> = {
  ffmpeg: () => sh("ffmpeg", ["-version"]).code,
  ffprobe: () => sh("ffprobe", ["-version"]).code,
  HyperFrames: () => sh("npx", ["--yes", `hyperframes@${FIRST_GOOD}`, "--version"], tmpdir()).code,
  Chrome: () => sh("/usr/bin/google-chrome", ["--version"]).code,
  Blender: () => sh("blender", ["--version"]).code,
};
/** Which of the named tools do not answer on this machine. */
export const missingTools = (...names: string[]) => names.filter((name) => TOOLS[name]() !== 0);

type Options = Parameters<typeof run>[2];
type Result = ReturnType<typeof run>;
export type Call = { cmd: string; args: string[]; cwd?: string; env?: Record<string, string>; code: number };

/** The real runner with a record of every process `mg` starts; `fake` answers a call instead of the machine. */
export function recorder(fake: (cmd: string, args: string[], options: Options) => Result | undefined = () => undefined) {
  const calls: Call[] = [];
  return {
    calls,
    run: (cmd: string, args: string[], options: Options = {}): Result => {
      const result = fake(cmd, args, options) ?? run(cmd, args, options);
      calls.push({ cmd, args, cwd: options.cwd, env: options.env, code: result.code });
      return result;
    },
  };
}

/** The HyperFrames version guard's state in a folder of this run's own, never the machine's. */
export function ownState(): string {
  return (process.env.DXB_MG_STATE = mkdtempSync(join(tmpdir(), "mg-state-")));
}

export async function initJob({ w = 640, h = 360, dur = 3 } = {}): Promise<string> {
  const job = join(mkdtempSync(join(tmpdir(), "mg-")), "job");
  const r = await mg(["init", job, "--title", "Fixture film", "--w", String(w), "--h", String(h), "--fps", String(FPS), "--dur", String(dur)]);
  expect(r.out).toMatch(/mg init/);
  expect(r.code).toBe(0);
  return job;
}

export function editJson(file: string, change: (v: any) => void): void {
  const v = JSON.parse(readFileSync(file, "utf8"));
  change(v);
  writeFileSync(file, JSON.stringify(v, null, 2) + "\n");
}

export const cues = (job: string, list: unknown[]) => writeFileSync(join(job, "sound/cues.json"), JSON.stringify(list, null, 2));
export const film = (job: string, name = FILM) => join(job, "out", name);
export const verdict = (job: string) => JSON.parse(readFileSync(join(job, "out", "verify.json"), "utf8"));

/**
 * The starter page made into one that asks for a WebGL context. With `reports` it writes the renderer
 * to <html data-gl>, as the page contract has a WebGL film do; without, it keeps the renderer to itself.
 */
export function askForWebGL(job: string, { reports = true } = {}): void {
  const page = join(job, "page/index.html");
  const said = reports ? "document.documentElement.dataset.gl = gl ? gl.getParameter(named ? named.UNMASKED_RENDERER_WEBGL : gl.RENDERER) : 'no WebGL';" : "";
  const asks = `<script>(() => { const gl = document.createElement('canvas').getContext('webgl'); const named = gl && gl.getExtension('WEBGL_debug_renderer_info'); ${said} })();</script>\n</head>`;
  writeFileSync(page, readFileSync(page, "utf8").replace("</head>", asks));
}

export function probe(file: string) {
  const r = sh("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries",
    "stream=width,height,r_frame_rate,nb_read_frames,pix_fmt:format=duration", "-of", "json", file]);
  const j = JSON.parse(r.out.toString());
  const s = j.streams[0];
  return { w: s.width, h: s.height, fps: s.r_frame_rate, frames: Number(s.nb_read_frames), duration: Number(j.format.duration), pixFmt: s.pix_fmt as string };
}

/** The film's sound as this file hears it: mono samples at 48 kHz, empty when the film carries none. */
export function samples(file: string): Float32Array {
  const r = sh("ffmpeg", ["-v", "error", "-i", file, "-vn", "-ac", "1", "-ar", String(RATE), "-f", "f32le", "-"]);
  if (r.code !== 0 || r.out.length === 0) return new Float32Array(0);
  return new Float32Array(r.out.buffer, r.out.byteOffset, Math.floor(r.out.length / 4));
}
export function loudestAt(x: Float32Array): number {
  let at = 0;
  for (let i = 1; i < x.length; i++) if (Math.abs(x[i]) > Math.abs(x[at])) at = i;
  return at / RATE;
}
export function firstSoundAt(x: Float32Array, above = 0.01): number {
  for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > above) return i / RATE;
  return NaN;
}
export function lastSoundAt(x: Float32Array, above = 0.01): number {
  for (let i = x.length - 1; i >= 0; i--) if (Math.abs(x[i]) > above) return i / RATE;
  return NaN;
}

/** A sound written by ffmpeg from a formula of `t`; two formulas separated by "|" make a stereo file. */
function sound(file: string, formula: string, seconds: number): void {
  const r = sh("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `aevalsrc=${formula}:s=${RATE}:d=${seconds}`, "-c:a", "pcm_s16le", file]);
  expect(r.err).toBe("");
}
/** A steady quiet tone that is audible from its first sample, with one loud burst exactly 300 ms in. */
export const blip = (file: string) => sound(file, "0.05*sin(2*PI*330*t)+0.8*sin(2*PI*1320*t)*exp(-pow((t-0.3)/0.012\\,2))", 1.2);
/** 1.2 s of file whose sound starts 200 ms in, has its one loud burst 500 ms in and ends 900 ms in. */
export const shaped = (file: string) => sound(file, "between(t\\,0.2\\,0.9)*(0.05*sin(2*PI*330*t)+0.8*sin(2*PI*1320*t)*exp(-pow((t-0.5)/0.012\\,2)))", 1.2);
/** One short tick whose loudest instant is 100 ms into the file. */
export const tick = (file: string) => sound(file, "0.7*sin(2*PI*1000*t)*exp(-pow((t-0.1)/0.01\\,2))", 0.4);
/** A stereo burst, loudest 200 ms in, whose right side is the left side upside down: averaged to mono it is silence. */
export function antiPhase(file: string): void {
  const left = "0.5*sin(2*PI*440*t)*exp(-pow((t-0.2)/0.03\\,2))";
  sound(file, `${left}|-${left}`, 0.5);
}
/** EBU Tech 3341's first reference signal: a 1 kHz sine at −23 dBFS on both sides, which reads −23.0 LUFS. */
export const ebuReference = (file: string, seconds: number) => sound(file, "0.0708*sin(2*PI*1000*t)|0.0708*sin(2*PI*1000*t)", seconds);

type Placed = { file: string; atMs: number; stereo?: boolean };
/**
 * A film made by ffmpeg alone: a black picture of the given size, rate and length, carrying each sound
 * from the millisecond given — a mono file on both sides, a stereo one as it is. No sound, no sound stream.
 */
export function makeFilm(file: string, { seconds = 3, w = 640, h = 360, fps = FPS, sounds = [] as Placed[] } = {}): void {
  const placed = sounds.map((s, i) => `[${i + 1}:a]${s.stereo ? "anull" : "pan=stereo|c0=c0|c1=c0"},adelay=${s.atMs}:all=1[s${i}]`);
  // Padded to the film's length and no further: an endless pad left ffmpeg running once (2026-11-12, not reproduced in 250 runs).
  const mixed = `${placed.join(";")};${sounds.map((_, i) => `[s${i}]`).join("")}amix=inputs=${sounds.length}:normalize=0,apad=whole_dur=${seconds}[a]`;
  const r = sh("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `color=c=black:s=${w}x${h}:r=${fps}:d=${seconds}`,
    ...sounds.flatMap((s) => ["-i", s.file]),
    ...(sounds.length ? ["-filter_complex", mixed, "-map", "0:v", "-map", "[a]", "-c:a", "aac", "-b:a", "192k", "-ar", String(RATE)] : []),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-t", String(seconds), file]);
  expect(r.err).toBe("");
}
