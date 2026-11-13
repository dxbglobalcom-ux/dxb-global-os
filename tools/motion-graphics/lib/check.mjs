// dxb-motion-graphics — the measures a film needs beyond what `mg verify` holds its file to: what the
// page promises, and what a brief asks of the picture. Each check writes its result beside verify.json,
// into out/check-<what>.json, fails naming the moments, frames or texts that did not hold, and says what
// it cannot judge. Every figure it is given — job.json's "checks", the page's FILM — is refused unless
// it is a finite number in its range, before any tool starts.
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Refusal, filmName, formatsNamed, insideJob, readFilm, writeJson } from "./job.mjs";
import { takeStills } from "./picture.mjs";
import { probe } from "./verify.mjs";

// Never still: a frame stands still when fewer than MOVING of its pixels changed by more than CHANGED
// levels of 255 from the frame before — a codec's own noise stays below CHANGED, and a camera move of a
// fraction of a pixel changes thousands of edge pixels by more (the second film's measure, 2026-11-13).
const CHANGED = 12, MOVING = 400;
const APART = 8; // levels: a join's pixels further apart than this are counted, beside its mean

const isWhole = (n, least, most) => Number.isInteger(n) && n >= least && n <= most;
const isSecond = (n, film) => typeof n === "number" && n >= 0 && n <= film.TOTAL;
const toMillisecond = (seconds) => +seconds.toFixed(3); // the precision a still is named by

/** What job.json's "checks" state for one check; refused, with the form it takes, when they state nothing. */
function stated(job, what, form) {
  const statement = job.checks[what];
  if (statement === undefined) throw new Refusal(`job.json states no "checks"."${what}": state it as "checks": { "${what}": ${form} }`);
  return statement;
}

/** A still's pixels as ffmpeg reads them, four bytes to a pixel. */
function pixelsOf(run, still) {
  const read = run("ffmpeg", ["-v", "error", "-i", still, "-f", "rawvideo", "-pix_fmt", "rgba", "-"], { binary: true });
  if (read.code !== 0 || !read.out.length) throw new Refusal(`ffmpeg could not read ${still}: ${read.err.trim()}`);
  return read.out;
}

/**
 * How far two pictures lie apart, a pixel's difference being its largest in any channel, in levels of 255:
 * the pixels that differ at all, the largest difference, the mean difference over every pixel, and the share
 * of pixels more than APART levels apart. Pictures of two sizes differ everywhere.
 */
function apart(a, b) {
  if (a.length !== b.length) return { pixels: Math.max(a.length, b.length) / 4, worst: 255, mean: 255, beyond: 1 };
  let pixels = 0, worst = 0, sum = 0, beyond = 0;
  for (let i = 0; i < a.length; i += 4) {
    const most = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]), Math.abs(a[i + 3] - b[i + 3]));
    if (most) pixels++;
    if (most > APART) beyond++;
    if (most > worst) worst = most;
    sum += most;
  }
  return { pixels, worst, mean: sum / (a.length / 4), beyond: beyond / (a.length / 4) };
}

/** The film of the format a check reads: its master in out/, at the format's own size and the job's rate. */
function masterIn(job, format) {
  const film = join(job.dir, "out", filmName(job, { format, scale: 1, fps: job.fps, alpha: false }));
  if (!existsSync(film)) throw new Refusal(`${film} is not there — render it first: mg render${format === job.formats[0] ? "" : ` --format ${format.name}`}`);
  return film;
}

/** What ffmpeg's metadata filter printed, as one entry for each frame: { n, t, keys }. */
function framesPrinted(text) {
  return String(text).split(/^frame:/m).slice(1).map((chunk) => ({
    n: Number(chunk.match(/^\s*(\d+)/)[1]),
    t: Number(chunk.match(/pts_time:([\d.e+-]+)/)[1]),
    keys: Object.fromEntries([...chunk.matchAll(/^([\w.]+)=(.*)$/gm)].map((found) => [found[1], Number(found[2])])),
  }));
}

