#!/usr/bin/env python3
"""HIS FREE PERPLEXITY ACCOUNT, ASKED THE SAME QUESTION — read in the hidden Chrome and turned into
the shape the SAME ruler judges.

WHY. His order, 2026-09-24: "benim istedigim seviye perplexity seviyesi". A side-by-side is a
measurement only when ONE ruler judges both answers, so this file grades nothing: it converts
Perplexity's own page into answer.md + sources.json laid out exactly like a quick-mode answer, and
cite-check.py and rubric.py do the rest. It changes nothing Perplexity said: its citations stay
where it put them (1–3 a sentence, as it gave them), its tables stay tables, its uncited sentences
stay uncited — and the ruler scores that honestly.

    pplx.py "<question>" <outdir> [--max-wait 120]
    pplx.py "<question>" <outdir> --capture page.json     the same conversion from a page captured
                                                          earlier: no browser, no network

THE LIVE READ IS HELD (chief engineer's order, 2026-09-24, before 18:50): Perplexity's Terms of
Service §5.2(d)/(i) forbid automated access that extracts information, and it is his account at
risk — the CEO decides. Until he does, the converter is exercised through --capture only.

HOW — measured on the live page, 2026-09-24 18:22 (the Opus 5.5 pricing question):
  · https://www.perplexity.ai/search?q=<question> opens in its OWN new window of the hidden Chrome
    (hidden.Tab: 127.0.0.1:9333 on Xvfb :99 — never his screen, never his Chrome) and the window is
    closed in a `finally`, on success, error and SIGTERM alike; t_nav is stamped at navigation.
  · polled every second. While it works, the page shows a "Stop response (Esc)" button and no
    [data-workflow-final-text] wrapper, and the answer streams into div.prose[data-renderer="lm"].
    It is finished when neither in-progress marker is there AND its text is unchanged for 3 polls
    (at most 120 s). t_done is the FIRST of those 3 polls — the moment the finished answer stood on
    the page (measured: the stop button went at 14.6 s, the final text stood from 15.6 s).
  · read from the DOM, not from the flattened page text: the answer container only, so the question
    echo, the timestamp, the "Researched 4s" label and the news-card block are never in it;
    headings, paragraphs, lists, and TABLES as markdown tables (a table flattened to one cell a line
    would turn every price into an uncited "sentence" for R2); every citation chip
    (span[data-pplx-citation-url]) becomes its URL, and then its [n] from sources.json.
  · the follow-ups are the suggestions under the answer. A "Computer" item is a task offer, not a
    question, and a reply chip ("Yes, I am building…") answers a question of Perplexity's own: both
    stay out of answer.md. Perplexity prints its follow-up QUESTIONS without a question mark, so the
    mark is restored on an item that opens with a question word — otherwise R7 would be measuring its
    typography. Every item stays verbatim in pplx-raw.md. None → no section, and this file says so.
  · reading only: nothing is clicked, typed or submitted — the cookie banner stays unanswered.

FILES in <outdir>: question.txt · pplx-raw.md (the answer container's HTML and the follow-up items,
unconverted) · timing.json {t_nav, t_done, seconds, researched_label, mode} · KAYNAKLAR.txt (the cited
URLs in first-cited order, as `[title](url)` so the registry knows their titles; a `(`, `)` and the
other characters that end an address in the registry's pattern are percent-encoded) · sources.json
(sources.py reads KAYNAKLAR.txt; pplx-raw.md is an answer, not the run, and is never harvested) ·
answer.md. A citation whose URL sources.py does not accept is printed as an error and written as [0],
an id that never exists, so cite-check R3 fails in the open instead of the citation vanishing.
A previous pplx.py run in <outdir> (its timing.json) is moved aside to <outdir>.prev-<time>, never
overwritten; any other non-empty folder, and any folder inside the repository, is refused (exit 2).
"""
from __future__ import annotations

import argparse
import html
import json
import re
import signal
import subprocess
import sys
import time
import unicodedata
import urllib.parse
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import hidden  # noqa: E402  — the port, the slots and the window lifecycle have one owner
import sources as S  # noqa: E402  — the registry and its URL key

SEARCH = "https://www.perplexity.ai/search?q={q}"
MODE = "free/search"
POLL_S = 1.0
STABLE_POLLS = 3

