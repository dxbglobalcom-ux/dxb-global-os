#!/usr/bin/env node
// mg — the one command of dxb-motion-graphics (B43, CEO 2026-11-12). A film is a job folder: real
// material, a storyboard approved before anything moves, one page whose picture is a pure function
// of time, sound laid on its events last. mg lays the folder out, shows the film at exact times,
// renders it whole through HyperFrames at the guarded version, and measures the finished file.
// Every command prints one decisive line and exits non-zero on failure. No packages used: it starts
// npx hyperframes, ffmpeg, ffprobe, blender, nvidia-smi and the system Chrome, each through `run`.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { drawBoard, writeBoardPage } from "./lib/board.mjs";
import { goodVersion, hyperframes, latestVersion, proveVersion } from "./lib/hyperframes.mjs";
import { Refusal, TEMPLATES, formatsNamed, layOutJob, openJob, readFilm, readJson, sizePage, writeJson } from "./lib/job.mjs";
import { lastLines, makeSheets, renderFilm, scaleFor, takeStills } from "./lib/picture.mjs";
import { planCues, writeSoundBlock } from "./lib/sound.mjs";
import { failures, verifyFilms } from "./lib/verify.mjs";

const USAGE = `mg init <dir> [--title "…"] [--w 1920] [--h 1080] [--fps 30] [--dur 12]
mg board [--job <dir>]
mg stills <seconds…> [--format <name>] [--job <dir>]
mg sheet [--around-events] [--n <count>] [--format <name>] [--job <dir>]
mg events [--job <dir>]
mg sound [--job <dir>]
mg render [--format <name>|all] [--scale <n> | --4k] [--alpha] [--fps <n>] [--job <dir>]
mg verify [<file>] [--job <dir>]
mg hf status | mg hf update [--guard <index.html>]
mg blender <scene.py> [--need-mb 4000] [--job <dir>] [-- <arguments for the scene>]`;

const BLENDER_NEEDS_MB = 4000;

/**
 * Starts one process and waits for it. `out` is text, or bytes when `binary` is asked for.
 * @param {string} cmd
 * @param {string[]} args
 * @param {{ cwd?: string, env?: Record<string, string>, binary?: boolean }} [options]
 * @returns {{ code: number, out: string | Buffer, err: string }}
 */
export function run(cmd, args, { cwd, env, binary = false } = {}) {
  const r = spawnSync(cmd, args, { cwd, env: { ...process.env, ...env }, encoding: "buffer", maxBuffer: 1 << 30 });
  if (r.error) return { code: -1, out: binary ? Buffer.alloc(0) : "", err: r.error.message };
  return { code: r.status ?? -1, out: binary ? r.stdout : r.stdout.toString(), err: r.stderr.toString() };
}

const text = { type: "string" }, flag = { type: "boolean" };

/** A command's own options and arguments; an option it does not have is refused. Every command takes --job. */
function parse(argv, options = {}) {
  try {
    return parseArgs({ args: argv, options: { job: text, ...options }, allowPositionals: true, strict: true });
  } catch (e) {
    throw new Refusal(e.message);
  }
}

/** The same, for a command that works on a job: the folder --job names, or the current one. */
function parseForJob(argv, options) {
  const parsed = parse(argv, options);
  return { ...parsed, job: openJob(parsed.values.job ?? ".") };
}

function wholeNumber(given, fallback, option) {
  if (given === undefined) return fallback;
  if (!/^\d+$/.test(given) || Number(given) < 1) throw new Refusal(`${option} takes a whole number, 1 or more`);
  return Number(given);
}

function init({ say }, argv) {
  const { values, positionals: [dir] } = parse(argv, { title: text, w: text, h: text, fps: text, dur: text });
  if (!dir) throw new Refusal("which folder? mg init <dir>");
  const dur = Number(values.dur ?? 12);
  if (!(dur > 0)) throw new Refusal("--dur takes the film's length in seconds");
  const size = { title: values.title ?? basename(resolve(dir)), w: wholeNumber(values.w, 1920, "--w"), h: wholeNumber(values.h, 1080, "--h"), fps: wholeNumber(values.fps, 30, "--fps") };
  const job = layOutJob(dir, size, sizePage(readFileSync(join(TEMPLATES, "page.html"), "utf8"), { ...size, dur }));

  // The starter board tells the starter film; its template names each shot's ends by the page's beats.
  const film = readFilm(job.page), [format] = job.formats, starter = readJson(join(TEMPLATES, "board.json"));
  const second = (beat) => +(beat === "end" ? film.TOTAL : film.BEATS[beat]).toFixed(2);
  writeJson(join(job.dir, "board/board.json"), {
    ...starter, title: job.title, format: `${format.name} · ${format.w}×${format.h} · ${job.fps} fps`, total: film.TOTAL,
    shots: starter.shots.map((shot) => ({ ...shot, from: second(shot.from), to: second(shot.to) })),
  });
  writeBoardPage(job);
  say(`mg init: ${job.dir} — ${format.name}, ${format.w}×${format.h}, ${job.fps} fps, ${film.TOTAL} s. Real material into assets/ and refs/, the storyboard into board/board.json, then: mg board`);
}

