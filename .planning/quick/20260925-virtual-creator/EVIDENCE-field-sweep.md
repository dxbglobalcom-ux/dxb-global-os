# Virtual-creator skill field sweep (2026-09-25)

Question: is there a much better AI-influencer, character-consistency or AI-video skill set than the two already measured, `higgsfield-ai/skills` (★1139) and `OSideMedia/higgsfield-ai-prompt-skill` (★636)? And what would each one add for a studio that runs MiniMax H3 locally and uses the Higgsfield MCP as an external route?
Method: GitHub REST API through authenticated `gh api` (5000/h, so nothing was rationed), raw file reads with `curl`, and WebSearch/WebFetch for the two off-GitHub items. Nothing was installed or run.
Labels: **R** = measured this session, with the URL or command. **U** = could not measure.
Staleness is judged by the date the *content* last changed (from the commit log), not by the push date.

## §0 — GitHub counters measured by the chief engineer (Fable 5.1) via the REST search API, 2026-09-25 ~22:50 (R)

| repo | stars | forks | pushed | licence |
|---|---|---|---|---|
| higgsfield-ai/skills | 1,139 | 224 | 2026-09-14 | MIT |
| OSideMedia/higgsfield-ai-prompt-skill | 636 | 112 | 2026-08-23 | MIT |
| 0xAnni/ugc-creator | 3 | 1 | 2026-07-12 | MIT |
| beshuaxian/higgsfield-seedance2-jineng | 863 | 163 | 2026-04-09 | none |
| AKCodez/higgsfield-claude-skills | 378 | 65 | 2026-04-13 | — |
| rediumvex/ai-video-generator-claude | 384 | 50 | 2026-08-11 | — |
| machina-exm/film-studio-skills | 140 | 23 | 2026-08-14 | none |

Command: `curl -s -H "Accept: application/vnd.github+json" "https://api.github.com/search/repositories?q=<query>&per_page=4"`; the reader's own measurements below re-checked the same figures with `gh api` where stated.

## 0. Baseline: what the two measured packs already cover (R, file trees only)
- `higgsfield-ai/skills` (★1139, pushed 2026-09-14, MIT) has `higgsfield-soul-id/`, which trains a **Soul Character** from 5–20 face photos, needs a paid plan, and returns a `reference_id` that is then used as `--soul-id`. This is a trained identity model. It also has `higgsfield-generate/references/marketing-avatars.md`. https://github.com/higgsfield-ai/skills
- `OSideMedia/higgsfield-ai-prompt-skill` (★636, pushed 2026-08-23, MIT) has `skills/higgsfield-soul`, `skills/higgsfield-character-design`, `templates/seedance/omni-reference-2-5.md`, `multi-character-anchor.md` and `single-character-position.md`. That is Seedance 2.5 omni-reference plus character anchors.
- **Neither pack has anything for MiniMax H3.**

## 1. The named candidates (all R)

