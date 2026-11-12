// B43 dxb-motion-graphics (CEO 2026-11-12) — THE FILM IS MEASURED, NOT BELIEVED.
//
// `mg` is the one command of the motion-graphics skill: it lays a job folder out, takes exact-time
// stills, renders through HyperFrames at the guarded version, puts each sound's start, peak or end on
// its event, and verifies the finished file. These tests run the real tools on this machine — a short
// film is rendered, probed with ffprobe and its audio decoded — and every expected figure is either
// written here as a literal or measured by this file's own ffmpeg call, never by `mg`'s own code.
//
// HyperFrames is only ever started from inside a job folder: an `npx` call from the repository root
// rewrote the repository's package.json on 2026-11-12, so the last test holds that file to its hash.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdtempSync, readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mg as mgCommand, run } from "../../tools/motion-graphics/mg.mjs";

// mg waits on every process it starts, so this thread's event loop stands still while a command works,
// and vitest's worker must answer its runner within 60 s. After each command the loop gets one turn
// (measured 2026-11-12: without it the green run ended with 'Timeout calling "onTaskUpdate"').
const mg: typeof mgCommand = async (argv, options) => {
  const result = await mgCommand(argv, options);
  await new Promise((turn) => setImmediate(turn));
  return result;
};

const REPO = join(__dirname, "..", "..");
const MG = join(REPO, "tools/motion-graphics/mg.mjs");
const TEMPLATES = join(REPO, "packages/gateway/plugins/dxb-motion-graphics/skills/dxb-motion-graphics/templates");
const FIRST_GOOD = "0.9.38";
const FPS = 30;
const ONE_FRAME = 1 / FPS;
const RATE = 48000;

const sha = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");
const repoPackageJson = sha(join(REPO, "package.json"));

function sh(cmd: string, args: string[], cwd?: string) {
  const r = spawnSync(cmd, args, { cwd, encoding: "buffer", maxBuffer: 1 << 28, env: { ...process.env, HYPERFRAMES_NO_TELEMETRY: "1" } });
  return { code: r.status ?? -1, out: r.stdout ?? Buffer.alloc(0), err: String(r.stderr ?? "") };
}

// A missing tool is said out loud and the suite is skipped; it never passes in silence.
const missing = [
  ["ffmpeg", sh("ffmpeg", ["-version"]).code],
  ["ffprobe", sh("ffprobe", ["-version"]).code],
  ["HyperFrames", sh("npx", ["--yes", `hyperframes@${FIRST_GOOD}`, "--version"], tmpdir()).code],
  ["Blender", sh("blender", ["--version"]).code],
].filter(([, code]) => code !== 0).map(([tool]) => tool as string);
for (const tool of missing) console.error(`SKIPPED: ${tool} missing`);

type Call = { cmd: string; args: string[]; cwd?: string; env?: Record<string, string> };
type Result = { code: number; out: string | Buffer; err: string };

/** The real runner with a record of every process `mg` starts; `fake` answers a call instead of the machine. */
function recorder(fake: (cmd: string, args: string[]) => Result | undefined = () => undefined) {
  const calls: Call[] = [];
  return {
    calls,
    run: (cmd: string, args: string[], opts: { cwd?: string; env?: Record<string, string> } = {}) => {
      calls.push({ cmd, args, cwd: opts.cwd, env: opts.env });
      return fake(cmd, args) ?? run(cmd, args, opts);
    },
  };
}

async function initJob(extra: string[] = []): Promise<string> {
  const job = join(mkdtempSync(join(tmpdir(), "mg-")), "job");
  const r = await mg(["init", job, "--title", "Fixture film", "--w", "640", "--h", "360", "--fps", String(FPS), "--dur", "3", ...extra]);
  expect(r.out).toMatch(/mg init/);
  expect(r.code).toBe(0);
  return job;
}

function editJson(file: string, change: (v: any) => void): void {
  const v = JSON.parse(readFileSync(file, "utf8"));
  change(v);
  writeFileSync(file, JSON.stringify(v, null, 2) + "\n");
}

