#!/usr/bin/env python3
"""THE CITATION RULER — an answer whose claims are uncited, whose citations do not contain what
they are cited for, or whose "people" numbers are claims dressed as counts, does not pass.

WHY. The report the CEO rejected on 2026-09-20 (CEO-RAPORU-TR.md, 1 894 words) carried ZERO
inline citations, dumped all 102 addresses into a trailing section 13, and told him "2.904
kişinin kendi cümlesi" while the machine count in the same folder said 82 people — the hunters'
own figures were a claim, never a count. He asked for "Perplexity level". Perplexity's rules are
the contract this file measures: the first sentence IS the answer, a `[n]` after every claim
from ONE id space (sources.py), no reference dump in the body. And an independent audit (Haus
Research, 2026-09-02) re-opened cited pages and found 34.7 % of numeric citations did not
contain the cited number — re-opening the page is R4 here.

    cite-check.py <answer.md> --sources sources.json [--run-dir D] [--question FILE]
                  [--mode quick|deep] [--sample 20] [--fetcher http|fetchpy] [--seed N] [-v]

  R1 the first non-empty line is the answer: not a heading / quote / table, not "Bu rapor…", not a
     question, 1–2 sentences
  R2 >= 90 % of factual sentences (a number, %, date, price, a named product/person/company, a
     superlative or a share like "çoğu") carry [n] — headings, table header rows and the
     follow-up QUESTIONS excluded; any other line under "Takip soruları" is body
  R3 every [n] is an id in sources.json; no sentence carries more than 3
  R4 re-open N sampled cited sentences (seeded), each judged ONCE against the union of the pages
     it cites: a quote must stand on the page verbatim (its numbers too); otherwise every claim
     number must (a version like "Fable 5.1" / "GPT-6" is part of a name, not a claim); with
     neither, >= 60 % of the distinctive words — across languages only names outside the
     question's subject, and without one the sentence is UNJUDGEABLE. Unjudgeable and
     unreachable are printed, outside the ratio; PASS at >= 80 % with at least
     max(5, 50 % of the sampled) sentences judged
  R5 "<n> kişi/users/Reddit kullanıcısı/hesap/…", "kişi sayısı: <n>" equals the machine count,
     or carries a non-negated "beyan"/"claimed" beside it (a Turkish unit is a whole word with its
     own suffixes; a number after $ € £ AED USD TL ₺ is money, never people)
  R6 no URL anywhere, with or without a scheme      R7 ends with "## Takip soruları", >= 3 questions
  R8 words: quick 150–600, deep 1 500–4 000        R9 every quote carries YYYY-MM-DD or TARİHSİZ
One PASS/FAIL row per rule, its decisive numbers, up to 5 offending lines. Exit 1 on any FAIL.

A page is read from the run folder FIRST (fetch.py pages, crowd threads). Only then the fetcher:
`fetchpy` (default) is the full reading chain, `python3 fetch.py <url>`; `http` is plain HTTP with
a browser User-Agent and r.jina.ai as a fallback that is LABELLED a cached snapshot. Neither opens
a browser on this machine; `http` never starts one at all.
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import gzip
import html
import json
import math
import random
import re
import subprocess
import sys
import tempfile
import threading
import time
import unicodedata
import urllib.error
import urllib.request
import zlib
from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import sources as S  # noqa: E402  — the registry, its URL key, and the bodies the run read
import rlib  # noqa: E402  — the one judge of a wall

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/140.0 Safari/537.36")
COVERAGE_MIN = 0.90
ACCURACY_MIN = 0.80
CONTENT_MIN = 0.60
MAX_MARKERS = 3
BANDS = {"quick": (150, 600), "deep": (1500, 4000)}
SHOW = 5

# ================================================================== Turkish-safe text
_I = str.maketrans({"I": "i", "İ": "i", "ı": "i"})


def fold(s: str) -> str:
    """Lower-case the way BOTH languages survive: I/İ/ı/i are one letter, accents dropped."""
    s = unicodedata.normalize("NFKD", (s or "").translate(_I).lower())
    return "".join(c for c in s if not unicodedata.combining(c))


MARK = re.compile(r"(?<!!)\[(\d{1,4})\](?!\()")
# AN ADDRESS WITHOUT A SCHEME IS STILL AN ADDRESS (refuter, 2026-09-24: "reddit.com/r/…",
# "youtu.be/…", "x.com/…/status/…" all passed R6). A host whose last label is a real TLD, then a
# path. The TLD list is what keeps "5.1/10", "24/7" and "Node.js/Deno" from counting as URLs.
TLDS = ("com|org|net|io|ai|dev|app|co|me|tv|gg|so|sh|ly|to|fm|cc|be|rs|do|cn|jp|kr|tw|hk|ru|in|br|eu|"
        "uk|de|fr|tr|nl|se|es|it|pl|ch|au|ca|us|sg|id|vn|info|biz|xyz|site|blog|news|tech|online|page|"
        "link|pro|club|one|top|wiki|zone|space|live|today|world|edu|gov|int|ac|"
        # round 2 (refuter): archive.ph/…, mastodon.social/@…, infosec.exchange/@… were missed
        "ph|is|social|exchange|am|gl|la|li|lu|ms|nu|pw|sc|st|su|ws|ir|il|ie|gr|pt|ro|hu|cz|sk|si|hr|bg|"
        "ua|kz|az|ge|mx|ar|cl|pe|za|ng|ke|eg|sa|ae|qa|pk|bd|lk|th|my|nz|at|dk|fi|no|lt|lv|ee|network|"
        "systems|software|group|games|digital|email|cloud|codes|tools|works|chat|bot|host|ninja|rocks|"
        "art|design|studio|media|press|town|city|lol|moe|fyi|land|team|forum|community|place|lat")
# A PRODUCT NAME IS NOT AN ADDRESS (refuter, round 2): "Claude.ai/ChatGPT", "ASP.NET/Blazor",
# "Socket.io/WebSocket" — a scheme-less match whose whole path is ONE capitalised, letters-only
# word is text. "archive.ph/AbC12" (digits) and "reddit.com/r/…" (more path) are addresses.
URL_ANY = re.compile(r"https?://[^\s<>)\]]+|(?<![/\w.@-])www\.[a-z0-9-]+\.[a-z]{2,}[^\s<>()\[\]]*"
                     rf"|(?<![/\w.@-])(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:{TLDS})/"
                     r"(?!(?-i:[A-Z][A-Za-z]*)(?:[\s<>()\[\],.;:!?'\"”’»]|$))[^\s<>()\[\]]+", re.I)
QUOTE_CH = "“”\"«»„‘"


def plain(s: str) -> str:
    """Markdown to the words a reader sees: links keep their text, emphasis marks go."""
    s = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", s)
    s = s.replace("**", "").replace("__", "").replace("`", "")
    s = re.sub(r"(?<![\w*])\*(?=\S)(.+?)(?<=\S)\*(?![\w*])", r"\1", s)
    s = re.sub(r"(?<![\w_])_(?=\S)(.+?)(?<=\S)_(?![\w_])", r"\1", s)
    return s


def bare(s: str) -> str:
    """What a claim is judged on: plain text with its markers and addresses taken out."""
    return re.sub(r"\s+", " ", URL_ANY.sub(" ", MARK.sub(" ", plain(s)))).strip()


# ================================================================== numbers
NUM = re.compile(r"(?<![\w.,])(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)(?!\d)(?![.,]\d)")
ISO_DATE = re.compile(r"(?<!\d)((?:19|20)\d\d)-(\d\d)-(\d\d)(?!\d)")


def _dec(s: str) -> str | None:
    try:
        return format(Decimal(s).normalize(), "f")
    except InvalidOperation:
        return None


def num_values(tok: str) -> set[str]:
    """Every value a written number can mean: 2.904 / 2,904 -> 2904 (or 2.904); %53 = 53%; 97,6 = 97.6."""
    out: set[str] = set()
    cand: list[str] = []
    if re.fullmatch(r"\d+", tok):
        cand = [tok]
    elif re.fullmatch(r"\d{1,3}(\.\d{3})+", tok):
        cand = [tok.replace(".", "")] + ([tok] if tok.count(".") == 1 else [])
    elif re.fullmatch(r"\d{1,3}(,\d{3})+", tok):
        cand = [tok.replace(",", "")] + ([tok.replace(",", ".")] if tok.count(",") == 1 else [])
    elif re.fullmatch(r"\d{1,3}(\.\d{3})+,\d+", tok):
        cand = [tok.replace(".", "").replace(",", ".")]
    elif re.fullmatch(r"\d{1,3}(,\d{3})+\.\d+", tok):
        cand = [tok.replace(",", "")]
    elif re.fullmatch(r"\d+\.\d+", tok):
        cand = [tok]
    elif re.fullmatch(r"\d+,\d+", tok):
        cand = [tok.replace(",", ".")]
    for c in cand:
        v = _dec(c)
        if v is not None:
            out.add(v)
    return out


def numbers_in(text: str) -> tuple[list[str], list[tuple[str, str, str]]]:
    """(number tokens, ISO dates) of a claim — a date is one token, not three numbers."""
    dates = [m.groups() for m in ISO_DATE.finditer(text)]
    rest = ISO_DATE.sub(" ", text)
    return [m.group(1) for m in NUM.finditer(rest)], dates


# A VERSION IS PART OF A NAME, NOT A CLAIM (refuter, 2026-09-24: "Fable 5.1" / "GPT-6" made R4
# ask only "does the page mention the model"). A small number glued to a name by a hyphen
# (GPT-6, GPT-5.5) or standing right after a bare name (Fable 5.1, Astra 6, Opus 5.5) is dropped
# from the claim's numbers. A name carrying a case suffix is not followed by its version:
# "Astra'nın 11 testi" keeps its 11. A lower-case "fable 5.1" counts when the question itself
# names that word with that version.
VERSIONISH = re.compile(r"\d{1,2}(?:[.,]\d{1,2}){0,2}")
# …BUT A QUANTITY AFTER A NAME IS STILL A CLAIM: "Fable 24 saat", "Astra 3 Eylül'de", "Fable 2,4 kat",
# "Fable 53 puan" keep their numbers. A number is a version only when no unit, month or count
# noun follows it (and no x / % / k is glued to it).
# A measure takes any number ("2,4 kat", "3,5 saat"); a count noun takes only a whole one — "Fable
# 5.1 kullanıcıları" are the users OF Fable 5.1, and "Astra 6 kullanıcıları" when the question
# itself names Astra 6.
MEASURE_NEXT = re.compile(
    r"(?:saat\w*|gun(?:de|den|e|u|un|luk|lugu)?|hafta\w*|ay(?:da|dan|lik|i|in)?|yil(?:da|dan|lik|i|in)?|"
    r"dakika\w*|saniye\w*|kat(?:i|ina|tan)?|puan\w*|dolar\w*|euro\w*|tl|lira\w*|sent|yuzde\w*|milyon\w*|"
    r"milyar\w*|bin|hours?|days?|weeks?|months?|years?|minutes?|seconds?|points?|dollars?|usd|eur|percent|"
    r"million|billion|thousand|x|k|m)")
COUNT_NEXT = re.compile(
    r"(?:kez|kere|defa|test\w*|gorev\w*|soru(?:da|dan|nun|lar\w*)?|satir\w*|dosya\w*|sayfa\w*|adim\w*|"
    r"kisi\w*|insan\w*|kullanici\w*|gelistirici\w*|yazilimci\w*|muhendis\w*|yorum\w*|baslik\w*|"
    r"oy(?:la|dan|u)?|ayri|farkli|times|tests?|tasks?|questions?|lines?|files?|pages?|steps?|people|users?|"
    r"comments?|threads?|votes?|developers?|engineers?)")


def _quantity_follows(text: str, end: int, tok: str, qversions: set[str]) -> bool:
    after = text[end:]
    if re.match(r"[xX×%]|[kKmM]\b", after):
        return True
    nxt = re.match(r"\s*([^\W\d_][\w'’]*)", after)
    if not nxt:
        return False
    w = fold(re.split(r"['’]", nxt.group(1))[0])
    if w in MONTHS or MEASURE_NEXT.fullmatch(w):
        return True
    if COUNT_NEXT.fullmatch(w):
        return bool(re.fullmatch(r"\d+", tok)) and not (num_values(tok) & qversions)
    return False


def name_number_spans(text: str, known: set[str], qwords: set[str], qversions: set[str]) -> list[tuple[int, int]]:
    spans = []
    for m in NUM.finditer(text):
        tok = m.group(1)
        if not VERSIONISH.fullmatch(tok):
            continue
        before = text[:m.start(1)]
        if re.search(r"[^\W\d_][\w.]*-$", before):
            spans.append(m.span(1))
            continue
        w = re.search(r"([^\W\d_][\w.-]*)\s$", before)
        if not w or before[:w.start(1)][-1:] in ("'", "’") or _quantity_follows(text, m.end(1), tok, qversions):
            continue
        word = w.group(1).rstrip(".-")
        f = fold(word)
        if f in MONTHS:
            continue            # "September 30", "Sep 30": a day, not a version (round 2)
        prev = before[:w.start(1)].rstrip()
        initial = not prev or prev[-1] in START_PUNCT or prev[-1] in ".!?…"
        # A SENTENCE-INITIAL NAME (round 2: "Gemini 3.1 Pro beat both…" read 3.1 as a claim):
        # a capitalised first word is a name when a dotted version or a tier word (Pro, Flash,
        # Ultra…) follows — unless the word is a measure noun ("Skor 53.3", "Ortalama 4.2").
        tier = re.match(r"\s+([A-ZÇĞİÖŞÜ][\w'’]*)", text[m.end(1):])
        tier_after = bool(tier and fold(re.split(r"['’]", tier.group(1))[0]) in TIER_WORDS)
        is_name = f not in GENERIC_ACRONYM and f not in STOP and bool(
            (len(word) >= 2 and word.isupper()) or re.search(r"[a-z][A-Z]", word)
            or (word[:1].isupper() and (not initial or f in known
                                        or (f not in MEASURE_NOUNS and ("." in tok or tier_after)))))
        if is_name or (f in qwords and any(v in qversions for v in num_values(tok))):
            spans.append(m.span(1))
    return spans


TIER_WORDS = {"pro", "flash", "ultra", "max", "mini", "nano", "lite", "plus", "turbo", "opus", "sonnet",
              "haiku", "preview", "instant", "thinking", "high", "air"}
MEASURE_NOUNS = {fold(w) for w in """skor score puan points oran rate ratio fiyat price ortalama average avg
toplam total sonuç result yaklaşık about around approximately endeks index değer value süre hız speed
maliyet cost yüzde percent ölçüm notu fark delta""".split()}


def claim_numbers(text: str, ctx: "Ctx") -> tuple[list[str], list[tuple[str, str, str]]]:
    """numbers_in(), minus the numbers that are part of a name."""
    dates = [m.groups() for m in ISO_DATE.finditer(text)]
    rest = ISO_DATE.sub(lambda m: " " * len(m.group(0)), text)
    names = name_number_spans(rest, ctx.known, ctx.qwords, ctx.qversions)
    return [m.group(1) for m in NUM.finditer(rest) if m.span(1) not in names], dates


MONTHS = {"january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6, "july": 7,
          "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
          "jan": 1, "feb": 2, "mar": 3, "apr": 4, "jun": 6, "jul": 7, "aug": 8, "sep": 9,
          "sept": 9, "oct": 10, "nov": 11, "dec": 12, "ocak": 1, "subat": 2, "mart": 3,
          "nisan": 4, "mayis": 5, "haziran": 6, "temmuz": 7, "agustos": 8, "eylul": 9,
          "ekim": 10, "kasim": 11, "aralik": 12}


def page_dates(folded: str) -> set[tuple[int, int, int]]:
    out = {(int(y), int(m), int(d)) for y, m, d in ISO_DATE.findall(folded)}
    mon = "|".join(sorted(MONTHS, key=len, reverse=True))
    for m in re.finditer(rf"\b({mon})\.?\s+(\d{{1,2}}),?\s+((?:19|20)\d\d)\b", folded):
        out.add((int(m[3]), MONTHS[m[1]], int(m[2])))
    for m in re.finditer(rf"\b(\d{{1,2}})\.?\s+({mon})\.?,?\s+((?:19|20)\d\d)\b", folded):
        out.add((int(m[3]), MONTHS[m[2]], int(m[1])))
    for m in re.finditer(r"\b(\d{1,2})\.(\d{1,2})\.((?:19|20)\d\d)\b", folded):
        out.add((int(m[3]), int(m[2]), int(m[1])))
    return out


# ================================================================== words
STOP = set(fold(w) for w in """
ve veya ile bir bu şu o da de ki mi mı mu mü için gibi daha çok en ama fakat ancak hem ya yani
olarak olan olur oldu olduğu olduğunu var yok değil her hiç ise kadar sonra önce göre üzere diye
bile sadece yalnız tüm bütün bazı biri şey ne neden nasıl hangi kim kendi onun onlar bunu bunun
buna şunu diğer başka aynı artık hâlâ hala çünkü eğer şimdi zaten yine ayrıca böyle öyle şöyle
den dan ten tan nin nın nun nün ın in un ün yı yi yu yü ya ye da de
the a an and or but of to in on for with as at by from is are was were be been being it its
this that these those not no yes than then so if has have had do does did can could would
should will just more most very also only about into over after before there their they them
we you he she his her our your i me my what which who whom how why when where all any some
one than too via per vs etc
""".split())


def words(text: str) -> list[str]:
    """Content words: folded, the Turkish suffix after an apostrophe cut off, stopwords out."""
    out = []
    for tok in re.findall(r"[^\W\d_][\w'’]*", text):
        w = fold(re.split(r"['’]", tok)[0])
        if len(w) >= 3 and w not in STOP:
            out.append(w)
    return out


SPELLED = re.compile(r"\b(iki|uc|dort|bes|alti|yedi|sekiz|dokuz|yirmi|otuz|kirk|elli|altmis|yetmis|"
                     r"seksen|doksan|yuz|bin|milyon|milyar|trilyon|yari|yarisi|yarim|two|three|four|"
                     r"five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|hundred|"
                     r"thousand|million|billion|dozen|half|twice|double|triple|quadruple)\b")
MONTH_WORD = re.compile(r"\b(" + "|".join(m for m in MONTHS if m != "may") + r")\b")
CURRENCY = re.compile(r"[$€£¥₺]|\b(usd|eur|tl|dolar|dollars?|euro|lira|cents?|kurus)\b")
# A superlative or a share of a crowd is a claim in both languages: "most developers" was one and
# "geliştiricilerin çoğu" was not (refuter, 2026-09-24). "En azından bir hafta deneyin" is advice.
SUPERLATIVE = re.compile(r"\ben\s+(?!az\b|azindan\b)[a-z]\w*|\b(acik ara|birinci|lider|rekor|cogu|"
                         r"cogunlug\w*|buyuk kismi|yarisindan|majority|best|worst|most|least|"
                         r"leading|largest|biggest|smallest|highest|lowest|fastest|slowest|cheapest|"
                         r"greatest|strongest|weakest|newest|latest|oldest|easiest|hardest|number one)\b")
GENERIC_ACRONYM = {"ai", "api", "ceo", "cto", "ui", "ux", "gpu", "cpu", "llm", "ok", "tl", "dr", "us",
                   "eu", "pdf", "url", "html", "css", "js", "sql", "faq", "id", "it", "vs", "q", "a"}
START_PUNCT = set(":“\"'(—–-•*>|[«„")


def proper_tokens(text: str, known: set[str] | None = None) -> list[str]:
    """The names in a claim. A capital mid-sentence is a name; so is a Turkish name with its
    suffix after an apostrophe (Fable'ı, OpenAI'nin), CamelCase, an ACRONYM, or a word with a digit
    in it (GPT-6). A capital at the START of a sentence is a name only when the same word is
    capitalized mid-sentence somewhere else in the answer (`known`)."""
    found = []
    for m in re.finditer(r"[^\W\d_][\w'’.-]*", text):
        tok = m.group(0).rstrip(".-")
        core = re.split(r"['’]", tok)[0]
        if not core or not core[0].isalpha():
            continue
        f = fold(core)
        prev = text[:m.start()].rstrip()
        initial = not prev or prev[-1] in START_PUNCT or prev[-1] in ".!?…"
        if f in GENERIC_ACRONYM:
            continue
        if len(core) >= 2 and core.isupper():
            found.append(f)
        elif re.fullmatch(r"[A-ZÇĞİÖŞÜ][\w.-]*['’][a-zçğıöşü]+", tok) or re.search(r"[a-z][A-Z]", core) \
                or (core[0].isupper() and any(c.isdigit() for c in tok)):
            found.append(f)
        elif core[0].isupper() and not initial and f not in STOP and f != "i":
            found.append(f)
        elif core[0].isupper() and initial and known and f in known:
            found.append(f)
        elif core[0].isupper() and initial and f not in STOP and f not in MEASURE_NOUNS and (
                re.match(r"\s+\d{1,2}\.\d", text[m.end():])
                or fold((re.match(r"\s+([^\W\d_]+)", text[m.end():]) or [None, ""])[1]) in TIER_WORDS):
            found.append(f)     # "Gemini 3.1 Pro …", "Gemini Pro …" — not "Kodda Gemini …"
    return found


def is_factual(unit_text: str, kind: str, known: set[str]) -> bool:
    if kind == "quote":
        return True                      # a quote is a claim about what a named person said
    t = bare(unit_text)
    f = fold(t)
    return bool(re.search(r"\d", t) or SPELLED.search(f) or MONTH_WORD.search(f) or CURRENCY.search(t.lower())
                or SUPERLATIVE.search(f) or proper_tokens(t, known))


# ================================================================== sentences
ABBR = {fold(a) for a in """vs ör örn vb vd bkz dr prof doç inc ltd co corp etc no nr st mr mrs ms jr sr
yy sn av yrd uzm min max yak ca approx fig vol ed al jan feb mar apr jun jul aug sep sept oct nov dec
e.g i.e cf ref op ibid bk""".split()}
_MASK = {".": "", "!": "", "?": "", "…": ""}
_UNMASK = {v: k for k, v in _MASK.items()}
TERM = re.compile(r"[.!?…]+[\"”’»)\]*_]*(?:\s?\[\d{1,4}\])*(?=\s)")


def split_sentences(text: str) -> list[str]:
    """Split on . ! ? … followed by a capital, a digit, a %/currency/~ sign or a lower-case-initial
    name like iPhone — never inside a quote, never after "vs." / "örn.", never inside 5.1 or 2.904
    (no space there to split on). "…kısmı X. Reddit…" splits: a lone capital before a full stop is
    a word, not an initial. A marker written after the full stop ("…bitti. [3]") stays with the
    sentence it cites."""
    def mask(m):
        return "".join(_MASK.get(c, c) for c in m.group(0))
    masked = re.sub(r"“[^”]{1,600}”|\"[^\"\n]{1,600}\"|«[^»]{1,600}»|„[^“”]{1,600}[“”]"
                    r"|‘(?:[^’]|’(?=\w)){1,600}’", mask, text)
    out, start = [], 0
    for m in TERM.finditer(masked):
        nxt = re.match(r"\s+([\[(\"“‘«*_]*)(\S+)", masked[m.end():])
        if not nxt:
            continue
        head = nxt.group(2)
        if not (head[0].isupper() or head[0].isdigit() or head[0] in "%$€£₺~"
                or re.match(r"[a-zçğıöşü]+[A-Z]", head)):
            continue
        if nxt.group(1).startswith("[") and re.match(r"\s+\[\d{1,4}\]", masked[m.end():]):
            continue
        if m.group(0).startswith(".") and not m.group(0).startswith(".."):
            w = re.search(r"([^\W\d_][\w.]*)$", masked[start:m.start()])
            if w and fold(w.group(1)).strip(".") in ABBR:
                continue
        out.append(masked[start:m.end()])
        start = m.end()
    out.append(masked[start:])
    return ["".join(_UNMASK.get(c, c) for c in s).strip() for s in out if s.strip()]


# ================================================================== the answer's structure
@dataclass
class Unit:
    kind: str                 # para | list | quote | row | heading
    text: str                 # the markdown of this sentence / row / quote block
    line: int                 # 1-based line where it starts
    followup: bool = False
    header: list = field(default_factory=list)   # a table row's header cells
    cells: list = field(default_factory=list)


HEADING = re.compile(r"^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$")
HR = re.compile(r"^\s{0,3}([-*_])(\s*\1){2,}\s*$")
FENCE = re.compile(r"^\s{0,3}(```|~~~)")
LIST_ITEM = re.compile(r"^\s*(?:[-*+•]|\d{1,3}[.)])\s+(.*)$")
TABLE_SEP = re.compile(r"^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$")
FOLLOWUP = re.compile(r"^(takip sorulari|follow[- ]?up questions)\b")
OPENS_QUOTE = re.compile(r"^\s*[*_]{0,3}\s*[“\"«„‘]")


def cells_of(line: str) -> list[str]:
    s = line.strip()
    if s.startswith("|"):
        s = s[1:]
    if s.endswith("|"):
        s = s[:-1]
    return [c.strip() for c in s.split("|")]


def parse(md: str) -> tuple[list[Unit], list[tuple[int, str]], list[int]]:
    """(units, headings [(line, text)], code line numbers)."""
    lines = md.splitlines()
    units: list[Unit] = []
    heads: list[tuple[int, str]] = []
    code: list[int] = []
    in_code = False
    buf: list[tuple[int, str]] = []
    buf_kind, buf_line = "", 0
    table: list[tuple[int, str]] = []

    def flush():
        nonlocal buf, buf_kind
        if buf and buf_kind == "quote":
            # ONE QUOTE PER LINE THAT OPENS ONE. The 2026-09-20 report stacked four quotes on four
            # consecutive `>` lines; a wrapped quote's next line, or its "— author" line, joins
            # the quote above it. A `>` block that opens with no quote mark is a callout: prose.
            groups: list[tuple[int, list[str]]] = []
            for ln, x in buf:
                if OPENS_QUOTE.match(x) or not groups:
                    groups.append((ln, [x]))
                else:
                    groups[-1][1].append(x)
            for ln, xs in groups:
                text = " ".join(x.strip() for x in xs)
                if OPENS_QUOTE.match(xs[0]):
                    units.append(Unit("quote", text, ln))
                else:
                    units.extend(Unit("para", s, ln) for s in split_sentences(text))
        elif buf:
            text = " ".join(x.strip() for _, x in buf)
            for s in split_sentences(text):
                units.append(Unit(buf_kind, s, buf_line))
        buf, buf_kind = [], ""

    def flush_table():
        nonlocal table
        if not table:
            return
        header: list[str] = []
        rows = table
        if len(table) >= 2 and TABLE_SEP.match(table[1][1]):
            header, rows = cells_of(table[0][1]), table[2:]
        for ln, row in rows:
            if TABLE_SEP.match(row):
                continue
            units.append(Unit("row", row.strip(), ln, header=header, cells=cells_of(row)))
        table = []

    for i, raw in enumerate(lines, 1):
        if FENCE.match(raw):
            flush(); flush_table()
            in_code = not in_code
            code.append(i)
            continue
        if in_code:
            code.append(i)
            continue
        if not raw.strip():
            flush(); flush_table()
            continue
        h = HEADING.match(raw)
        if h:
            flush(); flush_table()
            heads.append((i, h.group(2)))
            units.append(Unit("heading", h.group(2), i))
            continue
        if HR.match(raw):
            flush(); flush_table()
            continue
        if raw.lstrip().startswith("|"):
            flush()
            table.append((i, raw))
            continue
        flush_table()
        q = re.match(r"^\s{0,3}>\s?(.*)$", raw)
        if q:
            if buf_kind != "quote":
                flush()
                buf_kind, buf_line = "quote", i
            buf.append((i, q.group(1)))
            continue
        li = LIST_ITEM.match(raw)
        if li:
            flush()
            buf_kind, buf_line = "list", i
            buf.append((i, li.group(1)))
            continue
        if buf_kind == "quote":
            flush()
        if not buf:
            buf_kind, buf_line = "para", i
        buf.append((i, raw))
    flush(); flush_table()
    # THE FOLLOW-UP SECTION HOLDS QUESTIONS, NOT A PARKING SPOT (refuter, 2026-09-24: an uncited
    # "Not: … %71 … 3 kat pahalı" under the heading escaped R2 and R4). Only a unit that IS a
    # question is a follow-up; anything else there is judged like the body.
    fu_line = None
    for ln, t in heads:
        if FOLLOWUP.match(fold(plain(t)).strip()):
            fu_line = ln
    if fu_line is not None:
        nxt = [ln for ln, _ in heads if ln > fu_line]
        end = nxt[0] if nxt else 10 ** 9
        for u in units:
            if fu_line <= u.line < end and u.kind != "heading" and is_question(u.text):
                u.followup = True
    return units, heads, code


def is_question(s: str) -> bool:
    """Ends with '?' once markers, emphasis, closing quotes and brackets are off the end."""
    s = MARK.sub("", plain(s)).strip().rstrip("”\"'’»)]*_ ").strip()
    return s.endswith(("?", "？"))


def body_units(units: list[Unit]) -> list[Unit]:
    return [u for u in units if u.kind != "heading" and not u.followup]


def known_names(units: list[Unit]) -> set[str]:
    known: set[str] = set()
    for u in body_units(units):
        for cell in (u.cells or [u.text]):
            for s in split_sentences(bare(cell)) or [bare(cell)]:
                known.update(proper_tokens(s))
    return known


GENERIC_LABELS = {"news", "dev", "community", "forum", "forums", "blog", "www", "app", "docs", "help",
                  "support", "mail", "web", "example", "medium"}


def seed_names(reg: dict[int, dict], question: str) -> set[str]:
    """Names the answer may open a sentence with: the registry's sites and title words, and the
    question's own names — "Cursor yeni fiyatlandırmayı…" is a claim about a company when the run
    read cursor.com, even at the start of a sentence (refuter, 2026-09-24)."""
    out: set[str] = set()
    for s in reg.values():
        if s.get("kind") == "count":
            continue
        dom = s.get("domain") or S.domain_of(str(s.get("url") or ""))
        label = rlib.registrable_domain("https://" + dom).split(".")[0] if dom else ""
        if len(label) >= 3 and label not in GENERIC_LABELS:
            out.add(fold(label))
        for tok in re.findall(r"[^\W\d_][\w'’.-]*", str(s.get("title") or ""))[1:]:
            core = re.split(r"['’]", tok.rstrip(".-"))[0]
            if core[:1].isupper() and len(core) >= 3 and fold(core) not in STOP:
                out.add(fold(core))
    for sent in split_sentences(bare(question)):
        out.update(proper_tokens(sent))
    return out


def build_ctx(units: list[Unit], reg: dict[int, dict], question: str) -> Ctx:
    ctx = Ctx()
    body = body_units(units)
    ctx.known = known_names(units) | seed_names(reg, question)
    q = bare(question)
    ctx.qwords = {fold(re.split(r"['’]", w)[0]) for w in re.findall(r"[^\W\d_][\w'’]*", q)}
    for m in NUM.finditer(q):
        if VERSIONISH.fullmatch(m.group(1)) and re.search(r"[^\W\d_][\w.]*[\s-]$", q[:m.start(1)]):
            ctx.qversions |= num_values(m.group(1))
    for sent in split_sentences(q) or [q]:
        ctx.topic.update(n for n in proper_tokens(sent, ctx.known) if len(n) >= 2)
    if len(body) >= 6:
        df_w: dict[str, int] = {}
        df_n: dict[str, int] = {}
        for u in body:
            t = bare(u.text)
            for w in set(words(t)):
                df_w[w] = df_w.get(w, 0) + 1
            for n in set(proper_tokens(t, ctx.known)):
                df_n[n] = df_n.get(n, 0) + 1
        ctx.common = {w for w, n in df_w.items() if n / len(body) > 0.30}
        ctx.common_names = {w for w, n in df_n.items() if n / len(body) > 0.30}
    return ctx


# ================================================================== the run's machine count
# WHO COUNTS AS PEOPLE (refuter, 2026-09-24: "2.904 Reddit kullanıcısı", "2.904'ten fazla kişi",
# "Okunan kişi sayısı: 2.904", "2.904 yazılımcı", "2,904 Reddit users", "2,904 engineers and
# redditors", "2.904 farklı hesap" all walked past R5; round 2 added "2.904 Reddit ve HN
# kullanıcısı", "2,904 software engineers", "2.904'ü aşkın kişi"…). Up to three modifiers — a
# platform name or a listed adjective — may stand between the number and the noun (see
# count_mentions), "'ten fazla / 'ü aşkın / 'ün üzerinde / 'e yakın" may follow the number, and
# the count may come after the noun: "kişi sayısı: 2.904".
# A TURKISH UNIT IS A WHOLE WORD: the unit, then only its own inflection — "-lık", plural,
# possessive, case, "-ki", the copula and the person ending (hesap, hesabı, hesapları,
# kullanıcılarımızın, kişilik). "Pro planda $10 hesaplama kredisi…" was flagged as ten people on
# 2026-09-24: `hesap\w*` took "hesaplama" (computation). Measured on the repository's own Turkish
# text the same day, the old `\w*` also took kısıt/kısıtlı (a constraint), kişisel (personal) and
# insansız (unmanned); this grammar accepts all 98 real inflections found and none of those.
TR_INFL = (r"(?:l[iu][kg])?(?:l[ae]r)?(?:[iu]?m[iu]z|[iu]?n[iu]z|[iu]?m|[iu]?n|s?[iu])?"
           r"(?:n?[iu]n|y?[iu]|y?[ae]|n[ae]|n?[dt][ae]n?|y?l[ae])?(?:ki)?"
           r"(?:y?[dt][iu]|y?m[iu]s)?(?:[dt][iu]r(?:l[ae]r)?|y?[iu]m|s[iu]n(?:[iu]z)?|y?[iu]z|l[ae]r|k)?")
PEOPLE = (r"(?:kisi|insan|kullanici|gelistirici|yazilimci|programci|muhendis|uye|hesa[pb]|yorumcu|katilimci|"
          r"profesyonel)" + TR_INFL + r"|people|persons?|users?|developers?|devs|engineers?|"
          r"programmers?|redditors?|members?|accounts?|commenters?|participants?|respondents?|individuals?|"
          r"humans?|professionals?")
# A NUMBER AFTER A CURRENCY SIGN IS MONEY, NEVER PEOPLE: "$10 hesaplama kredisi", "AED 99 kullanıcı
# başına". Matched on the text before the number, folded or as written.
MONEY_BEFORE = re.compile(r"(?:[$€£¥₺]|\b(?:aed|usd|eur|gbp|tl))\s*~?\s*$", re.I)
COMMENTS = r"yorum\w*|comments?"
THREADS = r"baslik\w*|threads?"
# "'ten fazla", "'ü aşkın", "'ün üzerinde", "'e yakın", "civarı" — folded: ı→i, ü→u
MORE = (r"(?:['’](?:[dt][ae]n|[dt][ae]|[yn]?[iu]n|[yn]?[aeiu])\s*)?"
        r"(?:(?:fazla|askin|uzeri\w*|civari\w*|kadar|yakin|more|over)\s+)?")
# "1,5 milyon kullanıcı" and "10k+ users" are people-numbers too: a decimal, then a multiplier
NUM_TXT = (r"(?<![\w.,])~?\s*(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*"
           r"(?:(bin|milyon|milyar|thousand|million|billion|k|m)\b\s*)?\+?\s*")
COUNT_REV =re.compile(rf"(?:\b({PEOPLE})\s+(?:sayisi|sayimi|count|number)|\bnumber of ({PEOPLE}))\s*[:=]?\s*"
                       r"~?\s*(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)(?:\s*(bin|milyon|milyar|k|m)\b)?")
BEYAN = re.compile(r"\bbeyan\w*|\bclaim(ed|s)?\b")
NEGATION = {"degil", "degildir", "not", "no", "yok"}


def machine_counts(run: Path | None) -> tuple[dict[str, set[int]], list[str]]:
    """sources.py owns how the run's count is read; R5 and the registry must agree on it."""
    return S.machine_counts(run)


