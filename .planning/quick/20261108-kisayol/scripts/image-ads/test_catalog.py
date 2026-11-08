"""Checks on catalog-image-ads.tsv. Run: python3 -I test_catalog.py"""
import csv, sys

TSV = "/home/dxb/DxB Global OS/.planning/quick/20261108-kisayol/catalog-image-ads.tsv"
HEADER = ["id", "lane", "source_slug", "title", "category", "medium", "target_model", "prompt",
          "needs_input_image", "source_url", "licence"]

rows = list(csv.reader(open(TSV, encoding="utf-8"), delimiter="\t", quoting=csv.QUOTE_NONE))
fails = []
if rows[0] != HEADER:
    fails.append("header mismatch")
body = rows[1:]
if any(len(r) != 11 for r in body):
    fails.append("rows with wrong column count: %d" % sum(len(r) != 11 for r in body))
prompts = [r[7] for r in body]
if len(prompts) != len(set(prompts)):
    fails.append("exact duplicate prompts: %d" % (len(prompts) - len(set(prompts))))
if any(r[5] not in ("image", "video") for r in body):
    fails.append("bad medium value")
if any(r[8] not in ("yes", "no", "unknown") for r in body):
    fails.append("bad needs_input_image value")
# noise seen in the first build: directory trees, workflow arrows, API calls
for needle in ["├──", "|-- project.json", "intent -> audience -> source assets", "Authorization: Bearer"]:
    hits = [r[0] for r in body if needle in r[7]]
    if hits:
        fails.append("noise %r in %d rows e.g. %s" % (needle, len(hits), hits[0]))
# real prompts that must survive the filter (copied by hand from the raw files)
for needle in ["Create an e-commerce product photo of premium granola packaging beside a bowl.",
               "Render the subject as a photorealistic X-ray/transparent-shell visualization."]:
    if not any(needle in p for p in prompts):
        fails.append("lost real prompt: " + needle[:50])
print("rows", len(body))
print("FAIL\n" + "\n".join(fails) if fails else "PASS")
sys.exit(1 if fails else 0)
