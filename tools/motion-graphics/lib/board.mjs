// dxb-motion-graphics — the storyboard board: board/board.json → board/board.html → board/board.png.
// The page is photographed by the system Chrome, headless and at its full height: a board is as tall
// as its shots make it, and HyperFrames' own stills are cut to a film's fixed frame.
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Refusal, TEMPLATES, insideJob, readJson, replaceBlock } from "./job.mjs";

const CHROME = "/usr/bin/google-chrome";
const WIDTH = 1600, DENSITY = 2; // the board is 1600 CSS px wide, photographed at two pixels to one

/** Writes board.json into the board page (made from the template when the job has none); returns the board. */
export function writeBoardPage(job) {
  const board = readJson(join(job.dir, "board/board.json")), page = insideJob(job.dir, "board/board.html");
  if (!Array.isArray(board.shots) || !board.shots.length) throw new Refusal('board/board.json: "shots" must list at least one shot');
  const html = readFileSync(existsSync(page) ? page : join(TEMPLATES, "board.html"), "utf8");
  // "<" is written as its JSON escape so no text of the board can close the script block it sits in.
  const data = JSON.stringify(board, null, 2).replace(/</g, "\\u003c");
  writeFileSync(page, replaceBlock(html, "board", `<script id="board" type="application/json">\n${data}\n</script>\n`, "board/board.html"));
  return board;
}

/** Draws the board into board/board.png and returns { png, shots }. */
export function drawBoard(run, job) {
  const board = writeBoardPage(job);
  const page = pathToFileURL(join(job.dir, "board/board.html")).href, png = insideJob(job.dir, "board/board.png");
  const profile = mkdtempSync(join(tmpdir(), "mg-chrome-")); // its own profile: never the one a person has open
  const chrome = (args) => run(CHROME, ["--headless=new", "--no-first-run", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${profile}`, ...args, page]);
  try {
    // The page states its own height once it is laid out; the photograph is then taken at exactly that.
    const laidOut = chrome([`--window-size=${WIDTH},900`, "--dump-dom"]);
    const height = Number(String(laidOut.out).match(/data-board-height="(\d+)"/)?.[1]);
    if (!(height > 0)) throw new Refusal(`Chrome (${CHROME}) did not lay the board out: ${laidOut.err.trim().split("\n").pop()}`);
    rmSync(png, { force: true });
    const taken = chrome([`--window-size=${WIDTH},${height}`, `--force-device-scale-factor=${DENSITY}`, `--screenshot=${png}`]);
    if (!existsSync(png)) throw new Refusal(`Chrome (${CHROME}) wrote no board.png: ${taken.err.trim().split("\n").pop()}`);
    return { png, shots: board.shots.length };
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
}
