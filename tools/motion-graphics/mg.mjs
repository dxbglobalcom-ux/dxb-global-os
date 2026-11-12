#!/usr/bin/env node
// mg — the one command of dxb-motion-graphics (B43, CEO 2026-11-12). A film is a job folder: real
// material, a storyboard approved before anything moves, one page whose picture is a pure function
// of time, sound laid on its events last. mg lays the folder out, shows the film at exact times,
// renders it whole through HyperFrames at the guarded version, and measures the finished file.
// Every command prints one decisive line and exits non-zero on failure. No packages used: it starts
// npx hyperframes, ffmpeg, ffprobe, blender, nvidia-smi and the system Chrome, each through `run`.
// One command leaves the machine: the motion reading sends the film to its reader, through `http`.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { drawBoard, formatLine, writeBoardPage } from "./lib/board.mjs";
import { goodVersion, hyperframes, latestVersion, proveVersion } from "./lib/hyperframes.mjs";
import { Refusal, TEMPLATES, filmName, formatBySize, formatsNamed, insideJob, layOutJob, masterOf, openJob, readFilm, readJson, sizePage, writeJson } from "./lib/job.mjs";
import { ANSWER_MINUTES, READERS, readMotion, request } from "./lib/motion-read.mjs";
import { lastLines, makeSheets, renderFilm, scaleFor, takeStills } from "./lib/picture.mjs";
import { bringStarterSounds, planCues, writeSoundBlock } from "./lib/sound.mjs";
import { failures, verifyFilms } from "./lib/verify.mjs";

const BLENDER_NEEDS_MB = 4000;
const AROUND_EVENT = 0.25; // seconds each side of an event that its sheet covers, when --window states no other
// A tool still running after this long is taken for one that never ends. The longest thing mg starts
// is a 4K render (measured 2026-11-12: the 3 s starter film at 3840×2160 took 7 s); a film that needs
// longer states its own limit in DXB_MG_TOOL_TIMEOUT, in seconds.
const TOOL_HOURS = 2;

// An option as parseArgs reads it, with what help prints of it: the value written after it, what it does.
const text = (value, says) => ({ type: "string", value, says });
const flag = (says) => ({ type: "boolean", says });
const JOB = { job: text("<dir>", "the job folder (the current folder when not given)") };
const ONE_FORMAT = { format: text("<name>", "the format drawn (the job's first when not given)") };
const EACH_FORMAT = { format: text("<name>|all", "the format drawn, or every format of the job (its first when not given)") };

