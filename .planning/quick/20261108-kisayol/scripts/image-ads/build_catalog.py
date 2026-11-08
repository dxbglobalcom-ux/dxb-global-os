"""Build catalog-image-ads.tsv from raw/image-ads/ (read-only, text parsing only).

Run: python3 -I build_catalog.py
Every source has one handler below; sources without a handler contribute no rows.
"""
import csv, glob, json, os, re, sys

BASE = "/home/dxb/DxB Global OS/.planning/quick/20261108-kisayol"
RAW = BASE + "/raw/image-ads"
LANE = "image-ads"
OUT = BASE + "/catalog-image-ads.tsv"
META = BASE + "/scripts/image-ads/repo-meta.tsv"

import yaml  # system PyYAML, safe_load only

LICENCE = {}
for line in open(META):
    p = line.rstrip("\n").split("\t")
    if len(p) >= 4:
        LICENCE[p[0].replace("/", "__")] = p[3]
HF_LICENCE = {
    "hf__contralabs__creative-ad-design-dataset": "CC-BY-4.0",
    "hf__Octavian-labs__instagram-fashion-prompts-v1": "MIT",
}

rows = []
seen = set()
per_source = {}

EDIT_RE = re.compile(
    r"(supplied|uploaded|attached|provided|input|reference|original|given|existing|user'?s)\s+(real\s+)?(product\s+)?(photo|image|picture|shot|photograph)"
    r"|keep the product exactly|edit the (supplied|uploaded|photo|image)|use the attached|based on the (uploaded|reference|provided)"
    r"|from the (reference|uploaded|input) (image|photo)|this (photo|image)|the reference image|image[- ]to[- ]image|\bimg2img\b"
    r"|上传|参考图|原图|垫图", re.I)
VIDEO_RE = re.compile(
    r"\b\d{1,2}\s?(-|–|to)\s?\d{1,2}\s?s(ec(ond)?s?)?\b|\b\d{1,2}[- ]second\b|\bvideo ad\b|\bvoice-?over\b"
    r"|\bcamera (slowly )?(pushes|pulls|pans|dollies|orbits|tracks|cranes)\b|\bdolly (in|out)\b|\bslow push-in\b", re.I)


def clean(t):
    return re.sub(r"\s+", " ", str(t)).strip()


def url_for(src, path=""):
    if src.startswith("hf__"):
        return "https://huggingface.co/datasets/" + src[4:].replace("__", "/")
    base = "https://github.com/" + src.replace("__", "/", 1)
    return base + ("/blob/HEAD/" + path if path else "")


def add(src, title, category, prompt, medium=None, model="", needs=None, path="", vocab=False):
    p = clean(prompt)
    if len(p) < (2 if vocab else 25):
        return
    key = p.lower()
    if key in seen:
        return
    seen.add(key)
    if medium is None:
        medium = "image" if vocab else ("video" if VIDEO_RE.search(p) else "image")
    if needs is None:
        needs = "no" if vocab else ("yes" if EDIT_RE.search(p) else "unknown")
    lic = HF_LICENCE.get(src) or LICENCE.get(src) or "unknown"
    rows.append([src, clean(title)[:160], clean(category)[:80], medium, model, p, needs, url_for(src, path), lic])
    per_source[src] = per_source.get(src, 0) + 1


def rel(src, f):
    return os.path.relpath(f, RAW + "/" + src)


def load(src, path):
    return json.load(open(os.path.join(RAW, src, path), encoding="utf-8"))


# ---------- generic markdown fenced-block extractor ----------
CODE_LANGS = {"bash", "sh", "shell", "zsh", "python", "py", "js", "javascript", "ts", "typescript", "mermaid",
              "yaml", "yml", "toml", "html", "css", "sql", "powershell", "diff", "console", "jsx", "tsx", "ini"}
CMD_RE = re.compile(r"^\s*(\$ |npx |npm |pnpm |git |pip |claude |/plugin|curl |cd |python|export |├|└|│|import |def |const |\{\s*\"type\"\s*:\s*\"object)")