/** Frames as runs of neighbours that share what `kind` says of them: [{ from, to, frames: [first, last], …kind }]. */
function runsOf(frames, fps, kind = () => ({})) {
  const runs = [];
  for (const n of frames.map((frame) => frame.n)) {
    const said = kind(n), last = runs[runs.length - 1];
    if (last && last.frames[1] === n - 1 && JSON.stringify(last.said) === JSON.stringify(said)) last.frames[1] = n;
    else runs.push({ frames: [n, n], said });
  }
  return runs.map(({ frames: [first, end], said }) => ({ from: toMillisecond(first / fps), to: toMillisecond(end / fps), frames: [first, end], ...said }));
}

const runSaid = (run, more = "") => `${run.frames[0] === run.frames[1] ? `${run.from} s (frame ${run.frames[0]})` : `${run.from}–${run.to} s (frames ${run.frames[0]}–${run.frames[1]})`}${more}`;

// ── same-second ──────────────────────────────────────────────────────────────────────────────────────

/** The moments a check draws, in the order of time, each once (to the millisecond a still is named by): the seconds given, or the page's events. */
function momentsOf(film, given) {
  const moments = given.map((written) => {
    const t = written.trim() === "" ? NaN : Number(written);
    if (!isSecond(t, film)) throw new Refusal(`"${written}" is no second of the film (0 to ${film.TOTAL} s)`);
    return t;
  });
  const chosen = moments.length ? moments : film.EVENTS.map((event) => event.t);
  if (!chosen.length) throw new Refusal("the page states no events (FILM.EVENTS): name the seconds to draw, as mg check same-second 1.5 4");
  return [...new Set(chosen.map(toMillisecond))].sort((a, b) => a - b);
}

/**
 * The page's promise in one format: every moment is drawn twice, by two HyperFrames calls — two browsers —
 * first in the order of time and then the other way round, so each is drawn the second time after other
 * moments than the first; a moment alone is drawn the second time after the film's last (its middle, when
 * it is the last). Returns { format, moments: [{ t, pixels, worst }] }.
 */
function sameSecondIn(tools, job, format, moments, work) {
  const total = readFilm(job.page).TOTAL, [only] = moments;
  const again = moments.length > 1 ? [...moments].reverse() : [only === total ? total / 2 : total, only];
  const drawn = (times, into) => new Map(takeStills(tools, job, format, times, join(work, format.name, into)).map((still, i) => [times[i], still]));
  const first = drawn(moments, "first"), second = drawn(again, "second");
  return {
    format: format.name,
    moments: moments.map((t) => {
      const { pixels, worst } = apart(pixelsOf(tools.run, first.get(t)), pixelsOf(tools.run, second.get(t)));
      return { t, pixels, worst };
    }),
  };
}

// ── in-frame ─────────────────────────────────────────────────────────────────────────────────────────

/** job.json's "in-frame" for the formats measured: { margin, darker } or { margin, lighter } — a whole margin under half the frame's short side, a whole level the subject's pixels lie below (1–255) or above (0–254). */
function inFrameStatement(job, formats) {
  const { margin, darker, lighter } = stated(job, "in-frame", '{ "margin": 4, "darker": 70 }');
  const refuse = (why) => new Refusal(`job.json "checks"."in-frame": ${why}`);
  if ((darker === undefined) === (lighter === undefined)) throw refuse('the subject is told from the ground by one of "darker" or "lighter" — the level of 255 its pixels lie below, or above');
  if (darker !== undefined && !isWhole(darker, 1, 255)) throw refuse(`"darker" is a whole level from 1 to 255, not ${JSON.stringify(darker)}`);
  if (lighter !== undefined && !isWhole(lighter, 0, 254)) throw refuse(`"lighter" is a whole level from 0 to 254, not ${JSON.stringify(lighter)}`);
  const half = Math.min(...formats.map((format) => Math.min(format.w, format.h))) / 2;
  if (!(isWhole(margin, 1, Infinity) && margin < half)) throw refuse(`"margin" is the whole pixels the subject keeps from each edge, 1 or more and under ${half}, not ${JSON.stringify(margin)}`);
  return { margin, darker, lighter, subject: darker !== undefined ? `darker than ${darker}` : `lighter than ${lighter}` };
}

