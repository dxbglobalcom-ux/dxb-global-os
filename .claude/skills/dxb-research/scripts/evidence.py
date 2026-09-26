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
  evidence.py list <run> --platform <p> [--unread] [--kind all|discovery|evidence]
  evidence.py fetch <run> --url <u> [--print]
  evidence.py add <run> --url <u> --quote "<text>" [--author A] [--date D] [--title T]
  evidence.py show <run> <id>
  evidence.py platform-of <url>

The contract (names, flags, outputs, exit codes) is EVIDENCE-B56-2026-09-26.md, "THE CONTRACTS";
fleet/fleet.sh and scripts/render.py are built against it. Rows follow schemas/evidence_row.schema.json
plus `platform` (scripts/platforms.py) and `hunter` (the role, or "ground"). Seven hunters write at
once, so every write happens under an exclusive fcntl lock on <run>/evidence.lock.

Exit: 0 done · 2 refused (a quote not in the body, an unknown id, a bad argument) · 3 closed door.
The time a reader may take: DXB_EVIDENCE_TIMEOUT seconds (default 300 — the hidden Chrome queues
its eight windows, so a busy fleet waits before it reads).
"""
from __future__ import annotations

import argparse
import fcntl
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata
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


def passage_of(body: str) -> str:
    """The body's first 600 characters, normalised — of the FIRST post when a reader wrote several,
    so one row's passage never runs from one author's words into the next one's."""
    b = blocks(body)
    return normalize(b[0][3] if b else body)[:PASSAGE_CHARS].rstrip()


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


def new_row(run: Path, rid: str, url: str, canon: str, channel: str, hunter: str | None,
            **kw) -> dict:
    st = source_type(url, channel)
    row = {"id": rid, "run_id": run.name, "kind": "discovery", "retrieved_at": now(), "tool": channel,
           "channel": channel, "query_id": None, "gap": None, "url": url, "url_canonical": canon,
           "domain": rlib.registrable_domain(canon), "title": None, "author": None, "pub_date": None,
           "source_type": st, "primary": st in ("primary-doc", "code"), "http_status": None,
           "liveness": "unchecked", "bytes": 0, "notes": None,
           "platform": platforms.platform_of(canon), "hunter": hunter}
    row.update(kw)
    return row


def set_body(row: dict, body: str) -> None:
    """A row that now stands on a body: evidence, alive, its size and fingerprint, a passage if it had none."""
    data = body.encode("utf-8", "replace")
    row.update(kind="evidence", liveness="alive", bytes=len(data), body_sha256=hashlib.sha256(data).hexdigest())
    if not row.get("passage"):
        row["passage"] = passage_of(body)
        row["passage_sha256"] = rlib.sha256(row["passage"])


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
def cmd_list(run: Path, platform: str, unread: bool, kind: str) -> int:
    for canon, rs in by_canon(read_rows(run)).items():
        addr = address_row(rs) or {}
        if platform != "all" and (addr.get("platform") or platforms.platform_of(canon)) != platform:
            continue
        k = "evidence" if any(r.get("kind") == "evidence" for r in rs) else "discovery"
        if kind != "all" and k != kind:
            continue
        if unread and has_body(run, canon):
            continue
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
def cmd_add(run: Path, url: str, quote: str, author: str | None, date: str | None,
            title: str | None) -> int:
    if platforms.reject(url) == "invalid":
        print(f"REFUSED not an address: {url}")
        return 2
    canon = platforms.canonical_url(url)
    nq = normalize(quote)
    if not nq:
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
        sha = rlib.sha256(nq)
        same = next((r for r in rs if r.get("tool") == ADD_TOOL and r.get("passage_sha256") == sha), None)
        if same:                                  # one quote, one row — a repeated add is the same quote
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
                      passage=nq, passage_sha256=sha, source_type=addr.get("source_type") or source_type(url, ""),
                      http_status=addr.get("http_status"), liveness="alive", bytes=len(body.encode("utf-8")))
        row["primary"] = row["source_type"] in ("primary-doc", "code")
        append_rows(run, [row])
    for n in notes:                               # stderr: stdout stays the id alone, for $(...)
        print(n, file=sys.stderr)
    print(row["id"])
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
    li.add_argument("--unread", action="store_true")
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
    s = sub.add_parser("show")
    s.add_argument("run")
    s.add_argument("id")
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
    if args.cmd == "list":
        if args.platform != "all" and args.platform not in platforms.PLATFORMS:
            print(f"REFUSED unknown platform: {args.platform} (one of: {' '.join(platforms.PLATFORMS)})")
            return 2
        return cmd_list(run, args.platform, args.unread, args.kind)
    if args.cmd == "fetch":
        return cmd_fetch(run, args.url, args.show)
    if args.cmd == "add":
        return cmd_add(run, args.url, args.quote, args.author, args.date, args.title)
    return cmd_show(run, args.id)


if __name__ == "__main__":
    raise SystemExit(main())
