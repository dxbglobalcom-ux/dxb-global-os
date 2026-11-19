# Higgsfield's system, rebuilt inside the holding — the input for B43's entry (2026-11-18)

Read by an Opus 5.5 hand at high on 2026-11-18, stopped on his word before the teardown itself ("Şu an yapmayın … tahtaya koyalım … sırası geldiğinde yapılsın"). Nothing signed in, nothing installed, no repository file changed by the hand. Its scratch (`/tmp/…/4138bfde…/scratchpad/hf-clone/`: the cloned repos, the pages, the terms) is temporary; the repos can be cloned again.

**Short answer.** Mostly yes. Most of what Higgsfield sells is other makers' models plus its own backend prompt templates, so the studio is rebuilt as a catalogue of per-model presets, our own templates, a reference store, and the platform-hub plan's router and card. The exceptions are Higgsfield's own models (Soul, Soul ID, Genjutsu, Cinema Studio, DoP, the Marketing Studio engine): no direct equivalent; the nearest open or direct route is named below, untested.

**Sources.** [CLI] `higgsfield-ai/cli` `README.md:262-402`, `MODELS.md` (cloned 2026-11-18, MIT) · [SK] `higgsfield-ai/skills` v0.14.0 (MIT) · [AT] `higgsfield-ai/app-templates` `generation/catalog/models/*.ts` — **no licence** (no LICENSE file), structure only, no code · [WEB] higgsfield.ai `/` and `/apps`, signed out, `obscura fetch --stealth`, 2026-11-18.
"Unlimited" = open weights on our 16 GB card; those routes are the hand's knowledge, not read today and not measured on our card (⚠ UNVERIFIED) unless a record is cited. "Paid" = the maker's own API. "Ours" checked against `packages/dxb-mcp/src/groups/media.ts` (`media_submit/status/wait/probe/cancel/jobs`; `media_quote` planned, absent).

| Feature (source) | What it does | Unlimited side (our GPU) | Paid side (maker API) | Ours |
|---|---|---|---|---|
| Image models, 23 (CLI README:266) | text-to-image, edit: Nano Banana, GPT Image 2/2.5, FLUX.2/Kontext, Seedream, Recraft, Grok, Kling O1, Z-Image | FLUX.1-Krea-dev (cleared, FINAL.md Bölüm 0), FLUX Kontext dev, Qwen-Image, Z-Image | Google, OpenAI, BFL, BytePlus, Recraft, xAI | image hand in ComfyUI; router planned (FINAL.md §C) |
| Video models, 22 (CLI README:295) | Veo 3/3.1, Kling 2.6/3.0, Seedance 1.5–2.5, Wan 2.6/2.7, Hailuo, Grok | Wan 2.x, LTX (B43:176: LTX-2.5 and H3 apps do not fit 16 GB) | Google, Kling, BytePlus, Alibaba, MiniMax, xAI (AT paths e.g. `bytedance/seedance-2.5`, `kling-video/v3.0/pro`) | router and card planned |
| Soul V2 / Cinematic / Location / Cast (CLI MODELS.md:287-323) | their own photoreal image model | none; nearest FLUX Krea + style LoRA | none | — |
| Soul ID (SK `higgsfield-soul-id`) | one face trained from 5–20 photos, reused as `custom_reference_id` | character LoRA, PuLID/InstantID (unread) | reference-to-video in Kling or Seedance (SK generate:136) | missing — B43 part 3, the reference store |
| Marketing Studio video, 9 modes (SK `marketing-modes.md`) | UGC, tutorial, unboxing, showcase, review, TV spot, wild card, try-on ×2; avatars, products, hook and setting ids; Click-to-Ad from a product URL | our UGC recipe (B43 R25/R30) on Wan + voice | Seedance 2.5, Veo, Kling | recipe planned; brand kit from the client's site: B43:249 |
| Avatars, preset or custom (SK `marketing-avatars.md`) | curated presenters or one uploaded face | our cast under R9 | as above | cast exists, no store |
| Product Photoshoot, 10 modes (SK `product-photoshoot` 52-61) | a backend prompt enhancer + `gpt_image_2`; product shot, lifestyle, close-up with person, Pinterest pin, hero banner, carousel, ad pack, try-on, conceptual, restyle | FLUX Krea/Kontext with our templates | OpenAI image | `/kisayol` prompts only — B43 part 2, presets |
| Marketplace cards (SK) | 13-asset listing set; templates private on their backend | as above | OpenAI image | planned (B43:257) |
| YouTube thumbnail (SK) | Nano Banana Pro + Seedream edits | FLUX | Google, BytePlus | missing |
| Faceless / explainer video (SK, CLI `video_explainer`) | narrated explainer, documentary, kids' song (songs are outside our boundary) | OpenMontage, Voice Studio (not set up, B43:165) | ElevenLabs, Gemini | partly (B28) |
| Brand kit (SK) | palette, logo, mockups, brandbook PPTX/PDF | local scripts + FLUX | — | missing (B43:249) |
| Websites, apps, games (SK, CLI `website`) | React + Cloudflare deploy, feed, contest | — | — | B84 owns it |
| Workflows: draw-to-video, reframe, voice change, dubbing (CLI README:125-170) | edit a clip from a sketched frame; aspect change | Wan VACE (unread), ffmpeg crop | Kling, BytePlus `seedance-2.5/video-edit` (AT); ElevenLabs dubbing | missing |
| Upscale (`fnf-sdk.md:724`) | Topaz image/video, Bytedance, their own | Real-ESRGAN / SeedVR2 (unread) | Topaz API (B43 R30) | missing |
| Background remover, image and video (CLI MODELS:109,682) | cut-outs | SAM 2.1 (B43:231), rembg | — | missing |
| Motion transfer / Genjutsu / Recast / character swap (WEB `/apps`; AT `kling-video/v3/motion-control`) | a person onto a filmed performance | LivePortrait, Wan Animate (unread) | **Kling 3 Motion Control — the path Higgsfield's own template calls (AT `kling-3.ts`)**; fal MiniMax H3 Max `recast` (R1, read 2026-10-17) | missing |
| Face swap, video face swap (WEB `/apps/face-identity`) | one face swapped | FaceFusion-class (unread) | — | missing; R9 cast rules |
| Lip sync / talking head (SK generate:136; WEB) | audio-driven mouth | LatentSync (not on the shelf, B43:212) | sync.so (B43 R30), Seedance audio reference | missing |
| TTS (CLI README:333) | ElevenLabs, MiniMax, Seed speech, Inworld | Voice Studio, Voicebox (not set up) | ElevenLabs, MiniMax | partly |
| Music / SFX (CLI README:333) | Sonilo, Mirelo, Seed Audio | music: not in our own works; SFX: `sfx/synth.mjs` | — | within the boundary only |
| 3D: image to 3D, Tripo, SAM 3D, rigging (CLI MODELS:823-925) | GLB, rigging | TRELLIS / Hunyuan3D (unread) | Tripo, Meshy | missing |
| Virality Predictor `brain_activity` (CLI MODELS:339) | scores a video's hook | our own scorer (B28) | — | B28 |
| Apps, ~40 one-click effects (WEB `/apps`) | angles, shots, transitions, relight, skin enhancer, outfit swap, headshot, billboard/truck ad, bullet time, game styles | each a preset (model + parameters + template) over the rows above | same | missing — the preset layer |
| Cinema Studio 3.0–4.0 (CLI MODELS:348-445) | genre, camera, grade, light, speed ramp, multi-shot | our presets over Wan | Kling, Seedance with our parameter vocabulary | missing; the vocabulary is readable in MODELS.md |
| Short Drama, Shorts Studio, Ads Studio, Canvas, Community (WEB) | script to series, trending preset, ad studio, node canvas, feed | — | — | signed out: an empty shell |
| Cost before run, `generate cost` (CLI README:402) | price before the job runs | — | — | planned (FINAL.md §C step 4) |

