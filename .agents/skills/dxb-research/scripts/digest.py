#!/usr/bin/env python3
"""THE EVIDENCE DIGEST — what the writer reads INSTEAD of the pages in quick mode, and the one
reader of what the web engines returned.

WHY. Quick mode (ask.sh) answers a one-sentence factual question in about a minute, and the session
that writes the answer must not spend that minute — or its context — re-reading a dozen raw pages.
Perplexity's own architecture separates the planner from the writer: the writer is handed numbered
passages from ONE id space, never the pages (the idea this skill took from it on 2026-09-24, without a
second agent framework). So the machine picks the passages and the session writes from them, and
every `[n]` in this file is an id in sources.json — the id the answer will cite.

    digest.py <run-dir> [--out FILE]        default: <run-dir>/digest.md

WHAT IS IN IT, in sources.json's id order (ask.sh's KAYNAKLAR.txt gives the read, best-ranked
sources the smallest ids):
  · a source the run READ — a fetch.py page of >= 1 KB on disk: `[n] <title> — <host> — <date> —
    <kind>`, then its best passages by BM25 against the question and shortq's box query, block by
    block (a long block is cut into ~500-character pieces). A passage that carries numbers and names
    is lifted: a factual answer is made of them. At most 2 KB a source.
  · a source with no body but an engine snippet (exa highlights, parallel excerpts, tavily / youcom /
    firecrawl / duckduckgo text): the snippet, labelled `(arama ozeti — sayfa okunmadi)`.
  · at most 20 KB in all; what does not fit is cut from the highest id down.
The header carries the question, the run's date (from .t0, never the clock), the coverage line that
names every channel which FAILED or came back empty, and the line that says this run counted nobody.
Same run folder in, byte-identical digest.md out: no clock, no network, no randomness.

A page's own footnote markers (`[12]` on a Wikipedia-style page) are taken out of a passage, so the
only `[n]` in the digest are ids in sources.json; addresses are taken out too — the answer may carry
none (cite-check R6) — and so is a page's JSON-LD. An engine's snippet is cleaned exactly like a
page body, and a source's title the same way with its brackets turned round.

ONE READER OF THE ENGINES' FILES. engine_results() and reddit_threads() are what ask.sh's PICK fuses
(reciprocal-rank fusion), and channel_rows() gives ask.sh's summary and this header the same
verdicts — a channel is judged the way sweep.sh's own table judges it, by its exit code, its size
and rlib.looks_like_wall.
"""
from __future__ import annotations

import argparse
import html
import importlib.util
import json
import math
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import rlib  # noqa: E402  — the one judge of a wall
import shortq  # noqa: E402  — the box query: the names in the question
import sources as S  # noqa: E402  — the registry, its URL key, its furniture and search-page filter


def _cite_check():
    # the ruler's own Turkish-safe folding, stop-words, names and address pattern: a passage is
    # weighed with the words the ruler will later hold the answer to
    if "cite_check" in sys.modules:
        return sys.modules["cite_check"]
    spec = importlib.util.spec_from_file_location("cite_check", HERE / "cite-check.py")
    mod = importlib.util.module_from_spec(spec)
    sys.modules["cite_check"] = mod
    spec.loader.exec_module(mod)
    return mod


CC = _cite_check()

READ_MIN = 1024          # a page body below this is not a read source (ask.sh's KAYNAKLAR rule)
SOURCE_MAX = 2048        # bytes a source may take, its header included
TOTAL_MAX = 20480        # bytes the whole digest may take
PIECE = 500              # characters a passage may carry before it is cut
SNIPPET_MAX = 600        # characters of an engine snippet
PASSAGES_MAX = 6
K1, B = 1.2, 0.75        # BM25
UNREAD = "(arama ozeti — sayfa okunmadi)"
NO_COUNT = "sayim yok — kisi sayisi yazilirsa 'beyan' etiketi (R5)"

# THE WEB ENGINES WHOSE RESULT LISTS ARE RANKED ANSWERS TO THE WHOLE QUESTION. A stand-in file is
# named `<dead>-via-<engine>` by sweep.sh; it is that engine's list, and one engine votes once.
WEB_ENGINES = ("exa", "parallel", "tavily", "firecrawl", "youcom", "google-deep", "google", "duckduckgo")


@dataclass
class Hit:
    key: str            # sources.py's canonical key
    url: str            # the address as the engine wrote it
    title: str
    snippet: str
    date: str | None


