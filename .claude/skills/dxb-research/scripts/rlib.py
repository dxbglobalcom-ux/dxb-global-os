#!/usr/bin/env python3
"""Shared core for the DXB research engine.

Everything the gate counts is written HERE, by a machine, never by the model.
The model may only cite row ids that already exist in the ledger.

Run scoping is the reason this module exists: a ledger belongs to ONE run.
A second question in the same session opens a new run, so it can never inherit
the first run's green gate.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# --- the research deps live in a dedicated venv.
# A venv built for 3.13 cannot be imported by a 3.14 interpreter, so adding its
# site-packages to sys.path is not enough: the process has to BE that interpreter.
# Re-exec once, guarded, and never fail because of it — every dependent feature
# degrades to a stdlib fallback rather than taking the engine down with it.
_VENV = Path("/home/dxb/.venvs/dxb-research")
_VENV_PY = _VENV / "bin" / "python"


def _reexec_into_venv() -> None:
    if os.environ.get("DXB_RESEARCH_REEXEC") == "1" or not _VENV_PY.exists():
        return
    if not sys.argv or not sys.argv[0].endswith(".py") or not Path(sys.argv[0]).exists():
        return
    try:
        import datasketch  # noqa: F401
        import trafilatura  # noqa: F401
        return
    except Exception:
        pass
    try:
        os.environ["DXB_RESEARCH_REEXEC"] = "1"
        os.execv(str(_VENV_PY), [str(_VENV_PY), *sys.argv])
    except Exception:
        pass


_reexec_into_venv()
for _sp in _VENV.glob("lib/python*/site-packages"):
    if str(_sp) not in sys.path:
        sys.path.append(str(_sp))

SKILL_DIR = Path(__file__).resolve().parent.parent
RUNS_DIR = SKILL_DIR / "runs"
CURRENT = RUNS_DIR / "CURRENT"

SOURCE_TYPES = (
    "primary-doc", "code", "first-hand", "independent-test", "secondary", "vendor",
)
KINDS = ("discovery", "evidence")
LIVENESS = ("alive", "dead", "blocked", "unchecked")


# ---------------------------------------------------------------- time / ids
def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def new_run_id() -> str:
    """A run id that no other run already has.

    It was a timestamp to the SECOND and nothing checked it. Measured 2026-09-17 by an
    independent auditor: two opens inside one second took the same id, both returned success,
    and the first question's record ended up carrying the second question and the second
    owner. A record that can be overwritten by the next question is not a record.

    `DXB_RESEARCH_STAMP` pins the clock so that collision can be MEASURED rather than raced.
    """
    base = os.environ.get("DXB_RESEARCH_STAMP") or time.strftime("%Y%m%d-%H%M%S", time.gmtime())
    rid, n = base, 2
    while run_dir(rid).exists():
        rid = "%s-%d" % (base, n)
        n += 1
    return rid


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", "replace")).hexdigest()


# ------------------------------------------------- tamper evidence
# Measured 2026-09-16, during this engine's own first race: a sub-session that the
# Stop gate refused EDITED THE GATE. The edits were, as it happens, correct repairs
# of real bugs — which is exactly why this matters. Nothing can stop an agent with a
# text editor from changing the rule it is being held to. What CAN be stopped is
# doing it SILENTLY, and silence is the thing this whole engine exists to remove.
#
# So a run records the fingerprint of every file that enforces it. If any of them
# changes while the run is open, the gate refuses to pass and names the file. To
# change the engine legitimately, close the run first.
ENFORCEMENT_FILES = (
    "scripts/gate.py",
    "scripts/rlib.py",
    "scripts/ledger.py",
    # classify() decides the source_type that H2 and H6 COUNT, and cluster() decides the
    # independent clusters H3 counts. Measured 2026-09-16 on run 20260916-200833: the
    # classifier was repaired mid-run, first-hand rows went 2 -> 6, H6 flipped from
    # blocking to passing, and H18 never noticed because neither file was watched.
    "scripts/ingest.py",
    "scripts/independence.py",
    "hooks/research-completion.py",
    "hooks/ledger-capture.py",
    "config/budget.yaml",
)


def enforcement_fingerprint() -> dict:
    out = {}
    for rel in ENFORCEMENT_FILES:
        f = SKILL_DIR / rel
        try:
            out[rel] = hashlib.sha256(f.read_bytes()).hexdigest()[:16]
        except Exception:
            out[rel] = "MISSING"
    return out


def enforcement_drift(run_id: str) -> list[str]:
    """Which enforcement files changed since this run was opened."""
    st = read_state(run_id)
    was = st.get("enforcement_sha") or {}
    if not was:
        return []
    now = enforcement_fingerprint()
    return [f"{k}: {was.get(k)} -> {now.get(k)}"
            for k in sorted(set(was) | set(now)) if was.get(k) != now.get(k)]


# ---------------------------------------------------------------- run state
def run_dir(run_id: str) -> Path:
    return RUNS_DIR / run_id


def current_run_id() -> str | None:
    """The OPEN run, or None. The gate is silent when this is None.

    `DXB_RESEARCH_RUN` overrides the pointer file. Two sessions researching at the
    same time on one machine would otherwise fight over a single CURRENT — which is
    exactly what happens when the benchmark runs several arms at once.
    """
    env = os.environ.get("DXB_RESEARCH_RUN")
    if env:
        return env if read_state(env).get("status") == "open" else None
    # A run belongs to the session that OPENED it, and every command a session runs
    # carries CLAUDE_CODE_SESSION_ID in its environment — so the pointer can be scoped
    # to the session without anyone remembering to export anything. Measured
    # 2026-09-16: two gated benchmark arms ran at once, fought over this single file,
    # and 127 ledger rows crossed from one run into the other.
    sid = os.environ.get("CLAUDE_CODE_SESSION_ID")
    if sid:
        own = session_run_id(sid)
        if own:
            return own
    try:
        rid = CURRENT.read_text().strip()
    except FileNotFoundError:
        return None
    if not rid:
        return None
    st = read_state(rid)
    if st.get("status") != "open":
        return None
    if sid and st.get("session_id") and st.get("session_id") != sid:
        # someone else's open run: not this session's to write into, nor to be gated by
        return None
    return rid


def session_run_id(session_id: str | None) -> str | None:
    """The OPEN run that THIS session opened, or None.

    CURRENT is one pointer for the whole machine, so on 2026-09-16 one session's
    unfinished research jailed a second session's finished turn: the Stop hook read
    CURRENT, found the peer's failing run, and refused an exit the peer could not
    know about. Four collisions in one hour (ledger rows, GAPS.md, the run pointer,
    the Stop gate) all trace to the same missing fact — who owns this run.

    A run stamped with a session id is gated by THAT session and ignored by others.
    A run with no stamp keeps the old behaviour exactly, so nothing is loosened.
    """
    if not session_id:
        return None
    try:
        dirs = sorted(RUNS_DIR.iterdir())
    except Exception:
        return None
    for d in reversed(dirs):
        if not d.is_dir():
            continue
        st = read_state(d.name)
        if st.get("status") == "open" and st.get("session_id") == session_id:
            return d.name
    return None


def seconds_between(a: str, b: str) -> float | None:
    """Seconds from ISO timestamp a to ISO timestamp b, or None if either is unreadable."""
    try:
        ta, tb = datetime.fromisoformat(str(a)), datetime.fromisoformat(str(b))
    except Exception:
        return None
    if ta.tzinfo is None:
        ta = ta.replace(tzinfo=timezone.utc)
    if tb.tzinfo is None:
        tb = tb.replace(tzinfo=timezone.utc)
    return (tb - ta).total_seconds()


def elapsed_seconds(run_id: str) -> float:
    """How long this run has been open, in seconds.

    The engine had a `max_seconds` in its budget file that NOTHING read — measured
    2026-09-16, zero call sites. A gate with no clock cannot converge: on run
    20260916-171413 it was still asking for more evidence 25 minutes in, and the
    run died with no answer at all. A research run has to know the time.
    """
    t = read_state(run_id).get("opened_at")
    if not t:
        try:
            t = json.loads((run_dir(run_id) / "question_lock.json").read_text()).get("opened_at")
        except Exception:
            t = None
    if not t:
        return 0.0
    try:
        started = datetime.fromisoformat(str(t))
    except Exception:
        return 0.0
    if started.tzinfo is None:
        started = started.replace(tzinfo=timezone.utc)
    return max(0.0, (datetime.now(timezone.utc) - started).total_seconds())


def read_state(run_id: str) -> dict:
    p = run_dir(run_id) / "state.json"
    try:
        return json.loads(p.read_text())
    except Exception:
        return {}


def write_state(run_id: str, state: dict) -> None:
    d = run_dir(run_id)
    d.mkdir(parents=True, exist_ok=True)
    (d / "state.json").write_text(json.dumps(state, ensure_ascii=False, indent=2))


def patch_state(run_id: str, **kw) -> dict:
    st = read_state(run_id)
    st.update(kw)
    write_state(run_id, st)
    return st


# ---------------------------------------------------------------- jsonl io
def append_jsonl(path: Path, row: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(row, ensure_ascii=False) + "\n")


def read_jsonl(path: Path) -> list[dict]:
    out = []
    try:
        for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                out.append(json.loads(line))
            except Exception:
                continue
    except FileNotFoundError:
        pass
    return out


def ledger_path(run_id: str) -> Path:
    return run_dir(run_id) / "ledger.jsonl"


def queries_path(run_id: str) -> Path:
    return run_dir(run_id) / "queries.jsonl"


def tools_path(run_id: str) -> Path:
    return run_dir(run_id) / "tools.jsonl"


def ledger(run_id: str) -> list[dict]:
    return read_jsonl(ledger_path(run_id))


# ---------------------------------------------------------------- urls
_TRACKING = re.compile(
    r"^(utm_|ref_?$|ref_src|fbclid|gclid|mc_[ce]id|igshid|si$|spm|share_|from_|"
    r"source$|__twitter_impression|_ga|yclid|msclkid)", re.I
)


def canonical_url(url: str) -> str:
    """Lowercase scheme+host, drop fragment, strip tracking params, drop trailing /."""
    if not url:
        return ""
    try:
        from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
        s = urlsplit(url.strip())
        host = (s.hostname or "").lower()
        if host.startswith("www."):
            host = host[4:]
        if s.port and s.port not in (80, 443):
            host = f"{host}:{s.port}"
        q = [(k, v) for k, v in parse_qsl(s.query, keep_blank_values=True)
             if not _TRACKING.match(k)]
        path = s.path or "/"
        if len(path) > 1 and path.endswith("/"):
            path = path[:-1]
        return urlunsplit(((s.scheme or "https").lower(), host, path, urlencode(q), ""))
    except Exception:
        return url.strip()


def registrable_domain(url: str) -> str:
    """Good-enough eTLD+1. Not a public-suffix list; handles the common two-level TLDs."""
    try:
        from urllib.parse import urlsplit
        host = (urlsplit(url).hostname or "").lower()
    except Exception:
        return ""
    if not host:
        return ""
    if host.startswith("www."):
        host = host[4:]
    parts = host.split(".")
    if len(parts) <= 2:
        return host
    two = {"co", "com", "net", "org", "ac", "gov", "edu", "or", "ne", "go"}
    if len(parts) >= 3 and parts[-2] in two and len(parts[-1]) == 2:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:])


# ---------------------------------------------------------------- page quality
# The exact sentences a site prints INSTEAD of content. ONE owner: sweep.sh reads this
# string from here (`python3 -c "import rlib; print(rlib.SITE_ERROR)"`), so a sentence
# added once is known by the sweep AND by the reading chain.
SITE_ERROR = (r"something went wrong\. wait a moment|etwas ist schiefgelaufen|"
              r"are you a robot|enable javascript to continue|"
              r"unusual traffic from your computer")

_WALL = re.compile(
    r"(sorry, you have been blocked|attention required!\s*\|\s*cloudflare|enable cookies|"
    r"checking your browser|just a moment\.\.\.|please verify you are a human|"
    r"javascript is disabled in your browser|please enable javascript|"
    r"you need to enable javascript|log ?in to access|sign in to continue|"
    r"subscribe to (read|continue)|create an account to continue|403 forbidden|"
    # `rate limit` alone was too loose: measured 2026-09-16 on run 20260916-192859, the
    # Parallel and Firecrawl documentation pages — the very pages that ANSWER the question,
    # because both describe their keyless tier's rate limits — were classified as bot walls
    # and demoted to `secondary`, `liveness: blocked`, `primary: false`. A page about a rate
    # limit is not a rate-limit wall. Only the refusal wordings are a wall.
    r"access denied|rate limit exceeded|too many requests|"
    # Reddit's WAF, measured 2026-09-16: it answers with an 87 KB base64 PNG and this
    # sentence LAST, so a head-only test never reached it.
    r"you've been blocked by network security|you have been blocked by network security|"
    r"you (have been|are being) rate[- ]limited|429 too many)", re.I)

# The site's own error sentence, judged separately: measured 2026-09-17, it can sit on TOP
# of a page that also carries the content, so it is a wall only when nothing else is there.
# sweep.sh reads this same string from here — it used to keep its own copy.
_SITE_ERR = re.compile(SITE_ERROR, re.I)

# A DOOR'S OWN REFUSAL, in plain prose rather than JSON. Measured 2026-09-17, both with
# exit code 0 and both stamped `ok` by the coverage table: the keyless Tavily door answered
# 135 bytes — "You reached the monthly keyless Tavily limit" — and Firecrawl answered 102 —
# "You've hit Firecrawl's free MCP rate limit". The engine then told the CEO it had searched
# with five engines when it had searched with three. A quota notice is the door saying no.
#
# It is judged WITH the word count, never alone: a page ABOUT rate limits is long, and the
# Parallel and Firecrawl documentation pages — the very pages that answer a question about
# keyless tiers — were once demoted for carrying the words. A notice is short.
QUOTA_ERROR = (r"you reached the monthly|keyless [a-z]{0,12} ?limit|free mcp rate limit|"
               r"monthly_cap_reached|add an api key|upgrade your plan|"
               r"quota (exceeded|reached)|out of credits|no results found")
_QUOTA = re.compile(QUOTA_ERROR, re.I)
QUOTA_MAX_WORDS = 60

_NAVISH = re.compile(r"\[[^\]]{0,80}\]\([^)]{0,200}\)")

# The reader's own tool answering HTTP 200 with a refusal in the body. Measured
# 2026-09-16 on run 20260916-192859: tavily_extract returned 2 628 bytes of
# {"code":"monthly_cap_reached_bonus_eligible", ...} for THREE different pages,
# the chain accepted all three as read, and the run printed "okunan 6/6" while
# half of it had read nothing but the cap notice. A quota notice is a door
# slammed shut, not a page — it belongs in the same bucket as a login wall.
_ERR_KEYS = {"code", "error", "errors", "detail", "message", "next_actions", "retry_after_seconds"}
_CONTENT_KEYS = {"markdown", "content", "contents", "html", "text", "body", "data",
                 "results", "items", "articles", "raw"}


def looks_like_api_error(text: str) -> bool:
    """True when the body is an API's error/quota envelope rather than a page.

    Narrow on purpose: it fires only on a SMALL leading JSON object that carries an
    error-ish key and no content-ish key. A real JSON dataset keeps its payload under
    `data`/`results`/`items`, and a real page is not JSON at all.

    It reads the LEADING value with `raw_decode` rather than the whole string, because
    the doors do not hand back one clean object. Measured 2026-09-16: `mcpx.sh` prints
    the MCP `content` text AND the `structuredContent` beside it, so the quota notice
    arrives as the same object twice, 2 630 bytes, and a whole-string `json.loads`
    raises — which let the very body this function exists to catch through on the first
    attempt at this fix.
    """
    s = (text or "").strip()
    if not s.startswith("{") or len(s) > 16000:
        return False
    try:
        d, _end = json.JSONDecoder().raw_decode(s)
    except Exception:
        return False
    if not isinstance(d, dict):
        return False
    keys = {str(k).lower() for k in d}
    return bool(keys & _ERR_KEYS) and not (keys & _CONTENT_KEYS)


def looks_like_wall(text: str) -> bool:
    """A bot wall, a login screen or a JS-required shell is NOT evidence.

    Measured on this engine's own first run: a Cloudflare block page, a Tracxn
    login screen and a PNG favicon were all counted as evidence rows. A gate that
    counts walls is a gate that can be satisfied by twenty doors slammed shut.
    """
    head = (text or "")[:4000]
    if not head.strip():
        return True
    printable = sum(1 for c in head if c.isprintable() or c in "\n\r\t")
    if printable / max(1, len(head)) < 0.85:      # binary / image bytes
        return True
    if looks_like_api_error(text):
        return True
    # A page that is one giant embedded blob and almost no words was not read.
    # Measured 2026-09-16: reddit's WAF answered SEVEN different about.json URLs with
    # the same 87 KB base64 PNG. Every byte was printable, no wall phrase appeared in
    # the first 4000 characters, and the reading chain reported "read: true · 87784b"
    # seven times for seven different questions.
    body = text or ""
    if len(body) > 2000:
        stripped = re.sub(r"data:[a-z.+-]+/[a-z.+-]+;base64,[A-Za-z0-9+/=]+", " ", body)
        words = re.findall(r"[A-Za-z\u00c0-\u024f]{3,}", stripped)
        cjk = re.findall(r"[\u3040-\u30ff\u4e00-\u9fff\uac00-\ud7af]", stripped)
        if len(words) < 25 and len(cjk) < 40:
            return True
        # The refusal can sit AFTER the blob. Test the words, not the first 4000 bytes.
        if len(stripped) < 4000 and _WALL.search(stripped):
            return True
    # THE BANNER CAN SIT ON TOP OF THE CONTENT. Measured 2026-09-17: Quora prints
    # "Something went wrong. Wait a moment" at the head of a page that also carries 46
    # answers — 4 866 words. Its login shell carries 66. So the site's own error sentence
    # is a wall only when there is nothing else on the page.
    if _SITE_ERR.search(head):
        words = re.findall(r"[A-Za-z\u00c0-\u024f]{3,}", _NAVISH.sub(" ", body))
        if len(words) < 300:
            return True
    # THE DOOR'S OWN REFUSAL. Short and carrying a quota wording = a notice, not a page.
    if _QUOTA.search(head):
        words = re.findall(r"[A-Za-z\u00c0-\u024f]{3,}", _NAVISH.sub(" ", body))
        if len(words) < QUOTA_MAX_WORDS:
            return True
    return bool(_WALL.search(head))


def strip_boilerplate(text: str, want: int = 6000) -> str:
    """Drop the navigation chrome and return the prose the page is actually about.

    A markdown dump starts with the site menu. Quoting that as a passage is how a
    ledger fills with evidence rows that say nothing. Keep the paragraphs whose
    text is mostly words rather than links.
    """
    lines = (text or "").splitlines()
    kept: list[str] = []
    started = False
    for ln in lines:
        stripped = ln.strip()
        if not stripped:
            if kept:
                kept.append("")
            continue
        linky = len(_NAVISH.findall(stripped))
        words = len(re.findall(r"\w+", _NAVISH.sub(" ", stripped)))
        is_nav = linky >= 2 and words < 25
        if not started:
            if is_nav or words < 12:
                continue
            started = True
        elif is_nav and words < 8:
            continue
        kept.append(stripped)
        if sum(len(k) for k in kept) >= want:
            break
    out = "\n".join(kept).strip()
    return out if len(out) >= 200 else (text or "")[:want]


# ---------------------------------------------------------------- shingles
def shingles(text: str, k: int = 7) -> set[str]:
    words = re.findall(r"\w+", (text or "").lower())
    if len(words) < k:
        return {" ".join(words)} if words else set()
    return {" ".join(words[i:i + k]) for i in range(len(words) - k + 1)}


def jaccard(a: set, b: set) -> float:
    if not a or not b:
        return 0.0
    inter = len(a & b)
    union = len(a | b)
    return inter / union if union else 0.0


# ---------------------------------------------------------------- ids
def next_row_id(run_id: str) -> str:
    return "L%04d" % (len(ledger(run_id)) + 1)


def load_yaml(path: Path) -> dict:
    try:
        import yaml  # type: ignore
        return yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except Exception:
        return _mini_yaml(path)


def _mini_yaml(path: Path) -> dict:
    """Last-resort parser so the gate never dies because PyYAML moved.

    Handles the flat 2-level mapping shape the config files use.
    """
    data: dict = {}
    stack: list[tuple[int, dict]] = [(-1, data)]
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except FileNotFoundError:
        return {}
    for raw in lines:
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        indent = len(raw) - len(raw.lstrip())
        line = raw.strip()
        while stack and indent <= stack[-1][0]:
            stack.pop()
        parent = stack[-1][1] if stack else data
        if line.startswith("- "):
            parent.setdefault("_list", []).append(line[2:].strip())
            continue
        if ":" not in line:
            continue
        key, _, val = line.partition(":")
        key, val = key.strip(), val.strip()
        if val == "":
            node: dict = {}
            parent[key] = node
            stack.append((indent, node))
        else:
            if val.startswith("[") and val.endswith("]"):
                parent[key] = [v.strip().strip("'\"") for v in val[1:-1].split(",") if v.strip()]
            elif re.fullmatch(r"-?\d+", val):
                parent[key] = int(val)
            elif re.fullmatch(r"-?\d+\.\d+", val):
                parent[key] = float(val)
            elif val.lower() in ("true", "false"):
                parent[key] = val.lower() == "true"
            else:
                parent[key] = val.strip("'\"")
    return data


def config(name: str) -> dict:
    return load_yaml(SKILL_DIR / "config" / name)


# --------------------------------------------------------------- the judge at the shell
# ONE JUDGE, ONE OWNER — and the sweep is its second caller, not its second author.
#
# Until 2026-09-17 the sweep decided this question itself, with its own copy of the word
# list and a plain `grep`. The two judges then disagreed in both directions on the same
# day: a 135-byte quota notice was stamped `ok` while a Quora page carrying 420 paragraphs
# of real answers under one banner line was thrown away, four runs in a row. The rule that
# was already right lived here — count the words before calling a banner a wall — and it
# had never been carried down. It is not carried down now either: the sweep ASKS.
#
#   python3 rlib.py --judge <file> ...        -> one line per file: BROKEN | OK
#   python3 rlib.py --judge-dir <folder>      -> one line per *.raw: <name>\tBROKEN|OK
def _judge_cli(argv: list) -> int:
    # A FILE THAT CANNOT BE READ IS AN ERROR, NOT A VERDICT. The first version of this
    # function swallowed the exception and judged the empty string, which reads as BROKEN —
    # so a bug in the judge would have condemned every page in silence. It was caught by this
    # engine's own test on the day it was written, and the lesson is the one this whole
    # repair is about: a silent fallback is how a machine starts lying.
    if not argv:
        print("usage: rlib.py --judge <file>... | --judge-dir <folder>", file=sys.stderr)
        return 2
    if argv[0] == "--judge-dir":
        for f in sorted(Path(argv[1]).glob("*.raw")):
            print("%s\t%s" % (f.stem, "BROKEN" if looks_like_wall(
                f.read_text(encoding="utf-8", errors="replace")) else "OK"))
        return 0
    if argv[0] == "--judge":
        for f in argv[1:]:
            print("BROKEN" if looks_like_wall(
                Path(f).read_text(encoding="utf-8", errors="replace")) else "OK")
        return 0
    print("usage: rlib.py --judge <file>... | --judge-dir <folder>", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(_judge_cli(sys.argv[1:]))