def looks_like_noise(text):
    """Fenced blocks that are workflows, trees, tables, API calls or LLM meta-prompts, not image prompts."""
    if re.search(r"[├└│]|\|--|`--|\|---|^#|Authorization:|^(POST|GET) ", text, re.M):
        return True
    if len(re.findall(r"->|→", text)) >= 2 and len(text) < 500:
        return True
    if re.search(r"输出完整JSON|(output|return|respond)( only)?( in| with| as)?( valid| strict)? JSON", text, re.I):
        return True
    if re.search(r'"(model|size|n)"\s*:', text) and re.search(r'"prompt"\s*:\s*"<', text):
        return True
    paths = sum(1 for ln in text.split("\n") if re.match(r"^\s*[\w.<>-]+/[\w./<>-]*\s*$", ln))
    return paths >= 2


def md_fences(src, files, model=""):
    for f in files:
        try:
            lines = open(f, encoding="utf-8").read().split("\n")
        except Exception:
            continue
        head = ""
        i = 0
        while i < len(lines):
            ln = lines[i]
            h = re.match(r"^#{1,6}\s+(.*)", ln)
            if h:
                head = h.group(1)
            m = re.match(r"^\s*```+\s*([\w+-]*)", ln)
            if m:
                lang = m.group(1).lower()
                j = i + 1
                body = []
                while j < len(lines) and not re.match(r"^\s*```", lines[j]):
                    body.append(lines[j])
                    j += 1
                text = "\n".join(body).strip()
                ok = (lang not in CODE_LANGS and len(text) >= 60 and not CMD_RE.match(text)
                      and not looks_like_noise(text))
                if ok and lang == "json":
                    ok = bool(re.search(r"light|camera|scene|subject|style|background|prompt", text, re.I))
                if ok:
                    add(src, head or os.path.basename(f), os.path.splitext(rel(src, f))[0],
                        text, model=model, path=rel(src, f))
                i = j + 1
                continue
            i += 1


def md_label_quotes(src, files, model=""):
    """Blockquote lines right after a '**Prompt:**' label."""
    for f in files:
        lines = open(f, encoding="utf-8").read().split("\n")
        head = ""
        for i, ln in enumerate(lines):
            h = re.match(r"^#{1,6}\s+(.*)", ln)
            if h:
                head = h.group(1)
            if re.match(r"^\s*\*\*prompt:?\*\*:?\s*$", ln, re.I):
                buf = []
                for nxt in lines[i + 1:]:
                    if nxt.startswith(">"):
                        buf.append(nxt.lstrip("> "))
                    elif buf or nxt.strip():
                        break
                if buf:
                    add(src, head, os.path.splitext(rel(src, f))[0], " ".join(buf), model=model, path=rel(src, f))


def walk_prompts(obj, cb, title=""):
    """Call cb(title, prompt, node) for every dict holding a prompt-like string."""
    if isinstance(obj, dict):
        t = obj.get("name") or obj.get("label") or obj.get("title") or obj.get("id") or title
        for k in ("prompt", "template_prompt", "prompt_template", "text"):
            v = obj.get(k)
            if isinstance(v, str) and v.strip():
                cb(str(t), v, obj)
                break
        for k, v in obj.items():
            if isinstance(v, (dict, list)):
                walk_prompts(v, cb, str(t) if t else k)
    elif isinstance(obj, list):
        for v in obj:
            walk_prompts(v, cb, title)


def files_in(src, *pats):
    out = []
    for p in pats:
        out += sorted(glob.glob(os.path.join(RAW, src, p), recursive=True))
    return out


# ---------- per-source handlers ----------
def h_natan():
    s = "natan-webs__visual-commands"
    p = "skills/visual-commands/references/commands.json"
    for c in load(s, p)["commands"]:
        add(s, "/" + c["name"], "command:" + c.get("category", ""), c["prompt"], model="any",
            needs="unknown", path=p)


def h_cheer():
    s = "cheercheung__ai-ads-for-dtc-prompts-library"
    p = "data/prompts.json"
    for x in load(s, p)["prompts"]:
        add(s, x["title"], x["category"] + (("/" + x["subcategory"]) if x.get("subcategory") else ""),
            x["prompt"], path=p)


