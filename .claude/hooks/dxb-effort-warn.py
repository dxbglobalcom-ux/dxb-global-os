#!/usr/bin/env python3
"""DXB effort warning (UserPromptSubmit / `plan` / `build` / `off`): the CEO is told which /effort to switch to.

The CEO's order of 2026-10-06: he opens a session at effort high and switches it himself with /effort;
the session only warns him. Plan, design and architecture run at max; the build at high. Fable's review of
the same day made the warning start by itself and arrive in time:

  * `dxb-effort-warn.py plan|build|off`, run by the lead from Bash: sets (or, for `off`, removes) the
    mode of the session named by CLAUDE_CODE_SESSION_ID -- a file
    $XDG_RUNTIME_DIR/dxb-effort/<session_id> (/tmp/dxb-effort/ without XDG_RUNTIME_DIR) holding
    `plan` or `build` -- and answers with the session's live level and whether THIS reply carries the
    warning. `build` is run in the reply that asks him to approve the plan, so the high warning travels
    with the question and his "yes" can arrive at high.
  * UserPromptSubmit: while the session has a mode -- or, with none set, while his permission mode is
    `plan` -- and its live level does not match it (plan: max, build: high), each of his messages carries
    the warning into the session's context. With no mode and no plan permission mode, a message that names
    a plan, a design or an architecture reminds the lead to run `plan`, and a session whose level is not high
    -- or not yet known: then the lead reads CLAUDE_EFFORT in Bash -- reminds the lead to warn him before
    writing code.

Neither the hook's stdin nor its environment carries the effort (measured 2026-10-06: the input has no
effort field, and CLAUDE_EFFORT, which the Bash tool has, is absent from a UserPromptSubmit hook). The live
level is the newest, by timestamp, of the status line's record $XDG_RUNTIME_DIR/claude-ctx/<session_id>.json
(field `effort`, written on each render), this session's last assistant step in the transcript that
carries an `effort`, and this session's last /effort row in the transcript (`<local-command-stdout>Set
effort level to <level> ...`, written when he switches between turns; a switch made in the middle of a
turn writes none). A source that cannot be read is not known; none known: unknown. Every read is bounded
(the transcript's tail, a few KB elsewhere). The CLI finds the transcript at
~/.claude/projects/*/<session_id>.jsonl.

Only a session id shaped like Claude Code's (SESSION_ID) ever names a file, so no path leaves the
folders; the mode folder is trusted only as a real directory (not a link) owned by this user and
writable by no one else, the record folder only when owned by this user; every file is reached through
its folder's descriptor without following a link, and only a regular file counts (a planted link or
FIFO must neither redirect a write nor block the hook). The mode is written by an O_EXCL temporary
file and a rename. Stdlib only. As a hook it never fails a session: on any failure it exits 0 with
nothing on stdout or stderr. The CLI answers on stdout; it refuses with exit 2 a word it does not know or
a missing session id, and exits 1 with the reason on stderr when the mode cannot be written or removed.
"""

import glob
import json
import os
import re
import stat
import sys
from datetime import datetime, timezone

SESSION_ID = re.compile(r"[0-9a-f-]{8,}", re.IGNORECASE)
LEVELS = ("low", "medium", "high", "xhigh", "max")
WANTED = {"plan": "max", "build": "high"}
RUNTIME = os.environ.get("XDG_RUNTIME_DIR") or "/tmp"
MODE_DIR = os.path.join(RUNTIME, "dxb-effort")
CTX_DIR = os.path.join(RUNTIME, "claude-ctx")
COMMAND = f'python3 "{os.path.abspath(__file__)}"'
DIR_FLAGS = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
FILE_FLAGS = os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK
TAIL_BYTES = 256 * 1024
SMALL_BYTES = 4 * 1024  # the mode file and the status line's record are a few dozen bytes
MAX_LINE = "⚠ Muhittin Bey, plan konuşmasındayız — /effort max'a geçin."
HIGH_LINE = "⚠ Muhittin Bey, plan bitti — koda geçmeden /effort high'a geçin."
CODE_LINE = "⚠ Muhittin Bey, koda geçmeden /effort high'a geçin."
LINES = {"plan": MAX_LINE, "build": HIGH_LINE}
# the whole row is the command's output -- a quotation of it inside his own words is not a switch (Sol A3)
SWITCHED = re.compile(r"<local-command-stdout>Set effort level to (low|medium|high|xhigh|max)\b[^<]*"
                      r"</local-command-stdout>")
