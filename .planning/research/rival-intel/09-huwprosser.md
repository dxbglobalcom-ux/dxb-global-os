# SOURCE 09 — Huw Prosser (`huwprosser`): "15 years of obsession"

> Listed by the CEO without a note. Fifteen seconds long — the shortest source after 04 — and
> almost entirely a mood piece. It carries exactly one idea, and that idea is a useful
> counterweight to everything else in the set.

---

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://www.instagram.com/reel/DYK2IWyoEWh/ |
| Uploader | `huwprosser` — Huw Prosser |
| Kind | Instagram reel, vertical, spoken English |
| File | `media/09-DYK2IWyoEWh.mp4` (2,804,997 bytes) — the smallest file in the set |
| **sha256** | `26a91b04f9e9e4ea5292fd9f03000c24ba60741afce8786ca1bbdc2e31115979` |
| Duration | **15.1 s** |
| Material studied | **21 frames** — 15 at 1 fps + 6 scene cuts — swept as 2 contact sheets |
| Transcript | `transcripts/09.json`, language `en` |
| Persistent caption | **"15 years of obsession"** |

---

## 2. Frame-by-frame record

| Time | On screen | Said | Frame |
|---|---|---|---|
| 0:00 | Black. Caption **"15 years of obsession"**, and under it the year **`2011`** | *(silence)* | t001 |
| 0:01 | **An archival clip, letterboxed, dated `2011`**: a teenager in an orange t-shirt at a desk, gesturing at a monitor showing a small blue circular JARVIS interface, cheap speakers, a mug, a microphone on a stand | *(silence)* | t002–t003 |
| 0:03 | Cut to **today**: a wide curved monitor on a black cutting-mat desk, a full-size mechanical keyboard, a bare circuit board and cables beside it, a warm light behind the screen. The screen shows almost nothing — **a small blue circular `JARVIS` logo and a clock reading `23:59`** on a near-black background. | *(silence)* | t004–t006 |
| 0:06 | **A second archival clip, dated `2012`**: the same person, older, glasses, in front of a monitor full of code | *(silence)* | t007–t008 |
| 0:08 | Back to the 2011 clip briefly, then the modern desk again | — | t009–t011 |
| 0:03 | *(the spoken exchange begins over these shots)* | **"Okay, Jarvis — are you there?"** *(the local transcript rendered this as "Travis"; the on-screen wordmark reads `JARVIS`, so the transcript is recorded as a mishearing, not corrected silently)* | t004–t005 |
| 0:05 | the minimal screen | **"At your service."** | t006–t008 |
| 0:09 | the minimal screen | **"Fantastic. Can you open up a map of London for me?"** | t009–t015 |
| 0:15 | the video ends — **the answer is never shown** | — | t015 |

**That is the entire source.** There is no architecture, no tool name, no result. The map is
never opened on camera.

---

## 3. Capabilities

| ID | Capability | What the source demonstrates |
|---|---|---|
| **CAP-09-A** | **A minimal resting state: a mark and a clock** | Today's screen holds a small logo and `23:59` and nothing else — the opposite of source 01's telemetry wall and source 10's constellation |
| **CAP-09-B** | **Presence check before command** | *"Are you there?"* → *"At your service."* — a two-word acknowledgement that costs nothing and proves the system is alive |
| **CAP-09-C** | **Fifteen years of the same idea** | 2011 → 2012 → today, the same interface concept, visibly improving |
| — | Nothing else. The requested action is not shown, so no claim about it is made here. | |

---

## 4. What DXB has today

| ID | DXB status | Evidence taken today |
|---|---|---|
| **CAP-09-A** minimal resting state | **NO — and the CEO's complaint is the mirror image of this** | He reports the 34" screen showing an **empty page** — which is not the same thing as a *designed* resting state. His is empty by accident; this one is empty by choice, and it still says "I am here" with a mark and a clock. A quiet surface that is obviously alive is a different object from a blank one. |
| **CAP-09-B** presence check | **NO** | Measured today: 4 of 9 calls failed with `empty_transcript`, and the CEO is given **no** acknowledgement that his voice arrived. The cheapest possible fix in the entire programme is a two-word "buradayım" the instant speech is detected — before any transcription, before any model. |
| **CAP-09-C** long-run consistency | **N/A** | Judgement, not a machine fact. |

---

## 5. The build project

Two projects, both tiny, both closing gaps that other sources also exposed.

| # | Project | What is built | Owning spec (adaptation — no new spec) | Closes when |
|---|---|---|---|---|
| **P09-1** | **"Buradayım" — instant acknowledgement** (CAP-09-B) | The moment speech is detected, before transcription starts, Hamza acknowledges — a sound or two words. Today the CEO speaks and waits 12.9–17.7 s (once 67.3 s) before anything happens, and 44 % of the time nothing ever does. An acknowledgement also makes the failure legible: if the capture is empty, he hears *"sizi duyamadım, tekrar eder misiniz"* instead of silence. | `VOICE_INTERACTION_SPEC` + R3.2 remediation note | A live call acknowledges within ~1 s of the CEO speaking, and a deliberately silent input produces a spoken "I did not hear you", not nothing. |
| **P09-2** | **A resting state that is alive, not empty** (CAP-09-A) | The idle command centre shows something small and true — the time, whether Hamza is listening, how many agents are awake, the live objective's gap — instead of a blank region. Composes directly with the constellation (P10-1) and the state indicator (P06-1). | `CEO_COMMAND_CENTER_SPEC` | The CEO's 34" screen at rest carries at least one live, measured fact, in both locales, with no empty region and no invented number. |

---

## 6. Verdict

**`geride` on one 15-second idea, and it is a genuinely important one.**

- **The source is thin and I will not inflate it.** Fifteen seconds, three shots, one question,
  and the answer is never shown. It is a mood piece.
- **But it contains the cheapest fix in the whole programme.** *"Are you there?" — "At your
  service."* DXB loses **44 %** of the CEO's speech today and tells him nothing when it does.
  Two words spoken the instant a voice is detected would convert a silent failure into an
  honest one, and it does not need the STT model, the workstation, or any of Friday's work.
- **And a design point worth holding on to:** after fifteen years of building this, his screen
  at rest is a logo and a clock. Not every surface has to be a constellation. The CEO's
  complaint is not that his screen is quiet — it is that his screen is **blank**, which is a
  different failure. Quiet and alive is a design; blank is a bug.
