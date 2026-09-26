#!/usr/bin/env python3
"""THE EVIDENCE ROWS — every quote an answer may carry is a row, and the row is written HERE.

WHY. The deep answer the CEO rejected on 2026-09-24 (*"bu skill bok gibi yapıldı … perplexity
seviyesinde bir arama skill istiorm"*) carried X 0 · YouTube 0 · Reddit 12 of 22 sources, while its
own ground had found 294 X addresses. The hunters wrote their quotes into prose, the prose was
trusted, and nothing could say what had been read. Plan v2 (B56) takes the quote out of the model's
hands: a hunter hands this script an ADDRESS and a QUOTE, the script reads the page itself —
read-only, through the skill's own readers, in the hidden research Chrome — and a row is written
only when the quote really is in that body. A fabricated quote cannot become a row. An address that
could not be read is written down as a closed door, never skipped in silence.

  evidence.py from-ground <run>             every ground*/*.raw and ground*/pages/*.md -> rows
  evidence.py list <run> --platform <p> [--unread] [--no-body] [--kind all|discovery|evidence]
  evidence.py fetch <run> --url <u> [--print]
  evidence.py add <run> --url <u> --quote "<text>" [--author A] [--date D] [--title T]
  evidence.py triage <run> --id L0001 --status S [--reason R] [--duplicate-of L0002] [--by WHO]
  evidence.py triage-bulk <run> --json FILE --by WHO
  evidence.py batch <run> --hunter ROLE --platform P [--n 10] [--max-chars 20000]
  evidence.py page <run> --id L0001 --from BYTES [--max-chars 20000]
  evidence.py verdict <run> --hunter ROLE --id L0001 --verdict evidence|none [--reason R]
  evidence.py verdict-bulk <run> --hunter ROLE --json FILE
  evidence.py status <run> [--platform P[,Q]] [--format md|tsv|json]
  evidence.py show <run> <id>
  evidence.py writer-rows <run> [--format writer|json]
  evidence.py repassage <run>
  evidence.py platform-of <url>

The contract (names, flags, outputs, exit codes) is EVIDENCE-B56-2026-09-26.md, "THE CONTRACTS";
fleet/fleet.sh and scripts/render.py are built against it. Rows follow schemas/evidence_row.schema.json
plus `platform` (scripts/platforms.py) and `hunter` (the role, or "ground"). Seven hunters write at
once, so every write happens under an exclusive fcntl lock on <run>/evidence.lock.

EVERY ADDRESS ENDS IN A TERMINAL STATE (B56 K1 — the contract is EVIDENCE-B56-K1-2026-09-26.md
§2.1-2.2, plus the lead's verdict addendum of the same day). The address row carries `triage`
(pending · relevant · irrelevant · duplicate · inaccessible, with its reason and who judged),
`read_status` (unread · partial · read — who, when, how many bytes; ONLY `batch` and `page` move it,
see "reading" below for the morning that made it so) and the hunter's `verdict` on what it read
(evidence · none). `status` counts all three per platform and reconciles them on every call.

THE WRITER IS HANDED WHAT THE LEDGER ADMITS (B56 K2 — the contract is EVIDENCE-B56-K2-2026-09-26.md
§2.1). `admissible` is the one rule: a hunter's quote, or an address the hunter judged `evidence`, on
an address the triage kept with a body; `writer-rows` prints those rows and counts the rest by reason.
A passage skips the page's navigation chrome (`passage_of`), and `repassage` rewrites the rows whose
passage was cut from it before the rule existed.

Exit: 0 done · 1 status MISMATCH · 2 refused (a quote not in the body, an unknown id, a bad argument,
a triage or verdict without its reason) · 3 closed door.
The time a reader may take: DXB_EVIDENCE_TIMEOUT seconds (default 300 — the hidden Chrome queues
its eight windows, so a busy fleet waits before it reads).
"""
from __future__ import annotations

import argparse
import fcntl
import hashlib
import html
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata
from collections import Counter
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

sys.dont_write_bytecode = True     # the skill folder is read-only inside a hunter's jail
HERE = Path(__file__).resolve().parent
SKILL = HERE.parent
sys.path.insert(0, str(HERE))
import rlib  # noqa: E402  — sha256, registrable_domain, the wall judge
import platforms  # noqa: E402  — the one classifier and the one canonical form
import ingest  # noqa: E402  — source_type has one owner (ingest.classify)

PASSAGE_CHARS = 600
ADD_TOOL = "evidence.py add"
READER_TIMEOUT = int(os.environ.get("DXB_EVIDENCE_TIMEOUT") or 300)
MD_LINK = re.compile(r"\[([^\]\n]{0,300})\]\(([^)\s]+)\)")
EXA_REC = re.compile(r"^Title:[ \t]*(.*)\nURL:[ \t]*(\S+)(?:\nPublished(?: Date)?:[ \t]*(\S+))?"
                     r"(?:\nAuthor:[ \t]*(.*))?", re.M)
# A RAW ITEM'S OWN WORDS. Measured on the three grounds of 2026-09-24: twitter.raw carries the post
# as `text` (150 of 150 items; the contract's `full_text` does not occur), reddit.raw as `selftext`
# (123 of 150; the rest are link and video posts). hackernews.raw, youtube.raw, tiktok search and
# every search engine carry headlines only, so their hits are discovery rows.
BODY_KEYS = ("full_text", "text", "selftext")
TITLE_KEYS = ("title", "name", "desc", "repo", "fullName", "full_name", "display_name")
AUTHOR_KEYS = ("author", "channel", "handle", "user", "by")
DATE_KEYS = ("created_at", "created_utc", "createdAt", "published_at", "publish_date", "published",
             "date", "page_age", "updatedAt")
LINK_KEY = re.compile(r"(?i)^(url|uri|link|href|doi|permalink|html_url|website)$")
TEXT_KEY = re.compile(r"(?i)^(content|markdown|text|snippets?|excerpts?|description|body|selftext|"
                      r"summary|abstract|highlights|raw_content)$")
# The ground's browser pages that carry the POSTS themselves (sweep.sh's BODY_ONLY, measured there
# 2026-09-21: Facebook's search page holds 20-40 KB of post text and no permalinks). The other page
# dumps (instagram, google-deep, quora-forums) hand over addresses, and their links become rows.
BODY_PAGE_CHANNELS = {"facebook"}
SOCIAL = {"x", "youtube", "tiktok", "instagram", "facebook", "linkedin", "reddit", "hackernews",
          "bluesky", "threads", "quora", "stackoverflow", "chinese"}
# a block of a body written by a reader: "### <author> · <date> · <label>" and then the text
HEADER = re.compile(r"^### (.+?) · (.+?) · (.*)$", re.M)


# =================================================================== the YAML the readers print
# opencli prints `-f yaml` with js-yaml, and the ground's raw files are that output untouched. The
# BODY must be the decoded text: the file doubles apostrophes ('it''s'), escapes a no-break space as
# \_ and folds long lines, so a quote copied from the page would never be found in the raw file.
# This is the subset those files use (block sequences and mappings, plain / single / double quoted
# scalars, literal and folded block scalars with chomping and an indentation indicator, [] and {}),
# decoded the way PyYAML decodes it, with the standard library only.
_Y_BLOCK = re.compile(r"^([|>])([1-9]?)([+-]?)([1-9]?)[ \t]*(?:#.*)?$")
_Y_KEY = re.compile(r"""^(?P<k>"(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s'"#\[\]{},&*!|>%@`:-][^:\n]*?|"""
                    r"""-[^\s:][^:\n]*?)[ \t]*:(?:[ \t]+(?P<v>.*?))?[ \t]*$""")
_Y_ESC = {"0": "\0", "a": "\x07", "b": "\x08", "t": "\t", "\t": "\t", "n": "\n", "v": "\x0b",
          "f": "\x0c", "r": "\r", "e": "\x1b", " ": " ", '"': '"', "/": "/", "\\": "\\",
          "N": "\x85", "_": "\xa0", "L": " ", "P": " "}


def _y_close(text: str, q: str) -> int | None:
    i = 0
    while i < len(text):
        c = text[i]
        if q == '"' and c == "\\":
            i += 2
            continue
        if c == q:
            if q == "'" and text[i + 1:i + 2] == "'":
                i += 2
                continue
            return i
        i += 1
    return None


def _y_fold_quoted(raw: str, double: bool) -> str:
    out: list[str] = []
    keep, i, n = 0, 0, len(raw)
    while i < n:
        c = raw[i]
        if double and c == "\\" and i + 1 < n:
            nx = raw[i + 1]
            if nx == "\n":                       # an escaped line break joins with nothing
                i += 2
                while i < n and raw[i] in " \t":
                    i += 1
            elif nx in _Y_ESC:
                out.append(_Y_ESC[nx])
                i += 2
            elif nx in ("x", "u", "U"):
                width = {"x": 2, "u": 4, "U": 8}[nx]
                try:
                    out.append(chr(int(raw[i + 2:i + 2 + width], 16)))
                except ValueError:
                    out.append(raw[i:i + 2 + width])
                i += 2 + width
            else:
                out.append(nx)
                i += 2
            keep = len(out)
            continue
        if not double and c == "'" and raw[i + 1:i + 2] == "'":
            out.append("'")
            i += 2
            continue
        if c == "\n":                            # one break is a space, k empty lines are k breaks
            while len(out) > keep and out[-1] in (" ", "\t"):
                out.pop()
            breaks = 0
            while i < n and raw[i] == "\n":
                breaks += 1
                i += 1
                while i < n and raw[i] in " \t":
                    i += 1
            out.append(" " if breaks == 1 else "\n" * (breaks - 1))
            keep = len(out)
            continue
        out.append(c)
        i += 1
    return "".join(out)


def _y_scalar(s: str):
    if s in ("", "~", "null", "Null", "NULL"):
        return None
    if s in ("true", "True", "TRUE"):
        return True
    if s in ("false", "False", "FALSE"):
        return False
    if re.fullmatch(r"[-+]?\d+", s):
        return int(s)
    if re.fullmatch(r"[-+]?(\d+\.\d*|\.\d+)([eE][-+]?\d+)?", s):
        return float(s)
    return s