/**
 * Every frame of one format's master, the subject boxed by ffmpeg's bbox: the frames whose subject comes
 * within the margin of an edge, as runs with the sides they come near, and how near it came to each edge.
 */
function inFrameIn(tools, job, format, { margin, darker, lighter, subject }) {
  const film = masterIn(job, format), { w, h } = probe(tools.run, film);
  // bbox boxes the pixels above its level, so a darker subject is boxed in the negative; every frame is
  // marked first, so one that holds no subject is still listed.
  const box = darker !== undefined ? `negate,bbox=min_val=${255 - darker}` : `bbox=min_val=${lighter}`;
  const read = tools.run("ffmpeg", ["-v", "error", "-i", film, "-an", "-vf", `format=gray,metadata=mode=add:key=mg.frame:value=1,${box},metadata=mode=print:file=-`, "-f", "null", "-"]);
  if (read.code !== 0) throw new Refusal(`ffmpeg could not read ${film}: ${read.err.trim()}`);
  const frames = framesPrinted(read.out), shown = frames.filter(({ keys }) => "lavfi.bbox.x1" in keys), near = new Map(), nearest = {};
  for (const { n, keys } of shown) {
    const edges = { left: keys["lavfi.bbox.x1"], right: w - 1 - keys["lavfi.bbox.x2"], top: keys["lavfi.bbox.y1"], bottom: h - 1 - keys["lavfi.bbox.y2"] };
    for (const [side, pixels] of Object.entries(edges)) nearest[side] = Math.min(nearest[side] ?? Infinity, pixels);
    const sides = Object.keys(edges).filter((side) => edges[side] < margin);
    if (sides.length) near.set(n, sides);
  }
  const touching = runsOf(shown.filter(({ n }) => near.has(n)), job.fps, (n) => ({ sides: near.get(n) }));
  return { format: format.name, film, frames: frames.length, shown: shown.length, margin, subject, nearest: shown.length ? nearest : null, touching };
}

// ── never-still ──────────────────────────────────────────────────────────────────────────────────────

/** job.json's "never-still": a list of stretches { from, to }, each end a second or a beat of FILM.BEATS, inside the film and at least two frames long. */
function stretchesStated(job, film) {
  const stretches = stated(job, "never-still", '[{ "from": 2.2, "to": 25.8 }]');
  const refuse = (why) => new Refusal(`job.json "checks"."never-still": ${why}`);
  if (!Array.isArray(stretches) || !stretches.length) throw refuse('a list of stretches, each { "from", "to" } — a second or a beat of FILM.BEATS');
  return stretches.map((stretch, i) => {
    const second = (end) => {
      const given = stretch?.[end], t = typeof given === "string" && Object.hasOwn(film.BEATS, given) ? film.BEATS[given] : given;
      if (!isSecond(t, film)) throw refuse(`stretch ${i + 1}: "${end}" is a second of the film (0 to ${film.TOTAL}) or a beat of FILM.BEATS (${Object.keys(film.BEATS).join(", ")}), not ${JSON.stringify(given)}`);
      return t;
    };
    const from = second("from"), to = second("to");
    if (!(Math.floor(to * job.fps + 1e-6) > Math.ceil(from * job.fps - 1e-6))) throw refuse(`stretch ${i + 1}: from ${from} to ${to} s holds no two frames`);
    return { from, to };
  });
}

/**
 * One format's master over each stretch: for every frame after the stretch's first, how many pixels changed
 * by more than CHANGED levels from the frame before — counted by ffmpeg — and the frames that stood still.
 * A stretch runs to the master's last frame at most; one the master holds no two frames of is refused, and
 * so is a count of frames other than the stretch's: a measure of nothing is no pass.
 */
