---
phase: 07-mcp-gateway-24-7-vps-runtime
plan: 01
status: complete
completed: 2026-07-09
duration: ~25min
tasks_completed: 3/3
commits:
  - "(this commit) feat(07-01): phase-7 toolset study→install — 3 cards pinned, hcloud+yt-dlp sha256-verified local"
---

# 07-01 SUMMARY — Phase toolset study cards + local CLI installs

**Executed inline by Fable 5 (governance v5 — no subagent).**

## What closed

Master-plan PHASE-07 step-1 residue (the gateway pattern study itself landed at planning, commit b7dc785 — NOT repeated here): all three remaining deploy targets carry FILLED, pinned, legitimacy-checked cards BEFORE any install/deploy step depends on them (INTEG-01 "no blind installs"), and the two local CLIs later plans invoke are live and version-verified (dual-role principle).

## Card-by-card verdict table (Task 1)

| Card | Verdict | Pin + key contract recorded |
|---|---|---|
| hermes-agent (filled) | OK — official NousResearch org, very active (3 releases first week of July 2026) | **v0.18.2** (2026-07-07) version-LOCKED; LiteLLM wiring: `~/.hermes/config.yaml` providers block `type: openai` + `base_url: http://127.0.0.1:4000/v1` + `key_env: DXB_LITELLM_KEY_HERMES` (docs-verified: base_url set ⇒ direct endpoint call); daemon = `hermes gateway` under `vps/systemd/hermes.service`; built-in cron scheduler = the surface 07-06's bounded-job template maps onto; runtime Python 3.11 via uv + Node bundled + ripgrep/ffmpeg/git |
| speaches (NEW) | OK — active OSS org, ghcr images under project namespace, digest-verifiable | **`ghcr.io/speaches-ai/speaches:0.8.3-cpu`** @ **`sha256:21e3df06d842fb7802ab470dd77c25f0e8c0d22950e8d8c6ae886e851af53ef8`** (ghcr manifest 2026-07-09; `latest-cpu` moving tag REJECTED, 0.9.x rc-only REJECTED); endpoints `/v1/audio/transcriptions` + `/v1/audio/speech` port 8000; whisper small int8 + Kokoro-82M; RAM 1–1.5GB under load ⇒ on-demand `--profile voice` (LOCKED); named volume `hf-hub-cache` required |
| yt-dlp-video-use (filled) | OK — canonical maintained fork, release checksums file | **2026.07.04**, standalone asset `yt-dlp_linux`; 07-07 ingest invocation recorded verbatim (`-x --audio-format mp3 --no-playlist --max-filesize 500m --write-info-json`); ffmpeg dependency flagged; video-use visual analysis DEFERRED (VID-01 v1 = audio path) |

✓ VERIFIED: `grep -L "TBD" <3 cards> | wc -l` → `3` (all TBD-free); `grep -c "Pinned Version" speaches.md` → `1`.

## Local installs (Task 2)

| Tool | Version evidence | Supply-chain evidence (T-07-01) |
|---|---|---|
| hcloud CLI | `~/.local/bin/hcloud version` → `hcloud 1.66.0` | `hcloud-linux-amd64.tar.gz: OK` against release `checksums.txt`: `8b1a8598858232c491f58cbf65ce1bd0ec6f725114bb62ec967a20ab03e29a86` |
| yt-dlp | `yt-dlp --version` → `2026.07.04` | `yt-dlp_linux: OK` against release `SHA2-256SUMS`: `6bbb3d314cde4febe36e5fa1d55462e29c974f63444e707871834f6d8cc210ae` |
| ffmpeg (pre-existing dep check) | `ffmpeg version 6.1.1-3ubuntu5` | system package, needed by `yt-dlp -x` |

✓ VERIFIED: both binaries sha256-checked before first run (01-01 gitleaks precedent). No Hetzner resource created, no token stored/requested — 07-04's CEO checkpoint owns credentials.

## Tracker (Task 3)

- yt-dlp + video-use: STUDY → **INSTALL** (dated citation; ADOPT deferred to 07-07 ingest)
- **Speaches: NEW row** (Media/content, Target 7, service, STUDY; INSTALL cited for 07-05 deploy; on-demand profile noted)
- hermes-agent: **stays STUDY** — see deviation below

✓ VERIFIED: `grep -n "speaches" INTEGRATION-TRACKER.md` → row 39 present.

## Deviations

| # | Deviation | Why |
|---|---|---|
| 1 | hermes-agent NOT advanced to INSTALL (plan's conditional read allowed it once "card filled + local prep done") | Status legend says advance only on executed evidence; hermes has NO install executed anywhere (VPS deploy = 07-06). Plan's own guard sentence "Never advance a row past what executed evidence supports" wins. Card fill cited in Notes; INSTALL flips at 07-06 with deploy evidence. |
| 2 | speaches card Category written "Media/content" (first draft said Media/voice) | Aligned to plan's Task-3 category directive; tracker + card consistent. |

## For downstream plans

- 07-04: `hcloud 1.66.0` live — provisioning tool ready; NO token on disk (checkpoint step).
- 07-05: speaches compose block copies the digest pin + `profiles: ["voice"]` + `hf-hub-cache` volume from the card.
- 07-06: hermes install contract (installer download→inspect→v0.18.2, config.yaml providers block, systemd shape) is card §Key API; RAM measured at deploy.
- 07-07: ingest invocation is card-verbatim; ffmpeg verified locally, must be re-verified on VPS before first run.