| Repo | ★ | Forks | Content last changed | License | What it is | Engine | Identity lock | Stale? | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 0xAnni/ugc-creator | 3 | 1 | 2026-07-12 (2 commits) | MIT | Skill with 7 reference files, a JSON schema and one Python tool (fal.ai) | Any image model; video on Kling 3.0 through fal.ai | Card → face pack → reference at generation → Kling `elements` → LoRA | No (Kling v3) | **FORK-AFTER-AUDIT** |
| AKCodez/higgsfield-claude-skills | 378 | 65 | 2026-04-13 (3 commits) | none | 15 prompt skills that are **byte-identical copies** of beshuaxian, plus 3 Playwright + 1 prompt-only (ugc-hot-girl; rows 57–59) UI-automation skills | Higgsfield web UI: Soul 2.0 and Seedance 2.0 | Prompt only | **Yes** (Seedance 2.0; hard-coded UI selectors) | **SKIP** |
| rediumvex/ai-video-generator-claude | 384 | 50 | 2026-04-13 (the later commits only change follower counts and links) | MIT | 10 prompt skills | Seedance 2.0 on Higgsfield | Prompt plus an `@image1` material reference | **Yes** | **SKIP** |
| beshuaxian/higgsfield-seedance2-jineng | 863 | 163 | 2026-04-09 (6 commits, all that day) | none | 15 genre prompt encyclopedias (42–95 KB each) in English and Chinese | Seedance 2.0 on Higgsfield | None: a grep finds only "consistent lighting/feed" | **Yes** | **SKIP** |
| machina-exm/film-studio-skills | 140 | 23 | 2026-08-14 (2 commits) | **none** | 7 process skills (prompt method, no tools) | Engine-agnostic: `setup` says "never suggest or name a model" | Verbatim descriptor, a 5-view reference sheet and a **10/10 stress-test gate** | No | **TAKE-IDEA** (no license, so it cannot be forked) |
| PicsArt gen-ai-persona-creation | 5 (repo) | 2 | 2026-08-28 | MIT | Tool skill that drives Picsart's `gen-ai` CLI and spends credits | gemini-3.1-flash-image, grok-imagine, flux-2-max; video on seedance-2.0 | Frozen appearance block, a 2×2 four-angle casting card and i2i `-i` | **Video part stale** (seedance-2.0) | **TAKE-IDEA** |
| Mark Tilbury pack (Dropbox) | n/a | n/a | files dated 2026-09-10/20 | not stated | 4 single-file prompt-method skills, 1 PDF and 2 docx files | Soul 2.0 and Soul Cinema for stills; **Seedance 2.5** for video | Face anchor, 3-panel sheet, `@image1`/`@image2`/`@audio1` references and a RELIGHT block | No | **TAKE-IDEA** (no license) |

### 1.1 0xAnni/ugc-creator (R): https://github.com/0xAnni/ugc-creator (every file read)
- **Size:** 14 files, 25 KB in the repo. `SKILL.md` is 10,152 B. The only code is `scripts/generate_video.py` (7,386 B).
- **Actor card** (`assets/actor-card.schema.json`, `additionalProperties:false`):
  - Required fields: `actor_id` (pattern `^[a-z0-9_]+$`, versioned, e.g. `lila_v1`), `name`, `face`, `eyes` (must name a deliberate asymmetry, e.g. "left eye 2% smaller"), `skin_tone_hex` (pattern `^#?[0-9A-Fa-f]{6}$`, "never a phrase"), `hair` (colour, texture, length and part), `jawline` (asymmetry again), `distinguishing_marks` (each pinned to a place on the body), `prompt_seed` (integer).
  - Optional fields: `origin`, `age_range` (kept tight, e.g. "21-23"), `skin_notes`, `outfit_variations[]`, `voice_notes`, `negative_defaults[]`.
  - A worked example is in `assets/actors/lila.json`.
- **The 6 prompt layers, in this fixed order** (`references/prompt-layers.md`):
  1. Character lock: every card field copied verbatim, always first.
  2. Scenario: the action plus its physical consequences.
  3. Environment: the place plus the light it implies.
  4. Camera: one of 4 iPhone profiles (selfie front, rear "a friend filmed me", mirror, overhead flatlay).
  5. Realism: all 10 imperfection anchors (pores, stray hairs, under-eye, uneven tone, fabric, clutter, lighting flaw, sensor artefacts, nails, jewellery physics).
  6. Negative prompt, emitted separately.
  - Batch rule: layer 1 is byte-identical in every shot and only layers 2–4 change.
  - It also defines 7 shot types: testimonial, lifestyle, unboxing, GRWM, product demo, haul, day-in-the-life.
- **The reference-lock ladder** (`references/reference-lock.md`):
  - Tier 0: the card alone.
  - Tier 1: a face pack of 6 canonical shots generated *from* the card (frontal, 3/4 left, 3/4 right, profile, laughing, full body). It is versioned with the card and treated as "a build output, not a source".
  - Tier 2, still images: Midjourney `--cref` with `--cw 60-100`; PuLID / InstantID / IP-Adapter FaceID on Flux or SDXL at identity weight **0.6–0.8** ("below 0.6 she drifts, above ~0.85 the reference bulldozes pose/light"); a gpt-image edit using the frontal as input.
  - Tier 3, video: Kling v3 `elements`, i.e. `frontal_image_url` plus `reference_image_urls`, addressed in the prompt as `@Element1`.
  - Tier 4: a LoRA trained on 20–40 face-pack-derived images, captioned with the card's own values, trained "on fal, Replicate, or locally".
  - Rule: if a reference disagrees with the card, regenerate the reference from the card.
