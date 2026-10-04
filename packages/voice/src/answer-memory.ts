// The memory an answer lane hands its agent — ONE definition for chat and voice.
//
// Both lanes used to write `recallMemory(...).catch(() => ({ rows: [] }))`, so a recall that failed
// (a broken note, a refused root, the index unreachable) reached Hamza as an EMPTY memory and he
// answered as if he had no notes (Sol's C on the memory-drawer job, 2026-10-04). A failure is now a
// flag the standing layer says out loud (prompt-core memoryBlock) and one log line in the resident's
// journal; the answer itself still goes out.
import type { Kysely } from "kysely";
import type { DB } from "@dxb/shared";
import { recallMemory } from "@dxb/memory-router";
import type { AnswerLane } from "./prompt-core.js";

export interface AnswerMemory {
  lines: string[];
  unreachable: boolean;
}

export interface AnswerMemoryDeps {
  /** Test seam; production default = recallMemory. */
  recall?: typeof recallMemory;
  log?: (line: string) => void;
}

export async function recallForAnswer(
  db: Kysely<DB>,
  query: string,
  lane: AnswerLane,
  deps: AnswerMemoryDeps = {},
): Promise<AnswerMemory> {
  const recall = deps.recall ?? recallMemory;
  const log = deps.log ?? console.warn;
  try {
    const r = await recall(db, { query, limit: 5 });
    return { lines: r.rows.map((row) => row.body.slice(0, 200)).filter(Boolean), unreachable: false };
  } catch (e) {
    log(`[memory] recall failed on the ${lane} lane — ${(e as Error).message.slice(0, 300)}`);
    return { lines: [], unreachable: true };
  }
}
