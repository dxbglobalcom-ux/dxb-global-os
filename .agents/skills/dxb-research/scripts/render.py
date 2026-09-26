#!/usr/bin/env python3
"""THE PAGE, BUILT FROM THE EVIDENCE ROWS ONLY — the answer's ids numbered, every quote printed from its row.

    render.py <run>/answer.md --evidence <run>/evidence.jsonl [--out <run>/final.html] [--no-coverage]
      --out          *.html → the designed page only · anything else → the Markdown page only ·
                     default: both, final.md and final.html beside the answer
      --no-coverage  no "Nereye bakıldı" section; kapsama.py is not called

WHY. On 2026-09-24 the writer had the X quotes in hand and dropped them: the answer was written from
the hunters' prose, not from what had been read (plan v2 §1 cause 2; the lead measured X found 294,
cited 0 — EVIDENCE-B56-2026-09-26.md). A quote the model types can be invented; a quote this page
prints from a row the fetcher wrote cannot. So the answer carries ids and nothing else a reader would
check: the quote, its author, its date and its address all come from evidence.jsonl.

A citation is EXACTLY `[L0042]` or `[L0002, L0001]` — the pattern platforms.CITE_RE holds, so this page
and kapsama.py's Cevapta column count the same citations. Counter-evidence is two citations joined by ↔,
`[L0042, L0043] ↔ [L0051]`; one bracket holding both sides, `[L0042, L0043 ↔ L0051]`, is read as those
two (platforms.split_paired, kapsama.py's reading too; a render.py copied alone, without platforms.py,
refuses it as before). final.md is the answer as written, each
citation's ids turned into numbers in first-appearance order (a repeated id keeps its number; a group
keeps its shape, `[1, 2]`), then:
  ## Kaynaklar       one entry per cited id: `n. **author** · date · platform — “passage” — url`, all
                     from the row. No author: the row's domain. No date, or `dates_agree` false (the
                     schema: treat as undated): "tarih yok". Never a guess. An uncited row is not listed.
  ## Nereye bakıldı  the stdout of `kapsama.py <run> --answer <answer>` from this same folder, <run>
                     being the answer's folder. Coverage prints and never blocks: kapsama.py missing,
                     failing or silent leaves a one-line note there, and the page is still written.

final.html — THE PAGE HE SEES (EVIDENCE-B56-K1 §2.6). On 2026-09-26 the CEO asked why 272 X addresses
became 4 on the page and wanted to browse the 130 X posts himself ("130 gönderinin açıp okuyabileceğim
linklerde olmalı"). Top to bottom: an eyebrow (the run's date, its hunters, their seconds) · the question
as the title · the VERDICT, the answer's first paragraph · "Cevabı taşıyan sayılar": every paragraph and
list item of the answer that cites rows, under the writer's section it came from, each with `(n satır)`
— n = the distinct ids it cites; counter-evidence, `[A] ↔ [B]`, counted beside each side, and a line that
cites nothing else prints no sum of the two — and each id a numbered link to its row in the drawer; what
stands before
the first section, and the writer's own section of that name, stand here whole · EVERY line and table row
here carries its count: one that cites no row prints `(0 satır)` in the warning colour, the claim nothing
supports made visible (the lead's ruling, 2026-09-26) · the writer's other sections with what remains in
them (a table stays whole, each row that cites counted in place: a comparison stays a table; a line there
that cites nothing stays plain) · a quote card for every cited id, from its row · "Nereye bakıldı", kapsama.py's table · THE
DRAWER: one <details> per platform, `X — 130 gönderi (4 cevapta)`, one entry per address whose body was
fetched (kapsama.py's İndirildi) carrying every row id at it, the author, the date, the passage cut to
300 characters and the address as a link — cited entries first and marked, then newest first.
Self-contained: inline CSS, one inline script (a link into a closed drawer opens it), fonts from Google
Fonts only, light and dark tokens, readable at phone width. Designed here, not converted: the Markdown is
our own small subset — headings, paragraphs, lists, tables, bold/italic/code, citations — no library.

REFUSED — exit 2, one line on stderr, no page written — when the answer carries an id that is not in
evidence.jsonl; a bracket that holds an id-like token but is not a citation (`[bkz. L0002]`,
`[L0001 ]`, `[l0003]`, `[L0001; L0002]`, `[L0001 | L0002]` — only ↔ pairs two sides, and each side is
held to the same rule); a raw http(s):// address (R6: addresses come from the rows);
or a `>` quote block (quotes come from the rows, never typed). A page an earlier render left at an
output path goes too (never the answer or the rows file): a page built from an earlier answer never
stands beside a refused one. A line of evidence.jsonl that does not parse is skipped and said: an id on it is
not in the file, so a citation of it is refused like any unknown id. When an id occurs twice, the
later line wins — the file only grows by appends.

final.html is the page he sees: published as a designed Artifact and put in front of him at once, no
question asked (SKILL.md "The answer"). Prose is never rewritten here — the writer's words stand as
written; this file numbers, counts, lists and lays out. Stdlib only.
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from html.entities import html5
from pathlib import Path
from urllib.parse import urlsplit

HERE = Path(__file__).resolve().parent
sys.dont_write_bytecode = True     # the skill folder is read-only inside a hunter's jail
sys.path.insert(0, str(HERE))
try:                               # kapsama.py's platform labels and order; a render.py copied alone
    import platforms as P          # noqa: E402 — (the tests do) still renders, the keys as labels
except Exception:
    P = None
try:                               # the ledger's owner: which row stands for an address, and where it
    import evidence as E           # noqa: E402 — is counted (kapsama.py uses the same two functions)
except Exception:
    E = None
KAPSAMA_SECS = 60
# a citation is EXACTLY [L0042] or [L0002, L0001] — same as platforms.CITE_RE (one pattern, one owner)
CITE = re.compile(r"\[L\d{4}(?:,\s*L\d{4})*\]")
# a bracket that holds something like an id but is not a citation: [bkz. L0002] · [L0001 ] · [l0003]
BRACKET = re.compile(r"\[[^\[\]\n]*\]")
ID_LIKE = re.compile(r"\bL\d{4}\b", re.IGNORECASE)
ROW_ID = re.compile(r"L\d{4}")
RAW_ADDRESS = re.compile(r"https?://\S*", re.IGNORECASE)
# a Markdown quote block, also inside a list item: "> …" · ">…" · "- > …" · "1. > …"
QUOTE_BLOCK = re.compile(r"^[ \t]*(?:(?:[-*+]|\d{1,9}[.)])[ \t]+)*>")


def text(v) -> str:
    """A row field as printable text: None and blanks are empty, never the word 'None'."""
    return "" if v is None else str(v).strip()


def load_rows(path: Path) -> tuple[dict[str, dict], list[int]]:
    """id -> row, and the line numbers that are not a JSON row with an id."""
    rows: dict[str, dict] = {}
    bad: list[int] = []
    for n, line in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except ValueError:
            row = None
        if isinstance(row, dict) and isinstance(row.get("id"), str):
            rows[row["id"]] = row
        else:
            bad.append(n)
    return rows, bad


def refusals(md: str, rows: dict[str, dict], evidence_name: str) -> list[str]:
    """Everything the answer may not carry, one clause per kind; empty when the page may be built."""
    def line_of(pos: int) -> int:
        return md.count("\n", 0, pos) + 1

    why: list[str] = []
    unknown: dict[str, int] = {}
    for m in CITE.finditer(md):
        for i in ROW_ID.findall(m.group(0)):
            if i not in rows:
                unknown.setdefault(i, line_of(m.start()))
    if unknown:
        why.append(f"id not in {evidence_name}: " + ", ".join(f"{i} (line {n})" for i, n in unknown.items()))
    loose = [(line_of(m.start()), m.group(0)) for m in BRACKET.finditer(md)
             if ID_LIKE.search(m.group(0)) and not CITE.fullmatch(m.group(0))]
    if loose:
        n, group = loose[0]
        more = f" (+{len(loose) - 1} more)" if len(loose) > 1 else ""
        why.append(f"not a citation at line {n}: {group[:60]}{more} — cite as [L0042] or [L0042, L0043]")
    addresses = [(line_of(m.start()), m.group(0)) for m in RAW_ADDRESS.finditer(md)]
    if addresses:
        n, url = addresses[0]
        more = f" (+{len(addresses) - 1} more)" if len(addresses) > 1 else ""
        why.append(f"raw address in the answer at line {n}: {url[:80]}{more} — addresses come from the rows (R6)")
    quotes = [n for n, line in enumerate(md.splitlines(), 1) if QUOTE_BLOCK.match(line)]
    if quotes:
        at = ", ".join(map(str, quotes[:5])) + (" …" if len(quotes) > 5 else "")
        why.append(f"quote block in the answer at line {at} — quotes come from the rows, never typed")
    return why


def number(md: str) -> tuple[str, list[str]]:
    """The answer with every cited id replaced by its number, and the ids in first-appearance order."""
    order: dict[str, int] = {}

    def one(m: re.Match) -> str:
        return ROW_ID.sub(lambda i: str(order.setdefault(i.group(0), len(order) + 1)), m.group(0))

    return CITE.sub(one, md), list(order)


def source_line(n: int, row: dict) -> str:
    """`n. **author** · date · platform — “passage” — url`, every part from the row."""
    url = text(row.get("url"))
    author = text(row.get("author")) or text(row.get("domain")) or (urlsplit(url).hostname or "yazar yok")
    date = "" if row.get("dates_agree") is False else text(row.get("pub_date"))
    head = [f"**{author}**", date or "tarih yok"] + ([text(row["platform"])] if text(row.get("platform")) else [])
    passage = " ".join(text(row.get("passage")).split())  # one list entry per source: line breaks become spaces
    quote = f"“{passage}”" if passage else "alıntı yok"
    return f"{n}. " + " · ".join(head) + f" — {quote} — {url or 'adres yok'}"


def coverage(run: Path, answer: Path) -> tuple[str, bool]:
    """kapsama.py's table, or a one-line note saying why there is none. Never raises: it never blocks."""
    script = HERE / "kapsama.py"
    if not script.is_file():
        return "_Kapsama tablosu basılamadı: kapsama.py bulunamadı._", False
    try:
        p = subprocess.run([sys.executable, str(script), str(run), "--answer", str(answer)],
                           capture_output=True, encoding="utf-8", errors="replace", timeout=KAPSAMA_SECS,
                           env={**os.environ, "PYTHONIOENCODING": "utf-8"})
    except subprocess.TimeoutExpired:
        return f"_Kapsama tablosu basılamadı: kapsama.py {KAPSAMA_SECS} saniyede bitmedi._", False
    except OSError as e:
        return f"_Kapsama tablosu basılamadı: `{e}`._", False
    if p.returncode != 0:
        last = (p.stderr.strip().splitlines() or [""])[-1][:160].replace("`", "'")
        return (f"_Kapsama tablosu basılamadı: kapsama.py çıkış kodu {p.returncode}"
                + (f" — `{last}`" if last else "") + "._"), False
    if not p.stdout.strip():
        return "_Kapsama tablosu basılamadı: kapsama.py boş döndü._", False
    return p.stdout.rstrip(), True