def h_ecom():
    s = "ecomimagelab__ecommerce-gpt-image-prompts"
    p = "data/prompts.json"
    for x in load(s, p)["prompts"]:
        needs = "yes" if x.get("inputRequirements") or "edit" in str(x.get("mode", "")) else None
        add(s, x["title"], x.get("category", ""), x["prompt"], model=x.get("model", ""), needs=needs, path=p)
        for v in x.get("variants") or []:
            add(s, x["title"] + " / " + v.get("title", ""), x.get("category", "") + "/" + str(v.get("useCase", "")),
                v["prompt"], model=x.get("model", ""), needs=needs, path=p)


def h_lygerone():
    s = "lygerone__awesome-nano-banana-prompts"
    for x in load(s, "prompts.json"):
        add(s, x["title"], x["scene"] + "/" + x["operation"], x["prompt"], model="nano-banana-2.1",
            needs="yes", path="prompts.json")


def h_huyan():
    s = "huyanxius__logo-to-stickers"
    p = "examples/prompts.json"
    for x in load(s, p)["items"]:
        add(s, x["brand"] + ": " + x["title"], "logo-sticker", x["prompt"], needs="yes", path=p)


def h_kw():
    s = "kwistzzqq-byte__image2-ads-studio"
    p = "examples/gallery/cases.json"
    for x in load(s, p)["cases"]:
        add(s, x["title"], x.get("taskType", "") + "/" + x.get("industry", ""), x["optimizedPrompt"],
            model="gpt-image-2", path=p)
    p = "packages/ad-image-agent-core/src/templates.json"
    for x in load(s, p):
        txt = " ".join(filter(None, [x.get("promptSkeleton"), "Layout: " + x.get("layoutPattern", ""),
                                     "Avoid: " + "; ".join(x.get("negativeConstraints", []))]))
        add(s, x["name"], "template:" + x.get("taskType", ""), txt, model="gpt-image-2",
            needs="unknown", path=p)
    p = "packages/ad-image-agent-core/src/visual-recipes.json"
    for x in load(s, p):
        parts = [f"{k}: {v}" for k, v in x.items() if k.endswith("Formula") and isinstance(v, str)]
        add(s, x["name"], "recipe:" + ",".join(x.get("taskTypes", [])[:2]), " | ".join(parts),
            model="gpt-image-2", path=p)


AGRICI_CATS = ["products", "food-drink", "fashion-editorial", "logos-icons", "print-merchandise", "vehicles"]


def h_agrici():
    s = "AgriciDaniel__claude-prompts"
    for cat in AGRICI_CATS:
        p = f"prompts/{cat}/prompts.json"
        for x in load(s, p):
            pr = str(x.get("Prompt", "")).strip().strip('"')
            # the source's _output_type field marks Midjourney/Mystic rows as video, so medium follows the model
            model = str(x.get("_model", ""))
            med = "video" if re.search(r"sora|kling|runway|veo|hailuo|luma|pika|minimax|seedance|wan\b", model, re.I) else "image"
            add(s, pr[:70], cat, pr, medium=med, model=model, path=p)


def h_nexo():
    s = "NexocoreTeam__AdCreatives"
    for f in files_in(s, "prompts/library/**/*.yaml", "styles/static/*.yaml"):
        d = yaml.safe_load(open(f, encoding="utf-8"))
        txt = d.get("template_prompt") or d.get("prompt_template")
        if not txt:
            continue
        cat = d.get("category") or "static-style"
        model = "nano-banana" if "/nanobana/" in f else ""
        add(s, d.get("name", os.path.basename(f)), cat, txt, model=model, path=rel(s, f))


def h_buluslan():
    s = "buluslan__gpt-image2-ecommerce"
    for f in files_in(s, "references/scenarios/*.json"):
        d = json.load(open(f, encoding="utf-8"))
        tpl = dict(d.get("prompt_template", {}))
        for k, v in (d.get("defaults") or {}).items():
            tpl[k] = v
        add(s, d.get("name", d["id"]), "scenario:" + d["id"], "; ".join(f"{k}: {v}" for k, v in tpl.items()),
            model="gpt-image-2", path=rel(s, f))
        for vn, v in (d.get("variants") or {}).items():
            t2 = dict(tpl)
            t2.update(v.get("overrides", {}))
            add(s, d.get("name", d["id"]) + " / " + vn, "scenario:" + d["id"],
                "; ".join(f"{k}: {v}" for k, v in t2.items()), model="gpt-image-2", path=rel(s, f))