class _Yaml:
    def __init__(self, text: str):
        self.lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
        self.i = 0

    @staticmethod
    def ind(line: str) -> int:
        return len(line) - len(line.lstrip(" "))

    def skip(self) -> None:
        while self.i < len(self.lines):
            s = self.lines[self.i].strip()
            if s and not s.startswith("#") and s != "---":
                return
            self.i += 1

    def load(self):
        self.skip()
        return self.node(self.ind(self.lines[self.i])) if self.i < len(self.lines) else None

    def node(self, n: int):
        body = self.lines[self.i][n:]
        if body == "-" or body.startswith("- "):
            return self.seq(n)
        if _Y_KEY.match(body):
            return self.mapping(n)
        self.i += 1
        return self.value(body, n - 1)

    def seq(self, n: int) -> list:
        out: list = []
        while True:
            self.skip()
            if self.i >= len(self.lines) or self.ind(self.lines[self.i]) != n:
                return out
            body = self.lines[self.i][n:]
            if not (body == "-" or body.startswith("- ")):
                return out
            rest = body[2:] if body.startswith("- ") else ""
            if not rest.strip():
                self.i += 1
                self.skip()
                deeper = self.i < len(self.lines) and self.ind(self.lines[self.i]) > n
                out.append(self.node(self.ind(self.lines[self.i])) if deeper else None)
                continue
            col = n + 2 + (len(rest) - len(rest.lstrip(" ")))
            rest = rest.lstrip(" ")
            if rest == "-" or rest.startswith("- ") or _Y_KEY.match(rest):
                self.lines[self.i] = " " * col + rest      # the item's own node starts at its column
                out.append(self.node(col))
            else:
                self.i += 1
                out.append(self.value(rest, n))

    def mapping(self, n: int) -> dict:
        out: dict = {}
        while True:
            self.skip()
            if self.i >= len(self.lines) or self.ind(self.lines[self.i]) != n:
                return out
            body = self.lines[self.i][n:]
            m = _Y_KEY.match(body)
            if not m or body == "-" or body.startswith("- "):
                return out
            k = m.group("k")
            if k[:1] == '"':
                key = _y_fold_quoted(k[1:-1], True)
            elif k[:1] == "'":
                key = k[1:-1].replace("''", "'")
            else:
                key = k.strip()
            v = m.group("v")
            self.i += 1
            if not v:
                self.skip()
                if self.i < len(self.lines):
                    ni = self.ind(self.lines[self.i])
                    nb = self.lines[self.i][ni:]
                    if ni > n:
                        out[key] = self.node(ni)
                        continue
                    if ni == n and (nb == "-" or nb.startswith("- ")):
                        out[key] = self.seq(n)
                        continue
                out[key] = None
            else:
                out[key] = self.value(v, n)

    def value(self, v: str, n: int):
        """A scalar that starts on the line just consumed; `n` is the indentation of its parent."""
        v = v.strip()
        if v[:1] in ("|", ">") and _Y_BLOCK.match(v):
            return self.block(v, n)
        if v[:1] in ('"', "'"):
            return self.quoted(v, n)
        if v == "[]":
            return []
        if v == "{}":
            return {}
        return self.plain(v, n)

    def quoted(self, v: str, n: int) -> str:
        q, text, parts = v[0], v[1:], []
        while True:
            end = _y_close(text, q)
            if end is not None:
                parts.append(text[:end])
                break
            parts.append(text)
            if self.i >= len(self.lines):
                break
            text = self.lines[self.i]
            self.i += 1
        return _y_fold_quoted("\n".join(parts), q == '"')

    def plain(self, v: str, n: int):
        parts = [re.sub(r"[ \t]+#.*$", "", v).rstrip()]
        while self.i < len(self.lines):
            ln = self.lines[self.i]
            if not ln.strip():
                j = self.i
                while j < len(self.lines) and not self.lines[j].strip():
                    j += 1
                if j < len(self.lines) and self.ind(self.lines[j]) > n and not self.lines[j].lstrip().startswith("#"):
                    parts.extend([""] * (j - self.i))
                    self.i = j
                    continue
                break
            if self.ind(ln) <= n or ln.lstrip().startswith("#"):
                break
            parts.append(re.sub(r"[ \t]+#.*$", "", ln.strip()))
            self.i += 1
        if len(parts) == 1:
            return _y_scalar(parts[0])
        out, empties = parts[0], 0
        for p in parts[1:]:
            if not p:
                empties += 1
                continue
            out += ("\n" * empties) if empties else " "
            out += p
            empties = 0
        return out

    def block(self, header: str, n: int) -> str:
        m = _Y_BLOCK.match(header)
        style, chomp, inc = m.group(1), m.group(3), int(m.group(2) or m.group(4) or 0)
        lines = self.lines
        if inc:
            indent = n + inc
        else:
            indent, j = None, self.i
            while j < len(lines):
                if lines[j].strip():
                    indent = self.ind(lines[j])
                    break
                j += 1
            if indent is None or indent <= n:
                indent = n + 1
        content: list[str] = []
        while self.i < len(lines):
            ln = lines[self.i]
            if not ln.strip():
                content.append(ln[indent:] if len(ln) > indent else "")
            elif self.ind(ln) < indent:
                break
            else:
                content.append(ln[indent:])
            self.i += 1
        # PyYAML's scan_block_scalar, line for line: folding, then chomping
        chunks: list[str] = []
        breaks: list[str] = []
        k, total, line_break = 0, len(content), ""
        while k < total and content[k] == "":
            breaks.append("\n")
            k += 1
        while k < total:
            chunks.extend(breaks)
            text = content[k]
            leading_non_space = text[:1] not in (" ", "\t")
            chunks.append(text)
            line_break = "\n"
            k += 1
            breaks = []
            while k < total and content[k] == "":
                breaks.append("\n")
                k += 1
            if k < total:
                if style == ">" and leading_non_space and content[k][:1] not in (" ", "\t"):
                    if not breaks:
                        chunks.append(" ")
                else:
                    chunks.append(line_break)
        if chomp != "-":
            chunks.append(line_break)
        if chomp == "+":
            chunks.extend(breaks)
        return "".join(chunks)


def yaml_load(text: str):
    return _Yaml(text).load()


# =================================================================== small pieces
def normalize(s: str) -> str:
    """The contract's normalisation: NFKC, curly quotes straight, whitespace runs one space; case kept."""
    s = unicodedata.normalize("NFKC", s or "")
    s = s.translate({0x2018: "'", 0x2019: "'", 0x201A: "'", 0x201B: "'",
                     0x201C: '"', 0x201D: '"', 0x201E: '"', 0x201F: '"'})
    return re.sub(r"\s+", " ", s).strip()


def blocks(body: str) -> list[tuple[str, str, str, str]]:
    """(author, date, label, text) for each block a reader wrote; [] for a body with no blocks."""
    heads = list(HEADER.finditer(body or ""))
    out = []
    for n, h in enumerate(heads):
        end = heads[n + 1].start() if n + 1 < len(heads) else len(body)
        out.append((h.group(1), h.group(2), h.group(3), body[h.end():end].strip()))
    return out


# WHAT A PASSAGE MAY NOT CARRY (the lead, 2026-09-26, from lane C's page on the fixture). Fetched bodies
# are Markdown with HTML entities; measured on the 02:34 run's 682 passages: 15 carried entities
# (&nbsp; ×29, &gt; ×15, &amp; ×8), 223 image syntax — 103 of them a `![](https:` cut at the 600th
# character — and 141 empty `[](link)`. A passage is words, so the markup goes BEFORE the cut and an
# entity is decoded. An image keeps its ALT TEXT: a first cut that dropped whole images still left 16
# passages carrying one, and the six looked at were TikTok posts whose caption IS the image's alt
# (L0382: "GPT-6 Astra vs Claude Fable 5.1 is a much closer fight than I expected…") — deleting the
# image deletes the evidence. A bare `![` and an empty link go. Only a reference that ends in `;` is
# decoded: html.unescape alone reads the `&para` of `?x=1&param=2` as "¶" (measured). Rows already on
# disk keep their passage.
_TARGET = r'\([^)\s]*(?:\s+"[^"]*")?\)?'                  # (url "title") — the ) may be cut off
MD_LINKED_IMAGE = re.compile(r'\[!\[([^\]]{0,5000})\]' + _TARGET + r'\]' + _TARGET)
MD_IMAGE = re.compile(r'!\[([^\]]{0,5000})\]' + _TARGET)
MD_EMPTY_LINK = re.compile(r'\[\s*\]' + _TARGET)
ENTITY = re.compile(r"&(?:#\d{1,7}|#[xX][0-9a-fA-F]{1,6}|[A-Za-z][A-Za-z0-9]{1,31});")


def passage_text(s: str) -> str:
    """Words only: an image keeps its alt text and loses its markup, a bare `![` and an empty link
    go, entities are decoded, and the contract's normalisation runs last."""
    s = MD_IMAGE.sub(r" \1 ", MD_LINKED_IMAGE.sub(r" \1 ", s or ""))
    s = MD_EMPTY_LINK.sub(" ", s.replace("![", " "))
    return normalize(ENTITY.sub(lambda m: html.unescape(m.group(0)), s))


# THE PASSAGE IS THE PAGE'S WORDS, NOT ITS MENU (B56 K2 §2.1, as the lead ruled it on 2026-09-26).
# Measured on the kept K1 run (20260926-1414-k1-astra-fable): L1480 — t.co → an every.to article of
# 25,795 characters — had the passage "Vibe Check: … [Skip to content](#main-content) [Sign in](/login?…":
# a fetched page opens with its title and its navigation. So the passage starts at the body's FIRST LINE
# THAT IS NOT CHROME and runs from there as it always ran from the head (600 characters of words,
# passage_text). Chrome: a line ≥ 50 % inside `[…](…)` / `![…](…)`; a line of ≤ 3 words; a BOILERPLATE
# line; a heading over a setext underline (`===` / `---`); and a page's HEAD — whatever stands above a
# skip link among its first three lines, the title a fetched page prints first (L1480, 123 of the 126
# GitHub pages). Without those last two L1480 keeps its title-first passage: its title line holds 11 words and
# no link. No paragraph length is asked for: the first cut's "a paragraph of ≥ 40 words" moved the
# passage of 49 X rows past the post's own opening (L0434, L0506). A body whose every line is chrome
# keeps the head. A CJK character counts as a word: a Chinese post has no spaces.
# A PAGE'S CHROME GOES WHEREVER IT STANDS (the K2 verifier's C1, the lead's ruling the same day). After
# that rule, 33 of the K1 copy's 512 admitted rows still opened with a menu: juejin and rednote pages
# whose title line is not chrome, followed by ~600 characters of `[首页](/) [沸点](/pins)…` (L0162). So
# in a PAGE — a body that carries a navigation line, ≥ 50 % inside links — every chrome line is dropped
# wherever it stands, by the same tests. A body with no navigation line is a post's own text and runs on
# from its first line that is not chrome, as before: dropping its short lines everywhere cut words from 10
# admitted X posts on the K1 copy — L1417's scores "GPT-6 Astra: 48/105 / Fable 5.1: 43/105 / GPT-5.6 Sol:
# 42/105", L0506's closing t.co link — where L0434 and L0506 must keep their K1 passages.
_LINKISH = re.compile(r"\[!\[([^\]\n]*)\]\([^)\n]*\)\]\([^)\n]*\)|!?\[([^\]\n]*)\]\([^)\n]*\)")
_CJK = re.compile(r"[぀-ヿ㐀-䶿一-鿿가-힯]")
_SETEXT = re.compile(r"^\s*(?:=+|-+)\s*$")
CHROME_SHARE = 0.5     # a line this much inside link markup is navigation
CHROME_WORDS = 3       # a line of this many words or fewer is a label, a date, a rule
HEAD_LINES = 3         # a skip link among a page's first three lines closes the page's head
# Sentences a page prints around its content, never in it — the lines that carry them, measured in the
# K1 run's 1,518 bodies: GitHub's session banner (128 lines, one on every GitHub page, "Reload to refresh
# your session" three times in it), the skip link (452 lines in 445 bodies; Reddit and arXiv say "Skip to
# main content"), cookie notices (68 and 12 lines), a button's word alone on its line (258).
BOILERPLATE = [re.compile(p, re.I) for p in (
    r"you signed in with another tab or window",
    r"reload to refresh your session",
    r"you switched accounts on another tab",
    r"skip to (?:main )?content",
    r"we use cookies",
    r"accept all cookies",
    r"^\W*(?:sign in|subscribe)\W*$",
)]
SKIP_LINK = BOILERPLATE[3]


def _words(s: str) -> int:
    """The words a reader sees: a link counts its text, an image its alt; a CJK character is a word."""
    seen = _LINKISH.sub(lambda m: f" {m.group(1) or m.group(2) or ''} ", s)
    return len(_CJK.findall(seen)) + sum(1 for w in _CJK.sub(" ", seen).split() if re.search(r"\w", w))


def _navigation(line: str) -> bool:
    """A menu's line: ≥ 50 % inside `[…](…)` / `![…](…)`. An empty line is not one."""
    s = line.strip()
    inside = sum(len(m.group(0)) for m in _LINKISH.finditer(s))
    return inside > 0 and inside >= CHROME_SHARE * len(s)


def _chrome(line: str, below: str = "") -> bool:
    """Is this line chrome? `below` is the line under it: a setext underline makes the line a heading."""
    s = line.strip()
    return (_navigation(s) or _words(s) <= CHROME_WORDS
            or any(b.search(s) for b in BOILERPLATE) or bool(_SETEXT.match(below)))


def passage_body(text: str) -> str:
    """The text a passage is cut from: the lines from the first one past the page's head that is not
    chrome — the whole text, the head, when there is none. In a PAGE (a line of it is navigation) every
    chrome line is dropped wherever it stands; a post's own text runs on from there as it is."""
    lines = (text or "").split("\n")
    below = lines[1:] + [""]
    head = [i for i, ln in enumerate(lines) if ln.strip()][:HEAD_LINES]
    first = next((i + 1 for i in head if SKIP_LINK.search(lines[i])), 0)
    start = next((i for i in range(first, len(lines)) if not _chrome(lines[i], below[i])), None)
    if start is None:
        return text or ""
    if not any(_navigation(ln) for ln in lines):
        return "\n".join(lines[start:])
    return "\n".join(lines[i] for i in range(start, len(lines)) if not _chrome(lines[i], below[i]))