# What the page is doing right now. `stop`: the "Stop response (Esc)" button; `fin`: the wrapper the
# finished answer is drawn in. The LAST answer container is read: a thread shows one per question.
STATE_JS = r"""(() => {
  const all = [...document.querySelectorAll('div.prose[data-renderer="lm"]')];
  const a = all[all.length - 1];
  const stop = [...document.querySelectorAll('button')]
      .some(b => /^stop/i.test((b.getAttribute('aria-label') || '').trim()));
  const fin = !!(a && a.closest('[data-workflow-final-text]'));
  return JSON.stringify({text: a ? a.innerText : '', stop: stop, fin: fin, url: location.href});
})()"""

# The finished answer, as the DOM holds it, and the suggestions drawn under it.
EXTRACT_JS = r"""(() => {
  const all = [...document.querySelectorAll('div.prose[data-renderer="lm"]')];
  const a = all[all.length - 1];
  if (!a) return JSON.stringify({html: '', items: [], researched: null, url: location.href});
  const after = el => !!(a.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
  const box = [...document.querySelectorAll('div.border-t.pt-5')].filter(after)[0];
  const items = [];
  if (box) for (const it of box.children) {
    const btn = it.querySelector('button');
    if (!btn) continue;
    const text = btn.innerText.replace(/\s+/g, ' ').trim();
    const badge = [...it.querySelectorAll('*')]
        .filter(e => e.children.length === 0 && !btn.contains(e))
        .map(e => e.textContent.trim()).filter(Boolean).join(' ');
    if (text) items.push({text: text, badge: badge});
  }
  const lab = [...document.querySelectorAll('[data-workflow-final-text] span')]
      .map(s => s.innerText.replace(/\s+/g, ' ').trim())
      .find(t => t.length < 40 && /^(Researched|Reasoned|Thought|Worked|Searched|Completed)\b.*\d/i.test(t));
  return JSON.stringify({html: a.outerHTML, items: items, researched: lab || null, url: location.href});
})()"""


# ------------------------------------------------------------------ the answer's DOM -> markdown
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
SKIP = {"script", "style", "svg", "button", "template", "noscript", "img", "picture", "video", "audio",
        "iframe", "input", "textarea", "select", "canvas"}
BLOCK = {"div", "section", "article", "figure", "header", "footer", "main", "aside", "details", "summary",
         "figcaption"}


class Node:
    __slots__ = ("tag", "attrs", "kids")

    def __init__(self, tag: str, attrs):
        self.tag, self.attrs, self.kids = tag, {k: (v or "") for k, v in attrs}, []


class _Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root", [])
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs)
        self.stack[-1].kids.append(n)
        if tag not in VOID:
            self.stack.append(n)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].kids.append(Node(tag, attrs))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        self.stack[-1].kids.append(data)


def _norm(s: str) -> str:
    s = re.sub(r"[ \t\r\f\v ​]+", " ", s)
    return "\n".join(ln.strip() for ln in s.split("\n")).strip()


def _wrap(mark: str, inner: str) -> str:
    core = inner.strip()
    if not core:
        return inner
    lead, trail = inner[:len(inner) - len(inner.lstrip())], inner[len(inner.rstrip()):]
    return f"{lead}{mark}{core}{mark}{trail}"


