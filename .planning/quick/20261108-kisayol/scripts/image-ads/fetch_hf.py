"""Fetch HF dataset rows as JSONL text via datasets-server (no parquet). usage: fetch_hf.py dataset max_rows"""
import json, os, sys, time, urllib.request
ds, cap = sys.argv[1], int(sys.argv[2])
out = "/home/dxb/DxB Global OS/.planning/quick/20261108-kisayol/raw/image-ads/hf__" + ds.replace("/", "__")
os.makedirs(out, exist_ok=True)
def get(u):
    for i in range(6):
        try:
            with urllib.request.urlopen(u, timeout=60) as r: return r.read()
        except Exception as e:
            time.sleep(15 + 20 * i)
    raise SystemExit("fail " + u)
open(out + "/README.md", "wb").write(get(f"https://huggingface.co/datasets/{ds}/resolve/main/README.md"))
splits = json.loads(get(f"https://datasets-server.huggingface.co/splits?dataset={ds}"))["splits"]
n = 0
with open(out + "/rows.jsonl", "w") as f:
    for sp in splits:
        off = 0
        while n < cap:
            j = json.loads(get(f"https://datasets-server.huggingface.co/rows?dataset={ds}&config={sp['config']}&split={sp['split']}&offset={off}&length=100"))
            rows = j["rows"]
            if not rows: break
            for r in rows:
                rec = {k: v for k, v in r["row"].items() if not isinstance(v, dict)}
                rec["_split"] = sp["split"]; f.write(json.dumps(rec, ensure_ascii=False) + "\n"); n += 1
            off += 100; time.sleep(1.5)
            if off >= j.get("num_rows_total", 0): break
print(ds, n)
