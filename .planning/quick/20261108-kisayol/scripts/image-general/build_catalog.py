"""Build catalog-image-general.tsv from raw/image-general/ (read as text only).

Run: python3 -I build_catalog.py
Sources are processed in SOURCES order and exact duplicate prompts (after
whitespace is collapsed) keep only their first row, so the more specific,
better-attributed collections are listed first.
"""
import csv
import glob
import html
import json
import os
import re
import sys
from collections import Counter

import yaml

BASE = "/home/dxb/DxB Global OS/.planning/quick/20261108-kisayol"
RAW = os.path.join(BASE, "raw/image-general")
OUT = os.path.join(BASE, "catalog-image-general.tsv")
LANE = "image-general"
HEADER = ["id", "lane", "source_slug", "title", "category", "medium", "target_model", "prompt",
          "needs_input_image", "source_url", "licence"]

INPUT_IMAGE = re.compile(
    r"\b(upload(?:ed)?|attached (?:image|photo|picture)|the attached|reference (?:image|photo|picture)s?|"
    r"provided (?:image|photo|picture)|input image|this (?:photo|image|picture|selfie)|"
    r"(?:my|the user'?s?) (?:photo|selfie|face|portrait)|original (?:photo|image)|given (?:image|photo)|"
    r"from the (?:photo|image)|in the (?:photo|image) (?:provided|above)|based on the (?:image|photo)|"
    r"(?:image|photo) [12] |the person in the (?:photo|image))\b"
    r"|参考图|参考圖|上传|上傳|这张|這張|附图|原图|照片中|图片中|図の|この写真|画像の人物|アップロード",
    re.I,
)
CODE_LANGS = {"bash", "sh", "shell", "zsh", "python", "py", "js", "javascript", "ts", "typescript", "html",
              "css", "toml", "diff", "mermaid", "jsx", "tsx", "sql", "powershell", "console"}
CODE_START = re.compile(r"^\s*(\$ |git |npm |npx |pnpm |pip |curl |import |from \w+ import|const |export |"
                        r"<\w|def |class |cd |python|node |docker )")
MD_LINK = re.compile(r"\[([^\]]*)\]\([^)]*\)")
URL = re.compile(r"https?://[^\s)\"'<>\]]+")


def flat(s):
    return " ".join(str(s or "").replace("\t", " ").split())


def guess_input(prompt):
    return "yes" if INPUT_IMAGE.search(prompt or "") else "unknown"


def input_flag(flag, prompt):
    """Map a source's own reference-image / edit-mode field to yes|no; unknown when it has none."""
    if flag is True or str(flag).lower() in ("true", "yes", "1", "image-edit", "image-to-image", "edit"):
        return "yes"
    if flag is False or str(flag).lower() in ("false", "no", "0", "text-to-image", "generate"):
        return "yes" if INPUT_IMAGE.search(prompt or "") else "no"
    return guess_input(prompt)