def _read(p: Path) -> str:
    try:
        return p.read_text(encoding="utf-8-sig", errors="replace")
    except OSError:
        return ""


def _code(ground: Path, stem: str) -> str:
    return _read(ground / f"{stem}.code").strip() or "?"


def engine_of(stem: str) -> str:
    e = stem.split("-via-")[-1]
    return "duckduckgo" if e == "duckduckgo2" else e


def _envelope(text: str) -> dict:
    vals = S.json_values(text) or []
    return next((v for v in vals if isinstance(v, dict)), {})


# ------------------------------------------------------------------ coverage
def channel_rows(ground: Path) -> list[tuple[str, str, str]]:
    """(channel, ok | BOS | FAIL, why) for every channel the run's .queries ledger says was fired."""
    names = []
    for line in _read(ground / ".queries").splitlines():
        n = line.split("\t", 1)[0].strip()
        if n and n not in names:
            names.append(n)
    rows = []
    for n in names:
        raw = ground / f"{n}.raw"
        code = _code(ground, n)
        text = _read(raw)
        size = len(text.encode("utf-8"))
        err = CC.URL_ANY.sub("", " ".join(_read(ground / f"{n}.err").split()))[:70].strip()
        if not raw.exists() and code == "?":
            rows.append((n, "FAIL", "sonuc dosyasi yok"))
        elif n == "google-deep" and code == "4" and size >= 40:
            eng = _envelope(text).get("engine") or "yedek"
            rows.append((n, "FAIL", f"kod 4 — Google dustu, {eng} okundu"))
        elif code != "0":
            rows.append((n, "FAIL", f"kod {code}" + (f": {err}" if err else "")))
        elif rlib.looks_like_wall(text):
            rows.append((n, "FAIL", "sayfa kendi hata metnini dondurdu"))
        elif size < 40:
            rows.append((n, "BOS", "cevap verdi, sonuc yok"))
        else:
            rows.append((n, "ok", ""))
    return rows


def _usable(ground: Path, stem: str) -> bool:
    code = _code(ground, stem)
    text = _read(ground / f"{stem}.raw")
    return ((code == "0" or (stem == "google-deep" and code == "4"))
            and len(text.encode("utf-8")) >= 40 and not rlib.looks_like_wall(text))


# ------------------------------------------------------------------ what each engine returned
def _clean(s) -> str:
    return re.sub(r"\s+", " ", html.unescape(str(s or ""))).strip()


def _snippet_of(o: dict) -> str:
    parts: list[str] = []
    for k in ("excerpts", "highlights", "content", "description", "snippet", "text", "contents"):
        v = o.get(k)
        if isinstance(v, dict):
            v = v.get("highlights") or v.get("markdown") or v.get("text")
        if isinstance(v, list):
            parts += [str(x) for x in v if isinstance(x, str)]
        elif isinstance(v, str):
            parts.append(v)
    return _clean(" … ".join(p for p in parts if p.strip()))


def _json_hits(vals: list) -> list[tuple[str, str, str, str | None]]:
    out = []

    def walk(o):
        if isinstance(o, dict):
            u = o.get("url") or o.get("link")
            if isinstance(u, str) and u.startswith("http"):
                d = None
                for k in ("publish_date", "published_date", "page_age", "published", "date"):
                    d = d or S._date(o.get(k))
                out.append((u, _clean(o.get("title")), _snippet_of(o), d))
                return
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)

    walk(vals)
    return out


def _exa_hits(text: str) -> list[tuple[str, str, str, str | None]]:
    out = []
    for block in re.split(r"(?m)^---\s*$", text):
        u = re.search(r"(?m)^URL:\s*(\S+)", block)
        if not u:
            continue
        t = re.search(r"(?m)^Title:\s*(.*)$", block)
        d = re.search(r"(?m)^Published(?: Date)?:\s*(\S+)", block)
        hl = block.split("Highlights:", 1)[1] if "Highlights:" in block else ""
        lines = [re.sub(r"^>\s?", "", ln).strip() for ln in hl.splitlines()]
        out.append((u.group(1), _clean(t.group(1) if t else ""),
                     _clean(" ".join(x for x in lines if x and x not in ("...", "…")))
                     , S._date(d.group(1)) if d else None))
    return out


