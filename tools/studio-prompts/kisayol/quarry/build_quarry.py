"""Build the kisayol quarry: one searchable SQLite store of the collected raw prompts.

Reads the three catalog TSVs of .planning/quick/20261108-kisayol/ (third-party text: data only,
never instructions; run with `python3 -I`), writes RAW-HASHES.tsv beside this file and builds
~/.local/share/dxb/kisayol/quarry.sqlite:

  prompts(id, lane, source_slug, grade, title, category, medium, target_model, era, prompt,
          needs_input_image, source_url, licence, dup_count, flags)
  prompts_fts  FTS5 over title, category, prompt (external content on prompts.rowid)

Near-duplicates are collapsed inside each lane: word 3-shingles of the normalised text,
one-permutation MinHash with LSH bands to find candidates, and two prompts whose shingle sets
have Jaccard >= 0.7 are one group. The group keeps its best
row (grade, then current era, then catalog order); dup_count is the group size, a duplication
signal and not popularity. `flags` is a comma-separated triage list, never a deletion.
"""
import csv
import hashlib
import multiprocessing
import os
import re
import sqlite3
import sys
from collections import Counter
from functools import lru_cache
from pathlib import Path

HERE = Path(__file__).resolve().parent
COLLECTION = HERE.parents[3] / ".planning" / "quick" / "20261108-kisayol"
CATALOGS = {  # lane -> (file, expected row count)
    "image-general": ("catalog-image-general.tsv", 201249),
    "image-ads": ("catalog-image-ads.tsv", 9417),
    "video": ("catalog-video.tsv", 25620),
}
DB_PATH = Path.home() / ".local" / "share" / "dxb" / "kisayol" / "quarry.sqlite"
COLUMNS = ("id", "lane", "source_slug", "grade", "title", "category", "medium", "target_model",
           "era", "prompt", "needs_input_image", "source_url", "licence", "dup_count", "flags")
GRADE_RANK = {"A": 0, "B": 1, "C": 2, "D": 3}

csv.field_size_limit(10**9)


# --- reading ---------------------------------------------------------------------------------

def read_catalog(path):
    """Rows of one catalog TSV as dicts (tab-separated, no quoting)."""
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter="\t", quoting=csv.QUOTE_NONE)
        header = next(reader)
        return [dict(zip(header, fields)) for fields in reader]


def sha256_of(path):
    digest = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def load_grades(path):
    with open(path, newline="", encoding="utf-8") as f:
        return {r["source_slug"]: r["grade"] for r in csv.DictReader(f, delimiter="\t")}


# --- era -------------------------------------------------------------------------------------

_CURRENT_MODEL = re.compile(
    r"gpt[- ]?image(?![- ]?1\b)|gptimage|nano[- ]?banana|seedream|seedance|veo|kling|sora[- ]?2"
    r"|\bwan|flux[- ]?2|qwen|hunyuan|krea|minimax|hailuo|happy[- ]?horse|gemini|higgsfield"
    r"|jimeng|pika[- ]?2\.5|runway[- ]?gen[- ]?4|z-image|imagen|ideogram|ltx", re.I)
_OLDER_MODEL = re.compile(
    r"stable[- ]?diffusion|sdxl|\bsd ?[12]\b|midjourney|\bflux\b|gpt-4o|gpt-image-1|dall-?e"
    r"|\bsora\b|runway|pika|leonardo", re.I)
