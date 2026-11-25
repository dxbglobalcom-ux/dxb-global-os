"""lays out a second eye's input. usage: second_in.py <out folder under el> <hand> [<hand> ...]"""
import json,os,sys
H="/home/dxb/.local/share/dxb/hook-lab/"
out=[]
for h in sys.argv[2:]:
    n=0
    for l in open(H+f"el/{h}/openings.jsonl"):
        if not l.strip(): continue
        n+=1; r=json.loads(l); r["id"]=f"o-{h}-{n:03d}"
        if r.get("ad_id"):
            for d in ("meta2","tt_org2","meta","tt_org"):
                p=H+f"{d}/sheet/{r['ad_id']}.jpg"
                if os.path.exists(p): r["sheet"]=p; break
            s=H+f"el/{h}/strip_{r['ad_id']}.jpg"; r["strip"]=s if os.path.exists(s) else ""
        r["folder"]=H+f"el/{h}"
        out.append({k:v for k,v in r.items() if k not in ("line","read")})
os.makedirs(H+"el/"+sys.argv[1],exist_ok=True)
open(H+f"el/{sys.argv[1]}/in.jsonl","w").write("\n".join(json.dumps(x,ensure_ascii=False) for x in out)+"\n"); print(len(out))
