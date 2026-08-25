import { createInterface } from "node:readline";
import { createReadStream } from "node:fs";

// The truth about what a Claude Code session actually consumed.
//
// Extracted from tag-subscription-call.ts on 2026-08-25 so that the arithmetic
// can be tested directly: that hook runs its own `main()` at import time and
// can never be imported by a test.
export interface UsageTotals {
  /** Tokens actually SENT as new on the request — fresh input plus cache writes. */
  prompt: number;
  completion: number;
  /**
   * Tokens re-read from the prompt cache. Kept, never added to `prompt`.
   *
   * ⚠ MEASURED 2026-08-25, and this split is the fix. This file used to add
   * cache reads into `prompt_tokens` under the comment "they are real input
   * volume". They are volume, but they are the SAME text counted once per turn:
   * an agentic session re-reads its whole context on every reply. Two real
   * transcripts of this repository, measured line by line:
   *
   *   session 34d38ed0 · 495 turns · fresh 3,348,162 · re-read 149,951,115
   *                    → written as 153,299,277 prompt tokens (97.82% re-reads)
   *   session 997755b8 · 657 turns · fresh 2,266,868 · re-read 215,903,634
   *                    → written as 218,170,502 prompt tokens (98.96% re-reads)
   *
   * A cost book that says one coding session consumed 153 million input tokens
   * is not describing anything that happened. The two figures are recorded
   * apart from each other now: `prompt_tokens` is what was sent, and the
   * re-reads go to `meta.cache_read_tokens` where nothing is lost and nothing
   * is confused with fresh input.
   */
  cacheRead: number;
  /** Assistant turns the figures were summed over — the denominator of any average. */
  turns: number;
}

export async function sumTranscript(path: string): Promise<Map<string, UsageTotals>> {
  const perModel = new Map<string, UsageTotals>();
  const lines = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  for await (const line of lines) {
    let obj: any;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    if (obj?.type !== "assistant") continue;
    const model = obj.message?.model;
    const usage = obj.message?.usage;
    if (!model || !usage) continue;
    const totals = perModel.get(model) ?? { prompt: 0, completion: 0, cacheRead: 0, turns: 0 };
    // What was SENT on this request: the uncached remainder plus what was
    // written into the cache. Both are new text. Cache READS are the same text
    // being re-read and are counted separately — see UsageTotals above.
    totals.prompt += (usage.input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0);
    totals.cacheRead += usage.cache_read_input_tokens ?? 0;
    totals.completion += usage.output_tokens ?? 0;
    totals.turns += 1;
    perModel.set(model, totals);
  }
  return perModel;
}