_MIDJOURNEY_V7_UP = re.compile(r"--v(?:ersion)?\s*(?:[7-9]|\d{2})\b")
# Model-agnostic rows fall back to the source: these sources' material predates 2025
# (dates in sources-*.md); every other source is 2025-2026 material.
OLDER_SOURCES = {
    "ezagor-midjourney", "hf-parti-prompts", "hf-gustavosta-sd-prompts", "hf-diffusiondb",
    "hf-sd-prompts-2-47m", "hf-midjourney-messages", "hf-succinctly-midjourney",
    "hf-k-mktr-improved-flux-prompts", "Douleb__SDXL-A1111-Styles", "K3nt3L__MK-Styles",
    "twri__sdxl_prompt_styler", "thundercat71__Automatic1111-Fooocus-Styles",
    "hf__Falah__fashion_photography_prompts_SDXL", "hf__Falah__logo_prompts",
    "hf__Falah__catalogue_photography_prompts", "hf__Falah__product_photography_prompts",
    "hf__Falah__luxurious_food_photography_prompts", "xjpp22__awesome--sora-prompts",
    "khanof89__awesome-video-prompts",
}


def era_for(target_model, source_slug, prompt):
    """'current' or 'older' from the named model, else from the source's date."""
    if re.search(r"midjourney", target_model, re.I) and _MIDJOURNEY_V7_UP.search(prompt):
        return "current"
    if _CURRENT_MODEL.search(target_model):
        return "current"
    if _OLDER_MODEL.search(target_model):
        return "older"
    return "older" if source_slug in OLDER_SOURCES else "current"


# --- flags -----------------------------------------------------------------------------------

