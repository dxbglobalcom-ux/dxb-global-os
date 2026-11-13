#!/usr/bin/env python3
"""Tests for dxb-warm-wait: when it wakes, when a ping pays, what it refuses, how it follows the session's
last turn, when the quota has no room for the wake (the session model's own week included), the one clock a
session has and how it is proven, the away marker, and a few real short waits."""
import atexit
import datetime
import fcntl
import importlib.machinery
import importlib.util
import json
import math
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
# no ~/.claude in it, their own quota record and a dxb-quota that says one line, and no session unless a
# test names one.
SANDBOX = tempfile.mkdtemp(prefix="warm-wait-test-")
atexit.register(shutil.rmtree, SANDBOX, ignore_errors=True)
os.environ.update(XDG_RUNTIME_DIR=SANDBOX, HOME=SANDBOX)
for name in [name for name in os.environ if name == "CLAUDE_CODE_SESSION_ID" or name.startswith("DXB_WARM_WAIT_TEST_")]:
    del os.environ[name]
RUNTIME = os.path.join(SANDBOX, "claude-ctx")
os.makedirs(RUNTIME)
QUOTA_RECORD = os.path.join(RUNTIME, "rate-limits.json")  # the status line's record, which the clock reads
MIN = 60
DAY = 24 * 60 * MIN
NOW = 1_794_500_000.0


def quota_command(home, script):
    """Put a dxb-quota of the tests' own into that home; the clock only shows the line it says."""
    path = os.path.join(home, ".local", "bin", "dxb-quota")
    os.makedirs(os.path.dirname(path))
    with open(path, "w") as handle:
        handle.write(f"#!/bin/sh\n{script}\n")
    os.chmod(path, 0o755)


quota_command(SANDBOX, 'echo "the quota line"')


def quota_record(five_hour_used, five_hour_reset, week_used=40, week_reset=NOW + 3 * DAY):
    """A quota record as dxb-statusline.js writes it: each window's percentage and the second it resets."""
    return {"five_hour": {"used_percentage": five_hour_used, "resets_at": five_hour_reset},
            "seven_day": {"used_percentage": week_used, "resets_at": week_reset}}


def set_quota(five_hour_used, reset_in_h=1.0):
    with open(QUOTA_RECORD, "w") as record:
        json.dump(quota_record(five_hour_used, time.time() + reset_in_h * 3600, week_reset=time.time() + 3 * DAY), record)


set_quota(50)
loader = importlib.machinery.SourceFileLoader("warm_wait", COMMAND)
spec = importlib.util.spec_from_loader("warm_wait", loader)
ww = importlib.util.module_from_spec(spec)
loader.exec_module(ww)
read_the_record = ww.read_quota  # the command's own reader, kept before any test puts another in its place

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
check("--until-reset adds the margin", ww.parse_target(["--until-reset"], NOW, NOW + 3600), NOW + 3600 + ww.RESET_MARGIN_MIN * MIN)
check("--until-reset without a record", ww.parse_target(["--until-reset"], NOW, None), None)
check("--until nonsense", ww.parse_target(["--until", "soon"], NOW, None), None)
check("no arguments", ww.parse_target([], NOW, None), None)
later = ww.parse_target(["--until", "00:00"], NOW, None)
check("--until HH:MM that has passed is tomorrow's", 0 < later - NOW <= 24 * 3600, True)

# The whole run on a clock that jumps to each wake, the quota replaced: which line each case ends on.
import contextlib
import io


def run_with(argv, quota, while_asleep=None):
    """(exit code, what it printed, the moments it slept to); `while_asleep` happens during the first sleep.

    `quota` is the 5-hour window's percentage (it resets an hour after NOW, and the week has room), or a
    whole record, or a function from the moment to the record as it is read then.
    """
    if not callable(quota):
        record = quota if isinstance(quota, dict) else quota_record(quota, NOW + 60 * MIN)
        quota = lambda moment: record
    at = [NOW]
    slept = []

    def jump(when, session=None):
        if while_asleep and not slept:
            while_asleep()
        slept.append(when)
        at[0] = max(at[0], when)

    real = (ww.wall_clock, ww.sleep_until, ww.read_quota)
    ww.wall_clock, ww.sleep_until, ww.read_quota = (lambda: at[0]), jump, (lambda: quota(at[0]))
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(io.StringIO()):
            code = ww.main(argv)
    finally:
        ww.wall_clock, ww.sleep_until, ww.read_quota = real
    return code, out.getvalue(), slept


