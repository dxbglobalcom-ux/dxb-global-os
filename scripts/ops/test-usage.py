#!/usr/bin/env python3
"""Tests for dxb-usage: what it keeps of the answer, that the sign-in key never leaves the one request's header,
when it asks (from 80 %, then every ten minutes, never below), and what it says. No real network and no real
key: a fake home holds a dummy key, and a fake answer stands in the place of the one network call."""
import atexit
import contextlib
import fcntl
import importlib.machinery
import importlib.util
import io
import json
import os
import shutil
import stat
import sys
import tempfile
import time
import urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
COMMAND = os.path.join(HERE, "dxb-usage")

# The tests' own world, set before the command is loaded: their own runtime folder and their own home, whose
# credentials file holds a dummy key -- the real one is never read.
SANDBOX = tempfile.mkdtemp(prefix="usage-test-")
atexit.register(shutil.rmtree, SANDBOX, ignore_errors=True)
os.environ.update(XDG_RUNTIME_DIR=SANDBOX, HOME=SANDBOX, TZ="UTC")
time.tzset()
RUNTIME = os.path.join(SANDBOX, "claude-ctx")
RECORD = os.path.join(RUNTIME, "usage-scoped.json")
CREDENTIALS = os.path.join(SANDBOX, ".claude", ".credentials.json")
KEY = "sk-ant-oat01-DUMMY-test-key-0123456789"
os.makedirs(os.path.dirname(CREDENTIALS))
with open(CREDENTIALS, "w") as handle:
    json.dump({"claudeAiOauth": {"accessToken": KEY, "refreshToken": "sk-ant-ort01-DUMMY-refresh", "expiresAt": 1}}, handle)

MIN = 60
NOW = 1_794_592_800.0                # 2026-11-13 18:00:00 UTC
FABLE_RESET = 1_794_643_200.391986   # 2026-11-14T08:00:00.391986+00:00, as the answer of 2026-11-13 wrote it

loader = importlib.machinery.SourceFileLoader("dxb_usage", COMMAND)
spec = importlib.util.spec_from_loader("dxb_usage", loader)
usage = importlib.util.module_from_spec(spec)
loader.exec_module(usage)

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


def answer(percent=100, resets_at="2026-11-14T08:00:00.391986+00:00", share=50, name="Fable"):
    """The address's answer in the shape the lead read on 2026-11-13: the per-model window is the third limit,
    and its share points at it by index. The other keys are not ours."""
    return {
        "limits": [
            {"kind": "session", "group": "session", "percent": 11, "severity": "ok", "resets_at": "2026-11-13T20:00:00+00:00",
             "scope": None, "is_active": True},
            {"kind": "weekly_all", "group": "weekly", "percent": 59, "severity": "ok", "resets_at": "2026-11-17T08:00:00+00:00",
             "scope": None, "is_active": True},
            {"kind": "weekly_scoped", "group": "weekly", "percent": percent, "severity": "critical", "resets_at": resets_at,
             "scope": {"model": {"id": None, "display_name": name}, "surface": None}, "is_active": True},
        ],
        "weekly_scoped_shares": [{"limit_index": 2, "used_percent_of_weekly": 50, "allowance_percent_of_weekly": share}],
        "extra_usage": {"monthly_limit": 12345, "used_credits": 678},
    }


class Address:
    """The fake network: each request is kept, and answered by the next thing in line -- an answer, or an
    exception raised in its place."""

    def __init__(self, *replies):
        self.replies, self.requests = list(replies), []

    def __call__(self, request):
        self.requests.append(request)
        reply = self.replies.pop(0) if self.replies else answer()
        if isinstance(reply, BaseException):
            raise reply
        return io.BytesIO(reply if isinstance(reply, bytes) else json.dumps(reply).encode())


def refused(code):
    return urllib.error.HTTPError(usage.URL, code, "refused", {}, io.BytesIO(b'{"error": "nope"}'))


