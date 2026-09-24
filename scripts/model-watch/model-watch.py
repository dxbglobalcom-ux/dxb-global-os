#!/usr/bin/env python3
"""THE MODEL WATCH — board row B55, 2026-09-24.

WHY. On 2026-09-24 the CEO pinned the main model (~/.claude/settings.json "model"). A pinned model
does not move when Anthropic ships a newer one, so the pin needs a watch. His order for that moment
(ledger id model-watch-review-together-2026-09-24): he is told; he and the chief engineer review the
model together; the prompt audit starts only on his OK; the setting moves only on his "geç". The
same day he widened it to Anthropic's usage guidance ("şöyle kullanılırsa daha mükemmel sonuç
olur"), ruled that what he is shown must be current ("güncel ama tabiki"), and then that it must
not swell the session: only news that seriously affects how OUR models work reaches him, and
Sonnet judges which ("sadece istediğimiz modellerimizin çalışmasını ciddi anlamda etkileyecek bir
haber varsa getirsin … hergün saçma sapan haber getirip ufak güncellemelerle contexti şişirmesin").

This script is step one — TELL — and nothing else. It never starts an audit, never changes a
setting and never applies guidance. It reads public pages; its judge runs on the machine's own
`claude` login. It holds no API key and no credential of its own.

Once a day (dxb-model-watch.timer):
  1. COLLECT five public sources, each on its own:
       models         the models overview: the "Claude API ID" row of its table, and the page's own
                      split of current and legacy models (its navigation)
       docs           the docs sitemap: English paths about models and prompting, and any
                      what's-new, migration or best-practices page
       release-notes  the Claude Platform release notes: one item per bullet under a dated heading
       claude-code    the Claude Code changelog: one item per version that gives a user something
                      to use, the judge reading all such entries; a version of fixes only is
                      recorded and skipped
       engineering    Anthropic's engineering blog: one item per post
     A source's first good read is its baseline: model ids and undated paths are recorded
     silently, dated items of the last 30 days go on to the judge. After that, anything not seen
     before goes on when it is current (dated, or first seen, within 30 days), does not concern
     legacy models only, and is not only the launch of a model we already run.
  2. JUDGE: Sonnet 5 (`claude -p`, low effort, isolated as the H2 measurement proved clean — safe
     mode, no tools, no advisor, no inherited session variables) reads those items with our setup
     and answers per item: serious or not, and why, in one Turkish sentence. Serious items wait
     for him; the rest are recorded as judged and never shown. A judge that cannot answer leaves
     its items unjudged, asked again the next day, never shown unjudged. A new model id needs no
     judge: it is always serious, and the serious items that name it are told with it, as one.
  3. TELL: while anything serious waits, NOTICE.txt holds ONE line, which
     .claude/hooks/spec-bootstrap.sh puts under the opening's title. Every detail — the items, the
     reasons, the links — lives in --status.
A read that fails changes no record of what was seen, is logged, and still exits 0: a network blip
is not a failed unit. A source without a good read for three days is named in one line of the
opening, because a watch that fails in silence is believed — and so is a judge that has left
items unjudged for three days.

State, outside the repository: $DXB_MODEL_WATCH_STATE, or ~/.local/state/dxb/model-watch/
  seen.json        what was seen per source (with its first-seen date), the current/legacy split,
                   what waits for him or for the judge ("pending"), and what was judged not serious
  last-check.json  the last check per source (time, ok, error, items read, last good read) and the
                   last judge call (items, verdicts, tokens, cost)
  sources.tsv      one line per source and one for the judge, for the session-start hook (plain bash)
  NOTICE.txt       the one line for the opening (absent when nothing serious waits)
  shown.json       what --status last showed, so an --ack clears only what was shown
  watch.log        append-only, one line per event

  python3 scripts/model-watch/model-watch.py                   one check (what the timer runs)
  python3 scripts/model-watch/model-watch.py --status          everything: items, reasons, links
  python3 scripts/model-watch/model-watch.py --ack <id>        clear one model id (and the items --status
                                                               showed with it), after he decided
  python3 scripts/model-watch/model-watch.py --ack-guidance    clear the serious guidance items --status showed
  --source URL | --source NAME=URL|file://path (repeatable)    read another page (tests)
  --today YYYY-MM-DD                                           the day the 30-day window counts from (tests)
  $DXB_MODEL_WATCH_JUDGE                                       a command that stands in for the judge (tests)
"""
from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import tempfile
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path

# name -> (URL, what --status calls it). Measured 2026-09-24 with curl:
# docs.anthropic.com/…/models/overview, docs.claude.com/en/docs/about-claude/models/overview and
# platform.claude.com/docs/en/about-claude/models/overview all redirect to the models URL below,
# which server-renders the id table. The docs changelog carries a date per version; the raw
# CHANGELOG.md on GitHub does not, so "current" could not be told there. The engineering blog has
# no feed (/rss.xml is 404); its index page carries every post's date.
SOURCES = {
    "models": ("https://platform.claude.com/docs/en/models/overview", "Anthropic's models page"),
    "docs": ("https://platform.claude.com/sitemap.xml", "the docs sitemap"),
    "release-notes": ("https://platform.claude.com/docs/en/release-notes/overview", "the API release notes"),
    "claude-code": ("https://code.claude.com/docs/en/changelog", "the Claude Code changelog"),
    "engineering": ("https://www.anthropic.com/engineering", "the engineering blog"),
}
CURRENT_DAYS = 30        # "güncel": an item older than this is recorded, never judged, never shown
TIMEOUT = 30             # seconds per page
USER_AGENT = "dxb-model-watch/1 (a daily read of Anthropic's public docs)"
SCRIPT = "python3 scripts/model-watch/model-watch.py"
# The judge reads an item's own text whole, up to this cap (the refuter's A3, 2026-09-24: a 400-character
# excerpt hid 12 of Claude Code 2.1.251's 14 usable entries). Measured that day, the longest item of the
# 30-day window was 2.1.281's usable entries, 4,439 characters; a longer one is cut here and ends in "…".
EXCERPT = 6000
KEEP_JUDGED = 500        # judged-not-serious items kept for --status
# A reader that changes what an item IS has its source read again, as at its first read: what its old
# reader sent on and is still current is judged again (2026-09-24, the refuter's A2/A3/B5: one item per
# release-notes bullet; every usable Claude Code entry; three more verbs that give a user something).
READERS = {"release-notes": 2, "claude-code": 2}
JUDGE_MODEL = "claude-sonnet-5"
JUDGE_EFFORT = "low"
JUDGE_BUDGET_USD = "1"   # per call: a tripwire, not a plan
JUDGE_TIMEOUT = 600      # seconds
SEATS = ("Opus 5.5 builds (writes the code); Fable 5.1 advises and orchestrates; "
         "Sonnet 5 is the cheap worker")
