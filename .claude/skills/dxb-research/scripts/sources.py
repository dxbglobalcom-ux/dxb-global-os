#!/usr/bin/env python3
"""ONE NUMBERED SOURCE REGISTRY PER RUN — the id space every `[n]` in an answer points into.

WHY. The answer the CEO rejected on 2026-09-20 carried ZERO inline citations and dumped 102
addresses into a trailing section, so not one of its sentences could be traced to the page it
came from. Perplexity's own documentation names the other half of that fault: citation numbers
must come from ONE id space accumulated across every search batch — number only the first batch
and the citations "look hallucinated". This file builds that id space from what the run left on
disk, and from nothing else. cite-check.py and render.py read it; neither invents an id.

    sources.py <run-dir> [--out sources.json] [--force]   (default: <run-dir>/sources.json)

ID 1 IS THE RUN'S OWN COUNT when it has one (SUMMARY.txt's INSAN line, else crowd.sh's
CROWD-COUNT row): kind "count", a run-relative path instead of a URL. The web sources follow
from id 2. An existing, different sources.json is never overwritten without --force.

THE ORDER IS THE NUMBERING — first seen, first id — so the files are read in a fixed order:
    1. HUNTER-*.md          what the hunters cite: the ids an answer uses most get small numbers
    2. KAYNAKLAR*           the run's own address list
    3. crowd output         crowd-urls.txt, crowd-dates.tsv, crowd/ (CROWD.txt, threads/)
    4. ground*/             the channel files (*.raw), the site pages (*.md), pages/
    5. work-*/              the hunters' own work folders
    6. everything else readable that is not an answer, a prompt, a log or a transcript
Same run folder in, byte-identical sources.json out: nothing here reads a clock or the network.

WHAT IS NOT A SOURCE, and is counted rather than silently lost: a page's furniture (an image,
script or font file, an image CDN, a share / sign-in button, an XML namespace), a search
engine's own result or captcha page (a door, not a source), and an address that does not parse.
In a JSON answer only the results' own addresses count (link keys, and links inside prose) —
never the identifiers of its metadata. All three are printed on the summary line.
"""
from __future__ import annotations

import argparse
import datetime as _dt
import importlib.util
import json
import re
import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import rlib  # noqa: E402  — canonical_url + the tracking-parameter list have ONE owner
import threaddates  # noqa: E402  — the thread date harvested from the ground


