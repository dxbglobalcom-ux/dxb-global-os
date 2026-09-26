#!/usr/bin/env python3
"""THE COVERAGE TABLE'S STAND-IN (copied over scripts/kapsama.py inside the bench's engine copy).
It prints a table the case can recognise and the run folder it was handed; the real kapsama.py is
Lane A's and has its own cases."""
import sys

print("Platform | Bulundu | Okundu | Cevapta | Okunmadı / kapalı kapı")
print("x | 2 | 1 | 0 | denenmedi ×1")
print(f"KAPSAMA-STAND-IN run={sys.argv[1] if len(sys.argv) > 1 else '?'}")
