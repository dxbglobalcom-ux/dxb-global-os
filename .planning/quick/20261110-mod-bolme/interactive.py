#!/usr/bin/env python3
"""An interactive session in a pseudo-terminal (no screen involved), 200x50,
with the dxb-live-pane mod and DXB_MOD_HANDOVER_PCT=1.

1. Starts `claude --plugin-dir <mod>` in the repository, waits for it.
2. Types one prompt + Enter (the only user turn).
3. While that turn runs, types a draft into the composer WITHOUT Enter.
4. Waits for the handover prompt's turn (the mod logs it).
5. Starts a headless sender session whose mod $.session.send's a text to this
   (now idle) session by id, and waits to see whether that starts a turn.
6. Ends the session (ctrl+c twice) and keeps the raw terminal stream.
Everything observable lands in <job>/ia.pane-log.jsonl and runs/IA.*.
"""
import json
import os
import subprocess
import sys
import time
import uuid

import pexpect

JOB = "/home/dxb/DxB Global OS/.planning/quick/20261110-mod-bolme"
REPO = "/home/dxb/DxB Global OS"
LOG = f"{JOB}/ia.pane-log.jsonl"
DEADLINE = time.time() + 215

sid = str(uuid.uuid4())
open(f"{JOB}/runs/IA.session-id", "w").write(sid + "\n")

env = {k: v for k, v in os.environ.items() if not k.startswith("CLAUDE")}
env.update({
    "TERM": "xterm-256color",
    "DXB_MOD_HANDOVER_PCT": "1",
    "DXB_MOD_LOG_NAME": "ia.pane-log.jsonl",
})

raw = open(f"{JOB}/runs/IA.terminal.raw", "wb")
child = pexpect.spawn(
    "/home/dxb/.local/bin/claude",
    ["--plugin-dir", f"{JOB}/mod", "--session-id", sid, "--debug-file", f"{JOB}/runs/IA.debug.log"],
    cwd=REPO, env=env, dimensions=(50, 200), timeout=5,
)
child.logfile_read = raw


def pump(seconds):
    end = time.time() + seconds
    while time.time() < end:
        try:
            child.read_nonblocking(65536, timeout=0.5)
        except pexpect.TIMEOUT:
            pass
        except pexpect.EOF:
            return False
    return True


def kinds():
    try:
        return [json.loads(l)["kind"] for l in open(LOG)]
    except FileNotFoundError:
        return []


def wait_for(kind, count=1, limit=120):
    end = min(time.time() + limit, DEADLINE)
    while time.time() < end:
        if kinds().count(kind) >= count:
            return True
        pump(1)
    return False


def say(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


say("session", sid)
ok = wait_for("session.start", 1, 40)
say("session.start logged:", ok)
pump(6)  # let the first frame settle (any dialog would show in the raw stream)

child.send("Reply with the single word OK. Use no tools.")
pump(1)
child.send("\r")
ok = wait_for("main.turn.start", 1, 30)
say("first turn started:", ok)
pump(1)
child.send("draft words typed by a person")  # no Enter
say("draft typed")
ok = wait_for("handover.submit.resolved", 1, 120)
say("handover turn started:", ok)
ok = wait_for("main.turn.complete", 2, 90)
say("handover turn complete:", ok)

# 5. a peer message to this idle session, from a headless sender
sender = subprocess.run(
    ["bash", f"{JOB}/run-turn.sh", "IA-sender", "new", str(uuid.uuid4()), "probe (dropped by the mod)"],
    env={**{k: v for k, v in os.environ.items()}, "DXB_MOD_P3": "1", "DXB_MOD_SEND_TO": sid,
         "DXB_MOD_DROP_PROMPT": "1", "DXB_MOD_LOG_NAME": "ia-sender.pane-log.jsonl"},
    capture_output=True, text=True, timeout=60,
)
say("sender:", sender.stdout.strip().replace("\n", " | ")[:300])
ok = wait_for("main.turn.complete", 3, max(5, DEADLINE - time.time() - 15))
say("peer-message turn complete:", ok)
pump(3)

child.sendcontrol("c")
pump(1)
child.sendcontrol("c")
pump(3)
child.terminate(force=True)
raw.close()
say("ended; kinds:", kinds())
