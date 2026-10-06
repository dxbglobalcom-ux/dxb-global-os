#!/usr/bin/env python3
"""DXB effort warning (UserPromptSubmit / `plan` / `build` / `off`): the CEO is told which /effort to switch to.

The CEO's order of 2026-10-06: he opens a session at effort high and switches it himself with /effort;
the session only warns him. While the talk is plan, design or architecture, every reply begins with a
warning to switch to max, until he has; once the plan is approved and the build starts, every reply
begins with a warning to switch to high, until he has. The lead decides when each begins:

  * `dxb-effort-warn.py plan|build|off`, run by the lead from Bash: sets (or, for `off`, removes) the
    mode of the session named by CLAUDE_CODE_SESSION_ID -- a file
    $XDG_RUNTIME_DIR/dxb-effort/<session_id> (/tmp/dxb-effort/ without XDG_RUNTIME_DIR) holding
    `plan` or `build`.
  * UserPromptSubmit: while the session has a mode and its live level does not match it (plan: max,
    build: high), each of his messages carries the warning into the session's context.

The hook's stdin carries no effort (measured 2026-10-06). The live level is the newer, by timestamp, of
the status line's record $XDG_RUNTIME_DIR/claude-ctx/<session_id>.json (field `effort`, written on each
render, follows /effort at once) and this session's last assistant step in the transcript that carries an
`effort` (a /effort switch writes no row, so the transcript lags one turn behind it). A source that cannot be
read is not known; neither known: unknown. Every read is bounded (the transcript's tail, a few KB elsewhere).

Only a session id shaped like Claude Code's (SESSION_ID) ever names a file, so no path leaves the
folders; the mode folder is trusted only as a real directory (not a link) owned by this user and
writable by no one else, the record folder only when owned by this user; every file is reached through
its folder's descriptor without following a link, and only a regular file counts (a planted link or
FIFO must neither redirect a write nor block the hook). The mode is written by an O_EXCL temporary
file and a rename. Stdlib only. As a hook it never fails a session: on any failure it exits 0 with
nothing on stdout or stderr. The CLI answers on stdout; it refuses with exit 2 when it has no valid
session id, and exits 1 with the reason on stderr when the mode cannot be written or removed.
"""

import json
import os
import re
import stat
import sys
from datetime import datetime, timezone

SESSION_ID = re.compile(r"[0-9a-f-]{8,}", re.IGNORECASE)
LEVELS = ("low", "medium", "high", "xhigh", "max")
WANTED = {"plan": "max", "build": "high"}
RUNTIME = os.environ.get("XDG_RUNTIME_DIR") or "/tmp"
MODE_DIR = os.path.join(RUNTIME, "dxb-effort")
CTX_DIR = os.path.join(RUNTIME, "claude-ctx")
COMMAND = f'python3 "{os.path.abspath(__file__)}"'
DIR_FLAGS = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
FILE_FLAGS = os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK
TAIL_BYTES = 256 * 1024
SMALL_BYTES = 4 * 1024  # the mode file and the status line's record are a few dozen bytes
MAX_LINE = "⚠ Muhittin Bey, plan konuşmasındayız — /effort max'a geçin."
HIGH_LINE = "⚠ Muhittin Bey, plan bitti — koda geçmeden /effort high'a geçin."


def warning(mode, level):
    runs = f"runs at {level}" if level else "runs at an unknown level"
    if mode == "plan":
        return (
            f"This session is in PLAN mode under dxb-team2 and {runs}; the CEO's order (2026-10-06) is "
            f"plan, design and architecture at max, switched by him with /effort. Begin your reply, "
            f"before anything else, with exactly this line:\n{MAX_LINE}\n"
            f"Then go on, but write no file until he has switched. When he approves the plan, run "
            f"`{COMMAND} build` and warn him to switch to high.")
    return (
        f"This session is in BUILD mode under dxb-team2 and {runs}; the CEO's order (2026-10-06) is "
        f"the build at high, switched by him with /effort. Begin your reply, before anything else, with "
        f"exactly this line:\n{HIGH_LINE}\n"
        f"Then go on, but write no code until he has switched. When the job ends, run `{COMMAND} off`.")


def session_name(session_id):
    """The session's file name, or None when the id could name anything but a file in the folder."""
    if not isinstance(session_id, str) or not SESSION_ID.fullmatch(session_id):
        return None
    return session_id


def open_dir(path, create=False, private=True):
    """A descriptor on the folder, or None when it is missing or not to be trusted."""
    if create:
        try:
            os.mkdir(path, 0o700)
        except FileExistsError:
            pass
    try:
        fd = os.open(path, DIR_FLAGS)
    except OSError:  # missing, or a link (O_NOFOLLOW), or not a directory
        return None
    info = os.fstat(fd)
    if info.st_uid != os.getuid() or (private and info.st_mode & (stat.S_IWGRP | stat.S_IWOTH)):
        os.close(fd)
        return None
    return fd


def read_regular(name, dir_fd=None, limit=SMALL_BYTES, tail=False):
    """At most `limit` bytes of a regular file (its last `limit` bytes when `tail`), or None -- a link, a FIFO or
    nothing is None. A read error is raised; each source catches its own. A file growing while it is read is
    still read no further than `limit`."""
    try:
        fd = os.open(name, FILE_FLAGS, dir_fd=dir_fd)
    except OSError:
        return None
    try:
        info = os.fstat(fd)
        if not stat.S_ISREG(info.st_mode):
            return None
        if tail and info.st_size > limit:
            os.lseek(fd, info.st_size - limit, os.SEEK_SET)
        chunks = []
        left = limit
        while left > 0:
            chunk = os.read(fd, min(65536, left))
            if not chunk:
                break
            chunks.append(chunk)
            left -= len(chunk)
        return b"".join(chunks)
    finally:
        os.close(fd)