- **Engines and APIs:**
  - The only tool call is fal.ai, slug `fal-ai/kling-video/v3/standard/image-to-video`.
  - It needs `FAL_KEY` and `pip install fal-client`, and it uploads local files to fal.
  - Price as stated in the file: ~$0.084/s with audio off and ~$0.126/s with audio on.
  - There is nothing for Higgsfield, Seedance or H3.
- **What it adds beyond the baseline:** it is the only candidate that treats identity as **typed data with a schema**, and it has the most complete lock ladder. The card maps directly into H3 Ref2VA `<Subject 1>` definitions and into Soul ID captions.
- **Risk:** the fal.ai script would open a third paid route. Keep the schema and the references; replace or drop the script.

### 1.2 AKCodez/higgsfield-claude-skills (R): https://github.com/AKCodez/higgsfield-claude-skills
- **Duplicate finding:** all 15 numbered `SKILL.md` blobs have the **same git blob SHA** as `beshuaxian/.../skills/NN-*/SKILL.md`. Example: `01-cinematic` is `cbd8ceb04f` in both, and the same holds for all 15. The ★378 buys only 4 unique files.
- **The 4 unique files:**
  - `ugc-hot-girl` (9,716 B): prompt-only, 8 ordered prompt parts, for Soul 2.0 or Nano Banana Pro.
  - `higgsfield-image-auto`, `seedance-auto-generate` and `ugc-video-auto`: Playwright clicks on `higgsfield.ai/image/soul-v2` and `/create/video?model=seedance_2_0`, with hard-coded element refs such as `hf:tour-image-prompt`.
- The official Higgsfield MCP/CLI replaces all of this UI scraping.

### 1.3 rediumvex/ai-video-generator-claude (R): https://github.com/rediumvex/ai-video-generator-claude
- 10 skills of 11–29 KB each.
- `09-ai-avatar` has an intake (style lane, skin, hair, wardrobe) and 10 rules ("eyes anchor everything", asymmetry, "commit to a style lane").
- Identity is prompt-only, plus a "Material references: @image1 for subject face" line in `03-personal-brand`.
- Commit log: the last content commit is 2026-04-13 ("Quality audit…"). The 2026-06-11 and 2026-08-11 commits only change links and the follower count.

### 1.4 beshuaxian/higgsfield-seedance2-jineng (R): https://github.com/beshuaxian/higgsfield-seedance2-jineng
- CHANGELOG has a single 1.0.0 dated 2026-04-09, and the README ships in 10 languages.
- The skills are genre encyclopedias: `11-social-hook` has 25+ hook patterns and platform playbooks.
- There is no character-lock content, the target is Seedance 2.0, and there is no license.

### 1.5 machina-exm/film-studio-skills (R): https://github.com/machina-exm/film-studio-skills
- The chain is `setup → studio-init → film-breakdown → reference-board → asset-passport → stress-test → shot-prompt`. Each SKILL.md is 2.6–5.3 KB.
- **asset-passport:**
  - One asset per `@tag`, and every state variant is its own asset (`@cal`, `@cal_wet`, `@cal_blood`).
  - A canonical descriptor that is "never shortened".
  - A grey-background reference sheet in 5 views (front, 3/4, profile, back, close).
  - A registry with the columns `tag · type · version · seed file · scenes · status`, where status is `draft` until the stress test passes.
- **stress-test:**
  - A matrix of angles, shot sizes, the real scene lighting and a two-shot with every co-star, all run as cheap stills.
  - **Characters must pass 10 out of 10**, or they stay `draft`.
  - "Generation for a scene starts only when every registry row it touches reads locked."
