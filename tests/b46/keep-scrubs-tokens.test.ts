// 2026-11-07 — THE KEPT ANSWER CARRIES NO SESSION TOKEN.
//
// WHY. keep.sh copies a run's answer into the repository, which is public. The viral-format answer of
// 2026-11-07 carried rednote.com addresses with `xsec_token=…` (150 in evidence.jsonl, 37 in final.html)
// and gitleaks stopped the commit. This case runs the REAL keep.sh on a run folder written here, whose
// page, rows and cached body hold such addresses in the three shapes they take (plain, HTML `&amp;`, and
// a token as the only parameter), and reads every kept file back.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { SKILL } from "./engine-copy.js";

const root = mkdtempSync(join(tmpdir(), "dxb-keep-scrub-"));
afterAll(() => rmSync(root, { recursive: true, force: true }));

const TOK = "ABCxyz0123456789tokenvalue";
const RED = `https://www.rednote.com/explore/6a1b?xsec_token=${TOK}&xsec_source=pc_search`;
const RED_HTML = `https://www.rednote.com/explore/6a1c?xsec_source=pc_search&amp;xsec_token=${TOK}`;
const ONLY = `https://cdn.example.com/v.mp4?X-Amz-Signature=${TOK}`;
const MIXED = `https://example.com/a?id=5&access_token=${TOK}&sessionid=${TOK}&page=2#top`;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

describe("keep.sh — no session token leaves the run", () => {
  it("strips token / signature / session params from every kept file, keeps the rest of each address", () => {
    const out = join(root, "run");
    mkdirSync(join(out, "bodies"), { recursive: true });
    writeFileSync(join(out, "question.txt"), "  - viral short video format research tool\n");
    writeFileSync(join(out, "answer.md"), `See ${RED} and ${MIXED}\n`);
    writeFileSync(join(out, "final.html"), `<a href="${RED_HTML}">x</a> <img src="${ONLY}">\n`);
    writeFileSync(join(out, "evidence.jsonl"), JSON.stringify({ id: "L0001", url: RED, url_canonical: RED }) + "\n");
    writeFileSync(join(out, "bodies", "abc.txt"), `body with ${MIXED}\n`);
    const answers = join(root, "answers");
    const r = spawnSync("bash", [join(SKILL, "fleet", "keep.sh"), join(out, "question.txt"), out],
      { encoding: "utf8", env: { ...process.env, DXB_RESEARCH_ANSWERS: answers } });
    expect(r.status, r.stderr + r.stdout).toBe(0);
    expect(r.stdout).toMatch(/adres temizligi: \d+ dosya okundu · 4 dosyada 9 oturum\/anahtar parametresi silindi/);
    const kept = files(answers);
    expect(kept.length).toBeGreaterThanOrEqual(5);
    for (const f of kept) {
      const t = readFileSync(f, "utf8");
      expect(t, f).not.toContain(TOK);
      expect(t, f).not.toMatch(/xsec_token|access_token|sessionid|X-Amz-Signature/);
    }
    const all = kept.map((f) => readFileSync(f, "utf8")).join("\n");
    expect(all).toContain("https://www.rednote.com/explore/6a1b?xsec_source=pc_search");
    expect(all).toContain("https://www.rednote.com/explore/6a1c?xsec_source=pc_search\"");
    expect(all).toContain("https://cdn.example.com/v.mp4\"");
    expect(all).toContain("https://example.com/a?id=5&page=2#top");
  });

  it("a site-relative link in a passage is scrubbed too, and the kept ledger still finds and fingerprints its body", () => {
    const out = join(root, "run2");
    mkdirSync(join(out, "bodies"), { recursive: true });
    writeFileSync(join(out, "question.txt"), "  - viral short video format research tool\n");
    writeFileSync(join(out, "answer.md"), "answer\n");
    const body = `profile [x](/user/profile/6a8f?channel_type=web&xsec_token=${TOK}) see ${RED}\n`;
    const shaHex = (s: string | Buffer) => createHash("sha256").update(s).digest("hex");
    writeFileSync(join(out, "bodies", `${shaHex(RED)}.txt`), body);
    const passage = `[x](/user/profile/6a8f?channel_type=web&xsec_token=${TOK})`;
    writeFileSync(join(out, "evidence.jsonl"), JSON.stringify({ id: "L0001", url: RED, url_canonical: RED,
      body_sha256: shaHex(body), bytes: Buffer.byteLength(body), passage, passage_sha256: shaHex(passage) }) + "\n");
    const answers = join(root, "answers2");
    const r = spawnSync("bash", [join(SKILL, "fleet", "keep.sh"), join(out, "question.txt"), out],
      { encoding: "utf8", env: { ...process.env, DXB_RESEARCH_ANSWERS: answers } });
    expect(r.status, r.stderr + r.stdout).toBe(0);
    expect(r.stdout).toMatch(/1 satirin govde adi\/parmak izi yenilendi/);
    const dest = join(answers, readdirSync(answers)[0]);
    const row = JSON.parse(readFileSync(join(dest, "evidence.jsonl"), "utf8"));
    expect(row.url_canonical).toBe("https://www.rednote.com/explore/6a1b?xsec_source=pc_search");
    expect(row.passage).toBe("[x](/user/profile/6a8f?channel_type=web)");
    expect(row.passage_sha256).toBe(shaHex(row.passage));
    const kept = readFileSync(join(dest, "bodies", `${shaHex(row.url_canonical)}.txt`));
    expect(kept.toString()).not.toContain(TOK);
    expect(row.body_sha256).toBe(shaHex(kept));
    expect(row.bytes).toBe(kept.length);
  });
});

