// dxb-motion-graphics — sound on its event. A cue names an event (or a second) and which point of
// the SOUND sits on it: its start, its peak or its end. The plan made here is what `mg sound` writes
// into the page and what `mg verify` holds the rendered film to, by listening to the film itself.
import { cpSync, existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve, sep } from "node:path";
import { Refusal, TEMPLATES, insideJob, readJson, replaceBlock } from "./job.mjs";

const FINE = 48000;   // samples per second when a point is looked for in a sound file
const COARSE = 16000; // samples per second when a film is listened to: 16 samples to the millisecond
const AUDIBLE = 10 ** (-50 / 20); // a sound starts and ends where it crosses −50 dBFS
const SILENT = 10 ** (-60 / 20);  // a film that never rises above −60 dBFS carries no sound
const ENVELOPE = 0.005; // seconds: the peak is the centre of the loudest stretch of this length
const SEARCH = 0.25;    // seconds each side of the planned place in which a cue is looked for
const HEARD = 0.25;     // a cue below a quarter of its planned level at its best place is not there
const CLEARLY = 1.1;    // times: only a fit this much better moves a cue off the place its plan gives it
const BOOST_LIMIT = 12; // dB: HyperFrames' data-volume goes no higher
const toMillisecond = (seconds) => +seconds.toFixed(3); // the precision a clip is written and planned at
const STARTER_SET = resolve(TEMPLATES, "../sfx"); // the skill's own effect sounds
const FROM_STARTER = "sfx:"; // how a cue names a file of that set: "sfx:pop/pop-mid-01.wav"
const refusalOfCue = (n) => (why) => new Refusal(`cue ${n}: ${why}`);

/**
 * A file's sound at `rate` as stereo samples, a left and a right one to each moment; empty when it
 * carries none. Each side is kept as it is and a mono file is heard on both (more channels than two
 * are first brought to stereo): averaged into one channel, a pair in opposite phase cancels to
 * silence. The sides are copied, never mixed (aeval): ffmpeg's own mono-to-stereo is 3 dB down, and a
 * mono sound file and the stereo film it was mixed into would no longer be at one level (measured 2026-11-12).
 */
function decode(run, file, rate) {
  const sides = "aformat=channel_layouts=mono|stereo,aeval=val(0)|val(nb_in_channels-1):c=stereo";
  const r = run("ffmpeg", ["-v", "error", "-i", file, "-vn", "-af", sides, "-ar", String(rate), "-f", "f32le", "-"], { binary: true });
  if (r.code !== 0 || !r.out.length) return new Float32Array(0);
  const bytes = Buffer.from(r.out);
  return new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + (bytes.length & ~7)));
}

/** Where a sound starts, peaks and ends, in seconds into its file; null when nothing in it is audible on either side. */
function soundPoints(x, rate) {
  const moments = x.length / 2; // one left and one right sample to each
  const level = (i) => Math.max(Math.abs(x[2 * i]), Math.abs(x[2 * i + 1])), power = (i) => x[2 * i] ** 2 + x[2 * i + 1] ** 2;
  let first = -1, last = -1;
  for (let i = 0; i < moments; i++) {
    if (level(i) <= AUDIBLE) continue;
    if (first < 0) first = i;
    last = i;
  }
  if (first < 0) return null;
  const span = Math.min(moments, Math.round(rate * ENVELOPE));
  let energy = 0, loudest = -1, centre = 0;
  for (let i = 0; i < moments; i++) {
    energy += power(i) - (i >= span ? power(i - span) : 0);
    if (i >= span - 1 && energy > loudest) [loudest, centre] = [energy, i - (span - 1) / 2];
  }
  return { start: first / rate, peak: centre / rate, end: last / rate, length: moments / rate };
}

/** sound/cues.json as { trim, cues }: a bare list of cues, or the object that states beside them the dB the whole set is moved by. */
function readCues(job) {
  const stated = readJson(join(job.dir, "sound/cues.json"));
  const { trim = 0, cues } = Array.isArray(stated) ? { cues: stated } : stated ?? {};
  if (!Array.isArray(cues)) throw new Refusal('sound/cues.json must be a list of cues, or { "trim": dB, "cues": [ … ] }');
  if (!Number.isFinite(trim)) throw new Refusal('sound/cues.json: "trim" is the dB the whole set is moved by, a number');
  return { trim, cues };
}

/**
 * Where a cue's sound lives in the job: { file }, a path under sound/. A cue that names the starter
 * set — "sfx:pop/pop-mid-01.wav" — is planned from the job's own copy of that file, sound/pop-mid-01.wav,
 * and `from` is the file of the set the copy is made of.
 */
