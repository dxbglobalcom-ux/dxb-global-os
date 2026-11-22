// The conduct every agent carries comes from ONE shared source — no persona body is in the prompt.
//
// CEO order, 2026-11-22: the employees' persona files go; a worker is a plain agent in a seat. Three
// things reached an agent ONLY through its persona file, so they would have left with it:
//   · §12 "Discipline DNA & Islamic conduct" — constitutional, byte-identical in all 213 files;
//   · the "hands" line of §9 — a seat works only through the tools its session grants;
//   · §13, the character the CEO bound Hamza to — for Hamza alone.
// They now stand in the standing layer (packages/voice/src/prompt-core.ts), and this file pins that
// on every lane a standing prompt is built for.
//
// What each expectation is measured against, none of it computed by the code under test:
//   · §12 — the canonical block of EMPLOYEE_PERSONA_STANDARD.md §4.1, with the HTML comment line
//     dropped and the three substitutions the CEO approved ("this persona" → "this agent");
//   · the hands line — written out here as it reads in the 127 English persona files;
//   · Hamza's character — the SHA-256 of §13 as it stood in personas/ceo/agents-orchestrator.md on
//     2026-11-22 (heading to end of file, the HTML comment dropped, no trailing newline). A hash and
//     not the file, because the file is on its way out and the pin must outlive it.
//
// THE GATE IS THIS TEST. The section is a constant inside the one builder and no parameter switches
// it off, so the builder has nothing to refuse at run time; an absent or altered §12 fails here.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { HAMZA_SLUG, answerLayers, standingPrompt } from "@dxb/voice";
import { voiceLaneLines } from "../../packages/voice/src/answer.js";
import { chatLaneLines } from "../../packages/orchestrator/src/chat-drain.js";
import { composeSeatPrompt } from "../../packages/orchestrator/src/worker-shim.js";

const REPO_ROOT = join(import.meta.dirname, "..", "..");

const APPROVED_SUBSTITUTIONS = [
  ["leaves this persona without a measurement", "leaves this agent without a measurement"],
  ["this persona owns outcomes", "this agent owns outcomes"],
  ["this persona never participates in", "this agent never participates in"],
] as const;

const HANDS_LINE =
  "Hands: this seat works only through the tools its session grants; a surface named below that " +
  "the session does not grant is routed to its owner, never claimed as done.";

const HAMZA_CHARACTER_HEADING = "## 13. The name and the character — Hamza";
const HAMZA_CHARACTER_SHA256 = "c4249d3d92c30a40d93747d74ebd5689a70e4e829b724633326bf60df6da95ff";

/** §12 as the standard holds it, changed only by what the CEO approved. */
async function canonicalSection12(): Promise<string> {
  const standard = await readFile(
    join(REPO_ROOT, "HOLDING-OS-MASTER-PLAN", "EMPLOYEE_PERSONA_STANDARD.md"),
    "utf8",
  );
  const fenced = /```markdown\n(## 12\. Discipline DNA & Islamic conduct\n[\s\S]*?)\n```/.exec(standard);
  if (!fenced) throw new Error("the §4.1 canonical block is not in EMPLOYEE_PERSONA_STANDARD.md");
  let text = fenced[1]
    .split("\n")
    .filter((line) => !/^<!--.*-->$/.test(line))
    .join("\n");
  for (const [from, to] of APPROVED_SUBSTITUTIONS) {
    expect(text.split(from).length - 1, `the canon carries "${from}" once`).toBe(1);
    text = text.replace(from, to);
  }
  return text;
}

type Agent = { slug: string; department: string; role_level: string | null };
const HAMZA: Agent = { slug: HAMZA_SLUG, department: "ceo", role_level: "orchestrator" };
const DIRECTOR: Agent = { slug: "finance-controller", department: "finance", role_level: "director" };

/** Every lane a standing prompt is built for, each through the builder its call site uses. */
const LANES: Record<string, (agent: Agent) => string> = {
  // packages/voice/src/answer.ts defaultAnswer — Hamza, or the director the CEO picked
  voice: (agent) =>
    answerLayers({ agent, memoryLines: [], lang: "tr", lane: "voice" }, voiceLaneLines("tr")).system,
  // packages/orchestrator/src/chat-drain.ts defaultAnswer
  chat: (agent) =>
    answerLayers({ agent, memoryLines: [], lang: "tr", lane: "chat" }, chatLaneLines(false)).system,
  // packages/orchestrator/src/worker-shim.ts defaultExecutor, and the scheduler's workflow seat prompt
  task: (agent) => composeSeatPrompt(agent),
};

const sha256 = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
const count = (haystack: string, needle: string) => haystack.split(needle).length - 1;

