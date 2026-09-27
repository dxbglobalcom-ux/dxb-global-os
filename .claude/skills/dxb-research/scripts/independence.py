#!/usr/bin/env python3
"""Independence — ONE rule says what an independent source is, and it is not this file's.

What makes two rows two sources is decided in one place, `claims.source_key` (the claim ledger,
B56 K2): the platform and the author, folded, when the row names a real author — else the row's
canonical address. Until 2026-09-27 test 1 below was a second definition of the word — a shared
canonical URL OR a shared registrable domain (the B56 older-defect list) — and the passage test
merged what it matched: measured that day on a six-row fixture (two Reddit authors, two X authors,
one page), this file made 2 clusters where claims.source_key makes 5 sources. One rule now, and a
copy does not bend it: thirty sites carrying one press release, none naming an author, are THIRTY
clusters here — thirty addresses — and each later one whose passage matches an earlier one carries
`echo_of` (test 3), a flag, never a merge. So report()'s `clusters` counts them apart,
`echo_flagged` counts the flagged copies among its rows, and `echo_collapsed` (rows − clusters)
counts only rows that repeat a source already counted: a second quote of one author, a second row
of one address.

  1. one source, one cluster     — claims.source_key; rows with the same key share a cluster_id.
  2. publisher / wire attribution — a FLAG that was never built: no row carries a JSON-LD
     publisher or provider, so nothing is flagged by it.
  3. near-duplicate passage      — a FLAG, never a merge: MinHash LSH (datasketch) when present,
     an exact shingle Jaccard otherwise, threshold 0.6. The later of two rows of DIFFERENT
     sources whose passages match gets `echo_of` = the earlier row's cluster_id; report()
     counts them as echo_flagged.

What the flag measures, said plainly so the report never over-claims: BYTE-LEVEL copying.
Editorial reuse is mostly non-literal, so it UNDER-counts syndication by design. cluster_id
and echo_of are evidence, never a verdict.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rlib  # noqa: E402
import claims  # noqa: E402  — source_key: what ONE independent source is, one owner

THRESHOLD = 0.6


def _near_dupe(a: dict, b: dict) -> bool:
    pa, pb = a.get("passage") or "", b.get("passage") or ""
    if len(pa) < 200 or len(pb) < 200:
        return False
    return rlib.jaccard(rlib.shingles(pa), rlib.shingles(pb)) >= THRESHOLD


def recluster(run_id: str) -> dict:
    """Assign cluster_id (one per source, claims.source_key) and the echo_of flag to every row.
    Rewrites the ledger in place."""
    rows = rlib.ledger(run_id)
    if not rows:
        return {}

    # 1. one source, one cluster — a row with no key at all (no author, no address) is its own
    labels: dict[str, str] = {}
    for i, r in enumerate(rows):
        key = claims.source_key(r) or f"row {i}"
        if key not in labels:
            labels[key] = "C%03d" % (len(labels) + 1)
        r["cluster_id"] = labels[key]
        r.pop("echo_of", None)

    # 3. near-duplicate passages (LSH when datasketch is present) — pairs, flagged below
    pairs: set[tuple[int, int]] = set()

    def pair(x: int, y: int) -> None:
        pairs.add((min(x, y), max(x, y)))

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
                    pair(i, int(j))
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
                    pair(ev[x], ev[y])

    # a copy between two sources is a flag on the later row; it never makes them one source
    for a, b in sorted(pairs):
        if rows[a]["cluster_id"] != rows[b]["cluster_id"]:
            rows[b].setdefault("echo_of", rows[a]["cluster_id"])

    path = rlib.ledger_path(run_id)
    with path.open("w", encoding="utf-8") as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")

    return {
        "rows": len(rows),
        "clusters": len(labels),
        "echo_flagged": sum(1 for r in rows if r.get("echo_of")),
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
        "echo_flagged": sum(1 for r in rows if r.get("echo_of")),
        "cluster_share_by_channel": dict(sorted(share.items(), key=lambda kv: -kv[1])),
        "max_channel_share": top,
        "measures": "clusters are sources (claims.source_key); echo_flagged is byte-level copying between "
                    "sources, flagged and never merged; non-literal reuse is NOT detected",
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