// What each command does and takes: its arguments, then its options. `parse` reads a command's options
// from here and `mg <command> --help` prints them, so help names no option the command would refuse.
const TAKES = {
  init: {
    does: "Lays a job folder out in <dir>: job.json, the page and the storyboard from the skill's templates.",
    args: "<dir>",
    options: {
      title: text('"…"', "the film's title (the folder's name when not given)"),
      w: text("<pixels>", "the first format's width (1920 when not given)"),
      h: text("<pixels>", "the first format's height (1080 when not given)"),
      format: { ...text("<name>=<w>x<h>", "one more format, such as 9x16=1080x1920; given again for each further one"), multiple: true },
      fps: text("<n>", "the film's frames a second (30 when not given)"),
      dur: text("<seconds>", "the film's length (12 when not given)"),
      lufs: text("<n>", "the delivery's loudness target, such as -16 (when not given, mg verify measures the loudness and judges nothing)"),
      spec: flag("the job is an independent spec piece, not a commissioned film"),
      brand: text('"…"', "whose brand the film shows"),
    },
  },
  board: {
    does: "Draws the storyboard, board/board.json, as one image — board/board.png, or board/board-<format>.png for a format that is not the job's first — each shot with the film's frame at its middle once the job's page can be drawn.",
    options: { ...EACH_FORMAT, ...JOB },
  },
  stills: { does: "Takes stills of the film at exact seconds, into out/stills/<format>/.", args: "<seconds…>", options: { ...ONE_FORMAT, ...JOB } },
  sheet: {
    does: "Lays the film out as contact sheets, into out/sheets/<format>/ for each format asked for.",
    options: {
      "around-events": flag("one sheet for each event, of the moments around it, instead of one sheet of the whole film"),
      n: text("<count>", "the stills on a sheet (9 when not given, 4 around an event)"),
      window: text("<seconds>", `with --around-events: how long before and after its event a sheet covers (${AROUND_EVENT} when not given)`),
      ...EACH_FORMAT, ...JOB,
    },
  },
  events: { does: "Prints the film's timing as its page states it: size, rate, length, beats and events.", options: JOB },
  sound: {
    does: `Places each cue of sound/cues.json on its event and writes the clips into the page's sound block. A cue whose "file" names the starter set, as "sfx:pop/pop-mid-01.wav", gets the job's own copy in sound/ first; a "trim" stated beside the cues moves every level by that many dB.`,
    options: JOB,
  },
  render: {
    does: "Renders the whole film through HyperFrames at the good version, into out/.",
    options: {
      format: text("<name>|all", "the format rendered, or every format of the job (its first when not given)"),
      scale: text("<n>", "a larger master, by a whole multiple of the format's size that reaches 1080p, 1440p or 4K"),
      "4k": flag("a 4K master, by the whole multiple that reaches it; not given together with --scale"),
      alpha: flag("a transparent master, written as .mov"),
      fps: text("<n>", "another frame rate than job.json's; the film's name carries it"),
      ...JOB,
    },
  },
  verify: {
    does: "Measures the file given, or every master of the job's formats in out/, against what the job states; writes out/verify.json.",
    args: "[<file>]", options: JOB,
  },
  "motion-read": {
    does: `Has the film read as motion by a second reader, the Gemini API, against board/board.json: the format's master in out/, or the film given. The reading is written into out/motion-read-<film>.txt; the answer is waited for up to ${ANSWER_MINUTES} minutes. The key is GEMINI_API_KEY or GOOGLE_API_KEY, from the environment or the holding's daemon env file.`,
    args: "[<film>]",
    options: {
      format: text("<name>", "the format whose film is read and whose frame the reader is asked about (a master given by its path: its own; else the job's first)"),
      model: text("<name>", `the model that reads: ${READERS.join(", ")} (the first when not given); each has a day's quota of its own`),
      ...JOB,
    },
  },
  hf: {
    does: "The HyperFrames version guard. status: the good version and npm's latest. update: the latest becomes the good one once it has rendered the guard film and that film has verified.",
    args: "[status|update]", options: { guard: text("<index.html>", "update: another guard page than the skill's own") },
  },
  blender: {
    does: "Runs a scene in Blender, headless and from factory settings, once the graphics card has the free memory the scene needs.",
    args: "<scene.py>",
    options: {
      "need-mb": text("<MB>", `the free memory the scene needs on the graphics card (${BLENDER_NEEDS_MB} when not given)`),
      job: text("<dir>", "the folder the scene is read from and Blender is started in (the current folder when not given)"),
    },
    after: "[-- <arguments for the scene>]",
  },
};

const written = (name, { value }) => `--${name}${value ? ` ${value}` : ""}`;

/** One command as a person types it, on one line. */
function usage(command) {
  const { args, options, after } = TAKES[command];
  return ["mg", command, args, ...Object.entries(options).map(([name, option]) => `[${written(name, option)}]`), after].filter(Boolean).join(" ");
}

/** `mg --help`, and what a call that names no command is told: every command, and where the rest is said. */
const HELP = `${Object.keys(TAKES).map(usage).join("\n")}

mg <command> --help says what that command does, and what each of its options does.
A tool mg starts is given ${TOOL_HOURS} hours to end and is stopped then; DXB_MG_TOOL_TIMEOUT=<seconds> states another limit.`;

/** `mg <command> --help`: the command's usage line, what it does, then one line for each of its options. */
function helpFor(command) {
  const options = Object.entries(TAKES[command].options).map(([name, option]) => [written(name, option), option.says]);
  const width = Math.max(...options.map(([name]) => name.length));
  return [usage(command), `  ${TAKES[command].does}`, ...options.map(([name, says]) => `  ${name.padEnd(width)}  ${says}`)].join("\n");
}