def week(percent):
    """The status line's record, holding the all-models week at that percentage."""
    os.makedirs(RUNTIME, exist_ok=True)
    with open(os.path.join(RUNTIME, "rate-limits.json"), "w") as handle:
        json.dump({"five_hour": {"used_percentage": 11, "resets_at": NOW + 2 * 3600},
                   "seven_day": None if percent is None else {"used_percentage": percent, "resets_at": NOW + 3 * 86400},
                   "written_at": "2026-11-13T17:59:00.000Z"}, handle)


def fresh_world():
    """No reading and no request yet."""
    for name in ("usage-scoped.json", "usage-scoped.asked", "rate-limits.json"):
        with contextlib.suppress(FileNotFoundError):
            os.remove(os.path.join(RUNTIME, name))


def run(*argv, at=NOW, address=None):
    """(exit code, stdout, stderr) of the command run in-process at that moment, on that fake network."""
    real = (usage.wall_clock, usage.send)
    usage.wall_clock = lambda: at
    usage.send = address if address is not None else Address()
    out, err = io.StringIO(), io.StringIO()
    try:
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = usage.main(list(argv))
    finally:
        usage.wall_clock, usage.send = real
    return code, out.getvalue(), err.getvalue()


def on_disk():
    """Every byte the command has left in its runtime folder, as one text."""
    texts = []
    for name in sorted(os.listdir(RUNTIME)) if os.path.isdir(RUNTIME) else []:
        with open(os.path.join(RUNTIME, name), "rb") as handle:
            texts.append(handle.read().decode("utf-8", "replace"))
    return "\n".join(texts)


def record():
    with open(RECORD) as handle:
        return json.load(handle)


@section
def a_reading_keeps_the_model_weeks_and_nothing_else():
    fresh_world()
    week(59)
    address = Address(answer())
    code, out, _ = run("--refresh", address=address)
    check("a refresh asks once", (code, len(address.requests)), (0, 1))
    check("the record: the model's week, its share, when it was read and the all-models week then",
          record(), {"read_at": NOW, "week": 59, "models": {"fable": {"used": 100, "resets_at": FABLE_RESET, "share": 50}}})
    check("the record is the owner's alone", stat.S_IMODE(os.stat(RECORD).st_mode), 0o600)
    check("no other key of the answer is kept", ("extra_usage" in on_disk(), "12345" in on_disk(), "weekly_all" in on_disk()), (False, False, False))
    check("--json prints the record", json.loads(run("--json", at=NOW + 2 * MIN)[1]), record())
    code, out, _ = run(at=NOW + 150)
    check("one line per model", (code, out), (0, "fable 100% · resets 08:00 · read 2 min ago\n"))
    fresh_world()
    week(59)
    run("--refresh", address=Address(answer(resets_at="2026-11-14T07:59:59.659729+00:00")))  # as the answer of 18:26 wrote it
    check("a reset a breath before the hour is said at the hour", run(at=NOW + MIN)[1], "fable 100% · resets 08:00 · read 1 min ago\n")

    request = address.requests[0]
    check("the address", (request.full_url, request.get_method()), ("https://api.anthropic.com/api/oauth/usage", "GET"))
    check("the headers", (request.get_header("Authorization"), request.get_header("Anthropic-beta"), request.get_header("User-agent")),
          (f"Bearer {KEY}", "oauth-2025-04-20", "dxb-usage"))
    check("the request's limit", usage.TIMEOUT_S, 10)


@section
def a_value_that_cannot_be_read_leaves_that_model_out():
    unusable = {
        "a percent as text": answer(percent="100"),
        "a percent above 100": answer(percent=101),
        "a negative percent": answer(percent=-1),
        "a percent that is NaN": answer(percent=float("nan")),
        "a percent that is true": answer(percent=True),
        "no percent": answer(percent=None),
        "no reset": answer(resets_at=None),
        "a reset that is no time": answer(resets_at="tomorrow"),
        "a reset with no offset": answer(resets_at="2026-11-14T08:00:00"),
        "a reset as a number": answer(resets_at=FABLE_RESET),
        "no display name": answer(name=None),
    }
    for name, reply in unusable.items():
        fresh_world()
        week(59)
        run("--refresh", address=Address(reply))
        check(f"{name}: the model is left out", record()["models"], {})
        check(f"{name}: and nothing is said of it", run(at=NOW + MIN)[1].startswith("unknown: "), True)
    fresh_world()
    week(59)
    both = answer()
    both["limits"].append(dict(both["limits"][2], percent=101, scope={"model": {"display_name": "Opus"}}))
    run("--refresh", address=Address(both))
    check("a bad model beside a good one: the good one is kept", sorted(record()["models"]), ["fable"])
    fresh_world()
    week(59)
    run("--refresh", address=Address(answer(share=0)))
    check("a share of 0 is no share", record()["models"]["fable"].get("share"), None)