def _yaml_hits(text: str) -> list[tuple[str, str, str, str | None]]:
    try:
        import yaml
        data = yaml.safe_load(text)
    except Exception:
        data = None
    if not isinstance(data, list):
        return [(u, _clean(t), "", d) for u, t, d in S.records_yaml(text)]
    out = []
    for o in data:
        if isinstance(o, dict) and isinstance(o.get("url"), str) and o["url"].startswith("http"):
            out.append((o["url"], _clean(o.get("title")),
                        _clean(o.get("snippet") or o.get("description") or o.get("selftext")),
                        S._date(o.get("date") or o.get("created_utc"))))
    return out


# A SEARCH ENGINE'S OWN RESULTS PAGE (google-deep: hidden.py google, whose stand-ins are Startpage and
# Brave). Measured 2026-09-24 on Startpage: every organic result carries its title as a heading
# inside the link (`[## Title](url)`), while the Ads block above them (admarketplace redirects) and
# the "Learn More" / "Visit in Anonymous View" links carry none. A page with heading links gives
# those, in page order; one without falls back to every link that is not the engine's own, the rule
# hidden.py itself counts results by.
MD_LINK = re.compile(r"\[([^\]]*)\]\((https?://[^)\s]+)\)")
HEADED = re.compile(r"(?:^|\n)\s*#{1,6}\s+(\S[^\n]*)")


def _serp_hits(text: str) -> list[tuple[str, str, str, str | None]]:
    env = _envelope(text)
    content = str(env.get("content") or "")
    own = str(env.get("engine") or "") or (urlsplit(str(env.get("url") or "")).hostname or "").split(".")[-2:][0]
    links = [(m.group(1), m.group(2)) for m in MD_LINK.finditer(content)]
    headed = [(HEADED.search(t).group(1), u) for t, u in links if HEADED.search(t)]
    if headed:
        return [(u, _clean(t.strip("# ")), "", None) for t, u in headed]
    return [(u, _clean(t), "", None) for t, u in links
            if own and own not in (urlsplit(u).hostname or "")]


def _hits(raw: Path, engine: str) -> list[tuple[str, str, str, str | None]]:
    text = _read(raw)
    if engine == "exa":
        return _exa_hits(text)
    if engine == "google-deep":
        return _serp_hits(text)
    if text.lstrip()[:1] in ("[", "{"):
        vals = S.json_values(text)
        if vals is not None:
            return _json_hits(vals)
    rows = _yaml_hits(text)
    if engine in ("google", "duckduckgo"):
        # the CLI door hands back its own redirect wrappers (google.com/goto?url=<opaque>): an
        # engine's own address is never the page it found
        rows = [r for r in rows if engine not in (urlsplit(r[0]).hostname or "")]
    return rows


def _keyed(rows) -> list[Hit]:
    out, seen = [], set()
    for u, t, sn, d in rows:
        c = S.canon(u)
        if c is None or c[0] in seen:
            continue
        seen.add(c[0])
        out.append(Hit(c[0], S.clean_tail(u), t, sn, d))
    return out


def engine_results(ground: Path) -> list[tuple[str, list[Hit]]]:
    """[(engine, its hits in rank order)] — one list per engine, in WEB_ENGINES order. An engine's
    own file wins over a stand-in copy of it; duckduckgo2 (its page two) continues duckduckgo."""
    stems = sorted(p.stem for p in ground.glob("*.raw"))
    lists: dict[str, list] = {}
    for eng in WEB_ENGINES:
        mine = [s for s in stems if engine_of(s) == eng and _usable(ground, s)]
        primary = [s for s in mine if s in (eng, "duckduckgo2")]
        use = primary or mine[:1]
        rows = [r for s in use for r in _hits(ground / f"{s}.raw", eng)]
        hits = _keyed(rows)
        if hits:
            lists[eng] = hits
    return [(e, lists[e]) for e in WEB_ENGINES if e in lists]


def reddit_threads(ground: Path) -> list[Hit]:
    """The reddit channel's threads, in the channel's own order."""
    if not (ground / "reddit.raw").exists() or not _usable(ground, "reddit"):
        return []
    return [h for h in _keyed(_yaml_hits(_read(ground / "reddit.raw")))
            if "/comments/" in urlsplit(h.key).path]


def snippet_map(run: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    for g in _grounds(run):
        for _, hits in engine_results(g):
            for h in hits:
                if h.snippet and h.key not in out:
                    out[h.key] = h.snippet
    return out


def _grounds(run: Path) -> list[Path]:
    return sorted((d for d in run.glob("ground*") if d.is_dir()), key=S._natural)


# ------------------------------------------------------------------ passages
TABLE_SEP = re.compile(r"^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$")
TOKEN = re.compile(r"\w+(?:[.,]\d+)*")
NUMBER = re.compile(r"\d+(?:[.,]\d+)*")
SENT_END = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9ÇĞİÖŞÜ\"“(])")


