# video-use vs OpenMontage (+HyperFrames, +Remotion): is it double, and which is better?

Reader: Opus 5.5, blind to the other reader. Measured 2026-11-07 on DXB-Center.
Abbreviations: **VU** = video-use clone `{SCRATCH}/video-use` @ `43cfc566` (2026-10-08). **OM** = `/home/dxb/tools/OpenMontage` @ `1bab7118` (2026-08-18, same pin as our study card; tree unchanged by this run, verified by `git status` before/after). **HF** = HyperFrames npm `hyperframes` 0.9.20 (`~/.npm/_npx/702923228c2ce1e6/node_modules/hyperframes`, `license: Apache-2.0`). **RM** = Remotion 4.0.484 (`OM/remotion-composer/node_modules/remotion/package.json`).
`{SCRATCH}` = `/tmp/claude-1000/-home-dxb-DxB-Global-OS/0465153b-2bdc-48de-8af0-ea672dee96c8/scratchpad/video-compare/opus-scratch`.

## Short answer

- **Not double in what each is for, but double in about half of the features.** OM is a *production factory*: 13 pipelines, it generates footage, voice and music from nothing, with gated stages and the Backlot board. VU is a *filmed-footage editor*: 5 Python helpers plus a 342-line SKILL.md that cut real takes on word boundaries.
- **Does OM already cut filler words from a filmed talking head? No, not as a tool.** OM only cuts **silence** (`tools/video/silence_cutter.py:227`, ffmpeg `silencedetect` at a dB threshold). Filler words exist only as prose advice (`skills/creative/video-editing.md:21`), and no OM tool removes them. On the same clip, OM's cutter removed the pauses but **kept the false start "Bugün size, şey," and the filler "Yani,"**. VU's EDL removed both (bench below).
- **Does OM already make Shorts from a long video? Partly, yes:** the `clip-factory` pipeline (`pipeline_defs/clip-factory.yaml:1-7`) has an LLM rank clips, then cuts, subtitles and exports each one. **Vertical reframe is weak**: `auto_reframe.py` exists (EXPERIMENTAL), but clip-factory does not list it, and its own skill says *"OpenMontage does not yet have first-class auto-reframe"* (`skills/pipelines/clip-factory/scene-director.md:28`). On this machine `face_tracker` is UNAVAILABLE (no mediapipe/opencv), so any reframe falls back to a center crop.
- **Correction: VU does NOT do long→short.** It has no highlight ranking, no clip batch and no reframe. `render.py` keeps a portrait source portrait (`render.py:149,272-274`) and never crops landscape to 9:16 (`grep crop render.py` finds nothing). The README never claims Shorts (`README.md:13-21`). An LLM *could* pick one range from a long take by hand, but that is not a Shorts feature.
- **Remotion is in our system and OM's pipelines really use it** (details in §3). Using it costs money only if the holding stops qualifying for its Free License.

## 1. Capability matrix

Legend: **YES** / **PART** / **NO**, with the proving file (paths relative to each repo).

