---
phase: 09-jarvis-voice-layer
plan: 01
status: complete
completed: 2026-07-10
duration: ~50min work spread over two sessions (07:32–07:38 study+install; 12:14–12:22 smoke+spec after session crash)
tasks_completed: 3/3
commits:
  - "51f0629 feat(09-01): Speaches study card + local TR round-trip measurements + VPS voice-profile spec"
---

# 09-01 SUMMARY — Speaches study → local install → TR smoke → VPS spec

**Executed inline by Fable 5 (governance v5 — no subagent).** Session note: the
executing session died ~11:55; this session resumed from the running container
+ existing study card, re-verified everything live before continuing.

## What closed

Voice infra exists and is measured before any voice code: study card with ⛔
verdict preceded install (dual-role principle), local Speaches answers both
audio endpoints with Turkish content end-to-end, and the VPS voice-profile
service block is deploy-ready (pure `compose --profile voice up -d` at the
gated 09-05 step, zero editing).

## Task evidence

| Task | ✓/⚠ | Evidence (command → decisive output) |
|---|---|---|
| T1 study card before install | ✓ VERIFIED | `.planning/study-cards/speaches.md` — endpoint matrix, model matrix, 9 pitfalls, ⛔ FABLE VERDICT PASS dated before install; measurements section filled at T2 |
| T2 local up + TR round trip | ✓ VERIFIED | TTS: `curl /v1/audio/speech` (piper-tr_TR-fahrettin-medium) → `briefing-tr.wav` 155,692 bytes, `file` → RIFF WAVE PCM 24000 Hz, ffprobe 3.24s; STT: `curl /v1/audio/transcriptions` (faster-whisper-small, language=tr) → `{"text":"Günaydın, gece 3 görev tamamlandı, 6 onay bekliyor."}` — **"onay" ✓, mikrofonsuz tam döngü**; `docker stats` → RSS **1.529GiB** both models warm; evidence log /var/tmp/dxb/speaches-run.md |
| T3 compose voice spec | ✓ VERIFIED | `docker compose -f vps/compose.yaml config` → exit 0; rendered block shows digest pin + mem_limit 1879048192 (=1792m) + healthcheck (curl /health, live-verified on the local container which answers `OK`); `git diff --stat` → only vps/compose.yaml, 12+/1- |
| TR ses kalitesi (kulak testi) | ⚠ UNVERIFIED | Machine cannot judge voice pleasantness — briefing-tr.wav at /var/tmp/dxb/ for CEO listen; STT loop proves intelligibility floor |

## Measurements (VPS budget inputs)

- TTS TR: cold 2.38s / **warm 0.67s** (Piper, 1 sentence)
- STT TR: **16.6–20.2s for 3.24s wav** on X230 i7-3520M (2C/4T, 2012) — laptop
  raw speed with model loaded; STACK's "4× realtime" assumes modern cores.
  **Re-measure on VPS at 09-05; laptop number must not enter VPS sizing.**
- RSS both warm: 1.529GiB → mem_limit 1792m; core+voice = 7488m on 8GB box
  (~700MB headroom for OS+Caddy+hermes). whisper-medium upgrade does NOT fit —
  recorded fallback: small stays on VPS.

## Deviations (mandatory adaptations, recorded)

| # | Deviation | Why |
|---|---|---|
| 1 | TTS model = Piper `tr_TR-fahrettin-medium`, not Kokoro | Kokoro-82M v1.0 has NO Turkish voice — master-plan fallback clause fired at study time (pitfall #6); id live-discovered from server registry, not guessed |
| 2 | mem_limit 1536m → 1792m | Measured RSS 1.529GiB exceeds the Phase-7 stub's 1536m — stub would OOM under real load |
| 3 | Model must be pre-downloaded; missing model returns silent JSON error from /v1/audio/speech | Discovered live (obs 3024) — recorded as pitfall #9; 09-03/09-04 clients must check Content-Type |

## Self-check

- Study card precedes install: card dated/committed with verdict; install evidence references it ✓
- Both endpoints proven with TURKISH content: TTS→STT loop transcript above ✓
- compose validates + RAM vs budget stated: exit 0 + headroom math above ✓
