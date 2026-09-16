#!/usr/bin/env python3
"""Grounding — does the cited passage actually ENTAIL the claim?

Across fourteen frontier models, cited links worked more than 94 % of the time and
were topically relevant more than 80 % of the time, while **factual support ran
39-77 %**. So liveness and relevance are nearly free and prove almost nothing. The
only discriminating check is entailment: does the page the claim points at actually
say the thing.

This runs LOCALLY, on hardware the holding already owns — `bespoke-minicheck` on the
RTX 5060 Ti, at $0 and roughly a tenth of a second per claim once warm.

**It is ADVISORY and it never blocks.** A machine that scored judgment would
manufacture exactly the false assurance the gate exists to prevent, and this model
is one small checker with no licence a holding company could ship on. Its verdict is
printed beside the DECLARED list as a second opinion, and where it disagrees with the
author, the disagreement itself is the finding — a claim two checkers split on is
worth more attention than either verdict alone.

  verify.py                 # every load-bearing claim in the open run
  verify.py --all           # every claim
  verify.py --model X
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rlib  # noqa: E402

OLLAMA = "http://127.0.0.1:11434/api/generate"
MODEL = "bespoke-minicheck"
MAX_DOC = 3500


def ask(doc: str, claim: str, model: str, timeout: int = 90) -> tuple[str | None, str]:
    prompt = (f"Document: {doc[:MAX_DOC]}\n\nClaim: {claim}\n\n"
              f"Answer Yes if the document supports the claim, No if it does not. "
              f"Answer with one word only.")
    body = json.dumps({"model": model, "prompt": prompt, "stream": False,
                       "options": {"temperature": 0, "num_predict": 4}}).encode()
    req = urllib.request.Request(OLLAMA, data=body,
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            out = json.loads(r.read()).get("response", "").strip()
    except urllib.error.URLError as e:
        return None, f"ollama unreachable: {e}"
    except Exception as e:
        return None, str(e)[:120]
    low = out.lower()
    if low.startswith("yes"):
        return "SUPPORTED", out
    if low.startswith("no"):
        return "NOT-SUPPORTED", out
    return None, f"unparsable: {out[:40]}"


def main() -> int:
    ap = argparse.ArgumentParser(prog="verify.py")
    ap.add_argument("--run")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open research run", file=sys.stderr)
        return 1
    claims_p = rlib.run_dir(rid) / "claims.json"
    if not claims_p.exists():
        print("no claims.json yet — nothing to check", file=sys.stderr)
        return 1
    claims = json.loads(claims_p.read_text())
    if isinstance(claims, dict):
        claims = claims.get("claims", [])
    rows = {r["id"]: r for r in rlib.ledger(rid)}

    results = []
    for c in claims:
        if not a.all and not c.get("load_bearing"):
            continue
        # A claim can legitimately rest on TWO rows together — "A has 1.1 M members and
        # B has none" is supported by the pair, by neither alone. Checking row by row
        # would mark it unsupported and teach the author to split true claims into
        # halves. So the combined passage is checked first, and both verdicts print.
        cites = c.get("cites") or []
        if len(cites) > 1:
            joined = "\n\n---\n\n".join(
                (rows[i]["passage"] for i in cites
                 if i in rows and (rows[i].get("passage") or "").strip()))
            if joined.strip():
                v, raw = ask(joined, c.get("text", ""), a.model)
                results.append({"claim": c.get("id"), "row": "ALL", "verdict": v,
                                "raw": raw, "url": f"{len(cites)} rows together",
                                "source_type": "combined",
                                "author_confidence": c.get("confidence")})
        for cite in cites:
            row = rows.get(cite)
            if not row or not (row.get("passage") or "").strip():
                results.append({"claim": c.get("id"), "row": cite,
                                "verdict": None, "note": "no stored passage"})
                continue
            verdict, raw = ask(row["passage"], c.get("text", ""), a.model)
            results.append({"claim": c.get("id"), "row": cite, "verdict": verdict,
                            "raw": raw, "url": row.get("url"),
                            "source_type": row.get("source_type"),
                            "author_confidence": c.get("confidence")})

    out = {"run": rid, "model": a.model, "advisory": True,
           "note": "ADVISORY ONLY — never blocks the gate. A disagreement between this "
                   "checker and the author is itself a finding.",
           "results": results}
    (rlib.run_dir(rid) / "grounding.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2))

    if a.json:
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return 0

    print(f"=== GROUNDING (advisory, local, $0) · {a.model} · run {rid} ===")
    ok = bad = unk = 0
    for r in results:
        v = r.get("verdict")
        mark = {"SUPPORTED": "✓", "NOT-SUPPORTED": "✗"}.get(v, "?")
        if v == "SUPPORTED":
            ok += 1
        elif v == "NOT-SUPPORTED":
            bad += 1
        else:
            unk += 1
        print("  %s %-5s %-6s %-14s %s" % (
            mark, r["claim"], r["row"], r.get("source_type") or "-",
            (r.get("url") or r.get("note") or "")[:64]))
    print(f"\n  supported {ok} · not supported {bad} · undetermined {unk}")
    if bad:
        print("\n  A NOT-SUPPORTED line does not mean the claim is false. It means the page "
              "you pointed at does not say it — either cite a different row, or say plainly "
              "that this is your inference rather than the source's statement.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
