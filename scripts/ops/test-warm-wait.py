#!/usr/bin/env python3
"""Tests for dxb-warm-wait: when it wakes, when a ping pays, what it refuses, and one real short wait."""
import importlib.machinery
import importlib.util
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
COMMAND = os.path.join(HERE, "dxb-warm-wait")
loader = importlib.machinery.SourceFileLoader("warm_wait", COMMAND)
spec = importlib.util.spec_from_loader("warm_wait", loader)
ww = importlib.util.module_from_spec(spec)
loader.exec_module(ww)

failed = []


def check(name, got, want):
    if got != want:
        failed.append(f"{name}: got {got!r}, want {want!r}")


MIN = 60
NOW = 1_794_500_000.0

# The wake: the target when it comes inside 55 minutes, the 55th minute otherwise.
check("target inside the hour ends the wait", ww.next_wake(NOW, NOW + 40 * MIN), (NOW + 40 * MIN, True))
check("target at the 55th minute ends the wait", ww.next_wake(NOW, NOW + 55 * MIN), (NOW + 55 * MIN, True))
check("a longer wait wakes at the 55th minute", ww.next_wake(NOW, NOW + 80 * MIN), (NOW + 55 * MIN, False))

# How many pings a wait takes.
check("40 minutes: none", ww.pings_needed(40 * MIN), 0)
check("55 minutes: none", ww.pings_needed(55 * MIN), 0)
check("80 minutes: one", ww.pings_needed(80 * MIN), 1)
check("five hours: five", ww.pings_needed(300 * MIN), 5)

# A ping pays while the pings together cost less than one cold start (0.1 each against 2.0).
check("5 pings pay", ww.worth_keeping_warm(5), True)
check("19 pings pay", ww.worth_keeping_warm(19), True)
check("20 pings do not", ww.worth_keeping_warm(20), False)
check("a 31-hour wait stays cold", ww.worth_keeping_warm(ww.pings_needed(31 * 60 * MIN)), False)

# The target, from the command line.
check("--for 90", ww.parse_target(["--for", "90"], NOW, None), NOW + 90 * MIN)
check("--for inf is refused", ww.parse_target(["--for", "inf"], NOW, None), None)
check("--for 0 is refused", ww.parse_target(["--for", "0"], NOW, None), None)
check("--until @epoch", ww.parse_target(["--until", "@1794503000"], NOW, None), 1794503000.0)
check("--until-reset adds the margin", ww.parse_target(["--until-reset"], NOW, 1.0), NOW + 3600 + ww.RESET_MARGIN_MIN * MIN)
check("--until-reset without a record", ww.parse_target(["--until-reset"], NOW, None), None)
check("--until nonsense", ww.parse_target(["--until", "soon"], NOW, None), None)
check("no arguments", ww.parse_target([], NOW, None), None)
later = ww.parse_target(["--until", "00:00"], NOW, None)
check("--until HH:MM that has passed is tomorrow's", 0 < later - NOW <= 24 * 3600, True)

# The whole run with the sleeping and the quota replaced: which line each case ends on.
import contextlib
import io


def run_with(argv, five_hour_used):
    quota = {"5h": {"used": five_hour_used, "reset_in_h": 1.0}, "7d": {"used": 40}}
    real = (ww.sleep_until, ww.read_quota, ww.log)
    ww.sleep_until, ww.read_quota, ww.log = (lambda when: None), (lambda: quota), (lambda event, q: None)
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out):
            code = ww.main(argv)
    finally:
        ww.sleep_until, ww.read_quota, ww.log = real
    return code, out.getvalue()


code, text = run_with(["--for", "80"], 50)
check("80 minutes with room: a ping", (code, text.startswith("WARM_PING "), "re-arm: scripts/ops/dxb-warm-wait --until @" in text), (0, True, True))
code, text = run_with(["--for", "80"], 99)
check("80 minutes, window full: no ping, cold", (code, text.startswith("WAIT_OVER "), "had no room for a ping" in text), (0, True, True))
code, text = run_with(["--for", "40"], 99)
check("40 minutes: over, nothing cold", (code, text.startswith("WAIT_OVER "), "cold" in text), (0, True, False))
code, text = run_with(["--for", "2000"], 10)
check("33 hours: cold by the count", (code, text.startswith("WAIT_OVER "), "pings would cost more" in text), (0, True, True))
code, text = run_with(["--until-reset"], 95)
check("--until-reset 62 minutes away: one ping first", (code, text.startswith("WARM_PING ")), (0, True))

# The command itself: bad usage exits 2; a three-second wait ends with WAIT_OVER, on time.
bad = subprocess.run([sys.executable, COMMAND, "--for", "inf"], capture_output=True, text=True)
check("bad usage exit", bad.returncode, 2)
began = time.time()
real = subprocess.run([sys.executable, COMMAND, "--for", "0.05"], capture_output=True, text=True, timeout=60)
check("short wait exit", real.returncode, 0)
check("short wait says WAIT_OVER", real.stdout.startswith("WAIT_OVER "), True)
check("short wait really waited", time.time() - began >= 3, True)

if failed:
    print("\n".join(failed))
    sys.exit(1)
print("warm-wait: all checks passed")
