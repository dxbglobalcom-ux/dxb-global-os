#!/usr/bin/env python3
"""Tests for dxb-warm-wait: when it wakes, when a ping pays, what it refuses, how it follows the session's
last turn, the one clock a session has, the away marker, and a few real short waits."""
import atexit
import datetime
import importlib.machinery
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time

HERE = os.path.dirname(os.path.abspath(__file__))
COMMAND = os.path.join(HERE, "dxb-warm-wait")
STATUS_LINE = os.path.join(HERE, "dxb-statusline.js")

# The tests' own world, set before the command is loaded: their own marker folder and log, a home with
# no ~/.claude in it and a dxb-quota that reads a file of theirs, and no session unless a test names one.
SANDBOX = tempfile.mkdtemp(prefix="warm-wait-test-")
atexit.register(shutil.rmtree, SANDBOX, ignore_errors=True)
os.environ.update(XDG_RUNTIME_DIR=SANDBOX, HOME=SANDBOX)
for name in [name for name in os.environ if name == "CLAUDE_CODE_SESSION_ID" or name.startswith("DXB_WARM_WAIT_TEST_")]:
    del os.environ[name]
RUNTIME = os.path.join(SANDBOX, "claude-ctx")
os.makedirs(RUNTIME)
QUOTA_RECORD = os.path.join(SANDBOX, "quota.json")
QUOTA_COMMAND = os.path.join(SANDBOX, ".local", "bin", "dxb-quota")
os.makedirs(os.path.dirname(QUOTA_COMMAND))
with open(QUOTA_COMMAND, "w") as handle:
    handle.write('#!/bin/sh\nif [ "$1" = "--json" ]; then cat "$HOME/quota.json"; else echo "the quota line"; fi\n')
os.chmod(QUOTA_COMMAND, 0o755)


def set_quota(five_hour_used, reset_in_h=1.0):
    with open(QUOTA_RECORD, "w") as record:
        json.dump({"5h": {"used": five_hour_used, "reset_in_h": reset_in_h}, "7d": {"used": 40}}, record)


set_quota(50)
loader = importlib.machinery.SourceFileLoader("warm_wait", COMMAND)
spec = importlib.util.spec_from_loader("warm_wait", loader)
ww = importlib.util.module_from_spec(spec)
loader.exec_module(ww)

failed = []


def check(name, got, want):
    if got != want:
        failed.append(f"{name}: got {got!r}, want {want!r}")


def section(test):
    """Run one group of checks now; a group that breaks is one failure and does not hide the others."""
    try:
        test()
    except Exception as error:  # noqa: BLE001 -- whatever broke, it is this group's failure
        failed.append(f"{test.__name__}: broke with {error!r}")
    return test


MIN = 60
NOW = 1_794_500_000.0

# The wake: the target when it comes inside 55 minutes, the 55th minute otherwise.
check("target inside the hour ends the wait", ww.next_wake(NOW, NOW + 40 * MIN), (NOW + 40 * MIN, True))
check("target at the 55th minute ends the wait", ww.next_wake(NOW, NOW + 55 * MIN), (NOW + 55 * MIN, True))
check("a longer wait wakes at the 55th minute", ww.next_wake(NOW, NOW + 80 * MIN), (NOW + 55 * MIN, False))

# How many pings a wait takes.
check("40 minutes: none", ww.pings_needed(40 * MIN), 0)
check("55 minutes: none", ww.pings_needed(55 * MIN), 0)
check("80 minutes: one", ww.pings_needed(80 * MIN), 1)
check("five hours: five", ww.pings_needed(300 * MIN), 5)

# A ping pays while the pings together cost less than one cold start (0.1 each against 2.0).
check("5 pings pay", ww.worth_keeping_warm(5), True)
check("19 pings pay", ww.worth_keeping_warm(19), True)
check("20 pings do not", ww.worth_keeping_warm(20), False)
check("a 31-hour wait stays cold", ww.worth_keeping_warm(ww.pings_needed(31 * 60 * MIN)), False)

# The target, from the command line.
check("--for 90", ww.parse_target(["--for", "90"], NOW, None), NOW + 90 * MIN)
check("--for inf is refused", ww.parse_target(["--for", "inf"], NOW, None), None)
check("--for 0 is refused", ww.parse_target(["--for", "0"], NOW, None), None)
check("--until @epoch", ww.parse_target(["--until", "@1794503000"], NOW, None), 1794503000.0)
check("--until-reset adds the margin", ww.parse_target(["--until-reset"], NOW, 1.0), NOW + 3600 + ww.RESET_MARGIN_MIN * MIN)
check("--until-reset without a record", ww.parse_target(["--until-reset"], NOW, None), None)
check("--until nonsense", ww.parse_target(["--until", "soon"], NOW, None), None)
check("no arguments", ww.parse_target([], NOW, None), None)
later = ww.parse_target(["--until", "00:00"], NOW, None)
check("--until HH:MM that has passed is tomorrow's", 0 < later - NOW <= 24 * 3600, True)

