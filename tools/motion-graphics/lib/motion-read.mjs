// dxb-motion-graphics — the motion reading. A rendered film is watched as motion by a second reader
// that has not seen its builder's reasoning — the Gemini API, shown ten frames a second — and held to
// the storyboard. The film is uploaded once, the question names the frame the film was composed for
// and the board's shots, and the reading is written into out/. The key goes into a request header and
// nowhere else: it is never printed and never written, and what the API says back is printed with the
// key taken out of it.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import http from "node:http";
import https from "node:https";
import { homedir } from "node:os";
import { basename, extname, join } from "node:path";
import { readBoard } from "./board.mjs";
import { REPOSITORY, Refusal, formatBySize, insideJob, readJson, writeJson } from "./job.mjs";

const API = "https://generativelanguage.googleapis.com";
// The models a film is read by, the first when none is named, and what the free key allows each of
// them in a day (measured 2026-11-12).
export const READERS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash"];
const REQUESTS_A_DAY = 20;
const READ_FPS = 10; // frames a second the reader is shown: the rate the holding's motion reading was measured at
export const ANSWER_MINUTES = 10; // a request is waited for this long: the reading of a 15 s film took more than 200 s (measured 2026-11-12)
const BUSY = { tries: 5, apart: 20 };  // HTTP 503: the same request again, seconds apart
const READY = { tries: 40, apart: 2 }; // an upload is asked for its state until it is ACTIVE
const FILM_TYPES = { ".mp4": "video/mp4", ".mov": "video/quicktime" };
const KEY_NAMES = ["GEMINI_API_KEY", "GOOGLE_API_KEY"];
// A 429 that names the day. UNVERIFIED against a live answer: none was kept from the day the quota was met.
const NAMES_THE_DAY = /per[ _-]?day|daily/i;

/**
 * One HTTP request, waited for as long as it is told to. It is written on node:http(s) and not on
 * fetch: fetch gives an answer's headers 300 s (undici's headersTimeout, read in its source, not
 * timed here) and a reading is given longer. A refusal by the server is an answer; no answer within
 * the limit, or no server reached, is a Refusal.
 * @param {string} url
 * @param {{ method?: string, headers?: Record<string, string>, body?: string | Buffer, timeoutMs: number }} options
 * @returns {Promise<{ status: number, text: string }>}
 */
export function request(url, { method = "GET", headers = {}, body, timeoutMs }) {
  const { protocol, host } = new URL(url);
  return new Promise((answered, failed) => {
    const stopped = (e) => failed(e instanceof Refusal ? e : new Refusal(`${host} did not answer: ${e.message}`));
    const sent = (protocol === "http:" ? http : https).request(url, { method, headers }, (answer) => {
      const text = [];
      answer.on("data", (chunk) => text.push(chunk));
      answer.on("end", () => answered({ status: answer.statusCode ?? 0, text: Buffer.concat(text).toString() }));
      answer.on("error", stopped); // the limit, or a broken line, met while the answer was still arriving
    });
    const limit = setTimeout(() => sent.destroy(new Refusal(`no answer within ${timeoutMs / 1000} s from ${host}`)), timeoutMs);
    sent.on("close", () => clearTimeout(limit));
    sent.on("error", stopped);
    sent.end(body);
  });
}

/**
 * The Gemini key: from the environment, or else from the holding's daemon env file — the one
 * DXB_MG_KEY_FILE names, or the repository's own and then the home's. Refused when there is none.
 */