| Capability | video-use | OpenMontage | HyperFrames (0.9.20) | Remotion |
|---|---|---|---|---|
| Word-level transcription — engine, local or paid | **YES, paid as shipped**: ElevenLabs Scribe `scribe_v1`, word timestamps, diarize, audio events (`helpers/transcribe.py:33,90-95`); exits without a key (`:48`). **Swappable**: adapter proven locally (bench) | **YES, local**: faster-whisper, `word_timestamps=True, vad_filter=True`, optional whisperX diarize (`tools/analysis/transcriber.py:39,165-166,250-274`). **UNAVAILABLE here today**: no `faster_whisper` in `OM/.venv` (registry `get_status`). Paid alt: `azure_stt.py`, `dashscope_asr.py` | **YES, local or paid**: `hyperframes transcribe`, engines auto / parakeet / whisper(.cpp) / heygen (paid) (`dist/transcribe-GUUUSHHL.js`, option text). For captions, not editing | NO (consumes captions: `@remotion/captions`) |
| Filler-word and silence cut on filmed footage | **YES**: word-boundary cuts with a 30–200 ms pad, silences ≥400 ms preferred, verbatim ASR required (`SKILL.md:27-29,108-113`). The LLM decides from `takes_packed.md` | **PART**: silence only, dB-threshold jump-cut / speed-up / mark (`tools/video/silence_cutter.py:61-90,227`). **Fillers: NO tool**; advice only (`skills/creative/video-editing.md:12,21`) | NO (measures silence: `hyperframes audio`, README:51-58; no cut command) | NO |
| Multi-take selection | **YES**: dedicated editor sub-agent brief, best take per beat (`SKILL.md:127-164`), batch transcription (`helpers/transcribe_batch.py`) | **PART**: "keep the best delivery" advice (`skills/creative/video-editing.md:25`); no take-selection brief | NO | NO |
| Talking-head editing (end to end) | **YES**: the core use (`README.md:9`, `SKILL.md:83-104`) | **YES as a pipeline**: `pipeline_defs/talking-head.yaml` idea→script→scene_plan→assets→edit→compose→publish, 7 gated stages. **Cannot start here today**: script stage `required_tools: transcriber` (`:67-68`) is UNAVAILABLE | NO (it composes; it does not edit takes) | NO |
| Long→short highlight clipping | **NO** (see correction above) | **PART→YES**: `clip-factory.yaml` (ranked portfolio, hooks, per-clip subtitles, ffprobe validation, `:56-85,181-186`). Also needs `transcriber`, UNAVAILABLE today | NO | NO |
| Vertical reframe | **NO** (portrait preserved, no crop: `render.py:149-187,272-274`) | **PART**: `tools/video/auto_reframe.py` 16:9→9:16 face-tracked (MediaPipe→smoothed crop, `:1-12,386-410`), EXPERIMENTAL; listed in talking-head (`talking-head.yaml:180`) but **not** in clip-factory; `face_tracker` UNAVAILABLE → center crop | PART: `hyperframes face` measures face box (`dist/face-*.js`), no reframe render | NO (possible in code; nothing shipped) |
| Burned subtitles | **YES**: output-timeline SRT, 2-word UPPERCASE chunks, applied LAST (`render.py:433-530,679`). **Turkish defect**: `text.upper()` (`render.py:507`) prints `IŞINI`, `SISTEMI`, `YÖNETIYOR` (should be `İŞİNİ`, `SİSTEMİ`, `YÖNETİYOR`). Seen in the rendered frame `bench/raw/edit/verify/sub_frame.jpg` | **YES**: `tools/subtitle/subtitle_gen.py` (SRT/VTT/JSON, 8 words/cue) + animated word-by-word `tools/video/remotion_caption_burn.py` (Remotion-only, ffmpeg fallback). Turkish casing not tested | YES (caption compositions; transcribe feeds them) | YES (`@remotion/captions`, TikTok-style pages: ECC `rules/display-captions.md`) |
| Color grade | **YES**: `helpers/grade.py` presets `warm_cinematic`, `neutral_punch`, `auto`, any raw filter; applied per segment | **YES**: `tools/enhancement/color_grade.py` 7 profiles + `.cube` LUT (`:25-73,188`) + face/eye enhance | PART (`grade-compare` command exists; not a grader) | NO (CSS filters only) |
| Audio fades / loudness | **YES**: 30 ms `afade` at every segment edge (`render.py:286`), two-pass loudnorm −14 LUFS / −1 dBTP (`render.py:534-631`). Bench: **−13.9 LUFS** measured | **PART**: loudnorm −16 LUFS (`tools/audio/audio_mixer.py:215-222`, `audio_enhance.py:33`); music fades in the mixer; **no micro-fade at silence-cut edges** (`silence_cutter.py:298-350`: no `afade`) | PART: `normalize-audio` LUFS match (README:60-71) | PART (volume in code) |
| Motion-graphics overlays | YES, **delegated**: HF / RM / Manim / PIL per slot in parallel sub-agents (`SKILL.md:205-218`); vendors `skills/manim-video/` | **YES, native**: `video_compose.py` (2,875 lines) with Remotion runtime + `hyperframes_compose.py` (1,436 lines); `render_runtime` locked per proposal (`pipeline_defs/*.yaml`) | **YES**: this is what it is: HTML/GSAP → deterministic MP4/WebM | **YES**: React compositions |
| Generate footage from nothing (AI video, images, TTS, music) | **NO** | **YES** (key-gated): 26 video, 16 image, 10 TTS providers incl. local `ltx_video_local.py`, `wan_video.py`, ComfyUI workflows, `piper_tts.py`; zero-key today: **39 of 121 tools available** (registry, measured) | PART: local Kokoro TTS (`dist/tts-*.js`), `remove-background`, `media-use` finds bgm/sfx/images | NO |
| Self-evaluation of the render | **YES, specific**: `timeline_view` on the *rendered output* at every cut ±1.5 s, ebur128, critic sub-agent, max 3 passes (`SKILL.md:91-103`) | **YES, generic**: `skills/meta/reviewer.md` per stage (schema + review_focus + CHAI critique) + `tools/analysis/visual_qa.py` (frames, caption occlusion, audio levels) + `final_review` artifact; gates fail-closed (`lib/checkpoint.py:486`) | YES for its own output: `lint`, `validate`, `check`, `inspect`, `snapshot` | NO built-in |
| Session memory | YES: `edit/project.md` appended per session (`SKILL.md:309-322`) + cached transcripts | **YES, stronger**: `checkpoint_<stage>.json` + history, artifacts, `events.jsonl`, live Backlot board (study card `openmontage-opencut.md`) | PART (`history/` in `~/.cache/hyperframes`) | NO |
| Agent-native (Claude Code skill) | **YES**: one SKILL.md, symlinked into `~/.claude/skills` (`README.md:57`) | **YES**: `CLAUDE.md`, `.claude/skills` (326 md), `skills/` (157 md); heavy context | YES: `npx skills add heygen-com/hyperframes`; OM carries `.agents/skills/hyperframes*` | YES (skill: `/home/dxb/tools/ECC/skills/remotion-video-creation/SKILL.md`, 29 rules, knowledge only) |
| Cost / keys | ElevenLabs key **required as shipped** (Scribe price not verified); **zero keys after the local-STT swap** (proven below); Anthropic tokens for the agent | Zero-key core works; paid providers optional; budget tracker (`tools/cost_tracker.py`) | Free local; `transcribe --engine heygen` and `publish`/cloud bill the HeyGen plan | Free tier vs paid Company License (see §3) |
| Licence | **MIT** (`LICENSE:1`) | **AGPL-3.0** (`LICENSE`, §13 network clause) | **Apache-2.0** (`package.json`) | **Remotion License** (source-available, two-tier) |

