#!/usr/bin/env python3
"""The reading chain — a page is not abandoned until every door has been tried.

The CEO's order, 2026-09-16: *"sayfaya girdi agent reach ile bilgiyi çekicek,
çekemiyorsa scrapling aletiyle çekicek… reddit'i açıyor bakıyor kapatıyor, böyle
olmaz."*

So there is no such thing here as "the page could not be read". There is a CHAIN,
and a page is only unread when **every** link in it has failed — and then the
report says which doors were tried and what each one answered.

   1. media-transcript        a video's OWN WORDS: yt-dlp subtitles, else
                              `agent-reach transcribe` (Whisper). A video page's
                              MENU is not evidence.
   2. pdf-text                curl + pdftotext -layout, for a paper or a spec
   3. scrapling get           plain HTTP with TLS impersonation — fastest
   4. scrapling stealthy-fetch camoufox, solves the ordinary bot challenge
   5. opencli <adapter> read  the platform's OWN reader, through a real session
   6. tavily_extract          keyless MCP
   7. firecrawl_scrape        keyless MCP
   8. exa web_fetch           keyless MCP
   9. playwright              a real browser: an isolated context of the hidden research
                              Chrome (Xvfb :99), never headless, never on his screen
  10. jina r.jina.ai          keyless, but a CACHED snapshot — labelled as one
  11. curl + browser UA       the floor

Doors 1 and 2 return instantly for a url they do not match, so they cost nothing on
an ordinary page.

Every attempt is written to the tool ledger with its result, so "installed" can
never be mistaken for "used", and a wall can never be mistaken for an absence.

  fetch.py <url> [--out FILE] [--json] [--timeout S] [--stop-at N]
  fetch.py --batch urls.txt --outdir DIR [--workers 6]
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import json
import os
import re
import shlex
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rlib  # noqa: E402

SKILL = Path(__file__).resolve().parent.parent
SCRAPLING = Path("/home/dxb/scrapling-env/bin/scrapling")
MCPX = SKILL / "scripts" / "mcpx.sh"
MIN_BODY = 400          # below this it is a stub, not a page
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/140.0 Safari/537.36")

# platform -> the opencli adapter that can read that platform's own pages
PLATFORM_READERS = [
    (re.compile(r"reddit\.com/r/[^/]+/comments/([a-z0-9]+)", re.I), "reddit", "read"),
    (re.compile(r"news\.ycombinator\.com/item\?id=(\d+)", re.I), "hackernews", "read"),
    # Measured 2026-09-16 on 1.8.7: only reddit, hackernews and stackoverflow HAVE a `read`.
    # The other four named one that does not exist — `opencli v2ex read 123` answers
    # `error: unknown command 'read'` — so four of the seven doors in the chain the CEO named
    # were dead. These are the verbs those sites actually ship, each taking one positional id.
    (re.compile(r"(?:twitter|x)\.com/[^/]+/status/(\d+)", re.I), "twitter", "thread"),
    (re.compile(r"v2ex\.com/t/(\d+)", re.I), "v2ex", "topic"),
    (re.compile(r"youtube\.com/watch\?v=([\w-]+)", re.I), "youtube", "transcript"),
    (re.compile(r"zhihu\.com/question/(\d+)", re.I), "zhihu", "question"),
    (re.compile(r"stackoverflow\.com/questions/(\d+)", re.I), "stackoverflow", "read"),
]


# Every opencli call from this file goes to the back door: the screen is the CEO's.
os.environ.setdefault("OPENCLI_WINDOW", "background")
# ...and through bin/opencli first (2026-09-24): a browser-backed reader gets its own window in the
# hidden research Chrome, never one in his. A caller that already put the shim first is left alone.
_SHIM = str(SKILL / "bin")
if os.environ.get("PATH", "").split(os.pathsep)[0] != _SHIM:
    os.environ["PATH"] = _SHIM + os.pathsep + os.environ.get("PATH", "")


def _sh(cmd: str, timeout: int) -> tuple[int, str, str]:
    try:
        p = subprocess.run(cmd, shell=True, capture_output=True, text=True,
                           timeout=timeout)
        return p.returncode, p.stdout, p.stderr[-300:]
    except subprocess.TimeoutExpired:
        return 124, "", "timeout"
    except Exception as e:  # pragma: no cover
        return 1, "", str(e)[:200]


def _ok(text: str) -> bool:
    return bool(text) and len(text.strip()) >= MIN_BODY and not rlib.looks_like_wall(text)


# ---------------------------------------------------------------- the doors
def door_scrapling(url: str, tmo: int) -> tuple[str, str]:
    if not SCRAPLING.exists():
        return "", "scrapling not installed"
    out = Path("/tmp") / f"dxbfetch-{abs(hash(url))}.md"
    rc, _, err = _sh(f'{shlex.quote(str(SCRAPLING))} extract get {shlex.quote(url)} '
                     f'{shlex.quote(str(out))}', tmo)
    txt = out.read_text(encoding="utf-8", errors="replace") if out.exists() else ""
    out.unlink(missing_ok=True)
    return txt, ("" if rc == 0 else f"rc={rc} {err}")


def door_scrapling_stealth(url: str, tmo: int) -> tuple[str, str]:
    if not SCRAPLING.exists():
        return "", "scrapling not installed"
    out = Path("/tmp") / f"dxbfetch-s-{abs(hash(url))}.md"
    rc, _, err = _sh(f'{shlex.quote(str(SCRAPLING))} extract stealthy-fetch '
                     f'{shlex.quote(url)} {shlex.quote(str(out))}', tmo)
    txt = out.read_text(encoding="utf-8", errors="replace") if out.exists() else ""
    out.unlink(missing_ok=True)
    return txt, ("" if rc == 0 else f"rc={rc} {err}")


def door_opencli(url: str, tmo: int) -> tuple[str, str]:
    """The platform's own reader. This is the door the CEO named."""
    for pat, adapter, verb in PLATFORM_READERS:
        m = pat.search(url)
        if not m:
            continue
        ident = m.group(1)
        # No --window flag: opencli registers it only on browser-backed adapters, and the
        # readers behind this door (hackernews, stackoverflow) are not. OPENCLI_WINDOW is
        # exported at import and is honoured by the browser-backed ones instead.
        cmd = f'opencli {adapter} {verb} {shlex.quote(ident)} -f yaml'
        rc, out, err = _sh(cmd, tmo)
        return out, ("" if rc == 0 else f"rc={rc} {(err or '')[:120]}")
    return "", "no platform adapter for this url"


