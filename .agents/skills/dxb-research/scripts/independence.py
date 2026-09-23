#!/usr/bin/env python3
"""Independence — clusters, never URLs.

Thirty sites carrying one press release are ONE piece of evidence, not thirty.
Three tests, cheapest first:

  1. canonical URL / registrable domain  — a syndicated copy usually keeps the
     origin's rel=canonical, and two pages on one domain are never independent.
  2. publisher / wire attribution        — JSON-LD publisher or provider.
  3. near-duplicate passage              — MinHash LSH (datasketch) when present,
     an exact shingle Jaccard otherwise. Threshold 0.6.

What this measures, said plainly so the report never over-claims: BYTE-LEVEL and
CANONICAL-LEVEL copying. Editorial reuse is mostly non-literal, so this
UNDER-counts syndication by design. cluster_id is evidence, never a verdict.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rlib  # noqa: E402

THRESHOLD = 0.6


def _key_domain(row: dict) -> str:
    return row.get("domain") or rlib.registrable_domain(row.get("url") or "")


def _near_dupe(a: dict, b: dict) -> bool:
    pa, pb = a.get("passage") or "", b.get("passage") or ""
    if len(pa) < 200 or len(pb) < 200:
        return False
    return rlib.jaccard(rlib.shingles(pa), rlib.shingles(pb)) >= THRESHOLD


def recluster(run_id: str) -> dict:
    """Assign cluster_id to every row. Rewrites the ledger in place."""
    rows = rlib.ledger(run_id)
    if not rows:
        return {}

    parent: dict[int, int] = {i: i for i in range(len(rows))}

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x: int, y: int) -> None:
        rx, ry = find(x), find(y)
        if rx != ry:
            parent[max(rx, ry)] = min(rx, ry)

    # 1. same canonical url, or same registrable domain
    by_canon: dict[str, int] = {}
    by_domain: dict[str, int] = {}
    for i, r in enumerate(rows):
        c = r.get("url_canonical") or ""
        if c:
            if c in by_canon:
                union(i, by_canon[c])
            else:
                by_canon[c] = i
        d = _key_domain(r)
        if d:
            if d in by_domain:
                union(i, by_domain[d])
            else:
                by_domain[d] = i

    # 2. near-duplicate passages across domains (LSH when datasketch is present)
    ev = [i for i, r in enumerate(rows) if (r.get("passage") or "")]
    used_lsh = False
    try:
        from datasketch import MinHash, MinHashLSH  # type: ignore
        # The signature of a passage never changes, so it is computed ONCE and kept.
        # Measured 2026-09-16: a full re-signing of a 469-row ledger costs 7.6 s, and
        # the PostToolUse hook reclusters after every capture — which would have taxed
        # every single tool call the agent makes, and eventually blown the hook's own
        # 20 s timeout. Keyed by passage hash, so it survives row renumbering.
        cache_p = rlib.run_dir(run_id) / "minhash-cache.json"
        try:
            cache = json.loads(cache_p.read_text())
        except Exception:
            cache = {}
        scheme = getattr(MinHash(num_perm=128), "scheme", None)
        lsh = MinHashLSH(threshold=THRESHOLD, num_perm=128)
        mh: dict[int, object] = {}
        fresh = 0
        for i in ev:
            passage = rows[i]["passage"]
            key = rows[i].get("passage_sha256") or rlib.sha256(passage)
            hv = cache.get(key)
            m = None
            if hv:
                try:
                    m = (MinHash(num_perm=128, hashvalues=hv, scheme=scheme) if scheme
                         else MinHash(num_perm=128, hashvalues=hv))
                except Exception:
                    m = None
            if m is None:
                m = MinHash(num_perm=128)
                for sh in rlib.shingles(passage):
                    m.update(sh.encode("utf-8"))
                cache[key] = [int(x) for x in m.hashvalues]
                fresh += 1
            mh[i] = m
            lsh.insert(str(i), m)
        for i in ev:
            for j in lsh.query(mh[i]):
                if int(j) != i:
                    union(i, int(j))
        if fresh:
            try:
                cache_p.write_text(json.dumps(cache))
            except Exception:
                pass
        used_lsh = True
    except Exception:
        for x in range(len(ev)):
            for y in range(x + 1, len(ev)):
                if _near_dupe(rows[ev[x]], rows[ev[y]]):
                    union(ev[x], ev[y])

    labels: dict[int, str] = {}
    for i in range(len(rows)):
        root = find(i)
        if root not in labels:
            labels[root] = "C%03d" % (len(labels) + 1)
        rows[i]["cluster_id"] = labels[root]

    path = rlib.ledger_path(run_id)
    with path.open("w", encoding="utf-8") as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")

    return {
        "rows": len(rows),
        "clusters": len(labels),
        "method": "minhash-lsh" if used_lsh else "shingle-jaccard",
    }


def surfaced_by(run_id: str) -> dict[str, str]:
    """canonical url -> the DISCOVERY channel that first surfaced it.

    Resolved from the ledger itself so a row written before `via` existed, or by a
    fetcher that never saw the sweep, is still attributed to a real channel.
    """
    out: dict[str, str] = {}
    for r in rlib.ledger(run_id):
        if r.get("kind") == "discovery" and r.get("url_canonical"):
            out.setdefault(r["url_canonical"], r.get("channel") or "?")
    return out


def report(run_id: str) -> dict:
    rows = [r for r in rlib.ledger(run_id)
            if r.get("kind") == "evidence" and not r.get("wall")]
    via_map = surfaced_by(run_id)
    clusters: dict[str, list[dict]] = {}
    for r in rows:
        clusters.setdefault(r.get("cluster_id") or "?", []).append(r)
    by_channel: dict[str, set] = {}
    for r in rows:
        # `via` is the channel that SURFACED the page. Counting the page's own
        # domain would make every source its own channel and the anti-
        # concentration rule unenforceable.
        key = (r.get("via") or via_map.get(r.get("url_canonical") or "")
               or r.get("channel") or "?")
        by_channel.setdefault(key, set()).add(r.get("cluster_id"))
    total = len(clusters) or 1
    share = {c: round(len(v) / total, 3) for c, v in by_channel.items()}
    top = max(share.values()) if share else 0.0
    return {
        "evidence_rows": len(rows),
        "clusters": len(clusters),
        "echo_collapsed": len(rows) - len(clusters),
        "cluster_share_by_channel": dict(sorted(share.items(), key=lambda kv: -kv[1])),
        "max_channel_share": top,
        "measures": "byte-level and canonical-level copying only; non-literal reuse is NOT detected",
    }


def main() -> int:
    p = argparse.ArgumentParser(prog="independence.py")
    p.add_argument("--run")
    p.add_argument("--recluster", action="store_true")
    a = p.parse_args()
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run", file=sys.stderr)
        return 1
    if a.recluster:
        print(json.dumps(recluster(rid), indent=2))
    print(json.dumps(report(rid), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
