// B43 dxb-motion-graphics (CEO 2026-11-12) — `mg motion-read`: the rendered film read as motion by a
// second reader, against the storyboard.
//
// This is the node-only part of `mg`'s tests (see motion-graphics.test.ts for the five files). The
// reader is reached over the network and the construction sandbox has none, so the test answers for it:
// no request ever leaves this file, and the key it carries is a made-up one. What is held to account is
// the request `mg` builds, what it does with a 503 and a 429, the report it writes — and that the key
// goes into a request header and nowhere else. Every expected figure is a literal.
import { existsSync, mkdtempSync, readFileSync, readdirSync, utimesSync, writeFileSync } from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { request } from "../../tools/motion-graphics/lib/motion-read.mjs";
import { FILM, film, initJob, mg, ownState } from "./motion-graphics-fixtures.js";

const KEY = "made-up-key-9f3c1a";
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
 * after that), `states` to the upload's state when it is asked for; every request is kept in `asked`
 * and every wait in `waited`, and nothing is really waited for.
 */
function reader({ answers = [ANSWERED], states = ["ACTIVE"] }: { answers?: Answer[]; states?: string[] } = {}) {
  const asked: Asked[] = [], waited: number[] = [];
  const next = <T,>(queue: T[]) => (queue.length > 1 ? queue.shift()! : queue[0]);
  const answer = async (url: string, options: Omit<Asked, "url"> = {}): Promise<Answer> => {
    asked.push({ url, ...options });
    if (url.includes("/upload/")) return json({ file: UPLOADED });
    if (url === `${API}/v1beta/${UPLOADED.name}`) return json({ ...UPLOADED, state: next(states) });
    if (url.includes(":generateContent")) return next(answers);
    throw new Error(`the test has no answer for ${url}`);
  };
  const of = (part: string) => asked.filter((a) => a.url.includes(part));
  return { asked, waited, http: answer, wait: async (seconds: number) => void waited.push(seconds), uploads: () => of("/upload/"), questions: () => of(":generateContent") };
}
const question = (a: Asked) => JSON.parse(String(a.body)).contents[0].parts;

describe("B43 dxb-motion-graphics — the film is read as motion by a second reader", () => {
  let job = "";
  const report = (name = "fixture-film-16x9") => join(job, `out/motion-read-${name}.txt`);
  const read = (hands: ReturnType<typeof reader>, ...argv: string[]) => mg(["motion-read", ...argv, "--job", job], { http: hands.http, wait: hands.wait });
  const keys = { GEMINI_API_KEY: process.env.GEMINI_API_KEY, GOOGLE_API_KEY: process.env.GOOGLE_API_KEY, DXB_MG_KEY_FILE: process.env.DXB_MG_KEY_FILE };
  beforeAll(() => {
    ownState();
  });
  beforeEach(async () => {
    // The machine's own key and env file are out of reach of every test here: only the made-up key is found.
    delete process.env.GOOGLE_API_KEY;
    process.env.GEMINI_API_KEY = KEY;
    process.env.DXB_MG_KEY_FILE = join(tmpdir(), "mg-no-such-env-file");
    job = await initJob({ more: ["--format", "9x16=360x640"] });
    writeFileSync(film(job), PICTURE);
    writeFileSync(film(job, "fixture-film-9x16.mp4"), PICTURE);
  });
  afterAll(() => {
    for (const [name, value] of Object.entries(keys)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it("uploads the format's film and asks for a reading at 10 fps against the board, waiting ten minutes for the answer", async () => {
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
    expect(Buffer.from(upload.body as Buffer).equals(PICTURE)).toBe(true);
    expect(asking.headers).toMatchObject({ "x-goog-api-key": KEY, "Content-Type": "application/json" });
    expect(asking.timeoutMs).toBe(600_000);

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

  it("reads the file it is given instead of the format's master, and refuses when there is no film yet", async () => {
    const elsewhere = join(mkdtempSync(join(tmpdir(), "mg-elsewhere-")), "an-older-cut.mp4"), older = Buffer.from("another film's bytes");
    writeFileSync(elsewhere, older);
    const hands = reader();
    expect((await read(hands, elsewhere)).code).toBe(0);
    expect(Buffer.from(hands.uploads()[0].body as Buffer).equals(older)).toBe(true);
    expect(existsSync(report("an-older-cut"))).toBe(true);

    const none = await initJob(), idle = reader();
    const r = await mg(["motion-read", "--job", none], { http: idle.http, wait: idle.wait });
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/fixture-film-16x9\.mp4 is not there.*mg render/s);
    expect(idle.asked).toEqual([]);
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

  it("keeps the upload beside the report, so the film is sent once however often the question is asked", async () => {
    const refused = reader({ answers: [DAY_SPENT] });
    expect((await read(refused)).code).not.toBe(0);
    expect(refused.uploads()).toHaveLength(1);

    const again = reader();
    expect((await read(again, "--model", "gemini-3.6-flash")).code).toBe(0);
    expect(again.uploads()).toEqual([]);
    expect(question(again.questions()[0])[0].file_data.file_uri).toBe(UPLOADED.uri);

    // Another film under the same name is another upload.
    writeFileSync(film(job), "a later render");
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
    const fine = await read(hands);
    // The API says the key back in its refusal; what `mg` prints of it does not.
    const echoing = await read(reader({ answers: [{ status: 400, text: `{"error":{"message":"API key ${KEY} not valid for this method."}}` }] }), "--format", "9x16");
    expect(echoing.code).not.toBe(0);
    expect(echoing.out).toMatch(/HTTP 400/);
    for (const printed of [fine.out, echoing.out]) expect(printed).not.toContain(KEY);
    for (const a of hands.asked) {
      expect(a.url).not.toContain(KEY);
      if (typeof a.body === "string") expect(a.body).not.toContain(KEY);
    }
    const written = readdirSync(join(job, "out")).filter((name) => name.startsWith("motion-read-"));
    expect(written.sort()).toEqual(["motion-read-fixture-film-16x9.txt", "motion-read-fixture-film-16x9.txt.upload.json", "motion-read-fixture-film-9x16.txt.upload.json"]);
    for (const name of written) expect(readFileSync(join(job, "out", name), "utf8"), name).not.toContain(KEY);
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

  it("gives up on an answer that is later than its limit, in words", async () => {
    await expect(request(`${address}/files`, { timeoutMs: 100 })).rejects.toThrow(/no answer within 0\.1 s/);
  });
});
