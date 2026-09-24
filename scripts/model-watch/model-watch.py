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
       release-notes  the Claude Platform release notes: one item per dated heading
       claude-code    the Claude Code changelog: one item per version that gives a user something
                      to use; a version of fixes only is recorded and skipped
       engineering    Anthropic's engineering blog: one item per post
     A source's first good read is its baseline: model ids and undated paths are recorded
     silently, dated items of the last 30 days go on to the judge. After that, anything not seen
     before goes on when it is current (dated, or first seen, within 30 days) and does not concern
     legacy models only.
  2. JUDGE: Sonnet 5 (`claude -p`, low effort, isolated as the H2 measurement proved clean — safe
     mode, no tools, no advisor, no inherited session variables) reads those items with our setup
     and answers per item: serious or not, and why, in one Turkish sentence. Serious items wait
     for him; the rest are recorded as judged and never shown. A judge that cannot answer leaves
     its items unjudged, asked again the next day, never shown unjudged. A new model id needs no
     judge: it is always serious.
  3. TELL: while anything serious waits, NOTICE.txt holds ONE line, which
     .claude/hooks/spec-bootstrap.sh puts under the opening's title. Every detail — the items, the
     reasons, the links — lives in --status.
A read that fails changes no record of what was seen, is logged, and still exits 0: a network blip
is not a failed unit. A source without a good read for three days is named in one line of the
opening, because a watch that fails in silence is believed.

State, outside the repository: $DXB_MODEL_WATCH_STATE, or ~/.local/state/dxb/model-watch/
  seen.json        what was seen per source (with its first-seen date), the current/legacy split,
                   what waits for him or for the judge ("pending"), and what was judged not serious
  last-check.json  the last check per source (time, ok, error, items read, last good read) and the
                   last judge call (items, verdicts, tokens, cost)
  sources.tsv      one line per source, for the session-start hook (read by plain bash)
  NOTICE.txt       the one line for the opening (absent when nothing serious waits)
  watch.log        append-only, one line per event

  python3 scripts/model-watch/model-watch.py                   one check (what the timer runs)
  python3 scripts/model-watch/model-watch.py --status          everything: items, reasons, links
  python3 scripts/model-watch/model-watch.py --ack <id>        clear one model id, after he decided
  python3 scripts/model-watch/model-watch.py --ack-guidance    clear the serious guidance items he has seen
  --source URL | --source NAME=URL|file://path (repeatable)    read another page (tests)
  --today YYYY-MM-DD                                           the day the 30-day window counts from (tests)
  $DXB_MODEL_WATCH_JUDGE                                       a command that stands in for the judge (tests)
