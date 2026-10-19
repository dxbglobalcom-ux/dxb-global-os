#!/usr/bin/env python3
"""Tamper evidence for the second plan (second-plan.sh, CEO 2026-10-19).

The lead and Fable run as the same Unix user, so no file permission can keep the lead from reading
Fable's output before its own plan is sealed. What a terminal CAN do is notice: this watcher holds an
inotify watch on each given file's inode — so a read through any path, a hard link or /proc/<pid>/fd
alike is seen — and writes one line for every read (IN_ACCESS) and every read-only open that closes
(IN_CLOSE_NOWRITE). Fable's own writer opens the file write-only and is never logged. `reveal` stops
the watcher and refuses when any such line exists, or when the watcher is gone.

Usage: second-plan-watch.py <log> <file>...   (the files must exist; the log gets WATCHING first)
"""
import ctypes
import os
import signal
import struct
import sys
from datetime import datetime

IN_ACCESS = 0x001
IN_CLOSE_NOWRITE = 0x010
EVENT = struct.Struct("iIII")


def now():
    return datetime.now().astimezone().isoformat(timespec="seconds")


def main():
    log_path, files = sys.argv[1], sys.argv[2:]
    if not files:
        sys.exit("second-plan-watch: no file to watch")
    libc = ctypes.CDLL("libc.so.6", use_errno=True)
    fd = libc.inotify_init()
    if fd < 0:
        sys.exit(f"second-plan-watch: inotify_init failed, errno {ctypes.get_errno()}")
    names = {}
    for f in files:
        wd = libc.inotify_add_watch(fd, f.encode(), IN_ACCESS | IN_CLOSE_NOWRITE)
        if wd < 0:
            sys.exit(f"second-plan-watch: cannot watch {f}, errno {ctypes.get_errno()}")
        names[wd] = os.path.basename(f)
    log = open(log_path, "a", buffering=1)

    def stop(*_):
        log.write(f"{now()} STOPPED\n")
        sys.exit(0)

    signal.signal(signal.SIGTERM, stop)
    log.write(f"{now()} WATCHING pid={os.getpid()} {' '.join(names.values())}\n")
    while True:
        buf = os.read(fd, 4096)
        i = 0
        while i < len(buf):
            wd, mask, _cookie, length = EVENT.unpack_from(buf, i)
            i += EVENT.size + length
            kind = "read" if mask & IN_ACCESS else "opened-for-read"
            log.write(f"{now()} {kind} {names.get(wd, wd)}\n")


if __name__ == "__main__":
    main()
