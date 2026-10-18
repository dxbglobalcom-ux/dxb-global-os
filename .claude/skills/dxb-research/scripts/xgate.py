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
# One opencli command may page on and on (search, tweets, collection, thread loop pages; the adapters
# allow up to 100 pages); past this many X responses in one command the shim stops it (bin/opencli,
# exit 75). Every command first loads x.com/home, and that page's own requests dominate — measured
# 2026-10-18 through the gate on his account: `twitter search "claude code" --limit 5` 64 X responses
# (46 to /i/api/) in 4.4 s, the same with `--limit 50` 64 (47 /i/api/) for 49 rows, `twitter tweets
# AnthropicAI --limit 20` 38 (27 /i/api/), all 200. At 10 a real search was stopped at 16 within one
# second. 200 is about three normal commands: only a runaway pagination reaches it. The budget's unit
# stays the command, because a command's load is the fixed home-page load, not the rows it asks for.
RUNAWAY_MAX = 200

X_HOSTS = {"x.com", "twitter.com", "t.co"}
X_SITES = {"twitter"}           # opencli's site name for X

# What X answers, as opencli and the page show it (opencli clis/twitter/shared.js
# describeTwitterApiError, dist/src/errors.js AuthRequiredError / LoginWallError).
_FROZEN = re.compile(r"captcha|arkose|/account/access|unusual (login )?activity|verify (it'?s|that it'?s) you"
                     r"|your account (has been|is) (temporarily )?locked", re.I)
# A wall is read BEFORE the 429 patterns: opencli's LOGIN_WALL help says "likely a login wall, rate limit,
# or WAF challenge", so read after them it was a 429 — a 30-minute pause, then the same wall again. And an
# HTML page where search.js expected JSON fails as V8's parse error, which said nothing to the gate at all.
_WALL = re.compile(r"\bLOGIN_WALL\b|\bAUTH_REQUIRED\b|Unexpected token '?<"
                   r"|\"\s*<[^\"]*\"(\.\.\.)? is not valid JSON", re.I)
_LIMIT = re.compile(r"HTTP 429|session quota|too many requests|rate.?limit", re.I)
_DEAD = re.compile(r"AUTH_REQUIRED|not logged in(to)? (to )?x\.com|auth cookies are missing|HTTP 401"
                   r"|re-login required|/i/flow/login", re.I)
_SEVERITY = {"ok": 0, "429": 1, "session_dead": 2, "frozen": 3}


class Refused(Exception):
    """The gate said no; the message says why and until when."""


def is_x_url(url: str) -> bool:
    host = (urllib.parse.urlsplit(url).hostname or "").lower()
    return any(host == h or host.endswith("." + h) for h in X_HOSTS)


def classify(text: str) -> str:
    """'frozen' | '429' | 'session_dead' | 'ok' — the worst thing the answer shows. Only a FAILED
    answer is classified: a successful one carries other people's posts, and a post that says
    "rate limit" is not X saying it."""
    return text_verdict(text)[0]


def text_verdict(text: str) -> tuple[str, str]:
    """classify(), with the words around what decided it (the detail a person reads in the state)."""
    for kind, pat in (("frozen", _FROZEN), ("session_dead", _WALL), ("429", _LIMIT), ("session_dead", _DEAD)):
        m = pat.search(text)
        if m:
            return kind, text[max(0, m.start() - 80):m.end() + 120]
    return "ok", ""


def judge_url(href: str, password: bool = False) -> str:
    """What an X address says: 'frozen' (the access/verify page), 'session_dead' (a login wall) or
    'ok'. The address, never the body: the body is other people's posts. A t.co link that left X for
    another site says nothing about his session."""
    parts = urllib.parse.urlsplit(href or "")
    host = (parts.hostname or "").lower()
    if not is_x_url(href or "") or host == "t.co" or host.endswith(".t.co"):
        return "ok"
    path = parts.path
    if path.startswith("/account/access") or "captcha" in path:
        return "frozen"
    if path.startswith(("/i/flow/login", "/login", "/i/flow/signup")) or password:
        return "session_dead"
    return "ok"