/** Whether help is asked for among the arguments given to mg or to a command — what follows "--" belongs to whatever the command starts. */
function asksForHelp(argv) {
  const own = argv.includes("--") ? argv.slice(0, argv.indexOf("--")) : argv;
  return own.includes("--help") || own.includes("-h");
}

function toolSeconds() {
  const stated = process.env.DXB_MG_TOOL_TIMEOUT;
  if (stated === undefined) return TOOL_HOURS * 3600;
  if (!(Number(stated) > 0)) throw new Refusal(`DXB_MG_TOOL_TIMEOUT takes a number of seconds, not "${stated}"`);
  return Number(stated);
}

/**
 * Starts one process and waits for it. `out` is text, or bytes when `binary` is asked for.
 * A process that has not ended at the time limit is stopped, and that is a Refusal.
 * @param {string} cmd
 * @param {string[]} args
 * @param {{ cwd?: string, env?: Record<string, string>, binary?: boolean }} [options]
 * @returns {{ code: number, out: string | Buffer, err: string }}
 */
export function run(cmd, args, { cwd, env, binary = false } = {}) {
  const limit = toolSeconds();
  const r = spawnSync(cmd, args, { cwd, env: { ...process.env, ...env }, encoding: "buffer", maxBuffer: 1 << 30, timeout: limit * 1000 });
  if (r.error?.code === "ETIMEDOUT") throw new Refusal(`${cmd} did not end within ${limit} s and was stopped. A tool that needs longer is given it with DXB_MG_TOOL_TIMEOUT=<seconds>`);
  if (r.error) return { code: -1, out: binary ? Buffer.alloc(0) : "", err: r.error.message };
  return { code: r.status ?? -1, out: binary ? r.stdout : r.stdout.toString(), err: r.stderr.toString() };
}

/** The options and arguments given to a command, read as TAKES states them; an option the command does not have is refused. */
function parse(command, argv) {
  try {
    return parseArgs({ args: argv, options: TAKES[command].options, allowPositionals: true, strict: true });
  } catch (e) {
    throw new Refusal(e.message);
  }
}

/** The same, for a command that works on a job: the folder --job names, or the current one. */
function parseForJob(command, argv) {
  const parsed = parse(command, argv);
  return { ...parsed, job: openJob(parsed.values.job ?? ".") };
}

/** The single format a command that works on one film at a time was asked for: "all" is refused, in the command's own words. */
function oneFormat(job, name, whyOne) {
  if (name === "all") throw new Refusal(whyOne);
  return formatsNamed(job, name)[0];
}

function wholeNumber(given, fallback, option) {
  if (given === undefined) return fallback;
  if (!/^\d+$/.test(given) || Number(given) < 1) throw new Refusal(`${option} takes a whole number, 1 or more`);
  return Number(given);
}

/** One more format as `mg init --format` states it: <name>=<width>x<height>. */
function formatStated(stated) {
  const [, name, w, h] = stated.match(/^([^=]+)=(\d+)x(\d+)$/) ?? [];
  if (!name) throw new Refusal(`--format takes <name>=<width>x<height>, such as 9x16=1080x1920, not "${stated}"`);
  return { name, w: Number(w), h: Number(h) };
}

