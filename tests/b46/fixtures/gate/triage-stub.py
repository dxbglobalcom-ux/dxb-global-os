#!/usr/bin/env python3
"""TRIAGE'S STAND-IN (copied over scripts/triage.py inside the bench's engine copy): every pending address
row of the platform that has a body is sorted — a title with "offtopic" in it is irrelevant, the rest
relevant — under the ledger's lock, and the line of the contract (EVIDENCE-B56-K1 §2.2) is printed. The
real triage.py is Lane A's and has its own cases; no model is called here."""
import fcntl
import json
import sys
from pathlib import Path

run = Path(sys.argv[1])
plat = sys.argv[sys.argv.index("--platform") + 1] if "--platform" in sys.argv else "all"
n = {"relevant": 0, "irrelevant": 0}
with open(run / "evidence.lock", "a") as lock:
    fcntl.flock(lock, fcntl.LOCK_EX)
    led = run / "evidence.jsonl"
    rows = [json.loads(x) for x in led.read_text(encoding="utf-8").splitlines() if x.strip()]
    for r in rows:
        if (r.get("tool") != "evidence.py add" and plat in ("all", r["platform"]) and r["triage"] == "pending"
                and r.get("bytes")):
            off = "offtopic" in r["title"]
            r.update(triage="irrelevant" if off else "relevant", triage_reason="a giveaway" if off else None,
                     triage_by="haiku-4-5")
            n[r["triage"]] += 1
    led.write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in rows), encoding="utf-8")
print(f"triaged: relevant {n['relevant']} · irrelevant {n['irrelevant']} · duplicate 0 · unknown-id 0")
