"""Build catalog-video.tsv from the untouched sources under raw/video/.

Run:  python3 -I scripts/video/extract.py <kisayol_root>
Reads downloaded files as text/JSON data only; nothing from raw/ is executed or imported.
"""
import csv, glob, html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # -I drops the script dir; our own helper lives there
import html2text_lib

ROOT = sys.argv[1]
RAW = os.path.join(ROOT, "raw", "video")
LANE = "video"
META = {}  # repo full name -> licence, from scripts/video/repo_meta.tsv
with open(os.path.join(ROOT, "scripts", "video", "repo_meta.tsv")) as f:
    for line in f:
        p = line.rstrip("\n").split("\t")
        if len(p) >= 3:
            META[p[0].lower()] = p[2]
with open(os.path.join(ROOT, "scripts", "video", "licence_overrides.tsv")) as f:  # read from LICENSE files where the API says NOASSERTION
    for line in f:
        p = line.rstrip("\n").split("\t")
        if len(p) == 2:
            META[p[0].lower()] = p[1]

rows = []
seen = set()
counts = {}


def one_line(s):
    return re.sub(r"\s+", " ", str(s)).strip()


# ---- classification -------------------------------------------------------
CLASSES = [  # (class, pattern) — first match on title/category/heading wins, then on prompt head
    ("ugc-talking-head", r"\bugc\b|testimonial|talking[- ]head|selfie|vlog|creator[- ]style|review video|口播|种草|自拍|lip ?sync|对口型"),
    ("product-ad", r"product|commercial|\bads?\b|advert|brand|e-?commerce|packshot|unboxing|shopify|amazon listing|marketing|广告|产品|带货|电商|商品"),
    ("fashion-beauty", r"fashion|runway|outfit|beauty|cosmetic|skincare|makeup|perfume|lipstick|时装|美妆|护肤|穿搭|香水"),
    ("food-drink", r"\bfood|drink|beverage|coffee|cocktail|recipe|restaurant|bakery|美食|饮料|咖啡"),
    ("real-estate-architecture", r"real estate|property|interior|architect|house tour|room tour|建筑|室内|房产"),
    ("automotive", r"\bcar\b|automotive|vehicle|motorcycle|\bsuv\b|汽车"),
    ("camera-movement", r"camera|dolly|orbit|crane|crash zoom|\bfpv\b|tracking shot|\bpan\b|\btilt\b|bullet time|push[- ]in|pull[- ]out|drone|shot type|framing|运镜|镜头|机位|推镜|环绕|航拍"),
    ("transition-effect", r"transition|morph|transform|\bvfx\b|effect|match[- ]cut|glitch|特效|转场|变身|变形"),
    ("music-dance", r"music video|\bmv\b|dance|concert|音乐|舞蹈"),
    ("anime-stylized", r"anime|cartoon|claymation|stop[- ]motion|pixar|ghibli|2d|3d animation|动漫|动画"),
    ("vocab-lighting-lens-style", r"lighting|\blens\b|color grade|palette|film stock|style|光线|色调|风格"),
    ("meta-prompt", r"system prompt|you are an expert|prompt engineer|你是一位"),
]


def classify(labels, prompt):
    for lab in labels:  # most specific label first: title, then source category, then file path
        lab = (lab or "").lower()
        for cls, pat in CLASSES:
            if re.search(pat, lab):
                return cls
    head = (prompt or "")[:400].lower()
    for cls, pat in CLASSES:
        if cls in ("camera-movement", "vocab-lighting-lens-style", "anime-stylized", "transition-effect", "music-dance"):
            continue  # too common inside any prompt body to mean the prompt is about it
        if re.search(pat, head):
            return cls
    return "cinematic-general"


I2V = re.compile(
    r"@image|@图片|@img|\bimage ?[1-9]\b|图片[1-9]|uploaded (image|photo|picture|reference)|reference (image|photo|picture)|"
    r"input (image|photo)|start(ing)? frame|first[- ]frame|end frame|last[- ]frame|(provided|supplied|attached|given) (image|photo|picture)|"
    r"(from|in) the (image|photo|picture)|参考图|首帧|尾帧|上传|image[- ]to[- ]video|\bi2v\b|animate (this|the) (image|photo)|this (image|photo)|"
    r"keep the (product|character|subject) (exactly )?(as|from)|product photo", re.I)


# a checklist of short numbered items ("1. Product accuracy 2. Clear benefit ...") is guidance, not a prompt
OUTLINE = re.compile(r"^(?:\d+[.)] (?:\S+ ){0,4}\S+ ?){3,}$")


