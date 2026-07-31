# Study Card: Kelam (WisprFlow clone — our own product)

> STUB → FILLED 2026-07-17 (R5.1 execution). History: architecture ordered and
> written 2026-07-17 (`docs/kelam/ARCHITECTURE.md`); **M0+M1 BUILT the same
> day** — standalone repo `/home/ghost/kelam` (commit ce4a47e, 41 files).

- **Tool:** Kelam — native Linux hold-to-talk dictation (our own product, not an install of someone else's; revenue op #12 SME packaged install)
- **Slug:** whisperflow-clone
- **Category:** Media/content (product)
- **Status:** INSTALL (M0 repo + M1 headless core BUILT and proven; ADOPT = board row B25) <!-- OPEN: B25 -->
- **Target Phase:** 9+ (JARVIS input lane) / R5.x build slots
- **Owner (dept/tier):** JARVIS input / Engineering (product)
- **Trigger Type:** service (own repo, own CI — NOT a DxB monorepo module)
- **Source:** `/home/ghost/kelam` (standalone git repo, MIT — OD-3 recommendation adopted); architecture contract `docs/kelam/ARCHITECTURE.md` (22-section prompt mapping)
- **Pinned Version:** 0.1.0 (workspace), Rust stable 1.96 / edition 2024
- **Purpose:** Speak anywhere on Linux, clean text lands in the active app. M1 proves the free chain: arecord capture → local Speaches faster-whisper STT (€0, D1) → deterministic TR/EN/DE rules cleanup → clipboard.
- **Official Docs URL:** repo `README.md` + `docs/` 9-doc set

## Key API / Usage Notes

- CLI: `kelam doctor | transcribe <wav> --lang tr|en|de | record --seconds N`; env `KELAM_SPEACHES_URL` (default `http://127.0.0.1:8969`), `KELAM_STT_MODEL` (default `Systran/faster-whisper-small`).
- MEASURED proofs 2026-07-17: 3-language fixture chains Completed with clipboard readback; **acoustic roundtrip** (speakers→air→internal mic→chain Completed); honest EmptyAudio on silence; battery fmt+clippy(-D)+19 tests green.
- MEASURED defect fixed in-build: X11 clipboard ownership died with the short-lived CLI (arboard) → delivery via `xclip`/`wl-copy` persistent-ownership subprocess.

## Known Pitfalls

1. M1 capture = `arecord` subprocess (build machine lacks libasound2-dev + sudo lane — recorded in technology-decision deviations); in-process PipeWire capture is M2.
2. whisper-small mishears under acoustic loss/low capture volume (measured: "hani yarın"→"Hania'nın" at 22% capture) — model upgradable via env; not a chain defect.
3. German "eh": whisper renders äh/ähm as "eh", which is also a REAL German word ("anyway") — meaning-preservation rule keeps it out of the filler lexicon deliberately.
4. Wayland shortcut/overlay/paste = the M2 risk mass (architecture §9-§11 matrices).

- **Install Command:** `cd /home/ghost/kelam && cargo build --release -p kelam-cli` (from-source; .deb/AppImage/Flatpak = M5).
- **Legitimacy Verdict:** OK — our own MIT code; free-first compliant (local STT, zero paid deps); no proprietary assets copied (P§1).

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — architecture, measured backends)
- [x] INSTALL (2026-07-17 — M0 repo + M1 headless core built, proof runs recorded; commit ce4a47e)
- [ ] ADOPT (M2 desktop integration: portal shortcut + overlay + paste ladder)
- [ ] EMBED (JARVIS input lane wiring + packaged SME distribution)
