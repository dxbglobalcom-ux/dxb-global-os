# Sources — lane image-ads (2026-11-08)

Grade: A = agency-ready ad/commerce prompts, B = useful ad material, C = small or thin, D = low quality, V = vocabulary/modifier list.
Stars measured with `gh api repos/<r>` (stargazers_count); last commit = `git log -1 --format=%cs` of the depth-1 clone; prompts = rows in catalog-image-ads.tsv after in-lane exact dedup.

| source | url | stars | last commit | licence | prompts | note |
|---|---|---|---|---|---|---|
| kwistzzqq-byte/image2-ads-studio | https://github.com/kwistzzqq-byte/image2-ads-studio | 48 | 2026-05-05 | Apache-2.0 | 619 | A: 100 debranded ad cases plus 320 Chinese ad task templates (storefront, poster, menu, packaging) and 240 visual recipes; Chinese-heavy. |
| ecomimagelab/ecommerce-gpt-image-prompts | https://github.com/ecomimagelab/ecommerce-gpt-image-prompts | 1 | 2026-07-30 | NOASSERTION | 358 | A: long, invariant-locked e-commerce briefs (Shopify/Amazon/Etsy), each with per-platform variants and product-fidelity rules. |
| natan-webs/visual-commands | https://github.com/natan-webs/visual-commands | 4 | 2026-09-06 | MIT | 322 | A: 322 named, composable one-word visual commands (transform/camera/light/edit) with aliases and conflict rules — the closest existing thing to /kisayol itself. |
| buluslan/gpt-image2-ecommerce | https://github.com/buluslan/gpt-image2-ecommerce | 441 | 2026-09-17 | MIT | 179 | A: 39 structured e-commerce scenario templates (A+ modules, white-bg, bg swap, device mockup, 360/stop-motion sheet) with size variants. |
| JeremyGDM/awesome-ai-product-photography-prompts | https://github.com/JeremyGDM/awesome-ai-product-photography-prompts | 11 | 2026-08-09 | CC0-1.0 | 118 | A: 118 product, poster and food prompts, each with a generated example; strong commercial look. |
| cheercheung/ai-ads-for-dtc-prompts-library | https://github.com/cheercheung/ai-ads-for-dtc-prompts-library | 1 | 2026-11-05 | NOASSERTION | 109 | A: 109 DTC ad prompts (UGC, hooks, CTA, static) with [PRODUCT]/[BRAND] slots; about half are video ads. |
| NexocoreTeam/AdCreatives | https://github.com/NexocoreTeam/AdCreatives | 1 | 2026-10-26 | none | 77 | A: ad-performance templates for Meta/TikTok (Adcrate 'Cooper' static-ad formats, Nano Banana product/UGC recipes) with funnel stage, aspect ratios and [PLACEHOLDERS]. |
| lygerone/awesome-nano-banana-prompts | https://github.com/lygerone/awesome-nano-banana-prompts | 1 | 2026-10-19 | NOASSERTION | 52 | A: 52 tested product/portrait EDIT prompts (white packshot, scene swap, relight) with before/after; directly the /showcase-/lifestyleshot kind. |
| TheMattBerman/brand-shoot-kit | https://github.com/TheMattBerman/brand-shoot-kit | 18 | 2026-04-30 | none | 49 | A: full 12-shot brand shoot plans per product (PDP hero, lifestyle, detail) from 4 golden runs. |
| HF contralabs/creative-ad-design-dataset | https://huggingface.co/datasets/contralabs/creative-ad-design-dataset | 4 likes | 2026-07-22 | CC-BY-4.0 | 35 | A: 35 real ad-creative briefs (archetype, palette, typography, packaging) with product/logo/ad images upstream — briefs only, images not fetched. |
| Evolink-AI/gpt-image-2.5-for-e-commerce | https://github.com/Evolink-AI/gpt-image-2.5-for-e-commerce | 236 | 2026-09-10 | NOASSERTION | 34 | A: photo-edit e-commerce cases (scene swap, UGC, try-on) written for a supplied product photo with {variables}. |
| Wenmao-AI-Lab/ad-creative-prompts | https://github.com/Wenmao-AI-Lab/ad-creative-prompts | 0 | 2026-09-23 | none | 888 | B: 940 Chinese ad/poster prompts in 14 ad categories; short, poster-style, useful as idea stock after translation. |
| AgriciDaniel/claude-prompts | https://github.com/AgriciDaniel/claude-prompts | 117 | 2026-04-10 | MIT | 518 | B: only the products, food-drink, fashion-editorial, logos-icons, print-merchandise and vehicles categories were taken; mixed quality, influencer-heavy. |
| Ethanxwang/tvc-director | https://github.com/Ethanxwang/tvc-director | 356 | 2026-04-18 | MIT | 82 | B: TVC storyboard and keyframe prompt templates (Chinese) — ad film method, few standalone prompts. |
| wzj177/ecommerce-image-suite | https://github.com/wzj177/ecommerce-image-suite | 489 | 2026-08-27 | Apache-2.0 | 76 | B: per-platform main-image prompts (Taobao/JD/PDD/Shopify) and image-type specs; some Chinese. |
| cliprise/awesome-ai-logo-generator-prompts | https://github.com/cliprise/awesome-ai-logo-generator-prompts | 8 | 2026-04-28 | none | 49 | B: logo-concept prompts per industry. |
| cliprise/awesome-seedream-5-prompts | https://github.com/cliprise/awesome-seedream-5-prompts | 7 | 2026-04-28 | NOASSERTION | 38 | B: commercial still frames and ad posters for Seedream; short and clean. |
| photoshootapp/product-photoshoot-prompts | https://github.com/photoshootapp/product-photoshoot-prompts | 1 | 2026-07-20 | NOASSERTION | 24 | B: 24 product photoshoot prompts by category. |
| liuhengyuan666/product-photo-enhancer | https://github.com/liuhengyuan666/product-photo-enhancer | 1 | 2026-08-02 | MIT | 18 | B: Amazon scene-render prompts that freeze the supplied product. |
| xianyu110/ecommerce-image-skills | https://github.com/xianyu110/ecommerce-image-skills | 156 | 2026-10-08 | MIT | 17 | B: 12 e-commerce skills (white bg, A+, sale banner, infographic) with prompt blocks. |
| huyanxius/logo-to-stickers | https://github.com/huyanxius/logo-to-stickers | 5 | 2026-10-21 | MIT | 15 | B: logo-to-sticker-character edit prompts (needs the logo image). |
| cliprise/awesome-ai-product-photography-prompts | https://github.com/cliprise/awesome-ai-product-photography-prompts | 11 | 2026-04-28 | none | 12 | B: a small set of short packshot and lifestyle prompts. |
| OnestarQQ/amazon-visual-architect-skill | https://github.com/OnestarQQ/amazon-visual-architect-skill | 15 | 2026-03-17 | none | 11 | B: Amazon listing image prompt formulas (Chinese/English). |
| tenfoldmarc/meta-ads-generator-skill | https://github.com/tenfoldmarc/meta-ads-generator-skill | 29 | 2026-05-07 | none | 1 | B: Meta ad creative prompt formula (brand palette, headline, composition). |
| rockbenben/img-prompt | https://github.com/rockbenben/img-prompt | 370 | 2026-11-04 | MIT | 1216 | V: tag dictionary; only Photography, Light/shadow, Material, Color, Showcase, Post-processing, Shape were taken. |
| fairy-root/Flux-Prompt-Generator | https://github.com/fairy-root/Flux-Prompt-Generator | 251 | 2025-11-21 | MIT | 951 | V: large lists of lighting, composition, framing, photo type, device, background and place phrases. |
| Douleb/SDXL-A1111-Styles | https://github.com/Douleb/SDXL-A1111-Styles | 116 | 2023-08-01 | none | 712 | V: 850+ style templates; overlaps twri; many art styles, few ad-specific. |
| NUVoize/ComfyUI-BRKN-Prompt-Randomizer | https://github.com/NUVoize/ComfyUI-BRKN-Prompt-Randomizer | 19 | 2026-07-20 | none | 532 | V: camera, lighting, visual-style and location presets for Instagram-style lifestyle shots. |
| K3nt3L/MK-Styles | https://github.com/K3nt3L/MK-Styles | 46 | 2024-02-11 | CC0-1.0 | 463 | V: Fooocus/A1111 style packs; largely duplicates twri/Douleb after dedup. |
| perfectmodelslab/ComfyUI-PerfectLab | https://github.com/perfectmodelslab/ComfyUI-PerfectLab | 22 | 2026-10-25 | MIT | 234 | V: photoshoot light setups, film looks, lenses, framing, locations, materials (persona/lingerie lists skipped). |
| ComfyAssets/kiko-flux2-prompt-builder | https://github.com/ComfyAssets/kiko-flux2-prompt-builder | 68 | 2025-12-06 | MIT | 224 | V: curated camera+lens, lighting, composition, mood and photo-style phrases with names — clean vocabulary. |
| twri/sdxl_prompt_styler | https://github.com/twri/sdxl_prompt_styler | 917 | 2024-03-24 | MIT | 107 | V: the canonical SDXL style templates ({prompt} wrappers), incl. photography and advertising styles. |
| patipanpealt/alt-cinematography-reference | https://github.com/patipanpealt/alt-cinematography-reference | 2 | 2026-09-10 | none | 53 | V: shot sizes, angles, movement, lighting and composition with prompt phrasing. |
| xoxxel/camera-prompts | https://github.com/xoxxel/camera-prompts | 6 | 2025-10-31 | none | 41 | V: 40+ camera angle and shot-type examples on one car subject (good automotive reference). |
| thundercat71/Automatic1111-Fooocus-Styles | https://github.com/thundercat71/Automatic1111-Fooocus-Styles | 55 | 2023-10-12 | none | 27 | V: Fooocus styles for A1111; mostly duplicates. |
| HF svjack/MAUVIKAT_Product_Posters_Prompts | https://huggingface.co/datasets/svjack/MAUVIKAT_Product_Posters_Prompts | 0 likes | 2025-08-05 | none stated | 50 | C: 50 product-category poster prompts built around one game character — layout useful, subject not. |
| HF Octavian-labs/instagram-fashion-prompts-v1 | https://huggingface.co/datasets/Octavian-labs/instagram-fashion-prompts-v1 | 1 like | 2025-11-20 | MIT | 15 | C: 15 Instagram fashion prompts. |
| pranjal-25-2006/product-photo-prompts | https://github.com/pranjal-25-2006/product-photo-prompts | 0 | 2026-10-26 | MIT | 11 | C: 11 short product prompts. |
| monju252/AI-Prompts-for-Logo-Design | https://github.com/monju252/AI-Prompts-for-Logo-Design | 1 | 2025-07-24 | none | 10 | C: 10 short logo prompts. |
| monju252/AI-Prompts-for-Product-Mockups | https://github.com/monju252/AI-Prompts-for-Product-Mockups | 1 | 2025-07-25 | none | 10 | C: 10 short mockup prompts. |
| arjavjain12/brandprompt | https://github.com/arjavjain12/brandprompt | 1 | 2026-02-13 | none | 8 | C: 8 product prompts embedded in a gallery page. |
| QIYU-JACKMAN/codexQIYU-image-workflow | https://github.com/QIYU-JACKMAN/codexQIYU-image-workflow | 107 | 2026-08-19 | none | 6 | C: workflow skill; few prompt blocks survive the noise filter. |
| designrique/ai-graphic-design-skill | https://github.com/designrique/ai-graphic-design-skill | 32 | 2026-04-01 | MIT | 5 | C: logo/brand skill, 7 prompt blocks. |
| aithink001/ai-perfume-product-photography-prompts | https://github.com/aithink001/ai-perfume-product-photography-prompts | 1 | 2026-07-08 | NOASSERTION | 4 | C: 4 perfume packshot prompts. |
| DarkKandaoMaster/fashion-portrait-prompts | https://github.com/DarkKandaoMaster/fashion-portrait-prompts | 26 | 2026-10-17 | MIT | 4 | C: fashion portrait template skill, 4 blocks. |
| CSd0109/ai-ad-generator-creative-hooks | https://github.com/CSd0109/ai-ad-generator-creative-hooks | 0 | 2026-09-25 | NOASSERTION | 3 | C: 4 static ad prompts with model notes. |
| CSd0109/food-photography-ai-prompts | https://github.com/CSd0109/food-photography-ai-prompts | 0 | 2026-09-25 | NOASSERTION | 3 | C: 4 food prompts. |
| beatra-ai/ai-product-photography-skill | https://github.com/beatra-ai/ai-product-photography-skill | 8 | 2026-10-28 | MIT-0 | 3 | C: an API-wrapper skill; 3 blocks. |
| robonuggets/fantastic-posters | https://github.com/robonuggets/fantastic-posters | 65 | 2026-04-29 | MIT | 2 | C: 31 poster styles described in prose; only 2 fenced prompts extracted. |
| feichanggege/ecommerce-visual-copywriting-skill | https://github.com/feichanggege/ecommerce-visual-copywriting-skill | 1047 | 2026-10-30 | MIT | 1 | C: high-star (1047) but it is an e-commerce copy/visual SOP for an agent, not a prompt library; 8 blocks. |
| huikku/NBPro-campaign-guide | https://github.com/huikku/NBPro-campaign-guide | 3 | 2026-07-17 | none | 1 | C: campaign field guide for Nano Banana Pro; mostly method, 3 blocks. |
| HF Falah/fashion_photography_prompts_SDXL | https://huggingface.co/datasets/Falah/fashion_photography_prompts_SDXL | 2 likes | 2023-08-12 | none stated | 575 | D: templated synthetic set of 1M rows; first 621 fetched before the HF 429 limit, 575 unique. |
| HF Falah/logo_prompts | https://huggingface.co/datasets/Falah/logo_prompts | 1 like | 2023-10-04 | none stated | 417 | D: templated synthetic logo prompts; 417 fetched before the HF 429 limit. |
| HF Falah/catalogue_photography_prompts | https://huggingface.co/datasets/Falah/catalogue_photography_prompts | 1 like | 2023-09-23 | none stated | 15 | D: 1000 rows but only 15 unique prompts (measured). |
| HF Falah/product_photography_prompts | https://huggingface.co/datasets/Falah/product_photography_prompts | 3 likes | 2023-09-23 | none stated | 8 | D: 1000 rows but only 8 unique prompts (measured). |
| HF Falah/luxurious_food_photography_prompts | https://huggingface.co/datasets/Falah/luxurious_food_photography_prompts | 0 likes | 2023-09-23 | none stated | 5 | D: 1000 rows but only 5 unique prompts (measured). |