# ── final.html — THE PAGE HE SEES (docstring; EVIDENCE-B56-K1 §2.6) ──────────────────────────────────
# WHY (2026-09-26): the CEO asked why 272 X addresses became 4 on the page, and wanted to browse the 130
# X posts himself — "130 gönderinin açıp okuyabileceğim linklerde olmalı". So the verdict stands on top,
# the count of rows beside every claim, a quote card for every cited row, where was looked, and at the
# bottom one drawer per platform with every address whose body was fetched, each one he can open.

OWN = "Cevabı taşıyan sayılar"      # the page's own section; the writer's section of that name joins it
CAVEAT = re.compile(r"değiştir|çelişki|uyarı|sınır", re.IGNORECASE)   # "what would change it", named
MONTHS = ("Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim",
          "Kasım", "Aralık")
NOUN = {"x": "gönderi", "youtube": "video", "tiktok": "video", "instagram": "gönderi", "facebook": "gönderi",
        "linkedin": "gönderi", "bluesky": "gönderi", "threads": "gönderi", "reddit": "başlık",
        "hackernews": "başlık", "stackoverflow": "soru", "medium": "yazı", "substack": "yazı"}
HANDLES = ("x", "instagram", "tiktok", "bluesky", "threads")     # an author there is an @handle
HANDLE = re.compile(r"[A-Za-z0-9_.]+")
SHELF_CHARS = 300                                                # a drawer entry's passage, at most
HEADING = re.compile(r"^(#+)[ \t]+(.+?)[ \t#]*$")
LIST_ITEM = re.compile(r"^([ \t]*)([-*+]|\d+[.)])[ \t]+(.*)$")
TABLE_RULE = re.compile(r"^\|?[ \t]*:?--+:?[ \t]*(?:\|[ \t]*:?--+:?[ \t]*)*\|?$")
RULE = re.compile(r"^(?:---+|\*\*\*+|___+)$")
SENTENCE_END = re.compile(r"[.?!](?:\s|$)")
CITES = re.compile(rf"{CITE.pattern}(?:[ \t]+{CITE.pattern})*")   # `[L1] [L2]`: one run, one line of chips
PAIR = re.compile(rf"({CITES.pattern})[ \t]*↔[ \t]*({CITES.pattern})")   # counter-evidence: `[A] ↔ [B]`
ENTITY = re.compile(r"&(?:#[0-9]+|#[xX][0-9a-fA-F]+|[A-Za-z][A-Za-z0-9]*);")   # a whole entity, ";" included
FONTS = ("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;"
         "1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;600&display=swap")