def passage_source(body: str) -> str:
    """The text a passage is taken from: the FIRST post when a reader wrote several, so one row's
    passage never runs from one author's words into the next one's."""
    b = blocks(body)
    return b[0][3] if b else (body or "")


def passage_of(body: str) -> str:
    """600 characters of words (passage_text) of what passage_body keeps of the body's first post
    (passage_source)."""
    return passage_text(passage_body(passage_source(body)))[:PASSAGE_CHARS].rstrip()


def iso_date(v) -> str | None:
    """A calendar date, or None — 'recently' and '2 weeks ago' are not dates (the schema's rule)."""
    if v is None or isinstance(v, bool):
        return None
    if isinstance(v, (int, float)) or re.fullmatch(r"\d{9,10}(\.\d+)?", str(v).strip()):
        try:
            return datetime.fromtimestamp(float(v), timezone.utc).strftime("%Y-%m-%d")
        except (ValueError, OSError, OverflowError):
            return None
    s = str(v).strip().strip("'\"")
    m = re.match(r"^((?:19|20)\d\d)-(\d\d)(?:-(\d\d))?", s)
    if m:
        return "-".join(g for g in m.groups() if g)
    try:                                         # twitter: "Mon Sep 07 14:48:00 +0000 2026"
        return datetime.strptime(s, "%a %b %d %H:%M:%S %z %Y").strftime("%Y-%m-%d")
    except ValueError:
        return None


def clean(v, limit: int = 300) -> str | None:
    if not isinstance(v, str):
        return None
    s = re.sub(r"\s+", " ", v).strip()
    return s[:limit] if len(s) >= 2 and not s.lower().startswith(("http://", "https://")) else None


def first_of(d: dict, keys) -> object:
    for k in keys:
        v = d.get(k)
        if v not in (None, "", [], {}):
            return v
    return None


urls_in = platforms.urls_in


def strings_in(obj):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for v in obj.values():
            yield from strings_in(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from strings_in(v)


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def source_type(url: str, channel: str) -> str:
    """ingest.classify's verdict; its platform list predates TikTok, Instagram and Facebook, whose
    posts are people talking, so a `secondary` there is lifted to `first-hand`."""
    try:
        st = ingest.classify(url, channel or "", None)
    except Exception:
        st = "secondary"
    return "first-hand" if st == "secondary" and platforms.platform_of(url) in SOCIAL else st


# =================================================================== the run's files
def ev_path(run: Path) -> Path:
    return run / "evidence.jsonl"


def read_rows(run: Path) -> list[dict]:
    """Every row; a line half-written by a peer at this instant is skipped, never fatal."""
    out = []
    try:
        text = ev_path(run).read_text(encoding="utf-8", errors="replace")
    except FileNotFoundError:
        return out
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            row = json.loads(line)
        except ValueError:
            continue
        if isinstance(row, dict):
            out.append(row)
    return out


@contextmanager
def locked(run: Path):
    with open(run / "evidence.lock", "a+") as fh:
        fcntl.flock(fh.fileno(), fcntl.LOCK_EX)
        try:
            yield
        finally:
            fcntl.flock(fh.fileno(), fcntl.LOCK_UN)


def append_rows(run: Path, new: list[dict]) -> None:
    with open(ev_path(run), "a", encoding="utf-8") as fh:
        for r in new:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")


def rewrite_rows(run: Path, rows: list[dict]) -> None:
    tmp = run / f".evidence.jsonl.{os.getpid()}.tmp"
    tmp.write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in rows), encoding="utf-8")
    os.replace(tmp, ev_path(run))


def body_path(run: Path, canon: str) -> Path:
    return run / "bodies" / (hashlib.sha256(canon.encode("utf-8")).hexdigest() + ".txt")


def has_body(run: Path, canon: str) -> bool:
    p = body_path(run, canon)
    return p.is_file() and p.stat().st_size > 0


def read_body(run: Path, canon: str) -> str | None:
    return body_path(run, canon).read_bytes().decode("utf-8", "replace") if has_body(run, canon) else None


def write_body(run: Path, canon: str, text: str) -> Path:
    """Bytes, not text: a text-mode read turns \\r\\n into \\n, and the body's fingerprint must be the file's."""
    p = body_path(run, canon)
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_name(f".{p.name}.{os.getpid()}.tmp")
    tmp.write_bytes(text.encode("utf-8", "replace"))
    os.replace(tmp, p)
    return p


def vouched(run: Path, canon: str, addr: dict | None) -> bool:
    """Is the body on disk the one THIS script cached for the address? A body file alone proves
    nothing — anything that can write the run folder can put one there (the B56 verifier planted one
    and quoted it). The address row must say the body was cached by from-ground (tool sweep ·
    fetch.py) or by a real fetch (tool `evidence.py fetch · <reader>`), and the file must be byte for
    byte the body that row fingerprinted."""
    if not addr or (addr.get("bytes") or 0) <= 0 or addr.get("liveness") != "alive" or not addr.get("body_sha256"):
        return False
    tool = str(addr.get("tool") or "")
    if tool not in ("sweep", "fetch.py") and not tool.startswith("evidence.py fetch · "):
        return False
    try:
        return hashlib.sha256(body_path(run, canon).read_bytes()).hexdigest() == addr["body_sha256"]
    except OSError:
        return False


def next_num(rows: list[dict]) -> int:
    nums = [int(r["id"][1:]) for r in rows if re.fullmatch(r"L\d{4}", str(r.get("id", "")))]
    return max(nums, default=0) + 1


def fmt_id(n: int) -> str:
    if n > 9999:
        raise SystemExit("!! evidence.jsonl dolu: L9999 asildi, yeni satir yazilamaz")
    return "L%04d" % n


def by_canon(rows: list[dict]) -> dict[str, list[dict]]:
    out: dict[str, list[dict]] = {}
    for r in rows:
        out.setdefault(r.get("url_canonical") or platforms.canonical_url(r.get("url") or ""), []).append(r)
    return out


def address_row(rs: list[dict]) -> dict | None:
    """The row that stands for the ADDRESS (from the ground or a fetch), not one of its quotes."""
    for r in rs:
        if r.get("tool") != ADD_TOOL:
            return r
    return rs[0] if rs else None


def hunter_name(run: Path) -> str | None:
    """The role writing: DXB_HUNTER when the fleet sets it, else the hunter's own folder
    (<run>/work-<role>, where fleet.sh starts every hunter), else unknown."""
    if os.environ.get("DXB_HUNTER"):
        return os.environ["DXB_HUNTER"]
    try:
        cwd = Path.cwd().resolve()
        if cwd.parent == run.resolve() and cwd.name.startswith("work-"):
            return cwd.name[5:]
    except OSError:
        pass
    return None


# =================================================================== terminal states (B56 K1)
# THE CONTRACT: EVIDENCE-B56-K1-2026-09-26.md §2.1 and the lead's verdict addendum (2026-09-26). The
# ADDRESS row carries them; a quote row of `add` is born relevant (a hunter's own quote, see _credit)
# and is never counted as an address. A row written before K1 has none of these fields and reads as
# pending / unread / no verdict — it is never migrated in bulk; a row gets the fields written when it
# is itself updated.
# `read_status` is moved by `batch` and `page` alone: on 2026-09-26 a hunter's "okundu 130" stood
# for 73 bodies seen (the "reading" section below has the measurement).
TRIAGE_STATES = ("pending", "relevant", "irrelevant", "duplicate", "inaccessible")
NEEDS_REASON = ("irrelevant", "duplicate", "inaccessible")    # refused without one (exit 2)
READ_STATES = ("unread", "partial", "read")
VERDICTS = ("evidence", "none")                               # "none" is refused without a reason
STATE_DEFAULTS = {"triage": "pending", "triage_reason": None, "duplicate_of": None, "triage_by": None,
                  "read_status": "unread", "read_by": None, "read_at": None, "read_bytes": 0,
                  "read_completeness": 0.0,
                  "verdict": None, "verdict_reason": None, "verdict_by": None, "verdict_at": None}


def ensure_states(row: dict) -> dict:
    for k, v in STATE_DEFAULTS.items():
        row.setdefault(k, v)
    return row


def triage_of(row: dict) -> str:
    return row.get("triage") or "pending"


def read_of(row: dict) -> str:
    return row.get("read_status") or "unread"


def row_platform(addr: dict, canon: str) -> str:
    """The platform an address is counted under — kapsama.py's rule, so the two tables agree."""
    p = addr.get("platform")
    return p if p in platforms.PLATFORMS else platforms.platform_of(canon)


def new_row(run: Path, rid: str, url: str, canon: str, channel: str, hunter: str | None,
            **kw) -> dict:
    st = source_type(url, channel)
    row = {"id": rid, "run_id": run.name, "kind": "discovery", "retrieved_at": now(), "tool": channel,
           "channel": channel, "query_id": None, "gap": None, "url": url, "url_canonical": canon,
           "domain": rlib.registrable_domain(canon), "title": None, "author": None, "pub_date": None,
           "source_type": st, "primary": st in ("primary-doc", "code"), "http_status": None,
           "liveness": "unchecked", "bytes": 0, "notes": None,
           "platform": platforms.platform_of(canon), "hunter": hunter, **STATE_DEFAULTS}
    row.update(kw)
    return row


def set_body(row: dict, body: str) -> None:
    """A row that now stands on a body: evidence, alive, its size and fingerprint, a passage if it had none.
    Its states follow the body (K1): a closed door that opened is `pending` again, for the triage to
    judge the body it never saw; a body that CHANGED is `unread` again — the bytes a hunter was
    printed belonged to the old one."""
    data = body.encode("utf-8", "replace")
    sha = hashlib.sha256(data).hexdigest()
    changed = row.get("body_sha256") not in (None, sha)
    row.update(kind="evidence", liveness="alive", bytes=len(data), body_sha256=sha)
    if not row.get("passage"):
        row["passage"] = passage_of(body)
        row["passage_sha256"] = rlib.sha256(row["passage"])
    ensure_states(row)
    if row["triage"] == "inaccessible":
        row.update(triage="pending", triage_reason=None, duplicate_of=None, triage_by=None)
    if changed:
        row.update(read_status="unread", read_by=None, read_at=None, read_bytes=0, read_completeness=0.0)


# =================================================================== from the ground
def _hit(url, title=None, author=None, date=None, body=None, key=None, primary=False) -> dict:
    return {"url": url, "title": clean(title), "author": clean(author, 120), "date": iso_date(date),
            "body": body if isinstance(body, str) and body.strip() else None, "key": key,
            "primary": primary}


def _json_values(text: str) -> list | None:
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


def _from_json(obj, hits: list) -> None:
    """A result is a JSON object with a link key; links inside its prose count, its metadata ids do not."""
    if isinstance(obj, dict):
        link = next((v for k, v in obj.items() if isinstance(v, str) and LINK_KEY.match(str(k))
                     and v.startswith("http")), None)
        full = obj.get("fullName")
        if link is None and isinstance(full, str) and re.fullmatch(r"[\w.-]+/[\w.-]+", full):
            link = "https://github.com/" + full   # gh search repos answers without a url field
        if link:
            hits.append(_hit(link, first_of(obj, TITLE_KEYS), first_of(obj, AUTHOR_KEYS),
                             first_of(obj, DATE_KEYS), primary=True))
        for k, v in obj.items():
            if isinstance(v, (dict, list)):
                _from_json(v, hits)
            elif isinstance(v, str) and TEXT_KEY.match(str(k)):
                hits.extend(_hit(u) for u in urls_in(v))
    elif isinstance(obj, list):
        for v in obj:
            _from_json(v, hits)


