#!/usr/bin/env python3
"""THE PAGE, BUILT FROM THE EVIDENCE ROWS ONLY — the answer's ids numbered, every quote printed from its row.

    render.py <run>/answer.md --evidence <run>/evidence.jsonl --out <run>/final.md [--no-coverage]
      --out          default: final.md beside the answer
      --no-coverage  no "Nereye bakıldı" section; kapsama.py is not called

WHY. On 2026-09-24 the writer had the X quotes in hand and dropped them: the answer was written from
the hunters' prose, not from what had been read (plan v2 §1 cause 2; the lead measured X found 294,
cited 0 — EVIDENCE-B56-2026-09-26.md). A quote the model types can be invented; a quote this page
prints from a row the fetcher wrote cannot. So the answer carries ids and nothing else a reader would
check: the quote, its author, its date and its address all come from evidence.jsonl.

A citation is EXACTLY `[L0042]` or `[L0002, L0001]` — the pattern platforms.CITE_RE holds, so this page
and kapsama.py's Cevapta column count the same citations. final.md is the answer as written, each
citation's ids turned into numbers in first-appearance order (a repeated id keeps its number; a group
keeps its shape, `[1, 2]`), then:
  ## Kaynaklar       one entry per cited id: `n. **author** · date · platform — “passage” — url`, all
                     from the row. No author: the row's domain. No date, or `dates_agree` false (the
                     schema: treat as undated): "tarih yok". Never a guess. An uncited row is not listed.
  ## Nereye bakıldı  the stdout of `kapsama.py <run> --answer <answer>` from this same folder, <run>
                     being the answer's folder. Coverage prints and never blocks: kapsama.py missing,
                     failing or silent leaves a one-line note there, and the page is still written.

REFUSED — exit 2, one line on stderr, no page written — when the answer carries an id that is not in
evidence.jsonl; a bracket that holds an id-like token but is not a citation (`[bkz. L0002]`,
`[L0001 ]`, `[l0003]`, `[L0001; L0002]`); a raw http(s):// address (R6: addresses come from the rows);
or a `>` quote block (quotes come from the rows, never typed). A final.md an earlier render left at
--out goes too (never the answer or the rows file): a page built from an earlier answer never stands
beside a refused one. A line of evidence.jsonl that does not parse is skipped and said: an id on it is
not in the file, so a citation of it is refused like any unknown id. When an id occurs twice, the
later line wins — the file only grows by appends.

final.md is the page itself: it goes in front of him at once, no question asked; a hand-designed page
only when he asks (plan v2 §2 G). Prose is never rewritten here — the answer's shape is the session's
work; this file numbers, lists and appends. Stdlib only.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlsplit

HERE = Path(__file__).resolve().parent
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


def refuse(reason: str, out: Path, keep: tuple[Path, ...]) -> int:
    """Exit 2 with one line. A page an earlier render left at --out is removed — never a file in `keep`."""
    gone = ""
    if out.is_file() and out.resolve() not in keep:
        try:
            out.unlink()
            gone = f"; the earlier {out.name} was removed"
        except OSError as e:
            gone = f"; the earlier {out.name} could NOT be removed: {e.strerror}"
    print(f"render: REFUSED (no page written{gone}) — {reason}", file=sys.stderr)
    return 2


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(prog="render.py", description="the page, from the evidence rows only")
    ap.add_argument("answer")
    ap.add_argument("--evidence", required=True)
    ap.add_argument("--out")
    ap.add_argument("--no-coverage", action="store_true")
    a = ap.parse_args(argv)

    answer = Path(a.answer).resolve()  # <run> is its folder, also when it is given as a bare name
    evidence = Path(a.evidence)
    out = Path(a.out) if a.out else answer.parent / "final.md"
    keep = (answer, evidence.resolve())  # a mistyped --out never deletes the answer or the rows
    try:
        md = answer.read_text(encoding="utf-8-sig", errors="replace")
        rows, bad = load_rows(evidence)
    except OSError as e:
        return refuse(f"cannot read {e.filename}: {e.strerror}", out, keep)
    skipped = f"{len(bad)} line(s) of {evidence.name} are not a JSON row and were skipped (first: line {bad[0]})" if bad else ""
    why = refusals(md, rows, evidence.name)
    if why:
        return refuse("; ".join(why + ([skipped] if skipped else [])), out, keep)
    if skipped:
        print(f"render: note — {skipped}", file=sys.stderr)

    body, cited = number(md)
    entries = [source_line(n, rows[i]) for n, i in enumerate(cited, 1)]
    page = [body.rstrip("\n"), "", "## Kaynaklar", "",
            "\n\n".join(entries) if entries else "Cevapta kanıt satırı gösterilmedi."]
    said = "not asked (--no-coverage)"
    if not a.no_coverage:
        table, ok = coverage(answer.parent, answer)
        page += ["", "## Nereye bakıldı", "", table]
        said = "kapsama.py table" if ok else table.strip("_")
    try:
        out.write_text("\n".join(page) + "\n", encoding="utf-8")
    except OSError as e:
        raise SystemExit(f"render: cannot write {out}: {e.strerror}")
    print(f"render: {len(cited)} cited id(s) -> {out} · Kaynaklar {len(entries)} · Nereye bakıldı: {said}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
