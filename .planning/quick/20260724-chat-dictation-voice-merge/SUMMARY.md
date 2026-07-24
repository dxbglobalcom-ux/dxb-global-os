---
slug: chat-dictation-voice-merge
date: 2026-07-24
status: complete
---

# SUMMARY — WisprFlow dictation in Chat with Hamza + Voice Line merge

Ledger 1a-1e CLOSED (row updated with full evidence). Delivered:

1. **Dictation lane**: mic toggle in ChatBoard input row → `POST /api/chat/dictate` (new route; CEO auth, 10MB cap, zod lang whitelist {tr,en}) → Speaches STT → text appended to the EDITABLE draft. Explicit TR|EN picker defaults to UI locale (lang.ts adaptation honored — never a silent inherit). Honest states: Listening ·Ns / Converting ·Ns / per-cause error line (mic_denied, empty_transcript, stt_unavailable…). Send stays the only dispatch — the D6 garble-into-task defect cannot exist on this lane.
2. **Voice Line merge**: /chat hosts the call line as a collapsed `<details>` section under the board (registered progressive-disclosure preference); `/voice` = redirect; nav row removed; CC-SPEC §7 table synced (spec-gap fixed: `/chat` was never in the table).
3. **One-command activation**: `scripts/voice-on.sh` — container start, health poll, TTS→STT warm-up, one decisive line. Ran green.
4. **Dict**: command.chat +7 keys, help.chat +3 sections (dictation, voice line, provenance) EN+TR; purity PASS (2270=2270).

Evidence: red→green E2E (scratchpad dictate-e2e.mjs; fake-file mic broken in this Chromium — measured headless AND headed — mic stream synthesized in-page from the real WAV; MediaRecorder→route→STT all real): dictated text landed = "Merhaba Hamza, yarın sabah pazarlaman raporunu hazırla." RULE #0 battery 4/4 on merged /chat. Speaches exit 137 root-caused = manual stop in 07-18 RAM crunch. Latency measured: small 17s / base 5s warm on X230 (dictation model knob `DXB_DICTATION_STT_MODEL`, default stays quality-first small).

Boundary: U15 D1-D7 daemon defects stay OPEN (separate ticket); joint CEO mic test (U15 block 8) still the only closer for the human-ear legs.