# Chrome opens a closed <details> a link points into by itself; this does it where a browser does not
OPEN_DRAWER = ('(function(){function go(){var h=decodeURIComponent(location.hash.slice(1)),e=h&&document.'
               'getElementById(h),d=e&&e.closest("details");if(d&&!d.open){d.open=true;e.scrollIntoView();}}'
               'addEventListener("hashchange",go);go();})();')
DARK = ("--bg:#131210;--paper:#1b1916;--ink:#ece6dc;--ink-2:#c8c0b3;--muted:#958e82;--rule:#2d2a25;"
        "--rule-2:#3d3933;--accent:#ee8a72;--on-accent:#1b1916;--chip:#27241f;--link:#8fb6ee;--warm:#dda24d;"
        "--warm-bg:#2a2215;--ok:#7cc59c;--bad:#ee8a72;color-scheme:dark")
CSS = """
:root{--bg:#f5f2ea;--paper:#fffdf8;--ink:#1c1a16;--ink-2:#46423a;--muted:#77716a;--rule:#e3ddd0;
--rule-2:#cbc3b2;--accent:#a3301b;--on-accent:#fffdf8;--chip:#ebe5d7;--link:#1d4e89;--warm:#b0711a;
--warm-bg:#f9efdb;--ok:#2c6a47;--bad:#a3301b;--serif:"Fraunces",Georgia,"Times New Roman",serif;
--sans:"Public Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
--mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){%DARK%}}
:root[data-theme="dark"]{%DARK%}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:400 16.5px/1.65 var(--sans);overflow-wrap:break-word}
main{max-width:760px;margin:0 auto;padding:44px 16px 56px}
a{color:var(--link);text-underline-offset:2px;text-decoration-thickness:1px}
.eyebrow{margin:0 0 14px;font:500 12px/1.5 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
h1{margin:0 0 28px;font:600 clamp(30px,6vw,44px)/1.1 var(--serif);letter-spacing:-.015em;text-wrap:balance}
.verdict{margin:0 0 48px;padding:20px 22px 22px;background:var(--paper);border:1px solid var(--rule-2);border-top:3px solid var(--accent);border-radius:3px}
.verdict .label{margin:0 0 10px;font:600 11.5px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
.lede{margin:0;font:400 21px/1.5 var(--serif);text-wrap:pretty}
.sec{margin:0 0 48px}
.sec>h2{margin:0 0 18px;padding-top:12px;border-top:1.5px solid var(--ink);font:500 12px/1.5 var(--mono);letter-spacing:.1em;text-transform:uppercase}
.sec>h2 .no{color:var(--accent)}
.intro{margin:0 0 16px;color:var(--muted);font-size:14.5px;line-height:1.55}
h3{margin:26px 0 8px;font:600 19px/1.3 var(--serif)}
p{margin:0 0 14px}
ul,ol{margin:0 0 16px;padding-left:22px}
li{margin:0 0 6px}
li.d1{margin-left:18px}
li.d2{margin-left:36px}
li.d3{margin-left:54px}
.claims{margin:0;padding:0;list-style:none;border-top:1px solid var(--rule)}
.claims>li{margin:0;padding:12px 0;border-bottom:1px solid var(--rule)}
.from{margin:22px 0 0}
.from-t{margin:0 0 6px;font:500 11.5px/1.4 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.caveat{padding:14px 18px 2px;background:var(--warm-bg);border-left:3px solid var(--warm);border-radius:0 3px 3px 0}
.caveat .claims{border-top:0}
.caveat .claims>li:last-child{border-bottom:0}
.count{margin-left:2px;font:500 12.5px/1 var(--mono);color:var(--accent);white-space:nowrap;font-variant-numeric:tabular-nums}
.count.zero{padding:1px 5px;border:1px solid var(--warm);border-radius:3px;background:var(--warm-bg);color:var(--warm)}
.refs{white-space:nowrap}
a.ref{display:inline-block;min-width:20px;margin:0 1px;padding:2px 5px;border-radius:3px;background:var(--chip);color:var(--ink-2);font:500 11.5px/1.3 var(--mono);text-align:center;text-decoration:none;vertical-align:1px}
a.ref:hover,a.ref:focus-visible{background:var(--accent);color:var(--on-accent)}
code{padding:1px 4px;border-radius:3px;background:var(--chip);font:400 .9em var(--mono)}
hr{margin:24px 0;border:0;border-top:1px solid var(--rule)}
.tbl{margin:0 0 18px}
table{width:100%;border-collapse:collapse;font-size:15px;line-height:1.5}
th,td{padding:8px 12px 8px 0;border-bottom:1px solid var(--rule);text-align:left;vertical-align:top}
th:last-child,td:last-child{padding-right:0}
th{font:500 11px/1.4 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);border-bottom-color:var(--rule-2)}
.n{text-align:right;font-family:var(--mono);font-variant-numeric:tabular-nums}
.c{text-align:center}
table.cov{font-size:13.5px}
table.cov td.h{font-weight:600;white-space:nowrap}
table.cov tr.has-why td{padding-bottom:2px;border-bottom:0}
table.cov tr.why td{padding:0 0 10px;font-size:13px;line-height:1.55;color:var(--ink-2)}
.why-l{margin-right:6px;font:500 11px/1 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.recon{margin:12px 0 0;font:500 12.5px/1.55 var(--mono)}
.recon.ok{color:var(--ok)}
.recon.bad{color:var(--bad)}
.note{margin:6px 0 0;font:400 12.5px/1.55 var(--mono);color:var(--muted)}
.cards{display:grid;grid-template-columns:minmax(0,1fr);gap:18px}
.qcard{min-width:0;max-width:100%;margin:0;padding:2px 0 2px 16px;border-left:2px solid var(--accent)}
.qcard blockquote{min-width:0;max-width:100%;margin:0 0 6px;font:italic 400 17.5px/1.55 var(--serif);overflow-wrap:anywhere}
.qn{display:inline-block;min-width:20px;margin-right:8px;padding:2px 5px;border-radius:3px;background:var(--accent);color:var(--on-accent);font:normal 600 11.5px/1.3 var(--mono);text-align:center;vertical-align:2px}
.qcard figcaption{min-width:0;max-width:100%;font:400 12.5px/1.55 var(--mono);color:var(--muted);overflow-wrap:anywhere}
details.plat{border-top:1px solid var(--rule)}
details.plat:last-of-type{border-bottom:1px solid var(--rule)}
summary{padding:14px 0;cursor:pointer;list-style:none;font:600 16px/1.4 var(--sans)}
summary::-webkit-details-marker{display:none}
summary::before{content:"+";display:inline-block;width:1.5em;font:500 16px/1 var(--mono);color:var(--accent)}
details[open]>summary::before{content:"−"}
.drawer{margin:0;padding:0 0 16px;list-style:none}
.drow{margin:0;padding:12px 0;border-top:1px solid var(--rule)}
.drow.cited{padding-left:12px;border-left:2px solid var(--accent);background:var(--paper)}
.drow:target,.drow:has(:target){outline:2px solid var(--accent);outline-offset:2px}
.dm{font:400 12.5px/1.55 var(--mono);color:var(--muted)}
.did{color:var(--ink-2)}
.vd{color:var(--ink-2)}
.mark{margin-left:6px;padding:1px 6px;border-radius:3px;background:var(--accent);color:var(--on-accent);font:600 11px/1.5 var(--mono);text-decoration:none;white-space:nowrap}
.dt{margin:4px 0;font-size:15px;line-height:1.55}
.du,.src{font:400 12.5px/1.45 var(--mono);overflow-wrap:anywhere;word-break:break-word}
.none,.empty{color:var(--muted);font-style:italic}
footer{margin-top:36px;padding-top:14px;border-top:1px solid var(--rule);font:400 12px/1.6 var(--mono);color:var(--muted)}
:target{scroll-margin-top:16px}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
@media (max-width:600px){
main{padding-top:28px}
.lede{font-size:19px}
.verdict{padding:16px 16px 18px}
table.stack thead{display:none}
table.stack,table.stack tbody,table.stack tr{display:block;width:100%}
table.stack tr{padding:10px 0;border-bottom:1px solid var(--rule)}
table.stack td{display:block;padding:2px 0;border:0;text-align:left}
table.stack td::before{content:attr(data-label);margin-right:8px;font:500 11px/1.7 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
table.stack td.n{display:flex;gap:8px;justify-content:space-between;align-items:baseline}
table.stack td.n::before{margin-right:0}
table.cov tr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:16px}
table.cov td.h{grid-column:1/-1;padding-bottom:4px;font-size:15px}
table.cov td.h::before,table.cov tr.why td::before{content:none}
table.cov tr.has-why{padding-bottom:4px;border-bottom:0}
table.cov tr.why{display:block;padding-top:0}
}
""".replace("%DARK%", DARK)