def h_berman():
    s = "TheMattBerman__brand-shoot-kit"
    for f in files_in(s, "examples/golden-runs/*/assets/generated/generation-manifest.json"):
        d = json.load(open(f, encoding="utf-8"))
        for e in d.get("entries", []):
            add(s, d.get("product", "") + ": " + e.get("shot_name", ""), "brand-shoot/" + e.get("use_case", ""),
                e["prompt"], path=rel(s, f))


def h_wenmao():
    s = "Wenmao-AI-Lab__ad-creative-prompts"
    for f in files_in(s, "**/*.txt"):
        r = rel(s, f)
        parts = r.split("/")
        title = parts[-2] if len(parts) > 2 else os.path.splitext(parts[-1])[0]
        add(s, title, parts[0], open(f, encoding="utf-8", errors="replace").read(), path=r)


def h_hf():
    for s, field, cat, model in [
        ("hf__Falah__product_photography_prompts", "prompts", "product-photography", "sdxl"),
        ("hf__Falah__catalogue_photography_prompts", "prompts", "catalogue-photography", "sdxl"),
        ("hf__Falah__luxurious_food_photography_prompts", "prompts", "food-photography", "sdxl"),
        ("hf__Falah__fashion_photography_prompts_SDXL", "prompts", "fashion-photography", "sdxl"),
        ("hf__Falah__logo_prompts", "prompts", "logo", "sdxl"),
        ("hf__svjack__MAUVIKAT_Product_Posters_Prompts", "en_prompt", "product-poster", "qwen-image"),
    ]:
        for ln in open(os.path.join(RAW, s, "rows.jsonl"), encoding="utf-8"):
            x = json.loads(ln)
            add(s, x.get("product_category", "")[:60] or x[field][:60], cat, x[field], model=model, needs="no")
    s = "hf__contralabs__creative-ad-design-dataset"
    for ln in open(os.path.join(RAW, s, "rows.jsonl"), encoding="utf-8"):
        x = json.loads(ln)
        brief = (f"Ad creative brief — product: {x['product']} Archetype: {x['archetype']}. Personality: {x['personality']} "
                 f"Audience: {x['category_audience']}. Palette: {x['color_palette']}. Typography: {x['typography']}. "
                 f"Packaging: {x['packaging']}. Modifiers: {x['modifiers']}. Notes: {x['notes']}")
        add(s, x["brand"], "ad-brief/" + x["archetype"], brief, needs="yes")
    s = "hf__Octavian-labs__instagram-fashion-prompts-v1"
    for ln in open(os.path.join(RAW, s, "metadata.jsonl"), encoding="utf-8"):
        x = json.loads(ln)
        add(s, x["text"][:60], "instagram-fashion", x["text"], needs="no")


def h_styles():
    for s, pats in [("twri__sdxl_prompt_styler", ["*.json"]), ("K3nt3L__MK-Styles", ["**/*.json"])]:
        for f in files_in(s, *pats):
            try:
                d = json.load(open(f, encoding="utf-8"))
            except Exception:
                continue
            if isinstance(d, list):
                for x in d:
                    if isinstance(x, dict) and x.get("prompt"):
                        add(s, x.get("name", ""), "style-template", x["prompt"], model="sdxl", needs="no",
                            path=rel(s, f), vocab=True)
    for s in ["Douleb__SDXL-A1111-Styles", "thundercat71__Automatic1111-Fooocus-Styles", "K3nt3L__MK-Styles"]:
        for f in files_in(s, "**/*.csv"):
            for x in csv.DictReader(open(f, encoding="utf-8-sig", errors="replace")):
                if x.get("prompt") and not str(x.get("name", "")).startswith(">"):
                    add(s, x.get("name", ""), "style-template", x["prompt"], model="sdxl", needs="no",
                        path=rel(s, f), vocab=True)