def door_tavily(url: str, tmo: int) -> tuple[str, str]:
    rc, out, err = _sh(f'{shlex.quote(str(MCPX))} fetch-tavily {shlex.quote(url)}', tmo)
    return out, ("" if rc == 0 else f"rc={rc} {err}")


def door_firecrawl(url: str, tmo: int) -> tuple[str, str]:
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                       "params": {"name": "firecrawl_scrape",
                                  "arguments": {"url": url, "formats": ["markdown"]}}})
    return _mcp("https://mcp.firecrawl.dev/v2/mcp", body, [], tmo)


def door_exa(url: str, tmo: int) -> tuple[str, str]:
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                       "params": {"name": "web_fetch_exa", "arguments": {"url": url}}})
    return _mcp("https://mcp.exa.ai/mcp", body, [], tmo)


def _mcp(endpoint: str, body: str, headers: list[str], tmo: int) -> tuple[str, str]:
    h = " ".join(f"-H {shlex.quote(x)}" for x in headers)
    cmd = (f"curl -sS -m {tmo} -X POST {shlex.quote(endpoint)} "
           f"-H 'Content-Type: application/json' "
           f"-H 'Accept: application/json, text/event-stream' {h} -d {shlex.quote(body)}")
    rc, out, err = _sh(cmd, tmo + 5)
    if rc != 0:
        return "", f"rc={rc} {err}"
    chunks = []
    for line in out.splitlines():
        line = line.strip()
        if line.startswith("data:"):
            line = line[5:].strip()
        if not line:
            continue
        try:
            d = json.loads(line)
        except Exception:
            continue
        if d.get("error"):
            return "", json.dumps(d["error"])[:150]
        # THE ERROR THAT LIVES INSIDE THE RESULT. MCP reports a failed tool call with
        # `result.isError: true` and puts the diagnostic in the SAME `content` array a page
        # would arrive in. Only the envelope's `error` key was being read, so a long enough
        # diagnostic passed the length test and the chain reported `read: true, liveness:
        # alive, doors_tried: 1` for a page it had never seen. An error is not a page.
        if (d.get("result") or {}).get("isError"):
            txt = " ".join(c.get("text", "") for c in (d.get("result") or {}).get("content", []) or [])
            return "", "isError: " + txt.strip()[:150]
        for c in (d.get("result") or {}).get("content", []) or []:
            if c.get("type") == "text":
                chunks.append(c["text"])
    return "\n".join(chunks), ""


