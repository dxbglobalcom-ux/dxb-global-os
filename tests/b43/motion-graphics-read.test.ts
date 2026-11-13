// B43 dxb-motion-graphics (CEO 2026-11-12) — `mg motion-read`: the rendered film read as motion by a
// second reader, against the storyboard.
//
// This part of `mg`'s tests needs node, ffmpeg and ffprobe (see motion-graphics.test.ts for the five
// files): a film is one by what ffprobe finds in it, so the films here are real ones, made by ffmpeg. The
// reader is reached over the network and the construction sandbox has none, so the test answers for it:
// no request ever leaves this file, and the key it carries is a made-up one. What is held to account is
// which file `mg` agrees to send, the request it builds, what it does with a 503 and a 429, the report
// it writes — and that the key goes into a request header and nowhere else, whatever the reader says
// back or throws. Every expected figure is a literal.
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, utimesSync, writeFileSync } from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { inspect } from "node:util";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Refusal } from "../../tools/motion-graphics/lib/job.mjs";
import { NoAnswer, request } from "../../tools/motion-graphics/lib/motion-read.mjs";
import { FILM, editJson, film, initJob, makeFilm, mg, missingTools, ownState, sh } from "./motion-graphics-fixtures.js";

// A missing tool is said out loud and the tests that need it are skipped; they never pass in silence.
const missing = missingTools("ffmpeg", "ffprobe");
for (const tool of missing) console.error(`SKIPPED: ${tool} missing`);

const KEY = "made-up-key-9f3c1a";
// The key as JSON may spell it, every letter an escape: it is the key again once the JSON is read.
const KEY_ESCAPED = [...KEY].map((letter) => `\\u${letter.charCodeAt(0).toString(16).padStart(4, "0")}`).join("");
const API = "https://generativelanguage.googleapis.com";
const UPLOADED = { name: "files/fixture1", uri: `${API}/v1beta/files/fixture1` };
const PICTURE = Buffer.from("the bytes of a rendered film");
const READING = "The dot becomes a square at 0.8 s; no cut is seen.";

type Asked = { url: string; method?: string; headers?: Record<string, string>; body?: string | Buffer; timeoutMs?: number };
type Answer = { status: number; text: string };
const json = (value: unknown, status = 200): Answer => ({ status, text: JSON.stringify(value) });
const ANSWERED = json({ candidates: [{ content: { parts: [{ text: READING }] } }], usageMetadata: { promptTokenCount: 11475 } });
const BUSY: Answer = { status: 503, text: '{"error":{"code":503,"message":"The model is overloaded. Please try again later.","status":"UNAVAILABLE"}}' };
// The day's quota as the API names it. UNVERIFIED against a live answer: no real call is made from a test.
const DAY_SPENT = json({ error: { code: 429, status: "RESOURCE_EXHAUSTED", message: "You exceeded your current quota, please check your plan and billing details.",
  details: [{ "@type": "type.googleapis.com/google.rpc.QuotaFailure", violations: [{ quotaId: "GenerateRequestsPerDayPerProjectPerModel-FreeTier" }] }] } }, 429);
const MINUTE_SPENT = json({ error: { code: 429, status: "RESOURCE_EXHAUSTED", message: "Resource has been exhausted.",
  details: [{ "@type": "type.googleapis.com/google.rpc.QuotaFailure", violations: [{ quotaId: "GenerateRequestsPerMinutePerProjectPerModel-FreeTier" }] }] } }, 429);

/**
 * The reader answered by the test. `answers` are given to the questions in turn (the last one again
 * after that), `states` to the upload's state when it is asked for, `uploaded` is the address the
 * upload is answered with; a model named in `silent` gives no answer to a question, as the request
 * itself ends at its limit; every request is kept in `asked`, every wait in `waited` and every line
 * said aside in `asides`, and nothing is really waited for.
 */
