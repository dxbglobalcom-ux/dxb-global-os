# Sources — lane `video` (collected 2026-11-08)

Catalog: `catalog-video.tsv`, 25,620 prompt rows after exact-duplicate removal (duplicate check: whitespace-collapsed, case-insensitive; first occurrence kept, ad-agency-relevant sources processed first, see `scripts/video/extract.py` ORDER).
Stars, licence and last-commit date measured with `gh api repos/<r>` and `repos/<r>/commits?per_page=1` (`scripts/video/repo_meta.tsv`); licences where the API says NOASSERTION were read from the repo's LICENSE file (`scripts/video/licence_overrides.tsv`). HF figures are likes / downloads from the HF API. "NONE" = no licence file in the repo.
`category` column = `<agency class>|<source's own category/tags/path>`; `+json` marks JSON-structured prompts. The agency class is a keyword heuristic, not a human judgement.

## Ranked by ad-agency value (top first)

| # | Source | URL | Stars | Last commit | Licence | Rows | Note for an ad agency |
|---|---|---|---|---|---|---|---|
| 1 | cliprise product-video prompts | https://github.com/cliprise/awesome-ai-product-video-prompts | 11 | 2026-04-28 | NONE | 58 | Product-accuracy-first product video templates plus a camera-move set (push-in, orbit reveal) per product type; closest to `/kisayol` shape. |
| 2 | cliprise video-ads prompts | https://github.com/cliprise/awesome-ai-video-ads-prompts | 9 | 2026-04-28 | NONE | 61 | Ad templates per platform (TikTok/Reels/YouTube), hook-body-CTA structures. |
| 3 | cliprise UGC video prompts | https://github.com/cliprise/awesome-ai-ugc-video-prompts | 53 | 2026-04-28 | NONE | 59 | UGC/testimonial/unboxing/talking-head templates with [placeholders]. |
| 4 | cliprise image-to-video prompts | https://github.com/cliprise/awesome-image-to-video-prompts | 6 | 2026-04-28 | NONE | 63 | Animate-a-supplied-photo prompts (product, portrait, real estate); all marked needs_input_image=yes. |
| 5 | Pletor fashion camera movements | https://github.com/raphaelguilhem-dot/fashion-camera-movements | 0 | 2026-09-30 | NONE | 15 | 15 start-frame camera moves (dolly, crash zoom, orbit, crane, drone, handheld) written as move/action/pace/lock/resolve — a ready shortcut format. |
| 6 | Tymir camera-movement prompts | https://github.com/mrzaving/camera-movement-prompts-skill | 0 | 2026-10-23 | NONE | 46 | Clean camera-move library (dolly, tracking, follow, reverse tracking …) in a fixed Movement/Speed/Framing/End format. |
| 7 | AtlasCloud Seedance 2.5 prompts | https://github.com/AtlasCloudAI/awesome-seedance-2.5-prompts-skills | 261 | 2026-11-08 | CC-BY-4.0 | 1,114 | Large categorised set incl. official Volcengine examples, match-cut/effects, product; 145 rows use reference images. |
| 8 | LearnPrompt awesome-seedance | https://github.com/LearnPrompt/awesome-seedance | 2,477 | 2026-11-08 | MIT | 1,008 | Evidence-led: each case traced to its post, with stability score and cross-model retests — best quality signal per prompt. |
| 9 | Official guides (Google, Kling, OpenAI, Wan) | see rows 1–5 of "Official guides" below | — | — | per guide | 156 | Model-maker example prompts and the Vertex camera/lens/style vocabulary (dolly zoom, aerial, etc.). |
| 10 | BeatAPI Seedance 2.5 prompts | https://github.com/BeatAPI/awesome-seedance-2-5-prompts | 30 | 2026-09-07 | CC-BY-4.0 (docs); prompts source-attributed, redistribution not verified | 314 | Each prompt has mode (t2v / reference) and source; many ads, vlog, UGC. |
| 11 | cclank lanshu AI video kit | https://github.com/cclank/lanshu-awesome-ai-video-kit | 445 | 2026-10-07 | MIT | 493 | Built for enterprise video projects: 43 product-commercial, 29 image-to-video, 15 models incl. official samples. |
| 12 | OSideMedia Higgsfield prompt skill | https://github.com/OSideMedia/higgsfield-ai-prompt-skill | 874 | 2026-10-25 | MIT | 483 | 32 sub-skills (ads, product, vibe-motion, audio, character) — mostly templates and examples. |
| 13 | ilkerzg awesome-video-prompts | https://github.com/ilkerzg/awesome-video-prompts | 138 | 2026-04-24 | NONE | 277 | 160 tested example prompts (commercial macro, perfume, transformation) + ~117 shot/lighting/lens modifier snippets. |
| 14 | showheyohtaki motion-prompt | https://github.com/showheyohtaki/motion-prompt | 1,399 | 2026-10-29 | MIT | 192 | 8 packs × 24 named motion / camera / UI / landing-page moves with one-line asks — a vocabulary of short triggers. |
| 15 | introvoyz045 awesome-ai-video-prompts (HF) | https://huggingface.co/datasets/introvoyz045/awesome-ai-video-prompts | 0 likes / 280 dl | 2026-10-25 | MIT | 279 | Hailuo/other cases sorted by ad-creative, dialogue-lipsync, shorts-reels etc.; many with input-image rules. |
| 16 | liangdabiao ecom-video-seedance | https://github.com/liangdabiao/ecom-video-seedance-prompt | 123 | 2026-08-26 | NONE | 18 | E-commerce "带货" (sell-the-product) video remake prompts; small but on target. |
| 17 | navidmotiwala ai-video-ad-prompt-library | https://github.com/navidmotiwala/ai-video-ad-prompt-library | 0 | 2026-10-30 | NONE | 30 | Scene-by-scene ad prompts per vertical. |
| 18 | yinxiaowai camera-movement prompts | https://github.com/yinxiaowai/awesome-ai-video-camera-movement-prompts | 2 | 2026-06-22 | NONE | 25 | Chinese basic-to-advanced camera-move cases (fixed, push, orbit …), each with an example. |
| 19 | hmzainjamil higgsfield-cinema-ai | https://github.com/hmzainjamil/higgsfield-cinema-ai | 1 | 2026-09-23 | NONE | 40 | 29 Higgsfield camera-movement prompts + shot workflow. |
| 20 | Rylaispirit cinematic-video-prompt-skill | https://github.com/Rylaispirit/cinematic-video-prompt-skill | 178 | 2026-09-27 | MIT | 23 | Camera angle/lens/lighting cheat sheet; examples include e-commerce product and food (Vietnamese labels). |
| 21 | Evolink Seedance 2.5 guides | https://github.com/Evolink-AI/awesome-seedance-2.5-guides | 413 | 2026-09-05 | Apache-2.0 | 88 | Mirrors the official Seedance 2.5 guide prompts (above-the-fold, product, motion graphics). |
| 22 | Evolink Seedance 2.5 prompts | https://github.com/Evolink-AI/awesome-seedance-2.5-prompts | 185 | 2026-11-06 | Apache-2.0 | 148 | Launch prompt patterns, mixed genres. |
| 23 | YouMind awesome-seedance-2-prompts | https://github.com/YouMind-OpenLab/awesome-seedance-2-prompts | 2,205 | 2026-11-08 | CC-BY-4.0 | 101 | README shows ~100 featured of the "2000+" claimed; full set lives on their site, not in the repo (measured: 212 fences in README). |
| 24 | flaqai awesome_seedance_2_5 | https://github.com/flaqai/awesome_seedance_2_5 | 13 | 2026-09-20 | MIT | 160 | Marketing/social/UGC/ad categories plus technique notes. |
| 25 | weshopai awesome-Seedance-2.0-prompt | https://github.com/weshopai/awesome-Seedance-2.0-prompt | 30 | 2026-02-24 | NONE | 64 | Fashion/e-commerce company's list; fashion and product leaning. |
| 26 | Anil-matcha Seedance 2.5 API prompts | https://github.com/Anil-matcha/awesome-seedance-2.5-api-prompts | 329 | 2026-10-06 | NONE | 42 | API-ready prompts with parameters. |
| 27 | jnMetaCode ai-shortfilm-prompts | https://github.com/jnMetaCode/ai-shortfilm-prompts | 518 | 2026-11-02 | MIT | 44 | Genre templates with named variables — template shape fits a shortcut. |
| 28 | GokuScraper seedance-2-prompts-datasets (HF) | https://huggingface.co/datasets/GokuScraper/seedance-2-prompts-datasets | 58 likes / 169,119 dl | 2026-10-06 | CC-BY-4.0 | 6,101 | 8,834 scraped records (X + AtlasCloud); 853 tagged Commercial; volume, mixed quality. |
| 29 | renoise awesome-seedance-prompts | https://github.com/renoise-ai/awesome-seedance-prompts | 8 | 2026-11-08 | CC-BY-4.0 | 5,874 | 5,973 X-sourced Seedance 2.0 prompts with genre tags; non-English rows replaced by the repo's English translation. Volume, mixed quality. |
| 30 | artificialguybr veo3-video-prompts (HF) | https://huggingface.co/datasets/artificialguybr/veo3-video-prompts | 1 like / 3,221 dl | 2026-08-13 | other (HF card) | 5,278 | Raw user prompts from Veo 3 / Veo 3 Fast generations (6 configs); 1,294 with input image. Volume, random subjects. |
| 31 | Adrian2016 awesome-image-video-prompts (HF, video config) | https://huggingface.co/datasets/Adrian2016/awesome-image-video-prompts | 1 like / 108 dl | 2026-10-30 | other (HF card) | 372 | Curated, sourced, with notes; PARTIAL — 620 of 940 rows fetched (datasets-server returned 502 on 21 pages). |
| 32 | jayseanbrambila minimax-h3-video-prompts (HF) | https://huggingface.co/datasets/jayseanbrambila/minimax-h3-video-prompts | 0 / 70 dl | 2026-08-29 | CC-BY-4.0 | 50 | Structured (camera, lighting, motion, constraints, use_case) t2v/i2v rows — clean schema. |
| 33 | songguoxs awesome-video-prompts | https://github.com/songguoxs/awesome-video-prompts | 597 | 2025-10-18 | NONE | 91 | Veo3/Kling/Hailuo prompts, many JSON-structured, EN + ZH. |
| 34 | liu-kaining Awesome-Veo3-Prompts | https://github.com/liu-kaining/Awesome-Veo3-Prompts | 76 | 2025-08-08 | MIT | 32 | JSON shot prompts (aerial, etc.) for Veo 3, EN + ZH. |
| 35 | zbailey83 veo3-json | https://github.com/zbailey83/veo3-json | 2 | 2025-07-29 | NONE | 4 | Meta-prompts that make an LLM write Veo 3 JSON prompts (not prompts themselves). |
| 36 | zhangchenchen awesome_sora2_prompt | https://github.com/zhangchenchen/awesome_sora2_prompt | 222 | 2025-12-17 | MIT | 112 | Sora 2 viral + official prompts, includes a luxury car ad. |
| 37 | jmanhype awesome-sora2-prompts | https://github.com/jmanhype/awesome-sora2-prompts | 4 | 2026-03-25 | MIT | 47 | Five-pillar structured Sora 2 prompts and hook guides. |
| 38 | Serennity007 awesome-video-prompts | https://github.com/Serennity007/awesome-video-prompts | 1 | 2026-08-20 | MIT | 174 | Sora/Runway/Pika/Kling folders by category; short generic prompts. |
| 39 | beshuaxian higgsfield-seedance2-jineng | https://github.com/beshuaxian/higgsfield-seedance2-jineng | 1,031 | 2026-04-09 | NONE | 269 | 15 skills (cinematic, 3D, comic-to-video, music video, social hook); many palette/style snippets. |
| 40 | rediumvex ai-video-generator-claude | https://github.com/rediumvex/ai-video-generator-claude | 462 | 2026-08-11 | MIT | 80 | 10 Seedance-on-Higgsfield skills; templates. |
| 41 | HuyLe82US awesome-seedance-prompts | https://github.com/HuyLe82US/awesome-seedance-prompts | 71 | 2026-02-26 | MIT | 44 | Categorised (UGC-social, drama, anime) multi-scene prompts. |
| 42 | marsoyang1 awesome-seedance-prompts | https://github.com/marsoyang1/awesome-seedance-prompts | 35 | 2026-02-25 | NONE | 20 | 20+ templates with full storyboards. |
| 43 | lipsyncvideoai awesome-seedance-prompts | https://github.com/lipsyncvideoai/awesome-seedance-prompts | 9 | 2026-11-04 | NONE | 24 | 12 category files (beauty-fashion has UGC skincare ads); most of its ~800 prompts were exact duplicates of earlier sources. |
| 44 | ZeroLu awesome-seedance-2.5 | https://github.com/ZeroLu/awesome-seedance-2.5 | 147 | 2026-11-08 | MIT | 15 | Community X cases. |
| 45 | robonuggets seedance-skill | https://github.com/robonuggets/seedance-skill | 109 | 2026-04-14 | NONE | 15 | Motion-graphics / "liquid glass" prompting. |
| 46 | songguoxs seedance-prompt-skill | https://github.com/songguoxs/seedance-prompt-skill | 2,988 | 2026-02-12 | NONE | 8 | A prompt-writing skill, not a collection; few concrete prompts despite the star count. |
| 47 | PowerTokens media-skills | https://github.com/PowerTokens/media-skills | 0 | 2026-10-22 | MIT | 7 | Product-ad / UGC / social-variant skills; mostly code, few prompts. |
| 48 | X-RayLuan awesome-ai-video-ad-prompts | https://github.com/X-RayLuan/awesome-ai-video-ad-prompts | 0 | 2026-09-13 | MIT | 5 | "Remake the winning ad" prompts; promotional (easyveo.com CTA). |
| 49 | makernice awesome-wan-kling-prompts | https://github.com/makernice/awesome-wan-kling-prompts | 0 | 2026-11-06 | MIT | 21 | Hand-picked Wan 3.0 / Kling prompts from X with metadata. |
| 50 | Reviral-ai awesome-kling-prompts | https://github.com/Reviral-ai/awesome-kling-prompts | 0 | 2026-08-26 | MIT | 16 | 15 original Kling prompts incl. product motion, fashion. |
| 51 | Reviral-ai awesome-hailuo-prompts | https://github.com/Reviral-ai/awesome-hailuo-prompts | 0 | 2026-08-26 | MIT | 16 | 15 Hailuo prompts using its documented camera commands. |
| 52 | WaveSpeedAI awesome-kling-api | https://github.com/WaveSpeedAI/awesome-kling-api | 2 | 2026-08-26 | CC0-1.0 | 0 | Model variants + API calls; its fenced examples are code, no prompt rows survived the filter. |
| 53 | Limbicnation Video-Diffusion-Prompt-Style (HF) | https://huggingface.co/datasets/Limbicnation/Video-Diffusion-Prompt-Style | 11 likes / 152 dl | 2026-02-02 | MIT | 675 | Style-named prompts with negatives for Wan/LTX/Sora; nature/art leaning, little commercial. |
| 54 | hrrcne ai-video-prompt-book-2026 (HF) | https://huggingface.co/datasets/hrrcne/ai-video-prompt-book-2026 | 0 / 100 dl | 2026-09-26 | CC-BY-4.0 | 698 | One-line "anthropomorphic fruit/object" story prompts; viral-shorts material, low ad value. |
| 55 | SoraEase sora-prompt | https://github.com/SoraEase/sora-prompt | 53 | 2026-03-31 | CC0-1.0 | 16 | OpenAI's original Sora launch prompts. |
| 56 | hr98w awesome-sora-prompts | https://github.com/hr98w/awesome-sora-prompts | 29 | 2025-10-05 | CC0-1.0 | 68 | Sora 1 official + video-to-video edit prompts ("change the setting to …"). README is heavy on affiliate links. |
| 57 | xjpp22 awesome--sora-prompts | https://github.com/xjpp22/awesome--sora-prompts | 98 | 2024-02-23 | NONE | 62 | Director visual/editing-style prompts (Wes Anderson, Kubrick …). |
| 58 | 0xSojalSec Sora2_Prompts | https://github.com/0xSojalSec/Sora2_Prompts | 16 | 2025-10-11 | NONE | 0 | Copy of xjpp22's director list; every prompt was an exact duplicate. |
| 59 | khanof89 awesome-video-prompts | https://github.com/khanof89/awesome-video-prompts | 7 | 2025-05-19 | MIT | 14 | Old Runway Gen-2 / Pika prompts. |
| 60 | gunahkarcasper ai-video-cinematography-prompts (HF) | https://huggingface.co/datasets/gunahkarcasper/ai-video-cinematography-prompts | 0 / 25 dl | 2026-02-10 | none stated | 4 | Tiny camera CSV. |
| 61 | fei567 open-video-prompts (HF) | https://huggingface.co/datasets/fei567/open-video-prompts | 0 / 97 dl | 2026-08-07 | Apache-2.0 | 5 | Official/ported prompts incl. one product-flower ad. |
| 62 | oldwinter official-prompt-video-gallery | https://github.com/oldwinter/official-prompt-video-gallery | 0 | 2026-09-25 | MIT | 2 | Official prompts compared across models; only 2 cases. |
| 63 | geekjourneyx awesome-ai-video-prompts | https://github.com/geekjourneyx/awesome-ai-video-prompts | 89 | 2026-01-04 | MIT | 0 | A link list of official guides; no prompt text in the repo. |

