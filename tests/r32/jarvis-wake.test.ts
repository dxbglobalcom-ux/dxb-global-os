// R3.2 verification — JARVIS wake layer (VOICE_INTERACTION_SPEC §24bis).
//   1. wake matcher: the CEO's exact phrase + the STT manglings measured
//      from real Whisper output survive; ambient sentences do NOT wake
//   2. dismiss matcher: the CEO's listed dismissal sentences close, normal
//      questions never close
//   3. utterance-language detection: TR speech is never mislabeled EN by a
//      UI locale (the 2026-07-17 live defect), EN stays EN, hint only
//      breaks true ties
//   4. pcmToWav: header fields are a legal 16k mono s16le WAV — Speaches
//      rejects malformed containers, so the header IS the contract
// Pure-unit suite: no DB, no network, no mic.
import { describe, expect, it } from "vitest";
import { matchWake, matchDismiss, normalizeTr, editDistance } from "../../packages/voice/src/wake.js";
import { detectLang } from "../../packages/voice/src/lang.js";
import { pcmToWav, ambientNext, gateFor, passesEnergy } from "../../packages/voice/src/jarvis-daemon.js";

describe("wake matcher (CEO phrase + STT manglings)", () => {
  const wakes = [
    "Selamaleykum ya Hamza",
    "selamünaleyküm ya hamza",
    "Selam aleyküm ya Hamza.",
    "Esselamu aleyküm ya Hamza",
    "Salam aleykum ya Hamza",
    "SELAMALEYKUM YA HAMZA",
    "selamaleyküm hamza",
    "Selamun aleykum, ya Hamsa!", // whisper 'z'→'s' slip
  ];
  for (const phrase of wakes) {
    it(`wakes on "${phrase}"`, () => {
      expect(matchWake(phrase)).toBe(true);
    });
  }

  const nonWakes = [
    "günaydın arkadaşlar toplantı başlasın",
    "selam nasılsın bugün hava güzel",       // salam-class but no hamza
    "hamza raporu getirdi mi",               // hamza but no greeting
    "what is the revenue status today",
    "bir kahve alır mısın",
    "",
  ];
  for (const phrase of nonWakes) {
    it(`stays asleep on "${phrase || "<empty>"}"`, () => {
      expect(matchWake(phrase)).toBe(false);
    });
  }
});

describe("dismiss matcher (CEO dismissal sentences)", () => {
  const dismisses = [
    "kapanabilirsin",
    "Kapanabilirsin Hamza",
    "gidebilirsin ya Hamza",
    "Gidebilirsin.",
    "görüşürüz Hamza",
    "hoşça kal Hamza",
  ];
  for (const phrase of dismisses) {
    it(`closes on "${phrase}"`, () => {
      expect(matchDismiss(phrase)).toBe(true);
    });
  }

  const nonDismisses = [
    "finans raporunu özetle",
    "bugün kaç görev kapandı",
    "Selamaleykum ya Hamza",
    "yarın gidecek misin İstanbul'a", // 'gidecek' ≠ 'gidebilirsin' stem
  ];
  for (const phrase of nonDismisses) {
    it(`keeps the session on "${phrase}"`, () => {
      expect(matchDismiss(phrase)).toBe(false);
    });
  }
});

describe("utterance language detection (§27 — never the UI locale)", () => {
  it("detects TR from Turkish characters regardless of an EN hint", () => {
    expect(detectLang("finans departmanının bütçe durumu nedir", "en")).toBe("tr");
  });
  it("detects TR from stopwords when no special chars survive STT", () => {
    expect(detectLang("bana bir rapor lazim ve bu is acil", "en")).toBe("tr");
  });
  it("detects EN from English function words regardless of a TR hint", () => {
    expect(detectLang("what is the status of the finance department", "tr")).toBe("en");
  });
  it("uses the hint only on a true tie (lone proper noun)", () => {
    expect(detectLang("Hamza", "en")).toBe("en");
    expect(detectLang("Hamza", "tr")).toBe("tr");
    expect(detectLang("Hamza")).toBe("tr"); // no hint → CEO primary language
  });
});

describe("pcmToWav container", () => {
  it("writes a legal 16k mono s16le header around the payload", () => {
    const pcm = Buffer.alloc(3200, 7); // 100ms of noise
    const wav = pcmToWav(pcm);
    expect(wav.length).toBe(44 + pcm.length);
    expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
    expect(wav.readUInt32LE(4)).toBe(36 + pcm.length);
    expect(wav.toString("ascii", 8, 12)).toBe("WAVE");
    expect(wav.readUInt16LE(20)).toBe(1);      // PCM
    expect(wav.readUInt16LE(22)).toBe(1);      // mono
    expect(wav.readUInt32LE(24)).toBe(16000);  // sample rate
    expect(wav.readUInt32LE(28)).toBe(32000);  // byte rate
    expect(wav.readUInt32LE(40)).toBe(pcm.length);
  });
});

describe("ambient VAD gate (fan-noise loop breaker, 2026-07-17)", () => {
  it("gate never drops below the base threshold in a quiet room", () => {
    expect(gateFor(0, 550)).toBe(550);
    expect(gateFor(100, 550)).toBe(550);
  });
  it("gate rides above a loud room (fan at max RPM)", () => {
    expect(gateFor(700, 550)).toBeCloseTo(1540, 5);
  });
  it("first ambient sample seeds the EMA; a speech burst barely lifts it", () => {
    expect(ambientNext(0, 400)).toBe(400);
    const moved = ambientNext(400, 1400);
    expect(moved).toBeGreaterThan(400);
    expect(moved).toBeLessThan(402); // rise alpha 0.0005 → +0.5 per frame
  });
  it("falls back toward quiet fast once the noise stops (asymmetric v2)", () => {
    const fell = ambientNext(1400, 400);
    expect(fell).toBeLessThan(1391); // fall alpha 0.01 → −10 per frame
    expect(fell).toBeGreaterThan(1380);
  });
  it("hum hovering at the gate never buys an STT call; speech peaks do", () => {
    const gate = gateFor(700, 550);
    expect(passesEnergy(gate * 1.1, gate)).toBe(false);
    expect(passesEnergy(gate * 1.5, gate)).toBe(true);
  });
});

describe("normalize + distance primitives", () => {
  it("folds Turkish İ/I correctly", () => {
    expect(normalizeTr("İSTANBUL Iğdır")).toBe("istanbul ığdır");
  });
  it("edit distance is symmetric and bounded", () => {
    expect(editDistance("hamza", "hamsa")).toBe(1);
    expect(editDistance("", "abc")).toBe(3);
    expect(editDistance("abc", "abc")).toBe(0);
  });
});
