# k1-g — second reading: InvokeAI, ACE-Step 1.5, OpenShorts (tab "Kasım 1 incelemeleri")

All three rows come from one video: "Replace: Suno AI, ChatGPT, Perplexity, Lovable, Manus, Opus Clip & more", The Next New Thing (Andrew Warner), 2026-10-06, 32:30, YouTube `GZtLsvklYBI`. It covers ten paid products and ten open-source replacements. None of the three rows has a twin in `twins.tsv`.

**Common to all three rows: what could not be read.** `$J/src/k1-2{1,2,3}.txt` are empty. The transcript the earlier readers used (`$J/transcripts/v8-GZtLsvklYBI.txt`, from the 2026-11-01 job's scratchpad) is no longer on disk. `~/.cache/link-watch/` holds only `v8-GZtLsvklYBI.audio.webm`, `.err` and `.lock`, with no `.vtt` or `.txt`. I did not transcribe it, by his order. The content of the video therefore comes from the two earlier readers' reports, which both read the full transcript: `.planning/research/watch-links/2026-11-01-gelir/readers/ses-fable.md` and `ses-opus.md`. The tools themselves were read fresh today with `gh api`: repo facts, README, releases and file tree.

**His note** is the same on all three rows: "Bizde Voicebox var galiba. Çok güçlü değil galiba. … Open Resource Repo kaynakları olarak bizim holdingde de bir bak bunlarla ilgili bir şeyler yapılmış mı?" It is about the voice part of the video (Voicebox and VoiceStudio), not about these three tools. He asks whether anything has already been done in the holding around them. For each row the answer is in "What we have".

---

## k1-21 (ses-invokeai) — InvokeAI: a local image and video studio with a paintable canvas and a gallery. A human surface over the same models our ComfyUI runs.

- **Opened:**
  - `$J/old/k1-21.json`
  - the earlier readers' reports `ses-fable.md` §3 row 5 and `ses-opus.md` §3
  - `gh api repos/invoke-ai/InvokeAI`, its README and its latest two releases (including the v7.0.0-beta.1 release notes, read whole)
  - inventory `$J/inv/k1.tsv`
  - the study cards `comfyui.md` and `flux-krea-dev.md` (by name only)
  - `B43.md` lines 66, 83, 175-176
  - `~/tools`, `~/.hermes`, `~/.claude/plugins`, `~/.local/share/dxb/*`
  - Transcript: not on disk (see the top of this file).
- **His note:** as quoted at the top. It is about voice, not this tool.
- **What is in it:**
  - The repo: `invoke-ai/InvokeAI`, Apache-2.0, 29,115★, last push 2026-11-18. Stable release v6.14.4 (2026-11-03); v7.0.0-beta.1 (2026-11-09).
  - A local web server with a React UI: Unified Canvas (in/outpaint, brush, layers), node workflows, boards and gallery, and a model manager.
  - Models in the README: SD1.5/SDXL/SD3.5, FLUX.1 dev/schnell/Kontext/Krea/Fill, FLUX.2 dev/Klein 4B/9B, Z-Image, Krea 2, Qwen Image/Edit, Ideogram 4, ERNIE-Image, and API-only Nano Banana, GPT Image and Wan.
  - v7 beta adds:
    - **MiniMax H3 video with audio (Ref2VA: up to 3 video and 9 image references)**, LTX-2.5 and Wan 2.2
    - FLUX.3 Klein and MOSS-Image
    - type-first control layers (Pose, Depth, Edges)
    - film grain, clarity and texture adjustments on layers
    - **semantic search over the gallery** ("red car at night", or find everything made from one reference image) and an **Image Map** that clusters all output by visual similarity
    - workflows with For loops
    - multi-user boards with Viewer, Contributor, Editor and Owner roles
    - live gallery updates for images made by external REST clients
    - `reserve_vram_gb`, SageAttention, int8 compute
  - v7 is beta and its database migration is one-way. The video said "Midjourney replacement" and that a GPU is needed (earlier readers).
- **What we have:**
  - **Image generation:** `~/tools/ComfyUI` (commit `8a33128`, 2026-08-29) with `~/tools/ComfyUI-models/flux` and `fluxvae`, driven by the studio's hands through its API (B43; RIFE interpolation at `B43.md:66`; study card `.planning/research/study-cards/comfyui.md`). MiniMax H3 runs on our card from the HF cache `models--Comfy-Org--MiniMax-H3` (B43 R19).
  - **The studio's surface:** two candidates were placed on 2026-11-17, Open-Generative-AI (`B43.md:175`) and Freefield (`B43.md:176`). B32 holds the V2 screens we would design ourselves.
  - InvokeAI itself is installed nowhere I looked: `~/tools`, `~/.local/share/dxb/tools`, `~/.hermes`, plugins. The HF cache has no Invoke models.
- **What it has that we do not:**
  - A paintable layered canvas where a human corrects one region (inpaint/outpaint, control layers). ComfyUI is a graph, not a retouch canvas.
  - Semantic search and an Image Map over everything the studio has made. Nothing in B43 indexes our own output by content.
  - Multi-user boards with roles, so a viewer can be given a read-only board.
  - All of this local, with no key, on H3 and the FLUX families that we already run. Against the two surface candidates already on the board:
    - Open-Generative-AI names no ComfyUI connection and runs the closed models through a paid MuAPI key.
    - Freefield's own table says its H3 and LTX video apps do not fit 16 GB.
  - Whether Invoke's H3 fits our 16 GB card is **not known**. Its notes give 16 GB only for LTX-2.5's prompt encoder.
- **Board:**
  - Row: **B43**, the line for the studio's surface (`B43.md:175-176`).
  - What stands there now: Open-Generative-AI and Freefield as surface candidates; ComfyUI by API for generation itself.
  - Relation: **second**, as a third surface candidate beside those two and not in ComfyUI's place.
  - Use: a human or retouch surface on the same card, for the steps where an agent's whole-image regeneration fails and one region must be repainted (for example around a real product photo kept exactly as photographed, the /kisayol house rule). Its gallery search would also be the studio's way to find past work by content.
  - First trial, at B43's rank, after Freefield and Open-Generative-AI are tried: stable v6.14.4 (or v7 once it leaves beta), in a fresh root, as a B33 bench guest. Run one FLUX image brief plus one inpaint fix on a real product photo, and one H3 Ref2VA clip in low-VRAM mode, beside the same briefs in ComfyUI and in Freefield. Measure VRAM peak, time and his eye. It decides whether a human canvas adds anything an agent-driven ComfyUI lacks.
  - What stops at the CEO: nothing. It is a free local install on his "evet" at the row's rank.
- **The old verdict ("Gerek yok — ComfyUI'nin yaptığını başka bir arayüzle yapıyor") partly holds.** For agent-driven generation, ComfyUI covers it. But since 2026-11-17 B43 has an open trial for the studio's surface, and Invoke v7 brings local H3 video, a retouch canvas and semantic search over our output, which neither surface candidate has.
- **Reader's first reading:** İkinci, as the third studio-surface candidate in B43, tried at its rank.

---

## k1-22 (ses-acestep) — ACE-Step 1.5: a local music engine (text to song, cover, repaint, stem extraction). Our default studio lane already wraps it; only the weights are missing.

- **Opened:**
  - `$J/old/k1-22.json`
  - `ses-fable.md` §3 row 6 and §6 S2; `ses-opus.md` §3
  - `gh api repos/ace-step/ACE-Step-1.5`, its README (read whole for capabilities, VRAM, licence) and its releases
  - `~/tools/OpenMontage/.claude/skills/acestep/SKILL.md` (first 80 lines)
  - `~/tools/OpenMontage/tools/audio/` (file list), the `comfyui_music.py` header and the `music_gen.py` header
  - `~/tools/ComfyUI/comfy_extras/nodes_ace.py`
  - the ComfyUI model folders
  - `B43.md` lines 21, 31, 33, 86, 102, 150
  - `scripts/governance/ceo-approvals.json`, entries `islamic-exclusions-sponsors-and-work-2026-10-18` and `solo-test-parked-and-music-at-first-client-2026-11-08`
  - Transcript: not on disk.
- **His note:** as quoted at the top. It is about voice.
- **What is in it:**
  - The repo: `ace-step/ACE-Step-1.5`, MIT for code and weights, 14,921★, last push 2026-11-08. Tagged release v0.1.8 of 2026-05-18. The XL (4B DiT) series came out 2026-04-02.
  - Audio from 10 s to 10 min. Lyrics in 50+ languages (vendor's claim).
  - Cover generation, repaint/edit of one section, **track separation (stem extraction)**, vocal-to-BGM, LRC lyric timestamps.
  - LoRA training: 8 songs, 1 h on a 12 GB 3090 (vendor).
  - A Gradio UI and a REST API (`acestep-api` on :8001). It runs in ComfyUI too.
  - On 16 GB it recommends 2B sft or XL turbo with the 1.7B planner LM, and the XL needs CPU offload below 20 GB. In the model table, "Extract" (stems) is ticked only for `xl-base`.
  - The vendor says "between Suno v4.5 and v5". The presenter in the video said it is not at that level (18:38, earlier readers).
- **What we have:**
  - **OpenMontage, our default studio lane (B43 R31, `~/tools/OpenMontage`, commit `1bab711` 2026-08-18), already carries ACE-Step:**
    - `.claude/skills/acestep/SKILL.md` and `tools/audio/music_gen.py`: ACE-Step 1.5 on RunPod serverless, which needs `RUNPOD_API_KEY` (paid).
    - `tools/audio/comfyui_music.py`: ACE-Step v1 through a local ComfyUI by default, and "other versions (e.g. ACE-Step 1.5)" through a custom workflow.
    - Beside them: `pixabay_music.py`, `freesound_music.py`, `music_library.py`, and the paid `suno_music.py`, `google_music.py`, `fal_elevenlabs_music.py`.
  - **Our ComfyUI already has native ACE-Step 1.5 nodes** (`comfy_extras/nodes_ace.py`: `TextEncodeAceStepAudio1.5`, `EmptyAceStep1.5LatentAudio`, `ReferenceAudio`).
  - **No ACE-Step weights are on disk:** `models/checkpoints` and `diffusion_models` are empty, and the HF cache has no ace entry.
  - The inventory's "only in the earlier watch-link reading" missed OpenMontage.
- **What it has that we do not:** a free local music engine. Today the studio has only library sources (Pixabay, Freesound) and paid engines wired. Two more points:
  - Stem extraction can **take music out of** a client's existing audio, for example a podcast with a music bed. This is a use that serves the music boundary rather than crosses it. It is a lead, not tested, and the ruling is his.
  - Repaint and LoRA training on a brand's own sound.
- **Two of his rulings on music, which disagree:**
  - 2026-10-18 (`islamic-exclusions-sponsors-and-work-2026-10-18`): "… kesin müzik bunlar falan istemiyorum."
  - 2026-11-08, later (`solo-test-parked-and-music-at-first-client-2026-11-08`, B43 R34 at `B43.md:86`): "Müşteri işlerinde müzik olup olmayacağı o zaman müşteri gelince bakarız. … Onu bir daha, bunu bir daha sorma."
  - By the authority order the later ruling governs client work: music is not excluded, it is decided at the first client and is not asked before. The lead should know about this conflict. Music in the holding's own channels was not ruled on 8 Nov, so the 18 Oct exclusion still stands there.
- **Board:**
  - Row: **B43 R34 · Music** (`B43.md:86`), with the licence line (08) at `B43.md:150` ("a licence line for every engine, checkpoint and music source") and the halal screen R41 (`B43.md:102`, which already names music among the assets it screens).
  - What stands there now: R34 says only "decided at the first client". OpenMontage's music tools are in the default lane with no local engine weights.
  - Relation: **new** (no local music engine is set up). The wrapper is already in place, so it is mostly a matter of putting weights in place.
  - Use: when the first client's job comes and he rules music in, the studio generates an original, licence-clean bed on our own card through ComfyUI's native nodes (`comfyui_music.py` with a 1.5 workflow). It does not go through RunPod. Pixabay and Freesound stay the fallback, and Suno and ElevenLabs music are the paid twins. If he rules music out, the stem-extraction leg can still be tried to deliver music-free versions of client footage.
  - First trial, only at R34's moment and not before: download the 2B turbo plus the 0.6B LM (about 5 GB), run it as a B33 bench guest with one 30 s instrumental bed for that client's film, next to a Pixabay track. Measure VRAM, time and his ear. MIT gives the licence line a commercial right.
  - What stops at the CEO: the Islamic ruling on music for that client job (his, at the first client, not asked before). Nothing else; it is free and local.
- **The old verdict ("Gerek yok — 18 Ekim hükmü: müzik dışarıda") partly holds.** Nothing should be installed now, but the reason is out of date: the 8 Nov ruling moved music in client work to "at the first client", and the engine is already half-wired in OpenMontage and ComfyUI.
- **Reader's first reading:** Dene, at R34's moment (the first client), not before. Not raised with him now.

---

## k1-23 (ses-openshorts) — OpenShorts: a self-hosted long-video-to-vertical-clips factory with an MCP server. B28 already names it; it is a second beside OpenMontage's clip-factory.

- **Opened:**
  - `$J/old/k1-23.json`
  - `ses-fable.md` §3 row 7 and §5; `ses-opus.md` §3 and §5
  - `gh api repos/mutonby/openshorts` (facts, README read for features, costs and requirements), the file tree, `cloud/LICENSE`, `NOTICE` and the last three commits
  - `~/tools/OpenMontage/pipeline_defs/clip-factory.yaml` (stages and tools) and the `tools/video` list (`auto_reframe.py`, `face_tracker.py`, `subtitle_gen.py`, `remotion_caption_burn.py`)
  - `B28.md:30-50`, `B83.md` lines 28, 30, 56
  - `B43.md:83` (R31) and the archived `B43-full-record-to-2026-11-17.md:93`
  - `REVENUE-OPPORTUNITIES.md:213`
  - the 2026-11-16 tab's `rows/all.jsonl` and `plan.jsonl` (w091)
  - Transcript: not on disk.
- **His note:** as quoted at the top. It is about voice.
- **What is in it:**
  - The repo: `mutonby/openshorts`, 8,951★, last push 2026-11-18 with active daily commits. Core is MIT. The `cloud/` folder (Autopilot, billing, hosted features) is under a separate "OpenShorts Commercial License"; this is a fact only, not a blocker.
  - Self-hosted with Docker on 8 GB+ RAM, NVIDIA optional. README: 5-8 min per 8-min video on CPU. The "about 50 s" figure is on **their cloud GPU**; the earlier reader wrote it as if it were a local figure.
  - It picks 3-15 moments of 15-60 s with a virality score using Gemini 3.1 Flash-Lite, **or a local OpenAI-compatible LLM via `LLM_BASE_URL`**.
  - Per-scene 9:16 reframe: TRACK (MediaPipe + YOLOv8 face), GENERAL (blurred background), SPLIT (two speakers stacked) and SCREENCAST.
  - Captions with faster-whisper or Parakeet, word-level, several styles. A word-level clip editor, hook text overlays and a thumbnail studio.
  - Dubbing only with your own ElevenLabs key. "AI Shorts" UGC actors through fal.ai ($0.65-2 per video).
  - Social posting through Upload-Post: 10 free uploads a month, then pay-per-use. Autopilot is cloud-only.
  - **MCP server (`mcp_server.py`, `mcp_stdio.py`), a REST API, and a Claude Code skill and plugin in the repo (`skills/openshorts/`).**
  - The repo also ships n8n examples, which do not apply to us.
- **What we have:**
  - **OpenMontage `clip-factory` pipeline** (`~/tools/OpenMontage/pipeline_defs/clip-factory.yaml`, v2.0, "stability: beta"): long-form to N short clips, run by an executive-producer agent through stages from idea to publish. It has `auto_reframe.py`, `face_tracker.py`, `subtitle_gen.py` and `remotion_caption_burn.py`.
    - OpenMontage is the default lane (B43 R31, `B43.md:83`).
    - Its `projects/` holds only `backlot-demo-run` and `demos`, so clip-factory was never run here.
  - video-use explicitly "does not turn long video into Shorts, reframe to vertical" (`B43.md:83`).
  - The 14 Oct pick SamurAIGPT/AI-Youtube-Shorts-Generator (W005) is installed nowhere.
  - **Where OpenShorts already stands:**
    - `B28.md:39`: "H6 the studio agency … the monthly short-clip package cut from a client's long video (OpenShorts)"
    - `REVENUE-OPPORTUNITIES.md:213`: "Uzun videodan aylık kısa paket … (OpenShorts)"
    - the archived B43 record line 93: "(OpenMontage clip-factory, or OpenShorts on B83's H4/H6 line)"
    - The current `B43.md` no longer names it.
- **What it has that we do not:** a finished, tested clip product. It has a large test suite, a per-scene layout picker with SPLIT and SCREENCAST modes, a word-level clip editor, hook overlays, a thumbnail studio, a week scheduler and post analytics. It also exposes an **MCP endpoint that Hamza or a session can call**. OpenMontage's clip-factory is a beta agent pipeline that has never been run here.
- **What the current placement lacks:** B28:39 names the tool but not its counterpart (OpenMontage clip-factory), not the trial, and not what stops at him. The second use for the holding's own channels (B83 H4: long holding videos into shorts) is not written. B43, where production sits, no longer carries the line.
- **Board:**
  - Row: **B28** (H6, the agency's monthly short-clip package, `B28.md:39`). Second row **B83 H4** (the holding's own channels, `B83.md:28`), which needs the same cutter on its own long videos.
  - What stands there now: the tool's name only. For the same job, OpenMontage clip-factory in the default lane (B43 R31).
  - Relation: **second**, beside OpenMontage clip-factory. Both are tried, the winner becomes default and the other the fallback.
  - Use: client long video (webinar or podcast) in; 3-15 vertical clips with captions and hooks out, to his eye or the client's review. The MCP endpoint is the call from the holding's own engine, so no second job runtime is needed.
    - Moment picking runs on our own model through `LLM_BASE_URL`: our LiteLLM, or B34's local worker. The Gemini key in `.env.daemon` is the paid or free twin.
    - It is a B33 bench guest for the GPU decode and render.
    - B28's weekly loop (research → decode → produce → Monday winner) feeds the moment criteria.
  - First trial, at B28's rank: one long video of our own (no client footage), through OpenShorts self-hosted (Docker, GPU) and through OpenMontage clip-factory. Measure:
    - his eye on moment choice
    - the face kept in frame across clips
    - Turkish caption accuracy and casing (the casing gap is already noted for video-use at `B43.md:164`)
    - wall time and VRAM peak on the 16 GB card
    - The winner is written as default in B28 and B43.
  - What stops at the CEO:
    - an Upload-Post account and connecting any social account (identity)
    - client footage used under a client agreement (contract)
    - ElevenLabs dubbing (money; and his K8 voice ruling, asked at its setup per `B83.md:56`)
    - fal.ai AI-actor Shorts (money; and B43's UGC testimony rule)
  - Self-hosted clipping and captions alone stop at nothing.
- **The old verdict ("Dene", H6 · B28 · B43, "first trial on our own long video, €0; auto-posting stops at the CEO") holds.** Two corrections: the "50 s" is their cloud GPU, not ours; and the trial must run beside OpenMontage clip-factory, which already stands in our default lane for the same job.
- **Reader's first reading:** İkinci, beside OpenMontage clip-factory in B28 (H6), with B83 H4 as the second user.
