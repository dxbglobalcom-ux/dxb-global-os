#!/usr/bin/env python3
"""DXB away gate (Stop): a session left to work alone cannot end a turn with nothing armed to wake it.

The night of 2026-11-13 a session he had left working went to sleep on a hand-written loop that
waited for a line in the wrong file; nothing else was armed, nothing woke it, and seven hours
were lost. His word that morning: "böyle bir hata kesinlikle kabul edilemez". A session he leaves
is marked with `dxb-warm-wait --away on`, and from then until `--away off` this hook holds one
thing at the end of every turn: the session's warm-wait clock is running.

  * no away marker for this session       -> the stop goes through, nothing said (every turn of
                                             every session ends here, so this is the short way)
  * marker, and the session's clock lives -> the stop goes through
  * marker, and no clock                  -> the stop is blocked once, with one line to the model
  * the input says a stop hook is already continuing the turn (stop_hook_active) -> through:
    the gate asks once and can never hold a session in a loop
  * anything that goes wrong in here      -> through, with one line on stderr: a broken gate
    must not stop every session

The contract is Claude Code's hooks reference (read 2026-11-13, code.claude.com/docs/en/hooks,
"Stop"): the input is one JSON object on stdin carrying session_id and stop_hook_active; exit 0
with {"decision": "block", "reason": ...} on stdout keeps the model going with the reason, and
exit 0 with nothing lets it stop.

The marker is $XDG_RUNTIME_DIR/claude-ctx/away-<session>, the clock's file is
warm-wait-<session>.pid beside it, and that file is this session's running clock when it was
written for this session by a process that still runs: the pid alive and started at the moment
written down (/proc/<pid>/stat, field 22). A name on a command line proves neither -- another
session's clock carries it, and its end wakes that session, not this one. dxb-warm-wait writes
both files and reads them by the same rule (its clock_file, away_file, started, is_clock); the
two must agree, and test-away-gate.py makes the files with that command and asks this gate.
Stdlib only. Installed byte-equal as ~/.claude/hooks/dxb-away-gate.py.
"""

import json
import os
import sys

RUNTIME = os.path.join(os.environ.get("XDG_RUNTIME_DIR") or "/tmp", "claude-ctx")
ASK = ("Away is on and no warm-wait clock is armed, so nothing would wake this session. Arm "
       "`scripts/ops/dxb-warm-wait --watch` in the background (`--until-reset` when waiting for the "
       "5-hour window); or, only when every piece of the job is finished, recorded and told, close "
       "with `scripts/ops/dxb-warm-wait --away off`.")


def started(pid):
    """The moment the kernel started the process under that pid (/proc/<pid>/stat, field 22: its ticks
    since boot); None when none runs. A pid is given out again; a pid with its start is one process."""
    try:
        with open(f"/proc/{int(pid)}/stat", "rb") as handle:
            state, *fields = handle.read().rpartition(b")")[2].split()  # what follows the name, which may hold spaces
        return None if state in (b"Z", b"X") else int(fields[18])
    except (OSError, ValueError, TypeError, IndexError):
        return None


def clock_lives(session):
    """Whether the session's clock file is this session's running clock."""
    try:
        with open(os.path.join(RUNTIME, f"warm-wait-{session}.pid")) as handle:
            record = json.load(handle)
        return record["session"] == session and record["started"] is not None and started(record["pid"]) == record["started"]
    except (OSError, ValueError, LookupError, TypeError):
        return False


def main():
    stop = json.load(sys.stdin)
    session = stop["session_id"]
    if not session.replace("-", "").isalnum():
        raise ValueError(f"session_id is no plain id: {session!r}")
    if not os.path.exists(os.path.join(RUNTIME, f"away-{session}")):
        return
    if stop.get("stop_hook_active") or clock_lives(session):
        return
    print(json.dumps({"decision": "block", "reason": ASK}))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:  # noqa: BLE001 -- whatever it is, the stop goes through
        print(f"dxb-away-gate: {error!r}; the stop is let through", file=sys.stderr)
    sys.exit(0)