@section
def the_key_is_never_printed_kept_or_carried_on():
    # Every path: an answer, a refusal, a failure, a failure whose own words carry the key, garbage, nothing.
    replies = {
        "an answer": answer(),
        "a 401": refused(401),
        "a 403": refused(403),
        "a 500": refused(500),
        "no network": urllib.error.URLError(f"cannot reach host, sent Bearer {KEY}"),
        "a timeout": TimeoutError(f"timed out with {KEY}"),
        "an error that names the key": RuntimeError(f"Authorization: Bearer {KEY}"),
        "garbage": b"<html>not json</html>",
        "a list": b"[1, 2]",
    }
    for name, reply in replies.items():
        fresh_world()
        week(59)
        said = "".join(part for argv in (["--refresh"], [], ["--json"]) for part in run(*argv, address=Address(reply))[1:])
        check(f"{name}: the key is in no output", KEY in said, False)
        check(f"{name}: the key is in no file of the runtime folder", KEY in on_disk(), False)
        check(f"{name}: nor the refresh key", "DUMMY-refresh" in said + on_disk(), False)


@section
def a_refused_or_failed_request_leaves_the_figure_out():
    for name, failure in (("a 401", refused(401)), ("a 403", refused(403)), ("no network", urllib.error.URLError("down")),
                          ("garbage", b"not json")):
        fresh_world()
        week(59)
        code, out, _ = run("--refresh", address=Address(failure))
        check(f"{name}, with no reading before: it says so", (code, out.startswith("not read: ")), (0, True))
        check(f"{name}, with no reading before: no figure", (os.path.exists(RECORD), run(at=NOW + MIN)[1]), (False, "unknown: no reading yet\n"))

        fresh_world()
        week(59)
        run("--refresh", address=Address(answer(percent=90)))
        kept = record()
        run("--refresh", at=NOW + 11 * MIN, address=Address(failure))
        check(f"{name}, after a reading: the record is as it was", record(), kept)
        check(f"{name}, after a reading: its figure, its age", run(at=NOW + 12 * MIN)[1], "fable 90% · resets 08:00 · read 12 min ago\n")
    fresh_world()
    os.remove(CREDENTIALS)
    try:
        address = Address(answer())
        code, out, _ = run("--refresh", address=address)
        check("no sign-in to read: no request, nothing written", (code, out, len(address.requests), os.listdir(RUNTIME) if os.path.isdir(RUNTIME) else []),
              (0, "not read: no sign-in key to read\n", 0, []))
    finally:
        with open(CREDENTIALS, "w") as handle:
            json.dump({"claudeAiOauth": {"accessToken": KEY}}, handle)


@section
def an_old_record_is_not_known():
    fresh_world()
    week(59)
    run("--refresh", address=Address(answer()))
    check("30 minutes old: still said", run(at=NOW + 30 * MIN)[1], "fable 100% · resets 08:00 · read 30 min ago\n")
    check("31 minutes old: unknown", run(at=NOW + 31 * MIN)[1], "unknown: the last reading is 31 min old\n")
    check("31 minutes old: nothing to read", usage.readings(NOW + 31 * MIN), {})
    check("fresh: the reading", usage.readings(NOW + 5 * MIN), {"fable": {"used": 100, "resets_at": FABLE_RESET}})
    fresh_world()
    week(59)
    run("--refresh", address=Address(answer(resets_at="2026-11-13T18:05:00+00:00")))
    check("a fresh reading of a week that has reset since: unknown", run(at=NOW + 6 * MIN)[1].startswith("unknown: "), True)