function probe(file: string) {
  const r = sh("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries",
    "stream=width,height,r_frame_rate,nb_read_frames,pix_fmt:format=duration", "-of", "json", file]);
  const j = JSON.parse(r.out.toString());
  const s = j.streams[0];
  return { w: s.width, h: s.height, fps: s.r_frame_rate, frames: Number(s.nb_read_frames), duration: Number(j.format.duration), pixFmt: s.pix_fmt as string };
}

/** The film's sound as this file hears it: mono samples at 48 kHz, empty when the film carries none. */
function samples(file: string): Float32Array {
  const r = sh("ffmpeg", ["-v", "error", "-i", file, "-vn", "-ac", "1", "-ar", String(RATE), "-f", "f32le", "-"]);
  if (r.code !== 0 || r.out.length === 0) return new Float32Array(0);
  return new Float32Array(r.out.buffer, r.out.byteOffset, Math.floor(r.out.length / 4));
}
function loudestAt(x: Float32Array): number {
  let at = 0;
  for (let i = 1; i < x.length; i++) if (Math.abs(x[i]) > Math.abs(x[at])) at = i;
  return at / RATE;
}
function firstSoundAt(x: Float32Array, above = 0.01): number {
  for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > above) return i / RATE;
  return NaN;
}
function integratedLufs(file: string): number {
  const r = sh("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-vn", "-af", "ebur128", "-f", "null", "-"]);
  const m = r.err.match(/Integrated loudness:\s*\n\s*I:\s*(-?[\d.]+) LUFS/);
  return m ? Number(m[1]) : NaN;
}

