// Persona loading for the live answer lanes (voice + chat), ONE definition.
//
// WHY THIS FILE EXISTS — defect measured 2026-07-27, and it is the direct cause of the CEO's
// complaint that "Hamza does not know the holding, does not know the system, he is confused":
// both lanes had a private copy of a `personaHead()` that read **the first 60 lines of the
// persona FILE**. A persona file opens with the 33-row SİCİL dossier table (48 lines for the
// orchestrator), so those 60 lines were: the dossier, the persona header, §1, and the first
// sentence of §2 — **2 of 13 sections** (measured: the delivered head carried `## 1.` and `## 2.`
// and nothing else). Everything that makes the employee who he is arrived
// nowhere: his working method, his decision rules, his escalation limits, his reporting
// standard, §12 (Discipline DNA & Islamic conduct — constitutional, CEO rulings D5+D6) and
// §13 (the character the CEO bound the orchestrator to). The persona was authored, gated,
// versioned and stored — and then not delivered.
//
// The boundary used here is the SAME one the sync script, the quality gate and the compiler
// already use: the persona is the text from the `# PERSONA — ` header to the end of file. There
// is exactly one definition of "the persona" in this company, and this is it.
//
// Not compiled through `@dxb/hr` compilePersonaPrompt on purpose: that compiler requires a
// `hookStandardText` which has no producer in the runtime today. Inventing one here would be a
// new design decision in the wrong place. The body IS the identity; the hook standard is a
// separate layer that already binds through @dxb/hook. Recorded as a boundary, not skipped.

import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** The `## {n}.` boundary — same section grammar as @dxb/hr template.ts. */
const PERSONA_HEADER = "# PERSONA — ";

/**
 * The employee's full persona body, as authored.
 *
 * @param repoRoot    absolute repo root
 * @param personaPath repo-relative path from `agents.persona_path` (null = no persona on file)
 * @returns the persona body, or "" when there is no persona to read — a missing persona file is
 *          degraded context, never a crash (the answer lane must still speak to the CEO).
 */
export async function loadPersonaBody(
  repoRoot: string,
  personaPath: string | null,
): Promise<string> {
  if (!personaPath) return "";
  try {
    const text = await readFile(join(repoRoot, personaPath), "utf8");
    const start = text.indexOf(PERSONA_HEADER);
    // No header = a skeleton file that was never written ("⏳ FABLE-YAZIMI BEKLİYOR" stock).
    // Sending the dossier table as if it were an identity is what this fix exists to stop, so
    // an unwritten persona yields nothing rather than a table.
    if (start < 0) return "";
    return text.slice(start).trim();
  } catch {
    return "";
  }
}
