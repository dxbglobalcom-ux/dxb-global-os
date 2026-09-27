// B56 K1 — THE PAGE HE SEES: THE VERDICT ON TOP, THE COUNT BESIDE EVERY CLAIM, EVERY FETCHED ROW IN A DRAWER.
//
// WHY. On 2026-09-26 the CEO asked why 272 X addresses became 4 on the page, and wanted to browse the
// 130 X posts himself — "130 gönderinin açıp okuyabileceğim linklerde olmalı". render.py now also
// writes final.html (EVIDENCE-B56-K1 §2.6): the answer's first paragraph as the verdict, before any
// section; every line that cites rows with `(n satır)`, n its distinct ids, each id a link into the
// drawer — and under "Cevabı taşıyan sayılar" every line and table row, `(0 satır)` in the warm colour
// when it cites none (the lead's ruling, 2026-09-26); a quote card for every cited id, printed from its
// row, an entity an older fetcher stored printed once; kapsama.py's table; and one <details> per
// platform listing every address whose body was fetched, cited first, each with its address.
//
// K2 (EVIDENCE-B56-K2 §2.4): the count beside a claim is the claim ledger's — ONE span at the line's end,
// `(3 satır · 3 bağımsız kaynak · 3 karşı)`, also on a paired line where K1 printed `(3 satır) ↔ (3 satır)`;
// a row the hunter judged no evidence (K1's L1071, cited on line 71) struck through and counted in nothing;
// and "İddia defteri", the ledger as a table, under "Cevabı taşıyan sayılar".
//
// K2b (the CEO's word, 2026-09-26 ~19:45: "kanıt 43 · cevapta 17"): each drawer's summary counts the addresses
// the ledger admits, the cited ones among them and the rest — `X — 6 gönderi (kanıt 2 · 2 cevapta)`, `· k
// alınmadı` when there are any —, an admitted address the answer did not cite carries the reason the answer's
// `## Alınmayan kanıt` section gives it (`alınmadı: açıklanmadı` when it gives none), and that section is not
// the answer: no span, no chip, no quote card.
//
// K3 (B56, stage 1 — the question split into sub-questions): an answer whose sections are headed `## S1 — <title>`
// (fleet/writer-prompt.md rule 11) shows each sub-question whole under "Cevabı taşıyan sayılar", its counts line
// under its heading, a sub-question with no row as its gap line in the thin style, and kapsama.py's second table
// under "Nereye bakıldı". A page whose answer has no S-heading is byte for byte the page of before: fixtures/render/
// drawer-page.html is run-drawer's page as render.py made it at af919c84, before K3 — made again once since, for the
// overflow repair of 2026-09-27 (the `.refs` and `.tbl` rules, U+200B between two chips), nothing else in it changed.
//
// K3 stage 3 (the auditor, scripts/audit.py): with audit.jsonl beside the answer the page says what the auditor did — a
// line under the verdict box, a `düzeltildi` mark after each corrected line, the two lists under the ledger — and a
// page without it is still drawer-page.html, byte for byte.
//
// K3 stage 2 (the research type, scripts/split.py): with a `shape` in subquestions.json the page says the type under the
// verdict box, above the auditor's line, and the writer's `## Şekil — <name>` section stands under "Cevabı taşıyan
// sayılar" where rule 13 puts it — after the number that carries the verdict, before S1 — with its own counts, final.md
// alike, the ids numbered alike; its `Toplam` row and a `—` alone are no claim and carry no (0 satır); fixtures/shape/.
//
// HOW IT RUNS: the REAL render.py — with the real kapsama.py, evidence.py and claims.py beside it, the
// engine's scripts copied to a temporary folder — on a temporary copy of fixtures/evidence/run-drawer:
// thirteen rows on X, Reddit and YouTube in every ledger state (the cited L0001, L0002, L0007 and L0010
// judged evidence by their hunters, so the ledger admits them), a hunter's quote row on its post's address,
// an X body longer than 300 characters; its answer's own "Cevabı taşıyan sayılar" holds a line and a table
// row that cite nothing. And on fixtures/render/k1-cut: five claim lines of the kept K1 answer verbatim —
// its verdict, a table row, lines 66, 69 and 71 — with the 34 rows of evidence.jsonl they stand on. Nothing
// is written into the repository and nothing leaves the machine.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SKILL } from "./engine-copy.js";

