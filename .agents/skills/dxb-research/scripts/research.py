#!/usr/bin/env python3
"""The driver. A research RUN is opened, worked, and closed.

Run scoping is not bookkeeping — it is a repair. A gate that reads "the ledger"
is satisfied by the PREVIOUS question's ledger, so the second question of a
session would sail through a green gate having done nothing. Every row carries a
run_id; the gate only ever looks at the OPEN run; closing the run makes the gate
silent again so ordinary conversation is never blocked.

  research.py open   --question "<his words, verbatim>" --class counting --subject "X vs Y"
  research.py open   ... --mode gated     # only when HE asked for the hard standard
  research.py escalate --why "his words, verbatim"
  research.py status
  research.py denominator --measure "community members" --value 23766 --source L0007
  research.py contradict  --claim C1 --query "why we moved off X" --channel reddit --hits 4
  research.py report                 # switch to the report phase
  research.py close                  # refuses unless the gate passes
"""
from __future__ import annotations

import argparse
import json
import os
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
    # exist_ok=False, on purpose: opening INTO an existing folder is how one question's record
    # came to carry another question. If the id is taken, that is a fault, not a detail.
    try:
        d.mkdir(parents=True, exist_ok=False)
    except FileExistsError:
        print(f"run {rid} already exists — refusing to open into it", file=sys.stderr)
        return 1
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
        # A run EXISTS only because he said "kaydet". His order, 2026-09-16:
        # "ciddi meselelerde sadece kayıt tutulsun diğer herşey sakın kayıt altına alma".
        # RECORD keeps the ledger and blocks nothing. GATED adds the hard standard — the
        # completion gate and the contradiction searches — and is entered on
        # his word alone. The rule that used to open it by itself for money, contracts and
        # outward steps is DELETED: he asked what researching a price had to do with money
        # leaving the house, and he was right — buying is a separate act that stops at him.
        "mode": a.mode,
        # Which session owns this run. The Stop gate uses it so that one session's
        # unfinished research cannot refuse another session's finished turn.
        "session_id": os.environ.get("CLAUDE_CODE_SESSION_ID"),
        # the fingerprint of every file that enforces this run — see rlib
        "enforcement_sha": rlib.enforcement_fingerprint(),
    })
    rlib.CURRENT.parent.mkdir(parents=True, exist_ok=True)
    rlib.CURRENT.write_text(rid)
    print(rid)
    # CURRENT is one pointer for the whole machine. rlib.current_run_id() already honours
    # DXB_RESEARCH_RUN so two sessions can research at once — but nothing told a session to
    # set it, and on 2026-09-16 two sessions on this machine wrote into each other's run:
    # 127 ledger rows crossed over, and one session's GAPS.md overwrote the other's.
    # Printing the handle here is the cheapest place to make the variable unmissable.
    print(f"pin this run to THIS session:  export DXB_RESEARCH_RUN={rid}", file=sys.stderr)
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


def cmd_probe(a: argparse.Namespace) -> int:
    """Record a LIVE MEASUREMENT as a first-class evidence row.

    Measured 2026-09-16 on runs 20260916-191822 and 20260916-205829: for a question whose only
    honest evidence is a measurement — *what status does this endpoint return* — the ledger had
    no door. The transcripts had to be written to disk and pushed back through the page-reading
    chain, which then stamped them `tool: scrapling`, `channel: page:tavily.com`,
    `source_type: vendor`. The measurement was in the ledger with a lie on its label: it was not
    a page anybody visited, it was a curl this machine ran. This writes what actually happened —
    `source_type: independent-test`, the tool that ran, the status observed, the repeat count.
    """
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run", file=sys.stderr)
        return 1
    transcript = a.transcript
    if a.transcript_file:
        transcript = Path(a.transcript_file).read_text(encoding="utf-8")
    if not transcript:
        print("REFUSED: a probe row with no transcript is a claim, not a measurement",
              file=sys.stderr)
        return 2
    rows = rlib.ledger(rid)
    rid_n = "L%04d" % (len(rows) + 1)
    row = {
        "id": rid_n, "run_id": rid, "kind": "evidence", "retrieved_at": rlib.now(),
        "tool": a.tool, "channel": "probe", "query_id": None, "gap": a.gap,
        "url": a.url, "url_canonical": rlib.canonical_url(a.url),
        "domain": rlib.registrable_domain(a.url), "title": a.what,
        "author": None, "pub_date": None, "updated_date": None, "dates_agree": False,
        "version": None, "passage": transcript[:12000],
        "passage_sha256": rlib.sha256(transcript[:12000]),
        "source_type": "independent-test", "primary": True, "cluster_id": None,
        "http_status": a.status, "liveness": "alive", "bytes": len(transcript),
        "notes": f"live probe · {a.repeats}x · run by {a.tool} on this machine",
    }
    rlib.append_jsonl(rlib.ledger_path(rid), row)
    try:
        import independence
        independence.recluster(rid)
    except Exception:
        pass
    print(rid_n)
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


def cmd_escalate(a: argparse.Namespace) -> int:
    """He asked, mid-run, for the hard standard.

    It does not start again: the ledger, the queries and the reading already done all
    stand. Only the standard changes, from here on.
    """
    rid = a.run or rlib.current_run_id()
    if not rid:
        print("no open run", file=sys.stderr)
        return 1
    rlib.patch_state(rid, mode="gated", escalated_at=rlib.now(), escalation_reason=a.why)
    print(f"{rid}: mode=gated — the gate blocks from here. Reason: {a.why}")
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
    o.add_argument("--mode", choices=["record", "gated"], default="record",
                   help="record (default): keep the ledger, block nothing. gated: the hard "
                        "standard — gate and contradiction searches. His word only.")
    o.set_defaults(fn=cmd_open)

    s = sub.add_parser("status"); s.set_defaults(fn=cmd_status)

    d = sub.add_parser("denominator")
    d.add_argument("--measure", required=True)
    d.add_argument("--value", required=True)
    d.add_argument("--of")
    d.add_argument("--source", required=True)
    d.set_defaults(fn=cmd_denominator)

    pb = sub.add_parser("probe")   # NOT `p` — that name is the top-level parser three lines up
    pb.add_argument("--url", required=True, help="what was probed")
    pb.add_argument("--what", required=True, help="one line: what this measurement shows")
    pb.add_argument("--status", type=int, help="the HTTP status observed, when there is one")
    pb.add_argument("--tool", default="curl")
    pb.add_argument("--repeats", type=int, default=1)
    pb.add_argument("--gap", default="a live measurement")
    pb.add_argument("--transcript", default="", help="the verbatim output")
    pb.add_argument("--transcript-file", help="…or the file holding it")
    pb.set_defaults(fn=cmd_probe)

    c = sub.add_parser("contradict")
    c.add_argument("--claim", required=True)
    c.add_argument("--query", required=True)
    c.add_argument("--channel")
    c.add_argument("--hits", type=int, default=0)
    c.add_argument("--found", default="")
    c.set_defaults(fn=cmd_contradict)

    es = sub.add_parser("escalate")
    es.add_argument("--why", required=True, help="his words, verbatim — nothing else opens it")
    es.set_defaults(fn=cmd_escalate)

    r = sub.add_parser("report"); r.set_defaults(fn=cmd_report)

    cl = sub.add_parser("close")
    cl.add_argument("--force", action="store_true")
    cl.set_defaults(fn=cmd_close)

    ns = p.parse_args()
    return ns.fn(ns)


if __name__ == "__main__":
    raise SystemExit(main())
