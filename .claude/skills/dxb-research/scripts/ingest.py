#!/usr/bin/env python3
"""Turn a sweep folder into ledger rows.

A sweep produces two very different things and the ledger keeps them apart:

  <channel>.raw   search output — HEADLINES. These become `discovery` rows and
                  can never carry a load-bearing claim.
  pages/*.md      page bodies actually fetched — these become `evidence` rows
                  with a verbatim passage and its sha256.

It also records the coverage honestly: a channel that returned 0 bytes or exited
non-zero is written into the tool ledger as `failed`, so the report can print the
hole instead of hiding it.

  ingest.py <sweep-dir> --query "<the query>" --gap "<the gap it closes>"
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rlib  # noqa: E402
import independence  # noqa: E402

URL_RE = re.compile(r"https?://[^\s\"'<>)\]},]+")
NOISE = re.compile(
    r"\.(png|jpe?g|gif|svg|webp|mp4|css|js|ico|woff2?)($|\?)|"
    r"(twimg|redditstatic|redditmedia|gstatic|googleusercontent|licdn|fbcdn|ytimg|"
    r"w3\.org|schema\.org|doubleclick)", re.I)

PRIMARY_HINTS = (
    (re.compile(r"github\.com/[^/]+/[^/]+/(blob|tree|releases|issues|pull)", re.I), "code"),
    (re.compile(r"(docs?|developer|api)\.[^/]+/|/docs?/|readthedocs\.io", re.I), "primary-doc"),
    (re.compile(r"arxiv\.org|doi\.org|europepmc|ncbi\.nlm|crossref", re.I), "primary-doc"),
    (re.compile(r"(reddit|news\.ycombinator|stackoverflow|x\.com|twitter\.com|"
                r"zhihu|linux\.do|v2ex|bsky\.app|lobste\.rs)", re.I), "first-hand"),
)


def classify(url: str, channel: str, subject: str | None) -> str:
    if subject:
        dom = rlib.registrable_domain(url)
        toks = [t for t in re.split(r"[^a-z0-9]+", subject.lower()) if len(t) > 3]
        if any(t in dom for t in toks):
            return "vendor"
    for pat, kind in PRIMARY_HINTS:
        if pat.search(url):
            return kind
    if channel.startswith(("reddit", "twitter", "hackernews", "stackoverflow", "bluesky",
                           "zhihu", "linux-do", "weibo", "youtube", "linkedin")):
        return "first-hand"
    return "secondary"


def main() -> int:
    ap = argparse.ArgumentParser(prog="ingest.py")
    ap.add_argument("sweep_dir")
    ap.add_argument("--query", required=True)
    ap.add_argument("--gap", default="opening the ground")
    ap.add_argument("--run")
    ap.add_argument("--max-discovery-per-channel", type=int, default=20)
    a = ap.parse_args()

    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open research run — nothing ingested (this is not an error)", file=sys.stderr)
        return 0

    d = Path(a.sweep_dir)
    if not d.is_dir():
        print(f"no such sweep dir: {d}", file=sys.stderr)
        return 1

    st = rlib.read_state(rid)
    subject = st.get("subject")
    rows = rlib.ledger(rid)
    seen = {(r.get("url_canonical"), r.get("kind")) for r in rows}
    n = len(rows) + 1
    added_d = added_e = 0

    # ---- channels: queries, tool states, discovery rows
    for raw in sorted(d.glob("*.raw")):
        channel = raw.stem
        code_f = d / f"{channel}.code"
        code = code_f.read_text().strip() if code_f.exists() else "?"
        body = raw.read_text(encoding="utf-8", errors="replace")
        size = len(body)

        state = "returned" if (code == "0" and size >= 40) else "failed"
        detail = "" if state == "returned" else (
            (d / f"{channel}.err").read_text(encoding="utf-8", errors="replace")[:180]
            if (d / f"{channel}.err").exists() else f"exit {code}, {size} bytes")
        rlib.append_jsonl(rlib.tools_path(rid), {
            "ts": rlib.now(), "channel": channel, "state": state, "detail": detail})

        prev_q = rlib.read_jsonl(rlib.queries_path(rid))
        qid = "Q%03d" % (len(prev_q) + 1)
        urls = [u for u in dict.fromkeys(URL_RE.findall(body)) if not NOISE.search(u)]
        rlib.append_jsonl(rlib.queries_path(rid), {
            "id": qid, "run_id": rid, "ts": rlib.now(), "query": a.query,
            "gap": a.gap, "channel": channel, "hits": len(urls), "kind": "discovery"})

        if state != "returned":
            continue
        for u in urls[: a.max_discovery_per_channel]:
            cu = rlib.canonical_url(u)
            if not cu or (cu, "discovery") in seen:
                continue
            seen.add((cu, "discovery"))
            i = body.find(u)
            ctx = body[max(0, i - 200): i + 200].strip()
            rlib.append_jsonl(rlib.ledger_path(rid), {
                "id": "L%04d" % n, "run_id": rid, "kind": "discovery",
                "retrieved_at": rlib.now(), "tool": "sweep.sh", "channel": channel,
                "query_id": qid, "gap": a.gap, "url": u, "url_canonical": cu,
                "domain": rlib.registrable_domain(u), "title": None, "author": None,
                "pub_date": None, "updated_date": None, "dates_agree": False,
                "version": None, "passage": ctx,
                "passage_sha256": rlib.sha256(ctx) if ctx else None,
                "source_type": classify(u, channel, subject),
                "primary": False, "cluster_id": None, "http_status": None,
                "liveness": "unchecked", "bytes": len(ctx), "notes": "sweep discovery",
            })
            n += 1
            added_d += 1

    # ---- which channel surfaced each url (the anti-concentration rule counts THIS,
    #      not the page's own domain — otherwise every page is its own channel and
    #      "no single channel over half the clusters" can never fire)
    via: dict[str, str] = {}
    for r in rlib.ledger(rid):
        if r.get("kind") == "discovery" and r.get("url_canonical"):
            via.setdefault(r["url_canonical"], r.get("channel") or "?")

    # ---- the reading chain's log, read BEFORE the page loop so each evidence row
    #      can say which door opened it
    doors: dict[str, dict] = {}
    _flog = d / "pages" / "FETCH-LOG.json"
    if _flog.exists():
        try:
            for _r in json.loads(_flog.read_text()):
                doors[rlib.canonical_url(_r.get("url", ""))] = _r
        except Exception:
            pass

    # ---- pages: evidence rows
    urls_f = d / "pages" / "urls.txt"
    page_urls = [u.strip() for u in urls_f.read_text().splitlines() if u.strip()] \
        if urls_f.exists() else []
    for md in sorted((d / "pages").glob("*.md")) if (d / "pages").is_dir() else []:
        m = re.match(r"^(\d+)-", md.name)
        if not m:
            continue
        idx = int(m.group(1)) - 1
        if idx < 0 or idx >= len(page_urls):
            continue
        u = page_urls[idx]
        cu = rlib.canonical_url(u)
        if not cu or (cu, "evidence") in seen:
            continue
        text = md.read_text(encoding="utf-8", errors="replace")
        if len(text.strip()) < 200:
            continue
        seen.add((cu, "evidence"))
        # A bot wall, a login screen or a JS shell is a HOLE, not a source. It is
        # written down so the report can print it, and marked so the gate cannot
        # count it as evidence.
        wall = rlib.looks_like_wall(text)
        title = None
        for line in text.splitlines()[:12]:
            if line.strip().startswith("#"):
                title = line.strip("# ").strip()
                break
        passage = rlib.strip_boilerplate(text, 6000)
        stype = "secondary" if wall else classify(u, "page", subject)
        rlib.append_jsonl(rlib.ledger_path(rid), {
            "id": "L%04d" % n, "run_id": rid, "kind": "evidence",
            "retrieved_at": rlib.now(), "tool": "scrapling", "channel": "page:" + (
                rlib.registrable_domain(u) or "?"),
            "query_id": None, "gap": a.gap, "url": u, "url_canonical": cu,
            "via": via.get(cu, "page"),
            "domain": rlib.registrable_domain(u), "title": title, "author": None,
            "pub_date": None, "updated_date": None, "dates_agree": False, "version": None,
            "passage": passage, "passage_sha256": rlib.sha256(passage),
            "source_type": stype,
            "primary": (not wall) and stype in (
                "primary-doc", "code", "first-hand", "independent-test"),
            "cluster_id": None, "http_status": 200,
            "liveness": "blocked" if wall else "alive",
            "fetch_door": (doors.get(cu) or {}).get("door"),
            "cached_snapshot": bool((doors.get(cu) or {}).get("cached_snapshot")),
            "wall": wall,
            "bytes": len(text),
            "notes": "wall/login page — recorded as a hole, not counted as evidence"
                     if wall else "sweep page body",
        })
        n += 1
        added_e += 1

    # the reading chain's own log: which door opened each page, and for a page that
    # stayed shut, every door that was tried. A hole is recorded, never swallowed.
    flog = d / "pages" / "FETCH-LOG.json"
    if flog.exists():
        for r in doors.values():
            if r.get("read"):
                continue
            tried = " -> ".join(a.get("door", "?") for a in r.get("attempts", []))
            rlib.append_jsonl(rlib.tools_path(rid), {
                "ts": rlib.now(),
                "channel": "page:" + (rlib.registrable_domain(r.get("url", "")) or "?"),
                "state": "failed",
                "detail": f"[{r.get('liveness')}] every door failed: {tried} · {r.get('url','')[:90]}"})

    info = independence.recluster(rid)
    print(json.dumps({"run": rid, "discovery_added": added_d, "evidence_added": added_e,
                      **info}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