# A model's retirement is not news for him (his order, 2026-09-24: "emeklilikle ilgili haber istemiyorum
# gerek yok"); it is the judge's to call not serious — no word decides it before the judge, because usage
# guidance reads "deprecated" too ("header X is deprecated, use Y").
SERIOUS = (
    "An item is SERIOUS only if it seriously changes how OUR models should be used or configured:\n"
    "- a new model or a new version: a new model, or a new version of a model we use (a point release "
    "such as Opus 5.6, or a new dated snapshot id of a family we use) is always serious;\n"
    "- official prompting or usage guidance for a model we use;\n"
    "- a Claude Code or API change that changes our setup: effort levels, the advisor, subagents, hooks, "
    "settings defaults, context window, limits or pricing. A new Claude Code release is NOT serious by "
    "itself — only if it changes our setup.\n"
    "The launch of a model we ALREADY run (its id is in the list of ids we run, above) is NOT news: its "
    "launch note, its availability or its becoming a default is not serious. Usage guidance for it can be; "
    "a model or a version that is NOT in that list stays serious.\n"
    "The retirement or deprecation of a model — a notice that a model is deprecated, retired or will be — is "
    "NOT serious. A change that deprecates a parameter, a header or a setting in favour of another is usage "
    "guidance, and is judged as such.\n"
    "Everything else — small features, bug fixes, UI, docs edits — is NOT serious.")
VERDICTS = {"type": "object", "required": ["verdicts"], "properties": {"verdicts": {"type": "array", "items": {
    "type": "object", "required": ["id", "serious", "reason_tr"],
    "properties": {"id": {"type": "integer"}, "serious": {"type": "boolean"}, "reason_tr": {"type": "string"}}}}}}
MODEL_ID = re.compile(r"claude-[a-z0-9]+(?:-[a-z0-9]+)*")
SLUG = re.compile(r"(?:claude-)?([a-z]+)-(\d{1,2})(?:-(\d{1,2}))?(?:-\d{8})?")
OLD_STYLE = re.compile(r"(?<![a-z])claude[ -](\d)(?:[.-](\d)(?!\d))?[ -](opus|sonnet|haiku)")
DOCS_KEEP = re.compile(r"^/docs/en/(?:models/|about-claude/models/|build-with-claude/prompt-engineering/)"
                       r"|^/docs/en/.*(?:whats-new|migrat|best-practices)")
# English month names by hand: the timer may run under a Turkish locale, where strptime("%B")
# would not know "September" and every dated source would fail.
MONTHS = ("january", "february", "march", "april", "may", "june", "july", "august",
          "september", "october", "november", "december")
DATE_WORDS = re.compile(r"\b([A-Za-z]{3,9})\.? (\d{1,2}), (\d{4})\b")
# A Claude Code version goes on only when one of its entries gives a user something to use (the
# chief engineer's rule, 2026-09-24): a new feature, command, setting, flag, model or effort level —
# or one taken away or changed (the refuter's B5 the same day: "Removed the max effort level…",
# "Deprecated the advisor tool…" and "Changed subagents to inherit…" had been skipped as fixes).
# A version of fixes, reliability or performance alone is recorded and skipped. Measured that day
# on the live changelog: 21 of the 30 versions of the last 30 days carry such an entry.
USABLE = re.compile(r"^(?:Added|New|Introduced|Removed|Deprecated|Changed)\b|now supports", re.I)
FIX_ONLY = re.compile(r"^(?:Fixed|Fix|Improved|Reduced|Resolved|Prevented|Sped|Faster|Optimi[sz]ed|"
                      r"Performance|Reliability|Bug fixes|Stability)\b", re.I)
MODEL_ID_IN_TEXT = re.compile(r"\bclaude-(?:(?!code\b)[a-z]+-\d|\d)")
SETTING = re.compile(r"[A-Z][A-Z0-9]*_[A-Z0-9_]+|--[a-z][a-z0-9-]+|[a-z]+(?:[A-Z][a-z0-9]+)+|settings\.json")
# A model id as prose writes it (lower-cased text): claude-opus-5-5, claude-haiku-4-5-20251001,
# claude-3-5-sonnet-20241022 — not claude-code or claude-in-chrome.
NAMED_ID = re.compile(r"\bclaude-(?:[a-z]+-\d{1,2}(?:-\d{1,2})?|\d(?:-\d)?-[a-z]+)(?:-\d{8})?(?![\w-])")
# An entry that announces a model: "We've launched Claude Opus 5.5 (claude-opus-5-5), …" (release
# notes), "Added Claude Opus 5.5 (claude-opus-5-5), now the default Opus model …" (Claude Code).
ANNOUNCES = re.compile(r"^(?:we(?:'|’)ve |we have )?(?:launched|released|introduced|added) claude [a-z]+ \d+(?:\.\d+)? \(claude-", re.I)
RETIRES = re.compile(r"deprecat|retir|sunset|discontinu", re.I)
HEADING = re.compile(r"<h[1-6]\b", re.I)


class Nothing(Exception):
    """The page was read, and holds nothing this watch can use."""


# ── reading ─────────────────────────────────────────────────────────────────────────────────────

def fetch(url: str) -> str:
    if url.startswith("file://"):
        return Path(url[len("file://"):]).read_text(encoding="utf-8", errors="replace")
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:   # follows redirects
        return resp.read().decode(resp.headers.get_content_charset() or "utf-8", "replace")


