#!/usr/bin/env python3
"""THE CLAIM LEDGER — every claim of an answer stands on rows the machine counted (B56 K2 §2.2).

WHY. The K1 answer of 2026-09-26 (kept: .planning/research/answers/20260926-1608-astra-6-vs-fable-5-1-
k1-live-run/) cites 150 ids on 49 lines, and nothing could say how many PEOPLE stand behind a line: its
line 66 cites six rows by six authors, five of them in ONE Reddit thread (1w9h3zh); 12 of the 150 ids
are addresses a hunter had read and judged `none` (L1071 on line 71: "benchmark/promo, no user
preference"). So every line that cites is a CLAIM whose rows are counted here — independent sources by
author, threads by address, only rows the ledger ADMITS (evidence.admissible) — with its counter-evidence
beside it. A hunter is sent after every claim that stands on rows but has no counter-evidence, and
after every claim that stands on one source; what it finds is LINKED here, never written into prose,
and the writer's second pass is handed the result (`brief`).

  claims.py extract <run> [--answer F] [--out F] [--keep-links FROM]
  claims.py list <run> --todo counter|gap [--cap 20] [--candidates 5] [--ledger F]
  claims.py link <run> --claim C007 (--against L1[,L2…] | --for L3 | --none --kind counter|gap --reason R)
                 --by ROLE [--ledger F]
  claims.py status <run> [--format md|json] [--ledger F] [--answer F] [--transcript F --role R --round N]
  claims.py brief <run> [--ledger F]
  claims.py reads <run> --role R --round N [--transcript F] [--ledger F] [--format md|json]

The contract (fields, the pair rule, independence, flags, outputs, exit codes) is
EVIDENCE-B56-K2-2026-09-26.md §2.2; fleet/fleet.sh, scripts/render.py and scripts/kapsama.py are built
against it, and render.py and kapsama.py import `extract_claims`, `sides` and `source_key` from here.
WHICH LEDGER: extract writes --out (default <run>/claims.jsonl). list, link, status and brief work on
--ledger; without it, on <run>/claims.draft.jsonl when the fleet's draft pass wrote one (its claim rounds
link there, contract §2.3), else on <run>/claims.jsonl. Every write happens under the run's evidence
lock (evidence.locked): the claim hunters write at once.

THE WRITER'S LAST SECTION (the CEO's word, 2026-09-26 ~19:45: "kanıt 43 · cevapta 17"): `## Alınmayan
kanıt`, one line per admitted address the answer does not cite, with its reason (fleet/writer-prompt.md
rule 10). Its lines are no claim and its ids no citation: extract never reads them, and render.py and
kapsama.py read the answer without them (without_unused). extract's last line and `status --format json`
count the admitted addresses (evidence_use) the answer neither cites nor names there — `unexplained-evidence
N` / "unexplained_evidence": N, for any ledger: status reads --answer when given, else the ledger's own
answer beside it (claims.jsonl ↔ answer.md, claims.draft.jsonl ↔ answer.draft.md), else <run>/answer.md,
and says null only when that answer or the rows cannot be read.

THE ANSWER'S SUB-QUESTIONS (B56 K3 stage 1, the CEO's word on the K3 plan, 2026-09-26 23:05): when the fleet split
his question (scripts/split.py), the answer's sections are headed `## S1 — <title>` (fleet/writer-prompt.md rule
11). A claim's `section` is the S-id of the section it stands in — "S0" for the verdict and whatever stands outside
a sub-question (before the first S-heading, or under a section of the writer's own), "" when the answer has no
S-heading. extract's last line ends `· sections k`, the distinct sub-questions its claims stand in; `status --format
json` carries "sections", per sub-question its claims, the distinct admitted rows they stand on, the independent
sources among those and the admitted counter rows (sub_counts — render.py's heading line and kapsama.py's second
table count by it), when the ledger's claims carry S-ids.

Exit: 0 done · 1 status: no ledger to count · 2 refused (a folder, an answer or a ledger that cannot be
read, an unknown claim or id, an inadmissible id, a link the rules forbid, a bad argument).
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import unicodedata
from pathlib import Path

sys.dont_write_bytecode = True     # the skill folder is read-only inside a hunter's jail
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import evidence  # noqa: E402  — the rows, their addresses, the one admissibility rule and the lock
import platforms  # noqa: E402  — CITE_RE and split_paired: one owner of what a citation is

ID = re.compile(r"L\d{4}")
H2 = re.compile(r"^##(?!#)\s*(.*?)\s*#*\s*$")
# A TABLE'S SEPARATOR ROW (|---|:--:|) and so, the line above it, its header: neither is a claim. A
# separator must hold a pipe, or a horizontal rule (---) would make the line above it a "header".
SEP_ROW = re.compile(r"^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$")
LIST_MARK = re.compile(r"^\s*(?:>\s*)*(?:#{1,6}\s+|[-*+•]\s+|\d{1,3}[.)]\s+)?")
# INDEPENDENCE (§2.2): a name that says who the author is NOT — "HN commenter", "blog author (via
# Google)", "alpaca-23 (news digest)", "unknown", all four in the K1 ledger — is no author at all, and
# the row is then its own source by its address. Matched anywhere in the name, as the contract spells it.
GENERIC = re.compile(r"commenter|author|user|anonymous|unknown|anon|redditor|digest|via |blog", re.I)
TEXT_CHARS = 300
BRIEF_CHARS = 200
TABLE_CHARS = 60
LIST_PASSAGE = 160
STATUS = ("unchecked", "sent", "found", "none", "not-sent (cap)")
TALLY = (("todo", "unchecked"), ("sent", "sent"), ("found", "found"), ("none", "none"), ("cap", "not-sent (cap)"))
STATUS_KEY = {"counter": "counter_status", "gap": "gap_status"}
NOTE_OF = {"counter": "karsi", "gap": "bosluk"}
REASON_WORDS = 12
CONTENT_WORD = re.compile(r"[^\W\d_]{4,}")
# THE WRITER'S LAST SECTION (fleet/writer-prompt.md rule 10): its heading, folded; the dash before a reason
UNUSED = "alınmayan kanıt"
REASON_LEAD = re.compile(r"^[\s\-–—:·]+")
# THE ANSWER'S SUB-QUESTIONS (B56 K3): a heading `## S1 — <title>` opens sub-question S1's section, and a sub-question
# no row speaks to holds the one line GAP (fleet/writer-prompt.md rule 11)
SUB_HEAD = re.compile(r"^S([1-9]\d?)\s*[—–-]\s*(\S.*)$")
SUB_ID = re.compile(r"S[1-9]\d?")
GAP = "Bu alt soruya satır yok."
SHAPE_HEAD = re.compile(r"^[Şş]ekil\s*[—–-]\s*\S")    # the research type's block, `## Şekil — <name>` (K3 stage 2)


def _uniq(ids) -> list[str]:
    return list(dict.fromkeys(ids))


def _cut(s: str, n: int) -> str:
    return s if len(s) <= n else s[:n - 1].rstrip() + "…"


def _canon(row: dict) -> str:
    return row.get("url_canonical") or platforms.canonical_url(row.get("url") or "")


def _platform(row: dict) -> str:
    p = row.get("platform")
    return p if p in platforms.PLATFORMS else platforms.platform_of(_canon(row))


def _domain(row: dict) -> str:
    return row.get("domain") or evidence.rlib.registrable_domain(_canon(row))


# =================================================================== a line: its sides, its words
def sides(line: str) -> tuple[list[str], list[str]]:
    """(support ids, counter ids) of one answer line — THE PAIR RULE, one owner (render.py and kapsama.py
    read sides through here). `[A ↔ B]` is first the two citations it is (platforms.split_paired). No ↔:
    every citation supports. Exactly one ↔ with ≥ 1 citation on each side of it — adjacent, `[A] ↔ [B]`,
    or with prose between, `… [L1533] ↔ … [L1681]` (the K1 answer's line 69): left supports, right is
    counter. Exactly one ↔ with citations on one side only: that ↔ is prose, everything supports. Two or
    more ↔: every citation right of a ↔ and before the next ↔ is counter — so everything after the
    first ↔, and the citations before it support. An id on both sides counts once, as support."""
    s = platforms.split_paired(line or "")
    cites = [(m.start(), ID.findall(m.group(0))) for m in platforms.CITE_RE.finditer(s)]
    every = _uniq(i for _at, ids in cites for i in ids)
    arrows = [m.start() for m in re.finditer("↔", s)]
    if not arrows:
        return every, []
    first = arrows[0]
    left = _uniq(i for at, ids in cites if at < first for i in ids)
    right = [i for i in _uniq(i for at, ids in cites if at > first for i in ids) if i not in left]
    if len(arrows) == 1 and not (left and right):
        return every, []
    return left, right


def claim_text(line: str) -> str:
    """The line without its citations and without markdown decor, ≤ 300 characters: a table row's cells
    joined by ` · `, a list mark, a heading's #, bold, italic and code marks gone, and a ↔ left with no
    words on one side (`… yalanlıyor. [A] ↔ [B]`) dropped — the ↔ between two half-sentences stays."""
    s = platforms.CITE_RE.sub(" ", platforms.split_paired(line or ""))
    if s.lstrip().startswith("|"):
        s = " · ".join(c.strip() for c in s.strip().strip("|").split("|") if c.strip())
    s = LIST_MARK.sub("", s, count=1)
    s = s.replace("**", "").replace("__", "").replace("`", "")
    s = re.sub(r"(?<![\w*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?![\w*])", r"\1", s)
    s = re.sub(r"(?<![\w_])_(?!\s)([^_\n]+?)(?<!\s)_(?![\w_])", r"\1", s)
    s = re.sub(r"\s*↔\s*(?=[.,;:!?)]|\s*$)", "", s)
    s = re.sub(r"(^|\()\s*↔\s*", r"\1", s)
    s = re.sub(r"\(\s*\)", "", s)
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"\s+([.,;:!?)])", r"\1", s).strip()
    return _cut(s, TEXT_CHARS)


def _fold_author(a: str) -> str:
    s = unicodedata.normalize("NFKC", a).strip()
    s = re.sub(r"^(?:@|/?u/)", "", s)
    return re.sub(r"\s+", " ", s).casefold().strip()


def source_key(row: dict) -> str:
    """One independent source: `<platform> @<author folded>` when the author is a real name — not
    None / '' / '?' / '-', not GENERIC —, else the row's url_canonical. It under-counts one person with
    two accounts; the page's footer says so."""
    raw = row.get("author")
    a = _fold_author(raw) if isinstance(raw, str) else ""
    if a and a not in ("?", "-") and not GENERIC.search(unicodedata.normalize("NFKC", raw)):
        return f"{_platform(row)} @{a}"
    return _canon(row)


def content_words(text: str) -> set[str]:
    """Words of ≥ 4 letters, folded: case, accents and the Turkish dotless i."""
    s = unicodedata.normalize("NFKD", (text or "").replace("ı", "i").replace("İ", "i").casefold())
    return set(CONTENT_WORD.findall("".join(ch for ch in s if not unicodedata.combining(ch))))


# =================================================================== the writer's last section
def _folded(s: str) -> str:
    """A heading compared as words, Turkish capitals folded the Turkish way (I → ı, İ → i)."""
    return " ".join(s.replace("I", "ı").replace("İ", "i").casefold().split())


def unused_section(md: str) -> tuple[set[int], dict[str, str]]:
    """The answer's `## Alınmayan kanıt` section: the numbers of its lines — from that heading, its own line
    included, to the next `## ` heading or the end — and each id it lists in a citation bracket with its
    line's reason: the line without its ids, its list mark and the dash before the words (the first line
    that lists an id wins). Those lines are no claim, and an id on them is no citation."""
    at: set[int] = set()
    why: dict[str, str] = {}
    inside = False
    for n, line in enumerate((md or "").splitlines(), 1):
        h = H2.match(line)
        if h:
            inside = _folded(claim_text(h.group(1))) == UNUSED
        if not inside:
            continue
        at.add(n)
        said = REASON_LEAD.sub("", claim_text(line))
        for m in platforms.CITE_RE.finditer(platforms.split_paired(line)):
            for i in ID.findall(m.group(0)):
                why.setdefault(i, said)
    return at, why


def without_unused(md: str) -> str:
    """The answer with its `## Alınmayan kanıt` section's lines emptied, each keeping its line end — so every
    other line keeps the number the ledger and the page anchor it by; the answer itself when it has none."""
    at = unused_section(md)[0]
    if not at:
        return md
    out = []
    for n, line in enumerate(md.splitlines(True), 1):
        words = line.splitlines()[0] if n in at else ""
        out.append(line[len(words):])
    return "".join(out)


def evidence_use(md: str, rows: list[dict]) -> dict[str, dict]:
    """THE ADMITTED ADDRESSES and what the answer did with each (the CEO's word, 2026-09-26 ~19:45). An
    address — url_canonical, else its url's canonical form (evidence.by_canon) — is admitted when
    evidence.admissible admits ≥ 1 of its rows: what `evidence.py writer-rows` hands the writer, by address.
    canon -> {"platform", "ids" (every row id at it), "cited", "reason"}: `cited` when the answer, its
    `## Alınmayan kanıt` section left out, cites an admitted id there (kapsama.py's Cevapta rule); `reason`
    the section's words for the first of its ids listed there — None when none is: not explained."""
    body = platforms.split_paired(without_unused(md or ""))
    cites = {i for m in platforms.CITE_RE.finditer(body) for i in ID.findall(m.group(0))}
    why = unused_section(md)[1]
    index = evidence.address_index(rows)
    out: dict[str, dict] = {}
    for canon, rs in evidence.by_canon(rows).items():
        addr = evidence.address_row(rs)
        ids = [str(r["id"]) for r in rs if r.get("id")]
        admitted = [str(r["id"]) for r in rs if r.get("id") and evidence.admissible(r, index.get(str(r["id"])))[0]]
        if not canon or addr is None or not admitted:
            continue
        listed = [i for i in why if i in ids]
        out[canon] = {"platform": evidence.row_platform(addr, canon), "ids": ids,
                      "cited": any(i in cites for i in admitted), "reason": why[listed[0]] if listed else None}
    return out


def unexplained(use: dict[str, dict]) -> int:
    """The admitted addresses the answer neither cites nor names in its `## Alınmayan kanıt` section."""
    return sum(1 for a in use.values() if not a["cited"] and a["reason"] is None)


# =================================================================== the sub-questions
def sub_heading(title: str) -> tuple[str, str] | None:
    """A `## ` heading's text as a sub-question's: `S1 — <title>` → ("S1", "<title>"); None for any other heading."""
    m = SUB_HEAD.match(claim_text(title))
    return (f"S{m.group(1)}", m.group(2)) if m else None


def shape_heading(title: str) -> bool:
    """A `## ` heading's text as the research type's block (fleet/shapes/, B56 K3 stage 2): `Şekil — <name>`."""
    return bool(SHAPE_HEAD.match(claim_text(title)))


def is_gap(line: str) -> bool:
    """The line a sub-question no row speaks to holds, `Bu alt soruya satır yok.` — list mark, decor and the full
    stop aside. A line that cites is a claim, whatever it says."""
    s = platforms.split_paired(line or "")
    return not platforms.CITE_RE.search(s) and _folded(claim_text(s)).rstrip(".") == _folded(GAP).rstrip(".")


def sub_sections(md: str) -> dict[str, dict]:
    """The answer's sub-question sections in order: S-id -> {"title", "line" (its heading's), "gap" (the section
    holds the GAP line)}; a section runs from its `## S<n> — ` heading to the next `## ` heading. Empty when the
    answer has none (rule 11 did not apply, or the writer dropped them all)."""
    out: dict[str, dict] = {}
    here: dict | None = None
    for n, line in enumerate((md or "").splitlines(), 1):
        h = H2.match(line)
        if h:
            s = sub_heading(h.group(1))
            here = out.setdefault(s[0], {"title": s[1], "line": n, "gap": False}) if s else None
        elif here is not None and is_gap(line):
            here["gap"] = True
    return out


def sub_counts(claims: list[dict], rows: dict[str, dict]) -> dict[str, dict]:
    """Per sub-question, in S-order, the claims whose `section` is its S-id (S0 is no sub-question) — the research
    type's block first, under "SHAPE" (K3 stage 2): {"claims": n,
    "rows": the distinct admitted rows they stand on, "sources": the independent sources among those rows
    (source_key), "counter": the distinct admitted rows on their counter side}. `rows` is the ledger by id."""
    acc: dict[str, tuple[list, set, set]] = {}
    for c in claims:
        s = c.get("section")
        if not (isinstance(s, str) and (SUB_ID.fullmatch(s) or s == "SHAPE")):
            continue
        bad = set(c.get("inadmissible") or [])
        n, sup, cou = acc.setdefault(s, ([0], set(), set()))
        n[0] += 1
        sup.update(i for i in c.get("support") or [] if i not in bad)
        cou.update(i for i in c.get("counter") or [] if i not in bad)
    first = lambda kv: -1 if kv[0] == "SHAPE" else int(kv[0][1:])  # noqa: E731 — the research type's block, then S1…
    return {s: {"claims": n[0], "rows": len(sup), "sources": len({source_key(rows[i]) for i in sup if i in rows}),
                "counter": len(cou)} for s, (n, sup, cou) in sorted(acc.items(), key=first)}


# =================================================================== extract
def _counted(ids: list[str], rows: dict[str, dict], index: dict, bad: list[str]) -> list[dict]:
    """The admitted rows among `ids`; a refused or unknown id goes to `bad` and is counted in nothing."""
    out = []
    for i in ids:
        r = rows.get(i)
        if r is not None and evidence.admissible(r, index.get(i))[0]:
            out.append(r)
        elif i not in bad:
            bad.append(i)
    return out


def extract_claims(md: str, rows: dict[str, dict]) -> list[dict]:
    """Every line, list item or table body row of `md` that cites ≥ 1 row — never a table's header or
    separator row, never a line of the `## Alınmayan kanıt` section — as a claim, in order: C001, C002, …
    `rows` is the ledger by id (every row, so each quote row finds its address). The counts are over
    ADMITTED rows only (evidence.admissible). `section` is the S-id of the sub-question section the claim
    stands in: "S0" outside every one, "" when the answer has no S-heading (B56 K3); "SHAPE" under `## Şekil — `."""
    index = evidence.address_index(list(rows.values()))
    lines = (md or "").splitlines()
    unused = unused_section(md)[0]
    out: list[dict] = []
    outside = "S0" if sub_sections(md) else ""
    section, headed = outside, False
    for n, line in enumerate(lines, 1):
        if n in unused:
            continue
        h = H2.match(line)
        if h:
            sub = sub_heading(h.group(1))
            section, headed = sub[0] if sub else "SHAPE" if shape_heading(h.group(1)) else outside, True
        if "|" in line and SEP_ROW.match(line):
            continue
        if line.lstrip().startswith("|") and n < len(lines) and "|" in lines[n] and SEP_ROW.match(lines[n]):
            continue
        sup, cou = sides(line)
        if not sup and not cou:
            continue
        bad: list[str] = []
        a_sup, a_cou = _counted(sup, rows, index, bad), _counted(cou, rows, index, bad)
        sources = len({source_key(r) for r in a_sup})
        thin = sources < 2 and len(a_sup) >= 1
        out.append({
            "id": "C%03d" % (len(out) + 1), "line": n, "section": section, "text": claim_text(line),
            "kind": "claim" if headed else "verdict", "support": sup, "counter": cou, "inadmissible": bad,
            "rows": len(a_sup), "sources": sources, "threads": len({_canon(r) for r in a_sup}),
            "domains": len({_domain(r) for r in a_sup}), "counter_rows": len(a_cou),
            "counter_sources": len({source_key(r) for r in a_cou}),
            "counter_threads": len({_canon(r) for r in a_cou}), "thin": thin,
            "counter_status": "unchecked" if len(a_sup) >= 2 and not a_cou else "-",
            "gap_status": "unchecked" if thin else "-",
            "links": [], "notes": [], "checked_by": None,
        })
    return out


def carry(new: list[dict], old: list[dict]) -> int:
    """--keep-links: an old claim's check lands on the new claim whose `support` overlaps its own by
    ≥ 50 % (Jaccard on ids), the best pair first, one old to one new. `links`, `notes` and `checked_by`
    are copied, and a status the rounds set (sent · found · none · not-sent (cap)) — an extract's own
    `unchecked` or `-` never overwrites the new claim's. Returns the claims carried that had been
    CHECKED (a link, a note or a checker): a claim only sent, or held back by the cap, is not counted."""
    pairs = []
    for oi, o in enumerate(old):
        a = set(o.get("support") or [])
        for ni, c in enumerate(new):
            b = set(c.get("support") or [])
            if a and b and len(a & b) / len(a | b) >= 0.5:
                pairs.append((-len(a & b) / len(a | b), oi, ni))
    used_old, used_new, carried = set(), set(), 0
    for _j, oi, ni in sorted(pairs):
        if oi in used_old or ni in used_new:
            continue
        used_old.add(oi)
        used_new.add(ni)
        o, c = old[oi], new[ni]
        for k in STATUS_KEY.values():
            if o.get(k) in STATUS[1:]:
                c[k] = o[k]
        c.update(links=list(o.get("links") or []), notes=list(o.get("notes") or []),
                 checked_by=o.get("checked_by"))
        carried += bool(c["links"] or c["notes"] or c["checked_by"])
    return carried


# =================================================================== the ledger file
def ledger_of(run: Path, given: str | None) -> Path:
    if given:
        return Path(given)
    draft = run / "claims.draft.jsonl"
    return draft if draft.is_file() else run / "claims.jsonl"


def read_ledger(path: Path) -> list[dict] | None:
    """The claims, or None when the file cannot be read; a line that is not a claim is skipped."""
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
    out = []
    for line in text.splitlines():
        try:
            c = json.loads(line)
        except ValueError:
            continue
        if isinstance(c, dict) and c.get("id"):
            out.append(c)
    return out


def write_ledger(path: Path, claims: list[dict]) -> None:
    tmp = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    tmp.write_text("".join(json.dumps(c, ensure_ascii=False) + "\n" for c in claims), encoding="utf-8")
    os.replace(tmp, path)


def _rows(run: Path) -> dict[str, dict]:
    return {str(r["id"]): r for r in evidence.read_rows(run) if r.get("id")}


def tally(claims: list[dict]) -> dict:
    """The ledger's counts. `inadmissible_cited` counts the refused ids the answer cites, each once —
    render.py's "İddia defteri" footer and kapsama.py's İDDİA line count the same (one rule, the lead's
    ruling on the K2 verifier's report: the K1 answer cites 12 refused ids on 8 claims, and says 12)."""
    return {"claims": len(claims), "verdict": sum(c.get("kind") == "verdict" for c in claims),
            "thin": sum(bool(c.get("thin")) for c in claims),
            "counter_less": sum(not c.get("counter_rows") for c in claims),
            "counter": {name: sum(c.get("counter_status") == st for c in claims) for name, st in TALLY},
            "gap": {name: sum(c.get("gap_status") == st for c in claims) for name, st in TALLY},
            "inadmissible_cited": len({i for c in claims for i in c.get("inadmissible") or []})}


def cmd_extract(run: Path, answer: Path, out: Path, keep: str | None) -> int:
    try:
        md = answer.read_text(encoding="utf-8", errors="replace")
    except OSError as e:
        print(f"REFUSED the answer cannot be read: {answer} ({type(e).__name__})")
        return 2
    if not evidence.ev_path(run).is_file():
        print(f"REFUSED the ledger cannot be read: {evidence.ev_path(run)}")
        return 2
    rows = _rows(run)
    claims = extract_claims(md, rows)
    carried = 0
    with evidence.locked(run):
        if keep:
            old = read_ledger(Path(keep))
            if old is None:
                print(f"REFUSED --keep-links: the claim ledger cannot be read: {keep}")
                return 2
            carried = carry(claims, old)
        write_ledger(out, claims)
    print("| id | satır | kaynak | başlık | karşı | durum | text |")
    print("|---|---:|---:|---:|---:|---|---|")
    for c in claims:
        print(f"| {c['id']} | {c['rows']} | {c['sources']} | {c['threads']} | {c['counter_rows']} | "
              f"karşı {c['counter_status']} · boşluk {c['gap_status']} | {_cut(c['text'], TABLE_CHARS).replace('|', '/')} |")
    t = tally(claims)
    print(f"CLAIMS: {t['claims']} · verdict {t['verdict']} · thin {t['thin']} · counter-less {t['counter_less']}"
          f" · inadmissible-cited {t['inadmissible_cited']} · carried {carried}"
          f" · unexplained-evidence {unexplained(evidence_use(md, list(rows.values())))}"
          f" · sections {len({c['section'] for c in claims if SUB_ID.fullmatch(c['section'])})}")
    return 0


# =================================================================== list — the sending
# A CLAIM THE CAP HELD BACK IS TODO AGAIN (B56, 2026-09-27). `not-sent (cap)` was a dead end: nothing ever
# listed it again, so on the run of 2026-09-27 08:19 (claims 49) karsi's list sent 20 and held 8 and bosluk's
# sent 20 and held 5, and those 13 were never sent to anyone. Now the next list sends them — each list sends the
# next `cap`, in the same order — and a claim already `sent`, `found` or `none` is never listed again.
TODO_STATUS = ("unchecked", "not-sent (cap)")


def is_todo(c: dict, kind: str) -> bool:
    if kind == "counter":
        return (c.get("counter_status") in TODO_STATUS and (c.get("rows") or 0) >= 2
                and not c.get("counter_rows"))
    return bool(c.get("thin")) and c.get("gap_status") in TODO_STATUS


def cmd_list(run: Path, ledger: Path, kind: str, cap: int, candidates: int) -> int:
    """The claims a hunter works, and the sending WRITTEN: todo in order (verdict first, then rows,
    most first), the first `cap` become `sent`, the rest `not-sent (cap)` — todo again for the next list."""
    key = STATUS_KEY[kind]
    with evidence.locked(run):
        claims = read_ledger(ledger)
        if claims is None:
            print(f"REFUSED no claim ledger: {ledger}")
            return 2
        todo = sorted((c for c in claims if is_todo(c, kind)),
                      key=lambda c: (c.get("kind") != "verdict", -(c.get("rows") or 0)))
        sent, held = todo[:cap], todo[cap:]
        for c in sent:
            c[key] = "sent"
        for c in held:
            c[key] = "not-sent (cap)"
        if todo:
            write_ledger(ledger, claims)
    rows = _rows(run)
    index = evidence.address_index(list(rows.values()))
    pool: list[tuple[set, dict]] = []
    if candidates > 0 and sent:
        pool = [(content_words(r.get("passage")), r) for i, r in sorted(rows.items())
                if evidence.admissible(r, index.get(i))[0]]
    for c in sent:
        print(f"### {c['id']} | rows {c.get('rows', 0)} · sources {c.get('sources', 0)} · threads "
              f"{c.get('threads', 0)} · counter {c.get('counter_rows', 0)} | {c.get('text', '')}")
        print("dayanak:")
        for i in c.get("support") or []:
            if i in rows and i not in (c.get("inadmissible") or []):
                print("  " + evidence.writer_line(rows[i], LIST_PASSAGE, url=False))
        if candidates > 0:
            on = set(c.get("support") or []) | set(c.get("counter") or []) | {x.get("id") for x in c.get("links") or []}
            words = content_words(c.get("text"))
            near = sorted(((len(words & w), r) for w, r in pool if r["id"] not in on and len(words & w) >= 3),
                          key=lambda x: (-x[0], x[1]["id"]))[:candidates]
            print("adaylar (defterde, bağlanmamış):")
            for _n, r in near:
                print("  " + evidence.writer_line(r, LIST_PASSAGE, url=False))
            if not near:
                print("  (yok)")
        print()
    tail = f"LIST: {kind} sent {len(sent)} · not-sent (cap) {len(held)}"
    print(tail + (" · nothing to send" if not todo else ""))
    return 0


# =================================================================== link — what a hunter found
def cmd_link(run: Path, ledger: Path, cid: str, against: str | None, for_ids: str | None, none: bool,
             kind: str | None, reason: str | None, by: str) -> int:
    by = by.strip()
    if not by:
        print("REFUSED --by is empty: name the role that checked")
        return 2
    if none and not kind:
        print("REFUSED --none needs --kind counter|gap")
        return 2
    why = " ".join((reason or "").split()[:REASON_WORDS])
    if none and not why:
        print("REFUSED --none needs --reason (≤ 12 words)")
        return 2
    with evidence.locked(run):
        claims = read_ledger(ledger)
        if claims is None:
            print(f"REFUSED no claim ledger: {ledger}")
            return 2
        c = next((x for x in claims if x.get("id") == cid), None)
        if c is None:
            print(f"REFUSED unknown claim: {cid}")
            return 2
        if none:
            key, note = STATUS_KEY[kind], f"{NOTE_OF[kind]}: {why}"
            if c.get(key) != "found":                 # a link already found stands
                c[key] = "none"
            if note not in (c.get("notes") or []):
                c["notes"] = (c.get("notes") or []) + [note]
            c["checked_by"] = by
            write_ledger(ledger, claims)
            print(f"OK {cid} {key} {c[key]} · not: {note}")
            return 0
        link_kind, key = ("against", "counter_status") if against is not None else ("for", "gap_status")
        ids = [x for x in re.split(r"[,\s]+", against if against is not None else for_ids or "") if x]
        if not ids:
            print(f"REFUSED --{'against' if against is not None else 'for'} names no id")
            return 2
        rows = _rows(run)
        index = evidence.address_index(list(rows.values()))
        support = set(c.get("support") or [])
        linked = {x.get("id") for x in c.get("links") or [] if x.get("kind") == link_kind}
        keys = {source_key(rows[i]) for i in support - set(c.get("inadmissible") or []) if i in rows}
        keys |= {source_key(rows[i]) for i in linked if i in rows} if link_kind == "for" else set()
        new: list[str] = []
        for i in _uniq(ids):
            r = rows.get(i) if ID.fullmatch(i) else None
            if r is None:
                print(f"REFUSED unknown id: {i}")
                return 2
            ok, refusal = evidence.admissible(r, index.get(i))
            if not ok:
                print(f"REFUSED {i}: {refusal}")
                return 2
            if i in support:
                print(f"REFUSED {i}: already in {cid}'s support")
                return 2
            if i in linked:
                continue                              # idempotent: the same link twice is one link
            if link_kind == "for":
                k = source_key(r)
                if k in keys:
                    print(f"REFUSED {i}: aynı kaynak: {k}")
                    return 2
                keys.add(k)
            new.append(i)
        at = evidence.now()
        c["links"] = (c.get("links") or []) + [{"kind": link_kind, "id": i, "by": by, "at": at} for i in new]
        c[key] = "found"
        c["checked_by"] = by
        write_ledger(ledger, claims)
    print(f"OK {cid} {key} found · +{len(new)} {link_kind}" + (f": {', '.join(new)}" if new else " (already linked)"))
    return 0


# =================================================================== status and brief
def answer_of(run: Path, ledger: Path, given: str | None) -> Path:
    """The answer status counts `unexplained_evidence` over: --answer when given; else the one the ledger was
    extracted from, by the fleet's names beside it — claims.jsonl ↔ answer.md, claims.draft.jsonl ↔
    answer.draft.md — when it is there; else <run>/answer.md."""
    if given:
        return Path(given)
    m = re.fullmatch(r"claims(.*)\.jsonl", ledger.name)
    own = ledger.with_name(f"answer{m.group(1)}.md") if m else None
    return own if own is not None and own.is_file() else run / "answer.md"


def unexplained_of(run: Path, answer: Path) -> int | None:
    """status's `unexplained_evidence` over `answer` and <run>'s rows; None — not measured — only when the
    answer or the rows cannot be read."""
    try:
        md = answer.read_text(encoding="utf-8", errors="replace")
        if not evidence.ev_path(run).is_file():
            return None
        rows = _rows(run)
    except OSError:
        return None
    return unexplained(evidence_use(md, list(rows.values())))


def cmd_status(run: Path, ledger: Path, fmt: str, answer: str | None = None,
               reads: tuple[str, int, Path] | None = None) -> int:
    """`reads` (role, round, transcript) — the fleet's claim gate hands it — adds `unread_links` to the json:
    the claims that role closed in that round with no read (claim_reads); null when the transcript cannot be read."""
    claims = read_ledger(ledger)
    if claims is None:
        print(f"no claim ledger: {ledger}")
        return 1
    t = tally(claims)
    if fmt == "json":
        t.update(owed_counter=t["counter"]["sent"], owed_gap=t["gap"]["sent"],
                 new_for_links=sum(x.get("kind") == "for" for c in claims for x in c.get("links") or []),
                 unexplained_evidence=unexplained_of(run, answer_of(run, ledger, answer)))
        if any(isinstance(c.get("section"), str) and re.fullmatch(r"S\d+", c["section"]) for c in claims):
            t["sections"] = sub_counts(claims, _rows(run))          # the answer has S-headings (B56 K3)
        if reads is not None:
            r = claim_reads(run, claims, *reads)
            t["unread_links"] = r["unread_links"] if r is not None else None
        print(json.dumps(t, ensure_ascii=False))
        return 0
    part = lambda d: " · ".join(f"{name} {d[name]}" for name, _st in TALLY)  # noqa: E731
    print(f"claims {t['claims']} · verdict {t['verdict']} · thin {t['thin']} · counter: {part(t['counter'])}"
          f" · gap: {part(t['gap'])} · inadmissible-cited {t['inadmissible_cited']}")
    return 0


def brief_line(c: dict) -> str:
    """One claim for the writer's second pass (the template's {{CLAIMS}})."""
    bad = c.get("inadmissible") or []
    links = c.get("links") or []
    sup = [i for i in c.get("support") or [] if i not in bad]
    cou = _uniq([i for i in c.get("counter") or [] if i not in bad]
                + [x.get("id") for x in links if x.get("kind") == "against"])
    new = _uniq(x.get("id") for x in links if x.get("kind") == "for")
    parts = [str(c.get("id")), _cut(c.get("text") or "", BRIEF_CHARS),
             f"dayanak [{', '.join(sup)}] ({c.get('rows', 0)} satır · {c.get('sources', 0)} bağımsız kaynak · "
             f"{c.get('threads', 0)} başlık)", f"karşı [{', '.join(cou)}] ({len(cou)})"]
    if new:
        parts.append(f"yeni kaynak [{', '.join(new)}]")
    notes = []
    if c.get("thin") and not new:
        notes.append("tek kaynak")
    if c.get("counter_status") == "none":
        said = [n[len("karsi: "):] for n in c.get("notes") or [] if str(n).startswith("karsi: ")]
        notes.append("karşı arandı, yok" + (f": {said[-1]}" if said else ""))
    if c.get("counter_status") == "not-sent (cap)":
        notes.append("karşı gönderilmedi (sınır)")
    if bad:
        notes.append(f"kabul edilmeyen (YAZILMAZ): [{', '.join(bad)}]")
    if notes:
        parts.append("not: " + " | ".join(notes))
    return " · ".join(parts)


def cmd_brief(ledger: Path) -> int:
    claims = read_ledger(ledger)
    if claims is None:
        print(f"REFUSED no claim ledger: {ledger}")
        return 2
    print("\n".join(brief_line(c) for c in claims) if claims else "(defterde iddia yok)")
    return 0


# =================================================================== reads — a link counts after a read (K2c F2)
# WHY. On the K2 run of 2026-09-26 the counter hunter's round 1 was ONE Bash call chaining 20 `link` calls —
# 7 --against rows taken from the list's one-line `adaylar`, 13 --none with one reason — no `show`, no search,
# 18 s; the gate asked only whether anything was still owed, and said accepted. So the fleet reads the round's
# transcript (rounds/<role>.r<N>.jsonl, the `claude -p` stream-json it keeps): a READ of a claim is a tool call
# BEFORE the call that links it (its last one in the round) that reads one of the claim's rows — an `adaylar`
# row of the list it was handed, a row it stands on or one it links: it `show`s that row, or an evidence.py
# `fetch` / `batch` / `page` reads that row's address (url_canonical, else url — the --url it fetched, the
# `OK <id>` it wrote, the `### <id> | … | <address>` it printed, page's --id) or writes that row (an id first
# in the ledger after it). A fetch of any other page reads no claim (the lead's tightening, K2c §F2 item 4),
# and a show and a link in one call is no read: the hunter saw nothing before it linked. The claims a round
# answers for: those of the list it was handed (rounds/list-<role>.r<N>.txt) and those its transcript links;
# `unread_links` are those of them the role closed (`checked_by`) with no read.
CLAIM_ID = re.compile(r"\bC\d{3,}\b")
ROW_ID = re.compile(r"\bL\d{4,}\b")
STEP_SPLIT = re.compile(r"\n|;|&&|\|\|?")
LINKED_OK = re.compile(r"^OK (C\d{3,}) (?:counter_status|gap_status) ", re.M)
TRANSCRIPT_NAME = re.compile(r"(.+)\.r(\d+)\.jsonl")
FETCHED_OK = re.compile(r"^OK (L\d{4,}) ", re.M)                       # evidence.py fetch: the row it wrote
PRINTED = re.compile(r"^### (L\d{4,}) \|[^\n]*\| (\S+)$", re.M)          # batch / page: a row and its address
CLOSED_DOOR = re.compile(r"^KAPALI KAPI (\S+)", re.M)                  # fetch: the address that stayed shut
URL_ARG = re.compile(r"--url\s+([\"']?)(\S+?)\1(?=\s|$)")
ID_ARG = re.compile(r"--id\s+[\"']?(L\d{4,})")


def _call(sub: str) -> re.Pattern:
    """A subcommand of evidence.py or claims.py, named or through a variable: `evidence.py" show`, `"$E" fetch`."""
    return re.compile(r"(?:(?:evidence|claims)\.py[\"']?|\$\{?\w+\}?[\"']?)\s+(?:%s)\b(?!\.)" % sub)


SHOW_CALL, LINK_CALL, READ_CALL = _call("show"), _call("link"), _call("fetch|batch|page")


def transcript_calls(path: Path) -> list[dict] | None:
    """The round's tool calls in order — each assistant `tool_use` of the stream-json (a Bash call's command,
    else its input as JSON) with the text its `tool_result` brought back. None: the file cannot be read."""
    try:
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return None
    calls: list[dict] = []
    by_id: dict[str, dict] = {}
    for line in lines:
        try:
            ev = json.loads(line)
        except ValueError:
            continue
        msg = ev.get("message") if isinstance(ev, dict) else None
        for part in (msg.get("content") if isinstance(msg, dict) else None) or []:
            if not isinstance(part, dict):
                continue
            if ev.get("type") == "assistant" and part.get("type") == "tool_use":
                inp = part.get("input")
                cmd = inp["command"] if isinstance(inp, dict) and isinstance(inp.get("command"), str) \
                    else json.dumps(inp, ensure_ascii=False)
                calls.append({"input": cmd, "result": ""})
                by_id[str(part.get("id"))] = calls[-1]
            elif ev.get("type") == "user" and part.get("type") == "tool_result" and str(part.get("tool_use_id")) in by_id:
                got = part.get("content")
                by_id[str(part.get("tool_use_id"))]["result"] += got if isinstance(got, str) else " ".join(
                    str(x.get("text") or "") for x in got if isinstance(x, dict)) if isinstance(got, list) else ""
    return calls


def listed(path: Path) -> dict[str, list[str]] | None:
    """A claim list as `list` printed it: claim id -> the ids of its `adaylar`, in order. None: no such file."""
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
    out: dict[str, list[str]] = {}
    cur, part = None, ""
    for line in text.splitlines():
        m = re.match(r"### (C\d{3,}) \|", line)
        if m:
            cur, part = out.setdefault(m.group(1), []), ""
        elif cur is not None and line.startswith(("dayanak", "adaylar")):
            part = line[:7]
        elif cur is not None and part == "adaylar" and re.match(r"\s+\[L\d{4,}\]", line):
            cur.append(re.match(r"\s+\[(L\d{4,})\]", line).group(1))
    return out


def shown_rows(cmd: str) -> set[str]:
    """The row ids a tool call shows: a call with a `show` in it names them anywhere but in a `link` step."""
    if not SHOW_CALL.search(cmd) or not re.search(r"(?:evidence|claims)\.py", cmd):
        return set()
    return {i for step in STEP_SPLIT.split(cmd) if not LINK_CALL.search(step) for i in ROW_ID.findall(step)}


def read_targets(call: dict, rows: dict[str, dict]) -> tuple[set[str], set[str]]:
    """(the addresses, canonical, and the row ids) an evidence.py fetch / batch / page call read: the --url it
    fetched, the rows its output names — `OK <id>` (fetch wrote it), `### <id> | … | <address>` (batch or page
    printed it), `KAPALI KAPI <address>` — and page's --id. Empty for any other call."""
    cmd, out = call["input"], call["result"]
    if not (READ_CALL.search(cmd) and "evidence.py" in cmd):
        return set(), set()
    steps = [s for s in STEP_SPLIT.split(cmd) if READ_CALL.search(s)]
    urls = {m.group(2) for s in steps for m in URL_ARG.finditer(s)} | set(CLOSED_DOOR.findall(out))
    ids = set(FETCHED_OK.findall(out)) | {i for s in steps for i in ID_ARG.findall(s)}
    for rid, url in PRINTED.findall(out):
        ids.add(rid)
        urls.add(url)
    canons = {platforms.canonical_url(u) for u in urls if u.startswith(("http://", "https://"))}
    return canons | {_canon(rows[i]) for i in ids if i in rows}, ids


def claim_reads(run: Path, claims: list[dict], role: str, rnd: int, transcript: Path) -> dict | None:
    """What the round's transcript read for each claim it answers for (see `reads` above): {"reads": {id: n},
    "linked": [...], "unread_links": [...], "tool_uses": n} — n the distinct rows of the claim shown before its
    link, plus the fetch/batch/page calls before it that read one of its rows. None: the transcript cannot be
    read."""
    calls = transcript_calls(transcript)
    if calls is None:
        return None
    rows = _rows(run)
    targets = [read_targets(call, rows) for call in calls]
    rounds = run / "rounds"
    handed = listed(rounds / f"list-{role}.r{rnd}.txt")
    adaylar = {**(listed(rounds / f"list-{role}.txt") or {}), **(handed or {})}
    last_link: dict[str, int] = {}
    for t, call in enumerate(calls):
        cmd = call["input"]
        ids = set(CLAIM_ID.findall(cmd)) if LINK_CALL.search(cmd) and "claims.py" in cmd else set()
        for cid in ids | set(LINKED_OK.findall(call["result"])):
            last_link[cid] = t
    by_id = {str(c.get("id")): c for c in claims}
    held = sorted(cid for cid in {*(handed or {}), *last_link} if cid in by_id)
    reads: dict[str, int] = {}
    for cid in held:
        c = by_id[cid]
        own = set(adaylar.get(cid) or []) | set(c.get("support") or []) | set(c.get("counter") or []) \
            | {str(x.get("id")) for x in c.get("links") or [] if isinstance(x, dict)}
        at = {_canon(rows[i]) for i in own if i in rows}
        seen, fetched = set(), 0
        end = last_link.get(cid, len(calls))
        for call, (canons, ids) in zip(calls[:end], targets[:end]):
            seen |= shown_rows(call["input"]) & own
            fetched += bool(canons & at or ids & own)
        reads[cid] = len(seen) + fetched
    linked = [cid for cid in held if by_id[cid].get("checked_by") == role]
    return {"reads": reads, "linked": linked, "unread_links": [cid for cid in linked if not reads[cid]],
            "tool_uses": len(calls)}


def cmd_reads(run: Path, ledger: Path, role: str, rnd: int, transcript: Path, fmt: str) -> int:
    claims = read_ledger(ledger)
    if claims is None:
        print(f"REFUSED no claim ledger: {ledger}")
        return 2
    r = claim_reads(run, claims, role, rnd, transcript)
    if r is None:
        print(f"REFUSED the transcript cannot be read: {transcript}")
        return 2
    if fmt == "json":
        print(json.dumps({"role": role, "round": rnd, "transcript": str(transcript), **r}, ensure_ascii=False))
        return 0
    for cid, n in r["reads"].items():
        print(f"{cid} read={n}")
    unread = r["unread_links"]
    print(f"READS: {role} round {rnd} · {r['tool_uses']} tool calls · {len(r['reads'])} claims · linked "
          f"{len(r['linked'])} · read {sum(1 for n in r['reads'].values() if n)} · unread-links {len(unread)}"
          + (f": {' '.join(unread)}" if unread else ""))
    return 0


# =================================================================== the door
def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="claims.py", description="the claim ledger: every claim on counted rows")
    sub = ap.add_subparsers(dest="cmd", required=True)
    ex = sub.add_parser("extract")
    ex.add_argument("run")
    ex.add_argument("--answer", help="default <run>/answer.md")
    ex.add_argument("--out", help="default <run>/claims.jsonl")
    ex.add_argument("--keep-links", dest="keep_links", metavar="FROM")
    li = sub.add_parser("list")
    li.add_argument("run")
    li.add_argument("--todo", required=True, choices=("counter", "gap"))
    li.add_argument("--cap", type=int, default=20,
                    help="claims sent by this list; the rest are held (not-sent (cap)) and sent by the next list")
    li.add_argument("--candidates", type=int, default=5, help="0: no candidates")
    li.add_argument("--ledger")
    lk = sub.add_parser("link")
    lk.add_argument("run")
    lk.add_argument("--claim", required=True)
    what = lk.add_mutually_exclusive_group(required=True)
    what.add_argument("--against", help="L0001[,L0002…]")
    what.add_argument("--for", dest="for_ids", help="L0003")
    what.add_argument("--none", action="store_true")
    lk.add_argument("--kind", choices=("counter", "gap"))
    lk.add_argument("--reason")
    lk.add_argument("--by", required=True)
    lk.add_argument("--ledger")
    st = sub.add_parser("status")
    st.add_argument("run")
    st.add_argument("--format", choices=("md", "json"), default="md")
    st.add_argument("--ledger")
    st.add_argument("--answer", help="unexplained_evidence over this answer; default: the ledger's own "
                                     "(claims.jsonl ↔ answer.md) when it is there, else <run>/answer.md")
    st.add_argument("--transcript", help="a claim round's stream-json: the json gains unread_links (reads)")
    st.add_argument("--role", help="with --transcript; default: the transcript's name, <role>.r<N>.jsonl")
    st.add_argument("--round", dest="rnd", type=int, help="with --transcript; default: the transcript's name")
    rd = sub.add_parser("reads")
    rd.add_argument("run")
    rd.add_argument("--role", required=True)
    rd.add_argument("--round", dest="rnd", type=int, required=True)
    rd.add_argument("--transcript", help="default <run>/rounds/<role>.r<N>.jsonl")
    rd.add_argument("--ledger")
    rd.add_argument("--format", choices=("md", "json"), default="md")
    br = sub.add_parser("brief")
    br.add_argument("run")
    br.add_argument("--ledger")
    args = ap.parse_args(argv)

    run = Path(args.run)
    if args.cmd == "status":
        reads = None
        if args.transcript:
            named = TRANSCRIPT_NAME.fullmatch(Path(args.transcript).name)
            role = args.role or (named.group(1) if named else None)
            rnd = args.rnd if args.rnd is not None else (int(named.group(2)) if named else None)
            if not role or rnd is None or rnd < 1:
                print("REFUSED --transcript needs --role and --round ≥ 1 (or a name <role>.r<N>.jsonl)")
                return 2
            reads = (role, rnd, Path(args.transcript))
        return cmd_status(run, ledger_of(run, args.ledger), args.format, args.answer, reads)
    if not run.is_dir():
        print(f"REFUSED no such run folder: {run}")
        return 2
    if args.cmd == "extract":
        return cmd_extract(run, Path(args.answer) if args.answer else run / "answer.md",
                           Path(args.out) if args.out else run / "claims.jsonl", args.keep_links)
    if args.cmd == "list":
        if args.cap < 0 or args.candidates < 0:
            print("REFUSED --cap and --candidates are counts (≥ 0)")
            return 2
        return cmd_list(run, ledger_of(run, args.ledger), args.todo, args.cap, args.candidates)
    if args.cmd == "link":
        return cmd_link(run, ledger_of(run, args.ledger), args.claim, args.against, args.for_ids, args.none,
                        args.kind, args.reason, args.by)
    if args.cmd == "reads":
        if args.rnd < 1 or not args.role.strip():
            print("REFUSED reads needs --role and --round ≥ 1")
            return 2
        role = args.role.strip()
        return cmd_reads(run, ledger_of(run, args.ledger), role, args.rnd,
                         Path(args.transcript) if args.transcript else run / "rounds" / f"{role}.r{args.rnd}.jsonl",
                         args.format)
    return cmd_brief(ledger_of(run, args.ledger))


if __name__ == "__main__":
    raise SystemExit(main())
