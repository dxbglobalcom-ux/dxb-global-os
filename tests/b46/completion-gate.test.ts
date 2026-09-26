// B56 · K1 · LANE B — THE FLEET, NOT THE HUNTER, DECIDES WHEN A PLATFORM IS FINISHED.
//
// WHAT WAS MEASURED on the deep run of 2026-09-26 02:34 (EVIDENCE-B56-K1): 142 of the 272 X addresses
// were never fetched; the x hunter printed 350 characters of 128 bodies in one command cut at 20,000,
// saw 73, declared "okundu 130" and left at 64 s of 600 — all seven hunters left at 51-243 s — and the
// run lived in a session's scratchpad on /tmp, a tmpfs here. So: every address is fetched and sorted
// before a hunter starts, a hunter reads through `batch` and judges every row it printed, the ledger —
// not the hunter — says when its platforms are finished, the run lives under the repository, and an
// Opus writer turns the rows into answer.md.
//
// WHAT IS GUARDED HERE, BY RUNNING IT. The engine is copied into a repository-shaped folder (the default
// run folder is <repo>/var/research/runs), and inside the COPY the ground, the ledger, the triage and
// the page and the coverage table are stand-ins that keep real state and print the contract's shapes
// (fixtures/gate/); `claude` is a stand-in hunter and writer. The fleet, its gate, its writer step and
// merge.py are the real ones. A real hunter costs money and is the lead's live run.
//
// B56 K2 — THE TAIL. Measured on the kept K1 run (EVIDENCE-B56-K2 §1): 12 of the answer's 150 cited ids
// were rows a hunter had judged "kanıt değil", and nothing looked for the other side of a claim. So after
// the gate the writer drafts, scripts/claims.py turns the draft's claims into a ledger, a counter hunter
// (karsi) and a gap hunter (bosluk) work that ledger under a gate of their own, the writer's second pass
// writes answer.md, its ledger carries the links, and the page is rendered. In the bench claims.py is a
// contract stand-in too (claims-stub.py) — the real one is Lane A's — and `claude` plays both claim roles.

import { execFileSync } from "node:child_process";
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Bench, makeBench } from "./engine-copy.js";

const FX = join(import.meta.dirname, "fixtures", "gate");
const Q = "astra 6 vs fable 5.1";
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
let b: Bench;
let repo = "";
let engine = "";

beforeAll(() => {
  b = makeBench();
  repo = join(b.root, "repo");
  engine = join(repo, ".claude/skills/dxb-research");
  mkdirSync(dirname(engine), { recursive: true });
  renameSync(b.engine, engine);
  for (const [stub, into] of [["evidence-stub.py", "evidence.py"], ["triage-stub.py", "triage.py"], ["render-stub.py", "render.py"],
    ["kapsama-stub.py", "kapsama.py"], ["claims-stub.py", "claims.py"]]) {
    copyFileSync(join(FX, stub), join(engine, "scripts", into));
  }
  copyFileSync(join(import.meta.dirname, "fixtures", "fleet", "sweep-stub.sh"), join(engine, "scripts", "sweep.sh"));
  copyFileSync(join(FX, "claude-stub.py"), join(b.bin, "claude"));
  chmodSync(join(b.bin, "claude"), 0o755);
});
afterAll(() => b?.dispose());

function fleet(args: string[], env: Record<string, string> = {}): { code: number; out: string; run: string } {
  let out = "";
  let code = 0;
  try {
    out = execFileSync("bash", [join(engine, "fleet", "fleet.sh"), ...args], {
      encoding: "utf8",
      env: { ...process.env, ...env, PATH: `${b.bin}:${process.env.PATH}`, PYTHONDONTWRITEBYTECODE: "1",
        FAKE_ANSWER_FILE: join(FX, "writer-answer.md"), FAKE_DRAFT_FILE: join(FX, "writer-draft.md") },
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 90_000,
    });
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    out = String(err.stdout ?? "") + String(err.stderr ?? "");
    code = err.status ?? 1;
  }
  return { code, out, run: /^kosu {4}: (.+?)(?: {2}\(yalniz kuyruk\))?$/m.exec(out)?.[1] ?? "" };
}
const hunt = (name: string, mode: string, extra: string[] = [], env: Record<string, string> = {}) =>
  fleet([name, "--q", Q, "--roles", "x", "--timeout", "60", "--no-write", ...extra], { FAKE_HUNTER: mode, ...env });

