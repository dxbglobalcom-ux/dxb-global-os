---
ticket: 20260725-u15-voice-remediation
status: complete-machine-legs
completed: 2026-07-25
---

# SUMMARY — U15 voice remediation: blocks 1-7 executed, block 8 = CEO ear

Executed from `00-NOTE-R32-VOICE-REMEDIATION-PLAN.md` (the binding execution source), systematic-debugging + TDD throughout.

| Block | Result | Evidence |
|---|---|---|
| 1. D1 wake TR-lock | ✓ VERIFIED | `wakeSttOpts()` (language=tr + vad_filter + hotwords "Hamza Selamaleykum") used by wake AND active rough passes; red→green tests/r32 (39/39) |
| 2. D2 {tr,en} whitelist | ✓ VERIFIED | `lang.ts unsupportedScript()`; measured Korean utterance flags; intake fails `language_unsupported`; daemon plays clarify cue; red→green tests/r32 |
| 3. D3 capture failures | ✓ VERIFIED (machine legs) | Crash root MEASURED: `var/jarvis.log` = `prepareCues → ECONNREFUSED 127.0.0.1:8969` (Speaches stopped in the Jul-18 RAM crunch) → 708 systemd restarts; boot now fail-soft (30s retry loop). Stale-line takeover: `listening`/`transcribing` corpses >60s failed (reason `stale_takeover`) BEFORE the busy check — red→green tests/r31 (`busy=false`, corpse `failed`); §10 busy law untouched (young-corpse busy test still green). Every failure path speaks a cue (busy/lost/err mapping verified in code path) |
| 4. D6 garble gate | ✓ VERIFIED | `language_unsupported` + `empty_transcript` → spoken block-4 clarify text ("Anlayamadım Muhittin Bey, tekrar buyurur musunuz?"); cue cache versioned (`CUE_VERSION` filename) so text changes can never play stale WAVs; garble→task impossible (script gate + round-4 voice-intent dispatch guard) |
| 5. D4 latency cues | ✓ code-verified / ⚠ ear-pending | `wait` cue when intake STT exceeds 15s (`DXB_JARVIS_STT_CUE_MS`), one `prep` cue during answer drain past 20s (`DXB_JARVIS_ANSWER_CUE_MS`) |
| 6. D5 ladder | ✓ VERIFIED | `low-confidence-bump` rung-1 substitute in `escalate.ts` (only when the recorded fail reason is `low-confidence`; plain failures keep LOCKED retry-same-tier; T-05-13/14 arithmetic untouched); red→green tests/phase5/ladder (6/6); registered adaptation in VOICE_INTERACTION_SPEC §24bis U15 block |
| 7. D7 phantom | ✓ MEASURED CLOSED | Zero task-id lookup paths in packages/voice (all 12 files read this session); emitter = classify-to-director hop retired 2026-07-24 |
| 8. Joint CEO test | ⚠ UNVERIFIED — human gate | Daemon LIVE and waiting: 5-minute protocol (selam → spoken ack · question → spoken answer · "kapanabilirsin" → bye). Only the CEO's ear closes D1/D3 |

**Runtime state:** `dxb-jarvis` enabled+active, boot log `up — wake phrase armed`, arecord capturing (wake passes logged); `dxb-scheduler` restarted on the new dist — measured exactly ONE `outbox-executor/dist/main.js` node process (operational rule honored). `pnpm build` (tsc --build) clean.

**Boundary:** X230 STT latency floor unchanged (VPS lifts it — Phase 7). U16 (design symmetry list) untouched — separate deferral.