/** A steady quiet tone that is audible from its first sample, with one loud burst exactly 300 ms in. */
function blip(file: string): void {
  const tone = "0.05*sin(2*PI*330*t)+0.8*sin(2*PI*1320*t)*exp(-pow((t-0.3)/0.012\\,2))";
  const r = sh("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `aevalsrc=${tone}:s=${RATE}:d=1.2`, "-c:a", "pcm_s16le", file]);
  expect(r.err).toBe("");
}

const film = (job: string, name: string) => join(job, "out", name);
const verdict = (job: string) => JSON.parse(readFileSync(join(job, "out", "verify.json"), "utf8"));

describe.skipIf(missing.length > 0)("B43 dxb-motion-graphics — the job folder and the picture", () => {
  let job = "";
  let stateDir = "";
  beforeAll(async () => {
    stateDir = mkdtempSync(join(tmpdir(), "mg-state-"));
    process.env.DXB_MG_STATE = stateDir;
    job = await initJob();
  });

  it("init lays the job out and its page passes HyperFrames' own lint", () => {
    for (const d of ["assets", "refs", "board", "page", "page/fonts", "page/lib", "sound", "out"]) expect(existsSync(join(job, d)), d).toBe(true);
    for (const f of ["job.json", "page/index.html", "page/play.js", "board/board.json", "board/board.html", "sound/cues.json"]) expect(existsSync(join(job, f)), f).toBe(true);
    // HyperFrames serves the page's own folder only (a "../" path is a lint error and a 404 in its browser,
    // measured 2026-11-12), so the page reaches the job's material through links that stand inside page/.
    for (const d of ["assets", "refs", "sound"]) {
      expect(lstatSync(join(job, "page", d)).isSymbolicLink(), d).toBe(true);
      expect(realpathSync(join(job, "page", d))).toBe(realpathSync(join(job, d)));
    }
    const j = JSON.parse(readFileSync(join(job, "job.json"), "utf8"));
    expect(j).toMatchObject({ title: "Fixture film", formats: [{ name: "16x9", w: 640, h: 360 }], fps: FPS, lufs: null, spec: false, brand: "" });
    const html = readFileSync(join(job, "page/index.html"), "utf8");
    expect(html).toMatch(/<div id="stage"[^>]*data-composition-id="film"[^>]*data-width="640"[^>]*data-height="360"[^>]*data-duration="3"[^>]*data-no-timeline/);
    expect(html).toMatch(/<!-- mg:sound:begin -->\s*<!-- mg:sound:end -->/);
    const lint = sh("npx", ["--yes", `hyperframes@${FIRST_GOOD}`, "lint", "page", "--json"], job);
    const found = JSON.parse(lint.out.toString());
    expect(found.findings).toEqual([]);
    expect(found.errorCount).toBe(0);
  }, 60_000);

  it("init never writes over a job that is already there", async () => {
    const before = sha(join(job, "page/index.html"));
    const again = await mg(["init", job, "--title", "Other"]);
    expect(again.code).not.toBe(0);
    expect(sha(join(job, "page/index.html"))).toBe(before);
  });

  it("prints the film's events and beats, every one inside the film", async () => {
    const r = await mg(["events", "--job", job]);
    expect(r.code).toBe(0);
    const timing = JSON.parse(r.out);
    expect(timing.TOTAL).toBe(3);
    expect(timing.EVENTS.length).toBeGreaterThanOrEqual(2);
    for (const e of timing.EVENTS) {
      expect(typeof e.name).toBe("string");
      expect(e.t).toBeGreaterThanOrEqual(0);
      expect(e.t).toBeLessThanOrEqual(3);
    }
    expect(Object.keys(timing.BEATS).length).toBeGreaterThanOrEqual(2);
  });

  it("draws the same pixels for the same time, and other pixels half a second later", async () => {
    const still = join(job, "out/stills/16x9/at-2s.png");
    expect((await mg(["stills", "2.0", "--job", job])).code).toBe(0);
    const first = sha(still);
    expect((await mg(["stills", "2.0", "--job", job])).code).toBe(0);
    expect(sha(still)).toBe(first);
    expect((await mg(["stills", "2.5", "--job", job])).code).toBe(0);
    expect(sha(join(job, "out/stills/16x9/at-2.5s.png"))).not.toBe(first);
  }, 120_000);

  it("lays the film, and the moments around every event, out as contact sheets", async () => {
    const sheets = join(job, "out/sheets/16x9");
    expect((await mg(["sheet", "--job", job])).code).toBe(0);
    expect(readFileSync(join(sheets, "film.jpg")).subarray(0, 3).toString("hex")).toBe("ffd8ff");
    expect((await mg(["sheet", "--around-events", "--n", "3", "--job", job])).code).toBe(0);
    const events: { name: string }[] = JSON.parse((await mg(["events", "--job", job])).out).EVENTS;
    expect(readdirSync(sheets).filter((f) => f.startsWith("event-")).sort()).toEqual(events.map((e) => `event-${e.name}.jpg`).sort());
  }, 120_000);

  it("renders the whole film at the size, rate and length the job states, from inside the job folder", async () => {
    const rec = recorder();
    const r = await mg(["render", "--job", job], { run: rec.run });
    expect(r.out).toMatch(/fixture-film-16x9\.mp4/);
    expect(r.code).toBe(0);
    const p = probe(film(job, "fixture-film-16x9.mp4"));
    expect(p).toMatchObject({ w: 640, h: 360, fps: "30/1", frames: 90 });
    expect(Math.abs(p.duration - 3)).toBeLessThan(0.02);

    const hf = rec.calls.filter((c) => c.cmd === "npx");
    expect(hf.length).toBeGreaterThanOrEqual(1);
    for (const c of hf) {
      expect(c.args.slice(0, 2)).toEqual(["--yes", `hyperframes@${FIRST_GOOD}`]);
      expect(c.cwd).toBe(job);
      expect(c.env?.HYPERFRAMES_NO_TELEMETRY).toBe("1");
    }
    const words = rec.calls.flatMap((c) => [c.cmd, ...c.args]);
    for (const banned of ["publish", "share", "cloud", "lambda", "--end", "--start"]) expect(words).not.toContain(banned);
  }, 120_000);

  it("refuses a partial render, and nothing is started", async () => {
    for (const flag of [["--end", "2"], ["--start", "1"]]) {
      const rec = recorder();
      const r = await mg(["render", ...flag, "--job", job], { run: rec.run });
      expect(r.code).not.toBe(0);
      expect(r.out).toMatch(new RegExp(`${flag[0]}.*software`, "s"));
      expect(rec.calls).toEqual([]);
    }
    const cli = sh("node", [MG, "render", "--end", "2", "--job", job]);
    expect(cli.code).not.toBe(0);
    expect(cli.out.toString() + cli.err).toMatch(/--end/);
  });

  it("fails a render whose page reports a software GL renderer, and keeps no film from it", async () => {
    // The line is the bench's own, 2026-11-12: what a page reported under a render cut with --end.
    const software = "[Browser] mg:gl ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)\n";
    const other = await initJob();
    const rec = recorder((cmd, args) => (cmd === "npx" && args.includes("render") ? { code: 0, out: software, err: "" } : undefined));
    const r = await mg(["render", "--job", other], { run: rec.run });
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/software/i);
    expect(readdirSync(join(other, "out")).filter((f) => /\.(mp4|mov)$/.test(f))).toEqual([]);
  });

  it("renders one file per format, each at its own size", async () => {
    editJson(join(job, "job.json"), (j) => j.formats.push({ name: "9x16", w: 360, h: 640 }));
    const r = await mg(["render", "--format", "all", "--job", job]);
    expect(r.code).toBe(0);
    expect(probe(film(job, "fixture-film-16x9.mp4"))).toMatchObject({ w: 640, h: 360, frames: 90 });
    expect(probe(film(job, "fixture-film-9x16.mp4"))).toMatchObject({ w: 360, h: 640, frames: 90 });
    expect((await mg(["render", "--format", "4x5", "--job", job])).code).not.toBe(0);
  }, 180_000);

  it("renders a larger master by whole multiples only, and a transparent one", async () => {
    const big = await mg(["render", "--scale", "3", "--job", job]);
    expect(big.code).toBe(0);
    expect(probe(film(job, "fixture-film-16x9-3x.mp4"))).toMatchObject({ w: 1920, h: 1080, frames: 90 });
    expect((await mg(["render", "--scale", "7", "--job", job])).code).not.toBe(0);

    const clear = await mg(["render", "--alpha", "--job", job]);
    expect(clear.code).toBe(0);
    const mov = film(job, "fixture-film-16x9.mov");
    expect(probe(mov).pixFmt).toMatch(/^yuva/);
    const corner = sh("ffmpeg", ["-v", "error", "-i", mov, "-frames:v", "1", "-vf", "crop=1:1:0:0", "-pix_fmt", "rgba", "-f", "rawvideo", "-"]);
    expect(corner.out[3]).toBe(0);
  }, 240_000);

  it("verify passes every film in out/ and names what only an eye or an ear can settle", async () => {
    const r = await mg(["verify", "--job", job]);
    expect(r.out).toMatch(/UNVERIFIED/);
    expect(r.code).toBe(0);
    const v = verdict(job);
    expect(v.ok).toBe(true);
    expect(v.films.map((f: any) => f.file).sort()).toEqual(["fixture-film-16x9-3x.mp4", "fixture-film-16x9.mov", "fixture-film-16x9.mp4", "fixture-film-9x16.mp4"]);
    expect(v.unverified.length).toBeGreaterThanOrEqual(1);
  }, 120_000);

  it("renders at another frame rate when asked, names the film by it, and verify holds it to that rate", async () => {
    const r = await mg(["render", "--fps", "24", "--job", job]);
    expect(r.code).toBe(0);
    expect(probe(film(job, "fixture-film-16x9-24fps.mp4"))).toMatchObject({ w: 640, h: 360, fps: "24/1", frames: 72 });
    expect((await mg(["verify", "fixture-film-16x9-24fps.mp4", "--job", job])).code).toBe(0);
  }, 120_000);

  it("--4k asks HyperFrames for the 4K size the format reaches by a whole multiple", async () => {
    // The render itself is stopped here: what is held is the size mg asks for (640×360 × 6 = 3840×2160).
    const rec = recorder((cmd, args) => (cmd === "npx" && args.includes("render") ? { code: 1, out: "", err: "stopped by the test" } : undefined));
    expect((await mg(["render", "--4k", "--job", job], { run: rec.run })).code).not.toBe(0);
    const asked = rec.calls.find((c) => c.cmd === "npx")!.args;
    expect(asked.slice(asked.indexOf("--resolution"), asked.indexOf("--resolution") + 2)).toEqual(["--resolution", "landscape-4k"]);
    expect((await mg(["render", "--4k", "--scale", "3", "--job", job])).code).not.toBe(0);
  });

  it("verify goes red on a film that declares a cue and carries no sound", async () => {
    blip(join(job, "sound/blip.wav"));
    writeFileSync(join(job, "sound/cues.json"), JSON.stringify([{ at: 1.5, file: "sound/blip.wav", align: "peak", db: 0 }]));
    const r = await mg(["verify", "fixture-film-16x9.mp4", "--job", job]);
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/silent/i);
    expect(verdict(job).ok).toBe(false);
  }, 60_000);

  it("draws the storyboard board as one image", async () => {
    editJson(join(job, "board/board.json"), (b) => (b.shots[0].becomes = "Its corners come out as it turns: the dot is a square."));
    const r = await mg(["board", "--job", job]);
    expect(r.code).toBe(0);
    const png = readFileSync(join(job, "board/board.png"));
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBeGreaterThanOrEqual(1600);
    const shots = JSON.parse(readFileSync(join(job, "board/board.json"), "utf8")).shots;
    const page = readFileSync(join(job, "board/board.html"), "utf8");
    expect(shots.length).toBeGreaterThanOrEqual(2);
    expect(page).toContain("the dot is a square.");
    for (const s of shots) expect(page).toContain(JSON.stringify(s.becomes).slice(1, -1));
    expect(readFileSync(join(TEMPLATES, "board.html"), "utf8")).toContain("Approve this, or say what to change, before anything is animated.");
  }, 60_000);
});