function reader({ answers = [ANSWERED], states = ["ACTIVE"], uploaded = UPLOADED, silent = [] }: { answers?: Answer[]; states?: string[]; uploaded?: { name?: string; uri?: string }; silent?: string[] } = {}) {
  const asked: Asked[] = [], waited: number[] = [], asides: string[] = [];
  const next = <T,>(queue: T[]) => (queue.length > 1 ? queue.shift()! : queue[0]);
  const answer = async (url: string, options: Omit<Asked, "url"> = {}): Promise<Answer> => {
    asked.push({ url, ...options });
    if (url.includes("/upload/")) return json({ file: uploaded });
    if (url.startsWith(`${API}/v1beta/files/`)) return json({ ...uploaded, state: next(states) });
    if (silent.some((model) => url.includes(`/models/${model}:generateContent`))) throw new NoAnswer(`no answer within ${options.timeoutMs! / 1000} s from generativelanguage.googleapis.com`);
    if (url.includes(":generateContent")) return next(answers);
    throw new Error(`the test has no answer for ${url}`);
  };
  const of = (part: string) => asked.filter((a) => a.url.includes(part));
  return {
    asked, waited, asides, http: answer, wait: async (seconds: number) => void waited.push(seconds), aside: (line: string) => void asides.push(line),
    uploads: () => of("/upload/"), questions: () => of(":generateContent"),
  };
}
const question = (a: Asked) => JSON.parse(String(a.body)).contents[0].parts;