# The browser door, repaired 2026-09-17. It had been DEAD since it was written and nobody
# had watched it fail: `node -e "require('playwright')"` cannot resolve a module that is not
# installed beside the current directory, so every page that reached this door got
# `rc=1 … node:internal/modules/cjs/loader` and walked straight past it. Measured when the
# CEO asked why the other tools had not tried Quora — all eleven were fired at it, and this
# one was the only one that failed for a reason of OUR OWN making.
#
# The repair is not "npm install playwright": Playwright's own browser downloads REFUSE this
# machine ("Playwright does not support chromium on ubuntu26.04-x64"). The browser that IS
# here is Google Chrome 153. So the door drives that, through the python playwright in the
# scrapling venv. Until 2026-09-24 it launched it headless in a throwaway /tmp profile (and the
# two clean-up repairs that profile needed are why sweep_stale_profiles below exists).
# SINCE 2026-09-24 IT STARTS NO BROWSER OF ITS OWN. Headless is what Cloudflare refuses —
# Perplexity answered 403 headless and 200 to a headful Chrome on Xvfb, measured that day — so
# the door connects to the hidden research Chrome over DevTools and reads in a FRESH, isolated
# context there: no cookies, as before, and its window lives on Xvfb :99, not on his screen.
# Playwright creates that context with disposeOnDetach, so a reader that is killed takes its
# window with it; the slot keeps it inside the hidden Chrome's window budget.
_PW_PY = "/home/dxb/scrapling-env/bin/python"
_PW_SCRIPT = """
import sys
sys.path.insert(0, sys.argv[3])
import hidden
from playwright.sync_api import sync_playwright
if not hidden.version():
    print(hidden.DOWN_MSG, file=sys.stderr)
    sys.exit(69)
with hidden.slot(float(sys.argv[2])):
    with sync_playwright() as p:
        b = p.chromium.connect_over_cdp(hidden.BASE, timeout=int(sys.argv[2]) * 1000)
        ctx = b.new_context()
        try:
            pg = ctx.new_page()
            pg.goto(sys.argv[1], wait_until="domcontentloaded", timeout=int(sys.argv[2]) * 1000)
            pg.wait_for_timeout(1200)
            print(pg.evaluate("() => document.body.innerText"))
        finally:
            ctx.close()
"""


def door_playwright(url: str, tmo: int) -> tuple[str, str]:
    """An isolated context of the hidden research Chrome (Xvfb :99). The screen belongs to the CEO."""
    if not Path(_PW_PY).exists():
        return "", "no playwright interpreter"
    rc, out, err = _sh(
        f"{shlex.quote(_PW_PY)} -c {shlex.quote(_PW_SCRIPT)} {shlex.quote(url)} {tmo} "
        f"{shlex.quote(str(SKILL / 'scripts'))}", tmo + 25)
    return out, ("" if rc == 0 else f"rc={rc} {err[-120:]}")


def door_jina(url: str, tmo: int) -> tuple[str, str]:
    # ENGLISH, ALWAYS. Measured 2026-09-17: Quora answered this machine in German — its
    # German corpus is a fraction of the English one, and the CEO caught it in one line
    # ("almanla işimiz yok"). Without a language header the site guesses from the exit IP.
    rc, out, err = _sh(f"curl -sS -m {tmo} -H 'Accept-Language: en-US,en;q=0.9' "
                       f"{shlex.quote('https://r.jina.ai/' + url)}", tmo + 5)
    return out, ("" if rc == 0 else f"rc={rc} {err}")


