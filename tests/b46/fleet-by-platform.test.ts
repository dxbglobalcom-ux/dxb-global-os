// B56 · LANE B — THE FIELD: SEVEN HUNTERS, EACH THE OWNER OF ITS PLATFORMS.
//
// WHAT WAS MEASURED. On the answer he rejected on 2026-09-24 the ground had found 294 X addresses
// and the answer cited none of them (the lead's count, EVIDENCE-B56). The named cause: the hunters
// owned TOPICS, so X belonged to no one, and nothing asked a hunter to account for what it left
// unread. His order of 2026-09-26: the hunters are Opus 5.5 at low effort, and what is gathered is
// not thrown away — "100 bilgi gelior konuyla iligli adam 2 sini alıp diğerlerini çöze atıor".
//
// WHAT IS GUARDED HERE, BY RUNNING IT. The engine is copied to a temporary folder (engine-copy.ts);
// inside the COPY the ground, the ledger and the coverage table are stand-ins that print the shapes
// the contract fixes (fixtures/fleet/), and `claude` is a stand-in that keeps what it was launched
// with. Who owns which platform, what each prompt carries, how a hunter is launched and what the
// summary counts are the real fleet.sh and merge.py. The real evidence.py and kapsama.py are Lane
// A's and have their own cases; a real hunter costs money and is the lead's live run.
//
// B56 K2: the roster carries the tail's two claim roles (karsi, bosluk), which own no platform and are
// never launched as hunters; merge.py's PARA is a role's whole bill and Google read through hidden.py is
// the Google door; the crowd's threads come from the ledger; keep.sh names the folder after the first query.
//
// B56 K3 — HIS QUESTION, SPLIT BEFORE THE GROUND OPENS. The K2 answer stood in sections of the writer's own choosing,
// and a part of his question no row spoke to was simply not on the page. So the fleet runs scripts/split.py first: the
// sub-questions his DERT holds go into subquestions.json and, as the ALT SORULAR block, into question.txt — which every
// role is handed. FAKE_SPLIT hands split.py a kept answer (fixtures/split/) in place of the model's; without it the
// split's `claude` is this bench's stand-in, whose answer holds no sub-question: the fallback, one sub-question. A full
// run that does not split keeps no earlier run's subquestions.json; keep.sh keeps it with the answer.
//
// B56 K3 — THE WRITER'S CLOCK. On the K3 stage-1 run `timeout 600` stopped the draft writer (kod 124) and the run still
// printed CEVAP HAZIR and left with 0. The clock is --writer-timeout now (1500 s by default) and the writer's lines say
// it; a full run whose tail wrote no answer.md says `!! CEVAP YOK` and leaves with 1. Those cases run on a bench of their
// own, the gate's (fixtures/gate/), whose ledger answers writer-rows; this file's field cases run --no-write. The writer
// runs at medium effort from K3 stage 3 on (the lead's measurement of 2026-09-27: medium ≥ high by a blind judge).
//
// B56 K3 STAGE 3 — THE AUDITOR. Nothing read a final line against the rows it cites; now, after the answer's ledger, an
// Opus that never saw the writer reads every claim with only its rows (scripts/audit.py), answer.md takes what it
// corrected and removed, the ledger is extracted again and checked, then the page is made. FAKE_AUDIT hands audit.py a
// kept answer per batch (fixtures/audit/); every fleet run here sets it to an empty folder by default — the auditor
// agrees and no model is called. A claim it could not read is named after the page, `!! DENETLENMEYEN İDDİA`, code 1.

import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Bench, makeBench } from "./engine-copy.js";

const FLEET_DIR = join(process.cwd(), ".claude/skills/dxb-research/fleet");
const FX = join(import.meta.dirname, "fixtures", "fleet");
const AUDIT = join(import.meta.dirname, "fixtures", "audit");
const AGREE = join(AUDIT, "agree");
const SEVEN = ["x", "video", "forums", "pro", "code", "foreign", "counter"];
const TAIL_ROLES = ["karsi", "bosluk"];
// the one classifier's platform names (scripts/platforms.py, EVIDENCE-B56 "THE CONTRACTS")
const PLATFORMS = ["x", "youtube", "tiktok", "instagram", "facebook", "linkedin", "reddit", "hackernews", "github",
  "bluesky", "threads", "quora", "stackoverflow", "chinese", "medium", "substack", "web"];

let b: Bench;
let run7 = "";
let out7 = { code: 0, stdout: "" };

function fleet(out: string, ...args: string[]): { code: number; stdout: string } {
  return fleetWith({}, out, ...args);
}

/** The copy's fleet.sh with `env` on top of the bench's (FAKE_SPLIT for the split's cases, K3). */
function fleetWith(env: Record<string, string>, ...args: string[]): { code: number; stdout: string } {
  return fleetOn(b, env, ...args);
}