def judge_responses(responses) -> tuple[str, int, str]:
    """(verdict, X requests, the address that decided it) for the (url, status) pairs a window's
    Network.responseReceived showed. Only X hosts count. WHY THE RESPONSES: opencli fetches inside the
    page and swallows an error on a later page (clis/twitter/search.js: a 429 on page 2 exits 0 with the
    rows it had), and a 429 on a document leaves the address unchanged — neither is in any text."""
    verdict, n, where = "ok", 0, ""
    for url, status in responses:
        if not is_x_url(url):
            continue
        n += 1
        kind = judge_url(url)
        if kind == "ok" and status == 429:
            kind = "429"
        if _SEVERITY[kind] > _SEVERITY[verdict]:
            verdict, where = kind, f"HTTP {status} {url}"
    return verdict, n, where


def worst(found) -> tuple[str, str]:
    """The worst (verdict, detail) pair: frozen > session_dead > 429 > ok."""
    return max(found, key=lambda f: _SEVERITY[f[0]], default=("ok", ""))


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


def _next_midnight(now: float) -> float:
    # The next LOCAL calendar midnight, not today's start + 86400: on the day the clocks go back
    # (2026-10-25 in Berlin) the day has 25 hours, and +86400 opened X again at 23:00 the same day.
    tomorrow = dt.datetime.fromtimestamp(now).date() + dt.timedelta(days=1)
    return dt.datetime.combine(tomorrow, dt.time()).timestamp()


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
        self.ts = None          # the ledger row's ts, so the row can be found again at the end
        self.requests = None    # X requests the caller saw; written into the call's row when set

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
                st["closed_until"] = _next_midnight(now)
            else:
                st["pause_until"] = now + PAUSE_429_S
        _save(st)
        print(f"xgate: {outcome} — {why_closed(st, [], self.caller, now) or ''}", file=sys.stderr)

    def report_text(self, text: str) -> str:
        kind, detail = text_verdict(text)
        self.report(kind, detail)
        return kind


@contextlib.contextmanager
def _locked(wait_s: float):
    """The one exclusive X reader lock."""
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
        yield
    finally:
        os.close(fd)


def _note_requests(ts: float, requests: int) -> None:
    # The row is written when the call STARTS, so a reader killed mid-call is still counted; the
    # requests it made are known only at the end. Rewritten under the lock, so no reader sees it half.
    rows = _jsonl("calls.jsonl")
    for r in reversed(rows):
        if r.get("ts") == ts:
            r["requests"] = requests
            break
    tmp = DIR / "calls.jsonl.tmp"
    tmp.write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in rows), encoding="utf-8")
    os.replace(tmp, DIR / "calls.jsonl")


def _drop_call(ts: float) -> None:
    # Under the lock, like _note_requests: the row of a call refused before it reached X.
    rows = [r for r in _jsonl("calls.jsonl") if r.get("ts") != ts]
    tmp = DIR / "calls.jsonl.tmp"
    tmp.write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in rows), encoding="utf-8")
    os.replace(tmp, DIR / "calls.jsonl")


@contextlib.contextmanager
def call(what: str, caller: str | None = None, wait_s: float = LOCK_WAIT_S):
    """Hold the X gate for one call. Raises Refused when X is closed, paused or over budget."""
    caller = caller or os.environ.get("DXB_X_CALLER") or "research"
    with _locked(wait_s):
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
        c.ts = time.time()
        _append("calls.jsonl", {"ts": c.ts, "caller": caller, "what": what[:200]})
        try:
            yield c
        except Refused:
            # Refused inside the gate (the shim's watch could not attach): nothing reached X, so the
            # call costs nothing. Any other failure keeps its row — that call may have reached X.
            _drop_call(c.ts)
            raise
        finally:
            if c.requests is not None:
                _note_requests(c.ts, c.requests)
            (DIR / "last_end").write_text(str(time.time()))


def record(what: str, verdict: str, requests: int, caller: str | None = None, detail: str = "",
           wait_s: float = LOCK_WAIT_S) -> str:
    """A read that was NOT gated (its address was not X) reached X anyway — a redirect, seen after the
    fact in its responses. It is counted and its answer recorded like a gated call. When X is closed,
    paused or over budget it raises Refused, and the caller throws the content away: what X gave a
    reader it should not have had is not passed on."""
    caller = caller or os.environ.get("DXB_X_CALLER") or "research"
    with _locked(wait_s):
        now = time.time()
        reason = why_closed(_state(), _prune(now), caller, now)
        if reason:
            raise Refused(reason)
        _append("calls.jsonl", {"ts": now, "caller": caller, "what": what[:200], "requests": requests})
        Call(caller, what).report(verdict, detail)
        (DIR / "last_end").write_text(str(time.time()))
    return verdict


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
