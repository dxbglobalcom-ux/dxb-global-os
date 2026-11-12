#!/usr/bin/env python3
"""DXB effort (UserPromptSubmit): the session sets its own level by the course of the talk.

The CEO's order of 2026-11-10: he does not switch the effort and is never asked to; the session does, by
itself, as the talk moves between a question and a plan. Talk runs at medium; a plan, a design, an
architecture or code at high; a truly complex, important job at xhigh; max is not used. Before it, from
2026-10-06, he switched with /effort and the session warned him on every reply; the modes that carried
those warnings (`plan`, `plan-max`, `build`, `off`) and their lines are gone with that rule. The file keeps
its name because the settings, the status line and the ledger point at it.

How the level is set. Three small skills carry it in their `effort` field: dxb-effort-medium,
dxb-effort-high, dxb-effort-xhigh. Opening one sets the level of the turn it is opened in, in the
background, and the level ends with that turn (measured 2026-11-10 on Claude Code 2.1.322: in a session at
high the steps after `effort: medium` ran at medium and the steps after `effort: xhigh` at xhigh, in the
transcript's own record). A hook cannot open a skill, so on each of his messages it tells the lead the
session's own level and asks it to decide, before it thinks about the substance (the CEO, 2026-10-12: the
level comes before the thinking), what the reply needs; when that is another level, opening its skill is
the lead's first action. A message that names a plan, a design or an architecture -- or his permission
mode `plan` -- also tells the lead to open the dxb-team3 door (the CEO, 2026-10-09). A report arriving
through the prompt -- a prompt that opens with `<task-notification>`: a subagent's, or a background
command's completion (measured 2026-11-11) -- is not his message and gets none of that text; his own
message quoting that tag after other words is his message. In a dxb-team3 job managing -- opening a hand,
writing a brief, verifying a piece that came back -- runs at high, with xhigh open for thinking through
the distribution (the CEO, 2026-11-11, for that door only). The hook cannot see which door is open, so the
scope is in the text it prints: the list he is answered from names managing first, "in a dxb-team3 job",
and when a report opens a turn in a session below high, or whose level is not known, the hook says in one
line that in such a job verifying it is managing (measured 2026-11-11: such a turn fell back to medium and
a money piece was verified there). The door's other points of that day live in the door alone and are not printed here.

The session's own level. Neither the hook's stdin nor its environment carries the effort (measured
2026-10-06). It is the newest, by timestamp, of the status line's record
$XDG_RUNTIME_DIR/claude-ctx/<session_id>.json (field `effort`, written on each render: the session's
setting, which a skill's lift does not change -- measured 2026-11-10) and this session's last /effort row
in the transcript (`<local-command-stdout>Set effort level to <level> ...`, written when he switches
between turns). An assistant step in the transcript carries the level it ran at, which may be a skill's
lift, so a step never tells the session's own level (Sol A1, 2026-11-10: with no record, the last turn's
xhigh lift was read as the session's level and the next reply's skill was skipped). A source that cannot
be read is not known; none known: unknown, and the lead opens the skill of the level the reply needs. Every
file read is bounded (the transcript's tail, a few KB of the record).

The quota. On every turn -- his message or a report -- the hook also says, in one line, how full the
account's 5-hour window and its week are, as the status line last wrote them to
$XDG_RUNTIME_DIR/claude-ctx/rate-limits.json, with the record's age (the CEO, 2026-11-12: a long writer was
opened into a window standing at 86 % and the window ran out 22 minutes later; the number was in that file
and nothing read it). A report gets the line even in a session at high: a hand coming back is the moment
the lead decides the next one. It is a number and a pointer to the door (dxb-team3 section 3), never a
gate: what the lead does with it is the door's. A window whose reset time passed after the record was
written is said to have reset, not quoted; a percentage that is no percentage (not a finite number from 0 to
100), or a reset time older than the record itself, makes that window not known; a record older than
QUOTA_MAX_AGE_S, from the future, unreadable or with both windows not known gives no line. Whatever goes
wrong while the quota is read costs the quota line alone, never the text about the level (Sol's pass,
2026-11-12: an integer of 400 digits in the record silenced the whole answer).

Only a session id shaped like Claude Code's (SESSION_ID) ever names a file, so no path leaves the folder;
the record folder is trusted only as a real directory (not a link) owned by this user; the record is
reached through its folder's descriptor without following a link, and only a regular file counts (a
planted link or FIFO must neither redirect a read nor block the hook). The hook keeps no state and writes
no file. Stdlib only. As a hook it never fails a session: on any failure it exits 0 with nothing on stdout
or stderr. It takes no argument: with one it exits 2 and names the skills on stderr.
"""