/** One cell of the coverage table the run printed last (kapsama.py): the platform's row, the named column. */
function coverage(out: string, platform: string, column: string): string {
  const lines = out.slice(out.indexOf("KAPSAMA — nereye bakildi")).split("\n").filter((l) => l.startsWith("|"));
  const cells = (l: string) => l.split("|").slice(1, -1).map((c) => c.trim());
  const col = cells(lines[0]).indexOf(column);
  const row = lines.map(cells).find((c) => c[0] === platform);
  return row && col >= 0 ? row[col] : "(yok)";
}

describe("the completion gate — the ledger says when a hunter's platforms are finished", () => {
  it("sends a hunter that leaves at once back to its unread rows, and keeps the last round's HÜKÜM", () => {
    const r = hunt("gate-exit", "exit");
    expect(r.out, r.out.slice(-2000)).toMatch(/^gate: x round 1 — unread 3 → relaunch /m);
    expect(r.out).toMatch(/^gate: x round 2 — unread 3 → relaunch /m);
    expect(r.out).toMatch(/^gate: x round 3 — unread 3 → time-up .*tur 3\/3/m);
    expect(readFileSync(join(r.run, "rounds", "prompt-x.r2.txt"), "utf8"))
      .toMatch(/^DEVAM — 3 unread · 0 partial · 0 unjudged on x; continue with batch\n/);
    for (const n of [1, 2, 3]) expect(existsSync(join(r.run, "rounds", `x.r${n}.jsonl`)), `round ${n}`).toBe(true);
    expect(readFileSync(join(r.run, "HUNTER-x.md"), "utf8")).toContain("x stand-in verdict, resumed round");
    expect(readFileSync(join(r.run, "x.meta"), "utf8")).toMatch(/^rounds=3$/m);
  }, 60_000);

  it("accepts at the first round a hunter that read everything through batch and judged it", () => {
    const r = fleet(["--q", Q, "--roles", "x", "--timeout", "60"], { FAKE_HUNTER: "batch" });
    expect(r.code, r.out.slice(-2000)).toBe(0);
    expect(r.out).toMatch(/fetch-all: tried 2 · bodies 1 · closed 1/);
    expect(r.out).toMatch(/^gate: x round 1 — unread 0 → accepted /m);
    expect(r.out).not.toMatch(/^gate: x round 2/m);
    // the writer is on by default, after the gate
    expect(r.out).toMatch(/^writer \(son\): cost \$0\.42 · \d+ s -> /m);
    expect(existsSync(join(r.run, "answer.md"))).toBe(true);
  }, 60_000);

  it("sends back a hunter that read but judged nothing, and the resume line names both numbers", () => {
    const r = hunt("gate-nojudge", "nojudge");
    expect(r.out, r.out.slice(-2000)).toMatch(/^gate: x round 1 — unread 0 → relaunch {2}\(unjudged 3 · /m);
    expect(r.out).toMatch(/^gate: x round 2 — unread 0 → accepted /m);
    expect(readFileSync(join(r.run, "rounds", "prompt-x.r2.txt"), "utf8"))
      .toMatch(/^DEVAM — 0 unread · 0 partial · 3 unjudged on x; continue with batch\n/);
  }, 60_000);

  it("relaunches a hunter that exits non-zero the same way, each exit a round", () => {
    const r = hunt("gate-rc9", "batch", [], { FAKE_RC: "9" });
    expect(r.out, r.out.slice(-2000)).toMatch(/^gate: x round 1 — unread 0 → relaunch {2}\(kod 9 · /m);
    expect(r.out).toMatch(/^gate: x round 3 — unread 0 → time-up {2}\(kod 9 · .*tur 3\/3/m);
  }, 60_000);

  it("counts a body printed only in part as owed: the hunter is sent back to it, the resume line names all three", () => {
    // round 1 judges two rows read whole and leaves the third partial (batch --max-chars 20): nothing is
    // unread or unjudged, so only `partial` can send it back; round 2's batch continues the row
    const r = hunt("gate-partial", "partial");
    expect(r.out, r.out.slice(-2000)).toMatch(/^gate: x round 1 — unread 0 → relaunch {2}\(unjudged 0 · partial 1 · /m);
    expect(readFileSync(join(r.run, "rounds", "prompt-x.r2.txt"), "utf8"))
      .toMatch(/^DEVAM — 0 unread · 1 partial · 0 unjudged on x; continue with batch\n/);
    expect(r.out).toMatch(/^gate: x round 2 — unread 0 → accepted {2}\(unjudged 0 · partial 0 · /m);
  }, 60_000);

  it("never accepts a round whose ledger status cannot be read: unmeasured, then time-up (unmeasured), exit 1", () => {
    // the stand-in reads and judges everything, so a gate that took the unreadable status for zero said `accepted`
    const r = hunt("gate-blind", "batch", ["--rounds", "2"], { FAKE_STATUS: "unreadable" });
    expect(r.out, r.out.slice(-2000)).toMatch(/^gate: x round 1 — status unreadable → unmeasured {2}\(/m);
    expect(r.out).toMatch(/^gate: x round 2 — status unreadable → time-up \(unmeasured\) {2}\(.*tur 2\/2/m);
    expect(r.out).not.toMatch(/→ accepted/);
    expect(readFileSync(join(r.run, "x.meta"), "utf8")).toMatch(/^gate=time-up \(unmeasured\)$/m);
    expect(r.out).toMatch(/^!! OLCULMEYEN AVCI: x\(unmeasured\) — /m);
    expect(r.code).toBe(1);
  }, 60_000);
});

describe("the run lives on disk, under the repository", () => {
  it("puts a bare name, or no name, under <repo>/var/research/runs", () => {
    const named = hunt("gate-named", "batch");
    expect(named.run).toMatch(new RegExp(`^${esc(repo)}/var/research/runs/\\d{8}-\\d{4}-gate-named$`));
    const bare = fleet(["--q", "Fable 5.1 coding", "--roles", "x", "--timeout", "60", "--no-write"], { FAKE_HUNTER: "batch" });
    expect(bare.run).toMatch(new RegExp(`^${esc(repo)}/var/research/runs/\\d{8}-\\d{4}-fable-5-1-coding$`));
    expect(existsSync(join(bare.run, "evidence.jsonl"))).toBe(true);
  }, 60_000);

  it("refuses a run folder under /tmp, with the reason, unless --allow-tmp", () => {
    const parent = mkdtempSync("/tmp/dxb-gate-");
    try {
      const out = join(parent, "run");
      const refused = hunt(out, "batch");
      expect(refused.code).toBe(3);
      expect(refused.out).toMatch(/!! DUR: kosu klasoru \/tmp altinda .*tmpfs/);
      expect(refused.out).toContain("--allow-tmp");
      expect(existsSync(out), "nothing is created for a refused run").toBe(false);
      const allowed = hunt(out, "batch", ["--allow-tmp"]);
      expect(allowed.code, allowed.out.slice(-1500)).toBe(0);
      expect(allowed.run).toBe(out);
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  }, 60_000);
});

describe("what a hunter declares changes no count", () => {
  it("prints 'okundu 130' as the hunter's claim, while the gate and the coverage table count the ledger", () => {
    const r = hunt("gate-declare", "declare");
    expect(r.out, r.out.slice(-2000)).toContain("[x] PLATFORM x: bulundu 3 / okundu 130");
    expect(r.out).toMatch(/^gate: x round 1 — unread 3 → relaunch /m);
    const status = JSON.parse(execFileSync("python3", [join(engine, "scripts", "evidence.py"), "status", r.run, "--format", "json"],
      { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } }));
    expect(coverage(r.out, "X", "Okundu")).toBe(String(status.platforms.x.read));
    expect(coverage(r.out, "X", "Okundu")).toBe("0");
    expect(r.out).toContain("writer: atlandi (--no-write)");
    expect(existsSync(join(r.run, "answer.md"))).toBe(false);
  }, 60_000);
});

describe("the writer step — an Opus turns the rows into answer.md", () => {
  it("--write-only hands a tool-less Opus at high effort the question, the verdicts, the status and the rows", () => {
    const done = hunt("gate-write", "batch");
    expect(existsSync(join(done.run, "answer.md")), done.out.slice(-1500)).toBe(false);
    const r = fleet(["--write-only", done.run]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toMatch(/^writer \(son\): cost \$0\.42 · \d+ s -> .* · http 0$/m);
    const canned = readFileSync(join(FX, "writer-answer.md"), "utf8");
    const answer = readFileSync(join(done.run, "answer.md"), "utf8");
    expect(answer).toBe(canned.trim() + "\n");
    expect(answer).not.toMatch(/https?:/);
    // what the writer left in its own folder comes back under <run>/writer
    expect(readFileSync(join(done.run, "writer", "writer-launch.txt"), "utf8").split("\n")).toEqual(
      ["-p", "--model", "claude-opus-5-5", "--effort", "high", "--tools", "", "--strict-mcp-config", "--output-format", "json", ""]);
    const prompt = readFileSync(join(done.run, "writer", "writer-stdin.txt"), "utf8");
    expect(prompt).toContain(`SORGULAR (zemin bunlarla acildi):\n  - ${Q}`);
    expect(prompt).toContain("[x] HÜKÜM: x stand-in verdict, first round");
    expect(prompt).toMatch(/^RECONCILED$/m);
    expect(prompt).toContain('[L0001] x · @dev_one · 2026-09-20 · "Astra 6 won ten of fifteen tasks. The cost was lower too." · https://x.com/dev_one/status/1001');
    expect(prompt, "the quote the hunter kept").toContain('[L0008] x · @dev_one · 2026-09-20 · "Astra 6 won ten of fifteen tasks." · https://x.com/dev_one/status/1001');
    expect(prompt, "a row the triage found irrelevant").not.toContain("[L0005]");
    // B56 K2: the rows are what `evidence.py writer-rows` admits — a row the hunter judged `none` is not one
    expect(prompt, "a row judged 'kanıt değil'").not.toContain("[L0002]");
    // the first pass is told there is no claim ledger yet; the second is handed the draft's ledger, links in
    expect(readFileSync(join(done.run, "writer-draft", "writer-stdin.txt"), "utf8")).toContain("(ilk geçiş — iddia defteri henüz yok)");
    expect(prompt).toMatch(/^C001 · .* · dayanak \[L0001, L0008\] \(2 satır · 1 bağımsız kaynak · 1 başlık\) · .* · yeni kaynak \[L\d+\]/m);
    // the page with no --out, so render.py writes final.html and final.md beside it
    const argv = readFileSync(join(done.run, "render-argv.txt"), "utf8").split("\n");
    expect(argv.slice(0, 3)).toEqual([join(done.run, "answer.md"), "--evidence", join(done.run, "evidence.jsonl")]);
    expect(argv).not.toContain("--out");
  }, 60_000);
});

describe("every claude stands outside the repository — the run stays under var/", () => {
  it("starts the hunter, both writer passes and the claim hunters outside the repository and brings their files back", () => {
    // A `claude` started inside this repository loads its CLAUDE.md and its hooks (the lead's
    // measurement, 2026-09-26), and the run folder is inside it now.
    const r = hunt("gate-where", "batch");
    expect(r.run, r.out.slice(-1500)).toMatch(new RegExp(`^${esc(repo)}/var/research/runs/\\d{8}-\\d{4}-gate-where$`));
    const w = fleet(["--write-only", r.run]);
    expect(w.code, w.out).toBe(0);
    for (const where of [join(r.run, "work-x", "cwd.txt"), join(r.run, "writer-draft", "cwd.txt"), join(r.run, "writer", "cwd.txt"),
      join(r.run, "work-karsi", "cwd.txt"), join(r.run, "work-bosluk", "cwd.txt")]) {
      const cwd = readFileSync(where, "utf8").trim();
      expect(cwd.startsWith(`${repo}/`), `${where}: ${cwd}`).toBe(false);
      expect(cwd.startsWith(`${engine}/`)).toBe(false);
      expect(existsSync(cwd), "the outside folder is gone once its files are back").toBe(false);
    }
  }, 60_000);
});

describe("the tail — a draft, its claim ledger, two claim hunters, the answer, its ledger, the page (B56 K2)", () => {
  /** Where each marker stands in the log, each searched after the one before it; -1 when it is missing or out of order. */
  function inOrder(out: string, marks: RegExp[]): number[] {
    let from = 0;
    return marks.map((m) => {
      const i = out.slice(from).search(m);
      if (i < 0) return -1;
      from += i + 1;
      return from - 1;
    });
  }
  const TAIL = [/^writer \(taslak\): cost /m, /^claims: \d+ · thin \d+ · counter-less \d+$/m, /^claim-gate: karsi round 1 — /m,
    /^claim-gate: bosluk round 1 — /m, /^writer \(son\): cost /m,
    /^claims: \d+ · thin \d+ · counter-less \d+ · inadmissible-cited \d+ · carried \d+$/m, /^\s+render: /m];

  it("drafts, extracts the claims, sends karsi then bosluk, writes the answer, carries the links and renders", () => {
    const r = fleet(["tail-order", "--q", Q, "--roles", "x", "--timeout", "60"], { FAKE_HUNTER: "batch" });
    expect(r.code, r.out.slice(-2500)).toBe(0);
    expect(inOrder(r.out, TAIL), r.out.slice(-2500)).not.toContain(-1);
    // the crowd's thread is the ledger's reddit row with a body — the raw ground holds none
    expect(r.out).toMatch(/^kalabalik sayiliyor: 1 baslik \(defterden\)$/m);
    // karsi closed its one claim; bosluk found a second source for both — new `for` links, so not saturated
    expect(r.out).toMatch(/^claim-gate: karsi round 1 — unchecked 0 → accepted \(found 0 · none 1 · /m);
    expect(r.out).toMatch(/^claim-gate: bosluk round 1 — unchecked 0 → accepted \(found 2 · none 0 · /m);
    expect(readFileSync(join(r.run, "gate.log"), "utf8")).toMatch(/^claim-gate: karsi round 1 [^\n]*\nclaim-gate: bosluk round 1 /m);
    // the final ledger carries what bosluk linked on the draft
    const final = readFileSync(join(r.run, "claims.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
    expect(final.some((c) => (c.links ?? []).some((x: { kind: string }) => x.kind === "for")), JSON.stringify(final)).toBe(true);
    for (const f of ["answer.draft.md", "claims.draft.jsonl", "answer.md", "final.html"]) expect(existsSync(join(r.run, f)), f).toBe(true);
  }, 60_000);

  it("sends back a claim hunter that linked nothing, and stops a gap round that found no new source (saturated)", () => {
    const r = fleet(["tail-lazy", "--q", Q, "--roles", "x", "--timeout", "60"], { FAKE_HUNTER: "batch,karsi-lazy,bosluk-lazy" });
    expect(r.out, r.out.slice(-2500)).toMatch(/^claim-gate: karsi round 1 — unchecked 1 → relaunch \(found 0 · none 0 · /m);
    expect(readFileSync(join(r.run, "rounds", "prompt-karsi.r2.txt"), "utf8"))
      .toMatch(/^DEVAM — 1 claims unchecked on your list; finish them with link\n/);
    expect(r.out).toMatch(/^claim-gate: karsi round 2 — unchecked 1 → time-up \(.*tur 2\/2/m);
    expect(r.out).toMatch(/^claim-gate: bosluk round 1 — unchecked 2 → stopped \(saturated\) \(/m);
    expect(r.out).not.toMatch(/^claim-gate: bosluk round 2/m);
  }, 60_000);

  it("never accepts a claim round whose ledger status cannot be read", () => {
    const r = fleet(["tail-blind", "--q", Q, "--roles", "x", "--timeout", "60"], { FAKE_HUNTER: "batch", FAKE_CLAIM_STATUS: "unreadable" });
    expect(r.out, r.out.slice(-2500)).toMatch(/^claim-gate: karsi round 1 — status unreadable → unmeasured \(/m);
    expect(r.out).toMatch(/^claim-gate: karsi round 2 — status unreadable → time-up \(unmeasured\) \(/m);
    expect(r.out).not.toMatch(/^claim-gate: .*→ accepted/m);
  }, 60_000);

  it("writes the page, then names a claim role its gate could not measure on the run's last line and leaves with code 1", () => {
    // `status` answers exit 0 with a line that is not JSON: nothing is measured, so nothing may be accepted
    const r = fleet(["tail-garbage", "--q", Q, "--roles", "x", "--timeout", "60"], { FAKE_HUNTER: "batch", FAKE_CLAIM_STATUS: "garbage" });
    expect(r.out, r.out.slice(-2500)).toMatch(/^claim-gate: bosluk round 2 — status unreadable → time-up \(unmeasured\) \(/m);
    expect(existsSync(join(r.run, "final.html")), "the page is still written").toBe(true);
    const marker = r.out.search(/^!! OLCULMEYEN IDDIA TURU: karsi\(unmeasured\) bosluk\(unmeasured\) — /m);
    expect(marker).toBeGreaterThan(r.out.search(/^\s+render: /m));
    expect(marker).toBeGreaterThan(r.out.indexOf("CEVAP HAZIR"));
    expect(r.code).toBe(1);
  }, 60_000);

  it("--no-claim-hunt writes both passes, both ledgers and the page with no claim round", () => {
    const r = fleet(["tail-nohunt", "--q", Q, "--roles", "x", "--timeout", "60", "--no-claim-hunt"], { FAKE_HUNTER: "batch" });
    expect(r.code, r.out.slice(-2500)).toBe(0);
    expect(r.out).not.toMatch(/claim-gate:/);
    expect(inOrder(r.out, [TAIL[0], TAIL[1], TAIL[4], TAIL[5], TAIL[6]]), r.out.slice(-2500)).not.toContain(-1);
    expect(existsSync(join(r.run, "work-karsi"))).toBe(false);
  }, 60_000);

  it("a draft whose claim ledger was never written still ends in the answer's ledger and the page, with no links to carry", () => {
    // claims.py refuses a --keep-links ledger it cannot read (code 2): passed blindly, it cost the answer its claims.jsonl
    const r = fleet(["tail-nodraft", "--q", Q, "--roles", "x", "--timeout", "60"], { FAKE_HUNTER: "batch", FAKE_CLAIM_EXTRACT: "draft-fails" });
    expect(r.out, r.out.slice(-2500)).toMatch(/^!! iddia turlari: taslagin iddia defteri yok — /m);
    const final = /^claims: \d+ · thin \d+ · counter-less \d+ · inadmissible-cited \d+ · carried 0$/m;
    expect(inOrder(r.out, [TAIL[4], /^claims: taslak defteri yok — bağlar taşınmadı$/m, final, TAIL[6]]), r.out.slice(-2500)).not.toContain(-1);
    expect(existsSync(join(r.run, "claims.draft.jsonl"))).toBe(false);
    expect(existsSync(join(r.run, "claims.jsonl"))).toBe(true);
  }, 60_000);

  it("--write-only runs the same tail on a run that has its rows", () => {
    const done = hunt("tail-wo", "batch");
    expect(existsSync(join(done.run, "answer.draft.md")), done.out.slice(-1500)).toBe(false);
    const r = fleet(["--write-only", done.run]);
    expect(r.code, r.out).toBe(0);
    expect(inOrder(r.out, TAIL), r.out).not.toContain(-1);
  }, 60_000);
});