## 2. Is it double?

**Where they overlap**: both are LLM-driven inside Claude Code. Both cut silence, burn subtitles, grade, normalize loudness, and render overlays through the same two engines (HyperFrames, Remotion).

**Where each stands alone:**
- **VU alone:** edits **filmed speech** from a word-level verbatim transcript. That means filler and false-start removal on word boundaries, best-take selection across many takes, 30 ms fades at every cut, and a cut-boundary self-check on the rendered file. It also enforces 12 hard correctness rules (`SKILL.md:18-33`). OM has no equivalent tool. Its `silence_cutter` is dB-based and blind to words.
- **OM alone:** making video **without footage**: generation, TTS, music, stock and 3D. It also owns the **production governance** (gated stages, budget, decision log, the Backlot live board), **long→short batch** (clip-factory) and **reframe** (experimental), plus 11 other genres.
- **HyperFrames** is a **renderer plus an agent toolkit**, not an editor. Since 0.9.x it can also transcribe (whisper.cpp / Parakeet), run local TTS (Kokoro), remove backgrounds, detect cuts and measure faces. It still has no take editing, filler cut or EDL. Note: OM calls `npx hyperframes` unpinned (`hyperframes_compose.py:62-70`), and two versions sit in the npx cache (0.8.161 and 0.9.20).
- **Remotion** is a renderer only.