# The whole run on a clock that jumps to each wake, the quota replaced: which line each case ends on.
import contextlib
import io


def run_with(argv, five_hour_used, while_asleep=None):
    """(exit code, what it printed, the moments it slept to); `while_asleep` happens during the first sleep."""
    quota = {"5h": {"used": five_hour_used, "reset_in_h": 1.0}, "7d": {"used": 40}}
    at = [NOW]
    slept = []

    def jump(when, session=None):
        if while_asleep and not slept:
            while_asleep()
        slept.append(when)
        at[0] = max(at[0], when)

    real = (ww.wall_clock, ww.sleep_until, ww.read_quota)
    ww.wall_clock, ww.sleep_until, ww.read_quota = (lambda: at[0]), jump, (lambda: quota)
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out):
            code = ww.main(argv)
    finally:
        ww.wall_clock, ww.sleep_until, ww.read_quota = real
    return code, out.getvalue(), slept


@section
def the_line_each_wait_ends_on():
    code, text, _ = run_with(["--for", "80"], 50)
    check("80 minutes with room: a ping", (code, text.startswith("WARM_PING "), "re-arm: scripts/ops/dxb-warm-wait --until @" in text), (0, True, True))
    code, text, _ = run_with(["--for", "80"], 99)
    check("80 minutes, window full: no ping, cold", (code, text.startswith("WAIT_OVER "), "had no room for a ping" in text), (0, True, True))
    code, text, _ = run_with(["--for", "40"], 99)
    check("40 minutes: over, nothing cold", (code, text.startswith("WAIT_OVER "), "cold" in text), (0, True, False))
    code, text, _ = run_with(["--for", "2000"], 10)
    check("33 hours: cold by the count", (code, text.startswith("WAIT_OVER "), "pings would cost more" in text), (0, True, True))
    code, text, _ = run_with(["--until-reset"], 95)
    check("--until-reset 62 minutes away: one ping first", (code, text.startswith("WARM_PING ")), (0, True))


# --- The session's last turn: read from its transcript as the status line's cacheTag reads it ---