def plain(fragment: str, sep: str = "") -> str:
    """Visible text of an HTML fragment. KaTeX writes each formula twice; the MathML copy goes."""
    fragment = re.sub(r"<math\b.*?</math>", "", fragment, flags=re.S)
    return " ".join(html.unescape(re.sub(r"<[^>]+>", sep, fragment)).split())


def sentence(text: str) -> str:
    return re.split(r"(?<=[.!?])\s", text, maxsplit=1)[0]


def english_date(text: str) -> str | None:
    """'September 22, 2026' or 'Apr 08, 2026' -> '2026-09-22'."""
    for m in DATE_WORDS.finditer(text):
        word = m.group(1).lower()
        month = next((i for i, name in enumerate(MONTHS, 1) if name.startswith(word)), None)
        if month:
            try:
                return date(int(m.group(3)), month, int(m.group(2))).isoformat()
            except ValueError:
                continue
    return None


def read_models(page: str) -> dict:
    """The ids in every table row whose first cell reads "Claude API ID", and the navigation's
    split: "Legacy models" is legacy; every other model page it lists, and every id, is current."""
    ids = set()
    for row in re.findall(r"<tr\b[^>]*>(.*?)</tr>", page, re.S | re.I):
        cells = [plain(c, " ") for c in re.findall(r"<t[dh]\b[^>]*>(.*?)</t[dh]>", row, re.S | re.I)]
        if cells and cells[0].lower() == "claude api id":
            ids.update(t for c in cells[1:] for t in c.split() if MODEL_ID.fullmatch(t))
    flat = page.replace('\\"', '"')
    group = re.search(r'"label":"Legacy models","pages":\[(.*?)\]', flat, re.S)
    legacy = set(re.findall(r"/docs/en/models/([a-z0-9-]+)/overview", group.group(1))) if group else set()
    listed = set(re.findall(r'"path":"/docs/en/models/([a-z0-9-]+)/overview"', flat))
    current = {r for r in map(slug_ref, (listed - legacy) | ids) if r}
    return {"ids": sorted(ids), "current": sorted(current), "legacy": sorted(r for r in map(slug_ref, legacy) if r),
            "legacy_group": bool(group)}


def read_docs(xml: str, url: str) -> list[dict]:
    items = {}
    for loc in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml):
        loc = html.unescape(loc)
        path = urllib.parse.urlsplit(loc).path
        if DOCS_KEEP.search(path):
            items[path] = {"key": path, "title": path[len("/docs/en/"):], "url": loc, "date": None, "excerpt": ""}
    return list(items.values())


def blocks(fragment: str) -> list[str]:
    """The outermost <li> and <p> elements of a fragment, as text: a bullet with a list or a paragraph
    inside it is one block, its inner items kept apart by a space."""
    out, depth, start = [], 0, 0
    for m in re.finditer(r"<(/?)(li|p)\b[^>]*>", fragment):
        if not m.group(1):
            start = m.end() if depth == 0 else start
            depth += 1
        elif depth:
            depth -= 1
            if depth == 0:
                out.append(plain(re.sub(r"<(?:/?(?:li|ul|ol|p)|br)\b[^>]*>", " ", fragment[start:m.start()])))
    return [b for b in out if b]


def entry_item(key: str, prefix: str, entries: list, url: str, when: str | None) -> dict:
    """An item told by its entries: titled by the first, and the judge reads them all (up to EXCERPT)."""
    text = " · ".join(entries)
    return {"key": key, "title": prefix + sentence(entries[0]) if entries else prefix.rstrip(": ") or key,
            "url": url, "date": when, "excerpt": text if len(text) <= EXCERPT else text[:EXCERPT - 1] + "…",
            "entries": entries, "prefix": prefix}


def read_release_notes(page: str, url: str) -> list[dict]:
    """One item per bullet (or paragraph) under a dated heading, up to the next heading. Its key is the
    heading's id and a hash of its text, so a bullet added later under a date already seen is new, and
    one inserted above another does not shift it (the refuter's A2, 2026-09-24: reading the first bullet
    alone, 18 of the 26 bullets of the 30-day window were never read). An edited bullet reads as new."""
    items = []
    for h in re.finditer(r'<h[234]\b[^>]*\bid="([a-z]+-\d{1,2}-\d{4})"[^>]*>(.*?)</h[234]>', page, re.S):
        nxt = HEADING.search(page, h.end())
        body = page[h.end():nxt.start() if nxt else h.end() + 20000]
        when = english_date(plain(h.group(2), " ")) or english_date(h.group(1).replace("-", " ", 1).replace("-", ", ", 1))
        for text in dict.fromkeys(blocks(body)):
            digest = hashlib.sha1(text.encode("utf-8")).hexdigest()[:10]
            items.append(entry_item(f"{h.group(1)}#{digest}", "", [text], f"{url}#{h.group(1)}", when))
    return items


def usable(entry: str) -> bool:
    """One changelog entry (HTML): does it give a user something to use?"""
    text = plain(entry)
    if USABLE.search(text):
        return True
    if FIX_ONLY.search(text):
        return False
    codes = [plain(c) for c in re.findall(r"<code\b[^>]*>(.*?)</code>", entry, re.S)]
    return bool(MODEL_ID_IN_TEXT.search(text) or any(SETTING.fullmatch(c) for c in codes))


def read_claude_code(page: str, url: str) -> list[dict]:
    """One item per version: the judge reads every entry that gives a user something to use, and the
    title is the first of them."""
    items = []
    for part in page.split('data-component-part="update-label">')[1:]:
        version = part.split("<", 1)[0].strip()
        if not re.fullmatch(r"\d+(?:\.\d+)+", version):
            continue
        when = re.search(r'data-component-part="update-description">([^<]*)<', part)
        entries = re.findall(r"<li\b[^>]*>(.*?)</li>", part, re.S)
        use = [e for e in entries if usable(e)]
        told = [t for t in (plain(e) for e in (use or entries)) if t]
        item = entry_item(version, f"{version}: ", told, f"{url}#{version.replace('.', '-')}",
                          english_date(when.group(1)) if when else None)
        if entries and not use:
            item["skip"] = "bug fixes, reliability or performance only"
        items.append(item)
    return items


