#!/usr/bin/env python3
import json, os, collections
S = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(S,"collect.json"))); rows = json.load(open(os.path.join(S,"rows.json")))
ref = json.load(open(os.path.join(S,"refine.json")))
INDEX = (".planning/graphs/","graphify-out/")
for r in rows:
    c = r["path"]
    if r["cls"]=="GOES" and r["reason"].startswith("named by nothing living"):
        idx = sorted(set(h[1] for h in d["hits"].get(c,[]) if h[1].startswith(INDEX)))
        r["reason"] = "named by no living record, read by no code, named by no other paper or memory" + (f"; only the generated graph index names it ({', '.join(idx)})" if idx else "")
    if r["cls"]=="DOUBT" and "named only by other papers" in r["reason"]:
        pap = [h for h in d["hits"][c] if h[0] in ("PAPER","OTHER_DOC") and not h[1].startswith(INDEX)]
        if pap and all(h[1]==".planning/STATE-ARCHIVE.md" for h in pap): r["sub"]="named only by STATE-ARCHIVE.md (history)"
    if c in ref and not ref[c]["whole"] and ref[c]["subs"]:
        v=ref[c]; rem=v["total"]-v["named_bytes"]
        r["reason"] += f" | PARTIAL: living lines name only {', '.join(v['subs'][:4])} ({v['named_bytes']:,} B, {v['named_files']} files); the other {rem:,} B / {v['files']-v['named_files']} files are named by nothing living"
        r["partial_rem"]=rem
    r["untr_all"] = r["untracked"]+r["ignored"]
json.dump(rows, open(os.path.join(S,"rows2.json"),"w"), ensure_ascii=False)
order = {"STAYS":0,"GOES":1,"DOUBT":2,"NOT A CANDIDATE":3}
with open(os.path.join(S,"first-cut.tsv"),"w") as f:
    f.write("path\tclass\tsize_bytes\tfiles\ttracked_files\tuntracked_files\treason\n")
    for r in sorted(rows, key=lambda r:(order[r["cls"]], r["path"])):
        f.write("\t".join([r["path"], r["cls"], str(r["apparent"]), str(r["files"]), str(r["tracked"]), str(r["untr_all"]), (r.get("sub","")+" — " if r.get("sub") else "")+r["reason"].replace("\t"," ").replace("\n"," ")])+"\n")
tot = collections.defaultdict(lambda: collections.Counter())
for r in rows:
    t = tot[r["cls"]]; t["entries"]+=1; t["bytes"]+=r["apparent"]; t["disk"]+=r["disk"]; t["files"]+=r["files"]; t["tracked"]+=r["tracked"]; t["untracked"]+=r["untracked"]; t["ignored"]+=r["ignored"]
    # bytes split: tracked vs not — need per-file; approximate from files.json below
files = json.load(open(os.path.join(S,"files.json")))
def split_bytes(prefix):
    tb=ub=0; pre=prefix.rstrip("/")+"/"
    for p,(sz,dk,t,u) in files.items():
        if p==prefix or p.startswith(pre):
            if t: tb+=sz
            else: ub+=sz
    return tb,ub
for r in rows:
    if r["cls"] in ("GOES","DOUBT"):
        tb,ub = split_bytes(r["path"]); r["tb"]=tb; r["ub"]=ub
        tot[r["cls"]]["tracked_bytes"]+=tb; tot[r["cls"]]["untracked_bytes"]+=ub
json.dump(rows, open(os.path.join(S,"rows2.json"),"w"), ensure_ascii=False)
json.dump({k:dict(v) for k,v in tot.items()}, open(os.path.join(S,"totals.json"),"w"), indent=1)
for k in ["STAYS","GOES","DOUBT","NOT A CANDIDATE"]:
    v=tot[k]; print(k, dict(v))
