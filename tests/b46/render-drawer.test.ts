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
// HOW IT RUNS: the REAL render.py — with the real kapsama.py, evidence.py and claims.py beside it, the
// engine's scripts copied to a temporary folder — on a temporary copy of fixtures/evidence/run-drawer:
// thirteen rows on X, Reddit and YouTube in every ledger state (the cited L0001, L0002, L0007 and L0010
// judged evidence by their hunters, so the ledger admits them), a hunter's quote row on its post's address,
// an X body longer than 300 characters; its answer's own "Cevabı taşıyan sayılar" holds a line and a table
// row that cite nothing. And on fixtures/render/k1-cut: five claim lines of the kept K1 answer verbatim —
// its verdict, a table row, lines 66, 69 and 71 — with the 34 rows of evidence.jsonl they stand on. Nothing
// is written into the repository and nothing leaves the machine.

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
      .toBe('<li id="C007">Kota: iki taraf birbirini yalanlıyor <span class="refs">L0001L0002</span> ↔ <s class="inadmissible" '
        + 'title="elendi: irrelevant">[L0003]</s>. <span class="count">(2 satır · 2 bağımsız kaynak)</span></li>');
    // kapsama.py reads the pair the same way (platforms.split_paired), and like the drawer it leaves L0003,
    // refused, out of the answer: X's Cevapta is the drawer's "2 cevapta" (K1 counted L0003's post: 3)
    const cov = ok.page.split('id="kapsama"')[1]?.split("</section>")[0] ?? "";
    expect(cov.match(/<span class="v">X<\/span><\/td>[\s\S]*?data-label="Cevapta" class="n"><span class="v">(\d+)</)?.[1]).toBe("2");
    expect(ok.page).toContain("<summary>X — 6 gönderi (2 cevapta)</summary>");
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