describe.skipIf(missing.length > 0)("B43 dxb-motion-graphics — a sound sits on its event by the point the cue names", () => {
  let job = "";
  const mp4 = () => film(job, "fixture-film-16x9.mp4");
  const cues = (list: unknown[]) => writeFileSync(join(job, "sound/cues.json"), JSON.stringify(list, null, 2));
  beforeAll(async () => {
    process.env.DXB_MG_STATE = mkdtempSync(join(tmpdir(), "mg-state-"));
    job = await initJob();
    blip(join(job, "sound/blip.wav"));
  });

  it("align peak: the burst 300 ms into the file lands on 1.5 s of the film", async () => {
    cues([{ at: 1.5, file: "sound/blip.wav", align: "peak", db: 0, fadeOut: 0.05 }]);
    const planned = await mg(["sound", "--job", job]);
    expect(planned.code).toBe(0);
    expect(planned.out).toMatch(/1\.200/); // the clip itself starts 300 ms before the event
    expect((await mg(["render", "--job", job])).code).toBe(0);

    const heard = samples(mp4());
    expect(Math.abs(loudestAt(heard) - 1.5)).toBeLessThanOrEqual(ONE_FRAME);
    expect(Math.abs(firstSoundAt(heard) - 1.2)).toBeLessThanOrEqual(ONE_FRAME);

    const r = await mg(["verify", "--job", job]);
    expect(r.code).toBe(0);
    const cue = verdict(job).films[0].cues[0];
    expect(cue.ok).toBe(true);
    expect(Math.abs(cue.measured - 1.5)).toBeLessThanOrEqual(ONE_FRAME);
  }, 180_000);

  it("verify goes red when the film's length and the page's FILM disagree", async () => {
    const page = join(job, "page/index.html");
    const html = readFileSync(page, "utf8");
    expect(html).toMatch(/TOTAL = 3\b/);
    writeFileSync(page, html.replace(/TOTAL = 3\b/, "TOTAL = 4"));
    const r = await mg(["verify", "--job", job]);
    writeFileSync(page, html);
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/duration/i);
  }, 60_000);

  it("verify holds the film to job.json's loudness within 1 LU", async () => {
    const lufs = integratedLufs(mp4());
    expect(Number.isFinite(lufs)).toBe(true);
    editJson(join(job, "job.json"), (j) => (j.lufs = lufs + 0.5));
    expect((await mg(["verify", "--job", job])).code).toBe(0);
    editJson(join(job, "job.json"), (j) => (j.lufs = lufs + 6));
    const off = await mg(["verify", "--job", job]);
    expect(off.code).not.toBe(0);
    expect(off.out).toMatch(/loudness/i);
    editJson(join(job, "job.json"), (j) => (j.lufs = null));
  }, 60_000);

  it("align start: the same file on a named event lands its first sample there", async () => {
    const timing = JSON.parse((await mg(["events", "--job", job])).out);
    const event = timing.EVENTS.find((e: any) => e.t >= 0.5 && e.t <= 1.6);
    expect(event, "an event with room for the 1.2 s sound").toBeTruthy();
    cues([{ event: event.name, file: "sound/blip.wav", align: "start", db: 0 }]);
    expect((await mg(["sound", "--job", job])).code).toBe(0);
    expect(readFileSync(join(job, "page/index.html"), "utf8").match(/<audio /g)).toHaveLength(1);
    expect((await mg(["render", "--job", job])).code).toBe(0);

    const heard = samples(mp4());
    expect(Math.abs(firstSoundAt(heard) - event.t)).toBeLessThanOrEqual(ONE_FRAME);
    expect(Math.abs(loudestAt(heard) - (event.t + 0.3))).toBeLessThanOrEqual(ONE_FRAME);
    expect((await mg(["verify", "--job", job])).code).toBe(0);
  }, 180_000);

  it("verify goes red when the cue moves and the film was not rendered again", async () => {
    cues([{ at: 2.0, file: "sound/blip.wav", align: "start", db: 0 }]);
    const r = await mg(["verify", "--job", job]);
    expect(r.code).not.toBe(0);
    expect(verdict(job).films[0].cues[0].ok).toBe(false);
  }, 60_000);

  it("a sound that would begin before the film is trimmed, and its peak still lands on the event", async () => {
    cues([{ at: 0.2, file: "sound/blip.wav", align: "peak", db: 0 }]);
    expect((await mg(["sound", "--job", job])).code).toBe(0);
    // The burst is 300 ms into the file and the event 200 ms into the film: the first 100 ms cannot be played.
    expect(readFileSync(join(job, "page/index.html"), "utf8")).toMatch(/<audio [^>]*data-start="0"[^>]*data-media-start="0\.1"/);
    expect((await mg(["render", "--job", job])).code).toBe(0);
    const heard = samples(mp4());
    expect(Math.abs(loudestAt(heard) - 0.2)).toBeLessThanOrEqual(ONE_FRAME);
    expect(firstSoundAt(heard)).toBeLessThanOrEqual(ONE_FRAME);
    expect((await mg(["verify", "--job", job])).code).toBe(0);
  }, 180_000);

  it("sound refuses a cue it cannot place", async () => {
    cues([{ event: "no-such-event", file: "sound/blip.wav", align: "peak" }]);
    expect((await mg(["sound", "--job", job])).out).toMatch(/no-such-event/);
    cues([{ at: 1, file: "sound/absent.wav", align: "start" }]);
    expect((await mg(["sound", "--job", job])).code).not.toBe(0);
  });
});

