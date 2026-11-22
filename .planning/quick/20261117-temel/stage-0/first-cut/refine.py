#!/usr/bin/env python3
# For each STAYS quick/research folder named by living records: which sub-paths do the living lines name?
import json, os, re
S = os.path.dirname(os.path.abspath(__file__)); R = "/home/dxb/DxB Global OS"
MEM="/home/dxb/.claude/projects/-home-dxb-DxB-Global-OS/memory"
d = json.load(open(os.path.join(S,"collect.json"))); rows = json.load(open(os.path.join(S,"rows.json")))
files = json.load(open(os.path.join(S,"files.json")))
LIVING = {"STATE","BOARD_OPEN","ROWFILE_OPEN","TEMEL_PLAN","TEMEL_ORDER","APPROVALS","CLAUDE_MD","SKILLS","SPECS","DIRECTIVES"}
cache = {}
def line(rel, n):
    if rel not in cache:
        p = os.path.join(MEM, rel[6:]) if rel.startswith("~mem/") else os.path.join(R, rel)
        cache[rel] = open(p, encoding="utf-8", errors="replace").read().split("\n")
    return cache[rel][n-1]
out = {}
for r in rows:
    c = r["path"]
    if r["cls"] != "STAYS" or not (c.startswith(".planning/quick/") or c.startswith(".planning/research/")) or c.endswith(".md"): continue
    if c == ".planning/quick/20261117-temel": continue
    name = c.split("/",2)[2]  # e.g. 20261022-iki-yol or watch-links
    rx = re.compile(re.escape(name) + r"(/[^\s`'\")\],;|*<>]*)?")
    subs = set(); whole = False
    for h in d["hits"][c]:
        if h[0] not in LIVING: continue
        for m in rx.finditer(line(h[1], h[2])):
            sp = (m.group(1) or "").strip("/").rstrip(".:")
            if not sp: whole = True
            else: subs.add(sp)
    # bytes covered by named sub-paths
    base = c + "/"
    named_b = 0; named_f = 0; missing = []
    for sp in subs:
        full = base + sp; hit = False
        for p,(sz,dk,t,u) in files.items():
            if p == full or p.startswith(full.rstrip("/") + "/"):
                named_b += sz; named_f += 1; hit = True
        if not hit: missing.append(sp)
    out[c] = dict(whole=whole, subs=sorted(subs), named_bytes=named_b, named_files=named_f, missing=sorted(missing), total=r["apparent"], files=r["files"])
json.dump(out, open(os.path.join(S,"refine.json"),"w"), ensure_ascii=False, indent=1)
for c,v in sorted(out.items(), key=lambda kv:-kv[1]["total"]):
    if v["total"] < 1_000_000: continue
    print(f'{v["total"]:>12} whole={str(v["whole"]):5} named={v["named_bytes"]:>11} ({v["named_files"]} f) missing={len(v["missing"])} {c}  subs={v["subs"][:5]}')
