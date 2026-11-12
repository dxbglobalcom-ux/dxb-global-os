// dxb-motion-graphics — the finished film, measured. Every figure is read from the file itself
// (ffprobe, its decoded sound) and held to what the page's FILM and job.json state. What no terminal
// can settle is listed apart, for an eye or an ear.
import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Refusal, masterOf, readFilm, writeJson } from "./job.mjs";
import { filmSound, hearCue, loudness, planCues } from "./sound.mjs";

const LOUDNESS_TOLERANCE = 1; // LU either side of job.json's target
const UNVERIFIED = [
  "Every shot becomes the next: no cut, no cross dissolve, no frame standing still — look at out/sheets (mg sheet --around-events).",
  "Real material is shown as it is: the logo's own shapes and colours, real screens and products, the job's own typeface.",
  "Each sound suits the motion it sits on, and the mix sounds right — verify only places and measures it.",
  "The film reads as filmed, not generated.",
];

function probe(run, file) {
  const r = run("ffprobe", ["-v", "error", "-count_frames", "-show_entries",
    "stream=codec_type,width,height,r_frame_rate,nb_read_frames:format=duration", "-of", "json", file]);
  if (r.code !== 0) throw new Refusal(`ffprobe cannot read ${file}: ${r.err.trim()}`);
  const read = JSON.parse(r.out), video = read.streams.find((s) => s.codec_type === "video");
  if (!video) throw new Refusal(`${file} carries no picture`);
  const [frames, per] = video.r_frame_rate.split("/").map(Number);
  return { w: video.width, h: video.height, fps: frames / per, frames: Number(video.nb_read_frames), duration: Number(read.format.duration) };
}

const check = (name, stated, measured, ok = stated === measured) => ({ name, stated, measured, ok });

function verifyFilm(run, job, film, plan, name) {
  const file = join(job.dir, "out", name), master = masterOf(job, name);
  if (!master) return { file: name, ok: false, checks: [check("name", "a master of this job: <title>-<format>[-<n>x][-<n>fps].mp4|mov", name, false)], loudness: null, cues: [] };
  const seen = probe(run, file), sound = filmSound(run, file), frame = 1 / master.fps;
  const checks = [
    check("duration", film.TOTAL, seen.duration, Math.abs(seen.duration - film.TOTAL) <= frame),
    check("frames", Math.round(film.TOTAL * master.fps), seen.frames),
    check("size", `${master.format.w * master.scale}×${master.format.h * master.scale}`, `${seen.w}×${seen.h}`),
    check("fps", master.fps, seen.fps),
  ];
  if (plan.length && !sound) checks.push(check("sound", `${plan.length} cue(s) declared in sound/cues.json`, "silent", false));
  const measured = sound ? loudness(run, file) : null;
  if (job.lufs !== null) checks.push(check("loudness", job.lufs, measured, measured !== null && Math.abs(measured - job.lufs) <= LOUDNESS_TOLERANCE));
  const cues = !sound ? [] : plan.map((cue) => {
    const heard = hearCue(run, job, cue, sound);
    return { n: cue.n, file: cue.file, align: cue.align, event: cue.event, planned: cue.on, ...heard, ok: heard.heard && Math.abs(heard.measured - cue.on) <= frame };
  });
  return { file: name, ok: checks.every((c) => c.ok) && cues.every((c) => c.ok), checks, loudness: measured, cues };
}

/** What is wrong with one verified film, one line each; empty when it passed. */
export function failures(film) {
  return [
    ...film.checks.filter((c) => !c.ok).map((c) => `${c.name}: ${c.measured} where the job states ${c.stated}`),
    ...film.cues.filter((c) => !c.ok).map((c) => c.heard
      ? `cue ${c.n} (${c.file}): its ${c.align} is at ${c.measured.toFixed(3)} s where the plan puts it on ${c.planned.toFixed(3)} s`
      : `cue ${c.n} (${c.file}): not heard at its place — render again after mg sound`),
  ];
}

/** Verifies the named films of out/ (all of them when none is named) and writes out/verify.json. */
export function verifyFilms(run, job, names) {
  const out = join(job.dir, "out");
  rmSync(join(out, "verify.json"), { force: true }); // a run that stops early leaves no older verdict standing
  const films = names.length ? names : existsSync(out) ? readdirSync(out).filter((f) => /\.(mp4|mov)$/.test(f)).sort() : [];
  if (!films.length) throw new Refusal("no film in out/ — render one first (mg render)");
  const absent = films.find((f) => !existsSync(join(out, f)));
  if (absent) throw new Refusal(`out/${absent} is not there`);
  const film = readFilm(job.page), plan = planCues(run, job, film);
  const verified = films.map((name) => verifyFilm(run, job, film, plan, name));
  const verdict = { ok: verified.every((f) => f.ok), films: verified, unverified: UNVERIFIED };
  writeJson(join(out, "verify.json"), verdict);
  return verdict;
}
