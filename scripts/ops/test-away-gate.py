#!/usr/bin/env python3
"""Tests for dxb-away-gate.py: every stop goes through, except an away session's with no clock armed.

The marker and the clock file are made by dxb-warm-wait itself, so the two files are held to one rule.
"""
import atexit
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time

HERE = os.path.dirname(os.path.abspath(__file__))
GATE = os.path.join(HERE, "dxb-away-gate.py")
COMMAND = os.path.join(HERE, "dxb-warm-wait")

# The tests' own world: their own marker folder, a home with no ~/.claude and no dxb-quota in it.
SANDBOX = tempfile.mkdtemp(prefix="away-gate-test-")
atexit.register(shutil.rmtree, SANDBOX, ignore_errors=True)
RUNTIME = os.path.join(SANDBOX, "claude-ctx")
SESSION = "0000aaaa-test-4000-8000-awaygatetest"
ENV = {name: value for name, value in os.environ.items() if not name.startswith("DXB_WARM_WAIT_TEST_")}
ENV.update(XDG_RUNTIME_DIR=SANDBOX, HOME=SANDBOX, CLAUDE_CODE_SESSION_ID=SESSION)
SILENT_PASS = (0, "", "")

failed = []
clocks = []
atexit.register(lambda: [clock.kill() for clock in clocks if clock.poll() is None])


def check(name, got, want):
    if got != want:
        failed.append(f"{name}: got {got!r}, want {want!r}")


def stop(session=SESSION, raw=None, **more):
    """Hand the gate a Stop hook's input as Claude Code sends it: (exit code, stdout, stderr)."""
    payload = {"session_id": session, "transcript_path": os.path.join(SANDBOX, "none.jsonl"), "cwd": SANDBOX,
               "permission_mode": "default", "hook_event_name": "Stop", "stop_hook_active": False,
               "last_assistant_message": "Done.", "background_tasks": [], "session_crons": [], **more}
    done = subprocess.run([sys.executable, GATE], input=json.dumps(payload) if raw is None else raw,
                          capture_output=True, text=True, timeout=30, env=ENV)
    return done.returncode, done.stdout, done.stderr


def blocked(result):
    """Whether that is the documented block: exit 0 and one JSON object, decision "block" with a one-line reason."""
    code, out, err = result
    try:
        said = json.loads(out)
    except ValueError:
        return False
    reason = said.get("reason", "")
    return (code == 0 and err == "" and said == {"decision": "block", "reason": reason} and "\n" not in reason
            and all(part in reason for part in ("scripts/ops/dxb-warm-wait --watch", "--until-reset", "scripts/ops/dxb-warm-wait --away off")))


def warm_wait(*argv):
    return subprocess.run([sys.executable, COMMAND, *argv], capture_output=True, text=True, timeout=30, env=ENV)


def clock_file(session=SESSION):
    return os.path.join(RUNTIME, f"warm-wait-{session}.pid")


def write_record(record):
    """Put that record into this session's clock file by hand."""
    with open(clock_file(), "w") as handle:
        json.dump(record, handle)


def arm_watch(session=SESSION):
    """A real --watch of that session, started and written down: (the process, its record)."""
    clock = subprocess.Popen([sys.executable, COMMAND, "--watch"], stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                             env=dict(ENV, CLAUDE_CODE_SESSION_ID=session))
    clocks.append(clock)
    patience = time.time() + 10
    while time.time() < patience and clock.poll() is None:
        try:
            with open(clock_file(session)) as handle:
                record = json.load(handle)
            if record["pid"] == clock.pid:
                return clock, record
        except (OSError, ValueError, KeyError):
            pass
        time.sleep(0.02)
    return clock, {}


# No marker: silent, whatever else is true.
check("no marker folder at all", stop(), SILENT_PASS)
os.makedirs(RUNTIME)
check("no marker", stop(), SILENT_PASS)

# Marker and no clock: the stop is blocked once, with the line.
check("--away on", warm_wait("--away", "on").returncode, 0)
check("marker, no clock: blocked", blocked(stop()), True)
check("another session is not away", stop(session="another-session"), SILENT_PASS)
check("the loop guard: a stop the gate already blocked goes through", stop(stop_hook_active=True), SILENT_PASS)

# Marker and a live clock: through. The clock dies: blocked again.
watch, written = arm_watch()
check("marker and a live clock", stop(), SILENT_PASS)
watch.kill()
watch.wait()
check("the clock has died, its file is still there", os.path.exists(clock_file()), True)
check("marker and a dead clock: blocked", blocked(stop()), True)
write_record(dict(written, pid=os.getpid()))
check("marker and a live pid that is not a clock: blocked", blocked(stop()), True)
with open(clock_file(), "w") as record:
    record.write("not a record")
check("marker and an unreadable clock file: blocked", blocked(stop()), True)

# A clock is proven by more than its name (Sol's A1 of 2026-11-13): each pid below runs a real dxb-warm-wait.
other, theirs = arm_watch("another-session")
write_record(theirs)
check("marker and another session's live clock in this session's file: blocked", blocked(stop()), True)
ours = dict(theirs, session=SESSION)
write_record(dict(ours, started=theirs.get("started", 0) + 1))
check("marker and a pid given out again (the same pid, another start time): blocked", blocked(stop()), True)
write_record({name: value for name, value in ours.items() if name not in ("session", "started")})
check("marker and a record of the old form, with no session and no start time: blocked", blocked(stop()), True)
write_record(ours)
check("the same record with this session and the process's own start time: through", stop(), SILENT_PASS)
other.kill()
other.wait()
check("and blocked again when that process has died", blocked(stop()), True)

# Broken input, with the marker still on: through, one line to stderr, nothing to the model.
for name, raw in (("not JSON", "{not json"), ("nothing", ""), ("not an object", "[]"), ("no session", "{}"),
                  ("a session that is no plain id", json.dumps({"session_id": "../../etc"})),
                  ("a session that is not a string", json.dumps({"session_id": 7}))):
    code, out, err = stop(raw=raw)
    check(f"broken input, {name}", (code, out, err.startswith("dxb-away-gate: "), err.count("\n")), (0, "", True, 1))

# Away off: silent again.
check("--away off", warm_wait("--away", "off").returncode, 0)
check("marker removed", stop(), SILENT_PASS)

if failed:
    print("\n".join(failed))
    sys.exit(1)
print("away-gate: all checks passed")
