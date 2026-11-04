#!/usr/bin/env python3
"""pagereports.tsv + hreflangs.tsv -> normalised jsonl. usage: seonaut-norm.py run-dir out.jsonl"""
import collections, csv, json, sys
csv.field_size_limit(10**9)
d, out = sys.argv[1], sys.argv[2]
rd = lambda n: list(csv.DictReader(open(f"{d}/{n}.tsv", newline=""), delimiter="\t", quoting=csv.QUOTE_NONE))
hl = collections.Counter(r["pagereport_id"] for r in rd("hreflangs"))
with open(out, "w") as o:
    for r in rd("pagereports"):
        if r["crawled"] != "1":
            continue
        o.write(json.dumps({"url": r["url"], "status": int(r["status_code"]), "title": r["title"] or None,
                            "canonical": r["canonical"] or None, "hreflang": hl[r["id"]],
                            "h1": r["h1"], "ttfb": r["ttfb"], "description": r["description"],
                            "robots": r["robots"], "redirect": r["redirect_url"]}, ensure_ascii=False) + "\n")