def h_kiko():
    s = "ComfyAssets__kiko-flux2-prompt-builder"
    for name in ["cameras", "composition", "lighting", "mood", "styles"]:
        p = f"web/data/{name}.json"
        for grp, items in load(s, p).items():
            for x in items:
                add(s, x["name"], f"vocab:{name}/{grp}", x["prompt"], model="flux2", path=p, vocab=True)
    p = "web/data/presets.json"
    for k, x in load(s, p).items():
        add(s, k, "preset", x["prompt"] + " Style: " + x.get("style", ""), model="flux2", needs="no", path=p)


FAIRY = ["lighting", "composition", "photo_framing", "photo_type", "photography_styles", "device",
         "photographer", "background", "place"]


def h_fairy():
    s = "fairy-root__Flux-Prompt-Generator"
    for n in FAIRY:
        p = f"data/{n}.json"
        for t in load(s, p):
            if isinstance(t, str):
                add(s, t[:60], "vocab:" + n, t, model="flux", path=p, vocab=True)


ROCK_OBJ = {"Photography", "Light and shadow effects", "Material", "Color & Atmosphere", "Showcase",
            "Post processing", "Shape & Space"}


def h_rock():
    s = "rockbenben__img-prompt"
    p = "src/app/data/prompt/prompt-en.json"
    for x in load(s, p):
        if x["object"] in ROCK_OBJ:
            add(s, x["displayName"], f"vocab:{x['object']}/{x['attribute']}", x["langName"], model="any",
                path=p, vocab=True)


def h_patipan():
    s = "patipanpealt__alt-cinematography-reference"
    p = "content.json"
    d = load(s, p)
    for sec in d["sections"]:
        def cb(t, pr, node, sec=sec):
            add(s, t, "vocab:cinematography/" + sec["id"], pr, model="any", path=p, vocab=True)
        walk_prompts(sec, cb)


def h_nuvo():
    s = "NUVoize__ComfyUI-BRKN-Prompt-Randomizer"
    for f in files_in(s, "packs/user/*/camera_presets.json", "packs/user/*/lighting_presets.json",
               "packs/user/*/visual_styles.json", "packs/user/*/locations.json", "packs/user/*/environments.json"):
        d = json.load(open(f, encoding="utf-8"))
        kind = d.get("content_type", os.path.basename(f))
        for e in d.get("entries", []):
            if e.get("prompt"):
                add(s, e.get("label", ""), "vocab:" + kind, e["prompt"], model="krea2", path=rel(s, f), vocab=True)


PERFECT = ["LIGHT_SETUPS", "STYLES", "FILMS", "LOCATIONS", "WEATHER", "FRAMING_LIB", "FOCUS_LIB", "FORMAT_LIB",
           "MATERIALS", "LENS_LIB", "PROPS_LIB", "COMPOSITION_LIB"]


def h_perfect():
    s = "perfectmodelslab__ComfyUI-PerfectLab"
    p = "web/perfectlab_libraries.js"
    txt = open(os.path.join(RAW, s, p), encoding="utf-8").read()
    for m in re.finditer(r"^export const (\w+) = (.*?);?$", txt, re.M):
        if m.group(1) not in PERFECT:
            continue
        try:
            val = json.loads(m.group(2))
        except Exception:
            continue

        def harvest(v):
            if isinstance(v, str):
                add(s, v[:60], "vocab:" + m.group(1), v, model="any", path=p, vocab=True)
            elif isinstance(v, list):
                for y in v:
                    harvest(y)
            elif isinstance(v, dict):
                if isinstance(v.get("prompt"), str):
                    add(s, v.get("name", v.get("label", "")), "vocab:" + m.group(1), v["prompt"], model="any",
                        path=p, vocab=True)
                else:
                    for y in v.values():
                        harvest(y)
        harvest(val)


def h_brandprompt():
    s = "arjavjain12__brandprompt"
    for f in files_in(s, "*.html"):
        for m in re.finditer(r'prompt:\s*"((?:[^"\\]|\\.){40,})"', open(f, encoding="utf-8").read()):
            add(s, m.group(1)[:60], "product-photography", m.group(1), path=rel(s, f))