# STRUCTURED DATA IS MARKUP, NOT A PASSAGE (refuter, 2026-09-24: docsbot.ai's search snippet ended in
# `{"@context":"https://schema.org","@type":"FAQPage",…}`). A JSON-LD object is taken out whole; one
# an engine cut short, to the end of its line — never further, or a page would go with it.
JSONLD = re.compile(r'[\[{]\s*"@(?:context|type|graph|id)"\s*:')
_JSON = json.JSONDecoder()


def _drop_jsonld(t: str) -> str:
    out, i = [], 0
    while m := JSONLD.search(t, i):
        try:
            end = _JSON.raw_decode(t, m.start())[1]
        except ValueError:
            end = t.find("\n", m.start())
            end = len(t) if end < 0 else end
        out.append(t[i:m.start()])
        i = end
    return "".join(out) + t[i:]


def clean_body(text: str) -> str:
    t = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)
    t = re.sub(r"\[([^\]]*)\]\((?:[^()\s]|\([^)\s]*\))*\)", r"\1", t)
    t = re.sub(r"<[^>\n]{1,400}>", " ", t)
    t = _drop_jsonld(html.unescape(t))
    t = re.sub(r"\[\^?\d{1,4}\]", "", t)            # a page's own footnote markers
    t = CC.URL_ANY.sub("", t)                         # addresses, with or without a scheme
    t = t.replace("[", "(").replace("]", ")")        # no bracket left to read as a citation
    return "\n".join(re.sub(r"[ \t ]+", " ", ln).strip() for ln in t.splitlines())


def _cut(s: str, n: int) -> list[str]:
    out = []
    while len(s) > n:
        at = s.rfind(" ", 0, n)
        at = at if at > n // 2 else n
        out.append(s[:at].strip())
        s = s[at:].strip()
    return out + ([s] if s else [])


def _table_head(raw: list[str]) -> str:
    """A table's header row(s): the line above its |---| rule, and the row under the rule too when
    it carries no digit ("| Name | Input | Output |" under "| Model | Base tokens |"). A price row read
    without its header is a row of numbers nobody can place."""
    if len(raw) < 3 or not raw[0].startswith("|") or not TABLE_SEP.match(raw[1]):
        return ""
    head = [raw[0]]
    if raw[2].startswith("|") and not re.search(r"\d", raw[2]) and len(raw) > 3:
        head.append(raw[2])
    return "\n".join(head)


