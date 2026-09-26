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
  claims.py status <run> [--format md|json] [--ledger F]
  claims.py brief <run> [--ledger F]

The contract (fields, the pair rule, independence, flags, outputs, exit codes) is
EVIDENCE-B56-K2-2026-09-26.md §2.2; fleet/fleet.sh, scripts/render.py and scripts/kapsama.py are built
against it, and render.py and kapsama.py import `extract_claims`, `sides` and `source_key` from here.
WHICH LEDGER: extract writes --out (default <run>/claims.jsonl). list, link, status and brief work on
--ledger; without it, on <run>/claims.draft.jsonl when the fleet's draft pass wrote one (its claim rounds
link there, contract §2.3), else on <run>/claims.jsonl. Every write happens under the run's evidence
lock (evidence.locked): the claim hunters write at once.

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
    separator row — as a claim, in order: C001, C002, … `rows` is the ledger by id (every row, so each
    quote row finds its address). The counts are over ADMITTED rows only (evidence.admissible)."""
    index = evidence.address_index(list(rows.values()))
    lines = (md or "").splitlines()
    out: list[dict] = []
    section, headed = None, False
    for n, line in enumerate(lines, 1):
        h = H2.match(line)
        if h:
            section, headed = claim_text(h.group(1)) or None, True
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
    claims = extract_claims(md, _rows(run))
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
          f" · inadmissible-cited {t['inadmissible_cited']} · carried {carried}")
    return 0


# =================================================================== list — the sending
def is_todo(c: dict, kind: str) -> bool:
    if kind == "counter":
        return (c.get("counter_status") == "unchecked" and (c.get("rows") or 0) >= 2
                and not c.get("counter_rows"))
    return bool(c.get("thin")) and c.get("gap_status") == "unchecked"


def cmd_list(run: Path, ledger: Path, kind: str, cap: int, candidates: int) -> int:
    """The claims a hunter works, and the sending WRITTEN: todo in order (verdict first, then rows,
    most first), the first `cap` become `sent`, the rest `not-sent (cap)`."""
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
def cmd_status(ledger: Path, fmt: str) -> int:
    claims = read_ledger(ledger)
    if claims is None:
        print(f"no claim ledger: {ledger}")
        return 1
    t = tally(claims)
    if fmt == "json":
        t.update(owed_counter=t["counter"]["sent"], owed_gap=t["gap"]["sent"],
                 new_for_links=sum(x.get("kind") == "for" for c in claims for x in c.get("links") or []))
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
    li.add_argument("--cap", type=int, default=20)
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
    br = sub.add_parser("brief")
    br.add_argument("run")
    br.add_argument("--ledger")
    args = ap.parse_args(argv)

    run = Path(args.run)
    if args.cmd == "status":
        return cmd_status(ledger_of(run, args.ledger), args.format)
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
    return cmd_brief(ledger_of(run, args.ledger))


if __name__ == "__main__":
    raise SystemExit(main())