function soundOf(cue, refuse) {
  if (typeof cue.file === "string" && cue.file.startsWith(FROM_STARTER)) {
    const from = resolve(STARTER_SET, cue.file.slice(FROM_STARTER.length));
    if (!from.startsWith(STARTER_SET + sep) || !statSync(from, { throwIfNoEntry: false })?.isFile())
      throw refuse(`"${cue.file}" is no file of the starter set (sfx/INDEX.md lists them, as pop/pop-mid-01.wav)`);
    return { file: `sound/${basename(from)}`, from };
  }
  // The page reaches a sound through page/sound, so a cue's file lives under the job's sound/.
  if (typeof cue.file !== "string" || !cue.file.startsWith("sound/") || cue.file.includes(".."))
    throw refuse(`"file" is a path under sound/, such as "sound/whoosh.wav", or a file of the starter set, such as "${FROM_STARTER}pop/pop-mid-01.wav"`);
  return { file: cue.file };
}

/**
 * Gives the job its own copy of every file of the starter set that a cue names, so the job folder
 * stays whole on its own. `mg sound` does this before it plans; a file of the job's own that already
 * stands under the copy's name is never written over.
 */
export function bringStarterSounds(job) {
  for (const [i, cue] of readCues(job).cues.entries()) {
    const refuse = refusalOfCue(i + 1), { file, from } = soundOf(cue, refuse);
    if (!from) continue;
    const copy = insideJob(job.dir, file);
    if (!existsSync(copy)) cpSync(from, copy);
    else if (!readFileSync(copy).equals(readFileSync(from))) throw refuse(`${file} is already there and is another sound than "${cue.file}"; rename the job's own file`);
  }
}