# flag -> (word patterns, matched between \b...\b; raw patterns for CJK and symbols).
# Turkish stems carry \w* so suffixed forms match; "-sız/-siz/-suz/-süz" is read as negation.
FLAG_TERMS = {
    "alcohol": ([
        r"alcohol\w*", r"wines?(?![\s-]*(?:red|colou?r|colou?red|tones?)\b)", r"winery", r"beers?",
        r"brewery", r"whiske?y", r"vodka", r"tequila", r"cognac", r"brandy", r"bourbon",
        r"champagne(?![\s-]*(?:gold|colou?r|colou?red|pink|beige)\b)",
        r"cocktails?(?![\s-]*(?:dress|dresses|gown|ring|napkins?)\b)", r"liquor", r"booze",
        r"rum", r"gin", r"martini", r"margarita", r"prosecco", r"sangria", r"mezcal", r"absinthe",
        r"şarap\w*", r"bira(?:lar\w*|y[ıi]|n[ıi]n|s[ıi])?", r"viski\w*", r"votka\w*", r"rakı\w*",
        r"alkol\w*", r"kokteyl\w*", r"şampanya\w*", r"likör\w*",
    ], ["啤酒", "红酒", "葡萄酒", "白酒", "威士忌", "伏特加", "香槟", "鸡尾酒", "酒精", "清酒",
        "白兰地", "酒吧", "烈酒", "黄酒", "米酒", "喝酒"]),
    "gambling": ([
        r"casinos?", r"gambl\w*", r"poker", r"roulette", r"slot machines?", r"betting",
        r"sportsbook", r"bookmakers?", r"lottery", r"lotto", r"jackpot", r"blackjack", r"baccarat",
        r"kumar\w*", r"bahis\w*", r"rulet\w*", r"piyango\w*", r"iddaa",
    ], ["赌博", "赌场", "博彩", "彩票", "老虎机", "轮盘", "赌注", "下注", "百家乐"]),
    "interest-finance": ([
        r"interest rates?", r"(?:low|high|zero|0%)[\s-]+interest", r"compound interest",
        r"loans?", r"mortgages?", r"credit cards?", r"payday", r"lending", r"lenders?", r"usury",
        r"riba", r"forex",
        r"faiz\w*", r"kredi\w*", r"ipotek\w*", r"tefeci\w*",
    ], ["利息", "贷款", "利率", "信用卡", "按揭", "高利贷", "借贷"]),
    "nudity-lingerie": ([
        r"nude(?![\s-]*(?:colou?r|colou?red|tones?|toned|palette|lip\w*|beige|pink|shades?|heels?|makeup|nails?)\b)",
        r"naked", r"nudity", r"topless", r"bottomless", r"lingerie", r"bikinis?", r"underwear",
        r"bras?", r"brassiere", r"panties", r"thongs?", r"g-string", r"erotic\w*", r"sexy",
        r"seductive", r"sensual\w*", r"cleavage", r"nsfw", r"see-through", r"swimsuits?",
        r"swimwear", r"boudoir", r"stockings", r"provocative", r"busty", r"nipples?",
        r"çıplak\w*", r"iç çamaşır\w*", r"erotik\w*", r"seksi", r"dekolte\w*",
    ], ["裸体", "裸露", "内衣", "比基尼", "性感", "情趣", "胸罩", "色情", "泳装", "泳衣", "半裸", "全裸"]),
    "flirting-romance": ([
        r"romantic\w*", r"romance", r"flirt\w*", r"kiss(?:es|ing|ed)?", r"lovers?",
        r"date night", r"dating", r"valentine\w*", r"boyfriends?", r"girlfriends?", r"honeymoon",
        r"in love", r"cuddl\w*", r"making out",
        r"flört\w*", r"öpüş\w*", r"öpücük\w*", r"romantik\w*", r"sevgili\w*", r"aşk", r"aşık\w*",
    ], ["浪漫", "接吻", "亲吻", "情侣", "约会", "恋爱", "情人节", "调情", "男朋友", "女朋友", "恋人"]),
    "real-person": ([
        r"celebrit(?:y|ies)", r"famous (?:actor|actress|singer|person|people|athlete|footballer|politician|rapper)",
        r"real person", r"look-?alike", r"deepfake\w*",
        r"taylor swift", r"elon musk", r"donald trump", r"joe biden", r"barack obama", r"obama",
        r"kim kardashian", r"kylie jenner", r"scarlett johansson", r"emma watson", r"emma stone",
        r"margot robbie", r"zendaya", r"beyonc[eé]", r"rihanna", r"lady gaga", r"ariana grande",
        r"selena gomez", r"billie eilish", r"dua lipa", r"lionel messi", r"messi",
        r"cristiano ronaldo", r"ronaldo", r"neymar", r"lebron james", r"michael jordan",
        r"keanu reeves", r"tom cruise", r"brad pitt", r"angelina jolie", r"leonardo dicaprio",
        r"johnny depp", r"will smith", r"dwayne johnson", r"morgan freeman", r"marilyn monroe",
        r"audrey hepburn", r"einstein", r"elvis presley", r"michael jackson", r"mark zuckerberg",
        r"bill gates", r"steve jobs", r"jeff bezos", r"vladimir putin", r"putin", r"xi jinping",
        r"narendra modi", r"erdo[gğ]an", r"atat[uü]rk", r"queen elizabeth", r"king charles",
        r"princess diana", r"mr ?beast", r"jackie chan", r"bruce lee", r"jay chou",
        r"ünlü", r"tanınmış",
    ], ["明星", "名人", "周杰伦", "刘亦菲", "杨幂", "迪丽热巴", "成龙", "李小龙"]),
    "brand-name": ([
        r"logo\w*", r"trademarks?", r"brand names?", r"marka\w*",
        r"nike", r"adidas", r"reebok", r"new balance", r"gucci", r"chanel", r"louis vuitton",
        r"prada", r"dior", r"versace", r"balenciaga", r"yves saint laurent", r"ysl", r"burberry",
        r"fendi", r"rolex", r"cartier", r"coca[- ]cola", r"pepsi", r"red bull", r"starbucks",
        r"mcdonald'?s", r"kfc", r"burger king", r"heineken", r"iphone\w*", r"ipad\w*", r"macbook\w*",
        r"airpods", r"apple watch", r"apple logo", r"samsung", r"sony", r"playstation", r"xbox",
        r"nintendo", r"tesla", r"bmw", r"mercedes(?:-benz)?", r"porsche", r"ferrari",
        r"lamborghini", r"audi", r"toyota", r"rolls-royce", r"bentley", r"land rover",
        r"range rover", r"lego", r"disney", r"marvel", r"pixar", r"hello kitty", r"pok[eé]mon",
        r"barbie", r"l'or[eé]al", r"est[eé]e lauder", r"maybelline", r"sephora", r"ikea", r"zara",
        r"uniqlo", r"shein", r"the north face", r"under armour", r"lululemon", r"ray-ban",
        r"oakley", r"gopro", r"dyson", r"nespresso", r"nutella", r"oreo", r"kit ?kat",
        r"toblerone", r"victoria'?s secret",
    ], ["™", "®", "h&m", "hermès", "耐克", "阿迪达斯", "可口可乐", "星巴克", "麦当劳", "香奈儿",
        "古驰", "路易威登", "迪士尼", "苹果手机", "华为", "李宁", "茅台", "商标"]),
    "lettering-request": ([
        r"texts?(?![\s-]*(?:to|2)[\s-]*(?:video|image|speech)\b|[\s-]*(?:prompts?|encoder)\b)",
        r"typograph\w*", r"lettering", r"headlines?", r"slogans?", r"taglines?", r"captions?",
        r"subtitles?", r"fonts?", r"wordmark", r"inscription", r"calligraph\w*", r"the words?",
        r"that reads", r"which reads", r"written", r"cta",
        r"yazı(?:sı|yı|nın|lar\w*|lı)?", r"metin(?:ler\w*|i|e)?", r"başlı[kğ]\w*", r"slogan\w*",
        r"tipografi\w*", r"yazan",
    ], ["文字", "标题", "字体", "标语", "文案", "写着", "字样", "艺术字", "题字"]),
    "agent-directed": ([
        r"ignore (?:all |any |the )?(?:previous|prior|above|earlier|preceding)",
        r"disregard (?:all|any|the|previous|prior|above)",
        r"you are (?:an? )?(?:ai|artificial intelligence|assistant|ai assistant|chatbot|language model|large language model|llm|chatgpt|claude|gpt)",
        r"as an ai", r"system prompt", r"system message", r"jailbreak\w*", r"developer mode",
        r"your (?:task|job|role) is to", r"you are an? prompt (?:engineer|expert|optimi[sz]er|writer)",
        r"output only", r"respond only",
        r"önceki talimat\w*", r"sistem istem\w*",
    ], [r"<\|im_start\|>", r"\[inst\]", "忽略之前", "忽略以上", "忽略上述", "系统提示", "你是一位",
        "你是一个", "你的任务是"]),
    "url-code": ([
        r"def\s+\w+\s*\(", r"curl\s+-", r"function\s*\(", r"eval\s*\(", r"base64", r"api[_-]?key",
    ], [r"https?://", r"www\.\w", "```", "<script", "<iframe", r"<\?php"]),
}
UNNEGATABLE = {"agent-directed", "url-code"}