def beyan_near(folded: str, a: int, b: int, window: int = 8) -> bool:
    """A 'beyan'/'claimed' within `window` words of the number phrase [a, b) — and not negated:
    "avcıların beyanına göre değil" says the opposite of a claim label."""
    left = folded[:a].split()[-window:]
    right = folded[b:].split()[:window]
    for toks in (left, right):
        for j, tok in enumerate(toks):
            if BEYAN.search(tok):
                # two words: "beyanına göre değil" negates; "beyandır ve sayım değildir" does not
                after = [t.strip(".,;:!?()") for t in toks[j + 1:j + 3]]
                before = [t.strip(".,;:!?()") for t in toks[max(0, j - 1):j]]
                if not (NEGATION & set(after)) and not ({"not", "no"} & set(before)):
                    return True
    return False


def int_values(tok: str) -> set[int]:
    return {int(Decimal(v)) for v in num_values(tok) if Decimal(v) == int(Decimal(v))}


def fold_map(s: str) -> tuple[str, list[int]]:
    """fold(), plus where each folded character came from — so a match is shown as written."""
    out, idx = [], []
    for i, ch in enumerate(s):
        f = fold(ch)
        out.append(f)
        idx.extend([i] * len(f))
    return "".join(out), idx


@dataclass
class Mention:
    kind: str        # people | comments | threads
    tok: str         # the number as written, a multiplier kept ("10k" is never a count of 10)
    phrase: str      # the phrase as written
    fa: int          # its span in the folded plain text — for the "beyan" window
    fb: int
    beyan: bool      # a non-negated "beyan"/"claimed" stands near it


