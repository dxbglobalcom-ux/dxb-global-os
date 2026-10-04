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
    the session's context -- invoke the skill first, or, when this message is his yes to the plan,
    close the mode and go on at the session's own level.
  * `dxb-design-max.py close`, run by the lead from Bash: removes the flag of the session named by
    CLAUDE_CODE_SESSION_ID (the same id the hook receives on stdin, measured 2026-10-04).

Only a session id shaped like Claude Code's (SESSION_ID) ever names a flag, so no path leaves the
flag folder. The flags live in the runtime directory: a reboot clears them, a resumed session keeps
its own. Stdlib only. As a hook it never fails a session: on any failure it exits 0 with nothing on
stdout or stderr. `close` answers on stdout, and refuses with exit 2 when it has no valid session id.
"""

import json
import os
import re
import sys

SKILL = "dxb-design-max"
SESSION_ID = re.compile(r"[0-9a-f-]{8,}", re.IGNORECASE)
FLAG_DIR = os.path.join(os.environ.get("XDG_RUNTIME_DIR") or "/tmp", "dxb-design-max")
CLOSE_COMMAND = f'python3 "{os.path.abspath(__file__)}" close'


def reminder():
    return (
        f"🟣 DESIGN AT MAX is open for this session (dxb-team2 §4 PLAN). If this message continues "
        f"design, plan or architecture work, invoke Skill {SKILL} as your FIRST step, so the rest of the "
        f"turn runs at max. If this message is the CEO's yes to the plan, close the mode instead, as your "
        f"first step -- `{CLOSE_COMMAND}` -- and go on at the session's own level.")


def flag_path(session_id):
    """The session's flag, or None when the id could name anything but a file in the flag folder."""
    if not isinstance(session_id, str) or not SESSION_ID.fullmatch(session_id):
        return None
    return os.path.join(FLAG_DIR, session_id)


def on_hook(data):
    flag = flag_path(data.get("session_id"))
    if flag is None:
        return
    event = data.get("hook_event_name")
    tool_input = data.get("tool_input")
    if (event == "PostToolUse" and data.get("tool_name") == "Skill"
            and isinstance(tool_input, dict) and tool_input.get("skill") == SKILL):
        os.makedirs(FLAG_DIR, mode=0o700, exist_ok=True)
        with open(flag, "w", encoding="utf-8"):
            pass
    elif event == "UserPromptSubmit" and os.path.isfile(flag):
        output = {"hookSpecificOutput": {"hookEventName": event, "additionalContext": reminder()}}
        sys.stdout.write(json.dumps(output) + "\n")


def close():
    flag = flag_path(os.environ.get("CLAUDE_CODE_SESSION_ID"))
    if flag is None:
        sys.stderr.write("dxb-design-max close: no valid CLAUDE_CODE_SESSION_ID in the environment\n")
        return 2
    try:
        os.remove(flag)
    except FileNotFoundError:
        print("design at max: not open for this session")
        return 0
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