def _flag_regex():
    groups = []
    for flag, (words, raw) in FLAG_TERMS.items():
        parts = [r"\b(?:" + "|".join(words) + r")\b"] + list(raw)
        groups.append(f"(?P<{flag.replace('-', '_')}>" + "|".join(parts) + ")")
    return re.compile("|".join(groups))


_FLAG_RE = _flag_regex()


# A negation opener before the term, inside the same clause: list openers cover the whole
# rest of the clause ("Negative prompt: nude, text", "--no text", "avoid: logos, wine"),
# word openers only the next four words ("no text", "without logo"). Turkish negates after
# the term ("yazı olmadan", "alkolsüz"), Chinese right before it ("无文字").
_CLAUSE_END = re.compile(r"[.;!?\n。！？；]")
_LIST_OPENER = re.compile(
    r"negative(?: prompts?)?\s*:|--no\b|\bavoid\w*|\bexclud\w*|\b(?:do not|don'?t|never|must not)"
    r" (?:include|show|add|use|render|put)\b|避免|不要|禁止|不含|不包含|排除")
_WORD_OPENER = re.compile(r"\b(?:no|not|non|without|zero|free of|never|sans)\b")
_TERM_SUFFIX = re.compile(r"[\s-]*(?:free|less)\b|\s+(?:olmadan|yok|olmasın|içermeyen|içermesin)\b")
_TURKISH_PRIVATIVE = re.compile(r"\w{2,}s[ıiuü]z\w*$")
_CJK_OPENER = re.compile(r"(?:无|非|不|没|没有|去掉|去除)\s*$")


