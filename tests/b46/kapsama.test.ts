// B56 — THE COVERAGE RULER PRINTS WHERE WAS LOOKED, AND IT NEVER BLOCKS THE PAGE.
//
// WHY. The answer the CEO rejected on 2026-09-24 stood on a ground that had found 294 X addresses;
// the hunters opened one and the answer cited none, and not one line said so before he read it.
// scripts/kapsama.py prints that per platform — Bulundu · Okundu · Cevapta · Okunmadı / kapalı kapı —
// under every answer (render.py appends it) and before the answer is written (fleet.sh prints it).
// A ruler that stopped the page when its numbers were bad would take the page away from him, so it
// prints and exits 0 whatever it measures; only a run folder that does not exist is an error.
//
// The fixture runs are cut from that rejected run: run-coverage holds four rows of its evidence
// (three Reddit threads — one of them made a closed door here — and one web page; no X row at all),
// an answer citing two of them, and two of its ground's real channel outcomes: linux-do refused with
// AUTH_REQUIRED (exit 77) and linkedin answered four empty bytes. run-legacy holds seven entries of
// its sources.json, two tool calls from its hunters' transcripts (plus one constructed Bash call that
// names an X address without a reader) and the first source line of its final.md.

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SKILL } from "./engine-copy.js";

const FIX = join(dirname(resolve(import.meta.filename)), "fixtures", "evidence");
const KAPSAMA = join(SKILL, "scripts", "kapsama.py");

function kapsama(args: string[]): { out: string; code: number } {
  try {
    const out = execFileSync("python3", [KAPSAMA, ...args], {
      encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" }, stdio: ["ignore", "pipe", "pipe"],
    });
    return { out, code: 0 };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return { out: String(err.stdout ?? "") + String(err.stderr ?? ""), code: err.status ?? 1 };
  }
}
const row = (out: string, label: string) => out.split("\n").find((l) => l.startsWith(`| ${label} |`)) ?? "";

describe("kapsama.py — prints, never blocks", () => {
  it("a run with zero X rows: the table is printed and the exit is 0", () => {
    const run = join(FIX, "run-coverage");
    const r = kapsama([run, "--answer", join(run, "answer.md")]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toMatch(/^\| Platform \| Bulundu \| Okundu \| Cevapta \| Okunmadı \/ kapalı kapı \|$/m);
    expect(row(r.out, "X")).toBe("");                                   // no X address, no X row
    expect(row(r.out, "Reddit")).toBe("| Reddit | 3 | 2 | 1 | kapı kapalı: opencli reddit read kod 1 ×1 |");
    expect(row(r.out, "Web (diğer)")).toBe("| Web (diğer) | 1 | 0 | 1 | denenmedi ×1 |");
  });

  it("a search door that failed stands in the table even with no address behind it", () => {
    const r = kapsama([join(FIX, "run-coverage"), "--format", "tsv"]);
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/^platform\tbulundu\tokundu\tcevapta\tokunmadi$/m);
    expect(r.out).toMatch(/^chinese\t0\t0\t-\tkapı kapalı: arama linux-do kod 77 — AUTH_REQUIRED: linux\.do requires an active signed-in browser session ×1$/m);
    expect(r.out).toMatch(/^linkedin\t0\t0\t-\tarama boş: linkedin ×1$/m);
  });

  it("counts a citation only in its one shape; a bracket that merely looks like one is named, not counted", () => {
    const dir = mkdtempSync(join(tmpdir(), "dxb-b56-kapsama-"));
    const answer = join(dir, "answer.md");
    writeFileSync(answer, "Bir [L0001]. İki [bkz. L0002]. Üç [L0001 ]. Dört [l0003]. Beş [L0001, L0002].\n");
    const r = kapsama([join(FIX, "run-coverage"), "--answer", answer]);
    rmSync(dir, { recursive: true, force: true });
    expect(r.code, r.out).toBe(0);
    expect(row(r.out, "Reddit")).toBe("| Reddit | 3 | 2 | 2 | kapı kapalı: opencli reddit read kod 1 ×1 |");
    expect(row(r.out, "Web (diğer)")).toBe("| Web (diğer) | 1 | 0 | 0 | denenmedi ×1 |");
    for (const bad of ["[bkz. L0002]", "[L0001 ]", "[l0003]"]) expect(r.out).toContain(`biçimsiz atıf: ${bad} ×1`);
    expect(r.out).not.toContain("biçimsiz atıf: [L0001]");
    expect(r.out).not.toContain("biçimsiz atıf: [L0001, L0002]");
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