@section
def no_request_while_the_bound_stays_below_80():
    # Fable's share of the all-models week is 50 %: its own week can rise at most twice what the week rises.
    fresh_world()
    week(20)
    run("--refresh", address=Address(answer(percent=30)))
    check("just read: not due", usage.due(NOW + MIN), False)
    for week_now, due in ((44, False), (45, True)):  # 30 + 2 x 24 = 78; 30 + 2 x 25 = 80
        week(week_now)
        check(f"read at 30 % with the week at 20, the week now {week_now}: due {due}, an hour on", usage.due(NOW + 60 * MIN), due)
        check(f"... and twelve hours on, its own week not yet reset", usage.due(NOW + 12 * 3600), due)

    # once the model's week has reset: twice the week now
    for week_now, due in ((39, False), (40, True)):
        week(week_now)
        check(f"its week reset since, the week now {week_now}: due {due}", usage.due(FABLE_RESET + 60), due)

    fresh_world()
    week(20)
    run("--refresh", address=Address(answer(percent=30)))
    week(10)
    check("the all-models week fell (it reset): the bound cannot be told, due", usage.due(NOW + 11 * MIN), True)
    week(None)
    check("the all-models week is not known: due", usage.due(NOW + 11 * MIN), True)

    fresh_world()
    week(20)
    check("no reading yet, so no share: due", usage.due(NOW), True)
    run("--refresh", address=Address(answer(percent=30, share=None)))
    check("a reading with no share: due every ten minutes", (usage.due(NOW + 9 * MIN), usage.due(NOW + 10 * MIN)), (False, True))

    # the whole run, as the hook and the clock see it: below 80 nothing is asked however long it goes
    fresh_world()
    week(20)
    run("--refresh", address=Address(answer(percent=30)))
    asked = [moment for moment in range(int(NOW), int(NOW + 6 * 3600), 60) if usage.due(moment)]
    check("six hours with the bound at 30: not one request", asked, [])


@section
def from_80_one_request_at_most_every_ten_minutes():
    fresh_world()
    week(59)
    run("--refresh", address=Address(answer(percent=85)))
    check("at 85: not due within ten minutes of the request", [usage.due(NOW + minute * MIN) for minute in (1, 5, 9)], [False] * 3)
    check("at 85: due at ten", usage.due(NOW + 10 * MIN), True)

    address = Address(answer(percent=85), answer(percent=86), answer(percent=87))
    for minute in range(0, 31):  # a refresh every minute for half an hour
        run("--refresh", at=NOW + 10 * MIN + minute * MIN, address=address)
    check("a refresh every minute for 30 minutes: four requests", len(address.requests), 4)

    failing = Address(*[urllib.error.URLError("down")] * 10)
    for minute in range(0, 10):
        run("--refresh", at=NOW + 50 * MIN + minute * MIN, address=failing)
    check("a failed request counts: one in ten minutes", len(failing.requests), 1)
    check("a failure is still due again ten minutes on", usage.due(NOW + 60 * MIN), True)

    # one machine, one request: while another asks (it holds the stamp), this one does not
    address = Address(answer())
    with open(os.path.join(RUNTIME, "usage-scoped.asked"), "a") as stamp:
        fcntl.flock(stamp, fcntl.LOCK_EX)
        code, out, _ = run("--refresh", at=NOW + 90 * MIN, address=address)
    check("another request under way: not asked", (code, out.startswith("not read: "), len(address.requests)), (0, True, 0))


@section
def bad_usage():
    for argv in (["--nope"], ["--json", "--refresh"], ["fable"]):
        code, out, err = run(*argv)
        check(f"{argv}: exit 2", (code, out, err.startswith("usage: ")), (2, "", True))
    real = __import__("subprocess").run([sys.executable, COMMAND, "--nope"], capture_output=True, text=True, timeout=30)
    check("as a command: exit 2", real.returncode, 2)
    check("it is executable", os.access(COMMAND, os.X_OK), True)


if failed:
    print("\n".join(failed))
    sys.exit(1)
print("usage: all checks passed")