function neverStillIn(tools, job, format, stretches) {
  const film = masterIn(job, format), { w, h, frames: held } = probe(tools.run, film);
  return {
    format: format.name, film,
    stretches: stretches.map(({ from, to }) => {
      const first = Math.ceil(from * job.fps - 1e-6), last = Math.min(Math.floor(to * job.fps + 1e-6), held - 1);
      if (last <= first) throw new Refusal(`${film} holds no two frames of ${from}–${to} s (it has ${held}): render it again`);
      // Each frame against the one before, as a picture of the pixels that changed (white) and did not (black); its mean is their share.
      const changed = `trim=start_frame=${first}:end_frame=${last + 1},format=gray,tblend=all_mode=difference,lut=c0='gt(val\\,${CHANGED})*255',format=yuvj444p,signalstats,metadata=mode=print:key=lavfi.signalstats.YAVG:file=-`;
      const read = tools.run("ffmpeg", ["-v", "error", "-i", film, "-an", "-vf", changed, "-f", "null", "-"]);
      if (read.code !== 0) throw new Refusal(`ffmpeg could not read ${film}: ${read.err.trim()}`);
      const frames = framesPrinted(read.out).map(({ t, keys }) => ({ n: Math.round(t * job.fps), pixels: Math.round((keys["lavfi.signalstats.YAVG"] / 255) * w * h) }));
      if (frames.length !== last - first) throw new Refusal(`ffmpeg measured ${frames.length} frame(s) of ${film} in ${from}–${to} s where it holds ${last - first}`);
      const still = frames.filter((frame) => frame.pixels < MOVING);
      return { from, to, frames: frames.length, fewest: Math.min(...frames.map((frame) => frame.pixels)), still: runsOf(still, job.fps) };
    }),
  };
}

// ── reading ──────────────────────────────────────────────────────────────────────────────────────────

/** The words a text carries: the pieces between spaces that hold a letter or a digit — a dot or a dash between words is none. */
const wordsIn = (text) => text.split(/\s+/).filter((piece) => /[\p{L}\p{N}]/u.test(piece)).length;

/**
 * The page's texts (FILM.TEXTS), each { text, whole, leaves } with `words` where the text itself does not
 * carry them (a screen's own lines) and `after`, the text of an earlier one the eye reads first.
 */
function textsStated(film) {
  const texts = film.TEXTS, refuse = (i, why) => new Refusal(`FILM.TEXTS[${i}]${typeof texts[i]?.text === "string" ? ` ("${texts[i].text}")` : ""}: ${why}`);
  if (!Array.isArray(texts) || !texts.length) throw new Refusal("the page states no texts: FILM.TEXTS lists each { text, whole, leaves } — the seconds it stands whole from and begins to leave at — with `words` for a text whose words the page does not carry, and `after` for one read after another");
  return texts.map((entry, i) => {
    const { text, words = typeof text === "string" ? wordsIn(text) : 0, whole, leaves, after } = entry ?? {};
    if (typeof text !== "string" || !text.trim()) throw refuse(i, '"text" is the words on screen, or what names them');
    if (!isWhole(words, 1, Infinity)) throw refuse(i, `"words" is how many words it carries, a whole number from 1, not ${JSON.stringify(entry.words ?? words)}`);
    for (const [name, t] of [["whole", whole], ["leaves", leaves]]) if (!isSecond(t, film)) throw refuse(i, `"${name}" is a second of the film (0 to ${film.TOTAL}), not ${JSON.stringify(t)}`);
    if (whole > leaves) throw refuse(i, `"whole" ${whole} s comes after "leaves" ${leaves} s`);
    const first = after === undefined ? -1 : texts.findIndex((other) => other?.text === after);
    if (after !== undefined && !(first >= 0 && first < i)) throw refuse(i, `"after" names a text the page states before this one, not ${JSON.stringify(after)}`);
    return { text, words, whole, leaves, first };
  });
}

// ── join ─────────────────────────────────────────────────────────────────────────────────────────────