describe.skipIf(missing.length > 0)("B43 dxb-motion-graphics — the HyperFrames version guard", () => {
  let stateDir = "";
  const state = () => JSON.parse(readFileSync(join(stateDir, "hyperframes.json"), "utf8"));
  beforeAll(() => {
    stateDir = mkdtempSync(join(tmpdir(), "mg-state-"));
    process.env.DXB_MG_STATE = stateDir;
  });

  it("status names the first good version before anything is recorded, then the recorded one", async () => {
    const fresh = await mg(["hf", "status"]);
    expect(fresh.code).toBe(0);
    expect(fresh.out).toMatch(/good 0\.9\.38\b/);
    writeFileSync(join(stateDir, "hyperframes.json"), JSON.stringify({ good: "0.9.37" }));
    const r = await mg(["hf", "status"]);
    expect(r.out).toMatch(/good 0\.9\.37\b/);
    expect(r.out).toMatch(/latest \d+\.\d+\.\d+/);
  }, 60_000);

  it("a guard film that fails leaves the previous good version in place", async () => {
    const broken = join(mkdtempSync(join(tmpdir(), "mg-guard-")), "index.html");
    const guard = readFileSync(join(TEMPLATES, "guard/index.html"), "utf8");
    expect(guard).toMatch(/data-duration="5"/);
    writeFileSync(broken, guard.replace(/data-duration="5"/, 'data-duration="2"')); // a 2 s film where the page states 5
    const r = await mg(["hf", "update", "--guard", broken]);
    expect(r.code).not.toBe(0);
    expect(state().good).toBe("0.9.37");
  }, 180_000);

  it("a guard film that renders and verifies makes npm's latest the good version", async () => {
    const latest = (await mg(["hf", "status"])).out.match(/latest (\d+\.\d+\.\d+)/)![1];
    const r = await mg(["hf", "update"]);
    expect(r.out).toMatch(new RegExp(`good ${latest.replace(/\./g, "\\.")}`));
    expect(r.code).toBe(0);
    expect(state().good).toBe(latest);
    expect(state().good).not.toBe("0.9.37");

    const rec = recorder();
    const again = await mg(["hf", "update"], { run: rec.run });
    expect(again.code).toBe(0);
    expect(again.out).toMatch(/nothing to try/);
    expect(rec.calls.map((c) => c.cmd)).toEqual(["npm"]);
  }, 240_000);
});