function init({ say }, argv) {
  // A loudness target is below zero, and parseArgs reads "--lufs -16" as two options: the figure is joined to its flag first.
  const lufsAt = argv.indexOf("--lufs"), joined = lufsAt < 0 || lufsAt + 1 === argv.length ? argv : argv.toSpliced(lufsAt, 2, `--lufs=${argv[lufsAt + 1]}`);
  const { values, positionals: [dir] } = parse("init", joined);
  if (!dir) throw new Refusal("which folder? mg init <dir>");
  const dur = Number(values.dur ?? 12);
  if (!(dur > 0)) throw new Refusal("--dur takes the film's length in seconds");
  if (values.lufs !== undefined && !/^-?\d+(\.\d+)?$/.test(values.lufs)) throw new Refusal(`--lufs takes the loudness target as a number, such as -16, not "${values.lufs}"`);
  const first = formatBySize(wholeNumber(values.w, 1920, "--w"), wholeNumber(values.h, 1080, "--h")), fps = wholeNumber(values.fps, 30, "--fps");
  // What is not given stays undefined here: layOutJob states it — no target, no spec piece, no brand.
  const stated = {
    title: values.title ?? basename(resolve(dir)), formats: [first, ...(values.format ?? []).map(formatStated)], fps,
    lufs: values.lufs && Number(values.lufs), spec: values.spec, brand: values.brand,
  };
  const job = layOutJob(dir, stated, sizePage(readFileSync(join(TEMPLATES, "page.html"), "utf8"), { ...first, fps, dur }));

  // The starter board tells the starter film; its template names each shot's ends by the page's beats.
  const film = readFilm(job.page), [format] = job.formats, starter = readJson(join(TEMPLATES, "board.json"));
  const second = (beat) => +(beat === "end" ? film.TOTAL : film.BEATS[beat]).toFixed(2);
  writeJson(insideJob(job.dir, "board/board.json"), {
    ...starter, title: job.title, format: formatLine(job, format), total: film.TOTAL,
    shots: starter.shots.map((shot) => ({ ...shot, from: second(shot.from), to: second(shot.to) })),
  });
  writeBoardPage(job);
  say(`mg init: ${job.dir} — ${job.formats.map((f) => `${f.name} ${f.w}×${f.h}`).join(", ")}, ${job.fps} fps, ${film.TOTAL} s. Real material into assets/ and refs/, the storyboard into board/board.json, then: mg board`);
}

function board(tools, argv) {
  const { job, values } = parseForJob("board", argv);
  for (const format of formatsNamed(job, values.format)) {
    const drawn = drawBoard(tools, job, format);
    tools.say(`mg board: ${drawn.png} — ${drawn.shots} shot(s), ${drawn.why ? `without the film's frames: ${drawn.why}` : `${drawn.framed} with the film's frame`}`);
  }
  tools.say("Nothing is animated before the board is approved.");
}

function stills(tools, argv) {
  const { job, values, positionals } = parseForJob("stills", argv);
  const times = positionals.map(Number);
  if (!times.length || times.some(Number.isNaN)) throw new Refusal("which moments? mg stills <seconds…>, such as: mg stills 0.5 2 3.25");
  const files = takeStills(tools, job, oneFormat(job, values.format, "stills are taken of one format at a time"), times);
  tools.say(`mg stills: ${files.length} still(s)\n${files.join("\n")}`);
}

function sheet(tools, argv) {
  const { job, values } = parseForJob("sheet", argv);
  const aroundEvents = values["around-events"] ?? false, window = Number(values.window ?? AROUND_EVENT);
  if (values.window !== undefined && !aroundEvents) throw new Refusal("--window is the time around an event: it is given with --around-events");
  if (!(window > 0)) throw new Refusal(`--window takes the seconds a sheet covers each side of its event, more than 0, not "${values.window}"`);
  const asked = { aroundEvents, count: wholeNumber(values.n, aroundEvents ? 4 : 9, "--n"), window };
  const files = formatsNamed(job, values.format).flatMap((format) => makeSheets(tools, job, format, asked));
  tools.say(`mg sheet: ${files.length} sheet(s)\n${files.join("\n")}`);
}

function events({ say }, argv) {
  say(JSON.stringify(readFilm(parseForJob("events", argv).job.page), null, 2));
}