**Conclusion:** running VU and OM side by side as two systems would be double. VU's *editing core* is exactly the piece OM is missing. Our own plan already said so: Excel W104 "write 3 skills ourselves on OpenMontage's timeline". VU is that piece, already written, MIT, 5 files.

## 3. Remotion in our system

- **Where:** `/home/dxb/tools/OpenMontage/remotion-composer/` (RM 4.0.484, node_modules installed, `remotion` bin present) and `/home/dxb/tools/ECC/skills/remotion-video-creation/` (knowledge skill, no code).
- **Used by OM's pipelines? Yes, in production paths.**
  - `video_compose.py:9,75-89` has a `remotion_render` operation.
  - `documentary-montage.yaml:169` *requires* `render_runtime='remotion'` ("MUST stay 'remotion'").
  - `cinematic.yaml:263`, `hybrid.yaml:203` and `screen-demo.yaml:223` prefer it.
  - `talking-head.yaml:184` uses `remotion_caption_burn` (word-by-word captions are Remotion-only: `remotion_caption_burn.py:17-27`).
  - The zero-key demo our card recorded on 2026-08-19 rendered through this stack.
- **Licence:** the README warns *"requires obtaining a company license in some cases"* (`node_modules/remotion/README.md:58`). LICENSE.md is not shipped in node_modules. Upstream LICENSE.md (fetched today, lines 20-23) says the Free License covers an individual, a for-profit with **up to 3 employees**, a non-profit, or evaluation. Commercial use is allowed under it (line 27). Otherwise a Company License is needed (line 43). Prices are from our rival-intel 37 (line 39): Creators $25/mo per seat; Automators $0.01/render, $100/mo minimum. I did not re-check them on remotion.pro today.
- **Implication — name the conflict:** EK16 says "Remotion rejected (paid company licence)". But Remotion is **already inside OM**, which we adopted as the primary lane, and one pipeline cannot run without it. Either the EK16 rejection is stale, or the holding avoids documentary-montage and Remotion captions. The cost question is whether the holding stays inside "up to 3 employees". AI employees are not legal employees, but that is his money question, not a blocker. HyperFrames (Apache-2.0) covers most overlay work for free. Remotion-only today: word-by-word captions and the documentary end-tag stack.

## 4. Bake-off design, plus what I actually ran

### What I ran (free, local, everything written only under `{SCRATCH}/bench`)

1. **Test clip:** 3 Turkish phrases synthesized with the local Piper voice in the Speaches container (`127.0.0.1:8969`, `speaches-ai/piper-tr_TR-fahrettin-medium`). They were joined with 0.6 / 1.8 / 0.4 s silences over a `testsrc2` 1920×1080@30 picture, giving `bench/raw/C0001.mp4` (10.23 s). It contains a false start ("Bugün size, şey, bugün size…"), a filler ("Yani,") and a 1.6 s dead gap. No personal footage was used.
2. **Local STT instead of Scribe:** Speaches (faster-whisper 1.1.1, `Systran/faster-whisper-small`, the model our video-learn uses: `tools/video-learn/src/ingest.ts:145`) with `verbose_json` and `timestamp_granularities[]=word`. Output, word level:
   `Bugün 0.27-0.89 · size, 0.89-1.25 · şey, 1.43-1.61 · bugün 1.99-2.11 … anlatacağım. 2.89-3.43 · Yani, 5.07-5.73 · bu 6.07 … yönetiyor. 7.87-8.27 · Hemen 8.83 · başlayalım. 9.13-9.67`
   The lexical fillers *şey* and *yani* were kept.