"""
from __future__ import annotations

import argparse
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
EXCERPT = 400            # characters of an item's own text the judge reads
KEEP_JUDGED = 500        # judged-not-serious items kept for --status
JUDGE_MODEL = "claude-sonnet-5"
JUDGE_EFFORT = "low"
JUDGE_BUDGET_USD = "1"   # per call: a tripwire, not a plan
JUDGE_TIMEOUT = 600      # seconds
SEATS = ("Opus 5.5 builds (writes the code); Fable 5.1 advises and orchestrates; "
         "Sonnet 5 is the cheap worker")
SERIOUS = (
    "An item is SERIOUS only if it seriously changes how OUR models should be used or configured:\n"
    "- a new model or a new version: a new model, or a new version of a model we use (a point release "
    "such as Opus 5.6, or a new dated snapshot id of a family we use) is always serious;\n"
    "- the retirement or deprecation of a model we use;\n"
    "- official prompting or usage guidance for a model we use;\n"
    "- a Claude Code or API change that changes our setup: effort levels, the advisor, subagents, hooks, "
    "settings defaults, context window, limits or pricing. A new Claude Code release is NOT serious by "
    "itself — only if it changes our setup.\n"
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
# chief engineer's rule, 2026-09-24): a new feature, command, setting, flag, model or effort level.
# A version of fixes, reliability or performance alone is recorded and skipped. Measured that day
# on the live changelog: 21 of the 30 versions of the last 30 days carry such an entry.
USABLE = re.compile(r"^(?:Added|New|Introduced)\b|now supports|^Changed\b.*\bdefault", re.I)
FIX_ONLY = re.compile(r"^(?:Fixed|Fix|Improved|Reduced|Resolved|Prevented|Sped|Faster|Optimi[sz]ed|"
                      r"Performance|Reliability|Bug fixes|Stability)\b", re.I)
MODEL_ID_IN_TEXT = re.compile(r"\bclaude-(?:(?!code\b)[a-z]+-\d|\d)")
SETTING = re.compile(r"[A-Z][A-Z0-9]*_[A-Z0-9_]+|--[a-z][a-z0-9-]+|[a-z]+(?:[A-Z][a-z0-9]+)+|settings\.json")


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


def read_release_notes(page: str, url: str) -> list[dict]:
    heads = list(re.finditer(r'<h[234]\b[^>]*\bid="([a-z]+-\d{1,2}-\d{4})"[^>]*>(.*?)</h[234]>', page, re.S))
    items = []
    for i, h in enumerate(heads):
        body = page[h.end():heads[i + 1].start() if i + 1 < len(heads) else h.end() + 20000]
        first = re.search(r"<(p|li)\b[^>]*>(.*?)</\1>", body, re.S)
        text = plain(first.group(2)) if first else ""
        when = english_date(plain(h.group(2), " ")) or english_date(h.group(1).replace("-", " ", 1).replace("-", ", ", 1))
        items.append({"key": h.group(1), "title": sentence(text) or plain(h.group(2)), "url": f"{url}#{h.group(1)}",
                      "date": when, "excerpt": text[:EXCERPT]})
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
    """One item per version; its title is the first entry that gives a user something to use."""
    items = []
    for part in page.split('data-component-part="update-label">')[1:]:
        version = part.split("<", 1)[0].strip()
        if not re.fullmatch(r"\d+(?:\.\d+)+", version):
            continue
        when = re.search(r'data-component-part="update-description">([^<]*)<', part)
        entries = re.findall(r"<li\b[^>]*>(.*?)</li>", part, re.S)
        use = [e for e in entries if usable(e)]
        first = (use or entries or [""])[0]
        item = {"key": version, "title": f"{version}: {sentence(plain(first))}" if first else version,
                "url": f"{url}#{version.replace('.', '-')}", "date": english_date(when.group(1)) if when else None,
                "excerpt": " · ".join(plain(e) for e in (use or entries))[:EXCERPT]}
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


def irrelevant(item: dict, catalog: dict) -> str | None:
    """Why an item does not go on, or None. A model is legacy when the models page lists it as
    legacy, or when it is not current and a current model of its family is newer (retired models
    are on no list). A model newer than every current one is never legacy: that may be the news."""
    if item.get("skip"):
        return item["skip"]
    text = f"{item['title']} {item['key']}".lower()
    if "legacy" in text or "deprecat" in text:
        return "legacy/deprecation wording"
    current = {ref_tuple(r) for r in catalog.get("current", [])}
    legacy = {ref_tuple(r) for r in catalog.get("legacy", [])}
    families = {r[0] for r in current | legacy} or {"opus", "sonnet", "haiku"}
    refs = model_refs(text, families)

    def is_legacy(r):
        return r in legacy or (r not in current and any(c[0] == r[0] and c[1:] > r[1:] for c in current))

    if refs and all(map(is_legacy, refs)):
        return "names only legacy models: " + ", ".join(sorted(f"{f} {a}.{b}" if b else f"{f} {a}" for f, a, b in refs))
    return None


# ── the judge ───────────────────────────────────────────────────────────────────────────────────

def settings() -> dict:
    """Read-only: the two values the judge needs from ~/.claude/settings.json, nothing else."""
    try:
        data = json.loads((Path.home() / ".claude" / "settings.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        data = {}
    data = data if isinstance(data, dict) else {}
    return {"model": data.get("model"), "advisorModel": data.get("advisorModel")}


def judge_prompt(items: list) -> str:
    s = settings()
    listing = [{"id": i, "source": g["source"], "date": g["date"], "title": g["title"], "url": g["url"],
                "excerpt": g.get("excerpt", "")} for i, g in enumerate(items, 1)]
    return (
        "You judge news from Anthropic for one company's Claude setup.\n"
        f"Our setup: main model (Claude Code) {s['model'] or 'not set'}; advisor model {s['advisorModel'] or 'not set'}; "
        f"seats: {SEATS}.\n\n{SERIOUS}\n\n"
        "Judge every item below. Answer with JSON only: "
        '{"verdicts": [{"id": <id>, "serious": true or false, "reason_tr": "<one Turkish sentence: why>"}]}, '
        "one verdict per item.\n\nItems:\n" + json.dumps(listing, ensure_ascii=False, indent=1) + "\n")


def judge_env() -> dict:
    """The H2 isolation: no inherited session variables, no advisor tool."""
    env = {k: v for k, v in os.environ.items()
           if not k.startswith("CLAUDE") and k not in ("AI_AGENT", "TRACEPARENT")}
    env["CLAUDE_CODE_DISABLE_ADVISOR_TOOL"] = "1"
    return env


def ask_judge(items: list, now: datetime) -> tuple[dict | None, dict]:
    """({item number: (serious, reason)} or None when the judge could not answer, the call's record)."""
    prompt = judge_prompt(items)
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
        for v in body.get("verdicts", []):
            reason = v.get("reason_tr")
            if isinstance(v.get("id"), int) and isinstance(v.get("serious"), bool) and isinstance(reason, str) and reason.strip():
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


def notice_line(count: int) -> str:
    items = "1 serious item waits" if count == 1 else f"{count} serious items wait"
    return f"--- MODEL WATCH: {items} for him — {SCRIPT} --status ---"


def render(sd: Path, seen: dict) -> None:
    models, serious = waiting(seen)
    if models or serious:
        write(sd / "NOTICE.txt", notice_line(len(models) + len(serious)) + "\n")
    elif (sd / "NOTICE.txt").exists():
        (sd / "NOTICE.txt").unlink()


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

    # 2. the guidance sources: what is new, current and not about legacy models only goes on
    catalog = seen.get("catalog", {})
    for name, reader in GUIDANCE.items():
        try:
            items = reader(fetch(urls[name]), urls[name])
            if not items:
                raise Nothing("the page was read but no item was found on it")
        except Exception as e:
            failed(name, e)
            continue
        succeeded(name, len(items))
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
            why = irrelevant(it, catalog)
            if why:
                skipped += 1
                log(sd, now, f"SKIPPED {name}: {it['title']} ({why}) — {it['url']}")
                continue
            pending["guidance"].append({"source": name, "key": it["key"], "title": it["title"], "url": it["url"],
                                        "date": when, "first_run": first, "excerpt": it.get("excerpt", ""),
                                        "serious": None})
            goes += 1
        report.append(f"{name}: ok — {len(items)} items read — {'baseline' if first else 'new'}: {goes} to the judge, "
                      f"{skipped} skipped (legacy, or fixes only), {old} older than {CURRENT_DAYS} days"
                      + (" (undated items at a baseline are recorded silently)" if first and name == "docs" else ""))

    # 3. the judge: every item not yet judged, in one call
    judge = last.get("judge")
    unjudged = [g for g in pending["guidance"] if g.get("serious") is None]
    if unjudged:
        verdicts, judge = ask_judge(unjudged, now)
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

    if json.dumps(seen, sort_keys=True) != before:
        save_seen(sd, seen)
    write(sd / "last-check.json", json.dumps({"time": stamp, "sources": records, "judge": judge}, indent=2) + "\n")
    rows = []
    for name, rec in records.items():
        why = rec["error"] or "no check has run since"
        rows.append("\t".join([name, SOURCES[name][1], str(rec["last_ok_epoch"] or 0), (rec["last_ok"] or "never")[:10], why]))
    write(sd / "sources.tsv", "\n".join(rows) + "\n")
    render(sd, seen)
    models, serious = waiting(seen)
    log(sd, now, "checked: " + " · ".join(f"{n} {'ok ' + str(r['count']) if r['ok'] else 'FAILED'}" for n, r in records.items())
        + f" · waiting for him: {len(models) + len(serious)}")
    print("\n".join(report + [f"opening: {notice_line(len(models) + len(serious)) if models or serious else '(nothing)'}"]))
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
    models, serious = waiting(seen)
    pinned = settings()["model"] or 'not set (no "model" in ~/.claude/settings.json)'
    print(f"waiting for him: {len(models) + len(serious) or 'nothing'}")
    for p in models:
        print(f"  - NEW MODEL ID {p['id']} (first seen {p['first_seen']}, {p['url']}). The pinned model is {pinned}. "
              "His order (2026-09-24): review the model together with him first; the prompt audit starts only on "
              f"his OK; ~/.claude/settings.json moves to it only when he says \"geç\". Clear with: {SCRIPT} --ack {p['id']}")
    for g in sorted(serious, key=lambda g: g["date"], reverse=True):
        mark = ", current at first run" if g.get("first_run") else ""
        print(f"  - {g['source']} ({g['date']}{mark}): {g['title']} — {g['url']}\n      {g.get('reason_tr', '')}")
    if serious:
        print(f"  Tell him; review it together with him; nothing is applied without his OK. Clear with: {SCRIPT} --ack-guidance")
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
    now = datetime.now().astimezone()
    seen = load(sd / "seen.json", {})
    pending = seen.get("pending", {"models": [], "guidance": []})
    if model_id is None:
        keep = [g for g in pending.get("guidance", []) if g.get("serious") is not True]
        what = f"{len(pending.get('guidance', [])) - len(keep)} serious guidance item(s)"
        pending["guidance"] = keep                # what the judge has not seen stays, for the judge
    else:
        keep = [p for p in pending.get("models", []) if p["id"] != model_id]
        if len(keep) == len(pending.get("models", [])):
            ids = ", ".join(p["id"] for p in pending.get("models", [])) or "none"
            print(f"{model_id} is not waiting for him (new model ids waiting: {ids})", file=sys.stderr)
            return 1
        pending["models"] = keep
        what = model_id
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
