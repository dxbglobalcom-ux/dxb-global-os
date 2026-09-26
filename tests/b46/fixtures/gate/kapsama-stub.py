#!/usr/bin/env python3
"""THE COVERAGE TABLE'S STAND-IN (copied over scripts/kapsama.py inside the bench's engine copy). The
real kapsama.py is Lane C's and reads the ledger through the real evidence.py, which this bench replaces;
this one counts the stand-in ledger by the contract's rule for its Okundu column (EVIDENCE-B56-K1 §2.5:
relevant addresses whose read_status is `read`, set only by batch/page) and names the run it was handed."""
import json
import sys
from pathlib import Path

run = Path(sys.argv[1])
rows = [json.loads(x) for x in (run / "evidence.jsonl").read_text(encoding="utf-8").splitlines() if x.strip()]
addr = [r for r in rows if r.get("tool") != "evidence.py add"]
print("| Platform | Bulundu | İlgili | Okundu |")
print("|---|---:|---:|---:|")
for p in dict.fromkeys(r["platform"] for r in addr):
    mine = [r for r in addr if r["platform"] == p]
    rel = [r for r in mine if r.get("triage") == "relevant"]
    print(f"| {'X' if p == 'x' else p.capitalize()} | {len(mine)} | {len(rel)} | "
          f"{sum(1 for r in rel if r.get('read_status') == 'read')} |")
print(f"KAPSAMA-STAND-IN run={run}")
