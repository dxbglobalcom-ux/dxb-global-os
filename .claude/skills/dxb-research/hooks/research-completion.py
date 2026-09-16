#!/usr/bin/env python3
"""Stop — the completion gate.

Measured on this machine, twice, on Claude Code 2.1.273: a Stop hook returning
{"decision":"block","reason":...} refuses the turn's end and hands the reason
back as the next instruction. A sub-session told to do nothing at all was
refused its exit and went and did the work. That is the mechanism; everything
else in this skill is bookkeeping for it.

Three rules this hook obeys, each of them a repair for a way the gate could go
wrong:

  1. NO OPEN RUN, NO GATE. If the CEO is not having research done, this hook
     passes silently. It must never turn ordinary conversation into a loop.
  2. ONE BLOCK ASKS FOR A BATCH. The harness ends the turn after 8 consecutive
     blocks, so a gate that asks for one query at a time exhausts itself and
     lets a bad answer through while believing it fired.
  3. PAST THE BUDGET IT STOPS ASKING FOR WORK AND STARTS ASKING FOR HONESTY.
     Stopping early is legal. Stopping early in silence is what is forbidden.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SKILL / "scripts"))


def out(obj: dict) -> int:
    print(json.dumps(obj, ensure_ascii=False))
    return 0


def main() -> int:
    # rlib re-execs this process into the research venv on import. That RESTARTS the
    # process, and a stdin already consumed does not survive it — measured 2026-09-16:
    # the payload came back empty, the hook lost the session id and fell back to the
    # machine-wide pointer. Import first, read stdin in whichever process survives.
    try:
        import rlib
        import gate
    except Exception:
        return out({})

    try:
        payload = json.load(sys.stdin)
    except Exception:
        payload = {}

    sid = payload.get("session_id")
    run_id = rlib.session_run_id(sid)
    if not run_id:
        run_id = rlib.current_run_id()
        # A run another session has claimed is that session's to finish; its own Stop
        # hook gates it. Blocking here refuses an exit this session cannot earn.
        owner = rlib.read_state(run_id).get("session_id") if run_id else None
        if owner and sid and owner != sid:
            return out({})
    if not run_id:
        return out({})

    res = gate.evaluate(run_id)
    if res["pass"]:
        rlib.patch_state(run_id, blocks=0)
        return out({})

    blocks = int(rlib.read_state(run_id).get("blocks", 0)) + 1
    rlib.patch_state(run_id, blocks=blocks)

    f = res["facts"]
    lines = [
        "RESEARCH COMPLETION GATE refuses this exit.",
        "",
        f"Run {run_id} · class {res['class']} · block {blocks}/{res['max_blocks']}.",
        f"CLOCK: {res['elapsed_s']}s spent · converge at {res['converge_at_s']}s · "
        f"hard stop at {res['hard_stop_at_s']}s · regime {res['regime'].upper()}.",
        f"Ledger right now: {f.get('evidence_rows', 0)} evidence rows · "
        f"{f.get('clusters', 0)} independent clusters · "
        f"{f.get('queries', 0)} queries · types {f.get('source_types', [])}.",
        "",
        "WHAT IS MISSING (machine-checked, not opinion):",
    ]
    lines += ["  ✗ " + x for x in res["hard_failures"]]
    if res["todo"]:
        lines += ["", "DO THIS BATCH, then finish — not one query, the whole batch:"]
        lines += ["  → " + t for t in dict.fromkeys(res["todo"])]
    lines += [
        "",
        "Record what you fetch as you go — the ledger writes itself from your tool calls, "
        "and a claim may only cite a row id that already exists in it.",
        f"Check yourself any time:  python3 '{SKILL}/scripts/gate.py'",
    ]
    if res["regime"] != "expand":
        lines += [
            "",
            "PAST THE CONVERGE POINT — stop widening. From here the gate no longer asks for "
            "work that adds scope, and a load-bearing claim you cannot finish testing has "
            "three legal endings, all of them honest:",
            "  · label it UNPROVEN and name its id in GAPS.md — the hole stays open, not silent",
            '  · withdraw it ("withdrawn": true in claims.json) and say so in GAPS.md',
            "  · drop load_bearing if the answer does not actually rest on it",
            "What the clock NEVER waives: a citation not in the ledger, a quote whose hash does "
            "not recompute, a dead URL, a vendor-only claim, a claim the adversary broke.",
        ]
    if blocks >= res["max_blocks"] - 1 or res["regime"] == "closing":
        lines += [
            "",
            "If the evidence genuinely is not there, that is a legitimate ending — write "
            f"runs/{run_id}/GAPS.md naming every channel not reached and every question left "
            "open, then answer him with what you DID measure and close the run: "
            f"scripts/research.py close",
        ]

    return out({"decision": "block", "reason": "\n".join(lines)})


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        print("{}")
        sys.exit(0)