function sound({ run, say }, argv) {
  const { job } = parseForJob("sound", argv);
  bringStarterSounds(job);
  const plan = planCues(run, job, readFilm(job.page));
  writeSoundBlock(job, plan);
  for (const c of plan)
    say(`cue ${c.n}  ${c.file}  its ${c.align} (${c.point.toFixed(3)} s into the file) on ${c.event ?? "the second"} ${c.on.toFixed(3)} s — the clip starts at ${c.start.toFixed(3)} s${c.mediaStart ? `, its first ${c.mediaStart.toFixed(3)} s trimmed` : ""}, ${c.db} dB${c.trim ? ` (the set's trim of ${c.trim > 0 ? "+" : ""}${c.trim} dB in it)` : ""}`);
  say(`mg sound: ${plan.length} cue(s) written into page/index.html`);
}

function render(tools, argv) {
  const partial = argv.find((arg) => /^--(start|end)(=|$)/.test(arg));
  if (partial) throw new Refusal(`${partial.split("=")[0]} is refused: a partial render makes HyperFrames fall back to software WebGL without saying so (measured 2026-11-12). A film is rendered whole.`);
  const { job, values } = parseForJob("render", argv);
  if (values.scale && values["4k"]) throw new Refusal("--scale and --4k name the same thing; give one");
  for (const format of formatsNamed(job, values.format)) {
    const master = { format, scale: scaleFor(format, { scale: wholeNumber(values.scale, 1, "--scale"), fourK: values["4k"] ?? false }), fps: wholeNumber(values.fps, job.fps, "--fps"), alpha: values.alpha ?? false };
    const made = renderFilm(tools, job, master);
    tools.say(`mg render: ${made.file} — ${format.w * master.scale}×${format.h * master.scale}, ${master.fps} fps${master.alpha ? ", transparent" : ""}${made.gl.length ? `, GL ${made.gl.join(" | ")}` : ""}. Measure it: mg verify`);
  }
}

function verify({ run, say }, argv) {
  const { job, positionals } = parseForJob("verify", argv);
  const verdict = verifyFilms(run, job, positionals.map((file) => resolve(file)));
  for (const film of verdict.films) {
    const stated = film.loudness === null ? "no sound" : `loudness ${film.loudness.toFixed(1)} LUFS${job.lufs === null ? " (not judged: job.json states no target)" : ` against ${job.lufs}`}`;
    say(`${film.ok ? "OK    " : "FAILED"}  ${film.file} — ${stated}; ${film.cues.filter((c) => c.ok).length}/${film.cues.length} cue(s) on their events`);
    for (const failure of failures(film)) say(`        ${failure}`);
  }
  say(`UNVERIFIED — only an eye or an ear can settle:\n${verdict.unverified.map((line) => `  - ${line}`).join("\n")}`);
  const failed = verdict.films.filter((film) => !film.ok).length;
  if (failed) throw new Refusal(`${failed} of ${verdict.films.length} film(s) are not what the job states; see out/verify.json`);
  say(`mg verify: OK — ${verdict.films.length} film(s) are what the job states; out/verify.json`);
}

async function motionRead(tools, argv) {
  const { job, values, positionals: [given] } = parseForJob("motion-read", argv);
  const model = values.model ?? READERS[0];
  // The model's name becomes part of the address asked.
  if (!/^[\w.-]+$/.test(model)) throw new Refusal(`--model takes a model's name, such as ${READERS[0]}, not "${model}"`);
  // A master of the job given by its path is read as the format its name states, unless another is named.
  const ownFormat = given && values.format === undefined ? masterOf(job, basename(given))?.format : undefined;
  const format = ownFormat ?? oneFormat(job, values.format, "a film is read one format at a time");
  const film = given ? resolve(given) : join(job.dir, "out", filmName(job, { format, scale: 1, fps: job.fps, alpha: false }));
  if (!existsSync(film)) throw new Refusal(`${film} is not there${given ? "" : " — render the film first (mg render), or name the film to read: mg motion-read <film>"}`);
  const read = await readMotion(tools, job, { film, format, model });
  tools.say(`mg motion-read: ${read.report} — ${read.characters} characters, read by ${model} against board/board.json`);
}

function versionGuard({ run, say }, argv) {
  const { values, positionals: [action = "status"] } = parse("hf", argv);
  const good = goodVersion(), latest = latestVersion(run);
  if (action === "status") return say(`mg hf: good ${good} · latest ${latest ?? "unknown (npm did not answer)"}${latest && latest !== good ? " — try it: mg hf update" : ""}`);
  if (action !== "update") throw new Refusal("mg hf status | mg hf update [--guard <index.html>]");
  if (!latest) throw new Refusal(`npm did not name a latest version; good stays ${good}`);
  if (latest === good) return say(`mg hf update: good ${good} is npm's latest — nothing to try`);
  try {
    const film = proveVersion(run, latest, values.guard ?? join(TEMPLATES, "guard/index.html"));
    say(`mg hf update: good ${latest} (was ${good}) — it rendered the guard film and the film verified: ${film}`);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    throw new Refusal(`hyperframes@${latest} did not pass the guard film; good stays ${good}\n${e.message}`);
  }
}

function blender({ run, say }, argv) {
  const cut = argv.indexOf("--"), sceneArgs = cut < 0 ? [] : argv.slice(cut + 1);
  const { values, positionals: [scene] } = parse("blender", cut < 0 ? argv : argv.slice(0, cut));
  const cwd = resolve(values.job ?? "."), need = wholeNumber(values["need-mb"], BLENDER_NEEDS_MB, "--need-mb");
  if (!scene || !existsSync(resolve(cwd, scene))) throw new Refusal(`which scene? mg blender <scene.py>${scene ? ` — ${scene} is not there` : ""}`);

  const card = run("nvidia-smi", ["--query-gpu=memory.free", "--format=csv,noheader,nounits"]);
  const free = Number(String(card.out).trim().split("\n")[0] || NaN);
  if (card.code !== 0 || Number.isNaN(free)) throw new Refusal("the graphics card's free memory could not be read (nvidia-smi); Blender was not started");
  if (free < need) throw new Refusal(`the graphics card has ${free} MB free and the scene needs ${need} MB; Blender was not started. Free the card, or state a smaller need with --need-mb`);

  const ran = run("blender", ["-b", "--factory-startup", "--python", resolve(cwd, scene), "--", ...sceneArgs], { cwd });
  const said = String(ran.out) + String(ran.err);
  // Blender exits 0 after a script error unless told otherwise, so the traceback itself is the failure.
  if (ran.code !== 0 || /Traceback \(most recent call last\)/.test(said)) throw new Refusal(`the scene did not run through (exit ${ran.code}):\n${lastLines(said)}`);
  // Blender names each file it renders ("… | Saved: '<path>'"); the kit names the ones it writes itself ("kit: saved <path>").
  const frames = [...new Set([...said.matchAll(/Saved: '(.+)'|^kit: saved (.+)$/gm)].map((line) => line[1] ?? line[2]))];
  say(`mg blender: ${frames.length} frame(s) written (${free} MB were free)${frames.map((frame) => `\n${frame}`).join("")}`);
}

const COMMANDS = { init, board, stills, sheet, events, sound, render, verify, "motion-read": motionRead, hf: versionGuard, blender };

/**
 * Runs one mg command. Returns { code, out }: 0 and what it printed, or non-zero and why it stopped.
 * `run` starts every process (a test may record or answer the calls); `say` hears each line as it is printed.
 * `http` sends every request that leaves the machine and `wait` passes the seconds between two of them
 * (a test answers for the network and waits for nothing).
 * @param {string[]} argv
 * @param {{ run?: typeof run, say?: (line: string) => void, http?: typeof request, wait?: (seconds: number) => Promise<void> }} [options]
 * @returns {Promise<{ code: number, out: string }>}
 */
export async function mg(argv, { run: starts = run, say: hears = () => {}, http = request, wait = (seconds) => new Promise((over) => setTimeout(over, seconds * 1000)) } = {}) {
  const [name, ...rest] = argv, lines = [];
  const say = (line) => { lines.push(line); hears(line); };
  const tools = { run: starts, say, http, wait, hf: (job, args) => hyperframes(starts, job, goodVersion(), args) };
  let code = 0;
  try {
    if (name === "help" || asksForHelp([name])) say(HELP);
    else if (!COMMANDS[name]) throw new Refusal(`${name ? `there is no command "${name}"` : "which command?"}\n${HELP}`);
    else if (asksForHelp(rest)) say(helpFor(name));
    else await COMMANDS[name](tools, rest);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    say(`mg${name in COMMANDS ? ` ${name}` : ""}: FAILED — ${e.message}`);
    code = 1;
  }
  return { code, out: lines.join("\n") + "\n" };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { code } = await mg(process.argv.slice(2), { say: (line) => console.log(line) });
  process.exit(code);
}