function board({ run, say }, argv) {
  const drawn = drawBoard(run, parseForJob(argv).job);
  say(`mg board: ${drawn.png} — ${drawn.shots} shot(s). Nothing is animated before it is approved.`);
}

function stills(tools, argv) {
  const { job, values, positionals } = parseForJob(argv, { format: text });
  const times = positionals.map(Number);
  if (!times.length || times.some(Number.isNaN)) throw new Refusal("which moments? mg stills <seconds…>, such as: mg stills 0.5 2 3.25");
  if (values.format === "all") throw new Refusal("stills are taken of one format at a time");
  const files = takeStills(tools, job, formatsNamed(job, values.format)[0], times);
  tools.say(`mg stills: ${files.length} still(s)\n${files.join("\n")}`);
}

function sheet(tools, argv) {
  const { job, values } = parseForJob(argv, { format: text, "around-events": flag, n: text });
  const aroundEvents = values["around-events"] ?? false;
  if (values.format === "all") throw new Refusal("sheets are made of one format at a time");
  const files = makeSheets(tools, job, formatsNamed(job, values.format)[0], { aroundEvents, count: wholeNumber(values.n, aroundEvents ? 4 : 9, "--n") });
  tools.say(`mg sheet: ${files.length} sheet(s)\n${files.join("\n")}`);
}

function events({ say }, argv) {
  say(JSON.stringify(readFilm(parseForJob(argv).job.page), null, 2));
}

function sound({ run, say }, argv) {
  const { job } = parseForJob(argv);
  const plan = planCues(run, job, readFilm(job.page));
  writeSoundBlock(job, plan);
  for (const c of plan)
    say(`cue ${c.n}  ${c.file}  its ${c.align} (${c.point.toFixed(3)} s into the file) on ${c.event ?? "the second"} ${c.on.toFixed(3)} s — the clip starts at ${c.start.toFixed(3)} s${c.mediaStart ? `, its first ${c.mediaStart.toFixed(3)} s trimmed` : ""}, ${c.db} dB`);
  say(`mg sound: ${plan.length} cue(s) written into page/index.html`);
}

function render(tools, argv) {
  const partial = argv.find((arg) => /^--(start|end)(=|$)/.test(arg));
  if (partial) throw new Refusal(`${partial.split("=")[0]} is refused: a partial render makes HyperFrames fall back to software WebGL without saying so (measured 2026-11-12). A film is rendered whole.`);
  const { job, values } = parseForJob(argv, { format: text, scale: text, "4k": flag, alpha: flag, fps: text });
  if (values.scale && values["4k"]) throw new Refusal("--scale and --4k name the same thing; give one");
  for (const format of formatsNamed(job, values.format)) {
    const master = { format, scale: scaleFor(format, { scale: wholeNumber(values.scale, 1, "--scale"), fourK: values["4k"] ?? false }), fps: wholeNumber(values.fps, job.fps, "--fps"), alpha: values.alpha ?? false };
    const made = renderFilm(tools, job, master);
    tools.say(`mg render: ${made.file} — ${format.w * master.scale}×${format.h * master.scale}, ${master.fps} fps${master.alpha ? ", transparent" : ""}${made.gl.length ? `, GL ${made.gl.join(" | ")}` : ""}. Measure it: mg verify`);
  }
}

function verify({ run, say }, argv) {
  const { job, positionals } = parseForJob(argv);
  const verdict = verifyFilms(run, job, positionals.map((file) => basename(file)));
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

function versionGuard({ run, say }, argv) {
  const { values, positionals: [action = "status"] } = parse(argv, { guard: text });
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
  const { values, positionals: [scene] } = parse(cut < 0 ? argv : argv.slice(0, cut), { "need-mb": text });
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

const COMMANDS = { init, board, stills, sheet, events, sound, render, verify, hf: versionGuard, blender };

/**
 * Runs one mg command. Returns { code, out }: 0 and what it printed, or non-zero and why it stopped.
 * `run` starts every process (a test may record or answer the calls); `say` hears each line as it is printed.
 * @param {string[]} argv
 * @param {{ run?: typeof run, say?: (line: string) => void }} [options]
 * @returns {Promise<{ code: number, out: string }>}
 */
export async function mg(argv, { run: starts = run, say: hears = () => {} } = {}) {
  const [name, ...rest] = argv, lines = [];
  const say = (line) => { lines.push(line); hears(line); };
  const tools = { run: starts, say, hf: (job, args) => hyperframes(starts, job, goodVersion(), args) };
  let code = 0;
  try {
    if (!COMMANDS[name]) throw new Refusal(`${name ? `there is no command "${name}"` : "which command?"}\n${USAGE}`);
    COMMANDS[name](tools, rest);
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