# his words that turn the talk to a plan, a design or an architecture -- Turkish stems and English words,
# matched at a word's start so "explain" and "planet" stay out
PLAN_WORDS = re.compile(r"(?<!\w)(plan(?!et)\w*|tasar[ıi]m\w*|tasarla\w*|mimari\w*|design\w*|architect\w*)",
                        re.IGNORECASE)
USAGE = "usage: dxb-effort-warn.py plan|build|off   (as a hook: no argument, the hook's JSON on stdin)\n"


def warning(mode, level):
    runs = f"runs at {level}" if level else "runs at an unknown level"
    if mode == "plan":
        return (
            f"This session is in PLAN mode under dxb-team2 and {runs}; the CEO's order (2026-10-06) is "
            f"plan, design and architecture at max, switched by him with /effort. Begin your reply, "
            f"before anything else, with exactly this line:\n{MAX_LINE}\n"
            f"Then go on, but write no file until he has switched. In the reply that brings him the plan for "
            f"his yes, run `{COMMAND} build` and close that reply with the line it gives, so his yes can "
            f"arrive at high.")
    return (
        f"This session is in BUILD mode under dxb-team2 and {runs}; the CEO's order (2026-10-06) is "
        f"the build at high, switched by him with /effort. Begin your reply, before anything else, with "
        f"exactly this line:\n{HIGH_LINE}\n"
        f"Then go on, but write no code until he has switched. If his message asks to change the plan "
        f"instead of approving it, run `{COMMAND} plan` and stay in the plan. When the job ends, run "
        f"`{COMMAND} off`.")


def plan_reminder():
    return (f"His message names a plan, a design or an architecture, and this session has no dxb-team2 effort "
            f"mode. If the talk is turning to one, run `{COMMAND} plan` now and do what it answers; if not, "
            f"ignore this.")


def unknown_reminder():
    return (f"The hook cannot tell this session's effort yet (no status line record, no step in the "
            f"transcript), and it has no dxb-team2 effort mode. If your reply writes code, first run "
            f"`echo $CLAUDE_EFFORT` in Bash; if it is not high, open the reply, before anything else, with "
            f"exactly this line:\n{CODE_LINE}\nand write no code until he has switched. Otherwise ignore this.")


def code_reminder(level):
    return (f"This session runs at {level}, not high, and has no dxb-team2 effort mode; the CEO's order "
            f"(2026-10-06) is code at high. If your reply writes code, open it, before anything else, with "
            f"exactly this line:\n{CODE_LINE}\nand write no code until he has switched. If the talk is a plan, "
            f"a design or an architecture, run `{COMMAND} plan` instead. Otherwise ignore this.")


def session_name(session_id):
    """The session's file name, or None when the id could name anything but a file in the folder."""
    if not isinstance(session_id, str) or not SESSION_ID.fullmatch(session_id):
        return None
    return session_id


def open_dir(path, create=False, private=True):
    """A descriptor on the folder, or None when it is missing or not to be trusted."""
    if create:
        try:
            os.mkdir(path, 0o700)
        except FileExistsError:
            pass
    try:
        fd = os.open(path, DIR_FLAGS)
    except OSError:  # missing, or a link (O_NOFOLLOW), or not a directory
        return None
    info = os.fstat(fd)
    if info.st_uid != os.getuid() or (private and info.st_mode & (stat.S_IWGRP | stat.S_IWOTH)):
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


def read_mode(name):
    dir_fd = open_dir(MODE_DIR)
    if dir_fd is None:
        return None
    try:
        raw = read_regular(name, dir_fd=dir_fd)
    finally:
        os.close(dir_fd)
    mode = raw.decode("utf-8", "replace").strip() if raw is not None else None
    return mode if mode in WANTED else None


def record_level(name):
    """(timestamp, level) from the status line's record of this session, or None -- also when it cannot be read."""
    try:
        dir_fd = open_dir(CTX_DIR, private=False)
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


def transcript_level(path, name):
    """(timestamp, level) of this session's last row naming its effort -- an assistant step carrying one, or a
    /effort row -- from the transcript's tail, or None -- also when it cannot be read. A row of another
    session, or one naming no session, does not count."""
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
        level = row.get("effort") if row.get("type") == "assistant" else switched_level(row)
        if level in LEVELS:
            moment = parse_ts(row.get("timestamp"))
            if moment:
                return moment, level
    return None


