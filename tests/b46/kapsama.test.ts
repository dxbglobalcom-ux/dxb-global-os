// B56 — THE COVERAGE RULER PRINTS WHERE WAS LOOKED, AND IT NEVER BLOCKS THE PAGE.
//
// WHY. The answer the CEO rejected on 2026-09-24 stood on a ground that had found 294 X addresses;
// the hunters opened one and the answer cited none, and not one line said so before he read it.
// scripts/kapsama.py prints that per platform under every answer (render.py appends it) and before the
// answer is written (fleet.sh prints it). On 2026-09-26 he asked why 272 X addresses became 4 on the
// page: the ledger now carries a triage state and a machine-marked read state per address, so the table
// has nine columns — Bulundu · İndirildi · İlgili · Okundu · Kısmen · Cevapta · Elenen · Kapalı kapı —
// and under it the ledger's own sums, RECONCILED or MISMATCH, the numbers evidence.py status prints
// (EVIDENCE-B56-K1 §2.5). A ruler that stopped the page when its numbers were bad would take the page
// away from him, so it prints and exits 0 whatever it measures; only a missing run folder is an error.
//
// run-drawer is built for the states: thirteen rows on X, Reddit and YouTube carrying every triage and
// read state, a hunter's quote row on an address it shares, and a hunter line claiming "okundu 130".
// The other runs are cut from that rejected run, made before the states: run-coverage holds four rows of its evidence
// (three Reddit threads — one of them made a closed door here — and one web page; no X row at all),
// an answer citing two of them, and two of its ground's real channel outcomes: linux-do refused with
// AUTH_REQUIRED (exit 77) and linkedin answered four empty bytes. run-legacy holds seven entries of
// its sources.json, two tool calls from its hunters' transcripts (plus one constructed Bash call that
// names an X address without a reader) and the first source line of its final.md.
//
// K2 (EVIDENCE-B56-K2 §2.4): with --answer a second footer line counts the claim ledger — İDDİA: n iddia ·
// t tek kaynak · c karşısız · i kabul edilmeyen alıntı — from claims.jsonl beside the answer, else from
// claims.py over the answer; that case runs the engine's scripts copied, the real claims.py among them, on
// fixtures/render/k1-cut (five claim lines of the kept K1 answer and their 34 rows). And Cevapta leaves out
// a cited row the ledger refuses (evidence.admissible), as the page's drawer does: an old run's rows, all
// pending, count in nothing.

import { execFileSync } from "node:child_process";
import { appendFileSync, cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SKILL } from "./engine-copy.js";

const FIX = join(dirname(resolve(import.meta.filename)), "fixtures", "evidence");
const RENDER = join(dirname(resolve(import.meta.filename)), "fixtures", "render");
const KAPSAMA = join(SKILL, "scripts", "kapsama.py");

function kapsama(args: string[], script = KAPSAMA): { out: string; code: number } {
  try {
    const out = execFileSync("python3", [script, ...args], {
      encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" }, stdio: ["ignore", "pipe", "pipe"],
    });
    return { out, code: 0 };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return { out: String(err.stdout ?? "") + String(err.stderr ?? ""), code: err.status ?? 1 };
  }
}
const row = (out: string, label: string) => out.split("\n").find((l) => l.startsWith(`| ${label} |`)) ?? "";
const NINE = /^\| Platform \| Bulundu \| İndirildi \| İlgili \| Okundu \| Kısmen \| Cevapta \| Elenen \| Kapalı kapı \|$/m;