def read_engineering(page: str, url: str) -> list[dict]:
    parts = urllib.parse.urlsplit(url)
    origin = f"{parts.scheme}://{parts.netloc}" if parts.scheme in ("http", "https") else "https://www.anthropic.com"
    flat = page.replace('\\"', '"')
    published = {slug: d for d, slug in re.findall(
        r'"publishedOn":"(\d{4}-\d{2}-\d{2})","slug":\{"_type":"slug","current":"([a-z0-9-]+)"\}', flat)}
    items = {}
    for card in re.split(r'(?=href="/engineering/[a-z0-9-]+")', page):
        m = re.match(r'href="/engineering/([a-z0-9-]+)"', card)
        if not m or m.group(1) in items:
            continue
        slug = m.group(1)
        head = re.search(r"<h[2-4]\b[^>]*>(.*?)</h[2-4]>", card, re.S)
        summary = re.search(r"<p\b[^>]*>(.*?)</p>", card, re.S)
        items[slug] = {"key": f"/engineering/{slug}", "title": plain(head.group(1)) if head else slug.replace("-", " "),
                       "url": f"{origin}/engineering/{slug}", "date": published.get(slug) or english_date(plain(card, " ")),
                       "excerpt": plain(summary.group(1))[:EXCERPT] if summary else ""}
    return list(items.values())


GUIDANCE = {"docs": read_docs, "release-notes": read_release_notes,
            "claude-code": read_claude_code, "engineering": read_engineering}


# ── what goes on to the judge: current, and not about legacy models only ────────────────────────

def slug_ref(text: str) -> str | None:
    """'claude-haiku-4-5-20251001' / 'opus-5-5' / 'mythos-5' -> 'haiku-4-5' / 'opus-5-5' / 'mythos-5'."""
    m = SLUG.fullmatch(text)
    return None if not m else "-".join(g for g in m.groups() if g)


def ref_tuple(ref: str) -> tuple:
    fam, major, *minor = ref.split("-")
    return fam, int(major), int(minor[0]) if minor else 0


def model_refs(text: str, families: set) -> set:
    """Every model a title or path names, as (family, major, minor): "Opus 5.5", "opus-4-8",
    "claude-haiku-4-5-20251001", and the old spelling "Claude 3.5 Sonnet"."""
    alt = "|".join(sorted(families, key=len, reverse=True))
    new_style = re.compile(rf"(?<![a-z])({alt})[ -](\d{{1,2}})(?:[.-](\d{{1,2}})(?!\d))?")
    refs = {(f, int(a), int(b or 0)) for f, a, b in new_style.findall(text)}
    refs |= {(f, int(a), int(b or 0)) for a, b, f in OLD_STYLE.findall(text)}
    return refs


def legacy_only(text: str, catalog: dict) -> str | None:
    """Why a (lower-cased) text concerns legacy models only, or None. A model is legacy when the models
    page lists it as legacy, or when it is not current and a current model of its family is newer
    (retired models are on no list). A model newer than every current one is never legacy: that may be
    the news. Words alone decide nothing (the refuter's A1, 2026-09-24): a usage-guidance item can read
    "deprecation" too, so it reaches the judge — whose criteria mark a model's retirement as not serious
    (the CEO, 2026-09-24: no retirement news)."""
    current = {ref_tuple(r) for r in catalog.get("current", [])}
    legacy = {ref_tuple(r) for r in catalog.get("legacy", [])}
    families = {r[0] for r in current | legacy} or {"opus", "sonnet", "haiku"}
    refs = model_refs(text, families)

    def is_legacy(r):
        return r in legacy or (r not in current and any(c[0] == r[0] and c[1:] > r[1:] for c in current))

    if refs and all(map(is_legacy, refs)):
        return "names only legacy models: " + ", ".join(sorted(f"{f} {a}.{b}" if b else f"{f} {a}" for f, a, b in refs))
    return None


def ours_only(entry: str, ours: set) -> bool:
    """Does this entry only announce a model we already run — its launch, or its becoming a default?"""
    named = set(NAMED_ID.findall(entry.lower()))
    return bool(ANNOUNCES.search(entry) and named and named <= ours and not RETIRES.search(entry))


def sift(item: dict, ours: set, catalog: dict) -> dict:
    """An item told by entries (a release-notes bullet, a Claude Code version) is sifted entry by entry:
    one that names legacy models only, or only announces a model we already run, is dropped before the
    judge (the refuter's B2, 2026-09-24: four of the five items waiting that day were the launches of
    Opus 5.5 and Fable 5.1, which we run). An item left with none is skipped; one left with others is
    titled by them. A model or a version we do not run is never dropped here: that is the news."""
    entries = item.get("entries")
    if item.get("skip") or not entries:
        return item
    why = [f"the launch of a model we already run: {', '.join(sorted(set(NAMED_ID.findall(e.lower()))))}"
           if ours_only(e, ours) else legacy_only(e.lower(), catalog) for e in entries]
    keep = [e for e, w in zip(entries, why) if not w]
    if len(keep) == len(entries):
        return item
    if not keep:
        return item | {"skip": why[0]}
    return entry_item(item["key"], item["prefix"], keep, item["url"], item["date"])


def irrelevant(item: dict, catalog: dict) -> str | None:
    """Why an item does not go on, or None. An item told by entries was sifted already (sift); any
    other — a docs path, a blog post — goes by its title and key."""
    if item.get("skip"):
        return item["skip"]
    if item.get("entries") is not None:
        return None
    return legacy_only(f"{item['title']} {item['key']}".lower(), catalog)


# ── the judge ───────────────────────────────────────────────────────────────────────────────────