class Markdown:
    """One answer container -> markdown, with each citation chip as a \\x00<i>\\x00 token."""

    def __init__(self):
        self.cites: list[tuple[str, str]] = []            # (url, title) in order of appearance

    @staticmethod
    def _skip(n: Node) -> bool:
        return n.tag in SKIP or n.attrs.get("aria-hidden") == "true"

    def _cite(self, n: Node) -> str:
        url = n.attrs.get("data-pplx-citation-url") or ""
        title = ""
        stack = list(n.kids)
        while stack:
            k = stack.pop(0)
            if isinstance(k, Node):
                if not url and k.tag == "a":
                    url = k.attrs.get("href") or ""
                lab = k.attrs.get("aria-label") or ""
                if not title and lab and lab.lower() not in ("trusted domain",):
                    title = lab
                stack.extend(k.kids)
        self.cites.append((html.unescape(url.strip()), html.unescape(title.strip())))
        return f"\x00{len(self.cites) - 1}\x00"

    def inline(self, n) -> str:
        if isinstance(n, str):
            return n
        if self._skip(n):
            return ""
        if "data-pplx-citation-url" in n.attrs:
            return self._cite(n)
        inner = "".join(self.inline(k) for k in n.kids)
        if n.tag in ("strong", "b"):
            return _wrap("**", inner)
        if n.tag in ("em", "i"):
            return _wrap("*", inner)
        if n.tag == "code":
            return f"`{inner.strip()}`" if inner.strip() else ""
        if n.tag == "br":
            return "\n"
        return inner          # <a> keeps its text only: the answer carries no address (R6)

    def blocks(self, node: Node, depth: int = 0) -> list[str]:
        out: list[str] = []
        run: list[str] = []

        def flush():
            t = _norm("".join(run))
            if t:
                out.append(t)
            run.clear()

        for k in node.kids:
            if isinstance(k, str):
                run.append(k)
                continue
            if self._skip(k):
                continue
            t = k.tag
            if t == "p":
                flush()
                out.append(_norm(self.inline(k)))
            elif re.fullmatch(r"h[1-6]", t):
                flush()
                out.append("#" * int(t[1]) + " " + _norm(self.inline(k)).replace("\n", " "))
            elif t in ("ul", "ol"):
                flush()
                out.append(self.listing(k, depth))
            elif t == "table":
                flush()
                out.append(self.table(k))
            elif t == "blockquote":
                flush()
                out.append("\n".join("> " + ln for b in self.blocks(k, depth) for ln in b.splitlines()))
            elif t == "pre":
                flush()
                out.append("```\n" + _text(k).strip("\n") + "\n```")
            elif t == "hr":
                flush()
                out.append("---")
            elif t in BLOCK:
                flush()
                out.extend(self.blocks(k, depth))
            else:
                run.append(self.inline(k))
        flush()
        return [b for b in out if b.strip()]

    def listing(self, node: Node, depth: int) -> str:
        lines, n = [], 0
        start = int(node.attrs.get("start") or 1) if (node.attrs.get("start") or "1").isdigit() else 1
        for li in node.kids:
            if not isinstance(li, Node) or li.tag != "li":
                continue
            n += 1
            mark = f"{start + n - 1}." if node.tag == "ol" else "-"
            text, nested = [], []
            for k in li.kids:
                if isinstance(k, Node) and k.tag in ("ul", "ol"):
                    nested.append(self.listing(k, depth + 1))
                elif isinstance(k, Node) and k.tag in BLOCK:
                    text.append(" ".join(self.blocks(k, depth)))
                else:
                    text.append(self.inline(k))
            lines.append("  " * depth + mark + " " + _norm(" ".join(text)).replace("\n", " "))
            lines.extend(nested)
        return "\n".join(lines)

    def table(self, node: Node) -> str:
        rows: list[tuple[bool, list[str]]] = []

        def walk(n: Node, head: bool):
            for k in n.kids:
                if not isinstance(k, Node) or self._skip(k):
                    continue
                if k.tag == "thead":
                    walk(k, True)
                elif k.tag in ("tbody", "tfoot"):
                    walk(k, False)
                elif k.tag == "tr":
                    cells = [c for c in k.kids if isinstance(c, Node) and c.tag in ("td", "th")]
                    rows.append((head or (bool(cells) and all(c.tag == "th" for c in cells)),
                                 [_norm(self.inline(c)).replace("\n", " ").replace("|", "\\|") for c in cells]))

        walk(node, False)
        if not rows:
            return ""
        width = max(len(c) for _, c in rows)
        heads = [c for h, c in rows if h]
        head = heads[0] if heads else rows[0][1]
        body = heads[1:] + [c for h, c in rows if not h] if heads else [c for _, c in rows[1:]]
        pad = (lambda c: c + [""] * (width - len(c)))
        return "\n".join(["| " + " | ".join(pad(head)) + " |", "|" + "|".join(["---"] * width) + "|"]
                         + ["| " + " | ".join(pad(c)) + " |" for c in body])


def _text(n) -> str:
    return n if isinstance(n, str) else "".join(_text(k) for k in n.kids)


def to_markdown(outer_html: str) -> tuple[str, list[tuple[str, str]]]:
    tree = _Tree()
    tree.feed(outer_html)
    tree.close()
    md = Markdown()
    body = "\n\n".join(md.blocks(tree.root))
    body = re.sub(r"(\x00\d+\x00)[ \t]+(?=\x00)", r"\1", body)     # chips side by side: [1][2]
    return body, md.cites