Total rows: 9417

## Looked at, 0 rows (raw folder removed)

| source | url | stars | last commit | licence | why 0 |
|---|---|---|---|---|---|
| subhacademic-cmd/prompt-craft-ecommerce-visuals | https://github.com/subhacademic-cmd/prompt-craft-ecommerce-visuals | 2 | 2026-11-08 | none | SUSPICIOUS: an hourly GitHub Action (`.github/workflows/iNZIlozdUEno.yml`) makes fake commits to look active, and the README pushes a "Download" link. No prompts. Removed. |
| prismprompt-hub/30-Product-Photography-Prompts, 100-Premium-…, 50-Best-Camera-Angle-Prompts | https://github.com/prismprompt-hub | 1 each | 2026-10-12 | none | Email-capture landing pages for a PDF; the repositories hold no prompts. |
| Seyead11/ai-product-photography-prompts | https://github.com/Seyead11/ai-product-photography-prompts | 0 | 2026-06-19 | MIT | README only, no prompts. |
| zuriyaazreen/ZURIYA | https://github.com/zuriyaazreen/ZURIYA | 1 | 2026-03-15 | MIT | A JS prompt generator, not a prompt list. |
| junosha/Midjourney-Cheat-Sheet | https://github.com/junosha/Midjourney-Cheat-Sheet | 33 | 2023-07-14 | none | 926-byte README with links only. |
| silvermete0r/product-multi-view-integration-guide-nano-banana | https://github.com/silvermete0r/product-multi-view-integration-guide-nano-banana | 5 | 2025-09-08 | none | Points to an AI Studio app; the /360view prompt itself is not in the repo. |
| Maynor996/gpt-image-2-ecommerce-product-visual-workflow | https://github.com/Maynor996/gpt-image-2-ecommerce-product-visual-workflow | 3 | 2026-04-18 | none | Workflow prose only. |
| jinwei1660/Comfyui_AJPrompt | https://github.com/jinwei1660/Comfyui_AJPrompt | 17 | 2024-11-06 | Apache-2.0 | Prompt generator code; the vocabulary lives in Python code. |
| jandan520/ComfyUI-AdvancedCameraPrompts | https://github.com/jandan520/ComfyUI-AdvancedCameraPrompts | 37 | 2025-11-12 | MIT | Camera ranges in Python code (shot size vs focal length); no prompt list. |
| yuehonam0729-del/film-stock-intelligence | https://github.com/yuehonam0729-del/film-stock-intelligence | 1 | 2026-08-13 | MIT | Film-stock knowledge base whose data is audit schemas, not prompt phrases. |
| irxlion/ad-creative-ai-prompts | https://github.com/irxlion/ad-creative-ai-prompts | 1 | 2025-12-29 | none | Two LLM copy-optimisation prompts, no image prompts. |
| atuizz/posewear | https://github.com/atuizz/posewear | 86 | 2026-11-01 | MIT | Pose and outfit lists for portrait try-on. They include many sexualised poses and add little for ads, so they were not cataloged. |
| HF mrzjy/creative-ad-prompts-zh | https://huggingface.co/datasets/mrzjy/creative-ad-prompts-zh | 0 likes | 2025-02-14 | MIT | 1216 rows of LLM ad-copywriting chat (text copy), not image prompts. |
| HF Falah/photography_style_prompts_camera | https://huggingface.co/datasets/Falah/photography_style_prompts_camera | 1 like | 2023-09-26 | none stated | Not fetched: HF datasets-server returned 429 on every try. |
| HF AlekseyKorshuk/product-photography-v1-categorized | https://huggingface.co/datasets/AlekseyKorshuk/product-photography-v1-categorized | 0 likes | 2024-02-20 | — | Gated or private: datasets-server says the dataset is not accessible. |

