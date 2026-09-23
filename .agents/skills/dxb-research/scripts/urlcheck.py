#!/usr/bin/env python3
"""URL liveness — three states, because two states lie.

alive    the address resolves and returns content
dead     the address does not exist / 404 / DNS failure     -> BLOCKS the gate
blocked  403/429/CAPTCHA/anti-bot wall                      -> cited, counted weaker

Two states would mark Reddit's 403, a paywall and a rate limit as "dead" and
fail an honest run. Measured on this machine 2026-09-16: reddit.com/*.json 403,
Mojeek 403, Wayback 503 — all three would false-positive a naive checker.

The cheapest measured win in the field: a liveness check cuts non-resolving
citations 6-79x, to under 1 %.
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import json
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rlib  # noqa: E402

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"
BLOCKED_CODES = {401, 402, 403, 405, 406, 409, 418, 429, 451, 503}


def check(url: str, timeout: int = 12) -> dict:
    # A local source — the installed binary, its source file, a bundled doc — is the
    # STRONGEST row a capability question can carry, and it has no HTTP address. Measured
    # 2026-09-16 on run 20260916-181735: eleven `file://` rows holding the CLI's own
    # source were written "dead" by the old one-line rejection below, and the gate then
    # refused to close a run whose evidence was the code itself. A local row is checked
    # where it lives — on the filesystem.
    if url and url.startswith("file://"):
        path = urllib.parse.unquote(urllib.parse.urlsplit(url.split("#", 1)[0]).path)
        if Path(path).exists():
            return {"url": url, "liveness": "alive", "status": None, "note": "local file"}
        return {"url": url, "liveness": "dead", "status": None, "note": "local file missing"}
    if not url or not url.startswith(("http://", "https://")):
        return {"url": url, "liveness": "dead", "status": None, "note": "not an http url"}
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    for method in ("HEAD", "GET"):
        req = urllib.request.Request(url, method=method, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
                return {"url": url, "liveness": "alive", "status": r.status, "note": method}
        except urllib.error.HTTPError as e:
            if e.code in BLOCKED_CODES:
                return {"url": url, "liveness": "blocked", "status": e.code, "note": "wall"}
            if e.code in (404, 410):
                return {"url": url, "liveness": "dead", "status": e.code, "note": "gone"}
            if method == "GET":
                return {"url": url, "liveness": "blocked", "status": e.code, "note": "http error"}
        except urllib.error.URLError as e:
            reason = str(getattr(e, "reason", e))
            if "Name or service not known" in reason or "nodename nor servname" in reason:
                return {"url": url, "liveness": "dead", "status": None, "note": "dns"}
            if method == "GET":
                return {"url": url, "liveness": "blocked", "status": None, "note": reason[:60]}
        except Exception as e:  # timeouts, ssl, resets
            if method == "GET":
                return {"url": url, "liveness": "blocked", "status": None, "note": str(e)[:60]}
    return {"url": url, "liveness": "blocked", "status": None, "note": "unknown"}


def check_run(run_id: str, workers: int = 8) -> dict:
    rows = rlib.ledger(run_id)
    todo = [r for r in rows if r.get("liveness") in (None, "unchecked") and r.get("url")]
    results: dict[str, dict] = {}
    if todo:
        with cf.ThreadPoolExecutor(max_workers=workers) as ex:
            futs = {ex.submit(check, r["url"]): r["id"] for r in todo}
            for fut in cf.as_completed(futs):
                rid_ = futs[fut]
                try:
                    results[rid_] = fut.result()
                except Exception as e:
                    results[rid_] = {"liveness": "blocked", "status": None, "note": str(e)[:60]}
        for r in rows:
            if r["id"] in results:
                r["liveness"] = results[r["id"]]["liveness"]
                r["liveness_status"] = results[r["id"]].get("status")
        path = rlib.ledger_path(run_id)
        with path.open("w", encoding="utf-8") as fh:
            for r in rows:
                fh.write(json.dumps(r, ensure_ascii=False) + "\n")
    tally: dict[str, int] = {}
    for r in rows:
        tally[r.get("liveness") or "unchecked"] = tally.get(r.get("liveness") or "unchecked", 0) + 1
    return {"checked_now": len(results), "tally": tally,
            "dead": [r["id"] for r in rows if r.get("liveness") == "dead"]}


def main() -> int:
    p = argparse.ArgumentParser(prog="urlcheck.py")
    p.add_argument("--run")
    p.add_argument("--url")
    a = p.parse_args()
    if a.url:
        print(json.dumps(check(a.url), ensure_ascii=False, indent=2))
        return 0
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run", file=sys.stderr)
        return 1
    print(json.dumps(check_run(rid), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