# every U+FFFD leaves as &#xFFFD; — 2026-09-26 the claude.ai Artifact publisher refused the K1 run's page for
# its 599 raw U+FFFD (drawer bodies decoded with errors="replace"): "write an intended U+FFFD as &#xFFFD;"
FFFD = "&#xFFFD;"


def esc(s: str, quote: bool = False) -> str:
    return html.escape(s, quote=quote).replace("\ufffd", FFFD)


def attr(s: str) -> str:
    return esc(s, quote=True)


def unentity(s: str) -> str:
    """Row text as it was written, before esc() makes it HTML: an older run's fetcher stored passages
    HTML-escaped (L0401 "3D Modelleme &amp; Blender"), and escaped once more the page showed "&amp;" — 8 of
    them and 15 "&gt;" on the deep run of 2026-09-26. One pass, and only a whole entity ending in ";"
    (html.unescape alone also reads "&copy" or "&ampfoo;"). final.md prints the row as it is."""
    return ENTITY.sub(lambda m: html.unescape(m[0]) if m[0][1] == "#" or m[0][1:] in html5 else m[0], s)


def label(p: str) -> str:
    return P.LABEL.get(p, p) if P else ("X" if p == "x" else p[:1].upper() + p[1:])


def norm(s: str) -> str:
    """A heading compared as words, Turkish capitals folded the Turkish way (I → ı, İ → i)."""
    return " ".join(re.sub(r"[\W_]+", " ", s.replace("I", "ı").replace("İ", "i").casefold()).split())


def cells(row: str) -> list[str]:
    row = row.strip()
    row = row[1:] if row.startswith("|") else row
    row = row[:-1] if row.endswith("|") and not row.endswith("\\|") else row
    return [c.strip().replace("\\|", "|") for c in re.split(r"(?<!\\)\|", row)]


