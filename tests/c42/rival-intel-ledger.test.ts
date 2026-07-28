// C42 STAGE 1 — the gate that makes a stale tick impossible.
//
// The CEO's complaint of 2026-07-27 was not that work was missing; it was that
// work was DECLARED finished while its row stayed half-done ("bişeyler oldu
// deniyor bitti deniyor ama olmamış işte"). The open work board answered that
// with a rule; this file answers it with a machine.
//
// A ledger row that says `reported` is a CLAIM. Here it must survive:
//   - its report file exists,
//   - it carries all six required sections,
//   - section 2 is a real frame-by-frame record, not a summary.
//
// Read-only: this suite touches no database and no network.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const DIR = join(process.cwd(), ".planning/research/rival-intel");
const LEDGER = join(DIR, "00-LEDGER.md");

// The six sections the CEO's order requires of every report. His words:
// "MİLİMETRİK DEĞERLENDİRME HER KAREDEKİ OLGU … ŞU SKİLLERİ ŞU PLUGİNLERİ ŞU
// TOOLLARI İNDİRİP KURUP YAPARIM YAPILIR PROJESİ OLMALI."
const REQUIRED_SECTIONS = [
  "## 1. Source identity",
  "## 2. Frame-by-frame record",
  "## 3. Capabilities",
  "## 4. What DXB has today",
  "## 5. The build project",
  "## 6. Verdict",
] as const;

// A frame row is a table line opening with a timestamp: | 00:04 | ...
const FRAME_ROW = /^\|\s*\d{1,2}:\d{2}(?:[.:]\d{1,3})?\s*\|/gm;
const MIN_FRAME_ROWS = 8;

type Row = { n: string; kind: string; status: string; report: string };

function ledgerRows(): Row[] {
  const text = readFileSync(LEDGER, "utf8");
  return text
    .split("\n")
    .filter((l) => /^\|\s*\d{2}\s*\|/.test(l))
    .map((l) => {
      const c = l.split("|").map((s) => s.trim());
      // | n | source | kind | status | claimed | report | ceo note |
      // A stray "|" inside a cell would silently shift every column after it —
      // measured on the first run of this gate, where an uploader name carrying
      // a pipe ("Okyanusi | Akın Yılmaz") turned the kind column into a person's
      // name. The row-shape assertions below are what caught it; keep them.
      return { n: c[1], kind: c[3], status: c[4], report: c[6].replace(/`/g, "") };
    });
}

describe("C42 rival-intel ledger", () => {
  it("the ledger exists and every row is well formed", () => {
    expect(existsSync(LEDGER)).toBe(true);
    const rows = ledgerRows();
    expect(rows.length).toBeGreaterThanOrEqual(16);
    for (const r of rows) {
      expect(r.n, `row number on ${JSON.stringify(r)}`).toMatch(/^\d{2}$/);
      expect(["reel", "video", "pdf", "repo"], `kind on row ${r.n}`).toContain(r.kind);
      expect(
        ["pending", "claimed", "fetched", "watched", "reported"],
        `status on row ${r.n}`,
      ).toContain(r.status);
      expect(r.report, `report filename on row ${r.n}`).toMatch(/^\d{2}-[a-z0-9-]+\.md$/);
    }
  });

  it("row numbers are unique and report filenames are unique", () => {
    const rows = ledgerRows();
    expect(new Set(rows.map((r) => r.n)).size).toBe(rows.length);
    expect(new Set(rows.map((r) => r.report)).size).toBe(rows.length);
  });

  // THE GATE. Everything above is hygiene; this is the rule that stops a
  // half-finished row from wearing a finished label.
  it("every 'reported' row has a report carrying all six sections", () => {
    for (const r of ledgerRows().filter((x) => x.status === "reported")) {
      const path = join(DIR, r.report);
      expect(existsSync(path), `row ${r.n} says reported but ${r.report} is not on disk`).toBe(
        true,
      );
      const body = readFileSync(path, "utf8");
      for (const section of REQUIRED_SECTIONS) {
        expect(body, `row ${r.n} report is missing "${section}"`).toContain(section);
      }
    }
  });

  it("a reported reel or video carries a real frame-by-frame record, not a summary", () => {
    for (const r of ledgerRows().filter(
      (x) => x.status === "reported" && (x.kind === "reel" || x.kind === "video"),
    )) {
      const body = readFileSync(join(DIR, r.report), "utf8");
      const frames = body.match(FRAME_ROW)?.length ?? 0;
      expect(
        frames,
        `row ${r.n}: section 2 has ${frames} timestamped rows — a summary, not a frame record`,
      ).toBeGreaterThanOrEqual(MIN_FRAME_ROWS);
    }
  });

  it("a reported row records the fingerprint of what was actually studied", () => {
    for (const r of ledgerRows().filter((x) => x.status === "reported")) {
      const body = readFileSync(join(DIR, r.report), "utf8");
      // sha256 for downloaded media, a commit for a cloned repo — either way the
      // report must name the exact bytes it read, so a later reader can tell
      // whether the source has changed underneath it.
      expect(body, `row ${r.n} report names no sha256 and no commit`).toMatch(
        /\b(?:[a-f0-9]{64}|[a-f0-9]{7,40})\b/i,
      );
    }
  });

  it("the NEXT pointer names a row that is not yet reported", () => {
    const text = readFileSync(LEDGER, "utf8");
    const m = text.match(/^\*\*NEXT:\s*(\d{2}|done)\s*\*\*/m);
    expect(m, "the ledger has no NEXT pointer — a fresh session cannot resume").not.toBeNull();
    const next = m![1];
    const rows = ledgerRows();
    if (next === "done") {
      expect(rows.every((r) => r.status === "reported")).toBe(true);
    } else {
      const row = rows.find((r) => r.n === next);
      expect(row, `NEXT points at row ${next}, which does not exist`).toBeDefined();
      expect(row!.status, `NEXT points at row ${next}, already reported`).not.toBe("reported");
    }
  });

  it("no orphan reports — a report on disk belongs to a ledger row", () => {
    if (!existsSync(DIR)) return;
    // `00-` is the ledger's own prefix (00-LEDGER, 00-SYNTHESIS) — those belong
    // to the stage, not to a source row.
    const reports = readdirSync(DIR).filter(
      (f) => /^\d{2}-.*\.md$/.test(f) && !f.startsWith("00-"),
    );
    const known = new Set(ledgerRows().map((r) => r.report));
    for (const f of reports) {
      expect(known.has(f), `${f} is on disk but no ledger row claims it`).toBe(true);
    }
  });
});
