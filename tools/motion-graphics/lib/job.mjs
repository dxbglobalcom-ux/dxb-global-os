// dxb-motion-graphics — the job folder: what `mg init` lays out and how every other command reads it.
// Two files state a film: job.json (title, formats, rate, loudness target) and the timing block at
// the top of page/index.html (window.FILM). Nothing here starts a process.
import { copyFileSync, cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPOSITORY = resolve(HERE, "../../..");
export const TEMPLATES = resolve(HERE, "../../../packages/gateway/plugins/dxb-motion-graphics/skills/dxb-motion-graphics/templates");

const FOLDERS = ["assets", "refs", "board", "page", "page/fonts", "page/lib", "sound", "out"];
// HyperFrames serves the page's own folder and nothing above it: a "../" path is a lint error and a
// 404 in its browser (measured 2026-11-12). The page reaches the job's material through these links.
const LINKED = ["assets", "refs", "sound"];
const FORMAT_NAME = /^[A-Za-z0-9_-]+$/; // a format's name becomes part of every output's file name
// What a round of a film (`mg init --from`) takes from the job before it: the job's statement, its
// page, its board's data, its material and its sound.
const CARRIED = ["job.json", "assets", "refs", "board", "page", "sound"];
// Inside two of them, what was made of the rest stays behind: the board `mg board` drew of each format
// and the board page it drew them from (the template lays out one that can carry the film's frames),
// and HyperFrames' own state in the page.
const madeIn = (job) => ({
  board: new Set(["board.html", ...job.formats.map((format, i) => (i ? `board-${format.name}.png` : "board.png"))]),
  page: new Set([".hyperframes"]),
});
// A library the page loads, as its text names it: "lib/three.min.js", './lib/outline.js'.
const LOADS_FROM_LIB = /["'`](?:\.\/)?lib\/([^"'`?#\s]+)/g;
// What a film's file name carries after its format's name: -<n>x for a larger master, -<n>fps for another rate.
const MASTER_MARKS = "(?:-(\\d+)x)?(?:-(\\d+)fps)?";

/** What stopped a command, in words for the person at the terminal. `mg` prints it and exits non-zero. */
export class Refusal extends Error {}

export function readJson(file) {
  if (!existsSync(file)) throw new Refusal(`${file} is not there`);
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    throw new Refusal(`${file} is not JSON: ${e.message}`);
  }
}

export function writeJson(file, value) {
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

/** A file's text with what stands between its <!-- mg:<name>:begin --> and <!-- mg:<name>:end --> markers replaced. */
export function replaceBlock(html, name, body, file) {
  const markers = new RegExp(`(<!-- mg:${name}:begin -->)[\\s\\S]*?(<!-- mg:${name}:end -->)`);
  if (!markers.test(html)) throw new Refusal(`${file} has no <!-- mg:${name}:begin --> … <!-- mg:${name}:end --> block`);
  return html.replace(markers, (_, begin, end) => `${begin}\n${body}${end}`);
}

function swapOnce(text, pattern, to, what) {
  if ((text.match(new RegExp(pattern, "g")) ?? []).length !== 1) throw new Error(`the page template does not carry ${what} exactly once`);
  return text.replace(pattern, () => to);
}

/**
 * The page template at a job's own size, rate and length. The size is written into FILM alone: the
 * template gives it no name of its own, because such a name keeps the first format's size while
 * another format is drawn.
 */
export function sizePage(template, { w, h, fps, dur }) {
  const framed = swapOnce(template, /W: \d+, H: \d+,/, `W: ${w}, H: ${h},`, "its frame's size");
  const timed = swapOnce(framed, /const FPS = \d+, TOTAL = [\d.]+;/, `const FPS = ${fps}, TOTAL = ${dur};`, "its timing constants");
  return swapOnce(timed, /data-width="\d+" data-height="\d+" data-duration="[\d.]+"/,
    `data-width="${w}" data-height="${h}" data-duration="${dur}"`, "its root's size and length");
}

/** Whether a job's page is still the starter `mg init` laid out: the template at the page's own size, rate and length, nothing in it changed. */
export function isStarterPage(job) {
  const film = readFilm(job.page);
  return readFileSync(job.page, "utf8") === sizePage(readFileSync(join(TEMPLATES, "page.html"), "utf8"), { w: film.W, h: film.H, fps: film.FPS, dur: film.TOTAL });
}

/** The page with its root framed for one master: the format's size, and data-alpha for a transparent one. */
export function frameRoot(html, { w, h, alpha = false }) {
  const root = html.match(/<[a-z]+\b[^>]*\bdata-composition-id="film"[^>]*>/);
  if (!root || !/\bdata-width="/.test(root[0]) || !/\bdata-height="/.test(root[0]))
    throw new Refusal('page/index.html has no root carrying data-composition-id="film", data-width and data-height');
  const framed = root[0]
    .replace(/\bdata-width="[^"]*"/, `data-width="${w}"`)
    .replace(/\bdata-height="[^"]*"/, `data-height="${h}"`)
    .replace(/\s+data-alpha\b/, "")
    .replace(/>$/, alpha ? " data-alpha>" : ">");
  return html.replace(root[0], () => framed);
}

/** Whether a path really lies in `root`, or is it: by its own parts, and by every link standing on the way. */
export function staysInside(root, path) {
  let standing = resolve(path); // the deepest part of the path that is already there, a link included
  while (!lstatSync(standing, { throwIfNoEntry: false })) standing = dirname(standing);
  const home = realpathSync(root), real = existsSync(standing) ? realpathSync(standing) : null; // null: a link to nowhere
  return real === home || Boolean(real?.startsWith(home + sep));
}

/**
 * A path under the job's root that a command writes to. Refused when it leaves the job folder — by its
 * own parts, or through a link standing on the way — so nothing `mg` writes lands outside the job.
 */
export function insideJob(root, ...parts) {
  const path = resolve(root, ...parts);
  if (!staysInside(root, path)) throw new Refusal(`${path} leads out of the job folder (${root}); mg writes nothing outside it`);
  return path;
}

/**
 * HyperFrames is started from the job folder, and an npx call started from this repository's root
 * rewrote its package.json (measured 2026-11-12): the root is never a job, by whatever path it is named.
 */
function refuseRepositoryRoot(root) {
  if (existsSync(root) && realpathSync(root) === realpathSync(REPOSITORY))
    throw new Refusal(`${root} is this repository's root, not a job folder — a job lives in a folder of its own: mg init <dir>`);
}

function gcd(a, b) {
  return b ? gcd(b, a % b) : a;
}

/** The format a frame is given when nobody names it: its ratio, as 16x9 or 9x16. */
export function formatBySize(w, h) {
  const k = gcd(w, h);
  return { name: `${w / k}x${h / k}`, w, h };
}

/**
 * Refuses formats no command could work with: none at all, a name that cannot stand in a file name,
 * or two names that one film's file name would mean — "a-2x" beside "a", since <title>-a-2x.mp4 is
 * "a" at twice its size and "a-2x" at its own. The same name twice is the plainest such pair.
 */
function checkFormats(formats) {
  if (!Array.isArray(formats) || !formats.length || formats.some((f) => !f.name || !(f.w > 0) || !(f.h > 0)))
    throw new Refusal('job.json: "formats" must list at least one { "name", "w", "h" }');
  if (formats.some((f) => !FORMAT_NAME.test(f.name))) throw new Refusal('job.json: a format\'s "name" is letters, digits, "-" and "_" only');
  const marksAlone = new RegExp(`^${MASTER_MARKS}$`);
  for (const [i, shorter] of formats.entries())
    for (const [j, longer] of formats.entries())
      if (i !== j && longer.name.startsWith(shorter.name) && marksAlone.test(longer.name.slice(shorter.name.length)))
        throw new Refusal(`job.json: the formats "${shorter.name}" and "${longer.name}" cannot stand together — a film named <title>-${longer.name} would be either (a master's name is <format>[-<n>x][-<n>fps]). Rename one`);
}

export function linkMaterial(root) {
  for (const folder of LINKED) {
    const link = join(root, "page", folder);
    if (!lstatSync(link, { throwIfNoEntry: false })) symlinkSync(join("..", folder), link, "dir");
  }
}

/**
 * Folders, job.json, the page with the helpers it loads from page/lib, an empty cue list and the
 * links: a job that every command can open. Nothing is written when the formats are refused.
 */
export function layOutJob(dir, { title, formats, fps, lufs = null, spec = false, brand = "" }, pageHtml) {
  const root = resolve(dir);
  refuseRepositoryRoot(root);
  checkFormats(formats);
  for (const taken of ["job.json", "page/index.html"])
    if (existsSync(join(root, taken))) throw new Refusal(`${root} already holds a job (${taken}); mg never writes over one`);
  mkdirSync(root, { recursive: true });
  for (const folder of FOLDERS) mkdirSync(insideJob(root, folder), { recursive: true });
  writeJson(insideJob(root, "job.json"), { title, formats, fps, lufs, spec, brand });
  writeFileSync(insideJob(root, "page/index.html"), pageHtml);
  cpSync(join(TEMPLATES, "play.js"), insideJob(root, "page/play.js"));
  cpSync(join(TEMPLATES, "lib"), insideJob(root, "page/lib"), { recursive: true });
  writeFileSync(insideJob(root, "sound/cues.json"), "[]\n");
  linkMaterial(root);
  return openJob(root);
}

export function openJob(dir) {
  const root = resolve(dir);
  refuseRepositoryRoot(root);
  if (!existsSync(join(root, "job.json"))) throw new Refusal(`${root} is not a job folder (no job.json) — make one with: mg init <dir>`);
  const stated = readJson(join(root, "job.json"));
  checkFormats(stated.formats);
  if (!(stated.fps > 0)) throw new Refusal('job.json: "fps" must be a number');
  return { dir: root, title: stated.title ?? "", formats: stated.formats, fps: stated.fps, lufs: stated.lufs ?? null, checks: stated.checks ?? {}, page: join(root, "page/index.html") };
}

/**
 * The files of the job at `home` under `path`, each as [its place in a job, the real file it is read
 * from]: a link is taken for what it really leads to, a folder for every file in it, except the names
 * `leave` keeps out of its own listing. Refused when a path leads out of the job or to nothing, back
 * into a folder it stands in, or to what is neither a file nor a folder — a pipe would be waited on for ever.
 */
function filesOf(home, path, place, leave = () => false, through = []) {
  if (!staysInside(home, path)) throw new Refusal(`${path} leads out of ${home}, or to nothing, through a link; a round takes nothing from outside the job it starts from`);
  const real = realpathSync(path), found = statSync(real);
  if (found.isFile()) return [[place, real]];
  if (!found.isDirectory()) throw new Refusal(`${path} is neither a file nor a folder`);
  if (through.includes(real)) throw new Refusal(`${path} leads back into a folder it stands in`);
  return readdirSync(real).filter((name) => !leave(name, join(path, name))).flatMap((name) => filesOf(home, join(path, name), join(place, name), undefined, [...through, real]));
}

/**
 * What a round takes from `source`, an open job: { carried, left } — every file it carries as [its
 * place in the new job, the real file it is read from], and what stays behind, as places in the job.
 */
function roundOf(source) {
  const carried = [], left = [], made = madeIn(source);
  const placed = (path, place) => (lstatSync(path).isDirectory() ? `${place}/` : place);
  for (const name of readdirSync(source.dir).sort()) {
    const path = join(source.dir, name);
    if (!CARRIED.includes(name)) left.push(placed(path, name));
    else carried.push(...filesOf(source.dir, path, name, (child, at) => {
      if (name === "page" && LINKED.includes(child) && lstatSync(at).isSymbolicLink()) return true; // the new job is given links of its own
      if (!made[name]?.has(child)) return false;
      left.push(placed(at, `${name}/${child}`));
      return true;
    }));
  }
  return { carried, left };
}

/**
 * The next round of a film: a job laid out in `dir` from `source`, an open job, which is only read.
 * The page is given its libraries — its own from page/lib, and the skill's helpers where it has none
 * of that name. Refused, with nothing laid out, when the two folders lie one inside the other, when a
 * file the round would carry is not really the job's (`filesOf`), or when the page loads a library
 * neither holds. Returns { job, left }: the new job, opened, and what of `source` stayed behind.
 */
export function layOutRound(dir, source) {
  const root = resolve(dir);
  if (staysInside(source.dir, root) || (existsSync(root) && staysInside(root, source.dir)))
    throw new Refusal(`${root} and ${source.dir} lie one inside the other: a round is laid out beside the job it starts from, which it never changes`);
  const { carried, left } = roundOf(source);
  const absent = [...readFileSync(source.page, "utf8").matchAll(LOADS_FROM_LIB)].map((found) => found[1])
    .find((name) => !carried.some(([place]) => place === join("page/lib", name)) && !existsSync(join(TEMPLATES, "lib", name)));
  if (absent) throw new Refusal(`${source.page} loads lib/${absent}, which neither ${join(source.dir, "page/lib")} nor the skill's helpers hold: the round's page could not draw`);
  const job = layOutJob(root, readJson(join(source.dir, "job.json")), readFileSync(source.page, "utf8"));
  for (const [place, real] of carried) {
    const to = insideJob(job.dir, place);
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(real, to);
  }
  return { job, left };
}

/** The formats a command was asked for: the job's first when none is named, every one for "all". */
export function formatsNamed(job, name) {
  if (name === undefined) return [job.formats[0]];
  if (name === "all") return job.formats;
  const format = job.formats.find((f) => f.name === name);
  if (!format) throw new Refusal(`no format "${name}" in job.json (it has: ${job.formats.map((f) => f.name).join(", ")})`);
  return [format];
}

/**
 * window.FILM as the page's timing block states it — with the texts it shows (TEXTS) and the joins it draws
 * by two layers (JOINS) when it states them. The block is run on its own: it touches no DOM.
 */
export function readFilm(pageFile) {
  if (!existsSync(pageFile)) throw new Refusal(`${pageFile} is not there`);
  const block = readFileSync(pageFile, "utf8").match(/<script>([\s\S]*?)<\/script>/);
  if (!block) throw new Refusal(`${pageFile}: no timing block (the first <script>)`);
  const window = {};
  try {
    vm.runInNewContext(block[1], { window }, { timeout: 2000 });
  } catch (e) {
    throw new Refusal(`${pageFile}: the timing block does not run on its own: ${e.message}`);
  }
  const film = window.FILM ?? {};
  const whole = [film.W, film.H, film.FPS, film.TOTAL].every((n) => typeof n === "number" && n > 0);
  const events = Array.isArray(film.EVENTS) && film.EVENTS.every((e) => typeof e.name === "string" && typeof e.t === "number");
  if (!whole || !events || typeof film.BEATS !== "object")
    throw new Refusal(`${pageFile}: window.FILM must be { W, H, FPS, TOTAL, BEATS: { name: seconds }, EVENTS: [{ name, t }] }`);
  // Through JSON: plain data of this realm, not objects of the block's own; a figure JSON cannot carry (NaN, Infinity) arrives as null.
  return JSON.parse(JSON.stringify({ W: film.W, H: film.H, FPS: film.FPS, TOTAL: film.TOTAL, BEATS: film.BEATS, EVENTS: film.EVENTS, TEXTS: film.TEXTS, JOINS: film.JOINS }));
}

// ── A film's file name says which master it is: <title>-<format>[-<n>x][-<n>fps].mp4, or .mov for a
// transparent one. `mg render` writes the name and `mg verify` reads the master back from it.
const slug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "film";

export function filmName(job, { format, scale, fps, alpha }) {
  return `${slug(job.title)}-${format.name}${scale > 1 ? `-${scale}x` : ""}${fps !== job.fps ? `-${fps}fps` : ""}.${alpha ? "mov" : "mp4"}`;
}

export function masterOf(job, fileName) {
  for (const format of job.formats) {
    const stem = `${slug(job.title)}-${format.name}`;
    if (!fileName.startsWith(stem)) continue;
    const rest = fileName.slice(stem.length).match(new RegExp(`^${MASTER_MARKS}\\.(mp4|mov)$`));
    if (rest) return { format, scale: Number(rest[1] ?? 1), fps: Number(rest[2] ?? job.fps), alpha: rest[3] === "mov" };
  }
  return null;
}