def _from_page_dump(d: dict, fmt: str) -> list:
    """A hidden.py page: Facebook's carries the posts (one evidence row); the others hand over links."""
    base, content = d.get("url") or "", d.get("content") or ""
    hits, links = [], []
    if fmt in BODY_PAGE_CHANNELS:
        hits.append(_hit(base, d.get("title"), body=content, key="content", primary=True))
        links = [(t, u) for t, u in MD_LINK.findall(content) if u.startswith("http")]
    else:
        for t, u in MD_LINK.findall(content):
            if u.startswith("/") and not u.startswith("/search"):
                links.append((t, urljoin(base, u)))
            elif u.startswith("http"):
                links.append((t, u))
    for t, u in links:
        if u.rstrip("/") != base.rstrip("/"):
            hits.append(_hit(u, t))
    hits.extend(_hit(u) for u in urls_in(content) if u.rstrip("/") != base.rstrip("/"))
    return hits


def _from_items(items: list, fmt: str) -> list:
    hits = []
    for it in items:
        if isinstance(it, str):
            hits.extend(_hit(u) for u in urls_in(it))
            continue
        if not isinstance(it, dict):
            continue
        url = next((it[k] for k in ("url", "link", "href") if isinstance(it.get(k), str)
                    and it[k].startswith("http")), None)
        body = next(((it[k], k) for k in BODY_KEYS if isinstance(it.get(k), str) and it[k].strip()), (None, None))
        title, author, date = first_of(it, TITLE_KEYS), first_of(it, AUTHOR_KEYS), first_of(it, DATE_KEYS)
        primary = url
        if fmt == "hackernews" and it.get("id") not in (None, ""):
            # the discussion IS the finding; the story's own link is a second address
            primary = f"https://news.ycombinator.com/item?id={it['id']}"
        if primary:
            hits.append(_hit(primary, title, author, date, body[0], body[1], primary=True))
        for s in strings_in(it):
            for u in urls_in(s):
                if u != primary:
                    hits.append(_hit(u, title if u == url else None))
    return hits


def harvest(channel: str, text: str) -> list:
    """Every address one raw file carries, with the title, author, date and body it gives each."""
    fmt = channel.split("-via-")[-1]          # a stand-in's file is written in the stand-in's shape
    s = text.lstrip()
    if s[:1] in ("[", "{"):
        vals = _json_values(s)
        if vals is not None:
            hits: list = []
            for v in vals:
                if isinstance(v, dict) and isinstance(v.get("url"), str) and "content" in v \
                        and ("total_chars" in v or "chunk_size" in v):
                    hits.extend(_from_page_dump(v, fmt))
                else:
                    _from_json(v, hits)
            return hits
    if s.startswith("- ") or s.startswith("-\n"):
        items = yaml_load(s)
        if isinstance(items, list):
            return _from_items(items, fmt)
    if EXA_REC.search(text):
        hits = []
        for m in EXA_REC.finditer(text):
            author = None if (m.group(4) or "").strip() in ("", "N/A") else m.group(4)
            hits.append(_hit(m.group(2), m.group(1), author, m.group(3), primary=True))
        return hits + [_hit(u) for u in urls_in(text)]
    return [_hit(u) for u in urls_in(text)]


def _natural(p: Path):
    m = re.search(r"(\d+)$", p.name)
    return (int(m.group(1)) if m else 1, p.name)


