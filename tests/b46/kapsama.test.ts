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
//
// K2b (the CEO's word, 2026-09-26 ~19:45: "kanıt 43 · cevapta 17"): a tenth column, Kanıt — the addresses
// the ledger admits, what the writer is handed — stands before Cevapta, and with --answer a line under İDDİA
// says what the answer did with them: KANIT: a kabul · c cevapta · k alınmadı · açıklanmadı u, u those the
// answer's `## Alınmayan kanıt` section does not name; an id in that section is no citation.
//
// K3 (B56, stage 1 — the question split into sub-questions): with --answer and a subquestions.json beside the run, a
// second table after those lines — one row per sub-question, its claims, rows, independent sources, counter rows and
// its state, `tam` · `boş` (its section holds `Bu alt soruya satır yok.`) · `eksik` (the writer dropped it) — and its
// `ALT SORU:` line; without subquestions.json nothing of it is printed.
//
// K3 stage 3 (the auditor, scripts/audit.py): with --answer and audit.jsonl beside the answer, one line after KANIT —
// DENETÇİ: N okundu · d düzeltildi · r çıkarıldı · u denetlenmedi; without audit.jsonl nothing of it is printed.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
const TEN = /^\| Platform \| Bulundu \| İndirildi \| İlgili \| Okundu \| Kısmen \| Kanıt \| Cevapta \| Elenen \| Kapalı kapı \|$/m;

