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
  5. No whole-file read of more than 400 lines, through Bash or the Read tool: a slice.
     A path is measured after the command line's own assignments (NAME=value, then $NAME
     or ${NAME}), $HOME, ~ and $CLAUDE_PROJECT_DIR are resolved; a path still holding a
     variable, a glob or a command substitution passes, logged as unmeasured-path in
     ~/.claude/logs/dxb-cost-gate.jsonl (or $DXB_COST_GATE_LOG_DIR).
  6. No wait of more than 4 minutes inside a subagent: the battery, a full test run, the
     live fleet, a long timeout and a background job belong to the lead.
  7. Every Bash command it lets through runs with GNU grep (/usr/bin/grep), not with the
     embedded ugrep that Claude Code's shell snapshot defines as a `grep` function.
  8. No SendMessage that resumes a subagent idle more than 4 minutes: its prompt cache died
     at 5 and the resume writes its whole context again. The lead opens a fresh writer.

Measured 2026-09-26/27 (rules 5, 6 and 8): the weekly quota burned on NEW tokens entering
contexts. Writers poured 500-2,000-line files whole; a lead resumed writers idle 8-23
minutes (a subagent's cache lives 5) six times and 2.4 M tokens were written again; three
in-lane commands waited 10-18 minutes.

Exit 2 blocks the call and shows the reason to the model. An allowed Bash call exits 0
with its rewrite as JSON on stdout; every other allowed call exits 0 silently. Any
internal error returns 0: this gate never breaks a session by failing.
"""
import json
import os
import re
import sys
import time
from datetime import datetime, timezone

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

# ── 5. whole-file reads ──────────────────────────────────────────────────────
# A read wider than MAX_LINES reaches the conversation whole unless something downstream in
# the same pipeline bounds it: a file, a count, a slice, a filter, a digest.
MAX_LINES = 400
READERS = ("cat", "less", "more")
BOUNDERS = ("head", "tail", "wc", "grep", "egrep", "fgrep", "rg", "ugrep", "cut", "awk", "gawk",
            "mawk", "python", "python3", "jq", "md5sum", "sha1sum", "sha256sum", "tee")
NOT_LINES = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".ico", ".tif", ".tiff", ".pdf",
             ".ipynb")          # the Read tool shows these as images, pages or cells
COUNT_CAP = 32 * 1024 * 1024    # past this without enough line breaks, rule 2 owns the file
SED_RANGE = re.compile(r"(\d+)\s*,\s*(\d+|\$)\s*p")
COUNT_OPT = re.compile(r"-n(\d+)|--lines=(\d+)|-(\d+)")
STDOUT_TO_FILE = re.compile(r"(?:^|[^0-9&>])>>?(?![&>])|(?:^|\s)[1&]>>?(?![&>])")
REDIRECT_WORD = re.compile(r"[0-9&]?(?:>>?|>&|>\|)")

# ── 6. long waits inside a subagent ──────────────────────────────────────────
# A subagent's prompt cache lives 5 minutes; a wait past it makes the next turn write the
# whole context again. The lead session (no agent_type in the payload) is never held here.
LONG_WAIT_MS = 240000
LONG_SCRIPTS = ("battery.sh", "fleet.sh", "accept.sh")
LONG_PKG_SCRIPT = re.compile(r"[\w:-]*(?:battery|fleet|accept)")
SHELLS = ("bash", "sh", "zsh", "dash", "source", ".")
RUNNERS = ("pnpm", "npm", "npx", "pnpx", "yarn", "bun", "bunx", "node")

# ── 7. the real grep ─────────────────────────────────────────────────────────
# Claude Code's shell snapshot ("# Shadow find/grep with embedded bfs/ugrep") defines a bash
# FUNCTION grep that runs its embedded ugrep, which builds the giant matcher on counted
# windows (anthropics/claude-code #78700, #78834). Dropping it gives back /usr/bin/grep.
REBIND = "unset -f grep 2>/dev/null; "

# ── 8. cold resumes ──────────────────────────────────────────────────────────
# A SendMessage to a finished subagent resumes it. Its prompt cache lives 5 minutes; past that
# the resume writes its whole context into the cache again as new tokens. Its transcript lies
# beside the session's own: <session_id>.jsonl -> <session_id>/subagents/agent-<to>.jsonl, and
# only its tail is read: the last timestamp gives the idle time, the last usage the context.
COLD_AFTER_S = 240
TAIL_BYTES = 64 * 1024
CONTEXT_KEYS = ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens")
SUBAGENTS_DIR = os.environ.get("DXB_COST_GATE_SUBAGENTS_DIR")   # test-only: holds agent-<id>.jsonl

# The shell grammar rules 5 and 6 read: heredoc markers, wrappers, env assignments.
HEREDOC = re.compile(r"(?<!<)<<-?(?!<)\s*(['\"]?)([A-Za-z_][\w.-]*)\1")
WRAPPERS = ("sudo", "time", "nice", "nohup", "command", "timeout", "env", "exec", "stdbuf")
ASSIGNMENT = re.compile(r"[A-Za-z_][A-Za-z0-9_]*=")
DURATION = re.compile(r"\d+(?:\.\d+)?[smhd]?")
VAR = re.compile(r"\$(?:\{([A-Za-z_][A-Za-z0-9_]*)\}|([A-Za-z_][A-Za-z0-9_]*))")
ASSIGNED = re.compile(r"([A-Za-z_][A-Za-z0-9_]*)=(.*)", re.S)
UNRESOLVED = "*?[{$`"      # a glob, a brace, a variable or a command substitution left over
LOG_DIR = os.environ.get("DXB_COST_GATE_LOG_DIR") or os.path.join(
    os.path.expanduser("~"), ".claude", "logs")
DECISION_LOG = os.path.join(LOG_DIR, "dxb-cost-gate.jsonl")


# A command string is a chain of segments: `a | b && c ; d`. A word only counts as a
# COMMAND when it opens a segment. Without this, prose that merely contains "find" or
# " / " — a commit message, an echo, a heredoc — is read as a disk scan. Measured
# 2026-08-19: the gate blocked its own commit for exactly that reason.
SEGMENT_SPLIT = re.compile(r"\|\||&&|[|;\n]")


def command_segments(cmd):
    """Yield (first_word, whole_segment) for every segment of a command chain."""
    for seg in SEGMENT_SPLIT.split(cmd):
        seg = seg.strip()
        if not seg:
            continue
        # step over leading env assignments and simple prefixes
        words = seg.split()
        i = 0
        while i < len(words) and ("=" in words[i].split("/")[0] and not words[i].startswith("-")):
            i += 1
        while i < len(words) and os.path.basename(words[i]) in ("sudo", "time", "nice", "nohup", "command", "timeout"):
            i += 1
            if i < len(words) and words[i].lstrip("-").isdigit():
                i += 1
        if i >= len(words):
            continue
        yield os.path.basename(words[i].strip("\"'")), " ".join(words[i:])


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
    for first, seg in command_segments(cmd):
        if first not in DUMPERS or any(lim in cmd for lim in LIMITERS):
            continue
        for tok in seg.split()[1:]:
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
    for first, seg in command_segments(cmd):
        if not SCANNERS.fullmatch(first):
            continue
        recursive = re.search(r"(?:^|\s)(?:-r|-R|--recursive)(?:\s|$)", seg) or first in ("find", "fd")
        if not recursive:
            continue
        if WHOLE_ROOT.search(seg):
            return "a recursive scan rooted at the whole disk or the whole home directory"
    return None


def endless_loop(cmd):
    if FOREVER.search(cmd) and not any(b in cmd for b in BOUNDS):
        return "a loop with no bound and no timeout"
    return None


def strip_heredocs(cmd):
    """The command without its heredoc bodies: a body is data for another program."""
    kept, pending = [], []
    for line in cmd.split("\n"):
        if pending:
            if line.strip() == pending[0]:
                pending.pop(0)
            continue
        kept.append(line)
        pending.extend(m.group(2) for m in HEREDOC.finditer(line))
    return "\n".join(kept)


def pipelines(cmd):
    """The top-level pipelines of a command as lists of stages: split on ; && || & and line
    breaks, stages on |, never inside quotes, $( ), backticks or a # comment."""
    text = strip_heredocs(cmd)
    out, stages, cur = [], [], []
    quote, depth, i, n = None, 0, 0, len(text)

    def cut(segment_ends):
        stages.append("".join(cur).strip())
        cur.clear()
        if segment_ends:
            out.append([s for s in stages if s])
            stages.clear()

    while i < n:
        c = text[i]
        if quote:
            cur.append(c)
            if c == "\\" and quote != "'" and i + 1 < n:
                cur.append(text[i + 1])
                i += 1
            elif c == quote:
                quote = None
        elif c == "\\" and i + 1 < n:
            cur.append(text[i:i + 2])
            i += 1
        elif c in "'\"`":
            quote = c
            cur.append(c)
        elif c == "#" and (i == 0 or text[i - 1].isspace()):
            j = text.find("\n", i)
            i = n if j < 0 else j
            continue
        elif c == "(":
            depth += 1
            cur.append(c)
        elif c == ")" and depth:
            depth -= 1
            cur.append(c)
        elif depth == 0 and text.startswith(("&&", "||"), i):
            cut(True)
            i += 1
        elif depth == 0 and c in ";\n":
            cut(True)
        elif depth == 0 and c == "|":
            cut(False)
            if text.startswith("|&", i):
                i += 1
        elif depth == 0 and c == "&" and text[i - 1:i] != ">" and text[i + 1:i + 2] != ">":
            cut(True)
        else:
            cur.append(c)
        i += 1
    cut(True)
    return [p for p in out if p]


def words(stage, keep=False):
    """The shell words of one stage with their quotes removed (kept as written with keep=True):
    enough for a gate, not a shell."""
    out, cur, quote, quoted = [], [], None, False
    i, n = 0, len(stage)
    while i < n:
        c = stage[i]
        if quote:
            if c == quote:
                quote = None
                cur.append(c if keep else "")
            elif c == "\\" and quote == '"' and i + 1 < n and stage[i + 1] in '"\\$`':
                cur.append(stage[i:i + 2] if keep else stage[i + 1])
                i += 1
            else:
                cur.append(c)
        elif c in "'\"":
            quote, quoted = c, True
            cur.append(c if keep else "")
        elif c == "\\" and i + 1 < n:
            cur.append(stage[i:i + 2] if keep else stage[i + 1])
            i += 1
        elif c.isspace():
            if cur or quoted:
                out.append("".join(cur))
            cur, quoted = [], False
        else:
            cur.append(c)
        i += 1
    if cur or quoted:
        out.append("".join(cur))
    return out


def command_words(stage):
    """A stage's words from its command on: env assignments and wrappers (sudo, timeout 60,
    nohup, env ...) stepped over, as command_segments does for rules 1-4."""
    ws = words(stage)
    i = 0
    while i < len(ws):
        if ASSIGNMENT.match(ws[i]):
            i += 1
        elif os.path.basename(ws[i]) in WRAPPERS:
            i += 1
            while i < len(ws) and (ws[i].startswith("-") or DURATION.fullmatch(ws[i])
                                   or ASSIGNMENT.match(ws[i])):
                i += 1
        else:
            break
    return ws[i:]


def expand(text, known, whole=False):
    """$NAME and ${NAME} replaced by what is known of them, escaped so the words stay as bash
    would make them (whole=True: an assignment's value, which bash never splits). Single-quoted
    text, unknown names, $(...) and backticks stay as written."""
    out, quote, i, n = [], None, 0, len(text)
    while i < n:
        c = text[i]
        m = VAR.match(text, i) if c == "$" and quote != "'" else None
        name = m and (m.group(1) or m.group(2))
        if name in known:
            special = '"\\$`' if quote == '"' else '"\'\\$`' + (" \t\n" if whole else "")
            out.append("".join("\\" + ch if ch in special else ch for ch in known[name]))
            i = m.end()
            continue
        if c == "\\" and quote != "'" and i + 1 < n:
            out.append(text[i:i + 2])
            i += 2
            continue
        if c in "'\"" and quote in (None, c):
            quote = None if quote else c
        out.append(c)
        i += 1
    return "".join(out)


def remember(stages, known):
    """True when the segment holds only simple assignments (NAME=value, NAME="value",
    NAME='value', after an optional export); each value, expanded with what is known at that
    point, is recorded for the segments after it. Later assignments override earlier ones."""
    ws = words(stages[0], keep=True) if len(stages) == 1 else []
    ws = ws[1:] if ws[:1] == ["export"] else ws
    pairs = [ASSIGNED.fullmatch(w) for w in ws]
    if not pairs or not all(pairs):
        return False
    for m in pairs:
        known[m.group(1)] = "".join(words(expand(m.group(2), known, whole=True)))
    return True


def operands(ws):
    """The file operands of a cat / less / more, sed -n, head or tail stage; [] for others."""
    name = os.path.basename(ws[0])
    if name in READERS:
        return reader_files(ws)
    if name not in ("head", "tail") and not quiet_sed(ws):
        return []
    takes = ("-e", "-f", "--expression", "--file") if name == "sed" else ("-n", "-c", "--lines", "--bytes")
    found, skip = [], False
    for w in ws[1:]:
        if skip:
            skip = False
        elif w in takes:
            skip = True
        elif not w.startswith("-") and not re.match(r"[0-9&]?[<>]", w):
            found.append(w)
    if name == "sed" and not any(w in takes or w.startswith(("-e", "--expression=")) for w in ws[1:]):
        found = found[1:]      # without -e the first operand is the script, not a file
    return found


def lines_over(path, cwd, limit=MAX_LINES, text_only=False):
    """True when the file holds more than `limit` lines, counted as wc -l counts them; None
    when it cannot be measured (missing, unreadable, not a regular file, a glob, an
    expansion, or not text when text_only). The count stops at the first line past it."""
    if not path or any(ch in path for ch in UNRESOLVED):
        return None
    full = os.path.expanduser(path)
    full = os.path.join(cwd, full) if cwd else full
    if full.startswith(("/proc/", "/sys/", "/dev/")) or not os.path.isfile(full):
        return None
    count = seen = 0
    try:
        with open(full, "rb") as f:
            while seen < COUNT_CAP:
                chunk = f.read(65536)
                if not chunk:
                    break
                if text_only and not seen and b"\0" in chunk[:8192]:
                    return None
                seen += len(chunk)
                count += chunk.count(b"\n")
                if count > limit:
                    return True
    except OSError:
        return None
    return False


def reader_files(ws):
    """The files a cat / less / more stage reads: its operands and a `< FILE` input."""
    files, skip, feed = [], False, False
    for w in ws[1:]:
        if skip:
            skip = False
        elif feed:
            files.append(w)
            feed = False
        elif w in ("<", "0<"):
            feed = True
        elif REDIRECT_WORD.fullmatch(w):
            skip = True
        elif w.startswith("<") and not w.startswith("<<"):
            files.append(w[1:])
        elif not re.match(r"[0-9&]?[<>]", w) and (w == "-" or not w.startswith("-")):
            files.append(w)
    return files


def quiet_sed(ws):
    """sed -n / --quiet / --silent: sed prints only what its script names."""
    return os.path.basename(ws[0]) == "sed" and any(
        w in ("--quiet", "--silent") or re.fullmatch(r"-[A-Za-z]*n[A-Za-z]*", w) for w in ws[1:])


def counts(ws):
    """uniq -c / --count: the `sort | uniq -c` digest."""
    return os.path.basename(ws[0]) == "uniq" and any(
        w == "--count" or re.fullmatch(r"-[A-Za-z]*c[A-Za-z]*", w) for w in ws[1:])


def line_count_arg(ws):
    """The N of head / tail -n N, -nN, --lines=N, --lines N or -N; None without one."""
    for j, w in enumerate(ws[1:], 1):
        m = COUNT_OPT.fullmatch(w)
        if m:
            return int(next(g for g in m.groups() if g))
        if w in ("-n", "--lines") and j + 1 < len(ws) and ws[j + 1].isdigit():
            return int(ws[j + 1])
    return None


def bounded_after(stages, i):
    """True when what stage i prints never reaches the conversation whole: it goes to a
    file, or a later stage counts, slices, filters or digests it."""
    for k, stage in enumerate(stages[i:]):
        if STDOUT_TO_FILE.search(stage):
            return True
        ws = command_words(stage) if k else None
        if ws and (os.path.basename(ws[0]) in BOUNDERS or quiet_sed(ws) or counts(ws)):
            return True
    return False


def slice_wanted(ws, cwd):
    """Why this stage would pour more than MAX_LINES lines, or None."""
    name = os.path.basename(ws[0])
    if name in READERS:
        for path in reader_files(ws):
            if lines_over(path, cwd):
                return "`%s %s` pours a file of more than %d lines whole" % (name, path, MAX_LINES)
    elif quiet_sed(ws):
        ranges = [(int(a), b) for w in ws[1:] for a, b in SED_RANGE.findall(w)]
        span = sum(int(b) - a + 1 for a, b in ranges if b != "$" and int(b) >= a)
        if span > MAX_LINES:
            return "`sed -n` asks for %d lines" % span
        files = [w for w in ws[1:] if not w.startswith("-") and not SED_RANGE.search(w)]
        for a in [a for a, b in ranges if b == "$"]:
            for path in files:
                if lines_over(path, cwd, a - 1 + MAX_LINES):
                    return ("`sed -n '%d,$p'` pours %s from line %d to its end, more than %d lines"
                            % (a, path, a, MAX_LINES))
    elif name in ("head", "tail"):
        n = line_count_arg(ws)
        if n is not None and n > MAX_LINES:
            return "`%s` asks for %d lines" % (name, n)
    return None


def whole_file_bash(cmd, cwd, blind):
    """Rule 5 for Bash: a cat / less / more of a file over MAX_LINES lines, or a sed -n / head /
    tail window over MAX_LINES lines, with nothing downstream bounding it. Paths are read after
    the command line's own assignments, $HOME and $CLAUDE_PROJECT_DIR are resolved; an operand
    of an unbounded stage that stays unresolved is added to `blind`."""
    known = {"HOME": os.path.expanduser("~")}
    if cwd:
        known["CLAUDE_PROJECT_DIR"] = cwd
    for stages in pipelines(cmd):
        if remember(stages, known):
            continue
        for i, stage in enumerate(stages):
            if HEREDOC.search(stage):
                continue          # a heredoc feeds its own text, not a file
            ws = command_words(expand(stage, known))
            if not ws or bounded_after(stages, i):
                continue
            why = slice_wanted(ws, cwd)
            if why:
                return why
            blind.extend(p for p in operands(ws) if any(ch in p for ch in UNRESOLVED))
    return None


def whole_file_read(tool_input, cwd):
    """Rule 5 for the Read tool: a file over MAX_LINES lines with no limit, or a limit over
    MAX_LINES. Images, PDFs, notebooks and files it cannot measure are the Read tool's own."""
    path = tool_input.get("file_path")
    if not isinstance(path, str) or path.lower().endswith(NOT_LINES):
        return None
    over = lines_over(path, cwd, text_only=True)
    if over is None:
        return None
    limit = tool_input.get("limit")
    if isinstance(limit, (int, float)) and not isinstance(limit, bool) and limit > MAX_LINES:
        return "the Read asks for %d lines of %s" % (limit, path)
    if limit is None and over:
        return "%s holds more than %d lines and the Read names no limit" % (path, MAX_LINES)
    return None


def runs_vitest(ws):
    """vitest itself, a package runner calling it, or the package `test` script (vitest run)."""
    name = os.path.basename(ws[0])
    return (name == "vitest"
            or (name in RUNNERS and any(os.path.basename(w) in ("vitest", "vitest.mjs") for w in ws[1:]))
            or (name in ("pnpm", "npm", "yarn", "bun") and "test" in ws[1:]))


def long_wait(tool_input, cmd):
    """Rule 6: why this subagent Bash call would wait past 4 minutes, or None."""
    timeout = tool_input.get("timeout")
    if isinstance(timeout, (int, float)) and not isinstance(timeout, bool) and timeout > LONG_WAIT_MS:
        return "a timeout of %d ms" % timeout
    if tool_input.get("run_in_background"):
        return "run_in_background"
    for stages in pipelines(cmd):
        for stage in stages:
            ws = command_words(stage)
            if not ws:
                continue
            name = os.path.basename(ws[0])
            ops = [w for w in ws[1:] if not w.startswith("-")]
            script = name if name in LONG_SCRIPTS else (
                os.path.basename(ops[0]) if name in SHELLS and ops else "")
            if script in LONG_SCRIPTS:
                return "it runs %s" % script
            pkg = [w for w in ops if LONG_PKG_SCRIPT.fullmatch(w)]
            if name in RUNNERS and pkg:
                return "it runs the package script %s" % pkg[0]
            if runs_vitest(ws) and not any(".test." in w for w in ws):
                return "a vitest run with no .test. file named"
    return None


def subagent_transcript(payload, to):
    """Rule 8: the transcript of the subagent `to` names, or None when `to` names no subagent of
    this session on this disk (a name, "main", another session's address, a team-mate)."""
    if not isinstance(to, str) or not to.strip() or "/" in to or "\0" in to:
        return None
    folder = SUBAGENTS_DIR
    if not folder:
        main = payload.get("transcript_path")
        if isinstance(main, str) and main:
            session = os.path.splitext(main)[0]
        else:
            sid, cwd = payload.get("session_id"), payload.get("cwd")
            if not (isinstance(sid, str) and sid and isinstance(cwd, str) and cwd):
                return None
            # a project's folder is its cwd with every character but A-Z a-z 0-9 made a dash:
            # /home/dxb/DxB Global OS -> -home-dxb-DxB-Global-OS
            session = os.path.join(os.path.expanduser("~"), ".claude", "projects",
                                   re.sub(r"[^A-Za-z0-9]", "-", cwd), sid)
        folder = os.path.join(session, "subagents")
    path = os.path.join(folder, "agent-%s.jsonl" % to)
    return path if os.path.isfile(path) else None


def transcript_tail(path):
    """Rule 8: (the timestamp of the last line that has one, the context of the last assistant
    turn or None), from the last TAIL_BYTES of the transcript, never the whole file."""
    with open(path, "rb") as f:
        f.seek(0, os.SEEK_END)
        start = max(0, f.tell() - TAIL_BYTES)
        f.seek(start)
        lines = f.read().split(b"\n")[1 if start else 0:]    # the seek cut the first line
    stamp = tokens = None
    for raw in reversed(lines):
        try:
            entry = json.loads(raw)
        except Exception:
            continue
        if not isinstance(entry, dict):
            continue
        if stamp is None and "timestamp" in entry:
            stamp = entry["timestamp"]
        msg = entry.get("message")
        usage = msg.get("usage") if entry.get("type") == "assistant" and isinstance(msg, dict) else None
        if tokens is None and isinstance(usage, dict):
            tokens = sum(int(usage.get(k) or 0) for k in CONTEXT_KEYS) or None  # a synthetic turn is all 0
        if stamp is not None and tokens is not None:
            break
    return stamp, tokens


def cold_resume(payload):
    """Rule 8: (target, idle minutes, context tokens or None, transcript) when this SendMessage
    resumes a subagent idle more than COLD_AFTER_S seconds, else None."""
    to = (payload.get("tool_input") or {}).get("to")
    path = subagent_transcript(payload, to)
    if not path:
        return None
    stamp, tokens = transcript_tail(path)
    if not isinstance(stamp, str):
        return None
    last = datetime.fromisoformat(stamp.replace("Z", "+00:00"))    # malformed raises: allowed
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    idle = time.time() - last.timestamp()
    if idle <= COLD_AFTER_S:          # a stamp in the future (clock skew) lands here too
        return None
    return to, int(idle // 60), tokens, path


ADVICE = """MEASURE FIRST, THEN SPEND:
  size of the target      ls -l FILE | awk '{print $5}'      wc -l FILE
  a slice, not the whole  sed -n '1,80p' FILE                head -c 4000 FILE
  cheap search first      grep -c "keyword" FILE   -> then narrow inside the hits
  context, not windows    grep -n -C 3 "keyword" FILE
  bound every scan        name a real directory, add -m / --max-count / timeout"""

SLICE_ADVICE = """Measured history: on 2026-09-26/27 the weekly quota burned on new tokens entering
contexts; writers poured 500-2,000-line files whole into the conversation.
MEASURE FIRST, THEN READ A SLICE (%d lines at most):
  size of the target      wc -l FILE
  a slice, not the whole  sed -n 'A,Bp' FILE                 head -c 4000 FILE
  the place, not the file grep -n -C 3 word FILE
  with the Read tool      offset + limit, limit %d at most""" % (MAX_LINES, MAX_LINES)

LONG_WAIT = ("a command that waits more than 4 minutes belongs to the lead — the writer's cache "
             "dies at 5 minutes and the whole context is re-written (2.4 M tokens on 2026-09-26/27); "
             "finish your lane, put the command in your note")
LONG_WAIT_ADVICE = ("Your lane's own tests stay yours: name the file, "
                    "pnpm exec vitest run tests/<dir>/<name>.test.ts")

COLD_RESUME = ("`SendMessage` to %s resumes a subagent idle for %d min — its prompt cache died at 5; "
               "a resume re-writes its whole context (%s tokens) as new tokens "
               "(measured 2026-09-26/27: six resumes, 2.4 M)")
COLD_RESUME_ADVICE = ("Open a FRESH `builder` (description `guarded: …`) with the verifier's A/B list, "
                      "the lane's done-list and the diff to read; a fresh writer starts at ~22 k.")


def refuse(where, target, reason, advice):
    """Rules 5, 6 and 8 refuse as rules 1-4 do: exit 2, the reason on stderr for the model."""
    sys.stderr.write("BLOCKED by dxb-cost-gate — %s: %s\nReason: %s.\n%s\n"
                     % (where, target[:300], reason, advice))
    return 2


def rebind(tool_input, command):
    """Rule 7: the same Bash call, allowed, with the snapshot's ugrep function dropped first.
    updatedInput replaces the whole input, so every other field travels unchanged."""
    if not command.strip() or command.lstrip().startswith(REBIND.rstrip()):
        return
    updated = dict(tool_input)
    updated["command"] = REBIND + command
    sys.stdout.write(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse", "updatedInput": updated}}) + "\n")


def log_decision(payload, decision, paths, **extra):
    """One JSON line in DECISION_LOG: the paths and the decision's own fields only, never the
    command or a message's text, so no secret a call carries lands in a log. A gate that cannot
    log still decides."""
    try:
        os.makedirs(LOG_DIR, exist_ok=True)
        with open(DECISION_LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps(dict({
                "ts": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime()),
                "session_id": payload.get("session_id"), "agent_type": payload.get("agent_type"),
                "tool": payload.get("tool_name"), "paths": paths[:20], "decision": decision},
                **extra)) + "\n")
    except Exception:
        pass


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0

    tool = payload.get("tool_name", "")
    tool_input = payload.get("tool_input", {}) or {}
    cwd = payload.get("cwd") or ""

    if tool == "Read":
        try:
            reason = whole_file_read(tool_input, cwd)
        except Exception:
            return 0
        if reason:
            return refuse("Read tool", str(tool_input.get("file_path")), reason, SLICE_ADVICE)
        return 0

    if tool == "SendMessage":
        try:
            cold = cold_resume(payload)
        except Exception:
            return 0
        if not cold:
            return 0
        to, minutes, tokens, path = cold
        log_decision(payload, "deny", [path], why="resume-cold", idle_min=minutes, context_tokens=tokens)
        return refuse("SendMessage to a subagent", to, COLD_RESUME % (
            to, minutes, "unknown" if tokens is None else "{:,}".format(tokens)), COLD_RESUME_ADVICE)

    if tool == "Grep":
        target = tool_input.get("pattern", "") or ""
        label = "Grep pattern"
        checks = [search_bomb]
    elif tool == "Bash":
        target = tool_input.get("command", "") or ""
        label = "Bash command"
        checks = [big_file_flood, whole_disk_scan, endless_loop]
        if any(SCANNERS.fullmatch(w) for w, _ in command_segments(target)):
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

    if tool != "Bash":
        return 0
    agent = payload.get("agent_type")
    held = isinstance(agent, str) and bool(agent.strip())
    blind = []
    for where, check, tail, advice in (
            ("Bash command", lambda: whole_file_bash(target, cwd, blind), "", SLICE_ADVICE),
            ("Bash command in a subagent (%s)" % agent, lambda: held and long_wait(tool_input, target),
             " — " + LONG_WAIT, LONG_WAIT_ADVICE)):
        try:
            reason = check()
        except Exception:
            continue
        if reason:
            return refuse(where, target, reason + tail, advice)
    if blind:
        log_decision(payload, "unmeasured-path", blind)
    try:
        rebind(tool_input, target)
    except Exception:
        pass
    return 0


if __name__ == "__main__":
    sys.exit(main())
