// dxb-motion-graphics — the storyboard board: board/board.json → board/board.html → board/board.png.
// The page is photographed by the system Chrome, headless and at its full height: a board is as tall
// as its shots make it, and HyperFrames' own stills are cut to a film's fixed frame. Once the job's
// page can be drawn, each shot carries the film's own frame at its middle, in the format the board is of.
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { Refusal, TEMPLATES, insideJob, isStarterPage, readFilm, readJson, replaceBlock } from "./job.mjs";
import { takeStills } from "./picture.mjs";

const CHROME = "/usr/bin/google-chrome";
const WIDTH = 1600, DENSITY = 2; // the board is 1600 CSS px wide, photographed at two pixels to one
const DRAWS_FRAMES = "shot.still"; // what a board page reads when it draws a shot's frame; one laid out before 2026-11-12 does not

/** A format as a board's head states it. */
export const formatLine = (job, format) => `${format.name} · ${format.w}×${format.h} · ${job.fps} fps`;

export function readBoard(job) {
  const board = readJson(join(job.dir, "board/board.json"));
  if (!Array.isArray(board.shots) || !board.shots.length) throw new Refusal('board/board.json: "shots" must list at least one shot');
  return board;
}

/** Writes a board — board.json's own when none is given — into the board page, made from the template when the job has none. */
export function writeBoardPage(job, board = readBoard(job)) {
  const page = insideJob(job.dir, "board/board.html");
  const html = readFileSync(existsSync(page) ? page : join(TEMPLATES, "board.html"), "utf8");
  // "<" is written as its JSON escape so no text of the board can close the script block it sits in.
  const data = JSON.stringify(board, null, 2).replace(/</g, "\\u003c");
  writeFileSync(page, replaceBlock(html, "board", `<script id="board" type="application/json">\n${data}\n</script>\n`, "board/board.html"));
}

/**
 * The film's frame at the middle of each shot, in one format: { stills } — for each shot its still's
 * path from the job folder, none for a shot whose middle lies outside the film — or { why } when the
 * board gets no frames: its page cannot show them, the film's page is still the starter, or it cannot be drawn yet.
 */
function shotFrames(tools, job, format, shots) {
  const page = join(job.dir, "board/board.html");
  if (existsSync(page) && !readFileSync(page, "utf8").includes(DRAWS_FRAMES))
    return { why: "board/board.html was laid out before a board carried the film's frames and cannot show them — remove it, and mg board lays a new one out" };
  try {
    if (isStarterPage(job)) return { why: "page/index.html is still the starter mg init laid out, not this job's film" };
    const total = readFilm(job.page).TOTAL;
    const middles = shots.map((shot) => +((Number(shot.from) + Number(shot.to)) / 2).toFixed(3));
    const inside = [...new Set(middles.filter((t) => t >= 0 && t <= total))];
    const files = inside.length ? takeStills(tools, job, format, inside) : [];
    return { stills: middles.map((t) => (inside.includes(t) ? relative(job.dir, files[inside.indexOf(t)]) : undefined)) };
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    return { why: e.message };
  }
}

/**
 * Draws the board of one format — board/board.png for the job's first, board/board-<format>.png for
 * another — and returns { png, shots, framed, why }: how many shots there are, how many carry the
 * film's frame, and why none does when none could be taken.
 */
export function drawBoard(tools, job, format) {
  const board = readBoard(job), { stills = [], why } = shotFrames(tools, job, format, board.shots);
  // What the page is given beyond board.json: the format this board is of, its frame's size, each shot's still.
  writeBoardPage(job, { ...board, format: formatLine(job, format), frame: { w: format.w, h: format.h }, shots: board.shots.map((shot, i) => ({ ...shot, still: stills[i] })) });
  const page = pathToFileURL(join(job.dir, "board/board.html")).href;
  const png = insideJob(job.dir, format === job.formats[0] ? "board/board.png" : `board/board-${format.name}.png`);
  const profile = mkdtempSync(join(tmpdir(), "mg-chrome-")); // its own profile: never the one a person has open
  const chrome = (args) => tools.run(CHROME, ["--headless=new", "--no-first-run", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${profile}`, ...args, page]);
  try {
    // The page states its own height once it is laid out; the photograph is then taken at exactly that.
    const laidOut = chrome([`--window-size=${WIDTH},900`, "--dump-dom"]);
    const height = Number(String(laidOut.out).match(/data-board-height="(\d+)"/)?.[1]);
    if (!(height > 0)) throw new Refusal(`Chrome (${CHROME}) did not lay the board out: ${laidOut.err.trim().split("\n").pop()}`);
    rmSync(png, { force: true });
    const taken = chrome([`--window-size=${WIDTH},${height}`, `--force-device-scale-factor=${DENSITY}`, `--screenshot=${png}`]);
    if (!existsSync(png)) throw new Refusal(`Chrome (${CHROME}) wrote no ${png}: ${taken.err.trim().split("\n").pop()}`);
    return { png, shots: board.shots.length, framed: stills.filter(Boolean).length, why };
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
}