/** fleet.sh of `bench`'s engine copy — this file's bench, or the writer's clock's (fixtures/gate/, K3). */
function fleetOn(bench: Bench, env: Record<string, string>, ...args: string[]): { code: number; stdout: string } {
  try {
    const stdout = execFileSync("bash", [join(bench.engine, "fleet", "fleet.sh"), ...args], {
      encoding: "utf8",
      // FAKE_AUDIT: the tail's auditor (K3 stage 3) reads its answers from an empty folder — it agrees, no call is made
      env: { ...process.env, FAKE_AUDIT: AGREE, ...env, PATH: `${bench.bin}:${process.env.PATH}`, PYTHONDONTWRITEBYTECODE: "1" },
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 90_000,
    });
    return { code: 0, stdout };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return { code: err.status ?? 1, stdout: String(err.stdout ?? "") + String(err.stderr ?? "") };
  }
}

const flat = (s: string) => s.replace(/\s+/g, " ");
const roles = () => readFileSync(join(FLEET_DIR, "roles.tsv"), "utf8");

beforeAll(() => {
  b = makeBench();
  copyFileSync(join(FX, "evidence-stub.py"), join(b.engine, "scripts", "evidence.py"));
  copyFileSync(join(FX, "kapsama-stub.py"), join(b.engine, "scripts", "kapsama.py"));
  copyFileSync(join(FX, "sweep-stub.sh"), join(b.engine, "scripts", "sweep.sh"));
  copyFileSync(join(FX, "claude-stub.sh"), join(b.bin, "claude"));
  chmodSync(join(b.bin, "claude"), 0o755);
  run7 = join(b.root, "run7");
  // --no-write: this ledger stand-in has no writer-rows, so a tail here would write no answer (!! CEVAP YOK, code 1)
  out7 = fleet(run7, "--q", "astra 6 vs fable 5.1", "--hunters", "7", "--timeout", "30", "--no-write");
}, 120_000);
afterAll(() => b?.dispose());

describe("the roster — seven hunters, every platform with one owner, on his model", () => {
  it("names the seven, gives each its platforms in the classifier's words, and owns no platform twice", () => {
    const all = roles().trim().split("\n").map((l) => l.split("\t"));
    const rows = all.filter((r) => !TAIL_ROLES.includes(r[0]));
    expect(rows.map((r) => r[0]).sort()).toEqual([...SEVEN].sort());
    // the tail's claim roles work the claim ledger, not a platform: their column is `all`
    expect(all.filter((r) => TAIL_ROLES.includes(r[0])).map((r) => `${r[0]} ${r[1]}`)).toEqual(["karsi all", "bosluk all"]);
    const owned = rows.flatMap((r) => r[1].split(" ")).filter((p) => p !== "rest");
    for (const p of owned) expect(PLATFORMS, `"${p}" is not a platform of the classifier`).toContain(p);
    expect(new Set(owned).size, "a platform has two owners").toBe(owned.length);
    expect(rows.find((r) => r[0] === "counter")?.[1]).toBe("rest");
    const fleetSh = readFileSync(join(FLEET_DIR, "fleet.sh"), "utf8");
    expect(fleetSh).toMatch(/^DEFAULT4="x video forums counter"$/m);
    const seven = /^DEFAULT7="([^"]*)"$/m.exec(fleetSh)?.[1].split(" ") ?? [];
    expect([...seven].sort()).toEqual([...SEVEN].sort());
  });

  it("launches on claude-opus-5-5 at low effort with a ten-minute clock, and the old rationale is gone", () => {
    const fleetSh = readFileSync(join(FLEET_DIR, "fleet.sh"), "utf8");
    expect(fleetSh).toMatch(/^N=4; MODEL=claude-opus-5-5; TMO=600;/m);
    expect(fleetSh).toMatch(/claude -p "\$\(cat "\$OUT\/prompt-\$role\.txt"\)" \\\n\s+--model "\$MODEL" --effort low \\/);
    expect(fleetSh).not.toMatch(/Sonnet brings/);
    expect(fleetSh).not.toMatch(/Work only your lane/);
  });
});