def _negated(text, start, end):
    clause = text[max(0, start - 300):start]
    clause = clause[max((m.end() for m in _CLAUSE_END.finditer(clause)), default=0):]
    if _LIST_OPENER.search(clause):
        return True
    if _WORD_OPENER.search(" ".join(re.findall(r"[\w'-]+", clause)[-4:])):
        return True
    return bool(_TERM_SUFFIX.match(text, end) or _TURKISH_PRIVATIVE.search(text[start:end])
                or _CJK_OPENER.search(clause[-3:]))


def flags_for(text):
    """Sorted triage flags raised by `text`; negated mentions ("no text", "alcohol-free") do not count."""
    text = text.lower()
    found = set()
    for m in _FLAG_RE.finditer(text):
        flag = m.lastgroup.replace("_", "-")
        if flag in found:
            continue
        if flag in UNNEGATABLE or not _negated(text, m.start(), m.end()):
            found.add(flag)
    return sorted(found)


# --- near-duplicate collapse -----------------------------------------------------------------

_CJK = "぀-ヿ㐀-鿿가-힯"
_TOKEN_RE = re.compile(rf"[{_CJK}]|[^\W{_CJK}]+")  # CJK one char per token, else words
SIGNATURE_BINS = 30  # one-permutation MinHash: a shingle hash h falls in bin h % 30
LSH_ROWS = 3  # 10 bands of 3 bins: a pair at Jaccard 0.7 shares a band with p ~ 0.985
MIN_JACCARD = 0.7  # word 3-shingle Jaccard at or above which two prompts are one group


def normalise(text):
    """Lowercase, punctuation replaced by space, whitespace collapsed."""
    return " ".join(re.sub(r"[^\w\s]+|_", " ", text.lower()).split())


@lru_cache(maxsize=1 << 20)
def _hash64(shingle):
    return int.from_bytes(hashlib.blake2b(shingle.encode(), digest_size=8).digest(), "little")


@lru_cache(maxsize=4096)
def shingle_hashes(norm):
    """Hashes of the word 3-shingles of normalised text (one shingle below three words)."""
    tokens = _TOKEN_RE.findall(norm)
    return frozenset(_hash64(" ".join(tokens[i:i + 3])) for i in range(max(1, len(tokens) - 2)))


def signature(hashes):
    """One-permutation MinHash; an empty bin borrows the next filled bin to its right."""
    bins = [None] * SIGNATURE_BINS
    for h in hashes:
        b, v = h % SIGNATURE_BINS, h // SIGNATURE_BINS
        if bins[b] is None or v < bins[b]:
            bins[b] = v
    return tuple(next(bins[(i + k) % SIGNATURE_BINS] for k in range(SIGNATURE_BINS)
                      if bins[(i + k) % SIGNATURE_BINS] is not None) for i in range(SIGNATURE_BINS))


def _jaccard(a, b):
    return len(a & b) / len(a | b)


def collapse(rows, grades):
    """One representative per near-duplicate group per lane, with grade, era and dup_count set.

    Rows are visited best-first (grade, current era, catalog order); each joins the first
    earlier representative it shares an LSH band with at Jaccard >= MIN_JACCARD, or becomes
    a representative itself.
    """
    rows = [dict(r, grade=grades[r["source_slug"]],
                 era=era_for(r["target_model"], r["source_slug"], r["prompt"])) for r in rows]
    order = sorted(range(len(rows)), key=lambda i: (
        GRADE_RANK[rows[i]["grade"]], rows[i]["era"] != "current", i))
    buckets = {}  # (lane, band, band values) -> representative indexes
    reps = []  # [row, normalised prompt]
    for i in order:
        row = rows[i]
        norm = normalise(row["prompt"])
        hashes = shingle_hashes(norm)
        sig = signature(hashes)
        keys = [(row["lane"], b, sig[b:b + LSH_ROWS]) for b in range(0, SIGNATURE_BINS, LSH_ROWS)]
        candidates = dict.fromkeys(g for key in keys for g in buckets.get(key, ()))
        group = next((g for g in candidates
                      if _jaccard(hashes, shingle_hashes(reps[g][1])) >= MIN_JACCARD), None)
        if group is not None:
            reps[group][0]["dup_count"] += 1
            continue
        row["dup_count"] = 1
        for key in keys:
            buckets.setdefault(key, []).append(len(reps))
        reps.append([row, norm])
    return [rep for rep, _ in reps]