## Official guides (raw/video/official-guides/, counted together as `official-guides`, 156 rows)

| Guide | URL | Rows | Licence recorded |
|---|---|---|---|
| Google DeepMind — How to create effective prompts with Veo 3 | https://deepmind.google/models/veo/prompt-guide/ | 6 | Google site terms (quoted examples) |
| Google Cloud Vertex AI — Video generation prompt guide (Veo) | https://cloud.google.com/vertex-ai/generative-ai/docs/video/video-gen-prompt-guide | 96 | CC-BY-4.0 (Google docs) |
| Kling — VIDEO 3.0 model user guide | https://app.klingai.com/global/quickstart/klingai-video-3-model-user-guide | 31 | Kling site terms (quoted examples) |
| OpenAI Cookbook — Sora 2 prompting guide | https://github.com/openai/openai-cookbook/blob/main/examples/sora/sora2_prompting_guide.ipynb | 12 | MIT |
| Wan-Video — prompt-extend system prompts (Wan 2.2, Wan 2.1) | https://github.com/Wan-Video/Wan2.2/blob/main/wan/utils/system_prompt.py | 11 | Apache-2.0 |
| Gemini API Veo docs | https://ai.google.dev/gemini-api/docs/video | 0 | page came back as a 1-line shell (JS-rendered) |
| Luma — video generation docs | https://docs.lumalabs.ai/docs/video-generation | 0 | no example prompts found in the saved page |
| MiniMax — video generation guide | https://platform.minimax.io/docs/guides/video-generation | 0 | no example prompts found in the saved page |
| Runway — Gen-4 video prompting guide | https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide | 0 | fetch failed (curl -f error; likely bot protection) |