// THE AUDITOR'S SEVEN SHAPES (2026-11-07, Sol): an address a token travels in is not always absolute, plain
// and `&`-joined — and a parameter whose name merely CONTAINS "token" or "session" is not a secret.
const SCRUB = join(SKILL, "scripts", "scrub-urls.py");
const scrub = (dir: string) => {
  const r = spawnSync("python3", [SCRUB, dir], { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
  return { out: r.stdout ?? "", err: r.stderr ?? "", code: r.status ?? 1 };
};
const folder = (name: string) => {
  const d = join(root, name);
  mkdirSync(join(d, "bodies"), { recursive: true });
  return d;
};

describe("scrub-urls.py — every shape a token travels in, and only real secrets", () => {
  it("removes tokens from relative, JSON-escaped, encoded-name, fragment, alt-separator, uppercase and redirect addresses", () => {
    const d = folder("shapes");
    const enc = encodeURIComponent(`https://b.test/p?token=${TOK}&q=1`);
    const lines = [
      `[a](../p?token=${TOK}) [b](./q?x=1&token=${TOK})`,
      `{"u": "https:\\/\\/example.test\\/p?token=${TOK}&x=1"}`,
      `https://a.test/p?%74oken=${TOK}&x=1`,
      `https://a.test/cb#access_token=${TOK}&expires_in=3600`,
      `https://a.test/m;token=${TOK}?x=1 https://a.test/n?x=1;token=${TOK}`,
      `<a href="https://a.test/h?x=1&#38;token=${TOK}">h</a> <a href="https://a.test/i?x=1&amp;token=${TOK}">i</a>`,
      `HTTPS://A.TEST/UP?TOKEN=${TOK}`,
      `https://a.test/r?url=${enc}`,
      `https://a.test/r2?url=${encodeURIComponent(enc)}`,
      `https://a.test/k?accessKey=${TOK}&jwt=${TOK}&hmac=${TOK}&x=1`,
    ];
    writeFileSync(join(d, "answer.md"), lines.join("\n") + "\n");
    const r = scrub(d);
    expect(r.code, r.err + r.out).toBe(0);
    const t = readFileSync(join(d, "answer.md"), "utf8");
    expect(t).not.toContain(TOK);
    expect(t).toContain("[a](../p)");
    expect(t).toContain("https:\\/\\/example.test\\/p?x=1\"");
    expect(t).toContain("https://a.test/cb#expires_in=3600");
    expect(t).toContain("https://a.test/i?x=1\"");
    expect(t).toContain(`https://a.test/r?url=${encodeURIComponent("https://b.test/p?q=1")}`);
    expect(t).toContain("https://a.test/k?x=1");
  });

  it("keeps parameters that only contain a secret's word (max_tokens, session_type, xsec_source)", () => {
    const d = folder("names");
    const u = `https://api.test/v1?max_tokens=512&session_type=web&tokenizer=bpe&keyword=viral&xsec_source=pc&token=${TOK}`;
    writeFileSync(join(d, "answer.md"), u + "\n");
    expect(scrub(d).code).toBe(0);
    expect(readFileSync(join(d, "answer.md"), "utf8"))
      .toBe("https://api.test/v1?max_tokens=512&session_type=web&tokenizer=bpe&keyword=viral&xsec_source=pc\n");
  });

  it("scans a file that is not UTF-8 instead of skipping it, and keep.sh stops on one it cannot scan", () => {
    const d = folder("binary");
    mkdirSync(join(d, "audit"));
    const bin = Buffer.concat([Buffer.from([0x00, 0x9c, 0xff, 0xfe]), Buffer.from(` https://a.test/p?token=${TOK} `), Buffer.from([0xc3, 0x28])]);
    writeFileSync(join(d, "audit", "batch.bin"), bin);
    const r = scrub(d);
    expect(r.code, r.err + r.out).toBe(0);
    const back = readFileSync(join(d, "audit", "batch.bin"));
    expect(back.toString("latin1")).not.toContain(TOK);
    expect(back.subarray(0, 4)).toEqual(bin.subarray(0, 4));            // the other bytes are untouched
    // a compressed file cannot be read for addresses: keep.sh refuses the folder, loudly
    const out = folder("keep-gz");
    writeFileSync(join(out, "question.txt"), "  - viral short video format research tool\n");
    writeFileSync(join(out, "answer.md"), "answer\n");
    mkdirSync(join(out, "audit"));
    writeFileSync(join(out, "audit", "batch.gz"), Buffer.from([0x1f, 0x8b, 0x08, 0x00, 0x01, 0x02, 0x03]));
    const k = spawnSync("bash", [join(SKILL, "fleet", "keep.sh"), join(out, "question.txt"), out],
      { encoding: "utf8", env: { ...process.env, DXB_RESEARCH_ANSWERS: join(root, "answers-gz") } });
    expect(k.status).not.toBe(0);
    expect(k.stderr).toContain("batch.gz");
    expect(k.stdout).not.toContain("cevap saklandi");
  });

  it("two addresses that become one after the scrub keep their own bodies and fingerprints", () => {
    const d = folder("collide");
    const shaHex = (s: string | Buffer) => createHash("sha256").update(s).digest("hex");
    const ua = "https://a.test/p?session=AAAAAAAA", ub = "https://a.test/p?session=BBBBBBBB";
    const ba = "the first body\n", bb = "the second, different body\n";
    writeFileSync(join(d, "bodies", `${shaHex(ua)}.txt`), ba);
    writeFileSync(join(d, "bodies", `${shaHex(ub)}.txt`), bb);
    writeFileSync(join(d, "evidence.jsonl"), [
      { id: "L0001", url: ua, url_canonical: ua, body_sha256: shaHex(ba), bytes: ba.length },
      { id: "L0002", url: ub, url_canonical: ub, body_sha256: shaHex(bb), bytes: bb.length }]
      .map((r) => JSON.stringify(r) + "\n").join(""));
    const r = scrub(d);
    expect(r.code, r.err + r.out).toBe(0);
    const rows = readFileSync(join(d, "evidence.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
    expect(JSON.stringify(rows)).not.toMatch(/AAAAAAAA|BBBBBBBB/);
    expect(rows[0].url_canonical).not.toBe(rows[1].url_canonical);
    for (const [row, body] of [[rows[0], ba], [rows[1], bb]] as const) {
      const kept = readFileSync(join(d, "bodies", `${shaHex(row.url_canonical)}.txt`), "utf8");
      expect(kept).toBe(body);
      expect(row.body_sha256).toBe(shaHex(body));
    }
  });
});