describe("kapsama.py — prints, never blocks", () => {
  it("an old run with zero X rows: the table is printed, every address reads as pending, the sums close", () => {
    const run = join(FIX, "run-coverage");
    const r = kapsama([run, "--answer", join(run, "answer.md")]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toMatch(TEN);
    expect(row(r.out, "X")).toBe("");                                   // no X address, no X row
    // the closed door of a row no triage ever saw is still named, in the old words; the two cited rows are
    // pending, so the ledger admits neither and Cevapta is 0 (K2; K1 printed 1 and 1)
    expect(row(r.out, "Reddit")).toBe("| Reddit | 3 | 2 | 0 | 0 | 0 | 0 | 0 | — | kapı kapalı: opencli reddit read kod 1 ×1 |");
    expect(row(r.out, "Web (diğer)")).toBe("| Web (diğer) | 1 | 0 | 0 | 0 | 0 | 0 | 0 | — | — |");
    expect(r.out).toContain("RECONCILED — bulundu 4 = bekleyen 4 + ilgili 0 + ilgisiz 0 + tekrar 0 + kapalı 0 · "
      + "ilgili 0 = okundu 0 + kısmen 0 + okunmadı 0 · okundu 0 = hüküm verilen 0 + hüküm bekleyen 0");
  });

  it("a search door that failed stands in the table even with no address behind it", () => {
    const r = kapsama([join(FIX, "run-coverage"), "--format", "tsv"]);
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/^platform\tbulundu\tindirildi\tilgili\tokundu\tkismen\tkanit\tcevapta\telenen\tkapali$/m);
    expect(r.out).toMatch(/^chinese\t0\t0\t0\t0\t0\t0\t-\t-\tkapı kapalı: arama linux-do kod 77 — AUTH_REQUIRED: linux\.do requires an active signed-in browser session ×1$/m);
    expect(r.out).toMatch(/^linkedin\t0\t0\t0\t0\t0\t0\t-\t-\tarama boş: linkedin ×1$/m);
  });

  it("the ledger's states move the columns; Okundu is what the machine printed, never a hunter's line", () => {
    const run = join(FIX, "run-drawer");
    const r = kapsama([run, "--answer", join(run, "answer.md")]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toMatch(TEN);
    // x.jsonl claims "okundu 130"; batch printed one X body whole and one in part
    expect(row(r.out, "X")).toBe("| X | 7 | 6 | 2 | 1 | 1 | 2 | 2 | ilgisiz: Opus vs Astra, not Fable ×2 · "
      + "ilgisiz: Free access tip only ×1 · tekrar ×1 | — |");
    expect(row(r.out, "Reddit")).toBe("| Reddit | 3 | 1 | 1 | 0 | 0 | 1 | 1 | — | opencli reddit read kod 1 ×1 |");
    expect(row(r.out, "YouTube")).toBe("| YouTube | 2 | 2 | 1 | 1 | 0 | 1 | 1 | ilgisiz: Only a thumbnail, no words ×1 | — |");
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

  it("names the rows with a body the triage never judged first in Elenen — `bekleyen ×n` — the sums untouched", () => {
    // K2c: on the K2 run a failed triage batch left 60 X posts pending with their bodies, and the X row said nothing of them.
    // Here L0005, run-drawer's pending X address, gets its body: it is fetched, and still pending
    const dir = mkdtempSync(join(tmpdir(), "dxb-b56-kapsama-"));
    cpSync(join(FIX, "run-drawer"), dir, { recursive: true });
    const rows = readFileSync(join(dir, "evidence.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
    const five = rows.find((x) => x.id === "L0005");
    Object.assign(five, { liveness: "alive", bytes: 120 });
    writeFileSync(join(dir, "evidence.jsonl"), rows.map((x) => JSON.stringify(x)).join("\n") + "\n");
    mkdirSync(join(dir, "bodies"));
    writeFileSync(join(dir, "bodies", `${createHash("sha256").update(five.url_canonical).digest("hex")}.txt`),
      "Astra 6 or Fable 5.1? A post the triage never saw.\n");
    const r = kapsama([dir, "--answer", join(dir, "answer.md")]);
    rmSync(dir, { recursive: true, force: true });
    expect(r.code, r.out).toBe(0);
    expect(row(r.out, "X")).toBe("| X | 7 | 7 | 2 | 1 | 1 | 2 | 2 | bekleyen ×1 · ilgisiz: Opus vs Astra, not Fable ×2 · "
      + "ilgisiz: Free access tip only ×1 · tekrar ×1 | — |");
    expect(row(r.out, "Reddit")).toBe("| Reddit | 3 | 1 | 1 | 0 | 0 | 1 | 1 | — | opencli reddit read kod 1 ×1 |");
    expect(r.out).toContain("RECONCILED — bulundu 12 = bekleyen 2 + ilgili 4 + ilgisiz 4 + tekrar 1 + kapalı 1 · ");
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
    expect(row(r.out, "Reddit")).toBe("| Reddit | 3 | 2 | 2 | 0 | 0 | 2 | 2 | — | kapı kapalı: opencli reddit read kod 1 ×1 |");
    expect(row(r.out, "Web (diğer)")).toBe("| Web (diğer) | 1 | 0 | 0 | 0 | 0 | 0 | 0 | — | — |");
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
    expect(lines[0]).toMatch(TEN);
    // L1071's post (x.com), cited on line 71 and refused, is not in X's Kanıt nor in its Cevapta — the drawer's "2 cevapta"
    expect(row(computed.out, "X")).toBe("| X | 3 | 3 | 3 | 3 | 0 | 2 | 2 | — | — |");
    // the verdict, a table row, K1's lines 66, 69 (one source) and 71 (L1071, judged no evidence)
    expect(lines[lines.findIndex((l) => l.startsWith("RECONCILED")) + 1])
      .toBe("İDDİA: 5 iddia · 1 tek kaynak · 3 karşısız · 1 kabul edilmeyen alıntı");
    expect(fromFile.out).toContain("\nİDDİA: 1 iddia · 1 tek kaynak · 1 karşısız · 2 kabul edilmeyen alıntı\n");
    expect(bare.out).not.toContain("İDDİA");
  });

  it("counts the admitted addresses as Kanıt, and under İDDİA what the answer did with them — the KANIT line", () => {
    // run-drawer admits four addresses: L0001's and L0002's X posts (L0006 is a hunter's quote on L0002's),
    // L0007's Reddit thread and L0010's video. This answer cites the two posts; its `## Alınmayan kanıt`
    // section then names L0007 — no citation, so Reddit's Cevapta stays 0 — and L0010 nowhere
    const dir = mkdtempSync(join(tmpdir(), "dxb-b56-kapsama-"));
    cpSync(join(FIX, "run-drawer"), dir, { recursive: true });
    const answer = join(dir, "answer.md");
    const cites = "Net bir kazanan yok: iş bölümü var [L0006] [L0001].\n";
    writeFileSync(answer, cites);
    const bare = kapsama([dir, "--answer", answer]);
    writeFileSync(answer, `${cites}\n## Alınmayan kanıt\n- [L0007] — zayıf\n`);
    const named = kapsama([dir, "--answer", answer]);
    const alone = kapsama([dir]);
    rmSync(dir, { recursive: true, force: true });
    expect(named.code, named.out).toBe(0);
    expect(row(named.out, "X")).toMatch(/^\| X \| 7 \| 6 \| 2 \| 1 \| 1 \| 2 \| 2 \| /);
    expect(row(named.out, "Reddit")).toBe("| Reddit | 3 | 1 | 1 | 0 | 0 | 1 | 0 | — | opencli reddit read kod 1 ×1 |");
    expect(row(named.out, "YouTube")).toBe("| YouTube | 2 | 2 | 1 | 1 | 0 | 1 | 0 | ilgisiz: Only a thumbnail, no words ×1 | — |");
    const kanit = (out: string) => out.split("\n").find((l) => l.startsWith("KANIT:"));
    expect(kanit(bare.out)).toBe("KANIT: 4 kabul · 2 cevapta · 2 alınmadı · açıklanmadı 2");
    expect(kanit(named.out)).toBe("KANIT: 4 kabul · 2 cevapta · 2 alınmadı · açıklanmadı 1");
    const lines = named.out.split("\n");
    expect(lines.findIndex((l) => l.startsWith("KANIT:"))).toBe(lines.findIndex((l) => l.startsWith("İDDİA:")) + 1);
    // without --answer, Kanıt is still counted — it is the ledger's — and there is no KANIT line
    expect(row(alone.out, "Reddit")).toBe("| Reddit | 3 | 1 | 1 | 0 | 0 | 1 | - | — | opencli reddit read kod 1 ×1 |");
    expect(kanit(alone.out)).toBeUndefined();
  });

  it("names an id of the `## Alınmayan kanıt` section that evidence.jsonl lacks, as it names an unknown cited one", () => {
    // render.py refuses the page for [L9999] wherever it stands in the answer: the ruler may not stay silent on it
    const dir = mkdtempSync(join(tmpdir(), "dxb-b56-kapsama-"));
    cpSync(join(FIX, "run-drawer"), dir, { recursive: true });
    const answer = join(dir, "answer.md");
    writeFileSync(answer, "Net bir kazanan yok [L0006] [L0001].\n\n## Alınmayan kanıt\n- [L9999] — zayıf\n- [L0007] — tekrar\n");
    const r = kapsama([dir, "--answer", answer]);
    rmSync(dir, { recursive: true, force: true });
    expect(r.code, r.out).toBe(0);
    expect(r.out).toContain("\n(cevaptaki bu kimlikler evidence.jsonl'da yok: L9999)\n");
    expect(r.out).toContain("\nKANIT: 4 kabul · 2 cevapta · 2 alınmadı · açıklanmadı 1\n");     // and still no citation
  });

  it("with subquestions.json, a second table: one row per sub-question, `tam` · `boş` · `eksik`, and its ALT SORU line", () => {
    // run-drawer's rows under an answer with rule 11's headings: S1 cites three admitted rows (L0010 on both sides),
    // S2 holds the gap line, S3 has no section at all
    const dir = mkdtempSync(join(tmpdir(), "dxb-b56-kapsama-"));
    cpSync(join(FIX, "run-drawer"), dir, { recursive: true });
    const answer = join(dir, "answer.md");
    writeFileSync(answer, "Net bir kazanan yok [L0006] [L0001].\n\n## S1 — X'te iş bölümü\n- Plan Fable'da, hız Astra'da [L0006, L0001] ↔ [L0010].\n"
      + "- Oyunda Fable önde [L0010].\n\n## S2 — Reddit'te tercih\nBu alt soruya satır yok.\n\n## Alınmayan kanıt\n- [L0007] — zayıf\n");
    const without = kapsama([dir, "--answer", answer]);
    const item = (id: string, title: string) => ({ id, title, question: `${title}?`, signals: [] });
    writeFileSync(join(dir, "subquestions.json"), JSON.stringify({ source: "model", cost_usd: 0,
      items: [item("S1", "X'te iş bölümü"), item("S2", "Reddit'te tercih"), item("S3", "YouTube'da test")] }));
    const md = kapsama([dir, "--answer", answer]);
    const tsv = kapsama([dir, "--answer", answer, "--format", "tsv"]);
    const bare = kapsama([dir]);
    rmSync(dir, { recursive: true, force: true });
    expect(md.code, md.out).toBe(0);
    // everything the first table printed stands as it was; the second table and its line follow it
    expect(md.out).toBe(`${without.out}\n| Alt soru | İddia | Satır | Bağımsız kaynak | Karşı | Durum |\n|---|---:|---:|---:|---:|---|\n`
      + "| S1 — X'te iş bölümü | 2 | 3 | 3 | 1 | tam |\n| S2 — Reddit'te tercih | 0 | 0 | 0 | 0 | boş |\n"
      + "| S3 — YouTube'da test | 0 | 0 | 0 | 0 | eksik |\nALT SORU: 3 · tam 1 · boş 1 (S2) · eksik 1 (S3)\n");
    expect(tsv.out).toContain("\n\nalt_soru\tiddia\tsatir\tbagimsiz_kaynak\tkarsi\tdurum\nS1\t2\t3\t3\t1\ttam\nS2\t0\t0\t0\t0\tboş\n"
      + "S3\t0\t0\t0\t0\teksik\nALT SORU: 3 · tam 1 · boş 1 (S2) · eksik 1 (S3)\n");
    expect(bare.out, "without --answer there is no answer to count").not.toContain("ALT SORU");
  });

  it("with --answer and the auditor's audit.jsonl beside it, a DENETÇİ line right after KANIT — audit.py's tally", () => {
    // fixtures/audit/render/audit.jsonl: run-drawer's answer as the auditor left it — 3 ok, 2 corrected, 1 removed, 1 not read
    const dir = mkdtempSync(join(tmpdir(), "dxb-b56-kapsama-"));
    cpSync(join(FIX, "run-drawer"), dir, { recursive: true });
    const answer = join(dir, "answer.md");
    const without = kapsama([dir, "--answer", answer]);
    cpSync(join(dirname(resolve(import.meta.filename)), "fixtures", "audit", "render", "audit.jsonl"), join(dir, "audit.jsonl"));
    const audited = kapsama([dir, "--answer", answer]);
    const bare = kapsama([dir]);
    rmSync(dir, { recursive: true, force: true });
    expect(audited.code, audited.out).toBe(0);
    // every line it printed before stands as it was; the one line more follows KANIT
    expect(audited.out).toBe(without.out.replace(/^(KANIT: .*\n)/m, "$1DENETÇİ: 6 okundu · 2 düzeltildi · 1 çıkarıldı · 1 denetlenmedi\n"));
    expect(without.out).toMatch(/^KANIT: /m);
    expect(without.out).not.toContain("DENETÇİ");
    expect(bare.out, "without --answer there is no answer the auditor read").not.toContain("DENETÇİ");
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