# --- database --------------------------------------------------------------------------------

def build_db(rows, grades, db_path):
    """Collapse, era and flag the rows, write the database (atomically); return the counts."""
    reps = collapse(rows, grades)
    with multiprocessing.Pool() as pool:  # flagging is the slow step; rows are independent
        flags = pool.map(flags_for, (rep["title"] + " " + rep["prompt"] for rep in reps), chunksize=2000)
    for rep, rep_flags in zip(reps, flags):
        rep["flags"] = ",".join(rep_flags)
    db_path = Path(db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    tmp = db_path.with_suffix(".building")
    tmp.unlink(missing_ok=True)
    conn = sqlite3.connect(tmp)
    with conn:
        conn.execute(f"CREATE TABLE prompts ({', '.join(COLUMNS)}, PRIMARY KEY (id))")
        conn.executemany(f"INSERT INTO prompts VALUES ({', '.join('?' * len(COLUMNS))})",
                         ([rep[c] for c in COLUMNS] for rep in reps))
        conn.execute("CREATE INDEX prompts_lane ON prompts(lane)")
        conn.execute("CREATE VIRTUAL TABLE prompts_fts USING fts5("
                     "title, category, prompt, content='prompts', content_rowid='rowid')")
        conn.execute("INSERT INTO prompts_fts(rowid, title, category, prompt) "
                     "SELECT rowid, title, category, prompt FROM prompts")
        conn.execute("INSERT INTO prompts_fts(prompts_fts) VALUES ('optimize')")
    conn.close()
    os.replace(tmp, db_path)
    flag_counts = Counter(f for rep in reps for f in rep["flags"].split(",") if f)
    return {
        "read": len(rows),
        "after_dedupe": len(reps),
        "flagged_any": sum(1 for rep in reps if rep["flags"]),
        "per_flag": dict(sorted(flag_counts.items())),
        "per_grade": dict(sorted(Counter(rep["grade"] for rep in reps).items())),
        "per_era": dict(sorted(Counter(rep["era"] for rep in reps).items())),
        "per_lane": dict(sorted(Counter(rep["lane"] for rep in reps).items())),
    }


def main():
    grades = load_grades(HERE / "grades.tsv")
    rows, hash_lines = [], ["file\tsha256\trows"]
    for lane, (name, expected) in CATALOGS.items():
        path = COLLECTION / name
        lane_rows = read_catalog(path)
        if len(lane_rows) != expected:
            sys.exit(f"{name}: {len(lane_rows)} rows, expected {expected}")
        hash_lines.append(f"{name}\t{sha256_of(path)}\t{len(lane_rows)}")
        rows.extend(lane_rows)
    ungraded = {r["source_slug"] for r in rows} - grades.keys()
    if ungraded:
        sys.exit(f"sources without a grade in grades.tsv: {sorted(ungraded)}")
    (HERE / "RAW-HASHES.tsv").write_text("\n".join(hash_lines) + "\n", encoding="utf-8")
    counts = build_db(rows, grades, DB_PATH)
    for key, value in counts.items():
        print(f"{key}\t{value}")
    print(f"db\t{DB_PATH}\t{DB_PATH.stat().st_size} bytes")


if __name__ == "__main__":
    main()