/** The page's joins (FILM.JOINS), each { name, t, layers: [a, b] }: an instant of the film and two layers of the page that both draw it. */
function joinsStated(film) {
  const joins = film.JOINS, refuse = (why) => new Refusal(`FILM.JOINS ${why}`);
  if (!Array.isArray(joins) || !joins.length) throw refuse("lists no join: each is { name, t, layers: [a, b] } — an instant, and the two layers of the page that both draw it (window.MG_DRAW tells the page which)");
  return joins.map((entry, i) => {
    const { name, t, layers } = entry ?? {};
    if (typeof name !== "string" || !name) throw refuse(`[${i}]: "name" is the join's name`);
    if (!isSecond(t, film)) throw refuse(`[${i}] (${name}): "t" is a second of the film (0 to ${film.TOTAL}), not ${JSON.stringify(t)}`);
    if (!Array.isArray(layers) || layers.length !== 2 || layers.some((layer) => typeof layer !== "string" || !layer) || layers[0] === layers[1])
      throw refuse(`[${i}] (${name}): "layers" names the two layers that both draw it, not ${JSON.stringify(layers)}`);
    return { name, t, layers };
  });
}

/**
 * Each join in one format, drawn three times by three HyperFrames calls: by its first layer, by its second,
 * and by its second with the subject a pixel aside (window.MG_DRAW). The join holds when the first two lie
 * less than `mean` apart; the measure sees a pixel when the first and the one aside do not.
 */
function joinsIn(tools, job, format, joins, mean, work) {
  return {
    format: format.name,
    joins: joins.map(({ name, t, layers: [first, second] }, i) => {
      // Each drawing in a folder of its own, named by the check: no name the page gives becomes part of a path.
      const drawn = (layer, nudge, into) => pixelsOf(tools.run, takeStills(tools, job, { ...format, draw: { layer, nudge } }, [t], join(work, format.name, String(i), into))[0]);
      const one = drawn(first, 0, "first"), other = apart(one, drawn(second, 0, "second")), aside = apart(one, drawn(second, 1, "aside"));
      const kept = ({ mean: off, beyond }) => ({ mean: +off.toFixed(4), beyond: +beyond.toFixed(4) });
      return { name, t, layers: [first, second], apart: kept(other), aside: kept(aside), holds: other.mean < mean, sees: aside.mean >= mean };
    }),
  };
}

/**
 * Each check: what it measures, as `mg check --help` says it; what it cannot judge; whether it takes
 * seconds and is measured in each format; and the measure — given the job and what `mg check` was asked
 * ({ format, seconds }), it returns { ok, lines, …its result }: the lines say how each part went, and the
 * result is what out/check-<what>.json records.
 */