def door_curl(url: str, tmo: int) -> tuple[str, str]:
    rc, out, err = _sh(f"curl -sSL -m {tmo} -H 'Accept-Language: en-US,en;q=0.9' "
                       f"-A {shlex.quote(UA)} {shlex.quote(url)}", tmo + 5)
    if rc != 0:
        return "", f"rc={rc} {err}"
    text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", out, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip(), ""



MEDIA_RE = re.compile(r"(youtube\.com/watch|youtu\.be/|bilibili\.com/video|vimeo\.com/\d|"
                      r"\.mp3($|\?)|\.m4a($|\?)|podcasts?\.|xiaoyuzhoufm\.com)", re.I)
PDF_RE = re.compile(r"\.pdf($|\?)|arxiv\.org/pdf/", re.I)


def _vtt_to_text(vtt: str) -> str:
    """A subtitle file is the video's own words. Strip the timing and the duplicates."""
    out, last = [], None
    for line in vtt.splitlines():
        line = line.strip()
        if (not line or line.startswith(("WEBVTT", "Kind:", "Language:", "NOTE"))
                or "-->" in line or line.isdigit()):
            continue
        line = re.sub(r"<[^>]+>", "", line).strip()
        if line and line != last:
            out.append(line)
            last = line
    return "\n".join(out)


def door_media(url: str, tmo: int) -> tuple[str, str]:
    """A video page's MENU is not evidence; the video's WORDS are.

    Measured 2026-09-16: reading a YouTube page with an ordinary fetcher produced a
    passage of navigation chrome - "About Press Copyright Contact us Creators" - and
    the ledger counted it as a source. yt-dlp's auto-subtitles for the same video are
    83 KB of what was actually said.
    """
    if not MEDIA_RE.search(url):
        return "", "not a media url"
    d = Path("/tmp") / f"dxbsub-{abs(hash(url))}"
    d.mkdir(parents=True, exist_ok=True)
    rc, out, err = _sh(
        f'yt-dlp --skip-download --write-subs --write-auto-subs '
        f'--sub-langs "en.*,tr.*,zh.*" --sub-format vtt --no-warnings '
        f'-o {shlex.quote(str(d / "%(id)s"))} {shlex.quote(url)}', tmo)
    texts = []
    for f in sorted(d.glob("*.vtt")):
        try:
            texts.append(_vtt_to_text(f.read_text(encoding="utf-8", errors="replace")))
        except Exception:
            pass
        f.unlink(missing_ok=True)
    body = max(texts, key=len) if texts else ""
    if body:
        title, _, _ = _sh(f'yt-dlp --skip-download --print "%(title)s · %(upload_date)s · '
                          f'%(channel)s · %(view_count)s views" --no-warnings '
                          f'{shlex.quote(url)}', 60)[0:3]
        head = (title or "").strip()
        return ((head + "\n\n") if head else "") + body, ""
    # no subtitles published: transcribe the audio (agent-reach, Whisper via Groq)
    rc, out, err = _sh(f'agent-reach transcribe {shlex.quote(url)}', tmo * 2)
    if rc == 0 and len(out.strip()) > MIN_BODY:
        return out, ""
    return "", f"no subtitles; transcribe rc={rc} {(err or out)[:100]}"


def door_pdf(url: str, tmo: int) -> tuple[str, str]:
    if not PDF_RE.search(url):
        return "", "not a pdf url"
    f = Path("/tmp") / f"dxbpdf-{abs(hash(url))}.pdf"
    rc, _, err = _sh(f"curl -sSL -m {tmo} -A {shlex.quote(UA)} -o {shlex.quote(str(f))} "
                     f"{shlex.quote(url)}", tmo + 5)
    if rc != 0 or not f.exists():
        return "", f"download rc={rc} {err}"
    rc, out, err = _sh(f"pdftotext -layout {shlex.quote(str(f))} -", tmo)
    f.unlink(missing_ok=True)
    return out, ("" if rc == 0 else f"pdftotext rc={rc} {err}")