describe("kapsama.py — prints, never blocks", () => {
  it("an old run with zero X rows: the table is printed, every address reads as pending, the sums close", () => {
    const run = join(FIX, "run-coverage");
    const r = kapsama([run, "--answer", join(run, "answer.md")]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toMatch(NINE);
    expect(row(r.out, "X")).toBe("");                                   // no X address, no X row
    // the closed door of a row no triage ever saw is still named, in the old words; the two cited rows are
    // pending, so the ledger admits neither and Cevapta is 0 (K2; K1 printed 1 and 1)
    expect(row(r.out, "Reddit")).toBe("| Reddit | 3 | 2 | 0 | 0 | 0 | 0 | — | kapı kapalı: opencli reddit read kod 1 ×1 |");
    expect(row(r.out, "Web (diğer)")).toBe("| Web (diğer) | 1 | 0 | 0 | 0 | 0 | 0 | — | — |");
    expect(r.out).toContain("RECONCILED — bulundu 4 = bekleyen 4 + ilgili 0 + ilgisiz 0 + tekrar 0 + kapalı 0 · "
      + "ilgili 0 = okundu 0 + kısmen 0 + okunmadı 0 · okundu 0 = hüküm verilen 0 + hüküm bekleyen 0");
  });

  it("a search door that failed stands in the table even with no address behind it", () => {
    const r = kapsama([join(FIX, "run-coverage"), "--format", "tsv"]);
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/^platform\tbulundu\tindirildi\tilgili\tokundu\tkismen\tcevapta\telenen\tkapali$/m);
    expect(r.out).toMatch(/^chinese\t0\t0\t0\t0\t0\t-\t-\tkapı kapalı: arama linux-do kod 77 — AUTH_REQUIRED: linux\.do requires an active signed-in browser session ×1$/m);
    expect(r.out).toMatch(/^linkedin\t0\t0\t0\t0\t0\t-\t-\tarama boş: linkedin ×1$/m);
  });

  it("the ledger's states move the columns; Okundu is what the machine printed, never a hunter's line", () => {
    const run = join(FIX, "run-drawer");
    const r = kapsama([run, "--answer", join(run, "answer.md")]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toMatch(NINE);
    // x.jsonl claims "okundu 130"; batch printed one X body whole and one in part
    expect(row(r.out, "X")).toBe("| X | 7 | 6 | 2 | 1 | 1 | 2 | ilgisiz: Opus vs Astra, not Fable ×2 · "
      + "ilgisiz: Free access tip only ×1 · tekrar ×1 | — |");
    expect(row(r.out, "Reddit")).toBe("| Reddit | 3 | 1 | 1 | 0 | 0 | 1 | — | opencli reddit read kod 1 ×1 |");
    expect(row(r.out, "YouTube")).toBe("| YouTube | 2 | 2 | 1 | 1 | 0 | 1 | ilgisiz: Only a thumbnail, no words ×1 | — |");
    // both read rows carry their hunter's verdict (L0010's was added with K2, so the ledger admits it)
    expect(r.out).toContain("RECONCILED — bulundu 12 = bekleyen 2 + ilgili 4 + ilgisiz 4 + tekrar 1 + kapalı 1 · "
      + "ilgili 4 = okundu 2 + kısmen 1 + okunmadı 1 · okundu 2 = hüküm verilen 2 + hüküm bekleyen 0");
  });

  it("its sums are evidence.py status's own, number for number", () => {
    const dir = mkdtempSync(join(tmpdir(), "dxb-b56-kapsama-"));
    cpSync(join(FIX, "run-drawer"), dir, { recursive: true });           // status reads a copy, never the fixture
    const status = JSON.parse(execFileSync("python3", [join(SKILL, "scripts", "evidence.py"), "status", dir, "--format", "json"], {
      encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
    })).total;
    const line = kapsama([dir]).out.split("\n").find((l) => l.startsWith("RECONCILED")) ?? "";
    rmSync(dir, { recursive: true, force: true });
    const said = Object.fromEntries([...line.matchAll(/([a-zçğıöşü ]+?) (\d+)(?= [=+·]|$)/g)].map((m) => [m[1].trim(), Number(m[2])]));
    expect(said, line).toEqual({
      bulundu: status.discovered, bekleyen: status.pending, ilgili: status.relevant, ilgisiz: status.irrelevant,
      tekrar: status.duplicate, kapalı: status.inaccessible, okundu: status.read, kısmen: status.partial,
      okunmadı: status.unread, "hüküm verilen": status.judged, "hüküm bekleyen": status.unjudged,
    });
  });

  it("a state the contract does not know breaks the sums: MISMATCH names its row, and the exit stays 0", () => {
    const dir = mkdtempSync(join(tmpdir(), "dxb-b56-kapsama-"));
    cpSync(join(FIX, "run-drawer"), dir, { recursive: true });
    const url = "https://x.com/bench_x_seven/status/1970000000000000114";
    appendFileSync(join(dir, "evidence.jsonl"), JSON.stringify({ id: "L0014", kind: "discovery", tool: "sweep", platform: "x",
      url, url_canonical: url, liveness: "unchecked", bytes: 0, triage: "maybe" }) + "\n");
    const r = kapsama([dir]);
    rmSync(dir, { recursive: true, force: true });
    expect(r.code, r.out).toBe(0);
    expect(r.out).toContain("MISMATCH: X: bulundu 8 ≠ bekleyen+ilgili+ilgisiz+tekrar+kapalı 7; TOPLAM: bulundu 13 ≠ "
      + "bekleyen+ilgili+ilgisiz+tekrar+kapalı 12 — satırlar: L0014 triage='maybe'");
    expect(r.out).not.toContain("RECONCILED");
  });

  it("counts a citation only in its one shape; a bracket that merely looks like one is named, not counted", () => {
    const dir = mkdtempSync(join(tmpdir(), "dxb-b56-kapsama-"));
    const answer = join(dir, "answer.md");
    writeFileSync(answer, "Bir [L0001]. İki [bkz. L0002]. Üç [L0001 ]. Dört [l0003]. Beş [L0001, L0002].\n");
    // K2: a cited row counts only when the ledger admits it — the old run's two posts, judged evidence here
    const run = join(dir, "run");
    cpSync(join(FIX, "run-coverage"), run, { recursive: true });
    const judged = readFileSync(join(run, "evidence.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
      .map((x) => ["L0001", "L0002"].includes(x.id) ? { ...x, triage: "relevant", verdict: "evidence" } : x);
    writeFileSync(join(run, "evidence.jsonl"), judged.map((x) => JSON.stringify(x)).join("\n") + "\n");
    const r = kapsama([run, "--answer", answer]);
    rmSync(dir, { recursive: true, force: true });
    expect(r.code, r.out).toBe(0);
    expect(row(r.out, "Reddit")).toBe("| Reddit | 3 | 2 | 2 | 0 | 0 | 2 | — | kapı kapalı: opencli reddit read kod 1 ×1 |");
    expect(row(r.out, "Web (diğer)")).toBe("| Web (diğer) | 1 | 0 | 0 | 0 | 0 | 0 | — | — |");
    for (const bad of ["[bkz. L0002]", "[L0001 ]", "[l0003]"]) expect(r.out).toContain(`biçimsiz atıf: ${bad} ×1`);
    expect(r.out).not.toContain("biçimsiz atıf: [L0001]");
    expect(r.out).not.toContain("biçimsiz atıf: [L0001, L0002]");
  });

  it("with --answer, counts the claim ledger under RECONCILED: claims.jsonl beside the answer, else claims.py", () => {
    const dir = mkdtempSync(join(tmpdir(), "dxb-b56-kapsama-"));
    cpSync(join(SKILL, "scripts"), join(dir, "engine"), { recursive: true, filter: (s) => !s.includes("__pycache__") });
    cpSync(join(RENDER, "k1-cut"), join(dir, "run"), { recursive: true });
    const run = join(dir, "run");
    const script = join(dir, "engine", "kapsama.py");
    const computed = kapsama([run, "--answer", join(run, "answer.md")], script);
    const bare = kapsama([run], script);
    writeFileSync(join(run, "claims.jsonl"), JSON.stringify({ id: "C001", line: 1, thin: true, counter_rows: 0, inadmissible: ["L1071", "L0506"] }) + "\n");
    const fromFile = kapsama([run, "--answer", join(run, "answer.md")], script);
    rmSync(dir, { recursive: true, force: true });
    expect(computed.code, computed.out).toBe(0);
    const lines = computed.out.split("\n");
    expect(lines[0]).toMatch(NINE);
    // L1071's post (x.com), cited on line 71 and refused, is not in X's Cevapta — the drawer's "2 cevapta"
    expect(row(computed.out, "X")).toBe("| X | 3 | 3 | 3 | 3 | 0 | 2 | — | — |");
    // the verdict, a table row, K1's lines 66, 69 (one source) and 71 (L1071, judged no evidence)
    expect(lines[lines.findIndex((l) => l.startsWith("RECONCILED")) + 1])
      .toBe("İDDİA: 5 iddia · 1 tek kaynak · 3 karşısız · 1 kabul edilmeyen alıntı");
    expect(fromFile.out).toContain("\nİDDİA: 1 iddia · 1 tek kaynak · 1 karşısız · 2 kabul edilmeyen alıntı\n");
    expect(bare.out).not.toContain("İDDİA");
  });

  it("exits 1 only when the run folder does not exist", () => {
    expect(kapsama([join(FIX, "no-such-run")]).code).toBe(1);
    expect(kapsama([join(FIX, "run-coverage"), "--answer", join(FIX, "no-such-answer.md")]).code).toBe(0);
  });

  it("--legacy reads a run made before v2 and prints its rule with its numbers", () => {
    const run = join(FIX, "run-legacy");
    const r = kapsama([run, "--legacy", "--answer", join(run, "final.md")]);
    expect(r.code, r.out).toBe(0);
    // X = x.com + twitter.com + t.co; support.x.com is X's help desk, not its people
    expect(row(r.out, "X")).toBe("| X | 3 | 1 | 0 | denenmedi ×2 |");
    expect(row(r.out, "Reddit")).toBe("| Reddit | 2 | 0 | 1 | denenmedi ×2 |");
    expect(r.out).toContain("Okundu — X: https://x.com/i/status/2097377692966633952");
    expect(r.out).toMatch(/^Kural \(--legacy\): Bulundu = sources\.json/m);
  });
});
