// dxb-motion-graphics — sound on its event. A cue names an event (or a second) and which point of
// the SOUND sits on it: its start, its peak or its end. The plan made here is what `mg sound` writes
// into the page and what `mg verify` holds the rendered film to, by listening to the film itself.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Refusal, readJson, replaceBlock } from "./job.mjs";

const FINE = 48000;   // samples per second when a point is looked for in a sound file
const COARSE = 16000; // samples per second when a film is listened to: 16 samples to the millisecond
const AUDIBLE = 10 ** (-50 / 20); // a sound starts and ends where it crosses −50 dBFS
const SILENT = 10 ** (-60 / 20);  // a film that never rises above −60 dBFS carries no sound
const ENVELOPE = 0.005; // seconds: the peak is the centre of the loudest stretch of this length
const SEARCH = 0.25;    // seconds each side of the planned place in which a cue is looked for
const HEARD = 0.25;     // a cue below a quarter of its planned level at its best place is not there
const BOOST_LIMIT = 12; // dB: HyperFrames' data-volume goes no higher
const toMillisecond = (seconds) => +seconds.toFixed(3); // the precision a clip is written and planned at

/**
 * Mono samples of a file's sound at `rate`; empty when it carries none. The channels are averaged
 * (-rematrix_maxval 1): left alone, ffmpeg sums a stereo pair into float samples 3 dB hot, and a mono
 * sound file and the stereo film it was mixed into would no longer be at one level (measured 2026-11-12).
 */
function decode(run, file, rate) {
  const r = run("ffmpeg", ["-v", "error", "-i", file, "-vn", "-ac", "1", "-rematrix_maxval", "1.0", "-ar", String(rate), "-f", "f32le", "-"], { binary: true });
  if (r.code !== 0 || !r.out.length) return new Float32Array(0);
  const bytes = Buffer.from(r.out);
  return new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + (bytes.length & ~3)));
}

/** Where a sound starts, peaks and ends, in seconds into its file; null when nothing in it is audible. */
function soundPoints(x, rate) {
  let first = -1, last = -1;
  for (let i = 0; i < x.length; i++) {
    if (Math.abs(x[i]) <= AUDIBLE) continue;
    if (first < 0) first = i;
    last = i;
  }
  if (first < 0) return null;
  const span = Math.min(x.length, Math.round(rate * ENVELOPE));
  let energy = 0, loudest = -1, centre = 0;
  for (let i = 0; i < x.length; i++) {
    energy += x[i] * x[i] - (i >= span ? x[i - span] * x[i - span] : 0);
    if (i >= span - 1 && energy > loudest) [loudest, centre] = [energy, i - (span - 1) / 2];
  }
  return { start: first / rate, peak: centre / rate, end: last / rate, length: x.length / rate };
}

function planCue(run, job, film, cue, n) {
  const refuse = (why) => new Refusal(`cue ${n}: ${why}`);
  const named = typeof cue.event === "string", timed = typeof cue.at === "number";
  if (named === timed) throw refuse('give either "event" (a FILM.EVENTS name) or "at" (seconds)');
  const event = named ? film.EVENTS.find((e) => e.name === cue.event) : { t: cue.at };
  if (!event) throw refuse(`no event "${cue.event}" in FILM.EVENTS (it has: ${film.EVENTS.map((e) => e.name).join(", ")})`);
  if (!(event.t >= 0 && event.t <= film.TOTAL)) throw refuse(`${event.t} s is outside the film (0 to ${film.TOTAL} s)`);
  const align = cue.align ?? "start", db = cue.db ?? 0;
  if (!["start", "peak", "end"].includes(align)) throw refuse('"align" is "start", "peak" or "end"');
  if (!(db <= BOOST_LIMIT)) throw refuse(`"db" may boost by at most +${BOOST_LIMIT} dB`);
  // The page reaches a sound through page/sound, so a cue's file lives under the job's sound/.
  if (typeof cue.file !== "string" || !cue.file.startsWith("sound/") || cue.file.includes("..")) throw refuse('"file" is a path under sound/, such as "sound/whoosh.wav"');
  if (!existsSync(join(job.dir, cue.file))) throw refuse(`${cue.file} is not there`);
  const points = soundPoints(decode(run, join(job.dir, cue.file), FINE), FINE);
  if (!points) throw refuse(`${cue.file} holds no sound above −50 dBFS`);

  const fileBegins = event.t - points[align];   // where the file's first sample would sit in the film
  const start = toMillisecond(Math.max(0, fileBegins));   // a sound that would begin before the film is trimmed
  const mediaStart = fileBegins < 0 ? toMillisecond(-fileBegins) : 0;
  const duration = toMillisecond(Math.min(points.length - mediaStart, film.TOTAL - start));
  if (!(duration > 0)) throw refuse(`nothing of ${cue.file} falls inside the film`);
  return {
    n, file: cue.file, align, event: named ? cue.event : null, on: event.t, point: points[align],
    start, mediaStart, duration, db, volume: 10 ** (db / 20), fadeIn: cue.fadeIn ?? 0, fadeOut: cue.fadeOut ?? 0,
  };
}