- **shot-prompt:** 15 fixed blocks with no negative prompt (every prohibition is rewritten as what IS in frame). It changes one line per attempt, logs every attempt, and has a cap: "not landed by attempt 15 → simpler shot".
- **What it adds:** a quality gate before spending, which neither baseline pack has. It is engine-agnostic, so it fits H3 and Higgsfield equally.
- **Limit:** it has no license, so only the ideas can be taken.

### 1.6 PicsArt "gen-ai-persona-creation" (R): https://github.com/PicsArt/gen-ai-skills/blob/main/skills/gen-ai-persona-creation/SKILL.md
- **Where it lives:** org `PicsArt` (36 public repos), repo `gen-ai-skills` (★5, MIT, created 2026-05-06). The file is 21,955 B.
- **skills.sh listing:** https://skills.sh/picsart/gen-ai-skills/gen-ai-persona-creation shows "Installs 293", "First Seen May 26, 2026", and audits (Gen Agent Trust Hub, Socket, Snyk) "Pass".
- **Pipeline:**
  - Frozen appearance block ("identity DNA only") written to `persona.md`.
  - One call makes a 9:16 **2×2 casting card**: front, 3/4, profile and 3/4-back, on identical grey, in identical wardrobe and light.
  - An optional reel: first a reel-hero still from gemini i2i, then **seedance-2.0** i2v with `--generate-audio`.
  - Captions come last.
  - Cost: ~3 credits lean, ~14 credits with a reel. It shows a plan before spending anything.
- **The skill's own "verified" admissions, useful as field data:**
  - "Seedance's `imageUrls` behaves as first frame, not pure char-ref".
  - Start-frame-only i2v models (it names `hailuo-2.3-fast`, `wan-2.7-i2v` and others) "drift across the clip".
  - "Kling element / Veo Ingredients … aren't surfaced in the CLI".
- **What it adds:** the 2×2 casting-card prompt, a one-question intake, and an IP-safe wording rule (never name studios or franchises in a prompt).

### 1.7 Mark Tilbury pack (R, with caveats)
- **Where it comes from:**
  - The Dropbox folder link comes from the video description as reprinted at https://www.pcn-channel.com/i-tried-the-laziest-way-to-make-money-with-ai/ (dated 2026-09-22).
  - It downloaded as a zip of 659,081 B, fetched with `curl …&dl=1`.
- **Contents:**
  - `README.txt` (615 B).
  - `AI Influencer Cheat Sheet.pdf` (286,584 B; 1,085 text lines; 10 steps plus appendices A–D).
  - `Amos_prompts.docx` (320,339 B).
  - `VIVIENNE_video_prompts_master.docx` (23,617 B).
  - `skills/`, holding 4 zips, each a single `SKILL.md` with no scripts or tools:
    - `content-engine` (14,602 B): research → ideas → scripts.
    - `digital-product` (16,263 B): pitches 3 products → spec → build → audit.
    - `charsheet-soul` (13,783 B).
    - `ugc-influencer-video` (11,881 B).
- **Who wrote the two identity skills:** the PDF says `charsheet-soul` and `ugc-influencer-video` were "Developed by one of Higgsfield's in-house creatives for this collaboration".
- **The 7 names the CEO's other AI gave** (base-character-prompt, scene-still-prompt, silent-scene-prompt, talking-scene-prompt, voice-prompt, plus content-engine and digital-product):
  - GitHub repository search returned 0 and code search returned 0.
  - `grep -ci` counts were 0 in the PDF and 0 in both docx files.
  - Only content-engine and digital-product exist under those names. The other five match *sections* inside the two Higgsfield skills: the 2-pass character sheet; "Companion stills"; "Text-over b-roll"; the talking/interview formats; "Voice prompts".
- **charsheet-soul:**
  - Pass 1 is a Soul Cinema tight portrait, "the anchor; never regenerated". Pass 2 is Soul 2.0 3-panel cards that reuse the same anchors verbatim.
  - It lists 10 "proven Soul 2.0 fixes":
    1. Prompts over ~3,500 characters get their tail cut silently.
    2. Negations are ignored, so describe things positively.
    3. `TURTLENECK` works where "high neckline" does not.
    4. "Caucasian" is ignored; write "EUROPEAN … FAIR LIGHT PALE skin".
    5. Force the age explicitly.
    6. State strong features 3 times.
    7. Give jewellery by count.
    8. Lock the outfit 3 times.
    9. Specify eyes that do not look like contact lenses.
    10. Use a textured backdrop so the figure does not read as a "sticker".
  - Also a LEAN block for men ("Soul fattens men").
