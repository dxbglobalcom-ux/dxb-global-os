#!/usr/bin/env python3
"""
dxb-cost-gate — one PreToolUse gate on the CEO's machine.

WHY IT EXISTS. Twice a session's own command took the machine down:

  2026-08-17 18:04  a search whose cost came from its pattern, not its data
                    -> 26 GB matcher, machine froze
  2026-08-19 12:27  the same shape again
                    -> 25.5 GB (kernel: anon-rss:25579660kB), swap 0, kernel OOM,
                       and the CEO's VS Code window went down with it.

The right command for the same question cost 3 MB and 0.00 s. The waste was never
necessary; it was a shortcut taken without measuring the target first.

THE RULE THIS GATE ENFORCES — MEASURE BEFORE YOU SPEND.
  1. No search whose cost is set by the pattern rather than by the data.
  2. No command that pours a large file into the conversation.
  3. No scan rooted at the whole disk or the whole home directory.
  4. No loop without a bound.

Exit 2 blocks the call and shows the reason to the model. Any internal error
returns 0: this gate never breaks a session by failing.
"""
import json
import os
import re
import sys

# ── 1. search bombs ──────────────────────────────────────────────────────────
# A bounded repetition with a large upper bound, twice over or beside a wide
# alternation, makes the matcher's state table multiply out before a single byte
# of input is read.
BOUNDED = re.compile(r"\{\s*\d*\s*,\s*(\d+)\s*\}")
WIDE = 20           # an upper bound of 20 or more is a "wide window"
CATASTROPHIC = 500  # one window this wide is refused on its own

# ── 2. output floods ─────────────────────────────────────────────────────────
DUMPERS = ("cat", "jq", "sort", "base64", "xxd", "hexdump", "strings", "od")
LIMITERS = ("head", "tail", "sed -n", "wc", "grep", "rg", "less", "> ", ">>", "cut -c")
FLOOD_BYTES = 512 * 1024  # half a megabyte of text is already ~130k tokens of conversation

# ── 3. unbounded scans ───────────────────────────────────────────────────────
SCANNERS = re.compile(r"\b(u?grep|rg|ripgrep|find|fd)\b")
WHOLE_ROOT = re.compile(r"(?:^|\s)(/|/home|~|\$HOME|/usr|/var|/etc)(?:\s|$)")

# ── 4. unbounded loops ───────────────────────────────────────────────────────
FOREVER = re.compile(r"\bwhile\s+(?:true|:)\b|\byes\b\s*\|")
BOUNDS = ("timeout", "head -", "-m ", "--max-count", "break", "sleep")


def alternation_branches(pattern):
    """Largest number of branches inside any (a|b|c) group; escaped bars ignored."""
    best, counts, i = 0, [], 0
    while i < len(pattern):
        c = pattern[i]
        if c == "\\":
            i += 2
            continue
        if c == "(":
            counts.append(1)
        elif c == ")":
            if counts:
                best = max(best, counts.pop())
        elif c == "|" and counts:
            counts[-1] += 1
        i += 1
    while counts:
        best = max(best, counts.pop())
    return best


def search_bomb(cmd):
    wide = [int(n) for n in BOUNDED.findall(cmd) if int(n) >= WIDE]
    if not wide:
        return None
    if max(wide) >= CATASTROPHIC:
        return "a single repetition window of {0,%d}" % max(wide)
    if len(wide) >= 2:
        return ("%d wide repetition windows (widest {0,%d}) — the exact shape that "
                "took this machine down on 2026-08-17 and 2026-08-19" % (len(wide), max(wide)))
    branches = alternation_branches(cmd)
    if branches >= 4:
        return ("a wide repetition window {0,%d} beside a %d-branch alternation"
                % (max(wide), branches))
    return None


def big_file_flood(cmd):
    parts = cmd.strip().split()
    if not parts:
        return None
    first = os.path.basename(parts[0])
    if first not in DUMPERS or any(lim in cmd for lim in LIMITERS):
        return None
    for tok in parts[1:]:
        path = tok.strip("\"'")
        if path.startswith("-"):
            continue
        try:
            size = os.path.getsize(os.path.expanduser(path))
        except OSError:
            continue
        if size > FLOOD_BYTES:
            return ("`%s` would pour %d MB from %s into the conversation with no size limit"
                    % (first, size // 1024 // 1024, path))
    return None


def whole_disk_scan(cmd):
    if not SCANNERS.search(cmd):
        return None
    recursive = re.search(r"(?:^|\s)(?:-r|-R|--recursive)(?:\s|$)", cmd) or re.search(
        r"(?:^|\s)(?:find|fd)\s", cmd)
    if not recursive:
        return None
    tail = cmd[recursive.end():]
    if WHOLE_ROOT.search(tail):
        return "a recursive scan rooted at the whole disk or the whole home directory"
    return None


def endless_loop(cmd):
    if FOREVER.search(cmd) and not any(b in cmd for b in BOUNDS):
        return "a loop with no bound and no timeout"
    return None


ADVICE = """MEASURE FIRST, THEN SPEND:
  size of the target      ls -l FILE | awk '{print $5}'      wc -l FILE
  a slice, not the whole  sed -n '1,80p' FILE                head -c 4000 FILE
  cheap search first      grep -c "keyword" FILE   -> then narrow inside the hits
  context, not windows    grep -n -C 3 "keyword" FILE
  bound every scan        name a real directory, add -m / --max-count / timeout"""


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0

    tool = payload.get("tool_name", "")
    tool_input = payload.get("tool_input", {}) or {}

    if tool == "Grep":
        target = tool_input.get("pattern", "") or ""
        label = "Grep pattern"
        checks = [search_bomb]
    elif tool == "Bash":
        target = tool_input.get("command", "") or ""
        label = "Bash command"
        checks = [big_file_flood, whole_disk_scan, endless_loop]
        if SCANNERS.search(target):
            checks.insert(0, search_bomb)
    else:
        return 0

    for check in checks:
        try:
            reason = check(target)
        except Exception:
            continue
        if reason:
            sys.stderr.write(
                "BLOCKED by dxb-cost-gate — %s: %s\n"
                "Reason: %s.\n"
                "Measured history: on 2026-08-17 and 2026-08-19 an unmeasured command "
                "allocated about 25 GB on this machine and closed the CEO's editor. "
                "The correct command for the same question cost 3 MB.\n%s\n"
                % (label, target[:300], reason, ADVICE)
            )
            return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
