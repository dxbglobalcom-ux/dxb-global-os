#!/usr/bin/env python3
"""DXB design-at-max mode (PostToolUse Skill / UserPromptSubmit / `close`): design turns run at max.

The CEO's order of 2026-10-03 (design-plan-architecture-at-max-2026-10-03): design, plan and
architecture run at Opus max, the orchestration after them at high -- without his hand on /effort.
A session cannot hold max on its own. A skill whose frontmatter says `effort: max` runs the rest of
its turn at max, and Claude Code clears it at his next message (measured 2026-10-04: a headless
session at high, the model invoking such a skill itself -- transcript effort high, then max for every
later step of the turn, high again on the next prompt; .planning/quick/20261004-design-max/). His word
to that answer, "bunu yapalım tmm." (design-max-skill-every-turn-2026-10-04): the lead invokes the
`dxb-design-max` skill first in every design turn, and this hook keeps the mode alive across turns:

  * PostToolUse on Skill: the call of `dxb-design-max` opens the mode for that session -- a flag file
    $XDG_RUNTIME_DIR/dxb-design-max/<session_id> (/tmp/dxb-design-max/ without XDG_RUNTIME_DIR).
  * UserPromptSubmit: while the session's flag stands, each of his messages carries a reminder into
    the session's context -- invoke the skill first, whatever the message asks; only his yes to the
    plan closes the mode (his words of 2026-10-04: "benim bir sonraki mesajım planı onaylıorm şeklinde
    olmalı ki kapansın bunun dışında onu kapatacak hiç birşey olmamalı").
  * `dxb-design-max.py close`, run by the lead from Bash: removes the flag of the session named by
    CLAUDE_CODE_SESSION_ID (the same id the hook receives on stdin, measured 2026-10-04).

Only a session id shaped like Claude Code's (SESSION_ID) ever names a flag, so no path leaves the
flag folder; and the folder is trusted only as a real directory (not a link) owned by this user and
writable by no one else, every flag is reached through that folder's descriptor without following a
link, and only a regular file counts as a flag (Sol's single pass, 2026-10-04: a planted link or FIFO
must neither redirect a write nor block the hook). The flags live in the runtime directory: a reboot
clears them, a resumed session keeps its own. Stdlib only. As a hook it never fails a session: on any
failure it exits 0 with nothing on stdout or stderr. `close` answers on stdout; it refuses with exit 2
when it has no valid session id, and exits 1 with the reason on stderr when the flag cannot be removed.
"""

import json
import os
import re
import stat
import sys

SKILL = "dxb-design-max"
SESSION_ID = re.compile(r"[0-9a-f-]{8,}", re.IGNORECASE)
FLAG_DIR = os.path.join(os.environ.get("XDG_RUNTIME_DIR") or "/tmp", "dxb-design-max")
CLOSE_COMMAND = f'python3 "{os.path.abspath(__file__)}" close'
DIR_FLAGS = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW


def reminder():
    return (
        f"🟣 DESIGN AT MAX is open for this session (dxb-team2 §4 PLAN). Invoke Skill {SKILL} as your "
        f"FIRST step on this message, whatever it asks -- a side question too, so the whole turn runs at "
        f"max. Nothing closes the mode but the CEO's yes to the plan: only when this message is that yes, "
        f"close it instead, as your first step, exactly as written -- `{CLOSE_COMMAND}` -- and go on at "
        f"the session's own level.")


def flag_name(session_id):
    """The session's flag name, or None when the id could name anything but a file in the flag folder."""
    if not isinstance(session_id, str) or not SESSION_ID.fullmatch(session_id):
        return None
    return session_id


def open_flag_dir(create):
    """A descriptor on the flag folder, or None when it is missing or not to be trusted."""
    if create:
        try:
            os.mkdir(FLAG_DIR, 0o700)
        except FileExistsError:
            pass
    try:
        fd = os.open(FLAG_DIR, DIR_FLAGS)
    except OSError:  # missing, or a link (O_NOFOLLOW), or not a directory
        return None
    info = os.fstat(fd)
    if info.st_uid != os.getuid() or info.st_mode & (stat.S_IWGRP | stat.S_IWOTH):
        os.close(fd)
        return None
    return fd


def is_flag(dir_fd, name):
    """True when the name is a regular file in the folder -- a link, a FIFO or nothing is no flag."""
    try:
        return stat.S_ISREG(os.stat(name, dir_fd=dir_fd, follow_symlinks=False).st_mode)
    except FileNotFoundError:
        return False


def open_mode(dir_fd, name):
    if is_flag(dir_fd, name):
        return
    # O_EXCL: never opens what stands there already -- a link, a FIFO, another file
    fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=dir_fd)
    os.close(fd)


def on_hook(data):
    name = flag_name(data.get("session_id"))
    if name is None:
        return
    event = data.get("hook_event_name")
    tool_input = data.get("tool_input")
    opening = (event == "PostToolUse" and data.get("tool_name") == "Skill"
               and isinstance(tool_input, dict) and tool_input.get("skill") == SKILL)
    if not opening and event != "UserPromptSubmit":
        return
    dir_fd = open_flag_dir(create=opening)
    if dir_fd is None:
        return
    try:
        if opening:
            open_mode(dir_fd, name)
        elif is_flag(dir_fd, name):
            output = {"hookSpecificOutput": {"hookEventName": event, "additionalContext": reminder()}}
            sys.stdout.write(json.dumps(output) + "\n")
    finally:
        os.close(dir_fd)


def close():
    name = flag_name(os.environ.get("CLAUDE_CODE_SESSION_ID"))
    if name is None:
        sys.stderr.write("dxb-design-max close: no valid CLAUDE_CODE_SESSION_ID in the environment\n")
        return 2
    dir_fd = open_flag_dir(create=False)
    if dir_fd is None or not is_flag(dir_fd, name):
        if dir_fd is not None:
            os.close(dir_fd)
        print("design at max: not open for this session")
        return 0
    try:
        os.unlink(name, dir_fd=dir_fd)
    except OSError as error:
        sys.stderr.write(f"dxb-design-max close: the flag could not be removed -- {error}\n")
        return 1
    finally:
        os.close(dir_fd)
    print("design at max: closed -- the session goes on at its own level")
    return 0


def main():
    raw = sys.stdin.buffer.read()
    if not raw.strip():
        return
    data = json.loads(raw)
    if isinstance(data, dict):
        on_hook(data)


if __name__ == "__main__":
    if sys.argv[1:] == ["close"]:
        sys.exit(close())
    try:
        main()
        sys.stdout.flush()
    except Exception:
        pass
    os._exit(0)
