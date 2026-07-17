// voice.drain — the scheduler vehicle for the answer half. Two constitutional
// facts force this shape (VOICE_INTERACTION_SPEC §6 implementation note):
// the dashboard cannot host the answer leg (PHASE-08 LOCKED, no LLM surface
// in the projection client) and a Postgres fn cannot reach pg-boss (E9.1 A1
// precedent) — so parked 'routing' rows drain on a 5s self-chain, exactly
// the intent-intake idiom. One answer per drain: the leg holds an LLM call
// for its whole duration (measured ~90s on X230), cadence provides throughput.
import { readdir, stat, unlink } from "node:fs/promises";
import { join } from "node:path";
import { sql, type Kysely } from "kysely";
import type { DB } from "@dxb/shared";
import { answerVoiceCall, type VoiceAnswerDeps } from "./answer.js";
import { logCall } from "./log.js";
import type { TimelineEntry } from "./machine.js";

/** Calls stuck before 'ended' longer than this are swept to failed —
 *  honest timeout, never a silent zombie (spec §17/§27). */
export const STALE_CALL_MINUTES = 10;
/** Synthetic answer WAVs are transient playback copies, not records —
 *  the record is voice_calls (transcript + timings). */
export const AUDIO_RETENTION_HOURS = 24;

export interface DrainVoiceDeps {
  db: Kysely<DB>;
  audioDir?: string | null;
  /** test seams forwarded to answerVoiceCall (tts/answer/speaches/repoRoot) */
  answerDeps?: Omit<VoiceAnswerDeps, "db" | "audioDir">;
}

export interface DrainVoiceResult {
  answered: number;
  sweptStale: number;
  prunedAudio: number;
}

export async function drainVoiceCalls(deps: DrainVoiceDeps): Promise<DrainVoiceResult> {
  const db = deps.db;
  const result: DrainVoiceResult = { answered: 0, sweptStale: 0, prunedAudio: 0 };

  // 1. Stale sweep: anything not terminal past the window fails honestly.
  const stale = await sql<{ id: string; timeline: unknown }>`
    SELECT id, timeline FROM voice_calls
    WHERE status NOT IN ('ended','failed')
      AND started_at < now() - make_interval(mins => ${STALE_CALL_MINUTES})
  `.execute(db);
  for (const row of stale.rows) {
    const timeline = (Array.isArray(row.timeline) ? row.timeline : []) as TimelineEntry[];
    timeline.push({ state: "failed", at: new Date().toISOString(), reason: "stale_timeout" });
    await logCall(db, { id: row.id, status: "failed", timeline });
    result.sweptStale += 1;
  }

  // 2. Answer the oldest parked call (claim guard lives in answerVoiceCall).
  const next = await db
    .selectFrom("voice_calls")
    .select("id")
    .where("status", "=", "routing")
    .orderBy("started_at", "asc")
    .limit(1)
    .executeTakeFirst();
  if (next) {
    const answered = await answerVoiceCall(
      { db, audioDir: deps.audioDir ?? null, ...(deps.answerDeps ?? {}) },
      { callId: next.id },
    );
    if (!answered.skipped) result.answered += 1;
  }

  // 3. Audio retention: prune handoff WAVs past the window (best effort).
  if (deps.audioDir) {
    try {
      const cutoff = Date.now() - AUDIO_RETENTION_HOURS * 3600_000;
      for (const name of await readdir(deps.audioDir)) {
        if (!name.endsWith(".wav")) continue;
        const path = join(deps.audioDir, name);
        try {
          const info = await stat(path);
          if (info.mtimeMs < cutoff) {
            await unlink(path);
            result.prunedAudio += 1;
          }
        } catch {
          // raced with another sweep or an in-flight write — skip
        }
      }
    } catch {
      // dir absent until the first answered call — nothing to prune
    }
  }

  return result;
}