# THE SITES WE READ WHILE SIGNED IN. The machine's Chrome (Profile 5) is the CEO's own and is
# already signed in to these; his standing order of 2026-09-17 is that a login wall is not a
# wall. Since 2026-09-24 they are read in the hidden research Chrome, on a copy of that profile
# (scripts/profile-sync.sh), and never in his own. Reddit, X, YouTube, Hacker News and Stack
# Overflow are read by their own adapters above, so only the ones with no adapter at all are here.
BROWSER_SITES = [
    (re.compile(r"quora\.com/", re.I), "quora"),
    (re.compile(r"facebook\.com/", re.I), "facebook"),
    (re.compile(r"instagram\.com/", re.I), "instagram"),
    (re.compile(r"linkedin\.com/", re.I), "linkedin"),
]


def door_browser(url: str, tmo: int) -> tuple[str, str]:
    """Open the page signed in, in its own window of the hidden research Chrome, and take what is
    inside it — the same extract envelope the bridge's own extract command returned.

    Measured 2026-09-17: the engine could reach Quora's SEARCH page this way (19 739 bytes of
    real answers, eight separate people) while the general chain had no route for a quora.com
    ANSWER page at all and said `no platform adapter for this url`. Being able to open one
    page of a site was never the same as being able to read the page you found.
    """
    site = next((s for rx, s in BROWSER_SITES if rx.search(url)), "")
    if not site:
        return "", "no signed-in browser site for this url"
    rc, out, err = _sh(
        f"{shlex.quote(sys.executable)} {shlex.quote(str(SKILL / 'scripts' / 'hidden.py'))} read "
        f"{shlex.quote(url)} --timeout {max(10, tmo - 5)}", tmo)
    if rc != 0:
        return "", f"{site} browser rc={rc} {err[:120]}"
    return out, ""


def sweep_stale_profiles(older_than_s: int = 3600) -> int:
    """Remove browser profiles left behind by runs that were killed before they could tidy up.

    Measured 2026-09-17: 53 of them, 134 MB, the oldest from 11:15 that morning. A `finally`
    covers the door that raises; nothing covers the door that is killed by `timeout`, so the
    next run sweeps what the last one could not. Only profiles older than an hour are touched,
    so a run happening right now is never disturbed.
    """
    # tempfile is used by the browser door's own script text, not by this module, so it is
    # imported here rather than at the top: the first version referenced it globally and the
    # whole CLI died with NameError on its first call.
    import shutil as _sh, tempfile as _tf, time as _t
    n = 0
    for d in Path(_tf.gettempdir()).glob("pw-isolated-*"):
        try:
            if d.is_dir() and _t.time() - d.stat().st_mtime > older_than_s:
                _sh.rmtree(d, ignore_errors=True)
                n += 1
        except Exception:
            pass
    return n


CHAIN = [
    # media and PDF go FIRST when the url is one - a video's subtitles and a paper's
    # text are the evidence; the page around them is furniture. Both return
    # "not a media/pdf url" instantly for everything else, so they cost nothing.
    ("media-transcript", door_media),
    ("pdf-text", door_pdf),
    ("scrapling", door_scrapling),
    ("scrapling-stealth", door_scrapling_stealth),
    ("opencli-reader", door_opencli),
    ("browser-signed-in", door_browser),
    ("tavily-extract", door_tavily),
    ("firecrawl-scrape", door_firecrawl),
    ("exa-fetch", door_exa),
    ("playwright", door_playwright),
    ("jina-reader", door_jina),
    ("curl", door_curl),
]

# THE DOOR THAT STARTS A BROWSER. `sweep.sh --no-browser` exists for the run that must not
# start one, and until 2026-09-17 it only withheld the two browser CHANNELS: the last-resort
# walk still went down this chain and reached playwright, so the flag did not mean what it
# said. A run that was told not to open a browser does not open one.
BROWSER_DOORS = {"playwright", "browser-signed-in"}


def chain_for(no_browser: bool = False) -> list:
    return [d for d in CHAIN if not (no_browser and d[0] in BROWSER_DOORS)]


