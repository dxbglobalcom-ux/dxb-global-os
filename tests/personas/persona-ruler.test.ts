// THE PERSONA RULER, as a case in the battery — the same metre scripts/persona-ruler.sh runs.
//
// The defect this pins, measured 2026-09-15: a persona's writing was measured with two different
// rulers on the same day. The builder counted a sentence per LINE and reported 118 → 0 sentences
// over 80 words; the checker counted from full stop to full stop and found 116 still over. Both
// numbers were honestly produced and only one of them was a sentence count. From now on the metre
// is code, it is handed over before the work, and both sides run it.
//
// It measures ONLY the seats named in persona-ruler.concepts.json. A persona outside that contract
// is NOT-MEASURED — the ruler was built for the studio's sixteen seats and does not stand in front
// of a department whose own writing pass has not been ordered.

import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { RULER, RULES, formatReport, runRuler, type Contract, type RuleName } from "./persona-ruler.js";

const report = runRuler();
const measured = report.files.filter((f) => f.measured);

/** the failures of one seat, as the lines a session must act on */
function lines(slug: string): string[] {
  const f = measured.find((x) => x.slug === slug);
  if (!f) return [`no such seat measured: ${slug}`];
  const out: string[] = [];
  for (const r of RULES) for (const fail of f.failures[r]) out.push(`${r} · ${f.path}:${fail.line} — ${fail.detail}`);
  return out;
}

describe("the persona ruler — the studio's sixteen seats", () => {
  it("prints its table, passing or failing (the evidence both sides paste)", () => {
    console.log(`\n${formatReport(report)}\n`);
    expect(measured.length).toBe(16);
  });

  for (const f of measured) {
    it(`${f.slug} obeys every rule of the ruler`, () => {
      expect(lines(f.slug)).toEqual([]);
    });
  }
});

// ── the ruler must BITE: a metre nobody has seen fail is not a metre (the detector is validated
// before it is trusted — the lesson of the three different counts).

function seat(body: string): { root: string; contract: Contract } {
  const root = mkdtempSync(join(tmpdir(), "dxb-ruler-"));
  const path = "personas/test/seat-under-test.md";
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(
    join(root, path),
    [
      "| 31 | Version history | v1 (2026-09-15) |",
      "| 33 | Last updated | 2026-09-15 |",
      "",
      "# PERSONA — Seat Under Test",
      "",
      "## 1. Role identity",
      body,
      "",
      "## 12. Discipline DNA & Islamic conduct",
      "The constitutional section.",
      "",
    ].join("\n"),
    "utf8",
  );
  return {
    root,
    contract: {
      departments: {
        "test-dept": {
          seats: { "seat-under-test": path },
          concepts: [{ id: "one-take", why: "the road rule", pattern: "one take when it suffices", seats: ["seat-under-test"] }],
        },
      },
    },
  };
}

function biteOn(body: string): Record<RuleName, number> {
  const { root, contract } = seat(body);
  const r = runRuler({ repoRoot: root, contract });
  const counts = {} as Record<RuleName, number>;
  for (const rule of RULES) counts[rule] = r.files[0]!.failures[rule].length;
  return counts;
}

const PASSING = "One take when it suffices, and the join is the engine's own frame.";

describe("the ruler bites", () => {
  it("passes a body that obeys it", () => {
    const counts = biteOn(PASSING);
    expect(Object.entries(counts).filter(([, n]) => n > 0)).toEqual([]);
  });

  it("counts a sentence from full stop to full stop, not line by line", () => {
    const long = `${PASSING} ${Array.from({ length: RULER.MAX_SENTENCE_WORDS + 1 }, () => "word").join(" ")}.`;
    expect(biteOn(long)["sentence-length"]).toBe(1);
    // …and the W6b move — the same words with a line break at "; " — is still ONE sentence.
    const broken = long.replace(/ /, ";\n");
    expect(biteOn(broken)["sentence-length"]).toBe(1);
  });

  it("catches a line that stops in the middle of a sentence", () => {
    expect(biteOn(`${PASSING}\nA clause that ends nowhere;`)["line-terminator"]).toBe(1);
  });

  it("catches a parenthesis inside a parenthesis, and an unclosed one", () => {
    expect(biteOn(`${PASSING} A line (with a nest (inside it)).`)["paren-depth"]).toBe(1);
    expect(biteOn(`${PASSING} A line (that never closes.`)["paren-balance"]).toBe(1);
  });

  it("catches the same clause said twice", () => {
    const clause = "the join is always the shooting engine's own last frame and never a drawn one";
    expect(biteOn(`${PASSING} ${clause}. And then, again: ${clause}.`)["no-duplicate-clause"]).toBe(1);
  });

  it("catches a recorded voice that is not inside a prohibition, and lets the prohibition stand", () => {
    expect(biteOn(`${PASSING} The narration is laid over the cut.`)["voice-residue"]).toBe(1);
    expect(biteOn(`${PASSING} A narration track is never laid over the cut.`)["voice-residue"]).toBe(0);
  });

  it("catches the two written roads named without the engine-born road", () => {
    expect(biteOn(`${PASSING} A presenter enters as a real photograph or as a written sheet.`)["three-roads"]).toBe(1);
    expect(
      biteOn(`${PASSING} A presenter enters as a real photograph, as an engine-born casting take, or as a written sheet.`)["three-roads"],
    ).toBe(0);
  });

  it("catches a model name in a delivered body", () => {
    expect(biteOn(`${PASSING} The seat runs on Opus 5.`)["no-model-name"]).toBe(1);
  });

  it("catches a concept that the writing pass lost", () => {
    expect(biteOn("The join is the engine's own frame.")["concept-contract"]).toBe(1);
  });
});