- **ugc-influencer-video** (targets **Seedance 2.5**):
  - Fixed section order: TOP PRIORITY → REFERENCE KEY (`@image1` character sheet "identity reference ONLY … NEVER its lighting", `@image2` location still reused per place, `@audio1` voice "the ONLY spoken content") → **RELIGHT** (key, fill, colour bounce, contact shadows; "never a cut-out") → … → SHOT BREAKDOWN.
  - A failure→fix table, e.g. face drift is fixed with "face and identity match @image1 100% for the entire take" plus identical anchor wording.
  - Voice is locked by one seed audio file reused for everything.
- **What it adds:** Higgsfield house knowledge for Seedance 2.5 that neither baseline file tree shows (RELIGHT, the audio lock, the Soul failure list).
- **Limits:** it has no license, and a Dropbox folder has no version history.
- **Disclosure:** the PDF says "tell people it's AI. In the bio, and with the platform's AI creator setting."

## 2. Sweep: the top 8 not already named (R; searched 2026-09-25, sorted by stars)
Search terms: `ai influencer skill` (85 hits), `virtual influencer claude` (**0**), `character consistency skill` (31), `ugc creator skill` (13), `agent skills video generation` (160), plus `higgsfield`, `seedance 2.5 skill`, `hailuo skill` and `minimax h3`.
The table is the top 8 by stars across this wider sweep, after dropping off-topic hits. If you run only the five brief terms, the top 8 is dominated by vendor-API wrappers or Seedance 2.0 packs: Yacey/agnes-ai-generation-skill ★417, BarneyD66/clipmivo-tools ★193, cosmicstack-labs/lazy-frames ★161, zhanghaonan777/Seedance2-skill ★128 (Seedance 2.0, 2026-02-21), black-forest-labs/skills ★120 (official FLUX).
Every repo in sections 2 and 3 lives at `https://github.com/<owner>/<repo>`.
**Filtered out as off-topic:** `aaron-he-zhu/aaron-marketing-skills` ★2839 (influencer *marketing*), `Affitor/affiliate-skills` ★676, `zarazhangrui/follow-builders` ★6793 (a news digest).

| # | Repo | ★ | Last push | License | One line | Read depth |
|---|---|---|---|---|---|---|
| 1 | SamurAIGPT/Generative-Media-Skills | 4325 | 2026-09-08 | MIT | 60 library skills, all wrappers around the paid **muapi.ai** API. `ugc-video-factory` = person+product photo → Nano-Banana Pro Edit → `seedance-2-vip` i2v (Seedance 2.0). Identity = reference image only. **SKIP** | Tree plus one skill |
| 2 | LearnPrompt/awesome-seedance | 1396 | 2026-09-25 | MIT | Evidence-led Seedance 2.5/2.0 library (463 cases, 264 retest runs, 60 skills). The `character-reference-lock.md` template has an "inherit-nothing-else clause"; the UGC review template uses 2 locks (person and product). **TAKE-IDEA** | README |
| 3 | lixiaoxiao9888-create/manju-laoli-skill | 874 | 2026-09-20 | MIT | Chinese short-drama suite. The description claims a Seedance 2.5 / 2.0 / **MiniMax H3** branch ("H3 auto-converts to Ref2VA six-section"), a "4 View asset lock" and an asset ledger. **Lead; content not read** | Description |
| 4 | smixs/visual-skills | 433 | 2026-09-16 | CC-BY-4.0 | Director skills plus exact prompt syntax for Seedance 2.5, Kling 3.0 Omni, Veo 3.1, Nano Banana 2 and GPT Image 2.5. Has `image/references/characters.md`. **Lead** | Tree |
| 5 | cclank/lanshu-awesome-ai-video-kit | 405 | 2026-06-01 | MIT | Chinese kit: 411 prompts, 15 models, 7 Claude skills. **Lead** | Description |
| 6 | liyue-aigc/seedance-2-5-video-director | 391 | 2026-08-26 | MIT | Dreamina Seedance 2.5 director with "character and wardrobe locking". Rule: a character reference = the whole visible character, "do not silently reduce to face identity". It never submits paid jobs. **TAKE-IDEA** | SKILL.md grep |
| 7 | SamurAIGPT/AI-Influencer-Generator | 313 | 2026-08-02 | MIT | A Colab notebook (Stable Diffusion, gTTS, SadTalker), not a skill. **SKIP** | README |
| 8 | nutllwhy/seedance-tvc-director | 290 | 2026-09-03 | MIT | Seedance 2.5 director for 15 s / 30 s commercials. **Lead** | Description |