describe.skipIf(missing.length > 0)("B43 dxb-motion-graphics — Blender starts only with room on the graphics card", () => {
  const dir = mkdtempSync(join(tmpdir(), "mg-blender-"));
  const scene = join(dir, "scene.py");
  writeFileSync(scene, [
    "import bpy, sys",
    'out = sys.argv[sys.argv.index("--") + 1]',
    "s = bpy.context.scene",
    's.render.engine = "BLENDER_WORKBENCH"',
    "s.render.resolution_x, s.render.resolution_y, s.render.resolution_percentage = 64, 36, 100",
    "s.render.filepath = out",
    "bpy.ops.render.render(write_still=True)",
    "",
  ].join("\n"));
  const card = (freeMb: number) => (cmd: string) => (cmd === "nvidia-smi" ? { code: 0, out: `${freeMb}\n`, err: "" } : undefined);

  it("refuses below the scene's need and starts nothing", async () => {
    const rec = recorder(card(900));
    const r = await mg(["blender", scene, "--need-mb", "4000"], { run: rec.run });
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/900.*4000|4000.*900/s);
    expect(rec.calls.map((c) => c.cmd)).toEqual(["nvidia-smi"]);
  });

  it("refuses by the default need of 4000 MB as well", async () => {
    const rec = recorder(card(3999));
    expect((await mg(["blender", scene], { run: rec.run })).code).not.toBe(0);
    expect(rec.calls.map((c) => c.cmd)).not.toContain("blender");
  });

  it("with room, runs the scene headless from factory settings and prints the frames written", async () => {
    const frame = join(dir, "frame.png");
    const rec = recorder(card(12000));
    const r = await mg(["blender", scene, "--need-mb", "4000", "--", frame], { run: rec.run });
    expect(r.code).toBe(0);
    const blender = rec.calls.find((c) => c.cmd === "blender")!;
    expect(blender.args).toEqual(["-b", "--factory-startup", "--python", scene, "--", frame]);
    expect(existsSync(frame)).toBe(true);
    expect(r.out).toContain(frame);
  }, 60_000);

  it("a scene that raises is a failure, though Blender itself exits 0 after a script error", async () => {
    const raising = join(dir, "raising.py");
    writeFileSync(raising, 'raise RuntimeError("the scene broke")\n');
    const r = await mg(["blender", raising], { run: recorder(card(12000)).run });
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/the scene broke/);
  }, 60_000);
});

describe("B43 dxb-motion-graphics — the repository is left as it was", () => {
  afterAll(() => {
    delete process.env.DXB_MG_STATE;
  });
  it("asked for no command, or one it does not have, names every command and fails", async () => {
    for (const argv of [[], ["publish"]]) {
      const r = await mg(argv);
      expect(r.code).not.toBe(0);
      for (const c of ["init", "board", "stills", "sheet", "events", "sound", "render", "verify", "hf", "blender"]) expect(r.out).toContain(`mg ${c}`);
    }
  });

  it("no run of this file touched the repository's package.json", () => {
    expect(sha(join(REPO, "package.json"))).toBe(repoPackageJson);
    expect(spawnSync("git", ["-C", REPO, "status", "--short", "package.json"], { encoding: "utf8" }).stdout).toBe("");
  });
});
