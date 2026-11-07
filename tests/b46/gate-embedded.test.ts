// 2026-11-07 — A LINK FOUND ONLY INSIDE AN OFF-TOPIC POST IS NOT FETCHED.
//
// WHY. The deep run of 2026-11-07 18:06 fetched 1,286 addresses in 963 s before anything judged them;
// 484 were t.co links taken out of tweets (9 relevant) and 120 links taken out of read pages (2 relevant).
// Replayed offline on that run's own ground, the gate below would have skipped 477 fetches and lost no
// relevant or cited row. These cases run the REAL evidence.py on a ground written here: from-ground
// records where a body-less link was found (`found_in`), triage-bulk judges the posts, and gate-embedded
// eliminates — with the parent's id in its reason — only links whose every parent was judged off-topic.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { SKILL } from "./engine-copy.js";

const EVIDENCE = join(SKILL, "scripts", "evidence.py");
const root = mkdtempSync(join(tmpdir(), "dxb-gate-embedded-"));
afterAll(() => rmSync(root, { recursive: true, force: true }));

const ev = (args: string[]) => {
  const r = spawnSync("python3", [EVIDENCE, ...args], { encoding: "utf8", timeout: 60_000,
    env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
  return { out: r.stdout ?? "", err: r.stderr ?? "", code: r.status ?? 1 };
};
const rows = (run: string): Record<string, any>[] =>
  readFileSync(join(run, "evidence.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const byUrl = (run: string, url: string) => rows(run).find((r) => r.url === url)!;

// three tweets with bodies: one off-topic carrying a t.co alone, one on-topic carrying another, and the
// off-topic one shares a third link with the on-topic one; plus a search result with a title and no body
const RAW = `- url: https://x.com/a/status/1
  text: "Breaking celebrity gossip of the week https://t.co/offtopic1 and https://t.co/shared1"
- url: https://x.com/b/status/2
  text: "Open-source skill that finds outlier short videos https://t.co/ontopic1 https://t.co/shared1"
- url: https://example.com/viral-research-tool
  title: "Viral research tool review"
`;

function run(): string {
  const r = join(root, `run-${Math.random().toString(36).slice(2, 8)}`);
  mkdirSync(join(r, "ground"), { recursive: true });
  writeFileSync(join(r, "ground", "twitter.raw"), RAW);
  writeFileSync(join(r, "question.txt"), "viral short video format research tool\n");
  expect(ev(["from-ground", r]).code).toBe(0);
  return r;
}

describe("gate-embedded — a link is fetched only when a post that carried it is not off-topic", () => {
  it("from-ground writes found_in for links seen only inside posts, never for a titled result", () => {
    const r = run();
    // found_in holds the parents' canonical addresses (the ledger's url_canonical)
    const ca = byUrl(r, "https://x.com/a/status/1").url_canonical;
    const cb = byUrl(r, "https://x.com/b/status/2").url_canonical;
    expect(byUrl(r, "https://t.co/offtopic1").found_in).toEqual([ca]);
    expect(byUrl(r, "https://t.co/shared1").found_in).toEqual([ca, cb].sort());
    expect(byUrl(r, "https://example.com/viral-research-tool").found_in).toBeUndefined();
  });

  it("eliminates a link whose every parent is off-topic, keeps one beside an on-topic or unjudged parent", () => {
    const r = run();
    const a = byUrl(r, "https://x.com/a/status/1").id;
    const b = byUrl(r, "https://x.com/b/status/2").id;
    // before any verdict: nothing is eliminated
    expect(ev(["gate-embedded", r]).out).toMatch(/elendi 0 /);
    writeFileSync(join(r, "t.json"), JSON.stringify({ triage: [
      { id: a, status: "irrelevant", reason: "celebrity gossip" },
      { id: b, status: "relevant" }] }));
    expect(ev(["triage-bulk", r, "--json", join(r, "t.json"), "--by", "haiku-5-5"]).code).toBe(0);
    const g = ev(["gate-embedded", r, "--ids", join(r, "g.ids")]);
    expect(g.out).toMatch(/^gate-embedded: elendi 1 · indirilecek 2 /m);
    const off = byUrl(r, "https://t.co/offtopic1");
    expect(off.triage).toBe("irrelevant");
    expect(off.triage_by).toBe("machine");
    expect(off.triage_reason).toContain(a);
    expect(readFileSync(join(r, "g.ids"), "utf8").trim()).toBe(off.id);
    expect(byUrl(r, "https://t.co/shared1").triage).toBe("pending");
    expect(byUrl(r, "https://t.co/ontopic1").triage).toBe("pending");
    expect(byUrl(r, "https://example.com/viral-research-tool").triage).toBe("pending");
    // the eliminated link is still counted: status reconciles
    expect(ev(["status", r]).code).toBe(0);
  });

  it("a duplicate parent stands for its original: gated only when the original is off-topic", () => {
    const r = join(root, `run-dup-${Math.random().toString(36).slice(2, 8)}`);
    mkdirSync(join(r, "ground"), { recursive: true });
    const post = (n: number, link: string) =>
      `- url: https://x.com/u/status/${n}\n  text: "post number ${n} about something ${link}"\n`;
    writeFileSync(join(r, "ground", "twitter.raw"), [
      post(1, ""), post(2, ""), post(3, "https://t.co/dupofrel"), post(4, "https://t.co/dupofoff"),
      post(5, "https://t.co/loop1"), post(6, ""), post(7, ""), post(8, "https://t.co/dupofpend")].join(""));
    writeFileSync(join(r, "question.txt"), "viral short video format research tool\n");
    expect(ev(["from-ground", r]).code).toBe(0);
    const id = (n: number) => byUrl(r, `https://x.com/u/status/${n}`).id;
    writeFileSync(join(r, "t.json"), JSON.stringify({ triage: [
      { id: id(1), status: "relevant" },
      { id: id(2), status: "irrelevant", reason: "off-topic" },
      { id: id(3), status: "duplicate", duplicate_of: id(1) },     // the original is relevant
      { id: id(4), status: "duplicate", duplicate_of: id(2) },     // the original is off-topic
      { id: id(5), status: "duplicate", duplicate_of: id(6) },     // 5 -> 6 -> 5: a loop
      { id: id(6), status: "duplicate", duplicate_of: id(5) },
      { id: id(8), status: "duplicate", duplicate_of: id(7) }] })); // the original is still pending
    expect(ev(["triage-bulk", r, "--json", join(r, "t.json"), "--by", "haiku-5-5"]).code).toBe(0);
    expect(ev(["gate-embedded", r]).out).toMatch(/^gate-embedded: elendi 1 · indirilecek 1 .* · 2 /m);
    expect(byUrl(r, "https://t.co/dupofoff").triage).toBe("irrelevant");
    expect(byUrl(r, "https://t.co/dupofrel").triage).toBe("pending");
    expect(byUrl(r, "https://t.co/loop1").triage).toBe("pending");
    expect(byUrl(r, "https://t.co/dupofpend").triage).toBe("pending");
  });

  it("a gated link leaves the hunters' list and stays in the ledger with its reason", () => {
    const r = run();
    const a = byUrl(r, "https://x.com/a/status/1").id;
    writeFileSync(join(r, "t.json"), JSON.stringify({ triage: [{ id: a, status: "irrelevant", reason: "gossip" }] }));
    expect(ev(["triage-bulk", r, "--json", join(r, "t.json"), "--by", "haiku-5-5"]).code).toBe(0);
    const off = byUrl(r, "https://t.co/offtopic1").id + "\t";
    const listed = (flags: string[]) => ev(["list", r, "--platform", "x", ...flags]).out;
    expect(listed(["--no-body"])).toContain(off);
    expect(ev(["gate-embedded", r]).out).toMatch(/elendi 1 /);
    expect(listed(["--no-body"])).not.toContain(off);
    expect(listed([])).not.toContain(off);
    expect(listed(["--no-body"])).toContain(byUrl(r, "https://t.co/shared1").id + "\t");
    const row = byUrl(r, "https://t.co/offtopic1");
    expect(row.triage).toBe("irrelevant");
    expect(row.triage_reason).toContain(a);
    const st = JSON.parse(ev(["status", r, "--format", "json"]).out);
    expect(JSON.stringify(st)).toMatch(/"irrelevant":\s*2/);   // the post and its gated link
  });

  it("a body that lands on a machine-gated row sends it back to pending; a direct verdict stays", () => {
    const r = run();
    const a = byUrl(r, "https://x.com/a/status/1").id;
    const shared = byUrl(r, "https://t.co/shared1").id;
    writeFileSync(join(r, "t.json"), JSON.stringify({ triage: [
      { id: a, status: "irrelevant", reason: "gossip" },
      { id: shared, status: "irrelevant", reason: "judged directly" }] }));
    expect(ev(["triage-bulk", r, "--json", join(r, "t.json"), "--by", "haiku-5-5"]).code).toBe(0);
    expect(ev(["gate-embedded", r]).out).toMatch(/elendi 1 /);
    expect(byUrl(r, "https://t.co/offtopic1").triage).toBe("irrelevant");
    // a later ground carries both links' own pages, with bodies
    writeFileSync(join(r, "ground", "twitter2.raw"),
      `- url: https://t.co/offtopic1\n  text: "a long page body about viral short video formats"\n` +
      `- url: https://t.co/shared1\n  text: "another body that arrived later"\n`);
    expect(ev(["from-ground", r]).code).toBe(0);
    const off = byUrl(r, "https://t.co/offtopic1");
    expect(off.bytes).toBeGreaterThan(0);
    expect(off.triage).toBe("pending");
    expect(off.triage_by).toBeNull();
    expect(ev(["list", r, "--platform", "x"]).out).toContain(off.id + "\t");
    const sh = byUrl(r, "https://t.co/shared1");
    expect(sh.triage).toBe("irrelevant");
    expect(sh.triage_by).toBe("haiku-5-5");
  });
});