def blocks(md: str) -> list[dict]:
    """The answer as blocks — our own small Markdown subset: h (level) · p · li (ordered, depth) · table
    (head, align, rows) · hr. Any other line joins its paragraph; an indented line continues its item."""
    out: list[dict] = []
    para: list[str] = []
    lines = md.replace("\x00", "").splitlines()

    def flush() -> None:
        if para:
            out.append({"k": "p", "text": " ".join(para)})
            para.clear()

    i = 0
    while i < len(lines):
        line, s = lines[i], lines[i].strip()
        i += 1
        if not s:
            flush()
        elif (m := HEADING.match(s)) and len(m.group(1)) <= 6:
            flush()
            out.append({"k": "h", "level": len(m.group(1)), "text": m.group(2)})
        elif s.startswith("|") and i < len(lines) and TABLE_RULE.match(lines[i].strip()):
            flush()
            head, rule, body = cells(s), cells(lines[i]), []
            i += 1
            while i < len(lines) and lines[i].strip().startswith("|"):
                body.append(cells(lines[i]))
                i += 1
            align = ["c" if c.startswith(":") and c.endswith(":") else "r" if c.endswith(":") else "" for c in rule]
            out.append({"k": "table", "head": head, "align": align, "rows": body})
        elif m := LIST_ITEM.match(line):
            flush()
            out.append({"k": "li", "ordered": m.group(2)[0].isdigit(),
                        "depth": len(m.group(1).expandtabs(4)) // 2, "text": m.group(3).strip()})
        elif RULE.match(s):
            flush()
            out.append({"k": "hr"})
        elif not para and out and out[-1]["k"] == "li" and line[:1] in (" ", "\t"):
            out[-1]["text"] += " " + s
        else:
            para.append(s)
    flush()
    return out


def arrange(bl: list[dict]) -> tuple[str, dict | None, list[tuple[str | None, dict]], list[dict]]:
    """The answer cut into the page's parts (docstring): its H1, the verdict (the first paragraph), what
    goes under 'Cevabı taşıyan sayılar' — each block with the writer's section it came from, None for
    the part before any section and for the writer's own section of that name — and the writer's other
    sections with what remains in them."""
    h1 = bl.pop(0)["text"] if bl and bl[0]["k"] == "h" and bl[0]["level"] == 1 else ""
    first = next((j for j, b in enumerate(bl) if b["k"] == "p"), None)
    verdict = bl.pop(first) if first is not None else None
    ours: list[tuple[str | None, dict]] = []
    sections: list[dict] = []
    here: dict | None = None
    for b in bl:
        if b["k"] == "h" and b["level"] <= 2:
            here = None if norm(b["text"]) == norm(OWN) else {"title": b["text"], "blocks": []}
            if here is not None:
                sections.append(here)
        elif here is None:
            ours.append((None, b))
        elif b["k"] in ("p", "li") and CITE.search(b["text"]):
            ours.append((here["title"], b))
        else:
            here["blocks"].append(b)
    return h1, verdict, ours, [s for s in sections if any(b["k"] not in ("h", "hr") for b in s["blocks"])]


def cited_in(s: str) -> list[str]:
    """The distinct ids a line cites, in order."""
    return list(dict.fromkeys(i for m in CITE.finditer(s) for i in ROW_ID.findall(m.group(0))))


def count(s: str, zero: bool = False) -> str:
    """The count beside the claim (his order, 2026-09-26): the distinct rows it cites. `zero` — the line
    stands under 'Cevabı taşıyan sayılar' — prints a line that cites no row as `(0 satır)`, the warning
    style; elsewhere such a line stays plain (the lead's ruling, 2026-09-26). Counter-evidence, `[A] ↔ [B]`,
    is counted beside each side (Page.inline): a line that cites nothing but pairs carries no sum of the
    two sides at its end — 3 rows against 3 are not "6 satır" for one claim."""
    n = len(cited_in(s))
    if n and not CITE.search(PAIR.sub("", s)):
        return ""
    return f' <span class="count{"" if n else " zero"}">({n} satır)</span>' if n or zero else ""


def has_body(r: dict) -> bool:
    """kapsama.py's İndirildi, the same rule: a body was fetched (bytes > 0) and the page was alive."""
    try:
        return float(r.get("bytes") or 0) > 0 and r.get("liveness") == "alive"
    except (TypeError, ValueError):
        return False


def shelves(rows: dict[str, dict]) -> list[dict]:
    """One drawer entry per address whose body was fetched, carrying every row at that address — the
    address row first (evidence.py's address_row: not a hunter's quote), then the quote rows — under
    the platform evidence.py counts it in, so a drawer holds what kapsama.py's İndirildi counts."""
    at: dict[str, list[dict]] = {}
    for r in rows.values():
        key = text(r.get("url_canonical")) or (P.canonical_url(text(r.get("url"))) if P else text(r.get("url")))
        if key:
            at.setdefault(key, []).append(r)
    out = []
    for key, group in at.items():
        if not any(has_body(r) for r in group):
            continue
        addr = E.address_row(group) if E else group[0]
        plat = E.row_platform(addr, key) if E else text(addr.get("platform")) or "web"
        ordered = [addr] + [r for r in group if r is not addr]
        out.append({"platform": plat, "rows": ordered, "ids": [r["id"] for r in ordered]})
    return out


def who(rows: list[dict], platform: str) -> str:
    """The author as the rows name it (the first that does); none: the domain, then the host."""
    for r in rows:
        a = unentity(text(r.get("author")))
        if a:
            return f"@{a}" if platform in HANDLES and len(a) <= 40 and HANDLE.fullmatch(a) else a
    for r in rows:
        d = text(r.get("domain")) or (urlsplit(text(r.get("url"))).hostname or "")
        if d:
            return d
    return "yazar yok"


def when(rows: list[dict]) -> str:
    """The first date the rows carry; a row whose dates disagree is undated (the schema), never a guess."""
    for r in rows:
        d = "" if r.get("dates_agree") is False else text(r.get("pub_date"))
        if d:
            return d
    return ""


def tr_date(d: str) -> str:
    m = re.fullmatch(r"(\d\d\d\d)-(\d\d)(?:-(\d\d))?(?:[T ].*)?", d)
    if not m or not 1 <= int(m.group(2)) <= 12:
        return d
    month = MONTHS[int(m.group(2)) - 1][:3]
    return f"{int(m.group(3))} {month} {m.group(1)}" if m.group(3) else f"{month} {m.group(1)}"


def link(url: str, cls: str) -> str:
    """An address he can open — the link keeps it whole; the text drops the scheme and shortens."""
    if not re.match(r"https?://", url, re.IGNORECASE):
        return ""
    shown = re.sub(r"^https?://(?:www\.)?", "", url, flags=re.IGNORECASE).rstrip("/")
    shown = shown if len(shown) <= 60 else shown[:59] + "…"
    return f'<a class="{cls}" href="{attr(url)}" target="_blank" rel="noopener noreferrer">{esc(shown)}</a>'


def shorten(s: str, limit: int = SHELF_CHARS) -> str:
    s = " ".join(s.split())
    if len(s) <= limit:
        return s
    cut = s[:limit - 1]
    if cut.rfind(" ") > limit * 0.8:
        cut = cut[:cut.rfind(" ")]
    return cut.rstrip(" ,;:.") + "…"


def thousands(n: int) -> str:
    return f"{n:,}".replace(",", ".")


class Page:
    """Numbers the cited ids in the order the page shows them; each id links to its row in the drawer
    (a cited row with no body has no drawer entry, so it links to its quote card)."""

    def __init__(self, rows: dict[str, dict], shelved: set[str]):
        self.rows, self.shelved, self.num = rows, shelved, {}

    def cite(self, group: str) -> str:
        refs = []
        for i in ROW_ID.findall(group):
            n = self.num.setdefault(i, len(self.num) + 1)
            refs.append(f'<a class="ref" href="#{i if i in self.shelved else "q-" + i}" title="{i}">{n}</a>')
        return '<span class="refs">' + "".join(refs) + "</span>"

    def inline(self, s: str) -> str:
        """Bold, italic, code and citations; every other character escaped — nothing typed becomes HTML."""
        held: list[str] = []

        def hold(fragment: str) -> str:
            held.append(fragment)
            return f"\x00{len(held) - 1}\x00"

        s = PAIR.sub(lambda m: hold(f"{self.cite(m[1])}{count(m[1], True)} ↔ {self.cite(m[2])}{count(m[2], True)}"),
                     s.replace("\x00", ""))          # counter-evidence: each side its chips and its own count
        s = CITES.sub(lambda m: hold(self.cite(m.group(0))), s)
        s = re.sub(r"`([^`\n]+)`", lambda m: hold(f"<code>{esc(m.group(1))}</code>"), s)
        s = esc(s)
        s = re.sub(r"\*\*(?=\S)(.+?)(?<=\S)\*\*", r"<strong>\1</strong>", s)
        s = re.sub(r"(?<![\w*])\*(?=[^\s*])(.+?)(?<=[^\s*])\*(?![\w*])", r"<em>\1</em>", s)
        s = re.sub(r"(?<![\w_])_(?=[^\s_])(.+?)(?<=[^\s_])_(?![\w_])", r"<em>\1</em>", s)
        return re.sub(r"\x00(\d+)\x00", lambda m: held[int(m.group(1))], s)

    def table(self, b: dict, zero: bool = False) -> str:
        """A table stays a table (a comparison is one); on a phone each row stands as a card, its cells
        labelled by the header. A row that cites carries its `(n satır)` in the last cell that cites; with
        `zero` (under 'Cevabı taşıyan sayılar') a row that cites nothing carries `(0 satır)` in its last."""
        head, align = b["head"], b["align"]
        cls = [' class="n"' if a == "r" else ' class="c"' if a == "c" else "" for a in align]
        cls += [""] * (len(head) - len(cls))
        tags = [attr(re.sub(r"[*_`]", "", h)) for h in head]
        ths = "".join(f"<th{cls[j]}>{self.inline(h)}</th>" for j, h in enumerate(head))
        trs = []
        for row in b["rows"]:
            row = row + [""] * (len(head) - len(row))
            last = max((j for j, c in enumerate(row) if CITE.search(c)), default=len(row) - 1 if zero else -1)
            tail = count(" ".join(row), zero)
            tds = "".join(f'<td data-label="{tags[j] if j < len(tags) else ""}"{cls[j] if j < len(cls) else ""}>'
                          f'<span class="v">{self.inline(c)}{tail if j == last else ""}</span></td>'
                          for j, c in enumerate(row))
            trs.append(f"<tr>{tds}</tr>")
        return (f'<div class="tbl"><table class="stack"><thead><tr>{ths}</tr></thead>\n<tbody>\n'
                + "\n".join(trs) + "\n</tbody></table></div>")

    def flow(self, bl: list[dict], claims: bool = False) -> str:
        """Blocks in their order. With `claims`, every paragraph and list item is one line of the ledger,
        and it and every table row carry their count, `(0 satır)` included."""
        out: list[str] = []
        opened = ""
        for b in bl:
            k = b["k"]
            if k == "li" or (k == "p" and claims):
                want = "claims" if claims else "ol" if b["ordered"] else "ul"
                if opened != want:
                    out += ["</ol>" if opened == "ol" else "</ul>"] if opened else []
                    out.append({"claims": '<ul class="claims">', "ol": "<ol>", "ul": "<ul>"}[want])
                    opened = want
                depth = f' class="d{min(b["depth"], 3)}"' if k == "li" and b["depth"] and not claims else ""
                out.append(f"<li{depth}>{self.inline(b['text'])}{count(b['text'], claims)}</li>")
                continue
            out += ["</ol>" if opened == "ol" else "</ul>"] if opened else []
            opened = ""
            if k == "p":
                out.append(f"<p>{self.inline(b['text'])}{count(b['text'])}</p>")
            elif k == "h":
                out.append(f"<h3>{self.inline(b['text'])}{count(b['text'])}</h3>")
            elif k == "table":
                out.append(self.table(b, claims))
            else:
                out.append("<hr>")
        out += ["</ol>" if opened == "ol" else "</ul>"] if opened else []
        return "\n".join(out)

    def ours(self, ours: list[tuple[str | None, dict]]) -> str:
        """'Cevabı taşıyan sayılar': the claim lines, each under the writer's section it came from."""
        if not ours:
            return '<p class="empty">Hükmün dışında satıra dayanan iddia yok.</p>'
        out: list[str] = []
        j = 0
        while j < len(ours):
            title, run = ours[j][0], []
            while j < len(ours) and ours[j][0] == title:
                run.append(ours[j][1])
                j += 1
            body = self.flow(run, claims=True)
            if title is None:
                out.append(body)
            else:
                kind = "from caveat" if CAVEAT.search(title) else "from"
                out.append(f'<div class="{kind}"><p class="from-t">{self.inline(title)}</p>\n{body}</div>')
        return "\n".join(out)

    def cards(self) -> str:
        """A quote card for every cited id, in the page's order — quote, author, date, platform and
        address from the row, never from the answer."""
        if not self.num:
            return '<p class="empty">Cevapta kanıt satırı gösterilmedi.</p>'
        out = []
        for i, n in sorted(self.num.items(), key=lambda kv: kv[1]):
            r = self.rows[i]
            plat = text(r.get("platform")) or "web"
            passage = " ".join(unentity(text(r.get("passage"))).split())
            quote = f"“{esc(passage)}”" if passage else '<span class="none">alıntı yok</span>'
            shelf = f'<a href="#{attr(i)}">{esc(i)}</a>' if i in self.shelved else esc(i)
            source = " · ".join([esc(who([r], plat)), esc(tr_date(when([r])) or "tarih yok"), esc(label(plat)),
                                 link(text(r.get("url")), "src") or "adres yok", shelf])
            out.append(f'<figure class="qcard" id="q-{attr(i)}"><blockquote><span class="qn">{n}</span>{quote}'
                       f"</blockquote><figcaption>{source}</figcaption></figure>")
        return '<div class="cards">\n' + "\n".join(out) + "\n</div>"

    def entry(self, a: dict, p: str) -> str:
        """One drawer row: its ids (each an anchor), author, date, passage ≤ 300 characters, address."""
        ids = [f'<span class="did">{esc(a["ids"][0])}</span>'] + [
            f'<span class="did" id="{attr(i)}">{esc(i)}</span>' for i in a["ids"][1:]]
        mark = ""
        if a["cited"]:
            nums = ", ".join(str(self.num[i]) for i in a["cited"])
            mark = f' <a class="mark" href="#q-{attr(a["cited"][0])}">cevapta · {nums}</a>'
        passage = unentity(next((text(r.get("passage")) for r in a["rows"] if text(r.get("passage"))), ""))
        url = next((text(r.get("url")) for r in a["rows"] if text(r.get("url"))), "")
        meta = " · ".join([" ".join(ids), esc(who(a["rows"], p)), esc(tr_date(a["date"]) or "tarih yok")])
        said = text(a["rows"][0].get("verdict"))        # the hunter's verdict on the body it read, if any
        if said in ("evidence", "none"):
            why = unentity(text(a["rows"][0].get("verdict_reason")))
            meta += f' · <span class="vd">avcı: {"kanıt" if said == "evidence" else "kanıt değil"}' \
                    f'{" — " + esc(why) if why else ""}</span>'
        body = esc(shorten(passage)) if passage else '<span class="none">metin yok</span>'
        return (f'<li class="{"drow cited" if a["cited"] else "drow"}" id="{attr(a["ids"][0])}">'
                f'<div class="dm">{meta}{mark}</div><p class="dt">{body}</p>{link(url, "du")}</li>')

    def drawer(self, shelf: list[dict]) -> tuple[str, int]:
        """THE DRAWER: one <details> per platform, every fetched address in it — cited first, then newest."""
        by: dict[str, list[dict]] = {}
        for a in shelf:
            by.setdefault(a["platform"], []).append(a)
        order = [p for p in (P.PLATFORMS if P else ()) if p in by] + [p for p in by if not P or p not in P.PLATFORMS]
        out = []
        for p in order:
            items = by[p]
            for a in items:
                a["cited"], a["date"] = [i for i in a["ids"] if i in self.num], when(a["rows"])
            items.sort(key=lambda a: a["date"], reverse=True)      # newest first, the undated last
            items.sort(key=lambda a: not a["cited"])               # stable: the cited ones on top
            used = sum(1 for a in items if a["cited"])
            out.append(f'<details class="plat" id="p-{attr(p)}">\n<summary>{esc(label(p))} — {len(items)} '
                       f'{NOUN.get(p, "sayfa")} ({used} cevapta)</summary>\n<ol class="drawer">\n'
                       + "\n".join(self.entry(a, p) for a in items) + "\n</ol>\n</details>")
        return ("\n".join(out) if out else '<p class="empty">Gövdesi indirilen adres yok.</p>'), len(order)


def question(run: Path) -> tuple[str, list[str]]:
    """The first sentence of his own words, and the ground's queries — from <run>/question.txt."""
    try:
        raw = (run / "question.txt").read_text(encoding="utf-8", errors="replace")
    except OSError:
        return "", []
    his, queries = [], []
    for line in raw.splitlines():
        s = line.strip()
        if s.startswith("- "):
            queries.append(s[2:].strip())
        elif s and not re.match(r"(?:DERT|SORGULAR) \(", s):
            his.append(s)
    words = " ".join(his)
    end = SENTENCE_END.search(words)
    return (words[:end.end()] if end else words).strip()[:200], queries


def title_of(queries: list[str], h1: str) -> str:
    """A 2–4 word name for the tab: the shortest query that is one (a version number counts with its
    name — "Fable 5.1" is one word); else the first four words of the first query or the question."""
    def words(s: str) -> list[str]:
        out: list[str] = []
        for w in s.split():
            if out and re.fullmatch(r"v?\d+(?:[.,]\d+)*", w):
                out[-1] += " " + w
            else:
                out.append(w)
        return out

    fits = [q for q in queries if 2 <= len(words(q)) <= 4]
    if fits:
        return min(fits, key=lambda q: len(words(q)))
    return " ".join(words((queries[0] if queries else h1).rstrip("?!.:;, "))[:4]) or "Araştırma"


def run_time(run: Path, rows: dict[str, dict]) -> str:
    """When the run was made: its folder's name (YYYYMMDD-HHMM-…), else its first row's retrieved_at."""
    m = re.match(r"(\d\d\d\d)(\d\d)(\d\d)-(\d\d)(\d\d)", run.name)
    try:
        if m:
            t = datetime(*map(int, m.groups()))
        else:
            stamps = sorted(text(r.get("retrieved_at")) for r in rows.values() if text(r.get("retrieved_at")))
            if not stamps:
                return ""
            t = datetime.fromisoformat(stamps[0].replace("Z", "+00:00")).astimezone()
    except ValueError:
        return ""
    return f"{t.day} {MONTHS[t.month - 1]} {t.year}, {t:%H:%M}"


def hunters(run: Path) -> list[int]:
    """The seconds each hunter ran: a <role>.meta beside its <role>.jsonl transcript (fleet.sh)."""
    secs = []
    for meta in sorted(run.glob("*.meta")):
        if not meta.with_suffix(".jsonl").is_file():
            continue
        try:
            m = re.search(r"^secs=(\d+)", meta.read_text(encoding="utf-8", errors="replace"), re.M)
        except OSError:
            continue
        if m:
            secs.append(int(m.group(1)))
    return secs


def coverage_html(table: str, ok: bool) -> str:
    """kapsama.py's table as the page's: the numbers a grid of tabular figures, and each platform's text
    columns (Elenen, Kapalı kapı — the reasons, which can run to fourteen) a labelled line under its
    numbers, full width: nine columns in a 760 px measure squeezed them into a sliver (seen 2026-09-26).
    Then the reconciliation line. A table that could not be printed is its one-line note."""
    if not ok:
        return f'<p class="note">{esc(table.strip().strip("_"))}</p>'
    lines = [line.strip() for line in table.splitlines() if line.strip()]
    grid = [line for line in lines if line.startswith("|")]
    rest = [line for line in lines if not line.startswith("|")]
    out = []
    if len(grid) >= 2 and TABLE_RULE.match(grid[1]):
        head = cells(grid[0])
        num = [' class="n"' if c.endswith(":") else "" for c in cells(grid[1])]
        num += [""] * len(head)
        # a text column (neither the first nor a number) leaves the grid only when the table has numbers
        wide = {j for j in range(1, len(head)) if not num[j]} if any(num[:len(head)]) else set()
        main = [j for j in range(len(head)) if j not in wide]
        cls = [num[j] or (' class="h"' if j == 0 else "") for j in range(len(head))]   # the platform · a number
        ths = "".join(f"<th{num[j]}>{esc(head[j])}</th>" for j in main)
        trs = []
        for line in grid[2:]:
            row = cells(line) + [""] * len(head)
            tds = "".join(f'<td data-label="{attr(head[j])}"{cls[j]}><span class="v">{esc(unentity(row[j]))}</span></td>'
                          for j in main)
            why = [f'<div><span class="why-l">{esc(head[j])}</span> {esc(unentity(row[j]))}</div>' for j in sorted(wide)
                   if row[j].strip() not in ("", "—", "-")]
            trs.append(f'<tr class="has-why">{tds}</tr>\n<tr class="why"><td colspan="{len(main)}">{"".join(why)}</td></tr>'
                       if why else f"<tr>{tds}</tr>")
        out.append(f'<div class="tbl"><table class="stack cov"><thead><tr>{ths}</tr></thead>\n<tbody>\n'
                   + "\n".join(trs) + "\n</tbody></table></div>")
    else:
        rest = lines
    for line in rest:
        kind = "recon ok" if line.startswith("RECONCILED") else "recon bad" if line.startswith("MISMATCH") else "note"
        out.append(f'<p class="{kind}">{esc(line)}</p>')
    return "\n".join(out)


def section(no: int, title: str, body: str, anchor: str) -> str:
    return (f'<section class="sec" id="{anchor}">\n<h2><span class="no">{no:02d} —</span> {title}</h2>\n'
            f"{body}\n</section>")


def html_page(md: str, rows: dict[str, dict], run: Path, table: tuple[str, bool] | None) -> tuple[str, dict]:
    """final.html, in the order of the docstring. Rendered top to bottom, so the ids are numbered in the
    order he reads them."""
    shelf = shelves(rows)
    page = Page(rows, {i for a in shelf for i in a["ids"]})
    h1, verdict, ours, sections = arrange(blocks(md))
    his, queries = question(run)
    h1 = h1 or his or (queries[0] if queries else "") or "Araştırma"
    secs = hunters(run)
    brow = ["Araştırma"] + [t for t in [run_time(run, rows)] if t]
    if secs:
        brow += [f"{len(secs)} avcı", f"{min(secs)}–{max(secs)} sn" if min(secs) != max(secs) else f"{secs[0]} sn"]
    head = [f'<p class="eyebrow">{esc(" · ".join(brow))}</p>', f"<h1>{page.inline(h1)}</h1>"]
    lede = (page.inline(verdict["text"]) + count(verdict["text"])) if verdict \
        else '<span class="none">Cevap metninde paragraf yok.</span>'
    head.append(f'<div class="verdict"><p class="label">Hüküm</p><p class="lede">{lede}</p></div>')
    parts = [section(1, esc(OWN), page.ours(ours), "sayilar")]
    for s in sections:
        body = page.flow(s["blocks"])
        body = f'<div class="caveat">\n{body}\n</div>' if CAVEAT.search(s["title"]) else body
        parts.append(section(len(parts) + 1, page.inline(s["title"]), body, f"s{len(parts) + 1:02d}"))
    parts.append(section(len(parts) + 1, "Alıntılar", '<p class="intro">Cevapta geçen her satır, kendi kaydından: '
                         "alıntı, yazar, tarih, platform, adres.</p>\n" + page.cards(), "alintilar"))
    if table is not None:
        parts.append(section(len(parts) + 1, "Nereye bakıldı", coverage_html(*table), "kapsama"))
    drawer, plats = page.drawer(shelf)
    parts.append(section(len(parts) + 1, "Getirilen bütün satırlar",
                         f'<p class="intro">Gövdesi indirilen her adres, platform platform — {thousands(len(shelf))} '
                         "adres. Cevapta kullanılanlar üstte ve işaretli, gerisi en yeniden eskiye; uzun metin "
                         f"{SHELF_CHARS} karakterde kesildi.</p>\n{drawer}", "cekmece"))
    foot = (f"<footer>evidence.jsonl · {thousands(len(rows))} satır · alıntı, yazar, tarih ve adres satırların "
            "kendisinden basıldı, cevaptan değil</footer>")
    doc = ["<!doctype html>", '<html lang="tr">', "<head>", '<meta charset="utf-8">',
           '<meta name="viewport" content="width=device-width, initial-scale=1">',
           '<meta name="color-scheme" content="light dark">', f"<title>{esc(title_of(queries, h1))}</title>",
           '<link rel="preconnect" href="https://fonts.googleapis.com">',
           '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           f'<link rel="stylesheet" href="{attr(FONTS)}">', f"<style>{CSS}</style>", "</head>", "<body>",
           "<main>", *head, *parts, foot, "</main>", f"<script>{OPEN_DRAWER}</script>", "</body>", "</html>"]
    return "\n".join(doc) + "\n", {"cited": len(page.num), "platforms": plats, "shelved": len(shelf)}


def refuse(reason: str, outs: list[Path], keep: tuple[Path, ...]) -> int:
    """Exit 2 with one line. A page an earlier render left at an output path is removed — never a file
    in `keep`."""
    gone = ""
    for out in outs:
        if out.is_file() and out.resolve() not in keep:
            try:
                out.unlink()
                gone += f"; the earlier {out.name} was removed"
            except OSError as e:
                gone += f"; the earlier {out.name} could NOT be removed: {e.strerror}"
    print(f"render: REFUSED (no page written{gone}) — {reason}", file=sys.stderr)
    return 2


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(prog="render.py", description="the page, from the evidence rows only")
    ap.add_argument("answer")
    ap.add_argument("--evidence", required=True)
    ap.add_argument("--out", help="*.html: the designed page only · anything else: the Markdown page only · "
                                  "default: final.md and final.html beside the answer")
    ap.add_argument("--no-coverage", action="store_true")
    a = ap.parse_args(argv)

    answer = Path(a.answer).resolve()  # <run> is its folder, also when it is given as a bare name
    evidence = Path(a.evidence)
    outs = [Path(a.out)] if a.out else [answer.parent / "final.md", answer.parent / "final.html"]
    keep = (answer, evidence.resolve())  # a mistyped --out never deletes the answer or the rows
    try:
        md = answer.read_text(encoding="utf-8-sig", errors="replace")
        rows, bad = load_rows(evidence)
    except OSError as e:
        return refuse(f"cannot read {e.filename}: {e.strerror}", outs, keep)
    md = P.split_paired(md) if P else md   # `[A ↔ B]` is `[A] ↔ [B]`; each side still meets every rule below
    skipped = f"{len(bad)} line(s) of {evidence.name} are not a JSON row and were skipped (first: line {bad[0]})" if bad else ""
    why = refusals(md, rows, evidence.name)
    if why:
        return refuse("; ".join(why + ([skipped] if skipped else [])), outs, keep)
    if skipped:
        print(f"render: note — {skipped}", file=sys.stderr)

    table = None if a.no_coverage else coverage(answer.parent, answer)   # one call serves both pages
    said = "not asked (--no-coverage)" if table is None else "kapsama.py table" if table[1] else table[0].strip("_")
    body, cited = number(md)
    entries = [source_line(n, rows[i]) for n, i in enumerate(cited, 1)]
    drawer = ""
    for out in outs:
        if out.suffix.lower() in (".html", ".htm"):
            text_out, facts = html_page(md, rows, answer.parent, table)
            drawer = f" · çekmece {facts['platforms']} platform, {facts['shelved']} adres"
        else:
            page = [body.rstrip("\n"), "", "## Kaynaklar", "",
                    "\n\n".join(entries) if entries else "Cevapta kanıt satırı gösterilmedi."]
            page += ["", "## Nereye bakıldı", "", table[0]] if table is not None else []
            text_out = "\n".join(page) + "\n"
        try:
            out.write_text(text_out, encoding="utf-8")
        except OSError as e:
            raise SystemExit(f"render: cannot write {out}: {e.strerror}")
    print(f"render: {len(cited)} cited id(s) -> {' + '.join(map(str, outs))} · Kaynaklar {len(entries)} · "
          f"Nereye bakıldı: {said}{drawer}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