import json
import math
import os
import re
import stat
import sys
import time
from datetime import datetime, timezone

SESSION_ID = re.compile(r"[0-9a-f-]{8,}", re.IGNORECASE)
LEVELS = ("low", "medium", "high", "xhigh", "max")
MANAGING_LEVELS = ("high", "xhigh", "max")  # a session already there needs no lift to verify a hand's piece
RUNTIME = os.environ.get("XDG_RUNTIME_DIR") or "/tmp"
CTX_DIR = os.path.join(RUNTIME, "claude-ctx")
DIR_FLAGS = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
FILE_FLAGS = os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK
TAIL_BYTES = 256 * 1024
SMALL_BYTES = 4 * 1024  # the status line's record is a few dozen bytes
QUOTA_FILE = "rate-limits.json"  # one for the whole machine: the quota is the account's, not a session's
QUOTA_MAX_AGE_S = 6 * 3600  # an older record is not trusted -- the same age ~/.local/bin/dxb-quota stops at
LONGEST_WINDOW_S = 8 * 86400  # the longest window is the week; a reset further away than this is no reset time
FIVE_HOUR = "the account's 5-hour window"
WEEK = "the week"
SKILLS = ('`Skill("dxb-effort-medium")`, `Skill("dxb-effort-high")` or `Skill("dxb-effort-xhigh")`')
# the whole row is the command's output -- a quotation of it inside his own words is not a switch (Sol A3)
SWITCHED = re.compile(r"<local-command-stdout>Set effort level to (low|medium|high|xhigh|max)\b[^<]*"
                      r"</local-command-stdout>")
# his words that turn the talk to a plan, a design or an architecture -- Turkish stems and English words,
# matched at a word's start so "explain" and "planet" stay out
PLAN_WORDS = re.compile(r"(?<!\w)(plan(?!et)\w*|tasar[ıi]m\w*|tasarla\w*|mimari\w*|design\w*|architect\w*)",
                        re.IGNORECASE)
USAGE = ("dxb-effort-warn.py takes no argument: the modes plan|plan-max|build|off are gone (the CEO, 2026-11-10). "
         "The session sets its own level with the skills dxb-effort-medium, dxb-effort-high and dxb-effort-xhigh "
         "(dxb-team3 section 2); there is nothing to switch on or off.\n")


def sync(level):
    """What the lead is told on each of his messages: the session's level, what each level is for, the skills."""
    if level:
        runs = f"This session runs at {level}."
        act = (f"If the level the reply needs is not {level}, your first action is {SKILLS} -- the one the reply "
               f"needs: it sets this turn's level in the background and ends with the turn.")
    else:
        runs = "This session's own level is not known yet."
        act = (f"Your first action is the skill of the level the reply needs -- {SKILLS}: it sets this turn's "
               f"level in the background and ends with the turn.")
    return (
        "EFFORT -- first, before you think about the substance of his message. The session sets its own level by "
        "the course of the talk; he does not switch it and is never asked to (the CEO, 2026-11-10). "
        f"{runs} Decide what this reply is:\n"
        "- in a dxb-team3 job, a managing turn -- you open a hand (the Agent tool), write a brief or verify a piece "
        "that came back: high; xhigh is open while you think through who does what (the CEO, 2026-11-11, for that "
        "door only);\n"
        "- talk, a question, a fact, a reading or a record: medium;\n"
        "- a plan, a design, an architecture, or code: high -- short code (a few dozen lines of narrow glue, a "
        "merge or a setting, tried at once) may stay at medium; the measure is what an error costs, so code that "
        "deletes or moves data, touches money or the approval gate, security or permissions, runs in parallel or "
        "changes many places at once is high; no code at low;\n"
        "- a truly complex, important job's plan or work: xhigh.\n"
        f"{act} When the level you work at differs from the reply before, open the reply with a few words naming "
        "it and why (\"high: plan\"); otherwise say nothing about effort. max is not used.")


def hand_back(level):
    """What the lead is told, in one line, when a report opens the turn: in a dxb-team3 job verifying it is
    managing, and managing runs at high. Measured 2026-11-11: such a turn fell back to the session's medium and a
    money piece was verified there. A background command's completion opens with the same tag as a hand's report
    (measured the same day), so the line names both; the scope is in the line because his word keeps the point
    inside that door."""
    runs = f"This session runs at {level}" if level else "This session's own level is not known"
    return ("A report has arrived -- a hand's or a background command's, not his message. In a dxb-team3 job, "
            "verifying a piece, writing a brief and opening a hand are managing, and managing runs at high (the CEO, "
            f"2026-11-11, for that door only). {runs}: if this turn does any of them in such a job, your first action "
            "is `Skill(\"dxb-effort-high\")`.")


