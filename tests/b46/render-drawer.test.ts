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
// HOW IT RUNS: the REAL render.py — with the real kapsama.py and evidence.py beside it — on a temporary
// copy of fixtures/evidence/run-drawer: thirteen rows on X, Reddit and YouTube in every ledger state, a
// hunter's quote row on its post's address, an X body longer than 300 characters; its answer's own
// "Cevabı taşıyan sayılar" holds a line and a table row that cite nothing. Nothing is written into the
// repository and nothing leaves the machine.

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SKILL } from "./engine-copy.js";

const FIX = join(dirname(resolve(import.meta.filename)), "fixtures", "evidence", "run-drawer");
type Row = { id: string; url: string; author: string | null; passage?: string };
const ROWS: Row[] = readFileSync(join(FIX, "evidence.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const row = (id: string) => ROWS.find((r) => r.id === id)!;

let root: string;
let page = "";
let said = "";
/** The real render.py on a run folder: its exit and what it said, and the page it wrote ("" when none). */
function render(run: string): { said: string; page: string } {
  const p = spawnSync("python3", [join(SKILL, "scripts", "render.py"), join(run, "answer.md"), "--evidence",
    join(run, "evidence.jsonl"), "--out", join(run, "final.html")],
  { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
  const out = join(run, "final.html");
  return { said: `${p.status} ${p.stdout}${p.stderr}`, page: existsSync(out) ? readFileSync(out, "utf8") : "" };
}
beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "b46-drawer-"));
  const run = join(root, "run");
  cpSync(FIX, run, { recursive: true });
  ({ said, page } = render(run));
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

const drawer = (p: string) => page.match(new RegExp(`<details class="plat" id="p-${p}">([\\s\\S]*?)</details>`))?.[1] ?? "";
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

  it("carries (n satır) beside every line that cites rows, each id a link into the drawer", () => {
    // six lines of answer.md cite rows: the verdict (2 ids), a list item (2), our own table's row (2), the
    // comparison's two rows (2, 1), the contradiction (2)
    const counts = [...page.matchAll(/<span class="count">\((\d+) satır\)<\/span>/g)].map((m) => Number(m[1]));
    expect(counts.sort((a, b) => a - b)).toEqual([1, 2, 2, 2, 2, 2]);
    expect(page).toMatch(/X'te okunan iki gönderi iş bölümünü anlatıyor <span class="refs">.*?<\/span>\. <span class="count">\(2 satır\)<\/span>/);
    const links = [...page.matchAll(/<a class="ref" href="#(L\d{4})"/g)].map((m) => m[1]);
    expect(new Set(links)).toEqual(new Set(["L0006", "L0007", "L0001", "L0010"]));
    const drawers = ["x", "youtube", "reddit"].map(drawer).join("");
    for (const id of links) expect(drawers).toContain(`id="${id}"`);
  });

  it("gives every line and table row under 'Cevabı taşıyan sayılar' its count, a warm (0 satır) when it cites none", () => {
    // the lead's ruling, 2026-09-26: a claim nothing supports is seen; outside the block such a line stays plain
    const zero = ' <span class="count zero">(0 satır)</span>';
    const ours = page.split('id="sayilar"')[1]?.split("</section>")[0] ?? "";
    const lines = [...ours.matchAll(/<li>[\s\S]*?<\/li>|<tr><td[\s\S]*?<\/tr>/g)].map((m) => m[0]);
    expect(lines).toHaveLength(5);        // two list items, our table's two rows, the contradiction
    for (const l of lines) expect(l).toMatch(/<span class="count( zero)?">\(\d+ satır\)<\/span>/);
    expect(ours).toContain(`<li>Kalabalık sayımı bu koşuda yok; kişi sayısı verilmedi.${zero}</li>`);
    expect(ours).toContain(`<td data-label="Satırlar"><span class="v">${zero}</span></td>`);
    expect(page).toContain("<li>Kapısı kapalı Reddit başlığı okunamadı; açılırsa tablo değişebilir.</li>");
    expect(page.match(/\.count\.zero\{[^}]*\}/)?.[0]).toContain("color:var(--warm)");
  });
});

describe("final.html — counter-evidence in one bracket is the two citations it holds", () => {
  it("renders [L0001, L0002 ↔ L0003] as two groups, a count beside each; [L0001 ↔ L9999] is still refused", () => {
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
    // each side its chips and its own count, ↔ between them, and no sum of the two sides at the line's end
    expect(ok.page.match(/<li>Kota: [\s\S]*?<\/li>/)?.[0].replace(/<a class="ref" href="#(L\d{4})"[^>]*>\d+<\/a>/g, "$1"))
      .toBe('<li>Kota: iki taraf birbirini yalanlıyor <span class="refs">L0001L0002</span> <span class="count">(2 satır)</span> ↔ '
        + '<span class="refs">L0003</span> <span class="count">(1 satır)</span>.</li>');
    // kapsama.py reads the pair the same way (platforms.split_paired): L0003's post is X's third cited address
    const cov = ok.page.split('id="kapsama"')[1]?.split("</section>")[0] ?? "";
    expect(cov.match(/<span class="v">X<\/span><\/td>[\s\S]*?data-label="Cevapta" class="n"><span class="v">(\d+)</)?.[1]).toBe("3");
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
      .toEqual(["X — 6 gönderi (2 cevapta)", "YouTube — 2 video (1 cevapta)", "Reddit — 1 başlık (1 cevapta)"]);
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
      .toEqual(["Platform", "Bulundu", "İndirildi", "İlgili", "Okundu", "Kısmen", "Cevapta"]);
    expect(cov).toContain('<span class="why-l">Elenen</span> ilgisiz: Opus vs Astra, not Fable ×2 · ilgisiz: Free access tip only ×1 · tekrar ×1');
    expect(cov).toContain('<span class="why-l">Kapalı kapı</span> opencli reddit read kod 1 ×1');
    expect(cov).toContain("RECONCILED — bulundu 12");
  });
});
