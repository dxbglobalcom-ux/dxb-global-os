#!/usr/bin/env python3
"""SiteOne report.json -> normalised jsonl. usage: siteone-norm.py report.json out.jsonl
SiteOne exports neither canonical nor hreflang, so both stay null (reported n/a)."""
import json, sys
from urllib.parse import urlsplit
d = json.load(open(sys.argv[1]))
seo = {r["urlPathAndQuery"]: r for r in d["tables"]["seo"]["rows"]}
with open(sys.argv[2], "w") as o:
    for r in d["results"]:
        u = urlsplit(r["url"]); path = u.path + ("?" + u.query if u.query else "")
        s = seo.get(path, {}); x = r.get("extras") or {}
        o.write(json.dumps({"url": r["url"], "status": int(r["status"]), "type": r["type"],
                            "title": x.get("Title") or None, "canonical": None, "hreflang": None,
                            "description": x.get("Description"), "h1": s.get("h1"),
                            "robots": s.get("robotsIndex"), "indexing": s.get("indexing"),
                            "secs": r.get("elapsedTime"), "size": r.get("size")}, ensure_ascii=False) + "\n")