def open_door():
    # the CEO, 2026-10-09: "plan konuşacağız dediğimde direkt DXP Team 2 açılmalı" -- a hook cannot open a
    # skill, so it tells the lead to open the door, after the level
    return ("His message names a plan, a design or an architecture, or his permission mode is plan: if the reply "
            "would plan, design, propose or evaluate one -- anything beyond plain facts about what exists -- and "
            "the dxb-team3 door is not already open in this session, open it with `Skill(\"dxb-team3\")` and ask "
            "the job inside the door, not in Claude Code's generic plan mode, whose click-box questions do not "
            "reach him (the CEO, 2026-10-09).")


def session_name(session_id):
    """The session's file name, or None when the id could name anything but a file in the folder."""
    if not isinstance(session_id, str) or not SESSION_ID.fullmatch(session_id):
        return None
    return session_id


def open_dir(path):
    """A descriptor on the folder, or None when it is missing, a link or not this user's."""
    try:
        fd = os.open(path, DIR_FLAGS)
    except OSError:  # missing, or a link (O_NOFOLLOW), or not a directory
        return None
    if os.fstat(fd).st_uid != os.getuid():
        os.close(fd)
        return None
    return fd


def read_regular(name, dir_fd=None, limit=SMALL_BYTES, tail=False):
    """At most `limit` bytes of a regular file (its last `limit` bytes when `tail`), or None -- a link, a FIFO or
    nothing is None. A read error is raised; each source catches its own. A file growing while it is read is
    still read no further than `limit`."""
    try:
        fd = os.open(name, FILE_FLAGS, dir_fd=dir_fd)
    except OSError:
        return None
    try:
        info = os.fstat(fd)
        if not stat.S_ISREG(info.st_mode):
            return None
        if tail and info.st_size > limit:
            os.lseek(fd, info.st_size - limit, os.SEEK_SET)
        chunks = []
        left = limit
        while left > 0:
            chunk = os.read(fd, min(65536, left))
            if not chunk:
                break
            chunks.append(chunk)
            left -= len(chunk)
        return b"".join(chunks)
    finally:
        os.close(fd)


def parse_ts(value):
    if not isinstance(value, str):
        return None
    try:
        moment = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)


def record_level(name):
    """(timestamp, level) from the status line's record of this session, or None -- also when it cannot be read."""
    try:
        dir_fd = open_dir(CTX_DIR)
        if dir_fd is None:
            return None
        try:
            raw = read_regular(f"{name}.json", dir_fd=dir_fd)
        finally:
            os.close(dir_fd)
        record = json.loads(raw) if raw is not None else None
    except (OSError, ValueError):
        return None
    if not isinstance(record, dict) or record.get("session_id") != name or record.get("effort") not in LEVELS:
        return None
    moment = parse_ts(record.get("ts"))
    return (moment, record["effort"]) if moment else None


def switched_level(row):
    """The level a /effort row names, or None."""
    if row.get("type") != "user":
        return None
    content = row["message"].get("content") if isinstance(row.get("message"), dict) else None
    if not isinstance(content, str):
        return None
    found = SWITCHED.fullmatch(content.strip())
    return found.group(1) if found else None


def switch_level(path, name):
    """(timestamp, level) of this session's last /effort row in the transcript's tail, or None -- also when it
    cannot be read. A row of another session, or one naming no session, does not count; an assistant step
    never counts (it may carry a skill's lift)."""
    if not isinstance(path, str) or not path:
        return None
    try:
        raw = read_regular(path, limit=TAIL_BYTES, tail=True)
    except OSError:
        return None
    if raw is None:
        return None
    for line in reversed(raw.splitlines()):
        try:
            row = json.loads(line)
        except ValueError:  # the tail's cut first line, or a torn last one
            continue
        if not isinstance(row, dict) or row.get("sessionId") != name:
            continue
        level = switched_level(row)
        if level in LEVELS:
            moment = parse_ts(row.get("timestamp"))
            if moment:
                return moment, level
    return None


