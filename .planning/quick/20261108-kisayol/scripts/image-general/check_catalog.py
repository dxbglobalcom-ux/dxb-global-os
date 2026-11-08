"""Check catalog-image-general.tsv against the brief and against the raw files.

Run: python3 -I check_catalog.py [catalog.tsv]
Fails (exit 1) when: the header differs from the brief, a row has the wrong field
count, a value is outside its allowed set, an id or a prompt repeats, or a sampled
prompt cannot be found in its own source's raw files (read independently of the
parsers: every string in the JSON / JSONL / text files, whitespace collapsed).
"""
import glob
import json
import os
import random
import sys
from collections import defaultdict

BASE = "/home/dxb/DxB Global OS/.planning/quick/20261108-kisayol"
RAW = os.path.join(BASE, "raw/image-general")
BRIEF_HEADER = "id lane source_slug title category medium target_model prompt needs_input_image source_url licence".split()
SAMPLE = 150


def flat(s):
    return " ".join(s.split())


def strings(x):
    if isinstance(x, str):
        yield x
    elif isinstance(x, dict):
        for v in x.values():
            yield from strings(v)
    elif isinstance(x, list):
        for v in x:
            yield from strings(v)


def raw_text(slug):
    parts = []
    for f in glob.glob(f"{RAW}/{slug}/**/*", recursive=True):
        if not os.path.isfile(f):
            continue
        text = open(f, encoding="utf-8", errors="replace").read()
        if f.endswith(".json"):
            parts.extend(strings(json.loads(text)))
        elif f.endswith(".jsonl"):
            for line in text.split("\n"):  # splitlines() would also break on U+2028 inside strings
                if line.strip():
                    parts.extend(strings(json.loads(line)))
        else:
            parts.append(text)
    return flat("\n".join(parts))


def main(path):
    errors = []
    by_source = defaultdict(list)
    ids, prompts = set(), set()
    with open(path, encoding="utf-8") as f:
        header = f.readline().rstrip("\n").split("\t")
        if header != BRIEF_HEADER:
            errors.append(f"header {header}")
        for i, line in enumerate(f, 2):
            cols = line.rstrip("\n").split("\t")
            if len(cols) != len(BRIEF_HEADER):
                errors.append(f"line {i}: {len(cols)} fields")
                continue
            r = dict(zip(BRIEF_HEADER, cols))
            if r["medium"] not in ("image", "video"):
                errors.append(f"line {i}: medium {r['medium']}")
            if r["needs_input_image"] not in ("yes", "no", "unknown"):
                errors.append(f"line {i}: needs_input_image {r['needs_input_image']}")
            if r["lane"] != "image-general":
                errors.append(f"line {i}: lane {r['lane']}")
            if r["id"] in ids:
                errors.append(f"line {i}: duplicate id {r['id']}")
            if r["prompt"] in prompts:
                errors.append(f"line {i}: duplicate prompt")
            ids.add(r["id"])
            prompts.add(r["prompt"])
            by_source[r["source_slug"]].append(r["prompt"])
    random.seed(7)
    for slug, ps in sorted(by_source.items()):
        hay = raw_text(slug)
        missing = [p for p in random.sample(ps, min(SAMPLE, len(ps))) if flat(p)[:80] not in hay]
        if missing:
            errors.append(f"{slug}: {len(missing)} sampled prompts not in raw, e.g. {missing[0][:100]!r}")
        print(f"{slug}\trows={len(ps)}\tsampled_missing={len(missing)}")
    print(f"rows={len(ids)} sources={len(by_source)} errors={len(errors)}")
    for e in errors[:20]:
        print("ERROR", e)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(BASE, "catalog-image-general.tsv")))