def parse_ts(value):
    if not isinstance(value, str):
        return None
    try:
        moment = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)


def read_mode(name):
    dir_fd = open_dir(MODE_DIR)
    if dir_fd is None:
        return None
    try:
        raw = read_regular(name, dir_fd=dir_fd)
    finally:
        os.close(dir_fd)
    mode = raw.decode("utf-8", "replace").strip() if raw is not None else None
    return mode if mode in WANTED else None


def record_level(name):
    """(timestamp, level) from the status line's record of this session, or None -- also when it cannot be read."""
    try:
        dir_fd = open_dir(CTX_DIR, private=False)
        if dir_fd is None:
            return None
        try:
            raw = read_regular(f"{name}.json", dir_fd=dir_fd)
        finally:
            os.close(dir_fd)
        record = json.loads(raw) if raw is not None else None
    except (OSError, ValueError):
        return None
    if not isinstance(record, dict) or record.get("session_id") != name or record.get("effort") not in LEVELS:
        return None
    moment = parse_ts(record.get("ts"))
    return (moment, record["effort"]) if moment else None


def transcript_level(path, name):
    """(timestamp, level) of this session's last assistant step carrying an effort, from the transcript's tail, or
    None -- also when it cannot be read. A step of another session, or one naming no session, does not count."""
    if not isinstance(path, str) or not path:
        return None
    try:
        raw = read_regular(path, limit=TAIL_BYTES, tail=True)
    except OSError:
        return None
    if raw is None:
        return None
    for line in reversed(raw.splitlines()):
        try:
            row = json.loads(line)
        except ValueError:  # the tail's cut first line, or a torn last one
            continue
        if (isinstance(row, dict) and row.get("type") == "assistant" and row.get("sessionId") == name
                and row.get("effort") in LEVELS):
            moment = parse_ts(row.get("timestamp"))
            if moment:
                return moment, row["effort"]
    return None


def live_level(name, transcript_path):
    known = [found for found in (record_level(name), transcript_level(transcript_path, name)) if found]
    if not known:
        return None
    # the record first, so on a tie the live one wins
    return max(known, key=lambda found: found[0])[1]


def on_hook(data):
    if data.get("hook_event_name") != "UserPromptSubmit":
        return
    name = session_name(data.get("session_id"))
    if name is None:
        return
    mode = read_mode(name)
    if mode is None:
        return
    level = live_level(name, data.get("transcript_path"))
    if level == WANTED[mode]:
        return
    output = {"hookSpecificOutput": {"hookEventName": "UserPromptSubmit",
                                     "additionalContext": warning(mode, level)}}
    sys.stdout.write(json.dumps(output, ensure_ascii=False) + "\n")


def write_mode(dir_fd, name, mode):
    """Writes the mode by rename -- a link or FIFO standing there is replaced, never opened."""
    tmp = f".{name}.{os.urandom(8).hex()}.tmp"
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=dir_fd)
    try:
        try:
            os.write(fd, mode.encode())
        finally:
            os.close(fd)
        os.replace(tmp, name, src_dir_fd=dir_fd, dst_dir_fd=dir_fd)
    except BaseException:
        try:
            os.unlink(tmp, dir_fd=dir_fd)
        except OSError:
            pass
        raise


def cli(mode):
    name = session_name(os.environ.get("CLAUDE_CODE_SESSION_ID"))
    if name is None:
        sys.stderr.write("dxb-effort-warn: no valid CLAUDE_CODE_SESSION_ID in the environment\n")
        return 2
    try:
        dir_fd = open_dir(MODE_DIR, create=mode != "off")
    except OSError as error:
        sys.stderr.write(f"dxb-effort-warn: the mode folder cannot be made -- {error}\n")
        return 1
    if dir_fd is None:
        if mode == "off":
            print("effort mode: off — no warning for this session")
            return 0
        sys.stderr.write(f"dxb-effort-warn: {MODE_DIR} is missing or not to be trusted "
                         f"(a link, not this user's, or writable by others)\n")
        return 1
    try:
        if mode == "off":
            try:
                if stat.S_ISREG(os.stat(name, dir_fd=dir_fd, follow_symlinks=False).st_mode):
                    os.unlink(name, dir_fd=dir_fd)
            except FileNotFoundError:
                pass
        else:
            write_mode(dir_fd, name, mode)
    except OSError as error:
        sys.stderr.write(f"dxb-effort-warn: the mode could not be {'removed' if mode == 'off' else 'written'} "
                         f"-- {error}\n")
        return 1
    finally:
        os.close(dir_fd)
    if mode == "off":
        print("effort mode: off — no warning for this session")
    else:
        print(f"effort mode: {mode} — the CEO is warned to switch to {WANTED[mode]} until he does")
    return 0


def main():
    raw = sys.stdin.buffer.read()
    if not raw.strip():
        return
    data = json.loads(raw)
    if isinstance(data, dict):
        on_hook(data)


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] in ("plan", "build", "off"):
        sys.exit(cli(sys.argv[1]))
    try:
        main()
        sys.stdout.flush()
    except Exception:
        pass
    os._exit(0)