describe.skipIf(missing.length > 0)("B43 dxb-motion-graphics — the film is read as motion by a second reader", () => {
  let job = "", filmed = Buffer.alloc(0), filmedLater = Buffer.alloc(0); // two real films' bytes, made once
  const kept = () => readdirSync(join(job, "out")).filter((name) => name.startsWith("motion-read-")).sort();
  const report = (name = "fixture-film-16x9") => join(job, `out/motion-read-${name}.txt`);
  const read = (hands: ReturnType<typeof reader>, ...argv: string[]) => mg(["motion-read", ...argv, "--job", job], { http: hands.http, wait: hands.wait, aside: hands.aside });
  const modelsAsked = (hands: ReturnType<typeof reader>) => hands.questions().map((a) => a.url.match(/models\/(.+):generateContent$/)![1]);
  const keys = { GEMINI_API_KEY: process.env.GEMINI_API_KEY, GOOGLE_API_KEY: process.env.GOOGLE_API_KEY, DXB_MG_KEY_FILE: process.env.DXB_MG_KEY_FILE };
  beforeAll(() => {
    ownState();
    const made = mkdtempSync(join(tmpdir(), "mg-filmed-"));
    makeFilm(join(made, "a.mp4"), { seconds: 1, w: 64, h: 36 });
    makeFilm(join(made, "b.mp4"), { seconds: 2, w: 64, h: 36 });
    [filmed, filmedLater] = [readFileSync(join(made, "a.mp4")), readFileSync(join(made, "b.mp4"))];
  });
  beforeEach(async () => {
    // The machine's own key and env file are out of reach of every test here: only the made-up key is found.
    delete process.env.GOOGLE_API_KEY;
    process.env.GEMINI_API_KEY = KEY;
    process.env.DXB_MG_KEY_FILE = join(tmpdir(), "mg-no-such-env-file");
    job = await initJob({ more: ["--format", "9x16=360x640"] });
    writeFileSync(film(job), filmed);
    writeFileSync(film(job, "fixture-film-9x16.mp4"), filmed);
  });
  afterAll(() => {
    for (const [name, value] of Object.entries(keys)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it("uploads the format's film and asks for a reading at 10 fps against the board, waiting ten minutes for the upload and four for the model's answer", async () => {
    const hands = reader();
    const r = await read(hands);
    expect(r.code).toBe(0);
    expect(hands.asked.map((a) => `${a.method ?? "GET"} ${a.url}`)).toEqual([
      `POST ${API}/upload/v1beta/files?uploadType=media`,
      `GET ${API}/v1beta/files/fixture1`,
      `POST ${API}/v1beta/models/gemini-3.8-flash:generateContent`,
    ]);
    const [upload, , asking] = hands.asked;
    expect(upload.headers).toMatchObject({ "x-goog-api-key": KEY, "Content-Type": "video/mp4" });
    expect(Buffer.from(upload.body as Buffer).equals(filmed)).toBe(true);
    expect(asking.headers).toMatchObject({ "x-goog-api-key": KEY, "Content-Type": "application/json" });
    expect(upload.timeoutMs).toBe(600_000);
    expect(asking.timeoutMs).toBe(240_000);

    const [picture, words] = question(asking);
    expect(picture).toEqual({ file_data: { file_uri: UPLOADED.uri, mime_type: "video/mp4" }, video_metadata: { fps: 10 } });
    expect(words.text).toContain("3-second");
    expect(words.text).toContain("16:9");
    // The starter board, shot by shot: what holds, and how it becomes the next.
    expect(words.text).toContain("Shot 1 (0–0.45 s) The dot\n  holds: One amber dot breathes at the centre of a dark field.\n  becomes: Its corners come out as it turns: the dot becomes a square.");
    expect(words.text).toContain("Shot 3 (1.2–3 s) The line\n  holds: Five words rise onto the rule one by one; the frame keeps pushing in.\n  becomes: (the film ends)");

    expect(readFileSync(report(), "utf8")).toBe(`# Motion read — ${FILM} · gemini-3.8-flash · 10 fps · prompt tokens 11475\n\n${READING}\n`);
    expect(r.out).toContain(`mg motion-read: ${report()}`);
  });

  it("asks about a format that is not 16:9 as its own frame, and the model it is given", async () => {
    const hands = reader();
    const r = await read(hands, "--format", "9x16", "--model", "gemini-3.6-flash");
    expect(r.code).toBe(0);
    const [asking] = hands.questions();
    expect(asking.url).toBe(`${API}/v1beta/models/gemini-3.6-flash:generateContent`);
    const words = question(asking)[1].text;
    expect(words).toContain("9:16");
    expect(words).toContain("360×640");
    expect(words).toMatch(/vertical/);
    expect(words).not.toContain("16:9");
    expect(readFileSync(report("fixture-film-9x16"), "utf8")).toMatch(/^# Motion read — fixture-film-9x16\.mp4 · gemini-3\.6-flash · 10 fps/);
    expect((await read(reader(), "--model", "gemini/../other")).out).toMatch(/--model/); // a model's name goes into the address
  });

  it("reads the film of the job it is given instead of the format's master, and refuses when there is no film yet", async () => {
    const older = film(job, "an-older-cut.mp4");
    writeFileSync(older, filmedLater);
    const hands = reader();
    expect((await read(hands, older)).code).toBe(0);
    expect(Buffer.from(hands.uploads()[0].body as Buffer).equals(filmedLater)).toBe(true);
    expect(existsSync(report("an-older-cut"))).toBe(true);
    // A link that stays inside the job is a film of the job: it is the real path that is judged.
    symlinkSync(older, join(job, "refs/the-cut.mp4"));
    expect((await read(reader(), join(job, "refs/the-cut.mp4"))).code).toBe(0);

    // A master of the job, given by its path, is asked about as its own format and not as the job's first.
    const vertical = reader();
    expect((await read(vertical, film(job, "fixture-film-9x16.mp4"))).code).toBe(0);
    expect(question(vertical.questions()[0])[1].text).toContain("9:16");
    // What is no film `mg` renders is not sent.
    const notes = join(tmpdir(), "mg-notes.txt"), unsent = reader();
    writeFileSync(notes, "not a film");
    const refused = await read(unsent, notes);
    expect(refused.code).not.toBe(0);
    expect(refused.out).toMatch(/\.mp4 or \.mov/);
    expect(unsent.asked).toEqual([]);

    const none = await initJob(), idle = reader();
    const r = await mg(["motion-read", "--job", none], { http: idle.http, wait: idle.wait });
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/fixture-film-16x9\.mp4 is not there.*mg render/s);
    expect(idle.asked).toEqual([]);
  });

  it("sends nothing that is not a film of the job: no file outside it, no link that leaves it, no text named .mp4", async () => {
    const elsewhere = join(mkdtempSync(join(tmpdir(), "mg-elsewhere-")), "an-older-cut.mp4");
    writeFileSync(elsewhere, filmed); // a real film, and not this job's
    symlinkSync(elsewhere, film(job, "linked-cut.mp4"));
    symlinkSync(dirname(elsewhere), join(job, "out/linked-folder"));
    writeFileSync(film(job, "notes.mp4"), "meeting notes, whatever the name says");
    expect(sh("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "sine=frequency=440:duration=0.5", "-c:a", "aac", film(job, "sound-only.mp4")]).err).toBe("");

    const refusals: [string, RegExp][] = [
      [elsewhere, /an-older-cut\.mp4 is not a film of this job: it lies outside the job folder/],
      [film(job, "linked-cut.mp4"), /linked-cut\.mp4 is not a film of this job: it lies outside the job folder/],
      [join(job, "out/linked-folder/an-older-cut.mp4"), /an-older-cut\.mp4 is not a film of this job: it lies outside the job folder/],
      [film(job, "notes.mp4"), /ffprobe cannot read .*notes\.mp4/],
      [film(job, "sound-only.mp4"), /sound-only\.mp4 carries no picture/],
    ];
    for (const [given, why] of refusals) {
      const unsent = reader(), r = await read(unsent, given);
      expect(r.code, given).toBe(1);
      expect(r.out, given).toMatch(why);
      expect(unsent.asked, given).toEqual([]);
    }
    // The format's own master is held to the same: a link out of the job standing in its place is not sent.
    rmSync(film(job));
    symlinkSync(elsewhere, film(job));
    const unsent = reader(), r = await read(unsent);
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/fixture-film-16x9\.mp4 is not a film of this job/);
    expect(unsent.asked).toEqual([]);
    expect(kept()).toEqual([]); // no reading and no upload was recorded either
  });

  it("asks again after a 503, twenty seconds apart, and gives up after the fifth", async () => {
    const twice = reader({ answers: [BUSY, BUSY, ANSWERED] });
    expect((await read(twice)).code).toBe(0);
    expect(twice.questions()).toHaveLength(3);
    expect(twice.waited).toEqual([20, 20]);
    expect(twice.uploads()).toHaveLength(1); // the film is not sent again for it
    expect(readFileSync(report(), "utf8")).toContain(READING);

    const always = reader({ answers: [BUSY] });
    const r = await read(always, "--format", "9x16");
    expect(r.code).not.toBe(0);
    expect(always.questions()).toHaveLength(5);
    expect(r.out).toMatch(/HTTP 503/);
    expect(existsSync(report("fixture-film-9x16"))).toBe(false);
  });

  it("says plainly when the day's quota of a model is spent, and names --model and the other models", async () => {
    const hands = reader({ answers: [DAY_SPENT] });
    const r = await read(hands);
    expect(r.code).not.toBe(0);
    expect(hands.questions()).toHaveLength(1); // asking again today changes nothing
    expect(hands.waited).toEqual([]);
    expect(r.out).toMatch(/the day's quota of gemini-3\.8-flash is spent/);
    expect(r.out).toMatch(/20 requests a day/);
    for (const other of ["--model", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash"]) expect(r.out).toContain(other);
    expect(existsSync(report())).toBe(false);

    // A 429 that names no day is not called the day's quota.
    const minute = await read(reader({ answers: [MINUTE_SPENT] }));
    expect(minute.code).not.toBe(0);
    expect(minute.out).toMatch(/HTTP 429/);
    expect(minute.out).not.toMatch(/the day's quota/);
  });

  // The second film's writer met it (2026-11-13): the first two models gave no answer in ten minutes each, the third answered in under one.
  it("a model that gives no answer in its four minutes is left for the next in the list by itself; stderr says which, and the report names the one that answered", async () => {
    const hands = reader({ silent: ["gemini-3.8-flash", "gemini-3.7-flash"] });
    const r = await read(hands);
    expect(r.code).toBe(0);
    expect(modelsAsked(hands)).toEqual(["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash"]);
    expect(hands.questions().map((a) => a.timeoutMs)).toEqual([240_000, 240_000, 240_000]);
    expect(hands.uploads()).toHaveLength(1); // the film is sent once, whoever reads it
    expect(hands.waited).toEqual([]);        // and the next model is asked at once
    expect(hands.asides).toEqual([
      "mg motion-read: gemini-3.8-flash gave no answer within 240 s — gemini-3.7-flash is asked",
      "mg motion-read: gemini-3.7-flash gave no answer within 240 s — gemini-3.6-flash is asked",
    ]);
    expect(readFileSync(report(), "utf8")).toBe(`# Motion read — ${FILM} · gemini-3.6-flash · 10 fps · prompt tokens 11475\n\n${READING}\n`);
    expect(r.out).toMatch(/read by gemini-3\.6-flash against board\/board\.json/);
    expect(r.out).not.toMatch(/gave no answer/); // what is printed stays the one decisive line
  });

  // Sol found it (2026-11-13): each try was given its own 240 s, so 503s and then a silence held one model for 21 minutes.
  it("gives a model its four minutes once: its 503s, the waits between them and its silence all count in them", async () => {
    vi.useFakeTimers({ toFake: ["Date"] }); // the clock alone: every second below passes by the test's word
    try {
      const hands = reader(), pass = (ms: number) => vi.setSystemTime(Date.now() + ms);
      let busy = 4, firstAsked = 0, nextAsked = 0;
      const answer = async (url: string, options: Omit<Asked, "url"> = {}): Promise<Answer> => {
        if (url.includes("/models/gemini-3.8-flash:")) {
          firstAsked ||= Date.now();
          // Each 503 comes 50 s after its question; after four of them the model falls silent until the request's limit.
          if (busy-- > 0 && options.timeoutMs! > 50_000) {
            pass(50_000);
            return BUSY;
          }
          pass(options.timeoutMs!);
          throw new NoAnswer(`no answer within ${options.timeoutMs! / 1000} s from generativelanguage.googleapis.com`);
        }
        if (url.includes("/models/gemini-3.7-flash:")) nextAsked ||= Date.now();
        return hands.http(url, options);
      };
      const r = await mg(["motion-read", "--job", job], { http: answer, wait: async (seconds: number) => void pass(seconds * 1000), aside: hands.aside });
      expect(r.code, r.out).toBe(0);
      expect(nextAsked - firstAsked).toBeLessThanOrEqual(240_000);
      expect(readFileSync(report(), "utf8")).toMatch(/^# Motion read — fixture-film-16x9\.mp4 · gemini-3\.7-flash/);
      expect(hands.asides).toEqual(["mg motion-read: gemini-3.8-flash gave no answer within 240 s — gemini-3.7-flash is asked"]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("--model names the model asked first, and the others follow in the list's order", async () => {
    const hands = reader({ silent: ["gemini-3.6-flash", "gemini-3.8-flash"] });
    const r = await read(hands, "--model", "gemini-3.6-flash");
    expect(r.code).toBe(0);
    expect(modelsAsked(hands)).toEqual(["gemini-3.6-flash", "gemini-3.8-flash", "gemini-3.7-flash"]);
    expect(readFileSync(report(), "utf8")).toMatch(/^# Motion read — fixture-film-16x9\.mp4 · gemini-3\.7-flash · /);
  });

  it("when no model answers the command fails, with one line for each model, and no reading is written", async () => {
    const hands = reader({ silent: ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash"] });
    const r = await read(hands);
    expect(r).toEqual({ code: 1, out: [
      "mg motion-read: FAILED — no model read the film:",
      "  gemini-3.8-flash: no answer within 240 s from generativelanguage.googleapis.com",
      "  gemini-3.7-flash: no answer within 240 s from generativelanguage.googleapis.com",
      "  gemini-3.6-flash: no answer within 240 s from generativelanguage.googleapis.com",
      "  gemini-3.5-flash: no answer within 240 s from generativelanguage.googleapis.com",
      "",
    ].join("\n") });
    expect(hands.asides.at(-1)).toBe("mg motion-read: gemini-3.5-flash gave no answer within 240 s — no model is left to ask");
    expect(kept()).toEqual(["motion-read-fixture-film-16x9.txt.upload.json"]); // the upload is kept for the next try; there is no reading
  });

  it("only silence moves on: a model that refuses after a silent one stops the command, and each model has its line", async () => {
    const hands = reader({ silent: ["gemini-3.8-flash"], answers: [DAY_SPENT] });
    const r = await read(hands);
    expect(r.code).toBe(1);
    expect(modelsAsked(hands)).toEqual(["gemini-3.8-flash", "gemini-3.7-flash"]);
    const [head, first, second, ...rest] = r.out.split("\n");
    expect(head).toBe("mg motion-read: FAILED — no model read the film:");
    expect(first).toBe("  gemini-3.8-flash: no answer within 240 s from generativelanguage.googleapis.com");
    expect(second).toMatch(/^  gemini-3\.7-flash: the day's quota of gemini-3\.7-flash is spent/);
    expect(rest).toEqual([""]);
    expect(existsSync(report())).toBe(false);
  });

  it("a silence that says the key back is told aside, and printed, without it", async () => {
    const silence = reader(), hands = { ...silence, http: async (url: string, options: Omit<Asked, "url"> = {}) => {
      if (url.includes(":generateContent")) throw new NoAnswer(`no answer within 240 s — the header ${KEY} went unanswered`);
      return silence.http(url, options);
    } };
    const r = await read(hands);
    expect(r.code).toBe(1);
    expect(r.out.split("\n")[1]).toBe("  gemini-3.8-flash: no answer within 240 s — the header <the key> went unanswered");
    for (const said of [r.out, ...hands.asides]) expect(said).not.toContain(KEY);
    expect(hands.asides).toHaveLength(4);
  });

  it("keeps the upload beside the report, so the film is sent once however often the question is asked", async () => {
    const refused = reader({ answers: [DAY_SPENT] });
    expect((await read(refused)).code).not.toBe(0);
    expect(refused.uploads()).toHaveLength(1);

    const again = reader();
    expect((await read(again, "--model", "gemini-3.6-flash")).code).toBe(0);
    expect(again.uploads()).toEqual([]);
    expect(question(again.questions()[0])[0].file_data.file_uri).toBe(UPLOADED.uri);

    // Another film under the same name is another upload.
    writeFileSync(film(job), filmedLater);
    utimesSync(film(job), new Date(), new Date(Date.now() + 5000));
    const later = reader();
    expect((await read(later)).code).toBe(0);
    expect(later.uploads()).toHaveLength(1);
  });

  it("waits for the upload to be ready before it asks, and refuses one that never is", async () => {
    const slow = reader({ states: ["PROCESSING", "PROCESSING", "ACTIVE"] });
    expect((await read(slow)).code).toBe(0);
    expect(slow.asked.filter((a) => a.url.endsWith(UPLOADED.name))).toHaveLength(3);
    expect(slow.waited).toEqual([2, 2]);

    const never = reader({ states: ["PROCESSING"] });
    const r = await read(never, "--format", "9x16");
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/never became ACTIVE/);
    expect(never.questions()).toEqual([]);
    expect(never.asked.filter((a) => a.url.endsWith(UPLOADED.name))).toHaveLength(40);
  });

  it("refuses an answer that carries no reading", async () => {
    const r = await read(reader({ answers: [json({ candidates: [], promptFeedback: { blockReason: "OTHER" } })] }));
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/no reading/);
    expect(existsSync(report())).toBe(false);
  });

  it("takes the key from the daemon env file when the environment has none, and refuses without one before anything is sent", async () => {
    delete process.env.GEMINI_API_KEY;
    const envFile = join(mkdtempSync(join(tmpdir(), "mg-env-")), ".env.daemon");
    writeFileSync(envFile, '# the daemon\'s own\nOTHER=1\nexport GEMINI_API_KEY="made-up-file-key-77"\n');
    process.env.DXB_MG_KEY_FILE = envFile;
    const hands = reader();
    expect((await read(hands)).code).toBe(0);
    expect(hands.asked.map((a) => a.headers?.["x-goog-api-key"])).toEqual(Array(3).fill("made-up-file-key-77"));

    process.env.DXB_MG_KEY_FILE = join(tmpdir(), "mg-no-such-env-file");
    const keyless = reader();
    const r = await read(keyless, "--format", "9x16");
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/no Gemini key/);
    expect(keyless.asked).toEqual([]);

    process.env.GOOGLE_API_KEY = "made-up-google-key-5";
    const google = reader();
    expect((await read(google, "--format", "9x16")).code).toBe(0);
    expect(google.asked[0].headers?.["x-goog-api-key"]).toBe("made-up-google-key-5");
  });

  it("the key goes into the request header and nowhere else: not what is printed, not a file, not an address", async () => {
    const hands = reader();
    // Whatever the two runs put on the terminal past what `mg` says: the console, and the process's own two streams.
    const aside: string[] = [], keep = (...said: unknown[]) => (aside.push(said.map(String).join(" ")), true);
    const heard = [...(["log", "info", "warn", "error"] as const).map((level) => vi.spyOn(console, level)), vi.spyOn(process.stdout, "write"), vi.spyOn(process.stderr, "write")];
    for (const spy of heard) spy.mockImplementation(keep);
    const [fine, echoing] = await (async () => {
      try {
        // The API says the key back in its refusal; what `mg` prints of it does not.
        return [await read(hands), await read(reader({ answers: [{ status: 400, text: `{"error":{"message":"API key ${KEY} not valid for this method."}}` }] }), "--format", "9x16")];
      } finally {
        for (const spy of heard) spy.mockRestore();
      }
    })();
    expect(echoing.code).not.toBe(0);
    expect(echoing.out).toMatch(/HTTP 400/);
    for (const printed of [fine.out, echoing.out, ...aside]) expect(printed).not.toContain(KEY);
    for (const a of hands.asked) {
      expect(a.url).not.toContain(KEY);
      if (typeof a.body === "string") expect(a.body).not.toContain(KEY);
    }
    const written = readdirSync(join(job, "out")).filter((name) => name.startsWith("motion-read-"));
    expect(written.sort()).toEqual(["motion-read-fixture-film-16x9.txt", "motion-read-fixture-film-16x9.txt.upload.json", "motion-read-fixture-film-9x16.txt.upload.json"]);
    for (const name of written) expect(readFileSync(join(job, "out", name), "utf8"), name).not.toContain(KEY);
  });

  // The auditor's four counter-examples (Sol, 2026-11-12): the key said back where only a failed answer's text was cleaned.
  it("success-echo: a reading that says the key back is written without it", async () => {
    // Said whole, spelled in JSON's own escapes, and split over two parts that the report joins.
    const parts = [`{"text":"Your key is ${KEY}. "}`, `{"text":"Escaped: ${KEY_ESCAPED}. Split: ${KEY.slice(0, 8)}"}`, `{"text":"${KEY.slice(8)}."}`];
    const r = await read(reader({ answers: [{ status: 200, text: `{"candidates":[{"content":{"parts":[${parts.join(",")}]}}],"usageMetadata":{"promptTokenCount":7}}` }] }));
    expect(r.code).toBe(0);
    expect(readFileSync(report(), "utf8")).toBe(`# Motion read — ${FILM} · gemini-3.8-flash · 10 fps · prompt tokens 7\n\nYour key is <the key>. Escaped: <the key>. Split: <the key>.\n`);
    expect(r.out).not.toContain(KEY);
  });

  it("upload-echo: an upload answered with the key in its address, or with an address that is not the reader's own, is refused and never asked about", async () => {
    const answeredWith = [
      { name: `files/${KEY}`, uri: `${API}/v1beta/files/${KEY}` },
      { name: "files/fixture1", uri: "https://elsewhere.example/v1beta/files/fixture1" },
      { name: "files/../models/other", uri: `${API}/v1beta/files/../models/other` },
      { name: "files/fixture1" },
    ];
    for (const uploaded of answeredWith) {
      const hands = reader({ uploaded }), r = await read(hands);
      expect(r.code, uploaded.name).toBe(1);
      expect(r.out, uploaded.name).toMatch(/the upload was answered with no address of the reader's own/);
      expect(r.out).not.toContain(KEY);
      expect(hands.asked.map((a) => a.url), uploaded.name).toEqual([`${API}/upload/v1beta/files?uploadType=media`]);
      expect(kept(), uploaded.name).toEqual([]);
    }

    // A record kept by an earlier run with such an address is not believed: the film is sent again and the record written over.
    expect((await read(reader())).code).toBe(0);
    const record = join(job, "out/motion-read-fixture-film-16x9.txt.upload.json");
    for (const uploaded of answeredWith.slice(0, 2)) {
      editJson(record, (was) => { was.file = uploaded; });
      const again = reader(), r = await read(again);
      expect(r.code, uploaded.uri).toBe(0);
      expect(again.uploads(), uploaded.uri).toHaveLength(1);
      expect(question(again.questions()[0])[0].file_data.file_uri).toBe(UPLOADED.uri);
      for (const a of again.asked) expect(a.url + (typeof a.body === "string" ? a.body : "")).not.toContain(KEY);
      expect(JSON.parse(readFileSync(record, "utf8")).file).toEqual(UPLOADED);
    }
  });

  it("block-echo: a block reason that says the key back is printed without it", async () => {
    const r = await read(reader({ answers: [json({ candidates: [], promptFeedback: { blockReason: `OTHER ${KEY}` } })] }));
    expect(r.code).toBe(1);
    expect(r.out).toBe("mg motion-read: FAILED — the answer carries no reading (blocked: OTHER <the key>)\n");
    const spelled = await read(reader({ answers: [{ status: 200, text: `{"candidates":[],"promptFeedback":{"blockReason":"OTHER ${KEY_ESCAPED}"}}` }] }));
    expect(spelled).toEqual({ code: 1, out: "mg motion-read: FAILED — the answer carries no reading (blocked: OTHER <the key>)\n" });
    expect(existsSync(report())).toBe(false);
  });

  it("the mg call: whatever is thrown while the reader is asked leaves mg without the key", async () => {
    // A hand that fails the way a network library may: its error says the request's headers, and carries them.
    const failing = () => Object.assign(new Error(`socket hang up — sent x-goog-api-key: ${KEY}`), { headers: { "x-goog-api-key": KEY } });
    const thrown = await read({ ...reader(), http: async () => { throw failing(); } }).then(() => null, (e: unknown) => e);
    expect(thrown).toBeInstanceOf(Error);
    expect(thrown).not.toBeInstanceOf(Refusal); // what is no refusal still stops mg as what it is
    expect((thrown as Error).message).toBe("socket hang up — sent x-goog-api-key: <the key>");
    expect(inspect(thrown, { depth: 9, showHidden: true })).not.toContain(KEY); // its trace, and whatever else it carries

    // A refusal is printed, and what is printed is without the key; so is a thing thrown that is no error at all.
    const refused = await read({ ...reader(), http: async () => { throw new Refusal(`no answer: the header ${KEY} was not accepted`); } });
    expect(refused).toEqual({ code: 1, out: "mg motion-read: FAILED — no answer: the header <the key> was not accepted\n" });
    const bare = await read({ ...reader(), http: async () => { throw `refused ${KEY}`; } }).then(() => null, (e: unknown) => e);
    expect((bare as Error).message).toBe("refused <the key>");
    expect(kept()).toEqual([]);
  });
});

describe("B43 dxb-motion-graphics — the request itself waits as long as it is told to", () => {
  // The reader took more than 200 s over a 15 s film (measured 2026-11-12). The request is held here to a
  // server of the test's own on this machine: one that answers late, and says back what it was sent.
  let server: http.Server, address = "";
  const LATE = 400; // ms
  beforeAll(async () => {
    server = http.createServer((asked, answer) => {
      const sent: Buffer[] = [];
      asked.on("data", (chunk) => sent.push(chunk));
      asked.on("end", () => setTimeout(() => {
        answer.writeHead(asked.url === "/busy" ? 503 : 200);
        answer.end(JSON.stringify({ method: asked.method, key: asked.headers["x-goog-api-key"], length: asked.headers["content-length"], body: Buffer.concat(sent).toString() }));
      }, LATE));
    });
    await new Promise<void>((up) => server.listen(0, "127.0.0.1", up));
    address = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterEach(() => new Promise((turn) => setImmediate(turn)));
  afterAll(() => new Promise((down) => server.close(down)));

  it("sends the method, the headers and the body, and returns the status and the text", async () => {
    const answered = await request(`${address}/files`, { method: "POST", headers: { "x-goog-api-key": KEY }, body: PICTURE, timeoutMs: 5000 });
    expect(answered.status).toBe(200);
    expect(JSON.parse(answered.text)).toEqual({ method: "POST", key: KEY, length: String(PICTURE.length), body: PICTURE.toString() });
    expect((await request(`${address}/busy`, { timeoutMs: 5000 })).status).toBe(503); // a refusal is an answer, not an error
  });

  it("gives up on an answer that is later than its limit, in words — as the silence a model is left for", async () => {
    const late = await request(`${address}/files`, { timeoutMs: 100 }).then(() => null, (e: unknown) => e);
    expect(late).toBeInstanceOf(NoAnswer);
    expect((late as Error).message).toMatch(/no answer within 0\.1 s/);
    // A server that is not there is no silence: it is refused as before, and no model would be left for it.
    const unreached = await request("http://127.0.0.1:9/files", { timeoutMs: 5000 }).then(() => null, (e: unknown) => e);
    expect(unreached).toBeInstanceOf(Refusal);
    expect(unreached).not.toBeInstanceOf(NoAnswer);
  });
});
