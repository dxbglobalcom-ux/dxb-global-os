// B56 — THE GROUND BECOMES ROWS, AND A QUOTE THAT IS NOT IN THE BODY CANNOT BECOME ONE.
//
// WHY. The deep answer the CEO rejected on 2026-09-24 had X 0 · YouTube 0 · Reddit 12 of 22 sources,
// while its own ground held 294 X addresses and 150 X posts with their full text. The hunters wrote
// their quotes into prose and nothing ever checked a quote against a page. Plan v2 takes the quote
// out of the model's hands: scripts/evidence.py writes every row itself — from the ground's raw files
// and from the pages it reads — and `add` refuses a quote that is not in the cached body.
//
// Every case runs the REAL evidence.py on a copy of a fixture run cut from that rejected run's own
// ground (fixtures/evidence/run-ground: three posts of twitter.raw, three of reddit.raw, two of
// youtube.raw, two of hackernews.raw, its broken tavily.raw, one page). The one FETCH-LOG entry that
// did not open is constructed in fetch.py's own shape — none failed that night. No network: a reader
// call is answered by a stand-in `opencli` (fixtures/evidence/reddit-read.yaml is a real `opencli
// reddit read` answer from the same run), and the hidden Chrome's port is 1, where nothing listens.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DEAD_HIDDEN_PORT, SKILL } from "./engine-copy.js";

const FIX = join(dirname(resolve(import.meta.filename)), "fixtures", "evidence");
const EVIDENCE = join(SKILL, "scripts", "evidence.py");
const SCHEMA = JSON.parse(readFileSync(join(SKILL, "schemas", "evidence_row.schema.json"), "utf8"));
const THREAD = "https://www.reddit.com/r/ClaudeAI/comments/1wanm8p/fable_51_vs_gpt6_astra_for_2d_sprites/";
// evidence.py puts the skill's own opencli door (bin/opencli) first on PATH; that door hands a
// stand-in straight through, so this script answers every reader call, offline
const STUB = `#!/bin/sh
[ -n "$DXB_STUB_OUT" ] && cat "$DXB_STUB_OUT"
[ -n "$DXB_STUB_ERR" ] && printf '%s\\n' "$DXB_STUB_ERR" >&2
exit "\${DXB_STUB_RC:-0}"
`;

let root = "";
let run = "";
let bin = "";
beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "dxb-b56-evidence-"));
  run = join(root, "run");
  cpSync(join(FIX, "run-ground"), run, { recursive: true });
  bin = join(root, "bin");
  mkdirSync(bin);
  writeFileSync(join(bin, "opencli"), STUB);
  chmodSync(join(bin, "opencli"), 0o755);
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

