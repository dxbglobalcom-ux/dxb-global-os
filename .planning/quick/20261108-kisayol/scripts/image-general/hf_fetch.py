"""Fetch Hugging Face prompt datasets for lane image-general as text (JSONL).

Run: uv run --no-project --with duckdb -- python -I hf_fetch.py <job>
Parquet is binary, so every dataset is stored as a JSONL export of its text
columns (image columns are never read). Datasets above 100k rows are not pulled
whole: only rows whose prompt matches AD_KEYWORDS are kept, NSFW_WORDS rows are
dropped, and at most CAP rows are written, picked round-robin across the first
keyword each prompt matches so no single keyword fills the subset.
"""
import json
import os
import re
import subprocess
import sys

import duckdb

RAW = "/home/dxb/DxB Global OS/.planning/quick/20261108-kisayol/raw/image-general"
HF = "https://huggingface.co/datasets"
CAP = 20000
# Anonymous HF access is rate-limited per request, so parquet files are fetched
# whole with one curl each into a scratch folder outside raw/, read, then deleted.
SCRATCH = os.environ.get("IG_SCRATCH", "/tmp/image-general-hf")

AD_KEYWORDS = re.compile(
    r"\b(products?|advertis\w*|commercials?|packaging|studio shot|e-?commerce|"
    r"brand(?:s|ing|ed)?|posters?|billboards?|food|cosmetics?|fashion|interiors?|"
    r"cars?|real estate)\b",
    re.I,
)
NSFW_WORDS = re.compile(
    r"\b(nsfw|nude|nudes|naked|nudity|topless|sexy|erotic|lingerie|bikini|porn\w*|"
    r"hentai|boobs?|breasts?|cleavage|seductive|sensual|underwear|bra)\b",
    re.I,
)


def con():
    c = duckdb.connect()
    c.execute("INSTALL httpfs; LOAD httpfs;")
    return c


def out_path(slug, name):
    d = os.path.join(RAW, slug)
    os.makedirs(d, exist_ok=True)
    return os.path.join(d, name)


def fetch(url):
    os.makedirs(SCRATCH, exist_ok=True)
    local = os.path.join(SCRATCH, url.split("/datasets/", 1)[1].replace("/", "__"))
    if not os.path.exists(local):
        subprocess.run(["curl", "-sfL", "--retry", "5", "--retry-delay", "70", "-o", local, url], check=True)
    return local


def export_all(slug, url, columns, name="data.jsonl"):
    src = repr([fetch(u) for u in url]) if isinstance(url, list) else f"'{fetch(url)}'"
    rows = con().execute(f"select {columns} from read_parquet({src})").fetchall()
    cols = [x.strip().split(" as ")[-1].strip('"') for x in columns.split(",")]
    with open(out_path(slug, name), "w") as f:
        for r in rows:
            f.write(json.dumps(dict(zip(cols, r)), ensure_ascii=False, default=str) + "\n")
    print(slug, name, len(rows))


def pick_subset(prompts):
    """prompts: iterable of (prompt, extra dict). Returns the capped round-robin subset."""
    seen, buckets, total = set(), {}, 0
    for p, extra in prompts:
        if not p:
            continue
        p = p.strip()
        m = AD_KEYWORDS.search(p)
        if not m or NSFW_WORDS.search(p):
            continue
        key = " ".join(p.lower().split())
        if key in seen:
            continue
        seen.add(key)
        total += 1
        buckets.setdefault(m.group(1).lower(), []).append({"prompt": p, "matched": m.group(1).lower(), **extra})
    picked, i = [], 0
    while len(picked) < CAP and any(i < len(b) for b in buckets.values()):
        for b in buckets.values():
            if i < len(b) and len(picked) < CAP:
                picked.append(b[i])
        i += 1
    return picked, total


def write_subset(slug, picked, total, scanned):
    with open(out_path(slug, "filtered-subset.jsonl"), "w") as f:
        for r in picked:
            f.write(json.dumps(r, ensure_ascii=False, default=str) + "\n")
    print(slug, "scanned", scanned, "matched_unique", total, "written", len(picked))