describe("the fleet, run — what each hunter is handed and how it is launched", () => {
  it("hands each hunter every open address of its own platforms, the three commands and the brief", () => {
    expect(out7.code, out7.stdout.slice(-1500)).toBe(0);
    const prompt = readFileSync(join(run7, "prompt-x.txt"), "utf8");
    // every address of its platforms, id first, liveness kept, exactly as `evidence.py list` printed
    // it — a post whose body the ground already carried included, a closed door left out
    expect(prompt).toContain("L0001\thttps://x.com/dev_one/status/1001\tSwitched back after a week\tunchecked");
    expect(prompt).toContain("L0002\thttps://x.com/dev_two/status/1002\tFull text carried by the ground\talive");
    expect(prompt).toContain("L0003\thttps://bsky.app/profile/dev3.bsky.social/post/3k2\t");
    expect(prompt, "a closed door is already recorded, not on the list").not.toContain("L0007\t");
    expect(prompt, "a Reddit row is the forums hunter's").not.toContain("L0004\t");
    expect(flat(prompt)).toContain("x: 1 with a body · 1 without a body · 1 closed doors (skipped)");
    expect(flat(prompt)).toContain("bluesky: 0 with a body · 1 without a body · 0 closed doors (skipped)");
    // the three commands, with the engine's own path and this run's path spelled out
    const evi = `python3 "${join(b.engine, "scripts", "evidence.py")}"`;
    for (const verb of ["fetch", "add", "list", "show"]) expect(prompt).toContain(`${evi} ${verb} "${run7}"`);
    expect(prompt).toContain(`${run7}/bodies/<sha256 of the address>.txt`);
    const f = flat(prompt);
    expect(f).toContain("A batch whose ids carry no verdict is not finished reading.");
    expect(f).toContain("Read every address on your list. Every quote you keep goes in with `add`.");
    expect(f).toContain("recorded by `fetch` (it writes the closed door itself), never skipped in silence");
    expect(f).toContain("A decisive address on another platform is added the same way: it is never lost.");
    expect(f).toContain('"okunacak adres kalmadı"');
    expect(f).toMatch(/You have 30 s \(0 min\); the fleet stops you at \d\d:\d\d:\d\d\. Stop reading at \d\d:\d\d:\d\d/);
    expect(f).not.toMatch(/Work only your lane|six blocks/);
    // every open row is on exactly one hunter's list (forums has Reddit, video YouTube, counter the web);
    // the closed door is on none
    const lists = readdirSync(run7).filter((n) => /^list-.+\.tsv$/.test(n));
    expect(lists.sort()).toEqual(SEVEN.map((r) => `list-${r}.tsv`).sort());
    const owner: Record<string, string[]> = {};
    for (const n of lists) {
      for (const line of readFileSync(join(run7, n), "utf8").split("\n").filter(Boolean)) {
        (owner[line.split("\t")[0]] ??= []).push(n);
      }
    }
    expect(owner).toEqual({
      L0001: ["list-x.tsv"], L0002: ["list-x.tsv"], L0003: ["list-x.tsv"], L0004: ["list-forums.tsv"],
      L0005: ["list-counter.tsv"], L0006: ["list-video.tsv"],
    });
  });

  it("launches every hunter on his model at low effort, with its own name in its environment", () => {
    for (const role of SEVEN) {
      const argv = readFileSync(join(run7, `work-${role}`, "launch.txt"), "utf8").split("\n");
      expect(argv[argv.indexOf("--model") + 1], role).toBe("claude-opus-5-5");
      expect(argv[argv.indexOf("--effort") + 1], role).toBe("low");
      expect(argv, role).toContain(`DXB_HUNTER=${role}`);
    }
  });

  it("ends with the counted summary and the coverage table, before the answer is called ready", () => {
    const s = out7.stdout;
    const table = s.indexOf("KAPSAMA — nereye bakildi");
    expect(table, s.slice(-1500)).toBeGreaterThan(-1);
    expect(s.indexOf(`KAPSAMA-STAND-IN run=${run7}`)).toBeGreaterThan(table);
    expect(s.indexOf("CEVAP HAZIR")).toBeGreaterThan(table);
    const summary = readFileSync(join(run7, "SUMMARY.txt"), "utf8");
    expect(summary).toMatch(/^x\s+3\s+1$/m); // the ledger: three X addresses, one with a body
    expect(summary).toMatch(/^\s+\[x\] PLATFORM x: bulundu 1 \/ okundu 1/m);
  });

  it("names a platform no hunter of the run owns, instead of dropping it", () => {
    const r = fleet(join(b.root, "run-two"), "--q", "astra 6 vs fable 5.1", "--roles", "x,forums", "--timeout", "30");
    expect(r.stdout).toMatch(/!! SAHIPSIZ PLATFORM: .*\byoutube\b.*\bweb\b/);
    expect(r.stdout, "the claim roles' `all` is not a platform").not.toMatch(/!! SAHIPSIZ PLATFORM:[^\n]*\ball\b/);
  }, 90_000);

  it("never launches a claim role as a hunter, even when --roles names it", () => {
    const run = join(b.root, "run-tail-roles");
    const r = fleet(run, "--q", "astra 6 vs fable 5.1", "--roles", "x,karsi,bosluk", "--timeout", "30");
    expect(r.stdout, r.stdout.slice(-1500)).toMatch(/^avcilar : x$/m);
    expect(readdirSync(run).filter((n) => /^list-.+\.tsv$/.test(n))).toEqual(["list-x.tsv"]);
    expect(existsSync(join(run, "work-karsi", "launch.txt"))).toBe(false);
  }, 90_000);
});

