#!/usr/bin/env python3
"""Tests for dxb-warm-wait: the real command, with its minutes shortened to seconds."""
import datetime
import json
import os
import signal
import subprocess
import sys
import tempfile
import time

COMMAND = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dxb-warm-wait")
SESSION = "0000aaaa-test-4000-8000-warmwaittest"
failed = []


def check(name, got, want):
    if got != want:
        failed.append(f"{name}: got {got!r}, want {want!r}")


class World:
    def __init__(self, ping=1, cold=60, margin=0, away=True):
        self.box = tempfile.TemporaryDirectory(prefix="warm-wait-test-")
        self.runtime = os.path.join(self.box.name, "claude-ctx")
        self.project = os.path.join(self.box.name, ".claude", "projects", "p")
        os.makedirs(self.runtime)
        os.makedirs(self.project)
        if away:
            open(os.path.join(self.runtime, f"away-{SESSION}"), "w").close()
        self.env = dict(os.environ, XDG_RUNTIME_DIR=self.box.name, HOME=self.box.name, CLAUDE_CODE_SESSION_ID=SESSION,
                        DXB_WARM_WAIT_TEST_PING_AFTER_S=str(ping), DXB_WARM_WAIT_TEST_STEP_S="0.1",
                        DXB_WARM_WAIT_TEST_COLD_S=str(cold), DXB_WARM_WAIT_TEST_MARGIN_S=str(margin))

    def quota(self, **held):
        with open(os.path.join(self.runtime, "rate-limits.json"), "w") as handle:
            json.dump({name: value and {"used_percentage": value[0], "resets_at": time.time() + value[1]}
                       for name, value in held.items()}, handle)

    def turn(self, ago, **more):
        at = datetime.datetime.fromtimestamp(time.time() - ago, datetime.timezone.utc).isoformat()
        with open(os.path.join(self.project, f"{SESSION}.jsonl"), "a") as handle:
            handle.write(json.dumps({"type": "assistant", "timestamp": at, "message": {"model": "m"}, **more}) + "\n")

    def start(self, *argv):
        return subprocess.Popen([sys.executable, COMMAND, *argv], env=self.env, stdout=subprocess.PIPE, text=True)

    def run(self, *argv, limit=5):
        """(exit code, first word said, seconds); "ASLEEP" when it still sleeps at the limit."""
        began, process = time.time(), self.start(*argv)
        try:
            said = process.communicate(timeout=limit)[0]
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
            return None, "ASLEEP", limit
        self.said = said
        return process.returncode, said.split()[0], time.time() - began


# a ping is made, whatever the quota record lacks
for name, held in {"no record": None, "no 5-hour window (Ultra)": {"five_hour": None, "seven_day": (64, 9999)},
                   "no week": {"five_hour": (40, 9999), "seven_day": None}, "the week at 99 %": {"five_hour": None, "seven_day": (99, 9999)},
                   "5-hour near full, reset far": {"five_hour": (97, 9999), "seven_day": (50, 9999)},
                   "a full window that has reset": {"five_hour": (100, -5), "seven_day": (50, 9999)}}.items():
    world = World()
    if held:
        world.quota(**held)
    code, word, took = world.run("--watch")
    check(f"{name}: a ping", (code, word, 1 <= took < 2.5), (0, "WARM_PING", True))
    check(f"{name}: the re-arm is on the line", "re-arm: scripts/ops/dxb-warm-wait --watch --pings 1" in world.said, True)
    check(f"{name}: the clock file is gone", os.path.exists(os.path.join(world.runtime, f"warm-wait-{SESSION}.pid")), False)

world = World()
world.quota(five_hour=None, seven_day=(100, 9999))
check("the week is spent: no ping", world.run("--watch", limit=2.5)[1], "ASLEEP")
world = World(ping=60)
world.quota(five_hour=(96, 2), seven_day=(50, 9999))
check("the 5-hour window near full: woken at its reset", world.run("--watch")[1], "WINDOW_RESET")
world = World(ping=60)
world.quota(five_hour=(80, 1), seven_day=(50, 9999))
check("a 5-hour window with room: its reset wakes nobody", world.run("--watch", limit=2.5)[1], "ASLEEP")
world = World()
check("the fourth ping re-arms", (world.run("--watch", "--pings", "3")[1], "--watch --pings 4" in world.said), ("WARM_PING", True))
check("the fifth closes", (world.run("--watch", "--pings", "4")[1], "close: scripts/ops/dxb-warm-wait --away off" in world.said), ("WARM_PING", True))
world = World(away=False)
check("away is off: no ping", world.run("--watch", limit=2.5)[1], "ASLEEP")

world = World(ping=1, cold=2)   # the machine is suspended past the cache's life: stopped and continued, the clock stays silent
clock = world.start("--watch")
time.sleep(0.5)
clock.send_signal(signal.SIGSTOP)
time.sleep(2.2)
clock.send_signal(signal.SIGCONT)
try:
    check("woken after a suspend, the cache is cold: no ping", clock.communicate(timeout=1.5)[0], "still asleep")
except subprocess.TimeoutExpired:
    world.turn(0)
    began = time.time()
    check("... until somebody's turn has warmed it", (clock.communicate(timeout=4)[0].split()[0], 0.7 < time.time() - began), ("WARM_PING", True))

world = World(ping=2)   # a turn moves the ping; a failed one and a helper's do not
clock = world.start("--watch")
time.sleep(1.2)
world.turn(0)
world.turn(0, isSidechain=True)
began = time.time()
check("a turn moves the ping", (clock.communicate(timeout=6)[0].split()[0], 1.7 < time.time() - began < 3), ("WARM_PING", True))
world = World(ping=1)
clock = world.start("--watch")
time.sleep(0.6)
world.turn(0, isApiErrorMessage=True)
began = time.time()
check("a failed turn does not", (clock.communicate(timeout=6)[0].split()[0], time.time() - began < 0.9), ("WARM_PING", True))

world = World(ping=60)
check("away off with no clock", world.run("--away", "off")[0], 0)
check("status, nothing armed", (world.run("--status")[1], "AWAY off" in world.said), ("NOT_ARMED", True))
check("away on", world.run("--away", "on")[0], 0)
clock = world.start("--watch")
time.sleep(0.6)
check("status, armed", (world.run("--status")[1], "AWAY on" in world.said), ("ARMED", True))
check("one clock a session", world.run("--watch")[:2], (3, "ALREADY_ARMED"))
clock.kill()
clock.wait()
check("a dead clock is no clock", world.run("--status")[1], "NOT_ARMED")
clock = world.start("--watch")
time.sleep(0.6)
check("away off", (world.run("--away", "off")[0], world.run("--status")[1], "AWAY off" in world.said), (0, "NOT_ARMED", True))
check("away off ends the clock", clock.wait(timeout=2) != 0, True)
check("nonsense is refused", world.run("--wach")[0], 2)

print("\n".join(failed) if failed else "warm-wait: all checks passed")
sys.exit(1 if failed else 0)
