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
   9. playwright headless     a real browser, isolated, never on his screen
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
# scrapling venv — headless, and in a THROWAWAY profile, because the screen belongs to him.
_PW_PY = "/home/dxb/scrapling-env/bin/python"
_PW_SCRIPT = """
import sys, tempfile
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=tempfile.mkdtemp(prefix="pw-isolated-"),
        channel="chrome", headless=True,
        args=["--no-first-run", "--no-default-browser-check"])
    pg = ctx.new_page()
    pg.goto(sys.argv[1], wait_until="domcontentloaded", timeout=int(sys.argv[2]) * 1000)
    pg.wait_for_timeout(1200)
    print(pg.evaluate("() => document.body.innerText"))
    ctx.close()
"""


def door_playwright(url: str, tmo: int) -> tuple[str, str]:
    """Headless, isolated profile, the machine's own Chrome. The screen belongs to the CEO."""
    if not Path(_PW_PY).exists():
        return "", "no playwright interpreter"
    rc, out, err = _sh(
        f"{shlex.quote(_PW_PY)} -c {shlex.quote(_PW_SCRIPT)} {shlex.quote(url)} {tmo}",
        tmo + 25)
    return out, ("" if rc == 0 else f"rc={rc} {err[-120:]}")


def door_jina(url: str, tmo: int) -> tuple[str, str]:
    rc, out, err = _sh(f"curl -sS -m {tmo} {shlex.quote('https://r.jina.ai/' + url)}", tmo + 5)
    return out, ("" if rc == 0 else f"rc={rc} {err}")


def door_curl(url: str, tmo: int) -> tuple[str, str]:
    rc, out, err = _sh(f"curl -sSL -m {tmo} -A {shlex.quote(UA)} {shlex.quote(url)}", tmo + 5)
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


CHAIN = [
    # media and PDF go FIRST when the url is one - a video's subtitles and a paper's
    # text are the evidence; the page around them is furniture. Both return
    # "not a media/pdf url" instantly for everything else, so they cost nothing.
    ("media-transcript", door_media),
    ("pdf-text", door_pdf),
    ("scrapling", door_scrapling),
    ("scrapling-stealth", door_scrapling_stealth),
    ("opencli-reader", door_opencli),
    ("tavily-extract", door_tavily),
    ("firecrawl-scrape", door_firecrawl),
    ("exa-fetch", door_exa),
    ("playwright", door_playwright),
    ("jina-reader", door_jina),
    ("curl", door_curl),
]


# ---------------------------------------------------------------- the chain
def fetch(url: str, timeout: int = 45, stop_at: int = 0, record: bool = True,
          ledger_evidence: bool = True) -> dict:
    """`ledger_evidence=False` under --batch: there, ingest.py writes the evidence rows and
    keeps the CHANNEL that discovered each page. Writing them here instead would stamp every
    swept page `channel: fetch:scrapling`, and gate.py's H5 ("one door is not research")
    measures exactly that share — the repair would have manufactured its own failure."""
    attempts: list[dict] = []
    run_id = rlib.current_run_id() if record else None
    best = {"door": None, "text": "", "cached": False}

    for i, (name, fn) in enumerate(CHAIN, 1):
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
    a = ap.parse_args()

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
            futs = {ex.submit(fetch, u, a.timeout, a.stop_at, True, False): (i, u)
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
    r = fetch(a.url, a.timeout, a.stop_at)
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