function geminiKey() {
  const stated = KEY_NAMES.map((name) => process.env[name]).find(Boolean);
  if (stated) return stated;
  const files = process.env.DXB_MG_KEY_FILE ? [process.env.DXB_MG_KEY_FILE] : [join(REPOSITORY, ".env.daemon"), join(homedir(), ".config/dxb/.env.daemon")];
  for (const file of files.filter((file) => existsSync(file))) {
    const line = readFileSync(file, "utf8").match(/^[ \t]*(?:export\s+)?(?:GEMINI|GOOGLE)_API_KEY=(.*)$/m);
    const key = line?.[1].trim().replace(/^['"]+|['"]+$/g, "");
    if (key) return key;
  }
  throw new Refusal(`no Gemini key: ${KEY_NAMES.join(" or ")} is neither in the environment nor in the daemon env file`);
}

/**
 * The reader as one call: `ask(url, options)` sends the request with the key in its header and returns
 * the answer's JSON. A 503 is asked again; any other refusal stops the command in the API's own words,
 * the key taken out of them — and a spent day's quota in ours, with the models that are left.
 */
function readerOf({ http, wait }, key, model) {
  const said = (text) => text.replaceAll(key, "<the key>").slice(0, 300);
  return async (url, { headers, ...options } = {}) => {
    for (let tries = 1; ; tries++) {
      const answer = await http(url, { ...options, headers: { "x-goog-api-key": key, ...headers }, timeoutMs: ANSWER_MINUTES * 60_000 });
      if (answer.status === 503 && tries < BUSY.tries) {
        await wait(BUSY.apart);
        continue;
      }
      if (answer.status === 429 && NAMES_THE_DAY.test(answer.text))
        throw new Refusal(`the day's quota of ${model} is spent: the free key allows each model ${REQUESTS_A_DAY} requests a day. Another model reads the film: --model ${READERS.filter((other) => other !== model).join(" | ")}`);
      if (answer.status !== 200) throw new Refusal(`HTTP ${answer.status} ${said(answer.text)}`);
      try {
        return JSON.parse(answer.text);
      } catch {
        throw new Refusal(`the reader's answer is not JSON: ${said(answer.text)}`);
      }
    }
  };
}

/**
 * The film at the reader: { name, uri }. It is sent once — the upload's address is kept at `keptAt`
 * with the file's path and the time it was written, and a film that is still that file is not sent again.
 */
async function uploadOf(ask, film, keptAt) {
  const written = [film, statSync(film).mtimeMs];
  const kept = existsSync(keptAt) ? readJson(keptAt) : null;
  if (JSON.stringify(kept?.film) === JSON.stringify(written)) return kept.file;
  const { file } = await ask(`${API}/upload/v1beta/files?uploadType=media`, { method: "POST", headers: { "Content-Type": FILM_TYPES[extname(film)] }, body: readFileSync(film) });
  if (!file?.name || !file.uri) throw new Refusal("the upload was answered without the file's address");
  const upload = { name: file.name, uri: file.uri };
  writeJson(keptAt, { film: written, file: upload });
  return upload;
}

async function waitUntilActive(ask, wait, upload) {
  for (let tries = 1; (await ask(`${API}/v1beta/${upload.name}`)).state !== "ACTIVE"; tries++) {
    if (tries === READY.tries) throw new Refusal(`the upload never became ACTIVE (asked ${READY.tries} times, ${READY.apart} s apart)`);
    await wait(READY.apart);
  }
}

/** What the reader is asked: the film's length, the frame it was composed for, and the board shot by shot. */
function question({ w, h }, board) {
  const ratio = formatBySize(w, h).name.replace("x", ":"); // formatBySize names a frame by its ratio, as 16x9
  const frame = `${ratio}, a ${w > h ? "horizontal" : w < h ? "vertical" : "square"} frame composed at ${w}×${h}`;
  const shots = board.shots.map((s) => `Shot ${s.n} (${s.from}–${s.to} s) ${s.title}\n  holds: ${s.hold}\n  becomes: ${s.becomes || "(the film ends)"}`);
  return `You are reviewing a ${board.total}-second motion-graphics film (${frame}; no sound matters here). Watch it as motion, and judge the picture as that frame's own: what an edge cuts off, what is too small to read in it, what sits as if it were laid out for another frame is wrong here.

First, without reading further, write what you actually see, second by second (0.5 s steps where things change fast).

Then compare with the storyboard below and answer plainly, with times:
1. For each join between shots: does the shot visibly BECOME the next one as the board says, or does it read as a cut or a cross-fade? Say what you really saw.
2. Every line of words: quote it, say from when to when it is fully readable, and whether that is long enough to read.
3. Anything that looks wrong: a glitch, a flash, a jump, stutter, something appearing or vanishing abruptly, a shape that distorts unpleasantly, an element that covers another, a moment where nothing moves.
4. The three weakest moments of the film, and the single strongest.

STORYBOARD
${shots.join("\n")}
`;
}

/**
 * Has one film read against the job's storyboard, as the film of `format`, by `model`, and writes the
 * reading into out/motion-read-<the film's name>.txt; returns { report, characters }. `hands` reach
 * the reader — `http` as `request` above, `wait(seconds)` — so a test answers for the network.
 * @param {{ http: typeof request, wait: (seconds: number) => Promise<void> }} hands
 * @param {{ dir: string }} job
 * @param {{ film: string, format: { w: number, h: number }, model: string }} asked
 * @returns {Promise<{ report: string, characters: number }>}
 */
export async function readMotion(hands, job, { film, format, model }) {
  const type = FILM_TYPES[extname(film)];
  if (!type) throw new Refusal(`${film} is not a film mg renders: .mp4 or .mov`);
  const board = readBoard(job), ask = readerOf(hands, geminiKey(), model);
  mkdirSync(insideJob(job.dir, "out"), { recursive: true });
  const name = `motion-read-${basename(film, extname(film))}.txt`, report = insideJob(job.dir, "out", name);

  const upload = await uploadOf(ask, film, insideJob(job.dir, "out", `${name}.upload.json`));
  await waitUntilActive(ask, hands.wait, upload);
  const parts = [{ file_data: { file_uri: upload.uri, mime_type: type }, video_metadata: { fps: READ_FPS } }, { text: question(format, board) }];
  const answer = await ask(`${API}/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts }] }) });
  const reading = (answer.candidates?.[0]?.content?.parts ?? []).map((part) => part.text ?? "").join("");
  const blocked = answer.promptFeedback?.blockReason;
  if (!reading.trim()) throw new Refusal(`the answer carries no reading${blocked ? ` (blocked: ${blocked})` : ""}`);
  writeFileSync(report, `# Motion read — ${basename(film)} · ${model} · ${READ_FPS} fps · prompt tokens ${answer.usageMetadata?.promptTokenCount ?? "not stated"}\n\n${reading}\n`);
  return { report, characters: reading.length };
}