function planCue(run, job, film, cue, n, trim) {
  const refuse = refusalOfCue(n);
  const named = typeof cue.event === "string", timed = typeof cue.at === "number";
  if (named === timed) throw refuse('give either "event" (a FILM.EVENTS name) or "at" (seconds)');
  const event = named ? film.EVENTS.find((e) => e.name === cue.event) : { t: cue.at };
  if (!event) throw refuse(`no event "${cue.event}" in FILM.EVENTS (it has: ${film.EVENTS.map((e) => e.name).join(", ")})`);
  if (!(event.t >= 0 && event.t <= film.TOTAL)) throw refuse(`${event.t} s is outside the film (0 to ${film.TOTAL} s)`);
  // The level a clip plays at is its cue's own "db" and the set's trim together, to a hundredth of a dB.
  const align = cue.align ?? "start", db = +(Number(cue.db ?? 0) + trim).toFixed(2);
  if (!["start", "peak", "end"].includes(align)) throw refuse('"align" is "start", "peak" or "end"');
  if (!(db <= BOOST_LIMIT)) throw refuse(`"db"${trim ? ` with the set's "trim" (${db} dB in all)` : ""} may boost by at most +${BOOST_LIMIT} dB`);
  const { file, from } = soundOf(cue, refuse);
  if (!existsSync(join(job.dir, file))) throw refuse(`${file} is not there${from ? ` — mg sound gives the job its copy of "${cue.file}"` : ""}`);
  const points = soundPoints(decode(run, join(job.dir, file), FINE), FINE);
  if (!points) throw refuse(`${file} holds no sound above −50 dBFS`);

  const fileBegins = event.t - points[align];   // where the file's first sample would sit in the film
  const start = toMillisecond(Math.max(0, fileBegins));   // a sound that would begin before the film is trimmed
  const mediaStart = fileBegins < 0 ? toMillisecond(-fileBegins) : 0;
  const duration = toMillisecond(Math.min(points.length - mediaStart, film.TOTAL - start));
  if (!(duration > 0)) throw refuse(`nothing of ${file} falls inside the film`);
  return {
    n, file, align, event: named ? cue.event : null, on: event.t, point: points[align],
    start, mediaStart, duration, db, trim, volume: 10 ** (db / 20), fadeIn: cue.fadeIn ?? 0, fadeOut: cue.fadeOut ?? 0,
  };
}

/**
 * Every cue of sound/cues.json placed in the film, each at its own "db" moved by the set's "trim";
 * refuses a cue it cannot place. Nothing is written: a cue of the starter set is planned from the copy
 * `bringStarterSounds` gave the job.
 */
export function planCues(run, job, film) {
  const { trim, cues } = readCues(job);
  return cues.map((cue, i) => planCue(run, job, film, cue, i + 1, trim));
}

/** Writes the planned clips between the page's sound markers; nothing else in the page is touched. */
export function writeSoundBlock(job, plan) {
  const clips = plan.map((c) => {
    const optional = [["data-media-start", c.mediaStart], ["data-fade-in", c.fadeIn], ["data-fade-out", c.fadeOut]]
      .filter(([, seconds]) => seconds > 0).map(([name, seconds]) => ` ${name}="${seconds}"`).join("");
    return `  <audio id="mg-cue-${c.n}" src="${c.file}" data-start="${c.start}" data-duration="${c.duration}"${optional} data-volume="${+c.volume.toFixed(4)}"></audio>\n`;
  });
  writeFileSync(insideJob(job.dir, "page/index.html"), replaceBlock(readFileSync(job.page, "utf8"), "sound", `${clips.join("")}  `, "page/index.html"));
}

/** A film's sound as it is listened to; null when the film is silent. */
export function filmSound(run, file) {
  const x = decode(run, file, COARSE);
  return x.some((sample) => Math.abs(sample) > SILENT) ? x : null;
}

/** A cue's clip as the plan has it in the film — trimmed, at its level, faded — and the stretch of it that places it. */
function plannedClip(run, job, cue) {
  const from = 2 * Math.round(cue.mediaStart * COARSE);
  const clip = decode(run, join(job.dir, cue.file), COARSE).slice(from, from + 2 * Math.round(cue.duration * COARSE));
  const moments = clip.length / 2, fade = (i, seconds) => (seconds > 0 ? Math.min(1, i / (seconds * COARSE)) : 1);
  for (let i = 0; i < moments; i++) {
    const gain = cue.volume * fade(i, cue.fadeIn) * fade(moments - 1 - i, cue.fadeOut);
    clip[2 * i] *= gain;
    clip[2 * i + 1] *= gain;
  }
  // Two seconds of the clip around its aligned point are enough to place it, and keep a long sound cheap.
  const point = Math.round((cue.point - cue.mediaStart) * COARSE);
  const sliceFrom = Math.max(0, Math.min(point - COARSE, moments - 2 * COARSE)), sliceTo = Math.min(moments, sliceFrom + 2 * COARSE);
  let planned = 0;
  for (let i = 2 * sliceFrom; i < 2 * sliceTo; i++) planned += clip[i] * clip[i];
  return { clip, point, sliceFrom, sliceTo, planned };
}

/**
 * Where each planned cue really is in a film's sound, in the plan's order. A cue's clip is slid over
 * the film around its planned place and the best fit says where its aligned point sits (`measured`,
 * seconds) and how much of its planned level is there (`level`, 1 = as planned); `heard` is false when
 * it is not there.
 *
 * The cues are heard together, so one sound in the film answers for one cue: what a cue is found in
 * is taken out of the film, up to the cue's planned level, before the next one listens. First every
 * cue, the loudest clip first, takes the sound within `tolerance` seconds of its planned place — unless
 * its clip fits clearly better elsewhere, which is a sound that has moved; a sound repeated close by
 * so goes to the cue whose place it is in. Then the cues still unplaced are looked for wherever, in
 * what is left.
 */
export function hearCues(run, job, plan, sound, tolerance) {
  const unheard = Float32Array.from(sound), moments = unheard.length / 2;
  const clips = plan.map((cue) => plannedClip(run, job, cue)), heard = [];
  const loudestFirst = plan.map((_, n) => n).sort((a, b) => clips[b].planned - clips[a].planned);

  // Cue n's best fit in what is still unheard: within the tolerance of its planned place, and anywhere in its search.
  const bestFits = (n) => {
    const { clip, sliceFrom, sliceTo } = clips[n];
    const at = Math.round(plan[n].start * COARSE), close = Math.round(tolerance * COARSE), reach = Math.round(SEARCH * COARSE);
    let near = { fit: -Infinity, lag: at }, anywhere = near;
    for (let lag = at - reach; lag <= at + reach; lag++) {
      let fit = 0;
      for (let i = 2 * Math.max(sliceFrom, -lag), end = 2 * Math.min(sliceTo, moments - lag); i < end; i++) fit += clip[i] * unheard[2 * lag + i];
      if (fit > anywhere.fit) anywhere = { fit, lag };
      if (fit > near.fit && Math.abs(lag - at) <= close) near = { fit, lag };
    }
    return { near, anywhere };
  };
  const settle = (n, { fit, lag }) => {
    const { clip, point, planned } = clips[n], level = planned > 0 ? fit / planned : 0;
    if (level >= HEARD)
      for (let i = 2 * Math.max(0, -lag), end = Math.min(clip.length, 2 * (moments - lag)); i < end; i++) unheard[2 * lag + i] -= Math.min(level, 1) * clip[i];
    heard[n] = { measured: (lag + point) / COARSE, level, heard: level >= HEARD };
  };

  for (const n of loudestFirst) {
    const { near, anywhere } = bestFits(n);
    if (near.fit >= HEARD * clips[n].planned && anywhere.fit <= CLEARLY * near.fit) settle(n, near);
  }
  for (const n of loudestFirst) if (!heard[n]) settle(n, bestFits(n).anywhere);
  return heard;
}

/** Integrated loudness in LUFS (EBU R 128), or null when the film carries no sound to measure. */
export function loudness(run, file) {
  const r = run("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-vn", "-af", "ebur128", "-f", "null", "-"]);
  const integrated = r.err.match(/Integrated loudness:\s*\n\s*I:\s*(-?[\d.]+) LUFS/);
  return r.code === 0 && integrated ? Number(integrated[1]) : null;
}
