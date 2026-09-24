#!/usr/bin/env python3
"""THE DELIVERABLE IN MARKDOWN — the answer unchanged, then only the sources it actually cites.

    render.py <answer.md> --sources sources.json [--out final.md] [--json citations.json]
      --out   default: final.md beside the answer
      --json  default: citations.json beside --out

final.md is the answer byte for byte, then `## Kaynaklar` with ONE line per cited id, in the order
the answer first cites them: `[n] Title — domain — date — url` (a title the run never saw is left
out, a missing date reads TARİHSİZ). The run's own machine count (kind "count") is listed plainly
as `[n] Bu koşunun makine sayımı (crowd.sh) — SUMMARY.txt`: a file of the run, not a web page. Nothing uncited is listed: the 2026-09-20 report dumped 102
addresses and cited none of them. citations.json maps each id to its url, title, domain, date,
kind and the sentences that cite it — the material for whoever designs the visual page.

NO HTML, BY RULING: the CEO decided that a report page is designed by hand each time and is never
a converter's output. This file stops at Markdown and JSON on purpose.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import sources as S  # noqa: E402


def _cite_check():
    # One parser for the ruler and the renderer: a sentence render.py attributes to [n] is the
    # sentence cite-check judged. The module must sit in sys.modules before it runs — its
    # dataclasses look themselves up there.
    spec = importlib.util.spec_from_file_location("cite_check", HERE / "cite-check.py")
    mod = importlib.util.module_from_spec(spec)
    sys.modules["cite_check"] = mod
    spec.loader.exec_module(mod)
    return mod


CC = _cite_check()


def cited_order(md: str) -> list[int]:
    """Ids in the order the answer first cites them; code blocks do not cite."""
    _, _, code = CC.parse(md)
    skip = set(code)
    seen: dict[int, None] = {}
    for i, line in enumerate(md.splitlines(), 1):
        if i not in skip:
            for m in CC.MARK.finditer(line):
                seen.setdefault(int(m.group(1)), None)
    return list(seen)


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(prog="render.py", description="answer + the sources it cites, in Markdown")
    ap.add_argument("answer")
    ap.add_argument("--sources", required=True)
    ap.add_argument("--out")
    ap.add_argument("--json")
    a = ap.parse_args(argv)

    answer = Path(a.answer)
    try:
        # read the way cite-check reads: a BOM is dropped, a stray non-UTF-8 byte becomes U+FFFD
        md = answer.read_text(encoding="utf-8-sig", errors="replace")
    except OSError as e:
        raise SystemExit(f"render: cannot read {a.answer}: {e}")
    reg = {int(s["id"]): s for s in S.load(a.sources)}
    out = Path(a.out) if a.out else answer.parent / "final.md"
    jout = Path(a.json) if a.json else out.parent / "citations.json"

    order = cited_order(md)
    units, _, _ = CC.parse(md)
    said: dict[int, list[str]] = {i: [] for i in order}
    for u in units:
        for n in dict.fromkeys(int(x) for x in CC.MARK.findall(u.text)):
            if n in said and u.text not in said[n]:
                said[n].append(u.text)

    lines, cites, missing = [], {}, []
    for n in order:
        s = reg.get(n)
        if s is None:
            missing.append(n)
            lines.append(f"[{n}] — sources.json içinde yok")
            cites[str(n)] = {"url": None, "title": None, "domain": None, "date": None, "kind": None,
                             "sentences": said[n]}
            continue
        if s.get("kind") == "count":
            # the run's own count is a file of this run, not a web page: listed plainly
            lines.append(f"[{n}] {s.get('title') or S.COUNT_TITLE} — {s['url']}")
        else:
            parts = ([s["title"]] if s.get("title") else []) + [s.get("domain") or S.domain_of(s["url"]),
                                                                s.get("date") or "TARİHSİZ", s["url"]]
            lines.append(f"[{n}] " + " — ".join(parts))
        cites[str(n)] = {"url": s["url"], "title": s.get("title"), "domain": s.get("domain"),
                         "date": s.get("date"), "kind": s.get("kind"), "sentences": said[n]}

    final = md.rstrip("\n") + "\n\n## Kaynaklar\n\n" + "\n\n".join(lines) + "\n"
    out.write_text(final, encoding="utf-8")
    jout.write_text(json.dumps(cites, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"render: {len(order)} cited ids -> {out} (## Kaynaklar: {len(lines)} lines) · {jout}")
    if missing:
        print(f"render: {len(missing)} cited id(s) are not in {a.sources}: "
              + ", ".join(f"[{n}]" for n in missing), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
