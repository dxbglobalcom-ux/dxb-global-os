// R3.1 verification — voice v1 call line (VOICE_INTERACTION_SPEC §20).
//   1. state machine legality (unit)
//   2. V1 voice-identity law on the live control seam (specialist REJECTED,
//      director accepted) — the law is DB-enforced, not client-side
//   3. real Speaches roundtrip: Piper TR synth → faster-whisper transcript
//   4. service e2e on the real DB + real Speaches (answer leg stubbed
//      deterministic): ended state, timings, transcript lineage, cost 0
//   5. empty transcript → honest failed state (spec §17 — no guessed text)
//   6. missing voice identity → Piper fallback + degraded=true (answer never
//      dropped for voice-supply reasons)
//   7. line-busy law (§10): an active call younger than the window rejects
//      the second dial with an honest failed row
//   8. worker path: intake parks 'routing' → drainVoiceCalls answers it and
//      writes the handoff WAV (the production scheduler chain in miniature)
// Suite deletes ONLY what it creates (E9.3 rule).
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import {
  assertTransition,
  drainVoiceCalls,
  intakeVoiceCall,
  runVoiceCall,
  sttTranscribe,
  ttsSpeak,
} from "../../packages/voice/src/index.js";

process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const db = () => getDb();
const createdCallIds: string[] = [];
const createdIntentTexts: string[] = [];

afterAll(async () => {
  for (const id of createdCallIds) {
    await db().deleteFrom("voice_calls").where("id", "=", id).execute();
  }
  for (const text of createdIntentTexts) {
    await db().deleteFrom("intents").where("text", "=", text).where("source", "=", "voice").execute();
  }
  await db()
    .deleteFrom("voice_identities")
    .where("agent_id", "in", db().selectFrom("agents").select("id").where("slug", "=", "cfo"))
    .execute();
  await closeDb();
});

describe("R3.1 — state machine (spec §10)", () => {
  it("accepts the legal happy chain", () => {
    const chain = ["idle", "listening", "transcribing", "routing", "answering", "speaking", "ended"] as const;
    for (let i = 0; i < chain.length - 1; i++) {
      expect(() => assertTransition(chain[i], chain[i + 1])).not.toThrow();
    }
  });
  it("rejects illegal jumps and terminal exits", () => {
    expect(() => assertTransition("idle", "answering")).toThrow(/illegal transition/);
    expect(() => assertTransition("ended", "listening")).toThrow(/illegal transition/);
    expect(() => assertTransition("failed", "routing")).toThrow(/illegal transition/);
  });
});

describe("R3.1 — V1 voice-identity law (live control seam)", () => {
  it("rejects a specialist agent", async () => {
    const res = await sql<{ r: unknown }>`
      SELECT control_voice_identity_upsert('ai-engineer', 'speaches:piper', 'tr_TR-fahrettin-medium', 'tr') AS r
    `.execute(db());
    expect((res.rows[0].r as { error?: string }).error).toBe("VOICE_IDENTITY_LAW");
  });
  it("accepts a department director and retires cleanly", async () => {
    const up = await sql<{ r: unknown }>`
      SELECT control_voice_identity_upsert('cfo', 'speaches:piper', 'tr_TR-fahrettin-medium', 'tr') AS r
    `.execute(db());
    expect((up.rows[0].r as { ok?: boolean }).ok).toBe(true);
    const ret = await sql<{ r: unknown }>`
      SELECT control_voice_identity_retire('cfo') AS r
    `.execute(db());
    expect((ret.rows[0].r as { ok?: boolean }).ok).toBe(true);
  });
});

describe("R3.1 — real Speaches roundtrip", () => {
  it("Piper TR synth → whisper transcript preserves the question intent", async () => {
    const wav = await ttsSpeak("Finans direktörüne sorum var: bütçe durumu nedir?");
    expect(wav.subarray(0, 4).toString("ascii")).toBe("RIFF");
    const text = await sttTranscribe(wav, { lang: "tr" });
    expect(text.toLowerCase()).toContain("direktör");
  }, 120_000);
});