def _page_entries(pages: Path) -> list[dict]:
    """The pages the ground read, with their addresses: FETCH-LOG.json, else urls.txt by number."""
    log = pages / "FETCH-LOG.json"
    if log.is_file():
        try:
            rows = json.loads(log.read_text(encoding="utf-8-sig", errors="replace"))
            return [r for r in rows if isinstance(r, dict) and r.get("url")] if isinstance(rows, list) else []
        except ValueError:
            return []
    out = []
    urls = pages / "urls.txt"
    if urls.is_file():
        files = {p.name.split("-", 1)[0]: p.name for p in pages.glob("[0-9][0-9]-*.md")}
        for i, u in enumerate(urls.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
            if u.strip() and "%02d" % i in files:
                out.append({"url": u.strip(), "read": True, "file": files["%02d" % i], "door": "page"})
    return out


def cmd_from_ground(run: Path) -> int:
    grounds = sorted((d for d in run.glob("ground*") if d.is_dir()), key=_natural)
    found: dict[str, dict] = {}
    bodies: dict[str, list] = {}
    dropped = {"invalid": 0, "furniture": 0, "search-page": 0, "site-page": 0}

    def merge(h: dict, channel: str, ground: str, mtime: float, closed=None) -> None:
        why = platforms.reject(h["url"])
        if why:
            dropped[why] = dropped.get(why, 0) + 1
            return
        canon = platforms.canonical_url(h["url"])
        info = found.get(canon)
        if info is None:
            found[canon] = dict(h, channel=channel, ground=ground, mtime=mtime,
                                closed=None if h["body"] else closed)
            return
        if h["body"] and not info["body"]:
            # the item that carries the body names itself: its title, author and date win over a
            # search engine's headline for the same address ("Reddit", measured on the baseline)
            info.update(body=h["body"], key=h["key"], channel=channel, ground=ground, mtime=mtime,
                        closed=None, title=h["title"] or info["title"], author=h["author"] or info["author"],
                        date=h["date"] or info["date"])
        for k in ("title", "author", "date"):
            info[k] = info[k] or h[k]
        if closed and not info["body"] and not info["closed"]:
            info["closed"] = closed

    for g in grounds:
        judge = {}
        try:
            for line in (g / ".judge").read_text(encoding="utf-8").splitlines():
                name, _, verdict = line.partition("\t")
                judge[name] = verdict.strip()
        except OSError:
            pass
        for raw in sorted(g.glob("*.raw")):
            if judge.get(raw.stem) == "BROKEN":   # the sweep's one judge called it a wall page
                continue
            text = raw.read_text(encoding="utf-8", errors="replace")
            if not text.strip():
                continue
            try:
                hits = harvest(raw.stem, text)
            except Exception as e:                # a shape this reader does not know: its addresses still count
                print(f"!! {g.name}/{raw.name}: bicimi okunamadi ({type(e).__name__}); adresler duz metinden alindi",
                      file=sys.stderr)
                hits = [_hit(u) for u in urls_in(text)]
            st = bodies.setdefault(raw.stem.split("-via-")[0], [0, 0, set()])
            for h in hits:
                if h["primary"]:
                    st[0] += 1
                if h["body"]:
                    st[1] += 1
                    st[2].add(h["key"])
                merge(h, raw.stem, g.name, raw.stat().st_mtime)
        pages = g / "pages"
        for e in _page_entries(pages):
            f = pages / str(e.get("file") or "")
            if e.get("read") and e.get("file") and f.is_file():
                body = f.read_text(encoding="utf-8", errors="replace")
                st = bodies.setdefault("pages", [0, 0, {"page"}])
                st[0] += 1
                st[1] += 1 if body.strip() else 0
                merge(_hit(e["url"], body=body, key="page", primary=True), "fetch:" + str(e.get("door") or "page"),
                      g.name, f.stat().st_mtime)
                for u in urls_in(body):
                    merge(_hit(u), "page-link", g.name, f.stat().st_mtime)
            else:
                tried = " -> ".join(str(a.get("door", "?")) for a in e.get("attempts") or [])
                lv = e.get("liveness") if e.get("liveness") in ("blocked", "dead") else "dead"
                merge(_hit(e["url"]), "fetch:" + str(e.get("door") or "page"), g.name,
                      pages.stat().st_mtime if pages.exists() else 0.0,
                      closed=(lv, f"zemin okuyamadi: {tried or 'kapi denemesi yok'}"))

    with locked(run):
        rows = read_rows(run)
        index = by_canon(rows)
        n = next_num(rows)
        new: list[dict] = []
        changed = 0
        for canon, info in found.items():
            if canon in index:
                addr = address_row(index[canon])
                if info["body"] and addr is not None and not has_body(run, canon):
                    write_body(run, canon, info["body"])
                    set_body(addr, info["body"])
                    addr["tool"] = "fetch.py" if info["channel"].startswith("fetch:") else "sweep"
                    changed += 1
                continue
            stamp = datetime.fromtimestamp(info["mtime"], timezone.utc).isoformat(timespec="seconds")
            row = new_row(run, fmt_id(n), info["url"], canon, info["channel"], "ground",
                          retrieved_at=stamp, tool="fetch.py" if info["channel"].startswith("fetch:") else "sweep",
                          query_id=info["ground"], title=info["title"], author=info["author"],
                          pub_date=info["date"])
            n += 1
            if info["body"]:
                write_body(run, canon, info["body"])
                set_body(row, info["body"])
            elif info["closed"]:
                row.update(liveness=info["closed"][0], notes=info["closed"][1])
            new.append(row)
        if changed:
            rewrite_rows(run, rows + new)
        elif new:
            append_rows(run, new)
        rows = rows + new

    for name in sorted(bodies, key=lambda k: (k == "pages", k)):
        items, with_body, keys = bodies[name]
        if with_body:
            print(f"raw={name} items={items} body={with_body} ({'/'.join(sorted(k for k in keys if k))})")
    per: dict[str, list[set]] = {}
    for canon, rs in by_canon(rows).items():
        p = (address_row(rs) or {}).get("platform") or platforms.platform_of(canon)
        slot = per.setdefault(p, [set(), set()])
        slot[0].add(canon)
        if any(r.get("liveness") == "alive" and (r.get("bytes") or 0) > 0 for r in rs):
            slot[1].add(canon)
    for p in platforms.PLATFORMS:
        if p in per:
            print(f"platform={p} found={len(per[p][0])} body={len(per[p][1])}")
    print(f"satir: +{len(new)} yeni · {changed} govdeyle guncellendi · evidence.jsonl {len(rows)} satir · "
          f"zemin {len(grounds)} · atilan adres: " + " ".join(f"{k}={v}" for k, v in dropped.items()))
    return 0


# =================================================================== list / show
def cmd_list(run: Path, platform: str, unread: bool, no_body: bool, kind: str) -> int:
    for canon, rs in by_canon(read_rows(run)).items():
        addr = address_row(rs) or {}
        if platform != "all" and (addr.get("platform") or platforms.platform_of(canon)) != platform:
            continue
        k = "evidence" if any(r.get("kind") == "evidence" for r in rs) else "discovery"
        if kind != "all" and k != kind:
            continue
        if no_body and has_body(run, canon):       # no body yet: what --unread meant before K1
            continue
        if unread and (triage_of(addr) != "relevant" or read_of(addr) != "unread"):
            continue                               # K1: relevant, and never printed to a hunter
        title = next((r.get("title") for r in rs if r.get("title")), "") or ""
        title = re.sub(r"[\t\r\n]+", " ", title)
        print(f"{addr.get('id')}\t{canon}\t{title}\t{addr.get('liveness') or 'unchecked'}")
    return 0


def cmd_show(run: Path, rid: str) -> int:
    for r in read_rows(run):
        if r.get("id") == rid:
            print(json.dumps(r, ensure_ascii=False, indent=2))
            return 0
    print(f"REFUSED no such id: {rid}")
    return 2


# =================================================================== reading a page
def _env() -> dict:
    """Every reader goes through the skill's own opencli door (bin/opencli, the hidden Chrome) —
    also when this script is run by hand outside the fleet, so nothing can reach his screen."""
    env = dict(os.environ)
    env["PATH"] = f"{SKILL / 'bin'}{os.pathsep}{env.get('PATH', '')}"
    env["OPENCLI_WINDOW"] = "background"
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    return env


def _run(cmd: list[str]) -> tuple[int, str, str]:
    try:
        p = subprocess.run(cmd, capture_output=True, encoding="utf-8", errors="replace",
                           timeout=READER_TIMEOUT, env=_env(), stdin=subprocess.DEVNULL)
        return p.returncode, p.stdout, p.stderr
    except subprocess.TimeoutExpired:
        return 124, "", f"zaman asimi ({READER_TIMEOUT} sn)"
    except OSError as e:
        return 127, "", str(e)


def _ok(reader: str, body: str, note: str | None = None) -> dict:
    return {"ok": True, "reader": reader, "body": body, "liveness": "alive", "reason": note, "http": None}


def _closed(reader: str, rc: int, text: str, liveness: str | None = None) -> dict:
    line = re.sub(r"^opencli \(dxb\):\s*", "", platforms.door_said(text))[:200] or f"kod {rc}, cevap yok"
    m = re.search(r"\b(?:HTTP[ /]?)?(401|403|404|410|429|451|5\d\d)\b", text or "")
    lv = liveness or ("dead" if re.search(r"\b(404|410)\b|not found|does not exist|deleted|removed|"
                                          r"bulunamad", text or "", re.I) else "blocked")
    return {"ok": False, "reader": reader, "body": None, "liveness": lv,
            "reason": f"{reader} kod {rc}: {line}", "http": int(m.group(1)) if m else None}


def _posts(out: str) -> list[dict]:
    try:
        items = yaml_load(out)
    except Exception:
        return []
    return [it for it in items if isinstance(it, dict) and isinstance(it.get("text"), str)
            and it["text"].strip()] if isinstance(items, list) else []


def _render(posts: list[tuple]) -> str:
    def f(v) -> str:
        s = re.sub(r"\s+", " ", str(v)).replace("·", "-").strip() if v not in (None, "") else ""
        return s or "-"
    return "\n\n".join(f"### {f(a)} · {f(d)} · {f(lab)}\n{t.strip()}" for a, d, lab, t in posts) + "\n"


def _platform_read(url: str, platform: str) -> dict | None:
    """The platform's own reader, or None when the address has none (then the chain reads it)."""
    if platform == "x" and re.search(r"/status/\d+", url):
        rc, out, err = _run(["opencli", "twitter", "thread", url, "-f", "yaml"])
        posts = _posts(out) if rc == 0 else []
        if not posts:
            return _closed("opencli twitter thread", rc, err or out or "bos cevap")
        return _ok("opencli twitter thread", _render(
            [(p.get("author"), iso_date(p.get("created_at")), p.get("url"), p["text"]) for p in posts]))
    if platform == "reddit" and "/comments/" in url:
        base = ["opencli", "reddit", "read", url, "--limit", "100", "--depth", "10", "--replies", "50"]
        rc, out, err = _run(base + ["--expand-more", "true", "--expand-rounds", "5", "-f", "yaml"])
        posts, note = (_posts(out) if rc == 0 else []), None
        if not posts:
            # THE EXPANSION CAN SINK THE WHOLE THREAD. Measured 2026-09-26 on r/OpenAI 1w7ppcj: with
            # --expand-more, Reddit's /api/morechildren returned "unplaceable comments: orphan: t1_…"
            # and the adapter exited 1 with nothing; the same read without it gave 282 posts (83 KB).
            first = _closed("opencli reddit read", rc, err or out or "bos cevap")
            rc, out, err = _run(base + ["-f", "yaml"])
            posts = _posts(out) if rc == 0 else []
            if not posts:
                return first
            note = f"--expand-more olmadan: {first['reason']}"[:300]
        return _ok("opencli reddit read", _render(
            [(p.get("author"), None, p.get("type"), p["text"]) for p in posts]), note)
    if platform == "youtube" and "watch?v=" in url:
        rc1, out1, err1 = _run(["opencli", "youtube", "transcript", url, "-f", "plain"])
        said, transcript = "opencli youtube transcript", out1 if rc1 == 0 and out1.strip() else ""
        if not transcript:
            # THE CAPTION DOOR, ONE FLOOR DOWN. Measured 2026-09-26 on two videos: opencli's transcript
            # answered "Caption URL returned empty response" both times, while the chain's own first door
            # (fetch.py media-transcript, yt-dlp's subtitles) read 78 148 bytes of the same video in 4 s.
            with tempfile.TemporaryDirectory() as td:
                sub = Path(td) / "transcript.txt"
                rcs, _o, _e = _run([sys.executable, str(HERE / "fetch.py"), url, "--stop-at", "1",
                                    "--out", str(sub), "--json", "--timeout", "60"])
                if rcs == 0 and sub.is_file() and sub.read_text(encoding="utf-8", errors="replace").strip():
                    said, transcript = "fetch.py:media-transcript", sub.read_text(encoding="utf-8", errors="replace")
        rc2, out2, err2 = _run(["opencli", "youtube", "comments", url, "--limit", "100", "-f", "yaml"])
        comments = _posts(out2) if rc2 == 0 else []
        parts = ([("-", None, "transcript", transcript)] if transcript else []) + \
            [(c.get("author"), None, "yorum", c["text"]) for c in comments]
        if not parts:
            return _closed("opencli youtube transcript+comments", rc1 or rc2, (err1 or out1) + "\n" + (err2 or out2))
        note = None if (transcript and comments) else \
            ("yalniz yorumlar (altyazi yok)" if comments else "yalniz altyazi (yorum yok)")
        return _ok(f"{said} + opencli youtube comments", _render(parts), note)
    return None


def _chain_read(url: str) -> dict:
    """The twelve-door reading chain (fetch.py) — it judges walls door by door itself."""
    with tempfile.TemporaryDirectory() as td:
        page = Path(td) / "page.md"
        rc, out, err = _run([sys.executable, str(HERE / "fetch.py"), url, "--out", str(page), "--json",
                             "--timeout", "45"])
        try:
            meta = json.loads(out)
        except ValueError:
            meta = {}
        text = page.read_text(encoding="utf-8", errors="replace") if page.is_file() else ""
    if rc == 0 and meta.get("read") and text.strip():
        return _ok(f"fetch.py:{meta.get('door')}", text, "cached snapshot" if meta.get("cached_snapshot") else None)
    tried = " -> ".join(str(a.get("door", "?")) for a in meta.get("attempts") or [])
    if tried:
        return {"ok": False, "reader": "fetch.py", "body": None, "liveness": meta.get("liveness") or "dead",
                "reason": f"fetch.py {meta.get('liveness') or 'dead'}: {tried}", "http": None}
    return _closed("fetch.py", rc, err or out)


def read_page(url: str, platform: str) -> dict:
    """The body of one address, READ-ONLY — or a closed door, with every door's own words.

    X posts: opencli twitter thread · Reddit threads: opencli reddit read · YouTube videos: opencli
    youtube transcript + comments · everything else: the twelve-door chain (fetch.py). When that
    first reader brings nothing, the LAST door is the hidden research Chrome's own read of his
    signed-in sites (hidden.py read --text; on Facebook with sweep.sh's measured unfold of "See more"
    — six seconds for the page to render, one click round, two to settle). A page that answers there
    with a login shell or a bot wall is not a body: rlib's one judge decides, and it is a closed door."""
    first = _platform_read(url, platform)
    if first is None:
        first = _chain_read(url)
    if first["ok"]:
        return first
    cmd = [sys.executable, str(HERE / "hidden.py"), "read", url, "--text", "--timeout", "90"]
    if platform == "facebook":
        cmd += ["--wait", "6", "--expand", "See more", "--after", "2"]
    rc, out, err = _run(cmd)
    if rc == 0 and out.strip() and not rlib.looks_like_wall(out):
        return _ok("hidden.py read", out, f"ilk okuyucu kapali: {first['reason']}"[:300])
    wall = rc == 0 and bool(out.strip())
    last = "duvar sayfasi (rlib)" if wall else _closed("hidden.py read", rc, err or out)["reason"]
    return {"ok": False, "reader": f"{first['reader']}+hidden.py", "body": None,
            "liveness": "blocked" if wall else first["liveness"],
            "reason": f"{first['reason']} · son kapi {last}"[:400], "http": first["http"]}


def _record(run: Path, url: str, canon: str, res: dict, hunter: str | None) -> dict:
    """Under the lock: the address row gets the outcome (created when the address is new)."""
    rows = read_rows(run)
    rs = by_canon(rows).get(canon, [])
    addr = address_row(rs)
    if addr is None:
        addr = new_row(run, fmt_id(next_num(rows)), url, canon, "fetch", hunter)
        rows.append(addr)
    ensure_states(addr)
    if res["ok"]:
        write_body(run, canon, res["body"])
        set_body(addr, res["body"])
        if not addr.get("author"):
            b = blocks(res["body"])
            addr["author"] = b[0][0] if b and b[0][0] != "-" else None
        addr.update(http_status=res["http"], notes=res["reason"], retrieved_at=now(),
                    tool=f"evidence.py fetch · {res['reader']}")
    elif has_body(run, canon):
        # THE LEAD'S RULING, 2026-09-26 (B56): a body already cached — the ground's or an earlier
        # fetch's — stays the row's body and the row stays alive; the refetch that failed is written
        # into notes. Only an address with no body at all becomes a closed door.
        addr.update(liveness="alive", notes=f"refetch failed: {res['reason']}"[:400])
    else:
        addr.update(liveness=res["liveness"], http_status=res["http"], notes=res["reason"], retrieved_at=now())
        # A CLOSED DOOR IS A TERMINAL STATE (K1 §2.1): the address cannot be read, and the fetcher's own
        # words are the reason. A hunter's irrelevant / duplicate stands — that verdict needs no body.
        if addr["triage"] not in ("irrelevant", "duplicate"):
            addr.update(triage="inaccessible", triage_reason=res["reason"] or f"kapali kapi ({res['liveness']})",
                        duplicate_of=None, triage_by="machine")
    rewrite_rows(run, rows)
    return addr


def cmd_fetch(run: Path, url: str, show: bool) -> int:
    if platforms.reject(url) == "invalid":
        print(f"REFUSED not an address: {url}")
        return 2
    canon = platforms.canonical_url(url)
    res = read_page(url, platforms.platform_of(canon))       # the network, outside the lock
    with locked(run):
        addr = _record(run, url, canon, res, hunter_name(run))
    if not res["ok"]:
        print(f"KAPALI KAPI {url} {res['reason']}")
        return 3
    print(f"OK {addr['id']} {addr['bytes']}B {body_path(run, canon)}")
    if show:
        print(res["body"])
    return 0


# =================================================================== a quote becomes a row
def _credit(addr: dict, quote: dict, hunter: str | None) -> bool:
    """What a hunter's quote says about its rows; True when a row already on file changed.

    A QUOTE IS EVIDENCE BY DEFINITION (the lead, 2026-09-26): the quote row, and its address while it
    is still `pending`, become `relevant` by the hunter — otherwise the writer and the completion gate,
    which look at relevant rows, never see what a hunter found by itself. A triage that removed the
    address (irrelevant · duplicate · inaccessible) stands. The address's verdict becomes `evidence`
    when it has none (the verdict addendum). The READING is not touched: a quote proves one sentence
    was seen, not the body, so `add` never marks a row read (K1 §2.1) — `batch` prints it."""
    changed = False
    for r in (quote, addr):
        if triage_of(r) == "pending":
            ensure_states(r).update(triage="relevant", triage_reason=None, duplicate_of=None, triage_by=hunter)
            changed = True
    if addr.get("verdict") is None:
        ensure_states(addr).update(verdict="evidence", verdict_by=hunter, verdict_at=now())
        changed = True
    return changed


def cmd_add(run: Path, url: str, quote: str, author: str | None, date: str | None,
            title: str | None) -> int:
    if platforms.reject(url) == "invalid":
        print(f"REFUSED not an address: {url}")
        return 2
    canon = platforms.canonical_url(url)
    nq = normalize(quote)                         # what is looked for in the body, as it stands
    kept = passage_text(quote)                    # what the row keeps: the quote's words
    if not nq or not kept:
        print(f"REFUSED empty quote: {url}")
        return 2
    body, fetched = read_body(run, canon), None
    if body is None:
        fetched = read_page(url, platforms.platform_of(canon))
        if not fetched["ok"]:
            with locked(run):
                _record(run, url, canon, fetched, hunter_name(run))
            print(f"KAPALI KAPI {url} {fetched['reason']}")
            return 3
        body = fetched["body"]
    elif not vouched(run, canon, address_row(by_canon(read_rows(run)).get(canon, []))):
        print(f"REFUSED body not fetched by evidence.py: {url}")
        return 2
    if nq not in normalize(body):
        # NOTHING is written on this path — not the row, not even the body just read — so the
        # file a refused quote leaves behind is byte for byte the file it found.
        print(f"REFUSED quote not in body: {url}")
        return 2
    hunter = hunter_name(run)
    notes = []
    with locked(run):
        if fetched:
            _record(run, url, canon, fetched, hunter)
        rows = read_rows(run)
        rs = by_canon(rows).get(canon, [])
        addr = address_row(rs)
        if not vouched(run, canon, addr):         # the body changed hands after it was read
            print(f"REFUSED body not fetched by evidence.py: {url}")
            return 2
        sha = rlib.sha256(kept)                   # a row written before the words rule kept nq's hash
        same = next((r for r in rs if r.get("tool") == ADD_TOOL
                     and r.get("passage_sha256") in (sha, rlib.sha256(nq))), None)
        if same:                                  # one quote, one row — a repeated add is the same quote
            if _credit(addr, same, hunter):       # a quote row written before the credit rule
                rewrite_rows(run, rows)
            print(same["id"])
            return 0
        # WHO SAID IT AND WHEN come from the body, never from the model (the B56 verifier: an
        # `--author "Sam Altman"` used to beat the fetcher's u/x). A reader's block names its
        # author; a ground post's row carries the author its raw named; the arguments fill only
        # what the body does not know.
        bl = blocks(body)
        who, when = (addr.get("author"), addr.get("pub_date")) if not bl else (None, None)
        for a, d, _lab, text in bl:
            if nq in normalize(text):
                who, when = (None if a == "-" else a), iso_date(d if d != "-" else None)
                break
        a_arg, d_arg = clean(author, 120), iso_date(date)
        if a_arg and who and a_arg != who:
            notes.append("not: yazar gövdeden alındı")
        if d_arg and when and d_arg != when:
            notes.append("not: tarih gövdeden alındı")
        row = new_row(run, fmt_id(next_num(rows)), addr.get("url") or url, canon,
                      addr.get("channel") or "add", hunter,
                      kind="evidence", tool=ADD_TOOL, title=clean(title) or addr.get("title"),
                      author=who or a_arg or addr.get("author"), pub_date=when or d_arg or addr.get("pub_date"),
                      passage=kept, passage_sha256=sha, source_type=addr.get("source_type") or source_type(url, ""),
                      http_status=addr.get("http_status"), liveness="alive", bytes=len(body.encode("utf-8")),
                      triage="relevant", triage_by=hunter)
        row["primary"] = row["source_type"] in ("primary-doc", "code")
        if _credit(addr, row, hunter):            # the address changed: the file is rewritten
            rewrite_rows(run, rows + [row])
        else:
            append_rows(run, [row])
    for n in notes:                               # stderr: stdout stays the id alone, for $(...)
        print(n, file=sys.stderr)
    print(row["id"])
    return 0


# =================================================================== triage (B56 K1 §2.2)
def address_index(rows: list[dict]) -> dict[str, dict]:
    """id -> the row that stands for that id's ADDRESS. A quote row of `add` maps to its address, so
    a triage, a read or a verdict given by a quote's id lands on the row `status` counts."""
    out: dict[str, dict] = {}
    for rs in by_canon(rows).values():
        addr = address_row(rs)
        for r in rs:
            if r.get("id"):
                out[str(r["id"])] = addr
    return out


def _entries(entries: list) -> tuple[dict[str, dict], list[tuple[str, str]]]:
    """A bulk file's entries by id — the last one for an id wins, so a row is counted once."""
    final: dict[str, dict] = {}
    bad: list[tuple[str, str]] = []
    for e in entries:
        if isinstance(e, dict):
            final[str(e.get("id") or "").strip()] = e
        else:
            bad.append(("?", f"not an object: {str(e)[:80]}"))
    return final, bad


def load_list(path: str, key: str) -> tuple[list | None, str]:
    """The `key` list of a JSON file, or (None, why)."""
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        return None, f"not readable as JSON: {path} ({type(e).__name__})"
    if not isinstance(data, dict) or not isinstance(data.get(key), list):
        return None, f'no "{key}" list in {path}'
    return data[key], ""


def is_hunter(by: str | None) -> bool:
    """Is this judge a hunter role — not `machine`, not a triage model (`haiku-…`, `claude-…`)? The
    verifier's B3, 2026-09-26: `triage-bulk --by x` marking its own unread rows irrelevant took them out
    of what it owed, unread 0 without a byte printed. A hunter may take out only what batch printed it."""
    b = str(by or "").strip().lower()
    return bool(b) and b != "machine" and not b.startswith(("haiku", "claude"))


def triage_fields(index: dict, rid, status, reason, dup, by,
                  hunter: bool = False) -> tuple[str, dict | None, object]:
    """One verdict checked against the contract: ("ok", its address row, the fields to write),
    ("unknown-id", None, why) or ("refused", the row, why). A duplicate's reason may be the id it
    repeats: the measured Haiku answer gave `duplicate_of` and no reason for both of its duplicates.
    `hunter`: the judge is a hunter role (is_hunter), whose irrelevant / duplicate of an unread row is refused."""
    rid = str(rid or "").strip()
    addr = index.get(rid)
    if addr is None:
        return "unknown-id", None, f"no such id: {rid or '(empty)'}"
    status = str(status or "").strip().lower()
    if status not in TRIAGE_STATES:
        return "refused", addr, f"{rid}: unknown status {status!r} (one of: {' '.join(TRIAGE_STATES)})"
    if hunter and status in ("irrelevant", "duplicate") and read_of(addr) == "unread":
        return "refused", addr, f"{rid}: a hunter may only eliminate what it has read — batch never printed {addr.get('id')}"
    why = re.sub(r"\s+", " ", reason).strip()[:400] if isinstance(reason, str) else ""
    orig = None
    if status == "duplicate" and dup not in (None, ""):
        target = index.get(str(dup).strip())
        if target is None:
            return "refused", addr, f"{rid}: duplicate of {dup}, which is no id of this run"
        if target is addr:
            return "refused", addr, f"{rid}: an address cannot duplicate itself ({dup})"
        orig = target.get("id")
        why = why or f"duplicate of {orig}"
    if status in NEEDS_REASON and not why:
        need = "--reason, or --duplicate-of the id it repeats" if status == "duplicate" else "--reason"
        return "refused", addr, f"{rid}: {status} needs a reason ({need})"
    return "ok", addr, {"triage": status, "triage_reason": why or None, "duplicate_of": orig,
                        "triage_by": by or None}


def cmd_triage(run: Path, rid: str, status: str, reason: str | None, dup: str | None,
               by: str | None) -> int:
    with locked(run):
        rows = read_rows(run)
        who = by or hunter_name(run)
        kind, addr, val = triage_fields(address_index(rows), rid, status, reason, dup, who, is_hunter(who))
        if kind != "ok":
            print(f"REFUSED {val}")
            return 2
        ensure_states(addr).update(val)
        rewrite_rows(run, rows)
    print(f"OK {addr['id']} triage={val['triage']}")
    return 0


def apply_triage(run: Path, entries: list, by: str, only: set | None = None,
                 hunter: bool | None = None) -> tuple[Counter, list, list]:
    """A triage JSON's verdicts under ONE lock -> (the counts, the refused (id, why), the ids written).
    `only` is the set of ids the caller asked about (triage.py: one batch): an id the model made up
    is counted unknown-id and touches nothing. triage-bulk and triage.py both come through here, so
    there is one path from a JSON to the ledger. `hunter` (None: judged from `by`, is_hunter) refuses
    a hunter's irrelevant / duplicate of an unread row; triage.py passes False — its judge is a model."""
    counts = Counter({k: 0 for k in ("relevant", "irrelevant", "duplicate", "unknown-id")})
    final, refused = _entries(entries)
    done: list[str] = []
    h = is_hunter(by) if hunter is None else hunter
    with locked(run):
        rows = read_rows(run)
        index = address_index(rows)
        for rid, e in final.items():
            if only is not None and rid not in only:
                counts["unknown-id"] += 1
                continue
            kind, addr, val = triage_fields(index, rid, e.get("status"), e.get("reason"),
                                            e.get("duplicate_of"), by, h)
            if kind == "unknown-id":
                counts["unknown-id"] += 1
            elif kind == "refused":
                refused.append((rid, val))
            else:
                ensure_states(addr).update(val)
                counts[val["triage"]] += 1
                done.append(rid)
        if done:
            rewrite_rows(run, rows)
    return counts, refused, done


def triaged_line(c: Counter) -> str:
    return (f"triaged: relevant {c['relevant']} · irrelevant {c['irrelevant']} · duplicate {c['duplicate']}"
            f" · unknown-id {c['unknown-id']}")


def cmd_triage_bulk(run: Path, path: str, by: str) -> int:
    entries, why = load_list(path, "triage")
    if entries is None:
        print(f"REFUSED {why}")
        return 2
    if not by.strip():
        print("REFUSED --by is empty: say who judged (machine · haiku-4-5 · a hunter role)")
        return 2
    counts, refused, _done = apply_triage(run, entries, by.strip())
    print(triaged_line(counts))
    also = " · ".join(f"{k} {counts[k]}" for k in ("pending", "inaccessible") if counts[k])
    if also:
        print(f"also: {also}")
    if refused:
        print(f"refused {len(refused)}, left as they were: " + " · ".join(w for _, w in refused[:20]))
        return 2
    return 0


# =================================================================== the hunter's verdict (K1 addendum)
# WHY. The morning's experiment (x-deneme-2026-09-26): Haiku, Opus 5.5 low and Sonnet 5 high each
# judged 130 of 130 bodies when the answer had to name EVERY id — demanding a verdict per id is what
# made every model read everything. So a hunter owes each row it was printed a verdict: evidence (a
# quote came from it; `add` sets that itself) or none, with the reason. `status` counts the read rows
# judged / unjudged, and `batch` shows the hunter what it still owes.
def verdict_fields(index: dict, rid, verdict, reason, hunter: str) -> tuple[str, dict | None, object]:
    rid = str(rid or "").strip()
    addr = index.get(rid)
    if addr is None:
        return "unknown-id", None, f"no such id: {rid or '(empty)'}"
    v = str(verdict or "").strip().lower()
    if v not in VERDICTS:
        return "refused", addr, f"{rid}: unknown verdict {v!r} (evidence or none)"
    why = re.sub(r"\s+", " ", reason).strip()[:400] if isinstance(reason, str) else ""
    if v == "none" and not why:
        return "refused", addr, f"{rid}: none needs a reason (--reason)"
    return "ok", addr, {"verdict": v, "verdict_reason": why or None, "verdict_by": hunter, "verdict_at": now()}


def cmd_verdict(run: Path, hunter: str, rid: str, verdict: str, reason: str | None) -> int:
    with locked(run):
        rows = read_rows(run)
        kind, addr, val = verdict_fields(address_index(rows), rid, verdict, reason, hunter)
        if kind != "ok":
            print(f"REFUSED {val}")
            return 2
        ensure_states(addr).update(val)
        rewrite_rows(run, rows)
    print(f"OK {addr['id']} verdict={val['verdict']}")
    return 0


def cmd_verdict_bulk(run: Path, hunter: str, path: str) -> int:
    entries, why = load_list(path, "verdicts")
    if entries is None:
        print(f"REFUSED {why}")
        return 2
    counts = Counter({k: 0 for k in ("evidence", "none", "unknown-id")})
    final, refused = _entries(entries)
    with locked(run):
        rows = read_rows(run)
        index = address_index(rows)
        for rid, e in final.items():
            kind, addr, val = verdict_fields(index, rid, e.get("verdict"), e.get("reason"), hunter)
            if kind == "unknown-id":
                counts["unknown-id"] += 1
            elif kind == "refused":
                refused.append((rid, val))
            else:
                ensure_states(addr).update(val)
                counts[val["verdict"]] += 1
        if counts["evidence"] or counts["none"]:
            rewrite_rows(run, rows)
    print(f"verdicts: evidence {counts['evidence']} · none {counts['none']} · unknown-id {counts['unknown-id']}")
    if refused:
        print(f"refused {len(refused)}, left as they were: " + " · ".join(w for _, w in refused[:20]))
        return 2
    return 0


# =================================================================== reading (B56 K1 §2.2)
# WHY READ IS ONLY WHAT THIS SCRIPT PRINTED. Measured 2026-09-26 on the deep run of 02:34: the x
# hunter printed the first 350 characters of 128 bodies in ONE command whose output was cut at 20,000
# characters, saw 73 of them, and declared "okundu 130" — and the coverage table took its word. So
# `read_status` moves only here: `batch` and `page` print a row's bytes and count them, whole (read)
# or up to where the print stopped (partial, with read_completeness = read_bytes / bytes). `add`
# never marks a row, a hunter's sentence never does, and a raw `cat`/`head` over bodies/ counts
# nothing. The rows are WRITTEN before a byte is printed: a print that dies half way can leave a row
# marked that its hunter did not see to the end, never a printed row unread.
READ_CHARS = 20000     # one print: the 20,000 characters the morning's one command was cut at
MIN_CHARS = 500        # below it a long address's header leaves a body no room
EVIDENCE_PY = Path(__file__).resolve()


def header_of(addr: dict, canon: str) -> str:
    """`### <id> | @<author> | <date> | <url>` — the shape of the triage prompt measured 2026-09-26."""
    who = re.sub(r"[\s|]+", " ", str(addr.get("author") or "")).strip().lstrip("@") or "?"
    return f"### {addr.get('id')} | @{who} | {addr.get('pub_date') or '?'} | {canon}"


def _slice(raw: bytes, start: int, chars: int) -> tuple[str, int]:
    """Up to `chars` characters of a body from byte `start`, and the byte they end at. A byte that is
    not UTF-8 is carried one for one (surrogateescape), so the offset is always the file's own."""
    part = raw[start:].decode("utf-8", "surrogateescape")[:max(chars, 0)]
    data = part.encode("utf-8", "surrogateescape")
    return data.decode("utf-8", "replace"), start + len(data)


def _block(head: str, text: str) -> str:
    return f"{head}\n{text}" + ("" if text.endswith("\n") else "\n") + "\n"


def _mark(addr: dict, who: str | None, upto: int, size: int) -> str:
    """Bytes 0..upto of a `size`-byte body have been printed: the row's reading; returns read_status."""
    status = "read" if upto >= size else "partial"
    ensure_states(addr).update(read_status=status, read_by=who, read_at=now(), read_bytes=upto,
                               read_completeness=1.0 if status == "read" else min(0.9999, round(upto / size, 4)))
    return status


def _rest(run: Path, rid: str, upto: int) -> str:
    return f'python3 "{EVIDENCE_PY}" page "{run}" --id {rid} --from {upto}'


def _on(addr: dict, canon: str, platform: str) -> bool:
    return platform == "all" or row_platform(addr, canon) == platform


def _owed(groups: dict, platform: str) -> tuple[int, int, int]:
    """(relevant rows still unread, relevant rows printed only in part, read rows with no verdict yet)
    on a platform."""
    unread = partial = unjudged = 0
    for canon, rs in groups.items():
        addr = address_row(rs)
        if addr is None or triage_of(addr) != "relevant" or not _on(addr, canon, platform):
            continue
        if read_of(addr) == "unread":
            unread += 1
        elif read_of(addr) == "partial":
            partial += 1
        elif read_of(addr) == "read" and addr.get("verdict") is None:
            unjudged += 1
    return unread, partial, unjudged


def _resume_at(raw: bytes, addr: dict) -> int:
    """The byte a batch print of this row begins at: 0 for an unread row; for a partial one where its
    last print stopped (read_bytes), never inside a character — as `page` begins."""
    if read_of(addr) != "partial":
        return 0
    at = min(int(addr.get("read_bytes") or 0), len(raw))
    while 0 < at < len(raw) and (raw[at] & 0xC0) == 0x80:
        at -= 1
    return at


def cmd_batch(run: Path, hunter: str, platform: str, n: int, max_chars: int) -> int:
    """The next ≤ n relevant, unread rows that have a body — SHORTEST FIRST — each as its header and
    its whole body, stopping before the print would pass max-chars (headers count as well as bodies:
    the limit is what reaches the hunter's screen; only the one-line trailer and a partial row's
    `PARTIAL` line stand outside it). A row too long for a batch of its own goes alone, cut at
    max-chars: partial, followed by the `page` line that prints the rest.

    WHY SHORTEST FIRST, measured on the 2026-09-26 fixture: the first relevant X row in ledger order
    is a 19,896-character article (L0112). In ledger order it alone fills a 20,000-character batch and
    the ten posts behind it wait a turn; shortest first a batch carries ten whole posts, and the
    article still comes, whole, in a batch of its own.

    A PARTIAL ROW COMES FIRST, from where its last print stopped (the verifier's B1, 2026-09-26: with
    L0112 partial at 0.2475, batch said "nothing left" and nothing counted it as owed). Its next slice is
    printed as `page` prints one and said the same way (`PAGE: <id> bytes a-b of n · read|partial …`);
    it turns `read` when its end has been printed."""
    shown: list[tuple] = []
    with locked(run):
        rows = read_rows(run)
        groups = by_canon(rows)
        queue = []
        for canon, rs in groups.items():
            addr = address_row(rs)
            if (addr is not None and _on(addr, canon, platform) and triage_of(addr) == "relevant"
                    and read_of(addr) in ("unread", "partial") and has_body(run, canon)):
                queue.append((read_of(addr) != "partial", body_path(run, canon).stat().st_size,
                              str(addr.get("id")), canon, addr))
        used = 0
        for _later, _size, rid, canon, addr in sorted(queue, key=lambda q: q[:3]):
            if len(shown) >= n:
                break
            raw = body_path(run, canon).read_bytes()
            start = _resume_at(raw, addr)
            head = header_of(addr, canon)
            text, end = _slice(raw, start, len(raw))
            if used + len(_block(head, text)) > max_chars:
                if shown:
                    break                             # stops before the total passes max-chars
                text, end = _slice(raw, start, max(max_chars - len(head) - 3, 100))
            used += len(_block(head, text))
            status = _mark(addr, hunter, end, len(raw))
            shown.append((rid, head, text, start, end, len(raw), status, addr["read_completeness"]))
        if shown:
            rewrite_rows(run, rows)                   # WRITTEN before a byte is printed
        left, part, unjudged = _owed(groups, platform)
    for rid, head, text, start, end, size, status, done in shown:
        sys.stdout.write(_block(head, text))
        rest = f" — the rest: {_rest(run, rid, end)}" if status == "partial" else ""
        if start:
            print(f"PAGE: {rid} bytes {start}-{end} of {size} · {status} {done}{rest}\n")
        elif status == "partial":
            print(f"PARTIAL {rid}: bytes 0-{end} of {size} printed{rest}\n")
    owed = f" · unjudged {unjudged}"
    remaining = f"remaining relevant unread {left} · partial {part} (platform {platform}){owed}"
    if shown:
        print(f"BATCH: printed {len(shown)} · {remaining}")
    elif left or part:
        print(f"BATCH: the {left + part} relevant addresses left unread or partial on {platform} have no body — "
              f"fetch them first (`list --platform {platform} --unread` names the unread ones)")
        print(f"BATCH: printed 0 · {remaining}")
    else:
        print(f"BATCH: nothing left — okunacak adres kalmadı{owed}")
    return 0


def cmd_page(run: Path, rid: str, start: int, max_chars: int) -> int:
    """The rest of a body from byte `start` (a partial row's read_bytes), printed and counted. The
    count grows only over bytes printed without a gap: a --from past what was printed is refused,
    so a jump ahead can never be counted as read."""
    with locked(run):
        rows = read_rows(run)
        addr = address_index(rows).get(rid)
        if addr is None:
            print(f"REFUSED no such id: {rid}")
            return 2
        rid = str(addr.get("id"))
        canon = addr.get("url_canonical") or platforms.canonical_url(addr.get("url") or "")
        if not has_body(run, canon):
            print(f"REFUSED {rid} has no body — fetch it first")
            return 2
        raw = body_path(run, canon).read_bytes()
        done = min(int(addr.get("read_bytes") or 0), len(raw)) if read_of(addr) != "unread" else 0
        if not 0 <= start <= done:
            print(f"REFUSED {rid}: --from {start} is outside what was printed (0-{done}); continue from {done}")
            return 2
        while 0 < start < len(raw) and (raw[start] & 0xC0) == 0x80:
            start -= 1                                # never begin inside a character
        head = header_of(addr, canon)
        text, end = _slice(raw, start, max(max_chars - len(head) - 3, 100))
        upto = max(done, end)
        status = _mark(addr, hunter_name(run) or addr.get("read_by"), upto, len(raw))
        rewrite_rows(run, rows)                       # WRITTEN before a byte is printed
    sys.stdout.write(_block(head, text))
    tail = f" — the rest: {_rest(run, rid, upto)}" if status == "partial" else ""
    print(f"PAGE: {rid} bytes {start}-{end} of {len(raw)} · {status} {addr['read_completeness']}{tail}")
    return 0


# =================================================================== status (B56 K1 §2.2)
# `pending_with_body` is the triage's own backlog (done-list item 3: "pending (with body) 0" after a
# triage); it stands last, so the contract's columns keep their places.
STATUS_COLUMNS = ("discovered", "pending", "relevant", "irrelevant", "duplicate", "inaccessible",
                  "read", "partial", "unread", "judged", "unjudged", "pending_with_body")


def ledger_counts(run: Path, rows: list[dict]) -> tuple[dict[str, Counter], dict[str, list[str]]]:
    """Per platform, per DISTINCT ADDRESS (distinct url_canonical: kapsama.py's Bulundu), the address
    row's states. A value outside the contract is counted nowhere and named, so no sum closes over it."""
    per: dict[str, Counter] = {}
    odd: dict[str, list[str]] = {}
    for canon, rs in by_canon(rows).items():
        addr = address_row(rs)
        if not canon or addr is None:
            continue
        p = row_platform(addr, canon)
        c = per.setdefault(p, Counter())
        c["discovered"] += 1
        t = triage_of(addr)
        if t not in TRIAGE_STATES:
            odd.setdefault(p, []).append(f"{addr.get('id')} triage={t!r}")
            continue
        c[t] += 1
        if t == "pending" and has_body(run, canon):
            c["pending_with_body"] += 1
        if t != "relevant":
            continue
        s = read_of(addr)
        if s not in READ_STATES:
            odd.setdefault(p, []).append(f"{addr.get('id')} read_status={s!r}")
            continue
        c[s] += 1
        if s == "read":
            v = addr.get("verdict")
            if v is None:
                c["unjudged"] += 1
            elif v in VERDICTS:
                c["judged"] += 1
            else:
                odd.setdefault(p, []).append(f"{addr.get('id')} verdict={v!r}")
    return per, odd


def reconcile(table: dict[str, dict]) -> list[str]:
    bad = []
    for p, t in table.items():
        triaged = sum(t[k] for k in TRIAGE_STATES)
        if t["discovered"] != triaged:
            bad.append(f"{p} discovered {t['discovered']} ≠ pending+relevant+irrelevant+duplicate+inaccessible {triaged}")
        if t["relevant"] != t["read"] + t["partial"] + t["unread"]:
            bad.append(f"{p} relevant {t['relevant']} ≠ read+partial+unread {t['read'] + t['partial'] + t['unread']}")
        if t["read"] != t["judged"] + t["unjudged"]:
            bad.append(f"{p} read {t['read']} ≠ judged+unjudged {t['judged'] + t['unjudged']}")
    return bad


def cmd_status(run: Path, wanted: list[str] | None, fmt: str) -> int:
    per, odd = ledger_counts(run, read_rows(run))
    order = {p: i for i, p in enumerate(platforms.PLATFORMS)}
    names = wanted or sorted(per, key=lambda p: (order.get(p, len(order)), p))
    table = {p: {k: per.get(p, Counter())[k] for k in STATUS_COLUMNS} for p in names}
    total = {k: sum(t[k] for t in table.values()) for k in STATUS_COLUMNS}
    bad = reconcile(table)
    named = [x for p in names for x in odd.get(p, [])]
    verdict = "RECONCILED" if not bad else \
        "MISMATCH: " + "; ".join(bad) + (f" — rows: {', '.join(named[:8])}" if named else "")
    if fmt == "json":
        # `owed` (json only): what the hunters still owe there in ONE number for the completion gate —
        # relevant rows unread or partial, and read rows with no verdict (the verifier's B1, 2026-09-26)
        for t in (*table.values(), total):
            t["owed"] = t["unread"] + t["partial"] + t["unjudged"]
        out = {"platforms": table, "total": total, "reconciled": not bad}
        if bad:
            out["mismatch"] = verdict[len("MISMATCH: "):]
        print(json.dumps(out, ensure_ascii=False))
        return 1 if bad else 0
    lines = [[p, *(table[p][k] for k in STATUS_COLUMNS)] for p in names]
    lines.append(["TOTAL", *(total[k] for k in STATUS_COLUMNS)])
    if fmt == "tsv":
        print("\t".join(("platform",) + STATUS_COLUMNS))
        for ln in lines:
            print("\t".join(str(x) for x in ln))
    else:
        print(f"ledger status · {run.name} — per distinct address: discovered = pending + relevant + irrelevant"
              " + duplicate + inaccessible │ relevant: read · partial · unread (bytes this script printed)"
              " │ read: judged · unjudged (the hunter's verdict)")
        print()
        print("| platform | " + " | ".join(k.replace("_", " ") for k in STATUS_COLUMNS) + " |")
        print("|---|" + "---:|" * len(STATUS_COLUMNS))
        for ln in lines:
            print("| " + " | ".join(str(x) for x in ln) + " |")
        print()
    print(verdict)
    return 1 if bad else 0


# =================================================================== the writer's rows (B56 K2 §2.1)
# WHY. The K1 answer of 2026-09-26 cites 150 ids, and 12 of them are addresses a hunter had READ and
# judged `none` — L1071, "benchmark/promo, no user preference", stands on its line 71 — because
# fleet.sh handed the writer every relevant row. So a row reaches the writer only when the ledger
# ADMITS it: a hunter's quote (`add`), or an address the hunter judged `evidence`, on an address the
# triage kept (`relevant`) with a body. A quote row carries no verdict of its own (it sits on the
# address, address_index): it is admitted on its address alone, because the sentence a hunter found
# in a body stays evidence when the rest of that page is judged `none` (1 of the 150: L1645, whose
# GitHub issue L1642 was judged "UI issue, model karşılaştırması yok").
REFUSED_AS = ("verdict none", "hüküm yok", "elendi", "gövde yok")
WRITER_PASSAGE = 300
WRITER_JSON = ("id", "platform", "author", "pub_date", "passage", "url", "url_canonical", "domain")


def _admission(row: dict, addr: dict | None) -> tuple[str | None, str]:
    """(None, why it is admitted) or (the refusal's kind — one of REFUSED_AS —, its reason)."""
    addr = addr or row
    quote = row.get("tool") == ADD_TOOL
    if not quote and addr.get("verdict") == "none":
        why = re.sub(r"\s+", " ", str(addr.get("verdict_reason") or "")).strip() or "gerekçe yok"
        return "verdict none", f"avcı: kanıt değil — {why}"
    if triage_of(addr) != "relevant":
        return "elendi", f"elendi: {triage_of(addr)}"
    if addr.get("liveness") != "alive" or (addr.get("bytes") or 0) <= 0:
        return "gövde yok", "gövde yok"
    if quote:
        return None, "avcı alıntısı"
    if addr.get("verdict") == "evidence":
        return None, "avcı: kanıt"
    return "hüküm yok", "hüküm yok"


def admissible(row: dict, addr: dict | None) -> tuple[bool, str]:
    """May the writer be handed this row? `addr` is the row's ADDRESS row (address_index). Admitted:
    the address is `relevant` and has a body, and the row is a hunter's quote or the address is judged
    `evidence`. Refused, with the reason: `avcı: kanıt değil — <verdict_reason>` · `elendi: <triage>`
    · `gövde yok` · `hüküm yok` (relevant, not a quote, no verdict yet — read or not)."""
    kind, why = _admission(row, addr)
    return kind is None, why


def one_line(v) -> str:
    return re.sub(r"\s+", " ", str(v or "")).strip()


def writer_line(row: dict, limit: int = WRITER_PASSAGE, url: bool = True) -> str:
    """`[id] platform · @author · date · "passage ≤ limit" · url` — the line fleet.sh's writer step
    printed in K1, character for character; claims.py prints it cut at 160, without the url."""
    said = one_line(row.get("passage") or row.get("title"))
    said = said if len(said) <= limit else said[:limit - 1].rstrip() + "…"
    line = (f'[{row["id"]}] {one_line(row.get("platform")) or "?"} · @{one_line(row.get("author")) or "?"} · '
            f'{one_line(row.get("pub_date")) or "?"} · "{said}"')
    return f'{line} · {one_line(row.get("url") or row.get("url_canonical"))}' if url else line


def cmd_writer_rows(run: Path, fmt: str) -> int:
    """The admitted rows, sorted (platform, id), one writer line (or one JSON object) each; every row
    of the ledger is counted, admitted or refused by its reason, on stderr — stdout is the rows alone."""
    rows = read_rows(run)
    index = address_index(rows)
    admitted: list[dict] = []
    refused = Counter({k: 0 for k in REFUSED_AS})
    for r in rows:
        if not r.get("id"):
            continue
        kind, _why = _admission(r, index.get(str(r["id"])))
        if kind is None:
            admitted.append(r)
        else:
            refused[kind] += 1
    for r in sorted(admitted, key=lambda r: (one_line(r.get("platform")), one_line(r.get("id")))):
        print(json.dumps({k: r.get(k) for k in WRITER_JSON}, ensure_ascii=False) if fmt == "json" else writer_line(r))
    print(f"writer-rows: {len(admitted)} admissible · {sum(refused.values())} refused ("
          + " · ".join(f"{k} {refused[k]}" for k in REFUSED_AS) + ")", file=sys.stderr)
    return 0


def cmd_repassage(run: Path) -> int:
    """Every row whose passage is the chrome of its body — the rule's passage is not the body's head cut,
    the passage every row was given before the rule — gets the passage the rule gives; a body this script
    did not cache (vouched) is not read. A quote row of `add` is never touched: its passage IS the
    hunter's quote."""
    k = 0
    with locked(run):
        rows = read_rows(run)
        for canon, rs in by_canon(rows).items():
            if not vouched(run, canon, address_row(rs)):
                continue
            text = passage_source(read_body(run, canon) or "")
            new = passage_text(passage_body(text))[:PASSAGE_CHARS].rstrip()
            if new == passage_text(text)[:PASSAGE_CHARS].rstrip():
                continue
            for r in rs:
                if r.get("tool") != ADD_TOOL and r.get("passage") != new:
                    r.update(passage=new, passage_sha256=rlib.sha256(new))
                    k += 1
        if k:
            rewrite_rows(run, rows)
    print(f"repassage: {k} rows")
    return 0


# =================================================================== the door
def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="evidence.py", description="evidence rows, written by the fetcher")
    sub = ap.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("from-ground")
    g.add_argument("run")
    li = sub.add_parser("list")
    li.add_argument("run")
    li.add_argument("--platform", required=True)
    li.add_argument("--unread", action="store_true", help="relevant rows never printed to a hunter (K1)")
    li.add_argument("--no-body", dest="no_body", action="store_true", help="rows with no body yet")
    li.add_argument("--kind", choices=("all", "discovery", "evidence"), default="all")
    f = sub.add_parser("fetch")
    f.add_argument("run")
    f.add_argument("--url", required=True)
    f.add_argument("--print", dest="show", action="store_true")
    a = sub.add_parser("add")
    a.add_argument("run")
    a.add_argument("--url", required=True)
    a.add_argument("--quote", required=True)
    a.add_argument("--author")
    a.add_argument("--date")
    a.add_argument("--title")
    t = sub.add_parser("triage")
    t.add_argument("run")
    t.add_argument("--id", required=True)
    t.add_argument("--status", required=True, choices=TRIAGE_STATES)
    t.add_argument("--reason")
    t.add_argument("--duplicate-of", dest="duplicate_of")
    t.add_argument("--by")
    tb = sub.add_parser("triage-bulk")
    tb.add_argument("run")
    tb.add_argument("--json", dest="json_file", required=True)
    tb.add_argument("--by", required=True)
    b = sub.add_parser("batch")
    b.add_argument("run")
    b.add_argument("--hunter", required=True)
    b.add_argument("--platform", required=True)
    b.add_argument("--n", type=int, default=10)
    b.add_argument("--max-chars", dest="max_chars", type=int, default=READ_CHARS)
    pg = sub.add_parser("page")
    pg.add_argument("run")
    pg.add_argument("--id", required=True)
    pg.add_argument("--from", dest="start", type=int, required=True)
    pg.add_argument("--max-chars", dest="max_chars", type=int, default=READ_CHARS)
    v = sub.add_parser("verdict")
    v.add_argument("run")
    v.add_argument("--hunter", required=True)
    v.add_argument("--id", required=True)
    v.add_argument("--verdict", required=True, choices=VERDICTS)
    v.add_argument("--reason")
    vb = sub.add_parser("verdict-bulk")
    vb.add_argument("run")
    vb.add_argument("--hunter", required=True)
    vb.add_argument("--json", dest="json_file", required=True)
    st = sub.add_parser("status")
    st.add_argument("run")
    st.add_argument("--platform", action="append", help="one, a comma list, or repeated; every platform when absent")
    st.add_argument("--format", choices=("md", "tsv", "json"), default="md")
    s = sub.add_parser("show")
    s.add_argument("run")
    s.add_argument("id")
    wr = sub.add_parser("writer-rows")
    wr.add_argument("run")
    wr.add_argument("--format", choices=("writer", "json"), default="writer")
    rp = sub.add_parser("repassage")
    rp.add_argument("run")
    p = sub.add_parser("platform-of")
    p.add_argument("url")
    args = ap.parse_args(argv)

    if args.cmd == "platform-of":
        print(platforms.platform_of(platforms.canonical_url(args.url)))
        return 0
    run = Path(args.run)
    if not run.is_dir():
        print(f"REFUSED no such run folder: {run}")
        return 2
    if args.cmd == "from-ground":
        return cmd_from_ground(run)
    if args.cmd == "writer-rows":
        return cmd_writer_rows(run, args.format)
    if args.cmd == "repassage":
        return cmd_repassage(run)
    if args.cmd == "list":
        if args.platform != "all" and args.platform not in platforms.PLATFORMS:
            print(f"REFUSED unknown platform: {args.platform} (one of: {' '.join(platforms.PLATFORMS)})")
            return 2
        return cmd_list(run, args.platform, args.unread, args.no_body, args.kind)
    if args.cmd == "fetch":
        return cmd_fetch(run, args.url, args.show)
    if args.cmd == "add":
        return cmd_add(run, args.url, args.quote, args.author, args.date, args.title)
    if args.cmd == "triage":
        return cmd_triage(run, args.id, args.status, args.reason, args.duplicate_of, args.by)
    if args.cmd == "triage-bulk":
        return cmd_triage_bulk(run, args.json_file, args.by)
    if args.cmd == "status":
        wanted = list(dict.fromkeys(p.strip() for v in args.platform or [] for p in v.split(",") if p.strip()))
        unknown = [p for p in wanted if p != "all" and p not in platforms.PLATFORMS]
        if unknown:
            print(f"REFUSED unknown platform: {' '.join(unknown)} (one of: {' '.join(platforms.PLATFORMS)})")
            return 2
        return cmd_status(run, None if not wanted or "all" in wanted else wanted, args.format)
    if args.cmd in ("batch", "verdict", "verdict-bulk") and not args.hunter.strip():
        print("REFUSED --hunter is empty: name the role that reads")
        return 2
    if args.cmd == "verdict":
        return cmd_verdict(run, args.hunter.strip(), args.id, args.verdict, args.reason)
    if args.cmd == "verdict-bulk":
        return cmd_verdict_bulk(run, args.hunter.strip(), args.json_file)
    if args.cmd in ("batch", "page") and args.max_chars < MIN_CHARS:
        print(f"REFUSED --max-chars {args.max_chars}: below {MIN_CHARS} a header leaves a body no room")
        return 2
    if args.cmd == "batch":
        if args.platform != "all" and args.platform not in platforms.PLATFORMS:
            print(f"REFUSED unknown platform: {args.platform} (one of: {' '.join(platforms.PLATFORMS)})")
            return 2
        if args.n < 1:
            print(f"REFUSED --n {args.n}: a batch prints at least one row")
            return 2
        return cmd_batch(run, args.hunter.strip(), args.platform, args.n, args.max_chars)
    if args.cmd == "page":
        return cmd_page(run, args.id, args.start, args.max_chars)
    return cmd_show(run, args.id)


if __name__ == "__main__":
    raise SystemExit(main())
