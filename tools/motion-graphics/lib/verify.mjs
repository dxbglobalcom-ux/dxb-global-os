// dxb-motion-graphics — the finished film, measured. Every figure is read from the file itself
// (ffprobe, its decoded sound) and held to what the page's FILM and job.json state. What no terminal
// can settle is listed apart, for an eye or an ear.
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { basename, join } from "node:path";
import { Refusal, insideJob, masterOf, readFilm, writeJson } from "./job.mjs";
import { filmSound, hearCues, loudness, planCues } from "./sound.mjs";

const LOUDNESS_TOLERANCE = 1; // LU either side of job.json's target
const UNVERIFIED = [
  "Every shot becomes the next: no cut, no cross dissolve — look at out/sheets (mg sheet --around-events).",
  "Real material is shown as it is: the logo's own shapes and colours, real screens and products, the job's own typeface.",
  "Each sound suits the motion it sits on, and the mix sounds right — verify only places and measures it.",
  "The film reads as filmed, not generated.",
];

function probe(run, file) {
  const r = run("ffprobe", ["-v", "error", "-count_frames", "-show_entries",
    "stream=codec_type,width,height,r_frame_rate,nb_read_frames,pix_fmt:format=duration", "-of", "json", file]);
  if (r.code !== 0) throw new Refusal(`ffprobe cannot read ${file}: ${r.err.trim()}`);
  const read = JSON.parse(r.out), video = read.streams.find((s) => s.codec_type === "video");
  if (!video) throw new Refusal(`${file} carries no picture`);
  const [frames, per] = video.r_frame_rate.split("/").map(Number);
  return { w: video.width, h: video.height, fps: frames / per, frames: Number(video.nb_read_frames), duration: Number(read.format.duration), pixelFormat: video.pix_fmt };
}

/**
 * A film's alpha channel over all its frames as [lowest, highest], 0 clear to 255 opaque; null when its
 * picture carries none. The plane is handed to signalstats as full-range luma (gray, then yuvj444p):
 * left to itself ffmpeg squeezes it into video range on the way, and clear reads 16 (measured 2026-11-12).
 */
function alphaRange(run, file) {
  const extremes = ["YMIN", "YMAX"].map((key) => `metadata=mode=print:key=lavfi.signalstats.${key}:file=-`).join(",");
  const r = run("ffmpeg", ["-v", "error", "-i", file, "-an", "-vf", `alphaextract,format=gray,format=yuvj444p,signalstats,${extremes}`, "-f", "null", "-"]);
  const values = (key) => [...String(r.out).matchAll(new RegExp(`${key}=(\\d+)`, "g"))].map((found) => Number(found[1]));
  const lowest = values("YMIN"), highest = values("YMAX");
  return r.code === 0 && lowest.length ? [Math.min(...lowest), Math.max(...highest)] : null;
}

const check = (name, stated, measured, ok = stated === measured) => ({ name, stated, measured, ok });

/** A transparent master is one only when its picture carries an alpha channel that is not one value throughout — an opaque picture is not. */
function alphaCheck(run, file, pixelFormat) {
  const alpha = alphaRange(run, file), varies = alpha !== null && alpha[0] < alpha[1];
  const measured = alpha === null ? `no alpha channel (${pixelFormat})` : varies ? `${alpha[0]} to ${alpha[1]}` : `${alpha[0]} everywhere`;
  return check("alpha", "a transparent master: an alpha channel that varies", measured, varies);
}

function verifyFilm(run, job, film, plan, file) {
  const name = basename(file), master = masterOf(job, name);
  if (!master) return { file, ok: false, checks: [check("name", "a master of this job: <title>-<format>[-<n>x][-<n>fps].mp4|mov", name, false)], loudness: null, cues: [] };
  const seen = probe(run, file), sound = filmSound(run, file), frame = 1 / master.fps;
  const checks = [
    check("duration", film.TOTAL, seen.duration, Math.abs(seen.duration - film.TOTAL) <= frame),
    check("frames", Math.round(film.TOTAL * master.fps), seen.frames),
    check("size", `${master.format.w * master.scale}×${master.format.h * master.scale}`, `${seen.w}×${seen.h}`),
    check("fps", master.fps, seen.fps),
  ];
  if (master.alpha) checks.push(alphaCheck(run, file, seen.pixelFormat));
  if (plan.length && !sound) checks.push(check("sound", `${plan.length} cue(s) declared in sound/cues.json`, "silent", false));
  const measured = sound ? loudness(run, file) : null;
  if (job.lufs !== null) checks.push(check("loudness", job.lufs, measured, measured !== null && Math.abs(measured - job.lufs) <= LOUDNESS_TOLERANCE));
  const cues = !sound ? [] : hearCues(run, job, plan, sound, frame).map((heard, i) => {
    const cue = plan[i];
    return { n: cue.n, file: cue.file, align: cue.align, event: cue.event, planned: cue.on, ...heard, ok: heard.heard && Math.abs(heard.measured - cue.on) <= frame };
  });
  return { file, ok: checks.every((c) => c.ok) && cues.every((c) => c.ok), checks, loudness: measured, cues };
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

/**
 * Verifies the films at the paths given — each is the file judged, wherever it stands — or, given none,
 * every master of the job's formats in out/; writes out/verify.json.
 */
export function verifyFilms(run, job, files) {
  const out = insideJob(job.dir, "out"), record = insideJob(job.dir, "out/verify.json");
  rmSync(record, { force: true }); // a run that stops early leaves no older verdict standing
  const films = files.length ? files : existsSync(out) ? readdirSync(out).filter((name) => masterOf(job, name)).sort().map((name) => join(out, name)) : [];
  if (!films.length) throw new Refusal("no film of this job's formats in out/ — render one first (mg render)");
  const absent = films.find((file) => !existsSync(file));
  if (absent) throw new Refusal(`${absent} is not there`);
  const film = readFilm(job.page), plan = planCues(run, job, film);
  const verified = films.map((file) => verifyFilm(run, job, film, plan, file));
  const verdict = { ok: verified.every((f) => f.ok), films: verified, unverified: UNVERIFIED };
  mkdirSync(out, { recursive: true });
  writeJson(record, verdict);
  return verdict;
}
