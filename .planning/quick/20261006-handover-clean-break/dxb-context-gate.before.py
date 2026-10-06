#!/usr/bin/env python3
"""DXB context gate (UserPromptSubmit / PreToolUse): a session hands over before its context runs out.

The CEO's numbers, 2026-09-26 ("tmm önerini yapalım"): at 50 % of its context a
session hands over at the first clean break, and at 55 % it opens no more
subagents. The rule was text only, and on 2026-09-26 he caught the chief
engineer at 48 % with no handover, past the line of then; his word on the fix
the same night ("tmm önerini uygula.") made it this hook, which holds both
numbers on every session:

  * UserPromptSubmit: at or above RED_LINE_PCT every prompt carries a red line
    into the session's context -- the number, what a clean break is, and where
    the Agent tool stops.
  * PreToolUse on Agent / Task: at or above AGENT_DENY_PCT the call is denied,
    with a reason that names the number and the way out -- commit what stands,
    the handover note, the successor session through operator.

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

Stdlib only. Only decisions (red-line / deny) are logged, one JSON line each, to
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
# Used context, in percent, from which every prompt carries the red handover line:
RED_LINE_PCT = 50
# Used context, in percent, from which the Agent / Task tool is refused:
AGENT_DENY_PCT = 55

AGENT_TOOLS = {"Agent", "Task"}
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
        f"🔴 CONTEXT {used_pct}% — hand over at the first clean break (dxb-team2 §7): "
        "no battery running, tree committed, report sent; then the handover note and the successor "
        f"session through operator (dxb-team2 §7). At {AGENT_DENY_PCT} % the Agent tool is refused.")


def deny_reason(used_pct, tool):
    return (
        f"🔴 CONTEXT {used_pct}% ≥ {AGENT_DENY_PCT} % — the {tool} tool is refused until a handover "
        "(dxb-team2 §7): finish nothing new; commit what stands, write the handover note, "
        "open the successor session through operator (dxb-team2 §7). The new session starts with its "
        "own record.")


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


def log_decision(data, tool, used_pct, record_age_s, decision):
    try:
        append(DECISION_LOG, json.dumps({
            "ts": now_iso(),
            "session_id": data.get("session_id"),
            "event": data.get("hook_event_name"),
            "tool": tool,
            "agent_type": data.get("agent_type"),
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


def main():
    raw = sys.stdin.buffer.read()
    if not raw.strip():
        return  # empty stdin is a silent input, not a failure
    data = json.loads(raw)
    if not isinstance(data, dict):
        return
    session_id = data.get("session_id")
    if not isinstance(session_id, str) or not SESSION_ID.fullmatch(session_id):
        return
    found = read_record(session_id)
    if found is None:
        return
    used_pct, record_age_s = found
    event = data.get("hook_event_name")
    tool = data.get("tool_name")
    if event == "UserPromptSubmit" and used_pct >= RED_LINE_PCT:
        emit(event, additionalContext=red_line(used_pct))
        log_decision(data, None, used_pct, record_age_s, "red-line")
    elif event == "PreToolUse" and tool in AGENT_TOOLS and used_pct >= AGENT_DENY_PCT:
        emit(event, permissionDecision="deny", permissionDecisionReason=deny_reason(used_pct, tool))
        log_decision(data, tool, used_pct, record_age_s, "deny")


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
