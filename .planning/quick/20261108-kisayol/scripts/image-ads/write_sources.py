"""Write sources-image-ads.md from measured metadata + build.log counts + hand notes."""
import os, re
B = "/home/dxb/DxB Global OS/.planning/quick/20261108-kisayol"
S = B + "/scripts/image-ads"
meta = {l.split("\t")[0]: l.rstrip("\n").split("\t") for l in open(S + "/repo-meta.tsv")}
dates = dict(l.rstrip("\n").split("\t") for l in open(S + "/commit-dates.tsv"))
counts = {}
for l in open(S + "/build.log"):
    m = re.match(r"(\d+)\t(\S+)", l)
    if m:
        counts[m.group(2)] = int(m.group(1))
HF = {  # id: (likes, lastModified, licence) measured from huggingface.co/api/datasets
    "contralabs/creative-ad-design-dataset": ("4 likes", "2026-07-22", "CC-BY-4.0"),
    "Octavian-labs/instagram-fashion-prompts-v1": ("1 like", "2025-11-20", "MIT"),
    "svjack/MAUVIKAT_Product_Posters_Prompts": ("0 likes", "2025-08-05", "none stated"),
    "Falah/product_photography_prompts": ("3 likes", "2023-09-23", "none stated"),
    "Falah/catalogue_photography_prompts": ("1 like", "2023-09-23", "none stated"),
    "Falah/luxurious_food_photography_prompts": ("0 likes", "2023-09-23", "none stated"),
    "Falah/fashion_photography_prompts_SDXL": ("2 likes", "2023-08-12", "none stated"),
    "Falah/logo_prompts": ("1 like", "2023-10-04", "none stated"),
}
NOTE = {
 "natan-webs/visual-commands": "A: 322 named, composable one-word visual commands (transform/camera/light/edit) with aliases and conflict rules — the closest existing thing to /kisayol itself.",
 "NexocoreTeam/AdCreatives": "A: ad-performance templates for Meta/TikTok (Adcrate 'Cooper' static-ad formats, Nano Banana product/UGC recipes) with funnel stage, aspect ratios and [PLACEHOLDERS].",
 "ecomimagelab/ecommerce-gpt-image-prompts": "A: long, invariant-locked e-commerce briefs (Shopify/Amazon/Etsy), each with per-platform variants and product-fidelity rules.",
 "Evolink-AI/gpt-image-2.5-for-e-commerce": "A: photo-edit e-commerce cases (scene swap, UGC, try-on) written for a supplied product photo with {variables}.",
 "lygerone/awesome-nano-banana-prompts": "A: 52 tested product/portrait EDIT prompts (white packshot, scene swap, relight) with before/after; directly the /showcase-/lifestyleshot kind.",
 "cheercheung/ai-ads-for-dtc-prompts-library": "A: 109 DTC ad prompts (UGC, hooks, CTA, static) with [PRODUCT]/[BRAND] slots; about half are video ads.",
 "kwistzzqq-byte/image2-ads-studio": "A: 100 debranded ad cases plus 320 Chinese ad task templates (storefront, poster, menu, packaging) and 240 visual recipes; Chinese-heavy.",
 "buluslan/gpt-image2-ecommerce": "A: 39 structured e-commerce scenario templates (A+ modules, white-bg, bg swap, device mockup, 360/stop-motion sheet) with size variants.",
 "TheMattBerman/brand-shoot-kit": "A: full 12-shot brand shoot plans per product (PDP hero, lifestyle, detail) from 4 golden runs.",
 "JeremyGDM/awesome-ai-product-photography-prompts": "A: 118 product, poster and food prompts, each with a generated example; strong commercial look.",
 "Wenmao-AI-Lab/ad-creative-prompts": "B: 940 Chinese ad/poster prompts in 14 ad categories; short, poster-style, useful as idea stock after translation.",
 "AgriciDaniel/claude-prompts": "B: only the products, food-drink, fashion-editorial, logos-icons, print-merchandise and vehicles categories were taken; mixed quality, influencer-heavy.",
 "wzj177/ecommerce-image-suite": "B: per-platform main-image prompts (Taobao/JD/PDD/Shopify) and image-type specs; some Chinese.",
 "Ethanxwang/tvc-director": "B: TVC storyboard and keyframe prompt templates (Chinese) — ad film method, few standalone prompts.",
 "cliprise/awesome-seedream-5-prompts": "B: commercial still frames and ad posters for Seedream; short and clean.",
 "cliprise/awesome-ai-logo-generator-prompts": "B: logo-concept prompts per industry.",
 "cliprise/awesome-ai-product-photography-prompts": "B: a small set of short packshot and lifestyle prompts.",
 "photoshootapp/product-photoshoot-prompts": "B: 24 product photoshoot prompts by category.",
 "huyanxius/logo-to-stickers": "B: logo-to-sticker-character edit prompts (needs the logo image).",
 "liuhengyuan666/product-photo-enhancer": "B: Amazon scene-render prompts that freeze the supplied product.",
 "xianyu110/ecommerce-image-skills": "B: 12 e-commerce skills (white bg, A+, sale banner, infographic) with prompt blocks.",
 "OnestarQQ/amazon-visual-architect-skill": "B: Amazon listing image prompt formulas (Chinese/English).",
 "tenfoldmarc/meta-ads-generator-skill": "B: Meta ad creative prompt formula (brand palette, headline, composition).",
 "ComfyAssets/kiko-flux2-prompt-builder": "V: curated camera+lens, lighting, composition, mood and photo-style phrases with names — clean vocabulary.",
 "fairy-root/Flux-Prompt-Generator": "V: large lists of lighting, composition, framing, photo type, device, background and place phrases.",
 "rockbenben/img-prompt": "V: tag dictionary; only Photography, Light/shadow, Material, Color, Showcase, Post-processing, Shape were taken.",
 "perfectmodelslab/ComfyUI-PerfectLab": "V: photoshoot light setups, film looks, lenses, framing, locations, materials (persona/lingerie lists skipped).",
 "NUVoize/ComfyUI-BRKN-Prompt-Randomizer": "V: camera, lighting, visual-style and location presets for Instagram-style lifestyle shots.",
 "patipanpealt/alt-cinematography-reference": "V: shot sizes, angles, movement, lighting and composition with prompt phrasing.",
 "xoxxel/camera-prompts": "V: 40+ camera angle and shot-type examples on one car subject (good automotive reference).",
 "twri/sdxl_prompt_styler": "V: the canonical SDXL style templates ({prompt} wrappers), incl. photography and advertising styles.",
 "Douleb/SDXL-A1111-Styles": "V: 850+ style templates; overlaps twri; many art styles, few ad-specific.",
 "K3nt3L/MK-Styles": "V: Fooocus/A1111 style packs; largely duplicates twri/Douleb after dedup.",
 "thundercat71/Automatic1111-Fooocus-Styles": "V: Fooocus styles for A1111; mostly duplicates.",
 "pranjal-25-2006/product-photo-prompts": "C: 11 short product prompts.",
 "monju252/AI-Prompts-for-Logo-Design": "C: 10 short logo prompts.",
 "monju252/AI-Prompts-for-Product-Mockups": "C: 10 short mockup prompts.",
 "arjavjain12/brandprompt": "C: 8 product prompts embedded in a gallery page.",
 "QIYU-JACKMAN/codexQIYU-image-workflow": "C: workflow skill; few prompt blocks survive the noise filter.",
 "feichanggege/ecommerce-visual-copywriting-skill": "C: high-star (1047) but it is an e-commerce copy/visual SOP for an agent, not a prompt library; 8 blocks.",
 "designrique/ai-graphic-design-skill": "C: logo/brand skill, 7 prompt blocks.",
 "CSd0109/ai-ad-generator-creative-hooks": "C: 4 static ad prompts with model notes.",
 "CSd0109/food-photography-ai-prompts": "C: 4 food prompts.",
 "aithink001/ai-perfume-product-photography-prompts": "C: 4 perfume packshot prompts.",
 "DarkKandaoMaster/fashion-portrait-prompts": "C: fashion portrait template skill, 4 blocks.",
 "huikku/NBPro-campaign-guide": "C: campaign field guide for Nano Banana Pro; mostly method, 3 blocks.",
 "beatra-ai/ai-product-photography-skill": "C: an API-wrapper skill; 3 blocks.",
 "lorena-bordonaba-pau/product-studio": "C: product photo/video plugin; 2 blocks (shot plans are prose).",
 "robonuggets/fantastic-posters": "C: 31 poster styles described in prose; only 2 fenced prompts extracted.",
}
HFNOTE = {
 "contralabs/creative-ad-design-dataset": "A: 35 real ad-creative briefs (archetype, palette, typography, packaging) with product/logo/ad images upstream — briefs only, images not fetched.",
 "Octavian-labs/instagram-fashion-prompts-v1": "C: 15 Instagram fashion prompts.",
 "svjack/MAUVIKAT_Product_Posters_Prompts": "C: 50 product-category poster prompts built around one game character — layout useful, subject not.",
 "Falah/product_photography_prompts": "D: 1000 rows but only 8 unique prompts (measured).",
 "Falah/catalogue_photography_prompts": "D: 1000 rows but only 15 unique prompts (measured).",
 "Falah/luxurious_food_photography_prompts": "D: 1000 rows but only 5 unique prompts (measured).",
 "Falah/fashion_photography_prompts_SDXL": "D: templated synthetic set of 1M rows; first 621 fetched before the HF 429 limit, 575 unique.",
 "Falah/logo_prompts": "D: templated synthetic logo prompts; 417 fetched before the HF 429 limit.",
}
out = ["# Sources — lane image-ads (2026-11-08)", "",
       "Grade: A = agency-ready ad/commerce prompts, B = useful ad material, C = small or thin, D = low quality, V = vocabulary/modifier list.",
       "Stars measured with `gh api repos/<r>` (stargazers_count); last commit = `git log -1 --format=%cs` of the depth-1 clone; prompts = rows in catalog-image-ads.tsv after in-lane exact dedup.", "",
       "| source | url | stars | last commit | licence | prompts | note |", "|---|---|---|---|---|---|---|"]
lines = []
for r, m in meta.items():
    slug = r.replace("/", "__")
    if slug not in counts:
        continue
    lines.append((NOTE.get(r, "")[:1], -counts[slug], f"| {r} | https://github.com/{r} | {m[1]} | {dates.get(r,'?')} | {m[3]} | {counts[slug]} | {NOTE.get(r,'')} |"))
for d, (likes, date, lic) in HF.items():
    slug = "hf__" + d.replace("/", "__")
    lines.append((HFNOTE[d][:1], -counts.get(slug, 0), f"| HF {d} | https://huggingface.co/datasets/{d} | {likes} | {date} | {lic} | {counts.get(slug,0)} | {HFNOTE[d]} |"))
order = {"A": 0, "B": 1, "V": 2, "C": 3, "D": 4}
for _, _, l in sorted(lines, key=lambda x: (order.get(x[0], 9), x[1])):
    out.append(l)
out += ["", f"Total rows: {sum(counts.values())}", ""]
out += open(S + "/sources-tail.md").read().split("\n")
open(B + "/sources-image-ads.md", "w").write("\n".join(out))
print(len(lines), "sources;", sum(counts.values()), "rows")
