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
  * it never traps a run forever. Past the block budget it stops demanding work
    and starts demanding an honest exit: stopping early is legal, stopping early
    in SILENCE is what is forbidden.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rlib  # noqa: E402
import independence  # noqa: E402

PASS, BLOCK = 0, 2


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


def check_report(run_id: str, st: dict) -> tuple[list[str], list[str], dict]:
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
        if c.get("load_bearing") and cid not in contra_for:
            fails.append(f"H12 load-bearing claim {cid} had no contradiction search")
            todo.append(f"search the NEGATION of {cid} and log it: scripts/research.py contradict "
                        f"--claim {cid} --query '<the opposite>'")
        if c.get("load_bearing") and c.get("confidence") not in ("PROVEN", "LIKELY", "UNPROVEN"):
            fails.append(f"H15 load-bearing claim {cid} carries no PROVEN/LIKELY/UNPROVEN label")

    # H17 — C guarantees the expedition happened; D guarantees the answer survived
    # someone trying to break it. Neither alone is enough, and the failure of
    # 2026-09-16 was both holes at once: a four-call expedition, unchallenged.
    lb = [c for c in claims if c.get("load_bearing")]
    ref_p = rlib.run_dir(run_id) / "refutation.json"
    if lb:
        if not ref_p.exists():
            fails.append(f"H17 {len(lb)} load-bearing claim(s) and no adversary has tried to "
                         f"break them — a researcher auditing itself treats its own output as "
                         f"an established premise")
            todo.append("run agents/refuter.md in a SEPARATE context with the ledger and the "
                        "claims (never your reasoning), then record its verdict: "
                        "scripts/research.py refute --claim <id> --verdict stands|weakened|broken "
                        "--note '<what it found>'")
        else:
            try:
                ref = json.loads(ref_p.read_text())
                seen = {r.get("claim") for r in (ref.get("verdicts") or ref)}
            except Exception:
                seen = set()
            for c in lb:
                if c.get("id") not in seen:
                    fails.append(f"H17 load-bearing claim {c.get('id')} was never put to the "
                                 f"adversary")
            broken = [r for r in (json.loads(ref_p.read_text()).get("verdicts") or [])
                      if r.get("verdict") == "broken"]
            for b in broken:
                fails.append(f"H17 the adversary BROKE claim {b.get('claim')}: "
                             f"{(b.get('note') or '')[:90]} — it goes back to the ground, "
                             f"it does not go to the CEO")

    return fails, todo, {"claims": len(claims), "load_bearing": len(lb),
                         "adversary_ran": ref_p.exists()}


DECLARED = [
    "does the cited passage actually SUPPORT the claim, or merely sit near it",
    "is this source trustworthy for THIS question (a maintainer on their own bug is; a vendor on a rival is not)",
    "is the crowd's answer what the numbers look like, or what the loudest posts look like",
    "what single finding would FLIP this answer, and did I go looking for it",
    "what did I not look at, and why",
]


# ------------------------------------------------------------------ driver
def evaluate(run_id: str) -> dict:
    st = rlib.read_state(run_id)
    phase = st.get("phase", "expedition")
    rules = class_rules(st.get("question_class", "factual"))
    blocks = int(st.get("blocks", 0))
    max_blocks = int(rules.get("max_blocks", 6))

    fails, todo, facts = check_expedition(run_id, st)
    if phase == "report" or (rlib.run_dir(run_id) / "claims.json").exists():
        f2, t2, facts2 = check_report(run_id, st)
        fails += f2
        todo += t2
        facts.update(facts2)

    gaps_ok = False
    gp = rlib.run_dir(run_id) / "GAPS.md"
    if gp.exists() and gp.read_text().strip():
        gaps_ok = True

    over_budget = blocks >= max_blocks
    if over_budget:
        # stop demanding work; demand honesty instead
        hard_fails = [] if gaps_ok else [
            "BUDGET SPENT and there is no GAPS.md — stopping early is legal, "
            "stopping early in silence is not"]
        todo = ["write runs/%s/GAPS.md naming every channel not reached, every question left "
                "open, and every contradiction left standing" % run_id] if not gaps_ok else []
        fails = hard_fails

    return {
        "run": run_id, "phase": phase, "class": st.get("question_class"),
        "blocks": blocks, "max_blocks": max_blocks, "over_budget": over_budget,
        "hard_failures": fails, "todo": todo, "facts": facts, "declared": DECLARED,
        "pass": not fails,
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
        print(f"=== RESEARCH GATE · run {res['run']} · {res['class']} · {res['phase']} ===")
        for k, v in res["facts"].items():
            print(f"  {k:22s} {v}")
        if res["hard_failures"]:
            print("\nHARD failures (these block):")
            for f in res["hard_failures"]:
                print("  ✗ " + f)
            print("\nDo this next:")
            for t in dict.fromkeys(res["todo"]):
                print("  → " + t)
        else:
            print("\nHARD checks: all pass")
        print("\nDECLARED (judgment — recorded, never machine-scored):")
        for d in DECLARED:
            print("  · " + d)
    return PASS if res["pass"] else BLOCK


if __name__ == "__main__":
    raise SystemExit(main())