Low-star but directly on-topic:
- `nigo-studio/ai-film-skills` ★13 (MIT, Seedance 2.5). Its `character-consistency` skill works close-up lock → 3-panel sheet → identity reference on every generation, the same shape as charsheet-soul.
- `joebenscoter86/higgsfield-ugc-workflow` ★3 (MIT). It has 8 skill folders (`ugc-ad` plus 7), and they are **not** Tilbury's names.

## 3. The local-engine layer: MiniMax H3 (R). None of the named candidates targets it.
- **Official: `MiniMax-AI/MiniMax-H3` ★9208** (forks 677, pushed 2026-08-15). https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills
  - It ships `skills/h3-prompt-writing/`: SKILL.md 2,623 B, `references/base-en.txt` 15,773 B, `references/ref-en.txt` 23,553 B. The last skills commit is 2026-08-11. There are also **8 style skills**.
  - **5 modes:** T2VA, I2VA, FL2VA, L2VA, Ref2VA.
  - **Ref2VA** (reference-to-video): six sections in a fixed order (`subject_definitions`, `summary`, `retention_analysis`, `detailed_description`, `overall_soundscape`, `non_diegetic_music`) and four labels (`<Subject N>`, `<Picture N>`, `<Video N>`, `<Audio N>`). `retention_analysis` records whether each subject is fully preserved, partially preserved, transferred or reused. Clips are 4–15 s.
  - **This Ref2VA contract is H3's own identity-lock channel.**
  - The official skills README says the product-ad skill is "Not for KOC talking-head ads". **No official influencer or talking-head skill exists.**
  - **License:** the GitHub API reports none. The README says the "MiniMax H3 Community License Agreement" on Hugging Face (not read → U).
  - **Verdict: FORK-AFTER-AUDIT.** It is text only and is the engine's own contract; the license is the audit item.
- **Community H3 skills:**
  - `q2522879285-source/minimax-h3-prompting-skill-public` ★13, MIT, 2026-08-13. `validated-findings.md` (36,770 B) holds per-clip inspected results: identity stability, copy accuracy, loudness.
  - `ye4wzp/minimax-h3-prompt-skill` ★11, NOASSERTION. It carries the official guides verbatim, with credit to MiniMax.
  - `ayase0307/h3-video-prompting` ★1, MIT, 2026-09-17. It has `skin-realism-block.md`, `scenarios-people.md` and `failure-triage.md`.
  - **Verdict for all three: TAKE-IDEA.**
- **Trained identity on the local engine: `shootthesound/Fizgig` ★421** (Apache-2.0, pushed 2026-09-23). https://github.com/shootthesound/Fizgig
  - It is a LoRA / LoKR / fine-tune studio for Klein 9B, Krea 2 and **MiniMax H3**, including sound and voice.
  - v6.0.1 turns a photo folder into "RefMods" for the ComfyUI-MiniMaxH3Mod nodes.
  - Repair Studio has a ref2va `<Picture 1>` mode.
  - Its likeness gains ("five likeness points", "×3 lifted detail and likeness") are **the README's own claims** (U).
  - It is a tool, not a Claude skill. It is the only local equivalent to Higgsfield Soul ID found. **Verdict: FORK-AFTER-AUDIT** (trial before any adoption).