def own_transcript(name):
    """This session's transcript where Claude Code keeps it, or None."""
    found = sorted(glob.glob(os.path.join(os.path.expanduser("~"), ".claude", "projects", "*", f"{name}.jsonl")))
    return found[0] if found else None


def live_level(name, transcript_path):
    known = [found for found in (record_level(name), transcript_level(transcript_path, name)) if found]
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
    mode = read_mode(name)
    if mode is None and data.get("permission_mode") == "plan":
        mode = "plan"
    level = live_level(name, data.get("transcript_path"))
    if mode is not None:
        if level == WANTED[mode]:
            return
        context = warning(mode, level)
    elif not isinstance(data.get("prompt"), str) or "<task-notification>" in data["prompt"]:
        return  # a subagent's report arriving is not his message (measured 2026-10-06: one tripped the net)
    elif PLAN_WORDS.search(data["prompt"]):
        context = plan_reminder()
    elif level is None:
        context = unknown_reminder()
    elif level != "high":
        context = code_reminder(level)
    else:
        return
    output = {"hookSpecificOutput": {"hookEventName": "UserPromptSubmit", "additionalContext": context}}
    sys.stdout.write(json.dumps(output, ensure_ascii=False) + "\n")


def write_mode(dir_fd, name, mode):
    """Writes the mode by rename -- a link or FIFO standing there is replaced, never opened."""
    tmp = f".{name}.{os.urandom(8).hex()}.tmp"
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=dir_fd)
    try:
        try:
            os.write(fd, mode.encode())
        finally:
            os.close(fd)
        os.replace(tmp, name, src_dir_fd=dir_fd, dst_dir_fd=dir_fd)
    except BaseException:
        try:
            os.unlink(tmp, dir_fd=dir_fd)
        except OSError:
            pass
        raise


def cli(mode):
    name = session_name(os.environ.get("CLAUDE_CODE_SESSION_ID"))
    if name is None:
        sys.stderr.write("dxb-effort-warn: no valid CLAUDE_CODE_SESSION_ID in the environment\n")
        return 2
    try:
        dir_fd = open_dir(MODE_DIR, create=mode != "off")
    except OSError as error:
        sys.stderr.write(f"dxb-effort-warn: the mode folder cannot be made -- {error}\n")
        return 1
    if dir_fd is None:
        if mode == "off":
            print("effort mode: off — no warning for this session")
            return 0
        sys.stderr.write(f"dxb-effort-warn: {MODE_DIR} is missing or not to be trusted "
                         f"(a link, not this user's, or writable by others)\n")
        return 1
    try:
        if mode == "off":
            try:
                if stat.S_ISREG(os.stat(name, dir_fd=dir_fd, follow_symlinks=False).st_mode):
                    os.unlink(name, dir_fd=dir_fd)
            except FileNotFoundError:
                pass
        else:
            write_mode(dir_fd, name, mode)
    except OSError as error:
        sys.stderr.write(f"dxb-effort-warn: the mode could not be {'removed' if mode == 'off' else 'written'} "
                         f"-- {error}\n")
        return 1
    finally:
        os.close(dir_fd)
    if mode == "off":
        print("effort mode: off — no warning for this session")
        return 0
    print(f"effort mode: {mode} — the CEO is warned to switch to {WANTED[mode]} until he does")
    level = live_level(name, own_transcript(name))
    if level == WANTED[mode]:
        print(f"live level {level}: already at {level} — no warning in this reply")
    else:
        where = "open" if mode == "plan" else "end"
        print(f"live level {level or 'unknown'}: {where} this reply with exactly this line:\n{LINES[mode]}")
    return 0


def main():
    raw = sys.stdin.buffer.read()
    if not raw.strip():
        return
    data = json.loads(raw)
    if isinstance(data, dict):
        on_hook(data)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        if len(sys.argv) == 2 and sys.argv[1] in ("plan", "build", "off"):
            sys.exit(cli(sys.argv[1]))
        sys.stderr.write(USAGE)
        sys.exit(2)
    try:
        main()
        sys.stdout.flush()
    except Exception:
        pass
    os._exit(0)