describe("crowd-urls.sh — the crowd's threads come from the ledger first", () => {
  /** crowd-urls.sh beside a ledger that answers `list` from <run>/evidence.jsonl (the gate bench's stand-in). */
  function crowdUrls(name: string, rows: object[], ...args: string[]): { out: string[]; err: string } {
    const root = join(b.root, name);
    mkdirSync(join(root, "fleet"), { recursive: true });
    mkdirSync(join(root, "scripts"), { recursive: true });
    mkdirSync(join(root, "run"), { recursive: true });
    copyFileSync(join(b.engine, "fleet", "crowd-urls.sh"), join(root, "fleet", "crowd-urls.sh"));
    copyFileSync(join(import.meta.dirname, "fixtures", "gate", "evidence-stub.py"), join(root, "scripts", "evidence.py"));
    writeFileSync(join(root, "run", "evidence.jsonl"), rows.map((r) => JSON.stringify(r) + "\n").join(""));
    const r = spawnSync("bash", [join(root, "fleet", "crowd-urls.sh"), join(root, "run"), ...args],
      { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
    return { out: r.stdout.split("\n").filter(Boolean), err: r.stderr };
  }
  const row = (id: number, platform: string, url: string, liveness = "alive") =>
    ({ id: `L${String(id).padStart(4, "0")}`, platform, url, title: `row ${id}`, liveness, tool: "sweep" });

  it("cuts a comment back to its thread, keeps one line per thread and at most --cap of them", () => {
    // 45 threads, a comment of the first one, a thread with no body, and a Hacker News item
    const rows = [...Array.from({ length: 45 }, (_, i) => row(i + 1, "reddit", `https://www.reddit.com/r/bench/comments/t${i}/thread_${i}/`)),
      row(46, "reddit", "https://www.reddit.com/r/bench/comments/t0/thread_0/c9zz/"),
      row(47, "reddit", "https://www.reddit.com/r/bench/comments/gone1/deleted/", "dead"),
      row(48, "hackernews", "https://news.ycombinator.com/item?id=4957")];
    const capped = crowdUrls("cu-cap", rows, "--cap", "40");
    expect(capped.out).toHaveLength(40);
    expect(new Set(capped.out).size).toBe(40);
    expect(capped.out[0]).toBe("https://www.reddit.com/r/bench/comments/t0");
    expect(capped.err).toMatch(/^crowd-urls: 40 baslik \(defterden\)$/m);
    const whole = crowdUrls("cu-all", rows, "--cap", "100");
    expect(whole.out).toHaveLength(46); // 45 threads + the HN item: the comment is its thread, the dead one has no body
    expect(whole.out.filter((u) => u.endsWith("/comments/t0"))).toHaveLength(1);
    expect(whole.out).toContain("https://news.ycombinator.com/item?id=4957");
    expect(whole.out.join("\n")).not.toMatch(/gone1/);
  });

  it("falls back to the grounds' raw files when the ledger holds no thread, and says so", () => {
    const ground = join(b.root, "cu-ground");
    mkdirSync(ground, { recursive: true });
    writeFileSync(join(ground, "reddit.raw"),
      "url: https://www.reddit.com/r/bench/comments/abc123/update\\_employee\\_rules/\nurl: https://news.ycombinator.com/item?id=77).\n");
    const r = crowdUrls("cu-fallback", [row(1, "x", "https://x.com/a/status/1")], ground);
    expect(r.out).toEqual(["https://news.ycombinator.com/item?id=77", "https://www.reddit.com/r/bench/comments/abc123/update_employee_rules/"]);
    expect(r.err).toMatch(/^crowd-urls: 2 baslik \(zeminden\)$/m);
  });
});

describe("merge.py — the summary counts; it does not narrate", () => {
  it("counts the ledger per platform and prints each hunter's own lines, never its prose", () => {
    const dir = join(b.root, "merge-run");
    cpSync(join(FX, "merge-run"), dir, { recursive: true });
    const out = execFileSync("python3", [join(b.engine, "fleet", "merge.py"), dir, "--crowd", join(dir, "crowd-count.txt")],
      { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
    // the ledger: distinct addresses found · distinct addresses with a body (two quotes, one address)
    expect(out).toMatch(/^x\s+3\s+1$/m);
    expect(out).toMatch(/^reddit\s+2\s+1$/m);
    expect(out).toMatch(/^tiktok\s+0\s+0$/m); // zero is printed — a platform not printed cannot be asked about
    expect(out).toMatch(/^TOPLAM\s+6\s+2$/m);
    // each hunter's lines, as its claim; an id the ledger does not hold is named
    expect(out).toContain("[x] PLATFORM x: bulundu 3 / okundu 1 / okunmadı: 1 — süre bitti / kapı kapalı: 1 × HTTP 429");
    expect(out).toContain("[forums] PLATFORM reddit: bulundu 2 / okundu 1");
    expect(out).toMatch(/\[x\] KULLANDIGIM SATIRLAR: 3 kimlik — defterde 2 · DEFTERDE YOK 1: L0999/);
    expect(out).toMatch(/\[forums\] okunacak adres kalmadi/);
    // no prose: the paragraph is counted, never printed
    expect(out).not.toContain("nesir paragrafıdır");
    expect(out).toMatch(/\[x\] \+1 satir nesir — ozete alinmadi/);
    expect(out).toMatch(/INSAN \(sayildi\): 7 ayri kisi · 10 yorum · 2 baslik/);
  });

  it("sums PARA over every round of a role, and counts a Google search read through hidden.py as the Google door", () => {
    const dir = join(b.root, "merge-para");
    mkdirSync(dir, { recursive: true });
    const events = [
      { type: "assistant", message: { content: [{ type: "tool_use", id: "g1", name: "Bash",
        input: { command: 'python3 "/engine/scripts/hidden.py" google "astra 6 vs fable 5.1"' } }] } },
      { type: "user", message: { content: [{ type: "tool_result", tool_use_id: "g1", content: "1. https://example.org/a" }] } },
      { type: "result", total_cost_usd: 0.41, result: "HÜKÜM: round one\n" },
      { type: "result", total_cost_usd: 0.1, result: "HÜKÜM: round two\nKULLANDIĞIM SATIRLAR: L0001\n" },
    ];
    writeFileSync(join(dir, "forums.jsonl"), events.map((e) => JSON.stringify(e) + "\n").join(""));
    writeFileSync(join(dir, "forums.meta"), "rc=0\nsecs=40\ntmo=600\nrounds=2\n");
    for (const ledger of ["claims.jsonl", "claims.draft.jsonl"]) writeFileSync(join(dir, ledger), '{"id": "C001", "support": ["L0001"]}\n');
    const out = execFileSync("python3", [join(b.engine, "fleet", "merge.py"), dir], { encoding: "utf8",
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
    const hunter = out.split("\n").find((l) => l.startsWith("forums")) ?? "";
    expect(hunter.trim().split(/\s+/)[2], out).toBe("0.51");
    expect(hunter).toMatch(/\bgoogle\b/);
    expect(out).toMatch(/\[forums\] round two/); // the HÜKÜM that stands is the last round's
    expect(out, "a claim ledger is not a hunter's transcript").not.toMatch(/^claims|\[claims(\.draft)?\]/m);
  });
});

describe("keep.sh — the kept answer is named after its question and carries its claim ledger", () => {
  it("slugs the first query line, not the fleet's header, and keeps the ledger, the draft, its ledger, the sub-questions and the audit", () => {
    const out = join(b.root, "keep-run");
    mkdirSync(join(out, "audit"), { recursive: true });
    const q = join(out, "question.txt");
    writeFileSync(q, "DERT (CEO'nun kendi cumlesi — ARANMAZ, cevabin bunu karsilamasi gerekir):\nWho prefers which one, and why?\n\n" +
      "SORGULAR (zemin bunlarla acildi):\n  - astra 6 vs fable 5.1\n  - astra 6 reddit\n\n" +
      "ALT SORULAR (S-kimlik · başlık · soru):\n  - S1 · Kim neyi seçiyor · Kim hangisini seçiyor?\n");
    for (const f of ["answer.md", "answer.draft.md", "claims.jsonl", "claims.draft.jsonl", "subquestions.json", "audit.jsonl",
      "audit/batch-1.txt"]) {
      writeFileSync(join(out, f), "x\n");
    }
    const kept = join(b.root, "kept");
    execFileSync("bash", [join(b.engine, "fleet", "keep.sh"), q, out], { encoding: "utf8",
      env: { ...process.env, DXB_RESEARCH_ANSWERS: kept } });
    const folders = readdirSync(kept);
    expect(folders).toHaveLength(1);
    expect(folders[0]).toMatch(/^\d{8}-\d{4}-astra-6-vs-fable-5-1$/);
    for (const f of ["answer.md", "answer.draft.md", "claims.jsonl", "claims.draft.jsonl", "subquestions.json", "question.txt",
      "audit.jsonl", "audit/batch-1.txt"]) {
      expect(existsSync(join(kept, folders[0], f)), f).toBe(true);
    }
  });
});

describe("K3 — his question is split into sub-questions before the ground opens, and every role is handed them", () => {
  const SPLIT = join(import.meta.dirname, "fixtures", "split");
  const BLOCK = "ALT SORULAR (S-kimlik · başlık · soru):";
  const Q = "astra 6 vs fable 5.1";
  const ARGS = ["--q", Q, "--roles", "x", "--timeout", "30", "--no-write"];
  const GOOD = { FAKE_SPLIT: join(SPLIT, "answer-good.json") };

  it("reads a model's answer bare, in a fence, and cut — the cut one falls back (split.py --selftest)", () => {
    const out = execFileSync("python3", [join(b.engine, "scripts", "split.py"), "--selftest"],
      { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
    expect(out.trim().split("\n").at(-1), out).toBe("SELFTEST OK 3/3");
  });

  it("names the sub-questions before the ground, hands them to the hunter through question.txt; --write-only reuses them", () => {
    const run = join(b.root, "split-good");
    const r = fleetWith(GOOD, run, ...ARGS);
    expect(r.stdout, r.stdout.slice(0, 2500)).toMatch(/^alt sorular: 4 \(kaynak: model · \$0\.00 · \d+s\) — S1 Platformlara göre kim neyi seçiyor · /m);
    expect(r.stdout).toMatch(/ · S4 Kim geçti, neden$/m);
    expect(r.stdout.search(/^alt sorular: /m)).toBeLessThan(r.stdout.indexOf("genis zemin 1 aciliyor"));
    const q = readFileSync(join(run, "question.txt"), "utf8");
    expect(q.endsWith(`\n\n${BLOCK}\n  - S1 · Platformlara göre kim neyi seçiyor · Her platformda profesyoneller bugün Astra 6'yı mı `
      + "Fable 5.1'i mi seçiyor?\n  - S2 · Hangi iş için hangisi · Hangi iş türünde (kod, ajan işi, yazı, 3D) hangisi öne çıkıyor ve neden?\n"
      + "  - S3 · Maliyet ve kota · Kullanıcılar hangi maliyet ve kota rakamlarını veriyor?\n"
      + "  - S4 · Kim geçti, neden · Kim hangisinden hangisine geçti ve gerekçesi ne?\n"), q).toBe(true);
    expect(readFileSync(join(run, "prompt-x.txt"), "utf8")).toContain(`${BLOCK}\n  - S1 · Platformlara göre kim neyi seçiyor · `);
    expect(JSON.parse(readFileSync(join(run, "subquestions.json"), "utf8")))
      .toMatchObject({ source: "model", items: [{ id: "S1" }, { id: "S2" }, { id: "S3" }, { id: "S4" }] });
    // no FAKE_SPLIT now: a call would fall back to one sub-question, so four means the file was reused (the tail after
    // it stops at this bench's ledger stand-in, which has no writer-rows: the line before it is what is measured)
    const w = fleetWith({}, "--write-only", run);
    expect(w.stdout, w.stdout.slice(0, 1500))
      .toMatch(/^alt sorular: 4 \(kaynak: model · \$0\.00 · \d+s\) — S1 .* \(subquestions\.json yeniden kullanıldı\)$/m);
    expect(readFileSync(join(run, "question.txt"), "utf8"), "the block is replaced, never doubled").toBe(q);
  }, 90_000);

  it("falls back to one sub-question, the DERT itself, when the answer cannot be read — and the run goes on", () => {
    const run = join(b.root, "split-cut");
    const dert = join(b.root, "dert-split.txt");
    writeFileSync(dert, "Who prefers Astra 6 or Fable 5.1, and why?\n");
    const r = fleetWith({ FAKE_SPLIT: join(SPLIT, "answer-cut.txt") }, run, ...ARGS, "--dert", dert);
    expect(r.stdout, r.stdout.slice(0, 2500)).toMatch(/^alt sorular: 1 \(kaynak: fallback · \$0\.00 · \d+s\) — S1 Sorunun tamamı$/m);
    expect(r.stdout).toMatch(/^ {3}split: model cevabı okunamadı — tek alt soru \(DERT\)$/m);
    expect(readFileSync(join(run, "question.txt"), "utf8"))
      .toMatch(/\nALT SORULAR \(S-kimlik · başlık · soru\):\n {2}- S1 · Sorunun tamamı · Who prefers Astra 6 or Fable 5\.1, and why\?\n$/);
    expect(r.stdout).toMatch(/^gate: x round 1 — unread 0 → accepted /m);
  }, 90_000);

  it("--no-split leaves question.txt as the fleet wrote it", () => {
    const run = join(b.root, "split-none");
    const r = fleet(run, ...ARGS, "--no-split");
    expect(r.stdout, r.stdout.slice(0, 2500)).toMatch(/^alt sorular: atlandi \(--no-split\)$/m);
    expect(readFileSync(join(run, "question.txt"), "utf8")).toBe(`SORGULAR (zemin bunlarla acildi):\n  - ${Q}\n`);
    expect(existsSync(join(run, "subquestions.json"))).toBe(false);
  }, 90_000);

  it("keeps no earlier split's subquestions.json in a full run that does not split: --no-split, or a split.py that fails", () => {
    // the lead's measurement: a run folder used again with --no-split kept the first run's four sub-questions, and
    // kapsama.py printed `ALT SORU: 4 · tam 0 · boş 0 · eksik 4` for a question.txt that holds none
    const run = join(b.root, "split-again");
    const json = join(run, "subquestions.json");
    fleetWith(GOOD, run, ...ARGS);
    expect(existsSync(json)).toBe(true);
    expect(fleet(run, ...ARGS, "--no-split").stdout).toMatch(/^alt sorular: atlandi \(--no-split\)$/m);
    expect(existsSync(json), "--no-split").toBe(false);
    fleetWith(GOOD, run, ...ARGS);
    expect(existsSync(json)).toBe(true);
    const split = join(b.engine, "scripts", "split.py");       // this bench's copy, put back whatever happens
    renameSync(split, `${split}.real`);
    writeFileSync(split, "raise SystemExit(1)\n");
    let failed = { code: 0, stdout: "" };
    try {
      failed = fleet(run, ...ARGS);
    } finally {
      renameSync(`${split}.real`, split);
    }
    expect(failed.stdout, failed.stdout.slice(0, 2500)).toMatch(/^!! alt sorular: split\.py kod 1 — /m);
    expect(existsSync(json), "split.py failed").toBe(false);
    expect(readFileSync(join(run, "question.txt"), "utf8")).toBe(`SORGULAR (zemin bunlarla acildi):\n  - ${Q}\n`);
  }, 90_000);
});

describe("K3 — the writer's clock is --writer-timeout, a tail that wrote no answer is no answer, and an auditor reads every claim", () => {
  // The gate's bench (completion-gate.test.ts): its ledger answers writer-rows, its `claude` writes — slower than its
  // clock under FAKE_WRITER_SLEEP — and its coverage table carries the ledger's RECONCILED line under it, as kapsama.py's.
  const GATE = join(import.meta.dirname, "fixtures", "gate");
  const ARGS = ["--q", "astra 6 vs fable 5.1", "--roles", "x", "--timeout", "60", "--no-split", "--no-claim-hunt"];
  let g: Bench;
  const on = (env: Record<string, string>, ...args: string[]) => fleetOn(g, { FAKE_HUNTER: "batch",
    FAKE_ANSWER_FILE: join(GATE, "writer-answer.md"), FAKE_DRAFT_FILE: join(GATE, "writer-draft.md"), ...env }, ...args);

  beforeAll(() => {
    g = makeBench();
    for (const [stub, into] of [["evidence-stub.py", "evidence.py"], ["triage-stub.py", "triage.py"], ["render-stub.py", "render.py"],
      ["claims-stub.py", "claims.py"]]) {
      copyFileSync(join(GATE, stub), join(g.engine, "scripts", into));
    }
    writeFileSync(join(g.engine, "scripts", "kapsama.py"),
      `${readFileSync(join(GATE, "kapsama-stub.py"), "utf8")}print("RECONCILED — the ledger's sums, under the table")\n`);
    copyFileSync(join(FX, "sweep-stub.sh"), join(g.engine, "scripts", "sweep.sh"));
    copyFileSync(join(GATE, "claude-stub.py"), join(g.bin, "claude"));
    chmodSync(join(g.bin, "claude"), 0o755);
  });
  afterAll(() => g?.dispose());

  it("names a writer its clock stopped `zaman asimi`, prints the coverage table, then !! CEVAP YOK — no CEVAP HAZIR, code 1", () => {
    const run = join(g.root, "clock-short");
    const r = on({ FAKE_WRITER_SLEEP: "5" }, run, ...ARGS, "--writer-timeout", "1");
    const s = r.stdout;
    expect(r.code, s.slice(-2500)).toBe(1);
    expect(s).toMatch(/^writer \(taslak\): \d+ satir · \d+ KB -> claude-opus-5-5 · efor medium · zaman siniri 1s$/m);
    expect(s).toMatch(/^!! writer \(taslak\): zaman asimi \(1 s\) — cost \$\? · \d+ s · answer\.draft\.md yazilmadi: /m);
    expect(s).not.toMatch(/CEVAP HAZIR|ONA SOR/);
    // what the field measured stands: the coverage table and the ledger's sums print after the tail fell
    const table = s.indexOf("KAPSAMA — nereye bakildi");
    expect(table).toBeGreaterThan(s.indexOf("zaman asimi (1 s)"));
    expect(s.slice(table)).toMatch(/^RECONCILED — /m);
    expect(s.search(/^!! CEVAP YOK: kuyruk basarisiz \(kod 1\) — answer\.md yazilmadi, sayfa yok; kosu kodu 1: .*\/writer\*\.err$/m))
      .toBeGreaterThan(table);
    expect(existsSync(join(run, "answer.md"))).toBe(false);
  }, 60_000);

  it("says its clock on the launch line — 1500 s by default, the flag's after --write-only — and the model's time and tokens", () => {
    const run = join(g.root, "clock-default");
    const r = on({}, run, ...ARGS);
    expect(r.code, r.stdout.slice(-2500)).toBe(0);
    for (const [tag, ans] of [["taslak", "answer\\.draft\\.md"], ["son", "answer\\.md"]]) {
      expect(r.stdout).toMatch(new RegExp(`^writer \\(${tag}\\): \\d+ satir · \\d+ KB -> claude-opus-5-5 · efor medium · zaman siniri 1500s$`, "m"));
      // the stand-in's envelope says duration_ms 1234 and no usage: its second, and `?` for the tokens it does not say
      expect(r.stdout).toMatch(new RegExp(`^writer \\(${tag}\\): cost \\$0\\.42 · \\d+ s -> .*/${ans} · model 1 s · out \\? · `, "m"));
    }
    expect(r.stdout).toContain("CEVAP HAZIR");
    const w = on({}, "--write-only", run, "--writer-timeout", "42", "--no-split", "--no-claim-hunt");
    expect(w.code, w.stdout).toBe(0);
    expect(w.stdout).toMatch(/^writer \(taslak\): .* -> claude-opus-5-5 · efor medium · zaman siniri 42s$/m);
    expect(w.stdout).toMatch(/^writer \(son\): .* -> claude-opus-5-5 · efor medium · zaman siniri 42s$/m);
  }, 60_000);

  // K3 STAGE 3 — THE AUDITOR. The writer's answer here is fixtures/audit/fleet-answer.md: its verdict and two list items,
  // citing L0008 (the x hunter's quote, the one row this bench's ledger admits) and L0002 (judged no evidence).
  const ANSWER = join(AUDIT, "fleet-answer.md");
  const jsonl = (p: string): Record<string, any>[] => readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));

  it("rewrites answer.md with what the auditor corrected and removed, extracts the ledger again, checks it, then the page", () => {
    const run = join(g.root, "audit-good");
    const r = on({ FAKE_ANSWER_FILE: ANSWER, FAKE_AUDIT: join(AUDIT, "fleet-good") }, run, ...ARGS);
    const s = r.stdout;
    expect(r.code, s.slice(-2500)).toBe(0);
    // the auditor's line, what apply did, the answer's ledger once more, check, the page — in that order
    const steps = [/^denetçi: 3 iddia okundu · 1 düzeltildi · 1 çıkarıldı · 0 denetlenmedi · \$0\.00 · \d+s$/m,
      /^ {3}apply: 1 satır düzeltildi · 1 satır silindi$/m, /^claims: 2 · .* · inadmissible-cited \d+ · carried \d+$/m, /^ {3}check: OK 3$/m, /^ {3}render: stand-in page -> /m]
      .map((re) => s.search(re));
    expect(steps.every((at) => at > s.indexOf("writer (son): cost")), s.slice(-2500)).toBe(true);
    expect(steps).toEqual([...steps].sort((x, y) => x - y));
    // the auditor's own line for C002, C003's line gone, the verdict as the writer wrote it
    const lines = readFileSync(ANSWER, "utf8").split("\n");
    expect(readFileSync(join(run, "answer.md"), "utf8"))
      .toBe([...lines.slice(0, 4), "- Astra 6 on beş görevin onunu kazandı [L0008].", ...lines.slice(6)].join("\n"));
    expect(jsonl(join(run, "audit.jsonl")).map((a) => `${a.id_before} ${a.id} ${a.verdict} ${a.line_no}`))
      .toEqual(["C001 C001 ok 1", "C002 C002 corrected 5", "C003 null removed 6"]);
    expect(readFileSync(join(run, "audit", "batch-1.txt"), "utf8")).toMatch(/^### C001 · hüküm\n.*\[L0008\]\.\ndayanak:\n {2}\[L0008\] x · /m);
    expect(existsSync(join(run, "final.html"))).toBe(true);
    expect(s).toMatch(/^ {2}keep\.sh saklar: .* · audit\.jsonl · audit\/ · /m);
  }, 60_000);

  it("asks an unreadable batch once more; still unreadable, its claims stay unaudited: the page, then !! DENETLENMEYEN İDDİA, code 1", () => {
    const run = join(g.root, "audit-cut");
    const cut = { FAKE_ANSWER_FILE: ANSWER, FAKE_AUDIT: join(AUDIT, "fleet-cut") };
    const unaudited = /^!! DENETLENMEYEN İDDİA: 3 \(C001 C002 C003\) — denetçi okumadı, kapı kabul etmedi; kosu kodu 1: .*\/audit\/$/m;
    const r = on(cut, run, ...ARGS);
    const s = r.stdout;
    expect(r.code, s.slice(-2500)).toBe(1);
    expect(s).toMatch(/^denetçi: 0 iddia okundu · 0 düzeltildi · 0 çıkarıldı · 3 denetlenmedi · \$0\.00 · \d+s$/m);
    expect(s).toMatch(/^ {3}denetçi: parti 1: 3\/3 iddia okunamadı \(cevapta okunur JSON yok\) — yeniden soruluyor \(1\/1\)$/m);
    expect(readFileSync(join(run, "audit", "batch-1.retry.txt"), "utf8").match(/^### C\d{3}/gm)).toEqual(["### C001", "### C002", "### C003"]);
    expect(readFileSync(join(run, "answer.md"), "utf8"), "nothing was applied").toBe(readFileSync(ANSWER, "utf8"));
    // the page stands, and the line comes after it and after the coverage table, with the run's other `!!` lines
    expect(existsSync(join(run, "final.html"))).toBe(true);
    expect(s.search(unaudited)).toBeGreaterThan(s.indexOf("KAPSAMA — nereye bakildi"));
    const w = on(cut, "--write-only", run, "--no-split", "--no-claim-hunt");
    expect(w.code, w.stdout.slice(-2500)).toBe(1);
    expect(w.stdout.search(unaudited)).toBeGreaterThan(w.stdout.search(/^ {3}render: stand-in page/m));
  }, 60_000);

  it("runs the auditor after --write-only — the model's stand-in, outside the repository, when no FAKE_AUDIT — and --no-audit skips it", () => {
    const run = join(g.root, "audit-model");
    expect(on({}, run, ...ARGS).code).toBe(0);
    const w = on({ FAKE_AUDIT: "" }, "--write-only", run, "--no-split", "--no-claim-hunt");
    expect(w.code, w.stdout.slice(-2500)).toBe(0);
    expect(w.stdout).toMatch(/^denetçi: 4 iddia okundu · 0 düzeltildi · 0 çıkarıldı · 0 denetlenmedi · \$0\.00 · \d+s$/m);
    // it changed nothing: the ledger step (5) wrote stands — no second extract, no check
    expect(w.stdout).toMatch(/^ {3}apply: 0 satır düzeltildi · 0 satır silindi\ndenetçi: cevap değişmedi — yeniden çıkarım ve check atlandı$/m);
    expect(readFileSync(join(run, "audit", "batch-1.left", "auditor-launch.txt"), "utf8").split("\n"))
      .toEqual(["-p", "--model", "claude-opus-5-5", "--effort", "low", "--tools", "", "--strict-mcp-config", "--output-format", "json", ""]);
    expect(readFileSync(join(run, "audit", "batch-1.left", "cwd.txt"), "utf8")).toMatch(/\/dxb-hunters\/audit-model\.audit\.\w+\n$/);
    expect(jsonl(join(run, "audit.jsonl")).map((a) => a.reason)).toEqual(Array(4).fill("denetçi taklidi"));
    // skipped: and the audit an earlier tail left goes with it — the page reads the one beside the answer
    const n = on({}, "--write-only", run, "--no-split", "--no-claim-hunt", "--no-audit");
    expect(n.code, n.stdout.slice(-2500)).toBe(0);
    expect(n.stdout).toMatch(/^denetçi: atlandi \(--no-audit\)$/m);
    expect(existsSync(join(run, "audit.jsonl")) || existsSync(join(run, "audit"))).toBe(false);
  }, 60_000);
});