@section
def the_line_each_wait_ends_on():
    code, text, _ = run_with(["--for", "80"], 50)
    check("80 minutes with room: a ping", (code, text.startswith("WARM_PING "), "re-arm: scripts/ops/dxb-warm-wait --until @" in text), (0, True, True))
    code, text, slept = run_with(["--for", "80"], 99)
    check("80 minutes, window full: no ping, asleep past the reset and on to the wait's end",
          (code, text.startswith("WAIT_OVER "), "the 5-hour window stood at 99% and had no room for a turn" in text, slept),
          (0, True, True, [NOW + 55 * MIN, NOW + 62 * MIN, NOW + 80 * MIN]))
    code, text, slept = run_with(["--for", "40"], 50)
    check("40 minutes: over, nothing cold", (code, text.startswith("WAIT_OVER "), "cold" in text, slept), (0, True, False, [NOW + 40 * MIN]))
    code, text, slept = run_with(["--for", "40"], 99)
    check("40 minutes, window full: the wait's end waits for the reset too",
          (code, text.startswith("WAIT_OVER "), "the 5-hour window stood at 99% and had no room for a turn" in text, slept),
          (0, True, True, [NOW + 40 * MIN, NOW + 62 * MIN]))
    code, text, _ = run_with(["--for", "2000"], 10)
    check("33 hours: cold by the count", (code, text.startswith("WAIT_OVER "), "pings would cost more" in text), (0, True, True))
    code, text, _ = run_with(["--until-reset"], 95)
    check("--until-reset 62 minutes away: one ping first", (code, text.startswith("WARM_PING ")), (0, True))


# --- The session's last turn: read from its transcript as the status line's cacheTag reads it ---

