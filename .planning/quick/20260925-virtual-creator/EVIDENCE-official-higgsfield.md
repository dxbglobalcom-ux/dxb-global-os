# higgsfield-ai/skills: what the official repo contains and requires (read 2026-09-25)

**Source read:** `github.com/higgsfield-ai/skills`, main HEAD `d071406147a37b835bed09543d85ab3e9bd85c7d` (committed 2026-09-11 16:15Z; repo `pushed_at` 2026-09-14 belongs to another ref), ★1139, MIT. I downloaded the tarball into the scratchpad and read it. I executed nothing and installed nothing.
**Labels:** **R** = read in the skills repo at `path:line` (paths are relative to the repo root) · **R-cli** = read in `github.com/higgsfield-ai/cli` (its `install.sh`, `README.md`, the release API) · **R-ev** = read in the holding's `.planning/quick/20260903-media-studio-founding/EVIDENCE-external-hands-2026-09-14.md` · **U** = not found.

## 0. How to read the verdicts. Every skill is written for the CLI, not for the MCP
- R `CLAUDE.md:78`: "All skills route through one binary: the `higgsfield` CLI. **Do not call `api.higgsfield.ai` directly**." All 8 frontmatters carry `version: 0.12.0` (line 2) and `allowed-tools: Bash` (generate:24, soul-id:16, product-photoshoot:22, brandkit:7, marketplace-cards:16, websites:9, video-explainer:16, youtube-thumbnail:7). Every Higgsfield call goes through a `higgsfield …` command; no skill invokes an MCP tool. Brandkit and websites also run local tools (python, npx, soffice, git, bun).
- The MCP appears only as the origin the skills copy from: R `higgsfield-video-explainer/SKILL.md:21,25-38` (the MCP→CLI table below), R `higgsfield-generate/references/media-inputs.md:3` ("Mirrored from MCP server media-handling logic"), and R `higgsfield-generate/references/marketing-modes.md:48-50` (the `show_marketing_studio` widget action `fetch`).
- So **TAKE means: take the procedure and prompt contract, then re-drive it over the studio's MCP route**. It does not mean installing the skill folder. As written, no skill calls an MCP tool.

MCP operation names the repo gives, verbatim (R `higgsfield-video-explainer/SKILL.md:29-36`). This is the only place the repo names MCP operations:

