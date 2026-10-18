#!/usr/bin/env python3
"""THE X GATE — every read that reaches x.com through the CEO's session passes here, one at a time.

WHY IT EXISTS. 2026-10-18: three parallel research helpers made about 60 X calls in ~15 minutes
through the copy of HIS signed-in session and drew `HTTP 429 (session quota)` twice. X counts per
account, so the research door, the Gözlem Odası and anything else that reads X on this machine
share ONE budget — his. Nothing guarded it: every caller paced itself, and none of them knew about
the others. (Plan: .planning/quick/20261018-gozlem-odasi/PLAN.md, D2.)

THE RULES, for all callers together:
  * one X reader at a time (an exclusive lock), calls at least SPACING_S apart;
  * at most WINDOW_MAX calls in any WINDOW_S, DAY_MAX in a calendar day, the room ROOM_DAY_MAX of them;
  * a 429 pauses X for PAUSE_429_S; a second 429 within 24 h closes it until the next day;
  * a captcha / "unusual activity" / verify page FREEZES it — never self-clearing: X waits for a
    person (`xgate.py clear frozen`), because a machine that keeps reading after a warning is how an
    account gets locked;
  * a login wall marks the session dead; it is cleared after the profile is re-copied
    (`xgate.py clear session_dead`), never by a machine login.
A refused call costs nothing and touches nothing: one line on stderr and exit code REFUSED.

The caller names itself in DXB_X_CALLER (`research` when unset; the room is `room`). The state lives
in the hidden Chrome's run folder, the one path a hunter's jail may write (fleet.sh HUNTER_HOME_RW).

  xgate.py status [--json] · xgate.py clear frozen|session_dead · xgate.py classify < text
"""
from __future__ import annotations

import argparse
import contextlib
import datetime as dt
import fcntl
import json
import os
import re
import sys
import time
import urllib.parse
from pathlib import Path

DIR = Path(os.environ.get("DXB_XGATE_DIR")
           or Path.home() / ".local" / "share" / "dxb-research-chrome" / "run" / "xgate")
SPACING_S = 3.0
WINDOW_S, WINDOW_MAX = 15 * 60, 20
DAY_MAX, ROOM_DAY_MAX = 150, 50
PAUSE_429_S = 30 * 60
LOCK_WAIT_S = 600.0
REFUSED = 76

X_HOSTS = {"x.com", "twitter.com", "t.co"}
X_SITES = {"twitter"}           # opencli's site name for X

# What X answers, as opencli and the page show it (opencli clis/twitter/shared.js
# describeTwitterApiError, dist/src/errors.js AuthRequiredError).
_FROZEN = re.compile(r"captcha|arkose|/account/access|unusual (login )?activity|verify (it'?s|that it'?s) you"
                     r"|your account (has been|is) (temporarily )?locked", re.I)
_LIMIT = re.compile(r"HTTP 429|session quota|too many requests|rate.?limit", re.I)
_DEAD = re.compile(r"AUTH_REQUIRED|not logged in(to)? (to )?x\.com|auth cookies are missing|HTTP 401"
                   r"|re-login required|/i/flow/login", re.I)


class Refused(Exception):
    """The gate said no; the message says why and until when."""


def is_x_url(url: str) -> bool:
    host = (urllib.parse.urlsplit(url).hostname or "").lower()
    return any(host == h or host.endswith("." + h) for h in X_HOSTS)


def classify(text: str) -> str:
    """'frozen' | '429' | 'session_dead' | 'ok' — the worst thing the answer shows. Only a FAILED
    answer is classified: a successful one carries other people's posts, and a post that says
    "rate limit" is not X saying it."""
    if _FROZEN.search(text):
        return "frozen"
    if _LIMIT.search(text):
        return "429"
    if _DEAD.search(text):
        return "session_dead"
    return "ok"


# ---------------------------------------------------------------- state on disk
def _jsonl(name: str) -> list[dict]:
    try:
        lines = (DIR / name).read_text(encoding="utf-8").splitlines()
    except OSError:
        return []
    out = []
    for ln in lines:
        with contextlib.suppress(ValueError):
            out.append(json.loads(ln))
    return out