## Suspicious

- subhacademic-cmd/prompt-craft-ecommerce-visuals: see above. It uses a commit-bump bot and a download lure.
- `gh search repos "nano banana prompts"` returned a network of near-identical repositories from random-letter accounts created 2026-11-07/08 (`zwtdva8/…-ru`, `zd692prvmq/…-ja`, `erujt71i1lx/…-pt`, `ycx8l0/…`, `f84q06w110/…-fr`, `uiyflzgo/…-ko`, `vsa185x9ecrd/…-id`, `l-2jb09sq/…-ko`, `ggpbi40ss/…-ru`). The same pattern appears for FLUX Kontext (`a41fx2qbyb41bb/flux-kontext-pro-prompts-pt`, `atpfffifl97hm/…`, `z9umz0nkurue8/…`), and `apimartqxl0cs/flux-kontext-prompts` describes itself as an "API gateway / relay". These look like SEO/API-reseller spam. None were collected.
- `fujc683/gpt-image-2-6-*` has six repositories with about 100 stars each, all created 2026-11-06. The star counts look inflated. Not collected.
- Falah HF sets: 1000 rows each but 5–15 unique prompts (measured). They are padded by duplication.

## Seen, other lane

image-general:
- https://github.com/freestylefly/awesome-gpt-image-2 (35566★) — has e-commerce/poster cases inside a general library
- https://github.com/Evolink-AI/awesome-gpt-image-2-API-Prompts (17392★)
- https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts (13752★) — has product/ad categories inside
- https://github.com/ZeroLu/awesome-nanobanana-pro (10386★)
- https://github.com/YouMind-OpenLab/awesome-gpt-image-2 (10254★)
- https://github.com/jamez-bondos/awesome-gpt4o-images (8157★)
- https://github.com/PicoTrex/Awesome-Nano-Banana-images (24028★)
- https://github.com/ai-boost/awesome-image-video-prompts (3453★)
- https://github.com/ZeroLu/awesome-gpt-image (2293★)
- https://github.com/YouMind-OpenLab/ai-image-prompts-skill (1367★)
- https://github.com/VigoZhao/AI-Visual-Prompt-Cookbook (837★) — JSON style prompts
- https://github.com/xianyu110/awesome-nanobananapro-prompts (816★)
- https://github.com/jau123/nanobanana-trending-prompts (750★)
- https://github.com/ImgEdify/Awesome-GPT4o-Image-Prompts (587★)
- https://github.com/youart-open-source/awesome-gpt-image-2-5-prompts (573★)
- https://github.com/BaYue-SYJ/shuixian-prompts (545★)
- https://github.com/Jermic/awesome-aiart-pics-prompts (545★) — includes a marketing category
- https://github.com/songtianlun/awesome-prompts (484★)
- https://github.com/davidwuw0811-boop/awesome-gpt-image2-prompts (334★)
- https://github.com/dongyubin/Awesome-AI-Images-Prompts (296★)
- https://github.com/devanshug2307/Awesome-AI-Image-Prompts (293★)
- https://github.com/gpt-image2/awesome-gptimage2-prompts (230★)
- https://github.com/itgoyo/awesome-gpt-image2-prompt (139★)
- https://github.com/tigerowo/awesome-gpt-image-2-prompts (79★)
- https://github.com/ApiMartAI/best-gpt-image-2-prompts (59★)
- https://github.com/EvoLinkAI/awesome-ideogram-4.0-prompts (40★)
- https://github.com/fujc683/awesome-nano-banana-pro-prompts, https://github.com/fujc683/awesome-nano-banana-2-prompts
- https://github.com/Banana-Prompts/awesome-nano-banana-prompts, https://github.com/GarvitOfficial/nanoBananaPrompts
- https://github.com/2slides/awesome-nano-banana-ppt-prompts
- https://github.com/AgriciDaniel/claude-prompts — the non-commerce categories (portraits, landscapes, sci-fi, abstract, etc.)
- HF: https://huggingface.co/datasets/succinctly/midjourney-prompts, https://huggingface.co/datasets/MohamedRashad/midjourney-detailed-prompts, https://huggingface.co/datasets/vivym/midjourney-prompts

