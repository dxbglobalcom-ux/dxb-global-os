# Study Card: speaches

> FILLED 2026-07-09 (07-01 Task 1) — NEW card. Verdict recorded BEFORE install per INTEG-01.
> Deploy lands in vps/compose.yaml `--profile voice` at 07-05; video-learn STT calls it at 07-07.

- **Tool:** Speaches — OpenAI-compatible STT+TTS audio server (faster-whisper + Kokoro-82M + Piper) in one container
- **Slug:** speaches
- **Category:** Media/content
- **Status:** STUDY (card filled; INSTALL at 07-05 compose deploy)
- **Target Phase:** 7
- **Owner (dept/tier):** JARVIS voice layer backend (VPS); consumed by video-learn STT (07-07) and Phase 9 voice cockpit
- **Trigger Type:** service
- **Source:** github.com/speaches-ai/speaches — verified 2026-07-09; images on ghcr.io (project moved off Docker Hub at v0.6.0)
- **Pinned Version:** image **`ghcr.io/speaches-ai/speaches:0.8.3-cpu`** — digest **`sha256:21e3df06d842fb7802ab470dd77c25f0e8c0d22950e8d8c6ae886e851af53ef8`** (pulled from ghcr manifest 2026-07-09). v0.8.3 = latest stable (2025-09-19); 0.9.x line still rc-only (v0.9.0-rc.3, 2025-12-27) — NOT used. Docs default `latest-cpu` is a moving tag — NOT used (open-notebook precedent).
- **Purpose:** Always-on (but on-demand-profile) voice backend: `/v1/audio/transcriptions` (STT, faster-whisper) + `/v1/audio/speech` (TTS, Kokoro-82M; Piper ultra-light fallback). The "Whisperflow clone" the master mandates — laptop voicebox stays the client, Speaches on VPS is the backend for morning briefings/spoken commands; 07-07 uses STT for video transcripts.
- **Official Docs URL:** https://speaches.ai/installation/ (+ usage/text-to-speech, usage/speech-to-text)

## Key API / Usage Notes (compose contract for 07-05 / STT call for 07-07)

- **Port:** container 8000, OpenAI-compatible REST; bind 127.0.0.1-only on VPS (gateway/Caddy decides any exposure — default none).
- **Endpoints:** `POST /v1/audio/transcriptions` (multipart file + `model` = faster-whisper model id), `POST /v1/audio/speech` (`model` = Kokoro/Piper voice id). OpenAI SDK-compatible, so any client that can hit LiteLLM-style `/v1` works.
- **Models (LOCKED stack choice):** STT default **whisper `small` int8** (≈4× realtime on CPU per STACK research); TTS **Kokoro-82M** (327MB, 54 voices, CPU-fast), Piper fallback. Models download at first use into HF cache.
- **Model cache volume (upstream-verbatim):** `hf-hub-cache:/home/ubuntu/.cache/huggingface/hub` — named volume REQUIRED or every restart re-downloads models.
- **Compose contract (LOCKED):** service sits in `vps/compose.yaml` under **`profiles: ["voice"]`** — on-demand only (`docker compose --profile voice up -d`); RAM-pressure fallback #1 = socket-activation (STACK fallback order). We write our own service block; upstream compose.cpu.yaml is reference only (uses moving tag).
- **Env (names only):** none required for core STT/TTS (no secrets — models are local); any tuning env stays names-only in compose. No API key = another reason it must NEVER be exposed beyond localhost.

## Known Pitfalls
- `latest-cpu` + implicit pull = silent drift — exact tag + digest pinned above; no `pull_policy: always`.
- First request after cold start triggers model download/load — health check must hit a real readiness signal, and 07-07's STT call needs a generous first-call timeout.
- 0.9.0-rc.x looks newer but is pre-release — do not "upgrade" past stable without card renewal.
- RAM is the scarce resource: **1–1.5GB under load** (master table) — this is WHY the voice profile is on-demand; keep it out of the `core` profile.

## RAM note (Phase 7 budget input)
- Master table expectation: **1–1.5GB under load** — ⚠ UNMEASURED until 07-05 deploy; `docker stats --no-stream` measurement recorded at 07-05/07-07 evidence.

- **Install Command:** (07-05, VPS) service block in `vps/compose.yaml` pinned to the digest above + `docker compose --profile voice up -d` → readiness curl — exact lines land in 07-05-SUMMARY
- **Legitimacy Verdict:** OK — active OSS org (speaches-ai), stable release line, images under the project's own ghcr namespace with verifiable digests, no install-time code execution outside the container, no secrets required; local-only binding mandated

## Lifecycle Checklist
- [x] STUDY (2026-07-09, 07-01 — this fill)
- [ ] INSTALL (07-05, VPS compose `--profile voice`)
- [ ] ADOPT
- [ ] EMBED
