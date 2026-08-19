# Study Card: OpenMontage + OpenCut

> STUB → FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 22 "openmantage" [sic]; tracker row was STUDY/Phase-10 stub since 07-06). PRIMARY winner of the [[video-editing-toolchain]] verdict.
> RE-MEASURED 2026-08-19 on the CEO's live order ("openmontage diye bir repo var onu inceler misin?"). The 07-17 numbers were read off the README of the day and are now stale; every figure below was taken from the repository itself at commit `1bab7118`, and the system was installed and RUN on DXB-Center. Evidence lines carry the command.

- **Tool:** OpenMontage — open-source agentic video production system ("turn your AI coding assistant into a full video production studio"); OpenCut — its open-source timeline editor (opencut.app)
- **Slug:** openmontage-opencut
- **Category:** Media/content (video production + editing)
- **Status:** STUDY (measured end-to-end 2026-08-19 in a scratchpad clone; nothing installed into this repository)
- **Target Phase:** 10 (Creative/Social video production wave — first candidate to INSTALL when that wave opens)
- **Owner (dept/tier):** Creative/Social video production
- **Trigger Type:** skill (skill/pipeline bundle driven from Claude Code) + service (Backlot board; OpenCut editor)
- **Source:** https://github.com/calesthio/OpenMontage
- **Pinned Version:** commit `1bab711820828c2e5fc1f87ed274a32587cb048f` (2026-08-18) — **the repo publishes no releases and no tags**, so a commit SHA is the only pin that exists (`curl .../releases` and `.../tags` both returned empty).
- **License:** **AGPL-3.0** — §13 "Remote Network Interaction" present in `LICENSE:540`. This was NOT recorded on the 07-17 card and it is the single most important commercial fact about this repository (see Pitfall 1).
- **Purpose:** The holding's editing/production lane: a full brief→research→proposal→script→scene_plan→assets→edit→compose→publish pipeline driven by an AI coding assistant, with human approval gates, budget control and a live production board. Pairs upstream with [[cinema-world-builder]]/[[banana-pro-director]] direction and [[z-image]]/[[seedance-2]] generation; [[heygen-hyperframes]] is now vendored INSIDE it as the second render runtime, not a competitor beside it.
- **Official Docs URL:** https://github.com/calesthio/OpenMontage (README + `AGENT_GUIDE.md` + `docs/ARCHITECTURE.md`)

## Measured 2026-08-19 (DXB-Center, Python 3.14.4, Node v22.23.2)

| What | 2026-07-17 card | Measured now | Command |
|---|---|---|---|
| Stars / forks | 23.6k / 2.6k | **48,939 / 6,130** | `curl api.github.com/repos/calesthio/OpenMontage` |
| Tools | "52 tools" | **121 registered, 166 python files under `tools/`** | `registry.discover(); len(registry.list_all())` |
| Skill files | "400+" | **1,096 `.md`** — 577 `.agents/skills`, 326 `.claude/skills`, 157 `skills/` (the same knowledge re-emitted per assistant vendor) | `git ls-files '*.md' \| cut -d/ -f1 \| sort \| uniq -c` |
| Pipelines | 12 | **13 manifests** in `pipeline_defs/` | `ls pipeline_defs` |
| Repo | — | 2,104 tracked files, 507 `.py`, 76 MB packed / 160 MB checked out | `git ls-files \| wc -l`, `du -sh` |
| Tests | — | **1,393 passed, 11 skipped, 69.3 s, zero API keys** | `pytest tests/ -q` |
| Availability with no keys | "zero keys works" | **40 of 121 tools**, of which tts 1/10 (Piper), video_post 9/9, analysis 7/13, subtitle 2/2, publish 1/1, character_animation 6/6, image_generation **0/16**, video_generation **0/26** | `registry.get_available()` |
| Real output | never rendered | **1920×1080, 30 fps, 690 frames, 23.06 s, h264+AAC, 4.1 MB, $0.00** | `python render_demo.py world-in-numbers` then `ffprobe` |

## What it actually produces — seen, not quoted

- The zero-key demo rendered a finished data-viz explainer on this machine (title card, donut chart with animated legend, closing statement card). Frames opened one by one; the motion is real motion, not a slideshow.
- The **Backlot living board** was served locally and photographed: stage rail with per-stage ✓, timestamp and `approved` marker; a `● LIVE` lamp; a `GENERATION SPEND $0.20` meter; the script as a screenplay page carrying an `APPROVED` stamp; an `ACTIVITY` panel streaming `events.jsonl` (tool, scene, duration, cost); a storyboard filmstrip whose card width is proportional to scene duration, each card showing provider, cost and quality score, with the hero scene marked; and a `▶ REPLAY RUN` scrubber that replays a finished run from its timestamps.

