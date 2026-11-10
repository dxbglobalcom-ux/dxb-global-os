#!/usr/bin/env python3
"""Tables for the trial: per request and totals for sessions A and B, with a
list-price-weighted total.

Prices (USD per million tokens), read on 2026-11-10 from
https://platform.claude.com/docs/en/about-claude/pricing.md and matching the
claude-api skill's table (cached 2026-11-03) and the CLI's own costUSD:
  claude-fable-5-2: input 8, 5m cache write 10, 1h cache write 16, cache read 0.20, output 40
  claude-opus-5-5:  input 4, 5m cache write 5,  1h cache write 8,  cache read 0.20, output 20
"""
import importlib.util
import json
import sys
from pathlib import Path

JOB = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("rt", JOB / "read-transcript.py")
rt = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rt)

PRICE = {
    "claude-fable-5-2": {"input": 8.0, "w5m": 10.0, "w1h": 16.0, "read": 0.20, "output": 40.0},
    "claude-opus-5-5": {"input": 4.0, "w5m": 5.0, "w1h": 8.0, "read": 0.20, "output": 20.0},
}


def cost(r):
    p = PRICE[r["model"]]
    other = r["cache_write"] - r["cache_write_1h"] - r["cache_write_5m"]
    assert other == 0, r
    return (
        r["input"] * p["input"]
        + r["cache_write_1h"] * p["w1h"]
        + r["cache_write_5m"] * p["w5m"]
        + r["cache_read"] * p["read"]
        + r["output"] * p["output"]
    ) / 1e6


def table(name):
    sid = (JOB / "runs" / f"session-{name}.id").read_text().strip()
    rows = rt.requests(sid)
    print(f"\nSession {name}  {sid}")
    print("turn req effort model              input  c.write   c.read output   list$  tools/skills")
    for i, r in enumerate(rows, 1):
        r["cost"] = cost(r)
        extra = ",".join(r["tools"]) or "-"
        if r["skills"]:
            extra += " [" + ",".join(map(str, r["skills"])) + "]"
        print(
            f"{r['turn']:>4} {i:>3} {str(r['effort']):<6} {r['model']:<17} {r['input']:>6} {r['cache_write']:>8} "
            f"{r['cache_read']:>8} {r['output']:>6} {r['cost']:>7.4f}  {extra}"
        )
    return rows


def totals(rows, label):
    out = {}
    for r in rows:
        t = out.setdefault(r["model"], dict(requests=0, input=0, cache_write=0, cache_read=0, output=0, cost=0.0))
        t["requests"] += 1
        for k in ("input", "cache_write", "cache_read", "output", "cost"):
            t[k] += r[k]
    allm = dict(requests=0, input=0, cache_write=0, cache_read=0, output=0, cost=0.0)
    for t in out.values():
        for k in allm:
            allm[k] += t[k]
    out["ALL"] = allm
    for m, t in out.items():
        print(
            f"  {label} {m:<17} requests {t['requests']:>2}  input {t['input']:>4}  c.write {t['cache_write']:>7}  "
            f"c.read {t['cache_read']:>7}  output {t['output']:>5}  list$ {t['cost']:.4f}"
        )
    return out


def per_turn(rows):
    out = {}
    for r in rows:
        t = out.setdefault(r["turn"], dict(requests=0, cache_write=0, cache_read=0, output=0, cost=0.0, model=r["model"]))
        t["requests"] += 1
        for k in ("cache_write", "cache_read", "output", "cost"):
            t[k] += r[k]
    return out


def cli_cost(name):
    d = json.load(open(JOB / "runs" / f"{name}-t5.json"))
    return {m: round(u["costUSD"], 4) for m, u in (d.get("modelUsage") or {}).items()}


if __name__ == "__main__":
    a = table("A")
    b = table("B")
    print("\nTotals")
    totals(a, "A")
    totals(b, "B")
    print("\nThe CLI's own cumulative costUSD after turn 5 (costBasis: list):")
    print("  A", cli_cost("A"))
    print("  B", cli_cost("B"))
    print("\nPer turn (requests, cache write, cache read, output, list$)")
    pa, pb = per_turn(a), per_turn(b)
    for t in sorted(pa):
        x, y = pa[t], pb[t]
        print(
            f"  turn {t}: A {x['model'][7:12]:<5} {x['requests']} req w {x['cache_write']:>6} r {x['cache_read']:>7} o {x['output']:>5} ${x['cost']:.4f}"
            f"   |   B {y['model'][7:12]:<5} {y['requests']} req w {y['cache_write']:>6} r {y['cache_read']:>7} o {y['output']:>5} ${y['cost']:.4f}"
        )