def quota_record():
    """The account's quota record as the status line last wrote it, or None -- also when it cannot be read."""
    try:
        dir_fd = open_dir(CTX_DIR)
        if dir_fd is None:
            return None
        try:
            raw = read_regular(QUOTA_FILE, dir_fd=dir_fd)
        finally:
            os.close(dir_fd)
        record = json.loads(raw) if raw is not None else None
    except (OSError, ValueError):
        return None
    return record if isinstance(record, dict) else None


def number(value):
    """A finite number that is not a bool, or None."""
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    try:
        finite = math.isfinite(value)
    except OverflowError:  # an integer too large for a float
        return None
    return value if finite else None


def window(raw, now, written):
    """One window of the record: (used percent, seconds to its reset or None); "reset" when its reset time
    passed after the record was written -- the percentage is then the last window's; None when the record does
    not carry it, or carries what cannot be one: a percentage outside 0..100, a reset time older than the record
    itself. A reset further away than any window is long is dropped and the percentage kept."""
    if not isinstance(raw, dict):
        return None
    used = number(raw.get("used_percentage"))
    if used is None or not 0 <= used <= 100:
        return None
    resets = number(raw.get("resets_at"))
    if resets is None or resets - now > LONGEST_WINDOW_S:
        return used, None
    if resets <= written:
        return None
    if resets <= now:
        return "reset"
    return used, resets - now


def window_text(label, found):
    if found is None:
        return f"{label} is not known"
    if found == "reset":
        return f"{label} has reset since the record was written"
    used, left = found
    text = f"{label} is {used:g}% used"
    if left is not None:
        minutes = int(left // 60)
        text += f" and resets in {minutes // 60}h{minutes % 60:02d}m"
    return text


def quota_line(now=None):
    """The one line that says how full the account's windows are, or None when nothing trustworthy says it."""
    record = quota_record()
    if record is None:
        return None
    now = time.time() if now is None else now
    written = parse_ts(record.get("written_at"))
    if written is None:
        return None
    age = now - written.timestamp()
    if age < 0 or age > QUOTA_MAX_AGE_S:
        return None
    five = window(record.get("five_hour"), now, written.timestamp())
    week = window(record.get("seven_day"), now, written.timestamp())
    if five is None and week is None:
        return None
    return (f"QUOTA -- {window_text(FIVE_HOUR, five)}; {window_text(WEEK, week)} "
            f"(the status line's record, {int(age // 60)} min old). In a dxb-team3 job weigh it before you open "
            "a writing hand and when one returns (section 3).")


def own_level(name, transcript_path):
    """The session's own level -- its setting, never a skill's lift -- or None when nothing tells it."""
    known = [found for found in (record_level(name), switch_level(transcript_path, name)) if found]
    if not known:
        return None
    # the record first, so on a tie the live one wins
    return max(known, key=lambda found: found[0])[1]


def on_hook(data):
    if data.get("hook_event_name") != "UserPromptSubmit":
        return
    name = session_name(data.get("session_id"))
    if name is None:
        return
    prompt = data.get("prompt")
    if not isinstance(prompt, str):
        return
    level = own_level(name, data.get("transcript_path"))
    # a subagent's report arriving is not his message (measured 2026-10-06: one tripped the net); it opens with
    # the tag (measured 2026-11-10), so his own message quoting the tag after other words still gets its answer
    # (Sol B2). It gets none of his message's text -- only, below high, the one line that in a dxb-team3 job the
    # turn verifying it is managing
    # the quota is said on every turn, a report's too: a hand coming back is when the next one is decided
    lines = []
    if prompt.lstrip().startswith("<task-notification>"):
        if level not in MANAGING_LEVELS:
            lines.append(hand_back(level))
    else:
        lines.append(sync(level))
        if data.get("permission_mode") == "plan" or PLAN_WORDS.search(prompt):
            lines.append(open_door())
    try:
        quota = quota_line()
    except Exception:  # the quota line is a convenience: its failure never costs the text about the level
        quota = None
    if quota:
        lines.append(quota)
    if not lines:
        return
    context = "\n".join(lines)
    output = {"hookSpecificOutput": {"hookEventName": "UserPromptSubmit", "additionalContext": context}}
    sys.stdout.write(json.dumps(output, ensure_ascii=False) + "\n")


def main():
    raw = sys.stdin.buffer.read()
    if not raw.strip():
        return
    data = json.loads(raw)
    if isinstance(data, dict):
        on_hook(data)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        sys.stderr.write(USAGE)
        sys.exit(2)
    try:
        main()
        sys.stdout.flush()
    except Exception:
        pass
    os._exit(0)