export const CHECKS = {
  "same-second": {
    says: "the page's promise: each moment — the page's events, or the seconds given — is drawn twice, in two browsers, the second time after other moments, and every pixel must be the same",
    cannotJudge: ["Each moment is drawn twice, with two pasts, in two browsers: a page that differs only in other circumstances of a render can pass."],
    takesSeconds: true,
    measure(tools, job, { format, seconds: given }) {
      const moments = momentsOf(readFilm(job.page), given), work = mkdtempSync(join(insideJob(job.dir, "out"), ".same-second-"));
      try {
        const formats = formatsNamed(job, format).map((one) => sameSecondIn(tools, job, one, moments, work));
        const lines = formats.map(({ format: name, moments: drawn }) => {
          const other = drawn.filter((moment) => moment.pixels);
          return other.length
            ? `FAILED  ${name} — ${other.length} of ${drawn.length} moment(s) drew other pixels the second time: ${other.map((m) => `${m.t} s (${m.pixels} pixels, up to ${m.worst} levels)`).join(", ")}`
            : `OK      ${name} — ${drawn.length} moment(s), each the same pixels both times`;
        });
        return { ok: formats.every((one) => one.moments.every((moment) => !moment.pixels)), lines, formats };
      } finally {
        rmSync(work, { recursive: true, force: true });
      }
    },
  },
  "in-frame": {
    says: 'the whole subject in frame: over every frame of the format\'s master, nothing of the subject — its pixels darker or lighter than the level job.json\'s "checks"."in-frame" states, { "margin": 4, "darker": 70 } — comes within "margin" pixels of an edge',
    cannotJudge: [
      "It sees pixels by their lightness, not the subject: whatever crosses the stated level counts — a shadow, a word, a vignette — and a part of the subject on the ground's side of it is not seen.",
      "A frame that shows nothing of the subject is not judged: a subject that has left the frame whole, or not yet come in, passes there.",
      "Inside the frame it judges nothing: a subject cut by another element, or whole but too small, passes.",
    ],
    measure(tools, job, { format }) {
      const formats = formatsNamed(job, format), statement = inFrameStatement(job, formats);
      const measured = formats.map((one) => inFrameIn(tools, job, one, statement));
      const lines = measured.map(({ format: name, frames, shown, margin, subject, nearest, touching }) => {
        if (!shown) return `FAILED  ${name} — no pixel of its ${frames} frame(s) is ${subject}: the statement does not find the subject`;
        const near = touching.reduce((sum, run) => sum + run.frames[1] - run.frames[0] + 1, 0);
        return near
          ? `FAILED  ${name} — ${near} of ${frames} frame(s) within ${margin} px of the edge: ${touching.map((run) => runSaid(run, ` ${run.sides.join(" and ")}`)).join(", ")}; ${shown} frame(s) show the subject`
          : `OK      ${name} — ${frames} frame(s), ${shown} showing the subject, none within ${margin} px of the edge; nearest: ${Object.entries(nearest).map(([side, pixels]) => `${side} ${pixels}`).join(", ")}`;
      });
      return { ok: measured.every((one) => one.shown && !one.touching.length), lines, formats: measured };
    },
  },
  reading: {
    says: 'every text stands whole long enough to be read: each text the page states (FILM.TEXTS) is given its words\' time at the rate job.json\'s "checks"."reading" states, { "wordsPerSecond": 3 }, from when it is whole — or from when the text the eye reads first is read — to when it begins to leave',
    cannotJudge: ["It holds the times the page states: whether each text really stands on screen, whole and legible, then, only an eye can say."],
    inOneFormat: true,
    measure(tools, job) {
      const { wordsPerSecond: rate } = stated(job, "reading", '{ "wordsPerSecond": 3 }');
      if (!(typeof rate === "number" && Number.isFinite(rate) && rate > 0)) throw new Refusal(`job.json "checks"."reading": "wordsPerSecond" is the words a viewer reads in a second, more than 0, not ${JSON.stringify(rate)}`);
      const done = [];
      const texts = textsStated(readFilm(job.page)).map(({ text, words, whole, leaves, first }, i) => {
        const from = Math.max(whole, first < 0 ? 0 : done[first]), needs = words / rate, has = leaves - from;
        done[i] = from + needs;
        return { text, words, whole, leaves, from: toMillisecond(from), needs: toMillisecond(needs), has: toMillisecond(has), ok: has >= needs - 1e-9 };
      });
      const lines = texts.map((t) => `${t.ok ? "ok   " : "SHORT"} ${t.words} words need ${t.needs.toFixed(2)} s · whole ${t.whole.toFixed(2)}–${t.leaves.toFixed(2)} s, read from ${t.from.toFixed(2)} s: ${t.has.toFixed(2)} s · ${t.text}`);
      return { ok: texts.every((t) => t.ok), lines, wordsPerSecond: rate, texts };
    },
  },
  "never-still": {
    says: `never still: inside each stretch job.json's "checks"."never-still" states, [{ "from": 2.2, "to": "round" }] (a second, or a beat of FILM.BEATS), no frame of the format's master stands still — fewer than ${MOVING} pixels changed by more than ${CHANGED} levels from the frame before`,
    cannotJudge: [`It sees change, not movement: grain or a flicker counts as moving, and a move that changes fewer than ${MOVING} pixels by more than ${CHANGED} levels as standing still.`],
    measure(tools, job, { format }) {
      const stretches = stretchesStated(job, readFilm(job.page));
      const measured = formatsNamed(job, format).map((one) => neverStillIn(tools, job, one, stretches));
      const lines = measured.flatMap(({ format: name, stretches: read }) => read.map(({ from, to, frames, fewest, still }) => {
        const stood = still.reduce((sum, run) => sum + run.frames[1] - run.frames[0] + 1, 0);
        return stood
          ? `FAILED  ${name} — ${from}–${to} s: ${stood} of ${frames} frame(s) stood still: ${still.map((run) => runSaid(run)).join(", ")}`
          : `OK      ${name} — ${from}–${to} s: ${frames} frame(s), each moved from the one before; the fewest pixels changed: ${fewest}`;
      }));
      return { ok: measured.every((one) => one.stretches.every((stretch) => !stretch.still.length)), lines, changed: CHANGED, moving: MOVING, formats: measured };
    },
  },
  join: {
    says: 'a join holds: each instant the page states as drawn by two of its layers (FILM.JOINS) is drawn by each — the page told which by window.MG_DRAW = { layer, nudge } — and the two lie less than job.json\'s "checks"."join" mean apart, { "mean": 0.6 } levels of 255; the same with the second layer\'s subject one pixel aside (nudge 1) must not, or the measure is blind',
    cannotJudge: ["The page draws what it is asked: a page that draws one layer for both passes the join, and only the instants FILM.JOINS names are measured."],
    measure(tools, job, { format }) {
      const { mean } = stated(job, "join", '{ "mean": 0.6 }');
      if (!(typeof mean === "number" && mean > 0 && mean < 255)) throw new Refusal(`job.json "checks"."join": "mean" is the levels of 255 two layers may lie apart on average, more than 0 and under 255, not ${JSON.stringify(mean)}`);
      const joins = joinsStated(readFilm(job.page)), work = mkdtempSync(join(insideJob(job.dir, "out"), ".join-"));
      try {
        const measured = formatsNamed(job, format).map((one) => joinsIn(tools, job, one, joins, mean, work));
        const lines = measured.flatMap(({ format: name, joins: drawn }) => drawn.map(({ name: joinName, t, layers: [first, second], apart: off, aside, holds, sees }) =>
          `${holds && sees ? "OK    " : "FAILED"}  ${name} — ${joinName} at ${t} s: ${first} and ${second} ${off.mean.toFixed(3)} levels apart on average, ${holds ? "" : "not "}under ${mean}; ${second} a pixel aside ${aside.mean.toFixed(3)} — the measure ${sees ? "sees" : "does not see"} a pixel`));
        return { ok: measured.every((one) => one.joins.every((drawn) => drawn.holds && drawn.sees)), lines, mean, formats: measured };
      } finally {
        rmSync(work, { recursive: true, force: true });
      }
    },
  },
};

