// B56 — THE PAGE IS BUILT FROM THE EVIDENCE ROWS, NEVER FROM WHAT THE MODEL TYPED.
//
// WHAT WENT WRONG (plan v2 §1 cause 2, .planning/quick/20260924-research-door-perplexity/PLAN.md):
// on the answer the CEO rejected on 2026-09-24 the writer had the X quotes in hand and dropped
// them — it wrote from the hunters' prose, not from what had been read. The lead measured the run
// (EVIDENCE-B56-2026-09-26.md): X found 294, cited 0. A quote the model types can be invented; a
// quote the page prints from a row the fetcher wrote cannot.
//
// THE CONTRACT (EVIDENCE-B56 "THE CONTRACTS", render.py): the answer carries `[Lxxxx]` ids only;
// render.py numbers them in first-appearance order, prints each quote, author, date, platform and
// address FROM THE ROW under "Kaynaklar", appends kapsama.py's table under "Nereye bakıldı", and
// refuses (exit 2, one line, no page) an unknown id, a typed address and a typed quote block. Since
// 2026-09-26 the same answer also becomes final.html, the designed page (render-drawer.test.ts); without
// --out both are written, and a refusal takes both earlier pages away.
//
// HOW IT RUNS: the real render.py is copied into a temporary folder beside a stand-in kapsama.py
// (fixtures/render/kapsama.py). render.py calls the kapsama.py in its own folder, so the copy finds
// the stand-in; nothing is written into the repository and nothing leaves the machine.

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SKILL } from "./engine-copy.js";

