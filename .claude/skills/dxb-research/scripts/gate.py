#!/usr/bin/env python3
"""The completion gate.

It reads the LEDGER, not the prose. An agent cannot talk its way through it.

Two lists, and the split is printed in every report:

  HARD      machine-checkable. These BLOCK. exit 2 / {"decision":"block"}.
  DECLARED  judgment — does this passage support this claim, is this source
            trustworthy here. Recorded, printed, auditable, and NEVER scored by
            the machine. A machine that scored these would manufacture exactly
            the false assurance the gate exists to prevent.

Three things this gate deliberately does NOT do:
  * it never asks the model to fill an evidence field (that is how citations get
    fabricated). The ledger is written by the fetcher.
  * it never blocks a session that is not researching — no open run, no gate.
  * it never traps a run forever. Past the block budget — or past the clock — it
    stops demanding work and starts demanding an honest exit: stopping early is
    legal, stopping early in SILENCE is what is forbidden.

A run passes through three regimes, and the CLOCK moves it between them, never an
argument it makes about itself:

  expand    (< soft_seconds)  every check blocks, as written.
  converge  (< max_seconds)   the gate stops demanding work that ADDS scope. A
                              load-bearing claim with no contradiction search may
                              pass by being DECLARED instead: labelled UNPROVEN and
                              named in GAPS.md.
  closing   (>= max_seconds)  only the honest exit is left: GAPS.md, then out.

INTEGRITY never expires. A fabricated citation, a quote whose hash does not
recompute, a dead URL, a claim resting only on the vendor's own page, a gate
rewritten mid-run — none of these are waived by any budget.
Running out of time is not a licence to lie.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rlib  # noqa: E402
import independence  # noqa: E402

PASS, BLOCK = 0, 2

# Checks that a spent budget may NEVER waive. Everything else is effort — more
# queries, more clusters, another channel — and effort is what a budget is for.
# Measured 2026-09-16: the old budget escape replaced the whole failure list, so a
# run that ran out of blocks could have closed with a FABRICATED citation in it.
INTEGRITY = ("H1 ", "H9 ", "H10 ", "H11 ", "H13 ", "H14 ", "H18 ")


def is_integrity(msg: str) -> bool:
    return msg.startswith(INTEGRITY)


# ------------------------------------------------------------------ config
def class_rules(qclass: str) -> dict:
    cfg = rlib.config("budget.yaml")
    rules = dict(cfg.get("defaults") or {})
    rules.update((cfg.get("classes") or {}).get(qclass) or {})
    rt = rules.get("required_types")
    if isinstance(rt, str):
        rt = [t.strip() for t in rt.split(",") if t.strip()]
    rules["required_types"] = rt or []
    return rules


# ------------------------------------------------------------------ checks
def _types_present(rows: list[dict]) -> list[str]:
    return [r.get("source_type") for r in rows if r.get("source_type")]


def _saturated(run_id: str, rules: dict) -> tuple[bool, str]:
    queries = rlib.read_jsonl(rlib.queries_path(run_id))
    k = int(rules.get("saturation_k", 8))
    x = int(rules.get("saturation_x", 2))
    if len(queries) < k:
        return False, f"only {len(queries)} queries issued; saturation is measured over the last {k}"
    last = {q["id"] for q in queries[-k:]}
    rows = [r for r in rlib.ledger(run_id) if r.get("kind") == "evidence"]
    seen_before: set[str] = set()
    new_in_window = set()
    for r in rows:
        c = r.get("cluster_id")
        if not c:
            continue
        if r.get("query_id") in last:
            if c not in seen_before:
                new_in_window.add(c)
        else:
            seen_before.add(c)
    new_in_window -= seen_before
    if len(new_in_window) < x:
        return True, f"last {k} queries produced {len(new_in_window)} new clusters (< {x})"
    return False, f"last {k} queries still producing {len(new_in_window)} new clusters (>= {x})"


def check_expedition(run_id: str, st: dict) -> tuple[list[str], list[str], dict]:
    """Returns (failures, todo-commands, facts)."""
    rules = class_rules(st.get("question_class", "factual"))
    rows = rlib.ledger(run_id)
    # a walled page is recorded but never counted — see rlib.looks_like_wall
    ev = [r for r in rows if r.get("kind") == "evidence" and not r.get("wall")]
    ind = independence.report(run_id)
    clusters = ind["clusters"]
    fails: list[str] = []
    todo: list[str] = []

    lock = rlib.run_dir(run_id) / "question_lock.json"
    if not lock.exists():
        fails.append("H1 question_lock.json is missing — the question was never locked")
        todo.append("scripts/research.py open --question '<his words, verbatim>' --class <class>")

    need_rows = int(rules.get("min_evidence_rows", 6))
    if len(ev) < need_rows:
        fails.append(f"H4 evidence rows {len(ev)} < {need_rows} "
                     f"(a search result is a HEADLINE; an evidence row needs a FETCHED body)")

    need_cl = int(rules.get("min_clusters", 5))
    if clusters < need_cl:
        fails.append(f"H3 independent clusters {clusters} < {need_cl} "
                     f"({ind['echo_collapsed']} rows collapsed as echoes of each other)")

    present = _types_present(ev)
    for group in dict.fromkeys(str(g) for g in rules.get("required_types", [])):
        alts = [t.strip() for t in group.split("|")]
        have = sum(1 for t in present if t in alts)
        needed = sum(1 for g in rules["required_types"] if str(g) == group)
        if have < needed:
            fails.append(f"H2 required evidence type '{group}' present {have}x, needs {needed}x")
            if "first-hand" in alts:
                todo.append("open the human channels and record a PERSON's own words: "
                            "reddit · twitter · hackernews · stackoverflow · youtube (and the CN "
                            "channels when the subject has a Chinese community)")
            elif "primary-doc" in alts or "code" in alts:
                todo.append("fetch the official doc / the source code / the release notes / "
                            "the issue tracker, and record the passage")
            else:
                todo.append(f"record a row of type {group}")

    nfh = sum(1 for t in present if t == "first-hand")
    need_fh = int(rules.get("min_first_hand", 0))
    if nfh < need_fh:
        fails.append(f"H6 first-hand rows {nfh} < {need_fh}")

    share = ind["max_channel_share"]
    cap = float(rules.get("max_channel_share", 0.5))
    if clusters >= 4 and share > cap:
        top = next(iter(ind["cluster_share_by_channel"]), "?")
        fails.append(f"H5 channel '{top}' supplies {share:.0%} of clusters (> {cap:.0%}) — "
                     f"one door is not research")
        todo.append("spread across the other doors: parallel · tavily · firecrawl · youcom · "
                    "google · WebSearch · opencli adapters")

    if rules.get("requires_denominator"):
        dens = rlib.read_jsonl(rlib.run_dir(run_id) / "denominators.jsonl")
        if not dens:
            fails.append("H7 this is a COUNTING question and no denominator was measured — "
                         "three angry posts prove three people are angry")
            todo.append("scripts/research.py denominator --measure 'community members' "
                        "--value <N> --source <ledger id>")

    # H18 — THE GATE WATCHES ITSELF. A run whose enforcement files changed under it
    # is not a gated run any more, whatever the rest of the checks say.
    drift = rlib.enforcement_drift(run_id)
    if drift:
        fails.append("H18 the enforcement surface CHANGED while this run was open — "
                     + " · ".join(drift) + ". A gate that can be rewritten mid-run is "
                     "not a gate. Close this run, then change the engine, then open a "
                     "new run.")
        todo.append("close or abandon this run before editing the engine: "
                    "scripts/research.py close --force  (then re-open)")

    # H16 — a page that defeated EVERY door in the reading chain is a real hole. It may
    # stay unread; it may not stay unmentioned. This is the "silent hole" rule with teeth.
    shut = [t for t in rlib.read_jsonl(rlib.tools_path(run_id))
            if t.get("state") == "failed" and "every door failed" in (t.get("detail") or "")]
    gaps_f = rlib.run_dir(run_id) / "GAPS.md"
    if shut and not (gaps_f.exists() and gaps_f.read_text().strip()):
        fails.append(f"H16 {len(shut)} page(s) defeated every door in the reading chain and "
                     f"no GAPS.md names them — a hole may stay open, never silent")
        todo.append(f"write runs/{run_id}/GAPS.md listing the pages that stayed shut "
                    f"(scripts/coverage.py prints them with the doors that were tried)")

    sat, why = _saturated(run_id, rules)
    if not sat:
        fails.append(f"H8 not saturated — {why}")

    dead = [r["id"] for r in rows if r.get("liveness") == "dead"]
    facts = {
        "evidence_rows": len(ev), "discovery_rows": len(rows) - len(ev),
        "clusters": clusters, "echo_collapsed": ind["echo_collapsed"],
        "max_channel_share": share, "source_types": sorted(set(present)),
        "first_hand": nfh, "queries": len(rlib.read_jsonl(rlib.queries_path(run_id))),
        "saturation": why, "dead_urls": dead,
    }
    return fails, todo, facts


def _gaps_text(run_id: str) -> str:
    gp = rlib.run_dir(run_id) / "GAPS.md"
    try:
        return gp.read_text()
    except Exception:
        return ""


def _declared(c: dict, gaps: str) -> bool:
    """Is this claim's hole OPEN but NOT SILENT?

    The only escape from an untested load-bearing claim, and it is earned by the
    CLOCK, never by an argument: the claim must be labelled UNPROVEN and named, by
    id, in GAPS.md. The CEO then reads an answer that says which leg of it was
    never tested against its opposite — which is the whole point of the gate.
    """
    cid = str(c.get("id") or "")
    # word boundary, or "C1" would be satisfied by a GAPS.md that only mentions C10
    return bool(cid) and c.get("confidence") == "UNPROVEN" and bool(
        re.search(r"\b" + re.escape(cid) + r"\b", gaps))


def check_report(run_id: str, st: dict,
                 regime: str = "expand") -> tuple[list[str], list[str], dict]:
    claims_p = rlib.run_dir(run_id) / "claims.json"
    fails: list[str] = []
    todo: list[str] = []
    if not claims_p.exists():
        return ["H9 claims.json is missing — nothing to check the report against"], [
            "write runs/<id>/claims.json: [{id, text, cites:[L...], type, confidence}]"], {}
    try:
        claims = json.loads(claims_p.read_text())
    except Exception as e:
        return [f"H9 claims.json is not valid JSON: {e}"], [], {}
    if isinstance(claims, dict):
        claims = claims.get("claims", [])

    rows = {r["id"]: r for r in rlib.ledger(run_id)}
    queries = rlib.read_jsonl(rlib.queries_path(run_id))
    contra_for = {q.get("claim_id") for q in queries if q.get("kind") == "contradiction"}
    gaps = _gaps_text(run_id)
    may_declare = regime in ("converge", "closing")

    # A WITHDRAWN claim is not in the answer, so it is not gated — but a claim that
    # was pulled is a hole, and a hole may never be silent. Pull it, and say in
    # GAPS.md that you pulled it.
    withdrawn = [c for c in claims if c.get("withdrawn")]
    claims = [c for c in claims if not c.get("withdrawn")]
    for c in withdrawn:
        cid = str(c.get("id") or "?")
        if not re.search(r"\b" + re.escape(cid) + r"\b", gaps):
            fails.append(f"H19 claim {cid} was WITHDRAWN and GAPS.md does not name it — "
                         f"a pulled claim is a hole, and a hole may stay open but never silent")
            todo.append(f"name {cid} in runs/{run_id}/GAPS.md: what it claimed, and why it was pulled")

    for c in claims:
        cid = c.get("id", "?")
        cites = c.get("cites") or []
        if not cites:
            fails.append(f"H9 claim {cid} cites nothing")
            continue
        for rid_ in cites:
            r = rows.get(rid_)
            if not r:
                fails.append(f"H9 claim {cid} cites {rid_}, which is NOT in the ledger "
                             f"(a fabricated citation)")
                continue
            if r.get("passage") and r.get("passage_sha256") != rlib.sha256(r["passage"]):
                fails.append(f"H10 row {rid_} passage hash does not recompute — the quote changed")
            if r.get("liveness") == "dead" and not r.get("evidence_of_absence"):
                # A 404 is sometimes the finding itself ("there is no such community").
                # That is legitimate, and it has to be DECLARED on the row rather than
                # inferred by the gate — otherwise every dead link becomes an excuse.
                fails.append(f"H11 claim {cid} cites {rid_}, whose URL is DEAD")
                todo.append(f"either drop {rid_} from {cid}, or — if the page's "
                            f"NON-existence is the finding — re-record it with "
                            f"ledger.py add --evidence-of-absence")
        cited = [rows[i] for i in cites if i in rows]
        if cited and all(r.get("kind") == "discovery" for r in cited):
            fails.append(f"H13 claim {cid} rests only on search HEADLINES — no page was read")
        if (cited and all(r.get("source_type") == "vendor" for r in cited)
                and not c.get("about_the_source")):
            # A claim ABOUT a vendor page ("this is marketing, it cannot carry the
            # verdict") legitimately rests on that page. Declared, not assumed.
            fails.append(f"H14 claim {cid} rests only on the vendor's own pages")
            todo.append(f"either add an independent source to {cid}, or mark it "
                        f'"about_the_source": true if the claim is ABOUT that page')
        if c.get("load_bearing") and cid not in contra_for and not (
                may_declare and _declared(c, gaps)):
            fails.append(f"H12 load-bearing claim {cid} had no contradiction search"
                         + ("" if not may_declare else
                            " — past the converge point you may instead label it UNPROVEN "
                            "and name it in GAPS.md"))
            todo.append(f"search the NEGATION of {cid} and log it: scripts/research.py contradict "
                        f"--claim {cid} --query '<the opposite>'")
        if c.get("load_bearing") and c.get("confidence") not in ("PROVEN", "LIKELY", "UNPROVEN"):
            fails.append(f"H15 load-bearing claim {cid} carries no PROVEN/LIKELY/UNPROVEN label")

    lb = [c for c in claims if c.get("load_bearing")]
    return fails, todo, {"claims": len(claims), "load_bearing": len(lb),
                         "withdrawn": len(withdrawn)}


DECLARED = [
    "does the cited passage actually SUPPORT the claim, or merely sit near it",
    "is this source trustworthy for THIS question (a maintainer on their own bug is; a vendor on a rival is not)",
    "is the crowd's answer what the numbers look like, or what the loudest posts look like",
    "what single finding would FLIP this answer, and did I go looking for it",
    "what did I not look at, and why",
]


# ------------------------------------------------------------------ driver
def _float_env(name: str, fallback) -> float:
    try:
        return float(os.environ.get(name) or fallback)
    except Exception:
        return float(fallback)


def evaluate(run_id: str) -> dict:
    st = rlib.read_state(run_id)
    phase = st.get("phase", "expedition")
    rules = class_rules(st.get("question_class", "factual"))
    blocks = int(st.get("blocks", 0))
    max_blocks = int(rules.get("max_blocks", 6))

    # THE CLOCK. Not a suggestion to the model — a term in the gate itself.
    elapsed = rlib.elapsed_seconds(run_id)
    soft = _float_env("DXB_RESEARCH_SOFT_SECONDS", rules.get("soft_seconds", 600))
    hard = _float_env("DXB_RESEARCH_MAX_SECONDS", rules.get("max_seconds", 1080))
    if hard < soft:
        hard = soft
    regime = "expand" if elapsed < soft else ("converge" if elapsed < hard else "closing")

    fails, todo, facts = check_expedition(run_id, st)
    if phase == "report" or (rlib.run_dir(run_id) / "claims.json").exists():
        f2, t2, facts2 = check_report(run_id, st, regime)
        fails += f2
        todo += t2
        facts.update(facts2)

    facts.update({"elapsed_s": int(elapsed), "converge_at_s": int(soft),
                  "hard_stop_at_s": int(hard), "regime": regime})

    gaps_ok = False
    gp = rlib.run_dir(run_id) / "GAPS.md"
    if gp.exists() and gp.read_text().strip():
        gaps_ok = True

    over_budget = blocks >= max_blocks or regime == "closing"
    if over_budget:
        # Stop demanding work; demand honesty instead — but INTEGRITY is not work and
        # is never waived. Before 2026-09-16 this line dropped the whole failure list,
        # fabricated citations included.
        kept = [f for f in fails if is_integrity(f)]
        if not gaps_ok:
            kept.append("BUDGET SPENT and there is no GAPS.md — stopping early is legal, "
                        "stopping early in silence is not")
            todo = ["write runs/%s/GAPS.md naming every channel not reached, every question "
                    "left open, and every contradiction left standing" % run_id] + todo
        fails = kept
        if not kept:
            todo = []

    # RECORD vs GATED — the CEO's order of 2026-09-16. Most questions open no run at all,
    # so this gate never runs for them. When he DID say "kaydet", the run is RECORD: the
    # ledger is kept, the same checks are computed and printed, and NONE of them blocks.
    # GATED is his word on top of that, and only then does a check shut a door.
    # ("light" is the older name for RECORD and is still honoured, for runs already on disk.)
    mode = st.get("mode") or "gated"
    advisory: list[str] = []
    if mode in ("record", "light") and fails:
        advisory, fails = fails, []

    return {
        "run": run_id, "phase": phase, "class": st.get("question_class"), "mode": mode,
        "blocks": blocks, "max_blocks": max_blocks, "over_budget": over_budget,
        "regime": regime, "elapsed_s": int(elapsed), "converge_at_s": int(soft),
        "hard_stop_at_s": int(hard),
        "hard_failures": fails, "advisory": advisory, "todo": todo, "facts": facts,
        "declared": DECLARED, "pass": not fails,
    }


def main() -> int:
    p = argparse.ArgumentParser(prog="gate.py")
    p.add_argument("--run")
    p.add_argument("--json", action="store_true")
    p.add_argument("--quiet", action="store_true")
    a = p.parse_args()

    rid = a.run or rlib.current_run_id()
    if not rid:
        if a.json:
            print(json.dumps({"pass": True, "note": "no open research run — gate silent"}))
        elif not a.quiet:
            print("no open research run — the gate is silent")
        return PASS

    res = evaluate(rid)
    if a.json:
        print(json.dumps(res, ensure_ascii=False, indent=2))
    elif not a.quiet:
        print(f"=== RESEARCH GATE · run {res['run']} · {res['class']} · {res['phase']} · "
              f"{res['mode'].upper()} · {res['regime'].upper()} "
              f"{res['elapsed_s']}s/{res['hard_stop_at_s']}s ===")
        for k, v in res["facts"].items():
            print(f"  {k:22s} {v}")
        if res.get("advisory"):
            print("\nADVISORY (record mode — these do NOT block; they are what a GATED run "
                  "would have demanded):")
            for f in res["advisory"]:
                print("  · " + f)
            if res["todo"]:
                print("\nWorth doing anyway:")
                for t in dict.fromkeys(res["todo"]):
                    print("  → " + t)
        if res["hard_failures"]:
            print("\nHARD failures (these block):")
            for f in res["hard_failures"]:
                print("  ✗ " + f)
            print("\nDo this next:")
            for t in dict.fromkeys(res["todo"]):
                print("  → " + t)
        elif res.get("advisory"):
            print("\nNothing BLOCKS — this run only keeps a RECORD. The list above is "
                  "advice; the answer still has to be true.")
        else:
            print("\nHARD checks: all pass")
        print("\nDECLARED (judgment — recorded, never machine-scored):")
        for d in DECLARED:
            print("  · " + d)
    return PASS if res["pass"] else BLOCK


if __name__ == "__main__":
    raise SystemExit(main())
