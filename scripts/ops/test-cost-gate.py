#!/usr/bin/env python3
"""Test battery for dxb-cost-gate: every killer must be blocked, every normal command must pass."""
import json
import subprocess
import sys

GATE = "/home/dxb/.claude/hooks/dxb-cost-gate.py"

W = chr(123) + "0,120" + chr(125)   # {0,120}  built at runtime so this file never carries the shape
W70 = chr(123) + "0,70" + chr(125)
W900 = chr(123) + "0,900" + chr(125)
W5 = chr(123) + "2,5" + chr(125)
BIG = "/home/dxb/.vscode/extensions/anthropic.claude-code-2.1.235-linux-x64/webview/index.js"
SLASH = "/"

CASES = [
    # ── killers: must be BLOCKED ────────────────────────────────────────────────
    ("19 Agustos gercek katil", "Grep",
     "\\" + chr(123) + "[^" + chr(123) + chr(125) + "]" + W +
     "(sampleRate|echoCancellation|noiseSuppression|autoGainControl|channelCount)"
     "[^" + chr(123) + chr(125) + "]" + W + "\\" + chr(125), True),
    ("17 Agustos katil", "Grep", "." + W70 + "(a|b|c|d|e|f|g)." + W70, True),
    ("tek devasa pencere", "Grep", "foo." + W900 + "bar", True),
    ("Bash icinde bomba", "Bash", 'ugrep -oE ".' + W + '(a|b|c|d|e).' + W + '" .', True),
    ("tum disk taramasi", "Bash", "grep -r 'TODO' " + SLASH, True),
    ("ev dizini taramasi", "Bash", "find $HOME -name '*.log'", True),
    ("sudo ile gercek tarama", "Bash", "sudo find " + SLASH + " -name core", True),
    ("boru sonrasi gercek tarama", "Bash", "echo start | find /etc -name x", True),
    ("sonsuz dongu", "Bash", "while true; do echo x; done", True),
    ("dev dosyayi dokme", "Bash", "cat " + BIG, True),

    # ── normal work: must PASS ──────────────────────────────────────────────────
    ("normal fonksiyon aramasi", "Grep", "function\\s+\\w+", False),
    ("kucuk sinirli tekrar", "Grep", "a" + W5 + "(x|y)", False),
    ("sade secenek grubu", "Grep", "error|warn|fatal|panic", False),
    ("normal grep", "Bash", "grep -n TODO src/app.ts", False),
    ("sinirli tarama", "Bash", "grep -rn 'TODO' scripts/ops", False),
    ("dev dosyadan dilim", "Bash", "sed -n '1,50p' " + BIG, False),
    ("dev dosyada sayim", "Bash", "grep -c 'audio' " + BIG, False),
    ("kucuk dosyayi dokme", "Bash", "cat /etc/hostname", False),
    ("siniri olan dongu", "Bash", "timeout 5 bash -c 'while true; do echo x; done'", False),
    ("kok dizinde ls", "Bash", "ls -la " + SLASH, False),
    ("git durumu", "Bash", "git status --short", False),
    ("derleme", "Bash", "pnpm build", False),
    ("ilgisiz arac", "Read", "/etc/hosts", False),

    # ── the false positives that were measured 2026-08-19 and must never return ─
    ("commit mesajinda find ve bolu", "Bash",
     "git commit -m 'craft it if you find it correctly " + SLASH + " 0.67 @10M'", False),
    ("echo icinde find", "Bash", "echo 'you can find it in " + SLASH + " somewhere'", False),
    ("cd + git zinciri", "Bash", "cd /home/dxb && git add -A && git status --short", False),
    ("prosa icinde grep kelimesi", "Bash", "echo 'the grep was written by a session'", False),
]

fails = 0
for name, tool, value, must_block in CASES:
    key = "pattern" if tool == "Grep" else ("command" if tool == "Bash" else "file_path")
    payload = json.dumps({"tool_name": tool, "tool_input": {key: value}})
    p = subprocess.run([sys.executable, GATE], input=payload, capture_output=True, text=True)
    blocked = p.returncode == 2
    ok = blocked == must_block
    if not ok:
        fails += 1
    print("%-4s %-32s beklenen=%-7s sonuc=%s" % (
        "OK" if ok else "HATA", name,
        "BLOKE" if must_block else "GECER",
        "BLOKE" if blocked else "GECER"))

print()
print("toplam %d vaka, %d hata" % (len(CASES), fails))
sys.exit(1 if fails else 0)
