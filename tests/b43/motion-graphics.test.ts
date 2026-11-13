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
//   motion-graphics-read.test.ts          node, ffmpeg and ffprobe: `mg motion-read`, the network answered by the test.
//   motion-graphics-film.host.test.ts     HyperFrames, Chrome and npm: films really rendered.
//   motion-graphics-blender.host.test.ts  Blender.
//
// Every expected figure is a literal — the place a fixture's sound was put, a size, a reference
// level — or is measured by the fixtures' own ffmpeg call, never by `mg`'s own code.
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { run, toolSeconds } from "../../tools/motion-graphics/mg.mjs";
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

  it("init refuses a format, a length or a loudness it cannot read, and lays nothing out", async () => {
    const refused: [string[], RegExp][] = [
      [["--dur", "Infinity"], /--dur takes the film's length in seconds/], // a film without an end has no beats to lay out
      [["--dur", "0"], /--dur takes the film's length in seconds/],
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

describe("B43 dxb-motion-graphics — a round of a film starts from the job before it", () => {
  // The second film's writer copied the first round's folder by hand and found its old board page,
  // which cannot carry the film's frames, and an empty page/lib (2026-11-13).
  /** Every entry under a folder as it stands: a link by where it points, a file by its bytes and its time; nothing is opened that is not a file. */
  const standing = (dir: string) => {
    const seen: Record<string, string> = {};
    const walk = (path: string) => {
      for (const name of readdirSync(path).sort()) {
        const at = join(path, name), found = lstatSync(at);
        seen[relative(dir, at)] = found.isSymbolicLink() ? `link to ${readlinkSync(at)}` : found.isDirectory() ? "folder" : found.isFile() ? `${sha(at)} ${found.mtimeMs}` : "neither a file nor a folder";
        if (found.isDirectory()) walk(at);
      }
    };
    walk(dir);
    return seen;
  };
  /**
   * A job as a round leaves it: material with its sources, a page that loads a library and a script of
   * its own, a board that names a picture of its own, sound — and what was made of them: renders, stills,
   * a verdict, the drawn boards, a board page from before the boards carried frames, the writer's own
   * tools and notes, HyperFrames' state in the page, a stage left by a stopped command.
   */
  const roundOne = async () => {
    const job = await initJob({ more: ["--format", "9x16=360x640"] }), page = join(job, "page/index.html");
    const files: Record<string, string> = {
      "assets/logo.svg": "<svg/>", "assets/SOURCES.md": "- assets/logo.svg — https://example.com/press/logo.svg, 2026-11-13, the brand's press kit\n",
      "assets/screens/chat.png": "a real screen", "refs/frame.png": "a reference frame", "page/fonts/Face.ttf": "a typeface",
      "page/lib/three.min.js": "// a pinned three.js", "page/shapes.js": "window.SHAPES = [];", "sound/tick.wav": "a sound",
      "board/ours.png": "our frame beside the reference",
      "out/fixture-film-16x9.mp4": "a render", "out/stills/16x9/at-1s.png": "a still", "out/verify.json": "{}",
      "board/board.png": "the drawn board", "board/board-9x16.png": "the drawn tall board", "board/board.html": "a board page from before the frames",
      "tools/check.py": "print('a check of its own')", "work/notes.txt": "a note", "page/.hyperframes/state.json": "{}", ".mg-stage-left/index.html": "a stage",
    };
    for (const [file, text] of Object.entries(files)) {
      mkdirSync(join(job, file, ".."), { recursive: true });
      writeFileSync(join(job, file), text);
    }
    writeFileSync(page, readFileSync(page, "utf8").replace('<script src="lib/outline.js"></script>', '<script src="lib/outline.js"></script>\n<script src="lib/three.min.js"></script>\n<script src="shapes.js"></script>'));
    cues(job, [{ at: 1, file: "sound/tick.wav", align: "peak" }]);
    editJson(join(job, "board/board.json"), (b) => (b.shapeChecks = [{ label: "ours beside theirs", ours: "board/ours.png", reference: "refs/frame.png" }]));
    editJson(join(job, "job.json"), (j) => Object.assign(j, { lufs: -16, spec: true, brand: "Fixture", notes: "a line the writer kept here by hand" }));
    return job;
  };
  /** Where a round is laid out: a folder of its own beside nothing. */
  const nextTo = () => join(mkdtempSync(join(tmpdir(), "mg-round-")), "round-two");
  /** `mg init <dir> --from <job>` that must be refused: nothing is laid out and the job it names stays as it was. */
  const refused = async (source: string, why: RegExp, more: string[] = []) => {
    const before = standing(source), dir = nextTo();
    const r = await mg(["init", dir, "--from", source, ...more]);
    expect(r.code, r.out).not.toBe(0);
    expect(r.out).toMatch(why);
    expect(existsSync(dir), "laid out").toBe(false);
    expect(standing(source)).toEqual(before);
  };

  it("carries the job's statement, its page with its libraries, its board's data, its material and its sound — and none of what was made of them", async () => {
    const source = await roundOne(), dir = nextTo();
    const r = await mg(["init", dir, "--from", source]);
    expect(r.out).toMatch(/^mg init: .*round-two — a round from .*job/m);
    expect(r.code).toBe(0);

    const same = ["job.json", "page/index.html", "page/play.js", "page/shapes.js", "page/fonts/Face.ttf", "page/lib/three.min.js",
      "assets/logo.svg", "assets/SOURCES.md", "assets/screens/chat.png", "refs/frame.png", "sound/tick.wav", "sound/cues.json", "board/board.json", "board/ours.png"];
    for (const file of same) {
      expect(lstatSync(join(dir, file)).isFile(), file).toBe(true);
      expect(sha(join(dir, file)), file).toBe(sha(join(source, file)));
    }
    expect(JSON.parse(readFileSync(join(dir, "job.json"), "utf8")).notes).toBe("a line the writer kept here by hand");
    // The page's libraries are there: its own, and the skill's helpers.
    for (const helper of ["outline.js", "motion-blur.js"]) expect(sha(join(dir, "page/lib", helper)), helper).toBe(sha(join(TEMPLATES, "lib", helper)));
    expect(readdirSync(join(dir, "page/lib")).sort()).toEqual(["motion-blur.js", "outline.js", "three.min.js"]);
    for (const folder of ["assets", "refs", "sound"]) {
      expect(lstatSync(join(dir, "page", folder)).isSymbolicLink(), folder).toBe(true);
      expect(realpathSync(join(dir, "page", folder)), folder).toBe(realpathSync(join(dir, folder)));
    }

    // Left behind: the renders and every other output, the drawn boards, the old board page, the writer's own files, HyperFrames' state.
    expect(readdirSync(dir).sort()).toEqual(["assets", "board", "job.json", "out", "page", "refs", "sound"]);
    expect(readdirSync(join(dir, "out"))).toEqual([]);
    expect(readdirSync(join(dir, "board")).sort()).toEqual(["board.html", "board.json", "ours.png"]);
    expect(existsSync(join(dir, "page/.hyperframes"))).toBe(false);
    // The board page is the skill's own, laid out anew: one that draws each shot's frame.
    expect(readFileSync(join(dir, "board/board.html"), "utf8")).toContain("shot.still");
    for (const left of ["out/", "board/board.png", "board/board-9x16.png", "board/board.html", "tools/", "work/", "page/.hyperframes/", ".mg-stage-left/"])
      expect(r.out, left).toContain(left);

    // A job every command opens.
    const events = await mg(["events", "--job", dir]);
    expect(events.code).toBe(0);
    expect(JSON.parse(events.out).TOTAL).toBe(3);
  });

  // Sol found all three carried (2026-11-13): an output reached through a link, a format's board drawn before the format left the job, a work folder in the page.
  it("leaves behind what was made wherever it is reached from: through a link into out/, a board of a format the job no longer has, the page's work folder", async () => {
    const source = await roundOne();
    writeFileSync(join(source, "out/old.mp4"), "an old render");
    symlinkSync("../out", join(source, "assets/old-output"), "dir");
    writeFileSync(join(source, "board/board-removed-format.png"), "the board of a format since taken out");
    mkdirSync(join(source, "page/work"));
    writeFileSync(join(source, "page/work/notes.txt"), "a working note");
    const dir = nextTo();
    const r = await mg(["init", dir, "--from", source]);
    expect(r.code, r.out).toBe(0);
    for (const left of ["assets/old-output/old.mp4", "board/board-removed-format.png", "page/work/notes.txt"]) {
      expect(existsSync(join(dir, left)), left).toBe(false);
      expect(r.out, left).toContain(left.replace("/notes.txt", "/"));
    }
    expect(sha(join(dir, "assets/logo.svg"))).toBe(sha(join(source, "assets/logo.svg"))); // the material itself still goes
  });

  it("never changes the job it starts from, and reads it by its real path when it is named through a link", async () => {
    const source = await roundOne(), before = standing(source);
    const named = join(mkdtempSync(join(tmpdir(), "mg-link-")), "round-one");
    symlinkSync(source, named, "dir");
    const dir = nextTo();
    expect((await mg(["init", dir, "--from", named])).code).toBe(0);
    expect(standing(source)).toEqual(before);
    expect(sha(join(dir, "page/index.html"))).toBe(sha(join(source, "page/index.html")));
  });

  it("refuses a file or a folder that a link leads out of the job, or to nothing, and lays nothing out", async () => {
    const outside = mkdtempSync(join(tmpdir(), "mg-outside-"));
    writeFileSync(join(outside, "secret.txt"), "not the job's");
    mkdirSync(join(outside, "elsewhere"));
    writeFileSync(join(outside, "elsewhere/plate.png"), "not the job's either");
    const leads: [string, (job: string) => void][] = [
      ["a file of the material", (job) => symlinkSync(join(outside, "secret.txt"), join(job, "assets/logo-linked.svg"))],
      ["a folder of the material", (job) => symlinkSync(join(outside, "elsewhere"), join(job, "assets/plates"), "dir")],
      ["a carried folder itself", (job) => { rmSync(join(job, "refs"), { recursive: true }); symlinkSync(join(outside, "elsewhere"), join(job, "refs"), "dir"); }],
      ["a library of the page", (job) => { rmSync(join(job, "page/lib/three.min.js")); symlinkSync(join(outside, "secret.txt"), join(job, "page/lib/three.min.js")); }],
      ["the job's statement", (job) => { cpSync(join(job, "job.json"), join(outside, "job.json")); rmSync(join(job, "job.json")); symlinkSync(join(outside, "job.json"), join(job, "job.json")); }],
      ["a link to nothing", (job) => symlinkSync(join(outside, "gone.wav"), join(job, "sound/gone.wav"))],
    ];
    for (const [what, lead] of leads) {
      const source = await roundOne();
      lead(source);
      await refused(source, /leads out of .*job/);
    }
  });

  it("gives the round the file itself where a link stays inside the job", async () => {
    const source = await roundOne();
    symlinkSync("logo.svg", join(source, "assets/logo-alias.svg"));
    symlinkSync(join(source, "assets/screens"), join(source, "refs/screens"), "dir");
    const dir = nextTo();
    expect((await mg(["init", dir, "--from", source])).code).toBe(0);
    for (const [file, from] of [["assets/logo-alias.svg", "assets/logo.svg"], ["refs/screens/chat.png", "assets/screens/chat.png"]]) {
      expect(lstatSync(join(dir, file)).isFile(), file).toBe(true);
      expect(lstatSync(join(dir, file, "..")).isSymbolicLink(), file).toBe(false);
      expect(sha(join(dir, file)), file).toBe(sha(join(source, from)));
    }
  });

  it("refuses what is neither a file nor a folder, and a link back into a folder it stands in — without waiting on either", async () => {
    const piped = await roundOne();
    expect(spawnSync("mkfifo", [join(piped, "sound/pipe.wav")]).status).toBe(0); // reading it would wait for ever
    await refused(piped, /neither a file nor a folder/);
    const looped = await roundOne();
    symlinkSync("..", join(looped, "assets/screens/up"), "dir");
    await refused(looped, /leads back into a folder it stands in/);
  });

  it("refuses a round laid out inside the job it starts from, or around it", async () => {
    const source = await roundOne(), before = standing(source);
    for (const dir of [join(source, "round-two"), join(source, "assets/round-two")]) {
      const r = await mg(["init", dir, "--from", source]);
      expect(r.code, dir).not.toBe(0);
      expect(r.out, dir).toMatch(/one inside the other/);
    }
    expect(standing(source)).toEqual(before);
    const around = dirname(source);
    const r = await mg(["init", around, "--from", source]);
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/one inside the other/);
    expect(readdirSync(around)).toEqual(["job"]);
  });

  it("refuses a page that loads a library neither the job nor the skill holds", async () => {
    const source = await roundOne();
    rmSync(join(source, "page/lib/three.min.js"));
    await refused(source, /loads lib\/three\.min\.js/);
  });

  it("takes everything from the job it starts from: a flag that states a new job is refused, and so is a folder that is no job", async () => {
    const source = await roundOne();
    for (const more of [["--w", "640"], ["--format", "1x1=360x360"], ["--title", "Round two"], ["--lufs", "-14"], ["--spec"]])
      await refused(source, new RegExp(`${more[0]} .*--from`), more);
    const dir = nextTo();
    for (const from of [mkdtempSync(join(tmpdir(), "mg-no-job-")), REPO]) {
      const r = await mg(["init", dir, "--from", from]);
      expect(r.code, from).not.toBe(0);
      expect(r.out, from).toMatch(/not a job folder|repository's root/);
    }
    expect(existsSync(dir)).toBe(false);
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
  /** A job in two formats whose page is a film of its own. Each test lays one out: none stands on the page another left. */
  const jobOfItsOwnFilm = async () => {
    const job = await initJob({ more: ["--format", "9x16=360x640"] });
    plainPage(job);
    return job;
  };
  beforeAll(() => {
    ownState();
  });

  it("draws the storyboard alone while the page is still the starter, and says so", async () => {
    const job = await initJob();
    const chrome = drawing();
    const r = await mg(["board", "--job", job], { run: chrome.run });
    expect(r.code).toBe(0);
    expect(chrome.asked()).toEqual([]); // the starter's dot is not this job's film: nothing is rendered
    expect(r.out).toMatch(/without the film's frames: .*still the starter/);
    expect(Object.keys(chrome.boards)).toEqual([join(job, "board/board.png")]);
    expect(chrome.boards[join(job, "board/board.png")].shots.map((shot: any) => shot.still)).toEqual([undefined, undefined, undefined]);
  });

  it("once the page is the job's own, puts the film's frame at the middle of each shot on the board", async () => {
    const job = await jobOfItsOwnFilm();
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
    const job = await jobOfItsOwnFilm();
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
    const job = await jobOfItsOwnFilm();
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
    // "Infinity" is a number and above 0, and no length of time: every moment around the event would be NaN.
    for (const window of ["0", "wide", "-1", "", "Infinity", "1e999"]) {
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

describe.skipIf(missing.length > 0)("B43 dxb-motion-graphics — every transition on one sheet that one screen shows whole", () => {
  // The second film's writer had fifteen large sheets per format and tiled its own to look at every transition (2026-11-13).
  const SCREEN = { w: 1920, h: 1080 };
  // Each moment's still is one plain colour, none of them as light as the white words that name a still on the sheet.
  const COLOURS: Record<string, number[]> = { "0.5": [200, 0, 0], "1": [0, 120, 0], "2.5": [0, 0, 200] };
  /** HyperFrames answered by the test: a still of each moment asked, in that moment's colour, at the size the stage is framed at. */
  const colouredStills = () => {
    const rec = recorder((cmd, args) => {
      if (cmd !== "npx" || !args.includes("snapshot")) return undefined;
      const stage = readFileSync(join(args[args.indexOf("snapshot") + 1], "index.html"), "utf8");
      const [w, h] = stage.match(/data-width="(\d+)" data-height="(\d+)"/)!.slice(1);
      for (const t of args[args.indexOf("--at") + 1].split(",")) {
        const colour = COLOURS[t].map((level) => level.toString(16).padStart(2, "0")).join("");
        expect(sh("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `color=c=0x${colour}:s=${w}x${h}`, "-frames:v", "1", join(args[args.indexOf("-o") + 1], `at-${t}s.png`)]).code).toBe(0);
      }
      return { code: 0, out: "", err: "" };
    });
    return { ...rec, asked: () => rec.calls.filter((c) => c.cmd === "npx").map((c) => c.args[c.args.indexOf("--at") + 1]) };
  };
  /** A job in two formats whose page states four events out of the order of time, two of them on one second. */
  const fourEvents = async () => {
    const job = await initJob({ more: ["--format", "9x16=360x640"] }), page = join(job, "page/index.html");
    plainPage(job);
    writeFileSync(page, readFileSync(page, "utf8").replace("EVENTS: [{ name: 'lands', t: 1 }]",
      "EVENTS: [{ name: 'closes', t: 2.5 }, { name: 'opens', t: 0.5 }, { name: 'lands', t: 1 }, { name: 'rings', t: 1 }]"));
    return job;
  };
  /** A sheet as this file reads it: its size, the colour at a point, and how many of a stretch's pixels are white. */
  const picture = (file: string) => {
    const [w, h] = sh("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", file]).out.toString().trim().split(",").map(Number);
    const rgb = sh("ffmpeg", ["-v", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]).out;
    const at = (x: number, y: number) => [...rgb.subarray(3 * (y * w + x), 3 * (y * w + x) + 3)];
    const white = (x0: number, y0: number, x1: number, y1: number) => {
      let count = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (at(x, y).every((level) => level > 200)) count++;
      return count;
    };
    return { w, h, at, white };
  };

  it("lays one still of each event on one sheet, in the order of time, as large as one screen shows whole — each format its own", async () => {
    const job = await fourEvents(), stills = colouredStills();
    const r = await mg(["sheet", "--at-events", "--format", "all", "--job", job], { run: stills.run });
    expect(r.code, r.out).toBe(0);
    expect(stills.asked()).toEqual(["0.5,1,2.5", "0.5,1,2.5"]); // each moment once, though two events share it
    const inOrder = ["0.5", "1", "1", "2.5"]; // opens, lands, rings, closes
    // Four frames of 16:9 fill a screen two by two; four of 9:16 stand side by side.
    for (const [format, columns, rows] of [["16x9", 2, 2], ["9x16", 4, 1]] as const) {
      const sheet = join(job, "out/sheets", format, "events.jpg");
      expect(r.out).toContain(sheet);
      const seen = picture(sheet);
      expect(seen.w, format).toBeLessThanOrEqual(SCREEN.w);
      expect(seen.h, format).toBeLessThanOrEqual(SCREEN.h);
      expect(Math.max(seen.w / SCREEN.w, seen.h / SCREEN.h), format).toBeGreaterThan(0.9);
      const cell = { w: seen.w / columns, h: seen.h / rows };
      inOrder.forEach((t, i) => {
        const left = Math.floor((i % columns) * cell.w), top = Math.floor(Math.floor(i / columns) * cell.h);
        const middle = seen.at(Math.floor(left + cell.w / 2), Math.floor(top + cell.h / 2));
        middle.forEach((level, c) => expect(Math.abs(level - COLOURS[t][c]), `${format} still ${i + 1}: ${middle}`).toBeLessThanOrEqual(40));
        expect(seen.white(left, top, Math.floor(left + cell.w), Math.floor(top + cell.h)), `${format} still ${i + 1} is named`).toBeGreaterThan(20);
      });
    }
  });

  it("refuses the flags of the other sheets beside it, and a page without events, and starts nothing", async () => {
    const job = await fourEvents();
    for (const more of [["--n", "4"], ["--window", "0.5"], ["--around-events"]]) {
      const stills = colouredStills();
      const r = await mg(["sheet", "--at-events", ...more, "--job", job], { run: stills.run });
      expect(r.code, more[0]).not.toBe(0);
      expect(r.out, more[0]).toMatch(new RegExp(`--at-events.*${more[0]}`));
      expect(stills.calls, more[0]).toEqual([]);
    }
    const page = join(job, "page/index.html");
    writeFileSync(page, readFileSync(page, "utf8").replace(/EVENTS: \[.*\]/, "EVENTS: []"));
    const stills = colouredStills();
    const r = await mg(["sheet", "--at-events", "--job", job], { run: stills.run });
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/no events/);
    expect(stills.calls).toEqual([]);
  });
});

describe.skipIf(missing.length > 0)("B43 dxb-motion-graphics — the page's promise is measured: the same second gives the same pixels", () => {
  // The second film's writer found two renders of one page apart in 409 of 951 frames, and wrote a check of its own (2026-11-13).
  /**
   * HyperFrames answered by the test, as a page would draw: each moment a plain grey of its own — and a moment
   * that `keeps` names, drawn after a later moment in the same browser, comes out with a white corner, as a page
   * that keeps something from one frame to the next does.
   */
  const page = ({ keeps = [] as string[] } = {}) => {
    const rec = recorder((cmd, args) => {
      if (cmd !== "npx" || !args.includes("snapshot")) return undefined;
      const stage = readFileSync(join(args[args.indexOf("snapshot") + 1], "index.html"), "utf8");
      const [w, h] = stage.match(/data-width="(\d+)" data-height="(\d+)"/)!.slice(1);
      const times = args[args.indexOf("--at") + 1].split(",");
      times.forEach((t, i) => {
        const grey = Math.round(Number(t) * 50).toString(16).padStart(2, "0"), kept = keeps.includes(t) && times.slice(0, i).some((before) => Number(before) > Number(t));
        const corner = kept ? ["-vf", "drawbox=x=0:y=0:w=6:h=6:color=white:t=fill"] : [];
        expect(sh("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `color=c=0x${grey.repeat(3)}:s=${w}x${h}`, ...corner, "-frames:v", "1", join(args[args.indexOf("-o") + 1], `at-${t}s.png`)]).code).toBe(0);
      });
      return { code: 0, out: "", err: "" };
    });
    return { ...rec, draws: () => rec.calls.filter((c) => c.cmd === "npx").map((c) => c.args[c.args.indexOf("--at") + 1].split(",")) };
  };
  /** The moments drawn before `t` in one draw. */
  const pastOf = (draw: string[], t: string) => draw.slice(0, draw.indexOf(t));
  /** A job in two formats whose page states events on 0.5, 1 (twice) and 2.5 s of a 3 s film. */
  const threeMoments = async () => {
    const job = await initJob({ more: ["--format", "9x16=360x640"] }), file = join(job, "page/index.html");
    plainPage(job);
    writeFileSync(file, readFileSync(file, "utf8").replace("EVENTS: [{ name: 'lands', t: 1 }]",
      "EVENTS: [{ name: 'closes', t: 2.5 }, { name: 'opens', t: 0.5 }, { name: 'lands', t: 1 }, { name: 'rings', t: 1 }]"));
    return job;
  };
  const record = (job: string) => JSON.parse(readFileSync(join(job, "out/check-same-second.json"), "utf8"));

  it("draws each event's moment twice, in two browsers, the second time after other moments — and passes a page that keeps nothing", async () => {
    const job = await threeMoments(), drawn = page();
    const r = await mg(["check", "same-second", "--job", job], { run: drawn.run });
    expect(r.out).toMatch(/^mg check: OK — same-second .*out\/check-same-second\.json/m);
    expect(r.code).toBe(0);
    const [first, second] = drawn.draws();
    expect(drawn.draws()).toHaveLength(2);
    for (const t of ["0.5", "1", "2.5"]) {
      expect(first, t).toContain(t);
      expect(second, t).toContain(t);
      expect(pastOf(second, t), t).not.toEqual(pastOf(first, t)); // drawn after other moments than the first time
      expect(pastOf(first, t).length + pastOf(second, t).length, t).toBeGreaterThan(0);
    }
    expect(record(job)).toMatchObject({ ok: true, formats: [{ format: "16x9", moments: [{ t: 0.5, pixels: 0 }, { t: 1, pixels: 0 }, { t: 2.5, pixels: 0 }] }] });
  });

  it("fails on a page that keeps something from one moment to the next, naming the moment and its pixels", async () => {
    const job = await threeMoments(), drawn = page({ keeps: ["1"] });
    const r = await mg(["check", "same-second", "--format", "all", "--job", job], { run: drawn.run });
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/^FAILED +16x9 .*\b1 s \(36 pixels/m);
    expect(r.out).toMatch(/^FAILED +9x16 .*\b1 s \(36 pixels/m);
    expect(r.out).not.toMatch(/\b(0\.5|2\.5) s \(/);
    expect(r.out).toMatch(/^mg check: FAILED — same-second .*out\/check-same-second\.json/m);
    const kept = record(job);
    expect(kept.ok).toBe(false);
    expect(kept.formats.map((f: any) => f.format)).toEqual(["16x9", "9x16"]);
    for (const format of kept.formats) expect(format.moments.map((m: any) => [m.t, m.pixels > 0])).toEqual([[0.5, false], [1, true], [2.5, false]]);
  });

  it("a moment given alone is drawn the second time after another", async () => {
    const job = await threeMoments(), drawn = page();
    expect((await mg(["check", "same-second", "1", "--job", job], { run: drawn.run })).code).toBe(0);
    const [first, second] = drawn.draws();
    expect(first).toEqual(["1"]);
    expect(pastOf(second, "1").length).toBeGreaterThan(0);
  });

  it("refuses a moment that is no second of the film, and a check it does not have, and starts nothing", async () => {
    const job = await threeMoments();
    for (const given of ["-1", "3.5", "NaN", "Infinity", "soon", ""]) {
      const drawn = page();
      const r = await mg(["check", "same-second", "--job", job, "--", given], { run: drawn.run });
      expect(r.code, given).not.toBe(0);
      expect(r.out, given).toMatch(/is no second of the film/);
      expect(drawn.calls, given).toEqual([]);
    }
    // A name every object answers to is no check either.
    for (const what of [[], ["sideways"], ["constructor"], ["__proto__"], ["toString"]]) {
      const drawn = page();
      const r = await mg(["check", ...what, "--job", job], { run: drawn.run });
      expect(r.code, what.join()).not.toBe(0);
      expect(r.out, what.join()).toMatch(/which check\? mg check same-second/);
      expect(drawn.calls).toEqual([]);
    }
    // Seconds belong to same-second alone, and a measure that is the same in every format is asked about none.
    for (const [argv, why] of [[["in-frame", "1.5"], /in-frame takes no seconds/], [["reading", "--format", "16x9"], /reading is the same in every format/]] as const) {
      const drawn = page();
      const r = await mg(["check", ...argv, "--job", job], { run: drawn.run });
      expect(r.code, argv.join(" ")).not.toBe(0);
      expect(r.out, argv.join(" ")).toMatch(why);
      expect(drawn.calls).toEqual([]);
    }
    expect(existsSync(join(job, "out/check-same-second.json"))).toBe(false);
  });

  // Sol found it (2026-11-13): a width of 1e999 in job.json passed as above 0 and reached the stage as data-width="Infinity".
  it("refuses a size or a rate no number can be, before anything starts", async () => {
    for (const [stated, infinite, why] of [['"w": 640', '"w": 1e999', /"formats"/], ['"h": 640', '"h": 1e999', /"formats"/], ['"fps": 30', '"fps": 1e999', /"fps"/]] as const) {
      const job = await threeMoments(), file = join(job, "job.json"), drawn = page();
      writeFileSync(file, readFileSync(file, "utf8").replace(stated, infinite));
      const r = await mg(["check", "same-second", "--format", "all", "--job", job], { run: drawn.run });
      expect(r.code, infinite).not.toBe(0);
      expect(r.out, infinite).toMatch(why);
      expect(drawn.calls, infinite).toEqual([]);
    }
  });
});

/** A job's checks as job.json states them; `raw` is written as it is, so a figure JSON cannot carry (1e999) can be stated. */
const stateChecks = (job: string, checks: unknown, raw?: string) => {
  const file = join(job, "job.json"), stated = JSON.parse(readFileSync(file, "utf8"));
  writeFileSync(file, JSON.stringify({ ...stated, checks: raw === undefined ? checks : "RAW" }).replace('"RAW"', raw ?? ""));
};
const checked = (job: string, what: string) => JSON.parse(readFileSync(join(job, "out", `check-${what}.json`), "utf8"));

describe.skipIf(missing.length > 0)("B43 dxb-motion-graphics — the measures a film needs: the whole subject in frame, and never still", () => {
  // The second film's writer wrote these checks for its own film (2026-11-13); the command's are general.
  /** A 3 s film made by ffmpeg alone and losslessly: a plain ground, and a square of `side` pixels whose place is ffmpeg's expressions of t; at the job's rate unless `fps` states another. */
  const squareFilm = (file: string, { x, y = "150", side = 60, ground = "f0f0f0", ink = "101010", fps = FPS }: { x: string; y?: string; side?: number; ground?: string; ink?: string; fps?: number }) => {
    const graph = `color=c=0x${ground}:s=640x360:r=${fps}:d=3[ground];color=c=0x${ink}:s=${side}x${side}:r=${fps}:d=3[square];[ground][square]overlay=x='${x}':y='${y}'`;
    expect(sh("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", graph, "-c:v", "libx264", "-crf", "0", "-pix_fmt", "yuv420p", file]).err).toBe("");
  };
  // Measured on these films with ffmpeg's own bbox and overlay (2026-11-13): the square that leaves x = 300 at 1 s
  // at 200 px a second stands 8 px from the right edge at frame 71 and on it from frame 72; held there, it stays
  // on it to the last frame, 89; let go, it has left the frame whole from frame 81.
  const REACHES = "if(lt(t,1),300,min(300+(t-1)*200,580))", LEAVES = "if(lt(t,1),300,300+(t-1)*200)";

  it("passes a film whose subject stays its margin clear of every edge, and says how near it came and what it cannot judge", async () => {
    const job = await initJob();
    squareFilm(film(job), { x: "300" });
    stateChecks(job, { "in-frame": { margin: 4, darker: 70 } });
    const r = await mg(["check", "in-frame", "--job", job]);
    expect(r.out).toMatch(/^OK +16x9 — 90 frame\(s\), 90 showing the subject, none within 4 px of the edge; nearest: left 300, right 280, top 150, bottom 150/m);
    expect(r.out).toMatch(/cannot judge/);
    expect(r.code).toBe(0);
    expect(checked(job, "in-frame")).toMatchObject({ ok: true, formats: [{ format: "16x9", frames: 90, margin: 4, nearest: { left: 300, right: 280, top: 150, bottom: 150 }, touching: [] }] });
  });

  it("fails a film whose subject reaches the edge, naming the frames and the side, by the margin the job states", async () => {
    const job = await initJob();
    squareFilm(film(job), { x: REACHES });
    stateChecks(job, { "in-frame": { margin: 4, darker: 70 } });
    const r = await mg(["check", "in-frame", "--job", job]);
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/^FAILED +16x9 — 18 of 90 frame\(s\) within 4 px of the edge: 2\.4–2\.967 s \(frames 72–89\) right; 90 frame\(s\) show the subject/m);
    expect(r.out).toMatch(/^mg check: FAILED — in-frame .*out\/check-in-frame\.json/m);
    expect(checked(job, "in-frame").formats[0].touching).toEqual([{ from: 2.4, to: 2.967, frames: [72, 89], sides: ["right"] }]);
    stateChecks(job, { "in-frame": { margin: 9, darker: 70 } }); // frame 71 stands 8 px off: inside a margin of 9
    expect((await mg(["check", "in-frame", "--job", job])).out).toMatch(/19 of 90 frame\(s\) within 9 px of the edge: 2\.367–2\.967 s \(frames 71–89\) right/);
  });

  it("does not see a subject that has left the frame whole, and says how many frames showed it", async () => {
    const job = await initJob();
    squareFilm(film(job), { x: LEAVES });
    stateChecks(job, { "in-frame": { margin: 4, darker: 70 } });
    const r = await mg(["check", "in-frame", "--job", job]);
    expect(r.code).toBe(1); // it crossed the edge on its way out
    expect(r.out).toMatch(/^FAILED +16x9 — 9 of 90 frame\(s\) within 4 px of the edge: 2\.4–2\.667 s \(frames 72–80\) right; 81 frame\(s\) show the subject/m);
    expect(r.out).toMatch(/A frame that shows nothing of the subject is not judged/);
  });

  it("tells the subject from the ground as the job states it: here lighter than a level, on a dark ground", async () => {
    const job = await initJob();
    squareFilm(film(job), { x: "0", ground: "101010", ink: "f0f0f0" });
    stateChecks(job, { "in-frame": { margin: 4, lighter: 200 } });
    const r = await mg(["check", "in-frame", "--job", job]);
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/90 of 90 frame\(s\) within 4 px of the edge: 0–2\.967 s \(frames 0–89\) left/);
  });

  it("refuses a statement it cannot measure by, and a film not yet rendered, and reads no film", async () => {
    const job = await initJob();
    squareFilm(film(job), { x: "300" });
    const refused: [unknown, string | undefined, RegExp][] = [
      [undefined, undefined, /"checks"."in-frame"/],
      [{ "in-frame": { margin: 4 } }, undefined, /"darker" or "lighter"/],
      [{ "in-frame": { margin: 4, darker: 70, lighter: 200 } }, undefined, /"darker" or "lighter"/],
      [{ "in-frame": { margin: 0, darker: 70 } }, undefined, /"margin"/],
      [{ "in-frame": { margin: 2.5, darker: 70 } }, undefined, /"margin"/],
      [{ "in-frame": { margin: "4", darker: 70 } }, undefined, /"margin"/],
      [{ "in-frame": { margin: 180, darker: 70 } }, undefined, /"margin"/], // half the frame's short side: every pixel is near an edge
      [undefined, '{ "in-frame": { "margin": 1e999, "darker": 70 } }', /"margin"/],
      [{ "in-frame": { margin: 4, darker: 0 } }, undefined, /"darker"/],
      [{ "in-frame": { margin: 4, darker: 256 } }, undefined, /"darker"/],
      [{ "in-frame": { margin: 4, darker: 70.5 } }, undefined, /"darker"/],
      [{ "in-frame": { margin: 4, lighter: 255 } }, undefined, /"lighter"/],
      [undefined, '{ "in-frame": { "margin": 4, "lighter": -1e999 } }', /"lighter"/],
    ];
    for (const [checks, raw, why] of refused) {
      stateChecks(job, checks, raw);
      const rec = recorder();
      const r = await mg(["check", "in-frame", "--job", job], { run: rec.run });
      expect(r.code, raw ?? JSON.stringify(checks)).not.toBe(0);
      expect(r.out, raw ?? JSON.stringify(checks)).toMatch(why);
      expect(rec.calls, raw ?? JSON.stringify(checks)).toEqual([]);
    }
    stateChecks(job, { "in-frame": { margin: 4, darker: 70 } });
    rmSync(film(job));
    const rec = recorder();
    const r = await mg(["check", "in-frame", "--job", job], { run: rec.run });
    expect(r.out).toMatch(/fixture-film-16x9\.mp4 is not there — render it first/);
    expect(rec.calls).toEqual([]);
  });

  it("never still: passes a stretch in which every frame moves, and fails one in which the picture stops, naming the frames", async () => {
    const job = await initJob();
    plainPage(job); // its one beat: start, at 0 s
    squareFilm(film(job), { x: "min(t,1.5)*100", y: "80", side: 200 }); // the square stops at 1.5 s
    stateChecks(job, { "never-still": [{ from: "start", to: 1.4 }] });
    const moving = await mg(["check", "never-still", "--job", job]);
    expect(moving.out).toMatch(/^OK +16x9 — 0–1\.4 s: 42 frame\(s\), each moved from the one before; the fewest pixels changed: 800/m);
    expect(moving.code).toBe(0);

    stateChecks(job, { "never-still": [{ from: 0.5, to: 1.4 }, { from: 1, to: 2 }] });
    const stops = await mg(["check", "never-still", "--job", job]);
    expect(stops.code).toBe(1);
    expect(stops.out).toMatch(/^FAILED +16x9 — 1–2 s: 15 of 30 frame\(s\) stood still: 1\.533–2 s \(frames 46–60\)/m);
    expect(checked(job, "never-still").formats[0].stretches.map((s: any) => s.still)).toEqual([[], [{ from: 1.533, to: 2, frames: [46, 60] }]]);
  });

  // Sol found it (2026-11-13): a 60 fps file in a 30 fps job was measured over 0.5–1 s for a stretch of 1–2 s, and its stop passed.
  it("never still: measures a file at its own rate, not the job's", async () => {
    const job = await initJob();
    plainPage(job);
    squareFilm(film(job), { x: "min(t,1.2)*300", y: "80", side: 200, fps: 60 }); // the square stops at 1.2 s: frame 72 of 60 a second
    stateChecks(job, { "never-still": [{ from: 1, to: 2 }] });
    const r = await mg(["check", "never-still", "--job", job]);
    expect(r.code, r.out).toBe(1);
    expect(r.out).toMatch(/^FAILED +16x9 — 1–2 s: 48 of 60 frame\(s\) stood still: 1\.217–2 s \(frames 73–120\)/m);
  });

  it("measures a stretch to the film's last frame, and refuses one the master does not hold rather than pass it", async () => {
    const job = await initJob();
    plainPage(job);
    squareFilm(film(job), { x: "t*100", side: 200 });
    stateChecks(job, { "never-still": [{ from: 2, to: 3 }] }); // its frames 60 to 89: the film has no frame at 3 s
    const toTheEnd = await mg(["check", "never-still", "--job", job]);
    expect(toTheEnd.out).toMatch(/^OK +16x9 — 2–3 s: 29 frame\(s\), each moved/m);
    expect(toTheEnd.code).toBe(0);
    // A master of one second, where the page states three: nothing of 2–3 s is there to measure.
    expect(sh("ffmpeg", ["-v", "error", "-y", "-i", film(job), "-t", "1", "-c", "copy", `${film(job)}.mp4`]).code).toBe(0);
    cpSync(`${film(job)}.mp4`, film(job));
    const shorter = await mg(["check", "never-still", "--job", job]);
    expect(shorter.code).not.toBe(0);
    expect(shorter.out).toMatch(/holds no two frames of 2–3 s/);
    expect(existsSync(join(job, "out/check-never-still.json"))).toBe(false);
  });

  it("refuses a stretch it cannot read, and reads no film", async () => {
    const job = await initJob();
    plainPage(job);
    squareFilm(film(job), { x: "300" });
    const refused: [unknown, string | undefined][] = [
      [undefined, undefined], [{ "never-still": [] }, undefined], [{ "never-still": { from: 0, to: 1 } }, undefined],
      [{ "never-still": [{ from: 2, to: 1 }] }, undefined], [{ "never-still": [{ from: 1, to: 1 }] }, undefined],
      [{ "never-still": [{ from: -1, to: 1 }] }, undefined], [{ "never-still": [{ from: 0, to: 3.5 }] }, undefined],
      [{ "never-still": [{ from: "dawn", to: 1 }] }, undefined], [{ "never-still": [{ from: 0 }] }, undefined],
      [undefined, '{ "never-still": [{ "from": 0, "to": 1e999 }] }'],
    ];
    for (const [checks, raw] of refused) {
      stateChecks(job, checks, raw);
      const rec = recorder();
      const r = await mg(["check", "never-still", "--job", job], { run: rec.run });
      expect(r.code, raw ?? JSON.stringify(checks)).not.toBe(0);
      expect(r.out, raw ?? JSON.stringify(checks)).toMatch(/"never-still"/);
      expect(rec.calls, raw ?? JSON.stringify(checks)).toEqual([]);
    }
  });
});

describe("B43 dxb-motion-graphics — every text stands whole long enough to be read", () => {
  /** A 3 s film's page that states its texts beside its timing, in FILM.TEXTS. */
  const textsOnPage = async (texts: unknown) => {
    const job = await initJob(), page = join(job, "page/index.html");
    plainPage(job);
    writeFileSync(page, readFileSync(page, "utf8").replace("EVENTS: [{ name: 'lands', t: 1 }]", `EVENTS: [{ name: 'lands', t: 1 }], TEXTS: ${JSON.stringify(texts)}`));
    return job;
  };
  const FIRST = { text: "Just between you.", whole: 0.5, leaves: 2 };                         // 3 words: 1 s at three a second, 1.5 s whole
  const SEVEN = { text: "Every one of these seven words counts", whole: 0.5, leaves: 2.5 };   // 7 words: 2.33 s, 2 s whole
  const AFTER = { text: "the notice on its screen", words: 3, whole: 0.5, leaves: 2.4, after: "Just between you." };

  it("holds every text the page states to the words it carries at the rate the job states, naming the short ones", async () => {
    const job = await textsOnPage([FIRST, SEVEN, AFTER]);
    stateChecks(job, { reading: { wordsPerSecond: 3 } });
    const r = await mg(["check", "reading", "--job", job]);
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/^ok +3 words need 1\.00 s · whole 0\.50–2\.00 s, read from 0\.50 s: 1\.50 s · Just between you\.$/m);
    expect(r.out).toMatch(/^SHORT +7 words need 2\.33 s · whole 0\.50–2\.50 s, read from 0\.50 s: 2\.00 s · Every one of these seven words counts$/m);
    // Read once the first is read: from 1.5 s, and 0.9 s are left of it.
    expect(r.out).toMatch(/^SHORT +3 words need 1\.00 s · whole 0\.50–2\.40 s, read from 1\.50 s: 0\.90 s · the notice on its screen$/m);
    expect(r.out).toMatch(/^mg check: FAILED — reading .*out\/check-reading\.json/m);
    expect(checked(job, "reading")).toMatchObject({ ok: false, wordsPerSecond: 3, texts: [{ ok: true }, { ok: false }, { ok: false, from: 1.5 }] });
  });

  it("the rate is the job's: one text read at two words a second, and what is read after nothing else", async () => {
    const job = await textsOnPage([FIRST, { ...AFTER, after: undefined }]);
    stateChecks(job, { reading: { wordsPerSecond: 2 } });
    expect((await mg(["check", "reading", "--job", job])).out).toMatch(/^ok +3 words need 1\.50 s .*Just between you\.$/m); // 1.5 s whole: just enough
    stateChecks(job, { reading: { wordsPerSecond: 1.9 } });
    const slower = await mg(["check", "reading", "--job", job]);
    expect(slower.code).toBe(1);
    expect(slower.out).toMatch(/^SHORT +3 words need 1\.58 s .*Just between you\.$/m);
    expect(slower.out).toMatch(/^ok +3 words need 1\.58 s · whole 0\.50–2\.40 s, read from 0\.50 s: 1\.90 s · the notice on its screen$/m); // read after nothing: from when it is whole
  });

  it("the starter states its line: held long enough to be read in a film of twelve seconds, and not in one of three", async () => {
    for (const [dur, code] of [[12, 0], [3, 1]]) {
      const job = await initJob({ dur });
      stateChecks(job, { reading: { wordsPerSecond: 3 } });
      const r = await mg(["check", "reading", "--job", job]);
      expect(r.out, String(dur)).toMatch(/ 5 words need 1\.67 s · .* · Every shot becomes the next$/m);
      expect(r.code, String(dur)).toBe(code);
    }
  });

  it("counts a text's words, not the marks between them", async () => {
    const job = await textsOnPage([{ text: "WhatsApp · Message someone who matters. · Spec ad.", whole: 0, leaves: 3 }]);
    stateChecks(job, { reading: { wordsPerSecond: 3 } });
    const r = await mg(["check", "reading", "--job", job]);
    expect(r.out).toMatch(/^ok +7 words need 2\.33 s/m);
    expect(r.code).toBe(0);
  });

  it("refuses a rate or a text it cannot read", async () => {
    const rates: [unknown, string | undefined][] = [[undefined, undefined], [{ reading: {} }, undefined], [{ reading: { wordsPerSecond: 0 } }, undefined],
      [{ reading: { wordsPerSecond: -3 } }, undefined], [{ reading: { wordsPerSecond: "3" } }, undefined], [undefined, '{ "reading": { "wordsPerSecond": 1e999 } }']];
    const job = await textsOnPage([FIRST]);
    for (const [checks, raw] of rates) {
      stateChecks(job, checks, raw);
      const r = await mg(["check", "reading", "--job", job]);
      expect(r.code, raw ?? JSON.stringify(checks)).not.toBe(0);
      expect(r.out, raw ?? JSON.stringify(checks)).toMatch(/"wordsPerSecond"/);
    }
    const texts: [unknown, RegExp][] = [
      [undefined, /FILM\.TEXTS/], [[], /FILM\.TEXTS/], [[{ ...FIRST, text: "" }], /"text"/], [[{ ...FIRST, text: 3 }], /"text"/],
      [[{ ...FIRST, whole: 2, leaves: 1 }], /"whole" .*"leaves"/], [[{ ...FIRST, leaves: 3.5 }], /"leaves"/], [[{ ...FIRST, whole: -1 }], /"whole"/],
      [[{ ...FIRST, whole: "soon" }], /"whole"/], [[{ ...FIRST, words: 0 }], /"words"/], [[{ ...FIRST, words: 2.5 }], /"words"/],
      [[{ ...FIRST, after: "a text that is not there" }], /"after"/], [[{ ...FIRST, after: FIRST.text }], /"after"/],
      [[{ ...AFTER, after: FIRST.text }, FIRST], /"after"/], // a text read after one that comes later
    ];
    for (const [stated, why] of texts) {
      const other = await textsOnPage(stated);
      stateChecks(other, { reading: { wordsPerSecond: 3 } });
      if (stated === undefined) plainPage(other);
      const r = await mg(["check", "reading", "--job", other]);
      expect(r.code, JSON.stringify(stated)).not.toBe(0);
      expect(r.out, JSON.stringify(stated)).toMatch(why);
    }
  });
});

describe.skipIf(missing.length > 0)("B43 dxb-motion-graphics — a join holds: the same instant drawn by its two layers", () => {
  // The second film's writer held the join between its flat drawing and its phone in space to a mean difference, and
  // proved the measure each run by moving the phone a pixel aside and requiring the comparison to fail (2026-11-13).
  /**
   * HyperFrames answered by the test, as a page that honours window.MG_DRAW draws: a light ground and a dark square at
   * x = 300 — the layer "flat" so, the layer "space" `apart` pixels further right with its top edge a shade lighter, as two
   * rasterisers never agree to the last level — and a drawing asked for a nudge moves its square as many pixels, unless `deaf`.
   */
  const layered = ({ apart = 0, deaf = false } = {}) => {
    const asked: { layer: string; nudge: number }[] = [];
    const rec = recorder((cmd, args) => {
      if (cmd !== "npx" || !args.includes("snapshot")) return undefined;
      const stage = readFileSync(join(args[args.indexOf("snapshot") + 1], "index.html"), "utf8");
      const [w, h] = stage.match(/data-width="(\d+)" data-height="(\d+)"/)!.slice(1);
      const draw = JSON.parse(stage.match(/<script>window\.MG_DRAW = (\{[^<]*\});<\/script>\s*<script>/)![1]);
      asked.push(draw);
      const x = 300 + (draw.layer === "space" ? apart : 0) + (deaf ? 0 : draw.nudge);
      const edge = draw.layer === "space" ? `,drawbox=x=${x}:y=150:w=60:h=1:color=0x303030:t=fill` : "";
      for (const t of args[args.indexOf("--at") + 1].split(","))
        expect(sh("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `color=c=0xf0f0f0:s=${w}x${h},format=rgb24,drawbox=x=${x}:y=150:w=60:h=60:color=0x101010:t=fill${edge}`, "-frames:v", "1", join(args[args.indexOf("-o") + 1], `at-${t}s.png`)]).code).toBe(0);
      return { code: 0, out: "", err: "" };
    });
    return { ...rec, asked };
  };
  /** A job whose page states one join, at 1 s, between its layers "flat" and "space". */
  const oneJoin = async (joins: unknown = [{ name: "lifts", t: 1, layers: ["flat", "space"] }]) => {
    const job = await initJob(), page = join(job, "page/index.html");
    plainPage(job);
    writeFileSync(page, readFileSync(page, "utf8").replace("EVENTS: [{ name: 'lands', t: 1 }]", `EVENTS: [{ name: 'lands', t: 1 }], JOINS: ${JSON.stringify(joins)}`));
    return job;
  };

  it("draws the instant by each layer, and once more with the second layer's subject a pixel aside: the join holds and the measure sees a pixel", async () => {
    const job = await oneJoin(), page = layered();
    stateChecks(job, { join: { mean: 0.05 } });
    const r = await mg(["check", "join", "--job", job], { run: page.run });
    expect(r.out).toMatch(/^OK +16x9 — lifts at 1 s: flat and space 0\.0\d+ levels apart on average, under 0\.05; space a pixel aside 0\.1\d+ — the measure sees a pixel/m);
    expect(r.code).toBe(0);
    expect(page.asked).toEqual([{ layer: "flat", nudge: 0 }, { layer: "space", nudge: 0 }, { layer: "space", nudge: 1 }]);
    expect(checked(job, "join")).toMatchObject({ ok: true, mean: 0.05, formats: [{ format: "16x9", joins: [{ name: "lifts", t: 1, holds: true, sees: true }] }] });
    expect(r.out).toMatch(/cannot judge/);
  });

  it("fails a join whose layers lie apart, and a measure that cannot see a pixel — by the page or by the mean stated", async () => {
    const job = await oneJoin();
    stateChecks(job, { join: { mean: 0.05 } });
    const apart = await mg(["check", "join", "--job", job], { run: layered({ apart: 2 }).run });
    expect(apart.code).toBe(1);
    expect(apart.out).toMatch(/^FAILED +16x9 — lifts at 1 s: flat and space 0\.\d+ levels apart on average, not under 0\.05/m);
    const deaf = await mg(["check", "join", "--job", job], { run: layered({ deaf: true }).run });
    expect(deaf.code).toBe(1);
    expect(deaf.out).toMatch(/^FAILED +16x9 — lifts at 1 s: .*space a pixel aside 0\.0\d+ — the measure does not see a pixel/m);
    stateChecks(job, { join: { mean: 0.5 } });
    const loose = await mg(["check", "join", "--job", job], { run: layered().run });
    expect(loose.code).toBe(1);
    expect(loose.out).toMatch(/the measure does not see a pixel/);
  });

  it("refuses a mean or a join it cannot read, and draws nothing", async () => {
    const job = await oneJoin();
    const means: [unknown, string | undefined][] = [[undefined, undefined], [{ join: {} }, undefined], [{ join: { mean: 0 } }, undefined],
      [{ join: { mean: -1 } }, undefined], [{ join: { mean: 255 } }, undefined], [{ join: { mean: "0.6" } }, undefined], [undefined, '{ "join": { "mean": 1e999 } }']];
    for (const [checks, raw] of means) {
      stateChecks(job, checks, raw);
      const page = layered();
      const r = await mg(["check", "join", "--job", job], { run: page.run });
      expect(r.code, raw ?? JSON.stringify(checks)).not.toBe(0);
      expect(r.out, raw ?? JSON.stringify(checks)).toMatch(/"mean"/);
      expect(page.calls).toEqual([]);
    }
    const joins: unknown[] = [undefined, [], [{ name: "lifts", t: 4, layers: ["flat", "space"] }], [{ name: "lifts", t: "soon", layers: ["flat", "space"] }],
      [{ name: "lifts", t: 1, layers: ["flat"] }], [{ name: "lifts", t: 1, layers: ["flat", "flat"] }], [{ t: 1, layers: ["flat", "space"] }]];
    for (const stated of joins) {
      const other = await oneJoin(stated);
      if (stated === undefined) plainPage(other);
      stateChecks(other, { join: { mean: 0.05 } });
      const page = layered();
      const r = await mg(["check", "join", "--job", other], { run: page.run });
      expect(r.code, JSON.stringify(stated)).not.toBe(0);
      expect(r.out, JSON.stringify(stated)).toMatch(/FILM\.JOINS/);
      expect(page.calls).toEqual([]);
    }
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

    // `mg verify` holds the film to the same cue, planned from the copy — and gives the job no copy itself.
    makeFilm(film(other));
    expect((await mg(["verify", "--job", other])).out).toMatch(/sound: silent where the job states 1 cue\(s\) declared in sound\/cues\.json/);
    rmSync(copy);
    const copyless = await mg(["verify", "--job", other]);
    expect(copyless.code).not.toBe(0);
    expect(copyless.out).toMatch(/sound\/pop-mid-01\.wav is not there.*mg sound/);
    expect(existsSync(copy)).toBe(false);

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

  it("a file of the starter set reached through a link out of the set is refused and nothing is copied; a link that stays in the set gives the job a file", () => {
    // The starter set is the skill's own folder, so the rule is tried on a copy of the tool, whose set this test fills.
    const copy = mkdtempSync(join(tmpdir(), "mg-repository-")), set = join(copy, relative(REPO, SKILL), "sfx");
    cpSync(join(REPO, "tools/motion-graphics"), join(copy, "tools/motion-graphics"), { recursive: true });
    cpSync(TEMPLATES, join(copy, relative(REPO, TEMPLATES)), { recursive: true });
    const cli = (args: string[]) => {
      const r = sh("node", [join(copy, "tools/motion-graphics/mg.mjs"), ...args]);
      return { code: r.code, out: r.out.toString() };
    };
    const outside = mkdtempSync(join(tmpdir(), "mg-outside-"));
    mkdirSync(join(set, "pop"), { recursive: true });
    blip(join(set, "pop/own.wav"));
    blip(join(outside, "not-of-the-set.wav"));
    symlinkSync(join(outside, "not-of-the-set.wav"), join(set, "pop/linked-file.wav")); // a file of the set that is a link out of it
    symlinkSync(outside, join(set, "linked-folder"), "dir");                             // a folder of the set that is one
    symlinkSync("own.wav", join(set, "pop/other-name.wav"));                             // a link that stays in the set

    const other = join(mkdtempSync(join(tmpdir(), "mg-")), "job");
    expect(cli(["init", other, "--w", "640", "--h", "360", "--dur", "3"]).code).toBe(0);
    for (const file of ["sfx:pop/linked-file.wav", "sfx:linked-folder/not-of-the-set.wav"]) {
      cues(other, [{ at: 1, file, align: "start" }]);
      const refused = cli(["sound", "--job", other]);
      expect(refused.code, file).not.toBe(0);
      expect(refused.out, file).toMatch(/leads out of the starter set through a link/);
      expect(readdirSync(join(other, "sound")), file).toEqual(["cues.json"]);
    }

    cues(other, [{ at: 1, file: "sfx:pop/other-name.wav", align: "start" }]);
    const kept = cli(["sound", "--job", other]);
    expect(kept.out).toMatch(/mg sound: 1 cue\(s\)/);
    expect(kept.code).toBe(0);
    const own = join(other, "sound/other-name.wav");
    expect(lstatSync(own).isFile()).toBe(true); // the sound itself, not the link the set names it by
    expect(sha(own)).toBe(sha(join(set, "pop/own.wav")));
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

  it("a tool deaf to the request to end is ended all the same, and no process is left behind", () => {
    // node that hears SIGTERM, writes that it did, and carries on: by itself it would end after half a minute.
    const notes = mkdtempSync(join(tmpdir(), "mg-deaf-")), heard = join(notes, "heard"), pidFile = join(notes, "pid");
    const DEAF = ["-e", `const { writeFileSync } = require("node:fs");
      process.on("SIGTERM", () => writeFileSync(${JSON.stringify(heard)}, "asked to end"));
      writeFileSync(${JSON.stringify(pidFile)}, String(process.pid));
      setTimeout(() => {}, 30000)`];
    process.env.DXB_MG_TOOL_TIMEOUT = "1"; // long enough for node to be listening before it is asked
    const alive = (pid: number) => {
      try {
        return process.kill(pid, 0);
      } catch {
        return false;
      }
    };
    try {
      const began = Date.now();
      expect(() => run(process.execPath, DEAF)).toThrow(/did not end within 1 s.*DXB_MG_TOOL_TIMEOUT/s);
      expect(Date.now() - began).toBeLessThan(15_000);
      expect(readFileSync(heard, "utf8")).toBe("asked to end"); // it was asked first, and went on
      expect(alive(Number(readFileSync(pidFile, "utf8")))).toBe(false);
    } finally {
      process.env.DXB_MG_TOOL_TIMEOUT = "0.3";
      const pid = existsSync(pidFile) ? Number(readFileSync(pidFile, "utf8")) : 0;
      if (pid && alive(pid)) process.kill(pid, "SIGKILL");
    }
  }, 20_000); // the limit, then the five seconds a tool is given between being asked and being ended

  it("a limit that is no number of seconds a timer can be set to is refused in words, and no tool is started", async () => {
    const job = await initJob(), rec = recorder();
    writeFileSync(film(job), "a film ffprobe is never asked about");
    try {
      for (const stated of ["Infinity", "-Infinity", "NaN", "soon", "", "0", "-5", "1e12"]) {
        process.env.DXB_MG_TOOL_TIMEOUT = stated;
        expect(() => toolSeconds(), stated).toThrow(`DXB_MG_TOOL_TIMEOUT takes a number of seconds, from 0.001 to 2147483, not "${stated}"`);
      }
      process.env.DXB_MG_TOOL_TIMEOUT = "Infinity";
      const r = await mg(["verify", "--job", job], { run: rec.run });
      expect(r.code).toBe(1);
      expect(r.out).toMatch(/^mg verify: FAILED — DXB_MG_TOOL_TIMEOUT takes a number of seconds, from 0\.001 to 2147483, not "Infinity"/m);
      expect(rec.calls).toEqual([]);
      for (const [stated, seconds] of [["0.3", 0.3], ["90", 90], ["2147483", 2147483]] as const) {
        process.env.DXB_MG_TOOL_TIMEOUT = stated;
        expect(toolSeconds()).toBe(seconds);
      }
    } finally {
      process.env.DXB_MG_TOOL_TIMEOUT = "0.3";
    }
  });

  it("left to itself, the limit is two hours: long enough for a 4K render", () => {
    delete process.env.DXB_MG_TOOL_TIMEOUT;
    expect(toolSeconds()).toBe(7200);
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
    init: ["<dir>", "--title", "--w", "--h", "--format", "--fps", "--dur", "--lufs", "--spec", "--brand", "--from"],
    board: ["--format", "--job"],
    stills: ["<seconds…>", "--format", "--job"],
    sheet: ["--around-events", "--at-events", "--n", "--window", "--format", "--job"],
    events: ["--job"],
    sound: ["--job"],
    render: ["--format", "--scale", "--4k", "--alpha", "--fps", "--job"],
    verify: ["--job"],
    "motion-read": ["--format", "--model", "--job"],
    check: ["<what>", "same-second", "in-frame", "reading", "never-still", "join", "--format", "--job"],
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

  /**
   * The flags a command table gives each command: the table's rows are the lines that open with "| `mg ",
   * and a row's first cell names one command or more, each in its own code span.
   */
  const tabled = (file: string) => {
    const flags: Record<string, string[]> = {};
    for (const row of readFileSync(file, "utf8").split("\n").filter((line) => line.startsWith("| `mg "))) {
      // The first cell ends at the first bar that stands outside a code span and is not escaped.
      const spans = row.slice(2).split("`"), cellEnds = spans.findIndex((part, i) => i % 2 === 0 && /(?<!\\)\|/.test(part));
      for (const span of spans.slice(0, cellEnds).filter((_, i) => i % 2 === 1)) {
        const command = span.split(" ")[1];
        flags[command] = [...new Set([...(flags[command] ?? []), ...(span.match(/--[\w-]+/g) ?? [])])].sort();
      }
    }
    return flags;
  };

  it.each(["SKILL.md", "CONTRACT.md"])("%s's command table gives each command the flags its help prints, and no other", (name) => {
    const table = tabled(name === "SKILL.md" ? join(SKILL, name) : join(REPO, ".planning/quick/20261112-motion-graphics", name));
    // --job is said once, in the words around the table.
    const helped = Object.fromEntries(Object.keys(FLAGS).map((command) => [command, FLAGS[command].filter((flag) => flag.startsWith("--") && flag !== "--job").sort()]));
    expect(table).toEqual(helped);
  });

  it("the skill's path names no size of render that mg render does not have", () => {
    // Step 5 sent its reader to "`mg render` at review size", and the command has no such size (the second film's writer, 2026-11-13).
    const skill = readFileSync(join(SKILL, "SKILL.md"), "utf8");
    expect(sh("node", [MG, "render", "--help"], nowhere).out.toString()).not.toMatch(/review/);
    expect(skill).not.toMatch(/review size/);
    expect(skill).toMatch(/Then `mg render`[^.]*\bat its own size\b/);
  });
});

describe("B43 dxb-motion-graphics — the skill points at craft that is written", () => {
  const skill = readFileSync(join(SKILL, "SKILL.md"), "utf8").replace(/\s+/g, " "); // a sentence runs over the file's lines
  /** A reference's section: what stands under the heading that begins with `title`, up to the next heading of its rank. */
  const section = (file: string, title: string) => readFileSync(join(SKILL, file), "utf8").split(/^## /m).find((part) => part.startsWith(title));

  it("every section of a reference the skill names stands in that reference, under that heading", () => {
    const named = [...skill.matchAll(/`(references\/[\w-]+\.md)`,\s+"([^"]+)"/g)].map((pointer) => [pointer[1], pointer[2]]);
    expect(named).toContainEqual(["references/craft.md", "Animating an existing illustration"]);
    for (const [file, title] of named) expect(section(file, title), `${file}: ${title}`).toBeDefined();
  });

  it("engines by the shot: an object in space that must join a flat drawing has its engine, its price and its limit written", () => {
    // The second film's writer chose three.js over Blender for such an object, and found nothing in the skill to choose by (2026-11-13).
    const engines = skill.match(/Engines by the shot:.*?Existing illustrations/)![0];
    expect(engines).toContain('`references/craft.md`, "An object in space that joins a flat drawing"');
    const craft = section("references/craft.md", "An object in space that joins a flat drawing")!.replace(/\s+/g, " ");
    for (const said of [/three\.js in the page/, /same pixels/, /screen/, /The price/, /not path-traced/, /Blender is still the answer/, /`blender\.md`/]) expect(craft).toMatch(said);
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