**The structure worth taking** (AT `generation/catalog/types.ts`, `models/kling-3.ts`): one file per model, declaring its settings (enum, range, boolean, defaults), its media roles (start, end, video, ref) and a `toPlatform()` mapper to a path and a body — the shape of B43's part 2 (presets that carry the model's parameters).

## What the teardown needs when its turn comes

- **Signed out (seen 2026-11-18):** the studios render as an empty shell (`/generate` 704 bytes of markdown, `/genjutsu-create` 918, `/ai/video` 918, `/canvas` "Sign in to view your canvases"); the network shows Clerk auth (`/_clerk/v1/client`), `/api/server-time`, one `/_serverFn/<hash>` (TanStack Start) and analytics; scripts from `assets.higgsfield.ai`, `static.higgsfield.ai`, `l10n.higgsfield.ai`. No generation endpoint, model id or parameter is visible. The REA bundle run was stopped before it wrote a result.
- **Only a signed-in account shows** (his step): the live job-submit calls and per-model schemas (`higgsfield model get`, `preset list`, `workflow get`, `generate cost` all need `auth login`); the preset and app lists with their parameters; what Genjutsu, Soul and Cinema Studio send. No sign-in shows their backend prompt templates or their own model weights — those no teardown can take.
- **Steps:** a headless Chromium of its own on a free port (never 9333, the research Chrome) → the script origins from `performance.getEntriesByType('resource')` → `rea analyze-web-bundle http://127.0.0.1:<port> <target> --observation-ms 6000 --allowed-origins <each origin> --fetch-source-maps` → `rea inspect-web-page … --include-script-sources --include-json-body-shapes`, `rea export-web-scripts` → signed in, `rea observe-web-session` while each studio runs one job (memory note `rea-web-capture-needs-allowed-origins-2026-11-04`).
- **Code reuse:** `cli` and `skills` MIT; `higgsfield-client` Apache-2.0; `higgsfield-js` MIT by its `package.json`; `app-templates` no licence — structure only.

## Build order, smallest valuable first (the hand's proposal)

1. Study card (free): MODELS.md's parameter vocabulary, the skills' mode tables and AT's catalogue shape into our preset schema — verified when every Higgsfield mode above maps to a preset row.
2. Preset catalogue with our own templates (free): `/kisayol` from prompts to model + parameters + media roles — verified on one listing set and one product shot from a reference-conditioned route.
3. Unlimited side on the card (free; his word to install): background removal (SAM 2.1), upscale, TTS (Voice Studio), lip sync (LatentSync), motion transfer (LivePortrait or Wan Animate) — each measured for VRAM, time and his eye.
4. Reference store (free): each client's products, characters, brand kits — verified by handing a stored reference to one job.
5. Router, card, key-catcher (FINAL.md phases 1–3): accounts by his clicks, no money now.
6. Paid side through the router; the person-onto-performance step's paid route is Kling 3 Motion Control direct or fal H3 Max `recast`; every job stops at his "Onayla".
7. One call form for the Web Studio's agents (B84), priced on the same card.
8. The studio surface after B32's drawing.
9. The signed-in REA teardown — now, the whole of it (his order 2026-11-19; partnership agreed in principle); the sign-in is his.