## 4. Ranked answer: are there much better ones? (from the numbers)
**By stars, in the Higgsfield / influencer niche:**
- official 1139
- beshuaxian 863: stale, no license, zero identity content
- OSideMedia 636
- rediumvex 384: content stale since 2026-04-13
- AKCodez 378: 15 of 19 skills are SHA-identical copies; the rest is stale UI automation
- machina 140
- PicsArt 5 (293 installs on skills.sh)
- ugc-creator 3
- Tilbury: no stars (Dropbox)

Only one candidate out-stars OSideMedia (beshuaxian), and none out-stars the official pack. That one is stale and carries no identity-lock content.

**By identity-lock depth** (mechanisms counted from the files):
1. ugc-creator: typed card + face pack + 4 reference methods + Kling elements + LoRA.
2. machina: descriptor + 5-view sheet + registry + **10/10 gate**.
3. Tilbury in-house pair: face anchor + 3-panel sheet + `@image1`/`@image2`/`@audio1` + RELIGHT + a Soul failure list.
4. PicsArt: frozen block + 2×2 card + i2i.
5. rediumvex, beshuaxian, AKCodez: prompt only.

**Stars and identity depth run inversely in this field.**

**Answer:** no candidate is a *much better replacement* for the two measured packs. The better material is narrower pieces that fill gaps the baseline does not cover. In order of value to this studio:
1. **MiniMax-AI/MiniMax-H3 `h3-prompt-writing`**. The baseline has nothing for the local engine, and Ref2VA is its identity channel. FORK-AFTER-AUDIT.
2. **0xAnni/ugc-creator**: the actor-card schema and the lock ladder. MIT; drop the fal.ai script. FORK-AFTER-AUDIT.
3. **machina film-studio-skills**: passport, registry and the 10/10 stress-test gate before paid generation. TAKE-IDEA (no license).
4. **Tilbury pack, `charsheet-soul` + `ugc-influencer-video`**: Higgsfield in-house Seedance 2.5 method (RELIGHT, audio lock, Soul fixes). TAKE-IDEA (no license).
5. **Fizgig**: trained identity (LoRA / RefMod) on local H3, the local counterpart of Soul ID. FORK-AFTER-AUDIT as a tool.
6. **PicsArt persona**: the 2×2 casting card and the plan-before-spend step. TAKE-IDEA.
7. **awesome-seedance `character-reference-lock`** and **liyue** (the rule that a character reference means the whole visible character, not just the face). TAKE-IDEA.
- **SKIP:** AKCodez, rediumvex, beshuaxian, SamurAIGPT Generative-Media-Skills, SamurAIGPT AI-Influencer-Generator.

**Two ideas several sources agree on** (ugc-creator, Tilbury, nigo, awesome-seedance, liyue):
- A reference is an **identity-only** input. Always add a clause saying what *not* to inherit from it (its lighting, its background).
- The character sheet is **generated from a locked spec** and regenerated from the spec, never edited by hand.

## 5. U (not measured)
- The Tilbury "7 skills": whether an earlier version of the Dropbox folder held 7 skills under those names. Today's folder holds 4, and every search came back 0.
- Whether the Dropbox link is Tilbury's own: it was taken from a pcn-channel.com reprint of the description. The YouTube page itself was not fetched.
- The Tilbury pack's license: none is stated in any file.
- The MiniMax H3 Community License terms: the Hugging Face LICENSE was not read.
- Fizgig's likeness and quality numbers: README claims only, no output inspected.
- manju-laoli, smixs, lanshu and seedance-tvc-director: read by description or file tree only.
- How well any lock method actually holds identity on H3 or on Higgsfield: nothing was generated (reader-only brief).
- The ugc-creator author's article (x.com/0x_Anni/status/2067776249485791496): needs a browser.
- The Seedance 2.5 ship date of 2026-07-31: taken from the brief, not re-measured.
- A Krea blog post, "MiniMax H3 Prompting Guide … Influencers, and Omni-Reference (2026)", surfaced in search and was not read.
