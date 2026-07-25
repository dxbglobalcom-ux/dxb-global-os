---
ticket: 20260725-u15-voice-remediation
type: quick
status: complete
created: 2026-07-25
author: Fable 5 (inline, K1)
---

# Execution ticket — U15 voice remediation D1-D7 (machine blocks)

**Execution ticket. Source of truth: `00-NOTE-R32-VOICE-REMEDIATION-PLAN.md` (U15) — "when any session reaches the end-game, THIS note is the execution ticket source. Do not re-plan."** CEO standing authorization: overnight "duramadan devam" + U15 note's own instruction. Block 8 (CEO ear test) CANNOT be machine-closed — queued for the CEO's morning.

## Current-state measurements (this session)

- Daemon `dxb-jarvis.service` disabled + dead since Jul-18: crash root MEASURED in `var/jarvis.log` = `prepareCues → ttsSpeak → ECONNREFUSED 127.0.0.1:8969` (speaches was manually stopped in the Jul-18 RAM crunch) → `process.exit(1)` → 708 systemd restarts. Not a mic defect.
- Wake/rough STT passes send NO `language` param (D1 open); intake auto-detect with no {tr,en} constraint (D2 open); intake has NO stale-line takeover (D3 leg open); no progress cues during long STT/answer waits (D4 open); ladder rung-1 retries same tier on low-confidence fails (D5 open); daemon already speaks busy/lost/err cues (D3/D6 legs partially closed by later work); voice intents no longer dispatch into tasks (round-4 guard — D6 task leg structurally closed); no voice code path looks up tasks by id (D7 emitter = retired classify hop).

## Blocks (from the U15 note, in its order)

1. D1 wake TR-lock: wake + active rough STT calls pass `lang:'tr'` + hotwords "Hamza" + vadFilter; regression unit in tests/r32 with the measured mangling.
2. D2 whitelist {tr,en}: script-level gate in lang.ts (`unsupportedScript`); intake rejects with `language_unsupported`; daemon speaks the lost cue. Regression: the measured Korean utterance.
3. D3: daemon boot fail-soft (speaches down → wait/retry, never crash-loop); intake stale-line sweep (crashed `listening`/`transcribing` rows >60s → failed) before the busy check so the CEO's first press is never rejected; every failure path already speaks a cue (verify mapping incl. new failure kind).
4. D6 garble gate: `language_unsupported`/`empty_transcript` → clarify cue; cue text upgraded to address the CEO ("Anlayamadım Muhittin Bey, tekrar buyurur musunuz?" — U15 block 4 text); cue cache versioned so new texts regenerate.
5. D4 latency cues: spoken progress cue when intake (STT) exceeds ~15s and once while the answer is being prepared.
6. D5 ladder: low-confidence fail at rung 1 escalates tier instead of same-tier retry — registered adaptation (U15 block 6 authority), TDD red→green on the escalate unit.
7. D7: measured closure — no task-id lookup path in the voice lane remains; recorded.
8. Joint CEO test: ⚠ UNVERIFIED — queued for the CEO's morning (only the CEO's ear closes D1/D3).

## Evidence contract

- tests/r32 + escalate tests red→green outputs; typecheck.
- Daemon boot proof: service enabled + `up — wake phrase armed` log line + arecord child alive + exactly one daemon process.
- var/jarvis.log crash-root citation; ladder adaptation registered in the spec + U-table.
