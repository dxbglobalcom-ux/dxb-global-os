#!/usr/bin/env python3
"""THE SIDE-BY-SIDE — one table, one column per answer folder, built from files only.

WHY. The plan he approved on 2026-09-24 (Faz 4) puts quick mode's answers next to his free
Perplexity account's answers to the same questions, on ten measures. A comparison is only honest when
both columns come from the SAME ruler and the SAME kind of files, so this file measures nothing new
and opens nothing: it reads what the runs left — .t0/.t1/.t2 or timing.json, answer.md,
cite-check.txt (cite-check.py's own output, both sides judged by it) and sources.json — and never the
network. A missing file is printed as missing, never guessed. No RACE score: at $0 there is no judge
to grade the prose, and the plan says so.

    rubric.py <dir> [<dir> ...]      a plain markdown table on stdout

  1 time — ours: gather (.t1−.t0) and end to end (.t2−.t0); Perplexity: t_done−t_nav (timing.json),
    each labelled, with Perplexity's own "Researched" label beside it
  2 words (R8's own count)          3 answer first (R1)          4 inline-citation rate (R2)
  5 re-opened citation accuracy (R4 supported/judged; unjudgeable and unreachable shown)
  6 distinct sources cited and distinct domains (answer.md's [n] joined to sources.json)
  7 structure: tables and headings  8 follow-up questions (R7's count)
  9 people counted by the machine: the run's own count source ([1], kind "count") or "yok"
  10 unreachable / dead cited links among the ones R4 re-opened
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import sources as S  # noqa: E402  — the registry and the run's machine count


def _cite_check():
    # the ruler's own parser: a marker inside a code block cites nothing, a follow-up heading is R7's
    if "cite_check" in sys.modules:
        return sys.modules["cite_check"]
    spec = importlib.util.spec_from_file_location("cite_check", HERE / "cite-check.py")
    mod = importlib.util.module_from_spec(spec)
    sys.modules["cite_check"] = mod
    spec.loader.exec_module(mod)
    return mod


CC = _cite_check()
ROW = re.compile(r"^(R\d)\s+(PASS|FAIL)\s+(.*)$")


def gone(*names: str) -> str:
    """The cell of a measure whose file is not there — never a number read off an empty registry
    ("0 kaynak" beside a removed sources.json, refuter 2026-09-24)."""
    return f"YOK (dosya yok: {', '.join(names)})"


def _read(p: Path) -> str | None:
    try:
        return p.read_text(encoding="utf-8-sig", errors="replace")
    except OSError:
        return None


def _num(p: Path) -> float | None:
    t = _read(p)
    try:
        return float(t.split()[0]) if t else None
    except (ValueError, IndexError):
        return None


def rules(d: Path) -> dict[str, tuple[str, str, list[str]]]:
    """rule -> (PASS|FAIL, head, detail lines), as cite-check.txt printed them."""
    text = _read(d / "cite-check.txt")
    out: dict[str, tuple[str, str, list[str]]] = {}
    if text is None:
        return out
    cur = None
    for ln in text.splitlines():
        m = ROW.match(ln)
        if m:
            cur = m.group(1)
            out[cur] = (m.group(2), m.group(3), [])
        elif cur and ln.startswith("      "):
            out[cur][2].append(ln.strip())
        else:
            cur = None
    return out


def column(d: Path) -> tuple[str, list[str]]:
    rr = rules(d)
    timing = json.loads(_read(d / "timing.json") or "null") if (d / "timing.json").is_file() else None
    ours = (d / ".t0").is_file()
    who = "Perplexity, ucretsiz hesap" if timing is not None else ("bizim, hizli mod" if ours else "?")
    md = _read(d / "answer.md")
    has_src = (d / "sources.json").is_file()
    cc_gone = not (d / "cite-check.txt").is_file()
    missing = (lambda rule: gone("cite-check.txt") if cc_gone else f"YOK (cite-check.txt: {rule} satiri yok)")
    cells: list[str] = []

    # 1 time
    if timing is not None:
        sec = timing.get("seconds")
        c = (f"{sec} s (t_done−t_nav)" if sec is not None else "olculmedi (t_done yok)")
        if timing.get("researched_label"):
            c += f" · sayfanin etiketi: {timing['researched_label']}"
        if timing.get("from_capture"):
            c += " · yakalamadan cevrildi"
        cells.append(c)
    elif ours:
        t0 = _num(d / ".t0")

        def span(stamp: str, label: str) -> str:
            if not (d / stamp).is_file():
                return f"{label} {gone(stamp)}"
            t = _num(d / stamp)
            return f"{label} {t - t0:.1f} s" if t0 is not None and t is not None else f"{label} okunamadi (.t0/{stamp})"
        cells.append(f"{span('.t1', 'gather')} · {span('.t2', 'uctan uca')}")
    else:
        cells.append(gone("timing.json", ".t0"))

    # 2 words — R8's own count
    r8 = rr.get("R8")
    m = re.match(r"([\d,]+) words", r8[1]) if r8 else None
    cells.append(m.group(1) if m else missing("R8"))

    # 3 answer first — R1
    r1 = rr.get("R1")
    cells.append(r1[0] if r1 else missing("R1"))

    # 4 inline-citation rate — R2
    r2 = rr.get("R2")
    m = re.search(r"coverage ([\d.]+%) — (\d+) of (\d+)", r2[1]) if r2 else None
    cells.append(f"{m.group(1)} ({m.group(2)}/{m.group(3)}) {r2[0]}" if m else (r2[1][:60] if r2 else missing("R2")))

    # 5 re-opened accuracy — R4
    r4 = rr.get("R4")
    if r4:
        sup = re.search(r"(\d+) supported / (\d+) unsupported", r4[1])
        unj = re.search(r"unjudgeable (\d+)", r4[1])
        unr = re.search(r"unreachable (\d+)", r4[1])
        smp = re.search(r"sampled (\d+) of (\d+)", r4[1])
        judged = int(sup.group(1)) + int(sup.group(2)) if sup else 0
        acc = f"{int(sup.group(1)) / judged:.1%}" if sup and judged else "olculemedi"
        cells.append(f"{acc} ({sup.group(1) if sup else 0}/{judged} yargilandi) · yargilanamayan "
                     f"{unj.group(1) if unj else '?'} · acilamayan {unr.group(1) if unr else '?'} · "
                     f"{smp.group(1) if smp else '?'}/{smp.group(2) if smp else '?'} ornek · {r4[0]}")
    else:
        cells.append(missing("R4"))

    # 6 distinct sources and domains cited
    reg = {int(s["id"]): s for s in S.load(d / "sources.json")} if has_src else {}
    ids: list[int] = []
    if md is not None:
        _, _, code = CC.parse(md)
        skip = set(code)
        for i, line in enumerate(md.splitlines(), 1):
            if i not in skip:
                ids += [int(x) for x in CC.MARK.findall(line)]
    known = sorted({i for i in ids if i in reg})
    domains = {reg[i].get("domain") or S.domain_of(str(reg[i].get("url") or "")) for i in known
               if reg[i].get("kind") != "count"}
    loose = len({i for i in ids if i not in reg})
    absent = [n for n, there in (("answer.md", md is not None), ("sources.json", has_src)) if not there]
    cells.append(gone(*absent) if absent else
                 f"{len(known)} kaynak · {len(domains)} alan adi" + (f" · {loose} cozulemeyen id" if loose else ""))

    # 7 structure
    if md is None:
        cells.append(gone("answer.md"))
    else:
        units, heads, _ = CC.parse(md)
        tables = sum(1 for ln in md.splitlines() if CC.TABLE_SEP.match(ln) and "-" in ln)
        body_heads = [t for _, t in heads if not CC.FOLLOWUP.match(CC.fold(CC.plain(t)).strip())]
        cells.append(f"tablo {'var' if tables else 'yok'} ({tables}) · baslik {len(body_heads)}")

    # 8 follow-up questions — R7
    r7 = rr.get("R7")
    m = re.search(r"holds (\d+) question lines", r7[1]) if r7 else None
    cells.append(f"{m.group(1)} {r7[0]}" if m else (f"0 {r7[0]} (bolum yok)" if r7 else missing("R7")))

    # 9 people counted by the machine
    count = next((s for s in reg.values() if s.get("kind") == "count"), None)
    if not has_src:
        cells.append(gone("sources.json"))
    elif count:
        people = sorted(S.machine_counts(d)[0]["people"])
        cells.append(f"{'/'.join(str(p) for p in people) or '?'} kisi ([{count['id']}], makine sayimi)")
    else:
        cells.append("yok")

    # 10 unreachable / dead among the re-opened
    if r4:
        unr = re.search(r"unreachable (\d+)", r4[1])
        smp = re.search(r"sampled (\d+) of", r4[1])
        dead = sum(1 for ln in r4[2] if "UNREACHABLE" in ln and re.search(r"http (404|410)|dead", ln))
        cells.append(f"{unr.group(1) if unr else '?'} / {smp.group(1) if smp else '?'} yeniden acilan"
                     + (f" (olu: {dead})" if dead else ""))
    else:
        cells.append(missing("R4"))
    return f"{d.name} — {who}", cells


LABELS = ["1 sure", "2 kelime (R8)", "3 once cevap (R1)", "4 satir ici kaynak orani (R2)",
          "5 yeniden acilan kaynak dogrulugu (R4)", "6 ayri kaynak / alan adi", "7 yapi (tablo, baslik)",
          "8 takip sorusu (R7)", "9 makinenin saydigi kisi", "10 acilamayan / olu kaynak (R4 icinde)"]


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(prog="rubric.py", description="the side-by-side, from files only")
    ap.add_argument("dirs", nargs="+")
    a = ap.parse_args(argv)
    cols = []
    for x in a.dirs:
        d = Path(x)
        if not d.is_dir():
            print(f"rubric: {d} bir klasor degil", file=sys.stderr)
            return 2
        cols.append(column(d))
    esc = (lambda s: s.replace("|", "\\|"))
    print("| olcut | " + " | ".join(esc(h) for h, _ in cols) + " |")
    print("|" + "---|" * (len(cols) + 1))
    for i, lab in enumerate(LABELS):
        print(f"| {lab} | " + " | ".join(esc(c[i]) for _, c in cols) + " |")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
