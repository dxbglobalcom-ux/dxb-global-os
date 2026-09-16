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

# A backslash and a backtick are not legal unescaped in a URL, and both end up glued to one
# when the captured text came through `jq` (a literal `\n`) or through markdown (a closing
# backtick). Measured 2026-09-16: six discovery rows in run 20260916-213702 carried URLs
# like `.../issues/6359\nCOMMENTS:` and urlcheck.py called them dead, correctly.
URL_RE = re.compile(r"https?://[^\s\"'<>)\]},`\\]+")

# `fetch.py` is deliberately ABSENT from BASH_RESEARCH. A hand read through the chain writes its
# own evidence row inside fetch.py (`_ledger_evidence`), which is the only place holding the url,
# the door, the liveness and the body at once — this hook sees `--out "$SP/file.md"`, an
# unexpanded shell variable it cannot resolve. Capturing it here as well would emit a discovery
# row for every URL inside a fetched source file, and, under --batch, would steal the sweep's
# evidence rows before ingest.py could stamp them with the channel that found each page.


def _text(obj) -> str:
    if obj is None:
        return ""
    if isinstance(obj, str):
        return obj
    try:
        return json.dumps(obj, ensure_ascii=False)
    except Exception:
        return str(obj)


# `opencli` must sit where a COMMAND sits - line start, after ; | && || ( or a backtick,
# optionally behind VAR=value prefixes - and the token after it must look like a site.
# The naive r"opencli\s+([a-z0-9-]+)" matched the word anywhere in a compound command and
# invented channels that never ran: `npm view @jackwener/opencli version` became the channel
# "opencli:version", `opencli --version` became "opencli:--version", the string
# "opencli 1.8.7" inside a --version argument became "opencli:1", and the query text
# "opencli unknown option" became "opencli:unknown". Measured 2026-09-16 on this session's
# own 183 bash rows: 4 invented channels before, 0 after, and both real ones kept. They then
# surfaced in coverage.py as HOLES reported to the CEO - a hole that never existed.
OPENCLI_CALL = re.compile(
    r"(?:^|[;|&(`]|\|\||&&)\s*(?:[A-Za-z_][A-Za-z0-9_]*=\S+\s+)*opencli\s+(?!-)([a-z][a-z0-9-]*)",
    re.M)


def _channel_from_bash(cmd: str) -> str:
    m = OPENCLI_CALL.search(cmd)
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


def _classify(url: str, channel: str, subject: str | None) -> str:
    """ingest.py's own classifier, or 'secondary' if it cannot be imported."""
    try:
        import ingest
        return ingest.classify(url, channel, subject)
    except Exception:
        return "secondary"


def main() -> int:
    # ORDER MATTERS, and it cost this engine its central claim. `import rlib` re-execs
    # the process into the research venv (system python has neither datasketch nor
    # trafilatura), and os.execv does not carry a stdin that has already been read: the
    # restarted process finds EOF, sees no payload, and exits silently.
    #
    # Measured 2026-09-16, across all 14 runs this engine had ever made: 2 327 ledger
    # rows, and NOT ONE of them written by this hook. Every row came from sweep.sh or
    # fetch.py, while "the ledger writes itself from your tool calls" stood in the
    # doctrine. The Stop hook had already been repaired this way; this one had not.
    # Import first, read stdin in whichever process survives.
    try:
        import rlib
        import ledger as ledger_mod  # noqa: F401  (kept for row-id parity)
    except Exception:
        return 0

    try:
        payload = json.load(sys.stdin)
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

    def emit(kind: str, url: str, passage: str, channel: str, title=None, status=None,
             stype: str = "secondary", tool_name: str | None = None, liveness: str = "unchecked"):
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
            "tool": tool_name or tool,
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
            "source_type": stype,
            "primary": stype in ("primary-doc", "code", "independent-test"),
            "cluster_id": None,
            "http_status": status,
            "liveness": liveness,
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
        # An auto-captured row used to be stamped "secondary" whatever it was, so a source file
        # or an RFC read with WebFetch could never satisfy the gate's `primary-doc|code`. The
        # classifier that ingest.py already applies to swept rows applies here too.
        try:
            subject = (rlib.read_state(run_id) or {}).get("subject")
        except Exception:
            subject = None
        if isinstance(tin.get("urls"), list) and len(tin["urls"]) > 1:
            chunk = max(1, len(body) // len(tin["urls"]))
            for i, u in enumerate(tin["urls"][:MAX_ROWS_PER_CALL]):
                if emit("evidence", u, body[i * chunk:(i + 1) * chunk][:PASSAGE_CHARS], tool,
                        stype=_classify(u, tool, subject), liveness="alive"):
                    written += 1
        elif url:
            if emit("evidence", url, body[:PASSAGE_CHARS], tool,
                    stype=_classify(url, tool, subject), liveness="alive"):
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