# ---------------------------------------------------------------- the chain
def fetch(url: str, timeout: int = 45, stop_at: int = 0, record: bool = True,
          ledger_evidence: bool = True, no_browser: bool = False) -> dict:
    """`ledger_evidence=False` under --batch: there, ingest.py writes the evidence rows and
    keeps the CHANNEL that discovered each page. Writing them here instead would stamp every
    swept page `channel: fetch:scrapling`, and gate.py's H5 ("one door is not research")
    measures exactly that share — the repair would have manufactured its own failure."""
    attempts: list[dict] = []
    run_id = rlib.current_run_id() if record else None
    best = {"door": None, "text": "", "cached": False}

    for i, (name, fn) in enumerate(chain_for(no_browser), 1):
        if stop_at and i > stop_at:
            break
        t0 = time.time()
        try:
            text, err = fn(url, timeout)
        except Exception as e:
            text, err = "", str(e)[:150]
        ms = int((time.time() - t0) * 1000)
        walled = bool(text) and rlib.looks_like_wall(text)
        ok = _ok(text)
        attempts.append({"door": name, "ok": ok, "ms": ms, "bytes": len(text or ""),
                         "wall": walled, "error": err or None})
        if run_id:
            rlib.append_jsonl(rlib.tools_path(run_id), {
                "ts": rlib.now(), "channel": "fetch:" + name,
                "state": "returned" if ok else "failed",
                "detail": f"{url[:110]} · {len(text or '')}b"
                          + (f" · {err[:60]}" if err else "")
                          + (" · WALL" if walled else ""),
                "ms": ms})
        if ok:
            best = {"door": name, "text": text,
                    "cached": name == "jina-reader"}
            break

    got = bool(best["door"])
    any_wall = any(a["wall"] for a in attempts)
    result = {
        "url": url,
        "read": got,
        "door": best["door"],
        "cached_snapshot": best["cached"],
        "liveness": "alive" if got else ("blocked" if any_wall else "dead"),
        "doors_tried": len(attempts),
        "attempts": attempts,
        "bytes": len(best["text"]),
        "text": best["text"],
    }
    if run_id and got and ledger_evidence:
        _ledger_evidence(run_id, result)
    return result


def _ledger_evidence(run_id: str, r: dict) -> None:
    """A page this chain OPENED is an evidence row, written here, by the machine.

    Measured 2026-09-16 on run 20260916-205829: the chain read the upstream `src/index.ts`
    (37 364 bytes) and the vendor's keyless doc, both landed on disk, and `gate.py` still
    printed *"H2 required evidence type 'primary-doc|code' present 0x"* — because only
    `sweep.sh` → `ingest.py` ever wrote evidence rows, and a hand read went nowhere. The
    PostToolUse hook cannot repair it from outside: the Bash command it sees says
    `--out "$SP/verify-code.ts"`, an unexpanded shell variable it has no way to resolve. The
    only place that holds the url, the door, the liveness AND the body at once is here.
    """
    try:
        rows = rlib.ledger(run_id)
        cu = rlib.canonical_url(r["url"])
        if any(x.get("url_canonical") == cu and x.get("kind") == "evidence" for x in rows):
            return
        try:
            import ingest
            stype = ingest.classify(r["url"], "fetch",
                                    (rlib.read_state(run_id) or {}).get("subject"))
        except Exception:
            stype = "secondary"
        passage = r["text"][:6000]
        rlib.append_jsonl(rlib.ledger_path(run_id), {
            "id": "L%04d" % (len(rows) + 1), "run_id": run_id, "kind": "evidence",
            "retrieved_at": rlib.now(), "tool": "fetch.py:" + str(r["door"]),
            "channel": "fetch:" + str(r["door"]), "query_id": None,
            "gap": "read by hand through the chain",
            "url": r["url"], "url_canonical": cu,
            "domain": rlib.registrable_domain(r["url"]), "title": None,
            "author": None, "pub_date": None, "updated_date": None, "dates_agree": False,
            "version": None, "passage": passage, "passage_sha256": rlib.sha256(passage),
            "source_type": stype, "primary": stype in ("primary-doc", "code"),
            "cluster_id": None, "http_status": None, "liveness": r["liveness"],
            "bytes": r["bytes"],
            "notes": "cached snapshot" if r.get("cached_snapshot") else None,
        })
        try:
            import independence
            independence.recluster(run_id)
        except Exception:
            pass
    except Exception:
        pass          # the ledger never breaks a fetch


