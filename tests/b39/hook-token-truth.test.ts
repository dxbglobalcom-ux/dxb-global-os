// B39 — THE COST BOOK MAY NOT COUNT THE SAME TEXT TWICE.
//
// THE CEO'S ORDER, 2026-08-25, after he was told the figure was wrong:
// "bununla ilgili düzeltme tam olsun kanca manca düzelt bir daha aynı
//  problemler kesinlikle yaşanmasın."
//
// THE DEFECT, measured on this repository's own transcripts before the fix.
// The SessionEnd hook added `cache_read_input_tokens` into `prompt_tokens`
// under the comment "they are real input volume". An agentic session re-reads
// its whole context on every single reply, so that field is the SAME text
// counted once per turn:
//
//   session 34d38ed0 · 495 turns · fresh 3,348,162 · re-read 149,951,115
//                    → the book said 153,299,277 input tokens (97.82% re-reads)
//   session 997755b8 · 657 turns · fresh 2,266,868 · re-read 215,903,634
//                    → the book said 218,170,502 input tokens (98.96% re-reads)
//
// Nothing is thrown away by the fix: the re-reads are recorded beside the fresh
// tokens instead of inside them.
import { describe, expect, it } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sumTranscript } from "../../tools/hooks/src/transcript-usage.js";

/** One assistant turn as Claude Code writes it into a transcript. */
function turn(
  model: string,
  usage: {
    input_tokens?: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
    output_tokens?: number;
  },
): string {
  return JSON.stringify({ type: "assistant", message: { model, usage } });
}

async function transcript(lines: string[]): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "b39-transcript-"));
  const path = join(dir, "session.jsonl");
  await writeFile(path, lines.join("\n") + "\n", "utf8");
  return path;
}

describe("B39 — the SessionEnd hook's token figures are true", () => {
  it("a re-read of the cache is NOT counted as input", async () => {
    // The shape of a real agentic session: a large context written into the
    // cache once, then re-read on every following turn.
    const path = await transcript([
      turn("claude-opus-5", {
        input_tokens: 100,
        cache_creation_input_tokens: 50_000,
        cache_read_input_tokens: 0,
        output_tokens: 900,
      }),
      turn("claude-opus-5", {
        input_tokens: 20,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 50_000,
        output_tokens: 400,
      }),
      turn("claude-opus-5", {
        input_tokens: 30,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 50_000,
        output_tokens: 300,
      }),
    ]);

    const totals = await sumTranscript(path);
    const t = totals.get("claude-opus-5");
    expect(t, "the model's row is missing").toBeTruthy();

    // Before the fix this was 150_150 — the 50,000-token context billed three
    // times over because it was read three times.
    expect(t!.prompt, "cache re-reads leaked back into prompt_tokens").toBe(50_150);
    expect(t!.cacheRead, "the re-reads were lost instead of recorded apart").toBe(100_000);
    expect(t!.completion).toBe(1_600);
    expect(t!.turns, "the denominator of any average is missing").toBe(3);
  });

  it("nothing is lost — fresh plus re-read still equals the raw volume", async () => {
    const path = await transcript([
      turn("claude-opus-5", {
        input_tokens: 7,
        cache_creation_input_tokens: 11,
        cache_read_input_tokens: 13,
        output_tokens: 17,
      }),
    ]);
    const t = (await sumTranscript(path)).get("claude-opus-5")!;
    expect(t.prompt + t.cacheRead).toBe(7 + 11 + 13);
  });

  it("each model is summed on its own", async () => {
    const path = await transcript([
      turn("claude-opus-5", { input_tokens: 10, cache_read_input_tokens: 1_000, output_tokens: 5 }),
      turn("claude-haiku-4-5", { input_tokens: 3, cache_read_input_tokens: 40, output_tokens: 2 }),
    ]);
    const totals = await sumTranscript(path);
    expect(totals.get("claude-opus-5")!.prompt).toBe(10);
    expect(totals.get("claude-opus-5")!.cacheRead).toBe(1_000);
    expect(totals.get("claude-haiku-4-5")!.prompt).toBe(3);
    expect(totals.get("claude-haiku-4-5")!.cacheRead).toBe(40);
  });

  it("a line that is not an assistant turn, or carries no usage, is ignored", async () => {
    const path = await transcript([
      JSON.stringify({ type: "user", message: { content: "selam" } }),
      "not json at all",
      JSON.stringify({ type: "assistant", message: { model: "claude-opus-5" } }),
      turn("claude-opus-5", { input_tokens: 42, output_tokens: 8 }),
    ]);
    const t = (await sumTranscript(path)).get("claude-opus-5")!;
    expect(t.prompt).toBe(42);
    expect(t.turns).toBe(1);
  });
});
