"""B24 fixture — a live subreaper that is neither init nor systemd.

Any process may call prctl(PR_SET_CHILD_SUBREAPER); orphans below it are then
adopted by IT rather than by pid 1 or the user manager. This fixture builds the
two states the guard must tell apart, under that same live adopter:

  * an ORPHAN whose session leader has died — a widow, whoever adopted it;
  * a LIVE helper in this process's own session — a helper with a home.

argv: <orphan-pidfile> <live-pidfile>
"""

import ctypes
import subprocess
import sys
import time

PR_SET_CHILD_SUBREAPER = 36
libc = ctypes.CDLL("libc.so.6", use_errno=True)
assert libc.prctl(PR_SET_CHILD_SUBREAPER, 1, 0, 0, 0) == 0, "prctl refused"

orphan_pidfile, live_pidfile = sys.argv[1], sys.argv[2]
HELPER = 'exec -a "npm exec @playwright/mcp@latest" sleep 120'

# A session of its own, whose leader exits at once and leaves the helper behind.
subprocess.run(["setsid", "bash", "-c", f"{HELPER} & echo $! > {orphan_pidfile}"], check=True)

# The same command in THIS process's session, which stays alive.
live = subprocess.Popen(["bash", "-c", HELPER])
with open(live_pidfile, "w") as f:
    f.write(str(live.pid))

time.sleep(120)
