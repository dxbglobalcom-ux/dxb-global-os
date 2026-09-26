#!/usr/bin/env python3
"""THE THREAD'S DATE, TAKEN FROM THE GROUND THAT FOUND IT.

HIS RULING, 2026-09-20: *"yorumların tarihi önemli değil başlıkların önemli."* The door
refuses a quote whose thread has no date, and until tonight it could not obey its own rule:
measured at the source the same minute, NO reader on this machine returns a comment's date —
`opencli reddit read` and `opencli hackernews read` both declare `type, author, score, text`,
no flag adds one, and Reddit's own JSON answers 403 from here.

The THREAD's date is a different question, and the answer was already on the disk. Every sweep
writes `<outdir>/reddit.raw`, and `opencli reddit search` puts `created_utc` beside each `url`
in the same record. So the date is HARVESTED FROM THE GROUND, by the one that opened it, and
never fetched a second time. Hacker News fills its own gap inside `crowd.sh` (Algolia, free).

    threaddates.py <raw-file-or-dir> [...] > dates.tsv     # url<TAB>YYYY-MM-DD
"""
from __future__ import annotations

import datetime
import pathlib
import re
import sys

# A RECORD MAY BEGIN WITH EITHER FIELD. `- url: …` and `  url: …` are the same row to YAML and
# were not the same row to this file: an auditor measured 0 dates harvested from the first form.
URL = re.compile(r"^\s*(?:-\s*)?url:\s*(\S+)\s*$")
WHEN = re.compile(r"^\s*(?:-\s*)?created_utc:\s*([0-9]+)\s*$")


def dates_in(text: str) -> dict[str, str]:
    """A url and the `created_utc` that follows it inside the SAME record."""
    out: dict[str, str] = {}
    pending: str | None = None
    for line in text.splitlines():
        m = URL.match(line)
        if m:
            pending = m.group(1).strip("'\"")
            continue
        w = WHEN.match(line)
        if w and pending:
            try:
                out[pending] = datetime.datetime.fromtimestamp(int(w.group(1)), datetime.timezone.utc).strftime("%Y-%m-%d")
            except (ValueError, OSError):
                pass
            pending = None
    return out


def main(argv: list[str]) -> int:
    found: dict[str, str] = {}
    for arg in argv:
        p = pathlib.Path(arg)
        files = sorted(p.glob("*.raw")) if p.is_dir() else [p]
        for f in files:
            try:
                found.update(dates_in(f.read_text(encoding="utf-8", errors="replace")))
            except OSError:
                continue
    for u, d in sorted(found.items()):
        print(f"{u}\t{d}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
