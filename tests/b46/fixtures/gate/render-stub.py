#!/usr/bin/env python3
"""THE PAGE'S STAND-IN (copied over scripts/render.py inside the bench's engine copy): it keeps the
arguments it was called with beside the page and writes a page, so a case can see how the fleet calls
the renderer. The real render.py is Lane C's and has its own cases."""
import sys
from pathlib import Path

args = sys.argv[1:]
out = Path(args[args.index("--out") + 1]) if "--out" in args else Path(args[0]).parent / "final.html"
out.write_text("<!doctype html><title>stand-in page</title>\n", encoding="utf-8")
(out.parent / "render-argv.txt").write_text("\n".join(args) + "\n", encoding="utf-8")
print(f"page: {out}")
