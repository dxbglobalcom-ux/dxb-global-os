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
    return time.strftime("%Y%m%d-%H%M%S", time.gmtime())


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", "replace")).hexdigest()


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
    try:
        rid = CURRENT.read_text().strip()
    except FileNotFoundError:
        return None
    if not rid:
        return None
    st = read_state(rid)
    if st.get("status") != "open":
        return None
    return rid


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
_WALL = re.compile(
    r"(sorry, you have been blocked|attention required!\s*\|\s*cloudflare|enable cookies|"
    r"checking your browser|just a moment\.\.\.|please verify you are a human|"
    r"javascript is disabled in your browser|please enable javascript|"
    r"you need to enable javascript|log ?in to access|sign in to continue|"
    r"subscribe to (read|continue)|create an account to continue|403 forbidden|"
    r"access denied|rate limit)", re.I)

_NAVISH = re.compile(r"\[[^\]]{0,80}\]\([^)]{0,200}\)")


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
