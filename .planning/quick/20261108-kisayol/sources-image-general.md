# Sources — lane image-general (collected 2026-11-08)

Stars = GitHub `stargazers_count` / Hugging Face `likes`, read from the API on 2026-11-08.
Date = GitHub `pushed_at` / HF `lastModified`. Rows = rows of this source in
`catalog-image-general.tsv` after exact-duplicate removal across the lane (a prompt that
already appeared in an earlier source is counted there, not here). "Ad share" = rows whose prompt
matches product/ad/brand/poster/food/cosmetics/fashion/interior/car/real-estate/logo/mockup words.

Scripts: `scripts/image-general/clone.sh` (text-only sparse clone), `hf_fetch.py` (HF export +
keyword-filtered subsets), `build_catalog.py` (TSV), `check_catalog.py` (header, fields, values,
duplicates, and 150 sampled prompts per source found again in that source's raw files).

## GitHub

| Name | URL | Stars | Date | Licence | Rows | Ad share | Note for an ad agency |
|---|---|---|---|---|---|---|---|
| youart GPT Image 2.5 prompts | https://github.com/youart-open-source/awesome-gpt-image-2-5-prompts | 573 | 2026-09-11 | own terms file (author credit) | 150 | 74% | Best-curated: 9 use cases incl. ad-creative, ecommerce-product, poster; every prompt credit-audited. |
| EvoLink GPT-Image-2 API & Prompts | https://github.com/Evolink-AI/awesome-gpt-image-2-API-Prompts | 17,392 | 2026-07-18 | CC0-1.0 | 845 | 55% | Large case files split by ad-creative / ecommerce / poster / portrait / UI; strong product-ad and storyboard prompts. |
| YouMind AI Image Prompts skill | https://github.com/YouMind-OpenLab/ai-image-prompts-skill | 1,367 | 2026-11-08 | MIT | 3,701 (+11,282 rows elsewhere tagged `usecase:`) | 31% | Full YouMind library (manifest: 15,847) in use-case files incl. product-marketing 5,779 and ecommerce-main-image 582; no model named. |
| freestylefly awesome-gpt-image-2 | https://github.com/freestylefly/awesome-gpt-image-2 | 35,566 | 2026-11-05 | MIT | 239 | 51% | 541 cases + industrial templates; many overlap EvoLink/YouMind. |
| davidwuw GPT Image 2 prompts | https://github.com/davidwuw0811-boop/awesome-gpt-image2-prompts | 334 | 2026-05-02 | none stated | 489 | 37% | Templated prompts with [placeholders] and an `advertising` category; good shortcut raw material. |
| jau123 nanobanana trending | https://github.com/jau123/nanobanana-trending-prompts | 750 | 2026-04-29 | CC-BY-4.0 | 1,113 | 62% | 1,446 X prompts ranked by engagement (likes/views kept in raw). |
| YouMind awesome-gpt-image-2 | https://github.com/YouMind-OpenLab/awesome-gpt-image-2 | 10,254 | 2026-11-08 | CC-BY-4.0 | 121 | 48% | README shows featured subset only; full set comes via the skill and Goku dataset. |
| YouMind awesome-nano-banana-pro-prompts | https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts | 13,752 | 2026-11-08 | CC-BY-4.0 | 129 | 45% | Same family; README subset. |
| YouMind awesome-seedream-4.5 | https://github.com/YouMind-OpenLab/awesome-seedream-4.5 | 63 | 2026-11-08 | CC-BY-4.0 | 111 | 41% | Seedream-specific prompts. |
| ZeroLu awesome-gpt-image | https://github.com/ZeroLu/awesome-gpt-image | 2,293 | 2026-11-08 | MIT | 64 | 28% | Small, hand-picked. |
| ZeroLu awesome-nanobanana-pro | https://github.com/ZeroLu/awesome-nanobanana-pro | 10,386 | 2026-11-08 | MIT | 67 | 41% | Small, hand-picked. |
| xianyu110 awesome-nanobananapro-prompts | https://github.com/xianyu110/awesome-nanobananapro-prompts | 816 | 2026-10-06 | MIT | 1,024 | 21% | 630 items, mostly Chinese titles; selfie/portrait heavy. |
| PicoTrex Awesome-Nano-Banana-images | https://github.com/PicoTrex/Awesome-Nano-Banana-images | 24,028 | 2026-09-03 | Apache-2.0 | 136 | 21% | Edit/transform showcases (figurine, style transfer); many need an input photo. |
| JimmyLv awesome-nano-banana | https://github.com/JimmyLv/awesome-nano-banana | 8,799 | 2025-09-08 | CC-BY-4.0 (NOTICE) | 96 | 4% | Creative edit cases; its `cases/` folder is byte-identical to jamez-bondos (see below). |
| glidea banana-prompt-quicker | https://github.com/glidea/banana-prompt-quicker | 2,406 | 2026-08-25 | MIT | 234 | 0% (Chinese text, keyword test is English) | Chinese work prompts (posters, slides), with generate/edit mode. |
| jamez-bondos awesome-gpt4o-images | https://github.com/jamez-bondos/awesome-gpt4o-images | 8,157 | 2025-05-26 | CC-BY-4.0 (NOTICE) | 92 | 33% | Classic GPT-4o case set (YAML per case). |
| ImgEdify Awesome-GPT4o-Image-Prompts | https://github.com/ImgEdify/Awesome-GPT4o-Image-Prompts | 587 | 2025-05-15 | MIT | 69 | 18% | 76 prompts in Prompts.html; brand-styled 3D renders. |
| songtianlun awesome-prompts | https://github.com/songtianlun/awesome-prompts | 484 | 2026-10-31 | MIT | 193 | 30% | Structured cases with tips; also mirrors older galleries. |
| devanshug2307 Awesome-AI-Image-Prompts | https://github.com/devanshug2307/Awesome-AI-Image-Prompts | 293 | 2026-08-08 | MIT | 243 | 46% | Copy-ready JSON prompts. |
| dongyubin Awesome-AI-Images-Prompts | https://github.com/dongyubin/Awesome-AI-Images-Prompts | 296 | 2026-10-07 | none stated | 50 | 12% | Chinese, multi-model. |
| samuxbuilds awesome-prompts | https://github.com/samuxbuilds/awesome-prompts | 28 | 2025-12-25 | MIT | 899 (7 video) | 35% | One file per prompt with category (3d, posters, thumbnails, icons, motion). |
| fujc683 Nano Banana Pro prompts | https://github.com/fujc683/awesome-nano-banana-pro-prompts | 63 | 2026-11-08 | CC-BY-4.0 | 252 | 26% | Keyword-list prompts, looks generated (see suspicious). |
| fujc683 Nano Banana 2 prompts | https://github.com/fujc683/awesome-nano-banana-2-prompts | 62 | 2026-11-08 | CC-BY-4.0 | 252 | 26% | Same generator. |
| fujc683 Seedream 5 prompts | https://github.com/fujc683/awesome-seedream-5-prompts | 69 | 2026-11-08 | CC-BY-4.0 | 252 | 26% | Same generator. |
| fujc683 Qwen-Image prompts | https://github.com/fujc683/awesome-qwen-image-prompts | 59 | 2026-11-08 | CC-BY-4.0 | 0 | — | All 252 prompts identical to the Seedream 5 repo, so all were removed as duplicates. |
| ZizheRuan awesome-nanobanana2 | https://github.com/ZizheRuan/awesome-nanobanana2 | 189 | 2026-02-26 | Apache-2.0 | 39 | 17% | Small. |
| StevenQi7 Awesome-Seedream-Four-Images | https://github.com/StevenQi7/Awesome-Seedream-Four-Images | 131 | 2025-09-22 | Apache-2.0 | 17 | 29% | Small Seedream 4 set. |
| Ezagor-dev awesome-midjourney-prompts | https://github.com/Ezagor-dev/awesome-midjourney-prompts | 14 | 2023-02-22 | CC0-1.0 | 16 | 0% | Old, short MJ art prompts. |

## Hugging Face

| Name | URL | Likes | Date | Licence | Rows | Ad share | Note for an ad agency |
|---|---|---|---|---|---|---|---|
| Goku-OpenLab gpt-image-2 prompts | https://huggingface.co/datasets/Goku-OpenLab/gpt-image-2-prompts-datasets | 21 | 2026-10-06 | CC-BY-4.0 | 19,937 | 48% | 21,113 records with category, source link and `{argument}` placeholders; all rated Safe for Work. Raw keeps text fields only (images and specs dropped). |
| Goku-OpenLab nano-banana-pro prompts | https://huggingface.co/datasets/Goku-OpenLab/nano-banana-pro-prompts-datasets | 5 | 2026-07-29 | CC-BY-4.0 | 26,719 | 33% | 27,549 records, same schema. |
| Adrian2016 awesome-image-video-prompts (image config) | https://huggingface.co/datasets/Adrian2016/awesome-image-video-prompts | 1 | 2026-10-30 | other | 936 | 61% | Edit/transform prompts with notes on why they work; image config only. |
| danielrosehill Text-To-Image-Test-Prompts | https://huggingface.co/datasets/danielrosehill/Text-To-Image-Test-Prompts | 1 | 2025-04-11 | Apache-2.0 | 188 | 28% | Test prompts by folder, incl. `marketing-collateral`, `brands`, `logo-design`. |
| fal image-generation-prompts | https://huggingface.co/datasets/fal/image-generation-prompts | 16 | 2025-09-02 | none stated | 800 | 13% | Long, detailed evaluation prompts; category ids only. |
| k-mktr improved-flux-prompts | https://huggingface.co/datasets/k-mktr/improved-flux-prompts | 64 | 2024-09-27 | MIT | 17,307 | 2% | LLM-rewritten FLUX prompts, mostly art and scenes. |
| nateraw parti-prompts | https://huggingface.co/datasets/nateraw/parti-prompts | 75 | 2022-06-22 | Apache-2.0 | 1,482 | 3% | Google PartiPrompts benchmark; useful as a model test set, not as ads. |
| Gustavosta Stable-Diffusion-Prompts | https://huggingface.co/datasets/Gustavosta/Stable-Diffusion-Prompts | 541 | 2022-09-18 | unknown | 67,076 | 5% | 81,910 general art prompts (Lexica), marked `general-art`. |
| poloclub DiffusionDB (filtered) | https://huggingface.co/datasets/poloclub/diffusiondb | 679 | 2024-01-22 | CC0-1.0 | 19,527 | 100% (filter) | 2,000,000 prompts scanned; 80,776 unique matched; 20,000 written. |
| FredZhang7 stable-diffusion-prompts-2.47M (filtered) | https://huggingface.co/datasets/FredZhang7/stable-diffusion-prompts-2.47M | 41 | 2023-02-11 | creativeml-openrail-m | 13,201 | 100% (filter) | 2,473,022 scanned; 120,467 matched; 20,000 written. |
| vivym midjourney-messages (filtered) | https://huggingface.co/datasets/vivym/midjourney-messages | 128 | 2023-08-29 | Apache-2.0 | 19,992 | 100% (filter) | Files 000000–000003 only (4,000,000 messages scanned of 58 files); 101,783 matched; 20,000 written. |
| succinctly midjourney-prompts (filtered) | https://huggingface.co/datasets/succinctly/midjourney-prompts | 109 | 2022-07-22 | Apache-2.0 | 3,191 | 100% (filter) | 246,381 scanned (many are one-word fragments); 3,202 matched. |

The filter for the four scraped-log datasets: the prompt must contain one of product(s),
advertis*, commercial(s), packaging, studio shot, e-commerce, brand(s/ing/ed), poster(s),
billboard(s), food, cosmetic(s), fashion, interior(s), car(s), real estate. Rows with NSFW
words (nude, naked, lingerie, bikini, sexy, erotic, …; full list in `hf_fetch.py`) are
dropped. The 20,000 are picked round-robin across the first matched keyword. The category
column for these rows says `filtered-ad-keyword:<keyword>`.

## Seen, other lane

- image-ads: https://huggingface.co/datasets/Falah/product_photography_prompts · https://huggingface.co/datasets/AlekseyKorshuk/product-photography-v1-tiny-prompts-tasks-collage-filtered (and 8 more AlekseyKorshuk/product-photography-* sets) · https://huggingface.co/datasets/raresense/Product_Photography_Dataset · https://github.com/subhacademic-cmd/prompt-craft-ecommerce-visuals · https://github.com/felipealmeidasid/Pack-skills-for-archviz · https://github.com/cliprise/awesome-seedream-5-prompts (product photography) · https://github.com/weshopai/awesome-seedream-5.0-prompts · https://github.com/Mirage3125/VisionCraft
- video: https://huggingface.co/datasets/Adrian2016/awesome-image-video-prompts (video config) · `docs/text-to-video/awesome-sora2.md` inside songtianlun/awesome-prompts (not catalogued) · https://github.com/google-marketing-solutions/vigenair

## Seen, not pulled (reason)

- https://huggingface.co/datasets/data-is-better-together/open-image-preferences-v1 — 8,667 prompts but 11.7 GB with images; HF answered HTTP 429 (anonymous rate limit) on the column read.
- https://huggingface.co/datasets/Photoroom/midjourney-v6-recap — 1.2 M rows; its `prompt` column is a short caption, not the Midjourney prompt.
- https://huggingface.co/datasets/Kazimir-ai/text-to-image-prompts — keyword counts (`masterpiece, 434,551`), not prompts.
- https://huggingface.co/datasets/codeShare/text-to-image-prompts — vocabulary fragments and Colab notebooks.
- https://huggingface.co/datasets/ProGamerGov/synthetic-dataset-1m-dalle3-high-quality-captions — image captions, not prompts.
- stablellama/erotic-image-prompts and similar NSFW datasets — not pulled: outside the holding's Islamic boundary.
- https://github.com/YouMind-OpenLab/nano-banana-pro-prompts-recommend-skill (1,899★), https://github.com/gokuscraper/nano-banana-pro-prompts-skill — same YouMind/Goku library already held.
- https://github.com/fujc683/awesome-seedream-5-flash-prompts — same generator as the fujc683 repos above.
- apimart*/ multilingual "nano-banana-pro-api-prompts-*" repos and t9hid1p6ue2a/midjourney-prompts — API-reseller advertising repos (see suspicious).
- Prompt generators without prompt lists: fairy-root/Flux-Prompt-Generator, Amery2010/midjourney-prompt-generator, daspartho/prompt-extend, ideogram-oss/ideogram4 (model code).
