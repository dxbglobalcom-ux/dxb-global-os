// Persona DELIVERY — the identity an employee is authored with must be the identity his live
// answer lane receives.
//
// The defect this pins, measured 2026-07-27: both answer lanes (voice `answer.ts` and chat
// `chat-drain.ts`) each carried a private `personaHead()` that read **the first 60 lines of the
// persona FILE**. A persona file opens with the 33-row SİCİL dossier table — 48 lines for the
// orchestrator — so the "identity" reaching the live Hamza was the dossier table, §1, and one
// sentence of §2: **2 of 13 sections** (measured on the authored file: delivered = [1,2],
// authored = [1..13]). His working method, decision rules, escalation limits,
// reporting standard, §12 (Discipline DNA & Islamic conduct) and §13 (the character the CEO
// bound him to) never arrived. The persona was authored, quality-gated, versioned, stored — and
// silently not delivered. That is the mechanical cause of the CEO's complaint that "Hamza does
// not know the holding and is confused".
//
// These cases are deliberately about DELIVERY, not about wording: they assert that the whole
// authored body crosses the boundary, that the dossier does not, and that the LAST section
// survives — a truncating loader passes a "contains §1" test and fails this one.

import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadPersonaBody } from "@dxb/voice";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const HAMZA = "personas/ceo/agents-orchestrator.md";

describe("persona delivery to the live answer lanes", () => {
  it("delivers EVERY authored section, not a fixed-line head", async () => {
    const file = await readFile(join(REPO_ROOT, HAMZA), "utf8");
    const authored = [...file.matchAll(/^## (\d+)\./gm)].map((m) => Number(m[1]));
    const delivered = [...(await loadPersonaBody(REPO_ROOT, HAMZA)).matchAll(/^## (\d+)\./gm)].map(
      (m) => Number(m[1]),
    );
    expect(delivered).toEqual(authored);
    // The regression was exactly a truncation, so pin the tail explicitly: the last authored
    // section must survive the crossing.
    expect(delivered.at(-1)).toBe(authored.at(-1));
  });

  it("does NOT ship the SİCİL dossier table as the identity", async () => {
    const body = await loadPersonaBody(REPO_ROOT, HAMZA);
    expect(body.startsWith("# PERSONA — ")).toBe(true);
    expect(body).not.toContain("## SİCİL");
    expect(body).not.toContain("| 1 | Employee ID |");
  });

  it("carries the constitutional and role-specific sections the CEO ordered", async () => {
    const body = await loadPersonaBody(REPO_ROOT, HAMZA);
    // §12 — constitutional, inherited by every persona (G8, CEO rulings D5+D6 2026-07-17)
    expect(body).toContain("## 12. Discipline DNA & Islamic conduct");
    // §13 — the orchestrator's character (CEO ruling 2026-07-27). NOT inherited by others.
    expect(body).toContain("## 13. The name and the character");
    expect(body).toContain("Hamza ibn Abd al-Muttalib");
  });

  it("treats a missing or unwritten persona as empty, never as a crash and never as a table", async () => {
    expect(await loadPersonaBody(REPO_ROOT, null)).toBe("");
    expect(await loadPersonaBody(REPO_ROOT, "personas/does/not-exist.md")).toBe("");
  });
});