| MCP operation | CLI equivalent |
|---|---|
| `get_explainer_presets` | `higgsfield preset list video-explainer --json` |
| `resolve_explainer_preset` | `higgsfield preset resolve video-explainer <preset_id> --json` |
| `generate_image` / `nano_banana_pro` | `higgsfield generate create nano_banana_2 ...` (R :38 says the CLI id `nano_banana_2` is the MCP's Nano Banana Pro style-key model) |
| `list_voices` | `higgsfield voices list --json` |
| `generate_audio` / `seed_audio` | `higgsfield generate create seed_audio ...` |
| `generate_video` / `gemini_omni` | `higgsfield generate create gemini_omni ...` |
| `job_status` | `--wait --json` or `higgsfield generate wait <job_id> --json` |
| `explainer_video` | `higgsfield generate create explainer_video ...` |

Whether the MCP also exposes Soul ID training, `product-photoshoot` or `marketplace-cards`: **U**.

## 1. Skill by skill (all eight: v0.12.0 · `allowed-tools: Bash` · need the `higgsfield` binary + `higgsfield auth login`)

| Skill | What it does | Models it calls | Inputs → outputs | R |
|---|---|---|---|---|
| generate | Image, video, 3D and audio generation over 30+ models, plus Marketing Studio ads and Virality Predictor scoring | Defaults: GPT Image 2.5 (images), Seedance 2.5 (video, 4–30 s, ≤1080p), Nano Banana 2 / Lite / Pro (character and reference work), Marketing Studio video/image, Seed Audio 1.0. Also listed: Soul 2.0 / Cinema / Cast / Location, Kling 3.0 / Turbo, Veo 3.1 / Lite, Gemini Omni Flash, Grok Video 1.5, Hailuo, Cinema Studio Video 3.0, Recraft V4.1, Seedream 4.5, Z Image, `multi_image_to_3d`, `brain_activity` | Prompt plus `--image/--start-image/--end-image/--video/--audio`, each a local path (auto-uploaded) or a UUID; `--soul-id` → result URL on stdout, or the job object with `--json` | `SKILL.md:29,71-75,83-118,131-143,154,162` |
| soul-id | Trains a Soul Character (a face identity model) and returns a `reference_id` | Training: `--soul-2` (default) or `--soul-cinematic`. Used by: `text2image_soul_v2`, `soul_cinematic` | Name + 5–20 face photos → `reference_id` | `SKILL.md:5-14,43-56,63-64` |
| product-photoshoot | Brand product images in 10 modes; a backend enhancer writes the prompt | `gpt_image_2` only, never a different model | `--mode --prompt --image --count 1-10 --aspect_ratio` → image URLs at 2k | `SKILL.md:27,45,141-147,189,193-205` |
| brandkit | A full visual identity (palette, SVG logo, type, mockups, packaging, signage, deck, PPTX/PDF brandbook) | `recraft_v4_1` (vector logos), `seedream_v5_pro` (photoreal mockups), `gpt_image_2` (the readable-text stage) | Brief + official assets → local HTML/SVG/PNG/PPTX/PDF under `./brandkit/` | `SKILL.md:5,18-21,35-37,55,143-145` |
| marketplace-cards | Marketplace main image, 5 secondary images, 7 A+ modules; the templates stay private on the backend | `nano_banana_2` | `--scope/--asset --prompt --image --main-job` + context flags → labelled URLs | `SKILL.md:10-11,22,39-75,79-86` |
| websites | Builds and deploys a React 19 + TanStack Start Cloudflare Worker (website, app or game) on Higgsfield hosting | Generation models for assets and the launch cover | Brief → a live URL at `<subdomain>.<host>`, plus a git repo it clones locally | `SKILL.md:5,14-19,84-86,107-109,156-171` |
| video-explainer | A narrated explainer, non-photoreal only, built from 10 s blocks | `nano_banana_2` (style key), `seed_audio` (narration), `gemini_omni` (clips), `explainer_video` (server-side assembly) | Topic or documents, a preset or style images, 1–10 min, language, mascot or faceless, aspect, subtitles → one MP4 of N×10 s | `SKILL.md:5-14,78-92,108-117,265` |
| youtube-thumbnail | YouTube / Shorts / Instagram covers holding up to 3 identities from reference photos | `nano_banana_pro` at 4K (main render), `gpt_image_2` (3D logo), `seedream_v5_pro` (edits), falling back to `seedream_v4_5` | Topic, 0–3 face photos, logo, 16:9 / 9:16 / 4:5, optional headline → one `result_url` per variant, capped at 16 generations | `SKILL.md:5,44-51,112-131,155-163,175` |

| Skill | Needs beyond the CLI and auth | Plan / credits the repo states | R |
|---|---|---|---|
| generate | Nothing more (`jq` appears in examples) | Credits: U. `generate cost` gives an estimate before submitting, but UX rule 5 says "**Don't pre-estimate cost** … unless the user asks" | `SKILL.md:48,120`; `references/troubleshooting.md:30-34` |
| soul-id | Nothing more | "Soul training requires a paid plan (Basic+)". Training credits: U | `SKILL.md:32,76`; `references/troubleshooting.md:3-5` |
| product-photoshoot | Nothing more | U | — |
| brandkit | Python 3, Node/npx + Playwright Chromium, ImageMagick, librsvg, LibreOffice, Poppler, Fontconfig; on Ubuntu `sudo apt-get` (it asks first) | U | `references/prerequisites.md:7-16,44-52` |
| marketplace-cards | Nothing more | U | — |
| websites | `git`, `bun`, a scoped git token | The cover video costs credits and needs the user's permission; amount U | `SKILL.md:107-109,170-171,181` |
| video-explainer | Nothing more | **Subtitles cost 0.05 credit per voiced block**; everything else U | `SKILL.md:82` |
| youtube-thumbnail | An environment that renders HTML canvas (for the overlay); Google Fonts | The text overlay costs "zero generation credits"; everything else U | `SKILL.md:171`; `references/text-overlay-bake.md:8,39` |

| Skill | Verdict · stage | Why (R refs above) |
|---|---|---|
| generate | **TAKE · still + video** | Its model routing and media-role tables are what the studio needs: Seedance 2.5 `omni_reference` with `image_references`, Kling 3.0 start/end frames, Soul 2.0 stills with `--soul-id`. Drive it over the MCP. Leave out `seed_audio` and `voices`, and the `voice-change`/`dubbing` workflows, which appear only in the CLI README (R-cli :150-172; the skills repo names only `draw_to_video` and `reframe`, R `higgsfield-generate/references/workflows.md:15-20`) (voice law). Override rule 5 (SKILL.md:48) with the holding's price-before-job rule (R-ev :43). `brain_activity` (Virality Predictor, SKILL.md:276-298) is **MAYBE · packaging QA** |
| soul-id | **MAYBE · identity** | Whether it accepts frames of a generated presenter is U (§2); its variety demands may not fit a single casting take; availability over the MCP is U; training credits are U. A no-training reference-frame route exists (§2b) |
| product-photoshoot | **MAYBE · still (product only)** | Not creator content. It uses one model, and the prompt is private to the backend (you cannot see or pin it) |
| brandkit | **NOT** | Outside the virtual-creator scope; heavy local installs (sudo apt, LibreOffice, Playwright); the PPTX template is a live Google Slides export with no pin (§4 S12) |
| marketplace-cards | **NOT** | Marketplace listing images, not creator content |
| websites | **NOT** | Web hosting on Higgsfield; "every deploy ships the live public site immediately" (SKILL.md:184); the app contest auto-publishes (SKILL.md:253-254) |
| video-explainer | **NOT** | Narration is Seed Audio, but by CEO law the studio's voice is the engine's own; non-photoreal only; "NOT for … talking heads" (SKILL.md:13) |
| youtube-thumbnail | **TAKE · packaging** | Its IDENTITY LOCK prompt with face references matches identity held by reference frames; it has a "truthfulness law" (`references/thumbnail-frameworks.md:11`); its headline overlay is deterministic and costs zero credits |

## 2. Soul ID in detail (`higgsfield-soul-id/…`)

| Item | Finding | Ref |
|---|---|---|
| Photo count | Minimum 5, maximum 20; 8–12 is the "sweet spot" | R `references/photo-guide.md:7-8`; `SKILL.md:44` |
| Angles and variety | front, 3/4 left, 3/4 right, slight up/down; indoor/outdoor, soft/harsh light; neutral/smiling/talking; head shot, head-and-shoulders, full body | R `photo-guide.md:16-23` |
| Photo quality | One person per photo, eyes visible, no heavy filters or sunglasses; sharp; ≥1024×1024 ideal; JPEG or PNG | R `photo-guide.md:12-14,27-29` |
| Avoid | Group photos, unusual heavy makeup, costumes/cosplay, hats over the face, **the same pose repeated** | R `photo-guide.md:31-37` |
| Why training fails | Fewer than 5 photos or photos "too uniform"; occlusion; group photos; a video upload. Error text says "5+ unique faces" | R `references/troubleshooting.md:9-14`; `SKILL.md:77` |
| Variant | `--soul-2` for images (default); `--soul-cinematic` for "cinematic / video work" | R `SKILL.md:45-48` |
| Command | `soul-id create --name <n> --soul-2 --image <path or upload_id> …`, then `soul-id wait <id>`. The CLI auto-uploads local paths | R `SKILL.md:49-55` |
| Extra flags (COOKBOOK only) | `--max-train-steps 1000`; `--output-dir` saves `training-manifest.json` | R `COOKBOOK.md:26-28,160-165` |
| Training time | Default wait timeout 30 min, extendable to 60 min; "15–45 minutes" / "~30 minutes" | R `SKILL.md:55`; `troubleshooting.md:22-24`; `COOKBOOK.md:138,284`; `evals/scenarios.md:66` |
| Plan | A paid plan, "Basic+"; error text `Minimum Basic plan required`; "needs a paid plan". The EVIDENCE tier list has Starter / Plus / Ultra and no "Basic"; Plus is a paid plan (R-ev :14) | R `SKILL.md:32,76`; `troubleshooting.md:3-5` |
| Credits per training | **U** | — |
| Reuse | `generate create text2image_soul_v2` or `soul_cinematic` with `--soul-id <ref_id> --quality 1.5k or 2k`; `soul-id list` / `soul-id get <id>` | R `SKILL.md:60-71`; `higgsfield-generate/SKILL.md:166` |
| Reuse in Marketing Studio | The Soul ref as a custom avatar: `[{"id":"<soul_ref_id>","type":"custom"}]` | R `COOKBOOK.md:129`; `CLAUDE.md:157` |
| Soul → video | `--soul-id` on a video model appears only in the contradicted COOKBOOK line (see Contradiction row), so it is **U**. The documented path is a Soul still used as `--start-image` on Kling or Seedance, or Marketing Studio with the Soul as avatar | R `COOKBOOK.md:46-63,169-189` |
| Frames of a generated presenter accepted? | **U: never stated.** Four R facts bound the question: (a) "NOT for … named-character / non-photo avatars" (`SKILL.md:13-14`); (b) the safety rejection list names "Real public figures", not generated faces (`higgsfield-generate/references/prompt-engineering.md:42-47`); (c) the Marketing Studio backend "can synthesize a Soul Character automatically" (`higgsfield-generate/references/marketing-avatars.md:46`), so Higgsfield itself builds Souls for faces that are not real; (d) the variety and "same pose repeated" rules (`photo-guide.md:16-23,37`) cut against frames from one take | R as cited |
| Contradiction | `soul_cinematic` is filed as an image model (`model-catalog.md:24` "Soul Cinema … cinematic stills") and takes `--quality 2k` (`SKILL.md:64`), yet `COOKBOOK.md:194-200` runs it with `--duration 60` as a video, and `:204` ties `--soul-cinematic` to "voice consistency". The description also names a third id, `soul_cinema_studio` (`SKILL.md:12`). Which is true: **U**. No video verdict should rest on the COOKBOOK line | R as cited |

### 2b. Identity without Soul training (reference frames), all R
- A face-reference prompt pattern (IDENTITY LOCK with `--image` refs, up to 3 people): `higgsfield-youtube-thumbnail/SKILL.md:5,70-76,94-101`.
- Reference slots per model (`higgsfield-generate/references/model-catalog.md:173-186`): Gemini Omni Flash `image_references` 0–7, or 0–5 alongside one video (:175) · Nano Banana 2 Lite 0–14 (:176) · Seedance 2.5 `image_references`/`video_references`/`audio_references` in `omni_reference` mode (:178) · Kling 3.0 start/end frame (:179).
- A possible route to drive video from the engine's own voice track (a check to run, not a verdict): `seedance_2_0 --start-image ./headshot.png --audio ./voice.mp3 --prompt "person speaking"` (`media-inputs.md:87-96`); `seedance_2_5 --audio-references` in `omni_reference` (`media-inputs.md:85`). Lip-sync quality: U. Credits: Seedance 2.0 1080p is ~45 per 5 s (R-ev :16); Seedance 2.5 is U.

## 3. The CLI (`higgsfield-ai/cli`, R-cli)
- **The repo has no source code.** Its root holds `LICENSE, MODELS.md, README.md, THIRD-PARTY-NOTICES.txt, demo.png, install.sh` (contents API); the GitHub language field is "Shell". The binary only exists as release tarballs: latest `v1.1.26` (2026-09-18), assets `hf_1.1.26_<os>_<arch>.tar.gz` + `checksums.txt`. License MIT.
- **What `install.sh` does:** it asks `api.github.com` for the latest tag (:49), downloads the tarball (:59), extracts it into a mktemp dir (:45,66). **It never checks `checksums.txt`** (no hash step in :45-88). Default prefix is `/usr/local` (:17). It uses `sudo mkdir` / `sudo install` when `$PREFIX/bin` is not writable (:70,:74). It writes `/usr/local/bin/higgsfield` (:78), `higgsfield.install.json` (:80-88), the symlink `higgs` (:91) and the symlink **`hf`** (:98,:104,:111). `hf` is skipped only if another `hf` is already on PATH (:101-108); once `hf` is taken, a later Hugging Face CLI install on the station would collide with it. Running with `--prefix=$HOME/.local` avoids sudo (:9; R `INSTALL_FOR_AGENTS.md:11-15`). Other install routes: `brew install higgsfield-ai/tap/higgsfield` or `npm install -g @higgsfield/cli` (README:37-47). At the time of reading, `hf`, `higgsfield` and `higgs` are not on this station's PATH (`command -v`).
- **Auth:** "`higgsfield auth login` (device-flow, persists to `~/.config/higgsfield/credentials.json`)" (R `CLAUDE.md:80`); "opens a browser for OAuth" (R `INSTALL_FOR_AGENTS.md:27`); "tokens are short-lived" (README:660); stored credentials are tied to one API URL (R `higgsfield-generate/references/troubleshooting.md:6`); a billing workspace is selected with `higgsfield workspace` (README:590).
- **MCP instead of CLI:** see §0. The skills as written need the CLI. Across both routes, every generation spends credits: "Unlimited models and Free Generations … are not accessible on MCP/CLI" (R-ev :15).

## 4. Security pre-audit for the customs gate (B41 · INTEG-01): 20 findings

| # | Where (path:line) | Kind | What |
|---|---|---|---|
| S1 | `higgsfield-generate/SKILL.md:35-38` · `higgsfield-soul-id/SKILL.md:27-30` · `higgsfield-product-photoshoot/SKILL.md:33-36` · `higgsfield-marketplace-cards/SKILL.md:26` · `higgsfield-websites/SKILL.md:100-103` · `higgsfield-video-explainer/SKILL.md:42-46` · `higgsfield-youtube-thumbnail/SKILL.md:18-21` | network + sudo (auto) | **7 of 8 skills tell the agent to run `curl … install.sh \| sh` whenever the binary is missing, without asking the user.** Only brandkit asks first (`higgsfield-brandkit/SKILL.md:25-29`, `references/prerequisites.md:62-66`) |
| S2 | R-cli `install.sh:49,59` | network | Pulls the tag from the GitHub API and the tarball from GitHub releases |
| S3 | R-cli `install.sh:45-88` | integrity | No checksum check, although `checksums.txt` ships with the release |
| S4 | R-cli `install.sh:70,74` | sudo | `sudo mkdir` / `sudo install` into `/usr/local/bin` |
| S5 | R-cli `install.sh:78,88,91,98,104,111` | writes outside | `higgsfield`, `higgsfield.install.json`, and the `higgs` and `hf` symlinks in `$PREFIX/bin` |
| S6 | R-cli repo root (contents API) | opacity | Closed binary; no source exists to audit |
| S7 | `setup:111` | network + sudo | Runs the same `curl … \| sh` when the CLI is missing |
| S8 | `setup:76-86,140-162` | writes outside | Symlinks each skill into `$HOME/.claude/skills` (or `.cursor/plugins` / `.codex/plugins`); `rm`s a stale symlink (:153) |
| S9 | `scripts/update-check.sh:19,24,105-119` | network + writes outside | Fetches `raw.githubusercontent.com/…/VERSION`; writes to `~/.higgsfield-skills/` (opt-in, called by nothing in the repo) |
| S10 | `CLAUDE.md:80` | secret on disk | OAuth token stored at `~/.config/higgsfield/credentials.json` |
| S11 | `higgsfield-generate/references/media-inputs.md:7`; `higgsfield-generate/SKILL.md:122`; `higgsfield-soul-id/SKILL.md:54` | data egress | Every local file passed as media, cast frames included, is auto-uploaded to Higgsfield. Retention and training use: U |
| S12 | `higgsfield-brandkit/scripts/build_brandbook.py:29-32,773` | network, unpinned | The canonical PPTX template is a live `docs.google.com/presentation/…/export/pptx` fetch with no hash; whoever controls that Slides doc controls the template |
| S13 | `build_brandbook.py:584-588,607`; `brandkit.py:1207` | network | Google Fonts CSS and font files |
| S14 | `brandkit.py:66-68`; `render_brandbook_pdf.py:82` | reads outside | `/etc/ssl/*` CA bundles; `/etc/fonts/fonts.conf` |
| S15 | `brandkit.py:236,632-633,1219`; `build_brandbook.py:474-475,595` | reads outside | `expanduser()` / `resolve()` on paths the user supplies in JSON; reads any local file given |
| S16 | `brandkit.py:1031-1070`; `build_brandbook.py:920-940`; `render_brandbook_pdf.py:94-130` | subprocess | rsvg-convert, ImageMagick, python, fc-cache, fc-match, soffice, pdffonts, all as list-argv (no shell). **Defensive code:** HTTPS-only public-host guard against internal addresses (SSRF) (`brandkit.py:579-622`, `build_brandbook.py:58-85`) and an SVG validator that bans script, foreignObject and external references (`brandkit.py:641-669`) |
| S17 | `higgsfield-brandkit/references/prerequisites.md:47-49`; `references/inline-widgets.md:12` | sudo + network | `sudo apt-get install …` and `npx --yes playwright@1.62.1 install --with-deps chromium` (asked first, :44); `npx --yes playwright … screenshot` fetches the package on first use |
| S18 | `higgsfield-websites/references/game-meshy-api.md:22-23,171-176`; `game-3d-animation.md:70,79-82`; `game-textures.md:36` | network + installs | Direct `curl` to `api.meshy.ai` with `$MESHY_API_KEY`; a ~336 MB Blender download; `apt-get download` + `dpkg -x` into a local folder; `pip install … --break-system-packages` |
| S19 | `higgsfield-websites/references/app-cover.md:181-183,291-293`; `wow-maker.md:237-264` | network + writes outside | Fonts and a glyph fetched from a hosted asset base and cached in `~/.cache/higgsfield-cover`; `npx shadcn add` from third-party registries |
| S20 | `higgsfield-websites/SKILL.md:14-19,181,184,253-254` | public exposure + writes in the working directory | Scoped git token; every deploy goes live and public; the contest entry auto-publishes; it clones a git repo into the working directory and edits under `app/`. (Brandkit likewise writes `./brandkit/state.json` in `$PWD`: `higgsfield-brandkit/SKILL.md:18-21`, `brandkit.py:139-143`, `build_brandbook.py:901-902`.) (`higgsfield-websites/scripts/*.py` do local file I/O only: bpy/PIL/numpy, no network, no subprocess, by grep) |

## 5. License and manifests
- R `LICENSE:1-3`: MIT, "Copyright (c) 2026 Higgsfield AI". The CLI repo is also MIT (R-cli API).
- R `.claude-plugin/plugin.json:1-29`: `name: higgsfield`, `version: 0.12.0`, author Higgsfield AI, homepage higgsfield.ai, repo URL, `license: MIT`, 16 keywords. **No `hooks`, `mcpServers` or `commands` keys** (file read whole).
- R `.claude-plugin/marketplace.json:1-57`: marketplace `higgsfield`, one plugin at `source: "./"`, 8 skills, each with `path` and `invoke: /higgsfield:<name>`. Install: `/plugin marketplace add higgsfield-ai/skills` → `/plugin install higgsfield@higgsfield` (R `README.md:33-34`).
- R `.codex-plugin/plugin.json:33-36` declares `capabilities: [Read, Write]`; R `.cursor-plugin/plugin.json` carries metadata only.
- R `evals/README.md:17-22`: "There is no automated runner yet"; 14 manual scenarios (`evals/scenarios.md`) check model choice, mode choice, UX (no raw IDs, one question at a time), Soul chaining, and the approval gates in brandkit. CI (`.github/workflows/validate-skills.yml`) only checks frontmatter, version sync, reference links and parent-directory paths; it runs no skill.

## 6. AI disclosure / C2PA
- **U.** A grep for c2pa, content credential, provenance, disclos*, synthid, ai-generated, deepfake, likeness and consent found no AI-disclosure or labelling rule.
- Every "watermark" hit is a prompt telling the model to put **no** watermark in the image (e.g. `higgsfield-youtube-thumbnail/SKILL.md:84`, `higgsfield-video-explainer/SKILL.md:186`, `higgsfield-websites/references/asset-system.md:34`).
- The "truthfulness law" (`higgsfield-youtube-thumbnail/references/thumbnail-frameworks.md:11`) says the thumbnail must honestly represent the video. It is not AI disclosure. The only consent hit is about publishing a game (`evals/scenarios.md:291`).

## 7. The repo contradicts itself (R)
- `README.md:5,61`, `INSTALL.md:3,13` and `setup:98` list **9** skills including `higgsfield-game-generation`, but that folder **does not exist** at d071406 (the tree has 8; `marketplace.json` lists 8). As written, `./setup` reports "Source missing" and then exits 1 (`setup:144-146,169-175,199-201`).
- `higgsfield-websites/SKILL.md:78-80` says the `higgsfield game …` commands "are gone", yet `COOKBOOK.md:262` and the CLI README (:595) still use `higgsfield game deploy`.
- `CLAUDE.md:5` says "Seven skills" and `:28` says VERSION is "currently 0.3.0"; the actual VERSION is 0.12.0 (`VERSION:1`). `INSTALL_FOR_AGENTS.md:17` expects CLI `v0.1.X`; the latest is v1.1.26 (R-cli).
- `README.md:109` prefers `seedance_2_0` for image-to-video, `evals/scenarios.md:41` expects `kling3_0`, and `higgsfield-generate/SKILL.md:98` makes `seedance_2_5` the default.
- The Soul Cinematic image-vs-video contradiction is in §2.

## 8. Credits: cite the holding's own measurement; the repo states almost none
- The repo states one figure: subtitles cost 0.05 credit per voiced block (R `higgsfield-video-explainer/SKILL.md:82`). It also offers a `higgsfield generate cost …` estimator (R `higgsfield-generate/references/troubleshooting.md:32`).
- The prices come from R-ev :14-17. Plus is €59/month monthly or €47/month billed annually, with 1,200 credits. Per unit:

  | Model | Credits (R-ev :16) |
  |---|---|
  | Soul 2.0 | 0.12 per image |
  | Nano Banana Pro | 2 per image |
  | FLUX.2 Pro | 1 per image |
  | Kling 3.0 | ~8 per 5 s at 1080p |
  | Seedance 2.0 | ~45 per 5 s at 1080p |
  | Veo 3.1 | ~29 per 4 s |
  | Hailuo 2.3 | ~10 per 6 s at 1080p |

- Not in that table, so **U**: Seedance 2.5, Gemini Omni Flash, GPT Image 2.5, Seed Audio and Soul training.

## 9. U list
1. Whether Soul ID accepts frames of a generated (not real) presenter.
2. Credits per Soul training.
3. Whether the MCP exposes Soul training, `product-photoshoot` or `marketplace-cards`.
4. Whether `--soul-id` works on any video model.
5. Whether `soul_cinematic` makes video or stills, and whether it carries speech.
6. Retention and training use of uploaded media.
7. Any AI-disclosure / C2PA labelling.
8. Credits for Seedance 2.5, Gemini Omni, GPT Image 2.5 and Seed Audio.
9. How "Basic+" maps to Plus by name (R only says a "paid plan").
10. Lip-sync quality of the `seedance_2_0 --audio` route.
11. Hard limits on Soul training beyond the 20-photo cap.