const FIX = join(dirname(resolve(import.meta.filename)), "fixtures", "render");
const ANSWER = readFileSync(join(FIX, "answer.md"), "utf8");
type Row = { id: string; url: string; domain: string; author: string | null; pub_date: string | null; passage: string };
const ROWS: Row[] = readFileSync(join(FIX, "evidence.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const row = (id: string) => ROWS.find((r) => r.id === id)!;

let root: string;
let runs = 0;
beforeAll(() => {
  root = realpathSync(mkdtempSync(join(tmpdir(), "b46-render-")));
  for (const [dir, stub] of [["with-kapsama", true], ["no-kapsama", false]] as const) {
    mkdirSync(join(root, dir));
    copyFileSync(join(SKILL, "scripts", "render.py"), join(root, dir, "render.py"));
    if (stub) copyFileSync(join(FIX, "kapsama.py"), join(root, dir, "kapsama.py"));
  }
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

/** One fresh run folder per case — a refusal checked where a final.md already stands proves nothing. */
function render(answer = ANSWER, o: { scripts?: string; flags?: string[]; env?: Record<string, string>; stale?: boolean } = {}) {
  const dir = join(root, `run-${++runs}`);
  mkdirSync(dir);
  writeFileSync(join(dir, "answer.md"), answer, "utf8");
  copyFileSync(join(FIX, "evidence.jsonl"), join(dir, "evidence.jsonl"));
  const out = join(dir, "final.md");
  if (o.stale) writeFileSync(out, "a page an earlier render left here\n", "utf8");
  const p = spawnSync("python3", [join(root, o.scripts ?? "with-kapsama", "render.py"), join(dir, "answer.md"),
    "--evidence", join(dir, "evidence.jsonl"), "--out", out, ...(o.flags ?? [])],
  { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1", ...o.env } });
  return { dir, code: p.status, said: `${p.stdout}${p.stderr}`, err: p.stderr, page: existsSync(out) ? readFileSync(out, "utf8") : null };
}
const section = (page: string, heading: string) => page.split(`## ${heading}\n`)[1]?.split("\n## ")[0] ?? "";

describe("C1 — quotes come from the rows", () => {
  it("numbers the ids in first-appearance order, a repeated id keeping its number", () => {
    // the answer cites L0002, L0001, L0002, L0001, L0004 — in that order
    const r = render();
    expect(r.code, r.said).toBe(0);
    const body = r.page!.split("\n## Kaynaklar\n")[0];
    expect(body).not.toMatch(/L\d{4}/);
    expect(body.match(/\[\d+\]/g)).toEqual(["[1]", "[2]", "[1]", "[2]", "[3]"]);
  });

  it("prints passage, author, date, platform and address from the row — never from the answer", () => {
    const r = render();
    const src = section(r.page!, "Kaynaklar");
    const [a, b, c] = [row("L0002"), row("L0001"), row("L0004")];
    expect(src).toContain(`1. **${a.author}** · ${a.pub_date} · x — “${a.passage}” — ${a.url}`);
    expect(src).toContain(`2. **${b.author}** · ${b.pub_date} · reddit — “${b.passage}” — ${b.url}`);
    // no author and no date on the row: its domain and "tarih yok", never a guess
    expect(src).toContain(`3. **${c.domain}** · tarih yok · reddit — “${c.passage}” — ${c.url}`);
    // L0003 shares L0002's address but is not cited, so it is not listed
    expect(src).not.toContain(row("L0003").passage);
    // and the answer file itself holds no quote text and no address
    for (const x of ROWS) {
      expect(ANSWER).not.toContain(x.passage);
      expect(ANSWER).not.toContain(x.url);
    }
  });
});

describe("C2 — what the answer may not carry is refused, and no page is written", () => {
  const cases: [string, string, RegExp][] = [
    ["an id that is not in evidence.jsonl", `${ANSWER}\nBir iddia daha [L0099].\n`, /id not in evidence\.jsonl: L0099 \(line 13\)/],
    ["a raw address typed into the answer", `${ANSWER}\nKaynak: https://example.com/post/1\n`, /raw address in the answer at line 13: https:\/\/example\.com\/post\/1/],
    ["a quote block typed into the answer", `${ANSWER}\n> “Bunu ben yazdım.”\n`, /quote block in the answer at line 13/],
  ];
  for (const [name, answer, reason] of cases) {
    it(`refuses ${name}: exit 2, one line, no final.md`, () => {
      const r = render(answer);
      expect(r.code, r.said).toBe(2);
      expect(r.err.trim().split("\n"), r.err).toHaveLength(1);
      expect(r.err).toMatch(reason);
      expect(r.page).toBeNull();
    });
  }

  it("removes a final.md an earlier render left, so no old page stands beside a refused answer", () => {
    const r = render(`${ANSWER}\nBir iddia daha [L0099].\n`, { stale: true });
    expect(r.code, r.said).toBe(2);
    expect(r.err).toMatch(/the earlier final\.md was removed/);
    expect(r.page).toBeNull();
  });

  // ONE PATTERN, ONE OWNER (platforms.CITE_RE): a citation is exactly [L0042] or [L0042, L0043]. A
  // bracket that merely looks like one would be left as text here while the coverage table counted it.
  for (const loose of ["[bkz. L0002]", "[L0001 ]", "[l0003]", "[L0001; L0002]"]) {
    it(`refuses ${loose}: it looks like a citation and is not one`, () => {
      const r = render(`${ANSWER}\nBir iddia daha ${loose}.\n`);
      expect(r.code, r.said).toBe(2);
      expect(r.err.trim().split("\n"), r.err).toHaveLength(1);
      expect(r.err).toContain(`not a citation at line 13: ${loose}`);
      expect(r.page).toBeNull();
    });
  }

  it("accepts [L0001] and [L0001, L0002], numbering a group in place", () => {
    const r = render(`${ANSWER}\nTek [L0001], ikisi [L0001, L0002].\n`);
    expect(r.code, r.said).toBe(0);
    expect(r.page).toContain("Tek [2], ikisi [2, 1].");
  });
});

describe("C3 — the coverage table stands under the answer, and never blocks it", () => {
  it("calls kapsama.py <run> --answer <answer.md> and prints its table under 'Nereye bakıldı'", () => {
    const r = render();
    expect(r.code, r.said).toBe(0);
    expect(JSON.parse(readFileSync(join(r.dir, "kapsama-argv.json"), "utf8"))).toEqual([r.dir, "--answer", join(r.dir, "answer.md")]);
    expect(section(r.page!, "Nereye bakıldı")).toContain("| Platform | Bulundu | Okundu | Cevapta | Okunmadı / kapalı kapı |");
    // the order of the page: the answer, then its sources, then where it looked
    expect(r.page!.indexOf("## Kaynaklar")).toBeLessThan(r.page!.indexOf("## Nereye bakıldı"));
  });

  it("still writes the page, with a one-line note, when kapsama.py is missing or fails", () => {
    for (const r of [render(ANSWER, { scripts: "no-kapsama" }), render(ANSWER, { env: { KAPSAMA_STUB_FAIL: "1" } })]) {
      expect(r.code, r.said).toBe(0);
      const note = section(r.page!, "Nereye bakıldı").trim();
      expect(note.split("\n"), note).toHaveLength(1);
      expect(note).toMatch(/^_Kapsama tablosu basılamadı: kapsama\.py /);
    }
  });

  it("--no-coverage leaves the section out and never calls kapsama.py", () => {
    const r = render(ANSWER, { flags: ["--no-coverage"] });
    expect(r.code, r.said).toBe(0);
    expect(r.page).not.toContain("Nereye bakıldı");
    expect(existsSync(join(r.dir, "kapsama-argv.json"))).toBe(false);
  });
});

describe("C4 — without --out the answer becomes both pages, and a refusal takes both away", () => {
  it("writes final.md and final.html beside the answer; a refused answer removes both", () => {
    const dir = join(root, `run-${++runs}`);
    mkdirSync(dir);
    copyFileSync(join(FIX, "evidence.jsonl"), join(dir, "evidence.jsonl"));
    const run = (answer: string) => {
      writeFileSync(join(dir, "answer.md"), answer, "utf8");
      return spawnSync("python3", [join(root, "with-kapsama", "render.py"), join(dir, "answer.md"), "--evidence",
        join(dir, "evidence.jsonl")], { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
    };
    const ok = run(ANSWER);
    expect(ok.status, ok.stderr).toBe(0);
    expect(readFileSync(join(dir, "final.md"), "utf8")).toContain("## Kaynaklar");
    // render.py copied alone (no platforms.py beside it) still builds the page, the platform keys as labels
    expect(readFileSync(join(dir, "final.html"), "utf8")).toMatch(/^<!doctype html>[\s\S]*<summary>X — 1 gönderi \(1 cevapta\)<\/summary>/);
    const no = run(`${ANSWER}\nBir iddia daha [L0099].\n`);
    expect(no.status, no.stderr).toBe(2);
    expect(no.stderr).toMatch(/the earlier final\.md was removed; the earlier final\.html was removed/);
    expect(existsSync(join(dir, "final.md")) || existsSync(join(dir, "final.html"))).toBe(false);
  });
});