describe("the standing conduct reaches every lane from one source", () => {
  it.each(Object.keys(LANES))("%s: §12 whole, the hands line, and no persona body", async (lane) => {
    const section12 = await canonicalSection12();
    expect(section12).not.toContain("persona");
    for (const agent of [HAMZA, DIRECTOR]) {
      const prompt = LANES[lane](agent);
      expect(count(prompt, section12), `${lane}/${agent.slug}: §12`).toBe(1);
      expect(count(prompt, HANDS_LINE), `${lane}/${agent.slug}: hands line`).toBe(1);
      expect(prompt).not.toContain("Your persona");
      expect(prompt).not.toContain("# PERSONA");
      expect(prompt).not.toContain("<!--");
    }
  });

  it.each(Object.keys(LANES))("%s: Hamza's character for Hamza, and for nobody else", (lane) => {
    const character = standingPrompt({ agent: HAMZA, memoryLines: [], lang: "tr", lane: "chat" }).find(
      (block) => block.startsWith(HAMZA_CHARACTER_HEADING),
    );
    expect(character, "Hamza's standing layer carries §13 as one block").toBeDefined();
    expect(sha256(character!)).toBe(HAMZA_CHARACTER_SHA256);

    expect(count(LANES[lane](HAMZA), character!)).toBe(1);
    const other = LANES[lane](DIRECTOR);
    expect(other).not.toContain(HAMZA_CHARACTER_HEADING);
    expect(other).not.toContain("Hamza ibn Abd al-Muttalib");
  });

  it("a persona body handed to a builder reaches no prompt", () => {
    const body = "# PERSONA — smuggled\n\n## 1. Role identity\nSmuggled body.";
    const standing = standingPrompt({
      agent: DIRECTOR, personaBody: body, memoryLines: [], lang: "en", lane: "task",
    } as never);
    expect(standing.join("\n")).not.toContain("muggled");
    const seat = (composeSeatPrompt as (...args: unknown[]) => string)(DIRECTOR, body);
    expect(seat).not.toContain("muggled");
  });

  it("no lane loads a persona body, and the loader is gone", async () => {
    for (const file of [
      "packages/voice/src/answer.ts",
      "packages/voice/src/prompt-core.ts",
      "packages/voice/src/index.ts",
      "packages/orchestrator/src/chat-drain.ts",
      "packages/orchestrator/src/worker-shim.ts",
      "packages/outbox-executor/src/scheduler.ts",
    ]) {
      const src = await readFile(join(REPO_ROOT, file), "utf8");
      expect(src, file).not.toMatch(/loadPersonaBody|personaBody|personaBlock|persona_path/);
    }
    expect(existsSync(join(REPO_ROOT, "packages/voice/src/persona.ts"))).toBe(false);
  });

  it("the scouting brief sends its seat to the section it carries, not to a persona", async () => {
    const src = await readFile(join(REPO_ROOT, "packages/revenue/src/discovery.ts"), "utf8");
    expect(src).not.toMatch(/persona/i);
    expect(src).toContain("conduct section of your standing instructions");
    expect(composeSeatPrompt(DIRECTOR)).toContain("\nIslamic conduct (ruling D5");
  });
});

describe("the gate — §12 cannot be dropped, moved to the turn or altered", () => {
  it("is one whole block of every standing prompt, whatever the agent, lane, language or memory", async () => {
    const section12 = await canonicalSection12();
    for (const agent of [HAMZA, DIRECTOR, { slug: "x" }]) {
      for (const lane of ["voice", "chat", "task"] as const) {
        for (const lang of ["tr", "en"] as const) {
          for (const memory of [
            { memoryLines: [] },
            { memoryLines: ["the board met on Monday"] },
            { memoryLines: [], memoryUnreachable: true },
          ]) {
            const blocks = standingPrompt({ agent, lane, lang, ...memory });
            const where = `${agent.slug}/${lane}/${lang}`;
            expect(blocks.filter((b) => b === section12).length, `${where}: §12`).toBe(1);
            expect(blocks.filter((b) => b === HANDS_LINE).length, `${where}: hands line`).toBe(1);
          }
        }
      }
    }
  });

  it("stands in the cached system layer, never in the part that rides the turn", async () => {
    const section12 = await canonicalSection12();
    const layers = answerLayers(
      { agent: HAMZA, memoryLines: ["the board met on Monday"], lang: "tr", lane: "chat" },
      chatLaneLines(false),
    );
    expect(layers.system).toContain(section12);
    expect(layers.system).toContain(HANDS_LINE);
    expect(layers.system).toContain(HAMZA_CHARACTER_HEADING);
    expect(layers.memory).not.toContain("Discipline DNA");
  });
});
