#!/usr/bin/env python3
"""Coverage — the chain "installed -> used", printed so nobody can blur it.

installed -> reachable -> invoked -> returned -> parsed -> recorded -> cited

Links 1-6 are machine-checkable and printed here. "It is installed" is not
"it was used", and a channel that failed is a HOLE REPORTED TO THE CEO, never a
silent skip. Two dead queries were dropped in silence on 2026-09-16; this table
is why that cannot happen twice.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rlib  # noqa: E402


def table(run_id: str) -> dict:
    rows = rlib.ledger(run_id)
    tools = rlib.read_jsonl(rlib.tools_path(run_id))
    queries = rlib.read_jsonl(rlib.queries_path(run_id))

    chans: dict[str, dict] = {}

    def slot(c: str) -> dict:
        return chans.setdefault(c, {
            "probed": "", "invoked": 0, "failed": 0,
            "discovery_rows": 0, "evidence_rows": 0, "clusters": set(), "queries": 0,
        })

    for t in tools:
        ch = t.get("channel") or "?"
        # A door inside the READING CHAIN that failed is not a hole in the research —
        # the next door in the chain covered for it. Those live in their own section.
        if ch.startswith("fetch:"):
            continue
        s = slot(ch)
        st = t.get("state")
        if st in ("invoked", "returned"):
            s["invoked"] += 1
        if st == "failed":
            s["failed"] += 1
        if st == "installed":
            s["probed"] = t.get("detail") or "ok"
    for r in rows:
        s = slot(r.get("channel") or "?")
        if r.get("kind") == "evidence":
            s["evidence_rows"] += 1
        else:
            s["discovery_rows"] += 1
        if r.get("cluster_id"):
            s["clusters"].add(r["cluster_id"])
    for q in queries:
        slot(q.get("channel") or "?")["queries"] += 1

    total_clusters = len({r.get("cluster_id") for r in rows
                          if r.get("kind") == "evidence" and r.get("cluster_id")})
    out = []
    for c, s in sorted(chans.items(), key=lambda kv: -len(kv[1]["clusters"])):
        share = (len(s["clusters"]) / total_clusters) if total_clusters else 0.0
        state = "FAIL" if (s["failed"] and not s["invoked"]) else (
            "USED" if (s["evidence_rows"] or s["discovery_rows"]) else "SILENT")
        out.append({
            "channel": c, "state": state, "queries": s["queries"],
            "invoked": s["invoked"], "failed": s["failed"],
            "discovery": s["discovery_rows"], "evidence": s["evidence_rows"],
            "clusters": len(s["clusters"]), "cluster_share": round(share, 3),
        })
    # the reading chain: which door actually opened each page, and which pages stayed
    # shut after every door was tried. "Could not read it" is never a sentence here;
    # it is a list of doors with what each one answered.
    doors: dict[str, int] = {}
    for r in rows:
        if r.get("kind") == "evidence" and r.get("fetch_door"):
            doors[r["fetch_door"]] = doors.get(r["fetch_door"], 0) + 1
    shut = [t.get("detail", "") for t in tools
            if t.get("state") == "failed" and "every door failed" in (t.get("detail") or "")]

    return {"run": run_id, "total_clusters": total_clusters, "channels": out,
            "reading_chain": dict(sorted(doors.items(), key=lambda kv: -kv[1])),
            "pages_shut_after_every_door": shut,
            "holes": [c["channel"] for c in out if c["state"] in ("FAIL", "SILENT")]}


def main() -> int:
    p = argparse.ArgumentParser(prog="coverage.py")
    p.add_argument("--run")
    p.add_argument("--json", action="store_true")
    a = p.parse_args()
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run", file=sys.stderr)
        return 1
    t = table(rid)
    if a.json:
        print(json.dumps(t, ensure_ascii=False, indent=2))
        return 0
    print("%-22s %-7s %5s %5s %6s %6s %6s %6s" % (
        "CHANNEL", "STATE", "QRY", "FAIL", "DISC", "EVID", "CLUST", "SHARE"))
    for c in t["channels"]:
        print("%-22s %-7s %5d %5d %6d %6d %6d %5.0f%%" % (
            c["channel"][:22], c["state"], c["queries"], c["failed"],
            c["discovery"], c["evidence"], c["clusters"], c["cluster_share"] * 100))
    if t["reading_chain"]:
        print("\nREADING CHAIN — which door opened the page:")
        for d, n in t["reading_chain"].items():
            print("   %-20s %d" % (d, n))
    if t["pages_shut_after_every_door"]:
        print("\nPAGES THAT STAYED SHUT AFTER EVERY DOOR (these belong in GAPS):")
        for d in t["pages_shut_after_every_door"]:
            print("   " + d[:150])
    if t["holes"]:
        print("\nHOLES (reported to the CEO, never skipped silently): " + ", ".join(t["holes"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
