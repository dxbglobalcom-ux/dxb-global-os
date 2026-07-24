---
slug: chat-dictation-voice-merge
date: 2026-07-24
type: quick
status: in-progress
---

# Execution ticket — WisprFlow dictation in Chat with Hamza + Voice Line merge

**Spec pointers (no new design decisions here):**
- Complaint ledger 1a-1e voice lane (00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md:128) — CEO re-order 2026-07-19: WisprFlow-style dictation INSIDE Chat with Hamza; Voice Line merges into the chat page; one-command activation.
- U15 ticket 00-NOTE-R32-VOICE-REMEDIATION-PLAN.md — block 2 language whitelist {tr,en}; lang.ts registered adaptation (UI locale never force-fed to STT silently).
- VOICE_INTERACTION_SPEC §6/§7 (intake seam precedent: STT in dashboard route is allowed; LLM never).

**Scope (execution only):**
1. `@dxb/voice` gains `./speaches` export (SDK-free file already exists).
2. New route `POST /api/chat/dictate`: CEO auth → audio + explicit lang ∈ {tr,en} → Speaches STT → `{text}`. No call row, no intent — dictation lands in an EDITABLE input; the CEO's send button stays the only dispatch.
3. ChatBoard: mic toggle button (click start / click stop — WisprFlow idiom, distinct from the call line's hold-to-talk) + TR|EN dictation-language picker defaulting to UI locale + honest states (recording / transcribing / failed).
4. Chat page hosts the Voice Line: collapsible section under the board (CEO progressive-disclosure preference); `/voice` route becomes a redirect to `/chat`; nav entry for /voice removed (spec §31 route table adaptation recorded in ledger row closure).
5. `scripts/voice-on.sh` — one-command activation: start Speaches container + health poll + warm STT model + decisive OK line.
6. Dict: `command.chat` dictation + voice-section labels EN+TR; `help.chat` updated (dictation + merged voice line + where data comes from); `help.voice` stays for redirect-era but page gone from nav.

**Evidence contract:**
- Red-then-green E2E (scratchpad dictate-e2e.mjs): fake-mic WAV → text in textarea, screenshots idle/recording/result; /voice URL lands on /chat.
- Speaches live proof (this session): TR TTS→STT roundtrip "Merhaba Hamza, yarın sabah pazarlama raporunu hazırla." transcribed; base vs small latency measured (5s vs 17s warm on X230).
- RULE #0 battery on /chat: EN+TR × 1366/1920, scrollWidth===clientWidth, zero "…", HelpTip renders.
- i18n purity script pass. Commit(s) + ledger row update + STATE.md.
