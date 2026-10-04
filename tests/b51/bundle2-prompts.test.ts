// B51 move 5, code bundle 2 (CEO 2026-10-04: "gerekeni yap") — the runtime prompt rows of the
// prompt audit (.planning/quick/20260923-prompt-audit/slices/c-personas-108-213-code.md PART 2).
// Each test pins one row: the old text is gone and the replacement carries its reason.
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { routeEffort, loadPersonaBody } from "../../packages/voice/src/index.js";
import { voiceLaneLines } from "../../packages/voice/src/answer.js";
import { chatLaneLines } from "../../packages/orchestrator/src/chat-drain.js";
import { draftPrompt } from "../../packages/orchestrator/src/decompose.js";
import { MAX_HOP_DEPTH } from "../../packages/orchestrator/src/decompose.js";
import { composeSeatPrompt } from "../../packages/orchestrator/src/worker-shim.js";
import { classifyPrompt, classifiedIntentFor } from "../../packages/kernel/src/classify.js";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const CI = {
  intent_summary: "Prepare a market note.",
  task_class: "research",
  departments: ["strategy"],
  approval_class: "none",
  complexity: "multi",
} as const;

describe("C2-2 — the routing row's effort reaches chat and voice", () => {
  it("passes xhigh through instead of silently running at low", () => {
    expect(routeEffort("xhigh")).toBe("xhigh");
    for (const e of ["low", "medium", "high", "max"] as const) expect(routeEffort(e)).toBe(e);
  });
  it("keeps the old fallback for a value the SDK cannot parse", () => {
    expect(routeEffort("bogus")).toBe("low");
    expect(routeEffort(null)).toBe("low");
    expect(routeEffort(undefined)).toBe("low");
  });
  it("both lanes use the one guard — no hand-written effort list is left", async () => {
    for (const f of ["packages/orchestrator/src/chat-drain.ts", "packages/voice/src/answer.ts"]) {
      const src = await readFile(join(REPO_ROOT, f), "utf8");
      expect(src).not.toContain('["low", "medium", "high", "max"]');
      expect(src).toContain("routeEffort(r.effort)");
    }
  });
});

describe("C2-5 — the planner's chain cap is his hop order", () => {
  it("says the same number as MAX_HOP_DEPTH", () => {
    const p = draftPrompt(CI as never, ["research"], ["strategy"]);
    expect(MAX_HOP_DEPTH).toBe(5);
    expect(p).toContain(`up to ${MAX_HOP_DEPTH} only when the work truly needs it`);
    expect(p).not.toContain("<= 3 envelopes");
  });
});

describe("C2-6/7 — chat: the format need with its reason, no sentence quota, no capitals", () => {
  it("normal mode", () => {
    const t = chatLaneLines(false).join("\n");
    expect(t).not.toContain("No markdown headers");
    expect(t).not.toContain("under 8 sentences");
    expect(t).toContain("does not render markdown");
    expect(t).toContain("Answer at the length the question needs.");
  });
  it("plan mode", () => {
    const t = chatLaneLines(true).join("\n");
    expect(t).not.toContain("PLAN MODE is ON");
    expect(t).not.toContain("DO NOT start");
    expect(t).toContain("Plan mode is on");
    expect(t).toContain("Work starts only when he dispatches it himself.");
  });
});

describe("C2-8 — voice: the TTS reason, no fixed sentence count", () => {
  it.each(["tr", "en"] as const)("%s", (lang) => {
    const t = voiceLaneLines(lang).join("\n");
    expect(t).not.toContain("2-4 short spoken sentences");
    expect(t).toContain("only what the question needs");
    expect(t).toContain("read aloud by text-to-speech");
    expect(t).toContain("no markdown or list symbols");
    // the TOPIC contract the transcript header parses (answer.ts) is kept word for word
    expect(t).toContain('First line of your output MUST be exactly "TOPIC:');
  });
});

describe("C2-10 — no JSON-forcing prose beside the json_schema the SDK already sends", () => {
  it("classify", () => {
    const p = classifyPrompt("hello", ["research"], ["strategy"]);
    expect(p).not.toContain("Output JSON ONLY");
    expect(p).toContain("matching the given schema");
  });
  it("decompose", () => {
    expect(draftPrompt(CI as never, ["research"], ["strategy"])).not.toContain("Output JSON ONLY");
  });
});

describe("C2-11 — the task lane does not tell a tool-less seat to call a tool, nor grade it", () => {
  it("seat standing prompt", () => {
    const p = composeSeatPrompt({ slug: "x", department: "y" }, "");
    expect(p).toContain("ONE task from the company's queue");
    expect(p).not.toContain("verify with a real tool call");
    expect(p).not.toContain("judged empty");
    expect(p).toContain("never claim a check you did not run");
  });
  it("the worker's file-ref line states the requirement, not the grader", async () => {
    const src = await readFile(join(REPO_ROOT, "packages/orchestrator/src/worker-shim.ts"), "utf8");
    expect(src).not.toContain("rejected by the gate");
    expect(src).toContain("the file entry carries that ref exactly");
  });
});

describe("R14 — a persona file's HTML comments never reach the model", () => {
  it("strips single- and multi-line comments, keeps the text around them", async () => {
    const root = await mkdtemp(join(tmpdir(), "r14-"));
    await mkdir(join(root, "personas", "x"), { recursive: true });
    await writeFile(
      join(root, "personas", "x", "p.md"),
      "<!-- head -->\n## SİCİL\n| 1 | Employee ID |\n\n" +
        "<!-- v1 · fable-5 · 2026-07-11 -->\n# PERSONA — X\n\n## 1. Role\nKeeps this.\n" +
        "<!-- Constitutional section —\n   two lines -->\n## 12. Discipline DNA\nAnd this.\n",
    );
    const body = await loadPersonaBody(root, "personas/x/p.md");
    expect(body).not.toContain("<!--");
    expect(body).not.toContain("fable-5");
    expect(body).not.toContain("two lines");
    expect(body.startsWith("# PERSONA — X")).toBe(true);
    expect(body).toContain("Keeps this.");
    expect(body).toContain("## 12. Discipline DNA\nAnd this.");
  });
  it("the live Hamza persona carries no comment", async () => {
    const body = await loadPersonaBody(REPO_ROOT, "personas/ceo/agents-orchestrator.md");
    expect(body).not.toContain("<!--");
  });
});

describe("C2-10 (Sol's single pass) — task_class is narrowed to the live routing classes per call", () => {
  const base = {
    intent_summary: "x",
    departments: ["strategy"],
    approval_class: "none",
    complexity: "single",
  };
  it("the per-call schema refuses a class no routing row serves, accepts a live one", () => {
    const s = classifiedIntentFor(["research", "research.synthesis"]);
    expect(s.safeParse({ ...base, task_class: "bogus" }).success).toBe(false);
    expect(s.safeParse({ ...base, task_class: "research.synthesis" }).success).toBe(true);
  });
  it("an empty class list leaves the contract unnarrowed (no z.enum of nothing)", () => {
    expect(classifiedIntentFor([]).safeParse({ ...base, task_class: "anything" }).success).toBe(true);
  });
  it("classify sends AND validates with that per-call schema", async () => {
    const src = await readFile(join(REPO_ROOT, "packages/kernel/src/classify.ts"), "utf8");
    expect(src).toContain("const schema = classifiedIntentFor(taskClasses);");
    expect(src).toContain('outputFormat: { type: "json_schema", schema: sdkJsonSchema(schema) }');
    expect(src).toContain("const parsed = schema.safeParse(raw);");
  });
});
