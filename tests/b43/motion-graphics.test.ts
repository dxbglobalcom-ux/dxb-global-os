// B43 dxb-motion-graphics (CEO 2026-11-12) — THE FILM IS MEASURED, NOT BELIEVED.
//
// `mg` is the one command of the motion-graphics skill: it lays a job folder out, takes exact-time
// stills, renders through HyperFrames at the guarded version, puts each sound's start, peak or end on
// its event, and verifies the finished file. Its tests stand in five files, by the tools each needs:
//
//   motion-graphics.test.ts               (this one) node, ffmpeg and ffprobe — all the construction
//                                         sandbox has. Every film here is made by ffmpeg alone, and
//                                         where a test must cross HyperFrames or Chrome the test
//                                         answers for it.
//   motion-graphics-page.test.ts          node alone: the helpers a page loads from page/lib/.
//   motion-graphics-read.test.ts          node alone: `mg motion-read`, the network answered by the test.
//   motion-graphics-film.host.test.ts     HyperFrames, Chrome and npm: films really rendered.
//   motion-graphics-blender.host.test.ts  Blender.
//
// Every expected figure is a literal — the place a fixture's sound was put, a size, a reference
// level — or is measured by the fixtures' own ffmpeg call, never by `mg`'s own code.
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { run } from "../../tools/motion-graphics/mg.mjs";
import {
  FILM, FPS, MG, REPO, SKILL, TEMPLATES, antiPhase, askForWebGL, blip, cues, ebuReference, editJson, film, initJob,
  makeFilm, mg, missingTools, ownState, plainPage, recorder, sh, sha, shaped, tick, verdict,
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

  it("init states every format, the loudness target and what the job is", async () => {
    const whole = join(mkdtempSync(join(tmpdir(), "mg-")), "job");
    const r = await mg(["init", whole, "--title", "Fixture film", "--w", "640", "--h", "360", "--fps", "30", "--dur", "3",
      "--format", "9x16=360x640", "--format", "square=360x360", "--lufs", "-16", "--spec", "--brand", "WhatsApp"]);
    expect(r.code).toBe(0);
    expect(JSON.parse(readFileSync(join(whole, "job.json"), "utf8"))).toEqual({
      title: "Fixture film",
      formats: [{ name: "16x9", w: 640, h: 360 }, { name: "9x16", w: 360, h: 640 }, { name: "square", w: 360, h: 360 }],
      fps: 30, lufs: -16, spec: true, brand: "WhatsApp",
    });
    for (const stated of ["16x9", "640×360", "9x16", "360×640", "square", "360×360"]) expect(r.out).toContain(stated);
    // The page stands framed for the first format; the others are framed at each call that names them.
    expect(readFileSync(join(whole, "page/index.html"), "utf8")).toMatch(/data-width="640" data-height="360"/);
    expect((await mg(["events", "--job", whole])).code).toBe(0);
  });

  it("init refuses a format or a loudness it cannot read, and lays nothing out", async () => {
    const refused: [string[], RegExp][] = [
      [["--format", "9x16"], /--format/],                          // no size
      [["--format", "9x16=360"], /--format/],                      // half a size
      [["--format", "tall/one=360x640"], /letters, digits/],       // a name that is not a file name's part
      [["--format", "16x9=360x640"], /cannot stand together/],     // the first format's own name
      [["--format", "16x9-2x=1280x720"], /cannot stand together/], // a film of it would read as the first at 2×
      [["--lufs", "loud"], /--lufs/],
    ];
    for (const [more, why] of refused) {
      const dir = join(mkdtempSync(join(tmpdir(), "mg-")), "job");
      const r = await mg(["init", dir, "--w", "640", "--h", "360", ...more]);
      expect(r.code, more.join(" ")).not.toBe(0);
      expect(r.out, more.join(" ")).toMatch(why);
      expect(existsSync(dir), more.join(" ")).toBe(false);
    }
  });

  it("init puts the page's helpers into page/lib, as the skill ships them", () => {
    for (const helper of ["outline.js", "motion-blur.js"]) expect(sha(join(job, "page/lib", helper)), helper).toBe(sha(join(TEMPLATES, "lib", helper)));
    expect(readFileSync(join(job, "page/index.html"), "utf8")).toContain('<script src="lib/outline.js"></script>');
  });

  it("the page names the frame's size in FILM alone: nothing at its top holds the first format's size under a name of its own", () => {
    // W and H at the top of the page stayed the first format's size while another format was drawn, and
    // the first film's writer laid a vertical frame out from them (2026-11-12).
    for (const page of [join(job, "page/index.html"), join(TEMPLATES, "guard/index.html")]) {
      const html = readFileSync(page, "utf8"), context = vm.createContext({ window: {} });
      vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)![1], context);
      expect(vm.runInContext("[typeof W, typeof H, typeof WIDTH, typeof HEIGHT].join()", context), page).toBe("undefined,undefined,undefined,undefined");
      expect(html, page).not.toMatch(/(?:const|let|var)\s+(?:W|H)\s*=|,\s*(?:W|H)\s*=\s*\d/);
    }
    const context = vm.createContext({ window: {} });
    vm.runInContext(readFileSync(join(job, "page/index.html"), "utf8").match(/<script>([\s\S]*?)<\/script>/)![1], context);
    expect(vm.runInContext("[window.FILM.W, window.FILM.H, window.FILM.FPS, window.FILM.TOTAL].join()", context)).toBe("640,360,30,3");
  });

  it("still reads a page written the older way, with W and H as names of its own", async () => {
    const older = await initJob();
    plainPage(older);
    const r = await mg(["events", "--job", older]);
    expect(r.code).toBe(0);
    expect(JSON.parse(r.out)).toEqual({ W: 640, H: 360, FPS: 30, TOTAL: 3, BEATS: { start: 0 }, EVENTS: [{ name: "lands", t: 1 }] });
  });

  it("refuses two formats that one film's file name could mean", async () => {
    // "fixture-film-a-2x.mp4" is format "a" at twice its size, and is format "a-2x" at its own.
    const other = await initJob();
    const named = (...names: string[]) => editJson(join(other, "job.json"), (j) => (j.formats = names.map((name) => ({ name, w: 640, h: 360 }))));
    for (const pair of [["a", "a-2x"], ["a-24fps", "a"], ["a", "b", "a-2x-24fps"], ["a", "a"]]) {
      named(...pair);
      const r = await mg(["events", "--job", other]);
      expect(r.code, pair.join(" ")).not.toBe(0);
      expect(r.out, pair.join(" ")).toMatch(/cannot stand together/);
    }
    for (const pair of [["a", "a-b"], ["a", "ax"], ["a", "a-2xl"]]) {
      named(...pair);
      expect((await mg(["events", "--job", other])).code, pair.join(" ")).toBe(0);
    }
  });
});

