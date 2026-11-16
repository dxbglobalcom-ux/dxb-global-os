#!/usr/bin/env python3
"""DXB context gate (UserPromptSubmit): a session is told, once, when to hand over; it is refused nothing.

The CEO's numbers, 2026-09-26 ("tmm önerini yapalım"): at 50 % of its context a
session hands over at the first clean break, and at 55 % it opened no more
subagents. His word of 2026-10-06 (handover-at-the-clean-break-2026-10-06): the clean break
and the quality decide, not the number -- a piece is finished well, subagents included, even
when that takes the session to about 60 %; the refusal moved to 60 %. The rule was text only,
and on 2026-09-26 he caught the chief
engineer at 48 % with no handover, past the line of then; his word on the fix
the same night ("tmm önerini uygula.") made it this hook. Until 2026-11-16 it put a red line
on every prompt from 50 % and denied the Agent / Task tool from 60 %; his word of 2026-11-10
(handover-is-for-long-jobs-2026-11-10) is that the meter shows the context and does not stop
the work, so the hook now informs and nothing more:

  * UserPromptSubmit: the prompt on which the used context is first seen at or
    above RED_LINE_PCT carries the handover line into the session's context --
    the number and what a clean break is; the one on which it is first seen at or
    above FINISH_LINE_PCT carries the line that says to finish the piece in hand
    and hand over. Each is said once: a session first seen past FINISH_LINE_PCT
    gets that line only. The status line goes on showing the number.
  * No tool is denied at any percentage, and no other event is answered.

What was said is kept per session beside the status line's record, in
<session_id>.gate-said: a JSON list of the thresholds already said. A missing
or unreadable state file, or one that holds anything else, means not said yet.
A line whose answer could not be written is not counted as said; a state file
that cannot be written costs the memory, never the line -- it is said again on
the next prompt, and the failure is in the .err log.

The number is the one the CEO reads on the status line: dxb-statusline.js writes
it for each session to $XDG_RUNTIME_DIR/claude-ctx/<session_id>.json
(/tmp/claude-ctx/ without XDG_RUNTIME_DIR), field used_pct, and the hook reads
the record named by the session_id on its stdin -- only an id shaped like the
ones the status line writes a record for (SESSION_ID), so no path leaves
claude-ctx. There is no staleness cutoff: context only grows inside a session,
so an old number is a lower bound and still obliges; after /compact the status
line rewrites the record on its next render, so the number is never older than
one render. The record's age in whole seconds is logged, nothing more. No
record, a record that cannot be read, a used_pct that is not a number (a bool is
not), a session_id missing or not shaped like the status line's, empty or
non-object stdin: the hook says nothing and logs nothing.

Stdlib only. Only a line that was said is logged, one JSON line each (decision
red-line; used_pct tells which), to
dxb-context-gate.jsonl; a failure's traceback goes to dxb-context-gate.err. Both
live in ~/.claude/logs, or in $DXB_CONTEXT_GATE_LOG_DIR when it is set. On any
failure -- a reader that has closed its stdout included -- the hook exits 0 with
nothing on stdout or stderr: it never crashes or blocks a session by failing.
"""

import datetime
import json
import os
import re
import sys
import time
import traceback

# His numbers (CEO, 2026-09-26; 40 / 45 from 2026-09-21 until then).
# Change them here; nothing else holds them.
# Used context, in percent, at which the handover line is said, once:
RED_LINE_PCT = 50
# Used context, in percent, at which the session is told, once, to finish the piece in hand and hand over:
FINISH_LINE_PCT = 60

# The session ids dxb-statusline.js writes a record for (its /^[0-9a-f-]{8,}$/i); no other id is read.
SESSION_ID = re.compile(r"[0-9a-f-]{8,}", re.IGNORECASE)

LOG_DIR = os.environ.get("DXB_CONTEXT_GATE_LOG_DIR") or os.path.join(
    os.path.expanduser("~"), ".claude", "logs")
DECISION_LOG = os.path.join(LOG_DIR, "dxb-context-gate.jsonl")
ERROR_LOG = os.path.join(LOG_DIR, "dxb-context-gate.err")
# The same directory rule as dxb-statusline.js, which writes the record.
CTX_DIR = os.path.join(os.environ.get("XDG_RUNTIME_DIR") or "/tmp", "claude-ctx")