def pieces(text: str) -> list[str]:
    out: list[str] = []
    for block in re.split(r"\n\s*\n", clean_body(text)):
        raw = [ln for ln in block.splitlines() if ln]
        head = _table_head(raw)
        lines = [ln for ln in raw if not TABLE_SEP.match(ln)]
        if not lines:
            continue
        if len(lines) >= 3:                      # a table or a list: whole lines, grouped
            body = lines[len(head.splitlines()):] if head else lines
            room = PIECE - (len(head) + 1 if head else 0)
            cur = ""
            for ln in body:
                for part in _cut(ln, max(room, PIECE // 2)):
                    if cur and len(cur) + 1 + len(part) > room:
                        out.append(f"{head}\n{cur}" if head else cur)
                        cur = ""
                    cur = f"{cur}\n{part}" if cur else part
            if cur:
                out.append(f"{head}\n{cur}" if head else cur)
            continue
        cur = ""
        for sent in SENT_END.split(" ".join(lines)):
            for part in _cut(sent, PIECE):
                if cur and len(cur) + 1 + len(part) > PIECE:
                    out.append(cur)
                    cur = ""
                cur = f"{cur} {part}" if cur else part
        if cur:
            out.append(cur)
    return [p for p in out if len(p) >= 40 and len(TOKEN.findall(p)) >= 5 and not _menu(p)]


def _menu(p: str) -> bool:
    """A site's navigation, not a passage: five or more lines of at most three words each
    ("* Claude Code / * Pricing / * Log in") — measured on anthropic.com's footer in the first run."""
    lines = p.splitlines()
    if len(lines) < 5 or sum(ln.startswith("|") for ln in lines) * 2 > len(lines):
        return False                     # a short table ("| Opus 5.5 | $24 |") is data, not a menu
    return sum(len(TOKEN.findall(ln)) for ln in lines) / len(lines) <= 3


def tokens(text: str) -> list[str]:
    return [t for t in TOKEN.findall(CC.fold(text)) if t not in CC.STOP and (len(t) >= 2 or t.isdigit())]


def _bm25(docs: list[list[str]], query: set[str]) -> list[float]:
    n = len(docs)
    if not n or not query:
        return [0.0] * n
    avg = sum(len(d) for d in docs) / n or 1.0
    df: dict[str, int] = {}
    for d in docs:
        for t in set(d) & query:
            df[t] = df.get(t, 0) + 1
    out = []
    for d in docs:
        tf: dict[str, int] = {}
        for t in d:
            if t in query:
                tf[t] = tf.get(t, 0) + 1
        s = 0.0
        for t in sorted(tf):
            idf = math.log(1 + (n - df[t] + 0.5) / (df[t] + 0.5))
            s += idf * tf[t] * (K1 + 1) / (tf[t] + K1 * (1 - B + B * len(d) / avg))
        out.append(s)
    return out


# ------------------------------------------------------------------ the digest
def _nbytes(s: str) -> int:
    return len(s.encode("utf-8"))


def _fit(s: str, limit: int) -> str:
    """s cut to at most `limit` UTF-8 bytes, at a space when there is one."""
    if _nbytes(s) <= limit:
        return s
    b = s.encode("utf-8")[:max(0, limit - 3)].decode("utf-8", errors="ignore")
    at = b.rfind(" ")
    return (b[:at] if at > len(b) // 2 else b).rstrip() + "…"


def _quote(p: str) -> str:
    return "\n".join("> " + ln for ln in p.splitlines())


def _title(t) -> str:
    """A title cleaned like a passage, its brackets turned round first: "Pricing Guide [2026] [7]"
    reads "Pricing Guide (2026) (7)" — never a false [7] beside the real id (refuter, 2026-09-24)."""
    return " ".join(clean_body(str(t or "").replace("[", "(").replace("]", ")")).split())


def _head(s: dict, extra: str = "") -> str:
    parts = [_title(s.get("title")) or "(basliksiz)", s.get("domain") or S.domain_of(str(s.get("url") or ""))]
    if s.get("date"):
        parts.append(s["date"])
    parts.append(str(s.get("kind") or "other"))
    return f"[{s['id']}] " + " — ".join(parts) + (f" {extra}" if extra else "")


def _run_date(run: Path) -> str:
    try:
        return time.strftime("%Y-%m-%d", time.localtime(float(_read(run / ".t0").split()[0])))
    except (ValueError, IndexError, OverflowError, OSError):
        return "bilinmiyor (.t0 yok)"


def coverage_line(run: Path) -> tuple[str, list[tuple[str, str, str]]]:
    rows = [r for g in _grounds(run) for r in channel_rows(g)]
    ok = [n for n, st, _ in rows if st == "ok"]
    empty = [n for n, st, _ in rows if st == "BOS"]
    bad = [(n, why) for n, st, why in rows if st == "FAIL"]
    line = (f"{len(rows)} kanal · ok {len(ok)} · bos {len(empty)}"
            + (f" ({', '.join(empty)})" if empty else "")
            + f" · HATA {len(bad)}" + (": " + ", ".join(f"{n} ({w})" for n, w in bad) if bad else ""))
    return line, rows


def build(run: Path) -> tuple[str, dict]:
    question = " ".join(_read(run / "question.txt").split())
    box = shortq.short_query(question) if question else ""
    reg = sorted(S.load(run / "sources.json"), key=lambda s: int(s["id"]))
    bodies = S.body_files(run)
    snips = snippet_map(run)
    cov, _rows = coverage_line(run)
    counted = next((s for s in reg if s.get("kind") == "count"), None)

    # A PAGE'S PASSAGES ARE RANKED AGAINST THE PAGE ITSELF. Measured on the first quick run (Opus 5.5
    # pricing, 12 pages): with the run's twelve pages as BM25's collection, "opus" and "5.5" stood in
    # nearly every paragraph, weighed nothing, and the vendor's own price table ($4 / $20 vs $5 / $25)
    # lost to paragraphs that happened to say "million tokens". Within one page the subject's name is
    # rare enough to count.
    query = set(tokens(question)) | set(tokens(box))
    read: dict[int, list[str]] = {}
    score: dict[tuple[int, int], float] = {}
    for s in reg:
        c = S.canon(str(s.get("url") or "")) if s.get("kind") != "count" else None
        files = [f for f in (bodies.get(c[0], []) if c else []) if f.stat().st_size >= READ_MIN]
        if not files:
            continue
        sid = int(s["id"])
        read[sid] = ps = pieces(_read(max(files, key=lambda f: (f.stat().st_size, f.name))))
        for i, (p, sc) in enumerate(zip(ps, _bm25([tokens(p) for p in ps], query))):
            if sc > 0:
                nums = len(set(NUMBER.findall(p)))
                names = len(set(CC.proper_tokens(p)))
                sc *= 1 + 0.06 * min(nums, 10) + 0.04 * min(names, 5)
            score[(sid, i)] = sc

    blocks: list[tuple[str, str]] = []           # (read | snippet, text)
    for s in reg:
        sid = int(s["id"])
        if sid in read:
            head = _head(s)
            budget = SOURCE_MAX - _nbytes(head) - 1
            ps = read[sid]
            ranked = sorted((i for i in range(len(ps)) if score[(sid, i)] > 0),
                            key=lambda i: (-score[(sid, i)], i))
            take, used = [], 0
            for i in ranked:
                q = _quote(ps[i])
                if used + _nbytes(q) + 2 <= budget:
                    take.append(i)
                    used += _nbytes(q) + 2
                if len(take) >= PASSAGES_MAX:
                    break
            if not take and ps:                   # nothing matched the question: the page's lead
                take = [0]
            text = "\n\n".join(_quote(_fit(ps[i], budget - 2)) for i in sorted(take))
            blocks.append(("read", head + ("\n" + text if text else "")))
        else:
            c = S.canon(str(s.get("url") or "")) if s.get("kind") != "count" else None
            sn = " ".join(clean_body(snips.get(c[0]) or "").split()) if c else ""   # cleaned like a body
            if sn:
                head = _head(s, UNREAD)
                blocks.append(("snippet", head + "\n" + _quote(_fit(sn, min(SNIPPET_MAX, SOURCE_MAX - _nbytes(head) - 3)))))

    top = ["# Kanit ozeti — hizli mod", f"Soru: {question}", f"Tarih: {_run_date(run)}", f"Kapsama: {cov}"]
    tail = (f"sayim var: [{counted['id']}] makinenin kendi sayimi — baska kisi sayisi yazilirsa 'beyan' etiketi (R5)"
            if counted else NO_COUNT)
    reserve = _nbytes("\n".join(top + [tail])) + 120      # the counts line is written last
    kept, used = [], reserve
    for kind, text in blocks:
        if used + _nbytes(text) + 2 > TOTAL_MAX:
            break                                  # cut from the highest id down
        kept.append((kind, text))
        used += _nbytes(text) + 2
    n_read = sum(1 for k, _ in kept if k == "read")
    n_snip = sum(1 for k, _ in kept if k == "snippet")
    counts = (f"Kaynaklar: {n_read} okunan · {n_snip} arama ozeti · sources.json {len(reg)} kaynak"
              + (f" · sigmayan {len(blocks) - len(kept)} blok kesildi" if len(kept) < len(blocks) else ""))
    out = "\n".join(top + [counts, tail]) + "\n\n" + "\n\n".join(t for _, t in kept) + "\n"
    return out, {"read": n_read, "snippets": n_snip, "sources": len(reg), "cut": len(blocks) - len(kept),
                 "coverage": cov, "rows": _rows}


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(prog="digest.py", description="quick mode's evidence digest")
    ap.add_argument("run_dir")
    ap.add_argument("--out", help="default: <run-dir>/digest.md")
    a = ap.parse_args(argv)
    run = Path(a.run_dir).resolve()
    if not (run / "sources.json").is_file():
        print(f"digest: {run}/sources.json yok — once sources.py", file=sys.stderr)
        return 2
    text, st = build(run)
    out = Path(a.out) if a.out else run / "digest.md"
    out.write_text(text, encoding="utf-8")
    rows = st["rows"]
    by = {k: [n for n, s, _ in rows if s == k] for k in ("ok", "BOS", "FAIL")}
    print(f"kanallar: ok {len(by['ok'])} ({' '.join(by['ok'])}) · bos {len(by['BOS'])}"
          + (f" ({' '.join(by['BOS'])})" if by["BOS"] else "")
          + f" · HATA {len(by['FAIL'])}" + (f" ({' '.join(by['FAIL'])})" if by["FAIL"] else ""))
    print(f"digest: {out} · {_nbytes(text):,} bayt · {st['read']} okunan kaynak · {st['snippets']} arama ozeti"
          + (f" · {st['cut']} blok sigmadi" if st["cut"] else ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