def settings() -> dict:
    """Read-only: the two values the judge needs from ~/.claude/settings.json, nothing else."""
    try:
        data = json.loads((Path.home() / ".claude" / "settings.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        data = {}
    data = data if isinstance(data, dict) else {}
    return {"model": data.get("model"), "advisorModel": data.get("advisorModel")}


def running(seen: dict) -> set:
    """The model ids we already run, read-only: the main model and the advisor of ~/.claude/settings.json
    — a pinned id as it stands ("[1m]" and the like dropped); an alias such as "fable" (measured
    2026-09-24: the advisor is set so) as the newest id of its family on the models page that is not
    waiting for him — and the judge's own model, Sonnet 5, the cheap worker's seat."""
    s = settings()
    new = {p["id"] for p in seen.get("pending", {}).get("models", [])}
    listed = [i for i in seen.get("models", {}) if i not in new and slug_ref(i)]
    ours = set()
    for v in (s["model"], s["advisorModel"], JUDGE_MODEL):
        v = re.sub(r"\[[^\]]*\]$", "", v.strip().lower()) if isinstance(v, str) else ""
        if re.fullmatch(r"[a-z]+", v):
            family = [i for i in listed if slug_ref(i).startswith(v + "-")]
            v = max(family, key=lambda i: ref_tuple(slug_ref(i))) if family else ""
        if v:
            ours |= {v, re.sub(r"-\d{8}$", "", v)}
    return ours


def judge_prompt(items: list, ours: set) -> str:
    s = settings()
    listing = [{"id": i, "source": g["source"], "date": g["date"], "title": g["title"], "url": g["url"],
                "excerpt": g.get("excerpt", "")} for i, g in enumerate(items, 1)]
    return (
        "You judge news from Anthropic for one company's Claude setup.\n"
        f"Our setup: main model (Claude Code) {s['model'] or 'not set'}; advisor model {s['advisorModel'] or 'not set'}; "
        f"seats: {SEATS}.\nThe model ids we already run: {', '.join(sorted(ours)) or 'none known'}.\n\n{SERIOUS}\n\n"
        "Judge every item below. Answer with JSON only: "
        '{"verdicts": [{"id": <id>, "serious": true or false, "reason_tr": "<one Turkish sentence: why>"}]}, '
        "one verdict per item.\n\nItems:\n" + json.dumps(listing, ensure_ascii=False, indent=1) + "\n")


def judge_env() -> dict:
    """The H2 isolation: no inherited session variables, no advisor tool."""
    env = {k: v for k, v in os.environ.items()
           if not k.startswith("CLAUDE") and k not in ("AI_AGENT", "TRACEPARENT")}
    env["CLAUDE_CODE_DISABLE_ADVISOR_TOOL"] = "1"
    return env


def ask_judge(items: list, now: datetime, ours: set) -> tuple[dict | None, dict]:
    """({item number: (serious, reason)} or None when the judge could not answer, the call's record)."""
    prompt = judge_prompt(items, ours)
    rec = {"time": now.isoformat(timespec="seconds"), "ok": False, "error": None, "items": len(items),
           "serious": 0, "input_tokens": 0, "output_tokens": 0, "cost_usd": 0.0}
    try:
        stand_in = os.environ.get("DXB_MODEL_WATCH_JUDGE")
        if stand_in:
            proc = subprocess.run(shlex.split(stand_in), input=prompt, capture_output=True, text=True,
                                  timeout=JUDGE_TIMEOUT)
        else:
            claude = shutil.which("claude") or str(Path.home() / ".local" / "bin" / "claude")
            with tempfile.TemporaryDirectory(prefix="model-watch-judge-") as cwd:   # neutral: empty, not git
                proc = subprocess.run(
                    [claude, "-p", "--model", JUDGE_MODEL, "--effort", JUDGE_EFFORT, "--safe-mode", "--tools", "",
                     "--strict-mcp-config", "--no-session-persistence", "--output-format", "json",
                     "--max-budget-usd", JUDGE_BUDGET_USD, "--json-schema", json.dumps(VERDICTS), prompt],
                    cwd=cwd, env=judge_env(), stdin=subprocess.DEVNULL, capture_output=True, text=True,
                    timeout=JUDGE_TIMEOUT)
        try:
            answer = json.loads(proc.stdout)
        except ValueError:
            raise RuntimeError(f"exit {proc.returncode}, no JSON answer: {(proc.stderr or proc.stdout)[-200:]}")
        usage = answer.get("usage") or {}
        rec.update(input_tokens=sum(usage.get(k) or 0 for k in
                                    ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens")),
                   output_tokens=usage.get("output_tokens") or 0, cost_usd=answer.get("total_cost_usd") or 0.0)
        if proc.returncode != 0 or answer.get("is_error"):
            raise RuntimeError(f"exit {proc.returncode}: {answer.get('result') or proc.stderr}")
        body = answer.get("structured_output") or json.loads(
            re.sub(r"^```(?:json)?\s*|\s*```$", "", (answer.get("result") or "").strip()))
        verdicts = {}
        for v in body.get("verdicts", []):      # a verdict for an item that was not asked about is no verdict (B7)
            reason = v.get("reason_tr")
            if (isinstance(v.get("id"), int) and 1 <= v["id"] <= len(items) and isinstance(v.get("serious"), bool)
                    and isinstance(reason, str) and reason.strip()):
                verdicts[v["id"]] = (v["serious"], " ".join(reason.split()))
        if not verdicts:
            raise RuntimeError("the answer holds no usable verdict")
    except Exception as e:     # missing claude, no quota, bad JSON: nothing is decided, all is asked again
        rec["error"] = clean(e)
        return None, rec
    rec["ok"] = True
    rec["serious"] = sum(1 for s, _ in verdicts.values() if s)
    return verdicts, rec


# ── state ───────────────────────────────────────────────────────────────────────────────────────

def state_dir() -> Path:
    return Path(os.environ.get("DXB_MODEL_WATCH_STATE") or Path.home() / ".local" / "state" / "dxb" / "model-watch")


def load(path: Path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except ValueError as e:
        raise ValueError(f"{path.name} cannot be read ({e}); it is left as it is") from e


def write(path: Path, text: str) -> None:
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)


def save_seen(sd: Path, seen: dict) -> None:
    write(sd / "seen.json", json.dumps(seen, indent=1, sort_keys=True, ensure_ascii=False) + "\n")


def clean(err) -> str:
    """An error as one short line: printable ASCII, no quotes, no tabs."""
    text = str(err) or type(err).__name__
    text = re.sub(r"[^ -~]", " ", text).replace('"', "'").replace("\\", "/")
    return " ".join(text.split())[:160]


def log(sd: Path, now: datetime, line: str) -> None:
    with open(sd / "watch.log", "a", encoding="utf-8") as f:
        f.write(f"{now.isoformat(timespec='seconds')} {line}\n")


def waiting(seen: dict) -> tuple[list, list]:
    """What waits for him: every new model id, and every guidance item the judge called serious."""
    pending = seen.get("pending", {})
    return pending.get("models", []), [g for g in pending.get("guidance", []) if g.get("serious") is True]


def news(seen: dict) -> tuple[list, list]:
    """What waits for him, told once per piece of news (the refuter's B1, 2026-09-24: one new model was
    three items — its id, its release note, its changelog entry): ([(new model id, the serious items
    that name it)], [every other serious item])."""
    models, serious = waiting(seen)
    groups, alone = [(p, []) for p in models], []
    for g in serious:
        # the ids it names, and a named dated snapshot's model: an item on claude-opus-5-6-20270601 is news
        # of claude-opus-5-6, one on claude-opus-5-5 is not news of a new snapshot claude-opus-5-5-20261001
        text = f"{g['title']} {g.get('excerpt', '')}".lower()
        named = {n for i in NAMED_ID.findall(text) for n in (i, re.sub(r"-\d{8}$", "", i))}
        home = next((items for p, items in groups if p["id"] in named), None)
        (home if home is not None else alone).append(g)
    return groups, alone


def notice_line(count: int) -> str:
    items = "1 serious item waits" if count == 1 else f"{count} serious items wait"
    return f"--- MODEL WATCH: {items} for him — {SCRIPT} --status ---"


def render(sd: Path, seen: dict) -> int:
    """NOTICE.txt from what waits; returns how many pieces of news wait."""
    groups, alone = news(seen)
    count = len(groups) + len(alone)
    if count:
        write(sd / "NOTICE.txt", notice_line(count) + "\n")
    elif (sd / "NOTICE.txt").exists():
        (sd / "NOTICE.txt").unlink()
    return count


# ── one check ───────────────────────────────────────────────────────────────────────────────────

def check(sd: Path, urls: dict, today: date) -> int:
    sd.mkdir(parents=True, exist_ok=True)
    now = datetime.now().astimezone()
    stamp = now.isoformat(timespec="seconds")
    try:
        seen = load(sd / "seen.json", {})
        last = load(sd / "last-check.json", {})
    except ValueError as e:        # a real fault, not a blip: the unit shows it, and nothing is overwritten
        log(sd, now, f"FAILED {clean(e)}")
        print(f"model-watch: {e}", file=sys.stderr)
        return 1
    before = json.dumps(seen, sort_keys=True)
    seen.setdefault("guidance", {})
    pending = seen.setdefault("pending", {"models": [], "guidance": []})
    today_s, cutoff = today.isoformat(), (today - timedelta(days=CURRENT_DAYS)).isoformat()
    records, report = {}, []

    def failed(name: str, err) -> None:
        prev = last.get("sources", {}).get(name, {})
        records[name] = {"ok": False, "error": clean(err), "count": 0, "last_ok": prev.get("last_ok"),
                         "last_ok_epoch": prev.get("last_ok_epoch", 0), "url": urls[name]}
        log(sd, now, f"FAILED {name}: {clean(err)} ({urls[name]}) — what was seen is kept as it was")
        report.append(f"{name}: FAILED — {clean(err)}")

    def succeeded(name: str, count: int) -> None:
        records[name] = {"ok": True, "error": None, "count": count, "last_ok": stamp,
                         "last_ok_epoch": int(now.timestamp()), "url": urls[name]}

    # 1. the models page: new ids (always serious), and the current/legacy split for the filter
    try:
        info = read_models(fetch(urls["models"]))
        if not info["ids"]:
            raise Nothing("the page was read but no Claude API ID was found on it")
    except Exception as e:     # any failure of one source is recorded, and the others still run
        failed("models", e)
    else:
        succeeded("models", len(info["ids"]))
        if not info["legacy_group"]:
            log(sd, now, "models: no 'Legacy models' group on the page — legacy is judged by 'older than a current model' alone")
        seen["catalog"] = {"current": info["current"], "legacy": info["legacy"]}
        known = seen.get("models")
        if known is None:
            seen["models"] = {i: today_s for i in info["ids"]}
            log(sd, now, f"BASELINE models: {len(info['ids'])} ids: {', '.join(info['ids'])}")
            report.append(f"models: ok — {len(info['ids'])} ids read: {', '.join(info['ids'])} — baseline recorded")
        else:
            new = [i for i in info["ids"] if i not in known]
            for i in new:
                known[i] = today_s
                pending["models"].append({"id": i, "first_seen": today_s, "url": urls["models"]})
                log(sd, now, f"NEW model id {i} — serious without the judge")
            report.append(f"models: ok — {len(info['ids'])} ids read: {', '.join(info['ids'])} — {len(new)} new"
                          + (f": {', '.join(new)}" if new else ""))

    # 2. the guidance sources: what is new, current, not about legacy models only and not only the
    #    launch of a model we already run goes on
    catalog, ours, readers = seen.get("catalog", {}), running(seen), seen.setdefault("readers", {})
    for name, reader in GUIDANCE.items():
        try:
            items = reader(fetch(urls[name]), urls[name])
            if not items:
                raise Nothing("the page was read but no item was found on it")
        except Exception as e:
            failed(name, e)
            continue
        succeeded(name, len(items))
        again = name in seen["guidance"] and readers.get(name, 1) != READERS.get(name, 1)
        if again:                                 # its reader changed what an item is: read as at its first read
            del seen["guidance"][name]
            pending["guidance"] = [g for g in pending["guidance"] if g["source"] != name or g["date"] < cutoff]
            seen["judged"] = [j for j in seen.get("judged", []) if j["source"] != name or j["date"] < cutoff]
            log(sd, now, f"READ AGAIN {name}: its reader changed (v{readers.get(name, 1)} to v{READERS[name]}); "
                         "what it sent on and is still current is judged again")
        readers[name] = READERS.get(name, 1)
        first = name not in seen["guidance"]
        known = seen["guidance"].setdefault(name, {})
        goes = skipped = old = 0
        for it in items:
            if it["key"] in known:
                continue
            known[it["key"]] = today_s
            if first and not it["date"]:
                continue                          # an undated item at the baseline: recorded, silent
            when = it["date"] or today_s
            if when < cutoff:
                old += 1                          # not current: recorded, never judged
                if not first:
                    log(sd, now, f"NOT CURRENT {name}: {it['key']} dated {when}")
                continue
            it = sift(it, ours, catalog)
            why = irrelevant(it, catalog)
            if why:
                skipped += 1
                log(sd, now, f"SKIPPED {name}: {it['title']} ({why}) — {it['url']}")
                continue
            pending["guidance"].append({"source": name, "key": it["key"], "title": it["title"], "url": it["url"],
                                        "date": when, "first_run": first, "excerpt": it.get("excerpt", ""),
                                        "serious": None})
            goes += 1
        report.append(f"{name}: ok — {len(items)} items read — {'read again' if again else 'baseline' if first else 'new'}: "
                      f"{goes} to the judge, {skipped} skipped (legacy, fixes only, or a model we run), "
                      f"{old} older than {CURRENT_DAYS} days"
                      + (" (undated items at a baseline are recorded silently)" if first and name == "docs" else ""))

    # 3. the judge: every item not yet judged, in one call
    judge = last.get("judge")
    unjudged = [g for g in pending["guidance"] if g.get("serious") is None]
    if unjudged:
        verdicts, judge = ask_judge(unjudged, now, ours)
        if verdicts is None:
            log(sd, now, f"JUDGE FAILED: {judge['error']} — {len(unjudged)} item(s) stay unjudged, asked again next run")
            report.append(f"judge: FAILED — {judge['error']} — {len(unjudged)} item(s) asked again next run")
        else:
            judged, lines = seen.setdefault("judged", []), []
            for n, g in enumerate(unjudged, 1):
                if n not in verdicts:
                    continue                      # no verdict for it: asked again next run
                serious, reason = verdicts[n]
                g["reason_tr"] = reason
                if serious:
                    g["serious"] = True
                    log(sd, now, f"SERIOUS {g['source']}: {g['title']} — {reason}")
                else:
                    pending["guidance"].remove(g)
                    judged.append({k: g[k] for k in ("source", "key", "title", "url", "date", "reason_tr")} | {"judged": today_s})
                    log(sd, now, f"NOT SERIOUS {g['source']}: {g['title']} — {reason}")
                lines.append(f"  {'SERIOUS    ' if serious else 'not serious'} {g['source']} ({g['date']}): {g['title'][:90]} — {reason}")
            del judged[:-KEEP_JUDGED]
            log(sd, now, f"JUDGE ok: {judge['items']} item(s), {judge['serious']} serious, {judge['input_tokens']} tokens in, "
                         f"{judge['output_tokens']} out, ${judge['cost_usd']:.4f}")
            report.append(f"judge: ok — {judge['items']} item(s), {judge['serious']} serious · "
                          f"{judge['input_tokens']} tokens in, {judge['output_tokens']} out · ${judge['cost_usd']:.4f}")
            report.extend(lines)

    # 4. the judge's own line for the opening's three-day rule (the refuter's B3, 2026-09-24: a judge that
    #    failed every day left its items unjudged and the opening silent, for good). Its good read is the
    #    last run that left nothing unjudged — nothing to judge, or a verdict for each; a run that leaves
    #    items unjudged keeps the one before, and a watch that never had one starts the clock at that run.
    left = sum(1 for g in pending["guidance"] if g.get("serious") is None)
    clear = last.get("judge_clear")
    if not left or not (isinstance(clear, dict) and clear.get("last_ok_epoch") and clear.get("last_ok")):
        clear = {"last_ok": stamp, "last_ok_epoch": int(now.timestamp())}

    if json.dumps(seen, sort_keys=True) != before:
        save_seen(sd, seen)
    write(sd / "last-check.json", json.dumps({"time": stamp, "sources": records, "judge": judge, "judge_clear": clear},
                                             indent=2) + "\n")
    rows = []
    for name, rec in records.items():
        why = rec["error"] or "no check has run since"
        rows.append("\t".join([name, SOURCES[name][1], str(rec["last_ok_epoch"] or 0), (rec["last_ok"] or "never")[:10], why]))
    why = (f"{left} item(s) wait unjudged" + (f": {judge['error']}" if judge and judge.get("error") else "")) if left else "nothing waits unjudged"
    rows.append("\t".join(["judge", "the Sonnet judge", str(clear["last_ok_epoch"]), clear["last_ok"][:10], why]))
    write(sd / "sources.tsv", "\n".join(rows) + "\n")
    count = render(sd, seen)
    log(sd, now, "checked: " + " · ".join(f"{n} {'ok ' + str(r['count']) if r['ok'] else 'FAILED'}" for n, r in records.items())
        + f" · waiting for him: {count}")
    print("\n".join(report + [f"opening: {notice_line(count) if count else '(nothing)'}"]))
    return 0


# ── the session's commands ──────────────────────────────────────────────────────────────────────

def status(sd: Path) -> int:
    last = load(sd / "last-check.json", {})
    seen = load(sd / "seen.json", {})
    recs = last.get("sources", {})
    if not recs:
        print(f"last check   none on record in {sd}")
    else:
        print(f"last check   {last.get('time')}: " + " · ".join(
            f"{n} ok {r['count']}" if r["ok"] else f"{n} FAILED ({r['error']})" for n, r in recs.items()))
        print("last good    " + " · ".join(f"{n} {(r.get('last_ok') or 'never')[:16]}" for n, r in recs.items())
              + " (the opening names a source after 3 days without one)")
    j = last.get("judge")
    if j:
        print(f"judge        {j['time']}: " + (f"ok — {j['items']} item(s), {j['serious']} serious" if j["ok"] else f"FAILED ({j['error']})")
              + f" · {j['input_tokens']} tokens in, {j['output_tokens']} out · ${j['cost_usd']:.4f}")
    if last.get("judge_clear"):
        print(f"judge clear  {last['judge_clear'].get('last_ok', '')[:16]} — the last run that left nothing unjudged "
              "(the opening names the judge after 3 days without one)")
    groups, alone = news(seen)
    pinned = settings()["model"] or 'not set (no "model" in ~/.claude/settings.json)'
    print(f"waiting for him: {len(groups) + len(alone) or 'nothing'}")

    def told(g: dict, indent: str) -> str:
        mark = ", current at first run" if g.get("first_run") else ""
        return f"{indent}- {g['source']} ({g['date']}{mark}): {g['title']} — {g['url']}\n{indent}    {g.get('reason_tr', '')}"

    for p, items in groups:
        print(f"  - NEW MODEL ID {p['id']} (first seen {p['first_seen']}, {p['url']}). The pinned model is {pinned}. "
              "His order (2026-09-24): review the model together with him first; the prompt audit starts only on "
              f"his OK; ~/.claude/settings.json moves to it only when he says \"geç\". Clear with: {SCRIPT} --ack {p['id']}"
              + (f" — it clears the {len(items)} item(s) below, told with it" if items else ""))
        for g in sorted(items, key=lambda g: g["date"], reverse=True):
            print(told(g, "      "))
    for g in sorted(alone, key=lambda g: g["date"], reverse=True):
        print(told(g, "  "))
    if alone:
        print(f"  Tell him; review it together with him; nothing is applied without his OK. Clear with: {SCRIPT} "
              "--ack-guidance (it clears only what this --status showed)")
    if sd.is_dir():       # what was shown, so an --ack clears nothing he was not shown (the refuter's B6)
        write(sd / "shown.json", json.dumps({"time": datetime.now().astimezone().isoformat(timespec="seconds"),
                                             "models": {p["id"]: [[g["source"], g["key"]] for g in items] for p, items in groups},
                                             "guidance": [[g["source"], g["key"]] for g in alone]}, indent=1) + "\n")
    unjudged = [g for g in seen.get("pending", {}).get("guidance", []) if g.get("serious") is None]
    if unjudged:
        print(f"not yet judged: {len(unjudged)} (asked again at the next run, never shown to him unjudged)")
        for g in unjudged:
            print(f"  - {g['source']} ({g['date']}): {g['title']} — {g['url']}")
    since = (date.today() - timedelta(days=CURRENT_DAYS)).isoformat()
    recent = [g for g in seen.get("judged", []) if g.get("judged", "") >= since]
    print(f"judged not serious in the last {CURRENT_DAYS} days: {len(recent)} (recorded, never shown to him)")
    for g in recent:
        print(f"  - {g['source']} ({g['date']}): {g['title'][:100]} — {g['reason_tr']}")
    print(f"state        {sd}")
    return 0


def ack(sd: Path, model_id: str | None) -> int:
    """Clear what he has decided on — only what --status showed (the refuter's B6, 2026-09-24: an item
    that arrived after --status was cleared unseen)."""
    now = datetime.now().astimezone()
    seen = load(sd / "seen.json", {})
    shown = load(sd / "shown.json", None)
    pending = seen.get("pending", {"models": [], "guidance": []})
    if model_id is None:
        if shown is None:
            print("nothing cleared: --ack-guidance clears only what --status has shown, and --status has not run",
                  file=sys.stderr)
            return 1
        seen_keys = {tuple(k) for k in shown.get("guidance", [])}
        keep = [g for g in pending.get("guidance", []) if g.get("serious") is not True or (g["source"], g["key"]) not in seen_keys]
        what = f"{len(pending.get('guidance', [])) - len(keep)} serious guidance item(s) that --status showed"
        pending["guidance"] = keep                # what the judge has not seen stays, for the judge
    else:
        keep = [p for p in pending.get("models", []) if p["id"] != model_id]
        if len(keep) == len(pending.get("models", [])):
            ids = ", ".join(p["id"] for p in pending.get("models", [])) or "none"
            print(f"{model_id} is not waiting for him (new model ids waiting: {ids})", file=sys.stderr)
            return 1
        pending["models"] = keep
        with_it = {tuple(k) for k in ((shown or {}).get("models") or {}).get(model_id, [])}
        before = len(pending.get("guidance", []))
        pending["guidance"] = [g for g in pending.get("guidance", []) if (g["source"], g["key"]) not in with_it]
        what = model_id + (f" and the {before - len(pending['guidance'])} item(s) --status showed with it"
                           if before > len(pending["guidance"]) else "")
    if sd.exists():
        seen["pending"] = pending
        save_seen(sd, seen)
        render(sd, seen)
        log(sd, now, f"ACK {what} — cleared")
    print(f"cleared {what}")
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="The model watch (row B55): tell, never apply.")
    ap.add_argument("--source", action="append", default=[], metavar="[NAME=]URL",
                    help=f"read another page; NAME is one of {', '.join(SOURCES)} (bare URL = models)")
    ap.add_argument("--today", type=date.fromisoformat, default=None, metavar="YYYY-MM-DD")
    one = ap.add_mutually_exclusive_group()
    one.add_argument("--status", action="store_true")
    one.add_argument("--ack", metavar="ID")
    one.add_argument("--ack-guidance", action="store_true")
    a = ap.parse_args(argv)
    urls = {name: url for name, (url, _) in SOURCES.items()}
    for s in a.source:
        name, sep, url = s.partition("=")
        if sep and name in SOURCES:
            urls[name] = url
        else:
            urls["models"] = s
    sd = state_dir()
    try:
        if a.status:
            return status(sd)
        if a.ack or a.ack_guidance:
            return ack(sd, a.ack)
    except ValueError as e:
        print(f"model-watch: {e}", file=sys.stderr)
        return 1
    return check(sd, urls, a.today or date.today())


if __name__ == "__main__":
    sys.exit(main())
