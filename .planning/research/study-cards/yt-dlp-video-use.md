# Study Card: yt-dlp + video-use

> FILLED 2026-07-09 (07-01 Task 1). Verdict recorded BEFORE install per INTEG-01.
> Local install this plan (07-01 Task 2); VPS use at 07-07 via the same pinned version.

- **Tool:** yt-dlp + video-use — video/audio downloader (maintained youtube-dl fork) powering the VID-01 video-learn ingest
- **Slug:** yt-dlp-video-use
- **Category:** Media/content
- **Status:** STUDY → INSTALL (local binary this plan)
- **Target Phase:** 7
- **Owner (dept/tier):** Video-learning module (tools/video-learn)
- **Trigger Type:** skill
- **Source:** github.com/yt-dlp/yt-dlp — verified 2026-07-09; the de-facto maintained fork, official release assets with SHA2-256SUMS
- **Pinned Version:** **2026.07.04** (latest release, 2026-07-04). Asset used: **`yt-dlp_linux`** (standalone PyInstaller binary — no system Python dependency); `SHA2-256SUMS` shipped in the same release.
- **Purpose:** VID-01 v1 pipeline (07-07): CEO drops a video link → `yt-dlp` downloads + extracts AUDIO → Speaches STT transcribes → summary → `memory.commit(origin='video')` **quarantined** filing through the router. Audio-transcript path ONLY in v1.
- **Official Docs URL:** https://github.com/yt-dlp/yt-dlp#readme

## Key API / Usage Notes (ingest contract for 07-07)

- **Ingest invocation (07-07 copies verbatim):**
  `yt-dlp -x --audio-format mp3 --audio-quality 5 --no-playlist --max-filesize 500m --write-info-json -o '<workdir>/%(id)s.%(ext)s' '<url>'`
  - `-x --audio-format mp3` = extract audio (Speaches STT input) — **requires ffmpeg** on PATH (present locally; hermes deps install it on VPS at 07-06, and 07-07 verifies before first run)
  - `--no-playlist` = single video only, never playlist expansion (scope + budget guard)
  - `--max-filesize 500m` = runaway-download guard
  - `--write-info-json` = provenance sidecar (title, channel, upload date, URL) → feeds the quarantined memory record's origin metadata
- **Provenance rule:** the info-json (not the page scrape) is the provenance source; memory.commit records origin='video' + source URL; content stays quarantined until human-path promotion (Phase 6 door rules).
- **Video-use scope note:** frame/visual analysis DEFERRED — not needed for VID-01 v1 (audio transcript satisfies the requirement); revisit only via a new card fill if a later phase demands visuals.
- **Update cadence:** yt-dlp ships frequent releases (extractor churn vs. platform changes). Pin stands until a real extraction failure; update = card renewal with new pin + re-verified checksum (LOCKED house rule).

## Known Pitfalls
- `-x` silently needs ffmpeg — missing ffmpeg fails at the postprocess step, not at download; verify `ffmpeg -version` before first ingest run.
- Extractor breakage is upstream-normal — treat "unable to extract" as stale-pin signal, not a bug in our pipeline; renew card, don't patch around.
- Legal/ToS scope: CEO-provided single links only; no mass scraping, no playlist crawls (also enforced by `--no-playlist`).
- Two release assets look similar: `yt-dlp` (zipimport, needs system Python) vs `yt-dlp_linux` (standalone) — we ship the standalone one to avoid Python-version coupling.

## Install evidence (07-01 Task 2)
- Install: release asset `yt-dlp_linux` (2026.07.04) → sha256-verified against `SHA2-256SUMS` → `~/.local/bin/yt-dlp` (checksum line quoted in 07-01-SUMMARY)
- _Version output recorded post-install below:_
- `yt-dlp --version` → `2026.07.04`

- **Install Command:** `curl -fsSLO .../releases/download/2026.07.04/yt-dlp_linux && sha256sum -c <(grep yt-dlp_linux SHA2-256SUMS) && install -m755 yt-dlp_linux ~/.local/bin/yt-dlp`
- **Legitimacy Verdict:** OK — canonical community fork (massive contributor base, official GitHub releases with signed-off checksums file), binary verified against SHA2-256SUMS before first run, no install-time scripts; usage scoped to CEO-provided links

## Lifecycle Checklist
- [x] STUDY (2026-07-09, 07-01 — this fill)
- [x] INSTALL (2026-07-09, 07-01 Task 2 — local `~/.local/bin/yt-dlp`, sha256-verified)
- [ ] ADOPT (07-07 ingest pipeline)
- [ ] EMBED