## How the liveness works (the part that matters to V2)

`backlot/server.py` (368 lines) + `backlot/state.py` (715) + `ui/board.js` (48 KB). A `watchfiles` watcher on `projects/` bumps a per-project version and wakes SSE subscribers; the browser refetches board state (`ui/lib.js:subscribe`, 250 ms debounce, EventSource auto-reconnect, 15 s heartbeat). **No agent participation and no reporting step** — every element is derived from files the pipeline already writes: `checkpoint_<stage>.json` + `history/`, `artifacts/*.json`, `asset_manifest`, `events.jsonl` (written by `BaseTool` instrumentation, which infers the project from the tool's own path arguments), `cost_snapshot`, `renders/*.mp4`. Projects with no checkpoints degrade to "what the watcher found" instead of an error. Per-stage state carried to the browser: `gated · produces · status · timestamp · review · cost_snapshot · error · human_approved · partial_progress · versions · history_entries`.

## Governance, measured in code — not in the README

- **The approval gate is fail-closed.** `lib/checkpoint.py:486` raises `GATE VIOLATION` when a gated stage is written `completed` without `human_approved=True`, and `_enforce_stage_prerequisites` raises `PREREQUISITE VIOLATION` when a stage is written before its predecessor completed. An unknown pipeline type refuses rather than defaults open (`checkpoint.py:270`).
- **Proof it is not decorative:** the repo's own shipped demo driver `scripts/backlot_simulate_run.py` **fails at HEAD** — it jumps research → script and the enforcement blocks it (`PREREQUISITE VIOLATION: stage 'script' … missing: ['proposal']`). Adding the missing `proposal` stage in a local copy made the same script run end to end. **This is an open defect in the rival's repository at commit `1bab7118`, found by running it.**
- **Budget:** `tools/cost_tracker.py` — estimate → reserve → reconcile → refund, with `BudgetExceededError` / `ApprovalRequiredError`, modes observe/warn/cap, per-action approval threshold and a total cap.
- **Provider choice is scored, not hardcoded:** 7 dimensions (task fit 30 %, quality 20 %, control 15 %, reliability 15 %, cost 10 %, latency 5 %, continuity 5 %) with the alternatives and the reasoning written to a decision log.

## Key API / Usage Notes

- Install ONLY the pipelines the first real use-case needs — 1,096 skill files into context is a token-discipline violation; curate a DXB subset.
- Works with Claude Code/Cursor/Copilot/Windsurf/Codex as the driving assistant; our driver = runtime agents via library grants at ADOPT.
- Runs on Python **3.14** despite `.python-version` saying 3.10 — core requirements are light (no torch; torch only in `requirements-gpu.txt`).
- `pip install -r requirements.txt` alone leaves TTS dead: Piper is declared `cmd:piper` and is only seen when the venv's `bin/` is on `PATH` (38 → 40 available tools). `make setup` is the supported path.
- Remotion render pulls a 92 MB headless Chrome on first run and `node_modules` weighs 383 MB.

## Known Pitfalls

1. **AGPL-3.0 §13.** Free to run internally, but if the holding ever exposes an OpenMontage-derived surface to customers over a network, the corresponding source must be offered to those users. Anything we build ON it inherits that question. **This is a CEO decision, not an author's.**
2. Two orgs exist (calesthio/OpenMontage + mirrors incl. `47thtechcorner/RayCodes_OpenMontage`, `digimads-lab/OpenMontage`) — canonical is calesthio; ignore mirrors/SourceForge repacks.
3. No releases, no tags, 230 open issues, pushed daily → pin the SHA and upgrade deliberately.
4. Its own demo driver is broken at HEAD (above) — treat shipped scripts as unverified until run.
5. `tools/publishers/` holds **one** tool (`export_bundle`, local packaging only). **It does not publish anywhere.** Any social distribution leg is ours to build — see [[moneyprinterturbo]] and `00-CEO-DIRECTIVE-SOCIAL-MEDIA-DEPT.md`.
6. Everything interesting for paid quality (16 image, 26 video, 10 TTS providers) is key-gated: zero-key output = Remotion/HyperFrames composition + free archives + Piper narration.

- **Install Command:** (deferred to Phase-10 wave) clone at the pinned SHA → `make setup` → curate pipeline subset → SkillSpector scan → wire ffmpeg render host → benchmark cut on a real short.
- **Legitimacy Verdict:** OK on quality and provenance — 1,393 tests green on our own machine, fail-closed gates, auditable decision trail. **Conditional on licence:** AGPL-3.0 must be answered by the CEO before anything derived from it faces a customer.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 R4.1 pass · re-measured and run 2026-08-19)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