def count_mentions(text: str, ctx: "Ctx | None" = None) -> list[Mention]:
    """'1.480 ayrı kişi', '2.904 Reddit kullanıcısı', 'kişi sayısı: 2.904', '166 yorum', '6 başlık'.
    A version glued to a name is not a count: "Fable 5.1 kullanıcıları" names no number of people."""
    p = plain(text)
    f, idx = fold_map(p)
    names = name_number_spans(p, ctx.known, ctx.qwords, ctx.qversions) if ctx else []
    out: list[Mention] = []

    def add(kind, m, g_num, g_mult, end=None):
        end = m.end() if end is None else end
        a, b = m.start(), end - 1
        while a < b and f[a].isspace():
            a += 1
        na = idx[m.start(g_num)] if idx else 0
        if any(s <= na < e for s, e in names) or MONEY_BEFORE.search(f[:m.start(g_num)]):
            return
        out.append(Mention(kind, m.group(g_num) + (m.group(g_mult) or ""),
                           p[idx[a]:idx[b] + 1].strip() if idx else m.group(0), m.start(), end,
                           beyan_near(f, m.start(), end)))

    # THE NUMBER, THEN AT MOST THREE MODIFIERS, THEN THE NOUN (round 2: "2.904 Reddit ve HN
    # kullanıcısı", "2,904 software engineers", "2.904 Reddit/X kullanıcısı" all escaped). Only a
    # platform name (capitalised as written) or a listed modifier may stand in between, joined by
    # ve / and / , / "/"; any other word ends the scan — "3 yeni model çıktı ve kullanıcılar…" is
    # not a count of people.
    for m in NUM_START.finditer(f):
        pos, free = m.end(), 0
        while True:
            tm = re.match(r"(\s*(?:,|/|&|\+|\bve\b|\band\b)?\s*)([^\W\d_][\w'’.-]*)", f[pos:])
            if not tm:
                break
            core = re.split(r"['’]", tm.group(2))[0].rstrip(".-")
            kind = next((k for k, rx in NOUN_KIND if rx.fullmatch(core)), None)
            if kind:
                add(kind, m, 1, 2, end=pos + tm.end(2))
                break
            written = p[idx[pos + tm.start(2)]] if idx else ""
            if free < 3 and (core in MODIFIERS or written.isupper()):
                free += 1
                pos += tm.end()
                continue
            break
    for m in COUNT_REV.finditer(f):
        add("people", m, 3, 4)
    return out


