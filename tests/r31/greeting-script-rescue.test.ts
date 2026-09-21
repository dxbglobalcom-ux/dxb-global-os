// THE HOLDING'S OWN GREETING MUST NEVER BE REFUSED BY THE HOLDING'S OWN GATE.
//
// Measured live 2026-07-28 01:31, call 8788dc75: the CEO said "Selamün aleyküm" to the wake
// session. Whisper auto-detect wrote it in ARABIC script — `السلام علي…` — the U15 D2 script
// whitelist saw a non-Latin transcript, refused it as `language_unsupported`, and Hamza spoke
// the clarify cue "Anlayamadım Muhittin Bey". The greeting is Arabic BY ORIGIN, this is a
// devout holding that opens every exchange with it, and it was the one sentence the system
// could not hear.
//
// Reproduced deterministically on synthesized audio before the fix was written:
//   0.6s clip → auto-detect "السلام عليكم" (non-Latin → refused)
//              → language pinned to tr: "Selamün aleyküm." (accepted)
// So a wrong-alphabet transcript is a MACHINE problem, not an unsupported language. The machine
// now spends one more pinned pass before it ever asks the CEO to repeat himself.
//
// U15 D2 stays intact and is asserted here too: when the pinned pass ALSO comes back non-Latin,
// the refusal stands. A genuinely unintelligible utterance must never become an intent or a task.

import { afterAll, describe, expect, it } from "vitest";
import { closeDb, getDb } from "@dxb/shared";
import { intakeVoiceCall } from "../../packages/voice/src/index.js";
import { watchLedgers } from "../helpers/suite-scope.js";

const db = () => getDb();

// Its own footprints in audit_log / decision_log, swept in afterAll below.
const ledgerScope = watchLedgers(db);
const createdCallIds: string[] = [];
const createdIntentTexts: string[] = [];

afterAll(async () => {
  // 2026-09-21: and the two append-only ledgers too. Measured by running
  // every sandboxed file alone: this one left the rows named below, which
  // no FK chain reaches. Watermark AND signature — never the watermark alone.
  await ledgerScope.sweep({ audit: [{ actor: "ceo", action: "intent.submitted" }] });
  for (const id of createdCallIds) {
    await db().deleteFrom("voice_calls").where("id", "=", id).execute();
  }
  for (const t of createdIntentTexts) {
    await db().deleteFrom("intents").where("text", "=", t).execute();
  }
  await closeDb();
});

/** The exact transcripts measured on the CEO's greeting, by pass. */
const ARABIC_SALAM = "السلام عليكم";
const TURKISH_SALAM = "Selamün aleyküm.";

/** stt stub: first (auto-detect) call returns `auto`, the pinned pass returns `pinned`. */
function sttStub(auto: string, pinned: string) {
  let call = 0;
  return async (_audio: Buffer, opts?: { lang?: "tr" | "en" }) => {
    call += 1;
    return opts?.lang === "tr" && call > 1 ? pinned : auto;
  };
}

describe("greeting script rescue (call 8788dc75 class)", () => {
  it("rescues the CEO's greeting when auto-detect lands in Arabic script", async () => {
    const res = await intakeVoiceCall(
      { db: db(), stt: sttStub(ARABIC_SALAM, TURKISH_SALAM) as never },
      { audio: Buffer.from("probe"), filename: "utterance.wav" },
    );
    if (res.callId) createdCallIds.push(res.callId);
    createdIntentTexts.push(TURKISH_SALAM);

    expect(res.failure ?? null).toBeNull();
    expect(res.transcript).toBe(TURKISH_SALAM);
    // the rescue is recorded, not silent — a future session must be able to see that the
    // first pass was wrong without re-deriving it
    const row = await db()
      .selectFrom("voice_calls")
      .select("timeline")
      .where("id", "=", res.callId!)
      .executeTakeFirst();
    expect(JSON.stringify(row?.timeline)).toContain("stt_rescued_tr");

    // §10 line-busy law is GLOBAL (one CEO, one line): this parked call would
    // reject the next case. Close it the way the drain would.
    await db()
      .updateTable("voice_calls")
      .set({ status: "ended", ended_at: new Date() })
      .where("id", "=", res.callId!)
      .execute();
  });

  it("still refuses when the pinned pass is ALSO unintelligible (U15 D2 intact)", async () => {
    const res = await intakeVoiceCall(
      { db: db(), stt: sttStub(ARABIC_SALAM, "뭐요? 무슨 말이야?") as never },
      { audio: Buffer.from("probe"), filename: "utterance.wav" },
    );
    if (res.callId) createdCallIds.push(res.callId);

    expect(res.failure).toBe("language_unsupported");
    // never a guessed intent from an unintelligible utterance
    expect(res.intentId ?? null).toBeNull();
  });
});
