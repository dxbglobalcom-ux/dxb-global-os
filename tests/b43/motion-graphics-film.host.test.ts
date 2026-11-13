// B43 dxb-motion-graphics (CEO 2026-11-12) — THE FILM IS MEASURED, NOT BELIEVED: the films HyperFrames really renders.
//
// This is the host half of `mg`'s tests (see motion-graphics.test.ts for the three files). It needs
// HyperFrames through npx and npm's registry, and the system Chrome — none of which the construction
// sandbox has — so it stands in the battery's HOST_FILES. On this machine the tools are there: a
// missing one is a FAILURE here, never a skip. A short film is rendered, probed with ffprobe and its
// sound decoded, and every expected figure is a literal or measured by the fixtures' own ffmpeg call.
//
// HyperFrames is only ever started from inside a job folder: an `npx` call from the repository root
// rewrote the repository's package.json on 2026-11-12, so the last test holds that file to its hash.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { run } from "../../tools/motion-graphics/mg.mjs";
import {
  FILM, FIRST_GOOD, FPS, ONE_FRAME, REPO, TEMPLATES, askForWebGL, blip, cues, editJson, film, firstSoundAt, initJob, lastSoundAt,
  loudestAt, mg, missingTools, ownState, probe, recorder, samples, sh, sha, shaped, verdict,
} from "./motion-graphics-fixtures.js";

const repoPackageJson = sha(join(REPO, "package.json"));

describe("B43 dxb-motion-graphics — the tools the host half stands on", () => {
  it("ffmpeg, ffprobe, HyperFrames and Chrome answer on this machine", () => {
    expect(missingTools("ffmpeg", "ffprobe", "HyperFrames", "Chrome")).toEqual([]);
  }, 120_000);
});

