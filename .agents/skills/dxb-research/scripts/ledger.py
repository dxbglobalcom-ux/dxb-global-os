#!/usr/bin/env python3
"""The evidence ledger — written by the machine, never by the model.

Two row kinds, and the difference is the whole point:

  discovery : a search result. A HEADLINE. It proves a page exists and what it is
              called. It can never carry a load-bearing claim.
  evidence  : a page that was actually FETCHED. Carries a verbatim passage and its
              sha256, so a quote can be checked byte for byte.

CLI
  ledger.py add        --kind evidence --url U --passage-file F [...]
  ledger.py add-query  --query Q --gap G --channel C --hits N
  ledger.py add-tool   --channel C --state invoked|returned|failed [--detail D]
  ledger.py show       [--kind evidence] [--limit N]
  ledger.py stats
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rlib  # noqa: E402


# ------------------------------------------------------------------ helpers
def _detect_dates(html: str, url: str) -> tuple[str | None, str | None, bool]:
    """Never trust one date extractor (measured 2026-09-16: htmldate 1/3 right).

    Cross-check htmldate against JSON-LD datePublished. Agreement -> the date.
    Disagreement or a single source -> recorded, but the row stays UNDATED-grade
    and the report says so.
    """
    pub = upd = None
    ld_pub = ld_mod = None
    try:
        for m in re.finditer(
            r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.S | re.I
        ):
            try:
                blob = json.loads(m.group(1).strip())
            except Exception:
                continue
            for node in (blob if isinstance(blob, list) else [blob]):
                if not isinstance(node, dict):
                    continue
                ld_pub = ld_pub or node.get("datePublished")
                ld_mod = ld_mod or node.get("dateModified")
    except Exception:
        pass
    hd = None
    try:
        from htmldate import find_date  # type: ignore
        hd = find_date(html, url=url, original_date=True, outputformat="%Y-%m-%d")
    except Exception:
        pass
    norm = lambda s: (s or "")[:10] or None  # noqa: E731
    ld_pub, ld_mod = norm(ld_pub), norm(ld_mod)
    if hd and ld_pub and hd == ld_pub:
        pub = hd
    elif ld_pub:
        pub = ld_pub
    elif hd:
        pub = hd
    upd = ld_mod
    agree = bool(hd and ld_pub and hd == ld_pub)
    return pub, (upd if upd else None), agree


def _extract_body(html: str, url: str) -> tuple[str, str | None, str | None]:
    """Body text, title, author. trafilatura when present; a plain strip otherwise."""
    try:
        import trafilatura  # type: ignore
        meta = trafilatura.extract_metadata(html, default_url=url)
        body = trafilatura.extract(html, include_comments=False, include_tables=True) or ""
        title = getattr(meta, "title", None) if meta else None
        author = getattr(meta, "author", None) if meta else None
        if body:
            return body, title, author
    except Exception:
        pass
    text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", html, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    m = re.search(r"<title[^>]*>(.*?)</title>", html, re.S | re.I)
    return text, (m.group(1).strip() if m else None), None


def _vendor_domain(url: str, subject: str | None) -> bool:
    if not subject:
        return False
    dom = rlib.registrable_domain(url)
    tokens = [t for t in re.split(r"[^a-z0-9]+", subject.lower()) if len(t) > 3]
    return any(t in dom for t in tokens)


# ------------------------------------------------------------------ commands
def cmd_add(a: argparse.Namespace) -> int:
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run — scripts/research.py open first", file=sys.stderr)
        return 1
    st = rlib.read_state(rid)

    passage = a.passage or ""
    html = ""
    if a.passage_file:
        html = Path(a.passage_file).read_text(encoding="utf-8", errors="replace")
    title, author, pub, upd, dates_agree = a.title, a.author, a.pub_date, None, False

    # A plain-text passage is not a web page. Measured 2026-09-16: a 3107-byte
    # measurement transcript went in through _extract_body (trafilatura), came out
    # 1861 bytes with four of its six sections gone, and passage_sha256 then certified
    # the mutilated text as faithful. The ledger exists so that the passage carries the
    # fact; an HTML body-extractor run over plain text destroys exactly that.
    _looks_html = ("<html" in html[:4000].lower() or "<body" in html[:4000].lower()
                   or "<div" in html[:4000].lower() or "<p>" in html[:4000].lower())
    if a.kind == "evidence" and html and not _looks_html:
        if not passage:
            passage = html[: a.max_passage]
    elif a.kind == "evidence" and html:
        body, t2, au2 = _extract_body(html, a.url)
        title = title or t2
        author = author or au2
        if not passage:
            passage = body[: a.max_passage]
        p, u, agree = _detect_dates(html, a.url)
        pub, upd, dates_agree = (pub or p), u, agree

    if a.kind == "evidence" and not passage.strip():
        print("REFUSED: an evidence row needs a passage from a FETCHED body", file=sys.stderr)
        return 2

    src = a.source_type
    if src == "auto":
        if _vendor_domain(a.url, st.get("subject")):
            src = "vendor"
        elif a.kind == "discovery":
            src = "secondary"
        else:
            src = "secondary"

    row = {
        "id": rlib.next_row_id(rid),
        "run_id": rid,
        "kind": a.kind,
        "retrieved_at": rlib.now(),
        "tool": a.tool or "manual",
        "channel": a.channel or "manual",
        "query_id": a.query_id,
        "gap": a.gap,
        "url": a.url,
        "url_canonical": rlib.canonical_url(a.url),
        "domain": rlib.registrable_domain(a.url),
        "title": title,
        "author": author,
        "pub_date": pub,
        "updated_date": upd,
        "dates_agree": dates_agree,
        "version": a.version,
        "passage": passage,
        "passage_sha256": rlib.sha256(passage) if passage else None,
        "source_type": src,
        "primary": src in ("primary-doc", "code", "first-hand", "independent-test"),
        "cluster_id": None,
        "http_status": a.http_status,
        "liveness": a.liveness,
        "evidence_of_absence": bool(a.evidence_of_absence),
        "bytes": len(html) if html else len(passage),
        "notes": a.notes,
    }
    rlib.append_jsonl(rlib.ledger_path(rid), row)
    try:
        import independence
        independence.recluster(rid)
    except Exception:
        pass
    print(row["id"])
    return 0


def cmd_add_query(a: argparse.Namespace) -> int:
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run", file=sys.stderr)
        return 1
    if not a.gap:
        print("REFUSED: every query must NAME the information gap it closes", file=sys.stderr)
        return 2
    prev = rlib.read_jsonl(rlib.queries_path(rid))
    qid = "Q%03d" % (len(prev) + 1)
    rlib.append_jsonl(rlib.queries_path(rid), {
        "id": qid, "run_id": rid, "ts": rlib.now(), "query": a.query,
        "gap": a.gap, "channel": a.channel, "hits": a.hits,
        "kind": a.kind,
    })
    print(qid)
    return 0


def cmd_add_tool(a: argparse.Namespace) -> int:
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run", file=sys.stderr)
        return 1
    rlib.append_jsonl(rlib.tools_path(rid), {
        "ts": rlib.now(), "channel": a.channel, "state": a.state,
        "detail": a.detail, "ms": a.ms,
    })
    return 0


def cmd_show(a: argparse.Namespace) -> int:
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run", file=sys.stderr)
        return 1
    rows = rlib.ledger(rid)
    if a.kind:
        rows = [r for r in rows if r.get("kind") == a.kind]
    for r in rows[-a.limit:]:
        print("%-6s %-9s %-14s %-11s %-8s %s" % (
            r["id"], r.get("kind"), (r.get("channel") or "")[:14],
            (r.get("source_type") or "")[:11], (r.get("cluster_id") or "-")[:8],
            (r.get("title") or r.get("url") or "")[:70]))
    return 0


def cmd_stats(a: argparse.Namespace) -> int:
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run", file=sys.stderr)
        return 1
    rows = rlib.ledger(rid)
    ev = [r for r in rows if r.get("kind") == "evidence"]
    clusters = {r.get("cluster_id") for r in ev if r.get("cluster_id")}
    print(json.dumps({
        "run": rid,
        "rows": len(rows),
        "evidence_rows": len(ev),
        "discovery_rows": len(rows) - len(ev),
        "clusters": len(clusters),
        "queries": len(rlib.read_jsonl(rlib.queries_path(rid))),
        "source_types": sorted({r.get("source_type") for r in ev if r.get("source_type")}),
    }, ensure_ascii=False, indent=2))
    return 0


def main() -> int:
    p = argparse.ArgumentParser(prog="ledger.py")
    p.add_argument("--run")
    sub = p.add_subparsers(dest="cmd", required=True)

    a = sub.add_parser("add")
    a.add_argument("--kind", choices=rlib.KINDS, required=True)
    a.add_argument("--url", required=True)
    a.add_argument("--passage")
    a.add_argument("--passage-file")
    a.add_argument("--title")
    a.add_argument("--author")
    a.add_argument("--pub-date")
    a.add_argument("--version")
    a.add_argument("--tool")
    a.add_argument("--channel")
    a.add_argument("--query-id")
    a.add_argument("--gap")
    a.add_argument("--source-type", choices=list(rlib.SOURCE_TYPES) + ["auto"], default="auto")
    a.add_argument("--http-status", type=int)
    a.add_argument("--liveness", choices=rlib.LIVENESS, default="unchecked")
    a.add_argument("--notes")
    a.add_argument("--evidence-of-absence", action="store_true",
                   help="the page's NON-existence is the finding (a 404 that answers the "
                        "question). Only such a row may be cited while dead.")
    a.add_argument("--max-passage", type=int, default=6000)
    a.set_defaults(fn=cmd_add)

    q = sub.add_parser("add-query")
    q.add_argument("--query", required=True)
    q.add_argument("--gap", required=True)
    q.add_argument("--channel")
    q.add_argument("--hits", type=int, default=0)
    q.add_argument("--kind", default="discovery")
    q.set_defaults(fn=cmd_add_query)

    t = sub.add_parser("add-tool")
    t.add_argument("--channel", required=True)
    t.add_argument("--state", choices=["installed", "invoked", "returned", "failed"], required=True)
    t.add_argument("--detail")
    t.add_argument("--ms", type=int)
    t.set_defaults(fn=cmd_add_tool)

    s = sub.add_parser("show")
    s.add_argument("--kind", choices=rlib.KINDS)
    s.add_argument("--limit", type=int, default=40)
    s.set_defaults(fn=cmd_show)

    st = sub.add_parser("stats")
    st.set_defaults(fn=cmd_stats)

    ns = p.parse_args()
    return ns.fn(ns)


if __name__ == "__main__":
    raise SystemExit(main())