# ------------------------------------------------------------------ follow-ups
QWORDS = {"how", "what", "why", "when", "where", "which", "who", "whom", "whose", "is", "are", "was", "were",
          "can", "could", "does", "do", "did", "should", "would", "will", "has", "have", "had", "may",
          "might", "shall", "ne", "neden", "nasil", "hangi", "hangisi", "kim", "kac", "nicin", "nerede",
          "nereden", "nereye", "niye"}


def _fold(s: str) -> str:
    s = unicodedata.normalize("NFKD", s.translate(str.maketrans({"I": "i", "İ": "i", "ı": "i"})).lower())
    return "".join(c for c in s if not unicodedata.combining(c))


def as_question(text: str) -> str | None:
    """The item as a question, its mark restored — or None when it is not a question."""
    t = text.strip()
    if t.endswith(("?", "？")):
        return t
    words = re.findall(r"[^\W\d_]+", _fold(t))
    if words and (words[0] in QWORDS or re.fullmatch(r"m[iu](s[iu]n|y[iu]z|d[iu]r|s[iu]n[iu]z)?", words[-1])):
        return t.rstrip(" .") + "?"
    return None


# ------------------------------------------------------------------ the address, as the registry reads it back
# sources.py harvests KAYNAKLAR.txt with merge.py's address pattern, which ends an address at `)`,
# `]`, `}`, a quote, a comma, a backtick, a backslash or a space. So "…/wiki/Claude_(language_model)"
# came back as "…/wiki/Claude_(language_model" and its citation as [0] (refuter, 2026-09-24). Those
# characters, and `(` `[` `{` beside them, are written percent-encoded — the form a browser sends
# anyway — and the [n] is looked up with the same form.
_UNSAFE = {c: f"%{ord(c):02X}" for c in " \"'<>()[]{},`\\"}


def safe_url(u: str) -> str:
    return "".join(_UNSAFE.get(c, c) for c in u)


# ------------------------------------------------------------------ the run
def _pages() -> int:
    try:
        return sum(1 for t in hidden._http("/json/list", 3) if t.get("type") == "page")
    except Exception:
        return -1


# THE REPOSITORY this file lives in (…/.claude/skills/dxb-research/scripts → four folders up). A run
# never writes there: a record is fleet/keep.sh's, and only when he says "kaydet".
REPO = HERE.parents[3] if (HERE.parents[3] / ".git").exists() else None


def _refuse(msg: str):
    print(f"pplx: {msg}", file=sys.stderr)
    raise SystemExit(2)


def _prepare(out: Path) -> str | None:
    """A previous pplx.py run — its own marker, timing.json — is moved aside. Any other non-empty
    folder is refused, and so is any folder inside the repository: every deep record under
    .planning/research/answers/ holds a question.txt (refuter, 2026-09-24), so question.txt proves
    nothing about whose folder it is."""
    if REPO and out.resolve().is_relative_to(REPO):
        _refuse(f"{out} depo icinde — kosular depoya yazmaz, kayit yalniz o \"kaydet\" deyince keep.sh ile; depo disinda bir klasor ver")
    if out.exists() and not out.is_dir():
        _refuse(f"{out} bir klasor degil")
    if out.is_dir() and any(out.iterdir()):
        if (out / "timing.json").is_file():
            prev = out.with_name(out.name + ".prev-" + time.strftime("%Y%m%d-%H%M%S"))
            out.rename(prev)
            return str(prev)
        _refuse(f"{out} bos degil ve bir pplx.py kosusu degil (timing.json yok) — bos ya da yeni bir klasor ver")
    return None


def ask(question: str, max_wait: float) -> dict:
    """Open the search in its own hidden window, wait for the finished answer, read it, close."""
    url = SEARCH.format(q=urllib.parse.quote(question))
    hidden.reap()
    with hidden.slot(60):
        with hidden.Tab() as tab:
            page = hidden.CDP(tab.ws)
            try:
                page.send("Page.enable", {}, 15)
                t_nav = time.time()
                nav = page.send("Page.navigate", {"url": url}, 30)
                if nav.get("errorText"):
                    raise hidden.CDPError(f"navigation failed: {nav['errorText']}")
                prev, streak, t_first, t_done, state = None, 0, None, None, {}
                deadline = t_nav + max_wait
                while time.time() < deadline:
                    time.sleep(POLL_S)
                    now = time.time()
                    try:
                        state = json.loads(page.evaluate(STATE_JS, 10) or "{}")
                    except (hidden.CDPError, ValueError):
                        state = {}           # a page between two routes answers nothing: poll again
                        prev, streak = None, 0
                        continue
                    text = state.get("text") or ""
                    ready = bool(text.strip()) and not state.get("stop") and state.get("fin")
                    if ready and text == prev:
                        streak += 1
                    elif ready:
                        streak, t_first = 1, now
                    else:
                        streak = 0
                    prev = text
                    if streak >= STABLE_POLLS:
                        t_done = t_first
                        break
                got = json.loads(page.evaluate(EXTRACT_JS, 20) or "{}")
            finally:
                page.close()
    got.update({"t_nav": t_nav, "t_done": t_done, "finished": t_done is not None,
                "last_state": {k: v for k, v in state.items() if k != "text"}})
    return got


