// dxb-motion-graphics — the picture, through HyperFrames: exact-time stills, contact sheets, the film.
// HyperFrames never opens page/ itself. Each call gets a stage: a copy of page/ beside it whose root
// is framed for the master asked for, removed when the call returns — so page/index.html is never
// rewritten for a format and never collects HyperFrames' own state folder.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { Refusal, filmName, frameRoot, insideJob, linkMaterial, readFilm } from "./job.mjs";

// HyperFrames renders larger than the page only at these sizes, by a whole multiple of the page's own.
const RESOLUTIONS = {
  landscape: [1920, 1080], portrait: [1080, 1920], square: [1080, 1080],
  "landscape-1440p": [2560, 1440], "portrait-1440p": [1440, 2560], "square-1440p": [1440, 1440],
  "landscape-4k": [3840, 2160], "portrait-4k": [2160, 3840], "square-4k": [2160, 2160],
};
const resolutionAt = (format, multiple) =>
  Object.keys(RESOLUTIONS).find((name) => RESOLUTIONS[name][0] === format.w * multiple && RESOLUTIONS[name][1] === format.h * multiple);
const SOFTWARE_GL = /SwiftShader|llvmpipe/i;
// A renderer is taken for a graphics card only when its string names a card's maker. Anything else — a
// software rasteriser under another name, "no WebGL", a string never seen — is not one.
const GRAPHICS_CARD = /\b(NVIDIA|AMD|Radeon|Intel|Apple)\b/i;
// The context names a script hands to getContext, quoted as code writes them: the sign that a page asks for WebGL.
const ASKS_FOR_WEBGL = /['"`](webgl2?|experimental-webgl)['"`]/;

/** The last lines a tool said, without HyperFrames' progress bars. */
export function lastLines(text) {
  return text.split("\n").filter((line) => line.trim() && !/@hf-progress|█|Render:trace/.test(line)).slice(-12).join("\n");
}

function withStage(job, frame, use) {
  linkMaterial(job.dir);
  const stage = mkdtempSync(join(job.dir, ".mg-stage-"));
  try {
    cpSync(join(job.dir, "page"), stage, { recursive: true, verbatimSymlinks: true, filter: (from) => basename(from) !== ".hyperframes" });
    writeFileSync(join(stage, "index.html"), frameRoot(readFileSync(job.page, "utf8"), frame));
    return use(stage);
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

/** Stills at exact seconds into out/stills/<format>/at-<seconds>s.png; taking a moment again replaces it. */
export function takeStills({ hf }, job, format, times) {
  const total = readFilm(job.page).TOTAL;
  const outside = times.find((t) => !(t >= 0 && t <= total));
  if (outside !== undefined) throw new Refusal(`${outside} s is outside the film (0 to ${total} s)`);
  const dir = insideJob(job.dir, "out/stills", format.name);
  const files = times.map((t) => join(dir, `at-${+t.toFixed(3)}s.png`));
  mkdirSync(dir, { recursive: true });
  for (const file of files) rmSync(file, { force: true });
  const shot = withStage(job, format, (stage) => hf(job, ["snapshot", stage, "--at", times.join(","), "--no-end", "--keep", "-o", dir]));
  if (shot.code !== 0 || files.some((file) => !existsSync(file))) throw new Refusal(`HyperFrames wrote no still:\n${lastLines(shot.text)}`);
  return files;
}

function momentsAround(t, count, total, window) {
  const spread = Array.from({ length: count }, (_, i) => t - window + (2 * window * i) / Math.max(1, count - 1));
  return [...new Set(spread.map((s) => +Math.min(total, Math.max(0, s)).toFixed(3)))];
}

/**
 * A contact sheet of the whole film (film.jpg), or one per event of the moments around it
 * (event-<name>.jpg): `count` stills, from `window` seconds before the event to as long after it.
 * HyperFrames puts nine stills on a sheet; more make <name>-1.jpg, <name>-2.jpg, ….
 */
export function makeSheets({ hf }, job, format, { aroundEvents, count, window }) {
  const film = readFilm(job.page);
  const dir = insideJob(job.dir, "out/sheets", format.name);
  const sheets = aroundEvents
    ? film.EVENTS.map((e) => ({ name: `event-${e.name.replace(/[^\w.-]+/g, "-")}`, moments: ["--at", momentsAround(e.t, count, film.TOTAL, window).join(","), "--no-end"] }))
    : [{ name: "film", moments: ["--frames", String(count)] }];
  mkdirSync(dir, { recursive: true });
  return withStage(job, format, (stage) => sheets.flatMap(({ name, moments }) => {
    const work = mkdtempSync(join(dir, ".work-"));
    try {
      const shot = hf(job, ["snapshot", stage, ...moments, "-o", work]);
      const made = readdirSync(work).filter((file) => /^contact-sheet.*\.jpg$/.test(file)).sort();
      if (shot.code !== 0 || !made.length) throw new Refusal(`HyperFrames wrote no contact sheet for ${name}:\n${lastLines(shot.text)}`);
      for (const old of readdirSync(dir)) if (old === `${name}.jpg` || old.startsWith(`${name}-`)) rmSync(join(dir, old));
      return made.map((file, i) => {
        const sheet = join(dir, made.length > 1 ? `${name}-${i + 1}.jpg` : `${name}.jpg`);
        renameSync(join(work, file), sheet);
        return sheet;
      });
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  }));
}

/** The whole multiple a master is rendered at: --scale as given, --4k as the multiple that reaches 4K (1 for a job that is 4K already), else 1. */
export function scaleFor(format, { scale, fourK }) {
  if (fourK) {
    const multiple = [1, 2, 3, 4, 5, 6].find((n) => resolutionAt(format, n)?.endsWith("-4k"));
    if (!multiple) throw new Refusal(`${format.w}×${format.h} reaches no 4K size by a whole multiple`);
    return multiple;
  }
  if (scale !== 1 && !resolutionAt(format, scale))
    throw new Refusal(`${format.w}×${format.h} × ${scale} is not a size HyperFrames renders (${Object.values(RESOLUTIONS).map(([w, h]) => `${w}×${h}`).join(", ")})`);
  return scale;
}

/** Whether a script of the page asks for a WebGL context: the page's own text and every script file under it, linked material included. */
function asksForWebGL(dir) {
  return readdirSync(dir).some((name) => {
    const path = join(dir, name), found = statSync(path, { throwIfNoEntry: false });
    if (found?.isDirectory()) return asksForWebGL(path);
    return Boolean(found?.isFile()) && /\.(html?|m?js)$/i.test(name) && ASKS_FOR_WEBGL.test(readFileSync(path, "utf8"));
  });
}

/**
 * The GL renderers a render's output names (the page's `mg:gl` lines), every one a graphics card.
 * Refused: a software renderer, a renderer that is not a known card, and a page that asks for WebGL
 * while its render names no renderer at all — what is not proved to be a card is taken for software.
 */
function provenRenderers(job, said) {
  const gl = [...new Set([...said.matchAll(/mg:gl (.+)/g)].map((line) => line[1].trim()))];
  const software = gl.find((renderer) => SOFTWARE_GL.test(renderer)), unknown = gl.find((renderer) => !GRAPHICS_CARD.test(renderer));
  if (software) throw new Refusal(`the page drew with a software GL renderer (${software}); no film is kept from such a render`);
  if (unknown) throw new Refusal(`the page's GL renderer is not a graphics card mg knows (${unknown}); no film is kept from such a render`);
  if (!gl.length && asksForWebGL(join(job.dir, "page")))
    throw new Refusal("the page asks for WebGL and the render's output carries no renderer line (mg:gl), so software drawing cannot be ruled out; no film is kept from such a render. A page that draws with WebGL writes its unmasked renderer to <html data-gl> before `ready` resolves");
  return gl;
}

/**
 * The whole film for one master { format, scale, fps, alpha }, into out/. Always from the first frame
 * to the last. A render that does not prove its GL renderer (`provenRenderers`) fails, and no film is kept from it.
 */
export function renderFilm({ hf }, job, master) {
  const { format, scale, fps, alpha } = master;
  const out = insideJob(job.dir, "out"), name = filmName(job, master);
  mkdirSync(out, { recursive: true });
  const work = mkdtempSync(join(out, ".rendering-"));
  try {
    const larger = scale > 1 ? ["--resolution", resolutionAt(format, scale)] : [];
    const made = withStage(job, { ...format, alpha }, (stage) =>
      hf(job, ["render", stage, "-o", join(work, name), "--fps", String(fps), ...larger, ...(alpha ? ["--format", "mov"] : [])]));
    if (made.code !== 0) throw new Refusal(`HyperFrames did not render (exit ${made.code}):\n${lastLines(made.text)}`);
    const gl = provenRenderers(job, made.text);
    if (!existsSync(join(work, name))) throw new Refusal(`HyperFrames reported a render and wrote no film:\n${lastLines(made.text)}`);
    renameSync(join(work, name), join(out, name));
    return { file: join(out, name), gl };
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