def needs_image(prompt, hint=None):
    if hint in ("yes", "no"):
        if hint == "no" and I2V.search(prompt or ""):
            return "yes"
        return hint
    return "yes" if I2V.search(prompt or "") else "unknown"


def emit(slug, title, category, model, prompt, url, licence, hint=None, cls_label=None):
    p = one_line(prompt)
    if len(p) < 25 or OUTLINE.match(p) or "SKILL.md" in p:
        return
    key = p.lower()
    if key in seen:
        return
    seen.add(key)
    t = one_line(title)[:160]
    c = one_line(category)
    cls = classify((t, c, cls_label), p)
    if p.startswith(("{", "[{")):
        cls += "+json"
    rows.append([None, LANE, slug, t, f"{cls}|{c}" if c else cls, "video", one_line(model) or "unknown",
                 p, needs_image(p, hint), url, licence])
    counts[slug] = counts.get(slug, 0) + 1


def gh(slug):
    full = slug.replace("__", "/", 1)
    return full, f"https://github.com/{full}", META.get(full.lower(), "NONE")


def jload(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def pick_lang(v, lang="en"):
    """Pick one language from a {'en':..,'zh':..} value."""
    if isinstance(v, dict):
        for k in (lang, "en", "fallback", "zh", "zh-Hans", "zh-CN"):
            if k in v and v[k]:
                return pick_lang(v[k], lang)
        for x in v.values():
            if x:
                return pick_lang(x, lang)
        return ""
    if isinstance(v, list):
        return " ".join(pick_lang(x, lang) for x in v)
    return "" if v is None else str(v)


# ---- markdown -------------------------------------------------------------
LOCALE = r"(ar|de|es|es-419|es-ES|fa|fr|hi|hi-IN|id|it|it-IT|ja|ja-JP|jp|ko|ko-KR|pt|pt-BR|pt-PT|ru|th|th-TH|tr|tr-TR|vi|vi-VN|zh|zh-CN|zh-TW|zh-Hans|zh-Hant|cn|tw|de-DE|fr-FR)"
LOCALE_FILE = re.compile(r"[._-]" + LOCALE + r"\.md$", re.I)
LOCALE_DIR = re.compile(r"(^|/)(i18n|locales?|translations|" + LOCALE + r")/", re.I)
SKIP_FILE = re.compile(r"(CONTRIBUTING|CHANGELOG|CODE_OF_CONDUCT|SECURITY|LICENSE|PULL_REQUEST|ISSUE_TEMPLATE|AGENTS|CLAUDE)", re.I)
CODE_LANGS = {"bash", "sh", "shell", "zsh", "console", "python", "py", "js", "javascript", "ts", "typescript", "tsx", "jsx",
              "html", "css", "mermaid", "diff", "toml", "ini", "powershell", "ps1", "sql", "go", "rust", "dockerfile",
              "makefile", "yaml", "yml", "env", "xml", "csv", "http", "graphql", "swift", "kotlin", "java", "c", "cpp"}
CMD = re.compile(r"^(\$ |git |npm |pnpm |npx |pip |curl |cd |python|node |claude |/[a-z-]+\b|export |brew |docker |uv |wget |mkdir |cp |ls |cat |import |from |const |let |def |function )")
GENERIC_HEAD = re.compile(r"^[\W_]*(prompt|prompts|提示词|英文提示词|中文提示词|english|中文|example|examples|示例|description|说明|output|template|模板|full prompt|完整提示词|完整json提示词|中文翻译版本)[\W_]*$", re.I)
JSONISH = re.compile(r"shot|camera|scene|prompt|subject|style|visual|lighting|action|audio", re.I)
LABEL = re.compile(r"^\s*(?:[-*>]\s*)?(?:\d+[.)]\s*)?\**_*(?:english |full |video |visual style |editing style |text |motion |camera )?(prompt|提示词)\**_*\s*[:：]\s*\**_*\s*(.{25,})$", re.I)


def md_items(text):
    """Yield (title, block) pairs from fenced blocks, labelled lines and (optionally) quotes."""
    heads = []
    lines = text.split("\n")
    i = 0
    while i < len(lines):
        ln = lines[i]
        m = re.match(r"^(#{1,6})\s+(.*)", ln)
        if m:
            lvl = len(m.group(1))
            heads = [h for h in heads if h[0] < lvl] + [(lvl, re.sub(r"[*_`#]|\[|\]\([^)]*\)", "", m.group(2)).strip())]
            i += 1
            continue
        f = re.match(r"^\s*(```+|~~~+)\s*([\w+-]*)", ln)
        if f:
            fence, lang = f.group(1), f.group(2).lower()
            j = i + 1
            buf = []
            while j < len(lines) and not lines[j].strip().startswith(fence[:3]):
                buf.append(lines[j])
                j += 1
            block = "\n".join(buf).strip()
            i = j + 1
            if lang in CODE_LANGS or not block:
                continue
            first = block.lstrip().split("\n", 1)[0]
            if CMD.match(first) or "├──" in block or "└──" in block or block.startswith("|"):
                continue
            if (lang == "json" or block.startswith("{")) and not JSONISH.search(block):
                continue
            yield title_of(heads), block
            continue
        lm = LABEL.match(ln)
        if lm:
            yield title_of(heads), lm.group(2).strip("*_ ")
        i += 1


def title_of(heads):
    for _, h in reversed(heads):
        if h and not GENERIC_HEAD.match(h):
            return h
    return heads[-1][1] if heads else ""


def md_quotes(text):
    heads = []
    buf = []
    for ln in text.split("\n") + [""]:
        m = re.match(r"^(#{1,6})\s+(.*)", ln)
        if m:
            heads = [(len(m.group(1)), m.group(2).strip())]
        if ln.startswith(">"):
            buf.append(ln.lstrip("> ").strip())
            continue
        if buf:
            items = [re.sub(r"^\d+[.)]\s*", "", b) for b in buf if b]
            if sum(1 for b in buf if re.match(r"^\d+[.)]", b)) >= 2:
                for it in items:
                    yield title_of(heads), it
            else:
                yield title_of(heads), " ".join(items)
            buf = []


def md_source(slug, model, files=None, quotes=False, hint=None, exclude=None):
    full, url, lic = gh(slug)
    base = os.path.join(RAW, slug)
    paths = files or sorted(glob.glob(os.path.join(base, "**", "*.md"), recursive=True))
    for p in paths:
        p = p if os.path.isabs(p) else os.path.join(base, p)
        rel = os.path.relpath(p, base)
        if not files and (LOCALE_FILE.search(rel) or LOCALE_DIR.search(rel) or SKIP_FILE.search(os.path.basename(rel))
                          or rel.startswith((".github", "node_modules")) or (exclude and re.search(exclude, rel))):
            continue
        if not os.path.exists(p):
            continue
        text = open(p, encoding="utf-8", errors="replace").read()
        src = f"{url}/blob/HEAD/{rel}"
        for title, block in md_items(text):
            emit(slug, title, os.path.dirname(rel) or "", model, block, src, lic, hint, cls_label=rel)
        if quotes:
            for title, block in md_quotes(text):
                emit(slug, title, os.path.dirname(rel) or "", model, block, src, lic, hint, cls_label=rel)


# ---- structured sources ---------------------------------------------------
def src_renoise():
    slug = "renoise-ai__awesome-seedance-prompts"
    _, url, lic = gh(slug)
    for p in sorted(glob.glob(os.path.join(RAW, slug, "data", "prompts", "*.json"))):
        d = jload(p)
        body = d.get("content", "")
        if d.get("language") not in (None, "en"):
            body = (d.get("translations") or {}).get("en", {}).get("content") or body
        tags = d.get("tags") or []
        emit(slug, d.get("title", ""), ",".join(tags) if isinstance(tags, list) else str(tags), "Seedance 2.0",
             body, d.get("sourceLink") or url, lic)


def src_goku():
    slug = "hf__GokuScraper__seedance-2-prompts-datasets"
    with open(os.path.join(RAW, slug, "metadata.jsonl"), encoding="utf-8") as f:
        for line in f:
            d = json.loads(line)
            i18n = d.get("i18n") or {}
            body = (i18n.get("en") or {}).get("p") or d.get("raw_p", "")
            mi = d.get("model_info") or {}
            emit(slug, d.get("slug", ""), d.get("category", ""), f"{mi.get('name','seedance')} {mi.get('version','')}",
                 body, d.get("sourceLink") or "https://huggingface.co/datasets/GokuScraper/seedance-2-prompts-datasets", "CC-BY-4.0")


def src_artificialguybr():
    slug = "hf__artificialguybr__veo3-video-prompts"
    for p in sorted(glob.glob(os.path.join(RAW, slug, "videos", "*", "train", "metadata.jsonl"))):
        cfg = p.split(os.sep)[-3]
        with open(p, encoding="utf-8") as f:
            for line in f:
                d = json.loads(line)
                has_img = d.get("input_image_file_name") not in (None, "", "None")
                emit(slug, d.get("file_name", ""), cfg, d.get("model", "veo3"), d.get("prompt", ""),
                     "https://huggingface.co/datasets/artificialguybr/veo3-video-prompts", "other (HF card)",
                     "yes" if has_img else "no")


def src_simple_jsonl(slug, fname, url, lic, model, title_k, cat_k, prompt_k="prompt", mode_k=None):
    with open(os.path.join(RAW, slug, fname), encoding="utf-8") as f:
        for line in f:
            d = json.loads(line)
            hint = None
            if mode_k and d.get(mode_k):
                hint = "yes" if "image" in d[mode_k] else "no"
            emit(slug, d.get(title_k, ""), d.get(cat_k, ""), model, d.get(prompt_k, ""), url, lic, hint)


def src_limbic():
    slug = "hf__Limbicnation__Video-Diffusion-Prompt-Style"
    for p in sorted(glob.glob(os.path.join(RAW, slug, "rows", "*.json"))):
        for r in jload(p)["rows"]:
            d = r["row"]
            body = d.get("prompt_text") or d.get("Prompt") or d.get("prompt") or ""
            emit(slug, d.get("style_name") or d.get("Style Name") or "", d.get("category") or "",
                 pick_lang(d.get("compatible_models")) or "Wan/LTX/Sora", body,
                 "https://huggingface.co/datasets/Limbicnation/Video-Diffusion-Prompt-Style", "MIT")


def src_adrian():
    slug = "hf__Adrian2016__awesome-image-video-prompts"
    for p in sorted(glob.glob(os.path.join(RAW, slug, "rows", "video_*.json"))):
        for r in jload(p)["rows"]:
            d = r["row"]
            hint = "yes" if "image" in (d.get("mode") or "") else ("no" if d.get("mode") else None)
            emit(slug, d.get("title_en", ""), d.get("category", ""), d.get("model", ""), d.get("prompt", ""),
                 d.get("source_url") or "https://huggingface.co/datasets/Adrian2016/awesome-image-video-prompts", "other (HF card)", hint)


def src_cclank():
    slug = "cclank__lanshu-awesome-ai-video-kit"
    _, url, lic = gh(slug)
    d = jload(os.path.join(RAW, slug, "prompts", "data", "all-prompts.json"))
    for x in d["prompts"]:
        src = (x.get("source") or {}).get("url") or url
        hint = "yes" if x.get("category") == "image-to-video" else None
        emit(slug, x.get("title", ""), x.get("category", ""), x.get("model", ""), x.get("prompt", ""), src, lic, hint)


def src_fizz():
    slug = "FizzEat__seedance-prompts-zh"
    _, url, lic = gh(slug)
    for x in jload(os.path.join(RAW, slug, "第一批.json")):
        emit(slug, x.get("title", ""), x.get("category", ""), "Seedance 2.5", x.get("prompt", ""), x.get("url") or url, lic)


def src_makernice():
    slug = "makernice__awesome-wan-kling-prompts"
    _, url, lic = gh(slug)
    for x in jload(os.path.join(RAW, slug, "data", "prompts.json")):
        hint = "yes" if str(x.get("needs_reference_images")) == "True" else None
        emit(slug, x.get("title", ""), x.get("category", ""), x.get("model", ""), x.get("prompt", ""), x.get("post_url") or url, lic, hint)


def src_oldwinter():
    slug = "oldwinter__official-prompt-video-gallery"
    _, url, lic = gh(slug)
    d = jload(os.path.join(RAW, slug, "data", "comparison.json"))
    for cid, c in d["cases"].items():
        pr = c.get("prompt")
        body = pr.get("text") if isinstance(pr, dict) else pr
        emit(slug, c.get("title", cid), "official-example", ",".join(d.get("routes", {}).keys()), body or "", url, lic)


def src_learnprompt():
    slug = "LearnPrompt__awesome-seedance"
    _, url, lic = gh(slug)
    for x in jload(os.path.join(RAW, slug, "data", "cases.json"))["cases"]:
        if x.get("mediaType") not in (None, "video"):
            continue
        emit(slug, x.get("titleEn") or x.get("title", ""), x.get("category", ""), pick_lang(x.get("models")) or "Seedance",
             x.get("promptFull") or x.get("prompt", ""), x.get("sourceUrl") or url, lic)


def src_atlas():
    slug = "AtlasCloudAI__awesome-seedance-2.5-prompts-skills"
    _, url, lic = gh(slug)
    for x in jload(os.path.join(RAW, slug, "data", "prompts.json")):
        refs = x.get("reference_images")
        emit(slug, x.get("title", ""), x.get("category", ""), "Seedance 2.5", x.get("prompt", ""),
             x.get("source_link") or url, lic, "yes" if refs else None)


def src_beatapi():
    slug = "BeatAPI__awesome-seedance-2-5-prompts"
    _, url, lic = gh(slug)
    for x in jload(os.path.join(RAW, slug, "prompts", "catalog.json"))["prompts"]:
        mode = x.get("mode") or ""
        hint = "yes" if "image" in mode or "reference" in mode else ("no" if mode == "text-to-video" else None)
        emit(slug, pick_lang(x.get("title")), x.get("category", ""), "Seedance 2.5", x.get("prompt", ""),
             (x.get("source") or {}).get("url") or url, lic, hint)


def src_motionprompt():
    slug = "showheyohtaki__motion-prompt"
    _, url, lic = gh(slug)
    for x in jload(os.path.join(RAW, slug, "api", "v1", "catalog.json"))["elements"]:
        body = " ".join(filter(None, [pick_lang(x.get("ask")), pick_lang(x.get("summary"))]))
        emit(slug, pick_lang(x.get("name")), f"{x.get('pack')}/{x.get('category')}", "any (motion-graphics/video agent)", body, url, lic)


def src_jnmeta():
    slug = "jnMetaCode__ai-shortfilm-prompts"
    _, url, lic = gh(slug)
    for x in jload(os.path.join(RAW, slug, "templates", "index.json"))["templates"]:
        body = re.sub(r"^```\w*|```$", "", (x.get("prompt") or "").strip()).strip()
        emit(slug, x.get("title", ""), x.get("category", ""), "Sora/Veo/Kling/Seedance", body, x.get("source") or url, lic)


def src_zerolu():
    slug = "ZeroLu__awesome-seedance-2.5"
    _, url, lic = gh(slug)
    for x in jload(os.path.join(RAW, slug, "data", "community-x-seedance-cases.json")):
        pr = x.get("prompt") or {}
        body = pick_lang(pr, pr.get("originalLanguage", "en")) if isinstance(pr, dict) else pr
        emit(slug, pick_lang(x.get("title")), x.get("category", ""), "Seedance 2.5", body, (x.get("source") or {}).get("tweetUrl") or url, lic)


def src_evolink_guides():
    slug = "Evolink-AI__awesome-seedance-2.5-guides"
    _, url, lic = gh(slug)
    for k, x in jload(os.path.join(RAW, slug, "data", "seedance-2-5-prompt-translations.json"))["en"].items():
        emit(slug, x.get("title", k), x.get("section", "official guide"), "Seedance 2.5 (official guide)", x.get("prompt", ""), url, lic)


def src_yinxiaowai():
    slug = "yinxiaowai__awesome-ai-video-camera-movement-prompts"
    _, url, lic = gh(slug)
    for x in jload(os.path.join(RAW, slug, "assets", "cases.json")):
        emit(slug, x.get("title", ""), "camera:" + x.get("section", ""), "unknown", x.get("prompt", ""), url, lic, cls_label="camera")


def src_ilkerzg():
    slug = "ilkerzg__awesome-video-prompts"
    _, url, lic = gh(slug)
    t = open(os.path.join(RAW, slug, "src", "lib", "example-videos.ts"), encoding="utf-8").read()
    for blk in re.findall(r"\{\s*\n\s*id: \"(.*?)\",\s*\n\s*prompt: \"((?:[^\"\\]|\\.)*)\"(.*?)\n\s*\}", t, re.S):
        rest = blk[2]
        model = re.search(r'model: "(.*?)"', rest)
        cat = re.search(r'category: "(.*?)"', rest)
        emit(slug, blk[0], cat.group(1) if cat else "", model.group(1) if model else "", json.loads('"' + blk[1] + '"'), url, lic)
    t = open(os.path.join(RAW, slug, "src", "lib", "shot-categories.ts"), encoding="utf-8").read()
    cat = ""
    for ln in t.split("\n"):
        m = re.match(r'\s*name: "(.*?)",', ln)
        if m:
            cat = m.group(1)
        m = re.search(r'label: "(.*?)", description: "((?:[^"\\]|\\.)*)"', ln)
        if m:
            emit(slug, m.group(1), "vocab:" + cat, "any", f"{m.group(1)}: {m.group(2)}", url, lic, cls_label="vocab " + cat)


def src_html_text(slug, fname, model, cls_label=None):
    """Prompts embedded as quoted JS strings in a single-page HTML library."""
    full, url, lic = gh(slug)
    t = open(os.path.join(RAW, slug, fname), encoding="utf-8").read()
    for m in re.finditer(r"(?:prompt|text|p)\s*:\s*(\"|`|')((?:(?!\1)[^\\]|\\.){40,}?)\1", t):
        title = ""
        pre = t[max(0, m.start() - 400):m.start()]
        tm = re.findall(r"\b(?:name|title|label|t)\s*:\s*[\"'`](.*?)[\"'`]", pre)
        if tm:
            title = tm[-1]
        emit(slug, title, "camera", model, html.unescape(m.group(2).replace("\\n", " ")), url, lic, cls_label=cls_label)


def src_pletor():
    """Fashion camera-move library: each JS object is move/action/pace/lock/resolve parts of one start-frame prompt."""
    slug = "raphaelguilhem-dot__fashion-camera-movements"
    _, url, lic = gh(slug)
    t = open(os.path.join(RAW, slug, "public", "index.html"), encoding="utf-8").read()
    for line in t.split("\n"):
        if not line.strip().startswith("{code:"):
            continue
        f = dict(re.findall(r"(\w+):\"((?:[^\"\\]|\\.)*)\"", line))
        body = f"{f.get('move', '')}. {f.get('action', '')} Pace: {f.get('pace', '')} Lock: {f.get('lock', '')} Resolve: {f.get('resolve', '')}"
        emit(slug, f.get("name", ""), "camera:" + f.get("group", ""), "Seedance (start frame)", body, url, lic, "yes", cls_label="camera")


def src_zbailey():
    slug = "zbailey83__veo3-json"
    _, url, lic = gh(slug)
    for p in sorted(glob.glob(os.path.join(RAW, slug, "*.json"))):
        emit(slug, os.path.basename(p), "meta-prompt (Veo JSON prompt builder)", "Veo 3",
             open(p, encoding="utf-8").read(), f"{url}/blob/HEAD/{os.path.basename(p)}", lic, "no", cls_label="meta-prompt")


def src_gunah():
    slug = "hf__gunahkarcasper__ai-video-cinematography-prompts"
    with open(os.path.join(RAW, slug, "camera_prompts.csv"), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            vals = [v for v in r.values() if v]
            emit(slug, vals[0] if vals else "", "camera", "unknown", " ".join(vals),
                 "https://huggingface.co/datasets/gunahkarcasper/ai-video-cinematography-prompts", "none stated", cls_label="camera")


def src_fei():
    slug = "hf__fei567__open-video-prompts"
    for p in sorted(glob.glob(os.path.join(RAW, slug, "prompts", "*.txt"))):
        emit(slug, os.path.basename(p)[:-4], "", "multi (official/ported)", open(p, encoding="utf-8").read(),
             "https://huggingface.co/datasets/fei567/open-video-prompts", "Apache-2.0")


def src_introvoyz():
    slug = "hf__introvoyz045__awesome-ai-video-prompts"
    base = os.path.join(RAW, slug, "data", "models")
    for p in sorted(glob.glob(os.path.join(base, "*", "cases", "*.md"))):
        if LOCALE_FILE.search(p):
            continue
        model = p.split(os.sep)[-3]
        text = open(p, encoding="utf-8").read()
        for title, block in md_items(text):
            emit(slug, title, os.path.basename(p)[:-3], model, block,
                 "https://huggingface.co/datasets/introvoyz045/awesome-ai-video-prompts", "MIT")


# ---- official model-maker guides -------------------------------------------
def guide_text(fname):
    return html2text_lib.render(os.path.join(RAW, "official-guides", fname))


def src_guides():
    slug = "official-guides"
    # Google DeepMind Veo 3 guide: "Prompt: ..." lines
    t = guide_text("deepmind-veo-prompt-guide.html")
    head = ""
    for ln in t.split("\n"):
        if ln.startswith("Prompt:"):
            emit(slug, head, "official: DeepMind Veo 3 prompt guide", "Veo 3", ln[7:],
                 "https://deepmind.google/models/veo/prompt-guide/", "Google site terms (quoted examples)")
        elif 3 < len(ln) < 60 and not ln.endswith("."):
            head = ln
    # Vertex AI Veo prompt guide: quoted example strings (camera/lens/style vocabulary + full examples)
    t = guide_text("vertex-veo-prompt-guide.html")
    t = t[t.find("Anatomy of a prompt"):]
    paras = re.split(r"\n\s*\n", t)
    head = ""
    for para in paras:
        flat = " ".join(para.split())
        if 3 < len(flat) < 50 and not flat.endswith(".") and '"' not in flat:
            head = flat
        for q in re.findall(r"[\"“]([^\"”]{20,})[\"”]", flat):
            emit(slug, head, "official: Vertex AI Veo prompt guide", "Veo", q,
                 "https://cloud.google.com/vertex-ai/generative-ai/docs/video/video-gen-prompt-guide", "CC-BY-4.0 (Google docs)")
    # Kling VIDEO 3.0 user guide: example prompts sit between an Output heading and ExpandHideCopy
    t = guide_text("kling-guide.html")
    grab = False
    head = ""
    for ln in t.split("\n"):
        s = ln.strip()
        if s in ("Output", "Outputs") or s.endswith("Output"):
            grab = True
            continue
        if s.startswith("ExpandHideCopy") or s == "Prompt" or re.match(r"^\d+\. ", s):
            grab = s == "ExpandHideCopy" and grab
            if re.match(r"^\d+\. ", s):
                head = s
            continue
        if grab and len(s) > 60 and not s.startswith(("From Kling", "With the", "After uploading", "Once created", "Video 3.0", "VIDEO 3.0", "By ")):
            emit(slug, head, "official: Kling VIDEO 3.0 user guide", "Kling VIDEO 3.0", s,
                 "https://app.klingai.com/global/quickstart/klingai-video-3-model-user-guide", "Kling site terms (quoted examples)")
    # OpenAI Sora 2 prompting guide (cookbook notebook, MIT)
    nb = jload(os.path.join(RAW, "official-guides", "openai-sora2-prompting-guide.ipynb.json"))
    md = "\n\n".join("".join(c["source"]) for c in nb["cells"] if c["cell_type"] == "markdown")
    for title, block in md_items(md):
        emit(slug, title, "official: OpenAI Sora 2 prompting guide", "Sora 2", block,
             "https://github.com/openai/openai-cookbook/blob/main/examples/sora/sora2_prompting_guide.ipynb", "MIT")
    # Wan 2.2 / 2.1 official prompt-extension system prompts (meta-prompts)
    for fname, lic_url in (("wan22-system_prompt.py.txt", "https://github.com/Wan-Video/Wan2.2/blob/main/wan/utils/system_prompt.py"),
                           ("wan21-system_prompt.py.txt", "https://github.com/Wan-Video/Wan2.1/blob/main/wan/utils/prompt_extend.py")):
        t = open(os.path.join(RAW, "official-guides", fname), encoding="utf-8").read()
        for name, body in re.findall(r"^([A-Z0-9_]+)\s*=\s*\\?\s*\n?\s*(?:'''|\"\"\")(.*?)(?:'''|\"\"\")", t, re.S | re.M):
            hint = "yes" if "I2V" in name or "VL" in name else "no"
            emit(slug, name, "official: Wan prompt-extend system prompt", "Wan 2.x", body, lic_url, "Apache-2.0", hint, cls_label="meta-prompt")


# ---- run ------------------------------------------------------------------
ORDER = [
    # curated, ad-agency-relevant first so exact duplicates keep their best attribution
    lambda: md_source("cliprise__awesome-ai-product-video-prompts", "multi"),
    lambda: md_source("cliprise__awesome-ai-video-ads-prompts", "multi"),
    lambda: md_source("cliprise__awesome-ai-ugc-video-prompts", "multi"),
    lambda: md_source("cliprise__awesome-image-to-video-prompts", "multi", hint="yes"),
    lambda: md_source("liangdabiao__ecom-video-seedance-prompt", "Seedance"),
    lambda: md_source("navidmotiwala__ai-video-ad-prompt-library", "multi"),
    lambda: md_source("X-RayLuan__awesome-ai-video-ad-prompts", "multi"),
    lambda: md_source("PowerTokens__media-skills", "Seedance/Wan/Kling/MiniMax"),
    src_guides,
    src_evolink_guides,
    lambda: md_source("Evolink-AI__awesome-seedance-2.5-guides", "Seedance 2.5 (official guide)", exclude=r"^use-cases/(?!en/)"),
    src_oldwinter,
    src_yinxiaowai,
    src_ilkerzg,
    src_motionprompt,
    lambda: src_html_text("mrzaving__camera-movement-prompts-skill", "index.html", "any", cls_label="camera"),
    src_pletor,
    lambda: md_source("hmzainjamil__higgsfield-cinema-ai", "Higgsfield"),
    lambda: md_source("Rylaispirit__cinematic-video-prompt-skill", "multi"),
    src_gunah,
    lambda: md_source("songguoxs__awesome-video-prompts", "Veo3/Kling/Hailuo"),
    lambda: md_source("liu-kaining__Awesome-Veo3-Prompts", "Veo 3"),
    src_zbailey,
    lambda: md_source("zhangchenchen__awesome_sora2_prompt", "Sora 2"),
    lambda: md_source("jmanhype__awesome-sora2-prompts", "Sora 2"),
    lambda: md_source("SoraEase__sora-prompt", "Sora", quotes=True),
    lambda: md_source("hr98w__awesome-sora-prompts", "Sora", quotes=True),
    lambda: md_source("xjpp22__awesome--sora-prompts", "Sora"),
    lambda: md_source("0xSojalSec__Sora2_Prompts", "Sora 2"),
    lambda: md_source("Reviral-ai__awesome-kling-prompts", "Kling"),
    lambda: md_source("Reviral-ai__awesome-hailuo-prompts", "Hailuo"),
    lambda: md_source("WaveSpeedAI__awesome-kling-api", "Kling"),
    src_makernice,
    lambda: md_source("makernice__awesome-wan-kling-prompts", "Wan/Kling"),
    src_cclank,
    src_learnprompt,
    src_atlas,
    src_beatapi,
    lambda: md_source("YouMind-OpenLab__awesome-seedance-2-prompts", "Seedance 2.0", files=["README.md"]),
    lambda: md_source("Evolink-AI__awesome-seedance-2.5-prompts", "Seedance 2.5", files=["README.md"]),
    src_zerolu,
    lambda: md_source("ZeroLu__awesome-seedance-2.5", "Seedance 2.5", files=["README.md"]),
    lambda: md_source("Anil-matcha__awesome-seedance-2.5-api-prompts", "Seedance 2.5"),
    lambda: md_source("flaqai__awesome_seedance_2_5", "Seedance 2.5"),
    lambda: md_source("weshopai__awesome-Seedance-2.0-prompt", "Seedance 2.0"),
    lambda: md_source("HuyLe82US__awesome-seedance-prompts", "Seedance 2.0"),
    lambda: md_source("marsoyang1__awesome-seedance-prompts", "Seedance 2.0"),
    lambda: md_source("lipsyncvideoai__awesome-seedance-prompts", "Seedance"),
    src_fizz,
    lambda: md_source("songguoxs__seedance-prompt-skill", "Seedance 2.0"),
    lambda: md_source("robonuggets__seedance-skill", "Seedance 2.0"),
    lambda: md_source("beshuaxian__higgsfield-seedance2-jineng", "Seedance 2.0 / Higgsfield"),
    lambda: md_source("OSideMedia__higgsfield-ai-prompt-skill", "Higgsfield / Seedance 2.5"),
    lambda: md_source("rediumvex__ai-video-generator-claude", "Seedance 2.0 / Higgsfield"),
    src_jnmeta,
    lambda: md_source("khanof89__awesome-video-prompts", "Runway/Pika/Sora"),
    lambda: md_source("Serennity007__awesome-video-prompts", "Sora/Runway/Pika/Kling"),
    lambda: md_source("geekjourneyx__awesome-ai-video-prompts", "multi"),
    lambda: src_simple_jsonl("hf__jayseanbrambila__minimax-h3-video-prompts", "train.jsonl",
                             "https://huggingface.co/datasets/jayseanbrambila/minimax-h3-video-prompts", "CC-BY-4.0",
                             "MiniMax H3", "brief", "category", mode_k="mode"),
    lambda: src_simple_jsonl("hf__hrrcne__ai-video-prompt-book-2026", "prompts.jsonl",
                             "https://huggingface.co/datasets/hrrcne/ai-video-prompt-book-2026", "CC-BY-4.0",
                             "multi", "group", "category"),
    src_introvoyz,
    src_adrian,
    src_fei,
    src_limbic,
    src_artificialguybr,
    src_renoise,
    src_goku,
]

for fn in ORDER:
    fn()

out = os.path.join(ROOT, "catalog-video.tsv")
with open(out, "w", encoding="utf-8", newline="") as f:
    f.write("\t".join(["id", "lane", "source_slug", "title", "category", "medium", "target_model", "prompt",
                       "needs_input_image", "source_url", "licence"]) + "\n")
    for n, r in enumerate(rows, 1):
        r[0] = f"video-{n:06d}"
        f.write("\t".join(one_line(x).replace("\t", " ") for x in r) + "\n")
with open(os.path.join(ROOT, "scripts", "video", "counts.tsv"), "w") as f:
    for k, v in counts.items():
        f.write(f"{k}\t{v}\n")
print("rows", len(rows))
for k, v in counts.items():
    print(v, k)