def load_capture(path: Path) -> dict:
    """A page captured earlier — {html, items, researched, url, seconds[, t_nav, t_done]} — for the
    offline conversion. Nothing is opened: no browser, no network."""
    d = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(d, dict) or not isinstance(d.get("html"), str):
        raise SystemExit(f"pplx: {path} bir yakalama degil (html alani yok)")
    t_nav, t_done, sec = d.get("t_nav"), d.get("t_done"), d.get("seconds")
    return {"html": d["html"], "items": d.get("items") or [], "researched": d.get("researched"),
            "url": d.get("url") or "", "t_nav": t_nav, "t_done": t_done,
            "seconds": sec if sec is not None else (round(t_done - t_nav, 1) if t_nav and t_done else None),
            "finished": bool(d.get("html")), "last_state": {}, "capture": str(path)}


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(prog="pplx.py", description="his free Perplexity account, read in the hidden Chrome")
    ap.add_argument("question")
    ap.add_argument("outdir")
    ap.add_argument("--max-wait", type=float, default=120.0)
    ap.add_argument("--capture", help="convert this captured page (JSON) instead of asking the live site — offline")
    a = ap.parse_args(argv)
    for s in (signal.SIGTERM, signal.SIGHUP):
        signal.signal(s, hidden._die_cleanly)          # unwinds the `with`: the window is closed
    question = " ".join(a.question.split())
    out = Path(a.outdir)
    if a.capture:
        got = load_capture(Path(a.capture))
        moved = _prepare(out)
        if moved:
            print(f"onceki kosu kenara alindi: {moved}")
        before = after = "acilmadi (yakalamadan, cevrimdisi)"
    else:
        if not hidden.version():
            print(hidden.DOWN_MSG, file=sys.stderr)
            return 69
        moved = _prepare(out)
        if moved:
            print(f"onceki kosu kenara alindi: {moved}")
        before = _pages()
        try:
            got = ask(question, a.max_wait)
        except hidden.Down as e:
            print(str(e), file=sys.stderr)
            return 69
        except hidden.SlotTimeout as e:
            print(str(e), file=sys.stderr)
            return 75
        except (hidden.CDPError, OSError, ValueError) as e:
            print(f"pplx: gizli Chrome okumasi basarisiz: {e}", file=sys.stderr)
            return 1
        after = _pages()
        got["seconds"] = round(got["t_done"] - got["t_nav"], 1) if got["finished"] else None
    return write_outputs(got, question, out, a.max_wait, before, after)