MD_SOURCES = [
    ("cliprise__awesome-ai-product-photography-prompts", ["README.md"], ""),
    ("cliprise__awesome-seedream-5-prompts", ["README.md"], "seedream-5"),
    ("cliprise__awesome-ai-logo-generator-prompts", ["README.md"], ""),
    ("JeremyGDM__awesome-ai-product-photography-prompts", ["prompts/*.md"], ""),
    ("photoshootapp__product-photoshoot-prompts", ["README.md"], ""),
    ("pranjal-25-2006__product-photo-prompts", ["README.md"], ""),
    ("CSd0109__ai-ad-generator-creative-hooks", ["README.md"], ""),
    ("CSd0109__food-photography-ai-prompts", ["README.md"], ""),
    ("aithink001__ai-perfume-product-photography-prompts", ["README.md", "prompts/en/*.md", "prompts/*.md"], ""),
    ("huikku__NBPro-campaign-guide", ["*.md", "skills/**/*.md"], "nano-banana-pro"),
    ("OnestarQQ__amazon-visual-architect-skill", ["prompts.md", "examples.md", "USAGE_EXAMPLES.md"], ""),
    ("Evolink-AI__gpt-image-2.5-for-e-commerce", ["README.md"], "gpt-image-2.5"),
    ("xianyu110__ecommerce-image-skills", ["skills/**/*.md"], "gpt-image-2.5"),
    ("wzj177__ecommerce-image-suite", ["SKILL.md", "references/*.md"], ""),
    ("QIYU-JACKMAN__codexQIYU-image-workflow", ["**/*.md"], "gpt-image-2"),
    ("feichanggege__ecommerce-visual-copywriting-skill", ["references/*.md"], ""),
    ("liuhengyuan666__product-photo-enhancer", ["**/*.md"], ""),
    ("lorena-bordonaba-pau__product-studio", ["skills/**/*.md"], ""),
    ("beatra-ai__ai-product-photography-skill", ["skills/**/*.md"], ""),
    ("DarkKandaoMaster__fashion-portrait-prompts", ["**/*.md"], ""),
    ("designrique__ai-graphic-design-skill", ["SKILL.md"], ""),
    ("yrhoo__logo-design-skill", ["SKILL.md", "references/*.md"], ""),
    ("tenfoldmarc__meta-ads-generator-skill", ["SKILL.md", "backends/*.md"], ""),
    ("robonuggets__fantastic-posters", [".claude/skills/**/*.md"], "gpt-image-2"),
    ("Ethanxwang__tvc-director", ["SKILL.md", "references/*.md"], "nano-banana-pro"),
    ("xoxxel__camera-prompts", ["camera-prompt-EN.md"], ""),
    ("TheMattBerman__brand-shoot-kit", ["references/**/*.md", "templates/**/*.md"], ""),
]


def main():
    for fn in [h_natan, h_cheer, h_ecom, h_lygerone, h_huyan, h_kw, h_nexo, h_buluslan, h_berman, h_agrici,
               h_wenmao, h_hf, h_brandprompt]:
        fn()
    for s, pats, model in MD_SOURCES:
        md_fences(s, files_in(s, *pats), model=model)
    md_label_quotes("monju252__AI-Prompts-for-Logo-Design", files_in("monju252__AI-Prompts-for-Logo-Design", "README.md"))
    md_label_quotes("monju252__AI-Prompts-for-Product-Mockups", files_in("monju252__AI-Prompts-for-Product-Mockups", "README.md"))
    for fn in [h_kiko, h_fairy, h_rock, h_patipan, h_nuvo, h_perfect, h_styles]:
        fn()
    with open(OUT, "w", encoding="utf-8", newline="") as f:
        f.write("\t".join(["id", "lane", "source_slug", "title", "category", "medium", "target_model", "prompt",
                           "needs_input_image", "source_url", "licence"]) + "\n")
        for i, r in enumerate(rows, 1):
            src, title, cat, medium, model, prompt, needs, url, lic = r
            f.write("\t".join([f"ads-{i:05d}", LANE, src, title, cat, medium, model, prompt, needs, url, lic]) + "\n")
    for k, v in sorted(per_source.items(), key=lambda kv: -kv[1]):
        print(f"{v}\t{k}")
    print("TOTAL", len(rows))


if __name__ == "__main__":
    main()