3. **Adapter:** `bench/scripts/whisper_to_scribe.py` (27 lines) converts that JSON into Scribe shape: `words[]` with `type: word|spacing`, `text`, `start`, `end`, `speaker_id`. It merges the sub-word token `'in` into `holding'in`. Output: `19 words, 5 spacing entries`. **This is the only swap VU needs.** `pack_transcripts.py:88-119`, `timeline_view.py:118-160` and `render.py:418-431` read only those fields; only `transcribe.py` touches ElevenLabs.
4. **VU helpers, unmodified, system Python (numpy/PIL already present, nothing installed):**
   - `pack_transcripts.py` gave `3 phrases, 9.4s … 0.4 KB`: `[000.27-003.43] S0 Bugün size, şey, bugün size yeni sistemi anlatacağım.` / `[005.07-008.27] S0 Yani, bu sistem…` / `[008.83-009.67] S0 Hemen başlayalım.`
   - `timeline_view.py` source 0–4 s (`bench/raw/edit/verify/src_0-4.png`): filmstrip, waveform, word labels and a shaded silence. I looked at it, and the false start is plainly visible.
   - Hand-written EDL (the LLM's job): kept 1.94-3.51, 6.02-8.35 and 8.78-9.75, with grade `neutral_punch`. Then `render.py --preview --build-subtitles` gave `3 segment(s)`, `master SRT → master.srt (7 cues)`, `measured: I=-13.34 LUFS` → two-pass loudnorm, done in **1.9 s wall**. Output 1920×1080 h264+aac, **5.00 s**. ebur128 on the output: **I = −13.9 LUFS**. The output reads "Bugün size yeni sistemi anlatacağım. Bu sistem holding'in bütün işini tek yerden yönetiyor. Hemen başlayalım." — false start, filler and dead air are gone.
   - Self-check (`timeline_view` on the output, `verify/out_full.png`): continuous waveform, subtitles on every frame. One gap: the window must stop before EOF (`-ss 5.400` on a 5.0 s file failed with exit 234).
   - **Defect found:** Turkish uppercase. `render.py:507` uses `str.upper()`, which produces `BÜTÜN IŞINI` on screen (`verify/sub_frame.jpg`). A one-line locale-aware fix is needed before any Turkish delivery.
5. **OM on the same clip:** `silence_cutter` through OM's own venv, with `-I -B` and outputs in `{SCRATCH}` (`bench/scripts/om_silence.py`):
   - mark mode: `silence_segments: 3, speech_segments: 4, silence 3.13 s, speech 7.58 s`
   - remove mode: 10.23 → **7.69 s**, still containing "Bugün size, şey," and "Yani,".
   OM's tree was unchanged (`git status` diff empty).
6. **OM availability today** (`bench/scripts/om_status.py`, registry): 39 of 121 available. `transcriber` UNAVAILABLE, `face_tracker` UNAVAILABLE, `video_downloader` UNAVAILABLE. `silence_cutter`, `auto_reframe` (center-crop fallback), `subtitle_gen`, `color_grade`, `audio_enhance`, `audio_mixer`, `visual_qa`, `video_compose`, `hyperframes_compose`, `remotion_caption_burn`, `scene_detect` and `audio_energy` are AVAILABLE. So **OM's talking-head, clip-factory and podcast-repurpose cannot run their script stage here today.**

### Incident (must be known)

My first two STT calls asked Speaches for `deepdml/faster-whisper-large-v3-turbo-ct2`. The container (`dxb_speaches_local`, 0.8.3-**cpu**, memory limit 1,879,048,192 B) **died while loading it and auto-restarted** (`policy=unless-stopped`) at 17:23:22 and 17:23:36. Two more restarts followed at 17:25:53 and 17:26:19 on a 14.2 s file that was not mine. RestartCount is now 4, and it is serving again (my next call with `small` returned HTTP 200). **Lesson for the bench:** large models cannot run in the voice container. Large-v3 or whisperX must go on the GPU through the B33 gatekeeper, never through the shared Speaches.

### Not run, and why

- No OM full pipeline: `transcriber` needs `faster-whisper` installed into OM's venv, and installing is his word.
- No whisperX: not installed.
- No HF transcribe: whisper.cpp / Parakeet models are not installed. Running the CLI would download them and call telemetry.
- **Real hesitation sounds ("ııı", "ehm") were not tested.** Piper cannot utter them. VU's own anti-pattern says local Whisper "normalizes fillers" (`SKILL.md:330-331`). faster-whisper accepts `initial_prompt` (Speaches: `prompt`) to bias toward verbatim fillers. **Not verified.** It is the first thing the bake-off must measure.

### The bake-off (needs his yes before anything is installed)

- **Material:** one real filmed clip, 3–5 min, Turkish, one speaker, with natural ums, a false start and a retake, plus one 20–40 min long-form source for the Shorts leg. His own recording or a staff recording; footage choice is his.
- **Arm A — VU + local STT:** VU helpers with the adapter. STT runs on the GPU slot: faster-whisper large-v3 `word_timestamps=True`, `vad_filter=False`, filler prompt on and off, plus whisperX alignment as a second variant. The editing LLM is Claude Code with VU's SKILL.md. The Turkish `upper()` fix is applied.
- **Arm B — OM talking-head:** after `faster-whisper` (and mediapipe/opencv for the Shorts leg) go into OM's venv. Default director skills, `silence_cutter` + `subtitle_gen` / `remotion_caption_burn` + `color_grade`.
- **Shorts leg:** OM `clip-factory` (+`auto_reframe`) vs Arm A with the LLM picking ranges, plus a center/face crop, optionally vs OpenShorts (`mutonby/openshorts`) as a third arm.
- **Measured by script, same for both:**
  1. Fillers and false starts left: re-transcribe each output and count against a hand-labelled list.
  2. Words clipped mid-word at cuts.
  3. Pops: sample-jump at every cut boundary.
  4. ebur128 I / TP.
  5. Subtitle sync error (word start vs cue start) and Turkish casing.
  6. Face kept in frame in 9:16, % of sampled frames.
  7. Wall time, tokens, and human touches needed.
- **Judged by:** the CEO's eye, decisive, blind (files named X/Y, order randomized). Scripts only report numbers and do not crown a winner.

## 5. Recommendation for the holding

**Do not keep two systems. Graft VU's editing core into the OM lane, and decide by the bake-off, not by me.**

- **OM stays the factory** for B43 Media Studio and B28 agency client jobs: generated shots, governance, the live board, clip-factory batches, publishing packages. HyperFrames stays its free overlay engine. Remotion stays only where OM requires it (documentary-montage, word-by-word captions) until the licence question is answered.
- **VU's MIT helpers become OM's filmed-speech edit stage**, or a holding skill that writes OM-compatible artifacts:
  - `transcribe` swapped to local STT (the adapter is proven)
  - `pack_transcripts`
  - `timeline_view`
  - the EDL `render.py` with fades, subtitles last and loudnorm
  - the 12 hard rules and the multi-take brief

  This fills the exact hole our W104 plan meant to write ourselves. MIT code may be placed inside an AGPL project.
- **Long→short (B83 revenue H4 channels, H6 monthly short-clip package):** start from OM clip-factory. Promote `auto_reframe` into it, because its own skill says reframe is missing. VU contributes the word-boundary cut and the per-clip self-check. OpenShorts / W005 enter only if they beat it in the bench.
- **B84 web studio:** only HyperFrames matters there (hero/product loops). VU and OM are irrelevant.

**What needs his yes:**
1. Running the bake-off at all, and the test footage.
2. Installing `faster-whisper` (+ optionally whisperX, mediapipe, opencv) into `/home/dxb/tools/OpenMontage/.venv`.
3. Placing VU on the machine as a skill or grafting its helpers into OM.
4. A GPU slot for STT under the B33 gatekeeper.
5. Any Remotion Company License money, if the holding no longer fits "up to 3 employees".
6. The ElevenLabs Scribe key, only if the local STT loses the filler test (paid, money out).

## Evidence files (all in `{SCRATCH}/bench`)

- `raw/C0001.mp4` (test clip)
- `stt/default.json` (Speaches word JSON)
- `raw/edit/transcripts/C0001.json` (Scribe-shaped)
- `raw/edit/takes_packed.md`
- `raw/edit/edl.json`
- `raw/edit/master.srt`
- `raw/edit/preview.mp4` (VU output, 5.00 s)
- `raw/edit/verify/{src_0-4.png, out_full.png, sub_frame.jpg}`
- `om/marks.json`
- `om/silence_removed.mp4` (OM output, 7.69 s)
- `scripts/{whisper_to_scribe.py, om_silence.py, om_status.py}`