/** Every cue of sound/cues.json placed in the film; refuses a cue it cannot place. */
export function planCues(run, job, film) {
  const cues = readJson(join(job.dir, "sound/cues.json"));
  if (!Array.isArray(cues)) throw new Refusal("sound/cues.json must be a list of cues");
  return cues.map((cue, i) => planCue(run, job, film, cue, i + 1));
}

/** Writes the planned clips between the page's sound markers; nothing else in the page is touched. */
export function writeSoundBlock(job, plan) {
  const clips = plan.map((c) => {
    const optional = [["data-media-start", c.mediaStart], ["data-fade-in", c.fadeIn], ["data-fade-out", c.fadeOut]]
      .filter(([, seconds]) => seconds > 0).map(([name, seconds]) => ` ${name}="${seconds}"`).join("");
    return `  <audio id="mg-cue-${c.n}" src="${c.file}" data-start="${c.start}" data-duration="${c.duration}"${optional} data-volume="${+c.volume.toFixed(4)}"></audio>\n`;
  });
  writeFileSync(job.page, replaceBlock(readFileSync(job.page, "utf8"), "sound", `${clips.join("")}  `, "page/index.html"));
}

/** A film's sound as it is listened to; null when the film is silent. */
export function filmSound(run, file) {
  const x = decode(run, file, COARSE);
  return x.some((sample) => Math.abs(sample) > SILENT) ? x : null;
}

/**
 * Where a planned cue really is in a film's sound: the clip as planned is slid over the film around
 * its planned place, and the best fit says where its aligned point sits (`measured`, seconds) and how
 * much of its planned level is there (`level`, 1 = as planned). `heard` is false when it is not there.
 */
export function hearCue(run, job, cue, sound) {
  const from = Math.round(cue.mediaStart * COARSE);
  const clip = decode(run, join(job.dir, cue.file), COARSE).slice(from, from + Math.round(cue.duration * COARSE));
  const fade = (i, seconds) => (seconds > 0 ? Math.min(1, i / (seconds * COARSE)) : 1);
  for (let i = 0; i < clip.length; i++) clip[i] *= cue.volume * fade(i, cue.fadeIn) * fade(clip.length - 1 - i, cue.fadeOut);

  // Two seconds of the clip around its aligned point are enough to place it, and keep a long sound cheap.
  const point = Math.round((cue.point - cue.mediaStart) * COARSE);
  const sliceFrom = Math.max(0, Math.min(point - COARSE, clip.length - 2 * COARSE)), sliceTo = Math.min(clip.length, sliceFrom + 2 * COARSE);
  let planned = 0;
  for (let i = sliceFrom; i < sliceTo; i++) planned += clip[i] * clip[i];

  const at = Math.round(cue.start * COARSE), reach = Math.round(SEARCH * COARSE);
  let best = -Infinity, bestAt = at;
  for (let lag = at - reach; lag <= at + reach; lag++) {
    let fit = 0;
    for (let i = Math.max(sliceFrom, -lag), end = Math.min(sliceTo, sound.length - lag); i < end; i++) fit += clip[i] * sound[lag + i];
    if (fit > best) [best, bestAt] = [fit, lag];
  }
  const level = planned > 0 ? best / planned : 0;
  return { measured: (bestAt + point) / COARSE, level, heard: level >= HEARD };
}

/** Integrated loudness in LUFS (EBU R 128), or null when the film carries no sound to measure. */
export function loudness(run, file) {
  const r = run("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-vn", "-af", "ebur128", "-f", "null", "-"]);
  const integrated = r.err.match(/Integrated loudness:\s*\n\s*I:\s*(-?[\d.]+) LUFS/);
  return r.code === 0 && integrated ? Number(integrated[1]) : null;
}