def main() -> int:
    ap = argparse.ArgumentParser(prog="fetch.py")
    ap.add_argument("url", nargs="?")
    ap.add_argument("--batch")
    ap.add_argument("--outdir")
    ap.add_argument("--out")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--timeout", type=int, default=45)
    ap.add_argument("--stop-at", type=int, default=0)
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--no-browser", action="store_true",
                    help="skip the door that starts a browser (a run told not to open one does not)")
    a = ap.parse_args()
    sweep_stale_profiles()

    if a.batch:
        urls = [u.strip() for u in Path(a.batch).read_text().splitlines() if u.strip()]
        outdir = Path(a.outdir or ".")
        outdir.mkdir(parents=True, exist_ok=True)
        # ingest.py maps `NN-domain.md` back to its URL through `<outdir>/urls.txt`,
        # and until 2026-09-16 only sweep.sh ever wrote that file: a hand-run batch
        # read SIX pages and produced ZERO evidence rows, silently. The batch that
        # reads the pages writes the map too -- unless it IS the file it was handed.
        umap = outdir / "urls.txt"
        try:
            same = umap.exists() and umap.resolve() == Path(a.batch).resolve()
        except OSError:
            same = False
        if not same:
            umap.write_text("\n".join(urls) + "\n", encoding="utf-8")
        results = []
        with cf.ThreadPoolExecutor(max_workers=a.workers) as ex:
            futs = {ex.submit(fetch, u, a.timeout, a.stop_at, True, False, a.no_browser): (i, u)
                    for i, u in enumerate(urls, 1)}
            for fut in cf.as_completed(futs):
                i, u = futs[fut]
                try:
                    r = fut.result()
                except Exception as e:
                    r = {"url": u, "read": False, "door": None, "liveness": "dead",
                         "attempts": [{"door": "?", "error": str(e)[:120]}], "text": ""}
                if r["read"]:
                    slug = "%02d-%s.md" % (i, re.sub(r"[^A-Za-z0-9.-]", "_",
                                                     rlib.registrable_domain(u) or "x"))
                    (outdir / slug).write_text(r["text"], encoding="utf-8")
                    r["file"] = slug
                r.pop("text", None)
                results.append(r)
        results.sort(key=lambda r: r["url"])
        (outdir / "FETCH-LOG.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
        read = sum(1 for r in results if r["read"])
        print(f"okunan {read}/{len(results)} · zincir günlüğü: {outdir}/FETCH-LOG.json")
        if read and rlib.current_run_id():
            print(f"  -> kanit satiri: python3 ingest.py {outdir.parent} "
                  f"--query \"...\" --gap \"...\"")
        for r in results:
            if not r["read"]:
                tried = " → ".join(x["door"] for x in r["attempts"])
                print(f"  OKUNAMADI {r['url'][:70]}  [{r['liveness']}]  denenen: {tried}")
        return 0

    if not a.url:
        print("usage: fetch.py <url> | fetch.py --batch urls.txt --outdir DIR", file=sys.stderr)
        return 2
    r = fetch(a.url, a.timeout, a.stop_at, no_browser=a.no_browser)
    if a.out:
        Path(a.out).write_text(r["text"], encoding="utf-8")
    if a.json:
        r.pop("text", None)
        print(json.dumps(r, ensure_ascii=False, indent=2))
    else:
        for at in r["attempts"]:
            print("  %-18s %-5s %6dms %8db%s%s" % (
                at["door"], "OK" if at["ok"] else "--", at["ms"], at["bytes"],
                "  WALL" if at["wall"] else "", f"  {at['error'][:60]}" if at["error"] else ""))
        print(f"\nread={r['read']} door={r['door']} liveness={r['liveness']} "
              f"bytes={r['bytes']}" + ("  (CACHED SNAPSHOT)" if r["cached_snapshot"] else ""))
        if not a.out:
            print("\n" + r["text"][:1500])
    return 0 if r["read"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
