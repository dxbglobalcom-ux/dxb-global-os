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
    and hand over. Each is said once per climb: a session first seen past
    FINISH_LINE_PCT gets that line only, and a threshold the used context has
    fallen back below -- after /compact or an automatic compaction -- is
    forgotten, so the next climb says its line again. The session cannot see
    the status line; it reads the number with `dxb-ctx --pct`.
  * No tool is denied at any percentage, and no other event is answered.

What was said is kept per session beside the status line's record, in
<session_id>.gate-said: a JSON list of the thresholds already said. It is read
only as a regular file, never through a link and never blocking -- a link or a
FIFO planted under its name is not a record -- and no further than STATE_BYTES.
A missing or unreadable state file, or one that holds anything but a list of
the thresholds themselves, means not said yet. It is written whole or not at
all: a new file beside it, moved over its name. A line whose answer could not
be written is not counted as said; a state file that cannot be written costs
the memory, never the line -- it is said again on the next prompt, and the
failure is in the .err log.

Two prompts of one session decide one after the other: reading the state,
saying the line and writing the state happen under an exclusive lock on
<session_id>.gate-lock, so a prompt at 55 % and one at 61 % that overlap leave
both thresholds recorded and each line said once. A prompt that finds the lock
still held after LOCK_WAIT_S says nothing -- the one holding it says what is
due -- and never waits longer. A lock that cannot be taken at all (its file
cannot be opened, or is not a regular file) costs the order, never the line,
and the failure is in the .err log. A prompt with nothing to say and nothing to
forget takes no lock and leaves no file.

The number is the one the CEO reads on the status line: dxb-statusline.js writes
it for each session to $XDG_RUNTIME_DIR/claude-ctx/<session_id>.json
(/tmp/claude-ctx/ without XDG_RUNTIME_DIR), field used_pct, and the hook reads
the record named by the session_id on its stdin -- only an id shaped like the
ones the status line writes a record for (SESSION_ID), so no path leaves
claude-ctx. There is no staleness cutoff: the status line rewrites the record
on every render -- the one after a compaction, where the context falls,
included -- so the number is never older than one render, and an old record is
the last number the status line knew and still obliges. The record's age in
whole seconds is logged, nothing more. No
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
import errno
import fcntl
import json
import os
import re
import stat
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
# never through a link, never waiting on a FIFO's other end
NO_LINK_NO_WAIT = os.O_NOFOLLOW | os.O_NONBLOCK
STATE_BYTES = 64  # the state is a list of two numbers; a longer file is not one the gate wrote
LOCK_WAIT_S = 0.5  # how long a prompt waits for another prompt of its session before it says nothing
LOCK_POLL_S = 0.02


def red_line(used_pct):
    return (
        f"🔴 CONTEXT {used_pct}% — past {RED_LINE_PCT} %: hand over at the first clean break (dxb-team3 §7): "
        "no battery running, tree committed, report sent; then the handover note and the successor "
        "session through operator. The job continues in the successor; nothing is cut. "
        "Said once; `dxb-ctx --pct` prints the number.")


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
    """The thresholds this session was already told, or an empty set: a missing or unreadable state file, one that
    is not a regular file (a link, a FIFO), or one that holds anything but a list of the thresholds themselves,
    means not said yet."""
    try:
        fd = os.open(said_path(session_id), os.O_RDONLY | NO_LINK_NO_WAIT)
    except OSError:
        return set()
    try:
        info = os.fstat(fd)
        if not stat.S_ISREG(info.st_mode) or info.st_size > STATE_BYTES:
            return set()
        said = json.loads(os.read(fd, STATE_BYTES))
    except (OSError, ValueError):
        return set()
    finally:
        os.close(fd)
    # the whole list or none of it: a known threshold beside anything else is not a record the gate wrote
    if not isinstance(said, list) or any(type(pct) is not int or pct not in LINES for pct in said):
        return set()
    return set(said)


def write_said(session_id, said):
    # whole or not at all, and never through a link: the list is written to a new file beside the state (O_EXCL:
    # nothing planted under that name is opened) and moved over the state's name, which replaces whatever stands
    # there -- a link, a FIFO -- and follows nothing; a prompt reading meanwhile sees the old list or the new one
    path = said_path(session_id)
    tmp = f"{path}.{os.getpid()}.tmp"
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as state_file:
            state_file.write(json.dumps(sorted(said)))
        os.replace(tmp, path)
    except OSError:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def hold_state(session_id):
    """An exclusive lock on this session's state, as a descriptor to close when done: who holds it is alone in
    reading the state, saying a line and writing the state. BlockingIOError when another prompt of the session
    still holds it after LOCK_WAIT_S -- no prompt waits without an end; another OSError when the lock cannot be
    taken at all: its file cannot be opened, or is not a regular file."""
    path = os.path.join(CTX_DIR, f"{session_id}.gate-lock")
    fd = os.open(path, os.O_RDWR | os.O_CREAT | NO_LINK_NO_WAIT, 0o600)
    try:
        if not stat.S_ISREG(os.fstat(fd).st_mode):
            raise OSError(errno.EINVAL, "the gate's lock is not a regular file", path)
        give_up = time.monotonic() + LOCK_WAIT_S
        while True:
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                return fd
            except BlockingIOError:
                if time.monotonic() >= give_up:
                    raise
                time.sleep(LOCK_POLL_S)
    except OSError:
        os.close(fd)
        raise


def decide(said, reached):
    """(the threshold whose line is due on this prompt, or None; the thresholds remembered after it) for a session
    told `said` whose used context now stands at or above `reached`."""
    kept = said & reached  # a threshold the context has fallen back below is forgotten: the next climb says it again
    if not reached or max(reached) in kept:
        return None, kept
    # a session first seen past the higher threshold gets that line only: everything reached counts as said
    return max(reached), reached


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
    said = read_said(session_id)
    if decide(said, reached) == (None, said):
        return  # nothing to say and nothing to forget: no lock is taken and no file is left
    try:
        lock = hold_state(session_id)
    except BlockingIOError:
        return  # another prompt of this session is deciding right now: it says what is due, this one adds nothing
    except OSError:
        log_error()  # no lock to take: the line is still said -- unordered, as before there was a lock
        lock = None
    try:
        said = read_said(session_id)  # again, now that no other prompt of the session can change it
        due, remembered = decide(said, reached)
        if due is not None:
            emit("UserPromptSubmit", additionalContext=LINES[due](used_pct))
            log_decision(data, used_pct, record_age_s, "red-line")
        # last, and only after the answer was written: a line that did not reach the session is not counted as
        # said, and a state file that cannot be written costs the memory, never the line
        if remembered != said:
            write_said(session_id, remembered)
    finally:
        if lock is not None:
            os.close(lock)  # which lets the lock go


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