def job_diffusiondb():
    local = fetch(f"{HF}/poloclub/diffusiondb/resolve/main/metadata.parquet")
    rows = con().execute(f"select prompt from read_parquet('{local}')").fetchall()
    picked, total = pick_subset((r[0], {}) for r in rows)
    write_subset("hf-diffusiondb", picked, total, len(rows))


def job_midjourney_messages(nfiles=4):
    urls = [fetch(f"{HF}/vivym/midjourney-messages/resolve/main/data/{i:06d}.parquet") for i in range(nfiles)]
    rows = con().execute(f"select content from read_parquet({urls!r})").fetchall()
    star = re.compile(r"\*\*(.+?)\*\*", re.S)

    def gen():
        for (c,) in rows:
            m = star.search(c or "")
            yield (m.group(1) if m else None), {}

    picked, total = pick_subset(gen())
    write_subset("hf-midjourney-messages", picked, total, len(rows))


def job_sd247m():
    url = f"{HF}/FredZhang7/stable-diffusion-prompts-2.47M/resolve/main/all_prompts.txt"
    proc = subprocess.Popen(["curl", "-sL", url], stdout=subprocess.PIPE, text=True, errors="replace")
    n = 0

    def gen():
        nonlocal n
        for line in proc.stdout:
            n += 1
            yield line, {}

    picked, total = pick_subset(gen())
    write_subset("hf-sd-prompts-2-47m", picked, total, n)


def job_succinctly():
    base = f"{HF}/succinctly/midjourney-prompts/resolve/main/data"
    urls = [fetch(f"{base}/{s}-00000-of-00001.parquet") for s in ("train", "validation", "test")]
    rows = con().execute(f"select text from read_parquet({urls!r})").fetchall()
    picked, total = pick_subset((r[0], {}) for r in rows)
    write_subset("hf-succinctly-midjourney", picked, total, len(rows))


def job_small():
    export_all("hf-gustavosta-sd-prompts", [f"{HF}/Gustavosta/Stable-Diffusion-Prompts/resolve/main/data/{s}.parquet" for s in ("train", "eval")], "Prompt")
    export_all("hf-fal-image-generation-prompts", f"{HF}/fal/image-generation-prompts/resolve/main/data/train-00000-of-00001.parquet", "category, subcategory, prompt, tags")
    export_all("hf-adrian2016-image-video-prompts", f"{HF}/Adrian2016/awesome-image-video-prompts/resolve/main/data/image.parquet",
               "id, model, mode, category, tags, title_en, prompt, notes_en, source_name, source_url, credit, likes, posted", "image.jsonl")


def job_goku():
    """Goku-OpenLab metadata.jsonl is 120-140 MB per model; keep only the text fields."""
    keep = ("id", "category", "date", "slug", "raw_p", "platform", "sourceLink")
    for name in ("gpt-image-2", "nano-banana-pro"):
        local = fetch(f"{HF}/Goku-OpenLab/{name}-prompts-datasets/resolve/main/metadata.jsonl")
        n = 0
        with open(local) as src, open(out_path(f"hf-goku-{name}", "metadata-text.jsonl"), "w") as dst:
            for line in src:
                r = json.loads(line)
                t = {k: r.get(k) for k in keep}
                t["model"] = (r.get("model_info") or {}).get("name")
                t["safety_rating"] = (r.get("spec") or {}).get("safety_rating")
                t["en"] = (r.get("i18n") or {}).get("en")
                dst.write(json.dumps(t, ensure_ascii=False) + "\n")
                n += 1
        print("goku", name, n)


JOBS = {
    "goku": job_goku,
    "small": job_small,
    "diffusiondb": job_diffusiondb,
    "midjourney-messages": job_midjourney_messages,
    "sd247m": job_sd247m,
    "succinctly": job_succinctly,
}

if __name__ == "__main__":
    JOBS[sys.argv[1]]()