const FIX = join(dirname(resolve(import.meta.filename)), "fixtures", "evidence", "run-drawer");
const RENDER = join(dirname(resolve(import.meta.filename)), "fixtures", "render");
type Row = { id: string; url: string; author: string | null; passage?: string };
const ROWS: Row[] = readFileSync(join(FIX, "evidence.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const row = (id: string) => ROWS.find((r) => r.id === id)!;

let root: string;
let page = "";
let said = "";
/** The real render.py on a run folder: its exit and what it said, and the page it wrote ("" when none). */
function render(run: string): { said: string; page: string } {
  const p = spawnSync("python3", [join(root, "engine", "render.py"), join(run, "answer.md"), "--evidence",
    join(run, "evidence.jsonl"), "--out", join(run, "final.html")],
  { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
  const out = join(run, "final.html");
  return { said: `${p.status} ${p.stdout}${p.stderr}`, page: existsSync(out) ? readFileSync(out, "utf8") : "" };
}
beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "b46-drawer-"));
  cpSync(join(SKILL, "scripts"), join(root, "engine"), { recursive: true, filter: (s) => !s.includes("__pycache__") });
  const run = join(root, "run");
  cpSync(FIX, run, { recursive: true });
  ({ said, page } = render(run));
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

const drawerOf = (html: string, p: string) => html.match(new RegExp(`<details class="plat" id="p-${p}">([\\s\\S]*?)</details>`))?.[1] ?? "";
const drawer = (p: string) => drawerOf(page, p);
const items = (html: string) => [...html.matchAll(/<li class="drow( cited)?" id="(L\d{4})">([\s\S]*?)<\/li>/g)];

describe("final.html — the verdict first, the count beside every claim", () => {
  it("puts the answer's first paragraph in the verdict block, before any section", () => {
    expect(said).toMatch(/^0 /);
    const verdict = page.indexOf('<div class="verdict">');
    expect(verdict, said).toBeGreaterThan(-1);
    expect(verdict).toBeLessThan(page.indexOf("<section"));
    expect(page.slice(verdict, page.indexOf("</div>", verdict))).toContain("Net bir kazanan yok");
    expect(page).toContain("<h1>İnsanlar hangisini seçiyor: Astra 6 mı, Fable 5.1 mi?</h1>");
  });

  it("carries the claim ledger's span beside every line that cites rows, each id a link into the drawer", () => {
    // six lines of answer.md cite rows: the verdict (2 ids), a list item (2), our own table's row (2), the
    // comparison's two rows (2, 1 — one source: thin), the contradiction (2)
    const counts = [...page.matchAll(/<span class="count( thin)?">\((\d+) satır · (\d+) bağımsız kaynak\)<\/span>/g)]
      .map((m) => `${m[2]}·${m[3]}${m[1] ?? ""}`);
    expect(counts.sort()).toEqual(["1·1 thin", "2·2", "2·2", "2·2", "2·2", "2·2"]);
    expect(page).toMatch(/X'te okunan iki gönderi iş bölümünü anlatıyor <span class="refs">.*?<\/span>\. <span class="count">\(2 satır · 2 bağımsız kaynak\)<\/span>/);
    const links = [...page.matchAll(/<a class="ref" href="#(L\d{4})"/g)].map((m) => m[1]);
    expect(new Set(links)).toEqual(new Set(["L0006", "L0007", "L0001", "L0010"]));
    const drawers = ["x", "youtube", "reddit"].map(drawer).join("");
    for (const id of links) expect(drawers).toContain(`id="${id}"`);
  });

  it("gives every line and table row under 'Cevabı taşıyan sayılar' its count, a warm (0 satır) when it cites none", () => {
    // the lead's ruling, 2026-09-26: a claim nothing supports is seen; outside the block such a line stays plain
    const zero = ' <span class="count zero">(0 satır)</span>';
    const ours = page.split('id="sayilar"')[1]?.split("</section>")[0] ?? "";
    const lines = [...ours.matchAll(/<li(?: id="C\d{3}")?>[\s\S]*?<\/li>|<tr(?: id="C\d{3}")?><td[\s\S]*?<\/tr>/g)].map((m) => m[0]);
    expect(lines).toHaveLength(5);        // two list items, our table's two rows, the contradiction
    for (const l of lines) expect(l).toMatch(/<span class="count( zero)?">\(\d+ satır(?: · \d+ bağımsız kaynak)?\)<\/span>/);
    expect(ours).toContain(`<li>Kalabalık sayımı bu koşuda yok; kişi sayısı verilmedi.${zero}</li>`);
    expect(ours).toContain(`<td data-label="Satırlar"><span class="v">${zero}</span></td>`);
    expect(page).toContain("<li>Kapısı kapalı Reddit başlığı okunamadı; açılırsa tablo değişebilir.</li>");
    expect(page.match(/\.count\.zero\{[^}]*\}/)?.[0]).toContain("color:var(--warm)");
  });
});

describe("final.html — counter-evidence in one bracket is the two citations it holds", () => {
  it("renders [L0001, L0002 ↔ L0003] as two groups and ONE span at the line's end; [L0001 ↔ L9999] is still refused", () => {
    // the live run of 2026-09-26 wrote `[L1720, L1722, L1755 ↔ L1721, L1723, L1724]` (answer.md line 66) and
    // the whole page was refused; each side is held to the citation rule, so an unknown id still refuses
    const run = (name: string, cite: string) => {
      const dir = join(root, name);
      cpSync(FIX, dir, { recursive: true });
      writeFileSync(join(dir, "answer.md"), `${readFileSync(join(FIX, "answer.md"), "utf8")}\n- Kota: iki taraf birbirini yalanlıyor ${cite}.\n`, "utf8");
      return render(dir);
    };
    const ok = run("paired", "[L0001, L0002 ↔ L0003]");
    expect(ok.said).toMatch(/^0 /);
    // each side its chips, ↔ between them, one span at the end; L0003's post was triaged irrelevant, so the
    // ledger refuses it: struck through, counted in nothing — and the page is still built
    expect(ok.page.match(/<li id="C\d{3}">Kota: [\s\S]*?<\/li>/)?.[0].replace(/<a class="ref" href="#(L\d{4})"[^>]*>\d+<\/a>/g, "$1"))
      .toBe('<li id="C007">Kota: iki taraf birbirini yalanlıyor <span class="refs">L0001\u200BL0002</span> ↔ <s class="inadmissible" '
        + 'title="elendi: irrelevant">[L0003]</s>. <span class="count">(2 satır · 2 bağımsız kaynak)</span></li>');
    // kapsama.py reads the pair the same way (platforms.split_paired), and like the drawer it leaves L0003,
    // refused, out of the answer: X's Cevapta is the drawer's "2 cevapta" (K1 counted L0003's post: 3)
    const cov = ok.page.split('id="kapsama"')[1]?.split("</section>")[0] ?? "";
    expect(cov.match(/<span class="v">X<\/span><\/td>[\s\S]*?data-label="Cevapta" class="n"><span class="v">(\d+)</)?.[1]).toBe("2");
    expect(ok.page).toContain("<summary>X — 6 gönderi (kanıt 2 · 2 cevapta)</summary>");
    expect(cov).not.toContain("biçimsiz atıf");
    const bad = run("paired-unknown", "[L0001 ↔ L9999]");
    expect(bad.said).toMatch(/^2 render: REFUSED \(no page written\) — id not in evidence\.jsonl: L9999 \(line 26\)/);
    expect(bad.page).toBe("");
  });
});

describe("final.html — a quote card for every cited row, printed from the row", () => {
  it("prints the passage, author, date, platform and address of each cited id, in the page's order", () => {
    const cards = [...page.matchAll(/<figure class="qcard" id="q-(L\d{4})">([\s\S]*?)<\/figure>/g)];
    expect(cards.map((m) => m[1])).toEqual(["L0006", "L0007", "L0001", "L0010"]);
    const card = cards[0][2];
    const r = row("L0006");
    expect(card).toContain(`“${r.passage}”`);
    expect(card).toContain(`@${r.author}`);
    expect(card).toContain(" · 22 Eyl 2026 · X · ");
    expect(card).toContain(`href="${r.url}"`);
  });

  it("prints row text an older fetcher stored HTML-escaped once — quote card, drawer and coverage cell", () => {
    // the deep run of 2026-09-26 carried L0401 "3D Modelleme &amp; Blender" on disk, and the page showed "&amp;"
    const run = join(root, "escaped");
    cpSync(FIX, run, { recursive: true });
    const rows = ROWS.map((r) => r.id === "L0007" ? { ...r, passage: "Kod: 3D Modelleme &amp; Blender, Astra 6 &gt; Fable 5.1." }
      : r.id === "L0011" ? { ...r, triage_reason: "Thumbnail &amp; no words" } : r);
    writeFileSync(join(run, "evidence.jsonl"), rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
    const got = render(run);
    expect(got.said).toMatch(/^0 /);
    const once = "3D Modelleme &amp; Blender, Astra 6 &gt; Fable 5.1.";   // the HTML of "… & Blender, Astra 6 > Fable 5.1."
    expect(got.page.match(/<figure class="qcard" id="q-L0007">[\s\S]*?<\/figure>/)?.[0]).toContain(once);
    expect(items(got.page).find((m) => m[2] === "L0007")?.[3]).toContain(once);
    expect(got.page).toContain("ilgisiz: Thumbnail &amp; no words ×1");
    expect(got.page).not.toMatch(/&amp;(?:amp|gt);/);
  });

  it("writes a U+FFFD a fetched body carries as &#xFFFD; — no raw one on the page, the text around it intact", () => {
    // 2026-09-26 the claude.ai Artifact publisher refused the K1 run's page: 599 raw U+FFFD, bodies decoded with errors="replace"
    const run = join(root, "replacement");
    cpSync(FIX, run, { recursive: true });
    const rows = ROWS.map((r) => r.id === "L0007" ? { ...r, passage: "Kod incelemesinde Astra\uFFFDya güveniyorum; zor işlerde Fable\uFFFDa dönüyorum." } : r);
    writeFileSync(join(run, "evidence.jsonl"), rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
    const got = render(run);
    expect(got.said).toMatch(/^0 /);
    expect(got.page).not.toContain("\uFFFD");
    const text = "Kod incelemesinde Astra&#xFFFD;ya güveniyorum; zor işlerde Fable&#xFFFD;a dönüyorum.";
    expect(got.page.match(/<figure class="qcard" id="q-L0007">[\s\S]*?<\/figure>/)?.[0]).toContain(`“${text}”`);
    expect(items(got.page).find((m) => m[2] === "L0007")?.[3]).toContain(`<p class="dt">${text}</p>`);
    const verdict = got.page.indexOf('<div class="verdict">');
    expect(got.page.slice(verdict, got.page.indexOf("</div>", verdict))).toContain("Net bir kazanan yok: iş bölümü var");
  });
});

describe("final.html — the drawer: every fetched address, per platform, the cited ones first", () => {
  it("opens one <details> per platform with a body and lists every fetched address with its link", () => {
    expect([...page.matchAll(/<summary>([^<]*)<\/summary>/g)].map((m) => m[1]))
      .toEqual(["X — 6 gönderi (kanıt 2 · 2 cevapta)", "YouTube — 2 video (kanıt 1 · 1 cevapta)",
        "Reddit — 1 başlık (kanıt 1 · 1 cevapta)"]);
    const x = items(drawer("x"));
    // cited first (L0006 is a hunter's quote on L0002's post), then newest first; L0005 has no body: not here
    expect(x.map((m) => m[2])).toEqual(["L0002", "L0001", "L0004", "L0012", "L0003", "L0013"]);
    expect(x.map((m) => Boolean(m[1]))).toEqual([true, true, false, false, false, false]);
    expect(x[0][3]).toContain('id="L0006"');
    for (const m of [...x, ...items(drawer("youtube")), ...items(drawer("reddit"))]) expect(m[3]).toMatch(/href="https:\/\//);
    const cut = x[1][3].match(/<p class="dt">([^<]*)<\/p>/)![1];
    expect(row("L0001").passage!.length).toBeGreaterThan(300);
    expect(cut.length).toBeLessThanOrEqual(300);
    expect(cut.endsWith("…")).toBe(true);
  });
});

describe("final.html — the admitted rows the answer did not take (`## Alınmayan kanıt`)", () => {
  it("counts `kanıt n · m cevapta · k alınmadı` per drawer and gives each untaken address its reason; the section is no claim", () => {
    // run-drawer admits four addresses; this answer cites the two X posts, and its last section names
    // L0007's Reddit thread — L0010's video it names nowhere
    const run = join(root, "unused");
    cpSync(FIX, run, { recursive: true });
    writeFileSync(join(run, "answer.md"), "Net bir kazanan yok: iş bölümü var [L0006] [L0001].\n\n## Ne değiştirirdi, bakıldı mı\n"
      + "- Kapısı kapalı Reddit başlığı okunamadı.\n\n## Alınmayan kanıt\n- [L0007] — zayıf\n", "utf8");
    const got = render(run);
    expect(got.said).toMatch(/^0 /);
    expect([...got.page.matchAll(/<summary>([^<]*)<\/summary>/g)].map((m) => m[1])).toEqual(["X — 6 gönderi (kanıt 2 · 2 cevapta)",
      "YouTube — 2 video (kanıt 1 · 0 cevapta · 1 alınmadı)", "Reddit — 1 başlık (kanıt 1 · 0 cevapta · 1 alınmadı)"]);
    const entry = (p: string, id: string) => items(drawerOf(got.page, p)).find((m) => m[2] === id)?.[3] ?? "";
    expect(entry("reddit", "L0007")).toContain('<span class="vd">alınmadı: zayıf</span>');
    expect(entry("youtube", "L0010")).toContain('<span class="vd">alınmadı: açıklanmadı</span>');
    for (const id of ["L0001", "L0002", "L0003"]) expect(entry("x", id)).not.toContain("alınmadı:");  // cited, cited, not admitted
    // the section is not the answer: one span (the verdict's), no chip and no quote card for L0007, no heading
    expect(got.page.match(/<span class="count/g)).toHaveLength(1);
    expect(got.page).not.toMatch(/<a class="ref" href="#L0007"/);
    expect(got.page).not.toContain('id="q-L0007"');
    expect(got.page).not.toContain("Alınmayan kanıt");
    expect(got.page).toContain('<p class="note">KANIT: 4 kabul · 2 cevapta · 2 alınmadı · açıklanmadı 1</p>');
  });
});

describe("final.html — the rows with a body the triage never judged (K2c)", () => {
  it("ends the drawer's summary with ` · n bekleyen`, the number kapsama.py's Elenen cell leads with", () => {
    // on the K2 run 60 X posts stayed pending with their bodies after a failed triage batch; here L0005 gets its body
    const run = join(root, "waiting");
    cpSync(FIX, run, { recursive: true });
    const five = { ...row("L0005"), liveness: "alive", bytes: 120 };
    writeFileSync(join(run, "evidence.jsonl"), ROWS.map((r) => JSON.stringify(r.id === "L0005" ? five : r)).join("\n") + "\n", "utf8");
    mkdirSync(join(run, "bodies"));
    writeFileSync(join(run, "bodies", `${createHash("sha256").update(five.url).digest("hex")}.txt`), "A post the triage never saw.\n");
    const got = render(run);
    expect(got.said).toMatch(/^0 /);
    expect([...got.page.matchAll(/<summary>([^<]*)<\/summary>/g)].map((m) => m[1])).toEqual(["X — 7 gönderi (kanıt 2 · 2 cevapta · 1 bekleyen)",
      "YouTube — 2 video (kanıt 1 · 1 cevapta)", "Reddit — 1 başlık (kanıt 1 · 1 cevapta)"]);
    expect(got.page).toContain('<span class="why-l">Elenen</span> bekleyen ×1 · ilgisiz: Opus vs Astra, not Fable ×2 · ');
  });
});

describe("final.html — the answer's sub-questions, each whole with its own counts (B56 K3)", () => {
  it("heads each S-section `S1 — <title>` with its counts line, shows the gap line thin, and the second table", () => {
    const run = join(root, "subquestions");
    cpSync(FIX, run, { recursive: true });
    writeFileSync(join(run, "answer.md"), "Net bir kazanan yok: iş bölümü var [L0006] [L0001].\n\n## S1 — X'te iş bölümü\n"
      + "- Plan Fable'da, hız Astra'da [L0006, L0001] ↔ [L0010].\n\n| İş | Öne çıkan | Satırlar |\n|---|---|---|\n"
      + "| Oyun kıyası | Fable 5.1 | [L0010] |\n\n## S2 — Reddit'te tercih\n\nBu alt soruya satır yok.\n\n"
      + "## Ayakta kalan çelişki\nTek video oyunda Fable'ı öne koyuyor [L0010].\n", "utf8");
    const item = (id: string, title: string) => ({ id, title, question: `${title}?`, signals: [] });
    writeFileSync(join(run, "subquestions.json"), JSON.stringify({ source: "model", cost_usd: 0,
      items: [item("S1", "X'te iş bölümü"), item("S2", "Reddit'te tercih"), item("S3", "YouTube'da test")] }));
    const got = render(run);
    expect(got.said).toMatch(/^0 /);
    const ours = got.page.split('id="sayilar"')[1]?.split("</section>")[0] ?? "";
    // in the answer's order, before the writer's own section; no page section of their own
    expect([...ours.matchAll(/<p class="from-t">([^<]*)<\/p>/g)].map((m) => m[1]))
      .toEqual(["S1 — X'te iş bölümü", "S2 — Reddit'te tercih", "Ayakta kalan çelişki"]);
    expect([...got.page.matchAll(/<section class="sec" id="([^"]+)">/g)].map((m) => m[1]))
      .toEqual(["sayilar", "iddialar", "alintilar", "kapsama", "cekmece"]);
    // S1: the list item and the table row — three rows (L0010 on both sides), three authors, one counter row
    expect(ours).toContain('<p class="from-t">S1 — X\'te iş bölümü</p>\n<p class="from-n"><span class="count">'
      + "(2 iddia · 3 satır · 3 bağımsız kaynak · 1 karşı)</span></p>");
    expect(ours).toMatch(/<tr id="C\d{3}"><td data-label="İş"><span class="v">Oyun kıyası<\/span>/);
    expect(ours).toContain('<p class="from-t">S2 — Reddit\'te tercih</p>\n<p class="from-n"><span class="count thin">'
      + '(0 iddia · 0 satır · 0 bağımsız kaynak · 0 karşı)</span></p>\n<ul class="claims">\n'
      + '<li><span class="count thin">Bu alt soruya satır yok.</span></li>\n</ul></div>');
    const cov = got.page.split('id="kapsama"')[1]?.split("</section>")[0] ?? "";
    const second = cov.split('<div class="tbl">')[2] ?? "";
    expect([...second.matchAll(/<th[^>]*>([^<]*)<\/th>/g)].map((m) => m[1]))
      .toEqual(["Alt soru", "İddia", "Satır", "Bağımsız kaynak", "Karşı", "Durum"]);
    expect(second).toContain('<td data-label="Durum"><span class="v">eksik</span></td>');
    expect(cov).toContain('<p class="note">ALT SORU: 3 · tam 1 · boş 1 (S2) · eksik 1 (S3)</p>');
    expect(got.page).toContain(".from-n{");
  });

  it("builds a page whose answer has no S-heading byte for byte as before", () => {
    expect(page).toBe(readFileSync(join(RENDER, "drawer-page.html"), "utf8"));
  });
});

describe("final.html — what the auditor corrected and removed (B56 K3 stage 3)", () => {
  it("says under the verdict what it read, marks each line it corrected, lists both under the ledger; without it, byte for byte", () => {
    // fixtures/audit/render/audit.jsonl: run-drawer's answer as the auditor left it — C002's list item and C004's table row
    // its own lines, a line it removed (C003 when it was read), one claim it did not read, the rest ok
    const run = join(root, "audited");
    cpSync(FIX, run, { recursive: true });
    cpSync(join(dirname(resolve(import.meta.filename)), "fixtures", "audit", "render", "audit.jsonl"), join(run, "audit.jsonl"));
    const got = render(run);
    expect(got.said).toMatch(/^0 /);
    expect(got.page).toContain('</div>\n<p class="audit-n"><span class="count">denetçi: 6 iddia okundu · 2 düzeltildi · 1 çıkarıldı · '
      + '1 denetlenmedi</span></p>\n<section class="sec" id="sayilar">');
    // the mark after the count of each corrected line, its reason (escaped) in the title — and nowhere else
    const mark = (why: string) => ` <span class="audit" title="denetçi: ${why}">düzeltildi</span>`;
    const el = (id: string, tag: string) => got.page.match(new RegExp(`<${tag} id="${id}">[\\s\\S]*?</${tag}>`))?.[0] ?? "";
    expect(el("C002", "li")).toMatch(/<span class="count">\(2 satır · 2 bağımsız kaynak\)<\/span> <span class="audit" /);
    expect(el("C002", "li").endsWith(`${mark("Satırlar fiyattan söz etmiyor: &lt;fiyat&gt; &amp; maliyet yok.")}</li>`)).toBe(true);
    expect(el("C004", "tr").endsWith(`</span>${mark("Satırlar yalnız ajan işini ve hızı söylüyor.")}</span></td></tr>`)).toBe(true);
    expect(got.page.match(/class="audit"/g)).toHaveLength(2);
    // under the ledger's table: the lines as they were → as the auditor wrote them, then the removed one by its old id
    const book = got.page.split('id="iddialar"')[1]?.split("</section>")[0] ?? "";
    const audit = readFileSync(join(run, "audit.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
    const cut = (s: string) => (s.length <= 200 ? s : `${s.slice(0, 199).trimEnd()}…`);
    expect(book.indexOf("Denetçinin düzelttikleri")).toBeGreaterThan(book.indexOf("</table>"));
    expect(book).toContain('<p class="from-t audit-t">Denetçinin düzelttikleri</p>\n<ul class="audit-list">\n'
      + "<li><code>C002</code> — X'te okunan iki gönderi iş bölümünü ve fiyatı anlatıyor [L0006, L0001]. → X'te okunan iki gönderi "
      + "iş bölümünü anlatıyor [L0006, L0001]. — Satırlar fiyattan söz etmiyor: &lt;fiyat&gt; &amp; maliyet yok.</li>\n"
      + `<li><code>C004</code> — ${cut(audit[4].was)} → ${audit[4].line} — Satırlar yalnız ajan işini ve hızı söylüyor.</li>\n</ul>`
      + '\n<p class="from-t audit-t">Denetçinin çıkardıkları</p>\n<ul class="audit-list">\n'
      + "<li><code>C003</code> — Bir gönderi Fable'ı yazıda öne koyuyor [L0002]. — Gösterilen satır bunu söylemiyor.</li>\n</ul>");
    expect(cut(audit[4].was).endsWith("…")).toBe(true);
    // kapsama.py counts the same record under "Nereye bakıldı"
    expect(got.page).toContain('<p class="note">DENETÇİ: 6 okundu · 2 düzeltildi · 1 çıkarıldı · 1 denetlenmedi</p>');
    rmSync(join(run, "audit.jsonl"));
    expect(render(run).page).toBe(readFileSync(join(RENDER, "drawer-page.html"), "utf8"));
  });
});

describe("final.html — the research type: its line under the verdict, its Şekil section before S1 (B56 K3 stage 2)", () => {
  const SHAPE = join(dirname(resolve(import.meta.filename)), "fixtures", "shape");

  it("says the type under the verdict box and stands the Şekil section after the number line, before S1; final.md alike", () => {
    // fixtures/shape/answer.md: run-drawer's rows, the verdict, the number that carries it, S1, then the Şekil table (an
    // id-less row, and a Toplam row that cites nothing) the writer put AFTER S1, then S2 with rule 12's geçiş table
    const run = join(root, "shaped");
    cpSync(FIX, run, { recursive: true });
    for (const f of ["answer.md", "subquestions.json"]) cpSync(join(SHAPE, f), join(run, f));
    const got = render(run);
    expect(got.said).toMatch(/^0 /);
    expect(got.page).toContain('</div>\n<p class="shape-n"><span class="count">rapor tipi: Karşılaştırma · kaynak: model</span></p>\n'
      + '<section class="sec" id="sayilar">\n<h2><span class="no">01 —</span> Cevabı taşıyan sayılar</h2>\n'
      + '<ul class="claims">\n<li id="C002">Okunan dört satırın ikisi Astra 6');
    expect(got.page).toContain('<span class="count">(2 satır · 2 bağımsız kaynak)</span></li>\n</ul>\n'
      + '<div class="from"><p class="from-t">Şekil — Karşılaştırma</p>\n<p class="from-n"><span class="count">'
      + "(2 iddia · 4 satır · 4 bağımsız kaynak · 0 karşı)</span></p>\n<div class=\"tbl\">");
    const ours = got.page.split('id="sayilar"')[1]?.split("</section>")[0] ?? "";
    expect([...ours.matchAll(/<p class="from-t">([^<]*)<\/p>/g)].map((m) => m[1]))
      .toEqual(["Şekil — Karşılaştırma", "S1 — X'te iş bölümü", "S2 — Geçiş yapanlar"]);
    // the Toplam row is no claim and carries no count; the id-less row beside it keeps its warm (0 satır)
    expect(ours).toContain('<tr><td data-label="Alt soru"><span class="v">Toplam</span></td><td data-label="Astra 6"><span class="v">2'
      + '</span></td><td data-label="Fable 5.1"><span class="v">2</span></td><td data-label="Öne çıkan gerekçe"><span class="v">—'
      + "</span></td></tr>");
    expect(ours).toContain('<span class="v">satır yok <span class="count zero">(0 satır)</span></span></td></tr>');
    // both tables are claims of the ledger; the page numbers L0007 fourth, as final.md does
    const book = got.page.split('id="iddialar"')[1]?.split("</section>")[0] ?? "";
    expect(book).toContain("S2 — Geçiş yapanlar · 1 · 1 · kota");
    expect(book).toContain("r/LocalLLaMA kullanıcısı · Fable 5.1 → Astra 6 · kota bitti");
    expect(ours).toContain('<a class="ref" href="#L0007" title="L0007">4</a>');
    expect(got.page).toContain('<p class="note">ŞEKİL: karşılaştırma (model) · levha satırı 2 · geçiş tablosu var</p>');
    expect(got.page).toContain(".shape-n{");
    spawnSync("python3", [join(root, "engine", "render.py"), join(run, "answer.md"), "--evidence", join(run, "evidence.jsonl"),
      "--out", join(run, "final.md")], { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
    const md = readFileSync(join(run, "final.md"), "utf8");
    expect(md.startsWith("Net bir kazanan yok: iş bölümü var [1] [2]. (2 satır · 2 bağımsız kaynak)\n\nOkunan dört satırın ikisi "
      + "Astra 6'yı, ikisi Fable 5.1'i öne koyuyor [2, 3]. (2 satır · 2 bağımsız kaynak)\n\n## Şekil — Karşılaştırma\n\n"), md).toBe(true);
    expect(md).toContain("| S2 — Geçiş yapanlar | 1 [4] | 1 [3] | kota [4] (2 satır · 2 bağımsız kaynak) |\n| Diğer | — | — | satır yok |\n"
      + "| Toplam | 2 | 2 | — |\n\n## S1 — X'te iş bölümü\n");
    expect(md.match(/^## .*$/gm)).toEqual(["## Şekil — Karşılaştırma", "## S1 — X'te iş bölümü", "## S2 — Geçiş yapanlar",
      "## Kaynaklar", "## Nereye bakıldı"]);
  });

  it("keeps a karar section's three `### ` lists inside its block; a `—` alone carries no (0 satır), an id-less item does", () => {
    const run = join(root, "shaped-karar");
    cpSync(FIX, run, { recursive: true });
    cpSync(join(SHAPE, "subquestions.json"), join(run, "subquestions.json"));
    writeFileSync(join(run, "answer.md"), "Net bir kazanan yok: iş bölümü var [L0006] [L0001].\n\nİki satır ikisini birlikte "
      + "kullanıyor [L0006, L0001].\n\n## Şekil — Karar\n\n### Hüküm\n- İkisini birlikte kullanın [L0006, L0001].\n\n### Riskler\n- —\n\n"
      + "### Hükmü ne değiştirir\n- Kalabalık sayımı yapılmadı.\n\n## S1 — X'te iş bölümü\n- Plan Fable'da, hız Astra'da [L0006, L0001].\n",
    "utf8");
    const got = render(run);
    expect(got.said).toMatch(/^0 /);
    const block = got.page.split('<p class="from-t">Şekil — Karar</p>')[1]?.split("</div>")[0] ?? "";
    expect(block).toContain('<p class="from-n"><span class="count">(1 iddia · 2 satır · 2 bağımsız kaynak · 0 karşı)</span></p>');
    expect([...block.matchAll(/<h3>([^<]*)<\/h3>/g)].map((m) => m[1])).toEqual(["Hüküm", "Riskler", "Hükmü ne değiştirir"]);
    expect(block).toContain("<h3>Riskler</h3>\n<ul class=\"claims\">\n<li>—</li>\n</ul>");
    expect(block).toContain('<li>Kalabalık sayımı yapılmadı. <span class="count zero">(0 satır)</span></li>');
    expect(got.page.indexOf("Şekil — Karar")).toBeLessThan(got.page.indexOf('<p class="from-t">S1 — X'));
  });

  it("puts the type's line above the auditor's; a subquestions.json without a shape gives neither the line nor its rule", () => {
    const run = join(root, "shaped-audited");
    cpSync(FIX, run, { recursive: true });
    cpSync(join(dirname(resolve(import.meta.filename)), "fixtures", "audit", "render", "audit.jsonl"), join(run, "audit.jsonl"));
    const doc = JSON.parse(readFileSync(join(SHAPE, "subquestions.json"), "utf8"));
    writeFileSync(join(run, "subquestions.json"), JSON.stringify({ ...doc, shape: "pazar", shape_name: "Pazar levhası", shape_source: "ceo" }));
    const got = render(run);
    expect(got.said).toMatch(/^0 /);
    expect(got.page).toContain('</div>\n<p class="shape-n"><span class="count">rapor tipi: Pazar levhası · kaynak: CEO</span></p>\n'
      + '<p class="audit-n"><span class="count">denetçi: 6 iddia okundu · ');
    expect(got.page).toContain(".shape-n+.audit-n{margin-top:-42px}");
    writeFileSync(join(run, "subquestions.json"), JSON.stringify(Object.fromEntries(Object.entries(doc).filter(([k]) => !k.startsWith("shape")))));
    const bare = render(run).page;
    expect(bare).toContain('<p class="audit-n">');
    expect(bare).not.toContain("shape-n");
  });
});

describe("final.html — a page that stands alone", () => {
  it("loads no script, takes fonts from Google only, carries light and dark tokens and kapsama.py's table", () => {
    expect(page).not.toMatch(/<script[^>]+src=/);
    const head = page.split("<body>")[0];
    expect(new Set([...head.matchAll(/(?:href|src)="(https?:\/\/[^/"]+)/g)].map((m) => m[1])))
      .toEqual(new Set(["https://fonts.googleapis.com", "https://fonts.gstatic.com"]));
    expect(page).toContain(":root{--bg:");
    expect(page).toContain('@media (prefers-color-scheme:dark){:root:not([data-theme="light"])');
    expect(page).toContain(':root[data-theme="dark"]{');
    expect(page).toContain("body{margin:0;background:var(--bg)");
    expect(page).toContain("<title>Astra 6 vs Fable 5.1</title>");
    expect(page).toContain("2 avcı · 64–243 sn");
    const cov = page.split('id="kapsama"')[1]?.split("</section>")[0] ?? "";
    // the numbers stand as a grid; the reasons (Elenen, Kapalı kapı) run under their platform's numbers
    expect([...cov.matchAll(/<th[^>]*>([^<]*)<\/th>/g)].map((m) => m[1]))
      .toEqual(["Platform", "Bulundu", "İndirildi", "İlgili", "Okundu", "Kısmen", "Kanıt", "Cevapta"]);
    expect(cov).toContain('<span class="why-l">Elenen</span> ilgisiz: Opus vs Astra, not Fable ×2 · ilgisiz: Free access tip only ×1 · tekrar ×1');
    expect(cov).toContain('<span class="why-l">Kapalı kapı</span> opencli reddit read kod 1 ×1');
    expect(cov).toContain("RECONCILED — bulundu 12");
  });

  it("never grows wider than its column: a chain of chips breaks between two chips, a wide table scrolls in its own box", () => {
    // 2026-09-27, the K3 page at 1280 px: scroll width 1802 — a 4-column table 1526 px wide, its cells holding up to
    // ~20 chips on one line (`.refs{white-space:nowrap}`, the chips written with nothing between them)
    const dir = join(root, "wide");
    cpSync(join(RENDER, "k1-cut"), dir, { recursive: true });
    const ids = readFileSync(join(dir, "evidence.jsonl"), "utf8").split("\n").filter(Boolean)
      .map((l) => JSON.parse(l).id as string).filter((id) => id !== "L1071").slice(0, 25);   // L1071: the one refused
    writeFileSync(join(dir, "answer.md"), "Net bir kazanan yok: iş bölümü var.\n\n| Platform | Fable lehine | Astra lehine | İş bölümü |\n"
      + `|---|---|---|---|\n| X | Plan ve kod [${ids.join(", ")}] | Hız | Plan Fable'da, iş Astra'da |\n`, "utf8");
    const got = render(dir);
    expect(got.said).toMatch(/^0 /);
    expect(got.page).toContain('<div class="tbl"><table class="stack"><thead><tr><th>Platform</th>');
    expect(got.page.match(/\.tbl\{[^}]*\}/)?.[0]).toContain("overflow-x:auto");
    const refs = got.page.match(/\.refs\{[^}]*\}/)?.[0] ?? "";
    expect(refs).toMatch(/^\.refs\{/);
    expect(refs).not.toContain("nowrap");
    const cell = got.page.match(/<td data-label="Fable lehine">[\s\S]*?<\/td>/)?.[0] ?? "";
    expect(cell.match(/<a class="ref"/g)).toHaveLength(25);
    // between every two chips a place to break — a whitespace character or U+200B, never nothing
    const gaps = [...cell.matchAll(/<\/a>([^<]*)<a class="ref"/g)].map((m) => m[1]);
    expect(gaps).toHaveLength(24);
    for (const g of gaps) expect(g).toMatch(/^[\s\u200B]+$/);
  });
});

describe("final.html — the claim ledger's numbers beside every claim (EVIDENCE-B56-K2 §2.4)", () => {
  /** fixtures/render/k1-cut in a folder of its own: its answer (plus `extra`), and a claims.jsonl when given. */
  const k1 = (name: string, extra = "", ledger?: object[]) => {
    const dir = join(root, name);
    cpSync(join(RENDER, "k1-cut"), dir, { recursive: true });
    if (extra) writeFileSync(join(dir, "answer.md"), readFileSync(join(dir, "answer.md"), "utf8") + extra, "utf8");
    if (ledger) writeFileSync(join(dir, "claims.jsonl"), ledger.map((c) => JSON.stringify(c)).join("\n") + "\n", "utf8");
    return render(dir);
  };
  const li = (html: string, head: string) => html.match(new RegExp(`<li id="C\\d{3}"><strong>${head}</strong>[\\s\\S]*?</li>`))?.[0] ?? "";
  const book = (html: string) => html.split('id="iddialar"')[1]?.split("</section>")[0] ?? "";

  it("prints ONE span at the end of a paired line — rows, independent sources, counter rows — and one source as thin", () => {
    const got = k1("k1");
    expect(got.said).toMatch(/^0 /);
    // K1's line 66, `[L1720, L1722, L1755 ↔ L1721, L1723, L1724]`: three authors in two threads against three
    const kota = li(got.page, "Kota:");
    expect(kota.match(/class="count/g)).toHaveLength(1);
    expect(kota).toMatch(/<\/span> ↔ <span class="refs">.*?<\/span> <span class="count">\(3 satır · 3 bağımsız kaynak · 3 karşı\)<\/span><\/li>$/);
    // line 69, prose between the sides: one row, one source — `thin`, the warning colour
    expect(li(got.page, "Uzun görev:")).toMatch(/\. <span class="count thin">\(1 satır · 1 bağımsız kaynak · 1 karşı\)<\/span><\/li>$/);
    expect(got.page.match(/\.count\.thin\{[^}]*\}/)?.[0]).toContain("color:var(--warm)");
  });

  it("strikes a row its hunter judged no evidence, counts it in nothing, and still builds the page", () => {
    const got = k1("k1-struck", "- **Tek başına:** Astra 53, Fable 50 [L1071].\n");
    expect(got.said).toMatch(/^0 /);
    const bench = li(got.page, "Benchmark:");
    expect(bench).toContain('<s class="inadmissible" title="avcı: kanıt değil — benchmark/promo, no user preference">[L1071]</s>');
    expect(bench).toMatch(/<span class="count">\(4 satır · 4 bağımsız kaynak\)<\/span><\/li>$/);
    // no number, no quote card, not marked in the drawer; a line that cites nothing else is a claim with 0 rows
    expect(got.page).not.toMatch(/<a class="ref" href="#L1071"/);
    expect(got.page).not.toContain('id="q-L1071"');
    const entry = items(drawerOf(got.page, "x")).find((m) => m[2] === "L1071");
    expect(entry?.[0]).toContain("avcı: kanıt değil");
    expect(entry?.[1]).toBeUndefined();
    expect(li(got.page, "Tek başına:")).toMatch(/\[L1071\]<\/s>\. <span class="count zero">\(0 satır\)<\/span><\/li>$/);
  });

  it("stands the ledger second, one row per claim anchored to its line, the four numbers under it", () => {
    const got = k1("k1-ledger");
    expect([...got.page.matchAll(/<section class="sec" id="([^"]+)">/g)].map((m) => m[1]).slice(0, 3))
      .toEqual(["sayilar", "iddialar", "s03"]);
    const b = book(got.page);
    expect([...b.matchAll(/<th[^>]*>([^<]*)<\/th>/g)].map((m) => m[1]))
      .toEqual(["#", "İddia", "Satır", "Bağımsız kaynak", "Başlık", "Alan", "Karşı", "Durum"]);
    const rows = [...b.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].slice(1)
      .map((m) => [...m[1].matchAll(/<span class="v">([\s\S]*?)<\/span><\/td>/g)].map((c) => c[1]));
    // the verdict, the table row, lines 66, 69 and 71 — # · satır · kaynak · başlık · alan · karşı · durum
    expect(rows.map((r) => [r[0], ...r.slice(2)])).toEqual([
      ["C001", "6", "6", "5", "4", "0", "tam"], ["C002", "2", "2", "2", "1", "0", "tam"],
      ["C003", "3", "3", "2", "1", "3", "tam"], ["C004", "1", "1", "1", "1", "1", "tek kaynak"],
      ["C005", "4", "4", "4", "4", "0", "kabul edilmeyen alıntı"]]);
    for (const [cid, claim] of rows) {
      expect(claim).toMatch(new RegExp(`^<a href="#${cid}">[^<]{1,120}</a>$`));
      expect(got.page).toMatch(new RegExp(`<(?:p class="lede"|li|tr) id="${cid}">`));
    }
    expect(b).toContain("5 iddia · 1 tek kaynak · 3 karşısız · 1 kabul edilmeyen alıntı · kaynak = ayrı yazar, yazar yoksa ayrı adres");
  });

  it("reads the ledger from claims.jsonl beside the answer, where the claim hunters' links and states are", () => {
    const claim = (id: string, line: number, more: object) => ({ id, line, text: `iddia ${id}`, support: ["L1720"], counter: [],
      inadmissible: [], rows: 2, sources: 2, threads: 1, domains: 1, counter_rows: 0, thin: false, links: [], ...more });
    const got = k1("k1-file", "", [claim("C001", 1, { counter_status: "none" }), claim("C002", 7, { counter_status: "not-sent (cap)" }),
      claim("C003", 11, { counter_status: "found", links: [{ kind: "against", id: "L1766", by: "karsi", at: "2026-09-26" }] })]);
    expect(got.said).toMatch(/· iddia defteri 3 \(claims\.jsonl\)/);
    expect([...book(got.page).matchAll(/data-label="Durum"(?: class="flag")?><span class="v">([^<]*)</g)].map((m) => m[1]))
      .toEqual(["karşı arandı, yok", "karşı gönderilmedi (sınır)", "karşı bulundu, yazar kullanmadı"]);
    expect(book(got.page)).toContain('<a href="#C003">iddia C003</a>');
    expect(got.page).toContain('<li id="C003"><strong>Kota:</strong>');
    // the span beside the line is still the answer's own count, not the file's
    expect(li(got.page, "Kota:")).toContain("(3 satır · 3 bağımsız kaynak · 3 karşı)");
  });
});