def _append(name: str, row: dict) -> None:
    with open(DIR / name, "a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


def _state() -> dict:
    try:
        return json.loads((DIR / "state.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def _save(st: dict) -> None:
    tmp = DIR / "state.json.tmp"
    tmp.write_text(json.dumps(st, ensure_ascii=False, indent=1), encoding="utf-8")
    os.replace(tmp, DIR / "state.json")


def _day_start(now: float) -> float:
    d = dt.datetime.fromtimestamp(now).replace(hour=0, minute=0, second=0, microsecond=0)
    return d.timestamp()


def _clock(ts: float) -> str:
    return dt.datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M")


def _prune(now: float) -> list[dict]:
    """Keep the last two days of the call ledger; it is read on every call."""
    every = _jsonl("calls.jsonl")
    calls = [c for c in every if c.get("ts", 0) >= now - 2 * 86400]
    if len(calls) != len(every):
        tmp = DIR / "calls.jsonl.tmp"
        tmp.write_text("".join(json.dumps(c, ensure_ascii=False) + "\n" for c in calls), encoding="utf-8")
        os.replace(tmp, DIR / "calls.jsonl")
    return calls


def why_closed(st: dict, calls: list[dict], caller: str, now: float) -> str | None:
    """The reason X is closed for this caller right now, or None."""
    if st.get("frozen"):
        f = st["frozen"]
        return (f"X DONDURULDU ({_clock(f['ts'])}, {f.get('detail', '')[:80]}): X bir uyari/dogrulama sayfasi "
                "gosterdi. Hicbir okuma yapilmaz; bir insan bakmadan acilmaz (xgate.py clear frozen).")
    if st.get("session_dead"):
        return ("X oturumu dusmus (giris duvari). Profil yeniden kopyalanmadan X okunmaz; makine giris yapmaz. "
                "Kopyadan sonra: xgate.py clear session_dead")
    if st.get("closed_until", 0) > now:
        return f"X bugun kapali: 24 saatte ikinci 429. Acilis {_clock(st['closed_until'])}."
    if st.get("pause_until", 0) > now:
        return f"X 429 dedi; {_clock(st['pause_until'])}'e kadar bekleniyor."
    recent = [c for c in calls if c["ts"] > now - WINDOW_S]
    if len(recent) >= WINDOW_MAX:
        free = min(c["ts"] for c in recent) + WINDOW_S
        return f"X butcesi: son 15 dakikada {len(recent)} okuma (en fazla {WINDOW_MAX}). Bos yer {_clock(free)}."
    today = [c for c in calls if c["ts"] >= _day_start(now)]
    if len(today) >= DAY_MAX:
        return f"X butcesi: bugun {len(today)} okuma (en fazla {DAY_MAX}, butun okuyucular)."
    if caller == "room" and sum(c.get("caller") == "room" for c in today) >= ROOM_DAY_MAX:
        return f"X butcesi: oda bugun {ROOM_DAY_MAX} okumasini yapti."
    return None


# ---------------------------------------------------------------- the call
class Call:
    def __init__(self, caller: str, what: str):
        self.caller, self.what, self.outcome = caller, what, None

    def report(self, outcome: str, detail: str = "") -> None:
        """Record what X answered. Called inside the gate, so no other reader sees a stale state."""
        self.outcome = outcome
        if outcome == "ok":
            return
        now = time.time()
        _append("events.jsonl", {"ts": now, "kind": outcome, "caller": self.caller, "what": self.what,
                                 "detail": detail[:300]})
        st = _state()
        if outcome == "frozen":
            st["frozen"] = {"ts": now, "detail": detail[:300], "what": self.what}
        elif outcome == "session_dead":
            st["session_dead"] = {"ts": now, "detail": detail[:300]}
        elif outcome == "429":
            earlier = [e for e in _jsonl("events.jsonl")
                       if e.get("kind") == "429" and now - 86400 <= e["ts"] < now]
            if earlier:
                st["closed_until"] = _day_start(now) + 86400
            else:
                st["pause_until"] = now + PAUSE_429_S
        _save(st)
        print(f"xgate: {outcome} — {why_closed(st, [], self.caller, now) or ''}", file=sys.stderr)

    def report_text(self, text: str) -> str:
        kind = classify(text)
        m = (_FROZEN if kind == "frozen" else _LIMIT if kind == "429" else _DEAD).search(text) if kind != "ok" else None
        self.report(kind, text[max(0, m.start() - 80):m.end() + 120] if m else "")
        return kind


@contextlib.contextmanager
def call(what: str, caller: str | None = None, wait_s: float = LOCK_WAIT_S):
    """Hold the X gate for one call. Raises Refused when X is closed, paused or over budget."""
    caller = caller or os.environ.get("DXB_X_CALLER") or "research"
    DIR.mkdir(parents=True, exist_ok=True)
    fd = os.open(DIR / "reader.lock", os.O_RDWR | os.O_CREAT, 0o600)
    try:
        deadline = time.monotonic() + wait_s
        while True:
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                break
            except BlockingIOError:
                if time.monotonic() >= deadline:
                    raise Refused(f"X kapisinda baska bir okuyucu {wait_s:.0f} sn'dir okuyor")
                time.sleep(0.25)
        now = time.time()
        calls = _prune(now)
        reason = why_closed(_state(), calls, caller, now)
        if reason:
            raise Refused(reason)
        # Apart from the END of the last call: a read that takes 20 s and the next one 3 s after it
        # started would be no spacing at all.
        last = max([c["ts"] for c in calls] + [_last_end()])
        if now < last + SPACING_S:
            time.sleep(last + SPACING_S - now)
        c = Call(caller, what)
        _append("calls.jsonl", {"ts": time.time(), "caller": caller, "what": what[:200]})
        try:
            yield c
        finally:
            (DIR / "last_end").write_text(str(time.time()))
    finally:
        os.close(fd)


def _last_end() -> float:
    try:
        return float((DIR / "last_end").read_text())
    except (OSError, ValueError):
        return 0.0


# ---------------------------------------------------------------- the command line
def status() -> dict:
    now = time.time()
    st, calls = _state(), _jsonl("calls.jsonl")
    today = [c for c in calls if c.get("ts", 0) >= _day_start(now)]
    return {"open": why_closed(st, calls, "research", now) is None,
            "why_closed": why_closed(st, calls, "research", now),
            "last_15_min": sum(c.get("ts", 0) > now - WINDOW_S for c in calls),
            "today": len(today), "today_room": sum(c.get("caller") == "room" for c in today),
            "limits": {"window_15_min": WINDOW_MAX, "day": DAY_MAX, "room_day": ROOM_DAY_MAX,
                       "spacing_s": SPACING_S},
            "last_call": _clock(max(c["ts"] for c in calls)) if calls else None}


def main() -> int:
    ap = argparse.ArgumentParser(prog="xgate.py", description="the machine-wide X gate")
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("status")
    s.add_argument("--json", action="store_true")
    c = sub.add_parser("clear", help="clear a state only a person may clear")
    c.add_argument("what", choices=["frozen", "session_dead"])
    sub.add_parser("classify", help="classify X's answer read from stdin")
    a = ap.parse_args()
    if a.cmd == "status":
        r = status()
        if a.json:
            print(json.dumps(r, ensure_ascii=False))
        else:
            print(("acik" if r["open"] else f"KAPALI — {r['why_closed']}")
                  + f" · son 15 dk {r['last_15_min']}/{WINDOW_MAX} · bugun {r['today']}/{DAY_MAX}"
                  + f" (oda {r['today_room']}/{ROOM_DAY_MAX}) · son okuma {r['last_call'] or '-'}")
        return 0
    if a.cmd == "clear":
        DIR.mkdir(parents=True, exist_ok=True)
        st = _state()
        had = st.pop(a.what, None)
        _save(st)
        _append("events.jsonl", {"ts": time.time(), "kind": f"cleared_{a.what}", "caller": "person"})
        print(f"{a.what}: {'temizlendi' if had else 'zaten yoktu'}")
        return 0
    if a.cmd == "classify":
        print(classify(sys.stdin.read()))
        return 0
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
