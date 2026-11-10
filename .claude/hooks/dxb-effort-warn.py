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
mode `plan` -- also tells the lead to open the dxb-team3 door (the CEO, 2026-10-09). A subagent's report
arriving through the prompt -- a prompt that opens with `<task-notification>` -- is not his message and gets
nothing; his own message quoting that tag is his message.

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

Only a session id shaped like Claude Code's (SESSION_ID) ever names a file, so no path leaves the folder;
the record folder is trusted only as a real directory (not a link) owned by this user; the record is
reached through its folder's descriptor without following a link, and only a regular file counts (a
planted link or FIFO must neither redirect a read nor block the hook). The hook keeps no state and writes
no file. Stdlib only. As a hook it never fails a session: on any failure it exits 0 with nothing on stdout
or stderr. It takes no argument: with one it exits 2 and names the skills on stderr.
"""

import json
import os
import re
import stat
import sys
from datetime import datetime, timezone

SESSION_ID = re.compile(r"[0-9a-f-]{8,}", re.IGNORECASE)
LEVELS = ("low", "medium", "high", "xhigh", "max")
RUNTIME = os.environ.get("XDG_RUNTIME_DIR") or "/tmp"
CTX_DIR = os.path.join(RUNTIME, "claude-ctx")
DIR_FLAGS = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
FILE_FLAGS = os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK
TAIL_BYTES = 256 * 1024
SMALL_BYTES = 4 * 1024  # the status line's record is a few dozen bytes
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
        "- talk, a question, a fact, a reading or a record: medium;\n"
        "- a plan, a design, an architecture, or code: high -- short code (a few dozen lines of narrow glue, a "
        "merge or a setting, tried at once) may stay at medium; the measure is what an error costs, so code that "
        "deletes or moves data, touches money or the approval gate, security or permissions, runs in parallel or "
        "changes many places at once is high; no code at low;\n"
        "- a truly complex, important job's plan or work: xhigh.\n"
        f"{act} When the level you work at differs from the reply before, open the reply with a few words naming "
        "it and why (\"high: plan\"); otherwise say nothing about effort. max is not used.")


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
    # a subagent's report arriving is not his message (measured 2026-10-06: one tripped the net); it opens with
    # the tag (measured 2026-11-10), so his own message quoting the tag still gets its answer (Sol B2)
    if not isinstance(prompt, str) or prompt.lstrip().startswith("<task-notification>"):
        return
    context = sync(own_level(name, data.get("transcript_path")))
    if data.get("permission_mode") == "plan" or PLAN_WORDS.search(prompt):
        context += "\n" + open_door()
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