video:
- https://github.com/ZeroLu/awesome-seedance (2825★)
- https://github.com/YouMind-OpenLab/awesome-seedance-2-prompts (2204★) — has ads/UGC
- https://github.com/OSideMedia/higgsfield-ai-prompt-skill (874★) — has a product-UGC showcase template
- https://github.com/beshuaxian/higgsfield-seedance2-jineng (1031★)
- https://github.com/BeatAPI/awesome-minimax-h3-prompts (209★), https://github.com/flaqai/awesome-minimax-h3-video-prompts
- https://github.com/Rylaispirit/cinematic-video-prompt-skill (178★) — camera moves/lighting cheat sheet
- https://github.com/cliprise/awesome-ai-ugc-video-prompts (53★)
- https://github.com/ugcadai-byte/ugc-ad-prompts — 500+ UGC ad hooks/scripts
- https://github.com/flaqai/awesome_wan-3-0-prompts, https://github.com/bestimageai/awesome_wan-3-0-prompts
- https://github.com/Reviral-ai/seedance-2.5-prompts — product ads, UGC, B-roll
- https://github.com/weshopai/awesome-Seedance-2.0-prompt, https://github.com/HuyLe82US/awesome-seedance-prompts
- https://github.com/cindyxu1030/motion-graphics-prompt-bank — logo/product motion
- https://github.com/tfcbot/wavespeed-claude-video — clone-an-ad workflow
