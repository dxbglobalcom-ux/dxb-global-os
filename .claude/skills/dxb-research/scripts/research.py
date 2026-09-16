#!/usr/bin/env python3
"""The driver. A research RUN is opened, worked, and closed.

Run scoping is not bookkeeping — it is a repair. A gate that reads "the ledger"
is satisfied by the PREVIOUS question's ledger, so the second question of a
session would sail through a green gate having done nothing. Every row carries a
run_id; the gate only ever looks at the OPEN run; closing the run makes the gate
silent again so ordinary conversation is never blocked.

  research.py open   --question "<his words, verbatim>" --class counting --subject "X vs Y"
  research.py status
  research.py denominator --measure "community members" --value 23766 --source L0007
  research.py contradict  --claim C1 --query "why we moved off X" --channel reddit --hits 4
  research.py report                 # switch to the report phase
  research.py close                  # refuses unless the gate passes
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rlib  # noqa: E402
import gate  # noqa: E402

CLASSES = ["counting", "decision", "capability", "factual", "academic",
           "market", "current", "troubleshooting", "due-diligence"]


def cmd_open(a: argparse.Namespace) -> int:
    prev = rlib.current_run_id()
    if prev and not a.force:
        print(f"run {prev} is still open — close it first (research.py close) "
              f"or pass --force to abandon it", file=sys.stderr)
        return 1
    if prev and a.force:
        rlib.patch_state(prev, status="abandoned")

    rid = rlib.new_run_id()
    d = rlib.run_dir(rid)
    d.mkdir(parents=True, exist_ok=True)
    lock = {
        "run_id": rid,
        "opened_at": rlib.now(),
        "question_verbatim": a.question,
        "restatement": a.restatement or a.question,
        "question_class": a.klass,
        "subject": a.subject,
        "must_not_mutate_into": a.must_not or [],
        "freshness": a.freshness,
        "locale": a.locale,
    }
    (d / "question_lock.json").write_text(json.dumps(lock, ensure_ascii=False, indent=2))
    rlib.write_state(rid, {
        "run_id": rid, "status": "open", "phase": "expedition", "blocks": 0,
        "question_class": a.klass, "subject": a.subject, "opened_at": rlib.now(),
    })
    rlib.CURRENT.parent.mkdir(parents=True, exist_ok=True)
    rlib.CURRENT.write_text(rid)
    print(rid)
    return 0


def cmd_status(a: argparse.Namespace) -> int:
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open research run")
        return 0
    res = gate.evaluate(rid)
    print(json.dumps(res, ensure_ascii=False, indent=2))
    return 0


def cmd_denominator(a: argparse.Namespace) -> int:
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run", file=sys.stderr)
        return 1
    rows = {r["id"] for r in rlib.ledger(rid)}
    if a.source not in rows:
        print(f"REFUSED: {a.source} is not a ledger row — a denominator needs a measured source",
              file=sys.stderr)
        return 2
    rlib.append_jsonl(rlib.run_dir(rid) / "denominators.jsonl", {
        "ts": rlib.now(), "measure": a.measure, "value": a.value,
        "of": a.of, "source": a.source,
    })
    print("ok")
    return 0


def cmd_contradict(a: argparse.Namespace) -> int:
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run", file=sys.stderr)
        return 1
    prev = rlib.read_jsonl(rlib.queries_path(rid))
    qid = "Q%03d" % (len(prev) + 1)
    rlib.append_jsonl(rlib.queries_path(rid), {
        "id": qid, "run_id": rid, "ts": rlib.now(), "query": a.query,
        "gap": f"contradiction of {a.claim}", "channel": a.channel,
        "hits": a.hits, "kind": "contradiction", "claim_id": a.claim,
        "found": a.found,
    })
    print(qid)
    return 0


def cmd_refute(a: argparse.Namespace) -> int:
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run", file=sys.stderr)
        return 1
    p = rlib.run_dir(rid) / "refutation.json"
    try:
        doc = json.loads(p.read_text())
    except Exception:
        doc = {"run_id": rid, "verdicts": []}
    doc.setdefault("verdicts", []).append({
        "ts": rlib.now(), "claim": a.claim, "verdict": a.verdict,
        "note": a.note, "evidence": a.evidence,
        "separate_context": bool(a.separate_context)})
    p.write_text(json.dumps(doc, ensure_ascii=False, indent=2))
    print(f"{a.claim}: {a.verdict}")
    return 0


def cmd_report(a: argparse.Namespace) -> int:
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run", file=sys.stderr)
        return 1
    rlib.patch_state(rid, phase="report")
    print("phase=report")
    return 0


def cmd_close(a: argparse.Namespace) -> int:
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run")
        return 0
    res = gate.evaluate(rid)
    if not res["pass"] and not a.force:
        print("REFUSED — the gate has not passed:", file=sys.stderr)
        for f in res["hard_failures"]:
            print("  ✗ " + f, file=sys.stderr)
        return 2
    rlib.patch_state(rid, status="closed", closed_at=rlib.now(),
                     closed_forced=bool(a.force), final_gate=res)
    try:
        rlib.CURRENT.unlink()
    except FileNotFoundError:
        pass
    print(f"closed {rid}")
    return 0


def main() -> int:
    p = argparse.ArgumentParser(prog="research.py")
    p.add_argument("--run")
    sub = p.add_subparsers(dest="cmd", required=True)

    o = sub.add_parser("open")
    o.add_argument("--question", required=True)
    o.add_argument("--restatement")
    o.add_argument("--class", dest="klass", choices=CLASSES, required=True)
    o.add_argument("--subject")
    o.add_argument("--must-not", dest="must_not", action="append")
    o.add_argument("--freshness")
    o.add_argument("--locale")
    o.add_argument("--force", action="store_true")
    o.set_defaults(fn=cmd_open)

    s = sub.add_parser("status"); s.set_defaults(fn=cmd_status)

    d = sub.add_parser("denominator")
    d.add_argument("--measure", required=True)
    d.add_argument("--value", required=True)
    d.add_argument("--of")
    d.add_argument("--source", required=True)
    d.set_defaults(fn=cmd_denominator)

    c = sub.add_parser("contradict")
    c.add_argument("--claim", required=True)
    c.add_argument("--query", required=True)
    c.add_argument("--channel")
    c.add_argument("--hits", type=int, default=0)
    c.add_argument("--found", default="")
    c.set_defaults(fn=cmd_contradict)

    rf = sub.add_parser("refute")
    rf.add_argument("--claim", required=True)
    rf.add_argument("--verdict", choices=["stands", "weakened", "broken"], required=True)
    rf.add_argument("--note", default="")
    rf.add_argument("--evidence", default="")
    rf.add_argument("--separate-context", action="store_true", default=True)
    rf.set_defaults(fn=cmd_refute)

    r = sub.add_parser("report"); r.set_defaults(fn=cmd_report)

    cl = sub.add_parser("close")
    cl.add_argument("--force", action="store_true")
    cl.set_defaults(fn=cmd_close)

    ns = p.parse_args()
    return ns.fn(ns)


if __name__ == "__main__":
    raise SystemExit(main())