def _load_merge():
    spec = importlib.util.spec_from_file_location("dxb_fleet_merge", HERE.parent / "fleet" / "merge.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MERGE = _load_merge()
# What a URL looks like inside a run file is merge.py's to decide — the fleet counts the
# addresses a hunter touched with this pattern, and the registry must see the same ones.
URL_RE = MERGE.URL

# ------------------------------------------------------------------ one URL, one key
_TAIL_JUNK = ".,;:!?*_~'\"“”‘’»«…)]}>|"
_CJK_STOP = re.compile(r"[，。、；：！？（）「」『』【】《》　]|\*\*")
REDDIT_HOSTS = {"reddit.com", "old.reddit.com", "np.reddit.com", "m.reddit.com",
                "new.reddit.com", "amp.reddit.com", "sh.reddit.com", "i.reddit.com"}
TWITTER_HOSTS = {"twitter.com", "mobile.twitter.com", "m.twitter.com", "x.com", "mobile.x.com"}
YOUTUBE_HOSTS = {"youtube.com", "m.youtube.com", "music.youtube.com"}
ASSET_EXT = re.compile(r"\.(png|jpe?g|gif|webp|svg|ico|bmp|avif|heic|css|js|mjs|map|woff2?|ttf|otf|eot|"
                       r"mp4|webm|m3u8|mp3|m4a|wav|ogg)$", re.I)
ASSET_HOSTS = {"i.redd.it", "preview.redd.it", "external-preview.redd.it", "styles.redditmedia.com",
               "a.thumbs.redditmedia.com", "b.thumbs.redditmedia.com", "emoji.redditmedia.com",
               "pbs.twimg.com", "video.twimg.com", "abs.twimg.com", "i.ytimg.com", "yt3.ggpht.com",
               "yt3.googleusercontent.com", "avatars.githubusercontent.com",
               "user-images.githubusercontent.com", "private-user-images.githubusercontent.com",
               "camo.githubusercontent.com", "media2.dev.to", "dev-to-uploads.s3.amazonaws.com",
               "fonts.googleapis.com", "fonts.gstatic.com", "gstatic.com", "encrypted-tbn0.gstatic.com",
               "external-content.duckduckgo.com", "wa.me", "s2f.kytta.dev",
               # XML namespaces and schema ids: markup, never a page anybody read
               "w3.org", "a9.com", "purl.org", "schema.org", "ogp.me", "xmlns.com"}
# image / script CDNs, matched on the registrable domain
ASSET_DOMAINS = {"twimg.com", "ytimg.com", "ggpht.com", "redditmedia.com", "redditstatic.com",
                 "rednotecdn.com", "xhscdn.com", "sinaimg.cn", "hdslb.com", "zhimg.com", "gstatic.com",
                 "fbcdn.net", "cdninstagram.com", "licdn.com", "githubassets.com", "gravatar.com",
                 "googletagmanager.com", "google-analytics.com", "doubleclick.net"}
# a page's buttons: share, sign-in, account — furniture, not a page
FURNITURE_PATH = re.compile(r"^/(share|sharer(\.php)?|sharearticle|intent/(tweet|post)|submit|submitlink|"
                            r"pin/create|send|login|log-in|signin|sign-in|signup|sign-up|register|logout|"
                            r"account|settings|password)(/|$)", re.I)
# A search engine's own result / captcha page. The CEO report of 2026-09-20 said it itself:
# an engine is a door, not a source — and google.raw once carried google.com/sorry as a "url".
SEARCH_PAGE = re.compile(r"^(?:(?:[a-z]+\.)?google\.[a-z.]+/(?:search|sorry|webhp)|bing\.com/search|"
                         r"(?:html\.|lite\.)?duckduckgo\.com/(?:html/?|lite/?)?(?:\?|$)|"
                         r"search\.yahoo\.com/search|yandex\.[a-z.]+/search|baidu\.com/s(?:\?|$)|"
                         r"search\.brave\.com/search|startpage\.com/)", re.I)


def clean_tail(raw: str) -> str:
    u = _CJK_STOP.split(raw.strip(), 1)[0]
    while u and u[-1] in _TAIL_JUNK:
        if u[-1] == ")" and u.count("(") >= u.count(")"):
            break                       # a balanced ")" belongs to the address
        u = u[:-1]
    return u


def reject(u: str) -> str | None:
    """Why an address is not a source: 'invalid' · 'furniture' · 'search-page' — or None."""
    try:
        s = urlsplit(u)
        # a port that is not a number is an address that does not parse — measured 2026-09-24: a
        # README's "http://127.0.0.1:PORT/v1/chat/completions" in twitter.raw raised here and
        # killed a whole quick run (exit 4) instead of being counted as invalid
        s.port
    except ValueError:
        return "invalid"
    host = (s.hostname or "").lower().rstrip(".") if s.scheme.lower() in ("http", "https") else ""
    if not host or "." not in host:
        return "invalid"
    if host.startswith("www."):
        host = host[4:]
    if host in ASSET_HOSTS or ASSET_EXT.search(s.path or "") or FURNITURE_PATH.match(s.path or "") \
            or ".".join(host.split(".")[-2:]) in ASSET_DOMAINS:
        return "furniture"
    if SEARCH_PAGE.match(host + (s.path or "/") + ("?" + s.query if s.query else "")):
        return "search-page"
    return None


def canon(raw: str) -> tuple[str, str] | None:
    """(dedup key, display url) — or None when the address is not a source at all.

    One thread is one source whatever form the run wrote it in: scheme, `www.`, a trailing
    slash, a fragment and utm_/fbclid/ref noise never make a second id; old./np./m. reddit are
    www.reddit, twitter.com is x.com, youtu.be is youtube.com/watch. A reddit thread with and
    without its title slug is ONE thread — the 2026-09-20 list counted r/Anthropic 1w7yz5s
    twice for exactly that reason — and x.com/i/status/N is the same post as x.com/<user>/status/N.
    """
    u = clean_tail(raw)
    if reject(u):
        return None
    s = urlsplit(u)
    host = (s.hostname or "").lower().rstrip(".")
    if host.startswith("www."):
        host = host[4:]
    q = parse_qsl(s.query, keep_blank_values=True)
    # a google redirect wrapper is the page it points at
    if re.match(r"^(?:[a-z]+\.)?google\.[a-z.]+$", host) and s.path == "/url":
        for k, v in q:
            if k in ("q", "url") and v.startswith("http"):
                return canon(v)
    port = f":{s.port}" if s.port and s.port not in (80, 443) else ""
    base = rlib.canonical_url(urlunsplit(("https", host + port, s.path or "/", s.query, "")))
    b = urlsplit(base)
    host, path = (b.hostname or host), (b.path or "/")
    q = parse_qsl(b.query, keep_blank_values=True)
    if host in REDDIT_HOSTS:
        host = "www.reddit.com"
    elif host in TWITTER_HOSTS:
        host, q = "x.com", []
    elif host == "youtu.be":
        vid = path.strip("/").split("/")[0]
        host, path, q = "youtube.com", "/watch", [("v", vid)]
    elif host in YOUTUBE_HOSTS:
        host = "youtube.com"
        if path == "/watch":
            q = [(k, v) for k, v in q if k == "v"]
        elif path.startswith("/embed/"):
            path, q = "/watch", [("v", path.split("/")[2])]
    elif host == "news.ycombinator.com" and path == "/item":
        q = [(k, v) for k, v in q if k == "id"]
    display = urlunsplit(("https", host + port, path, urlencode(q), ""))
    key = display
    m = re.match(r"^/r/([^/]+)/comments/([a-z0-9]+)(?:/[^/]*)?(/.*)?$", path, re.I)
    if host == "www.reddit.com" and m:
        key = f"https://www.reddit.com/r/{m[1].lower()}/comments/{m[2].lower()}{(m[3] or '').rstrip('/')}"
    m = re.match(r"^/(?:[^/]+|i/web)/status(?:es)?/(\d+)", path)
    if host == "x.com" and m:
        key = f"https://x.com/i/status/{m[1]}"
    return key, display


def domain_of(url: str) -> str:
    host = (urlsplit(url).hostname or "").lower()
    return host[4:] if host.startswith("www.") else host


# ------------------------------------------------------------------ kind of source
# policies/source-hierarchy.md: first-hand accounts (human) · measures (benchmarks, registry
# stats, papers) · the vendor's own pages · press · everything else. A vendor's FORUM is its
# users talking, so community./forum. hosts are people before they are the vendor.
HUMAN = {"reddit.com", "news.ycombinator.com", "lobste.rs", "x.com", "threads.net", "bsky.app",
         "mastodon.social", "facebook.com", "instagram.com", "tiktok.com", "youtube.com",
         "bilibili.com", "b23.tv", "zhihu.com", "zhuanlan.zhihu.com", "v2ex.com", "linux.do",
         "juejin.cn", "quora.com", "stackoverflow.com", "stackexchange.com", "superuser.com",
         "serverfault.com", "askubuntu.com", "discord.com", "t.me", "weibo.com", "weibo.cn",
         "douban.com", "xiaohongshu.com", "rednote.com", "tieba.baidu.com", "producthunt.com",
         "g2.com", "capterra.com", "trustpilot.com", "eksisozluk.com", "technopat.net",
         "gutefrage.net", "4chan.org", "lemmy.world", "hn.algolia.com", "reddit.sentinel-team.org",
         "linkedin.com", "tildes.net", "slashdot.org"}
MEASURE = {"artificialanalysis.ai", "lmarena.ai", "arena.ai", "openrouter.ai", "paperswithcode.com",
           "livebench.ai", "swebench.com", "epoch.ai", "epochai.org", "llm-stats.com", "arxiv.org",
           "openreview.net", "aclanthology.org", "crossref.org", "api.crossref.org", "openalex.org",
           "api.openalex.org", "europepmc.org", "semanticscholar.org", "ncbi.nlm.nih.gov",
           "npmjs.com", "pypi.org", "pypistats.org", "npmtrends.com", "star-history.com",
           "trends.google.com", "similarweb.com", "survey.stackoverflow.co", "statista.com",
           "ourworldindata.org", "kaggle.com", "scale.com", "vellum.ai", "aider.chat",
           "terminal-bench.com", "tbench.ai", "osworld.github.io", "gpqa.org"}
VENDOR = {"openai.com", "platform.openai.com", "help.openai.com", "chatgpt.com", "anthropic.com",
          "docs.anthropic.com", "claude.ai", "claude.com", "platform.claude.com", "support.anthropic.com",
          "ai.google.dev", "deepmind.google", "blog.google", "gemini.google.com", "developers.googleblog.com",
          "x.ai", "mistral.ai", "meta.ai", "ai.meta.com", "deepseek.com", "qwen.ai", "alibabacloud.com",
          "moonshot.cn", "kimi.com", "z.ai", "zhipuai.cn", "cursor.com", "cursor.sh", "windsurf.com",
          "codeium.com", "github.blog", "docs.github.com", "microsoft.com", "azure.microsoft.com",
          "aws.amazon.com", "cloud.google.com", "nvidia.com", "apple.com", "jetbrains.com",
          "replit.com", "vercel.com", "perplexity.ai", "cohere.com", "huggingface.co"}
PRESS = {"techcrunch.com", "theverge.com", "wired.com", "arstechnica.com", "reuters.com",
         "bloomberg.com", "zdnet.com", "venturebeat.com", "businessinsider.com", "cnbc.com",
         "nytimes.com", "wsj.com", "ft.com", "theinformation.com", "axios.com", "engadget.com",
         "tomshardware.com", "techradar.com", "theregister.com", "infoq.com", "heise.de", "golem.de",
         "t3n.de", "spiegel.de", "zeit.de", "faz.net", "36kr.com", "ithome.com", "sina.com.cn",
         "qq.com", "sohu.com", "163.com", "jiqizhixin.com", "qbitai.com", "webtekno.com",
         "shiftdelete.net", "donanimhaber.com", "chip.com.tr", "hurriyet.com.tr", "milliyet.com.tr",
         "sozcu.com.tr", "bbc.com", "bbc.co.uk", "theguardian.com", "cnn.com", "forbes.com",
         "fortune.com", "time.com", "economist.com", "apnews.com", "washingtonpost.com",
         "semafor.com", "platformer.news", "404media.co", "the-decoder.com", "datacamp.com",
         "analyticsvidhya.com", "marktechpost.com", "tomsguide.com", "pcmag.com", "cnet.com"}


def kind_of(url: str) -> str:
    host = domain_of(url)
    path = urlsplit(url).path.lower()
    reg = rlib.registrable_domain(url)
    if re.match(r"^(forum|forums|community|discuss|discourse)\.", host) or \
            re.search(r"/(forum|forums|community|discussions?)(/|$)", path):
        return "human"
    if host in HUMAN or reg in HUMAN:
        return "human"
    if host == "github.com":
        return "human" if re.search(r"^/[^/]+/[^/]+/(issues|pull|discussions|commit)", path) else "other"
    if host in MEASURE or reg in MEASURE or re.search(r"/(leaderboards?|benchmarks?)(/|$)", path):
        return "measure"
    if host in VENDOR or reg in VENDOR:
        return "vendor"
    if host in PRESS or reg in PRESS:
        return "press"
    return "other"


# ------------------------------------------------------------------ which files, in what order
HARVEST_EXT = {".md", ".txt", ".tsv", ".raw", ".yaml", ".yml", ".json", ".csv"}
# The answer and everything written ABOUT the run is not the run: a previous report
# (CEO-RAPORU), the prompts, the merge summary (it truncates addresses at 110 characters),
# the logs (crowd.log truncates them at 60) and the transcripts are never harvested. Nor is
# Perplexity's answer as its page drew it (pplx-raw.md): its citations are KAYNAKLAR.txt's rows,
# and its HTML cut "…/wiki/Claude_(language_model)" at the ")" into a second, broken source.
EXCLUDE_NAME = re.compile(r"^(answer.*\.md|final.*\.md|.*rapor.*\.md|summary\.txt|question\.txt|"
                          r"prompt-.*|cite-check.*|sources.*\.json|citations.*\.json|pplx-raw\.md)$", re.I)
MAX_BYTES = 16 * 1024 * 1024


def _natural(p: Path):
    m = re.search(r"(\d+)$", p.name)
    return (int(m.group(1)) if m else 1, p.name)


def harvestable(p: Path, run: Path) -> bool:
    try:
        rel = p.relative_to(run)
    except ValueError:
        return False
    if any(part.startswith(".") or part == "__pycache__" for part in rel.parts):
        return False
    return p.is_file() and p.suffix.lower() in HARVEST_EXT and not EXCLUDE_NAME.match(p.name)


def run_files(run: Path) -> list[Path]:
    out: list[Path] = []
    seen: set[Path] = set()

    def add(paths):
        for p in paths:
            if p not in seen and harvestable(p, run):
                seen.add(p)
                out.append(p)

    add(sorted(run.glob("HUNTER-*.md")))
    add(sorted(run.glob("KAYNAKLAR*")))
    add([run / "crowd-urls.txt", run / "crowd-dates.tsv"])
    crowd = run / "crowd"
    if crowd.is_dir():
        th = crowd / "threads"
        add([crowd / "CROWD.txt", th / "INDEX.tsv", th / "DATES.tsv"])
        add(sorted(th.glob("*.yaml")) + sorted(th.glob("*.md")) + sorted(crowd.rglob("*")))
    for g in sorted((d for d in run.glob("ground*") if d.is_dir()), key=_natural):
        add([g / "pages" / "urls.txt", g / "pages" / "FETCH-LOG.json"])
        add(sorted(g.glob("*.raw")) + sorted(g.glob("*.md")) + sorted((g / "pages").glob("*.md")))
        add(sorted(g.rglob("*")))
    for w in sorted(d for d in run.glob("work-*") if d.is_dir()):
        add(sorted(w.rglob("*")))
    add(sorted(run.rglob("*")))
    return out


# ------------------------------------------------------------------ titles and dates
def _date(v) -> str | None:
    """An absolute calendar date, or None. "23 saat önce" is not a date."""
    if v is None:
        return None
    if isinstance(v, (int, float)) or (isinstance(v, str) and re.fullmatch(r"\d{9,10}", v.strip())):
        try:
            return _dt.datetime.fromtimestamp(int(v), _dt.timezone.utc).strftime("%Y-%m-%d")
        except (ValueError, OSError, OverflowError):
            return None
    s = str(v).strip().strip("'\"")
    m = re.match(r"^((?:19|20)\d\d)-(\d\d)-(\d\d)", s)
    if m:
        return f"{m[1]}-{m[2]}-{m[3]}"
    try:  # twitter: "Tue Sep 22 18:52:14 +0000 2026"
        return _dt.datetime.strptime(s, "%a %b %d %H:%M:%S %z %Y").strftime("%Y-%m-%d")
    except ValueError:
        return None


DATE_KEYS = ("created_utc", "created_at", "publish_date", "published_date", "published",
             "datepublished", "pub_date", "date")


def _clean_title(t) -> str | None:
    if not isinstance(t, str):
        return None
    t = re.sub(r"\s+", " ", t.strip().strip("'\"")).replace("''", "'")
    if len(t) < 3 or t.lower().startswith(("http://", "https://")):
        return None
    return t[:300]


def records_yaml(text: str):
    """(url, title, date) from the `- key: value` records the opencli channels write."""
    rec: dict = {}
    lines = text.splitlines()

    def flush():
        if rec.get("url"):
            yield rec.get("url"), rec.get("title"), rec.get("date")

    i = 0
    while i < len(lines):
        ln = lines[i]
        m = re.match(r"^(- |  )([A-Za-z_]+):\s?(.*)$", ln)
        if ln.startswith("- "):
            yield from flush()
            rec = {}
        if m:
            key, val = m.group(2).lower(), m.group(3).strip()
            if val in (">-", "|-", ">", "|"):
                parts = []
                while i + 1 < len(lines) and lines[i + 1].startswith("    "):
                    i += 1
                    parts.append(lines[i].strip())
                val = " ".join(parts)
            if key == "url" and val.startswith("http") and "url" not in rec:
                rec["url"] = val.strip("'\"")
            elif key == "title" and "title" not in rec:
                rec["title"] = _clean_title(val)
            elif key in DATE_KEYS and not rec.get("date"):
                rec["date"] = _date(val)
        i += 1
    yield from flush()


def records_json(obj):
    """(url, title, date) from every JSON object that carries a url (parallel, firecrawl, FETCH-LOG)."""
    stack = [obj]
    while stack:
        o = stack.pop(0)
        if isinstance(o, dict):
            u = o.get("url")
            if isinstance(u, str) and u.startswith("http"):
                d = None
                for k, v in o.items():
                    if str(k).lower() in DATE_KEYS:
                        d = d or _date(v)
                yield u, _clean_title(o.get("title")), d
            stack.extend(v for v in o.values() if isinstance(v, (dict, list)))
        elif isinstance(o, list):
            stack.extend(o)


# WHICH URLS IN A JSON ANSWER ARE RESULTS. Measured 2026-09-24 on a four-ground fleet run: read
# as plain text, ONE openalex answer put 4 592 author, institution and concept identifiers into
# the registry (7 998 ids, most of them nobody's source). A result's address sits under a link
# key; a link inside prose sits under a text key. Everything else in the answer is metadata.
LINK_KEY = re.compile(r"(?i)^(url|uri|link|href|doi|permalink|website)$|(url|_link|_href)$")
NOT_LINK_KEY = re.compile(r"(?i)next|prev|self|api|image|img|thumb|icon|avatar|logo|favicon|media|"
                          r"video|poster|preview|banner|profile")
TEXT_KEY = re.compile(r"(?i)^(content|markdown|text|snippets?|excerpts?|description|body|selftext|"
                      r"summary|abstract|highlights|raw_content|answer)$")


def json_values(text: str) -> list | None:
    """Every JSON value in the file — a door can print two objects back to back — or None."""
    dec, i, out = json.JSONDecoder(), 0, []
    while True:
        while i < len(text) and text[i].isspace():
            i += 1
        if i >= len(text):
            return out
        try:
            obj, i = dec.raw_decode(text, i)
        except ValueError:
            return None
        out.append(obj)


def json_urls(obj, key: str = "") -> list[str]:
    if isinstance(obj, dict):
        return [u for k, v in obj.items() for u in json_urls(v, str(k))]
    if isinstance(obj, list):
        return [u for v in obj for u in json_urls(v, key)]
    if not isinstance(obj, str):
        return []
    if TEXT_KEY.match(key):
        return URL_RE.findall(obj)
    if LINK_KEY.search(key) and not NOT_LINK_KEY.search(key) and obj.startswith("http"):
        m = URL_RE.match(obj)
        return [m.group(0)] if m else []
    return []


def file_urls(f: Path, text: str) -> tuple[list[str], list]:
    """(the urls in this file in reading order, its JSON values or [])."""
    if f.suffix.lower() in (".json", ".raw") and text.lstrip()[:1] in ("[", "{"):
        vals = json_values(text)
        if vals is not None:
            return [u for v in vals for u in json_urls(v)], vals
    return URL_RE.findall(text), []


EXA_REC = re.compile(r"^Title:\s*(.+)\nURL:\s*(\S+)(?:\n(?:Published(?: Date)?):\s*(\S+))?", re.M)
MD_LINK = re.compile(r"\[([^\]\n]{3,200})\]\((https?://[^)\s]+)\)")
ISO = re.compile(r"(?<!\d)((?:19|20)\d\d-\d\d-\d\d)(?!\d)")
CROWD_HEAD = re.compile(r"^===== (\S+)\s+\[BASLIK TARIHI: ([^\]]+)\]", re.M)


# ------------------------------------------------------------------ page bodies on disk
def body_files(run: Path) -> dict[str, list[Path]]:
    """key -> the page bodies this run read for that address (fetch.py pages, crowd threads)."""
    out: dict[str, list[Path]] = {}

    def put(url, f: Path):
        # the same pattern as the harvest: crowd's INDEX rows carry a literal `)\n\n122` tail
        m = URL_RE.search(url or "")
        c = canon(m.group(0)) if m else None
        if c and f.is_file() and f.stat().st_size > 0 and f not in out.setdefault(c[0], []):
            out[c[0]].append(f)

    for log in sorted(run.rglob("FETCH-LOG.json")):
        try:
            rows = json.loads(log.read_text(encoding="utf-8-sig", errors="replace"))
        except (OSError, ValueError):
            rows = []
        for r in rows if isinstance(rows, list) else []:
            if isinstance(r, dict) and r.get("file") and r.get("url"):
                put(r["url"], log.parent / r["file"])
    for ul in sorted(run.rglob("urls.txt")):
        pages = {p.name.split("-", 1)[0]: p for p in ul.parent.glob("[0-9][0-9]-*.md")}
        if not pages:
            continue
        for i, u in enumerate(ul.read_text(encoding="utf-8-sig", errors="replace").splitlines(), 1):
            if u.strip() and "%02d" % i in pages:
                put(u.strip(), pages["%02d" % i])
    for idx in sorted(run.rglob("INDEX.tsv")):
        for row in idx.read_text(encoding="utf-8-sig", errors="replace").splitlines():
            h, _, u = row.partition("\t")
            if h and u:
                put(u.strip(), idx.parent / f"{h}.yaml")
                put(u.strip(), idx.parent / f"{h}.md")
    return out


def crowd_blocks(run: Path) -> dict[str, str]:
    """key -> the comments crowd.sh wrote for that thread in CROWD.txt (`author | score | text`)."""
    out: dict[str, str] = {}
    for cf in sorted(run.rglob("CROWD.txt")):
        text = cf.read_text(encoding="utf-8-sig", errors="replace")
        heads = list(re.finditer(r"^===== (\S+)", text, re.M))
        for i, h in enumerate(heads):
            end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
            u = URL_RE.search(h.group(1))
            c = canon(u.group(0)) if u else None
            if c:
                out[c[0]] = out.get(c[0], "") + text[h.start():end]
    return out


def body_texts(run: Path | None) -> dict[str, list[tuple[str, str]]]:
    """key -> [(label, text)] — what cite-check re-reads before it ever touches the network."""
    if not run:
        return {}
    out: dict[str, list[tuple[str, str]]] = {}
    for key, block in crowd_blocks(run).items():
        out.setdefault(key, []).append(("disk:CROWD.txt", block))
    for key, files in body_files(run).items():
        for f in files:
            out.setdefault(key, []).append(("disk:" + f.relative_to(run).as_posix(),
                                            f.read_text(encoding="utf-8-sig", errors="replace")))
    return out


def _body_title(text: str) -> str | None:
    lines = text.splitlines()[:80]
    for i, ln in enumerate(lines):
        m = re.match(r"^#\s+(.+)$", ln)
        if m:
            return _clean_title(m.group(1))
        if i and re.match(r"^={3,}\s*$", ln) and lines[i - 1].strip():
            return _clean_title(lines[i - 1])
    return None


# ------------------------------------------------------------------ the registry
def build(run: Path) -> dict:
    order: list[str] = []
    variants: dict[str, list[str]] = {}
    seen_in: dict[str, list[str]] = {}
    titles: dict[str, tuple[int, int, str]] = {}
    dates: dict[str, tuple[int, str]] = {}
    dropped = {"furniture": 0, "search-page": 0, "invalid": 0}
    tick = 0

    def title(url, t, prio):
        nonlocal tick
        c = canon(url) if url else None
        t = _clean_title(t)
        if c and t:
            tick += 1
            if c[0] not in titles or (prio, tick) < titles[c[0]][:2]:
                titles[c[0]] = (prio, tick, t)

    def date(url, d, prio, earliest=False):
        c = canon(url) if url else None
        d = _date(d)
        if not (c and d):
            return
        old = dates.get(c[0])
        if old is None or prio < old[0] or (earliest and prio == old[0] and d < old[1]):
            dates[c[0]] = (prio, d)

    for f in run_files(run):
        if f.stat().st_size > MAX_BYTES:
            print(f"sources: {f.relative_to(run)} is over {MAX_BYTES} bytes — skipped", file=sys.stderr)
            continue
        rel = f.relative_to(run).as_posix()
        text = f.read_text(encoding="utf-8-sig", errors="replace")
        urls, jvals = file_urls(f, text)
        for raw in urls:
            c = canon(raw)
            if c is None:
                dropped[reject(clean_tail(raw)) or "invalid"] += 1
                continue
            key, disp = c
            if key not in variants:
                order.append(key)
                variants[key] = []
                seen_in[key] = []
            if disp not in variants[key]:
                variants[key].append(disp)
            if rel not in seen_in[key]:
                seen_in[key].append(rel)
        # structured rows: titles and dates the run itself wrote down
        name, suf = f.name, f.suffix.lower()
        for u, t, d in records_json(jvals):
            title(u, t, 1)
            date(u, d, 3)
        if suf in (".raw", ".yaml", ".yml") and not jvals:
            for u, t, d in records_yaml(text):
                title(u, t, 1)
                date(u, d, 3)
            for u, d in threaddates.dates_in(text).items():
                date(u, d, 1)
        for m in EXA_REC.finditer(text):
            title(m.group(2), m.group(1), 1)
            date(m.group(2), m.group(3), 3)
        if name.endswith(".tsv") and "DATES" in name.upper() or name == "crowd-dates.tsv":
            for row in text.splitlines():
                u, _, d = row.partition("\t")
                date(u.strip(), d.strip(), 2)
        if name == "CROWD.txt":
            for m in CROWD_HEAD.finditer(text):
                date(m.group(1), m.group(2), 2)
        if name.startswith(("HUNTER-", "KAYNAKLAR")):
            for m in MD_LINK.finditer(text):
                title(m.group(2), m.group(1), 2)
            # A HUNTER'S ROW: one address and one ISO date on the same line is that thread's
            # date as the hunter wrote it — a claim, so it ranks below every machine row, and
            # the earliest one wins (a comment is never older than its thread).
            for line in text.splitlines():
                valid = [u for u in URL_RE.findall(line) if canon(u)]
                ds = set(ISO.findall(line))
                if len({canon(u)[0] for u in valid}) == 1 and len(ds) == 1:
                    date(valid[0], ds.pop(), 5, earliest=True)
    # the page bodies the run read: their size, and the heading they carry
    bytes_read: dict[str, int] = {}
    for key, files in body_files(run).items():
        bytes_read[key] = max(f.stat().st_size for f in files)
        for f in files:
            if f.suffix == ".md":
                title(key, _body_title(f.read_text(encoding="utf-8-sig", errors="replace")), 4)
    for key, block in crowd_blocks(run).items():
        bytes_read[key] = max(bytes_read.get(key, 0), len(block.encode("utf-8")))

    # THE RUN'S OWN COUNT IS A SOURCE TOO (chief's decision, 2026-09-24): "82 ayrı kişi" is cited
    # like every other claim, and the thing it cites is the file that holds the machine count.
    # It always takes id 1 when the run has a count, so its number never depends on the web's.
    count = count_source(run)
    sources = [count] if count else []
    for i, key in enumerate(order, len(sources) + 1):
        disp = max(variants[key], key=len)          # the most informative form of the same address
        sources.append({
            "id": i, "url": disp, "domain": domain_of(disp),
            "title": titles[key][2] if key in titles else None,
            "date": dates[key][1] if key in dates else None,
            "kind": kind_of(disp), "bytes_read": bytes_read.get(key, 0),
            "seen_in": seen_in[key],
        })
    by_kind: dict[str, int] = {}
    for s in sources:
        by_kind[s["kind"]] = by_kind.get(s["kind"], 0) + 1
    return {"count": len(sources), "by_kind": dict(sorted(by_kind.items())),
            "dropped": dropped, "sources": sources}


def load(path) -> list[dict]:
    """The registry's entries, whichever shape the file was written in — or a one-line exit."""
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8-sig", errors="replace"))
    except (OSError, ValueError) as e:
        raise SystemExit(f"sources: cannot read {path}: {str(e)[:120]}")
    if isinstance(data, dict):
        data = data.get("sources", [])
    if not isinstance(data, list):
        raise SystemExit(f"sources: {path} holds no list of sources")
    return [s for s in data if isinstance(s, dict) and str(s.get("id", "")).isdigit()]


# ------------------------------------------------------------------ the run's machine count
# ONE OWNER: cite-check's R5 and this registry read the count the same way. SUMMARY.txt carries
# merge.py's INSAN line; crowd-count.txt / crowd.log carry crowd.sh's own CROWD-COUNT row.
INSAN = re.compile(r"INSAN \(sayildi\):\s*([\d.,]+)\s*ayri kisi(?:\s*·\s*([\d.,]+)\s*yorum)?"
                   r"(?:\s*·\s*([\d.,]+)\s*baslik)?")
COUNT_FILES = ("SUMMARY.txt", "crowd-count.txt", "crowd.log")
COUNT_TITLE = "Bu koşunun makine sayımı (crowd.sh)"


def machine_counts(run: Path | None) -> tuple[dict[str, set[int]], list[str]]:
    """{'people': {82}, 'comments': {166}, 'threads': {6}} and the files they were read from."""
    counts: dict[str, set[int]] = {"people": set(), "comments": set(), "threads": set()}
    where: list[str] = []
    if not run:
        return counts, where
    sm = run / "SUMMARY.txt"
    if sm.is_file():
        m = INSAN.search(sm.read_text(encoding="utf-8-sig", errors="replace"))
        if m:
            for k, g in zip(("people", "comments", "threads"), m.groups()):
                if g:
                    counts[k].add(int(re.sub(r"[.,]", "", g)))
            where.append("SUMMARY.txt")
    for name in COUNT_FILES[1:]:
        cc = MERGE.crowd_count(run / name) if (run / name).is_file() else None
        if cc:
            counts["comments"].add(cc[0]); counts["people"].add(cc[1]); counts["threads"].add(cc[2])
            where.append(name)
    return counts, where


def count_source(run: Path) -> dict | None:
    """The registry entry for the run's own count: a run-relative file, never a URL."""
    _, where = machine_counts(run)
    if not where:
        return None
    name = where[0]                       # SUMMARY.txt first: it is the file keep.sh keeps
    return {"id": 1, "url": name, "domain": None, "title": COUNT_TITLE, "date": None,
            "kind": "count", "bytes_read": (run / name).stat().st_size, "seen_in": [name]}


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(prog="sources.py", description="one numbered source registry per run")
    ap.add_argument("run_dir")
    ap.add_argument("--out", help="default: <run-dir>/sources.json")
    ap.add_argument("--force", action="store_true",
                    help="replace an existing, different sources.json (its ids may already be cited)")
    a = ap.parse_args(argv)
    run = Path(a.run_dir).resolve()
    if not run.is_dir():
        print(f"sources: no such run folder: {run}", file=sys.stderr)
        return 2
    reg = build(run)
    out = Path(a.out) if a.out else run / "sources.json"
    new = json.dumps(reg, ensure_ascii=False, indent=1) + "\n"
    kinds = " · ".join(f"{k} {n}" for k, n in reg["by_kind"].items())
    line = (f"sources: {reg['count']} ({kinds}) · with a body on disk "
            f"{sum(1 for s in reg['sources'] if s['bytes_read'])} · dated "
            f"{sum(1 for s in reg['sources'] if s['date'])} · not a source: "
            f"{reg['dropped']['furniture']} furniture, {reg['dropped']['search-page']} search page, "
            f"{reg['dropped']['invalid']} invalid")
    # AN ANSWER MAY ALREADY CITE THESE IDS. A kept run folder carries its sources.json beside the
    # answer that points into it; rewriting it with different ids would silently re-point every
    # [n]. The same registry again is fine; a different one needs --force.
    if out.exists() and not a.force:
        if out.read_text(encoding="utf-8-sig", errors="replace") == new:
            print(f"{line} -> {out} (unchanged)")
            return 0
        print(f"sources: {out} already exists and differs — ids an answer cites could move; "
              f"not overwritten (use --force)", file=sys.stderr)
        return 1
    out.write_text(new, encoding="utf-8")
    print(f"{line} -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
