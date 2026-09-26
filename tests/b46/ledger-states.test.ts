// B56 K1 — EVERY ADDRESS ENDS IN A TERMINAL STATE, AND READ IS WHAT THE MACHINE PRINTED.
//
// WHY. On 2026-09-26 the x hunter of the deep run printed the first 350 characters of 128 bodies in
// ONE command cut at 20,000 characters, saw 73, and declared "okundu 130" — and the coverage table
// believed it. The contract (EVIDENCE-B56-K1-2026-09-26.md §2.1–2.3, plus the lead's verdict addendum)
// moves both numbers into the ledger: `triage` gives every address one of five states, `read_status`
// moves only when `evidence.py batch` / `page` print a body, and `status` reconciles the sums.
//
// Every case runs the REAL evidence.py and triage.py on a fresh copy of fixtures/states/run: 13 rows
// cut byte for byte from that run's evidence.jsonl (nine X posts with a body — L0112 is the 19,911-byte
// article —, two X addresses with none, the web page L0080 whose body is 22,730 bytes, and the quote row
// L1395 of L0401), their bodies and question.txt. fixtures/states/triage-haiku.json is the measured
// Haiku answer of the same morning (x-deneme-2026-09-26/triage-haiku.json, its `result`) cut to these
// nine ids. No network and no model: `claude` and `opencli` are stand-ins, the hidden Chrome's port is 1.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DEAD_HIDDEN_PORT, SKILL } from "./engine-copy.js";

const FIX = join(dirname(resolve(import.meta.filename)), "fixtures", "states");
const EVIDENCE = join(SKILL, "scripts", "evidence.py");
const TRIAGE = join(SKILL, "scripts", "triage.py");
const HAIKU = join(FIX, "triage-haiku.json");
const WEB = "https://dev.to/genelab_999/claude-opus-55-vs-gpt-6-astra-vs-gpt-6-sol-the-effort-knob-matters-more-than-the-model-55gm";
const OPENCLI = `#!/bin/sh
[ -n "$DXB_STUB_OUT" ] && cat "$DXB_STUB_OUT"
[ -n "$DXB_STUB_ERR" ] && printf '%s\\n' "$DXB_STUB_ERR" >&2
exit "\${DXB_STUB_RC:-0}"
`;
// a model call would leave this mark: --dry-run must never make one
const CLAUDE = `#!/bin/sh
touch "$DXB_CLAUDE_MARK"
exit 99
`;

let root = "";
let bin = "";
let mark = "";
let n = 0;
beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "dxb-k1-states-"));
  bin = join(root, "bin");
  mark = join(root, "claude-was-called");
  mkdirSync(bin);
  for (const [name, body] of [["opencli", OPENCLI], ["claude", CLAUDE]]) {
    writeFileSync(join(bin, name), body);
    chmodSync(join(bin, name), 0o755);
  }
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

function fresh(): string {
  const run = join(root, `run-${n++}`);
  cpSync(join(FIX, "run"), run, { recursive: true });
  return run;
}
function py(script: string, args: string[], env: Record<string, string> = {}) {
  const r = spawnSync("python3", [script, ...args], {
    encoding: "utf8", timeout: 120_000,
    env: { ...process.env, ...env, PATH: `${bin}:${process.env.PATH}`, DXB_HIDDEN_PORT: DEAD_HIDDEN_PORT,
      DXB_CLAUDE_MARK: mark, PYTHONDONTWRITEBYTECODE: "1" },
  });
  return { out: r.stdout ?? "", err: r.stderr ?? "", code: r.status ?? 1 };
}
const ev = (args: string[], env: Record<string, string> = {}) => py(EVIDENCE, args, env);
const sha = (s: string | Buffer) => createHash("sha256").update(s).digest("hex");
const ledger = (run: string) => readFileSync(join(run, "evidence.jsonl"), "utf8");
const row = (run: string, id: string): Record<string, any> =>
  ledger(run).split("\n").filter(Boolean).map((l) => JSON.parse(l)).find((r) => r.id === id);