def stamp(epoch):
    return datetime.datetime.fromtimestamp(epoch, datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def row(kind, at, **more):
    return json.dumps({"type": kind, "timestamp": stamp(at), "isSidechain": False, **more})


def transcript(name, rows):
    path = os.path.join(SANDBOX, f"{name}.jsonl")
    with open(path, "w") as lines:
        lines.write("".join(line + "\n" for line in rows))
    return path


def add_row(path, line):
    with open(path, "a") as lines:
        lines.write(line + "\n")


def cache_tag(path):
    """What dxb-statusline.js's cacheTag says of that transcript: the minutes left, "cold", or None."""
    # run as a copy, the way it is installed: beside the repository's package.json it is not CommonJS
    bar = subprocess.run(["node", shutil.copy(STATUS_LINE, SANDBOX)], input=json.dumps({"transcript_path": path}),
                         capture_output=True, text=True, timeout=30, check=True).stdout
    minutes = re.search(r"önbellek (\d+) dk", bar)
    return int(minutes.group(1)) if minutes else "cold" if "önbellek soğudu" in bar else None


@section
def the_last_turn_is_read_as_the_status_line_reads_it():
    # The turn is 20.5 minutes old, so cacheTag must say 40 of the hour's 60 minutes are left; every
    # row that must not count is 5 minutes old, and counting it would say 55.
    began = int(time.time())
    turn, decoy = began - 1230, began - 300
    samples = [
        ("the last assistant row", [row("user", turn - 60), row("assistant", turn)], turn, 40),
        ("the newest of two", [row("assistant", turn - 900), row("assistant", turn)], turn, 40),
        ("a later user row that only says the word", [row("assistant", turn), row("user", decoy, text='"assistant"')], turn, 40),
        ("a subagent's row", [row("assistant", turn), json.dumps({"type": "assistant", "timestamp": stamp(decoy), "isSidechain": True})], turn, 40),
        ("another kind of row", [row("assistant", turn), row("system", decoy, subtype="assistant"), row("attachment", decoy)], turn, 40),
        ("a torn last line", [row("assistant", turn), row("assistant", decoy)[:-9]], turn, 40),
        ("a row with no time to read", [row("assistant", turn), json.dumps({"type": "assistant", "timestamp": "soon"}), json.dumps({"type": "assistant"})], turn, 40),
        ("a blank line and a line that is not an object", [row("assistant", turn), "", '"assistant"', '["assistant"]'], turn, 40),
        ("no assistant row at all", [row("user", decoy)], None, None),
        ("an empty transcript", [], None, None),
        ("a turn dated after now is read, and the bar says nothing of it", [row("assistant", turn), row("assistant", began + 3600)], began + 3600, None),
        ("a turn an hour and more old", [row("assistant", began - 3700)], began - 3700, "cold"),
    ]
    for number, (name, rows, last_turn, tag) in enumerate(samples):
        path = transcript(f"sample-{number}", rows)
        check(f"last turn, {name}", ww.last_turn_at(path), last_turn)
        check(f"cacheTag, {name}", cache_tag(path), tag)
    check("last turn, no such file", ww.last_turn_at(os.path.join(SANDBOX, "nowhere.jsonl")), None)
    check("cacheTag, no such file", cache_tag(os.path.join(SANDBOX, "nowhere.jsonl")), None)
    check("last turn, no transcript known", ww.last_turn_at(None), None)


@section
def a_turn_during_the_wait_moves_the_ping():
    quiet = transcript("quiet", [row("assistant", NOW - 20 * MIN)])
    code, text, slept = run_with(["--for", "120", "--transcript", quiet], 50)
    check("no turn meanwhile: one sleep, to the 55th minute after the arming", (code, text.startswith("WARM_PING "), slept), (0, True, [NOW + 55 * MIN]))

    busy = transcript("busy", [row("assistant", NOW - 20 * MIN)])
    code, text, slept = run_with(["--for", "120", "--transcript", busy], 50,
                                 while_asleep=lambda: add_row(busy, row("assistant", NOW + 30 * MIN)))
    check("a turn at the 30th minute: it sleeps on to the 85th, no wake between",
          (code, text.startswith("WARM_PING "), slept), (0, True, [NOW + 55 * MIN, NOW + 85 * MIN]))

    ending = transcript("ending", [])
    code, text, slept = run_with(["--for", "80", "--transcript", ending], 50,
                                 while_asleep=lambda: add_row(ending, row("assistant", NOW + 30 * MIN)))
    check("the moved ping would come after the wait's end: the wait just ends",
          (code, text.startswith("WAIT_OVER "), "cold" in text, slept), (0, True, False, [NOW + 55 * MIN, NOW + 80 * MIN]))

    ahead = transcript("ahead", [row("assistant", NOW + 600 * MIN)])
    code, text, slept = run_with(["--for", "120", "--transcript", ahead], 50)
    check("a turn dated after now does not count", (text.startswith("WARM_PING "), slept), (True, [NOW + 55 * MIN]))

    code, text, slept = run_with(["--for", "120", "--transcript", os.path.join(SANDBOX, "nowhere.jsonl")], 50)
    check("an unreadable transcript: the arming time, as before", (text.startswith("WARM_PING "), slept), (True, [NOW + 55 * MIN]))


@section
def watch_has_no_end():
    code, text, slept = run_with(["--watch"], 50)
    check("--watch pings when the cache is about to go cold",
          (code, text.startswith("WARM_PING "), text.rstrip().endswith("| re-arm: scripts/ops/dxb-warm-wait --watch"), slept),
          (0, True, True, [NOW + 55 * MIN]))

    working = transcript("working", [])
    code, text, slept = run_with(["--watch", "--transcript", working], 50,
                                 while_asleep=lambda: add_row(working, row("assistant", NOW + 50 * MIN)))
    check("--watch follows a turn too", (text.startswith("WARM_PING "), slept), (True, [NOW + 55 * MIN, NOW + 105 * MIN]))

    # the quota here says the window resets in one hour; two minutes are waited past it
    code, text, slept = run_with(["--watch"], 98)
    check("--watch at 98 %: no ping, asleep to the window's reset",
          (code, text.startswith("WAIT_OVER "), "the 5-hour window stood at 98% and had no room for a ping" in text, slept),
          (0, True, True, [NOW + 55 * MIN, NOW + (55 + 60 + 2) * MIN]))
    code, text, slept = run_with(["--watch"], 97)
    check("--watch at 97 %: a ping", (text.startswith("WARM_PING "), slept), (True, [NOW + 55 * MIN]))


# --- The command itself, run for real in the tests' own world ---

SESSION = "0000aaaa-test-4000-8000-warmwaittest"
clocks = []
atexit.register(lambda: [clock.kill() for clock in clocks if clock.poll() is None])


def environment(session, knobs):
    env = dict(os.environ, **{f"DXB_WARM_WAIT_TEST_{name}": str(value) for name, value in knobs.items()})
    if session:
        env["CLAUDE_CODE_SESSION_ID"] = session
    return env


def run(*argv, session=SESSION, **knobs):
    return subprocess.run([sys.executable, COMMAND, *argv], capture_output=True, text=True, timeout=30,
                          env=environment(session, knobs))


def status(*argv, session=SESSION):
    return run("--status", *argv, session=session).stdout


def clock_file(session=SESSION):
    return os.path.join(RUNTIME, f"warm-wait-{session}.pid")


def registered(session=SESSION):
    """The pid the session's clock file names, or None."""
    try:
        with open(clock_file(session)) as record:
            return json.load(record)["pid"]
    except (OSError, ValueError, KeyError):
        return None


def arm(*argv, session=SESSION, **knobs):
    """Start a clock in the background and wait until it has written itself down."""
    clock = subprocess.Popen([sys.executable, COMMAND, *argv], stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                             text=True, env=environment(session, knobs))
    clocks.append(clock)
    patience = time.time() + 10
    while registered(session) != clock.pid and clock.poll() is None and time.time() < patience:
        time.sleep(0.02)
    return clock


def end(clock):
    clock.kill()
    clock.wait()


def hhmm(epoch):
    return time.strftime("%H:%M", time.localtime(epoch))


@section
def bad_usage_and_a_short_wait():
    check("bad usage exit", run("--for", "inf").returncode, 2)
    check("--watch takes no value", run("--watch", "90").returncode, 2)
    began = time.time()
    real = run("--for", "0.05")
    check("short wait exit", real.returncode, 0)
    check("short wait says WAIT_OVER", real.stdout.startswith("WAIT_OVER "), True)
    check("short wait really waited", time.time() - began >= 3, True)
    check("the clock file is gone when the wait is over", os.path.exists(clock_file()), False)


@section
def one_clock_per_session():
    nothing = run("--status")
    check("status, nothing armed", (nothing.returncode, nothing.stdout), (0, "NOT_ARMED\nAWAY off\n"))
    no_session = run("--status", session=None)
    check("status, no session known", (no_session.returncode, no_session.stdout), (0, "NOT_ARMED\nAWAY off\n"))

    began = time.time()
    watch = arm("--watch")
    check("the clock file names the clock", registered(), watch.pid)
    check("status, a clock armed: its ping is 55 minutes after the arming",
          status() in {f"ARMED --watch pid {watch.pid}, next ping {hhmm(moment + 55 * MIN)}\nAWAY off\n" for moment in (began, time.time())}, True)

    second = run("--for", "1")
    check("a second arming is refused", (second.returncode, second.stdout.startswith(f"ALREADY_ARMED --watch pid {watch.pid}, next ping ")), (3, True))
    check("a second --watch is refused", run("--watch").returncode, 3)
    check("the refused arming left the first clock written down", registered(), watch.pid)
    check("another session is not refused", run("--for", "0.01", session="another-session").returncode, 0)
    end(watch)
    check("status, the clock was killed", status(), "NOT_ARMED\nAWAY off\n")


@section
def a_real_watch_pings():
    began = time.time()
    watch = arm("--watch", PING_AFTER_S=2)
    out, _ = watch.communicate(timeout=20)
    check("the watch ended by itself with a ping",
          (watch.returncode, out.startswith("WARM_PING "), out.rstrip().endswith("| the quota line | re-arm: scripts/ops/dxb-warm-wait --watch")), (0, True, True))
    check("the watch waited its two seconds", time.time() - began >= 2, True)
    check("the clock file is gone", os.path.exists(clock_file()), False)
    check("status, after the ping", status(), "NOT_ARMED\nAWAY off\n")
    with open(os.path.join(RUNTIME, "warm-wait.log")) as log:
        events = [json.loads(line) for line in log]
    check("the log carries the mode", [(event["event"], event["mode"]) for event in events[-2:]], [("armed", "--watch"), ("ping", "--watch")])


@section
def status_reads_the_next_ping_from_the_last_turn():
    # A clock written down as armed 30 minutes ago; the process it names is a real clock of another session.
    stand_in = arm("--watch", session="stand-in")
    armed_at = int(time.time()) - 30 * MIN
    session = "status-session"
    os.makedirs(os.path.join(SANDBOX, ".claude", "projects", "-some-project"))
    own = os.path.join(SANDBOX, ".claude", "projects", "-some-project", f"{session}.jsonl")

    def write_down(until):
        with open(clock_file(session), "w") as record:
            json.dump({"pid": stand_in.pid, "mode": "--watch" if until is None else "--for", "armed_at": armed_at, "until": until}, record)

    write_down(None)
    check("no transcript: 55 minutes after the arming",
          status(session=session), f"ARMED --watch pid {stand_in.pid}, next ping {hhmm(armed_at + 55 * MIN)}\nAWAY off\n")
    with open(own, "w") as lines:
        lines.write(row("assistant", armed_at + 20 * MIN) + "\n")
    check("the session's own transcript is found: 55 minutes after its last turn",
          status(session=session), f"ARMED --watch pid {stand_in.pid}, next ping {hhmm(armed_at + 75 * MIN)}\nAWAY off\n")
    elsewhere = transcript("elsewhere", [row("assistant", armed_at + 10 * MIN)])
    check("--transcript overrides it",
          status("--transcript", elsewhere, session=session), f"ARMED --watch pid {stand_in.pid}, next ping {hhmm(armed_at + 65 * MIN)}\nAWAY off\n")
    write_down(armed_at + 60 * MIN)
    check("a wait that ends before the ping says so",
          status(session=session),
          f"ARMED --for pid {stand_in.pid}, next ping {hhmm(armed_at + 75 * MIN)} (the wait ends first, {hhmm(armed_at + 60 * MIN)})\nAWAY off\n")
    end(stand_in)
    check("the clock it names has died: not armed", status(session=session), "NOT_ARMED\nAWAY off\n")
    check("and its file is cleaned", os.path.exists(clock_file(session)), False)


@section
def a_dead_or_foreign_pid_file_is_not_a_clock():
    gone = subprocess.Popen(["true"])
    gone.wait()
    for name, pid in (("a dead pid", gone.pid), ("a live pid that is not a clock", os.getpid())):
        with open(clock_file(), "w") as record:
            json.dump({"pid": pid, "mode": "--watch", "armed_at": time.time(), "until": None}, record)
        check(f"status, {name}", status(), "NOT_ARMED\nAWAY off\n")
        check(f"{name}: the file is cleaned", os.path.exists(clock_file()), False)
    with open(clock_file(), "w") as record:
        record.write("not a record")
    check("an unreadable clock file does not refuse an arming", run("--for", "0.01").returncode, 0)


@section
def until_reset_takes_over_from_a_watch():
    set_quota(96, reset_in_h=1.0)
    watch = arm("--watch", STEP_S=0.1)
    reset = arm("--until-reset")
    check("--until-reset is armed over the watch", (reset.poll(), registered()), (None, reset.pid))
    out, _ = watch.communicate(timeout=10)
    check("the watch ends by itself, quietly", (watch.returncode, out), (0, "SUPERSEDED by --until-reset\n"))
    check("the watch left the new clock written down", registered(), reset.pid)
    check("status names the clock that matters", status().startswith(f"ARMED --until-reset pid {reset.pid}, next ping "), True)
    check("--until-reset over --until-reset is refused", run("--until-reset").returncode, 3)
    check("--watch over --until-reset is refused", run("--watch").returncode, 3)
    end(reset)
    set_quota(50)


@section
def the_away_marker():
    marker = os.path.join(RUNTIME, f"away-{SESSION}")
    on = run("--away", "on")
    check("--away on", (on.returncode, on.stdout), (0, "AWAY on\n"))
    with open(marker) as lines:
        written = lines.read()
    check("the marker is one line: when it was set", (written.count("\n"), written.startswith(time.strftime("%Y-%m-%dT"))), (1, True))
    check("status, away on", status(), "NOT_ARMED\nAWAY on\n")
    check("another session is not away", status(session="another-session"), "NOT_ARMED\nAWAY off\n")
    off = run("--away", "off")
    check("--away off", (off.returncode, off.stdout, os.path.exists(marker)), (0, "AWAY off\n", False))
    check("--away off twice", run("--away", "off").returncode, 0)
    check("status, away off", status(), "NOT_ARMED\nAWAY off\n")
    check("--away with neither word", run("--away", "maybe").returncode, 2)
    check("--away with no session to mark", (run("--away", "on", session=None).returncode, os.listdir(RUNTIME).count("away-None")), (2, 0))

if failed:
    print("\n".join(failed))
    sys.exit(1)
print("warm-wait: all checks passed")