def row(title="", category="", prompt="", target_model="", needs=None, source_url="", medium="image"):
    return {"title": title, "category": category, "prompt": prompt, "target_model": target_model,
            "needs_input_image": needs if needs else guess_input(prompt), "source_url": source_url,
            "medium": medium}


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_jsonl(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.strip():
                yield json.loads(line)


# ---------- generic markdown: one row per fenced block, titled by the nearest heading ----------

def md_fences(path, model, default_url):
    title, url, inside, lang, buf = "", default_url, False, "", []
    with open(path, encoding="utf-8", errors="replace") as f:
        lines = f.read().splitlines()
    for line in lines:
        fence = re.match(r"^\s*(```|~~~)\s*([\w+-]*)", line)
        if fence and not inside:
            inside, lang, buf = True, fence.group(2).lower(), []
            continue
        if fence and inside:
            inside = False
            text = "\n".join(buf).strip()
            text = re.sub(r"^/imagine prompt:\s*", "", text)
            if (len(text) >= 25 and lang not in CODE_LANGS and not CODE_START.match(text)
                    and "api_key" not in text.lower() and "authorization:" not in text.lower()):
                yield row(title, "", text, model, None, url)
            continue
        if inside:
            buf.append(line)
            continue
        h = re.match(r"^\s*#{1,6}\s+(.*)", line)
        if h:
            raw_h = h.group(1)
            links = URL.findall(raw_h)
            url = links[0] if links else default_url
            title = flat(MD_LINK.sub(r"\1", raw_h)).strip("# ")


# ---------- per-source parsers ----------

def p_freestylefly(src):
    for c in load_json(f"{RAW}/freestylefly-gpt-image-2/data/cases.json")["cases"]:
        yield row(c.get("title"), c.get("category"), c.get("prompt"), "gpt-image-2", None, c.get("sourceUrl") or src["url"])
    yield from md_fences(f"{RAW}/freestylefly-gpt-image-2/docs/templates.md", "gpt-image-2", src["url"])


def p_evolink(src):
    files = [f for f in glob.glob(f"{RAW}/evolink-gpt-image-2/cases/*.md") if not re.search(r"_[a-z]{2}(-[A-Z]{2})?\.md$", f)]
    for f in sorted(files) + [f"{RAW}/evolink-gpt-image-2/README.md"]:
        cat = os.path.basename(f)[:-3]
        for r in md_fences(f, "gpt-image-2", src["url"]):
            r["category"] = cat
            yield r


def p_youmind_skill(src):
    for f in sorted(glob.glob(f"{RAW}/youmind-ai-image-prompts-skill/references/*.json")):
        cat = os.path.basename(f)[:-5]
        if cat == "manifest":
            continue
        for c in load_json(f):
            yield row(c.get("title"), cat, c.get("content"), "nano-banana-pro / gpt-image (mixed)",
                      input_flag(c.get("needReferenceImages"), c.get("content")), src["url"])


def p_goku(name, model):
    def p(src):
        for c in load_jsonl(f"{RAW}/hf-goku-{name}/metadata-text.jsonl"):
            en = c.get("en") or {}
            prompt = c.get("raw_p") or en.get("p")
            yield row(en.get("t") or c.get("slug"), c.get("category"), prompt, c.get("model") or model, None,
                      c.get("sourceLink") or src["url"])
    return p


def p_jau123(src):
    for c in load_json(f"{RAW}/jau123-nanobanana-trending/prompts/prompts.json"):
        cats = c.get("categories") or []
        yield row(f"rank {c.get('rank')}", ", ".join(cats) if isinstance(cats, list) else str(cats), c.get("prompt"),
                  c.get("model") or "nano-banana", None, c.get("source_url") or src["url"])


def p_xianyu(src):
    for c in load_json(f"{RAW}/xianyu110-nanobananapro/gpt4o-image-prompts-master/data/prompts.json")["items"]:
        url = (c.get("source") or {}).get("url") or src["url"]
        for p in c.get("prompts") or []:
            yield row(c.get("title"), ", ".join(c.get("tags") or []), p, c.get("model") or "gpt-4o / nano-banana", None, url)


def p_youart(src):
    for c in load_json(f"{RAW}/youart-gpt-image-2-5/data/prompts.json")["prompts"]:
        yield row(c.get("title"), c.get("category"), c.get("prompt"), "gpt-image-2.5", None, c.get("sourceUrl") or src["url"])


def p_davidwuw(src):
    for c in load_json(f"{RAW}/davidwuw-gpt-image2/prompts.json"):
        yield row(c.get("title_en") or c.get("title_cn"), c.get("category"), c.get("prompt"), "gpt-image-2",
                  input_flag(c.get("needs_ref"), c.get("prompt")), src["url"])


def p_glidea(src):
    for c in load_json(f"{RAW}/glidea-banana-quicker/prompts.json"):
        cat = "/".join(x for x in (c.get("category"), c.get("sub_category")) if x)
        needs = "yes" if c.get("mode") == "edit" else input_flag(None, c.get("prompt"))
        yield row(c.get("title"), cat, c.get("prompt"), "nano-banana", needs, src["url"])


def p_songtianlun(src):
    j = load_json(f"{RAW}/songtianlun-awesome-prompts/docs/data/cases.json")
    for c in j["cases"]:
        t = c.get("title") or {}
        medium = "video" if "video" in str(c.get("modality")) else "image"
        yield row(t.get("en") if isinstance(t, dict) else t, c.get("category"), c.get("prompt"), c.get("model"),
                  input_flag(c.get("requires_reference"), c.get("prompt")), (c.get("source") or {}).get("url") if isinstance(c.get("source"), dict) else src["url"], medium)
    for f in sorted(glob.glob(f"{RAW}/songtianlun-awesome-prompts/docs/text-to-image/**/*.md", recursive=True)):
        if re.search(r"(?<!\.en)\.md$", f) and os.path.exists(f[:-3] + ".en.md"):
            continue  # Chinese twin of an .en.md file
        model = "gpt-4o / gpt-image-1" if "/gpt/" in f else "nano-banana" if "nano-banana" in f else "hunyuan-image-3" if "hunyuan" in f else ""
        yield from md_fences(f, model, src["url"])


def p_cases_yml(folder, model):
    def p(src):
        for f in sorted(glob.glob(f"{RAW}/{folder}/cases/*/case.yml"), key=lambda x: int(x.split("/")[-2])):
            with open(f, encoding="utf-8") as fh:
                c = yaml.safe_load(fh)
            prompt = c.get("prompt_en") or c.get("prompt")
            url = ((c.get("source_links") or [{}])[0] or {}).get("url") or c.get("author_link") or src["url"]
            yield row(c.get("title_en") or c.get("title"), "", prompt, model, None, url)
    return p


def p_samux(src):
    for f in sorted(glob.glob(f"{RAW}/samuxbuilds-prompts/prompts/*/*.md")):
        text = open(f, encoding="utf-8").read()
        m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
        if not m:
            continue
        try:
            meta = yaml.safe_load(m.group(1)) or {}
        except yaml.YAMLError:
            meta = {}
        body = re.split(r"\n## (?:Reference Image|Source|Example Output)", m.group(2))[0].strip()
        refimg = re.search(r"\n## Reference Image\n(.*?)(\n## |$)", m.group(2), re.S)
        urls = URL.findall(m.group(2).split("## Source", 1)[-1]) if "## Source" in m.group(2) else []
        cat = meta.get("category") or f.split("/")[-2]
        medium = "video" if cat == "motion" else "image"
        yield row(meta.get("title"), cat, body, "gpt-4o / mixed", "yes" if refimg else guess_input(body),
                  urls[0] if urls else src["url"], medium)


def p_imgedify(src):
    s = open(f"{RAW}/imgedify-gpt4o/Prompts.html", encoding="utf-8").read()
    for art in re.findall(r"<article.*?</article>", s, re.S):
        t = re.search(r"<h3[^>]*>(.*?)</h3>", art, re.S)
        a = re.search(r'<a href="([^"]+)"', art)
        p = re.search(r'whitespace-pre-wrap"[^>]*>(.*?)</p>', art, re.S)
        if p:
            yield row(html.unescape(t.group(1)) if t else "", "", html.unescape(p.group(1)), "gpt-4o", None, a.group(1) if a else src["url"])


def p_md(paths, model):
    def p(src):
        for path in paths:
            for f in sorted(glob.glob(f"{RAW}/{path}", recursive=True)):
                yield from md_fences(f, model, src["url"])
    return p


def p_danielrosehill(src):
    for f in sorted(glob.glob(f"{RAW}/hf-danielrosehill-t2i-test-prompts/*/**/*.md", recursive=True)):
        if "system-prompt" in f:
            continue
        cat = os.path.relpath(f, f"{RAW}/hf-danielrosehill-t2i-test-prompts").split("/")[0]
        for r in md_fences(f, "", src["url"]):
            r["category"] = cat
            yield r


def p_adrian(src):
    for c in load_jsonl(f"{RAW}/hf-adrian2016-image-video-prompts/image.jsonl"):
        yield row(c.get("title_en"), c.get("category"), c.get("prompt"), c.get("model"),
                  input_flag(c.get("mode"), c.get("prompt")), c.get("source_url") or src["url"])


def p_fal(src):
    for c in load_jsonl(f"{RAW}/hf-fal-image-generation-prompts/data.jsonl"):
        yield row("", f"category {c.get('category')}/sub {c.get('subcategory')}", c.get("prompt"), "", None, src["url"])


def p_kmktr(src):
    for c in load_jsonl(f"{RAW}/hf-k-mktr-improved-flux-prompts/20240927_flux_improved_prompts_final_cleaned.jsonl"):
        yield row("", "", c.get("prompt"), "flux", None, src["url"])


def p_parti(src):
    with open(f"{RAW}/hf-parti-prompts/PartiPrompts.tsv", encoding="utf-8") as f:
        for c in csv.DictReader(f, delimiter="\t"):
            yield row("", f"{c.get('Category')} / {c.get('Challenge')}", c.get("Prompt"), "benchmark (any)", "no", src["url"])


def p_gustavosta(src):
    for c in load_jsonl(f"{RAW}/hf-gustavosta-sd-prompts/data.jsonl"):
        yield row("", "general-art", c.get("Prompt"), "stable-diffusion", None, src["url"])


def p_filtered(slug, model):
    def p(src):
        for c in load_jsonl(f"{RAW}/{slug}/filtered-subset.jsonl"):
            yield row("", f"filtered-ad-keyword:{c['matched']}", c["prompt"], model, None, src["url"])
    return p


GH = "https://github.com/"
HFD = "https://huggingface.co/datasets/"
SOURCES = [
    # slug, url, licence, parser
    ("youart-gpt-image-2-5", GH + "youart-open-source/awesome-gpt-image-2-5-prompts", "own terms file (per-author credit; upstream CC0/CC-BY-4.0)", p_youart),
    ("davidwuw-gpt-image2", GH + "davidwuw0811-boop/awesome-gpt-image2-prompts", "none stated", p_davidwuw),
    ("freestylefly-gpt-image-2", GH + "freestylefly/awesome-gpt-image-2", "MIT", p_freestylefly),
    ("evolink-gpt-image-2", GH + "Evolink-AI/awesome-gpt-image-2-API-Prompts", "CC0-1.0", p_evolink),
    ("youmind-gpt-image-2", GH + "YouMind-OpenLab/awesome-gpt-image-2", "CC-BY-4.0", p_md(["youmind-gpt-image-2/README.md"], "gpt-image-2")),
    ("zerolu-gpt-image", GH + "ZeroLu/awesome-gpt-image", "MIT", p_md(["zerolu-gpt-image/README.md"], "gpt-image-2")),
    ("hf-goku-gpt-image-2", HFD + "Goku-OpenLab/gpt-image-2-prompts-datasets", "CC-BY-4.0", p_goku("gpt-image-2", "gpt-image-2")),
    ("youmind-nano-banana-pro", GH + "YouMind-OpenLab/awesome-nano-banana-pro-prompts", "CC-BY-4.0", p_md(["youmind-nano-banana-pro/README.md"], "nano-banana-pro")),
    ("zerolu-nanobanana-pro", GH + "ZeroLu/awesome-nanobanana-pro", "MIT", p_md(["zerolu-nanobanana-pro/README.md"], "nano-banana-pro")),
    ("fujc-nano-banana-pro", GH + "fujc683/awesome-nano-banana-pro-prompts", "CC-BY-4.0", p_md(["fujc-nano-banana-pro/README.md"], "nano-banana-pro")),
    ("fujc-nano-banana-2", GH + "fujc683/awesome-nano-banana-2-prompts", "CC-BY-4.0", p_md(["fujc-nano-banana-2/README.md"], "nano-banana-2")),
    ("zizheruan-nanobanana2", GH + "ZizheRuan/awesome-nanobanana2", "Apache-2.0", p_md(["zizheruan-nanobanana2/README.md"], "nano-banana-2")),
    ("xianyu110-nanobananapro", GH + "xianyu110/awesome-nanobananapro-prompts", "MIT", p_xianyu),
    ("hf-goku-nano-banana-pro", HFD + "Goku-OpenLab/nano-banana-pro-prompts-datasets", "CC-BY-4.0", p_goku("nano-banana-pro", "nano-banana-pro")),
    ("youmind-ai-image-prompts-skill", GH + "YouMind-OpenLab/ai-image-prompts-skill", "MIT", p_youmind_skill),
    ("jau123-nanobanana-trending", GH + "jau123/nanobanana-trending-prompts", "CC-BY-4.0", p_jau123),
    ("picotrex-nano-banana", GH + "PicoTrex/Awesome-Nano-Banana-images", "Apache-2.0", p_md(["picotrex-nano-banana/README_en.md"], "nano-banana")),
    ("jimmylv-nano-banana", GH + "JimmyLv/awesome-nano-banana", "CC-BY-4.0 (NOTICE)", p_md(["jimmylv-nano-banana/README_en.md"], "nano-banana")),
    ("glidea-banana-quicker", GH + "glidea/banana-prompt-quicker", "MIT", p_glidea),
    ("youmind-seedream-4-5", GH + "YouMind-OpenLab/awesome-seedream-4.5", "CC-BY-4.0", p_md(["youmind-seedream-4-5/README.md"], "seedream-4.5")),
    ("fujc-seedream-5", GH + "fujc683/awesome-seedream-5-prompts", "CC-BY-4.0", p_md(["fujc-seedream-5/README.md"], "seedream-5")),
    ("stevenqi-seedream-4", GH + "StevenQi7/Awesome-Seedream-Four-Images", "Apache-2.0", p_md(["stevenqi-seedream-4/README_en.md"], "seedream-4")),
    ("fujc-qwen-image", GH + "fujc683/awesome-qwen-image-prompts", "CC-BY-4.0", p_md(["fujc-qwen-image/README.md"], "qwen-image-2.1")),
    ("jamez-gpt4o", GH + "jamez-bondos/awesome-gpt4o-images", "CC-BY-4.0 (NOTICE)", p_cases_yml("jamez-gpt4o", "gpt-4o")),
    ("imgedify-gpt4o", GH + "ImgEdify/Awesome-GPT4o-Image-Prompts", "MIT", p_imgedify),
    ("songtianlun-awesome-prompts", GH + "songtianlun/awesome-prompts", "MIT", p_songtianlun),
    ("dongyubin-ai-images", GH + "dongyubin/Awesome-AI-Images-Prompts", "none stated", p_md(["dongyubin-ai-images/README.md"], "gpt-image-2 / nano-banana / seedream (mixed)")),
    ("devanshug-ai-image", GH + "devanshug2307/Awesome-AI-Image-Prompts", "MIT", p_md(["devanshug-ai-image/README.md"], "gpt-image / mixed")),
    ("samuxbuilds-prompts", GH + "samuxbuilds/awesome-prompts", "MIT", p_samux),
    ("ezagor-midjourney", GH + "Ezagor-dev/awesome-midjourney-prompts", "CC0-1.0", p_md(["ezagor-midjourney/README.md"], "midjourney")),
    ("hf-adrian2016-image-video-prompts", HFD + "Adrian2016/awesome-image-video-prompts", "other (dataset card)", p_adrian),
    ("hf-danielrosehill-t2i-test-prompts", HFD + "danielrosehill/Text-To-Image-Test-Prompts", "Apache-2.0", p_danielrosehill),
    ("hf-fal-image-generation-prompts", HFD + "fal/image-generation-prompts", "none stated", p_fal),
    ("hf-k-mktr-improved-flux-prompts", HFD + "k-mktr/improved-flux-prompts", "MIT", p_kmktr),
    ("hf-parti-prompts", HFD + "nateraw/parti-prompts", "Apache-2.0", p_parti),
    ("hf-gustavosta-sd-prompts", HFD + "Gustavosta/Stable-Diffusion-Prompts", "unknown (dataset card)", p_gustavosta),
    ("hf-diffusiondb", HFD + "poloclub/diffusiondb", "CC0-1.0", p_filtered("hf-diffusiondb", "stable-diffusion")),
    ("hf-sd-prompts-2-47m", HFD + "FredZhang7/stable-diffusion-prompts-2.47M", "creativeml-openrail-m", p_filtered("hf-sd-prompts-2-47m", "stable-diffusion")),
    ("hf-midjourney-messages", HFD + "vivym/midjourney-messages", "Apache-2.0", p_filtered("hf-midjourney-messages", "midjourney")),
    ("hf-succinctly-midjourney", HFD + "succinctly/midjourney-prompts", "Apache-2.0", p_filtered("hf-succinctly-midjourney", "midjourney")),
]


def youmind_usecases():
    """prompt -> (use-case categories, reference flag) from the YouMind skill, which names no model.

    The same prompts reappear in model-specific sources listed earlier; those rows keep
    their model and gain the use-case category here.
    """
    cats, refs = {}, {}
    for r in p_youmind_skill({"url": ""}):
        key = flat(r["prompt"])
        cats.setdefault(key, [])
        if r["category"] not in cats[key]:
            cats[key].append(r["category"])
        refs.setdefault(key, r["needs_input_image"])
    return cats, refs


def main():
    seen, counts, raw_counts, n = set(), Counter(), Counter(), 0
    usecase, usecase_ref = youmind_usecases()
    with open(OUT, "w", encoding="utf-8", newline="") as out:
        out.write("\t".join(HEADER) + "\n")
        for slug, url, licence, parser in SOURCES:
            for r in parser({"url": url}):
                prompt = flat(r["prompt"])
                if len(prompt) < 10:
                    continue
                raw_counts[slug] += 1
                if prompt in seen:
                    continue
                seen.add(prompt)
                n += 1
                counts[slug] += 1
                if prompt in usecase:
                    r["category"] = "; ".join(x for x in [flat(r["category"]), "usecase:" + ",".join(usecase[prompt])] if x)
                    if r["needs_input_image"] == "unknown":
                        r["needs_input_image"] = usecase_ref[prompt]
                rec = {"id": f"ig-{n:06d}", "lane": LANE, "source_slug": slug, "title": flat(r["title"]),
                       "category": flat(r["category"]), "medium": r["medium"], "target_model": flat(r["target_model"]),
                       "prompt": prompt, "needs_input_image": r["needs_input_image"],
                       "source_url": flat(r["source_url"]) or url, "licence": licence}
                out.write("\t".join(rec[h] for h in HEADER) + "\n")
    for slug, *_ in SOURCES:
        print(f"{slug}\tparsed={raw_counts[slug]}\tkept={counts[slug]}")
    print("TOTAL", n)


if __name__ == "__main__":
    sys.exit(main())
