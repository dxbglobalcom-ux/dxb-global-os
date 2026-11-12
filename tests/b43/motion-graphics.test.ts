// B43 dxb-motion-graphics (CEO 2026-11-12) — THE FILM IS MEASURED, NOT BELIEVED.
//
// `mg` is the one command of the motion-graphics skill: it lays a job folder out, takes exact-time
// stills, renders through HyperFrames at the guarded version, puts each sound's start, peak or end on
// its event, and verifies the finished file. Its tests stand in three files, by the tools each needs:
//
//   motion-graphics.test.ts               (this one) node, ffmpeg and ffprobe — all the construction
//                                         sandbox has. Every film here is made by ffmpeg alone, and
//                                         where a test must cross HyperFrames the test answers for it.
//   motion-graphics-film.host.test.ts     HyperFrames, Chrome and npm: films really rendered.
//   motion-graphics-blender.host.test.ts  Blender.
//
// Every expected figure is a literal — the place a fixture's sound was put, a size, a reference
// level — or is measured by the fixtures' own ffmpeg call, never by `mg`'s own code.
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  FILM, FPS, MG, REPO, SKILL, TEMPLATES, antiPhase, askForWebGL, blip, cues, ebuReference, editJson, film, initJob,
  makeFilm, mg, missingTools, ownState, recorder, sh, sha, shaped, tick, verdict,
} from "./motion-graphics-fixtures.js";

const repoPackageJson = sha(join(REPO, "package.json"));

// A missing tool is said out loud and the tests that need it are skipped; they never pass in silence.
const missing = missingTools("ffmpeg", "ffprobe");
for (const tool of missing) console.error(`SKIPPED: ${tool} missing`);

/** HyperFrames answered by the test: nothing is started and nothing is written. */
const noHyperFrames = () => recorder((cmd) => (cmd === "npx" ? { code: 0, out: "", err: "" } : undefined));