def write_outputs(got: dict, question: str, out: Path, max_wait: float, before, after) -> int:
    out.mkdir(parents=True, exist_ok=True)
    (out / "question.txt").write_text(question + "\n", encoding="utf-8")
    thread = re.sub(r"^https?://", "", str(got.get("url") or ""))      # no scheme: not a registry source
    items = got.get("items") or []
    raw = (f"<!-- pplx.py · the answer container as the DOM gave it, unconverted · thread {thread} · "
           f"label {got.get('researched') or '-'} · finished {got['finished']} -->\n"
           + (got.get("html") or "") + "\n\n<!-- follow-up suggestions under the answer, verbatim -->\n<ul>\n"
           + "".join(f"<li data-badge=\"{html.escape(i.get('badge') or '')}\">{html.escape(i['text'])}</li>\n"
                     for i in items) + "</ul>\n")
    (out / "pplx-raw.md").write_text(raw, encoding="utf-8")
    seconds = got.get("seconds")
    rnd = (lambda v: round(v, 3) if isinstance(v, (int, float)) else None)
    timing = {"t_nav": rnd(got.get("t_nav")), "t_done": rnd(got.get("t_done")) if got["finished"] else None,
              "seconds": seconds, "researched_label": got.get("researched"), "mode": MODE}
    if got.get("capture"):
        timing["from_capture"] = Path(got["capture"]).name    # converted offline: not a new measurement
    (out / "timing.json").write_text(json.dumps(timing, indent=1) + "\n", encoding="utf-8")
    if not (got.get("html") or "").strip():
        print(f"pplx: sayfada cevap yok ({max_wait:.0f} sn; son durum {got['last_state']}) — thread {thread}",
              file=sys.stderr)
        return 4

    body, cites = to_markdown(got["html"])
    first: dict[str, str] = {}
    for u, t in cites:
        first.setdefault(u, t)
    lines = []
    for u, t in first.items():
        t = re.sub(r"\s+", " ", t.replace("[", "(").replace("]", ")")).strip()
        lines.append(f"[{t}]({safe_url(u)})" if len(t) >= 3 else safe_url(u))
    (out / "KAYNAKLAR.txt").write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")
    p = subprocess.run([sys.executable, str(HERE / "sources.py"), str(out)], capture_output=True, text=True)
    if p.returncode != 0:
        print(f"pplx: sources.py kod {p.returncode}: {(p.stderr or p.stdout).strip()[:200]}", file=sys.stderr)
        return 1
    ids = {}
    for s in S.load(out / "sources.json"):
        c = S.canon(str(s.get("url") or ""))
        if c:
            ids.setdefault(c[0], int(s["id"]))
    errors = []

    def mark(m):
        u, _ = cites[int(m.group(1))]
        c = S.canon(safe_url(u)) if u else None
        if c and c[0] in ids:
            return f"[{ids[c[0]]}]"
        errors.append(u or "(adresi olmayan atif)")
        return "[0]"

    md = re.sub(r"\x00(\d+)\x00", mark, body)
    md = re.sub(r"\[(\d+)\](?:\[\1\])+", r"[\1]", md)                 # one chip twice in a row: once
    questions = [q for q in (as_question(i["text"]) for i in items if "computer" not in (i.get("badge") or "").lower())
                 if q]
    computer = sum(1 for i in items if "computer" in (i.get("badge") or "").lower())
    other = len(items) - computer - len(questions)
    if questions:
        md += "\n\n## Takip soruları\n\n" + "\n".join(f"- {q}" for q in questions)
    (out / "answer.md").write_text(md.rstrip("\n") + "\n", encoding="utf-8")

    used = re.findall(r"(?<!!)\[(\d{1,4})\](?!\()", md)
    words = sum(1 for t in md.split() if re.search(r"\w", t) and not re.fullmatch(r"(\[\d+\])+[.,;:]?", t))
    tables = len(re.findall(r"(?m)^\|(?:\s*:?-{3,}:?\s*\|)+\s*$", md))
    heads = len(re.findall(r"(?m)^#{1,6} ", md)) - (1 if questions else 0)
    print(f"perplexity: https://{thread}")
    print(f"sure: {seconds if seconds is not None else '-'} s (t_done - t_nav)"
          + (f" · etiket: {got.get('researched')}" if got.get("researched") else "")
          + ("" if got["finished"] else f" · !! {max_wait:.0f} sn icinde bitmedi — okunan hali yazildi")
          + (f" · yakalamadan cevrildi: {got['capture']}" if got.get("capture") else ""))
    print("timing.json: " + json.dumps(timing, ensure_ascii=False))
    print(f"cevap: {out / 'answer.md'} · {words} kelime · {len(used)} atif, {len(set(used))} ayri kaynak · "
          f"tablo {tables} · baslik {heads}")
    print(f"takip: {len(questions)} soru" + (f" · disarida: {computer} Computer onerisi" if computer else "")
          + (f" · {other} soru olmayan oneri" if other > 0 else "")
          + ("" if questions else " — sayfa soru gostermedi, bolum yazilmadi"))
    print(f"kaynaklar: KAYNAKLAR.txt {len(first)} adres · {p.stdout.strip().splitlines()[-1] if p.stdout.strip() else ''}")
    print(f"pencere: once {before} · sonra {after}")
    for u in errors:
        print(f"!! HATA: atif cozulemedi, [0] yazildi: {u}", file=sys.stderr)
    return 1 if errors else (0 if got["finished"] else 4)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