NUM_START = re.compile(NUM_TXT + MORE)
NOUN_KIND = [("people", re.compile(PEOPLE)), ("comments", re.compile(COMMENTS)), ("threads", re.compile(THREADS))]
MODIFIERS = {fold(w) for w in """ayrı farklı gerçek eşsiz tekil benzersiz aktif yazılım profesyonel deneyimli
kıdemli genç yerli yabancı bağımsız doğrulanmış kayıtlı ücretli ücretsiz kurumsal açık kaynak türk distinct unique
separate different real individual active software professional senior junior experienced independent verified
registered paid free enterprise open source turkish german chinese american european indie reddit x twitter hn
hacker news youtube github forum""".split()}


# ================================================================== pages
class _HTMLText(HTMLParser):
    SKIP = {"script", "style", "svg", "template", "iframe"}
    BLOCK = {"p", "div", "br", "li", "tr", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6",
             "section", "article", "blockquote", "pre", "table", "ul", "ol", "header", "footer"}
    META = {"description", "og:title", "og:description", "twitter:title", "twitter:description"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.text: list[str] = []
        self.meta: list[str] = []
        self.skip = 0
        self.ldjson = False
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in self.SKIP:
            if tag == "script" and (a.get("type") or "").lower() == "application/ld+json":
                self.ldjson = True
            else:
                self.skip += 1
            return
        if tag == "meta" and (a.get("name") or a.get("property") or "").lower() in self.META:
            self.meta.append(a.get("content") or "")
        if tag == "title":
            self.in_title = True
        for k in ("datetime", "title"):
            v = a.get(k)
            if v and len(v) < 200 and tag in ("time", "span", "abbr", "a"):
                self.text.append(" " + v + " ")
        if tag in self.BLOCK:
            self.text.append("\n")

    def handle_endtag(self, tag):
        if tag in self.SKIP:
            if tag == "script" and self.ldjson:
                self.ldjson = False
            elif self.skip:
                self.skip -= 1
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.meta.insert(0, data)
        elif self.ldjson:
            self.meta.append(data)
        elif not self.skip:
            self.text.append(data)


def html_text(doc: str) -> tuple[str, str]:
    """(what the site gave for this URL in title/meta/JSON-LD, the visible text incl. <noscript>)."""
    p = _HTMLText()
    try:
        p.feed(doc)
        p.close()
    except Exception:
        pass
    meta = re.sub(r"\s+", " ", html.unescape(" · ".join(x for x in p.meta if x.strip()))).strip()
    body = re.sub(r"[ \t\r\f\v]+", " ", "".join(p.text))
    body = re.sub(r"\n\s*\n+", "\n", body).strip()
    return meta, body


# A second list of wall wordings is what rlib warns against — these are the two refusals this
# ruler met on 2026-09-24 that rlib does not know yet (Reddit's "Prove your humanity" page
# answered 200 with 269 characters). They belong in rlib._WALL; until then they are named here.
EXTRA_WALL = re.compile(r"prove your humanity|verify you are human|javascript is not available", re.I)


def thin(text: str) -> bool:
    return len(re.findall(r"\w{2,}", text or "")) < 25


TR_HINT = set("çğıöşüÇĞİÖŞÜ")
TR_STOP = {"ve", "bir", "bu", "için", "ile", "da", "de", "çok", "daha", "olarak", "ama", "gibi", "değil",
           "var", "yok", "ki", "mi", "ne", "şu", "ise", "kadar", "sonra", "göre", "her", "hiç", "veya", "yani",
           "olan", "en", "o"}
EN_STOP = {"the", "and", "of", "to", "is", "for", "with", "that", "it", "in", "on", "are", "was", "this",
           "be", "as", "at", "by", "an", "or", "not", "but", "from", "have", "has", "they", "you", "we", "i",
           "if", "so", "my", "it's", "its"}


def lang_of(text: str) -> str:
    """'tr' · 'en' · 'cjk' · '?' — enough to know a Turkish sentence is being held to an English page."""
    sample = (text or "")[:20000]
    toks = re.findall(r"[^\W\d_][\w'’]*", sample.replace("İ", "i").lower())
    if not toks:
        return "?"
    cjk = len(re.findall(r"[぀-ヿ一-鿿가-힯]", sample))
    if cjk > 0.3 * sum(len(t) for t in toks):
        return "cjk"
    tr = sum(1 for t in toks if t in TR_STOP or any(c in TR_HINT for c in t))
    en = sum(1 for t in toks if t in EN_STOP)
    return "?" if tr == en == 0 else ("tr" if tr > en else "en")


class Page:
    def __init__(self, text: str, via: str, langs: set[str] | None = None):
        self.via = via
        self.text = text
        self.langs = langs if langs is not None else {lang_of(text)}
        f = fold(text)
        self.norm = " " + re.sub(r"[\W_]+", " ", f) + " "
        self.words = set(re.findall(r"\w+", f))
        self.prefixes = {w[:5] for w in self.words if len(w) >= 5}
        self.values: set[str] = set()
        toks, dates = numbers_in(f)
        for t in toks:
            self.values |= num_values(t)
        for y, m, d in dates:
            self.values |= {str(int(y)), str(int(m)), str(int(d))}
        self.dates = page_dates(f)

    def has_word(self, w: str) -> bool:
        return w in self.words or (len(w) >= 5 and w[:5] in self.prefixes)

    def has_name(self, name: str) -> bool:
        parts = re.findall(r"\w+", name)
        if len(parts) == 1:
            return self.has_word(parts[0])
        return (" " + " ".join(parts) + " ") in self.norm

    @staticmethod
    def union(pages: list["Page"]) -> "Page":
        """ONE claim, SEVERAL pages: "…2,4 kat[1] … 40 soruda 31[2]" is judged against both at once."""
        if len(pages) == 1:
            return pages[0]
        return Page("\n".join(p.text for p in pages), " + ".join(p.via for p in pages),
                    set().union(*(p.langs for p in pages)))


_host_locks: dict[str, threading.Lock] = {}
_host_last: dict[str, float] = {}
_locks_guard = threading.Lock()


def _polite(url: str):
    host = urlsplit(url).hostname or ""
    with _locks_guard:
        lock = _host_locks.setdefault(host, threading.Lock())
    return lock, host


def http_get(url: str, timeout: int = 20) -> tuple[int, str, str]:
    """(status, content type, body). Waits out a 429/503 twice before giving up; one host at a time."""
    lock, host = _polite(url)
    with lock:
        for attempt in range(3):
            gap = time.monotonic() - _host_last.get(host, 0)
            if gap < 1.0:
                time.sleep(1.0 - gap)
            _host_last[host] = time.monotonic()
            req = urllib.request.Request(url, headers={
                "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9,tr;q=0.8",
                "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate"})
            try:
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    raw = r.read(8_000_000)
                    enc = (r.headers.get("Content-Encoding") or "").lower()
                    if enc == "gzip":
                        raw = gzip.decompress(raw)
                    elif enc == "deflate":
                        raw = zlib.decompress(raw)
                    cs = r.headers.get_content_charset()
                    if not cs:
                        m = re.search(rb"<meta[^>]+charset=[\"']?([\w-]+)", raw[:4000], re.I)
                        cs = m.group(1).decode() if m else "utf-8"
                    try:
                        body = raw.decode(cs, "replace")
                    except LookupError:
                        body = raw.decode("utf-8", "replace")
                    return r.status, r.headers.get_content_type(), body
            except urllib.error.HTTPError as e:
                if e.code in (429, 503) and attempt < 2:
                    try:
                        wait = int(e.headers.get("Retry-After") or 0)
                    except ValueError:
                        wait = 0
                    time.sleep(min(10, wait or 3 * (attempt + 1)))
                    continue
                return e.code, "", ""
            except Exception as e:  # timeout, DNS, TLS
                return 0, str(e)[:60], ""
    return 0, "retries exhausted", ""


def fetch_http(url: str) -> tuple[Page | None, str]:
    code, ctype, body = http_get(url)
    why = f"http {code or ctype}"
    if code == 200 and body:
        if "html" in ctype or body.lstrip()[:1] == "<":
            meta, visible = html_text(body)
        else:
            meta, visible = "", body
        full = (meta + "\n" + visible).strip()
        if not (rlib.looks_like_wall(visible) or EXTRA_WALL.search(visible[:3000]) or thin(visible)):
            return Page(full, "http"), ""
        if len(meta) >= 80 and not rlib.looks_like_wall(meta):
            # the site's own title/description for THIS url (a post's text on x.com, a video's
            # title on YouTube) is content even when the page around it is a JS shell
            return Page(meta, "http (title/meta only)"), ""
        why = "http 200 but a wall / empty shell"
    if code in (404, 410):
        return None, why
    code2, _, jb = http_get("https://r.jina.ai/" + url, timeout=40)
    if code2 == 200 and jb and not (rlib.looks_like_wall(jb) or EXTRA_WALL.search(jb[:3000]) or thin(jb)
                                     or re.search(r"^Warning: Target URL returned error", jb, re.M)):
        return Page(jb, "jina (cached snapshot)"), ""
    return None, f"{why} → jina {code2 or 'error'}"


def fetch_fetchpy(url: str) -> tuple[Page | None, str]:
    """The full reading chain, `python3 fetch.py <url>` — its own door and snapshot flag kept."""
    with tempfile.TemporaryDirectory() as td:
        out = Path(td) / "page.txt"
        try:
            p = subprocess.run(["python3", str(HERE / "fetch.py"), url, "--out", str(out), "--json"],
                               capture_output=True, text=True, timeout=600)
        except subprocess.TimeoutExpired:
            return None, "fetchpy timed out"
        # the JSON is printed last, its top-level brace at column 0; anything a door printed
        # before it must not turn a read page into "unreachable"
        out_txt = p.stdout or ""
        at = 0 if out_txt.startswith("{") else out_txt.rfind("\n{") + 1
        try:
            meta = json.JSONDecoder().raw_decode(out_txt, at)[0] if at >= 0 and out_txt[at:at + 1] == "{" else {}
        except ValueError:
            meta = {}
        if meta.get("read") and out.is_file():
            via = f"fetchpy:{meta.get('door')}" + (" (cached snapshot)" if meta.get("cached_snapshot") else "")
            return Page(out.read_text(encoding="utf-8-sig", errors="replace"), via), ""
        return None, f"fetchpy: {meta.get('liveness') or 'unread'} (exit {p.returncode})"


# ================================================================== R4's judge
def attribution_cut(t: str) -> str:
    """A quote's tail — '— author, platform, date' — is metadata, not the claim."""
    return re.split(r"(?<=[”\"»’“])\s*[—–]\s", t, maxsplit=1)[0]


def single_quotes(t: str) -> list[tuple[int, int]]:
    """‘…’ spans (inner start, inner end). The closing ’ is also the Turkish apostrophe ("5.1’i"),
    so a closer is a ’ not followed by a letter — the LAST such one before the attribution dash
    when the line has one, else the first one after the opener (refuter, round 2)."""
    out, i = [], 0
    while True:
        a = t.find("‘", i)
        if a < 0:
            return out
        dash = re.search(r"\s[—–]\s", t[a:])
        closers = [a + 1 + m.start() for m in re.finditer(r"’(?!\w)", t[a + 1:])]
        if dash:
            closers = [c for c in closers if c < a + dash.start()] or closers
            end = closers[-1] if closers else -1
        else:
            end = closers[0] if closers else -1
        if end < 0:
            return out
        out.append((a + 1, end))
        i = end + 1


def quotes_of(t: str) -> list[str]:
    qs = re.findall(r"“([^”]{2,})”|\"([^\"]{2,})\"|«([^»]{2,})»|„([^“”]{2,})[“”]", t)
    return [next(x for x in g if x) for g in qs] + [t[a:b] for a, b in single_quotes(t)]


def quote_found(q: str, page: Page) -> bool:
    """EVERY piece of the quote must stand on the page: the words after an ellipsis ("… not
    anymore") and inside an editor's bracket ("[so we dropped it for good]") are the quote's words
    too — round 2 showed that skipping the short ones lets an invented tail through."""
    parts = [p for p in re.split(r"\.\.\.|…|\[|\]", q) if re.search(r"\w", p)]
    for p in parts or [q]:
        n = " " + re.sub(r"[\W_]+", " ", fold(p)).strip() + " "
        if n.strip() and n not in page.norm:
            return False
    return True


@dataclass
class Ctx:
    """What every judgement needs to know about the answer and its question."""
    known: set = field(default_factory=set)          # names seen in the answer, the question, the registry
    qwords: set = field(default_factory=set)         # every folded word of the question
    qversions: set = field(default_factory=set)      # version-like numbers the question names ("6", "5.1")
    topic: set = field(default_factory=set)          # the question's own names: the subject, not evidence
    common: set = field(default_factory=set)         # content words in > 30 % of the answer's sentences
    common_names: set = field(default_factory=set)   # names in > 30 % of them


def names_to_check(t: str, ctx: Ctx) -> list[str]:
    """The names a claim can be checked by across languages: not the question's subject, not a
    name glued to the subject ("Claude Fable", "GPT-6 Astra"), not one the whole answer repeats."""
    toks = [(m.start(), m.end(), fold(re.split(r"['’]", m.group(0).rstrip(".-"))[0]))
            for m in re.finditer(r"[^\W\d_][\w'’.-]*", t)]
    names = set(proper_tokens(t, ctx.known))
    out = []
    for j, (_a, _b, f) in enumerate(toks):
        if f not in names or len(f) < 2 or f in ctx.topic or f in ctx.common_names:
            continue
        near = [toks[k][2] for k in (j - 1, j + 1) if 0 <= k < len(toks)
                and re.fullmatch(r"[\s-]", t[min(toks[j][1], toks[k][1]):max(toks[j][0], toks[k][0])] or "-")]
        if any(n in ctx.topic for n in near):
            continue
        out.append(f)
    return list(dict.fromkeys(out))


def judge(u: Unit, page: Page, ctx: Ctx) -> tuple[str, str]:
    """SUPPORTED · UNSUPPORTED · UNJUDGEABLE, with the reason.

    A quote is judged by its text: it must stand on the page, and its numbers must too — a
    fabricated quote that borrows the page's numbers is not a quote from that page (refuter,
    2026-09-24). A claim number decides a sentence with no quote. With neither, the words decide;
    across languages the words cannot match, so only names outside the question's subject can,
    and a sentence without such a name is UNJUDGEABLE — printed, and kept out of the ratio."""
    t = bare(u.text)
    qunit = is_quote(u)
    if qunit:
        t = attribution_cut(t)
    # a quote line's quote always counts; inside a sentence only a quote of 3+ words is one —
    # "duvara fırlatma" in quote marks is a term
    qs = [q for q in quotes_of(t) if qunit or len(re.findall(r"\w+", q)) >= 3]
    toks, dates = claim_numbers(t, ctx)
    parts, ok = [], True
    if qs:
        found = sum(1 for q in qs if quote_found(q, page))
        ok = found == len(qs)
        parts.append(f"quote {found}/{len(qs)} verbatim on the page")
    if toks or dates:
        miss = [x for x in toks if not (num_values(x) & page.values)]
        miss += ["-".join(d) for d in dates if (int(d[0]), int(d[1]), int(d[2])) not in page.dates]
        total = len(toks) + len(dates)
        ok = ok and not miss
        parts.append(f"numbers {total - len(miss)}/{total}" + (f", missing {', '.join(miss)}" if miss else ""))
    if parts:
        return ("SUPPORTED" if ok else "UNSUPPORTED"), " · ".join(parts)
    ul = lang_of(t)
    if ul in ("tr", "en", "cjk") and "?" not in page.langs and ul not in page.langs:
        names = names_to_check(t, ctx)
        pl = "/".join(sorted(page.langs))
        if not names:
            return "UNJUDGEABLE", f"a {ul} sentence on a {pl} page with no number, no quote and no name outside the question"
        hit = [n for n in names if page.has_name(n)]
        share = len(hit) / len(names)
        return ("SUPPORTED" if share >= CONTENT_MIN else "UNSUPPORTED",
                f"names {len(hit)}/{len(names)} ({ul} sentence on a {pl} page: names only)")
    # NAMES ARE NOT FREE HITS (round 2: "Gemini 3.1 Pro beat both models…" reached 6/9 on a page
    # that says Gemini was slower, two of the six being "gemini" and "pro"). Every name must be on
    # the page, and the 60 % is measured on the other content words.
    ws = list(dict.fromkeys(words(t)))
    name_parts = {x for n in proper_tokens(t, ctx.known) for x in re.findall(r"\w+", n)}
    named = [w for w in ws if w in name_parts]
    rest = [w for w in ws if w not in name_parts]
    dist = [w for w in rest if w not in ctx.common] or rest
    if not dist and not named:
        return "UNJUDGEABLE", "no number, quote or content word to check"
    lost = [n for n in named if not page.has_word(n)]
    hit = [w for w in dist if page.has_word(w)]
    share = len(hit) / len(dist) if dist else 1.0
    return ("SUPPORTED" if share >= CONTENT_MIN and not lost else "UNSUPPORTED",
            f"content words {len(hit)}/{len(dist)} ({share:.0%}) · names {len(named) - len(lost)}/{len(named)}")


# ================================================================== the rules
@dataclass
class Row:
    rule: str
    ok: bool
    head: str
    lines: list = field(default_factory=list)


def short(s: str, n: int = 150) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    return s if len(s) <= n else s[:n - 1] + "…"


META_OPEN = re.compile(
    r"^(bu (rapor|arastirma|belge|dokuman|calisma|analiz|yazi|metin|cevap|yanit|ozet|inceleme|not)\w*|"
    r"raporumuz|arastirmamiz|asagida\w*|bu soru\w*|sorunuz\w*|"
    r"(this|the following|in this) (report|document|research|analysis|answer|summary|article|note|response)|"
    r"here (is|are)\b|here's|below (is|are)\b|"
    r"(hazirlayan|tarih|soru|question|ozet|summary|konu|subject|kimden|kime|from|to)\s*:|tl;?dr)")


def r1(md: str) -> Row:
    """The first line is the answer. Not a heading, a quote, a table or a rule line; not a meta
    opening; not a question; 1–2 sentences. The question-overlap test is gone (refuter,
    2026-09-24): the ideal direct answer — "Profesyoneller şu an Fable 5.1'i tercih ediyor[1]." —
    shares almost every word with the question, and it failed."""
    first, ln = "", 0
    for i, raw in enumerate(md.splitlines(), 1):
        if raw.strip():
            first, ln = raw, i
            break
    if not first:
        return Row("R1", False, "the answer is empty")
    s = first.strip()
    shape = ("a heading" if HEADING.match(first) else "a table row" if s.startswith("|") else
             "a quote" if s.startswith(">") else "a code fence" if FENCE.match(first) else
             "a rule line" if HR.match(first) else "")
    if not shape and is_quote(Unit("para", re.sub(r"^\s*(?:[-*+•]|\d{1,3}[.)])\s+", "", s), ln)):
        shape = "a quote"          # “…” — author, … without a `>` is a quote too (round 2)
    if shape:
        return Row("R1", False, f"line {ln} is {shape}, not the answer", [f"L{ln}  {short(s)}"])
    t = bare(re.sub(r"^\s*(?:[-*+•]|\d{1,3}[.)])\s+", "", s))
    f = fold(t)
    if META_OPEN.match(f):
        return Row("R1", False, f"line {ln} opens with a meta phrase, not the answer", [f"L{ln}  {short(s)}"])
    if is_question(t):
        return Row("R1", False, f"line {ln} is a question, not the answer", [f"L{ln}  {short(s)}"])
    n = len(split_sentences(t))
    if n > 2:
        return Row("R1", False, f"line {ln} runs {n} sentences — the answer is 1–2", [f"L{ln}  {short(s)}"])
    return Row("R1", True, f"line {ln} is the answer in {n} sentence{'s' if n > 1 else ''}: \"{short(t, 110)}\"")


def r2(units: list[Unit], known: set[str]) -> tuple[Row, list[Unit]]:
    fact = [u for u in body_units(units) if is_factual(u.text, u.kind, known)]
    cited = [u for u in fact if MARK.search(u.text)]
    cov = len(cited) / len(fact) if fact else 1.0
    bad = [u for u in fact if not MARK.search(u.text)]
    head = (f"coverage {cov:.1%} — {len(cited)} of {len(fact)} factual sentences carry [n] "
            f"(need >= {COVERAGE_MIN:.0%})")
    return Row("R2", cov >= COVERAGE_MIN, head, [f"L{u.line}  {short(u.text)}" for u in bad[:SHOW]]), fact


def r3(md: str, units: list[Unit], code: list[int], ids: set[int]) -> Row:
    lines = md.splitlines()
    code_set = set(code)
    marks = [(i, int(m.group(1))) for i, l in enumerate(lines, 1) if i not in code_set for m in MARK.finditer(l)]
    unresolved = [(i, n) for i, n in marks if n not in ids]
    crowded = []
    for u in units:
        for piece in (u.cells or [u.text]):
            k = len(MARK.findall(piece))
            if k > MAX_MARKERS:
                crowded.append((u.line, k, piece))
    head = (f"{len(marks)} markers · {len({n for _, n in marks})} ids · {len(unresolved)} not in sources.json · "
            f"{len(crowded)} sentences with > {MAX_MARKERS} markers")
    out = [f"L{i}  [{n}] is not an id in sources.json" for i, n in unresolved[:SHOW]]
    out += [f"L{ln}  {k} markers: {short(p)}" for ln, k, p in crowded[:SHOW]]
    return Row("R3", not unresolved and not crowded, head, out)


JUDGED_MIN = 5            # R4 needs at least this many judged sentences …
JUDGED_SHARE = 0.50       # … and at least this share of the sampled ones


def r4(units: list[Unit], reg: dict[int, dict], run: Path | None, sample: int, seed: int,
       fetcher: str, verbose: bool, ctx: Ctx) -> Row:
    body = body_units(units)
    # ONE SENTENCE, ONE JUDGEMENT (refuter, 2026-09-24: "…2,4 kat[1] … 40 soruda 31[2]" failed
    # twice, because each id was held to all the sentence's numbers). A sentence is sampled once
    # and judged against the union of the pages it cites.
    pop, dangling = [], 0
    for u in body:
        ids = list(dict.fromkeys(int(x) for x in MARK.findall(u.text)))
        good = [i for i in ids if i in reg]
        dangling += len(ids) - len(good)
        if good:
            pop.append((u, good))
    k = min(sample, len(pop))
    picked = sorted(random.Random(seed).sample(range(len(pop)), k)) if k else []
    chosen = [pop[j] for j in picked]
    bodies = S.body_texts(run)

    def load(i: int):
        entry = reg[i]
        if entry.get("kind") == "count":
            # the run's own count is read where the run wrote it — the number must be in that file
            if not run:
                return i, (None, "a count source is read from --run-dir")
            f = run / str(entry.get("url") or "")
            if not f.is_file():
                return i, (None, f"count file {entry.get('url')} is not in the run folder")
            return i, (Page(f.read_text(encoding="utf-8-sig", errors="replace"), f"run:{entry['url']}"), "")
        c = S.canon(entry["url"])
        for label, text in (bodies.get(c[0], []) if c else []):
            if not (rlib.looks_like_wall(text) or EXTRA_WALL.search(text[:3000]) or thin(text)):
                return i, (Page("\n".join(t for _, t in bodies[c[0]]), label), "")
        return i, (fetch_fetchpy(entry["url"]) if fetcher == "fetchpy" else fetch_http(entry["url"]))

    pages: dict[int, tuple[Page | None, str]] = {}
    with cf.ThreadPoolExecutor(max_workers=4) as ex:
        for i, res in ex.map(load, sorted({i for _, ids in chosen for i in ids})):
            pages[i] = res
    sup, uns, unj, unr = [], [], [], []
    for u, ids in chosen:
        tag = "".join(f"[{i}]" for i in ids)
        got = [pages[i][0] for i in ids if pages[i][0] is not None]
        lost = [f"[{i}] {pages[i][1]}" for i in ids if pages[i][0] is None]
        if not got:
            verdict, reason = "UNREACHABLE", "; ".join(lost)
        else:
            page = Page.union(got)
            verdict, reason = judge(u, page, ctx)
            reason += f" · via {page.via}"
            if verdict != "SUPPORTED" and lost:
                # what is missing may sit on the page that could not be read: not a verdict
                verdict, reason = "UNREACHABLE", f"{reason}; unread: {'; '.join(lost)}"
        {"SUPPORTED": sup, "UNSUPPORTED": uns, "UNJUDGEABLE": unj, "UNREACHABLE": unr}[verdict].append((u, tag, reason))
        if verbose:
            print(f"      R4 {tag} {verdict} — {reason} · L{u.line} {short(u.text, 90)}")
    judged = len(sup) + len(uns)
    acc = len(sup) / judged if judged else 0.0
    need = max(JUDGED_MIN, math.ceil(JUDGED_SHARE * k))
    enough = judged >= need
    if not pop:
        lead = "accuracy unmeasurable (no cited sentence to re-open)"
    elif not enough:
        # AN ANSWER CANNOT PASS R4 BY MAKING ITSELF UNCHECKABLE: number-less paraphrases on
        # foreign-language pages are UNJUDGEABLE, and too many of them fail the rule.
        lead = f"not enough judgeable pairs — {judged} judged, need >= {need} (max({JUDGED_MIN}, 50 % of {k} sampled))"
    else:
        lead = f"accuracy {acc:.1%}"
    head = (f"{lead} — {len(sup)} supported / {len(uns)} unsupported (need >= {ACCURACY_MIN:.0%}) · "
            f"unjudgeable {len(unj)} · unreachable {len(unr)} · sampled {k} of {len(pop)} cited sentences, "
            f"seed {seed}, fetcher {fetcher}")
    if dangling:
        head += f" · {dangling} marker(s) with an unknown id left to R3"
    out = [f"L{u.line}  {tag} {r}: {short(u.text, 110)}" for u, tag, r in uns[:SHOW]]
    out += [f"L{u.line}  {tag} UNJUDGEABLE ({r}): {short(u.text, 90)}" for u, tag, r in unj[:SHOW]]
    out += [f"L{u.line}  {tag} UNREACHABLE ({r})" for u, tag, r in unr[:SHOW]]
    return Row("R4", enough and acc >= ACCURACY_MIN, head, out)


def r5(units: list[Unit], machine: dict[str, set[int]], where: list[str], ctx: Ctx) -> Row:
    people = sorted(machine["people"])
    found = []            # (line, number as written, phrase, sentence, beyan beside it)
    # headings too: a people-number in a title is still a claim
    for u in units:
        seen = False
        for mn in count_mentions(u.text, ctx):
            if mn.kind == "people":
                found.append((u.line, mn.tok, mn.phrase, u.text, mn.beyan))
                seen = True
        if u.kind != "row" or seen:
            continue
        # a table whose column is headed "Kişi" holds people-numbers even with no noun beside them
        for j, h in enumerate(u.header):
            if j < len(u.cells) and re.search(rf"\b({PEOPLE})\b", fold(plain(h))):
                label = BEYAN.search(fold(plain(h))) or BEYAN.search(fold(plain(u.cells[j])))
                cell = bare(u.cells[j])
                for m in NUM.finditer(cell):
                    if MONEY_BEFORE.search(cell[:m.start(1)]):
                        continue
                    found.append((u.line, m.group(1), f"{m.group(1)} ({plain(h).strip()} column)",
                                  u.text, bool(label)))
    bad, ok_count, ok_beyan = [], 0, 0
    for ln, tok, phrase, sent, beyan in found:
        if int_values(tok) & machine["people"]:
            ok_count += 1
        elif beyan:
            ok_beyan += 1
        else:
            bad.append((ln, tok, phrase, sent))
    mc = "/".join(str(p) for p in people) if people else "none found"
    head = (f"{len(found)} people-numbers · machine count {mc}"
            + (f" ({', '.join(where)})" if where else "") + f" · {ok_count} equal it · {ok_beyan} carry \"beyan\"")
    if bad:
        head += " · offenders: " + ", ".join(dict.fromkeys(t for _, t, _, _ in bad))
    out = [f"L{ln}  {phrase} ≠ {mc}, no \"beyan\" beside it: {short(sent, 100)}" for ln, _, phrase, sent in bad[:SHOW]]
    return Row("R5", not bad, head, out)


def r6(md: str) -> Row:
    hits = [(i, m.group(0)) for i, l in enumerate(md.splitlines(), 1) for m in URL_ANY.finditer(l)]
    return Row("R6", not hits, f"{len(hits)} URLs in the answer (need 0)",
               [f"L{i}  {short(u, 120)}" for i, u in hits[:SHOW]])


def r7(md: str, heads: list[tuple[int, str]]) -> Row:
    if not heads:
        return Row("R7", False, "no heading at all — no \"## Takip soruları\" / \"## Follow-up questions\" at the end")
    ln, text = heads[-1]
    if not FOLLOWUP.match(fold(plain(text)).strip()):
        fu = [h for h in heads if FOLLOWUP.match(fold(plain(h[1])).strip())]
        why = (f"\"{text}\" (line {fu[0][0]}) is not the last section" if fu else "no follow-up section")
        return Row("R7", False, f"the answer does not end with \"## Takip soruları\" / \"## Follow-up questions\""
                                f" — {why}; last heading: \"{short(text, 60)}\" (line {ln})")
    qs = [raw for raw in md.splitlines()[ln:] if raw.strip() and is_question(raw)]
    return Row("R7", len(qs) >= 3, f"\"{text}\" holds {len(qs)} question lines (need >= 3)")


def r8(md: str, mode: str) -> Row:
    # A word carries a letter or a digit: a table pipe, a list dash or an em dash is markup.
    # `wc -w` counts those too, so both are printed and the difference explains itself.
    toks = re.findall(r"\S+", md)
    n = sum(1 for t in toks if re.search(r"\w", t) and not MARK.fullmatch(t.strip(".,;:")))
    lo, hi = BANDS[mode]
    return Row("R8", lo <= n <= hi, f"{n:,} words (wc -w {len(toks):,}; markup tokens not counted) — "
                                    f"{mode} band {lo:,}–{hi:,}")


# THE "— author," FORM: a closing quote, a dash, one to four words, a comma. "…"duvara fırlatma" —
# yani deneme-yanılma — diyor" is a gloss inside a sentence, not an attributed quote (refuter).
ATTRIB = re.compile(r"[”\"»’“]\s*[*_]{0,2}\s*[—–]\s*[^\s,—–]+(?:\s+[^\s,—–]+){0,3}\s*,")
DATED = re.compile(r"(?<!\d)(?:19|20)\d\d-\d\d-\d\d(?!\d)|tarihsiz|undated")


def is_quote(u: Unit) -> bool:
    """A quote opens with a quote mark or carries the '— author,' form; nothing else is one.
    A follow-up question written in quote marks is a question, not a quote, and a sentence that
    merely opens with a quoted term — '"Kaydet" derseniz…' — is a sentence: the opening quoted
    span has to be most of the line."""
    if u.followup:
        return False
    if u.kind == "quote":
        return True
    if u.kind not in ("para", "list"):
        return False
    p = plain(u.text).strip()
    if ATTRIB.search(p):
        return True
    m = re.match(r"[*_]{0,3}\s*[“\"«„][^”\"»“]*[”\"»“]", p)
    span = len(m.group(0)) if m else 0
    if not m and re.match(r"[*_]{0,3}\s*‘", p):
        sq = single_quotes(p)
        span = sq[0][1] + 1 if sq else 0
    return bool(span and span >= 0.6 * len(MARK.sub("", p).strip()))


def r9(units: list[Unit]) -> Row:
    quotes = [u for u in units if is_quote(u)]
    bad = [u for u in quotes if not DATED.search(fold(u.text))]
    return Row("R9", not bad, f"{len(quotes)} quote lines · {len(bad)} without a YYYY-MM-DD date or TARİHSİZ",
               [f"L{u.line}  {short(u.text)}" for u in bad[:SHOW]])


# ================================================================== regression probes
# Every probe the refuter used in rounds 1 and 2, kept where it cannot be lost:
# `cite-check.py --selftest` re-runs them in a second and exits 1 on any miss. Phrases are verbatim.
SELFTEST_PEOPLE = (   # R5 must FAIL each of these (the machine count is 82)
    # round 1
    "Toplam 2.904 Reddit kullanıcısı konuştu[1].",
    "Toplam 2.904'ten fazla kişi konuştu[1].",
    "Okunan kişi sayısı: 2.904[1].",
    "Toplam 2.904 yazılımcı konuştu[1].",
    "In total 2,904 Reddit users weighed in[1].",
    "In total 2,904 engineers and redditors weighed in[1].",
    "2.904 farklı hesap yorum yazdı[1].",
    "About ~2.9k people weighed in[1].",
    "Toplam 2.9 bin kişi okundu[1].",
    "2.904 kişinin sözü, avcıların beyanına göre değil, makinenin sayımına göre okundu[1].",
    # round 2 (a6.md)
    "In total 2,904 professional developers weighed in[1].",
    "Toplam 2.904 yazılım geliştiricisi konuştu[1].",
    "Toplam 2.904 Reddit ve HN kullanıcısı konuştu[1].",
    "In total 2,904 Reddit and HN users weighed in[1].",
    "Toplam 2.904'ü aşkın kişi konuştu[1].",
    "Toplam 2.904'ün üzerinde kişi konuştu[1].",
    "2.904'e yakın kişi konuştu[1].",
    "Toplam 2.904 profesyonel konuştu[1].",
    "2,904 software engineers weighed in[1].",
    "2.904 Reddit/X kullanıcısı konuştu[1].",
    "| Platform | Kişi | Kaynak |\n|---|---|---|\n| Reddit | 2.904 | [1] |",
    "| Platform | Konuşan | Kaynak |\n|---|---|---|\n| Reddit | 2.904 kullanıcı | [1] |",
    "| Platform | Katılımcı sayısı | Kaynak |\n|---|---|---|\n| Reddit | 2.904 | [1] |",
    # 2026-09-24, the whole-word unit: its own suffixes still count ("hesabı" was missed before)
    "2.904 hesabı yorum yazdı[1].",
    "2.904 hesaplar yorum yazdı[1].",
)
SELFTEST_NOT_PEOPLE = (   # R5 must NOT fail these
    "Fable 5.1 kullanıcıları hızdan şikâyet ediyor[1].",
    "Bu koşuda makine 82 ayrı kişi saydı[1].",
    "Avcıların beyanına göre 2.904 kişi konuştu[1].",
    "2026'da 3 yeni model çıktı ve kullanıcılar memnun[1].",
    # 2026-09-24 (quick mode, chief's acceptance): "hesaplama" is not "hesap"; money is not people
    "Pro planda $10 hesaplama kredisi hangi sunucu boyutunu karşılıyor?",
    "Pro planda 10 hesaplama kredisi var[1].",
    "Takım planı $30 kullanıcı başına aylık ücret alır[1].",
    "Kurumsal plan AED 99 kullanıcı başına faturalanır[1].",
    "| Plan | Kullanıcı başına | Kaynak |\n|---|---|---|\n| Pro | $30 | [1] |",
)
SELFTEST_URLS = ("reddit.com/r/codex/comments/1wfaf7f/gpt_6_astra_vs_fable_51", "youtu.be/w9rLNOE7TjY",
                 "x.com/enzo/status/2100469552417046573",
                 "archive.ph/AbC12", "mastodon.social/@enzo/113456", "infosec.exchange/@x/1")      # round 2
SELFTEST_NOT_URLS = ("Puan 5.1/10 çıktı.", "Destek 24/7 açık.", "Node.js/Deno karşılaştırması yapıldı.",
                     "Kullanıcılar Claude.ai/ChatGPT arayüzlerini kıyasladı[1].",                          # round 2
                     "Perplexity.ai/Claude ikilisi.", "Character.ai/Replika gibi uygulamalar.",
                     "ASP.NET/Blazor ile yazıldı.", "Socket.io/WebSocket karşılaştırması.")
SELFTEST_CLAIMS = (   # (sentence, the numbers R4 must look for on the page)
    ("Fable 5.1, GPT-6 Astra'yı geride bıraktı[1].", []),
    ("Astra 6 ile çalıştım[1].", []),
    ("Fable 24 saat içinde limitimi bitirdi[1].", ["24"]),
    ("GPT-6 Astra 3 Eylül'de çıktı[1].", ["3"]),
    ("Fable 2,4 kat pahalı[1].", ["2,4"]),
    ("Astra'nın 11 testi kazandığı söyleniyor[1].", ["11"]),
    # round 2 (a2.md, a2b.md, a2c.md, b-date.md) and their controls
    ("Gemini 3.1 Pro beat both models on every coding task in the thread[2].", []),
    ("Gemini 3.1 Pro kodda iki modeli de her görevde geride bıraktı[2].", []),
    ("Kodda Gemini 3.1 Pro iki modeli de her görevde geride bıraktı[2].", []),
    ("Kodda Claude Opus 5.5 ve Gemini 3.1 Pro da yarıştı[1].", []),
    ("Gemini 3.1 Pro da bu karşılaştırmada yer aldı[1].", []),
    ("Fable 5.1 was released on September 30[1].", ["30"]),
    ("Astra shipped on Sep 30 to all users[1].", ["30"]),
    ("GPT-5.5 ile Astra 6 arasında 11 test yapıldı[1].", ["11"]),
    ("Claude Fable 5.1 was released on 30 September to all users on every paid plan[2].", ["30"]),
    ("Skor 53.3 oldu[1].", ["53.3"]),
    ("Toplam 5 Reddit kullanıcısı konuştu[1].", ["5"]),
)
SELFTEST_QUESTION = "Profesyoneller şu an Astra 6'yı mı yoksa Fable 5.1'i mi tercih ediyor?"
# the two pages the refuter's round-2 probes were judged against, verbatim
SELFTEST_FORUM = """# Astra vs Fable thread
Posted 2026-09-05 by devMem97.
I have been running GPT-6 Astra and Claude Fable 5.1 side by side for two weeks on our backend.
For coding, GPT-6 Astra won almost every task we gave it; Fable 5.1 kept stalling on long refactors.
The progress has been massive, especially for real-world software development.
Fable 5.1 is about 2.4 times more expensive per task on our bill, and hit the usage limit in less than 24 hours.
We tested 11 tasks in total. Our team has 3 people. Overall I would pick Astra for code and Fable for writing prose."""
SELFTEST_RELEASE = """# Fable release notes thread
Posted 2026-09-10 by relwatcher on the community forum.
Claude Fable 5.1 was released on September 5, 2026 to all users on every paid plan and the free tier.
GPT-6 Astra shipped on Sep 12, 2026 to all users as well, according to the vendor announcement.
Several users reported that the new release handled long refactors better than the previous one.
Pricing stayed the same for both models at launch and nobody mentioned any quota change yet.
One commenter added that Gemini 3.1 Pro was slower than both in their own tests and they stopped using it."""
SELFTEST_VERDICTS = (   # (page, answer line, the R4 verdict it must get) — a1.md, a2c.md, b-date.md
    ("forum", "> “Fable 5.1 kept stalling on long refactors … not anymore” — devMem97, forum, 2026-09-05 [1]",
     "UNSUPPORTED"),
    ("forum", "> “For coding, GPT-6 Astra won almost every task … Fable better” — devMem97, forum, 2026-09-05 [1]",
     "UNSUPPORTED"),
    ("forum", "> ‘Honestly Fable 5.1 destroyed Astra in every coding task, it was not even close’ — devMem97, "
              "forum, 2026-09-05 [1]", "UNSUPPORTED"),
    ("forum", "devMem97 wrote \"Fable 5.1 destroyed Astra in every coding task\" on 2026-09-05[1].", "UNSUPPORTED"),
    ("forum", "> \"Fable 5.1 kept stalling on long refactors\" — devMem97, forum, 2026-09-05 [1]", "SUPPORTED"),
    ("forum", "> “Fable 5.1 kept stalling on long refactors [so we dropped it for good]” — devMem97, forum, "
              "2026-09-05 [1]", "UNSUPPORTED"),
    ("forum", "- “Fable 5.1 destroyed GPT-6 Astra on every coding task” — devMem97, forum, 2026-09-05 [1]",
     "UNSUPPORTED"),
    ("forum", "| Kim | Söz | Kaynak |\n|---|---|---|\n| devMem97 | “Fable 5.1 destroyed GPT-6 Astra on every "
              "coding task” | [1] |", "UNSUPPORTED"),
    ("forum", "> ‘Fable 5.1 kept stalling on long refactors’ — devMem97, forum, 2026-09-05 [1]", "SUPPORTED"),
    ("release", "Gemini 3.1 Pro beat both models on every coding task in the thread[2].", "UNSUPPORTED"),
    ("release", "Claude Fable 5.1 was released on September 30 to all users on every paid plan[2].", "UNSUPPORTED"),
    ("release", "GPT-6 Astra shipped on Sep 30 to all users[2].", "UNSUPPORTED"),
    ("release", "Claude Fable 5.1 was released on 30 September to all users on every paid plan[2].", "UNSUPPORTED"),
    ("release", "Claude Fable 5.1 was released on September 5, 2026 to all users on every paid plan[2].", "SUPPORTED"),
)
SELFTEST_R1 = (   # (first line, R1 must pass?) — r1-1 … r1-13, in order
    ("# Profesyoneller Fable 5.1'i tercih ediyor[1]", False),
    ("“Fable 5.1 kept stalling on long refactors” — devMem97, forum, 2026-09-05 [1]", False),
    ("\"Fable 5.1 kept stalling on long refactors\" — devMem97, forum, 2026-09-05 [1]", False),
    ("> Profesyoneller Fable 5.1'i tercih ediyor[1].", False),
    ("| Model | Tercih |", False),
    ("Bu rapor, Fable 5.1 ile Astra 6'yı karşılaştırıyor[1].", False),
    ("**Bu araştırma** iki modeli karşılaştırıyor[1].", False),
    ("Profesyoneller Fable 5.1'i mi tercih ediyor?", False),
    ("Profesyoneller Fable 5.1'i mi tercih ediyor?[1]", False),
    ("Aşağıda bulguları özetliyoruz[1].", False),
    ("Here is what we found about Fable 5.1 and Astra 6[1].", False),
    ("Profesyoneller şu an Fable 5.1'i tercih ediyor[1].", True),
    ("Evet, çoğu profesyonel kodda Astra 6'yı seçiyor[1].", True),
)
# ‘…’ with the Turkish apostrophe inside: the quote ends at the last ’ before the attribution dash
SELFTEST_SINGLE = ("> ‘Fable 5.1’i kullanan ekip 24 saatte limiti doldurdu’ — Enzo, X, TARİHSİZ [1]",
                   "Fable 5.1’i kullanan ekip 24 saatte limiti doldurdu")


def selftest() -> int:
    checks: list[tuple[str, bool, str]] = []          # (group, passed, what went wrong)
    units, _, _ = parse("\n\n".join(s for s, _ in SELFTEST_CLAIMS) + "\n")
    ctx = build_ctx(units, {}, SELFTEST_QUESTION)
    vctx = build_ctx([], {}, SELFTEST_QUESTION)      # verdicts: no borrowed "common words"
    machine = {"people": {82}, "comments": {166}, "threads": {6}}

    def r5_fails(md: str) -> bool:
        us, _, _ = parse(md + "\n")
        return not r5(us, machine, [], ctx).ok

    for s in SELFTEST_PEOPLE:
        checks.append(("R5", r5_fails(s), f"misses {s!r}"))
    for s in SELFTEST_NOT_PEOPLE:
        checks.append(("R5", not r5_fails(s), f"wrongly fails {s!r}"))
    for u in SELFTEST_URLS:
        hits = URL_ANY.findall(f"Kaynak: {u} burada.")
        checks.append(("R6", hits == [u], f"misses {u} (read {hits})"))
    for s in SELFTEST_NOT_URLS:
        checks.append(("R6", not URL_ANY.findall(s), f"calls text an address: {s} {URL_ANY.findall(s)}"))
    for s, want in SELFTEST_CLAIMS:
        got = claim_numbers(bare(s), ctx)[0]
        checks.append(("R4 numbers", got == want, f"{s!r}: {got}, want {want}"))
    pages = {"forum": Page(SELFTEST_FORUM, "selftest"), "release": Page(SELFTEST_RELEASE, "selftest")}
    for page, md, want in SELFTEST_VERDICTS:
        us, _, _ = parse(md + "\n")
        u = next(x for x in us if MARK.search(x.text))
        got = judge(u, pages[page], vctx)
        checks.append(("R4 verdicts", got[0] == want, f"{got[0]} ({got[1]}), want {want}: {md!r}"))
    for first, want in SELFTEST_R1:
        got = r1(first + "\n\nGövde cümlesi burada[1].\n")
        checks.append(("R1", got.ok == want, f"{'PASS' if got.ok else 'FAIL'} ({got.head}), want "
                                             f"{'PASS' if want else 'FAIL'}: {first!r}"))
    line, want_q = SELFTEST_SINGLE
    us, _, _ = parse(line + "\n")
    got_q, r9row = quotes_of(bare(line)), r9(us)
    checks.append(("quotes", got_q == [want_q] and r9row.head.startswith("1 quote"),
                   f"‘…’ read as {got_q}; R9 {r9row.head}"))
    groups = list(dict.fromkeys(g for g, _, _ in checks))
    passed = sum(1 for _, ok, _ in checks if ok)
    print(f"selftest: {passed}/{len(checks)} PASS — " + " · ".join(
        f"{g} {sum(1 for x, ok, _ in checks if x == g and ok)}/{sum(1 for x, _, _ in checks if x == g)}"
        for g in groups))
    for g, ok, detail in checks:
        if not ok:
            print(f"      {g}: {detail}")
    return 0 if passed == len(checks) else 1


# ================================================================== main
def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(prog="cite-check.py", description="the citation ruler (R1–R9)")
    ap.add_argument("answer", nargs="?")
    ap.add_argument("--sources")
    ap.add_argument("--selftest", action="store_true", help="re-run the refuter's regression probes and exit")
    ap.add_argument("--run-dir")
    ap.add_argument("--question")
    ap.add_argument("--mode", choices=sorted(BANDS), default="deep")
    ap.add_argument("--sample", type=int, default=20)
    ap.add_argument("--fetcher", choices=("http", "fetchpy"), default="fetchpy")
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("-v", "--verbose", action="store_true", help="print every re-opened pair")
    a = ap.parse_args(argv)
    if a.selftest:
        return selftest()
    if not a.answer or not a.sources:
        ap.error("the answer and --sources are required (or run --selftest)")

    try:
        md = Path(a.answer).read_text(encoding="utf-8-sig", errors="replace")
    except OSError as e:
        raise SystemExit(f"cite-check: cannot read {a.answer}: {e}")
    reg = {int(s["id"]): s for s in S.load(a.sources)}
    run = Path(a.run_dir).resolve() if a.run_dir else None
    qfile = Path(a.question) if a.question else (run / "question.txt" if run and (run / "question.txt").is_file() else None)
    question = qfile.read_text(encoding="utf-8-sig", errors="replace") if qfile and qfile.is_file() else ""
    machine, where = machine_counts(run)
    units, heads, code = parse(md)
    ctx = build_ctx(units, reg, question)

    print(f"cite-check · {a.answer} · {len(reg)} sources · mode {a.mode} · run-dir {run or 'none'} · "
          f"question {qfile or 'none'}")
    rows = [r1(md)]
    row2, _ = r2(units, ctx.known)
    rows += [row2, r3(md, units, code, set(reg)),
             r4(units, reg, run, a.sample, a.seed, a.fetcher, a.verbose, ctx),
             r5(units, machine, where, ctx), r6(md), r7(md, heads), r8(md, a.mode), r9(units)]
    for r in rows:
        print(f"{r.rule}  {'PASS' if r.ok else 'FAIL'}  {r.head}")
        for ln in r.lines:
            print(f"      {ln}")
    fails = [r.rule for r in rows if not r.ok]
    print(f"cite-check: {len(rows) - len(fails)}/{len(rows)} PASS" + (f" · FAIL {' '.join(fails)}" if fails else ""))
    return 1 if fails else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
