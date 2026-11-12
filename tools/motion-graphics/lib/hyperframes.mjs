// dxb-motion-graphics — the HyperFrames version guard. One version is "good": the one every film is
// rendered with. A newer one becomes good only after it has rendered the five-second guard film — on a
// graphics card, its picture changing from second to second — and that film has passed `verify`; until
// then, and after any failure, the previous good one stays in use.
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Refusal, layOutJob, readFilm, writeJson } from "./job.mjs";
import { renderFilm } from "./picture.mjs";
import { planCues, writeSoundBlock } from "./sound.mjs";
import { failures, verifyFilms } from "./verify.mjs";

const FIRST_GOOD = "0.9.38"; // the version the bench measured on 2026-11-12
// The guard's own sound: one short tick whose loudest instant is 100 ms into the file.
const TICK = "aevalsrc=0.7*sin(2*PI*1000*t)*exp(-pow((t-0.1)/0.01\\,2)):s=48000:d=0.4";
const CHANGED = 32; // of 255: a pixel this much lighter or darker has changed; the codec's own noise stays far below it

const stateDir = () => process.env.DXB_MG_STATE || join(homedir(), ".local/state/dxb/motion-graphics");
const stateFile = () => join(stateDir(), "hyperframes.json");

export function goodVersion() {
  return existsSync(stateFile()) ? JSON.parse(readFileSync(stateFile(), "utf8")).good : FIRST_GOOD;
}

/** npm's latest HyperFrames version, or null when npm does not answer. Asked from the state folder, never a repository. */
export function latestVersion(run) {
  mkdirSync(stateDir(), { recursive: true });
  const asked = run("npm", ["view", "hyperframes", "version"], { cwd: stateDir() });
  const version = String(asked.out).trim();
  return asked.code === 0 && /^\d+\.\d+\.\d+$/.test(version) ? version : null;
}

/** One HyperFrames call: the pinned version, telemetry off, from inside the job folder — never a repository's root. */
export function hyperframes(run, job, version, args) {
  const called = run("npx", ["--yes", `hyperframes@${version}`, ...args], { cwd: job.dir, env: { HYPERFRAMES_NO_TELEMETRY: "1" } });
  return { code: called.code, text: String(called.out) + String(called.err) };
}

/**
 * The first second of the guard film whose picture is the same as the next second's, or null when
 * every second differs from the one before. The guard's picture never stands (its bar keeps crossing),
 * so two seconds alike mean the page was not drawn at each frame's own time.
 */
function standingSecond(run, file, { W, H }) {
  const seconds = run("ffmpeg", ["-v", "error", "-i", file, "-vf", "fps=1", "-pix_fmt", "gray", "-f", "rawvideo", "-"], { binary: true });
  const picture = W * H, count = Math.floor(seconds.out.length / picture);
  if (seconds.code !== 0 || count < 2) throw new Refusal(`ffmpeg could not read the guard film's picture: ${seconds.err.trim()}`);
  const differ = (a, b) => {
    for (let i = 0; i < picture; i++) if (Math.abs(seconds.out[a * picture + i] - seconds.out[b * picture + i]) > CHANGED) return true;
    return false;
  };
  for (let s = 0; s + 1 < count; s++) if (!differ(s, s + 1)) return s;
  return null;
}

/**
 * Renders the guard page with `version` and verifies the film; on success records it as the good
 * version and returns the film's path. The film must name a graphics card as its GL renderer, show a
 * picture that changes from second to second, and pass `verify`. Any failure is a Refusal and the
 * state file is left as it was.
 */
export function proveVersion(run, version, guardPage) {
  const film = readFilm(guardPage), dir = join(stateDir(), "guard");
  rmSync(dir, { recursive: true, force: true });
  const job = layOutJob(dir, { title: "guard", w: film.W, h: film.H, fps: film.FPS }, readFileSync(guardPage, "utf8"));
  const tick = run("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", TICK, "-c:a", "pcm_s16le", join(dir, "sound/tick.wav")]);
  if (tick.code !== 0) throw new Refusal(`ffmpeg could not make the guard's sound: ${tick.err.trim()}`);
  writeJson(join(dir, "sound/cues.json"), [{ event: film.EVENTS[0].name, file: "sound/tick.wav", align: "peak", db: -6 }]);
  writeSoundBlock(job, planCues(run, job, film));

  const made = renderFilm({ hf: (inJob, args) => hyperframes(run, inJob, version, args) }, job, { format: job.formats[0], scale: 1, fps: job.fps, alpha: false });
  if (!made.gl.length) throw new Refusal("the guard page asks for no WebGL, so its film proves no renderer; a guard film names its graphics card (mg:gl)");
  const frozen = standingSecond(run, made.file, film);
  if (frozen !== null) throw new Refusal(`the guard film shows the same picture at ${frozen} s and ${frozen + 1} s: this version does not draw each frame at its own time`);
  const [verified] = verifyFilms(run, job, [made.file]).films;
  if (!verified.ok) throw new Refusal(failures(verified).join("; "));
  writeJson(stateFile(), { good: version, previous: goodVersion(), provenAt: new Date().toISOString(), guardFilm: made.file });
  return made.file;
}
