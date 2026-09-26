#!/usr/bin/env python3
"""ONE CLASSIFIER — which platform an address belongs to, and the one form it is counted in.

WHY IT EXISTS. The deep answer the CEO rejected on 2026-09-24 had X 0 · YouTube 0 · Reddit 12 of 22
sources, and nothing in the engine could print that before he saw it: the addresses were counted
by DOMAIN (sources.json), never by the platform a person means when he says "X". Plan v2 (B56)
counts found / read / cited PER PLATFORM — the hunters are owned by platform, the coverage table
(kapsama.py) prints one row per platform — so the answer to "which platform is this address" has
exactly one owner, here. evidence.py stamps it on every row; kapsama.py counts by it.

THE NAMES are the contract's (EVIDENCE-B56-2026-09-26.md, "Platform names"):
    x · youtube · tiktok · instagram · facebook · linkedin · reddit · hackernews · github ·
    bluesky · threads · quora · stackoverflow · chinese · medium · substack · web

THE MATCH IS BY HOST, NOT BY REGISTRABLE DOMAIN, where a platform's other hosts are not its people:
support.x.com, help.x.com and business.x.com are X's help desk, and v.redd.it / i.redd.it are
Reddit's media servers. Measured on the rejected run's sources.json (2026-09-26): with host
matching X = x.com 199 + t.co 95 = 294 and Reddit = reddit.com 634; with a suffix match they
would read 297 and 644 — numbers about help pages and video files, not about people. The sites
whose people live on SUBDOMAINS (Quora spaces, Substack and Medium publications, TikTok's short
links, LinkedIn's country hosts, the Chinese sites) match by suffix.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

sys.dont_write_bytecode = True     # the skill folder is read-only inside a hunter's jail
sys.path.insert(0, str(Path(__file__).resolve().parent))
import rlib  # noqa: E402  — the tracking-parameter list and the base canonical form have ONE owner

PLATFORMS = ("x", "youtube", "tiktok", "instagram", "facebook", "linkedin", "reddit", "hackernews",
             "github", "bluesky", "threads", "quora", "stackoverflow", "chinese", "medium",
             "substack", "web")

# the label the CEO reads in the coverage table (Turkish surface; the keys above stay the contract)
LABEL = {"x": "X", "youtube": "YouTube", "tiktok": "TikTok", "instagram": "Instagram",
         "facebook": "Facebook", "linkedin": "LinkedIn", "reddit": "Reddit",
         "hackernews": "Hacker News", "github": "GitHub", "bluesky": "Bluesky",
         "threads": "Threads", "quora": "Quora", "stackoverflow": "Stack Overflow",
         "chinese": "Çince siteler", "medium": "Medium", "substack": "Substack",
         "web": "Web (diğer)"}

X_HOSTS = {"x.com", "twitter.com", "mobile.twitter.com", "m.twitter.com", "mobile.x.com"}
REDDIT_HOSTS = {"reddit.com", "old.reddit.com", "new.reddit.com", "np.reddit.com", "m.reddit.com",
                "amp.reddit.com", "sh.reddit.com", "i.reddit.com"}
YOUTUBE_HOSTS = {"youtube.com", "m.youtube.com", "music.youtube.com"}

# host (after "www.") -> platform, exact
EXACT = {
    **{h: "x" for h in X_HOSTS}, "t.co": "x",
    **{h: "youtube" for h in YOUTUBE_HOSTS}, "youtu.be": "youtube",
    "instagram.com": "instagram", "m.instagram.com": "instagram", "instagr.am": "instagram",
    "facebook.com": "facebook", "m.facebook.com": "facebook", "web.facebook.com": "facebook",
    "mbasic.facebook.com": "facebook", "fb.com": "facebook", "fb.watch": "facebook",
    "lnkd.in": "linkedin",
    **{h: "reddit" for h in REDDIT_HOSTS}, "redd.it": "reddit",
    "news.ycombinator.com": "hackernews",
    "github.com": "github", "gist.github.com": "github",
    "bsky.app": "bluesky", "bsky.social": "bluesky",
    "threads.net": "threads", "threads.com": "threads",
}
# domain -> platform, the domain itself or any subdomain of it
SUFFIX = (
    ("tiktok.com", "tiktok"), ("linkedin.com", "linkedin"), ("quora.com", "quora"),
    ("stackoverflow.com", "stackoverflow"), ("stackexchange.com", "stackoverflow"),
    ("zhihu.com", "chinese"), ("weibo.com", "chinese"), ("weibo.cn", "chinese"),
    ("bilibili.com", "chinese"), ("b23.tv", "chinese"), ("xiaohongshu.com", "chinese"),
    ("xhslink.com", "chinese"), ("rednote.com", "chinese"), ("v2ex.com", "chinese"),
    ("linux.do", "chinese"), ("juejin.cn", "chinese"),
    ("medium.com", "medium"), ("substack.com", "substack"),
)

# A CITATION: exactly [L0042] or [L0042, L0043] — upper-case L, four digits, nothing else inside.
CITE_RE = re.compile(r"\[L\d{4}(?:,\s*L\d{4})*\]")   # the only owner; render.py spells the same

# THE SWEEP'S CHANNELS, BY PLATFORM (scripts/sweep.sh's map). kapsama.py needs it for one thing: a
# channel that FAILED leaves no address, so without this a closed door on TikTok would leave no
# TikTok row at all and the table would say nothing where it must say "kapı kapalı". A channel
# not named here is a search engine or a site of its own and belongs to `web`.
CHANNEL_PLATFORM = {
    "twitter": "x", "youtube": "youtube", "tiktok": "tiktok", "instagram": "instagram",
    "facebook": "facebook", "linkedin": "linkedin", "reddit": "reddit", "hackernews": "hackernews",
    "github-repos": "github", "github-issues": "github", "github-trending": "github",
    "bluesky": "bluesky", "quora": "quora", "quora-forums": "quora",
    "stackoverflow": "stackoverflow", "zhihu": "chinese", "linux-do": "chinese",
    "weibo": "chinese", "rednote": "chinese", "bilibili": "chinese", "juejin": "chinese",
    "v2ex": "chinese", "medium": "medium", "substack": "substack",
}


# What an address looks like inside a run file: merge.py's pattern, minus the pipe of a markdown table
# and the bracket of a tracking suffix (`...&__cft__[0`, measured in facebook.raw on 2026-09-21).
URL_RE = re.compile(r"https?://[^\s\"'<>)\[\]},`\\|]+")
TAIL_JUNK = ".,;:!?*_~'\"“”‘’»«…"
# a regex character class right after the address: it was a pattern, not an address
PATTERN_TAIL = re.compile(r"\[\^|\[[^\]\s]*\][*+?{]")


def urls_in(text: str) -> list[str]:
    """Every address in a text, in order. Two addresses glued together are two addresses — the
    rejected run's sources.json carried `.../article/2096669523956920530https://x.com` as one — and a
    pattern written into a grep (`https://x.com/[^ ]*`) is not an address at all."""
    out = []
    for m in URL_RE.finditer(text or ""):
        if PATTERN_TAIL.match(text, m.end()):
            continue
        for u in re.split(r"(?<=.)(?=https?://)", m.group(0)):
            while u and u[-1] in TAIL_JUNK:
                u = u[:-1]
            if u and not re.search(r"[\^*$\\{}]", u):
                out.append(u)
    return out

def host_of(url: str) -> str:
    try:
        host = (urlsplit((url or "").strip()).hostname or "").lower().rstrip(".")
    except ValueError:
        return ""
    return host[4:] if host.startswith("www.") else host


def platform_of(url: str) -> str:
    """The platform an address belongs to — one of PLATFORMS; `web` for everything else."""
    host = host_of(url)
    if not host:
        return "web"
    if host in EXACT:
        return EXACT[host]
    for dom, plat in SUFFIX:
        if host == dom or host.endswith("." + dom):
            return plat
    return "web"


def canonical_url(url: str) -> str:
    """The ONE form an address is counted and deduplicated in (evidence.jsonl's `url_canonical`).

    rlib.canonical_url first (lower-case host, no `www.`, no fragment, no tracking parameters, no
    trailing slash), then https for every scheme, then the collapses that make one post one row:
    x.com/<anyone>/status/N and twitter.com/... are x.com/i/status/N; a Reddit thread with and
    without its title slug is one thread; youtu.be, /embed/ and /shorts/ are /watch?v=; an HN item
    keeps only its id. t.co keeps its case-sensitive path — it is a redirect, not a post.
    """
    u = (url or "").strip()
    if not re.match(r"^https?://", u, re.I):
        return u
    base = rlib.canonical_url(u)
    try:
        s = urlsplit(base)
        host = (s.hostname or "").lower()
        port = f":{s.port}" if s.port and s.port not in (80, 443) else ""
    except ValueError:
        return base
    path = s.path or "/"
    q = parse_qsl(s.query, keep_blank_values=True)
    if host in X_HOSTS:
        m = re.match(r"^/(?:[^/]+|i/web|i)/status(?:es)?/(\d+)", path)
        if m:
            return f"https://x.com/i/status/{m[1]}"
        return urlunsplit(("https", "x.com", path, "", ""))
    if host in REDDIT_HOSTS:
        m = re.match(r"^/r/([^/]+)/comments/([a-z0-9]+)(?:/[^/]*)?(/.*)?$", path, re.I)
        if m:
            return f"https://reddit.com/r/{m[1].lower()}/comments/{m[2].lower()}{(m[3] or '').rstrip('/')}"
        return urlunsplit(("https", "reddit.com", path, urlencode(q), ""))
    if host == "youtu.be":
        vid = path.strip("/").split("/")[0]
        return f"https://youtube.com/watch?v={vid}" if vid else "https://youtube.com"
    if host in YOUTUBE_HOSTS:
        m = re.match(r"^/(?:embed|shorts|live)/([A-Za-z0-9_-]+)", path)
        if m:
            return f"https://youtube.com/watch?v={m[1]}"
        if path == "/watch":
            return urlunsplit(("https", "youtube.com", "/watch", urlencode([kv for kv in q if kv[0] == "v"]), ""))
        return urlunsplit(("https", "youtube.com", path, urlencode(q), ""))
    if host == "news.ycombinator.com" and path == "/item":
        return urlunsplit(("https", host, path, urlencode([kv for kv in q if kv[0] == "id"]), ""))
    # a post's own address carries share/session noise that is not in rlib's tracking list
    plat = platform_of(base)
    if (plat == "tiktok" and "/video/" in path) or (plat == "instagram" and re.match(r"^/(p|reel)/", path)) \
            or (plat == "linkedin" and re.match(r"^/(posts|feed/update)/", path)):
        return urlunsplit(("https", host + port, path, "", ""))
    return urlunsplit(("https", host + port, path, urlencode(q), ""))



def door_said(text: str) -> str:
    """The one line a closed door said. opencli prints its refusals as YAML — `ok: false`, then
    `error:` with `code:` and `message:` (measured on the grounds of 2026-09-24: NOT_FOUND "No search
    results found", AUTH_REQUIRED "linux.do requires an active signed-in browser session") — so its
    first line says nothing. The code and the message are the door's own words; anything else gives
    its first line that is not opencli's update notice."""
    t = text or ""
    msg = re.search(r"^([ \t]*)message:[ \t]*(.+)$", t, re.M)
    if msg:
        said = msg.group(2).strip()
        if re.fullmatch(r"[|>][-+]?\d?", said):      # `message: >-` — the words are on the lines below
            rest = t[msg.end():].splitlines()[1:]
            deeper = []
            for ln in rest:
                if ln.strip() and len(ln) - len(ln.lstrip()) <= len(msg.group(1)):
                    break
                deeper.append(ln.strip())
            said = " ".join(x for x in deeper if x)
        code = re.search(r"^\s*code:\s*(.+)$", t, re.M)
        return (f"{code.group(1).strip()}: " if code else "") + said.strip("'\"")
    for ln in t.splitlines():
        s = ln.strip()
        if s and s != "ok: false" and not s.startswith(("Update available", "Run: npm install")):
            return s
    return ""

# ---------------------------------------------------------------- what is not an address at all
# A page's furniture, a search engine's own results page and an address that does not parse are
# not sources. The same three verdicts sources.py gives sources.json (its lists, measured there on
# the runs of 2026-09-20..24), kept here for the evidence rows: sources.py loads fleet/merge.py at
# import, and the evidence CLI may not fall over because another file is half-edited.
ASSET_EXT = re.compile(r"\.(png|jpe?g|gif|webp|svg|ico|bmp|avif|heic|css|js|mjs|map|woff2?|ttf|otf|eot|"
                       r"mp4|webm|m3u8|mp3|m4a|wav|ogg)$", re.I)
ASSET_HOSTS = {"i.redd.it", "preview.redd.it", "external-preview.redd.it", "styles.redditmedia.com",
               "pbs.twimg.com", "video.twimg.com", "abs.twimg.com", "i.ytimg.com", "yt3.ggpht.com",
               "yt3.googleusercontent.com", "avatars.githubusercontent.com",
               "user-images.githubusercontent.com", "private-user-images.githubusercontent.com",
               "camo.githubusercontent.com", "media2.dev.to", "dev-to-uploads.s3.amazonaws.com",
               "fonts.googleapis.com", "fonts.gstatic.com", "external-content.duckduckgo.com",
               "w3.org", "a9.com", "purl.org", "schema.org", "ogp.me", "xmlns.com"}
ASSET_DOMAINS = {"twimg.com", "ytimg.com", "ggpht.com", "redditmedia.com", "redditstatic.com",
                 "rednotecdn.com", "xhscdn.com", "sinaimg.cn", "hdslb.com", "zhimg.com", "gstatic.com",
                 "fbcdn.net", "cdninstagram.com", "licdn.com", "githubassets.com", "gravatar.com",
                 "googletagmanager.com", "google-analytics.com", "doubleclick.net"}
FURNITURE_PATH = re.compile(r"^/(share|sharer(\.php)?|sharearticle|intent/(tweet|post)|submit|submitlink|"
                            r"pin/create|send|login|log-in|signin|sign-in|signup|sign-up|register|logout|"
                            r"account|settings|password)(/|$)", re.I)
# A PLATFORM'S OWN PAGES ARE NOT ITS PEOPLE. The B56 verifier found x.com/, x.com/tos, x.com/privacy,
# x.com/i/flow/…, x.com/i/trending/…, reddit.com/ and youtube.com/ on the hunters' address lists
# (2026-09-26). A platform's front door and its legal, flow and search pages are refused; a
# publication on its subdomain — someone.substack.com, a Quora space, a Medium blog — is that
# person's own page and stays, and so does every root of a site that is not a platform.
SITE_PAGE = re.compile(r"^/(?:tos|terms|privacy|rules|legal|about|help|home|explore|notifications|"
                       r"messages|i/flow|i/trending|i/jf|search|hashtag|feed|policies|t/terms|"
                       r"howyoutubeworks|results)(?:/|$)", re.I)
PUBLICATIONS = ("substack.com", "medium.com", "quora.com")
SEARCH_PAGE = re.compile(r"^(?:(?:[a-z]+\.)?google\.[a-z.]+/(?:search|sorry|webhp)|bing\.com/search|"
                         r"(?:html\.|lite\.)?duckduckgo\.com/(?:html/?|lite/?)?(?:\?|$)|"
                         r"search\.yahoo\.com/search|yandex\.[a-z.]+/search|baidu\.com/s(?:\?|$)|"
                         r"search\.brave\.com/search|(?:[a-z0-9-]+\.)?startpage\.com/)", re.I)


def reject(url: str) -> str | None:
    """Why an address is not a source — 'invalid' · 'furniture' · 'search-page' · 'site-page' — or None."""
    try:
        s = urlsplit((url or "").strip())
        s.port   # a port that is not a number raises: the address does not parse
    except ValueError:
        return "invalid"
    host = (s.hostname or "").lower().rstrip(".") if s.scheme.lower() in ("http", "https") else ""
    if not host or "." not in host or not re.fullmatch(r"[a-z0-9._~-]+\.[a-z]{2,}", host):
        return "invalid"
    if host.startswith("www."):
        host = host[4:]
    if host in ASSET_HOSTS or ASSET_EXT.search(s.path or "") or FURNITURE_PATH.match(s.path or "") \
            or ".".join(host.split(".")[-2:]) in ASSET_DOMAINS:
        return "furniture"
    if SEARCH_PAGE.match(host + (s.path or "/") + ("?" + s.query if s.query else "")):
        return "search-page"
    if platform_of(url) != "web" and not any(host.endswith("." + d) for d in PUBLICATIONS) \
            and ((s.path or "/") == "/" or SITE_PAGE.match(s.path or "")):
        return "site-page"
    return None
