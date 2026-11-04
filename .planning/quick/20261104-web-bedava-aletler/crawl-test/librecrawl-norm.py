#!/usr/bin/env python3
"""LibreCrawl urls.json -> normalised jsonl. usage: librecrawl-norm.py urls.json out.jsonl"""
import json, sys
rows = json.load(open(sys.argv[1]))["data"]
with open(sys.argv[2], "w") as o:
    for r in rows:
        o.write(json.dumps({"url": r["url"], "status": r["status_code"], "title": r.get("title") or None,
                            "canonical": r.get("canonical_url") or None, "hreflang": len(r.get("hreflang") or []),
                            "h1": r.get("h1"), "description": r.get("meta_description"), "robots": r.get("robots"),
                            "redirects": r.get("redirects"), "json_ld": r.get("json_ld"), "schema_org": r.get("schema_org"),
                            "images": r.get("images"), "internal_links": r.get("internal_links"),
                            "response_time": r.get("response_time"), "content_type": r.get("content_type"),
                            "error": r.get("error"), "error_type": r.get("error_type")}, ensure_ascii=False) + "\n")