const body = (run: string, canon: string) => readFileSync(join(run, "bodies", `${sha(canon)}.txt`));
const status = (run: string, p = "x") => JSON.parse(ev(["status", run, "--platform", p, "--format", "json"]).out);
/** The rows a batch or page printed: id, and the text between its header and the next line of the machine. */
function printed(out: string): { id: string; text: string }[] {
  const heads = [...out.matchAll(/^### (L\d{4}) \| .*$/gm)];
  return heads.map((h, i) => {
    const rest = out.slice(h.index! + h[0].length + 1, i + 1 < heads.length ? heads[i + 1].index : undefined);
    return { id: h[1], text: rest.split(/^(?:PARTIAL L\d{4}|PAGE|BATCH): /m)[0].replace(/\n+$/, "") };
  });
}
const triaged = (run: string) => py(TRIAGE, [run, "--platform", "x", "--dry-run", HAIKU]);

describe("status — one state per address, counted from the ledger", () => {
  it("a run written before K1 reads pending / unread, reconciles, and is not rewritten", () => {
    const run = fresh();
    const before = sha(ledger(run));
    const r = ev(["status", run]);
    expect(r.code, r.out).toBe(0);
    const lines = r.out.trim().split("\n");
    expect(lines.at(-1)).toBe("RECONCILED");
    // 13 rows, 12 addresses: the quote row L1395 is L0401's address, not a thirteenth
    expect(r.out).toMatch(/^\| x \| 11 \| 11 \| 0 \| 0 \| 0 \| 0 \| 0 \| 0 \| 0 \| 0 \| 0 \| 9 \|$/m);
    expect(r.out).toMatch(/^\| TOTAL \| 12 \| 12 \| (0 \| ){9}10 \|$/m);
    for (const l of lines.filter((x) => /^\| (x|web|TOTAL) \|/.test(x))) {
      expect(l.split("|").slice(2, -1).every((c) => /^ \d+ $/.test(c)), l).toBe(true);
    }
    expect(sha(ledger(run))).toBe(before);
  });

  it("a state outside the contract is a MISMATCH, named, exit 1", () => {
    const run = fresh();
    writeFileSync(join(run, "evidence.jsonl"), ledger(run).replace('"id": "L0405",', '"id": "L0405", "triage": "maybe",'));
    const r = ev(["status", run, "--platform", "x"]);
    expect(r.code).toBe(1);
    expect(r.out.trim().split("\n").at(-1)).toMatch(/^MISMATCH: x discovered 11 ≠ pending\+relevant\+irrelevant\+duplicate\+inaccessible 10 — rows: L0405 triage='maybe'$/);
    expect(status(run).reconciled).toBe(false);
  });
});

describe("triage — a verdict that removes an address needs its reason", () => {
  it("irrelevant without a reason is refused and nothing is written; with one only that row's line changes", () => {
    const run = fresh();
    const before = ledger(run);
    const no = ev(["triage", run, "--id", "L0112", "--status", "irrelevant"]);
    expect(no.code).toBe(2);
    expect(no.out).toBe("REFUSED L0112: irrelevant needs a reason (--reason)\n");
    expect(ledger(run)).toBe(before);
    const ok = ev(["triage", run, "--id", "L0112", "--status", "irrelevant", "--reason", "Opus vs Astra, not Fable"]);
    expect(ok.code, ok.out).toBe(0);
    expect(status(run)).toMatchObject({ platforms: { x: { pending: 10, irrelevant: 1 } }, reconciled: true });
    const [a, b] = [before.split("\n"), ledger(run).split("\n")];
    expect(b.filter((l, i) => l !== a[i]).map((l) => JSON.parse(l).id)).toEqual(["L0112"]);
    expect(row(run, "L0112")).toMatchObject({ triage: "irrelevant", triage_reason: "Opus vs Astra, not Fable" });
  });

  it("triage-bulk counts every verdict once, an unknown id apart, and leaves a reasonless irrelevant pending", () => {
    const run = fresh();
    const file = join(root, `bulk-${n}.json`);
    writeFileSync(file, JSON.stringify({ triage: [
      { id: "L0405", status: "relevant", reason: "names both" }, { id: "L9999", status: "relevant" },
      { id: "L0402", status: "duplicate", reason: null, duplicate_of: "L0401" }, { id: "L0916", status: "irrelevant" },
    ] }));
    const r = ev(["triage-bulk", run, "--json", file, "--by", "haiku-4-5"]);
    expect(r.code).toBe(2);
    expect(r.out).toMatch(/^triaged: relevant 1 · irrelevant 0 · duplicate 1 · unknown-id 1\nrefused 1, left as they were: L0916: irrelevant needs a reason/);
    expect(row(run, "L0402")).toMatchObject({ triage: "duplicate", duplicate_of: "L0401", triage_reason: "duplicate of L0401", triage_by: "haiku-4-5" });
    expect(row(run, "L0916").triage ?? "pending").toBe("pending");
  });

  it("a hunter may only eliminate what batch printed it: unread refused, read passes, a model is no hunter", () => {
    const run = fresh();
    triaged(run);
    ev(["batch", run, "--hunter", "x", "--platform", "x", "--n", "1"]);             // L0405 read
    const file = join(root, `hunter-${n}.json`);
    writeFileSync(file, JSON.stringify({ triage: [{ id: "L0112", status: "irrelevant", reason: "too long" },
      { id: "L0409", status: "duplicate", duplicate_of: "L0405" }, { id: "L0405", status: "irrelevant", reason: "an ad" }] }));
    const r = ev(["triage-bulk", run, "--json", file, "--by", "x"]);
    expect(r.code).toBe(2);
    expect(r.out).toBe("triaged: relevant 0 · irrelevant 1 · duplicate 0 · unknown-id 0\nrefused 2, left as they were: "
      + "L0112: a hunter may only eliminate what it has read — batch never printed L0112 · "
      + "L0409: a hunter may only eliminate what it has read — batch never printed L0409\n");
    expect(status(run).platforms.x).toMatchObject({ relevant: 5, unread: 5, owed: 5 });
    const one = ev(["triage", run, "--id", "L0260", "--status", "irrelevant", "--reason", "an ad"], { DXB_HUNTER: "x" });
    expect([one.code, one.out]).toEqual([2, "REFUSED L0260: a hunter may only eliminate what it has read — batch never printed L0260\n"]);
    for (const by of ["machine", "haiku-4-5"]) {
      expect(ev(["triage", run, "--id", "L0260", "--status", "irrelevant", "--reason", "an ad", "--by", by]).code, by).toBe(0);
    }
  });
});

describe("triage.py — the measured Haiku triage, applied through triage-bulk", () => {
  it("--dry-run applies the prepared verdicts, never sends a row without a body, and calls no model", () => {
    const run = fresh();
    const r = triaged(run);
    expect(r.code, r.out + r.err).toBe(0);
    expect(r.out).toMatch(/^triaged: relevant 6 · irrelevant 2 · duplicate 1 · unknown-id 0 · already-triaged 0$/m);
    expect(r.out).toMatch(/^not sent: 2 pending rows have no body \(x 2\)/m);
    expect(status(run).platforms.x).toMatchObject({ pending: 2, pending_with_body: 0, relevant: 6, unread: 6 });
    expect(row(run, "L0112")).toMatchObject({ triage: "relevant", triage_by: "haiku-4-5" });
    // the claude envelope, as the model returned it (fenced JSON inside `result`), reads the same
    const env = join(root, `envelope-${n}.json`);
    writeFileSync(env, JSON.stringify({ result: "```json\n" + readFileSync(HAIKU, "utf8") + "```", total_cost_usd: 0.13 }));
    expect(py(TRIAGE, [fresh(), "--platform", "x", "--dry-run", env]).out).toMatch(/^triaged: relevant 6 · irrelevant 2 · duplicate 1 · unknown-id 0 · already-triaged 0$/m);
    expect(existsSync(mark)).toBe(false);
  });

  it("a second run counts the prepared ids by the ledger: already triaged, never held, or pending and not sent", () => {
    const run = fresh();
    triaged(run);
    const again = triaged(run);
    expect(again.code, again.out).toBe(0);
    expect(again.out).toMatch(/^triaged: relevant 0 · irrelevant 0 · duplicate 0 · unknown-id 0 · already-triaged 9$/m);
    const file = join(root, `again-${n}.json`);
    writeFileSync(file, JSON.stringify({ triage: [{ id: "L0112", status: "irrelevant", reason: "x" },
      { id: "L9999", status: "relevant" }, { id: "L0290", status: "relevant" }] }));      // L0290: pending, no body
    expect(py(TRIAGE, [run, "--platform", "x", "--dry-run", file]).out).toMatch(
      /^triaged: relevant 0 · irrelevant 0 · duplicate 0 · unknown-id 1 · already-triaged 1\nnot applied: 1 prepared verdicts name pending rows/m);
    expect(row(run, "L0112").triage).toBe("relevant");
  });
});

describe("batch and page — READ is what the machine printed", () => {
  it("batch prints whole bodies shortest first, never a row twice, and stops before 20,000 characters", () => {
    const run = fresh();
    triaged(run);
    expect(ev(["list", run, "--platform", "x", "--unread"]).out.trim().split("\n")).toHaveLength(6);
    const calls = [1, 2, 3, 4].map(() => ev(["batch", run, "--hunter", "x", "--platform", "x", "--n", "3"]));
    expect(calls.map((c) => printed(c.out).map((p) => p.id))).toEqual([["L0405", "L0409", "L0260"], ["L0403", "L0401"], ["L0112"], []]);
    expect(calls.map((c) => c.out.trim().split("\n").at(-1))).toEqual([
      "BATCH: printed 3 · remaining relevant unread 3 · partial 0 (platform x) · unjudged 3",
      "BATCH: printed 2 · remaining relevant unread 1 · partial 0 (platform x) · unjudged 5",   // L0112 would pass 20,000
      "BATCH: printed 1 · remaining relevant unread 0 · partial 0 (platform x) · unjudged 6",
      "BATCH: nothing left — okunacak adres kalmadı · unjudged 6",
    ]);
    for (const p of calls.flatMap((c) => printed(c.out))) {
      const r = row(run, p.id);
      expect(p.text, p.id).toBe(body(run, r.url_canonical).toString("utf8").replace(/\n+$/, ""));
      expect(r).toMatchObject({ read_status: "read", read_by: "x", read_bytes: r.bytes, read_completeness: 1 });
    }
    expect(status(run).platforms.x).toMatchObject({ relevant: 6, read: 6, partial: 0, unread: 0 });
    expect(ev(["list", run, "--platform", "x", "--unread"]).out).toBe("");
    expect(ev(["list", run, "--platform", "x", "--no-body"]).out.trim().split("\n")).toHaveLength(2);
  });

  it("a body longer than --max-chars is partial with its completeness; page prints the rest and completes it", () => {
    const run = fresh();
    ev(["triage", run, "--id", "L0080", "--status", "relevant", "--reason", "Opus 5.5 vs Astra effort"]);
    const b = ev(["batch", run, "--hunter", "pro", "--platform", "web"]);
    const whole = body(run, WEB);
    const cut = row(run, "L0080");
    expect(cut).toMatchObject({ read_status: "partial", read_by: "pro" });
    expect(cut.read_completeness).toBeLessThan(1);
    expect(b.out).toMatch(new RegExp(`^PARTIAL L0080: bytes 0-${cut.read_bytes} of 22730 printed — the rest: .* --from ${cut.read_bytes}$`, "m"));
    expect(printed(b.out)[0].text).toBe(whole.subarray(0, cut.read_bytes).toString("utf8").replace(/\n+$/, ""));
    expect(ev(["page", run, "--id", "L0080", "--from", "22000"]).code).toBe(2);   // a jump ahead counts nothing
    const p = ev(["page", run, "--id", "L0080", "--from", String(cut.read_bytes)]);
    expect(p.out).toMatch(new RegExp(`^PAGE: L0080 bytes ${cut.read_bytes}-22730 of 22730 · read 1\\.0$`, "m"));
    expect(printed(p.out)[0].text).toBe(whole.subarray(cut.read_bytes).toString("utf8").replace(/\n+$/, ""));
    expect(row(run, "L0080")).toMatchObject({ read_status: "read", read_bytes: 22730, read_completeness: 1 });
  });

  it("a partial row is offered again first, from where its print stopped, and is owed until its end is printed", () => {
    const run = fresh();
    triaged(run);
    const batch = (max = "5000") => ev(["batch", run, "--hunter", "x", "--platform", "x", "--max-chars", max]);
    batch();                                                                          // the five short posts
    expect(batch().out.trim().split("\n").at(-1)).toBe("BATCH: printed 1 · remaining relevant unread 0 · partial 1 (platform x) · unjudged 5");
    expect(row(run, "L0112")).toMatchObject({ read_status: "partial", read_bytes: 4928, read_completeness: 0.2475 });
    expect(status(run).platforms.x).toMatchObject({ unread: 0, partial: 1, unjudged: 5, owed: 6 });
    ev(["triage", run, "--id", "L0916", "--status", "relevant"]);                     // 56 bytes, unread
    const next = batch("20000");
    expect(printed(next.out).map((p) => p.id)).toEqual(["L0112", "L0916"]);           // the partial first, though longest
    expect(printed(next.out)[0].text).toBe(body(run, row(run, "L0112").url_canonical).subarray(4928).toString("utf8").replace(/\n+$/, ""));
    expect(next.out).toMatch(/^PAGE: L0112 bytes 4928-19911 of 19911 · read 1\.0$/m);
    expect(row(run, "L0112")).toMatchObject({ read_status: "read", read_bytes: 19911, read_completeness: 1 });
    expect(next.out.trim().split("\n").at(-1)).toBe("BATCH: printed 2 · remaining relevant unread 0 · partial 0 (platform x) · unjudged 7");
    expect(batch().out).toBe("BATCH: nothing left — okunacak adres kalmadı · unjudged 7\n");
  });

  it("a raw print of bodies/ counts nothing", () => {
    const run = fresh();
    triaged(run);
    const before = [ev(["status", run, "--format", "json"]).out, sha(ledger(run))];
    const raw = spawnSync("bash", ["-c", `cat "${run}"/bodies/*.txt | head -c 20000`], { encoding: "utf8" });
    expect(raw.stdout.length).toBeGreaterThan(19000);
    expect([ev(["status", run, "--format", "json"]).out, sha(ledger(run))]).toEqual(before);
  });
});

describe("fetch — a closed door is a terminal state", () => {
  it("an address with no body whose door stays shut is inaccessible, with the fetcher's words", () => {
    const run = fresh();
    const r = ev(["fetch", run, "--url", "https://x.com/i/status/2095595504767996325"],
      { DXB_STUB_RC: "1", DXB_STUB_ERR: "ok: false\nerror:\n  code: AUTH_REQUIRED\n  message: stand-in door closed" });
    expect(r.code, r.out).toBe(3);
    expect(row(run, "L0291")).toMatchObject({ liveness: "blocked", triage: "inaccessible", triage_by: "machine" });
    expect(row(run, "L0291").triage_reason).toMatch(/^opencli twitter thread kod 1: AUTH_REQUIRED: stand-in door closed/);
    expect(status(run)).toMatchObject({ platforms: { x: { inaccessible: 1, pending: 10 } }, reconciled: true });
    // the door opens later: pending again, and its passage is words — an image keeps its alt, loses its markup
    writeFileSync(join(root, "post.yaml"), '- author: someone\n  text: "[![cover](https://pbs.twimg.com/a.jpg)](/x/media/1) Fable 5.1 &amp; Astra 6: same bug [](/)"\n');
    expect(ev(["fetch", run, "--url", "https://x.com/i/status/2095595504767996325"], { DXB_STUB_OUT: join(root, "post.yaml") }).code).toBe(0);
    expect(row(run, "L0291")).toMatchObject({ triage: "pending", triage_reason: null, passage: "cover Fable 5.1 & Astra 6: same bug" });
  });
});

describe("add — a hunter's own quote is evidence by definition", () => {
  it("the quote row is relevant, a pending address turns relevant, a removed one stays removed, reading untouched", () => {
    const run = fresh();
    ev(["triage", run, "--id", "L0916", "--status", "irrelevant", "--reason", "Opus vs Astra, not Fable"]);
    const add = (url: string, quote: string) => ev(["add", run, "--url", url, "--quote", quote], { DXB_HUNTER: "x" });
    const a = add("https://x.com/SahilExec/status/2095688272269984016", "The gap in visual quality is actually crazy");
    const b = add("https://x.com/i/status/2102537174742655341", "Claude Opus 5.5 vs GPT-6 Astra");
    // L1395 is a quote row the 02:34 run wrote before K1 (no fields): repeating its quote credits it and L0401
    const c = add("https://x.com/i/status/2101774434801459422", row(run, "L1395").passage);
    expect([a.code, b.code, c.code, c.out.trim()], a.out + b.out + c.out).toEqual([0, 0, 0, "L1395"]);
    for (const id of [a.out.trim(), b.out.trim(), "L1395"]) {
      expect(row(run, id), id).toMatchObject({ tool: "evidence.py add", triage: "relevant", triage_by: "x", triage_reason: null });
    }
    for (const id of ["L0260", "L0401"]) {
      expect(row(run, id), id).toMatchObject({ triage: "relevant", triage_by: "x", triage_reason: null, read_status: "unread", verdict: "evidence" });
    }
    expect(row(run, "L0916")).toMatchObject({ triage: "irrelevant", triage_reason: "Opus vs Astra, not Fable", read_status: "unread" });
    expect(status(run)).toMatchObject({ platforms: { x: { discovered: 11, relevant: 2, irrelevant: 1, read: 0, unread: 2 } }, reconciled: true });
    // what add keeps is the quote's words (the image's alt, not its markup); a row on disk keeps its passage
    expect(row(run, add("https://x.com/nateherk/article/2096669523956920530", "on X [![Article cover image](https://pbs.twimg.com/media/HRjdoSxaQAAWdGk?format=webp&name=medium)](/nateherk/article/2096669523956920530/media/2096669310844551168) I Tested").out.trim()).passage).toBe("on X Article cover image I Tested");
    expect(row(run, "L1395").passage).toContain("Modelleme &amp; Blender");
  });
});

describe("verdict — a hunter owes every row it read a verdict", () => {
  it("none needs a reason; add is evidence; verdict-bulk counts; status and batch show what is owed", () => {
    const run = fresh();
    triaged(run);
    ev(["batch", run, "--hunter", "x", "--platform", "x", "--n", "3"]);             // L0405 L0409 L0260
    expect(status(run).platforms.x).toMatchObject({ read: 3, judged: 0, unjudged: 3 });
    expect(ev(["verdict", run, "--hunter", "x", "--id", "L0405", "--verdict", "none"]).code).toBe(2);
    expect(ev(["verdict", run, "--hunter", "x", "--id", "L0405", "--verdict", "none", "--reason", "an ad"]).code).toBe(0);
    const q = ev(["add", run, "--url", "https://x.com/SahilExec/status/2095688272269984016",
      "--quote", "The gap in visual quality is actually crazy"], { DXB_HUNTER: "x" });
    expect(q.code, q.out).toBe(0);
    expect(row(run, "L0260")).toMatchObject({ verdict: "evidence", verdict_by: "x", read_status: "read" });
    const file = join(root, `verdicts-${n}.json`);
    writeFileSync(file, JSON.stringify({ verdicts: [{ id: "L0409", verdict: "evidence" }, { id: "L9999", verdict: "none", reason: "x" }] }));
    expect(ev(["verdict-bulk", run, "--hunter", "x", "--json", file]).out).toBe("verdicts: evidence 1 · none 0 · unknown-id 1\n");
    expect(status(run)).toMatchObject({ platforms: { x: { read: 3, judged: 3, unjudged: 0 } }, reconciled: true });
    expect(ev(["batch", run, "--hunter", "x", "--platform", "x", "--n", "3"]).out.trim().split("\n").at(-1))
      .toBe("BATCH: printed 2 · remaining relevant unread 1 · partial 0 (platform x) · unjudged 2");
  });
});