function ev(args: string[], env: Record<string, string> = {}): { out: string; err: string; code: number } {
  const r = spawnSync("python3", [EVIDENCE, ...args], {
    encoding: "utf8", timeout: 120_000,
    env: { ...process.env, ...env, PATH: `${bin}:${process.env.PATH}`, DXB_HIDDEN_PORT: DEAD_HIDDEN_PORT,
      PYTHONDONTWRITEBYTECODE: "1" },
  });
  return { out: r.stdout ?? "", err: r.stderr ?? "", code: r.status ?? 1 };
}
const sha = (s: string | Buffer) => createHash("sha256").update(s).digest("hex");
const rows = (): Record<string, any>[] =>
  readFileSync(join(run, "evidence.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const fileSha = () => sha(readFileSync(join(run, "evidence.jsonl")));
const bodyOf = (canon: string) => readFileSync(join(run, "bodies", `${sha(canon)}.txt`), "utf8");

describe("from-ground — the ground's raw files and pages become rows", () => {
  it("posts that carry their words become evidence with the body cached; headlines are discovery", () => {
    const r = ev(["from-ground", run]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toMatch(/^raw=twitter items=3 body=3 \(text\)$/m);
    expect(r.out).toMatch(/^raw=reddit items=3 body=2 \(selftext\)$/m);
    expect(r.out).toMatch(/^platform=x found=\d+ body=3$/m);
    const all = rows();
    expect(all.filter((x) => x.platform === "x" && x.kind === "evidence")).toHaveLength(3);
    // the raw's folded `>-` block is decoded, not copied: the fold between two lines is one space
    const thread = all.filter((x) => x.url_canonical === "https://reddit.com/r/claudeai/comments/1wanm8p");
    expect(thread, "the page and the raw carry the same thread: one row").toHaveLength(1);
    expect(bodyOf(thread[0].url_canonical)).toContain("16 key poses; Fable delivered 992 frames");
    expect(all.find((x) => x.url_canonical.endsWith("/comments/1wfaf7f"))?.kind).toBe("evidence");
    expect(all.filter((x) => x.platform === "reddit" && x.kind === "discovery" && x.channel === "reddit")).toHaveLength(1);
    expect(all.filter((x) => x.platform === "youtube").every((x) => x.kind === "discovery")).toBe(true);
    // twitter.com/<user>/status/N from hackernews.raw is x.com/i/status/N
    expect(all.find((x) => x.url_canonical === "https://x.com/i/status/2097377692966633952")?.platform).toBe("x");
    // the page the ground could not open is a closed door, not a silence
    const quora = all.find((x) => x.url_canonical === "https://quora.com/Which-is-better-for-coding-GPT-6-Astra-or-Claude-Fable-5-1");
    expect(quora?.liveness).toBe("blocked");
    expect(quora?.notes).toMatch(/scrapling -> scrapling-stealth -> jina-reader/);
    // tavily.raw was judged a wall page by the sweep's one judge: nothing in it is an address
    expect(all.some((x) => /tavily\.com/.test(x.url))).toBe(false);
  });

  it("every row carries the schema's required keys, a valid id, its enums, and a passage hash that holds", () => {
    const props = SCHEMA.properties;
    for (const x of rows()) {
      for (const k of SCHEMA.required) expect(x[k], `${x.id} ${k}`).toBeTruthy();
      expect(x.id).toMatch(new RegExp(props.id.pattern));
      for (const k of ["kind", "source_type", "liveness"]) expect(props[k].enum).toContain(x[k]);
      if (x.kind === "evidence") {
        expect(sha(x.passage), x.id).toBe(x.passage_sha256);
        expect(x.bytes).toBeGreaterThan(0);
      }
    }
  });

  it("is idempotent: a second run adds nothing and leaves the file byte for byte", () => {
    const before = fileSha();
    const r = ev(["from-ground", run]);
    expect(r.out).toMatch(/satir: \+0 yeni · 0 govdeyle/);
    expect(fileSha()).toBe(before);
  });
});

describe("add — a quote becomes a row only when it is in the body", () => {
  it("a true quote becomes one row: a curly apostrophe and a line break are the same text", () => {
    const n0 = rows().length;
    const r = ev(["add", run, "--url", THREAD, "--quote", "The game doesn’t exist yet I\n am starting with sprites"]);
    expect(r.code, r.out).toBe(0);
    expect(r.out.trim()).toMatch(/^L\d{4}$/);
    expect(rows()).toHaveLength(n0 + 1);
    const row = rows().at(-1)!;
    expect(row).toMatchObject({ id: r.out.trim(), kind: "evidence", tool: "evidence.py add", author: "bobo-the-merciful" });
    expect(row.passage).toBe("The game doesn't exist yet I am starting with sprites");
    expect(row.passage_sha256).toBe(sha(row.passage));
  });

  it("a body that evidence.py did not cache is REFUSED — planted, or swapped under a fetched row", () => {
    // the B56 verifier planted a body and quoted it; a body file alone proves nothing
    const plant = (canon: string, text: string) => writeFileSync(join(run, "bodies", `${sha(canon)}.txt`), text);
    const fake = "Sam Altman said Fable 5.1 is finished.";
    const cases: [string, string][] = [
      ["https://example.org/no-row-at-all", "https://example.org/no-row-at-all"],                   // no row
      ["https://www.youtube.com/watch?v=WfJPBVXPt8k", "https://youtube.com/watch?v=WfJPBVXPt8k"],     // a headline row
      ["https://x.com/i/status/2097463743987007528", "https://x.com/i/status/2097463743987007528"],   // a ground body, swapped
    ];
    for (const [url, canon] of cases) {
      plant(canon, fake);
      const before = fileSha();
      const r = ev(["add", run, "--url", url, "--quote", "Fable 5.1 is finished"]);
      expect(r.code, `${url}: ${r.out}`).toBe(2);
      expect(r.out).toBe(`REFUSED body not fetched by evidence.py: ${url}\n`);
      expect(fileSha()).toBe(before);
    }
  });

  it("an altered quote is REFUSED and the file is byte-identical", () => {
    const before = fileSha();
    const r = ev(["add", run, "--url", THREAD, "--quote", "The game already exists and I am starting with maps"]);
    expect(r.code).toBe(2);
    expect(r.out).toMatch(/^REFUSED quote not in body: https:\/\/www\.reddit\.com\//m);
    expect(fileSha()).toBe(before);
  });
});

describe("fetch — a page is read by its platform's reader, or its closed door is written down", () => {
  const CLOSED = { DXB_STUB_RC: "1", DXB_STUB_ERR: "ok: false\nerror:\n  code: AUTH_REQUIRED\n  message: stand-in door closed" };

  it("a door that does not open on an address with no body: KAPALI KAPI, exit 3, the row says blocked", () => {
    const url = "https://x.com/i/status/2097377692966633952";   // hackernews.raw's link: a headline, no body
    const r = ev(["fetch", run, "--url", url], CLOSED);
    expect(r.code, r.out).toBe(3);
    expect(r.out).toMatch(new RegExp(`^KAPALI KAPI ${url} opencli twitter thread kod 1: AUTH_REQUIRED: stand-in door closed`, "m"));
    const row = rows().find((x) => x.url_canonical === url)!;
    expect(row.liveness).toBe("blocked");
    expect(row.notes).toMatch(/AUTH_REQUIRED: stand-in door closed · son kapi/);
  });

  it("a refetch that fails on a body already cached keeps the body and the row alive, the failure in notes", () => {
    // the lead's ruling of 2026-09-26: the ground's text of this post is not lost to a closed door
    const url = "https://x.com/i/status/2096973765326582023";   // twitter.raw's post: its text is cached
    const before = rows().find((x) => x.url_canonical === url)!;
    const body = bodyOf(url);
    const r = ev(["fetch", run, "--url", url], CLOSED);
    expect(r.code, r.out).toBe(3);
    expect(r.out).toMatch(new RegExp(`^KAPALI KAPI ${url} opencli twitter thread kod 1: AUTH_REQUIRED`, "m"));
    const row = rows().find((x) => x.url_canonical === url)!;
    expect(row).toMatchObject({ liveness: "alive", kind: "evidence", bytes: before.bytes, passage: before.passage });
    expect(row.notes).toMatch(/^refetch failed: opencli twitter thread kod 1: AUTH_REQUIRED: stand-in door closed/);
    expect(bodyOf(url)).toBe(body);
  });

  it("a reader that answers: OK, the posts' decoded words cached, and a reply's quote is its author's", () => {
    const url = "https://www.reddit.com/r/OpenAI/comments/1w6gl6t/welcome_to_the_agi_era/";
    const r = ev(["fetch", run, "--url", url], { DXB_STUB_OUT: join(FIX, "reddit-read.yaml") });
    expect(r.code, r.out).toBe(0);
    expect(r.out).toMatch(/^OK L\d{4} \d+B .*\/bodies\/[0-9a-f]{64}\.txt$/m);
    const body = bodyOf("https://reddit.com/r/openai/comments/1w6gl6t");
    expect(body).toContain("### reddit_is_kayfabe · - · L1");
    expect(body).toContain("Yeah, it's time to move to ASI talk"); // the file said it''s
    const q = ev(["add", run, "--url", url, "--quote", "Yeah, it's time to move to ASI talk"], { DXB_HUNTER: "forums" });
    expect(q.code, q.out).toBe(0);
    expect(rows().at(-1)).toMatchObject({ author: "reddit_is_kayfabe", hunter: "forums", platform: "reddit" });
  });

  it("the body names who said it: --author cannot put words in another mouth", () => {
    const url = "https://www.reddit.com/r/OpenAI/comments/1w6gl6t/welcome_to_the_agi_era/";
    const r = ev(["add", run, "--url", url, "--quote", "Y'all need to stop with the AGI talk", "--author", "Sam Altman"]);
    expect(r.code, r.out + r.err).toBe(0);
    expect(r.out.trim()).toMatch(/^L\d{4}$/);                       // stdout stays the id alone
    expect(r.err).toContain("not: yazar gövdeden alındı");
    expect(rows().at(-1)).toMatchObject({ id: r.out.trim(), author: "Flaxseed4138" });
  });
});

describe("platform-of — one classifier, the contract's names", () => {
  const cases: [string, string][] = [
    ["https://t.co/eNVVNLk9r4", "x"], ["https://twitter.com/andonlabs/status/1", "x"],
    ["https://support.x.com/articles/1", "web"], ["https://youtu.be/grB2CXh7rPo", "youtube"],
    ["https://www.tiktok.com/@u/video/7", "tiktok"], ["https://tr.linkedin.com/posts/a-1", "linkedin"],
    ["https://v.redd.it/i6c2ojunmaoh1", "web"], ["https://www.rednote.com/explore/1", "chinese"],
    ["https://news.ycombinator.com/item?id=49586814", "hackernews"], ["https://bsky.app/profile/a", "bluesky"],
  ];
  it.each(cases)("%s → %s", (url, want) => {
    expect(ev(["platform-of", url]).out.trim()).toBe(want);
  });
});