describe("R3.1 — service e2e (real DB + Speaches, deterministic answer)", () => {
  it("full call reaches ended with timings, lineage and cost 0", async () => {
    const question = "R31 probe: şirketin görevi nedir?";
    createdIntentTexts.push(question);
    const wav = await ttsSpeak(question);
    const result = await runVoiceCall(
      {
        db: db(),
        answer: async (q) => `R31 deterministic answer as ${q.agent.slug}`,
        repoRoot: process.cwd(),
      },
      { audio: wav, lang: "tr", targetSlug: "agents-orchestrator" },
    );
    createdCallIds.push(result.callId);
    if (result.transcript) createdIntentTexts.push(result.transcript.slice(0, 500));

    expect(result.state).toBe("ended");
    expect(result.failure).toBeNull();
    expect(result.transcript.length).toBeGreaterThan(5);
    expect(result.intentId).toBeTruthy();
    expect(result.targetSlug).toBe("agents-orchestrator");
    expect(result.answerAudio?.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(result.degraded).toBe(false); // Hamza fallback identity is seeded

    const row = await db()
      .selectFrom("voice_calls")
      .selectAll()
      .where("id", "=", result.callId)
      .executeTakeFirstOrThrow();
    expect(row.status).toBe("ended");
    expect(row.stt_ms).toBeGreaterThan(0);
    expect(row.tts_ms).toBeGreaterThan(0);
    expect(Number(row.cost_eur)).toBe(0);
    const transcript = row.transcript as Array<{ role: string; intent_id?: string }>;
    expect(transcript).toHaveLength(2);
    expect(transcript[0].role).toBe("ceo");
    expect(transcript[0].intent_id).toBe(result.intentId);
  }, 180_000);

  it("empty transcript fails honestly (no guessed text)", async () => {
    const result = await runVoiceCall(
      {
        db: db(),
        stt: async () => "",
        answer: async () => "never reached",
      },
      { audio: Buffer.from("not-audio"), lang: "tr" },
    );
    createdCallIds.push(result.callId);
    expect(result.state).toBe("failed");
    expect(result.failure).toBe("empty_transcript");
    const row = await db()
      .selectFrom("voice_calls")
      .select("status")
      .where("id", "=", result.callId)
      .executeTakeFirstOrThrow();
    expect(row.status).toBe("failed");
  });

  it("line busy: a live call younger than the window rejects the second dial (§10)", async () => {
    // Park an artificial active call through the ONLY write seam …
    const blocker = crypto.randomUUID();
    createdCallIds.push(blocker);
    await sql`
      SELECT control_voice_call_log(${JSON.stringify({ id: blocker, status: "listening" })}::jsonb)
    `.execute(db());
    // … then dial again: intake must refuse before touching STT.
    const second = await intakeVoiceCall(
      { db: db(), stt: async () => "never reached" },
      { audio: Buffer.from("x"), lang: "tr" },
    );
    createdCallIds.push(second.callId);
    expect(second.busy).toBe(true);
    expect(second.state).toBe("failed");
    expect(second.failure).toBe("line_busy");
    const row = await db()
      .selectFrom("voice_calls")
      .select(["status", "timeline"])
      .where("id", "=", second.callId)
      .executeTakeFirstOrThrow();
    expect(row.status).toBe("failed");
    expect(JSON.stringify(row.timeline)).toContain("line_busy");
    // Free the line for the tests below (suite deletes only what it creates).
    await db().deleteFrom("voice_calls").where("id", "=", blocker).execute();
  });

  it("U15 D3 — stale takeover: a crashed listening row must not reject the CEO's next press", async () => {
    // A listening/transcribing row is a millisecond-scale state inside ONE
    // intake process; one older than 60s is a corpse from a crashed intake.
    // The measured 2026-07-17 defect: the CEO's FIRST press of the day was
    // rejected line_busy by exactly such a corpse.
    const corpse = crypto.randomUUID();
    createdCallIds.push(corpse);
    await sql`
      SELECT control_voice_call_log(${JSON.stringify({ id: corpse, status: "listening" })}::jsonb)
    `.execute(db());
    await sql`
      UPDATE voice_calls SET started_at = now() - interval '2 minutes' WHERE id = ${corpse}
    `.execute(db());
    createdIntentTexts.push("Hamza, gelir raporu ne durumda?");
    const dial = await intakeVoiceCall(
      { db: db(), stt: async () => "Hamza, gelir raporu ne durumda?" },
      { audio: Buffer.from("x"), lang: "tr" },
    );
    createdCallIds.push(dial.callId);
    expect(dial.busy).toBe(false); // the corpse never blocks the line
    expect(dial.state).toBe("routing");
    const swept = await db()
      .selectFrom("voice_calls")
      .select(["status", "timeline"])
      .where("id", "=", corpse)
      .executeTakeFirstOrThrow();
    expect(swept.status).toBe("failed"); // corpse failed honestly, with a reason
    expect(JSON.stringify(swept.timeline)).toContain("stale_takeover");
    await db().deleteFrom("voice_calls").where("id", "=", dial.callId).execute();
  });

  it("worker path: intake parks 'routing', drainVoiceCalls answers + writes the handoff WAV", async () => {
    const question = "R31 drain probe: haftalık öncelik nedir?";
    createdIntentTexts.push(question);
    const intake = await intakeVoiceCall(
      { db: db(), stt: async () => question },
      { audio: Buffer.from("stub"), lang: "tr", targetSlug: "agents-orchestrator" },
    );
    createdCallIds.push(intake.callId);
    expect(intake.state).toBe("routing");

    const parked = await db()
      .selectFrom("voice_calls")
      .select("status")
      .where("id", "=", intake.callId)
      .executeTakeFirstOrThrow();
    expect(parked.status).toBe("routing");

    const audioDir = await mkdtemp(join(tmpdir(), "r31-voice-"));
    try {
      const fakeWav = Buffer.concat([Buffer.from("RIFF\0\0\0\0WAVE"), Buffer.alloc(64)]);
      const drained = await drainVoiceCalls({
        db: db(),
        audioDir,
        answerDeps: {
          answer: async (q) => `R31 drain answer as ${q.agent.slug}`,
          tts: async () => fakeWav,
        },
      });
      expect(drained.answered).toBe(1);

      const row = await db()
        .selectFrom("voice_calls")
        .selectAll()
        .where("id", "=", intake.callId)
        .executeTakeFirstOrThrow();
      expect(row.status).toBe("ended");
      expect(Number(row.cost_eur)).toBe(0);
      const lines = row.transcript as Array<{ role: string }>;
      expect(lines).toHaveLength(2);
      const wav = await readFile(join(audioDir, `${intake.callId}.wav`));
      expect(wav.subarray(0, 4).toString("ascii")).toBe("RIFF");
    } finally {
      await rm(audioDir, { recursive: true, force: true });
    }
  }, 60_000);

  it("director without a voice identity gets the fallback voice, degraded=true", async () => {
    const question = "R31 probe: nakit akışı özet?";
    createdIntentTexts.push(question);
    const wav = await ttsSpeak(question);
    const result = await runVoiceCall(
      {
        db: db(),
        answer: async () => "Kısa deterministik cevap.",
      },
      { audio: wav, lang: "tr", targetSlug: "cfo" },
    );
    createdCallIds.push(result.callId);
    if (result.transcript) createdIntentTexts.push(result.transcript.slice(0, 500));
    expect(result.state).toBe("ended");
    expect(result.degraded).toBe(true); // cfo has no active identity (retired above)
    expect(result.answerAudio).not.toBeNull();
  }, 180_000);
});