def red_line(used_pct):
    return (
        f"🔴 CONTEXT {used_pct}% — past {RED_LINE_PCT} %: hand over at the first clean break (dxb-team3 §7): "
        "no battery running, tree committed, report sent; then the handover note and the successor "
        "session through operator. The job continues in the successor; nothing is cut. "
        "Said once; the status line keeps showing the number.")


def finish_line(used_pct):
    return (
        f"🔴 CONTEXT {used_pct}% — past {FINISH_LINE_PCT} %: finish the piece in hand well and hand over at this "
        "clean break (dxb-team3 §7). The clean break and the quality decide, not the number; you judge it. "
        "Said once.")


# Each threshold and the line said when the used context is first seen at or above it.
LINES = {RED_LINE_PCT: red_line, FINISH_LINE_PCT: finish_line}


def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")


def append(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "a", encoding="utf-8") as log:
        log.write(text)


def log_error():
    try:
        append(ERROR_LOG, f"--- {now_iso()}\n{traceback.format_exc()}")
    except Exception:
        pass


def log_decision(data, used_pct, record_age_s, decision):
    try:
        append(DECISION_LOG, json.dumps({
            "ts": now_iso(),
            "session_id": data.get("session_id"),
            "event": data.get("hook_event_name"),
            "used_pct": used_pct,
            "record_age_s": record_age_s,
            "decision": decision,
        }) + "\n")
    except Exception:
        log_error()


def emit(event, **fields):
    output = {"hookSpecificOutput": {"hookEventName": event, **fields}}
    sys.stdout.write(json.dumps(output) + "\n")
    sys.stdout.flush()


def is_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def read_record(session_id):
    """This session's (used_pct, record age in whole seconds) from the status line's record, or None."""
    try:
        with open(os.path.join(CTX_DIR, f"{session_id}.json"), "rb") as record_file:
            record_age_s = int(time.time() - os.fstat(record_file.fileno()).st_mtime)
            record = json.loads(record_file.read())
    except (OSError, ValueError):  # missing, unreadable, not JSON: a silent input, not a failure
        return None
    used_pct = record.get("used_pct") if isinstance(record, dict) else None
    if not is_number(used_pct):
        return None
    return used_pct, record_age_s


def said_path(session_id):
    return os.path.join(CTX_DIR, f"{session_id}.gate-said")


def read_said(session_id):
    """The thresholds this session was already told, or an empty set: a missing or unreadable state file, or one
    that holds anything but a list of them, means not said yet."""
    try:
        with open(said_path(session_id), "rb") as state_file:
            said = json.loads(state_file.read())
    except (OSError, ValueError):
        return set()
    if not isinstance(said, list):
        return set()
    return {pct for pct in LINES if pct in said}


def write_said(session_id, said):
    # never through a link: this is the one file the hook writes beside the records, and a link planted under
    # its name must not aim the write at another file
    fd = os.open(said_path(session_id), os.O_WRONLY | os.O_CREAT | os.O_TRUNC | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as state_file:
        state_file.write(json.dumps(sorted(said)))


def main():
    raw = sys.stdin.buffer.read()
    if not raw.strip():
        return  # empty stdin is a silent input, not a failure
    data = json.loads(raw)
    if not isinstance(data, dict) or data.get("hook_event_name") != "UserPromptSubmit":
        return
    session_id = data.get("session_id")
    if not isinstance(session_id, str) or not SESSION_ID.fullmatch(session_id):
        return
    found = read_record(session_id)
    if found is None:
        return
    used_pct, record_age_s = found
    reached = {pct for pct in LINES if used_pct >= pct}
    if not reached:
        return
    said = read_said(session_id)
    due = max(reached)  # a session first seen past the higher threshold gets that line only
    if due in said:
        return
    emit("UserPromptSubmit", additionalContext=LINES[due](used_pct))
    log_decision(data, used_pct, record_age_s, "red-line")
    # last, and only after the answer was written: a line that did not reach the session is not counted as said,
    # and a state file that cannot be written costs the memory, never the line
    write_said(session_id, said | reached)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        log_error()
    # Flush here, not at shutdown: there a reader that has gone means exit 120 and a line on stderr.
    try:
        if sys.stdout is not None:  # None when the session started the hook with stdout closed
            sys.stdout.flush()
    except OSError:
        pass
    os._exit(0)
