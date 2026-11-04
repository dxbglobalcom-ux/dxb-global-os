#!/usr/bin/env python3
"""Compare a tool's normalised rows with curl ground truth.
usage: compare.py tool.jsonl truth.jsonl
tool.jsonl rows: {url, status, title, canonical, hreflang}; a field the tool does not
export is null and is reported as "n/a", never counted as a match.
"""
import html, json, re, sys


def key(u):
    return (u or "").strip().rstrip("/").lower()


def norm(t):
    return re.sub(r"\s+", " ", html.unescape(t or "")).strip()


tool = {key(r["url"]): r for r in map(json.loads, open(sys.argv[1]))}
truth = [json.loads(l) for l in open(sys.argv[2])]
seen = [t for t in truth if key(t["url"]) in tool]
print(f"tool rows {len(tool)}; truth rows {len(truth)}; tool saw {len(seen)}")
for f, same in (("status", lambda a, b: a == b),
                ("title", lambda a, b: norm(a) == norm(b)),
                ("canonical", lambda a, b: key(a) == key(b)),
                ("hreflang", lambda a, b: a == b)):
    have = [t for t in seen if tool[key(t["url"])].get(f) is not None]
    if not have:
        print(f"  {f}: n/a")
        continue
    bad = [t for t in have if not same(tool[key(t["url"])][f], t[f])]
    print(f"  {f}: {len(have)-len(bad)}/{len(have)} of {len(seen)} seen")
    for t in bad[:3]:
        print(f"     {t['url'][27:75]} tool={str(tool[key(t['url'])][f])[:50]!r} curl={str(t[f])[:50]!r}")
