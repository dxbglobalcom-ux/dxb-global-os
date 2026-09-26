#!/usr/bin/env python3
"""A stand-in for Lane A's kapsama.py — for tests/b46/render-from-rows.test.ts only.

It writes the argv it was called with to <run>/kapsama-argv.json (argv[1] is the run folder, by the
contract), then prints a fixed coverage table. KAPSAMA_STUB_FAIL=1 makes it fail the way a broken
script does: one line on stderr, exit 1.
"""
import json
import os
import sys
from pathlib import Path

Path(sys.argv[1], "kapsama-argv.json").write_text(json.dumps(sys.argv[1:]), encoding="utf-8")
if os.environ.get("KAPSAMA_STUB_FAIL") == "1":
    print("kapsama: the stub was told to fail", file=sys.stderr)
    sys.exit(1)
print("| Platform | Bulundu | Okundu | Cevapta | Okunmadı / kapalı kapı |")
print("|---|---|---|---|---|")
print("| x | 1 | 1 | 1 | — |")
print("| reddit | 2 | 2 | 2 | — |")
print("| web | 0 | 0 | 0 | — |")
