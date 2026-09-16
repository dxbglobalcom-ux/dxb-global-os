#!/usr/bin/env python3
"""PostToolUse — the ledger writes itself.

This is the repair that makes "the ledger is written by the machine, never by the
model" actually true in this harness. Without it the ledger only ever sees what
passed through sweep.sh, so an agent that reads twenty pages by hand looks, to
the gate, like an agent that read nothing — and the gate then either blocks
honest work or lets a claim cite a page it never stored.

Measured 2026-09-16 on Claude Code 2.1.273: a PostToolUse hook receives
`tool_name`, `tool_input`, `tool_response` and `tool_use_id`. So every fetch the
agent makes directly can be recorded by a machine, from the tool's own result.

It is silent unless a research run is open, and it never blocks anything.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SKILL / "scripts"))

MAX_ROWS_PER_CALL = 25
PASSAGE_CHARS = 6000

SEARCH_TOOLS = re.compile(r"^(WebSearch|mcp__.*(search|find).*)$", re.I)
FETCH_TOOLS = re.compile(
    r"^(WebFetch|mcp__scrapling__(get|fetch|stealthy_fetch|bulk_get|bulk_fetch|bulk_stealthy_fetch)"
    r"|mcp__.*playwright.*browser_(navigate|snapshot)|mcp__.*fetch.*)$", re.I)
BASH_RESEARCH = re.compile(
    r"\b(opencli|mcporter\s+call|gh\s+(search|api)|bili\s+search|yt-dlp|sweep\.sh"
    r"|curl[^|]*\b(mcp\.exa\.ai|search\.parallel\.ai|mcp\.tavily\.com|mcp\.firecrawl\.dev"
    r"|api\.you\.com|api\.crossref\.org|europepmc|export\.arxiv\.org|api\.openalex\.org"
    r"|r\.jina\.ai))\b")

URL_RE = re.compile(r"https?://[^\s\"'<>)\]},]+")


def _text(obj) -> str:
    if obj is None:
        return ""
    if isinstance(obj, str):
        return obj
    try:
        return json.dumps(obj, ensure_ascii=False)
    except Exception:
        return str(obj)


def _channel_from_bash(cmd: str) -> str:
    m = re.search(r"opencli\s+([a-z0-9-]+)", cmd)
    if m:
        return "opencli:" + m.group(1)
    for name, pat in (("exa", r"mcp\.exa\.ai|exa\.web_search"), ("parallel", r"search\.parallel\.ai"),
                      ("tavily", r"mcp\.tavily\.com"), ("firecrawl", r"mcp\.firecrawl\.dev"),
                      ("youcom", r"api\.you\.com"), ("github", r"\bgh\s+(search|api)"),
                      ("crossref", r"api\.crossref\.org"), ("europepmc", r"europepmc"),
                      ("arxiv", r"export\.arxiv\.org"), ("openalex", r"api\.openalex\.org"),
                      ("jina", r"r\.jina\.ai"), ("bilibili", r"\bbili\s+search"),
                      ("youtube", r"yt-dlp"), ("sweep", r"sweep\.sh")):
        if re.search(pat, cmd):
            return name
    return "bash"


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0

    try:
        import rlib
        import ledger as ledger_mod  # noqa: F401  (kept for row-id parity)
    except Exception:
        return 0

    run_id = rlib.current_run_id()
    if not run_id:
        return 0

    tool = payload.get("tool_name") or ""
    tin = payload.get("tool_input") or {}
    tout = payload.get("tool_response")
    body = _text(tout)
    if not body:
        return 0

    rows_existing = rlib.ledger(run_id)
    seen = {(r.get("url_canonical"), r.get("kind")) for r in rows_existing}
    next_n = len(rows_existing) + 1

    def emit(kind: str, url: str, passage: str, channel: str, title=None, status=None):
        nonlocal next_n
        cu = rlib.canonical_url(url)
        if not cu or (cu, kind) in seen:
            return False
        seen.add((cu, kind))
        row = {
            "id": "L%04d" % next_n,
            "run_id": run_id,
            "kind": kind,
            "retrieved_at": rlib.now(),
            "tool": tool,
            "channel": channel,
            "query_id": None,
            "gap": None,
            "url": url,
            "url_canonical": cu,
            "domain": rlib.registrable_domain(url),
            "title": title,
            "author": None,
            "pub_date": None,
            "updated_date": None,
            "dates_agree": False,
            "version": None,
            "passage": passage,
            "passage_sha256": rlib.sha256(passage) if passage else None,
            "source_type": "secondary",
            "primary": False,
            "cluster_id": None,
            "http_status": status,
            "liveness": "unchecked",
            "bytes": len(passage),
            "notes": "auto-captured by PostToolUse",
        }
        rlib.append_jsonl(rlib.ledger_path(run_id), row)
        next_n += 1
        return True

    written = 0
    channel = tool

    if tool == "Bash":
        cmd = str(tin.get("command") or "")
        if not BASH_RESEARCH.search(cmd):
            return 0
        channel = _channel_from_bash(cmd)
        rlib.append_jsonl(rlib.tools_path(run_id),
                          {"ts": rlib.now(), "channel": channel, "state": "returned",
                           "detail": cmd[:180]})
        for url in list(dict.fromkeys(URL_RE.findall(body)))[:MAX_ROWS_PER_CALL]:
            i = body.find(url)
            ctx = body[max(0, i - 220): i + 220].strip()
            if emit("discovery", url, ctx, channel):
                written += 1

    elif FETCH_TOOLS.match(tool):
        url = (tin.get("url") or tin.get("uri") or tin.get("link")
               or (tin.get("urls") or [None])[0] or "")
        rlib.append_jsonl(rlib.tools_path(run_id),
                          {"ts": rlib.now(), "channel": tool, "state": "returned",
                           "detail": str(url)[:180]})
        if isinstance(tin.get("urls"), list) and len(tin["urls"]) > 1:
            chunk = max(1, len(body) // len(tin["urls"]))
            for i, u in enumerate(tin["urls"][:MAX_ROWS_PER_CALL]):
                if emit("evidence", u, body[i * chunk:(i + 1) * chunk][:PASSAGE_CHARS], tool):
                    written += 1
        elif url:
            if emit("evidence", url, body[:PASSAGE_CHARS], tool):
                written += 1

    elif SEARCH_TOOLS.match(tool):
        rlib.append_jsonl(rlib.tools_path(run_id),
                          {"ts": rlib.now(), "channel": tool, "state": "returned",
                           "detail": _text(tin)[:180]})
        for url in list(dict.fromkeys(URL_RE.findall(body)))[:MAX_ROWS_PER_CALL]:
            i = body.find(url)
            ctx = body[max(0, i - 220): i + 220].strip()
            if emit("discovery", url, ctx, tool):
                written += 1
    else:
        return 0

    if written:
        try:
            import independence
            independence.recluster(run_id)
        except Exception:
            pass
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