describe("B43 dxb-motion-graphics — the job folder", () => {
  let job = "";
  beforeAll(async () => {
    ownState();
    job = await initJob();
  });

  it("init lays the job out", () => {
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
  });

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

  it("refuses a format name that is more than letters, digits, - and _, and writes nothing outside the job", async () => {
    const other = await initJob();
    // Joined onto out/stills/, this name would be a folder beside the job, not inside it.
    editJson(join(other, "job.json"), (j) => (j.formats[0].name = "../../../escaped"));
    const rec = noHyperFrames();
    for (const command of [["stills", "1"], ["sheet"], ["render"], ["verify"], ["events"]]) {
      const r = await mg([...command, "--job", other], { run: rec.run });
      expect(r.code, command[0]).not.toBe(0);
      expect(r.out, command[0]).toMatch(/format's "name" is letters, digits, "-" and "_" only/);
    }
    expect(rec.calls).toEqual([]);
    expect(existsSync(join(other, "..", "escaped"))).toBe(false);
  });

  it("refuses to write through a link that leads out of the job folder", async () => {
    const other = await initJob(), elsewhere = mkdtempSync(join(tmpdir(), "mg-elsewhere-"));
    rmSync(join(other, "out"), { recursive: true });
    symlinkSync(elsewhere, join(other, "out"), "dir");
    const rec = noHyperFrames();
    for (const command of [["stills", "1"], ["sheet"], ["render"], ["verify"]]) {
      const r = await mg([...command, "--job", other], { run: rec.run });
      expect(r.code, command[0]).not.toBe(0);
      expect(r.out, command[0]).toMatch(/leads out of the job folder/);
    }
    expect(rec.calls).toEqual([]);
    expect(readdirSync(elsewhere)).toEqual([]);
  });

  it("refuses the repository's root as a job folder, by whatever path it is reached", () => {
    // A copy of the tool stands in a small repository of its own, so the rule is tried on that copy's
    // root: this repository's root is never offered to `mg init`, which before the rule laid a job in it.
    const copy = mkdtempSync(join(tmpdir(), "mg-repository-"));
    cpSync(join(REPO, "tools/motion-graphics"), join(copy, "tools/motion-graphics"), { recursive: true });
    cpSync(TEMPLATES, join(copy, relative(REPO, TEMPLATES)), { recursive: true });
    const link = join(mkdtempSync(join(tmpdir(), "mg-link-")), "repository");
    symlinkSync(copy, link, "dir");
    const cli = (args: string[]) => {
      const r = sh("node", [join(copy, "tools/motion-graphics/mg.mjs"), ...args]);
      return { code: r.code, out: r.out.toString() };
    };

    const stood = readdirSync(copy).sort();
    for (const root of [copy, link]) {
      const made = cli(["init", root]);
      expect(made.out).toMatch(/repository's root/);
      expect(made.code).not.toBe(0);
    }
    expect(readdirSync(copy).sort()).toEqual(stood);

    // A job.json standing at the root does not make it a job; a folder inside it is one.
    writeFileSync(join(copy, "job.json"), JSON.stringify({ title: "Root", formats: [{ name: "16x9", w: 640, h: 360 }], fps: FPS }));
    for (const root of [copy, link]) {
      const opened = cli(["events", "--job", root]);
      expect(opened.out).toMatch(/repository's root/);
      expect(opened.code).not.toBe(0);
    }
    expect(cli(["init", join(copy, "jobs/one")]).code).toBe(0);
    expect(cli(["events", "--job", join(link, "jobs/one")]).code).toBe(0);
  });
});

describe.skipIf(missing.length > 0)("B43 dxb-motion-graphics — what a render is asked for, and which film is kept", () => {
  // The lines are real ones: this machine's graphics card on 2026-11-12, and what a page reported that
  // day under a render cut with --end.
  const CARD = "[Browser] mg:gl ANGLE (NVIDIA Corporation, NVIDIA GeForce RTX 5060 Ti/PCIe/SSE2, OpenGL ES 3.2)\n";
  const SOFTWARE = "[Browser] mg:gl ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)\n";
  /** HyperFrames answered by the test: a render that says `lines` and really writes a film where it was asked to. */
  const rendering = (lines: string) => recorder((cmd, args) => {
    if (cmd !== "npx" || !args.includes("render")) return undefined;
    makeFilm(args[args.indexOf("-o") + 1]);
    return { code: 0, out: lines, err: "" };
  });
  /** HyperFrames answered by the test: the render is stopped, so what is held is what `mg` asked for. */
  const stopped = () => recorder((cmd, args) => (cmd === "npx" && args.includes("render") ? { code: 1, out: "", err: "stopped by the test" } : undefined));
  const resolutionAsked = (calls: { cmd: string; args: string[] }[]) => {
    const asked = calls.find((c) => c.cmd === "npx")!.args;
    return asked.includes("--resolution") ? asked[asked.indexOf("--resolution") + 1] : null;
  };
  let job = "";
  beforeAll(async () => {
    ownState();
    job = await initJob();
  });

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

  it("--4k asks HyperFrames for the 4K size the format reaches by a whole multiple", async () => {
    const rec = stopped(); // 640×360 × 6 = 3840×2160
    expect((await mg(["render", "--4k", "--job", job], { run: rec.run })).code).not.toBe(0);
    expect(resolutionAsked(rec.calls)).toBe("landscape-4k");
    expect((await mg(["render", "--4k", "--scale", "3", "--job", job])).code).not.toBe(0);
  });

  it("--4k on a job that is 4K already renders it at its own size", async () => {
    for (const [w, h] of [[3840, 2160], [2160, 3840]]) {
      const native = await initJob({ w, h });
      const rec = stopped();
      const r = await mg(["render", "--4k", "--job", native], { run: rec.run });
      expect(r.out).toMatch(/stopped by the test/); // the render was reached: the size was not what refused it
      expect(resolutionAsked(rec.calls)).toBe(null);
    }
  });

  it("keeps a film that asks for WebGL only when the render names a graphics card", async () => {
    const webgl = await initJob();
    askForWebGL(webgl);
    const refused: [string, RegExp][] = [
      [SOFTWARE, /software/i],
      [CARD + SOFTWARE, /software/i],         // one of the render's browsers fell to software
      ["", /no renderer line \(mg:gl\)/],     // the page's line never reached the render's output
      ["[Browser] mg:gl no WebGL\n", /no WebGL/],
      ["[Browser] mg:gl Some Rasteriser 9\n", /Some Rasteriser 9/], // a name never seen is not a graphics card
    ];
    for (const [lines, why] of refused) {
      const rec = rendering(lines);
      const r = await mg(["render", "--job", webgl], { run: rec.run });
      expect(rec.calls.filter((c) => c.cmd === "npx").map((c) => c.code)).toEqual([0]); // the film was really written
      expect(r.code, lines).not.toBe(0);
      expect(r.out, lines).toMatch(why);
      expect(readdirSync(join(webgl, "out")), lines).toEqual([]); // and nothing of it is left: no film, no work folder
    }
    const kept = await mg(["render", "--job", webgl], { run: rendering(CARD).run });
    expect(kept.code).toBe(0);
    expect(readdirSync(join(webgl, "out"))).toEqual([FILM]);

    // A refused render leaves the film of an earlier good one as it was.
    const before = sha(film(webgl));
    expect((await mg(["render", "--job", webgl], { run: rendering(SOFTWARE).run })).code).not.toBe(0);
    expect(readdirSync(join(webgl, "out"))).toEqual([FILM]);
    expect(sha(film(webgl))).toBe(before);
  }, 60_000);

  it("a film that asks for no WebGL is kept without a renderer line, and never with a software one", async () => {
    // The starter page speaks of WebGL in a comment and asks for none.
    expect(readFileSync(join(job, "page/index.html"), "utf8")).toMatch(/WebGL/);
    const kept = await mg(["render", "--job", job], { run: rendering("").run });
    expect(kept.code).toBe(0);
    expect(readdirSync(join(job, "out"))).toEqual([FILM]);
    expect((await mg(["render", "--job", job], { run: rendering(SOFTWARE).run })).out).toMatch(/software/i);
  }, 60_000);
});

describe.skipIf(missing.length > 0)("B43 dxb-motion-graphics — a cue is planned by the point of the sound it names", () => {
  const INDEX = join(SKILL, "sfx/INDEX.md");
  /** What `mg sound` printed for each cue: the point it found in the file and where the clip starts, in seconds. */
  const planned = (out: string) => [...out.matchAll(/^cue (\d+)\s+(\S+)\s+its (start|peak|end) \(([\d.]+) s into the file\).* the clip starts at ([\d.]+) s/gm)]
    .map((line) => ({ n: Number(line[1]), file: line[2], align: line[3], point: Number(line[4]), start: Number(line[5]) }));
  let job = "";
  beforeAll(async () => {
    ownState();
    job = await initJob();
    blip(join(job, "sound/blip.wav"));
    shaped(join(job, "sound/shaped.wav"));
    antiPhase(join(job, "sound/anti-phase.wav"));
  });

  it("finds a sound's start, peak and end, and starts the clip so that point lands on the event", async () => {
    // The file's sound starts 200 ms in, bursts 500 ms in and ends 900 ms in; every cue sits on 1.5 s.
    cues(job, ["start", "peak", "end"].map((align) => ({ at: 1.5, file: "sound/shaped.wav", align })));
    const r = await mg(["sound", "--job", job]);
    expect(r.code).toBe(0);
    const [start, peak, end] = planned(r.out);
    expect(start).toMatchObject({ align: "start" });
    expect(peak).toMatchObject({ align: "peak" });
    expect(end).toMatchObject({ align: "end" });
    for (const [cue, point] of [[start, 0.2], [peak, 0.5], [end, 0.9]] as const) {
      expect(Math.abs(cue.point - point), cue.align).toBeLessThanOrEqual(0.001);
      expect(Math.abs(cue.start - (1.5 - point)), cue.align).toBeLessThanOrEqual(0.001);
    }
    const clips = readFileSync(join(job, "page/index.html"), "utf8").match(/<audio [^>]*>/g)!;
    expect(clips).toHaveLength(3);
    expect(clips[2]).toMatch(/src="sound\/shaped\.wav" data-start="0\.6"/);
  });

  it("a sound that would begin before the film is trimmed", async () => {
    cues(job, [{ at: 0.2, file: "sound/blip.wav", align: "peak", db: 0 }]);
    expect((await mg(["sound", "--job", job])).code).toBe(0);
    // The burst is 300 ms into the file and the event 200 ms into the film: the first 100 ms cannot be played.
    expect(readFileSync(join(job, "page/index.html"), "utf8")).toMatch(/<audio [^>]*data-start="0"[^>]*data-media-start="0\.1"/);
  });

  it("a stereo sound whose sides are in opposite phase is a sound, with its peak where it is", async () => {
    cues(job, [{ at: 1.0, file: "sound/anti-phase.wav", align: "peak" }]);
    const r = await mg(["sound", "--job", job]);
    expect(r.out).not.toMatch(/holds no sound/);
    expect(r.code).toBe(0);
    // The burst is loudest 200 ms in; its 440 Hz wave is 2.3 ms long, and the loudest stretch sits within one of it.
    expect(Math.abs(planned(r.out)[0].point - 0.2)).toBeLessThanOrEqual(0.0023);
  });

  it("sound refuses a cue it cannot place", async () => {
    cues(job, [{ event: "no-such-event", file: "sound/blip.wav", align: "peak" }]);
    expect((await mg(["sound", "--job", job])).out).toMatch(/no-such-event/);
    cues(job, [{ at: 1, file: "sound/absent.wav", align: "start" }]);
    expect((await mg(["sound", "--job", job])).code).not.toBe(0);
  });

  it("the starter set's index states, for every file, the peak `mg sound` puts on an event", async () => {
    const rows = [...readFileSync(INDEX, "utf8").matchAll(/^\| `([^`]+\.wav)` \| [\d.]+ \| (\d+) \|/gm)].map((row) => ({ file: row[1], peakMs: Number(row[2]) }));
    expect(rows).toHaveLength(89);
    const long = await initJob({ dur: 12 });
    symlinkSync(join(SKILL, "sfx"), join(long, "sound/sfx"), "dir");
    cues(long, rows.map((row) => ({ at: 6, file: `sound/sfx/${row.file}`, align: "peak" })));
    const r = await mg(["sound", "--job", long]);
    expect(r.code).toBe(0);
    const measured = planned(r.out).map((cue) => ({ file: cue.file.replace("sound/sfx/", ""), peakMs: Math.round(cue.point * 1000) }));
    expect(measured).toEqual(rows);
    // The sentence above the table states the window the code measures with.
    expect(readFileSync(INDEX, "utf8")).toMatch(/loudest 5 ms/);
  }, 120_000);
});

describe.skipIf(missing.length > 0)("B43 dxb-motion-graphics — verify holds a finished film to the job", () => {
  let job = "";
  const sound = (name: string) => join(job, "sound", name);
  const verify = (...argv: string[]) => mg(["verify", ...argv, "--job", job]);
  beforeAll(async () => {
    ownState();
    job = await initJob();
    shaped(sound("shaped.wav"));
    tick(sound("tick.wav"));
    antiPhase(sound("anti-phase.wav"));
    ebuReference(sound("reference.wav"), 3);
  });

  it("passes a film whose cue sits on its event by its start, its peak or its end, and says where a late one is", async () => {
    // shaped.wav starts 200 ms in, bursts 500 ms in and ends 900 ms in; the film carries it so that point is on 1.5 s.
    for (const [align, pointMs] of [["start", 200], ["peak", 500], ["end", 900]] as const) {
      cues(job, [{ at: 1.5, file: "sound/shaped.wav", align }]);
      makeFilm(film(job), { sounds: [{ file: sound("shaped.wav"), atMs: 1500 - pointMs }] });
      const r = await verify();
      expect(r.code, align).toBe(0);
      const [cue] = verdict(job).films[0].cues;
      expect(cue).toMatchObject({ align, planned: 1.5, heard: true, ok: true });
      expect(Math.abs(cue.measured - 1.5), align).toBeLessThanOrEqual(0.002);

      makeFilm(film(job), { sounds: [{ file: sound("shaped.wav"), atMs: 1500 - pointMs + 100 }] }); // 100 ms late: three frames
      const late = await verify();
      expect(late.code, align).not.toBe(0);
      expect(late.out, align).toMatch(new RegExp(`cue 1 .*its ${align} is at 1\\.6\\d\\d s where the plan puts it on 1\\.500 s`));
      expect(Math.abs(verdict(job).films[0].cues[0].measured - 1.6), align).toBeLessThanOrEqual(0.002);
    }
  }, 120_000);

  it("names what only an eye or an ear can settle, and a frame standing still is not among it", async () => {
    cues(job, []);
    makeFilm(film(job));
    const r = await verify();
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/UNVERIFIED/);
    expect(verdict(job).unverified.length).toBeGreaterThanOrEqual(1);
    expect(r.out).not.toMatch(/standing still/); // PLAN §7: a held frame is the film's own choice, not a fault to look for
  });

  it("goes red on a film that declares a cue and carries no sound", async () => {
    cues(job, [{ at: 1.5, file: "sound/shaped.wav", align: "peak" }]);
    makeFilm(film(job));
    const r = await verify();
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/silent/i);
    expect(verdict(job).ok).toBe(false);
  });

  it("goes red when the film's length and the page's FILM disagree", async () => {
    cues(job, []);
    makeFilm(film(job), { seconds: 2 });
    const r = await verify();
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/duration: 2\b.* where the job states 3\b/);
    expect(r.out).toMatch(/frames: 60 where the job states 90/);
  });

  it("holds the film to job.json's loudness within 1 LU", async () => {
    // The expected figure is the standard's, not ffmpeg's: EBU Tech 3341's first reference signal reads −23.0 LUFS.
    cues(job, []);
    makeFilm(film(job), { sounds: [{ file: sound("reference.wav"), atMs: 0, stereo: true }] });
    editJson(join(job, "job.json"), (j) => (j.lufs = -23));
    expect((await verify()).code).toBe(0);
    expect(Math.abs(verdict(job).films[0].loudness - -23)).toBeLessThanOrEqual(0.3);
    editJson(join(job, "job.json"), (j) => (j.lufs = -22.5));
    expect((await verify()).code).toBe(0);
    editJson(join(job, "job.json"), (j) => (j.lufs = -17));
    const off = await verify();
    expect(off.code).not.toBe(0);
    expect(off.out).toMatch(/loudness: -2[23](\.\d+)? where the job states -17/);
    editJson(join(job, "job.json"), (j) => (j.lufs = null));
  }, 60_000);

  it("one heard sound satisfies one cue: a second cue declared 20 ms after a single tick is not heard", async () => {
    // tick.wav is loudest 100 ms in. The film carries ONE tick, on 1.000 s; the cues declare two.
    cues(job, [{ at: 1.0, file: "sound/tick.wav", align: "peak" }, { at: 1.02, file: "sound/tick.wav", align: "peak" }]);
    makeFilm(film(job), { sounds: [{ file: sound("tick.wav"), atMs: 900 }] });
    const r = await verify();
    expect(r.code).not.toBe(0);
    const [first, second] = verdict(job).films[0].cues;
    expect(first).toMatchObject({ n: 1, heard: true, ok: true });
    expect(Math.abs(first.measured - 1.0)).toBeLessThanOrEqual(0.002);
    expect(second).toMatchObject({ n: 2, heard: false, ok: false });
    expect(r.out).toMatch(/cue 2 \(sound\/tick\.wav\): not heard at its place/);

    // With both ticks in the film, both cues are heard.
    makeFilm(film(job), { sounds: [{ file: sound("tick.wav"), atMs: 900 }, { file: sound("tick.wav"), atMs: 920 }] });
    expect((await verify()).code).toBe(0);
    expect(verdict(job).films[0].cues.map((c: any) => c.ok)).toEqual([true, true]);
  }, 60_000);

  it("a sound repeated close by is heard once for each cue, each at its own place", async () => {
    // Three ticks 100 ms apart, all inside one another's search window.
    const places = [1.0, 1.1, 1.2];
    cues(job, places.map((at) => ({ at, file: "sound/tick.wav", align: "peak" })));
    makeFilm(film(job), { sounds: places.map((at) => ({ file: sound("tick.wav"), atMs: Math.round(at * 1000) - 100 })) });
    expect((await verify()).code).toBe(0);
    const heard = verdict(job).films[0].cues;
    for (const [i, at] of places.entries()) expect(Math.abs(heard[i].measured - at), `cue ${i + 1}`).toBeLessThanOrEqual(0.002);

    // Take the middle tick out of the film and it is the middle cue that is not heard.
    makeFilm(film(job), { sounds: [1.0, 1.2].map((at) => ({ file: sound("tick.wav"), atMs: Math.round(at * 1000) - 100 })) });
    expect((await verify()).code).not.toBe(0);
    expect(verdict(job).films[0].cues.map((c: any) => c.heard)).toEqual([true, false, true]);
  }, 60_000);

  it("hears a stereo sound whose sides are in opposite phase", async () => {
    // anti-phase.wav is loudest 200 ms in; the film carries it, both sides as they are, from 800 ms.
    cues(job, [{ at: 1.0, file: "sound/anti-phase.wav", align: "peak" }]);
    makeFilm(film(job), { sounds: [{ file: sound("anti-phase.wav"), atMs: 800, stereo: true }] });
    const r = await verify();
    expect(r.out).not.toMatch(/silent|holds no sound/i);
    expect(r.code).toBe(0);
    const [cue] = verdict(job).films[0].cues;
    expect(cue).toMatchObject({ heard: true, ok: true });
    expect(Math.abs(cue.measured - 1.0)).toBeLessThanOrEqual(0.002);
  }, 60_000);

  it("judges the file at the path it is given, not a film of the same name in out/", async () => {
    cues(job, []);
    const elsewhere = join(mkdtempSync(join(tmpdir(), "mg-elsewhere-")), FILM);
    makeFilm(film(job));                    // the job's own film is what the job states
    makeFilm(elsewhere, { seconds: 2 });    // the one asked about is a second short
    const asked = await verify(elsewhere);
    expect(asked.code).not.toBe(0);
    expect(asked.out).toMatch(/duration/);
    expect(verdict(job).films.map((f: any) => f.file)).toEqual([elsewhere]);

    makeFilm(film(job), { seconds: 2 });    // and the other way round
    makeFilm(elsewhere);
    expect((await verify(elsewhere)).code).toBe(0);
    expect((await verify(film(job))).code).not.toBe(0);

    // A path with nothing at it is refused by name, though out/ holds a film called the same.
    const absent = join(tmpdir(), "mg-no-such-folder", FILM);
    makeFilm(film(job));
    const refused = await verify(absent);
    expect(refused.code).not.toBe(0);
    expect(refused.out).toContain(`${absent} is not there`);
    expect(existsSync(join(job, "out/verify.json"))).toBe(false);
  }, 60_000);

  it("asked about no file, judges the masters of the job's formats and no other film in out/", async () => {
    cues(job, []);
    makeFilm(film(job));
    makeFilm(film(job, "fixture-film-16x9-24fps.mp4"), { fps: 24 });
    makeFilm(film(job, "an-older-cut.mp4"), { seconds: 2 }); // not a master of this job: left alone
    const r = await verify();
    expect(r.code).toBe(0);
    expect(verdict(job).films.map((f: any) => f.file)).toEqual([film(job, "fixture-film-16x9-24fps.mp4"), film(job)]);
    rmSync(film(job, "fixture-film-16x9-24fps.mp4"));
    rmSync(film(job, "an-older-cut.mp4"));

    const empty = await initJob();
    mkdirSync(join(empty, "out"), { recursive: true });
    makeFilm(film(empty, "an-older-cut.mp4"));
    const none = await mg(["verify", "--job", empty]);
    expect(none.code).not.toBe(0);
    expect(none.out).toMatch(/no film/);
  }, 60_000);

  it("a transparent master must carry an alpha channel that is not opaque throughout", async () => {
    cues(job, []);
    const mov = film(job, "fixture-film-16x9.mov");
    const master = (picture: string, codec: string[]) => {
      const r = sh("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `color=c=red:s=640x360:r=${FPS}:d=3${picture}`, "-c:v", "prores_ks", ...codec, mov]);
      expect(r.err).toBe("");
    };
    const alphaCheck = () => verdict(job).films[0].checks.find((c: any) => c.name === "alpha");

    // The left half opaque, the right half clear.
    master(",format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lt(X,W/2),255,0)'", ["-profile:v", "4444", "-pix_fmt", "yuva444p10le"]);
    expect((await verify(mov)).code).toBe(0);
    expect(alphaCheck()).toMatchObject({ ok: true });

    // An alpha channel that is there and opaque in every pixel of every frame.
    master(",format=yuva444p10le", ["-profile:v", "4444", "-pix_fmt", "yuva444p10le"]);
    const opaque = await verify(mov);
    expect(opaque.code).not.toBe(0);
    expect(opaque.out).toMatch(/alpha: .*everywhere/);
    expect(alphaCheck()).toMatchObject({ ok: false });

    // No alpha channel at all.
    master("", ["-profile:v", "hq", "-pix_fmt", "yuv422p10le"]);
    const none = await verify(mov);
    expect(none.code).not.toBe(0);
    expect(none.out).toMatch(/alpha: no alpha channel \(yuv422p10le\)/);
    rmSync(mov);
  }, 120_000);
});

describe("B43 dxb-motion-graphics — Blender is not started without room on the graphics card", () => {
  const scene = join(mkdtempSync(join(tmpdir(), "mg-blender-")), "scene.py");
  writeFileSync(scene, "import bpy\n");
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