describe("B43 dxb-motion-graphics — the board shows the film, in each format", () => {
  const CHROME = "/usr/bin/google-chrome";
  /**
   * Chrome and HyperFrames answered by the test. The board's "photograph" is the board the page carried
   * at that moment; a still is written where HyperFrames was asked to put it — or, with `stills` off,
   * HyperFrames fails as it does on a page it cannot draw.
   */
  const drawing = ({ stills = true } = {}) => {
    const boards: Record<string, any> = {}, framed: string[] = [];
    const rec = recorder((cmd, args) => {
      if (cmd === CHROME) {
        const png = args.find((arg) => arg.startsWith("--screenshot="))?.slice("--screenshot=".length);
        if (!png) return { code: 0, out: '<html data-board-height="900">', err: "" };
        const page = readFileSync(fileURLToPath(args[args.length - 1]), "utf8");
        boards[png] = JSON.parse(page.match(/<script id="board" type="application\/json">([\s\S]*?)<\/script>/)![1]);
        writeFileSync(png, "the board");
        return { code: 0, out: "", err: "" };
      }
      if (cmd !== "npx" || !args.includes("snapshot")) return undefined;
      if (!stills) return { code: 1, out: "", err: "the page threw before it was ready" };
      const stage = readFileSync(join(args[args.indexOf("snapshot") + 1], "index.html"), "utf8");
      framed.push(stage.match(/data-width="(\d+)" data-height="(\d+)"/)!.slice(1).join("x"));
      for (const t of args[args.indexOf("--at") + 1].split(",")) writeFileSync(join(args[args.indexOf("-o") + 1], `at-${t}s.png`), "a still");
      return { code: 0, out: "", err: "" };
    });
    const asked = () => rec.calls.filter((c) => c.cmd === "npx").map((c) => c.args[c.args.indexOf("--at") + 1]);
    return { run: rec.run, boards, framed, asked };
  };
  // The starter board of a 3 s film: its shots run 0–0.45 s, 0.45–1.2 s and 1.2–3 s, so their middles are these.
  const MIDDLES = "0.225,0.825,2.1";
  let job = "";
  beforeAll(async () => {
    ownState();
    job = await initJob({ more: ["--format", "9x16=360x640"] });
  });

  it("draws the storyboard alone while the page is still the starter, and says so", async () => {
    const chrome = drawing();
    const r = await mg(["board", "--job", job], { run: chrome.run });
    expect(r.code).toBe(0);
    expect(chrome.asked()).toEqual([]); // the starter's dot is not this job's film: nothing is rendered
    expect(r.out).toMatch(/without the film's frames: .*still the starter/);
    expect(Object.keys(chrome.boards)).toEqual([join(job, "board/board.png")]);
    expect(chrome.boards[join(job, "board/board.png")].shots.map((shot: any) => shot.still)).toEqual([undefined, undefined, undefined]);
  });

  it("once the page is the job's own, puts the film's frame at the middle of each shot on the board", async () => {
    plainPage(job);
    const chrome = drawing();
    const r = await mg(["board", "--job", job], { run: chrome.run });
    expect(r.code).toBe(0);
    expect(chrome.asked()).toEqual([MIDDLES]);
    expect(chrome.framed).toEqual(["640x360"]);
    const board = chrome.boards[join(job, "board/board.png")];
    expect(board.shots.map((shot: any) => shot.still)).toEqual(["out/stills/16x9/at-0.225s.png", "out/stills/16x9/at-0.825s.png", "out/stills/16x9/at-2.1s.png"]);
    expect(board.format).toBe("16x9 · 640×360 · 30 fps");
    expect(r.out).toMatch(/3 shot\(s\), 3 with the film's frame/);
    for (const still of board.shots.map((shot: any) => shot.still)) expect(existsSync(join(job, still)), still).toBe(true);
  });

  it("draws one board for each format asked for, each from that format's own frames", async () => {
    const chrome = drawing();
    const r = await mg(["board", "--format", "all", "--job", job], { run: chrome.run });
    expect(r.code).toBe(0);
    expect(chrome.asked()).toEqual([MIDDLES, MIDDLES]);
    expect(chrome.framed).toEqual(["640x360", "360x640"]);
    expect(Object.keys(chrome.boards)).toEqual([join(job, "board/board.png"), join(job, "board/board-9x16.png")]);
    const tall = chrome.boards[join(job, "board/board-9x16.png")];
    expect(tall.format).toBe("9x16 · 360×640 · 30 fps");
    expect(tall.shots[0].still).toBe("out/stills/9x16/at-0.225s.png");

    const one = drawing();
    expect((await mg(["board", "--format", "9x16", "--job", job], { run: one.run })).code).toBe(0);
    expect(Object.keys(one.boards)).toEqual([join(job, "board/board-9x16.png")]);
    const none = drawing();
    expect((await mg(["board", "--format", "4x5", "--job", job], { run: none.run })).code).not.toBe(0);
    expect(Object.keys(none.boards)).toEqual([]);
  });

  it("a shot whose time lies outside the film is drawn without a frame", async () => {
    const other = await initJob();
    plainPage(other);
    editJson(join(other, "board/board.json"), (b) => Object.assign(b.shots[2], { from: 7, to: 9 }));
    const chrome = drawing();
    expect((await mg(["board", "--job", other], { run: chrome.run })).code).toBe(0);
    expect(chrome.asked()).toEqual(["0.225,0.825"]);
    expect(chrome.boards[join(other, "board/board.png")].shots.map((shot: any) => Boolean(shot.still))).toEqual([true, true, false]);
  });

  it("when the page cannot be drawn yet, draws the board without frames and says why", async () => {
    const chrome = drawing({ stills: false });
    const r = await mg(["board", "--job", job], { run: chrome.run });
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/without the film's frames: HyperFrames wrote no still/);
    expect(r.out).toMatch(/the page threw before it was ready/);
    expect(chrome.boards[join(job, "board/board.png")].shots.map((shot: any) => shot.still)).toEqual([undefined, undefined, undefined]);
  });

  it("a board page from before the frames were drawn is said to be one, and no frame is rendered for it", async () => {
    const other = await initJob();
    plainPage(other);
    const page = join(other, "board/board.html"), newer = readFileSync(page, "utf8");
    expect(newer).toContain("shot.still");
    writeFileSync(page, newer.replaceAll("shot.still", "undefined"));
    const chrome = drawing();
    const r = await mg(["board", "--job", other], { run: chrome.run });
    expect(r.code).toBe(0);
    expect(chrome.asked()).toEqual([]);
    expect(r.out).toMatch(/without the film's frames: board\/board\.html .*remove it/);
  });
});

describe("B43 dxb-motion-graphics — contact sheets: every format in one call, the window around an event stated", () => {
  /** HyperFrames answered by the test: one contact sheet where it was asked to put it. */
  const sheeting = () => {
    const rec = recorder((cmd, args) => {
      if (cmd !== "npx" || !args.includes("snapshot")) return undefined;
      writeFileSync(join(args[args.indexOf("-o") + 1], "contact-sheet.jpg"), "a sheet");
      return { code: 0, out: "", err: "" };
    });
    return { ...rec, moments: () => rec.calls.filter((c) => c.cmd === "npx").map((c) => c.args[c.args.indexOf("--at") + 1]) };
  };
  let job = "";
  beforeAll(async () => {
    ownState();
    job = await initJob({ more: ["--format", "9x16=360x640"] });
    plainPage(job); // one event, on 1.000 s
  });

  it("covers a quarter of a second each side of an event, or the window it is given", async () => {
    const usual = sheeting();
    expect((await mg(["sheet", "--around-events", "--n", "3", "--job", job], { run: usual.run })).code).toBe(0);
    expect(usual.moments()).toEqual(["0.75,1,1.25"]);
    const wide = sheeting();
    expect((await mg(["sheet", "--around-events", "--n", "3", "--window", "0.5", "--job", job], { run: wide.run })).code).toBe(0);
    expect(wide.moments()).toEqual(["0.5,1,1.5"]);
    const five = sheeting();
    expect((await mg(["sheet", "--around-events", "--n", "5", "--window", "0.1", "--job", job], { run: five.run })).code).toBe(0);
    expect(five.moments()).toEqual(["0.9,0.95,1,1.05,1.1"]);
  });

  it("refuses a window that is no length of time, and starts nothing", async () => {
    for (const window of ["0", "wide", "-1", ""]) {
      const rec = sheeting();
      const r = await mg(["sheet", "--around-events", `--window=${window}`, "--job", job], { run: rec.run });
      expect(r.code, window).not.toBe(0);
      // The refusal is the window's own: a command that did not know the flag would name it too.
      expect(r.out, window).toMatch(/--window takes the seconds/);
      expect(rec.calls, window).toEqual([]);
    }
    // A window is the time around an event: on a sheet of the whole film it would mean nothing, and is not passed over in silence.
    const rec = sheeting();
    const whole = await mg(["sheet", "--window", "0.5", "--job", job], { run: rec.run });
    expect(whole.code).not.toBe(0);
    expect(whole.out).toMatch(/--window .*--around-events/);
    expect(rec.calls).toEqual([]);
  });

  it("makes the sheets of every format in one call", async () => {
    const rec = sheeting();
    const r = await mg(["sheet", "--around-events", "--format", "all", "--job", job], { run: rec.run });
    expect(r.code).toBe(0);
    const sheets = ["16x9", "9x16"].map((format) => join(job, "out/sheets", format, "event-lands.jpg"));
    for (const sheet of sheets) {
      expect(existsSync(sheet), sheet).toBe(true);
      expect(r.out).toContain(sheet);
    }
    const whole = await mg(["sheet", "--format", "all", "--job", job], { run: sheeting().run });
    expect(whole.code).toBe(0);
    for (const format of ["16x9", "9x16"]) expect(existsSync(join(job, "out/sheets", format, "film.jpg")), format).toBe(true);
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

  it("a cue may name a file of the starter set, and the job gets its own copy of it", async () => {
    const other = await initJob();
    const starter = join(SKILL, "sfx/pop/pop-mid-01.wav"), copy = join(other, "sound/pop-mid-01.wav");
    cues(other, [{ at: 1, file: "sfx:pop/pop-mid-01.wav", align: "start" }]);
    const r = await mg(["sound", "--job", other]);
    expect(r.code).toBe(0);
    expect(sha(copy)).toBe(sha(starter));
    expect(lstatSync(copy).isFile()).toBe(true); // a copy the job owns, not a link out of it
    expect(planned(r.out)).toMatchObject([{ n: 1, file: "sound/pop-mid-01.wav", align: "start" }]);
    expect(readFileSync(join(other, "page/index.html"), "utf8")).toMatch(/<audio id="mg-cue-1" src="sound\/pop-mid-01\.wav"/);
    expect((await mg(["sound", "--job", other])).code).toBe(0); // the copy is there already: the same again

    // A file of the job's own under that name is never written over.
    blip(copy);
    const own = sha(copy);
    const clash = await mg(["sound", "--job", other]);
    expect(clash.code).not.toBe(0);
    expect(clash.out).toMatch(/sound\/pop-mid-01\.wav is already there and is another sound/);
    expect(sha(copy)).toBe(own);

    // Only a file of the set: nothing above it, nothing that is not there.
    for (const file of ["sfx:../templates/page.html", "sfx:pop/no-such-pop.wav", "sfx:"]) {
      cues(other, [{ at: 1, file, align: "start" }]);
      const refused = await mg(["sound", "--job", other]);
      expect(refused.code, file).not.toBe(0);
      expect(refused.out, file).toMatch(/starter set/);
    }
    expect(readdirSync(join(other, "sound")).sort()).toEqual(["cues.json", "pop-mid-01.wav"]);
  });

  it("one trim moves the whole set: it is added to every cue's level", async () => {
    const volumes = () => [...readFileSync(join(job, "page/index.html"), "utf8").matchAll(/data-volume="([\d.]+)"/g)].map((clip) => Number(clip[1]));
    const set = [{ at: 1, file: "sound/blip.wav", align: "peak", db: -12 }, { at: 2, file: "sound/blip.wav", align: "peak", db: -20 }];
    cues(job, set);
    expect((await mg(["sound", "--job", job])).code).toBe(0);
    expect(volumes()).toEqual([0.2512, 0.1]); // −12 dB and −20 dB as amplitudes

    cues(job, { trim: 6, cues: set });
    const trimmed = await mg(["sound", "--job", job]);
    expect(trimmed.code).toBe(0);
    expect(volumes()).toEqual([0.5012, 0.1995]); // −6 dB and −14 dB
    expect(trimmed.out).toMatch(/trim(med)? .*\+6 dB/);

    cues(job, { trim: 13, cues: [{ at: 1, file: "sound/blip.wav", align: "peak", db: 0 }] }); // +13 dB in all: past what a clip can be raised by
    expect((await mg(["sound", "--job", job])).out).toMatch(/at most \+12 dB/);
    cues(job, { trim: "loud", cues: set });
    const unread = await mg(["sound", "--job", job]);
    expect(unread.code).not.toBe(0);
    expect(unread.out).toMatch(/"trim"/);
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

  it("a film off its loudness target is told by how many dB its whole set would have to move", async () => {
    // The reference signal reads −23.0 LUFS (EBU Tech 3341): 6 dB under a target of −17, 6 dB over one of −29.
    cues(job, []);
    makeFilm(film(job), { sounds: [{ file: sound("reference.wav"), atMs: 0, stereo: true }] });
    try {
      editJson(join(job, "job.json"), (j) => (j.lufs = -17));
      const quiet = await verify();
      expect(quiet.code).not.toBe(0);
      expect(quiet.out).toMatch(/the set would have to move by \+(5\.[7-9]|6\.[0-3]) dB/);
      expect(quiet.out).toMatch(/"trim"/);
      editJson(join(job, "job.json"), (j) => (j.lufs = -29));
      expect((await verify()).out).toMatch(/the set would have to move by -(5\.[7-9]|6\.[0-3]) dB/);
      editJson(join(job, "job.json"), (j) => (j.lufs = -23));
      const on = await verify();
      expect(on.code).toBe(0);
      expect(on.out).not.toMatch(/would have to move/);

      // A silent film has no loudness to move from: it fails without a figure.
      makeFilm(film(job));
      const silent = await verify();
      expect(silent.code).not.toBe(0);
      expect(silent.out).not.toMatch(/would have to move/);
    } finally {
      editJson(join(job, "job.json"), (j) => (j.lufs = null)); // the tests after this one share the job: a failure here must not be theirs too
    }
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

describe("B43 dxb-motion-graphics — a tool that never ends does not hang the command", () => {
  const NEVER = ["-e", "setTimeout(() => {}, 600000)"]; // node, doing nothing for ten minutes
  beforeAll(() => {
    ownState();
    process.env.DXB_MG_TOOL_TIMEOUT = "0.3";
  });
  afterAll(() => {
    delete process.env.DXB_MG_TOOL_TIMEOUT;
  });

  it("the tool is stopped at the time limit, and the limit is named", () => {
    const began = Date.now();
    expect(() => run(process.execPath, NEVER)).toThrow(/did not end within 0\.3 s.*DXB_MG_TOOL_TIMEOUT/s);
    expect(Date.now() - began).toBeLessThan(20_000);
  });

  it("the command that started it fails in words, with nothing left half-made", async () => {
    const job = await initJob();
    writeFileSync(film(job), "a film ffprobe is never asked about");
    const stuck = (cmd: string, args: string[], options?: Parameters<typeof run>[2]) => (cmd === "ffprobe" ? run(process.execPath, NEVER, options) : run(cmd, args, options));
    const r = await mg(["verify", "--job", job], { run: stuck });
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/^mg verify: FAILED — .*did not end within 0\.3 s/m);
    expect(existsSync(join(job, "out/verify.json"))).toBe(false);
  });

  it("left to itself, the limit is long enough for a 4K render", () => {
    delete process.env.DXB_MG_TOOL_TIMEOUT;
    const quick = run(process.execPath, ["-e", "setTimeout(() => console.log('done'), 1000)"]); // more than three times 0.3 s
    expect(quick).toMatchObject({ code: 0, out: "done\n" });
    // Two hours, stated where a person looks for it, beside the name that changes it.
    expect(sh("node", [MG, "--help"]).out.toString()).toMatch(/2 hours.*DXB_MG_TOOL_TIMEOUT/s);
    process.env.DXB_MG_TOOL_TIMEOUT = "0.3";
  });
});

describe("B43 dxb-motion-graphics — the command says what it takes", () => {
  // Every flag of every command, as a person would type it.
  const FLAGS: Record<string, string[]> = {
    init: ["<dir>", "--title", "--w", "--h", "--format", "--fps", "--dur", "--lufs", "--spec", "--brand"],
    board: ["--format", "--job"],
    stills: ["<seconds…>", "--format", "--job"],
    sheet: ["--around-events", "--n", "--window", "--format", "--job"],
    events: ["--job"],
    sound: ["--job"],
    render: ["--format", "--scale", "--4k", "--alpha", "--fps", "--job"],
    verify: ["--job"],
    "motion-read": ["--format", "--model", "--job"],
    hf: ["status", "update", "--guard"],
    blender: ["<scene.py>", "--need-mb", "--job"],
  };
  const nowhere = mkdtempSync(join(tmpdir(), "mg-no-job-")); // a folder that holds no job

  it("mg --help says how to ask about one command, and succeeds", () => {
    for (const asked of ["--help", "-h", "help"]) {
      const r = sh("node", [MG, asked], nowhere);
      expect(r.code, asked).toBe(0);
      expect(r.out.toString(), asked).toMatch(/mg <command> --help/);
      expect(r.out.toString(), asked).not.toMatch(/FAILED/);
    }
  });

  it("mg --help names every command", () => {
    for (const asked of ["--help", "-h", "help"]) {
      const said = sh("node", [MG, asked], nowhere).out.toString();
      for (const command of Object.keys(FLAGS)) expect(said, asked).toContain(`mg ${command}`);
    }
  });

  // One case for each command, so a command that is not there yet does not hide the others.
  it.each(Object.entries(FLAGS))("mg %s --help prints that command's own flags, each with what it does, outside any job folder", (command, flags) => {
    const r = sh("node", [MG, command, "--help"], nowhere);
    const said = r.out.toString();
    expect(r.code).toBe(0);
    expect(said).not.toMatch(/FAILED/);
    expect(said.split("\n")[0]).toMatch(new RegExp(`^mg ${command}\\b`));
    for (const flag of flags) expect(said, flag).toContain(flag);
    // One line for each flag below the usage line, and no flag of another command among them.
    const explained = [...said.matchAll(/^\s+(--[\w-]+)\b.+\S/gm)].map((line) => line[1]).sort();
    expect(explained).toEqual(flags.filter((flag) => flag.startsWith("--")).sort());
    expect(readdirSync(nowhere)).toEqual([]);
  });

  it("a flag a command does not have is still refused, and help is not taken from a scene's own arguments", async () => {
    expect((await mg(["events", "--window", "1"])).out).toMatch(/Unknown option '--window'/);
    const scene = join(mkdtempSync(join(tmpdir(), "mg-blender-")), "scene.py");
    writeFileSync(scene, "import bpy\n");
    const rec = recorder((cmd) => (cmd === "nvidia-smi" ? { code: 0, out: "1\n", err: "" } : undefined));
    const r = await mg(["blender", scene, "--", "--help"], { run: rec.run });
    expect(rec.calls.map((c) => c.cmd)).toEqual(["nvidia-smi"]); // the command ran: --help after "--" is the scene's
    expect(r.code).not.toBe(0);
  });
});

describe("B43 dxb-motion-graphics — the guard film is a WebGL picture", () => {
  it("draws with WebGL alone, so a WebGL picture that stands still is what the guard refuses", () => {
    const guard = readFileSync(join(TEMPLATES, "guard/index.html"), "utf8");
    expect(guard).not.toMatch(/getContext\(\s*['"]2d['"]/);
    expect(guard).toMatch(/getContext\(\s*['"]webgl2?['"]/);
    expect(guard).toMatch(/gl\.(clear|drawArrays|drawElements)\(/);
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
      for (const c of ["init", "board", "stills", "sheet", "events", "sound", "render", "verify", "motion-read", "hf", "blender"]) expect(r.out).toContain(`mg ${c}`);
    }
  });

  it("no run of this file touched the repository's package.json", () => {
    expect(sha(join(REPO, "package.json"))).toBe(repoPackageJson);
    expect(spawnSync("git", ["-C", REPO, "status", "--short", "package.json"], { encoding: "utf8" }).stdout).toBe("");
  });
});