/**
 * Runs the check named `what` on a job: { ok, lines } — its lines, then what it cannot judge. Its result
 * is written into out/check-<what>.json, and a check that stops on the way leaves no older result standing.
 */
export function checkJob(tools, job, what, asked) {
  // Its own names only: every object also answers to "constructor", "toString", "__proto__".
  const check = typeof what === "string" && Object.hasOwn(CHECKS, what) ? CHECKS[what] : null;
  if (!check) throw new Refusal(`which check? mg check ${Object.keys(CHECKS).join("|")}`);
  if (asked.seconds.length && !check.takesSeconds) throw new Refusal(`mg check ${what} takes no seconds`);
  if (asked.format !== undefined && check.inOneFormat) throw new Refusal(`mg check ${what} is the same in every format: --format is not given with it`);
  mkdirSync(insideJob(job.dir, "out"), { recursive: true });
  const record = insideJob(job.dir, "out", `check-${what}.json`);
  rmSync(record, { force: true });
  const { ok, lines, ...measured } = check.measure(tools, job, asked);
  writeJson(record, { ok, ...measured, cannotJudge: check.cannotJudge });
  return { ok, lines: [...lines, `cannot judge:\n${check.cannotJudge.map((line) => `  - ${line}`).join("\n")}`] };
}