def stamp(epoch):
    return datetime.datetime.fromtimestamp(epoch, datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def row(kind, at, **more):
    return json.dumps({"type": kind, "timestamp": stamp(at), "isSidechain": False, **more})


def failed_request(at):
    return row("assistant", at, isApiErrorMessage=True, error="rate_limit", message={"model": "<synthetic>", "role": "assistant"})


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
        # Claude Code writes an `assistant` row of its own for a request the API refused (2.1.323, read from
        # real transcripts: isApiErrorMessage true, message.model "<synthetic>"). No answer came: nothing warmed.
        ("a real answer, which names its model", [row("assistant", turn - 900), row("assistant", turn, message={"model": "claude-fable-5-2", "role": "assistant"})], turn, 40),
        ("Claude Code's own row for a failed request", [row("assistant", turn), failed_request(decoy)], turn, 40),
        ("a row marked only as an API error", [row("assistant", turn), row("assistant", decoy, isApiErrorMessage=True)], turn, 40),
        ("a row whose model is <synthetic> and nothing more", [row("assistant", turn), row("assistant", decoy, message={"model": "<synthetic>"})], turn, 40),
        ("nothing but failed requests", [failed_request(turn), failed_request(decoy)], None, None),
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

    # Sol's B4: the real request at minute 0, a failed one at minute 50 -- the cache goes cold at 60, not at 110.
    failing = transcript("failing", [row("assistant", NOW - 20 * MIN)])
    code, text, slept = run_with(["--for", "120", "--transcript", failing], 50,
                                 while_asleep=lambda: add_row(failing, failed_request(NOW + 50 * MIN)))
    check("a failed request at the 50th minute warmed nothing: the ping stays at the 55th",
          (code, text.startswith("WARM_PING "), slept), (0, True, [NOW + 55 * MIN]))

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

    # the quota here says the window resets an hour after NOW; two minutes are waited past it
    code, text, slept = run_with(["--watch"], 98)
    check("--watch at 98 %: no ping, asleep to the window's reset",
          (code, text.startswith("WAIT_OVER "), "the 5-hour window stood at 98% and had no room for a turn" in text, slept),
          (0, True, True, [NOW + 55 * MIN, NOW + (60 + 2) * MIN]))
    code, text, slept = run_with(["--watch"], 97)
    check("--watch at 97 %: a ping", (text.startswith("WARM_PING "), slept), (True, [NOW + 55 * MIN]))


# --- The wake is not spent on a turn the quota would cut (Sol's A2, A3, C9 of 2026-11-13) ---

PING = NOW + 55 * MIN
CEILING_MIN = 310  # five hours and ten minutes: a 5-hour window has reset by then, whatever the record says


def read_every_minute(times):
    """The moments a clock sleeps to from its ping when it reads the quota again once a minute."""
    return [PING] + [PING + minute * MIN for minute in range(1, times + 1)]


@section
def no_wake_without_room_for_a_turn():
    code, text, slept = run_with(["--watch"], quota_record(40, NOW + 60 * MIN, week_used=100, week_reset=NOW + 2 * DAY))
    check("the week is full: no ping, asleep to the week's reset",
          (code, text.startswith("WAIT_OVER "), "cold: at " in text and "the week stood at 100% and had no room for a turn" in text, slept),
          (0, True, True, [PING, NOW + 2 * DAY + 2 * MIN]))
    code, text, slept = run_with(["--watch"], quota_record(99, NOW + 60 * MIN, week_used=98, week_reset=NOW + 2 * DAY))
    check("both windows are full: asleep to the later reset",
          (text.startswith("WAIT_OVER "), "the 5-hour window stood at 99% and the week stood at 98% and had no room for a turn" in text, slept),
          (True, True, [PING, NOW + 2 * DAY + 2 * MIN]))
    code, text, slept = run_with(["--watch"], quota_record(40, NOW + 60 * MIN, week_used=97))
    check("the week at 97 %: a ping", (text.startswith("WARM_PING "), slept), (True, [PING]))

    # dxb-quota's record is of the last turn any session took, so it goes stale while every session sleeps
    code, text, slept = run_with(["--watch"], quota_record(99, NOW + 30 * MIN))
    check("a full window whose reset has passed is a new window: a ping", (text.startswith("WARM_PING "), slept), (True, [PING]))

    # from a window's reset to the new window's first turn the status line writes the window empty
    # (measured in the real history, 2026-11-13 06:50:01 to 10:03:05)
    def empty_once_reset(used):
        record = quota_record(used, NOW + 30 * MIN)
        return lambda moment: record if moment < NOW + 30 * MIN else dict(record, five_hour=None)

    code, text, slept = run_with(["--watch"], empty_once_reset(40))
    check("the record holds no 5-hour window after the reset this clock saw coming: a ping", (text.startswith("WARM_PING "), slept), (True, [PING]))
    code, text, slept = run_with(["--until", f"@{PING + 30 * MIN}"], empty_once_reset(99))
    check("the same after a full window: it has reset, a ping", (text.startswith("WARM_PING "), slept), (True, [PING]))

    # Sol's A2: nothing to read, or a full window with no reset -- the old clock ended WARM_PING on all of these.
    unread = {
        "there is no quota record": {},
        "the 5-hour window was never read": dict(quota_record(40, NOW + 60 * MIN), five_hour=None),
        "the week holds no percentage": quota_record(40, NOW + 60 * MIN, week_used=None),
        "the 5-hour window is full and holds no reset": quota_record(100, None),
        "the week is full and holds no reset": quota_record(40, NOW + 60 * MIN, week_used=100, week_reset=None),
    }
    for name, record in unread.items():
        code, text, slept = run_with(["--watch"], lambda moment: record)
        check(f"{name}: no wake; read again every minute, and woken at the ceiling",
              (code, text.startswith("WAIT_OVER "), f"cold: the quota could not be read for {CEILING_MIN} min" in text, slept),
              (0, True, True, read_every_minute(CEILING_MIN)))
    code, text, slept = run_with(["--watch"], quota_record(None, NOW + 60 * MIN))
    check("a window with no percentage, whose reset then passes: woken then, the window is new",
          (text.startswith("WAIT_OVER "), "could not be read for 5 min" in text, slept), (True, True, read_every_minute(5)))
    code, text, slept = run_with(["--for", "40"], {})
    check("a wait's end without a quota to read is held the same way",
          (text.startswith("WAIT_OVER "), f"could not be read for {CEILING_MIN} min" in text, len(slept), slept[-1]),
          (True, True, 1 + CEILING_MIN, NOW + (40 + CEILING_MIN) * MIN))

    code, text, slept = run_with(["--watch"], lambda moment: quota_record(50, NOW + 200 * MIN) if moment >= PING + 7 * MIN else {})
    check("the quota can be read again after seven minutes, and has room: woken then",
          (code, text.startswith("WAIT_OVER "), "cold: the quota could not be read for 7 min" in text, slept), (0, True, True, read_every_minute(7)))
    code, text, slept = run_with(["--watch"], lambda moment: quota_record(99, NOW + 200 * MIN) if moment >= PING + 7 * MIN else {})
    check("it can be read again and is full: asleep to that reset",
          (text.startswith("WAIT_OVER "), "the 5-hour window stood at 99% and had no room for a turn" in text, slept),
          (True, True, read_every_minute(7) + [NOW + 202 * MIN]))


@section
def a_reset_is_checked_before_it_is_slept_on():
    # Sol's A3: a corrupt record's `Infinity` became a sleep with no end, behind a clock the gate saw alive.
    not_a_reset = (("Infinity", math.inf), ("NaN", math.nan), ("a negative", -3600.0), ("a string", "soon"), ("true", True),
                   ("9999 hours away", PING + 9999 * 60 * MIN))
    for name, reset in not_a_reset:
        code, text, slept = run_with(["--watch"], quota_record(100, reset))
        check(f"a full window whose reset is {name}: no sleep without an end",
              (code, text.startswith("WAIT_OVER "), f"could not be read for {CEILING_MIN} min" in text, slept),
              (0, True, True, read_every_minute(CEILING_MIN)))
        check(f"--until-reset on a reset that is {name}: refused", run_with(["--until-reset"], quota_record(96, reset))[0], 2)
    code, text, slept = run_with(["--watch"], quota_record(100, PING + 5 * 60 * MIN))
    check("a reset a whole window away is slept to", (text.startswith("WAIT_OVER "), slept), (True, [PING, PING + (5 * 60 + 2) * MIN]))
    # a window is 5 hours or 7 days long, and two minutes are waited past its reset: no reset is further away
    for name, record, reset in (("5-hour window", quota_record(100, PING + (5 * 60 + 3) * MIN), PING + (5 * 60 + 3) * MIN),
                                ("week", quota_record(40, NOW + 60 * MIN, week_used=100, week_reset=PING + 7 * DAY + 3 * MIN), PING + 7 * DAY + 3 * MIN)):
        code, text, slept = run_with(["--watch"], record)
        check(f"a reset further away than the {name} is long: not slept on until it is that near",
              (text.startswith("WAIT_OVER "), slept), (True, [PING, PING + 1 * MIN, reset + 2 * MIN]))

    # the corrupt record as it lies on disk, read by the command's own reader
    with open(QUOTA_RECORD, "w") as record:
        record.write('{"five_hour": {"used_percentage": 100, "resets_at": Infinity}, "seven_day": {"used_percentage": 40, "resets_at": NaN}}')
    code, text, slept = run_with(["--watch"], lambda moment: read_the_record())
    check("Infinity in the record on disk: every sleep has an end",
          (text.startswith("WAIT_OVER "), all(math.isfinite(moment) for moment in slept), slept), (True, True, read_every_minute(CEILING_MIN)))
    with open(QUOTA_RECORD, "w") as record:
        record.write("[]")
    check("a record on disk that is not an object reads as no record", read_the_record(), {})
    set_quota(50)


@section
def the_reset_wait_never_ends_before_the_reset():
    # Sol's C9: of a reset 179 seconds away dxb-quota says "0.0 h", and the wait ended 59 seconds before it.
    reset = NOW + 179
    code, text, slept = run_with(["--until-reset"], quota_record(96, reset))
    check("--until-reset sleeps to the record's own reset second, and two minutes on",
          (code, text.startswith("WAIT_OVER "), slept), (0, True, [reset + 2 * MIN]))
    code, text, slept = run_with(["--watch"], quota_record(99, PING + 179))
    check("a --watch that meets a full window does the same", slept, [PING, PING + 179 + 2 * MIN])


@section
def the_wait_survives_a_wall_clock_set_back():
    # Sol's C8: at the 10th minute the wall clock is set back 30 minutes; the wake then came at the real 85th.
    passed = [0.0]

    def nap(seconds):
        passed[0] += seconds

    real = (ww.wall_clock, ww.boot_clock, time.sleep)
    ww.wall_clock = lambda: NOW + passed[0] - (30 * MIN if passed[0] >= 10 * MIN else 0)
    ww.boot_clock, time.sleep = (lambda: 7000.0 + passed[0]), nap
    try:
        ww.sleep_until(NOW + 55 * MIN)
    finally:
        ww.wall_clock, ww.boot_clock, time.sleep = real
    check("it wakes when 55 minutes have really passed", round(passed[0] / MIN), 55)


# --- The session model's own week (2026-11-13: Fable 5.2's own week ran out at 15:15 while the 5-hour window and
# the week stood at 11 % and 59 %; the clock woke the dead session at 15:57) ---

OWN_SESSION = "0000bbbb-test-4000-8000-ownweektest"
READ = PING - 2 * MIN  # dxb-usage read the weeks two minutes before the ping, and asked then


def own_weeks(models, read_at=READ):
    """dxb-usage's record of each model's own week, and its stamp of the request it made then."""
    with open(os.path.join(RUNTIME, "usage-scoped.json"), "w") as record:
        json.dump({"read_at": read_at, "week": 40, "models": models}, record)
    with open(os.path.join(RUNTIME, "usage-scoped.asked"), "w") as stamp:
        stamp.write(repr(read_at))


def runs_on(model):
    """The status line's record of the session, which names its model (None: a record with no model)."""
    with open(os.path.join(RUNTIME, f"{OWN_SESSION}.json"), "w") as record:
        json.dump({"session_id": OWN_SESSION, "effort": "high", **({} if model is None else {"model": model})}, record)


def run_as_session(argv, quota, session=OWN_SESSION):
    os.environ["CLAUDE_CODE_SESSION_ID"] = session
    try:
        return run_with(argv, quota)
    finally:
        del os.environ["CLAUDE_CODE_SESSION_ID"]


def fable(used, resets_in_h=3.0):
    return {"used": used, "resets_at": NOW + resets_in_h * 3600, "share": 50}


ROOMY = quota_record(40, NOW + 60 * MIN)  # the 5-hour window and the week both have room


@section
def the_session_models_own_week_is_weighed_too():
    runs_on("Fable 5.2")
    own_weeks({"fable": fable(98)})
    code, text, slept = run_as_session(["--watch"], ROOMY)
    check("Fable's own week at 98 %: no ping, asleep to that week's reset",
          (code, text.startswith("WAIT_OVER "), "cold: at " in text and "Fable's own week stood at 98% and had no room for a turn" in text, slept),
          (0, True, True, [PING, NOW + 3 * 3600 + 2 * MIN]))

    own_weeks({"fable": fable(97)})
    code, text, slept = run_as_session(["--watch"], ROOMY)
    check("Fable's own week at 97 %: a ping", (text.startswith("WARM_PING "), slept), (True, [PING]))

    own_weeks({"fable": fable(99, resets_in_h=5.0)})
    code, text, slept = run_as_session(["--watch"], quota_record(99, NOW + 60 * MIN))
    check("the 5-hour window full too: asleep to the later reset, both named",
          (text.startswith("WAIT_OVER "), "the 5-hour window stood at 99% and Fable's own week stood at 99% and had no room" in text, slept),
          (True, True, [PING, NOW + 5 * 3600 + 2 * MIN]))

    own_weeks({"opus": {"used": 100, "resets_at": NOW + 3 * 3600, "share": 50}, "fable": fable(40)})
    code, text, slept = run_as_session(["--watch"], ROOMY)
    check("another model's full week does not stop a Fable session", (text.startswith("WARM_PING "), slept), (True, [PING]))
    runs_on("Opus 5.5")
    own_weeks({"fable": fable(100)})
    code, text, slept = run_as_session(["--watch"], ROOMY)
    check("nor does Fable's full week stop an Opus session", (text.startswith("WARM_PING "), slept), (True, [PING]))


def refreshed_by(fetch):
    """A run as the Fable session with the refresh due -- no request yet -- where `fetch` stands in the place of
    `dxb-usage --refresh`; every other command runs as it is."""
    real = subprocess.run
    subprocess.run = lambda argv, **kwargs: fetch() if argv[:1] == [ww.OWN_WEEKS] else real(argv, **kwargs)
    runs_on("Fable 5.2")
    try:
        return run_as_session(["--watch"], ROOMY)
    finally:
        subprocess.run = real
        os.remove(os.path.join(RUNTIME, "usage-scoped.json"))


@section
def a_refresh_is_judged_after_it_and_its_failure_keeps_the_record():
    # Sol's A1: the record the refresh wrote was judged at the moment before it, so its own read_at was "in the
    # future" and the full week was not known -- the clock woke a session into Fable's full week.
    def a_second_passes_and_fable_reads_100():
        then = ww.wall_clock
        ww.wall_clock = lambda: then() + 1
        own_weeks({"fable": fable(100)}, read_at=ww.wall_clock())

    for name in ("usage-scoped.json", "usage-scoped.asked"):  # no reading and no request yet: the refresh is due
        os.remove(os.path.join(RUNTIME, name))
    code, text, slept = refreshed_by(a_second_passes_and_fable_reads_100)
    check("a refresh that reads Fable at 100 % a second on: asleep to that reset",
          (text.startswith("WAIT_OVER "), "Fable's own week stood at 100%" in text, slept), (True, True, [PING, NOW + 3 * 3600 + 2 * MIN]))

    # Sol's B1: a refresh that ran out of time, or could not start, threw away the fresh record that stood
    for name, failure in (("ran out of time", subprocess.TimeoutExpired(ww.OWN_WEEKS, ww.FETCH_TIMEOUT_S)),
                          ("could not start", PermissionError(13, "Permission denied"))):
        def fails():
            raise failure

        own_weeks({"fable": fable(100)})
        os.remove(os.path.join(RUNTIME, "usage-scoped.asked"))
        code, text, slept = refreshed_by(fails)
        check(f"a refresh that {name}, the record standing at 100 %: asleep to that reset",
              (text.startswith("WAIT_OVER "), slept), (True, [PING, NOW + 3 * 3600 + 2 * MIN]))


@section
def an_own_week_not_known_changes_nothing():
    unknown = {
        "no reading of the own weeks": lambda: os.remove(os.path.join(RUNTIME, "usage-scoped.json")),
        "a reading 31 minutes old": lambda: own_weeks({"fable": fable(100)}, read_at=PING - 31 * MIN),
        "a reading of a week that has reset since": lambda: own_weeks({"fable": fable(100, resets_in_h=0.5)}),
        "a session record that names no model": lambda: (own_weeks({"fable": fable(100)}), runs_on(None)),
    }
    for name, arrange in unknown.items():
        runs_on("Fable 5.2")
        own_weeks({"fable": fable(100)})
        arrange()
        code, text, slept = run_as_session(["--watch"], ROOMY)
        check(f"{name}: a ping, as before", (code, text.startswith("WARM_PING "), slept), (0, True, [PING]))
    runs_on("Fable 5.2")
    own_weeks({"fable": fable(100)})
    code, text, slept = run_with(["--watch"], ROOMY)
    check("no session known: a ping, as before", (text.startswith("WARM_PING "), slept), (True, [PING]))
    code, text, slept = run_as_session(["--watch"], quota_record(99, NOW + 60 * MIN), session="another-session")
    check("and the two windows still decide as before", (text.startswith("WAIT_OVER "), "Fable" in text, slept), (True, False, [PING, NOW + 62 * MIN]))
    for name in ("usage-scoped.json", "usage-scoped.asked", f"{OWN_SESSION}.json"):
        os.remove(os.path.join(RUNTIME, name))


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


def record_of(session):
    with open(clock_file(session)) as record:
        return json.load(record)


def write_record(session, record):
    with open(clock_file(session), "w") as handle:
        json.dump(record, handle)


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
    # This session's own running clock, its record changed by hand to say it was armed 30 minutes ago.
    session = "status-session"
    stand_in = arm("--watch", session=session)
    written = record_of(session)
    armed_at = int(time.time()) - 30 * MIN
    os.makedirs(os.path.join(SANDBOX, ".claude", "projects", "-some-project"))
    own = os.path.join(SANDBOX, ".claude", "projects", "-some-project", f"{session}.jsonl")

    def write_down(until):
        write_record(session, dict(written, mode="--watch" if until is None else "--for", armed_at=armed_at, until=until))

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
def a_clock_is_proven_by_more_than_its_name():
    began = time.time()
    other = arm("--watch", session="other-session")
    theirs = record_of("other-session")

    # Sol's A1: this session's file names a pid that runs another session's clock -- whose end wakes that session.
    write_record("mine-session", theirs)
    check("another session's live clock in this session's file: not armed", status(session="mine-session"), "NOT_ARMED\nAWAY off\n")
    check("and the file is cleaned", os.path.exists(clock_file("mine-session")), False)
    write_record("mine-session", theirs)
    check("and it does not refuse an arming", run("--for", "0.01", session="mine-session").returncode, 0)

    # the same pid, and it runs a dxb-warm-wait, but one started at another moment: the pid was given out again
    reused = dict(theirs, session="reused-session", started=theirs.get("started", 0) + 1)
    write_record("reused-session", reused)
    check("a reused pid: not armed", status(session="reused-session"), "NOT_ARMED\nAWAY off\n")
    write_record("reused-session", reused)
    check("a reused pid does not refuse an arming", run("--for", "0.01", session="reused-session").returncode, 0)
    write_record("reused-session", dict(reused, started=theirs.get("started")))
    check("with the process's own start time the same record is a clock",
          status(session="reused-session").startswith(f"ARMED --watch pid {other.pid}, next ping "), True)

    check("the record names its session", (theirs["pid"], theirs.get("session")), (other.pid, "other-session"))
    with open("/proc/stat") as kernel:
        booted = int(re.search(r"^btime (\d+)", kernel.read(), re.M).group(1))
    check("and the moment the kernel started the process",
          abs(booted + theirs.get("started", 0) / os.sysconf("SC_CLK_TCK") - began) < 60, True)
    end(other)


@section
def the_clock_is_taken_whole_or_loudly_not_at_all():
    # Sol's B5: the record cannot be written, and the clock slept on where the gate could not see it.
    closed = os.path.join(SANDBOX, "closed")
    os.makedirs(os.path.join(closed, "claude-ctx"))
    os.chmod(os.path.join(closed, "claude-ctx"), 0o555)
    began = time.time()
    unseen = subprocess.run([sys.executable, COMMAND, "--for", "0.1"], capture_output=True, text=True, timeout=30,
                            env=dict(environment("closed-session", {}), XDG_RUNTIME_DIR=closed))
    check("a clock that cannot be written down ends at once, and says so",
          (unseen.returncode, unseen.stdout.startswith("NOT_ARMED the clock could not be written down"), unseen.stdout.count("\n"), time.time() - began < 4),
          (4, True, 1, True))
    os.chmod(os.path.join(closed, "claude-ctx"), 0o755)

    # Two armings at once: both are held at the folder's lock, behind which the look and the write are one step.
    folder = os.open(RUNTIME, os.O_RDONLY)
    fcntl.flock(folder, fcntl.LOCK_EX)
    try:
        pair = [subprocess.Popen([sys.executable, COMMAND, "--for", "1"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                                 env=environment("pair-session", {})) for _ in range(2)]
        clocks.extend(pair)
        time.sleep(1.5)
        check("while another holds the folder's lock no arming is written down",
              ([clock.poll() for clock in pair], registered("pair-session")), ([None, None], None))
        late = run("--for", "0.01", session="late-session", LOCK_PATIENCE_S=0.3)
        check("an arming that cannot have the lock in time ends loudly too",
              (late.returncode, late.stdout.startswith("NOT_ARMED the clock could not be written down")), (4, True))
    finally:
        os.close(folder)
    patience = time.time() + 10
    while all(clock.poll() is None for clock in pair) and time.time() < patience:
        time.sleep(0.02)
    won = [clock for clock in pair if clock.poll() is None]
    lost = [clock for clock in pair if clock.poll() is not None]
    check("the lock released: one arming takes the session and the other is refused",
          (len(won), [(clock.returncode, clock.stdout.read().startswith("ALREADY_ARMED --for pid ")) for clock in lost]), (1, [(3, True)]))
    check("the one written down is the one that runs", registered("pair-session"), won[0].pid if won else None)
    for clock in pair:
        end(clock)


@section
def a_quota_line_that_never_comes_does_not_hold_the_wake():
    # Sol's C7: the line is only shown, and the call that fetches it had no time limit.
    stuck = os.path.join(SANDBOX, "stuck-home")
    quota_command(stuck, "exec sleep 8")
    began = time.time()
    woke = subprocess.run([sys.executable, COMMAND, "--for", "0.02"], capture_output=True, text=True, timeout=30,
                          env=dict(environment("stuck-session", {"QUOTA_LINE_TIMEOUT_S": 1}), HOME=stuck))
    check("dxb-quota hangs: the wake comes all the same, without the line",
          (woke.returncode, woke.stdout.startswith("WAIT_OVER "), woke.stdout.rstrip().endswith("|"), time.time() - began < 6),
          (0, True, True, True))


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