## Seen, not collected

- WenhaoWang/VidProM (HF, 84 likes, 26,914 dl) — https://huggingface.co/datasets/WenhaoWang/VidProM — 1.67 M raw user prompts; too large for the 300 MB lane and of low ad value. Take a filtered sample later if wanted.
- zzyyun/seedance-2-prompts-datasets (HF) — same README size (7,949 B) and file layout as GokuScraper; treated as a mirror. Jason990/seedance-2-prompts-datasets has the same name; not opened.
- Rapidata text-2-video human-preference sets (Veo 2/3/3.1, Seedance, Hailuo, Runway) — benchmark prompts with ratings; not a prompt library.
- `apimart*/…-prompts`, `q7o9z6l8jhtagctl/veo3.1-veo-3.1-prompts`, `*/veo-3-1-prompts-{fr,pt,cn,ru,es,id,de,ko}`, `*/sora-2-prompts-{de,ru,ko,pt,id,ja}` — dozens of repos created around 2026-11-03..07 with near-identical "AI API gateway / relay: 307 models" or "tested image prompt recipes" descriptions; see "suspicious" in the final report.

## Seen, other lane (image)

- https://huggingface.co/datasets/Adrian2016/awesome-image-video-prompts (config `image`, 1,272 rows)
- https://github.com/oldwinter/official-prompt-gallery (text-to-image half)
- https://github.com/hr98w/awesome-sora-prompts/blob/main/image-generation-prompts.md
- https://github.com/jamez-bondos/awesome-gpt4o-images
- https://github.com/kxo85nx0/sora-2-prompts-de and its language siblings (describe themselves as "image prompt recipes")
