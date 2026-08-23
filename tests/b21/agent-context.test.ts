// Board row B21 — the standing instruction layer an agent carries is defined ONCE.
//
// What this pins, measured 2026-07-30 before the change. The two live answer lanes each wrote
// their own version of the same six standing instructions, and they had ALREADY drifted:
//
//   voice `answer.ts`   "You are Hamza … When the CEO calls, HE IS TALKING TO YOU, Hamza —
//                        never claim to be someone else or say Hamza is unavailable."
//   chat  `chat-drain`  "You are Hamza, the orchestrator of DXB Global." (no such clause)
//
// So the same person answered with a different self-understanding depending on which door the CEO
// knocked on — the inside cause of his complaint that Hamza is inconsistent across chat, voice and
// system control. The orchestrator's slug was declared in THREE places for the same reason.
//
// And the rule he gave on 2026-07-28 — speak to the CEO in his language, never in yours — bound
// the session author from that day and had never been carried into the runtime at all, so Hamza
// himself was under no such obligation.
//
// These cases are about the CONTRACT, not about wording: one definition, delivered to both lanes,
// carrying the laws that must never depend on which lane is speaking.

import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  HAMZA_SLUG,
  standingPrompt,
  identityLine,
  ceoLanguageLaw,
  honestyLine,
  approvalGateLine,
} from "@dxb/voice";

const REPO_ROOT = join(import.meta.dirname, "..", "..");

const hamza = { slug: HAMZA_SLUG, department: "ceo", role_level: "orchestrator" };
const base = {
  agent: hamza,
  personaBody: "# PERSONA — Hamza\n\n## 1. Role\nOrchestrator.",
  memoryLines: ["the holding has no revenue yet"],
  lang: "tr" as const,
};

describe("B21 — one standing context, both lanes", () => {
  it("gives voice and chat the IDENTICAL identity, persona, memory and law blocks", () => {
    const voice = standingPrompt({ ...base, lane: "voice" });
    const chat = standingPrompt({ ...base, lane: "chat" });
    const voiceGate = approvalGateLine("voice");
    const chatGate = approvalGateLine("chat");
    // Everything except the approval-gate line (the one legitimate lane difference) is identical.
    //
    // This used to compare `slice(0, -1)` — it assumed the approval-gate line was LAST. On
    // 2026-08-21 01:11 the no-refusal law was appended after it (de149a53), and the assumption
    // broke: the case then compared the gate line against the law line and failed. Measured
    // 2026-08-23 — the battery had been green because the compiled package was older than that
    // source change. The contract was never about position: it is that the two lanes differ in
    // the approval-gate line and in nothing else. Identity, not index.
    // Exactly ONE occurrence is removed, not every match. An audit caught the
    // filter version on 2026-08-23: `filter` would erase a DUPLICATED line from
    // both sides and the case would never see that a lane had gained a repeat.
    const dropOne = (lines: readonly string[], line: string): string[] => {
      const i = lines.indexOf(line);
      expect(i, "the approval-gate line is missing from this lane").toBeGreaterThanOrEqual(0);
      return [...lines.slice(0, i), ...lines.slice(i + 1)];
    };
    expect(dropOne(voice, voiceGate)).toEqual(dropOne(chat, chatGate));
    // and it appears once, not twice
    expect(voice.filter((l) => l === voiceGate).length).toBe(1);
    expect(chat.filter((l) => l === chatGate).length).toBe(1);
    expect(voiceGate).not.toEqual(chatGate);
    expect(voice).toContain(voiceGate);
    expect(chat).toContain(chatGate);
    expect(voiceGate).toContain("never grant one");
    expect(chatGate).toContain("approval gate");
  });

  it("carries the anti-impersonation clause on BOTH lanes, not only voice", () => {
    for (const lane of ["voice", "chat"] as const) {
      const text = standingPrompt({ ...base, lane }).join("\n");
      expect(text).toContain("HE IS TALKING TO YOU, Hamza");
      expect(text).toContain("never say Hamza is unavailable");
    }
  });

  it("names a non-orchestrator employee by his own role and department", () => {
    const line = identityLine({ slug: "finance-controller", department: "finance", role_level: "specialist" });
    expect(line).toContain("finance-controller");
    expect(line).toContain("finance");
    expect(line).not.toContain("Hamza");
  });

  it("delivers the CEO language law to the agent, in both lanes", () => {
    for (const lane of ["voice", "chat"] as const) {
      const text = standingPrompt({ ...base, lane }).join("\n");
      expect(text).toContain("is not a developer");
      // The classes of vocabulary the CEO banned on 2026-07-28.
      for (const banned of ["migration", "schema", "endpoint", "commit", "suite"]) {
        expect(text).toContain(banned);
      }
    }
  });

  it("adds the Turkish clause only when the answer is Turkish", () => {
    expect(ceoLanguageLaw("tr")).toContain("Türkçe karşılığı olan yerde İngilizce kelime kullanma");
    expect(ceoLanguageLaw("en")).not.toContain("Türkçe");
  });

  it("forbids inventing or recalling a number", () => {
    const line = honestyLine();
    expect(line).toContain("never estimate");
    expect(line).toContain("never recall a figure");
    // C58: an unusable question must not be answered with a polite guess.
    expect(line).toContain("polite guess");
  });

  it("makes both lanes say an outward act stops at the CEO", () => {
    for (const lane of ["voice", "chat"] as const) {
      expect(approvalGateLine(lane)).toContain("stops at the CEO's approval");
    }
  });

  it("emits no empty block for an agent with no persona and no matched memory", () => {
    const blocks = standingPrompt({ ...base, personaBody: "", memoryLines: [], lane: "chat" });
    expect(blocks.every((b) => b.trim().length > 0)).toBe(true);
    expect(blocks.join("\n")).not.toContain("Your persona");
    expect(blocks.join("\n")).not.toContain("Relevant company memory");
  });

  it("declares the orchestrator slug exactly ONCE in the source tree", async () => {
    const files = [
      "packages/voice/src/prompt-core.ts",
      "packages/voice/src/answer.ts",
      "packages/orchestrator/src/chat-drain.ts",
    ];
    let declarations = 0;
    for (const rel of files) {
      const src = await readFile(join(REPO_ROOT, rel), "utf8");
      // A declaration binds the literal; a re-export or an alias does not.
      declarations += [...src.matchAll(/=\s*"agents-orchestrator"/g)].length;
    }
    expect(declarations).toBe(1);
  });
});
