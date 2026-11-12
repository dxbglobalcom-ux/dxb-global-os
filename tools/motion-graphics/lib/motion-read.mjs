// dxb-motion-graphics — the motion reading. A rendered film is watched as motion by a second reader
// that has not seen its builder's reasoning — the Gemini API, shown ten frames a second — and held to
// the storyboard. The film is uploaded once, the question names the frame the film was composed for
// and the board's shots, and the reading is written into out/. Only a film of the job is sent: a file
// that really lies in the job folder, and in which ffprobe finds a picture. The key goes into a request
// header and nowhere else: it is never printed and never written, and whatever the reader says back, or
// is thrown while it is asked, crosses one boundary (`readerOf`) that takes the key out of it.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import http from "node:http";
import https from "node:https";
import { homedir } from "node:os";
import { basename, extname, join } from "node:path";
import { readBoard } from "./board.mjs";
import { REPOSITORY, Refusal, formatBySize, insideJob, readJson, staysInside, writeJson } from "./job.mjs";
import { probe } from "./verify.mjs";

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
const NO_KEY = "<the key>"; // what stands where the key was said
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

/** A value with the key taken out of every text in it: a string, or what JSON holds of them, the names of fields included. */
function withoutKey(key, value) {
  if (typeof value === "string") return value.replaceAll(key, NO_KEY);
  if (Array.isArray(value)) return value.map((item) => withoutKey(key, item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([name, held]) => [withoutKey(key, name), withoutKey(key, held)]));
  return value;
}

/**
 * The reader, and the one boundary the key is kept behind: { ask, clean }. The key is held in here alone.
 * `ask(url, options)` sends the request with the key in its header and returns the answer's JSON. What
 * it returns has the key taken out — out of the answer's text before it is read, and out of every string
 * of the JSON after: a key written in JSON's escapes is the key again once parsed. What it throws is
 * thrown as a new error of the same kind, the key out of its message and its trace, carrying nothing
 * else of the old one: a network library's error may hold the request's headers.
 * `clean(value)` does the same to what the caller joins of an answer or reads back from a file: two
 * texts set side by side can spell what neither carries.
 * A 503 is asked again; any other refusal stops the command in the API's own words — and a spent day's
 * quota in ours, with the models that are left.
 */
function readerOf({ http, wait }, key, model) {
  const clean = (value) => withoutKey(key, value);
  const said = (text) => text.slice(0, 300);
  const sayable = (thrown) => {
    const error = new (thrown instanceof Refusal ? Refusal : Error)(clean(String(thrown?.message ?? thrown)));
    if (typeof thrown?.stack === "string") error.stack = clean(thrown.stack);
    return error;
  };
  const answered = async (url, { headers, ...options } = {}) => {
    for (let tries = 1; ; tries++) {
      const answer = clean(await http(url, { ...options, headers: { "x-goog-api-key": key, ...headers }, timeoutMs: ANSWER_MINUTES * 60_000 }));
      if (answer.status === 503 && tries < BUSY.tries) {
        await wait(BUSY.apart);
        continue;
      }
      if (answer.status === 429 && NAMES_THE_DAY.test(answer.text))
        throw new Refusal(`the day's quota of ${model} is spent: the free key allows each model ${REQUESTS_A_DAY} requests a day. Another model reads the film: --model ${READERS.filter((other) => other !== model).join(" | ")}`);
      if (answer.status !== 200) throw new Refusal(`HTTP ${answer.status} ${said(answer.text)}`);
      try {
        return clean(JSON.parse(answer.text));
      } catch {
        throw new Refusal(`the reader's answer is not JSON: ${said(answer.text)}`);
      }
    }
  };
  return { ask: (url, options) => answered(url, options).catch((thrown) => Promise.reject(sayable(thrown))), clean };
}

// An upload's address is the reader's own: files/<id> under its API — as the first film's upload was
// answered (measured 2026-11-12) — and no other host, no path that climbs.
const isOwnAddress = (file) => /^files\/[\w-]+$/.test(file?.name) && file.uri === `${API}/v1beta/${file.name}`;

/**
 * The film at the reader: { name, uri }. It is sent once — the upload's address is kept at `keptAt`
 * with the file's path and the time it was written, and a film that is still that file is not sent again.
 * An address that is not the reader's own is never used: answered with one the upload is refused, and
 * a kept one is not believed — the film is sent again.
 */
async function uploadOf({ ask, clean }, film, keptAt) {
  const written = [film, statSync(film).mtimeMs];
  const kept = existsSync(keptAt) ? clean(readJson(keptAt)) : null;
  if (JSON.stringify(kept?.film) === JSON.stringify(written) && isOwnAddress(kept.file)) return kept.file;
  const { file } = await ask(`${API}/upload/v1beta/files?uploadType=media`, { method: "POST", headers: { "Content-Type": FILM_TYPES[extname(film)] }, body: readFileSync(film) });
  if (!isOwnAddress(file)) throw new Refusal(`the upload was answered with no address of the reader's own (files/<id> under ${API}); nothing is asked of it`);
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
 * reading into out/motion-read-<the film's name>.txt; returns { report, characters }. The film is one
 * of the job — refused, and nothing sent, when it really lies outside the job folder or ffprobe finds
 * no picture in it. `hands` reach the reader — `http` as `request` above, `wait(seconds)` — so a test
 * answers for the network; `run` starts ffprobe.
 * @param {{ http: typeof request, wait: (seconds: number) => Promise<void>, run: (cmd: string, args: string[]) => { code: number, out: string | Buffer, err: string } }} hands
 * @param {{ dir: string }} job
 * @param {{ film: string, format: { w: number, h: number }, model: string }} asked
 * @returns {Promise<{ report: string, characters: number }>}
 */
export async function readMotion(hands, job, { film, format, model }) {
  const type = FILM_TYPES[extname(film)];
  if (!type) throw new Refusal(`${film} is not a film mg renders: .mp4 or .mov`);
  if (!staysInside(job.dir, film)) throw new Refusal(`${film} is not a film of this job: it lies outside the job folder (${job.dir}), by its own path or through a link, and nothing from outside it is sent`);
  probe(hands.run, film); // refused unless ffprobe finds a picture in it: a film is one by what it carries, not by its name
  const board = readBoard(job), reader = readerOf(hands, geminiKey(), model);
  mkdirSync(insideJob(job.dir, "out"), { recursive: true });
  const name = `motion-read-${basename(film, extname(film))}.txt`, report = insideJob(job.dir, "out", name);

  const upload = await uploadOf(reader, film, insideJob(job.dir, "out", `${name}.upload.json`));
  await waitUntilActive(reader.ask, hands.wait, upload);
  const parts = [{ file_data: { file_uri: upload.uri, mime_type: type }, video_metadata: { fps: READ_FPS } }, { text: question(format, board) }];
  const answer = await reader.ask(`${API}/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts }] }) });
  const reading = reader.clean((answer.candidates?.[0]?.content?.parts ?? []).map((part) => part.text ?? "").join(""));
  const blocked = answer.promptFeedback?.blockReason;
  if (!reading.trim()) throw new Refusal(`the answer carries no reading${blocked ? ` (blocked: ${blocked})` : ""}`);
  writeFileSync(report, `# Motion read — ${basename(film)} · ${model} · ${READ_FPS} fps · prompt tokens ${answer.usageMetadata?.promptTokenCount ?? "not stated"}\n\n${reading}\n`);
  return { report, characters: reading.length };
}
