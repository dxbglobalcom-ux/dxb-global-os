# Quick ticket 20260725-u15-voice-round2 — JARVIS round-2 remediation (CEO live verdict on U15 block 8)

**Spec pointers (the plan lives THERE, not here):** VOICE_INTERACTION_SPEC §24bis (U15
remediation block — this round appends D9-D13 as registered adaptations),
00-NOTE-R32-VOICE-REMEDIATION-PLAN (U15 note — round-2 section), CC-SPEC /chat surface.

**Trigger:** CEO in-chat complaint 2026-07-25 ~13:26 — the U15 block-8 ear test verdict is
FAIL with new measured defect classes. CEO orders: fix broken things immediately.

## Measured defects (root causes, session 2026-07-25)

| # | Defect (CEO words) | Root cause (measured in source) |
|---|---|---|
| D9 | "kapan dedim kapanmadı … tmm kapanıyorum diyor ama yine başlıyor" | Dismiss depends only on the rough STT pass; a mangled transcript falls through to intake and the LLM ANSWERS "kapanıyorum" while `mode` stays `active` (jarvis-daemon.ts:388-399). No hard-off state exists at all; "kendini kapat / sus" not in DISMISS_STEMS. |
| D10 | "kendi kendine konuşuyor, habire çözümlüyorum diyor" | No half-duplex: the daemon's own speaker output (cues incl. `wait` = "çözümlüyorum…", answers) re-enters the mic and becomes new question segments; active mode never coalesces the queue (jarvis-daemon.ts:281 coalesce only when sleeping). |
| D11 | "ufacık ses duysa aktif oluyor / arkadaşımla konuşmama rağmen çözümlemeye çalıştı" | Every segment resets `lastActivity` (jarvis-daemon.ts:401) so the 120s idle never fires in a lived-in room; idle is only checked when a segment arrives; active mode has no STT gap. Session effectively never closes. |
| D12 | "chatten kapan dedim, uymadı — chat/voice/jarvis üçü aynı olmalı" | chat_messages and voice_calls are disjoint seams; no daemon control channel; voice turns invisible to chat and vice versa. |
| D13 | "recent calls'a her söz ayrı özet düşüyor; konu konu kaydolmalı" | One voice_calls row per utterance; no session grouping column; UI lists rows flat. |

## Execution blocks (TDD red→green each)

1. Matchers: DISMISS_STEMS += sus/yeter/kapat/kes; new `matchHardOff`, `matchMute`,
   `matchUnmute` (chat-lane) in wake.ts — tests/r32.
2. Migration 20260725005000: `chat_messages.source` ('chat'|'voice'), `voice_calls.session_id`,
   `voice_daemon_state` single-row table + `control_voice_daemon_set_state` audited door,
   seed state = **muted** (standing CEO order: stay silent until reopened).
3. Daemon: half-duplex playback window drop + always-coalesce + post-answer backlog purge;
   idle on wall-clock timer + lastActivity only on real interactions; active-mode STT gap;
   muted-state poll + spoken hard-off → self-mute; dismiss double-check on intake transcript.
4. Bridge: answerVoiceCall mirrors Hamza-answered calls into chat_messages (source='voice');
   voice answers get recent chat history as context; chat-drain executes mute/unmute commands
   deterministically (no LLM) and confirms in chat.
5. UI /chat: mic state pill + toggle in Voice section, session-grouped recent calls,
   voice-source marker in board. RULE #0 battery EN+TR × 1366/1920 + i18n purity.

## Evidence contract

- tests/r32 (matchers + daemon pure fns) red→green; tests/u15r2 db leg (migration cols,
  audited door, chat mirror) green; existing r31/r32 stay green.
- Daemon boot log proves muted state honored; unmute door proof via control fn.
- Battery screenshots + purity PASS.
- ⚠ UNVERIFIED remains: spoken end-to-end at the CEO's ear (block 8 re-run on the new 32GB
  machine or on CEO demand).