describe("B43 dxb-motion-graphics — the picture, through HyperFrames", () => {
  let job = "";
  beforeAll(async () => {
    ownState();
    job = await initJob();
  });

  it("the page init lays out passes HyperFrames' own lint", () => {
    const lint = sh("npx", ["--yes", `hyperframes@${FIRST_GOOD}`, "lint", "page", "--json"], job);
    const found = JSON.parse(lint.out.toString());
    expect(found.findings).toEqual([]);
    expect(found.errorCount).toBe(0);
  }, 60_000);

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
    const p = probe(film(job));
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

  it("renders one file per format, each at its own size", async () => {
    editJson(join(job, "job.json"), (j) => j.formats.push({ name: "9x16", w: 360, h: 640 }));
    const r = await mg(["render", "--format", "all", "--job", job]);
    expect(r.code).toBe(0);
    expect(probe(film(job))).toMatchObject({ w: 640, h: 360, frames: 90 });
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

  it("verify passes every master in out/, the transparent one by its alpha channel", async () => {
    const r = await mg(["verify", "--job", job]);
    expect(r.out).toMatch(/UNVERIFIED/);
    expect(r.code).toBe(0);
    const v = verdict(job);
    expect(v.ok).toBe(true);
    expect(v.films.map((f: any) => f.file)).toEqual(["fixture-film-16x9-3x.mp4", "fixture-film-16x9.mov", FILM, "fixture-film-9x16.mp4"].map((name) => film(job, name)));
    const alpha = v.films[1].checks.find((c: any) => c.name === "alpha");
    expect(alpha).toMatchObject({ ok: true });
    expect(alpha.measured).toMatch(/^0 to \d+$/); // clear somewhere, drawn somewhere
  }, 120_000);

  it("renders at another frame rate when asked, names the film by it, and verify holds it to that rate", async () => {
    const r = await mg(["render", "--fps", "24", "--job", job]);
    expect(r.code).toBe(0);
    const slower = film(job, "fixture-film-16x9-24fps.mp4");
    expect(probe(slower)).toMatchObject({ w: 640, h: 360, fps: "24/1", frames: 72 });
    expect((await mg(["verify", slower, "--job", job])).code).toBe(0);
  }, 120_000);
});

describe("B43 dxb-motion-graphics — a film that asks for WebGL is kept only from a graphics card", () => {
  beforeAll(() => {
    ownState();
  });

  it("keeps the film this machine's card drew, and names the card", async () => {
    const job = await initJob();
    askForWebGL(job);
    const r = await mg(["render", "--job", job]);
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/, GL ANGLE \(/);
    expect(r.out).not.toMatch(/SwiftShader|llvmpipe/);
    expect(readdirSync(join(job, "out"))).toEqual([FILM]);
  }, 120_000);

  it("keeps nothing of a film HyperFrames really drew in software", async () => {
    // A render cut with --end falls to software WebGL without saying so (measured 2026-11-12). `mg` refuses
    // the flag, so the test slips it into the HyperFrames call: the film is really rendered, in software.
    const job = await initJob();
    askForWebGL(job);
    const cut = recorder((cmd, args, options) => (cmd === "npx" && args.includes("render") ? run(cmd, [...args, "--end", "1"], options) : undefined));
    const r = await mg(["render", "--job", job], { run: cut.run });
    expect(cut.calls.filter((c) => c.cmd === "npx").map((c) => c.code)).toEqual([0]); // HyperFrames rendered it
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/software GL renderer \(.*SwiftShader/);
    expect(readdirSync(join(job, "out"))).toEqual([]);
  }, 120_000);

  it("keeps nothing of a film whose page asks for WebGL and names no renderer", async () => {
    const job = await initJob();
    askForWebGL(job, { reports: false });
    const rec = recorder();
    const r = await mg(["render", "--job", job], { run: rec.run });
    expect(rec.calls.filter((c) => c.cmd === "npx").map((c) => c.code)).toEqual([0]);
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/no renderer line \(mg:gl\)/);
    expect(readdirSync(join(job, "out"))).toEqual([]);
  }, 120_000);
});

describe("B43 dxb-motion-graphics — a sound sits on its event by the point the cue names", () => {
  let job = "";
  const mp4 = () => film(job);
  beforeAll(async () => {
    ownState();
    job = await initJob();
    blip(join(job, "sound/blip.wav"));
    shaped(join(job, "sound/shaped.wav"));
  });

  it("align peak: the burst 300 ms into the file lands on 1.5 s of the film", async () => {
    cues(job, [{ at: 1.5, file: "sound/blip.wav", align: "peak", db: 0, fadeOut: 0.05 }]);
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

  it("a second cue declared 20 ms on, with the film not rendered again, is not heard in the one burst", async () => {
    cues(job, [{ at: 1.5, file: "sound/blip.wav", align: "peak", db: 0, fadeOut: 0.05 }, { at: 1.52, file: "sound/blip.wav", align: "peak", db: 0, fadeOut: 0.05 }]);
    const r = await mg(["verify", "--job", job]);
    expect(r.code).not.toBe(0);
    expect(verdict(job).films[0].cues.map((c: any) => c.heard)).toEqual([true, false]);
    expect(r.out).toMatch(/cue 2 \(sound\/blip\.wav\): not heard at its place/);
  }, 60_000);

  it("align start: the same file on a named event lands its first sample there", async () => {
    const timing = JSON.parse((await mg(["events", "--job", job])).out);
    const event = timing.EVENTS.find((e: any) => e.t >= 0.5 && e.t <= 1.6);
    expect(event, "an event with room for the 1.2 s sound").toBeTruthy();
    cues(job, [{ event: event.name, file: "sound/blip.wav", align: "start", db: 0 }]);
    expect((await mg(["sound", "--job", job])).code).toBe(0);
    expect(readFileSync(join(job, "page/index.html"), "utf8").match(/<audio /g)).toHaveLength(1);
    expect((await mg(["render", "--job", job])).code).toBe(0);

    const heard = samples(mp4());
    expect(Math.abs(firstSoundAt(heard) - event.t)).toBeLessThanOrEqual(ONE_FRAME);
    expect(Math.abs(loudestAt(heard) - (event.t + 0.3))).toBeLessThanOrEqual(ONE_FRAME);
    expect((await mg(["verify", "--job", job])).code).toBe(0);
  }, 180_000);

  it("verify goes red when the cue moves and the film was not rendered again", async () => {
    cues(job, [{ at: 2.0, file: "sound/blip.wav", align: "start", db: 0 }]);
    const r = await mg(["verify", "--job", job]);
    expect(r.code).not.toBe(0);
    expect(verdict(job).films[0].cues[0].ok).toBe(false);
  }, 60_000);

  it("align end: a sound that ends 900 ms into its file ends on 2.0 s of the film", async () => {
    // shaped.wav is silent until 200 ms, bursts 500 ms in and is silent again from 900 ms.
    cues(job, [{ at: 2.0, file: "sound/shaped.wav", align: "end", db: 0 }]);
    const planned = await mg(["sound", "--job", job]);
    expect(planned.code).toBe(0);
    expect(planned.out).toMatch(/the clip starts at 1\.100 s/); // 900 ms before the event
    expect((await mg(["render", "--job", job])).code).toBe(0);

    const heard = samples(mp4());
    expect(Math.abs(lastSoundAt(heard) - 2.0)).toBeLessThanOrEqual(ONE_FRAME);
    expect(Math.abs(firstSoundAt(heard) - 1.3)).toBeLessThanOrEqual(ONE_FRAME);
    expect(Math.abs(loudestAt(heard) - 1.6)).toBeLessThanOrEqual(ONE_FRAME);

    const r = await mg(["verify", "--job", job]);
    expect(r.code).toBe(0);
    const cue = verdict(job).films[0].cues[0];
    expect(cue).toMatchObject({ align: "end", ok: true });
    expect(Math.abs(cue.measured - 2.0)).toBeLessThanOrEqual(ONE_FRAME);
  }, 180_000);

  it("a sound that would begin before the film is trimmed, and its peak still lands on the event", async () => {
    cues(job, [{ at: 0.2, file: "sound/blip.wav", align: "peak", db: 0 }]);
    expect((await mg(["sound", "--job", job])).code).toBe(0);
    // The burst is 300 ms into the file and the event 200 ms into the film: the first 100 ms cannot be played.
    expect(readFileSync(join(job, "page/index.html"), "utf8")).toMatch(/<audio [^>]*data-start="0"[^>]*data-media-start="0\.1"/);
    expect((await mg(["render", "--job", job])).code).toBe(0);
    const heard = samples(mp4());
    expect(Math.abs(loudestAt(heard) - 0.2)).toBeLessThanOrEqual(ONE_FRAME);
    expect(firstSoundAt(heard)).toBeLessThanOrEqual(ONE_FRAME);
    expect((await mg(["verify", "--job", job])).code).toBe(0);
  }, 180_000);
});

describe("B43 dxb-motion-graphics — the storyboard is drawn as one image", () => {
  it("draws every shot: more shots make the image taller, other words make other pixels", async () => {
    const job = await initJob();
    const boardJson = join(job, "board/board.json"), page = join(job, "board/board.html"), png = join(job, "board/board.png");
    const draw = async () => {
      const r = await mg(["board", "--job", job]);
      expect(r.code).toBe(0);
      const image = readFileSync(png);
      expect(image.subarray(1, 4).toString()).toBe("PNG");
      expect(image.readUInt32BE(16)).toBeGreaterThanOrEqual(1600);
      return { height: image.readUInt32BE(20), pixels: sha(png) };
    };

    const starter = await draw(); // the starter board: three shots, one row
    expect((await draw()).pixels).toBe(starter.pixels); // the same board is the same image

    editJson(boardJson, (b) => (b.shots[0].becomes = "Its corners come out as it turns: the dot is a square."));
    const reworded = await draw();
    expect(reworded.pixels).not.toBe(starter.pixels);
    const shots = JSON.parse(readFileSync(boardJson, "utf8")).shots;
    expect(shots.length).toBe(3);
    for (const s of shots) expect(readFileSync(page, "utf8")).toContain(JSON.stringify(s.becomes).slice(1, -1));

    editJson(boardJson, (b) => {
      for (let n = 4; n <= 9; n++) b.shots.push({ n, from: n, to: n + 1, title: `Shot ${n}`, hold: "It holds.", becomes: "It becomes the next." });
    });
    const nine = await draw(); // nine shots stand in three rows
    expect(nine.height).toBeGreaterThan(reworded.height);
    expect(readFileSync(join(TEMPLATES, "board.html"), "utf8")).toContain("Approve this, or say what to change, before anything is animated.");

    // The measure itself is held to account: a board page whose loop draws no shot fails both readings.
    const drawing = "for (const shot of board.shots) {";
    expect(readFileSync(page, "utf8")).toContain(drawing);
    writeFileSync(page, readFileSync(page, "utf8").replace(drawing, "for (const shot of []) {"));
    const empty = await draw();
    expect(empty.height).toBeLessThan(nine.height);
    editJson(boardJson, (b) => (b.shots[0].becomes = "Other words that nothing draws."));
    expect((await draw()).pixels).toBe(empty.pixels);
  }, 120_000);
});

describe("B43 dxb-motion-graphics — the board carries the film's own frames", () => {
  /** A drawn board as this file sees it: its height, and how light it is from 0 (black) to 255, all of it averaged. */
  const drawn = (png: string) => {
    const light = sh("ffmpeg", ["-v", "error", "-i", png, "-vf", "scale=1:1:flags=area", "-pix_fmt", "gray", "-f", "rawvideo", "-"]);
    expect(light.err).toBe("");
    return { height: readFileSync(png).readUInt32BE(20), light: light.out[0] };
  };

  it("once the page is the job's own, each shot shows the film at its middle, in every format asked for", async () => {
    ownState();
    const job = await initJob({ more: ["--format", "9x16=360x640"] }), page = join(job, "page/index.html");
    const starter = await mg(["board", "--job", job]);
    expect(starter.out).toMatch(/without the film's frames: .*still the starter/);
    const bare = drawn(join(job, "board/board.png")); // pale paper and dark words

    // Other words on the rule: the starter is now a film of this job's own.
    expect(readFileSync(page, "utf8")).toContain("'Every', 'shot'");
    writeFileSync(page, readFileSync(page, "utf8").replace("'Every', 'shot'", "'Each', 'shot'"));
    const r = await mg(["board", "--format", "all", "--job", job]);
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/board\.png — 3 shot\(s\), 3 with the film's frame/);
    expect(r.out).toMatch(/board-9x16\.png — 3 shot\(s\), 3 with the film's frame/);
    for (const [format, w, h] of [["16x9", 640, 360], ["9x16", 360, 640]] as const)
      for (const middle of ["0.225", "0.825", "2.1"]) {
        const still = readFileSync(join(job, "out/stills", format, `at-${middle}s.png`));
        expect([still.readUInt32BE(16), still.readUInt32BE(20)], `${format} ${middle}`).toEqual([w, h]);
      }

    // The film's field is dark: three frames of it make the board taller and, all in all, darker.
    const wide = drawn(join(job, "board/board.png")), tall = drawn(join(job, "board/board-9x16.png"));
    expect(wide.height).toBeGreaterThan(bare.height);
    expect(tall.height).toBeGreaterThan(wide.height);
    expect(wide.light).toBeLessThan(bare.light - 15);
    expect(tall.light).toBeLessThan(bare.light - 15);
  }, 180_000);
});

/**
 * A film's page that draws no film: once loaded it measures page/lib/motion-blur.js on the canvases the
 * browser really gives, and says what it found in one line, `mg:blur <json>`. HyperFrames carries a
 * page's console into a render's output (into a still's it does not, measured 2026-11-13).
 */
const BLUR_MEASURED_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<script>
const FPS = ${FPS}, TOTAL = 1;
window.FILM = { W: 640, H: 360, FPS, TOTAL, BEATS: { start: 0 }, EVENTS: [{ name: 'measured', t: 0.5 }] };
</script>
<script src="lib/motion-blur.js"></script>
</head>
<body>
<div id="stage" data-composition-id="film" data-width="640" data-height="360" data-duration="1" data-no-timeline>
  <!-- mg:sound:begin -->
  <!-- mg:sound:end -->
</div>
<script>
const SIDE = 256, HALF_FLOATS = { colorType: 'float16' };
const canvasOf = side => Object.assign(document.createElement('canvas'), { width: side, height: side });
const frame = () => canvasOf(SIDE).getContext('2d');
const bytes = g => g.getImageData(0, 0, SIDE, SIDE).data;

// How far apart two pictures are: the largest difference in any channel of any pixel, in levels of
// 255, and how many of their bytes differ at all.
function apart(a, b) {
  let worst = 0, differing = 0;
  for (let i = 0; i < a.length; i++) {
    const d = Math.abs(a[i] - b[i]);
    if (d) differing++;
    if (d > worst) worst = d;
  }
  return { worst, differing };
}

// A still picture that rounding shows on: every level of grey, every level of clearness, a gradient,
// a half-clear sheet over all three, a round edge. It stands on a film's dark field.
const field = g => { g.fillStyle = '#1b222b'; g.fillRect(0, 0, SIDE, SIDE); };
function still(g) {
  for (let x = 0; x < 256; x++) { g.fillStyle = 'rgb(' + x + ', ' + x + ', ' + x + ')'; g.fillRect(x, 0, 1, 48); }
  for (let x = 0; x < 256; x++) { g.fillStyle = 'rgba(242, 184, 75, ' + x / 255 + ')'; g.fillRect(x, 64, 1, 48); }
  const ramp = g.createLinearGradient(0, 0, SIDE, 0);
  ramp.addColorStop(0, 'rgb(232, 100, 60)');
  ramp.addColorStop(1, 'rgb(244, 239, 230)');
  g.fillStyle = ramp;
  g.fillRect(0, 128, SIDE, 48);
  g.fillStyle = 'rgba(232, 100, 60, 0.5)';
  g.fillRect(20, 30, 200, 120);
  g.fillStyle = 'rgb(242, 184, 75)';
  g.beginPath();
  g.arc(128, 208, 40, 0, 2 * Math.PI);
  g.fill();
}

// Precision as it behaves, not as it is named. A white pixel has three quarters taken out of it six
// times and is then doubled eleven times; what is left of its solidness is read, of 255. Where the
// thin pixel was kept that is about half; 8 bits round it away to nothing on the way down.
function thinnedAndDoubled(kept) {
  const g = canvasOf(1).getContext('2d', kept);
  g.fillStyle = '#fff';
  g.fillRect(0, 0, 1, 1);
  g.globalAlpha = 0.75;
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 6; i++) g.fillRect(0, 0, 1, 1);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 11; i++) g.drawImage(g.canvas, 0, 0);
  const read = canvasOf(1).getContext('2d');
  read.drawImage(g.canvas, 0, 0);
  return read.getImageData(0, 0, 1, 1).data[3];
}

// A frame whose document makes canvases that give the usual 8 bits whatever they are asked for, as a
// browser without half floats does: the helper's layers are then real canvases of 8 bits.
const eightBitDocument = { createElement: () => {
  const canvas = document.createElement('canvas'), usual = canvas.getContext.bind(canvas);
  canvas.getContext = kind => usual(kind);
  return canvas;
} };
function eightBitFrame() {
  const g = frame();
  Object.defineProperty(g.canvas, 'ownerDocument', { value: eightBitDocument });
  return g;
}

// The still picture drawn once on the field, against the same picture exposed on \`g\` over a shutter
// through which nothing moves; with what the helper said its average was kept in.
function readBack(g, samples) {
  const once = frame();
  field(once);
  still(once);
  field(g);
  const said = MotionBlur.expose(g, 0.5, layer => still(layer), { samples, shutter: 0.5 / FILM.FPS });
  return { colorType: said.colorType, ...apart(bytes(once), bytes(g)) };
}

function measure() {
  const asked = canvasOf(1).getContext('2d', HALF_FLOATS);
  // One canvas drawn at one time, at another, and at the first again: a square that travels.
  const g = frame(), travels = (layer, time) => { layer.fillStyle = '#fff'; layer.fillRect(time * 200, 40, 60, 60); };
  const drawnAt = t => {
    g.clearRect(0, 0, SIDE, SIDE);
    field(g);
    MotionBlur.expose(g, t, travels, { samples: 16, shutter: 0.2 });
    return bytes(g);
  };
  const first = drawnAt(0.5), between = drawnAt(0.2), again = drawnAt(0.5);
  return {
    browser: navigator.userAgent.match(/[A-Za-z]*Chrome\\/[\\d.]+/)[0],
    context: asked.constructor.name,
    given: asked.getContextAttributes().colorType,
    usual: canvasOf(1).getContext('2d').getContextAttributes().colorType,
    thinned: { halfFloats: thinnedAndDoubled(HALF_FLOATS), eightBits: thinnedAndDoubled(undefined) },
    still: Object.fromEntries([1, 16, 64].map(samples => [samples, { halfFloats: readBack(frame(), samples), eightBits: readBack(eightBitFrame(), samples) }])),
    twice: apart(first, again),
    between: apart(first, between),
  };
}

window.renderAt = () => {};
window.ready = (async () => console.log('mg:blur ' + JSON.stringify(measure())))();
window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {}; window.__hf.buildReady.film = window.ready; window.addEventListener('hf-seek', e => renderAt(e.detail.time));
</script>
</body>
</html>
`;

describe("B43 dxb-motion-graphics — page/lib/motion-blur.js on the canvas HyperFrames' own Chrome gives", () => {
  let measured: any;
  beforeAll(async () => {
    ownState();
    const job = await initJob({ dur: 1 }), said: string[] = [];
    writeFileSync(join(job, "page/index.html"), BLUR_MEASURED_PAGE);
    const heard = recorder((cmd, args, options) => {
      const result = run(cmd, args, options);
      said.push(String(result.out) + result.err);
      return result;
    });
    const r = await mg(["render", "--job", job], { run: heard.run });
    expect(r.out).toMatch(/^mg render: /);
    const line = said.join("\n").match(/mg:blur (\{.*\})/);
    expect(line, "the page's one line in the render's output").toBeTruthy();
    measured = JSON.parse(line![1]);
  }, 120_000);

  it("asked for half floats, the browser gives a 2D canvas that names them and keeps what 8 bits round away", () => {
    expect(measured.browser).toMatch(/^HeadlessChrome\/\d+\./);
    expect(measured).toMatchObject({ context: "CanvasRenderingContext2D", given: "float16", usual: "unorm8" });
    // On paper: 0.75 is the alpha 191 of 255, so each thinning keeps 64/255; (64/255)^6 × 2^11 × 255 = 130.5.
    expect(Math.abs(measured.thinned.halfFloats - 130)).toBeLessThanOrEqual(2);
    expect(measured.thinned.eightBits).toBe(0);
  });

  it("a still picture reads back within a level of 255 of itself drawn once at 16 samples, within 2 at 64; in 8 bits it is further off, and the helper says which it had", () => {
    const worst = (kind: string) => [1, 16, 64].map((samples) => measured.still[samples][kind].worst);
    const said = (kind: string) => [...new Set([1, 16, 64].map((samples) => measured.still[samples][kind].colorType))];
    // Levels of 255, as HeadlessChrome 152.0.7977.30 gave them on 2026-11-13. The helper's own header and
    // references/craft.md state these figures: when they change here, they change there.
    expect(worst("halfFloats")).toEqual([1, 1, 2]);
    expect(worst("eightBits")).toEqual([1, 2, 5]);
    expect(said("halfFloats")).toEqual(["float16"]);
    expect(said("eightBits")).toEqual(["unorm8"]);
    // Up to 16 samples the average costs nothing at all: the bytes that differ are the ones a single sample differs in.
    expect(measured.still[16].halfFloats.differing).toBe(measured.still[1].halfFloats.differing);
    expect(measured.still[16].eightBits.differing).toBeGreaterThan(measured.still[16].halfFloats.differing);
  });

  it("the same canvas drawn again at the same time holds the same pixels, another time drawn between", () => {
    expect(measured.twice).toEqual({ worst: 0, differing: 0 });
    expect(measured.between.differing).toBeGreaterThan(0); // the measure tells two pictures apart
  });
});

describe("B43 dxb-motion-graphics — the HyperFrames version guard", () => {
  let stateDir = "";
  const state = () => JSON.parse(readFileSync(join(stateDir, "hyperframes.json"), "utf8"));
  const guardFilm = () => join(stateDir, "guard/out/guard-16x9.mp4");
  /** The guard page with one thing about it changed; the change must really be made. */
  const guardWith = (from: string, to: string) => {
    const guard = readFileSync(join(TEMPLATES, "guard/index.html"), "utf8"), changed = join(mkdtempSync(join(tmpdir(), "mg-guard-")), "index.html");
    expect(guard).toContain(from);
    writeFileSync(changed, guard.replace(from, to));
    return changed;
  };
  /** `mg hf update` with the changed guard: what it said, and the exit code of each HyperFrames render it started. */
  const tryGuard = async (changed: string) => {
    const rec = recorder();
    const r = await mg(["hf", "update", "--guard", changed], { run: rec.run });
    return { ...r, renders: rec.calls.filter((c) => c.cmd === "npx" && c.args.includes("render")).map((c) => c.code) };
  };
  beforeAll(() => {
    stateDir = ownState();
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

  it("a guard film of the wrong length is rendered, refused for its length, and the good version stays", async () => {
    const r = await tryGuard(guardWith('data-duration="5"', 'data-duration="2"')); // a 2 s film where the page states 5
    expect(r.renders).toEqual([0]); // HyperFrames ran and rendered: it is the film that was refused, not npm that failed
    expect(Math.abs(probe(guardFilm()).duration - 2)).toBeLessThan(0.05);
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/duration: 2(\.\d+)? where the job states 5/);
    expect(state().good).toBe("0.9.37");
  }, 180_000);

  it("a guard film whose picture stands still is refused: the page was not drawn at each frame's time", async () => {
    const r = await tryGuard(guardWith("window.addEventListener('hf-seek', e => renderAt(e.detail.time));", "")); // no frame is ever drawn again
    expect(r.renders).toEqual([0]);
    expect(probe(guardFilm()).frames).toBe(150); // a whole film of the right length, of one picture
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/the same picture at 0 s and 1 s/);
    expect(state().good).toBe("0.9.37");
  }, 180_000);

  it("a guard film drawn without WebGL is refused, and no film is kept", async () => {
    const r = await tryGuard(guardWith("const gl = canvas.getContext('webgl');", "const gl = null && canvas.getContext('webgl');"));
    expect(r.renders).toEqual([0]);
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/not a graphics card mg knows \(no WebGL\)/);
    expect(existsSync(guardFilm())).toBe(false);
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

describe("B43 dxb-motion-graphics — the repository is left as it was by the host half", () => {
  afterAll(() => {
    delete process.env.DXB_MG_STATE;
  });

  it("no run of this file touched the repository's package.json", () => {
    expect(sha(join(REPO, "package.json"))).toBe(repoPackageJson);
    expect(spawnSync("git", ["-C", REPO, "status", "--short", "package.json"], { encoding: "utf8" }).stdout).toBe("");
  });
});
