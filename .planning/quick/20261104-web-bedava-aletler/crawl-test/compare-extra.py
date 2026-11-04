#!/usr/bin/env python3
"""Second pass of compare.py for description, robots. usage: compare-extra.py tool.jsonl truth.jsonl"""
import html, json, re, sys
k = lambda u: (u or "").strip().rstrip("/").lower()
n = lambda t: re.sub(r"\s+", " ", html.unescape(t or "")).strip().lower().replace(" ", "")
tool = {k(r["url"]): r for r in map(json.loads, open(sys.argv[1]))}
truth = [t for t in map(json.loads, open(sys.argv[2])) if k(t["url"]) in tool]
for f in ("description", "robots"):
    bad = [t for t in truth if n(tool[k(t["url"])].get(f)) != n(t[f])]
    print(f"  {f}: {len(truth)-len(bad)}/{len(truth)}", [(str(tool[k(t['url'])].get(f))[:40], str(t[f])[:40]) for t in bad[:2]])
